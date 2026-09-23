/**
 * Data structures and Mock Database aligned with Suprema Access Control Specification PDF
 * (Slides 01 - 10)
 */

export const PDF_CHART_DATA = {
  today: {
    dateRange: "Today · Live Telemetry",
    labels: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"],
    total: 31850,
    totalEvents: 32116,
    summary: {
      success: 31850,
      failed: 242,
      denied: 17,
      tamper: 7,
      doorForced: 0,
      doorHeld: 6,
      antiPassback: 3,
      tailgating: 1,
      restrictedArea: 142
    },
    scaleAuth: 8500,
    scaleIncident: 70,
    legend: [
      { key: 'success', label: 'Successful Authentication', value: '31,850', color: '#0284c7' },
      { key: 'failed',  label: 'Failed Authentication',      value: '242',    color: '#f59e0b' },
      { key: 'denied',  label: 'Access Denied',              value: '17',     color: '#ea580c' },
      { key: 'tamper',  label: 'Tamper Alerts',              value: '7',      color: '#ef4444' }
    ],
    curvePoints: [
      { label: "08:00", success: 4200, failed: 32, denied: 2, tamper: 1 },
      { label: "10:00", success: 7850, failed: 58, denied: 4, tamper: 2 },
      { label: "12:00", success: 5400, failed: 41, denied: 3, tamper: 1 },
      { label: "14:00", success: 6100, failed: 45, denied: 3, tamper: 1 },
      { label: "16:00", success: 5100, failed: 38, denied: 3, tamper: 1 },
      { label: "18:00", success: 2800, failed: 21, denied: 2, tamper: 1 },
      { label: "20:00", success: 400,  failed: 7,  denied: 0, tamper: 0 }
    ]
  },
  week: {
    dateRange: "Current Week (Mon – Sun)",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    total: 168250,
    totalEvents: 169579,
    summary: {
      success: 168250,
      failed: 1200,
      denied: 95,
      tamper: 34,
      doorForced: 2,
      doorHeld: 42,
      antiPassback: 18,
      tailgating: 8,
      restrictedArea: 980
    },
    scaleAuth: 35000,
    scaleIncident: 280,
    legend: [
      { key: 'success', label: 'Successful Authentication', value: '168,250', color: '#0284c7' },
      { key: 'failed',  label: 'Failed Authentication',      value: '1,200',   color: '#f59e0b' },
      { key: 'denied',  label: 'Access Denied',              value: '95',      color: '#ea580c' },
      { key: 'tamper',  label: 'Tamper Alerts',              value: '34',      color: '#ef4444' }
    ],
    curvePoints: [
      { label: "Mon", success: 31200, failed: 210, denied: 15, tamper: 6 },
      { label: "Tue", success: 31850, failed: 240, denied: 17, tamper: 7 },
      { label: "Wed", success: 30900, failed: 195, denied: 14, tamper: 5 },
      { label: "Thu", success: 31600, failed: 225, denied: 16, tamper: 6 },
      { label: "Fri", success: 30400, failed: 215, denied: 15, tamper: 7 },
      { label: "Sat", success: 12500, failed: 85,  denied: 6,  tamper: 2 },
      { label: "Sun", success: 4800,  failed: 30,  denied: 2,  tamper: 1 }
    ]
  },
  month: {
    dateRange: "September 2026",
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    total: 626000,
    totalEvents: 631072,
    summary: {
      success: 626000,
      failed: 4640,
      denied: 315,
      tamper: 117,
      doorForced: 6,
      doorHeld: 184,
      antiPassback: 74,
      tailgating: 29,
      restrictedArea: 4120
    },
    scaleAuth: 180000,
    scaleIncident: 1350,
    legend: [
      { key: 'success', label: 'Successful Authentication', value: '626,000', color: '#0284c7' },
      { key: 'failed',  label: 'Failed Authentication',      value: '4,640',   color: '#f59e0b' },
      { key: 'denied',  label: 'Access Denied',              value: '315',     color: '#ea580c' },
      { key: 'tamper',  label: 'Tamper Alerts',              value: '117',     color: '#ef4444' }
    ],
    curvePoints: [
      { label: "Week 1", success: 152000, failed: 1120, denied: 78, tamper: 28 },
      { label: "Week 2", success: 158000, failed: 1250, denied: 84, tamper: 32 },
      { label: "Week 3", success: 155000, failed: 1080, denied: 72, tamper: 26 },
      { label: "Week 4", success: 161000, failed: 1190, denied: 81, tamper: 31 }
    ]
  }
};

