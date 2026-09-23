/**
 * AccessControlSecurityDashboard.jsx — Comprehensive Access Control Security Dashboard
 * Pubali Bank PLC · Suprema BioStar X Enterprise Security
 * 
 * Strictly separated from Time & Attendance:
 * 1. Real-time security events (All 15 specified event types)
 * 2. Report 15: Restricted Area / High-Security Access Report (10 sensitive bank areas)
 * 3. Report 16: Privileged / VIP Access Report
 * 4. Report 17: Access Denied Report & Multi-Dimensional Security Analytics
 * 5. Full Enterprise Multi-Dimensional Filtering Suite (Date, Division, Branch, Result, Severity, Reader, Search, Quick Presets & Pagination)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { FULL_PUBALI_LOCATIONS } from '../data/pubaliFullBranches';
import { globalDoorStore } from '../services/doorStore';
import { useBankFilters } from './filters/FilterContext';

// ─── CSV EXPORT HELPER ──────────────────────────────────────────
function exportCsv(header, rows, filename) {
  const content = [header, ...rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── 15 REAL-TIME SECURITY EVENT TYPES ──────────────────────────
const SECURITY_EVENT_TYPES = [
  { id: 'all', label: 'All Security Events', icon: '', color: '#0f172a', bg: '#f1f5f9' },
  { id: 'authorized', label: 'Authorized access', icon: '', color: '#16a34a', bg: '#dcfce7' },
  { id: 'denied', label: 'Access denied', icon: '', color: '#dc2626', bg: '#fee2e2' },
  { id: 'invalid_cred', label: 'Invalid credential', icon: '', color: '#ea580c', bg: '#ffedd5' },
  { id: 'forced_open', label: 'Door forced open', icon: '', color: '#b91c1c', bg: '#fef2f2' },
  { id: 'held_open', label: 'Door held open', icon: '', color: '#d97706', bg: '#fef3c7' },
  { id: 'door_unlocked', label: 'Door unlocked', icon: '', color: '#0d9488', bg: '#ccfbf1' },
  { id: 'door_locked', label: 'Door locked', icon: '', color: '#2563eb', bg: '#dbeafe' },
  { id: 'exit_event', label: 'Exit event', icon: '', color: '#7c3aed', bg: '#f3e8ff' },
  { id: 'emergency_unlock', label: 'Emergency unlock', icon: '', color: '#e11d48', bg: '#ffe4e6' },
  { id: 'tamper', label: 'Tamper', icon: '', color: '#c026d3', bg: '#fae8ff' },
  { id: 'controller_alarm', label: 'Controller alarm', icon: '', color: '#be123c', bg: '#ffe4e6' },
  { id: 'reader_offline', label: 'Reader offline', icon: '', color: '#475569', bg: '#f1f5f9' },
  { id: 'apb_violation', label: 'Anti-passback violation', icon: '', color: '#4338ca', bg: '#e0e7ff' },
  { id: 'tailgating', label: 'Tailgating event', icon: '', color: '#92400e', bg: '#fef3c7' },
  { id: 'outside_schedule', label: 'Access outside schedule', icon: '', color: '#b45309', bg: '#fef3c7' },
];

// ─── 10 RESTRICTED HIGH-SECURITY AREAS (SECTION 15) ─────────────
const RESTRICTED_AREAS = [
  'Data Center',
  'Server Room',
  'Treasury',
  'Vault',
  'Cash Processing',
  'SWIFT Room',
  'Network Operation Center',
  'SOC',
  'Archive',
  'Management Floor',
];

// ─── PRIVILEGED / VIP AREAS (SECTION 16) ────────────────────────
const PRIVILEGED_AREAS = [
  'CEO/MD area',
  'Board room',
  'Executive floors',
  'Data center',
  'Treasury',
  'Vault',
  'Security operation center',
];

// ─── DENIAL REASONS (SECTION 17) ────────────────────────────────
const DENIAL_REASONS = [
  'Unauthorized user',
  'Invalid card',
  'Expired credential',
  'Access outside schedule',
  'Wrong access level',
  'Anti-passback violation',
  'Disabled employee',
  'Door/reader issue',
];

// ─── FILTER CONSTANTS ───────────────────────────────────────────
const DIVISIONS = ['All Divisions', 'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];
const RESULT_OPTIONS = ['All Results', 'Granted', 'Denied', 'Warning', 'Tamper Alert', 'Standby'];
const SEVERITY_OPTIONS = ['All Severities', 'Critical', 'High', 'Medium', 'Low', 'Normal'];
const READER_MODELS = [
  'All Readers',
  'BioStation 3',
  'FaceStation F2',
  'BioEntry W2',
  'BioEntry P2',
  'X-Pass 2',
  'CoreStation CS-40'
];

const DOOR_SECURITY_CLASSES = [
  'All',
  'Class 1: Vault & Strongroom',
  'Class 2: Server Room',
  'Class 3: Cash Counter',
  'Class 4: General Entry'
];

const AUTH_METHODS = [
  'All',
  'RFID',
  'Face',
  'Fingerprint',
  'PIN'
];

const LOCK_STATES = [
  'All',
  'Locked',
  'Unlocked',
  'Forced Open',
  'Held Open'
];

const SECURITY_LEVELS = [
  'All',
  'Level 5 (Maximum)',
  'Level 4 (High Security)',
  'Level 3 (Security Alert)',
  'Level 2 (Standard)',
  'Level 1 (Basic)'
];

const ACCESS_TYPES = [
  'All',
  'Entry',
  'Exit',
  'Interlock Transit',
  'Emergency Egress'
];

const DATE_PRESETS = [
  { id: 'today', label: 'Today (16 Sep 2026)' },
  { id: 'yesterday', label: 'Yesterday (15 Sep 2026)' },
  { id: 'last7', label: 'Last 7 Days' },
  { id: 'month', label: 'This Month (Sep 2026)' },
  { id: 'all', label: 'All Historic Dates' },
  { id: 'custom', label: 'Custom Date Range...' },
];

const QUICK_PRESETS = [
  { id: 'today_all', label: 'Today Live Stream', icon: '' },
  { id: 'critical_threats', label: 'Critical & High Threats', icon: '' },
  { id: 'denied_attempts', label: 'Denied Access Attempts', icon: '' },
  { id: 'vault_dual', label: 'Cash Vault Dual-Custody', icon: '' },
  { id: 'vip_executive', label: 'Executive / VIP Audits', icon: '' },
  { id: 'tamper_offline', label: 'Tamper & Offline Sensors', icon: '' },
];

// ─── SEED DATA GENERATION: REAL-TIME SECURITY EVENTS ───────────
function buildSecurityEvents() {
  const events = [];
  const eventTypesList = [
    { type: 'Authorized access', result: 'Granted', sev: 'Normal', icon: '', badge: '#16a34a' },
    { type: 'Access denied', result: 'Denied', sev: 'High', icon: '', badge: '#dc2626' },
    { type: 'Invalid credential', result: 'Denied', sev: 'High', icon: '', badge: '#ea580c' },
    { type: 'Door held open', result: 'Warning', sev: 'Medium', icon: '', badge: '#d97706' },
    { type: 'Door unlocked', result: 'Normal', sev: 'Low', icon: '', badge: '#0d9488' },
    { type: 'Door locked', result: 'Normal', sev: 'Low', icon: '', badge: '#2563eb' },
    { type: 'Exit event', result: 'Exit', sev: 'Normal', icon: '', badge: '#7c3aed' },
    { type: 'Tamper', result: 'Tamper Alert', sev: 'Critical', icon: '', badge: '#c026d3' },
    { type: 'Reader offline', result: 'Standby', sev: 'Medium', icon: '', badge: '#475569' },
    { type: 'Anti-passback violation', result: 'Denied', sev: 'High', icon: '', badge: '#4338ca' },
    { type: 'Tailgating event', result: 'Warning', sev: 'High', icon: '', badge: '#92400e' },
    { type: 'Access outside schedule', result: 'Denied', sev: 'Medium', icon: '', badge: '#b45309' },
    { type: 'Door forced open', result: 'Critical Alert', sev: 'Critical', icon: '', badge: '#b91c1c' },
    { type: 'Controller alarm', result: 'Tamper Alert', sev: 'Critical', icon: '', badge: '#be123c' },
  ];

  const readers = ['BioStation 3 (AI-01)', 'FaceStation F2 (3D-02)', 'BioEntry W2 (IP67)', 'X-Pass 2 (RFID-01)', 'CoreStation CS-40'];
  const dates = ['2026-09-16', '2026-09-16', '2026-09-16', '2026-09-15', '2026-09-14', '2026-09-12'];

  const mockUsers = [
    { id: 'PB-00102', name: 'Md. Abdul Alim', role: 'Executive Vice President', group: 'Executive Boardroom Clearance' },
    { id: 'PB-01054', name: 'Tariqul Islam', role: 'Senior Cash Officer', group: 'Vault Dual-Custody Authorized' },
    { id: 'PB-01428', name: 'Nazrul Hossain', role: 'SysAdmin Data Center Lead', group: 'Tier-IV Data Center Operators' },
    { id: 'PB-02014', name: 'Shamsul Haque', role: 'Branch Manager', group: 'Branch Command Custodians' },
    { id: 'PB-03310', name: 'Farhana Sultana', role: 'Treasury Dealer', group: 'Treasury & Forex Clearing' },
    { id: 'PB-04192', name: 'Kamal Uddin', role: 'SWIFT Transfer Officer', group: 'SWIFT High-Risk Operators' },
    { id: 'PB-05510', name: 'Rafiqul Alam', role: 'SOC Surveillance Engineer', group: 'SOC Central Monitoring' },
    { id: 'PB-09921', name: 'Unknown / Visitor Card', role: 'Unenrolled Badge', group: 'Unassigned Group' },
    { id: 'PB-09922', name: 'Ex-Employee Card #882', role: 'Terminated Staff', group: 'Deactivated Group' },
  ];

  let counter = 1000;

  FULL_PUBALI_LOCATIONS.slice(0, 50).forEach((loc, locIdx) => {
    const branchName = loc.name;
    const division = loc.division || 'Dhaka';

    for (let i = 0; i < 3; i++) {
      counter++;
      const et = eventTypesList[(locIdx * 3 + i) % eventTypesList.length];
      const user = mockUsers[(locIdx + i) % mockUsers.length];
      const reader = readers[(locIdx + i) % readers.length];
      const eventDate = dates[(locIdx + i) % dates.length];
      const hour = String(8 + ((i * 3 + locIdx) % 11)).padStart(2, '0');
      const min = String((counter * 7) % 60).padStart(2, '0');
      const sec = String((counter * 13) % 60).padStart(2, '0');

      let reason = '—';
      if (et.result === 'Denied') {
        if (et.type === 'Anti-passback violation') reason = 'Anti-passback violation';
        else if (et.type === 'Access outside schedule') reason = 'Access outside schedule';
        else if (et.type === 'Invalid credential') reason = 'Invalid card';
        else if (user.role.includes('Terminated')) reason = 'Disabled employee';
        else reason = 'Wrong access level';
      }

      const authMethod = reader.includes('Face') ? 'Face' : (reader.includes('BioEntry') ? 'Fingerprint' : (reader.includes('X-Pass') || reader.includes('RFID') ? 'RFID' : 'Face'));
      const doorSecurityClass = i === 1 ? 'Class 1: Vault & Strongroom' : (i === 2 ? 'Class 2: Server Room' : 'Class 4: General Entry');
      const lockState = et.type === 'Door locked' ? 'Locked' : (et.type === 'Door unlocked' ? 'Unlocked' : (et.type === 'Door forced open' ? 'Forced Open' : (et.type === 'Door held open' ? 'Held Open' : 'Locked')));
      const securityLevel = i === 1 ? 'Level 5 (Maximum)' : (i === 2 ? 'Level 4 (High Security)' : (et.result === 'Denied' ? 'Level 3 (Security Alert)' : 'Level 2 (Standard)'));
      const accessType = et.type === 'Exit event' ? 'Exit' : (et.type === 'Emergency unlock' ? 'Emergency' : 'Entry');

      events.push({
        eventId: `EVT-SEC-${counter}`,
        date: eventDate,
        time: `${hour}:${min}:${sec}`,
        timestamp: `${hour}:${min}:${sec}`,
        eventType: et.type,
        result: et.result,
        severity: et.sev,
        icon: et.icon,
        badgeColor: et.badge,
        employeeId: user.id,
        employeeName: user.name,
        role: user.role,
        accessGroup: user.group,
        branch: branchName,
        division,
        door: `DOR-${loc.code || 'PB'}-0${(i % 2) + 1}`,
        doorName: (i === 0 ? 'Main Entrance Turnstile' : (i === 1 ? 'Cash Vault Dual Mantrap' : 'Server Room Air-Lock')),
        reader,
        reason,
        latency: `${8 + ((counter * 3) % 24)} ms`,
        authMethod,
        doorSecurityClass,
        lockState,
        securityLevel,
        accessType,
      });
    }
  });

  // Explicit Motijheel Corporate Branch (Dhaka) Seed Events (Tender / SOC Audit Spec)
  const motijheelEvents = [
    {
      eventId: 'EVT-SEC-MOT-01',
      date: '2026-09-16',
      time: '09:15:30',
      timestamp: '09:15:30',
      eventType: 'Access denied',
      result: 'Denied',
      severity: 'High',
      icon: '',
      badgeColor: '#dc2626',
      employeeId: 'PB-09412',
      employeeName: 'Kashem Mollah',
      role: 'General Staff',
      accessGroup: 'General Banking Staff',
      branch: 'Motijheel Corporate Branch',
      division: 'Dhaka',
      door: 'DOR-MOT-01',
      doorName: 'Cash Vault Dual Mantrap',
      doorSecurityClass: 'Class 1: Vault & Strongroom',
      lockState: 'Locked',
      securityLevel: 'Level 5 (Maximum)',
      accessType: 'Entry',
      authMethod: 'RFID',
      reader: 'X-Pass 2 (RFID-01)',
      reason: 'Wrong access level',
      latency: '11 ms',
    },
    {
      eventId: 'EVT-SEC-MOT-02',
      date: '2026-09-16',
      time: '09:42:10',
      timestamp: '09:42:10',
      eventType: 'Invalid credential',
      result: 'Denied',
      severity: 'High',
      icon: '',
      badgeColor: '#ea580c',
      employeeId: 'CRD-UNKNOWN-992',
      employeeName: 'Unknown / Visitor Card',
      role: 'Unenrolled Badge',
      accessGroup: 'Unassigned Group',
      branch: 'Motijheel Corporate Branch',
      division: 'Dhaka',
      door: 'DOR-MOT-02',
      doorName: 'Main Entrance Turnstile',
      doorSecurityClass: 'Class 4: General Entry',
      lockState: 'Locked',
      securityLevel: 'Level 3 (Security Alert)',
      accessType: 'Entry',
      authMethod: 'RFID',
      reader: 'X-Pass 2 (RFID-01)',
      reason: 'Invalid card',
      latency: '9 ms',
    },
    {
      eventId: 'EVT-SEC-MOT-03',
      date: '2026-09-16',
      time: '10:05:44',
      timestamp: '10:05:44',
      eventType: 'Anti-passback violation',
      result: 'Denied',
      severity: 'High',
      icon: '',
      badgeColor: '#4338ca',
      employeeId: 'PB-06441',
      employeeName: 'Jamil Hossain',
      role: 'Junior Officer',
      accessGroup: 'Branch Staff Group',
      branch: 'Motijheel Corporate Branch',
      division: 'Dhaka',
      door: 'DOR-MOT-02',
      doorName: 'Main Entrance Turnstile',
      doorSecurityClass: 'Class 4: General Entry',
      lockState: 'Locked',
      securityLevel: 'Level 4 (High Security)',
      accessType: 'Entry',
      authMethod: 'RFID',
      reader: 'X-Pass 2 (RFID-01)',
      reason: 'Anti-passback violation',
      latency: '12 ms',
    },
    {
      eventId: 'EVT-SEC-MOT-04',
      date: '2026-09-16',
      time: '08:30:12',
      timestamp: '08:30:12',
      eventType: 'Authorized access',
      result: 'Granted',
      severity: 'Normal',
      icon: '',
      badgeColor: '#16a34a',
      employeeId: 'PB-01054',
      employeeName: 'Tariqul Islam',
      role: 'Senior Cash Officer',
      accessGroup: 'Vault Dual-Custody Authorized',
      branch: 'Motijheel Corporate Branch',
      division: 'Dhaka',
      door: 'DOR-MOT-01',
      doorName: 'Cash Vault Dual Mantrap',
      doorSecurityClass: 'Class 1: Vault & Strongroom',
      lockState: 'Unlocked',
      securityLevel: 'Level 5 (Maximum)',
      accessType: 'Entry',
      authMethod: 'RFID',
      reader: 'X-Pass 2 (RFID-01)',
      reason: '—',
      latency: '10 ms',
    },
    {
      eventId: 'EVT-SEC-MOT-05',
      date: '2026-09-16',
      time: '08:45:00',
      timestamp: '08:45:00',
      eventType: 'Authorized access',
      result: 'Granted',
      severity: 'Normal',
      icon: '',
      badgeColor: '#16a34a',
      employeeId: 'PB-01055',
      employeeName: 'Md. Nasir Uddin',
      role: 'Branch Manager / Dual Key',
      accessGroup: 'Cash Vault Dual-Custody',
      branch: 'Motijheel Corporate Branch',
      division: 'Dhaka',
      door: 'DOR-MOT-03',
      doorName: 'Server Room Air-Lock',
      doorSecurityClass: 'Class 2: Server Room',
      lockState: 'Unlocked',
      securityLevel: 'Level 4 (High Security)',
      accessType: 'Entry',
      authMethod: 'Face',
      reader: 'FaceStation F2 (3D-02)',
      reason: '—',
      latency: '14 ms',
    },
  ];
  events.unshift(...motijheelEvents);

  return events;
}

// ─── SEED DATA: RESTRICTED AREA / HIGH-SECURITY ACCESS (REPORT 15)
function buildRestrictedAccessLogs() {
  const logs = [];
  const dates = ['2026-09-16', '2026-09-16', '2026-09-15', '2026-09-15', '2026-09-14', '2026-09-12'];

  const staff = [
    { id: 'PB-01001', name: 'Dr. Mohammad Ali', area: 'Management Floor', group: 'Board of Directors Suite', role: 'Managing Director & CEO', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-01002', name: 'Sultana Begum', area: 'Management Floor', group: 'Executive Committee Clearance', role: 'Deputy Managing Director', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-01054', name: 'Tariqul Islam', area: 'Vault', group: 'Cash Vault Dual-Custody', role: 'Chief Cash Officer', div: 'Dhaka', branch: 'Motijheel Corporate Branch' },
    { id: 'PB-01055', name: 'Md. Nasir Uddin', area: 'Vault', group: 'Cash Vault Dual-Custody', role: 'Branch Manager / Dual Key', div: 'Dhaka', branch: 'Motijheel Corporate Branch' },
    { id: 'PB-01428', name: 'Nazrul Hossain', area: 'Data Center', group: 'Tier-IV Infrastructure Ops', role: 'Chief Technology Officer', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-01429', name: 'Tanvir Ahmed', area: 'Data Center', group: 'Tier-IV Infrastructure Ops', role: 'Senior Systems Engineer', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-02014', name: 'Shamsul Haque', area: 'Server Room', group: 'Regional IT Infrastructure', role: 'Regional Systems Admin', div: 'Chattogram', branch: 'Agrabad Branch' },
    { id: 'PB-03310', name: 'Farhana Sultana', area: 'Treasury', group: 'Treasury & Dealing Room', role: 'Head of Treasury Operations', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-03311', name: 'Asif Mahmud', area: 'Treasury', group: 'Treasury & Dealing Room', role: 'Senior Forex Dealer', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-04192', name: 'Kamal Uddin', area: 'SWIFT Room', group: 'SWIFT Wire Transfer Division', role: 'SWIFT Security Custodian', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-04193', name: 'Sadia Jahan', area: 'SWIFT Room', group: 'SWIFT Wire Transfer Division', role: 'SWIFT Operations Lead', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-05510', name: 'Rafiqul Alam', area: 'SOC', group: 'Security Operations Center', role: 'SOC Lead Analyst', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-05511', name: 'Mahbubur Rahman', area: 'Network Operation Center', group: 'Network Operations Center', role: 'NOC Lead Engineer', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-06012', name: 'Jannatul Ferdous', area: 'Cash Processing', group: 'Currency Sorting Mantrap', role: 'Cash Processing Officer', div: 'Sylhet', branch: 'Sylhet Main Branch' },
    { id: 'PB-07015', name: 'Nurul Huda', area: 'Archive', group: 'Historical Records Strong Room', role: 'Chief Document Archivist', div: 'Dhaka', branch: 'Dhanmondi Branch' },
  ];

  const readers = ['BioStation 3 (AI-Face+FP)', 'FaceStation F2 (3D Biometric)', 'CoreStation Dual Interlock Relay'];

  staff.forEach((s, idx) => {
    const logDate = dates[idx % dates.length];
    // Granted event
    logs.push({
      logId: `RES-${1000 + idx * 2 + 1}`,
      employee: `${s.name} (${s.id})`,
      employeeId: s.id,
      employeeName: s.name,
      accessArea: s.area,
      date: logDate,
      time: `09:${String(10 + idx * 3).padStart(2, '0')}:15`,
      reader: readers[idx % readers.length],
      result: 'Granted',
      severity: 'Normal',
      accessGroup: s.group,
      branch: s.branch,
      division: s.div,
      dualCustody: s.area === 'Vault' ? 'Dual-Custody Enforced' : 'Single Biometric Clearance',
      clearanceTier: s.area === 'Vault' || s.area === 'SWIFT Room' || s.area === 'Data Center' ? 'Level 5 (Maximum)' : 'Level 4 (High Security)',
    });

    // Simulated denial attempt on high-security area
    if (idx % 3 === 0) {
      logs.push({
        logId: `RES-${1000 + idx * 2 + 2}`,
        employee: `Unregistered Card #PB-VIS-${880 + idx}`,
        employeeId: `PB-VIS-${880 + idx}`,
        employeeName: 'Unregistered Visitor / Vendor',
        accessArea: s.area,
        date: logDate,
        time: `11:${String(15 + idx * 2).padStart(2, '0')}:40`,
        reader: readers[idx % readers.length],
        result: 'Denied',
        severity: 'High',
        accessGroup: 'Restricted - Zero Privilege',
        branch: s.branch,
        division: s.div,
        dualCustody: 'Failed Authentication',
        clearanceTier: 'Level 5 (Maximum)',
        reason: 'Wrong access level',
      });
    }
  });

  return logs;
}

// ─── SEED DATA: PRIVILEGED / VIP ACCESS REPORT (SECTION 16) ────
function buildPrivilegedAccessLogs() {
  const vips = [
    { id: 'PB-EXEC-01', name: 'Mohammad Ali, PhD', role: 'Managing Director & CEO', area: 'CEO/MD area', group: 'Executive Boardroom Conclave', facility: 'Floor 18 Executive Tower', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-EXEC-02', name: 'Md. Shafiul Alam', role: 'Chairman, Board Audit Committee', area: 'Board room', group: 'Board of Directors Suite', facility: 'Principal Boardroom', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-EXEC-03', name: 'M. S. I. Chowdhury', role: 'Director & Board Member', area: 'Board room', group: 'Board of Directors Suite', facility: 'Principal Boardroom', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-EXEC-04', name: 'Ahmad Reza', role: 'Deputy Managing Director (Operations)', area: 'Executive floors', group: 'Executive Management Council', facility: 'Floor 19 Executive Wing', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-EXEC-05', name: 'Zahirul Islam', role: 'Chief Information Security Officer (CISO)', area: 'Security operation center', group: 'SOC Senior Command', facility: 'Central SOC Bunker', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-EXEC-06', name: 'Nazrul Hossain', role: 'Head of IT & Infrastructure', area: 'Data center', group: 'Tier-IV Core Facility Authority', facility: 'Primary Data Center Safe', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-EXEC-07', name: 'Farhana Sultana', role: 'Head of Treasury & Investment', area: 'Treasury', group: 'High-Value Dealing Authority', facility: 'Central Dealing Room', div: 'Dhaka', branch: 'Principal Branch (Head Office)' },
    { id: 'PB-EXEC-08', name: 'Tariqul Islam', role: 'Chief Vault Custodian', area: 'Vault', group: 'Central Bullion & Reserve Safe', facility: 'Sub-Basement B2 Vault', div: 'Dhaka', branch: 'Motijheel Corporate Branch' },
  ];

  const dates = ['2026-09-16', '2026-09-16', '2026-09-16', '2026-09-15', '2026-09-15', '2026-09-14', '2026-09-13', '2026-09-12'];

  return vips.map((v, i) => ({
    vipId: `VIP-ACC-${i + 101}`,
    employee: `${v.name} (${v.id})`,
    employeeId: v.id,
    employeeName: v.name,
    executiveRole: v.role,
    privilegedFacility: v.area,
    specificRoom: v.facility,
    date: dates[i % dates.length],
    entryTime: `08:${String(30 + i * 8).padStart(2, '0')}:12`,
    exitTime: `10:${String(15 + i * 6).padStart(2, '0')}:45`,
    reader: 'FaceStation F2 (3D-02)',
    authModality: '3D Face Recognition + Minutiae',
    accessGroup: v.group,
    branch: v.branch,
    division: v.div,
    severity: 'Normal',
    escortRequired: v.area === 'Vault' || v.area === 'Data center' ? 'Yes (Dual-Custody Active)' : 'No (Individual VIP Privilege)',
    auditStatus: 'Verified & Logged',
    result: 'Granted',
  }));
}

// ─── SEED DATA: ACCESS DENIED REPORT & ANALYTICS (SECTION 17) ──
function buildAccessDeniedLogs() {
  const deniedEvents = [
    { id: 'DEN-01', user: 'Kashem Mollah (PB-09412)', userId: 'PB-09412', name: 'Kashem Mollah', door: 'Cash Vault Mantrap Outer Door', doorId: 'DOR-0102-02', branch: 'Motijheel Corporate Branch', division: 'Dhaka', date: '2026-09-16', time: '09:04:12', timeSlot: 'Morning Shift Peak', reason: 'Unauthorized user', reader: 'BioEntry W2 (IP67)', group: 'General Banking Staff', severity: 'High', count: 4 },
    { id: 'DEN-02', user: 'Card #CRD-UNKNOWN-992', userId: 'UNKNOWN-992', name: 'Unassigned RFID Card', door: 'Server Room Interlock Air-Lock', doorId: 'DOR-0142-02', branch: 'Dhanmondi Branch', division: 'Dhaka', date: '2026-09-16', time: '09:12:45', timeSlot: 'Morning Shift Peak', reason: 'Invalid card', reader: 'FaceStation F2 (3D-02)', group: 'None', severity: 'High', count: 3 },
    { id: 'DEN-03', user: 'Kamrul Hasan (PB-08104)', userId: 'PB-08104', name: 'Kamrul Hasan', door: 'SWIFT Wire Transfer Room', doorId: 'DOR-0101-04', branch: 'Principal Branch (Head Office)', division: 'Dhaka', date: '2026-09-16', time: '09:22:18', timeSlot: 'Morning Shift Peak', reason: 'Wrong access level', reader: 'BioStation 3 (AI-01)', group: 'Audit Staff Tier 2', severity: 'High', count: 3 },
    { id: 'DEN-04', user: 'Rezaul Karim (PB-07119)', userId: 'PB-07119', name: 'Rezaul Karim', door: 'Treasury Dealing Room Portal', doorId: 'DOR-0101-05', branch: 'Principal Branch (Head Office)', division: 'Dhaka', date: '2026-09-16', time: '08:15:30', timeSlot: 'Early Morning', reason: 'Access outside schedule', reader: 'BioStation 3 (AI-01)', group: 'Day Shift Staff (09:00-18:00)', severity: 'Medium', count: 2 },
    { id: 'DEN-05', user: 'Jamil Hossain (PB-06441)', userId: 'PB-06441', name: 'Jamil Hossain', door: 'Main Perimeter Entrance Turnstile', doorId: 'DOR-0201-01', branch: 'Agrabad Branch', division: 'Chattogram', date: '2026-09-16', time: '09:30:14', timeSlot: 'Morning Shift Peak', reason: 'Anti-passback violation', reader: 'BioStation 3 (AI-01)', group: 'Branch Staff Group', severity: 'High', count: 2 },
    { id: 'DEN-06', user: 'Ex-Employee #PB-03399', userId: 'PB-03399', name: 'Monirul Islam (Resigned)', door: 'Ground Floor Grand Lobby', doorId: 'DOR-0101-01', branch: 'Principal Branch (Head Office)', division: 'Dhaka', date: '2026-09-15', time: '09:42:05', timeSlot: 'Morning Shift Peak', reason: 'Disabled employee', reader: 'BioEntry W2 (IP67)', group: 'Terminated Account', severity: 'Critical', count: 1 },
    { id: 'DEN-07', user: 'Mahinur Rahman (PB-05520)', userId: 'PB-05520', name: 'Mahinur Rahman', door: 'ATM Night Replenishment Vault', doorId: 'DOR-0301-02', branch: 'Sylhet Main Branch', division: 'Sylhet', date: '2026-09-15', time: '07:45:10', timeSlot: 'Early Morning', reason: 'Access outside schedule', reader: 'BioEntry P2', group: 'ATM Replenishment Group', severity: 'Medium', count: 1 },
    { id: 'DEN-08', user: 'Contractor Badge #CRD-8812', userId: 'CRD-8812', name: 'HVAC Maintenance Vendor', door: 'Tier-IV Primary Data Center', doorId: 'DOR-0101-06', branch: 'Principal Branch (Head Office)', division: 'Dhaka', date: '2026-09-14', time: '10:05:22', timeSlot: 'Banking Business Hours', reason: 'Expired credential', reader: 'FaceStation F2 (3D-02)', group: 'Vendor Temporary Pass', severity: 'High', count: 1 },
    { id: 'DEN-09', user: 'Badal Sen (PB-09944)', userId: 'PB-09944', name: 'Badal Sen', door: 'Executive Boardroom Air-Lock', doorId: 'DOR-0101-09', branch: 'Principal Branch (Head Office)', division: 'Dhaka', date: '2026-09-14', time: '18:25:10', timeSlot: 'Night / Outside Shift', reason: 'Access outside schedule', reader: 'BioStation 3 (AI-01)', group: 'Facilities Staff', severity: 'Medium', count: 1 },
    { id: 'DEN-10', user: 'Hardware Fault Pin #08', userId: 'FAULT-08', name: 'Relay Controller #08', door: 'Cash Processing Vault Interlock', doorId: 'DOR-0102-04', branch: 'Motijheel Corporate Branch', division: 'Dhaka', date: '2026-09-12', time: '15:10:44', timeSlot: 'Afternoon & Closing', reason: 'Door/reader issue', reader: 'CoreStation CS-40', group: 'Hardware Loop', severity: 'Critical', count: 1 },
  ];

  return deniedEvents.map(d => ({ ...d, result: 'Denied' }));
}

function SecurityEventDetailModal({ event, onClose }) {
  if (!event) return null;
  const id = event.eventId || event.logId || event.vipId || event.id || 'EVT-001';
  const type = event.eventType || event.accessArea || event.privilegedFacility || event.reason || 'Access Control Event';
  const employee = event.employeeName || event.name || event.user || 'Unknown Staff';
  const employeeId = event.employeeId || event.userId || 'PB-N/A';
  const role = event.role || event.executiveRole || event.group || 'Bank Staff';
  const branch = event.branch || 'Head Office';
  const division = event.division || 'Dhaka';
  const door = event.doorName || event.door || event.specificRoom || 'Controlled Portal';
  const reader = event.reader || event.authModality || 'BioStation 3';
  const result = event.result || 'Granted';
  const time = event.time || event.entryTime || '10:00:00';
  const date = event.date || '2026-09-16';
  const isDenied = result === 'Denied' || result === 'Intercepted' || event.reason;
  const isWarning = result === 'Warning' || result === 'Tamper Alert';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          maxWidth: 680,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          border: `1.5px solid ${isDenied ? '#ef4444' : isWarning ? '#f59e0b' : '#0f766e'}`,
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: isDenied ? '#fef2f2' : isWarning ? '#fffbeb' : '#f0fdfa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '12px 12px 0 0'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Access Forensics & Portal Audit · {id}
              </span>
              <span style={{
                background: isDenied ? '#fee2e2' : (isWarning ? '#fef3c7' : '#dcfce7'),
                color: isDenied ? '#dc2626' : (isWarning ? '#d97706' : '#16a34a'),
                fontSize: 10.5,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 999
              }}>
                {result}
              </span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              {type}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 18,
              fontWeight: 700,
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Metadata Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Subject / Staff</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>{employee}</div>
              <div style={{ fontSize: 11, color: '#0284c7' }}>{employeeId} · {role}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Branch & Location</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>{branch}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{division} Division</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Door & Reader</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginTop: 2 }}>{door}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{reader}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Timestamp & Latency</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{time}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{date} {event.latency ? `· ${event.latency}` : ''}</div>
            </div>
          </div>

          {/* Denial Callout if applicable */}
          {event.reason && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Denial Forensics & Security Violation
              </div>
              <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 4 }}>
                Reason: <strong>{event.reason}</strong>. Physical lock remained in fail-secure state. Controller incident pushed to Central SOC.
              </div>
            </div>
          )}

          {/* Security Pathway Progression */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px', background: '#ffffff' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Physical Access Vector & Relay Pathway
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: '#0284c7', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0
                }}>
                  1
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                    Perimeter Badge / Sensor Interaction
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                    Card / biometric prompt received at <strong>{reader}</strong> ({door}) in {branch}.
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: isDenied ? '#dc2626' : '#0d9488', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0
                }}>
                  2
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                    Security Level & Clearance Verification
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                    {isDenied
                      ? `Policy validation rejected request: ${event.reason || 'Insufficient privilege tier'}.`
                      : `Access authorization cleared for ${role}. Policy schedule and anti-passback rules verified.`}
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: isDenied ? '#991b1b' : '#16a34a', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0
                }}>
                  3
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                    {isDenied ? 'Relay Lockdown & SOC Alarm Logged' : 'Relay Strike Pulse & Door Ingress Confirmed'}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                    {isDenied
                      ? 'Relay maintained fail-secure status. Door contact sensor verified portal closed.'
                      : 'Relay 12V DC strike released for 5 seconds. Door contact sensor logged successful entry.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Safeguards */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Audit Trail & Compliance Specifications
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6, fontSize: 11, color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Suprema BioStar X Encrypted Link
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Bangladesh Bank ICT Security 08
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Cryptographic Audit Signed
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> SOC Central Telemetry Logged
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          borderRadius: '0 0 12px 12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px', borderRadius: 6, background: '#0f766e', color: '#fff',
              border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ACCESS CONTROL SECURITY DASHBOARD COMPONENT ──────────
export default function AccessControlSecurityDashboard({ onNavigate }) {
  // Navigation tabs:
  // 'events' (Real-Time Security Events)
  // 'restricted' (Section 15: Restricted Area / High-Security Report)
  // 'vip' (Section 16: Privileged / VIP Access Report)
  // 'denied' (Section 17: Access Denied Report & Analytics)
  const [activeTab, setActiveTab] = useState('events');
  const [selectedDetailEvent, setSelectedDetailEvent] = useState(null);

  // ─── FILTER CONTEXT INTEGRATION (GLOBAL + HYBRID ARCHITECTURE) ───
  const {
    region,
    setRegion,
    branch,
    setBranch,
    datePreset,
    setDatePreset,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    searchQuery,
    setSearchQuery,
    moduleFilters,
    setModuleFilter,
    resetAllFilters: resetGlobalFilters,
    divisions,
  } = useBankFilters();

  // ─── ACCESS CONTROL PAGE-LEVEL FILTERS ───
  // Door Security Classification, Access Result, Authentication Method, Lock State, Security Level, Access Type
  const [selectedDoorClass, setSelectedDoorClass] = useState('All');
  const [selectedResult, setSelectedResult] = useState('All Results');
  const [selectedAuthMethod, setSelectedAuthMethod] = useState('All');
  const [selectedLockState, setSelectedLockState] = useState('All');
  const [selectedSecurityLevel, setSelectedSecurityLevel] = useState('All');
  const [selectedAccessType, setSelectedAccessType] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All Severities');
  const [selectedReader, setSelectedReader] = useState('All Readers');
  const [toast, setToast] = useState('');

  // Effective hybrid values: merge context moduleFilters (if set) with local page-level filters
  const effectiveDoorClass = (moduleFilters && moduleFilters.doorSecurityClass && moduleFilters.doorSecurityClass !== 'All') ? moduleFilters.doorSecurityClass : selectedDoorClass;
  const effectiveResult = (moduleFilters && moduleFilters.eventResult && moduleFilters.eventResult !== 'All') ? moduleFilters.eventResult : ((moduleFilters && moduleFilters.accessResult && moduleFilters.accessResult !== 'All') ? moduleFilters.accessResult : selectedResult);
  const effectiveAuthMethod = (moduleFilters && moduleFilters.authMethod && moduleFilters.authMethod !== 'All') ? moduleFilters.authMethod : selectedAuthMethod;
  const effectiveLockState = (moduleFilters && moduleFilters.lockState && moduleFilters.lockState !== 'All') ? moduleFilters.lockState : selectedLockState;
  const effectiveSecurityLevel = (moduleFilters && moduleFilters.securityLevel && moduleFilters.securityLevel !== 'All') ? moduleFilters.securityLevel : selectedSecurityLevel;
  const effectiveAccessType = (moduleFilters && moduleFilters.accessType && moduleFilters.accessType !== 'All') ? moduleFilters.accessType : selectedAccessType;
  const effectiveSeverity = (moduleFilters && moduleFilters.severity && moduleFilters.severity !== 'All') ? moduleFilters.severity : selectedSeverity;

  // ─── TAB-SPECIFIC SUB-FILTERS ───
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [selectedRestrictedArea, setSelectedRestrictedArea] = useState('All Areas');
  const [selectedDualCustody, setSelectedDualCustody] = useState('All');
  const [selectedClearanceTier, setSelectedClearanceTier] = useState('All');
  const [selectedPrivilegedArea, setSelectedPrivilegedArea] = useState('All Privileged Areas');
  const [selectedVipAuth, setSelectedVipAuth] = useState('All Modalities');
  const [selectedDenialReason, setSelectedDenialReason] = useState('All Reasons');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('All Hours');

  // ─── PAGINATION STATE ───
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Reset page whenever any filter or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab, region, branch, datePreset, customStartDate, customEndDate, searchQuery,
    effectiveDoorClass, effectiveResult, effectiveAuthMethod, effectiveLockState,
    effectiveSecurityLevel, effectiveAccessType, effectiveSeverity, selectedReader,
    selectedEventType, selectedRestrictedArea, selectedDualCustody, selectedClearanceTier,
    selectedPrivilegedArea, selectedVipAuth, selectedDenialReason, selectedTimeSlot, pageSize
  ]);

  // Data sources
  const securityEvents = useMemo(() => buildSecurityEvents(), []);
  const restrictedLogs = useMemo(() => buildRestrictedAccessLogs(), []);
  const privilegedLogs = useMemo(() => buildPrivilegedAccessLogs(), []);
  const accessDeniedLogs = useMemo(() => buildAccessDeniedLogs(), []);

  // Compute available branches based on selected division/region
  const availableBranches = useMemo(() => {
    if (!region || region === 'All Regions' || region === 'All Divisions') {
      const unique = Array.from(new Set(FULL_PUBALI_LOCATIONS.map(l => l.name))).sort();
      return ['All Branches', ...unique];
    }
    const filtered = FULL_PUBALI_LOCATIONS.filter(l => (l.division || 'Dhaka').toLowerCase() === region.toLowerCase()).map(l => l.name);
    return ['All Branches', ...Array.from(new Set(filtered)).sort()];
  }, [region]);

  // ─── DATE FILTER HELPER ───
  const isDateMatch = (itemDate) => {
    if (!itemDate) return true;
    if (datePreset === 'all') return true;
    if (datePreset === 'today' || datePreset === '24h') return itemDate === '2026-09-16';
    if (datePreset === 'yesterday') return itemDate === '2026-09-15';
    if (datePreset === 'last7' || datePreset === '7d') {
      return itemDate >= '2026-09-10' && itemDate <= '2026-09-16';
    }
    if (datePreset === 'month' || datePreset === '30d') {
      return itemDate.startsWith('2026-09');
    }
    if (datePreset === 'custom') {
      if (customStartDate && itemDate < customStartDate) return false;
      if (customEndDate && itemDate > customEndDate) return false;
      return true;
    }
    return true;
  };

  // ─── COMBINED FILTERING PIPELINE (GLOBAL + PAGE-LEVEL) ───
  const matchesCombinedFilters = (item) => {
    // 1. Global Date Filter
    if (item.date && !isDateMatch(item.date)) return false;

    // 2. Global Region Filter
    if (region && region !== 'All Regions' && region !== 'All Divisions') {
      const div = (item.division || 'Dhaka').toLowerCase();
      const target = region.toLowerCase();
      if (div !== target && !div.includes(target) && !target.includes(div)) return false;
    }

    // 3. Global Branch Filter
    if (branch && branch !== 'All Branches') {
      const br = (item.branch || '').toLowerCase();
      const target = branch.toLowerCase();
      if (!br.includes(target) && !target.includes(br)) return false;
    }

    // 4. Global Search Filter
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const m = (item.employeeName && item.employeeName.toLowerCase().includes(q)) ||
        (item.employeeId && item.employeeId.toLowerCase().includes(q)) ||
        (item.employee && item.employee.toLowerCase().includes(q)) ||
        (item.user && item.user.toLowerCase().includes(q)) ||
        (item.branch && item.branch.toLowerCase().includes(q)) ||
        (item.doorName && item.doorName.toLowerCase().includes(q)) ||
        (item.door && item.door.toLowerCase().includes(q)) ||
        (item.eventType && item.eventType.toLowerCase().includes(q)) ||
        (item.reader && item.reader.toLowerCase().includes(q)) ||
        (item.reason && item.reason.toLowerCase().includes(q)) ||
        (item.accessArea && item.accessArea.toLowerCase().includes(q));
      if (!m) return false;
    }

    // 5. Page-Level: Access Result
    if (effectiveResult !== 'All Results' && effectiveResult !== 'All') {
      if (effectiveResult === 'Granted' && item.result !== 'Granted') return false;
      if (effectiveResult === 'Denied' && item.result !== 'Denied') return false;
      if (effectiveResult === 'Warning' && item.result !== 'Warning') return false;
      if (effectiveResult === 'Tamper Alert' && !String(item.result).includes('Tamper') && !String(item.result).includes('Critical Alert')) return false;
      if (effectiveResult === 'Standby' && item.result !== 'Standby') return false;
    }

    // 6. Page-Level: Authentication Method
    if (effectiveAuthMethod !== 'All' && effectiveAuthMethod !== 'All Modalities') {
      const targetAuth = effectiveAuthMethod.toLowerCase();
      const itemAuth = (item.authMethod || '').toLowerCase();
      const itemReader = (item.reader || '').toLowerCase();
      const match = itemAuth.includes(targetAuth) || itemReader.includes(targetAuth);
      if (!match) return false;
    }

    // 7. Page-Level: Door Security Classification
    if (effectiveDoorClass !== 'All' && effectiveDoorClass !== 'All Door Classes') {
      const targetClass = effectiveDoorClass.toLowerCase();
      const itemClass = (item.doorSecurityClass || '').toLowerCase();
      const itemDoor = (item.doorName || item.door || '').toLowerCase();
      const itemArea = (item.accessArea || '').toLowerCase();
      const match = itemClass.includes(targetClass) ||
        (targetClass.includes('vault') && (itemDoor.includes('vault') || itemArea.includes('vault'))) ||
        (targetClass.includes('server') && (itemDoor.includes('server') || itemArea.includes('server') || itemArea.includes('data center'))) ||
        (targetClass.includes('cash') && (itemDoor.includes('cash') || itemArea.includes('cash'))) ||
        (targetClass.includes('general') && (itemDoor.includes('entrance') || itemDoor.includes('turnstile')));
      if (!match) return false;
    }

    // 8. Page-Level: Lock State
    if (effectiveLockState !== 'All' && effectiveLockState !== 'All States') {
      const targetLock = effectiveLockState.toLowerCase();
      const itemLock = (item.lockState || '').toLowerCase();
      const itemEvt = (item.eventType || '').toLowerCase();
      const match = itemLock.includes(targetLock) || itemEvt.includes(targetLock);
      if (!match) return false;
    }

    // 9. Page-Level: Security Level
    if (effectiveSecurityLevel !== 'All' && effectiveSecurityLevel !== 'All Levels') {
      const targetSec = effectiveSecurityLevel.toLowerCase();
      const itemSec = (item.securityLevel || item.clearanceTier || '').toLowerCase();
      if (!itemSec.includes(targetSec.slice(0, 7))) return false;
    }

    // 10. Page-Level: Access Type
    if (effectiveAccessType !== 'All' && effectiveAccessType !== 'All Types') {
      const targetType = effectiveAccessType.toLowerCase();
      const itemType = (item.accessType || '').toLowerCase();
      const itemEvt = (item.eventType || '').toLowerCase();
      if (!itemType.includes(targetType) && !itemEvt.includes(targetType)) return false;
    }

    // 11. Page-Level: Threat Severity
    if (effectiveSeverity !== 'All Severities' && effectiveSeverity !== 'All') {
      if (item.severity && item.severity !== effectiveSeverity) return false;
    }

    // 12. Page-Level: Reader Hardware
    if (selectedReader !== 'All Readers' && selectedReader !== 'All') {
      if (!String(item.reader || '').toLowerCase().includes(selectedReader.toLowerCase().replace(/\s+/g, ''))) {
        if (!String(item.reader || '').toLowerCase().includes(selectedReader.toLowerCase())) return false;
      }
    }

    return true;
  };

  // ─── 1. FILTERED EVENTS (TAB 1) ───
  const filteredEvents = useMemo(() => {
    return securityEvents.filter(evt => {
      if (!matchesCombinedFilters(evt)) return false;

      // Event Type Filter
      if (selectedEventType !== 'all') {
        const matchObj = SECURITY_EVENT_TYPES.find(t => t.id === selectedEventType);
        if (matchObj) {
          if (evt.eventType !== matchObj.label) return false;
        } else if (evt.eventType !== selectedEventType) {
          return false;
        }
      }
      return true;
    });
  }, [
    securityEvents, selectedEventType, region, branch, datePreset, customStartDate,
    customEndDate, searchQuery, effectiveDoorClass, effectiveResult, effectiveAuthMethod,
    effectiveLockState, effectiveSecurityLevel, effectiveAccessType, effectiveSeverity, selectedReader
  ]);

  // ─── DYNAMIC EVENT CHANNEL COUNTS (FOR 15 CHANNELS) ───
  const eventChannelCounts = useMemo(() => {
    const counts = { all: 0 };
    SECURITY_EVENT_TYPES.forEach(t => {
      if (t.id !== 'all') counts[t.id] = 0;
    });

    securityEvents.forEach(evt => {
      if (!matchesCombinedFilters(evt)) return;
      counts.all++;
      const match = SECURITY_EVENT_TYPES.find(t => t.id !== 'all' && t.label.toLowerCase() === (evt.eventType || '').toLowerCase());
      if (match) {
        counts[match.id] = (counts[match.id] || 0) + 1;
      }
    });

    return counts;
  }, [
    securityEvents, region, branch, datePreset, customStartDate, customEndDate,
    searchQuery, effectiveDoorClass, effectiveResult, effectiveAuthMethod,
    effectiveLockState, effectiveSecurityLevel, effectiveAccessType, effectiveSeverity, selectedReader
  ]);

  // ─── 2. FILTERED RESTRICTED LOGS (TAB 2 / REPORT 15) ───
  const filteredRestricted = useMemo(() => {
    return restrictedLogs.filter(log => {
      if (!matchesCombinedFilters(log)) return false;

      // Sensitive Area Filter
      if (selectedRestrictedArea !== 'All Areas' && log.accessArea !== selectedRestrictedArea) return false;

      // Dual Custody Filter
      if (selectedDualCustody !== 'All') {
        if (selectedDualCustody === 'Dual-Custody Enforced' && !log.dualCustody.includes('Enforced')) return false;
        if (selectedDualCustody === 'Single Biometric' && !log.dualCustody.includes('Single')) return false;
      }

      // Clearance Tier Filter
      if (selectedClearanceTier !== 'All' && log.clearanceTier !== selectedClearanceTier) return false;

      return true;
    });
  }, [
    restrictedLogs, selectedRestrictedArea, selectedDualCustody, selectedClearanceTier,
    region, branch, datePreset, customStartDate, customEndDate, searchQuery,
    effectiveDoorClass, effectiveResult, effectiveAuthMethod, effectiveLockState,
    effectiveSecurityLevel, effectiveAccessType, effectiveSeverity, selectedReader
  ]);

  // ─── 3. FILTERED PRIVILEGED LOGS (TAB 3 / REPORT 16) ───
  const filteredPrivileged = useMemo(() => {
    return privilegedLogs.filter(log => {
      if (!matchesCombinedFilters(log)) return false;

      // Privileged Facility Filter
      if (selectedPrivilegedArea !== 'All Privileged Areas' && log.privilegedFacility !== selectedPrivilegedArea) return false;

      // VIP Auth Modality Filter
      if (selectedVipAuth !== 'All Modalities' && log.authModality !== selectedVipAuth) return false;

      return true;
    });
  }, [
    privilegedLogs, selectedPrivilegedArea, selectedVipAuth, region, branch,
    datePreset, customStartDate, customEndDate, searchQuery, effectiveDoorClass,
    effectiveResult, effectiveAuthMethod, effectiveLockState, effectiveSecurityLevel,
    effectiveAccessType, effectiveSeverity, selectedReader
  ]);

  // ─── 4. FILTERED DENIED LOGS (TAB 4 / REPORT 17) ───
  const filteredDenied = useMemo(() => {
    return accessDeniedLogs.filter(log => {
      if (!matchesCombinedFilters(log)) return false;

      // Denial Reason Filter
      if (selectedDenialReason !== 'All Reasons' && log.reason !== selectedDenialReason) return false;

      // Time Slot Filter
      if (selectedTimeSlot !== 'All Hours' && log.timeSlot !== selectedTimeSlot) return false;

      return true;
    });
  }, [
    accessDeniedLogs, selectedDenialReason, selectedTimeSlot, region, branch,
    datePreset, customStartDate, customEndDate, searchQuery, effectiveDoorClass,
    effectiveResult, effectiveAuthMethod, effectiveLockState, effectiveSecurityLevel,
    effectiveAccessType, effectiveSeverity, selectedReader
  ]);

  // ─── DENIED ANALYTICS COMPUTED DYNAMICALLY FROM ACTIVE FILTER ───
  const deniedAnalytics = useMemo(() => {
    // 1. Top Denied Users
    const userMap = {};
    filteredDenied.forEach(d => {
      const key = d.user;
      if (!userMap[key]) userMap[key] = { name: d.user, role: d.group || 'Staff', branch: d.branch, count: 0, reason: d.reason };
      userMap[key].count += d.count || 1;
    });
    const topUsers = Object.values(userMap).sort((a, b) => b.count - a.count).slice(0, 5);

    // 2. Top Denied Doors
    const doorMap = {};
    filteredDenied.forEach(d => {
      const key = d.door;
      if (!doorMap[key]) doorMap[key] = { door: d.door, id: d.doorId, branch: d.branch, count: 0, lock: 'High-Security Solenoid' };
      doorMap[key].count += d.count || 1;
    });
    const topDoors = Object.values(doorMap).sort((a, b) => b.count - a.count).slice(0, 5);

    // 3. Top Denied Branches
    const branchMap = {};
    filteredDenied.forEach(d => {
      const key = d.branch;
      if (!branchMap[key]) branchMap[key] = { branch: d.branch, division: d.division, count: 0 };
      branchMap[key].count += d.count || 1;
    });
    const totalDenials = filteredDenied.reduce((acc, curr) => acc + (curr.count || 1), 0) || 1;
    const topBranches = Object.values(branchMap).sort((a, b) => b.count - a.count).slice(0, 5).map(b => ({
      ...b,
      percentage: `${Math.round((b.count / totalDenials) * 100)}%`
    }));

    // 4. Denied Access by Time
    const timeSlots = [
      { time: '06:00 - 08:00', label: 'Early Morning' },
      { time: '08:00 - 10:00', label: 'Morning Shift Peak', highlight: true },
      { time: '10:00 - 14:00', label: 'Banking Business Hours' },
      { time: '14:00 - 18:00', label: 'Afternoon & Closing' },
      { time: '18:00 - 22:00', label: 'Night / Outside Shift' },
    ];
    const timeBuckets = timeSlots.map(ts => {
      const matches = filteredDenied.filter(d => d.timeSlot === ts.label);
      const count = matches.reduce((acc, curr) => acc + (curr.count || 1), 0);
      return {
        ...ts,
        count,
        barWidth: `${Math.min(100, Math.max(8, (count / (totalDenials || 1)) * 100))}%`
      };
    });

    // 5. Denied Access by Reason
    const colors = ['#ea580c', '#dc2626', '#d97706', '#e11d48', '#4f46e5', '#7c3aed', '#059669', '#0284c7'];
    const reasonMap = {};
    filteredDenied.forEach(d => {
      reasonMap[d.reason] = (reasonMap[d.reason] || 0) + (d.count || 1);
    });
    const reasonBreakdown = Object.entries(reasonMap).map(([reason, count], idx) => ({
      reason,
      count,
      pct: `${Math.round((count / totalDenials) * 100)}%`,
      color: colors[idx % colors.length]
    })).sort((a, b) => b.count - a.count);

    return { topUsers, topDoors, topBranches, timeBuckets, reasonBreakdown };
  }, [filteredDenied]);

  // ─── ACTIVE LIST & PAGINATION SLICE ───
  const currentList = useMemo(() => {
    if (activeTab === 'events') return filteredEvents;
    if (activeTab === 'restricted') return filteredRestricted;
    if (activeTab === 'vip') return filteredPrivileged;
    return filteredDenied;
  }, [activeTab, filteredEvents, filteredRestricted, filteredPrivileged, filteredDenied]);

  const totalItems = currentList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return currentList.slice(start, start + pageSize);
  }, [currentList, currentPage, pageSize]);

  // ─── KPI METRIC COUNTS (COMBINED HYBRID STATE) ───
  const kpiAuthorizedCount = useMemo(() => {
    return filteredEvents.filter(e => e.result === 'Granted').length;
  }, [filteredEvents]);

  const kpiDeniedCount = useMemo(() => {
    return filteredEvents.filter(e => e.result === 'Denied').length;
  }, [filteredEvents]);

  const kpiThreatCount = useMemo(() => {
    return filteredEvents.filter(e => e.severity === 'Critical' || String(e.result).includes('Tamper') || String(e.eventType).includes('Forced')).length;
  }, [filteredEvents]);

  // ─── QUICK SCENARIO PRESET HANDLER ───
  const applyQuickPreset = (presetId) => {
    // Clear sub filters first
    setSelectedEventType('all');
    setSelectedRestrictedArea('All Areas');
    setSelectedDualCustody('All');
    setSelectedPrivilegedArea('All Privileged Areas');
    setSelectedDenialReason('All Reasons');
    setSelectedTimeSlot('All Hours');
    setSearchQuery('');

    if (presetId === 'today_all') {
      setActiveTab('events');
      setDatePreset('today');
      setRegion('All Regions');
      setBranch('All Branches');
      setSelectedResult('All Results');
      setSelectedSeverity('All Severities');
      setSelectedReader('All Readers');
      setSelectedDoorClass('All');
      setSelectedAuthMethod('All');
      setSelectedLockState('All');
      setSelectedSecurityLevel('All');
      setSelectedAccessType('All');
      setToast('Switched to Today’s live security stream across all bank portals.');
    } else if (presetId === 'critical_threats') {
      setActiveTab('events');
      setDatePreset('all');
      setSelectedSeverity('Critical');
      setSelectedResult('All Results');
      setToast('Filtered for Critical & High Security Threat events (Tamper, Alarms, Forcible entry).');
    } else if (presetId === 'denied_attempts') {
      setActiveTab('denied');
      setDatePreset('all');
      setSelectedResult('Denied');
      setToast('Showing all Access Denied events and real-time rejection analytics.');
    } else if (presetId === 'vault_dual') {
      setActiveTab('restricted');
      setDatePreset('all');
      setSelectedRestrictedArea('Vault');
      setSelectedDualCustody('Dual-Custody Enforced');
      setSelectedDoorClass('Class 1: Vault & Strongroom');
      setToast('️ Showing Dual-Custody Vault Access and Mantrap authorizations.');
    } else if (presetId === 'vip_executive') {
      setActiveTab('vip');
      setDatePreset('all');
      setSelectedPrivilegedArea('All Privileged Areas');
      setToast('Displaying Executive & VIP Access Log (Managing Director, Board & CISO).');
    } else if (presetId === 'tamper_offline') {
      setActiveTab('events');
      setDatePreset('all');
      setSelectedEventType('tamper');
      setToast('Filtered for Hardware Tamper & Sensor Offline incidents.');
    }
  };

  // ─── RESET ALL FILTERS ───
  const handleResetFilters = () => {
    if (resetGlobalFilters) resetGlobalFilters();
    setSelectedDoorClass('All');
    setSelectedResult('All Results');
    setSelectedAuthMethod('All');
    setSelectedLockState('All');
    setSelectedSecurityLevel('All');
    setSelectedAccessType('All');
    setSelectedSeverity('All Severities');
    setSelectedReader('All Readers');
    setSelectedEventType('all');
    setSelectedRestrictedArea('All Areas');
    setSelectedDualCustody('All');
    setSelectedClearanceTier('All');
    setSelectedPrivilegedArea('All Privileged Areas');
    setSelectedVipAuth('All Modalities');
    setSelectedDenialReason('All Reasons');
    setSelectedTimeSlot('All Hours');
    setToast('All global and Access Control filters have been reset to enterprise defaults.');
  };

  // ─── CHECK IF ANY FILTER IS ACTIVE ───
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (datePreset !== 'today' && datePreset !== '24h') count++;
    if (region && region !== 'All Regions' && region !== 'All Divisions') count++;
    if (branch && branch !== 'All Branches') count++;
    if (searchQuery && searchQuery.trim()) count++;
    if (effectiveResult !== 'All Results' && effectiveResult !== 'All') count++;
    if (effectiveAuthMethod !== 'All' && effectiveAuthMethod !== 'All Modalities') count++;
    if (effectiveDoorClass !== 'All' && effectiveDoorClass !== 'All Door Classes') count++;
    if (effectiveLockState !== 'All' && effectiveLockState !== 'All States') count++;
    if (effectiveSecurityLevel !== 'All' && effectiveSecurityLevel !== 'All Levels') count++;
    if (effectiveAccessType !== 'All' && effectiveAccessType !== 'All Types') count++;
    if (effectiveSeverity !== 'All Severities' && effectiveSeverity !== 'All') count++;
    if (selectedReader !== 'All Readers') count++;
    if (selectedEventType !== 'all') count++;
    if (selectedRestrictedArea !== 'All Areas') count++;
    if (selectedDualCustody !== 'All') count++;
    if (selectedPrivilegedArea !== 'All Privileged Areas') count++;
    if (selectedDenialReason !== 'All Reasons') count++;
    if (selectedTimeSlot !== 'All Hours') count++;
    return count;
  }, [
    datePreset, region, branch, searchQuery, effectiveResult, effectiveAuthMethod,
    effectiveDoorClass, effectiveLockState, effectiveSecurityLevel, effectiveAccessType,
    effectiveSeverity, selectedReader, selectedEventType, selectedRestrictedArea,
    selectedDualCustody, selectedPrivilegedArea, selectedDenialReason, selectedTimeSlot
  ]);

  // ─── CSV EXPORT ───
  const handleExportCurrent = () => {
    if (activeTab === 'events') {
      exportCsv(
        'Event ID,Date,Time,Event Type,Employee ID,Employee Name,Role,Access Group,Division,Branch Location,Door Name,Reader Hardware,Result,Reason',
        filteredEvents.map(e => [e.eventId, e.date, e.time, e.eventType, e.employeeId, e.employeeName, e.role, e.accessGroup, e.division, e.branch, e.doorName, e.reader, e.result, e.reason]),
        `Pubali_Bank_RealTime_Security_Events_${new Date().toISOString().slice(0, 10)}.csv`
      );
      setToast(`Exported ${filteredEvents.length} Real-Time Security Events records (CSV).`);
    } else if (activeTab === 'restricted') {
      exportCsv(
        'Log ID,Employee,Access Area,Date,Time,Reader,Result,Access Group,Division,Branch Location,Dual Custody Verification,Clearance Tier',
        filteredRestricted.map(r => [r.logId, r.employee, r.accessArea, r.date, r.time, r.reader, r.result, r.accessGroup, r.division, r.branch, r.dualCustody, r.clearanceTier]),
        `Pubali_Bank_Restricted_HighSecurity_Access_Report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      setToast(`Exported ${filteredRestricted.length} Restricted Area / High-Security Access records (CSV).`);
    } else if (activeTab === 'vip') {
      exportCsv(
        'VIP ID,Employee,Role,Privileged Facility,Specific Room,Date,Entry Time,Exit Time,Reader Hardware,Auth Modality,Access Group,Audit Status,Result',
        filteredPrivileged.map(v => [v.vipId, v.employee, v.executiveRole, v.privilegedFacility, v.specificRoom, v.date, v.entryTime, v.exitTime, v.reader, v.authModality, v.accessGroup, v.auditStatus, v.result]),
        `Pubali_Bank_Privileged_VIP_Access_Report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      setToast(`Exported ${filteredPrivileged.length} Privileged / VIP Access records (CSV).`);
    } else if (activeTab === 'denied') {
      exportCsv(
        'Record ID,User / Card,Door Name,Door ID,Branch Location,Division,Date,Time,Denial Reason,Reader Hardware,Security Group',
        filteredDenied.map(d => [d.id, d.user, d.door, d.doorId, d.branch, d.division, d.date, d.time, d.reason, d.reader, d.group]),
        `Pubali_Bank_Access_Denied_Security_Report_${new Date().toISOString().slice(0, 10)}.csv`
      );
      setToast(`Exported ${filteredDenied.length} Access Denied Security Analytics records (CSV).`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ─── FLOATING TOAST ─── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: '#0f172a', color: '#fff', padding: '12px 20px',
          borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 12, fontSize: 13,
          fontWeight: 600, borderLeft: '4px solid #0d9488', maxWidth: 480
        }}>
          <span>{toast}</span>
          <button
            onClick={() => setToast('')}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 16 }}
          >✕</button>
        </div>
      )}

      {/* ─── SECURITY BANNER (SEPARATE FROM ATTENDANCE) ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #111827 45%, #0f766e 100%)',
        borderRadius: 12,
        padding: '20px 24px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            flexShrink: 0
          }}>
            SEC
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>
                Access Control Security Dashboard
              </span>
              <span style={{
                background: '#dc2626', color: '#fff', padding: '2px 8px',
                borderRadius: 12, fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase'
              }}>
                PHYSICAL SECURITY · SEPARATE FROM ATTENDANCE
              </span>
              <span style={{
                background: '#10b981', color: '#fff', padding: '2px 8px',
                borderRadius: 12, fontSize: 10.5, fontWeight: 800
              }}>
                ● 15 REAL-TIME EVENT TYPES ARMED
              </span>
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 4 }}>
              Pubali Bank PLC · 2,696 Armed Portals · 520 Cash Vault Mantraps · High-Security Sensitive Area Audit & Denied Access Analytics
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCurrent}
            style={{
              background: '#ffffff', color: '#0f172a', border: 'none',
              padding: '8px 16px', borderRadius: 6, fontSize: 12, fontWeight: 800,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <span>Export Filtered ({currentList.length})</span>
          </button>
          <button
            onClick={() => { setToast('Security Gateway Synced with Central Bank ICT-08 Controller Loop.'); }}
            style={{
              background: 'rgba(255,255,255,0.15)', color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.25)', padding: '8px 14px',
              borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer'
            }}
          >
            Sync Telemetry
          </button>
        </div>
      </div>

      {/* ─── 5 KPI METRIC CARDS (SYNCHRONIZED WITH GLOBAL + MODULE FILTERS) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 12
      }}>
        {/* Card 1: Total Events */}
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          padding: '14px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Filtered Access Events
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {filteredEvents.length.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: '#0f766e', fontWeight: 600 }}>
              {region !== 'All Regions' ? `${region} Division` : 'All 8 Divisions'}
            </div>
          </div>
        </div>

        {/* Card 2: Authorized Access */}
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          padding: '14px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Authorized Access
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#15803d', lineHeight: 1.2 }}>
              {kpiAuthorizedCount.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
              {filteredEvents.length ? Math.round((kpiAuthorizedCount / filteredEvents.length) * 100) : 0}% Grant Ratio
            </div>
          </div>
        </div>

        {/* Card 3: Access Denied */}
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid #fee2e2',
          padding: '14px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Access Denied Intercepts
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#b91c1c', lineHeight: 1.2 }}>
              {kpiDeniedCount.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>
              Security Exceptions Logged
            </div>
          </div>
        </div>

        {/* Card 4: High-Security / Restricted Audits */}
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid #e0e7ff',
          padding: '14px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#3730a3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Restricted Area Audits
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#4338ca', lineHeight: 1.2 }}>
              {filteredRestricted.length.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>
              Dual Custody & Tier 1/2
            </div>
          </div>
        </div>

        {/* Card 5: Threat & Tamper Alerts */}
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid #fef3c7',
          padding: '14px 18px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 14
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Threat & Tamper Alerts
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#b45309', lineHeight: 1.2 }}>
              {kpiThreatCount.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>
              Hardware & Forced Entry
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4 TOP-LEVEL SECURITY DASHBOARD TABS ─── */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        background: '#ffffff', border: '1px solid #e2e8f0',
        padding: '8px 12px', borderRadius: 8, flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <button
          onClick={() => setActiveTab('events')}
          style={{
            padding: '8px 16px', borderRadius: 6, fontSize: 12.5, fontWeight: 700,
            background: activeTab === 'events' ? '#0f766e' : '#f8fafc',
            color: activeTab === 'events' ? '#ffffff' : '#334155',
            border: activeTab === 'events' ? '1px solid #0f766e' : '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: activeTab === 'events' ? '0 2px 6px rgba(15,118,110,0.3)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <span>Real-Time Security Events</span>
          <span style={{ fontSize: 10, background: activeTab === 'events' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>
            {filteredEvents.length} Events
          </span>
        </button>

        <button
          onClick={() => setActiveTab('restricted')}
          style={{
            padding: '8px 16px', borderRadius: 6, fontSize: 12.5, fontWeight: 700,
            background: activeTab === 'restricted' ? '#4f46e5' : '#f8fafc',
            color: activeTab === 'restricted' ? '#ffffff' : '#334155',
            border: activeTab === 'restricted' ? '1px solid #4f46e5' : '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: activeTab === 'restricted' ? '0 2px 6px rgba(79,70,229,0.3)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <span>15. Restricted Area Access Report</span>
          <span style={{ fontSize: 10, background: activeTab === 'restricted' ? 'rgba(255,255,255,0.25)' : '#e0e7ff', color: activeTab === 'restricted' ? '#fff' : '#4338ca', padding: '1px 6px', borderRadius: 10 }}>
            {filteredRestricted.length} Sensitive Audits
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vip')}
          style={{
            padding: '8px 16px', borderRadius: 6, fontSize: 12.5, fontWeight: 700,
            background: activeTab === 'vip' ? '#b45309' : '#f8fafc',
            color: activeTab === 'vip' ? '#ffffff' : '#334155',
            border: activeTab === 'vip' ? '1px solid #b45309' : '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: activeTab === 'vip' ? '0 2px 6px rgba(180,83,9,0.3)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <span>16. Privileged / VIP Access Report</span>
          <span style={{ fontSize: 10, background: activeTab === 'vip' ? 'rgba(255,255,255,0.25)' : '#fef3c7', color: activeTab === 'vip' ? '#fff' : '#b45309', padding: '1px 6px', borderRadius: 10 }}>
            {filteredPrivileged.length} VIP Audits
          </span>
        </button>

        <button
          onClick={() => setActiveTab('denied')}
          style={{
            padding: '8px 16px', borderRadius: 6, fontSize: 12.5, fontWeight: 700,
            background: activeTab === 'denied' ? '#dc2626' : '#f8fafc',
            color: activeTab === 'denied' ? '#ffffff' : '#334155',
            border: activeTab === 'denied' ? '1px solid #dc2626' : '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: activeTab === 'denied' ? '0 2px 6px rgba(220,38,38,0.3)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <span>17. Access Denied Report & Analytics</span>
          <span style={{ fontSize: 10, background: activeTab === 'denied' ? 'rgba(255,255,255,0.25)' : '#fee2e2', color: activeTab === 'denied' ? '#fff' : '#b91c1c', padding: '1px 6px', borderRadius: 10 }}>
            {filteredDenied.length} Denials Intercepted
          </span>
        </button>
      </div>

      {/* ─── UNIFIED COMPREHENSIVE FILTER SUITE ─── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 10,
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {/* Header Bar of Filter Suite */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
              Universal Security Audit Filter
            </span>
            {activeFiltersCount > 0 && (
              <span style={{
                background: '#0ea5e9', color: '#ffffff', fontSize: 10.5,
                fontWeight: 800, padding: '2px 8px', borderRadius: 12
              }}>
                {activeFiltersCount} Active Filters
              </span>
            )}
            <span style={{ fontSize: 11, color: '#64748b' }}>
              Instant cross-filtering by Date, Division, Branch, Portal Result, Threat Severity & Reader Hardware
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                style={{
                  background: '#f1f5f9', border: '1px solid #cbd5e1',
                  borderRadius: 6, padding: '5px 12px', fontSize: 11.5,
                  fontWeight: 700, color: '#475569', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Primary Controls Row: Global & Page-Level Access Control Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 10
        }}>
          {/* 1. Global Date Range Preset */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Date Range
            </label>
            <select
              value={datePreset}
              onChange={e => setDatePreset(e.target.value)}
              style={{
                padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                fontSize: 12, fontWeight: 600, background: '#f8fafc', color: '#0f172a', outline: 'none'
              }}
            >
              {DATE_PRESETS.map(dp => (
                <option key={dp.id} value={dp.id}>{dp.label}</option>
              ))}
            </select>
          </div>

          {/* Custom Date Pickers if 'custom' selected */}
          {datePreset === 'custom' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  style={{
                    padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                    fontSize: 12, fontWeight: 600, background: '#f8fafc', color: '#0f172a'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  style={{
                    padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                    fontSize: 12, fontWeight: 600, background: '#f8fafc', color: '#0f172a'
                  }}
                />
              </div>
            </>
          )}

          {/* 2. Global Region Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Region / Division
            </label>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              style={{
                padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                fontSize: 12, fontWeight: 600, background: '#f8fafc', color: '#0f172a', outline: 'none'
              }}
            >
              {(divisions || DIVISIONS).map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>

          {/* 3. Global Branch Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Branch Location
            </label>
            <select
              value={branch}
              onChange={e => setBranch(e.target.value)}
              style={{
                padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                fontSize: 12, fontWeight: 600, background: '#f8fafc', color: '#0f172a', outline: 'none'
              }}
            >
              {availableBranches.slice(0, 80).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* 4. Page-Level: Door Security Classification */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Door Class
            </label>
            <select
              value={effectiveDoorClass}
              onChange={e => {
                setSelectedDoorClass(e.target.value);
                setModuleFilter('doorSecurityClass', e.target.value);
              }}
              style={{
                padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                fontSize: 12, fontWeight: 600, background: '#f8fafc', color: '#0f172a', outline: 'none'
              }}
            >
              {DOOR_SECURITY_CLASSES.map(dc => (
                <option key={dc} value={dc}>{dc}</option>
              ))}
            </select>
          </div>

          {/* 5. Page-Level: Access Result */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Access Result
            </label>
            <select
              value={effectiveResult}
              onChange={e => {
                setSelectedResult(e.target.value);
                setModuleFilter('eventResult', e.target.value);
              }}
              style={{
                padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                fontSize: 12, fontWeight: 600, background: '#f8fafc', color: '#0f172a', outline: 'none'
              }}
            >
              {RESULT_OPTIONS.map(res => (
                <option key={res} value={res}>{res}</option>
              ))}
            </select>
          </div>

          {/* 6. Page-Level: Authentication Method */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Auth Method
            </label>
            <select
              value={effectiveAuthMethod}
              onChange={e => {
                setSelectedAuthMethod(e.target.value);
                setModuleFilter('authMethod', e.target.value);
              }}
              style={{
                padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                fontSize: 12, fontWeight: 600, background: '#f8fafc', color: '#0f172a', outline: 'none'
              }}
            >
              {AUTH_METHODS.map(am => (
                <option key={am} value={am}>{am}</option>
              ))}
            </select>
          </div>

          {/* 7. Page-Level: Lock State */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Lock State
            </label>
            <select
              value={effectiveLockState}
              onChange={e => {
                setSelectedLockState(e.target.value);
                setModuleFilter('lockState', e.target.value);
              }}
              style={{
                padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                fontSize: 12, fontWeight: 600, background: '#f8fafc', color: '#0f172a', outline: 'none'
              }}
            >
              {LOCK_STATES.map(ls => (
                <option key={ls} value={ls}>{ls}</option>
              ))}
            </select>
          </div>

          {/* 8. Page-Level: Security Level */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Security Level
            </label>
            <select
              value={effectiveSecurityLevel}
              onChange={e => {
                setSelectedSecurityLevel(e.target.value);
                setModuleFilter('securityLevel', e.target.value);
              }}
              style={{
                padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                fontSize: 12, fontWeight: 600, background: '#f8fafc', color: '#0f172a', outline: 'none'
              }}
            >
              {SECURITY_LEVELS.map(sl => (
                <option key={sl} value={sl}>{sl}</option>
              ))}
            </select>
          </div>

          {/* 9. Page-Level: Access Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Access Type
            </label>
            <select
              value={effectiveAccessType}
              onChange={e => {
                setSelectedAccessType(e.target.value);
                setModuleFilter('accessType', e.target.value);
              }}
              style={{
                padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                fontSize: 12, fontWeight: 600, background: '#f8fafc', color: '#0f172a', outline: 'none'
              }}
            >
              {ACCESS_TYPES.map(at => (
                <option key={at} value={at}>{at}</option>
              ))}
            </select>
          </div>

          {/* 10. Threat Severity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Threat Severity
            </label>
            <select
              value={effectiveSeverity}
              onChange={e => {
                setSelectedSeverity(e.target.value);
                setModuleFilter('severity', e.target.value);
              }}
              style={{
                padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                fontSize: 12, fontWeight: 600, background: '#f8fafc', color: '#0f172a', outline: 'none'
              }}
            >
              {SEVERITY_OPTIONS.map(sev => (
                <option key={sev} value={sev}>{sev}</option>
              ))}
            </select>
          </div>

          {/* 11. Reader Hardware */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Reader Hardware
            </label>
            <select
              value={selectedReader}
              onChange={e => setSelectedReader(e.target.value)}
              style={{
                padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
                fontSize: 12, fontWeight: 600, background: '#f8fafc', color: '#0f172a', outline: 'none'
              }}
            >
              {READER_MODELS.map(rm => (
                <option key={rm} value={rm}>{rm}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Search & Quick Preset Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingTop: 4 }}>
          {/* Quick Scenario Preset Chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: '#64748b', marginRight: 2 }}>
              QUICK PRESETS:
            </span>
            {QUICK_PRESETS.map(qp => (
              <button
                key={qp.id}
                onClick={() => applyQuickPreset(qp.id)}
                style={{
                  background: '#f8fafc', border: '1px solid #cbd5e1',
                  borderRadius: 16, padding: '4px 10px', fontSize: 11,
                  fontWeight: 700, color: '#334155', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 0.14s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0f766e'; e.currentTarget.style.background = '#f0fdfa'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
              >
                <span>{qp.label}</span>
              </button>
            ))}
          </div>

          {/* Universal Search Input */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Live Search Employee, ID, Door, Card, Reason..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  padding: '7px 12px', borderRadius: 6,
                  border: '1px solid #cbd5e1', fontSize: 12, width: 280,
                  outline: 'none', background: '#f8fafc'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute', right: 8, top: 7, background: 'none',
                    border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12
                  }}
                >✕</button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Pills Display */}
        {activeFiltersCount > 0 && (
          <div style={{
            display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center',
            paddingTop: 8, borderTop: '1px dashed #e2e8f0'
          }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: '#0f766e' }}>
              APPLIED FILTERS:
            </span>

            {datePreset !== 'today' && datePreset !== '24h' && (
              <span style={{
                background: '#e0f2fe', color: '#0369a1', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Date: {DATE_PRESETS.find(d => d.id === datePreset)?.label || datePreset}</span>
                <button onClick={() => setDatePreset('today')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1' }}>✕</button>
              </span>
            )}

            {region && region !== 'All Regions' && region !== 'All Divisions' && (
              <span style={{
                background: '#e0e7ff', color: '#3730a3', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Region: {region}</span>
                <button onClick={() => setRegion('All Regions')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3730a3' }}>✕</button>
              </span>
            )}

            {branch && branch !== 'All Branches' && (
              <span style={{
                background: '#fae8ff', color: '#86198f', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Branch: {branch}</span>
                <button onClick={() => setBranch('All Branches')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#86198f' }}>✕</button>
              </span>
            )}

            {effectiveDoorClass !== 'All' && (
              <span style={{
                background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Door: {effectiveDoorClass}</span>
                <button onClick={() => { setSelectedDoorClass('All'); setModuleFilter('doorSecurityClass', 'All'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e' }}>✕</button>
              </span>
            )}

            {effectiveResult !== 'All Results' && effectiveResult !== 'All' && (
              <span style={{
                background: effectiveResult === 'Denied' ? '#fee2e2' : '#dcfce7',
                color: effectiveResult === 'Denied' ? '#b91c1c' : '#15803d',
                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Result: {effectiveResult}</span>
                <button onClick={() => { setSelectedResult('All Results'); setModuleFilter('eventResult', 'All'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
              </span>
            )}

            {effectiveAuthMethod !== 'All' && (
              <span style={{
                background: '#ede9fe', color: '#6d28d9', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Auth: {effectiveAuthMethod}</span>
                <button onClick={() => { setSelectedAuthMethod('All'); setModuleFilter('authMethod', 'All'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6d28d9' }}>✕</button>
              </span>
            )}

            {effectiveLockState !== 'All' && (
              <span style={{
                background: '#ffedd5', color: '#c2410c', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Lock: {effectiveLockState}</span>
                <button onClick={() => { setSelectedLockState('All'); setModuleFilter('lockState', 'All'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c2410c' }}>✕</button>
              </span>
            )}

            {effectiveSecurityLevel !== 'All' && (
              <span style={{
                background: '#f1f5f9', color: '#334155', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Security Level: {effectiveSecurityLevel}</span>
                <button onClick={() => { setSelectedSecurityLevel('All'); setModuleFilter('securityLevel', 'All'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155' }}>✕</button>
              </span>
            )}

            {effectiveAccessType !== 'All' && (
              <span style={{
                background: '#ecfdf5', color: '#047857', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Type: {effectiveAccessType}</span>
                <button onClick={() => { setSelectedAccessType('All'); setModuleFilter('accessType', 'All'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#047857' }}>✕</button>
              </span>
            )}

            {effectiveSeverity !== 'All Severities' && effectiveSeverity !== 'All' && (
              <span style={{
                background: '#fef3c7', color: '#b45309', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Severity: {effectiveSeverity}</span>
                <button onClick={() => { setSelectedSeverity('All Severities'); setModuleFilter('severity', 'All'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b45309' }}>✕</button>
              </span>
            )}

            {selectedReader !== 'All Readers' && (
              <span style={{
                background: '#f1f5f9', color: '#334155', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Reader: {selectedReader}</span>
                <button onClick={() => setSelectedReader('All Readers')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155' }}>✕</button>
              </span>
            )}

            {selectedEventType !== 'all' && (
              <span style={{
                background: '#ccfbf1', color: '#0f766e', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Event: {SECURITY_EVENT_TYPES.find(t => t.id === selectedEventType)?.label || selectedEventType}</span>
                <button onClick={() => setSelectedEventType('all')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f766e' }}>✕</button>
              </span>
            )}

            {selectedRestrictedArea !== 'All Areas' && (
              <span style={{
                background: '#ede9fe', color: '#5b21b6', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Area: {selectedRestrictedArea}</span>
                <button onClick={() => setSelectedRestrictedArea('All Areas')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5b21b6' }}>✕</button>
              </span>
            )}

            {selectedDenialReason !== 'All Reasons' && (
              <span style={{
                background: '#fee2e2', color: '#b91c1c', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Reason: {selectedDenialReason}</span>
                <button onClick={() => setSelectedDenialReason('All Reasons')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}>✕</button>
              </span>
            )}

            {searchQuery && (
              <span style={{
                background: '#fff1f2', color: '#be123c', fontSize: 11, fontWeight: 700,
                padding: '3px 8px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 5
              }}>
                <span>Search: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#be123c' }}>✕</button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              style={{
                background: 'none', border: 'none', color: '#dc2626',
                fontSize: 11, fontWeight: 800, textDecoration: 'underline',
                cursor: 'pointer', padding: '2px 6px'
              }}
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* ─── TAB 1: REAL-TIME SECURITY EVENTS ENGINE ─── */}
      {activeTab === 'events' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Quick Counter Badges for 15 Specified Event Categories */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10,
            padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                15 Real-Time Security Event Telemetry Channels
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                Click any channel chip below to filter live stream
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SECURITY_EVENT_TYPES.map(cat => {
                const isSelected = selectedEventType === cat.id;
                const count = eventChannelCounts[cat.id] ?? 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedEventType(isSelected && cat.id !== 'all' ? 'all' : cat.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '5px 10px', borderRadius: 6, fontSize: 11.5,
                      fontWeight: isSelected ? 800 : 600,
                      background: isSelected ? cat.color : cat.bg,
                      color: isSelected ? '#ffffff' : cat.color,
                      border: isSelected ? `1px solid ${cat.color}` : '1px solid rgba(0,0,0,0.06)',
                      cursor: 'pointer', transition: 'all 0.14s ease'
                    }}
                  >
                    <span>{cat.label}</span>
                    <span style={{
                      fontSize: 10,
                      background: isSelected ? 'rgba(255,255,255,0.25)' : '#ffffff',
                      color: isSelected ? '#ffffff' : cat.color,
                      padding: '1px 6px',
                      borderRadius: 8,
                      fontWeight: 800,
                      border: isSelected ? 'none' : '1px solid rgba(0,0,0,0.08)'
                    }}>
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Stream Table */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  Live Event Stream ({filteredEvents.length} Matched)
                </span>
                {selectedEventType !== 'all' && (
                  <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                    Channel: {selectedEventType}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b' }}>
                Displaying Page {currentPage} of {totalPages}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '9px 12px', fontWeight: 700 }}>Date & Time</th>
                    <th style={{ padding: '9px 12px', fontWeight: 700 }}>Event Type</th>
                    <th style={{ padding: '9px 12px', fontWeight: 700 }}>Branch & Location</th>
                    <th style={{ padding: '9px 12px', fontWeight: 700 }}>Door / Portal</th>
                    <th style={{ padding: '9px 12px', fontWeight: 700 }}>Staff / Identity</th>
                    <th style={{ padding: '9px 12px', fontWeight: 700 }}>Reader Hardware</th>
                    <th style={{ padding: '9px 12px', fontWeight: 700 }}>Result</th>
                    <th style={{ padding: '9px 12px', fontWeight: 700 }}>Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedList.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#475569' }}>No security events match the current filter criteria</div>
                        <div style={{ fontSize: 11, marginTop: 4 }}>Try clearing active filters or widening the date/division criteria.</div>
                        <button
                          onClick={handleResetFilters}
                          style={{ marginTop: 12, background: '#0f766e', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map(evt => (
                      <tr
                        key={evt.eventId}
                        onClick={() => setSelectedDetailEvent(evt)}
                        title={`Click to view detailed security forensics & access pathway for ${evt.eventId}`}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = evt.result === 'Denied' ? '#fee2e2' : '#f0fdfa'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{evt.time}</div>
                          <div style={{ fontSize: 10, color: '#64748b' }}>{evt.date}</div>
                        </td>
                        <td style={{ padding: '9px 12px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            fontSize: 11, fontWeight: 700, color: evt.badgeColor
                          }}>
                            <span>{evt.eventType}</span>
                          </span>
                        </td>
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{evt.branch}</div>
                          <div style={{ fontSize: 10.5, color: '#64748b' }}>{evt.division} Division</div>
                        </td>
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{ fontWeight: 600, color: '#0f766e' }}>{evt.doorName}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{evt.door}</div>
                        </td>
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{evt.employeeName}</div>
                          <div style={{ fontSize: 10.5, color: '#64748b' }}>{evt.employeeId} · {evt.role}</div>
                        </td>
                        <td style={{ padding: '9px 12px', color: '#475569' }}>{evt.reader}</td>
                        <td style={{ padding: '9px 12px' }}>
                          <span style={{
                            fontSize: 10.5, fontWeight: 800,
                            background: evt.result === 'Granted' ? '#dcfce7' : (evt.result === 'Denied' ? '#fee2e2' : '#fef3c7'),
                            color: evt.result === 'Granted' ? '#15803d' : (evt.result === 'Denied' ? '#b91c1c' : '#b45309'),
                            padding: '2px 8px', borderRadius: 10
                          }}>
                            {evt.result}
                          </span>
                        </td>
                        <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: '#64748b' }}>{evt.latency}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#475569' }}>
                  <span>Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={e => setPageSize(Number(e.target.value))}
                    style={{ padding: '3px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 11, background: '#fff' }}
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>
                    Showing {Math.min(totalItems, (currentPage - 1) * pageSize + 1)} to {Math.min(totalItems, currentPage * pageSize)} of {totalItems} records
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    style={{
                      padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1',
                      background: currentPage === 1 ? '#f1f5f9' : '#fff',
                      color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                      fontSize: 11, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >« First</button>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    style={{
                      padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1',
                      background: currentPage === 1 ? '#f1f5f9' : '#fff',
                      color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                      fontSize: 11, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >‹ Prev</button>
                  <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#0f766e' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    style={{
                      padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1',
                      background: currentPage === totalPages ? '#f1f5f9' : '#fff',
                      color: currentPage === totalPages ? '#94a3b8' : '#0f172a',
                      fontSize: 11, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >Next ›</button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    style={{
                      padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1',
                      background: currentPage === totalPages ? '#f1f5f9' : '#fff',
                      color: currentPage === totalPages ? '#94a3b8' : '#0f172a',
                      fontSize: 11, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >Last »</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: RESTRICTED AREA / HIGH-SECURITY ACCESS REPORT (SECTION 15) ─── */}
      {activeTab === 'restricted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Section 15 Requirement Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
            borderRadius: 10, padding: '16px 20px', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>
                15. Restricted Area / High-Security Access Report
              </div>
              <div style={{ fontSize: 11.5, opacity: 0.9, marginTop: 3 }}>
                Tender Mandate: Dedicated governance identifying exactly who accessed sensitive bank areas, date, time, reader hardware, and clearance result.
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
              10 Sensitive Areas Monitored 24/7
            </div>
          </div>

          {/* 10 Sensitive Bank Area Pills + Dual-Custody Sub-Filter */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10
          }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginRight: 4 }}>
                10 SENSITIVE AREAS:
              </span>
              <button
                onClick={() => setSelectedRestrictedArea('All Areas')}
                style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: selectedRestrictedArea === 'All Areas' ? '#4338ca' : '#f8fafc',
                  color: selectedRestrictedArea === 'All Areas' ? '#fff' : '#334155',
                  border: '1px solid #cbd5e1', cursor: 'pointer'
                }}
              >
                All 10 Areas
              </button>
              {RESTRICTED_AREAS.map(area => (
                <button
                  key={area}
                  onClick={() => setSelectedRestrictedArea(selectedRestrictedArea === area ? 'All Areas' : area)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: selectedRestrictedArea === area ? '#4338ca' : '#f8fafc',
                    color: selectedRestrictedArea === area ? '#fff' : '#334155',
                    border: selectedRestrictedArea === area ? '1px solid #4338ca' : '1px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  {area}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', paddingTop: 6, borderTop: '1px dashed #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Dual Custody Mode:</span>
                <select
                  value={selectedDualCustody}
                  onChange={e => setSelectedDualCustody(e.target.value)}
                  style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 11 }}
                >
                  <option value="All">All Modes</option>
                  <option value="Dual-Custody Enforced">Dual-Custody Enforced Only</option>
                  <option value="Single Biometric">Single Biometric Only</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Clearance Tier:</span>
                <select
                  value={selectedClearanceTier}
                  onChange={e => setSelectedClearanceTier(e.target.value)}
                  style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 11 }}
                >
                  <option value="All">All Tiers</option>
                  <option value="Level 5 (Maximum)">Level 5 (Maximum - Vault & SWIFT)</option>
                  <option value="Level 4 (High Security)">Level 4 (High Security)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 15 Report Table */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                Restricted High-Security Audit Log ({filteredRestricted.length} Records)
              </span>
              <div style={{ fontSize: 11.5, color: '#64748b' }}>
                Page {currentPage} of {totalPages}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Employee</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Access Area</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Branch & Division</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Time</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Reader</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Result</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Access Group</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Dual Custody / Clearance</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedList.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No restricted area records match the current filter selection.
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map(r => (
                      <tr
                        key={r.logId}
                        onClick={() => setSelectedDetailEvent(r)}
                        title={`Click to view detailed restricted area access audit & pathway for ${r.logId}`}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = r.result === 'Denied' ? '#fee2e2' : '#f0fdfa'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{r.employeeName}</div>
                          <div style={{ fontSize: 10.5, color: '#0284c7' }}>{r.employeeId}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            background: '#e0e7ff', color: '#3730a3',
                            padding: '3px 9px', borderRadius: 6, fontWeight: 700, fontSize: 11
                          }}>
                            {r.accessArea}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.branch}</div>
                          <div style={{ fontSize: 10.5, color: '#64748b' }}>{r.division} Division</div>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#64748b' }}>{r.date}</td>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{r.time}</td>
                        <td style={{ padding: '10px 14px', color: '#475569' }}>{r.reader}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            fontSize: 10.5, fontWeight: 800,
                            background: r.result === 'Granted' ? '#dcfce7' : '#fee2e2',
                            color: r.result === 'Granted' ? '#15803d' : '#b91c1c',
                            padding: '2px 8px', borderRadius: 10
                          }}>
                            {r.result}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#334155', fontWeight: 600 }}>{r.accessGroup}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: r.dualCustody.includes('Enforced') ? '#16a34a' : '#475569' }}>
                            {r.dualCustody}
                          </div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>{r.clearanceTier}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10
              }}>
                <span style={{ fontSize: 11.5, color: '#475569' }}>
                  Showing {Math.min(totalItems, (currentPage - 1) * pageSize + 1)} to {Math.min(totalItems, currentPage * pageSize)} of {totalItems} records
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', fontSize: 11, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >‹ Prev</button>
                  <span style={{ padding: '4px 8px', fontSize: 11, fontWeight: 700 }}>Page {currentPage} of {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', fontSize: 11, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >Next ›</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: PRIVILEGED / VIP ACCESS REPORT (SECTION 16) ──── */}
      {activeTab === 'vip' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Section 16 Requirement Header */}
          <div style={{
            background: 'linear-gradient(135deg, #78350f 0%, #b45309 60%, #d97706 100%)',
            borderRadius: 10, padding: '16px 20px', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>
                16. Privileged / VIP Access Report
              </div>
              <div style={{ fontSize: 11.5, opacity: 0.9, marginTop: 3 }}>
                Dedicated audit governance for CEO/MD Area, Board Room, Executive Floors, Data Center, Treasury, Vault, and Central SOC.
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
              Strict Executive Governance
            </div>
          </div>

          {/* Privileged Areas Filter */}
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '10px 14px', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center'
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginRight: 4 }}>
              PRIVILEGED FACILITY:
            </span>
            <button
              onClick={() => setSelectedPrivilegedArea('All Privileged Areas')}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: selectedPrivilegedArea === 'All Privileged Areas' ? '#b45309' : '#f8fafc',
                color: selectedPrivilegedArea === 'All Privileged Areas' ? '#fff' : '#334155',
                border: '1px solid #cbd5e1', cursor: 'pointer'
              }}
            >
              All Privileged Areas
            </button>
            {PRIVILEGED_AREAS.map(p => (
              <button
                key={p}
                onClick={() => setSelectedPrivilegedArea(selectedPrivilegedArea === p ? 'All Privileged Areas' : p)}
                style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: selectedPrivilegedArea === p ? '#b45309' : '#f8fafc',
                  color: selectedPrivilegedArea === p ? '#fff' : '#334155',
                  border: selectedPrivilegedArea === p ? '1px solid #b45309' : '1px solid #cbd5e1',
                  cursor: 'pointer'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Section 16 VIP Access Table */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                Executive & Privileged Access Registry ({filteredPrivileged.length} VIP Audits)
              </span>
              <div style={{ fontSize: 11.5, color: '#64748b' }}>
                Page {currentPage} of {totalPages}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Executive Official</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Corporate Role</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Privileged Facility</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Specific Suite / Room</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Entry Time</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Exit Time</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Auth Modality</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Escort / Dual Custody</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedList.length === 0 ? (
                    <tr>
                      <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No privileged access records match the current filter selection.
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map(v => (
                      <tr
                        key={v.vipId}
                        onClick={() => setSelectedDetailEvent(v)}
                        title={`Click to view detailed privileged VIP access forensics & pathway for ${v.vipId}`}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fefce8'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{v.employeeName}</div>
                          <div style={{ fontSize: 10, color: '#0284c7' }}>{v.employeeId}</div>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#334155' }}>
                          {v.executiveRole}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            background: '#fef3c7', color: '#92400e',
                            padding: '3px 9px', borderRadius: 6, fontWeight: 700, fontSize: 11
                          }}>
                            {v.privilegedFacility}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#475569' }}>{v.specificRoom}</td>
                        <td style={{ padding: '10px 14px', color: '#64748b' }}>{v.date}</td>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#059669' }}>{v.entryTime}</td>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#64748b' }}>{v.exitTime}</td>
                        <td style={{ padding: '10px 14px', color: '#475569' }}>{v.authModality}</td>
                        <td style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: v.escortRequired.includes('Yes') ? '#b45309' : '#64748b' }}>
                          {v.escortRequired}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 10, fontWeight: 800, fontSize: 10.5 }}>
                            ✓ {v.auditStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10
              }}>
                <span style={{ fontSize: 11.5, color: '#475569' }}>
                  Showing {Math.min(totalItems, (currentPage - 1) * pageSize + 1)} to {Math.min(totalItems, currentPage * pageSize)} of {totalItems} records
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', fontSize: 11, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >‹ Prev</button>
                  <span style={{ padding: '4px 8px', fontSize: 11, fontWeight: 700 }}>Page {currentPage} of {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', fontSize: 11, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >Next ›</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: ACCESS DENIED REPORT & ANALYTICS (SECTION 17) ─── */}
      {activeTab === 'denied' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Section 17 Requirement Header */}
          <div style={{
            background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 60%, #dc2626 100%)',
            borderRadius: 10, padding: '16px 20px', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>
                17. Access Denied Report & Multi-Dimensional Security Analytics
              </div>
              <div style={{ fontSize: 11.5, opacity: 0.9, marginTop: 3 }}>
                One of the most critical physical security reports: Tracks unauthorized attempts by reason, user, door, branch, and peak hours.
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 6, fontSize: 11.5, fontWeight: 800 }}>
              {filteredDenied.length} Denials Intercepted · Real-Time Shield
            </div>
          </div>

          {/* 5 Analytics Cards (Top denied users, doors, branches, by time, by reason) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            {/* Analytics 1: Top Denied Users */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                Top Denied Users
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {deniedAnalytics.topUsers.length === 0 ? (
                  <div style={{ fontSize: 11, color: '#94a3b8', padding: '12px 0' }}>No users match filter criteria</div>
                ) : (
                  deniedAnalytics.topUsers.map((u, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '6px 10px', borderRadius: 6, fontSize: 11 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{u.branch} · {u.reason}</div>
                      </div>
                      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>
                        {u.count} Denials
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Analytics 2: Top Denied Doors */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                Top Denied Doors
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {deniedAnalytics.topDoors.length === 0 ? (
                  <div style={{ fontSize: 11, color: '#94a3b8', padding: '12px 0' }}>No doors match filter criteria</div>
                ) : (
                  deniedAnalytics.topDoors.map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '6px 10px', borderRadius: 6, fontSize: 11 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.door}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{d.branch} ({d.id})</div>
                      </div>
                      <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>
                        {d.count} Denials
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Analytics 3: Top Denied Branches */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                Top Denied Branches
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {deniedAnalytics.topBranches.length === 0 ? (
                  <div style={{ fontSize: 11, color: '#94a3b8', padding: '12px 0' }}>No branches match filter criteria</div>
                ) : (
                  deniedAnalytics.topBranches.map((b, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '6px 10px', borderRadius: 6, fontSize: 11 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.branch}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{b.division} Division</div>
                      </div>
                      <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>
                        {b.count} ({b.percentage})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Analytics 4: Denied Access by Time */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                Denied Access by Time
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {deniedAnalytics.timeBuckets.map((t, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 700 }}>
                      <span style={{ color: t.highlight ? '#dc2626' : '#334155' }}>{t.time} ({t.label})</span>
                      <span style={{ color: t.highlight ? '#dc2626' : '#64748b' }}>{t.count} Denials</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: t.barWidth, height: '100%', background: t.highlight ? '#dc2626' : '#0d9488', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics 5: Denied Access by Reason */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', gridColumn: 'span 2' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                Denied Access by Reason (8 Specified Reasons)
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {deniedAnalytics.reasonBreakdown.map((r, i) => (
                  <div key={i} style={{ flex: 1, minWidth: 140, background: '#f8fafc', border: `1px solid ${r.color}33`, borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>{r.reason}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: r.color, marginTop: 2 }}>{r.count}</div>
                    <div style={{ fontSize: 10, color: r.color, fontWeight: 700 }}>{r.pct} of Total</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 17 Denied Event Table with 8 Reason Filters */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginRight: 4 }}>
                8 DENIAL REASONS:
              </span>
              <button
                onClick={() => setSelectedDenialReason('All Reasons')}
                style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: selectedDenialReason === 'All Reasons' ? '#dc2626' : '#ffffff',
                  color: selectedDenialReason === 'All Reasons' ? '#fff' : '#334155',
                  border: '1px solid #cbd5e1', cursor: 'pointer'
                }}
              >
                All 8 Reasons
              </button>
              {DENIAL_REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => setSelectedDenialReason(selectedDenialReason === reason ? 'All Reasons' : reason)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: selectedDenialReason === reason ? '#dc2626' : '#ffffff',
                    color: selectedDenialReason === reason ? '#fff' : '#334155',
                    border: selectedDenialReason === reason ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Date & Time</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>User / Identity</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Door Name</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Branch Location</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Denial Reason</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Reader Hardware</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedList.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No denied access events match current filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map(d => (
                      <tr
                        key={d.id}
                        onClick={() => setSelectedDetailEvent(d)}
                        title={`Click to view detailed access denied forensics & pathway for ${d.id}`}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#dc2626' }}>{d.time}</div>
                          <div style={{ fontSize: 10, color: '#64748b' }}>{d.date}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{d.name}</div>
                          <div style={{ fontSize: 10, color: '#0284c7' }}>{d.userId}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#334155' }}>{d.door}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{d.doorId}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.branch}</div>
                          <div style={{ fontSize: 10.5, color: '#64748b' }}>{d.division} Division</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            background: '#fee2e2', color: '#b91c1c',
                            padding: '3px 9px', borderRadius: 6, fontWeight: 700, fontSize: 11
                          }}>
                            {d.reason}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#475569' }}>{d.reader}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 10, fontWeight: 800, fontSize: 10.5 }}>
                            Intercepted
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10
              }}>
                <span style={{ fontSize: 11.5, color: '#475569' }}>
                  Showing {Math.min(totalItems, (currentPage - 1) * pageSize + 1)} to {Math.min(totalItems, currentPage * pageSize)} of {totalItems} records
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', fontSize: 11, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >‹ Prev</button>
                  <span style={{ padding: '4px 8px', fontSize: 11, fontWeight: 700 }}>Page {currentPage} of {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', fontSize: 11, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >Next ›</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Event / Forensic Audit Dossier Modal */}
      {selectedDetailEvent && (
        <SecurityEventDetailModal
          event={selectedDetailEvent}
          onClose={() => setSelectedDetailEvent(null)}
        />
      )}
    </div>
  );
}
