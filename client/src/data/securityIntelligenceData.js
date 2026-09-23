/**
 * securityIntelligenceData.js — Client-side Resilient Intelligence Dataset
 * Pubali Bank PLC · Suprema BioStar X Enterprise Security & Access Management
 * Provides offline/standalone fallback datasets for Who Is Inside, Attendance Exceptions,
 * SOC Alarms, Branch Scorecards, Restricted Access Logs, and Movement Trails.
 */

const BRANCH_NAMES_SAMPLE = [
  'Head Office (Principal Branch)', 'Dhanmondi Branch', 'Gulshan Branch', 'Uttara Branch',
  'Agrabad Branch', 'Motijheel Corporate', 'Mirpur Branch', 'Sylhet Branch',
  'Rajshahi Branch', 'Khulna Branch', 'Chattogram Main', 'Narayanganj Branch',
  'Gazipur Branch', 'Mymensingh Branch', 'Cumilla Branch', 'Bogura Branch'
];

const ZONES_SAMPLE = ['Main Entrance', 'Reception', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor', 'Server Room', 'Cash Vault', 'Treasury', 'NOC Room'];
const DEPT_SAMPLE = ['Branch Banking Ops', 'IT Infrastructure', 'Treasury & Forex', 'HR & Admin', 'Audit & Compliance', 'Islamic Banking', 'Card & Digital Banking', 'Credit Risk'];
const READER_SAMPLE = ['BS3-Main Gate', 'BS3-Reception', 'BioStation2a-L2', 'FaceStation-L3', 'BS3-Vault', 'BioEntry-Server', 'BioLite-Exit', 'BS3-NOC'];
const FIRST_NAMES = ['Mohammad', 'Md. Rafiqul', 'Fatema', 'Nasrin', 'Kamal', 'Rina', 'Sumaiya', 'Abdul', 'Rezaul', 'Sharmin', 'Anwar', 'Nusrat', 'Imran', 'Dilruba', 'Jahangir', 'Tahmina', 'Monirul', 'Shamima', 'Shafiqul', 'Moriam'];
const LAST_NAMES = ['Islam', 'Hossain', 'Khanam', 'Begum', 'Ahmed', 'Akter', 'Jahan', 'Karim', 'Alam', 'Sultana', 'Rahman', 'Chowdhury', 'Miah', 'Sarker', 'Uddin', 'Bhuiyan'];

function rndInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rndEl(arr) { return arr[rndInt(0, arr.length - 1)]; }
function timeAgo(minAgo) {
  const d = new Date(); d.setMinutes(d.getMinutes() - minAgo);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ─── 1. WHO IS INSIDE DATA (312 records) ──────────────────────────────────
export const WHO_IS_INSIDE_DATA = (() => {
  const list = [];
  for (let i = 1; i <= 312; i++) {
    const branchIdx = (i - 1) % BRANCH_NAMES_SAMPLE.length;
    const minAgo = rndInt(5, 480);
    const status = i <= 20 ? 'Outside' : (i <= 28 ? 'Unknown' : 'Inside');
    const fName = rndEl(FIRST_NAMES);
    const lName = rndEl(LAST_NAMES);
    list.push({
      id: `EMP-PB-${String(10000 + i).padStart(5, '0')}`,
      name: `${fName} ${lName}`,
      department: rndEl(DEPT_SAMPLE),
      branch: BRANCH_NAMES_SAMPLE[branchIdx],
      zone: rndEl(ZONES_SAMPLE),
      lastReader: rndEl(READER_SAMPLE),
      entryTime: timeAgo(minAgo),
      durationMin: minAgo,
      status,
      photo: `${fName.charAt(0)}${lName.charAt(0)}`
    });
  }
  return list;
})();

export function getWhoIsInsideSummary(records = WHO_IS_INSIDE_DATA) {
  const totalInside = records.filter(r => r.status === 'Inside').length;
  const totalOutside = records.filter(r => r.status === 'Outside' || r.status === 'Evacuated').length;
  const totalUnknown = records.filter(r => r.status === 'Unknown').length;
  return {
    totalInside,
    totalOutside,
    totalEvacuated: totalOutside,
    totalUnknown,
    totalAll: records.length
  };
}

// ─── 2. ATTENDANCE EXCEPTIONS DATA (200 records) ──────────────────────────
export const ATTENDANCE_EXCEPTIONS_DATA = (() => {
  const list = [];
  const SHIFT_NAMES = ['Morning Shift (08:30)', 'General Shift (09:00)', 'Evening Shift (14:00)', 'Night Shift (22:00)'];
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

      list.push({
        id: `EMP-PB-${String(20000 + globalEmpIdx).padStart(5, '0')}`,
        name: `${rndEl(FIRST_NAMES)} ${rndEl(LAST_NAMES)}`,
        department: rndEl(DEPT_SAMPLE),
        branch: BRANCH_NAMES_SAMPLE[branchIdx],
        division: rndEl(['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh']),
        date: `Sep ${String(rndInt(1, 14)).padStart(2, '0')}, 2026`,
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
  return list;
})();

export function getAttendanceExceptionsSummary(records = ATTENDANCE_EXCEPTIONS_DATA) {
  return {
    lateArrival: records.filter(e => e.exceptionType === 'Late Arrival').length,
    earlyDeparture: records.filter(e => e.exceptionType === 'Early Departure').length,
    missingPunch: records.filter(e => e.exceptionType === 'Missing Punch').length,
    absentNoLeave: records.filter(e => e.exceptionType === 'Absent No Leave').length,
    duplicatePunch: records.filter(e => e.exceptionType === 'Duplicate Punch').length,
    escalated: records.filter(e => e.escalated).length
  };
}

// ─── 3. SOC ALARMS DATA (48 records) ──────────────────────────────────────
export const SOC_ALARMS_DATA = (() => {
  const list = [];
  const OTHER_ALARM_TYPES = ['Door Held Open', 'Duress Alert', 'Tailgating Alert', 'Controller Offline', 'Sensor Fault', 'Unauthorized Access Attempt'];
  const ALARM_LOCATIONS = ['Dhanmondi Branch - Main Gate', 'Head Office - Server Room', 'Gulshan Branch - Cash Vault', 'Motijheel - NOC Room', 'Agrabad Branch - Entrance', 'Uttara Branch - Vault', 'Mirpur Branch - Rear Door', 'Sylhet Branch - Treasury'];
  const SOC_OFFICERS = ['Md. Kamal Hossain (SOC)', 'Nasrin Akter (SOC)', 'Abdul Karim (IT Sec)', 'Rina Islam (SOC)', 'Monirul Haque (SOC)'];

  // 1. 7 Tamper Alerts
  for (let i = 1; i <= 7; i++) {
    const minsAgo = rndInt(10, 540);
    const isActive = i <= 3;
    const isAcked = !isActive && i <= 5;
    list.push({
      id: `ALM-PB-${String(4000 + i).padStart(5, '0')}`,
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

  // 2. 2 Forced Door Events
  for (let i = 8; i <= 9; i++) {
    const minsAgo = rndInt(60, 480);
    list.push({
      id: `ALM-PB-${String(4000 + i).padStart(5, '0')}`,
      type: 'Door Forced Open',
      location: i === 8 ? 'Dhanmondi Branch - Rear Security Gate' : 'Head Office - Server Room Outer Door',
      reader: 'BS3-Perimeter',
      severity: 'High',
      timestamp: timeAgo(minsAgo),
      minsAgo,
      isToday: true,
      status: 'Resolved',
      assignedTo: rndEl(SOC_OFFICERS),
      zone: 'Perimeter / Server Room',
      ackTime: timeAgo(minsAgo - 2),
      resolveTime: timeAgo(minsAgo - 5)
    });
  }

  // 3. 3 Anti-Passback Violations
  for (let i = 10; i <= 12; i++) {
    const minsAgo = rndInt(40, 600);
    const isAcked = i === 10;
    list.push({
      id: `ALM-PB-${String(4000 + i).padStart(5, '0')}`,
      type: 'Anti-Passback Violation',
      location: ['Motijheel - NOC Turnstile', 'Gulshan Branch - Executive Turnstile', 'Agrabad Branch - Main Gate'][i - 10],
      reader: 'FaceStation-F2',
      severity: 'Warning',
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

  // 4. Remaining 36 Alarms
  for (let i = 13; i <= 48; i++) {
    const remIdx = i - 13;
    const minsAgo = rndInt(5, 720);
    const isActive = remIdx < 5;
    const isAcked = !isActive && remIdx < 16;
    const sev = remIdx < 5 ? 'Critical' : (remIdx < 15 ? 'High' : (remIdx < 28 ? 'Warning' : 'Info'));
    const type = OTHER_ALARM_TYPES[remIdx % OTHER_ALARM_TYPES.length];

    list.push({
      id: `ALM-PB-${String(4000 + i).padStart(5, '0')}`,
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
  return list;
})();

export function getSocAlarmsSummary(alarms = SOC_ALARMS_DATA) {
  return {
    totalCount: alarms.length,
    activeCount: alarms.filter(a => a.status === 'Active').length,
    ackedCount: alarms.filter(a => a.status === 'ACKed').length,
    criticalCount: alarms.filter(a => a.severity === 'Critical').length,
    tamperCount: alarms.filter(a => a.type === 'Tamper Alert').length,
    resolvedToday: alarms.filter(a => a.status === 'Resolved').length,
    avgResponseMin: 4.2
  };
}

// ─── 4. RESTRICTED ZONE ACCESS LOGS (300 records) ─────────────────────────
export const RESTRICTED_ACCESS_LOGS_DATA = (() => {
  const list = [];
  const RESTRICTED_ZONES = ['Data Center', 'Server Room', 'Treasury', 'Cash Vault', 'SWIFT Room', 'NOC', 'SOC', 'CEO Suite', 'Board Room', 'Audit Room'];
  const AUTH_MODES = ['Fingerprint + Card (Dual)', 'Face Recognition', 'Card + PIN', 'Fingerprint Only', 'Dual-Custody (2 Officers)'];
  const DENIAL_REASONS = ['Invalid Biometric', 'Expired Card', 'Out of Schedule', 'Unauthorized Clearance', 'Anti-Passback Violation', 'Blacklisted Credential'];
  const HIGH_SECURITY_ROLES = ['Senior IT Engineer', 'Chief Treasury Officer', 'Deputy GM', 'CISO', 'Senior Audit Officer', 'Head of SWIFT Operations', 'Deputy IT Manager', 'Cash Vault Custodian'];

  for (let i = 1; i <= 300; i++) {
    const zoneIdx = (i - 1) % RESTRICTED_ZONES.length;
    const isTodayDenied = i <= 17;
    const isHistoricalDenied = i > 17 && i <= 37;
    const isDenied = isTodayDenied || isHistoricalDenied;
    const isGranted = !isDenied;
    const isToday = isTodayDenied || (isGranted && i <= 279);
    const minsAgo = isToday ? rndInt(5, 700) : rndInt(1440, 10080);
    const isDualCustody = RESTRICTED_ZONES[zoneIdx] === 'Treasury' || RESTRICTED_ZONES[zoneIdx] === 'Cash Vault';
    const isFlagged = isTodayDenied && (i === 1 || i === 9);

    list.push({
      id: `RAL-PB-${String(5000 + i).padStart(5, '0')}`,
      timestamp: timeAgo(minsAgo),
      minsAgo,
      isToday,
      employee: `${rndEl(FIRST_NAMES)} ${rndEl(LAST_NAMES)}`,
      employeeId: `EMP-PB-${String(30000 + i).padStart(5, '0')}`,
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
  return list;
})();

export function getRestrictedAccessSummary(logs = RESTRICTED_ACCESS_LOGS_DATA) {
  const todayLogs = logs.filter(l => l.isToday);
  return {
    totalGranted: logs.filter(l => l.result === 'Granted').length,
    totalDenied: logs.filter(l => l.result === 'Denied').length,
    todayGranted: todayLogs.filter(l => l.result === 'Granted').length,
    todayDenied: todayLogs.filter(l => l.result === 'Denied').length,
    flagged: logs.filter(l => l.flagged).length
  };
}

// ─── 5. BRANCH SECURITY SCORECARD (20 branches) ───────────────────────────
export const BRANCH_SCORECARD_DATA = (() => {
  const list = [];
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
    list.push({
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
      lastAudit: `Sep ${String(rndInt(1, 13)).padStart(2, '0')}, 2026`,
      totalAlarms: forcedDoors + tamperEvents + antiPassback
    });
  });
  list.sort((a, b) => b.score - a.score).forEach((item, i) => { item.rank = i + 1; });
  return list;
})();

export function getBranchScorecardSummary(list = BRANCH_SCORECARD_DATA) {
  return {
    excellent: list.filter(b => b.grade === 'Excellent').length,
    good: list.filter(b => b.grade === 'Good').length,
    atRisk: list.filter(b => b.grade === 'At Risk').length,
    critical: list.filter(b => b.grade === 'Critical').length,
    avgScore: Number((list.reduce((s, b) => s + b.score, 0) / Math.max(1, list.length)).toFixed(1))
  };
}

// ─── 6. EMPLOYEE MOVEMENT TRAIL DATA (35 employees) ───────────────────────
export const MOVEMENT_EMPLOYEES_DATA = (() => {
  const list = [];
  const HIGH_SECURITY_ROLES = ['Senior IT Engineer', 'Chief Treasury Officer', 'Deputy GM', 'CISO', 'Senior Audit Officer', 'Head of SWIFT Operations', 'Deputy IT Manager', 'Cash Vault Custodian'];
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
    list.push({
      id: `EMP-PB-${String(40000 + i).padStart(5, '0')}`,
      name: `${rndEl(FIRST_NAMES)} ${rndEl(LAST_NAMES)}`,
      department: rndEl(DEPT_SAMPLE),
      branch: rndEl(BRANCH_NAMES_SAMPLE),
      role: rndEl(HIGH_SECURITY_ROLES),
      trail
    });
  }
  return list;
})();
