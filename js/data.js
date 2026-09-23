/**
 * Mock Data Engine for Access Control & Attendance System
 */

const AppData = {
  stats: {
    userTotal: 1250,
    fingerprint: 1150,
    card: 1080,
    deviceOnlinePct: 100,
    deviceTotal: 48,
    doorActivePct: 20,
    doorTotal: 60,
    zonePct: 0.5,
    zoneTotal: 12,
    accessGroupTotal: 300
  },

  chartData: {
    week: {
      dateRange: "15 May 2026 - 21 May 2026",
      labels: ["15", "16", "17", "18", "19", "20", "21"],
      total: 1527,
      series: [
        {
          name: "1:N duplex authentication",
          color: "#00b4d8",
          data: [130, 260, 390, 420, 560, 340, 160]
        },
        {
          name: "Access denied (Door/Time)",
          color: "#f59e0b",
          data: [15, 22, 38, 45, 62, 35, 18]
        },
        {
          name: "Tamper on",
          color: "#ef4444",
          data: [2, 0, 4, 3, 1, 5, 2]
        }
      ]
    },
    month: {
      dateRange: "01 May 2026 - 31 May 2026",
      labels: ["W1", "W2", "W3", "W4"],
      total: 6842,
      series: [
        {
          name: "1:N duplex authentication",
          color: "#00b4d8",
          data: [1420, 1890, 2150, 1382]
        },
        {
          name: "Access denied (Door/Time)",
          color: "#f59e0b",
          data: [110, 145, 168, 92]
        },
        {
          name: "Tamper on",
          color: "#ef4444",
          data: [14, 8, 19, 11]
        }
      ]
    },
    year: {
      dateRange: "Jan 2026 - Dec 2026",
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      total: 78940,
      series: [
        {
          name: "1:N duplex authentication",
          color: "#00b4d8",
          data: [5200, 5800, 6400, 7100, 7900, 8100, 7600, 7950, 8300, 8600, 8400, 8890]
        },
        {
          name: "Access denied (Door/Time)",
          color: "#f59e0b",
          data: [420, 390, 450, 510, 540, 520, 480, 510, 530, 560, 540, 580]
        },
        {
          name: "Tamper on",
          color: "#ef4444",
          data: [24, 18, 31, 29, 35, 22, 19, 27, 24, 30, 21, 26]
        }
      ]
    }
  },

  users: [
    { id: "USR-1001", name: "Alexander Vance", department: "Executive Management", branch: "Head Office", category: "HO", role: "Chief Security Officer", card: "CRD-9921", fingerprint: true, status: "Active" },
    { id: "USR-1002", name: "Elena Rostova", department: "IT & Infrastructure", branch: "Head Office", category: "HO", role: "SysAdmin Lead", card: "CRD-8472", fingerprint: true, status: "Active" },
    { id: "USR-1003", name: "David Chen", department: "Operations", branch: "X-Branch", category: "Branch", role: "Operations Manager", card: "CRD-6632", fingerprint: true, status: "Active" },
    { id: "USR-1004", name: "Sarah Al-Mansoor", department: "Retail Banking", branch: "Y-Branch", category: "Branch", role: "Branch Supervisor", card: "CRD-5514", fingerprint: true, status: "Active" },
    { id: "USR-1005", name: "Marcus Brody", department: "Treasury", branch: "Z-Branch", category: "Branch", role: "Vault Specialist", card: "CRD-4419", fingerprint: true, status: "Active" },
    { id: "USR-1006", name: "Kavita Patel", department: "Customer Support", branch: "A-Sub-Br", category: "Sub-Branch", role: "Service Officer", card: "CRD-3381", fingerprint: true, status: "Active" },
    { id: "USR-1007", name: "Liam O'Connor", department: "Field Maintenance", branch: "X-Sub-Br", category: "Sub-Branch", role: "Technician", card: "CRD-2294", fingerprint: true, status: "Suspended" },
    { id: "USR-1008", name: "Rachel Kim", department: "Audit & Compliance", branch: "RO-X", category: "RO", role: "Regional Auditor", card: "CRD-1903", fingerprint: true, status: "Active" },
    { id: "USR-1009", name: "Tariq Zaman", department: "Regional Ops", branch: "RO-Y", category: "RO", role: "Regional Director", card: "CRD-1755", fingerprint: true, status: "Active" },
    { id: "USR-1010", name: "Hannah Schmidt", department: "Digital Banking", branch: "Head Office", category: "HO", role: "Product Manager", card: "CRD-1420", fingerprint: true, status: "Active" },
    { id: "USR-1011", name: "Carlos Mendez", department: "Facilities", branch: "X-Branch", category: "Branch", role: "Access Warden", card: "CRD-1192", fingerprint: true, status: "Active" },
    { id: "USR-1012", name: "Amina Diallo", department: "Risk Management", branch: "RO-X", category: "RO", role: "Risk Analyst", card: "CRD-1053", fingerprint: true, status: "Active" }
  ],

  accessGroups: [
    { id: "AG-001", name: "Executive 24/7 Access", category: "Head Office", branch: "Head Office", accessLevel: "Level 5 (Unrestricted)", doorsCount: 60, floorLevel: "All Floors", doorStatus: "Always Granted", schedule: "24 Hours / 7 Days", activeUsers: 14 },
    { id: "AG-002", name: "IT Server Room High Security", category: "Head Office", branch: "Head Office", accessLevel: "Level 4 (MFA Required)", doorsCount: 6, floorLevel: "Basement & Floor 4", doorStatus: "Dual Auth FP + Card / PIN", schedule: "Pre-approved Window", activeUsers: 8 },
    { id: "AG-003", name: "Branch Standard Employee", category: "Branch", branch: "X-Branch", accessLevel: "Level 2 (Standard)", doorsCount: 8, floorLevel: "Ground Floor", doorStatus: "Schedule Locked", schedule: "Mon-Sat 08:00 - 19:00", activeUsers: 42 },
    { id: "AG-004", name: "Branch Vault & Cash Desk", category: "Branch", branch: "Y-Branch", accessLevel: "Level 4 (Restricted)", doorsCount: 3, floorLevel: "Floor 1 Secure Zone", doorStatus: "Interlock Enabled", schedule: "Mon-Fri 09:00 - 17:30", activeUsers: 5 },
    { id: "AG-005", name: "Sub-Branch Core Staff", category: "Sub-Branch", branch: "A-Sub-Br", accessLevel: "Level 2 (Standard)", doorsCount: 4, floorLevel: "Ground Floor", doorStatus: "Standard Card/PIN", schedule: "Mon-Fri 08:30 - 18:00", activeUsers: 16 },
    { id: "AG-006", name: "Sub-Branch Facilities", category: "Sub-Branch", branch: "X-Sub Br", accessLevel: "Level 3 (Facilities)", doorsCount: 5, floorLevel: "Perimeter & Service", doorStatus: "Card Only", schedule: "Mon-Sat 07:00 - 20:00", activeUsers: 9 },
    { id: "AG-007", name: "Regional Office Management", category: "Regional Office", branch: "RO-X", accessLevel: "Level 3 (Supervisory)", doorsCount: 18, floorLevel: "Floors 1-3", doorStatus: "FP / Card", schedule: "Mon-Sun 06:00 - 22:00", activeUsers: 31 },
    { id: "AG-008", name: "Regional Audit Flying Squad", category: "Regional Office", branch: "RO-Y", accessLevel: "Level 4 (Audit Multi-site)", doorsCount: 34, floorLevel: "Regional Multi-floor", doorStatus: "Biometric Verified (FP)", schedule: "Mon-Sat 08:00 - 20:00", activeUsers: 12 }
  ],

  devices: [
    { id: "DEV-101", name: "BioStation 3 - Main Lobby", category: "Head Office", branch: "Head Office", ip: "192.168.10.21", model: "Suprema BioStation 3", type: "Fingerprint & RFID Card", firmware: "v1.4.2", status: "Active", ping: "4ms", uptime: "99.98%" },
    { id: "DEV-102", name: "BioEntry W2 - Server Room", category: "Head Office", branch: "Head Office", ip: "192.168.10.25", model: "BioEntry W2 IP67", type: "Fingerprint & Card", firmware: "v2.1.0", status: "Active", ping: "2ms", uptime: "100%" },
    { id: "DEV-103", name: "CoreStation 4-Door Controller", category: "Head Office", branch: "Head Office", ip: "192.168.10.10", model: "CoreStation CS-40", type: "Intelligent Controller", firmware: "v1.5.0", status: "Active", ping: "1ms", uptime: "99.99%" },
    { id: "DEV-104", name: "BioStation 3 - Entrance Gate", category: "Branch", branch: "X-Branch", ip: "10.45.1.12", model: "BioStation 3 AI", type: "Fingerprint & RFID Card", firmware: "v1.2.8", status: "Active", ping: "14ms", uptime: "99.91%" },
    { id: "DEV-105", name: "X-Pass 2 - Back Office Door", category: "Branch", branch: "X-Branch", ip: "10.45.1.15", model: "X-Pass 2 Gangbox", type: "RFID & BLE", firmware: "v1.1.4", status: "Active", ping: "12ms", uptime: "99.85%" },
    { id: "DEV-106", name: "BioStation 3 - Front Counter", category: "Branch", branch: "Y-Branch", ip: "10.46.1.12", model: "BioStation 3 AI", type: "Fingerprint & Card", firmware: "v1.2.8", status: "Active", ping: "18ms", uptime: "99.40%" },
    { id: "DEV-107", name: "BioEntry P2 - Cash Vault", category: "Branch", branch: "Y-Branch", ip: "10.46.1.18", model: "BioEntry P2 Slim", type: "Fingerprint & PIN", firmware: "v2.0.2", status: "Active", ping: "16ms", uptime: "99.99%" },
    { id: "DEV-108", name: "BioLite N2 - Staff Gate", category: "Sub-Branch", branch: "X-Sub Br", ip: "10.50.2.20", model: "BioLite N2 Keypad", type: "Outdoor FP & Card", firmware: "v1.3.1", status: "Inactive", ping: "Timeout", uptime: "94.20%" },
    { id: "DEV-109", name: "BioEntry P2 - Reception Door", category: "Sub-Branch", branch: "A-Sub-Br", ip: "10.51.1.11", model: "BioEntry P2 Slim", type: "Fingerprint & Card", firmware: "v1.2.0", status: "Active", ping: "22ms", uptime: "99.70%" },
    { id: "DEV-110", name: "CoreStation - Regional Hub", category: "Regional Office", branch: "RO-X", ip: "10.20.0.10", model: "CoreStation CS-40", type: "Controller", firmware: "v1.5.0", status: "Active", ping: "9ms", uptime: "99.99%" },
    { id: "DEV-111", name: "BioStation 3 - RO Lobby", category: "Regional Office", branch: "RO-X", ip: "10.20.0.15", model: "Suprema BioStation 3", type: "Fingerprint & Smart Card", firmware: "v1.4.2", status: "Active", ping: "8ms", uptime: "99.92%" },
    { id: "DEV-112", name: "BioStation 2 - RO Exit Door", category: "Regional Office", branch: "RO-Y", ip: "10.30.0.14", model: "BioStation 2", type: "FP & Card", firmware: "v1.0.8", status: "Active", ping: "11ms", uptime: "99.88%" }
  ],

  doors: [
    { id: "DOR-01", name: "X-Branch Main Entrance", branch: "X-Branch", category: "Branch", system: "Access Control", purpose: "X-Branch ACS", floor: "Ground Floor", relay: "CS-40 R1", lockStatus: "Locked (Normal)", state: "Active", readerIn: "DEV-104", readerOut: "Exit Button" },
    { id: "DOR-02", name: "X-Branch Attn Checkpoint", branch: "X-Branch", category: "Branch", system: "Attendance", purpose: "X-Branch Attn", floor: "Ground Floor Lobby", relay: "Direct", lockStatus: "Pass-thru", state: "Active", readerIn: "DEV-104", readerOut: "None" },
    { id: "DOR-03", name: "Y-Branch Main Entrance", branch: "Y-Branch", category: "Branch", system: "Access Control", purpose: "Y-Branch ACS", floor: "Ground Floor", relay: "CS-40 R2", lockStatus: "Locked (Normal)", state: "Active", readerIn: "DEV-106", readerOut: "Exit Button" },
    { id: "DOR-04", name: "Y-Branch Attn Checkpoint", branch: "Y-Branch", category: "Branch", system: "Attendance", purpose: "Y-Branch Attn", floor: "Staff Vestibule", relay: "Direct", lockStatus: "Pass-thru", state: "Active", readerIn: "DEV-106", readerOut: "None" },
    { id: "DOR-05", name: "Z-Branch Security Gate", branch: "Z-Branch", category: "Branch", system: "Access Control", purpose: "Z-Branch ACS", floor: "Ground Floor", relay: "CS-40 R3", lockStatus: "Locked (Normal)", state: "Active", readerIn: "DEV-107", readerOut: "DEV-107" },
    { id: "DOR-06", name: "Z-Branch Attn Checkpoint", branch: "Z-Branch", category: "Branch", system: "Attendance", purpose: "Z-Branch Attn", floor: "Lobby Turnstile", relay: "Direct", lockStatus: "Pass-thru", state: "Active", readerIn: "DEV-107", readerOut: "None" },
    { id: "DOR-07", name: "A-Sub-Br Entrance ACS", branch: "A-Sub-Br", category: "Sub-Branch", system: "Access Control", purpose: "A-Sub-Br-ACS", floor: "Ground Floor", relay: "Direct Relay", lockStatus: "Locked (Normal)", state: "Active", readerIn: "DEV-109", readerOut: "Exit Button" },
    { id: "DOR-08", name: "A-Sub-Br Attn Clock", branch: "A-Sub-Br", category: "Sub-Branch", system: "Attendance", purpose: "A-Sub-Br-Attn", floor: "Counter Entrance", relay: "Direct", lockStatus: "Pass-thru", state: "Active", readerIn: "DEV-109", readerOut: "None" },
    { id: "DOR-09", name: "X-RO Main Access Portal", branch: "RO-X", category: "RO", system: "Access Control", purpose: "X-RO-ACS", floor: "Floor 1 Turnstiles", relay: "CS-40 R1-R4", lockStatus: "Locked (Normal)", state: "Active", readerIn: "DEV-111", readerOut: "DEV-111" },
    { id: "DOR-10", name: "X-RO Attendance Clock", branch: "RO-X", category: "RO", system: "Attendance", purpose: "X-RO-Attn", floor: "Floor 1 Main Atrium", relay: "Direct", lockStatus: "Pass-thru", state: "Active", readerIn: "DEV-111", readerOut: "None" }
  ]
};

window.AppData = AppData;
