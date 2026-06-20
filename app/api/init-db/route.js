import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false,
        connectionTimeoutMillis: 10000
    });

    try {
        const client = await pool.connect();
        
        // Create tables
        await client.query(`
            DROP TABLE IF EXISTS chat_messages CASCADE;
            DROP TABLE IF EXISTS opportunities CASCADE;
            DROP TABLE IF EXISTS agents CASCADE;
            DROP TABLE IF EXISTS customers CASCADE;
            DROP TABLE IF EXISTS notifications CASCADE;
            DROP TABLE IF EXISTS permissions CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS social_configs CASCADE;

            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                role VARCHAR(20) NOT NULL
            );

            CREATE TABLE agents (
                id VARCHAR(10) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                role VARCHAR(50) DEFAULT 'Agent',
                status VARCHAR(20) DEFAULT 'offline',
                team VARCHAR(50) NOT NULL,
                calls INT DEFAULT 0,
                sales DECIMAL(12, 2) DEFAULT 0.00,
                conversion INT DEFAULT 0,
                break_remain INT DEFAULT 30
            );

            CREATE TABLE opportunities (
                id VARCHAR(10) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                company VARCHAR(255) NOT NULL,
                contact_name VARCHAR(100) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                value DECIMAL(12, 2) DEFAULT 0.00,
                stage VARCHAR(20) DEFAULT 'new',
                days INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE customers (
                code VARCHAR(15) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                segment VARCHAR(50) NOT NULL,
                province VARCHAR(100) NOT NULL,
                last_order VARCHAR(100) NOT NULL,
                last_contact DATE NOT NULL,
                status VARCHAR(50) NOT NULL
            );

            CREATE TABLE chat_messages (
                id SERIAL PRIMARY KEY,
                opportunity_id VARCHAR(10) REFERENCES opportunities(id) ON DELETE CASCADE,
                sender VARCHAR(10) NOT NULL,
                text TEXT NOT NULL,
                time VARCHAR(10) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE notifications (
                id SERIAL PRIMARY KEY,
                text TEXT NOT NULL,
                type VARCHAR(20) DEFAULT 'info',
                time VARCHAR(10) NOT NULL,
                unread BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE permissions (
                role VARCHAR(20) PRIMARY KEY,
                allowed_menus JSONB NOT NULL
            );

            CREATE TABLE social_configs (
                platform VARCHAR(50) PRIMARY KEY,
                config JSONB NOT NULL
            );
        `);

        // Seed data
        await client.query(`
            INSERT INTO users (username, name, role) VALUES 
            ('somchai.j@thaiwatsadu.com', 'สมชาย ใจดี', 'role_a'),
            ('napa.s@thaiwatsadu.com', 'นภา สุขดี', 'role_b'),
            ('wirot.s@thaiwatsadu.com', 'วิโรจน์ แสงใต้', 'role_c'),
            ('admin@thaiwatsadu.com', 'ผู้ดูแลระบบสูงสุด', 'admin');

            INSERT INTO agents (id, name, role, status, team, calls, sales, conversion, break_remain) VALUES 
            ('A101', 'วิชัย รัตนวงศ์', 'Agent', 'online', 'Team Alpha', 24, 185000.00, 78, 30),
            ('A102', 'นภา สุขดี', 'Agent', 'break', 'Team Alpha', 18, 94000.00, 52, 15),
            ('A103', 'สมเกียรติ ปัญญา', 'Agent', 'online', 'Team Beta', 31, 320000.00, 84, 30),
            ('A104', 'พัชรา สิงห์โต', 'Agent', 'lunch', 'Team Beta', 15, 112000.00, 60, 0),
            ('A105', 'ธนาวุฒิ มีชัย', 'Agent', 'online', 'Team Gamma', 22, 146000.00, 68, 24),
            ('A106', 'ศิริพร บุญช่วย', 'Agent', 'offline', 'Team Gamma', 0, 0.00, 0, 30);

            INSERT INTO opportunities (id, title, company, contact_name, phone, value, stage, days) VALUES 
            ('OPP-301', 'สั่งซื้อกระเบื้องปูพื้นแกรนิตโต้ล็อตใหญ่', 'บจก. คอนสตรัคชั่นพลัส', 'คุณทวีเกียรติ', '081-452-XXXX', 125000.00, 'proposal', 3),
            ('OPP-302', 'อัปเกรดเครื่องมือช่างสำหรับแคมป์ไซต์', 'หจก. เมืองทองวัสดุก่อสร้าง', 'ช่างเอก', '089-771-XXXX', 48000.00, 'qualified', 5),
            ('OPP-303', 'จัดหาชุดสีทาภายนอกอาคารคอนโด', 'โครงการแกรนด์อเวนิว', 'คุณสมพงษ์ (PM)', '086-312-XXXX', 345000.00, 'new', 1),
            ('OPP-304', 'สั่งซื้อท่อ PVC และข้อต่อสำหรับโครงการหมู่บ้าน', 'บมจ. อนันตากลุ๊ป', 'คุณวิลาวัณย์', '083-294-XXXX', 670000.00, 'won', 12),
            ('OPP-305', 'ชุดสุขภัณฑ์หรูสไตล์สแกนดิเนเวียน 20 ชุด', 'โครงการพาสิโอเรสซิเดนซ์', 'คุณกิตติธัช', '082-551-XXXX', 180000.00, 'proposal', 4),
            ('OPP-306', 'จัดซื้อเครื่องปรับอากาศอุตสาหกรรม 5 เครื่อง', 'บจก. ยูเนี่ยนแฟคทอรี่', 'คุณสมชาย', '085-442-XXXX', 155000.00, 'lost', 8),
            ('OPP-307', 'สั่งโคมไฟสนามและระบบไฟโซล่าเซลล์', 'โรงแรมรอยัลพลาซ่า', 'คุณนันท์นภัส', '088-234-XXXX', 75000.00, 'qualified', 2);

            INSERT INTO customers (code, name, segment, province, last_order, last_contact, status) VALUES 
            ('CUST-801', 'วิวัฒน์ เอนจิเนียริ่ง', 'Platinum Tier', 'กรุงเทพฯ', '150,000 บาท', '2026-05-18', 'ปกติ'),
            ('CUST-802', 'ช่างพัฒน์ โครงหลังคาเหล็ก', 'SME Contractor', 'นนทบุรี', '32,000 บาท', '2026-05-19', 'ติดตามด่วน'),
            ('CUST-803', 'คุณพรเพ็ญ บ้านสวยทิวลิป', 'Retail Walk-In', 'ปทุมธานี', '8,500 บาท', '2026-05-10', 'ปกติ'),
            ('CUST-804', 'บจก. เจริญโภคภัณฑ์วิศวกรรม', 'Platinum Tier', 'ชลบุรี', '1,200,000 บาท', '2026-05-15', 'ปกติ'),
            ('CUST-805', 'รับเหมาครบวงจร ช่างณรงค์', 'VIP Builder', 'สมุทรปราการ', '95,000 บาท', '2026-05-20', 'ปกติ'),
            ('CUST-806', 'บจก. เอสเตท พร็อพเพอร์ตี้', 'VIP Builder', 'สมุทรสาคร', '420,000 บาท', '2026-05-14', 'ติดตามด่วน');

            INSERT INTO chat_messages (opportunity_id, sender, text, time) VALUES 
            ('OPP-301', 'client', 'สวัสดีครับ สรุปโควเทชั่นกระเบื้องแกรนิตโต้ที่ขอไปเรียบร้อยหรือยังครับ?', '10:14'),
            ('OPP-301', 'agent', 'สวัสดีค่ะคุณทวีเกียรติ กำลังให้แผนกคลังสินค้าเช็คสต็อกสีและจำนวนที่แน่นอนให้อยู่นะคะ', '10:16'),
            ('OPP-301', 'client', 'รบกวนหน่อยนะครับ พอดีต้องส่งเรื่องให้บอร์ดเซ็นอนุมัติจัดซื้อก่อนสี่โมงเย็นวันนี้', '10:18'),
            ('OPP-302', 'client', 'เครื่องตัดไฟของ Bosch รุ่นล่าสุดมีของแถมอะไรบ้างไหมครับ?', '09:30'),
            ('OPP-302', 'agent', 'สวัสดีค่ะช่างเอก สำหรับ Bosch ตัวใหม่จะแถมใบเลื่อยวงเดือนแท้ 2 ใบ พร้อมกล่องเคสแข็งฟรีค่ะ', '09:35');

            INSERT INTO permissions (role, allowed_menus) VALUES 
            ('role_a', '["home", "opportunity", "call", "case", "chat", "order", "monitor", "dashboard", "report"]'::jsonb),
            ('role_b', '["home", "opportunity", "call", "case", "chat", "order", "segment"]'::jsonb),
            ('role_c', '["home", "monitor", "dashboard", "report"]'::jsonb),
            ('admin', '["home", "opportunity", "call", "case", "chat", "order", "segment", "monitor", "dashboard", "report", "management"]'::jsonb);

            INSERT INTO social_configs (platform, config) VALUES
            ('facebook', '{"pageName": "Thai Watsadu Official", "pageId": "105678912345678", "accessToken": "EAAGm0PX4ZC...mock...token"}'::jsonb),
            ('line', '{"channelId": "1654321987", "channelSecret": "ab12cd34ef56gh78ij90kl12mn34op56", "accessToken": "eyJhbGciOiJIUzI1NiJ...mock...token"}'::jsonb);
        `);

        client.release();
        await pool.end();

        return NextResponse.json({ success: true, message: 'Database initialized successfully on Hostinger PostgreSQL!' });
    } catch (err) {
        await pool.end();
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
