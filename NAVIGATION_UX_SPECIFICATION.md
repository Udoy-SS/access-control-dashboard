# BANKING PHYSICAL SECURITY PLATFORM
## Navigation & Sidebar UX Specification — FINAL LOCKED v2

Document Type : Navigation & Sidebar Interaction Design Specification
Audience      : Frontend Engineers, QA Testers, Product Owners, UX Designers
Status        : FINAL LOCKED — hierarchy, labels, and order are immutable
Date          : 2026-09-20

CRITICAL RULE: The sidebar hierarchy, all parent menu labels, and all submenu labels
are permanently locked. No renaming, reordering, adding, removing, or merging of
navigation items is permitted. Only behavioral, visual styling, routing, and permission
visibility attributes may be configured.

===============================================================================
SECTION 0 — LOCKED SIDEBAR HIERARCHY (Authoritative Reference)
===============================================================================

Dashboard

├── Executive Dashboard
│   ├── Bank Overview
│   ├── Attendance KPI
│   ├── Security KPI
│   ├── Branch Comparison
│   └── Critical Alerts

├── Security Operations
│   ├── Live Access Events
│   ├── Who Is Inside (Live Roll Call)
│   ├── Security Incidents
│   ├── Alarm Management
│   ├── Access Denied Report
│   ├── Restricted Area Access
│   ├── Anti-passback & Tailgating
│   ├── Employee Movement History
│   └── Branch Security Scorecard

├── Attendance Analytics
│   ├── Daily Attendance
│   ├── Employee Attendance Report
│   ├── Monthly Attendance Summary
│   ├── Attendance Exceptions
│   ├── Late Arrival Analysis
│   ├── Early Departure
│   ├── Overtime Report
│   ├── Shift Management
│   └── Leave vs Attendance

├── Access Control
│   ├── Door Management              [Nested Group]
│   │   ├── Door List
│   │   ├── Door Configuration
│   │   ├── Door Status
│   │   ├── Lock / Unlock Control
│   │   ├── Door Schedule
│   │   ├── Door Access Rules
│   │   ├── Door Event History
│   │   └── Emergency Door Control
│   ├── Access Group
│   ├── Access Level
│   ├── Employee Credential
│   ├── Privileged/VIP Access
│   └── Access History

├── Device & System Health
│   ├── Controller Status
│   ├── Reader Status
│   ├── Door Health Monitoring
│   ├── Server Health
│   ├── Database Health
│   ├── Network Status
│   ├── Active Devices
│   ├── Inactive Devices
│   ├── Backup Status
│   └── License Status

├── Audit & Compliance
│   ├── Access Audit
│   ├── Attendance Correction
│   ├── Administrative Activity
│   ├── Audit Trail & Logs
│   ├── Compliance Reports
│   └── Board & Executive MIS Report

├── Reporting Center
│   ├── Security Reports
│   ├── Attendance Reports
│   ├── Access Reports
│   ├── Device Reports
│   ├── Custom Report Builder
│   ├── Scheduled Reports
│   └── Export Center

├── Organization
│   ├── Bank
│   ├── Head Office
│   ├── Region Office
│   ├── Branch
│   └── Sub Branch

└── User Management
    ├── Users
    ├── Roles
    ├── Permissions
    └── Login Audit


===============================================================================
SECTION 1 — SIDEBAR UX SPECIFICATION
===============================================================================

-------------------------------------------------------------------------------
1.1  PHYSICAL DIMENSIONS
-------------------------------------------------------------------------------

Property                    Value               Notes
---------------------------------------------------------------------------
Sidebar Width (Expanded)    240px fixed         Hard fixed column, never fluid
Sidebar Width (Collapsed)   0px                 Full off-canvas, no icon rail
Sidebar Position            fixed; left 0       Full-height persistent panel
Z-Index                     200                 Above content, below modals
Brand Header Height         56px                Product name + bank name strip
Customer Strip Height       36px                Active deployment entity label
Nav Item Height (Parent)    38px                Touch/click target minimum
Nav Item Height (Child)     32px                Nested submenu row height
Nav Item Height (Sub-Child) 28px                3rd-level (Door Management)
Child Left Indent           24px padding-left   1st level children
Sub-Child Left Indent       40px padding-left   2nd level children (doors)
Scrollbar Width             3px thumb           Thin overlay; visible on scroll

-------------------------------------------------------------------------------
1.2  EXPANDED STATE (Default — Desktop)
-------------------------------------------------------------------------------

- Sidebar occupies full 240px column at all times on desktop (min-width: 1025px).
- "Dashboard" at the top is a STATIC SECTION LABEL only.
  It is NOT a clickable link. It has no hover effect. It has no navigation action.
  Styling: font-size 10px; text-transform uppercase; letter-spacing 0.10em;
           color rgba(255,255,255,0.35); padding 14px 16px 4px; pointer-events none.
- All expandable parent groups show a right-aligned Chevron (inline SVG, 12x12px).
- The Chevron rotates 90 degrees clockwise when the group is expanded.
- No collapse-to-icon-rail behavior exists. Desktop always shows full text sidebar.

-------------------------------------------------------------------------------
1.3  COLLAPSED STATE (Mobile / Tablet Overlay)
-------------------------------------------------------------------------------

