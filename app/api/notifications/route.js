import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function GET() {
    try {
        if (isPostgresActive()) {
            const result = await query('SELECT * FROM notifications ORDER BY id DESC LIMIT 50');
            return NextResponse.json(result.rows);
        }
        return NextResponse.json(IN_MEMORY_DB.notifications);
    } catch (err) {
        return NextResponse.json(IN_MEMORY_DB.notifications);
    }
}
export const dynamic = 'force-dynamic';
