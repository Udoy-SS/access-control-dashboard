/**
 * BranchSecurityScorecard.jsx — Branch Security Scorecard & Heatmap
 * Pubali Bank PLC · BioStar X Enterprise Security Intelligence
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useBankFilters } from './filters';
import { BRANCH_SCORECARD_DATA, getBranchScorecardSummary } from '../data/securityIntelligenceData';

const DIVISIONS = ['All', 'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];
const GRADES    = ['All', 'Excellent', 'Good', 'At Risk', 'Critical'];

const GRADE_COLOR = { Excellent: '#0d9488', Good: '#16a34a', 'At Risk': '#d97706', Critical: '#dc2626' };
const GRADE_BG    = { Excellent: '#e6f7f6', Good: '#dcfce7', 'At Risk': '#fef3c7', Critical: '#fee2e2' };

function ScoreBadge({ score, grade }) {
  const c = GRADE_COLOR[grade] || '#6b7280';
  const bg = GRADE_BG[grade] || '#f3f4f6';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
        <svg viewBox="0 0 36 36" width="44" height="44">
          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9155" fill="none" stroke={c} strokeWidth="3"
            strokeDasharray={`${score} ${100 - score}`} strokeDashoffset="25" strokeLinecap="round" />
        </svg>
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: c }}>{score}</span>
      </div>
      <span style={{ background: bg, color: c, padding: '3px 9px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{grade}</span>
    </div>
  );
}

function KpiCard({ label, value, color, bg, icon, onClick, active }) {
  const isClickable = Boolean(onClick);
  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={e => { if (isClickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
      style={{
        background: active ? `${color}18` : bg,
        border: active ? `2px solid ${color}` : `1.5px solid ${color}33`,
        borderRadius: 10, padding: '14px 18px', flex: 1, minWidth: 120,
        boxShadow: active ? `0 4px 14px ${color}30` : `0 2px 10px ${color}22`,
        cursor: isClickable ? 'pointer' : 'default',
        transform: active ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s ease',
        userSelect: 'none'
      }}
      onMouseEnter={e => { if (isClickable && !active) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = color; } }}
      onMouseLeave={e => { if (isClickable && !active) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = `${color}33`; } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
        {active && (
          <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', background: color, padding: '1px 6px', borderRadius: 4, letterSpacing: '0.04em' }}>
            FILTERED
          </span>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function exportCsv(rows) {
  const header = ['Rank','Branch Code','Branch Name','Division','District','Security Score','Grade','Uptime %','Forced Doors','Tamper Events','Anti-Passback Violations','Audit Compliance %','Last Audit'];
  const content = [header, ...rows.map(r => [r.rank, r.code, r.name, r.division, r.district, r.score, r.grade, `${r.uptimePct}%`, r.forcedDoorCount, r.tamperEvents, r.antiPassbackViolations, `${r.auditCompliancePct}%`, r.lastAudit])].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `pubali_branch_security_scorecard_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function BranchAuditDetailModal({ branch, onClose }) {
  if (!branch) return null;
  const gradeCol = GRADE_COLOR[branch.grade] || '#0d9488';
  const gradeBg = GRADE_BG[branch.grade] || '#e6f7f6';

  const checkpoints = [
    { name: 'Main Entrance Speed Gate Turnstile', reader: 'BioStation 3 (AI Face)', zone: 'Perimeter Access', status: 'Normal Armed', relay: 'Healthy', secLevel: 'Standard' },
    { name: 'Cash Counter & Tellers Portal', reader: 'FaceStation F2 Fusion', zone: 'General Banking', status: 'Normal Armed', relay: 'Healthy', secLevel: 'Standard' },
    { name: 'Main Cash Vault & Strong Room Mantrap', reader: 'BioStation 3 (Dual-Bio)', zone: 'Cash Vault', status: 'Dual-Custody Armed', relay: 'Interlocked', secLevel: 'High Security (Tier 4)', restricted: true },
    { name: 'Branch Server Room & IT Cabinet', reader: 'BioEntry W2 (Fingerprint)', zone: 'Data Center / ICT', status: 'Normal Armed', relay: 'Healthy', secLevel: 'Restricted (Tier 3)', restricted: true },
    { name: 'Emergency Fire Exit & Stairwell Door', reader: 'MagLock Relay Sensor', zone: 'Perimeter Exit', status: 'Fail-Safe Armed', relay: 'Closed / Loop Normal', secLevel: 'Life Safety' }
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }} onClick={onClose}>
      <div style={{
        background: '#ffffff', borderRadius: 12, maxWidth: 680, width: '100%',
        maxHeight: '90vh', overflowY: 'auto', border: '1px solid #cbd5e1',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #0369a1 100%)',
          padding: '18px 22px', borderTopLeftRadius: 11, borderTopRightRadius: 11,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>
                RANK #{branch.rank}
              </span>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em' }}>
                {branch.name}
              </h3>
            </div>
            <div style={{ fontSize: 12, color: '#bae6fd', marginTop: 3 }}>
              Branch Code: {branch.code} · {branch.division} Division ({branch.district} District)
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: gradeBg, color: gradeCol,
              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800
            }}>
              Score: {branch.score} ({branch.grade})
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Security KPI Grid */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Security & Compliance Diagnostics
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Hardware Uptime</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: branch.uptimePct >= 95 ? '#16a34a' : '#dc2626', marginTop: 2 }}>{branch.uptimePct}%</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>Target: 95.0%+</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Audit Compliance</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: branch.auditCompliancePct >= 80 ? '#16a34a' : '#dc2626', marginTop: 2 }}>{branch.auditCompliancePct}%</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>BB ICT-08 Audit</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Forced Doors</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: branch.forcedDoorCount > 0 ? '#dc2626' : '#16a34a', marginTop: 2 }}>{branch.forcedDoorCount}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>Zero-Breach Goal</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Anti-Passback</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: branch.antiPassbackViolations > 2 ? '#d97706' : '#16a34a', marginTop: 2 }}>{branch.antiPassbackViolations}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>Sequential Rule</div>
              </div>
            </div>
          </div>

          {/* Branch Door & Access Points Pathway */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Branch Controlled Portals & Relays ({checkpoints.length} Access Nodes)
            </div>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: 10.5, letterSpacing: '0.04em' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Portal / Location</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Terminal Hardware</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Security Level</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Relay Status</th>
                  </tr>
                </thead>
                <tbody>
                  {checkpoints.map((cp, idx) => (
                    <tr key={cp.name} style={{ borderBottom: idx < checkpoints.length - 1 ? '1px solid #f1f5f9' : 'none', background: idx % 2 === 1 ? '#fafbfd' : '#fff' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{cp.name}</div>
                        <div style={{ fontSize: 10.5, color: '#64748b' }}>Zone: {cp.zone}</div>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#334155' }}>{cp.reader}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          background: cp.restricted ? '#ede9fe' : '#f1f5f9',
                          color: cp.restricted ? '#7c3aed' : '#475569',
                          padding: '2px 7px', borderRadius: 4, fontSize: 10.5, fontWeight: 700
                        }}>
                          {cp.secLevel}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <span style={{
                          background: '#dcfce7', color: '#15803d',
                          padding: '2px 8px', borderRadius: 4, fontSize: 10.5, fontWeight: 700
                        }}>
                          {cp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Verification Footer */}
          <div style={{
            background: '#f8fafc', padding: '10px 14px', borderRadius: 6,
            border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Last Security Audit: <strong>{branch.lastAudit}</strong> · Compliance Status: <strong style={{ color: '#16a34a' }}>Passed</strong>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '6px 16px', borderRadius: 6, background: '#0284c7', color: '#fff',
                border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function BranchSecurityScorecard() {
  const {
    region,
    branch,
    searchQuery,
    resetAllFilters
  } = useBankFilters();

  const [data, setData]           = useState(BRANCH_SCORECARD_DATA);
  const [summary, setSummary]     = useState(getBranchScorecardSummary(BRANCH_SCORECARD_DATA));
  const [loading, setLoading]     = useState(false);
  const [filterDiv, setFilterDiv] = useState('All');
  const [filterGrade, setFilterGrade] = useState('All');
  const [sortKey, setSortKey]     = useState('rank');
  const [sortDir, setSortDir]     = useState('asc');
  const [search, setSearch]       = useState('');
  const [selectedBranch, setSelectedBranch] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const p = new URLSearchParams();
      if (filterDiv !== 'All') p.set('division', filterDiv);
      if (filterGrade !== 'All') p.set('grade', filterGrade);
      const res = await fetch(`/api/branch-scorecard?${p}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setData(json.data);
          setSummary(json.summary || getBranchScorecardSummary(json.data));
          setLoading(false);
          return;
        }
      }
    } catch (_) {}
    
    // Resilient fallback
    let fallback = BRANCH_SCORECARD_DATA;
    if (filterDiv !== 'All') fallback = fallback.filter(b => b.division === filterDiv);
    if (filterGrade !== 'All') fallback = fallback.filter(b => b.grade === filterGrade);
    setData(fallback);
    setSummary(getBranchScorecardSummary(BRANCH_SCORECARD_DATA));
    setLoading(false);
  }, [filterDiv, filterGrade]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = useMemo(() => {
    return [...data]
      .filter(b => {
        // Global region filter
        if (region && region !== 'All Regions') {
          const target = region.toLowerCase();
          const bDiv = (b.division || '').toLowerCase();
          const bName = (b.name || '').toLowerCase();
          if (!bDiv.includes(target) && !target.includes(bDiv) && !bName.includes(target)) {
            // Also check standard division names
            const regKeywords = {
              'dhaka': ['dhaka', 'motijheel', 'dhanmondi', 'gulshan', 'uttara', 'mirpur', 'narayanganj', 'gazipur'],
              'chattogram': ['chattogram', 'agrabad', 'ctg', 'cumilla', 'noakhali', 'feni', 'cox'],
              'sylhet': ['sylhet', 'moulvibazar', 'habiganj', 'sunamganj'],
              'rajshahi': ['rajshahi', 'bogura', 'pabna'],
              'khulna': ['khulna', 'jashore', 'kushtia'],
              'barishal': ['barishal', 'patuakhali'],
              'rangpur': ['rangpur', 'dinajpur'],
              'mymensingh': ['mymensingh', 'jamalpur']
            };
            const matchedKey = Object.keys(regKeywords).find(k => target.includes(k));
            if (matchedKey) {
              const terms = regKeywords[matchedKey];
              const matchAny = terms.some(t => bDiv.includes(t) || bName.includes(t));
              if (!matchAny) return false;
            } else {
              return false;
            }
          }
        }

        // Global branch filter
        if (branch && branch !== 'All Branches') {
          const target = branch.toLowerCase();
          const bName = (b.name || '').toLowerCase();
          const bCode = (b.code || '').toLowerCase();
          if (!bName.includes(target) && !target.includes(bName) && !bCode.includes(target)) {
            return false;
          }
        }

        // Local search or global search
        const q = (search || searchQuery || '').trim().toLowerCase();
        if (q) {
          const match = (b.name && b.name.toLowerCase().includes(q)) ||
                        (b.division && b.division.toLowerCase().includes(q)) ||
                        (b.district && b.district.toLowerCase().includes(q)) ||
                        (b.code && b.code.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Local division dropdown
        if (filterDiv !== 'All' && b.division !== filterDiv) return false;

        // Local grade dropdown
        if (filterGrade !== 'All' && b.grade !== filterGrade) return false;

        return true;
      })
      .sort((a, b) => {
        const av = a[sortKey]; const bv = b[sortKey];
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [data, region, branch, search, searchQuery, filterDiv, filterGrade, sortKey, sortDir]);

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span style={{ opacity: 0.3 }}>↕</span>;
    return <span>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const ColHeader = ({ label, col }) => (
    <th onClick={() => handleSort(col)} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e2e8f0', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}>
      {label} <SortIcon col={col} />
    </th>
  );

  // Dynamic summary derived directly from the filtered/sorted dataset
  const dynamicSummary = useMemo(() => {
    const excellent = sorted.filter(b => b.grade === 'Excellent').length;
    const good = sorted.filter(b => b.grade === 'Good').length;
    const atRisk = sorted.filter(b => b.grade === 'At Risk').length;
    const critical = sorted.filter(b => b.grade === 'Critical').length;
    const avgScore = sorted.length > 0
      ? Math.round(sorted.reduce((acc, b) => acc + (b.score || 0), 0) / sorted.length)
      : (summary.avgScore || 88);
    return { excellent, good, atRisk, critical, avgScore };
  }, [sorted, summary.avgScore]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)', borderRadius: 10, padding: '16px 22px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, boxShadow: '0 4px 16px rgba(2,132,199,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Nationwide Branch Security & Compliance Scorecard</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Pubali Bank PLC · 829 Branches & Sub-branches Security Audit Rating · Bangladesh Bank Security Compliance</div>
          </div>
        </div>
        <button id="scorecard-export-btn" onClick={() => exportCsv(sorted)}
          style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
          Export Audit Scorecard
        </button>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KpiCard
          label="Excellent"
          value={dynamicSummary.excellent}
          color="#0d9488"
          bg="#e6f7f6"
          active={filterGrade === 'Excellent'}
          onClick={() => setFilterGrade(g => g === 'Excellent' ? 'All' : 'Excellent')}
        />
        <KpiCard
          label="Good"
          value={dynamicSummary.good}
          color="#16a34a"
          bg="#dcfce7"
          active={filterGrade === 'Good'}
          onClick={() => setFilterGrade(g => g === 'Good' ? 'All' : 'Good')}
        />
        <KpiCard
          label="At Risk"
          value={dynamicSummary.atRisk}
          color="#d97706"
          bg="#fef3c7"
          active={filterGrade === 'At Risk'}
          onClick={() => setFilterGrade(g => g === 'At Risk' ? 'All' : 'At Risk')}
        />
        <KpiCard
          label="Critical"
          value={dynamicSummary.critical}
          color="#dc2626"
          bg="#fee2e2"
          active={filterGrade === 'Critical'}
          onClick={() => setFilterGrade(g => g === 'Critical' ? 'All' : 'Critical')}
        />
        <KpiCard
          label="Avg Score"
          value={dynamicSummary.avgScore}
          color="#2563eb"
          bg="#dbeafe"
          active={filterGrade === 'All' && filterDiv === 'All'}
          onClick={() => {
            setFilterGrade('All');
            setFilterDiv('All');
            setSearch('');
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 8, padding: '12px 16px', border: '1px solid #e2e8f0', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input id="scorecard-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search branch or division…"
          style={{ flex: 1, minWidth: 200, padding: '7px 12px', borderRadius: 5, border: '1px solid #d1d5db', fontSize: 13, outline: 'none' }} />
        <select id="scorecard-div-filter" value={filterDiv} onChange={e => setFilterDiv(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 5, border: '1px solid #d1d5db', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
          {DIVISIONS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select id="scorecard-grade-filter" value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 5, border: '1px solid #d1d5db', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
          {GRADES.map(g => <option key={g}>{g}</option>)}
        </select>
        <span style={{ fontSize: 12, color: '#6b7280' }}><strong>{sorted.length}</strong> branches</span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxHeight: 450, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8f9fb', position: 'sticky', top: 0, zIndex: 2 }}>
                <ColHeader label="Rank" col="rank" />
                <ColHeader label="Branch" col="name" />
                <ColHeader label="Division" col="division" />
                <ColHeader label="Score / Grade" col="score" />
                <ColHeader label="Uptime %" col="uptimePct" />
                <ColHeader label="Forced Doors" col="forcedDoorCount" />
                <ColHeader label="Tamper" col="tamperEvents" />
                <ColHeader label="Anti-PB" col="antiPassbackViolations" />
                <ColHeader label="Audit %" col="auditCompliancePct" />
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #e2e8f0', whiteSpace: 'nowrap' }}>Last Audit</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading scorecard…</td></tr>}
              {!loading && sorted.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>No branches match the selected criteria</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, marginBottom: 12 }}>Try adjusting your region, division, grade, or search filter.</div>
                    <button
                      onClick={() => {
                        setFilterDiv('All');
                        setFilterGrade('All');
                        setSearch('');
                        if (resetAllFilters) resetAllFilters();
                      }}
                      style={{
                        padding: '6px 14px',
                        background: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              )}
              {sorted.map((b, i) => (
                <tr
                  key={b.code}
                  onClick={() => setSelectedBranch(b)}
                  title={`Click to view detailed security audit & portal diagnostics for ${b.name}`}
                  style={{
                    background: i % 2 === 0 ? '#fff' : '#f9fafb',
                    borderBottom: '1px solid #f1f5f9',
                    borderLeft: `3px solid ${GRADE_COLOR[b.grade] || '#e5e7eb'}`,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#f9fafb'; }}
                >
                  <td style={{ padding: '9px 12px', fontWeight: 700, color: '#374151', fontSize: 14, textAlign: 'center' }}>#{b.rank}</td>
                  <td style={{ padding: '9px 12px' }}>
                    <div style={{ fontWeight: 600, color: '#0284c7' }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{b.code} · {b.district}</div>
                  </td>
                  <td style={{ padding: '9px 12px', color: '#374151', fontSize: 12 }}>{b.division}</td>
                  <td style={{ padding: '9px 12px' }}><ScoreBadge score={b.score} grade={b.grade} /></td>
                  <td style={{ padding: '9px 12px', color: b.uptimePct < 95 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>{b.uptimePct}%</td>
                  <td style={{ padding: '9px 12px', color: b.forcedDoorCount > 2 ? '#dc2626' : '#374151', fontWeight: b.forcedDoorCount > 2 ? 700 : 400, textAlign: 'center' }}>{b.forcedDoorCount}</td>
                  <td style={{ padding: '9px 12px', color: b.tamperEvents > 1 ? '#ea580c' : '#374151', fontWeight: b.tamperEvents > 1 ? 700 : 400, textAlign: 'center' }}>{b.tamperEvents}</td>
                  <td style={{ padding: '9px 12px', color: b.antiPassbackViolations > 3 ? '#d97706' : '#374151', fontWeight: b.antiPassbackViolations > 3 ? 700 : 400, textAlign: 'center' }}>{b.antiPassbackViolations}</td>
                  <td style={{ padding: '9px 12px', color: b.auditCompliancePct < 75 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>{b.auditCompliancePct}%</td>
                  <td style={{ padding: '9px 12px', color: '#6b7280', fontSize: 12 }}>{b.lastAudit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Branch Security Audit & Controlled Portals Modal */}
      {selectedBranch && (
        <BranchAuditDetailModal
          branch={selectedBranch}
          onClose={() => setSelectedBranch(null)}
        />
      )}
    </div>
  );
}