- Breakpoint: max-width 1024px.
- Default state on mobile: sidebar is hidden via transform translateX(-240px).
- A dark backdrop scrim rgba(9, 30, 66, 0.72) covers the main content when open.
- Sidebar opens via a Hamburger button (top-left of mobile header bar).
- Sidebar closes when:
    a) User taps the backdrop scrim
    b) User taps the close button (top-right inside sidebar)
    c) User navigates to any page (leaf or child)
- Open/close animation: transform translateX(0) / translateX(-240px);
  duration 250ms; easing cubic-bezier(0.4, 0, 0.2, 1).
- Left-edge swipe gesture (starting from 0-20px from screen left) opens sidebar.
- Right swipe on an open sidebar closes it.
- When sidebar is open, keyboard focus is trapped inside the sidebar panel (a11y).

-------------------------------------------------------------------------------
1.4  SCROLLING BEHAVIOR
-------------------------------------------------------------------------------

- The sidebar nav region scrolls independently of the main content area.
- overflow-y auto applied to the <nav> element only.
- Brand Header (56px) is position sticky; top 0 — does NOT scroll out of view.
- Customer Strip (36px) is position sticky; top 56px — does NOT scroll out of view.
- Sidebar Footer (version info) is position sticky; bottom 0 — does NOT scroll.
- Scrollbar styling: scrollbar-width thin; scrollbar-color rgba(255,255,255,0.15) transparent.
  The scrollbar is an overlay — no layout space is consumed.
- Auto-Scroll on Navigate: When the active child item is outside the visible scroll
  area, the sidebar auto-scrolls to bring it into view.
  Use: element.scrollIntoView({ behavior: smooth, block: nearest })

-------------------------------------------------------------------------------
1.5  ACTIVE ITEM BEHAVIOR
-------------------------------------------------------------------------------

Active Parent Group (contains the currently rendered page):
  background-color : transparent
  border-left      : 3px solid #0052CC
  color            : #FFFFFF
  chevron          : rotated 90deg, opacity 1.0

Active Leaf Node (Executive Dashboard — direct page, no children):
  background-color : rgba(0, 82, 204, 0.18)
  border-left      : 3px solid #0052CC
  color            : #FFFFFF

Active Child Item (the currently rendered sub-page):
  background-color : rgba(0, 82, 204, 0.22)
  border-left      : none
  padding-left     : 24px
  color            : #60a5fa   (Sky blue — primary active indicator)
  font-weight      : 600

Active Sub-Child Item (Door Management children — 3rd level):
  background-color : rgba(0, 82, 204, 0.15)
  padding-left     : 40px
  color            : #93c5fd
  font-weight      : 600

Rule: Active state always overrides hover state. No hover effect on active rows.

-------------------------------------------------------------------------------
1.6  HOVER BEHAVIOR
-------------------------------------------------------------------------------

Parent Group / Leaf Node hover:
  background-color : rgba(255, 255, 255, 0.06)
  color            : #FFFFFF
  cursor           : pointer
  transition       : background-color 120ms ease-in-out

Child Item hover:
  background-color : rgba(255, 255, 255, 0.05)
  color            : rgba(255, 255, 255, 0.90)
  cursor           : pointer
  transition       : background-color 120ms ease-in-out

Sub-Child Item hover:
  background-color : rgba(255, 255, 255, 0.04)
  color            : rgba(255, 255, 255, 0.85)
  cursor           : pointer

-------------------------------------------------------------------------------
1.7  SELECTED PAGE INDICATION (Visual Hierarchy)
-------------------------------------------------------------------------------

The currently active page is communicated through a 4-layer visual system:

Layer 1 — Left Accent Bar:
  A 3px solid #0052CC left border is applied to the PARENT GROUP row of the
  active page. This is NOT applied to the child row itself — the parent bar
  signals which group the active page belongs to.

Layer 2 — Child Row Background Wash:
  The active child row receives background rgba(0, 82, 204, 0.22) — a visible
  cobalt wash that frames the selected row.

Layer 3 — Child Label Color Shift:
  The active child label color changes from rgba(255,255,255,0.60) (default) to
  #60a5fa (sky blue). This is the PRIMARY active signal — the most distinctive
  change and the first thing the eye finds.

Layer 4 — Chevron Rotation:
  The parent group chevron rotates 90 degrees (pointing down) whenever its group
  contains the active page, regardless of whether the group was manually opened
  or auto-opened on navigation.

-------------------------------------------------------------------------------
1.8  MOBILE RESPONSIVE BEHAVIOR
-------------------------------------------------------------------------------

Breakpoint         : max-width 1024px
Sidebar default    : hidden (translateX(-240px))
Open trigger       : Hamburger icon in mobile header
Close trigger      : Backdrop tap / close button / page navigation
Backdrop           : rgba(9, 30, 66, 0.72); covers full content area
Animation          : 250ms cubic-bezier(0.4, 0, 0.2, 1)
Sidebar width      : 240px (no shrinking on mobile)
Swipe open         : Left edge swipe from 0-20px
Swipe close        : Right swipe on open sidebar
Auto-close         : Navigating to any page auto-closes sidebar
Focus trap         : Tab key trapped within sidebar while open (WCAG 2.1)


===============================================================================
SECTION 2 — NAVIGATION SPECIFICATION
===============================================================================

-------------------------------------------------------------------------------
2.1  EXPANDABLE PARENT MENUS vs DIRECT PAGES
-------------------------------------------------------------------------------

