import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function POST(request) {
    try {
        const { id } = await request.json();
        
        if (isPostgresActive()) {
            await query('UPDATE notifications SET unread = FALSE WHERE id = $1', [id]);
        } else {
            const notif = IN_MEMORY_DB.notifications.find(n => n.id === id);
            if (notif) notif.unread = false;
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
