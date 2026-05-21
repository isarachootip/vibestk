import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function POST() {
    try {
        if (isPostgresActive()) {
            await query('DELETE FROM notifications');
        } else {
            IN_MEMORY_DB.notifications = [];
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
