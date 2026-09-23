/**
 * Pubali Bank PLC - BioStar 2 Centralized Biometric Access Control & Attendance Database
 * Full Nationwide Network: 519 Branches, 281 Sub-branches, 29 Islamic Banking Units (829 Total)
 * Centralized Suprema Biometric Deployment: 1,658 Terminals across 8 Divisions & 64 Districts
 */

const fullData = require('./pubaliFullBranches');
const pubaliLocations = fullData.FULL_PUBALI_LOCATIONS;
const regionalOffices = fullData.REGIONAL_OFFICES;
const divisionsList = fullData.DIVISIONS_LIST;
const networkStats = fullData.NETWORK_STATISTICS;

// Generate 1,658+ Suprema Devices Registry from full branch network
const devices = [];
pubaliLocations.forEach(loc => {
  if (loc.devices && Array.isArray(loc.devices)) {
    loc.devices.forEach(dev => {
      devices.push({
        id: dev.id,
        name: `${dev.name} - ${loc.name}`,
        model: dev.name,
        modelCode: dev.model,
        serial: dev.serial,
        ip: dev.ip,
        port: dev.port || 51211,
        mac: dev.mac,
        status: dev.status || 'Online',
        category: loc.type === 'branch' ? 'branch' : (loc.type === 'sub-branch' ? 'sub-branch' : (loc.type === 'islamic' ? 'islamic' : 'head-office')),
        location: `${loc.name} (${dev.location || 'Entrance'})`,
        doorLocation: dev.location || 'Main Portal',
        zone: loc.zone,
        division: loc.division,
        district: loc.district,
        branchCode: loc.code,
        branchName: loc.name,
        routingNumber: loc.routingNumber,
        ping: dev.status === 'Offline' ? 'Timeout' : `${8 + (loc.code.charCodeAt(loc.code.length - 1) % 20)} ms`,
        firmware: dev.firmware || 'v1.4.2_2408',
        lastHeartbeat: dev.status === 'Online' ? 'Just now' : '45m ago',
        tamperActive: dev.status === 'Sync Issue',
        relayStatus: dev.status === 'Offline' ? 'Failsafe Offline' : 'Locked (Normal)',
        usersEnrolled: loc.attendance ? loc.attendance.total * 3 : 85
      });
    });
  }
});

// Generate Monitored Doors across all locations
const doors = [];
let doorSeq = 1000;
pubaliLocations.forEach(loc => {
  if (loc.doorList && Array.isArray(loc.doorList)) {
    loc.doorList.forEach(d => {
      doorSeq++;
      doors.push({
        id: `DOR-PB-${doorSeq}`,
        name: `${loc.name} - ${d.name}`,
        type: d.name.toLowerCase().includes('vault') || d.name.toLowerCase().includes('server') ? 'Access Control' : 'Attendance',
        location: loc.name,
        branchCode: loc.code,
        zone: loc.zone,
        district: loc.district,
        sensor: d.sensor || 'Closed',
        status: d.status || 'Locked',
        relay: d.type === 'Interlock' ? 'Interlock Active' : 'Relay 1 Normal',
        controller: loc.devices && loc.devices[0] ? loc.devices[0].name : 'BioStation 3',
        lockType: d.type || 'Mag Lock',
        group: d.group || 'All Staff'
      });
    });
  }
});

// Generate Enrolled Users from all locations
const users = [];
pubaliLocations.forEach(loc => {
  if (loc.employees && Array.isArray(loc.employees)) {
    loc.employees.forEach(emp => {
      users.push({
        id: emp.id,
        name: emp.name,
        department: loc.type === 'head-office' ? 'Head Office Management' : (loc.type === 'islamic' ? 'Islamic Banking Wing' : 'Branch Banking Operations'),
        role: emp.id.endsWith('1') ? 'Branch Incharge / Manager' : 'Officer / Cash Custodian',
        branch: loc.name,
        branchCode: loc.code,
        zone: loc.zone,
        division: loc.division,
        district: loc.district,
        category: loc.type,
        fingerprint: true,
        card: `CARD-PB-${loc.code.replace(/[^0-9]/g, '') || '10'}-${emp.id.replace(/[^0-9]/g, '').slice(-3)}`,
        authMode: 'Fingerprint + Card',
        status: emp.status === 'Absent' ? 'Inactive' : 'Active',
        lastPunch: emp.inTime !== '—' ? `Today ${emp.inTime}` : 'No punch today'
      });
    });
  }
});

