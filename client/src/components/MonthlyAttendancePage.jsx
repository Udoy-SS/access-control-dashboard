import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FULL_PUBALI_LOCATIONS } from '../data/pubaliFullBranches';
import { useBankFilters } from './filters/FilterContext';

// ─── CONSTANTS ───────────────────────────────────────────────
const MONTHS = [
  'September 2026', 'August 2026', 'July 2026', 'June 2026',
  'May 2026', 'April 2026', 'March 2026', 'February 2026', 'January 2026'
];

const REGIONS = [
  'All Regions', 'Dhaka Region', 'Chittagong Region', 'Sylhet Region',
  'Rajshahi Region', 'Khulna Region', 'Barisal Region', 'Rangpur Region', 'Mymensingh Region'
];

const ATTENDANCE_BANDS = [
  'All Bands',
  'Excellent (≥95%)',
  'Good (80–94%)',
  'Satisfactory (60–79%)',
  'Poor (<60%)'
];

const DEPARTMENTS = [
  'All Departments', 'Cash Department', 'IT Department', 'HR Department',
  'Operations', 'Accounts', 'Islamic Banking', 'Audit & Compliance', 'Corporate Banking'
];

const DIVISION_REGION_MAP = {
  'Dhaka': 'Dhaka Region', 'Chittagong': 'Chittagong Region',
  'Sylhet': 'Sylhet Region', 'Rajshahi': 'Rajshahi Region',
  'Khulna': 'Khulna Region', 'Barisal': 'Barisal Region',
  'Rangpur': 'Rangpur Region', 'Mymensingh': 'Mymensingh Region',
};

const DEPT_POOL = [
  'Cash Department', 'IT Department', 'HR Department',
  'Operations', 'Accounts', 'Islamic Banking', 'Audit & Compliance', 'Corporate Banking'
];

const WORKING_DAYS = 22;

// ─── BUILD MONTHLY DATA (ATT-02 Specification with 31-Day Status) ───
function buildMonthlyRows() {
  const rows = [];
  const weekendDays = new Set([4, 5, 11, 12, 18, 19, 25, 26]); // Friday & Saturday in Sep 2026

  FULL_PUBALI_LOCATIONS.forEach(loc => {
    if (!loc.employees) return;
    const region = DIVISION_REGION_MAP[loc.division] || 'Dhaka Region';
    loc.employees.forEach((emp, idx) => {
      const isAbsent = emp.status === 'Absent';
      const isLate = emp.late;

      const presentDays   = isAbsent ? 14 + (idx % 5) : 20 + (idx % 3);
      const absentDays    = WORKING_DAYS - presentDays;
      const leaveDays     = isAbsent ? 2 : 0;
      const lateTimes     = isLate ? 2 + (idx % 3) : idx % 2 === 0 ? 1 : 0;
      const earlyOutTimes = idx % 4 === 0 ? 1 : 0;
      const actualPresent = presentDays - leaveDays;
      const pct           = Math.round((actualPresent / WORKING_DAYS) * 100);

      let band;
      if (pct >= 95) band = 'Excellent';
      else if (pct >= 80) band = 'Good';
      else if (pct >= 60) band = 'Satisfactory';
      else band = 'Poor';

      const deptIdx = (emp.id?.charCodeAt(emp.id.length - 1) || idx) % DEPT_POOL.length;

      // Day 1 to 31 Status Matrix (P: Present, A: Absent, L: Late, H: Weekend/Holiday)
      const dayMatrix = Array.from({ length: 31 }, (_, dIdx) => {
        const day = dIdx + 1;
        if (weekendDays.has(day)) return 'H'; // Weekend
        if (isAbsent && (day === 8 || day === 15 || day === 22)) return 'A'; // Absent
        if (isLate && (day === 7 || day === 14)) return 'L'; // Late
        if (idx % 3 === 0 && day === 10) return 'L';
        return 'P'; // Present
      });

      rows.push({
        userId: emp.id,
        name: emp.name,
        branch: loc.name,
        region,
        department: DEPT_POOL[deptIdx],
        workingDays: WORKING_DAYS,
        presentDays,
        leaveDays,
        absentDays,
        lateTimes,
        earlyOutTimes,
        pct,
        band,
        dayMatrix,
        status: pct >= 80 ? 'Compliant' : 'Non-Compliant',
      });
    });
  });
  return rows;
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────
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

function PctBar({ pct }) {
  const color = pct >= 95 ? '#16a34a' : pct >= 80 ? '#0369a1' : pct >= 60 ? '#d97706' : '#dc2626';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, height: 6, minWidth: 60 }}>
        <div style={{ width: `${pct}%`, background: color, borderRadius: 4, height: 6, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color, minWidth: 36 }}>{pct}%</span>
    </div>
  );
}

