/**
 * AccessControlPages.jsx — BioStar 2 Enterprise Access Control Suite
 * 
 * Includes 4 dedicated pages matching Time Attendance design excellence:
 * 1. AccessGroupPage     — Access Group Management & Tier Policy
 * 2. AccessLevelPage     — Access Level Hierarchical Tiers & Matrix
 * 3. DoorManagementPage  — Door Configuration, Controller Hardware & Remote Relay
 * 4. DoorStatusPage      — Real-time Door Relay, Magnetic Sensors & Alarm Loops
 */

import React, { useState, useMemo, useEffect } from 'react';
import { FULL_PUBALI_LOCATIONS, DIVISIONS_LIST } from '../data/pubaliFullBranches';
import { globalDoorStore } from '../services/doorStore';
import ReportDataTable from './reports/ReportDataTable';
import { REPORTS_CONFIG } from '../data/securityReportsData';
import { useBankFilters } from './filters/FilterContext';
import { TableColumnFilter } from './filters';
export { default as AccessControlDashboard } from './AccessControlDashboard';

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

// ─── SHARED MICRO COMPONENTS ────────────────────────────────────

function TopBanner({ icon, title, badge, subtitle, meta1, meta2, gradient, glowColor }) {
  return (
    <div style={{
      background: gradient,
      borderRadius: 10,
      padding: '16px 22px',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      boxShadow: `0 4px 16px ${glowColor || 'rgba(0,0,0,0.18)'}`
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
          {icon}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>
              {title}
            </span>
            {badge && (
              <span style={{
                background: 'rgba(255,255,255,0.22)',
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                {badge}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
            {subtitle}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {meta1 && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 6,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 600
          }}>
            {meta1}
          </div>
        )}
        {meta2 && (
          <div style={{
            background: meta2.bg || '#10b981',
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 11.5,
            fontWeight: 700
          }}>
            {meta2.text || meta2}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color, onClick, active }) {
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
        background: active ? color + '0d' : '#fff',
        border: `1px solid ${active ? color : '#e2e8f0'}`,
        borderRadius: 8,
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flex: '1 1 0',
        minWidth: 150,
        boxShadow: active ? `0 4px 14px ${color}28` : '0 1px 3px rgba(0,0,0,0.04)',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, background 0.16s ease',
        userSelect: 'none'
      }}
      onMouseEnter={e => {
        if (isClickable) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 6px 16px ${color}25`;
          e.currentTarget.style.borderColor = color;
        }
      }}
      onMouseLeave={e => {
        if (isClickable) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = active ? `0 4px 14px ${color}28` : '0 1px 3px rgba(0,0,0,0.04)';
          e.currentTarget.style.borderColor = active ? color : '#e2e8f0';
        }
      }}
    >
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          {isClickable && (
            <span style={{
              fontSize: 10,
              fontWeight: 800,
              color,
              background: color + '18',
              padding: '1px 5px',
              borderRadius: 3,
              lineHeight: 1
            }}>
              →
            </span>
          )}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1.15, marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const configs = {
    Locked: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e', text: 'Locked' },
    'Locked Down': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444', text: '🚨 Locked Down' },
    'Emergency Lockdown': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444', text: '🚨 Locked Down' },
    Unlocked: { bg: '#fef3c7', color: '#b45309', dot: '#f59e0b', text: 'Unlocked (Pulse)' },
    Alarm: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', text: 'Alarm Active' },
    'Door Forced Alarm': { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', text: 'Door Forced!' },
    'Override Unlocked': { bg: '#fed7aa', color: '#c2410c', dot: '#ea580c', text: 'Manual Override' },
    
    Closed: { bg: '#f0fdf4', color: '#166534', dot: '#22c55e', text: 'Closed' },
    Open: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', text: 'Open' },
    'Held Open Alert': { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444', text: 'Held Open Warning' },
    'Tamper Alert': { bg: '#fdf2f8', color: '#be185d', dot: '#ec4899', text: 'Tamper Switch' },

    Normal: { bg: '#ecfdf5', color: '#065f46', dot: '#10b981', text: 'Normal' },
    Warning: { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b', text: 'Warning' },
    Alert: { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444', text: 'Alert' },
    
    Active: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e', text: 'Active' },
    Strict: { bg: '#ede9fe', color: '#6d28d9', dot: '#8b5cf6', text: 'Dual Custody' }
  };

  const c = configs[status] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8', text: status };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      background: c.bg,
      color: c.color,
      fontSize: 11,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 12,
      whiteSpace: 'nowrap'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.text}
    </span>
  );
}

function PaginationBar({ currentPage, totalPages, setPage, count }) {
  if (count === 0) return null;
  return (
    <div style={{
      padding: '10px 16px',
      borderTop: '1px solid #e2e8f0',
      background: '#f8fafc',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span style={{ fontSize: 11, color: '#64748b' }}>
        Page {currentPage} of {totalPages} · {count.toLocaleString()} total entries
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        {[
          ['«', () => setPage(1)],
          ['‹', () => setPage(p => Math.max(1, p - 1))],
          ['›', () => setPage(p => Math.min(totalPages, p + 1))],
          ['»', () => setPage(totalPages)]
        ].map(([lbl, fn], i) => {
          const disabled = (i < 2 && currentPage === 1) || (i >= 2 && currentPage === totalPages);
          return (
            <button
              key={i}
              onClick={fn}
              disabled={disabled}
              style={{
                width: 28,
                height: 28,
                borderRadius: 5,
                border: '1px solid #cbd5e1',
                background: disabled ? '#f1f5f9' : '#fff',
                color: disabled ? '#cbd5e1' : '#334155',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {lbl}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toast({ msg, onClose }) {
  if (!msg) return null;
  return (
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
      border: '1px solid #334155',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <span>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}>✕</button>
    </div>
  );
}

// ================================================================
// 1. ACCESS GROUP PAGE (AC-01 Access Group Membership Specification)
// ================================================================
const ACCESS_GROUPS_DEF = [
  {
    id: 'AG-PB-001',
    name: 'Central Vault & Treasury Dual-Custody',
    clearanceLevel: 'Level 5 (Dual Custody)',
    tier: 'Level 5',
    schedule: 'Strict Dual Custody (09:30 - 16:30)',
    doors: 'Treasury Main Vault, Strong Room Airlock, Cash Safe',
    authMode: '2-Person Biometric Rule',
    color: '#dc2626',
    enrolledTotal: 1038
  },
  {
    id: 'AG-PB-002',
    name: 'Branch Banking Staff & Tellers',
    clearanceLevel: 'Level 2 (General Staff)',
    tier: 'Level 2',
    schedule: 'Banking Hours (08:30 - 18:30)',
    doors: 'Main Entrance, Teller Counter Doors 1-4, Back Office',
    authMode: 'Fingerprint + RFID Card',
    color: '#0284c7',
    enrolledTotal: 14200
  },
  {
    id: 'AG-PB-003',
    name: 'IT Infrastructure & Data Center Airlock',
    clearanceLevel: 'Level 4 (IT Clearance)',
    tier: 'Level 4',
    schedule: '24/7 Monitored Policy',
    doors: 'Server Room Airlock Interlock, NOC Operations, Telecom Core',
    authMode: 'Fingerprint + Card + PIN',
    color: '#7c3aed',
    enrolledTotal: 240
  },
  {
    id: 'AG-PB-004',
    name: 'Sub-Branch (Upashakha) Access Core',
    clearanceLevel: 'Level 2 (Upashakha Staff)',
    tier: 'Level 2',
    schedule: 'Banking Hours (08:30 - 17:30)',
    doors: 'Upashakha Front Door, Cash Drawer Safe, Officer Booth',
    authMode: 'Fingerprint + Card',
    color: '#0d9488',
    enrolledTotal: 1405
  },
  {
    id: 'AG-PB-005',
    name: 'Islamic Banking Wings & Shariah Board',
    clearanceLevel: 'Level 3 (Islamic Clearance)',
    tier: 'Level 3',
    schedule: 'Banking Hours (08:30 - 18:00)',
    doors: 'Islamic Wing Entrance, Shariah Suite, Document Archive',
    authMode: 'Fingerprint + RFID Card',
    color: '#059669',
    enrolledTotal: 232
  },
  {
    id: 'AG-PB-006',
    name: 'Regional Office Supervision & Audit',
    clearanceLevel: 'Level 4 (Regional DGM Tier)',
    tier: 'Level 4',
    schedule: 'Extended Hours (08:00 - 20:00)',
    doors: 'Regional GM Cabin, Audit Archive, Inspection Vault Review',
    authMode: 'Multi-Factor Biometric',
    color: '#d97706',
    enrolledTotal: 580
  },
  {
    id: 'AG-PB-007',
    name: 'Executive Suite & Board of Directors',
    clearanceLevel: 'Level 6 (Executive Clearance)',
    tier: 'Level 6',
    schedule: '24/7 VIP Unrestricted Pass',
    doors: 'Boardroom 01, MD Secretariat, VIP Executive Elevator',
    authMode: 'Fast Suprema Biometric',
    color: '#0f766e',
    enrolledTotal: 45
  },
  {
    id: 'AG-PB-008',
    name: 'ATM Custody & Cash Replenishment',
    clearanceLevel: 'Level 3 (ATM Custodian)',
    tier: 'Level 3',
    schedule: 'Dual Custody Transit (07:00 - 22:00)',
    doors: 'ATM Rear Service Door, Transit Vault Room, Cash Box Bay',
    authMode: 'Card + Dual Fingerprint',
    color: '#ea580c',
    enrolledTotal: 950
  },
  {
    id: 'AG-PB-009',
    name: 'Visitor & Vendor Escorted Access',
    clearanceLevel: 'Level 1 (Temporary Pass)',
    tier: 'Level 1',
    schedule: 'Visiting Hours (09:00 - 17:00)',
    doors: 'Public Lobby Doors, Reception Waiting Area Only',
    authMode: 'Card / QR Token',
    color: '#0284c7',
    enrolledTotal: 420
  }
];

function buildAccessGroupMembers() {
  const rows = [];
  let counter = 1;

  FULL_PUBALI_LOCATIONS.forEach((loc, li) => {
    const division = loc.division || loc.zone || 'Dhaka';
    const branchName = loc.name;

    if (loc.employees && Array.isArray(loc.employees) && loc.employees.length > 0) {
      loc.employees.forEach((emp, ei) => {
        let gIdx = 1;
        if (loc.category === 'sub-branch' || loc.name.includes('Upashakha')) {
          gIdx = 3;
        } else if (loc.category === 'islamic' || loc.name.includes('Islamic')) {
          gIdx = 4;
        } else if (loc.category === 'ho' || loc.name.includes('Head Office') || loc.name.includes('Principal')) {
          gIdx = [2, 6, 0, 1][ei % 4];
        } else if (loc.category === 'ro' || loc.name.includes('Regional')) {
          gIdx = [5, 2, 0][ei % 3];
        } else if (ei === 0) {
          gIdx = 0; // Chief Vault Custodian
        } else if (ei === 1) {
          gIdx = (li % 3 === 0) ? 7 : (li % 7 === 0) ? 2 : (li % 5 === 0) ? 5 : 1;
        } else if (ei === 2 && li % 20 === 0) {
          gIdx = 6; // Executive Board delegate
        } else {
          gIdx = 1; // General Branch Banking Staff
        }

        const group = ACCESS_GROUPS_DEF[gIdx];
        rows.push({
          rowId: counter++,
          groupId: group.id,
          groupName: group.name,
          employeeName: emp.name,
          employeeId: emp.id || `PB-${String(9000 + counter).padStart(5, '0')}`,
          branch: branchName,
          division: division,
          clearanceLevel: group.clearanceLevel,
          tier: group.tier,
          doors: group.doors,
          schedule: group.schedule,
          authMode: group.authMode,
          groupColor: group.color,
          status: emp.status || 'Active'
        });
      });
    }
  });

  return rows;
}

export function AccessGroupPage({ onNavigate }) {
  const {
    region: globalRegion,
    branch: globalBranch,
    searchQuery: globalSearch,
    moduleFilters = {},
    tableColumnFilters = {}
  } = useBankFilters();
  const allMembers = useMemo(() => buildAccessGroupMembers(), []);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All Access Groups');
  const [selectedDivision, setSelectedDivision] = useState('All Divisions');
  const [selectedTier, setSelectedTier] = useState('All Levels');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [modalEmployee, setModalEmployee] = useState(null);
  const [toast, setToast] = useState('');
  const pageSize = 30;

  const handleSort = (colKey) => {
    if (sortCol === colKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
  };

  const tierPills = ['All Levels', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'];

  const filtered = useMemo(() => {
    let result = allMembers.filter(r => {
      const q = (globalSearch || search || '').toLowerCase().trim();
      if (q) {
        const match =
          r.groupId.toLowerCase().includes(q) ||
          r.groupName.toLowerCase().includes(q) ||
          r.employeeName.toLowerCase().includes(q) ||
          r.employeeId.toLowerCase().includes(q) ||
          r.branch.toLowerCase().includes(q) ||
          r.division.toLowerCase().includes(q) ||
          r.doors.toLowerCase().includes(q) ||
          r.clearanceLevel.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (globalRegion && globalRegion !== 'All Regions') {
        const rLow = globalRegion.toLowerCase();
        if (!r.division.toLowerCase().includes(rLow) && !r.branch.toLowerCase().includes(rLow)) return false;
      }
      if (globalBranch && globalBranch !== 'All Branches') {
        const bLow = globalBranch.toLowerCase();
        if (!r.branch.toLowerCase().includes(bLow)) return false;
      }
      const sched = moduleFilters.scheduleType;
      if (sched && sched !== 'All') {
        if (sched === 'Banking' && !r.doors.toLowerCase().includes('banking') && !r.clearanceLevel.includes('General')) return false;
        if (sched === 'Continuous' && !r.doors.toLowerCase().includes('24/7') && !r.clearanceLevel.includes('Clearance') && !r.clearanceLevel.includes('Dual Custody')) return false;
        if (sched === 'Custom' && !r.doors.toLowerCase().includes('safe') && !r.doors.toLowerCase().includes('vault')) return false;
      }
      if (selectedGroup !== 'All Access Groups' && r.groupId !== selectedGroup) return false;
      if (selectedDivision !== 'All Divisions' && r.division !== selectedDivision) return false;
      if (selectedTier !== 'All Levels' && !r.tier.includes(selectedTier)) return false;

      for (const [key, val] of Object.entries(tableColumnFilters)) {
        if (val && typeof val === 'string') {
          const term = val.toLowerCase().trim();
          if (!term) continue;
          let cellVal = '';
          if (key === 'groupId') cellVal = r.groupId;
          else if (key === 'groupName') cellVal = r.groupName;
          else if (key === 'employee') cellVal = `${r.employeeName} ${r.employeeId}`;
          else if (key === 'branch') cellVal = `${r.branch} ${r.division}`;
          else if (key === 'clearance') cellVal = r.clearanceLevel;
          else if (key === 'doors') cellVal = r.doors;
          if (!cellVal.toLowerCase().includes(term)) return false;
        }
      }
      return true;
    });

    if (sortCol) {
      result = [...result].sort((a, b) => {
        let va = '';
        let vb = '';
        if (sortCol === 'groupId') { va = a.groupId; vb = b.groupId; }
        else if (sortCol === 'groupName') { va = a.groupName; vb = b.groupName; }
        else if (sortCol === 'employee') { va = a.employeeName; vb = b.employeeName; }
        else if (sortCol === 'branch') { va = a.branch; vb = b.branch; }
        else if (sortCol === 'clearance') { va = a.clearanceLevel; vb = b.clearanceLevel; }
        else if (sortCol === 'doors') { va = a.doors; vb = b.doors; }
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortDir === 'desc' ? -cmp : cmp;
      });
    }

    return result;
  }, [allMembers, search, globalSearch, globalRegion, globalBranch, moduleFilters, selectedGroup, selectedDivision, selectedTier, tableColumnFilters, sortCol, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [search, globalSearch, globalRegion, globalBranch, moduleFilters, selectedGroup, selectedDivision, selectedTier, tableColumnFilters]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Dashboard KPI metrics
  const kpis = useMemo(() => {
    return {
      totalGroups: ACCESS_GROUPS_DEF.length,
      totalMembers: allMembers.length,
      filteredMembers: filtered.length,
      doors: 1040,
      tiers: 6
    };
  }, [allMembers, filtered]);

  const handleExport = () => {
    const header = 'Group ID,Group Name,Employee,Branch,Clearance Level,Doors';
    const rows = filtered.map(r => [
      r.groupId,
      r.groupName,
      `${r.employeeName} (${r.employeeId})`,
      `${r.branch}, ${r.division}`,
      r.clearanceLevel,
      r.doors
    ]);
    exportCsv(header, rows, `pubali-access-group-members-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleReset = () => {
    setSearch('');
    setSelectedGroup('All Access Groups');
    setSelectedDivision('All Divisions');
    setSelectedTier('All Levels');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* TOP BANNER */}
      <TopBanner
        
        title="Access Group Membership"
        badge="AC-01 Official Tender Spec"
        subtitle="All employees per access group with door and schedule mapping — Pubali Bank PLC Nationwide"
        meta1="AC-01 Specification"
        meta2={{ bg: '#6366f1', text: `● ${ACCESS_GROUPS_DEF.length} ACTIVE GROUPS` }}
        gradient="linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4f46e5 100%)"
        glowColor="rgba(79, 70, 229, 0.22)"
      />

      {/* DASHBOARD KPI CARDS */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          
          label="Total Members"
          value={`${kpis.filteredMembers.toLocaleString()} Loaded`}
          sub="Enrolled biometric staff"
          color="#4f46e5"
          active={selectedGroup === 'All Access Groups' && selectedTier === 'All Levels' && selectedDivision === 'All Divisions' && !search}
          onClick={() => {
            handleReset();
            setToast(`Showing all ${kpis.totalMembers.toLocaleString()} access group members`);
          }}
          title="Click to reset filters and view all members"
        />
        <KpiCard
          
          label="Access Groups"
          value={`${kpis.totalGroups} Master Tiers`}
          sub="300 Regional profiles"
          color="#0284c7"
          active={selectedGroup !== 'All Access Groups'}
          onClick={() => {
            setSelectedGroup(g => g === 'All Access Groups' ? (ACCESS_GROUPS_DEF[0]?.id || 'AG-PB-001') : 'All Access Groups');
          }}
          title="Click to toggle Access Group filter"
        />
        <KpiCard
          
          label="Clearance Levels"
          value={`${kpis.tiers} Tiers`}
          sub="Level 1 to Level 6"
          color="#7c3aed"
          active={selectedTier !== 'All Levels'}
          onClick={() => {
            setSelectedTier(t => t === 'All Levels' ? 'Level 4' : 'All Levels');
          }}
          title="Click to filter clearance levels"
        />
        <KpiCard
          
          label="Covered Doors"
          value={`${kpis.doors.toLocaleString()} Doors`}
          sub="Across 829 branches"
          color="#0d9488"
          title="2,696 doors monitored nationwide"
        />
      </div>

      {/* COMPACT FILTER BAR */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 6px', minHeight: 52, flexWrap: 'wrap' }}>
          {/* Filter Icon */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', color: '#4f46e5', flexShrink: 0 }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <input
              style={{ height: 32, width: 230, padding: '0 28px 0 10px', fontSize: 12, border: 'none', outline: 'none', background: 'transparent', color: '#1e293b' }}
              placeholder="Search Employee, Group, Branch..."
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

          {/* Access Group Dropdown Filter */}
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            style={{
              margin: '0 4px', height: 32, padding: '0 8px', fontSize: 12,
              fontWeight: selectedGroup === 'All Access Groups' ? 400 : 600,
              border: 'none', outline: 'none', background: 'transparent',
              color: selectedGroup === 'All Access Groups' ? '#64748b' : '#1e293b',
              cursor: 'pointer', minWidth: 170, appearance: 'auto'
            }}
          >
            <option value="All Access Groups">All Access Groups ({ACCESS_GROUPS_DEF.length})</option>
            {ACCESS_GROUPS_DEF.map(g => (
              <option key={g.id} value={g.id}>{g.id} - {g.name}</option>
            ))}
          </select>

          <div style={{ width: 1, height: 28, background: '#e5e7eb', flexShrink: 0, margin: '0 2px' }} />

          {/* Division Dropdown Filter */}
          <select
            value={selectedDivision}
            onChange={e => setSelectedDivision(e.target.value)}
            style={{
              margin: '0 4px', height: 32, padding: '0 8px', fontSize: 12,
              fontWeight: selectedDivision === 'All Divisions' ? 400 : 600,
              border: 'none', outline: 'none', background: 'transparent',
              color: selectedDivision === 'All Divisions' ? '#64748b' : '#1e293b',
              cursor: 'pointer', minWidth: 130, appearance: 'auto'
            }}
          >
            <option value="All Divisions">All Divisions ({DIVISIONS_LIST.length})</option>
            {DIVISIONS_LIST.map(d => (
              <option key={d} value={d}>{d} Division</option>
            ))}
          </select>

          <div style={{ width: 1, height: 28, background: '#e5e7eb', flexShrink: 0, margin: '0 2px' }} />

          {/* Clearance Level Pills */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', margin: '0 6px', flexShrink: 0 }}>
            {tierPills.map(t => {
              const active = selectedTier === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTier(t)}
                  style={{
                    padding: '3px 9px',
                    fontSize: 11,
                    borderRadius: 20,
                    cursor: 'pointer',
                    fontWeight: active ? 700 : 400,
                    border: active ? '1.5px solid #4f46e5' : '1.5px solid transparent',
                    background: active ? '#4f46e515' : 'transparent',
                    color: active ? '#4f46e5' : '#64748b',
                    transition: 'all 0.12s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          {/* Record Count */}
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', padding: '0 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {filtered.length.toLocaleString()} members
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
              background: 'linear-gradient(135deg, #312e81, #4f46e5)', border: 'none', color: '#fff',
              cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: '0 1px 4px rgba(79,70,229,0.3)', flexShrink: 0
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* DATA TABLE: ONLY Group ID, Group Name, Employee, Branch, Clearance Level, Doors */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '10px 14px', width: 48, color: '#94a3b8' }}>#</th>
                <th style={{ padding: '10px 14px', width: 110, whiteSpace: 'nowrap' }}>
                  <span>Group ID</span>
                  <TableColumnFilter columnKey="groupId" title="Group ID" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', minWidth: 200, whiteSpace: 'nowrap' }}>
                  <span>Group Name</span>
                  <TableColumnFilter columnKey="groupName" title="Group Name" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', minWidth: 180, whiteSpace: 'nowrap' }}>
                  <span>Employee</span>
                  <TableColumnFilter columnKey="employee" title="Employee" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', minWidth: 180, whiteSpace: 'nowrap' }}>
                  <span>Branch</span>
                  <TableColumnFilter columnKey="branch" title="Branch" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', minWidth: 160, whiteSpace: 'nowrap' }}>
                  <span>Clearance Level</span>
                  <TableColumnFilter columnKey="clearance" title="Clearance Level" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', minWidth: 240, whiteSpace: 'nowrap' }}>
                  <span>Doors</span>
                  <TableColumnFilter columnKey="doors" title="Doors" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, idx) => {
                const serial = (page - 1) * pageSize + idx + 1;
                const isL6 = r.tier === 'Level 6';
                const isL5 = r.tier === 'Level 5';
                const isL4 = r.tier === 'Level 4';
                const isL3 = r.tier === 'Level 3';
                const isL2 = r.tier === 'Level 2';
                const badgeBg = isL6 ? '#f0fdfa' : isL5 ? '#fee2e2' : isL4 ? '#ede9fe' : isL3 ? '#fef3c7' : isL2 ? '#ecfdf5' : '#e0f2fe';
                const badgeColor = isL6 ? '#0f766e' : isL5 ? '#b91c1c' : isL4 ? '#6d28d9' : isL3 ? '#b45309' : isL2 ? '#047857' : '#0369a1';

                return (
                  <tr
                    key={r.rowId}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                      cursor: 'pointer',
                      transition: 'background 0.12s'
                    }}
                    onClick={() => setModalEmployee(r)}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'}
                    title="Click to view detailed employee clearance & door mapping"
                  >
                    {/* # Index */}
                    <td style={{ padding: '10px 14px', color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>
                      {serial}
                    </td>

                    {/* Group ID */}
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: 11.5,
                        color: '#4f46e5',
                        background: '#eef2ff',
                        padding: '2px 7px',
                        borderRadius: 4
                      }}>
                        {r.groupId}
                      </span>
                    </td>

                    {/* Group Name */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 12 }}>
                        {r.groupName}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 1 }}>
                        {r.schedule}
                      </div>
                    </td>

                    {/* Employee */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 12 }}>
                        {r.employeeName}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#64748b', fontFamily: 'monospace', marginTop: 1 }}>
                        ID: {r.employeeId}
                      </div>
                    </td>

                    {/* Branch */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 12 }}>
                        {r.branch}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 1 }}>
                        {r.division} Division
                      </div>
                    </td>

                    {/* Clearance Level */}
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 9px',
                        borderRadius: 5,
                        background: badgeBg,
                        color: badgeColor,
                        fontSize: 11,
                        fontWeight: 700
                      }}>
                        {r.clearanceLevel}
                      </span>
                    </td>

                    {/* Doors */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: 11.5, color: '#334155', fontWeight: 500, lineHeight: 1.35 }}>
                        {r.doors}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
            
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>No access group members found</div>
            <div style={{ fontSize: 11.5, marginTop: 4 }}>Try adjusting your search terms or clearing active filters.</div>
            <button
              onClick={handleReset}
              style={{ marginTop: 10, padding: '5px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 5, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
            >
              Reset Filters
            </button>
          </div>
        )}

        <PaginationBar
          currentPage={page}
          totalPages={totalPages}
          setPage={setPage}
          count={filtered.length}
        />
      </div>

      {/* DRILL-DOWN: EMPLOYEE CLEARANCE MODAL */}
      {modalEmployee && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
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
            maxWidth: 560,
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            overflow: 'hidden',
            border: '1px solid #cbd5e1'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              padding: '16px 20px',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{modalEmployee.employeeName}</div>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>ID: {modalEmployee.employeeId} · {modalEmployee.branch}</div>
                </div>
              </div>
              <button
                onClick={() => setModalEmployee(null)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 700 }}>GROUP ID & NAME</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#4f46e5', marginTop: 2 }}>{modalEmployee.groupId}</div>
                  <div style={{ fontSize: 11.5, color: '#1e293b', fontWeight: 600 }}>{modalEmployee.groupName}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 700 }}>CLEARANCE LEVEL</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{modalEmployee.clearanceLevel}</div>
                  <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Biometric Active</div>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: 12 }}>
                <div style={{ fontSize: 10.5, color: '#166534', fontWeight: 700 }}>ASSIGNED DOORS</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#14532d', marginTop: 3 }}>
                  {modalEmployee.doors}
                </div>
                <div style={{ fontSize: 11, color: '#15803d', marginTop: 2 }}>
                  Location: {modalEmployee.branch} ({modalEmployee.division} Division)
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: 12 }}>
                <div style={{ fontSize: 10.5, color: '#1d4ed8', fontWeight: 700 }}>SCHEDULE & AUTHENTICATION</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a8a', marginTop: 2 }}>
                  {modalEmployee.schedule}
                </div>
                <div style={{ fontSize: 11.5, color: '#3b82f6', marginTop: 2 }}>
                  Auth Mode: {modalEmployee.authMode}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => {
                    setToast(`Synchronized credentials for ${modalEmployee.employeeName} (${modalEmployee.employeeId})`);
                    setModalEmployee(null);
                  }}
                  style={{
                    padding: '8px 16px', fontSize: 12, fontWeight: 700,
                    background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer'
                  }}
                >
                  ✓ Sync Biometrics
                </button>
                <button
                  onClick={() => setModalEmployee(null)}
                  style={{
                    padding: '8px 16px', fontSize: 12, fontWeight: 600,
                    background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast msg={toast} onClose={() => setToast('')} />
    </div>
  );
}

