import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '5');
        const search = (searchParams.get('search') || '').toLowerCase();
        const stage = searchParams.get('stage') || 'all';
        const sortColumn = searchParams.get('sortColumn') || 'id';
        const sortDirection = searchParams.get('sortDirection') || 'asc';
        
        let allOpps = [];
        if (isPostgresActive()) {
            const result = await query('SELECT * FROM opportunities');
            allOpps = result.rows;
        } else {
            allOpps = IN_MEMORY_DB.opportunities;
        }

        // Apply filters
        let filtered = allOpps.filter(opp => {
            const matchesSearch = opp.company.toLowerCase().includes(search) || 
                                 opp.title.toLowerCase().includes(search) || 
                                 opp.id.toLowerCase().includes(search);
            const matchesStage = stage === 'all' || opp.stage === stage;
            return matchesSearch && matchesStage;
        });

        // Apply sorting
        filtered.sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];

            // Normalize strings for comparison
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            } else {
                valA = parseFloat(valA || 0);
                valB = parseFloat(valB || 0);
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        // Paginate
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const pageNum = Math.max(1, Math.min(page, totalPages));
        const startIndex = (pageNum - 1) * pageSize;
        const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

        return NextResponse.json({
            totalItems,
            totalPages,
            currentPage: pageNum,
            pageSize,
            data: paginatedData
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export const dynamic = 'force-dynamic';
