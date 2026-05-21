import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function GET() {
    try {
        if (isPostgresActive()) {
            const result = await query('SELECT * FROM agents ORDER BY id ASC');
            return NextResponse.json(result.rows);
        }
        return NextResponse.json(IN_MEMORY_DB.agents);
    } catch (err) {
        return NextResponse.json(IN_MEMORY_DB.agents);
    }
}
export const dynamic = 'force-dynamic';