Menu Label              Type                    Behavior on Click
---------------------------------------------------------------------------
Dashboard               Static Section Label    No click. No hover. Label only.
Executive Dashboard     Expandable Group        Expands; auto-navigates to first child
Security Operations     Expandable Group        Expands; auto-navigates to first child
Attendance Analytics    Expandable Group        Expands; auto-navigates to first child
Access Control          Expandable Group        Expands; auto-navigates to first child
Device & System Health  Expandable Group        Expands; auto-navigates to first child
Audit & Compliance      Expandable Group        Expands; auto-navigates to first child
Reporting Center        Expandable Group        Expands; auto-navigates to first child
Organization            Expandable Group        Expands; auto-navigates to first child
User Management         Expandable Group        Expands; auto-navigates to first child

NOTE: All 9 navigation modules (excluding the "Dashboard" section label) are
EXPANDABLE GROUPS with child pages. There are no leaf-node parent menus
in this updated hierarchy. Every parent expands to show its children.

Special nested group — "Door Management" inside Access Control:
  Door Management is a NESTED EXPANDABLE GROUP at the child level.
  It has its own Chevron and expand/collapse state independent of Access Control.
  Clicking Door Management expands it to show its 8 sub-items.
  It does NOT auto-navigate on expand — it only reveals sub-items.

-------------------------------------------------------------------------------
2.2  EXPANSION RULES
-------------------------------------------------------------------------------

Rule 1 — Single Group Open Policy:
  Only ONE parent group is expanded at a time.
  Opening a new parent group collapses the previously open group.
  Exception: The group containing the ACTIVE page always stays expanded and
  CANNOT be force-collapsed by clicking another group.

Rule 2 — First-Child Auto-Navigate:
  Clicking an unexpanded parent group BOTH expands it AND navigates to the
  first child item. The content area changes simultaneously.

Rule 3 — Toggle-Only Collapse:
  Clicking an ALREADY EXPANDED parent group collapses it without navigating
  away from the currently active page inside that group.

Rule 4 — Door Management Nested Group:
  Clicking "Door Management" inside Access Control expands/collapses its
  8 sub-items independently. It does NOT trigger auto-navigate to its first child.
  Clicking a Door Management sub-item navigates directly to that page.

Rule 5 — Intra-Module Navigation:
  Navigating between child items within the same open group does NOT collapse
  or re-expand the parent. Only the active highlight moves within the group.

Rule 6 — Entry Point Routing by Role:
  Default landing (all roles): /executive-dashboard/bank-overview
  Exception — SOC_OFFICER    : /security/live-access-events
  Exception — HR_OFFICER     : /attendance/daily

-------------------------------------------------------------------------------
2.3  BREADCRUMB FORMAT
-------------------------------------------------------------------------------

Breadcrumbs appear on every page in the top-bar sub-header, one line below the
page title. Separator character: > (greater-than sign). Read-only, not clickable.

Styling:
  Root crumb    : color rgba(255,255,255,0.45); font-size 11px; font-weight 400
  Middle crumbs : color rgba(255,255,255,0.60); font-size 11px; font-weight 400
  Current page  : color rgba(255,255,255,0.85); font-size 11px; font-weight 600
  Separator     : color rgba(255,255,255,0.25); margin 0 6px

Examples (showing exact menu label names — do not alter):

  Dashboard > Executive Dashboard > Bank Overview
  Dashboard > Executive Dashboard > Attendance KPI
  Dashboard > Executive Dashboard > Security KPI
  Dashboard > Executive Dashboard > Branch Comparison
  Dashboard > Executive Dashboard > Critical Alerts

  Dashboard > Security Operations > Live Access Events
  Dashboard > Security Operations > Who Is Inside (Live Roll Call)
  Dashboard > Security Operations > Security Incidents
  Dashboard > Security Operations > Alarm Management
  Dashboard > Security Operations > Access Denied Report
  Dashboard > Security Operations > Restricted Area Access
  Dashboard > Security Operations > Anti-passback & Tailgating
  Dashboard > Security Operations > Employee Movement History
  Dashboard > Security Operations > Branch Security Scorecard

  Dashboard > Attendance Analytics > Daily Attendance
  Dashboard > Attendance Analytics > Employee Attendance Report
  Dashboard > Attendance Analytics > Monthly Attendance Summary
  Dashboard > Attendance Analytics > Attendance Exceptions
  Dashboard > Attendance Analytics > Late Arrival Analysis
  Dashboard > Attendance Analytics > Early Departure
  Dashboard > Attendance Analytics > Overtime Report
  Dashboard > Attendance Analytics > Shift Management
  Dashboard > Attendance Analytics > Leave vs Attendance

  Dashboard > Access Control > Door Management > Door List
  Dashboard > Access Control > Door Management > Door Configuration
  Dashboard > Access Control > Door Management > Door Status
  Dashboard > Access Control > Door Management > Lock / Unlock Control
  Dashboard > Access Control > Door Management > Door Schedule
  Dashboard > Access Control > Door Management > Door Access Rules
  Dashboard > Access Control > Door Management > Door Event History
  Dashboard > Access Control > Door Management > Emergency Door Control
  Dashboard > Access Control > Access Group
  Dashboard > Access Control > Access Level
  Dashboard > Access Control > Employee Credential
  Dashboard > Access Control > Privileged/VIP Access
  Dashboard > Access Control > Access History

  Dashboard > Device & System Health > Controller Status
  Dashboard > Device & System Health > Reader Status
  Dashboard > Device & System Health > Door Health Monitoring
  Dashboard > Device & System Health > Server Health
  Dashboard > Device & System Health > Database Health
  Dashboard > Device & System Health > Network Status
  Dashboard > Device & System Health > Active Devices
  Dashboard > Device & System Health > Inactive Devices
  Dashboard > Device & System Health > Backup Status
  Dashboard > Device & System Health > License Status

  Dashboard > Audit & Compliance > Access Audit
  Dashboard > Audit & Compliance > Attendance Correction
  Dashboard > Audit & Compliance > Administrative Activity
  Dashboard > Audit & Compliance > Audit Trail & Logs
  Dashboard > Audit & Compliance > Compliance Reports
  Dashboard > Audit & Compliance > Board & Executive MIS Report

  Dashboard > Reporting Center > Security Reports
  Dashboard > Reporting Center > Attendance Reports
  Dashboard > Reporting Center > Access Reports
  Dashboard > Reporting Center > Device Reports
  Dashboard > Reporting Center > Custom Report Builder
  Dashboard > Reporting Center > Scheduled Reports
  Dashboard > Reporting Center > Export Center

  Dashboard > Organization > Bank
  Dashboard > Organization > Head Office
  Dashboard > Organization > Region Office
  Dashboard > Organization > Branch
  Dashboard > Organization > Sub Branch

  Dashboard > User Management > Users
  Dashboard > User Management > Roles
  Dashboard > User Management > Permissions
  Dashboard > User Management > Login Audit


