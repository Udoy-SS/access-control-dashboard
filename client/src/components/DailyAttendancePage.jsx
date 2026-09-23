import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FULL_PUBALI_LOCATIONS, DIVISIONS_LIST } from '../data/pubaliFullBranches';
import { useBankFilters } from './filters/FilterContext';

// Build 829-branch consolidated daily attendance records
function generateDailyAttendanceData() {
  const records = [];

  FULL_PUBALI_LOCATIONS.forEach((loc, idx) => {
    // Scale staff count so total across 829 branches reflects ~35,000 employees
    const branchStaff = loc.type === 'head-office' ? 420 : (loc.type === 'corporate' ? 82 : (34 + (idx % 19)));
    
    // Realistic distribution across 829 branches
    const absent = Math.max(0, (idx % 11 === 0) ? Math.round(branchStaff * 0.06) : ((idx % 3 === 0) ? 2 : 1));
    const late = Math.max(0, (idx % 7 === 0) ? Math.round(branchStaff * 0.05) : ((idx % 2 === 0) ? 1 : 0));
    const leave = Math.max(0, (idx % 9 === 0) ? 2 : ((idx % 4 === 0) ? 1 : 0));
    const present = Math.max(0, branchStaff - absent - leave);
    const attRate = parseFloat(((present / branchStaff) * 100).toFixed(1));

    const firstInMin = String(8 + (idx % 35)).padStart(2, '0');
    const firstIn = `08:${firstInMin} AM`;
    const rosterStatus = attRate >= 92 ? 'Good' : (attRate >= 85 ? 'Normal' : 'Low Staff Alert');

    records.push({
      id: `BR-ATT-${idx}`,
      code: loc.code || `BR-${1000 + idx}`,
      name: loc.name,
      division: loc.division || 'Dhaka',
      type: loc.type || 'branch',
      totalStaff: branchStaff,
      present,
      absent,
      late,
      leave,
      attRate,
      firstIn,
      rosterStatus
    });
  });

  return records;
}

