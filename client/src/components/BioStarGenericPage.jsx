import React, { useState, useEffect, useMemo } from 'react';
import {
  FULL_PUBALI_LOCATIONS,
  NETWORK_STATISTICS
} from '../data/pubaliFullBranches';
import { getDevices, getDoors, getUsers } from '../services/api';
import AttendancePage from './AttendancePage';
import LateEarlyPage from './LateEarlyPage';
import MonthlyAttendancePage from './MonthlyAttendancePage';
import { DeviceListPage, DeviceStatusPage, ActiveDevicePage, InactiveDevicePage } from './DevicePages';
import { AccessGroupPage, AccessLevelPage, DoorManagementPage, DoorStatusPage } from './AccessControlPages';
import AccessControlSecurityDashboard from './AccessControlSecurityDashboard';
import UserManagementPage from './UserManagementPage';
import ShiftManagementPage from './ShiftManagementPage';
import LiveAccessEventsPage from './LiveAccessEventsPage';
import DailyAttendancePage from './DailyAttendancePage';
import OvertimeAnalyticsPage from './OvertimeAnalyticsPage';
import AttendanceExceptionHub from './AttendanceExceptionHub';
import { useBankFilters } from './filters/FilterContext';

// ─── STATUS BADGE COMPONENT ───────────────────────────────
function StatusBadge({ cell }) {
  if (['Online', 'Active', 'Present', 'Granted', 'Locked', 'Normal Locked', 'Healthy', 'In Sync', 'Optimal', 'Normal', 'Compliant'].includes(cell)) {
    return <span className="bs-badge bs-badge-green"><span className="bs-dot bs-dot-green"></span>{cell}</span>;
  }
  if (['Offline', 'Inactive', 'Denied', 'Door Forced Alarm', 'Timeout', 'Critical', 'Down', 'Short-Staffed Alert'].includes(cell)) {
    return <span className="bs-badge bs-badge-red"><span className="bs-dot bs-dot-red"></span>{cell}</span>;
  }
  if (['Late', 'Absent', 'Unlocked', 'Sync Issue', 'Tamper Alert', 'Partial', 'High Latency', 'Degraded', 'Standby Sync', 'Warning', 'Minor Review'].includes(cell)) {
    return <span className="bs-badge bs-badge-amber"><span className="bs-dot bs-dot-amber"></span>{cell}</span>;
  }
  return <span className="bs-badge bs-badge-gray">{cell}</span>;
}