===============================================================================
SECTION 3 — ROLE VISIBILITY MATRIX
===============================================================================

The sidebar renders ONLY items the logged-in role is permitted to see.
Hidden items are removed from the DOM entirely — not greyed out, not locked.

Key: Y = Visible | N = Hidden | P = Partial (specific children listed below)
Roles: CEO | SOC | HR | BM (Branch Mgr) | IT | AUD (Auditor)

MENU ITEM                              CEO  SOC  HR   BM   IT   AUD
---------------------------------------------------------------------------
Executive Dashboard (group)            Y    Y    N    Y    Y    Y
  Bank Overview                        Y    Y    N    Y    Y    Y
  Attendance KPI                       Y    N    N    Y    N    Y
  Security KPI                         Y    Y    N    Y    N    Y
  Branch Comparison                    Y    Y    N    Y    N    Y
  Critical Alerts                      Y    Y    N    Y    Y    Y
---------------------------------------------------------------------------
Security Operations (group)            N    Y    N    P    P    P
  Live Access Events                   N    Y    N    N    Y    Y
  Who Is Inside (Live Roll Call)       N    Y    N    Y    N    N
  Security Incidents                   N    Y    N    N    N    N
  Alarm Management                     N    Y    N    N    N    N
  Access Denied Report                 N    Y    N    N    Y    Y
  Restricted Area Access               N    Y    N    N    N    Y
  Anti-passback & Tailgating           N    Y    N    N    N    N
  Employee Movement History            N    Y    N    N    N    Y
  Branch Security Scorecard            N    Y    N    Y    N    Y
---------------------------------------------------------------------------
Attendance Analytics (group)           N    N    Y    P    N    P
  Daily Attendance                     N    N    Y    Y    N    Y
  Employee Attendance Report           N    N    Y    Y    N    Y
  Monthly Attendance Summary           N    N    Y    Y    N    Y
  Attendance Exceptions                N    N    Y    Y    N    Y
  Late Arrival Analysis                N    N    Y    Y    N    N
  Early Departure                      N    N    Y    Y    N    N
  Overtime Report                      N    N    Y    N    N    N
  Shift Management                     N    N    Y    N    N    N
  Leave vs Attendance                  N    N    Y    Y    N    N
---------------------------------------------------------------------------
Access Control (group)                 N    Y    N    N    Y    Y
  Door Management (group)              N    Y    N    N    Y    Y
    Door List                          N    Y    N    N    Y    Y
    Door Configuration                 N    N    N    N    Y    N
    Door Status                        N    Y    N    N    Y    Y
    Lock / Unlock Control              N    Y    N    N    Y    N
    Door Schedule                      N    N    N    N    Y    N
    Door Access Rules                  N    N    N    N    Y    Y
    Door Event History                 N    Y    N    N    Y    Y
    Emergency Door Control             N    Y    N    N    Y    N
  Access Group                         N    Y    N    N    Y    Y
  Access Level                         N    Y    N    N    Y    Y
  Employee Credential                  N    N    N    N    Y    N
  Privileged/VIP Access                N    Y    N    N    Y    Y
  Access History                       N    Y    N    N    Y    Y
---------------------------------------------------------------------------
Device & System Health (group)         N    P    N    N    Y    P
  Controller Status                    N    Y    N    N    Y    Y
  Reader Status                        N    Y    N    N    Y    N
  Door Health Monitoring               N    Y    N    N    Y    N
  Server Health                        N    N    N    N    Y    N
  Database Health                      N    N    N    N    Y    N
  Network Status                       N    N    N    N    Y    N
  Active Devices                       N    Y    N    N    Y    Y
  Inactive Devices                     N    Y    N    N    Y    N
  Backup Status                        N    N    N    N    Y    N
  License Status                       N    N    N    N    Y    N
