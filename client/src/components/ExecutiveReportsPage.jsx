/**
 * ExecutiveReportsPage.jsx
 * Official Executive & Board Governance Suite (Tender EB-01 to EB-08)
 * Designed for Pubali Bank PLC · Suprema BioStar X Enterprise Architecture
 */

import React, { useState, useMemo } from 'react';
import { EXECUTIVE_REPORTS_META } from '../data/executiveReportsData';

const REPORT_TABS = [
  { id: 'EB-01', short: 'CEO Summary', icon: '👔', name: 'EB-01: CEO / MD Executive Dashboard' },
  { id: 'EB-02', short: 'Board Security', icon: '🛡️', name: 'EB-02: Board Security & Compliance' },
  { id: 'EB-03', short: 'Divisional Roster', icon: '🏢', name: 'EB-03: Divisional Attendance Roster' },
  { id: 'EB-04', short: 'Biometric Audit', icon: '🧬', name: 'EB-04: Biometric Compliance Audit' },
  { id: 'EB-05', short: 'Branch Scorecard', icon: '🏆', name: 'EB-05: YTD Branch Performance' },
  { id: 'EB-06', short: 'SLA Governance', icon: '⚡', name: 'EB-06: Fleet SLA & Uptime' },
  { id: 'EB-07', short: 'Incident Intel', icon: '🚨', name: 'EB-07: Executive Incident Brief' },
  { id: 'EB-08', short: 'Payroll Audit', icon: '💼', name: 'EB-08: Payroll Attendance Integrity' },
];

const DIVISIONS = [
  'All Divisions',
  'Dhaka Division',
  'Chittagong Division',
  'Sylhet Division',
  'Rajshahi Division',
  'Khulna Division',
  'Barisal Division',
  'Rangpur Division',
  'Mymensingh Division',
];

