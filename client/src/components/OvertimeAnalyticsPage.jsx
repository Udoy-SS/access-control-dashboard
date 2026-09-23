import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FULL_PUBALI_LOCATIONS, DIVISIONS_LIST } from '../data/pubaliFullBranches';
import { useBankFilters } from './filters/FilterContext';

const OT_CATEGORIES = [
  'Approved Standard OT',
  'Bank Holiday OT',
  'Emergency Call-in',
  'Weekend OT (Vault & Closing)'
];

const OT_STATUSES = ['Approved', 'Pending', 'Rejected'];

function generateOvertimeData() {
  const records = [];
  let otIdx = 0;

  FULL_PUBALI_LOCATIONS.slice(0, 100).forEach(loc => {
    if (loc.employees) {
      loc.employees.filter(e => e.status === 'Present').slice(0, 3).forEach(emp => {
        const shiftEnd = '18:30';
        const otH = 19 + (otIdx % 3);
        const otM = String((otIdx * 13) % 60).padStart(2, '0');
        const actualOut = `${otH}:${otM}`;
        const otMins = (otH * 60 + parseInt(otM, 10)) - (18 * 60 + 30);
        const otHours = Math.floor(otMins / 60);
        const otMinRem = otMins % 60;
        const category = OT_CATEGORIES[otIdx % OT_CATEGORIES.length];
        const status = (otIdx % 7 === 0) ? 'Rejected' : ((otIdx % 4 === 0) ? 'Pending' : 'Approved');
        
        // Banking overtime hourly rate computation (BDT 350 - 650/hr based on grade)
        const hourlyRate = 350 + ((emp.id?.charCodeAt(emp.id.length - 1) || otIdx) % 6) * 50;
        const compAmount = Math.round((otMins / 60) * hourlyRate);

        records.push({
          id: `OT-PB-${2026000 + otIdx}`,
          userId: emp.id,
          userName: emp.name,
          branch: loc.name,
          division: loc.division || 'Dhaka',
          date: 'Sep 17, 2026',
          shiftEnd,
          actualOut,
          otMins,
          otDuration: `${otHours}h ${String(otMinRem).padStart(2, '0')}m`,
          category,
          status,
          hourlyRate,
          compAmount,
          supervisor: 'Branch Manager / Operations Head',
          ledgerHash: `OT-SHA256:0x${((otIdx + 1) * 314159265).toString(16).padStart(12, '0')}`
        });
        otIdx++;
      });
    }
  });

  return records;
}

