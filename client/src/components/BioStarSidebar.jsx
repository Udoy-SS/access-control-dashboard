import React, { useState, useEffect } from 'react';

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm8-8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  ),
  org: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12z" opacity="0.4" />
      <path d="M10 6a2 2 0 110 4 2 2 0 010-4z" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
  access: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
    </svg>
  ),
  time: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  device: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
    </svg>
  ),
  report: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
    </svg>
  ),
  intel: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  ),
};

const navConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    leaf: true,
  },
  {
    id: 'sec-ops',
    label: 'Security Operations',
    icon: 'intel',
    children: [
      { id: 'access-security', label: 'Security Dashboard' },
      { id: 'live-access-events', label: 'Live Access Events' },
      { id: 'soc-alarm', label: 'Alarm Monitoring (SOC)' },
      { id: 'security-incidents', label: 'Security Incidents' },
      { id: 'restricted-area-access', label: 'Restricted Area Access' },
      { id: 'apb-tailgating', label: 'Anti-passback & Tailgating' },
      { id: 'who-is-inside', label: 'Who Is Inside (Live Roll-Call)' },
      { id: 'branch-scorecard', label: 'Branch Security Scorecard' },
      { id: 'emergency-controls', label: 'Emergency Controls' },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance Analytics',
    icon: 'time',
    children: [
      { id: 'att-daily', label: 'Daily Attendance' },
      { id: 'att-monthly', label: 'Monthly Attendance Summary' },
      { id: 'att-late', label: 'Late Arrival' },
      { id: 'att-early', label: 'Early Departure' },
      { id: 'att-overtime', label: 'Overtime' },
      { id: 'att-exception', label: 'Attendance Exceptions' },
      { id: 'att-employee', label: 'Employee Attendance' },
      { id: 'att-shift', label: 'Shift Management' },
    ],
  },
  {
    id: 'access',
    label: 'Access Control',
    icon: 'access',
    children: [
      { id: 'access-doors', label: 'Door Management' },
      { id: 'access-group', label: 'Access Group' },
      { id: 'access-level', label: 'Access Level' },
    ],
  },
  {
    id: 'devices',
    label: 'Device & System Health',
    icon: 'device',
    children: [
      { id: 'dev-controller', label: 'Controller Status' },
      { id: 'dev-reader', label: 'Reader Status' },
      { id: 'dev-door', label: 'Door Status' },
      { id: 'dev-server', label: 'Server Health' },
      { id: 'dev-network', label: 'Network Status' },
      { id: 'dev-active', label: 'Active Devices' },
      { id: 'dev-inactive', label: 'Inactive Devices' },
    ],
  },
  {
    id: 'reports-group',
    label: 'Audit & Compliance',
    icon: 'report',
    children: [
      { id: 'audit-access', label: 'Vault & High-Security Audit' },
      { id: 'audit-attendance', label: 'Attendance Correction Audit' },
      { id: 'audit-admin', label: 'Admin & System Action Audit' },
      { id: 'compliance-reports', label: 'Bangladesh Bank ICT-08 Compliance' },
    ],
  },
  {
    id: 'reports',
    label: 'Bank Reports Hub',
    icon: 'report',
    children: [
      {
        id: 'reports-security',
        label: 'Security & Access Reports Hub',
        subChildren: [
          { id: 'reports-security-auth', label: 'Access & Authentication' },
          { id: 'reports-security-incident', label: 'Security & Incidents' },
          { id: 'reports-security-door', label: 'Door & Facility' },
        ],
      },
      { id: 'reports-pdf', label: 'Biometric & Security Analytics' },
      { id: 'reports-matrix', label: 'Standard Departmental Reports' },
      { id: 'exec-reports', label: 'Board & Executive MIS Reports', badge: 'EB 1-8' },
      { id: 'reports-custom', label: 'Custom Report Generator' },
    ],
  },
  {
    id: 'organization',
    label: 'Organization',
    icon: 'org',
    children: [
      { id: 'org-bank', label: 'Bank' },
      { id: 'org-headoffice', label: 'Head Office' },
      { id: 'org-region', label: 'Region Office' },
      { id: 'org-branch', label: 'Branch' },
      { id: 'org-subbranch', label: 'Sub Branch' },
    ],
  },
  {
    id: 'users',
    label: 'User Management',
    icon: 'users',
    leaf: true,
  },
];