// Access Groups
const accessGroups = [
  { id: 'AG-PB-001', name: 'Central Vault & Treasury Dual-Custody', category: 'High Security', branch: 'All 519 Branches & Head Office', clearanceLevel: 'Level 5 (Dual Custody)', usersCount: 1038, doorsCount: 520, schedule: 'Strict Dual Custody' },
  { id: 'AG-PB-002', name: 'Branch Banking Staff & Tellers', category: 'General Staff', branch: 'All 829 Locations Nationwide', clearanceLevel: 'Level 2 (Standard Branch)', usersCount: 14200, doorsCount: 829, schedule: 'Sun-Thu 08:30 - 18:30' },
  { id: 'AG-PB-003', name: 'IT Infrastructure & Server Rooms', category: 'Technical Admin', branch: 'All Regional Offices & Corporate', clearanceLevel: 'Level 4 (IT Clearance)', usersCount: 240, doorsCount: 80, schedule: '24/7 Monitored Access' },
  { id: 'AG-PB-004', name: 'Sub-Branch (Upashakha) Access Core', category: 'Sub-Branch', branch: 'All 281 Upashakha Network', clearanceLevel: 'Level 2 (Upashakha Level)', usersCount: 1405, doorsCount: 562, schedule: 'Sun-Thu 08:30 - 17:30' },
  { id: 'AG-PB-005', name: 'Islamic Banking Wings & Shariah Board', category: 'Islamic Units', branch: '29 Islamic Banking Units', clearanceLevel: 'Level 3 (Islamic Clearance)', usersCount: 232, doorsCount: 87, schedule: 'Sun-Thu 08:30 - 18:00' },
  { id: 'AG-PB-006', name: 'Regional Office Supervision & Audit', category: 'Audit & RO', branch: '29 Regional Administrative Zones', clearanceLevel: 'Level 4 (Regional DGM Tier)', usersCount: 580, doorsCount: 116, schedule: 'All Days 08:00 - 20:00' }
];

// System usage metrics
const stats = {
  totalLocations: networkStats.totalLocations,
  branchesCount: networkStats.branchesCount,
  subBranchesCount: networkStats.subBranchesCount,
  islamicUnitsCount: networkStats.islamicUnitsCount,
  divisionsCount: networkStats.divisionsCount,
  districtsCount: networkStats.districtsCount,
  regionalOfficesCount: networkStats.regionalOfficesCount,
  deviceTotal: devices.length,
  onlineDevices: devices.filter(d => d.status === 'Online').length,
  offlineDevices: devices.filter(d => d.status === 'Offline').length,
  tamperAlerts: devices.filter(d => d.status === 'Sync Issue').length,
  deviceOnlinePct: Math.round((devices.filter(d => d.status === 'Online').length / devices.length) * 100),
  doorTotal: doors.length,
  doorActivePct: 98,
  userTotal: users.length,
  fingerprint: users.filter(u => u.fingerprint).length,
  card: users.filter(u => !!u.card).length,
  primaryBioStarServer: 'biostar-central.pubalibank.com:443'
};

