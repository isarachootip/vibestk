import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';
import crypto from 'crypto';

// GET: Health check / webhook verify
export async function GET() {
    return NextResponse.json({ status: 'ok', platform: 'line' });
}

// POST: Receive webhook events from LINE Messaging API
export async function POST(request) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-line-signature');
        
        const { searchParams } = new URL(request.url);
        const urlChannelId = searchParams.get('id');

        // Get LINE credentials from social_configs
        let channelSecret = process.env.LINE_CHANNEL_SECRET;
        let channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
        let channelId = urlChannelId || process.env.LINE_CHANNEL_ID || '1654321987';

        if (isPostgresActive()) {
            try {
                let configResult;
                if (urlChannelId) {
                    configResult = await query("SELECT config FROM social_configs WHERE channel_id = $1 AND platform = 'line'", [urlChannelId]);
                } else {
                    // Fallback to first line config if no id specified in query param
                    configResult = await query("SELECT channel_id, config FROM social_configs WHERE platform = 'line' LIMIT 1");
                }
                
                if (configResult && configResult.rows.length > 0) {
                    const row = configResult.rows[0];
                    const config = row.config;
                    channelSecret = config.channelSecret || channelSecret;
                    channelAccessToken = config.accessToken || channelAccessToken;
                    channelId = urlChannelId || row.channel_id || config.channelId || channelId;
                }
            } catch (e) { /* use env fallback */ }
        } else {
            // In-memory fallback
            const match = IN_MEMORY_DB.social_configs.find(c => c.platform === 'line' && (urlChannelId ? c.channel_id === urlChannelId : true));
            if (match) {
                channelSecret = match.config.channelSecret || channelSecret;
                channelAccessToken = match.config.accessToken || channelAccessToken;
                channelId = match.channel_id || channelId;
            }
        }

        // Validate signature (skip if no secret configured yet)
        if (channelSecret && signature) {
            const hash = crypto.createHmac('SHA256', channelSecret)
                .update(body)
                .digest('base64');
            if (hash !== signature) {
                console.warn('LINE webhook: Invalid signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const data = JSON.parse(body);
        const events = data.events || [];

        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const userId = event.source.userId;
                const messageText = event.message.text;
                const messageId = event.message.id;
                const timestamp = new Date(event.timestamp);
                const timeStr = timestamp.toLocaleString('en-GB', {
                    day: '2-digit', month: 'short', year: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                });

                // Get user profile from LINE
                let customerName = 'LINE User';
                if (channelAccessToken) {
                    try {
                        const profileRes = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
                            headers: { 'Authorization': `Bearer ${channelAccessToken}` }
                        });
                        if (profileRes.ok) {
                            const profile = await profileRes.json();
                            customerName = profile.displayName || 'LINE User';
                        }
                    } catch (e) { /* use default name */ }
                }

                if (isPostgresActive()) {
                    // Check if session exists for this user
                    const existing = await query(
                        'SELECT id FROM chat_sessions WHERE platform_user_id = $1 AND platform = $2 AND status != $3',
                        [userId, 'line', 'closed']
                    );

                    let sessionId;
                    if (existing.rows.length > 0) {
                        sessionId = existing.rows[0].id;
                        // Update existing session
                        await query(
                            'UPDATE chat_sessions SET last_message = $1, last_time = $2, unread = unread + 1, updated_at = NOW() WHERE id = $3',
                            [messageText, timeStr, sessionId]
                        );
                    } else {
                        // Create new session
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
                            [sessionId, 'line', userId, customerName, customerName, 'line', 'active', 1, messageText, timeStr, channelId]
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

            // Handle follow event
            if (event.type === 'follow') {
                const userId = event.source.userId;
                let customerName = 'LINE User';
                if (channelAccessToken) {
                    try {
                        const profileRes = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
                            headers: { 'Authorization': `Bearer ${channelAccessToken}` }
                        });
                        if (profileRes.ok) {
                            const profile = await profileRes.json();
                            customerName = profile.displayName || 'LINE User';
                        }
                    } catch (e) { /* use default */ }
                }

                if (isPostgresActive()) {
                    const existing = await query(
                        'SELECT id FROM chat_sessions WHERE platform_user_id = $1 AND platform = $2',
                        [userId, 'line']
                    );
                    if (existing.rows.length === 0) {
                        const d = new Date();
                        const yy = String(d.getFullYear()).slice(-2);
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        const dateStr = `${yy}${mm}${dd}`;
                        const pattern = `ct${dateStr}%`;
                        const seqResult = await query('SELECT id FROM chat_sessions WHERE id LIKE $1', [pattern]);
                        let maxRunning = 0;
                        seqResult.rows.forEach(r => {
                            const suffix = r.id.substring(8);
                            const num = parseInt(suffix, 10);
                            if (!isNaN(num) && num > maxRunning) {
                                maxRunning = num;
                            }
                        });
                        const nextRunning = String(maxRunning + 1).padStart(2, '0');
                        const sessionId = `ct${dateStr}${nextRunning}`;
                        await query(
                            `INSERT INTO chat_sessions (id, platform, platform_user_id, customer_name, account, channel, status, unread, last_message, last_time, channel_id)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                            [sessionId, 'line', userId, customerName, customerName, 'line', 'active', 0, 'เริ่มติดตาม', new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }), channelId]
                        );
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('LINE Webhook Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
