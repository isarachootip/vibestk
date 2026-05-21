/**
 * STK Sales Tracking System - Client Engine with Live Node.js & PostgreSQL APIs
 * Version 1.0.1 (Build 471)
 */

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================================================
    // 1. API SERVER CONFIGURATION & DUAL FALLBACK ENGINE
    // ==========================================================================
    
    const API_BASE = "http://localhost:3000/api";
    let isServerConnected = false;

    // Local In-Memory Fallback State (Matches server database defaults)
    const LOCAL_STATE = {
        currentUser: {
            name: "สมชาย ใจดี",
            role: "role_a",
            status: "online"
        },
        permissions: {
            role_a: ["home", "opportunity", "monitor", "dashboard", "report"],
            role_b: ["home", "opportunity", "call", "segment"],
            role_c: ["home", "monitor", "dashboard", "report"],
            admin: ["home", "opportunity", "call", "segment", "monitor", "dashboard", "report", "management"]
        },
        agents: [
            { id: "A101", name: "วิชัย รัตนวงศ์", role: "Agent", status: "online", team: "Team Alpha", calls: 24, sales: 185000, conversion: 78, breakRemain: 30 },
            { id: "A102", name: "นภา สุขดี", role: "Agent", status: "break", team: "Team Alpha", calls: 18, sales: 94000, conversion: 52, breakRemain: 15 },
            { id: "A103", name: "สมเกียรติ ปัญญา", role: "Agent", status: "online", team: "Team Beta", calls: 31, sales: 320000, conversion: 84, breakRemain: 30 },
            { id: "A104", name: "พัชรา สิงห์โต", role: "Agent", status: "lunch", team: "Team Beta", calls: 15, sales: 112000, conversion: 60, breakRemain: 0 },
            { id: "A105", name: "ธนาวุฒิ มีชัย", role: "Agent", status: "online", team: "Team Gamma", calls: 22, sales: 146000, conversion: 68, breakRemain: 24 },
            { id: "A106", name: "ศิริพร บุญช่วย", role: "Agent", status: "offline", team: "Team Gamma", calls: 0, sales: 0, conversion: 0, breakRemain: 30 }
        ],
        opportunities: [
            { id: "OPP-301", title: "สั่งซื้อกระเบื้องปูพื้นแกรนิตโต้ล็อตใหญ่", company: "บจก. คอนสตรัคชั่นพลัส", contactName: "คุณทวีเกียรติ", phone: "081-452-XXXX", value: 125000, stage: "proposal", days: 3 },
            { id: "OPP-302", title: "อัปเกรดเครื่องมือช่างสำหรับแคมป์ไซต์", company: "หจก. เมืองทองวัสดุก่อสร้าง", contactName: "ช่างเอก", phone: "089-771-XXXX", value: 48000, stage: "qualified", days: 5 },
            { id: "OPP-303", title: "จัดหาชุดสีทาภายนอกอาคารคอนโด", company: "โครงการแกรนด์อเวนิว", contactName: "คุณสมพงษ์ (PM)", phone: "086-312-XXXX", value: 345000, stage: "new", days: 1 },
            { id: "OPP-304", title: "สั่งซื้อท่อ PVC และข้อต่อสำหรับโครงการหมู่บ้าน", company: "บมจ. อนันตากลุ๊ป", contactName: "คุณวิลาวัณย์", phone: "083-294-XXXX", value: 670000, stage: "won", days: 12 },
            { id: "OPP-305", title: "ชุดสุขภัณฑ์หรูสไตล์สแกนดิเนเวียน 20 ชุด", company: "โครงการพาสิโอเรสซิเดนซ์", contactName: "คุณกิตติธัช", phone: "082-551-XXXX", value: 180000, stage: "proposal", days: 4 },
            { id: "OPP-306", title: "จัดซื้อเครื่องปรับอากาศอุตสาหกรรม 5 เครื่อง", company: "บจก. ยูเนี่ยนแฟคทอรี่", contactName: "คุณสมชาย", phone: "085-442-XXXX", value: 155000, stage: "lost", days: 8 },
            { id: "OPP-307", title: "สั่งโคมไฟสนามและระบบไฟโซล่าเซลล์", company: "โรงแรมรอยัลพลาซ่า", contactName: "คุณนันท์นภัส", phone: "088-234-XXXX", value: 75000, stage: "qualified", days: 2 }
        ],
        customers: [
            { code: "CUST-801", name: "วิวัฒน์ เอนจิเนียริ่ง", segment: "Platinum Tier", province: "กรุงเทพฯ", lastOrder: "150,000 บาท", lastContact: "2026-05-18", status: "ปกติ" },
            { code: "CUST-802", name: "ช่างพัฒน์ โครงหลังคาเหล็ก", segment: "SME Contractor", province: "นนทบุรี", lastOrder: "32,000 บาท", lastContact: "2026-05-19", status: "ติดตามด่วน" },
            { code: "CUST-803", name: "คุณพรเพ็ญ บ้านสวยทิวลิป", segment: "Retail Walk-In", province: "ปทุมธานี", lastOrder: "8,500 บาท", lastContact: "2026-05-10", status: "ปกติ" },
            { code: "CUST-804", name: "บจก. เจริญโภคภัณฑ์วิศวกรรม", segment: "Platinum Tier", province: "ชลบุรี", lastOrder: "1,200,000 บาท", lastContact: "2026-05-15", status: "ปกติ" },
            { code: "CUST-805", name: "รับเหมาครบวงจร ช่างณรงค์", segment: "VIP Builder", province: "สมุทรปราการ", lastOrder: "95,000 บาท", lastContact: "2026-05-20", status: "ปกติ" },
            { code: "CUST-806", name: "บจก. เอสเตท พร็อพเพอร์ตี้", segment: "VIP Builder", province: "สมุทรสาคร", lastOrder: "420,000 บาท", lastContact: "2026-05-14", status: "ติดตามด่วน" }
        ],
        notifications: [],
        chatHistory: {
            "OPP-301": [
                { sender: "client", text: "สวัสดีครับ สรุปโควเทชั่นกระเบื้องแกรนิตโต้ที่ขอไปเรียบร้อยหรือยังครับ?", time: "10:14" },
                { sender: "agent", text: "สวัสดีค่ะคุณทวีเกียรติ กำลังให้แผนกคลังสินค้าเช็คสต็อกสีและจำนวนที่แน่นอนให้อยู่นะคะ คาดว่าไม่เกินบ่ายสองจะได้รับเอกสารใบเสนอราคาค่ะ", time: "10:16" },
                { sender: "client", text: "รบกวนหน่อยนะครับ พอดีต้องส่งเรื่องให้บอร์ดเซ็นอนุมัติจัดซื้อก่อนสี่โมงเย็นวันนี้", time: "10:18" }
            ],
            "OPP-302": [
                { sender: "client", text: "เครื่องตัดไฟของ Bosch รุ่นล่าสุดมีของแถมอะไรบ้างไหมครับ?", time: "09:30" },
                { sender: "agent", text: "สวัสดีค่ะช่างเอก สำหรับ Bosch ตัวใหม่จะแถมใบเลื่อยวงเดือนแท้ 2 ใบ พร้อมกล่องเคสแข็งฟรีค่ะ", time: "09:35" }
            ]
        },
        reports: {
            sortColumn: "id",
            sortDirection: "asc",
            searchTerm: "",
            currentPage: 1,
            pageSize: 5
        }
    };

    // Generic Fetch Utility with Automatic In-Memory Fallback
    async function apiFetch(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            if (!response.ok) throw new Error("HTTP error " + response.status);
            isServerConnected = true;
            return await response.json();
        } catch (err) {
            if (isServerConnected) {
                console.warn(`⚠️ API connection lost at ${endpoint}. Falling back to client state.`);
                isServerConnected = false;
            }
            return null; // Signals controller to use fallback state
        }
    }

    // Ping check server connection initially
    async function checkServerConnection() {
        const result = await apiFetch('/status');
        if (result && result.status === "online") {
            isServerConnected = true;
            console.log(`📡 Connected to Node.js Backend Server! Database Mode: ${result.mode}`);
        } else {
            isServerConnected = false;
            console.log("⚠️ API Server offline. Running in standard Client-Side In-Memory Mock Mode.");
        }
    }

    // Mapping of Human-Readable titles for Sidebars & Header
    const MENU_TITLES = {
        home: { title: "หน้าหลัก / KPI", icon: "fa-solid fa-house", href: "#home" },
        opportunity: { title: "รายการโอกาสขาย", icon: "fa-solid fa-folder-open", href: "#opportunity" },
        call: { title: "การติดตามลูกค้า (Call)", icon: "fa-solid fa-phone-volume", href: "#call" },
        segment: { title: "เซกเมนต์ลูกค้า", icon: "fa-solid fa-users-viewfinder", href: "#segment" },
        monitor: { title: "มอนิเตอร์เจ้าหน้าที่", icon: "fa-solid fa-desktop", href: "#monitor" },
        dashboard: { title: "แดชบอร์ดสรุปยอด", icon: "fa-solid fa-chart-pie", href: "#dashboard" },
        report: { title: "รายงานภาพรวม", icon: "fa-solid fa-file-invoice-dollar", href: "#report" },
        management: { title: "ตั้งค่าระบบ", icon: "fa-solid fa-sliders", href: "#management" }
    };

    let charts = {}; // Holds Chart.js instances

    // ==========================================================================
    // 2. ROUTING & ACCESS CONTROLLERS
    // ==========================================================================
    
    async function renderMenu() {
        const menuList = document.getElementById("menu-list");
        menuList.innerHTML = "";
        
        // Fetch dynamic permissions matrix
        let permissions = LOCAL_STATE.permissions;
        const resPerms = await apiFetch('/permissions');
        if (resPerms) permissions = resPerms;

        const allowedMenus = permissions[LOCAL_STATE.currentUser.role] || [];
        
        allowedMenus.forEach(menuKey => {
            const menuData = MENU_TITLES[menuKey];
            if (!menuData) return;
            
            const li = document.createElement("li");
            const currentHash = window.location.hash || "#home";
            const isActive = currentHash === menuData.href;
            
            li.innerHTML = `
                <a href="${menuData.href}" class="menu-item-link ${isActive ? 'active' : ''}">
                    <i class="${menuData.icon}"></i>
                    <span class="menu-text">${menuData.title}</span>
                </a>
            `;
            menuList.appendChild(li);
        });
    }

    async function routeTo(hash) {
        if (!hash) hash = "#home";
        const routeKey = hash.replace("#", "");
        
        // Fetch permissions matrix
        let permissions = LOCAL_STATE.permissions;
        const resPerms = await apiFetch('/permissions');
        if (resPerms) permissions = resPerms;

        const allowedMenus = permissions[LOCAL_STATE.currentUser.role] || [];
        
        // Access Protection Gate
        if (!allowedMenus.includes(routeKey)) {
            showToast("สิทธิ์การเข้าใช้งาน", "คุณไม่มีสิทธิ์เข้าใช้หน้านี้ ระบบกำลังนำคุณไปหน้าแรก", "warn");
            window.location.hash = "#home";
            return;
        }

        // Highlight sidebar items
        const menuLinks = document.querySelectorAll(".menu-item-link");
        menuLinks.forEach(link => {
            if (link.getAttribute("href") === hash) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        // Clean active chart instances
        Object.keys(charts).forEach(key => {
            if (charts[key]) {
                charts[key].destroy();
                delete charts[key];
            }
        });

        const appContent = document.getElementById("app-content");
        const pageTitle = document.getElementById("page-title");
        
        // Dynamically routing panels
        switch(routeKey) {
            case "home":
                pageTitle.innerText = "หน้าหลัก / ดัชนีประสิทธิภาพ (KPI)";
                renderHome(appContent);
                break;
            case "opportunity":
                pageTitle.innerText = "ท่อทางโอกาสขาย (Opportunities Pipeline)";
                renderOpportunityList(appContent);
                break;
            case "call":
                pageTitle.innerText = "ระบบประมวลผลการติดตามโทรศัทพ์ (Opportunity Call)";
                renderOpportunityCall(appContent);
                break;
            case "segment":
                pageTitle.innerText = "การจัดกลุ่มลูกค้าเชิงวิเคราะห์ (Customer Segments)";
                renderCustomerSegment(appContent);
                break;
            case "monitor":
                pageTitle.innerText = "สถานะออนไลน์เจ้าหน้าที่ฝ่ายขาย (Real-Time Agent Monitor)";
                renderAgentMonitor(appContent);
                break;
            case "dashboard":
                pageTitle.innerText = "สถิติผลการดำเนินงานรวม (Performance Analytics)";
                renderDashboard(appContent);
                break;
            case "report":
                pageTitle.innerText = "คลังสืบค้นและรายงานผลขาย (Grid Reports)";
                renderReports(appContent);
                break;
            case "management":
                pageTitle.innerText = "การจัดการความปลอดภัยและสิทธิ์การเข้าใช้งาน";
                renderManagement(appContent);
                break;
            default:
                appContent.innerHTML = `<div class="view-container"><h2>404 Page Not Found</h2></div>`;
        }
    }

    // ==========================================================================
    // 3. PAGE VIEW RENDERS
    // ==========================================================================
    
    // --- HOME / KPI VIEW ---
    async function renderHome(container) {
        // Query dynamic analytics indicators
        let totals = {
            target: 1438000,
            salesWon: 0,
            pipelineValue: 0,
            winRate: 0,
            wonDealsCount: 0,
            totalDealsCount: 0
        };

        const res = await apiFetch('/dashboard/analytics');
        if (res) {
            totals = res.totals;
        } else {
            // Local fallback calculations
            const totalOppAmount = LOCAL_STATE.opportunities.reduce((acc, curr) => acc + curr.value, 0);
            const wonOpps = LOCAL_STATE.opportunities.filter(o => o.stage === "won");
            const totalWonAmount = wonOpps.reduce((acc, curr) => acc + curr.value, 0);
            const winRate = Math.round((wonOpps.length / LOCAL_STATE.opportunities.length) * 100);
            
            totals = {
                target: 1438000,
                salesWon: totalWonAmount,
                pipelineValue: totalOppAmount,
                winRate: winRate,
                wonDealsCount: wonOpps.length,
                totalDealsCount: LOCAL_STATE.opportunities.length
            };
        }

        container.innerHTML = `
            <div class="view-container">
                <!-- Server Connection Banner status -->
                <div class="db-status-bar ${isServerConnected ? 'active' : ''}">
                    <i class="fa-solid ${isServerConnected ? 'fa-database' : 'fa-triangle-exclamation'}"></i> 
                    <span>เซิร์ฟเวอร์ฐานข้อมูล: <strong>${isServerConnected ? 'เชื่อมต่อ Postgres Live' : 'ปิดทำงาน (Mock In-Memory)'}</strong></span>
                </div>

                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="kpi-info">
                            <span class="kpi-title">เป้าขายสะสมปีนี้</span>
                            <span class="kpi-value">฿${totals.target.toLocaleString()}</span>
                            <span class="kpi-trend up"><i class="fa-solid fa-caret-up"></i> +12% เทียบกับเดือนก่อน</span>
                        </div>
                        <div class="kpi-icon-box red"><i class="fa-solid fa-chart-bar"></i></div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-info">
                            <span class="kpi-title">ยอดขายปิดการขาย (Won)</span>
                            <span class="kpi-value">฿${Math.round(totals.salesWon).toLocaleString()}</span>
                            <span class="kpi-trend up"><i class="fa-solid fa-caret-up"></i> ${totals.wonDealsCount} ดีลสำเร็จ</span>
                        </div>
                        <div class="kpi-icon-box green"><i class="fa-solid fa-wallet"></i></div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-info">
                            <span class="kpi-title">มูลค่าโอกาสใน Pipeline</span>
                            <span class="kpi-value">฿${Math.round(totals.pipelineValue).toLocaleString()}</span>
                            <span class="kpi-trend"><i class="fa-solid fa-circle-notch fa-spin"></i> ${totals.totalDealsCount} ลูกค้ารอการดีล</span>
                        </div>
                        <div class="kpi-icon-box teal"><i class="fa-solid fa-rotate"></i></div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-info">
                            <span class="kpi-title">อัตราปิดยอดชนะ (Win Rate)</span>
                            <span class="kpi-value">${totals.winRate}%</span>
                            <span class="kpi-trend up"><i class="fa-solid fa-caret-up"></i> +4.5% ปรับปรุงขึ้น</span>
                        </div>
                        <div class="kpi-icon-box amber"><i class="fa-solid fa-award"></i></div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <div class="dashboard-panel">
                        <div class="panel-header">
                            <h4 class="panel-title"><i class="fa-solid fa-circle-nodes icon-decor" style="color: var(--color-primary); margin-right: 8px;"></i>คู่มือกระบวนการและการทำงานภาพรวม</h4>
                        </div>
                        <div class="quick-welcome-box" style="line-height: 1.6; font-size: 13.5px; color: var(--text-secondary);">
                            <p style="margin-bottom: 12px;">ยินดีต้อนรับสู่ระบบติดตามและรายงานยอดขาย <strong>STK (Sales Tracking System)</strong> โครงสร้างโปรแกรมจำลองหน้าจอความละเอียดสูง</p>
                            <p style="margin-bottom: 12px;">คุณสามารถใช้งานฟังก์ชันจำลองประสิทธิภาพเต็มรูปแบบ:</p>
                            <ul style="margin-left: 20px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px;">
                                <li><strong style="color: var(--text-primary);"><i class="fa-solid fa-shield-halved" style="margin-right: 6px;"></i>สลับบทบาทการเข้าถึง:</strong> ใช้กล่องตัวเลือกสลับบทบาทด้านบนขวา เพื่อดูเมนู สิทธิ์ และการกรองข้อมูลที่ต่างกันตามหลักเกณฑ์</li>
                                <li><strong style="color: var(--text-primary);"><i class="fa-solid fa-arrows-spin" style="margin-right: 6px;"></i>การจำลองแบบ Real-Time:</strong> ระบบประมวลผลฉากหลังจะสุ่มสลับสถานะของพนักงานคนอื่นๆ พร้อมทั้งสร้างการแจ้งเตือนด้านบนขวาเพื่อให้เสมือนเชื่อมต่อกับ WebSocket เซิร์ฟเวอร์</li>
                                <li><strong style="color: var(--text-primary);"><i class="fa-solid fa-arrow-down-9-1" style="margin-right: 6px;"></i>Kanban Board & Reports:</strong> ทดลองลากวางการปิดการขาย และคัดกรองข้อมูลประวัติพร้อมส่งออก Excel/CSV จริงๆ</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="dashboard-panel">
                        <div class="panel-header">
                            <h4 class="panel-title"><i class="fa-solid fa-clock-rotate-left icon-decor" style="color: var(--color-secondary); margin-right: 8px;"></i>สถานะของฉันวันนี้</h4>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <div style="background-color: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <span>สายโทรเข้าวันนี้</span>
                                <strong style="font-size: 16px; color: var(--color-secondary);">14 สาย</strong>
                            </div>
                            <div style="background-color: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <span>สายโทรออกติดตาม</span>
                                <strong style="font-size: 16px; color: var(--color-warning);">28 สาย</strong>
                            </div>
                            <div style="background-color: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <span>อัตราการตอบรับแชทแรก</span>
                                <strong style="font-size: 16px; color: var(--color-success);">1.8 นาที</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // --- OPPORTUNITY KANBAN PIPELINE VIEW ---
    function renderOpportunityList(container) {
        container.innerHTML = `
            <div class="view-container">
                <div class="pipeline-wrapper">
                    <!-- Column New -->
                    <div class="pipeline-column" data-stage="new">
                        <div class="column-header">
                            <span class="column-title"><span class="title-dot new"></span>โอกาสขายใหม่</span>
                            <span class="column-count" id="count-new">0</span>
                        </div>
                        <div class="column-cards-container" id="container-new"></div>
                    </div>

                    <!-- Column Qualified -->
                    <div class="pipeline-column" data-stage="qualified">
                        <div class="column-header">
                            <span class="column-title"><span class="title-dot qualified"></span>ติดต่อเสนอแนะ</span>
                            <span class="column-count" id="count-qualified">0</span>
                        </div>
                        <div class="column-cards-container" id="container-qualified"></div>
                    </div>

                    <!-- Column Proposal -->
                    <div class="pipeline-column" data-stage="proposal">
                        <div class="column-header">
                            <span class="column-title"><span class="title-dot proposal"></span>ยื่นใบเสนอราคา</span>
                            <span class="column-count" id="count-proposal">0</span>
                        </div>
                        <div class="column-cards-container" id="container-proposal"></div>
                    </div>

                    <!-- Column Won -->
                    <div class="pipeline-column" data-stage="won">
                        <div class="column-header">
                            <span class="column-title"><span class="title-dot won"></span>ปิดการขายสำเร็จ (Won)</span>
                            <span class="column-count" id="count-won">0</span>
                        </div>
                        <div class="column-cards-container" id="container-won"></div>
                    </div>

                    <!-- Column Lost -->
                    <div class="pipeline-column" data-stage="lost">
                        <div class="column-header">
                            <span class="column-title"><span class="title-dot lost"></span>ล้มเหลว (Lost)</span>
                            <span class="column-count" id="count-lost">0</span>
                        </div>
                        <div class="column-cards-container" id="container-lost"></div>
                    </div>
                </div>
            </div>
        `;

        renderKanbanCards();
    }

    async function renderKanbanCards() {
        const columns = {
            new: document.getElementById("container-new"),
            qualified: document.getElementById("container-qualified"),
            proposal: document.getElementById("container-proposal"),
            won: document.getElementById("container-won"),
            lost: document.getElementById("container-lost")
        };

        const counts = {
            new: document.getElementById("count-new"),
            qualified: document.getElementById("count-qualified"),
            proposal: document.getElementById("count-proposal"),
            won: document.getElementById("count-won"),
            lost: document.getElementById("count-lost")
        };

        // Clear existing containers
        Object.keys(columns).forEach(key => {
            if (columns[key]) columns[key].innerHTML = "";
        });

        // Query opportunities list from server
        let list = LOCAL_STATE.opportunities;
        const res = await apiFetch('/opportunities');
        if (res) list = res;

        // Group cards
        const pipelineData = { new: [], qualified: [], proposal: [], won: [], lost: [] };
        list.forEach(opp => {
            if (pipelineData[opp.stage]) {
                pipelineData[opp.stage].push(opp);
            }
        });

        // Render to column UI
        Object.keys(pipelineData).forEach(stage => {
            const dataList = pipelineData[stage];
            if (counts[stage]) counts[stage].innerText = dataList.length;
            
            dataList.forEach(opp => {
                const card = document.createElement("div");
                card.className = "kanban-card";
                card.draggable = true;
                card.dataset.id = opp.id;
                
                const val = parseFloat(opp.value || 0);
                
                card.innerHTML = `
                    <div class="card-top">
                        <span class="card-company">${opp.company}</span>
                        <span class="card-id">${opp.id}</span>
                    </div>
                    <h5 class="card-title">${opp.title}</h5>
                    <div class="card-contact"><i class="fa-regular fa-user"></i> ${opp.contact_name || opp.contactName} (${opp.phone})</div>
                    <div class="card-footer">
                        <span class="card-amount">฿${val.toLocaleString()}</span>
                        <span class="card-days">${opp.days} วันก่อน</span>
                    </div>
                `;
                if (columns[stage]) columns[stage].appendChild(card);
            });
        });

        initKanbanDragEvents();
    }

    function initKanbanDragEvents() {
        const cards = document.querySelectorAll(".kanban-card");
        const containers = document.querySelectorAll(".column-cards-container");

        cards.forEach(card => {
            card.addEventListener("dragstart", () => {
                card.classList.add("dragging");
            });

            card.addEventListener("dragend", async () => {
                card.classList.remove("dragging");
                
                const newStage = card.parentElement.parentElement.dataset.stage;
                const oppId = card.dataset.id;
                
                // Update stage
                let success = false;
                const res = await apiFetch('/opportunities/stage', {
                    method: 'POST',
                    body: JSON.stringify({ id: oppId, stage: newStage })
                });

                if (res && res.success) {
                    success = true;
                } else {
                    // Fallback local update
                    const oppIndex = LOCAL_STATE.opportunities.findIndex(o => o.id === oppId);
                    if (oppIndex > -1) {
                        LOCAL_STATE.opportunities[oppIndex].stage = newStage;
                        success = true;
                    }
                }

                if (success) {
                    showToast("ย้ายโอกาสการขาย", `ปรับเปลี่ยนสถานะของ ${oppId} เป็น -> ${newStage.toUpperCase()} เรียบร้อย`, "success");
                    renderKanbanCards(); // Re-render card count
                }
            });
        });

        containers.forEach(container => {
            container.addEventListener("dragover", e => {
                e.preventDefault();
                const draggingCard = document.querySelector(".dragging");
                if (draggingCard) container.appendChild(draggingCard);
            });
        });
    }

    // --- OPPORTUNITY CALL & CHAT SIMULATOR VIEW ---
    async function renderOpportunityCall(container) {
        let oppsList = LOCAL_STATE.opportunities;
        const res = await apiFetch('/opportunities');
        if (res) oppsList = res;

        container.innerHTML = `
            <div class="view-container">
                <div class="call-simulator-grid">
                    <!-- Action Form Section -->
                    <div class="info-form-section">
                        <div class="form-group">
                            <label>เลือกหัวข้อโอกาสขยาย เพื่อบันทึกสายโทร</label>
                            <select id="call-opp-select" class="form-select-ctrl">
                                <option value="">-- กรุณาเลือกโอกาสการขาย --</option>
                                ${oppsList.map(o => `<option value="${o.id}">${o.id} - ${o.company} (${o.title.substring(0, 20)}...)</option>`).join("")}
                            </select>
                        </div>

                        <div id="call-details-form" style="display: none;">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>ชื่อลูกค้าติดต่อ</label>
                                    <input type="text" id="call-contact" class="form-control" readonly>
                                </div>
                                <div class="form-group">
                                    <label>เบอร์โทรศัพท์</label>
                                    <input type="text" id="call-phone" class="form-control" readonly>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>มูลค่าโครงการ</label>
                                <input type="text" id="call-value" class="form-control" readonly>
                            </div>

                            <div class="form-group">
                                <label>สถานะผลสายโทรศัพท์ (Call Outcome)</label>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                    <button class="call-status-pill" data-status="connected"><i class="fa-solid fa-phone"></i> ติดต่อสำเร็จ</button>
                                    <button class="call-status-pill" data-status="busy"><i class="fa-solid fa-phone-slash"></i> ลูกค้าติดสาย</button>
                                    <button class="call-status-pill" data-status="no-answer"><i class="fa-solid fa-volume-xmark"></i> ไม่มีคนรับสาย</button>
                                    <button class="call-status-pill" data-status="callback"><i class="fa-solid fa-calendar-days"></i> นัดโทรกลับ</button>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>บันทึกการพูดคุย (Call Notes)</label>
                                <textarea id="call-notes" class="form-control" rows="4" placeholder="กรอกข้อมูลสรุปความต้องการของลูกค้าและข้อตกลง..."></textarea>
                            </div>

                            <button id="save-call-btn" class="call-btn-primary">
                                <i class="fa-solid fa-floppy-disk"></i> บันทึกผลติดตามสายโทร
                            </button>
                        </div>
                        
                        <div id="call-fallback-message" style="padding: 40px; text-align: center; color: var(--text-muted); font-size: 13px;">
                            <i class="fa-solid fa-circle-info" style="font-size: 24px; margin-bottom: 12px; color: var(--color-primary);"></i>
                            <p>กรุณาเลือกโอกาสการขายด้านบน เพื่อเริ่มต้นจำลองการประมวลผลสายโทรศัพท์</p>
                        </div>
                    </div>

                    <!-- Chat Box Live Simulation Section -->
                    <div class="chat-simulator-panel">
                        <div class="chat-header">
                            <div class="chat-logo" id="chat-badge-channel"><i class="fa-brands fa-line"></i></div>
                            <div class="chat-partner-info">
                                <span class="chat-partner-name" id="chat-partner-name">ลูกค้าจำลองแชท</span>
                                <span class="chat-partner-channel" id="chat-partner-channel">Line Official Account</span>
                            </div>
                        </div>
                        
                        <div class="chat-body" id="chat-message-viewport">
                            <div class="empty-notifications" style="margin: auto;">
                                <i class="fa-solid fa-comments" style="font-size: 32px; color: var(--border-color); margin-bottom: 12px;"></i>
                                <p>เลือกโอกาสขายเพื่อเปิดระบบเชื่อมแชทไลน์ของลูกค้า</p>
                            </div>
                        </div>

                        <div class="chat-footer" style="opacity: 0.5; pointer-events: none;" id="chat-footer-controls">
                            <input type="text" id="chat-send-input" class="chat-input" placeholder="พิมพ์ข้อความตอบกลับลูกค้า...">
                            <button id="chat-send-btn" class="chat-send-btn"><i class="fa-solid fa-paper-plane"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const select = document.getElementById("call-opp-select");
        const detailsForm = document.getElementById("call-details-form");
        const fallbackMsg = document.getElementById("call-fallback-message");
        
        select.addEventListener("change", () => {
            const oppId = select.value;
            if (!oppId) {
                detailsForm.style.display = "none";
                fallbackMsg.style.display = "block";
                document.getElementById("chat-message-viewport").innerHTML = `
                    <div class="empty-notifications" style="margin: auto;">
                        <i class="fa-solid fa-comments" style="font-size: 32px; color: var(--border-color); margin-bottom: 12px;"></i>
                        <p>เลือกโอกาสขายเพื่อเปิดระบบเชื่อมแชทไลน์ของลูกค้า</p>
                    </div>
                `;
                document.getElementById("chat-footer-controls").style.opacity = "0.5";
                document.getElementById("chat-footer-controls").style.pointerEvents = "none";
                return;
            }

            detailsForm.style.display = "block";
            fallbackMsg.style.display = "none";

            const opp = oppsList.find(o => o.id === oppId);
            const val = parseFloat(opp.value || 0);
            
            document.getElementById("call-contact").value = opp.contact_name || opp.contactName;
            document.getElementById("call-phone").value = opp.phone;
            document.getElementById("call-value").value = `฿${val.toLocaleString()}`;

            // Outcome pills handler
            const pills = document.querySelectorAll(".call-status-pill");
            pills.forEach(p => {
                p.classList.remove("active");
                p.onclick = () => {
                    pills.forEach(x => x.classList.remove("active"));
                    p.classList.add("active");
                };
            });

            // Chat channels details
            document.getElementById("chat-partner-name").innerText = `${opp.contact_name || opp.contactName} - ${opp.company}`;
            document.getElementById("chat-partner-channel").innerText = "Facebook Messenger (API Integration)";
            document.getElementById("chat-badge-channel").innerHTML = `<i class="fa-brands fa-facebook-messenger"></i>`;
            document.getElementById("chat-badge-channel").style.backgroundColor = "#0084FF";

            // Load Chat Messages
            loadChatMessages(oppId);
            
            // Enable Chat inputs
            const chatFooter = document.getElementById("chat-footer-controls");
            chatFooter.style.opacity = "1";
            chatFooter.style.pointerEvents = "auto";
        });

        // Save Call Outcome Logs
        document.getElementById("save-call-btn").addEventListener("click", async () => {
            const activeOutcome = document.querySelector(".call-status-pill.active");
            if (!activeOutcome) {
                showToast("ข้อมูลไม่ครบถ้วน", "กรุณาเลือกสถานะผลสายโทรศัพท์ก่อนทำการบันทึก", "warn");
                return;
            }
            
            const notes = document.getElementById("call-notes").value;
            const oppId = select.value;
            
            const resCall = await apiFetch('/calls', {
                method: 'POST',
                body: JSON.stringify({
                    id: oppId,
                    outcome: activeOutcome.dataset.status,
                    notes: notes,
                    agentId: "A102" // default active agent id
                })
            });

            showToast("บันทึกสายสำเร็จ", `บันทึกกิจกรรมสายโทรเรียบร้อยสำหรับดีล ${oppId} ผลลัพธ์: ${activeOutcome.innerText}`, "success");
            document.getElementById("call-notes").value = "";
            activeOutcome.classList.remove("active");
        });

        // Live Chat messages sender simulation
        const chatInput = document.getElementById("chat-send-input");
        const sendBtn = document.getElementById("chat-send-btn");

        const sendMsg = async () => {
            const text = chatInput.value.trim();
            const oppId = select.value;
            if (!text || !oppId) return;

            const timeNow = new Date().toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' });

            const resChat = await apiFetch('/chats', {
                method: 'POST',
                body: JSON.stringify({
                    opportunity_id: oppId,
                    sender: "agent",
                    text: text,
                    time: timeNow
                })
            });

            if (!resChat) {
                // local state fallback
                if (!LOCAL_STATE.chatHistory[oppId]) LOCAL_STATE.chatHistory[oppId] = [];
                LOCAL_STATE.chatHistory[oppId].push({ sender: "agent", text, time: timeNow });
            }

            chatInput.value = "";
            loadChatMessages(oppId);

            // simulated response trigger after 3s
            setTimeout(async () => {
                const replyTime = new Date().toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' });
                const replyText = "ได้รับข้อความแล้วค่ะ เดี๋ยวผลจะแจ้งกลับมาทางแชทอีกทีนึงนะคะ ขอบคุณสำหรับความช่วยเหลือ";
                
                const resReply = await apiFetch('/chats', {
                    method: 'POST',
                    body: JSON.stringify({
                        opportunity_id: oppId,
                        sender: "client",
                        text: replyText,
                        time: replyTime
                    })
                });

                if (!resReply) {
                    LOCAL_STATE.chatHistory[oppId].push({ sender: "client", text: replyText, time: replyTime });
                }

                loadChatMessages(oppId);
                const opp = oppsList.find(o => o.id === oppId);
                showToast("มีแชทลูกค้าใหม่", `ข้อความไลน์ใหม่จาก ${opp.contact_name || opp.contactName}`, "info");
            }, 3000);
        };

        sendBtn.addEventListener("click", sendMsg);
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === 'Enter') sendMsg();
        });
    }

    async function loadChatMessages(oppId) {
        const viewport = document.getElementById("chat-message-viewport");
        viewport.innerHTML = "";
        
        let history = [];
        const res = await apiFetch(`/chats/${oppId}`);
        if (res) {
            history = res;
        } else {
            history = LOCAL_STATE.chatHistory[oppId] || [];
        }
        
        if (history.length === 0) {
            viewport.innerHTML = `
                <div class="empty-notifications" style="margin: auto;">
                    <i class="fa-solid fa-envelope-open" style="font-size: 28px; color: var(--border-color); margin-bottom: 8px;"></i>
                    <p>ยังไม่มีข้อความส่งตรงถึงห้องสนทนานี้</p>
                </div>
            `;
            return;
        }

        history.forEach(msg => {
            const row = document.createElement("div");
            row.className = `chat-message-row ${msg.sender}`;
            row.innerHTML = `
                <div class="chat-bubble">
                    ${msg.text}
                    <div style="font-size: 9px; text-align: right; margin-top: 4px; opacity: 0.6;">${msg.time}</div>
                </div>
            `;
            viewport.appendChild(row);
        });

        viewport.scrollTop = viewport.scrollHeight;
    }

    // --- CUSTOMER SEGMENT VIEW ---
    function renderCustomerSegment(container) {
        const segments = ["ทั้งหมด", "Platinum Tier", "VIP Builder", "SME Contractor", "Retail Walk-In"];
        
        container.innerHTML = `
            <div class="view-container">
                <div class="monitor-header-actions" style="margin-bottom: 20px;">
                    <div class="search-ctrl-box">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" id="segment-search-input" placeholder="ค้นหาชื่อ บจก. / ช่างรับเหมา...">
                    </div>
                    
                    <div style="display: flex; gap: 8px;" id="segment-filters-container"></div>
                </div>

                <div class="agent-grid-table-container">
                    <table class="agent-grid-table">
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
                        <tbody id="segment-list-body"></tbody>
                    </table>
                </div>
            </div>
        `;

        const filterContainer = document.getElementById("segment-filters-container");
        let activeFilter = "ทั้งหมด";

        const renderFilters = () => {
            filterContainer.innerHTML = segments.map(seg => `
                <button class="panel-action-btn ${seg === activeFilter ? 'active' : ''}" 
                        style="${seg === activeFilter ? 'border-color: var(--color-primary); background-color: rgba(239, 41, 57, 0.1); color: white;' : ''}"
                        data-segment="${seg}">
                    ${seg}
                </button>
            `).join("");

            filterContainer.querySelectorAll("button").forEach(btn => {
                btn.onclick = () => {
                    activeFilter = btn.dataset.segment;
                    renderFilters();
                    filterCustomerTable();
                };
            });
        };

        const filterCustomerTable = async () => {
            const searchVal = document.getElementById("segment-search-input").value;
            const body = document.getElementById("segment-list-body");
            body.innerHTML = "";

            let list = [];
            const res = await apiFetch(`/customers?search=${encodeURIComponent(searchVal)}&segment=${encodeURIComponent(activeFilter)}`);
            
            if (res) {
                list = res;
            } else {
                // Local state filtering fallback
                list = LOCAL_STATE.customers.filter(c => {
                    const matchesSearch = c.name.toLowerCase().includes(searchVal.toLowerCase()) || c.code.toLowerCase().includes(searchVal.toLowerCase());
                    const matchesFilter = activeFilter === "ทั้งหมด" || c.segment === activeFilter;
                    return matchesSearch && matchesFilter;
                });
            }

            if (list.length === 0) {
                body.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">ไม่มีข้อมูลลูกค้าตรงกับเงื่อนไขการกรอง</td></tr>`;
                return;
            }

            list.forEach(c => {
                const statusColor = c.status === "ติดตามด่วน" ? 'color: var(--color-danger); font-weight:600;' : 'color: var(--text-secondary);';
                
                // standard date check
                let lastContactDate = c.last_contact || c.lastContact;
                if (lastContactDate && lastContactDate.includes("T")) {
                    lastContactDate = lastContactDate.slice(0, 10);
                }

                body.innerHTML += `
                    <tr>
                        <td><strong>${c.code}</strong></td>
                        <td>${c.name}</td>
                        <td><span style="color: var(--color-secondary); font-weight: 500;">${c.segment}</span></td>
                        <td>${c.province}</td>
                        <td>${c.last_order || c.lastOrder}</td>
                        <td>${lastContactDate}</td>
                        <td style="${statusColor}"><i class="fa-solid ${c.status === 'ติดตามด่วน' ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i> ${c.status}</td>
                    </tr>
                `;
            });
        };

        renderFilters();
        filterCustomerTable();

        document.getElementById("segment-search-input").addEventListener("input", filterCustomerTable);
    }

    // --- AGENT MONITOR VIEW (REAL-TIME SIMULATION) ---
    function renderAgentMonitor(container) {
        container.innerHTML = `
            <div class="view-container monitor-view">
                <div class="monitor-header-actions">
                    <div style="font-size: 13px; font-weight: 500;">
                        <i class="fa-solid fa-satellite-dish" style="color: var(--color-success); margin-right: 8px; animation: pulse 2s infinite;"></i>
                        ระบบอัปเดตสถานะแบบพุช Real-Time จำลอง 6 เจ้าหน้าที่
                    </div>
                    
                    <button id="trigger-simulate-btn" class="panel-action-btn" style="border-color: var(--color-secondary); color: white;">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> สุ่มจำลองการเปลี่ยนสถานะทันที
                    </button>
                </div>

                <div class="agent-grid-table-container">
                    <table class="agent-grid-table">
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
                        <tbody id="monitor-list-body"></tbody>
                    </table>
                </div>
            </div>
        `;

        renderMonitorRows();

        document.getElementById("trigger-simulate-btn").onclick = () => {
            triggerAgentSimulation();
        };
    }

    async function renderMonitorRows() {
        const body = document.getElementById("monitor-list-body");
        if (!body) return;
        body.innerHTML = "";

        let agents = LOCAL_STATE.agents;
        const res = await apiFetch('/agents');
        if (res) agents = res;

        agents.forEach(a => {
            const conversion = parseInt(a.conversion || 0);
            const progressColor = conversion > 70 ? 'var(--color-success)' : conversion > 50 ? 'var(--color-warning)' : 'var(--color-danger)';
            
            let statusText = "ออฟไลน์";
            if (a.status === "online") statusText = "พร้อมทำงาน (Online)";
            else if (a.status === "break") statusText = "พักเบรก (Break)";
            else if (a.status === "lunch") statusText = "พักเที่ยง (Lunch)";

            const breakText = (a.break_remain !== undefined ? a.break_remain : a.breakRemain) || 0;
            const salesVal = parseFloat(a.sales || 0);

            body.innerHTML += `
                <tr>
                    <td><strong>${a.id}</strong></td>
                    <td class="agent-cell-name">
                        <div class="profile-avatar" style="width: 28px; height: 28px; font-size: 10px; box-shadow: none;">${a.name.substring(0,2)}</div>
                        ${a.name}
                    </td>
                    <td>${a.team}</td>
                    <td>
                        <span class="agent-badge-status ${a.status}">
                            <span class="status-indicator-dot ${a.status}"></span> ${statusText}
                        </span>
                    </td>
                    <td>${breakText > 0 ? `${breakText} นาที` : '-'}</td>
                    <td><strong>${a.calls} สาย</strong></td>
                    <td>฿${salesVal.toLocaleString()}</td>
                    <td>
                        <span class="agent-progress-bar-bg">
                            <span class="agent-progress-bar-fill" style="width: ${conversion}%; background-color: ${progressColor};"></span>
                        </span>
                        <strong>${conversion}%</strong>
                    </td>
                </tr>
            `;
        });
    }

    // --- ANALYTICS DASHBOARD VIEW ---
    async function renderDashboard(container) {
        let stats = {
            totals: { target: 1438000, salesWon: 0, winRate: 0 },
            monthlyTargets: { targets: [300000, 350000, 400000, 450000, 500000], actuals: [315000, 340000, 420000, 480000, 520000] },
            chatChannels: [45, 25, 20, 10]
        };

        const res = await apiFetch('/dashboard/analytics');
        if (res) {
            stats = res;
        } else {
            // Local defaults
            const wonOpps = LOCAL_STATE.opportunities.filter(o => o.stage === "won");
            const totalWonAmount = wonOpps.reduce((acc, curr) => acc + curr.value, 0);
            stats.totals.salesWon = totalWonAmount;
            stats.monthlyTargets.actuals[4] = totalWonAmount > 500000 ? Math.round(totalWonAmount) : 520000;
        }

        container.innerHTML = `
            <div class="view-container">
                <div class="kpi-grid">
                    <div class="kpi-card" style="padding: 16px;">
                        <span class="kpi-title">เป้าขายรวมปี 2026</span>
                        <span class="kpi-value" style="font-size: 22px;">฿${stats.totals.target ? stats.totals.target.toLocaleString() : '4,500,000'}</span>
                    </div>
                    <div class="kpi-card" style="padding: 16px;">
                        <span class="kpi-title">ยอดสั่งซื้อทำสำเร็จสะสม</span>
                        <span class="kpi-value" style="font-size: 22px; color: var(--color-success);">฿${Math.round(stats.totals.salesWon || 0).toLocaleString()}</span>
                    </div>
                    <div class="kpi-card" style="padding: 16px;">
                        <span class="kpi-title">ระยะเวลาเฉลี่ยปิดงาน</span>
                        <span class="kpi-value" style="font-size: 22px; color: var(--color-secondary);">6.2 วัน</span>
                    </div>
                </div>

                <div class="dashboard-grid" style="grid-template-columns: 1fr 1fr; margin-top: 25px;">
                    <div class="dashboard-panel">
                        <div class="panel-header">
                            <h4 class="panel-title"><i class="fa-solid fa-chart-column" style="color: var(--color-primary); margin-right: 8px;"></i>เป้าการขายสะสมรายเดือน</h4>
                        </div>
                        <div style="position: relative; height: 300px;">
                            <canvas id="monthly-targets-chart"></canvas>
                        </div>
                    </div>
                    
                    <div class="dashboard-panel">
                        <div class="panel-header">
                            <h4 class="panel-title"><i class="fa-solid fa-chart-pie" style="color: var(--color-secondary); margin-right: 8px;"></i>ช่องทางการติดต่อลูกค้าหลัก</h4>
                        </div>
                        <div style="position: relative; height: 300px;">
                            <canvas id="chat-channels-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render charts
        setTimeout(() => {
            const ctx1 = document.getElementById("monthly-targets-chart").getContext("2d");
            charts.monthly = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.'],
                    datasets: [
                        {
                            label: 'เป้าหมายตั้ง (Target)',
                            data: stats.monthlyTargets.targets,
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 1
                        },
                        {
                            label: 'ยอดปิดได้จริง (Actual)',
                            data: stats.monthlyTargets.actuals,
                            backgroundColor: '#EF2939',
                            borderColor: '#EF2939',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: '#F3F4F6' } }
                    },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } },
                        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } }
                    }
                }
            });

            const ctx2 = document.getElementById("chat-channels-chart").getContext("2d");
            charts.channels = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: ['Line OA', 'Facebook Messenger', 'เบอร์โทรศัพท์สายตรง', 'หน้าร้าน (Walk-in)'],
                    datasets: [{
                        data: stats.chatChannels,
                        backgroundColor: ['#10B981', '#0084FF', '#EF2939', '#F59E0B'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#F3F4F6', boxWidth: 12 } }
                    }
                }
            });
        }, 100);
    }

    // --- GRID REPORTS & CSV GENERATOR VIEW ---
    function renderReports(container) {
        container.innerHTML = `
            <div class="view-container">
                <div class="report-filter-bar">
                    <div class="filter-item">
                        <label>ค้นหาดีล/บริษัท</label>
                        <input type="text" id="report-search" class="filter-input" placeholder="คำค้นหา..." value="${LOCAL_STATE.reports.searchTerm}">
                    </div>
                    
                    <div class="filter-item">
                        <label>คัดกรองขั้นตอน</label>
                        <select id="report-stage-filter" class="filter-select">
                            <option value="all">-- ทั้งหมด --</option>
                            <option value="new">โอกาสขายใหม่</option>
                            <option value="qualified">ติดต่อเสนอแนะ</option>
                            <option value="proposal">ยื่นใบเสนอราคา</option>
                            <option value="won">ปิดการขายสำเร็จ</option>
                            <option value="lost">ล้มเหลว</option>
                        </select>
                    </div>

                    <button id="report-export-csv" class="export-btn">
                        <i class="fa-solid fa-file-csv"></i> ส่งออกเป็นไฟล์ CSV
                    </button>
                </div>

                <div class="agent-grid-table-container">
                    <table class="agent-grid-table">
                        <thead>
                            <tr>
                                <th class="sortable-th" data-sort="id">รหัสดีล <span class="sort-icon"><i class="fa-solid fa-sort"></i></span></th>
                                <th class="sortable-th" data-sort="company">ชื่อลูกค้ารับเหมา/บริษัท <span class="sort-icon"><i class="fa-solid fa-sort"></i></span></th>
                                <th class="sortable-th" data-sort="title">รายละเอียดโครงการ <span class="sort-icon"><i class="fa-solid fa-sort"></i></span></th>
                                <th class="sortable-th" data-sort="value">มูลค่าขาย (บาท) <span class="sort-icon"><i class="fa-solid fa-sort"></i></span></th>
                                <th class="sortable-th" data-sort="stage">ขั้นตอนการดีล <span class="sort-icon"><i class="fa-solid fa-sort"></i></span></th>
                                <th class="sortable-th" data-sort="days">อายุโครงการ <span class="sort-icon"><i class="fa-solid fa-sort"></i></span></th>
                            </tr>
                        </thead>
                        <tbody id="report-table-body"></tbody>
                    </table>
                </div>

                <div class="pagination-panel">
                    <div class="pagination-info" id="report-page-info">แสดงข้อมูล 0-0 จากทั้งหมด 0 รายการ</div>
                    
                    <div class="pagination-controls">
                        <button class="page-btn" id="prev-page-btn" disabled><i class="fa-solid fa-chevron-left"></i></button>
                        <button class="page-btn" id="next-page-btn"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>
            </div>
        `;

        renderReportRows();

        // Sort header handles
        document.querySelectorAll(".sortable-th").forEach(th => {
            th.addEventListener("click", () => {
                const sortBy = th.dataset.sort;
                if (LOCAL_STATE.reports.sortColumn === sortBy) {
                    LOCAL_STATE.reports.sortDirection = LOCAL_STATE.reports.sortDirection === "asc" ? "desc" : "asc";
                } else {
                    LOCAL_STATE.reports.sortColumn = sortBy;
                    LOCAL_STATE.reports.sortDirection = "asc";
                }
                renderReportRows();
            });
        });

        // Inputs handles
        document.getElementById("report-search").addEventListener("input", (e) => {
            LOCAL_STATE.reports.searchTerm = e.target.value;
            LOCAL_STATE.reports.currentPage = 1;
            renderReportRows();
        });

        document.getElementById("report-stage-filter").addEventListener("change", () => {
            LOCAL_STATE.reports.currentPage = 1;
            renderReportRows();
        });

        document.getElementById("prev-page-btn").addEventListener("click", () => {
            if (LOCAL_STATE.reports.currentPage > 1) {
                LOCAL_STATE.reports.currentPage--;
                renderReportRows();
            }
        });

        document.getElementById("next-page-btn").addEventListener("click", () => {
            LOCAL_STATE.reports.currentPage++;
            renderReportRows();
        });

        document.getElementById("report-export-csv").addEventListener("click", () => {
            exportReportsToCSV();
        });
    }

    async function renderReportRows() {
        const body = document.getElementById("report-table-body");
        if (!body) return;

        const search = LOCAL_STATE.reports.searchTerm.toLowerCase();
        const stageFilter = document.getElementById("report-stage-filter").value;
        const page = LOCAL_STATE.reports.currentPage;
        const size = LOCAL_STATE.reports.pageSize;
        const sortCol = LOCAL_STATE.reports.sortColumn;
        const sortDir = LOCAL_STATE.reports.sortDirection;

        let reportsData = null;
        const res = await apiFetch(`/reports?page=${page}&pageSize=${size}&search=${encodeURIComponent(search)}&stage=${stageFilter}&sortColumn=${sortCol}&sortDirection=${sortDir}`);
        
        if (res) {
            reportsData = res;
        } else {
            // Local fallback logic
            let filtered = LOCAL_STATE.opportunities.filter(opp => {
                const matchesSearch = opp.company.toLowerCase().includes(search) || 
                                     opp.title.toLowerCase().includes(search) || 
                                     opp.id.toLowerCase().includes(search);
                const matchesStage = stageFilter === "all" || opp.stage === stageFilter;
                return matchesSearch && matchesStage;
            });

            filtered.sort((a, b) => {
                let fieldA = a[sortCol];
                let fieldB = b[sortCol];
                if (typeof fieldA === "string") {
                    fieldA = fieldA.toLowerCase();
                    fieldB = fieldB.toLowerCase();
                }
                if (fieldA < fieldB) return sortDir === "asc" ? -1 : 1;
                if (fieldA > fieldB) return sortDir === "asc" ? 1 : -1;
                return 0;
            });

            const total = filtered.length;
            const pages = Math.ceil(total / size) || 1;
            const startIdx = (page - 1) * size;
            const paginated = filtered.slice(startIdx, startIdx + size);

            reportsData = {
                totalItems: total,
                totalPages: pages,
                currentPage: page,
                pageSize: size,
                data: paginated
            };
        }

        const totalItems = reportsData.totalItems;
        const totalPages = reportsData.totalPages;
        const pageNum = reportsData.currentPage;
        
        const startNum = totalItems > 0 ? (pageNum - 1) * size + 1 : 0;
        const endNum = Math.min(startNum + reportsData.data.length - 1, totalItems);

        document.getElementById("report-page-info").innerText = `แสดงข้อมูล ${startNum}-${endNum} จากทั้งหมด ${totalItems} รายการ`;
        document.getElementById("prev-page-btn").disabled = pageNum === 1;
        document.getElementById("next-page-btn").disabled = pageNum >= totalPages;

        body.innerHTML = "";

        if (reportsData.data.length === 0) {
            body.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 40px;">ไม่มีรายการข้อมูลโครงการตรงกับเงื่อนไขของคุณ</td></tr>`;
            return;
        }

        reportsData.data.forEach(opp => {
            let stageBadge = "";
            switch (opp.stage) {
                case "new": stageBadge = '<span class="agent-badge-status offline">โอกาสขายใหม่</span>'; break;
                case "qualified": stageBadge = '<span class="agent-badge-status break">ติดต่อเสนอแนะ</span>'; break;
                case "proposal": stageBadge = '<span class="agent-badge-status break" style="color: var(--color-warning);">ยื่นใบเสนอราคา</span>'; break;
                case "won": stageBadge = '<span class="agent-badge-status online">สำเร็จ</span>'; break;
                case "lost": stageBadge = '<span class="agent-badge-status lunch">ล้มเหลว</span>'; break;
            }

            const val = parseFloat(opp.value || 0);

            body.innerHTML += `
                <tr>
                    <td><strong>${opp.id}</strong></td>
                    <td>${opp.company}</td>
                    <td>${opp.title}</td>
                    <td><strong>฿${val.toLocaleString()}</strong></td>
                    <td>${stageBadge}</td>
                    <td>${opp.days} วัน</td>
                </tr>
            `;
        });
    }

    async function exportReportsToCSV() {
        let list = LOCAL_STATE.opportunities;
        const res = await apiFetch('/opportunities');
        if (res) list = res;

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Deal ID,Company,Project Title,Sales Amount (THB),Deal Stage,Project Age (Days)\n";

        list.forEach(opp => {
            const company = `"${opp.company.replace(/"/g, '""')}"`;
            const title = `"${opp.title.replace(/"/g, '""')}"`;
            csvContent += `${opp.id},${company},${title},${opp.value},${opp.stage.toUpperCase()},${opp.days}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `STK_Report_Sales_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("ส่งออกข้อมูลสำเร็จ", "สร้างเอกสารแผ่นงาน CSV เรียบร้อยแล้ว (กำลังดาวน์โหลด)", "success");
    }

    // --- SYSTEM SECURITY & PERMISSION MANAGEMENT VIEW ---
    function renderManagement(container) {
        container.innerHTML = `
            <div class="view-container management-container">
                <div class="perm-role-panel">
                    <div class="panel-header" style="margin-bottom: 12px;">
                        <h4 class="panel-title"><i class="fa-solid fa-circle-user" style="color: var(--color-primary); margin-right: 8px;"></i>ตัวควบคุมสิทธิ์เมนู: Manager (Role A)</h4>
                    </div>
                    <p style="font-size: 11px; color: var(--text-secondary); margin-bottom: 20px;">สลับเปิด/ปิด เพื่อปรับเปลี่ยนโครงข่ายเมนูด้านข้างของบทบาท Manager ทันทีในการทดสอบระบบ</p>
                    
                    <div class="perm-list" id="role-a-perms-list"></div>
                </div>

                <div class="perm-role-panel">
                    <div class="panel-header" style="margin-bottom: 12px;">
                        <h4 class="panel-title"><i class="fa-solid fa-headset" style="color: var(--color-secondary); margin-right: 8px;"></i>ตัวควบคุมสิทธิ์เมนู: Agent (Role B)</h4>
                    </div>
                    <p style="font-size: 11px; color: var(--text-secondary); margin-bottom: 20px;">สลับเปิด/ปิด เพื่อปรับเปลี่ยนโครงข่ายเมนูด้านข้างของบทบาท Agent ทันทีในการทดสอบระบบ</p>
                    
                    <div class="perm-list" id="role-b-perms-list"></div>
                </div>
            </div>
        `;

        renderPermissionCheckboxes();
    }

    async function renderPermissionCheckboxes() {
        let permissions = LOCAL_STATE.permissions;
        const resPerms = await apiFetch('/permissions');
        if (resPerms) permissions = resPerms;

        const createChecklist = (role, elemId) => {
            const container = document.getElementById(elemId);
            if (!container) return;
            container.innerHTML = "";

            const allFeatures = ["home", "opportunity", "call", "segment", "monitor", "dashboard", "report"];
            
            allFeatures.forEach(feature => {
                const checked = (permissions[role] || []).includes(feature);
                const desc = MENU_TITLES[feature];
                
                const row = document.createElement("div");
                row.className = "perm-row-ctrl";
                row.innerHTML = `
                    <div class="perm-info">
                        <div class="perm-info-title">${desc.title}</div>
                        <div class="perm-info-desc">สิทธิ์เข้าใช้เส้นทาง /${feature}</div>
                    </div>
                    <label class="switch-control">
                        <input type="checkbox" data-role="${role}" data-feature="${feature}" ${checked ? 'checked' : ''}>
                        <span class="switch-slider"></span>
                    </label>
                `;
                container.appendChild(row);
            });
        };

        createChecklist("role_a", "role-a-perms-list");
        createChecklist("role_b", "role-b-perms-list");

        // Toggle triggers handles
        document.querySelectorAll(".switch-control input").forEach(chk => {
            chk.addEventListener("change", async () => {
                const role = chk.dataset.role;
                const feature = chk.dataset.feature;
                const activePerms = permissions[role] || [];

                if (chk.checked) {
                    if (!activePerms.includes(feature)) activePerms.push(feature);
                    showToast("เปิดใช้งานสิทธิ์", `อนุญาตให้บทบาท ${role.toUpperCase()} เข้าถึงหน้า /${feature}`, "success");
                } else {
                    const idx = activePerms.indexOf(feature);
                    if (idx > -1) activePerms.splice(idx, 1);
                    showToast("ถอนสิทธิ์ระบบ", `บล็อกไม่ให้บทบาท ${role.toUpperCase()} เข้าถึงหน้า /${feature}`, "warn");
                }

                // Update server permissions
                await apiFetch('/permissions', {
                    method: 'POST',
                    body: JSON.stringify({ role, allowed_menus: activePerms })
                });

                // Update in-memory state
                LOCAL_STATE.permissions = permissions;

                renderMenu(); // Redraw lateral list in real-time
                
                // Force access protection trigger if user is currently watching
                const currentHash = window.location.hash || "#home";
                routeTo(currentHash);
            });
        });
    }

    // ==========================================================================
    // 4. REAL-TIME EVENT SIMULATION ENGINE
    // ==========================================================================
    
    async function triggerAgentSimulation() {
        // Send trigger API to server
        const res = await apiFetch('/agents/simulate', { method: 'POST' });
        
        if (res && res.success) {
            // Push toast
            showToast("พุชอัปเดตระบบ", res.notification.text, res.notification.type);
            updateNotificationBell();
            
            // Refresh Monitor screen if open
            const currentHash = window.location.hash || "#home";
            if (currentHash === "#monitor") {
                renderMonitorRows();
            }
        } else {
            // Local simulated fallback
            const randAgentIdx = Math.floor(Math.random() * LOCAL_STATE.agents.length);
            const agent = LOCAL_STATE.agents[randAgentIdx];
            const statuses = ["online", "break", "lunch"];
            let newStatus = agent.status;
            while (newStatus === agent.status) {
                newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            }

            agent.status = newStatus;
            let statusText = "ออนไลน์";
            let type = "success";
            
            if (newStatus === "break") { statusText = "พักเบรก"; type = "warn"; agent.breakRemain = 30; } 
            else if (newStatus === "lunch") { statusText = "พักเที่ยง"; type = "danger"; agent.breakRemain = 0; }
            else { agent.breakRemain = 30; }

            const text = `เจ้าหน้าที่ ${agent.name} (${agent.id}) ได้ปรับเปลี่ยนสถานะการทำงานเป็น -> ${statusText}`;
            const timeNow = new Date().toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            LOCAL_STATE.notifications.unshift({
                id: Date.now(),
                text: text,
                type: type,
                time: timeNow,
                unread: true
            });

            showToast("พุชอัปเดตระบบ", text, type);
            updateNotificationBell();
            
            if (window.location.hash === "#monitor") renderMonitorRows();
        }
    }

    async function updateNotificationBell() {
        const countBadge = document.getElementById("notification-count");
        const listContainer = document.getElementById("notification-list");
        
        let list = [];
        const res = await apiFetch('/notifications');
        if (res) {
            list = res;
        } else {
            list = LOCAL_STATE.notifications;
        }

        const unreadCount = list.filter(n => n.unread).length;
        countBadge.innerText = unreadCount;
        countBadge.style.display = unreadCount > 0 ? "flex" : "none";

        if (list.length === 0) {
            listContainer.innerHTML = `<div class="empty-notifications">ไม่มีการแจ้งเตือนใหม่</div>`;
            return;
        }

        listContainer.innerHTML = list.map(n => `
            <div class="notification-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
                <div class="notif-icon ${n.type}">
                    <i class="fa-solid ${n.type === 'success' ? 'fa-circle-check' : n.type === 'warn' ? 'fa-triangle-exclamation' : n.type === 'danger' ? 'fa-mug-hot' : 'fa-circle-info'}"></i>
                </div>
                <div class="notif-content">
                    <span class="notif-text">${n.text}</span>
                    <span class="notif-time">${n.time}</span>
                </div>
            </div>
        `).join("");

        // Mark read triggers
        listContainer.querySelectorAll(".notification-item").forEach(item => {
            item.onclick = async () => {
                const id = parseInt(item.dataset.id);
                
                await apiFetch('/notifications/read', {
                    method: 'POST',
                    body: JSON.stringify({ id })
                });

                // in memory fallback
                const notifIndex = LOCAL_STATE.notifications.findIndex(n => n.id === id);
                if (notifIndex > -1) {
                    LOCAL_STATE.notifications[notifIndex].unread = false;
                }
                
                updateNotificationBell();
            };
        });
    }

    // Interval representing websocket push polling status checks
    setInterval(() => {
        // 25% chance every 15 seconds to simulate agent changes
        if (Math.random() < 0.25) {
            triggerAgentSimulation();
        }
    }, 15000);

    // ==========================================================================
    // 5. GLOBAL INTERACTIVE CONTROLS
    // ==========================================================================
    
    // Collapsible Sidebar Drawer
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    
    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        const icon = sidebarToggle.querySelector("i");
        if (sidebar.classList.contains("collapsed")) {
            icon.className = "fa-solid fa-chevron-right";
        } else {
            icon.className = "fa-solid fa-chevron-left";
        }
    });

    // Top Right Status dropdown handler
    const statusSelect = document.getElementById("agent-status-select");
    const statusDot = document.querySelector(".status-indicator-dot");

    statusSelect.addEventListener("change", async () => {
        const val = statusSelect.value;
        statusDot.className = `status-indicator-dot ${val}`;
        
        let label = "ว่าง (Online)";
        if (val === "break") label = "พักเบรก (Break)";
        else if (val === "lunch") label = "พักเที่ยง (Lunch)";
        else if (val === "offline") label = "ออฟไลน์ (Offline)";

        LOCAL_STATE.currentUser.status = val;

        // Post updates to API
        await apiFetch('/agents/status', {
            method: 'POST',
            body: JSON.stringify({ id: "A102", status: val }) // Napa agent id
        });

        showToast("ปรับปรุงสถานะของคุณ", `แก้ไขสถานะแอปเป็น: ${label}`, "info");
    });

    // Top Right Roles Selector
    const roleSelect = document.getElementById("role-select");
    const nameDisplay = document.getElementById("user-display-name");
    const roleDisplay = document.getElementById("user-role-display");

    roleSelect.addEventListener("change", () => {
        const newRole = roleSelect.value;
        LOCAL_STATE.currentUser.role = newRole;

        if (newRole === "role_a") {
            nameDisplay.innerText = "สมชาย ใจดี";
            roleDisplay.innerText = "Manager";
        } else if (newRole === "role_b") {
            nameDisplay.innerText = "นภา สุขดี";
            roleDisplay.innerText = "Agent";
        } else if (newRole === "role_c") {
            nameDisplay.innerText = "วิโรจน์ แสงใต้";
            roleDisplay.innerText = "Viewer";
        } else if (newRole === "admin") {
            nameDisplay.innerText = "ผู้ดูแลระบบสูงสุด";
            roleDisplay.innerText = "System Admin";
        }

        showToast("เปลี่ยนสิทธิ์บัญชี", `ย้ายการรับชมข้อมูลไปที่บทบาท: ${roleDisplay.innerText}`, "info");
        
        renderMenu(); // Re-render menu links permissions
        
        const currentHash = window.location.hash || "#home";
        routeTo(currentHash); // Redraw screen
    });

    // Notification dropdown handles
    const bell = document.getElementById("notification-trigger");
    const dropdown = document.getElementById("notification-dropdown");

    bell.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("active");
    });

    document.addEventListener("click", () => {
        dropdown.classList.remove("active");
    });

    dropdown.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    document.getElementById("clear-notifications").onclick = async () => {
        await apiFetch('/notifications/clear', { method: 'POST' });
        LOCAL_STATE.notifications = [];
        updateNotificationBell();
    };

    // Simulated SSO Logins
    const loginOverlay = document.getElementById("login-overlay");
    
    const handleLogin = async (role) => {
        loginOverlay.classList.remove("active");
        roleSelect.value = role;
        
        let username = "somchai.j@thaiwatsadu.com";
        if (role === "role_b") username = "napa.s@thaiwatsadu.com";
        else if (role === "role_c") username = "wirot.s@thaiwatsadu.com";
        else if (role === "admin") username = "admin@thaiwatsadu.com";

        // Query authentications from server
        const resUser = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username })
        });

        if (resUser) {
            console.log(`SSO Login Handshake confirmed: ${resUser.name} (${resUser.role})`);
        }

        roleSelect.dispatchEvent(new Event("change"));
        showToast("เชื่อมต่อ Azure สำเร็จ", "การตรวจสอบสิทธิ์ผ่าน Microsoft Azure AD B2C ถูกเข้ารหัส เรียบร้อย", "success");
        updateNotificationBell();
    };

    document.getElementById("microsoft-login-btn").onclick = () => {
        handleLogin("role_a"); // Default login Manager
    };

    document.querySelectorAll(".quick-login-btn").forEach(btn => {
        btn.onclick = () => {
            handleLogin(btn.dataset.role);
        };
    });

    // ==========================================================================
    // 6. TOAST BANNER UTILITY & APP INITIALIZER
    // ==========================================================================
    
    function showToast(title, msg, type = "info") {
        const popup = document.createElement("div");
        popup.className = "alert-popup";
        
        let borderClass = "";
        let iconClass = "fa-circle-info";
        if (type === "success") { borderClass = "border-left: 4px solid var(--color-success); border-color: var(--color-success);"; iconClass = "fa-circle-check"; }
        else if (type === "warn") { borderClass = "border-left: 4px solid var(--color-warning); border-color: var(--color-warning);"; iconClass = "fa-triangle-exclamation"; }
        else if (type === "danger") { borderClass = "border-left: 4px solid var(--color-danger); border-color: var(--color-danger);"; iconClass = "fa-mug-hot"; }

        popup.style.cssText = borderClass;
        popup.innerHTML = `
            <div class="notif-icon ${type}"><i class="fa-solid ${iconClass}"></i></div>
            <div style="display: flex; flex-direction: column;">
                <strong style="font-size: 13px; color: var(--text-primary); margin-bottom: 2px;">${title}</strong>
                <span style="font-size: 11px; color: var(--text-secondary); line-height: 1.3;">${msg}</span>
            </div>
        `;

        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.style.animation = "alertSlideIn 0.3s forwards reverse";
            setTimeout(() => {
                if (popup && popup.parentElement) document.body.removeChild(popup);
            }, 300);
        }, 4000);
    }

    // SPA Router Hash binder
    window.addEventListener("hashchange", () => {
        routeTo(window.location.hash);
    });

    // Start App initialization sequence!
    async function initApp() {
        await checkServerConnection();
        renderMenu();
        routeTo(window.location.hash);
        updateNotificationBell();
    }

    initApp();
});
