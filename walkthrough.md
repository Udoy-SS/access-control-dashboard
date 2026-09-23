# Suprema Biometric Solution Dealer Management Platform - Enterprise Dashboard UI

A dedicated enterprise web dashboard UI built for managing **Suprema Access Control (ACS)** and **Time Attendance (TA)** deployments for large banking institutions, custom-tailored for **Pubali Bank PLC**.

Designed with inspiration from **Suprema BioStar 2 Enterprise UI**: clean white/slate banking software interface, professional blue/cyan theme, minimal rounded cards, high readability, and desktop-first responsive design.

---

## 1. System Structure & Navigation Architecture

### Main Navigation Sidebar (`SidebarNav.jsx`)
The collapsible/expandable sidebar provides direct access to all biometric and physical access domains:

* **Dashboard** (Live Central Overview)
* **Organization**:
  * Bank (`Pubali Bank PLC`)
  * Head Office (`Principal Central HQ, Motijheel`)
  * Region Office (`27 Regional Zones`)
  * Branch (`519 Full Service Branches`)
  * Sub Branch (`281 Feeder Sub-Branches`)
* **Access Control**:
  * Door Monitoring (`1,635 Active Secured Doors`)
  * Access Group (`24 Security Clearance Groups`)
  * Access Level (`12 Tiered Access Levels`)
  * Permission Management (`Interlock & Time-Lock Policies`)
* **Time Attendance**:
  * Employee Attendance (`Live Punch Sync`)
  * Shift Management (`Banking Shifts`)
  * Late/Early Report (`Late Arrival Telemetry`)
  * Monthly Attendance (`HR Roster Timesheet`)
* **Device Management**:
  * Device List (`1,250 BioStar 2 Terminals`)
  * Online Device (`1,238 Active`)
  * Offline Device (`12 Flagged for Service`)
  * Firmware (`v2.9.4 Fleet Deployment`)
  * Warranty (`Active SLA Coverage`)
* **Reports**:
  * User Report (`35,000 Credentialed Staff`)
  * Access Report (`15,270 Event Logs`)
  * Device Report (`Hardware Telemetry`)
  * Attendance Report (`Daily / Monthly Breakdown`)

---

## 2. Dashboard Page (`EnterpriseDashboardView.jsx`)

### Top Header Bar (`SupremaTopHeader.jsx`)
* **Customer**: `Pubali Bank` (Enterprise ACS selector)
* **Branch Filter**: `All Branch` (with instant search and direct branch selector)
* **Date Filter**: `Today` | `Week` | `Month` | `Year`
* **Dealer Actions**: "Branch Detail (Dhanmondi)" quick trigger & "Sync Terminals" action.

### 5 Required KPI Cards
| KPI | Value | Status & Context |
| :--- | :--- | :--- |
| **1. Total Branch** | **520** | 519 Branches + 1 Principal Head Office |
| **2. Total Suprema Device** | **1,250** | Connected BioStar 2 Terminals |
| **3. Online Device** | **1,238** | 99.04% Operational Uptime (Healthy) |
| **4. Offline Device** | **12** | Flagged for Dealer Field Support |
| **5. Total Employee** | **35,000** | Enrolled Biometric Card/Face/Finger Profiles |

### Main Overview Security Monitoring Chart
Pure multi-line SVG curve graph showing hourly bank security telemetry:
* 🔵 **Blue Line**: **Successful Access Events**
* 🟠 **Orange Line**: **Access Denied**
* 🔴 **Red Line**: **Door Alarm / Tamper**
* 🟢 **Green Line**: **Attendance Punch**

### Right Side Circular Summary
* **Total Events**: **15,270**
* Radial Donut gauge with breakdown:
  * Successful Access: 11,420 (74.8%)
  * Attendance Punches: 3,450 (22.6%)
  * Access Denied: 310 (2.0%)
  * Door Alarm / Tamper: 90 (0.6%)

