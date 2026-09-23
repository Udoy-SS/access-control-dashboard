import React from 'react';

/**
 * ReportKpiSummary.jsx
 * Quick KPI metric strip displayed above reports matching banking security situational awareness.
 */
const renderKpiSvg = (id, color) => {
  switch (id) {
    case 'access-granted':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      );
    case 'access-denied':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
      );
    case 'unauthorized-access':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      );
    case 'auth-method':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
          <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
          <path d="M2 16h.01"/>
          <path d="M21.8 16c.2-2 .131-5.354 0-6"/>
          <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/>
          <path d="M8.65 22c.21-.66.45-1.32.57-2"/>
          <path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>
        </svg>
      );
    case 'anti-passback':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 16h5v5"/>
        </svg>
      );
    case 'multi-person':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      );
    case 'tailgating-incident':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      );
    case 'door-tamper':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      );
    case 'door-forced':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      );
    case 'door-held-open':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      );
    case 'occupancy-report':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
          <path d="M9 22v-4h6v4"/>
          <path d="M8 6h.01"/>
          <path d="M16 6h.01"/>
          <path d="M8 10h.01"/>
          <path d="M16 10h.01"/>
          <path d="M8 14h.01"/>
          <path d="M16 14h.01"/>
        </svg>
      );
    case 'emergency-lock-unlock':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      );
  }
};

export default function ReportKpiSummary({ activeCategoryId, onSelectReport }) {
  const kpisByCategory = {
    'access-auth': [
      {
        id: 'access-granted',
        label: 'Granted Clearances',
        value: '18,492',
        sub: '99.77% approval rate',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.1)'
      },
      {
        id: 'access-denied',
        label: 'Access Denials',
        value: '43',
        sub: '31 unassigned, 12 time-zone',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.1)'
      },
      {
        id: 'unauthorized-access',
        label: 'Unauthorized Attempts',
        value: '9',
        sub: '3 Repetitive strike alerts',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.1)'
      },
      {
        id: 'auth-method',
        label: 'Biometric Modality',
        value: '68.4%',
        sub: '22,810 total transactions',
        color: '#06b6d4',
        bg: 'rgba(6, 182, 212, 0.1)'
      }
    ],
    'security-incident': [
      {
        id: 'anti-passback',
        label: 'Anti-Passback Events',
        value: '14',
        sub: '4 Hard APB / 10 Soft APB',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.1)'
      },
      {
        id: 'multi-person',
        label: 'Multi-Person Alerts',
        value: '7',
        sub: '5 Intercepted in mantrap',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.1)'
      },
      {
        id: 'tailgating-incident',
        label: 'Tailgating Breaches',
        value: '5',
        sub: '100% video verified',
        color: '#dc2626',
        bg: 'rgba(220, 38, 38, 0.1)'
      },
      {
        id: 'door-tamper',
        label: 'Reader Tamper Alerts',
        value: '3',
        sub: 'All 3 restored & normal',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.1)'
      },
      {
        id: 'door-forced',
        label: 'Forced Door Alerts',
        value: '2',
        sub: '0 breaches confirmed',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.1)'
      }
    ],
    'door-facility': [
      {
        id: 'door-held-open',
        label: 'Held Open Alarms',
        value: '18',
        sub: 'Avg 42s over threshold',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.1)'
      },
      {
        id: 'occupancy-report',
        label: 'Monitored Zones',
        value: '12 Areas',
        sub: 'Peak Vault Occupancy 50%',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.1)'
      },
      {
        id: 'emergency-lock-unlock',
        label: 'Emergency Actions',
        value: '4 Drills',
        sub: 'Zero unauthorized releases',
        color: '#06b6d4',
        bg: 'rgba(6, 182, 212, 0.1)'
      }
    ]
  };

  const currentCards = kpisByCategory[activeCategoryId] || kpisByCategory['access-auth'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${currentCards.length}, minmax(0, 1fr))`, gap: '12px' }}>
      {currentCards.map((kpi) => (
        <div
          key={kpi.id}
          onClick={() => onSelectReport && onSelectReport(kpi.id)}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: onSelectReport ? 'pointer' : 'default',
            transition: 'all 0.18s ease',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}
          onMouseEnter={(e) => {
            if (onSelectReport) {
              e.currentTarget.style.borderColor = kpi.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
            }
          }}
          onMouseLeave={(e) => {
            if (onSelectReport) {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
            }
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: kpi.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {renderKpiSvg(kpi.id, kpi.color)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginTop: '2px' }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: '10.5px', color: kpi.color, fontWeight: 600, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {kpi.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
