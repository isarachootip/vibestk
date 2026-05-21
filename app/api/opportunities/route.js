import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function GET() {
    try {
        if (isPostgresActive()) {
            const result = await query('SELECT * FROM opportunities ORDER BY id ASC');
            return NextResponse.json(result.rows);
        }
        return NextResponse.json(IN_MEMORY_DB.opportunities);
    } catch (err) {
        return NextResponse.json(IN_MEMORY_DB.opportunities);
    }
}
export const dynamic = 'force-dynamic';
