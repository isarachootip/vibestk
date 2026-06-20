import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

// GET: List all chat sessions with messages
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const channel = searchParams.get('channel'); // line, facebook, instagram
        const status = searchParams.get('status');    // active, waiting, closed
        const sessionId = searchParams.get('id');     // specific session

        if (isPostgresActive()) {
            // Get specific session with messages
            if (sessionId) {
                const session = await query('SELECT * FROM chat_sessions WHERE id = $1', [sessionId]);
                if (session.rows.length === 0) {
                    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
                }
                const messages = await query(
                    'SELECT * FROM chat_session_messages WHERE session_id = $1 ORDER BY created_at ASC',
                    [sessionId]
                );
                return NextResponse.json({
                    ...session.rows[0],
                    messages: messages.rows
                });
            }

            // List sessions with filters
            let sql = 'SELECT * FROM chat_sessions';
            const conditions = [];
            const params = [];

            if (channel && channel !== 'all') {
                params.push(channel);
                conditions.push(`channel = $${params.length}`);
            }
            if (status && status !== 'all') {
                params.push(status);
                conditions.push(`status = $${params.length}`);
            }

            if (conditions.length > 0) {
                sql += ' WHERE ' + conditions.join(' AND ');
            }
            sql += ' ORDER BY updated_at DESC';

            const sessions = await query(sql, params);

            // For each session, get last 50 messages
            const result = [];
            for (const s of sessions.rows) {
                const msgs = await query(
                    'SELECT * FROM chat_session_messages WHERE session_id = $1 ORDER BY created_at ASC LIMIT 50',
                    [s.id]
                );
                result.push({
                    ...s,
                    messages: msgs.rows
                });
            }

            return NextResponse.json(result);
        }

        // Fallback: return empty
        return NextResponse.json([]);
    } catch (err) {
        console.error('Chat Sessions Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH: Update session status (close, assign agent, etc.)
export async function PATCH(request) {
    try {
        const { session_id, status, assigned_agent, unread } = await request.json();

        if (!session_id) {
            return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
        }

        if (isPostgresActive()) {
            const updates = [];
            const params = [];
            let idx = 1;

            if (status) {
                params.push(status);
                updates.push(`status = $${idx++}`);
            }
            if (assigned_agent !== undefined) {
                params.push(assigned_agent);
                updates.push(`assigned_agent = $${idx++}`);
            }
            if (unread !== undefined) {
                params.push(unread);
                updates.push(`unread = $${idx++}`);
            }

            updates.push('updated_at = NOW()');
            params.push(session_id);

            await query(
                `UPDATE chat_sessions SET ${updates.join(', ')} WHERE id = $${idx}`,
                params
            );

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
