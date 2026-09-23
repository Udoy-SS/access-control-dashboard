import React, { useState, useEffect } from 'react';
import BioStarSidebar from './components/BioStarSidebar';
import BioStarDashboard from './components/BioStarDashboard';
import BioStarReports from './components/BioStarReports';
import BioStarCustomReportBuilder from './components/BioStarCustomReportBuilder';
import BioStarOrganization from './components/BioStarOrganization';
import BioStarGenericPage from './components/BioStarGenericPage';
import WhoIsInsidePage from './components/WhoIsInsidePage';
import SOCAlarmPanel from './components/SOCAlarmPanel';
import BranchSecurityScorecard from './components/BranchSecurityScorecard';
import AttendanceExceptionHub from './components/AttendanceExceptionHub';
import RestrictedZoneAccessLog from './components/RestrictedZoneAccessLog';
import EmployeeMovementTrail from './components/EmployeeMovementTrail';
import ExecutiveReportsPage from './components/ExecutiveReportsPage';
import BankLoginPage from './components/BankLoginPage';
import CentralAuditTrailHub from './components/CentralAuditTrailHub';
import BioStarConnectionModal from './components/BioStarConnectionModal';
import EmergencyControlsPage from './components/EmergencyControlsPage';
import LiveAccessEventsPage from './components/LiveAccessEventsPage';
import { FilterProvider, AdvancedFilterDrawer } from './components/filters';

