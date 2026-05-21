import { NextResponse } from 'next/server';
import { query, isPostgresActive, IN_MEMORY_DB } from '@/lib/db';

export async function POST() {
    try {
        let agentsList = [];
        if (isPostgresActive()) {
            const result = await query('SELECT * FROM agents');
            agentsList = result.rows;
        } else {
            agentsList = IN_MEMORY_DB.agents;
        }

        if (agentsList.length === 0) return NextResponse.json({ success: false });

        // Random pick & update status
        const randIndex = Math.floor(Math.random() * agentsList.length);
        const agent = agentsList[randIndex];
        const statuses = ["online", "break", "lunch"];
        
        let newStatus = agent.status;
        while (newStatus === agent.status) {
            newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        }

        let statusText = "ออนไลน์";
        let type = "success";
        let breakRemain = 30;

        if (newStatus === "break") {
            statusText = "พักเบรก";
            type = "warn";
            breakRemain = 30;
        } else if (newStatus === "lunch") {
            statusText = "พักเที่ยง";
            type = "danger";
            breakRemain = 0;
        }

        const logMsg = `เจ้าหน้าที่ ${agent.name} (${agent.id}) ได้ปรับเปลี่ยนสถานะการทำงานเป็น -> ${statusText}`;
        
        // Time format matching locale
        const date = new Date();
        // Shift time for local Thailand context if running on external cloud server
        const thaiTime = new Intl.DateTimeFormat('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Bangkok'
        }).format(date);

        if (isPostgresActive()) {
            await query('UPDATE agents SET status = $1, break_remain = $2 WHERE id = $3', [newStatus, breakRemain, agent.id]);
            await query('INSERT INTO notifications (text, type, time, unread) VALUES ($1, $2, $3, TRUE)', [logMsg, type, thaiTime]);
        } else {
            agent.status = newStatus;
            agent.break_remain = breakRemain;
            IN_MEMORY_DB.notifications.unshift({
                id: Date.now(),
                text: logMsg,
                type: type,
                time: thaiTime,
                unread: true
            });
        }

        return NextResponse.json({
            success: true,
            agent: { ...agent, status: newStatus, break_remain: breakRemain },
            notification: { text: logMsg, type, time: thaiTime }
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
