import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Helper to generate the next opportunity or case ID from PostgreSQL database
async function getNextOpportunityId(prefix = 'OPP-') {
    if (prefix === 'CASE-' || prefix === 'cs') {
        const d = new Date();
        const bangkokDate = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Bangkok',
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(d);
        
        const yy = bangkokDate.find(p => p.type === 'year').value;
        const mm = bangkokDate.find(p => p.type === 'month').value;
        const dd = bangkokDate.find(p => p.type === 'day').value;
        const dateStr = `${yy}${mm}${dd}`;
        const finalPrefix = 'cs';
        const pattern = `${finalPrefix}${dateStr}%`;
        
        const maxRes = await query(`SELECT id FROM opportunities WHERE id LIKE $1`, [pattern]);
        let maxRunning = 0;
        maxRes.rows.forEach(r => {
            const suffix = r.id.substring(finalPrefix.length + dateStr.length);
            const num = parseInt(suffix, 10);
            if (!isNaN(num) && num > maxRunning) {
                maxRunning = num;
            }
        });
        const nextRunning = String(maxRunning + 1).padStart(2, '0');
        return `${finalPrefix}${dateStr}${nextRunning}`;
    }

    const maxRes = await query(`SELECT id FROM opportunities WHERE id LIKE $1`, [`${prefix}%`]);
    let maxNum = 307; // Default seed max (OPP-307)
    
    maxRes.rows.forEach(r => {
        const num = parseInt(r.id.replace(prefix, ''));
        if (!isNaN(num) && num > maxNum) {
            maxNum = num;
        }
    });
    
    return `${prefix}${maxNum + 1}`;
}

// Helper to create a new opportunity/case directly in PostgreSQL
async function createOpportunity({ id, title, company, contactName, phone }) {
    await query(
        `INSERT INTO opportunities (id, title, company, contact_name, phone, value, stage, days) 
         VALUES ($1, $2, $3, $4, $5, 0.00, 'new', 1)`,
        [id, title, company, contactName, phone]
    );
    return id;
}

export async function POST(request) {
    try {
        // 1. Verify Authorization Header
        const authHeader = request.headers.get('authorization') || '';
        if (!authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { status: { code: 4001, description: "Missing or invalid authorization header" } },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { action = {}, target = {}, channel = {} } = body;
        
        const actionName = action.name;
        const params = action.params || {};
        
        const socialId = target.social_id || target.external_id || 'unknown_social_id';
        const displayName = target.display_name || 'Customer';
        const channelType = channel.channel_type || 'Zwiz';

        if (!actionName) {
            return NextResponse.json(
                { status: { code: 1101, description: "Required parameter 'action.name' is missing" } },
                { status: 400 }
            );
        }

        let responseData = {};

        // 2. Execute Action
        if (actionName === 'CREATE_OPPORTUNITY') {
            const newId = await getNextOpportunityId('OPP-');
            const title = params.opportunity_name || 'Confirm Chat & Shop';
            await createOpportunity({
                id: newId,
                title,
                company: channelType,
                contactName: displayName,
                phone: socialId
            });
            responseData = { opportunity_id: newId };
            
            // Insert notification
            await query(
                `INSERT INTO notifications (text, type, time, unread) 
                 VALUES ($1, $2, $3, $4)`,
                [`เปิดโอกาสขายใหม่: ${title} (${displayName})`, 'success', new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }), true]
            );

        } else if (actionName === 'CREATE_CASE') {
            const newId = await getNextOpportunityId('cs');
            const title = params.subject || 'Case Inbound';
            await createOpportunity({
                id: newId,
                title,
                company: channelType,
                contactName: displayName,
                phone: socialId
            });
            responseData = { case_id: newId };

            // Insert notification
            await query(
                `INSERT INTO notifications (text, type, time, unread) 
                 VALUES ($1, $2, $3, $4)`,
                [`เปิดเคสสนับสนุนใหม่: ${title} (${displayName})`, 'success', new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }), true]
            );

        } else if (actionName === 'CLOSE_OPPORTUNITY') {
            const oppId = params.opportunity_id;
            if (!oppId) {
                return NextResponse.json(
                    { status: { code: 2109, description: "Opportunity ID is required to close opportunity" } },
                    { status: 400 }
                );
            }
            await query(`UPDATE opportunities SET stage = 'won' WHERE id = $1`, [oppId]);

        } else if (actionName === 'CLOSE_CASE') {
            const caseId = params.case_id;
            if (!caseId) {
                return NextResponse.json(
                    { status: { code: 2110, description: "Case ID is required to close case" } },
                    { status: 400 }
                );
            }
            await query(`UPDATE opportunities SET stage = 'won' WHERE id = $1`, [caseId]);

        } else if (actionName === 'CLOSE_CHAT') {
            // Close active opportunities for this user
            await query(
                `UPDATE opportunities SET stage = 'won' 
                 WHERE phone = $1 AND stage NOT IN ('won', 'lost')`,
                [socialId]
            );

        } else if (actionName === 'REASSIGN_QUEUE') {
            console.log(`Reassigned opportunity/queue to: ${params.queue_name}`);
        } else {
            return NextResponse.json(
                { status: { code: 2101, description: "Specified action is unavailable" } },
                { status: 400 }
            );
        }

        return NextResponse.json({
            status: {
                code: 1000,
                description: "Success"
            },
            data: responseData
        });

    } catch (err) {
        console.error("Action execution error:", err);
        return NextResponse.json(
            { status: { code: 5000, description: `Internal server error: ${err.message}` } },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
