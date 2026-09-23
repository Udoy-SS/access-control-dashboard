/**
 * CentralAuditTrailHub.jsx — Central Audit Trail & Compliance Hub
 * Pubali Bank PLC · Suprema BioStar X Enterprise
 * 
 * Complies with Bangladesh Bank ICT Security Guideline (ICT-08)
 * 
 * Sub-Tabs:
 * 1. User & Admin Audit Trail (Biometric enrollment, permission modifications, door overrides, shift alterations)
 * 2. High-Security Vault Audit (Cash Vault, Server Room, SWIFT Room & Treasury access logs)
 * 3. Door-by-Door Movement Trail (Sequential employee breadcrumb trail across access points)
 * 4. Branch Transfer History (Inter-branch transfer biometric shift logs across 829 branches)
 */

import React, { useState, useMemo, useEffect } from 'react';
import RestrictedZoneAccessLog from './RestrictedZoneAccessLog';
import EmployeeMovementTrail from './EmployeeMovementTrail';

// ─── SAMPLE ATTENDANCE CORRECTION AUDIT LOGS ──────────────────────────────
const INITIAL_ATTENDANCE_CORRECTIONS = [
  {
    id: 'CORR-ATT-2026-045',
    timestamp: '2026-09-20 09:42:15',
    empId: 'PB-09204',
    empName: 'Tariqul Islam',
    designation: 'Senior Executive Officer',
    branch: 'Principal Branch, Motijheel',
    shift: 'General Banking (08:30–18:30)',
    origPunch: '09:35 AM (Late +65m)',
    adjustedPunch: '08:30 AM (On Time)',
    source: 'Branch In-Charge Deputation',
    sourceType: 'branch-in-charge',
    reason: 'Bangladesh Bank Clearing House Deputation & High-Value Cash Transit Escort',
    authBy: 'Pending Regional DGM Approval',
    authDocRef: 'PB/MOT/OUT-2026/112',
    status: 'Pending Review'
  },
  {
    id: 'CORR-ATT-2026-044',
    timestamp: '2026-09-20 09:18:22',
    empId: 'PB-10512',
    empName: 'Sadia Sultana',
    designation: 'Cash Officer',
    branch: 'Dhanmondi Branch',
    shift: 'General Banking (08:30–18:30)',
    origPunch: '— (Missed In-Punch)',
    adjustedPunch: '08:32 AM (Grace Period)',
    source: 'Auto-Flagged: Exception Hub',
    sourceType: 'auto-exception',
    reason: 'BioStation 3 Optical Sensor Timeout during morning peak queue (Terminal Log #DEV-0142-01)',
    authBy: 'Pending BM Review',
    authDocRef: 'DHN/ATT/SENS-2026/044',
    status: 'Pending Review'
  },
  {
    id: 'CORR-ATT-2026-043',
    timestamp: '2026-09-19 16:45:00',
    empId: 'PB-08144',
    empName: 'Anwar Hossain',
    designation: 'Foreign Trade Officer',
    branch: 'Gulshan Corporate Branch',
    shift: 'Corporate Banking (09:00–19:00)',
    origPunch: '09:50 AM (Late +50m)',
    adjustedPunch: '08:58 AM (On Time)',
    source: 'Branch Manager Deputation',
    sourceType: 'branch-in-charge',
    reason: 'Customs Bonded Warehouse Clearing & LC Document Verification at ICD Kamalapur',
    authBy: 'Pending HR Operations Review',
    authDocRef: 'GCB/TRADE/2026/077',
    status: 'Pending Review'
  },
  {
    id: 'CORR-ATT-2026-042',
    timestamp: '2026-09-19 14:12:30',
    empId: 'PB-11002',
    empName: 'Farhana Yeasmin',
    designation: 'Junior Officer',
    branch: 'Agrabad Branch, Chattogram',
    shift: 'General Banking (08:30–18:30)',
    origPunch: '— (Missed Out-Punch)',
    adjustedPunch: '18:45 PM (Shift End)',
    source: 'Employee Regularization Slip',
    sourceType: 'self-service',
    reason: 'SWIFT End-of-Day Batch Execution with Operations Head',
    authBy: 'Pending Supervisor Review',
    authDocRef: 'AGR/EOD/2026/091',
    status: 'Pending Review'
  },
  {
    id: 'CORR-ATT-2026-041',
    timestamp: '2026-09-17 11:24:10',
    empId: 'PB-10492',
    empName: 'Md. Kamrul Hasan',
    designation: 'Senior Principal Officer',
    branch: 'Motijheel Corporate Branch',
    shift: 'General Banking (08:30–18:30)',
    origPunch: '09:44 AM (Late +59m)',
    adjustedPunch: '08:28 AM (On Time)',
    source: 'Auto-Flagged: Exception Hub',
    sourceType: 'auto-exception',
    reason: 'Biometric Terminal Sensor Timeout at Entrance Gate',
    authBy: 'Farzana Yasmin (Branch Manager)',
    authDocRef: 'MCB/ATT/CORR-2026/089',
    status: 'Approved'
  },
  {
    id: 'CORR-ATT-2026-040',
    timestamp: '2026-09-17 10:15:33',
    empId: 'PB-08412',
    empName: 'Tanzeem Ahmed',
    designation: 'Executive Cash Officer',
    branch: 'Gulshan Corporate Branch',
    shift: 'General Banking (08:30–18:30)',
    origPunch: '— (Missed In-Punch)',
    adjustedPunch: '08:32 AM (Grace Period)',
    source: 'Branch In-Charge Deputation',
    sourceType: 'branch-in-charge',
    reason: 'Inter-branch Cash Delivery Transit Duty',
    authBy: 'Kabir Hossain (DGM Operations)',
    authDocRef: 'GCB/OPS/DUTY-2026/142',
    status: 'Approved'
  },
  {
    id: 'CORR-ATT-2026-039',
    timestamp: '2026-09-16 17:42:08',
    empId: 'PB-11204',
    empName: 'Nusrat Jahan',
    designation: 'Junior Officer',
    branch: 'Agrabad Branch, Chattogram',
    shift: 'General Banking (08:30–18:30)',
    origPunch: '10:12 AM (Late +87m)',
    adjustedPunch: 'Retained 10:12 AM (No change)',
    source: 'Employee Regularization Slip',
    sourceType: 'self-service',
    reason: 'Personal delay claimed as transport fault without supporting transport ticket',
    authBy: 'Audit Compliance Disallowed',
    authDocRef: 'AUD/DIS/2026/019',
    status: 'Rejected'
  },
  {
    id: 'CORR-ATT-2026-038',
    timestamp: '2026-09-16 14:10:55',
    empId: 'PB-09311',
    empName: 'Sufian Mahmud',
    designation: 'Network Engineer',
    branch: 'Principal Branch, Dhaka',
    shift: 'Head Office Shift (09:00–19:00)',
    origPunch: '— (Missed Out-Punch)',
    adjustedPunch: '19:15 PM (Shift Completed)',
    source: 'IT Infrastructure / Power Outage',
    sourceType: 'auto-exception',
    reason: 'Power failure during server room UPS maintenance',
    authBy: 'Tariqul Rahman (Head of IT)',
    authDocRef: 'HO/IT/PWR-2026/502',
    status: 'Approved'
  },
  {
    id: 'CORR-ATT-2026-037',
    timestamp: '2026-09-15 16:30:19',
    empId: 'PB-07119',
    empName: 'Rokeya Begum',
    designation: 'Foreign Exchange Officer',
    branch: 'Sylhet Regional Branch',
    shift: 'General Banking (08:30–18:30)',
    origPunch: '09:35 AM (Late)',
    adjustedPunch: '08:30 AM (On Time)',
    source: 'Branch In-Charge Deputation',
    sourceType: 'branch-in-charge',
    reason: 'Bangladesh Bank Clearing House Outdoor Deputation',
    authBy: 'M. A. Matin (Regional Head)',
    authDocRef: 'SYL/CLR/OUT-2026/088',
    status: 'Approved'
  }
];

