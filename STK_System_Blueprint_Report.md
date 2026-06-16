# System Analysis Report: STK System Blueprint
**ระบบติดตามโอกาสขายและจัดการยอดขาย (Sales Tracking System - STK)**  
**จัดทำโดย:** agent_sa (Systems Analyst)  
**วันที่รายงาน:** 16 มิถุนายน 2026

---

## 📋 1. บทสรุปโครงการ (Executive Summary)
ระบบ **Sales Tracking System (STK)** (ภายใต้แอปพลิเคชันชื่อ `salestracking_web` เวอร์ชัน `1.0.1` Build `471`) คือแพลตฟอร์มภายในองค์กรของกลุ่มธุรกิจ **ไทวัสดุ (Thai Watsadu)** ใช้สำหรับให้พนักงานขายและผู้บริหารติดตามโอกาสทางการขาย (Sales Opportunities), วิเคราะห์ข้อมูลลูกค้า (Customer Segmentation), มอนิเตอร์การทำงานและสถานะออนไลน์ของพนักงานขายแบบ Real-time, บันทึกการโทรติดตาม (Call Tracking), และออกรายงานสรุปสำหรับผู้บริหาร

โปรเจกต์นี้ได้รับการพัฒนาขึ้นใหม่เป็นพิมพ์เขียวจำลองระบบ (System Blueprint & Simulation) ด้วย **Next.js 16 (React 19)** เพื่อจำลองพฤติกรรมดั้งเดิมของแอปพลิเคชันที่เป็น Flutter Web (Dart) ที่รันบนโปรดักชันหลัก โดยระบบ Next.js ตัวนี้ถูกออกแบบมาแบบ Dual-mode คือสามารถเชื่อมต่อ PostgreSQL ฐานข้อมูลจริง หรือสลับใช้งานผ่านระบบจำลองหน่วยความจำ (In-Memory Simulation Mode) ได้ทันทีเมื่อฐานข้อมูลออฟไลน์

---

## 📁 2. การวิเคราะห์โครงสร้างโฟลเดอร์ (Project Folder Structure)

โครงสร้างโฟลเดอร์ของโปรเจกต์ Next.js STK Blueprint ได้รับการจัดรูปแบบตามมาตรฐาน App Router ของ Next.js ดังนี้:

```text
c:\atgv\stk_blueprint\
├── app/                    # แหล่งรวม Routing และ API Endpoints (Next.js App Router)
│   ├── api/                # API Endpoints จำลองการทำงานร่วมกับฐานข้อมูล
│   │   ├── agents/         # ดึงข้อมูลพนักงานขาย และจำลองพฤติกรรมการทำงาน (Simulate Status)
│   │   ├── auth/           # จัดการ Login ยืนยันตัวตน (สอดคล้องกับ Azure AD Token)
│   │   ├── calls/          # บันทึกข้อมูลการโทรและประวัติการโทรติดตามโอกาสขาย
│   │   ├── chats/          # ดึงและส่งข้อความจำลองในแต่ละห้องสนทนาของโอกาสขาย
│   │   ├── customers/      # จัดการข้อมูลประวัติและเซกเมนต์ของลูกค้า
│   │   ├── dashboard/      # คำนวณสรุปข้อมูลประสิทธิภาพสะสม (Analytics)
│   │   ├── notifications/  # บริการดึง/อ่าน/ล้างรายการแจ้งเตือนในระบบ
│   │   ├── opportunities/  # จัดการโอกาสทางการขาย (Opportunity Pipeline)
│   │   ├── permissions/    # จัดการสิทธิ์การเข้าถึงเมนูตามบทบาทผู้ใช้
│   │   ├── social_config/  # ตั้งค่าโทเค็นและเพจเชื่อมต่อ Facebook/LINE OA
│   │   └── status/         # ตรวจสอบเวอร์ชันและสถานะเชื่อมต่อของฐานข้อมูล
│   ├── services/           # บริการ Webhook และการเชื่อมต่อระบบภายนอก (Integration)
│   │   ├── apexrest/       # จุดรับ Webhook จากระบบแชทภายนอก (Salesforce Apex)
│   │   └── oauth2/         # รองรับการขอและตรวจสอบโทเค็นตามมาตรฐาน OAuth 2.0
│   ├── favicon.ico         # ไอคอนระบบ
│   ├── globals.css         # สไตล์สไตล์ชีทหลักของระบบ
│   ├── layout.js           # โครงสร้าง Layout หลักของ Next.js
│   └── page.js             # หน้าอินเตอร์เฟส SPA หลัก (มีแท็บฟังก์ชันครบ 8 หน้าตาม Flutter)
├── lib/
│   └── db.js               # ตัวจัดการเชื่อมต่อ PostgreSQL (pg Pool) พร้อมระบบ In-Memory Fallback
├── public/                 # เก็บ Static Assets (รูปโลโก้, ไอคอน, Badges และภาพธงชาติ)
├── .env                    # คอนฟิกูเรชันเชื่อมฐานข้อมูล PostgreSQL ในโหมดโลคอล
├── .env.production         # คอนฟิกูเรชันสำหรับ Hostinger Production VPS (ใช้ตอน Deploy)
├── .gitignore              # ไฟล์ข้ามโฟลเดอร์ที่ไม่ต้องการบันทึกลง Git
├── AGENTS.md               # กฎการพัฒนาเฉพาะสำหรับ Next.js เวอร์ชันที่มีการอัปเดตพิเศษ
├── README.md               # คู่มือการติดตั้ง Next.js เบื้องต้น
├── STK_System_Blueprint.docx # คู่มือพิมพ์เขียวสถาปัตยกรรมระบบในรูปแบบเอกสาร Word
├── STK_System_Blueprint.md   # ไฟล์ Reverse Engineering เอกสารสรุป API และ Stack ดั้งเดิม
├── STK_User_Manual.docx    # คู่มือผู้ใช้ระบบ STK ดั้งเดิม
├── eslint.config.mjs       # ตั้งค่าการตรวจสอบไวยากรณ์และคุณภาพโค้ด
├── package.json            # ไฟล์ระบุสคริปต์Dependenciesและข้อมูลโปรเจกต์
├── server.js               # สคริปต์สคราตช์สำหรับ Custom HTTP Server เพื่อเริ่ม Next.js บน Production
└── package-hostinger.js    # สคริปต์สำหรับแพ็คไฟล์ Build ส่งไปยัง Hostinger VPS (.zip)
```

