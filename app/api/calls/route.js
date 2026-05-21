import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function POST(request) {
    try {
        const { id, outcome, notes, agentId } = await request.json();
        
        if (isPostgresActive()) {
            await query('UPDATE agents SET calls = calls + 1 WHERE id = $1', [agentId || 'A101']);
        } else {
            const agent = IN_MEMORY_DB.agents.find(a => a.id === (agentId || 'A101'));
            if (agent) agent.calls++;
        }
        
        return NextResponse.json({ success: true, message: `Logged call outcome: ${outcome} for deal ${id}.` });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
