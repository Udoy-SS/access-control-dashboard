/**
 * securityReportsData.js
 * Comprehensive Mock Datasets and Schema Definitions for Suprema BioStar X
 * Banking Command Center — Pubali Bank PLC
 * 
 * 12 Reports across 3 Categories:
 * Category 1: Access & Authentication Reports (1-4)
 * Category 2: Security & Incident Reports (5-9)
 * Category 3: Door & Facility Monitoring Reports (10-12)
 */

export const REPORT_CATEGORIES = [
  {
    id: 'access-auth',
    title: 'Access & Authentication Reports',
    shortTitle: 'Access & Auth',
    icon: 'ShieldCheck',
    badge: '4 Reports',
    description: 'Biometric clearances, authentication attempts, credential audits and authorization logs across all 829 branches.',
    reportIds: ['access-granted', 'access-denied', 'unauthorized-access', 'auth-method']
  },
  {
    id: 'security-incident',
    title: 'Security & Incident Reports',
    shortTitle: 'Security & Incidents',
    icon: 'AlertTriangle',
    badge: '5 Reports',
    description: 'Anti-passback violations, multi-person tailgating detection, door tampering and forced door intrusions.',
    reportIds: ['anti-passback', 'multi-person', 'tailgating-incident', 'door-tamper', 'door-forced']
  },
  {
    id: 'door-facility',
    title: 'Door & Facility Monitoring Reports',
    shortTitle: 'Door & Facility',
    icon: 'DoorClosed',
    badge: '3 Reports',
    description: 'Door held-open monitoring, real-time occupancy counting against thresholds, and emergency lock/unlock audits.',
    reportIds: ['door-held-open', 'occupancy-report', 'emergency-lock-unlock']
  }
];