---

## 🌐 3. สถาปัตยกรรมและสิทธิ์ผู้ใช้งาน (System Architecture & Security)

### 3.1 สถาปัตยกรรมแอปพลิเคชัน (3-Tier & Dual-Mode DB Engine)
ระบบจำลองใหม่นี้ทำงานเป็น **3-Tier Architecture**:
1. **Presentation Layer:** Next.js หน้าจอแบบ SPA ใน `app/page.js` แสดงผลคอมโพเนนต์และการทำ Routing แบบ Hash-based (`#/tab`) คล้ายคลึงกับฝั่ง Flutter ดั้งเดิม
2. **Application API Layer:** โฮสต์อยู่บน Next.js Route Handlers (`app/api/*`) คอยรับส่งข้อมูลฟอร์แมต JSON 
3. **Database Layer (Dual-Mode):** 
   - **PostgreSQL Mode:** เมื่อเปิดใช้งาน และกำหนดรหัสผ่านใน `.env` สมบูรณ์ ระบบจะส่งคำสั่ง SQL ไปยัง PostgreSQL ในฐานข้อมูล `stk_sales`
   - **In-Memory Fallback Mode:** หากไม่พบฐานข้อมูลหรือเชื่อมต่อล้มเหลว ระบบจะทำการสลับไปใช้ **`IN_MEMORY_DB`** ที่มีชุดข้อมูลจำลองอย่างเต็มรูปแบบโดยอัตโนมัติ ทำให้เว็บทำงานต่อได้โดยไม่แครช

### 3.2 สิทธิ์การเข้าถึงข้อมูลตามบทบาท (Role Permission Matrix)
ระบบ STK กำหนดบทบาทในการเข้าใช้งานหลักออกเป็น 4 ระดับ (ควบคุมการแสดงผลของเมนูผ่านทาง API `/api/permissions`):

| หน้าเมนู / ฟังก์ชัน | Role A (Manager) | Role B (Agent) | Role C (Viewer) | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Home / KPI** | ✓ | ✓ | ✓ | ✓ |
| **Opportunity List** | ✓ | ✓ | — | ✓ |
| **Opportunity Call** | — | ✓ | — | ✓ |
| **Customer Segment** | — | ✓ | — | ✓ |
| **Monitor** | ✓ | — | ✓ | ✓ |
| **Dashboard** | ✓ | — | ✓ | ✓ |
| **Reports** | ✓ | — | ✓ | ✓ |
| **Management** | — | — | — | ✓ |

* **Role A (Manager):** มีหน้าที่กำกับดูแลทีมขาย ติดตามสถานะพนักงาน และวิเคราะห์สรุปผล
* **Role B (Agent):** พนักงานขายหน้างาน มีหน้าที่หลักในการโทรติดต่อ โน้มน้าวปิดยอดขาย และจัดกลุ่มเซกเมนต์ลูกค้า
* **Role C (Viewer):** ผู้บริหารระดับบน เน้นดูเฉพาะรายงานภาพรวม บัญชี และสถานะทีมขายผ่านมอนิเตอร์ (ไม่สามารถแก้ไขข้อมูลใดๆ ได้)
* **Admin:** สิทธิ์สูงสุด สามารถจัดการข้อมูล และเปลี่ยนการตั้งค่าระบบได้ทุกอย่าง

