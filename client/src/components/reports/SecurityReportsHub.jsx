import React, { useState, useEffect } from 'react';
import { REPORT_CATEGORIES, REPORTS_CONFIG } from '../../data/securityReportsData';
import ReportDataTable from './ReportDataTable';
import ReportKpiSummary from './ReportKpiSummary';
import EvidenceViewerModal from './EvidenceViewerModal';

/**
 * SecurityReportsHub.jsx
 * Unified Banking Security & Access Reports Dashboard
 * Pubali Bank PLC · Suprema BioStar X Dealer Suite
 */
export default function SecurityReportsHub({
  initialCategory = 'access-auth',
  initialReport = null,
  standalone = false
}) {
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategory);
  const [activeReportId, setActiveReportId] = useState(() => {
    if (initialReport) return initialReport;
    const cat = REPORT_CATEGORIES.find((c) => c.id === initialCategory) || REPORT_CATEGORIES[0];
    return cat.reportIds[0];
  });
  const [selectedEvidenceRecord, setSelectedEvidenceRecord] = useState(null);

  // Sync state if initialCategory changes
  useEffect(() => {
    if (initialCategory) {
      setActiveCategoryId(initialCategory);
      const cat = REPORT_CATEGORIES.find((c) => c.id === initialCategory) || REPORT_CATEGORIES[0];
      if (cat && cat.reportIds.length > 0) {
        setActiveReportId(cat.reportIds[0]);
      }
    }
  }, [initialCategory]);

  // Sync state if initialReport explicitly provided
  useEffect(() => {
    if (initialReport) {
      setActiveReportId(initialReport);
      const cat = REPORT_CATEGORIES.find((c) => c.reportIds.includes(initialReport));
      if (cat) setActiveCategoryId(cat.id);
    }
  }, [initialReport]);

  const activeCategory =
    REPORT_CATEGORIES.find((c) => c.id === activeCategoryId) || REPORT_CATEGORIES[0];

  const handleCategoryChange = (catId) => {
    setActiveCategoryId(catId);
    const cat = REPORT_CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.reportIds.length > 0) {
      setActiveReportId(cat.reportIds[0]);
    }
  };

  const currentReportId = activeCategory.reportIds.includes(activeReportId)
    ? activeReportId
    : activeCategory.reportIds[0];

  const currentReportConfig = REPORTS_CONFIG[currentReportId] || REPORTS_CONFIG['access-granted'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* ─── BANNER HEADER ─── */}
      {!standalone && (
        <div
          style={{
            background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 60%, #14b8a6 100%)',
            borderRadius: '10px',
            padding: '16px 20px',
            boxShadow: '0 4px 16px rgba(13, 148, 136, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}
            >
              {activeCategory.id === 'access-auth' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              )}
              {activeCategory.id === 'security-incident' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              )}
              {activeCategory.id === 'door-facility' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/>
                  <path d="M2 20h20"/>
                  <path d="M14 12v.01"/>
                </svg>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '0.01em' }}>
                  {activeCategory.title}
                </h1>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', marginTop: '3px' }}>
                {activeCategory.description || 'Pubali Bank PLC · 829 Nationwide Branches · 2,696 Armed Access Doors · Bangladesh Bank ICT-08 Standard'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Quick Category Switcher Pills */}
            <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.18)', padding: '3px', borderRadius: '7px', border: '1px solid rgba(255, 255, 255, 0.2)', gap: '4px' }}>
              {REPORT_CATEGORIES.map((cat) => {
                const isCatActive = cat.id === activeCategoryId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 14px',
                      borderRadius: '5px',
                      border: isCatActive ? '1px solid #ffffff' : '1px solid transparent',
                      background: isCatActive ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                      color: isCatActive ? '#0f766e' : '#ffffff',
                      fontSize: '11.5px',
                      fontWeight: isCatActive ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isCatActive ? '0 1px 4px rgba(0,0,0,0.15)' : 'none'
                    }}
                  >
                    <span>{cat.shortTitle || cat.title}</span>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                textAlign: 'right',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.3
              }}
            >
              <div style={{ color: '#6ee7b7', fontWeight: 700 }}>● Live Telemetry Active</div>
              <div style={{ opacity: 0.9 }}>1,658 Suprema Terminals</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SUB-TABS SEGMENTED SELECTOR ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          backgroundColor: '#ffffff',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
      >
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', padding: '0 8px', whiteSpace: 'nowrap' }}>
          Select Report:
        </span>
        {activeCategory.reportIds.map((repId) => {
          const cfg = REPORTS_CONFIG[repId];
          const isSelected = repId === currentReportId;
          return (
            <button
              key={repId}
              onClick={() => setActiveReportId(repId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: isSelected ? '1px solid #0d9488' : '1px solid #e2e8f0',
                backgroundColor: isSelected ? '#0d9488' : '#f8fafc',
                color: isSelected ? '#ffffff' : '#334155',
                fontSize: '12px',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 1px 3px rgba(13,148,136,0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.color = '#0f172a';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.color = '#334155';
                }
              }}
            >
              <span>{cfg.title}</span>
            </button>
          );
        })}
      </div>

      {/* ─── KPI SUMMARY STRIP ─── */}
      <ReportKpiSummary
        activeCategoryId={activeCategoryId}
        onSelectReport={(repId) => {
          if (REPORTS_CONFIG[repId]) {
            setActiveReportId(repId);
          }
        }}
      />

      {/* ─── ACTIVE REPORT DATA TABLE ─── */}
      <div style={{ marginTop: '2px' }}>
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              {currentReportConfig.title}
            </h2>
            <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
              {currentReportConfig.subtitle}
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Data Source: BioStar X Core Database · Real-time Replica
          </div>
        </div>

        <ReportDataTable
          key={currentReportConfig.id}
          reportConfig={currentReportConfig}
          onViewEvidence={(row) => setSelectedEvidenceRecord(row)}
        />
      </div>

      {/* ─── EVIDENCE VIEWER MODAL ─── */}
      {selectedEvidenceRecord && (
        <EvidenceViewerModal
          record={selectedEvidenceRecord}
          onClose={() => setSelectedEvidenceRecord(null)}
        />
      )}
    </div>
  );
}