// ─── Page title resolver ──────────────────────────────────
function getPageMeta(id) {
  const [baseId] = (id || '').split('?');
  // Support parameterized routes e.g. 'branch/0142'
  if (baseId.startsWith('branch/')) {
    const code = baseId.replace('branch/', '');
    return { title: `Branch #${code}`, sub: 'Detailed Biometric Access & Attendance' };
  }

  const map = {
    'dashboard':          { title: 'Dashboard',               sub: 'Real-time activity overview · Pubali Bank PLC' },
    'organization':       { title: 'Organization',            sub: 'Bank hierarchy · 829 Nationwide Locations' },
    'org-bank':           { title: 'Bank',                    sub: 'Pubali Bank PLC corporate entity & 8 divisions' },
    'org-headoffice':     { title: 'Head Office',             sub: 'Principal Branch · Motijheel, Dhaka' },
    'org-region':         { title: 'Region Office',           sub: '29 Regional Administrative Zones' },
    'org-branch':         { title: 'Branch',                  sub: '519 Full-service banking branches' },
    'org-subbranch':      { title: 'Sub Branch',              sub: '281 Sub-branches mapped to parent branches' },
    'users':              { title: 'User Management',         sub: '35,000 enrolled biometric users' },
    'access':             { title: 'Access Control Security Dashboard', sub: 'Command Center · Real-Time Events, Restricted Areas & Denied Analytics' },
    'access-security':    { title: 'Access Control Security Dashboard', sub: 'Real-time security events, 10 sensitive bank areas, VIP access & denied analytics' },
    'access-dashboard':   { title: 'Access Control Security Dashboard', sub: 'Command Center · 2,696 Armed Doors · 520 Vault Interlocks' },
    'access-group':       { title: 'Access Group',            sub: 'Configure who can access which doors' },
    'access-level':       { title: 'Access Level',            sub: 'Schedule-based door permission tiers' },
    'access-doors':       { title: 'Door Management',         sub: '2,696 configured access points' },
    'access-doorstatus':  { title: 'Door Status',             sub: 'Real-time relay & sensor monitoring' },
    'attendance':         { title: 'Time Attendance',         sub: 'Biometric punch synchronization' },
    'att-employee':       { title: 'Employee Attendance',     sub: 'Live punch logs across all branches' },
    'att-shift':          { title: 'Shift Management',        sub: 'Shift schedules and grace configurations' },
    'att-late':           { title: 'Late / Early Report',     sub: 'Employees exceeding shift grace period' },
    'att-monthly':        { title: 'Monthly Attendance',      sub: 'September 2026 attendance roster' },
    'devices':            { title: 'Device Management',       sub: '1,658 Suprema terminals deployed' },
    'dev-list':           { title: 'Device List',             sub: 'Complete Suprema terminal inventory' },
    'dev-status':         { title: 'Device Status',           sub: 'Hardware health telemetry' },
    'dev-mon':            { title: 'Device Status & Sync Health', sub: 'Real-time terminal synchronization telemetry' },
    'dev-active':         { title: 'Active Device',           sub: '1,624 terminals currently online' },
    'dev-inactive':       { title: 'Inactive Device',         sub: '34 terminals requiring attention' },
    'audit-trail':        { title: 'Audit Trail & Logs',       sub: 'Bangladesh Bank ICT-08 · Admin Actions, Vault Logs, Movement & Branch Transfers' },
    'reports':            { title: 'Bank Reports Hub',         sub: 'BioStar X enterprise report hub · PDF & Excel Export' },
    'reports-security':   { title: 'Security & Access Reports Hub (12 Reports)', sub: '12 Comprehensive Tender & Security Reports' },
    'reports-security-auth': { title: 'Access & Authentication Reports (4 Reports)', sub: 'Biometric clearances, authentication attempts & credential logs' },
    'reports-security-incident': { title: 'Security & Incident Reports (5 Reports)', sub: 'Anti-passback, tailgating, door tampering & intrusions' },
    'reports-security-door': { title: 'Door & Facility Monitoring Reports (3 Reports)', sub: 'Door held-open, occupancy & emergency lock/unlock audits' },
    'reports-pdf':        { title: 'Biometric & Security Analytics', sub: 'Live Telemetry, Authentication Trends, Security Events & Hardware Diagnostics' },
    'reports-matrix':     { title: 'Standard Departmental Reports', sub: 'Executive, User, Access, Device & Door Predefined Bank Reports Catalog' },
    'reports-custom':     { title: 'Custom Report Generator', sub: 'Customizable ad-hoc generator for users, devices, doors and access groups' },
    'exec-reports':       { title: 'Board & Executive MIS Reports', sub: 'Tender EB-01 ~ EB-08 · C-Suite & Board Governance' },
    'custom-reports':     { title: 'Custom Report Builder (Ad-hoc)', sub: 'Tender Spec · Custom User, Device, Door & Group Generator' },
    // ─── Security Intelligence Pages ──────────────────────────────────────────
    'who-is-inside':      { title: 'Who Is Inside (Live Roll-Call)', sub: 'Real-time Head Office & branch presence · Emergency roll-call' },
    'soc-alarm':          { title: 'Central Security Alarms (SOC)',   sub: 'Central Security Monitoring · Cash vault, door intrusion & tamper alarms' },
    'branch-scorecard':   { title: 'Branch Security Scorecard', sub: '829 Branches & Sub-branches · Bangladesh Bank security compliance rating' },
    'att-exception':      { title: 'Attendance Exceptions & Discrepancy', sub: 'Late arrival · Early departure · Missing biometric punch · AWL' },
    'restricted-access':  { title: 'Vault & Data Center Access Log', sub: 'Cash Vault · SWIFT Room · Data Center · Treasury biometric audit trail' },
    'movement-trail':     { title: 'Biometric Access Trail (Door-to-Door)', sub: 'Sequential door-by-door movement history · Internal audit' },
    // ─── Reporting Specification Modules ─────────────────────────────
    'live-access-events': { title: 'Live Access Events',          sub: 'Real-time nationwide biometric authentication and portal events' },
    'security-incidents': { title: 'Security Incidents',          sub: 'Forced doors, tampering alerts, and anti-passback violations' },
    'alarm-mgmt':         { title: 'Alarm Management (SOC)',      sub: 'Central Security Operations Center alarm monitoring & dispatch' },
    'restricted-area-access': { title: 'Restricted Area Access',  sub: 'Vault, Cash Chamber, SWIFT and Data Center high-security trails' },
    'apb-tailgating':     { title: 'Anti-passback & Tailgating',  sub: 'APB violations, dual-custody and multi-person piggybacking events' },
    'att-daily':          { title: 'Daily Attendance',            sub: 'Real-time daily biometric punch logs and presence synchronization' },
    'att-early':          { title: 'Early Departure Report',      sub: 'Personnel leaving before scheduled shift conclusion' },
    'att-overtime':       { title: 'Overtime Analytics',          sub: 'Approved overtime hours, extended shifts and payroll reconciliation' },
    'dev-controller':     { title: 'Controller Status',           sub: '520 CoreStation CS-40 Master ACU Hubs nationwide' },
    'dev-reader':         { title: 'Reader Status',               sub: '1,658 Biometric Terminals & Card Readers deployed across 829 branches' },
    'dev-door':           { title: 'Door Status & Interlocks',    sub: '2,696 Armed access points · Real-time relay & sensor telemetry' },
    'dev-server':         { title: 'Server Health',               sub: 'BioStar X Core Gateway, SQL database cluster and failover state' },
    'dev-network':        { title: 'Network Status',              sub: 'Bank MPLS Intranet, VPN tunnels and branch ping latency' },
    'audit-access':       { title: 'Vault & High-Security Audit', sub: 'Cash Vault, Treasury & Strong Room Dual-Custody biometric verification logs' },
    'audit-attendance':   { title: 'Attendance Correction & Regularization Audit', sub: 'Manual attendance adjustments, supervisor overrides and roster sync ledger' },
    'audit-admin':        { title: 'Admin & System Action Audit', sub: 'Super admin actions, permission alterations, role elevation & credential modifications' },
    'compliance-reports': { title: 'Bangladesh Bank ICT-08 Compliance', sub: 'Central Bank ICT Security Guideline (ICT-08) · Audit scores & regulatory reports' },
    'emergency-controls': { title: 'Emergency Controls & Zone Lockdown', sub: 'One-Click Cash Vault Lockdown, Fire Evacuation Release & Direct Relay Switchboard' },
  };
  return map[baseId] || { title: baseId, sub: '' };
}