### Organization Monitoring Section
Visual hierarchy tree displaying:
$$\text{Pubali Bank} \longrightarrow \text{Head Office} \longrightarrow \text{Region Office} \longrightarrow \text{Branch}$$

Each branch node features live Suprema device status pills:
* 🟢 **Green**: All device online
* 🟡 **Yellow**: Attendance sync issue
* 🔴 **Red**: Device offline

Clicking any branch (e.g. **Dhanmondi Branch**) instantly opens the **Branch Detail View**.

### 5 Usage Module Cards
1. **User Management** (Icon: User, Total User: **35,000**)
2. **Access Control** (Icon: Door Lock, Active Door: **1,635**)
3. **Time Attendance** (Icon: Fingerprint, Today's Attendance: **32,840 Present**, 93.8% Punch Rate)
4. **Device Management** (Icon: Device, Online/Offline: **1,238 / 12**)
5. **Reports** (Icon: Report, Direct access to BioStar 2 Report Hub)

---

## 3. Branch Detail View (`BranchDetailModal.jsx`)

Inspecting **Dhanmondi Branch** renders:
* **Branch Information**:
  * Branch Code: `BR-0142`
  * Address: `House 42, Road 7, Dhanmondi R/A, Dhaka-1205`
  * Zone: `Dhaka South Region`
  * Routing Number: `175260142`
* **Device Telemetry**:
  * **FaceStation F2**: Status: `Online` (IP: `10.14.20.101`, Firmware: `v1.5.2`, Location: Main Entrance Lobby Turnstile)
  * **BioStation 2**: Status: `Online` (IP: `10.14.20.102`, Firmware: `v2.1.0`, Location: Server Room & Vault Airlock)
* **Access Control Status**:
  * **Main Door**: `Locked` (Relay 1 Fail-Secure, Sensor: Closed, Tamper: Normal)
  * **Server Room**: `Locked` (Relay 2 High-Security Interlock, Dual-Credential Bio+PIN, Tamper: Normal)
* **Attendance Breakdown**:
  * **Employees**: `150`
  * **Present**: `138` (92.0% on-time)
  * **Absent**: `12` (8.0% leave/unpunched)
* **Map Style Branch Monitoring View**:
  * **Architectural Security Floor Plan**: Interactive 2D security layout displaying Entrance Turnstiles, FaceStation F2 placement, Cash Tellers, and Server Room/Vault BioStation 2 airlocks.
  * **Geographical Zone Map**: Dhaka South WAN connection link linking Head Office (Motijheel) $\to$ Regional Office $\to$ Dhanmondi Branch with 3.8ms round-trip latency.

---

## 4. BioStar 2 Reports Page (`BioStarReportPageView.jsx`)

4 large cards formatted identical to Suprema BioStar 2:
1. **USER REPORT**:
   * All User Report
   * Branch Wise User
   * Region Wise User
   * Department Wise User
2. **ACCESS REPORT**:
   * All Access Report
   * Branch Wise Access
   * Door Status Report
   * Access Group Report
   * Access Level Report
3. **DEVICE REPORT**:
   * Total Device Report
   * Branch Device Report
   * Active Device
   * Inactive Device
   * Device Status
4. **TIME ATTENDANCE REPORT**:
   * Daily Attendance
   * Monthly Attendance
   * Late Report
   * Absent Report
   * Overtime Report

Each option opens an interactive audit preview with instantaneous **CSV / Excel** and **PDF Print** export.

---

## 5. Biometric Credential Realignment (Fingerprint & RFID Card Exclusivity)

Following institution operational security policy (bank branches utilizing strictly **Fingerprint** and **Smart Card / RFID Card** credentials):
* **Completely Excluded**: All `Visual Face` and `Face` badges, metrics, and data points removed from the usage metric summary bar across both React and static dashboard views.
* **Credential Metrics Realignment**: Usage bar status badges re-aligned to display:
  1. **User**: Total enrolled staff (`1,250`)
  2. **Fingerprint**: Total fingerprint templates enrolled (`1,150`)
  3. **Smart Card**: Total active RFID cards (`1,080`)
  4. **Device**: Active terminals (`48/48`, 100%)
  5. **Door**: Monitored doors (`12/60`, 20%)
  6. **Zone**: Access zones (`12`, 0.0%)
  7. **Access Group**: Total access groups (`300`)
* **Terminal Hardware Realignment**: Replaced all facial terminal entries (`FaceStation F2`, `FaceLite`) across database repositories, report mock generators, and telemetry models with **Suprema BioStation 3**, **BioEntry W2** (IP67 vandal-proof fingerprint), and **BioEntry P2** (slim fingerprint & smart card reader).
* **Reporting Engine Realignment**: Custom report generator, attendance logs, and report tables now filter and display exclusively `Fingerprint (FP)` and `Smart Card / RFID (Card)`.

---

---

## 7. BioStar 2 Enterprise Access Control Suite (`AccessControlPages.jsx`)

Redesigned to match the exact visual excellence, rich gradient top banners, 5 KPI cards, and interactive rounded chip/pill filters of **Time Attendance**:

### 🛡️ 1. Access Group (`AccessGroupPage`) · Indigo/Violet Banking Theme
* **Top Banner**: `linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4f46e5 100%)` with enterprise badge, 24/7 policy status, and live active indicators.
* **KPI Metrics**: 8 Clearance Groups, 2,696 Covered Doors, 18,690 Assigned Staff, 520 Dual-Custody Strong Rooms, 100% Central Sync.
* **Time Attendance-Style Filter Bar**: Search box with clear button, Scope category dropdown, **Interactive Rounded Tier Pills** (`[All Tiers]` `[Level 2]` `[Level 3]` `[Level 4]` `[Level 5]`), **Interactive Schedule Window Pills** (`[All Schedules]` `[Banking Hours]` `[24/7 Monitored]` `[Strict Dual Custody]`), record count, Reset, and gradient CSV export.
* **Interactive Policy Sheet Modal**: Inspect modal with security tier breakdown, authorized scopes, and BioStar Core sync action.

### 🏷️ 2. Access Level (`AccessLevelPage`) · Teal/Emerald Permission Theme
* **Top Banner**: `linear-gradient(135deg, #042f2e 0%, #0d9488 50%, #0284c7 100%)` with Level 5 Dual-Custody highlight and live pass metrics.
* **KPI Metrics**: 6 Clearance Tiers, Level 5 Dual Custody Vaults, 3 Anti-Passback Tiers, 18,873 Active Passes, Level 6 Executive Priority.
* **Time Attendance-Style Filter Bar**: Search box, Schedule Category dropdown, **Interactive Level Tier Pills** (`[All Levels]` `[Level 1]` to `[Level 6]`), **Interactive Auth Mode Pills** (`[All Auth]` `[Fingerprint + Card]` `[Dual Custody]` `[Multi-Factor + PIN]` `[Card / QR]`), record count, Reset, and CSV export.
* **Interactive Security Matrix Modal**: Visual cross-check table across Main Entry, Teller Safes, Record Archives, Server NOC, Vaults, and Boardroom.

### 🚪 3. Door Management (`DoorManagementPage`) · Blue/Cyan Banking Portal Theme
* **Top Banner**: `linear-gradient(135deg, #082f49 0%, #0369a1 45%, #0284c7 100%)` with real-time controller counters and live relay indicators.
* **KPI Metrics**: 2,696 Doors, 520 Strong Rooms, 1,658 Suprema Controllers, 100% Anti-Passback, 12ms Telemetry Latency.
* **Time Attendance-Style Filter Bar**: Search box, Division dropdown, **Interactive Hardware Pills** (`[All Locks]` `[Mag Lock]` `[Fail-Secure]` `[Interlock]` `[Turnstile]` `[Armored Vault]`), **Interactive Relay State Pills** (`[All States]` `[Locked]` `[Unlocked]` `[Override]`), Reset, and CSV export.
* **Remote Live Controls**: Interactive 5-second pulse unlock (`🔓 Unlock 5s`) with auto re-lock timer and emergency manual hold override.

### 📡 4. Door Status (`DoorStatusPage`) · High-Contrast Security & Alarm Telemetry
* **Top Banner**: `linear-gradient(135deg, #4c0519 0%, #9f1239 45%, #e11d48 100%)` with zero-delay telemetry badge and secured doors counter.
* **KPI Metrics**: Monitored Relays, Normal Secured Doors, Sensor Warnings, Active Tamper/Forced Alarms, 99.4% Circuit Continuity.
* **Time Attendance-Style Filter Bar**: Search box, Division dropdown, **Interactive Sensor Pills** (`[All Sensors]` `[Closed]` `[Open]` `[Held Open Warning]` `[Tamper Alert]`), **Interactive Loop Pills** (`[All Loops]` `[Normal]` `[Warning]` `[Alert]`), Reset, and CSV export.
* **Live Security Operations**: Dedicated Clear Alarm and Emergency Lockdown buttons with instantaneous telemetry reset.

---

## 8. Enterprise User Management & Biometric Branch Transfer (`UserManagementPage.jsx`)

Preserved existing biometric profiles (Fingerprint + RFID Card) with zero re-enrollment required when transferring staff between branches:

### 👥 1. Biometric User Directory & Terminal Synchronization
* **Credential Preservation**: Every staff profile holds registered **2 Fingerprint Templates** (ISO 19794-2 Minutiae) and **13.56 MHz RFID Smart Card** (CSN).
* **Direct BioStar 2 Mapping**: Each employee's biometric profile is synchronized with local branch Suprema terminals (`BioStation 3`, `BioEntry W2`, `CoreStation CS-40`).
* **5 KPI Cards**: Total Enrolled Staff (`35,000`), Fingerprint Templates (`70,000`), Active RFID Smart Cards (`35,000`), Biometric Shifted Profiles, and 99.8% Terminal Sync Health.
* **Unified Single-Row Filter Bar**: Search (ID, Name, Branch), Division dropdown, Department dropdown, Status pills (`[All Status]` `[Active Enrolled]` `[Transferred / Shifted]` `[Inactive]`), Reset, and CSV Export.

### 🔄 2. Automated Biometric Shift Pipeline on Branch Transfer
* **Interactive Modal (`TransferModal`)**:
  * **Current Assignment**: Displays employee's source branch and terminal controllers.
  * **Enrolled Biometric Guarantee**: Highlights existing Fingerprint & RFID card details with notice that re-enrollment is unnecessary.
  * **Destination Branch Selector**: Searchable list of all 829 Pubali Bank branches and upashakhas.
  * **Official Reference**: Transfer Order Reference Number (e.g., `PB-HO/HRD/TR-2026/4821`) and Effective Date.
  * **Automated BioStar Pipeline**:
    1. Revokes credential permissions from source branch controllers.
    2. Pushes existing fingerprint templates and RFID card number to destination branch controllers.
    3. Reassigns local access groups and shifts attendance rosters automatically.
* **Audit Trail Log Tab**:
  * Complete immutable history of all personnel transfers across branches with Previous Branch (Revoked), New Branch (Active), Transfer Order Ref, Date, and Biometric Shift Status.

---

## 9. Verification & Quality Check

* **Zero Design Degradation**: All previous modules (Access Control, Time Attendance, Dashboard, Reports, Device Pages) remain 100% untouched and intact.
* **Production Bundle**: Executed `npm run build` with Vite — compiled cleanly with 32 modules and 0 errors.
* **Dev Server**: Active on `http://localhost:3000` with instant HMR updates.