---------------------------------------------------------------------------
Audit & Compliance (group)             P    P    P    P    P    Y
  Access Audit                         N    Y    N    Y    N    Y
  Attendance Correction                N    N    Y    Y    N    Y
  Administrative Activity              N    N    N    N    Y    Y
  Audit Trail & Logs                   N    Y    N    N    Y    Y
  Compliance Reports                   Y    N    Y    N    Y    Y
  Board & Executive MIS Report         Y    N    N    N    N    Y
---------------------------------------------------------------------------
Reporting Center (group)               P    P    P    P    P    P
  Security Reports                     Y    Y    N    N    N    Y
  Attendance Reports                   Y    N    Y    Y    N    Y
  Access Reports                       Y    Y    N    N    Y    Y
  Device Reports                       N    N    N    N    Y    N
  Custom Report Builder                N    N    N    N    Y    N
  Scheduled Reports                    Y    Y    Y    Y    Y    Y
  Export Center                        Y    Y    Y    Y    Y    Y
---------------------------------------------------------------------------
Organization (group)                   Y    N    P    P    N    Y
  Bank                                 Y    N    Y    N    N    Y
  Head Office                          Y    N    Y    N    N    Y
  Region Office                        Y    N    Y    N    N    Y
  Branch                               Y    N    Y    Y    N    Y
  Sub Branch                           Y    N    Y    Y    N    Y
---------------------------------------------------------------------------
User Management (group)                N    N    Y    N    Y    N
  Users                                N    N    Y    N    Y    N
  Roles                                N    N    N    N    Y    N
  Permissions                          N    N    N    N    Y    N
  Login Audit                          N    N    N    N    Y    Y
---------------------------------------------------------------------------

ROLE RATIONALE SUMMARY

CEO / Executive Management
  Sees executive KPIs, board reports, compliance summary, org structure,
  and reporting center. Does NOT see operational SOC consoles or HR attendance.

Security SOC Officer
  Sees full security operations, access control, active device status, and
  security audit logs. Does NOT see HR data, org structure, or user admin.

HR Officer
  Sees full attendance analytics, attendance correction, compliance reports,
  org structure, and user management (employee enrollment only).
  Does NOT see security surveillance or IT device health.

Branch Manager
  Sees branch-scoped executive KPIs, live roll-call, branch scorecard,
  attendance for their branch, access audit, and org structure (branch/sub only).
  Does NOT see system-wide security consoles, IT infra, or user admin.

IT Administrator
  Sees full device health, full access control configuration, user management,
  admin activity audit, and IT-related compliance reports.
  Does NOT see HR attendance data or board-level executive briefings.

Internal Auditor
  Sees ALL audit and compliance items (full access), security access logs,
  attendance records (read-only), org structure, and reporting center.
  Does NOT have write access to any operational control (read-only posture).


===============================================================================
SECTION 4 — FRONTEND ROUTE MAPPING
===============================================================================

All routes use path-based routing (not hash-based).
Route segments use lowercase kebab-case.
Routes do NOT change any page title, label, or behavior.

-------------------------------------------------------------------------------
4.1  EXECUTIVE DASHBOARD
-------------------------------------------------------------------------------

/executive-dashboard                          --> Executive Dashboard (auto-redirect to first child)
/executive-dashboard/bank-overview            --> Bank Overview
/executive-dashboard/attendance-kpi           --> Attendance KPI
/executive-dashboard/security-kpi             --> Security KPI
/executive-dashboard/branch-comparison        --> Branch Comparison
/executive-dashboard/critical-alerts          --> Critical Alerts

-------------------------------------------------------------------------------
4.2  SECURITY OPERATIONS
-------------------------------------------------------------------------------

/security                                     --> Security Operations (auto-redirect to first child)
/security/live-access-events                  --> Live Access Events
/security/who-is-inside                       --> Who Is Inside (Live Roll Call)
/security/security-incidents                  --> Security Incidents
/security/alarm-management                    --> Alarm Management
/security/access-denied-report                --> Access Denied Report
/security/restricted-area-access              --> Restricted Area Access
/security/anti-passback-tailgating            --> Anti-passback & Tailgating
/security/employee-movement-history           --> Employee Movement History
/security/branch-security-scorecard           --> Branch Security Scorecard

-------------------------------------------------------------------------------
4.3  ATTENDANCE ANALYTICS
-------------------------------------------------------------------------------

/attendance                                   --> Attendance Analytics (auto-redirect to first child)
/attendance/daily                             --> Daily Attendance
/attendance/employee-report                   --> Employee Attendance Report
/attendance/monthly-summary                   --> Monthly Attendance Summary
/attendance/exceptions                        --> Attendance Exceptions
/attendance/late-arrival                      --> Late Arrival Analysis
/attendance/early-departure                   --> Early Departure
/attendance/overtime                          --> Overtime Report
/attendance/shift-management                  --> Shift Management
/attendance/leave-vs-attendance               --> Leave vs Attendance

-------------------------------------------------------------------------------
4.4  ACCESS CONTROL
-------------------------------------------------------------------------------

/access-control                               --> Access Control (auto-redirect to first child)

/access-control/door-management               --> Door Management (nested group expand)
/access-control/door-management/door-list     --> Door List
/access-control/door-management/configuration --> Door Configuration
/access-control/door-management/door-status   --> Door Status
/access-control/door-management/lock-unlock   --> Lock / Unlock Control
/access-control/door-management/schedule      --> Door Schedule
/access-control/door-management/access-rules  --> Door Access Rules
/access-control/door-management/event-history --> Door Event History
/access-control/door-management/emergency     --> Emergency Door Control

