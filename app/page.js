"use client";

import React, { useState, useEffect, useRef } from "react";

// ==========================================================================
// LOCAL STATE DEFAULTS (Resilient Dual-Mode Fallback data)
// ==========================================================================
const LOCAL_STATE_PERMISSIONS = {
  role_a: ["home", "opportunity", "call", "case", "chat", "order", "monitor", "dashboard", "report"],
  role_b: ["home", "opportunity", "call", "case", "chat", "order", "segment"],
  role_c: ["home", "monitor", "dashboard", "report"],
  admin: ["home", "opportunity", "call", "case", "chat", "order", "segment", "monitor", "dashboard", "report", "management"]
};

const LOCAL_STATE_AGENTS = [
  { id: "A101", name: "วิชัย รัตนวงศ์", role: "Agent", status: "online", team: "Team Alpha", calls: 24, sales: 185000, conversion: 78, break_remain: 30 },
  { id: "A102", name: "นภา สุขดี", role: "Agent", status: "break", team: "Team Alpha", calls: 18, sales: 94000, conversion: 52, break_remain: 15 },
  { id: "A103", name: "สมเกียรติ ปัญญา", role: "Agent", status: "online", team: "Team Beta", calls: 31, sales: 320000, conversion: 84, break_remain: 30 },
  { id: "A104", name: "พัชรา สิงห์โต", role: "Agent", status: "lunch", team: "Team Beta", calls: 15, sales: 112000, conversion: 60, break_remain: 0 },
  { id: "A105", name: "ธนาวุฒิ มีชัย", role: "Agent", status: "online", team: "Team Gamma", calls: 22, sales: 146000, conversion: 68, break_remain: 24 },
  { id: "A106", name: "ศิริพร บุญช่วย", role: "Agent", status: "offline", team: "Team Gamma", calls: 0, sales: 0, conversion: 0, break_remain: 30 }
];

const LOCAL_STATE_OPPORTUNITIES = [
  { id: "OPP-301", title: "สั่งซื้อกระเบื้องปูพื้นแกรนิตโต้ล็อตใหญ่", company: "บจก. คอนสตรัคชั่นพลัส", contact_name: "คุณทวีเกียรติ", phone: "081-452-XXXX", value: 125000, stage: "proposal", days: 3 },
  { id: "OPP-302", title: "อัปเกรดเครื่องมือช่างสำหรับแคมป์ไซต์", company: "หจก. เมืองทองวัสดุก่อสร้าง", contact_name: "ช่างเอก", phone: "089-771-XXXX", value: 48000, stage: "qualified", days: 5 },
  { id: "OPP-303", title: "จัดหาชุดสีทาภายนอกอาคารคอนโด", company: "โครงการแกรนด์อเวนิว", contact_name: "คุณสมพงษ์ (PM)", phone: "086-312-XXXX", value: 345000, stage: "new", days: 1 },
  { id: "OPP-304", title: "สั่งซื้อท่อ PVC และข้อต่อสำหรับโครงการหมู่บ้าน", company: "บมจ. อนันตากลุ๊ป", contact_name: "คุณวิลาวัณย์", phone: "083-294-XXXX", value: 670000, stage: "won", days: 12 },
  { id: "OPP-305", title: "ชุดสุขภัณฑ์หรูสไตล์สแกนดิเนเวียน 20 ชุด", company: "โครงการพาสิโอเรสซิเดนซ์", contact_name: "คุณกิตติธัช", phone: "082-551-XXXX", value: 180000, stage: "proposal", days: 4 },
  { id: "OPP-306", title: "จัดซื้อเครื่องปรับอากาศอุตสาหกรรม 5 เครื่อง", company: "บจก. ยูเนี่ยนแฟคทอรี่", contact_name: "คุณสมชาย", phone: "085-442-XXXX", value: 155000, stage: "lost", days: 8 },
  { id: "OPP-307", title: "สั่งโคมไฟสนามและระบบไฟโซล่าเซลล์", company: "โรงแรมรอยัลพลาซ่า", contact_name: "คุณนันท์นภัส", phone: "088-234-XXXX", value: 75000, stage: "qualified", days: 2 }
];

const LOCAL_STATE_CUSTOMERS = [
  { code: "cm26051801", name: "วิวัฒน์ เอนจิเนียริ่ง", segment: "Platinum Tier", province: "กรุงเทพฯ", last_order: "150,000 บาท", last_contact: "2026-05-18", status: "ปกติ" },
  { code: "cm26051901", name: "ช่างพัฒน์ โครงหลังคาเหล็ก", segment: "SME Contractor", province: "นนทบุรี", last_order: "32,000 บาท", last_contact: "2026-05-19", status: "ติดตามด่วน" },
  { code: "cm26051001", name: "คุณพรเพ็ญ บ้านสวยทิวลิป", segment: "Retail Walk-In", province: "ปทุมธานี", last_order: "8,500 บาท", last_contact: "2026-05-10", status: "ปกติ" },
  { code: "cm26051501", name: "บจก. เจริญโภคภัณฑ์วิศวกรรม", segment: "Platinum Tier", province: "ชลบุรี", last_order: "1,200,000 บาท", last_contact: "2026-05-15", status: "ปกติ" },
  { code: "cm26052001", name: "รับเหมาครบวงจร ช่างณรงค์", segment: "VIP Builder", province: "สมุทรปราการ", last_order: "95,000 บาท", last_contact: "2026-05-20", status: "ปกติ" },
  { code: "cm26051401", name: "บจก. เอสเตท พร็อพเพอร์ตี้", segment: "VIP Builder", province: "สมุทรสาคร", last_order: "420,000 บาท", last_contact: "2026-05-14", status: "ติดตามด่วน" }
];

const LOCAL_STATE_CASES = [
  { id: "cs26061801", case_number: "cs26061801", account_name: "Sales103 Wellermoz", subject: "Re: ค้นหาตัวแทนจำหน่ายในพื้นที่ | อุปกรณ์อัจฉริยะสวมใส่ได้ (Smart Wearables) - ส่งตรงจากโรงงาน", type: "Complaint", case_reason: "Product", root_cause: "Product Quality", priority: "Medium", status: "new", pending_type: null, pending_status: "", case_origin: "Email", case_record_type: "CDS", bu: "CDS", owner: "CTO ADMIN", contact_name: "คุณสมศักดิ์ รักเรียน", contact_phone: "081-234-XXXX", contact_email: "somsak@example.com", is_vip: false, chat_channel_name: "", chat_status_flag: "", chat_wait_minutes: 0.00, parent_case: null, created_at: "2026-06-18T09:00:00Z", updated_at: "2026-06-18T09:30:00Z", chatter_posts: [{ user: "CTO ADMIN", avatar: null, action: "Case created", timestamp: "10m ago", details: { account_name: "Sales103 Wellermoz", case_number: "cs26061801", case_record_type: "CDS", priority: "Medium", subject: "Re: ค้นหาตัวแทนจำหน่ายในพื้นที่ | อุปกรณ์อัจฉริยะสวมใส่ได้ (Smart Wearables) - ส่งตรงจากโรงงาน" } }] },
  { id: "cs26061802", case_number: "cs26061802", account_name: "Benji Corp", subject: "สอบถามราคาเหล็กเส้นสำหรับงานก่อสร้าง", type: "Inquiry", case_reason: "Service", root_cause: null, priority: "Medium", status: "new", pending_type: null, pending_status: "", case_origin: "LINE", case_record_type: "CDS", bu: "CDS", owner: null, contact_name: "คุณพรเพ็ญ ดีงาม", contact_phone: "089-456-XXXX", contact_email: "pornpen@example.com", is_vip: true, chat_channel_name: "Line", chat_status_flag: "Active", chat_wait_minutes: 2.50, parent_case: null, created_at: "2026-06-18T10:00:00Z", updated_at: "2026-06-18T10:00:00Z", chatter_posts: [{ user: "System", avatar: null, action: "Case created", timestamp: "5m ago", details: { account_name: "Benji Corp", case_number: "cs26061802", case_record_type: "CDS", priority: "Medium", subject: "สอบถามราคาเหล็กเส้นสำหรับงานก่อสร้าง" } }] },
  { id: "cs26061601", case_number: "cs26061601", account_name: "บจก. เจริญโภคภัณฑ์วิศวกรรม", subject: "ติดตามสถานะการจัดส่งคำสั่งซื้อ #or26061501", type: "Complaint", case_reason: "Delivery", root_cause: "Delivery", priority: "Critical", status: "pending-customer", pending_type: "Pending Customer", pending_status: "Pending Customer", case_origin: "Email", case_record_type: "CDS", bu: "CDS", owner: "นภา สุขดี", contact_name: "บจก. เจริญโภคภัณฑ์วิศวกรรม", contact_phone: "083-294-XXXX", contact_email: "charoen@example.com", is_vip: true, chat_channel_name: "", chat_status_flag: "", chat_wait_minutes: 0, parent_case: "cs26061801", created_at: "2026-06-16T14:00:00Z", updated_at: "2026-06-17T16:00:00Z", chatter_posts: [{ user: "นภา สุขดี", avatar: null, action: "Status changed", timestamp: "1d ago", details: { status: "pending-customer" } }, { user: "System", avatar: null, action: "Case created", timestamp: "2d ago", details: { account_name: "บจก. เจริญโภคภัณฑ์วิศวกรรม", case_number: "cs26061601", case_record_type: "CDS", priority: "Critical", subject: "ติดตามสถานะการจัดส่งคำสั่งซื้อ #or26061501" } }] },
  { id: "cs26061701", case_number: "cs26061701", account_name: "คุณกิตติธัช", subject: "แจ้งปัญหาระบบชำระเงินออนไลน์ล้มเหลว", type: "Complaint", case_reason: "Service", root_cause: "Service", priority: "High", status: "pending-internal", pending_type: "Pending Internal", pending_status: "Pending Internal", case_origin: "Telephone", case_record_type: "CDS", bu: "CDS", owner: "สมเกียรติ ปัญญา", contact_name: "คุณกิตติธัช", contact_phone: "082-551-XXXX", contact_email: "kittithat@example.com", is_vip: false, chat_channel_name: "Telephone", chat_status_flag: "", chat_wait_minutes: 0, parent_case: null, created_at: "2026-06-17T08:00:00Z", updated_at: "2026-06-18T08:00:00Z", chatter_posts: [{ user: "สมเกียรติ ปัญญา", avatar: null, action: "Case updated", timestamp: "2h ago", details: { status: "pending-internal" } }] },
  { id: "cs26061401", case_number: "cs26061401", account_name: "คุณวิลาวัณย์", subject: "เคลมประกันสินค้า — เครื่องปรับอากาศไม่เย็น", type: "Complaint", case_reason: "Product", root_cause: "Product Quality", priority: "Medium", status: "solved", pending_type: null, pending_status: "", case_origin: "Facebook", case_record_type: "CDS", bu: "CDS", owner: "ธนาวุฒิ มีชัย", contact_name: "คุณวิลาวัณย์", contact_phone: "085-442-XXXX", contact_email: "wilawan@example.com", is_vip: false, chat_channel_name: "Facebook", chat_status_flag: "Closed", chat_wait_minutes: 0, parent_case: null, created_at: "2026-06-14T10:00:00Z", updated_at: "2026-06-18T07:00:00Z", chatter_posts: [{ user: "ธนาวุฒิ มีชัย", avatar: null, action: "Case resolved", timestamp: "3h ago", details: {} }] },
  { id: "cs26061001", case_number: "cs26061001", account_name: "รับเหมาครบวงจร ช่างณรงค์", subject: "ขอคืนสินค้า — สั่งซื้อผิดรุ่น", type: "Complaint", case_reason: "Product", root_cause: "Product Quality", priority: "Low", status: "closed", pending_type: null, pending_status: "", case_origin: "LINE", case_record_type: "CDS", bu: "CDS", owner: "พัชรา สิงห์โต", contact_name: "รับเหมาครบวงจร ช่างณรงค์", contact_phone: "088-123-XXXX", contact_email: "narongchai@example.com", is_vip: false, chat_channel_name: "Line", chat_status_flag: "Closed", chat_wait_minutes: 0, parent_case: null, created_at: "2026-06-10T09:00:00Z", updated_at: "2026-06-15T17:00:00Z", chatter_posts: [] },
  { id: "cs26061803", case_number: "cs26061803", account_name: "Unknown Bot", subject: "Spam — ข้อความโฆษณาจาก Bot", type: "Complaint", case_reason: "Service", root_cause: null, priority: "Low", status: "spam", pending_type: null, pending_status: "", case_origin: "Facebook", case_record_type: "CDS", bu: "CDS", owner: null, contact_name: "Unknown Bot", contact_phone: "", contact_email: "", is_vip: false, chat_channel_name: "", chat_status_flag: "", chat_wait_minutes: 0, parent_case: null, created_at: "2026-06-18T06:00:00Z", updated_at: "2026-06-18T06:00:00Z", chatter_posts: [] },
  { id: "cs26061804", case_number: "cs26061804", account_name: "คุณสมศักดิ์ รักเรียน", subject: "สอบถามโปรโมชั่นกระเบื้อง — ซ้ำกับ cs26061801", type: "Complaint", case_reason: "Product", root_cause: null, priority: "Low", status: "duplicate", pending_type: null, pending_status: "", case_origin: "LINE", case_record_type: "CDS", bu: "CDS", owner: null, contact_name: "คุณสมศักดิ์ รักเรียน", contact_phone: "081-234-XXXX", contact_email: "somsak@example.com", is_vip: false, chat_channel_name: "", chat_status_flag: "", chat_wait_minutes: 0, parent_case: "cs26061801", created_at: "2026-06-18T09:05:00Z", updated_at: "2026-06-18T09:05:00Z", chatter_posts: [] }
];

const LOCAL_STATE_CHAT_SESSIONS = [
  { id: "ct26052601", customer_name: "Benji", channel: "line", status: "active", unread: 2, last_message: "ติดต่อแอดมินค่ะ", last_time: "2m ago", account: "Benji Corp", phone: "081-234-XXXX", opportunity_id: "OPP-301", case_id: null, messages: [
    { sender: "customer", text: "สวัสดีค่ะ สนใจสินค้า Smart Wearables", time: "26-May-26 15:45" },
    { sender: "bot", text: "(CENNI เป็น AI ChatBot ที่อาจให้ข้อมูลหรือคำตอบคลาดเคลื่อนได้ในบางครั้ง)", time: "26-May-26 15:45" },
    { sender: "bot", text: "สิ่งที่ฉันไม่สามารถทำได้:\n⛔ แจ้งรายละเอียดโปรโมชั่น คำสั่ง หรือจำนวนสินค้าคงเหลือ โดยลูกค้าสามารถสอบถามกับพนักงานในแอพที่รีไดยตรงได้ เพียงแจ้ง CENNI ว่าต้องการสอบถามพนักงานได้เลยค่ะ", time: "26-May-26 15:46" },
    { sender: "customer", text: "ติดต่อแอดมินค่ะ", time: "26-May-26 15:49" },
    { sender: "agent", text: "CENNI ขอส่งต่อการสนทนาของเราให้กับทีมบริการลูกค้า เพื่อช่วยเหลือคุณอย่างเหมาะสมนะ 🌟 โปรดรอสักครู่นะคะ", time: "26-May-26 15:49" }
  ] },
  { id: "ct26061801", customer_name: "คุณสมศักดิ์", channel: "facebook", status: "active", unread: 0, last_message: "ขอบคุณครับ รอติดตาม", last_time: "15m ago", account: "Sales103 Wellermoz", phone: "081-234-XXXX", opportunity_id: null, case_id: "cs26061801", messages: [
    { sender: "customer", text: "สอบถามเรื่อง Smart Wearables ที่สั่งไปครับ", time: "18-Jun-26 09:00" },
    { sender: "agent", text: "สวัสดีครับ คุณสมศักดิ์ ขอตรวจสอบข้อมูลให้สักครู่นะครับ", time: "18-Jun-26 09:05" },
    { sender: "agent", text: "ตรวจสอบแล้วครับ สินค้าอยู่ระหว่างจัดส่ง คาดว่าจะถึงภายใน 2-3 วันทำการ", time: "18-Jun-26 09:10" },
    { sender: "customer", text: "ขอบคุณครับ รอติดตาม", time: "18-Jun-26 09:12" }
  ] },
  { id: "ct26061802", customer_name: "คุณวิลาวัณย์", channel: "facebook", status: "waiting", unread: 1, last_message: "รบกวนช่วยเช็คสถานะเคลมให้หน่อยค่ะ", last_time: "30m ago", account: "คุณวิลาวัณย์", phone: "085-442-XXXX", opportunity_id: null, case_id: "cs26061401", messages: [
    { sender: "customer", text: "รบกวนช่วยเช็คสถานะเคลมให้หน่อยค่ะ", time: "18-Jun-26 08:30" }
  ] },
  { id: "ct26061803", customer_name: "คุณพรเพ็ญ", channel: "line", status: "active", unread: 0, last_message: "ได้เลยค่ะ ส่งใบเสนอราคาให้ทาง email นะคะ", last_time: "1h ago", account: "Benji Corp", phone: "089-456-XXXX", opportunity_id: "OPP-302", case_id: null, messages: [
    { sender: "customer", text: "สอบถามราคาเหล็กเส้นสำหรับงานก่อสร้างค่ะ", time: "18-Jun-26 08:00" },
    { sender: "agent", text: "สวัสดีค่ะ คุณพรเพ็ญ ยินดีให้บริการค่ะ ต้องการขนาดไหนคะ?", time: "18-Jun-26 08:05" },
    { sender: "customer", text: "ขนาด 12mm ประมาณ 200 เส้นค่ะ", time: "18-Jun-26 08:10" },
    { sender: "agent", text: "ได้เลยค่ะ ส่งใบเสนอราคาให้ทาง email นะคะ", time: "18-Jun-26 08:15" }
  ] },
  { id: "ct26061804", customer_name: "ช่างณรงค์", channel: "line", status: "closed", unread: 0, last_message: "ปิดการสนทนา", last_time: "2h ago", account: "รับเหมาครบวงจร ช่างณรงค์", phone: "088-123-XXXX", opportunity_id: null, case_id: "cs26061001", messages: [
    { sender: "system", text: "Chat closed by agent", time: "18-Jun-26 07:00" }
  ] }
];

const LOCAL_STATE_BOT_RULES = [
  { id: "BOT-001", name: "(OPT) Confirm DA", enabled: true, keywords: ["DA&S07", "DA&S08", "DA&S06", "DA&S11", "DA&S10", "DA&S111", "DA&S14", "DA&S25", "DA&S12", "DA&S28", "DA&S29", "DA&S17", "DA&S18", "DA&S34", "DA&S35", "DA&S13", "Confirm-DA"], similar: ["Confirm-DA"], channels: ["facebook", "line"], context_in: "*", context_out: "contactadmin", queue_name: "CDS - Default", opportunity_name: "Confirm-DA", auto_reply: "ไม่ตอบกลับ", expanded: true },
  { id: "BOT-002", name: "Welcome Message", enabled: true, keywords: ["สวัสดี", "hello", "hi", "ต้องการสอบถาม"], similar: [], channels: ["facebook", "line", "instagram"], context_in: "*", context_out: "welcome", queue_name: "CDS - Default", opportunity_name: "", auto_reply: "สวัสดีค่ะ ยินดีต้อนรับสู่ Central Chat & Shop 🌟", expanded: false },
  { id: "BOT-003", name: "บทสนทนาที่บอทตอบไม่ได้", enabled: true, keywords: [], similar: [], channels: ["facebook", "line", "instagram"], context_in: "*", context_out: "fallback", queue_name: "CDS - Default", opportunity_name: "", auto_reply: "", expanded: false }
];

const LOCAL_STATE_ORDERS = [
  { id: "or26061501", customer: "บจก. คอนสตรัคชั่นพลัส", items: "กระเบื้องปูพื้นแกรนิตโต้ 200 ตร.ม.", amount: 125000, status: "paid", payment_method: "โอนธนาคาร", pos_ticket: "POS-9981", created_at: "2026-06-15", updated_at: "2026-06-16" },
  { id: "or26061701", customer: "หจก. เมืองทองวัสดุก่อสร้าง", items: "ชุดเครื่องมือช่างอุตสาหกรรม", amount: 48000, status: "pending-payment", payment_method: "บัตรเครดิต", pos_ticket: "", created_at: "2026-06-17", updated_at: "2026-06-17" },
  { id: "or26061801", customer: "โครงการแกรนด์อเวนิว", items: "สีทาภายนอก 100 ถัง + น้ำยารองพื้น", amount: 345000, status: "draft", payment_method: "", pos_ticket: "", created_at: "2026-06-18", updated_at: "2026-06-18" },
  { id: "or26061201", customer: "บมจ. อนันตากลุ๊ป", items: "ท่อ PVC ขนาด 4 นิ้ว 500 ท่อ + ข้อต่อ", amount: 670000, status: "printed", payment_method: "เครดิต 30 วัน", pos_ticket: "POS-9975", created_at: "2026-06-12", updated_at: "2026-06-18" },
  { id: "or26061001", customer: "โครงการพาสิโอเรสซิเดนซ์", items: "ชุดสุขภัณฑ์สแกนดิเนเวียน 20 ชุด", amount: 180000, status: "void", payment_method: "โอนธนาคาร", pos_ticket: "", created_at: "2026-06-10", updated_at: "2026-06-14" },
  { id: "or26060801", customer: "รับเหมาครบวงจร ช่างณรงค์", items: "โคมไฟสนาม Solar Cell 30 ชุด", amount: 75000, status: "cancelled", payment_method: "", pos_ticket: "", created_at: "2026-06-08", updated_at: "2026-06-09" }
];

