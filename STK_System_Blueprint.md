# STK System — Reverse Engineering Blueprint

> **Sales Tracking System** · stk.thaiwatsadu.com · Version 1.0.1 · Build 471 · Analysed May 2026

---

## 1. System Overview

| Property | Value |
|---|---|
| Application Name | salestracking_web |
| System Title | Sales Tracking System (STK) |
| Production URL | https://stk.thaiwatsadu.com |
| Version | 1.0.1 |
| Build Number | 471 |
| Last Build Date | 2026-05-10 |
| Flutter Engine | `82bd5b7209295a5b7ff8cae0df96e7870171e3a5` |
| Compile Target | dart2js (HTML renderer) |
| Languages | Thai (th), English (en) |

STK is an internal sales tracking platform for Thai Watsadu group. It manages sales agent activity, customer opportunities, call tracking, segment analytics, real-time agent monitoring, and management reporting.

---

## 2. Technology Stack

### 2.1 Frontend

| Layer | Technology | Details |
|---|---|---|
| Framework | **Flutter Web (Dart)** | Compiled to JavaScript via dart2js |
| Renderer | HTML Renderer | DOM-based — not CanvasKit/WebGL |
| State Management | GetX + Provider | Dual: GetX for controllers, Provider for widget tree |
| HTTP Client | Dio + http | Dio as primary; http as fallback |
| Routing | GetX Router | Hash-based SPA (`#/page`) |
| Localisation | intl package | Thai locale built-in |

### 2.2 Backend Environments

| Environment | Base URL |
|---|---|
| Production | `https://stk-api.thaiwatsadu.com/api/v1` |
| UAT / Staging | `https://uat-stk-api.thaiwatsadu.com/api/v1` |
| Local Dev | `http://127.0.0.1:3000/api/v1` |

### 2.3 Authentication

| Aspect | Detail |
|---|---|
| Provider | Microsoft Azure AD (B2C) |
| Token Type | Bearer JWT |
| Request Header | `Authorization: Bearer <token>` |
| Login Endpoint | `POST /api/v1/user/auth` |
| Logout Endpoint | `POST /api/v1/user/logout` |
| Session Duration | ~50 minutes |

---

## 3. Flutter Package Dependencies

Confirmed present in production bundle (`main.dart.js`):

| Package | Purpose |
|---|---|
| `get` (GetX) | State management, routing, dependency injection |
| `provider` | Widget-tree state management |
| `dio` | Primary HTTP client — supports interceptors for auth headers |
| `http` | Secondary HTTP client |
| `syncfusion_flutter_datagrid` | Advanced data grid (Monitor & Management pages) |
| `google_maps_flutter` | Map integration — agent/store location display |
| `googlemaps/markerclusterer` | Map marker clustering (CDN) |
| `wakelock_plus` | Prevents screen sleep on monitoring dashboards |
| `font_awesome_flutter` | FontAwesome icons — brands, regular, solid |
| `cupertino_icons` | iOS-style icon set |
| `intl` | Date/number formatting, Thai locale |

### Recommended `pubspec.yaml`

```yaml
dependencies:
  flutter:
    sdk: flutter
  get: ^4.6.6
  provider: ^6.1.2
  dio: ^5.4.0
  google_maps_flutter: ^2.6.0
  syncfusion_flutter_datagrid: ^24.1.41   # commercial licence required
  wakelock_plus: ^1.2.5
  font_awesome_flutter: ^10.7.0
  cupertino_icons: ^1.0.6
  intl: ^0.19.0
```

---

## 4. Frontend Routes

| Route | Page | Access | Description |
|---|---|---|---|
| `/login` | Login | All | Microsoft SSO entry point |
| `/home` | Home / KPI | All roles | KPI cards: calls, opportunities, sales totals |
| `/opportunity` | Opportunity List | Manager + Agent | Sales opportunity pipeline |
| `/call` | Opportunity Call | Agent (Role B) only | Call follow-up per opportunity |
| `/segment` | Customer Segment | Agent (Role B) only | Customer grouping & segment analysis |
| `/monitor` | Agent Monitor | Manager + Viewer | Real-time agent online status |
| `/dashboard` | Dashboard | Manager roles | Multi-tab performance charts |
| `/report` | Reports | Manager roles | Exportable cross-dimension reports |
| `/management` | Management | Admin only | Permissions & system configuration |

