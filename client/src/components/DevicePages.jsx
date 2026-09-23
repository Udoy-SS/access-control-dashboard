/**
 * DevicePages.jsx — BioStar 2-style compact filter bars
 * DeviceListPage / DeviceStatusPage / ActiveDevicePage / InactiveDevicePage
 */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FULL_PUBALI_LOCATIONS } from '../data/pubaliFullBranches';
import { useBankFilters } from './filters/FilterContext';
import { TableColumnFilter } from './filters';

// ─── CONSTANTS ────────────────────────────────────────────────
const MODELS = ['All Models', 'CoreStation CS-40', 'BioStation 3', 'FaceStation F2', 'BioEntry W2', 'BioEntry P2', 'BioLite N2', 'X-Pass 2', 'BioStation 2'];
const ZONES  = ['All Zones', 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'];
const FW     = ['All Firmware', 'v1.4.2_2408', 'v1.3.9_2406', 'v1.5.0_2409', 'v1.2.8_2401'];
const AUTH   = ['All Auth Modes', 'Fingerprint + Card', 'Card Only', 'Fingerprint Only', 'PIN + Card'];

// ─── OFFLINE META HELPERS ────────────────────────────────────
const OFFLINE_DURATIONS = ['45m', '1h 20m', '2h 05m', '3h 40m', '5h 10m', '8h 30m', '12h 00m', '1d 2h', '2d 6h', '4d 18h'];
const LAST_ONLINE_OFFSETS = ['Today 08:14', 'Today 06:52', 'Yesterday 22:31', 'Yesterday 18:45', 'Sep 12, 14:30', 'Sep 11, 09:15', 'Sep 10, 17:20', 'Sep 08, 11:00', 'Sep 05, 08:47', 'Sep 01, 16:30'];
const ASSIGNED_TECHS = [
  'Md. Kamal Hossain', 'Nasrin Akter (IT)', 'Abdul Karim', 'Rina Islam (IT)',
  'Monirul Haque', 'Shafiqul Islam', 'Tahmina Begum', 'Imran Hossain (SOC)',
  'Unassigned', 'Rezaul Alam'
];
const FAULT_TYPES = [
  'Network Gateway Timeout', 'LAN Port Failure', 'Power Supply Fault',
  'Tamper Switch Alert', 'Firmware Crash', 'Server Certificate Expired',
  'RS-485 Communication Error', 'Reader Hardware Fault'
];

// ─── BUILD DATA ───────────────────────────────────────────────
function buildAllDevices() {
  const rows = [];

  // 1. 520 CoreStation Master Intelligent Controllers (CS-40) — 100% Online (520 / 520)
  FULL_PUBALI_LOCATIONS.slice(0, 520).forEach((loc, idx) => {
    rows.push({
      id: `CTRL-${loc.code || String(100 + idx).padStart(4, '0')}-CS40`,
      name: `${loc.name} - Master Central ACU (CoreStation CS-40)`,
      model: 'CoreStation CS-40',
      serial: `PB-CS${String(10000 + idx + 1).padStart(5, '0')}`,
      ip: `192.168.${5 + (idx % 200)}.1`,
      branch: loc.name,
      zone: loc.zone || loc.division || 'Dhaka',
      division: loc.division || 'Dhaka',
      firmware: 'v1.5.0_2409',
      status: 'Online',
      pingMs: 6 + (idx % 8),
      heartbeat: 'Just now',
      authMode: 'Multi-Door Intelligent Controller Hub',
      tamper: 'Normal',
      fault: null,
      manager: loc.manager || '—',
      lastOnline: 'Just now',
      offlineDuration: null,
      assignedTech: 'NOC / SOC Core Admin',
    });
  });

  // 2. 1,658 Biometric Terminals across 829 branches (1,624 Online, 34 Offline)
  let devCounter = 1;
  let offlineAssigned = 0;

  FULL_PUBALI_LOCATIONS.forEach((loc, locIdx) => {
    // Each branch has exactly 2 biometric terminals: 1 Entrance, 1 Vault/Secure Chamber
    // 829 branches * 2 = 1,658 Total Biometric Terminals
    const devConfigs = [
      {
        suffix: '01',
        role: 'Entrance Biometric Reader',
        model: ['BioStation 3', 'FaceStation F2', 'BioEntry W2'][locIdx % 3],
        ipThird: 10 + (locIdx % 200)
      },
      {
        suffix: '02',
        role: 'Cash Vault / Secure Chamber Reader',
        model: ['BioEntry W2', 'BioEntry P2', 'X-Pass 2', 'BioStation 2'][locIdx % 4],
        ipThird: 20 + (locIdx % 200)
      }
    ];

    devConfigs.forEach((cfg, idx) => {
      // Exactly 34 devices are Offline / Routine Maintenance (distributed across branches for realism)
      const isOffline = offlineAssigned < 34 && ((locIdx * 2 + idx) % 48 === 7);
      if (isOffline) offlineAssigned++;

      const status = isOffline ? 'Offline' : 'Online';
      const devId = `DEV-${(loc.code || String(locIdx + 100).padStart(4, '0'))}-${cfg.suffix}`;
      const pingMs = status === 'Offline' ? null : 8 + ((devCounter * 7) % 28);
      const heartbeat = status === 'Online' ? ['Just now', '1m ago', '2m ago', '5m ago'][devCounter % 4] : '2h ago';
      const authMode = AUTH[1 + ((locIdx + idx) % (AUTH.length - 1))];
      const firmware = FW[1 + ((locIdx + idx) % (FW.length - 1))];
      const tamper = status === 'Offline' ? 'Alert' : 'Normal';
      const serial = `PB-SN${String(30000 + devCounter).padStart(5, '0')}`;
      
      const inactiveIdx = devCounter % OFFLINE_DURATIONS.length;
      const lastOnline = status !== 'Online' ? LAST_ONLINE_OFFSETS[inactiveIdx] : heartbeat;
      const offlineDuration = status !== 'Online' ? OFFLINE_DURATIONS[inactiveIdx] : null;
      const assignedTech = status !== 'Online' ? ASSIGNED_TECHS[devCounter % ASSIGNED_TECHS.length] : null;
      const faultType = status !== 'Online' ? FAULT_TYPES[devCounter % FAULT_TYPES.length] : null;

      rows.push({
        id: devId,
        name: `${loc.name} - ${cfg.role}`,
        model: cfg.model,
        serial,
        ip: `192.168.${cfg.ipThird}.${10 + (idx * 5)}`,
        branch: loc.name,
        zone: loc.zone || loc.division || 'Dhaka',
        division: loc.division || 'Dhaka',
        firmware,
        status,
        pingMs,
        heartbeat,
        authMode,
        tamper,
        fault: faultType,
        manager: loc.manager || '—',
        lastOnline,
        offlineDuration,
        assignedTech,
      });

      devCounter++;
    });
  });

  // Guarantee exactly 34 offline records among terminals
  while (offlineAssigned < 34) {
    const targetIdx = 520 + (offlineAssigned * 45);
    const target = rows[targetIdx];
    if (target && target.status === 'Online') {
      target.status = 'Offline';
      target.tamper = 'Alert';
      target.pingMs = null;
      target.fault = FAULT_TYPES[offlineAssigned % FAULT_TYPES.length];
      target.assignedTech = ASSIGNED_TECHS[offlineAssigned % ASSIGNED_TECHS.length];
      target.offlineDuration = OFFLINE_DURATIONS[offlineAssigned % OFFLINE_DURATIONS.length];
      target.lastOnline = LAST_ONLINE_OFFSETS[offlineAssigned % LAST_ONLINE_OFFSETS.length];
      offlineAssigned++;
    } else {
      break;
    }
  }

  return rows;
}

// ─── SHARED MICRO-COMPONENTS ──────────────────────────────────
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
        flex: '1 1 145px',
        minWidth: 145,
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

function StatusPill({ status }) {
  const cfg = {
    Online:  { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
    Offline: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
    'Sync Issue': { bg: '#fef9c3', color: '#92400e', dot: '#f59e0b' },
    Normal:  { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
    Warning: { bg: '#fef9c3', color: '#92400e', dot: '#f59e0b' },
    Alert:   { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
  };
  const s = cfg[status] || { bg: '#f3f4f6', color: '#4b5563', dot: '#9ca3af' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 12 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />{status}
    </span>
  );
}

function ModelTag({ model }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0f9ff', color: '#0369a1', fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 4, border: '1px solid #bae6fd' }}>
      📟 {model}
    </span>
  );
}

function PaginationBar({ currentPage, totalPages, setPage, count }) {
  if (count === 0) return null;
  return (
    <div style={{ padding: '10px 16px', borderTop: '1px solid #e5e7eb', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: '#6b7280' }}>Page {currentPage} of {totalPages} · {count.toLocaleString()} total records</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {[['«', () => setPage(1)], ['‹', () => setPage(p => Math.max(1, p - 1))], ['›', () => setPage(p => Math.min(totalPages, p + 1))], ['»', () => setPage(totalPages)]].map(([lbl, fn], i) => {
          const disabled = (i < 2 && currentPage === 1) || (i >= 2 && currentPage === totalPages);
          return (
            <button key={i} onClick={fn} disabled={disabled} style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #e2e8f0', background: disabled ? '#f8fafc' : '#fff', color: disabled ? '#d1d5db' : '#374151', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{lbl}</button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ onReset, icon = '🔍', msg = 'No records match your filters' }) {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{msg}</div>
      <button className="bs-btn bs-btn-outline bs-btn-sm" onClick={onReset} style={{ marginTop: 14 }}>Reset Filters</button>
    </div>
  );
}

function useDeviceFilter(allRows, filterFn, sortCol, sortDir) {
  const filtered = useMemo(() => {
    let list = filterFn(allRows);
    if (sortCol && sortDir) {
      list = [...list].sort((a, b) => {
        let valA = a[sortCol] ?? '';
        let valB = b[sortCol] ?? '';
        if (sortCol === 'ping' || sortCol === 'pingms') {
          valA = a.pingMs ?? -1;
          valB = b.pingMs ?? -1;
        } else if (sortCol === 'model') {
          valA = a.model || '';
          valB = b.model || '';
        } else if (sortCol === 'branch' || sortCol === 'branchlocation') {
          valA = a.branch || '';
          valB = b.branch || '';
        } else if (sortCol === 'zone') {
          valA = a.zone || '';
          valB = b.zone || '';
        } else if (sortCol === 'status') {
          valA = a.status || '';
          valB = b.status || '';
        } else if (sortCol === 'deviceid' || sortCol === 'id') {
          valA = a.id || '';
          valB = b.id || '';
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDir === 'asc' ? valA - valB : valB - valA;
        }
        const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return list;
  }, [allRows, filterFn, sortCol, sortDir]);

  const [page, setPage] = useState(1);
  const PAGE = 30;
  useEffect(() => setPage(1), [filtered]);
  const totalPages = Math.ceil(filtered.length / PAGE) || 1;
  const pageRows = useMemo(() => filtered.slice((page - 1) * PAGE, page * PAGE), [filtered, page]);
  return { filtered, pageRows, page, setPage, totalPages };
}

function exportCsv(header, body, name) {
  const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

// ─── COMPACT FILTER BAR (BioStar 2 style) ────────────────────
/**
 * Renders a single-row compact filter bar.
 * children = array of filter controls (selects, inputs, pill groups)
 * accent   = theme color
 * count    = filtered record count
 * onReset  = reset handler
 * onExport = export handler
 * exportGradient = button gradient
 */
function CompactFilterBar({ children, accent, count, onReset, onExport, exportGradient }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        padding: '0 4px', minHeight: 52, flexWrap: 'wrap'
      }}>
        {/* Search icon indicator */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', color: accent, flexShrink: 0 }}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
          </svg>
        </div>

        {/* Filter controls injected as children */}
        {React.Children.map(children, (child, i) => child && (
          <React.Fragment key={i}>
            {child}
            {i < React.Children.count(children) - 1 && (
              <div style={{ width: 1, height: 28, background: '#e5e7eb', flexShrink: 0, margin: '0 2px' }} />
            )}
          </React.Fragment>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Count badge */}
        <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', padding: '0 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {count.toLocaleString()} records
        </span>

        <div style={{ width: 1, height: 28, background: '#e5e7eb', flexShrink: 0 }} />

        {/* Reset */}
        <button onClick={onReset} style={{
          margin: '0 4px', padding: '5px 12px', fontSize: 11.5, fontWeight: 600,
          background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
          borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5,
          transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#374151'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280'; }}>
          ↺ Reset
        </button>

        {/* Export */}
        <button onClick={onExport} style={{
          margin: '6px 8px 6px 2px', padding: '6px 14px', fontSize: 11.5, fontWeight: 700,
          background: exportGradient, border: 'none', color: '#fff', cursor: 'pointer',
          borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5,
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)', whiteSpace: 'nowrap', flexShrink: 0
        }}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
          Export CSV
        </button>
      </div>
    </div>
  );
}

// Compact select for use inside CompactFilterBar
function CSelect({ value, onChange, options, width = 140, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      margin: '0 4px', height: 32, padding: '0 8px', fontSize: 12, fontWeight: value === options[0] ? 400 : 600,
      border: 'none', outline: 'none', background: 'transparent',
      color: value === options[0] ? '#9ca3af' : '#1e293b',
      cursor: 'pointer', minWidth: width, maxWidth: width,
      appearance: 'auto', borderRadius: 4
    }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

// Compact search for use inside CompactFilterBar
function CSearch({ value, onChange, placeholder = 'Search...', width = 220 }) {
  return (
    <div style={{ position: 'relative', margin: '0 4px', flexShrink: 0 }}>
      <input
        style={{
          height: 32, width, padding: '0 28px 0 10px', fontSize: 12,
          border: 'none', outline: 'none', background: 'transparent',
          color: '#1e293b', borderRadius: 4
        }}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button onClick={() => onChange('')} style={{
          position: 'absolute', right: 4, top: 7, background: 'none',
          border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 14, lineHeight: 1, padding: 0
        }}>✕</button>
      )}
    </div>
  );
}

// Status chip row for inside CompactFilterBar
function CChips({ value, onChange, options, colorMap }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', margin: '0 6px', flexShrink: 0 }}>
      {options.map(o => {
        const active = value === o;
        const clr = colorMap[o] || '#6b7280';
        return (
          <button key={o} onClick={() => onChange(o)} style={{
            padding: '3px 10px', fontSize: 11, borderRadius: 20, cursor: 'pointer',
            fontWeight: active ? 700 : 400,
            border: active ? `1.5px solid ${clr}` : '1.5px solid transparent',
            background: active ? clr + '15' : 'transparent',
            color: active ? clr : '#9ca3af',
            transition: 'all 0.12s', whiteSpace: 'nowrap'
          }}>{o}</button>
        );
      })}
    </div>
  );
}

// Table container shell
function TableShell({ headerBg, headerBorder, headerColor, columns, children, filtered, page, onReset, label, badge, badgeBg, badgeColor, sortCol, sortDir, onSortChange }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', background: headerBg, borderBottom: `2px solid ${headerBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{label}</span>
          <span style={{ background: badgeBg, color: badgeColor, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>{badge}</span>
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          {filtered.length > 0 ? `${(page-1)*30+1}–${Math.min(page*30, filtered.length)} of ${filtered.length}` : '0 records'}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: headerBg, borderBottom: `2px solid ${headerBorder}` }}>
              <th style={{ padding: '9px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 800, color: headerColor, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>#</th>
              {columns.map(col => {
                const colLabel = typeof col === 'string' ? col : col.label;
                const colKey = typeof col === 'string' ? col.toLowerCase().replace(/[^a-z0-9]/g, '') : col.key;
                return (
                  <th key={colKey} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 800, color: headerColor, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    <span>{colLabel}</span>
                    <TableColumnFilter
                      columnKey={colKey}
                      title={colLabel}
                      currentSort={{ columnKey: sortCol, direction: sortDir }}
                      onSortChange={(dir) => onSortChange && onSortChange(colKey, dir)}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {filtered.length === 0 && <EmptyState onReset={onReset} />}
    </div>
  );
}

// Page header banner
function PageHeader({ gradient, shadow, icon, title, subtitle, badge, badgeLabel }) {
  return (
    <div style={{ background: gradient, borderRadius: 8, padding: '16px 22px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, boxShadow: shadow }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{title}</div>
          <div style={{ fontSize: 11.5, opacity: 0.88, marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600 }}>{badgeLabel}</div>
        <div style={{ background: badge, borderRadius: 6, padding: '6px 12px', fontSize: 11.5, fontWeight: 700 }}>● LIVE</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 1. DEVICE LIST PAGE
// ════════════════════════════════════════════════════════════════
export function DeviceListPage({ initialCategory, initialModel, initialStatus }) {
  const {
    region: globalRegion,
    branch: globalBranch,
    searchQuery,
    moduleFilters,
    tableColumnFilters
  } = useBankFilters();

  const all = useMemo(() => buildAllDevices(), []);
  
  const getInitCategory = () => {
    if (initialCategory) return initialCategory;
    if (initialModel === 'CoreStation CS-40') return 'controllers';
    if (initialModel && initialModel !== MODELS[0]) return 'terminals';
    return 'terminals'; // default to Biometric Terminals (1,658) matching DEV-01 & Dashboard
  };

  const [category, setCategory] = useState(getInitCategory);
  const [model, setModel]       = useState(initialModel || MODELS[0]);
  const [zone, setZone]         = useState(ZONES[0]);
  const [fw, setFw]             = useState(FW[0]);
  const [status, setStatus]     = useState(initialStatus || 'All');
  const [search, setSearch]     = useState('');
  const [sortCol, setSortCol]   = useState(null);
  const [sortDir, setSortDir]   = useState(null);

  const handleSortChange = (col, dir) => {
    setSortCol(dir ? col : null);
    setSortDir(dir);
  };

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    } else if (initialModel === 'CoreStation CS-40') {
      setCategory('controllers');
    } else if (initialModel && initialModel !== MODELS[0]) {
      setCategory('terminals');
    }
    if (initialModel) setModel(initialModel);
    if (initialStatus) setStatus(initialStatus);
  }, [initialCategory, initialModel, initialStatus]);

  const categoryRows = useMemo(() => {
    if (category === 'terminals') {
      return all.filter(r => r.model !== 'CoreStation CS-40');
    }
    if (category === 'controllers') {
      return all.filter(r => r.model === 'CoreStation CS-40');
    }
    return all;
  }, [all, category]);

  const scopeRows = useMemo(() => categoryRows.filter(r => {
    // 1. Region
    const effectiveRegion = (globalRegion && globalRegion !== 'All Regions') ? globalRegion : zone;
    if (effectiveRegion !== ZONES[0] && effectiveRegion !== 'All Regions') {
      const target = effectiveRegion.toLowerCase();
      const rZone = (r.zone || '').toLowerCase();
      const rDiv = (r.division || '').toLowerCase();
      const rBranch = (r.branch || '').toLowerCase();
      if (!rZone.includes(target) && !rDiv.includes(target) && !rBranch.includes(target)) return false;
    }

    // 2. Branch
    if (globalBranch && globalBranch !== 'All Branches') {
      const target = globalBranch.toLowerCase();
      const rBranch = (r.branch || '').toLowerCase();
      if (!rBranch.includes(target) && !target.includes(rBranch)) return false;
    }

    // 3. Model
    const effectiveModel = (moduleFilters.deviceModel && moduleFilters.deviceModel !== 'All') ? moduleFilters.deviceModel : model;
    if (effectiveModel !== MODELS[0] && effectiveModel !== 'All') {
      if (!r.model.toLowerCase().includes(effectiveModel.toLowerCase())) return false;
    }

    if (fw !== FW[0] && r.firmware !== fw) return false;

    // 4. Search
    const effectiveSearch = searchQuery || search;
    if (effectiveSearch.trim()) {
      const q = effectiveSearch.toLowerCase();
      if (!r.id.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q) && !r.branch.toLowerCase().includes(q) && !r.ip.includes(q) && !r.model.toLowerCase().includes(q)) return false;
    }

    // 5. Table Column Filters
    for (const [col, val] of Object.entries(tableColumnFilters)) {
      if (!val || !val.trim()) continue;
      const v = val.toLowerCase().trim();
      if ((col.includes('device') || col.includes('id')) && !r.id.toLowerCase().includes(v)) return false;
      if (col.includes('model') && !r.model.toLowerCase().includes(v)) return false;
      if (col.includes('serial') && !r.serial.toLowerCase().includes(v)) return false;
      if (col.includes('ip') && !r.ip.toLowerCase().includes(v)) return false;
      if (col.includes('branch') && !r.branch.toLowerCase().includes(v)) return false;
      if (col.includes('zone') && !r.zone.toLowerCase().includes(v)) return false;
      if (col.includes('firmware') && !r.firmware.toLowerCase().includes(v)) return false;
      if (col.includes('status') && !r.status.toLowerCase().includes(v)) return false;
    }

    return true;
  }), [categoryRows, model, zone, fw, search, globalRegion, globalBranch, searchQuery, moduleFilters, tableColumnFilters]);

  const filterFn = useCallback(rows => scopeRows.filter(r => {
    const effectiveStatus = (moduleFilters.connectionState && moduleFilters.connectionState !== 'All')
      ? moduleFilters.connectionState
      : status;
    if (effectiveStatus !== 'All' && r.status !== effectiveStatus) return false;

    if (moduleFilters.tamperState && moduleFilters.tamperState !== 'All') {
      if (moduleFilters.tamperState === 'Tampered' && r.tamper !== 'Alert' && r.tamper !== 'Tampered') return false;
      if (moduleFilters.tamperState === 'Normal' && r.tamper !== 'Normal') return false;
    }

    return true;
  }), [scopeRows, status, moduleFilters]);

  const { filtered, pageRows, page, setPage, totalPages } = useDeviceFilter(scopeRows, filterFn, sortCol, sortDir);

  const kpis = useMemo(() => ({
    total: scopeRows.length,
    online: scopeRows.filter(r => r.status === 'Online').length,
    offline: scopeRows.filter(r => r.status === 'Offline').length,
    sync: scopeRows.filter(r => r.status === 'Sync Issue').length,
    models: new Set(scopeRows.map(r => r.model)).size,
  }), [scopeRows]);

  const reset = () => { setModel(MODELS[0]); setZone(ZONES[0]); setFw(FW[0]); setStatus('All'); setSearch(''); };
  const doExport = useCallback(() => {
    exportCsv('Device ID,Model,Serial,IP Address,Branch,Zone,Firmware,Status', filtered.map(r => `"${r.id}","${r.model}","${r.serial}","${r.ip}","${r.branch}","${r.zone}","${r.firmware}","${r.status}"`).join('\n'), `pubali-device-inventory-${new Date().toISOString().slice(0,10)}.csv`);
  }, [filtered]);

  const pageHeaderMeta = useMemo(() => {
    if (category === 'terminals') {
      return {
        icon: '📟',
        title: 'Suprema Biometric Terminal Registry (DEV-01)',
        subtitle: 'DEV-01 Suprema Biometric Readers · 829 Branches · 1,624 Online (99.82% SLA), 34 Standby/Routine Servicing',
        badgeLabel: `🌐 ${kpis.total.toLocaleString()} Biometric Terminals`,
        badgeColor: '#2563eb'
      };
    }
    if (category === 'controllers') {
      return {
        icon: '🖲️',
        title: 'Master Central ACU Controllers Registry (CS-40)',
        subtitle: 'DEV-01 / DEV-02 CoreStation CS-40 Multi-Door ACU Hubs · 520 / 520 100% Online',
        badgeLabel: `🖲️ ${kpis.total.toLocaleString()} Master Controllers`,
        badgeColor: '#059669'
      };
    }
    return {
      icon: '🌐',
      title: 'Total Hardware Fleet Inventory Report',
      subtitle: '1,658 Biometric Terminals + 520 CoreStation CS-40 ACUs · Complete Pubali Bank Hardware Fleet',
      badgeLabel: `🌐 ${kpis.total.toLocaleString()} Fleet Units`,
      badgeColor: '#0ea5e9'
    };
  }, [category, kpis.total]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PageHeader
        gradient="linear-gradient(135deg,#0c4a6e 0%,#0369a1 55%,#38bdf8 100%)"
        shadow="0 4px 16px rgba(3,105,161,0.22)"
        icon={pageHeaderMeta.icon}
        title={pageHeaderMeta.title}
        subtitle={pageHeaderMeta.subtitle}
        badgeLabel={pageHeaderMeta.badgeLabel}
        badge={pageHeaderMeta.badgeColor}
      />

      {/* Fleet Scope Selector Bar */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        background: '#fff', border: '1px solid #e2e8f0', padding: '8px 12px',
        borderRadius: 8, flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.04em', marginRight: 4 }}>
          FLEET CATEGORY:
        </span>
        <button
          id="scope-terminals-btn"
          onClick={() => { setCategory('terminals'); setModel(MODELS[0]); }}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: category === 'terminals' ? '#0284c7' : '#f8fafc',
            color: category === 'terminals' ? '#fff' : '#334155',
            border: category === 'terminals' ? '1px solid #0284c7' : '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: category === 'terminals' ? '0 2px 6px rgba(2,132,199,0.25)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <span>📟 Biometric Terminals (1,658)</span>
          <span style={{ fontSize: 10, background: category === 'terminals' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>
            1,624 Online · 34 Standby
          </span>
        </button>
        <button
          id="scope-controllers-btn"
          onClick={() => { setCategory('controllers'); setModel('CoreStation CS-40'); }}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: category === 'controllers' ? '#059669' : '#f8fafc',
            color: category === 'controllers' ? '#fff' : '#334155',
            border: category === 'controllers' ? '1px solid #059669' : '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: category === 'controllers' ? '0 2px 6px rgba(5,150,105,0.25)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <span>🖲️ Master Controllers (520)</span>
          <span style={{ fontSize: 10, background: category === 'controllers' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>
            520 Online
          </span>
        </button>
        <button
          id="scope-all-btn"
          onClick={() => { setCategory('all'); setModel(MODELS[0]); }}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: category === 'all' ? '#0f172a' : '#f8fafc',
            color: category === 'all' ? '#fff' : '#334155',
            border: category === 'all' ? '1px solid #0f172a' : '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: category === 'all' ? '0 2px 6px rgba(15,23,42,0.25)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <span>🌐 Total Deployed Fleet (2,178)</span>
          <span style={{ fontSize: 10, background: category === 'all' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>
            2,144 Online · 34 Offline
          </span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          icon={category === 'controllers' ? '🖲️' : '📟'}
          label={category === 'terminals' ? 'Biometric Terminals' : (category === 'controllers' ? 'CoreStations' : 'Total Devices')}
          value={kpis.total.toLocaleString()}
          sub={category === 'terminals' ? '829 branches × 2 readers' : (category === 'controllers' ? '520 Master ACU Hubs' : 'Complete Fleet Registry')}
          color="#0369a1"
          iconBg="#e0f2fe"
          active={status === 'All' && model === (initialModel || MODELS[0])}
          onClick={() => { setStatus('All'); }}
          title="Total Units in selected category"
        />
        <KpiCard
          icon="✅"
          label="Online"
          value={kpis.online.toLocaleString()}
          sub={category === 'terminals' ? '99.82% Operational SLA' : 'Operational'}
          color="#16a34a"
          iconBg="#dcfce7"
          active={status === 'Online'}
          onClick={() => setStatus(s => s === 'Online' ? 'All' : 'Online')}
          title="Click to filter Online operational units"
        />
        <KpiCard
          icon="❌"
          label={category === 'terminals' ? 'Standby / Servicing' : 'Offline'}
          value={kpis.offline.toLocaleString()}
          sub={category === 'terminals' ? 'Routine Maintenance (DEV-01)' : (category === 'controllers' ? '0 Failures' : 'No heartbeat')}
          color="#dc2626"
          iconBg="#fee2e2"
          active={status === 'Offline'}
          onClick={() => setStatus(s => s === 'Offline' ? 'All' : 'Offline')}
          title="Click to filter Offline / Standby units"
        />
        <KpiCard
          icon="⚠️"
          label="Sync Issues"
          value={kpis.sync.toLocaleString()}
          sub="Config mismatch"
          color="#d97706"
          iconBg="#fef3c7"
          active={status === 'Sync Issue'}
          onClick={() => setStatus(s => s === 'Sync Issue' ? 'All' : 'Sync Issue')}
          title="Click to filter units with configuration sync issues"
        />
        <KpiCard
          icon="🔩"
          label="HW Models"
          value={kpis.models}
          sub="Unique types"
          color="#7c3aed"
          iconBg="#f3e8ff"
          active={model !== MODELS[0]}
          onClick={() => setModel(m => m !== MODELS[0] ? MODELS[0] : (MODELS[1] || 'BioStation 3'))}
          title="Click to filter by hardware model"
        />
      </div>

      <CompactFilterBar accent="#0369a1" count={filtered.length} onReset={reset} onExport={doExport} exportGradient="linear-gradient(135deg,#0369a1,#0ea5e9)">
        <CSearch value={search} onChange={setSearch} placeholder="Search ID, Model or Branch..." width={220} />
        <CSelect value={model} onChange={setModel} options={MODELS} width={170} />
        <CSelect value={zone}  onChange={setZone}  options={ZONES}  width={130} />
        <CSelect value={fw}    onChange={setFw}    options={FW}     width={140} />
        <CChips value={status} onChange={setStatus} options={['All','Online','Offline','Sync Issue']}
          colorMap={{ All:'#0369a1', Online:'#16a34a', Offline:'#dc2626', 'Sync Issue':'#d97706' }} />
      </CompactFilterBar>

      <TableShell headerBg="#f0f9ff" headerBorder="#bae6fd" headerColor="#0369a1"
        columns={['Device ID','Model','Serial','IP Address','Branch Location','Zone','Firmware','Status']}
        filtered={filtered} page={page} onReset={reset}
        sortCol={sortCol} sortDir={sortDir} onSortChange={handleSortChange}
        label={category === 'terminals' ? '📟 DEV-01 Biometric Terminals Registry' : (category === 'controllers' ? '🖲️ CoreStation Master Controllers Registry' : '🌐 DEV-01 Total Device Fleet Registry')}
        badge={`${filtered.length.toLocaleString()} Units`} badgeBg="#e0f2fe" badgeColor="#0369a1">
        {pageRows.map((r, i) => {
          const n = (page-1)*30+i+1, alt = i%2===0;
          return (
            <tr key={`${r.id}-${i}`} style={{ background: alt?'#fff':'#f8fafc', borderBottom:'1px solid #f1f5f9' }}
              onMouseEnter={e => e.currentTarget.style.background='#f0f9ff'}
              onMouseLeave={e => e.currentTarget.style.background=alt?'#fff':'#f8fafc'}>
              <td style={{ padding:'8px 12px', color:'#cbd5e1', fontSize:11 }}>{n}</td>
              <td style={{ padding:'8px 12px' }}>
                <span style={{ fontFamily:'monospace', fontSize:11.5, fontWeight:700, color:'#0369a1' }}>{r.id}</span>
                <div style={{ fontSize:10, color:'#94a3b8' }}>{r.name}</div>
              </td>
              <td style={{ padding:'8px 12px' }}><ModelTag model={r.model} /></td>
              <td style={{ padding:'8px 12px' }}>
                <span style={{ fontFamily:'monospace', fontSize:11, color:'#475569', background:'#f8fafc', padding:'2px 6px', borderRadius:4, border:'1px solid #e2e8f0' }}>{r.serial}</span>
              </td>
              <td style={{ padding:'8px 12px', fontFamily:'monospace', fontSize:11, color:'#475569' }}>{r.ip}</td>
              <td style={{ padding:'8px 12px', color:'#1e293b', fontWeight:600, fontSize:11.5 }}>📍 {r.branch.length>26?r.branch.slice(0,26)+'…':r.branch}</td>
              <td style={{ padding:'8px 12px', color:'#64748b', fontSize:11 }}>{r.zone}</td>
              <td style={{ padding:'8px 12px' }}><span style={{ fontFamily:'monospace', fontSize:10.5, background:'#f1f5f9', color:'#475569', padding:'2px 6px', borderRadius:4 }}>{r.firmware}</span></td>
              <td style={{ padding:'8px 12px' }}><StatusPill status={r.status} /></td>
            </tr>
          );
        })}
      </TableShell>
      {filtered.length > 30 && <PaginationBar currentPage={page} totalPages={totalPages} setPage={setPage} count={filtered.length} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 2. DEVICE STATUS / HEALTH PAGE
// ════════════════════════════════════════════════════════════════
export function DeviceStatusPage({ initialCategory, initialModel, initialStatus }) {
  const {
    region: globalRegion,
    branch: globalBranch,
    searchQuery,
    moduleFilters,
    tableColumnFilters
  } = useBankFilters();

  const all = useMemo(() => buildAllDevices(), []);
  
  const getInitCategory = () => {
    if (initialCategory) return initialCategory;
    if (initialModel === 'CoreStation CS-40') return 'controllers';
    if (initialModel && initialModel !== MODELS[0]) return 'terminals';
    return 'terminals'; // default to Biometric Terminals (1,658) matching Readers KPI
  };

  const [category, setCategory] = useState(getInitCategory);
  const [status, setStatus]     = useState(initialStatus || 'All');
  const [model, setModel]       = useState(initialModel || MODELS[0]);
  const [zone, setZone]         = useState(ZONES[0]);
  const [sortPing, setSortPing] = useState(false);
  const [search, setSearch]     = useState('');
  const [sortCol, setSortCol]   = useState(null);
  const [sortDir, setSortDir]   = useState(null);

  const handleSortChange = (col, dir) => {
    setSortCol(dir ? col : null);
    setSortDir(dir);
  };

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    } else if (initialModel === 'CoreStation CS-40') {
      setCategory('controllers');
    }
    if (initialModel) setModel(initialModel);
    if (initialStatus) setStatus(initialStatus);
  }, [initialCategory, initialModel, initialStatus]);

  const categoryRows = useMemo(() => {
    if (category === 'terminals') {
      return all.filter(r => r.model !== 'CoreStation CS-40');
    }
    if (category === 'controllers') {
      return all.filter(r => r.model === 'CoreStation CS-40');
    }
    return all;
  }, [all, category]);

  const scopeRows = useMemo(() => categoryRows.filter(r => {
    // 1. Region
    const effectiveRegion = (globalRegion && globalRegion !== 'All Regions') ? globalRegion : zone;
    if (effectiveRegion !== ZONES[0] && effectiveRegion !== 'All Regions') {
      const target = effectiveRegion.toLowerCase();
      const rZone = (r.zone || '').toLowerCase();
      const rDiv = (r.division || '').toLowerCase();
      const rBranch = (r.branch || '').toLowerCase();
      if (!rZone.includes(target) && !rDiv.includes(target) && !rBranch.includes(target)) return false;
    }

    // 2. Branch
    if (globalBranch && globalBranch !== 'All Branches') {
      const target = globalBranch.toLowerCase();
      const rBranch = (r.branch || '').toLowerCase();
      if (!rBranch.includes(target) && !target.includes(rBranch)) return false;
    }

    // 3. Model
    const effectiveModel = (moduleFilters.deviceModel && moduleFilters.deviceModel !== 'All') ? moduleFilters.deviceModel : model;
    if (effectiveModel !== MODELS[0] && effectiveModel !== 'All') {
      if (!r.model.toLowerCase().includes(effectiveModel.toLowerCase())) return false;
    }

    // 4. Search
    const effectiveSearch = searchQuery || search;
    if (effectiveSearch.trim()) {
      const q = effectiveSearch.toLowerCase();
      if (!r.id.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q) && !r.ip.includes(q) && !r.branch.toLowerCase().includes(q)) return false;
    }

    // 5. Table Column Filters
    for (const [col, val] of Object.entries(tableColumnFilters)) {
      if (!val || !val.trim()) continue;
      const v = val.toLowerCase().trim();
      if ((col.includes('device') || col.includes('id')) && !r.id.toLowerCase().includes(v)) return false;
      if (col.includes('name') && !r.name.toLowerCase().includes(v)) return false;
      if (col.includes('model') && !r.model.toLowerCase().includes(v)) return false;
      if (col.includes('ip') && !r.ip.toLowerCase().includes(v)) return false;
      if (col.includes('tamper') && !r.tamper.toLowerCase().includes(v)) return false;
      if (col.includes('status') && !r.status.toLowerCase().includes(v)) return false;
    }

    return true;
  }), [categoryRows, model, zone, search, globalRegion, globalBranch, searchQuery, moduleFilters, tableColumnFilters]);

  const filterFn = useCallback(rows => {
    let list = scopeRows.filter(r => {
      const effectiveStatus = (moduleFilters.connectionState && moduleFilters.connectionState !== 'All')
        ? moduleFilters.connectionState
        : status;
      if (effectiveStatus !== 'All' && r.status !== effectiveStatus) return false;

      if (moduleFilters.tamperState && moduleFilters.tamperState !== 'All') {
        if (moduleFilters.tamperState === 'Tampered' && r.tamper !== 'Alert' && r.tamper !== 'Tampered') return false;
        if (moduleFilters.tamperState === 'Normal' && r.tamper !== 'Normal') return false;
      }

      return true;
    });
    if (sortPing) {
      list = [...list].sort((a, b) => (b.pingMs || 0) - (a.pingMs || 0));
    }
    return list;
  }, [scopeRows, status, sortPing, moduleFilters]);

  const { filtered, pageRows, page, setPage, totalPages } = useDeviceFilter(scopeRows, filterFn, sortCol, sortDir);


  const kpis = useMemo(() => {
    const total = scopeRows.length;
    const online = scopeRows.filter(r => r.status === 'Online').length;
    const offline = scopeRows.filter(r => r.status === 'Offline').length;
    const sync = scopeRows.filter(r => r.status === 'Sync Issue').length;
    const pingRows = scopeRows.filter(r => r.pingMs);
    const avgPing = Math.round(pingRows.reduce((s, r) => s + (r.pingMs || 0), 0) / (pingRows.length || 1));
    return { total, online, offline, sync, avgPing };
  }, [scopeRows]);

  const reset = () => { setStatus('All'); setZone(ZONES[0]); setSortPing(false); setSearch(''); };
  const doExport = useCallback(() => {
    exportCsv('Device ID,Device Name,Model,IP,Ping,Heartbeat,Auth Mode,Tamper,Status', filtered.map(r => `"${r.id}","${r.name}","${r.model}","${r.ip}","${r.pingMs??'—'}","${r.heartbeat}","${r.authMode}","${r.tamper}","${r.status}"`).join('\n'), `pubali-device-health-${new Date().toISOString().slice(0,10)}.csv`);
  }, [filtered]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PageHeader
        gradient="linear-gradient(135deg,#14532d 0%,#15803d 55%,#4ade80 100%)"
        shadow="0 4px 16px rgba(21,128,61,0.22)"
        icon={category === 'controllers' ? '🖲️' : '🖥️'}
        title={category === 'terminals' ? 'Biometric Readers Health & Telemetry Monitor' : (category === 'controllers' ? 'Master ACU Controllers Telemetry Monitor' : 'Total Fleet Hardware Telemetry Monitor')}
        subtitle={category === 'terminals' ? 'DEV-01 Real-time Biometric Reader Telemetry · 829 Branches · 1,624 Online, 34 Standby' : (category === 'controllers' ? 'CoreStation CS-40 ACUs · 520 / 520 100% Online' : 'Complete Hardware Telemetry Feed · 2,178 Units')}
        badgeLabel={`⚡ Avg Ping: ${kpis.avgPing} ms`}
        badge="#16a34a"
      />

      {/* Fleet Scope Selector Bar */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        background: '#fff', border: '1px solid #e2e8f0', padding: '8px 12px',
        borderRadius: 8, flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.04em', marginRight: 4 }}>
          MONITORING SCOPE:
        </span>
        <button
          onClick={() => { setCategory('terminals'); setModel(MODELS[0]); }}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: category === 'terminals' ? '#15803d' : '#f8fafc',
            color: category === 'terminals' ? '#fff' : '#334155',
            border: category === 'terminals' ? '1px solid #15803d' : '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: category === 'terminals' ? '0 2px 6px rgba(21,128,61,0.25)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <span>📟 Biometric Terminals (1,658)</span>
          <span style={{ fontSize: 10, background: category === 'terminals' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>
            1,624 Online · 34 Standby
          </span>
        </button>
        <button
          onClick={() => { setCategory('controllers'); setModel('CoreStation CS-40'); }}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: category === 'controllers' ? '#059669' : '#f8fafc',
            color: category === 'controllers' ? '#fff' : '#334155',
            border: category === 'controllers' ? '1px solid #059669' : '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: category === 'controllers' ? '0 2px 6px rgba(5,150,105,0.25)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <span>🖲️ Master Controllers (520)</span>
          <span style={{ fontSize: 10, background: category === 'controllers' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>
            520 Online
          </span>
        </button>
        <button
          onClick={() => { setCategory('all'); setModel(MODELS[0]); }}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: category === 'all' ? '#0f172a' : '#f8fafc',
            color: category === 'all' ? '#fff' : '#334155',
            border: category === 'all' ? '1px solid #0f172a' : '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: category === 'all' ? '0 2px 6px rgba(15,23,42,0.25)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <span>🌐 Total Deployed Fleet (2,178)</span>
          <span style={{ fontSize: 10, background: category === 'all' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>
            2,144 Online · 34 Offline
          </span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          icon={category === 'controllers' ? '🖲️' : '🖥️'}
          label="Monitored"
          value={kpis.total.toLocaleString()}
          sub={category === 'terminals' ? '829 branches × 2 readers' : (category === 'controllers' ? '520 Master ACU Hubs' : 'All monitored units')}
          color="#0369a1"
          iconBg="#e0f2fe"
          active={status === 'All' && !sortPing}
          onClick={() => { setStatus('All'); setSortPing(false); }}
          title="Click to reset filters and view all monitored units"
        />
        <KpiCard
          icon="✅"
          label="Online"
          value={kpis.online.toLocaleString()}
          sub={category === 'terminals' ? '99.82% Operational SLA' : 'Heartbeat OK'}
          color="#16a34a"
          iconBg="#dcfce7"
          active={status === 'Online'}
          onClick={() => setStatus(s => s === 'Online' ? 'All' : 'Online')}
          title="Click to filter Online units"
        />
        <KpiCard
          icon="❌"
          label={category === 'terminals' ? 'Standby / Servicing' : 'Offline'}
          value={kpis.offline.toLocaleString()}
          sub={category === 'terminals' ? 'Routine Servicing (DEV-01)' : 'No response'}
          color="#dc2626"
          iconBg="#fee2e2"
          active={status === 'Offline'}
          onClick={() => setStatus(s => s === 'Offline' ? 'All' : 'Offline')}
          title="Click to filter Offline units"
        />
        <KpiCard
          icon="🔄"
          label="Sync Issues"
          value={kpis.sync.toLocaleString()}
          sub="Config alert"
          color="#d97706"
          iconBg="#fef3c7"
          active={status === 'Sync Issue'}
          onClick={() => setStatus(s => s === 'Sync Issue' ? 'All' : 'Sync Issue')}
          title="Click to filter units with configuration sync issues"
        />
        <KpiCard
          icon="⚡"
          label="Avg Latency"
          value={`${kpis.avgPing} ms`}
          sub={sortPing ? "Sorted by highest ping" : "Network RTT"}
          color="#0891b2"
          iconBg="#e0f2fe"
          active={sortPing}
          onClick={() => setSortPing(p => !p)}
          title="Click to sort units by latency descending (highest ping first)"
        />
      </div>

      <CompactFilterBar accent="#15803d" count={filtered.length} onReset={reset} onExport={doExport} exportGradient="linear-gradient(135deg,#15803d,#16a34a)">
        <CSearch value={search} onChange={setSearch} placeholder="Search Device ID, Model or IP..." width={230} />
        <CSelect value={zone} onChange={setZone} options={ZONES} width={130} />
        <CChips value={status} onChange={setStatus} options={['All','Online','Offline','Sync Issue']}
          colorMap={{ All:'#15803d', Online:'#16a34a', Offline:'#dc2626', 'Sync Issue':'#d97706' }} />
      </CompactFilterBar>

      <TableShell headerBg="#f0fdf4" headerBorder="#bbf7d0" headerColor="#15803d"
        columns={['Device ID','Device Name','Terminal Model','Network IP','Ping','Last Heartbeat','Auth Mode','Tamper','Health']}
        filtered={filtered} page={page} onReset={reset}
        sortCol={sortCol} sortDir={sortDir} onSortChange={handleSortChange}
        label={category === 'terminals' ? '🖥️ Biometric Readers Telemetry' : (category === 'controllers' ? '🖲️ CoreStation ACU Telemetry' : '🖥️ Total Device Fleet Telemetry')}
        badge={`${filtered.length.toLocaleString()} Units`} badgeBg="#dcfce7" badgeColor="#15803d">
        {pageRows.map((r, i) => {
          const n = (page-1)*30+i+1, alt = i%2===0;
          const pingColor = !r.pingMs ? '#dc2626' : r.pingMs > 25 ? '#d97706' : '#16a34a';
          return (
            <tr key={`${r.id}-${i}`} style={{ background:alt?'#fff':'#f8fafc', borderBottom:'1px solid #f1f5f9' }}
              onMouseEnter={e => e.currentTarget.style.background='#f0fdf4'}
              onMouseLeave={e => e.currentTarget.style.background=alt?'#fff':'#f8fafc'}>
              <td style={{ padding:'8px 12px', color:'#cbd5e1', fontSize:11 }}>{n}</td>
              <td style={{ padding:'8px 12px' }}><span style={{ fontFamily:'monospace', fontSize:11.5, fontWeight:700, color:'#15803d' }}>{r.id}</span></td>
              <td style={{ padding:'8px 12px', fontWeight:600, color:'#1e293b' }}>{r.name}</td>
              <td style={{ padding:'8px 12px' }}><ModelTag model={r.model} /></td>
              <td style={{ padding:'8px 12px', fontFamily:'monospace', fontSize:11, color:'#475569' }}>{r.ip}</td>
              <td style={{ padding:'8px 12px' }}><span style={{ fontFamily:'monospace', fontWeight:800, fontSize:12, color:pingColor }}>{r.pingMs?`${r.pingMs} ms`:'Timeout'}</span></td>
              <td style={{ padding:'8px 12px', color:'#64748b', fontSize:11 }}>{r.heartbeat}</td>
              <td style={{ padding:'8px 12px' }}><span style={{ fontSize:10.5, background:'#f5f3ff', color:'#6d28d9', padding:'2px 7px', borderRadius:4, fontWeight:600 }}>🔐 {r.authMode}</span></td>
              <td style={{ padding:'8px 12px' }}><StatusPill status={r.tamper} /></td>
              <td style={{ padding:'8px 12px' }}><StatusPill status={r.status} /></td>
            </tr>
          );
        })}
      </TableShell>
      {filtered.length > 30 && <PaginationBar currentPage={page} totalPages={totalPages} setPage={setPage} count={filtered.length} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 3. ACTIVE DEVICE PAGE
// ════════════════════════════════════════════════════════════════
export function ActiveDevicePage({ initialCategory, initialModel }) {
  const {
    region: globalRegion,
    branch: globalBranch,
    searchQuery,
    moduleFilters,
    tableColumnFilters
  } = useBankFilters();

  const all = useMemo(() => buildAllDevices().filter(r => r.status === 'Online'), []);
  
  const getInitCategory = () => {
    if (initialCategory) return initialCategory;
    if (initialModel === 'CoreStation CS-40') return 'controllers';
    if (initialModel && initialModel !== MODELS[0]) return 'terminals';
    return 'terminals'; // default to Biometric Terminals (1,624 Online)
  };

  const [category, setCategory] = useState(getInitCategory);
  const [model, setModel]       = useState(initialModel || MODELS[0]);
  const [zone, setZone]         = useState(ZONES[0]);
  const [auth, setAuth]         = useState(AUTH[0]);
  const [sortPing, setSortPing] = useState(false);
  const [search, setSearch]     = useState('');
  const [sortCol, setSortCol]   = useState(null);
  const [sortDir, setSortDir]   = useState(null);

  const handleSortChange = (col, dir) => {
    setSortCol(dir ? col : null);
    setSortDir(dir);
  };

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    } else if (initialModel === 'CoreStation CS-40') {
      setCategory('controllers');
    }
    if (initialModel) setModel(initialModel);
  }, [initialCategory, initialModel]);

  const categoryRows = useMemo(() => {
    if (category === 'terminals') {
      return all.filter(r => r.model !== 'CoreStation CS-40');
    }
    if (category === 'controllers') {
      return all.filter(r => r.model === 'CoreStation CS-40');
    }
    return all;
  }, [all, category]);

  const scopeRows = useMemo(() => categoryRows.filter(r => {
    // 1. Region
    const effectiveRegion = (globalRegion && globalRegion !== 'All Regions') ? globalRegion : zone;
    if (effectiveRegion !== ZONES[0] && effectiveRegion !== 'All Regions') {
      const target = effectiveRegion.toLowerCase();
      const rZone = (r.zone || '').toLowerCase();
      const rDiv = (r.division || '').toLowerCase();
      const rBranch = (r.branch || '').toLowerCase();
      if (!rZone.includes(target) && !rDiv.includes(target) && !rBranch.includes(target)) return false;
    }

    // 2. Branch
    if (globalBranch && globalBranch !== 'All Branches') {
      const target = globalBranch.toLowerCase();
      const rBranch = (r.branch || '').toLowerCase();
      if (!rBranch.includes(target) && !target.includes(rBranch)) return false;
    }

    // 3. Model
    const effectiveModel = (moduleFilters.deviceModel && moduleFilters.deviceModel !== 'All') ? moduleFilters.deviceModel : model;
    if (effectiveModel !== MODELS[0] && effectiveModel !== 'All') {
      if (!r.model.toLowerCase().includes(effectiveModel.toLowerCase())) return false;
    }

    if (auth !== AUTH[0] && r.authMode !== auth) return false;

    // 4. Search
    const effectiveSearch = searchQuery || search;
    if (effectiveSearch.trim()) {
      const q = effectiveSearch.toLowerCase();
      if (!r.id.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q) && !r.branch.toLowerCase().includes(q) && !r.ip.includes(q)) return false;
    }

    // 5. Table Column Filters
    for (const [col, val] of Object.entries(tableColumnFilters)) {
      if (!val || !val.trim()) continue;
      const v = val.toLowerCase().trim();
      if ((col.includes('device') || col.includes('id')) && !r.id.toLowerCase().includes(v)) return false;
      if (col.includes('branch') && !r.branch.toLowerCase().includes(v)) return false;
      if (col.includes('ip') && !r.ip.toLowerCase().includes(v)) return false;
      if (col.includes('firmware') && !r.firmware.toLowerCase().includes(v)) return false;
    }

    return true;
  }), [categoryRows, model, zone, auth, search, globalRegion, globalBranch, searchQuery, moduleFilters, tableColumnFilters]);

  const filterFn = useCallback(rows => {
    let list = scopeRows;
    if (sortPing) {
      list = [...list].sort((a, b) => (b.pingMs || 0) - (a.pingMs || 0));
    }
    return list;
  }, [scopeRows, sortPing]);

  const { filtered, pageRows, page, setPage, totalPages } = useDeviceFilter(scopeRows, filterFn, sortCol, sortDir);

  const kpis = useMemo(() => ({
    total:   scopeRows.length,
    zones:   new Set(scopeRows.map(r => r.zone)).size,
    models:  new Set(scopeRows.map(r => r.model)).size,
    avgPing: Math.round(scopeRows.reduce((s,r) => s+(r.pingMs||10), 0) / (scopeRows.length||1)),
  }), [scopeRows]);

  const reset = () => { setModel(MODELS[0]); setZone(ZONES[0]); setAuth(AUTH[0]); setSortPing(false); setSearch(''); };
  const doExport = useCallback(() => {
    exportCsv('Device ID,Model,Branch,Division,IP Address,Ping Latency,Last Heartbeat,Firmware,Status', filtered.map(r => `"${r.id}","${r.model}","${r.branch}","${r.division}","${r.ip}","${r.pingMs} ms","${r.heartbeat}","${r.firmware}","${r.status}"`).join('\n'), `pubali-active-devices-${new Date().toISOString().slice(0,10)}.csv`);
  }, [filtered]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PageHeader
        gradient="linear-gradient(135deg,#064e3b 0%,#059669 55%,#34d399 100%)"
        shadow="0 4px 16px rgba(5,150,105,0.22)"
        icon="🟢"
        title={category === 'terminals' ? 'Active / Online Biometric Terminals Report' : (category === 'controllers' ? 'Active / Online Master Controllers Report' : 'Total Active / Online Device Report')}
        subtitle={category === 'terminals' ? 'DEV-02 Operational Terminals · 829 Branches · 1,624 Online (99.82% SLA)' : (category === 'controllers' ? 'CoreStation CS-40 ACUs · 520 / 520 100% Online' : 'Total Operational Hardware Fleet · 2,144 Units')}
        badgeLabel={`✅ ${kpis.total.toLocaleString()} Online`}
        badge="#059669"
      />

      {/* Fleet Scope Selector Bar */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        background: '#fff', border: '1px solid #e2e8f0', padding: '8px 12px',
        borderRadius: 8, flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.04em', marginRight: 4 }}>
          ONLINE FLEET SCOPE:
        </span>
        <button
          onClick={() => { setCategory('terminals'); setModel(MODELS[0]); }}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: category === 'terminals' ? '#059669' : '#f8fafc',
            color: category === 'terminals' ? '#fff' : '#334155',
            border: category === 'terminals' ? '1px solid #059669' : '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: category === 'terminals' ? '0 2px 6px rgba(5,150,105,0.25)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <span>📟 Biometric Terminals (1,624 Online)</span>
          <span style={{ fontSize: 10, background: category === 'terminals' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>
            99.82% SLA
          </span>
        </button>
        <button
          onClick={() => { setCategory('controllers'); setModel('CoreStation CS-40'); }}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: category === 'controllers' ? '#0d9488' : '#f8fafc',
            color: category === 'controllers' ? '#fff' : '#334155',
            border: category === 'controllers' ? '1px solid #0d9488' : '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: category === 'controllers' ? '0 2px 6px rgba(13,148,136,0.25)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <span>🖲️ Master Controllers (520 Online)</span>
          <span style={{ fontSize: 10, background: category === 'controllers' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>
            100% Online
          </span>
        </button>
        <button
          onClick={() => { setCategory('all'); setModel(MODELS[0]); }}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: category === 'all' ? '#0f172a' : '#f8fafc',
            color: category === 'all' ? '#fff' : '#334155',
            border: category === 'all' ? '1px solid #0f172a' : '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: category === 'all' ? '0 2px 6px rgba(15,23,42,0.25)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <span>🌐 Total Deployed Fleet (2,144 Online)</span>
          <span style={{ fontSize: 10, background: category === 'all' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>
            All Active Hardware
          </span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          icon="✅"
          label="Online Devices"
          value={kpis.total.toLocaleString()}
          sub={category === 'terminals' ? '1,624 Terminals (DEV-02)' : (category === 'controllers' ? '520 Master Hubs' : 'Total Fleet (2,144 Units)')}
          color="#059669"
          iconBg="#dcfce7"
          active={model === MODELS[0] && zone === ZONES[0] && auth === AUTH[0] && !sortPing}
          onClick={() => { setModel(MODELS[0]); setZone(ZONES[0]); setAuth(AUTH[0]); setSortPing(false); }}
          title="Online Devices in selected category"
        />
        <KpiCard
          icon="⚡"
          label="Avg Ping"
          value={`${kpis.avgPing} ms`}
          sub="Central server RTT"
          color="#0891b2"
          iconBg="#e0f2fe"
          active={sortPing}
          onClick={() => setSortPing(p => !p)}
          title="Click to sort online terminals by latency descending (highest ping first)"
        />
        <KpiCard
          icon="🗺️"
          label="Zones Covered"
          value={kpis.zones}
          sub="8 Administrative divisions"
          color="#0369a1"
          iconBg="#e0f2fe"
          active={zone !== ZONES[0]}
          onClick={() => setZone(z => z !== ZONES[0] ? ZONES[0] : (ZONES[1] || 'Dhaka'))}
          title="Click to toggle filter by regional zone"
        />
        <KpiCard
          icon="🔩"
          label="HW Models"
          value={kpis.models}
          sub="Active terminal types"
          color="#7c3aed"
          iconBg="#f3e8ff"
          active={model !== MODELS[0]}
          onClick={() => setModel(m => m !== MODELS[0] ? MODELS[0] : (MODELS[1] || 'BioStation 3'))}
          title="Click to toggle filter by primary hardware model"
        />
      </div>

      <CompactFilterBar accent="#059669" count={filtered.length} onReset={reset} onExport={doExport} exportGradient="linear-gradient(135deg,#059669,#10b981)">
        <CSearch value={search} onChange={setSearch} placeholder="Search Device or Branch..." width={220} />
        <CSelect value={model} onChange={setModel} options={MODELS} width={150} />
        <CSelect value={zone}  onChange={setZone}  options={ZONES}  width={130} />
        <CSelect value={auth}  onChange={setAuth}  options={AUTH}   width={170} />
      </CompactFilterBar>

      <TableShell headerBg="#ecfdf5" headerBorder="#a7f3d0" headerColor="#059669"
        columns={['Device ID','Branch Location','IP Address','Ping','Last Heartbeat','Firmware','Status']}
        filtered={filtered} page={page} onReset={reset}
        sortCol={sortCol} sortDir={sortDir} onSortChange={handleSortChange}
        label={category === 'terminals' ? '🟢 DEV-02 Active Biometric Terminals' : (category === 'controllers' ? '🟢 Master ACU Controllers Active' : '🟢 DEV-02 Total Active Devices')}
        badge={`${filtered.length.toLocaleString()} Online`} badgeBg="#d1fae5" badgeColor="#065f46">
        {pageRows.map((r, i) => {
          const n = (page-1)*30+i+1, alt = i%2===0;
          return (
            <tr key={`${r.id}-${i}`} style={{ background:alt?'#fff':'#f8fafc', borderBottom:'1px solid #f1f5f9' }}
              onMouseEnter={e => e.currentTarget.style.background='#ecfdf5'}
              onMouseLeave={e => e.currentTarget.style.background=alt?'#fff':'#f8fafc'}>
              <td style={{ padding:'8px 12px', color:'#cbd5e1', fontSize:11 }}>{n}</td>
              <td style={{ padding:'8px 12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', boxShadow:'0 0 5px #10b981', flexShrink:0 }} />
                  <span style={{ fontFamily:'monospace', fontSize:11.5, fontWeight:700, color:'#059669' }}>{r.id}</span>
                </div>
                <div style={{ fontSize:10, color:'#94a3b8', paddingLeft:15 }}>{r.model}</div>
              </td>
              <td style={{ padding:'8px 12px' }}>
                <div style={{ color:'#1e293b', fontWeight:600, fontSize:11.5 }}>📍 {r.branch.length>24?r.branch.slice(0,24)+'…':r.branch}</div>
                <div style={{ fontSize:10.5, color:'#64748b' }}>{r.division} · {r.zone}</div>
              </td>
              <td style={{ padding:'8px 12px', fontFamily:'monospace', fontSize:11, color:'#475569' }}>{r.ip}</td>
              <td style={{ padding:'8px 12px' }}><span style={{ fontFamily:'monospace', fontWeight:800, fontSize:12, color:r.pingMs>20?'#d97706':'#059669' }}>{r.pingMs} ms</span></td>
              <td style={{ padding:'8px 12px', color:'#475569', fontSize:11 }}>🕒 {r.heartbeat}</td>
              <td style={{ padding:'8px 12px' }}><span style={{ fontFamily:'monospace', fontSize:10.5, background:'#f1f5f9', color:'#475569', padding:'2px 6px', borderRadius:4 }}>{r.firmware}</span></td>
              <td style={{ padding:'8px 12px' }}><StatusPill status="Online" /></td>
            </tr>
          );
        })}
      </TableShell>
      {filtered.length > 30 && <PaginationBar currentPage={page} totalPages={totalPages} setPage={setPage} count={filtered.length} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 4. INACTIVE DEVICE PAGE
// ════════════════════════════════════════════════════════════════
export function InactiveDevicePage() {
  const {
    region: globalRegion,
    branch: globalBranch,
    searchQuery,
    moduleFilters,
    tableColumnFilters
  } = useBankFilters();

  const all = useMemo(() => buildAllDevices().filter(r => r.status !== 'Online'), []);
  const [status, setStatus]       = useState('All');
  const [priority, setPriority]   = useState('All');
  const [zone, setZone]           = useState(ZONES[0]);
  const [search, setSearch]       = useState('');
  const [sortCol, setSortCol]     = useState(null);
  const [sortDir, setSortDir]     = useState(null);

  const handleSortChange = (col, dir) => {
    setSortCol(dir ? col : null);
    setSortDir(dir);
  };

  const scopeRows = useMemo(() => all.filter(r => {
    // 1. Region
    const effectiveRegion = (globalRegion && globalRegion !== 'All Regions') ? globalRegion : zone;
    if (effectiveRegion !== ZONES[0] && effectiveRegion !== 'All Regions') {
      const target = effectiveRegion.toLowerCase();
      const rZone = (r.zone || '').toLowerCase();
      const rDiv = (r.division || '').toLowerCase();
      const rBranch = (r.branch || '').toLowerCase();
      if (!rZone.includes(target) && !rDiv.includes(target) && !rBranch.includes(target)) return false;
    }

    // 2. Branch
    if (globalBranch && globalBranch !== 'All Branches') {
      const target = globalBranch.toLowerCase();
      const rBranch = (r.branch || '').toLowerCase();
      if (!rBranch.includes(target) && !target.includes(rBranch)) return false;
    }

    // 3. Model
    if (moduleFilters.deviceModel && moduleFilters.deviceModel !== 'All') {
      if (!r.model.toLowerCase().includes(moduleFilters.deviceModel.toLowerCase())) return false;
    }

    // 4. Search
    const effectiveSearch = searchQuery || search;
    if (effectiveSearch.trim()) {
      const q = effectiveSearch.toLowerCase();
      if (!r.id.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q) && !r.branch.toLowerCase().includes(q)) return false;
    }

    // 5. Table Column Filters
    for (const [col, val] of Object.entries(tableColumnFilters)) {
      if (!val || !val.trim()) continue;
      const v = val.toLowerCase().trim();
      if ((col.includes('device') || col.includes('id')) && !r.id.toLowerCase().includes(v)) return false;
      if (col.includes('branch') && !r.branch.toLowerCase().includes(v)) return false;
      if (col.includes('fault') && !(r.fault || '').toLowerCase().includes(v)) return false;
      if ((col.includes('tech') || col.includes('assigned')) && !(r.assignedTech || '').toLowerCase().includes(v)) return false;
    }

    return true;
  }), [all, zone, search, globalRegion, globalBranch, searchQuery, moduleFilters, tableColumnFilters]);

  const filterFn = useCallback(rows => scopeRows.filter(r => {
    const effectiveStatus = (moduleFilters.connectionState && moduleFilters.connectionState !== 'All')
      ? moduleFilters.connectionState
      : status;
    if (effectiveStatus !== 'All' && r.status !== effectiveStatus) return false;

    if (priority === 'Long Outage (>8h)') {
      const isLong = r.offlineDuration && (r.offlineDuration.includes('d') || parseInt(r.offlineDuration) >= 8);
      if (!isLong) return false;
    }
    if (priority === 'Unassigned Tech' && r.assignedTech !== 'Unassigned') return false;
    return true;
  }), [scopeRows, status, priority, moduleFilters]);

  const { filtered, pageRows, page, setPage, totalPages } = useDeviceFilter(scopeRows, filterFn, sortCol, sortDir);

  const kpis = useMemo(() => {
    const total = scopeRows.length;
    const offline = scopeRows.filter(r => r.status === 'Offline').length;
    const sync = scopeRows.filter(r => r.status === 'Sync Issue').length;
    const longOffline = scopeRows.filter(r => r.offlineDuration && (r.offlineDuration.includes('d') || parseInt(r.offlineDuration) >= 8)).length;
    const unassigned = scopeRows.filter(r => r.assignedTech === 'Unassigned').length;
    return { total, offline, sync, longOffline, unassigned };
  }, [scopeRows]);

  const reset = () => { setStatus('All'); setPriority('All'); setZone(ZONES[0]); setSearch(''); };
  const doExport = useCallback(() => {
    exportCsv('Device ID,Device Name,Model,Branch,Zone,Last Online,Offline Duration,Fault Type,Assigned Tech,Status', filtered.map(r => `"${r.id}","${r.name}","${r.model}","${r.branch}","${r.zone}","${r.lastOnline||'—'}","${r.offlineDuration||'—'}","${r.fault||'—'}","${r.assignedTech||'—'}","${r.status}"`).join('\n'), `pubali-inactive-devices-${new Date().toISOString().slice(0,10)}.csv`);
  }, [filtered]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PageHeader gradient="linear-gradient(135deg,#450a0a 0%,#b91c1c 55%,#f87171 100%)" shadow="0 4px 16px rgba(185,28,28,0.22)"
        icon="🔴" title="Inactive & Faulted Terminals" subtitle="Offline & Sync-alert devices · Requires IT / Dealer Inspection"
        badgeLabel={`❌ ${kpis.offline} Offline · ⚠️ ${kpis.sync} Sync`} badge="#dc2626" />

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          icon="🚨"
          label="Total Inactive"
          value={kpis.total.toLocaleString()}
          sub="Requires inspection"
          color="#dc2626"
          iconBg="#fee2e2"
          active={status === 'All' && priority === 'All'}
          onClick={() => { setStatus('All'); setPriority('All'); }}
          title="Click to reset filters and view all inactive terminals"
        />
        <KpiCard
          icon="❌"
          label="Offline"
          value={kpis.offline.toLocaleString()}
          sub="Network timeout"
          color="#b91c1c"
          iconBg="#fee2e2"
          active={status === 'Offline'}
          onClick={() => { setPriority('All'); setStatus(s => s === 'Offline' ? 'All' : 'Offline'); }}
          title="Click to filter Offline devices (network timeout)"
        />
        <KpiCard
          icon="⚠️"
          label="Sync Alert"
          value={kpis.sync.toLocaleString()}
          sub="Tamper / config"
          color="#d97706"
          iconBg="#fef3c7"
          active={status === 'Sync Issue'}
          onClick={() => { setPriority('All'); setStatus(s => s === 'Sync Issue' ? 'All' : 'Sync Issue'); }}
          title="Click to filter devices with sync / config alerts"
        />
        <KpiCard
          icon="⏱️"
          label="Long Outage (>8h)"
          value={kpis.longOffline.toLocaleString()}
          sub="Offline duration ≥ 8h"
          color="#7c3aed"
          iconBg="#f3e8ff"
          active={priority === 'Long Outage (>8h)'}
          onClick={() => { setStatus('All'); setPriority(p => p === 'Long Outage (>8h)' ? 'All' : 'Long Outage (>8h)'); }}
          title="Click to filter terminals offline for 8+ hours or multiple days"
        />
        <KpiCard
          icon="👤"
          label="Unassigned Tech"
          value={kpis.unassigned.toLocaleString()}
          sub="Pending IT dispatch"
          color="#ea580c"
          iconBg="#ffedd5"
          active={priority === 'Unassigned Tech'}
          onClick={() => { setStatus('All'); setPriority(p => p === 'Unassigned Tech' ? 'All' : 'Unassigned Tech'); }}
          title="Click to filter terminals awaiting technician assignment"
        />
      </div>

      <CompactFilterBar accent="#dc2626" count={filtered.length} onReset={reset} onExport={doExport} exportGradient="linear-gradient(135deg,#b91c1c,#dc2626)">
        <CSearch value={search} onChange={setSearch} placeholder="Search Device or Branch..." width={220} />
        <CSelect value={zone} onChange={setZone} options={ZONES} width={130} />
        <CChips value={status} onChange={s => { setStatus(s); setPriority('All'); }} options={['All','Offline','Sync Issue']}
          colorMap={{ All:'#b91c1c', Offline:'#dc2626', 'Sync Issue':'#d97706' }} />
        <CChips value={priority} onChange={p => { setPriority(p); setStatus('All'); }} options={['All','Long Outage (>8h)','Unassigned Tech']}
          colorMap={{ All:'#b91c1c', 'Long Outage (>8h)':'#7c3aed', 'Unassigned Tech':'#ea580c' }} />
      </CompactFilterBar>

      <TableShell headerBg="#fef2f2" headerBorder="#fca5a5" headerColor="#b91c1c"
        columns={['Device ID','Branch','Last Online','Offline Duration','Fault Type','Assigned Tech']}
        filtered={filtered} page={page} onReset={reset}
        sortCol={sortCol} sortDir={sortDir} onSortChange={handleSortChange}
        label="🔴 Inactive Terminal Log" badge={`${filtered.length.toLocaleString()} Devices`} badgeBg="#fee2e2" badgeColor="#b91c1c">
        {pageRows.map((r, i) => {
          const n = (page-1)*30+i+1, alt = i%2===0;
          const isLongOffline = r.offlineDuration && (r.offlineDuration.includes('d') || parseInt(r.offlineDuration) >= 8);
          return (
            <tr key={`${r.id}-${i}`} style={{ background:alt?'#fff':'#fafbfc', borderBottom:'1px solid #f1f5f9' }}
              onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background=alt?'#fff':'#fafbfc'}>

              {/* Row index # */}
              <td style={{ padding:'8px 12px', color:'#cbd5e1', fontSize:11 }}>{n}</td>

              {/* Device ID */}
              <td style={{ padding:'9px 14px', whiteSpace:'nowrap' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{
                    width:8, height:8, borderRadius:'50%', flexShrink:0,
                    background: r.status==='Offline' ? '#dc2626' : '#d97706',
                    boxShadow: `0 0 5px ${r.status==='Offline'?'#dc2626':'#d97706'}`
                  }} />
                  <span style={{ fontFamily:'monospace', fontSize:11.5, fontWeight:700, color:'#dc2626' }}>{r.id}</span>
                </div>
                <div style={{ fontSize:10.5, color:'#9ca3af', marginTop:2, paddingLeft:16 }}>{r.name}</div>
              </td>

              {/* Branch */}
              <td style={{ padding:'9px 14px' }}>
                <div style={{ fontWeight:600, color:'#1e293b', fontSize:12, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {r.branch}
                </div>
                <div style={{ fontSize:10.5, color:'#9ca3af', marginTop:1 }}>{r.zone}</div>
              </td>

              {/* Last Online */}
              <td style={{ padding:'9px 14px', whiteSpace:'nowrap' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'#374151' }}>{r.lastOnline || '—'}</div>
                <div style={{ fontSize:10.5, color:'#9ca3af', marginTop:1 }}>Last biometric sync</div>
              </td>

              {/* Offline Duration */}
              <td style={{ padding:'9px 14px', whiteSpace:'nowrap' }}>
                <span style={{
                  display:'inline-block',
                  padding:'3px 10px', borderRadius:12, fontSize:11.5, fontWeight:700,
                  background: isLongOffline ? '#fee2e2' : '#fef3c7',
                  color:       isLongOffline ? '#b91c1c' : '#92400e'
                }}>
                  ⏱ {r.offlineDuration || '—'}
                </span>
              </td>

              {/* Fault Type */}
              <td style={{ padding:'9px 14px' }}>
                <span style={{
                  display:'inline-block',
                  padding:'3px 9px', borderRadius:6, fontSize:11, fontWeight:700,
                  background: r.status==='Offline' ? '#fee2e2' : '#fef9c3',
                  color:       r.status==='Offline' ? '#b91c1c' : '#92400e',
                  maxWidth: 180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                }}>
                  {r.fault || '—'}
                </span>
              </td>

              {/* Assigned Tech */}
              <td style={{ padding:'9px 14px', whiteSpace:'nowrap' }}>
                {r.assignedTech === 'Unassigned'
                  ? <span style={{ color:'#dc2626', fontWeight:700, fontSize:11 }}>⚠ Unassigned</span>
                  : <span style={{ color:'#374151', fontSize:12 }}>{r.assignedTech}</span>
                }
              </td>
            </tr>
          );
        })}
      </TableShell>
      {filtered.length > 30 && <PaginationBar currentPage={page} totalPages={totalPages} setPage={setPage} count={filtered.length} />}
    </div>
  );
}
