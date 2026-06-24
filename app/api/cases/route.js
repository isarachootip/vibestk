import { query, isPostgresActive } from "@/lib/db";
import { NextResponse } from "next/server";

// In-memory fallback
let IN_MEMORY_CASES = [
  { id: "ca26061801", subject: "สินค้าชำรุดระหว่างขนส่ง — กระเบื้องปูพื้น", type: "Complaint", case_reason: "Product", root_cause: "Product Quality", priority: "High", status: "open", pending_type: null, case_origin: "Facebook", bu: "CDS", owner: "วิชัย รัตนวงศ์", contact_name: "คุณสมศักดิ์ รักเรียน", contact_phone: "081-234-XXXX", contact_email: "somsak@example.com", is_vip: false, created_at: "2026-06-18T09:00:00Z", updated_at: "2026-06-18T09:30:00Z" },
  { id: "ca26061802", subject: "สอบถามราคาเหล็กเส้นสำหรับงานก่อสร้าง", type: "Compliment", case_reason: "Service", root_cause: null, priority: "Medium", status: "new", pending_type: null, case_origin: "LINE", bu: "CDS", owner: null, contact_name: "คุณพรเพ็ญ ดีงาม", contact_phone: "089-456-XXXX", contact_email: "pornpen@example.com", is_vip: true, created_at: "2026-06-18T10:00:00Z", updated_at: "2026-06-18T10:00:00Z" },
  { id: "ca26061601", subject: "ติดตามสถานะการจัดส่งคำสั่งซื้อ #or26061501", type: "Complaint", case_reason: "Delivery", root_cause: "Delivery", priority: "Critical", status: "pending-customer", pending_type: "Pending Customer", case_origin: "Email", bu: "CDS", owner: "นภา สุขดี", contact_name: "บจก. เจริญโภคภัณฑ์วิศวกรรม", contact_phone: "083-294-XXXX", contact_email: "charoen@example.com", is_vip: true, created_at: "2026-06-16T14:00:00Z", updated_at: "2026-06-17T16:00:00Z" },
  { id: "ca26061701", subject: "แจ้งปัญหาระบบชำระเงินออนไลน์ล้มเหลว", type: "Complaint", case_reason: "Service", root_cause: "Service", priority: "High", status: "pending-internal", pending_type: "Pending Internal", case_origin: "Telephone", bu: "CDS", owner: "สมเกียรติ ปัญญา", contact_name: "คุณกิตติธัช", contact_phone: "082-551-XXXX", contact_email: "kittithat@example.com", is_vip: false, created_at: "2026-06-17T08:00:00Z", updated_at: "2026-06-18T08:00:00Z" },
  { id: "ca26061401", subject: "เคลมประกันสินค้า — เครื่องปรับอากาศไม่เย็น", type: "Complaint", case_reason: "Product", root_cause: "Product Quality", priority: "Medium", status: "solved", pending_type: null, case_origin: "Facebook", bu: "CDS", owner: "ธนาวุฒิ มีชัย", contact_name: "คุณวิลาวัณย์", contact_phone: "085-442-XXXX", contact_email: "wilawan@example.com", is_vip: false, created_at: "2026-06-14T10:00:00Z", updated_at: "2026-06-18T07:00:00Z" },
  { id: "ca26061001", subject: "ขอคืนสินค้า — สั่งซื้อผิดรุ่น", type: "Complaint", case_reason: "Product", root_cause: "Product Quality", priority: "Low", status: "closed", pending_type: null, case_origin: "LINE", bu: "CDS", owner: "พัชรา สิงห์โต", contact_name: "รับเหมาครบวงจร ช่างณรงค์", contact_phone: "088-123-XXXX", contact_email: "narongchai@example.com", is_vip: false, created_at: "2026-06-10T09:00:00Z", updated_at: "2026-06-15T17:00:00Z" },
  { id: "ca26061803", subject: "Spam — ข้อความโฆษณาจาก Bot", type: "Complaint", case_reason: "Service", root_cause: null, priority: "Low", status: "spam", pending_type: null, case_origin: "Facebook", bu: "CDS", owner: null, contact_name: "Unknown Bot", contact_phone: "", contact_email: "", is_vip: false, created_at: "2026-06-18T06:00:00Z", updated_at: "2026-06-18T06:00:00Z" },
  { id: "ca26061804", subject: "สอบถามโปรโมชั่นกระเบื้อง — ซ้ำกับ ca26061801", type: "Complaint", case_reason: "Product", root_cause: null, priority: "Low", status: "duplicate", pending_type: null, case_origin: "LINE", bu: "CDS", owner: null, contact_name: "คุณสมศักดิ์ รักเรียน", contact_phone: "081-234-XXXX", contact_email: "somsak@example.com", is_vip: false, created_at: "2026-06-18T09:05:00Z", updated_at: "2026-06-18T09:05:00Z" }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const priority = searchParams.get("priority") || "all";

    if (isPostgresActive()) {
      let q = "SELECT * FROM cases WHERE 1=1";
      const params = [];
      let idx = 1;
      if (search) {
        q += ` AND (subject ILIKE $${idx} OR contact_name ILIKE $${idx} OR id ILIKE $${idx})`;
        params.push(`%${search}%`);
        idx++;
      }
      if (status !== "all") {
        q += ` AND status = $${idx}`;
        params.push(status);
        idx++;
      }
      if (priority !== "all") {
        q += ` AND priority = $${idx}`;
        params.push(priority);
        idx++;
      }
      q += " ORDER BY created_at DESC";
      const { rows } = await query(q, params);
      return NextResponse.json(rows);
    }

    // In-memory fallback
    let filtered = [...IN_MEMORY_CASES];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.subject.toLowerCase().includes(s) ||
        c.contact_name.toLowerCase().includes(s) ||
        c.id.toLowerCase().includes(s)
      );
    }
    if (status !== "all") {
      filtered = filtered.filter(c => c.status === status);
    }
    if (priority !== "all") {
      filtered = filtered.filter(c => c.priority.toLowerCase() === priority.toLowerCase());
    }
    return NextResponse.json(filtered);
  } catch (e) {
    return NextResponse.json(IN_MEMORY_CASES);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, status, pending_type } = body;

    if (isPostgresActive()) {
      await query(
        "UPDATE cases SET status = $1, pending_type = $2, updated_at = NOW() WHERE id = $3",
        [status, pending_type || null, id]
      );
      return NextResponse.json({ success: true });
    }

    // In-memory fallback
    const c = IN_MEMORY_CASES.find(c => c.id === id);
    if (c) {
      c.status = status;
      c.pending_type = pending_type || null;
      c.updated_at = new Date().toISOString();
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