// ================================================================
// 2. ACCESS LEVEL PAGE (AC-11 Access Level & Privilege Policy Spec)
// ================================================================
const ACCESS_LEVELS_MATRIX = [
  {
    tier: 'Level 1',
    name: 'Visitor & Temporary Pass',
    doors: 'Public Lobby Doors, Reception Waiting Area Only',
    auth: 'Card / QR Token',
    schedule: 'Sun-Thu 09:00 - 17:00 (Business Hours)',
    enrolled: 420,
    status: 'Active',
    color: '#0284c7',
    description: 'Restricted to public areas; escort required for entry to operational offices.'
  },
  {
    tier: 'Level 2',
    name: 'Branch General Staff',
    doors: 'Main Entrance, Teller Area, Staff Room, Filing Archive',
    auth: 'Fingerprint + RFID Card',
    schedule: 'Sun-Thu 08:30 - 18:30 (Work Shift)',
    enrolled: 14200,
    status: 'Active',
    color: '#16a34a',
    description: 'Day-to-day access for bank officers, clerks, and customer service staff.'
  },
  {
    tier: 'Level 3',
    name: 'Supervisory & Cash Officers',
    doors: 'Branch Cash Safe Entry, Manager Cabin, Record Vault, Server Closet',
    auth: 'Fingerprint + RFID Card + PIN',
    schedule: 'Sun-Thu 08:00 - 19:30 (Extended Operations)',
    enrolled: 2850,
    status: 'Active',
    color: '#d97706',
    description: 'Senior branch management and cashier supervisors with anti-passback tracking.'
  },
  {
    tier: 'Level 4',
    name: 'IT & Data Center Operations',
    doors: 'Server Rooms, Network NOC, Telecom Core, UPS & Battery Room',
    auth: 'Multi-Factor Biometric (Finger + PIN + Dual Card)',
    schedule: '24/7 Monitored Access (Full Schedule)',
    enrolled: 320,
    status: 'Active',
    color: '#7c3aed',
    description: 'Certified infrastructure engineers and central IT disaster recovery personnel.'
  },
  {
    tier: 'Level 5',
    name: 'Vault & Central Treasury Custody',
    doors: 'Main Strong Room, Armored Cash Vault, Gold Locker Safe',
    auth: 'Strict Dual Custody (Two-Person Simultaneous Rule)',
    schedule: 'Time-Locked Hours Only (10:00 - 16:00)',
    enrolled: 1038,
    status: 'Strict',
    color: '#dc2626',
    description: 'Dual custodian verification; requires primary and secondary keyholders to swipe within 15 seconds.'
  },
  {
    tier: 'Level 6',
    name: 'Board & Executive Directorate',
    doors: 'Executive Suite, Managing Director Secretariat, Boardroom',
    auth: 'Suprema Fast Touch Biometric',
    schedule: '24/7 Full Administrative Pass',
    enrolled: 45,
    status: 'Active',
    color: '#0f766e',
    description: 'Unrestricted access for Bank Board of Directors, Managing Director, and Deputy Managing Directors.'
  }
];

