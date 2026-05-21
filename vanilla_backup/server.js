/**
 * STK Sales Tracking System - Express Server & PostgreSQL API
 * Version 1.0.1 (Build 471)
 */

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON middleware and CORS
app.use(express.json());
app.use(cors());

// ==========================================================================
// 1. IN-MEMORY DATABASE FALLBACK STATE
// ==========================================================================
const IN_MEMORY_DB = {
    users: [
        { id: 1, username: "somchai.j@thaiwatsadu.com", name: "สมชาย ใจดี", role: "role_a" },
        { id: 2, username: "napa.s@thaiwatsadu.com", name: "นภา สุขดี", role: "role_b" },
        { id: 3, username: "wirot.s@thaiwatsadu.com", name: "วิโรจน์ แสงใต้", role: "role_c" },
        { id: 4, username: "admin@thaiwatsadu.com", name: "ผู้ดูแลระบบสูงสุด", role: "admin" }
    ],
    agents: [
        { id: "A101", name: "วิชัย รัตนวงศ์", role: "Agent", status: "online", team: "Team Alpha", calls: 24, sales: 185000, conversion: 78, break_remain: 30 },
        { id: "A102", name: "นภา สุขดี", role: "Agent", status: "break", team: "Team Alpha", calls: 18, sales: 94000, conversion: 52, break_remain: 15 },
        { id: "A103", name: "สมเกียรติ ปัญญา", role: "Agent", status: "online", team: "Team Beta", calls: 31, sales: 320000, conversion: 84, break_remain: 30 },
        { id: "A104", name: "พัชรา สิงห์โต", role: "Agent", status: "lunch", team: "Team Beta", calls: 15, sales: 112000, conversion: 60, break_remain: 0 },
        { id: "A105", name: "ธนาวุฒิ มีชัย", role: "Agent", status: "online", team: "Team Gamma", calls: 22, sales: 146000, conversion: 68, break_remain: 24 },
        { id: "A106", name: "ศิริพร บุญช่วย", role: "Agent", status: "offline", team: "Team Gamma", calls: 0, sales: 0, conversion: 0, break_remain: 30 }
    ],
    opportunities: [
        { id: "OPP-301", title: "สั่งซื้อกระเบื้องปูพื้นแกรนิตโต้ล็อตใหญ่", company: "บจก. คอนสตรัคชั่นพลัส", contact_name: "คุณทวีเกียรติ", phone: "081-452-XXXX", value: 125000, stage: "proposal", days: 3 },
        { id: "OPP-302", title: "อัปเกรดเครื่องมือช่างสำหรับแคมป์ไซต์", company: "หจก. เมืองทองวัสดุก่อสร้าง", contact_name: "ช่างเอก", phone: "089-771-XXXX", value: 48000, stage: "qualified", days: 5 },
        { id: "OPP-303", title: "จัดหาชุดสีทาภายนอกอาคารคอนโด", company: "โครงการแกรนด์อเวนิว", contact_name: "คุณสมพงษ์ (PM)", phone: "086-312-XXXX", value: 345000, stage: "new", days: 1 },
        { id: "OPP-304", title: "สั่งซื้อท่อ PVC และข้อต่อสำหรับโครงการหมู่บ้าน", company: "บมจ. อนันตากลุ๊ป", contact_name: "คุณวิลาวัณย์", phone: "083-294-XXXX", value: 670000, stage: "won", days: 12 },
        { id: "OPP-305", title: "ชุดสุขภัณฑ์หรูสไตล์สแกนดิเนเวียน 20 ชุด", company: "โครงการพาสิโอเรสซิเดนซ์", contact_name: "คุณกิตติธัช", phone: "082-551-XXXX", value: 180000, stage: "proposal", days: 4 },
        { id: "OPP-306", title: "จัดซื้อเครื่องปรับอากาศอุตสาหกรรม 5 เครื่อง", company: "บจก. ยูเนี่ยนแฟคทอรี่", contact_name: "คุณสมชาย", phone: "085-442-XXXX", value: 155000, stage: "lost", days: 8 },
        { id: "OPP-307", title: "สั่งโคมไฟสนามและระบบไฟโซล่าเซลล์", company: "โรงแรมรอยัลพลาซ่า", contact_name: "คุณนันท์นภัส", phone: "088-234-XXXX", value: 75000, stage: "qualified", days: 2 }
    ],
    customers: [
        { code: "CUST-801", name: "วิวัฒน์ เอนจิเนียริ่ง", segment: "Platinum Tier", province: "กรุงเทพฯ", last_order: "150,000 บาท", last_contact: "2026-05-18", status: "ปกติ" },
        { code: "CUST-802", name: "ช่างพัฒน์ โครงหลังคาเหล็ก", segment: "SME Contractor", province: "นนทบุรี", last_order: "32,000 บาท", last_contact: "2026-05-19", status: "ติดตามด่วน" },
        { code: "CUST-803", name: "คุณพรเพ็ญ บ้านสวยทิวลิป", segment: "Retail Walk-In", province: "ปทุมธานี", last_order: "8,500 บาท", last_contact: "2026-05-10", status: "ปกติ" },
        { code: "CUST-804", name: "บจก. เจริญโภคภัณฑ์วิศวกรรม", segment: "Platinum Tier", province: "ชลบุรี", last_order: "1,200,000 บาท", last_contact: "2026-05-15", status: "ปกติ" },
        { code: "CUST-805", name: "รับเหมาครบวงจร ช่างณรงค์", segment: "VIP Builder", province: "สมุทรปราการ", last_order: "95,000 บาท", last_contact: "2026-05-20", status: "ปกติ" },
        { code: "CUST-806", name: "บจก. เอสเตท พร็อพเพอร์ตี้", segment: "VIP Builder", province: "สมุทรสาคร", last_order: "420,000 บาท", last_contact: "2026-05-14", status: "ติดตามด่วน" }
    ],
    chat_messages: [
        { id: 1, opportunity_id: "OPP-301", sender: "client", text: "สวัสดีครับ สรุปโควเทชั่นกระเบื้องแกรนิตโต้ที่ขอไปเรียบร้อยหรือยังครับ?", time: "10:14" },
        { id: 2, opportunity_id: "OPP-301", sender: "agent", text: "สวัสดีค่ะคุณทวีเกียรติ กำลังให้แผนกคลังสินค้าเช็คสต็อกสีและจำนวนที่แน่นอนให้อยู่นะคะ คาดว่าไม่เกินบ่ายสองจะได้รับเอกสารใบเสนอราคาค่ะ", time: "10:16" },
        { id: 3, opportunity_id: "OPP-301", sender: "client", text: "รบกวนหน่อยนะครับ พอดีต้องส่งเรื่องให้บอร์ดเซ็นอนุมัติจัดซื้อก่อนสี่โมงเย็นวันนี้", time: "10:18" },
        { id: 4, opportunity_id: "OPP-302", sender: "client", text: "เครื่องตัดไฟของ Bosch รุ่นล่าสุดมีของแถมอะไรบ้างไหมครับ?", time: "09:30" },
        { id: 5, opportunity_id: "OPP-302", sender: "agent", text: "สวัสดีค่ะช่างเอก สำหรับ Bosch ตัวใหม่จะแถมใบเลื่อยวงเดือนแท้ 2 ใบ พร้อมกล่องเคสแข็งฟรีค่ะ", time: "09:35" }
    ],
    notifications: [],
    permissions: {
        role_a: ["home", "opportunity", "monitor", "dashboard", "report"],
        role_b: ["home", "opportunity", "call", "segment"],
        role_c: ["home", "monitor", "dashboard", "report"],
        admin: ["home", "opportunity", "call", "segment", "monitor", "dashboard", "report", "management"]
    }
};