// PDPA Helper: Mask sensitive data based on user role
const maskPDPA = (value, userRole) => {
  if (!value) return "—";
  if (["role_a", "admin"].includes(userRole)) return value;
  if (value.includes("@")) return value.replace(/(.{2})(.*)(@.*)/, "$1***$3");
  return value.replace(/(.{3})(.*)(.{4})/, "$1-***-$3");
};

const MENU_TITLES = {
  home: { title: "หน้าหลัก / KPI", icon: "fa-solid fa-house", href: "#home" },
  opportunity: { title: "โอกาสขาย", icon: "fa-solid fa-folder-open", href: "#opportunity" },
  call: { title: "ติดตามลูกค้า (Call)", icon: "fa-solid fa-phone-volume", href: "#call" },
  case: { title: "Case Management", icon: "fa-solid fa-ticket", href: "#case" },
  chat: { title: "Chat & Shop", icon: "fa-solid fa-comments", href: "#chat" },
  order: { title: "Order Management", icon: "fa-solid fa-cart-shopping", href: "#order" },
  segment: { title: "เซกเมนต์ลูกค้า", icon: "fa-solid fa-users-viewfinder", href: "#segment" },
  monitor: { title: "มอนิเตอร์เจ้าหน้าที่", icon: "fa-solid fa-desktop", href: "#monitor" },
  dashboard: { title: "แดชบอร์ดสรุปยอด", icon: "fa-solid fa-chart-pie", href: "#dashboard" },
  report: { title: "รายงานภาพรวม", icon: "fa-solid fa-file-invoice-dollar", href: "#report" },
  management: { title: "ตั้งค่าระบบ", icon: "fa-solid fa-sliders", href: "#management" }
};