// Real-time Auth Analytics Time Series
const chartData = {
  week: {
    period: 'week',
    dateRange: 'Current Week',
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    total: 18450,
    series: [
      { name: '1:N Duplex Authentications', color: '#0d9488', data: [2650, 3120, 3450, 3290, 3510, 1120, 1310] },
      { name: 'Access Denied / Timeout', color: '#f59e0b', data: [42, 38, 55, 49, 61, 14, 18] },
      { name: 'Tamper / Sensor Alerts', color: '#ef4444', data: [3, 1, 2, 4, 1, 0, 1] }
    ]
  },
  month: {
    period: 'month',
    dateRange: 'Current Month',
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    total: 78200,
    series: [
      { name: '1:N Duplex Authentications', color: '#0d9488', data: [18400, 20100, 21500, 18200] },
      { name: 'Access Denied / Timeout', color: '#f59e0b', data: [210, 195, 230, 180] },
      { name: 'Tamper / Sensor Alerts', color: '#ef4444', data: [12, 9, 14, 8] }
    ]
  }
};

// ─── WHO IS INSIDE MOCK DATA ─────────────────────────────────────────────────
const BRANCH_NAMES_SAMPLE = [
  'Head Office (Principal Branch)', 'Dhanmondi Branch', 'Gulshan Branch', 'Uttara Branch',
  'Agrabad Branch', 'Motijheel Corporate', 'Mirpur Branch', 'Sylhet Branch',
  'Rajshahi Branch', 'Khulna Branch', 'Chattogram Main', 'Narayanganj Branch',
  'Gazipur Branch', 'Mymensingh Branch', 'Cumilla Branch', 'Bogura Branch'
];
const ZONES_SAMPLE = ['Main Entrance', 'Reception', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor', 'Server Room', 'Cash Vault', 'Treasury', 'NOC Room'];
const DEPT_SAMPLE = ['Branch Banking Ops', 'IT Infrastructure', 'Treasury & Forex', 'HR & Admin', 'Audit & Compliance', 'Islamic Banking', 'Card & Digital Banking', 'Credit Risk'];
const READER_SAMPLE = ['BS3-Main Gate', 'BS3-Reception', 'BioStation2a-L2', 'FaceStation-L3', 'BS3-Vault', 'BioEntry-Server', 'BioLite-Exit', 'BS3-NOC'];

function rndInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rndEl(arr) { return arr[rndInt(0, arr.length - 1)]; }
function timeAgo(minAgo) {
  const d = new Date(); d.setMinutes(d.getMinutes() - minAgo);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

const WHO_IS_INSIDE_EMPLOYEES = [];
const FIRST_NAMES = ['Mohammad','Md. Rafiqul','Fatema','Nasrin','Kamal','Rina','Sumaiya','Abdul','Rezaul','Sharmin','Anwar','Nusrat','Imran','Dilruba','Jahangir','Tahmina','Monirul','Shamima','Shafiqul','Moriam'];
const LAST_NAMES = ['Islam','Hossain','Khanam','Begum','Ahmed','Akter','Jahan','Karim','Alam','Sultana','Rahman','Chowdhury','Miah','Sarker','Uddin','Bhuiyan'];
for (let i = 1; i <= 312; i++) {
  const branchIdx = (i - 1) % BRANCH_NAMES_SAMPLE.length;
  const minAgo = rndInt(5, 480);
  const status = i <= 20 ? 'Outside' : (i <= 28 ? 'Unknown' : 'Inside');
  WHO_IS_INSIDE_EMPLOYEES.push({
    id: `EMP-PB-${String(10000 + i).padStart(5,'0')}`,
    name: `${rndEl(FIRST_NAMES)} ${rndEl(LAST_NAMES)}`,
    department: rndEl(DEPT_SAMPLE),
    branch: BRANCH_NAMES_SAMPLE[branchIdx],
    zone: rndEl(ZONES_SAMPLE),
    lastReader: rndEl(READER_SAMPLE),
    entryTime: timeAgo(minAgo),
    durationMin: minAgo,
    status,
    photo: `${rndEl(FIRST_NAMES).charAt(0)}${rndEl(LAST_NAMES).charAt(0)}`
  });
}

// ─── SOC ALARM MOCK DATA ──────────────────────────────────────────────────────
const OTHER_ALARM_TYPES = ['Door Held Open', 'Duress Alert', 'Tailgating Alert', 'Controller Offline', 'Sensor Fault', 'Unauthorized Access Attempt'];
const ALARM_LOCATIONS = ['Dhanmondi Branch - Main Gate','Head Office - Server Room','Gulshan Branch - Cash Vault','Motijheel - NOC Room','Agrabad Branch - Entrance','Uttara Branch - Vault','Mirpur Branch - Rear Door','Sylhet Branch - Treasury'];
const SOC_OFFICERS = ['Md. Kamal Hossain (SOC)','Nasrin Akter (SOC)','Abdul Karim (IT Sec)','Rina Islam (SOC)','Monirul Haque (SOC)'];

const SOC_ALARMS = [];

// 1. Exactly 7 Tamper Alerts (i = 1..7) - all Critical
for (let i = 1; i <= 7; i++) {
  const minsAgo = rndInt(10, 540);
  const isActive = i <= 3;
  const isAcked = !isActive && i <= 5;
  SOC_ALARMS.push({
    id: `ALM-PB-${String(4000 + i).padStart(5,'0')}`,
    type: 'Tamper Alert',
    location: rndEl(ALARM_LOCATIONS),
    reader: rndEl(READER_SAMPLE),
    severity: 'Critical',
    timestamp: timeAgo(minsAgo),
    minsAgo,
    isToday: true,
    status: isActive ? 'Active' : (isAcked ? 'ACKed' : 'Resolved'),
    assignedTo: rndEl(SOC_OFFICERS),
    zone: rndEl(ZONES_SAMPLE),
    ackTime: isActive ? null : timeAgo(minsAgo - 5),
    resolveTime: (!isActive && !isAcked) ? timeAgo(minsAgo - 15) : null
  });
}

// 2. Exactly 2 Forced Door Events (i = 8..9) - 0 Open (both auto-locked & resolved SC-03)
for (let i = 8; i <= 9; i++) {
  const minsAgo = rndInt(60, 480);
  SOC_ALARMS.push({
    id: `ALM-PB-${String(4000 + i).padStart(5,'0')}`,
    type: 'Door Forced Open',
    location: i === 8 ? 'Dhanmondi Branch - Rear Security Gate' : 'Head Office - Server Room Outer Door',
    reader: 'BS3-Perimeter',
    severity: 'High',
    timestamp: timeAgo(minsAgo),
    minsAgo,
    isToday: true,
    status: 'Resolved', // 0 Open / Active, 2 Auto-Locked & Resolved (SC-03)
    assignedTo: rndEl(SOC_OFFICERS),
    zone: 'Perimeter / Server Room',
    ackTime: timeAgo(minsAgo - 2),
    resolveTime: timeAgo(minsAgo - 5)
  });
}

// 3. Exactly 3 Anti-Passback (APB) Violations (i = 10..12) - 0 Critical (3 Soft Warnings)
for (let i = 10; i <= 12; i++) {
  const minsAgo = rndInt(40, 600);
  const isAcked = i === 10;
  SOC_ALARMS.push({
    id: `ALM-PB-${String(4000 + i).padStart(5,'0')}`,
    type: 'Anti-Passback Violation',
    location: ['Motijheel - NOC Turnstile', 'Gulshan Branch - Executive Turnstile', 'Agrabad Branch - Main Gate'][i - 10],
    reader: 'FaceStation-F2',
    severity: 'Warning', // 0 Critical · 3 Soft Warnings
    timestamp: timeAgo(minsAgo),
    minsAgo,
    isToday: true,
    status: isAcked ? 'ACKed' : 'Resolved',
    assignedTo: rndEl(SOC_OFFICERS),
    zone: 'Turnstile Access',
    ackTime: timeAgo(minsAgo - 3),
    resolveTime: isAcked ? null : timeAgo(minsAgo - 8)
  });
}

// 4. Remaining 36 Alarms (i = 13..48)
// Exactly 5 Active, 11 ACKed, 20 Resolved -> Total across 48: 8 Active, 14 ACKed, 26 Resolved
// Exactly 5 Critical -> Total across 48: 12 Critical
for (let i = 13; i <= 48; i++) {
  const remIdx = i - 13; // 0..35
  const minsAgo = rndInt(5, 720);
  const isActive = remIdx < 5;
  const isAcked = !isActive && remIdx < 16;
  const sev = remIdx < 5 ? 'Critical' : (remIdx < 15 ? 'High' : (remIdx < 28 ? 'Warning' : 'Info'));
  const type = OTHER_ALARM_TYPES[remIdx % OTHER_ALARM_TYPES.length];

  SOC_ALARMS.push({
    id: `ALM-PB-${String(4000 + i).padStart(5,'0')}`,
    type,
    location: rndEl(ALARM_LOCATIONS),
    reader: rndEl(READER_SAMPLE),
    severity: sev,
    timestamp: timeAgo(minsAgo),
    minsAgo,
    isToday: minsAgo <= 1440,
    status: isActive ? 'Active' : (isAcked ? 'ACKed' : 'Resolved'),
    assignedTo: rndEl(SOC_OFFICERS),
    zone: rndEl(ZONES_SAMPLE),
    ackTime: isActive ? null : timeAgo(minsAgo - rndInt(2, 20)),
    resolveTime: (!isActive && !isAcked) ? timeAgo(minsAgo - rndInt(5, 50)) : null
  });
}

// ─── BRANCH SECURITY SCORECARD MOCK DATA ────────────────────────────────────
const BRANCH_SCORECARD = [];
const SCORECARD_BRANCHES = [
  { code: '0101', name: 'Head Office (Principal)', division: 'Dhaka', district: 'Motijheel' },
  { code: '0214', name: 'Dhanmondi Branch', division: 'Dhaka', district: 'Dhanmondi' },
  { code: '0318', name: 'Gulshan Branch', division: 'Dhaka', district: 'Gulshan' },
  { code: '0422', name: 'Uttara Branch', division: 'Dhaka', district: 'Uttara' },
  { code: '0512', name: 'Mirpur Branch', division: 'Dhaka', district: 'Mirpur' },
  { code: '0610', name: 'Agrabad Corporate', division: 'Chattogram', district: 'Agrabad' },
  { code: '0714', name: 'Chittagong Main', division: 'Chattogram', district: 'Kotwali' },
  { code: '0820', name: 'Sylhet Branch', division: 'Sylhet', district: 'Kotwali' },
  { code: '0915', name: 'Rajshahi Branch', division: 'Rajshahi', district: 'Boalia' },
  { code: '1010', name: 'Khulna Branch', division: 'Khulna', district: 'Sadar' },
  { code: '1112', name: 'Barishal Branch', division: 'Barishal', district: 'Kotwali' },
  { code: '1218', name: 'Rangpur Branch', division: 'Rangpur', district: 'Sadar' },
  { code: '1315', name: 'Mymensingh Branch', division: 'Mymensingh', district: 'Kotwali' },
  { code: '1410', name: 'Cumilla Branch', division: 'Chattogram', district: 'Adarsha Sadar' },
  { code: '1520', name: 'Narayanganj Branch', division: 'Dhaka', district: 'Sadar' },
  { code: '1618', name: 'Gazipur Branch', division: 'Dhaka', district: 'Joydebpur' },
  { code: '1710', name: 'Bogura Branch', division: 'Rajshahi', district: 'Sadar' },
  { code: '1812', name: 'Noakhali Branch', division: 'Chattogram', district: 'Sadar' },
  { code: '1915', name: 'Feni Branch', division: 'Chattogram', district: 'Feni Sadar' },
  { code: '2010', name: 'Cox\'s Bazar Branch', division: 'Chattogram', district: 'Cox\'s Bazar' },
];
const scoreWeights = { uptime: 0.35, forcedDoor: 0.20, tamper: 0.15, antiPassback: 0.10, auditCompliance: 0.20 };
SCORECARD_BRANCHES.forEach((b, idx) => {
  const uptime = 96.5 + (idx % 5 === 0 ? -8.4 : rndInt(0, 30) / 10);
  const forcedDoors = idx % 7 === 0 ? rndInt(3, 8) : rndInt(0, 2);
  const tamperEvents = idx % 9 === 0 ? rndInt(2, 5) : rndInt(0, 1);
  const antiPassback = idx % 6 === 0 ? rndInt(4, 12) : rndInt(0, 3);
  const auditScore = 85 + rndInt(0, 14) - (idx % 5 === 0 ? 20 : 0);
  const rawScore = Math.round(
    (Math.min(uptime, 100) / 100) * 100 * scoreWeights.uptime +
    (Math.max(0, 10 - forcedDoors) / 10) * 100 * scoreWeights.forcedDoor +
    (Math.max(0, 5 - tamperEvents) / 5) * 100 * scoreWeights.tamper +
    (Math.max(0, 12 - antiPassback) / 12) * 100 * scoreWeights.antiPassback +
    Math.min(auditScore, 100) * scoreWeights.auditCompliance
  );
  const score = Math.min(100, Math.max(30, rawScore));
  BRANCH_SCORECARD.push({
    rank: idx + 1,
    code: b.code,
    name: b.name,
    division: b.division,
    district: b.district,
    score,
    grade: score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 55 ? 'At Risk' : 'Critical',
    uptimePct: Number(uptime.toFixed(1)),
    forcedDoorCount: forcedDoors,
    tamperEvents,
    antiPassbackViolations: antiPassback,
    auditCompliancePct: Math.min(100, Math.max(50, auditScore)),
    lastAudit: `Sep ${String(rndInt(1, 13)).padStart(2,'0')}, 2026`,
    totalAlarms: forcedDoors + tamperEvents + antiPassback
  });
});
BRANCH_SCORECARD.sort((a, b) => b.score - a.score).forEach((item, i) => { item.rank = i + 1; });

// ─── ATTENDANCE EXCEPTIONS MOCK DATA ─────────────────────────────────────────
const EXCEPTION_EMPLOYEES = [];
const SHIFT_NAMES = ['Morning Shift (08:30)', 'General Shift (09:00)', 'Evening Shift (14:00)', 'Night Shift (22:00)'];

// Target exact specification counts:
// 54 Late Arrival, 21 Early Departure, 65 Absent No Leave (29 escalated/AWL), 42 Missing Punch, 18 Duplicate Punch = 200 total
const EXCEPTION_CONFIGS = [
  { type: 'Late Arrival', count: 54 },
  { type: 'Early Departure', count: 21 },
  { type: 'Absent No Leave', count: 65, escalatedCount: 29 },
  { type: 'Missing Punch', count: 42 },
  { type: 'Duplicate Punch', count: 18 }
];

let globalEmpIdx = 1;
EXCEPTION_CONFIGS.forEach(cfg => {
  for (let i = 1; i <= cfg.count; i++) {
    const exType = cfg.type;
    const branchIdx = (globalEmpIdx - 1) % BRANCH_NAMES_SAMPLE.length;
    const minsLate = exType === 'Late Arrival' ? rndInt(15, 145) : 0;
    const earlyMins = exType === 'Early Departure' ? rndInt(10, 90) : 0;
    const isEscalated = exType === 'Absent No Leave' ? (i <= (cfg.escalatedCount || 29)) : false;
    
    EXCEPTION_EMPLOYEES.push({
      id: `EMP-PB-${String(20000 + globalEmpIdx).padStart(5,'0')}`,
      name: `${rndEl(FIRST_NAMES)} ${rndEl(LAST_NAMES)}`,
      department: rndEl(DEPT_SAMPLE),
      branch: BRANCH_NAMES_SAMPLE[branchIdx],
      division: rndEl(['Dhaka','Chattogram','Sylhet','Rajshahi','Khulna','Barishal','Rangpur','Mymensingh']),
      date: `Sep ${String(rndInt(1, 14)).padStart(2,'0')}, 2026`,
      shift: rndEl(SHIFT_NAMES),
      exceptionType: exType,
      detail: exType === 'Late Arrival' ? `${minsLate} min late (ATT-03)` :
              exType === 'Early Departure' ? `Left ${earlyMins} min early (ATT-04)` :
              exType === 'Missing Punch' ? 'No OUT punch recorded (ATT-06)' :
              exType === 'Absent No Leave' ? (isEscalated ? 'Unauthorized Absence (AWL Reconciled) - ATT-05' : 'Absent — Unapproved Sick/Casual - ATT-05') :
              'Duplicate entry detected (same reader, 2 sec apart)',
      severity: exType === 'Absent No Leave' ? (isEscalated ? 'High' : 'Medium') : (minsLate > 60 || earlyMins > 60 ? 'Medium' : 'Low'),
      escalated: isEscalated,
      supervisorReview: exType === 'Absent No Leave'
    });
    globalEmpIdx++;
  }
});

// ─── RESTRICTED ZONE ACCESS LOG MOCK DATA ────────────────────────────────────
const RESTRICTED_ZONES = ['Data Center', 'Server Room', 'Treasury', 'Cash Vault', 'SWIFT Room', 'NOC', 'SOC', 'CEO Suite', 'Board Room', 'Audit Room'];
const AUTH_MODES = ['Fingerprint + Card (Dual)', 'Face Recognition', 'Card + PIN', 'Fingerprint Only', 'Dual-Custody (2 Officers)'];
const DENIAL_REASONS = ['Invalid Biometric', 'Expired Card', 'Out of Schedule', 'Unauthorized Clearance', 'Anti-Passback Violation', 'Blacklisted Credential'];
const HIGH_SECURITY_ROLES = ['Senior IT Engineer', 'Chief Treasury Officer', 'Deputy GM', 'CISO', 'Senior Audit Officer', 'Head of SWIFT Operations', 'Deputy IT Manager', 'Cash Vault Custodian'];

const RESTRICTED_ACCESS_LOGS = [];
for (let i = 1; i <= 300; i++) {
  const zoneIdx = (i - 1) % RESTRICTED_ZONES.length;
  // Exactly 17 denied for today (i <= 17)
  // Exactly 20 denied for historical archive (i >= 18 && i <= 37)
  // Total denied = 37. Total granted = 263.
  const isTodayDenied = i <= 17;
  const isHistoricalDenied = i > 17 && i <= 37;
  const isDenied = isTodayDenied || isHistoricalDenied;
  const isGranted = !isDenied;
  
  // Today's records (minsAgo <= 720): 17 denied + 242 granted = 259 today
  // Historical records (minsAgo > 1440): 20 denied + 21 granted = 41 historical
  const isToday = isTodayDenied || (isGranted && i <= 279);
  const minsAgo = isToday ? rndInt(5, 700) : rndInt(1440, 10080);
  
  const isDualCustody = RESTRICTED_ZONES[zoneIdx] === 'Treasury' || RESTRICTED_ZONES[zoneIdx] === 'Cash Vault';
  const isFlagged = isTodayDenied && (i === 1 || i === 9); // exactly 2 flagged
  
  RESTRICTED_ACCESS_LOGS.push({
    id: `RAL-PB-${String(5000 + i).padStart(5,'0')}`,
    timestamp: timeAgo(minsAgo),
    minsAgo,
    isToday,
    employee: `${rndEl(FIRST_NAMES)} ${rndEl(LAST_NAMES)}`,
    employeeId: `EMP-PB-${String(30000 + i).padStart(5,'0')}`,
    role: rndEl(HIGH_SECURITY_ROLES),
    department: rndEl(DEPT_SAMPLE),
    zone: RESTRICTED_ZONES[zoneIdx],
    reader: rndEl(READER_SAMPLE),
    authMode: isDualCustody ? 'Dual-Custody (2 Officers)' : rndEl(AUTH_MODES),
    result: isGranted ? 'Granted' : 'Denied',
    denialReason: isGranted ? null : rndEl(DENIAL_REASONS),
    dualCustodyOfficer: isDualCustody ? `${rndEl(FIRST_NAMES)} ${rndEl(LAST_NAMES)}` : null,
    branch: rndEl(BRANCH_NAMES_SAMPLE),
    flagged: isFlagged
  });
}

// ─── EMPLOYEE MOVEMENT TRAIL MOCK DATA ───────────────────────────────────────
const MOVEMENT_EMPLOYEES = [];
const MOVEMENT_CHECKPOINTS = [
  { reader: 'BS3-Main Gate', zone: 'Main Entrance', direction: 'IN' },
  { reader: 'BS3-Reception', zone: 'Reception Lobby', direction: 'IN' },
  { reader: 'BioStation2a-L2', zone: '2nd Floor', direction: 'IN' },
  { reader: 'FaceStation-L3', zone: '3rd Floor', direction: 'IN' },
  { reader: 'BioEntry-Server', zone: 'Server Room', direction: 'IN' },
  { reader: 'BioEntry-Server', zone: 'Server Room', direction: 'OUT' },
  { reader: 'BS3-Vault', zone: 'Cash Vault', direction: 'IN' },
  { reader: 'BS3-Vault', zone: 'Cash Vault', direction: 'OUT' },
  { reader: 'BioLite-Exit', zone: 'Main Exit', direction: 'OUT' },
];

for (let i = 1; i <= 35; i++) {
  const checkpointCount = rndInt(3, 9);
  const trail = [];
  let currentMinsAgo = rndInt(30, 480);
  for (let j = 0; j < checkpointCount; j++) {
    const cp = MOVEMENT_CHECKPOINTS[j % MOVEMENT_CHECKPOINTS.length];
    trail.push({
      step: j + 1,
      reader: cp.reader,
      zone: cp.zone,
      direction: cp.direction,
      timestamp: timeAgo(currentMinsAgo),
      minsAgo: currentMinsAgo,
      result: j % 12 === 0 ? 'Denied' : 'Granted',
      restricted: cp.zone === 'Server Room' || cp.zone === 'Cash Vault',
      authMode: cp.zone === 'Server Room' || cp.zone === 'Cash Vault' ? 'Fingerprint + Card (Dual)' : 'Fingerprint'
    });
    currentMinsAgo -= rndInt(5, 90);
    if (currentMinsAgo < 0) currentMinsAgo = 0;
  }
  MOVEMENT_EMPLOYEES.push({
    id: `EMP-PB-${String(40000 + i).padStart(5,'0')}`,
    name: `${rndEl(FIRST_NAMES)} ${rndEl(LAST_NAMES)}`,
    department: rndEl(DEPT_SAMPLE),
    branch: rndEl(BRANCH_NAMES_SAMPLE),
    role: rndEl(HIGH_SECURITY_ROLES),
    trail
  });
}

module.exports = {
  stats,
  chartData,
  users,
  accessGroups,
  devices,
  doors,
  pubaliLocations,
  regionalOffices,
  divisionsList,
  networkStats,
  // New intelligence modules
  whoIsInside: WHO_IS_INSIDE_EMPLOYEES,
  socAlarms: SOC_ALARMS,
  branchScorecard: BRANCH_SCORECARD,
  attendanceExceptions: EXCEPTION_EMPLOYEES,
  restrictedAccessLogs: RESTRICTED_ACCESS_LOGS,
  movementEmployees: MOVEMENT_EMPLOYEES
};