/access-control/access-group                  --> Access Group
/access-control/access-level                  --> Access Level
/access-control/employee-credential           --> Employee Credential
/access-control/vip-access                    --> Privileged/VIP Access
/access-control/access-history                --> Access History

-------------------------------------------------------------------------------
4.5  DEVICE & SYSTEM HEALTH
-------------------------------------------------------------------------------

/device-health                                --> Device & System Health (auto-redirect)
/device-health/controller-status              --> Controller Status
/device-health/reader-status                  --> Reader Status
/device-health/door-health                    --> Door Health Monitoring
/device-health/server-health                  --> Server Health
/device-health/database-health                --> Database Health
/device-health/network-status                 --> Network Status
/device-health/active-devices                 --> Active Devices
/device-health/inactive-devices               --> Inactive Devices
/device-health/backup-status                  --> Backup Status
/device-health/license-status                 --> License Status

-------------------------------------------------------------------------------
4.6  AUDIT & COMPLIANCE
-------------------------------------------------------------------------------

/audit                                        --> Audit & Compliance (auto-redirect)
/audit/access-audit                           --> Access Audit
/audit/attendance-correction                  --> Attendance Correction
/audit/administrative-activity                --> Administrative Activity
/audit/trail-logs                             --> Audit Trail & Logs
/audit/compliance-reports                     --> Compliance Reports
/audit/board-executive-mis                    --> Board & Executive MIS Report

-------------------------------------------------------------------------------
4.7  REPORTING CENTER
-------------------------------------------------------------------------------

/reports                                      --> Reporting Center (auto-redirect)
/reports/security                             --> Security Reports
/reports/attendance                           --> Attendance Reports
/reports/access                               --> Access Reports
/reports/device                               --> Device Reports
/reports/custom-builder                       --> Custom Report Builder
/reports/scheduled                            --> Scheduled Reports
/reports/export                               --> Export Center

-------------------------------------------------------------------------------
4.8  ORGANIZATION
-------------------------------------------------------------------------------

/organization                                 --> Organization (auto-redirect)
/organization/bank                            --> Bank
/organization/head-office                     --> Head Office
/organization/region-office                   --> Region Office
/organization/branch                          --> Branch
/organization/sub-branch                      --> Sub Branch

-------------------------------------------------------------------------------
4.9  USER MANAGEMENT
-------------------------------------------------------------------------------

/users                                        --> User Management (auto-redirect)
/users/list                                   --> Users
/users/roles                                  --> Roles
/users/permissions                            --> Permissions
/users/login-audit                            --> Login Audit

-------------------------------------------------------------------------------
4.10  SYSTEM ROUTES
-------------------------------------------------------------------------------

/                                             --> Redirects to /executive-dashboard/bank-overview
/login                                        --> Login page (BankLoginPage)
/403                                          --> Access Denied (role does not have permission)
/404                                          --> Page Not Found

-------------------------------------------------------------------------------
4.11  ROLE-BASED DEFAULT LANDING ROUTES
-------------------------------------------------------------------------------

Role                      Default Landing Route
---------------------------------------------------
CEO / Executive Mgmt      /executive-dashboard/bank-overview
Security SOC Officer      /security/live-access-events
HR Officer                /attendance/daily
Branch Manager            /executive-dashboard/bank-overview
IT Administrator          /device-health/controller-status
Internal Auditor          /audit/audit-trail  (wait — correct label: /audit/trail-logs)


===============================================================================
SECTION 5 — SIDEBAR UI RULES
===============================================================================

-------------------------------------------------------------------------------
5.1  CORE DESIGN MANDATE
-------------------------------------------------------------------------------

The sidebar for this platform is designed for enterprise banking SOC environments
where operators work under high-stakes, time-critical conditions. The design
must be professional, legible, and distraction-free.

ABSOLUTE RULES (non-negotiable):
  - Text-only navigation. No icons of any kind.
  - No emoji characters in navigation labels.
  - No decorative symbols (arrows, bullets, dashes) in label text.
  - No color gradients on the sidebar background.
  - No animations other than functional expand/collapse and hover transitions.
  - No rounded corners on nav items (enterprise squared appearance).
  - No shadows on individual nav items.

-------------------------------------------------------------------------------
5.2  SIDEBAR BACKGROUND & STRUCTURE
-------------------------------------------------------------------------------

Property                    Value
---------------------------------------------
Sidebar background          #0a1628  (deep navy)
Sidebar right border        1px solid rgba(255,255,255,0.06)
Brand Header background     #091E42
Customer Strip background   rgba(255,255,255,0.04)
Sidebar footer background   rgba(0,0,0,0.15)

-------------------------------------------------------------------------------
5.3  BRAND HEADER (56px — Top of Sidebar)
-------------------------------------------------------------------------------

Contains:
  - Product monogram badge: "BS" in a 22x22px cobalt square (border-radius 4px)
  - Product name: "Suprema BioStar X"
    font-size 13px; font-weight 700; color #FFFFFF; letter-spacing 0.01em
  - Product subtitle: "Physical Security Platform"
    font-size 10px; font-weight 400; color rgba(255,255,255,0.55)

CSS:
  padding: 12px 16px;
  background: #091E42;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; gap: 10px;

-------------------------------------------------------------------------------
5.4  CUSTOMER STRIP (36px — Below Brand Header)
-------------------------------------------------------------------------------

