# FINAL LOCKED BANKING PHYSICAL SECURITY PLATFORM
## Enterprise UI / Screen Specification Document

**Design Standard:** Suprema BioStar X & Banking Mission-Critical Grade  
**Visual Theme:** Professional Enterprise Cobalt Blue & Crisp White (`#091E42`, `#0052CC`, `#F4F5F7`, `#FFFFFF`)  
**Security Posture:** ISO 27001, PCI-DSS Physical Security Mandates, Central Bank Physical Access Controls  
**Form Factor Hierarchy:** Control Room Video Wall (Dual/Quad QHD/4K) → Desk Ops QHD/FHD → Management Tablet → Mobile Alert/Approval

---

## Navigation & Sidebar Standard (LOCKED HIERARCHY)

The sidebar navigation hierarchy is strictly locked and cannot be altered, reordered, or augmented:

```text
Dashboard
├── Executive Dashboard
├── Security Operations
├── Attendance Analytics
├── Access Control
├── Device & System Health
├── Audit & Compliance
├── Reporting Center
├── Organization
└── User Management
```

---

# 1. Executive Dashboard UI Specification

### 1. Page Overview
* **Page Purpose:** Provides the C-Suite, Head of Security, and Regional Directors with an aggregated, high-level posture of nationwide physical security, threat metrics, critical branch compliance status, and active incident response summaries.
* **Target User Roles:** CEO, Chief Risk Officer (CRO), Head of Corporate Security, Regional Operations Directors.
* **Main Business Objective:** Mitigate institutional risk by delivering real-time visibility into high-severity physical breaches, executive floor lockdown readiness, branch vault compliance, and SLA breaches across all banking facilities.

### 2. UI Layout Specification
* **Header:**
  * **Page Title:** `Executive Physical Security Posture` (Sub-title: `Nationwide Real-Time Telemetry`)
  * **Date/Time Display:** System UTC + Local Banking Timezone (e.g., `2026-09-20 15:00:47 +06:00 | BDT / UTC+6`) with live millisecond sync beacon.
  * **User Profile:** Circular badge with user photo, rank (`Chief Risk Officer`), session security level (`Tier-1 Classified`), and SSO logout.
  * **Notifications Center:** Bell icon with high-priority pulse badge (count of unacknowledged Critical/P1 alerts), quick-drawer toggle for C-level emergency broadcasts.
* **Main Content:**
  * **KPI Cards Row (Top):** 4 summary metric tiles with trend micro-sparklines and delta indicators vs previous 24-hour cycle.
  * **Charts Section (Middle Split 60/40):** 
    * *Left (60%):* Nationwide Branch Security Threat Index & Anomaly Heatmap.
    * *Right (40%):* Vault & Secure Zone Access Incident Distribution (Donut & Stacked Bar).
  * **Tables Section (Bottom Split 50/50):** 
    * *Left:* Active Priority-1 Physical Security Incidents (Requires Executive Notification).
    * *Right:* High-Risk Vault / Server Room Access Breaches (Last 12 Hours).
  * **Filters Bar:** Date Range Selector (`Today`, `Last 7 Days`, `Month-to-Date`, `Custom QTD`), Region/Zone Selector (`All Regions`, `Dhaka North`, `Chittagong Metro`, `Sylhet Division`), Risk Tier Filter (`All Tiers`, `Critical Only`).
  * **Action Buttons:** `Download Board Summary (PDF)`, `Trigger Executive Briefing Mode`, `Broadcast Level-1 Lockdown Protocol`.
  * **Status Indicators:** Nationwide Physical Network Health (`Normal: 99.98%`), Global Threat Level (`DEFCON 4 / Guarded`), Vault Protocol Sync (`Locked & Armed`).

### 3. Dashboard Components
* **KPI Cards:**
  1. *Nationwide Vault Integrity:* Value `100% Secure` (Sub-text: `842/842 Vaults Locked`), Data Source: `telemetry_vault_sensors`.
  2. *Active Critical Alarm Volume:* Value `3 Alarms` (Delta: `-2 from yesterday`), Data Source: `soc_active_alarms WHERE severity='CRITICAL'`.
  3. *Unscheduled After-Hours Entries:* Value `14 Events` (Flagged across 9 branches), Data Source: `access_logs WHERE after_hours=TRUE`.
  4. *Regulatory Compliance Readiness:* Value `98.4%` (Based on dual-custody vault logging), Data Source: `audit_compliance_daily_score`.
* **Charts:**
  1. *Threat Trend Timeline:*
     * Chart Type: Multi-line Area Chart with smoothed bezier curves and threshold bands.
     * X-Axis: 24-Hour Timeline (00:00 to 23:00 in 2-hour increments).
     * Y-Axis: Incidents Count (0 to 50).
     * Data Displayed: Forced Door Events, Tailgating Flags, Biometric Mismatch Spikes, Blacklisted Face Sightings.
  2. *Branch Risk Distribution by Zone:*
     * Chart Type: Radial Polar Bar Chart.
     * X/Category: Geographical Banking Zones (Zone 1 - Head Office, Zone 2 - Commercial Hubs, Zone 3 - Rural Outposts).
     * Y/Value: Normalized Threat Index (0–100).
     * Data Displayed: Risk weighted score based on biometric failures, door-held warnings, and sensor tampers.
* **Tables:**
  1. *Critical Incidents Requiring Executive Oversight Table:*
     * Columns: `Incident ID`, `Timestamp`, `Branch Code & Name`, `Security Zone`, `Incident Type`, `Custody Status`, `Action Taken`.
     * Sorting: Default by `Timestamp DESC`; sortable by `Branch Code`, `Incident Type`.
     * Filtering: Quick filter by Zone, Status (`Under Investigation`, `Resolved`, `Escalated to Law Enforcement`).
     * Export: Export to encrypted Board-ready PDF, CSV with SHA-256 digital signature.

### 4. User Interaction
* **View:** Drilldown click on any region opens a flyout drawer showing branch-by-branch roll-up; hover tooltip on charts reveals exact incident timestamp and involved guard post.
* **Search:** Global header lookup for Branch Code (e.g., `BR-0104`), Vault ID, or specific Incident Ticket number.
* **Filter:** Multi-select dropdown for Division, Branch Class (A/B/C tier branch), Incident Severity.
* **Export:** One-click generation of C-Suite briefing packs with embedded cryptographic watermarks.
* **Approve / Reject:** Executive sign-off for temporary elevated vault bypass or high-value transit window extension.
* **Lock / Unlock:** Protected by Dual-Token Step-up Authentication (FIDO2 + Biometric PIN) for Emergency Master Facility Lockdown.
* **Configure:** Customize threshold triggers for executive SMS/email push dispatches.

### 5. Data Requirements
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `incident_id` | UUID (v4) | Unique tracking identifier for executive incident |
| `branch_code` | VARCHAR(10) | Unique banking branch locator identifier (e.g., `BR-0104`) |
| `zone_classification`| ENUM | Tier-1 (Vault), Tier-2 (Data Center), Tier-3 (Cash Counter), Tier-4 (Public Hall) |
| `threat_score` | DECIMAL(5,2) | Algorithmic security posture score (0.00 to 100.00) |
| `active_alarm_count` | INT | Number of open unacknowledged priority alarms |
| `executive_signoff_flag` | BOOLEAN | Indicates whether CEO/Head of Security approval is required |
| `timestamp_utc` | TIMESTAMP WITH TZ | Synchronized transaction capture timestamp |

### 6. Permission Mapping
* **CEO / Executive Management:** Full View, Board Export, Emergency Executive Authorization (Approve/Reject Master Overrides).
* **Security SOC Officer:** View only summary, can push alerts to Executive queue.
* **HR Officer:** Restricted View (KPI aggregate metrics only, no tactical security breach details).
* **Branch Manager:** View restricted strictly to their assigned branch/cluster performance metrics.
* **IT Administrator:** View system availability KPIs, configure notification webhooks.
* **Internal Auditor:** Read-only access to historical executive metrics and approval logs with tamper audits.

### 7. Responsive Design
* **Desktop (Control Room / Executive Office):** Full 12-column responsive layout, 4 KPI cards per row, side-by-side high-density charts, auto-refresh every 30 seconds without screen flicker.
* **Tablet (iPad Pro / Executive Briefing):** 2x2 KPI card grid, vertically stacked charts, touch-optimized collapsible tables with horizontal swipe for overflow columns.
* **Mobile (Executive On-The-Go):** Single-column card stack, headline posture badge (`ALL SECURE` vs `INCIDENT ACTIVE`), push-alert response cards with instant `Acknowledge` or `Call SOC Command` triggers.

