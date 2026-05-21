import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function POST(request) {
    try {
        const { id, stage } = await request.json();
        
        if (isPostgresActive()) {
            await query('UPDATE opportunities SET stage = $1 WHERE id = $2', [stage, id]);
            return NextResponse.json({ success: true, id, stage });
        } else {
            const opp = IN_MEMORY_DB.opportunities.find(o => o.id === id);
            if (opp) opp.stage = stage;
            return NextResponse.json({ success: true, id, stage });
        }
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