---

## 5. API Endpoint Catalogue

All endpoints are relative to: `https://stk-api.thaiwatsadu.com/api/v1`

### 5.1 Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/user/auth` | Authenticate via Microsoft Azure token |
| POST | `/user/logout` | Invalidate session |

### 5.2 Agent / User

| Method | Endpoint | Description |
|---|---|---|
| GET | `/agent/getMenuPermission` | Menu items visible to this user's role |
| GET | `/agent/getOnline` | Check if current agent is online |
| GET | `/agent/getStatus` | Current status: available / break / lunch / offline |
| GET | `/agent/getAgentByTeam` | All agents in the user's team |
| GET | `/agent/getMonitorOnline` | All agents currently online (Monitor page) |
| GET | `/agent/updateStatusByUser` | Update agent availability status |
| GET | `/agent/checkFollowUp` | Check for pending follow-ups |
| GET | `/agent/getFollowup` | List of follow-up tasks |
| GET | `/agent/getTotalFollowup` | Count of total follow-up tasks |
| GET | `/agent/saveFollowUp` | Save a new follow-up record |
| GET | `/agent/unFollowUp` | Remove a follow-up |
| GET | `/agent/checkLunch` | Check if agent is on lunch break |
| GET | `/agent/saveBreak` | Record a break start |
| GET | `/agent/getRemainBreak` | Remaining break time |
| GET | `/agent/getTotalRoomNotClose` | Count of open chat rooms for agent |
| GET | `/agent/chats/over-pending` | Chats exceeding pending time limit |
| GET | `/agent/bookmark/all` | All bookmarked customers |
| GET | `/agent/bookmark/check` | Check if a customer is bookmarked |
| GET | `/agent/bookmark/count` | Total bookmark count |
| GET | `/agentPermission` | Permission set for current agent |
| GET | `/agents_skills_master2` | Master list of agent skill categories |
| GET | `/ae_plan` | AE (Account Executive) planning data |

### 5.3 Opportunity & Sales

| Method | Endpoint | Description |
|---|---|---|
| GET | `/opportunity` | Opportunity detail |
| GET | `/opportunity_list` | Paginated list of all opportunities |
| GET | `/sale/total_amount` | Total sales amount for current period |
| GET | `/sale/chg_today_chat_channel` | Today's chat channel performance change |

### 5.4 Call Tracking

| Method | Endpoint | Description |
|---|---|---|
| GET | `/call` | Single call detail |
| GET | `/call_list` | List of calls for agent |

### 5.5 Customer

| Method | Endpoint | Description |
|---|---|---|
| GET | `/customer` | Customer detail |
| GET | `/customerWatchList` | Watchlist of flagged customers |
| GET | `/customer_new` | Customer base (new schema) |
| GET | `/customer_new/customer_info/` | Customer profile information |
| GET | `/customer_new/jobs/` | Customer job/project records |
| GET | `/customer_new/payments/` | Customer payment history |
| GET | `/customer_new/sites/` | Customer site locations |
| GET | `/segment` | Customer segment definitions |

### 5.6 Case / After-Service

| Method | Endpoint | Description |
|---|---|---|
| GET | `/case` | Single case detail |
| GET | `/case_list` | List of all cases |
| GET | `/afterservice` | After-service records |
| GET | `/afterservice/comment` | Comments on after-service cases |
| GET | `/caseAssignedStatus` | Cases grouped by assigned status |
| GET | `/caseAverageResponse` | Average response time for cases |
| GET | `/caseGoogleReview` | Google review data linked to cases |
| GET | `/caseSummary` | Summary KPIs for case management |
| GET | `/case-avg-kpi/export` | Export case average KPI data |

### 5.7 Chat / Messaging