function KpiCard({ icon, label, value, sub, color, iconBg }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      padding: '14px 18px',
      flex: 1,
      minWidth: 180,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      borderLeft: `3.5px solid ${color}`,
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: iconBg || `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginTop: 2 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 11, color, marginTop: 2, fontWeight: 600 }}>{sub}</div>}
      </div>
    </div>
  );
}

const DATE_PERIODS = [
  { id: 'today', label: 'Today (Live)', range: '16 Sep 2026' },
  { id: 'yesterday', label: 'Yesterday', range: '15 Sep 2026' },
  { id: 'last7', label: 'Last 7 Days', range: '10–16 Sep 2026' },
  { id: 'mtd', label: 'Month-to-Date', range: '01–16 Sep 2026' },
  { id: 'q3', label: 'Q3 2026 (YTD)', range: '01 Jul – 16 Sep 2026' },
  { id: 'custom', label: 'Custom Range 📅', range: 'Custom' }
];

export default function ExecutiveReportsPage() {
  const [activeReportId, setActiveReportId] = useState('EB-01');
  const [selectedDivision, setSelectedDivision] = useState('All Divisions');
  const [searchTerm, setSearchTerm] = useState('');
  const [datePeriod, setDatePeriod] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState('2026-09-16');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const activeMeta = EXECUTIVE_REPORTS_META[activeReportId] || EXECUTIVE_REPORTS_META['EB-01'];

  // Helper for human-readable period label
  const getPeriodLabel = () => {
    switch (datePeriod) {
      case 'today': return 'Today · 16 Sep 2026';
      case 'yesterday': return 'Yesterday · 15 Sep 2026';
      case 'last7': return 'Last 7 Days · 10–16 Sep 2026';
      case 'mtd': return 'Month-to-Date · 01–16 Sep 2026';
      case 'q3': return 'Q3 2026 · 01 Jul – 16 Sep 2026 (YTD)';
      case 'custom': return `Custom · ${customStartDate} to ${customEndDate}`;
      default: return 'Current Session';
    }
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    return activeMeta.rows.filter(row => {
      if (selectedDivision !== 'All Divisions') {
        const rowText = row.join(' ').toLowerCase();
        const divKeyword = selectedDivision.replace(' Division', '').toLowerCase();
        if (!rowText.includes(divKeyword) && !row[1]?.includes('Consolidated')) {
          return false;
        }
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return row.some(cell => String(cell).toLowerCase().includes(term));
      }
      return true;
    });
  }, [activeMeta, selectedDivision, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Switch report tab
  const handleTabChange = (id) => {
    setActiveReportId(id);
    setSearchTerm('');
    setSelectedDivision('All Divisions');
    setCurrentPage(1);
  };

  // CSV Export
  const handleExportCsv = () => {
    const periodStr = getPeriodLabel();
    const csvContent = [
      `# PUBALI BANK PLC - EXECUTIVE & BOARD GOVERNANCE DOSSIER`,
      `# Report: ${activeMeta.id} - ${activeMeta.name}`,
      `# Target Role: ${activeMeta.role}`,
      `# Reporting Period: ${periodStr}`,
      `# Generated On: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString()} (BioStar X Audit Gateway)`,
      `# Division Scope: ${selectedDivision}`,
      ``,
      activeMeta.cols.join(','),
      ...filteredRows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanPeriod = datePeriod === 'custom' ? `${customStartDate}_to_${customEndDate}` : datePeriod;
    link.download = `${activeMeta.id}_${activeMeta.name.replace(/[^a-zA-Z0-9]/g, '_')}_${cleanPeriod}_PubaliBank.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>
      
      {/* 1. ELEGANT PAGE HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #059669 100%)',
        borderRadius: 8,
        padding: '16px 22px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 4px 16px rgba(15,23,42,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            👔
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em' }}>
                Executive &amp; Board Reports Suite (EB-01 ~ EB-08)
              </span>
              <span style={{
                background: '#10b981',
                color: '#ffffff',
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: 4,
                letterSpacing: '0.04em'
              }}>
                OFFICIAL TENDER SPEC
              </span>
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.88, marginTop: 2 }}>
              Board of Directors, CEO &amp; C-Suite Governance Telemetry · Pubali Bank PLC · 829 Nationwide Locations
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleExportCsv}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            📥 Export CSV
          </button>
          <button
            onClick={() => window.print()}
            style={{
              background: '#059669',
              border: 'none',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(5,150,105,0.3)'
            }}
          >
            🖨️ Print PDF
          </button>
        </div>
      </div>

      {/* 2. REPORT TABS (Clean, sleek, segmented pill bar) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '5px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {REPORT_TABS.map(tab => {
          const isActive = activeReportId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              title={tab.name}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 13px',
                borderRadius: 6,
                border: 'none',
                background: isActive ? '#0f172a' : 'transparent',
                color: isActive ? '#ffffff' : '#475569',
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 6px rgba(15,23,42,0.18)' : 'none'
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#0f172a';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#475569';
                }
              }}
            >
              <span style={{ fontSize: 13 }}>{tab.icon}</span>
              <span>{tab.short}</span>
            </button>
          );
        })}
      </div>

      {/* 3. REPORT TITLE & 4 DYNAMIC KPI CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Sub-header info bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          padding: '2px 4px'
        }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
              {activeMeta.id}: {activeMeta.name}
            </span>
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
              — {activeMeta.purpose}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, fontSize: 11, fontWeight: 600 }}>
            <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: 4 }}>
              👤 {activeMeta.role}
            </span>
            <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: 4 }}>
              ⏱️ {activeMeta.frequency}
            </span>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: 4 }}>
              📅 {getPeriodLabel()}
            </span>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {activeMeta.kpis.map((kpi, idx) => (
            <KpiCard
              key={idx}
              icon={idx === 0 ? '📊' : idx === 1 ? '🛡️' : idx === 2 ? '⚡' : '✅'}
              label={kpi.label}
              value={kpi.value}
              sub={kpi.sub}
              color={kpi.color}
            />
          ))}
        </div>
      </div>

      {/* 4. FILTER & SEARCH TOOLBAR WITH DATE PERIOD PILLS */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* ROW 1: Date Period Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          paddingBottom: 10,
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: 4, marginRight: 2 }}>
              <span>📅</span> Period:
            </span>
            {DATE_PERIODS.map(p => {
              const isPeriodActive = datePeriod === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setDatePeriod(p.id)}
                  style={{
                    padding: '5px 10px',
                    fontSize: 11.5,
                    fontWeight: isPeriodActive ? 700 : 500,
                    borderRadius: 5,
                    border: isPeriodActive ? '1px solid #0f766e' : '1px solid #e2e8f0',
                    background: isPeriodActive ? '#0f766e' : '#f8fafc',
                    color: isPeriodActive ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.14s ease'
                  }}
                >
                  {p.label}
                </button>
              );
            })}

            {/* Custom Range inline inputs */}
            {datePeriod === 'custom' && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 4, background: '#f1f5f9', padding: '2px 6px', borderRadius: 6 }}>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: 4, padding: '2px 4px', fontSize: 11, background: '#fff' }}
                />
                <span style={{ fontSize: 11, color: '#64748b' }}>to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: 4, padding: '2px 4px', fontSize: 11, background: '#fff' }}
                />
              </div>
            )}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: '#0d9488', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '3px 8px', borderRadius: 4 }}>
            ⚡ Scope: {getPeriodLabel()}
          </div>
        </div>

        {/* ROW 2: Live Search + Division Filter + Reset + Count */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 280, flexWrap: 'wrap' }}>
            {/* Live Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 340 }}>
              <input
                type="text"
                placeholder={`Search ${activeMeta.id} records (Officer, Branch, Event)...`}
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  height: 36,
                  padding: '0 30px 0 34px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12.5,
                  background: '#f8fafc',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s, background 0.15s'
                }}
                onFocus={e => { e.target.style.borderColor = '#0284c7'; e.target.style.background = '#ffffff'; }}
                onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8fafc'; }}
              />
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: 13, pointerEvents: 'none' }}>
                🔍
              </span>
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: 13,
                    padding: 2
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Division Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b' }}>Division:</span>
              <select
                value={selectedDivision}
                onChange={e => {
                  setSelectedDivision(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  height: 36,
                  padding: '0 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#f8fafc',
                  color: '#1e293b',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color 0.15s'
                }}
                onFocus={e => { e.target.style.borderColor = '#0284c7'; }}
                onBlur={e => { e.target.style.borderColor = '#cbd5e1'; }}
              >
                {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Reset button if filter active */}
            {(searchTerm || selectedDivision !== 'All Divisions' || datePeriod !== 'today') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDivision('All Divisions');
                  setDatePeriod('today');
                  setCurrentPage(1);
                }}
                style={{
                  height: 36,
                  padding: '0 10px',
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#dc2626',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                ↺ Reset Filters
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: '#0f766e',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '5px 12px',
              borderRadius: 14
            }}>
              Showing {filteredRows.length} records · Pubali Bank PLC
            </span>
          </div>
        </div>
      </div>

      {/* 5. CLEAN, STRUCTURED DATA TABLE */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1', color: '#334155' }}>
                {activeMeta.cols.map((col, idx) => (
                  <th key={idx} style={{ padding: '10px 14px', fontWeight: 700, whiteSpace: 'nowrap', fontSize: 11.5 }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, rIdx) => {
                const isConsolidated = row[1]?.includes('Consolidated');
                return (
                  <tr
                    key={rIdx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isConsolidated ? '#f8fafc' : rIdx % 2 === 1 ? '#fafbfd' : '#ffffff',
                      fontWeight: isConsolidated ? 700 : 400,
                    }}
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '9px 14px', whiteSpace: 'nowrap' }}>
                        {/* Status badges */}
                        {(cell === 'Optimal' || cell === 'Certified' || cell === 'Fully Compliant' || cell === 'Verified & Approved' || cell === 'Clean' || cell === 'Resolved & Cleared') ? (
                          <span style={{
                            background: '#ecfdf5',
                            color: '#065f46',
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 11,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                            {cell}
                          </span>
                        ) : (cell === 'Compliant' || cell === 'Approved') ? (
                          <span style={{
                            background: '#eff6ff',
                            color: '#1e40af',
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 11,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
                            {cell}
                          </span>
                        ) : (cell === 'A+ Platinum') ? (
                          <span style={{
                            background: '#f5f3ff',
                            color: '#5b21b6',
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontWeight: 800,
                            fontSize: 11
                          }}>
                            ⭐ {cell}
                          </span>
                        ) : (cell === 'Warning' || cell === 'Low' || cell === 'Review Required' || String(cell).includes('Observation') || String(cell).includes('delay') || String(cell).includes('Naogaon')) ? (
                          <span style={{
                            background: '#fffbeb',
                            color: '#92400e',
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 11,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                            {cell}
                          </span>
                        ) : cIdx === 0 ? (
                          <span style={{ fontWeight: 700, color: '#64748b', fontSize: 11 }}>{cell}</span>
                        ) : (
                          <span style={{ color: '#1e293b' }}>{cell}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredRows.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            No records matched your search query in {activeMeta.id}.
          </div>
        )}

        {/* 6. CLEAN PAGINATION FOOTER */}
        <div style={{
          padding: '10px 16px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>
            Showing {paginatedRows.length} of {filteredRows.length} entries · Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: 11.5,
                fontWeight: 600,
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: 11.5,
                fontWeight: 600,
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage >= totalPages ? 0.5 : 1
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
