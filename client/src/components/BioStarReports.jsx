import React, { useState, useEffect } from 'react';
import BioStarPdfSpecificationView from './BioStarPdfSpecificationView';
import BioStarCustomReportBuilder from './BioStarCustomReportBuilder';
import ExecutiveReportsPage from './ExecutiveReportsPage';
import SecurityReportsHub from './reports/SecurityReportsHub';
import { EXECUTIVE_REPORTS_META } from '../data/executiveReportsData';

// ─── Icon helpers ─────────────────────────────────────────
const icons = {
  executive: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  key:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
  device: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeWidth="3"/></svg>,
  door: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="26" height="26"><path d="M14 2H3v20h18V9z"/><path d="M14 2v7h7"/><circle cx="16" cy="13" r="1.5" fill="currentColor" stroke="none"/></svg>,
  chevron: <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>,
};

// ─── REPORT CARD DATA ─────────────────────────────────────
const REPORT_CARDS = [
  {
    id: 'executive',
    title: 'EXECUTIVE / BOARD REPORT',
    sub: 'CEO, MD & Board-level governance (EB-01 ~ EB-08)',
    icon: 'executive',
    items: [
      { id: 'eb-01', code: 'EB-01', label: 'EB-01: CEO / MD Executive Dashboard Summary' },
      { id: 'eb-02', code: 'EB-02', label: 'EB-02: Board Security & Compliance Overview' },
      { id: 'eb-03', code: 'EB-03', label: 'EB-03: Divisional Workforce Attendance Summary' },
      { id: 'eb-04', code: 'EB-04', label: 'EB-04: Monthly Biometric Compliance Report' },
      { id: 'eb-05', code: 'EB-05', label: 'EB-05: YTD Branch Performance Scorecard' },
      { id: 'eb-06', code: 'EB-06', label: 'EB-06: Quarterly SLA & Uptime Governance Report' },
      { id: 'eb-07', code: 'EB-07', label: 'EB-07: Executive Incident Intelligence Brief' },
      { id: 'eb-08', code: 'EB-08', label: 'EB-08: Payroll-Linked Attendance Integrity Audit' },
    ],
  },
  {
    id: 'user',
    title: 'USER REPORT',
    sub: 'Employee & enrollment statistics',
    icon: 'user',
    items: [
      { id: 'user-group',      label: 'Group Report' },
      { id: 'user-branch',     label: 'Branch Report' },
      { id: 'user-subbranch',  label: 'Sub Branch Report' },
      { id: 'user-ro',         label: 'RO Report' },
      { id: 'user-headoffice', label: 'Head Office Report' },
    ],
  },
  {
    id: 'access',
    title: 'ACCESS REPORT',
    sub: 'Door events & access group logs',
    icon: 'key',
    items: [
      { id: 'acc-all',    label: 'All Access Group Report' },
      { id: 'acc-branch', label: 'Branch Wise Access Group' },
      { id: 'acc-sub',    label: 'Sub Branch Wise Access Group' },
      { id: 'acc-region', label: 'Region Wise Access Group' },
      { id: 'acc-ho',     label: 'Head Office Access Group' },
    ],
  },
  {
    id: 'device',
    title: 'DEVICE REPORT',
    sub: 'Terminal inventory & health status',
    icon: 'device',
    items: [
      { id: 'dev-total',    label: 'Total Device Report' },
      { id: 'dev-branch',   label: 'Branch Device Report' },
      { id: 'dev-sub',      label: 'Sub Branch Device Report' },
      { id: 'dev-ro',       label: 'RO Device Report' },
      { id: 'dev-ho',       label: 'Head Office Device Report' },
      { id: 'dev-status',   label: 'Device Status Report' },
      { id: 'dev-active',   label: 'Active Device Report' },
      { id: 'dev-inactive', label: 'Inactive Device Report' },
    ],
  },
  {
    id: 'door',
    title: 'DOOR REPORT',
    sub: 'Door status, physical security & access requirements',
    icon: 'door',
    items: [
      { id: 'door-all',        label: 'All Door Report' },
      { id: 'door-branch',     label: 'Branch Wise Door Report' },
      { id: 'door-subbranch',  label: 'Sub-Branch Wise Door Report' },
      { id: 'door-ro',         label: 'Region Wise Door Report' },
      { id: 'door-ho',         label: 'Head Office Door Report' },
      { id: 'door-attendance', label: 'Attendance Door Report' },
      { id: 'door-acs',        label: 'Access Control (ACS) Door Report' },
      { id: 'door-vault',      label: 'Vault & High-Security Door Report' },
      { id: 'door-status',     label: 'Door Status & Alarm Report' },
    ],
  },
];

