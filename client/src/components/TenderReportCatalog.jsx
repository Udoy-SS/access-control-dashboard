/**
 * TenderReportCatalog.jsx — Official Bank Tender / RFP Report Catalog
 * 60 Formal Reports in 6 Categories — Pubali Bank PLC · BioStar X Deployment
 */

import React, { useState } from 'react';

const CATEGORIES = [
  {
    id: 'executive',
    label: 'Executive / Board',
    icon: '👔',
    color: '#0f172a',
    bg: '#f1f5f9',
    reports: [
      { id: 'EB-01', name: 'CEO / MD Executive Dashboard Summary', purpose: 'Board-level KPIs: attendance %, security score, uptime, alarms', fields: 'Total Employees, Present %, Late %, Absentee %, Alarms, Device Uptime', filters: 'Date Range, Division', kpi: 'Workforce Attendance %, Security Score', drilldown: 'Division → Branch', export: 'PDF, Email Schedule', role: 'CEO / MD / Board' },
      { id: 'EB-02', name: 'Board Security & Compliance Overview', purpose: 'Quarterly board-level compliance and physical security posture', fields: 'Policy Compliance %, Audit Findings, Incident Count, SLA Adherence', filters: 'Quarter, Division', kpi: 'Compliance %, SLA Uptime %', drilldown: 'Branch', export: 'PDF', role: 'Board of Directors' },
      { id: 'EB-03', name: 'Divisional Workforce Attendance Summary', purpose: 'High-level attendance by 8 administrative divisions', fields: 'Division, Present Count, Late Count, Absent Count, Attendance %', filters: 'Month, Division', kpi: 'Division Attendance %', drilldown: 'Division → Region → Branch', export: 'PDF, Excel', role: 'DMD / EVP' },
      { id: 'EB-04', name: 'Monthly Biometric Compliance Report', purpose: 'Tracks biometric enrollment and authentication usage vs policy targets', fields: 'Enrolled Users, Fingerprint %, Card %, Face %, Dual %', filters: 'Month, Division', kpi: 'Enrollment Compliance %', drilldown: 'Branch', export: 'PDF, Excel', role: 'CTO / CISO' },
      { id: 'EB-05', name: 'YTD Branch Performance Scorecard', purpose: 'Year-to-date weighted security and attendance ranking per branch', fields: 'Rank, Branch, Security Score, Attendance Score, Combined Rating', filters: 'Year, Division', kpi: 'YTD Score', drilldown: 'Branch Detail', export: 'PDF, Excel', role: 'DMD / EVP' },
      { id: 'EB-06', name: 'Quarterly SLA & Uptime Governance Report', purpose: 'SLA adherence per quarter for biometric device fleet', fields: 'Total Devices, Online %, SLA Target %, Breach Events, Response Time', filters: 'Quarter', kpi: 'SLA Uptime %', drilldown: 'Device', export: 'PDF', role: 'IT Governance / Board' },
      { id: 'EB-07', name: 'Executive Incident Intelligence Brief', purpose: 'Summary of critical security incidents with resolution status', fields: 'Alarm Type, Count, Severity, Avg Resolution Time, Open Items', filters: 'Month, Severity', kpi: 'Open Incidents', drilldown: 'Incident Detail', export: 'PDF, Email', role: 'CXO' },
      { id: 'EB-08', name: 'Payroll-Linked Attendance Integrity Audit', purpose: 'Cross-check biometric attendance data against HR payroll records', fields: 'Employee, Biometric Days, HR Days, Variance, Flag', filters: 'Month, Department', kpi: 'Variance Count', drilldown: 'Employee', export: 'Excel', role: 'CFO / Internal Audit' },
    ]
  },
  {
    id: 'security',
    label: 'Security & SOC',
    icon: '🛡️',
    color: '#dc2626',
    bg: '#fff5f5',
    reports: [
      { id: 'SC-01', name: 'Real-Time SOC Alarm Dashboard', purpose: 'Live stream of all active security alarms across 829 locations', fields: 'Alarm ID, Type, Location, Severity, Time, Status, Officer', filters: 'Severity, Location, Status', kpi: 'Active Alarms', drilldown: 'Branch → Device → Door', export: 'PDF Export on demand', role: 'SOC Officer / CISO' },
      { id: 'SC-02', name: 'Door Forced Open Incident Report', purpose: 'All door-forced events with location, time, and resolution', fields: 'Event ID, Door, Branch, Time, Duration, Resolution, Officer', filters: 'Date, Branch, Division', kpi: 'Forced Door Count', drilldown: 'Door History', export: 'PDF, Excel', role: 'Security Manager' },
      { id: 'SC-03', name: 'Anti-Tailgating & People Count Report', purpose: 'Tailgating detections vs camera count mismatches', fields: 'Reader, Date, Count Mismatch, Alert Count, Video Ref', filters: 'Date, Branch', kpi: 'Tailgate Alert Count', drilldown: 'Event → Video', export: 'PDF', role: 'SOC / Security' },
      { id: 'SC-04', name: 'Duress Alarm & Emergency Event Log', purpose: 'Duress panic button triggers with full response timeline', fields: 'Event ID, Employee, Location, Time, Response Time, Resolution', filters: 'Month, Branch', kpi: 'Duress Events', drilldown: 'Event Detail', export: 'PDF', role: 'CISO / SOC' },
      { id: 'SC-05', name: 'Access Denied Intelligence Report', purpose: 'Top denied employees, doors, reasons, and trend analysis', fields: 'Employee, Branch, Door, Denial Reason, Count, Last Attempt', filters: 'Month, Denial Reason, Branch', kpi: 'Denial Count', drilldown: 'Employee → History', export: 'Excel, PDF', role: 'Security Manager' },
      { id: 'SC-06', name: 'Anti-Passback Violation Log', purpose: 'Anti-passback rule violations per location and employee', fields: 'Employee, Door IN, Door OUT, Violation Type, Timestamp, Branch', filters: 'Date, Branch', kpi: 'APB Violations', drilldown: 'Employee Trail', export: 'Excel', role: 'Security / IT' },
      { id: 'SC-07', name: 'Tamper & Sensor Fault Incident Log', purpose: 'Device tamper alerts and magnetic sensor fault history', fields: 'Device, Location, Fault Type, Time, Duration, Resolution, Tech', filters: 'Date, Branch, Device', kpi: 'Tamper Events', drilldown: 'Device History', export: 'PDF, Excel', role: 'IT / Security' },
      { id: 'SC-08', name: 'Blacklisted Credential Attempt Log', purpose: 'All access attempts using revoked or blacklisted credentials', fields: 'Employee ID, Card/Fingerprint, Door, Branch, Timestamp, Status', filters: 'Month, Branch', kpi: 'Blacklist Attempts', drilldown: 'Credential History', export: 'PDF', role: 'Security / HR' },
      { id: 'SC-09', name: 'Branch Security Score Trend Report', purpose: 'Monthly security score evolution per branch (trend chart)', fields: 'Branch, Month 1–12 Scores, Current Score, Grade Change', filters: 'Year, Division', kpi: 'Score Trend', drilldown: 'Branch', export: 'PDF, Excel', role: 'CISO / DGM' },
      { id: 'SC-10', name: 'Emergency Mustering & Evacuation Drill Report', purpose: 'Documents headcount and evacuation time for drill events', fields: 'Location, Total Inside, Mustered, Unaccounted, Drill Duration', filters: 'Drill Date, Branch', kpi: 'Muster Completion %', drilldown: 'Employee List', export: 'PDF', role: 'Security Manager / GM' },
    ]
  },
  {
    id: 'attendance',
    label: 'HR / Attendance',
    icon: '⏱️',
    color: '#0d9488',
    bg: '#f0fdfa',
    reports: [
      { id: 'ATT-01', name: 'Daily Branch Attendance Dashboard', purpose: 'Real-time attendance status by branch for today', fields: 'Branch, Total Staff, Present, Late, Absent, Attendance %', filters: 'Date, Division, Zone', kpi: 'Daily Attendance %', drilldown: 'Branch → Employee', export: 'PDF, Excel', role: 'HR Manager / Branch Incharge' },
      { id: 'ATT-02', name: 'Monthly Attendance Roster (Full)', purpose: 'Full monthly employee attendance calendar view with P/A/L markers', fields: 'Employee, Day 1–31 Status, Total Present, Total Absent, Late Count', filters: 'Month, Branch, Department', kpi: 'Monthly Attendance %', drilldown: 'Employee Detail', export: 'Excel, PDF', role: 'HR / Branch Incharge' },
      { id: 'ATT-03', name: 'Late Arrival Report — Daily', purpose: 'All employees who arrived after shift grace period today', fields: 'Employee, Shift Start, Actual In, Late Minutes, Branch, Dept', filters: 'Date, Branch, Shift', kpi: 'Late Count', drilldown: 'Employee', export: 'Excel, PDF', role: 'Branch Manager / HR' },
      { id: 'ATT-04', name: 'Late Arrival Report — Monthly Trend', purpose: 'Monthly trend of late arrivals with top offenders list', fields: 'Employee, Total Late Days, Max Late Min, Avg Late Min, Branch', filters: 'Month, Division', kpi: 'Late Days Count', drilldown: 'Employee → Daily', export: 'Excel, PDF', role: 'HR / DGM' },
      { id: 'ATT-05', name: 'Early Departure Report', purpose: 'All employees who left before shift end time', fields: 'Employee, Shift End, Actual Out, Early Minutes, Branch, Dept', filters: 'Date, Month, Branch', kpi: 'Early Departure Count', drilldown: 'Employee', export: 'Excel', role: 'Branch Manager / HR' },
      { id: 'ATT-06', name: 'Missing Punch / Incomplete Attendance Log', purpose: 'Employees with missing IN or OUT punch entries', fields: 'Employee, Date, Missing Punch Type, Branch, Shift', filters: 'Month, Branch', kpi: 'Missing Punch Count', drilldown: 'Employee → Manual Correction', export: 'Excel', role: 'HR / Branch Incharge' },
      { id: 'ATT-07', name: 'Absent Without Leave (AWL) Report', purpose: 'Critical report — employees absent with no approved leave', fields: 'Employee, Date, Branch, Dept, Supervisor, Leave Balance, Escalated', filters: 'Month, Branch, Division', kpi: 'AWL Count', drilldown: 'Employee → Leave History', export: 'Excel, PDF', role: 'HR / Branch Manager' },
      { id: 'ATT-08', name: 'Leave vs Attendance Reconciliation', purpose: 'Cross-validates approved leave against biometric absence records', fields: 'Employee, Leave Type, Approved Days, Absent Days, Variance, Flag', filters: 'Month, Branch', kpi: 'Unmatched Absences', drilldown: 'Employee', export: 'Excel', role: 'HR / Internal Audit' },
      { id: 'ATT-09', name: 'Overtime & Extended Hours Report', purpose: 'Employees working beyond shift end time with OT hours', fields: 'Employee, Shift End, Actual Out, OT Hours, Approved OT, Branch', filters: 'Month, Branch, Dept', kpi: 'Total OT Hours', drilldown: 'Employee', export: 'Excel', role: 'HR / Finance' },
      { id: 'ATT-10', name: 'Shift Management & Rotation Report', purpose: 'Shift schedule vs actual punch compliance for all shifts', fields: 'Shift, Employee Count, Compliance %, Late %, Absent %', filters: 'Month, Shift Type', kpi: 'Shift Compliance %', drilldown: 'Shift → Employee', export: 'Excel, PDF', role: 'HR / Branch Incharge' },
      { id: 'ATT-11', name: 'Manual Attendance Adjustment Audit Log', purpose: 'Tracks all supervisor-approved manual punch corrections', fields: 'Employee, Date, Original, Adjusted By, Reason, Timestamp', filters: 'Month, Branch', kpi: 'Adjustment Count', drilldown: 'Employee → Supervisor', export: 'Excel', role: 'Internal Audit / HR' },
      { id: 'ATT-12', name: 'Division-Wise Attendance Comparative Report', purpose: 'Side-by-side attendance comparison across all 8 divisions', fields: 'Division, Present %, Late %, Absent %, Best Branch, Worst Branch', filters: 'Month, Year', kpi: 'Division Attendance %', drilldown: 'Division → Branch', export: 'PDF, Excel', role: 'DGM / EVP' },
      { id: 'ATT-13', name: 'Holiday & Weekend Presence Report', purpose: 'Identifies employees who worked during holidays or weekends', fields: 'Employee, Date, Day Type, Branch, Entry Time, Exit Time', filters: 'Month, Division', kpi: 'Holiday Work Count', drilldown: 'Employee', export: 'Excel', role: 'HR / Finance' },
      { id: 'ATT-14', name: 'Long Absence & Extended Leave Pattern', purpose: 'Flags employees with repeated or extended absence patterns', fields: 'Employee, Absence Days (MTD/YTD), Pattern Type, Branch', filters: 'Quarter, Year', kpi: 'Long Absence Count', drilldown: 'Employee → Leave Record', export: 'Excel', role: 'HR / Internal Audit' },
    ]
  },
  {
    id: 'access',
    label: 'Access Control',
    icon: '🔑',
    color: '#7c3aed',
    bg: '#f5f3ff',
    reports: [
      { id: 'AC-01', name: 'Access Group Membership Report', purpose: 'All employees per access group with door and schedule mapping', fields: 'Group ID, Group Name, Employee, Branch, Clearance Level, Doors', filters: 'Access Group, Division', kpi: 'Members per Group', drilldown: 'Employee', export: 'Excel, PDF', role: 'Security Admin / IT' },
      { id: 'AC-02', name: 'Branch-Wise Access Group Configuration Report', purpose: 'Which access groups are active per branch', fields: 'Branch, Active Groups, Door Count, Schedule, Last Updated', filters: 'Division, Branch', kpi: 'Groups per Branch', drilldown: 'Branch → Group', export: 'Excel', role: 'Security Admin' },
      { id: 'AC-03', name: 'Door Access Configuration Audit', purpose: 'Full door configuration inventory — lock type, mode, schedule, group', fields: 'Door ID, Door Name, Branch, Lock Type, Auth Mode, Access Group, Schedule', filters: 'Branch, Division, Lock Type', kpi: 'Misconfigured Doors', drilldown: 'Door → Events', export: 'Excel, PDF', role: 'IT / Security' },
      { id: 'AC-04', name: 'High-Security Zone Access Log (Daily)', purpose: 'Daily audit of Treasury, SWIFT, Server Room, Vault access', fields: 'Zone, Employee, Role, Time, Auth Mode, Result, Denial Reason', filters: 'Zone, Date, Result', kpi: 'Granted/Denied Count', drilldown: 'Employee → Zone History', export: 'PDF', role: 'CISO / Compliance' },
      { id: 'AC-05', name: 'Employee Joiner Access Provisioning Log', purpose: 'New employee biometric credential creation and access group assignment', fields: 'Employee, Join Date, Access Group, Doors Granted, Provisioned By', filters: 'Month, Branch', kpi: 'New Credentials', drilldown: 'Employee', export: 'Excel', role: 'IT / HR' },
      { id: 'AC-06', name: 'Employee Leaver Credential Deactivation Report', purpose: 'Tracks deactivation of credentials for resigned/terminated employees', fields: 'Employee, Last Active Date, Termination Date, Revoked By, Status', filters: 'Month, Branch', kpi: 'Revocation Compliance %', drilldown: 'Employee', export: 'Excel', role: 'IT / HR / Audit' },
      { id: 'AC-07', name: 'Role Transfer & Access Change Audit', purpose: 'Documents all access level changes due to transfers or promotions', fields: 'Employee, Old Group, New Group, Transfer Date, Approved By', filters: 'Month, Division', kpi: 'Role Changes', drilldown: 'Employee → History', export: 'Excel', role: 'IT / Audit' },
      { id: 'AC-08', name: 'Dual-Custody Access Compliance Report', purpose: 'Ensures Treasury and Vault entries always have two officers', fields: 'Zone, Entry Time, Officer 1, Officer 2, Result, Duration', filters: 'Month, Zone', kpi: 'Single-Person Breaches', drilldown: 'Entry Detail', export: 'PDF', role: 'Compliance / CISO' },
      { id: 'AC-09', name: 'VIP & Executive Zone Access Report', purpose: 'CEO Suite, Board Room, and Executive Floor access records', fields: 'Zone, Employee, Rank, Time, Duration, Result', filters: 'Month, Zone', kpi: 'VIP Zone Entries', drilldown: 'Employee → Trail', export: 'PDF', role: 'EA / Security' },
      { id: 'AC-10', name: 'After-Hours Access Report', purpose: 'All access events outside normal banking hours (08:30–18:30)', fields: 'Employee, Door, Branch, Time, Day, Auth Mode, Result', filters: 'Month, Branch', kpi: 'After-Hours Events', drilldown: 'Employee', export: 'Excel', role: 'Security / Compliance' },
      { id: 'AC-11', name: 'Access Level Expiry & Renewal Report', purpose: 'Tracks time-bound access credentials nearing or past expiry with clearance tiers and authorized doors', fields: 'Employee, Access Level, Branch, Clearance Tier, Authorized Doors, Expiry Date, Status', filters: 'Division, Status', kpi: 'Expired Credentials', drilldown: 'Employee', export: 'Excel', role: 'IT Admin' },
      { id: 'AC-12', name: 'Interlock & Time-Lock Policy Compliance Report', purpose: 'Validates interlock door sequences are respected', fields: 'Door A, Door B, Sequence Violation Count, Branch, Date', filters: 'Month, Branch', kpi: 'Interlock Violations', drilldown: 'Event', export: 'PDF', role: 'Security / IT' },
      { id: 'AC-13', name: 'Real-Time Door Status & Sensor Telemetry Report', purpose: 'Live relay state, magnetic reed switch continuity, and alarm loop status across 2,696 doors', fields: 'Door ID, Portal Name, Branch, Magnetic Sensor, Alarm Loop, Relay Status, Ping Latency, Last Event', filters: 'Division, Sensor Status, Alarm Loop', kpi: 'Sensor Alarms', drilldown: 'Door → Telemetry Log', export: 'Excel, PDF', role: 'Security / SOC' },
    ]
  },
  {
    id: 'device',
    label: 'Device / Infrastructure',
    icon: '💻',
    color: '#2563eb',
    bg: '#eff6ff',
    reports: [
      { id: 'DEV-01', name: 'Total Device Inventory Report', purpose: 'Complete registry of all 1,658 Suprema terminals deployed', fields: 'Device ID, Model, Serial, IP, Branch, Location, Status, Firmware', filters: 'Division, Model, Status', kpi: 'Total Devices', drilldown: 'Device Detail', export: 'Excel, PDF', role: 'IT Manager' },
      { id: 'DEV-02', name: 'Active / Online Device Report', purpose: 'All online devices with last heartbeat and response time', fields: 'Device ID, Branch, IP, Status, Ping, Last Heartbeat, Firmware', filters: 'Division, Branch', kpi: 'Online Devices', drilldown: 'Device → Events', export: 'Excel', role: 'IT / Dealer' },
      { id: 'DEV-03', name: 'Inactive / Offline Device Report', purpose: 'All offline or degraded devices requiring field intervention', fields: 'Device ID, Branch, Last Online, Offline Duration, Fault Type, Assigned Tech', filters: 'Division, Offline Duration', kpi: 'Offline Count', drilldown: 'Device → Ticket', export: 'Excel, PDF', role: 'IT / Dealer / Service' },
      { id: 'DEV-04', name: 'Device Uptime & SLA Adherence Report', purpose: 'Monthly uptime calculation per device vs. SLA contract target', fields: 'Device, Branch, Uptime %, SLA Target %, Downtime Hours, Breach', filters: 'Month, Division, SLA Breach', kpi: 'Avg Uptime %', drilldown: 'Device → Event Log', export: 'PDF, Excel', role: 'IT / Dealer / C-Suite' },
      { id: 'DEV-05', name: 'Firmware Compliance Report', purpose: 'Tracks which devices are on latest approved firmware version', fields: 'Device, Branch, Current Firmware, Latest Firmware, Status', filters: 'Division, Version', kpi: 'Outdated Firmware Count', drilldown: 'Device', export: 'Excel', role: 'IT Manager' },
      { id: 'DEV-06', name: 'Tamper Alert & Physical Security Report', purpose: 'All physical tampering alerts per device with response record', fields: 'Device, Branch, Tamper Time, Type, Duration, Resolved By', filters: 'Month, Division', kpi: 'Tamper Events', drilldown: 'Device → Alert History', export: 'PDF', role: 'Security / IT' },
      { id: 'DEV-07', name: 'Warranty & SLA Coverage Status Report', purpose: 'Tracks warranty and dealer SLA expiry per device', fields: 'Device, Model, Purchase Date, Warranty End, SLA End, Status', filters: 'Division, Expiry Window', kpi: 'Expiring Warranties', drilldown: 'Device', export: 'Excel', role: 'IT / Finance / Dealer' },
      { id: 'DEV-08', name: 'Branch Device Health Telemetry Summary', purpose: 'Per-branch device health summary with online rate and fault count', fields: 'Branch, Total Devices, Online, Offline, Tamper, Avg Ping', filters: 'Division, Health Score', kpi: 'Branch Device Uptime %', drilldown: 'Branch → Device', export: 'Excel, PDF', role: 'IT Manager / DGM' },
    ]
  },
  {
    id: 'audit',
    label: 'Audit & Compliance',
    icon: '📋',
    color: '#059669',
    bg: '#ecfdf5',
    reports: [
      { id: 'AUD-01', name: 'Administrative Activity Audit Trail', purpose: 'Full immutable log of all system admin actions in BioStar X', fields: 'User, Action, Module, Old Value, New Value, Timestamp, IP, Result', filters: 'Month, Admin User, Module', kpi: 'Admin Actions', drilldown: 'Action Detail', export: 'PDF', role: 'Internal Audit / CISO' },
      { id: 'AUD-02', name: 'Biometric Data Integrity Audit', purpose: 'Validates that biometric template counts match enrollment records', fields: 'Employee, Enrolled Templates, DB Count, Status, Flag', filters: 'Division, Status', kpi: 'Integrity Failures', drilldown: 'Employee → Templates', export: 'Excel', role: 'IT / Audit' },
      { id: 'AUD-03', name: 'Report Export Audit Log', purpose: 'Tracks who exported which reports and when (non-repudiation)', fields: 'Report Name, Exported By, Timestamp, Format, Filters Applied, IP', filters: 'Month, Report Type', kpi: 'Export Count', drilldown: 'Export Detail', export: 'PDF', role: 'Internal Audit' },
      { id: 'AUD-04', name: 'Access Policy Violation Trend Report', purpose: 'Monthly trend of all policy violations (APB, interlock, after-hours)', fields: 'Violation Type, Count, Branch, Month-over-Month Change', filters: 'Quarter, Type', kpi: 'Policy Violations', drilldown: 'Type → Event', export: 'PDF, Excel', role: 'Compliance / CISO' },
      { id: 'AUD-05', name: 'Segregation of Duties Compliance Report', purpose: 'Ensures no employee has conflicting high-risk access combinations', fields: 'Employee, Group 1, Group 2, Conflict Type, Branch, Status', filters: 'Access Group, Branch', kpi: 'SoD Conflicts', drilldown: 'Employee → Access', export: 'PDF', role: 'Internal Audit / Compliance' },
      { id: 'AUD-06', name: 'User Privilege Review Report (Quarterly)', purpose: 'Quarterly review of all privileged access grants for recertification', fields: 'Employee, Access Level, Access Group, Doors, Last Reviewed, Status', filters: 'Quarter, Access Level', kpi: 'Overdue Reviews', drilldown: 'Employee → Manager', export: 'PDF', role: 'IT / Audit / HR' },
      { id: 'AUD-07', name: 'Bangladesh Bank Regulatory Compliance Report', purpose: 'Maps BioStar X controls to Bangladesh Bank physical security circulars', fields: 'Control ID, BB Requirement, Implementation Status, Evidence, Gap', filters: 'Quarter, Control Area', kpi: 'Compliance %', drilldown: 'Control → Evidence', export: 'PDF (Formal)', role: 'Compliance / CISO' },
      { id: 'AUD-08', name: 'Annual Physical Security Audit Summary', purpose: 'Full year summary for annual board-level physical security review', fields: 'KPI, Target, Achieved, Variance, Trend, Recommendation', filters: 'Year', kpi: 'Annual Security Score', drilldown: 'KPI → Monthly Data', export: 'PDF (Formal)', role: 'Board / CISO / GM' },
    ]
  }
];