// ==========================================================================
// 2. POSTGRESQL POOL CONNECTION INITIALIZER
// ==========================================================================
let dbPool = null;
let usePostgres = false;

try {
    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD !== 'your_secure_password') {
        dbPool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_DATABASE || 'stk_sales',
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT || '5432'),
            connectionTimeoutMillis: 3000 // fail fast
        });

        // Test connection
        dbPool.query('SELECT NOW()', (err, res) => {
            if (err) {
                console.warn("⚠️ PostgreSQL Connection Error. Falling back to IN-MEMORY database server.");
                console.warn(err.message);
                usePostgres = false;
            } else {
                console.log("⚡ PostgreSQL Database Connected Successfully!");
                usePostgres = true;
            }
        });
    } else {
        console.log("⚠️ Default DB Password detected. Running in In-Memory simulation mode.");
    }
} catch (e) {
    console.error("⚠️ Failed to load pg client. Running in In-Memory fallback mode.", e);
}

// Database query helper
async function query(text, params) {
    if (usePostgres && dbPool) {
        return await dbPool.query(text, params);
    } else {
        throw new Error("PostgreSQL not active");
    }
}

// ==========================================================================
// 3. API ROUTING & CONTROLLERS
// ==========================================================================

// --- UTILITY: Server mode banner ---
app.get('/api/status', (req, res) => {
    res.json({
        status: "online",
        mode: usePostgres ? "PostgreSQL Database" : "In-Memory Simulation Mode",
        build: "471",
        version: "1.0.1"
    });
});