export const PDF_USAGE_METRICS = [
  { key: 'user', label: 'User', value: '35,000', pct: null, icon: 'user' },
  { key: 'fingerprint', label: 'Fingerprint', value: '34,420', pct: null, icon: 'fingerprint' },
  { key: 'card', label: 'Smart Card', value: '34,150', pct: null, icon: 'card' },
  { key: 'device', label: 'Device', value: '2,178', pct: '98.4%', icon: 'device' },
  { key: 'door', label: 'Door', value: '1,040', pct: '100%', icon: 'door' },
  { key: 'zone', label: 'Zone', value: '29', pct: '100%', icon: 'zone' },
  { key: 'access-group', label: 'Access Group', value: '829', pct: null, icon: 'access-group' },
];

export const PDF_USER_RECORDS = [
  { id: "USR-1001", name: "Alexander Vance", department: "Executive Management", branch: "Head Office", category: "Head Office", role: "Chief Security Officer", card: "CRD-9921", fingerprint: true, status: "Active" },
  { id: "USR-1002", name: "Elena Rostova", department: "IT & Infrastructure", branch: "Head Office", category: "Head Office", role: "SysAdmin Lead", card: "CRD-8472", fingerprint: true, status: "Active" },
  { id: "USR-1003", name: "David Chen", department: "Operations", branch: "X-Branch", category: "Branch", role: "Operations Manager", card: "CRD-6632", fingerprint: true, status: "Active" },
  { id: "USR-1004", name: "Sarah Al-Mansoor", department: "Retail Banking", branch: "Y-Branch", category: "Branch", role: "Branch Supervisor", card: "CRD-5514", fingerprint: true, status: "Active" },
  { id: "USR-1005", name: "Marcus Brody", department: "Treasury", branch: "Z-Branch", category: "Branch", role: "Vault Specialist", card: "CRD-4419", fingerprint: true, status: "Active" },
  { id: "USR-1006", name: "Kavita Patel", department: "Customer Support", branch: "A-Sub-Br", category: "Sub-Branch", role: "Service Officer", card: "CRD-3381", fingerprint: true, status: "Active" },
  { id: "USR-1007", name: "Liam O'Connor", department: "Field Maintenance", branch: "X-Sub Br", category: "Sub-Branch", role: "Technician", card: "CRD-2294", fingerprint: true, status: "Suspended" },
  { id: "USR-1008", name: "Rachel Kim", department: "Audit & Compliance", branch: "RO-X", category: "RO", role: "Regional Auditor", card: "CRD-1903", fingerprint: true, status: "Active" },
  { id: "USR-1009", name: "Tariq Zaman", department: "Regional Ops", branch: "RO-Y", category: "RO", role: "Regional Director", card: "CRD-1755", fingerprint: true, status: "Active" },
  { id: "USR-1010", name: "Hannah Schmidt", department: "Digital Banking", branch: "Head Office", category: "Head Office", role: "Product Manager", card: "CRD-1420", fingerprint: true, status: "Active" },
  { id: "USR-1011", name: "Carlos Mendez", department: "Facilities", branch: "X-Branch", category: "Branch", role: "Access Warden", card: "CRD-1192", fingerprint: true, status: "Active" },
  { id: "USR-1012", name: "Amina Diallo", department: "Risk Management", branch: "RO-X", category: "RO", role: "Risk Analyst", card: "CRD-1053", fingerprint: true, status: "Active" }
];

