/**
 * AccessControlDashboard.jsx — Access Control Command Center & Telemetry Dashboard
 * Pubali Bank PLC · Suprema BioStar X Enterprise Access Architecture
 * 
 * Central command hub providing comprehensive visibility into 2,696 armed access doors,
 * 520 Cash Vault mantraps, 520 CoreStation CS-40 ACUs, 829 access groups, and real-time sensor telemetry.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { FULL_PUBALI_LOCATIONS, DIVISIONS_LIST } from '../data/pubaliFullBranches';
import { globalDoorStore } from '../services/doorStore';

// ─── CSV EXPORT HELPER ──────────────────────────────────────────
function exportCsv(header, rows, filename) {
  const content = [header, ...rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── 8 SPECIFIED HELD-OPEN WARNING DOORS FOR REAL-TIME AUDIT ──
const WARNING_DOOR_INDEX_MAP = [
  { index: 42, branch: 'Motijheel Branch', code: '0102', door: 'DOR-0102-02', name: 'Cash Counter Mantrap Door', division: 'Dhaka', duration: '1m 45s' },
  { index: 185, branch: 'Dhanmondi Branch', code: '0142', door: 'DOR-0142-02', name: 'Rear Cash Delivery Gate', division: 'Dhaka', duration: '2m 10s' },
  { index: 412, branch: 'Agrabad Branch', code: '0201', door: 'DOR-0201-02', name: 'Treasury Safe Vestibule', division: 'Chattogram', duration: '1m 20s' },
  { index: 789, branch: 'Sylhet Main Branch', code: '0301', door: 'DOR-0301-02', name: 'Vault Secondary Mantrap', division: 'Sylhet', duration: '3m 05s' },
  { index: 1150, branch: 'Rajshahi Branch', code: '0401', door: 'DOR-0401-02', name: 'IT Server Room Air-Lock', division: 'Rajshahi', duration: '1m 15s' },
  { index: 1624, branch: 'Khulna Branch', code: '0501', door: 'DOR-0501-02', name: 'Cash Transfer Sally Port', division: 'Khulna', duration: '2m 30s' },
  { index: 2098, branch: 'Barishal Branch', code: '0601', door: 'DOR-0601-02', name: 'Sub-Branch Vault Portal', division: 'Barishal', duration: '1m 50s' },
  { index: 2560, branch: 'Rangpur Branch', code: '0701', door: 'DOR-0701-02', name: 'Emergency Fire Exit Monitored', division: 'Rangpur', duration: '1m 10s' },
];

// ─── LIVE ACCESS EVENTS STREAM (MOCK REAL-TIME DATA) ───────────
const LIVE_ACCESS_FEED = [
  { id: 'EVT-9921', time: '10:08:42', branch: 'Principal Branch (Head Office)', door: 'Grand Lobby Turnstile Lane 1', employee: 'Md. Abdul Alim (PB-00102)', role: 'Executive Vice President', auth: 'Fingerprint + Card', result: 'Granted', latency: '12 ms' },
  { id: 'EVT-9920', time: '10:07:15', branch: 'Motijheel Branch', door: 'Cash Vault Dual Custody Portal', employee: 'Rahim Ullah & Tariq Islam', role: 'Vault Custodians (Dual)', auth: 'Dual Custody (Bio+PIN)', result: 'Granted', latency: '18 ms' },
  { id: 'EVT-9919', time: '10:06:50', branch: 'Dhanmondi Branch', door: 'Back Office Staff Entrance', employee: 'Nazrul Hossain (PB-01428)', role: 'Senior Cash Officer', auth: 'BioStation 3 (FP)', result: 'Granted', latency: '14 ms' },
  { id: 'EVT-9918', time: '10:05:12', branch: 'Gulshan Corporate Branch', door: 'Server Room Interlock Air-Lock', employee: 'Unregistered Card #CRD-998', role: 'Visitor / Unknown', auth: 'RFID Card Only', result: 'Denied', reason: 'Schedule & Tier Restriction', latency: '9 ms' },
  { id: 'EVT-9917', time: '10:04:30', branch: 'Agrabad Branch', door: 'Main Customer Entrance Turnstile', employee: 'Shamsul Haque (PB-02014)', role: 'Branch Manager', auth: 'BioEntry W2 (FP)', result: 'Granted', latency: '11 ms' },
  { id: 'EVT-9916', time: '10:02:18', branch: 'Uttara Model Town Branch', door: 'ATM Service Room Access', employee: 'Karim Ahmed (PB-01055)', role: 'ATM Custodian', auth: 'Card + PIN', result: 'Granted', latency: '16 ms' },
  { id: 'EVT-9915', time: '10:01:05', branch: 'Mirpur-10 Branch', door: 'Cash Counter Mantrap Inner Door', employee: 'Selina Akter (PB-01089)', role: 'Junior Officer Cash', auth: 'Fingerprint Minutiae', result: 'Granted', latency: '13 ms' },
  { id: 'EVT-9914', time: '09:59:40', branch: 'Khatunganj Branch', door: 'Manager Suite Executive Door', employee: 'Mohammad Faruk (PB-02088)', role: 'Assistant General Manager', auth: 'Mobile NFC Pass', result: 'Granted', latency: '15 ms' },
];

export default function AccessControlDashboard({ onNavigate }) {
  const [liveDoors, setLiveDoors] = useState(() => ({ ...globalDoorStore.liveOverrides }));
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'doors' | 'status' | 'groups' | 'levels'
  const [searchQuery, setSearchQuery] = useState('');
  const [lockdownActive, setLockdownActive] = useState(false);

  // Subscribe to live door store updates
  useEffect(() => {
    return globalDoorStore.subscribe(() => {
      setLiveDoors({ ...globalDoorStore.liveOverrides });
    });
  }, []);

  // Compute live door status metrics
  const doorMetrics = useMemo(() => {
    let warningCount = 0;
    WARNING_DOOR_INDEX_MAP.forEach(item => {
      const override = liveDoors[item.door];
      if (override) {
        if (override.loop === 'Warning' || override.sensor === 'Held Open Alert') {
          warningCount++;
        }
      } else {
        warningCount++; // Default 8 warning doors
      }
    });

    const totalDoors = 1040;
    const normalCount = totalDoors - warningCount;
    const warningPct = ((warningCount / totalDoors) * 100).toFixed(2);
    const normalPct = ((normalCount / totalDoors) * 100).toFixed(2);

    return {
      total: totalDoors,
      normal: normalCount,
      warning: warningCount,
      alarm: 0,
      normalPct,
      warningPct
    };
  }, [liveDoors]);

  // Division-wise door breakdown
  const divisionBreakdown = useMemo(() => {
    const stats = {
      'Dhaka': { total: 1342, normal: 1340, warning: 2 },
      'Chattogram': { total: 580, normal: 579, warning: 1 },
      'Sylhet': { total: 224, normal: 223, warning: 1 },
      'Rajshahi': { total: 188, normal: 187, warning: 1 },
      'Khulna': { total: 146, normal: 145, warning: 1 },
      'Barishal': { total: 84, normal: 83, warning: 1 },
      'Rangpur': { total: 78, normal: 77, warning: 1 },
      'Mymensingh': { total: 54, normal: 54, warning: 0 },
    };
    return stats;
  }, []);

  // Handle emergency evacuation pulse
  const handleEvacuationPulse = () => {
    setToast('🚨 EMERGENCY EVACUATION SIGNAL DISPATCHED: All 829 Entrance Turnstiles & Perimeter Egress Relays unlocked for 30 seconds fail-safe.');
  };

  // Handle master vault lock
  const handleToggleLockdown = () => {
    if (!lockdownActive) {
      setLockdownActive(true);
      setToast('🔒 HIGH-SECURITY VAULT LOCKDOWN ACTIVATED: All 520 Cash Vault Mantraps locked in Hard Dual-Custody Mode.');
    } else {
      setLockdownActive(false);
      setToast('🔓 Normal Banking Security Policy Restored across all 520 Vault Portals.');
    }
  };

  // Handle export CSV
  const handleExportTelemetry = () => {
    const rows = [
      ['Metric', 'Value', 'Status', 'SLA Standard'],
      ['Total Armed Access Doors', '2,696', '100% Armed', 'Bangladesh Bank ICT-08'],
      ['Healthy / Normal Doors', `${doorMetrics.normal}`, `${doorMetrics.normalPct}% Operational`, 'SLA >= 99.5%'],
      ['Held Open Sensor Warnings', `${doorMetrics.warning}`, 'Warning Delay Active', 'Threshold < 15'],
      ['Forced Door Intrusion Alarms', '0', 'Zero Active Breaches', 'Zero Tolerance'],
      ['Cash Vault Mantraps', '520', '100% Dual-Custody Bio+PIN', 'AC-08 Mandate'],
      ['CoreStation CS-40 ACUs', '520', '100% Online', 'Redundant Hardware SLA'],
      ['Access Groups Configured', '829', 'Active', 'Branch-specific Tier Matrix'],
      ['Access Levels Defined', '29', 'Active', 'Tiers 1 ~ 5 Security Hierarchy'],
      ['Today Access Denials', '17', '100% Intercepted', 'Zero Unauthorized Entry'],
      ['Anti-Passback Enforcement', '100%', 'Shielded', 'Soft APB with SOC Alert'],
    ];
    exportCsv('Category,Indicator,Current Count,Policy Note', rows, `Pubali_Bank_Access_Control_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    setToast('📥 Exported Nationwide Access Control Telemetry Report (CSV).');
  };

  // Clear a warning door
  const handleClearWarningDoor = (doorId) => {
    globalDoorStore.setDoorOverride(doorId, {
      sensor: 'Closed',
      loop: 'Normal',
      relayStatus: 'Locked'
    });
    setToast(`✓ Door sensor alert cleared for ${doorId}. Returned to Normal Armed state.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ─── TOAST NOTIFICATION ─── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: '#0f172a', color: '#fff', padding: '12px 20px',
          borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: 12, fontSize: 13,
          fontWeight: 600, borderLeft: '4px solid #0d9488', maxWidth: 460
        }}>
          <span>{toast}</span>
          <button
            onClick={() => setToast('')}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
          >✕</button>
        </div>
      )}

      {/* ─── EXECUTIVE HEADER BANNER ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #0d9488 100%)',
        borderRadius: 12,
        padding: '20px 26px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 8px 24px rgba(13, 148, 136, 0.25)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            flexShrink: 0
          }}></div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>
                Access Control Command Center & Door Security Matrix
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.22)',
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                100% Armed SLA
              </span>
              <span style={{
                background: '#10b981',
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 11,
                fontWeight: 800,
                color: '#fff',
                boxShadow: '0 2px 6px rgba(16,185,129,0.4)'
              }}>
                ● LIVE RELAY TELEMETRY
              </span>
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.92, marginTop: 4 }}>
              Pubali Bank PLC · Centralized Suprema BioStar X Access Architecture · 2,696 Portals across 829 Branches · Bangladesh Bank ICT-08
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            id="ac-btn-evacuate"
            onClick={handleEvacuationPulse}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fecaca',
              padding: '8px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
            title="Trigger momentary 30-second fire safe evacuation release on turnstiles"
          >
            <span>Evacuation Pulse</span>
          </button>

          <button
            id="ac-btn-vault-lock"
            onClick={handleToggleLockdown}
            style={{
              background: lockdownActive ? '#dc2626' : 'rgba(255,255,255,0.15)',
              border: lockdownActive ? '1px solid #b91c1c' : '1px solid rgba(255,255,255,0.25)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
            title="Toggle Hard Lockdown mode on all 520 Cash Vault Mantraps"
          >
            <span>{lockdownActive ? 'Release' : 'Arm Vaults'}</span>
          </button>

          <button
            id="ac-btn-export"
            onClick={handleExportTelemetry}
            style={{
              background: '#ffffff',
              border: 'none',
              color: '#0f172a',
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.15s ease'
            }}
            title="Download CSV telemetry of nationwide access control network"
          >
            <span>Export Telemetry</span>
          </button>
        </div>
      </div>

      {/* ─── SEGMENTED SUB-NAVIGATION TABS ─── */}
      <div style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        padding: '8px 12px',
        borderRadius: 8,
        flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.04em', marginRight: 4 }}>
          ACCESS NAVIGATION:
        </span>

        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: activeTab === 'overview' ? '#0d9488' : '#f8fafc',
            color: activeTab === 'overview' ? '#ffffff' : '#334155',
            border: activeTab === 'overview' ? '1px solid #0d9488' : '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: activeTab === 'overview' ? '0 2px 6px rgba(13,148,136,0.25)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          <span>Access Dashboard</span>
          <span style={{ fontSize: 10, background: activeTab === 'overview' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>
            Command Hub
          </span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('access-doors')}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.15s'
          }}
        >
          <span>Door Management</span>
          <span style={{ fontSize: 10, background: '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>
            2,696 Doors
          </span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('access-doorstatus')}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.15s'
          }}
        >
          <span>Door Status & Telemetry</span>
          <span style={{ fontSize: 10, background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: 10 }}>
            8 Warnings
          </span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('access-group')}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.15s'
          }}
        >
          <span>Access Groups</span>
          <span style={{ fontSize: 10, background: '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>
            829 Groups
          </span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('access-level')}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.15s'
          }}
        >
          <span>Access Levels</span>
          <span style={{ fontSize: 10, background: '#e2e8f0', padding: '1px 6px', borderRadius: 10 }}>
            29 Tiers
          </span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('restricted-access?zone=Cash Vault')}
          style={{
            padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
            background: '#f8fafc', color: '#4f46e5', border: '1px solid #c7d2fe',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.15s'
          }}
        >
          <span>Cash Vault Audit</span>
          <span style={{ fontSize: 10, background: '#e0e7ff', color: '#4338ca', padding: '1px 6px', borderRadius: 10 }}>
            520 Vaults
          </span>
        </button>
      </div>

      {/* ─── 8 PRIMARY ACCESS CONTROL KPI CARDS ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12
      }}>
        {/* Card 1: Total Armed Doors */}
        <div
          onClick={() => onNavigate && onNavigate('access-doors')}
          style={{
            background: '#ffffff',
            border: '1px solid #ccfbf1',
            borderRadius: 10,
            padding: '14px 18px',
            cursor: 'pointer',
            transition: 'all 0.16s ease',
            boxShadow: '0 2px 6px rgba(13,148,136,0.06)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#0d9488'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#ccfbf1'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Armed Portals</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>2,696 Doors</div>
              <div style={{ fontSize: 11, color: '#0d9488', fontWeight: 600, marginTop: 2 }}>829 Branches & Sub-branches</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}></div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10.5, background: '#e6f4f1', color: '#0d9488', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
              100% Armed
            </span>
            <span style={{ fontSize: 11, color: '#0d9488', fontWeight: 700 }}>View Doors →</span>
          </div>
        </div>

        {/* Card 2: Door Sensor Health */}
        <div
          onClick={() => onNavigate && onNavigate('access-doorstatus?loop=Warning')}
          style={{
            background: '#ffffff',
            border: '1px solid #fef3c7',
            borderRadius: 10,
            padding: '14px 18px',
            cursor: 'pointer',
            transition: 'all 0.16s ease',
            boxShadow: '0 2px 6px rgba(217,119,6,0.06)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#d97706'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#fef3c7'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Relay & Sensor SLA</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>
                {doorMetrics.normal} <span style={{ fontSize: 15, fontWeight: 600, color: '#16a34a' }}>/ {doorMetrics.warning}</span>
              </div>
              <div style={{ fontSize: 11, color: '#d97706', fontWeight: 600, marginTop: 2 }}>
                {doorMetrics.warning} Held-Open Sensor Warnings
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}></div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10.5, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
              {doorMetrics.normalPct}% Health
            </span>
            <span style={{ fontSize: 11, color: '#d97706', fontWeight: 700 }}>Telemetry →</span>
          </div>
        </div>

        {/* Card 3: Cash Vault Mantraps */}
        <div
          onClick={() => onNavigate && onNavigate('restricted-access?zone=Cash Vault')}
          style={{
            background: '#ffffff',
            border: '1px solid #e0e7ff',
            borderRadius: 10,
            padding: '14px 18px',
            cursor: 'pointer',
            transition: 'all 0.16s ease',
            boxShadow: '0 2px 6px rgba(79,70,229,0.06)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#6366f1'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e0e7ff'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Cash Vault & Mantraps</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>520 / 520</div>
              <div style={{ fontSize: 11, color: '#4f46e5', fontWeight: 600, marginTop: 2 }}>Dual Custody Bio+PIN (AC-08)</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}></div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10.5, background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
              100% Interlocked
            </span>
            <span style={{ fontSize: 11, color: '#4f46e5', fontWeight: 700 }}>Audit Logs →</span>
          </div>
        </div>

        {/* Card 4: Master CoreStations */}
        <div
          onClick={() => onNavigate && onNavigate('dev-list?model=CoreStation CS-40')}
          style={{
            background: '#ffffff',
            border: '1px solid #d1fae5',
            borderRadius: 10,
            padding: '14px 18px',
            cursor: 'pointer',
            transition: 'all 0.16s ease',
            boxShadow: '0 2px 6px rgba(16,185,129,0.06)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#059669'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#d1fae5'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>CoreStation Controllers</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>520 / 520</div>
              <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginTop: 2 }}>CS-40 Multi-Door ACUs Online</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}></div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10.5, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
              100% Online SLA
            </span>
            <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>View ACUs →</span>
          </div>
        </div>

        {/* Card 5: Access Groups */}
        <div
          onClick={() => onNavigate && onNavigate('access-group')}
          style={{
            background: '#ffffff',
            border: '1px solid #e0f2fe',
            borderRadius: 10,
            padding: '14px 18px',
            cursor: 'pointer',
            transition: 'all 0.16s ease',
            boxShadow: '0 2px 6px rgba(2,132,199,0.06)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#0284c7'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e0f2fe'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Configured Access Groups</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>829 Groups</div>
              <div style={{ fontSize: 11, color: '#0284c7', fontWeight: 600, marginTop: 2 }}>Branch & Dual-Custody Tiers</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}></div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10.5, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
              100% Synced
            </span>
            <span style={{ fontSize: 11, color: '#0284c7', fontWeight: 700 }}>Manage Groups →</span>
          </div>
        </div>

        {/* Card 6: Access Levels */}
        <div
          onClick={() => onNavigate && onNavigate('access-level')}
          style={{
            background: '#ffffff',
            border: '1px solid #f3e8ff',
            borderRadius: 10,
            padding: '14px 18px',
            cursor: 'pointer',
            transition: 'all 0.16s ease',
            boxShadow: '0 2px 6px rgba(124,58,237,0.06)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#7c3aed'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#f3e8ff'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Security Access Levels</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>29 Tiers</div>
              <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600, marginTop: 2 }}>Level 1 Staff ~ Level 5 Vault</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}></div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10.5, background: '#f3e8ff', color: '#6d28d9', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
              Hierarchical Matrix
            </span>
            <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700 }}>View Tiers →</span>
          </div>
        </div>

        {/* Card 7: Unauthorized Access Denied */}
        <div
          onClick={() => onNavigate && onNavigate('restricted-access?result=Denied')}
          style={{
            background: '#ffffff',
            border: '1px solid #ffedd5',
            borderRadius: 10,
            padding: '14px 18px',
            cursor: 'pointer',
            transition: 'all 0.16s ease',
            boxShadow: '0 2px 6px rgba(234,88,12,0.06)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#ea580c'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#ffedd5'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Access Denials Today</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>17 Denials</div>
              <div style={{ fontSize: 11, color: '#ea580c', fontWeight: 600, marginTop: 2 }}>Card / Schedule Restrictions</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}></div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10.5, background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
              100% Intercepted
            </span>
            <span style={{ fontSize: 11, color: '#ea580c', fontWeight: 700 }}>Audit Denials →</span>
          </div>
        </div>

        {/* Card 8: Forced Door Breaches */}
        <div
          onClick={() => onNavigate && onNavigate('soc-alarm?type=Door Forced Open')}
          style={{
            background: '#ffffff',
            border: '1px solid #fee2e2',
            borderRadius: 10,
            padding: '14px 18px',
            cursor: 'pointer',
            transition: 'all 0.16s ease',
            boxShadow: '0 2px 6px rgba(220,38,38,0.06)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#dc2626'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#fee2e2'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Forced Door Intrusion</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a', marginTop: 3 }}>0 Open</div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>2 Auto-Locked & Resolved</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}></div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10.5, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
              Zero Open Breach
            </span>
            <span style={{ fontSize: 11, color: '#15803d', fontWeight: 700 }}>SOC Alarms →</span>
          </div>
        </div>
      </div>

      {/* ─── ROW 2: DOOR ARCHITECTURE & LIVE SENSOR STATUS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16 }}>
        {/* Panel A: Door Physical Security Categorization */}
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🏗️</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                Door Hardware & Interlock Architecture
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0d9488', background: '#e6f4f1', padding: '2px 8px', borderRadius: 10 }}>
              2,696 Deployed
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Category 1 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                <span>Perimeter Entrance Turnstiles & Mag Locks</span>
                <span>829 Doors (30.8%)</span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '30.8%', height: '100%', background: '#0d9488', borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>
                High-speed Optical Barriers, Motorized Turnstiles & 600-lb Fail-Secure Magnetic Relays
              </div>
            </div>

            {/* Category 2 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                <span>Cash Vault & Strong Room Mantraps (AC-08)</span>
                <span>520 Doors (19.3%)</span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '19.3%', height: '100%', background: '#4f46e5', borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>
                Dual-Custody Heavy Solenoid Armored Interlocks · Bio+PIN Multi-Factor Verification
              </div>
            </div>

            {/* Category 3 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                <span>Tier-IV Data Center & Server Room Airlocks</span>
                <span>412 Doors (15.3%)</span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '15.3%', height: '100%', background: '#0284c7', borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>
                Airlock Interlock Isolation · Biometric FaceStation F2 + Card Double Relay Enforcement
              </div>
            </div>

            {/* Category 4 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                <span>Branch Back Office & Monitored Fire Exits</span>
                <span>935 Doors (34.6%)</span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '34.6%', height: '100%', background: '#10b981', borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>
                Electric Strikes, Emergency Break-Glass Release & Panic Bar Monitored Magnetic Contacts
              </div>
            </div>
          </div>
        </div>

        {/* Panel B: Live Held-Open Sensor Warnings (8 Nationwide) */}
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid #fde68a',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                Live Door Held-Open Sensor Alerts ({doorMetrics.warning})
              </span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('access-doorstatus?loop=Warning')}
              style={{
                background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309',
                padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer'
              }}
            >
              Full Door Status →
            </button>
          </div>

          <div style={{ fontSize: 11.5, color: '#64748b' }}>
            Magnetic contact sensor delay exceeded 60s without latch closure. Field technicians notified.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 215, overflowY: 'auto', paddingRight: 4 }}>
            {WARNING_DOOR_INDEX_MAP.map((item) => {
              const isCleared = liveDoors[item.door]?.loop === 'Normal';
              return (
                <div
                  key={item.door}
                  style={{
                    background: isCleared ? '#f0fdf4' : '#fffbeb',
                    border: isCleared ? '1px solid #bbf7d0' : '1px solid #fde68a',
                    borderRadius: 6,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: isCleared ? '#15803d' : '#b45309', fontFamily: 'monospace' }}>
                        {item.door}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                        {item.branch}
                      </span>
                      <span style={{ fontSize: 10, background: '#e2e8f0', color: '#475569', padding: '1px 5px', borderRadius: 4 }}>
                        {item.division}
                      </span>
                    </div>
                    <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>
                      {item.name} · Open Duration: <strong style={{ color: isCleared ? '#15803d' : '#b45309' }}>{isCleared ? 'Cleared' : item.duration}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {isCleared ? (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '3px 8px', borderRadius: 4 }}>
                        ✓ Normal
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClearWarningDoor(item.door)}
                        style={{
                          background: '#16a34a', color: '#fff', border: 'none',
                          padding: '3px 8px', borderRadius: 4, fontSize: 10.5,
                          fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 3px rgba(22,163,74,0.3)'
                        }}
                        title="Acknowledge and reset sensor to normal"
                      >
                        ✓ Reset
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── ROW 3: REGIONAL SECURITY DISTRIBUTION (8 DIVISIONS) ─── */}
      <div style={{
        background: '#ffffff',
        borderRadius: 10,
        border: '1px solid #e2e8f0',
        padding: '18px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🗺️</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
              Regional Access Control Distribution & Division SLA Matrix (8 Divisions)
            </span>
          </div>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>
            Central Bank Circular ICT-08 Nationwide Regional Telemetry
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
          {Object.entries(divisionBreakdown).map(([divName, data]) => {
            const healthPct = (((data.total - data.warning) / data.total) * 100).toFixed(1);
            return (
              <div
                key={divName}
                onClick={() => onNavigate && onNavigate(`access-doors?division=${divName}`)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0d9488'; e.currentTarget.style.background = '#f0fdfa'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{divName}</span>
                  <span style={{
                    fontSize: 10.5, fontWeight: 800,
                    background: data.warning > 0 ? '#fef3c7' : '#dcfce7',
                    color: data.warning > 0 ? '#b45309' : '#15803d',
                    padding: '1px 6px', borderRadius: 8
                  }}>
                    {healthPct}% SLA
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{data.total} Doors</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    {data.normal} OK · {data.warning > 0 ? <strong style={{ color: '#d97706' }}>{data.warning} Warn</strong> : '0 Warn'}
                  </span>
                </div>
                <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${healthPct}%`, height: '100%', background: '#0d9488', borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── ROW 4: REAL-TIME ACCESS EVENT STREAM & ICT-08 COMPLIANCE ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 16 }}>
        {/* Real-time Event Feed */}
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                Real-Time Door Access Punch Telemetry
              </span>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('restricted-access')}
              style={{
                background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155',
                padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer'
              }}
            >
              All Access Logs →
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Time</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Branch & Door</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Staff / User</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Auth Modality</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {LIVE_ACCESS_FEED.map(evt => (
                  <tr key={evt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#64748b', fontWeight: 600 }}>{evt.time}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{evt.branch}</div>
                      <div style={{ fontSize: 10.5, color: '#64748b' }}>{evt.door}</div>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{evt.employee}</div>
                      <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{evt.role}</div>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ fontSize: 10, background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                        {evt.auth}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{
                        fontSize: 10.5, fontWeight: 800,
                        background: evt.result === 'Granted' ? '#dcfce7' : '#fee2e2',
                        color: evt.result === 'Granted' ? '#15803d' : '#b91c1c',
                        padding: '2px 8px', borderRadius: 10
                      }}>
                        {evt.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bangladesh Bank ICT-08 Compliance Matrix */}
        <div style={{
          background: '#ffffff',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🏛️</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                Bangladesh Bank ICT-08 Physical Security Audit
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 10 }}>
              100% COMPLIANT
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                  Clause AC-08: Dual-Custody Vault Access
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a' }}>✓ 520 / 520 Verified</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                Two officers (Branch Manager + Cash Officer) required simultaneously. Enforced at hardware controller relay level.
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                  Clause AC-05: Anti-Passback (APB) Protection
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a' }}>✓ 100% Armed</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                Soft APB logging with SOC real-time alert trigger. Prohibits badge sharing and tailgating through entry portals.
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                  Clause AC-12: Fire Alarm Emergency Egress
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a' }}>✓ Certified</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                All 2,696 perimeter doors equipped with fail-safe auxiliary relays wired to Central Fire Alarm System (FAS).
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                  Clause SOC-01: Central Security Alarming
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a' }}>✓ 24/7 Monitored</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                Door Forced Open & Door Held Open sensors hardwired to Central Head Office SOC panel with instant audible siren.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
