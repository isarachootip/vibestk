import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';
import crypto from 'crypto';

// GET: Facebook Webhook Verification
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Get verify token from social_configs or env
    let verifyToken = process.env.FB_VERIFY_TOKEN || 'stk_fb_verify_2026';

    if (isPostgresActive()) {
        try {
            const configResult = await query("SELECT config FROM social_configs WHERE platform = 'facebook'");
            for (const row of configResult.rows) {
                const config = row.config;
                if (config.verifyToken === token) {
                    verifyToken = token;
                    break;
                }
            }
        } catch (e) { /* use env fallback */ }
    } else {
        // In-memory fallback
        for (const c of IN_MEMORY_DB.social_configs) {
            if (c.platform === 'facebook' && c.config.verifyToken === token) {
                verifyToken = token;
                break;
            }
        }
    }

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('Facebook Webhook verified!');
        return new Response(challenge, { status: 200 });
    }
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// POST: Receive webhook events from Facebook Messenger
export async function POST(request) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-hub-signature-256');

        // Get Facebook credentials from social_configs
        let appSecret = process.env.FB_APP_SECRET;

        if (isPostgresActive()) {
            try {
                const configResult = await query("SELECT config FROM social_configs WHERE platform = 'facebook' LIMIT 1");
                if (configResult.rows.length > 0) {
                    const config = configResult.rows[0].config;
                    appSecret = config.appSecret || appSecret;
                }
            } catch (e) { /* use env fallback */ }
        } else {
            const match = IN_MEMORY_DB.social_configs.find(c => c.platform === 'facebook');
            if (match) {
                appSecret = match.config.appSecret || appSecret;
            }
        }

        // Validate signature
        if (appSecret && signature) {
            const expectedSig = 'sha256=' + crypto
                .createHmac('sha256', appSecret)
                .update(body)
                .digest('hex');
            if (signature !== expectedSig) {
                console.warn('Facebook webhook: Invalid signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const data = JSON.parse(body);

        if (data.object === 'page') {
            for (const entry of (data.entry || [])) {
                const pageId = entry.id; // Specific Page ID receiving the message
                
                // Get Page Access Token for this pageId
                let pageAccessToken = process.env.FB_PAGE_ACCESS_TOKEN;
                if (isPostgresActive()) {
                    try {
                        const configResult = await query("SELECT config FROM social_configs WHERE channel_id = $1 AND platform = 'facebook'", [pageId]);
                        if (configResult.rows.length > 0) {
                            pageAccessToken = configResult.rows[0].config.accessToken || pageAccessToken;
                        }
                    } catch (e) { /* use env fallback */ }
                } else {
                    const match = IN_MEMORY_DB.social_configs.find(c => c.channel_id === pageId && c.platform === 'facebook');
                    if (match) {
                        pageAccessToken = match.config.accessToken || pageAccessToken;
                    }
                }

                for (const event of (entry.messaging || [])) {
                    // Handle incoming message
                    if (event.message && !event.message.is_echo) {
                        const senderId = event.sender.id;
                        const messageText = event.message.text || '[Attachment]';
                        const messageId = event.message.mid;
                        const timestamp = new Date(event.timestamp);
                        const timeStr = timestamp.toLocaleString('en-GB', {
                            day: '2-digit', month: 'short', year: '2-digit',
                            hour: '2-digit', minute: '2-digit'
                        });

                        // Get user profile from Facebook Graph API
                        let customerName = 'Facebook User';
                        if (pageAccessToken) {
                            try {
                                const profileRes = await fetch(
                                    `https://graph.facebook.com/v18.0/${senderId}?fields=first_name,last_name,profile_pic&access_token=${pageAccessToken}`
                                );
                                if (profileRes.ok) {
                                    const profile = await profileRes.json();
                                    customerName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Facebook User';
                                }
                            } catch (e) { /* use default name */ }
                        }

                        if (isPostgresActive()) {
                            // Check existing session
                            const existing = await query(
                                'SELECT id FROM chat_sessions WHERE platform_user_id = $1 AND platform = $2 AND status != $3',
                                [senderId, 'facebook', 'closed']
                            );

                            let sessionId;
                            if (existing.rows.length > 0) {
                                sessionId = existing.rows[0].id;
                                await query(
                                    'UPDATE chat_sessions SET last_message = $1, last_time = $2, unread = unread + 1, updated_at = NOW() WHERE id = $3',
                                    [messageText, timeStr, sessionId]
                                );
                            } else {
                                 const d = new Date();
                                 const yy = String(d.getFullYear()).slice(-2);
                                 const mm = String(d.getMonth() + 1).padStart(2, '0');
                                 const dd = String(d.getDate()).padStart(2, '0');
                                 const dateStr = `${yy}${mm}${dd}`;
                                 const pattern = `ct${dateStr}%`;
                                 const seqResult = await query('SELECT id FROM chat_sessions WHERE id LIKE $1', [pattern]);
                                 let maxRunning = 0;
                                 seqResult.rows.forEach(r => {
                                     const suffix = r.id.substring(8); // 'ct' (2) + 'yymmdd' (6) = 8
                                     const num = parseInt(suffix, 10);
                                     if (!isNaN(num) && num > maxRunning) {
                                         maxRunning = num;
                                     }
                                 });
                                 const nextRunning = String(maxRunning + 1).padStart(2, '0');
                                 sessionId = `ct${dateStr}${nextRunning}`;

                                 await query(
                                     `INSERT INTO chat_sessions (id, platform, platform_user_id, customer_name, account, channel, status, unread, last_message, last_time, channel_id)
                                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                                     [sessionId, 'facebook', senderId, customerName, customerName, 'facebook', 'active', 1, messageText, timeStr, pageId]
                                 );
                            }

                            // Insert message
                            await query(
                                `INSERT INTO chat_session_messages (session_id, sender, text, message_type, platform_message_id, time)
                                 VALUES ($1, $2, $3, $4, $5, $6)`,
                                [sessionId, 'customer', messageText, 'text', messageId, timeStr]
                            );
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Facebook Webhook Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
