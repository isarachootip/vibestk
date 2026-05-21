import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { oppId } = await params;
        
        if (isPostgresActive()) {
            const result = await query('SELECT * FROM chat_messages WHERE opportunity_id = $1 ORDER BY id ASC', [oppId]);
            return NextResponse.json(result.rows);
        } else {
            const history = IN_MEMORY_DB.chat_messages.filter(m => m.opportunity_id === oppId);
            return NextResponse.json(history);
        }
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export const dynamic = 'force-dynamic';
