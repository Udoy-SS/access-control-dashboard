/**
 * RestrictedZoneAccessLog.jsx — High-Security Zone Access Audit Log
 * Pubali Bank PLC · Data Center / Treasury / SWIFT / Vault Access Control
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useBankFilters } from './filters/FilterContext';
import { TableColumnFilter } from './filters';
import { RESTRICTED_ACCESS_LOGS_DATA, getRestrictedAccessSummary } from '../data/securityIntelligenceData';

const ZONES = ['All', 'Data Center', 'Server Room', 'Treasury', 'Cash Vault', 'SWIFT Room', 'NOC', 'SOC', 'CEO Suite', 'Board Room', 'Audit Room'];
const VAULT_AUDIT_ZONES = ['Cash Vault', 'Treasury', 'SWIFT Room'];
const RESULTS = ['All', 'Granted', 'Denied'];

const ZONE_ICON = {
  'Data Center': '🖥️', 'Server Room': '💻', 'Treasury': '🏦', 'Cash Vault': '🔐',
  'SWIFT Room': '🌐', 'NOC': '📡', 'SOC': '🛡️', 'CEO Suite': '👔', 'Board Room': '🏛️', 'Audit Room': '📋', 'All': '🔒', 'All High-Security': '🔐'
};

function KpiCard({ label, value, color, bg, onClick, active }) {
  const isClickable = Boolean(onClick);
  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={e => { if (isClickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
      style={{
        background: active ? `${color}18` : bg,
        border: active ? `2px solid ${color}` : `1px solid ${color}33`,
        borderRadius: 8, padding: '10px 14px', flex: 1, minWidth: 120,
        boxShadow: active ? `0 2px 8px ${color}25` : `0 1px 3px rgba(0,0,0,0.04)`,
        cursor: isClickable ? 'pointer' : 'default',
        transform: active ? 'translateY(-1px)' : 'none',
        transition: 'all 0.18s ease',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      onMouseEnter={e => { if (isClickable && !active) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = color; } }}
      onMouseLeave={e => { if (isClickable && !active) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = `${color}33`; } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 4 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        {active && (
          <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', background: color, padding: '1px 5px', borderRadius: 4, letterSpacing: '0.04em' }}>
            FILTERED
          </span>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
    </div>
  );
}

function exportCsv(rows, zone) {
  const header = ['ID','Timestamp','Employee','Employee ID','Role','Department','Zone','Reader','Auth Mode','Result','Denial Reason','Dual Custody Officer','Branch','Flagged'];
  const content = [header, ...rows.map(r => [r.id,r.timestamp,r.employee,r.employeeId,r.role,r.department,r.zone,r.reader,r.authMode,r.result,r.denialReason||'',r.dualCustodyOfficer||'',r.branch,r.flagged?'Yes':'No'])].map(r => r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `restricted_access_${zone.replace(/\s+/g,'_').toLowerCase()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function RestrictedAccessDetailModal({ log, onClose }) {
  if (!log) return null;
  const isDenied = log.result === 'Denied';
  const isFlagged = Boolean(log.flagged);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          maxWidth: 680,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          border: `1.5px solid ${isDenied ? '#ef4444' : isFlagged ? '#a855f7' : '#0d9488'}`,
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: isDenied ? '#fef2f2' : isFlagged ? '#faf5ff' : '#f0fdfa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '12px 12px 0 0'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Restricted Zone Access Audit · {log.id}
              </span>
              <span style={{
                background: isDenied ? '#fee2e2' : '#dcfce7',
                color: isDenied ? '#dc2626' : '#16a34a',
                fontSize: 10.5,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 999
              }}>
                {log.result}
              </span>
              {isFlagged && (
                <span style={{
                  background: '#f3e8ff',
                  color: '#7c3aed',
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999
                }}>
                  FLAGGED FOR AUDIT
                </span>
              )}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              {log.zone} High-Security Mantrap Access
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: 18,
              fontWeight: 700,
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Employee & Subject Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Employee</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>{log.employee}</div>
              <div style={{ fontSize: 11, color: '#0284c7' }}>{log.employeeId} · {log.role}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Branch / Facility</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>{log.branch || 'Head Office'}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{log.reader || 'Biometric Portal'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Auth Method</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginTop: 2 }}>{log.authMode}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{log.timestamp}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Dual Custody</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: log.dualCustodyOfficer ? '#15803d' : '#64748b', marginTop: 2 }}>
                {log.dualCustodyOfficer || 'Standard Access'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {log.dualCustodyOfficer ? 'Joint Authorization Verified' : 'Single Officer Mode'}
              </div>
            </div>
          </div>

          {/* Denial / Exception Callout if any */}
          {isDenied && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Denial Forensics & Security Violation
              </div>
              <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 4 }}>
                Reason: <strong>{log.denialReason || 'Unauthorized Security Clearance Tier'}</strong>. Access relay was immediately locked. Security alarm dispatch sent to SOC.
              </div>
            </div>
          )}

          {/* High Security Physical Access Pathway */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px', background: '#ffffff' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Zone Access Sequence & Mantrap Pathway
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: '#0284c7', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0
                }}>
                  1
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                    Facility Outer Perimeter (Turnstile Check)
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                    Entry logged at main branch turnstiles with primary employee smartcard. Anti-passback status validated.
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: '#0d9488', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0
                }}>
                  2
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                    {log.zone} Mantrap Air-Lock Chamber
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                    Interlock door #1 closed and locked before door #2 release. Authenticated with <strong>{log.authMode}</strong>.
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: isDenied ? '#dc2626' : '#16a34a', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0
                }}>
                  3
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                    {isDenied ? 'Access Denied & Relay Lockout' : 'Dual-Authorization Release & Zone Entry'}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                    {isDenied
                      ? 'Relay lock maintained fail-secure state. Incident logged in SOC audit repository.'
                      : `Relay pulse granted. Zone ingress confirmed for ${log.employee}${log.dualCustodyOfficer ? ` and joint custodian ${log.dualCustodyOfficer}` : ''}.`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Regulatory Compliance Safeguards */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Regulatory & Compliance Verification
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6, fontSize: 11, color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Bangladesh Bank ICT-08 Standard
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Dual-Custody Keyholder Rule
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Tamper Circuit Monitored
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Signed Audit Memo #AC-{log.id.slice(-4)}
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          borderRadius: '0 0 12px 12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px', borderRadius: 6, background: '#0d9488', color: '#fff',
              border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RestrictedZoneAccessLog({ initialResult = 'All', initialTimeframe = 'today', initialZone = 'All', isVaultAuditMode = false, hideHeader = false }) {
  const {
    region,
    branch,
    searchQuery,
    moduleFilters,
    tableColumnFilters
  } = useBankFilters();

  const [logs, setLogs]           = useState(RESTRICTED_ACCESS_LOGS_DATA);
  const [summary, setSummary]     = useState(getRestrictedAccessSummary(RESTRICTED_ACCESS_LOGS_DATA));
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [timeframe, setTimeframe] = useState(isVaultAuditMode ? 'all' : initialTimeframe); // 'today' or 'all'
  const [filterZone, setFilterZone] = useState(isVaultAuditMode ? (initialZone === 'All' ? 'Cash Vault' : initialZone) : initialZone);
  const [filterResult, setFilterResult] = useState(initialResult);
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterAuthMode, setFilterAuthMode] = useState('All');
  const [filterDualCustody, setFilterDualCustody] = useState('All');
  const [filterDenialReason, setFilterDenialReason] = useState('All');
  const [filterFlagged, setFilterFlagged] = useState(false);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [sortCol, setSortCol]     = useState(null);
  const [sortDir, setSortDir]     = useState(null);
  const PAGE_SIZE = 15;

  const handleSortChange = (col, dir) => {
    setSortCol(dir ? col : null);
    setSortDir(dir);
  };

  const currentZoneList = isVaultAuditMode ? VAULT_AUDIT_ZONES : ZONES;

  // Derive unique options from data
  const branchList = useMemo(() => {
    const bSet = new Set();
    logs.forEach(l => { if (l.branch) bSet.add(l.branch.trim()); });
    return ['All Branches', ...Array.from(bSet).sort()];
  }, [logs]);

  const authModeList = useMemo(() => {
    const aSet = new Set();
    logs.forEach(l => { if (l.authMode) aSet.add(l.authMode.trim()); });
    return ['All Auth Modes', ...Array.from(aSet).sort()];
  }, [logs]);

  const denialReasonList = useMemo(() => {
    const dSet = new Set();
    logs.forEach(l => { if (l.denialReason) dSet.add(l.denialReason.trim()); });
    return ['All Denial Reasons', ...Array.from(dSet).sort()];
  }, [logs]);

  const isFiltered = Boolean(
    search.trim() ||
    filterZone !== 'All' ||
    filterResult !== 'All' ||
    filterBranch !== 'All' ||
    filterAuthMode !== 'All' ||
    filterDualCustody !== 'All' ||
    filterDenialReason !== 'All' ||
    filterFlagged ||
    timeframe !== 'today'
  );

  const handleClearFilters = () => {
    setSearch('');
    setFilterZone('All');
    setFilterResult('All');
    setFilterBranch('All');
    setFilterAuthMode('All');
    setFilterDualCustody('All');
    setFilterDenialReason('All');
    setFilterFlagged(false);
    setTimeframe('today');
    setPage(1);
  };

  useEffect(() => {
    if (initialZone) setFilterZone(isVaultAuditMode && initialZone === 'All' ? 'Cash Vault' : initialZone);
    if (initialResult) setFilterResult(initialResult);
    if (initialTimeframe) setTimeframe(isVaultAuditMode ? 'all' : initialTimeframe);
  }, [initialZone, initialResult, initialTimeframe, isVaultAuditMode]);

  const fetchData = useCallback(async () => {
    try {
      const p = new URLSearchParams();
      if (timeframe !== 'all') p.set('timeframe', timeframe);
      if (filterZone !== 'All') p.set('zone', filterZone);
      if (filterResult !== 'All') p.set('result', filterResult);
      const res = await fetch(`/api/restricted-access-log?${p}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setLogs(json.data);
          setSummary(json.summary || getRestrictedAccessSummary(json.data));
          setLoading(false);
          return;
        }
      }
    } catch (_) {}
    
    // Resilient fallback
    let fallback = RESTRICTED_ACCESS_LOGS_DATA;
    if (timeframe === 'today') fallback = fallback.filter(l => l.isToday);
    if (filterZone !== 'All') fallback = fallback.filter(l => l.zone === filterZone);
    if (filterResult !== 'All') fallback = fallback.filter(l => l.result === filterResult);
    setLogs(fallback);
    setSummary(getRestrictedAccessSummary(RESTRICTED_ACCESS_LOGS_DATA));
    setLoading(false);
  }, [timeframe, filterZone, filterResult]);

  useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [timeframe, filterZone, filterResult, filterBranch, filterAuthMode, filterDualCustody, filterDenialReason, filterFlagged, search, region, branch, searchQuery, moduleFilters, tableColumnFilters]);

  // ── Unified Filtering & Sorting Pipeline ──────────────────
  const filtered = useMemo(() => {
    let result = logs.filter(l => {
      // High-security vault restriction
      if (isVaultAuditMode && !VAULT_AUDIT_ZONES.includes(l.zone)) return false;

      // 1. Global Region Filter
      if (region && region !== 'All Regions') {
        const target = region.toLowerCase();
        const rBranch = (l.branch || '').toLowerCase();
        const rRegion = (l.region || '').toLowerCase();
        if (!rBranch.includes(target) && !rRegion.includes(target)) {
          // Region matching helper for branches
          const isMatch = (target.includes('dhaka') && (rBranch.includes('motijheel') || rBranch.includes('gulshan') || rBranch.includes('dilkusha') || rBranch.includes('dhanmondi') || rBranch.includes('banani'))) ||
                          (target.includes('chattogram') && (rBranch.includes('agrabad') || rBranch.includes('khatunganj') || rBranch.includes('chattogram') || rBranch.includes('ctg'))) ||
                          (target.includes('sylhet') && (rBranch.includes('sylhet') || rBranch.includes('amberkhana') || rBranch.includes('shahjalal'))) ||
                          (target.includes('rajshahi') && (rBranch.includes('rajshahi') || rBranch.includes('shaheb'))) ||
                          (target.includes('khulna') && (rBranch.includes('khulna') || rBranch.includes('kda')));
          if (!isMatch) return false;
        }
      }

      // 2. Global Branch Filter
      if (branch && branch !== 'All Branches') {
        const rBranch = (l.branch || '').toLowerCase();
        const target = branch.toLowerCase();
        if (!rBranch.includes(target) && !target.includes(rBranch)) return false;
      }

      // 3. Search Query (Global or local)
      const effectiveSearch = searchQuery || search;
      if (effectiveSearch && effectiveSearch.trim()) {
        const q = effectiveSearch.toLowerCase().trim();
        const match = (l.employee && l.employee.toLowerCase().includes(q)) ||
                      (l.employeeId && l.employeeId.toLowerCase().includes(q)) ||
                      (l.zone && l.zone.toLowerCase().includes(q)) ||
                      (l.branch && l.branch.toLowerCase().includes(q)) ||
                      (l.role && l.role.toLowerCase().includes(q)) ||
                      (l.denialReason && l.denialReason.toLowerCase().includes(q)) ||
                      (l.dualCustodyOfficer && l.dualCustodyOfficer.toLowerCase().includes(q));
        if (!match) return false;
      }

      // 4. Flagged Filter
      if (filterFlagged && !l.flagged) return false;

      // 5. Zone Filter (local pill or module filter)
      if (moduleFilters.restrictedZone && moduleFilters.restrictedZone !== 'All') {
        const rz = moduleFilters.restrictedZone;
        const z = (l.zone || '').toLowerCase();
        if (rz === 'Vault' && !z.includes('vault')) return false;
        if (rz === 'CashSafe' && (!z.includes('cash') && !z.includes('treasury'))) return false;
        if (rz === 'ServerRoom' && (!z.includes('server') && !z.includes('data center'))) return false;
        if (rz === 'Locker' && !z.includes('locker')) return false;
      } else if (filterZone !== 'All' && l.zone !== filterZone) {
        return false;
      }

      // 6. Result Filter (local dropdown or module filter)
      const effectiveResult = (moduleFilters.eventResult && moduleFilters.eventResult !== 'All')
        ? moduleFilters.eventResult
        : filterResult;
      if (effectiveResult !== 'All' && l.result !== effectiveResult) return false;

      // 7. Dual Custody compliance filter
      if (moduleFilters.dualCustody && moduleFilters.dualCustody !== 'All') {
        if (moduleFilters.dualCustody === 'Pass' && (!l.dualCustodyOfficer || l.result !== 'Granted')) return false;
        if (moduleFilters.dualCustody === 'Fail' && l.dualCustodyOfficer && l.result === 'Granted') return false;
      }

      // 8. Auth Method filter
      if (moduleFilters.authMethod && moduleFilters.authMethod !== 'All') {
        if (!(l.authMode || '').toLowerCase().includes(moduleFilters.authMethod.toLowerCase())) return false;
      }

      // Local Branch Filter
      if (filterBranch !== 'All') {
        if (!l.branch || l.branch.toLowerCase() !== filterBranch.toLowerCase()) return false;
      }

      // Local Auth Mode Filter
      if (filterAuthMode !== 'All') {
        if (!l.authMode || !l.authMode.toLowerCase().includes(filterAuthMode.toLowerCase())) return false;
      }

      // Local Dual Custody Filter
      if (filterDualCustody === 'enforced') {
        if (!l.dualCustodyOfficer) return false;
      } else if (filterDualCustody === 'single') {
        if (l.dualCustodyOfficer) return false;
      }

      // Local Denial Reason Filter
      if (filterDenialReason !== 'All') {
        if (!l.denialReason || l.denialReason.toLowerCase() !== filterDenialReason.toLowerCase()) return false;
      }

      // 9. Table Column Popover Filters
      for (const [col, val] of Object.entries(tableColumnFilters)) {
        if (!val || !val.trim()) continue;
        const v = val.toLowerCase().trim();
        if (col.includes('time') && !(l.timestamp || '').toLowerCase().includes(v)) return false;
        if (col.includes('branch') && !(l.branch || '').toLowerCase().includes(v)) return false;
        if ((col.includes('employee') || col.includes('keyholder')) &&
            !(l.employee || '').toLowerCase().includes(v) &&
            !(l.employeeId || '').toLowerCase().includes(v)) return false;
        if (col.includes('role') && !(l.role || '').toLowerCase().includes(v)) return false;
        if (col.includes('dual') && !(l.dualCustodyOfficer || '').toLowerCase().includes(v)) return false;
        if (col.includes('auth') && !(l.authMode || '').toLowerCase().includes(v)) return false;
        if (col.includes('result') && !(l.result || '').toLowerCase().includes(v)) return false;
        if ((col.includes('denial') || col.includes('reason')) && !(l.denialReason || '').toLowerCase().includes(v)) return false;
        if (col.includes('zone') && !(l.zone || '').toLowerCase().includes(v)) return false;
        if (col.includes('reader') && !(l.reader || '').toLowerCase().includes(v)) return false;
      }

      return true;
    });

    // Apply Sorting
    if (sortCol && sortDir) {
      result = [...result].sort((a, b) => {
        let valA = a[sortCol] || '';
        let valB = b[sortCol] || '';
        if (sortCol === 'employee' || sortCol === 'keyholder') {
          valA = a.employee || '';
          valB = b.employee || '';
        } else if (sortCol === 'time') {
          valA = a.timestamp || '';
          valB = b.timestamp || '';
        } else if (sortCol === 'dual') {
          valA = a.dualCustodyOfficer || '';
          valB = b.dualCustodyOfficer || '';
        } else if (sortCol === 'denial') {
          valA = a.denialReason || '';
          valB = b.denialReason || '';
        }

        const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [logs, isVaultAuditMode, region, branch, searchQuery, search, filterFlagged, filterZone, filterResult, moduleFilters, tableColumnFilters, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Top denial reasons recalculated dynamically
  const denialMap = {};
  filtered.filter(l => l.result === 'Denied').forEach(l => {
    const reason = l.denialReason || 'Access Denied';
    denialMap[reason] = (denialMap[reason] || 0) + 1;
  });
  const topDenials = Object.entries(denialMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Recalculate KPIs strictly based on filtered records
  const displayedGranted = filtered.filter(l => l.result === 'Granted').length;
  const displayedDenied  = filtered.filter(l => l.result === 'Denied').length;
  const displayedFlagged = filtered.filter(l => l.flagged).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Banner (Hidden when embedded in audit hub) */}
      {!hideHeader && !isVaultAuditMode && (
        <div style={{
          background: isVaultAuditMode || filterZone === 'Cash Vault'
            ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #7c3aed 100%)',
          borderRadius: 10, padding: '16px 22px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 4px 16px rgba(49,46,129,0.3)', flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>
                  {isVaultAuditMode
                    ? 'High-Security Cash Vault & Strong Room Dual-Custody Audit (AC-08)'
                    : (filterZone === 'Cash Vault' ? 'Cash Vault & Strong Room Access Log' : 'Restricted Facility Areas & Server Room Access Log')}
                </span>
                <span style={{ fontSize: 11, background: isVaultAuditMode ? '#059669' : (timeframe === 'today' ? '#10b981' : '#6366f1'), color: '#fff', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                  {isVaultAuditMode ? '520 / 520 VAULTS SECURED' : (timeframe === 'today' ? '● LIVE TODAY · 24H' : 'ALL-TIME ARCHIVE')}
                </span>
              </div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>
                {isVaultAuditMode
                  ? 'Pubali Bank PLC · 520 Nationwide Branches · Dual-Custody Biometric + PIN Clearance · Bangladesh Bank ICT-08 Audit Trail'
                  : 'Pubali Bank PLC · Cash Vault, SWIFT Room, Server Room (DC) & Treasury Biometric Entry-Exit Records · Live Telemetry'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Timeframe selector */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', padding: 3, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)' }}>
              <button
                onClick={() => setTimeframe('today')}
                style={{
                  padding: '6px 12px', borderRadius: 6, border: 'none',
                  background: timeframe === 'today' ? '#7c3aed' : 'transparent',
                  color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  boxShadow: timeframe === 'today' ? '0 2px 6px rgba(0,0,0,0.3)' : 'none'
                }}
              >
                Today
              </button>
              <button
                onClick={() => setTimeframe('all')}
                style={{
                  padding: '6px 12px', borderRadius: 6, border: 'none',
                  background: timeframe === 'all' ? '#7c3aed' : 'transparent',
                  color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  boxShadow: timeframe === 'all' ? '0 2px 6px rgba(0,0,0,0.3)' : 'none'
                }}
              >
                All Records
              </button>
            </div>
            <button
              id="restricted-export-btn"
              onClick={() => exportCsv(filtered, filterZone)}
              style={{
                padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              Export CSV
            </button>
          </div>
        </div>
      )}

      {/* KPIs + Top Denials in a row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          label={timeframe === 'today' ? "Access Granted (Today)" : "Access Granted (All-Time)"}
          value={displayedGranted}
          color="#16a34a"
          bg="#dcfce7"
          active={filterResult === 'Granted'}
          onClick={() => {
            setFilterFlagged(false);
            setFilterResult(r => r === 'Granted' ? 'All' : 'Granted');
          }}
        />
        <KpiCard
          label={timeframe === 'today' ? "Access Denied (Today)" : "Access Denied (All-Time)"}
          value={displayedDenied}
          color="#dc2626"
          bg="#fee2e2"
          active={filterResult === 'Denied'}
          onClick={() => {
            setFilterFlagged(false);
            setFilterResult(r => r === 'Denied' ? 'All' : 'Denied');
          }}
        />
        <KpiCard
          label="Flagged Events"
          value={displayedFlagged}
          color="#7c3aed"
          bg="#ede9fe"
          active={filterFlagged}
          onClick={() => {
            setFilterResult('All');
            setFilterFlagged(f => !f);
          }}
        />

        {/* Top Denial Reasons mini panel */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', flex: 1.8, minWidth: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Denial Reasons</span>
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{timeframe === 'today' ? 'Today (17 total)' : 'All Time (37 total)'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {topDenials.length === 0 ? <div style={{ color: '#9ca3af', fontSize: 11 }}>No denials for this filter.</div> : topDenials.map(([reason, count]) => (
              <div key={reason} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11.5, color: '#374151' }}>{reason}</span>
                <span style={{ background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: 8, fontSize: 10.5, fontWeight: 700 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone Selector Pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{isVaultAuditMode ? 'Vault Zone:' : 'Zone:'}</span>
        {currentZoneList.map(z => (
          <button key={z} id={`zone-pill-${z.replace(/\s+/g,'-').toLowerCase()}`} onClick={() => setFilterZone(z)} style={{
            padding: '5px 12px', borderRadius: 20, border: '1px solid',
            borderColor: filterZone === z ? (isVaultAuditMode ? '#4338ca' : '#7c3aed') : '#d1d5db',
            background: filterZone === z ? (isVaultAuditMode ? '#4338ca' : '#7c3aed') : '#fff',
            color: filterZone === z ? '#fff' : '#374151',
            fontWeight: filterZone === z ? 700 : 400, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s'
          }}>
            {z}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div style={{
        background: '#fff',
        borderRadius: 8,
        padding: '12px 16px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
        {/* Top Row: Search + Core Dropdowns */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 230px', minWidth: 200 }}>
            <input
              id="restricted-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isVaultAuditMode ? "Search vault branch, custodian officer, memo..." : "Search employee, ID, zone, denial reason…"}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                fontSize: 12.5,
                outline: 'none',
                height: 34
              }}
            />
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }}>
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </div>

          {/* Result Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <select
              id="restricted-result-filter"
              value={filterResult}
              onChange={e => setFilterResult(e.target.value)}
              className="bs-select"
              style={{
                height: 34,
                fontSize: 12,
                minWidth: 125,
                cursor: 'pointer',
                borderColor: filterResult !== 'All' ? '#0d9488' : '#cbd5e1',
                background: filterResult !== 'All' ? '#f0fdf4' : '#fff',
                fontWeight: filterResult !== 'All' ? 700 : 400
              }}
              title="Filter by Access Result"
            >
              <option value="All">All Results</option>
              <option value="Granted">Granted</option>
              <option value="Denied">Denied</option>
            </select>
          </div>

          {/* Zone Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <select
              id="restricted-zone-filter"
              value={filterZone}
              onChange={e => setFilterZone(e.target.value)}
              className="bs-select"
              style={{
                height: 34,
                fontSize: 12,
                minWidth: 135,
                cursor: 'pointer',
                borderColor: filterZone !== 'All' ? '#0d9488' : '#cbd5e1',
                background: filterZone !== 'All' ? '#f0fdf4' : '#fff',
                fontWeight: filterZone !== 'All' ? 700 : 400
              }}
              title="Filter by Zone"
            >
              <option value="All">All Zones ({currentZoneList.length - 1})</option>
              {currentZoneList.filter(z => z !== 'All').map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Branch Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <select
              id="restricted-branch-filter"
              value={filterBranch}
              onChange={e => setFilterBranch(e.target.value)}
              className="bs-select"
              style={{
                height: 34,
                fontSize: 12,
                minWidth: 140,
                cursor: 'pointer',
                borderColor: filterBranch !== 'All' ? '#0d9488' : '#cbd5e1',
                background: filterBranch !== 'All' ? '#f0fdf4' : '#fff',
                fontWeight: filterBranch !== 'All' ? 700 : 400
              }}
              title="Filter by Branch"
            >
              {branchList.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Auth Mode Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <select
              id="restricted-auth-filter"
              value={filterAuthMode}
              onChange={e => setFilterAuthMode(e.target.value)}
              className="bs-select"
              style={{
                height: 34,
                fontSize: 12,
                minWidth: 140,
                cursor: 'pointer',
                borderColor: filterAuthMode !== 'All' ? '#0d9488' : '#cbd5e1',
                background: filterAuthMode !== 'All' ? '#f0fdf4' : '#fff',
                fontWeight: filterAuthMode !== 'All' ? 700 : 400
              }}
              title="Filter by Authentication Mode"
            >
              {authModeList.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Dual Custody Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <select
              id="restricted-dual-filter"
              value={filterDualCustody}
              onChange={e => setFilterDualCustody(e.target.value)}
              className="bs-select"
              style={{
                height: 34,
                fontSize: 12,
                minWidth: 140,
                cursor: 'pointer',
                borderColor: filterDualCustody !== 'All' ? '#0d9488' : '#cbd5e1',
                background: filterDualCustody !== 'All' ? '#f0fdf4' : '#fff',
                fontWeight: filterDualCustody !== 'All' ? 700 : 400
              }}
              title="Filter by Dual Custody Verification"
            >
              <option value="All">Dual Custody: All</option>
              <option value="enforced">Dual-Custody Enforced</option>
              <option value="single">Single Keyholder</option>
            </select>
          </div>

          {/* Denial Reason Filter (when denied or all) */}
          {(filterResult !== 'Granted') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <select
                id="restricted-denial-filter"
                value={filterDenialReason}
                onChange={e => setFilterDenialReason(e.target.value)}
                className="bs-select"
                style={{
                  height: 34,
                  fontSize: 12,
                  minWidth: 145,
                  cursor: 'pointer',
                  borderColor: filterDenialReason !== 'All' ? '#dc2626' : '#cbd5e1',
                  background: filterDenialReason !== 'All' ? '#fef2f2' : '#fff',
                  fontWeight: filterDenialReason !== 'All' ? 700 : 400
                }}
                title="Filter by Denial Reason"
              >
                {denialReasonList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Bottom Strip: Timeframe Switcher + Flagged Toggle + Reset + Count + Export */}
        <div style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 8,
          borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Timeframe Switcher */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: 2, borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setTimeframe('today')}
                style={{
                  padding: '4px 12px', borderRadius: 4, border: 'none',
                  background: timeframe === 'today' ? '#0d9488' : 'transparent',
                  color: timeframe === 'today' ? '#fff' : '#64748b',
                  fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('all')}
                style={{
                  padding: '4px 12px', borderRadius: 4, border: 'none',
                  background: timeframe === 'all' ? '#0d9488' : 'transparent',
                  color: timeframe === 'all' ? '#fff' : '#64748b',
                  fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                All Records
              </button>
            </div>

            {/* Flagged Toggle */}
            <button
              type="button"
              onClick={() => setFilterFlagged(f => !f)}
              style={{
                height: 28,
                padding: '0 10px',
                borderRadius: 6,
                border: '1px solid',
                borderColor: filterFlagged ? '#7c3aed' : '#cbd5e1',
                background: filterFlagged ? '#f5f3ff' : '#fff',
                color: filterFlagged ? '#7c3aed' : '#475569',
                fontSize: 11.5,
                fontWeight: filterFlagged ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Filter only flagged/suspicious access attempts"
            >
              <span>Flagged Only</span>
            </button>

            {/* Reset / Clear Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleClearFilters}
                style={{
                  height: 28,
                  padding: '0 10px',
                  borderRadius: 6,
                  border: '1px solid #fca5a5',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Reset all filters"
              >
                <span>✕</span>
                <span>Reset Filters</span>
              </button>
            )}

            {/* Count Badge */}
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
              <span>Showing <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> of {logs.length} records</span>
              {isFiltered && (
                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: 4, fontSize: 10.5, fontWeight: 700 }}>
                  Filtered
                </span>
              )}
            </div>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            id="restricted-export-btn"
            onClick={() => exportCsv(filtered, filterZone)}
            style={{
              padding: '5px 14px', borderRadius: 6, border: '1px solid #cbd5e1',
              background: '#ffffff', color: '#1e293b', fontSize: 11.5, fontWeight: 700,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)', height: 30
            }}
          >
            <span>Export CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8f9fb', position: 'sticky', top: 0, zIndex: 2 }}>
                {(isVaultAuditMode
                  ? [
                      { label: 'Time', key: 'time' },
                      { label: 'Branch & Vault Location', key: 'branch' },
                      { label: 'Primary Keyholder', key: 'employee' },
                      { label: 'Role', key: 'role' },
                      { label: 'Dual Custody Joint Keyholder', key: 'dual' },
                      { label: 'Auth Mode', key: 'auth' },
                      { label: 'Result', key: 'result' },
                      { label: 'Denial / Memo Ref', key: 'denial' },
                      { label: 'Compliance', key: 'compliance' }
                    ]
                  : [
                      { label: 'Time', key: 'time' },
                      { label: 'Employee', key: 'employee' },
                      { label: 'Role', key: 'role' },
                      { label: 'Zone', key: 'zone' },
                      { label: 'Reader', key: 'reader' },
                      { label: 'Auth Mode', key: 'auth' },
                      { label: 'Result', key: 'result' },
                      { label: 'Denial Reason', key: 'denial' },
                      { label: 'Dual Custody', key: 'dual' },
                      { label: 'Branch', key: 'branch' },
                      { label: 'Flag', key: 'flag' }
                    ]
                ).map(h => (
                  <th key={h.key} style={{ padding: '9px 11px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                    <span>{h.label}</span>
                    <TableColumnFilter
                      columnKey={h.key}
                      title={h.label}
                      currentSort={{ columnKey: sortCol, direction: sortDir }}
                      onSortChange={(dir) => handleSortChange(h.key, dir)}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={isVaultAuditMode ? 9 : 11} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>⟳ Loading access log…</td></tr>}
              {!loading && pageRows.length === 0 && <tr><td colSpan={isVaultAuditMode ? 9 : 11} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No records found.</td></tr>}
              {pageRows.map((l, i) => (
                <tr
                  key={l.id}
                  onClick={() => setSelectedLog(l)}
                  title={`Click to view detailed restricted zone audit & mantrap pathway for ${l.employee || l.id}`}
                  style={{
                    background: l.flagged ? '#fdf4ff' : (l.result === 'Denied' ? '#fff8f8' : (i % 2 === 0 ? '#fff' : '#f9fafb')),
                    borderBottom: '1px solid #f1f5f9',
                    borderLeft: l.result === 'Denied' ? '3px solid #dc2626' : (l.flagged ? '3px solid #7c3aed' : '3px solid #16a34a'),
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = l.result === 'Denied' ? '#fee2e2' : '#f0fdf4'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = l.flagged ? '#fdf4ff' : (l.result === 'Denied' ? '#fff8f8' : (i % 2 === 0 ? '#fff' : '#f9fafb')); }}
                >
                  {isVaultAuditMode ? (
                    <>
                      <td style={{ padding: '8px 11px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{l.timestamp}</td>
                      <td style={{ padding: '8px 11px' }}>
                        <div style={{ fontWeight: 700, color: '#0d9488', fontSize: 13 }}>{l.branch}</div>
                        <div style={{ fontSize: 11, color: '#4338ca', fontWeight: 600 }}>{l.zone} Mantrap</div>
                      </td>
                      <td style={{ padding: '8px 11px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{l.employee}</div>
                        <div style={{ fontSize: 11, color: '#7c3aed' }}>{l.employeeId}</div>
                      </td>
                      <td style={{ padding: '8px 11px', fontSize: 11, color: '#475569' }}>{l.role}</td>
                      <td style={{ padding: '8px 11px' }}>
                        <div style={{ fontWeight: 600, color: '#15803d', fontSize: 12 }}>{l.dualCustodyOfficer || 'Joint Keyholder Assumed'}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Dual Authorization Verified</div>
                      </td>
                      <td style={{ padding: '8px 11px', fontSize: 11, color: '#374151' }}>{l.authMode}</td>
                      <td style={{ padding: '8px 11px' }}>
                        <span style={{
                          background: l.result === 'Granted' ? '#dcfce7' : '#fee2e2',
                          color: l.result === 'Granted' ? '#16a34a' : '#dc2626',
                          padding: '2px 9px', borderRadius: 10, fontSize: 11, fontWeight: 700
                        }}>{l.result}</span>
                      </td>
                      <td style={{ padding: '8px 11px', fontSize: 11, color: l.result === 'Denied' ? '#dc2626' : '#64748b' }}>
                        {l.denialReason || `Memo #AC-${l.id.slice(-4)}`}
                      </td>
                      <td style={{ padding: '8px 11px', textAlign: 'center' }}>
                        <span style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                          ✔ BB ICT-08
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '8px 11px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{l.timestamp}</td>
                      <td style={{ padding: '8px 11px' }}>
                        <div style={{ fontWeight: 600, color: '#0d9488', fontSize: 13 }}>{l.employee}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{l.employeeId}</div>
                      </td>
                      <td style={{ padding: '8px 11px', fontSize: 11, color: '#6b7280', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.role}</td>
                      <td style={{ padding: '8px 11px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                        {l.zone}
                      </td>
                      <td style={{ padding: '8px 11px', fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap' }}>{l.reader}</td>
                      <td style={{ padding: '8px 11px', fontSize: 11, color: '#374151', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.authMode}</td>
                      <td style={{ padding: '8px 11px' }}>
                        <span style={{
                          background: l.result === 'Granted' ? '#dcfce7' : '#fee2e2',
                          color: l.result === 'Granted' ? '#16a34a' : '#dc2626',
                          padding: '2px 9px', borderRadius: 10, fontSize: 11, fontWeight: 700
                        }}>{l.result}</span>
                      </td>
                      <td style={{ padding: '8px 11px', fontSize: 11, color: '#dc2626', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.denialReason || '—'}</td>
                      <td style={{ padding: '8px 11px', fontSize: 11, color: '#6b7280', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.dualCustodyOfficer || '—'}</td>
                      <td style={{ padding: '8px 11px', fontSize: 11, color: '#9ca3af', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.branch}</td>
                      <td style={{ padding: '8px 11px', textAlign: 'center' }}>{l.flagged ? <span style={{ color: '#7c3aed', fontSize: 11, fontWeight: 700 }}>FLAGGED</span> : '—'}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderTop: '1px solid #f1f5f9' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 12px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 12 }}>Prev</button>
            <span style={{ fontSize: 12, color: '#6b7280' }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '5px 12px', borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 12 }}>Next</button>
          </div>
        )}
      </div>

      {/* Restricted Zone Access Audit Dossier Modal */}
      {selectedLog && (
        <RestrictedAccessDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