| Method | Endpoint | Description |
|---|---|---|
| GET | `/chat/` | Chat room list |
| GET | `/chat/all_chat_avg_first_response` | Average first response time (all chats) |
| GET | `/chat/all_chat_detail_by_date` | Chat detail breakdown by date |
| GET | `/chat/chat_shop_avg_first_response` | Shop-specific first response average |
| GET | `/chat/this_month_total_chat_success` | This month's successful chat count |
| GET | `/chat/this_year_total_chat_success` | This year's successful chat count |
| GET | `/chat/today_all_chat_detail` | Today's chat detail summary |
| GET | `/chat/today_all_chat_skill` | Today's chat by skill category |
| GET | `/chatHistory` | Conversation history for a chat room |
| GET | `/chatMessage` | Messages in a chat room |
| GET | `/chatMessageOppCall` | Chat messages linked to opportunity/call |
| GET | `/chat_detail` | Single chat room detail |
| POST | `/chats-new` | Create a new chat room |
| POST | `/chats-save` | Save chat state |
| POST | `/chats-upload` | Upload file attachment to chat |
| POST | `/chats-message-auto-close` | Auto-close stale chat messages |
| GET | `/chats/history/` | Chat room history (alt endpoint) |
| GET | `/chats/pin/` | Pinned chats |

### 5.8 Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Main dashboard summary |
| GET | `/dashboard/accumulate_performance` | Cumulative performance metrics |
| GET | `/dashboard/accumulate_performance_call` | Cumulative call performance |
| GET | `/dashboard/call_shop_monitoring` | Call monitoring by shop |
| GET | `/dashboard/case_monitor` | Case monitoring data |
| GET | `/dashboard/case_monitor/v2` | Case monitoring (v2 schema) |
| GET | `/dashboard/chat` | Chat performance dashboard |
| GET | `/dashboard/chat_shop_monitoring` | Chat monitoring by shop |
| GET | `/dashboard/cs_complain_monitoring` | CS complaint monitoring |
| GET | `/dashboard/daily_monitor` | Daily monitoring metrics |
| GET | `/dashboard/daily_monitor_call` | Daily call monitoring |
| GET | `/dashboard/daily_monthly_performance` | Daily vs monthly performance |
| GET | `/dashboard/daily_monthly_performance_call` | Call performance daily vs monthly |
| GET | `/dashboard/daily_sale` | Daily sales figures |
| GET | `/dashboard/google_review` | Google review scores |
| GET | `/dashboard/google_review2` | Google review scores (v2) |
| GET | `/dashboard/non_voice` | Non-voice channel performance |

### 5.9 Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/report/assignedment_status` | Cases by assignment status |
| GET | `/report/case_average_response` | Average case response time |
| GET | `/report/case_average_response_complain` | Average response time for complaints |
| GET | `/report/case_google_review` | Google review report |
| GET | `/report/case_summary` | Summary report for all cases |
| GET | `/report/chat_message_by_assign_date_range` | Chat messages in date range |
| GET | `/report/customer_by_owner` | Customers grouped by sales owner |
| GET | `/report/daily_close_won_percentage_by_user` | Daily close/won % per agent |
| GET | `/report/opp_call_by_assign_date_range` | Opportunity calls in date range |
| GET | `/report/sale_by_owner` | Sales totals by owner |
| GET | `/report/survey_by_bu` | Survey results by business unit |
| GET | `/report/survey_by_user_each_of_month` | Monthly survey per user |
| GET | `/report/won_booking` | Won booking report |

### 5.10 Store & Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/store` | Single store detail |
| GET | `/stores` | List of all stores |
| GET | `/management` | Management overview |
| GET | `/management/permission` | Permission configuration listing |

---

## 6. Asset Structure

| Asset Path | Description |
|---|---|
| `assets/images/brand/twd_logo.png` | Thai Watsadu main brand logo |
| `assets/images/brand/bnb_logo.jpg` | BnB (subsidiary) brand logo |
| `assets/images/brand/auto1_logo.jpg` | Auto1 (subsidiary) brand logo |
| `assets/images/bg_login.jpg` | Original login background |
| `assets/images/bg_login_new.jpg` | Updated login background |
| `assets/images/pin/pin-1.png … pin-20.png` | Map pins for agent/store (20 colour variants) |
| `assets/images/badge_status_grey.png` | Offline / inactive agent badge |
| `assets/images/badge_status_yellow.png` | Away / break agent badge |
| `assets/images/30-mins.png` | 30-minute break indicator |
| `assets/images/60-mins.png` | 60-minute break indicator |
| `assets/images/avatar/email.png` | Email contact avatar placeholder |
| `assets/images/avatar/support.png` | Support avatar placeholder |
| `assets/images/dashboard_column.png` | Column chart illustration |
| `assets/images/dashboard_pie.png` | Pie chart illustration |
| `assets/images/management.png` | Management section illustration |
| `assets/images/no_image.jpg` | Fallback (no photo) |
| `assets/images/icon-th-flag.png` | Thai language selector flag |
| `assets/images/icon-uk-flag.png` | English language selector flag |