export const PDF_ACCESS_GROUPS = [
  { id: "AG-001", name: "Executive 24/7 Access", category: "Head Office", branch: "Head Office", accessLevel: "Level 5 (Unrestricted)", doorsCount: 60, floorLevel: "All Floors", doorStatus: "Always Granted", schedule: "24 Hours / 7 Days", activeUsers: 14 },
  { id: "AG-002", name: "IT Server Room High Security", category: "Head Office", branch: "Head Office", accessLevel: "Level 4 (MFA Required)", doorsCount: 6, floorLevel: "Basement & Floor 4", doorStatus: "Dual Auth FP + Card / PIN", schedule: "Pre-approved Window", activeUsers: 8 },
  { id: "AG-003", name: "Branch Standard Employee", category: "Branch", branch: "X-Branch", accessLevel: "Level 2 (Standard)", doorsCount: 8, floorLevel: "Ground Floor", doorStatus: "Schedule Locked", schedule: "Mon-Sat 08:00 - 19:00", activeUsers: 42 },
  { id: "AG-004", name: "Branch Vault & Cash Desk", category: "Branch", branch: "Y-Branch", accessLevel: "Level 4 (Restricted)", doorsCount: 3, floorLevel: "Floor 1 Secure Zone", doorStatus: "Interlock Enabled", schedule: "Mon-Fri 09:00 - 17:30", activeUsers: 5 },
  { id: "AG-005", name: "Sub-Branch Core Staff", category: "Sub-Branch", branch: "A-Sub-Br", accessLevel: "Level 2 (Standard)", doorsCount: 4, floorLevel: "Ground Floor", doorStatus: "Standard Card/PIN", schedule: "Mon-Fri 08:30 - 18:00", activeUsers: 16 },
  { id: "AG-006", name: "Sub-Branch Facilities", category: "Sub-Branch", branch: "X-Sub Br", accessLevel: "Level 3 (Facilities)", doorsCount: 5, floorLevel: "Perimeter & Service", doorStatus: "Card Only", schedule: "Mon-Sat 07:00 - 20:00", activeUsers: 9 },
  { id: "AG-007", name: "Regional Office Management", category: "Regional Office", branch: "RO-X", accessLevel: "Level 3 (Supervisory)", doorsCount: 18, floorLevel: "Floors 1-3", doorStatus: "FP / Card", schedule: "Mon-Sun 06:00 - 22:00", activeUsers: 31 },
  { id: "AG-008", name: "Regional Audit Flying Squad", category: "Regional Office", branch: "RO-Y", accessLevel: "Level 4 (Audit Multi-site)", doorsCount: 34, floorLevel: "Regional Multi-floor", doorStatus: "Biometric Verified", schedule: "Mon-Sat 08:00 - 20:00", activeUsers: 12 }
];

