import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function GET() {
    try {
        let opps = [];
        if (isPostgresActive()) {
            const result = await query('SELECT * FROM opportunities');
            opps = result.rows;
        } else {
            opps = IN_MEMORY_DB.opportunities;
        }

        const totalOppAmount = opps.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0);
        const wonOpps = opps.filter(o => o.stage === "won");
        const totalWonAmount = wonOpps.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0);
        const winRate = opps.length > 0 ? Math.round((wonOpps.length / opps.length) * 100) : 0;

        return NextResponse.json({
            totals: {
                target: 1438000,
                salesWon: totalWonAmount,
                pipelineValue: totalOppAmount,
                winRate: winRate,
                wonDealsCount: wonOpps.length,
                totalDealsCount: opps.length
            },
            monthlyTargets: {
                targets: [300000, 350000, 400000, 450000, 500000],
                actuals: [315000, 340000, 420000, 480000, totalWonAmount > 500000 ? Math.round(totalWonAmount) : 520000]
            },
            chatChannels: [45, 25, 20, 10] // static breakdown ratio
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
export const dynamic = 'force-dynamic';
