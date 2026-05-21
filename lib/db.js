/**
 * STK Database Query Helper with Automatic In-Memory Fallback
 * Version 1.0.1 (Build 471)
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ==========================================================================
// 1. IN-MEMORY DATABASE FALLBACK STATE (Shared Server-side state)
// ==========================================================================
export const IN_MEMORY_DB = {
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
                console.warn("⚠️ PostgreSQL Connection Error in Next.js. Falling back to IN-MEMORY database mode.");
                console.warn(err.message);
                usePostgres = false;
            } else {
                console.log("⚡ PostgreSQL Connected Successfully inside Next.js!");
                usePostgres = true;
            }
        });
    } else {
        console.log("⚠️ Default DB Password detected. Running Next.js in In-Memory simulation mode.");
    }
} catch (e) {
    console.error("⚠️ Failed to initialize pg client. Running in In-Memory fallback mode.", e);
}

// Database query helper
export async function query(text, params) {
    if (usePostgres && dbPool) {
        return await dbPool.query(text, params);
    } else {
        throw new Error("PostgreSQL not active");
    }
}

export function isPostgresActive() {
    return usePostgres;
}