export default function DailyAttendancePage({ onNavigate }) {
  const {
    region: globalRegion,
    branch: globalBranch,
    searchQuery: globalSearch,
    moduleFilters,
    setModuleFilter
  } = useBankFilters();

  const [records] = useState(() => generateDailyAttendanceData());

  // Filter States
  const [search, setSearch] = useState('');
  const [filterRosterStatus, setFilterRosterStatus] = useState('All'); // 'All' | 'Good' | 'Normal' | 'Low Staff Alert'
  const [filterDivision, setFilterDivision] = useState('All');
  const [filterRateTier, setFilterRateTier] = useState('All'); // 'All' | 'ge95' | '90to94' | '85to89' | 'lt85'
  const [filterDiscrepancy, setFilterDiscrepancy] = useState('All'); // 'All' | 'hasAbsent' | 'hasLate' | 'hasLeave'
  const [filterFacilityType, setFilterFacilityType] = useState('All'); // 'All' | 'head-office' | 'corporate' | 'branch' | 'sub-branch' | 'islamic'

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Drill-down modal state
  const [selectedBranch, setSelectedBranch] = useState(null);

  // ── Sync with Global Filter Bar ───────────────────────────
  useEffect(() => {
    if (globalRegion && globalRegion !== 'All Regions') {
      setFilterDivision(globalRegion);
    }
  }, [globalRegion]);

  useEffect(() => {
    if (globalBranch && globalBranch !== 'All Branches') {
      setSearch(globalBranch);
    }
  }, [globalBranch]);

  useEffect(() => {
    if (globalSearch && globalSearch.trim()) {
      setSearch(globalSearch.trim());
    }
  }, [globalSearch]);

  // Sync with PageLevelFilterPanel attStatus
  useEffect(() => {
    if (moduleFilters?.attStatus && moduleFilters.attStatus !== 'All') {
      const st = moduleFilters.attStatus;
      if (st === 'Present') setFilterRosterStatus('Good');
      else if (st === 'Late') setFilterDiscrepancy('hasLate');
      else if (st === 'Absent') setFilterDiscrepancy('hasAbsent');
      else if (st === 'Leave') setFilterDiscrepancy('hasLeave');
    }
  }, [moduleFilters?.attStatus]);

  // ── Check if Any Filter is Active ─────────────────────────
  const isFiltered = Boolean(
    search.trim() ||
    filterRosterStatus !== 'All' ||
    filterDivision !== 'All' ||
    filterRateTier !== 'All' ||
    filterDiscrepancy !== 'All' ||
    filterFacilityType !== 'All'
  );

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setFilterRosterStatus('All');
    setFilterDivision('All');
    setFilterRateTier('All');
    setFilterDiscrepancy('All');
    setFilterFacilityType('All');
    setCurrentPage(1);
    if (setModuleFilter) setModuleFilter('attStatus', 'All');
  }, [setModuleFilter]);

  // ── Filter & Sort Records ─────────────────────────────────
  const filteredRecords = useMemo(() => {
    let list = records;

    // 1. Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.division.toLowerCase().includes(q)
      );
    }

    // 2. Roster Status
    if (filterRosterStatus !== 'All') {
      list = list.filter(r => r.rosterStatus.toLowerCase() === filterRosterStatus.toLowerCase());
    }

    // 3. Division
    if (filterDivision !== 'All') {
      list = list.filter(r => r.division.toLowerCase() === filterDivision.toLowerCase());
    }

    // 4. Rate Tier
    if (filterRateTier !== 'All') {
      if (filterRateTier === 'ge95') list = list.filter(r => r.attRate >= 95);
      else if (filterRateTier === '90to94') list = list.filter(r => r.attRate >= 90 && r.attRate < 95);
      else if (filterRateTier === '85to89') list = list.filter(r => r.attRate >= 85 && r.attRate < 90);
      else if (filterRateTier === 'lt85') list = list.filter(r => r.attRate < 85);
    }

    // 5. Staff Discrepancy
    if (filterDiscrepancy !== 'All') {
      if (filterDiscrepancy === 'hasAbsent') list = list.filter(r => r.absent > 0);
      else if (filterDiscrepancy === 'hasLate') list = list.filter(r => r.late > 0);
      else if (filterDiscrepancy === 'hasLeave') list = list.filter(r => r.leave > 0);
    }

    // 6. Facility Type
    if (filterFacilityType !== 'All') {
      list = list.filter(r => r.type === filterFacilityType);
    }

    // 7. Sort
    return [...list].sort((a, b) => {
      let va = a[sortCol];
      let vb = b[sortCol];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [records, search, filterRosterStatus, filterDivision, filterRateTier, filterDiscrepancy, filterFacilityType, sortCol, sortDir]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterRosterStatus, filterDivision, filterRateTier, filterDiscrepancy, filterFacilityType]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Overall KPIs (Computed dynamically from filteredRecords)
  const kpis = useMemo(() => {
    let totalStaff = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalLeave = 0;

    filteredRecords.forEach(r => {
      totalStaff += r.totalStaff;
      totalPresent += r.present;
      totalAbsent += r.absent;
      totalLate += r.late;
      totalLeave += r.leave;
    });

    const rate = totalStaff > 0 ? ((totalPresent / totalStaff) * 100).toFixed(1) : '0.0';
    const branchesCount = filteredRecords.length;

    return [
      { icon: '👥', label: 'Total Bank Staff', value: totalStaff.toLocaleString(), sub: `${branchesCount} Branches Scope`, color: '#2563eb' },
      { icon: '✅', label: 'Present Today', value: totalPresent.toLocaleString(), sub: `${rate}% Attendance Rate`, color: '#10b981' },
      { icon: '❌', label: 'Absent Today', value: totalAbsent.toLocaleString(), sub: totalStaff > 0 ? `${((totalAbsent/totalStaff)*100).toFixed(1)}% Absenteeism` : '0% Absenteeism', color: '#ef4444' },
      { icon: '⏰', label: 'Late Arrival', value: totalLate.toLocaleString(), sub: 'Punched past grace', color: '#f59e0b' },
      { icon: '🌴', label: 'Approved Leave', value: totalLeave.toLocaleString(), sub: 'HR authorized leave', color: '#6366f1' }
    ];
  }, [filteredRecords]);

  // Quick pills counts
  const rosterCounts = useMemo(() => {
    let good = 0;
    let normal = 0;
    let alert = 0;
    filteredRecords.forEach(r => {
      if (r.rosterStatus === 'Good') good++;
      else if (r.rosterStatus === 'Normal') normal++;
      else alert++;
    });
    return { total: filteredRecords.length, good, normal, alert };
  }, [filteredRecords]);

  // ── CSV Export Handler ────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['Branch Code', 'Branch / Office Name', 'Division', 'Facility Type', 'Total Staff', 'Present', 'Absent', 'Late', 'On Leave', 'Attendance %', 'First In Punch', 'Roster Status'];
    const rows = filteredRecords.map(r => [
      `"${r.code}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.division}"`,
      `"${r.type}"`,
      r.totalStaff,
      r.present,
      r.absent,
      r.late,
      r.leave,
      `"${r.attRate}%"`,
      `"${r.firstIn}"`,
      `"${r.rosterStatus}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pubali-daily-attendance-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── KPI Summary Cards ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {kpis.map((k, idx) => (
          <div key={idx} style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
            flex: '1 1 180px', minWidth: 160, boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8, background: `${k.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
            }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                {k.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: k.color, marginTop: 2 }}>
                {k.value}
              </div>
              {k.sub && <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>{k.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Data Card & Filter Toolbar ── */}
      <div className="bs-card">
        <div className="bs-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="bs-card-header-title">Pubali Bank Daily Branch Attendance Summary</span>
            <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>
              Consolidated daily biometric attendance across 829 branches & sub-branches · 17 Sep 2026
            </span>
          </div>
        </div>

        {/* ── Filter Toolbar Strip ── */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #eef0f3',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
          background: '#fcfcfd'
        }}>
          {/* 1. Quick Roster Status Pills */}
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 2, borderRadius: 6 }}>
            <button
              type="button"
              onClick={() => setFilterRosterStatus('All')}
              style={{
                border: 'none',
                background: filterRosterStatus === 'All' ? '#ffffff' : 'transparent',
                color: filterRosterStatus === 'All' ? '#0f172a' : '#64748b',
                fontWeight: filterRosterStatus === 'All' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterRosterStatus === 'All' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              All Branches ({rosterCounts.total})
            </button>
            <button
              type="button"
              onClick={() => setFilterRosterStatus('Good')}
              style={{
                border: 'none',
                background: filterRosterStatus === 'Good' ? '#10b981' : 'transparent',
                color: filterRosterStatus === 'Good' ? '#ffffff' : '#059669',
                fontWeight: filterRosterStatus === 'Good' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterRosterStatus === 'Good' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none'
              }}
            >
              ✅ Optimal ({rosterCounts.good})
            </button>
            <button
              type="button"
              onClick={() => setFilterRosterStatus('Normal')}
              style={{
                border: 'none',
                background: filterRosterStatus === 'Normal' ? '#0284c7' : 'transparent',
                color: filterRosterStatus === 'Normal' ? '#ffffff' : '#0369a1',
                fontWeight: filterRosterStatus === 'Normal' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterRosterStatus === 'Normal' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none'
              }}
            >
              ℹ️ Normal ({rosterCounts.normal})
            </button>
            <button
              type="button"
              onClick={() => setFilterRosterStatus('Low Staff Alert')}
              style={{
                border: 'none',
                background: filterRosterStatus === 'Low Staff Alert' ? '#ef4444' : 'transparent',
                color: filterRosterStatus === 'Low Staff Alert' ? '#ffffff' : '#dc2626',
                fontWeight: filterRosterStatus === 'Low Staff Alert' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterRosterStatus === 'Low Staff Alert' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none'
              }}
            >
              ⚠️ Low Staff ({rosterCounts.alert})
            </button>
          </div>

          {/* 2. Search Box */}
          <div style={{ position: 'relative', width: 220, minWidth: 170 }}>
            <input
              className="bs-input"
              style={{ width: '100%', paddingLeft: 28, height: 32, fontSize: 12 }}
              placeholder="Search branch code or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" style={{ position: 'absolute', left: 9, top: 9, color: '#9ca3af' }}>
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </div>

          {/* 3. Division Filter Dropdown */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 135,
              cursor: 'pointer',
              borderColor: filterDivision !== 'All' ? '#0d9488' : '#e2e8f0',
              background: filterDivision !== 'All' ? '#f0fdf4' : '#ffffff',
              fontWeight: filterDivision !== 'All' ? 600 : 400
            }}
            value={filterDivision}
            onChange={e => setFilterDivision(e.target.value)}
            aria-label="Filter by Division"
          >
            <option value="All">All Divisions (8)</option>
            {DIVISIONS_LIST.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* 4. Attendance Rate Tier Dropdown */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 155,
              cursor: 'pointer',
              borderColor: filterRateTier !== 'All' ? '#0d9488' : '#e2e8f0',
              background: filterRateTier !== 'All' ? '#f0fdf4' : '#ffffff',
              fontWeight: filterRateTier !== 'All' ? 600 : 400
            }}
            value={filterRateTier}
            onChange={e => setFilterRateTier(e.target.value)}
            aria-label="Filter by Attendance Rate"
          >
            <option value="All">All Attendance Rates</option>
            <option value="ge95">≥ 95% (High Attendance)</option>
            <option value="90to94">90% – 94.9% (Standard)</option>
            <option value="85to89">85% – 89.9% (Moderate)</option>
            <option value="lt85">&lt; 85% (Critical Low)</option>
          </select>

          {/* 5. Discrepancy Filter Dropdown */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 145,
              cursor: 'pointer',
              borderColor: filterDiscrepancy !== 'All' ? '#0d9488' : '#e2e8f0',
              background: filterDiscrepancy !== 'All' ? '#f0fdf4' : '#ffffff',
              fontWeight: filterDiscrepancy !== 'All' ? 600 : 400
            }}
            value={filterDiscrepancy}
            onChange={e => setFilterDiscrepancy(e.target.value)}
            aria-label="Filter by Staff Condition"
          >
            <option value="All">All Staff Conditions</option>
            <option value="hasAbsent">Has Absent Personnel</option>
            <option value="hasLate">Has Late Punches</option>
            <option value="hasLeave">Has Personnel on Leave</option>
          </select>

          {/* 6. Facility Type Filter Dropdown */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 140,
              cursor: 'pointer',
              borderColor: filterFacilityType !== 'All' ? '#0d9488' : '#e2e8f0',
              background: filterFacilityType !== 'All' ? '#f0fdf4' : '#ffffff',
              fontWeight: filterFacilityType !== 'All' ? 600 : 400
            }}
            value={filterFacilityType}
            onChange={e => setFilterFacilityType(e.target.value)}
            aria-label="Filter by Facility Type"
          >
            <option value="All">All Facilities</option>
            <option value="head-office">Head Office</option>
            <option value="corporate">Corporate Branches</option>
            <option value="branch">Regular Branches</option>
            <option value="sub-branch">Sub-Branches (Upashakha)</option>
            <option value="islamic">Islamic Banking Wings</option>
          </select>

          {/* 7. Reset Button */}
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

          {/* 8. Records Count Badge */}
          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Showing <strong style={{ color: '#0f172a' }}>{filteredRecords.length}</strong> of {records.length}</span>
            {isFiltered && (
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: 4, fontSize: 10.5, fontWeight: 700 }}>
                Filtered
              </span>
            )}
          </div>

          {/* 9. Export CSV Button */}
          <button
            type="button"
            className="bs-btn bs-btn-outline bs-btn-sm"
            onClick={handleExportCSV}
            style={{ marginLeft: 'auto', height: 32, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            Export CSV ({filteredRecords.length})
          </button>
        </div>

        {/* ── Table View ── */}
        <div style={{ overflowX: 'auto' }}>
          <table className="bs-table">
            <thead>
              <tr>
                <th style={{ width: 95, cursor: 'pointer' }} onClick={() => { setSortCol('code'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  Branch Code {sortCol === 'code' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ minWidth: 200, cursor: 'pointer' }} onClick={() => { setSortCol('name'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  Branch / Office Name {sortCol === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ minWidth: 120 }}>Division</th>
                <th style={{ width: 85, textAlign: 'right', cursor: 'pointer' }} onClick={() => { setSortCol('totalStaff'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  Staff {sortCol === 'totalStaff' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ width: 85, textAlign: 'right', color: '#16a34a' }}>Present</th>
                <th style={{ width: 85, textAlign: 'right', color: '#dc2626' }}>Absent</th>
                <th style={{ width: 85, textAlign: 'right', color: '#d97706' }}>Late</th>
                <th style={{ width: 85, textAlign: 'right', color: '#4f46e5' }}>Leave</th>
                <th style={{ width: 110, textAlign: 'right', cursor: 'pointer' }} onClick={() => { setSortCol('attRate'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  Attendance % {sortCol === 'attRate' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ width: 110 }}>First In Punch</th>
                <th style={{ width: 120, textAlign: 'center' }}>Roster Status</th>
                <th style={{ width: 80, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#0d9488', fontWeight: 600 }}>
                    {r.code}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.name}</span>
                      <span style={{ fontSize: 10.5, color: '#64748b', textTransform: 'capitalize' }}>{r.type.replace('-', ' ')}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: '#334155' }}>
                    {r.division}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    {r.totalStaff}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>
                    {r.present}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: r.absent > 0 ? '#dc2626' : '#94a3b8' }}>
                    {r.absent}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: r.late > 0 ? '#d97706' : '#94a3b8' }}>
                    {r.late}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: r.leave > 0 ? '#4f46e5' : '#94a3b8' }}>
                    {r.leave}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: 12,
                      color: r.attRate >= 92 ? '#16a34a' : (r.attRate >= 85 ? '#0284c7' : '#dc2626')
                    }}>
                      {r.attRate}%
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#475569' }}>
                    {r.firstIn}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {r.rosterStatus === 'Good' ? (
                      <span className="bs-badge bs-badge-green">Optimal</span>
                    ) : r.rosterStatus === 'Normal' ? (
                      <span className="bs-badge bs-badge-blue" style={{ background: '#e0f2fe', color: '#0369a1' }}>Normal</span>
                    ) : (
                      <span className="bs-badge bs-badge-red">Low Staff Alert</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedBranch(r)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        padding: '3px 8px',
                        fontSize: 11,
                        color: '#0d9488',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                      title="View Branch Roster Breakdown"
                    >
                      Roster
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: 36, color: '#9ca3af' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                    <div style={{ fontWeight: 600, color: '#475569' }}>No branches matched the selected attendance filter criteria.</div>
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
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11.5, color: '#9ca3af', marginRight: 6 }}>
              Page {currentPage} of {totalPages} · {filteredRecords.length} branches
            </span>
            <button
              type="button"
              className="bs-btn bs-btn-outline bs-btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              ← Prev
            </button>
            <button
              type="button"
              className="bs-btn bs-btn-outline bs-btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* ── Branch Roster Drill-Down Modal ── */}
      {selectedBranch && (
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
            maxWidth: 600,
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
                <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedBranch.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Code: {selectedBranch.code} · Division: {selectedBranch.division}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBranch(null)}
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

            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Metric grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 10.5, color: '#166534', fontWeight: 700 }}>PRESENT</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#15803d', marginTop: 2 }}>{selectedBranch.present}</div>
                </div>
                <div style={{ background: '#fef2f2', padding: '10px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 10.5, color: '#991b1b', fontWeight: 700 }}>ABSENT</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#b91c1c', marginTop: 2 }}>{selectedBranch.absent}</div>
                </div>
                <div style={{ background: '#fffbeb', padding: '10px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 10.5, color: '#92400e', fontWeight: 700 }}>LATE</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#b45309', marginTop: 2 }}>{selectedBranch.late}</div>
                </div>
                <div style={{ background: '#eef2ff', padding: '10px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 10.5, color: '#3730a3', fontWeight: 700 }}>ON LEAVE</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#4338ca', marginTop: 2 }}>{selectedBranch.leave}</div>
                </div>
              </div>

              {/* Status details */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>Attendance Rate:</span>
                  <span style={{ fontWeight: 700, color: selectedBranch.attRate >= 92 ? '#16a34a' : '#dc2626' }}>{selectedBranch.attRate}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>First In Punch:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedBranch.firstIn} (BioStar Ingress Gate)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#64748b' }}>Shift Grace Conformance:</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>97.4% On-time</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Central Ledger Audit Status:</span>
                  <span style={{ color: '#0d9488', fontWeight: 600, fontFamily: 'monospace' }}>SYNCHRONIZED (Suprema CS-40)</span>
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
                onClick={() => setSelectedBranch(null)}
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
