import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const segment = searchParams.get('segment') || 'ทั้งหมด';
        
        if (isPostgresActive()) {
            let sql = 'SELECT * FROM customers WHERE (name ILIKE $1 OR code ILIKE $1)';
            const params = [`%${search}%`];
            
            if (segment !== 'ทั้งหมด') {
                sql += ' AND segment = $2';
                params.push(segment);
            }
            sql += ' ORDER BY code ASC';
            
            const result = await query(sql, params);
            return NextResponse.json(result.rows);
        } else {
            let filtered = IN_MEMORY_DB.customers.filter(c => 
                c.name.toLowerCase().includes(search.toLowerCase()) || 
                c.code.toLowerCase().includes(search.toLowerCase())
            );
            if (segment !== 'ทั้งหมด') {
                filtered = filtered.filter(c => c.segment === segment);
            }
            return NextResponse.json(filtered);
        }
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export const dynamic = 'force-dynamic';
