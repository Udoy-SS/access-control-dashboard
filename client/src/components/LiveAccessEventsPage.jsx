import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FULL_PUBALI_LOCATIONS, DIVISIONS_LIST } from '../data/pubaliFullBranches';
import { useBankFilters } from './filters/FilterContext';

// ─── AUTH MODES & DOOR TYPES SPECIFICATION ──────────────────
const AUTH_MODES = [
  'Face Recognition (BioStation 3)',
  'Fingerprint (BioEntry W2)',
  'RFID Smart Card + PIN',
  'Fingerprint (BioStation 2)',
  'Dual-Custody Bio+PIN'
];

const DOOR_TYPES = [
  'Main Entrance Speed Gate Turnstile 1',
  'Main Entrance Speed Gate Turnstile 2',
  'Cash Vault Outer Heavy Door',
  'Server Room Airlock Interlock Door',
  'Executive Boardroom Entrance',
  'Staff Banking Hall Ingress'
];

// Initial generator for 150 live events
function generateInitialLiveEvents() {
  const events = [];
  const now = new Date();

  for (let i = 0; i < 150; i++) {
    const loc = FULL_PUBALI_LOCATIONS[i % FULL_PUBALI_LOCATIONS.length];
    const emp = loc.employees && loc.employees[i % loc.employees.length]
      ? loc.employees[i % loc.employees.length]
      : { id: `PB-${10400 + i}`, name: 'Branch Personnel' };

    const isDenied = i % 14 === 0;
    const result = isDenied ? 'Denied' : 'Granted';
    const authMode = AUTH_MODES[i % AUTH_MODES.length];
    const door = DOOR_TYPES[i % DOOR_TYPES.length];

    // Compute realistic declining timestamps
    const evtDate = new Date(now.getTime() - i * 18000);
    const timeStr = evtDate.toTimeString().slice(0, 8);

    const credentialId = isDenied
      ? 'CARD-UNREGISTERED-ERR'
      : (i % 2 === 0 ? `FP-TMP-${emp.id}` : `RFID-04A8B${100 + i}`);

    const denialReason = isDenied
      ? (i % 28 === 0 ? 'Anti-Passback Violation' : 'Unregistered Credential / Timezone Mismatch')
      : null;

    events.push({
      id: `EVT-${Date.now() - i * 1000}-${i}`,
      timestamp: evtDate,
      timeStr,
      userId: emp.id,
      userName: emp.name,
      door,
      branch: loc.name,
      division: loc.division || 'Dhaka',
      authMode,
      credentialId,
      result,
      denialReason,
      confidence: isDenied ? 62.4 : (94.5 + ((i * 7) % 50) / 10).toFixed(1),
      terminalIp: `10.10.${(i % 15) + 1}.${(i % 240) + 10}`,
      terminalModel: authMode.includes('BioStation 3') ? 'Suprema BioStation 3 (BS3-DB)'
        : authMode.includes('BioEntry W2') ? 'Suprema BioEntry W2 (BEW2-OHP)'
        : authMode.includes('BioStation 2') ? 'Suprema BioStation 2 (BS2-OEP)'
        : 'CoreStation CS-40 + XPass 2',
      relayStatus: isDenied ? 'Relay Suppressed' : 'Energized 5000ms',
      antiPassbackStatus: isDenied && i % 28 === 0 ? 'VIOLATION DETECTED' : 'PASSED (Zone Synchronized)',
      auditHash: `SHA256:0x${((i + 1) * 982451653).toString(16).padStart(16, '0')}`
    });
  }

  return events;
}