export default function OvertimeAnalyticsPage({ onNavigate }) {
  const {
    region: globalRegion,
    branch: globalBranch,
    searchQuery: globalSearch,
    moduleFilters,
    setModuleFilter
  } = useBankFilters();

  const [records] = useState(() => generateOvertimeData());

  // Local Filter States
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // 'All' | 'Approved' | 'Pending' | 'Rejected'
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDuration, setFilterDuration] = useState('All'); // 'All' | 'ge2h' | '1to2h' | 'lt1h'
  const [filterDivision, setFilterDivision] = useState('All');
  const [filterBranch, setFilterBranch] = useState('All');

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [sortCol, setSortCol] = useState('otMins');
  const [sortDir, setSortDir] = useState('desc');

  // Modal voucher inspection
  const [inspectVoucher, setInspectVoucher] = useState(null);

  // ── Sync with Global Filter Bar ───────────────────────────
  useEffect(() => {
    if (globalRegion && globalRegion !== 'All Regions') {
      setFilterDivision(globalRegion);
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

  // Sync with PageLevelFilterPanel otStatus
  useEffect(() => {
    if (moduleFilters?.otStatus && moduleFilters.otStatus !== 'All') {
      const val = moduleFilters.otStatus;
      if (val === 'Approved') setFilterStatus('Approved');
      else if (val === 'Pending') setFilterStatus('Pending');
      else if (val === 'Disallowed') setFilterStatus('Rejected');
    }
  }, [moduleFilters?.otStatus]);

  // ── Extract Options ───────────────────────────────────────
  const branchOptions = useMemo(() => {
    const s = new Set();
    records.forEach(r => { if (r.branch) s.add(r.branch); });
    return Array.from(s).sort();
  }, [records]);

  // ── Check if Any Filter is Active ─────────────────────────
  const isFiltered = Boolean(
    search.trim() ||
    filterStatus !== 'All' ||
    filterCategory !== 'All' ||
    filterDuration !== 'All' ||
    filterDivision !== 'All' ||
    filterBranch !== 'All'
  );

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setFilterStatus('All');
    setFilterCategory('All');
    setFilterDuration('All');
    setFilterDivision('All');
    setFilterBranch('All');
    setCurrentPage(1);
    if (setModuleFilter) setModuleFilter('otStatus', 'All');
  }, [setModuleFilter]);

  // ── Filter & Sort Pipeline ────────────────────────────────
  const filteredRecords = useMemo(() => {
    let list = records;

    // 1. Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.userId.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.branch.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }

    // 2. Status
    if (filterStatus !== 'All') {
      list = list.filter(r => r.status.toLowerCase() === filterStatus.toLowerCase());
    }

    // 3. Category
    if (filterCategory !== 'All') {
      list = list.filter(r => r.category === filterCategory);
    }

    // 4. Duration
    if (filterDuration !== 'All') {
      if (filterDuration === 'ge2h') list = list.filter(r => r.otMins >= 120);
      else if (filterDuration === '1to2h') list = list.filter(r => r.otMins >= 60 && r.otMins < 120);
      else if (filterDuration === 'lt1h') list = list.filter(r => r.otMins < 60);
    }

    // 5. Division
    if (filterDivision !== 'All') {
      list = list.filter(r => r.division.toLowerCase() === filterDivision.toLowerCase());
    }

    // 6. Branch
    if (filterBranch !== 'All') {
      list = list.filter(r => r.branch.toLowerCase() === filterBranch.toLowerCase());
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
  }, [records, search, filterStatus, filterCategory, filterDuration, filterDivision, filterBranch, sortCol, sortDir]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterCategory, filterDuration, filterDivision, filterBranch]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // KPIs
  const kpis = useMemo(() => {
    let totalMins = 0;
    let approvedMins = 0;
    let pendingCount = 0;
    let weekendMins = 0;

    records.forEach(r => {
      totalMins += r.otMins;
      if (r.status === 'Approved') approvedMins += r.otMins;
      if (r.status === 'Pending') pendingCount++;
      if (r.category.includes('Weekend') || r.category.includes('Holiday')) weekendMins += r.otMins;
    });

    const totalHours = (totalMins / 60).toFixed(1);
    const approvedHours = (approvedMins / 60).toFixed(1);
    const weekendHours = (weekendMins / 60).toFixed(1);

    return [
      { icon: '⏱️', label: 'Total OT Hours', value: `${totalHours} hrs`, sub: 'Month-to-date logged', color: '#3b82f6' },
      { icon: '✅', label: 'Approved OT', value: `${approvedHours} hrs`, sub: 'Verified by Supervisor', color: '#10b981' },
      { icon: '⏳', label: 'Pending Review', value: `${pendingCount} Claims`, sub: 'Awaiting Branch Head review', color: '#f59e0b' },
      { icon: '🏦', label: 'Weekend / Holiday OT', value: `${weekendHours} hrs`, sub: 'Vault & Closing staff', color: '#6366f1' },
      { icon: '👥', label: 'Staff Earning OT', value: `${records.length} Staff`, sub: 'Active payroll claimants', color: '#0d9488' }
    ];
  }, [records]);

  // Status counts for quick pills
  const statusCounts = useMemo(() => {
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    records.forEach(r => {
      if (r.status === 'Approved') approved++;
      else if (r.status === 'Pending') pending++;
      else rejected++;
    });
    return { total: records.length, approved, pending, rejected };
  }, [records]);

  // ── CSV Export Handler ────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['User ID', 'Employee Name', 'Branch Location', 'Division', 'Date', 'Shift End', 'Actual Out', 'OT Duration', 'OT Minutes', 'Category', 'Status', 'Hourly Rate BDT', 'Total Compensation BDT'];
    const rows = filteredRecords.map(r => [
      `"${r.userId}"`,
      `"${r.userName.replace(/"/g, '""')}"`,
      `"${r.branch.replace(/"/g, '""')}"`,
      `"${r.division}"`,
      `"${r.date}"`,
      `"${r.shiftEnd}"`,
      `"${r.actualOut}"`,
      `"${r.otDuration}"`,
      r.otMins,
      `"${r.category}"`,
      `"${r.status}"`,
      r.hourlyRate,
      r.compAmount
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pubali-overtime-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
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
            <span className="bs-card-header-title">Overtime Analytics & Payroll Reconciliation (ATT-OT)</span>
            <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>
              Approved overtime hours, extended shifts, and branch payroll reconciliation · September 2026
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
          {/* 1. Quick Status Pills */}
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 2, borderRadius: 6 }}>
            <button
              type="button"
              onClick={() => { setFilterStatus('All'); if (setModuleFilter) setModuleFilter('otStatus', 'All'); }}
              style={{
                border: 'none',
                background: filterStatus === 'All' ? '#ffffff' : 'transparent',
                color: filterStatus === 'All' ? '#0f172a' : '#64748b',
                fontWeight: filterStatus === 'All' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterStatus === 'All' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              All Claims ({statusCounts.total})
            </button>
            <button
              type="button"
              onClick={() => { setFilterStatus('Approved'); if (setModuleFilter) setModuleFilter('otStatus', 'Approved'); }}
              style={{
                border: 'none',
                background: filterStatus === 'Approved' ? '#10b981' : 'transparent',
                color: filterStatus === 'Approved' ? '#ffffff' : '#059669',
                fontWeight: filterStatus === 'Approved' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterStatus === 'Approved' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none'
              }}
            >
              ✅ Approved ({statusCounts.approved})
            </button>
            <button
              type="button"
              onClick={() => { setFilterStatus('Pending'); if (setModuleFilter) setModuleFilter('otStatus', 'Pending'); }}
              style={{
                border: 'none',
                background: filterStatus === 'Pending' ? '#f59e0b' : 'transparent',
                color: filterStatus === 'Pending' ? '#ffffff' : '#d97706',
                fontWeight: filterStatus === 'Pending' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterStatus === 'Pending' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none'
              }}
            >
              ⏳ Pending ({statusCounts.pending})
            </button>
            <button
              type="button"
              onClick={() => { setFilterStatus('Rejected'); if (setModuleFilter) setModuleFilter('otStatus', 'Disallowed'); }}
              style={{
                border: 'none',
                background: filterStatus === 'Rejected' ? '#ef4444' : 'transparent',
                color: filterStatus === 'Rejected' ? '#ffffff' : '#dc2626',
                fontWeight: filterStatus === 'Rejected' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterStatus === 'Rejected' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none'
              }}
            >
              ⛔ Rejected ({statusCounts.rejected})
            </button>
          </div>

          {/* 2. Search Input */}
          <div style={{ position: 'relative', width: 220, minWidth: 170 }}>
            <input
              className="bs-input"
              style={{ width: '100%', paddingLeft: 28, height: 32, fontSize: 12 }}
              placeholder="Search user ID, officer, branch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" style={{ position: 'absolute', left: 9, top: 9, color: '#9ca3af' }}>
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </div>

          {/* 3. Category Filter Dropdown */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 160,
              cursor: 'pointer',
              borderColor: filterCategory !== 'All' ? '#0d9488' : '#e2e8f0',
              background: filterCategory !== 'All' ? '#f0fdf4' : '#ffffff',
              fontWeight: filterCategory !== 'All' ? 600 : 400
            }}
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            aria-label="Filter by OT Category"
          >
            <option value="All">All OT Categories</option>
            {OT_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* 4. Duration Tier Dropdown */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 145,
              cursor: 'pointer',
              borderColor: filterDuration !== 'All' ? '#0d9488' : '#e2e8f0',
              background: filterDuration !== 'All' ? '#f0fdf4' : '#ffffff',
              fontWeight: filterDuration !== 'All' ? 600 : 400
            }}
            value={filterDuration}
            onChange={e => setFilterDuration(e.target.value)}
            aria-label="Filter by OT Duration"
          >
            <option value="All">All OT Durations</option>
            <option value="ge2h">≥ 2 Hours (Extended)</option>
            <option value="1to2h">1 Hour – 1h 59m</option>
            <option value="lt1h">&lt; 1 Hour</option>
          </select>

          {/* 5. Branch Location Filter Dropdown */}
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
            aria-label="Filter by Branch Location"
          >
            <option value="All">All Branches ({branchOptions.length})</option>
            {branchOptions.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* 6. Division Filter Dropdown */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 130,
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
                <th style={{ width: 95 }}>User ID</th>
                <th style={{ minWidth: 160, cursor: 'pointer' }} onClick={() => { setSortCol('userName'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  Employee Name {sortCol === 'userName' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ minWidth: 170, cursor: 'pointer' }} onClick={() => { setSortCol('branch'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  Branch / Location {sortCol === 'branch' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ width: 100 }}>Date</th>
                <th style={{ width: 90 }}>Shift End</th>
                <th style={{ width: 95, color: '#0d9488' }}>Actual Out</th>
                <th style={{ width: 110, textAlign: 'right', cursor: 'pointer' }} onClick={() => { setSortCol('otMins'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  OT Duration {sortCol === 'otMins' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ minWidth: 150 }}>OT Category</th>
                <th style={{ width: 110, textAlign: 'center', cursor: 'pointer' }} onClick={() => { setSortCol('status'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  Status {sortCol === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ width: 90, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#0d9488', fontWeight: 600 }}>
                    {r.userId}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700
                      }}>
                        {r.userName.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.userName}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{r.branch}</span>
                      <span style={{ fontSize: 10.5, color: '#64748b' }}>{r.division} Division</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 11.5, color: '#475569' }}>
                    {r.date}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#64748b' }}>
                    {r.shiftEnd}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11.5, fontWeight: 700, color: '#0f766e' }}>
                    {r.actualOut}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                    {r.otDuration}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: r.category.includes('Weekend') ? '#f5f3ff' : (r.category.includes('Emergency') ? '#fff7ed' : '#f1f5f9'),
                      color: r.category.includes('Weekend') ? '#6d28d9' : (r.category.includes('Emergency') ? '#c2410c' : '#334155'),
                      fontWeight: 600
                    }}>
                      {r.category.includes('Weekend') ? '🏦' : (r.category.includes('Emergency') ? '🚨' : '⏱️')}
                      {r.category}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {r.status === 'Approved' ? (
                      <span className="bs-badge bs-badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span className="bs-dot bs-dot-green"></span>
                        Approved
                      </span>
                    ) : r.status === 'Pending' ? (
                      <span className="bs-badge bs-badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span className="bs-dot bs-dot-amber"></span>
                        Pending
                      </span>
                    ) : (
                      <span className="bs-badge bs-badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span className="bs-dot bs-dot-red"></span>
                        Rejected
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setInspectVoucher(r)}
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
                      title="Inspect Overtime Claim Voucher"
                    >
                      Voucher
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedRecords.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 36, color: '#9ca3af' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
                    <div style={{ fontWeight: 600, color: '#475569' }}>No overtime claims matched the selected filter criteria.</div>
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
              Page {currentPage} of {totalPages} · {filteredRecords.length} records
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

      {/* ── Overtime Settlement Voucher Modal ── */}
      {inspectVoucher && (
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
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Overtime Settlement Voucher #{inspectVoucher.id}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Pubali Bank PLC · HR Payroll Reconciliation</div>
              </div>
              <button
                type="button"
                onClick={() => setInspectVoucher(null)}
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
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{inspectVoucher.userName}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>User ID: {inspectVoucher.userId} · Branch: {inspectVoucher.branch}</div>
                </div>
                <div>
                  {inspectVoucher.status === 'Approved' ? (
                    <span className="bs-badge bs-badge-green">Approved</span>
                  ) : inspectVoucher.status === 'Pending' ? (
                    <span className="bs-badge bs-badge-amber">Pending Review</span>
                  ) : (
                    <span className="bs-badge bs-badge-red">Rejected</span>
                  )}
                </div>
              </div>

              {/* Grid detail */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11.5 }}>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>Shift End Time</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2, fontFamily: 'monospace' }}>{inspectVoucher.shiftEnd}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>Actual Punch Out</div>
                  <div style={{ fontWeight: 700, color: '#0f766e', marginTop: 2, fontFamily: 'monospace' }}>{inspectVoucher.actualOut}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>OT Duration</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{inspectVoucher.otDuration} ({inspectVoucher.otMins} mins)</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>OT Category</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{inspectVoucher.category}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>Calculated Compensation</div>
                  <div style={{ fontWeight: 800, color: '#15803d', marginTop: 2, fontSize: 13 }}>BDT ৳{inspectVoucher.compAmount.toLocaleString()} (@ ৳{inspectVoucher.hourlyRate}/hr)</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>Authorizing Officer</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{inspectVoucher.supervisor}</div>
                </div>
              </div>

              {/* Ledger audit hash */}
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 6, border: '1px solid #f1f5f9', fontSize: 11.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Payroll Dispatch Ledger:</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>READY FOR MONTH-END SETTLEMENT</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Cryptographic Audit Hash:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 10.5, color: '#0d9488' }}>{inspectVoucher.ledgerHash}</span>
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
                onClick={() => setInspectVoucher(null)}
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