---

## 🗄️ 4. แบบจำลองข้อมูลระบบ (Database & Simulation Schema)

ตามที่ออกแบบไว้ในไฟล์ `lib/db.js` โครงสร้างข้อมูลจำลองประกอบด้วยตารางข้อมูลสำคัญ 7 ส่วนหลักดังนี้:

### 4.1 ตาราง `users` (ผู้ใช้งานระบบ)
เก็บข้อมูลบัญชีผู้ใช้งานระบบและบทบาทหน้าที่

* `id` (INTEGER, PRIMARY KEY) - รหัสผู้ใช้
* `username` (VARCHAR) - อีเมลบริษัท (ใช้ผ่าน Azure AD B2C SSO)
* `name` (VARCHAR) - ชื่อ-นามสกุลพนักงาน
* `role` (VARCHAR) - ระดับสิทธิ์ ได้แก่ `role_a` (Manager), `role_b` (Agent), `role_c` (Viewer), `admin`

### 4.2 ตาราง `agents` (ข้อมูลการปฏิบัติงานของพนักงานขาย)
เก็บสถิติและสถานะการทำงานจริงของพนักงานขายในทีม

* `id` (VARCHAR, PRIMARY KEY) - รหัสพนักงานขาย (เช่น A101)
* `name` (VARCHAR) - ชื่อพนักงานขาย
* `role` (VARCHAR) - ตำแหน่งงาน (เช่น Agent)
* `status` (VARCHAR) - สถานะปัจจุบัน: `online`, `break`, `lunch`, `offline`
* `team` (VARCHAR) - ชื่อทีมที่สังกัด (เช่น Team Alpha)
* `calls` (INTEGER) - จำนวนการโทรสะสมในวันปัจจุบัน
* `sales` (NUMERIC) - ยอดขายสะสมที่ทำได้
* `conversion` (NUMERIC) - อัตราการปิดการขายสำเร็จ (%)
* `break_remain` (INTEGER) - เวลาพักเบรกที่เหลืออยู่ (นาที)

### 4.3 ตาราง `opportunities` (โอกาสทางการขาย)
เก็บบันทึกเป้าหมายการขายที่คาดหวังในท่อส่งผลงาน (Pipeline)

* `id` (VARCHAR, PRIMARY KEY) - รหัสโอกาสทางการขาย (เช่น OPP-301)
* `title` (VARCHAR) - หัวข้อโปรเจกต์/โอกาสขาย
* `company` (VARCHAR) - ชื่อบริษัทลูกค้า
* `contact_name` (VARCHAR) - ผู้ติดต่อ
* `phone` (VARCHAR) - เบอร์โทรศัพท์ลูกค้า
* `value` (NUMERIC) - มูลค่าคาดการณ์โครงการ
* `stage` (VARCHAR) - ขั้นตอนโอกาสขาย: `new` (ใหม่), `qualified` (คัดกรองแล้ว), `proposal` (เสนอราคา), `won` (ชนะการขาย), `lost` (แพ้การขาย)
* `days` (INTEGER) - จำนวนวันที่เปิดโอกาสขายนี้ค้างไว้

### 4.4 ตาราง `customers` (ข้อมูลลูกค้าและเซกเมนต์)
ข้อมูลโปรไฟล์ลูกค้าสำหรับการทำเป้าหมายตลาดเฉพาะกลุ่ม

* `code` (VARCHAR, PRIMARY KEY) - รหัสลูกค้า (เช่น CUST-801)
* `name` (VARCHAR) - ชื่อร้านค้า/ลูกค้า
* `segment` (VARCHAR) - กลุ่ม Tier ลูกค้า: `Platinum Tier`, `VIP Builder`, `SME Contractor`, `Retail Walk-In`
* `province` (VARCHAR) - จังหวัดที่ตั้งลูกค้า
* `last_order` (VARCHAR) - ยอดการซื้อสินค้าล่าสุด
* `last_contact` (VARCHAR) - วันที่พนักงานโทรหาครั้งล่าสุด (YYYY-MM-DD)
* `status` (VARCHAR) - สถานะการติดตาม: `ปกติ`, `ติดตามด่วน`

### 4.5 ตาราง `chat_messages` (ข้อความสนทนา)
บันทึกประวัติการพูดคุยกับลูกค้าแยกรายโอกาสขาย

* `id` (INTEGER, PRIMARY KEY) - รหัสข้อความ
* `opportunity_id` (VARCHAR) - รหัสโอกาสขายที่เชื่อมโยง
* `sender` (VARCHAR) - ผู้ส่งข้อความ: `client` (ลูกค้า) หรือ `agent` (พนักงานขาย)
* `text` (TEXT) - เนื้อหาการสนทนา
* `time` (VARCHAR) - เวลาส่งข้อความ (HH:MM)