// ─── REPORT DETAIL MODAL DATA ──────────────────────────────
const MOCK_TABLE = {
  'user-group': {
    cols: ['Group Name', 'Members', 'Branch Coverage', 'Status'],
    rows: [
      ['Vault Custodians',    '3',  'All Branches',        'Active'],
      ['Cash Officers',       '18', 'Metropolitan Zones',  'Active'],
      ['IT Admin',            '12', 'Head Office + ROs',   'Active'],
      ['Branch Managers',     '520','All Branches',        'Active'],
      ['General Staff',       '34,447', 'Nationwide',      'Active'],
    ],
  },
  'user-branch': {
    cols: ['Branch Name', 'Branch Code', 'Total Users', 'Enrolled FP', 'Enrolled Card'],
    rows: [
      ['Dhanmondi Branch',    '0142', '150', '148', '150'],
      ['Motijheel Branch',    '0102', '165', '163', '165'],
      ['Gulshan Branch',      '0105', '130', '128', '130'],
      ['Head Office',         '0101', '840', '838', '840'],
      ['Agrabad Branch',      '0201', '210', '207', '210'],
    ],
  },
  'acc-all': {
    cols: ['Event Time', 'Branch', 'Door', 'Employee', 'Auth Mode', 'Result'],
    rows: [
      ['09:02:14', 'Dhanmondi',  'Main Door',    'Tariqul Islam',  'FP',    'Granted'],
      ['09:03:48', 'Head Office','Exec Suite',   'Nazrul Islam',   'Card',  'Granted'],
      ['09:11:22', 'Motijheel', 'Side Gate',     'Unknown',        'Card',  'Denied'],
      ['09:14:05', 'Agrabad',   'Vault Room',    'Nasir Uddin',    'FP',    'Granted'],
      ['09:18:33', 'Ramna',     'Main Door',     'Kabir Hossain',  'FP',    'Granted'],
    ],
  },
  'dev-total': {
    cols: ['Device ID', 'Model', 'Branch', 'IP Address', 'Firmware', 'Status'],
    rows: [
      ['DEV-0142-01', 'BioStation 3',   'Dhanmondi', '10.14.20.101', 'v1.5.2', 'Online'],
      ['DEV-0142-02', 'BioStation 2',   'Dhanmondi', '10.14.20.102', 'v2.1.0', 'Online'],
      ['DEV-0101-01', 'BioStation 3',   'Head Office','10.10.14.11', 'v1.5.2', 'Online'],
      ['DEV-0108-01', 'BioLite N2',     'Ramna Br',  '10.10.14.28', 'v1.4.0', 'Offline'],
      ['DEV-0201-01', 'BioStation 3',   'Agrabad',   '10.20.14.11', 'v1.3.1', 'Online'],
    ],
  },
  'door-all': {
    cols: ['Door ID', 'Door Name', 'Branch / Division', 'Door Requirement', 'Locking Hardware', 'Status', 'Last Event'],
    rows: [
      ['DOR-01', 'X-Branch Main Entrance ACS', 'X-Branch (Dhaka)', 'Main Perimeter ACS', 'Mag Lock (CS-40 R1)', 'Locked', '09:02:14'],
      ['DOR-02', 'X-Branch Attn Checkpoint', 'X-Branch (Dhaka)', 'Attendance Punch Checkpoint', 'Direct Pass-thru', 'Pass-thru', '09:01:50'],
      ['DOR-13', 'Y-Branch Cash Vault & Strong Room', 'Y-Branch (Chittagong)', 'Vault & High Security Dual Custody', 'Time-Lock Interlock', 'Locked', '08:30:00'],
      ['DOR-11', 'Head Office Central Vault & Treasury', 'Head Office (Motijheel)', 'Vault & High Security Dual Custody', 'Dual-Auth Armed', 'Locked', '08:15:10'],
      ['DOR-12', 'HO Tier-IV Data Center Interlock', 'Head Office (Floor 4)', 'Data Center Interlock', 'Air-Lock Interlock', 'Locked', '08:55:01'],
      ['DOR-22', 'Motijheel Emergency Fire Exit Door', 'Motijheel Branch', 'Emergency Fire Exit Monitored', 'Mag Lock Fire Release', 'Alarm', '09:12:05'],
    ],
  },
  'door-branch': {
    cols: ['Door ID', 'Door Name', 'Branch Name', 'Zone', 'Security Requirement', 'Lock Type', 'Status'],
    rows: [
      ['DOR-01', 'X-Branch Main Entrance ACS', 'X-Branch', 'Dhaka North', 'Main Perimeter ACS', 'Electromagnetic Lock', 'Locked'],
      ['DOR-03', 'Y-Branch Main Entrance ACS', 'Y-Branch', 'Chittagong South', 'Main Perimeter ACS', 'Electromagnetic Lock', 'Locked'],
      ['DOR-05', 'Z-Branch Security Gate', 'Z-Branch', 'Sylhet East', 'High-Security Gate', 'Solenoid Bolt Lock', 'Locked'],
      ['DOR-13', 'Y-Branch Cash Vault & Strong Room', 'Y-Branch', 'Chittagong South', 'Vault Dual Custody', 'Time-Delay Lock', 'Locked'],
      ['DOR-14', 'X-Branch Teller Mantrap Door', 'X-Branch', 'Dhaka North', 'Cash Counter Mantrap', 'Dual Interlock Relay', 'Locked'],
    ],
  },
  'door-subbranch': {
    cols: ['Door ID', 'Door Name', 'Sub-Branch (Upashakha)', 'Parent Branch', 'Requirement', 'Reader Hardware', 'Status'],
    rows: [
      ['DOR-07', 'A-Sub-Br Entrance ACS', 'A-Sub-Br (Savar)', 'Mirpur Branch', 'Main Perimeter ACS', 'BioEntry W2', 'Locked'],
      ['DOR-08', 'A-Sub-Br Attn Clock', 'A-Sub-Br (Savar)', 'Mirpur Branch', 'Attendance Punch Checkpoint', 'BioEntry W2', 'Pass-thru'],
      ['DOR-15', 'X-Sub Br Security Entrance', 'X-Sub Br (Tongi)', 'Gazipur Branch', 'Sub-Branch Perimeter ACS', 'BioLite N2 Keypad', 'Alarm'],
      ['DOR-16', 'X-Sub Br Teller Safe Access', 'X-Sub Br (Tongi)', 'Gazipur Branch', 'Vault & High Security Safe', 'BioLite N2 (FP+PIN)', 'Locked'],
    ],
  },
  'door-ro': {
    cols: ['Door ID', 'Door Name', 'Regional Office', 'Zone / Floor', 'Clearance Level', 'Relay Architecture', 'Status'],
    rows: [
      ['DOR-09', 'X-RO Main Access Turnstiles', 'RO-X (Dhaka Regional)', 'Floor 1 Main Atrium', 'Level 3 (Supervisory)', 'CS-40 R1-R4 Banks', 'Locked'],
      ['DOR-10', 'X-RO Attendance Clock', 'RO-X (Dhaka Regional)', 'Floor 1 Atrium Lobby', 'Standard Biometric', 'Direct Pass-thru', 'Pass-thru'],
      ['DOR-17', 'RO-X Regional Server Room Door', 'RO-X (Dhaka Regional)', 'Floor 2 IT Suite', 'Level 4 (IT Clearance)', 'CS-40 Dual Interlock', 'Locked'],
      ['DOR-18', 'RO-Y Executive Wing Access', 'RO-Y (Chittagong RO)', 'Floor 3 Executive Suite', 'Level 4 (Executive)', 'CS-40 Fail-Secure', 'Locked'],
    ],
  },
  'door-ho': {
    cols: ['Door ID', 'Door Name', 'Head Office Floor', 'Security Tier', 'Interlock Hardware', 'Dual Custody', 'Status'],
    rows: [
      ['DOR-11', 'Head Office Central Vault & Treasury', 'Sub-Basement B2 Safe', 'Level 5 (Dual Custody)', 'Heavy Vault Dual Relay', 'Enforced (2 Officers)', 'Locked'],
      ['DOR-12', 'Head Office Tier-IV Data Center Interlock', 'Floor 4 Primary Data Center', 'Level 5 (Restricted)', 'CoreStation CS-40 Air-Lock', 'Enforced (SysAdmin+Sec)', 'Locked'],
      ['DOR-19', 'Head Office Main Lobby Turnstiles', 'Ground Floor Grand Lobby', 'Level 2 (Corporate)', 'Optical Turnstile Relays', 'Standard Badge', 'Locked'],
      ['DOR-20', 'Head Office Main Lobby Attn Portal', 'Ground Floor North Lobby', 'Standard Punch Tier', 'Direct Turnstile Barrier', 'Open Punch Clock', 'Pass-thru'],
      ['DOR-21', 'Head Office Board of Directors Suite', 'Floor 18 Executive Floor', 'Level 5 (Executive)', 'Fail-Secure Solenoid', 'Board Authorized Only', 'Locked'],
    ],
  },
  'door-attendance': {
    cols: ['Door ID', 'Checkpoint Name', 'Location', 'Pass-thru Mode', 'Shift Synchronization', 'Total Punches Today', 'Status'],
    rows: [
      ['DOR-02', 'X-Branch Attn Checkpoint', 'X-Branch Ground Floor', 'Pass-thru Turnstile', 'Morning Shift (08:30)', '142 Punches', 'Active'],
      ['DOR-04', 'Y-Branch Attn Checkpoint', 'Y-Branch Staff Vestibule', 'Pass-thru Wall Mount', 'Morning Shift (08:30)', '128 Punches', 'Active'],
      ['DOR-06', 'Z-Branch Attn Checkpoint', 'Z-Branch Lobby Barrier', 'Pass-thru Turnstile', 'Morning Shift (08:30)', '110 Punches', 'Active'],
      ['DOR-08', 'A-Sub-Br Attn Clock', 'A-Sub-Br Counter Entrance', 'Wall Terminal Clock', 'Standard Shift (08:30)', '24 Punches', 'Active'],
      ['DOR-10', 'X-RO Attendance Clock', 'RO-X Floor 1 Atrium', 'Pass-thru Fast Lane', 'Flexible Office Shift', '285 Punches', 'Active'],
      ['DOR-20', 'Head Office Main Lobby Attn Portal', 'HO Ground Floor North Lobby', 'Pass-thru 6-Lane Bank', 'Corporate Shift (08:30)', '812 Punches', 'Active'],
    ],
  },
  'door-acs': {
    cols: ['Door ID', 'Door Name', 'Branch / Site', 'Access Level', 'Relay Arming', 'Anti-Passback', 'Status'],
    rows: [
      ['DOR-01', 'X-Branch Main Entrance ACS', 'X-Branch', 'Level 2 (Standard Branch)', 'Armed (CS-40 R1)', 'Soft APB Enabled', 'Locked'],
      ['DOR-03', 'Y-Branch Main Entrance ACS', 'Y-Branch', 'Level 2 (Standard Branch)', 'Armed (CS-40 R2)', 'Soft APB Enabled', 'Locked'],
      ['DOR-05', 'Z-Branch Security Gate', 'Z-Branch', 'Level 3 (Supervisory)', 'Armed (CS-40 R3)', 'Hard APB Enabled', 'Locked'],
      ['DOR-07', 'A-Sub-Br Entrance ACS', 'A-Sub-Br', 'Level 2 (Upashakha Staff)', 'Direct Relay Armed', 'Standard Mode', 'Locked'],
      ['DOR-09', 'X-RO Main Access Turnstiles', 'RO-X', 'Level 3 (Regional Staff)', 'Armed (CS-40 R1-R4)', 'Hard APB Enabled', 'Locked'],
      ['DOR-19', 'Head Office Main Lobby Turnstiles', 'Head Office', 'Level 2 (Corporate Staff)', 'Armed (CS-40 Banks)', 'Hard APB Enabled', 'Locked'],
    ],
  },
  'door-vault': {
    cols: ['Door ID', 'Vault Door Name', 'Location', 'Dual Custody Custodians', 'Time-Lock Schedule', 'Interlock State', 'Status'],
    rows: [
      ['DOR-11', 'Head Office Central Vault & Treasury', 'HO Sub-Basement B2', 'Treasury DGM + Vault Custodian', '08:00 - 17:00 Strict Window', 'Armed & Monitored', 'Locked'],
      ['DOR-13', 'Y-Branch Cash Vault & Strong Room', 'Y-Branch Basement Vault', 'Branch Manager + Cash Officer', '08:30 - 16:30 Banking Hours', 'Interlocked with Mantrap', 'Locked'],
      ['DOR-16', 'X-Sub Br Teller Safe Access', 'X-Sub Br Rear Service Area', 'Upashakha In-Charge + Cashier', '08:45 - 16:00 Banking Hours', 'Time-Delay Lock Active', 'Locked'],
      ['DOR-14', 'X-Branch Teller Mantrap Door', 'X-Branch Ground Floor', 'Dual Cash Officers', 'Continuous Business Hours', 'Two-Door Interlock Active', 'Locked'],
    ],
  },
  'door-status': {
    cols: ['Door ID', 'Door Name', 'Location', 'Telemetry State', 'Sensor Condition', 'Alarm Flag', 'Last Status Change'],
    rows: [
      ['DOR-01', 'X-Branch Main Entrance ACS', 'X-Branch', 'Normal Armed', 'Contact Closed / Relay OK', 'None', '09:02:14 (Access Granted)'],
      ['DOR-15', 'X-Sub Br Security Entrance', 'X-Sub Br', 'Door Held Open', 'Sensor Open > 30s', 'Held Open Alert', '09:10:45 (Warning)'],
      ['DOR-22', 'Motijheel Emergency Fire Exit Door', 'Motijheel Branch', 'Forced Open Alarm', 'Contact Broken Violently', 'Door Forced Alarm', '09:12:05 (Critical Alert)'],
      ['DOR-23', 'Dhanmondi Rear Cash Delivery Gate', 'Dhanmondi Branch', 'Tamper Alarm Triggered', 'Tamper Switch Actuated', 'Tamper Triggered', '08:58:20 (Security Alert)'],
      ['DOR-11', 'Head Office Central Vault & Treasury', 'Head Office B2', 'Dual-Auth Armed', 'Both Contact Relays Armed', 'None', '08:15:10 (Authorized Access)'],
    ],
  },
};