// ─── SAMPLE ADMIN AUDIT LOGS ─────────────────────────────────────────────
const INITIAL_ADMIN_AUDIT_LOGS = [
  {
    id: 'AUD-ADM-2026-0941',
    timestamp: '2026-09-15 14:18:22',
    timeAgo: '12m ago',
    adminName: 'Tanvir Ahmed Chowdhury',
    adminId: 'HO-SEC-004',
    adminRole: 'Chief Information Security Officer (CISO)',
    adminBranch: 'Head Office (Principal)',
    actionType: 'Dual Custody Assigned',
    actionBadge: 'amber',
    targetEntity: 'Md. Kamrul Hasan (EMP-PB-10492)',
    targetType: 'User Credential',
    targetBranch: 'Motijheel Corporate Branch',
    details: 'Elevated security clearance to Level-4 Dual Custody for Main Cash Vault access.',
    authRef: 'HO/HRD/AUTH-2026/0892',
    ipAddress: '10.14.8.42',
    terminalId: 'BS3-HO-C01',
    status: 'Verified & Synced',
    hashChecksum: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
  },
  {
    id: 'AUD-ADM-2026-0940',
    timestamp: '2026-09-15 13:45:10',
    timeAgo: '45m ago',
    adminName: 'Farzana Yasmin',
    adminId: 'BM-0182',
    adminRole: 'Branch Manager',
    adminBranch: 'Gulshan Branch, Dhaka',
    actionType: 'Biometric Enrolled',
    actionBadge: 'green',
    targetEntity: 'Nusrat Jahan (PB-09204)',
    targetType: 'User Biometric',
    targetBranch: 'Gulshan Branch, Dhaka',
    details: 'Enrolled 2 Fingerprint templates (Right Index + Left Thumb) on BioStation 3.',
    authRef: 'GLS/BIO/ENR-2026/041',
    ipAddress: '10.22.4.19',
    terminalId: 'BS3-GLS-01',
    status: 'Verified & Synced',
    hashChecksum: 'sha256:9c41a2083b05f631210884d6738914b1897c5e2194cf38910a427f884a1e9442'
  },
  {
    id: 'AUD-ADM-2026-0939',
    timestamp: '2026-09-15 12:30:05',
    timeAgo: '2h ago',
    adminName: 'Md. Ashraful Islam',
    adminId: 'HO-SYS-001',
    adminRole: 'Central Biometric Administrator',
    adminBranch: 'Head Office (Principal)',
    actionType: 'Emergency Door Override',
    actionBadge: 'red',
    targetEntity: 'Door Relay DOR-PB-1048 (Server Room DC-1)',
    targetType: 'Door Controller',
    targetBranch: 'Head Office (Principal)',
    details: 'Triggered manual 15-minute emergency unlock for Scheduled Fire Suppression Maintenance.',
    authRef: 'SOC/OVR/2026-088',
    ipAddress: '10.14.8.12',
    terminalId: 'CORE-SRV-RELAY-01',
    status: 'Verified & Synced',
    hashChecksum: 'sha256:3d28fa19e84b0292819842aef912093e98124982a1d098e98214fa8912389102'
  },
  {
    id: 'AUD-ADM-2026-0938',
    timestamp: '2026-09-15 11:15:40',
    timeAgo: '3h ago',
    adminName: 'Kazi Mohammad Tareq',
    adminId: 'REG-CTG-002',
    adminRole: 'Regional IT In-Charge',
    adminBranch: 'Chattogram Regional Office',
    actionType: 'Access Group Changed',
    actionBadge: 'blue',
    targetEntity: 'Access Group: AGR-VAULT-OFFICERS',
    targetType: 'Access Group',
    targetBranch: 'Agrabad Corporate Branch',
    details: 'Added 2 senior cash officers to 24/7 dual-vault access tier after quarterly rotation.',
    authRef: 'CTG/REG/ROT-2026/119',
    ipAddress: '10.31.2.14',
    terminalId: 'FS2-AGR-02',
    status: 'Verified & Synced',
    hashChecksum: 'sha256:6e18f92109823901bcae81293091248091234890123849012893012938102938'
  },
  {
    id: 'AUD-ADM-2026-0937',
    timestamp: '2026-09-15 10:04:18',
    timeAgo: '4h ago',
    adminName: 'Sultana Razia',
    adminId: 'BM-0311',
    adminRole: 'Branch Manager',
    adminBranch: 'Sylhet Main Branch',
    actionType: 'RFID Card Replaced',
    actionBadge: 'purple',
    targetEntity: 'Syed Mahbubur Rahman (PB-09315)',
    targetType: 'Smart Card',
    targetBranch: 'Sylhet Main Branch',
    details: 'Revoked damaged card CSN-4192:PB and assigned new Mifare Plus Card CSN-9941:PB.',
    authRef: 'SYL/CRD/REP-2026/092',
    ipAddress: '10.45.6.8',
    terminalId: 'BS3-SYL-01',
    status: 'Verified & Synced',
    hashChecksum: 'sha256:12984abce9102830192830192830192849018239018290381092830192830192'
  },
  {
    id: 'AUD-ADM-2026-0936',
    timestamp: '2026-09-15 09:30:00',
    timeAgo: '5h ago',
    adminName: 'Md. Ashraful Islam',
    adminId: 'HO-SYS-001',
    adminRole: 'Central Biometric Administrator',
    adminBranch: 'Head Office (Principal)',
    actionType: 'Biometric Revoked',
    actionBadge: 'red',
    targetEntity: 'Rezaul Karim (PB-08819)',
    targetType: 'User Biometric',
    targetBranch: 'Uttara Branch, Dhaka',
    details: 'Revoked all door permissions & biometric templates upon formal retirement.',
    authRef: 'PB-HO/HRD/RET-2026/012',
    ipAddress: '10.14.8.12',
    terminalId: 'CORE-BIO-GATEWAY',
    status: 'Verified & Synced',
    hashChecksum: 'sha256:4a71b29012938102938102938109238109238109238109238109238109238109'
  },
  {
    id: 'AUD-ADM-2026-0935',
    timestamp: '2026-09-15 08:50:12',
    timeAgo: '5h ago',
    adminName: 'Mohammad Moinuddin',
    adminId: 'BM-0094',
    adminRole: 'Branch Manager',
    adminBranch: 'Dhanmondi Branch, Dhaka',
    actionType: 'Shift Schedule Modified',
    actionBadge: 'teal',
    targetEntity: 'Shift: DHN-CASH-MORNING',
    targetType: 'Shift Policy',
    targetBranch: 'Dhanmondi Branch, Dhaka',
    details: 'Extended morning shift grace buffer from 10 mins to 15 mins during rainy weather.',
    authRef: 'DHN/ADM/SFT-2026/018',
    ipAddress: '10.22.9.33',
    terminalId: 'BS3-DHN-01',
    status: 'Verified & Synced',
    hashChecksum: 'sha256:a18b209128309182309182093810923810928301928301928301928301928301'
  },
  {
    id: 'AUD-ADM-2026-0934',
    timestamp: '2026-09-14 17:40:55',
    timeAgo: '1d ago',
    adminName: 'Tanvir Ahmed Chowdhury',
    adminId: 'HO-SEC-004',
    adminRole: 'Chief Information Security Officer (CISO)',
    adminBranch: 'Head Office (Principal)',
    actionType: 'Terminal Re-sync Triggered',
    actionBadge: 'blue',
    targetEntity: 'Terminal PB-DEV-1092 (Bogura Branch)',
    targetType: 'Device Controller',
    targetBranch: 'Bogura Branch, Rajshahi',
    details: 'Pushed central biometric user directory re-hash to resolve 2 template discrepancies.',
    authRef: 'HO/ICT/SYNC-2026/410',
    ipAddress: '10.14.8.42',
    terminalId: 'CORE-DISPATCHER-01',
    status: 'Verified & Synced',
    hashChecksum: 'sha256:b291028309182093810928301928301928301928301928301928301928301928'
  },
  {
    id: 'AUD-ADM-2026-0933',
    timestamp: '2026-09-14 16:15:20',
    timeAgo: '1d ago',
    adminName: 'Farhana Akhter',
    adminId: 'BM-0421',
    adminRole: 'Branch Manager',
    adminBranch: 'Khulna Main Branch',
    actionType: 'Biometric Enrolled',
    actionBadge: 'green',
    targetEntity: 'Md. Shakil Hossain (PB-09401)',
    targetType: 'User Biometric',
    targetBranch: 'Khulna Main Branch',
    details: 'Completed biometric fingerprint registration for newly joined Probationary Officer.',
    authRef: 'KLN/HR/ENR-2026/055',
    ipAddress: '10.51.1.20',
    terminalId: 'BS3-KLN-01',
    status: 'Verified & Synced',
    hashChecksum: 'sha256:c381920381092830192830192830192830192830192830192830192830192830'
  },
  {
    id: 'AUD-ADM-2026-0932',
    timestamp: '2026-09-14 14:02:44',
    timeAgo: '1d ago',
    adminName: 'Md. Ashraful Islam',
    adminId: 'HO-SYS-001',
    adminRole: 'Central Biometric Administrator',
    adminBranch: 'Head Office (Principal)',
    actionType: 'Access Group Changed',
    actionBadge: 'blue',
    targetEntity: 'Access Group: SWIFT-OPERATORS-CENTRAL',
    targetType: 'Access Group',
    targetBranch: 'Head Office (Principal)',
    details: 'Enforced mandatory biometric + 6-digit PIN 2FA for all SWIFT Room access doors.',
    authRef: 'HO/SWIFT/SEC-2026/102',
    ipAddress: '10.14.8.12',
    terminalId: 'CORE-SWIFT-GATEWAY',
    status: 'Verified & Synced',
    hashChecksum: 'sha256:d491028301928301928301928301928301928301928301928301928301928301'
  }
];

