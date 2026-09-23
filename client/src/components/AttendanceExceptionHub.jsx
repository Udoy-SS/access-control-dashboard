/**
 * AttendanceExceptionHub.jsx — Attendance Exception & Absent-Without-Leave Reconciliation Hub
 * Pubali Bank PLC · BioStar X Time & Attendance Intelligence
 * Full enterprise filtering suite for Early Departure, Late Arrival & Absence reconciliation
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ATTENDANCE_EXCEPTIONS_DATA, getAttendanceExceptionsSummary } from '../data/securityIntelligenceData';
import { useBankFilters } from './filters/FilterContext';

const EXCEPTION_TYPES = ['Early Departure', 'Late Arrival', 'Missing Punch', 'Absent No Leave', 'Duplicate Punch'];
const DIVISIONS = ['All', 'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];
const SEVERITIES = ['All', 'High', 'Medium', 'Low'];

const TYPE_COLOR = {
  'Early Departure': { color: '#ea580c', bg: '#ffedd5', icon: '🏃' },
  'Late Arrival':    { color: '#d97706', bg: '#fef3c7', icon: '🕐' },
  'Missing Punch':   { color: '#2563eb', bg: '#dbeafe', icon: '👆' },
  'Absent No Leave': { color: '#dc2626', bg: '#fee2e2', icon: '🚫' },
  'Duplicate Punch': { color: '#6b7280', bg: '#f3f4f6', icon: '⚡' },
};

const SEV_COLOR = { High: '#dc2626', Medium: '#d97706', Low: '#6b7280' };
const SEV_BG    = { High: '#fee2e2', Medium: '#fef3c7', Low: '#f3f4f6' };

function KpiCard({ label, value, color, bg, icon, active, onClick }) {
  return (
    <div onClick={onClick} id={`exception-tab-${label.replace(/\s+/g,'-').toLowerCase()}`} style={{
      background: active ? color : bg, border: `1.5px solid ${color}44`,
      borderRadius: 10, padding: '12px 16px', flex: 1, minWidth: 120,
      boxShadow: active ? `0 4px 12px ${color}44` : `0 2px 8px ${color}11`,
      cursor: 'pointer', transition: 'all 0.2s', transform: active ? 'translateY(-2px)' : 'none'
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: active ? 'rgba(255,255,255,0.85)' : color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{icon} {label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: active ? '#fff' : color, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

export default function AttendanceExceptionHub({ initialTab = 'Early Departure' }) {
  const {
    region: globalRegion,
    branch: globalBranch,
    searchQuery: globalSearch,
    moduleFilters,
    setModuleFilter
  } = useBankFilters();

  const [allExceptions, setAllExceptions] = useState(ATTENDANCE_EXCEPTIONS_DATA);
  const [summary, setSummary]             = useState(getAttendanceExceptionsSummary(ATTENDANCE_EXCEPTIONS_DATA));
  const [loading, setLoading]             = useState(false);
  const [activeTab, setActiveTab]         = useState(initialTab);

  // Filter States
  const [search, setSearch]               = useState('');
  const [filterDiv, setFilterDiv]         = useState('All');
  const [filterBranch, setFilterBranch]   = useState('All');
  const [filterDept, setFilterDept]       = useState('All');
  const [filterSev, setFilterSev]         = useState('All');
  const [filterDeviation, setFilterDeviation] = useState('All'); // 'All' | 'gt60' | '30to60' | 'lt30'
  const [filterShift, setFilterShift]     = useState('All');
  const [filterEscalated, setFilterEscalated] = useState('All'); // 'All' | 'escalated' | 'regular'

  // Pagination & Sorting
  const [page, setPage]                   = useState(1);
  const [pageSize, setPageSize]           = useState(15);
  const [sortCol, setSortCol]             = useState('name');
  const [sortDir, setSortDir]             = useState('asc');

  // Reconciliation modal state
  const [reconcileItem, setReconcileItem] = useState(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Sync with GlobalFilterBar
  useEffect(() => {
    if (globalRegion && globalRegion !== 'All Regions') {
      const match = DIVISIONS.find(d => d.toLowerCase() === globalRegion.toLowerCase());
      if (match) setFilterDiv(match);
    }
  }, [globalRegion]);

  useEffect(() => {
    if (globalBranch && globalBranch !== 'All Branches') {
      setFilterBranch(globalBranch);
    }
  }, [globalBranch]);

  useEffect(() => {
    if (globalSearch && globalSearch.trim()) {
      setSearch(globalSearch.trim());
    }
  }, [globalSearch]);

  // Sync with PageLevelFilterPanel
  useEffect(() => {
    if (moduleFilters?.department && moduleFilters.department !== 'All') {
      setFilterDept(moduleFilters.department);
    }
  }, [moduleFilters?.department]);

  useEffect(() => {
    const dev = moduleFilters?.graceThreshold || moduleFilters?.attDeviation;
    if (dev && dev !== 'All') {
      if (dev === '60m') setFilterDeviation('gt60');
      else if (dev === '30m') setFilterDeviation('30to60');
      else if (dev === '15m') setFilterDeviation('lt30');
    }
  }, [moduleFilters?.graceThreshold, moduleFilters?.attDeviation]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/attendance-exceptions');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setAllExceptions(json.data);
          setSummary(json.summary || getAttendanceExceptionsSummary(json.data));
          setLoading(false);
          return;
        }
      }
    } catch (_) {}
    setAllExceptions(ATTENDANCE_EXCEPTIONS_DATA);
    setSummary(getAttendanceExceptionsSummary(ATTENDANCE_EXCEPTIONS_DATA));
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Extract Dynamic Options ───────────────────────────────
  const departmentOptions = useMemo(() => {
    const s = new Set();
    allExceptions.forEach(e => { if (e.department) s.add(e.department); });
    return Array.from(s).sort();
  }, [allExceptions]);

  const branchOptions = useMemo(() => {
    const s = new Set();
    allExceptions.forEach(e => { if (e.branch) s.add(e.branch); });
    return Array.from(s).sort();
  }, [allExceptions]);

  const shiftOptions = useMemo(() => {
    const s = new Set();
    allExceptions.forEach(e => { if (e.shift) s.add(e.shift); });
    return Array.from(s).sort();
  }, [allExceptions]);

  // ── Check if Any Filter is Active ─────────────────────────
  const isFiltered = Boolean(
    search.trim() ||
    filterDiv !== 'All' ||
    filterBranch !== 'All' ||
    filterDept !== 'All' ||
    filterSev !== 'All' ||
    filterDeviation !== 'All' ||
    filterShift !== 'All' ||
    filterEscalated !== 'All'
  );

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setFilterDiv('All');
    setFilterBranch('All');
    setFilterDept('All');
    setFilterSev('All');
    setFilterDeviation('All');
    setFilterShift('All');
    setFilterEscalated('All');
    setPage(1);
    if (setModuleFilter) {
      setModuleFilter('department', 'All');
      setModuleFilter('attDeviation', 'All');
    }
  }, [setModuleFilter]);

  // ── Filtered Records Pipeline ─────────────────────────────
  const filtered = useMemo(() => {
    let list = allExceptions.filter(e => e.exceptionType === activeTab);

    // 1. Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.id.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.branch.toLowerCase().includes(q) ||
        (e.department && e.department.toLowerCase().includes(q))
      );
    }

    // 2. Division
    if (filterDiv !== 'All') {
      list = list.filter(e => e.division === filterDiv);
    }

    // 3. Branch
    if (filterBranch !== 'All') {
      list = list.filter(e => e.branch === filterBranch);
    }

    // 4. Department
    if (filterDept !== 'All') {
      list = list.filter(e => e.department && e.department.toLowerCase().includes(filterDept.toLowerCase()));
    }

    // 5. Severity
    if (filterSev !== 'All') {
      list = list.filter(e => e.severity === filterSev);
    }

    // 6. Shift
    if (filterShift !== 'All') {
      list = list.filter(e => e.shift === filterShift);
    }

    // 7. Deviation / Duration
    if (filterDeviation !== 'All') {
      list = list.filter(e => {
        const match = e.detail.match(/(\d+)\s*min/);
        if (!match) return true;
        const mins = parseInt(match[1], 10);
        if (filterDeviation === 'gt60') return mins >= 60;
        if (filterDeviation === '30to60') return mins >= 30 && mins < 60;
        if (filterDeviation === 'lt30') return mins < 30;
        return true;
      });
    }

    // 8. Escalated to HR
    if (filterEscalated !== 'All') {
      if (filterEscalated === 'escalated') list = list.filter(e => e.escalated);
      else if (filterEscalated === 'regular') list = list.filter(e => !e.escalated);
    }

    // 9. Sort
    return [...list].sort((a, b) => {
      let va = a[sortCol];
      let vb = b[sortCol];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allExceptions, activeTab, search, filterDiv, filterBranch, filterDept, filterSev, filterShift, filterDeviation, filterEscalated, sortCol, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search, filterDiv, filterBranch, filterDept, filterSev, filterShift, filterDeviation, filterEscalated]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows   = filtered.slice((page - 1) * pageSize, page * pageSize);
  const tc         = TYPE_COLOR[activeTab] || { color: '#6b7280', bg: '#f3f4f6', icon: '📋' };

  const scopedExceptions = useMemo(() => {
    return allExceptions.filter(e => {
      if (filterDiv !== 'All' && e.division !== filterDiv) return false;
      if (filterBranch !== 'All' && e.branch !== filterBranch) return false;
      if (filterDept !== 'All' && !(e.department && e.department.toLowerCase().includes(filterDept.toLowerCase()))) return false;
      return true;
    });
  }, [allExceptions, filterDiv, filterBranch, filterDept]);

  const tabCounts = useMemo(() => ({
    'Early Departure': scopedExceptions.filter(e => e.exceptionType === 'Early Departure').length,
    'Late Arrival': scopedExceptions.filter(e => e.exceptionType === 'Late Arrival').length,
    'Missing Punch': scopedExceptions.filter(e => e.exceptionType === 'Missing Punch').length,
    'Absent No Leave': scopedExceptions.filter(e => e.exceptionType === 'Absent No Leave').length,
    'Duplicate Punch': scopedExceptions.filter(e => e.exceptionType === 'Duplicate Punch').length,
  }), [scopedExceptions]);

  // Severity counts for quick pills
  const sevCounts = useMemo(() => {
    const tabEvents = scopedExceptions.filter(e => e.exceptionType === activeTab);
    let high = 0;
    let med = 0;
    let low = 0;
    tabEvents.forEach(e => {
      if (e.severity === 'High') high++;
      else if (e.severity === 'Medium') med++;
      else if (e.severity === 'Low') low++;
    });
    return { total: tabEvents.length, high, med, low };
  }, [scopedExceptions, activeTab]);

  const exportCsv = () => {
    const header = ['ID','Name','Department','Branch','Division','Date','Shift','Exception Type','Detail','Severity','Escalated'];
    const content = [header, ...filtered.map(r => [r.id, r.name, r.department, r.branch, r.division, r.date, r.shift, r.exceptionType, r.detail, r.severity, r.escalated ? 'Yes' : 'No'])].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pubali_attendance_${activeTab.replace(/\s+/g,'_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── Top Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #ea580c 100%)',
        borderRadius: 10,
        padding: '16px 22px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 16px rgba(234,88,12,0.25)',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 30 }}>🏃</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Employee Early Departure & Attendance Exception Hub</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
              Pubali Bank PLC · Early Departure, Shift Deficits, Biometric Punch Reconciliation · September 2026
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 14px', borderRadius: 16, fontSize: 12, fontWeight: 700 }}>
            📋 {allExceptions.length || 240} Exceptions Reconciled (ATT-04)
          </div>
          <div style={{ background: '#dc2626', padding: '5px 14px', borderRadius: 16, fontSize: 12, fontWeight: 700 }}>
            🚫 {summary.escalated} Escalated to HR
          </div>
        </div>
      </div>

      {/* ── Exception Type Tabs / KPIs ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {EXCEPTION_TYPES.map(t => {
          const tc2 = TYPE_COLOR[t];
          return (
            <KpiCard
              key={t}
              label={t}
              value={tabCounts[t] || 0}
              color={tc2.color}
              bg={tc2.bg}
              icon={tc2.icon}
              active={activeTab === t}
              onClick={() => setActiveTab(t)}
            />
          );
        })}
      </div>

      {/* ── Main Data Card & Filter Toolbar ── */}
      <div className="bs-card">
        <div className="bs-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="bs-card-header-title">{activeTab} Discrepancy Reconciliation</span>
            <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>
              Filter by department, branch, deviation duration, and HR escalation
            </span>
          </div>
        </div>

        {/* ── Comprehensive Filter Toolbar ── */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #eef0f3',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
          background: '#fcfcfd'
        }}>
          {/* 1. Quick Severity Tabs / Pills */}
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 2, borderRadius: 6 }}>
            <button
              type="button"
              onClick={() => setFilterSev('All')}
              style={{
                border: 'none',
                background: filterSev === 'All' ? '#ffffff' : 'transparent',
                color: filterSev === 'All' ? '#0f172a' : '#64748b',
                fontWeight: filterSev === 'All' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterSev === 'All' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              All ({sevCounts.total})
            </button>
            <button
              type="button"
              onClick={() => setFilterSev('High')}
              style={{
                border: 'none',
                background: filterSev === 'High' ? '#ef4444' : 'transparent',
                color: filterSev === 'High' ? '#ffffff' : '#dc2626',
                fontWeight: filterSev === 'High' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterSev === 'High' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none'
              }}
            >
              🔴 High ({sevCounts.high})
            </button>
            <button
              type="button"
              onClick={() => setFilterSev('Medium')}
              style={{
                border: 'none',
                background: filterSev === 'Medium' ? '#f59e0b' : 'transparent',
                color: filterSev === 'Medium' ? '#ffffff' : '#d97706',
                fontWeight: filterSev === 'Medium' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterSev === 'Medium' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none'
              }}
            >
              🟠 Med ({sevCounts.med})
            </button>
            <button
              type="button"
              onClick={() => setFilterSev('Low')}
              style={{
                border: 'none',
                background: filterSev === 'Low' ? '#64748b' : 'transparent',
                color: filterSev === 'Low' ? '#ffffff' : '#475569',
                fontWeight: filterSev === 'Low' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterSev === 'Low' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none'
              }}
            >
              ⚪ Low ({sevCounts.low})
            </button>
          </div>

          {/* 2. Search Input */}
          <div style={{ position: 'relative', width: 210, minWidth: 160 }}>
            <input
              className="bs-input"
              style={{ width: '100%', paddingLeft: 28, height: 32, fontSize: 12 }}
              placeholder="Search officer, ID, branch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" style={{ position: 'absolute', left: 9, top: 9, color: '#9ca3af' }}>
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </div>

          {/* 3. Department Filter Dropdown */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 150,
              cursor: 'pointer',
              borderColor: filterDept !== 'All' ? '#0d9488' : '#e2e8f0',
              background: filterDept !== 'All' ? '#f0fdf4' : '#ffffff',
              fontWeight: filterDept !== 'All' ? 600 : 400
            }}
            value={filterDept}
            onChange={e => {
              setFilterDept(e.target.value);
              if (setModuleFilter) setModuleFilter('department', e.target.value);
            }}
            aria-label="Filter by Department"
          >
            <option value="All">All Departments</option>
            {departmentOptions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* 4. Branch Location Dropdown */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 150,
              cursor: 'pointer',
              borderColor: filterBranch !== 'All' ? '#0d9488' : '#e2e8f0',
              background: filterBranch !== 'All' ? '#f0fdf4' : '#ffffff',
              fontWeight: filterBranch !== 'All' ? 600 : 400
            }}
            value={filterBranch}
            onChange={e => setFilterBranch(e.target.value)}
            aria-label="Filter by Branch"
          >
            <option value="All">All Branches ({branchOptions.length})</option>
            {branchOptions.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* 5. Division Dropdown */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 130,
              cursor: 'pointer',
              borderColor: filterDiv !== 'All' ? '#0d9488' : '#e2e8f0',
              background: filterDiv !== 'All' ? '#f0fdf4' : '#ffffff',
              fontWeight: filterDiv !== 'All' ? 600 : 400
            }}
            value={filterDiv}
            onChange={e => setFilterDiv(e.target.value)}
            aria-label="Filter by Division"
          >
            {DIVISIONS.map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All Divisions' : `${d} Division`}</option>
            ))}
          </select>

          {/* 6. Deviation Duration Dropdown */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 145,
              cursor: 'pointer',
              borderColor: filterDeviation !== 'All' ? '#0d9488' : '#e2e8f0',
              background: filterDeviation !== 'All' ? '#f0fdf4' : '#ffffff',
              fontWeight: filterDeviation !== 'All' ? 600 : 400
            }}
            value={filterDeviation}
            onChange={e => setFilterDeviation(e.target.value)}
            aria-label="Filter by Deviation Duration"
          >
            <option value="All">All Deviations</option>
            <option value="gt60">&gt; 60 Minutes (Penalty)</option>
            <option value="30to60">30 – 60 Minutes</option>
            <option value="lt30">&lt; 30 Minutes</option>
          </select>

          {/* 7. Shift Type Dropdown */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 140,
              cursor: 'pointer',
              borderColor: filterShift !== 'All' ? '#0d9488' : '#e2e8f0',
              background: filterShift !== 'All' ? '#f0fdf4' : '#ffffff',
              fontWeight: filterShift !== 'All' ? 600 : 400
            }}
            value={filterShift}
            onChange={e => setFilterShift(e.target.value)}
            aria-label="Filter by Shift"
          >
            <option value="All">All Shifts</option>
            {shiftOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* 8. Escalation Toggle */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 135,
              cursor: 'pointer',
              borderColor: filterEscalated !== 'All' ? '#dc2626' : '#e2e8f0',
              background: filterEscalated !== 'All' ? '#fef2f2' : '#ffffff',
              fontWeight: filterEscalated !== 'All' ? 600 : 400
            }}
            value={filterEscalated}
            onChange={e => setFilterEscalated(e.target.value)}
            aria-label="Filter by Escalation Status"
          >
            <option value="All">All HR Status</option>
            <option value="escalated">🚨 Escalated to HR</option>
            <option value="regular">Regular Exception</option>
          </select>

          {/* 9. Reset Button */}
          {isFiltered && (
            <button
              type="button"
              className="bs-btn bs-btn-outline bs-btn-sm"
              onClick={handleClearFilters}
              style={{
                height: 32,
                color: '#ef4444',
                borderColor: '#fca5a5',
                background: '#fef2f2',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
                fontSize: 11.5,
                cursor: 'pointer',
                borderRadius: 4
              }}
              title="Reset all filters"
            >
              <span>✕</span>
              <span>Reset</span>
            </button>
          )}

          {/* 10. Record Count Badge */}
          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Showing <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> records</span>
            {isFiltered && (
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: 4, fontSize: 10.5, fontWeight: 700 }}>
                Filtered
              </span>
            )}
          </div>

          {/* 11. Export CSV */}
          <button
            type="button"
            className="bs-btn bs-btn-outline bs-btn-sm"
            onClick={exportCsv}
            style={{ marginLeft: 'auto', height: 32, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            Export CSV ({filtered.length})
          </button>
        </div>

        {/* ── Table View ── */}
        <div style={{ overflowX: 'auto', maxHeight: 460, overflowY: 'auto' }}>
          <table className="bs-table">
            <thead>
              <tr style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                <th style={{ width: 95 }}>Employee ID</th>
                <th style={{ minWidth: 150, cursor: 'pointer' }} onClick={() => { setSortCol('name'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  Officer Name {sortCol === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ minWidth: 130 }}>Department</th>
                <th style={{ minWidth: 160, cursor: 'pointer' }} onClick={() => { setSortCol('branch'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  Branch / Location {sortCol === 'branch' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ width: 95 }}>Division</th>
                <th style={{ width: 100 }}>Date</th>
                <th style={{ width: 130 }}>Shift Window</th>
                <th style={{ minWidth: 160 }}>Discrepancy Detail</th>
                <th style={{ width: 90, textAlign: 'center' }}>Severity</th>
                <th style={{ width: 100, textAlign: 'center' }}>HR Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>⟳ Loading exceptions…</td></tr>}
              {!loading && pageRows.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 36, color: '#9ca3af' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                    <div style={{ fontWeight: 600, color: '#475569' }}>No {activeTab} records matched the selected filter criteria.</div>
                    <button
                      type="button"
                      className="bs-btn bs-btn-outline bs-btn-sm"
                      onClick={handleClearFilters}
                      style={{ marginTop: 12 }}
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              )}
              {pageRows.map((r, i) => (
                <tr
                  key={r.id}
                  style={{
                    background: r.exceptionType === 'Absent No Leave' ? '#fff5f5' : (i % 2 === 0 ? '#fff' : '#f9fafb'),
                    borderLeft: r.escalated ? '3px solid #dc2626' : (r.severity === 'High' ? '3px solid #f97316' : '3px solid transparent')
                  }}
                >
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#0d9488', fontWeight: 600 }}>{r.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: '#fed7aa',
                        color: '#c2410c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700
                      }}>
                        {r.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 11.5, color: '#334155' }}>{r.department}</td>
                  <td style={{ fontSize: 12, color: '#374151' }}>{r.branch}</td>
                  <td style={{ fontSize: 11.5, color: '#64748b' }}>{r.division}</td>
                  <td style={{ fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap' }}>{r.date}</td>
                  <td style={{ fontSize: 11, color: '#64748b' }}>{r.shift}</td>
                  <td style={{
                    fontSize: 12,
                    color: r.severity === 'High' ? '#dc2626' : '#374151',
                    fontWeight: r.severity === 'High' ? 600 : 400
                  }}>
                    {r.detail}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: SEV_BG[r.severity], color: SEV_COLOR[r.severity], padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                      {r.severity}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setReconcileItem(r)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        padding: '3px 8px',
                        fontSize: 11,
                        color: r.escalated ? '#dc2626' : '#0d9488',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                      title="Inspect Exception Details"
                    >
                      {r.escalated ? 'HR Case' : 'Reconcile'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid #eef0f3',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
            <span>Rows per page:</span>
            <select
              className="bs-select"
              style={{ height: 28, fontSize: 11.5, padding: '0 6px' }}
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: '#9ca3af', marginRight: 6 }}>
              Page {page} of {totalPages} · {filtered.length} exceptions
            </span>
            <button
              type="button"
              className="bs-btn bs-btn-outline bs-btn-sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              ← Prev
            </button>
            <button
              type="button"
              className="bs-btn bs-btn-outline bs-btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* ── Reconciliation Modal ── */}
      {reconcileItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 10,
            width: '100%',
            maxWidth: 580,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#0f172a',
              color: '#ffffff'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Attendance Discrepancy Reconciliation #{reconcileItem.id}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Pubali Bank PLC · Policy Conformance ATT-04 / ATT-05</div>
              </div>
              <button
                type="button"
                onClick={() => setReconcileItem(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: 18,
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Employee & Status Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{reconcileItem.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Dept: {reconcileItem.department} · Branch: {reconcileItem.branch}</div>
                </div>
                <div>
                  <span style={{
                    background: SEV_BG[reconcileItem.severity],
                    color: SEV_COLOR[reconcileItem.severity],
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 11.5,
                    fontWeight: 700
                  }}>
                    {reconcileItem.severity} Severity
                  </span>
                </div>
              </div>

              {/* Grid details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11.5 }}>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>Exception Category</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{reconcileItem.exceptionType}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>Date & Shift</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{reconcileItem.date} ({reconcileItem.shift})</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>Deviation Diagnostic</div>
                  <div style={{ fontWeight: 700, color: '#ea580c', marginTop: 2 }}>{reconcileItem.detail}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>HR Escalation Status</div>
                  <div style={{ fontWeight: 700, color: reconcileItem.escalated ? '#dc2626' : '#16a34a', marginTop: 2 }}>
                    {reconcileItem.escalated ? '🚨 Escalated to HR Division' : 'Standard Branch Review'}
                  </div>
                </div>
              </div>

              {/* Policy reconciliation notes */}
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 6, border: '1px solid #f1f5f9', fontSize: 11.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Biometric Terminal Verification:</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>BIOSTAR 2 TIME AUDITED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Policy Action Requirement:</span>
                  <span style={{ color: '#475569' }}>Require supervisor concurrence before month-end payroll lock</span>
                </div>
              </div>
            </div>

            <div style={{
              padding: '10px 18px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              background: '#f8fafc'
            }}>
              <button
                type="button"
                className="bs-btn bs-btn-outline bs-btn-sm"
                onClick={() => setReconcileItem(null)}
              >
                Close Reconciliation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