---

# 2. Security Operations UI Specification

### 1. Page Overview
* **Page Purpose:** Serves as the primary 24/7 mission-critical tactical console for the Central Security Operations Center (SOC). Monitors live door statuses, duress alarms, forced entries, live CCTV stream integration, and coordinates immediate guard dispatches.
* **Target User Roles:** SOC Commander, Physical Security Specialist, Control Room Dispatcher, Threat Analyst.
* **Main Business Objective:** Minimize Mean Time to Detect (MTTD) and Mean Time to Respond (MTTR) for unauthorized physical entries, anti-passback violations, duress alarms, and vault intrusions across the banking network.

### 2. UI Layout Specification
* **Header:**
  * **Page Title:** `Central Security Operations Center (SOC)` (Status Pill: `LIVE TELEMETRY ACTIVE - 120ms LATENCY`)
  * **Date/Time:** Dual Atomic Clock (UTC and Local SOC Station Time) with second-ticker.
  * **User Profile:** Operator Call-Sign (`SOC-OP-04`), Duty Shift (`Night Shift B`), Station ID (`CONSOLE-02`).
  * **Notifications:** Audio alarm mute/unmute control (timed snooze with supervisor authorization), urgent dispatch queue count.
* **Main Content:**
  * **Top Action/Alert Ribbon:** High-urgency flashing banner for Level-1 Duress or Fire-Trip alarms with direct acknowledge button.
  * **Center Left (65% Screen Width):** 
    * Interactive Multi-Branch Interactive Floorplan & Door Status Grid (Suprema Door State Icons: Locked, Unlocked, Forced, Held Open, Offline).
    * Integrated RTSP/WebRTC Video Pop-out matrix synchronized to door sensor triggers.
  * **Center Right (35% Screen Width):** 
    * Real-time Streaming Event Feed (Live rolling log of door swipes, access grants, biometric matches, rejections).
  * **Bottom Section (Full Width):** 
    * SOC Incident Action & Guard Dispatch Console (Table with active investigations, response timers, guard communication link).
  * **Filters Bar:** Branch Selector, Sensor Type (`Biometric Reader`, `PIR Motion`, `Magnetic Reed`, `Crash Bar`, `Vibration Sensor`), Severity (`P1-Emergency`, `P2-High`, `P3-Medium`, `P4-Info`).
  * **Status Indicators:** Active Guard Patrols Tracking (`42 Active`), Door Interlock Integrity (`100% Locked`), Siren Relay Status (`Armed`).

### 3. Dashboard Components
* **Cards:**
  1. *Real-time Critical Alarms:* Value `2 Unacknowledged` (Flashing Red border), Data Source: `soc_alarm_events WHERE ack=FALSE AND priority=1`.
  2. *Doors Held Open (>60s):* Value `7 Doors` (Yellow warning state), Data Source: `door_sensor_telemetry WHERE held_seconds > 60`.
  3. *Anti-Passback Violations:* Value `5 Detected Today`, Data Source: `access_logs WHERE error_code='APB_VIOLATION'`.
  4. *Active Guard Dispatches:* Value `4 In Progress` (Average response time: 2m 14s), Data Source: `guard_dispatch_active`.
* **Charts:**
  1. *Real-Time Alarm Volume Stream:*
     * Chart Type: Live Tick-based Stepped Area Chart (updates every 1s).
     * X-Axis: Rolling 15-Minute Window.
     * Y-Axis: Events / Sec (0 to 20).
     * Data Displayed: Access Granted (Green line), Access Denied (Amber line), Alarm Trigger (Red line).
  2. *Violation Breakdown by Category:*
     * Chart Type: Horizontal Stacked Bar Chart.
     * X-Axis: Event Count.
     * Y-Axis: Breach Classification (`Door Forced Open`, `Tailgating Detected`, `Duress PIN Entered`, `Biometric Spoof Attempt`).
     * Data Displayed: Relative percentage and absolute volume per category.
* **Tables:**
  1. *Live Security Event Stream Table:*
     * Columns: `Timestamp (ms)`, `Event Type`, `Card/User ID`, `Employee Name / Role`, `Device/Door Name`, `Branch`, `Verification Mode (Face/Finger/Card)`, `Result Status`, `CCTV Snapshot`, `Action`.
     * Sorting: Fixed `Timestamp DESC` (Real-time auto-scroll with manual pause toggle).
     * Filtering: By Verification Mode, Branch, Door, Result (`Granted`, `Denied`, `Tamper`).
     * Export: Instant Forensic Clip Export (combines log row + 10s CCTV buffer before/after swipe into encrypted MP4/ZIP).

### 4. User Interaction
* **View:** Click any event row to instantly expand split-screen modal showing user photo on file vs. live biometric capture snapshot and door location map.
* **Search:** Instant regex-enabled search for Door Name (e.g., `HO-VAULT-DOOR-01`), Cardholder Name, or Badge Hex.
* **Filter:** Toggle between "Show All Swipes" and "Security Exceptions Only" with one keypress (`F4`).
* **Approve / Reject:** Remote door buzz-in approval for armed escort or delivery personnel after visual CCTV verification.
* **Lock / Unlock:** Instant door control buttons (`Remote Momentary Unlock (5s)`, `Lockout / Emergency Lockdown`, `Release Interlock`). Every action requires mandatory operator reason code entry from dropdown.
* **Configure:** Adjust door held open warning audio thresholds (30s, 60s, 90s).

### 5. Data Requirements
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `event_id` | BIGINT AUTO_INCREMENT | High-velocity sequential event identifier |
| `reader_device_id` | VARCHAR(32) | Hardware serial/MAC of Suprema biometric terminal |
| `door_id` | VARCHAR(32) | Logical door reference ID mapped to banking location |
| `user_pin_id` | VARCHAR(20) | Banking Core Employee ID or Visitor Temporary Token |
| `auth_method` | ENUM | `FACE_RECOGNITION`, `FINGERPRINT`, `SMART_CARD`, `CARD_PLUS_PIN`, `DURESS_PIN` |
| `event_severity` | VARCHAR(10) | `P1_CRITICAL`, `P2_HIGH`, `P3_MEDIUM`, `P4_LOW` |
| `cCTV_playback_uri` | VARCHAR(255) | RTSP/NVR stream URI bookmark for event synchronization |
| `operator_ack_id` | VARCHAR(20) | SOC Officer ID who acknowledged and processed the alarm |

### 6. Permission Mapping
* **CEO / Executive Management:** View only (Read-only live stream, no direct door control).
* **Security SOC Officer:** Full Control (Acknowledge Alarms, Dispatch Guards, Remote Unlock, Trigger Lockdown).
* **HR Officer:** No Access (Blocked for employee privacy and security protocol segregation).
* **Branch Manager:** View and acknowledge alarms restricted strictly to their branch jurisdiction.
* **IT Administrator:** View telemetry, restart door controller communication daemons, configure IP gateways.
* **Internal Auditor:** Read-only access to historical alarm processing timestamps and operator action logs.

### 7. Responsive Design
* **Desktop (SOC Video Wall / Quad Monitor):** Ultra-wide layout, persistent dark-mode-ready high-contrast theme, multi-window undocking for live camera grids and live stream feeds.
* **Tablet (Guard Supervisor Patrol):** Touch-friendly door status grid with color-coded tiles (Green=Closed, Red=Alarm, Grey=Offline), large tap targets for emergency buzz-in with secondary PIN confirmation.
* **Mobile (Field Guard Patrol Unit):** Priority incident dispatch cards with GPS routing to alarm zone, one-tap "Arrived on Scene" status update, camera capture for incident reporting.

---

# 3. Attendance Analytics UI Specification

### 1. Page Overview
* **Page Purpose:** Provides enterprise-scale time, attendance, biometric punch analytics, shift reconciliation, and workforce physical presence tracking across Head Office and nationwide branch networks.
* **Target User Roles:** HR Operations Officer, Payroll Compliance Manager, Regional Branch Operations Manager.
* **Main Business Objective:** Eliminate manual attendance reconciliation, eradicate buddy punching via verified Suprema biometric verification, track real-time branch teller desk staffing compliance, and export certified payroll attendance feeds.

### 2. UI Layout Specification
* **Header:**
  * **Page Title:** `Workforce Attendance Analytics & Physical Presence`
  * **Date/Time:** Date picker with Day / Week / Pay-Period / Monthly view selector.
  * **User Profile:** HR Business Partner Profile, Department scope (`Retail Banking Division`).
  * **Notifications:** Alerts for missing shift punches, unexcused branch manager absences, overtime threshold breaches.