// ─── Pages that use BioStarOrganization ──────────────────
const ORG_PAGES = ['organization', 'org-bank', 'org-headoffice', 'org-region', 'org-branch', 'org-subbranch'];

// ─── Pages that use generic table layout ─────────────────
const GENERIC_PAGES = [
  'users',
  'access', 'access-security', 'access-dashboard', 'access-group', 'access-level', 'access-doors', 'access-doorstatus',
  'attendance', 'att-daily', 'att-employee', 'att-shift', 'att-late', 'att-monthly', 'att-overtime',
  'devices', 'dev-list', 'dev-status', 'dev-mon', 'dev-active', 'dev-inactive', 'dev-door', 'dev-server', 'dev-network',
  'compliance-reports',
];

// ─── New Intelligence Module Pages ───────────────────────
const INTEL_PAGES = [
  'who-is-inside', 'soc-alarm', 'branch-scorecard',
  'att-exception', 'restricted-access', 'movement-trail'
];

function TopBar({ activeId, currentUser, onLogout, onOpenBioStarModal, onToggleMobileSidebar }) {
  const { title, sub } = getPageMeta(activeId);
  const [gatewayStatus, setGatewayStatus] = useState('Online');
  const [secondsAgo, setSecondsAgo] = useState(5);
  const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', weekday: 'short' });

  useEffect(() => {
    let mounted = true;
    fetch('http://localhost:5050/api/biostar/status')
      .then(res => res.json())
      .then(json => {
        if (mounted && json && json.data) {
          setGatewayStatus(json.data.status === 'CONNECTED' ? 'Live Connected' : 'Online');
        }
      })
      .catch(() => {
        if (mounted) setGatewayStatus('Online');
      });

    // Subtle ticker for real-time telemetry
    const timer = setInterval(() => {
      setSecondsAgo(prev => (prev >= 12 ? 2 : prev + 1));
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [activeId]);

  return (
    <div className="bs-topbar">
      <div className="bs-topbar-title">
        {onToggleMobileSidebar && (
          <button
            type="button"
            className="bs-mobile-menu-btn"
            onClick={onToggleMobileSidebar}
            aria-label="Toggle navigation menu"
            title="Open Navigation Menu"
          >
            ☰
          </button>
        )}
        {/* Page title */}
        <span style={{ fontWeight: 700 }}>{title}</span>
        {sub && (
          <span className="bs-topbar-sub" style={{ fontSize: 11, fontWeight: 400, opacity: 0.75, borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 10, marginLeft: 2 }}>
            {sub}
          </span>
        )}
      </div>

      <div className="bs-topbar-right">
        {/* 1. Live Monitoring Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          fontSize: 11,
          fontWeight: 700,
          color: '#34d399',
          background: 'rgba(6, 78, 59, 0.45)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
          padding: '4px 10px',
          borderRadius: 4,
          letterSpacing: '0.04em'
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #34d399',
            flexShrink: 0
          }}></span>
          <span>LIVE MONITORING</span>
        </div>

        {/* 2. Last Sync Ticker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 11,
          color: 'rgba(255,255,255,0.85)',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '4px 10px',
          borderRadius: 4
        }}>
          <span style={{ opacity: 0.7 }}>Last Sync:</span>
          <span style={{ fontWeight: 600, color: '#bae6fd' }}>{secondsAgo}s ago</span>
        </div>

        {/* 3. BioStar X Gateway Status (Click to open settings & test) */}
        <button
          onClick={onOpenBioStarModal}
          title="Click to configure Suprema BioStar 2 / BioStar X Gateway & Test Connection"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 11,
            color: 'rgba(255,255,255,0.95)',
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            padding: '4px 10px',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(14, 116, 144, 0.45)';
            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.6)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(15, 23, 42, 0.55)';
            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.25)';
          }}
        >
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 6px rgba(16, 185, 129, 0.7)',
            flexShrink: 0
          }}></span>
          <span>BioStar X: <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{gatewayStatus}</strong></span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" style={{ opacity: 0.85, marginLeft: 2 }}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        {/* Date Calendar */}
        <div className="bs-topbar-badge" style={{ borderRadius: 6 }}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="11" height="11" style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}>
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
          </svg>
          {now}
        </div>

        {/* Logged in Bank Officer - Enterprise SOC Security Badge */}
        {currentUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingLeft: 12,
            borderLeft: '1px solid rgba(255,255,255,0.18)'
          }}>
            <div style={{ position: 'relative' }}>
              <div
                title={`${currentUser.name} (${currentUser.designation || currentUser.roleTitle}) · Pubali Bank SOC Controller`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '0.04em',
                  border: '2px solid rgba(56, 189, 248, 0.5)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                  userSelect: 'none'
                }}
              >
                {currentUser.initials || 'TH'}
              </div>
              {/* Online pulse indicator dot */}
              <span style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: '#10b981',
                border: '1.5px solid #0f172a',
                boxShadow: '0 0 6px #10b981'
              }}></span>
            </div>

            <div style={{ lineHeight: 1.25 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                  {currentUser.name}
                </span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  background: 'rgba(14, 165, 233, 0.2)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  padding: '1px 5px',
                  borderRadius: 3,
                  fontFamily: 'monospace'
                }}>
                  {currentUser.id === 'PB-ADMIN' ? 'PB-10492' : currentUser.id}
                </span>
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap', marginTop: 1 }}>
                <span>{currentUser.designation || (currentUser.roleTitle === 'Super Admin' ? 'SVP & Head of ICT Security' : currentUser.roleTitle)}</span>
              </div>
            </div>

            <button
              id="bank-logout-btn"
              onClick={onLogout}
              title="Sign out of bank security portal and terminate active session"
              style={{
                marginLeft: 4,
                padding: '5px 11px',
                borderRadius: 6,
                border: '1px solid rgba(248, 113, 113, 0.35)',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#fca5a5',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.7)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.35)';
                e.currentTarget.style.color = '#fca5a5';
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────
export default function App() {
  const [isBioStarModalOpen, setIsBioStarModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('pb_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  // Initialize state from URL hash if available to prevent state reset on refresh
  const [activeId, setActiveId] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const clean = window.location.hash.replace(/^#\/?/, '').trim();
      if (clean) return clean;
    }
    return 'dashboard';
  });
  const [customReportEntity, setCustomReportEntity] = useState('users');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLoginSuccess = (userProfile) => {
    setCurrentUser(userProfile);
    try {
      sessionStorage.setItem('pb_auth_user', JSON.stringify(userProfile));
    } catch (_) {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem('pb_auth_user');
    } catch (_) {}
  };

  // Listen for browser Back/Forward hash changes
  useEffect(() => {
    const handleHash = () => {
      const clean = window.location.hash.replace(/^#\/?/, '').trim();
      if (clean && clean !== activeId) {
        setActiveId(clean);
      } else if (!clean && activeId !== 'dashboard') {
        setActiveId('dashboard');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [activeId]);

  const handleNavigate = (id, extra = {}) => {
    setActiveId(id);
    if (extra && extra.entity) {
      setCustomReportEntity(extra.entity);
    }
    if (typeof window !== 'undefined') {
      window.location.hash = id;
    }
  };

  // If not authenticated, render bank-grade Login Portal
  if (!currentUser) {
    return <BankLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    const [basePage, queryStr] = activeId.split('?');
    const qParams = new URLSearchParams(queryStr || '');

    if (basePage === 'dashboard') {
      return <BioStarDashboard onNavigate={handleNavigate} />;
    }
    if (basePage === 'reports' || basePage.startsWith('reports-security')) {
      const catParam = qParams.get('category') || (
        basePage === 'reports-security-incident' ? 'security-incident' :
        basePage === 'reports-security-door' ? 'door-facility' : 'access-auth'
      );
      return (
        <BioStarReports
          key={`reports-sec-${catParam}`}
          onNavigate={handleNavigate}
          initialMode="security-hub"
          initialCategory={catParam}
        />
      );
    }
    if (basePage === 'reports-pdf') {
      return <BioStarReports key="reports-pdf" onNavigate={handleNavigate} initialMode="pdf" />;
    }
    if (basePage === 'reports-matrix') {
      return <BioStarReports key="reports-matrix" onNavigate={handleNavigate} initialMode="legacy" />;
    }
    if (basePage === 'reports-custom' || basePage === 'custom-reports') {
      return (
        <BioStarCustomReportBuilder
          key={`custom-builder-${customReportEntity}`}
          initialEntity={customReportEntity}
          onNavigateParent={handleNavigate}
        />
      );
    }
    if (ORG_PAGES.includes(basePage) || basePage.startsWith('branch/')) {
      return <BioStarOrganization subPage={basePage} onNavigate={handleNavigate} />;
    }
    if (GENERIC_PAGES.includes(basePage)) {
      return <BioStarGenericPage pageId={basePage} queryParams={qParams} onNavigate={handleNavigate} />;
    }
    if (basePage === 'live-access-events') {
      return <LiveAccessEventsPage onNavigate={handleNavigate} />;
    }
    if (basePage === 'who-is-inside') {
      const statusParam = qParams.get('status') || 'All';
      const emergencyParam = qParams.get('emergency') === 'true';
      return <WhoIsInsidePage key={`who-${statusParam}-${emergencyParam}`} initialStatus={statusParam} initialEmergency={emergencyParam} />;
    }
    if (basePage === 'soc-alarm') {
      const typeParam = qParams.get('type') || 'All';
      const statusParam = qParams.get('status') || 'All';
      const sevParam = qParams.get('severity') || 'All';
      return (
        <SOCAlarmPanel
          key={`soc-${typeParam}-${statusParam}-${sevParam}`}
          initialType={typeParam}
          initialStatus={statusParam}
          initialSeverity={sevParam}
        />
      );
    }
    if (basePage === 'branch-scorecard') return <BranchSecurityScorecard />;
    if (basePage === 'att-exception') {
      const tabParam = qParams.get('tab') || 'Late Arrival';
      return <AttendanceExceptionHub key={`att-ex-${tabParam}`} initialTab={tabParam} />;
    }
    if (basePage === 'restricted-access') {
      const resParam = qParams.get('result') || 'All';
      const timeParam = qParams.get('timeframe') || 'today';
      const zoneParam = qParams.get('zone') || 'All';
      return <RestrictedZoneAccessLog key={`ra-${resParam}-${timeParam}-${zoneParam}`} initialResult={resParam} initialTimeframe={timeParam} initialZone={zoneParam} />;
    }
    if (basePage === 'movement-trail') return <EmployeeMovementTrail />;
    if (basePage === 'exec-reports')  return <ExecutiveReportsPage onNavigate={handleNavigate} />;
    if (basePage === 'audit-trail')   return <CentralAuditTrailHub key="audit-trail" initialTab={qParams.get('tab') || 'transfer-audit'} onNavigate={handleNavigate} />;

    // ─── Reporting Specification Dynamic Handlers ─────────────────────
    if (basePage === 'security-incidents') {
      return <SOCAlarmPanel key="sec-inc" initialType="All" initialStatus="All" initialSeverity="All" />;
    }
    if (basePage === 'alarm-mgmt') {
      return <SOCAlarmPanel key="alarm-mgmt" initialType="All" initialStatus="Active" initialSeverity="All" />;
    }
    if (basePage === 'restricted-area-access') {
      return <RestrictedZoneAccessLog key="ra-log" initialResult="All" initialTimeframe="today" initialZone="All" />;
    }
    if (basePage === 'apb-tailgating') {
      return <SOCAlarmPanel key="apb-tailgate" initialType="Anti-Passback Violation" initialStatus="All" initialSeverity="All" />;
    }

    if (basePage === 'att-early') {
      return <AttendanceExceptionHub key="early-dep" initialTab="Early Departure" />;
    }
    if (basePage === 'dev-controller') {
      return <BioStarGenericPage pageId="dev-list" queryParams={new URLSearchParams('model=CoreStation CS-40')} onNavigate={handleNavigate} />;
    }
    if (basePage === 'dev-reader') {
      return <BioStarGenericPage pageId="dev-list" queryParams={new URLSearchParams('category=terminals')} onNavigate={handleNavigate} />;
    }

    if (basePage === 'audit-access') {
      return <CentralAuditTrailHub key="audit-access" initialTab="vault-audit" isStandalone={true} onNavigate={handleNavigate} />;
    }
    if (basePage === 'audit-attendance') {
      return <CentralAuditTrailHub key="audit-attendance" initialTab="attendance-audit" isStandalone={true} onNavigate={handleNavigate} />;
    }
    if (basePage === 'audit-admin') {
      return <CentralAuditTrailHub key="audit-admin" initialTab="admin-audit" isStandalone={true} onNavigate={handleNavigate} />;
    }
    if (basePage === 'emergency-controls') {
      return <EmergencyControlsPage />;
    }
    // Fallback
    return (
      <div className="bs-card" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>🔧</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Module Under Construction</div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>"{activeId}" coming soon.</div>
      </div>
    );
  };

  return (
    <FilterProvider activeId={activeId}>
      <div className="bs-shell">
        {/* Sidebar */}
        <BioStarSidebar
          activeId={activeId.split('?')[0].split('/')[0]}
          onNavigate={handleNavigate}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main column */}
        <div className="bs-main">
          <TopBar
            activeId={activeId}
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenBioStarModal={() => setIsBioStarModalOpen(true)}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          />

          <div className="bs-content">
            {renderContent()}
          </div>
        </div>

        {/* 3. Advanced Forensic Filter Drawer */}
        <AdvancedFilterDrawer />

        {/* Suprema BioStar 2 / BioStar X Enterprise Connection Gateway Modal */}
        <BioStarConnectionModal
          isOpen={isBioStarModalOpen}
          onClose={() => setIsBioStarModalOpen(false)}
        />
      </div>
    </FilterProvider>
  );
}