function getFallbackTable(id) {
  const card = REPORT_CARDS.find(c => c.items.some(i => i.id === id));
  if (card?.id === 'user') return MOCK_TABLE['user-branch'];
  if (card?.id === 'access') return MOCK_TABLE['acc-all'];
  if (card?.id === 'device') return MOCK_TABLE['dev-total'];
  if (card?.id === 'door') return MOCK_TABLE['door-all'];
  return { cols: ['ID', 'Name', 'Status', 'Date'], rows: [['—', '—', '—', '—']] };
}

// ─── REPORT DETAIL MODAL ───────────────────────────────────
function ReportModal({ item, onClose }) {
  const isExec = Boolean(item.code || item.id?.startsWith('eb-'));
  const execMeta = isExec ? (EXECUTIVE_REPORTS_META[item.code || item.id.toUpperCase()] || EXECUTIVE_REPORTS_META['EB-01']) : null;
  const tableData = execMeta ? { cols: execMeta.cols, rows: execMeta.rows } : (MOCK_TABLE[item.id] || getFallbackTable(item.id));
  const [search, setSearch] = useState('');
  const [filterDiv, setFilterDiv] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const titleText = execMeta?.name || item.label?.replace(/^[A-Z0-9-]+:\s*/, '') || item.label;

  const statusColIdx = tableData.cols.length - 1;
  const availableStatuses = Array.from(
    new Set(tableData.rows.map(r => String(r[statusColIdx])).filter(Boolean))
  );

  const filteredRows = tableData.rows.filter(row => {
    if (filterDiv !== 'All') {
      const norm = filterDiv.toLowerCase().replace('division', '').trim();
      const match = row.some(cell => {
        const s = String(cell).toLowerCase();
        if (norm.startsWith('baris')) {
          return s.includes('barisal') || s.includes('barishal');
        }
        return s.includes(norm);
      });
      if (!match) return false;
    }
    if (filterStatus !== 'All') {
      const match = row.some(cell => String(cell).toLowerCase() === filterStatus.toLowerCase());
      if (!match) return false;
    }
    if (search) {
      return row.some(cell => String(cell).toLowerCase().includes(search.toLowerCase()));
    }
    return true;
  });

  const handleDownload = () => {
    const csvContent = [
      tableData.cols.join(','),
      ...filteredRows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(execMeta ? execMeta.id + '_' : '')}${titleText.replace(/[^a-zA-Z0-9]/g, '_')}_PubaliBank.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bs-modal-overlay" onClick={onClose}>
      <div className="bs-modal" style={{ maxWidth: isExec ? 1120 : 880, width: '96vw', maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
        <div className="bs-modal-header" style={{ background: isExec ? '#0f172a' : undefined, color: isExec ? '#fff' : undefined }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isExec && (
              <span style={{ background: '#059669', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                {execMeta?.id || item.code}
              </span>
            )}
            <span className="bs-modal-title" style={{ color: isExec ? '#fff' : undefined }}>
              {titleText}
            </span>
          </div>
          <button className="bs-modal-close" style={{ color: isExec ? '#fff' : undefined }} onClick={onClose}>✕</button>
        </div>

        {isExec && execMeta && (
          <div style={{ background: '#f8fafc', padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 12.5, color: '#475569' }}>
                <strong>Purpose:</strong> {execMeta.purpose}
              </div>
              <div style={{ display: 'flex', gap: 6, fontSize: 11, fontWeight: 700 }}>
                <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: 4, color: '#334155' }}>
                  Audience: {execMeta.role}
                </span>
                <span style={{ background: '#ecfdf5', padding: '2px 8px', borderRadius: 4, color: '#047857' }}>
                  Cycle: {execMeta.frequency}
                </span>
              </div>
            </div>

            {/* 4 Executive KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
              {execMeta.kpis.map((k, i) => (
                <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: `3.5px solid ${k.color}`, borderRadius: 6, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{k.label}</div>
                  <div style={{ fontSize: 16.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{k.value}</div>
                  <div style={{ fontSize: 10.5, color: k.color, fontWeight: 600, marginTop: 1 }}>{k.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '10px 16px', background: '#f8f9fb', borderBottom: '1px solid #e1e4e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <input
              className="bs-input"
              style={{ width: 220 }}
              placeholder="Search report records..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="bs-select"
              style={{ width: 160 }}
              value={filterDiv}
              onChange={e => setFilterDiv(e.target.value)}
            >
              <option value="All">All Divisions (8)</option>
              <option value="Dhaka">Dhaka Division</option>
              <option value="Chittagong">Chittagong Division</option>
              <option value="Sylhet">Sylhet Division</option>
              <option value="Rajshahi">Rajshahi Division</option>
              <option value="Khulna">Khulna Division</option>
              <option value="Barishal">Barishal Division</option>
              <option value="Rangpur">Rangpur Division</option>
              <option value="Mymensingh">Mymensingh Division</option>
            </select>
            <select
              className="bs-select"
              style={{ width: 140 }}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status ({availableStatuses.length})</option>
              {availableStatuses.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="bs-btn bs-btn-outline bs-btn-sm" onClick={handleDownload}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              Download CSV
            </button>
            <button className="bs-btn bs-btn-outline bs-btn-sm" onClick={() => window.print()}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 100-2 1 1 0 000 2zm1 2v-1h6v1H7z" clipRule="evenodd"/></svg>
              Print PDF
            </button>
          </div>
        </div>

        <div className="bs-modal-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="bs-table" style={{ width: '100%', minWidth: 800 }}>
              <thead>
                <tr>
                  {tableData.cols.map(col => <th key={col} style={{ whiteSpace: 'nowrap' }}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, i) => (
                  <tr key={i} style={{ fontWeight: row[1]?.includes('Consolidated') ? 700 : 400, background: row[1]?.includes('Consolidated') ? 'rgba(13, 148, 136, 0.04)' : undefined }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ whiteSpace: (j === 1 || j === 0) ? 'normal' : 'nowrap' }}>
                        {(cell === 'Online' || cell === 'Active' || cell === 'Granted' || cell === 'Optimal' || cell === 'Certified' || cell === 'Fully Compliant' || cell === 'Verified & Approved' || cell === 'Clean' || cell === 'Resolved & Cleared' || cell === 'Good') ? (
                          <span className="bs-badge bs-badge-green"><span className="bs-dot bs-dot-green"></span>{cell}</span>
                        ) : (cell === 'Compliant' || cell === 'Approved' || cell === 'Bank Wide' || cell === 'Nationwide') ? (
                          <span className="bs-badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}><span className="bs-dot" style={{ background: '#3b82f6' }}></span>{cell}</span>
                        ) : (cell === 'Offline' || cell === 'Inactive' || cell === 'Denied' || cell === 'Breached') ? (
                          <span className="bs-badge bs-badge-red"><span className="bs-dot bs-dot-red"></span>{cell}</span>
                        ) : (cell === 'A+ Platinum' || cell === 'Grade A+') ? (
                          <span className="bs-badge" style={{ background: '#f5f3ff', color: '#6d28d9', fontWeight: 800 }}>⭐ {cell}</span>
                        ) : (cell === 'Warning' || cell === 'Low' || cell === 'Review Required' || String(cell).includes('delay') || String(cell).includes('Observation')) ? (
                          <span className="bs-badge" style={{ background: '#fffbeb', color: '#b45309' }}><span className="bs-dot" style={{ background: '#f59e0b' }}></span>{cell}</span>
                        ) : j === 0 ? (
                          <span style={{ fontFamily: 'monospace', fontSize: 11.5, fontWeight: 600, color: '#374151' }}>{cell}</span>
                        ) : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRows.length === 0 && (
            <div className="bs-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36" className="bs-empty-icon"><path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>No records match your search</span>
            </div>
          )}
        </div>

        <div className="bs-modal-footer">
          <span style={{ fontSize: 11, color: '#9ca3af', marginRight: 'auto' }}>
            Showing {filteredRows.length} records · Pubali Bank PLC · {isExec ? 'Official Tender Executable' : 'BioStar X'}
          </span>
          <button className="bs-btn bs-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN REPORTS PAGE ─────────────────────────────────────
export default function BioStarReports({
  onNavigate,
  initialMode = 'security-hub',
  initialEntity = 'users',
  initialCategory = 'access-auth'
}) {
  const [viewMode, setViewMode] = useState(initialMode); // 'security-hub' | 'pdf' | 'legacy' | 'custom'
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (initialMode) {
      setViewMode(initialMode);
    }
  }, [initialMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {viewMode === 'security-hub' && (
        <SecurityReportsHub key={initialCategory} initialCategory={initialCategory} />
      )}

      {viewMode === 'pdf' && (
        <BioStarPdfSpecificationView initialView="reportHub" onNavigateParent={onNavigate} />
      )}

      {viewMode === 'custom' && (
        <BioStarCustomReportBuilder initialEntity={initialEntity} onNavigateParent={onNavigate} />
      )}

      {viewMode === 'legacy' && (
        <>
          {/* 5 Report Cards in a responsive grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14 }}>
            {REPORT_CARDS.map(card => (
              <div key={card.id} className="bs-report-card">
                <div className="bs-report-card-header">
                  <div className="bs-report-card-icon">
                    {icons[card.icon]}
                  </div>
                  <div>
                    <div className="bs-report-card-title">{card.title}</div>
                    <div className="bs-report-card-sub">{card.sub}</div>
                  </div>
                </div>
                <div className="bs-report-card-items">
                  {card.items.map(item => (
                    <div
                      key={item.id}
                      className="bs-report-item"
                      onClick={() => setSelectedItem(item)}
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" style={{ color: '#0d9488', flexShrink: 0 }}>
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
                      </svg>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      <span className="bs-report-item-arrow">{icons.chevron}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Modal */}
          {selectedItem && (
            <ReportModal item={selectedItem} onClose={() => setSelectedItem(null)} />
          )}
        </>
      )}
    </div>
  );
}