* **Main Content:**
  * **KPI Summary Cards (Top):** 4 punch analytics metrics (Present, Absent, Late Arrival, Field/On-Duty).
  * **Charts (Middle Split 50/50):**
    * *Left:* Nationwide Punctuality & Late Arrivals Trend (Line chart by Branch Cluster).
    * *Right:* Real-Time Physical Desk Occupancy Rate by Banking Department (Horizontal Bar).
  * **Tables (Bottom Full Width):** 
    * Master Daily Biometric Punch Log & Reconciliation Register.
  * **Filters Bar:** Branch Selector, Department Dropdown (`Cash & Vault Operations`, `Trade Finance`, `Customer Care`, `IT & SecOps`), Employee Category (`Permanent`, `Probationary`, `Outsourced Guard/Cleaning`), Attendance Status (`Present`, `Late`, `Early Exit`, `Absent`, `Anomaly/Duplicate Swipe`).
  * **Action Buttons:** `Export to SAP/Workday Payroll (CSV)`, `Recalculate Shifts`, `Approve Attendance Discrepancies`, `Flag Shift Overstay`.
  * **Status Indicators:** Terminal Synchronization Status (`842 BioStation 3 Units Synced`), Pending HR Regularization Requests (`23 Pending`).

### 3. Dashboard Components
* **Cards:**
  1. *Total Present Today:* Value `14,892 / 15,200` (97.97% Staffing rate), Data Source: `attendance_daily_summary WHERE status='PRESENT'`.
  2. *Late Arrivals (>15 min):* Value `312 Staff` (2.05%), Data Source: `attendance_logs WHERE first_in > shift_start + INTERVAL 15 MIN`.
  3. *Unscheduled Absences:* Value `48 Personnel` (Includes 3 Branch Cash Officers flagged), Data Source: `attendance_unexcused_absences`.
  4. *Overtime Hours Logged:* Value `1,420 Total Hours` (Current billing cycle), Data Source: `overtime_accrual_ledger`.
* **Charts:**
  1. *Punctuality Arrival Curve:*
     * Chart Type: Histogram Distribution Area Chart.
     * X-Axis: Time of Arrival (07:00 to 11:00 in 15-minute buckets).
     * Y-Axis: Number of Employee In-Punches.
     * Data Displayed: Standard Shift Window benchmark vs actual biometric punch volume curve.
  2. *Presence by Department:*
     * Chart Type: Stacked Horizontal Bar Chart.
     * X-Axis: Percentage Occupancy (0 to 100%).
     * Y-Axis: Department Names (Treasury, Retail Banking, Credit Risk, IT Infrastructure, Branch Clearing).
     * Data Displayed: On-Site Verified (Blue), Remote/On-Duty (Teal), Absent (Grey), Late (Orange).
* **Tables:**
  1. *Biometric Attendance & Shift Reconciliation Table:*
     * Columns: `Employee ID`, `Full Name`, `Department`, `Branch / Location`, `Assigned Shift`, `First In (Biometric)`, `Last Out (Biometric)`, `Total Hours Worked`, `Punctuality Flag`, `Verification Mode`, `Regularization Status`, `Actions`.
     * Sorting: Default by `Branch ASC`, `First In ASC`; sortable by all columns.
     * Filtering: Filter by Late Status, Missing Out-Punch, Branch Code, Date Range.
     * Export: Formatted Excel (`.xlsx`) with embedded payroll reconciliation formulas, certified PDF.

### 4. User Interaction
* **View:** Clicking any employee row opens a detailed Monthly Attendance Calendar Modal highlighting punch times, terminal serials used, and lunch break durations.
* **Search:** Search by Employee ID, NID/Passport number, or partial employee name.
* **Filter:** One-click filter chips: `Tellers Late Today`, `Missing Out-Punches`, `Overtime > 2 Hours`.
* **Approve / Reject:** HR Officer approves or rejects employee-submitted regularization requests (e.g., forgotten badge, field assignment) with mandatory manager comment.
* **Export:** Scheduled auto-export to Enterprise ERP payroll systems via SFTP or direct download.
* **Configure:** Setup grace period parameters (e.g., standard 15-minute grace window for branch staff).

### 5. Data Requirements
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `attendance_record_id` | BIGINT AUTO_INCREMENT | Primary key for attendance ledger row |
| `employee_id` | VARCHAR(20) | Unique corporate employee payroll ID |
| `shift_id` | VARCHAR(16) | Assigned work schedule reference (e.g., `SHIFT-BR-MORNING`) |
| `punch_date` | DATE | Standard calendar working day |
| `in_timestamp` | TIMESTAMP WITH TZ | First validated physical access biometric timestamp |
| `out_timestamp` | TIMESTAMP WITH TZ | Last validated physical exit biometric timestamp |
| `work_duration_minutes` | INT | Net calculated minutes on premises excluding break windows |
| `punctuality_status` | ENUM | `ON_TIME`, `GRACE_PERIOD`, `LATE`, `VERY_LATE`, `HALF_DAY`, `ABSENT` |
| `device_terminal_in` | VARCHAR(32) | Hardware device ID recording the entry punch |

### 6. Permission Mapping
* **CEO / Executive Management:** Aggregated analytical view (Labor productivity trends, branch headcount compliance).
* **Security SOC Officer:** View only (To verify physical presence during safety evacuations or investigations).
* **HR Officer:** Full Administrative Access (Shift allocation, Regularization approvals, Attendance editing, ERP exports).
* **Branch Manager:** Read & Approve access limited to branch staff; can submit regularization requests on behalf of branch employees.
* **IT Administrator:** Read-only access to terminal data sync services and database integrity.
* **Internal Auditor:** Read-only access to punch tamper logs, historical modifications, and manager overrides.

### 7. Responsive Design
* **Desktop (HR Ops Station):** Dense tabular layout with fixed headers, inline quick-action buttons for regularization approvals, split screen with employee profile preview.
* **Tablet (Branch Manager Desk):** Swipeable shift card list, simple tap to approve single or bulk attendance discrepancy requests.
* **Mobile (Employee / Manager Self-Service):** Personal punch card overview, monthly punctuality ring, one-tap "Submit Late Punch Explanation" workflow.

---

# 4. Access Control UI Specification

### 1. Page Overview
* **Page Purpose:** Configures and enforces physical access permissions, door groupings, access levels, time schedules, dual-custody vault interlocks, and anti-passback rules across all banking facilities.
* **Target User Roles:** Chief Physical Security Officer, Access Control Administrator, SOC Lead.
* **Main Business Objective:** Ensure Zero Trust physical security by implementing role-based access control (RBAC), multi-party authorization for high-security vault zones, and eliminating unauthorized access to server rooms and cash handling corridors.

### 2. UI Layout Specification
* **Header:**
  * **Page Title:** `Physical Access Control & Zone Authorization Engine`
  * **Date/Time:** Synchronized System Clock with live time-zone indicator.
  * **User Profile:** Access Admin Badge (`Level-4 Privileged Operator`).
  * **Notifications:** Access policy violation warnings, pending dual-authorization requests.
* **Main Content:**
  * **Sub-Navigation Tabs:** 
    * `Access Levels & Groups` | `Door Interlocks & Vault Rules` | `Time Schedules` | `Anti-Passback Zones` | `Emergency Lockdown Groups`.
  * **Summary KPI Cards (Top):** 4 Cards (Total Configured Doors, Active Access Groups, Dual-Custody Zones, Active Temporary Clearances).
  * **Main Configuration Matrix / Split View (Middle & Bottom):**
    * *Left Panel (35%):* Tree hierarchy of Banking Security Zones (Head Office > 5th Floor Executive > Treasury > Vault Air-Lock).
    * *Right Panel (65%):* Policy Rule Editor, Door Assignment List, Schedule Binding, and Assigned User Groups.
  * **Action Buttons:** `Create Access Level`, `Deploy Policy to Terminals`, `Simulate Access Rule`, `Emergency All-Clear Release`.
  * **Status Indicators:** Terminal Policy Sync Status (`All 842 Controllers Up-to-Date`), Interlock Status (`Active & Verified`).

### 3. Dashboard Components
* **Cards:**
  1. *Total Managed Doors:* Value `1,840 Doors` (Online: 1,838, Maintenance: 2), Data Source: `doors_master`.
  2. *Active Access Levels:* Value `86 Profiles` (e.g., `Branch Teller Standard`, `Cash Escort Tier-1`), Data Source: `access_levels_master`.
  3. *Dual-Custody Air-Locks:* Value `142 Vaults` (Requiring 2 distinct biometric keys within 30s), Data Source: `interlock_groups WHERE dual_custody=TRUE`.
  4. *Pending Access Requests:* Value `9 Approvals Waiting`, Data Source: `access_requests WHERE status='PENDING'`.
