import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function POST(request) {
    try {
        const { opportunity_id, sender, text, time } = await request.json();
        
        if (isPostgresActive()) {
            const result = await query(
                'INSERT INTO chat_messages (opportunity_id, sender, text, time) VALUES ($1, $2, $3, $4) RETURNING *',
                [opportunity_id, sender, text, time]
            );
            return NextResponse.json(result.rows[0]);
        } else {
            const newMsg = {
                id: IN_MEMORY_DB.chat_messages.length + 1,
                opportunity_id,
                sender,
                text,
                time
            };
            IN_MEMORY_DB.chat_messages.push(newMsg);
            return NextResponse.json(newMsg);
        }
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
