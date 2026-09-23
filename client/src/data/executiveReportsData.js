/**
 * executiveReportsData.js
 * Official Datasets & Schemas for Executive / Board Reports (EB-01 to EB-08)
 * Conforms 100% to Pubali Bank PLC Tender / RFP Catalog Specifications
 */

export const EXECUTIVE_REPORTS_META = {
  'EB-01': {
    id: 'EB-01',
    name: 'CEO / MD Executive Dashboard Summary',
    purpose: 'Board-level KPIs: attendance %, security score, uptime, alarms',
    role: 'CEO / MD / Board of Directors',
    frequency: 'Daily / On-Demand',
    exportFormat: 'PDF, Excel, Email Schedule',
    kpis: [
      { label: 'Workforce Attendance', value: '94.8%', sub: 'Target: 95.0% (Near Target)', color: '#059669' },
      { label: 'Security & Posture Score', value: '98.2 / 100', sub: 'Grade A+ Nationwide', color: '#0284c7' },
      { label: 'Device Fleet Uptime', value: '99.82%', sub: '1,624 of 1,658 Terminals Online', color: '#7c3aed' },
      { label: 'Critical Active Alarms', value: '0 Open', sub: 'All 829 Branches Clear', color: '#10b981' }
    ],
    cols: ['#', 'Administrative Division', 'Total Employees', 'Present %', 'Late %', 'Absentee %', 'Active Alarms', 'Device Uptime', 'Security Score', 'Status'],
    rows: [
      ['1', 'Dhaka Division (Corporate & Metro)', '11,450', '96.2%', '2.8%', '1.0%', '0', '99.95%', '99.4', 'Good'],
      ['2', 'Chittagong Division', '6,320', '95.1%', '3.4%', '1.5%', '0', '99.88%', '98.6', 'Good'],
      ['3', 'Sylhet Division', '4,110', '94.4%', '3.9%', '1.7%', '0', '99.80%', '98.1', 'Compliant'],
      ['4', 'Rajshahi Division', '3,850', '93.8%', '4.2%', '2.0%', '0', '99.72%', '97.5', 'Compliant'],
      ['5', 'Khulna Division', '3,410', '94.0%', '4.1%', '1.9%', '0', '99.78%', '97.8', 'Compliant'],
      ['6', 'Barishal Division', '1,820', '93.2%', '4.8%', '2.0%', '0', '99.65%', '96.9', 'Compliant'],
      ['7', 'Rangpur Division', '2,100', '93.5%', '4.5%', '2.0%', '0', '99.70%', '97.2', 'Compliant'],
      ['8', 'Mymensingh Division', '1,940', '94.2%', '4.0%', '1.8%', '0', '99.75%', '97.9', 'Compliant'],
      ['—', 'National Consolidated (Pubali Bank)', '35,000', '94.8%', '3.7%', '1.5%', '0', '99.82%', '98.2', 'Bank Wide']
    ]
  },

  'EB-02': {
    id: 'EB-02',
    name: 'Board Security & Compliance Overview',
    purpose: 'Quarterly board-level compliance and physical security posture',
    role: 'Board of Directors / Audit Committee',
    frequency: 'Quarterly',
    exportFormat: 'PDF Formal, Board Dossier',
    kpis: [
      { label: 'Overall Policy Compliance', value: '99.2%', sub: 'Bangladesh Bank Circular Compliant', color: '#059669' },
      { label: 'Audit Findings (Q3 2026)', value: '2 Resolved', sub: '0 High-Risk Outstanding', color: '#0284c7' },
      { label: 'Quarterly Incident Count', value: '3 Minor', sub: 'Mean Time to Resolve: 18 mins', color: '#d97706' },
      { label: 'Fleet SLA Adherence', value: '99.85%', sub: 'Contract Benchmark: 99.50%', color: '#7c3aed' }
    ],
    cols: ['#', 'Security Domain / Division', 'Policy Compliance %', 'Quarterly Audit Findings', 'Incident Count', 'SLA Adherence %', 'Risk Severity', 'Governance Status'],
    rows: [
      ['1', 'Head Office & Data Center Tier-IV', '100.0%', '0 Findings', '0 Incidents', '99.99%', 'Zero Risk', 'Certified'],
      ['2', 'Treasury & Central Cash Vault', '100.0%', '0 Findings', '0 Incidents', '100.0%', 'Zero Risk', 'Certified'],
      ['3', 'Dhaka Metro Branches (142 Sites)', '99.5%', '1 Observation (Resolved)', '1 False Sensor Alert', '99.91%', 'Low', 'Approved'],
      ['4', 'Chittagong Regional Network (98 Sites)', '99.2%', '0 Findings', '1 Door Ajar Warning', '99.84%', 'Low', 'Approved'],
      ['5', 'Sylhet Regional Network (64 Sites)', '98.8%', '1 Pass-thru Calibration', '0 Incidents', '99.79%', 'Low', 'Approved'],
      ['6', 'North Bengal (Rajshahi & Rangpur)', '98.6%', '0 Findings', '1 Offline Ping Lag', '99.71%', 'Low', 'Approved'],
      ['7', 'South Bengal (Khulna & Barisal)', '98.9%', '0 Findings', '0 Incidents', '99.76%', 'Low', 'Approved'],
      ['8', 'Mymensingh & Peripheral Hubs', '99.0%', '0 Findings', '0 Incidents', '99.80%', 'Low', 'Approved'],
    ]
  },

  'EB-03': {
    id: 'EB-03',
    name: 'Divisional Workforce Attendance Summary',
    purpose: 'High-level attendance by 8 administrative divisions',
    role: 'Deputy Managing Director (DMD) / EVP HR',
    frequency: 'Monthly / Daily Roll-up',
    exportFormat: 'PDF, Excel',
    kpis: [
      { label: 'National Attendance %', value: '94.8%', sub: '33,208 of 35,000 Staff Present', color: '#059669' },
      { label: 'Present Today', value: '33,208 Staff', sub: 'Biometric Verified', color: '#0284c7' },
      { label: 'Late Arrivals', value: '1,257 Staff', sub: '3.6% of Workforce', color: '#d97706' },
      { label: 'Absent / On Approved Leave', value: '535 Staff', sub: '1.5% Normal Attrition', color: '#dc2626' }
    ],
    cols: ['#', 'Division Name', 'Total Staff', 'Present Count', 'Late Count', 'Absent Count', 'Attendance %', 'Top Branch', 'Attention Needed'],
    rows: [
      ['1', 'Dhaka Division', '11,450', '11,015', '321', '114', '96.2%', 'Principal Branch (98.4%)', 'None'],
      ['2', 'Chittagong Division', '6,320', '6,010', '215', '95', '95.1%', 'Agrabad Corporate (97.8%)', 'None'],
      ['3', 'Sylhet Division', '4,110', '3,880', '160', '70', '94.4%', 'Shahjalal Upashahar (96.5%)', 'None'],
      ['4', 'Rajshahi Division', '3,850', '3,611', '162', '77', '93.8%', 'Alokar Mor (95.9%)', 'Late punches in Naogaon'],
      ['5', 'Khulna Division', '3,410', '3,205', '140', '65', '94.0%', 'Khulna Main (96.1%)', 'None'],
      ['6', 'Barishal Division', '1,820', '1,696', '87', '37', '93.2%', 'Barisal Sadar (95.0%)', 'Morning ferry delay'],
      ['7', 'Rangpur Division', '2,100', '1,964', '94', '42', '93.5%', 'Rangpur Station Road (95.4%)', 'None'],
      ['8', 'Mymensingh Division', '1,940', '1,827', '78', '35', '94.2%', 'Choto Bazar Branch (96.0%)', 'None'],
    ]
  },

  'EB-04': {
    id: 'EB-04',
    name: 'Monthly Biometric Compliance Report',
    purpose: 'Tracks biometric enrollment and authentication usage vs policy targets',
    role: 'Chief Technology Officer (CTO) / CISO',
    frequency: 'Monthly',
    exportFormat: 'PDF, Excel',
    kpis: [
      { label: 'Enrollment Compliance', value: '99.7%', sub: '34,895 of 35,000 Employees', color: '#059669' },
      { label: 'Fingerprint Authentication', value: '88.4%', sub: 'Suprema Optical & Live Finger', color: '#0284c7' },
      { label: 'FaceStation AI & Dual Auth', value: '11.6%', sub: 'Vaults & Executive Suites', color: '#7c3aed' },
      { label: 'RF Card Fallback Ratio', value: '1.4%', sub: 'Strictly Secondary Policy', color: '#d97706' }
    ],
    cols: ['#', 'Branch / Administrative Tier', 'Enrolled Users', 'Fingerprint %', 'Card %', 'Face %', 'Dual-Custody Auth %', 'Enrollment Target', 'Compliance Status'],
    rows: [
      ['1', 'Head Office Corporate Complex', '1,850', '82.0%', '2.0%', '16.0%', '100.0% Vault', '100%', 'Fully Compliant'],
      ['2', 'Principal Branch Motijheel', '420', '88.5%', '1.5%', '10.0%', '100.0% Cash', '100%', 'Fully Compliant'],
      ['3', 'Dhaka North Zone (52 Branches)', '4,820', '89.2%', '1.2%', '9.6%', '100.0% Cash', '99.8%', 'Fully Compliant'],
      ['4', 'Dhaka South Zone (48 Branches)', '4,310', '88.7%', '1.4%', '9.9%', '100.0% Cash', '99.6%', 'Fully Compliant'],
      ['5', 'Chittagong Metro (38 Branches)', '3,650', '88.0%', '1.6%', '10.4%', '100.0% Cash', '99.7%', 'Fully Compliant'],
      ['6', 'Sylhet & Tea Garden Branches (64 Sites)', '4,310', '89.5%', '1.1%', '9.4%', '100.0% Cash', '99.5%', 'Fully Compliant'],
      ['7', 'Western Region (Rajshahi & Khulna)', '7,430', '87.9%', '1.8%', '10.3%', '100.0% Cash', '99.4%', 'Fully Compliant'],
      ['8', 'Northern & Delta Zones (Rangpur & Barisal)', '4,030', '88.2%', '1.5%', '10.3%', '100.0% Cash', '99.5%', 'Fully Compliant'],
    ]
  },

  'EB-05': {
    id: 'EB-05',
    name: 'YTD Branch Performance Scorecard',
    purpose: 'Year-to-date weighted security and attendance ranking per branch',
    role: 'Deputy Managing Director (DMD) / EVP Branch Banking',
    frequency: 'Year-to-Date (YTD) / Monthly',
    exportFormat: 'PDF, Excel, Board Annexure',
    kpis: [
      { label: 'National Average Score', value: '98.2 / 100', sub: 'Calculated over 829 Branches', color: '#059669' },
      { label: 'Grade A+ Branches', value: '714 Branches', sub: 'Score ≥ 95.0%', color: '#0284c7' },
      { label: 'Grade A Branches', value: '98 Branches', sub: 'Score 90.0% - 94.9%', color: '#7c3aed' },
      { label: 'Review Required', value: '17 Branches', sub: 'Score < 90.0%', color: '#d97706' }
    ],
    cols: ['Rank', 'Branch Code & Name', 'Division', 'Security Score (50%)', 'Attendance Score (50%)', 'Combined YTD Rating', 'Grade', 'Trend'],
    rows: [
      ['#1', '0101 — Principal Branch (Motijheel)', 'Dhaka', '99.8 / 100', '98.4 / 100', '99.1%', 'A+ Platinum', '▲ +0.4%'],
      ['#2', '0142 — Dhanmondi Corporate Branch', 'Dhaka', '99.6 / 100', '97.8 / 100', '98.7%', 'A+ Platinum', '▲ +0.2%'],
      ['#3', '0105 — Gulshan Circle Branch', 'Dhaka', '99.7 / 100', '97.5 / 100', '98.6%', 'A+ Platinum', '— Stable'],
      ['#4', '0201 — Agrabad Corporate Branch', 'Chittagong', '99.5 / 100', '97.8 / 100', '98.6%', 'A+ Platinum', '▲ +0.5%'],
      ['#5', '0301 — Sylhet Main Branch', 'Sylhet', '99.2 / 100', '97.2 / 100', '98.2%', 'A+ Platinum', '▲ +0.3%'],
      ['#6', '0112 — Uttara Model Town Branch', 'Dhaka', '99.1 / 100', '97.0 / 100', '98.0%', 'A+ Platinum', '— Stable'],
      ['#7', '0401 — Rajshahi Corporate Branch', 'Rajshahi', '98.9 / 100', '96.8 / 100', '97.8%', 'A+ Platinum', '▲ +0.1%'],
      ['#8', '0501 — Khulna Main Branch', 'Khulna', '98.8 / 100', '96.6 / 100', '97.7%', 'A+ Platinum', '— Stable'],
      ['#9', '0108 — Ramna VIP Branch', 'Dhaka', '98.7 / 100', '96.5 / 100', '97.6%', 'A+ Platinum', '— Stable'],
      ['#10', '0205 — Khatunganj Trade Branch', 'Chittagong', '98.6 / 100', '96.4 / 100', '97.5%', 'A+ Platinum', '▲ +0.6%'],
    ]
  },

  'EB-06': {
    id: 'EB-06',
    name: 'Quarterly SLA & Uptime Governance Report',
    purpose: 'SLA adherence per quarter for biometric device fleet',
    role: 'IT Governance Committee / Board Audit',
    frequency: 'Quarterly',
    exportFormat: 'PDF Formal, Vendor Review Dossier',
    kpis: [
      { label: 'Fleet SLA Uptime', value: '99.82%', sub: 'Contract Benchmark: 99.50%', color: '#059669' },
      { label: 'Total Fleet Size', value: '1,658 Units', sub: 'Suprema CoreStation & Edge', color: '#0284c7' },
      { label: 'Contract SLA Breaches', value: '0 Breaches', sub: 'Zero Liquidated Damages', color: '#10b981' },
      { label: 'Mean Time to Repair (MTTR)', value: '1.8 Hours', sub: 'SLA Limit: < 4.0 Hours', color: '#7c3aed' }
    ],
    cols: ['#', 'Regional Cluster / Zone', 'Total Terminals', 'Online Count', 'Fleet Uptime %', 'SLA Target %', 'Breach Events', 'Avg Response Time', 'SLA Penalty Status'],
    rows: [
      ['1', 'Head Office & Data Center Cluster', '86 Units', '86 Online', '99.99%', '99.90%', '0', '12 mins', 'Compliant (Bonus Tier)'],
      ['2', 'Dhaka Metro North & South', '584 Units', '582 Online', '99.91%', '99.50%', '0', '48 mins', 'Fully Compliant'],
      ['3', 'Chittagong & Coastal Belt', '292 Units', '290 Online', '99.85%', '99.50%', '0', '1.2 hrs', 'Fully Compliant'],
      ['4', 'Sylhet & Surma Basin', '186 Units', '185 Online', '99.80%', '99.50%', '0', '1.6 hrs', 'Fully Compliant'],
      ['5', 'Rajshahi & North-West Belt', '174 Units', '172 Online', '99.72%', '99.50%', '0', '2.1 hrs', 'Fully Compliant'],
      ['6', 'Khulna & South-West Industrial', '158 Units', '157 Online', '99.78%', '99.50%', '0', '1.8 hrs', 'Fully Compliant'],
      ['7', 'Barisal & Riverine Sub-Branches', '88 Units', '87 Online', '99.65%', '99.50%', '0', '2.8 hrs', 'Fully Compliant'],
      ['8', 'Rangpur & Mymensingh Zones', '90 Units', '89 Online', '99.72%', '99.50%', '0', '2.3 hrs', 'Fully Compliant'],
    ]
  },

  'EB-07': {
    id: 'EB-07',
    name: 'Executive Incident Intelligence Brief',
    purpose: 'Summary of critical security incidents with resolution status',
    role: 'Chief Executive Officer (CXO) / Security Committee',
    frequency: 'Weekly / On Critical Trigger',
    exportFormat: 'PDF, Email Alert',
    kpis: [
      { label: 'Unresolved High Incidents', value: '0 Open', sub: 'Zero Critical Breaches', color: '#059669' },
      { label: 'Incidents Logged (30 Days)', value: '6 Events', sub: 'All Investigated & Cleared', color: '#0284c7' },
      { label: 'Average Resolution Time', value: '14.2 Mins', sub: 'SOC Dispatch Benchmark: 20m', color: '#7c3aed' },
      { label: 'Physical Tamper Attempts', value: '0 Confirmed', sub: 'Hardware Enclosures Intact', color: '#10b981' }
    ],
    cols: ['Incident ID', 'Alarm Classification', 'Location / Branch', 'Trigger Timestamp', 'Severity Tier', 'Avg Resolution Time', 'Current Status', 'Remediation Summary'],
    rows: [
      ['INC-2026-0914-01', 'Door Held Open > 30s', 'Dhanmondi Branch (Vault Vestibule)', 'Today 09:10:45', 'Warning', '4 mins', 'Resolved & Cleared', 'Cash replenishment transit delay, auto-locked'],
      ['INC-2026-0913-04', 'Anti-Passback Sequence Warning', 'Agrabad Branch (Main ACS Door)', '13 Sep 14:22:10', 'Medium', '12 mins', 'Resolved & Cleared', 'Officer escorted visitor out via secondary gate'],
      ['INC-2026-0912-02', 'Dual-Custody Time Window Expired', 'Head Office Central Vault B2', '12 Sep 17:02:00', 'Elevated', '8 mins', 'Resolved & Cleared', 'Second keyholder verified by Chief Cash Officer'],
      ['INC-2026-0910-03', 'Unrecognized Card Swipe Attempt', 'Motijheel Side Emergency Door', '10 Sep 22:15:30', 'Low', '15 mins', 'Resolved & Cleared', 'Night cleaning staff swiped expired badge, denied'],
      ['INC-2026-0908-01', 'Terminal Ping Lag (>150ms)', 'Naogaon Branch (Router Switch)', '08 Sep 11:30:15', 'Low', '28 mins', 'Resolved & Cleared', 'ISP fiber cut routed to 4G failover backup'],
      ['INC-2026-0905-02', 'Duress Keypad Silent Test', 'Gulshan Circle Branch Cash Safe', '05 Sep 08:45:00', 'Informational', '9 mins', 'Resolved & Cleared', 'Authorized monthly SOC panic alarm drill completed'],
    ]
  },

  'EB-08': {
    id: 'EB-08',
    name: 'Payroll-Linked Attendance Integrity Audit',
    purpose: 'Cross-check biometric attendance data against HR payroll records',
    role: 'Chief Financial Officer (CFO) / Head of Internal Audit',
    frequency: 'Monthly Pre-Payroll Run',
    exportFormat: 'Excel, PDF Audit Dossier',
    kpis: [
      { label: 'Discrepancy Variance Count', value: '0 Discrepancies', sub: '100% Payroll Reconciliation', color: '#059669' },
      { label: 'Audited Headcount', value: '35,000 Staff', sub: 'All 829 Cost Centers', color: '#0284c7' },
      { label: 'Supervisor Overrides', value: '24 Justified', sub: 'Approved Duty Travel / Training', color: '#d97706' },
      { label: 'Audit Integrity Score', value: '100.0%', sub: 'Pre-Payroll Certification Ready', color: '#7c3aed' }
    ],
    cols: ['#', 'Employee ID & Name', 'Department / Cost Center', 'Branch Location', 'Biometric Days', 'HR Days Claimed', 'Variance Days', 'Audit Flag', 'Integrity Status'],
    rows: [
      ['1', 'PBL-0101-001 — Tariqul Islam', 'Corporate Banking Division', 'Principal Branch (Motijheel)', '22 Days', '22 Days', '0 Days', 'Clean', 'Verified & Approved'],
      ['2', 'PBL-0101-002 — Nazrul Islam', 'Treasury & Dealing Room', 'Head Office Motijheel', '22 Days', '22 Days', '0 Days', 'Clean', 'Verified & Approved'],
      ['3', 'PBL-0142-014 — Nasir Uddin', 'Branch Operations & Cash', 'Dhanmondi Corporate Branch', '22 Days', '22 Days', '0 Days', 'Clean', 'Verified & Approved'],
      ['4', 'PBL-0201-008 — Kabir Hossain', 'Credit Risk Management', 'Agrabad Corporate Branch', '21 Days', '22 Days', '1 Day (Duty Tour)', 'Leave Verified', 'HR Form #402 On File'],
      ['5', 'PBL-0301-019 — Farhana Ahmed', 'Foreign Remittance Dept', 'Sylhet Main Branch', '22 Days', '22 Days', '0 Days', 'Clean', 'Verified & Approved'],
      ['6', 'PBL-0105-027 — Mostafa Kamal', 'SME Banking Division', 'Gulshan Circle Branch', '22 Days', '22 Days', '0 Days', 'Clean', 'Verified & Approved'],
      ['7', 'PBL-0401-033 — Selim Reza', 'Cash Management & Vault', 'Rajshahi Corporate Branch', '22 Days', '22 Days', '0 Days', 'Clean', 'Verified & Approved'],
      ['8', 'PBL-0501-041 — Rafiqul Alam', 'Internal Control & Compliance', 'Khulna Main Branch', '22 Days', '22 Days', '0 Days', 'Clean', 'Verified & Approved'],
    ]
  }
};
