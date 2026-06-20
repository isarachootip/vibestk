import { NextResponse } from 'next/server';
import { query, isPostgresActive } from '@/lib/db';

// POST: Reply to customer via LINE or Facebook
export async function POST(request) {
    try {
        const { session_id, text } = await request.json();

        if (!session_id || !text) {
            return NextResponse.json({ error: 'session_id and text are required' }, { status: 400 });
        }

        if (!isPostgresActive()) {
            return NextResponse.json({ error: 'Database not available' }, { status: 503 });
        }

        // Get session info
        const sessionResult = await query('SELECT * FROM chat_sessions WHERE id = $1', [session_id]);
        if (sessionResult.rows.length === 0) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const session = sessionResult.rows[0];
        const platform = session.platform;
        const platformUserId = session.platform_user_id;
        const timeStr = new Date().toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        let sent = false;

        if (platform === 'line') {
            // Get LINE credentials
            let accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
            try {
                const configResult = await query("SELECT config FROM social_configs WHERE platform = 'line'");
                if (configResult.rows.length > 0) {
                    accessToken = configResult.rows[0].config.accessToken || accessToken;
                }
            } catch (e) { /* use env fallback */ }

            if (accessToken) {
                const res = await fetch('https://api.line.me/v2/bot/message/push', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        to: platformUserId,
                        messages: [{ type: 'text', text: text }]
                    })
                });
                sent = res.ok;
                if (!res.ok) {
                    const errBody = await res.text();
                    console.error('LINE Push Error:', errBody);
                }
            }
        } else if (platform === 'facebook') {
            // Get Facebook credentials
            let pageAccessToken = process.env.FB_PAGE_ACCESS_TOKEN;
            try {
                const configResult = await query("SELECT config FROM social_configs WHERE platform = 'facebook'");
                if (configResult.rows.length > 0) {
                    pageAccessToken = configResult.rows[0].config.accessToken || pageAccessToken;
                }
            } catch (e) { /* use env fallback */ }

            if (pageAccessToken) {
                const res = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        recipient: { id: platformUserId },
                        message: { text: text }
                    })
                });
                sent = res.ok;
                if (!res.ok) {
                    const errBody = await res.text();
                    console.error('Facebook Send Error:', errBody);
                }
            }
        }

        // Save agent message to DB regardless
        await query(
            `INSERT INTO chat_session_messages (session_id, sender, text, message_type, time)
             VALUES ($1, $2, $3, $4, $5)`,
            [session_id, 'agent', text, 'text', timeStr]
        );

        // Update session
        await query(
            'UPDATE chat_sessions SET last_message = $1, last_time = $2, updated_at = NOW() WHERE id = $3',
            [text, timeStr, session_id]
        );

        return NextResponse.json({
            success: true,
            sent_to_platform: sent,
            message: sent ? `Message sent to ${platform}` : `Message saved but not sent to ${platform} (check credentials)`
        });
    } catch (err) {
        console.error('Reply Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
