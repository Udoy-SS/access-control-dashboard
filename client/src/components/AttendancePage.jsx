import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FULL_PUBALI_LOCATIONS } from '../data/pubaliFullBranches';
import { useBankFilters } from './filters/FilterContext';
import { TableColumnFilter } from './filters';

// ─── HELPERS ────────────────────────────────────────────────
const DEPARTMENTS = [
  'All Departments', 'Cash Department', 'IT Department', 'HR Department',
  'Operations', 'Accounts', 'Islamic Banking', 'Audit & Compliance', 'Corporate Banking'
];

const REGIONS = [
  'All Regions', 'Dhaka Region', 'Chittagong Region', 'Sylhet Region',
  'Rajshahi Region', 'Khulna Region', 'Barisal Region', 'Rangpur Region', 'Mymensingh Region'
];

const TERMINALS = [
  'All Devices', 'BioStation 3', 'BioStation 2', 'BioEntry W2', 'BioEntry P2',
  'BioLite N2', 'X-Pass 2', 'CoreStation CS-40'
];

const DATE_RANGES = ['Today', 'Yesterday', 'This Week', 'This Month', 'Custom Range'];

const STATUS_OPTIONS = ['All Status', 'Present', 'Late', 'Absent', 'Leave', 'Early Departure'];

// Map divisions to region label
const DIVISION_REGION_MAP = {
  'Dhaka': 'Dhaka Region',
  'Chittagong': 'Chittagong Region',
  'Sylhet': 'Sylhet Region',
  'Rajshahi': 'Rajshahi Region',
  'Khulna': 'Khulna Region',
  'Barisal': 'Barisal Region',
  'Rangpur': 'Rangpur Region',
  'Mymensingh': 'Mymensingh Region',
};

const DEPT_POOL = [
  'Cash Department', 'IT Department', 'HR Department',
  'Operations', 'Accounts', 'Islamic Banking', 'Audit & Compliance', 'Corporate Banking'
];

// ─── BUILD RAW ATTENDANCE ROWS ───────────────────────────────
function buildAttendanceRows() {
  const rows = [];
  FULL_PUBALI_LOCATIONS.forEach(loc => {
    if (!loc.employees) return;
    const terminal = loc.devices && loc.devices[0] ? loc.devices[0].name : 'BioStation 3';
    const region = DIVISION_REGION_MAP[loc.division] || 'Dhaka Region';
    const shift = loc.name.includes('Corporate') || loc.name.includes('Principal') || loc.name.includes('Head Office')
      ? '09:00 – 19:00'
      : '08:30 – 18:30';

    loc.employees.forEach((emp, idx) => {
      const isAbsent = emp.status === 'Absent';
      const isLate = emp.late;
      let attendStatus = 'Present';
      if (isAbsent) attendStatus = 'Absent';
      else if (isLate) attendStatus = 'Late';

      const deptIdx = (emp.id?.charCodeAt(emp.id.length - 1) || idx) % DEPT_POOL.length;

      rows.push({
        userId: emp.id,
        name: emp.name,
        branch: loc.name,
        branchCode: loc.code,
        region,
        division: loc.division,
        shift,
        punchIn: isAbsent ? '—' : (emp.inTime !== '—' ? `${emp.inTime}` : '—'),
        terminal,
        department: DEPT_POOL[deptIdx],
        attendance: isAbsent ? 'Absent' : 'Check In',
        status: attendStatus,
        late: isLate,
        zone: loc.zone || '',
      });
    });
  });
  return rows;
}

