import { NextResponse } from 'next/server';
import { query, isPostgresActive } from '@/lib/db';
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

        // Get LINE credentials from social_configs
        let channelSecret = process.env.LINE_CHANNEL_SECRET;
        let channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

        if (isPostgresActive()) {
            try {
                const configResult = await query("SELECT config FROM social_configs WHERE platform = 'line'");
                if (configResult.rows.length > 0) {
                    const config = configResult.rows[0].config;
                    channelSecret = config.channelSecret || channelSecret;
                    channelAccessToken = config.accessToken || channelAccessToken;
                }
            } catch (e) { /* use env fallback */ }
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
                        const countResult = await query('SELECT COUNT(*) as c FROM chat_sessions');
                        const count = parseInt(countResult.rows[0].c) + 1;
                        sessionId = `CHAT-${String(count).padStart(3, '0')}`;

                        await query(
                            `INSERT INTO chat_sessions (id, platform, platform_user_id, customer_name, account, channel, status, unread, last_message, last_time)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                            [sessionId, 'line', userId, customerName, customerName, 'line', 'active', 1, messageText, timeStr]
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
                        const countResult = await query('SELECT COUNT(*) as c FROM chat_sessions');
                        const count = parseInt(countResult.rows[0].c) + 1;
                        const sessionId = `CHAT-${String(count).padStart(3, '0')}`;
                        await query(
                            `INSERT INTO chat_sessions (id, platform, platform_user_id, customer_name, account, channel, status, unread, last_message, last_time)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                            [sessionId, 'line', userId, customerName, customerName, 'line', 'active', 0, 'เริ่มติดตาม', new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })]
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