* **Charts:**
  1. *Door Access Frequency by Security Zone:*
     * Chart Type: Horizontal Bar Chart.
     * X-Axis: Total Authorization Scans (Last 24h).
     * Y-Axis: Zone Classifications (Public Lobby, Teller Corridors, Cash Vaults, Data Center, Executive Suite).
     * Data Displayed: Access Approved volume vs Access Denied attempts.
  2. *Cardholders per Access Level Tier:*
     * Chart Type: Donut Chart with center total count.
     * Slices: General Staff (68%), Branch Ops (22%), Armed Security (6%), Privileged IT/Vault (4%).
     * Data Displayed: Relative distribution of badge authorizations.
* **Tables:**
  1. *Master Access Level Definition Table:*
     * Columns: `Access Level Code`, `Access Level Name`, `Security Tier`, `Authorized Doors / Zones`, `Valid Time Schedule`, `Dual Authentication Required`, `Assigned Users Count`, `Last Modified By`, `Policy Status`, `Actions`.
     * Sorting: By `Security Tier DESC`, `Access Level Name ASC`.
     * Filtering: By Security Tier (`Tier-1 Vault`, `Tier-2 Sensitive`, `Tier-3 General`), Door Name, Schedule.
     * Export: Full Permission Matrix to encrypted CSV / PDF audit bundle.

### 4. User Interaction
* **View:** Expand any Access Level row to view full visual diagram of which physical doors are unlocked during which hours.
* **Search:** Search door by IP address, terminal serial, room label, or branch wing.
* **Filter:** Filter by access criteria (Biometric Only, Card Only, Multi-Factor Biometric+Card+PIN).
* **Approve / Reject:** Two-man rule approval interface: when an admin adds an employee to the Vault Access Group, a second senior security official must review and approve in the queue.
* **Lock / Unlock:** Direct manual override widget: `Lock Down Zone`, `Muster Evacuation Unlock`, `Resume Normal Schedule`.
* **Configure:** Drag-and-drop door association; assign time schedules with holiday exception calendars.

### 5. Data Requirements
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `access_level_id` | VARCHAR(32) | Primary alphanumeric code for the access privilege profile |
| `level_name` | VARCHAR(100) | Human-readable title (e.g., `HQ-Treasury-Armed-Vault-Staff`) |
| `security_tier` | INT | Security rating (1=Ultra-Secure Vault to 4=Perimeter Turnstile) |
| `door_ids_array` | JSON / ARRAY | List of physical door UUIDs bound to this privilege |
| `schedule_id` | VARCHAR(32) | Time schedule reference determining valid unlock hours |
| `dual_custody_enabled` | BOOLEAN | Flag enforcing two distinct cardholders within timeout |
| `custody_timeout_sec` | INT | Maximum window (seconds) between first and second badge swipe |
| `anti_passback_mode` | ENUM | `DISABLED`, `SOFT_APB` (Log only), `HARD_APB` (Deny entry) |

### 6. Permission Mapping
* **CEO / Executive Management:** View only; executive emergency veto privilege.
* **Security SOC Officer:** View access levels, manage temporary access permissions, trigger emergency lockdown.
* **HR Officer:** Read-only access to view employee access entitlements.
* **Branch Manager:** Request access level additions for branch staff (subject to SOC approval).
* **IT Administrator:** Full Administrative Access (Hardware association, IP controller linking, protocol binding).
* **Internal Auditor:** Read-only access to access control change logs, policy revisions, and dual-custody audit trails.

### 7. Responsive Design
* **Desktop (High-Resolution Control Desk):** Dual-pane tree and matrix configuration layout, drag-and-drop privilege assignment, full interactive door map overlay.
* **Tablet (Site Security Supervisor):** Collapsible accordion zone lists, card-based rule toggles, biometric override approval slider.
* **Mobile (Security Admin On-Duty):** Push notification approval cards for urgent temporary access requests with applicant details, reason, and `One-Tap Approve with TouchID/FaceID`.

---

# 5. Device & System Health UI Specification

### 1. Page Overview
* **Page Purpose:** Monitors real-time hardware health, network connectivity, firmware versions, tamper sensors, power supplies, and battery backup states across thousands of Suprema biometric readers, door controllers, and lock relays.
* **Target User Roles:** IT Infrastructure Engineer, Physical Security Field Support, Network Operations Center (NOC) Specialist.
* **Main Business Objective:** Maintain 99.99% hardware availability, proactively detect reader tampering or cable severance, prevent offline door vulnerabilities, and schedule automated firmware updates without disrupting banking operations.

### 2. UI Layout Specification
* **Header:**
  * **Page Title:** `Device Telemetry & Hardware Infrastructure Health`
  * **Date/Time:** Millisecond-accurate telemetry sync indicator (`Polling Interval: 10s`).
  * **User Profile:** IT Systems Administrator (`SecOps Infrastructure Lead`).
  * **Notifications:** Device offline alerts, power supply failover warnings, reader tamper trip notifications.
* **Main Content:**
  * **Top Metrics Ribbon:** Overall Device Uptime (`99.98%`), Total Devices Count, Online Count, Offline Count, Tamper Warnings.
  * **Charts (Middle Split 60/40):**
    * *Left:* Nationwide Hardware Connectivity Status & Latency Map (Latency jitter in ms).
    * *Right:* Device Model Distribution & Firmware Version Patch Compliance (Donut / Progress Bars).
  * **Tables (Bottom Full Width):** 
    * Real-Time Device Inventory, Status, and Diagnostics Table.
  * **Filters Bar:** Branch Selector, Device Type (`FaceStation F2`, `BioStation 3`, `CoreStation 40`, `Secure I/O 2`), Connection State (`Online`, `Degraded`, `Offline`, `Tamper`), Firmware State (`Current`, `Update Available`, `Vulnerable`).
  * **Action Buttons:** `Initiate Ping Sweep`, `Batch Push Firmware`, `Reboot Controller`, `Export Diagnostics Report`.
  * **Status Indicators:** Database Broker Sync (`Healthy - 1,200 msg/sec`), MQTT Gateway (`Connected`).

### 3. Dashboard Components
* **Cards:**
  1. *Total Network Devices:* Value `2,450 Units`, Data Source: `devices_master`.
  2. *Devices Currently Online:* Value `2,446 Units` (99.84% Availability - Green), Data Source: `devices_telemetry WHERE status='ONLINE'`.
  3. *Devices Offline / Unreachable:* Value `4 Units` (Red Alert - Field team dispatched), Data Source: `devices_telemetry WHERE status='OFFLINE'`.
  4. *Active Hardware Tamper Trips:* Value `1 Unit` (Tamper switch open at Branch 104 rear door), Data Source: `device_alarms WHERE alarm_type='TAMPER'`.
* **Charts:**
  1. *Reader Response Latency Trend:*
     * Chart Type: Multi-line Sparkline Area Chart.
     * X-Axis: Last 6 Hours (5-minute polling bins).
     * Y-Axis: Network Ping Round-Trip Time (0 to 300 ms).
     * Data Displayed: Core LAN Readers (Green, avg 12ms) vs Rural WAN Branches (Amber, avg 110ms).
  2. *Firmware Security Patch Compliance:*
     * Chart Type: Semi-Circle Gauge / Donut.
     * Data: Compliant with Latest Verified Firmware (96.2%), 1 Version Behind (3.1%), Critical Patch Required (0.7%).
* **Tables:**
  1. *Master Hardware Telemetry & Diagnostics Table:*
     * Columns: `Device Serial Number`, `Device Name`, `Model Type`, `Assigned Branch & Door`, `IP Address & MAC`, `Firmware Version`, `Heartbeat Ping (ms)`, `RS-485 Bus Health`, `Tamper Sensor`, `Power Source (PoE / Battery)`, `Status`, `Action Menu`.
     * Sorting: Default by `Status ASC` (Offline and Tampered devices stay on top); sortable by Ping, Branch, Model.
     * Filtering: Instant filter by Status (`Offline`, `Tamper`, `Online`), Device Model, Subnet.
     * Export: Export hardware inventory to CSV, JSON asset format for CMDB integration.