function BandBadge({ band }) {
  const cfg = {
    Excellent:      { bg: '#dcfce7', color: '#15803d', label: '⭐ Excellent' },
    Good:           { bg: '#dbeafe', color: '#1d4ed8', label: '✅ Good' },
    Satisfactory:   { bg: '#fef9c3', color: '#92400e', label: '⚠️ Satisfactory' },
    Poor:           { bg: '#fee2e2', color: '#b91c1c', label: '❌ Poor' },
  };
  const s = cfg[band] || { bg: '#f3f4f6', color: '#4b5563', label: band };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 12
    }}>{s.label}</span>
  );
}

function FilterSelect({ value, onChange, options, width = 160 }) {
  return (
    <select className="bs-select" style={{ width, fontSize: 12, height: 32 }}
      value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function MonthlyAttendancePage() {
  const allRows = useMemo(() => buildMonthlyRows(), []);

  // ── Consume global FilterContext
  const { region: globalRegion, searchQuery: globalSearch } = useBankFilters();

  const [month, setMonth]         = useState(MONTHS[0]);
  const [region, setRegion]       = useState('All Regions');
  const [dept, setDept]           = useState('All Departments');
  const [band, setBand]           = useState('All Bands');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortMode, setSortMode]   = useState('');
  const [search, setSearch]       = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployeeModal, setSelectedEmployeeModal] = useState(null);
  const pageSize = 30;

  // ── Sync local state from global FilterContext when it changes
  useEffect(() => {
    if (globalRegion && globalRegion !== 'All Regions') {
      setRegion(globalRegion);
    } else {
      setRegion('All Regions');
    }
  }, [globalRegion]);

  useEffect(() => {
    if (globalSearch !== undefined) setSearch(globalSearch);
  }, [globalSearch]);

  // ── scope data (filters except band/status so cards retain full breakdown)
  const scopeRows = useMemo(() => {
    return allRows.filter(r => {
      if (region !== 'All Regions' && r.region !== region) return false;
      if (dept !== 'All Departments' && r.department !== dept) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!r.userId.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q) &&
            !r.branch.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allRows, region, dept, search]);

  // ── filtered data (applies band, status filter, and optional sorting)
  const filteredRows = useMemo(() => {
    let list = scopeRows.filter(r => {
      if (band !== 'All Bands') {
        if (band === 'Excellent (≥95%)' && r.band !== 'Excellent') return false;
        if (band === 'Good (80–94%)' && r.band !== 'Good') return false;
        if (band === 'Satisfactory (60–79%)' && r.band !== 'Satisfactory') return false;
        if (band === 'Poor (<60%)' && r.band !== 'Poor') return false;
      }
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
    if (sortMode === 'pct-desc') {
      list = [...list].sort((a, b) => b.pct - a.pct);
    } else if (sortMode === 'leave-desc') {
      list = [...list].sort((a, b) => b.leaveDays - a.leaveDays);
    }
    return list;
  }, [scopeRows, band, statusFilter, sortMode]);

  // ── KPIs (ATT-02 Monthly Attendance % & aggregate days)
  const kpis = useMemo(() => {
    const avgPct       = scopeRows.length
      ? Math.round(scopeRows.reduce((s, r) => s + r.pct, 0) / scopeRows.length) : 0;
    const totalPresent = scopeRows.reduce((s, r) => s + r.presentDays, 0);
    const totalAbsent  = scopeRows.reduce((s, r) => s + r.absentDays, 0);
    const totalLate    = scopeRows.reduce((s, r) => s + r.lateTimes, 0);
    const compliant    = scopeRows.filter(r => r.status === 'Compliant').length;
    return { total: scopeRows.length, avgPct, totalPresent, totalAbsent, totalLate, compliant };
  }, [scopeRows]);

  useEffect(() => setCurrentPage(1), [filteredRows]);
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const pageRows = useMemo(() => {
    const s = (currentPage - 1) * pageSize;
    return filteredRows.slice(s, s + pageSize);
  }, [filteredRows, currentPage]);

  const handleExport = useCallback(() => {
    const header = 'User ID,Employee Name,Branch,Department,Working Days,Total Present,Leave Days,Total Absent,Late Count,Attendance %,Compliance Status';
    const body = filteredRows.map(r =>
      `"${r.userId}","${r.name}","${r.branch}","${r.department}",${r.workingDays},${r.presentDays},${r.leaveDays},${r.absentDays},${r.lateTimes},"${r.pct}%","${r.status}"`
    ).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pubali-monthly-attendance-roster-att02-${month.replace(' ', '-').toLowerCase()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }, [filteredRows, month]);

  const handleReset = () => {
    setRegion('All Regions');
    setDept('All Departments');
    setBand('All Bands');
    setStatusFilter('');
    setSortMode('');
    setSearch('');
  };

  const activeFilters = [
    { label: region, clear: () => setRegion('All Regions'), cond: region !== 'All Regions' },
    { label: dept, clear: () => setDept('All Departments'), cond: dept !== 'All Departments' },
    { label: band, clear: () => setBand('All Bands'), cond: band !== 'All Bands' },
    { label: `Status: ${statusFilter}`, clear: () => setStatusFilter(''), cond: !!statusFilter },
    { label: sortMode === 'pct-desc' ? 'Sorted: Highest Attendance' : 'Sorted: Most Leaves', clear: () => setSortMode(''), cond: !!sortMode },
    { label: `"${search}"`, clear: () => setSearch(''), cond: !!search },
  ].filter(f => f.cond);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* PAGE HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 55%, #6366f1 100%)',
        borderRadius: 8, padding: '16px 22px', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, boxShadow: '0 4px 16px rgba(99,102,241,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 10,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
          }}>📆</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em' }}>
              Monthly Attendance Roster (Full) — ATT-02
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.88, marginTop: 2 }}>
              Full monthly employee attendance calendar view with Day 1–31 P/A/L markers · Pubali Bank PLC
            </div>
          </div>
        </div>

        {/* Month Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>Month:</label>
          <select
            value={month}
            onChange={e => setMonth(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 6, padding: '5px 10px', fontSize: 12,
              fontWeight: 700, cursor: 'pointer', outline: 'none'
            }}
          >
            {MONTHS.map(m => <option key={m} style={{ color: '#1e293b', background: '#fff' }}>{m}</option>)}
          </select>
          <div style={{
            background: 'rgba(255,255,255,0.12)', borderRadius: 6,
            padding: '5px 12px', fontSize: 11.5, fontWeight: 700
          }}>
            📊 ATT-02 KPI: {kpis.avgPct}%
          </div>
        </div>
      </div>

      {/* KPI CARDS (ATT-02 Monthly Attendance % & Roster Statistics) */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          icon="📊"
          label="Monthly Attendance % (ATT-02)"
          value={`${kpis.avgPct}%`}
          sub="Overall Bank Roster Rate"
          color="#4f46e5"
          iconBg="#eef2ff"
          active={sortMode === 'pct-desc'}
          onClick={() => setSortMode(s => s === 'pct-desc' ? '' : 'pct-desc')}
          title="Tender Catalog ATT-02 Primary KPI: Monthly Attendance %"
        />
        <KpiCard
          icon="👥"
          label="Total Staff"
          value={kpis.total.toLocaleString()}
          sub="In filtered scope"
          color="#0d9488"
          iconBg="#e6f4f1"
          active={band === 'All Bands' && !statusFilter && !sortMode}
          onClick={() => {
            setBand('All Bands');
            setStatusFilter('');
            setSortMode('');
          }}
          title="Click to reset filters and view all employees"
        />
        <KpiCard
          icon="✅"
          label="Total Present Days"
          value={kpis.totalPresent.toLocaleString()}
          sub="Biometric punch count"
          color="#16a34a"
          iconBg="#dcfce7"
        />
        <KpiCard
          icon="❌"
          label="Total Absent Days"
          value={kpis.totalAbsent.toLocaleString()}
          sub="Roster absence records"
          color="#dc2626"
          iconBg="#fee2e2"
        />
        <KpiCard
          icon="⚠️"
          label="Total Late Count"
          value={kpis.totalLate.toLocaleString()}
          sub="Arrivals past grace"
          color="#d97706"
          iconBg="#fef3c7"
        />
      </div>

      {/* FILTER PANEL */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(90deg, #eef2ff 0%, #f8fafc 100%)',
          borderBottom: '1px solid #e2e8f0', padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style={{ color: '#4f46e5' }}>
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
          </svg>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>Monthly Report Filters</span>
          <span style={{ fontSize: 11, color: '#64748b', marginLeft: 4 }}>
            — {filteredRows.length.toLocaleString()} employees · {month}
          </span>
        </div>

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Region */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Region</label>
              <FilterSelect value={region} onChange={setRegion} options={REGIONS} width={168} />
            </div>

            {/* Department */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</label>
              <FilterSelect value={dept} onChange={setDept} options={DEPARTMENTS} width={178} />
            </div>

            {/* Attendance Band */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendance Band</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ATTENDANCE_BANDS.map(b => {
                  const active = band === b;
                  const clr = b.includes('Excellent') ? '#16a34a'
                    : b.includes('Good') ? '#1d4ed8'
                    : b.includes('Satisfactory') ? '#d97706'
                    : b.includes('Poor') ? '#dc2626' : '#4f46e5';
                  return (
                    <button key={b} onClick={() => setBand(b)} style={{
                      padding: '4px 11px', fontSize: 11, borderRadius: 12, cursor: 'pointer',
                      fontWeight: active ? 700 : 500,
                      border: active ? `1.5px solid ${clr}` : '1.5px solid #e5e7eb',
                      background: active ? clr + '15' : '#fff',
                      color: active ? clr : '#6b7280', transition: 'all 0.15s'
                    }}>{b}</button>
                  );
                })}
              </div>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 200px' }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee Search</label>
              <div style={{ position: 'relative' }}>
                <input className="bs-input"
                  style={{ width: '100%', height: 32, fontSize: 12, paddingLeft: 30 }}
                  placeholder="Search by ID, Name or Branch..."
                  value={search} onChange={e => setSearch(e.target.value)} />
                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"
                  style={{ position: 'absolute', left: 9, top: 9.5, color: '#9ca3af', pointerEvents: 'none' }}>
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
                {search && <button onClick={() => setSearch('')} style={{
                  position: 'absolute', right: 8, top: 8, background: 'none',
                  border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 14
                }}>✕</button>}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
              <button className="bs-btn bs-btn-outline bs-btn-sm" onClick={handleReset}
                style={{ height: 34, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                ↺ Reset
              </button>
              <button onClick={handleExport} style={{
                background: 'linear-gradient(135deg, #3730a3, #4f46e5)',
                color: '#fff', border: 'none', height: 34, fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px',
                borderRadius: 6, cursor: 'pointer', boxShadow: '0 2px 6px rgba(79,70,229,0.3)'
              }}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div style={{
            padding: '8px 16px 10px', borderTop: '1px solid #f1f5f9',
            display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center'
          }}>
            <span style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Active:</span>
            {activeFilters.map((chip, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: '#eef2ff', color: '#4f46e5',
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10
              }}>
                {chip.label}
                <button onClick={chip.clear} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontSize: 13
                }}>✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* MONTHLY ATTENDANCE TABLE */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden'
      }}>
        <div style={{
          padding: '10px 16px', background: '#eef2ff',
          borderBottom: '2px solid #c7d2fe',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>📆 Monthly Ledger — {month}</span>
            <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
              {filteredRows.length.toLocaleString()} Staff
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            Showing {filteredRows.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} –{' '}
            {Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#eef2ff', borderBottom: '2px solid #c7d2fe' }}>
                {['#', 'User ID', 'Staff Name', 'Branch', 'Department',
                  'Working Days', 'Total Present', 'Total Absent', 'Late Count',
                  'Attendance %', '31-Day Matrix', 'Compliance'].map(col => (
                  <th key={col} style={{
                    padding: '9px 11px', textAlign: col === 'Attendance %' || col === '31-Day Matrix' ? 'center' : 'left',
                    fontSize: 10.5, fontWeight: 800, color: '#3730a3',
                    textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap'
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => {
                const rowNum = (currentPage - 1) * pageSize + i + 1;
                const isAlternate = i % 2 === 0;
                const bgTint = row.band === 'Poor' ? '#fff5f5' : row.band === 'Excellent' ? '#f0fdf4' : '#ffffff';
                return (
                  <tr key={row.userId + i}
                    style={{ background: isAlternate ? bgTint : '#fafbfc', borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
                    onMouseLeave={e => e.currentTarget.style.background = isAlternate ? bgTint : '#fafbfc'}>
                    <td style={{ padding: '7px 11px', color: '#cbd5e1', fontSize: 11 }}>{rowNum}</td>
                    <td style={{ padding: '7px 11px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 11.5, fontWeight: 700, color: '#4f46e5' }}>{row.userId}</span>
                    </td>
                    <td style={{ padding: '7px 11px', fontWeight: 600, color: '#1e293b' }}>{row.name}</td>
                    <td style={{ padding: '7px 11px', color: '#475569', fontSize: 11 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ color: '#4f46e5', fontSize: 10 }}>📍</span>
                        {row.branch.length > 22 ? row.branch.slice(0, 22) + '…' : row.branch}
                      </div>
                    </td>
                    <td style={{ padding: '7px 11px', color: '#64748b', fontSize: 11 }}>{row.department}</td>
                    <td style={{ padding: '7px 11px', textAlign: 'center', fontWeight: 700, color: '#374151' }}>{row.workingDays}</td>
                    <td style={{ padding: '7px 11px', textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>{row.presentDays}</td>
                    <td style={{ padding: '7px 11px', textAlign: 'center', fontWeight: 700, color: row.absentDays > 3 ? '#dc2626' : '#6b7280' }}>
                      {row.absentDays}
                    </td>
                    <td style={{ padding: '7px 11px', textAlign: 'center', fontWeight: 700,
                      color: row.lateTimes > 2 ? '#d97706' : '#6b7280' }}>
                      {row.lateTimes}×
                    </td>
                    <td style={{ padding: '7px 11px', minWidth: 120 }}>
                      <PctBar pct={row.pct} />
                    </td>
                    <td style={{ padding: '7px 11px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedEmployeeModal(row)}
                        style={{
                          padding: '4px 9px', fontSize: 11, fontWeight: 700,
                          background: '#eef2ff', color: '#4f46e5',
                          border: '1px solid #c7d2fe', borderRadius: 4,
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                        }}
                        title="Tender Catalog ATT-02: View full Day 1–31 P/A/L calendar matrix"
                      >
                        📅 Day 1–31 (ATT-02)
                      </button>
                    </td>
                    <td style={{ padding: '7px 11px' }}><BandBadge band={row.band} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRows.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>No records found</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Adjust your filters above</div>
            <button className="bs-btn bs-btn-outline bs-btn-sm" onClick={handleReset} style={{ marginTop: 14 }}>Reset Filters</button>
          </div>
        )}

        {filteredRows.length > pageSize && (
          <div style={{
            padding: '10px 16px', borderTop: '1px solid #e5e7eb', background: '#f8fafc',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontSize: 11, color: '#6b7280' }}>
              Page {currentPage} of {totalPages} · {filteredRows.length.toLocaleString()} total employees
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { label: '«', action: () => setCurrentPage(1), disabled: currentPage === 1 },
                { label: '‹', action: () => setCurrentPage(p => Math.max(1, p - 1)), disabled: currentPage === 1 },
                { label: '›', action: () => setCurrentPage(p => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages },
                { label: '»', action: () => setCurrentPage(totalPages), disabled: currentPage === totalPages },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} disabled={btn.disabled} style={{
                  width: 30, height: 30, borderRadius: 6, border: '1px solid #e2e8f0',
                  background: btn.disabled ? '#f8fafc' : '#fff',
                  color: btn.disabled ? '#d1d5db' : '#374151',
                  cursor: btn.disabled ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{btn.label}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── ATT-02 31-DAY ATTENDANCE ROSTER CALENDAR MODAL ── */}
      {selectedEmployeeModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16
        }}>
          <div style={{
            background: '#ffffff', borderRadius: 12, width: '100%', maxWidth: 720,
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)', border: '1px solid #c7d2fe', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b, #3730a3)', color: '#ffffff',
              padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>
                  📅 Monthly Attendance Roster (ATT-02) — {selectedEmployeeModal.name}
                </div>
                <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 3 }}>
                  ID: {selectedEmployeeModal.userId} · {selectedEmployeeModal.branch} · {selectedEmployeeModal.department} · {month}
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployeeModal(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', color: '#ffffff',
                  width: 32, height: 32, borderRadius: 6, fontSize: 16, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal KPI Summary */}
            <div style={{
              display: 'flex', gap: 10, padding: '12px 20px', background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                ✓ Present: {selectedEmployeeModal.presentDays} Days
              </span>
              <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}>
                ✗ Absent: {selectedEmployeeModal.absentDays} Days
              </span>
              <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: '#fef9c3', color: '#92400e', fontWeight: 700 }}>
                ⚠️ Late: {selectedEmployeeModal.lateTimes} Times
              </span>
              <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: '#e0e7ff', color: '#3730a3', fontWeight: 700 }}>
                📊 Monthly Rate: {selectedEmployeeModal.pct}%
              </span>
            </div>

            {/* 31-Day Grid */}
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 10 }}>
                31-Day Attendance Calendar Grid (P / A / L / H Markers):
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8
              }}>
                {selectedEmployeeModal.dayMatrix.map((code, idx) => {
                  const day = idx + 1;
                  const cfg = {
                    P: { bg: '#dcfce7', border: '#86efac', text: '#15803d', label: 'Present' },
                    A: { bg: '#fee2e2', border: '#fca5a5', text: '#b91c1c', label: 'Absent' },
                    L: { bg: '#fef9c3', border: '#fde047', text: '#92400e', label: 'Late' },
                    H: { bg: '#f1f5f9', border: '#cbd5e1', text: '#64748b', label: 'Weekend' },
                  }[code] || { bg: '#fff', border: '#e2e8f0', text: '#333', label: code };

                  return (
                    <div
                      key={day}
                      style={{
                        background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 6,
                        padding: '8px 6px', textAlign: 'center'
                      }}
                      title={`Day ${day}: ${cfg.label}`}
                    >
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>Day {day}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: cfg.text, marginTop: 2 }}>{code}</div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{
                marginTop: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9',
                display: 'flex', gap: 14, fontSize: 11, color: '#64748b', alignItems: 'center', flexWrap: 'wrap'
              }}>
                <span style={{ fontWeight: 700 }}>Legend:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: '#dcfce7', border: '1px solid #86efac', display: 'inline-block' }} />
                  <strong>[P]</strong> Present
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: '#fee2e2', border: '1px solid #fca5a5', display: 'inline-block' }} />
                  <strong>[A]</strong> Absent
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: '#fef9c3', border: '1px solid #fde047', display: 'inline-block' }} />
                  <strong>[L]</strong> Late
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: '#f1f5f9', border: '1px solid #cbd5e1', display: 'inline-block' }} />
                  <strong>[H]</strong> Weekend / Holiday
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'flex-end', gap: 8
            }}>
              <button
                onClick={() => setSelectedEmployeeModal(null)}
                className="bs-btn bs-btn-outline bs-btn-sm"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