Contains:
  - Label "Customer" in 9px uppercase muted text
  - Value "Pubali Bank PLC" (or active deployment name) in 11px bold text

CSS:
  padding: 6px 16px;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.06);

Text:
  Label  : font-size 9px; text-transform uppercase; color rgba(255,255,255,0.35)
  Value  : font-size 11px; font-weight 600; color rgba(255,255,255,0.85)

-------------------------------------------------------------------------------
5.5  SECTION HEADER ("Dashboard" label)
-------------------------------------------------------------------------------

  font-size      : 10px
  font-weight    : 600
  text-transform : uppercase
  letter-spacing : 0.10em
  color          : rgba(255,255,255,0.35)
  padding        : 14px 16px 4px
  pointer-events : none   (not clickable)
  user-select    : none

-------------------------------------------------------------------------------
5.6  PARENT NAV ITEMS (Expandable Groups)
-------------------------------------------------------------------------------

Default state:
  font-size      : 13px
  font-weight    : 500
  letter-spacing : 0.01em
  color          : rgba(255,255,255,0.75)
  padding        : 0 16px
  height         : 38px
  display        : flex; align-items center; justify-content space-between
  cursor         : pointer

Chevron (right side of parent row):
  Rendered as inline SVG (not a font icon, not an emoji)
  Size           : 12x12px
  Default        : pointing right; opacity 0.45
  Expanded       : rotated 90deg; opacity 0.70
  Transition     : transform 150ms ease-in-out

NO icons on the left side of any parent label.
NO decorative characters before any label text.

-------------------------------------------------------------------------------
5.7  CHILD NAV ITEMS (Sub-pages)
-------------------------------------------------------------------------------

Default state:
  font-size      : 12px
  font-weight    : 400
  letter-spacing : 0.005em
  color          : rgba(255,255,255,0.60)
  padding-left   : 24px
  padding-right  : 16px
  height         : 32px
  display        : flex; align-items center
  cursor         : pointer

NO icons on child items.
NO decorative dashes or bullets before child labels.
NO bold weight on default (non-active) child items.

-------------------------------------------------------------------------------
5.8  SUB-CHILD NAV ITEMS (Door Management — 3rd level)
-------------------------------------------------------------------------------

Default state:
  font-size      : 11.5px
  font-weight    : 400
  color          : rgba(255,255,255,0.55)
  padding-left   : 40px
  padding-right  : 16px
  height         : 28px
  cursor         : pointer

-------------------------------------------------------------------------------
5.9  COLOR TOKEN REFERENCE
-------------------------------------------------------------------------------

Token Name                  Value
------------------------------------------------
--sidebar-bg                #0a1628
--sidebar-brand-bg          #091E42
--nav-section-header        rgba(255,255,255,0.35)
--nav-parent-default        rgba(255,255,255,0.75)
--nav-parent-active         #FFFFFF
--nav-parent-hover          #FFFFFF
--nav-child-default         rgba(255,255,255,0.60)
--nav-child-active          #60a5fa
--nav-child-hover           rgba(255,255,255,0.85)
--nav-subchild-default      rgba(255,255,255,0.55)
--nav-subchild-active       #93c5fd
--nav-active-bar            #0052CC
--nav-active-bar-width      3px
--nav-active-leaf-bg        rgba(0,82,204,0.18)
--nav-active-child-bg       rgba(0,82,204,0.22)
--nav-active-subchild-bg    rgba(0,82,204,0.15)
--nav-hover-parent-bg       rgba(255,255,255,0.06)
--nav-hover-child-bg        rgba(255,255,255,0.05)
--nav-hover-subchild-bg     rgba(255,255,255,0.04)

-------------------------------------------------------------------------------
5.10  TYPOGRAPHY
-------------------------------------------------------------------------------

Font stack: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif

Font role                   Size     Weight   Notes
-----------------------------------------------------------
Brand name                  13px     700      Letter-spacing 0.01em
Product subtitle            10px     400      color rgba(255,255,255,0.55)
Customer label              9px      400      Uppercase, letter-spacing 0.08em
Customer value              11px     600      color rgba(255,255,255,0.85)
Section header              10px     600      Uppercase, letter-spacing 0.10em
Parent nav item             13px     500      Letter-spacing 0.01em
Child nav item              12px     400      Letter-spacing 0.005em
Sub-child nav item          11.5px   400      
Footer version text         10px     400      color rgba(255,255,255,0.25)

-------------------------------------------------------------------------------
5.11  SIDEBAR FOOTER
-------------------------------------------------------------------------------

Sticky at bottom of sidebar. Contains:

  - Platform version: "BioStar X  v2.0.0"
    font-size 10px; color rgba(255,255,255,0.25)

  - Session expiry (when session-aware auth is active):
    "Session expires in 08:42" — font-size 10px; color #fbbf24 (amber warning)
    Shown only when less than 10 minutes remain in the session.

  - Focus Mode link (Control Room deployments):
    "Control Room Mode" — small text button that triggers full sidebar collapse.
    font-size 10px; color rgba(255,255,255,0.35); cursor pointer.

CSS:
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,0.07);
  background: rgba(0,0,0,0.15);
  position: sticky;
  bottom: 0;

-------------------------------------------------------------------------------
5.12  ACCESSIBILITY REQUIREMENTS
-------------------------------------------------------------------------------

Requirement             Implementation
--------------------------------------------------------------
Keyboard navigation     Tab key traverses all visible nav items in DOM order.
                        Enter key activates/navigates. Space key toggles groups.
