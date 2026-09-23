/**
 * UserManagementPage.jsx — BioStar X Enterprise User Management & Branch Transfer Suite
 * 
 * Features:
 * - Complete Biometric User Directory (Fingerprint + RFID Card)
 * - Seamless Employee Branch Transfer (Automatic Biometric Shift to Destination Branch)
 * - Transfer Order Reference, Effective Date & Audit Log
 * - BioStar X Terminal Synchronization (Revoke from Old Branch -> Push to New Branch)
 * - Identical premium aesthetic matching Time Attendance & Access Control
 */

import React, { useState, useMemo, useEffect } from 'react';
import { FULL_PUBALI_LOCATIONS, DIVISIONS_LIST } from '../data/pubaliFullBranches';

// ─── HELPER: EXPORT CSV ──────────────────────────────────────────
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

// ─── BUILD ALL USERS DATA ────────────────────────────────────────
function buildAllUsers() {
  const users = [];
  FULL_PUBALI_LOCATIONS.forEach((loc, locIdx) => {
    if (loc.employees && loc.employees.length > 0) {
      loc.employees.forEach((emp, empIdx) => {
        const numPart = emp.id.replace(/\D/g, '') || String(locIdx * 10 + empIdx);
        const cardId = `CSN-${(numPart.slice(-4) || '1042').padStart(4, '0')}:${(loc.code || 'PB').slice(-2).toUpperCase()}`;
        const dept = loc.type === 'head-office'
          ? 'Head Office Management'
          : (loc.type === 'islamic' ? 'Islamic Banking Wing' : 'Branch Banking & Operations');

        users.push({
          id: emp.id,
          name: emp.name,
          currentBranch: loc.name,
          originalBranch: loc.name,
          division: loc.division || 'Dhaka',
          department: dept,
          role: empIdx === 0 ? 'Branch Manager' : (empIdx === 1 ? 'Cash Officer / Teller' : 'Banking Officer'),
          biometricMode: 'Fingerprint + RFID Card',
          fpTemplates: '2 Templates (Right Index + Left Thumb)',
          cardId,
          syncStatus: 'Synced with Branch Terminals',
          status: emp.status === 'Absent' ? 'Inactive' : 'Active',
          lastTransferDate: null,
          transferOrderNo: null,
          isTransferred: false
        });
      });
    }
  });

  // Exactly 38 pending bio-enrollment staff across nationwide branches
  const step = Math.floor(users.length / 38);
  for (let i = 0; i < 38; i++) {
    const idx = (i * step) % users.length;
    users[idx].status = 'Pending Bio-Enrollment';
    users[idx].biometricMode = 'RFID Card Only (Fingerprint Pending)';
    users[idx].fpTemplates = '0 Templates (Action Req.)';
    users[idx].syncStatus = 'Pending Biometric Registration';
  }

  return users;
}