export default function BioStarSidebar({ activeId, onNavigate, isMobileOpen = false, onCloseMobile }) {
  const [expanded, setExpanded] = useState({
    'sec-ops': true,
    attendance: false,
    access: false,
    devices: false,
    'reports-group': false,
    reports: false,
    organization: false,
  });

  const [subExpanded, setSubExpanded] = useState({
    'reports-security': true,
  });

  const cleanActiveId = (activeId || '').split(/[/?]/)[0];

  const handleNavClick = (id) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  useEffect(() => {
    navConfig.forEach(item => {
      if (item.children) {
        const matches =
          item.id === cleanActiveId ||
          item.children.some(c =>
            c.id === cleanActiveId ||
            (c.subChildren && c.subChildren.some(sc => sc.id === cleanActiveId))
          );
        if (matches) {
          setExpanded(prev => ({ ...prev, [item.id]: true }));
        }
      }
    });

    if (cleanActiveId.startsWith('reports-security') || cleanActiveId === 'reports') {
      setSubExpanded(prev => ({ ...prev, 'reports-security': true }));
    }
  }, [cleanActiveId]);

  const toggleGroup = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubGroup = (childId, e) => {
    if (e) e.stopPropagation();
    setSubExpanded(prev => ({ ...prev, [childId]: !prev[childId] }));
  };

  const isActiveGroup = (item) => {
    if (item.leaf) return cleanActiveId === item.id;
    if (!item.children) return false;
    return (
      item.id === cleanActiveId ||
      item.children.some(c =>
        c.id === cleanActiveId ||
        (c.subChildren && c.subChildren.some(sc => sc.id === cleanActiveId))
      )
    );
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="bs-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-label="Close navigation overlay"
        />
      )}
      <aside className={`bs-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand & Customer */}
        <div className="bs-sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="bs-sidebar-brand-title">
            <div 
              className="bs-sidebar-brand-logo" 
              style={{ 
                background: '#ffffff', 
                borderRadius: '6px', 
                width: '32px', 
                height: '32px', 
                minWidth: '32px', 
                padding: '2px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.15)',
                overflow: 'hidden'
              }}
            >
              <img 
                src="/pubali-bank-logo.png" 
                alt="Pubali Bank PLC" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>
            <div className="bs-sidebar-brand-text">
              <span className="bs-sidebar-brand-name">BioStar X Enterprise</span>
              <span className="bs-sidebar-brand-sub">Pubali Bank Security SOC</span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              type="button"
              className="bs-sidebar-mobile-close"
              onClick={onCloseMobile}
              aria-label="Close navigation drawer"
            >
              ✕
            </button>
          )}
        </div>

      {/* Nav */}
      <nav className="bs-sidebar-nav">
        {navConfig.map(item => {
          const icon = ICONS[item.icon];
          const isGroup = !item.leaf && item.children;
          const isActive = isActiveGroup(item);
          const isOpen = expanded[item.id];

          return (
            <div key={item.id} className="bs-nav-item">
              <div
                className={`bs-nav-link${isActive && item.leaf ? ' active' : ''}`}
                onClick={() => {
                  if (item.leaf) {
                    handleNavClick(item.id);
                  } else {
                    toggleGroup(item.id);
                    // Navigate to first child if none active
                    if (!isActive && item.children?.[0]) {
                      const firstChild = item.children[0];
                      if (firstChild.subChildren && firstChild.subChildren[0]) {
                        handleNavClick(firstChild.subChildren[0].id);
                      } else {
                        handleNavClick(firstChild.id);
                      }
                    }
                  }
                }}
              >
                <span className="bs-nav-icon">{icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {isGroup && (
                  <span style={{
                    transform: isOpen ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.15s',
                    opacity: 0.5,
                  }}>
                    {ICONS.chevron}
                  </span>
                )}
              </div>

              {isGroup && isOpen && (
                <div>
                  {item.children.map(child => {
                    const hasSubChildren = Array.isArray(child.subChildren) && child.subChildren.length > 0;
                    const isChildOrSubActive =
                      cleanActiveId === child.id ||
                      (cleanActiveId === 'reports' && child.id === 'reports-security') ||
                      (hasSubChildren && child.subChildren.some(sc => sc.id === cleanActiveId));

                    const isSubOpen = subExpanded[child.id];

                    return (
                      <div
                        key={child.id}
                        style={{ position: 'relative' }}
                      >
                        <div
                          className={`bs-nav-sub-link${isChildOrSubActive ? ' active' : ''}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingRight: '12px'
                          }}
                          onClick={() => {
                            if (hasSubChildren) {
                              toggleSubGroup(child.id);
                              if (!isChildOrSubActive) {
                                handleNavClick(child.subChildren[0].id);
                              }
                            } else {
                              handleNavClick(child.id);
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', opacity: 0.6, flexShrink: 0 }}></span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {child.label}
                            </span>
                          </div>
                          {hasSubChildren && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              flexShrink: 0,
                              transform: isSubOpen ? 'rotate(90deg)' : 'none',
                              transition: 'transform 0.15s ease',
                              opacity: 0.7
                            }}>
                              <svg viewBox="0 0 20 20" fill="currentColor" width="10" height="10">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </div>

                        {/* In-tree nested sub-options (Level 3) */}
                        {hasSubChildren && isSubOpen && (
                          <div style={{
                            marginLeft: '26px',
                            paddingLeft: '10px',
                            borderLeft: '1.5px solid rgba(13, 148, 136, 0.3)',
                            marginRight: '8px',
                            marginTop: '2px',
                            marginBottom: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px'
                          }}>
                            {child.subChildren.map(sub => {
                              const isSubActive =
                                cleanActiveId === sub.id ||
                                ((cleanActiveId === 'reports-security' || cleanActiveId === 'reports') && sub.id === 'reports-security-auth');

                              return (
                                <div
                                  key={sub.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNavClick(sub.id);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '5px 8px',
                                    fontSize: '11px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    background: isSubActive ? 'rgba(13, 148, 136, 0.2)' : 'transparent',
                                    border: isSubActive ? '1px solid rgba(45, 212, 191, 0.35)' : '1px solid transparent',
                                    color: isSubActive ? '#2dd4bf' : 'rgba(255, 255, 255, 0.65)',
                                    fontWeight: isSubActive ? 600 : 400,
                                    transition: 'all 0.12s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSubActive) {
                                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                      e.currentTarget.style.color = '#ffffff';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSubActive) {
                                      e.currentTarget.style.background = 'transparent';
                                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
                                    }
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', minWidth: 0, flex: 1 }}>
                                    <span style={{
                                      width: '4px',
                                      height: '4px',
                                      borderRadius: '50%',
                                      backgroundColor: isSubActive ? '#2dd4bf' : 'rgba(255, 255, 255, 0.35)',
                                      flexShrink: 0
                                    }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.label}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>SYSTEM STATUS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%' }}></span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>BioStar Gateway · Connected</span>
        </div>
      </div>
    </aside>
    </>
  );
}