---

## 7. User Role Matrix

| Page / Feature | Role A (Manager) | Role B (Agent) | Role C (Viewer) | Admin |
|---|:---:|:---:|:---:|:---:|
| Home / KPI | ✓ | ✓ | ✓ | ✓ |
| Opportunity List | ✓ | ✓ | — | ✓ |
| Opportunity Call | — | ✓ | — | ✓ |
| Customer Segment | — | ✓ | — | ✓ |
| Monitor | ✓ | — | ✓ | ✓ |
| Dashboard | ✓ | — | ✓ | ✓ |
| Reports | ✓ | — | ✓ | ✓ |
| Management | — | — | — | ✓ |

---

## 8. Clone Guide

### 8.1 Recommended Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Flutter Web (Dart) | Exact match — maximises code reuse |
| State Management | GetX | Already used; routing + DI + state in one package |
| HTTP | Dio | Already used; interceptors for Bearer token injection |
| Backend | Node.js/Express or .NET Core | REST API compatible with `/api/v1` pattern |
| Database | PostgreSQL or SQL Server | Relational schema per domain entity |
| Auth | Azure AD B2C + MSAL | Matches existing Microsoft SSO flow |
| Maps | Google Maps Flutter | Already integrated; needs Maps API key |
| Data Grid | Syncfusion Flutter DataGrid | Used for Monitor/Management (commercial licence) |
| Real-time | WebSocket or SignalR | Agent status currently polled — push would improve UX |
| File Storage | Azure Blob or AWS S3 | For chat file uploads (`/chats-upload`) |
| Email | SendGrid or similar | `/api/v1/email_form` endpoint confirmed in bundle |

### 8.2 Authentication Flow

1. User clicks **เข้าใช้งานระบบ** (Login)
2. Frontend redirects to Microsoft Azure AD login page
3. Azure returns ID token on successful authentication
4. Frontend POSTs token to `/api/v1/user/auth`
5. Backend validates with Azure; returns app-level JWT
6. Frontend stores JWT; attaches to every request:
   ```
   Authorization: Bearer <token>
   ```
7. Frontend fetches `/agent/getMenuPermission` → builds role-based menu
8. Route to `/home`

### 8.3 Estimated Build Effort

| Component | Estimate |
|---|---|
| Flutter Web frontend (8 pages) | 3–4 months (2 frontend devs) |
| REST API backend | 2–3 months (1–2 backend devs) |
| Azure AD integration | 1–2 weeks |
| Google Maps + agent tracking | 1–2 weeks |
| Syncfusion DataGrid integration | 1 week |
| Reports & export | 2–3 weeks |
| Testing & QA | 4–6 weeks |
| **Total** | **6–9 months (team of 3–4)** |

---

## 9. Analysis Gaps

### 9.1 High-Confidence Findings
- Flutter Web + dart2js HTML renderer — confirmed via `flutter_bootstrap.js`
- Production API at `stk-api.thaiwatsadu.com` — confirmed from bundle string literals
- Microsoft Azure AD authentication — confirmed by Azure/B2C references
- GetX + Provider dual state management — confirmed by class presence in bundle
- Dio as primary HTTP client — confirmed
- Syncfusion DataGrid — confirmed by font asset files
- Google Maps integration — confirmed by Maps API script loading
- All 8 frontend routes — confirmed from route string analysis
- 50+ API endpoints catalogued — extracted directly from compiled bundle

### 9.2 Unknowns (requires backend access)

| Unknown | What's Needed | Best Guess |
|---|---|---|
| POST/PUT/DELETE write endpoints | Backend source or API docs | REST CRUD conventions (e.g. `POST /opportunity`, `PUT /opportunity/:id`) |
| Database schema | Backend DB access | Relational with one table per domain entity |
| Real-time mechanism | Authenticated network trace | HTTP polling — WebSocket possible for agent status |
| JWT payload fields | Authenticated session capture | Contains `user_id`, `role`, `team_id`, `permissions[]` |
| Auto-assignment rules | Backend source | Round-robin or skill-based chat assignment |
| External channel integrations | Backend config | Line OA, Facebook Messenger, Google Reviews API |

---

*Blueprint generated by reverse engineering — stk.thaiwatsadu.com — May 2026*