ARIA role               <nav aria-label="Main navigation">
                        <ul role="list">; <li role="none">; <a role="menuitem">
ARIA expanded           aria-expanded="true/false" on all expandable parent buttons
ARIA current            aria-current="page" on the currently active child item
Focus visible           outline: 2px solid #60a5fa; outline-offset: -2px
                        NEVER suppress focus outline (outline: none is prohibited)
Color contrast          All text meets WCAG AA minimum 4.5:1 against sidebar background
Reduced motion          @media (prefers-reduced-motion: reduce):
                        All sidebar animations set to transition-duration: 0ms
Focus trap (mobile)     When sidebar overlay is open, Tab/Shift-Tab cycles only
                        within sidebar items. Escape key closes the sidebar.

-------------------------------------------------------------------------------
5.13  SOC CONTROL ROOM SCALING (Optional Deployment Mode)
-------------------------------------------------------------------------------

On ultra-wide or multi-display control room deployments (viewport > 2560px):

  Sidebar background       : #060d1a  (deeper for higher contrast)
  Parent nav item font     : 14px (scaled up from 13px)
  Child nav item font      : 13px (scaled up from 12px)
  Active accent bar width  : 4px (scaled up from 3px)
  Focus Mode button        : Pinned prominently in footer — operators frequently
                             collapse the sidebar to maximize live camera/chart area.

All color values remain identical. Only spacing and font-size scale.

-------------------------------------------------------------------------------
5.14  STATE PERSISTENCE RULES
-------------------------------------------------------------------------------

State                       Storage                 Behavior
----------------------------------------------------------------------
Active page                 URL path (router)       Survives refresh; back/forward works
Expanded groups             In-memory state         Resets on full page refresh;
                                                    active group auto-expands on load
Door Management expand      In-memory state         Resets on full page refresh;
                                                    auto-expands if active page is within
Sidebar open (mobile)       In-memory state         Closes on every navigation
Role permission filter      sessionStorage          Persists for login session; clears on logout

Auto-expand on direct URL:
  When user opens /access-control/door-management/door-list directly:
  1. Router resolves the path.
  2. Sidebar auto-expands "Access Control" parent group.
  3. Sidebar auto-expands "Door Management" nested group.
  4. "Door List" child item receives active highlight.
  5. Page component renders immediately — no redirect.

===============================================================================
SECTION 6 — QUICK REFERENCE CARD
===============================================================================

SIDEBAR DIMENSIONS
  Width (desktop)   : 240px fixed
  Brand Header      : 56px
  Customer Strip    : 36px
  Parent nav item   : 38px min-height
  Child nav item    : 32px min-height
  Sub-child item    : 28px min-height
  Child indent      : 24px left padding
  Sub-child indent  : 40px left padding

ANIMATION TIMINGS
  Chevron expand/collapse  : 150ms ease-in-out
  Sidebar slide (mobile)   : 250ms cubic-bezier(0.4, 0, 0.2, 1)
  Hover background         : 120ms ease-in-out

KEY COLORS
  Active accent bar        : #0052CC (3px left border, parent row)
  Active child label       : #60a5fa (sky blue)
  Active sub-child label   : #93c5fd
  Active child background  : rgba(0, 82, 204, 0.22)
  Sidebar background       : #0a1628
  Parent label default     : rgba(255,255,255,0.75)
  Child label default      : rgba(255,255,255,0.60)

NAVIGATION BEHAVIORS
  Single group open at a time             YES
  Click unexpanded group -> navigate      YES (to first child)
  Click expanded group   -> collapse      YES (stay on current page)
  Door Management        -> nested group  YES (independent expand; no auto-navigate)
  Mobile sidebar close on navigate        YES
  Browser back/forward support            YES (path-based routing)

DEFAULT LANDINGS
  CEO / Executive Mgmt    : /executive-dashboard/bank-overview
  SOC Officer             : /security/live-access-events
  HR Officer              : /attendance/daily
  Branch Manager          : /executive-dashboard/bank-overview
  IT Administrator        : /device-health/controller-status
  Internal Auditor        : /audit/trail-logs

SIDEBAR CONTENT RULES
  Icons         : NONE
  Emoji         : NONE
  Decorative    : NONE
  Font          : Inter (enterprise sans-serif)
  Style         : Text-only, professional, high-readability, enterprise banking

===============================================================================
FINAL VALIDATION CHECK — LOCKED HIERARCHY CONFIRMED
===============================================================================

The 9 navigation modules preserved exactly as locked:
  1. Executive Dashboard       (5 children)                          CONFIRMED
  2. Security Operations       (9 children)                          CONFIRMED
  3. Attendance Analytics      (9 children)                          CONFIRMED
  4. Access Control            (6 children + Door Management nested) CONFIRMED
     Door Management           (8 sub-children)                      CONFIRMED
  5. Device & System Health    (10 children)                         CONFIRMED
  6. Audit & Compliance        (6 children)                          CONFIRMED
  7. Reporting Center          (7 children)                          CONFIRMED
  8. Organization              (5 children)                          CONFIRMED
  9. User Management           (4 children)                          CONFIRMED

No menus renamed. No menus removed. No menus reordered.
No new modules created. No dashboard pages redesigned.
This document covers ONLY navigation behavior, sidebar UX, routing, and role visibility.

Document Status: FINAL
Changes require written approval from Product Owner and Security Architect.