// --- SSO / AUTHENTICATION ---
app.post('/api/auth/login', async (req, res) => {
    const { username } = req.body;
    
    try {
        if (usePostgres) {
            const result = await query('SELECT * FROM users WHERE username = $1', [username]);
            if (result.rows.length > 0) {
                return res.json(result.rows[0]);
            }
        } else {
            const user = IN_MEMORY_DB.users.find(u => u.username === username);
            if (user) return res.json(user);
        }
        
        // Fallback default response for test logins
        res.status(404).json({ error: "User profile not found in directory" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ROLE PERMISSIONS ---
app.get('/api/permissions', async (req, res) => {
    try {
        if (usePostgres) {
            const result = await query('SELECT role, allowed_menus FROM permissions');
            const perms = {};
            result.rows.forEach(row => {
                perms[row.role] = typeof row.allowed_menus === 'string' ? JSON.parse(row.allowed_menus) : row.allowed_menus;
            });
            res.json(perms);
        } else {
            res.json(IN_MEMORY_DB.permissions);
        }
    } catch (err) {
        res.json(IN_MEMORY_DB.permissions); // Safe fallback
    }
});

app.post('/api/permissions', async (req, res) => {
    const { role, allowed_menus } = req.body;
    
    try {
        if (usePostgres) {
            const menuJson = JSON.stringify(allowed_menus);
            await query('INSERT INTO permissions (role, allowed_menus) VALUES ($1, $2) ON CONFLICT (role) DO UPDATE SET allowed_menus = $2', [role, menuJson]);
            res.json({ success: true, message: `Updated ${role} permissions.` });
        } else {
            IN_MEMORY_DB.permissions[role] = allowed_menus;
            res.json({ success: true, message: `Updated ${role} permissions in-memory.` });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SALES AGENTS ---
app.get('/api/agents', async (req, res) => {
    try {
        if (usePostgres) {
            const result = await query('SELECT * FROM agents ORDER BY id ASC');
            res.json(result.rows);
        } else {
            res.json(IN_MEMORY_DB.agents);
        }
    } catch (err) {
        res.json(IN_MEMORY_DB.agents);
    }
});

app.post('/api/agents/status', async (req, res) => {
    const { id, status } = req.body;
    try {
        if (usePostgres) {
            await query('UPDATE agents SET status = $1 WHERE id = $2', [status, id]);
            res.json({ success: true });
        } else {
            const agent = IN_MEMORY_DB.agents.find(a => a.id === id);
            if (agent) agent.status = status;
            res.json({ success: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- OPPORTUNITIES (KANBAN & PIPELINE) ---
app.get('/api/opportunities', async (req, res) => {
    try {
        if (usePostgres) {
            const result = await query('SELECT * FROM opportunities ORDER BY id ASC');
            res.json(result.rows);
        } else {
            res.json(IN_MEMORY_DB.opportunities);
        }
    } catch (err) {
        res.json(IN_MEMORY_DB.opportunities);
    }
});

app.post('/api/opportunities/stage', async (req, res) => {
    const { id, stage } = req.body;
    try {
        if (usePostgres) {
            await query('UPDATE opportunities SET stage = $1 WHERE id = $2', [stage, id]);
            res.json({ success: true, id, stage });
        } else {
            const opp = IN_MEMORY_DB.opportunities.find(o => o.id === id);
            if (opp) opp.stage = stage;
            res.json({ success: true, id, stage });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- LOG CALL GATES ---
app.post('/api/calls', async (req, res) => {
    const { id, outcome, notes, agentId } = req.body;
    try {
        // Increment agent calls count in db
        if (usePostgres) {
            await query('UPDATE agents SET calls = calls + 1 WHERE id = $1', [agentId || 'A101']);
        } else {
            const agent = IN_MEMORY_DB.agents.find(a => a.id === (agentId || 'A101'));
            if (agent) agent.calls++;
        }
        res.json({ success: true, message: `Logged call outcome: ${outcome} for deal ${id}.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CUSTOMERS ---
app.get('/api/customers', async (req, res) => {
    const { search = '', segment = 'ทั้งหมด' } = req.query;
    try {
        if (usePostgres) {
            let sql = 'SELECT * FROM customers WHERE (name ILIKE $1 OR code ILIKE $1)';
            const params = [`%${search}%`];
            
            if (segment !== 'ทั้งหมด') {
                sql += ' AND segment = $2';
                params.push(segment);
            }
            sql += ' ORDER BY code ASC';
            
            const result = await query(sql, params);
            res.json(result.rows);
        } else {
            let filtered = IN_MEMORY_DB.customers.filter(c => 
                c.name.toLowerCase().includes(search.toLowerCase()) || 
                c.code.toLowerCase().includes(search.toLowerCase())
            );
            if (segment !== 'ทั้งหมด') {
                filtered = filtered.filter(c => c.segment === segment);
            }
            res.json(filtered);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- LIVE CHATS HISTORIES ---
app.get('/api/chats/:oppId', async (req, res) => {
    const { oppId } = req.params;
    try {
        if (usePostgres) {
            const result = await query('SELECT * FROM chat_messages WHERE opportunity_id = $1 ORDER BY id ASC', [oppId]);
            res.json(result.rows);
        } else {
            const history = IN_MEMORY_DB.chat_messages.filter(m => m.opportunity_id === oppId);
            res.json(history);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/chats', async (req, res) => {
    const { opportunity_id, sender, text, time } = req.body;
    try {
        if (usePostgres) {
            const result = await query(
                'INSERT INTO chat_messages (opportunity_id, sender, text, time) VALUES ($1, $2, $3, $4) RETURNING *',
                [opportunity_id, sender, text, time]
            );
            res.json(result.rows[0]);
        } else {
            const newMsg = {
                id: IN_MEMORY_DB.chat_messages.length + 1,
                opportunity_id,
                sender,
                text,
                time
            };
            IN_MEMORY_DB.chat_messages.push(newMsg);
            res.json(newMsg);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- LIVE WEBSOCKET AGENTS SIMULATION ---
app.post('/api/agents/simulate', async (req, res) => {
    try {
        let agentsList = [];
        if (usePostgres) {
            const result = await query('SELECT * FROM agents');
            agentsList = result.rows;
        } else {
            agentsList = IN_MEMORY_DB.agents;
        }

        if (agentsList.length === 0) return res.json({ success: false });

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
        const timeNow = new Date().toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        if (usePostgres) {
            await query('UPDATE agents SET status = $1, break_remain = $2 WHERE id = $3', [newStatus, breakRemain, agent.id]);
            await query('INSERT INTO notifications (text, type, time, unread) VALUES ($1, $2, $3, TRUE)', [logMsg, type, timeNow]);
        } else {
            agent.status = newStatus;
            agent.break_remain = breakRemain;
            IN_MEMORY_DB.notifications.unshift({
                id: Date.now(),
                text: logMsg,
                type: type,
                time: timeNow,
                unread: true
            });
        }

        res.json({
            success: true,
            agent: { ...agent, status: newStatus, break_remain: breakRemain },
            notification: { text: logMsg, type, time: timeNow }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- NOTIFICATIONS GRID ---
app.get('/api/notifications', async (req, res) => {
    try {
        if (usePostgres) {
            const result = await query('SELECT * FROM notifications ORDER BY id DESC LIMIT 50');
            res.json(result.rows);
        } else {
            res.json(IN_MEMORY_DB.notifications);
        }
    } catch (err) {
        res.json(IN_MEMORY_DB.notifications);
    }
});

app.post('/api/notifications/clear', async (req, res) => {
    try {
        if (usePostgres) {
            await query('DELETE FROM notifications');
        } else {
            IN_MEMORY_DB.notifications = [];
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/notifications/read', async (req, res) => {
    const { id } = req.body;
    try {
        if (usePostgres) {
            await query('UPDATE notifications SET unread = FALSE WHERE id = $1', [id]);
        } else {
            const notif = IN_MEMORY_DB.notifications.find(n => n.id === id);
            if (notif) notif.unread = false;
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DASHBOARD ANALYTICS ---
app.get('/api/dashboard/analytics', async (req, res) => {
    try {
        let opps = [];
        if (usePostgres) {
            const result = await query('SELECT * FROM opportunities');
            opps = result.rows;
        } else {
            opps = IN_MEMORY_DB.opportunities;
        }

        const totalOppAmount = opps.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0);
        const wonOpps = opps.filter(o => o.stage === "won");
        const totalWonAmount = wonOpps.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0);
        const winRate = opps.length > 0 ? Math.round((wonOpps.length / opps.length) * 100) : 0;

        res.json({
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
        res.status(500).json({ error: err.message });
    }
});

// --- GRID REPORTS (PAGINATION, SORTING, SEARCH) ---
app.get('/api/reports', async (req, res) => {
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '5');
    const search = (req.query.search || '').toLowerCase();
    const stage = req.query.stage || 'all';
    const sortColumn = req.query.sortColumn || 'id';
    const sortDirection = req.query.sortDirection || 'asc';

    try {
        let allOpps = [];
        if (usePostgres) {
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
        const pageNum = Math.min(page, totalPages);
        const startIndex = (pageNum - 1) * pageSize;
        const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

        res.json({
            totalItems,
            totalPages,
            currentPage: pageNum,
            pageSize,
            data: paginatedData
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================================================
// 4. SERVER LISTENER INITIALIZATION
// ==========================================================================
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 STK Sales Tracking Server running on PORT: ${PORT}`);
    console.log(`🔗 API Base Address: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
});
