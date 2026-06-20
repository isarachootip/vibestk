import { NextResponse } from 'next/server';
import { query, isPostgresActive } from '@/lib/db';
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
            if (configResult.rows.length > 0) {
                const config = configResult.rows[0].config;
                verifyToken = config.verifyToken || verifyToken;
            }
        } catch (e) { /* use env fallback */ }
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
        let pageAccessToken = process.env.FB_PAGE_ACCESS_TOKEN;

        if (isPostgresActive()) {
            try {
                const configResult = await query("SELECT config FROM social_configs WHERE platform = 'facebook'");
                if (configResult.rows.length > 0) {
                    const config = configResult.rows[0].config;
                    appSecret = config.appSecret || appSecret;
                    pageAccessToken = config.accessToken || pageAccessToken;
                }
            } catch (e) { /* use env fallback */ }
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
                                const countResult = await query('SELECT COUNT(*) as c FROM chat_sessions');
                                const count = parseInt(countResult.rows[0].c) + 1;
                                sessionId = `CHAT-${String(count).padStart(3, '0')}`;

                                await query(
                                    `INSERT INTO chat_sessions (id, platform, platform_user_id, customer_name, account, channel, status, unread, last_message, last_time)
                                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                                    [sessionId, 'facebook', senderId, customerName, customerName, 'facebook', 'active', 1, messageText, timeStr]
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
