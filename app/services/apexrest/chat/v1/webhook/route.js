import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Helper to generate the next opportunity or case ID from PostgreSQL database
async function getNextOpportunityId(prefix = 'OPP-') {
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
        const { messaging = [], channel = {}, sender = {} } = body;
        
        const channelType = channel.channel_type || 'Zwiz';
        const socialId = sender.social_id || 'unknown_social_id';
        const displayName = sender.display_name || 'Customer';

        let resolvedOppId = null;

        // 2. Process Actions inside payload
        for (const item of messaging) {
            if (item.action && Array.isArray(item.action)) {
                for (const act of item.action) {
                    const actionName = act.name;
                    const params = act.params || {};

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
                        resolvedOppId = newId;
                    } else if (actionName === 'CREATE_CASE') {
                        const newId = await getNextOpportunityId('CASE-');
                        const title = params.subject || 'Case Inbound';
                        await createOpportunity({
                            id: newId,
                            title,
                            company: channelType,
                            contactName: displayName,
                            phone: socialId
                        });
                        resolvedOppId = newId;
                    } else if (actionName === 'CLOSE_OPPORTUNITY') {
                        const oppId = params.opportunity_id;
                        if (oppId) {
                            await query(`UPDATE opportunities SET stage = 'won' WHERE id = $1`, [oppId]);
                        }
                    } else if (actionName === 'CLOSE_CASE') {
                        const caseId = params.case_id;
                        if (caseId) {
                            await query(`UPDATE opportunities SET stage = 'won' WHERE id = $1`, [caseId]);
                        }
                    } else if (actionName === 'CLOSE_CHAT') {
                        // Close latest active opportunity for this user
                        await query(
                            `UPDATE opportunities SET stage = 'won' 
                             WHERE phone = $1 AND stage NOT IN ('won', 'lost')`,
                            [socialId]
                        );
                    } else if (actionName === 'REASSIGN_QUEUE') {
                        // Queue reassignment log/placeholder
                        console.log(`Reassigned opportunity/queue to: ${params.queue_name}`);
                    }
                }
            }
        }

        // 3. Resolve Opportunity ID for chat messages if not resolved yet
        if (!resolvedOppId) {
            // Find latest active opportunity for this customer (mapped by social_id -> phone)
            const activeOpp = await query(
                `SELECT id FROM opportunities 
                 WHERE phone = $1 AND stage NOT IN ('won', 'lost') 
                 ORDER BY created_at DESC LIMIT 1`,
                [socialId]
            );

            if (activeOpp.rows.length > 0) {
                resolvedOppId = activeOpp.rows[0].id;
            } else {
                // Find any latest opportunity
                const anyOpp = await query(
                    `SELECT id FROM opportunities 
                     WHERE phone = $1 
                     ORDER BY created_at DESC LIMIT 1`,
                    [socialId]
                );

                if (anyOpp.rows.length > 0) {
                    resolvedOppId = anyOpp.rows[0].id;
                } else {
                    // Create default opportunity to prevent foreign key errors
                    const newId = await getNextOpportunityId('OPP-');
                    await createOpportunity({
                        id: newId,
                        title: `Chat from ${displayName}`,
                        company: channelType,
                        contactName: displayName,
                        phone: socialId
                    });
                    resolvedOppId = newId;
                }
            }
        }

        // 4. Save Chat Messages
        let savedMessageCount = 0;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        for (const item of messaging) {
            if (item.message) {
                const msg = item.message;
                const messageText = msg.text || msg.alt_text || `[${msg.type || 'Attachment'}]`;
                const isEcho = msg.is_echo === true || sender.origin === 'Bot' || sender.origin === 'Agent Page';
                const senderRole = isEcho ? 'agent' : 'client';

                await query(
                    `INSERT INTO chat_messages (opportunity_id, sender, text, time) 
                     VALUES ($1, $2, $3, $4)`,
                    [resolvedOppId, senderRole, messageText, timeStr]
                );
                savedMessageCount++;
            }
        }

        // 5. Trigger a system notification if a new client message was saved
        if (savedMessageCount > 0) {
            const notifTime = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
            await query(
                `INSERT INTO notifications (text, type, time, unread) 
                 VALUES ($1, $2, $3, $4)`,
                [`ข้อความใหม่จาก ${displayName} (${channelType})`, 'info', notifTime, true]
            );
        }

        return NextResponse.json({
            status: {
                code: 1000,
                description: "Success"
            },
            data: resolvedOppId ? { opportunity_id: resolvedOppId } : {}
        });

    } catch (err) {
        console.error("Webhook processing error:", err);
        return NextResponse.json(
            { status: { code: 5000, description: `Internal server error: ${err.message}` } },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';