// ─── STATUS BADGE ────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = {
    Present:         { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
    Late:            { bg: '#fef9c3', color: '#92400e', dot: '#f59e0b' },
    Absent:          { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
    Leave:           { bg: '#e0f2fe', color: '#0369a1', dot: '#38bdf8' },
    'Early Departure': { bg: '#fce7f3', color: '#9d174d', dot: '#ec4899' },
    'Check In':      { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
  };
  const s = cfg[status] || { bg: '#f3f4f6', color: '#4b5563', dot: '#9ca3af' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, padding: '2px 9px',
      borderRadius: 12, letterSpacing: '0.02em'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ─── KPI CARD ────────────────────────────────────────────────
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
        <div style={{ fontSize: 22, fontWeight: 800, color: color, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── SELECT COMPONENT ────────────────────────────────────────
function FilterSelect({ value, onChange, options, width = 160 }) {
  return (
    <select
      className="bs-select"
      style={{ width, fontSize: 12, height: 32 }}
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────
export default function AttendancePage({ onNavigate }) {
  const {
    region: globalRegion,
    branch: globalBranch,
    searchQuery,
    moduleFilters,
    tableColumnFilters
  } = useBankFilters();

  const allRows = useMemo(() => buildAttendanceRows(), []);

  // ── view mode: 'branch' (ATT-01 Daily Branch Attendance Dashboard) or 'employee' (Punch Log)
  const [viewMode, setViewMode] = useState('branch');

  // ── filter state
  const [branch, setBranch]     = useState('All Branches');
  const [region, setRegion]     = useState('All Regions');
  const [dateRange, setDateRange] = useState('Today');
  const [search, setSearch]     = useState('');
  const [dept, setDept]         = useState('All Departments');
  const [statusF, setStatusF]   = useState('All Status');
  const [terminal, setTerminal] = useState('All Devices');
  const [currentPage, setCurrentPage] = useState(1);
  const [applied, setApplied]   = useState(true);   // tracks if filters applied
  const [sortCol, setSortCol]   = useState(null);
  const [sortDir, setSortDir]   = useState(null);
  const pageSize = 30;

  const handleSortChange = (col, dir) => {
    setSortCol(dir ? col : null);
    setSortDir(dir);
  };

  // derive unique branch list
  const branchOptions = useMemo(() => {
    const set = new Set(allRows.map(r => r.branch));
    return ['All Branches', ...Array.from(set).sort().slice(0, 80)];
  }, [allRows]);

  // ── scope data (filters except statusF so KPI summary cards show complete breakdown)
  const scopeRows = useMemo(() => {
    return allRows.filter(row => {
      // 1. Global / local region
      const effectiveRegion = (globalRegion && globalRegion !== 'All Regions') ? globalRegion : region;
      if (effectiveRegion !== 'All Regions') {
        const target = effectiveRegion.toLowerCase();
        const rReg = (row.region || '').toLowerCase();
        const rDiv = (row.division || '').toLowerCase();
        const rBranch = (row.branch || '').toLowerCase();
        if (!rReg.includes(target) && !rDiv.includes(target) && !rBranch.includes(target)) return false;
      }

      // 2. Global / local branch
      const effectiveBranch = (globalBranch && globalBranch !== 'All Branches') ? globalBranch : branch;
      if (effectiveBranch !== 'All Branches') {
        const target = effectiveBranch.toLowerCase();
        const rBranch = (row.branch || '').toLowerCase();
        if (!rBranch.includes(target) && !target.includes(rBranch)) return false;
      }

      // 3. Dept (local or moduleFilters)
      const effectiveDept = (moduleFilters.department && moduleFilters.department !== 'All') ? moduleFilters.department : dept;
      if (effectiveDept !== 'All' && effectiveDept !== 'All Departments') {
        const d = (row.department || '').toLowerCase();
        const target = effectiveDept.toLowerCase();
        if (!d.includes(target)) return false;
      }

      // 4. Terminal
      if (terminal !== 'All Devices' && row.terminal !== terminal) return false;

      // 5. Search
      const effectiveSearch = searchQuery || search;
      if (effectiveSearch && effectiveSearch.trim()) {
        const q = effectiveSearch.toLowerCase().trim();
        if (
          !row.userId.toLowerCase().includes(q) &&
          !row.name.toLowerCase().includes(q) &&
          !row.branch.toLowerCase().includes(q) &&
          !(row.department || '').toLowerCase().includes(q)
        ) return false;
      }

      // 6. Table Column Filters (for branchSummary or general fields)
      for (const [col, val] of Object.entries(tableColumnFilters)) {
        if (!val || !val.trim()) continue;
        const v = val.toLowerCase().trim();
        if (col.includes('branch') && !row.branch.toLowerCase().includes(v)) return false;
        if (col.includes('region') && !row.region.toLowerCase().includes(v) && !row.division.toLowerCase().includes(v)) return false;
        if ((col.includes('user') || col.includes('id')) && !row.userId.toLowerCase().includes(v)) return false;
        if (col.includes('name') && !row.name.toLowerCase().includes(v)) return false;
        if (col.includes('dept') && !row.department.toLowerCase().includes(v)) return false;
        if (col.includes('terminal') && !row.terminal.toLowerCase().includes(v)) return false;
      }

      return true;
    });
  }, [allRows, branch, region, globalBranch, globalRegion, dept, terminal, search, searchQuery, moduleFilters, tableColumnFilters]);

  // ── ATT-01 Branch-Wise Attendance Summary (Fields: Branch, Total Staff, Present, Late, Absent, Attendance %)
  const branchSummary = useMemo(() => {
    const map = new Map();
    scopeRows.forEach(r => {
      if (!map.has(r.branch)) {
        map.set(r.branch, {
          branch: r.branch,
          region: r.region,
          division: r.division,
          total: 0,
          present: 0,
          late: 0,
          absent: 0
        });
      }
      const b = map.get(r.branch);
      b.total += 1;
      if (r.status === 'Present') b.present += 1;
      else if (r.status === 'Late') { b.present += 1; b.late += 1; }
      else if (r.status === 'Absent') b.absent += 1;
    });

    let list = Array.from(map.values()).map(b => {
      const pct = b.total > 0 ? Math.round((b.present / b.total) * 100) : 0;
      return { ...b, pct };
    });

    if (sortCol && sortDir) {
      list.sort((a, b) => {
        let valA = a[sortCol] ?? '';
        let valB = b[sortCol] ?? '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDir === 'asc' ? valA - valB : valB - valA;
        }
        const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    } else {
      list.sort((a, b) => b.total - a.total);
    }

    return list;
  }, [scopeRows, sortCol, sortDir]);

  // ── filtered data (applies status filter for employee records)
  const filteredRows = useMemo(() => {
    const effectiveStatus = (moduleFilters.attStatus && moduleFilters.attStatus !== 'All')
      ? moduleFilters.attStatus
      : statusF;

    let res = scopeRows;
    if (effectiveStatus !== 'All Status' && effectiveStatus !== 'All') {
      if (effectiveStatus === 'Present') {
        res = scopeRows.filter(row => row.status === 'Present' || row.status === 'Late');
      } else {
        res = scopeRows.filter(row => row.status === effectiveStatus);
      }
    }

    if (sortCol && sortDir) {
      res = [...res].sort((a, b) => {
        let valA = a[sortCol] || '';
        let valB = b[sortCol] || '';
        if (sortCol === 'name' || sortCol === 'employee') {
          valA = a.name || ''; valB = b.name || '';
        } else if (sortCol === 'id' || sortCol === 'user') {
          valA = a.userId || ''; valB = b.userId || '';
        } else if (sortCol === 'time' || sortCol === 'punchin') {
          valA = a.punchIn || ''; valB = b.punchIn || '';
        }
        const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return res;
  }, [scopeRows, statusF, moduleFilters.attStatus, sortCol, sortDir]);


  // ── KPIs (computed from scopeRows: Daily Attendance %, Total Staff, Present, Late, Absent)
  const kpis = useMemo(() => {
    const present = scopeRows.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const onTime  = scopeRows.filter(r => r.status === 'Present').length;
    const late    = scopeRows.filter(r => r.status === 'Late').length;
    const absent  = scopeRows.filter(r => r.status === 'Absent').length;
    const rate    = scopeRows.length > 0 ? (Math.round((present / scopeRows.length) * 1000) / 10) : 0;
    const branches = new Set(scopeRows.map(r => r.branchCode || r.branch)).size;
    return { total: scopeRows.length, present, onTime, late, absent, rate, branches };
  }, [scopeRows]);

  // ── pagination
  useEffect(() => { setCurrentPage(1); }, [filteredRows, viewMode, branchSummary]);
  const totalPages = viewMode === 'branch'
    ? (Math.ceil(branchSummary.length / pageSize) || 1)
    : (Math.ceil(filteredRows.length / pageSize) || 1);

  const pageEmployeeRows = useMemo(() => {
    const s = (currentPage - 1) * pageSize;
    return filteredRows.slice(s, s + pageSize);
  }, [filteredRows, currentPage]);

  const pageBranchRows = useMemo(() => {
    const s = (currentPage - 1) * pageSize;
    return branchSummary.slice(s, s + pageSize);
  }, [branchSummary, currentPage]);

  // ── drilldown handler: Branch → Employee (ATT-01 specification)
  const handleDrilldownBranch = (branchName) => {
    setBranch(branchName);
    setViewMode('employee');
    setCurrentPage(1);
  };

  // ── export CSV (supports both ATT-01 Branch Summary and Employee Punch Log)
  const handleExport = useCallback(() => {
    if (viewMode === 'branch') {
      const header = 'Branch Location,Division / Region,Total Staff,Present,Late,Absent,Attendance %';
      const body = branchSummary.map(b =>
        `"${b.branch}","${b.region}",${b.total},${b.present},${b.late},${b.absent},"${b.pct}%"`
      ).join('\n');
      const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pubali-branch-attendance-att01-${dateRange.replace(/\s/g,'-').toLowerCase()}-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const header = 'User ID,Employee Name,Branch,Region,Department,Shift Time,Punch In,Terminal,Attendance,Status';
      const body = filteredRows.map(r =>
        `"${r.userId}","${r.name}","${r.branch}","${r.region}","${r.department}","${r.shift}","${r.punchIn}","${r.terminal}","${r.attendance}","${r.status}"`
      ).join('\n');
      const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pubali-attendance-punch-log-${dateRange.replace(/\s/g,'-').toLowerCase()}-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [viewMode, branchSummary, filteredRows, dateRange]);

  const handleReset = () => {
    setBranch('All Branches');
    setRegion('All Regions');
    setDateRange('Today');
    setSearch('');
    setDept('All Departments');
    setStatusF('All Status');
    setTerminal('All Devices');
  };

  // Date label for display
  const dateLabel = dateRange === 'Today'
    ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : dateRange;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── PAGE HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 55%, #14b8a6 100%)',
        borderRadius: 8,
        padding: '16px 22px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 4px 16px rgba(15,118,110,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 10,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22
          }}>⏱️</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em' }}>
              Time Attendance Management
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.88, marginTop: 2 }}>
              Live biometric punch monitoring · Pubali Bank PLC · 829 Nationwide Locations
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: 'rgba(255,255,255,0.12)', borderRadius: 6,
            padding: '6px 14px', fontSize: 12, fontWeight: 600
          }}>
            📅 {dateLabel}
          </div>
          <div style={{
            background: '#10b981', borderRadius: 6,
            padding: '6px 12px', fontSize: 11.5, fontWeight: 700
          }}>
            ● LIVE
          </div>
        </div>
      </div>

      {/* ── KPI SUMMARY CARDS (ATT-01 Daily Branch Attendance Dashboard KPIs) ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          icon="📊"
          label="Daily Attendance % (ATT-01)"
          value={`${kpis.rate}%`}
          sub={`${kpis.present.toLocaleString()} / ${kpis.total.toLocaleString()} Staff Present`}
          color="#0d9488"
          iconBg="#e6f4f1"
          active={viewMode === 'branch'}
          onClick={() => setViewMode(viewMode === 'branch' ? 'employee' : 'branch')}
          title="Tender Catalog ATT-01 KPI: Daily Attendance % — Click to toggle Branch Attendance Dashboard"
        />
        <KpiCard
          icon="👥"
          label="Total Staff"
          value={kpis.total.toLocaleString()}
          sub={`${kpis.branches} Branches Scope`}
          color="#2563eb"
          iconBg="#eff6ff"
          active={statusF === 'All Status' && viewMode === 'employee'}
          onClick={() => { setStatusF('All Status'); setViewMode('employee'); }}
          title="Click to view all employees in current scope"
        />
        <KpiCard
          icon="✅"
          label="Present Today"
          value={kpis.present.toLocaleString()}
          sub={`${kpis.rate}% on-duty (${kpis.onTime.toLocaleString()} On-Time)`}
          color="#16a34a"
          iconBg="#eaf7ed"
          active={statusF === 'Present'}
          onClick={() => { setStatusF(statusF === 'Present' ? 'All Status' : 'Present'); setViewMode('employee'); }}
          title={`Click to filter Present employees (${kpis.present.toLocaleString()} total: ${kpis.onTime.toLocaleString()} on-time + ${kpis.late.toLocaleString()} late)`}
        />
        <KpiCard
          icon="⚠️"
          label="Late Arrivals"
          value={kpis.late.toLocaleString()}
          sub="Included in Present (Grace Over)"
          color="#d97706"
          iconBg="#fdf3e7"
          active={statusF === 'Late'}
          onClick={() => { setStatusF(statusF === 'Late' ? 'All Status' : 'Late'); setViewMode('employee'); }}
          title={`Click to filter Late arrivals (${kpis.late.toLocaleString()} employees)`}
        />
        <KpiCard
          icon="❌"
          label="Absent / AWL"
          value={kpis.absent.toLocaleString()}
          sub="Unexcused / no punch"
          color="#dc2626"
          iconBg="#fdebee"
          active={statusF === 'Absent'}
          onClick={() => { setStatusF(statusF === 'Absent' ? 'All Status' : 'Absent'); setViewMode('employee'); }}
          title={`Click to filter Absent / AWL staff (${kpis.absent.toLocaleString()} employees)`}
        />
      </div>

      {/* ── COMPACT FILTER BAR ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 4px', minHeight: 52, flexWrap: 'wrap' }}>
          {/* Icon */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', color: '#0d9488', flexShrink: 0 }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
            </svg>
          </div>
          {/* Search */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <input style={{ height: 32, width: 220, padding: '0 28px 0 10px', fontSize: 12, border: 'none', outline: 'none', background: 'transparent', color: '#1e293b' }}
              placeholder="Search Employee ID or Name..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 4, top: 7, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 14 }}>✕</button>}
          </div>
          <div style={{ width:1, height:28, background:'#e5e7eb', flexShrink:0, margin:'0 2px' }} />
          {/* Branch */}
          <select value={branch} onChange={e => setBranch(e.target.value)} style={{ margin:'0 4px', height:32, padding:'0 8px', fontSize:12, fontWeight: branch === branchOptions[0] ? 400 : 600, border:'none', outline:'none', background:'transparent', color: branch === branchOptions[0] ? '#9ca3af' : '#1e293b', cursor:'pointer', minWidth:160, maxWidth:180, appearance:'auto' }}>
            {branchOptions.map(o => <option key={o} value={o}>{o.length > 28 ? o.slice(0,28)+'…' : o}</option>)}
          </select>
          <div style={{ width:1, height:28, background:'#e5e7eb', flexShrink:0, margin:'0 2px' }} />
          {/* Region */}
          <select value={region} onChange={e => setRegion(e.target.value)} style={{ margin:'0 4px', height:32, padding:'0 8px', fontSize:12, fontWeight: region === REGIONS[0] ? 400 : 600, border:'none', outline:'none', background:'transparent', color: region === REGIONS[0] ? '#9ca3af' : '#1e293b', cursor:'pointer', minWidth:140, appearance:'auto' }}>
            {REGIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <div style={{ width:1, height:28, background:'#e5e7eb', flexShrink:0, margin:'0 2px' }} />
          {/* Dept */}
          <select value={dept} onChange={e => setDept(e.target.value)} style={{ margin:'0 4px', height:32, padding:'0 8px', fontSize:12, fontWeight: dept === DEPARTMENTS[0] ? 400 : 600, border:'none', outline:'none', background:'transparent', color: dept === DEPARTMENTS[0] ? '#9ca3af' : '#1e293b', cursor:'pointer', minWidth:150, appearance:'auto' }}>
            {DEPARTMENTS.map(o => <option key={o}>{o}</option>)}
          </select>
          <div style={{ width:1, height:28, background:'#e5e7eb', flexShrink:0, margin:'0 2px' }} />
          {/* Terminal */}
          <select value={terminal} onChange={e => setTerminal(e.target.value)} style={{ margin:'0 4px', height:32, padding:'0 8px', fontSize:12, fontWeight: terminal === TERMINALS[0] ? 400 : 600, border:'none', outline:'none', background:'transparent', color: terminal === TERMINALS[0] ? '#9ca3af' : '#1e293b', cursor:'pointer', minWidth:140, appearance:'auto' }}>
            {TERMINALS.map(o => <option key={o}>{o}</option>)}
          </select>
          <div style={{ width:1, height:28, background:'#e5e7eb', flexShrink:0, margin:'0 2px' }} />
          {/* Status chips */}
          <div style={{ display:'flex', gap:4, alignItems:'center', margin:'0 6px', flexShrink:0 }}>
            {STATUS_OPTIONS.map(s => {
              const active = statusF === s;
              const clrs = { 'All Status':'#0d9488', Present:'#16a34a', Late:'#d97706', Absent:'#dc2626', Leave:'#0369a1', 'Early Departure':'#7c3aed' };
              const c = clrs[s] || '#6b7280';
              return <button key={s} onClick={() => setStatusF(s)} style={{ padding:'3px 10px', fontSize:11, borderRadius:20, cursor:'pointer', fontWeight:active?700:400, border:active?`1.5px solid ${c}`:'1.5px solid transparent', background:active?c+'15':'transparent', color:active?c:'#9ca3af', transition:'all 0.12s', whiteSpace:'nowrap' }}>{s}</button>;
            })}
          </div>
          <div style={{ width:1, height:28, background:'#e5e7eb', flexShrink:0, margin:'0 2px' }} />
          {/* Date Range */}
          <div style={{ display:'flex', gap:2, alignItems:'center', margin:'0 6px', flexShrink:0 }}>
            {DATE_RANGES.slice(0,4).map(d => (
              <button key={d} onClick={() => setDateRange(d)} style={{ padding:'3px 9px', fontSize:11, borderRadius:20, cursor:'pointer', fontWeight:dateRange===d?700:400, border:dateRange===d?'1.5px solid #0d9488':'1.5px solid transparent', background:dateRange===d?'#0d948815':'transparent', color:dateRange===d?'#0d9488':'#9ca3af', transition:'all 0.12s', whiteSpace:'nowrap' }}>{d}</button>
            ))}
          </div>
          {/* Spacer */}
          <div style={{ flex:1 }} />
          {/* Count */}
          <span style={{ fontSize:11, fontWeight:700, color:'#6b7280', padding:'0 10px', whiteSpace:'nowrap', flexShrink:0 }}>
            {filteredRows.length.toLocaleString()} records
          </span>
          <div style={{ width:1, height:28, background:'#e5e7eb', flexShrink:0 }} />
          {/* Reset */}
          <button onClick={handleReset} style={{ margin:'0 4px', padding:'5px 12px', fontSize:11.5, fontWeight:600, background:'none', border:'none', color:'#6b7280', cursor:'pointer', borderRadius:6, transition:'all 0.15s', flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.background='#f1f5f9';e.currentTarget.style.color='#374151';}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='#6b7280';}}>
            ↺ Reset
          </button>
          {/* Export */}
          <button onClick={handleExport} style={{ margin:'6px 8px 6px 2px', padding:'6px 14px', fontSize:11.5, fontWeight:700, background:'linear-gradient(135deg,#0f766e,#0d9488)', border:'none', color:'#fff', cursor:'pointer', borderRadius:6, display:'flex', alignItems:'center', gap:5, boxShadow:'0 1px 4px rgba(0,0,0,0.15)', flexShrink:0 }}>
            <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
            Export CSV
          </button>
        </div>
        {/* Panel header */}
        <div style={{
          background: 'linear-gradient(90deg, #f0fdfa 0%, #f8fafc 100%)',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style={{ color: '#0d9488' }}>
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
          </svg>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>Advanced Attendance Filters</span>
          <span style={{ fontSize: 11, color: '#64748b', marginLeft: 4 }}>
            — {filteredRows.length.toLocaleString()} records matching current filters
          </span>
        </div>

        {/* Filter rows */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Row 1 */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Branch search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Branch / Location
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  className="bs-select"
                  style={{ width: 210, fontSize: 12, height: 32, paddingLeft: 28 }}
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                >
                  {branchOptions.map(o => <option key={o} value={o}>{o.length > 30 ? o.slice(0,30)+'…' : o}</option>)}
                </select>
                <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"
                  style={{ position: 'absolute', left: 8, top: 10, color: '#0d9488', pointerEvents: 'none' }}>
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>

            {/* Region */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Region
              </label>
              <FilterSelect value={region} onChange={setRegion} options={REGIONS} width={168} />
            </div>

            {/* Date Range */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Date Range
              </label>
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 6, padding: 2, gap: 2 }}>
                {DATE_RANGES.map(d => (
                  <button
                    key={d}
                    onClick={() => setDateRange(d)}
                    style={{
                      padding: '4px 10px', fontSize: 11, borderRadius: 4, border: 'none', cursor: 'pointer',
                      fontWeight: dateRange === d ? 700 : 500,
                      background: dateRange === d ? '#0d9488' : 'transparent',
                      color: dateRange === d ? '#fff' : '#475569',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap'
                    }}
                  >{d}</button>
                ))}
              </div>
            </div>

            {/* Employee Search */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 200px' }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Employee Search
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="bs-input"
                  style={{ width: '100%', height: 32, fontSize: 12, paddingLeft: 30 }}
                  placeholder="Search by Employee ID or Name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"
                  style={{ position: 'absolute', left: 9, top: 9.5, color: '#9ca3af', pointerEvents: 'none' }}>
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{
                      position: 'absolute', right: 8, top: 8,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9ca3af', fontSize: 14, lineHeight: 1
                    }}
                  >✕</button>
                )}
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* Department */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Department
              </label>
              <FilterSelect value={dept} onChange={setDept} options={DEPARTMENTS} width={178} />
            </div>

            {/* Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Attendance Status
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STATUS_OPTIONS.map(s => {
                  const active = statusF === s;
                  const colors = {
                    'All Status':       { a: '#0d9488', b: '#f0fdfa' },
                    'Present':          { a: '#16a34a', b: '#dcfce7' },
                    'Late':             { a: '#d97706', b: '#fef9c3' },
                    'Absent':           { a: '#dc2626', b: '#fee2e2' },
                    'Leave':            { a: '#0369a1', b: '#e0f2fe' },
                    'Early Departure':  { a: '#7c3aed', b: '#f5f3ff' },
                  };
                  const c = colors[s] || { a: '#6b7280', b: '#f3f4f6' };
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusF(s)}
                      style={{
                        padding: '4px 10px', fontSize: 11, borderRadius: 12, cursor: 'pointer',
                        fontWeight: active ? 700 : 500,
                        border: active ? `1.5px solid ${c.a}` : '1.5px solid #e5e7eb',
                        background: active ? c.b : '#fff',
                        color: active ? c.a : '#6b7280',
                        transition: 'all 0.15s'
                      }}
                    >{s}</button>
                  );
                })}
              </div>
            </div>

            {/* Punch Terminal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Punch Terminal
              </label>
              <FilterSelect value={terminal} onChange={setTerminal} options={TERMINALS} width={178} />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto', paddingBottom: 0 }}>
              <button
                className="bs-btn bs-btn-outline bs-btn-sm"
                onClick={handleReset}
                style={{ height: 34, fontSize: 12, gap: 5, display: 'flex', alignItems: 'center' }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                </svg>
                Reset
              </button>
              <button
                className="bs-btn bs-btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #0f766e, #0d9488)',
                  color: '#fff', border: 'none', height: 34,
                  fontSize: 12, fontWeight: 700, gap: 6,
                  display: 'flex', alignItems: 'center',
                  boxShadow: '0 2px 6px rgba(13,148,136,0.35)',
                  padding: '0 16px'
                }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
                Search ({filteredRows.length.toLocaleString()})
              </button>
              <button
                onClick={handleExport}
                style={{
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  color: '#fff', border: 'none', height: 34,
                  fontSize: 12, fontWeight: 700, gap: 6,
                  display: 'flex', alignItems: 'center',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.35)',
                  padding: '0 16px', borderRadius: 6, cursor: 'pointer'
                }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {(branch !== 'All Branches' || region !== 'All Regions' || dept !== 'All Departments' ||
          statusF !== 'All Status' || terminal !== 'All Devices' || search || dateRange !== 'Today') && (
          <div style={{
            padding: '8px 16px 10px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center'
          }}>
            <span style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Active:</span>
            {[
              { label: branch, clear: () => setBranch('All Branches'), cond: branch !== 'All Branches' },
              { label: region, clear: () => setRegion('All Regions'), cond: region !== 'All Regions' },
              { label: dateRange, clear: () => setDateRange('Today'), cond: dateRange !== 'Today' },
              { label: `"${search}"`, clear: () => setSearch(''), cond: !!search },
              { label: dept, clear: () => setDept('All Departments'), cond: dept !== 'All Departments' },
              { label: statusF, clear: () => setStatusF('All Status'), cond: statusF !== 'All Status' },
              { label: terminal, clear: () => setTerminal('All Devices'), cond: terminal !== 'All Devices' },
            ].filter(c => c.cond).map((chip, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: '#e0f2fe', color: '#0369a1',
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10
              }}>
                {chip.label}
                <button onClick={chip.clear} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#0369a1', fontSize: 13, lineHeight: 1, padding: 0
                }}>✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── ATTENDANCE TABLE & VIEW TABS ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '10px 16px',
          background: '#f8fafc',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10
        }}>
          {/* View Mode Switcher (Tender Catalog ATT-01 Specification) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => { setViewMode('branch'); setCurrentPage(1); }}
              style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 700, borderRadius: 6, cursor: 'pointer',
                border: viewMode === 'branch' ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                background: viewMode === 'branch' ? '#0d9488' : '#ffffff',
                color: viewMode === 'branch' ? '#ffffff' : '#475569',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s'
              }}
            >
              🏢 Daily Branch Attendance Dashboard (ATT-01)
            </button>
            <button
              onClick={() => { setViewMode('employee'); setCurrentPage(1); }}
              style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 700, borderRadius: 6, cursor: 'pointer',
                border: viewMode === 'employee' ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                background: viewMode === 'employee' ? '#0d9488' : '#ffffff',
                color: viewMode === 'employee' ? '#ffffff' : '#475569',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s'
              }}
            >
              📋 Employee Attendance Punch Log
            </button>
            <span style={{
              background: '#ccfbf1', color: '#065f46',
              fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 4
            }}>
              {viewMode === 'branch' ? `${branchSummary.length.toLocaleString()} Branches` : `${filteredRows.length.toLocaleString()} Records`}
            </span>
          </div>

          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            Showing {viewMode === 'branch'
              ? (branchSummary.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0)
              : (filteredRows.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0)} –{' '}
            {viewMode === 'branch'
              ? Math.min(currentPage * pageSize, branchSummary.length)
              : Math.min(currentPage * pageSize, filteredRows.length)} of{' '}
            {viewMode === 'branch' ? branchSummary.length.toLocaleString() : filteredRows.length.toLocaleString()}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {viewMode === 'branch' ? (
            /* ── ATT-01 DAILY BRANCH ATTENDANCE TABLE ── */
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f0fdfa', borderBottom: '2px solid #99f6e4' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>#</th>
                  {[
                    { label: 'Branch Location', key: 'branch' },
                    { label: 'Division / Region', key: 'region' },
                    { label: 'Total Staff', key: 'total' },
                    { label: 'Present', key: 'present' },
                    { label: 'Late', key: 'late' },
                    { label: 'Absent', key: 'absent' },
                    { label: 'Attendance %', key: 'pct' }
                  ].map(col => (
                    <th key={col.key} style={{
                      padding: '9px 12px', textAlign: col.key === 'pct' ? 'center' : 'left',
                      fontSize: 10.5, fontWeight: 800, color: '#0f766e',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      whiteSpace: 'nowrap'
                    }}>
                      <span>{col.label}</span>
                      <TableColumnFilter
                        columnKey={col.key}
                        title={col.label}
                        currentSort={{ columnKey: sortCol, direction: sortDir }}
                        onSortChange={(dir) => handleSortChange(col.key, dir)}
                      />
                    </th>
                  ))}
                  <th style={{ padding: '9px 12px', textAlign: 'center', fontSize: 10.5, fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pageBranchRows.map((b, i) => {
                  const rowNum = (currentPage - 1) * pageSize + i + 1;
                  const isAlternate = i % 2 === 0;
                  const pctColor = b.pct >= 90 ? '#16a34a' : b.pct >= 75 ? '#0d9488' : b.pct >= 60 ? '#d97706' : '#dc2626';
                  return (
                    <tr
                      key={b.branch + i}
                      style={{
                        background: isAlternate ? '#ffffff' : '#fafbfc',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.1s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0fdfa'}
                      onMouseLeave={e => e.currentTarget.style.background = isAlternate ? '#ffffff' : '#fafbfc'}
                    >
                      <td style={{ padding: '8px 12px', color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>
                        {rowNum}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: '#0d9488', fontSize: 12 }}>📍</span>
                          {b.branch}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#64748b', fontSize: 11 }}>
                        <span style={{
                          background: '#f1f5f9', color: '#475569',
                          padding: '2px 8px', borderRadius: 4, fontWeight: 600
                        }}>
                          {b.region}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#1e293b' }}>
                        {b.total} Staff
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#16a34a' }}>
                        {b.present}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#d97706' }}>
                        {b.late}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: b.absent > 0 ? '#dc2626' : '#94a3b8' }}>
                        {b.absent}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: 120 }}>
                          <div style={{ flex: 1, background: '#e2e8f0', borderRadius: 4, height: 6 }}>
                            <div style={{ width: `${b.pct}%`, background: pctColor, borderRadius: 4, height: 6 }} />
                          </div>
                          <span style={{ fontSize: 11.5, fontWeight: 800, color: pctColor, minWidth: 36, textAlign: 'right' }}>
                            {b.pct}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDrilldownBranch(b.branch)}
                          style={{
                            padding: '4px 10px', fontSize: 11, fontWeight: 700,
                            borderRadius: 4, border: '1px solid #0d9488',
                            background: '#f0fdfa', color: '#0d9488',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                          }}
                          title="Tender Catalog ATT-01 Drilldown: Branch → Employee Punch Log"
                        >
                          Drilldown →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* ── EMPLOYEE ATTENDANCE PUNCH LOG TABLE ── */
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f0fdfa', borderBottom: '2px solid #99f6e4' }}>
                  <th style={{ padding: '9px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>#</th>
                  {[
                    { label: 'User ID', key: 'userId' },
                    { label: 'Employee Name', key: 'name' },
                    { label: 'Branch / Location', key: 'branch' },
                    { label: 'Department', key: 'department' },
                    { label: 'Shift Time', key: 'shift' },
                    { label: 'Punch In Time', key: 'punchIn' },
                    { label: 'Punch Terminal', key: 'terminal' },
                    { label: 'Attendance', key: 'attendance' },
                    { label: 'Status', key: 'status' }
                  ].map(col => (
                    <th key={col.key} style={{
                      padding: '9px 12px', textAlign: 'left',
                      fontSize: 10.5, fontWeight: 800, color: '#0f766e',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      whiteSpace: 'nowrap'
                    }}>
                      <span>{col.label}</span>
                      <TableColumnFilter
                        columnKey={col.key}
                        title={col.label}
                        currentSort={{ columnKey: sortCol, direction: sortDir }}
                        onSortChange={(dir) => handleSortChange(col.key, dir)}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageEmployeeRows.map((row, i) => {
                  const rowNum = (currentPage - 1) * pageSize + i + 1;
                  const isAlternate = i % 2 === 0;
                  return (
                    <tr
                      key={row.userId + i}
                      style={{
                        background: isAlternate ? '#ffffff' : '#fafbfc',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.1s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0fdfa'}
                      onMouseLeave={e => e.currentTarget.style.background = isAlternate ? '#ffffff' : '#fafbfc'}
                    >
                      <td style={{ padding: '8px 12px', color: '#cbd5e1', fontSize: 11, fontWeight: 600 }}>
                        {rowNum}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          fontFamily: 'monospace', fontSize: 11.5,
                          fontWeight: 700, color: '#0d9488'
                        }}>{row.userId}</span>
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1e293b' }}>
                        {row.name}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#475569', fontSize: 11.5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ color: '#0d9488', fontSize: 10 }}>📍</span>
                          {row.branch.length > 28 ? row.branch.slice(0, 28) + '…' : row.branch}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#64748b', fontSize: 11 }}>
                        {row.department}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#64748b', fontSize: 11, fontWeight: 600 }}>
                        {row.shift}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        {row.punchIn === '—' ? (
                          <span style={{ color: '#dc2626', fontWeight: 600, fontSize: 11.5 }}>—</span>
                        ) : (
                          <span style={{
                            fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                            color: row.status === 'Late' ? '#d97706' : '#059669'
                          }}>
                            {row.punchIn}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          background: '#f0f9ff', color: '#0369a1',
                          fontSize: 10.5, fontWeight: 600,
                          padding: '2px 7px', borderRadius: 4,
                          border: '1px solid #bae6fd'
                        }}>
                          📟 {row.terminal}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <StatusPill status={row.attendance} />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <StatusPill status={row.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {(viewMode === 'branch' ? branchSummary.length === 0 : filteredRows.length === 0) && (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>No attendance records found</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              Adjust your filters or reset to view all records
            </div>
            <button
              className="bs-btn bs-btn-outline bs-btn-sm"
              onClick={handleReset}
              style={{ marginTop: 14 }}
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* ── PAGINATION ── */}
        {(viewMode === 'branch' ? branchSummary.length : filteredRows.length) > pageSize && (
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid #e5e7eb',
            background: '#f8fafc',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontSize: 11, color: '#6b7280' }}>
              Page {currentPage} of {totalPages} · {viewMode === 'branch' ? branchSummary.length.toLocaleString() + ' branches' : filteredRows.length.toLocaleString() + ' employees'}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { label: '«', action: () => setCurrentPage(1), disabled: currentPage === 1 },
                { label: '‹', action: () => setCurrentPage(p => Math.max(1, p - 1)), disabled: currentPage === 1 },
                { label: '›', action: () => setCurrentPage(p => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages },
                { label: '»', action: () => setCurrentPage(totalPages), disabled: currentPage === totalPages },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} disabled={btn.disabled} style={{
                  width: 30, height: 30, borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: btn.disabled ? '#f8fafc' : '#fff',
                  color: btn.disabled ? '#d1d5db' : '#374151',
                  cursor: btn.disabled ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s'
                }}>{btn.label}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