// ─── DYNAMIC DATA FACTORY FOR SUB-PAGES ───────────────────
function usePageData(pageId) {
  return useMemo(() => {
    switch (pageId) {
      // 1. User Management
      case 'users': {
        const rows = [];
        FULL_PUBALI_LOCATIONS.forEach(loc => {
          if (loc.employees) {
            loc.employees.forEach(emp => {
              rows.push([
                emp.id,
                emp.name,
                loc.name,
                loc.type === 'head-office' ? 'Head Office Management' : (loc.type === 'islamic' ? 'Islamic Banking Wing' : 'Branch Banking'),
                'Fingerprint + RFID Card',
                'Enrolled',
                emp.status === 'Absent' ? 'Inactive' : 'Active'
              ]);
            });
          }
        });
        return {
          title: 'User Management',
          subtitle: `${rows.length} biometric enrolled users across Pubali Bank`,
          columns: ['User ID', 'Full Name', 'Branch / Location', 'Department', 'Biometric Mode', 'Enrollment', 'Status'],
          rows
        };
      }

      // 2. Access Groups
      case 'access-group': {
        return {
          title: 'Access Group Membership',
          subtitle: 'All employees per access group with door and schedule mapping',
          kpis: [
            { icon: '👥', label: 'Total Access Groups', value: '6 Master Tiers', sub: 'Role-based access hierarchy', color: '#2563eb' },
            { icon: '🔐', label: 'Dual-Custody Vault', value: 'Tier 5 (Level 5)', sub: 'Two-person authorization', color: '#7c3aed' },
            { icon: '🏢', label: 'Branch Staff Group', value: 'Tier 2 (General)', sub: 'Banking hours schedule', color: '#10b981' },
            { icon: '🚪', label: 'Governed Portals', value: '1,040 Doors', sub: 'Across 829 Branches', color: '#0d9488' }
          ],
          columns: ['Group ID', 'Group Name', 'Employee', 'Branch', 'Clearance Level', 'Doors'],
          rows: [
            ['AG-PB-001', 'Central Vault & Treasury Dual-Custody', 'Mohammad Nazrul Islam (PB-09101)', 'Principal Branch, Dhaka', 'Level 5 (Dual Custody)', 'Treasury Main Vault, Strong Room Airlock, Cash Safe'],
            ['AG-PB-002', 'Branch Banking Staff & Tellers', 'Kamrun Nahar (PB-09102)', 'Motijheel Corporate Branch, Dhaka', 'Level 2 (General Staff)', 'Main Entrance, Teller Counter Doors 1-4, Back Office'],
            ['AG-PB-003', 'IT Infrastructure & Server Rooms', 'Tariqul Rahman (PB-09104)', 'Head Office Data Center, Dhaka', 'Level 4 (IT Clearance)', 'Server Room Airlock Interlock, NOC Operations, Telecom Core'],
            ['AG-PB-004', 'Sub-Branch (Upashakha) Access Core', 'Fatema Akter (PB-09108)', 'Kakrail Upashakha, Dhaka', 'Level 2 (Upashakha Staff)', 'Upashakha Front Door, Cash Drawer Safe, Officer Booth'],
            ['AG-PB-005', 'Islamic Banking Wings & Shariah Board', 'Ismail Hossain (PB-09105)', 'Khatunganj Islamic Wing, Chattogram', 'Level 3 (Islamic Clearance)', 'Islamic Wing Entrance, Shariah Suite, Document Archive'],
            ['AG-PB-006', 'Regional Office Supervision & Audit', 'Mahbubur Alam (PB-09110)', 'Sylhet Regional Hub, Sylhet', 'Level 4 (Regional DGM Tier)', 'Regional GM Cabin, Audit Archive, Inspection Vault Review']
          ]
        };
      }

      // 3. Access Level (AC-11 Access Level Expiry & Renewal Report)
      case 'access-level': {
        return {
          title: 'Access Level Expiry & Renewal Report',
          subtitle: 'AC-11 Clearance Tiers & Expiry Tracking · All 829 Branches',
          kpis: [
            { icon: '🛡️', label: 'Clearance Tiers', value: '6 Levels', sub: 'Executive down to Branch Staff', color: '#2563eb' },
            { icon: '✅', label: 'Active Clearances', value: '34,150 Staff', sub: 'Valid credentials', color: '#10b981' },
            { icon: '⏳', label: 'Expiring in 30 Days', value: '42 Staff', sub: 'Pending HR renewal', color: '#f59e0b' },
            { icon: '❌', label: 'Expired / Revoked', value: '18 Credentials', sub: 'Transferred / Resigned', color: '#ef4444' }
          ],
          columns: ['Employee', 'Access Level', 'Branch', 'Clearance Tier', 'Authorized Doors', 'Expiry Date', 'Status'],
          rows: [
            ['Tanvir Ahmed (PB-01042)', 'Level 6 - Executive Board', 'Principal Branch, Motijheel', 'Tier 1 (Full Bypass)', 'Boardroom, Executive Suite, All Branch Vaults', 'Dec 31, 2026', 'Active'],
            ['Farhana Yeasmin (PB-01099)', 'Level 5 - Vault Custodian', 'Chittagong Main Branch', 'Tier 2 (Dual Custody)', 'Cash Vault, Locker Room, Strong Room', 'Nov 15, 2026', 'Active'],
            ['Md. Rafiqul Islam (PB-02314)', 'Level 4 - IT / Operations', 'Sylhet Regional Hub', 'Tier 3 (24/7 Security)', 'Server NOC, UPS Hub, CCTV Operations', 'Jan 10, 2027', 'Active'],
            ['Nusrat Jahan (PB-03187)', 'Level 3 - Branch Officer', 'Agrabad Branch, Chittagong', 'Tier 4 (Working Shift)', 'Main Entrance, Staff Hall, Teller Safe', 'Dec 31, 2026', 'Active'],
            ['Kamal Hossain (PB-04421)', 'Level 2 - General Staff', 'Gulshan Corporate Branch', 'Tier 5 (Banking Shift)', 'Main Entrance, Ground Floor Staff Hall', 'Sep 01, 2026', 'Expired']
          ]
        };
      }

      // 4. Door Management (AC-03 Door Access Configuration Audit)
      case 'access-doors': {
        const rows = [];
        FULL_PUBALI_LOCATIONS.forEach(loc => {
          if (loc.doorList) {
            loc.doorList.forEach((d, i) => {
              const authMode = (d.name.includes('Vault') || d.name.includes('Treasury')) ? 'Dual Custody (Bio+PIN)' :
                (d.name.includes('Server') || d.name.includes('NOC')) ? 'Biometric + Card (2FA)' :
                d.name.includes('Main') ? 'Card + Biometric' : 'Fingerprint + Card';
              const schedule = (d.name.includes('Server') || d.name.includes('NOC')) ? '24/7 Full Access' :
                (d.name.includes('Vault') || d.name.includes('Treasury')) ? 'Cash Hours (09:30–16:30)' :
                'Banking Shift (08:30–18:30)';
              rows.push([
                `DOR-${loc.code || 'PB'}-${String(i + 1).padStart(2, '0')}`,
                d.name,
                loc.name,
                d.type || 'Mag Lock',
                authMode,
                d.group || 'Branch General Staff',
                schedule
              ]);
            });
          }
        });
        return {
          title: 'Door Access Configuration Audit',
          subtitle: `AC-03 Full inventory of ${rows.length} portal nodes across 829 branches`,
          kpis: [
            { icon: '🚪', label: 'Total Access Doors', value: `${rows.length} Portals`, sub: 'Configured in BioStar X', color: '#3b82f6' },
            { icon: '🔐', label: 'Dual-Custody Vaults', value: '520 Doors', sub: 'Level-5 High Security', color: '#7c3aed' },
            { icon: '🖥️', label: 'Server & NOC Interlocks', value: '84 Doors', sub: '2FA Biometric + Card', color: '#0d9488' },
            { icon: '🕒', label: '24/7 Full Access Doors', value: '142 Doors', sub: 'ATM & Guard Access', color: '#f59e0b' }
          ],
          columns: ['Door ID', 'Door Name', 'Branch', 'Lock Type', 'Auth Mode', 'Access Group', 'Schedule'],
          rows
        };
      }

      // 5. Door Status (AC-13 Real-Time Door Status & Sensor Telemetry)
      case 'access-doorstatus': {
        const rows = [];
        FULL_PUBALI_LOCATIONS.forEach((loc, locIdx) => {
          if (loc.doorList) {
            loc.doorList.forEach((d, i) => {
              const isAlarm = (locIdx * 11 + i) % 89 === 0;
              const isWarning = (locIdx * 7 + i) % 31 === 0;
              rows.push([
                `DOR-${loc.code || 'PB'}-${String(i + 1).padStart(2, '0')}`,
                d.name,
                loc.name,
                isAlarm ? 'Tamper Alert' : isWarning ? 'Held Open Alert' : (d.sensor || 'Closed'),
                isAlarm ? 'Alert' : isWarning ? 'Warning' : 'Normal',
                isAlarm ? 'Alarm' : (d.status || 'Locked'),
                isAlarm ? 'Alert Trigger' : `${10 + ((i + locIdx) % 25)} ms`,
                isAlarm ? 'Forced Open Detected' : isWarning ? 'Door Held > 60s' : 'Normal Secure Event'
              ]);
            });
          }
        });
        return {
          title: 'Real-Time Door Status & Sensor Telemetry Report',
          subtitle: `AC-13 Live telemetry across ${rows.length} access portals`,
          kpis: [
            { icon: '🚪', label: 'Active Portals', value: `${rows.length} Doors`, sub: 'Real-time telemetry', color: '#3b82f6' },
            { icon: '🔒', label: 'Secure & Locked', value: `${Math.max(0, rows.length - 12)} Doors`, sub: 'Normal secure state', color: '#10b981' },
            { icon: '🔓', label: 'Access Active', value: '12 Doors', sub: 'Turnstiles & staff ingress', color: '#0d9488' },
            { icon: '🚨', label: 'Forced / Held Alarms', value: '0 Alarms', sub: 'All perimeters secure', color: '#10b981' }
          ],
          columns: ['Door ID', 'Portal Name', 'Branch', 'Magnetic Sensor', 'Alarm Loop', 'Relay Status', 'Ping Latency', 'Last Event'],
          rows
        };
      }

      // 5b. Daily Attendance (Consolidated Branch-wise Daily Roll-up)
      case 'att-daily': {
        const rows = [];
        let totalStaffCount = 0;
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLate = 0;
        let totalLeave = 0;

        FULL_PUBALI_LOCATIONS.forEach((loc, idx) => {
          // Scale staff count so total across 829 branches reflects ~35,000 employees
          const branchStaff = loc.type === 'head-office' ? 420 : (loc.type === 'corporate' ? 82 : (34 + (idx % 19)));
          
          // Realistic distribution across 829 branches
          const absent = Math.max(0, (idx % 11 === 0) ? Math.round(branchStaff * 0.06) : ((idx % 3 === 0) ? 2 : 1));
          const late = Math.max(0, (idx % 7 === 0) ? Math.round(branchStaff * 0.05) : ((idx % 2 === 0) ? 1 : 0));
          const leave = Math.max(0, (idx % 9 === 0) ? 2 : ((idx % 4 === 0) ? 1 : 0));
          const present = Math.max(0, branchStaff - absent - leave);
          const attRate = ((present / branchStaff) * 100).toFixed(1);

          totalStaffCount += branchStaff;
          totalPresent += present;
          totalAbsent += absent;
          totalLate += late;
          totalLeave += leave;

          const firstInMin = String(8 + (idx % 35)).padStart(2, '0');
          const firstIn = `08:${firstInMin} AM`;
          const rosterStatus = parseFloat(attRate) >= 92 ? 'Good' : (parseFloat(attRate) >= 85 ? 'Normal' : 'Low Staff Alert');

          rows.push([
            loc.code || `BR-${1000 + idx}`,
            loc.name,
            loc.division || 'Dhaka',
            branchStaff,
            present,
            absent,
            late,
            leave,
            `${attRate}%`,
            firstIn,
            rosterStatus
          ]);
        });

        const overallRate = totalStaffCount > 0 ? ((totalPresent / totalStaffCount) * 100).toFixed(1) : '94.8';

        return {
          title: 'Pubali Bank Daily Branch Attendance Summary',
          subtitle: `Consolidated daily biometric attendance across 829 branches & sub-branches · 17 Sep 2026`,
          kpis: [
            { icon: '👥', label: 'Total Bank Staff', value: totalStaffCount.toLocaleString(), sub: '829 Branches & HO', color: '#2563eb' },
            { icon: '✅', label: 'Present Today', value: totalPresent.toLocaleString(), sub: `${overallRate}% Attendance Rate`, color: '#10b981' },
            { icon: '❌', label: 'Absent Today', value: totalAbsent.toLocaleString(), sub: `${((totalAbsent/totalStaffCount)*100).toFixed(1)}% Absenteeism`, color: '#ef4444' },
            { icon: '⏰', label: 'Late Arrival', value: totalLate.toLocaleString(), sub: 'Punched past grace', color: '#f59e0b' },
            { icon: '🌴', label: 'Approved Leave', value: totalLeave.toLocaleString(), sub: 'HR authorized leave', color: '#6366f1' }
          ],
          columns: ['Branch Code', 'Branch / Office Name', 'Division', 'Total Staff', 'Present', 'Absent', 'Late', 'On Leave', 'Attendance %', 'First In Punch', 'Roster Status'],
          rows
        };
      }

      // 6. Employee Attendance (T&A columns only)
      case 'att-employee': {
        const rows = [];
        let idx = 0;
        FULL_PUBALI_LOCATIONS.forEach(loc => {
          if (loc.employees) {
            loc.employees.forEach(emp => {
              const hasIn = emp.inTime !== '—' && emp.status !== 'Absent';
              const inTimeStr = hasIn ? emp.inTime : '—';
              // Deterministic out time based on index
              const outH = emp.late ? 18 + (idx % 2) : 17 + (idx % 2);
              const outM = String((idx * 7) % 60).padStart(2, '0');
              const outTimeStr = hasIn ? `${outH}:${outM}` : '—';
              // Working hours calculation
              let workHours = '—';
              if (hasIn && emp.inTime) {
                const [inH, inMm] = emp.inTime.split(':').map(Number);
                const totalMins = (outH * 60 + parseInt(outM)) - (inH * 60 + inMm);
                const h = Math.floor(totalMins / 60);
                const m = totalMins % 60;
                workHours = `${h}h ${String(m).padStart(2, '0')}m`;
              }
              rows.push([
                emp.id,
                emp.name,
                loc.name,
                inTimeStr,
                outTimeStr,
                workHours,
                emp.late ? 'Late' : (emp.status === 'Present' ? 'Present' : 'Absent'),
                emp.status === 'Absent' ? 'Absent' : 'Active',
              ]);
              idx++;
            });
          }
        });
        return {
          title: 'Employee Attendance Roster',
          subtitle: `Live biometric punch records across 829 locations`,
          columns: ['User ID', 'Employee Name', 'Branch / Location', 'In Time', 'Out Time', 'Working Hours', 'Attendance', 'Status'],
          rows
        };
      }

      // 7. Shift Management & Rotation Report (ATT-10 Specification)
      case 'att-shift': {
        return {
          title: 'Shift Management & Rotation Report (ATT-10)',
          subtitle: 'Shift schedule vs actual punch compliance across all Pubali Bank branches & 24/7 guard rosters',
          kpis: [
            { icon: '📊', label: 'Shift Compliance % (ATT-10)', value: '92.4%', sub: 'Overall Schedule Adherence', color: '#0d9488' },
            { icon: '🛡️', label: 'Security Guard Shifts', value: '2,140 Guards', sub: 'Branch & ATM Night Duty', color: '#059669' },
            { icon: '👥', label: 'Assigned Employees', value: '2,697 Staff', sub: 'Across 829 Locations', color: '#16a34a' },
            { icon: '⏳', label: 'Avg. Grace Window', value: '12 Mins', sub: 'Tolerance Threshold', color: '#d97706' },
          ],
          columns: ['Shift Code', 'Shift Name', 'Applicable Branch Scope', 'Employee Count', 'Schedule Window', 'Late Grace Period', 'Compliance %', 'Late %', 'Absent %', 'Status'],
          rows: [
            ['SH-GEN-01', 'General Banking Shift', 'All 519 Full Branches', '1,842 Staff', '08:30 – 18:30', '15 Minutes', '91.8%', '5.4%', '2.8%', 'Active'],
            ['SH-SUB-02', 'Upashakha Standard Shift', 'All 281 Sub-Branches', '562 Staff', '08:30 – 17:30', '15 Minutes', '89.2%', '6.8%', '4.0%', 'Active'],
            ['SH-HO-03', 'Head Office Corporate Shift', 'Pubali Bhaban HO Divisions', '195 Staff', '09:00 – 19:00', '15 Minutes', '94.5%', '3.6%', '1.9%', 'Active'],
            ['SH-SEC-06', 'Security Guard Night & ATM Roster', 'All 829 Branches & ATM Booths', '2,140 Guards', '18:00 – 06:00 (Night Roster)', '10 Minutes', '99.2%', '0.6%', '0.2%', 'Active'],
            ['SH-RO-04', 'Regional Operations & Clearing', '29 Regional Administrative Zones', '74 Staff', '08:00 – 19:30', '10 Minutes', '93.2%', '4.1%', '2.7%', 'Active'],
            ['SH-IT-05', 'Data Center 24/7 Rotational Shift', 'IT Data Center & Core Banking', '24 Staff', 'Rotational (A/B/C)', '5 Minutes', '97.6%', '1.8%', '0.6%', 'Active']
          ]
        };
      }

      // 8. Late / Early Report
      case 'att-late': {
        const rows = [];
        FULL_PUBALI_LOCATIONS.forEach(loc => {
          if (loc.employees) {
            loc.employees.filter(e => e.late).forEach(emp => {
              rows.push([
                emp.id,
                emp.name,
                loc.name,
                `Today ${emp.inTime}`,
                'General Banking (08:30)',
                '+18 to +35 mins',
                'Late'
              ]);
            });
          }
        });
        return {
          title: 'Late Arrival & Shift Grace Violations',
          subtitle: `${rows.length} employees flagged for punch after shift grace period`,
          kpis: [
            { icon: '⏰', label: 'Late Punch Count', value: '700 Staff', sub: 'Today across 829 Branches', color: '#f59e0b' },
            { icon: '📉', label: 'Late Arrival Rate', value: '2.0%', sub: 'Within Bank SLA (<3.0%)', color: '#10b981' },
            { icon: '⏳', label: 'Avg Delay Past Grace', value: '21.5 Mins', sub: 'Shift grace: 15 minutes', color: '#6366f1' },
            { icon: '⚠️', label: 'Chronic Late (>3x)', value: '58 Staff', sub: 'Flagged for HR notice', color: '#ef4444' },
            { icon: '🏢', label: 'Peak Late Zone', value: 'Dhaka Division', sub: 'Traffic congestion factor', color: '#0d9488' }
          ],
          columns: ['User ID', 'Employee Name', 'Branch / Location', 'Actual Punch Time', 'Assigned Shift', 'Duration Past Grace', 'Status'],
          rows
        };
      }

      // 8b. Overtime Analytics (ATT-specific columns)
      case 'att-overtime': {
        const otCategories = ['Approved OT', 'Bank Holiday OT', 'Emergency Call-in', 'Approved OT', 'Weekend OT'];
        const otStatuses = ['Approved', 'Approved', 'Approved', 'Pending', 'Rejected'];
        const rows = [];
        let otIdx = 0;
        FULL_PUBALI_LOCATIONS.slice(0, 60).forEach(loc => {
          if (loc.employees) {
            loc.employees.filter(e => e.status === 'Present').slice(0, 2).forEach(emp => {
              const shiftEnd = '18:30';
              const otH = 19 + (otIdx % 3);
              const otM = String((otIdx * 13) % 60).padStart(2, '0');
              const actualOut = `${otH}:${otM}`;
              const otMins = (otH * 60 + parseInt(otM)) - (18 * 60 + 30);
              const otHours = Math.floor(otMins / 60);
              const otMinRem = otMins % 60;
              rows.push([
                emp.id,
                emp.name,
                loc.name,
                'Sep 17, 2026',
                shiftEnd,
                actualOut,
                `${otHours}h ${String(otMinRem).padStart(2, '0')}m`,
                otCategories[otIdx % otCategories.length],
                otStatuses[otIdx % otStatuses.length],
              ]);
              otIdx++;
            });
          }
        });
        return {
          title: 'Overtime Analytics Report (ATT-OT)',
          subtitle: `Approved OT hours, extended shifts and payroll reconciliation · ${rows.length} records`,
          kpis: [
            { icon: '⏱️', label: 'Total OT Hours', value: '1,480.5 hrs', sub: 'Month-to-date logged', color: '#3b82f6' },
            { icon: '✅', label: 'Approved OT', value: '1,245.0 hrs', sub: 'Verified by Supervisor', color: '#10b981' },
            { icon: '⏳', label: 'Pending Review', value: '185.5 hrs', sub: 'Awaiting Branch Head review', color: '#f59e0b' },
            { icon: '🏦', label: 'Weekend / Holiday OT', value: '240.0 hrs', sub: 'Vault & Closing staff', color: '#6366f1' },
            { icon: '👥', label: 'Staff Earning OT', value: `${rows.length} Personnel`, sub: 'Active OT earners', color: '#0d9488' }
          ],
          columns: ['User ID', 'Employee Name', 'Branch / Location', 'Date', 'Shift End', 'Actual Out', 'OT Duration', 'OT Category', 'Status'],
          rows
        };
      }

      // 9. Monthly Attendance
      case 'att-monthly': {
        const rows = [];
        FULL_PUBALI_LOCATIONS.slice(0, 80).forEach(loc => {
          if (loc.employees && loc.employees[0]) {
            const emp = loc.employees[0];
            rows.push([
              emp.id,
              emp.name,
              loc.name,
              '22 Days',
              emp.status === 'Absent' ? '18 Days' : '21 Days',
              emp.status === 'Absent' ? '3 Days' : '1 Day',
              emp.late ? '2 Times' : '0 Times',
              emp.status === 'Absent' ? '82%' : '96%',
              'Active'
            ]);
          }
        });
        return {
          title: 'Monthly Attendance Ledger (September 2026)',
          subtitle: 'Consolidated attendance percentage and leaves summary',
          columns: ['User ID', 'Staff Name', 'Branch', 'Working Days', 'Present Days', 'Leave Days', 'Late Count', 'Attendance %', 'Status'],
          rows
        };
      }

      // 9b. Door Status — Device Hardware View (Device & System Health section)
      case 'dev-door': {
        const relayStates = ['Energized (Locked)', 'De-energized (Unlocked)', 'Energized (Locked)', 'Alarm — Held Open', 'Alarm — Forced'];
        const sensorStates = ['Closed', 'Closed', 'Open', 'Held Open >60s', 'Forced Detect'];
        const rows = [];
        let ddIdx = 0;
        FULL_PUBALI_LOCATIONS.forEach(loc => {
          if (loc.doorList && loc.devices && loc.devices[0]) {
            loc.doorList.forEach((d, i) => {
              const isAlarm = (ddIdx) % 71 === 0;
              const isWarn = (ddIdx) % 29 === 0 && !isAlarm;
              const relay = isAlarm ? relayStates[4] : isWarn ? relayStates[3] : relayStates[0];
              const sensor = isAlarm ? sensorStates[4] : isWarn ? sensorStates[3] : sensorStates[0];
              const ping = isAlarm ? 'Timeout' : `${8 + (ddIdx % 18)} ms`;
              rows.push([
                `DOR-${loc.code || 'PB'}-${String(i + 1).padStart(2, '0')}`,
                d.name,
                loc.name,
                `${loc.devices[0].id} (${loc.devices[0].model || 'CoreStation CS-40'})`,
                d.type || 'Mag Lock',
                relay,
                sensor,
                ping,
              ]);
              ddIdx++;
            });
          }
        });
        return {
          title: 'Door Hardware Status & Controller Telemetry',
          subtitle: `DEV-DOOR · ${rows.length} door relays across all Suprema controller nodes`,
          kpis: [
            { icon: '🚪', label: 'Door Relays Monitored', value: `${rows.length} Portals`, sub: 'Across 829 Branches', color: '#3b82f6' },
            { icon: '🎮', label: 'CoreStation ACUs', value: '520 Controllers', sub: 'Central Hardware Units', color: '#10b981' },
            { icon: '🔒', label: 'EM Locks Operational', value: `${Math.max(0, rows.length - 1)} Locked`, sub: 'Relay power normal', color: '#059669' },
            { icon: '📡', label: 'Sensor Online %', value: '100.0%', sub: 'Magnetic reed telemetry active', color: '#0d9488' },
            { icon: '🚨', label: 'Hardware Faults', value: '0 Critical', sub: 'Tamper switches secure', color: '#10b981' }
          ],
          columns: ['Door ID', 'Door Name', 'Branch / Location', 'Controller (ACU)', 'Lock Type', 'Relay Status', 'Sensor State', 'Controller Ping'],
          rows
        };
      }

      // 10. Device List
      case 'dev-list': {
        const rows = [];
        FULL_PUBALI_LOCATIONS.forEach(loc => {
          if (loc.devices) {
            loc.devices.forEach(d => {
              rows.push([
                d.id,
                d.name,
                d.model,
                d.ip,
                loc.name,
                loc.zone,
                d.firmware || 'v1.4.2_2408',
                d.status || 'Online'
              ]);
            });
          }
        });
        return {
          title: 'Complete Suprema Device Inventory',
          subtitle: `${rows.length} Suprema biometric terminals deployed nationwide`,
          columns: ['Device ID', 'Device Model Name', 'Hardware Model', 'IP Address', 'Branch Location', 'Regional Zone', 'Firmware', 'Status'],
          rows
        };
      }

      // 11. Device Status
      case 'dev-status': {
        const rows = [];
        FULL_PUBALI_LOCATIONS.forEach(loc => {
          if (loc.devices) {
            loc.devices.forEach(d => {
              rows.push([
                d.id,
                d.name,
                d.ip,
                d.status === 'Offline' ? 'Timeout' : '12 ms',
                d.status === 'Online' ? 'Just now' : '45m ago',
                d.status === 'Sync Issue' ? 'Warning' : 'Normal',
                d.status || 'Online'
              ]);
            });
          }
        });
        return {
          title: 'Suprema Device Health & Hardware Telemetry',
          subtitle: `${rows.length} terminals reporting telemetry`,
          columns: ['Device ID', 'Terminal Model', 'Network IP', 'Ping Latency', 'Last Heartbeat', 'Tamper Sensor', 'Health Status'],
          rows
        };
      }

      // 12. Active Devices
      case 'dev-active': {
        const rows = [];
        FULL_PUBALI_LOCATIONS.forEach(loc => {
          if (loc.devices) {
            loc.devices.filter(d => d.status === 'Online').forEach(d => {
              rows.push([
                d.id,
                d.name,
                d.ip,
                loc.name,
                loc.division,
                'Port 51211',
                'Online'
              ]);
            });
          }
        });
        return {
          title: 'Active Online Suprema Terminals',
          subtitle: `${rows.length} operational terminals connected to central BioStar X server`,
          columns: ['Device ID', 'Terminal Model', 'IP Address', 'Branch Location', 'Division', 'Gateway Port', 'Status'],
          rows
        };
      }

      // 13. Inactive Devices
      case 'dev-inactive': {
        const rows = [];
        FULL_PUBALI_LOCATIONS.forEach(loc => {
          if (loc.devices) {
            loc.devices.filter(d => d.status !== 'Online').forEach(d => {
              rows.push([
                d.id,
                d.name,
                d.ip,
                loc.name,
                loc.manager,
                d.status === 'Offline' ? 'Network Gateway Timeout' : 'Tamper Switch Alert',
                d.status || 'Offline'
              ]);
            });
          }
        });
        return {
          title: 'Inactive & Sync Alert Devices',
          subtitle: `${rows.length} terminals requiring dealer/IT inspection`,
          columns: ['Device ID', 'Terminal Model', 'Last Known IP', 'Branch Location', 'Branch Manager', 'Fault Diagnosis', 'Status'],
          rows
        };
      }

      // 14. Server Health (BioStar Core & DB Infrastructure)
      case 'dev-server': {
        const rows = [
          ['SRV-BIO-01', 'BioStar X Master App Server', 'Central Master Gateway & WebSocket Broker', '10.10.1.10:51212', '24%', '14.2 GB / 32 GB', '18 MB/s', '99.99% (42d)', 'Active Master', 'Healthy'],
          ['SRV-BIO-02', 'BioStar X Standby Gateway', 'Failover Hot-Standby Node', '10.10.1.11:51212', '11%', '11.5 GB / 32 GB', '4 MB/s', '99.99% (42d)', 'Standby Sync', 'Healthy'],
          ['SRV-SQL-01', 'MSSQL Enterprise Primary', 'AlwaysOn High Availability Cluster', '10.10.1.20:1433', '38%', '58.4 GB / 64 GB', '85 MB/s', '100% (120d)', 'AlwaysOn Primary', 'Healthy'],
          ['SRV-SQL-02', 'MSSQL Disaster Recovery Node', 'Disaster Recovery (DR) Site Async Node', '10.10.2.20:1433', '15%', '42.1 GB / 64 GB', '22 MB/s', '99.99% (120d)', 'Async Replica', 'In Sync'],
          ['SRV-CRYPTO-01', 'Biometric HSM Crypto Daemon', 'AES-256 Fingerprint/Face Template Vault', '10.10.1.15:8443', '8%', '4.1 GB / 16 GB', '2 MB/s', '99.95% (35d)', 'Hardware HSM', 'Healthy'],
          ['SRV-CACHE-01', 'Redis Event Stream Broker', 'High-throughput Event Ingestion Queue', '10.10.1.16:6379', '19%', '6.8 GB / 16 GB', '12 MB/s', '99.99% (42d)', 'Sentinel Cluster', 'Healthy'],
          ['SRV-ADSYNC-01', 'LDAP / HRMS Sync Engine', 'Pubali Active Directory User Provisioning', '10.10.1.25:636', '5%', '2.3 GB / 8 GB', '1 MB/s', '99.90% (14d)', 'Scheduled Cron', 'Healthy'],
          ['SRV-DISPATCH-01', 'Branch Device Dispatcher', '829 Branch CoreStation Polling Worker', '10.10.1.18:51211', '22%', '9.4 GB / 16 GB', '28 MB/s', '99.97% (42d)', 'Multi-Threaded', 'Healthy'],
          ['SRV-BACKUP-01', 'Automated Cold Storage Vault', 'Encrypted Nightly Log & Template Archive', '10.10.1.30:9000', '12%', '8.0 GB / 16 GB', '45 MB/s', '99.85% (28d)', 'Nightly Batch', 'Healthy']
        ];
        return {
          title: 'Pubali Bank BioStar X Server & Infrastructure Health',
          subtitle: 'BioStar X Core Gateway, SQL database cluster, cryptographic vaults and failover state',
          kpis: [
            { label: 'Cluster State', value: 'Active Master', sub: 'HA AlwaysOn in Sync', color: '#10b981', icon: '⚡' },
            { label: 'Core Servers', value: '9 Nodes', sub: '100% Operational', color: '#3b82f6', icon: '🖥️' },
            { label: 'Avg CPU Load', value: '17.1%', sub: 'Normal threshold (<75%)', color: '#0d9488', icon: '📊' },
            { label: 'Total Memory', value: '156 / 264 GB', sub: '59% Allocated', color: '#6366f1', icon: '💾' },
            { label: 'System Uptime', value: '99.99%', sub: '42 Consecutive Days', color: '#059669', icon: '🛡️' }
          ],
          columns: ['Node ID', 'Server / Daemon Name', 'Architecture Role', 'Host IP:Port', 'CPU %', 'RAM Usage', 'Disk I/O', 'Uptime', 'HA Cluster Mode', 'Status'],
          rows
        };
      }

      // 15. Network Status (MPLS & VPN Branch Telemetry)
      case 'dev-network': {
        const rows = [];
        let onlineLinks = 0;
        let degradedLinks = 0;
        let offlineLinks = 0;

        FULL_PUBALI_LOCATIONS.forEach((loc, idx) => {
          const isOffline = loc.devices && loc.devices.some(d => d.status === 'Offline') && (idx % 15 === 0);
          const isHighLatency = !isOffline && (idx % 7 === 0);

          let latency = isOffline ? 'Timeout' : (isHighLatency ? `${110 + (idx % 45)} ms` : `${14 + (idx % 26)} ms`);
          let packetLoss = isOffline ? '100%' : (isHighLatency ? `${(1.2 + (idx % 3) * 0.9).toFixed(1)}%` : '0.0%');
          let linkStatus = isOffline ? 'Down' : (isHighLatency ? 'High Latency' : 'Online');
          let isp = idx % 3 === 0 ? 'BTCL Dedicated Fiber' : (idx % 3 === 1 ? 'Summit Communications' : 'Fiber@Home MPLS');
          let linkType = idx % 10 === 0 ? 'Secondary 4G IP-VPN' : 'Primary MPLS WAN';
          let bandwidth = isOffline ? '0 Mbps' : (linkType.includes('4G') ? '10 Mbps' : '25 Mbps Dedicated');
          let subnet = `10.20.${Math.floor(idx / 250) + 1}.${(idx % 250) + 1}`;

          if (isOffline) offlineLinks++;
          else if (isHighLatency) degradedLinks++;
          else onlineLinks++;

          rows.push([
            loc.code || `BR-${1000 + idx}`,
            loc.name,
            loc.division || 'Dhaka',
            linkType,
            isp,
            subnet,
            latency,
            packetLoss,
            bandwidth,
            linkStatus
          ]);
        });

        return {
          title: 'Nationwide Branch WAN & MPLS Network Telemetry',
          subtitle: `MPLS links, VPN tunnels and gateway latency across Pubali Bank's 829 branches`,
          kpis: [
            { label: 'Monitored Links', value: `${rows.length} Nodes`, sub: 'Nationwide Branch Mesh', color: '#3b82f6', icon: '🌐' },
            { label: 'Online Links', value: `${onlineLinks}`, sub: 'Connected (<40ms)', color: '#10b981', icon: '✅' },
            { label: 'High Latency / 4G', value: `${degradedLinks}`, sub: 'Secondary failover link', color: '#f59e0b', icon: '⚠️' },
            { label: 'Unreachable / Down', value: `${offlineLinks}`, sub: 'MPLS link disconnected', color: '#ef4444', icon: '❌' },
            { label: 'Avg Latency', value: '23.4 ms', sub: 'Core DC to Branch WAN', color: '#0d9488', icon: '⚡' }
          ],
          columns: ['Branch Code', 'Branch / Office Name', 'Division', 'Link Medium', 'Primary ISP', 'Gateway IP', 'Ping Latency', 'Packet Loss', 'Bandwidth', 'Link Status'],
          rows
        };
      }

      // 16. Bangladesh Bank ICT-08 Compliance Audit Report
      case 'compliance-reports': {
        const rows = [];
        let fullyCompliant = 0;
        let minorReview = 0;

        FULL_PUBALI_LOCATIONS.forEach((loc, idx) => {
          const isMinor = idx % 17 === 0;
          const vaultStatus = (loc.type === 'head-office' || loc.type === 'corporate')
            ? 'Level 5 (Dual Custody + Interlock)'
            : 'Level 5 (Dual Custody Enforced)';
          const fireInterlock = isMinor ? 'Scheduled Re-test' : 'Certified Active';
          const bioEnrolled = isMinor ? '94.2%' : `${(98.0 + (idx % 20) * 0.1).toFixed(1)}%`;
          const auditTrail = 'SHA-256 Tamper-Proof Active';
          const score = isMinor ? '92.5%' : `${(97.0 + (idx % 30) * 0.1).toFixed(1)}%`;
          const status = isMinor ? 'Minor Review' : 'Compliant';

          if (status === 'Compliant') fullyCompliant++;
          else minorReview++;

          rows.push([
            loc.code || `BR-${1000 + idx}`,
            loc.name,
            loc.division || 'Dhaka',
            vaultStatus,
            fireInterlock,
            bioEnrolled,
            auditTrail,
            score,
            status
          ]);
        });

        return {
          title: 'Bangladesh Bank ICT Security Guideline (ICT-08) Compliance Report',
          subtitle: `Regulatory compliance audit across 829 branches · Vault dual-custody, biometric access control & audit trails`,
          kpis: [
            { icon: '🏛️', label: 'BB ICT-08 Compliance', value: '98.6%', sub: 'Bank-wide Audited Score', color: '#10b981' },
            { icon: '🔐', label: 'Vault Dual-Custody', value: '100.0%', sub: '520 / 520 Vaults Compliant', color: '#7c3aed' },
            { icon: '🛡️', label: 'Audit Trail Integrity', value: '100.0%', sub: 'SHA-256 Tamper-Proof Active', color: '#0d9488' },
            { icon: '🔥', label: 'Fire Release Interlock', value: `${rows.length - minorReview} / ${rows.length}`, sub: 'Automatic fail-safe verified', color: '#2563eb' },
            { icon: '📋', label: 'Compliant Branches', value: `${fullyCompliant} / ${rows.length}`, sub: 'Zero regulatory non-compliance', color: '#059669' }
          ],
          columns: ['Branch Code', 'Branch / Facility Name', 'Division', 'Vault Dual-Custody Status', 'Fire Interlock', 'Biometric Enrolled %', 'Audit Trail Integrity', 'Compliance Score', 'Status'],
          rows
        };
      }

      // 17. Live Access Control & Turnstile Events
      case 'live-access-events': {
        const authModes = ['Face Recognition (BioStation 3)', 'Fingerprint (BioEntry W2)', 'RFID Smart Card + PIN', 'Fingerprint (BioStation 2)', 'Dual-Custody Bio+PIN'];
        const doorTypes = ['Main Entrance Speed Gate Turnstile 1', 'Main Entrance Speed Gate Turnstile 2', 'Cash Vault Outer Heavy Door', 'Server Room Airlock Interlock Door', 'Executive Boardroom Entrance', 'Staff Banking Hall Ingress'];
        const rows = [];

        for (let i = 0; i < 150; i++) {
          const loc = FULL_PUBALI_LOCATIONS[i % FULL_PUBALI_LOCATIONS.length];
          const emp = loc.employees && loc.employees[i % loc.employees.length] ? loc.employees[i % loc.employees.length] : { id: `PB-${10400 + i}`, name: 'Branch Personnel' };
          const result = i % 14 === 0 ? 'Denied' : 'Granted';
          const authMode = authModes[i % authModes.length];
          const door = doorTypes[i % doorTypes.length];
          const timeSec = String(59 - (i % 60)).padStart(2, '0');
          const timeMin = String(35 - Math.floor(i / 10)).padStart(2, '0');
          const timeStr = `18:${timeMin}:${timeSec}`;
          const keyId = result === 'Denied' ? 'CARD-UNREGISTERED-ERR' : (i % 2 === 0 ? `FP-TMP-${emp.id}` : `RFID-04A8B${100 + i}`);

          rows.push([
            timeStr,
            emp.id,
            emp.name,
            door,
            loc.name,
            authMode,
            keyId,
            result
          ]);
        }

        return {
          title: 'Live Access Control & Biometric Event Stream',
          subtitle: 'Real-time biometric and RFID credentials stream across turnstiles, main gates, cash vaults, and server rooms',
          kpis: [
            { icon: '⚡', label: 'Live Events Today', value: '48,290 Pushes', sub: 'Across 829 Locations', color: '#3b82f6' },
            { icon: '✅', label: 'Access Granted Rate', value: '99.2%', sub: '47,902 Authorized ingress', color: '#10b981' },
            { icon: '⛔', label: 'Access Denied', value: '388 Events', sub: 'Unregistered / Timezone mismatch', color: '#ef4444' },
            { icon: '🔐', label: 'Dual-Custody Vault Entries', value: '1,040 Accesses', sub: 'Two-custodian verified', color: '#7c3aed' },
            { icon: '🚶', label: 'Peak Throughput', value: '42 Entries/min', sub: 'Main Office Speed Gates', color: '#0d9488' }
          ],
          columns: ['Event Time', 'User ID', 'Employee / Visitor Name', 'Access Portal / Door', 'Branch Location', 'Authentication Mode', 'Credential ID', 'Event Result'],
          rows
        };
      }

      default:
        return {
          title: pageId,
          subtitle: '',
          columns: ['Item', 'Description', 'Status'],
          rows: []
        };
    }
  }, [pageId]);
}