### 4.6 ตาราง `social_config` (ตั้งค่าโทเค็นเครือข่ายสังคม)
จัดเก็บคีย์ตั้งค่าช่องทางการรับข้อมูลลูกค้าภายนอก

* `facebook`: บันทึก `pageName`, `pageId`, และ `accessToken`
* `line`: บันทึก `channelId`, `channelSecret`, และ `accessToken`

### 4.7 ตาราง `permissions` (สิทธิ์เมนู)
* แผนผังจับคู่ Role แต่ละประเภทกับรายการสิทธิ์เมนูที่เปิดให้เข้าถึงได้

---

## 📊 5. รายละเอียดฟังก์ชันระบบ (Functional Analysis)

1. **หน้าหลัก / KPI (Home):** แสดงผลสรุปยอดขาย การโทรสะสม และจำนวนโอกาสทางการขายทั้งหมดในรูปแบบการ์ด KPI สีสันสะดุดตา เพื่อประเมินผลงานได้อย่างรวดเร็ว
2. **การติดตามโอกาสขาย (Opportunity Pipeline):** บอร์ดสรุปสถานะโอกาสขาย และตารางรายการขาย สามารถเลือกกรองและค้นหาโอกาสขายได้สะดวก
3. **ระบบจำลองการโทร (Call Simulator):** พนักงานขายจำลองการกดโทรหาลูกค้าและจดบันทึกประเด็นการสนทนา (Call Notes) พร้อมประวัติข้อความแชทจำลองที่คุยผ่านแชทแชนเนลในหน้าเดียวกัน
4. **การแบ่งกลุ่มลูกค้า (Customer Segmentation):** ค้นหาและคัดกรองลูกค้าตามกลุ่มจังหวัด, จัดระดับกลุ่มความสำคัญลูกค้า (เช่น Platinum Tier, VIP) และคัดเลือกร้านค้าที่จำเป็นต้อง "ติดตามด่วน"
5. **การมอนิเตอร์ออนไลน์ (Real-time Agent Monitor):** ระบบสำหรับผู้จัดการเพื่อคอยดูสถานะการออนไลน์การเบรกของพนักงานขาย เพื่อกระจายงานได้อย่างมีประสิทธิภาพสูงสุด
6. **การออกรายงานสรุปข้อมูล (Reports & Dashboard):** การดึงรายงานผ่าน Syncfusion Grid สรุปยอดขายตามผู้รับผิดชอบ และการส่งออกข้อมูล

---

## 🚀 6. การแพ็คเกจและการนำระบบไป Deploy (Packaging & Deploy Guide)

โครงการนี้มีระบบช่วยเหลือสำหรับเตรียมไฟล์เพื่อนำขึ้นไป Deploy บน Hostinger VPS ด้วยวิธี **Next.js Standalone Build**:

1. **การ Build:** เมื่อรันคำสั่ง `npm run build` จะทำทรานส์ไพล์แอปเป็นสแตนดาร์ดและสร้างโฟลเดอร์ไฟล์สแตนด์อโลนไว้ที่ `.next/standalone`
2. **การรันสคริปต์สเปเชียลแพ็คเกจ:**
   ```bash
   npm run build:hostinger
   ```
   สคริปต์ `package-hostinger.js` จะเข้ามารับหน้าที่ต่อดังนี้:
   - คัดลอกโฟลเดอร์ `public` และโฟลเดอร์ `.next/static` ไปวางในโฟลเดอร์สแตนด์อโลน เพื่อให้การบริการไฟล์รูปภาพและสไตล์ชีททำงานได้อย่างเสถียร
   - คัดลอกไฟล์ `.env.production` ไปบันทึกเป็นไฟล์ `.env` ของโปรดักชัน
   - เรียกใช้งานคำสั่ง PowerShell `Compress-Archive` เพื่อแพ็คของทั้งหมดในโฟลเดอร์สแตนด์อโลนบีบอัดเป็น **`hostinger_deploy.zip`**
3. **การนำไปติดตั้งบน VPS:**
   - อัปโหลดไฟล์ `hostinger_deploy.zip` ไปยัง Hostinger VPS 
   - แตกไฟล์ในไดเรกทอรีเป้าหมาย
   - สั่งสตาร์ทระบบโดยใช้ PM2 ครอบสคริปต์ `server.js` (ซึ่งทำหน้าที่จัดการพอร์ตเชื่อมต่อและรับ Request):
     ```bash
     pm2 start server.js --name "stk-blueprint"
     ```
   - แอปจะพร้อมทำงานแบบมีระบบช่วยจัดการผ่าน Reverse Proxy (เช่น Nginx) ทันที