### 4. User Interaction
* **View:** Click any device row to open a Diagnostics Flyout showing CPU load, memory utilization, flash storage wear, temperature, and RS-485 loopback packet loss.
* **Search:** Search by MAC Address, IP Address, Device Name, or Serial Number.
* **Filter:** Filter by hardware class (Biometric Face, Biometric Finger, Multi-Door Master Controller, Slave Reader).
* **Approve / Reject:** Approve staged firmware deployment across branch device clusters.
* **Configure:** Set device IP settings (DHCP/Static), adjust biometric matching sensitivity threshold (Normal, High, Strict), update NTP server pool addresses.
* **Maintenance Actions:** `Remote Reboot Device`, `Sync Hardware Clock`, `Flush Offline Memory Cache`, `Run Self-Test Diagnostics`.

### 5. Data Requirements
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `device_id` | VARCHAR(32) | Suprema hardware serial number (e.g., `FSF2-54091823`) |
| `device_name` | VARCHAR(100) | Descriptive label (e.g., `BR-0104-Cash-Vault-Entry-Reader`) |
| `device_model` | VARCHAR(50) | Hardware family (`FaceStation F2`, `BioStation 3`, `CoreStation`) |
| `ip_address` | INET / VARCHAR(45) | IPv4/IPv6 assigned address on the banking secure VLAN |
| `mac_address` | MACADDR | Hardware MAC address for 802.1X port authentication |
| `firmware_version` | VARCHAR(24) | Active firmware build string (e.g., `v1.5.2-build2026`) |
| `last_heartbeat` | TIMESTAMP WITH TZ | Timestamp of latest successful keep-alive ping |
| `tamper_state` | BOOLEAN | Indicates whether optical or mechanical tamper switch is open |
| `power_mode` | ENUM | `POE_NORMAL`, `DC_AUX`, `BATTERY_BACKUP_ACTIVE`, `LOW_VOLTAGE` |

### 6. Permission Mapping
* **CEO / Executive Management:** View high-level system availability percentage only.
* **Security SOC Officer:** View device status and tamper alerts; cannot push firmware or change IP configurations.
* **HR Officer:** No Access.
* **Branch Manager:** View status of devices located inside their own branch.
* **IT Administrator:** Full Control (Reboot, Firmware update, IP configuration, Biometric database push).
* **Internal Auditor:** Read-only access to device change logs, tamper event history, and firmware validation logs.

### 7. Responsive Design
* **Desktop (IT NOC Wall & Engineering Workstation):** High-density 12-column grid, live status pills with real-time CSS pulse animations, rapid command-line action triggers.
* **Tablet (On-site Field Technician):** Barcode/QR scanner integration to scan reader physical label and jump directly to diagnostics screen; quick-toggle for "Put in Maintenance Mode".
* **Mobile (On-Call Infrastructure Engineer):** Push alerts for offline events: `CRITICAL: Branch 104 Vault Reader Unreachable`, with one-tap ping test and field technician dispatch coordinator.

---

# 6. Audit & Compliance UI Specification

### 1. Page Overview
* **Page Purpose:** Provides an immutable, cryptographically verifiable audit log of every physical access swipe, biometric verification attempt, alarm acknowledgment, security configuration modification, and user credential change for banking regulatory compliance.
* **Target User Roles:** Chief Compliance Officer, Internal Auditor, External Regulatory Inspector (Central Bank), Forensic Investigator.
* **Main Business Objective:** Satisfy statutory banking compliance mandates (PCI-DSS Section 9, ISO/IEC 27001 Annex A.11, Central Bank ICT Physical Security Guidelines) by preventing audit trail tampering and providing rapid forensic discovery.

### 2. UI Layout Specification
* **Header:**
  * **Page Title:** `Forensic Audit & Regulatory Compliance Ledger`
  * **Date/Time:** Verified Trusted Time Protocol (RFC 3161 cryptographic timestamping).
  * **User Profile:** Auditor Credential (`Lead Compliance Auditor - Internal Audit Div`).
  * **Notifications:** Compliance exception alerts, unverified credential alerts, log archive integrity alerts.
* **Main Content:**
  * **Compliance Posture Banner:** Regulatory Status (`100% COMPLIANT - WORM STORAGE SECURED`), Cryptographic Block Hash (`SHA-256 Verified`).
  * **Summary KPI Cards (Top):** 4 Cards (Total Audit Records Today, Failed Access Incidents, Privilege Modifications, Tamper Proof Checksum Status).
  * **Charts (Middle Split 50/50):**
    * *Left:* Access Rule Violations vs Escalations (Monthly Trend).
    * *Right:* Compliance Adherence Score by Branch Division (Radar / Spider Chart).
  * **Tables (Bottom Full Width):** 
    * Master Immutable System Audit Ledger with Cryptographic Hash Proof.
  * **Filters Bar:** Date & Time Range (Down to second precision), Audit Category (`Access Swipes`, `Configuration Edits`, `User Role Changes`, `Alarm Overrides`, `Dual-Custody Approvals`), Actor/User ID, Branch Locator, Outcome (`Success`, `Failure`, `Forced Action`, `Rejected`).
  * **Action Buttons:** `Generate Regulatory Compliance Pack (PDF/A-1b)`, `Verify Ledger Cryptographic Hashes`, `Export Audit Trail (JSON-LD Signed)`.
  * **Status Indicators:** WORM Storage State (`Write Once Read Many - Immutable`), Log Retention Counter (`7 Years Mandate - 2,555 Days Remaining`).

