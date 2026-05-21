"use client";

import { useState, useEffect, useRef } from "react";

// ==========================================================================
// LOCAL STATE DEFAULTS (Resilient Dual-Mode Fallback data)
// ==========================================================================
const LOCAL_STATE_PERMISSIONS = {
  role_a: ["home", "opportunity", "monitor", "dashboard", "report"],
  role_b: ["home", "opportunity", "call", "segment"],
  role_c: ["home", "monitor", "dashboard", "report"],
  admin: ["home", "opportunity", "call", "segment", "monitor", "dashboard", "report", "management"]
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
  { code: "CUST-801", name: "วิวัฒน์ เอนจิเนียริ่ง", segment: "Platinum Tier", province: "กรุงเทพฯ", last_order: "150,000 บาท", last_contact: "2026-05-18", status: "ปกติ" },
  { code: "CUST-802", name: "ช่างพัฒน์ โครงหลังคาเหล็ก", segment: "SME Contractor", province: "นนทบุรี", last_order: "32,000 บาท", last_contact: "2026-05-19", status: "ติดตามด่วน" },
  { code: "CUST-803", name: "คุณพรเพ็ญ บ้านสวยทิวลิป", segment: "Retail Walk-In", province: "ปทุมธานี", last_order: "8,500 บาท", last_contact: "2026-05-10", status: "ปกติ" },
  { code: "CUST-804", name: "บจก. เจริญโภคภัณฑ์วิศวกรรม", segment: "Platinum Tier", province: "ชลบุรี", last_order: "1,200,000 บาท", last_contact: "2026-05-15", status: "ปกติ" },
  { code: "CUST-805", name: "รับเหมาครบวงจร ช่างณรงค์", segment: "VIP Builder", province: "สมุทรปราการ", last_order: "95,000 บาท", last_contact: "2026-05-20", status: "ปกติ" },
  { code: "CUST-806", name: "บจก. เอสเตท พร็อพเพอร์ตี้", segment: "VIP Builder", province: "สมุทรสาคร", last_order: "420,000 บาท", last_contact: "2026-05-14", status: "ติดตามด่วน" }
];

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

export default function Home() {
  // ==========================================================================
  // REACT STATES
  // ==========================================================================
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState({ name: "สมชาย ใจดี", role: "role_a", status: "online" });
  const [activeTab, setActiveTab] = useState("home");
  const [serverConnected, setServerConnected] = useState(false);
  const [serverMode, setServerMode] = useState("Mock In-Memory");
  
  const [permissions, setPermissions] = useState(LOCAL_STATE_PERMISSIONS);
  const [opportunities, setOpportunities] = useState(LOCAL_STATE_OPPORTUNITIES);
  const [agents, setAgents] = useState(LOCAL_STATE_AGENTS);
  const [notifications, setNotifications] = useState([]);
  const [customers, setCustomers] = useState(LOCAL_STATE_CUSTOMERS);
  
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
    setUser(prev => ({ ...prev, status: newStatus }));
    
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
    if (newStatus === "break") label = "พักเบรก (Break)";
    else if (newStatus === "lunch") label = "พักเที่ยง (Lunch)";
    else if (newStatus === "offline") label = "ออฟไลน์ (Offline)";
    
    showToast("ปรับปรุงสถานะของคุณ", `แก้ไขสถานะแอปเป็น: ${label}`, "info");
    fetchAgents();
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
    link.setAttribute("download", `STK_Report_Sales_${new Date().toISOString().slice(0, 10)}.csv`);
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

  const allowedMenus = permissions[user.role] || LOCAL_STATE_PERMISSIONS[user.role] || [];

  return (
    <div id="app-root">
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

      {/* Sidebar Navigation */}
      <aside id="sidebar" className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-icon"><i className="fa-solid fa-chart-line"></i></span>
            <span className="logo-text">STK <span className="logo-sub">System</span></span>
          </div>
          <button id="sidebar-toggle" className="sidebar-toggle-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <i className={`fa-solid ${sidebarCollapsed ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
          </button>
        </div>
        
        <nav className="sidebar-menu">
          <ul id="menu-list">
            {allowedMenus.map(menuKey => {
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
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="version-info">
            <div className="ver-label">salestracking_web</div>
            <div className="ver-num">v1.0.1 (Build 471)</div>
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
              <span className={`status-indicator-dot ${user.status}`}></span>
              <select id="agent-status-select" className="status-select" value={user.status} onChange={(e) => handleStatusChange(e.target.value)}>
                <option value="online">ว่าง (Available)</option>
                <option value="break">พักเบรก (Break)</option>
                <option value="lunch">พักทานข้าว (Lunch)</option>
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

          {/* VIEW: ADMIN ROLE PERMISSIONS */}
          {activeTab === "management" && (
            <div className="view-container management-container">
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

        </section>
      </main>

      {/* Simulated Azure AD B2C Login Overlay */}
      {showLogin && (
        <div id="login-overlay" className="login-overlay active">
          <div className="login-card-container">
            <div className="login-brand">
              <i className="fa-solid fa-chart-line brand-logo-icon"></i>
              <h2>Sales Tracking System (STK)</h2>
              <p>Thai Watsadu - โครงข่ายบันทึกยอดขายและการติดตามลูกค้า</p>
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
