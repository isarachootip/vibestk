import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function GET() {
    try {
        if (isPostgresActive()) {
            const result = await query('SELECT role, allowed_menus FROM permissions');
            const perms = {};
            result.rows.forEach(row => {
                perms[row.role] = typeof row.allowed_menus === 'string' ? JSON.parse(row.allowed_menus) : row.allowed_menus;
            });
            return NextResponse.json(perms);
        }
        return NextResponse.json(IN_MEMORY_DB.permissions);
    } catch (err) {
        return NextResponse.json(IN_MEMORY_DB.permissions); // Safe fallback
    }
}

export async function POST(request) {
    try {
        const { role, allowed_menus } = await request.json();
        
        if (isPostgresActive()) {
            const menuJson = JSON.stringify(allowed_menus);
            await query('INSERT INTO permissions (role, allowed_menus) VALUES ($1, $2) ON CONFLICT (role) DO UPDATE SET allowed_menus = $2', [role, menuJson]);
            return NextResponse.json({ success: true, message: `Updated ${role} permissions.` });
        } else {
            IN_MEMORY_DB.permissions[role] = allowed_menus;
            return NextResponse.json({ success: true, message: `Updated ${role} permissions in-memory.` });
        }
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export const dynamic = 'force-dynamic';