export default function Home() {
  // ==========================================================================
  // REACT STATES
  // ==========================================================================
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState({ name: "สมชาย ใจดี", role: "role_a", status: "online" });
  const [activeTab, setActiveTab] = useState("home");
  const [serverConnected, setServerConnected] = useState(false);
  const [serverMode, setServerMode] = useState("Mock In-Memory");

  // Feature 1: Email Compose states
  const [emailForm, setEmailForm] = useState({ to: '', cc: '', subject: '', body: '' });
  const [emailSending, setEmailSending] = useState(false);

  // Feature 2: File Upload states
  const [chatFilePreview, setChatFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Feature 4: Break Countdown states
  const [breakCountdown, setBreakCountdown] = useState(0);
  const [breakType, setBreakType] = useState(null);
  const breakIntervalRef = useRef(null);
  
  const [permissions, setPermissions] = useState(LOCAL_STATE_PERMISSIONS);
  const [opportunities, setOpportunities] = useState(LOCAL_STATE_OPPORTUNITIES);
  const [agents, setAgents] = useState(LOCAL_STATE_AGENTS);
  const [notifications, setNotifications] = useState([]);
  const [customers, setCustomers] = useState(LOCAL_STATE_CUSTOMERS);

  // Case Management states
  const [cases, setCases] = useState(LOCAL_STATE_CASES);
  const [caseSearch, setCaseSearch] = useState("");
  const [caseStatusFilter, setCaseStatusFilter] = useState("all");
  const [casePriorityFilter, setCasePriorityFilter] = useState("all");
  const [selectedCase, setSelectedCase] = useState(null);
  useEffect(() => {
    if (selectedCase) {
      setEmailForm({
        to: selectedCase.contact_email || "",
        cc: "",
        subject: `Re: Case #${selectedCase.case_number} — ${selectedCase.subject}`,
        body: ""
      });
    }
  }, [selectedCase]);
  const [caseContentTab, setCaseContentTab] = useState("chatter");
  const [chatterSubTab, setChatterSubTab] = useState("post");
  const [chatterInput, setChatterInput] = useState("");
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [caseOverallOpen, setCaseOverallOpen] = useState(true);

  // Chat & Shop states
  const [chatSessions, setChatSessions] = useState(LOCAL_STATE_CHAT_SESSIONS);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessageInput, setChatMessageInput] = useState("");
  const [chatFilter, setChatFilter] = useState("all");
  const [chatSearchTerm, setChatSearchTerm] = useState("");
  const [chatChannelFilter, setChatChannelFilter] = useState("all");
  const [chatViewMode, setChatViewMode] = useState("list");

  // Bot Config states
  const [botRules, setBotRules] = useState(LOCAL_STATE_BOT_RULES);

  // Order Management states
  const [orders, setOrders] = useState(LOCAL_STATE_ORDERS);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  
  // Toast notifications State
  const [toasts, setToasts] = useState([]);
  
  // Call Simulator states
  const [activeOppId, setActiveOppId] = useState("");
  const [callOutcome, setCallOutcome] = useState("");
  const [callNotes, setCallNotes] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  
  // Customer Segment filters
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerActiveFilter, setCustomerActiveFilter] = useState("ทั้งหมด");
  
  // Grid Reports states
  const [reportsSearch, setReportsSearch] = useState("");
  const [reportsStageFilter, setReportsStageFilter] = useState("all");
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsPageSize] = useState(5);
  const [reportsSortColumn, setReportsSortColumn] = useState("id");
  const [reportsSortDirection, setReportsSortDirection] = useState("asc");
  const [reportsTotalItems, setReportsTotalItems] = useState(0);
  const [reportsTotalPages, setReportsTotalPages] = useState(1);
  const [reportsData, setReportsData] = useState([]);
  
  // UI layouts
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Dashboard Metrics
  const [kpis, setKpis] = useState({
    target: 1438000,
    salesWon: 0,
    pipelineValue: 0,
    winRate: 0,
    wonDealsCount: 0,
    totalDealsCount: 0
  });

  // Management Sub-Tab & Social Config
  const [managementSubTab, setManagementSubTab] = useState("roles");
  const [socialConfig, setSocialConfig] = useState({
    facebook: { pageName: "", pageId: "", accessToken: "" },
    line: { channelId: "", channelSecret: "", accessToken: "" }
  });

  // Salesforce & Zwiz Simulator states
  const [simTokenResponse, setSimTokenResponse] = useState(null);
  const [simWebhookEvent, setSimWebhookEvent] = useState("client_text");
  const [simWebhookPayload, setSimWebhookPayload] = useState("");
  const [simWebhookResponse, setSimWebhookResponse] = useState(null);
  const [simActionName, setSimActionName] = useState("CREATE_OPPORTUNITY");
  const [simActionPayload, setSimActionPayload] = useState("");
  const [simActionResponse, setSimActionResponse] = useState(null);
  const [simTokenRequesting, setSimTokenRequesting] = useState(false);
  const [simWebhookRequesting, setSimWebhookRequesting] = useState(false);
  const [simActionRequesting, setSimActionRequesting] = useState(false);
  const [showTokens, setShowTokens] = useState({ fb: false, line: false });

  const chatEndRef = useRef(null);

  // Helper to push a toast
  const showToast = (title, msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // ==========================================================================
  // FETCH LOADERS (Seamless Live API with Safe Local States Fallbacks)
  // ==========================================================================
  
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
      if (res.ok) {
        const data = await res.json();
        if (data.status === "online") {
          setServerConnected(true);
          setServerMode(data.mode);
        } else {
          setServerConnected(false);
        }
      }
    } catch (e) {
      setServerConnected(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await fetch("/api/permissions");
      if (res.ok) {
        const data = await res.json();
        setPermissions(data);
      }
    } catch (e) {
      setPermissions(LOCAL_STATE_PERMISSIONS);
    }
  };

  const fetchSocialConfig = async () => {
    try {
      const res = await fetch("/api/social-config");
      if (res.ok) {
        const data = await res.json();
        setSocialConfig(data);
      }
    } catch (e) {
      console.warn("Failed to fetch social config", e);
    }
  };

  const saveSocialConfig = async () => {
    try {
      const res = await fetch("/api/social-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socialConfig)
      });
      if (res.ok) {
        showToast("สำเร็จ", "บันทึกการตั้งค่า Social Media เรียบร้อยแล้ว", "success");
      } else {
        showToast("ผิดพลาด", "ไม่สามารถบันทึกการตั้งค่าได้", "danger");
      }
    } catch (e) {
      showToast("ผิดพลาด", "การเชื่อมต่อขัดข้อง", "danger");
    }
  };

  const handleSocialConfigChange = (platform, field, value) => {
    setSocialConfig(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const fetchOpportunities = async () => {
    try {
      const res = await fetch("/api/opportunities");
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data);
        loadKpis(data);
      } else {
        throw new Error();
      }
    } catch (e) {
      setOpportunities(LOCAL_STATE_OPPORTUNITIES);
      loadKpis(LOCAL_STATE_OPPORTUNITIES);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (e) {
      setAgents(LOCAL_STATE_AGENTS);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      setNotifications([]);
    }
  };

  const loadKpis = async (oppsList) => {
    try {
      const res = await fetch("/api/dashboard/analytics");
      if (res.ok) {
        const data = await res.json();
        setKpis(data.totals);
      } else {
        throw new Error();
      }
    } catch (e) {
      const totalOppAmount = oppsList.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0);
      const wonOpps = oppsList.filter(o => o.stage === "won");
      const totalWonAmount = wonOpps.reduce((acc, curr) => acc + parseFloat(curr.value || 0), 0);
      const winRate = oppsList.length > 0 ? Math.round((wonOpps.length / oppsList.length) * 100) : 0;
      setKpis({
        target: 1438000,
        salesWon: totalWonAmount,
        pipelineValue: totalOppAmount,
        winRate: winRate,
        wonDealsCount: wonOpps.length,
        totalDealsCount: oppsList.length
      });
    }
  };

  const loadCustomers = async () => {
    try {
      const url = `/api/customers?search=${encodeURIComponent(customerSearch)}&segment=${encodeURIComponent(customerActiveFilter)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      } else {
        throw new Error();
      }
    } catch (e) {
      const filtered = LOCAL_STATE_CUSTOMERS.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.code.toLowerCase().includes(customerSearch.toLowerCase());
        const matchesFilter = customerActiveFilter === "ทั้งหมด" || c.segment === customerActiveFilter;
        return matchesSearch && matchesFilter;
      });
      setCustomers(filtered);
    }
  };

  const loadReports = async () => {
    try {
      const url = `/api/reports?page=${reportsPage}&pageSize=${reportsPageSize}&search=${encodeURIComponent(reportsSearch)}&stage=${reportsStageFilter}&sortColumn=${reportsSortColumn}&sortDirection=${reportsSortDirection}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReportsData(data.data);
        setReportsTotalItems(data.totalItems);
        setReportsTotalPages(data.totalPages);
      } else {
        throw new Error();
      }
    } catch (e) {
      // client paginated & sorted reports list
      let filtered = opportunities.filter(opp => {
        const matchesSearch = opp.company.toLowerCase().includes(reportsSearch.toLowerCase()) || 
                             opp.title.toLowerCase().includes(reportsSearch.toLowerCase()) || 
                             opp.id.toLowerCase().includes(reportsSearch.toLowerCase());
        const matchesStage = reportsStageFilter === "all" || opp.stage === reportsStageFilter;
        return matchesSearch && matchesStage;
      });

      filtered.sort((a, b) => {
        let fieldA = a[reportsSortColumn];
        let fieldB = b[reportsSortColumn];
        if (typeof fieldA === "string") {
          fieldA = fieldA.toLowerCase();
          fieldB = fieldB.toLowerCase();
        }
        if (fieldA < fieldB) return reportsSortDirection === "asc" ? -1 : 1;
        if (fieldA > fieldB) return reportsSortDirection === "asc" ? 1 : -1;
        return 0;
      });

      const total = filtered.length;
      const pages = Math.ceil(total / reportsPageSize) || 1;
      const startIdx = (reportsPage - 1) * reportsPageSize;
      const paginated = filtered.slice(startIdx, startIdx + reportsPageSize);

      setReportsData(paginated);
      setReportsTotalItems(total);
      setReportsTotalPages(pages);
    }
  };

  const loadChats = async (oppId) => {
    try {
      const res = await fetch(`/api/chats/${oppId}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (e) {
      setChatMessages([]);
    }
  };

  // Initial Boot loader
  const loadAllData = () => {
    fetchStatus();
    fetchPermissions();
    fetchOpportunities();
    fetchAgents();
    fetchNotifications();
    fetchSocialConfig();
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Customer view triggers
  useEffect(() => {
    if (activeTab === "segment") {
      loadCustomers();
    }
  }, [customerSearch, customerActiveFilter, activeTab]);

  // Reports view triggers
  useEffect(() => {
    if (activeTab === "report") {
      loadReports();
    }
  }, [reportsSearch, reportsStageFilter, reportsPage, reportsSortColumn, reportsSortDirection, activeTab]);

  // Active Chats update trigger
  useEffect(() => {
    if (activeOppId) {
      loadChats(activeOppId);
    }
  }, [activeOppId]);

  // Auto Scroll Chats Viewport to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Simulated Web Push triggers (25% chance every 15s)
  useEffect(() => {
    if (showLogin) return;
    const interval = setInterval(async () => {
      if (Math.random() < 0.25) {
        try {
          const res = await fetch("/api/agents/simulate", { method: "POST" });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              showToast("พุชอัปเดตระบบ", data.notification.text, data.notification.type);
              fetchNotifications();
              fetchAgents();
            }
          }
        } catch (e) {
          // local fallback simulator
          const randIdx = Math.floor(Math.random() * agents.length);
          const ag = { ...agents[randIdx] };
          const statuses = ["online", "break", "lunch"];
          let newStat = ag.status;
          while (newStat === ag.status) {
            newStat = statuses[Math.floor(Math.random() * statuses.length)];
          }
          ag.status = newStat;
          
          let statTxt = "ออนไลน์";
          let type = "success";
          if (newStat === "break") { statTxt = "พักเบรก"; type = "warn"; ag.break_remain = 30; } 
          else if (newStat === "lunch") { statTxt = "พักเที่ยง"; type = "danger"; ag.break_remain = 0; }
          else { ag.break_remain = 30; }

          setAgents(prev => prev.map(a => a.id === ag.id ? ag : a));
          
          const text = `เจ้าหน้าที่ ${ag.name} (${ag.id}) ได้ปรับเปลี่ยนสถานะการทำงานเป็น -> ${statTxt}`;
          const timeNow = new Date().toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          const newNotif = {
            id: Date.now(),
            text: text,
            type: type,
            time: timeNow,
            unread: true
          };

          setNotifications(prev => [newNotif, ...prev]);
          showToast("พุชอัปเดตระบบ", text, type);
        }
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [showLogin, agents]);

  // Feature 4: Break Time Countdown Timer
  useEffect(() => {
    if (breakCountdown > 0) {
      breakIntervalRef.current = setInterval(() => {
        setBreakCountdown(prev => {
          if (prev <= 1) {
            clearInterval(breakIntervalRef.current);
            handleStatusChange("online");
            showToast("หมดเวลาพัก", "สถานะของคุณถูกปรับเป็น ว่าง (Online) อัตโนมัติ", "info");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breakIntervalRef.current) {
        clearInterval(breakIntervalRef.current);
      }
    }
    return () => {
      if (breakIntervalRef.current) {
        clearInterval(breakIntervalRef.current);
      }
    };
  }, [breakCountdown]);

  // Feature 5: Periodic tick to update elapsed time color coding
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setTick(t => t + 1);
    }, 15000); // tick every 15s to update color statuses
    return () => clearInterval(tickInterval);
  }, []);

  // Dashboard Chart.js Integration Hook
  useEffect(() => {
    if (activeTab !== "dashboard") return;
    if (typeof window === "undefined" || !window.Chart) return;
    
    const activeCharts = [];
    
    const ctx1 = document.getElementById("monthly-targets-chart")?.getContext("2d");
    if (ctx1) {
      const chart1 = new window.Chart(ctx1, {
        type: 'bar',
        data: {
          labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.'],
          datasets: [
            {
              label: 'เป้าหมายตั้ง (Target)',
              data: [300000, 350000, 400000, 450000, 500000],
              backgroundColor: '#CBD5E1',         /* Clean slate gray Target bar */
              borderColor: '#94A3B8',
              borderWidth: 1
            },
            {
              label: 'ยอดปิดได้จริง (Actual)',
              data: [315000, 340000, 420000, 480000, kpis.salesWon > 500000 ? Math.round(kpis.salesWon) : 520000],
              backgroundColor: '#0066FF',         /* Copallyt Call-center Blue Actual bar */
              borderColor: '#0066FF',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#1E293B' } } /* Dark slate legends text */
          },
          scales: {
            y: { grid: { color: '#E2E8F0' }, ticks: { color: '#64748B' } }, /* Clean light gridlines and text */
            x: { grid: { color: '#E2E8F0' }, ticks: { color: '#64748B' } }
          }
        }
      });
      activeCharts.push(chart1);
    }
    
    const ctx2 = document.getElementById("chat-channels-chart")?.getContext("2d");
    if (ctx2) {
      const chart2 = new window.Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Line OA', 'Facebook Messenger', 'เบอร์โทรศัพท์สายตรง', 'หน้าร้าน (Walk-in)'],
          datasets: [{
            data: [45, 25, 20, 10],
            backgroundColor: ['#10B981', '#0084FF', '#F97316', '#F59E0B'], /* Telemarketing Orange for phone */
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#1E293B', boxWidth: 12 } } /* Dark slate text */
          }
        }
      });
      activeCharts.push(chart2);
    }
    
    return () => {
      activeCharts.forEach(c => c.destroy());
    };
  }, [activeTab, kpis]);

  // ==========================================================================
  // EVENT ACTIONS HANDLERS
  // ==========================================================================
  
  const handleLogin = async (role) => {
    setShowLogin(false);
    
    let username = "somchai.j@thaiwatsadu.com";
    if (role === "role_b") username = "napa.s@thaiwatsadu.com";
    else if (role === "role_c") username = "wirot.s@thaiwatsadu.com";
    else if (role === "admin") username = "admin@thaiwatsadu.com";

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`SSO Login Handshake confirmed: ${data.name} (${data.role})`);
      }
    } catch (e) {
      console.error("SSO Login API connection issues.", e);
    }

    handleRoleChange(role);
    showToast("เชื่อมต่อ Azure AD สำเร็จ", "การตรวจสอบสิทธิ์การใช้งานขององค์กร (Microsoft Azure B2C) ผ่านเข้ารหัสสมบูรณ์แล้ว", "success");
    loadAllData();
  };

  const handleRoleChange = (newRole) => {
    let name = "สมชาย ใจดี";
    let roleLabel = "Manager";
    if (newRole === "role_a") {
      name = "สมชาย ใจดี";
      roleLabel = "Manager";
    } else if (newRole === "role_b") {
      name = "นภา สุขดี";
      roleLabel = "Agent";
    } else if (newRole === "role_c") {
      name = "วิโรจน์ แสงใต้";
      roleLabel = "Viewer";
    } else if (newRole === "admin") {
      name = "ผู้ดูแลระบบสูงสุด";
      roleLabel = "System Admin";
    }
    
    setUser(prev => ({ ...prev, name, role: newRole }));
    showToast("เปลี่ยนสิทธิ์บัญชี", `ย้ายการรับชมข้อมูลไปที่บทบาท: ${roleLabel}`, "info");

    const allowed = permissions[newRole] || LOCAL_STATE_PERMISSIONS[newRole] || [];
    if (!allowed.includes(activeTab)) {
      setActiveTab("home");
    }
  };

  const handleStatusChange = async (newStatus) => {
    // Check threshold for breaks
    const isBreak = ["break10", "break60", "demand50"].includes(newStatus);
    if (isBreak) {
      const activeChatsCount = chatSessions.filter(s => s.assigned_to === user.name && s.status === "active").length;
      if (activeChatsCount >= 5) {
        showToast("ไม่สามารถพักได้", `ไม่สามารถเปลี่ยนสถานะเป็นพักได้ เนื่องจากมีงานอยู่ในมือ ${activeChatsCount} คิว (จำกัดไม่เกิน 4 คิว)`, "danger");
        return;
      }
    }

    setUser(prev => ({ ...prev, status: newStatus }));
    
    // Manage countdown timer
    if (newStatus === "break10") {
      setBreakCountdown(600); // 10 minutes
      setBreakType("break10");
    } else if (newStatus === "break60") {
      setBreakCountdown(3600); // 60 minutes
      setBreakType("break60");
    } else if (newStatus === "demand50") {
      setBreakCountdown(3000); // 50 minutes
      setBreakType("demand50");
    } else {
      setBreakCountdown(0);
      setBreakType(null);
    }
    
    try {
      await fetch("/api/agents/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "A102", status: newStatus }) // Nakhon Napa Agent code
      });
    } catch (e) {
      console.error("Failed to update status to API", e);
    }
    
    let label = "ว่าง (Online)";
    if (newStatus === "break10") label = "☕ พักเบรก 10 นาที (Break 10 Min)";
    else if (newStatus === "break60") label = "🍽️ พักทานข้าว 60 นาที (Lunch 60 Min)";
    else if (newStatus === "demand50") label = "📋 ธุระส่วนตัว 50 นาที (Demand 50 Min)";
    else if (newStatus === "offline") label = "ออฟไลน์ (Offline)";
    
    showToast("ปรับปรุงสถานะของคุณ", `แก้ไขสถานะแอปเป็น: ${label}`, "info");
    fetchAgents();
  };

  const getChatColorStatus = (session) => {
    if (!session.assigned_to) return 'queued'; // 🟢 เขียว — New/Queued
    if (session.status !== 'active' && session.status !== 'waiting') return 'closed'; // Offline/Closed
    
    if (session.status === 'active') return 'inprogress'; // 🔴 แดง — In Progress
    
    const lastAgentMsg = session.messages?.filter(m => m.sender === 'agent').pop();
    if (!lastAgentMsg) return 'inprogress';
    
    let messageTime;
    try {
      const parts = lastAgentMsg.time.split(' ');
      if (parts.length === 2) {
        const dateParts = parts[0].split('-');
        const timeParts = parts[1].split(':');
        if (dateParts.length === 3 && timeParts.length === 2) {
          const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
          const year = parseInt("20" + dateParts[2]);
          const month = months[dateParts[1]] || 0;
          const day = parseInt(dateParts[0]);
          const hour = parseInt(timeParts[0]);
          const min = parseInt(timeParts[1]);
          messageTime = new Date(year, month, day, hour, min).getTime();
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    if (!messageTime) {
      messageTime = new Date(lastAgentMsg.time).getTime();
    }
    
    if (isNaN(messageTime)) return 'inprogress';
    
    const elapsed = (Date.now() - messageTime) / 60000; // in minutes
    if (elapsed < 15) return 'pending-short'; // 🔵 ฟ้า — Pending < 15 min
    if (elapsed <= 30) return 'pending-medium'; // 🟣 ม่วง — Pending 15-30 min
    return 'pending-critical'; // ⚫ ดำ — Pending > 30 min
  };

  const getElapsedMinutes = (session) => {
    const lastAgentMsg = session.messages?.filter(m => m.sender === 'agent').pop();
    if (!lastAgentMsg) return 0;
    
    let messageTime;
    try {
      const parts = lastAgentMsg.time.split(' ');
      if (parts.length === 2) {
        const dateParts = parts[0].split('-');
        const timeParts = parts[1].split(':');
        if (dateParts.length === 3 && timeParts.length === 2) {
          const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
          const year = parseInt("20" + dateParts[2]);
          const month = months[dateParts[1]] || 0;
          const day = parseInt(dateParts[0]);
          const hour = parseInt(timeParts[0]);
          const min = parseInt(timeParts[1]);
          messageTime = new Date(year, month, day, hour, min).getTime();
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    if (!messageTime) {
      messageTime = new Date(lastAgentMsg.time).getTime();
    }
    
    if (isNaN(messageTime)) return 0;
    
    return Math.floor((Date.now() - messageTime) / 60000);
  };

  const getColorWeight = (colorStatus) => {
    switch (colorStatus) {
      case 'pending-critical': return 5;
      case 'pending-medium': return 4;
      case 'pending-short': return 3;
      case 'inprogress': return 2;
      case 'queued': return 1;
      default: return 0;
    }
  };

  const sortChatSessions = (a, b) => {
    const pinA = a.pinned ? 1 : 0;
    const pinB = b.pinned ? 1 : 0;
    if (pinA !== pinB) {
      return pinB - pinA;
    }
    const weightA = getColorWeight(getChatColorStatus(a));
    const weightB = getColorWeight(getChatColorStatus(b));
    if (weightA !== weightB) {
      return weightB - weightA;
    }
    return b.id.localeCompare(a.id);
  };

  const togglePinChat = (sessionId, e) => {
    if (e) e.stopPropagation();
    setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, pinned: !s.pinned } : s));
    setActiveChat(prev => {
      if (prev && prev.id === sessionId) {
        return { ...prev, pinned: !prev.pinned };
      }
      return prev;
    });
    showToast("อัปเดตการปักหมุด", "ปรับปรุงสถานะปักหมุดการสนทนาเรียบร้อย", "success");
  };


  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) {
      showToast("ผิดพลาด", "กรุณากรอก To, Subject และ Body ให้ครบถ้วน", "danger");
      return;
    }

    setEmailSending(true);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailForm.to,
          cc: emailForm.cc,
          subject: emailForm.subject,
          emailBody: emailForm.body
        })
      });

      const data = await res.json();
      if (data.success) {
        const updated = {
          ...selectedCase,
          chatter_posts: [
            {
              user: user.name,
              avatar: null,
              action: "Email sent",
              timestamp: "Just now",
              details: {
                comment: `To: ${emailForm.to}\nCC: ${emailForm.cc || '—'}\nSubject: ${emailForm.subject}\n\n${emailForm.body}`,
                is_email: true,
                to: emailForm.to,
                cc: emailForm.cc,
                subject: emailForm.subject
              }
            },
            ...(selectedCase.chatter_posts || [])
          ]
        };
        setSelectedCase(updated);
        setCases(prev => prev.map(c => c.id === updated.id ? updated : c));
        setEmailForm(prev => ({ ...prev, body: "" })); // Clear email body
        showToast("ส่งอีเมลสำเร็จ", "ส่งอีเมลถึงลูกค้าเรียบร้อยแล้ว (จำลอง)", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showToast("ผิดพลาด", err.message || "ไม่สามารถส่งอีเมลได้", "danger");
    } finally {
      setEmailSending(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setChatFilePreview({
        name: file.name,
        type: file.type,
        data: reader.result
      });
      showToast("เตรียมส่งไฟล์", `เลือกไฟล์: ${file.name} แล้ว`, "info");
    };
    reader.onerror = (err) => {
      console.error(err);
      showToast("ข้อผิดพลาด", "ไม่สามารถอ่านไฟล์ได้", "danger");
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const handleSendChatSessionMessage = () => {
    if (!chatMessageInput.trim() && !chatFilePreview) return;

    const timeStr = new Date().toLocaleString("en-GB", { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    const msgText = chatMessageInput.trim() || `ส่งไฟล์: ${chatFilePreview.name}`;
    
    const newMsg = {
      sender: "agent",
      text: msgText,
      time: timeStr,
      ...(chatFilePreview ? { attachment: chatFilePreview } : {})
    };

    const updated = {
      ...activeChat,
      messages: [...activeChat.messages, newMsg],
      last_message: msgText,
      last_time: "Just now"
    };

    setActiveChat(updated);
    setChatSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    setChatMessageInput("");
    setChatFilePreview(null);
  };

  // Drag-and-Drop Handlers
  const handleDragStart = (e, oppId) => {
    e.dataTransfer.setData("text/plain", oppId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, stage) => {
    e.preventDefault();
    const oppId = e.dataTransfer.getData("text/plain");
    if (!oppId) return;

    // Optimistic UI updates
    const updated = opportunities.map(opp => opp.id === oppId ? { ...opp, stage } : opp);
    setOpportunities(updated);
    loadKpis(updated);

    try {
      const res = await fetch("/api/opportunities/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: oppId, stage })
      });
      if (res.ok) {
        showToast("ย้ายโอกาสการขาย", `ปรับเปลี่ยนสถานะของ ${oppId} เป็น -> ${stage.toUpperCase()} เรียบร้อย`, "success");
      } else {
        throw new Error();
      }
    } catch (err) {
      showToast("ย้ายโอกาสการขาย", `บันทึกกิจกรรมย้ายดีลในความทรงจำเรียบร้อย`, "success");
    }
  };

  // Call Logs Action
  const handleSaveCallLog = async () => {
    if (!activeOppId) return;
    if (!callOutcome) {
      showToast("ข้อมูลไม่ครบถ้วน", "กรุณาเลือกสถานะผลสายโทรศัพท์ก่อนทำการบันทึก", "warn");
      return;
    }

    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeOppId,
          outcome: callOutcome,
          notes: callNotes,
          agentId: "A102"
        })
      });
      if (res.ok) {
        showToast("บันทึกสายสำเร็จ", "บันทึกกิจกรรมสายโทรศัพท์ลงในฐานข้อมูลเรียบร้อยแล้ว", "success");
        setCallNotes("");
        setCallOutcome("");
      }
    } catch (e) {
      showToast("บันทึกสายสำเร็จ", "บันทึกกิจกรรมสายโทรศัพท์ในเครื่องเรียบร้อยแล้ว", "success");
      setCallNotes("");
      setCallOutcome("");
    }
  };

  // Chat message send handler
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !activeOppId) return;
    const text = chatInput.trim();
    setChatInput("");
    
    const timeNow = new Date().toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      opportunity_id: activeOppId,
      sender: "agent",
      text,
      time: timeNow
    };

    setChatMessages(prev => [...prev, newMsg]);

    try {
      await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg)
      });
    } catch (e) {
      console.error(e);
    }

    // Trigger simulation reply client message
    setTimeout(async () => {
      const replyTime = new Date().toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' });
      const replyText = "ได้รับข้อความแล้วค่ะ เดี๋ยวผลจะแจ้งกลับมาทางแชทอีกทีนึงนะคะ ขอบคุณสำหรับความช่วยเหลือ";
      const replyMsg = {
        opportunity_id: activeOppId,
        sender: "client",
        text: replyText,
        time: replyTime
      };

      setChatMessages(prev => [...prev, replyMsg]);

      try {
        await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(replyMsg)
        });
      } catch (e) {
        console.error(e);
      }
    }, 2500);
  };

  // CSV Export Action
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Deal ID,Company,Project Title,Sales Amount (THB),Deal Stage,Project Age (Days)\n";

    opportunities.forEach(opp => {
      const company = `"${opp.company.replace(/"/g, '""')}"`;
      const title = `"${opp.title.replace(/"/g, '""')}"`;
      csvContent += `${opp.id},${company},${title},${opp.value},${opp.stage.toUpperCase()},${opp.days}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CRM_TrackSales_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("ส่งออกข้อมูลสำเร็จ", "สร้างเอกสารแผ่นงาน CSV เรียบร้อยแล้ว (กำลังดาวน์โหลด)", "success");
  };

  // Role Permissions control
  const handlePermissionToggle = async (role, feature, isChecked) => {
    const currentPerms = permissions[role] || [];
    let updatedPerms = [...currentPerms];
    
    if (isChecked) {
      if (!updatedPerms.includes(feature)) {
        updatedPerms.push(feature);
        showToast("เปิดใช้งานสิทธิ์", `อนุญาตให้บทบาท ${role.toUpperCase()} เข้าถึงหน้า /${feature}`, "success");
      }
    } else {
      updatedPerms = updatedPerms.filter(f => f !== feature);
      showToast("ถอนสิทธิ์ระบบ", `บล็อกไม่ให้บทบาท ${role.toUpperCase()} เข้าถึงหน้า /${feature}`, "warn");
    }
    
    setPermissions(prev => ({ ...prev, [role]: updatedPerms }));

    try {
      await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, allowed_menus: updatedPerms })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await fetch("/api/notifications/clear", { method: "POST" });
      setNotifications([]);
    } catch (e) {
      setNotifications([]);
    }
  };

  const handleReadNotification = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Webhook presets inside the component to capture dynamic Date.now()
  const webhookPresets = {
    client_text: {
      timestamp: Date.now(),
      sender: { social_id: "8689961871042617", display_name: "สมศักดิ์ รักเรียน", origin: "Facebook" },
      recipient: { social_id: "105678912345678", display_name: "Thai Watsadu Official", origin: "Bot" },
      channel: { channel_id: "71042617", channel_type: "Facebook", channel_name: "Thai Watsadu Main Page" },
      messaging: [{ message: { text: "สวัสดีครับ สนใจสั่งซื้อเหล็กเส้นและปูนสำหรับเทฐานรากครับ", mid: `mid_fb_text_${Date.now()}`, type: "text" }, timestamp: Date.now() }]
    },
    client_image: {
      timestamp: Date.now(),
      sender: { social_id: "8689961871042617", display_name: "สมศักดิ์ รักเรียน", origin: "Facebook" },
      recipient: { social_id: "105678912345678", display_name: "Thai Watsadu Official", origin: "Bot" },
      channel: { channel_id: "71042617", channel_type: "Facebook", channel_name: "Thai Watsadu Main Page" },
      messaging: [{ message: { alt_text: "[Image Attachment]", mid: `mid_fb_img_${Date.now()}`, type: "image", attachments: [{ type: "image", payload: { title: "ตัวอย่างกระเบื้อง", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" } }] }, timestamp: Date.now() }]
    },
    create_opp_action: {
      timestamp: Date.now(),
      sender: { social_id: "8689961871042617", display_name: "สมศักดิ์ รักเรียน", origin: "Facebook" },
      recipient: { social_id: "105678912345678", display_name: "Thai Watsadu Official", origin: "Bot" },
      channel: { channel_id: "71042617", channel_type: "Facebook", channel_name: "Thai Watsadu Main Page" },
      messaging: [{ action: [{ name: "CREATE_OPPORTUNITY", params: { opportunity_name: "Confirm Chat & Shop - เหล็กเส้นและปูน" } }], timestamp: Date.now() }]
    },
    create_case_action: {
      timestamp: Date.now(),
      sender: { social_id: "8689961871042617", display_name: "สมศักดิ์ รักเรียน", origin: "Facebook" },
      recipient: { social_id: "105678912345678", display_name: "Thai Watsadu Official", origin: "Bot" },
      channel: { channel_id: "71042617", channel_type: "Facebook", channel_name: "Thai Watsadu Main Page" },
      messaging: [{ action: [{ name: "CREATE_CASE", params: { subject: "ติดตามเรื่องการส่งมอบสินค้าล่าช้า" } }], timestamp: Date.now() }]
    }
  };

  const actionPresets = {
    CREATE_OPPORTUNITY: {
      action: { name: "CREATE_OPPORTUNITY", params: { opportunity_name: "Confirm Chat & Shop - สั่งของเพิ่ม" } },
      target: { social_id: "8689961871042617", display_name: "สมศักดิ์ รักเรียน" },
      channel: { channel_type: "Facebook" }
    },
    CREATE_CASE: {
      action: { name: "CREATE_CASE", params: { subject: "แจ้งปัญหาสินค้าชำรุดเคลมสินค้า" } },
      target: { social_id: "8689961871042617", display_name: "สมศักดิ์ รักเรียน" },
      channel: { channel_type: "Facebook" }
    },
    CLOSE_OPPORTUNITY: {
      action: { name: "CLOSE_OPPORTUNITY", params: { opportunity_id: "OPP-308" } },
      target: { social_id: "8689961871042617", display_name: "สมศักดิ์ รักเรียน" },
      channel: { channel_type: "Facebook" }
    },
    CLOSE_CASE: {
      action: { name: "CLOSE_CASE", params: { case_id: "cs26061801" } },
      target: { social_id: "8689961871042617", display_name: "สมศักดิ์ รักเรียน" },
      channel: { channel_type: "Facebook" }
    },
    CLOSE_CHAT: {
      action: { name: "CLOSE_CHAT", params: {} },
      target: { social_id: "8689961871042617", display_name: "สมศักดิ์ รักเรียน" },
      channel: { channel_type: "Facebook" }
    }
  };

  useEffect(() => {
    if (webhookPresets[simWebhookEvent]) {
      setSimWebhookPayload(JSON.stringify(webhookPresets[simWebhookEvent], null, 2));
    }
  }, [simWebhookEvent]);

  useEffect(() => {
    if (actionPresets[simActionName]) {
      setSimActionPayload(JSON.stringify(actionPresets[simActionName], null, 2));
    }
  }, [simActionName]);

  const handleRequestToken = async () => {
    setSimTokenRequesting(true);
    try {
      const res = await fetch("/services/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIzTVZHOVpMMHBwR1A1VXJCcHhQN2xYRUNMYjFsSzVvR1ViVGRqalJqOVYycW4..."
        })
      });
      const data = await res.json();
      setSimTokenResponse(data);
      if (res.ok) {
        showToast("สิทธิ์สำเร็จ", "ได้รับ Salesforce Token เรียบร้อยแล้ว", "success");
      } else {
        showToast("สิทธิ์ล้มเหลว", data.error_description || "Error requesting token", "danger");
      }
    } catch (err) {
      setSimTokenResponse({ error: "network_error", error_description: err.message });
      showToast("ข้อผิดพลาด", err.message, "danger");
    } finally {
      setSimTokenRequesting(false);
    }
  };

  const handleSendWebhook = async () => {
    setSimWebhookRequesting(true);
    try {
      const token = simTokenResponse?.access_token || "mock_sf_token_abc123xyz789";
      const res = await fetch("/services/apexrest/chat/v1/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: simWebhookPayload
      });
      const data = await res.json();
      setSimWebhookResponse(data);
      if (res.ok && data.status?.code === 1000) {
        showToast("Webhook สำเร็จ", "ยิง Webhook ของ Zwiz เข้าสู่ระบบสำเร็จ", "success");
        // Reload data to reflect changes
        fetchOpportunities();
        fetchNotifications();
      } else {
        showToast("Webhook ล้มเหลว", data.status?.description || "Error sending webhook", "danger");
      }
    } catch (err) {
      setSimWebhookResponse({ error: "network_error", description: err.message });
      showToast("ข้อผิดพลาด", err.message, "danger");
    } finally {
      setSimWebhookRequesting(false);
    }
  };

  const handleSendAction = async () => {
    setSimActionRequesting(true);
    try {
      const token = simTokenResponse?.access_token || "mock_sf_token_abc123xyz789";
      const res = await fetch("/services/apexrest/v1/action/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: simActionPayload
      });
      const data = await res.json();
      setSimActionResponse(data);
      if (res.ok && data.status?.code === 1000) {
        showToast("Action สำเร็จ", "ประมวลผลคำสั่งสำเร็จ", "success");
        // Reload data to reflect changes
        fetchOpportunities();
        fetchNotifications();
      } else {
        showToast("Action ล้มเหลว", data.status?.description || "Error sending action", "danger");
      }
    } catch (err) {
      setSimActionResponse({ error: "network_error", description: err.message });
      showToast("ข้อผิดพลาด", err.message, "danger");
    } finally {
      setSimActionRequesting(false);
    }
  };

  const allowedMenus = permissions[user.role] || LOCAL_STATE_PERMISSIONS[user.role] || [];

  return (
    <div id="app-root" className="app-root">
      {/* Toast popup alerts */}
      <div className="toasts-wrapper" style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999, display: "flex", flexDirection: "column", gap: "10px" }}>
        {toasts.map(t => (
          <div key={t.id} className="alert-popup" style={{
            animation: "alertSlideIn 0.3s forwards",
            borderLeft: t.type === "success" ? "4px solid var(--color-success)" : t.type === "warn" ? "4px solid var(--color-warning)" : t.type === "danger" ? "4px solid var(--color-danger)" : "none",
            borderColor: t.type === "success" ? "var(--color-success)" : t.type === "warn" ? "var(--color-warning)" : t.type === "danger" ? "var(--color-danger)" : "transparent"
          }}>
            <div className={`notif-icon ${t.type}`}>
              <i className={`fa-solid ${t.type === "success" ? "fa-circle-check" : t.type === "warn" ? "fa-triangle-exclamation" : t.type === "danger" ? "fa-mug-hot" : "fa-circle-info"}`}></i>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <strong style={{ fontSize: "13px", color: "var(--text-primary)", marginBottom: "2px" }}>{t.title}</strong>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.3" }}>{t.msg}</span>
            </div>
          </div>
        ))}
      </div>

      {/* === Salesforce Lightning Global Header === */}
      <header className="sf-global-header">
        <div className="sf-global-header__left">
          <button className="sf-app-launcher" title="App Launcher">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="3" cy="3" r="2"/><circle cx="10" cy="3" r="2"/><circle cx="17" cy="3" r="2"/>
              <circle cx="3" cy="10" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="17" cy="10" r="2"/>
              <circle cx="3" cy="17" r="2"/><circle cx="10" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
            </svg>
          </button>
          <span className="sf-app-name">CRM Track Sales</span>
        </div>
        <div className="sf-global-header__center">
          <div className="sf-search-bar">
            <i className="fa-solid fa-magnifying-glass sf-search-bar__icon"></i>
            <input type="text" className="sf-search-bar__input" placeholder="Search CRM Track Sales" />
          </div>
        </div>
        <div className="sf-global-header__right">
          <button className="sf-global-action" title="Setup"><i className="fa-solid fa-gear"></i></button>
          {["role_a", "admin"].includes(user.role) && (
            <button
              className="sf-global-action"
              title="Watch List"
              onClick={() => {
                setActiveTab('home');
                setTimeout(() => {
                  document.querySelector('.watchlist-panel')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              style={{ position: 'relative' }}
            >
              <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--color-danger)' }}></i>
              {cases.filter(c => ["critical", "high"].includes(c.priority.toLowerCase()) && c.status !== "closed" && c.status !== "solved").length > 0 && (
                <span className="sf-notif-badge" style={{ backgroundColor: 'var(--color-danger)' }}>
                  {cases.filter(c => ["critical", "high"].includes(c.priority.toLowerCase()) && c.status !== "closed" && c.status !== "solved").length}
                </span>
              )}
            </button>
          )}
          <button className="sf-global-action" title="Notifications" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
            <i className="fa-solid fa-bell"></i>
            {notifications.filter(n => n.unread).length > 0 && <span className="sf-notif-badge">{notifications.filter(n => n.unread).length}</span>}
          </button>
          <div className="sf-avatar" title={user.name}>
            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside id="sidebar" className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-icon"><i className="fa-solid fa-bolt"></i></span>
            <span className="logo-text">CRM <span className="logo-sub">Track Sales</span></span>
          </div>
          <button id="sidebar-toggle" className="sidebar-toggle-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <i className={`fa-solid ${sidebarCollapsed ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
          </button>
        </div>
        
        <nav className="sidebar-menu">
          <ul id="menu-list">
            {(() => {
              const sections = [
                { label: "CRM", items: ["home", "opportunity", "call", "order", "segment"] },
                { label: "CHAT & SHOP", items: ["chat"] },
                { label: "CASE", items: ["case"] },
                { label: "MONITORING", items: ["monitor", "dashboard", "report"] },
                { label: "SETTINGS", items: ["management"] }
              ];
              return sections.map(section => {
                const visibleItems = section.items.filter(k => allowedMenus.includes(k));
                if (visibleItems.length === 0) return null;
                return (
                  <React.Fragment key={section.label}>
                    {!sidebarCollapsed && <li className="sidebar-section-label">{section.label}</li>}
                    {visibleItems.map(menuKey => {
                      const item = MENU_TITLES[menuKey];
                      if (!item) return null;
                      const isActive = activeTab === menuKey;
                      return (
                        <li key={menuKey}>
                          <a href={item.href} className={`menu-item-link ${isActive ? "active" : ""}`} onClick={(e) => {
                            e.preventDefault();
                            setActiveTab(menuKey);
                          }}>
                            <i className={item.icon}></i>
                            <span className="menu-text">{item.title}</span>
                          </a>
                        </li>
                      );
                    })}
                  </React.Fragment>
                );
              });
            })()}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="version-info">
            <div className="ver-label">crm_track_sales</div>
            <div className="ver-num">v2.0.0 (Build 1)</div>
          </div>
        </div>
      </aside>

      {/* Right Side Main Section */}
      <main className="main-wrapper">
        {/* Top Navigation Header */}
        <header className="top-header">
          <div className="header-left">
            <h1 id="page-title" className="page-title">{MENU_TITLES[activeTab]?.title || "หน้าต่างหลัก"}</h1>
          </div>
          
          <div className="header-right">
            {/* Live Agent Status Select */}
            <div className="agent-status-panel">
              {breakCountdown > 0 && (
                <div className={`break-countdown ${breakCountdown < 60 ? 'urgent' : ''}`}>
                  <i className="fa-solid fa-clock"></i> {Math.floor(breakCountdown / 60)}:{(breakCountdown % 60).toString().padStart(2, '0')}
                </div>
              )}
              <span className={`status-indicator-dot ${
                ["break10", "break60", "demand50"].includes(user.status) ? "break" : user.status
              }`}></span>
              <select id="agent-status-select" className="status-select" value={user.status} onChange={(e) => handleStatusChange(e.target.value)}>
                <option value="online">ว่าง (Available)</option>
                <option value="break10">☕ พักเบรก 10 นาที (Break 10 Min)</option>
                <option value="break60">🍽️ พักทานข้าว 60 นาที (Lunch 60 Min)</option>
                <option value="demand50">📋 ธุระส่วนตัว 50 นาที (Demand 50 Min)</option>
                <option value="offline">ออฟไลน์ (Offline)</option>
              </select>
            </div>

            {/* Role Switcher for Demonstration */}
            <div className="role-switcher">
              <i className="fa-solid fa-user-shield role-icon"></i>
              <select id="role-select" className="role-select" value={user.role} onChange={(e) => handleRoleChange(e.target.value)}>
                <option value="role_b">Agent (Role B)</option>
                <option value="role_a">Manager (Role A)</option>
                <option value="role_c">Viewer (Role C)</option>
                <option value="admin">System Admin</option>
              </select>
            </div>

            {/* Notification Center Bell dropdown */}
            <div className="notification-bell" id="notification-trigger" onClick={(e) => { e.stopPropagation(); setShowNotifDropdown(!showNotifDropdown); }}>
              <i className="fa-regular fa-bell"></i>
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="notification-badge" id="notification-count">
                  {notifications.filter(n => n.unread).length}
                </span>
              )}
              <div className={`notification-dropdown ${showNotifDropdown ? "active" : ""}`} id="notification-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="dropdown-header">
                  <span>การแจ้งเตือน (Notifications)</span>
                  <button id="clear-notifications" className="clear-btn" onClick={handleClearNotifications}>ล้างทั้งหมด</button>
                </div>
                <div className="dropdown-body" id="notification-list">
                  {notifications.length === 0 ? (
                    <div className="empty-notifications">ไม่มีการแจ้งเตือนใหม่</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`notification-item ${n.unread ? "unread" : ""}`} onClick={() => handleReadNotification(n.id)}>
                        <div className={`notif-icon ${n.type}`}>
                          <i className={`fa-solid ${n.type === "success" ? "fa-circle-check" : n.type === "warn" ? "fa-triangle-exclamation" : n.type === "danger" ? "fa-mug-hot" : "fa-circle-info"}`}></i>
                        </div>
                        <div className="notif-content">
                          <span className="notif-text">{n.text}</span>
                          <span className="notif-time">{n.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* User Profile */}
            <div className="user-profile">
              <div className="profile-avatar">
                <i className="fa-solid fa-user"></i>
              </div>
              <div className="profile-details">
                <span className="user-name" id="user-display-name">{user.name}</span>
                <span className="user-role-label" id="user-role-display">
                  {user.role === "role_a" ? "Manager" : user.role === "role_b" ? "Agent" : user.role === "role_c" ? "Viewer" : "System Admin"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Viewport Router */}
        <section className="content-viewport" id="app-content">
          
          {/* VIEW: HOME */}
          {activeTab === "home" && (
            <div className="view-container">
              <div className={`db-status-bar ${serverConnected ? "active" : ""}`}>
                <i className={`fa-solid ${serverConnected ? "fa-database" : "fa-triangle-exclamation"}`}></i> 
                <span>เซิร์ฟเวอร์ฐานข้อมูล: <strong>{serverConnected ? `เชื่อมต่อ Postgres Live (${serverMode})` : "ปิดทำงาน (Mock In-Memory)"}</strong></span>
              </div>

              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-info">
                    <span className="kpi-title">เป้าขายสะสมปีนี้</span>
                    <span className="kpi-value">฿{kpis.target.toLocaleString()}</span>
                    <span className="kpi-trend up"><i className="fa-solid fa-caret-up"></i> +12% เทียบกับเดือนก่อน</span>
                  </div>
                  <div className="kpi-icon-box red"><i class="fa-solid fa-chart-bar"></i></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-info">
                    <span className="kpi-title">ยอดขายปิดการขาย (Won)</span>
                    <span className="kpi-value">฿{Math.round(kpis.salesWon).toLocaleString()}</span>
                    <span className="kpi-trend up"><i className="fa-solid fa-caret-up"></i> {kpis.wonDealsCount} ดีลสำเร็จ</span>
                  </div>
                  <div className="kpi-icon-box green"><i class="fa-solid fa-wallet"></i></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-info">
                    <span className="kpi-title">มูลค่าโอกาสใน Pipeline</span>
                    <span className="kpi-value">฿{Math.round(kpis.pipelineValue).toLocaleString()}</span>
                    <span className="kpi-trend"><i className="fa-solid fa-circle-notch fa-spin"></i> {kpis.totalDealsCount} ลูกค้ารอการดีล</span>
                  </div>
                  <div className="kpi-icon-box teal"><i class="fa-solid fa-rotate"></i></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-info">
                    <span className="kpi-title">อัตราปิดยอดชนะ (Win Rate)</span>
                    <span className="kpi-value">{kpis.winRate}%</span>
                    <span className="kpi-trend up"><i className="fa-solid fa-caret-up"></i> +4.5% ปรับปรุงขึ้น</span>
                  </div>
                  <div className="kpi-icon-box amber"><i class="fa-solid fa-award"></i></div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="dashboard-panel">
                  <div className="panel-header">
                    <h4 className="panel-title"><i className="fa-solid fa-circle-nodes icon-decor" style={{ color: "var(--color-primary)", marginRight: "8px" }}></i>คู่มือกระบวนการและการทำงานภาพรวม</h4>
                  </div>
                  <div className="quick-welcome-box" style={{ lineHeight: "1.6", fontSize: "13.5px", color: "var(--text-secondary)" }}>
                    <p style={{ marginBottom: "12px" }}>ยินดีต้อนรับสู่ระบบติดตามและรายงานยอดขาย <strong>STK (Sales Tracking System)</strong> โครงสร้างโปรแกรมจำลองหน้าจอความละเอียดสูง</p>
                    <p style={{ marginBottom: "12px" }}>คุณสามารถใช้งานฟังก์ชันจำลองประสิทธิภาพเต็มรูปแบบ:</p>
                    <ul style={{ marginLeft: "20px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <li><strong style={{ color: "var(--text-primary)" }}><i className="fa-solid fa-shield-halved" style={{ marginRight: "6px" }}></i>สลับบทบาทการเข้าถึง:</strong> ใช้กล่องตัวเลือกสลับบทบาทด้านบนขวา เพื่อดูเมนู สิทธิ์ และการกรองข้อมูลที่ต่างกันตามหลักเกณฑ์</li>
                      <li><strong style={{ color: "var(--text-primary)" }}><i className="fa-solid fa-arrows-spin" style={{ marginRight: "6px" }}></i>การจำลองแบบ Real-Time:</strong> ระบบประมวลผลฉากหลังจะสุ่มสลับสถานะของพนักงานคนอื่นๆ พร้อมทั้งสร้างการแจ้งเตือนด้านบนขวาเพื่อให้เสมือนเชื่อมต่อกับ WebSocket เซิร์ฟเวอร์</li>
                      <li><strong style={{ color: "var(--text-primary)" }}><i className="fa-solid fa-arrow-down-9-1" style={{ marginRight: "6px" }}></i>Kanban Board & Reports:</strong> ทดลองลากวางการปิดการขาย และคัดกรองข้อมูลประวัติพร้อมส่งออก Excel/CSV จริงๆ</li>
                    </ul>
                  </div>
                </div>
                
                <div className="dashboard-panel">
                  <div className="panel-header">
                    <h4 className="panel-title"><i className="fa-solid fa-clock-rotate-left icon-decor" style={{ color: "var(--color-secondary)", marginRight: "8px" }}></i>สถานะของฉันวันนี้</h4>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>สายโทรเข้าวันนี้</span>
                      <strong style={{ fontSize: "16px", color: "var(--color-secondary)" }}>14 สาย</strong>
                    </div>
                    <div style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>สายโทรออกติดตาม</span>
                      <strong style={{ fontSize: "16px", color: "var(--color-warning)" }}>28 สาย</strong>
                    </div>
                    <div style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>อัตราการตอบรับแชทแรก</span>
                      <strong style={{ fontSize: "16px", color: "var(--color-success)" }}>1.8 นาที</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3: Watch List Panel */}
              {["role_a", "admin"].includes(user.role) && (
                <div className="watchlist-panel" style={{ marginTop: "24px" }}>
                  <h3>
                    <i className="fa-solid fa-triangle-exclamation"></i> ลูกค้าเฝ้าระวัง (Watch List) — เคสวิกฤต/ความสำคัญสูง
                    <span className="watchlist-badge" style={{ marginLeft: "10px" }}>
                      {cases.filter(c => ["critical", "high"].includes(c.priority.toLowerCase()) && c.status !== "closed" && c.status !== "solved").length}
                    </span>
                  </h3>
                  <div className="watchlist-table-wrap">
                    <table className="watchlist-table">
                      <thead>
                        <tr>
                          <th>Case ID</th>
                          <th>หัวข้อ (Subject)</th>
                          <th>ลูกค้า (Customer)</th>
                          <th>ความสำคัญ (Priority)</th>
                          <th>สถานะ (Status)</th>
                          <th>ผู้รับผิดชอบ (Owner)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cases
                          .filter(c => ["critical", "high"].includes(c.priority.toLowerCase()) && c.status !== "closed" && c.status !== "solved")
                          .map(c => (
                            <tr key={c.id} onClick={() => {
                              setSelectedCase(c);
                              setCaseContentTab('chatter');
                              setActiveTab('case');
                            }}>
                              <td style={{ fontWeight: "700", color: "var(--color-primary)" }}>{c.case_number}</td>
                              <td>{c.subject}</td>
                              <td>{c.account_name || c.contact_name}</td>
                              <td>
                                <span className={`case-priority-badge ${c.priority.toLowerCase()}`}>
                                  {c.priority}
                                </span>
                              </td>
                              <td>
                                <span className={`case-status-badge ${c.status.toLowerCase()}`}>
                                  {c.status}
                                </span>
                              </td>
                              <td>{c.owner || "Unassigned"}</td>
                            </tr>
                          ))
                        }
                        {cases.filter(c => ["critical", "high"].includes(c.priority.toLowerCase()) && c.status !== "closed" && c.status !== "solved").length === 0 && (
                          <tr>
                            <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                              ไม่มีเคสเฝ้าระวังที่กำลังดำเนินการอยู่ 🎉
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: CASE MANAGEMENT — SRS v1.4 COMPLIANT */}
          {activeTab === "case" && (
            <div className="view-container">
              {selectedCase ? (
                /* === SALESFORCE CASE DETAIL — 3-Panel Layout === */
                <div className={`sf-case-layout ${leftPanelCollapsed ? 'left-collapsed' : ''}`}>
                  {/* LEFT PANEL — Case List */}
                  <div className="sf-case-left-panel" style={{ position: 'relative' }}>
                    <div className="panel-header">
                      <div className="list-title">
                        <span className="pin-icon"><i className="fa-solid fa-inbox"></i></span>
                        All BU - New Email ▾
                        <span style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                          <i className="fa-solid fa-thumbtack" style={{ color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}></i>
                          <i className="fa-solid fa-arrow-up-right-from-square" style={{ color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}></i>
                        </span>
                      </div>
                      <div className="list-meta">
                        {cases.filter(c => caseStatusFilter === "all" || c.status === caseStatusFilter).length} items • Updated {new Date().toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="list-search">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input type="text" placeholder="Search this list..." value={caseSearch} onChange={(e) => setCaseSearch(e.target.value)} />
                      </div>
                      <div className="list-col-header">
                        <span>Case Record Type ↕</span>
                        <span style={{ display: 'flex', gap: '4px' }}>
                          <i className="fa-solid fa-table-list" style={{ cursor: 'pointer' }}></i>
                          <i className="fa-solid fa-table-columns" style={{ cursor: 'pointer' }}></i>
                        </span>
                      </div>
                    </div>
                    <div className="case-list-items">
                      {cases
                        .filter(c => caseStatusFilter === "all" || c.status === caseStatusFilter)
                        .filter(c => casePriorityFilter === "all" || c.priority.toLowerCase() === casePriorityFilter)
                        .filter(c => !caseSearch || c.id.toLowerCase().includes(caseSearch.toLowerCase()) || c.subject.toLowerCase().includes(caseSearch.toLowerCase()) || c.contact_name.toLowerCase().includes(caseSearch.toLowerCase()) || (c.account_name && c.account_name.toLowerCase().includes(caseSearch.toLowerCase())))
                        .map(c => (
                          <div key={c.id} className={`case-list-item ${selectedCase && selectedCase.id === c.id ? 'active' : ''}`} onClick={() => { setSelectedCase(c); setCaseContentTab('chatter'); }}>
                            <div className="item-type">{c.case_record_type || c.bu}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div className="item-number">{c.case_number || c.id}</div>
                            </div>
                            <div className="item-name">{c.account_name || c.contact_name}</div>
                            <div className="item-subject">{c.subject}</div>
                          </div>
                        ))
                      }
                    </div>
                    <button className="sf-left-collapse-btn" onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}>
                      <i className={`fa-solid ${leftPanelCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
                    </button>
                  </div>

                  {/* CENTER PANEL — Case Detail */}
                  <div className="sf-case-center">
                    {/* Subtab Bar */}
                    <div className="sf-subtab-bar">
                      <button className="subtab-item active">
                        <i className="fa-solid fa-file-lines"></i>
                        {selectedCase.account_name || selectedCase.contact_name}
                        <span className="subtab-close">✕</span>
                      </button>
                      <button className="subtab-item">
                        <i className="fa-solid fa-ticket"></i>
                        {selectedCase.case_number || selectedCase.id}
                        <span style={{ color: 'var(--color-success)', marginLeft: '4px' }}>✓</span>
                        <span className="subtab-close">✕</span>
                      </button>
                    </div>

                    {/* Case Header */}
                    <div className="sf-case-header">
                      <div className="header-top">
                        <div className="header-identity">
                          <div className="case-icon"><i className="fa-solid fa-ticket"></i></div>
                          <div>
                            <div className="case-type-label">Case</div>
                            <div className="case-account-name">{selectedCase.account_name || selectedCase.contact_name}</div>
                          </div>
                        </div>
                        <div className="header-actions">
                          <button className="sf-btn follow"><i className="fa-solid fa-plus" style={{ marginRight: '4px' }}></i> Follow</button>
                          <button className="sf-btn">Edit</button>
                          <button className="sf-btn">Change Record Type</button>
                          <button
                            className="sf-btn"
                            onClick={() => {
                              setCaseContentTab('chatter');
                              setChatterSubTab('email');
                            }}
                          >
                            <i className="fa-solid fa-envelope"></i> Email
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Highlight Panel */}
                    <div className="sf-highlight-panel">
                      <div className="highlight-field">
                        <span className="field-label">Case Number</span>
                        <span className="field-value">{selectedCase.case_number || selectedCase.id}</span>
                      </div>
                      <div className="highlight-field">
                        <span className="field-label">Case Record Type</span>
                        <span className="field-value">{selectedCase.case_record_type || selectedCase.bu}</span>
                      </div>
                      <div className="highlight-field">
                        <span className="field-label">Priority</span>
                        <span className="field-value">{selectedCase.priority}</span>
                      </div>
                      <div className="highlight-field">
                        <span className="field-label">Subject</span>
                        <span className="field-value subject">{selectedCase.subject}</span>
                      </div>
                    </div>

                    {/* Content Tabs */}
                    <div className="sf-content-tabs">
                      {["chatter", "related", "child-cases", "mcom", "return-form", "sla"].map(tab => (
                        <button key={tab} className={`tab-item ${caseContentTab === tab ? 'active' : ''}`} onClick={() => setCaseContentTab(tab)}>
                          {tab === "chatter" ? "Chatter" : tab === "related" ? "Related" : tab === "child-cases" ? "Related Child Cases" : tab === "mcom" ? "MCOM" : tab === "return-form" ? "Return Form" : "SLA"}
                        </button>
                      ))}
                    </div>

                    {/* Content Body */}
                    <div className="sf-content-body">
                      {caseContentTab === "chatter" && (
                        <div>
                          {/* Post / Email subtabs */}
                          <div className="sf-chatter-subtabs">
                            <button className={chatterSubTab === "post" ? "active" : ""} onClick={() => setChatterSubTab("post")}>Post</button>
                            <button className={chatterSubTab === "email" ? "active" : ""} onClick={() => setChatterSubTab("email")}>Email</button>
                          </div>

                           {/* Compose Box */}
                          {chatterSubTab === "post" ? (
                            <div className="sf-chatter-compose">
                              <input className="compose-input" type="text" placeholder="Share an update..." value={chatterInput} onChange={e => setChatterInput(e.target.value)} />
                              <div className="compose-actions">
                                <button className="share-btn" onClick={() => {
                                  if (chatterInput.trim()) {
                                    const updated = { ...selectedCase, chatter_posts: [{ user: user.name, avatar: null, action: "Posted", timestamp: "Just now", details: { comment: chatterInput } }, ...(selectedCase.chatter_posts || [])] };
                                    setSelectedCase(updated);
                                    setCases(prev => prev.map(c => c.id === updated.id ? updated : c));
                                    setChatterInput("");
                                    showToast("Chatter", "Update posted successfully", "success");
                                  }
                                }}>Share</button>
                              </div>
                            </div>
                          ) : (
                            <div className="email-compose-form">
                              <div className="email-field-row">
                                <label>To:</label>
                                <input type="email" value={emailForm.to} onChange={e => setEmailForm(prev => ({ ...prev, to: e.target.value }))} placeholder="recipient@example.com" />
                              </div>
                              <div className="email-field-row">
                                <label>CC:</label>
                                <input type="email" value={emailForm.cc} onChange={e => setEmailForm(prev => ({ ...prev, cc: e.target.value }))} placeholder="cc@example.com" />
                              </div>
                              <div className="email-field-row">
                                <label>Subject:</label>
                                <input type="text" value={emailForm.subject} onChange={e => setEmailForm(prev => ({ ...prev, subject: e.target.value }))} placeholder="Subject" />
                              </div>
                              <textarea className="email-body-input" value={emailForm.body} onChange={e => setEmailForm(prev => ({ ...prev, body: e.target.value }))} placeholder="Write your email here..." />
                              <button className="email-send-btn" onClick={handleSendEmail} disabled={emailSending}>
                                {emailSending ? <><i className="fa-solid fa-spinner fa-spin"></i> Sending...</> : <><i className="fa-solid fa-paper-plane"></i> Send Email</>}
                              </button>
                            </div>
                          )}

                          {/* Activity Feed */}
                          <div className="sf-activity-header">
                            <div className="activity-title">
                              Most Recent Activity ▾
                            </div>
                            <div className="activity-controls">
                              <input className="feed-search" type="text" placeholder="Search this feed..." />
                              <button title="Filter"><i className="fa-solid fa-filter"></i></button>
                              <button title="Refresh"><i className="fa-solid fa-rotate"></i></button>
                            </div>
                          </div>

                          {/* Activity Items */}
                          {(selectedCase.chatter_posts || []).map((post, idx) => (
                            <div key={idx} className="sf-activity-item">
                              <div className="activity-avatar">
                                <i className="fa-solid fa-user"></i>
                              </div>
                              <div className="activity-body">
                                <div className="activity-meta">
                                  <span className="activity-user">{post.user}</span>
                                  <span className="activity-time">{post.timestamp}</span>
                                </div>
                                <div className="activity-action">
                                  <span className={`action-badge ${
                                    post.action.toLowerCase().includes('email') ? 'email' :
                                    post.action.toLowerCase().includes('created') ? 'created' :
                                    post.action.toLowerCase().includes('updated') || post.action.toLowerCase().includes('changed') ? 'updated' : 'comment'
                                  }`}>
                                    <i className={`fa-solid ${
                                      post.action.toLowerCase().includes('email') ? 'fa-envelope' :
                                      post.action.toLowerCase().includes('created') ? 'fa-plus-circle' :
                                      post.action.toLowerCase().includes('resolved') ? 'fa-check-circle' : 'fa-pen'
                                    }`}></i>
                                    {post.action}
                                  </span>
                                </div>
                                {post.details && (
                                  <div className="activity-details">
                                    {post.details.comment && <span className="detail-line" style={{ whiteSpace: 'pre-wrap' }}>{post.details.comment}</span>}
                                    {post.details.account_name && <span className="detail-line"><span className="detail-label">Account Name: </span><span className="detail-value">{post.details.account_name}</span></span>}
                                    {post.details.case_number && <span className="detail-line"><span className="detail-label">Case Number: </span><span className="detail-value link">{post.details.case_number}</span></span>}
                                    {post.details.case_record_type && <span className="detail-line"><span className="detail-label">Case Record Type: </span><span className="detail-value">{post.details.case_record_type}</span></span>}
                                    {post.details.priority && <span className="detail-line"><span className="detail-label">Priority: </span><span className="detail-value">{post.details.priority}</span></span>}
                                    {post.details.subject && <span className="detail-line"><span className="detail-label">Subject: </span><span className="detail-value">{post.details.subject}</span></span>}
                                    {post.details.status && <span className="detail-line"><span className="detail-label">Status: </span><span className="detail-value">{post.details.status}</span></span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {(!selectedCase.chatter_posts || selectedCase.chatter_posts.length === 0) && (
                            <div className="sf-related-placeholder">
                              <i className="fa-solid fa-comment-slash"></i>
                              <h3>No activity yet</h3>
                              <p>Share an update to start the conversation</p>
                            </div>
                          )}
                        </div>
                      )}

                      {caseContentTab === "related" && (
                        <div className="sf-related-placeholder">
                          <i className="fa-solid fa-link"></i>
                          <h3>Related Records</h3>
                          <p>Contact, Account, and related records will appear here</p>
                        </div>
                      )}

                      {caseContentTab === "child-cases" && (
                        <div>
                          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Related Child Cases</h3>
                          {cases.filter(c => c.parent_case === selectedCase.id).length > 0 ? (
                            <table className="agent-grid-table">
                              <thead><tr><th>Case Number</th><th>Subject</th><th>Status</th><th>Priority</th></tr></thead>
                              <tbody>
                                {cases.filter(c => c.parent_case === selectedCase.id).map(c => (
                                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedCase(c); setCaseContentTab('chatter'); }}>
                                    <td><strong style={{ color: 'var(--color-primary)' }}>{c.case_number || c.id}</strong></td>
                                    <td>{c.subject}</td>
                                    <td><span className={`case-status-badge ${c.status}`}>{c.status.replace("-", " ")}</span></td>
                                    <td><span className={`case-priority-badge ${c.priority.toLowerCase()}`}>{c.priority}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="sf-related-placeholder">
                              <i className="fa-solid fa-sitemap"></i>
                              <h3>No Child Cases</h3>
                              <p>No related child cases found for this case</p>
                            </div>
                          )}
                        </div>
                      )}

                      {caseContentTab === "mcom" && (
                        <div className="sf-related-placeholder">
                          <i className="fa-solid fa-building"></i>
                          <h3>MCOM</h3>
                          <p>MCOM integration data will appear here</p>
                        </div>
                      )}

                      {caseContentTab === "return-form" && (
                        <div className="sf-related-placeholder">
                          <i className="fa-solid fa-rotate-left"></i>
                          <h3>Return Form</h3>
                          <p>Return form details will appear here</p>
                        </div>
                      )}

                      {caseContentTab === "sla" && (
                        <div className="sf-related-placeholder">
                          <i className="fa-solid fa-clock"></i>
                          <h3>SLA Tracking</h3>
                          <p>SLA milestones and compliance data will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT PANEL — Case Sidebar */}
                  <div className="sf-case-right-panel">
                    <button className="ownership-btn" onClick={() => showToast('Ownership', 'You are now the owner of this case', 'success')}>
                      Take Ownership
                    </button>

                    <div className="sidebar-field">
                      <span className="sf-field-label">Chat/Contact Channel Name</span>
                      <span className="sf-field-value">{selectedCase.chat_channel_name || "—"}</span>
                    </div>
                    <div className="sidebar-field">
                      <span className="sf-field-label">Chat Status Flag</span>
                      <span className="sf-field-value">{selectedCase.chat_status_flag || "—"}</span>
                    </div>
                    <div className="sidebar-field">
                      <span className="sf-field-label">Chat Wait Minutes</span>
                      <span className="sf-field-value">{(selectedCase.chat_wait_minutes || 0).toFixed(2)}</span>
                    </div>

                    {/* Case Overall Detail — Collapsible */}
                    <div className={`sf-collapsible-section ${caseOverallOpen ? 'open' : ''}`}>
                      <div className="section-header" onClick={() => setCaseOverallOpen(!caseOverallOpen)}>
                        <i className="fa-solid fa-chevron-right"></i>
                        Case Overall Detail
                      </div>
                      <div className="section-body">
                        <div className="detail-row">
                          <div className="detail-cell">
                            <div className="sf-field-label">Status</div>
                            <div className="sf-field-value">
                              <span className={`case-status-badge ${selectedCase.status}`}>{selectedCase.status.replace("-", " ")}</span>
                              <i className="fa-solid fa-pencil edit-icon"></i>
                            </div>
                          </div>
                          <div className="detail-cell">
                            <div className="sf-field-label">Parent Case</div>
                            <div className="sf-field-value">
                              {selectedCase.parent_case ? <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>{selectedCase.parent_case}</span> : "—"}
                              <i className="fa-solid fa-pencil edit-icon"></i>
                            </div>
                          </div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-cell">
                            <div className="sf-field-label">Pending Status</div>
                            <div className="sf-field-value">
                              {selectedCase.pending_status || "—"}
                              <i className="fa-solid fa-pencil edit-icon"></i>
                            </div>
                          </div>
                          <div className="detail-cell">
                            <div className="sf-field-label">Priority</div>
                            <div className="sf-field-value">
                              <span className={`case-priority-badge ${selectedCase.priority.toLowerCase()}`}>{selectedCase.priority}</span>
                              <i className="fa-solid fa-pencil edit-icon"></i>
                            </div>
                          </div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-cell">
                            <div className="sf-field-label">Case Record Type</div>
                            <div className="sf-field-value">
                              {selectedCase.case_record_type || selectedCase.bu}
                              <i className="fa-solid fa-pencil edit-icon"></i>
                            </div>
                          </div>
                          <div className="detail-cell">
                            <div className="sf-field-label">Case Origin</div>
                            <div className="sf-field-value">
                              <i className={`fa-brands ${selectedCase.case_origin === "Facebook" ? "fa-facebook" : selectedCase.case_origin === "LINE" ? "fa-line" : "fa-solid fa-envelope"}`} style={{ marginRight: '4px', fontSize: '12px' }}></i>
                              {selectedCase.case_origin}
                              <i className="fa-solid fa-pencil edit-icon"></i>
                            </div>
                          </div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-cell">
                            <div className="sf-field-label">Owner</div>
                            <div className="sf-field-value">
                              {selectedCase.owner || "Unassigned"}
                              <i className="fa-solid fa-pencil edit-icon"></i>
                            </div>
                          </div>
                          <div className="detail-cell">
                            <div className="sf-field-label">Type</div>
                            <div className="sf-field-value">
                              {selectedCase.type}
                              <i className="fa-solid fa-pencil edit-icon"></i>
                            </div>
                          </div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-cell">
                            <div className="sf-field-label">Case Reason</div>
                            <div className="sf-field-value">
                              {selectedCase.case_reason}
                              <i className="fa-solid fa-pencil edit-icon"></i>
                            </div>
                          </div>
                          <div className="detail-cell">
                            <div className="sf-field-label">Root Cause</div>
                            <div className="sf-field-value">
                              {selectedCase.root_cause || "—"}
                              <i className="fa-solid fa-pencil edit-icon"></i>
                            </div>
                          </div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-cell">
                            <div className="sf-field-label">Contact Name</div>
                            <div className="sf-field-value">
                              {selectedCase.contact_name}
                              <i className="fa-solid fa-pencil edit-icon"></i>
                            </div>
                          </div>
                          <div className="detail-cell">
                            <div className="sf-field-label">Created Date</div>
                            <div className="sf-field-value">
                              {new Date(selectedCase.created_at).toLocaleString("th-TH")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM UTILITY BAR */}
                  <div className="sf-utility-bar">
                    <button className="utility-item" onClick={() => showToast('Auto Assign', 'Auto-assigning cases...', 'info')}><i className="fa-solid fa-robot"></i> Auto Assign</button>
                    <button className="utility-item"><i className="fa-solid fa-clock-rotate-left"></i> History</button>
                    <button className="utility-item"><i className="fa-solid fa-clock"></i> Recent Items</button>
                    <button className="utility-item"><i className="fa-solid fa-headset"></i> Omni-Channel</button>
                    <button className="utility-item"><i className="fa-solid fa-video"></i> Invite Form - Visual Remote Assistant</button>
                    <button className="utility-item"><i className="fa-solid fa-tv"></i> Visual Remote Assistant - Video Dashboard</button>
                  </div>
                </div>
              ) : (
                /* === CASE LIST VIEW === */
                <div>
                  {/* Summary Stats */}
                  <div className="stat-summary-row">
                    <div className="stat-summary-card"><div className="stat-icon orange"><i className="fa-solid fa-inbox"></i></div><div className="stat-info"><span className="stat-value">{cases.filter(c => c.status === "new").length}</span><span className="stat-label">New</span></div></div>
                    <div className="stat-summary-card"><div className="stat-icon red"><i className="fa-solid fa-fire"></i></div><div className="stat-info"><span className="stat-value">{cases.filter(c => ["open", "pending-customer", "pending-internal"].includes(c.status)).length}</span><span className="stat-label">Active</span></div></div>
                    <div className="stat-summary-card"><div className="stat-icon green"><i className="fa-solid fa-check-circle"></i></div><div className="stat-info"><span className="stat-value">{cases.filter(c => c.status === "solved").length}</span><span className="stat-label">Solved</span></div></div>
                    <div className="stat-summary-card"><div className="stat-icon grey"><i className="fa-solid fa-box-archive"></i></div><div className="stat-info"><span className="stat-value">{cases.filter(c => ["closed", "duplicate", "spam"].includes(c.status)).length}</span><span className="stat-label">Closed</span></div></div>
                    <div className="stat-summary-card"><div className="stat-icon blue"><i className="fa-solid fa-chart-bar"></i></div><div className="stat-info"><span className="stat-value">{cases.length}</span><span className="stat-label">Total Cases</span></div></div>
                  </div>

                  {/* Filters */}
                  <div className="monitor-header-actions" style={{ marginBottom: "20px" }}>
                    <div className="search-ctrl-box">
                      <i className="fa-solid fa-magnifying-glass"></i>
                      <input type="text" placeholder="ค้นหา Case ID, หัวข้อ, ชื่อลูกค้า..." value={caseSearch} onChange={(e) => setCaseSearch(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <select className="form-select-ctrl" style={{ width: "auto" }} value={caseStatusFilter} onChange={(e) => setCaseStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="new">🟡 New</option>
                        <option value="open">🔴 Open</option>
                        <option value="pending-customer">⏳ Pending Customer</option>
                        <option value="pending-internal">🔵 Pending Internal</option>
                        <option value="solved">🟢 Solved</option>
                        <option value="closed">⚪ Closed</option>
                        <option value="duplicate">Duplicate</option>
                        <option value="spam">Spam</option>
                      </select>
                      <select className="form-select-ctrl" style={{ width: "auto" }} value={casePriorityFilter} onChange={(e) => setCasePriorityFilter(e.target.value)}>
                        <option value="all">All Priority</option>
                        <option value="critical">🔴 Critical</option>
                        <option value="high">🟠 High</option>
                        <option value="medium">🔵 Medium</option>
                        <option value="low">⚪ Low</option>
                      </select>
                    </div>
                  </div>

                  {/* Case Table */}
                  <table className="agent-grid-table">
                    <thead>
                      <tr>
                        <th>Case ID</th>
                        <th>หัวข้อ</th>
                        <th>ลูกค้า</th>
                        <th>ช่องทาง</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Owner</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases
                        .filter(c => caseStatusFilter === "all" || c.status === caseStatusFilter)
                        .filter(c => casePriorityFilter === "all" || c.priority.toLowerCase() === casePriorityFilter)
                        .filter(c => !caseSearch || c.id.toLowerCase().includes(caseSearch.toLowerCase()) || c.subject.toLowerCase().includes(caseSearch.toLowerCase()) || c.contact_name.toLowerCase().includes(caseSearch.toLowerCase()))
                        .map(c => (
                          <tr key={c.id} style={{ cursor: "pointer" }} onClick={() => setSelectedCase(c)}>
                            <td><strong style={{ color: "var(--color-primary)" }}>{c.id}</strong></td>
                            <td>
                              {c.subject}
                              {c.is_vip && <span className="vip-flag" style={{ marginLeft: "6px" }}><i className="fa-solid fa-crown"></i> VIP</span>}
                            </td>
                            <td>{c.contact_name}</td>
                            <td><i className={`fa-brands ${c.case_origin === "Facebook" ? "fa-facebook" : c.case_origin === "LINE" ? "fa-line" : "fa-solid fa-envelope"}`} style={{ marginRight: "4px" }}></i>{c.case_origin}</td>
                            <td><span className={`case-priority-badge ${c.priority.toLowerCase()}`}>{c.priority}</span></td>
                            <td><span className={`case-status-badge ${c.status}`}>{c.status.replace("-", " ")}</span></td>
                            <td>{c.owner || <span style={{ color: "var(--text-muted)" }}>Unassigned</span>}</td>
                            <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{new Date(c.created_at).toLocaleDateString("th-TH")}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW: CHAT & SHOP — Live Chat Console */}
          {activeTab === "chat" && (
            <div className="chat-view-wrapper">
              {/* Open Conversation Chips */}
              <div className="chat-chips-bar">
                {chatSessions.filter(s => s.status === "active").map(s => (
                  <div key={s.id} className={`chat-chip ${activeChat && activeChat.id === s.id ? 'active' : ''}`} onClick={() => { setActiveChat(s); setChatViewMode('chat'); }}>
                    <span className={`chip-channel-icon ${s.channel}`}>
                      <i className={`fa-brands ${s.channel === 'line' ? 'fa-line' : s.channel === 'facebook' ? 'fa-facebook-f' : 'fa-instagram'}`}></i>
                    </span>
                    {s.customer_name}
                    <span className="chip-close" onClick={e => { e.stopPropagation(); }}>×</span>
                  </div>
                ))}
              </div>

              {/* Channel Filter + View Toggle */}
              <div className="chat-top-controls">
                <div className="channel-filter-group">
                  <span className="filter-label">Channel:</span>
                  {[{ key: "all", label: "All", icon: "fa-solid fa-globe" }, { key: "line", label: "LINE", icon: "fa-brands fa-line" }, { key: "facebook", label: "Facebook", icon: "fa-brands fa-facebook-f" }, { key: "instagram", label: "Instagram", icon: "fa-brands fa-instagram" }].map(ch => (
                    <button key={ch.key} className={`channel-filter-btn ${chatChannelFilter === ch.key ? 'active' : ''}`} onClick={() => setChatChannelFilter(ch.key)}>
                      <i className={ch.icon}></i> {ch.label}
                      <span className="channel-count">{ch.key === "all" ? chatSessions.length : chatSessions.filter(s => s.channel === ch.key).length}</span>
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="chat-search" style={{ width: '200px' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'var(--text-muted)' }}></i>
                    <input type="text" placeholder="Search..." value={chatSearchTerm} onChange={e => setChatSearchTerm(e.target.value)} style={{ width: '100%', padding: '6px 10px 6px 30px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px' }} />
                  </div>
                  <div className="view-toggle-group">
                    <button className={`view-toggle-btn ${chatViewMode === 'list' ? 'active' : ''}`} onClick={() => setChatViewMode('list')}><i className="fa-solid fa-table-list"></i> List</button>
                    <button className={`view-toggle-btn ${chatViewMode === 'chat' ? 'active' : ''}`} onClick={() => setChatViewMode('chat')}><i className="fa-solid fa-comments"></i> Chat</button>
                  </div>
                </div>
              </div>

              {/* LIST / TABLE VIEW */}
              {chatViewMode === "list" && (
                <div className="chat-table-view">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>Pin</th>
                        <th>Ref No</th>
                        <th>Status <span className="sort-icon">⇅</span></th>
                        <th>Stage</th>
                        <th>Customer</th>
                        <th>Source <span className="sort-icon">⇅</span></th>
                        <th>BU</th>
                        <th>Last Contact <span className="sort-icon">⇅</span></th>
                        <th>Subject</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chatSessions
                        .filter(s => chatChannelFilter === "all" || s.channel === chatChannelFilter)
                        .filter(s => chatFilter === "all" || s.status === chatFilter)
                        .filter(s => !chatSearchTerm || s.customer_name.toLowerCase().includes(chatSearchTerm.toLowerCase()) || s.account.toLowerCase().includes(chatSearchTerm.toLowerCase()))
                        .sort(sortChatSessions)
                        .map(s => (
                          <tr key={s.id} className={activeChat && activeChat.id === s.id ? 'active' : ''} onClick={() => { setActiveChat(s); setChatViewMode('chat'); }}>
                            <td onClick={(e) => togglePinChat(s.id, e)}>
                              <i className={`${s.pinned ? 'fa-solid' : 'fa-regular'} fa-star pin-star`} style={{ color: s.pinned ? 'var(--color-warning)' : 'inherit', cursor: 'pointer' }}></i>
                            </td>
                            <td><strong style={{ color: 'var(--color-primary)' }}>{s.id}</strong></td>
                            <td>
                              <span className={`status-pill ${getChatColorStatus(s)}`}>
                                {(() => {
                                  const col = getChatColorStatus(s);
                                  if (col === 'queued') return 'QUEUED';
                                  if (col === 'inprogress') return 'IN PROGRESS';
                                  if (col === 'pending-short') return 'PENDING SHORT';
                                  if (col === 'pending-medium') return 'PENDING MEDIUM';
                                  if (col === 'pending-critical') return 'CRITICAL';
                                  return s.status === "active" ? "OPEN" : s.status === "waiting" ? "WAITING" : "CLOSED";
                                })()}
                                {['pending-short', 'pending-medium', 'pending-critical'].includes(getChatColorStatus(s)) && (
                                  <span className="elapsed-time" style={{ color: 'inherit', marginLeft: '6px' }}>
                                    ({getElapsedMinutes(s)}m)
                                  </span>
                                )}
                              </span>
                            </td>

                            <td>New</td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 500 }}>{s.customer_name}</span>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.account}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`source-badge ${s.channel}`}>
                                <i className={`fa-brands ${s.channel === 'line' ? 'fa-line' : s.channel === 'facebook' ? 'fa-facebook-f' : 'fa-instagram'}`}></i>
                                {s.channel === "line" ? "Line" : s.channel === "facebook" ? "Facebook" : "Instagram"}
                              </span>
                            </td>
                            <td>CDS</td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '12px' }}>{s.last_time}</span>
                              </div>
                            </td>
                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.last_message}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              )}

              {/* CHAT VIEW (existing 3-panel) */}
              {chatViewMode === "chat" && (
                <div className="chat-console-layout" style={{ flex: 1 }}>
                  {/* LEFT: Chat List */}
                  <div className="chat-list-panel">
                    <div className="chat-list-header">
                      <h3>
                        <i className="fa-solid fa-comments"></i> Conversations
                        <span className="chat-count-badge">{chatSessions.filter(s => s.unread > 0).length}</span>
                      </h3>
                      <div className="chat-filter-bar">
                        {["all", "active", "waiting", "closed"].map(f => (
                          <button key={f} className={chatFilter === f ? "active" : ""} onClick={() => setChatFilter(f)}>
                            {f === "all" ? "All" : f === "active" ? "Active" : f === "waiting" ? "Waiting" : "Closed"}
                          </button>
                        ))}
                      </div>
                      <div className="chat-search">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input type="text" placeholder="Search conversations..." value={chatSearchTerm} onChange={e => setChatSearchTerm(e.target.value)} />
                      </div>
                    </div>
                    <div className="chat-list-items">
                      {chatSessions
                        .filter(s => chatFilter === "all" || s.status === chatFilter)
                        .filter(s => chatChannelFilter === "all" || s.channel === chatChannelFilter)
                        .filter(s => !chatSearchTerm || s.customer_name.toLowerCase().includes(chatSearchTerm.toLowerCase()) || s.account.toLowerCase().includes(chatSearchTerm.toLowerCase()))
                        .sort(sortChatSessions)
                        .map(s => (
                          <div key={s.id} className={`chat-list-entry ${activeChat && activeChat.id === s.id ? 'active' : ''}`} onClick={() => setActiveChat(s)}>
                            <div className="chat-avatar">
                              {s.customer_name.charAt(0)}
                              <span className={`channel-badge ${s.channel}`}>
                                <i className={`fa-brands ${s.channel === 'line' ? 'fa-line' : s.channel === 'facebook' ? 'fa-facebook-f' : 'fa-instagram'}`}></i>
                              </span>
                            </div>
                            <div className="chat-entry-info">
                              <div className="chat-entry-top">
                                <span className="chat-entry-name" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {s.customer_name}
                                  <i className={`${s.pinned ? 'fa-solid' : 'fa-regular'} fa-star`} style={{ color: s.pinned ? 'var(--color-warning)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '11px' }} onClick={(e) => togglePinChat(s.id, e)}></i>
                                </span>
                                <span className="chat-entry-time">{s.last_time}</span>
                              </div>
                              <div className="chat-entry-preview">{s.last_message}</div>
                              <div className="chat-entry-status">
                                <span className={`status-dot ${getChatColorStatus(s)}`}></span>
                                <span>
                                  {(() => {
                                    const col = getChatColorStatus(s);
                                    if (col === 'queued') return 'Queued';
                                    if (col === 'inprogress') return 'In Progress';
                                    if (col === 'pending-short') return 'Pending';
                                    if (col === 'pending-medium') return 'Pending';
                                    if (col === 'pending-critical') return 'Critical';
                                    return s.status === "active" ? "Active" : s.status === "waiting" ? "Waiting" : "Closed";
                                  })()}
                                </span>
                                {['pending-short', 'pending-medium', 'pending-critical'].includes(getChatColorStatus(s)) && (
                                  <span className="elapsed-time">({getElapsedMinutes(s)}m ago)</span>
                                )}
                              </div>
                            </div>
                            {s.unread > 0 && <span className="unread-badge">{s.unread}</span>}
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  {/* CENTER: Chat Window */}
                  <div className="chat-window-panel">
                    {activeChat ? (
                      <>
                        <div className="chat-window-header">
                          <div className="chat-partner-info">
                            <div className="partner-avatar"><i className="fa-solid fa-user"></i></div>
                            <div>
                              <div className="partner-name">{activeChat.customer_name}({activeChat.channel === "line" ? "Line" : activeChat.channel === "facebook" ? "Facebook" : "Instagram"})</div>
                              <div className="partner-channel">{activeChat.account} • {activeChat.phone}</div>
                            </div>
                          </div>
                          <div className="chat-header-actions">
                            <button className="transfer-btn" onClick={() => showToast("Transfer", "Chat transfer initiated", "info")}><i className="fa-solid fa-share"></i> Transfer Chat</button>
                            <button onClick={() => showToast("Refresh", "Chat refreshed", "info")}><i className="fa-solid fa-rotate"></i></button>
                          </div>
                        </div>

                        <div className="chat-toolbar">
                          <button className={`toolbar-btn ${activeChat.channel === 'line' ? 'channel-line' : activeChat.channel === 'facebook' ? 'channel-fb' : 'channel-ig'}`}>
                            <i className={`fa-brands ${activeChat.channel === 'line' ? 'fa-line' : activeChat.channel === 'facebook' ? 'fa-facebook-f' : 'fa-instagram'}`}></i>
                          </button>
                          <button className="toolbar-btn" onClick={() => showToast("Close", "Chat will be closed", "warning")}><i className="fa-solid fa-xmark"></i></button>
                          <div className="internal-toggle">
                            <label className="switch-control" style={{ transform: 'scale(0.7)' }}><input type="checkbox" /><span className="switch-slider"></span></label>
                            <span>Internal</span>
                          </div>
                          <button className="toolbar-btn" onClick={() => fileInputRef.current?.click()}><i className="fa-solid fa-paperclip"></i> File</button>
                          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,audio/*,video/*,.pdf,.doc,.docx" onChange={handleFileChange} />
                          <select defaultValue="">
                            <option value="">-- Auto Message --</option>
                            <option value="greeting">สวัสดีค่ะ ยินดีให้บริการ</option>
                            <option value="wait">กรุณารอสักครู่นะคะ</option>
                            <option value="thanks">ขอบคุณที่ติดต่อมาค่ะ</option>
                            <option value="transfer">ขอส่งต่อให้ทีมที่เกี่ยวข้องนะคะ</option>
                          </select>
                        </div>

                        <div className="chat-messages-area">
                          {activeChat.messages.map((msg, idx) => (
                            <div key={idx} className={`chat-bubble-wrapper ${msg.sender}`}>
                              <div className="chat-bubble">
                                {msg.text}
                                {msg.attachment && (
                                  <div style={{ marginTop: '8px' }}>
                                    {msg.attachment.type.startsWith('image/') ? (
                                      <img src={msg.attachment.data} className="chat-bubble-image" alt={msg.attachment.name} onClick={() => {
                                        const w = window.open();
                                        w.document.write(`<img src="${msg.attachment.data}" style="max-width:100%; max-height:100%; margin:auto; display:block;"/>`);
                                      }} />
                                    ) : msg.attachment.type.startsWith('audio/') ? (
                                      <audio controls src={msg.attachment.data} className="chat-bubble-audio" />
                                    ) : msg.attachment.type.startsWith('video/') ? (
                                      <video controls src={msg.attachment.data} className="chat-bubble-video" />
                                    ) : (
                                      <a href={msg.attachment.data} download={msg.attachment.name} className="file-attachment-link">
                                        <i className="fa-solid fa-download"></i> Download {msg.attachment.name}
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="chat-bubble-meta">{msg.sender === "bot" ? "Bot" : msg.sender === "agent" ? "Agent" : msg.sender === "system" ? "System" : activeChat.customer_name} • {msg.time}</div>
                            </div>
                          ))}
                        </div>

                        <div className="chat-input-area" style={{ flexDirection: 'column' }}>
                          {chatFilePreview && (
                            <div className="file-preview-bar" style={{ width: '100%' }}>
                              <div className="file-preview-info">
                                <i className={chatFilePreview.type.startsWith('image/') ? 'fa-solid fa-file-image' : chatFilePreview.type.startsWith('audio/') ? 'fa-solid fa-file-audio' : chatFilePreview.type.startsWith('video/') ? 'fa-solid fa-file-video' : 'fa-solid fa-file'}></i>
                                <span>{chatFilePreview.name}</span>
                              </div>
                              <button className="file-preview-remove" onClick={() => setChatFilePreview(null)}>
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            </div>
                          )}
                          <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
                            <textarea placeholder="Chat with customer..." value={chatMessageInput} onChange={e => setChatMessageInput(e.target.value)} onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendChatSessionMessage();
                              }
                            }} />
                            <button className="send-btn" onClick={handleSendChatSessionMessage}>Send</button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-comments" style={{ fontSize: '48px' }}></i>
                        <h3 style={{ color: 'var(--text-secondary)' }}>Select a conversation</h3>
                        <p style={{ fontSize: '13px' }}>Choose a chat from the left panel to start</p>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Customer Detail */}
                  <div className="chat-customer-panel">
                    {activeChat ? (
                      <>
                        <div className="customer-header">
                          <div className="customer-avatar-lg">{activeChat.customer_name.charAt(0)}</div>
                          <h3>{activeChat.customer_name}</h3>
                          <div className="customer-channel">
                            <i className={`fa-brands ${activeChat.channel === 'line' ? 'fa-line' : activeChat.channel === 'facebook' ? 'fa-facebook-f' : 'fa-instagram'}`} style={{ marginRight: '4px' }}></i>
                            {activeChat.channel === "line" ? "LINE" : activeChat.channel === "facebook" ? "Facebook" : "Instagram"}
                          </div>
                        </div>
                        <div className="customer-section">
                          <h4><i className="fa-solid fa-user"></i> Contact Info</h4>
                          <div className="detail-item"><span className="label">Account</span><span className="value">{activeChat.account}</span></div>
                          <div className="detail-item"><span className="label">Phone</span><span className="value">{activeChat.phone}</span></div>
                          <div className="detail-item"><span className="label">Channel</span><span className="value">{activeChat.channel === "line" ? "LINE" : activeChat.channel === "facebook" ? "Facebook" : "Instagram"}</span></div>
                          <div className="detail-item"><span className="label">Status</span><span className="value">{activeChat.status}</span></div>
                        </div>
                        {activeChat.opportunity_id && (
                          <div className="customer-section">
                            <h4><i className="fa-solid fa-folder-open"></i> Opportunity</h4>
                            <div className="detail-item"><span className="label">ID</span><span className="value link">{activeChat.opportunity_id}</span></div>
                            <div className="detail-item"><span className="label">Record Type</span><span className="value">CDS</span></div>
                            <div className="detail-item"><span className="label">Business Unit</span><span className="value">CDS</span></div>
                          </div>
                        )}
                        {activeChat.case_id && (
                          <div className="customer-section">
                            <h4><i className="fa-solid fa-ticket"></i> Related Case</h4>
                            <div className="detail-item"><span className="label">Case ID</span><span className="value link">{activeChat.case_id}</span></div>
                            <div className="detail-item"><span className="label">Record Type</span><span className="value">CDS</span></div>
                          </div>
                        )}
                        <div className="customer-section">
                          <h4><i className="fa-solid fa-clock-rotate-left"></i> Chat Stats</h4>
                          <div className="detail-item"><span className="label">Messages</span><span className="value">{activeChat.messages.length}</span></div>
                          <div className="detail-item"><span className="label">Started</span><span className="value">{activeChat.messages[0]?.time || "—"}</span></div>
                          <div className="detail-item"><span className="label">Last Activity</span><span className="value">{activeChat.last_time}</span></div>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', flexDirection: 'column', gap: '8px' }}>
                        <i className="fa-solid fa-user-circle" style={{ fontSize: '40px' }}></i>
                        <p style={{ fontSize: '12px' }}>Customer details</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Utility Bar */}
              <div className="sf-utility-bar" style={{ flexShrink: 0 }}>
                <button className="utility-item" onClick={() => showToast('Auto Assign', 'Auto-assigning chats...', 'info')}><i className="fa-solid fa-robot"></i> Auto Assignment</button>
                <button className="utility-item"><i className="fa-solid fa-rotate"></i> AutoRefresh_Listview</button>
                <button className="utility-item"><i className="fa-solid fa-headset"></i> DA Status and Current Capacity</button>
              </div>
            </div>
          )}

          {/* VIEW: ORDER MANAGEMENT */}
          {activeTab === "order" && (
            <div className="view-container">
              {/* Summary Stats */}
              <div className="stat-summary-row">
                <div className="stat-summary-card"><div className="stat-icon grey"><i className="fa-solid fa-file-lines"></i></div><div className="stat-info"><span className="stat-value">{orders.filter(o => o.status === "draft").length}</span><span className="stat-label">Draft</span></div></div>
                <div className="stat-summary-card"><div className="stat-icon orange"><i className="fa-solid fa-clock"></i></div><div className="stat-info"><span className="stat-value">{orders.filter(o => o.status === "pending-payment").length}</span><span className="stat-label">Pending Payment</span></div></div>
                <div className="stat-summary-card"><div className="stat-icon green"><i className="fa-solid fa-check-double"></i></div><div className="stat-info"><span className="stat-value">{orders.filter(o => ["paid", "printed"].includes(o.status)).length}</span><span className="stat-label">Paid / Printed</span></div></div>
                <div className="stat-summary-card"><div className="stat-icon blue"><i className="fa-solid fa-baht-sign"></i></div><div className="stat-info"><span className="stat-value">฿{orders.filter(o => ["paid", "printed"].includes(o.status)).reduce((s, o) => s + o.amount, 0).toLocaleString()}</span><span className="stat-label">Revenue</span></div></div>
              </div>

              {/* Filters */}
              <div className="monitor-header-actions" style={{ marginBottom: "20px" }}>
                <div className="search-ctrl-box">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <input type="text" placeholder="ค้นหา Order ID, ลูกค้า, สินค้า..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} />
                </div>
                <select className="form-select-ctrl" style={{ width: "auto" }} value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending-payment">Pending Payment</option>
                  <option value="paid">Paid</option>
                  <option value="printed">Printed</option>
                  <option value="void">Void</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Order Table */}
              <table className="agent-grid-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>ลูกค้า</th>
                    <th>รายการสินค้า</th>
                    <th>มูลค่า (฿)</th>
                    <th>Status</th>
                    <th>ช่องทางชำระ</th>
                    <th>POS Ticket</th>
                    <th>วันที่สร้าง</th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .filter(o => orderStatusFilter === "all" || o.status === orderStatusFilter)
                    .filter(o => !orderSearch || o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.customer.toLowerCase().includes(orderSearch.toLowerCase()) || o.items.toLowerCase().includes(orderSearch.toLowerCase()))
                    .map(o => (
                      <tr key={o.id}>
                        <td><strong style={{ color: "var(--color-primary)" }}>{o.id}</strong></td>
                        <td>{o.customer}</td>
                        <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.items}</td>
                        <td style={{ fontWeight: 700, fontFamily: "var(--font-heading)" }}>฿{o.amount.toLocaleString()}</td>
                        <td><span className={`order-status-badge ${o.status}`}>{o.status.replace("-", " ")}</span></td>
                        <td>{o.payment_method || <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                        <td>{o.pos_ticket || <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                        <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{o.created_at}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}


          {/* VIEW: OPPORTUNITY (KANBAN) */}
          {activeTab === "opportunity" && (
            <div className="view-container">
              <div className="pipeline-wrapper">
                {/* Column: New */}
                <div className="pipeline-column" data-stage="new" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, "new")}>
                  <div className="column-header">
                    <span className="column-title"><span className="title-dot new"></span>โอกาสขายใหม่</span>
                    <span className="column-count">{opportunities.filter(o => o.stage === "new").length}</span>
                  </div>
                  <div className="column-cards-container">
                    {opportunities.filter(o => o.stage === "new").map(opp => (
                      <div key={opp.id} className="kanban-card" draggable onDragStart={(e) => handleDragStart(e, opp.id)}>
                        <div className="card-top">
                          <span className="card-company">{opp.company}</span>
                          <span className="card-id">{opp.id}</span>
                        </div>
                        <h5 className="card-title">{opp.title}</h5>
                        <div className="card-contact"><i className="fa-regular fa-user"></i> {opp.contact_name || opp.contactName} ({opp.phone})</div>
                        <div className="card-footer">
                          <span className="card-amount">฿{parseFloat(opp.value || 0).toLocaleString()}</span>
                          <span className="card-days">{opp.days} วันก่อน</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column: Qualified */}
                <div className="pipeline-column" data-stage="qualified" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, "qualified")}>
                  <div className="column-header">
                    <span className="column-title"><span className="title-dot qualified"></span>ติดต่อเสนอแนะ</span>
                    <span className="column-count">{opportunities.filter(o => o.stage === "qualified").length}</span>
                  </div>
                  <div className="column-cards-container">
                    {opportunities.filter(o => o.stage === "qualified").map(opp => (
                      <div key={opp.id} className="kanban-card" draggable onDragStart={(e) => handleDragStart(e, opp.id)}>
                        <div className="card-top">
                          <span className="card-company">{opp.company}</span>
                          <span className="card-id">{opp.id}</span>
                        </div>
                        <h5 className="card-title">{opp.title}</h5>
                        <div className="card-contact"><i className="fa-regular fa-user"></i> {opp.contact_name || opp.contactName} ({opp.phone})</div>
                        <div className="card-footer">
                          <span className="card-amount">฿{parseFloat(opp.value || 0).toLocaleString()}</span>
                          <span className="card-days">{opp.days} วันก่อน</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column: Proposal */}
                <div className="pipeline-column" data-stage="proposal" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, "proposal")}>
                  <div className="column-header">
                    <span className="column-title"><span className="title-dot proposal"></span>ยื่นใบเสนอราคา</span>
                    <span className="column-count">{opportunities.filter(o => o.stage === "proposal").length}</span>
                  </div>
                  <div className="column-cards-container">
                    {opportunities.filter(o => o.stage === "proposal").map(opp => (
                      <div key={opp.id} className="kanban-card" draggable onDragStart={(e) => handleDragStart(e, opp.id)}>
                        <div className="card-top">
                          <span className="card-company">{opp.company}</span>
                          <span className="card-id">{opp.id}</span>
                        </div>
                        <h5 className="card-title">{opp.title}</h5>
                        <div className="card-contact"><i className="fa-regular fa-user"></i> {opp.contact_name || opp.contactName} ({opp.phone})</div>
                        <div className="card-footer">
                          <span className="card-amount">฿{parseFloat(opp.value || 0).toLocaleString()}</span>
                          <span className="card-days">{opp.days} วันก่อน</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column: Won */}
                <div className="pipeline-column" data-stage="won" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, "won")}>
                  <div className="column-header">
                    <span className="column-title"><span className="title-dot won"></span>ปิดการขายสำเร็จ (Won)</span>
                    <span className="column-count">{opportunities.filter(o => o.stage === "won").length}</span>
                  </div>
                  <div className="column-cards-container">
                    {opportunities.filter(o => o.stage === "won").map(opp => (
                      <div key={opp.id} className="kanban-card" draggable onDragStart={(e) => handleDragStart(e, opp.id)}>
                        <div className="card-top">
                          <span className="card-company">{opp.company}</span>
                          <span className="card-id">{opp.id}</span>
                        </div>
                        <h5 className="card-title">{opp.title}</h5>
                        <div className="card-contact"><i className="fa-regular fa-user"></i> {opp.contact_name || opp.contactName} ({opp.phone})</div>
                        <div className="card-footer">
                          <span className="card-amount">฿{parseFloat(opp.value || 0).toLocaleString()}</span>
                          <span className="card-days">{opp.days} วันก่อน</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column: Lost */}
                <div className="pipeline-column" data-stage="lost" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, "lost")}>
                  <div className="column-header">
                    <span className="column-title"><span className="title-dot lost"></span>ล้มเหลว (Lost)</span>
                    <span className="column-count">{opportunities.filter(o => o.stage === "lost").length}</span>
                  </div>
                  <div className="column-cards-container">
                    {opportunities.filter(o => o.stage === "lost").map(opp => (
                      <div key={opp.id} className="kanban-card" draggable onDragStart={(e) => handleDragStart(e, opp.id)}>
                        <div className="card-top">
                          <span className="card-company">{opp.company}</span>
                          <span className="card-id">{opp.id}</span>
                        </div>
                        <h5 className="card-title">{opp.title}</h5>
                        <div className="card-contact"><i className="fa-regular fa-user"></i> {opp.contact_name || opp.contactName} ({opp.phone})</div>
                        <div className="card-footer">
                          <span className="card-amount">฿{parseFloat(opp.value || 0).toLocaleString()}</span>
                          <span className="card-days">{opp.days} วันก่อน</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: CALL & CHAT SIMULATOR */}
          {activeTab === "call" && (
            <div className="view-container">
              <div className="call-simulator-grid">
                
                {/* Call Form */}
                <div className="info-form-section">
                  <div className="form-group">
                    <label>เลือกหัวข้อโอกาสขยาย เพื่อบันทึกสายโทร</label>
                    <select id="call-opp-select" className="form-select-ctrl" value={activeOppId} onChange={(e) => {
                      setActiveOppId(e.target.value);
                      setCallOutcome("");
                      setCallNotes("");
                    }}>
                      <option value="">-- กรุณาเลือกโอกาสการขาย --</option>
                      {opportunities.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.id} - {o.company} ({o.title.substring(0, 20)}...)
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeOppId ? (
                    <div id="call-details-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>ชื่อลูกค้าติดต่อ</label>
                          <input type="text" className="form-control" readOnly value={opportunities.find(o => o.id === activeOppId)?.contact_name || opportunities.find(o => o.id === activeOppId)?.contactName || ""} />
                        </div>
                        <div className="form-group">
                          <label>เบอร์โทรศัพท์</label>
                          <input type="text" className="form-control" readOnly value={opportunities.find(o => o.id === activeOppId)?.phone || ""} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>มูลค่าโครงการ</label>
                        <input type="text" className="form-control" readOnly value={`฿${parseFloat(opportunities.find(o => o.id === activeOppId)?.value || 0).toLocaleString()}`} />
                      </div>

                      <div className="form-group">
                        <label>สถานะผลสายโทรศัพท์ (Call Outcome)</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <button className={`call-status-pill ${callOutcome === "connected" ? "active" : ""}`} onClick={() => setCallOutcome("connected")}>
                            <i className="fa-solid fa-phone"></i> ติดต่อสำเร็จ
                          </button>
                          <button className={`call-status-pill ${callOutcome === "busy" ? "active" : ""}`} onClick={() => setCallOutcome("busy")}>
                            <i className="fa-solid fa-phone-slash"></i> ลูกค้าติดสาย
                          </button>
                          <button className={`call-status-pill ${callOutcome === "no-answer" ? "active" : ""}`} onClick={() => setCallOutcome("no-answer")}>
                            <i className="fa-solid fa-volume-xmark"></i> ไม่มีคนรับสาย
                          </button>
                          <button className={`call-status-pill ${callOutcome === "callback" ? "active" : ""}`} onClick={() => setCallOutcome("callback")}>
                            <i className="fa-solid fa-calendar-days"></i> นัดโทรกลับ
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>บันทึกการพูดคุย (Call Notes)</label>
                        <textarea className="form-control" rows="4" placeholder="กรอกข้อมูลสรุปความต้องการของลูกค้าและข้อตกลง..." value={callNotes} onChange={(e) => setCallNotes(e.target.value)}></textarea>
                      </div>

                      <button id="save-call-btn" className="call-btn-primary" onClick={handleSaveCallLog}>
                        <i className="fa-solid fa-floppy-disk"></i> บันทึกผลติดตามสายโทร
                      </button>
                    </div>
                  ) : (
                    <div id="call-fallback-message" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                      <i className="fa-solid fa-circle-info" style={{ fontSize: "24px", marginBottom: "12px", color: "var(--color-primary)" }}></i>
                      <p>กรุณาเลือกโอกาสการขายด้านบน เพื่อเริ่มต้นจำลองการประมวลผลสายโทรศัพท์</p>
                    </div>
                  )}
                </div>

                {/* Chat Simulator */}
                <div className="chat-simulator-panel">
                  <div className="chat-header">
                    <div className="chat-logo" id="chat-badge-channel" style={{ backgroundColor: activeOppId ? "#0084FF" : "var(--border-color)" }}>
                      {activeOppId ? <i className="fa-brands fa-facebook-messenger"></i> : <i className="fa-solid fa-comments"></i>}
                    </div>
                    <div className="chat-partner-info">
                      <span className="chat-partner-name" id="chat-partner-name">
                        {activeOppId ? `${opportunities.find(o => o.id === activeOppId)?.company} (${opportunities.find(o => o.id === activeOppId)?.contact_name || opportunities.find(o => o.id === activeOppId)?.contactName})` : "ลูกค้าจำลองแชท"}
                      </span>
                      <span className="chat-partner-channel" id="chat-partner-channel">
                        {activeOppId ? "Facebook Messenger (API Integration)" : "เลือกดีลการขายเพื่อจำลอง"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="chat-body" id="chat-message-viewport" style={{ overflowY: "auto" }}>
                    {!activeOppId ? (
                      <div className="empty-notifications" style={{ margin: "auto" }}>
                        <i className="fa-solid fa-comments" style={{ fontSize: "32px", color: "var(--border-color)", marginBottom: "12px" }}></i>
                        <p>เลือกโอกาสขายเพื่อเปิดระบบเชื่อมแชทไลน์ของลูกค้า</p>
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="empty-notifications" style={{ margin: "auto" }}>
                        <i className="fa-solid fa-envelope-open" style={{ fontSize: "28px", color: "var(--border-color)", marginBottom: "8px" }}></i>
                        <p>ยังไม่มีข้อความส่งตรงถึงห้องสนทนานี้</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div key={i} className={`chat-message-row ${msg.sender}`}>
                          <div className="chat-bubble">
                            {msg.text}
                            <div style={{ fontSize: "9px", textAlign: "right", marginTop: "4px", opacity: 0.6 }}>{msg.time}</div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="chat-footer" style={{ opacity: activeOppId ? 1 : 0.5, pointerEvents: activeOppId ? "auto" : "none" }}>
                    <input type="text" className="chat-input" placeholder="พิมพ์ข้อความตอบกลับลูกค้า..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()} />
                    <button className="chat-send-btn" onClick={handleSendChatMessage}><i className="fa-solid fa-paper-plane"></i></button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* VIEW: SEGMENTS */}
          {activeTab === "segment" && (
            <div className="view-container">
              <div className="monitor-header-actions" style={{ marginBottom: "20px" }}>
                <div className="search-ctrl-box">
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <input type="text" id="segment-search-input" placeholder="ค้นหาชื่อ บจก. / ช่างรับเหมา..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
                </div>
                
                <div style={{ display: "flex", gap: "8px" }}>
                  {["ทั้งหมด", "Platinum Tier", "VIP Builder", "SME Contractor", "Retail Walk-In"].map(seg => (
                    <button key={seg} className={`panel-action-btn ${seg === customerActiveFilter ? "active" : ""}`} style={{
                      borderColor: seg === customerActiveFilter ? "var(--color-primary)" : "",
                      backgroundColor: seg === customerActiveFilter ? "var(--color-primary)" : "",
                      color: seg === customerActiveFilter ? "#FFFFFF" : ""
                    }} onClick={() => setCustomerActiveFilter(seg)}>
                      {seg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="agent-grid-table-container">
                <table className="agent-grid-table">
                  <thead>
                    <tr>
                      <th>รหัสลูกค้า</th>
                      <th>ชื่อบริษัท / ลูกค้าโครงการ</th>
                      <th>กลุ่มเซกเมนต์ (Segment)</th>
                      <th>จังหวัด</th>
                      <th>ยอดขายสะสมล่าสุด</th>
                      <th>วันที่ติดต่อล่าสุด</th>
                      <th>สถานะติดตาม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>ไม่มีข้อมูลลูกค้าตรงกับเงื่อนไขการกรอง</td>
                      </tr>
                    ) : (
                      customers.map(c => {
                        let contactDate = c.last_contact || c.lastContact || "";
                        if (contactDate.includes("T")) contactDate = contactDate.slice(0, 10);
                        return (
                          <tr key={c.code}>
                            <td><strong>{c.code}</strong></td>
                            <td>{c.name}</td>
                            <td><span style={{ color: "var(--color-secondary)", fontWeight: "500" }}>{c.segment}</span></td>
                            <td>{c.province}</td>
                            <td>{c.last_order || c.lastOrder}</td>
                            <td>{contactDate}</td>
                            <td style={{ color: c.status === "ติดตามด่วน" ? "var(--color-danger)" : "var(--text-secondary)", fontWeight: c.status === "ติดตามด่วน" ? 600 : 400 }}>
                              <i className={`fa-solid ${c.status === "ติดตามด่วน" ? "fa-triangle-exclamation" : "fa-circle-check"}`} style={{ marginRight: "6px" }}></i>
                              {c.status}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: AGENTS MONITOR */}
          {activeTab === "monitor" && (
            <div className="view-container monitor-view">
              <div className="monitor-header-actions">
                <div style={{ fontSize: "13px", fontWeight: 500 }}>
                  <i className="fa-solid fa-satellite-dish" style={{ color: "var(--color-success)", marginRight: "8px", animation: "pulse 2s infinite" }}></i>
                  ระบบอัปเดตสถานะแบบพุช Real-Time จำลอง 6 เจ้าหน้าที่
                </div>
                
                <button className="panel-action-btn" style={{ borderColor: "var(--color-secondary)", color: "white" }} onClick={async () => {
                  try {
                    const res = await fetch("/api/agents/simulate", { method: "POST" });
                    if (res.ok) {
                      const data = await res.json();
                      showToast("พุชอัปเดตระบบ", data.notification.text, data.notification.type);
                      fetchNotifications();
                      fetchAgents();
                    }
                  } catch (e) {
                    // fallback local update
                    const randAgentIdx = Math.floor(Math.random() * agents.length);
                    const ag = { ...agents[randAgentIdx] };
                    const statuses = ["online", "break", "lunch"];
                    let newStatus = ag.status;
                    while (newStatus === ag.status) {
                      newStatus = statuses[Math.floor(Math.random() * statuses.length)];
                    }
                    ag.status = newStatus;
                    let statusText = "ออนไลน์";
                    let type = "success";
                    if (newStatus === "break") { statusText = "พักเบรก"; type = "warn"; ag.break_remain = 30; } 
                    else if (newStatus === "lunch") { statusText = "พักเที่ยง"; type = "danger"; ag.break_remain = 0; }
                    else { ag.break_remain = 30; }

                    setAgents(prev => prev.map(a => a.id === ag.id ? ag : a));
                    
                    const text = `เจ้าหน้าที่ ${ag.name} (${ag.id}) ได้ปรับเปลี่ยนสถานะการทำงานเป็น -> ${statusText}`;
                    const timeNow = new Date().toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    
                    const newNotif = {
                      id: Date.now(),
                      text,
                      type,
                      time: timeNow,
                      unread: true
                    };
                    setNotifications(prev => [newNotif, ...prev]);
                    showToast("พุชอัปเดตระบบ", text, type);
                  }
                }}>
                  <i className="fa-solid fa-wand-magic-sparkles"></i> สุ่มจำลองการเปลี่ยนสถานะทันที
                </button>
              </div>

              <div className="agent-grid-table-container">
                <table className="agent-grid-table">
                  <thead>
                    <tr>
                      <th>รหัสพนักงาน</th>
                      <th>ชื่อเจ้าหน้าที่</th>
                      <th>ทีมสังกัด</th>
                      <th>สถานะออนไลน์</th>
                      <th>เวลาเบรกเหลือ</th>
                      <th>ความสำเร็จสายโทรวันนี้</th>
                      <th>ยอดขายสะสม (วัน)</th>
                      <th>อัตรา Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map(a => {
                      const conversionVal = parseInt(a.conversion || 0);
                      const progressColor = conversionVal > 70 ? "var(--color-success)" : conversionVal > 50 ? "var(--color-warning)" : "var(--color-danger)";
                      
                      let statusText = "ออฟไลน์";
                      if (a.status === "online") statusText = "พร้อมทำงาน (Online)";
                      else if (a.status === "break") statusText = "พักเบรก (Break)";
                      else if (a.status === "lunch") statusText = "พักเที่ยง (Lunch)";

                      const breakText = (a.break_remain !== undefined ? a.break_remain : a.breakRemain) || 0;

                      return (
                        <tr key={a.id}>
                          <td><strong>{a.id}</strong></td>
                          <td className="agent-cell-name">
                            <div className="profile-avatar" style={{ width: "28px", height: "28px", fontSize: "10px", boxShadow: "none" }}>
                              {a.name.substring(0, 2)}
                            </div>
                            {a.name}
                          </td>
                          <td>{a.team}</td>
                          <td>
                            <span className={`agent-badge-status ${a.status}`}>
                              <span className={`status-indicator-dot ${a.status}`}></span> {statusText}
                            </span>
                          </td>
                          <td>{breakText > 0 ? `${breakText} นาที` : "-"}</td>
                          <td><strong>{a.calls} สาย</strong></td>
                          <td>฿{parseFloat(a.sales || 0).toLocaleString()}</td>
                          <td>
                            <span className="agent-progress-bar-bg">
                              <span className="agent-progress-bar-fill" style={{ width: `${conversionVal}%`, backgroundColor: progressColor }}></span>
                            </span>
                            <strong>{conversionVal}%</strong>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: ANALYTICS DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="view-container">
              <div className="kpi-grid">
                <div className="kpi-card" style={{ padding: "16px" }}>
                  <span className="kpi-title">เป้าขายรวมปี 2026</span>
                  <span className="kpi-value" style={{ fontSize: "22px" }}>฿{kpis.target.toLocaleString()}</span>
                </div>
                <div className="kpi-card" style={{ padding: "16px" }}>
                  <span className="kpi-title">ยอดสั่งซื้อทำสำเร็จสะสม</span>
                  <span className="kpi-value" style={{ fontSize: "22px", color: "var(--color-success)" }}>฿{Math.round(kpis.salesWon).toLocaleString()}</span>
                </div>
                <div className="kpi-card" style={{ padding: "16px" }}>
                  <span className="kpi-title">ระยะเวลาเฉลี่ยปิดงาน</span>
                  <span className="kpi-value" style={{ fontSize: "22px", color: "var(--color-secondary)" }}>6.2 วัน</span>
                </div>
              </div>

              <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: "25px" }}>
                <div className="dashboard-panel">
                  <div className="panel-header">
                    <h4 className="panel-title"><i className="fa-solid fa-chart-column" style={{ color: "var(--color-primary)", marginRight: "8px" }}></i>เป้าการขายสะสมรายเดือน</h4>
                  </div>
                  <div style={{ position: "relative", height: "300px" }}>
                    <canvas id="monthly-targets-chart"></canvas>
                  </div>
                </div>
                
                <div className="dashboard-panel">
                  <div className="panel-header">
                    <h4 className="panel-title"><i className="fa-solid fa-chart-pie" style={{ color: "var(--color-secondary)", marginRight: "8px" }}></i>ช่องทางการติดต่อลูกค้าหลัก</h4>
                  </div>
                  <div style={{ position: "relative", height: "300px" }}>
                    <canvas id="chat-channels-chart"></canvas>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: REPORTS GRID */}
          {activeTab === "report" && (
            <div className="view-container">
              <div className="report-filter-bar">
                <div className="filter-item">
                  <label>ค้นหาดีล/บริษัท</label>
                  <input type="text" className="filter-input" placeholder="คำค้นหา..." value={reportsSearch} onChange={(e) => {
                    setReportsSearch(e.target.value);
                    setReportsPage(1);
                  }} />
                </div>
                
                <div className="filter-item">
                  <label>คัดกรองขั้นตอน</label>
                  <select className="filter-select" value={reportsStageFilter} onChange={(e) => {
                    setReportsStageFilter(e.target.value);
                    setReportsPage(1);
                  }}>
                    <option value="all">-- ทั้งหมด --</option>
                    <option value="new">โอกาสขายใหม่</option>
                    <option value="qualified">ติดต่อเสนอแนะ</option>
                    <option value="proposal">ยื่นใบเสนอราคา</option>
                    <option value="won">ปิดการขายสำเร็จ</option>
                    <option value="lost">ล้มเหลว</option>
                  </select>
                </div>

                <button className="export-btn" onClick={handleExportCSV}>
                  <i className="fa-solid fa-file-csv"></i> ส่งออกเป็นไฟล์ CSV
                </button>
              </div>

              <div className="agent-grid-table-container">
                <table className="agent-grid-table">
                  <thead>
                    <tr>
                      {["id", "company", "title", "value", "stage", "days"].map(col => {
                        const isSorted = reportsSortColumn === col;
                        const labelMap = { id: "รหัสดีล", company: "ชื่อลูกค้ารับเหมา/บริษัท", title: "รายละเอียดโครงการ", value: "มูลค่าขาย (บาท)", stage: "ขั้นตอนการดีล", days: "อายุโครงการ" };
                        return (
                          <th key={col} className="sortable-th" onClick={() => {
                            if (reportsSortColumn === col) {
                              setReportsSortDirection(prev => prev === "asc" ? "desc" : "asc");
                            } else {
                              setReportsSortColumn(col);
                              setReportsSortDirection("asc");
                            }
                          }}>
                            {labelMap[col]}{" "}
                            <span className="sort-icon">
                              <i className={`fa-solid ${isSorted ? (reportsSortDirection === "asc" ? "fa-sort-up" : "fa-sort-down") : "fa-sort"}`}></i>
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {reportsData.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>ไม่มีรายการข้อมูลโครงการตรงกับเงื่อนไขของคุณ</td>
                      </tr>
                    ) : (
                      reportsData.map(opp => {
                        let stageBadge = "";
                        switch (opp.stage) {
                          case "new": stageBadge = '<span class="agent-badge-status offline">โอกาสขายใหม่</span>'; break;
                          case "qualified": stageBadge = '<span class="agent-badge-status break">ติดต่อเสนอแนะ</span>'; break;
                          case "proposal": stageBadge = '<span class="agent-badge-status break" style="color: var(--color-warning);">ยื่นใบเสนอราคา</span>'; break;
                          case "won": stageBadge = '<span class="agent-badge-status online">สำเร็จ</span>'; break;
                          case "lost": stageBadge = '<span class="agent-badge-status lunch">ล้มเหลว</span>'; break;
                        }
                        return (
                          <tr key={opp.id}>
                            <td><strong>{opp.id}</strong></td>
                            <td>{opp.company}</td>
                            <td>{opp.title}</td>
                            <td><strong>฿{parseFloat(opp.value || 0).toLocaleString()}</strong></td>
                            <td dangerouslySetInnerHTML={{ __html: stageBadge }}></td>
                            <td>{opp.days} วัน</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination-panel">
                <div className="pagination-info">
                  แสดงข้อมูล {reportsTotalItems > 0 ? (reportsPage - 1) * reportsPageSize + 1 : 0}-
                  {Math.min(reportsPage * reportsPageSize, reportsTotalItems)} จากทั้งหมด {reportsTotalItems} รายการ
                </div>
                
                <div className="pagination-controls">
                  <button className="page-btn" disabled={reportsPage === 1} onClick={() => setReportsPage(prev => prev - 1)}>
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button className="page-btn" disabled={reportsPage >= reportsTotalPages} onClick={() => setReportsPage(prev => prev + 1)}>
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ADMIN ROLE PERMISSIONS & INTEGRATIONS */}
          {activeTab === "management" && (
            <div className="view-container">
              <div className="sub-tab-bar">
                <button 
                  className={`sub-tab-pill ${managementSubTab === "roles" ? "active" : ""}`}
                  onClick={() => setManagementSubTab("roles")}
                >
                  เมนู & บทบาทการใช้งาน
                </button>
                <button 
                  className={`sub-tab-pill ${managementSubTab === "social" ? "active" : ""}`}
                  onClick={() => setManagementSubTab("social")}
                >
                  เชื่อมต่อ Social Media
                </button>
                <button 
                  className={`sub-tab-pill ${managementSubTab === "salesforce" ? "active" : ""}`}
                  onClick={() => setManagementSubTab("salesforce")}
                >
                  Salesforce / Zwiz API
                </button>
                <button 
                  className={`sub-tab-pill ${managementSubTab === "botconfig" ? "active" : ""}`}
                  onClick={() => setManagementSubTab("botconfig")}
                >
                  Bot Config
                </button>
              </div>

              {managementSubTab === "roles" && (
                <div className="management-container">
                  {["role_a", "role_b"].map(role => (
                    <div key={role} className="perm-role-panel">
                      <div className="panel-header" style={{ marginBottom: "12px" }}>
                        <h4 className="panel-title">
                          <i className={`fa-solid ${role === "role_a" ? "fa-circle-user" : "fa-headset"}`} style={{ color: role === "role_a" ? "var(--color-primary)" : "var(--color-secondary)", marginRight: "8px" }}></i>
                          ตัวควบคุมสิทธิ์เมนู: {role === "role_a" ? "Manager (Role A)" : "Agent (Role B)"}
                        </h4>
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "20px" }}>สลับเปิด/ปิด เพื่อปรับเปลี่ยนโครงข่ายเมนูด้านข้างของบทบาททันทีในการทดสอบระบบ</p>
                      
                      <div className="perm-list">
                        {["home", "opportunity", "call", "segment", "monitor", "dashboard", "report"].map(feat => {
                          const checked = (permissions[role] || []).includes(feat);
                          return (
                            <div key={feat} className="perm-row-ctrl">
                              <div className="perm-info">
                                <div className="perm-info-title">{MENU_TITLES[feat]?.title}</div>
                                <div className="perm-info-desc">สิทธิ์เข้าใช้เส้นทาง /{feat}</div>
                              </div>
                              <label className="switch-control">
                                <input type="checkbox" checked={checked} onChange={(e) => handlePermissionToggle(role, feat, e.target.checked)} />
                                <span className="switch-slider"></span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {managementSubTab === "social" && (
                <div className="social-connections-wrapper">
                  <div className="social-connections-header">
                    <h2>Social Channel Integration</h2>
                    <p>เชื่อมต่อ LINE OA และ Facebook Page เพื่อรับข้อความจากลูกค้าเข้าสู่ระบบ Chat Console</p>
                  </div>

                  {/* Webhook URLs */}
                  <div style={{ background: '#EAF3FE', border: '1px solid var(--color-primary)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}><i className="fa-solid fa-link" style={{ marginRight: '6px' }}></i>Webhook URLs (ใช้ตั้งค่าใน Developer Console)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '80px' }}>LINE:</span>
                        <code style={{ flex: 1, background: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', border: '1px solid var(--border-color)' }}>https://vibestk.online/api/webhook/line</code>
                        <button style={{ padding: '4px 10px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText('https://vibestk.online/api/webhook/line'); showToast('Copied', 'LINE Webhook URL copied!', 'success'); }}>Copy</button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '80px' }}>Facebook:</span>
                        <code style={{ flex: 1, background: '#fff', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', border: '1px solid var(--border-color)' }}>https://vibestk.online/api/webhook/facebook</code>
                        <button style={{ padding: '4px 10px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#fff', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText('https://vibestk.online/api/webhook/facebook'); showToast('Copied', 'Facebook Webhook URL copied!', 'success'); }}>Copy</button>
                      </div>
                    </div>
                  </div>

                  <div className="social-connection-grid">
                    {/* LINE OA */}
                    <div className="social-conn-card">
                      <div className="social-conn-card-top">
                        <div className="social-icon-box platform-line">L</div>
                        <div className="social-info">
                          <h4>LINE OA</h4>
                          <span className={`social-status ${socialConfig?.line?.accessToken ? 'status-active' : 'status-inactive'}`}>{socialConfig?.line?.accessToken ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}</span>
                        </div>
                      </div>
                      <div className="social-conn-card-bottom">
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Channel ID</label>
                            <input type="text" defaultValue={socialConfig?.line?.channelId || ''} id="line-channel-id" style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Channel Secret</label>
                            <input type="password" defaultValue={socialConfig?.line?.channelSecret || ''} id="line-channel-secret" style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Channel Access Token</label>
                            <input type="password" defaultValue={socialConfig?.line?.accessToken || ''} id="line-access-token" style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px' }} />
                          </div>
                          <button style={{ padding: '8px', background: '#06C755', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }} onClick={async () => {
                            const config = {
                              channelId: document.getElementById('line-channel-id').value,
                              channelSecret: document.getElementById('line-channel-secret').value,
                              accessToken: document.getElementById('line-access-token').value
                            };
                            await saveSocialConfig('line', config);
                            showToast('LINE', 'LINE OA credentials saved!', 'success');
                          }}><i className="fa-solid fa-floppy-disk" style={{ marginRight: '4px' }}></i>Save LINE Config</button>
                        </div>
                      </div>
                    </div>

                    {/* Facebook */}
                    <div className="social-conn-card">
                      <div className="social-conn-card-top">
                        <div className="social-icon-box platform-fb">F</div>
                        <div className="social-info">
                          <h4>Facebook Page</h4>
                          <span className={`social-status ${socialConfig?.facebook?.accessToken ? 'status-active' : 'status-inactive'}`}>{socialConfig?.facebook?.accessToken ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}</span>
                        </div>
                      </div>
                      <div className="social-conn-card-bottom">
                        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Page ID</label>
                            <input type="text" defaultValue={socialConfig?.facebook?.pageId || ''} id="fb-page-id" style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>App Secret</label>
                            <input type="password" defaultValue={socialConfig?.facebook?.appSecret || ''} id="fb-app-secret" style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Page Access Token</label>
                            <input type="password" defaultValue={socialConfig?.facebook?.accessToken || ''} id="fb-access-token" style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Verify Token</label>
                            <input type="text" defaultValue={socialConfig?.facebook?.verifyToken || 'stk_fb_verify_2026'} id="fb-verify-token" style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '12px' }} />
                          </div>
                          <button style={{ padding: '8px', background: '#1877F2', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }} onClick={async () => {
                            const config = {
                              pageId: document.getElementById('fb-page-id').value,
                              appSecret: document.getElementById('fb-app-secret').value,
                              accessToken: document.getElementById('fb-access-token').value,
                              verifyToken: document.getElementById('fb-verify-token').value,
                              pageName: socialConfig?.facebook?.pageName || 'Facebook Page'
                            };
                            await saveSocialConfig('facebook', config);
                            showToast('Facebook', 'Facebook credentials saved!', 'success');
                          }}><i className="fa-solid fa-floppy-disk" style={{ marginRight: '4px' }}></i>Save Facebook Config</button>
                        </div>
                      </div>
                    </div>

                    {/* Instagram (coming soon) */}
                    <div className="social-conn-card">
                      <div className="social-conn-card-top">
                        <div className="social-icon-box platform-ig">I</div>
                        <div className="social-info">
                          <h4>Instagram</h4>
                          <span className="social-status status-inactive">Coming Soon</span>
                        </div>
                        <button className="add-account-btn" disabled>+ Add Account</button>
                      </div>
                    </div>
                  </div>

                  {/* Setup Guide */}
                  <div style={{ marginTop: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}><i className="fa-solid fa-book" style={{ marginRight: '6px', color: 'var(--color-primary)' }}></i>วิธีตั้งค่า</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <h5 style={{ fontSize: '12px', fontWeight: 600, color: '#06C755', marginBottom: '6px' }}>LINE OA Setup</h5>
                        <ol style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.8' }}>
                          <li>ไปที่ <strong>LINE Developers Console</strong></li>
                          <li>เลือก Messaging API channel</li>
                          <li>คัดลอก Channel ID, Secret, Access Token มาใส่</li>
                          <li>ตั้ง Webhook URL เป็น URL ด้านบน</li>
                          <li>เปิด <strong>Use webhook</strong></li>
                        </ol>
                      </div>
                      <div>
                        <h5 style={{ fontSize: '12px', fontWeight: 600, color: '#1877F2', marginBottom: '6px' }}>Facebook Setup</h5>
                        <ol style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.8' }}>
                          <li>ไปที่ <strong>Meta Developer Console</strong></li>
                          <li>สร้าง App → เพิ่ม Messenger product</li>
                          <li>คัดลอก App Secret, Page Access Token มาใส่</li>
                          <li>ตั้ง Webhook URL + Verify Token ตามด้านบน</li>
                          <li>Subscribe to <strong>messages</strong> event</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {managementSubTab === "salesforce" && (
                <div className="salesforce-integration-wrapper" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div className="salesforce-header" style={{ marginBottom: "8px" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>Salesforce & Zwiz API Integration Hub</h2>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      บอร์ดควบคุมการเชื่อมต่อ API เลียนแบบ Salesforce เพื่อเชื่อมต่อกับ Zwiz Chatbot (LINE OA/FB/IG) เข้ากับ PostgreSQL โดยตรง
                    </p>
                  </div>

                  {/* API Endpoints Catalog */}
                  <div className="api-endpoints-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                    <div className="api-card" style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "700", background: "#10b981", color: "#fff", padding: "2px 6px", borderRadius: "4px" }}>POST</span>
                        <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}><i className="fa-solid fa-circle-check" style={{ marginRight: "4px" }}></i> Active</span>
                      </div>
                      <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", fontFamily: "monospace" }}>/services/oauth2/token</h4>
                      <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Salesforce OAuth Access Token generation endpoint</p>
                    </div>

                    <div className="api-card" style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "700", background: "#10b981", color: "#fff", padding: "2px 6px", borderRadius: "4px" }}>POST</span>
                        <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}><i className="fa-solid fa-circle-check" style={{ marginRight: "4px" }}></i> Active</span>
                      </div>
                      <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", fontFamily: "monospace" }}>/services/apexrest/chat/v1/webhook</h4>
                      <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Chat message and inline actions webhook ingest endpoint</p>
                    </div>

                    <div className="api-card" style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "700", background: "#10b981", color: "#fff", padding: "2px 6px", borderRadius: "4px" }}>POST</span>
                        <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "600" }}><i className="fa-solid fa-circle-check" style={{ marginRight: "4px" }}></i> Active</span>
                      </div>
                      <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", fontFamily: "monospace" }}>/services/apexrest/v1/action/execute</h4>
                      <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Standalone action (Create/Close Opp/Case) execution endpoint</p>
                    </div>
                  </div>

                  {/* Simulator Grid */}
                  <div className="simulator-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
                    
                    {/* Left Column: Controls */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      
                      {/* Step 1: OAuth */}
                      <div className="sim-panel" style={{ padding: "20px", borderRadius: "12px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "50%", background: "var(--color-primary)", color: "#fff", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700" }}>1</span>
                          จำลองการขอสิทธิ์ OAuth Token
                        </h3>
                        <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>ทดลองส่ง grant_type=jwt-bearer เพื่อรับ Salesforce mock token และ instance URL</p>
                        <div>
                          <button 
                            className="btn btn-primary" 
                            style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "36px", fontSize: "12px" }}
                            onClick={handleRequestToken}
                            disabled={simTokenRequesting}
                          >
                            {simTokenRequesting ? (
                              <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fa-solid fa-key"></i>
                            )}
                            ขอรับสิทธิ์ Token
                          </button>
                        </div>
                      </div>

                      {/* Step 2: Webhook */}
                      <div className="sim-panel" style={{ padding: "20px", borderRadius: "12px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "50%", background: "var(--color-primary)", color: "#fff", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700" }}>2</span>
                          จำลอง Zwiz Webhook Ingest
                        </h3>
                        <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>จำลองเหตุการณ์แชทที่ลูกค้าพิมพ์ส่งมา หรือการกดเปิด/ปิด Opp จากฝั่ง Zwiz Bot</p>
                        
                        <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                          <label style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600" }}>เลือกประเภทเหตุการณ์:</label>
                          <select 
                            value={simWebhookEvent} 
                            onChange={(e) => setSimWebhookEvent(e.target.value)}
                            style={{ width: "100%", height: "36px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "#fff", padding: "0 10px", fontSize: "12px" }}
                          >
                            <option value="client_text">ลูกค้าทักแชทเข้ามา (Text Message)</option>
                            <option value="client_image">ลูกค้าส่งรูปภาพแนบแชทเข้ามา (Image)</option>
                            <option value="create_opp_action">บอทแจ้งเปิด Opportunity (CREATE_OPPORTUNITY)</option>
                            <option value="create_case_action">บอทแจ้งเปิด Case (CREATE_CASE)</option>
                          </select>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600" }}>JSON Payload:</label>
                          <textarea 
                            value={simWebhookPayload}
                            onChange={(e) => setSimWebhookPayload(e.target.value)}
                            style={{ width: "100%", height: "150px", background: "#121212", border: "1px solid var(--border-color)", borderRadius: "6px", color: "#00ff66", padding: "10px", fontFamily: "monospace", fontSize: "11px", resize: "vertical" }}
                          />
                        </div>

                        <div>
                          <button 
                            className="btn btn-secondary" 
                            style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "36px", fontSize: "12px", background: "var(--color-secondary)", color: "#fff" }}
                            onClick={handleSendWebhook}
                            disabled={simWebhookRequesting}
                          >
                            {simWebhookRequesting ? (
                              <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fa-solid fa-paper-plane"></i>
                            )}
                            ส่งข้อมูล Webhook
                          </button>
                        </div>
                      </div>

                      {/* Step 3: Standalone Action */}
                      <div className="sim-panel" style={{ padding: "20px", borderRadius: "12px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ display: "inline-flex", width: "24px", height: "24px", borderRadius: "50%", background: "var(--color-primary)", color: "#fff", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700" }}>3</span>
                          จำลอง Standalone Action Execute
                        </h3>
                        <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>เรียกสั่งงาน Action ภายใน Salesforce/STK โดยตรง</p>

                        <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                          <label style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600" }}>เลือก Action:</label>
                          <select 
                            value={simActionName} 
                            onChange={(e) => setSimActionName(e.target.value)}
                            style={{ width: "100%", height: "36px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", borderRadius: "6px", color: "#fff", padding: "0 10px", fontSize: "12px" }}
                          >
                            <option value="CREATE_OPPORTUNITY">CREATE_OPPORTUNITY (เปิดโอกาสขายใหม่)</option>
                            <option value="CREATE_CASE">CREATE_CASE (เปิดเคสใหม่)</option>
                            <option value="CLOSE_OPPORTUNITY">CLOSE_OPPORTUNITY (ปิดโอกาสขาย)</option>
                            <option value="CLOSE_CASE">CLOSE_CASE (ปิดเคสการช่วยเหลือ)</option>
                            <option value="CLOSE_CHAT">CLOSE_CHAT (สิ้นสุดเซสชันการคุย)</option>
                          </select>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600" }}>JSON Payload:</label>
                          <textarea 
                            value={simActionPayload}
                            onChange={(e) => setSimActionPayload(e.target.value)}
                            style={{ width: "100%", height: "150px", background: "#121212", border: "1px solid var(--border-color)", borderRadius: "6px", color: "#00ff66", padding: "10px", fontFamily: "monospace", fontSize: "11px", resize: "vertical" }}
                          />
                        </div>

                        <div>
                          <button 
                            className="btn btn-secondary" 
                            style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "36px", fontSize: "12px" }}
                            onClick={handleSendAction}
                            disabled={simActionRequesting}
                          >
                            {simActionRequesting ? (
                              <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fa-solid fa-play"></i>
                            )}
                            ประมวลผล Action
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Right Column: Console Outputs */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div className="console-panel" style={{ flex: 1, minHeight: "600px", padding: "20px", borderRadius: "12px", background: "#0b0f19", border: "1px solid #1e293b", display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "12px", marginBottom: "16px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <i className="fa-solid fa-terminal"></i> Response Console
                          </span>
                          <button 
                            onClick={() => { setSimTokenResponse(null); setSimWebhookResponse(null); setSimActionResponse(null); }}
                            style={{ fontSize: "11px", color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer" }}
                          >
                            <i className="fa-solid fa-trash-can"></i> ล้างคอนโซล
                          </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", flex: 1, maxHeight: "700px" }}>
                          
                          {/* Token Response */}
                          <div>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px", fontWeight: "600" }}>1. OAuth Token Response:</div>
                            <pre style={{ margin: 0, padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", color: "#e2e8f0", fontSize: "11px", fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre-wrap" }}>
                              {simTokenResponse ? JSON.stringify(simTokenResponse, null, 2) : "// ยังไม่มีการส่งข้อมูลขอ Token"}
                            </pre>
                          </div>

                          {/* Webhook Response */}
                          <div>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px", fontWeight: "600" }}>2. Webhook Response:</div>
                            <pre style={{ margin: 0, padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", color: "#e2e8f0", fontSize: "11px", fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre-wrap" }}>
                              {simWebhookResponse ? JSON.stringify(simWebhookResponse, null, 2) : "// ยังไม่มีการยิงข้อมูล Webhook"}
                            </pre>
                          </div>

                          {/* Action Response */}
                          <div>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px", fontWeight: "600" }}>3. Action Response:</div>
                            <pre style={{ margin: 0, padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", color: "#e2e8f0", fontSize: "11px", fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre-wrap" }}>
                              {simActionResponse ? JSON.stringify(simActionResponse, null, 2) : "// ยังไม่มีการยิงข้อมูล Action"}
                            </pre>
                          </div>

                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {managementSubTab === "botconfig" && (
                <div className="bot-config-wrapper">
                  <div className="bot-config-header">
                    <h2><i className="fa-solid fa-robot" style={{ color: 'var(--color-primary)' }}></i> Zwiz Bot Configuration</h2>
                    <button className="add-rule-btn" onClick={() => showToast('Bot Config', 'New rule template added', 'success')}>
                      <i className="fa-solid fa-plus"></i> เพิ่มบทสนทนา
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>กำหนดค่า Keyword Triggers, Context Mapping, และ Auto-Reply สำหรับ Zwiz Chatbot</p>

                  {botRules.map(rule => (
                    <div key={rule.id} className="bot-rule-card">
                      <div className="rule-header" onClick={() => setBotRules(prev => prev.map(r => r.id === rule.id ? { ...r, expanded: !r.expanded } : r))}>
                        <div className="rule-title">
                          <i className={`fa-solid fa-chevron-${rule.expanded ? 'down' : 'right'}`} style={{ fontSize: '12px', color: 'var(--text-muted)' }}></i>
                          <span className={`on-badge ${rule.enabled ? 'active' : 'inactive'}`}>{rule.enabled ? 'ON' : 'OFF'}</span>
                          {rule.name}
                          <span style={{ display: 'flex', gap: '4px' }}>
                            {rule.channels.includes('facebook') && <span className="channel-icon fb" style={{ width: '20px', height: '20px', fontSize: '9px' }}><i className="fa-brands fa-facebook-f"></i></span>}
                            {rule.channels.includes('line') && <span className="channel-icon line" style={{ width: '20px', height: '20px', fontSize: '9px' }}><i className="fa-brands fa-line"></i></span>}
                            {rule.channels.includes('instagram') && <span className="channel-icon ig" style={{ width: '20px', height: '20px', fontSize: '9px' }}><i className="fa-brands fa-instagram"></i></span>}
                          </span>
                        </div>
                        <div className="rule-actions">
                          <button title="Edit" onClick={e => { e.stopPropagation(); showToast('Edit', `Editing ${rule.name}`, 'info'); }}><i className="fa-solid fa-pencil"></i></button>
                          <button title="Duplicate" onClick={e => { e.stopPropagation(); showToast('Duplicate', `Duplicated ${rule.name}`, 'success'); }}><i className="fa-solid fa-copy"></i></button>
                          <button title="Delete" onClick={e => { e.stopPropagation(); showToast('Delete', `Rule ${rule.name} deleted`, 'danger'); setBotRules(prev => prev.filter(r => r.id !== rule.id)); }}><i className="fa-solid fa-trash"></i></button>
                        </div>
                      </div>
                      {rule.expanded && (
                        <div className="rule-body">
                          {rule.keywords.length > 0 && (
                            <div className="rule-section">
                              <h5><i className="fa-solid fa-key" style={{ marginRight: '4px' }}></i> คีย์เวิร์ด ({rule.keywords.length})</h5>
                              <div className="keyword-tags">
                                {rule.keywords.map((kw, i) => <span key={i} className="keyword-tag">{kw}</span>)}
                              </div>
                            </div>
                          )}
                          {rule.similar.length > 0 && (
                            <div className="rule-section">
                              <h5><i className="fa-solid fa-equals" style={{ marginRight: '4px' }}></i> เหมือนกับ</h5>
                              <div className="keyword-tags">
                                {rule.similar.map((s, i) => <span key={i} className="keyword-tag" style={{ background: '#E8F5E9', borderColor: '#81C784', color: '#2E7D32' }}>{s}</span>)}
                              </div>
                            </div>
                          )}
                          <div className="rule-section">
                            <h5><i className="fa-solid fa-diagram-project" style={{ marginRight: '4px' }}></i> Context Mapping</h5>
                            <div className="context-grid">
                              <div className="context-field">
                                <div className="ctx-label">Context In</div>
                                <div className="ctx-value">{rule.context_in}</div>
                              </div>
                              <div className="context-field">
                                <div className="ctx-label">Context Out</div>
                                <div className="ctx-value">{rule.context_out}</div>
                              </div>
                              <div className="context-field">
                                <div className="ctx-label">Queue Name</div>
                                <div className="ctx-value">{rule.queue_name}</div>
                              </div>
                              <div className="context-field">
                                <div className="ctx-label">Opportunity Name</div>
                                <div className="ctx-value">{rule.opportunity_name || '—'}</div>
                              </div>
                            </div>
                          </div>
                          {rule.auto_reply && (
                            <div className="rule-section">
                              <h5><i className="fa-solid fa-reply" style={{ marginRight: '4px' }}></i> คำตอบของแชทบอท</h5>
                              <div style={{ padding: '10px', background: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-primary)' }}>
                                {rule.auto_reply}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </section>
      </main>

      {/* Simulated Azure AD B2C Login Overlay */}
      {showLogin && (
        <div id="login-overlay" className="login-overlay active">
          <div className="login-card-container">
            <div className="login-brand">
              <i className="fa-solid fa-bolt brand-logo-icon"></i>
              <h2>CRM Track Sales</h2>
              <p>Central Department Store — ระบบบริหารลูกค้าและติดตามยอดขาย</p>
            </div>
            
            <div className="login-card">
              <div className="login-card-header">
                <h3>เข้าใช้งานระบบ (Azure AD Single Sign-On)</h3>
                <p>กรุณาลงชื่อเข้าใช้งานด้วยบัญชี Microsoft Azure ขององค์กร</p>
              </div>
              
              <div className="login-card-body">
                <button className="microsoft-btn" onClick={() => handleLogin("role_a")}>
                  <i className="fa-brands fa-microsoft"></i> ลงชื่อเข้าใช้งานด้วย Microsoft Account
                </button>
                
                <div className="divider">
                  <span>หรือจำลองบทบาททันที</span>
                </div>

                <div className="quick-role-logins">
                  <button className="quick-login-btn" onClick={() => handleLogin("role_a")}>
                    <i className="fa-solid fa-user-tie"></i> เข้าใช้งานเป็น <strong>Manager (Role A)</strong>
                  </button>
                  <button className="quick-login-btn" onClick={() => handleLogin("role_b")}>
                    <i className="fa-solid fa-headset"></i> เข้าใช้งานเป็น <strong>Agent (Role B)</strong>
                  </button>
                  <button className="quick-login-btn" onClick={() => handleLogin("role_c")}>
                    <i className="fa-solid fa-eye"></i> เข้าใช้งานเป็น <strong>Viewer (Role C)</strong>
                  </button>
                  <button className="quick-login-btn" onClick={() => handleLogin("admin")}>
                    <i className="fa-solid fa-user-gear"></i> เข้าใช้งานเป็น <strong>System Admin</strong>
                  </button>
                </div>
              </div>
              
              <div className="login-card-footer">
                <span>ระบบป้องกันความปลอดภัยข้อมูลองค์กรตามมาตรฐานสูงสุด</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
