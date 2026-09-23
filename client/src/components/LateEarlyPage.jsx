import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FULL_PUBALI_LOCATIONS } from '../data/pubaliFullBranches';
import { useBankFilters } from './filters/FilterContext';

// ─── CONSTANTS ───────────────────────────────────────────────
const SHIFTS = [
  'All Shifts',
  'General Banking (08:30)',
  'Upashakha Standard (08:30)',
  'Head Office Corporate (09:00)',
  'Regional Operations (08:00)',
  'Data Center 24/7 (Rotational)'
];

const REGIONS = [
  'All Regions', 'Dhaka Region', 'Chittagong Region', 'Sylhet Region',
  'Rajshahi Region', 'Khulna Region', 'Barisal Region', 'Rangpur Region', 'Mymensingh Region'
];

const DATE_RANGES = ['Today', 'Yesterday', 'This Week', 'This Month'];

const VIOLATION_TYPES = ['All Violations', 'Late Arrival', 'Early Departure', 'Both'];

const SEVERITY = ['All Severity', 'Low (≤15 min)', 'Medium (16–30 min)', 'High (>30 min)'];

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

// ─── BUILD RAW ROWS ──────────────────────────────────────────
function buildRows() {
  const rows = [];
  FULL_PUBALI_LOCATIONS.forEach(loc => {
    if (!loc.employees) return;
    const region = DIVISION_REGION_MAP[loc.division] || 'Dhaka Region';
    loc.employees.filter(e => e.late || e.status === 'Absent').forEach((emp, idx) => {
      // Late duration: vary by employee index
      const mins = 10 + ((emp.id?.charCodeAt(emp.id.length - 1) || idx) % 45);
      const severity = mins <= 15 ? 'Low' : mins <= 30 ? 'Medium' : 'High';
      const isLate = emp.late;
      const violationType = isLate ? 'Late Arrival' : 'Early Departure';
      const deptIdx = (emp.id?.charCodeAt(emp.id.length - 1) || idx) % DEPT_POOL.length;
      const department = DEPT_POOL[deptIdx];
      const isCorp = loc.name.includes('Corporate') || loc.name.includes('Principal') || loc.name.includes('Head Office');
      const shiftWindow = isLate
        ? (isCorp ? 'Start 09:00 AM (Grace: 09:15)' : 'Start 08:30 AM (Grace: 08:45)')
        : (isCorp ? 'End 07:00 PM' : 'End 06:30 PM');
      const punchTime = isLate
        ? (emp.inTime !== '—' ? emp.inTime : (isCorp ? '09:34 AM' : '08:58 AM'))
        : (isCorp ? '06:14 PM' : '05:46 PM');

      rows.push({
        userId: emp.id,
        name: emp.name,
        branch: loc.name,
        region,
        department,
        punchTime,
        shift: isCorp ? 'Corporate (09:00)' : 'General Banking (08:30)',
        shiftWindow,
        duration: `+${mins} min`,
        durationMins: mins,
        severity,
        violationType,
        status: isLate ? 'Late' : 'Early Departure',
        terminal: loc.devices?.[0]?.name || 'BioStation 3',
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
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flex: '1 1 0',
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
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          {active ? (
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              color: '#ffffff',
              background: color,
              padding: '1px 5px',
              borderRadius: 3,
              lineHeight: 1.2,
              letterSpacing: '0.03em'
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
              lineHeight: 1
            }}>
              →
            </span>
          )}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const cfg = {
    High:   { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', label: '🔴 High' },
    Medium: { bg: '#fef9c3', color: '#92400e', dot: '#f59e0b', label: '🟡 Medium' },
    Low:    { bg: '#dcfce7', color: '#15803d', dot: '#22c55e', label: '🟢 Low' },
  };
  const s = cfg[severity] || { bg: '#f3f4f6', color: '#4b5563', dot: '#9ca3af', label: severity };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 12
    }}>{s.label}</span>
  );
}

function ViolationBadge({ type }) {
  const cfg = {
    'Late Arrival':      { bg: '#fef9c3', color: '#92400e', icon: '⏰' },
    'Early Departure':   { bg: '#fce7f3', color: '#9d174d', icon: '🚪' },
    'Both':              { bg: '#fee2e2', color: '#b91c1c', icon: '⚠️' },
  };
  const s = cfg[type] || { bg: '#f3f4f6', color: '#4b5563', icon: '—' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 12
    }}>{s.icon} {type}</span>
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
export default function LateEarlyPage() {
  const allRows = useMemo(() => buildRows(), []);

  // ── Consume global FilterContext (region, search, date preset)
  const { region: globalRegion, searchQuery: globalSearch, datePreset: globalDatePreset } = useBankFilters();

  const [region, setRegion]         = useState('All Regions');
  const [dateRange, setDateRange]   = useState('Today');
  const [shift, setShift]           = useState('All Shifts');
  const [violation, setViolation]   = useState('All Violations');
  const [severity, setSeverity]     = useState('All Severity');
  const [search, setSearch]         = useState('');
  const [sortByDuration, setSortByDuration] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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

  useEffect(() => {
    const presetToLabel = { today: 'Today', '24h': 'Yesterday', '7d': 'This Week', '30d': 'This Month' };
    if (globalDatePreset && presetToLabel[globalDatePreset]) {
      setDateRange(presetToLabel[globalDatePreset]);
    }
  }, [globalDatePreset]);

  // ── scope data (filters except violation/severity so KPI summary cards show full breakdown)
  const scopeRows = useMemo(() => {
    return allRows.filter(r => {
      if (region !== 'All Regions' && r.region !== region) return false;
      if (shift !== 'All Shifts' && r.shift !== shift) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!r.userId.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q) &&
            !r.branch.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allRows, region, shift, search]);

  // ── filtered data (applies violation & severity filters, plus optional duration sorting)
  const filteredRows = useMemo(() => {
    let list = scopeRows.filter(r => {
      if (violation !== 'All Violations' && r.violationType !== violation) return false;
      if (severity !== 'All Severity') {
        if (severity === 'Low (≤15 min)' && r.severity !== 'Low') return false;
        if (severity === 'Medium (16–30 min)' && r.severity !== 'Medium') return false;
        if (severity === 'High (>30 min)' && r.severity !== 'High') return false;
      }
      return true;
    });
    if (sortByDuration) {
      list = [...list].sort((a, b) => b.durationMins - a.durationMins);
    }
    return list;
  }, [scopeRows, violation, severity, sortByDuration]);

  // ── KPIs (computed across scopeRows so numbers remain consistent and interactive)
  const kpis = useMemo(() => {
    const late  = scopeRows.filter(r => r.violationType === 'Late Arrival').length;
    const early = scopeRows.filter(r => r.violationType === 'Early Departure').length;
    const high  = scopeRows.filter(r => r.severity === 'High').length;
    const avgMins = scopeRows.length
      ? Math.round(scopeRows.reduce((s, r) => s + r.durationMins, 0) / scopeRows.length)
      : 0;
    return { total: scopeRows.length, late, early, high, avgMins };
  }, [scopeRows]);

  useEffect(() => setCurrentPage(1), [filteredRows]);
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const pageRows = useMemo(() => {
    const s = (currentPage - 1) * pageSize;
    return filteredRows.slice(s, s + pageSize);
  }, [filteredRows, currentPage]);

  const handleExport = useCallback(() => {
    const header = 'User ID,Employee Name,Branch,Department,Shift Window,Actual Punch Time,Variance Past Grace,Violation Type,Severity';
    const body = filteredRows.map(r =>
      `"${r.userId}","${r.name}","${r.branch}","${r.department}","${r.shiftWindow}","${r.punchTime}","${r.duration}","${r.violationType}","${r.severity}"`
    ).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pubali-late-early-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }, [filteredRows]);

  const handleReset = () => {
    setRegion('All Regions'); setDateRange('Today'); setShift('All Shifts');
    setViolation('All Violations'); setSeverity('All Severity'); setSearch('');
    setSortByDuration(false);
  };

  const dateLabel = dateRange === 'Today'
    ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : dateRange;

  const activeFilters = [
    { label: region, clear: () => setRegion('All Regions'), cond: region !== 'All Regions' },
    { label: dateRange, clear: () => setDateRange('Today'), cond: dateRange !== 'Today' },
    { label: shift, clear: () => setShift('All Shifts'), cond: shift !== 'All Shifts' },
    { label: violation, clear: () => setViolation('All Violations'), cond: violation !== 'All Violations' },
    { label: severity, clear: () => setSeverity('All Severity'), cond: severity !== 'All Severity' },
    { label: 'Sorted: Longest Deviation', clear: () => setSortByDuration(false), cond: sortByDuration },
    { label: `"${search}"`, clear: () => setSearch(''), cond: !!search },
  ].filter(f => f.cond);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* PAGE HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #431407 0%, #c2410c 55%, #f97316 100%)',
        borderRadius: 8, padding: '16px 22px', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, boxShadow: '0 4px 16px rgba(194,65,12,0.22)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 10,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
          }}>⏰</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em' }}>
              Late Arrival &amp; Early Departure Report (ATT-03 / ATT-05)
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.88, marginTop: 2 }}>
              Shift grace compliance &amp; early exit tracking · Pubali Bank PLC · All 829 Branches
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600 }}>
            📅 {dateLabel}
          </div>
          <div style={{ background: '#ea580c', borderRadius: 6, padding: '6px 12px', fontSize: 11.5, fontWeight: 700 }}>
            ⚠️ {kpis.high} HIGH SEVERITY
          </div>
        </div>
      </div>

      {/* KPI CARDS (ATT-03 Late Count & ATT-05 Early Departure Count) */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          icon="⏰"
          label="Late Count (ATT-03)"
          value={kpis.late.toLocaleString()}
          sub="Arrived past grace window"
          color="#d97706"
          iconBg="#fef3c7"
          active={violation === 'Late Arrival'}
          onClick={() => setViolation(v => v === 'Late Arrival' ? 'All Violations' : 'Late Arrival')}
          title="Tender Catalog ATT-03 KPI: Late Count — Click to filter Late arrivals"
        />
        <KpiCard
          icon="🚪"
          label="Early Departure Count (ATT-05)"
          value={kpis.early.toLocaleString()}
          sub="Left before shift end"
          color="#9333ea"
          iconBg="#f3e8ff"
          active={violation === 'Early Departure'}
          onClick={() => setViolation(v => v === 'Early Departure' ? 'All Violations' : 'Early Departure')}
          title="Tender Catalog ATT-05 KPI: Early Departure Count — Click to filter Early departures"
        />
        <KpiCard
          icon="🚨"
          label="Total Violations"
          value={kpis.total.toLocaleString()}
          sub="In filtered bank scope"
          color="#dc2626"
          iconBg="#fef2f2"
          active={violation === 'All Violations' && severity === 'All Severity' && !sortByDuration}
          onClick={() => {
            setViolation('All Violations');
            setSeverity('All Severity');
            setSortByDuration(false);
          }}
          title="Click to reset filters and view all violations"
        />
        <KpiCard
          icon="🔴"
          label="High Severity (>30m)"
          value={kpis.high.toLocaleString()}
          sub="Critical escalation incidents"
          color="#b91c1c"
          iconBg="#fee2e2"
          active={severity === 'High (>30 min)'}
          onClick={() => setSeverity(s => s === 'High (>30 min)' ? 'All Severity' : 'High (>30 min)')}
          title="Click to filter High Severity violations (> 30 min)"
        />
        <KpiCard
          icon="⏱️"
          label="Avg. Deviation Time"
          value={`${kpis.avgMins} min`}
          sub="Mean variance from shift window"
          color="#0284c7"
          iconBg="#e0f2fe"
          active={sortByDuration}
          onClick={() => setSortByDuration(p => !p)}
          title="Click to sort table by longest violation deviation descending"
        />
      </div>

      {/* FILTER PANEL */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(90deg, #fff7ed 0%, #f8fafc 100%)',
          borderBottom: '1px solid #e2e8f0', padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style={{ color: '#ea580c' }}>
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
          </svg>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>Violation Filters</span>
          <span style={{ fontSize: 11, color: '#64748b', marginLeft: 4 }}>
            — {filteredRows.length.toLocaleString()} violations matched
          </span>
        </div>

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Row 1 */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Date Range */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Range</label>
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 6, padding: 2, gap: 2 }}>
                {DATE_RANGES.map(d => (
                  <button key={d} onClick={() => setDateRange(d)} style={{
                    padding: '4px 10px', fontSize: 11, borderRadius: 4, border: 'none', cursor: 'pointer',
                    fontWeight: dateRange === d ? 700 : 500,
                    background: dateRange === d ? '#ea580c' : 'transparent',
                    color: dateRange === d ? '#fff' : '#475569',
                    transition: 'all 0.15s', whiteSpace: 'nowrap'
                  }}>{d}</button>
                ))}
              </div>
            </div>

            {/* Region */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Region</label>
              <FilterSelect value={region} onChange={setRegion} options={REGIONS} width={168} />
            </div>

            {/* Shift */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned Shift</label>
              <FilterSelect value={shift} onChange={setShift} options={SHIFTS} width={210} />
            </div>

            {/* Employee Search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 200px' }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee Search</label>
              <div style={{ position: 'relative' }}>
                <input className="bs-input"
                  style={{ width: '100%', height: 32, fontSize: 12, paddingLeft: 30 }}
                  placeholder="Search by ID or Name..."
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
          </div>

          {/* Row 2 */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Violation Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Violation Type</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {VIOLATION_TYPES.map(v => {
                  const active = violation === v;
                  const clr = v === 'Late Arrival' ? '#d97706' : v === 'Early Departure' ? '#9333ea' : v === 'Both' ? '#dc2626' : '#0d9488';
                  return (
                    <button key={v} onClick={() => setViolation(v)} style={{
                      padding: '4px 12px', fontSize: 11, borderRadius: 12, cursor: 'pointer',
                      fontWeight: active ? 700 : 500,
                      border: active ? `1.5px solid ${clr}` : '1.5px solid #e5e7eb',
                      background: active ? clr + '18' : '#fff',
                      color: active ? clr : '#6b7280', transition: 'all 0.15s'
                    }}>{v}</button>
                  );
                })}
              </div>
            </div>

            {/* Severity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Severity Level</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {SEVERITY.map(s => {
                  const active = severity === s;
                  const clr = s.includes('High') ? '#dc2626' : s.includes('Medium') ? '#d97706' : s.includes('Low') ? '#16a34a' : '#0d9488';
                  return (
                    <button key={s} onClick={() => setSeverity(s)} style={{
                      padding: '4px 12px', fontSize: 11, borderRadius: 12, cursor: 'pointer',
                      fontWeight: active ? 700 : 500,
                      border: active ? `1.5px solid ${clr}` : '1.5px solid #e5e7eb',
                      background: active ? clr + '18' : '#fff',
                      color: active ? clr : '#6b7280', transition: 'all 0.15s'
                    }}>{s}</button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
              <button className="bs-btn bs-btn-outline bs-btn-sm" onClick={handleReset}
                style={{ height: 34, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                ↺ Reset
              </button>
              <button onClick={handleExport} style={{
                background: 'linear-gradient(135deg, #c2410c, #ea580c)',
                color: '#fff', border: 'none', height: 34, fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px',
                borderRadius: 6, cursor: 'pointer', boxShadow: '0 2px 6px rgba(194,65,12,0.3)'
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
                background: '#fff7ed', color: '#c2410c',
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10
              }}>
                {chip.label}
                <button onClick={chip.clear} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#c2410c', fontSize: 13
                }}>✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* VIOLATIONS TABLE */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden'
      }}>
        <div style={{
          padding: '10px 16px', background: '#fff7ed',
          borderBottom: '2px solid #fed7aa',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>⚠️ Violation Log</span>
            <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
              {filteredRows.length.toLocaleString()} Records
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
              <tr style={{ background: '#fff7ed', borderBottom: '2px solid #fed7aa' }}>
                {['#', 'User ID', 'Employee Name', 'Branch / Location', 'Department',
                  'Shift Window', 'Actual Punch Time', 'Variance Past Grace', 'Violation Type', 'Severity'].map(col => (
                  <th key={col} style={{
                    padding: '9px 12px', textAlign: 'left',
                    fontSize: 10.5, fontWeight: 800, color: '#c2410c',
                    textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap'
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => {
                const rowNum = (currentPage - 1) * pageSize + i + 1;
                const isAlternate = i % 2 === 0;
                const rowBg = row.severity === 'High' ? '#fff5f5'
                            : row.severity === 'Medium' ? '#fffbeb' : '#ffffff';
                return (
                  <tr key={row.userId + i}
                    style={{ background: isAlternate ? rowBg : '#fafbfc', borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff7ed'}
                    onMouseLeave={e => e.currentTarget.style.background = isAlternate ? rowBg : '#fafbfc'}>
                    <td style={{ padding: '8px 12px', color: '#cbd5e1', fontSize: 11 }}>{rowNum}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 11.5, fontWeight: 700, color: '#c2410c' }}>{row.userId}</span>
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1e293b' }}>{row.name}</td>
                    <td style={{ padding: '8px 12px', color: '#475569', fontSize: 11.5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ color: '#c2410c', fontSize: 10 }}>📍</span>
                        {row.branch.length > 26 ? row.branch.slice(0, 26) + '…' : row.branch}
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#64748b', fontSize: 11 }}>{row.department}</td>
                    <td style={{ padding: '8px 12px', color: '#64748b', fontSize: 11, fontWeight: 600 }}>{row.shiftWindow}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                        color: row.punchTime === '—' ? '#dc2626' : '#d97706'
                      }}>{row.punchTime}</span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        fontFamily: 'monospace', fontSize: 13, fontWeight: 800,
                        color: row.severity === 'High' ? '#dc2626'
                             : row.severity === 'Medium' ? '#d97706' : '#16a34a'
                      }}>{row.duration}</span>
                    </td>
                    <td style={{ padding: '8px 12px' }}><ViolationBadge type={row.violationType} /></td>
                    <td style={{ padding: '8px 12px' }}><SeverityBadge severity={row.severity} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRows.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>No violations found</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>All employees within shift grace window</div>
            <button className="bs-btn bs-btn-outline bs-btn-sm" onClick={handleReset} style={{ marginTop: 14 }}>Reset Filters</button>
          </div>
        )}

        {filteredRows.length > pageSize && (
          <div style={{
            padding: '10px 16px', borderTop: '1px solid #e5e7eb', background: '#f8fafc',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontSize: 11, color: '#6b7280' }}>
              Page {currentPage} of {totalPages} · {filteredRows.length.toLocaleString()} total violations
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
    </div>
  );
}