export const PDF_DOOR_RECORDS = [
  // ── BRANCH DOORS ───────────────────────────────────────────────────────────
  { id: "DOR-01", name: "X-Branch Main Entrance ACS", branch: "X-Branch", category: "Branch", system: "Access Control", purpose: "X-Branch ACS", doorRequirement: "Main Perimeter ACS", floor: "Ground Floor", relay: "CS-40 R1", lockStatus: "Locked (Normal)", alarmStatus: "Normal", state: "Active", securityLevel: "Level 2 (Standard)", readerIn: "DEV-104 (BioStation 3)", readerOut: "Exit Button" },
  { id: "DOR-02", name: "X-Branch Attn Checkpoint", branch: "X-Branch", category: "Branch", system: "Attendance", purpose: "X-Branch Attn", doorRequirement: "Attendance Punch Checkpoint", floor: "Ground Floor Lobby", relay: "Direct Pass-thru", lockStatus: "Pass-thru", alarmStatus: "Normal", state: "Active", securityLevel: "Standard", readerIn: "DEV-104 (BioStation 3)", readerOut: "None" },
  { id: "DOR-03", name: "Y-Branch Main Entrance ACS", branch: "Y-Branch", category: "Branch", system: "Access Control", purpose: "Y-Branch ACS", doorRequirement: "Main Perimeter ACS", floor: "Ground Floor", relay: "CS-40 R2", lockStatus: "Locked (Normal)", alarmStatus: "Normal", state: "Active", securityLevel: "Level 2 (Standard)", readerIn: "DEV-106 (BioStation 3)", readerOut: "Exit Button" },
  { id: "DOR-04", name: "Y-Branch Attn Checkpoint", branch: "Y-Branch", category: "Branch", system: "Attendance", purpose: "Y-Branch Attn", doorRequirement: "Attendance Punch Checkpoint", floor: "Staff Vestibule", relay: "Direct Pass-thru", lockStatus: "Pass-thru", alarmStatus: "Normal", state: "Active", securityLevel: "Standard", readerIn: "DEV-106 (BioStation 3)", readerOut: "None" },
  { id: "DOR-05", name: "Z-Branch Security Gate", branch: "Z-Branch", category: "Branch", system: "Access Control", purpose: "Z-Branch ACS", doorRequirement: "High-Security Gate", floor: "Ground Floor", relay: "CS-40 R3", lockStatus: "Locked (Normal)", alarmStatus: "Normal", state: "Active", securityLevel: "Level 3 (Supervisory)", readerIn: "DEV-107 (BioEntry P2)", readerOut: "DEV-107 (BioEntry P2)" },
  { id: "DOR-06", name: "Z-Branch Attn Checkpoint", branch: "Z-Branch", category: "Branch", system: "Attendance", purpose: "Z-Branch Attn", doorRequirement: "Attendance Punch Checkpoint", floor: "Lobby Turnstile", relay: "Direct Pass-thru", lockStatus: "Pass-thru", alarmStatus: "Normal", state: "Active", securityLevel: "Standard", readerIn: "DEV-107 (BioEntry P2)", readerOut: "None" },
  { id: "DOR-13", name: "Y-Branch Cash Vault & Strong Room", branch: "Y-Branch", category: "Branch", system: "Access Control", purpose: "Branch Vault Dual-Custody", doorRequirement: "Vault & High Security Dual Custody", floor: "Basement Vault Level", relay: "Interlock Relay 1", lockStatus: "Dual-Auth Armed", alarmStatus: "Normal", state: "Active", securityLevel: "Level 5 (Dual Custody)", readerIn: "BioEntry P2 (FP+PIN)", readerOut: "BioEntry P2 (FP+PIN)" },
  { id: "DOR-14", name: "X-Branch Teller Mantrap Door", branch: "X-Branch", category: "Branch", system: "Access Control", purpose: "Cash Counter Interlock", doorRequirement: "Cash Counter Mantrap", floor: "Ground Floor", relay: "CS-40 Interlock R4", lockStatus: "Interlock Armed", alarmStatus: "Normal", state: "Active", securityLevel: "Level 4 (Cash Area)", readerIn: "X-Pass 2 (RFID)", readerOut: "Push Bar" },

  // ── SUB-BRANCH DOORS ───────────────────────────────────────────────────────
  { id: "DOR-07", name: "A-Sub-Br Entrance ACS", branch: "A-Sub-Br", category: "Sub-Branch", system: "Access Control", purpose: "A-Sub-Br-ACS", doorRequirement: "Main Perimeter ACS", floor: "Ground Floor", relay: "Direct Relay", lockStatus: "Locked (Normal)", alarmStatus: "Normal", state: "Active", securityLevel: "Level 2 (Standard)", readerIn: "DEV-109 (BioEntry W2)", readerOut: "Exit Button" },
  { id: "DOR-08", name: "A-Sub-Br Attn Clock", branch: "A-Sub-Br", category: "Sub-Branch", system: "Attendance", purpose: "A-Sub-Br-Attn", doorRequirement: "Attendance Punch Checkpoint", floor: "Counter Entrance", relay: "Direct Pass-thru", lockStatus: "Pass-thru", alarmStatus: "Normal", state: "Active", securityLevel: "Standard", readerIn: "DEV-109 (BioEntry W2)", readerOut: "None" },
  { id: "DOR-15", name: "X-Sub Br Security Entrance", branch: "X-Sub Br", category: "Sub-Branch", system: "Access Control", purpose: "X-Sub-Br-ACS", doorRequirement: "Sub-Branch Perimeter ACS", floor: "Ground Floor", relay: "Single Relay", lockStatus: "Held Open Alert", alarmStatus: "Held Open > 30s", state: "Alarm", securityLevel: "Level 2 (Standard)", readerIn: "DEV-108 (BioLite N2)", readerOut: "Exit Button" },
  { id: "DOR-16", name: "X-Sub Br Teller Safe Access", branch: "X-Sub Br", category: "Sub-Branch", system: "Access Control", purpose: "Sub-Branch Vault Safe", doorRequirement: "Vault & High Security Dual Custody", floor: "Rear Service Area", relay: "Time-Delay Relay", lockStatus: "Locked (Time-Lock)", alarmStatus: "Normal", state: "Active", securityLevel: "Level 4 (MFA Required)", readerIn: "BioLite N2 (FP+PIN)", readerOut: "BioLite N2" },

  // ── REGIONAL OFFICE (RO) DOORS ─────────────────────────────────────────────
  { id: "DOR-09", name: "X-RO Main Access Turnstiles", branch: "RO-X", category: "Regional Office", system: "Access Control", purpose: "X-RO-ACS", doorRequirement: "Turnstile Multi-Lane ACS", floor: "Floor 1 Turnstiles", relay: "CS-40 R1-R4", lockStatus: "Locked (Normal)", alarmStatus: "Normal", state: "Active", securityLevel: "Level 3 (Supervisory)", readerIn: "DEV-111 (BioStation 3)", readerOut: "DEV-111 (BioStation 3)" },
  { id: "DOR-10", name: "X-RO Attendance Clock", branch: "RO-X", category: "Regional Office", system: "Attendance", purpose: "X-RO-Attn", doorRequirement: "Attendance Punch Checkpoint", floor: "Floor 1 Main Atrium", relay: "Direct Pass-thru", lockStatus: "Pass-thru", alarmStatus: "Normal", state: "Active", securityLevel: "Standard", readerIn: "DEV-111 (BioStation 3)", readerOut: "None" },
  { id: "DOR-17", name: "RO-X Regional Server Room Door", branch: "RO-X", category: "Regional Office", system: "Access Control", purpose: "Regional IT Data Hub", doorRequirement: "Data Center Interlock", floor: "Floor 2 IT Suite", relay: "CS-40 Dual Interlock", lockStatus: "Locked (Normal)", alarmStatus: "Normal", state: "Active", securityLevel: "Level 4 (IT Clearance)", readerIn: "BioEntry W2 (FP+Card)", readerOut: "BioEntry W2 (FP+Card)" },
  { id: "DOR-18", name: "RO-Y Executive Wing Access", branch: "RO-Y", category: "Regional Office", system: "Access Control", purpose: "RO-Y Executive ACS", doorRequirement: "Executive Restricted Zone", floor: "Floor 3 Executive", relay: "CS-40 R2", lockStatus: "Locked (Normal)", alarmStatus: "Normal", state: "Active", securityLevel: "Level 4 (Executive)", readerIn: "DEV-112 (BioStation 2)", readerOut: "BioStation 2" },

  // ── HEAD OFFICE DOORS ──────────────────────────────────────────────────────
  { id: "DOR-11", name: "Head Office Central Vault & Treasury", branch: "Head Office", category: "Head Office", system: "Access Control", purpose: "Central Bank Treasury Vault", doorRequirement: "Vault & High Security Dual Custody", floor: "Sub-Basement B2 Safe", relay: "CS-40 Dual Relay Armed", lockStatus: "Dual-Custody Locked", alarmStatus: "Normal", state: "Active", securityLevel: "Level 5 (Dual Custody)", readerIn: "BioStation 3 (FP+Card) + BioEntry P2", readerOut: "BioStation 3 (FP+Card) + BioEntry P2" },
  { id: "DOR-12", name: "Head Office Tier-IV Data Center Interlock", branch: "Head Office", category: "Head Office", system: "Access Control", purpose: "Core Banking Server Farm", doorRequirement: "Data Center Interlock", floor: "Floor 4 Primary Data Center", relay: "CoreStation CS-40 Air-Lock", lockStatus: "Interlock Armed", alarmStatus: "Normal", state: "Active", securityLevel: "Level 5 (Restricted)", readerIn: "BioStation 2 (FP+Card)", readerOut: "BioStation 2 (FP+Card)" },
  { id: "DOR-19", name: "Head Office Main Lobby Turnstiles (North)", branch: "Head Office", category: "Head Office", system: "Access Control", purpose: "Corporate Headquarters ACS", doorRequirement: "Main Perimeter ACS", floor: "Ground Floor Grand Lobby", relay: "CS-40 Turnstile Banks", lockStatus: "Locked (Normal)", alarmStatus: "Normal", state: "Active", securityLevel: "Level 2 (Corporate)", readerIn: "DEV-101 (BioStation 3)", readerOut: "DEV-101 (BioStation 3)" },
  { id: "DOR-20", name: "Head Office Main Lobby Attn Portal", branch: "Head Office", category: "Head Office", system: "Attendance", purpose: "Head Office Attn Clock", doorRequirement: "Attendance Punch Checkpoint", floor: "Ground Floor North Lobby", relay: "Direct Pass-thru", lockStatus: "Pass-thru", alarmStatus: "Normal", state: "Active", securityLevel: "Standard", readerIn: "DEV-101 (BioStation 3)", readerOut: "None" },
  { id: "DOR-21", name: "Head Office Board of Directors Suite", branch: "Head Office", category: "Head Office", system: "Access Control", purpose: "Boardroom & MD Secretariat", doorRequirement: "Executive Restricted Zone", floor: "Floor 18 Executive Floor", relay: "CS-40 Fail-Secure R1", lockStatus: "Locked (Normal)", alarmStatus: "Normal", state: "Active", securityLevel: "Level 5 (Unrestricted)", readerIn: "BioEntry P2 (FP + Smart Card)", readerOut: "Exit Touch Sensor" },

  // ── DOORS WITH TELEMETRY & ALARM STATUS ────────────────────────────────────
  { id: "DOR-22", name: "Motijheel Branch Emergency Fire Exit Door", branch: "Motijheel Br", category: "Branch", system: "Access Control", purpose: "Perimeter Emergency Exit", doorRequirement: "Emergency Fire Exit Monitored", floor: "Ground Floor Stairwell", relay: "Magnetic Lock Fire Release", lockStatus: "Door Forced Alarm", alarmStatus: "Door Forced Open", state: "Alarm", securityLevel: "Level 3 (Security Alert)", readerIn: "X-Pass 2 (RFID)", readerOut: "Emergency Panic Bar" },
  { id: "DOR-23", name: "Dhanmondi Branch Rear Cash Delivery Gate", branch: "Dhanmondi Br", category: "Branch", system: "Access Control", purpose: "Cash-in-Transit Vehicle Gate", doorRequirement: "Cash Counter Mantrap", floor: "Ground Floor Delivery Bay", relay: "Heavy Solenoid Lock", lockStatus: "Tamper Triggered", alarmStatus: "Tamper Switch Open", state: "Alarm", securityLevel: "Level 4 (High Risk)", readerIn: "BioEntry W2 (Outdoor IP67)", readerOut: "BioEntry W2" }
];