function ReportCard({ report, catColor }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div id={`report-card-${report.id}`} style={{
      background: '#fff', border: `1px solid #e2e8f0`, borderRadius: 8,
      overflow: 'hidden', transition: 'box-shadow 0.2s',
      boxShadow: expanded ? '0 4px 16px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
      borderLeft: `3px solid ${catColor}`
    }}>
      <div onClick={() => setExpanded(e => !e)} style={{
        padding: '12px 16px', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: `${catColor}15`, color: catColor, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{report.id}</span>
            <span style={{ fontWeight: 700, color: '#1f2937', fontSize: 13 }}>{report.name}</span>
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{report.purpose}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 10, background: '#f1f5f9', color: '#374151', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{report.export}</span>
          <span style={{ fontSize: 14, color: '#9ca3af', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginTop: 10 }}>
            {[
              ['Fields / Columns', report.fields],
              ['Filters', report.filters],
              ['Dashboard KPI', report.kpi],
              ['Drill-down', report.drilldown],
              ['Export Format', report.export],
              ['Primary User Role', report.role],
            ].map(([label, val]) => (
              <div key={label} style={{ padding: '8px 10px', background: '#f8f9fb', borderRadius: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TenderReportCatalog({ onNavigate }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const allReports = CATEGORIES.flatMap(c => c.reports.map(r => ({ ...r, catId: c.id, catLabel: c.label, catColor: c.color })));

  const filtered = allReports.filter(r => {
    if (activeCategory !== 'all' && r.catId !== activeCategory) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.purpose.toLowerCase().includes(search.toLowerCase()) && !r.id.toLowerCase().includes(search.toLowerCase()) && !r.role.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const printCatalog = () => window.print();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #059669 100%)', borderRadius: 10, padding: '18px 22px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(5,150,105,0.3)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 30 }}>📋</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Official Bank Tender Report Catalog</div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Pubali Bank PLC · Suprema BioStar X Deployment · 60 Formal Reports across 6 Functional Categories</div>
          </div>
        </div>
        <div className="no-print" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {onNavigate && (
            <button
              onClick={() => onNavigate('exec-reports')}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(15,23,42,0.6)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              👔 Executive / Board Reports Suite ↗
            </button>
          )}
          <button id="catalog-print-btn" onClick={printCatalog}
            style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            🖨️ Print Catalog
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <div key={c.id} style={{ background: c.bg, border: `1px solid ${c.color}22`, borderRadius: 8, padding: '10px 16px', flex: 1, minWidth: 110, textAlign: 'center' }}>
            <div style={{ fontSize: 18 }}>{c.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.color, marginTop: 3 }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.color }}>{c.reports.length}</div>
          </div>
        ))}
        <div style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 16px', flex: 1, minWidth: 110, textAlign: 'center' }}>
          <div style={{ fontSize: 18 }}>📊</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginTop: 3 }}>Total</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#374151' }}>{allReports.length}</div>
        </div>
      </div>

      {/* Category Tabs + Search */}
      <div className="no-print" style={{ background: '#fff', borderRadius: 8, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button id="cat-tab-all" onClick={() => setActiveCategory('all')} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid', borderColor: activeCategory === 'all' ? '#059669' : '#d1d5db', background: activeCategory === 'all' ? '#059669' : '#fff', color: activeCategory === 'all' ? '#fff' : '#374151', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
          All ({allReports.length})
        </button>
        {CATEGORIES.map(c => (
          <button key={c.id} id={`cat-tab-${c.id}`} onClick={() => setActiveCategory(c.id)} style={{
            padding: '6px 14px', borderRadius: 20, border: '1px solid',
            borderColor: activeCategory === c.id ? c.color : '#d1d5db',
            background: activeCategory === c.id ? c.color : '#fff',
            color: activeCategory === c.id ? '#fff' : '#374151',
            fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s'
          }}>
            {c.icon} {c.label} ({c.reports.length})
          </button>
        ))}
        <input id="catalog-search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, purpose, role…"
          style={{ flex: 1, minWidth: 200, padding: '7px 12px', borderRadius: 5, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }} />
        <span style={{ fontSize: 12, color: '#6b7280' }}><strong>{filtered.length}</strong> reports</span>
      </div>

      {/* Report List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activeCategory === 'all' && !search
          ? CATEGORIES.map(cat => (
            <div key={cat.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', marginBottom: 8, marginTop: 4 }}>
                <div style={{ fontSize: 18 }}>{cat.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cat.label} Reports</div>
                <div style={{ flex: 1, height: 1, background: `${cat.color}22` }} />
                <div style={{ fontSize: 11, color: cat.color, fontWeight: 600 }}>{cat.reports.length} reports</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cat.reports.map(r => (
                  <ReportCard key={r.id} report={r} catColor={cat.color} />
                ))}
              </div>
            </div>
          ))
          : filtered.map(r => (
            <ReportCard key={r.id} report={{ ...r }} catColor={r.catColor} />
          ))
        }
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            No reports match your search.
          </div>
        )}
      </div>
    </div>
  );
}