// ─── INITIAL PAST TRANSFERS FOR AUDIT LOG ────────────────────────
const INITIAL_TRANSFERS = [
  {
    id: 'TR-2026-001',
    empId: 'PB-09105',
    empName: 'Ismail Hossain',
    designation: 'Senior Principal Officer',
    fromBranch: 'Dhaka Head Office (Principal)',
    toBranch: 'Agrabad Corporate Branch, Chattogram',
    transferOrderNo: 'PB-HO/HRD/TR-2026/0394',
    transferDate: '2026-09-08',
    effectiveDate: '2026-09-12',
    biometricShiftStatus: 'Completed & Shifted (FP + Card)',
    authorizedBy: 'General Manager (HRD)'
  },
  {
    id: 'TR-2026-002',
    empId: 'PB-09112',
    empName: 'Syeda Afroza Begum',
    designation: 'First Vice President',
    fromBranch: 'Gulshan Branch, Dhaka',
    toBranch: 'Sylhet Main Branch',
    transferOrderNo: 'PB-HO/HRD/TR-2026/0412',
    transferDate: '2026-09-10',
    effectiveDate: '2026-09-14',
    biometricShiftStatus: 'Completed & Shifted (FP + Card)',
    authorizedBy: 'DGM (Administration)'
  },
  {
    id: 'TR-2026-003',
    empId: 'PB-09144',
    empName: 'Md. Mustafizur Rahman',
    designation: 'Senior Cash Officer',
    fromBranch: 'Motijheel Corporate Branch',
    toBranch: 'Rajshahi Branch',
    transferOrderNo: 'PB-HO/HRD/TR-2026/0425',
    transferDate: '2026-09-11',
    effectiveDate: '2026-09-15',
    biometricShiftStatus: 'Completed & Shifted (FP + Card)',
    authorizedBy: 'GM (Human Resources)'
  },
  {
    id: 'TR-2026-004',
    empId: 'PB-09188',
    empName: 'Dr. Shahinur Alam',
    designation: 'Assistant Vice President',
    fromBranch: 'Uttara Branch, Dhaka',
    toBranch: 'Barishal Main Branch',
    transferOrderNo: 'PB-HO/HRD/TR-2026/0430',
    transferDate: '2026-09-13',
    effectiveDate: '2026-09-16',
    biometricShiftStatus: 'Completed & Shifted (FP + Card)',
    authorizedBy: 'Head of Operations'
  },
  {
    id: 'TR-2026-005',
    empId: 'PB-09210',
    empName: 'Farhana Sultana',
    designation: 'Executive Officer',
    fromBranch: 'Dhanmondi Branch, Dhaka',
    toBranch: 'Mymensingh Branch',
    transferOrderNo: 'PB-HO/HRD/TR-2026/0441',
    transferDate: '2026-09-14',
    effectiveDate: '2026-09-17',
    biometricShiftStatus: 'Scheduled Biometric Push (Pending)',
    authorizedBy: 'DGM (HRD)'
  },
  {
    id: 'TR-2026-006',
    empId: 'PB-09255',
    empName: 'Md. Anisur Rahman',
    designation: 'Branch Operations Manager',
    fromBranch: 'Bogura Branch',
    toBranch: 'Rangpur Main Branch',
    transferOrderNo: 'PB-HO/HRD/TR-2026/0450',
    transferDate: '2026-09-14',
    effectiveDate: '2026-09-18',
    biometricShiftStatus: 'Scheduled Biometric Push (Pending)',
    authorizedBy: 'General Manager (HRD)'
  }
];