// ─── SAMPLE BRANCH TRANSFER AUDIT RECORDS ─────────────────────────────────
const INITIAL_BRANCH_TRANSFERS = [
  {
    id: 'TR-2026-001',
    empId: 'PB-09105',
    empName: 'Ismail Hossain',
    designation: 'Senior Principal Officer',
    fromBranch: 'Dhaka Head Office (Principal)',
    fromDivision: 'Dhaka',
    toBranch: 'Agrabad Corporate Branch, Chattogram',
    toDivision: 'Chattogram',
    transferOrderNo: 'PB-HO/HRD/TR-2026/0394',
    transferDate: '2026-09-08',
    effectiveDate: '2026-09-12',
    biometricShiftStatus: 'Completed & Shifted (FP + Card)',
    oldTerminalRevocation: 'Completed (2 Terminals Revoked)',
    newTerminalPush: 'Completed (3 Terminals Pushed)',
    syncLatency: '1.2s via Central Gateway',
    authorizedBy: 'General Manager (HRD)',
    status: 'Completed'
  },
  {
    id: 'TR-2026-002',
    empId: 'PB-09112',
    empName: 'Syeda Afroza Begum',
    designation: 'First Vice President',
    fromBranch: 'Gulshan Branch, Dhaka',
    fromDivision: 'Dhaka',
    toBranch: 'Sylhet Main Branch',
    toDivision: 'Sylhet',
    transferOrderNo: 'PB-HO/HRD/TR-2026/0412',
    transferDate: '2026-09-10',
    effectiveDate: '2026-09-14',
    biometricShiftStatus: 'Completed & Shifted (FP + Card)',
    oldTerminalRevocation: 'Completed (2 Terminals Revoked)',
    newTerminalPush: 'Completed (2 Terminals Pushed)',
    syncLatency: '0.9s via Central Gateway',
    authorizedBy: 'DGM (Administration)',
    status: 'Completed'
  },
  {
    id: 'TR-2026-003',
    empId: 'PB-09144',
    empName: 'Md. Mustafizur Rahman',
    designation: 'Senior Cash Officer',
    fromBranch: 'Motijheel Corporate Branch',
    fromDivision: 'Dhaka',
    toBranch: 'Rajshahi Branch',
    toDivision: 'Rajshahi',
    transferOrderNo: 'PB-HO/HRD/TR-2026/0425',
    transferDate: '2026-09-11',
    effectiveDate: '2026-09-15',
    biometricShiftStatus: 'Completed & Shifted (FP + Card)',
    oldTerminalRevocation: 'Completed (3 Terminals Revoked)',
    newTerminalPush: 'Completed (2 Terminals Pushed)',
    syncLatency: '1.4s via Central Gateway',
    authorizedBy: 'GM (Human Resources)',
    status: 'Completed'
  },
  {
    id: 'TR-2026-004',
    empId: 'PB-09188',
    empName: 'Dr. Shahinur Alam',
    designation: 'Assistant Vice President',
    fromBranch: 'Uttara Branch, Dhaka',
    fromDivision: 'Dhaka',
    toBranch: 'Barishal Main Branch',
    toDivision: 'Barishal',
    transferOrderNo: 'PB-HO/HRD/TR-2026/0430',
    transferDate: '2026-09-13',
    effectiveDate: '2026-09-16',
    biometricShiftStatus: 'Completed & Shifted (FP + Card)',
    oldTerminalRevocation: 'Completed (2 Terminals Revoked)',
    newTerminalPush: 'Completed (2 Terminals Pushed)',
    syncLatency: '1.1s via Central Gateway',
    authorizedBy: 'Head of Operations',
    status: 'Completed'
  },
  {
    id: 'TR-2026-005',
    empId: 'PB-09210',
    empName: 'Farhana Sultana',
    designation: 'Executive Officer',
    fromBranch: 'Dhanmondi Branch, Dhaka',
    fromDivision: 'Dhaka',
    toBranch: 'Mymensingh Branch',
    toDivision: 'Mymensingh',
    transferOrderNo: 'PB-HO/HRD/TR-2026/0441',
    transferDate: '2026-09-14',
    effectiveDate: '2026-09-17',
    biometricShiftStatus: 'Scheduled Biometric Push (Pending Effective Date)',
    oldTerminalRevocation: 'Scheduled for 2026-09-17 00:00',
    newTerminalPush: 'Pre-staged on 2 Terminals',
    syncLatency: 'Ready for Push',
    authorizedBy: 'DGM (HRD)',
    status: 'Scheduled'
  },
  {
    id: 'TR-2026-006',
    empId: 'PB-09255',
    empName: 'Md. Anisur Rahman',
    designation: 'Branch Operations Manager',
    fromBranch: 'Bogura Branch',
    fromDivision: 'Rajshahi',
    toBranch: 'Rangpur Main Branch',
    toDivision: 'Rangpur',
    transferOrderNo: 'PB-HO/HRD/TR-2026/0450',
    transferDate: '2026-09-14',
    effectiveDate: '2026-09-18',
    biometricShiftStatus: 'Scheduled Biometric Push (Pending Effective Date)',
    oldTerminalRevocation: 'Scheduled for 2026-09-18 00:00',
    newTerminalPush: 'Pre-staged on 2 Terminals',
    syncLatency: 'Ready for Push',
    authorizedBy: 'General Manager (HRD)',
    status: 'Scheduled'
  }
];