// ─── GENERIC TABLE PAGE (extracted so hooks are never conditionally called) ──
function GenericTablePage({ pageId }) {
  const { title, subtitle, columns, rows, kpis } = usePageData(pageId);
  const { region: globalRegion } = useBankFilters();

  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [attendanceRateFilter, setAttendanceRateFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  // Identify column indices
  const divisionColIdx = useMemo(() => {
    return columns.findIndex(c => /division|regional zone|zone/i.test(c));
  }, [columns]);

  const statusColIdx = useMemo(() => {
    return columns.findIndex(c => /roster status|status|result|state/i.test(c));
  }, [columns]);

  const attRateColIdx = useMemo(() => {
    return columns.findIndex(c => /attendance\s*%/i.test(c));
  }, [columns]);

  const statusColTitle = useMemo(() => {
    if (statusColIdx === -1) return '';
    return columns[statusColIdx];
  }, [columns, statusColIdx]);

  // Extract unique options from rows
  const divisionOptions = useMemo(() => {
    if (divisionColIdx === -1) return [];
    const vals = new Set();
    rows.forEach(r => {
      const v = r[divisionColIdx];
      if (v && typeof v === 'string') vals.add(v.trim());
    });
    return Array.from(vals).sort();
  }, [rows, divisionColIdx]);

  const statusOptions = useMemo(() => {
    if (statusColIdx === -1) return [];
    const vals = new Set();
    rows.forEach(r => {
      const v = r[statusColIdx];
      if (v && typeof v === 'string') vals.add(v.trim());
    });
    return Array.from(vals).sort();
  }, [rows, statusColIdx]);

  // Sync with global region from top filter bar if selected
  useEffect(() => {
    if (globalRegion && globalRegion !== 'All Regions') {
      const matched = divisionOptions.find(d => d.toLowerCase() === globalRegion.toLowerCase());
      if (matched) setDivisionFilter(matched);
    }
  }, [globalRegion, divisionOptions]);

  // Reset filters on pageId change
  useEffect(() => {
    setSearch('');
    setDivisionFilter('All');
    setStatusFilter('All');
    setAttendanceRateFilter('All');
    setCurrentPage(1);
  }, [pageId]);

  // Filter rows across search + division + status + rate
  const filteredRows = useMemo(() => {
    let result = rows;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(row =>
        row.some(cell => String(cell).toLowerCase().includes(q))
      );
    }

    if (divisionFilter !== 'All' && divisionColIdx !== -1) {
      result = result.filter(row => String(row[divisionColIdx]).toLowerCase() === divisionFilter.toLowerCase());
    }

    if (statusFilter !== 'All' && statusColIdx !== -1) {
      result = result.filter(row => String(row[statusColIdx]).toLowerCase() === statusFilter.toLowerCase());
    }

    if (attendanceRateFilter !== 'All' && attRateColIdx !== -1) {
      result = result.filter(row => {
        const val = parseFloat(String(row[attRateColIdx]).replace('%', ''));
        if (isNaN(val)) return true;
        if (attendanceRateFilter === 'ge95') return val >= 95;
        if (attendanceRateFilter === '90to94') return val >= 90 && val < 95;
        if (attendanceRateFilter === 'lt90') return val < 90;
        return true;
      });
    }

    return result;
  }, [rows, search, divisionFilter, statusFilter, attendanceRateFilter, divisionColIdx, statusColIdx, attRateColIdx]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, divisionFilter, statusFilter, attendanceRateFilter]);

  const isFiltered = Boolean(
    search.trim() ||
    divisionFilter !== 'All' ||
    statusFilter !== 'All' ||
    attendanceRateFilter !== 'All'
  );

  const handleClearFilters = () => {
    setSearch('');
    setDivisionFilter('All');
    setStatusFilter('All');
    setAttendanceRateFilter('All');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Export CSV handler
  const handleExportCSV = () => {
    const header = columns.join(',');
    const body = filteredRows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pubali-biostar-${pageId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {kpis && kpis.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {kpis.map((k, idx) => (
            <div key={idx} style={{
              background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
              flex: '1 1 180px', minWidth: 160, boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8, background: `${k.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
              }}>
                {k.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {k.label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: k.color, marginTop: 2 }}>
                  {k.value}
                </div>
                {k.sub && <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>{k.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="bs-card">
        <div className="bs-card-header">
          <span className="bs-card-header-title">{title}</span>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{subtitle}</span>
        </div>

        {/* Filter and Export Strip */}
        <div style={{
          padding: '10px 14px',
          borderBottom: '1px solid #eef0f3',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
          background: '#fcfcfd'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: 230, minWidth: 180 }}>
            <input
              className="bs-input"
              style={{ width: '100%', paddingLeft: 28, height: 32, fontSize: 12 }}
              placeholder="Filter records..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" style={{ position: 'absolute', left: 9, top: 9, color: '#9ca3af' }}>
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </div>

          {/* Division Filter Dropdown */}
          {divisionOptions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <select
                className="bs-select"
                style={{
                  height: 32,
                  fontSize: 12,
                  minWidth: 130,
                  cursor: 'pointer',
                  borderColor: divisionFilter !== 'All' ? '#0d9488' : '#e2e8f0',
                  background: divisionFilter !== 'All' ? '#f0fdf4' : '#ffffff',
                  fontWeight: divisionFilter !== 'All' ? 600 : 400
                }}
                value={divisionFilter}
                onChange={e => setDivisionFilter(e.target.value)}
                aria-label="Filter by Division"
              >
                <option value="All">All Divisions ({divisionOptions.length})</option>
                {divisionOptions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Status / Roster Filter Dropdown */}
          {statusOptions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <select
                className="bs-select"
                style={{
                  height: 32,
                  fontSize: 12,
                  minWidth: 135,
                  cursor: 'pointer',
                  borderColor: statusFilter !== 'All' ? '#0d9488' : '#e2e8f0',
                  background: statusFilter !== 'All' ? '#f0fdf4' : '#ffffff',
                  fontWeight: statusFilter !== 'All' ? 600 : 400
                }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                aria-label="Filter by Status"
              >
                <option value="All">All {statusColTitle || 'Status'} ({statusOptions.length})</option>
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Attendance % Rate Filter (if attendance rate column exists) */}
          {attRateColIdx !== -1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <select
                className="bs-select"
                style={{
                  height: 32,
                  fontSize: 12,
                  minWidth: 150,
                  cursor: 'pointer',
                  borderColor: attendanceRateFilter !== 'All' ? '#0d9488' : '#e2e8f0',
                  background: attendanceRateFilter !== 'All' ? '#f0fdf4' : '#ffffff',
                  fontWeight: attendanceRateFilter !== 'All' ? 600 : 400
                }}
                value={attendanceRateFilter}
                onChange={e => setAttendanceRateFilter(e.target.value)}
                aria-label="Filter by Attendance Rate"
              >
                <option value="All">All Attendance Rates</option>
                <option value="ge95">≥ 95% (High Attendance)</option>
                <option value="90to94">90% – 94.9% (Standard)</option>
                <option value="lt90">&lt; 90% (Low Staff Alert)</option>
              </select>
            </div>
          )}

          {/* Active Filter Clear Button */}
          {isFiltered && (
            <button
              className="bs-btn bs-btn-outline bs-btn-sm"
              onClick={handleClearFilters}
              style={{
                height: 32,
                color: '#ef4444',
                borderColor: '#fca5a5',
                background: '#fef2f2',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
                fontSize: 11.5,
                cursor: 'pointer',
                borderRadius: 4
              }}
              title="Reset all filters"
            >
              <span>✕</span>
              <span>Reset</span>
            </button>
          )}

          {/* Records Count Badge */}
          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Showing <strong style={{ color: '#0f172a' }}>{filteredRows.length}</strong> of {rows.length}</span>
            {isFiltered && (
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: 4, fontSize: 10.5, fontWeight: 700 }}>
                Filtered
              </span>
            )}
          </div>

          {/* Export CSV Button */}
          <button
            className="bs-btn bs-btn-outline bs-btn-sm"
            onClick={handleExportCSV}
            style={{ marginLeft: 'auto', height: 32, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            Export CSV ({filteredRows.length})
          </button>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="bs-table">
            <thead>
              <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>
                      {['Online', 'Offline', 'Active', 'Inactive', 'Present', 'Absent',
                        'Granted', 'Denied', 'Locked', 'Unlocked', 'Normal Locked',
                        'Door Forced Alarm', 'Timeout', 'Late', 'Compliant', 'Minor Review',
                        'Critical', 'Down', 'Healthy', 'In Sync', 'Sync Issue', 'Tamper Alert',
                        'High Latency', 'Degraded', 'Standby Sync', 'Warning',
                        'Short-Staffed Alert', 'Optimal', 'Normal', 'Partial'
                      ].includes(cell)
                        ? <StatusBadge cell={cell} />
                        : String(cell)
                      }
                    </td>
                  ))}
                </tr>
              ))}
              {paginatedRows.length === 0 && (
                <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>No records match the current filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '10px 14px', borderTop: '1px solid #eef0f3', display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#9ca3af', marginRight: 4 }}>
              Page {currentPage} of {totalPages} · {filteredRows.length} records
            </span>
            <button className="bs-btn bs-btn-outline bs-btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Prev</button>
            <button className="bs-btn bs-btn-outline bs-btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN GENERIC PAGE COMPONENT ──────────────────────────
export default function BioStarGenericPage({ pageId, queryParams, onNavigate }) {
  // ── Route to dedicated advanced pages (all early returns BEFORE any hook calls)
  if (pageId === 'users')                                         return <UserManagementPage onNavigate={onNavigate} />;
  if (pageId === 'access' || pageId === 'access-security' || pageId === 'access-dashboard') return <AccessControlSecurityDashboard onNavigate={onNavigate} />;
  if (pageId === 'access-doorstatus')                             return <DoorStatusPage initialLoop={queryParams?.get('loop')} onNavigate={onNavigate} />;
  if (pageId === 'access-group')                                  return <AccessGroupPage onNavigate={onNavigate} />;
  if (pageId === 'access-level')                                  return <AccessLevelPage onNavigate={onNavigate} />;
  if (pageId === 'access-doors')                                  return <DoorManagementPage initialTab={queryParams?.get('tab')} onNavigate={onNavigate} />;
  if (pageId === 'attendance' || pageId === 'att-employee')       return <AttendancePage onNavigate={onNavigate} />;
  if (pageId === 'att-daily')                                     return <DailyAttendancePage onNavigate={onNavigate} />;
  if (pageId === 'att-shift')                                     return <ShiftManagementPage initialShift={queryParams?.get('shift')} initialGroup={queryParams?.get('group')} onNavigate={onNavigate} />;
  if (pageId === 'att-late')                                      return <LateEarlyPage />;
  if (pageId === 'att-early')                                     return <AttendanceExceptionHub key="early-dep" initialTab="Early Departure" />;
  if (pageId === 'att-overtime')                                  return <OvertimeAnalyticsPage onNavigate={onNavigate} />;
  if (pageId === 'att-monthly')                                   return <MonthlyAttendancePage />;
  if (pageId === 'devices' || pageId === 'dev-list')              return <DeviceListPage key={`dl-${queryParams?.get('category')}-${queryParams?.get('model')}-${queryParams?.get('status')}`} initialCategory={queryParams?.get('category')} initialModel={queryParams?.get('model')} initialStatus={queryParams?.get('status')} />;
  if (pageId === 'dev-status' || pageId === 'dev-mon')             return <DeviceStatusPage key={`ds-${queryParams?.get('category')}-${queryParams?.get('model')}-${queryParams?.get('status')}`} initialCategory={queryParams?.get('category')} initialModel={queryParams?.get('model')} initialStatus={queryParams?.get('status')} />;
  if (pageId === 'dev-active')                                    return <ActiveDevicePage key={`da-${queryParams?.get('category')}-${queryParams?.get('model')}`} initialCategory={queryParams?.get('category')} initialModel={queryParams?.get('model')} />;
  if (pageId === 'dev-inactive')                                  return <InactiveDevicePage />;
  if (pageId === 'live-access-events')                            return <LiveAccessEventsPage onNavigate={onNavigate} />;

  // ── Delegate to the generic table renderer (hooks live safely inside it)
  return <GenericTablePage pageId={pageId} />;
}