export default function LiveAccessEventsPage({ onNavigate }) {
  const {
    region: globalRegion,
    branch: globalBranch,
    searchQuery: globalSearch,
    moduleFilters,
    setModuleFilter
  } = useBankFilters();

  // Master event stream
  const [events, setEvents] = useState(() => generateInitialLiveEvents());
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [newPunchesCount, setNewPunchesCount] = useState(0);

  // Local toolbar filter states
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState('All'); // 'All' | 'Granted' | 'Denied'
  const [filterDoor, setFilterDoor] = useState('All');
  const [filterAuthMode, setFilterAuthMode] = useState('All');
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterDivision, setFilterDivision] = useState('All');
  const [filterTimeframe, setFilterTimeframe] = useState('All'); // 'All' | '15m' | '1h' | 'morning' | 'afternoon'

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [sortCol, setSortCol] = useState('timeStr');
  const [sortDir, setSortDir] = useState('desc');

  // Forensic modal state
  const [inspectEvent, setInspectEvent] = useState(null);

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

  // Sync with PageLevelFilterPanel (moduleFilters.eventResult & authMethod)
  useEffect(() => {
    if (moduleFilters?.eventResult && moduleFilters.eventResult !== 'All') {
      setFilterResult(moduleFilters.eventResult);
    }
  }, [moduleFilters?.eventResult]);

  useEffect(() => {
    if (moduleFilters?.authMethod && moduleFilters.authMethod !== 'All') {
      const target = moduleFilters.authMethod.toLowerCase();
      const match = AUTH_MODES.find(m => m.toLowerCase().includes(target));
      if (match) setFilterAuthMode(match);
    }
  }, [moduleFilters?.authMethod]);

  useEffect(() => {
    if (moduleFilters?.portalFilter && moduleFilters.portalFilter !== 'All') {
      const target = moduleFilters.portalFilter.toLowerCase();
      const match = DOOR_TYPES.find(d => d.toLowerCase().includes(target));
      if (match) setFilterDoor(match);
    }
  }, [moduleFilters?.portalFilter]);

  // ── Real-Time Live Push Simulation ────────────────────────
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const loc = FULL_PUBALI_LOCATIONS[Math.floor(Math.random() * FULL_PUBALI_LOCATIONS.length)];
      const emp = loc.employees && loc.employees.length > 0
        ? loc.employees[Math.floor(Math.random() * loc.employees.length)]
        : { id: `PB-${10400 + Math.floor(Math.random() * 500)}`, name: 'Officer Ingress' };

      const isDenied = Math.random() < 0.08;
      const result = isDenied ? 'Denied' : 'Granted';
      const authMode = AUTH_MODES[Math.floor(Math.random() * AUTH_MODES.length)];
      const door = DOOR_TYPES[Math.floor(Math.random() * DOOR_TYPES.length)];
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 8);

      const credentialId = isDenied
        ? 'CARD-UNREGISTERED-ERR'
        : (Math.random() > 0.5 ? `FP-TMP-${emp.id}` : `RFID-04A8B${Math.floor(Math.random() * 900) + 100}`);

      const newEvent = {
        id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: now,
        timeStr,
        userId: emp.id,
        userName: emp.name,
        door,
        branch: loc.name,
        division: loc.division || 'Dhaka',
        authMode,
        credentialId,
        result,
        denialReason: isDenied ? 'Anti-Passback Violation or Invalid Profile' : null,
        confidence: isDenied ? 58.2 : (95.0 + Math.random() * 4.9).toFixed(1),
        terminalIp: `10.10.${Math.floor(Math.random() * 20) + 1}.${Math.floor(Math.random() * 240) + 10}`,
        terminalModel: authMode.includes('BioStation 3') ? 'Suprema BioStation 3 (BS3-DB)'
          : authMode.includes('BioEntry W2') ? 'Suprema BioEntry W2 (BEW2-OHP)'
          : 'CoreStation CS-40 + XPass 2',
        relayStatus: isDenied ? 'Relay Suppressed' : 'Energized 5000ms',
        antiPassbackStatus: isDenied ? 'VIOLATION DETECTED' : 'PASSED (Zone Synchronized)',
        auditHash: `SHA256:0x${Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(16, '0')}`,
        isFresh: true
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 199)]);
      setNewPunchesCount(c => c + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // ── Extract Dynamic Filter Options from Data ──────────────
  const doorOptions = useMemo(() => {
    const s = new Set();
    events.forEach(e => { if (e.door) s.add(e.door); });
    return Array.from(s).sort();
  }, [events]);

  const authOptions = useMemo(() => {
    const s = new Set();
    events.forEach(e => { if (e.authMode) s.add(e.authMode); });
    return Array.from(s).sort();
  }, [events]);

  const branchOptions = useMemo(() => {
    const s = new Set();
    events.forEach(e => { if (e.branch) s.add(e.branch); });
    return Array.from(s).sort();
  }, [events]);

  const divisionOptions = useMemo(() => {
    const s = new Set();
    events.forEach(e => { if (e.division) s.add(e.division); });
    return Array.from(s).sort();
  }, [events]);

  // ── Check if Any Filter is Active ─────────────────────────
  const isFiltered = Boolean(
    search.trim() ||
    filterResult !== 'All' ||
    filterDoor !== 'All' ||
    filterAuthMode !== 'All' ||
    filterBranch !== 'All' ||
    filterDivision !== 'All' ||
    filterTimeframe !== 'All'
  );

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setFilterResult('All');
    setFilterDoor('All');
    setFilterAuthMode('All');
    setFilterBranch('All');
    setFilterDivision('All');
    setFilterTimeframe('All');
    setCurrentPage(1);
    if (setModuleFilter) {
      setModuleFilter('eventResult', 'All');
      setModuleFilter('authMethod', 'All');
    }
  }, [setModuleFilter]);

  // ── Unified Filtering & Sorting Pipeline ──────────────────
  const filteredEvents = useMemo(() => {
    let list = events;

    // 1. Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.userId.toLowerCase().includes(q) ||
        e.userName.toLowerCase().includes(q) ||
        e.door.toLowerCase().includes(q) ||
        e.branch.toLowerCase().includes(q) ||
        e.authMode.toLowerCase().includes(q) ||
        e.credentialId.toLowerCase().includes(q)
      );
    }

    // 2. Result Filter
    if (filterResult !== 'All') {
      list = list.filter(e => e.result.toLowerCase() === filterResult.toLowerCase());
    }

    // 3. Door / Portal Filter
    if (filterDoor !== 'All') {
      list = list.filter(e => e.door === filterDoor);
    }

    // 4. Auth Mode Filter
    if (filterAuthMode !== 'All') {
      list = list.filter(e => e.authMode === filterAuthMode);
    }

    // 5. Branch Location Filter
    if (filterBranch !== 'All') {
      list = list.filter(e => e.branch.toLowerCase() === filterBranch.toLowerCase());
    }

    // 6. Division / Region Filter
    if (filterDivision !== 'All') {
      list = list.filter(e => e.division.toLowerCase() === filterDivision.toLowerCase());
    }

    // 7. Timeframe
    if (filterTimeframe !== 'All') {
      const now = new Date().getTime();
      if (filterTimeframe === '15m') {
        list = list.filter(e => (now - e.timestamp.getTime()) <= 15 * 60 * 1000);
      } else if (filterTimeframe === '1h') {
        list = list.filter(e => (now - e.timestamp.getTime()) <= 60 * 60 * 1000);
      } else if (filterTimeframe === 'morning') {
        list = list.filter(e => {
          const h = e.timestamp.getHours();
          return h >= 8 && h < 12;
        });
      } else if (filterTimeframe === 'afternoon') {
        list = list.filter(e => {
          const h = e.timestamp.getHours();
          return h >= 12 && h < 18;
        });
      }
    }

    // 8. Sorting
    return [...list].sort((a, b) => {
      let va = a[sortCol];
      let vb = b[sortCol];
      if (sortCol === 'timeStr') {
        va = a.timestamp.getTime();
        vb = b.timestamp.getTime();
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [events, search, filterResult, filterDoor, filterAuthMode, filterBranch, filterDivision, filterTimeframe, sortCol, sortDir]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterResult, filterDoor, filterAuthMode, filterBranch, filterDivision, filterTimeframe]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  // Counts for quick pills
  const counts = useMemo(() => {
    let granted = 0;
    let denied = 0;
    events.forEach(e => {
      if (e.result === 'Granted') granted++;
      if (e.result === 'Denied') denied++;
    });
    return { total: events.length, granted, denied };
  }, [events]);

  // ── CSV Export Handler ────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['Event Time', 'User ID', 'Employee / Visitor Name', 'Access Portal / Door', 'Branch Location', 'Division', 'Authentication Mode', 'Credential ID', 'Event Result', 'Confidence Score %', 'Terminal IP', 'Relay Action'];
    const rows = filteredEvents.map(e => [
      `"${e.timeStr}"`,
      `"${e.userId}"`,
      `"${e.userName.replace(/"/g, '""')}"`,
      `"${e.door.replace(/"/g, '""')}"`,
      `"${e.branch.replace(/"/g, '""')}"`,
      `"${e.division}"`,
      `"${e.authMode}"`,
      `"${e.credentialId}"`,
      `"${e.result}"`,
      `"${e.confidence}"`,
      `"${e.terminalIp}"`,
      `"${e.relayStatus}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pubali-live-access-events-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Dynamic KPI calculations synchronized with filteredEvents
  const dynamicKpis = useMemo(() => {
    const total = filteredEvents.length;
    const granted = filteredEvents.filter(e => e.result === 'Granted').length;
    const denied = filteredEvents.filter(e => e.result === 'Denied').length;
    const grantRate = total > 0 ? ((granted / total) * 100).toFixed(1) : '100.0';
    const vaultDual = filteredEvents.filter(e => (e.door && e.door.toLowerCase().includes('vault')) || (e.authMode && e.authMode.toLowerCase().includes('dual'))).length;
    const locationsCount = new Set(filteredEvents.map(e => e.branch)).size;

    return [
      { label: 'Filtered Events', value: `${total.toLocaleString()} Pushes`, sub: `Across ${locationsCount} Location${locationsCount !== 1 ? 's' : ''}`, color: '#3b82f6' },
      { label: 'Access Granted Rate', value: `${grantRate}%`, sub: `${granted.toLocaleString()} Authorized ingress`, color: '#10b981' },
      { label: 'Access Denied', value: `${denied.toLocaleString()} Events`, sub: 'Unregistered / Timezone mismatch', color: '#ef4444' },
      { label: 'Dual-Custody Vault Entries', value: `${vaultDual.toLocaleString()} Accesses`, sub: 'Two-custodian verified', color: '#7c3aed' },
      { label: 'Throughput', value: `${Math.min(60, Math.max(1, Math.round(total / 3)))} Entries/min`, sub: 'Ingress Portals Stream', color: '#0d9488' }
    ];
  }, [filteredEvents]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── Top Real-Time Status & Streaming Banner ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: isLiveStreaming ? '#f0fdf4' : '#f8fafc',
            border: `1px solid ${isLiveStreaming ? '#86efac' : '#cbd5e1'}`,
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 11.5,
            fontWeight: 700,
            color: isLiveStreaming ? '#15803d' : '#64748b'
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isLiveStreaming ? '#22c55e' : '#94a3b8',
              boxShadow: isLiveStreaming ? '0 0 8px rgba(34,197,94,0.6)' : 'none',
              animation: isLiveStreaming ? 'pulse 2s infinite' : 'none'
            }} />
            {isLiveStreaming ? 'LIVE PUSH STREAM ACTIVE' : 'STREAM PAUSED'}
          </span>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            BioStar 2 Enterprise Gateway (10.10.20.15:443) · Latency <strong>14ms</strong> · Buffer <strong>99.9% OK</strong>
          </span>
          {newPunchesCount > 0 && (
            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
              +{newPunchesCount} live ingested
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="bs-btn bs-btn-outline bs-btn-sm"
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11.5,
              fontWeight: 600,
              background: isLiveStreaming ? '#fff7ed' : '#f0fdf4',
              borderColor: isLiveStreaming ? '#fdba74' : '#86efac',
              color: isLiveStreaming ? '#c2410c' : '#15803d'
            }}
          >
            {isLiveStreaming ? 'Pause Feed' : 'Resume Live Stream'}
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {dynamicKpis.map((k, idx) => (
          <div key={idx} style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
            flex: '1 1 180px', minWidth: 160, boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
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
            <span className="bs-card-header-title">Live Access Control & Biometric Event Stream</span>
            <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>
              Real-time nationwide credentials stream across turnstiles, main gates, cash vaults, and server rooms
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
          {/* 1. Quick Result Filter Pills */}
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 2, borderRadius: 6 }}>
            <button
              type="button"
              onClick={() => { setFilterResult('All'); if (setModuleFilter) setModuleFilter('eventResult', 'All'); }}
              style={{
                border: 'none',
                background: filterResult === 'All' ? '#ffffff' : 'transparent',
                color: filterResult === 'All' ? '#0f172a' : '#64748b',
                fontWeight: filterResult === 'All' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterResult === 'All' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              All Results ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => { setFilterResult('Granted'); if (setModuleFilter) setModuleFilter('eventResult', 'Granted'); }}
              style={{
                border: 'none',
                background: filterResult === 'Granted' ? '#10b981' : 'transparent',
                color: filterResult === 'Granted' ? '#ffffff' : '#059669',
                fontWeight: filterResult === 'Granted' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterResult === 'Granted' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none'
              }}
            >
              Granted ({counts.granted})
            </button>
            <button
              type="button"
              onClick={() => { setFilterResult('Denied'); if (setModuleFilter) setModuleFilter('eventResult', 'Denied'); }}
              style={{
                border: 'none',
                background: filterResult === 'Denied' ? '#ef4444' : 'transparent',
                color: filterResult === 'Denied' ? '#ffffff' : '#dc2626',
                fontWeight: filterResult === 'Denied' ? 700 : 500,
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: filterResult === 'Denied' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none'
              }}
            >
              Denied ({counts.denied})
            </button>
          </div>

          {/* 2. Live Search Box */}
          <div style={{ position: 'relative', width: 220, minWidth: 170 }}>
            <input
              className="bs-input"
              style={{ width: '100%', paddingLeft: 28, height: 32, fontSize: 12 }}
              placeholder="Search user, door, branch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" style={{ position: 'absolute', left: 9, top: 9, color: '#9ca3af' }}>
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </div>

          {/* 3. Door / Portal Filter Dropdown */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 160,
              cursor: 'pointer',
              borderColor: filterDoor !== 'All' ? '#0d9488' : '#e2e8f0',
              background: filterDoor !== 'All' ? '#f0fdf4' : '#ffffff',
              fontWeight: filterDoor !== 'All' ? 600 : 400
            }}
            value={filterDoor}
            onChange={e => setFilterDoor(e.target.value)}
            aria-label="Filter by Door or Portal"
          >
            <option value="All">All Doors & Portals ({doorOptions.length})</option>
            {doorOptions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* 4. Auth Mode Filter Dropdown */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 160,
              cursor: 'pointer',
              borderColor: filterAuthMode !== 'All' ? '#0d9488' : '#e2e8f0',
              background: filterAuthMode !== 'All' ? '#f0fdf4' : '#ffffff',
              fontWeight: filterAuthMode !== 'All' ? 600 : 400
            }}
            value={filterAuthMode}
            onChange={e => {
              setFilterAuthMode(e.target.value);
              if (setModuleFilter) setModuleFilter('authMethod', e.target.value === 'All' ? 'All' : e.target.value);
            }}
            aria-label="Filter by Authentication Mode"
          >
            <option value="All">All Auth Modes ({authOptions.length})</option>
            {authOptions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
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
            <option value="All">All Divisions ({divisionOptions.length})</option>
            {divisionOptions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* 7. Timeframe Window Filter */}
          <select
            className="bs-select"
            style={{
              height: 32,
              fontSize: 12,
              minWidth: 135,
              cursor: 'pointer',
              borderColor: filterTimeframe !== 'All' ? '#0d9488' : '#e2e8f0',
              background: filterTimeframe !== 'All' ? '#f0fdf4' : '#ffffff',
              fontWeight: filterTimeframe !== 'All' ? 600 : 400
            }}
            value={filterTimeframe}
            onChange={e => setFilterTimeframe(e.target.value)}
            aria-label="Filter by Timeframe"
          >
            <option value="All">All Time Window</option>
            <option value="15m">Last 15 Minutes</option>
            <option value="1h">Last 1 Hour</option>
            <option value="morning">Morning Ingress (08:00 - 12:00)</option>
            <option value="afternoon">Afternoon Ingress (12:00 - 18:00)</option>
          </select>

          {/* 8. Reset Button */}
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

          {/* 9. Records Count Badge */}
          <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Showing <strong style={{ color: '#0f172a' }}>{filteredEvents.length}</strong> of {events.length}</span>
            {isFiltered && (
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: 4, fontSize: 10.5, fontWeight: 700 }}>
                Filtered
              </span>
            )}
          </div>

          {/* 10. Export CSV Button */}
          <button
            type="button"
            className="bs-btn bs-btn-outline bs-btn-sm"
            onClick={handleExportCSV}
            style={{ marginLeft: 'auto', height: 32, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            Export CSV ({filteredEvents.length})
          </button>
        </div>

        {/* ── Table View ── */}
        <div style={{ overflowX: 'auto' }}>
          <table className="bs-table">
            <thead>
              <tr>
                <th style={{ width: 105, cursor: 'pointer' }} onClick={() => { setSortCol('timeStr'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  Event Time {sortCol === 'timeStr' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ width: 95 }}>User ID</th>
                <th style={{ minWidth: 160, cursor: 'pointer' }} onClick={() => { setSortCol('userName'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  Employee / Visitor {sortCol === 'userName' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ minWidth: 190, cursor: 'pointer' }} onClick={() => { setSortCol('door'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  Access Portal / Door {sortCol === 'door' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ minWidth: 160 }}>Branch Location</th>
                <th style={{ minWidth: 160 }}>Authentication Mode</th>
                <th style={{ minWidth: 130 }}>Credential ID</th>
                <th style={{ width: 100, cursor: 'pointer' }} onClick={() => { setSortCol('result'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  Result {sortCol === 'result' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ width: 80, textAlign: 'center' }}>Forensic</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => setInspectEvent(evt)}
                  title={`Click to view detailed biometric forensics & access pathway for ${evt.userName}`}
                  style={{
                    background: evt.isFresh ? '#f0fdf4' : (evt.result === 'Denied' ? '#fff8f8' : 'inherit'),
                    borderLeft: evt.result === 'Denied' ? '3px solid #dc2626' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = evt.result === 'Denied' ? '#fee2e2' : '#f0fdf4'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = evt.isFresh ? '#f0fdf4' : (evt.result === 'Denied' ? '#fff8f8' : 'inherit'); }}
                >
                  {/* Event Time */}
                  <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span>{evt.timeStr}</span>
                      {evt.isFresh && (
                        <span style={{ fontSize: 9, background: '#22c55e', color: '#fff', padding: '1px 4px', borderRadius: 3, fontWeight: 700 }}>
                          LIVE
                        </span>
                      )}
                    </div>
                  </td>

                  {/* User ID */}
                  <td style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#0d9488', fontWeight: 600 }}>
                    {evt.userId}
                  </td>

                  {/* Employee Name */}
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
                        {evt.userName.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600, color: '#0d9488' }}>{evt.userName}</span>
                    </div>
                  </td>

                  {/* Door / Portal */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, color: '#334155' }}>{evt.door}</span>
                    </div>
                  </td>

                  {/* Branch Location */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{evt.branch}</span>
                      <span style={{ fontSize: 10.5, color: '#64748b' }}>{evt.division} Division</span>
                    </div>
                  </td>

                  {/* Auth Mode */}
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: evt.authMode.includes('Face') ? '#f5f3ff'
                        : evt.authMode.includes('Dual-Custody') ? '#fef3c7'
                        : '#f1f5f9',
                      color: evt.authMode.includes('Face') ? '#6d28d9'
                        : evt.authMode.includes('Dual-Custody') ? '#92400e'
                        : '#334155',
                      fontWeight: 600
                    }}>
                      {evt.authMode}
                    </span>
                  </td>

                  {/* Credential ID */}
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: evt.result === 'Denied' ? '#dc2626' : '#64748b' }}>
                    {evt.credentialId}
                  </td>

                  {/* Result */}
                  <td>
                    {evt.result === 'Granted' ? (
                      <span className="bs-badge bs-badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span className="bs-dot bs-dot-green"></span>
                        Granted
                      </span>
                    ) : (
                      <span className="bs-badge bs-badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }} title={evt.denialReason || 'Access Denied'}>
                        <span className="bs-dot bs-dot-red"></span>
                        Denied
                      </span>
                    )}
                  </td>

                  {/* Action / Inspect */}
                  <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setInspectEvent(evt)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        padding: '3px 8px',
                        fontSize: 11,
                        color: '#0d9488',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title="Inspect Suprema BioStar Forensic Payload"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedEvents.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 36, color: '#9ca3af' }}>
                    <div style={{ fontWeight: 600, color: '#475569' }}>No events matched the selected filter criteria.</div>
                    <div style={{ fontSize: 11.5, marginTop: 4 }}>Try clearing search or relaxing the door, auth mode, or result filters.</div>
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
              Page {currentPage} of {totalPages} · {filteredEvents.length} records
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

      {/* ── Suprema BioStar Forensic Verification Modal ── */}
      {inspectEvent && (
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
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>Suprema BioStar 2 Forensic Packet</span>
              </div>
              <button
                type="button"
                onClick={() => setInspectEvent(null)}
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
              {/* Identity Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{inspectEvent.userName}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>User ID: {inspectEvent.userId} · Branch: {inspectEvent.branch}</div>
                </div>
                <div>
                  {inspectEvent.result === 'Granted' ? (
                    <span className="bs-badge bs-badge-green">Granted</span>
                  ) : (
                    <span className="bs-badge bs-badge-red">Denied</span>
                  )}
                </div>
              </div>

              {/* Grid Properties */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11.5 }}>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>Access Portal</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{inspectEvent.door}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>Timestamp</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2, fontFamily: 'monospace' }}>{inspectEvent.timeStr} (UTC+6)</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>Device Model</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{inspectEvent.terminalModel}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>Terminal IP</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2, fontFamily: 'monospace' }}>{inspectEvent.terminalIp}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>Biometric Confidence</div>
                  <div style={{ fontWeight: 700, color: inspectEvent.confidence > 90 ? '#10b981' : '#ef4444', marginTop: 2 }}>
                    {inspectEvent.confidence}% Match
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 6, border: '1px solid #f1f5f9' }}>
                  <div style={{ color: '#64748b', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>Relay Status</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{inspectEvent.relayStatus}</div>
                </div>
              </div>

              {/* Anti-Passback & Audit Trail */}
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 6, border: '1px solid #f1f5f9', fontSize: 11.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Anti-Passback (APB) State:</span>
                  <span style={{ fontWeight: 700, color: inspectEvent.antiPassbackStatus.includes('VIOLATION') ? '#ef4444' : '#10b981' }}>
                    {inspectEvent.antiPassbackStatus}
                  </span>
                </div>
                {inspectEvent.denialReason && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#dc2626' }}>
                    <span style={{ fontWeight: 600 }}>Denial Diagnostics:</span>
                    <span>{inspectEvent.denialReason}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Ledger Audit Integrity:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 10.5, color: '#0d9488' }}>{inspectEvent.auditHash}</span>
                </div>
              </div>

              {/* Physical Pathway Sequence */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px', background: '#ffffff' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                  Physical Ingress & Relay Pathway
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Step 1 */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', background: '#0284c7', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 800, flexShrink: 0
                    }}>
                      1
                    </div>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b' }}>
                        Biometric Terminal Presentation
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        Credential presented at {inspectEvent.terminalModel} (IP: {inspectEvent.terminalIp}) at {inspectEvent.timeStr} (UTC+6).
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', background: inspectEvent.result === 'Denied' ? '#dc2626' : '#0d9488', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 800, flexShrink: 0
                    }}>
                      2
                    </div>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b' }}>
                        Anti-Passback & Policy Verification
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        Anti-passback state: <strong>{inspectEvent.antiPassbackStatus}</strong>. Policy schedules and group permissions verified across BioStar database.
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', background: inspectEvent.result === 'Denied' ? '#991b1b' : '#16a34a', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 800, flexShrink: 0
                    }}>
                      3
                    </div>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b' }}>
                        {inspectEvent.result === 'Denied' ? 'Relay Suppression & Alarm Dispatch' : 'Controller Relay Pulse & Strike Release'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        Relay state: <strong>{inspectEvent.relayStatus}</strong>. Cryptographic hash recorded: <code style={{ fontSize: 10, color: '#0d9488' }}>{inspectEvent.auditHash}</code>.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regulatory Compliance Safeguards */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                  Regulatory & Compliance Verification
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 6, fontSize: 10.5, color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Bangladesh Bank ICT-08
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Suprema Encrypted Session
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Anti-Passback Hard Validation
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> SHA-256 Ledger Signed
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              padding: '12px 18px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              background: '#f8fafc'
            }}>
              <button
                type="button"
                className="bs-btn bs-btn-outline bs-btn-sm"
                onClick={() => setInspectEvent(null)}
                style={{ padding: '6px 16px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
              >
                Close Packet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