### 3. Dashboard Components
* **Cards:**
  1. *Total Audit Records (24h):* Value `248,190 Entries`, Data Source: `system_audit_ledger`.
  2. *Privilege Escalation Events:* Value `4 Modifications` (All dual-authorized), Data Source: `system_audit_ledger WHERE event_type='PRIVILEGE_CHANGE'`.
  3. *Unresolved Regulatory Exceptions:* Value `0 Exceptions` (Audit green state), Data Source: `compliance_exceptions WHERE resolved=FALSE`.
  4. *Cryptographic Ledger Integrity:* Value `VERIFIED VALID` (Block #8,941,203 verified against digital signature), Data Source: `audit_blockchain_hasher`.
* **Charts:**
  1. *Audit Event Volume by Regulatory Category:*
     * Chart Type: Multi-bar Comparative Grouped Bar Chart.
     * X-Axis: Last 7 Days.
     * Y-Axis: Total Audit Count.
     * Data Displayed: Physical Entries (Blue), Administrative Changes (Purple), Alarm Interventions (Amber), Biometric Enrollment Events (Teal).
  2. *Regional Branch Compliance Index:*
     * Chart Type: Radar Chart.
     * Axes: Dual-Custody Adherence, Timely Alarm Ack, Zero Tailgating, Log Retention, Visitor Escort Logging.
     * Data Displayed: Target Standard (100%) vs Actual Division Score.
* **Tables:**
  1. *Master Forensic Audit Trail Table:*
     * Columns: `Audit Record ID`, `Timestamp (UTC+6 Precision)`, `Actor (Who)`, `Role`, `Origin IP / Terminal`, `Action Taken (What)`, `Target Entity (Door/User/Config)`, `Old Value`, `New Value`, `Dual-Signer ID`, `Cryptographic Row Hash`, `Details`.
     * Sorting: Immutable `Timestamp DESC` (Strict chronological order).
     * Filtering: Advanced multi-parameter filter builder with Boolean logic (`AND`/`OR`).
     * Export: Export to ISO-standard PDF/A-1b with embedded X.509 digital certificate, secure CSV with SHA-256 manifest.

### 4. User Interaction
* **View:** Clicking any audit row opens the Forensic Evidence Card, rendering the full JSON delta payload (before vs after), associated CCTV snapshot if triggered by door swipe, and authorization signature metadata.
* **Search:** Full-text regex search across all actor IDs, action strings, and modified parameter values.
* **Filter:** One-click compliance presets: `Show All Vault Accesses`, `Show Admin Role Escalations`, `Show Override Dispatches`.
* **Export:** One-click generation of Central Bank Regulatory Examination Reports with automated table of contents and cryptographic validation appendix.
* **Verify:** Click `Verify Cryptographic Integrity` button executes a background hash-chain validation across all selected records, proving that no database records have been deleted, updated, or altered.

### 5. Data Requirements
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `audit_id` | UUID (v4) | Global unique identifier for audit log entry |
| `timestamp_utc` | TIMESTAMP(6) WITH TZ | Microsecond-accurate timestamp |
| `actor_user_id` | VARCHAR(32) | ID of the employee or admin performing the action |
| `actor_role` | VARCHAR(50) | Role at time of action execution |
| `action_category` | ENUM | `PHYSICAL_ACCESS`, `ADMIN_CONFIG`, `USER_MGMT`, `ALARM_DISPATCH`, `SECURITY_OVERRIDE` |
| `target_resource` | VARCHAR(100) | Specific door, user record, device, or system parameter modified |
| `previous_state` | JSONB | JSON representation of entity state prior to action |
| `new_state` | JSONB | JSON representation of entity state after action completion |
| `cryptographic_hash` | CHAR(64) | SHA-256 hash chaining this record to the previous row hash |
| `dual_signoff_user_id`| VARCHAR(32) | ID of second authorizer if action fell under dual-control policy |

### 6. Permission Mapping
* **CEO / Executive Management:** Read-only access to compliance reports and audit summaries.
* **Security SOC Officer:** Read-only access to operational logs; strictly forbidden from viewing or modifying admin audit records.
* **HR Officer:** Read-only access to HR-related audit actions (e.g., who regularized an attendance record).
* **Branch Manager:** Read-only view restricted to physical access logs within their branch.
* **IT Administrator:** Read-only view of technical operational logs (Strictly no delete or update privileges on audit tables).
* **Internal Auditor:** Highest privileged audit consumer: full read-only access to all logs, ability to generate formal compliance certificates, view hash verifications.

### 7. Responsive Design
* **Desktop (Auditor Workstation):** Wide data grid with collapsible JSON diff viewer, side-by-side comparison panels for modified configuration values, persistent filter drawer.
* **Tablet (Auditor On-Site Branch Inspection):** Audit verification checklist mode, quick tap to spot-check the last 50 vault entries at the current branch, digital signature signing for inspection sign-offs.
* **Mobile (Compliance Executive):** Read-only KPI overview with weekly compliance summary push reports; instant notification if an unauthorized privilege escalation is attempted.

---

# 7. Reporting Center UI Specification

### 1. Page Overview
* **Page Purpose:** Serves as the centralized enterprise business intelligence and reporting engine for physical security, time and attendance, incident history, and hardware metrics. Enables automated scheduling, custom query generation, and distribution to executive stakeholders and regulators.
* **Target User Roles:** Head of Security, HR Analytics Lead, Branch Operations Coordinator, Compliance Reporting Officer.
* **Main Business Objective:** Transform raw security and attendance telemetry into actionable business intelligence, automate recurring regulatory filings, and provide executive decision-makers with data-backed security posture analytics.

### 2. UI Layout Specification
* **Header:**
  * **Page Title:** `Enterprise Reporting Center & Business Intelligence`
  * **Date/Time:** Report generation date picker with custom fiscal quarter presets.
  * **User Profile:** Reporting Specialist (`Business Intelligence Analyst`).
  * **Notifications:** Alerts for completed background report generation jobs, scheduled dispatch confirmations.
* **Main Content:**
  * **Report Template Hub (Top Section):** Categorized report tiles (Physical Security, Attendance & HR, Device Telemetry, Executive Risk).
  * **Center Split Layout (60/40):**
    * *Left (60%):* Dynamic Interactive Report Builder (Query filters, dimension aggregators, metric selectors).
    * *Right (40%):* Live Report Preview & Visual Graph Generator (Real-time sample chart and data preview before generation).
  * **Bottom Section (Full Width):** 
    * Scheduled Automated Report Dispatch Register (Shows active daily/weekly/monthly cron schedules, recipients, format, and last delivery status).
  * **Filters Bar:** Category Filter, Frequency (`One-Time`, `Daily`, `Weekly`, `Monthly`, `Quarterly`), Output Format (`PDF`, `XLSX`, `CSV`), Department.
  * **Action Buttons:** `Run Custom Report`, `Save as Template`, `Schedule Automated Dispatch`, `Manage Distribution Lists`.
  * **Status Indicators:** Report Generation Engine (`Idle - Ready`), Export Storage Quota (`12% Used of 500GB`).

### 3. Dashboard Components
* **Cards:**
  1. *Total Reports Generated (M-T-D):* Value `1,842 Reports`, Data Source: `reports_generated_log`.
  2. *Active Scheduled Reports:* Value `48 Schedules` (Dispatched automatically to 210 recipients), Data Source: `report_schedules WHERE active=TRUE`.
  3. *Most Requested Report Template:* Value `Branch Vault Access Audit` (412 runs), Data Source: `report_templates_usage`.
  4. *Scheduled Deliveries Today:* Value `14 Pending Dispatch` (Scheduled at 23:59:00), Data Source: `report_schedules_queue`.
* **Charts:**
  1. *Report Generation Demand Trend:*
     * Chart Type: Stacked Area Chart.
     * X-Axis: Last 30 Days.
     * Y-Axis: Total Reports Generated.
     * Data Displayed: HR Attendance Reports (Blue), Security Incident Reports (Red), Audit Dumps (Green).
  2. *Distribution by Output Format:*
     * Chart Type: Donut Chart.
     * Slices: Encrypted PDF (58%), Excel Spreadsheet (32%), Raw CSV (10%).
* **Tables:**
  1. *Scheduled Report Distribution & Delivery Log Table:*
     * Columns: `Schedule ID`, `Report Name`, `Category`, `Frequency & Run Time`, `Recipient Distribution List`, `Format`, `Last Run Date`, `Delivery Status`, `Next Scheduled Run`, `Actions (Run Now / Edit / Pause)`.
     * Sorting: By `Next Scheduled Run ASC`, `Report Name ASC`.
     * Filtering: By Category, Status (`Delivered`, `Failed`, `Running`), Format.
     * Export: Export schedule catalog to CSV.

### 4. User Interaction
* **View:** Click `Preview Report` to instantly generate an in-browser 10-row sample with live charts before initiating a massive nationwide 50,000-row batch export.
* **Search:** Search report templates by keywords (e.g., "Vault", "Late Attendance", "Tailgating", "PCI Compliance").
* **Filter:** Filter reports library by regulatory standard (e.g., `Central Bank Mandated`, `HR Internal`, `SOC Operational`).
* **Configure:** Visual drag-and-drop report column builder: add/remove fields, set sorting hierarchy, configure grouping by Branch or Region.
* **Schedule:** Multi-step wizard to set recurring cron triggers, specify encrypted email recipient lists, SFTP destination servers, or webhook notifications.
* **Export:** Direct one-click export into high-fidelity PDF with banking logo, watermarking, and digital signatures; or raw unformatted data for downstream data warehouse ingestion.

### 5. Data Requirements
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `report_job_id` | UUID (v4) | Unique execution identifier for report task |
| `template_id` | VARCHAR(32) | Reference to pre-configured query template |
| `report_title` | VARCHAR(150) | Human-readable title of generated report document |
| `query_parameters` | JSONB | Filter parameters applied (Date range, Branch IDs, Roles) |
| `output_format` | ENUM | `PDF_A`, `EXCEL_XLSX`, `CSV_STREAM`, `JSON_DATA` |
| `generated_by_user` | VARCHAR(32) | User ID who requested or scheduled the report |
| `execution_duration_ms`| INT | Query performance metric in milliseconds |
| `file_size_bytes` | BIGINT | Size of generated deliverable artifact |
| `destination_target` | VARCHAR(255) | Email distribution alias, SFTP endpoint, or local download link |

### 6. Permission Mapping
* **CEO / Executive Management:** Access to Executive Board Summaries and Strategic Risk reports.
* **Security SOC Officer:** Access to Security Incident, Alarm Response, and Guard Patrol reports.
* **HR Officer:** Access strictly to Attendance, Shift Punctuality, and Overtime reports.
* **Branch Manager:** Access to generate branch-specific performance, attendance, and local visitor logs.
* **IT Administrator:** Access to Hardware Telemetry, Network Latency, and Device Uptime reports.
* **Internal Auditor:** Full Access to all Audit, Compliance, Access Privilege, and System Modification reports.

### 7. Responsive Design
* **Desktop (Analytics Console):** Comprehensive query builder workspace, split-pane interactive data preview, drag-and-drop column organizer.
* **Tablet (Manager Tablet):** Clean card grid of pre-built "One-Tap Reports" (e.g., `Today's Branch Attendance Summary`), with direct "Send to My Email" button.
* **Mobile (Executive On-The-Go):** Mobile-optimized report library allowing executive to view synthesized 1-page PDF summaries directly in mobile viewer.

---

# 8. Organization UI Specification

### 1. Page Overview
* **Page Purpose:** Models and maintains the enterprise banking organizational hierarchy, including corporate divisions, regional territories, branch classifications, departments, physical zones, and guard station assignments.
* **Target User Roles:** Enterprise Operations Architect, Head of HR Administration, Corporate Security Director.
* **Main Business Objective:** Establish a unified, authoritative structural hierarchy that binds organizational banking units to physical buildings, branches, and security zones, ensuring accurate role-based access inheritance.

### 2. UI Layout Specification
* **Header:**
  * **Page Title:** `Banking Organizational Hierarchy & Branch Directory`
  * **Date/Time:** Current Administrative Session Timestamp.
  * **User Profile:** Corporate Operations Admin (`Enterprise Organization Director`).
  * **Notifications:** Branch status change alerts, unassigned zone warnings.
* **Main Content:**
  * **Top Metrics Banner:** Total Operating Divisions, Total Active Branches, Total Mapped Security Zones, Unassigned Physical Spaces.
  * **Main Center Split Layout (40/60):**
    * *Left (40%):* Interactive Dynamic Tree View of Banking Hierarchy:
      * `Head Office Corporate Campus`
        * `Tower 1 - Executive & Treasury`
          * `Floor 18 - Boardroom & Executive Suite (Zone 1)`
          * `Floor 04 - Core Data Center (Zone 1)`
        * `Tower 2 - Operations & Retail Support`
      * `Regional Divisions`
        * `Dhaka North Division (142 Branches)`
          * `Gulshan Corporate Branch [BR-0012] (Tier-A)`
          * `Banani Branch [BR-0018] (Tier-B)`
    * *Right (60%):* Organizational Unit / Branch Detail Inspector & Configuration Panel:
      * Branch Metadata, Physical Address, Geolocation coordinates.
      * Assigned Branch Manager & Security Officer in Charge.
      * Bound Physical Zones & Door Groupings.
      * Associated Biometric Controllers & Guard Posts.
  * **Action Buttons:** `Add Branch / Unit`, `Import Hierarchy from HRMS`, `Reorganize Territory Tree`, `Export Structural Directory`.
  * **Status Indicators:** HRMS Directory Sync (`Synchronized 4 mins ago`), Branch Geo-Mapping (`100% Geocoded`).

### 3. Dashboard Components
* **Cards:**
  1. *Total Banking Branches:* Value `842 Branches` (All 64 districts nationwide), Data Source: `branches_master`.
  2. *Operating Divisions:* Value `8 Regional Divisions`, Data Source: `organization_divisions`.
  3. *Total Mapped Physical Zones:* Value `3,410 Zones` (Vaults, Cash Counters, Server Rooms, General Banking), Data Source: `security_zones_master`.
  4. *Branches Requiring Security Audit:* Value `2 Locations` (Newly commissioned branches), Data Source: `branches_master WHERE audit_status='PENDING'`.
* **Charts:**
  1. *Branch Tier Distribution:*
     * Chart Type: Donut Chart.
     * Categories: Tier-A Flagship Branches (15%), Tier-B Standard Commercial (65%), Tier-C SME / Rural Outposts (20%).
     * Data Displayed: Relative count of branches by operational security class.
  2. *Security Zones per Branch Density:*
     * Chart Type: Column Histogram.
     * X-Axis: Number of Physical Security Zones (2 to 12).
     * Y-Axis: Count of Branches.
     * Data Displayed: Shows physical complexity of facility security layouts.
* **Tables:**
  1. *Master Branch & Organizational Directory Table:*
     * Columns: `Branch Code`, `Branch Name`, `Division / Region`, `Branch Tier`, `Branch Manager Name`, `SOC Contact Phone`, `Total Assigned Doors`, `Active Employee Headcount`, `Operating Status`, `Actions (Inspect / Edit / Decommission)`.
     * Sorting: Default by `Branch Code ASC`; sortable by Division, Tier, Headcount.
     * Filtering: By Division, Branch Tier, Status (`Active`, `Renovation`, `Opening Soon`, `Closed`).
     * Export: Export corporate directory to Excel, JSON hierarchy schema.

### 4. User Interaction
* **View:** Click any node in the left-hand hierarchy tree to dynamically update the right-hand panel with that unit's full physical and staff profile.
* **Search:** Search branches by Branch Code, Routing Number, City, or Manager Name.
* **Filter:** Filter tree view to show only branches with Tier-1 High-Value Vault facilities.
* **Approve / Reject:** Approve structural changes (e.g., moving a branch to a new division or modifying a vault zone boundary) requiring dual-control sign-off.
* **Configure:** Assign physical doors to specific organizational departments; define opening/closing branch operating hours.

### 5. Data Requirements
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `org_unit_id` | VARCHAR(32) | Unique hierarchical node identifier |
| `parent_unit_id` | VARCHAR(32) | Parent node reference (Null for Head Office Root) |
| `unit_name` | VARCHAR(150) | Official corporate unit title |
| `unit_type` | ENUM | `HEAD_OFFICE`, `DIVISION`, `REGIONAL_HUB`, `BRANCH`, `SUB_BRANCH`, `ATM_BOOTH` |
| `branch_code` | VARCHAR(10) | Formal banking routing/branch identifier (e.g., `BR-0104`) |
| `branch_tier` | ENUM | `TIER_A_FLAGSHIP`, `TIER_B_COMMERCIAL`, `TIER_C_RURAL` |
| `assigned_manager_id` | VARCHAR(32) | Corporate Employee ID of the Branch Manager |
| `latitude` | DECIMAL(10,8) | GPS latitude for geospatial security mapping |
| `longitude` | DECIMAL(11,8) | GPS longitude for geospatial security mapping |
| `operating_status` | ENUM | `ACTIVE`, `TEMPORARY_CLOSURE`, `UNDER_CONSTRUCTION`, `DECOMMISSIONED` |

### 6. Permission Mapping
* **CEO / Executive Management:** Full view of organizational structure, territorial distribution, and headcount balance.
* **Security SOC Officer:** View branch directory, emergency contact numbers, and security zone mapping.
* **HR Officer:** Manage organizational tree, departmental assignments, and job title alignments.
* **Branch Manager:** View own branch details; request updates to branch contact personnel.
* **IT Administrator:** Map physical network controllers and IP subnets to organizational branch units.
* **Internal Auditor:** Read-only access to branch opening/closing logs, boundary changes, and hierarchy audit trails.

### 7. Responsive Design
* **Desktop (Corporate Operations Desk):** Dual-column layout (Tree on Left, Deep Property Inspector on Right) with fluid drag-and-drop restructuring capability.
* **Tablet (Regional Director Tablet):** Collapsible drill-down hierarchy list with map view toggle showing branches pinned geographically across the country.
* **Mobile (Field Auditor / Security Patrol):** Clean branch contact directory with direct one-tap "Call Branch Manager" or "Initiate Emergency SOC Hotline" links.

---

# 9. User Management UI Specification

### 1. Page Overview
* **Page Purpose:** Manages the entire lifecycle of all human identities interacting with the physical banking infrastructure, including employee biometric credentials (Face templates, Fingerprint templates), smart cards, visitor badges, contractor passes, privileged operator accounts, and dual-custody approval roles.
* **Target User Roles:** Biometric Enrollment Specialist, Identity & Access Management (IAM) Administrator, HR Security Coordinator, SOC User Admin.
* **Main Business Objective:** Maintain an uncompromised physical identity directory, enforce strict biometric enrollment standards using Suprema BioStar X protocols, prevent credential duplication or ghost employees, and instantly revoke physical access upon employee termination.

### 2. UI Layout Specification
* **Header:**
  * **Page Title:** `Enterprise Identity & Biometric Credential Lifecycle Management`
  * **Date/Time:** Live Administrative Clock.
  * **User Profile:** IAM Administrator Badge (`Tier-1 Enrollment Officer`).
  * **Notifications:** Pending credential approvals, expiring visitor passes, un-enrolled new hires.
* **Main Content:**
  * **Sub-Navigation Tabs:** 
    * `Bank Employees` | `Contractors & Guards` | `Visitor Management` | `Biometric Enrollment Station` | `Privileged System Roles`.
  * **Top Metrics Summary Cards (Top):** Total Enrolled Users, Biometric Complete (Face/Finger), Active Smart Cards, Revoked / Suspended Badges.
  * **Main Split Workstation (Middle & Bottom):**
    * *Top Filter & Search Bar:* High-speed multi-attribute identity search.
    * *Master Identity Table (Full Width):* Detailed user table with biometric status indicators, assigned access levels, and status pills.
  * **Action Buttons:** `Enroll New Identity`, `Launch Suprema USB Biometric Scanner`, `Batch Issue Cards`, `Emergency Instant Revocation`, `Synchronize with Active Directory / HRMS`.
  * **Status Indicators:** Suprema USB Scanner Link (`Connected - BioMini Plus 2 Ready`), Active Directory Sync (`In Sync - 0 Discrepancies`).

### 3. Dashboard Components
* **Cards:**
  1. *Total Active Identities:* Value `18,450 Cardholders`, Data Source: `users_master WHERE status='ACTIVE'`.
  2. *Biometrically Verified:* Value `18,412 Users` (99.8% enrolled with Face + Fingerprint), Data Source: `biometrics_ledger WHERE template_count >= 2`.
  3. *Active Physical Smart Cards:* Value `19,102 Cards` (Includes dual-token cards), Data Source: `cards_master WHERE card_status='ACTIVE'`.
  4. *Revoked / Suspended Users:* Value `84 Users` (Access disabled - Terminated / Suspended), Data Source: `users_master WHERE status='REVOKED'`.
* **Charts:**
  1. *Biometric Enrollment Type Breakdown:*
     * Chart Type: Multi-category Donut Chart.
     * Categories: Suprema FaceStation F2 Face Template (52%), Optical Fingerprint (44%), Smart Card Only / Exempt (4%).
     * Data Displayed: Relative credential distribution across the workforce.
  2. *Monthly Identity Onboarding vs Offboarding:*
     * Chart Type: Bi-directional Bar Chart.
     * X-Axis: Last 6 Months.
     * Y-Axis: User Count.
     * Data Displayed: New Enrollments (Green positive bars) vs Terminations/Revocations (Red negative bars).
* **Tables:**
  1. *Master Enterprise Identity & Credential Register:*
     * Columns: `Photo`, `Employee ID`, `Full Name`, `Department`, `Branch / Base`, `Identity Type (Staff/Visitor/Contractor)`, `Access Level Group`, `Biometric Enrollment (Face / Finger Status Icons)`, `Card CSN / Wiegand Hex`, `Expiry Date`, `Account Status`, `Actions`.
     * Sorting: Default by `Employee ID ASC`; sortable by Full Name, Department, Expiry Date.
     * Filtering: By Identity Type, Enrollment Completeness (`Missing Face`, `Missing Finger`, `Complete`), Status (`Active`, `Suspended`, `Revoked`, `Expired`).
     * Export: Export identity roster to encrypted Excel, audit CSV format.

### 4. User Interaction
* **View:** Clicking any user row opens the full 360-degree Identity Profile Drawer:
  * Profile Photo, official Core Banking Staff ID, National ID (NID).
  * Biometric Template Quality Scores (e.g., Face Template Quality: 98%, Fingerprint Minutiae Points: 64).
  * History of doors accessed in the last 48 hours.
  * List of assigned physical keys, smart cards, and mobile NFC passes.
* **Search:** High-performance instant search by Employee Name, Staff ID, Card Number (CSN), or NID.
* **Filter:** One-click filter chips: `New Hires Missing Biometrics`, `Badges Expiring in 7 Days`, `Locked Out Accounts`.
* **Approve / Reject:** Identity issuance workflow: new high-tier access requests submitted here require secondary authorization by the Branch Manager or Head of Security before badges become active.
* **Lock / Unlock:** Instant administrative action buttons:
  * `Instant Revoke Access` (Deactivates credentials nationwide in <1 second across all 842 controllers).
  * `Suspend Temporarily` (For staff on disciplinary leave or sabbatical).
  * `Reactivate Credentials` (Requires supervisor authentication).
* **Configure:** Launch real-time Biometric Capture Wizard directly through Suprema WebAgent / USB scanner interface to enroll fingers or high-resolution facial feature vectors.

### 5. Data Requirements
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `user_id` | UUID (v4) | Global unique internal identity identifier |
| `employee_id` | VARCHAR(32) | Official banking employee/payroll identifier |
| `first_name` | VARCHAR(50) | Legal first name |
| `last_name` | VARCHAR(50) | Legal last name |
| `email` | VARCHAR(100) | Corporate banking email address |
| `phone_number` | VARCHAR(20) | Registered mobile phone for SMS security alerts |
| `user_type` | ENUM | `BANK_STAFF`, `CONTRACTOR`, `ARMED_GUARD`, `EXECUTIVE`, `TEMPORARY_VISITOR` |
| `access_level_id` | VARCHAR(32) | Reference to assigned physical access control profile |
| `card_csn` | VARCHAR(32) | Mifare / DESFire EV3 smart card chip serial number |
| `face_enrolled` | BOOLEAN | Indicates presence of verified Suprema Face template |
| `fingerprint_enrolled` | BOOLEAN | Indicates presence of verified fingerprint minutiae |
| `biometric_template_data`| BLOB / ENCRYPTED | Encrypted biometric feature vector (BioStar standard) |
| `valid_from` | TIMESTAMP WITH TZ | Credential activation timestamp |
| `valid_to` | TIMESTAMP WITH TZ | Credential expiration timestamp |
| `user_status` | ENUM | `ACTIVE`, `PENDING_ENROLLMENT`, `SUSPENDED`, `REVOKED`, `TERMINATED` |

### 6. Permission Mapping
* **CEO / Executive Management:** View only.
* **Security SOC Officer:** View user profiles, issue temporary visitor day-passes, execute emergency badge suspensions.
* **HR Officer:** Create new employee records, update employee departments/transfers, flag employee terminations.
* **Branch Manager:** View branch personnel profiles; request access modifications for branch staff.
* **IT Administrator / IAM Lead:** Full Administrator Access (Enroll biometrics, issue smart cards, assign access profiles, manage privileged system operator accounts).
* **Internal Auditor:** Read-only access to user credential creation logs, revocation timestamps, and biometric modification trails.

### 7. Responsive Design
* **Desktop (Enrollment Station Workstation):** Dual-monitor optimized layout with embedded high-resolution webcam/biometric capture widget, real-time template quality score gauges, full identity table.
* **Tablet (Reception / Security Desk Check-in):** Touch-friendly visitor onboarding screen: scan visitor government ID / business card, capture photo via tablet camera, issue temporary NFC visitor card.
* **Mobile (Branch Security Guard):** Rapid QR / Badge verification mode: scan any employee badge to display full employee photo, verified role, and access rights directly on guard's mobile handheld.

---

## Master Permission Matrix Summary Across All Modules

| Locked Navigation Module | CEO / Exec | SOC Officer | HR Officer | Branch Manager | IT Admin | Internal Auditor |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Executive Dashboard** | **Full (Auth)** | View Only | Restricted | Branch View | System KPIs | Audit Read |
| **Security Operations** | View Only | **Full Control** | No Access | Local Branch | Tech Telemetry | Audit Read |
| **Attendance Analytics** | Analytical | Safety View | **Full Admin** | Branch Staff | Sync Status | Audit Read |
| **Access Control** | Veto Only | Ops Admin | Read Only | Request Only | **Full Admin** | Policy Audit |
| **Device & System Health**| Overview | Tamper View | No Access | Branch Devices | **Full Admin** | Hardware Logs |
| **Audit & Compliance** | Summary | Read Only | HR Actions | Local Logs | Read Only | **Full Admin** |
| **Reporting Center** | Exec Reports | Sec Reports | HR Reports | Branch Reports | Tech Reports | **Full Reports** |
| **Organization** | View Only | View / SOS | HR Admin | Own Branch | Network Map | Structure Audit |
| **User Management** | View Only | Visitor / Revoke| Employee HR | Branch Staff | **Full IAM** | Access Audit |

---

## Global Design System & UI Styling Specifications

* **Design Inspiration:** Suprema BioStar 2 / BioStar X Enterprise Architecture combined with Tier-1 Banking Control Room Standards.
* **Color Palette:**
  * **Primary Cobalt Blue:** `#0052CC` (Brand accents, primary actions, active tabs).
  * **Deep Navy Blue:** `#091E42` (Headers, high-contrast control room panels, navigation base).
  * **Background Neutral:** `#F4F5F7` (High readability, low eyestrain workspace canvas).
  * **Card & Surface White:** `#FFFFFF` (Clean cards with subtle 1px border `#DFE1E6`).
  * **Status Green (Success / Locked):** `#00875A` (Door secure, verified biometric match, online).
  * **Status Amber (Warning / Held):** `#FFAB00` (Door held open, late arrival, expiring card).
  * **Status Red (Critical / Intrusion):** `#DE350B` (Forced entry, duress alarm, tamper, offline reader).
* **Typography:** Modern clean sans-serif typography (`Inter`, `Segoe UI`, `-apple-system`).
* **Micro-Interactions & Security UX:**
  * No loud or decorative animations; strictly functional transitions (150ms ease-in-out).
  * High-visibility status badges with uppercase micro-labels (`CRITICAL`, `ARMED`, `LOCKED`).
  * Critical actions (Lockdown, Instant Revoke, Dual-Custody Approval) are guarded by two-step modal confirmations with operator reason code logging.