export const PDF_DEVICE_RECORDS = [
  { id: "DEV-101", name: "BioStation 3 - Main Lobby", category: "Head Office", branch: "Head Office", division: "X-Division", ip: "192.168.10.21", model: "Suprema BioStation 3", type: "Fingerprint & RFID Card", firmware: "v1.4.2", status: "Active", ping: "4ms", uptime: "99.98%" },
  { id: "DEV-102", name: "BioEntry W2 - Server Room", category: "Head Office", branch: "Head Office", division: "Y-Division", ip: "192.168.10.25", model: "BioEntry W2 IP67", type: "Fingerprint & Card", firmware: "v2.1.0", status: "Active", ping: "2ms", uptime: "100%" },
  { id: "DEV-103", name: "CoreStation 4-Door Controller", category: "Head Office", branch: "Head Office", division: "X-Division", ip: "192.168.10.10", model: "CoreStation CS-40", type: "Intelligent Controller", firmware: "v1.5.0", status: "Active", ping: "1ms", uptime: "99.99%" },
  { id: "DEV-104", name: "BioStation 3 - Entrance Gate", category: "Branch", branch: "X-Branch", division: null, ip: "10.45.1.12", model: "BioStation 3 AI", type: "Fingerprint & Mobile Card", firmware: "v1.2.8", status: "Active", ping: "14ms", uptime: "99.91%" },
  { id: "DEV-105", name: "X-Pass 2 - Back Office Door", category: "Branch", branch: "X-Branch", division: null, ip: "10.45.1.15", model: "X-Pass 2 Gangbox", type: "RFID & BLE", firmware: "v1.1.4", status: "Active", ping: "12ms", uptime: "99.85%" },
  { id: "DEV-106", name: "BioStation 3 - Front Counter", category: "Branch", branch: "Y-Branch", division: null, ip: "10.46.1.12", model: "BioStation 3 AI", type: "Fingerprint & RFID Card", firmware: "v1.2.8", status: "Active", ping: "18ms", uptime: "99.40%" },
  { id: "DEV-107", name: "BioEntry P2 - Cash Vault", category: "Branch", branch: "Y-Branch", division: null, ip: "10.46.1.18", model: "BioEntry P2 Slim", type: "Fingerprint & PIN", firmware: "v2.0.2", status: "Active", ping: "16ms", uptime: "99.99%" },
  { id: "DEV-108", name: "BioLite N2 - Staff Gate", category: "Sub-Branch", branch: "X-Sub Br", division: null, ip: "10.50.2.20", model: "BioLite N2 Keypad", type: "Outdoor FP & Card", firmware: "v1.3.1", status: "Inactive", ping: "Timeout", uptime: "94.20%" },
  { id: "DEV-109", name: "BioEntry W2 - Reception Door", category: "Sub-Branch", branch: "A-Sub-Br", division: null, ip: "10.51.1.11", model: "BioEntry W2 Compact", type: "Fingerprint & Card", firmware: "v1.2.0", status: "Active", ping: "22ms", uptime: "99.70%" },
  { id: "DEV-110", name: "CoreStation - Regional Hub", category: "Regional Office", branch: "RO-X", division: null, ip: "10.20.0.10", model: "CoreStation CS-40", type: "Controller", firmware: "v1.5.0", status: "Active", ping: "9ms", uptime: "99.99%" },
  { id: "DEV-111", name: "BioStation 3 - RO Lobby", category: "Regional Office", branch: "RO-X", division: null, ip: "10.20.0.15", model: "Suprema BioStation 3", type: "Fingerprint & Mobile Card", firmware: "v1.4.2", status: "Active", ping: "8ms", uptime: "99.92%" },
  { id: "DEV-112", name: "BioStation 2 - RO Exit Door", category: "Regional Office", branch: "RO-Y", division: null, ip: "10.30.0.14", model: "BioStation 2", type: "FP & Card", firmware: "v1.0.8", status: "Active", ping: "11ms", uptime: "99.88%" }
];
