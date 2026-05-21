import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function POST(request) {
    try {
        const { id, status } = await request.json();
        
        if (isPostgresActive()) {
            await query('UPDATE agents SET status = $1 WHERE id = $2', [status, id]);
            return NextResponse.json({ success: true });
        } else {
            const agent = IN_MEMORY_DB.agents.find(a => a.id === id);
            if (agent) agent.status = status;
            return NextResponse.json({ success: true });
        }
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