// ─── KPI CARD MICRO-COMPONENT ────────────────────────────────
function KpiCard({ icon, label, value, sub, color, iconBg, bg, onClick, active }) {
  const isClickable = Boolean(onClick);
  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={`${label}: ${value}${sub ? ` - ${sub}` : ''}`}
      onClick={onClick}
      onKeyDown={e => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        background: active ? `${color}0c` : (bg || '#ffffff'),
        border: active ? `2px solid ${color}` : '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flex: '1 1 150px',
        minWidth: 150,
        boxShadow: active ? `0 4px 14px ${color}25` : '0 1px 3px rgba(0,0,0,0.04)',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.16s ease',
        userSelect: 'none',
        position: 'relative'
      }}
      onMouseEnter={e => {
        if (isClickable) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 6px 18px ${color}24`;
          if (!active) e.currentTarget.style.borderColor = color;
        }
      }}
      onMouseLeave={e => {
        if (isClickable) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = active ? `0 4px 14px ${color}25` : '0 1px 3px rgba(0,0,0,0.04)';
          e.currentTarget.style.borderColor = active ? color : '#e2e8f0';
        }
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: iconBg || (color + '18'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <div style={{
            fontSize: 10.5, color: '#64748b', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.04em',
            lineHeight: 1.2
          }}>
            {label}
          </div>
          {active ? (
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              color: '#ffffff',
              background: color,
              padding: '1px 5px',
              borderRadius: 3,
              lineHeight: 1.2,
              letterSpacing: '0.03em',
              flexShrink: 0
            }}>
              ACTIVE
            </span>
          ) : isClickable && (
            <span style={{
              fontSize: 10,
              fontWeight: 800,
              color,
              background: color + '15',
              padding: '1px 5px',
              borderRadius: 3,
              lineHeight: 1,
              flexShrink: 0
            }}>
              →
            </span>
          )}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1.2, marginTop: 3 }}>
          {value}
        </div>
        {sub && (
          <div style={{
            fontSize: 10.5, color: '#94a3b8', marginTop: 3,
            lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserManagementPage({ onNavigate }) {
  const [users, setUsers] = useState(() => buildAllUsers());
  const [transferHistory, setTransferHistory] = useState(INITIAL_TRANSFERS);
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'history'

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All Divisions');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [statusPill, setStatusPill] = useState('All Status');
  const [page, setPage] = useState(1);
  const pageSize = 30;

  // Modal States
  const [transferModalUser, setTransferModalUser] = useState(null);
  const [targetBranch, setTargetBranch] = useState('');
  const [transferOrderNo, setTransferOrderNo] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState('');

  // Dropdown options
  const divisions = ['All Divisions', ...DIVISIONS_LIST];
  const departments = ['All Departments', 'Branch Banking & Operations', 'Islamic Banking Wing', 'Head Office Management'];
  const statusPills = ['All Status', 'Active Enrolled', 'Pending Bio-Enrollment', 'Transferred / Shifted', 'Inactive'];

  // Branch list for dropdown (unique names)
  const branchList = useMemo(() => {
    return FULL_PUBALI_LOCATIONS.map(l => l.name).sort();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (search) {
        const q = search.toLowerCase();
        const match = u.id.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.currentBranch.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedDivision !== 'All Divisions' && u.division !== selectedDivision) return false;
      if (selectedDept !== 'All Departments' && u.department !== selectedDept) return false;
      if (statusPill === 'Active Enrolled' && (u.status !== 'Active' || u.isTransferred)) return false;
      if (statusPill === 'Pending Bio-Enrollment' && u.status !== 'Pending Bio-Enrollment') return false;
      if (statusPill === 'Transferred / Shifted' && !u.isTransferred) return false;
      if (statusPill === 'Inactive' && u.status !== 'Inactive') return false;
      return true;
    });
  }, [users, search, selectedDivision, selectedDept, statusPill]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedDivision, selectedDept, statusPill]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  // Open Transfer Modal
  const handleOpenTransfer = (user) => {
    setTransferModalUser(user);
    // Default to a different branch than current
    const different = branchList.find(b => b !== user.currentBranch) || branchList[0];
    setTargetBranch(different);
    setTransferOrderNo(`PB-HO/HRD/TR-2026/${Math.floor(1000 + Math.random() * 9000)}`);
    setEffectiveDate(new Date().toISOString().slice(0, 10));
  };

  // Execute Biometric Shift & Branch Transfer
  const handleConfirmTransfer = () => {
    if (!transferModalUser || !targetBranch) return;
    setIsSyncing(true);

    const oldBranch = transferModalUser.currentBranch;
    const empId = transferModalUser.id;
    const empName = transferModalUser.name;
    const orderNo = transferOrderNo || `PB-HO/HRD/TR-2026/${Math.floor(1000 + Math.random() * 9000)}`;

    // Target location details
    const targetLoc = FULL_PUBALI_LOCATIONS.find(l => l.name === targetBranch) || {};

    setTimeout(() => {
      // 1. Update User State
      setUsers(prev => prev.map(u => {
        if (u.id === empId) {
          return {
            ...u,
            currentBranch: targetBranch,
            division: targetLoc.division || u.division,
            isTransferred: true,
            syncStatus: `Shifted to ${targetBranch} (FP + Card Synced)`,
            lastTransferDate: effectiveDate,
            transferOrderNo: orderNo
          };
        }
        return u;
      }));

      // 2. Add to Audit History
      const newAudit = {
        id: `TR-2026-${String(transferHistory.length + 1).padStart(3, '0')}`,
        empId,
        empName,
        fromBranch: oldBranch,
        toBranch: targetBranch,
        transferOrderNo: orderNo,
        transferDate: effectiveDate,
        biometricShiftStatus: 'Completed & Shifted (FP + Card)',
        authorizedBy: 'Central HRD & Security Admin'
      };
      setTransferHistory(prev => [newAudit, ...prev]);

      setIsSyncing(false);
      setTransferModalUser(null);
      setToast(`Biometric Shift Completed! ${empName} (${empId}) transferred to ${targetBranch}. Existing Fingerprint & Card pushed to local terminals.`);
    }, 600);
  };

  const handleExport = () => {
    if (activeTab === 'directory') {
      const header = 'Employee ID,Full Name,Current Branch,Division,Department,Role,Biometric Mode,Card ID,Status,Transferred';
      const rows = filteredUsers.map(u => [
        u.id, u.name, u.currentBranch, u.division, u.department, u.role, u.biometricMode, u.cardId, u.status, u.isTransferred ? 'Yes' : 'No'
      ]);
      exportCsv(header, rows, `pubali-users-directory-${new Date().toISOString().slice(0, 10)}.csv`);
    } else {
      const header = 'Transfer ID,Employee ID,Full Name,From Branch,To Branch,Order No,Effective Date,Biometric Shift Status,Authorized By';
      const rows = transferHistory.map(t => [
        t.id, t.empId, t.empName, t.fromBranch, t.toBranch, t.transferOrderNo, t.transferDate, t.biometricShiftStatus, t.authorizedBy
      ]);
      exportCsv(header, rows, `pubali-transfers-history-${new Date().toISOString().slice(0, 10)}.csv`);
    }
  };

  const handleReset = () => {
    setSearch('');
    setSelectedDivision('All Divisions');
    setSelectedDept('All Departments');
    setStatusPill('All Status');
  };

  // KPI calculations
  const totalUsersCount = users.length;
  const pendingBioCount = users.filter(u => u.status === 'Pending Bio-Enrollment').length;
  const transferredCount = transferHistory.length;
  const activeCount = users.filter(u => u.status !== 'Pending Bio-Enrollment' && u.status !== 'Inactive').length;
  const enrolledCount = users.filter(u => u.status !== 'Pending Bio-Enrollment').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── TOP BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0e7490 50%, #0284c7 100%)',
        borderRadius: 10,
        padding: '16px 22px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 4px 16px rgba(14, 116, 144, 0.22)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            flexShrink: 0
          }}>
            👥
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>
                User Management & Biometric Directory
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.22)',
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                Branch Transfer & BioStar Shift
              </span>
            </div>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
              Nationwide Staff Biometric Credentials · Pubali Bank PLC · Centralized Suprema BioStar X
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 6,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 600
          }}>
            👆 Fingerprint + 💳 RFID Card
          </div>
          <div style={{
            background: '#10b981',
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 11.5,
            fontWeight: 700
          }}>
            ● {totalUsersCount.toLocaleString()} ENROLLED
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          icon="👥"
          label="Total Enrolled Staff"
          value={totalUsersCount.toLocaleString()}
          sub="Across 829 locations"
          color="#0284c7"
          iconBg="#e0f2fe"
          active={activeTab === 'directory' && statusPill === 'All Status' && !search && selectedDivision === 'All Divisions' && selectedDept === 'All Departments'}
          onClick={() => {
            setActiveTab('directory');
            setStatusPill('All Status');
            setSearch('');
            setSelectedDivision('All Divisions');
            setSelectedDept('All Departments');
            setPage(1);
          }}
        />
        <KpiCard
          icon="✅"
          label="Active Enrolled"
          value={`${enrolledCount.toLocaleString()} Staff`}
          sub="98.6% Biometric active"
          color="#16a34a"
          iconBg="#dcfce7"
          active={activeTab === 'directory' && statusPill === 'Active Enrolled'}
          onClick={() => {
            setActiveTab('directory');
            setStatusPill(s => s === 'Active Enrolled' ? 'All Status' : 'Active Enrolled');
            setPage(1);
          }}
        />
        <KpiCard
          icon="👤"
          label="Pending Bio-Enrollment"
          value={`${pendingBioCount} Staff`}
          sub="Action Required (New / Transfer)"
          color="#ea580c"
          iconBg="#ffedd5"
          active={activeTab === 'directory' && statusPill === 'Pending Bio-Enrollment'}
          onClick={() => {
            setActiveTab('directory');
            setStatusPill(s => s === 'Pending Bio-Enrollment' ? 'All Status' : 'Pending Bio-Enrollment');
            setPage(1);
          }}
        />
        <KpiCard
          icon="🔄"
          label="Biometric Shifted"
          value={`${transferredCount.toLocaleString()} Staff`}
          sub="Branch transfers logged"
          color="#0d9488"
          iconBg="#ccfbf1"
          active={activeTab === 'history' || statusPill === 'Transferred / Shifted'}
          onClick={() => {
            if (activeTab === 'history') {
              setActiveTab('directory');
              setStatusPill('Transferred / Shifted');
            } else {
              setActiveTab('history');
            }
            setPage(1);
          }}
        />
        <KpiCard
          icon="⚡"
          label="BioStar Sync Health"
          value="99.8%"
          sub="Real-time terminal sync"
          color="#059669"
          iconBg="#d1fae5"
          onClick={() => {
            if (onNavigate) {
              onNavigate('dev-status');
            } else {
              setToast('⚡ BioStar X Real-time Sync: All 1,658 nationwide biometric terminals operational (99.8% sync health).');
            }
          }}
        />
      </div>

      {/* ── TAB SELECTOR STRIP ── */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid #e2e8f0', paddingBottom: 6 }}>
        <button
          onClick={() => setActiveTab('directory')}
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'directory' ? '#0284c7' : 'transparent',
            color: activeTab === 'directory' ? '#fff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s'
          }}
        >
          📋 User &amp; Biometric Directory ({totalUsersCount.toLocaleString()})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'history' ? '#0d9488' : 'transparent',
            color: activeTab === 'history' ? '#fff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s'
          }}
        >
          🔄 Branch Transfer &amp; Shift Audit Log ({transferHistory.length})
        </button>
      </div>

      {/* ── ADVANCED HORIZONTAL FILTER BAR ── */}
      {activeTab === 'directory' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 4px', minHeight: 52, flexWrap: 'wrap' }}>
            {/* Icon */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', color: '#0284c7', flexShrink: 0 }}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Search Box */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <input
                style={{ height: 32, width: 220, padding: '0 28px 0 10px', fontSize: 12, border: 'none', outline: 'none', background: 'transparent', color: '#1e293b' }}
                placeholder="Search Employee ID, Name, Branch..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 4, top: 7, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 14 }}>
                  ✕
                </button>
              )}
            </div>

            <div style={{ width: 1, height: 28, background: '#e5e7eb', flexShrink: 0, margin: '0 2px' }} />

            {/* Division Dropdown */}
            <select
              value={selectedDivision}
              onChange={e => setSelectedDivision(e.target.value)}
              style={{
                margin: '0 4px', height: 32, padding: '0 8px', fontSize: 12,
                fontWeight: selectedDivision === divisions[0] ? 400 : 600,
                border: 'none', outline: 'none', background: 'transparent',
                color: selectedDivision === divisions[0] ? '#9ca3af' : '#1e293b',
                cursor: 'pointer', minWidth: 140, appearance: 'auto'
              }}
            >
              {divisions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <div style={{ width: 1, height: 28, background: '#e5e7eb', flexShrink: 0, margin: '0 2px' }} />

            {/* Department Dropdown */}
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              style={{
                margin: '0 4px', height: 32, padding: '0 8px', fontSize: 12,
                fontWeight: selectedDept === departments[0] ? 400 : 600,
                border: 'none', outline: 'none', background: 'transparent',
                color: selectedDept === departments[0] ? '#9ca3af' : '#1e293b',
                cursor: 'pointer', minWidth: 175, appearance: 'auto'
              }}
            >
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <div style={{ width: 1, height: 28, background: '#e5e7eb', flexShrink: 0, margin: '0 2px' }} />

            {/* Status Pills */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', margin: '0 6px', flexShrink: 0 }}>
              {statusPills.map(s => {
                const active = statusPill === s;
                const clrs = { 'All Status': '#0284c7', 'Active Enrolled': '#16a34a', 'Pending Bio-Enrollment': '#ea580c', 'Transferred / Shifted': '#0d9488', Inactive: '#dc2626' };
                const c = clrs[s] || '#0284c7';
                return (
                  <button
                    key={s}
                    onClick={() => setStatusPill(s)}
                    style={{
                      padding: '3px 9px',
                      fontSize: 11,
                      borderRadius: 20,
                      cursor: 'pointer',
                      fontWeight: active ? 700 : 400,
                      border: active ? `1.5px solid ${c}` : '1.5px solid transparent',
                      background: active ? c + '15' : 'transparent',
                      color: active ? c : '#9ca3af',
                      transition: 'all 0.12s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            <div style={{ flex: 1 }} />

            {/* Record Count */}
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', padding: '0 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {filteredUsers.length.toLocaleString()} records
            </span>

            <div style={{ width: 1, height: 28, background: '#e5e7eb', flexShrink: 0 }} />

            {/* Reset */}
            <button
              onClick={handleReset}
              style={{
                margin: '0 4px', padding: '5px 12px', fontSize: 11.5, fontWeight: 600,
                background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
                borderRadius: 6, transition: 'all 0.15s', flexShrink: 0
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#374151'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280'; }}
            >
              ↺ Reset
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExport}
              style={{
                margin: '6px 8px 6px 2px', padding: '6px 14px', fontSize: 11.5, fontWeight: 700,
                background: 'linear-gradient(135deg, #0369a1, #0284c7)', border: 'none', color: '#fff',
                cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5,
                boxShadow: '0 1px 4px rgba(2,132,199,0.3)', flexShrink: 0
              }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      )}

      {/* ── VIEW 1: USER DIRECTORY TABLE ── */}
      {activeTab === 'directory' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <th style={{ padding: '10px 14px' }}>Employee ID</th>
                  <th style={{ padding: '10px 14px' }}>Employee Name</th>
                  <th style={{ padding: '10px 14px' }}>Current Branch</th>
                  <th style={{ padding: '10px 14px' }}>Division</th>
                  <th style={{ padding: '10px 14px' }}>Department &amp; Role</th>
                  <th style={{ padding: '10px 14px' }}>Enrolled Biometric Mode</th>
                  <th style={{ padding: '10px 14px' }}>Card CSN</th>
                  <th style={{ padding: '10px 14px' }}>Terminal Sync</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Transfer Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u, idx) => {
                  const initials = u.name.split(' ').map(n => n[0]).slice(0, 2).join('');
                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: u.isTransferred ? '#f0fdf4' : idx % 2 === 0 ? '#fff' : '#fafafa',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={e => e.currentTarget.style.background = u.isTransferred ? '#f0fdf4' : idx % 2 === 0 ? '#fff' : '#fafafa'}
                    >
                      <td style={{ padding: '11px 14px', fontWeight: 700, color: '#0284c7' }}>
                        {u.id}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: u.isTransferred ? '#0d9488' : '#0284c7',
                            color: '#fff', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</div>
                            {u.isTransferred && (
                              <span style={{ fontSize: 10, color: '#047857', fontWeight: 600 }}>
                                🔄 Shifted from {u.originalBranch}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 600, color: '#1e293b' }}>
                        {u.currentBranch}
                      </td>
                      <td style={{ padding: '11px 14px', color: '#64748b' }}>
                        {u.division}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{u.role}</div>
                        <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{u.department}</div>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        {u.status === 'Pending Bio-Enrollment' ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '2px 8px', borderRadius: 12,
                            background: '#ffedd5', color: '#c2410c',
                            fontSize: 11, fontWeight: 600, border: '1px solid #fed7aa'
                          }}>
                            💳 RFID Only (FP Pending)
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '2px 8px', borderRadius: 12,
                            background: '#ecfdf5', color: '#065f46',
                            fontSize: 11, fontWeight: 600, border: '1px solid #a7f3d0'
                          }}>
                            👆 2 Fingers + 💳 RFID
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>
                        {u.cardId}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        {u.status === 'Pending Bio-Enrollment' ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 600, color: '#ea580c'
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ea580c' }} />
                            Action Req. (Bio Pending)
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 600,
                            color: u.isTransferred ? '#047857' : '#0284c7'
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: u.isTransferred ? '#10b981' : '#0284c7' }} />
                            {u.isTransferred ? 'Shifted & Active' : 'Synced'}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleOpenTransfer(u)}
                          style={{
                            padding: '5px 12px',
                            fontSize: 11,
                            fontWeight: 700,
                            background: '#f0fdfa',
                            border: '1px solid #99f6e4',
                            borderRadius: 5,
                            cursor: 'pointer',
                            color: '#0d9488',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#0d9488'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.color = '#0d9488'; }}
                        >
                          🔄 Transfer Branch
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div style={{
            padding: '10px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontSize: 11, color: '#64748b' }}>
              Page {page} of {totalPages} · {filteredUsers.length.toLocaleString()} total staff
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                ['«', () => setPage(1)],
                ['‹', () => setPage(p => Math.max(1, p - 1))],
                ['›', () => setPage(p => Math.min(totalPages, p + 1))],
                ['»', () => setPage(totalPages)]
              ].map(([lbl, fn], i) => {
                const disabled = (i < 2 && page === 1) || (i >= 2 && page === totalPages);
                return (
                  <button
                    key={i}
                    onClick={fn}
                    disabled={disabled}
                    style={{
                      width: 28, height: 28, borderRadius: 5, border: '1px solid #cbd5e1',
                      background: disabled ? '#f1f5f9' : '#fff', color: disabled ? '#cbd5e1' : '#334155',
                      cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {lbl}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 2: TRANSFER AUDIT HISTORY LOG ── */}
      {activeTab === 'history' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                Bank Branch Transfer &amp; Biometric Shift Audit Trail
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                Immutable historical record of personnel movements and terminal credential migration
              </div>
            </div>
            <button
              onClick={handleExport}
              style={{
                padding: '6px 14px', fontSize: 11.5, fontWeight: 700,
                background: 'linear-gradient(135deg, #0f766e, #0d9488)', border: 'none', color: '#fff',
                cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5
              }}
            >
              Export Audit CSV
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px' }}>Transfer ID</th>
                  <th style={{ padding: '10px 14px' }}>Employee</th>
                  <th style={{ padding: '10px 14px' }}>Previous Branch (Revoked)</th>
                  <th style={{ padding: '10px 14px' }}>Destination Branch (Active)</th>
                  <th style={{ padding: '10px 14px' }}>Transfer Order Ref</th>
                  <th style={{ padding: '10px 14px' }}>Effective Date</th>
                  <th style={{ padding: '10px 14px' }}>Biometric Shift Status</th>
                  <th style={{ padding: '10px 14px' }}>Authorized By</th>
                </tr>
              </thead>
              <tbody>
                {transferHistory.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0d9488' }}>{t.id}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.empName}</div>
                      <div style={{ fontSize: 10.5, color: '#64748b' }}>{t.empId}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#dc2626', fontWeight: 600 }}>
                      ❌ {t.fromBranch}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#16a34a', fontWeight: 700 }}>
                      ✅ {t.toBranch}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 11, color: '#334155' }}>
                      {t.transferOrderNo}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>
                      📅 {t.transferDate}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: '#ecfdf5', color: '#065f46',
                        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12
                      }}>
                        ⚡ {t.biometricShiftStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>
                      {t.authorizedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: EMPLOYEE BRANCH TRANSFER & BIOMETRIC SHIFT ── */}
      {transferModalUser && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            width: '100%',
            maxWidth: 620,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)',
              padding: '16px 22px',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#99f6e4', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  BioStar X Enterprise · Personnel Shift
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>
                  Employee Branch Transfer &amp; Biometric Reassignment
                </div>
              </div>
              <button
                onClick={() => setTransferModalUser(null)}
                style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Employee Quick Info Box */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                    {transferModalUser.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
                    ID: <strong style={{ color: '#0284c7' }}>{transferModalUser.id}</strong> · Role: {transferModalUser.role}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 600 }}>CURRENT POSTING</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#dc2626' }}>
                    {transferModalUser.currentBranch}
                  </div>
                </div>
              </div>

              {/* Enrolled Biometrics Box (Guaranteed Preservation) */}
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                padding: '12px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1d4ed8', fontWeight: 700, fontSize: 11.5 }}>
                  <span>🔒</span> Enrolled Biometric Credentials (Will Be Shifted Automatically)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8, fontSize: 11.5 }}>
                  <div style={{ background: '#fff', padding: '6px 10px', borderRadius: 6, border: '1px solid #dbeafe' }}>
                    <span style={{ color: '#64748b' }}>👆 Fingerprints:</span> <strong style={{ color: '#0f172a' }}>2 Enrolled Templates</strong>
                  </div>
                  <div style={{ background: '#fff', padding: '6px 10px', borderRadius: 6, border: '1px solid #dbeafe' }}>
                    <span style={{ color: '#64748b' }}>💳 RFID Card:</span> <strong style={{ color: '#0f172a' }}>{transferModalUser.cardId}</strong>
                  </div>
                </div>
                <div style={{ fontSize: 10.5, color: '#3b82f6', marginTop: 6 }}>
                  * Employee does not need to re-enroll. Existing biometric minutiae and RFID card serial number will be shifted directly to the destination branch BioStation 3 controllers.
                </div>
              </div>

              {/* Form: Select New Destination Branch */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
                  Target Destination Branch (নতুন বদলিকৃত ব্রাঞ্চ) *
                </label>
                <select
                  value={targetBranch}
                  onChange={e => setTargetBranch(e.target.value)}
                  style={{
                    height: 38,
                    padding: '0 10px',
                    borderRadius: 6,
                    border: '1.5px solid #0d9488',
                    fontSize: 12.5,
                    fontWeight: 600,
                    outline: 'none',
                    color: '#0f172a',
                    background: '#f0fdfa'
                  }}
                >
                  {branchList.map(b => (
                    <option key={b} value={b} disabled={b === transferModalUser.currentBranch}>
                      {b} {b === transferModalUser.currentBranch ? '(Current Branch)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Grid: Transfer Order No & Effective Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
                    Transfer Order Ref / Letter No *
                  </label>
                  <input
                    type="text"
                    value={transferOrderNo}
                    onChange={e => setTransferOrderNo(e.target.value)}
                    style={{
                      height: 36,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 12,
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
                    Effective Transfer Date *
                  </label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={e => setEffectiveDate(e.target.value)}
                    style={{
                      height: 36,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 12
                    }}
                  />
                </div>
              </div>

              {/* Automated BioStar Shift Pipeline Checklist */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  AUTOMATED BIOSTAR X PIPELINE ACTIONS (স্বয়ংক্রিয় প্রসেস):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#16a34a' }}>✔</span> Revoke credential access from <strong>{transferModalUser.currentBranch}</strong> controllers
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#16a34a' }}>✔</span> Push Fingerprint templates &amp; RFID card to <strong>{targetBranch}</strong> BioStation 3 terminals
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#16a34a' }}>✔</span> Update central Attendance roster and Access Level to new location
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => setTransferModalUser(null)}
                  disabled={isSyncing}
                  style={{
                    padding: '9px 16px',
                    fontSize: 12,
                    fontWeight: 600,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTransfer}
                  disabled={isSyncing}
                  style={{
                    padding: '9px 20px',
                    fontSize: 12,
                    fontWeight: 700,
                    background: isSyncing ? '#94a3b8' : 'linear-gradient(135deg, #0d9488, #0284c7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: isSyncing ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 6px rgba(13,148,136,0.3)'
                  }}
                >
                  {isSyncing ? '⚡ Shifting Biometrics...' : '🔄 Confirm Transfer & Shift Biometrics'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: '#0f172a',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          fontSize: 12.5,
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          border: '1px solid #334155'
        }}>
          <span>⚡ {toast}</span>
          <button onClick={() => setToast('')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
      )}
    </div>
  );
}