function buildAccessLevelCredentials() {
  const list = [];
  let counter = 1;

  FULL_PUBALI_LOCATIONS.forEach((loc, li) => {
    const division = loc.division || loc.zone || 'Dhaka';
    const branchName = loc.name;

    if (loc.employees && Array.isArray(loc.employees) && loc.employees.length > 0) {
      loc.employees.forEach((emp, ei) => {
        let tierIdx = 1; // Default Level 2
        if (loc.category === 'ho' || loc.name.includes('Head Office') || loc.name.includes('Principal')) {
          tierIdx = [3, 5, 4, 1][ei % 4];
        } else if (loc.category === 'ro' || loc.name.includes('Regional')) {
          tierIdx = [2, 3, 4][ei % 3];
        } else if (ei === 0) {
          tierIdx = 4; // Level 5 Vault Custodian
        } else if (ei === 1) {
          tierIdx = (li % 2 === 0) ? 2 : 1; // Level 3 or Level 2
        } else {
          tierIdx = 1; // Level 2 General Staff
        }

        const m = ACCESS_LEVELS_MATRIX[tierIdx];
        const isExp = (li * 17 + ei) % 73 === 0;
        const isSoon = !isExp && (li * 11 + ei) % 29 === 0;
        const status = isExp ? 'Expired' : isSoon ? 'Expiring Soon' : 'Active';
        const expiryDate = isExp ? '01-Sep-2026' : isSoon ? '15-Oct-2026' : '31-Dec-2026';
        const daysRemaining = isExp ? '-13 Days' : isSoon ? '+31 Days' : '+108 Days';

        list.push({
          id: counter++,
          employeeName: emp.name,
          employeeId: emp.id || `PB-${String(9000 + counter).padStart(5, '0')}`,
          accessLevel: `${m.tier} - ${m.name}`,
          tier: m.tier,
          tierColor: m.color,
          branch: branchName,
          division,
          authorizedDoors: m.doors,
          authMode: m.auth,
          schedule: m.schedule,
          expiryDate,
          daysRemaining,
          status
        });
      });
    }
  });

  return list;
}