export const REPORTS_CONFIG = {
  // ─── 1. ACCESS GRANTED REPORT ────────────────────────────────────────────────
  'access-granted': {
    id: 'access-granted',
    categoryId: 'access-auth',
    title: 'Access Granted Report',
    subtitle: 'Verified biometric & RFID credential access approvals across all bank zones',
    kpi: {
      label: 'Granted Clearances',
      value: '18,492',
      trend: '+4.2% vs yesterday',
      status: 'Normal',
      color: '#10b981'
    },
    columns: [
      { key: 'date', label: 'Date', sortable: true, width: '105px' },
      { key: 'time', label: 'Time', sortable: true, width: '90px' },
      { key: 'emp_id', label: 'Employee ID', sortable: true, width: '120px' },
      { key: 'emp_name', label: 'Employee Name', sortable: true, width: '175px' },
      { key: 'dept', label: 'Department', sortable: true, width: '165px' },
      { key: 'door', label: 'Door', sortable: true, width: '195px' },
      { key: 'location', label: 'Location', sortable: true, width: '185px' },
      { key: 'credential', label: 'Credential', sortable: true, width: '155px' },
      { key: 'access_level', label: 'Access Level', sortable: true, width: '195px' },
      { key: 'device', label: 'Device', sortable: true, width: '160px' }
    ],
    data: [
      {
        id: 'AG-1001',
        date: '2026-09-18',
        time: '09:02:14',
        emp_id: 'PBL-04120',
        emp_name: 'Tanvir Ahmed Chowdhury',
        dept: 'Treasury & Cash Ops',
        door: 'Main Cash Vault Dual Interlock',
        location: 'Head Office (Motijheel, Floor B1)',
        credential: 'Face + Fingerprint',
        access_level: 'Level 5 - Vault Custodian',
        device: 'BioStation 3 (BS3-APW)'
      },
      {
        id: 'AG-1002',
        date: '2026-09-18',
        time: '09:04:32',
        emp_id: 'PBL-08914',
        emp_name: 'Farzana Yesmin',
        dept: 'Foreign Exchange & SWIFT',
        door: 'SWIFT Transmission Core Room',
        location: 'Head Office (Motijheel, Floor 3)',
        credential: 'Smart Card + Fingerprint',
        access_level: 'Level 4 - SWIFT Operator',
        device: 'BioStation 2a (BS2A-OEP)'
      },
      {
        id: 'AG-1003',
        date: '2026-09-18',
        time: '09:05:48',
        emp_id: 'PBL-01129',
        emp_name: 'Mahbubur Rahman',
        dept: 'Branch Banking & Retail',
        door: 'Branch Perimeter Glass Door',
        location: 'Principal Branch (Motijheel)',
        credential: 'Mobile NFC Pass',
        access_level: 'Level 2 - Branch Staff',
        device: 'X-Station 2 (XS2-QAPB)'
      },
      {
        id: 'AG-1004',
        date: '2026-09-18',
        time: '09:08:11',
        emp_id: 'PBL-06540',
        emp_name: 'Kazi Nazmul Hossain',
        dept: 'IT Infrastructure & DC',
        door: 'Tier-IV Server Room Air-Lock',
        location: 'Head Office (Motijheel, Floor 4)',
        credential: 'FaceStation AI + PIN',
        access_level: 'Level 5 - SysAdmin DC',
        device: 'FaceStation F2 (FSF2-AB)'
      },
      {
        id: 'AG-1005',
        date: '2026-09-18',
        time: '09:11:05',
        emp_id: 'PBL-07821',
        emp_name: 'Shahriar Kabir',
        dept: 'General Banking & Cash',
        door: 'Cash Counter Mantrap Portal',
        location: 'Gulshan Corporate Branch (Dhaka)',
        credential: 'Fingerprint 1:N',
        access_level: 'Level 3 - Cashier General',
        device: 'BioEntry W2 (BEW2-OHP)'
      },
      {
        id: 'AG-1006',
        date: '2026-09-18',
        time: '09:14:22',
        emp_id: 'PBL-03290',
        emp_name: 'Nusrat Jahan Shimu',
        dept: 'Internal Audit & Compliance',
        door: 'Executive Floor Security Portal',
        location: 'Head Office (Motijheel, Floor 18)',
        credential: 'Smart Card (Desfire EV3)',
        access_level: 'Level 4 - Internal Auditor',
        device: 'BioLite N2 (BLN2-PAB)'
      },
      {
        id: 'AG-1007',
        date: '2026-09-18',
        time: '09:17:50',
        emp_id: 'PBL-09012',
        emp_name: 'Ariful Haque',
        dept: 'Security Operations Center',
        door: 'SOC Central Command Portal',
        location: 'Head Office (Motijheel, Floor 5)',
        credential: 'Face + Mobile Credential',
        access_level: 'Level 5 - SOC Controller',
        device: 'BioStation 3 (BS3-APW)'
      },
      {
        id: 'AG-1008',
        date: '2026-09-18',
        time: '09:21:40',
        emp_id: 'PBL-04419',
        emp_name: 'Syed Rafiqul Alam',
        dept: 'Branch Banking & Retail',
        door: 'Cash Vault Strong Room Door',
        location: 'Agrabad Commercial Area Br (Chattogram)',
        credential: 'Dual Biometric (Officer 1)',
        access_level: 'Level 5 - Vault Custodian',
        device: 'BioStation 3 (BS3-APW)'
      },
      {
        id: 'AG-1009',
        date: '2026-09-18',
        time: '09:23:15',
        emp_id: 'PBL-05518',
        emp_name: 'Salma Khatun',
        dept: 'Operations & Clearing',
        door: 'Main Entrance Turnstile #2',
        location: 'Dhanmondi Branch (Dhaka South)',
        credential: 'Fingerprint 1:N',
        access_level: 'Level 2 - Branch Staff',
        device: 'BioLite N2 (BLN2-PAB)'
      },
      {
        id: 'AG-1010',
        date: '2026-09-18',
        time: '09:26:02',
        emp_id: 'PBL-02381',
        emp_name: 'Mohammad Golam Kibria',
        dept: 'Corporate & Credit Division',
        door: 'Corporate Banking Suite',
        location: 'Uttara Branch (Dhaka North)',
        credential: 'Smart Card + PIN',
        access_level: 'Level 3 - Credit Officer',
        device: 'X-Station 2 (XS2-QAPB)'
      },
      {
        id: 'AG-1011',
        date: '2026-09-18',
        time: '09:28:44',
        emp_id: 'PBL-07612',
        emp_name: 'Rashedul Karim',
        dept: 'Security Operations Center',
        door: 'CCTV Monitoring Vault Ante-Room',
        location: 'Head Office (Motijheel, Floor B2)',
        credential: 'Face + Fingerprint',
        access_level: 'Level 5 - SOC Security Lead',
        device: 'BioStation 3 (BS3-APW)'
      },
      {
        id: 'AG-1012',
        date: '2026-09-18',
        time: '09:31:19',
        emp_id: 'PBL-06103',
        emp_name: 'Sabrina Parvin',
        dept: 'Human Resources Division',
        door: 'HR Confidential Archive',
        location: 'Head Office (Motijheel, Floor 8)',
        credential: 'Smart Card (Desfire EV3)',
        access_level: 'Level 3 - HR Officer',
        device: 'BioEntry P2 (BEP2-OA)'
      }
    ]
  },

  // ─── 2. ACCESS DENIED REPORT ─────────────────────────────────────────────────
  'access-denied': {
    id: 'access-denied',
    categoryId: 'access-auth',
    title: 'Access Denied Report',
    subtitle: 'Rejected access attempts, unassigned security levels, expired credentials and unauthorized time-windows',
    kpi: {
      label: 'Access Denials',
      value: '43',
      trend: '-12% vs last week',
      status: 'Monitored',
      color: '#ef4444'
    },
    columns: [
      { key: 'date', label: 'Date', sortable: true, width: '105px' },
      { key: 'time', label: 'Time', sortable: true, width: '90px' },
      { key: 'emp_name', label: 'Employee Name', sortable: true, width: '160px' },
      { key: 'door', label: 'Door', sortable: true, width: '180px' },
      { key: 'location', label: 'Location', sortable: true, width: '160px' },
      { key: 'credential', label: 'Credential', sortable: true, width: '120px' },
      { key: 'denial_reason', label: 'Denial Reason', sortable: true, width: '190px' },
      { key: 'attempt_count', label: 'Attempt Count', sortable: true, width: '110px' },
      { key: 'device', label: 'Device', sortable: true, width: '130px' },
      { key: 'action', label: 'Action', sortable: true, width: '140px' }
    ],
    data: [
      {
        id: 'AD-2001',
        date: '2026-09-18',
        time: '08:42:19',
        emp_name: 'Zahangir Alam (Contractor)',
        door: 'Cash Vault Strong Room Door',
        location: 'Principal Branch (Motijheel)',
        credential: 'Card ID: #882910',
        denial_reason: 'Unauthorized Access Level (Level 1 Staff)',
        attempt_count: 3,
        device: 'BioStation 3 (BS3-APW)',
        action: 'Relay Locked & SOC Notified'
      },
      {
        id: 'AD-2002',
        date: '2026-09-18',
        time: '08:50:04',
        emp_name: 'Unknown Visitor',
        door: 'SWIFT Communication Terminal',
        location: 'Head Office (Motijheel, Floor 3)',
        credential: 'Unregistered RFID Badge',
        denial_reason: 'Unregistered Credential Token',
        attempt_count: 2,
        device: 'BioStation 2a (BS2A-OEP)',
        action: 'Security Guard Dispatched'
      },
      {
        id: 'AD-2003',
        date: '2026-09-18',
        time: '09:01:12',
        emp_name: 'Anisul Huq',
        door: 'Tier-IV Server Room Air-Lock',
        location: 'Head Office (Motijheel, Floor 4)',
        credential: 'Fingerprint 1:N',
        denial_reason: 'Time-Zone Restriction (Off-Schedule)',
        attempt_count: 1,
        device: 'FaceStation F2 (FSF2-AB)',
        action: 'Logged in Audit Trail'
      },
      {
        id: 'AD-2004',
        date: '2026-09-18',
        time: '09:12:45',
        emp_name: 'Shakil Mahmud',
        door: 'Cash Counter Mantrap Door #2',
        location: 'Mirpur Branch (Dhaka North)',
        credential: 'PIN Code: ****',
        denial_reason: 'Invalid Secondary PIN (3 Failures)',
        attempt_count: 3,
        device: 'BioLite N2 (BLN2-PAB)',
        action: 'Terminal Locked for 60s'
      },
      {
        id: 'AD-2005',
        date: '2026-09-18',
        time: '09:22:30',
        emp_name: 'Kamrul Hasan Rony',
        door: 'Executive Floor Security Portal',
        location: 'Head Office (Motijheel, Floor 18)',
        credential: 'Smart Card: #449102',
        denial_reason: 'Card Blacklisted / Expired',
        attempt_count: 1,
        device: 'BioStation 3 (BS3-APW)',
        action: 'Badge Confiscation Flag'
      },
      {
        id: 'AD-2006',
        date: '2026-09-18',
        time: '09:35:10',
        emp_name: 'Mehedi Hasan',
        door: 'Foreign Remittance Chamber',
        location: 'Sylhet Main Branch (Sylhet East)',
        credential: 'Mobile NFC Pass',
        denial_reason: 'Dual-Custody Partner Missing',
        attempt_count: 2,
        device: 'X-Station 2 (XS2-QAPB)',
        action: 'Awaiting 2nd Custodian'
      },
      {
        id: 'AD-2007',
        date: '2026-09-18',
        time: '09:44:55',
        emp_name: 'Biplob Chandra Roy',
        door: 'ATM Replenishment Safe Portal',
        location: 'Agrabad Branch (Chattogram)',
        credential: 'Fingerprint Scan',
        denial_reason: 'Biometric Template Mismatch (FAR<0.001%)',
        attempt_count: 2,
        device: 'BioStation 3 (BS3-APW)',
        action: 'Fallback to Supervisor Pass'
      }
    ]
  },

  // ─── 3. UNAUTHORIZED ACCESS REPORT ───────────────────────────────────────────
  'unauthorized-access': {
    id: 'unauthorized-access',
    categoryId: 'access-auth',
    title: 'Unauthorized Access Report',
    subtitle: 'Escalated security breaches, repetitive unauthorized attempts and trigger alerts',
    kpi: {
      label: 'Unauthorized Incidents',
      value: '9',
      trend: '3 High Priority',
      status: 'Warning',
      color: '#f59e0b'
    },
    columns: [
      { key: 'location', label: 'Location', sortable: true, width: '190px' },
      { key: 'attempt_time', label: 'Attempt Time', sortable: true, width: '140px' },
      { key: 'prev_attempts', label: 'Previous Attempt Count', sortable: true, width: '170px' },
      { key: 'security_alert_status', label: 'Security Alert Status', sortable: true, width: '180px' },
      { key: 'action_taken', label: 'Action Taken', sortable: true, width: '220px' }
    ],
    data: [
      {
        id: 'UA-3001',
        location: 'Head Office B1 Cash Vault Interlock',
        attempt_time: '2026-09-18 03:14:22',
        prev_attempts: '4 Repetitive Strikes',
        security_alert_status: 'CRITICAL ESCALATION',
        action_taken: 'Vault auto-hardened; armed security duty officer alerted via push SMS'
      },
      {
        id: 'UA-3002',
        location: 'Motijheel Principal Branch Safe Room',
        attempt_time: '2026-09-18 06:40:15',
        prev_attempts: '3 Consecutive Cards',
        security_alert_status: 'HIGH ALERT',
        action_taken: 'CCTV PTZ camera triggered preset 04; guard inspected vestibule'
      },
      {
        id: 'UA-3003',
        location: 'Head Office Floor 4 Data Center DC-01',
        attempt_time: '2026-09-18 07:12:50',
        prev_attempts: '2 False Face Biometrics',
        security_alert_status: 'MODERATE ALERT',
        action_taken: 'Terminal snapshot uploaded to SOC; maintenance contractor questioned'
      },
      {
        id: 'UA-3004',
        location: 'Gulshan Branch ATM Cash Loading Bay',
        attempt_time: '2026-09-18 08:15:30',
        prev_attempts: '5 Failed PINs',
        security_alert_status: 'HIGH ALERT',
        action_taken: 'Terminal keypad disabled for 5 minutes; branch manager notified'
      },
      {
        id: 'UA-3005',
        location: 'Agrabad Branch Strong Room Rear Door',
        attempt_time: '2026-09-18 08:35:10',
        prev_attempts: '2 Non-Staff Badges',
        security_alert_status: 'MODERATE ALERT',
        action_taken: 'Security guard verified delivery crew credentials and escorted out'
      },
      {
        id: 'UA-3006',
        location: 'Khulna Regional Office Server Node',
        attempt_time: '2026-09-18 09:10:04',
        prev_attempts: '3 Unknown RF Cards',
        security_alert_status: 'CRITICAL ESCALATION',
        action_taken: 'Remote relay lockout commanded via Central SOC; incident report IR-0912 filed'
      }
    ]
  },

  // ─── 4. AUTHENTICATION METHOD REPORT ─────────────────────────────────────────
  'auth-method': {
    id: 'auth-method',
    categoryId: 'access-auth',
    title: 'Authentication Method Report',
    subtitle: 'Modalities breakdown (Fingerprint, Face, Smart Card, PIN, Mobile Pass) & transaction volume',
    kpi: {
      label: 'Multi-Modal Auth Today',
      value: '22,810',
      trend: '68% Biometric, 32% Token',
      status: 'Normal',
      color: '#06b6d4'
    },
    columns: [
      { key: 'date', label: 'Date', sortable: true, width: '105px' },
      { key: 'emp_name', label: 'Employee Name', sortable: true, width: '170px' },
      { key: 'dept', label: 'Department', sortable: true, width: '150px' },
      { key: 'door', label: 'Door', sortable: true, width: '180px' },
      { key: 'auth_methods', label: 'Auth Methods', sortable: false, width: '220px' },
      { key: 'total_transactions', label: 'Total Transactions', sortable: true, width: '150px' }
    ],
    data: [
      {
        id: 'AM-4001',
        date: '2026-09-18',
        emp_name: 'Syed M. Shamimul Islam',
        dept: 'Treasury Operations',
        door: 'HO Central Cash Vault Main Door',
        auth_methods: { fp: true, face: true, card: true, pin: false, mobile: false },
        total_transactions: 14
      },
      {
        id: 'AM-4002',
        date: '2026-09-18',
        emp_name: 'Mohammad Faruk Hossain',
        dept: 'IT Infrastructure & DC',
        door: 'Primary Data Center Air-Lock',
        auth_methods: { fp: true, face: true, card: false, pin: true, mobile: false },
        total_transactions: 22
      },
      {
        id: 'AM-4003',
        date: '2026-09-18',
        emp_name: 'Rokeya Begum',
        dept: 'SWIFT & Foreign Remittance',
        door: 'SWIFT Server Room Security Door',
        auth_methods: { fp: true, face: false, card: true, pin: false, mobile: false },
        total_transactions: 9
      },
      {
        id: 'AM-4004',
        date: '2026-09-18',
        emp_name: 'Asaduzzaman Nur',
        dept: 'General Banking & Cash',
        door: 'Gulshan Branch Teller Portal',
        auth_methods: { fp: true, face: false, card: false, pin: false, mobile: true },
        total_transactions: 18
      },
      {
        id: 'AM-4005',
        date: '2026-09-18',
        emp_name: 'Mustafizur Rahman',
        dept: 'Security Operations Center',
        door: 'SOC Main Entrance Turnstile',
        auth_methods: { fp: false, face: true, card: true, pin: true, mobile: true },
        total_transactions: 26
      },
      {
        id: 'AM-4006',
        date: '2026-09-18',
        emp_name: 'Fariha Tasnim',
        dept: 'Customer Services & Ops',
        door: 'Principal Branch Staff Entry',
        auth_methods: { fp: true, face: false, card: true, pin: false, mobile: false },
        total_transactions: 8
      },
      {
        id: 'AM-4007',
        date: '2026-09-18',
        emp_name: 'Tareq Mohammad Jubayer',
        dept: 'Internal Audit & Inspection',
        door: 'Audit Document Vault',
        auth_methods: { fp: true, face: true, card: true, pin: false, mobile: false },
        total_transactions: 12
      }
    ]
  },

  // ─── 5. ANTI-PASSBACK VIOLATION REPORT ───────────────────────────────────────
  'anti-passback': {
    id: 'anti-passback',
    categoryId: 'security-incident',
    title: 'Anti-Passback (APB) Violation Report',
    subtitle: 'Enforcement of unidirectional ingress/egress sequence across secure branch perimeters',
    kpi: {
      label: 'APB Violations',
      value: '14',
      trend: '4 Hard APB / 10 Soft APB',
      status: 'Warning',
      color: '#f59e0b'
    },
    columns: [
      { key: 'date', label: 'Date', sortable: true, width: '105px' },
      { key: 'time', label: 'Time', sortable: true, width: '90px' },
      { key: 'emp_id', label: 'Employee ID', sortable: true, width: '115px' },
      { key: 'emp_name', label: 'Employee Name', sortable: true, width: '160px' },
      { key: 'entry_door', label: 'Entry Door', sortable: true, width: '170px' },
      { key: 'exit_door', label: 'Exit Door', sortable: true, width: '170px' },
      { key: 'current_attempt', label: 'Current Attempt', sortable: true, width: '140px' },
      { key: 'violation_type', label: 'Violation Type', sortable: true, width: '130px' },
      { key: 'action_status', label: 'Action Report / Status', sortable: true, width: '170px' }
    ],
    data: [
      {
        id: 'APB-5001',
        date: '2026-09-18',
        time: '08:58:32',
        emp_id: 'PBL-04192',
        emp_name: 'Ashraful Alam',
        entry_door: 'HO Atrium Turnstile #3 (In)',
        exit_door: 'None (Missing Out Punch)',
        current_attempt: 'Re-entry Ingress #3',
        violation_type: 'Hard APB',
        action_status: 'Relay Blocked & Flagged'
      },
      {
        id: 'APB-5002',
        date: '2026-09-18',
        time: '09:15:10',
        emp_id: 'PBL-08123',
        emp_name: 'Md. Saifuddin',
        entry_door: 'Principal Branch Main Gate',
        exit_door: 'None (Card Hand-back)',
        current_attempt: 'Main Gate Ingress',
        violation_type: 'Hard APB',
        action_status: 'Turnstile Barred; Guard ACK'
      },
      {
        id: 'APB-5003',
        date: '2026-09-18',
        time: '09:24:41',
        emp_id: 'PBL-03914',
        emp_name: 'Sabina Yasmin',
        entry_door: 'HO Floor 4 IT Door',
        exit_door: 'HO Floor 4 Fire Exit',
        current_attempt: 'IT Door Entry',
        violation_type: 'Soft APB',
        action_status: 'Granted with Warning Notice'
      },
      {
        id: 'APB-5004',
        date: '2026-09-18',
        time: '09:41:09',
        emp_id: 'PBL-05231',
        emp_name: 'Khandaker Tanvir',
        entry_door: 'Gulshan Branch Vestibule',
        exit_door: 'Side Exit Door',
        current_attempt: 'Vestibule Re-entry',
        violation_type: 'Soft APB',
        action_status: 'Logged & Audit Alert'
      },
      {
        id: 'APB-5005',
        date: '2026-09-18',
        time: '10:02:14',
        emp_id: 'PBL-09418',
        emp_name: 'Moinul Islam Bhuiyan',
        entry_door: 'Sylhet Branch Main Barrier',
        exit_door: 'None (Piggyback suspected)',
        current_attempt: 'Barrier Ingress',
        violation_type: 'Hard APB',
        action_status: 'Supervisor Override Required'
      }
    ]
  },

  // ─── 6. MULTI-PERSON DETECTION REPORT ────────────────────────────────────────
  'multi-person': {
    id: 'multi-person',
    categoryId: 'security-incident',
    title: 'Multi-Person Detection Report',
    subtitle: 'Overhead optical sensor & AI CCTV alerts detecting piggybacking in airlocks & mantraps',
    kpi: {
      label: 'Multi-Person Alerts',
      value: '7',
      trend: '5 Intercepted in Airlock',
      status: 'Critical',
      color: '#dc2626'
    },
    columns: [
      { key: 'date', label: 'Date', sortable: true, width: '105px' },
      { key: 'time', label: 'Time', sortable: true, width: '90px' },
      { key: 'door', label: 'Door', sortable: true, width: '170px' },
      { key: 'location', label: 'Location', sortable: true, width: '160px' },
      { key: 'authorized_person', label: 'Authorized Person', sortable: true, width: '160px' },
      { key: 'persons_detected', label: 'Persons Detected', sortable: true, width: '130px' },
      { key: 'reader_event', label: 'Reader Event', sortable: true, width: '140px' },
      { key: 'camera_event', label: 'Camera Event', sortable: true, width: '150px' },
      { key: 'event_type', label: 'Event Type', sortable: true, width: '150px' },
      { key: 'evidence', label: 'Evidence', sortable: false, width: '110px' },
      { key: 'action_taken', label: 'Action Taken', sortable: true, width: '180px' }
    ],
    data: [
      {
        id: 'MP-6001',
        date: '2026-09-18',
        time: '08:44:11',
        door: 'Cash Vault Mantrap Interlock',
        location: 'HO Central Cash Vault B1',
        authorized_person: 'Tanvir Ahmed Chowdhury (PBL-04120)',
        persons_detected: 2,
        reader_event: 'Single Card Badge (#99214)',
        camera_event: 'CAM-HO-B1-02: 2 Human Heads',
        event_type: 'Mantrap Dual Occupancy Violation',
        evidenceSnapshot: {
          camName: 'CAM-HO-B1-02 (Vault Vestibule)',
          snapshotUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80',
          detectedPersons: 2,
          notes: 'Unbadged individual entered mantrap behind vault custodian.'
        },
        action_taken: 'Interlock inner door sealed; strobe beacon actuated'
      },
      {
        id: 'MP-6002',
        date: '2026-09-18',
        time: '09:05:28',
        door: 'Tier-IV Server Room Air-Lock',
        location: 'HO Floor 4 Data Center',
        authorized_person: 'Kazi Nazmul Hossain (PBL-06540)',
        persons_detected: 2,
        reader_event: 'Single Face Verified',
        camera_event: 'CAM-DC-04: AI Bounding Box 2',
        event_type: 'Airlock Tailgating Ingress',
        evidenceSnapshot: {
          camName: 'CAM-DC-04 (DC Ingress Airlock)',
          snapshotUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
          detectedPersons: 2,
          notes: 'Contractor accompanied technician without presenting badge.'
        },
        action_taken: 'Exit voice warning; escort required'
      },
      {
        id: 'MP-6003',
        date: '2026-09-18',
        time: '09:32:02',
        door: 'Teller Safe Cash Chamber',
        location: 'Principal Branch (Motijheel)',
        authorized_person: 'Nurul Amin (PBL-01124)',
        persons_detected: 2,
        reader_event: 'Single Fingerprint Punch',
        camera_event: 'CAM-PB-07: Dual Occupancy',
        event_type: 'Restricted Chamber Piggybacking',
        evidenceSnapshot: {
          camName: 'CAM-PB-07 (Motijheel Teller Safe)',
          snapshotUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
          detectedPersons: 2,
          notes: 'Second officer entered before door pneumatic closure.'
        },
        action_taken: 'Supervisor verified second officer'
      },
      {
        id: 'MP-6004',
        date: '2026-09-18',
        time: '10:14:45',
        door: 'SWIFT Terminal Security Booth',
        location: 'Head Office Floor 3',
        authorized_person: 'Farzana Yesmin (PBL-08914)',
        persons_detected: 2,
        reader_event: 'Single Card + Bio',
        camera_event: 'CAM-SW-01: Tailgating Flag',
        event_type: 'SWIFT High-Security Breach',
        evidenceSnapshot: {
          camName: 'CAM-SW-01 (SWIFT Secure Zone)',
          snapshotUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600&auto=format&fit=crop&q=80',
          detectedPersons: 2,
          notes: 'Cleaning staff entered behind authorized operator.'
        },
        action_taken: 'Cleaning staff ejected; SWIFT terminal locked'
      }
    ]
  },

  // ─── 7. TAILGATING & SECURITY INCIDENT REPORT ────────────────────────────────
  'tailgating-incident': {
    id: 'tailgating-incident',
    categoryId: 'security-incident',
    title: 'Tailgating & Security Incident Report',
    subtitle: 'Detailed forensic audit of piggybacking breaches with linked AI optical camera telemetry',
    kpi: {
      label: 'Confirmed Tailgates',
      value: '5',
      trend: '100% Intercepted',
      status: 'Secured',
      color: '#ef4444'
    },
    columns: [
      { key: 'event_id', label: 'Event ID', sortable: true, width: '110px' },
      { key: 'date', label: 'Date', sortable: true, width: '105px' },
      { key: 'time', label: 'Time', sortable: true, width: '90px' },
      { key: 'door', label: 'Door', sortable: true, width: '170px' },
      { key: 'location', label: 'Location', sortable: true, width: '160px' },
      { key: 'authorized_person', label: 'Authorized Person', sortable: true, width: '160px' },
      { key: 'person_detected', label: 'Person Detected', sortable: true, width: '140px' },
      { key: 'camera', label: 'Camera', sortable: true, width: '130px' },
      { key: 'access_result', label: 'Access Result', sortable: true, width: '130px' },
      { key: 'tailgating_flag', label: 'Tailgating Flag', sortable: true, width: '140px' },
      { key: 'alarm_status', label: 'Alarm Status', sortable: true, width: '130px' },
      { key: 'action_taken', label: 'Action Taken', sortable: true, width: '170px' }
    ],
    data: [
      {
        id: 'TG-7001',
        event_id: 'EVT-TG-901',
        date: '2026-09-18',
        time: '08:30:14',
        door: 'HO Grand Lobby Optical Turnstile #1',
        location: 'Head Office (Motijheel)',
        authorized_person: 'Rafiqul Islam (PBL-02102)',
        person_detected: '2 Persons (1 Unbadged)',
        camera: 'CAM-LOBBY-01',
        access_result: 'Access Granted',
        tailgating_flag: 'POSITIVE BREACH',
        alarm_status: 'Audible Beep',
        action_taken: 'Turnstile barrier closed rapidly; guard halted visitor'
      },
      {
        id: 'TG-7002',
        event_id: 'EVT-TG-902',
        date: '2026-09-18',
        time: '09:02:49',
        door: 'Gulshan Branch Staff Portal',
        location: 'Gulshan Corporate Branch',
        authorized_person: 'Shahriar Kabir (PBL-07821)',
        person_detected: '2 Persons in Frame',
        camera: 'CAM-GLS-03',
        access_result: 'Access Granted',
        tailgating_flag: 'POSITIVE BREACH',
        alarm_status: 'SOC Alert',
        action_taken: 'Branch security escort checked visitor credentials'
      },
      {
        id: 'TG-7003',
        event_id: 'EVT-TG-903',
        date: '2026-09-18',
        time: '09:21:18',
        door: 'Cash Vault Ante-Chamber',
        location: 'Agrabad Branch (Chattogram)',
        authorized_person: 'Syed Rafiqul Alam (PBL-04419)',
        person_detected: '2 Persons (1 Behind)',
        camera: 'CAM-AGR-08',
        access_result: 'Interlock Denied',
        tailgating_flag: 'CRITICAL ALERT',
        alarm_status: 'Silent Alarm Triggered',
        action_taken: 'Inner vault magnetic lock kept energized; SOC verified'
      },
      {
        id: 'TG-7004',
        event_id: 'EVT-TG-904',
        date: '2026-09-18',
        time: '09:50:33',
        door: 'Tier-IV Server Ingress',
        location: 'HO Floor 4 Data Center',
        authorized_person: 'Mohammad Faruk (PBL-06511)',
        person_detected: '2 Persons Detected',
        camera: 'CAM-DC-02',
        access_result: 'Access Granted',
        tailgating_flag: 'POSITIVE BREACH',
        alarm_status: 'Warning Tone',
        action_taken: 'Trainee engineer badged in retroactively'
      }
    ]
  },

  // ─── 8. DOOR TAMPER REPORT ───────────────────────────────────────────────────
  'door-tamper': {
    id: 'door-tamper',
    categoryId: 'security-incident',
    title: 'Door Tamper Report',
    subtitle: 'Physical reader casing detachment, sensor short-circuit and optical tamper alarms',
    kpi: {
      label: 'Tamper Alerts',
      value: '3',
      trend: 'All 3 Restored & Normal',
      status: 'Secured',
      color: '#10b981'
    },
    columns: [
      { key: 'date', label: 'Date', sortable: true, width: '105px' },
      { key: 'time', label: 'Time', sortable: true, width: '90px' },
      { key: 'device', label: 'Device', sortable: true, width: '140px' },
      { key: 'door', label: 'Door', sortable: true, width: '170px' },
      { key: 'location', label: 'Location', sortable: true, width: '160px' },
      { key: 'tamper_type', label: 'Tamper Type', sortable: true, width: '160px' },
      { key: 'status', label: 'Status', sortable: true, width: '120px' },
      { key: 'duration', label: 'Duration', sortable: true, width: '100px' },
      { key: 'recovery_time', label: 'Recovery Time', sortable: true, width: '130px' },
      { key: 'ack_by', label: 'Acknowledged By', sortable: true, width: '160px' },
      { key: 'action_taken', label: 'Action Taken', sortable: true, width: '180px' }
    ],
    data: [
      {
        id: 'DT-8001',
        date: '2026-09-18',
        time: '04:18:22',
        device: 'BioEntry W2 (BEW2-OHP)',
        door: 'Rear Cash Delivery Gate',
        location: 'Dhanmondi Branch (Dhaka South)',
        tamper_type: 'Optical Sensor Enclosure Open',
        status: 'Recovered & Normal',
        duration: '4m 12s',
        recovery_time: '04:22:34',
        ack_by: 'SOC Operator Tariq (ID: 042)',
        action_taken: 'Guard re-seated bracket; tamper switch cleared'
      },
      {
        id: 'DT-8002',
        date: '2026-09-18',
        time: '06:05:10',
        device: 'BioLite N2 (BLN2-PAB)',
        door: 'ATM Night Deposit Vault Door',
        location: 'Uttara Branch (Dhaka North)',
        tamper_type: 'Vibration & Impact Sensor Actuation',
        status: 'Recovered & Normal',
        duration: '2m 45s',
        recovery_time: '06:07:55',
        ack_by: 'SOC Lead Kabir (ID: 018)',
        action_taken: 'Cash replenishment team verified; false bump alarm'
      },
      {
        id: 'DT-8003',
        date: '2026-09-18',
        time: '07:44:50',
        device: 'BioStation 3 (BS3-APW)',
        door: 'Cash Chamber Entrance Door',
        location: 'Sylhet Main Branch (Sylhet East)',
        tamper_type: 'RS-485 OSDP Line Loop Tamper',
        status: 'Recovered & Normal',
        duration: '8m 30s',
        recovery_time: '07:53:20',
        ack_by: 'IT Branch Engineer Al-Amin',
        action_taken: 'Terminal terminal wiring tightened; encrypted comms restored'
      }
    ]
  },

  // ─── 9. DOOR FORCED / SECURITY INCIDENT REPORT ───────────────────────────────
  'door-forced': {
    id: 'door-forced',
    categoryId: 'security-incident',
    title: 'Door Forced Open / Security Incident Report',
    subtitle: 'Magnetic lock / contact sensor separation without valid authorized grant trigger',
    kpi: {
      label: 'Forced Door Alerts',
      value: '2',
      trend: '0 Breaches Confirmed',
      status: 'Critical',
      color: '#dc2626'
    },
    columns: [
      { key: 'event_id', label: 'Event ID', sortable: true, width: '110px' },
      { key: 'date', label: 'Date', sortable: true, width: '105px' },
      { key: 'time', label: 'Time', sortable: true, width: '90px' },
      { key: 'door', label: 'Door', sortable: true, width: '170px' },
      { key: 'location', label: 'Location', sortable: true, width: '160px' },
      { key: 'device', label: 'Device', sortable: true, width: '130px' },
      { key: 'door_sensor', label: 'Door Sensor', sortable: true, width: '140px' },
      { key: 'forced_open_time', label: 'Forced Open Time', sortable: true, width: '140px' },
      { key: 'duration', label: 'Duration', sortable: true, width: '100px' },
      { key: 'alarm_status', label: 'Alarm Status', sortable: true, width: '130px' },
      { key: 'action_taken', label: 'Action Taken', sortable: true, width: '180px' }
    ],
    data: [
      {
        id: 'DF-9001',
        event_id: 'EVT-DF-101',
        date: '2026-09-18',
        time: '05:12:08',
        door: 'Emergency Fire Exit Door',
        location: 'Motijheel Principal Branch',
        device: 'CoreStation CS-40 (Relay 4)',
        door_sensor: 'Heavy Magnetic Reed #F4',
        forced_open_time: '05:12:08',
        duration: '1m 20s',
        alarm_status: 'Audible Siren (Silenced)',
        action_taken: 'Building night watchman inspected; door latch pushed back firmly'
      },
      {
        id: 'DF-9002',
        event_id: 'EVT-DF-102',
        date: '2026-09-18',
        time: '08:14:35',
        door: 'Cash Management Outer Gate',
        location: 'Gulshan Branch (Dhaka North)',
        device: 'BioEntry W2 (Relay 1)',
        door_sensor: 'Balanced Magnetic Contact',
        forced_open_time: '08:14:35',
        duration: '45s',
        alarm_status: 'Cleared & Restored',
        action_taken: 'Delivery staff pushed gate before relay release; mechanical latch inspected'
      }
    ]
  },

  // ─── 10. DOOR HELD OPEN REPORT ───────────────────────────────────────────────
  'door-held-open': {
    id: 'door-held-open',
    categoryId: 'door-facility',
    title: 'Door Held Open Report',
    subtitle: 'Door contact open state exceeding preconfigured safety threshold seconds',
    kpi: {
      label: 'Held Open Incidents',
      value: '18',
      trend: 'Avg 42s over threshold',
      status: 'Warning',
      color: '#f59e0b'
    },
    columns: [
      { key: 'door', label: 'Door', sortable: true, width: '180px' },
      { key: 'location', label: 'Location', sortable: true, width: '160px' },
      { key: 'open_time', label: 'Open Time', sortable: true, width: '100px' },
      { key: 'close_time', label: 'Close Time', sortable: true, width: '100px' },
      { key: 'duration', label: 'Duration', sortable: true, width: '100px' },
      { key: 'threshold', label: 'Threshold', sortable: true, width: '100px' },
      { key: 'access_time', label: 'Access Time', sortable: true, width: '100px' },
      { key: 'alarm_time', label: 'Alarm Time', sortable: true, width: '100px' },
      { key: 'ack_by', label: 'Acknowledged By', sortable: true, width: '160px' },
      { key: 'action', label: 'Action', sortable: true, width: '160px' }
    ],
    data: [
      {
        id: 'DHO-10001',
        door: 'Main Cash Vault Anteroom Door',
        location: 'Head Office (Motijheel, B1)',
        open_time: '09:02:14',
        close_time: '09:03:22',
        duration: '68 sec',
        threshold: '30 sec',
        access_time: '09:02:14',
        alarm_time: '09:02:44',
        ack_by: 'SOC Lead Tariq (ID: 042)',
        action: 'Cash cart trolley movement confirmed; auto-cleared'
      },
      {
        id: 'DHO-10002',
        door: 'Branch Staff Side Entrance',
        location: 'Dhanmondi Branch (Dhaka South)',
        open_time: '09:10:45',
        close_time: '09:12:15',
        duration: '90 sec',
        threshold: '45 sec',
        access_time: '09:10:45',
        alarm_time: '09:11:30',
        ack_by: 'Branch Guard Jamal',
        action: 'Stationery delivery box holding door; box cleared'
      },
      {
        id: 'DHO-10003',
        door: 'SWIFT Server Room Security Door',
        location: 'Head Office (Motijheel, Floor 3)',
        open_time: '09:25:10',
        close_time: '09:26:05',
        duration: '55 sec',
        threshold: '25 sec',
        access_time: '09:25:10',
        alarm_time: '09:25:35',
        ack_by: 'SWIFT Officer Farzana',
        action: 'Door pneumatic closer adjusted; latch secured'
      },
      {
        id: 'DHO-10004',
        door: 'Cash Counter Mantrap Inner Door',
        location: 'Gulshan Corporate Branch',
        open_time: '09:38:00',
        close_time: '09:39:10',
        duration: '70 sec',
        threshold: '30 sec',
        access_time: '09:38:00',
        alarm_time: '09:38:30',
        ack_by: 'Cash Officer Shahriar',
        action: 'Interlock safety warning sounded; door closed'
      },
      {
        id: 'DHO-10005',
        door: 'Tier-IV DC Emergency Exit Door',
        location: 'Head Office Floor 4',
        open_time: '09:51:20',
        close_time: '09:52:18',
        duration: '58 sec',
        threshold: '30 sec',
        access_time: '09:51:20',
        alarm_time: '09:51:50',
        ack_by: 'SOC Operator Shafiul',
        action: 'HVAC technician exited; door verified shut'
      },
      {
        id: 'DHO-10006',
        door: 'Principal Branch Vault Strong Room',
        location: 'Motijheel Principal Branch',
        open_time: '10:04:12',
        close_time: '10:05:40',
        duration: '88 sec',
        threshold: '40 sec',
        access_time: '10:04:12',
        alarm_time: '10:04:52',
        ack_by: 'Branch Manager M. Rahman',
        action: 'Daily bullion audit in progress; acknowledged by manager'
      }
    ]
  },

  // ─── 11. OCCUPANCY REPORT ────────────────────────────────────────────────────
  'occupancy-report': {
    id: 'occupancy-report',
    categoryId: 'door-facility',
    title: 'Occupancy Report',
    subtitle: 'Real-time head-count tracking (Entry - Exit) against maximum capacity limits and safety thresholds',
    kpi: {
      label: 'Monitored Critical Zones',
      value: '12 Areas',
      trend: '0 Overcrowded (Peak: 88%)',
      status: 'Normal',
      color: '#10b981'
    },
    columns: [
      { key: 'date', label: 'Date', sortable: true, width: '105px' },
      { key: 'time', label: 'Time', sortable: true, width: '90px' },
      { key: 'area_name', label: 'Area Name', sortable: true, width: '190px' },
      { key: 'entry_count', label: 'Entry Count', sortable: true, width: '110px' },
      { key: 'exit_count', label: 'Exit Count', sortable: true, width: '110px' },
      { key: 'current_occupancy', label: 'Current Occupancy', sortable: true, width: '140px' },
      { key: 'max_capacity', label: 'Maximum Capacity', sortable: true, width: '130px' },
      { key: 'utilization_rate', label: 'Utilization Rate', sortable: true, width: '160px' },
      { key: 'status', label: 'Status', sortable: true, width: '130px' }
    ],
    data: [
      {
        id: 'OCC-1101',
        date: '2026-09-18',
        time: '10:15:00',
        area_name: 'HO Central Cash Vault (B1)',
        entry_count: 8,
        exit_count: 5,
        current_occupancy: 3,
        max_capacity: 6,
        utilization_rate: 50,
        status: 'Normal'
      },
      {
        id: 'OCC-1102',
        date: '2026-09-18',
        time: '10:15:00',
        area_name: 'HO Primary Data Center DC-01',
        entry_count: 14,
        exit_count: 10,
        current_occupancy: 4,
        max_capacity: 10,
        utilization_rate: 40,
        status: 'Normal'
      },
      {
        id: 'OCC-1103',
        date: '2026-09-18',
        time: '10:15:00',
        area_name: 'HO Floor 3 SWIFT Core Chamber',
        entry_count: 6,
        exit_count: 2,
        current_occupancy: 4,
        max_capacity: 5,
        utilization_rate: 80,
        status: 'Near Capacity'
      },
      {
        id: 'OCC-1104',
        date: '2026-09-18',
        time: '10:15:00',
        area_name: 'Principal Branch Banking Hall',
        entry_count: 342,
        exit_count: 254,
        current_occupancy: 88,
        max_capacity: 100,
        utilization_rate: 88,
        status: 'Near Capacity'
      },
      {
        id: 'OCC-1105',
        date: '2026-09-18',
        time: '10:15:00',
        area_name: 'Gulshan Branch Teller Counter Bay',
        entry_count: 18,
        exit_count: 12,
        current_occupancy: 6,
        max_capacity: 12,
        utilization_rate: 50,
        status: 'Normal'
      },
      {
        id: 'OCC-1106',
        date: '2026-09-18',
        time: '10:15:00',
        area_name: 'Agrabad Cash Vault Strong Room',
        entry_count: 5,
        exit_count: 3,
        current_occupancy: 2,
        max_capacity: 4,
        utilization_rate: 50,
        status: 'Normal'
      },
      {
        id: 'OCC-1107',
        date: '2026-09-18',
        time: '10:15:00',
        area_name: 'HO Central SOC Operations Floor',
        entry_count: 22,
        exit_count: 10,
        current_occupancy: 12,
        max_capacity: 15,
        utilization_rate: 80,
        status: 'Near Capacity'
      },
      {
        id: 'OCC-1108',
        date: '2026-09-18',
        time: '10:15:00',
        area_name: 'HO Board of Directors Suite (Fl 18)',
        entry_count: 28,
        exit_count: 4,
        current_occupancy: 24,
        max_capacity: 35,
        utilization_rate: 68.5,
        status: 'Normal'
      }
    ]
  },

  // ─── 12. EMERGENCY DOOR LOCK & UNLOCK REPORT ─────────────────────────────────
  'emergency-lock-unlock': {
    id: 'emergency-lock-unlock',
    categoryId: 'door-facility',
    title: 'Emergency Door Lock & Unlock Report',
    subtitle: 'Fire alarm releases, lockdown overrides and centralized SOC emergency triggers',
    kpi: {
      label: 'Emergency Overrides',
      value: '4 Drills / Events',
      trend: 'Zero Unaccounted Actions',
      status: 'Audited',
      color: '#06b6d4'
    },
    columns: [
      { key: 'event_id', label: 'Event ID', sortable: true, width: '110px' },
      { key: 'date', label: 'Date', sortable: true, width: '105px' },
      { key: 'time', label: 'Time', sortable: true, width: '90px' },
      { key: 'door', label: 'Door', sortable: true, width: '180px' },
      { key: 'location', label: 'Location', sortable: true, width: '160px' },
      { key: 'prev_status', label: 'Previous Status', sortable: true, width: '130px' },
      { key: 'new_status', label: 'New Status', sortable: true, width: '130px' },
      { key: 'trigger_source', label: 'Trigger Source', sortable: true, width: '150px' },
      { key: 'user_initiator', label: 'User / Initiator', sortable: true, width: '160px' },
      { key: 'device', label: 'Device', sortable: true, width: '130px' },
      { key: 'emergency_type', label: 'Emergency Type', sortable: true, width: '160px' }
    ],
    data: [
      {
        id: 'EM-1201',
        event_id: 'EVT-EM-01',
        date: '2026-09-18',
        time: '07:00:00',
        door: 'All Head Office Fire Exit Doors (48 Doors)',
        location: 'Head Office (Motijheel)',
        prev_status: 'Locked Armed',
        new_status: 'Emergency Unlocked',
        trigger_source: 'Fire Alarm System (FAS)',
        user_initiator: 'Building Automation Panel (BACnet)',
        device: 'CoreStation CS-40 Global Interlock',
        emergency_type: 'Scheduled Fire Drill Test'
      },
      {
        id: 'EM-1202',
        event_id: 'EVT-EM-02',
        date: '2026-09-18',
        time: '07:15:00',
        door: 'All Head Office Fire Exit Doors (48 Doors)',
        location: 'Head Office (Motijheel)',
        prev_status: 'Emergency Unlocked',
        new_status: 'Locked Armed (Normal)',
        trigger_source: 'Central SOC Console',
        user_initiator: 'Chief Security Officer (CSO)',
        device: 'BioStar X Central Server',
        emergency_type: 'Drill Conclusion Reset'
      },
      {
        id: 'EM-1203',
        event_id: 'EVT-EM-03',
        date: '2026-09-18',
        time: '08:45:20',
        door: 'Motijheel Principal Branch Front Glass Barrier',
        location: 'Principal Branch',
        prev_status: 'Locked Armed',
        new_status: 'Manual Override Unlock',
        trigger_source: 'Manual Break-Glass Switch',
        user_initiator: 'Branch Operations Manager',
        device: 'Break Glass BG-01',
        emergency_type: 'Morning Cash Escort Rapid Ingress'
      },
      {
        id: 'EM-1204',
        event_id: 'EVT-EM-04',
        date: '2026-09-18',
        time: '08:47:00',
        door: 'Motijheel Principal Branch Front Glass Barrier',
        location: 'Principal Branch',
        prev_status: 'Manual Override Unlock',
        new_status: 'Locked Armed (Normal)',
        trigger_source: 'Key Switch Reset',
        user_initiator: 'Branch Operations Manager',
        device: 'Key Switch KS-01',
        emergency_type: 'Post-Escort Re-Arming'
      },
      {
        id: 'EM-1205',
        event_id: 'EVT-EM-05',
        date: '2026-09-18',
        time: '09:12:10',
        door: 'Cash Vault Strong Room Door #1',
        location: 'Sylhet Main Branch',
        prev_status: 'Locked Armed',
        new_status: 'Emergency Lockdown',
        trigger_source: 'Central SOC Threat Protocol',
        user_initiator: 'SOC Commander Tareq',
        device: 'CoreStation CS-40 R1',
        emergency_type: 'Security Precaution Lockdown'
      }
    ]
  }
};
