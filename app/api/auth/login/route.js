import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function POST(request) {
    try {
        const { username } = await request.json();
        
        if (isPostgresActive()) {
            const result = await query('SELECT * FROM users WHERE username = $1', [username]);
            if (result.rows.length > 0) {
                return NextResponse.json(result.rows[0]);
            }
        } else {
            const user = IN_MEMORY_DB.users.find(u => u.username === username);
            if (user) return NextResponse.json(user);
        }
        
        return NextResponse.json({ error: "User profile not found in directory" }, { status: 404 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