// Helper: Export to CSV
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

export default function CentralAuditTrailHub({ initialTab = 'admin-audit', onNavigate, isStandalone = false }) {
  const isDedicatedView = isStandalone || (typeof window !== 'undefined' && (
    window.location.hash.includes('audit-attendance') ||
    window.location.hash.includes('audit-access') ||
    window.location.hash.includes('audit-admin')
  ));

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      if (hash.includes('tab=vault') || hash.includes('tab=vault-audit') || hash.includes('audit-access')) return 'vault-audit';
      if (hash.includes('tab=movement') || hash.includes('movement-trail')) return 'movement-trail';
      if (hash.includes('tab=transfer') || hash.includes('branch-transfers')) return 'transfer-audit';
      if (hash.includes('tab=attendance') || hash.includes('tab=attendance-audit') || hash.includes('tab=manual-adjustments') || hash.includes('audit-attendance')) return 'attendance-audit';
      if (hash.includes('audit-admin')) return 'admin-audit';
    }
    if (initialTab === 'vault' || initialTab === 'vault-audit' || initialTab === 'vault-logs') return 'vault-audit';
    if (initialTab === 'attendance-audit' || initialTab === 'manual-adjustments' || initialTab === 'audit-attendance') return 'attendance-audit';
    if (initialTab === 'movement-trail') return 'movement-trail';
    if (initialTab === 'transfer-audit') return 'transfer-audit';
    return initialTab || 'admin-audit';
  });

  // Listen to hash changes or prop changes for tab switching
  useEffect(() => {
    if (initialTab === 'vault' || initialTab === 'vault-audit' || initialTab === 'vault-logs') setActiveTab('vault-audit');
    else if (initialTab === 'attendance-audit' || initialTab === 'manual-adjustments' || initialTab === 'audit-attendance') setActiveTab('attendance-audit');
    else if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '';
      if (hash.includes('tab=vault') || hash.includes('tab=vault-audit') || hash.includes('audit-access')) setActiveTab('vault-audit');
      else if (hash.includes('tab=movement') || hash.includes('movement-trail')) setActiveTab('movement-trail');
      else if (hash.includes('tab=transfer') || hash.includes('branch-transfers')) setActiveTab('transfer-audit');
      else if (hash.includes('tab=attendance') || hash.includes('tab=attendance-audit') || hash.includes('tab=manual-adjustments') || hash.includes('audit-attendance')) setActiveTab('attendance-audit');
      else if (hash.includes('audit-admin')) setActiveTab('admin-audit');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Attendance Corrections State & Actions
  const [attCorrLogs, setAttCorrLogs] = useState(INITIAL_ATTENDANCE_CORRECTIONS);
  const [searchAttCorr, setSearchAttCorr] = useState('');
  const [filterCorrStatus, setFilterCorrStatus] = useState('All'); // 'All' | 'Pending Review' | 'Approved' | 'Rejected'
  const [filterCorrSource, setFilterCorrSource] = useState('All');
  const [isNewCorrModalOpen, setIsNewCorrModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [newCorrForm, setNewCorrForm] = useState({
    empId: 'PB-10492',
    empName: 'Md. Kamrul Hasan',
    branch: 'Motijheel Corporate Branch',
    shift: 'General Banking (08:30–18:30)',
    origPunch: '09:40 AM (Late +70m)',
    adjustedPunch: '08:30 AM (On Time)',
    source: 'Branch In-Charge Deputation',
    sourceType: 'branch-in-charge',
    reason: 'Bangladesh Bank Clearing Deputation & Cash Escort Duty',
    authDocRef: 'HO/ATT/2026/REQ-099',
    authBy: 'Engr. Tariqul Hasan (Super Admin)'
  });

  const handleApproveCorr = (id) => {
    setAttCorrLogs(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'Approved',
          authBy: 'Engr. Tariqul Hasan (Super Admin) - Approved & Synced',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
        };
      }
      return item;
    }));
    setToastMessage(`✔ Request ${id} approved & synced to BioStar roster.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRejectCorr = (id) => {
    setAttCorrLogs(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'Rejected',
          authBy: 'Engr. Tariqul Hasan (Super Admin) - Disallowed (Policy Violation)',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
        };
      }
      return item;
    }));
    setToastMessage(`✖ Request ${id} rejected under ICT-08 compliance policy.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateCorr = (e) => {
    e.preventDefault();
    const newRecord = {
      id: `CORR-ATT-2026-0${Math.floor(50 + Math.random() * 49)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      designation: 'Principal Officer',
      status: 'Pending Review',
      ...newCorrForm
    };
    setAttCorrLogs(prev => [newRecord, ...prev]);
    setIsNewCorrModalOpen(false);
    setToastMessage(`✔ New adjustment request ${newRecord.id} queued for supervisor review.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Admin Audit Tab State
  const [adminLogs, setAdminLogs] = useState(INITIAL_ADMIN_AUDIT_LOGS);
  const [searchAdmin, setSearchAdmin] = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const [filterBranch, setFilterBranch] = useState('All');
  const [selectedAuditLog, setSelectedAuditLog] = useState(null); // For Audit Proof modal

  // Transfer Audit Tab State
  const [transferLogs, setTransferLogs] = useState(INITIAL_BRANCH_TRANSFERS);
  const [searchTransfer, setSearchTransfer] = useState('');
  const [filterTransferDivision, setFilterTransferDivision] = useState('All');

  // Filtered Admin Logs
  const filteredAdminLogs = useMemo(() => {
    return adminLogs.filter(log => {
      if (filterAction !== 'All' && log.actionType !== filterAction) return false;
      if (filterBranch !== 'All' && !log.adminBranch.includes(filterBranch)) return false;
      if (searchAdmin) {
        const q = searchAdmin.toLowerCase();
        const match = log.adminName.toLowerCase().includes(q) ||
          log.adminId.toLowerCase().includes(q) ||
          log.targetEntity.toLowerCase().includes(q) ||
          log.authRef.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.id.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [adminLogs, searchAdmin, filterAction, filterBranch]);

  // Filtered Transfer Logs
  const filteredTransferLogs = useMemo(() => {
    return transferLogs.filter(tr => {
      if (filterTransferDivision !== 'All' && tr.fromDivision !== filterTransferDivision && tr.toDivision !== filterTransferDivision) return false;
      if (searchTransfer) {
        const q = searchTransfer.toLowerCase();
        const match = tr.empName.toLowerCase().includes(q) ||
          tr.empId.toLowerCase().includes(q) ||
          tr.fromBranch.toLowerCase().includes(q) ||
          tr.toBranch.toLowerCase().includes(q) ||
          tr.transferOrderNo.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [transferLogs, searchTransfer, filterTransferDivision]);

  // Unique action types and branches for dropdowns
  const actionTypes = useMemo(() => ['All', ...new Set(adminLogs.map(l => l.actionType))], [adminLogs]);
  const adminBranches = useMemo(() => ['All', 'Head Office', 'Gulshan', 'Motijheel', 'Chattogram', 'Sylhet', 'Dhanmondi', 'Khulna', 'Bogura'], []);

  const handleExportAdminLogs = () => {
    const headers = ['Audit ID', 'Timestamp', 'Admin Name', 'Admin ID', 'Admin Role', 'Branch', 'Action Type', 'Target Entity', 'Target Type', 'Details', 'Auth Ref', 'IP Address', 'Terminal ID', 'Status', 'SHA256 Hash'];
    const rows = filteredAdminLogs.map(l => [
      l.id, l.timestamp, l.adminName, l.adminId, l.adminRole, l.adminBranch, l.actionType, l.targetEntity, l.targetType, l.details, l.authRef, l.ipAddress, l.terminalId, l.status, l.hashChecksum
    ]);
    exportCsv(headers, rows, `pubali_bank_admin_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportTransfers = () => {
    const headers = ['Transfer ID', 'Emp ID', 'Emp Name', 'Designation', 'From Branch', 'From Division', 'To Branch', 'To Division', 'Transfer Order No', 'Transfer Date', 'Effective Date', 'Biometric Shift Status', 'Old Revocation', 'New Push', 'Sync Latency', 'Authorized By', 'Status'];
    const rows = filteredTransferLogs.map(t => [
      t.id, t.empId, t.empName, t.designation, t.fromBranch, t.fromDivision, t.toBranch, t.toDivision, t.transferOrderNo, t.transferDate, t.effectiveDate, t.biometricShiftStatus, t.oldTerminalRevocation, t.newTerminalPush, t.syncLatency, t.authorizedBy, t.status
    ]);
    exportCsv(headers, rows, `pubali_bank_branch_transfer_audit_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const getActionBadgeStyle = (badge) => {
    switch (badge) {
      case 'green': return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
      case 'red': return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' };
      case 'amber': return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
      case 'purple': return { bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' };
      case 'teal': return { bg: '#ccfbf1', color: '#0f766e', border: '#99f6e4' };
      default: return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
    }
  };

  const bannerMeta = useMemo(() => {
    if (isDedicatedView && activeTab === 'attendance-audit') {
      return {
        icon: '⏱️',
        title: 'Attendance Correction & Regularization Audit',
        badge: 'BB ICT-08 COMPLIANT',
        sub: 'Supervisor manual adjustments, biometric timeout overrides & roster sync ledger'
      };
    }
    if (isDedicatedView && activeTab === 'vault-audit') {
      return {
        icon: '🔐',
        title: 'High-Security Vault & Strong Room Access Audit',
        badge: 'AC-08 COMPLIANT',
        sub: 'Cash Vault, Treasury & SWIFT Room Dual-Custody biometric verification logs'
      };
    }
    if (isDedicatedView && activeTab === 'admin-audit') {
      return {
        icon: '👤',
        title: 'User & Administrative Activity Audit',
        badge: 'BB ICT-08 COMPLIANT',
        sub: 'Super admin actions, permission alterations, role elevation & credential modifications'
      };
    }
    return {
      icon: '📋',
      title: 'Audit Trail & Logs',
      badge: 'BB ICT-08 COMPLIANT',
      sub: 'Pubali Bank PLC · Bangladesh Bank ICT Security Guideline (ICT-08) • SHA-256 Tamper-Proof Audit Logging Active'
    };
  }, [isDedicatedView, activeTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ─── BANNER HEADER ──────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #091e3a 0%, #102a45 40%, #0d9488 100%)',
        borderRadius: 12,
        padding: '20px 24px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 4px 20px rgba(13, 148, 136, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24
          }}>
            {bannerMeta.icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em' }}>
                {bannerMeta.title}
              </h2>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.04em'
              }}>
                {bannerMeta.badge}
              </span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.88, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Pubali Bank PLC</span>
              <span>•</span>
              <span style={{ color: '#a7f3d0' }}>{bannerMeta.sub}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            id="audit-export-all-btn"
            onClick={() => {
              if (activeTab === 'transfer-audit') {
                handleExportTransfers();
              } else if (activeTab === 'vault-audit') {
                const btn = document.getElementById('restricted-export-btn');
                if (btn) btn.click();
                else handleExportAdminLogs();
              } else {
                handleExportAdminLogs();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 6,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export Active Audit Feed (CSV)
          </button>
        </div>
      </div>

      {/* ─── NAVIGATION SUB-TABS (Hidden in Dedicated Views) ─────────────── */}
      {!isDedicatedView && (
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #e2e8f0',
          gap: 8,
          background: '#ffffff',
          borderRadius: '8px 8px 0 0',
          padding: '6px 12px 0 12px'
        }}>
          <button
            id="tab-admin-audit"
            onClick={() => setActiveTab('admin-audit')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === 'admin-audit' ? '3px solid #2563eb' : '3px solid transparent',
              background: 'transparent',
              color: activeTab === 'admin-audit' ? '#1d4ed8' : '#64748b',
              fontSize: 13,
              fontWeight: activeTab === 'admin-audit' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.15s'
            }}
          >
            <span>👤 User & Admin Audit Trail</span>
            <span style={{
              background: activeTab === 'admin-audit' ? '#dbeafe' : '#f1f5f9',
              color: activeTab === 'admin-audit' ? '#1e40af' : '#475569',
              padding: '2px 7px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 700
            }}>
              {filteredAdminLogs.length}
            </span>
          </button>

          <button
            id="tab-vault-audit"
            onClick={() => setActiveTab('vault-audit')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === 'vault-audit' ? '3px solid #7c3aed' : '3px solid transparent',
              background: 'transparent',
              color: activeTab === 'vault-audit' ? '#6d28d9' : '#64748b',
              fontSize: 13,
              fontWeight: activeTab === 'vault-audit' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.15s'
            }}
          >
            <span>🔐 High-Security Vault Audit</span>
            <span style={{
              background: activeTab === 'vault-audit' ? '#ede9fe' : '#f1f5f9',
              color: activeTab === 'vault-audit' ? '#5b21b6' : '#475569',
              padding: '2px 7px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 700
            }}>
              300
            </span>
          </button>

          <button
            id="tab-movement-trail"
            onClick={() => setActiveTab('movement-trail')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === 'movement-trail' ? '3px solid #0d9488' : '3px solid transparent',
              background: 'transparent',
              color: activeTab === 'movement-trail' ? '#0f766e' : '#64748b',
              fontSize: 13,
              fontWeight: activeTab === 'movement-trail' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.15s'
            }}
          >
            <span>🚶 Door-by-Door Movement Trail</span>
            <span style={{
              background: activeTab === 'movement-trail' ? '#ccfbf1' : '#f1f5f9',
              color: activeTab === 'movement-trail' ? '#115e59' : '#475569',
              padding: '2px 7px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 700
            }}>
              Live
            </span>
          </button>

          <button
            id="tab-transfer-audit"
            onClick={() => setActiveTab('transfer-audit')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === 'transfer-audit' ? '3px solid #c026d3' : '3px solid transparent',
              background: 'transparent',
              color: activeTab === 'transfer-audit' ? '#a21caf' : '#64748b',
              fontSize: 13,
              fontWeight: activeTab === 'transfer-audit' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.15s'
            }}
          >
            <span>🔄 Branch Transfer History</span>
            <span style={{
              background: activeTab === 'transfer-audit' ? '#fae8ff' : '#f1f5f9',
              color: activeTab === 'transfer-audit' ? '#86198f' : '#475569',
              padding: '2px 7px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 700
            }}>
              {filteredTransferLogs.length}
            </span>
          </button>

          <button
            id="tab-attendance-audit"
            onClick={() => setActiveTab('attendance-audit')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === 'attendance-audit' ? '3px solid #ea580c' : '3px solid transparent',
              background: 'transparent',
              color: activeTab === 'attendance-audit' ? '#c2410c' : '#64748b',
              fontSize: 13,
              fontWeight: activeTab === 'attendance-audit' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.15s'
            }}
          >
            <span>⏱️ Attendance Correction Audit</span>
            <span style={{
              background: activeTab === 'attendance-audit' ? '#ffedd5' : '#f1f5f9',
              color: activeTab === 'attendance-audit' ? '#9a3412' : '#475569',
              padding: '2px 7px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 700
            }}>
              {attCorrLogs.length}
            </span>
          </button>
        </div>
      )}

      {/* ─── TAB CONTENT 1: USER & ADMIN AUDIT TRAIL ─────────────────────── */}
      {activeTab === 'admin-audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Controls & Filter Bar */}
          <div style={{
            background: '#ffffff',
            borderRadius: 10,
            padding: '12px 18px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <input
                id="search-admin-audit"
                type="text"
                value={searchAdmin}
                onChange={e => setSearchAdmin(e.target.value)}
                placeholder="Search admin, target user, action, authorization ref, or details..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }}>
                🔍
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Action:</label>
              <select
                id="filter-action-type"
                value={filterAction}
                onChange={e => setFilterAction(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#334155',
                  background: '#f8fafc',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {actionTypes.map(act => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Branch/Office:</label>
              <select
                id="filter-admin-branch"
                value={filterBranch}
                onChange={e => setFilterBranch(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#334155',
                  background: '#f8fafc',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {adminBranches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>
              Showing <strong style={{ color: '#0f172a' }}>{filteredAdminLogs.length}</strong> of {adminLogs.length} events
            </div>
          </div>

          {/* Admin Audit Table */}
          <div style={{
            background: '#ffffff',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>AUDIT ID & TIME</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>PERFORMING ADMIN</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>ACTION TYPE</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>TARGET ENTITY</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>ACTION DETAILS & SCOPE</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>AUTH REF</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>TERMINAL / IP</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'center' }}>PROOF</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdminLogs.map((log, idx) => {
                    const badgeStyle = getActionBadgeStyle(log.actionBadge);
                    return (
                      <tr
                        key={log.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                          transition: 'background 0.12s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fafafa'; }}
                      >
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{log.id}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{log.timestamp} ({log.timeAgo})</div>
                        </td>

                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{log.adminName}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            <span style={{ color: '#2563eb', fontWeight: 600 }}>{log.adminId}</span> · {log.adminRole}
                          </div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>{log.adminBranch}</div>
                        </td>

                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            background: badgeStyle.bg,
                            color: badgeStyle.color,
                            border: `1px solid ${badgeStyle.border}`,
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'inline-block'
                          }}>
                            {log.actionType}
                          </span>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{log.targetEntity}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{log.targetType} · {log.targetBranch}</div>
                        </td>

                        <td style={{ padding: '12px 14px', maxWidth: 320 }}>
                          <div style={{ color: '#334155', lineHeight: 1.4 }}>{log.details}</div>
                        </td>

                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>
                            {log.authRef}
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{log.terminalId}</div>
                          <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{log.ipAddress}</div>
                        </td>

                        <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => setSelectedAuditLog(log)}
                            title="Inspect cryptographic SHA-256 audit proof and BB ICT compliance payload"
                            style={{
                              padding: '4px 10px',
                              borderRadius: 4,
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#2563eb',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <span>🔍 Proof</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT 2: HIGH-SECURITY VAULT AUDIT ─────────────────────── */}
      {activeTab === 'vault-audit' && (
        <div style={{ marginTop: 2 }}>
          <RestrictedZoneAccessLog initialZone="Cash Vault" initialTimeframe="all" isVaultAuditMode={true} hideHeader={true} />
        </div>
      )}

      {/* ─── TAB CONTENT 3: DOOR-BY-DOOR MOVEMENT TRAIL ─────────────────── */}
      {activeTab === 'movement-trail' && (
        <div style={{ marginTop: 2 }}>
          <EmployeeMovementTrail hideHeader={true} />
        </div>
      )}

      {/* ─── TAB CONTENT 4: BRANCH TRANSFER HISTORY ─────────────────────── */}
      {activeTab === 'transfer-audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Controls & Filter Bar */}
          <div style={{
            background: '#ffffff',
            borderRadius: 10,
            padding: '12px 18px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <input
                id="search-transfer-audit"
                type="text"
                value={searchTransfer}
                onChange={e => setSearchTransfer(e.target.value)}
                placeholder="Search transferred officer, employee ID, source/target branch, or order no..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }}>
                🔍
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Division:</label>
              <select
                id="filter-transfer-division"
                value={filterTransferDivision}
                onChange={e => setFilterTransferDivision(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#334155',
                  background: '#f8fafc',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Divisions (8)</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Chattogram">Chattogram</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barishal">Barishal</option>
                <option value="Mymensingh">Mymensingh</option>
                <option value="Rangpur">Rangpur</option>
              </select>
            </div>

            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>
              Showing <strong style={{ color: '#0f172a' }}>{filteredTransferLogs.length}</strong> transfers
            </div>
          </div>

          {/* Transfers Table */}
          <div style={{
            background: '#ffffff',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>TRANSFER ID & DATES</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>TRANSFERRED OFFICER</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>SOURCE BRANCH (FROM)</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>DESTINATION BRANCH (TO)</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>BIOMETRIC SHIFT & TERMINAL SYNC</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700 }}>TRANSFER ORDER & AUTH</th>
                    <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'center' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransferLogs.map((tr, idx) => (
                    <tr
                      key={tr.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                        transition: 'background 0.12s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fafafa'; }}
                    >
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{tr.id}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Issued: {tr.transferDate}</div>
                        <div style={{ fontSize: 10, color: '#0d9488', fontWeight: 600 }}>Effective: {tr.effectiveDate}</div>
                      </td>

                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{tr.empName}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          <span style={{ color: '#c026d3', fontWeight: 600 }}>{tr.empId}</span> · {tr.designation}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#dc2626' }}>← {tr.fromBranch}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{tr.fromDivision} Division</div>
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{tr.oldTerminalRevocation}</div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#16a34a' }}>→ {tr.toBranch}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{tr.toDivision} Division</div>
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{tr.newTerminalPush}</div>
                      </td>

                      <td style={{ padding: '12px 14px', maxWidth: 280 }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{tr.biometricShiftStatus}</div>
                        <div style={{ fontSize: 11, color: '#0d9488', marginTop: 2 }}>⚡ Latency: {tr.syncLatency}</div>
                      </td>

                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>
                          {tr.transferOrderNo}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{tr.authorizedBy}</div>
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          background: tr.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                          color: tr.status === 'Completed' ? '#15803d' : '#b45309',
                          border: `1px solid ${tr.status === 'Completed' ? '#bbf7d0' : '#fde68a'}`,
                          padding: '3px 8px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700
                        }}>
                          {tr.status === 'Completed' ? '✔ Shift Synced' : '⏳ Scheduled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT 5: ATTENDANCE CORRECTION AUDIT ────────────────── */}
      {activeTab === 'attendance-audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Toast Notification */}
          {toastMessage && (
            <div style={{
              background: '#042f2e',
              border: '1px solid #14b8a6',
              color: '#f0fdfa',
              padding: '12px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(20, 184, 166, 0.25)',
              animation: 'fadeIn 0.2s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>⚡</span>
                <span>{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                style={{ background: 'none', border: 'none', color: '#a7f3d0', cursor: 'pointer', fontSize: 15, fontWeight: 800 }}
              >
                ✕
              </button>
            </div>
          )}

          {/* ── 1. ATTENDANCE CORRECTION SPECIFIC KPIS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
            <div style={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Requests Logged
                </span>
                <span style={{ fontSize: 16 }}>📋</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                {attCorrLogs.length} Regularizations
              </div>
              <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginTop: 3 }}>
                ICT-08 Immutable Ledger Active
              </div>
            </div>

            <div style={{
              background: '#fffbeb',
              borderRadius: 10,
              border: '1.5px solid #f59e0b',
              padding: '14px 18px',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pending Review Queue
                </span>
                <span style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 12,
                  border: '1px solid #fde68a'
                }}>
                  Action Required
                </span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#b45309', marginTop: 4 }}>
                {attCorrLogs.filter(l => l.status === 'Pending Review').length} Pending
              </div>
              <div style={{ fontSize: 11, color: '#d97706', fontWeight: 600, marginTop: 3 }}>
                Awaiting Supervisor / HR Signoff
              </div>
            </div>

            <div style={{ background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Approved & Synced
                </span>
                <span style={{ fontSize: 16 }}>✔</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#15803d', marginTop: 4 }}>
                {attCorrLogs.filter(l => l.status === 'Approved').length} Adjustments
              </div>
              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 3 }}>
                BioStar Roster Updated (100%)
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Disallowed / Rejected
                </span>
                <span style={{ fontSize: 16 }}>✖</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#dc2626', marginTop: 4 }}>
                {attCorrLogs.filter(l => l.status === 'Rejected').length} Flagged
              </div>
              <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600, marginTop: 3 }}>
                Policy & SLA Violation
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Top Request Source
                </span>
                <span style={{ fontSize: 16 }}>📡</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0d9488', marginTop: 8 }}>
                50% Hardware Timeout
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                35% Out-Duty · 15% Self-Slip
              </div>
            </div>
          </div>

          {/* ── 2. WHERE DO REQUESTS COME FROM? (WORKFLOW ARCHITECTURE BANNER) ── */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: '#0284c7', color: '#fff', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                💡
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                  Where do Attendance Correction Requests originate? (Bangladesh Bank ICT-08 Architecture)
                </div>
                <div style={{ fontSize: 11.5, color: '#475569', marginTop: 2 }}>
                  Requests flow into this queue from 3 strictly authenticated audit channels:
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#0284c7', fontWeight: 800 }}>⚡ Channel 1:</span>
                <span style={{ color: '#334155' }}>Auto-Flagged from Attendance Exceptions (Sensor & Power Outages)</span>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#059669', fontWeight: 800 }}>🏢 Channel 2:</span>
                <span style={{ color: '#334155' }}>Branch Manager Deputation (BB Clearing, Cash Transit Escort)</span>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#7c3aed', fontWeight: 800 }}>📝 Channel 3:</span>
                <span style={{ color: '#334155' }}>Employee Regularization Portal (48-Hr SLA Slip)</span>
              </div>
            </div>
          </div>

          {/* ── 3. CONTROLS, SEARCH & INITIATE ACTION ── */}
          <div style={{
            background: '#ffffff',
            borderRadius: 10,
            padding: '12px 18px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilterCorrStatus('All')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: filterCorrStatus === 'All' ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                  background: filterCorrStatus === 'All' ? '#0f172a' : '#f8fafc',
                  color: filterCorrStatus === 'All' ? '#ffffff' : '#475569',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                All Records ({attCorrLogs.length})
              </button>

              <button
                onClick={() => setFilterCorrStatus('Pending Review')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: filterCorrStatus === 'Pending Review' ? '1.5px solid #d97706' : '1px solid #fef3c7',
                  background: filterCorrStatus === 'Pending Review' ? '#f59e0b' : '#fffbeb',
                  color: filterCorrStatus === 'Pending Review' ? '#ffffff' : '#b45309',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>⏳ Pending Review</span>
                <span style={{
                  background: filterCorrStatus === 'Pending Review' ? '#ffffff' : '#f59e0b',
                  color: filterCorrStatus === 'Pending Review' ? '#b45309' : '#ffffff',
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontSize: 10.5,
                  fontWeight: 800
                }}>
                  {attCorrLogs.filter(l => l.status === 'Pending Review').length}
                </span>
              </button>

              <button
                onClick={() => setFilterCorrStatus('Approved')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: filterCorrStatus === 'Approved' ? '1.5px solid #16a34a' : '1px solid #bbf7d0',
                  background: filterCorrStatus === 'Approved' ? '#16a34a' : '#f0fdf4',
                  color: filterCorrStatus === 'Approved' ? '#ffffff' : '#15803d',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✔ Approved & Synced ({attCorrLogs.filter(l => l.status === 'Approved').length})
              </button>

              <button
                onClick={() => setFilterCorrStatus('Rejected')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: filterCorrStatus === 'Rejected' ? '1.5px solid #dc2626' : '1px solid #fecaca',
                  background: filterCorrStatus === 'Rejected' ? '#dc2626' : '#fef2f2',
                  color: filterCorrStatus === 'Rejected' ? '#ffffff' : '#b91c1c',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✖ Disallowed ({attCorrLogs.filter(l => l.status === 'Rejected').length})
              </button>
            </div>

            {/* Right side: Search & Create Request Button */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 220 }}>
                <input
                  id="search-att-corr"
                  type="text"
                  value={searchAttCorr}
                  onChange={e => setSearchAttCorr(e.target.value)}
                  placeholder="Search employee, branch..."
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 30px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }}>
                  🔍
                </span>
              </div>

              <button
                id="btn-new-correction-request"
                onClick={() => setIsNewCorrModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'linear-gradient(135deg, #0d9488 0%, #047857 100%)',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(13,148,136,0.3)',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
              >
                <span style={{ fontSize: 14 }}>➕</span>
                <span>New Correction Request</span>
              </button>
            </div>
          </div>

          {/* ── 4. DATA TABLE WITH INCOMING SOURCE & ACTIONS ── */}
          <div style={{
            background: '#ffffff',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '11px 14px', fontWeight: 700 }}>AUDIT ID & DATE</th>
                    <th style={{ padding: '11px 14px', fontWeight: 700 }}>REQUEST SOURCE / ORIGIN</th>
                    <th style={{ padding: '11px 14px', fontWeight: 700 }}>EMPLOYEE & BRANCH</th>
                    <th style={{ padding: '11px 14px', fontWeight: 700 }}>ORIGINAL PUNCH</th>
                    <th style={{ padding: '11px 14px', fontWeight: 700 }}>REQUESTED ADJUSTMENT</th>
                    <th style={{ padding: '11px 14px', fontWeight: 700 }}>JUSTIFICATION & DOC REF</th>
                    <th style={{ padding: '11px 14px', fontWeight: 700 }}>AUTHORIZER / STATUS</th>
                    <th style={{ padding: '11px 14px', fontWeight: 700, textAlign: 'center' }}>SUPERVISOR ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {attCorrLogs
                    .filter(l => {
                      if (filterCorrStatus !== 'All' && l.status !== filterCorrStatus) return false;
                      if (searchAttCorr) {
                        const q = searchAttCorr.toLowerCase();
                        return l.empName.toLowerCase().includes(q) ||
                          l.id.toLowerCase().includes(q) ||
                          l.branch.toLowerCase().includes(q) ||
                          l.reason.toLowerCase().includes(q);
                      }
                      return true;
                    })
                    .map((item, idx) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: item.status === 'Pending Review' ? '#fffdfa' : (idx % 2 === 0 ? '#ffffff' : '#fafafa'),
                        transition: 'background 0.12s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = item.status === 'Pending Review' ? '#fffdfa' : (idx % 2 === 0 ? '#ffffff' : '#fafafa'); }}
                    >
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>{item.id}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.timestamp}</div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 10.5,
                          fontWeight: 700,
                          background: item.sourceType === 'auto-exception' ? '#e0f2fe' : (item.sourceType === 'branch-in-charge' ? '#dcfce7' : '#ede9fe'),
                          color: item.sourceType === 'auto-exception' ? '#0369a1' : (item.sourceType === 'branch-in-charge' ? '#15803d' : '#6d28d9'),
                          border: `1px solid ${item.sourceType === 'auto-exception' ? '#bae6fd' : (item.sourceType === 'branch-in-charge' ? '#bbf7d0' : '#ddd6fe')}`
                        }}>
                          {item.source}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.empName}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          <span style={{ color: '#0d9488', fontWeight: 600 }}>{item.empId}</span> · {item.designation}
                        </div>
                        <div style={{ fontSize: 10.5, color: '#475569', marginTop: 1 }}>{item.branch}</div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontWeight: 700,
                          fontSize: 11,
                          display: 'inline-block'
                        }}>
                          {item.origPunch}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontWeight: 800,
                          fontSize: 11,
                          display: 'inline-block'
                        }}>
                          {item.adjustedPunch}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', maxWidth: 260 }}>
                        <div style={{ color: '#334155', fontWeight: 500, lineHeight: 1.35 }}>{item.reason}</div>
                        <div style={{ fontSize: 10.5, color: '#0284c7', fontFamily: 'monospace', fontWeight: 600, marginTop: 3 }}>
                          📄 Ref: {item.authDocRef}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.authBy}</div>
                        <div style={{ marginTop: 3 }}>
                          {item.status === 'Approved' && (
                            <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 10, fontSize: 10.5, fontWeight: 700 }}>
                              ✔ Approved & Synced
                            </span>
                          )}
                          {item.status === 'Rejected' && (
                            <span style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: 10, fontSize: 10.5, fontWeight: 700 }}>
                              ✖ Disallowed
                            </span>
                          )}
                          {item.status === 'Pending Review' && (
                            <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: 10, fontSize: 10.5, fontWeight: 700 }}>
                              ⏳ Pending Signoff
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {item.status === 'Pending Review' ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              onClick={() => handleApproveCorr(item.id)}
                              style={{
                                background: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: 5,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3
                              }}
                              title="Approve and write to biometric DB"
                            >
                              ✔ Approve
                            </button>
                            <button
                              onClick={() => handleRejectCorr(item.id)}
                              style={{
                                background: '#ffffff',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                padding: '5px 8px',
                                borderRadius: 5,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                              title="Disallow correction under ICT policy"
                            >
                              ✖ Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                            {item.status === 'Approved' ? 'Locked (ICT-08)' : 'Archived'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {attCorrLogs.filter(l => filterCorrStatus === 'All' || l.status === filterCorrStatus).length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>No attendance corrections found</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Try clearing the search query or changing status filters.</div>
                </div>
              )}
            </div>
          </div>

          {/* ── 5. MODAL: SUBMIT NEW ATTENDANCE ADJUSTMENT REQUEST ── */}
          {isNewCorrModalOpen && (
            <div
              role="dialog"
              aria-modal="true"
              onClick={() => setIsNewCorrModalOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: 20
              }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  width: '100%',
                  maxWidth: 620,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Modal Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #091e3a 0%, #0d9488 100%)',
                  color: '#ffffff',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800 }}>➕ Submit Attendance Correction Request</div>
                    <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
                      Pubali Bank ICT-08 Compliant Regularization Entry Form
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNewCorrModalOpen(false)}
                    style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: 18, cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Form Body */}
                <form onSubmit={handleCreateCorr} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                        Employee ID
                      </label>
                      <input
                        type="text"
                        value={newCorrForm.empId}
                        onChange={e => setNewCorrForm({ ...newCorrForm, empId: e.target.value })}
                        required
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5, boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                        Employee Name
                      </label>
                      <input
                        type="text"
                        value={newCorrForm.empName}
                        onChange={e => setNewCorrForm({ ...newCorrForm, empName: e.target.value })}
                        required
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5, boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                        Branch / Site
                      </label>
                      <input
                        type="text"
                        value={newCorrForm.branch}
                        onChange={e => setNewCorrForm({ ...newCorrForm, branch: e.target.value })}
                        required
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5, boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                        Incoming Request Source
                      </label>
                      <select
                        value={newCorrForm.source}
                        onChange={e => setNewCorrForm({ ...newCorrForm, source: e.target.value, sourceType: e.target.value.includes('Auto') ? 'auto-exception' : (e.target.value.includes('Branch') ? 'branch-in-charge' : 'self-service') })}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5, boxSizing: 'border-box' }}
                      >
                        <option value="Branch In-Charge Deputation">Branch In-Charge Deputation (Field/Transit)</option>
                        <option value="Auto-Flagged: Exception Hub">Auto-Flagged: Biometric Terminal Sensor Timeout</option>
                        <option value="Employee Regularization Slip">Employee Regularization Slip (HR Portal)</option>
                        <option value="IT Infrastructure / Power Outage">IT Infrastructure / Power Outage Regularization</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#dc2626', display: 'block', marginBottom: 4 }}>
                        Original Actual Punch
                      </label>
                      <input
                        type="text"
                        value={newCorrForm.origPunch}
                        onChange={e => setNewCorrForm({ ...newCorrForm, origPunch: e.target.value })}
                        placeholder="e.g. 09:45 AM (Late) or Missed"
                        required
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5, boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#16a34a', display: 'block', marginBottom: 4 }}>
                        Proposed Adjusted Time
                      </label>
                      <input
                        type="text"
                        value={newCorrForm.adjustedPunch}
                        onChange={e => setNewCorrForm({ ...newCorrForm, adjustedPunch: e.target.value })}
                        placeholder="e.g. 08:30 AM (On Time)"
                        required
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5, boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Justification & Duty Details
                    </label>
                    <textarea
                      value={newCorrForm.reason}
                      onChange={e => setNewCorrForm({ ...newCorrForm, reason: e.target.value })}
                      rows={2}
                      required
                      placeholder="Specify why punch was missed/late (e.g. Clearing House duty, terminal sensor jam, cash vault transit)..."
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5, boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                        Document Reference / File No.
                      </label>
                      <input
                        type="text"
                        value={newCorrForm.authDocRef}
                        onChange={e => setNewCorrForm({ ...newCorrForm, authDocRef: e.target.value })}
                        placeholder="e.g. PB/DOC-2026/782"
                        required
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5, boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                        Authorizing Supervisor
                      </label>
                      <input
                        type="text"
                        value={newCorrForm.authBy}
                        onChange={e => setNewCorrForm({ ...newCorrForm, authBy: e.target.value })}
                        required
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5, boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => setIsNewCorrModalOpen(false)}
                      style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#0d9488', color: '#ffffff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(13,148,136,0.3)' }}
                    >
                      Submit for Review
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL: CRYPTOGRAPHIC AUDIT PROOF INSPECTOR ──────────────────── */}
      {selectedAuditLog && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedAuditLog(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: 12,
              width: '100%',
              maxWidth: 620,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>🔐</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>Audit Proof & Cryptographic Signature</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>Log ID: {selectedAuditLog.id} · Verified by Central Core</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 800
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12 }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Admin / Officer</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{selectedAuditLog.adminName}</div>
                    <div style={{ color: '#2563eb', fontSize: 11 }}>{selectedAuditLog.adminId} ({selectedAuditLog.adminRole})</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Timestamp & Location</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{selectedAuditLog.timestamp}</div>
                    <div style={{ color: '#64748b', fontSize: 11 }}>{selectedAuditLog.adminBranch}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Target Entity</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{selectedAuditLog.targetEntity}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Authorization Reference</div>
                    <div style={{ fontWeight: 700, color: '#0d9488', fontFamily: 'monospace', marginTop: 2 }}>{selectedAuditLog.authRef}</div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>Action Description:</div>
                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 14px', color: '#1e293b' }}>
                  {selectedAuditLog.details}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>Tamper-Proof Cryptographic Hash (SHA-256):</div>
                <div style={{
                  background: '#0f172a',
                  color: '#34d399',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  padding: '10px 12px',
                  borderRadius: 6,
                  wordBreak: 'break-all',
                  border: '1px solid #1e293b'
                }}>
                  {selectedAuditLog.hashChecksum}
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>🛡️</span>
                <div style={{ fontSize: 11, color: '#166534' }}>
                  <strong>Bangladesh Bank ICT Guideline (ICT-08) Section 6.2 Certified:</strong> This record cannot be altered or deleted from the immutable SOC central archive.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10
            }}>
              <button
                onClick={() => setSelectedAuditLog(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