export function AccessLevelPage({ onNavigate }) {
  const {
    region: globalRegion,
    branch: globalBranch,
    searchQuery: globalSearch,
    moduleFilters = {},
    tableColumnFilters = {}
  } = useBankFilters();
  const allCredentials = useMemo(() => buildAccessLevelCredentials(), []);
  const [search, setSearch] = useState('');
  const [tierPill, setTierPill] = useState('All Levels');
  const [statusPill, setStatusPill] = useState('All Status');
  const [selectedDivision, setSelectedDivision] = useState('All Divisions');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [toast, setToast] = useState('');
  const [page, setPage] = useState(1);
  const [activeKpi, setActiveKpi] = useState('expired');
  const pageSize = 30;

  const handleSort = (colKey) => {
    if (sortCol === colKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
  };

  const tierPills = ['All Levels', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'];
  const statusPills = ['All Status', 'Expired', 'Expiring Soon', 'Active'];

  const filtered = useMemo(() => {
    let result = allCredentials.filter(r => {
      const q = (globalSearch || search || '').toLowerCase().trim();
      if (q) {
        const match =
          r.employeeName.toLowerCase().includes(q) ||
          r.employeeId.toLowerCase().includes(q) ||
          r.accessLevel.toLowerCase().includes(q) ||
          r.branch.toLowerCase().includes(q) ||
          r.division.toLowerCase().includes(q) ||
          r.authorizedDoors.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (globalRegion && globalRegion !== 'All Regions') {
        const rLow = globalRegion.toLowerCase();
        if (!r.division.toLowerCase().includes(rLow) && !r.branch.toLowerCase().includes(rLow)) return false;
      }
      if (globalBranch && globalBranch !== 'All Branches') {
        const bLow = globalBranch.toLowerCase();
        if (!r.branch.toLowerCase().includes(bLow)) return false;
      }
      const sched = moduleFilters.scheduleType;
      if (sched && sched !== 'All') {
        if (sched === 'Banking' && !r.authorizedDoors.toLowerCase().includes('banking') && !r.tier.includes('Working Shift')) return false;
        if (sched === 'Continuous' && !r.authorizedDoors.toLowerCase().includes('24/7') && !r.tier.includes('24/7')) return false;
        if (sched === 'Custom' && !r.authorizedDoors.toLowerCase().includes('vault') && !r.tier.includes('Dual Custody')) return false;
      }
      if (selectedDivision !== 'All Divisions' && r.division !== selectedDivision) return false;
      if (tierPill !== 'All Levels' && !r.tier.includes(tierPill)) return false;
      if (statusPill !== 'All Status' && r.status !== statusPill) return false;

      for (const [key, val] of Object.entries(tableColumnFilters)) {
        if (val && typeof val === 'string') {
          const term = val.toLowerCase().trim();
          if (!term) continue;
          let cellVal = '';
          if (key === 'employee') cellVal = `${r.employeeName} ${r.employeeId}`;
          else if (key === 'accessLevel') cellVal = r.accessLevel;
          else if (key === 'branch') cellVal = `${r.branch} ${r.division}`;
          else if (key === 'tier') cellVal = r.tier;
          else if (key === 'authorizedDoors') cellVal = r.authorizedDoors;
          else if (key === 'expiryDate') cellVal = r.expiryDate;
          else if (key === 'status') cellVal = r.status;
          if (!cellVal.toLowerCase().includes(term)) return false;
        }
      }
      return true;
    });

    if (sortCol) {
      result = [...result].sort((a, b) => {
        let va = '';
        let vb = '';
        if (sortCol === 'employee') { va = a.employeeName; vb = b.employeeName; }
        else if (sortCol === 'accessLevel') { va = a.accessLevel; vb = b.accessLevel; }
        else if (sortCol === 'branch') { va = a.branch; vb = b.branch; }
        else if (sortCol === 'tier') { va = a.tier; vb = b.tier; }
        else if (sortCol === 'authorizedDoors') { va = a.authorizedDoors; vb = b.authorizedDoors; }
        else if (sortCol === 'expiryDate') { va = a.expiryDate; vb = b.expiryDate; }
        else if (sortCol === 'status') { va = a.status; vb = b.status; }
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortDir === 'desc' ? -cmp : cmp;
      });
    }

    return result;
  }, [allCredentials, search, globalSearch, globalRegion, globalBranch, moduleFilters, selectedDivision, tierPill, statusPill, tableColumnFilters, sortCol, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [search, globalSearch, globalRegion, globalBranch, moduleFilters, selectedDivision, tierPill, statusPill, tableColumnFilters]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // KPIs dynamically computed from filtered rows
  const kpis = useMemo(() => {
    const expiredCount = filtered.filter(r => r.status === 'Expired').length;
    const expiringSoonCount = filtered.filter(r => r.status === 'Expiring Soon').length;
    const activeCount = filtered.filter(r => r.status === 'Active').length;
    return {
      total: filtered.length,
      expired: expiredCount,
      expiringSoon: expiringSoonCount,
      active: activeCount,
      tiers: ACCESS_LEVELS_MATRIX.length
    };
  }, [filtered]);

  const handleReset = () => {
    setSearch('');
    setTierPill('All Levels');
    setStatusPill('All Status');
    setSelectedDivision('All Divisions');
    setActiveKpi('all');
  };

  const handleExport = () => {
    const header = 'Employee Name,Employee ID,Access Level,Branch,Division,Clearance Tier,Authorized Doors,Expiry Date,Status,Days Remaining';
    const rows = filtered.map(r => [
      r.employeeName, r.employeeId, r.accessLevel, r.branch, r.division, r.tier, r.authorizedDoors, r.expiryDate, r.status, r.daysRemaining
    ]);
    exportCsv(header, rows, `pubali-access-level-credentials-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* TOP BANNER */}
      <TopBanner
        
        title="Access Level Expiry & Renewal"
        badge="AC-11 Official Tender Spec"
        subtitle="Tracks time-bound access credentials, clearance tiers and authorized doors across 829 branches"
        meta1="AC-11 Specification"
        meta2={{ bg: '#0d9488', text: '● 6 CLEARANCE TIERS' }}
        gradient="linear-gradient(135deg, #042f2e 0%, #0d9488 50%, #0284c7 100%)"
        glowColor="rgba(13, 148, 136, 0.24)"
      />

      {/* DASHBOARD KPI CARDS */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          
          label="Total Credentials"
          value={`${kpis.total.toLocaleString()} Tracked`}
          sub="All enrolled passes"
          color="#0284c7"
          iconBg="#e0f2fe"
          active={statusPill === 'All Status' && tierPill === 'All Levels' && selectedDivision === 'All Divisions' && !search}
          onClick={() => {
            handleReset();
            setToast(`Showing all ${kpis.total.toLocaleString()} access level credentials`);
          }}
          title="Click to reset filters and view all credentials"
        />
        <KpiCard
          
          label="Expired Credentials"
          value={`${kpis.expired} Overdue`}
          sub="Requires immediate renewal"
          color="#dc2626"
          iconBg="#fee2e2"
          active={statusPill === 'Expired'}
          onClick={() => {
            setStatusPill(s => s === 'Expired' ? 'All Status' : 'Expired');
            setToast(`Filtered: ${kpis.expired} Expired Credentials requiring renewal`);
          }}
          title="Click to filter Expired Credentials"
        />
        <KpiCard
          
          label="Expiring Soon (30d)"
          value={`${kpis.expiringSoon} Passes`}
          sub="Renewal window open"
          color="#d97706"
          iconBg="#fef3c7"
          active={statusPill === 'Expiring Soon'}
          onClick={() => {
            setStatusPill(s => s === 'Expiring Soon' ? 'All Status' : 'Expiring Soon');
            setToast(`Filtered: ${kpis.expiringSoon} credentials expiring within 30 days`);
          }}
          title="Click to filter Expiring Soon credentials"
        />
        <KpiCard
          
          label="Active Passes"
          value={kpis.active.toLocaleString()}
          sub="Biometric access valid"
          color="#16a34a"
          iconBg="#dcfce7"
          active={statusPill === 'Active'}
          onClick={() => {
            setStatusPill(s => s === 'Active' ? 'All Status' : 'Active');
            setToast('Filtered: Active Validated Passes');
          }}
          title="Click to filter Active passes"
        />
      </div>

      {/* FILTER BAR */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 6px', minHeight: 52, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', color: '#0d9488', flexShrink: 0 }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
          </div>

          <div style={{ position: 'relative', flexShrink: 0 }}>
            <input
              style={{ height: 32, width: 230, padding: '0 28px 0 10px', fontSize: 12, border: 'none', outline: 'none', background: 'transparent', color: '#1e293b' }}
              placeholder="Search Employee, Level, Door..."
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
              fontWeight: selectedDivision === 'All Divisions' ? 400 : 600,
              border: 'none', outline: 'none', background: 'transparent',
              color: selectedDivision === 'All Divisions' ? '#64748b' : '#1e293b',
              cursor: 'pointer', minWidth: 130, appearance: 'auto'
            }}
          >
            <option value="All Divisions">All Divisions ({DIVISIONS_LIST.length})</option>
            {DIVISIONS_LIST.map(d => (
              <option key={d} value={d}>{d} Division</option>
            ))}
          </select>

          <div style={{ width: 1, height: 28, background: '#e5e7eb', flexShrink: 0, margin: '0 2px' }} />

          {/* Tier Pills */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', margin: '0 6px', flexShrink: 0 }}>
            {tierPills.map(t => {
              const active = tierPill === t;
              return (
                <button
                  key={t}
                  onClick={() => setTierPill(t)}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    borderRadius: 20,
                    cursor: 'pointer',
                    fontWeight: active ? 700 : 400,
                    border: active ? '1.5px solid #0d9488' : '1.5px solid transparent',
                    background: active ? '#0d948815' : 'transparent',
                    color: active ? '#0d9488' : '#64748b',
                    transition: 'all 0.12s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 28, background: '#e5e7eb', flexShrink: 0, margin: '0 2px' }} />

          {/* Status Pills */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', margin: '0 6px', flexShrink: 0 }}>
            {statusPills.map(s => {
              const active = statusPill === s;
              const clrs = { 'All Status': '#0d9488', Expired: '#dc2626', 'Expiring Soon': '#d97706', Active: '#16a34a' };
              const c = clrs[s] || '#0d9488';
              return (
                <button
                  key={s}
                  onClick={() => setStatusPill(s)}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    borderRadius: 20,
                    cursor: 'pointer',
                    fontWeight: active ? 700 : 400,
                    border: active ? `1.5px solid ${c}` : '1.5px solid transparent',
                    background: active ? c + '15' : 'transparent',
                    color: active ? c : '#64748b',
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

          {/* Permission Matrix Button */}
          <button
            onClick={() => setMatrixOpen(true)}
            style={{
              padding: '5px 11px', fontSize: 11.5, fontWeight: 700,
              background: '#f0fdfa', border: '1px solid #99f6e4', color: '#0f766e',
              borderRadius: 6, cursor: 'pointer', marginRight: 6, flexShrink: 0
            }}
          >
            Permission Matrix
          </button>

          {/* Count */}
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', padding: '0 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {filtered.length.toLocaleString()} records
          </span>

          <div style={{ width: 1, height: 28, background: '#e5e7eb', flexShrink: 0 }} />

          {/* Reset */}
          <button
            onClick={handleReset}
            style={{
              margin: '0 4px', padding: '5px 10px', fontSize: 11.5, fontWeight: 600,
              background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
              borderRadius: 6, flexShrink: 0
            }}
          >
            ↺ Reset
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExport}
            style={{
              margin: '6px 8px 6px 2px', padding: '6px 13px', fontSize: 11.5, fontWeight: 700,
              background: 'linear-gradient(135deg, #0f766e, #0d9488)', border: 'none', color: '#fff',
              cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: '0 1px 4px rgba(13,148,136,0.3)', flexShrink: 0
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* DATA TABLE - Columns: Employee, Access Level, Branch, Clearance Tier, Authorized Doors, Expiry Date, Status */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '10px 14px', width: 48, color: '#94a3b8' }}>#</th>
                <th style={{ padding: '10px 14px', minWidth: 180, whiteSpace: 'nowrap' }}>
                  <span>Employee</span>
                  <TableColumnFilter columnKey="employee" title="Employee" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', minWidth: 200, whiteSpace: 'nowrap' }}>
                  <span>Access Level</span>
                  <TableColumnFilter columnKey="accessLevel" title="Access Level" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', minWidth: 180, whiteSpace: 'nowrap' }}>
                  <span>Branch</span>
                  <TableColumnFilter columnKey="branch" title="Branch" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', minWidth: 120, whiteSpace: 'nowrap' }}>
                  <span>Clearance Tier</span>
                  <TableColumnFilter columnKey="tier" title="Clearance Tier" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', minWidth: 220, whiteSpace: 'nowrap' }}>
                  <span>Authorized Doors</span>
                  <TableColumnFilter columnKey="authorizedDoors" title="Authorized Doors" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', minWidth: 140, whiteSpace: 'nowrap' }}>
                  <span>Expiry Date</span>
                  <TableColumnFilter columnKey="expiryDate" title="Expiry Date" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', minWidth: 110, whiteSpace: 'nowrap' }}>
                  <span>Status</span>
                  <TableColumnFilter columnKey="status" title="Status" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, idx) => {
                const serial = (page - 1) * pageSize + idx + 1;
                const isExp = r.status === 'Expired';
                const isSoon = r.status === 'Expiring Soon';

                return (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isExp ? '#fff1f2' : idx % 2 === 0 ? '#fff' : '#fafbfc',
                      cursor: 'pointer',
                      transition: 'background 0.12s'
                    }}
                    onClick={() => setModalItem(r)}
                    onMouseEnter={e => e.currentTarget.style.background = isExp ? '#ffe4e6' : '#f0fdfa'}
                    onMouseLeave={e => e.currentTarget.style.background = isExp ? '#fff1f2' : idx % 2 === 0 ? '#fff' : '#fafbfc'}
                    title="Click to inspect employee credential & permission details"
                  >
                    <td style={{ padding: '10px 14px', color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>{serial}</td>

                    {/* Employee */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 12 }}>{r.employeeName}</div>
                      <div style={{ fontSize: 10.5, color: '#64748b', fontFamily: 'monospace' }}>ID: {r.employeeId}</div>
                    </td>

                    {/* Access Level */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#0d9488', fontSize: 12 }}>{r.accessLevel}</div>
                      <div style={{ fontSize: 10.5, color: '#64748b' }}>{r.authMode}</div>
                    </td>

                    {/* Branch */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 12 }}>{r.branch}</div>
                      <div style={{ fontSize: 10.5, color: '#64748b' }}>{r.division} Division</div>
                    </td>

                    {/* Clearance Tier */}
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                        background: r.tierColor + '18', color: r.tierColor, fontSize: 11, fontWeight: 700
                      }}>
                        {r.tier}
                      </span>
                    </td>

                    {/* Authorized Doors */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: 11.5, color: '#334155', fontWeight: 500, lineHeight: 1.35 }}>
                        {r.authorizedDoors}
                      </div>
                    </td>

                    {/* Expiry Date */}
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: isExp ? '#dc2626' : isSoon ? '#d97706' : '#1e293b' }}>
                        {r.expiryDate}
                      </div>
                      <div style={{ fontSize: 10.5, fontWeight: 600, color: isExp ? '#b91c1c' : isSoon ? '#b45309' : '#64748b' }}>
                        {r.daysRemaining}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <StatusPill status={r.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
            
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>No access level credentials found</div>
            <button
              onClick={handleReset}
              style={{ marginTop: 10, padding: '5px 14px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 5, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
            >
              Reset Filters
            </button>
          </div>
        )}

        <PaginationBar
          currentPage={page}
          totalPages={totalPages}
          setPage={setPage}
          count={filtered.length}
        />
      </div>

      {/* MODAL: CREDENTIAL INSPECTION */}
      {modalItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
        }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 540, boxShadow: '0 20px 40px rgba(0,0,0,0.25)', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            <div style={{ background: 'linear-gradient(135deg, #042f2e, #0d9488)', padding: '16px 20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{modalItem.employeeName}</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>ID: {modalItem.employeeId} · {modalItem.branch}</div>
              </div>
              <button onClick={() => setModalItem(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 700 }}>ACCESS LEVEL</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0d9488', marginTop: 2 }}>{modalItem.accessLevel}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 700 }}>STATUS & EXPIRY</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: modalItem.status === 'Expired' ? '#dc2626' : '#059669', marginTop: 2 }}>{modalItem.status} ({modalItem.expiryDate})</div>
                </div>
              </div>
              <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 6, padding: 12 }}>
                <div style={{ fontSize: 10.5, color: '#0f766e', fontWeight: 700 }}>AUTHORIZED DOORS</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#134e4a', marginTop: 3 }}>{modalItem.authorizedDoors}</div>
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: 12 }}>
                <div style={{ fontSize: 10.5, color: '#1d4ed8', fontWeight: 700 }}>SCHEDULE & AUTHENTICATION</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a8a', marginTop: 2 }}>{modalItem.schedule}</div>
                <div style={{ fontSize: 11.5, color: '#3b82f6', marginTop: 2 }}>{modalItem.authMode}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => {
                    setToast(`Renewed access pass for ${modalItem.employeeName} until Dec 31, 2027`);
                    setModalItem(null);
                  }}
                  style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700, background: '#0d9488', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                >
                  ✓ Renew Credential (1 Year)
                </button>
                <button onClick={() => setModalItem(null)} style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PERMISSION MATRIX */}
      {matrixOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
        }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 760, boxShadow: '0 20px 40px rgba(0,0,0,0.25)', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            <div style={{ background: 'linear-gradient(135deg, #042f2e, #0d9488)', padding: '16px 20px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>Clearance Level Permission Matrix</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>Suprema BioStar X Enterprise Tier Authorization Matrix</div>
              </div>
              <button onClick={() => setMatrixOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', color: '#334155', fontWeight: 700 }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Clearance Tier</th>
                    <th style={{ padding: '8px 6px' }}>Main Entry</th>
                    <th style={{ padding: '8px 6px' }}>Teller Safe</th>
                    <th style={{ padding: '8px 6px' }}>Record Archive</th>
                    <th style={{ padding: '8px 6px' }}>Server NOC</th>
                    <th style={{ padding: '8px 6px' }}>Treasury Vault</th>
                    <th style={{ padding: '8px 6px' }}>Boardroom</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Level 1 (Visitor)', 'Low Auth', 'Denied', 'Denied', 'Denied', 'Denied', 'Denied'],
                    ['Level 2 (Staff)', 'Bio + Card', 'Staff Safe', 'Archive', 'Denied', 'Denied', 'Denied'],
                    ['Level 3 (Supervisor)', 'Full Hour', 'Supervisor', 'Full', 'Escorted', 'Denied', 'Denied'],
                    ['Level 4 (IT / NOC)', '24/7 Pass', 'Denied', 'IT Archive', 'Airlock Interlock', 'Denied', 'Denied'],
                    ['Level 5 (Vault Custodian)', 'Full Pass', 'Full Safe', 'Full', 'Escorted', 'Dual Custody', 'Denied'],
                    ['Level 6 (Executive / Board)', 'VIP Priority', 'Executive', 'Executive', 'VIP Pass', 'Board View', 'Full Access']
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#0f172a' }}>{row[0]}</td>
                      {row.slice(1).map((col, j) => (
                        <td key={j} style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600, fontSize: 10.5, color: (!col.includes('Denied') && !col.includes('Escorted')) ? '#15803d' : col.includes('Dual Custody') ? '#b91c1c' : '#94a3b8' }}>{col}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                <button onClick={() => setMatrixOpen(false)} style={{ padding: '7px 16px', fontSize: 12, fontWeight: 600, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast msg={toast} onClose={() => setToast('')} />
    </div>
  );
}

// ================================================================
// 3. DOOR MANAGEMENT PAGE (AC-03 Door Access Configuration Audit)
// ================================================================
function buildAllDoors() {
  const doors = [];
  const hardwareTypes = ['Mag Lock (600 lbs)', 'Fail-Secure Solenoid', 'Airlock Interlock', 'Motorized Turnstile', 'Heavy Vault Armored Bolt'];

  FULL_PUBALI_LOCATIONS.forEach(loc => {
    if (loc.doorList && loc.doorList.length > 0) {
      loc.doorList.forEach((d, i) => {
        const id = `DOR-${loc.code || 'PB'}-${String(i + 1).padStart(2, '0')}`;
        const lockType = d.type === 'Turnstile' ? 'Motorized Turnstile' :
          d.type === 'Interlock' ? 'Airlock Interlock' :
          d.name.includes('Vault') ? 'Heavy Vault Armored Bolt' :
          hardwareTypes[i % hardwareTypes.length];
        const controller = loc.devices && loc.devices[0] ? loc.devices[0].name : 'BioStation 3';
        const controllerModel = loc.devices && loc.devices[0] ? (loc.devices[0].model || 'BioStation 3') : 'CoreStation CS-40';

        const authMode = (d.name.includes('Vault') || d.name.includes('Treasury')) ? 'Dual Custody (Bio+PIN)' :
          (d.name.includes('Server') || d.name.includes('NOC')) ? 'Biometric + Card (2FA)' :
          d.name.includes('Main') ? 'Card + Biometric' :
          d.name.includes('Cash') ? 'Fingerprint + PIN' : 'Fingerprint + Card';

        const schedule = (d.name.includes('Server') || d.name.includes('NOC')) ? '24/7 Full Access' :
          (d.name.includes('Vault') || d.name.includes('Treasury')) ? 'Cash Hours (09:30–16:30)' :
          d.name.includes('Main') ? 'Banking Shift (08:30–18:30)' :
          'Standard Banking (08:30–18:30)';

        doors.push({
          id,
          name: d.name,
          fullName: `${loc.name} - ${d.name}`,
          branch: loc.name,
          division: loc.division || 'Dhaka',
          zone: loc.zone || loc.division || 'Dhaka Central',
          group: d.group || 'Branch General Staff',
          lockType,
          authMode,
          schedule,
          controller: `${controller} (${controllerModel})`,
          state: d.status || 'Locked',
          relayCondition: d.status === 'Locked' ? 'Normal Locked' : 'Unlocked (Pulse)',
          sensorState: d.sensor || 'Closed',
          antiPassback: d.name.includes('Vault') || d.name.includes('Main') ? 'Enforced (10m)' : 'Standard'
        });
      });
    }
  });
  return doors;
}

export function DoorManagementPage({ onNavigate, initialTab = 'doors' }) {
  const {
    region: globalRegion,
    branch: globalBranch,
    searchQuery: globalSearch,
    moduleFilters = {},
    tableColumnFilters = {}
  } = useBankFilters();
  const [doorSubTab, setDoorSubTab] = useState(
    initialTab === 'door-held-open' || initialTab === 'held-open'
      ? 'door-held-open'
      : initialTab === 'occupancy-report' || initialTab === 'occupancy'
      ? 'occupancy-report'
      : 'doors'
  );
  const allDoors = useMemo(() => buildAllDoors(), []);
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All Divisions');
  const [hardwarePill, setHardwarePill] = useState('All Locks');
  const [statePill, setStatePill] = useState('All States');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [doorStates, setDoorStates] = useState({});
  const [toast, setToast] = useState('');
  const [activeKpi, setActiveKpi] = useState('all');
  const pageSize = 30;

  const handleSort = (colKey) => {
    if (sortCol === colKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
  };

  const divisions = ['All Divisions', ...DIVISIONS_LIST];
  const hardwarePills = ['All Locks', 'Mag Lock (600 lbs)', 'Fail-Secure Solenoid', 'Airlock Interlock', 'Motorized Turnstile', 'Heavy Vault Armored Bolt'];
  const statePills = ['All States', 'Locked', 'Unlocked', 'Override Unlocked'];

  const filtered = useMemo(() => {
    let result = allDoors.filter(d => {
      const liveState = doorStates[d.id] || d.state;
      const q = (globalSearch || search || '').toLowerCase().trim();
      if (q) {
        const match = d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || d.branch.toLowerCase().includes(q) || d.group.toLowerCase().includes(q) || d.authMode.toLowerCase().includes(q) || d.schedule.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (globalRegion && globalRegion !== 'All Regions') {
        const rLow = globalRegion.toLowerCase();
        if (!d.division.toLowerCase().includes(rLow) && !d.branch.toLowerCase().includes(rLow)) return false;
      }
      if (globalBranch && globalBranch !== 'All Branches') {
        const bLow = globalBranch.toLowerCase();
        if (!d.branch.toLowerCase().includes(bLow)) return false;
      }
      const secClass = moduleFilters.doorSecurityClass;
      if (secClass && secClass !== 'All') {
        const nLow = d.name.toLowerCase();
        const isClass1 = nLow.includes('vault') || nLow.includes('strongroom') || d.lockType.includes('Vault');
        const isClass2 = nLow.includes('server') || nLow.includes('noc') || nLow.includes('data');
        const isClass3 = nLow.includes('cash') || nLow.includes('teller');
        if (secClass === 'Class1' && !isClass1) return false;
        if (secClass === 'Class2' && !isClass2) return false;
        if (secClass === 'Class3' && !isClass3) return false;
        if (secClass === 'Class4' && (isClass1 || isClass2 || isClass3)) return false;
      }
      const mLock = moduleFilters.lockState;
      if (mLock && mLock !== 'All') {
        if (mLock === 'Locked' && liveState !== 'Locked') return false;
        if (mLock === 'Unlocked' && liveState !== 'Unlocked') return false;
        if (mLock === 'ForcedOpen' && liveState !== 'Override Unlocked') return false;
        if (mLock === 'HeldOpen' && liveState !== 'Unlocked') return false;
      }
      if (selectedDivision !== 'All Divisions' && d.division !== selectedDivision) return false;
      if (hardwarePill !== 'All Locks' && d.lockType !== hardwarePill) return false;
      if (statePill !== 'All States' && liveState !== statePill) return false;

      for (const [key, val] of Object.entries(tableColumnFilters)) {
        if (val && typeof val === 'string') {
          const term = val.toLowerCase().trim();
          if (!term) continue;
          let cellVal = '';
          if (key === 'id') cellVal = d.id;
          else if (key === 'name') cellVal = d.name;
          else if (key === 'branch') cellVal = `${d.branch} ${d.division}`;
          else if (key === 'lockType') cellVal = d.lockType;
          else if (key === 'authMode') cellVal = d.authMode;
          else if (key === 'group') cellVal = d.group;
          else if (key === 'schedule') cellVal = d.schedule;
          if (!cellVal.toLowerCase().includes(term)) return false;
        }
      }
      return true;
    });

    if (sortCol) {
      result = [...result].sort((a, b) => {
        let va = '';
        let vb = '';
        if (sortCol === 'id') { va = a.id; vb = b.id; }
        else if (sortCol === 'name') { va = a.name; vb = b.name; }
        else if (sortCol === 'branch') { va = a.branch; vb = b.branch; }
        else if (sortCol === 'lockType') { va = a.lockType; vb = b.lockType; }
        else if (sortCol === 'authMode') { va = a.authMode; vb = b.authMode; }
        else if (sortCol === 'group') { va = a.group; vb = b.group; }
        else if (sortCol === 'schedule') { va = a.schedule; vb = b.schedule; }
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortDir === 'desc' ? -cmp : cmp;
      });
    }

    return result;
  }, [allDoors, search, globalSearch, globalRegion, globalBranch, moduleFilters, selectedDivision, hardwarePill, statePill, doorStates, tableColumnFilters, sortCol, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [search, globalSearch, globalRegion, globalBranch, moduleFilters, selectedDivision, hardwarePill, statePill, tableColumnFilters]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // KPIs dynamically computed from filtered rows
  const kpis = useMemo(() => {
    const total = filtered.length;
    const lockedCount = filtered.filter(d => (doorStates[d.id] || d.state) === 'Locked').length;
    const vaultCount = filtered.filter(d => d.lockType === 'Heavy Vault Armored Bolt' || d.authMode.includes('Dual Custody')).length;
    const continuous247 = filtered.filter(d => d.schedule.includes('24/7')).length;
    return { total, lockedCount, vaultCount, continuous247 };
  }, [filtered, doorStates]);

  const handlePulseUnlock = (door) => {
    setDoorStates(prev => ({ ...prev, [door.id]: 'Unlocked' }));
    setToast(`Remote Pulse Unlock triggered on ${door.id} (${door.name}). Auto-relock in 5 seconds.`);
    fetch(`http://localhost:5050/api/doors/${door.id}/pulse`, { method: 'POST' }).catch(() => {});
    setTimeout(() => {
      setDoorStates(prev => ({ ...prev, [door.id]: 'Locked' }));
    }, 5000);
  };

  const handleToggleOverride = (door) => {
    const current = doorStates[door.id] || door.state;
    const next = current === 'Override Unlocked' ? 'Locked' : 'Override Unlocked';
    setDoorStates(prev => ({ ...prev, [door.id]: next }));
    setToast(`Door ${door.id} relay state set to: ${next}`);
    const action = next === 'Locked' ? 'lock' : 'unlock';
    fetch(`http://localhost:5050/api/doors/${door.id}/${action}`, { method: 'POST' }).catch(() => {});
  };

  const handleExport = () => {
    const header = 'Door ID,Door Name,Branch,Lock Type,Auth Mode,Access Group,Schedule,Relay State,Anti-Passback';
    const rows = filtered.map(d => [
      d.id, d.name, d.branch, d.lockType, d.authMode, d.group, d.schedule, doorStates[d.id] || d.state, d.antiPassback
    ]);
    exportCsv(header, rows, `pubali-doors-management-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleReset = () => {
    setSearch('');
    setSelectedDivision('All Divisions');
    setHardwarePill('All Locks');
    setStatePill('All States');
    setActiveKpi('all');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── SUB-TABS: ACCESS CONTROL > DOOR VIEW ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#0f172a',
          padding: '6px 8px',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          flexWrap: 'wrap'
        }}
      >
        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', padding: '0 8px' }}>
          Door View:
        </span>
        <button
          onClick={() => setDoorSubTab('doors')}
          style={{
            padding: '6px 14px',
            borderRadius: 6,
            border: doorSubTab === 'doors' ? '1px solid #0284c7' : '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: doorSubTab === 'doors' ? '#0284c7' : 'rgba(255, 255, 255, 0.03)',
            color: doorSubTab === 'doors' ? '#ffffff' : '#cbd5e1',
            fontSize: 12,
            fontWeight: doorSubTab === 'doors' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease'
          }}
        >
          <span>Door Management & Relays</span>
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, backgroundColor: doorSubTab === 'doors' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)', color: '#fff' }}>
            2,696
          </span>
        </button>

        <button
          onClick={() => setDoorSubTab('door-held-open')}
          style={{
            padding: '6px 14px',
            borderRadius: 6,
            border: doorSubTab === 'door-held-open' ? '1px solid #0d9488' : '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: doorSubTab === 'door-held-open' ? '#0d9488' : 'rgba(255, 255, 255, 0.03)',
            color: doorSubTab === 'door-held-open' ? '#ffffff' : '#cbd5e1',
            fontSize: 12,
            fontWeight: doorSubTab === 'door-held-open' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease'
          }}
        >
          <span>⏱️ Door Held Open Report</span>
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, backgroundColor: doorSubTab === 'door-held-open' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)', color: '#fff' }}>
            {REPORTS_CONFIG['door-held-open']?.data?.length || 6}
          </span>
        </button>

        <button
          onClick={() => setDoorSubTab('occupancy-report')}
          style={{
            padding: '6px 14px',
            borderRadius: 6,
            border: doorSubTab === 'occupancy-report' ? '1px solid #0d9488' : '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: doorSubTab === 'occupancy-report' ? '#0d9488' : 'rgba(255, 255, 255, 0.03)',
            color: doorSubTab === 'occupancy-report' ? '#ffffff' : '#cbd5e1',
            fontSize: 12,
            fontWeight: doorSubTab === 'occupancy-report' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease'
          }}
        >
          <span>Facility Occupancy Report</span>
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, backgroundColor: doorSubTab === 'occupancy-report' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)', color: '#fff' }}>
            {REPORTS_CONFIG['occupancy-report']?.data?.length || 8}
          </span>
        </button>
      </div>

      {doorSubTab === 'door-held-open' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Door Held Open Report · Access Control Telemetry
              </h2>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                Real-time magnetic sensor duration tracking exceeding door safety threshold seconds
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>
              Sub-view of Access Control &gt; Door Management
            </div>
          </div>
          <ReportDataTable reportConfig={REPORTS_CONFIG['door-held-open']} />
        </div>
      )}

      {doorSubTab === 'occupancy-report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Facility Occupancy Report · Area Capacity Monitoring
              </h2>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                Calculated real-time personnel head-count (Entry - Exit) across bank cash vaults and sensitive chambers
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>
              Sub-view of Access Control &gt; Door Management
            </div>
          </div>
          <ReportDataTable reportConfig={REPORTS_CONFIG['occupancy-report']} />
        </div>
      )}

      {doorSubTab === 'doors' && (
        <>
          {/* ── TOP BANNER ── */}
          <TopBanner
            
            title="Nationwide Door & Lock Management"
            badge="AC-03 Configuration Audit"
            subtitle="Door Access Configuration Audit · 2,696 Portal Nodes Across 829 Branches"
            meta1="0 Misconfigured Doors"
            meta2={{ bg: '#0284c7', text: '● AC-03 AUDIT' }}
            gradient="linear-gradient(135deg, #082f49 0%, #0369a1 45%, #0284c7 100%)"
            glowColor="rgba(2, 132, 199, 0.24)"
          />

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          
          label="Configured Doors"
          value={`${kpis.total.toLocaleString()} Doors`}
          sub="Across 829 branches"
          color="#0284c7"
          iconBg="#e0f2fe"
          active={hardwarePill === 'All Locks' && statePill === 'All States' && selectedDivision === 'All Divisions' && !search}
          onClick={() => {
            handleReset();
            setToast(`Showing all ${kpis.total.toLocaleString()} configured doors nationwide`);
          }}
          title="Click to reset filters and show all configured doors"
        />
        <KpiCard
          
          label="Secure Locked"
          value={`${kpis.lockedCount.toLocaleString()} Locked`}
          sub="Normal secured relay"
          color="#059669"
          iconBg="#d1fae5"
          active={statePill === 'Locked'}
          onClick={() => {
            setStatePill(s => s === 'Locked' ? 'All States' : 'Locked');
            setToast(`Filtered: ${kpis.lockedCount.toLocaleString()} Securely Locked Doors`);
          }}
          title="Click to filter locked doors"
        />
        <KpiCard
          
          label="Treasury & Vaults"
          value={`${kpis.vaultCount} Strong Rooms`}
          sub="Dual custody Bio+PIN"
          color="#b45309"
          iconBg="#fef3c7"
          active={hardwarePill === 'Heavy Vault Armored Bolt'}
          onClick={() => {
            setHardwarePill(h => h === 'Heavy Vault Armored Bolt' ? 'All Locks' : 'Heavy Vault Armored Bolt');
            setToast(`Filtered: ${kpis.vaultCount} Strong Rooms & Heavy Armored Vault Doors`);
          }}
          title="Click to filter Treasury & Strong Room vaults"
        />
        <KpiCard
          
          label="24/7 Monitored Access"
          value={`${kpis.continuous247} Portals`}
          sub="Server Room & NOC Core"
          color="#7c3aed"
          iconBg="#f3e8ff"
          active={search === '24/7'}
          onClick={() => {
            setSearch(s => s === '24/7' ? '' : '24/7');
            setToast(`Filtered: ${kpis.continuous247} Continuous 24/7 Monitored Portals`);
          }}
          title="Click to filter 24/7 unrestricted security portals"
        />
      </div>

      {/* ── ADVANCED HORIZONTAL FILTER BAR ── */}
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
              placeholder="Search Door ID, Name, Branch..."
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

          {/* Hardware Pills */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', margin: '0 6px', flexShrink: 0 }}>
            {hardwarePills.map(h => {
              const active = hardwarePill === h;
              return (
                <button
                  key={h}
                  onClick={() => setHardwarePill(h)}
                  style={{
                    padding: '3px 9px',
                    fontSize: 11,
                    borderRadius: 20,
                    cursor: 'pointer',
                    fontWeight: active ? 700 : 400,
                    border: active ? '1.5px solid #0284c7' : '1.5px solid transparent',
                    background: active ? '#0284c715' : 'transparent',
                    color: active ? '#0284c7' : '#9ca3af',
                    transition: 'all 0.12s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {h.replace(' (600 lbs)', '')}
                </button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 28, background: '#e5e7eb', flexShrink: 0, margin: '0 2px' }} />

          {/* State Pills */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', margin: '0 6px', flexShrink: 0 }}>
            {statePills.map(s => {
              const active = statePill === s;
              const clrs = { 'All States': '#0284c7', Locked: '#16a34a', Unlocked: '#d97706', 'Override Unlocked': '#dc2626' };
              const c = clrs[s] || '#0284c7';
              return (
                <button
                  key={s}
                  onClick={() => setStatePill(s)}
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
            {filtered.length.toLocaleString()} records
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

      {/* ── DATA TABLE (Aligned to AC-03 Door Access Configuration Audit) ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                <th style={{ padding: '10px 14px', width: 44 }}>#</th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Door ID</span>
                  <TableColumnFilter columnKey="id" title="Door ID" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Door Name</span>
                  <TableColumnFilter columnKey="name" title="Door Name" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Branch</span>
                  <TableColumnFilter columnKey="branch" title="Branch" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Lock Type</span>
                  <TableColumnFilter columnKey="lockType" title="Lock Type" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Auth Mode</span>
                  <TableColumnFilter columnKey="authMode" title="Auth Mode" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Access Group</span>
                  <TableColumnFilter columnKey="group" title="Access Group" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Schedule</span>
                  <TableColumnFilter columnKey="schedule" title="Schedule" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Remote Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((d, idx) => {
                const liveState = doorStates[d.id] || d.state;
                const n = (page - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={d.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#fff' : '#fafafa',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'}
                  >
                    <td style={{ padding: '11px 14px', color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>{n}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: '#0284c7', whiteSpace: 'nowrap' }}>{d.id}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.name}</div>
                      <div style={{ fontSize: 10.5, color: '#64748b' }}>{d.antiPassback}</div>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#334155', fontWeight: 600 }}>{d.branch}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        fontSize: 11,
                        background: '#f1f5f9',
                        color: '#334155',
                        padding: '2px 7px',
                        borderRadius: 4,
                        fontWeight: 500
                      }}>
                        {d.lockType}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        fontSize: 11,
                        background: '#f5f3ff',
                        color: '#6d28d9',
                        padding: '2px 7px',
                        borderRadius: 4,
                        fontWeight: 600
                      }}>
                        {d.authMode}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#475569', fontSize: 11.5, fontWeight: 600 }}>{d.group}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '2px 7px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600
                      }}>
                        {d.schedule}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handlePulseUnlock(d)}
                        style={{
                          marginRight: 6,
                          padding: '4px 9px',
                          fontSize: 10.5,
                          fontWeight: 700,
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          borderRadius: 4,
                          cursor: 'pointer',
                          color: '#059669'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#ecfdf5'; e.currentTarget.style.color = '#059669'; }}
                      >
                        Pulse
                      </button>
                      <button
                        onClick={() => handleToggleOverride(d)}
                        style={{
                          padding: '4px 9px',
                          fontSize: 10.5,
                          fontWeight: 600,
                          background: liveState === 'Override Unlocked' ? '#fee2e2' : '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: 4,
                          cursor: 'pointer',
                          color: liveState === 'Override Unlocked' ? '#b91c1c' : '#475569'
                        }}
                      >
                        {liveState === 'Override Unlocked' ? 'Lock' : 'Hold'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <PaginationBar
          currentPage={page}
          totalPages={totalPages}
          setPage={setPage}
          count={filtered.length}
        />
      </div>
      </>
      )}

      <Toast msg={toast} onClose={() => setToast('')} />
    </div>
  );
}

// ================================================================
// 4. DOOR STATUS PAGE (AC-13 Real-Time Door Status & Sensor Telemetry)
// ================================================================
function buildAllDoorStatus() {
  const doors = [];
  let globalDoorIndex = 0;
  // Exact 8 designated doors with held open sensor warnings across nationwide network
  const warningDoorIndices = new Set([42, 185, 412, 789, 1150, 1624, 2098, 2560]);

  FULL_PUBALI_LOCATIONS.forEach((loc, locIdx) => {
    if (loc.doorList && loc.doorList.length > 0) {
      loc.doorList.forEach((d, i) => {
        const id = `DOR-${loc.code || 'PB'}-${String(i + 1).padStart(2, '0')}`;
        const isWarning = warningDoorIndices.has(globalDoorIndex);
        
        const sensor = isWarning ? 'Held Open Alert' : (d.sensor || 'Closed');
        const loop = isWarning ? 'Warning' : 'Normal';
        const relayStatus = isWarning ? 'Warning' : (d.status || 'Locked');
        const latency = isWarning ? '142 ms' : `${10 + ((i + locIdx) % 25)} ms`;
        const lastEvent = isWarning ? 'Door Held > 60s (Sensor Delay)' : 'Normal Secure Event';
        const timestamp = isWarning ? '2m ago' : `${((locIdx + i) % 15) + 1}m ago`;

        doors.push({
          id,
          name: d.name,
          branch: loc.name,
          division: loc.division || 'Dhaka',
          zone: loc.zone || loc.division || 'Dhaka Central',
          sensor,
          loop,
          relayStatus,
          latency,
          lastEvent,
          timestamp,
          controller: loc.devices && loc.devices[0] ? loc.devices[0].name : 'BioStation 3'
        });
        globalDoorIndex++;
      });
    }
  });
  return doors;
}

export function DoorStatusPage({ initialLoop, onNavigate }) {
  const {
    region: globalRegion,
    branch: globalBranch,
    searchQuery: globalSearch,
    moduleFilters = {},
    tableColumnFilters = {}
  } = useBankFilters();
  const allStatus = useMemo(() => buildAllDoorStatus(), []);
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All Divisions');
  const [sensorPill, setSensorPill] = useState('All Sensors');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (colKey) => {
    if (sortCol === colKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
  };

  const getInitialLoop = () => {
    if (initialLoop && ['Normal', 'Warning', 'Alert'].includes(initialLoop)) return initialLoop;
    const hash = window.location.hash || '';
    if (hash.includes('loop=Warning') || hash.includes('filter=warning')) return 'Warning';
    if (hash.includes('loop=Alert') || hash.includes('filter=alert')) return 'Alert';
    if (hash.includes('loop=Normal') || hash.includes('filter=normal')) return 'Normal';
    return 'All Loops';
  };

  const [loopPill, setLoopPill] = useState(getInitialLoop);

  useEffect(() => {
    if (initialLoop && ['Normal', 'Warning', 'Alert'].includes(initialLoop)) {
      setLoopPill(initialLoop);
    }
  }, [initialLoop]);

  const [page, setPage] = useState(1);
  const [liveDoors, setLiveDoors] = useState(() => ({ ...globalDoorStore.liveOverrides }));
  const [toast, setToast] = useState('');
  const pageSize = 30;

  useEffect(() => {
    return globalDoorStore.subscribe(() => {
      setLiveDoors({ ...globalDoorStore.liveOverrides });
    });
  }, []);

  const divisions = ['All Divisions', ...DIVISIONS_LIST];
  const sensorPills = ['All Sensors', 'Closed', 'Open', 'Held Open Alert', 'Tamper Alert'];
  const loopPills = ['All Loops', 'Normal', 'Warning', 'Alert'];

  const filtered = useMemo(() => {
    let result = allStatus.filter(d => {
      const curSensor = liveDoors[d.id]?.sensor || d.sensor;
      const curLoop = liveDoors[d.id]?.loop || d.loop;
      const curRelay = liveDoors[d.id]?.relayStatus || d.relayStatus;

      const q = (globalSearch || search || '').toLowerCase().trim();
      if (q) {
        const match = d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || d.branch.toLowerCase().includes(q) || d.lastEvent.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (globalRegion && globalRegion !== 'All Regions') {
        const rLow = globalRegion.toLowerCase();
        if (!d.division.toLowerCase().includes(rLow) && !d.branch.toLowerCase().includes(rLow)) return false;
      }
      if (globalBranch && globalBranch !== 'All Branches') {
        const bLow = globalBranch.toLowerCase();
        if (!d.branch.toLowerCase().includes(bLow)) return false;
      }
      const secClass = moduleFilters.doorSecurityClass;
      if (secClass && secClass !== 'All') {
        const nLow = d.name.toLowerCase();
        const isClass1 = nLow.includes('vault') || nLow.includes('strongroom');
        const isClass2 = nLow.includes('server') || nLow.includes('noc') || nLow.includes('data');
        const isClass3 = nLow.includes('cash') || nLow.includes('teller');
        if (secClass === 'Class1' && !isClass1) return false;
        if (secClass === 'Class2' && !isClass2) return false;
        if (secClass === 'Class3' && !isClass3) return false;
        if (secClass === 'Class4' && (isClass1 || isClass2 || isClass3)) return false;
      }
      const mLock = moduleFilters.lockState;
      if (mLock && mLock !== 'All') {
        if (mLock === 'Locked' && curRelay !== 'Locked') return false;
        if (mLock === 'Unlocked' && curRelay !== 'Unlocked') return false;
        if (mLock === 'ForcedOpen' && curRelay !== 'Locked Down' && curLoop !== 'Alert') return false;
        if (mLock === 'HeldOpen' && curSensor !== 'Held Open Alert' && curLoop !== 'Warning') return false;
      }
      if (selectedDivision !== 'All Divisions' && d.division !== selectedDivision) return false;
      if (sensorPill !== 'All Sensors' && curSensor !== sensorPill) return false;
      if (loopPill !== 'All Loops' && curLoop !== loopPill) return false;

      for (const [key, val] of Object.entries(tableColumnFilters)) {
        if (val && typeof val === 'string') {
          const term = val.toLowerCase().trim();
          if (!term) continue;
          let cellVal = '';
          if (key === 'id') cellVal = d.id;
          else if (key === 'name') cellVal = d.name;
          else if (key === 'branch') cellVal = `${d.branch} ${d.division}`;
          else if (key === 'sensor') cellVal = curSensor;
          else if (key === 'loop') cellVal = curLoop;
          else if (key === 'relayStatus') cellVal = curRelay;
          else if (key === 'latency') cellVal = d.latency;
          else if (key === 'lastEvent') cellVal = `${d.lastEvent} ${d.timestamp}`;
          if (!cellVal.toLowerCase().includes(term)) return false;
        }
      }
      return true;
    });

    if (sortCol) {
      result = [...result].sort((a, b) => {
        let va = '';
        let vb = '';
        const ca = liveDoors[a.id] || a;
        const cb = liveDoors[b.id] || b;
        if (sortCol === 'id') { va = a.id; vb = b.id; }
        else if (sortCol === 'name') { va = a.name; vb = b.name; }
        else if (sortCol === 'branch') { va = a.branch; vb = b.branch; }
        else if (sortCol === 'sensor') { va = ca.sensor; vb = cb.sensor; }
        else if (sortCol === 'loop') { va = ca.loop; vb = cb.loop; }
        else if (sortCol === 'relayStatus') { va = ca.relayStatus; vb = cb.relayStatus; }
        else if (sortCol === 'latency') { va = a.latency; vb = b.latency; }
        else if (sortCol === 'lastEvent') { va = a.lastEvent; vb = b.lastEvent; }
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortDir === 'desc' ? -cmp : cmp;
      });
    }

    return result;
  }, [allStatus, search, globalSearch, globalRegion, globalBranch, moduleFilters, selectedDivision, sensorPill, loopPill, liveDoors, tableColumnFilters, sortCol, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [search, globalSearch, globalRegion, globalBranch, moduleFilters, selectedDivision, sensorPill, loopPill, tableColumnFilters]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const alarmCount = useMemo(() => filtered.filter(d => (liveDoors[d.id]?.loop || d.loop) === 'Alert').length, [filtered, liveDoors]);
  const warnCount = useMemo(() => filtered.filter(d => (liveDoors[d.id]?.loop || d.loop) === 'Warning').length, [filtered, liveDoors]);
  const normalCount = useMemo(() => filtered.filter(d => (liveDoors[d.id]?.loop || d.loop) === 'Normal').length, [filtered, liveDoors]);

  const handleAcknowledge = (d) => {
    globalDoorStore.setLiveState(d.id, { sensor: 'Closed', loop: 'Normal', relayStatus: 'Locked' });
    setToast(`Warning/Alarm acknowledged & cleared for ${d.id} (${d.name}). Restored to Normal.`);
  };

  const handleLockdown = (d) => {
    const curRelay = liveDoors[d.id]?.relayStatus || d.relayStatus;
    const isCurrentlyLockdown = curRelay === 'Locked Down' || curRelay === 'Emergency Lockdown';
    if (isCurrentlyLockdown) {
      globalDoorStore.setLiveState(d.id, { sensor: 'Closed', loop: 'Normal', relayStatus: 'Locked' });
      setToast(`Lockdown released for ${d.id} (${d.name}). Door restored to Normal.`);
    } else {
      globalDoorStore.setLiveState(d.id, { sensor: 'Closed', loop: 'Normal', relayStatus: 'Locked Down' });
      setToast(`Emergency Lockdown engaged on ${d.id} (${d.branch}). Loop secured to Normal.`);
    }
  };

  const handleExport = () => {
    const header = 'Door ID,Portal Name,Branch,Magnetic Sensor,Alarm Loop,Relay Status,Ping Latency,Last Event,Timestamp';
    const rows = filtered.map(d => {
      const cur = liveDoors[d.id] || d;
      return [d.id, d.name, d.branch, cur.sensor, cur.loop, cur.relayStatus, d.latency, d.lastEvent, d.timestamp];
    });
    exportCsv(header, rows, `pubali-door-telemetry-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleReset = () => {
    setSearch('');
    setSelectedDivision('All Divisions');
    setSensorPill('All Sensors');
    setLoopPill('All Loops');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── TOP BANNER ── */}
      <TopBanner
        
        title="Real-time Door Relay & Sensor Telemetry"
        badge="AC-13 Live Telemetry"
        subtitle="Real-Time Door Status & Sensor Telemetry Report · 2,696 Portal Nodes Across 829 Locations"
        meta1={`${alarmCount} Active Alarms`}
        meta2={{ bg: '#dc2626', text: '● LIVE TELEMETRY' }}
        gradient="linear-gradient(135deg, #4c0519 0%, #9f1239 45%, #e11d48 100%)"
        glowColor="rgba(225, 29, 72, 0.24)"
      />

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          
          label="Monitored Portals"
          value={`${allStatus.length.toLocaleString()} Portals`}
          sub="Real-time telemetry feed"
          color="#0284c7"
          iconBg="#e0f2fe"
          active={loopPill === 'All Loops' && sensorPill === 'All Sensors' && selectedDivision === 'All Divisions' && !search}
          onClick={() => {
            handleReset();
            setToast(`Showing all ${allStatus.length.toLocaleString()} monitored portal relays`);
          }}
          title="Click to reset and show all monitored portals"
        />
        <KpiCard
          
          label="Sensor Alarms"
          value={`${alarmCount} Active Alarms`}
          sub="Tamper / Forced Open"
          color="#dc2626"
          iconBg="#fee2e2"
          active={loopPill === 'Alert'}
          onClick={() => {
            setLoopPill(l => l === 'Alert' ? 'All Loops' : 'Alert');
            setSensorPill('All Sensors');
            setToast(`Filtered: ${alarmCount} Active Sensor Alarms (ALARM LOOP = Alert)`);
          }}
          title="Click to filter Active Alarms — matches ALARM LOOP column"
        />
        <KpiCard
          
          label="Secured & Normal"
          value={`${normalCount.toLocaleString()} Doors`}
          sub="Sensor closed & loop normal"
          color="#16a34a"
          iconBg="#dcfce7"
          active={loopPill === 'Normal' && sensorPill === 'All Sensors'}
          onClick={() => {
            setLoopPill(l => l === 'Normal' ? 'All Loops' : 'Normal');
            setSensorPill('All Sensors');
            setToast(`Filtered: ${normalCount.toLocaleString()} Normal Secured Doors`);
          }}
          title="Click to filter Normal Secured doors — matches ALARM LOOP column"
        />
        <KpiCard
          
          label="Sensor Warnings"
          value={`${warnCount} Doors`}
          sub="Loop warning / held open"
          color="#d97706"
          iconBg="#fef3c7"
          active={loopPill === 'Warning'}
          onClick={() => {
            setLoopPill(l => l === 'Warning' ? 'All Loops' : 'Warning');
            setSensorPill('All Sensors');
            setToast(`Filtered: ${warnCount} Door Sensor Warnings`);
          }}
          title="Click to filter Sensor Warnings — matches ALARM LOOP column"
        />
        <KpiCard
          
          label="Anti-Passback (APB)"
          value="0 Critical"
          sub="3 Soft Warnings · Tailgating Shield"
          color="#7c3aed"
          iconBg="#ede9fe"
          active={search === 'Anti-Passback'}
          onClick={() => {
            setSearch(s => s === 'Anti-Passback' ? '' : 'Anti-Passback');
            setToast('Filtered: Anti-Passback (APB) Protected Doors');
          }}
          title="Click to view Anti-Passback (APB) flags & tailgating shield"
        />
      </div>

      {/* ── ADVANCED HORIZONTAL FILTER BAR ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 4px', minHeight: 52, flexWrap: 'wrap' }}>
          {/* Icon */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', color: '#e11d48', flexShrink: 0 }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <input
              style={{ height: 32, width: 220, padding: '0 28px 0 10px', fontSize: 12, border: 'none', outline: 'none', background: 'transparent', color: '#1e293b' }}
              placeholder="Search Door, Event, Branch..."
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

          {/* Sensor Pills */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', margin: '0 6px', flexShrink: 0 }}>
            {sensorPills.map(s => {
              const active = sensorPill === s;
              const clrs = { 'All Sensors': '#e11d48', Closed: '#16a34a', Open: '#d97706', 'Held Open Alert': '#dc2626', 'Tamper Alert': '#be185d' };
              const c = clrs[s] || '#e11d48';
              return (
                <button
                  key={s}
                  onClick={() => setSensorPill(s)}
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
                  {s.replace(' Alert', '')}
                </button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 28, background: '#e5e7eb', flexShrink: 0, margin: '0 2px' }} />

          {/* Alarm Loop Pills */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', margin: '0 6px', flexShrink: 0 }}>
            {loopPills.map(l => {
              const active = loopPill === l;
              const clrs = { 'All Loops': '#e11d48', Normal: '#16a34a', Warning: '#d97706', Alert: '#dc2626' };
              const c = clrs[l] || '#e11d48';
              return (
                <button
                  key={l}
                  onClick={() => setLoopPill(l)}
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
                  {l}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          {/* Record Count */}
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', padding: '0 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {filtered.length.toLocaleString()} records
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
              background: 'linear-gradient(135deg, #9f1239, #e11d48)', border: 'none', color: '#fff',
              cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: '0 1px 4px rgba(225,29,72,0.3)', flexShrink: 0
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* ── DATA TABLE (Aligned to AC-13 Real-Time Door Status & Sensor Telemetry) ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                <th style={{ padding: '10px 14px', width: 44 }}>#</th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Door ID</span>
                  <TableColumnFilter columnKey="id" title="Door ID" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Portal Name</span>
                  <TableColumnFilter columnKey="name" title="Portal Name" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Branch</span>
                  <TableColumnFilter columnKey="branch" title="Branch" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Magnetic Sensor</span>
                  <TableColumnFilter columnKey="sensor" title="Magnetic Sensor" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Alarm Loop</span>
                  <TableColumnFilter columnKey="loop" title="Alarm Loop" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Relay Status</span>
                  <TableColumnFilter columnKey="relayStatus" title="Relay Status" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Ping Latency</span>
                  <TableColumnFilter columnKey="latency" title="Ping Latency" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <span>Last Event</span>
                  <TableColumnFilter columnKey="lastEvent" title="Last Event" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Security Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((d, idx) => {
                const cur = liveDoors[d.id] || d;
                const isAlarmRow = cur.loop === 'Alert';
                const n = (page - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={d.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isAlarmRow ? '#fff1f2' : idx % 2 === 0 ? '#fff' : '#fafafa',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = isAlarmRow ? '#ffe4e6' : '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = isAlarmRow ? '#fff1f2' : idx % 2 === 0 ? '#fff' : '#fafafa'}
                  >
                    <td style={{ padding: '11px 14px', color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>{n}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: isAlarmRow ? '#b91c1c' : '#0284c7' }}>
                      {d.id}
                    </td>
                    <td style={{ padding: '11px 14px', fontWeight: 700, color: '#0f172a' }}>
                      {d.name}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#334155', fontWeight: 600 }}>{d.branch}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <StatusPill status={cur.sensor} />
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <StatusPill status={cur.loop} />
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <StatusPill status={cur.relayStatus} />
                    </td>
                    <td style={{ padding: '11px 14px', color: isAlarmRow ? '#dc2626' : '#059669', fontSize: 11, fontWeight: 600 }}>
                      {d.latency}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ color: isAlarmRow ? '#991b1b' : '#334155', fontWeight: 600, fontSize: 11.5 }}>{d.lastEvent}</div>
                      <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{d.timestamp}</div>
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {cur.loop !== 'Normal' ? (
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => handleAcknowledge(d)}
                            style={{
                              padding: '4px 9px', fontSize: 10.5, fontWeight: 700,
                              background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4,
                              cursor: 'pointer', boxShadow: '0 1px 3px rgba(22,163,74,0.3)'
                            }}
                            title="Acknowledge and clear warning/alarm back to Normal"
                          >
                            ✓ Clear Warning
                          </button>
                          <button
                            onClick={() => handleLockdown(d)}
                            style={{
                              padding: '4px 9px', fontSize: 10.5, fontWeight: 700,
                              background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4,
                              cursor: 'pointer', boxShadow: '0 1px 3px rgba(220,38,38,0.3)'
                            }}
                            title="Engage emergency hardware lockdown"
                          >
                            Lockdown
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleLockdown(d)}
                          style={{
                            padding: '4px 10px', fontSize: 11, fontWeight: 600,
                            background: cur.relayStatus === 'Locked Down' ? '#fee2e2' : '#f8fafc',
                            color: cur.relayStatus === 'Locked Down' ? '#b91c1c' : '#475569',
                            border: cur.relayStatus === 'Locked Down' ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                            borderRadius: 4, cursor: 'pointer'
                          }}
                          title={cur.relayStatus === 'Locked Down' ? 'Click to release lockdown' : 'Click to engage emergency lockdown'}
                        >
                          {cur.relayStatus === 'Locked Down' ? 'Release' : 'Lockdown'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <PaginationBar
          currentPage={page}
          totalPages={totalPages}
          setPage={setPage}
          count={filtered.length}
        />
      </div>

      <Toast msg={toast} onClose={() => setToast('')} />
    </div>
  );
}
