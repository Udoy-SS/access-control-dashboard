import React, { useState, useMemo, useEffect } from 'react';
import {
  DIVISIONS_LIST,
  REGIONAL_OFFICES,
  FULL_PUBALI_LOCATIONS,
  NETWORK_STATISTICS
} from '../data/pubaliFullBranches';

// ─── STATUS BADGE ─────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === 'Online') {
    return <span className="bs-badge bs-badge-green"><span className="bs-dot bs-dot-green"></span>Online</span>;
  }
  if (status === 'Offline') {
    return <span className="bs-badge bs-badge-red"><span className="bs-dot bs-dot-red"></span>Offline</span>;
  }
  if (status === 'Sync Issue') {
    return <span className="bs-badge bs-badge-amber"><span className="bs-dot bs-dot-amber"></span>Sync Issue</span>;
  }
  if (status === 'Locked') {
    return <span className="bs-badge bs-badge-teal"><span className="bs-dot bs-dot-teal"></span>Locked</span>;
  }
  if (status === 'Unlocked') {
    return <span className="bs-badge bs-badge-amber"><span className="bs-dot bs-dot-amber"></span>Unlocked</span>;
  }
  return <span className="bs-badge bs-badge-gray">{status}</span>;
}

// ─── TYPE TAG ─────────────────────────────────────────────
function TypeTag({ type }) {
  if (type === 'head-office') return <span className="bs-tag-headoffice">Head Office</span>;
  if (type === 'branch') return <span className="bs-tag-branch">Branch</span>;
  if (type === 'sub-branch') return <span className="bs-tag-subbranch">Sub-Branch</span>;
  if (type === 'islamic') return <span className="bs-tag-islamic">Islamic Unit</span>;
  return <span className="bs-badge bs-badge-gray">{type}</span>;
}

// ─── BRANCH DETAIL VIEW ───────────────────────────────────
function BranchDetailView({ branch, onBack, onSelectBranch }) {
  const [activeTab, setActiveTab] = useState('info');

  // Find linked sub-branches if this is a parent branch
  const linkedSubBranches = useMemo(() => {
    if (!branch || (branch.type !== 'branch' && branch.type !== 'head-office')) return [];
    return FULL_PUBALI_LOCATIONS.filter(
      l => l.type === 'sub-branch' && l.parentBranchCode === branch.code
    );
  }, [branch]);

  if (!branch) {
    return (
      <div className="bs-card" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>📍</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>Location Details Not Found</div>
        <button className="bs-btn bs-btn-outline bs-btn-sm" onClick={onBack} style={{ marginTop: 14 }}>
          ← Back to Organization List
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Branch Information' },
    { id: 'devices', label: `Suprema Devices (${branch.devices ? branch.devices.length : 0})` },
    { id: 'doors', label: `Access Control (${branch.doorList ? branch.doorList.length : branch.doors} Doors)` },
    { id: 'attendance', label: 'Time Attendance' },
    ...(linkedSubBranches.length > 0 ? [{ id: 'subbranches', label: `Linked Upashakha (${linkedSubBranches.length})` }] : [])
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Breadcrumb */}
      <div className="bs-breadcrumb">
        <span className="bs-breadcrumb-item" onClick={onBack}>Organization</span>
        <span className="bs-breadcrumb-sep">›</span>
        <span className="bs-breadcrumb-item" onClick={onBack}>{branch.division} Division</span>
        <span className="bs-breadcrumb-sep">›</span>
        <span className="bs-breadcrumb-item" onClick={onBack}>{branch.zone}</span>
        <span className="bs-breadcrumb-sep">›</span>
        <span className="bs-breadcrumb-current">{branch.name}</span>
        <button
          onClick={onBack}
          className="bs-btn bs-btn-outline bs-btn-sm"
          style={{ marginLeft: 'auto' }}
        >
          ← Back to List
        </button>
      </div>

      {/* Header Card */}
      <div className="bs-card">
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(90deg, #0f766e 0%, #0d9488 60%, #14b8a6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '6px 6px 0 0',
          color: '#fff',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>{branch.name}</span>
              <TypeTag type={branch.type} />
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
              {branch.address} · {branch.district}, {branch.division}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Branch Code</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 16, background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: 4 }}>
                {branch.code}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Routing No</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, background: 'rgba(0,0,0,0.15)', padding: '3px 8px', borderRadius: 4 }}>
                {branch.routingNumber || '175000000'}
              </div>
            </div>
            <StatusBadge status={branch.status} />
          </div>
        </div>

        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', borderTop: '1px solid #eef0f3', background: '#fafbfc' }}>
          {[
            { label: 'Division', value: branch.division },
            { label: 'District', value: branch.district },
            { label: 'Regional Zone', value: branch.zone },
            { label: 'Branch Manager', value: branch.manager },
            { label: 'Suprema Terminals', value: branch.devices ? branch.devices.length : 0 },
            { label: 'Monitored Doors', value: branch.doors || 4 }
          ].map((item, i) => (
            <div key={i} style={{ padding: '10px 14px', borderRight: i < 5 ? '1px solid #eef0f3' : 'none' }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bs-tabs">
        {tabs.map(t => (
          <div
            key={t.id}
            className={`bs-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </div>
        ))}
      </div>

      {/* Tab: Info */}
      {activeTab === 'info' && (
        <div className="grid-2" style={{ gap: 14 }}>
          <div className="bs-card">
            <div className="bs-card-header"><span className="bs-card-header-title">Location & Branch Details</span></div>
            <div className="bs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Official Branch Name', value: branch.name },
                { label: 'Classification', value: branch.typeLabel || branch.type },
                { label: 'Branch Code', value: branch.code },
                { label: 'Bangladesh Bank Routing No', value: branch.routingNumber },
                { label: 'Parent Branch', value: branch.parentBranchName ? `${branch.parentBranchName} (${branch.parentBranchCode})` : 'Self-Operating Branch' },
                { label: 'Administrative Zone', value: branch.zone },
                { label: 'District / Division', value: `${branch.district}, ${branch.division} Division` },
                { label: 'Physical Address', value: branch.address },
                { label: 'Official Contact / Phone', value: branch.phone || '+880 2-223381614' },
                { label: 'Branch Incharge / Manager', value: branch.manager },
                { label: 'BioStar X Server Route', value: 'biostar-central.pubalibank.com:443 (Gateway #01)' },
                { label: 'Hardware Telemetry', value: branch.status }
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 10, padding: '5px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 11.5, color: '#6b7280', minWidth: 160 }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', flex: 1 }}>
                    {label === 'Hardware Telemetry' ? <StatusBadge status={value} /> : value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bs-card">
            <div className="bs-card-header"><span className="bs-card-header-title">Biometric Attendance Summary</span></div>
            <div className="bs-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#16a34a', textTransform: 'uppercase' }}>Present Staff</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#15803d' }}>{branch.attendance ? branch.attendance.present : 0}</div>
                  <div style={{ fontSize: 11, color: '#16a34a' }}>
                    {branch.attendance && branch.attendance.total ? Math.round(branch.attendance.present / branch.attendance.total * 100) : 0}% Attendance
                  </div>
                </div>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#dc2626', textTransform: 'uppercase' }}>Absent / On Leave</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#b91c1c' }}>
                    {branch.attendance ? branch.attendance.total - branch.attendance.present : 0}
                  </div>
                  <div style={{ fontSize: 11, color: '#dc2626' }}>Total Roster: {branch.attendance ? branch.attendance.total : 0}</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: 12 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Suprema Biometric Sync Status</div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                  • Last full user credential database sync: <strong>Today 06:00 AM (Central Sync)</strong><br />
                  • Active Suprema Devices reporting heartbeat: <strong>{branch.devices ? branch.devices.length : 0} terminals</strong><br />
                  • Tamper loop detection: <span style={{ color: '#16a34a', fontWeight: 600 }}>Normal (No tamper alerts active)</span><br />
                  • Door relay interlocking: <strong>Vault Dual-Custody Enabled</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Devices */}
      {activeTab === 'devices' && (
        <div className="bs-card">
          <div className="bs-card-header">
            <span className="bs-card-header-title">Deployed Suprema Terminals ({branch.devices ? branch.devices.length : 0})</span>
          </div>
          <table className="bs-table">
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Model</th>
                <th>Hardware Type</th>
                <th>IP Address</th>
                <th>Port</th>
                <th>MAC Address</th>
                <th>Physical Location</th>
                <th>Firmware</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {branch.devices && branch.devices.map(dev => (
                <tr key={dev.id}>
                  <td className="mono font-semibold" style={{ color: '#0d9488' }}>{dev.id}</td>
                  <td><strong>{dev.name}</strong> ({dev.model})</td>
                  <td style={{ color: '#6b7280', fontSize: 11 }}>Biometric Access / TA</td>
                  <td className="mono">{dev.ip}</td>
                  <td className="mono" style={{ color: '#9ca3af' }}>{dev.port || 51211}</td>
                  <td className="mono" style={{ fontSize: 11, color: '#6b7280' }}>{dev.mac}</td>
                  <td>{dev.location}</td>
                  <td className="mono" style={{ fontSize: 10.5, color: '#9ca3af' }}>{dev.firmware || 'v1.4.2'}</td>
                  <td><StatusBadge status={dev.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Doors */}
      {activeTab === 'doors' && (
        <div className="bs-card">
          <div className="bs-card-header">
            <span className="bs-card-header-title">Monitored Doors & Access Control Zones</span>
          </div>
          <table className="bs-table">
            <thead>
              <tr>
                <th>Door Name</th>
                <th>Lock Type</th>
                <th>Access Group</th>
                <th>Sensor State</th>
                <th>Relay State</th>
              </tr>
            </thead>
            <tbody>
              {branch.doorList && branch.doorList.map((d, i) => (
                <tr key={i}>
                  <td><strong>{d.name}</strong></td>
                  <td><span className="bs-badge bs-badge-gray">{d.type}</span></td>
                  <td style={{ color: '#4b5563' }}>{d.group}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: d.sensor === 'Closed' ? '#16a34a' : '#dc2626' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.sensor === 'Closed' ? '#22c55e' : '#ef4444' }}></span>
                      {d.sensor}
                    </span>
                  </td>
                  <td><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Attendance */}
      {activeTab === 'attendance' && (
        <div className="bs-card">
          <div className="bs-card-header">
            <span className="bs-card-header-title">Live Biometric Punch Roster</span>
          </div>
          <table className="bs-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Employee Name</th>
                <th>Punch In Time</th>
                <th>Status</th>
                <th>Punctuality</th>
              </tr>
            </thead>
            <tbody>
              {branch.employees && branch.employees.map(emp => (
                <tr key={emp.id}>
                  <td className="mono font-semibold" style={{ color: '#0d9488' }}>{emp.id}</td>
                  <td><strong>{emp.name}</strong></td>
                  <td className="mono">{emp.inTime}</td>
                  <td>
                    <span className={`bs-badge bs-badge-${emp.status === 'Present' ? 'green' : emp.status === 'Late' ? 'amber' : 'red'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    {emp.late ? (
                      <span style={{ color: '#d97706', fontSize: 11, fontWeight: 600 }}>Late Arrival</span>
                    ) : emp.status === 'Present' ? (
                      <span style={{ color: '#16a34a', fontSize: 11 }}>On Time</span>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: 11 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Sub-branches */}
      {activeTab === 'subbranches' && (
        <div className="bs-card">
          <div className="bs-card-header">
            <span className="bs-card-header-title">Sub-Branches (Upashakha) Under {branch.name} ({linkedSubBranches.length})</span>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {linkedSubBranches.map(sb => (
                <div
                  key={sb.id}
                  className="bs-branch-card"
                  onClick={() => onSelectBranch(sb)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="bs-branch-card-header" style={{ background: '#78350f' }}>
                    <span className="bs-branch-card-name">{sb.name}</span>
                    <span className="bs-branch-card-code">{sb.code}</span>
                  </div>
                  <div className="bs-branch-card-body">
                    <div className="bs-branch-stat">
                      <span className="bs-branch-stat-label">Classification</span>
                      <TypeTag type={sb.type} />
                    </div>
                    <div className="bs-branch-stat">
                      <span className="bs-branch-stat-label">Routing Number</span>
                      <span className="mono font-semibold">{sb.routingNumber}</span>
                    </div>
                    <div className="bs-branch-stat">
                      <span className="bs-branch-stat-label">Suprema Device</span>
                      <span className="bs-branch-stat-value">{sb.devices[0]?.name}</span>
                    </div>
                    <div className="bs-branch-stat">
                      <span className="bs-branch-stat-label">Status</span>
                      <StatusBadge status={sb.status} />
                    </div>
                    <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 11, color: '#0d9488', fontWeight: 600 }}>
                        View Upashakha Details →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BANK OVERVIEW COMPONENT ──────────────────────────────
function BankOverviewTab({ onSelectDivision }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Corporate Summary Card */}
      <div className="bs-card">
        <div style={{
          padding: '18px 22px',
          background: 'linear-gradient(135deg, #042f2e 0%, #115e59 50%, #0d9488 100%)',
          borderRadius: '6px 6px 0 0',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Pubali Bank PLC — Nationwide Biometric Infrastructure
            </div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
              Centralized Suprema BioStar X Enterprise Deployment across all 8 Divisions and 64 Districts
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 16px', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Total Locations</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>829</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 16px', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Terminals Online</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399' }}>98.1%</div>
            </div>
          </div>
        </div>

        {/* Division Breakdown Grid */}
        <div style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>
            Division Distribution Breakdown (Click to filter branches)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {DIVISIONS_LIST.map(divName => {
              const divLocations = FULL_PUBALI_LOCATIONS.filter(l => l.division === divName);
              const bCount = divLocations.filter(l => l.type === 'branch' || l.type === 'head-office').length;
              const sbCount = divLocations.filter(l => l.type === 'sub-branch').length;
              const islCount = divLocations.filter(l => l.type === 'islamic').length;
              const devCount = divLocations.reduce((a, l) => a + l.devices.length, 0);

              return (
                <div
                  key={divName}
                  onClick={() => onSelectDivision(divName)}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    padding: '12px 14px',
                    background: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#0d9488'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#0d9488' }}>{divName} Division</span>
                    <span style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 3, fontWeight: 600 }}>
                      {divLocations.length} locations
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#4b5563', marginBottom: 4 }}>
                    <span>Full Branches: <strong>{bCount}</strong></span>
                    <span>Sub-Branches: <strong>{sbCount}</strong></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#4b5563', marginBottom: 8 }}>
                    <span>Islamic Units: <strong>{islCount}</strong></span>
                    <span>Suprema Terminals: <strong>{devCount}</strong></span>
                  </div>
                  <div className="bs-bar-track">
                    <div className="bs-bar-fill" style={{ width: `${(divLocations.length / 829) * 100 * 3}%`, background: '#0d9488' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REGIONAL OFFICES COMPONENT ───────────────────────────
function RegionalOfficesTab({ onSelectZone }) {
  return (
    <div className="bs-card">
      <div className="bs-card-header">
        <span className="bs-card-header-title">29 Regional Administrative Zones & Offices</span>
      </div>
      <table className="bs-table">
        <thead>
          <tr>
            <th>Regional Office</th>
            <th>Zone Code</th>
            <th>Division</th>
            <th>Districts Covered</th>
            <th>Full Branches</th>
            <th>Sub-Branches</th>
            <th>Islamic</th>
            <th>Total Units</th>
            <th>Devices</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {REGIONAL_OFFICES.map(ro => (
            <tr key={ro.id}>
              <td><strong>{ro.name}</strong></td>
              <td className="mono font-semibold" style={{ color: '#0d9488' }}>{ro.code}</td>
              <td>{ro.division}</td>
              <td style={{ fontSize: 11, color: '#4b5563' }}>{ro.districts.join(', ')}</td>
              <td><strong>{ro.branchCount}</strong></td>
              <td>{ro.subBranchCount}</td>
              <td>{ro.islamicCount}</td>
              <td style={{ fontWeight: 700 }}>{ro.totalLocations}</td>
              <td className="mono">{ro.deviceCount}</td>
              <td><StatusBadge status={ro.status} /></td>
              <td>
                <button
                  className="bs-btn bs-btn-outline bs-btn-sm"
                  onClick={() => onSelectZone(ro.zoneName)}
                >
                  View Branches →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── MAIN ORGANIZATION COMPONENT ──────────────────────────
export default function BioStarOrganization({ subPage = 'organization', onNavigate }) {
  const [selectedBranch, setSelectedBranch] = useState(() => {
    if (subPage === 'org-headoffice') {
      return FULL_PUBALI_LOCATIONS.find(l => l.code === '0101') || null;
    }
    if (subPage && subPage.startsWith('branch/')) {
      const code = subPage.replace('branch/', '').trim();
      return FULL_PUBALI_LOCATIONS.find(l => l.code === code) || null;
    }
    return null;
  });

  // Active level tab
  const [levelTab, setLevelTab] = useState(() => {
    if (subPage === 'org-bank') return 'bank';
    if (subPage === 'org-headoffice') return 'headoffice';
    if (subPage === 'org-region') return 'region';
    if (subPage === 'org-branch') return 'branch';
    if (subPage === 'org-subbranch') return 'subbranch';
    return 'all';
  });

  useEffect(() => {
    if (subPage === 'org-bank') {
      setLevelTab('bank');
      setSelectedBranch(null);
    } else if (subPage === 'org-headoffice') {
      setLevelTab('headoffice');
      const ho = FULL_PUBALI_LOCATIONS.find(l => l.code === '0101');
      if (ho) setSelectedBranch(ho);
    } else if (subPage === 'org-region') {
      setLevelTab('region');
      setSelectedBranch(null);
    } else if (subPage === 'org-branch') {
      setLevelTab('branch');
      setSelectedBranch(null);
    } else if (subPage === 'org-subbranch') {
      setLevelTab('subbranch');
      setSelectedBranch(null);
    } else if (subPage === 'organization') {
      setLevelTab('all');
      setSelectedBranch(null);
    } else if (subPage && subPage.startsWith('branch/')) {
      const code = subPage.replace('branch/', '').trim();
      const b = FULL_PUBALI_LOCATIONS.find(l => l.code === code);
      if (b) setSelectedBranch(b);
    }
  }, [subPage]);

  const handleSelectBranch = (b) => {
    setSelectedBranch(b);
    if (typeof window !== 'undefined') {
      window.location.hash = `branch/${b.code}`;
    }
  };

  const handleBackToList = () => {
    setSelectedBranch(null);
    setLevelTab('all');
    if (typeof window !== 'undefined') {
      window.location.hash = 'organization';
    }
  };

  // Filters
  const [search, setSearch] = useState('');

  const [selectedDivision, setSelectedDivision] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 36;

  // Filtered dataset
  const filteredLocations = useMemo(() => {
    return FULL_PUBALI_LOCATIONS.filter(item => {
      // Level tab filter
      if (levelTab === 'branch' && item.type !== 'branch' && item.type !== 'head-office') return false;
      if (levelTab === 'subbranch' && item.type !== 'sub-branch') return false;
      if (levelTab === 'headoffice' && item.type !== 'head-office') return false;
      if (levelTab === 'islamic' && item.type !== 'islamic') return false;

      // Dropdown type filter
      if (typeFilter === 'branch' && item.type !== 'branch' && item.type !== 'head-office') return false;
      if (typeFilter === 'sub-branch' && item.type !== 'sub-branch') return false;
      if (typeFilter === 'islamic' && item.type !== 'islamic') return false;

      // Division filter
      if (selectedDivision !== 'All' && item.division !== selectedDivision) return false;

      // Zone filter
      if (selectedZone !== 'All' && item.zone !== selectedZone) return false;

      // Status filter
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchRouting = item.routingNumber && item.routingNumber.includes(q);
        const matchDistrict = item.district.toLowerCase().includes(q);
        const matchZone = item.zone.toLowerCase().includes(q);
        const matchManager = item.manager && item.manager.toLowerCase().includes(q);
        return matchName || matchCode || matchRouting || matchDistrict || matchZone || matchManager;
      }

      return true;
    });
  }, [levelTab, typeFilter, selectedDivision, selectedZone, statusFilter, search]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [levelTab, typeFilter, selectedDivision, selectedZone, statusFilter, search]);

  // Paginated items
  const totalPages = Math.ceil(filteredLocations.length / pageSize) || 1;
  const paginatedLocations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLocations.slice(start, start + pageSize);
  }, [filteredLocations, currentPage, pageSize]);

  // List of zones for the selected division (must be called before any early returns to respect Rules of Hooks)
  const availableZones = useMemo(() => {
    if (selectedDivision === 'All') {
      return Array.from(new Set(REGIONAL_OFFICES.map(r => r.zoneName)));
    }
    return REGIONAL_OFFICES.filter(r => r.division === selectedDivision).map(r => r.zoneName);
  }, [selectedDivision]);

  // If a branch is selected, show detail view
  if (selectedBranch) {
    return (
      <BranchDetailView
        branch={selectedBranch}
        onBack={handleBackToList}
        onSelectBranch={handleSelectBranch}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ─── NATIONWIDE METRIC SUMMARY BAR ─── */}
      <div className="bs-card" style={{ padding: '12px 16px', background: '#fafbfc' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>Pubali Bank Network:</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0d9488', background: '#ccfbf1', padding: '2px 8px', borderRadius: 4 }}>
              829 Locations Nationwide
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, color: '#4b5563' }}>
            <span><strong>519</strong> Branches</span>
            <span style={{ color: '#d1d5db' }}>|</span>
            <span><strong>281</strong> Sub-Branches</span>
            <span style={{ color: '#d1d5db' }}>|</span>
            <span><strong>29</strong> Islamic Units</span>
            <span style={{ color: '#d1d5db' }}>|</span>
            <span><strong>29</strong> Regional Zones</span>
            <span style={{ color: '#d1d5db' }}>|</span>
            <span><strong>1,658+</strong> Suprema Terminals</span>
          </div>
        </div>
      </div>

      {/* ─── HIERARCHY LEVEL SELECTOR ─── */}
      <div className="bs-card" style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {[
            { id: 'all', label: 'All Locations (829)' },
            { id: 'bank', label: 'Bank Overview' },
            { id: 'headoffice', label: 'Head Office (0101)' },
            { id: 'region', label: 'Regional Offices (29)' },
            { id: 'branch', label: 'Full Branches (519)' },
            { id: 'subbranch', label: 'Sub-Branches (281)' },
            { id: 'islamic', label: 'Islamic Units (29)' },
          ].map(tab => {
            const isActive = levelTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setLevelTab(tab.id);
                  if (tab.id === 'headoffice') {
                    const ho = FULL_PUBALI_LOCATIONS.find(l => l.code === '0101');
                    if (ho) setSelectedBranch(ho);
                  } else {
                    setSelectedBranch(null);
                  }
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 4,
                  fontSize: 11.5,
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? '1px solid #0d9488' : '1px solid #e5e7eb',
                  background: isActive ? '#0d9488' : '#ffffff',
                  color: isActive ? '#ffffff' : '#4b5563',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* If Bank tab is selected, show Bank Overview */}
      {levelTab === 'bank' && (
        <BankOverviewTab
          onSelectDivision={div => {
            setSelectedDivision(div);
            setLevelTab('all');
          }}
        />
      )}

      {/* If Region tab is selected, show Region Offices */}
      {levelTab === 'region' && (
        <RegionalOfficesTab
          onSelectZone={zone => {
            setSelectedZone(zone);
            setLevelTab('all');
          }}
        />
      )}

      {/* Locations Browser (All / Branch / Subbranch / Islamic) */}
      {levelTab !== 'bank' && levelTab !== 'region' && (
        <>
          {/* ─── CASCADING FILTERS BAR ─── */}
          <div className="bs-card" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
                <input
                  className="bs-input"
                  style={{ width: '100%', paddingLeft: 28 }}
                  placeholder="Search name, code, routing no, district..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" style={{ position: 'absolute', left: 9, top: 9, color: '#9ca3af' }}>
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
              </div>

              {/* Division Dropdown */}
              <select
                className="bs-select"
                style={{ width: 140 }}
                value={selectedDivision}
                onChange={e => {
                  setSelectedDivision(e.target.value);
                  setSelectedZone('All');
                }}
              >
                <option value="All">All Divisions</option>
                {DIVISIONS_LIST.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {/* Zone Dropdown */}
              <select
                className="bs-select"
                style={{ width: 160 }}
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
              >
                <option value="All">All Regional Zones</option>
                {availableZones.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>

              {/* Status Dropdown */}
              <select
                className="bs-select"
                style={{ width: 120 }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Sync Issue">Sync Issue</option>
              </select>

              {/* View Switcher */}
              <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: 4, overflow: 'hidden', marginLeft: 'auto' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '5px 10px',
                    background: viewMode === 'grid' ? '#0d9488' : '#ffffff',
                    color: viewMode === 'grid' ? '#ffffff' : '#6b7280',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 600
                  }}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '5px 10px',
                    background: viewMode === 'table' ? '#0d9488' : '#ffffff',
                    color: viewMode === 'table' ? '#ffffff' : '#6b7280',
                    border: 'none',
                    borderLeft: '1px solid #d1d5db',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 600
                  }}
                >
                  Data Grid
                </button>
              </div>

              {/* Reset filter button if active */}
              {(search || selectedDivision !== 'All' || selectedZone !== 'All' || statusFilter !== 'All') && (
                <button
                  className="bs-btn bs-btn-outline bs-btn-sm"
                  onClick={() => {
                    setSearch('');
                    setSelectedDivision('All');
                    setSelectedZone('All');
                    setStatusFilter('All');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Results count & active tags */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#6b7280', borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>
              <div>
                Showing <strong>{filteredLocations.length}</strong> of {FULL_PUBALI_LOCATIONS.length} nationwide locations
                {selectedDivision !== 'All' && <span> · Division: <strong>{selectedDivision}</strong></span>}
                {selectedZone !== 'All' && <span> · Zone: <strong>{selectedZone}</strong></span>}
                {statusFilter !== 'All' && <span> · Status: <strong>{statusFilter}</strong></span>}
              </div>
              <div>
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>

          {/* ─── GRID VIEW ─── */}
          {viewMode === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {paginatedLocations.map(loc => (
                <div
                  key={loc.id}
                  className="bs-branch-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectBranch(loc)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectBranch(loc);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className="bs-branch-card-header"
                    style={{
                      background:
                        loc.type === 'head-office'
                          ? 'linear-gradient(90deg, #581c87 0%, #7e22ce 100%)'
                          : loc.type === 'sub-branch'
                          ? 'linear-gradient(90deg, #92400e 0%, #b45309 100%)'
                          : loc.type === 'islamic'
                          ? 'linear-gradient(90deg, #14532d 0%, #15803d 100%)'
                          : 'linear-gradient(90deg, #0f766e 0%, #0d9488 100%)'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span className="bs-branch-card-name" title={loc.name}>{loc.name}</span>
                      <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {loc.district} · {loc.zone}
                      </span>
                    </div>
                    <span className="bs-branch-card-code">{loc.code}</span>
                  </div>

                  <div className="bs-branch-card-body">
                    <div className="bs-branch-stat">
                      <span className="bs-branch-stat-label">Classification</span>
                      <TypeTag type={loc.type} />
                    </div>

                    <div className="bs-branch-stat">
                      <span className="bs-branch-stat-label">Routing Number</span>
                      <span className="mono font-semibold" style={{ fontSize: 11 }}>{loc.routingNumber}</span>
                    </div>

                    <div className="bs-branch-stat">
                      <span className="bs-branch-stat-label">BioStar Status</span>
                      <StatusBadge status={loc.status} />
                    </div>

                    <div className="bs-branch-stat">
                      <span className="bs-branch-stat-label">Suprema Terminal</span>
                      <span className="bs-branch-stat-value" style={{ fontSize: 11 }}>
                        {loc.devices && loc.devices.length > 0 ? loc.devices.map(d => d.name).join(', ') : 'None'}
                      </span>
                    </div>

                    <div className="bs-branch-stat">
                      <span className="bs-branch-stat-label">Attendance</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700 }}>
                        <span style={{ color: '#16a34a' }}>{loc.attendance?.present || 0}</span>
                        <span style={{ color: '#9ca3af' }}> / {loc.attendance?.total || 0}</span>
                        <span style={{ color: '#9ca3af', fontSize: 10, fontWeight: 400 }}> Present</span>
                      </span>
                    </div>

                    <div className="bs-branch-stat">
                      <span className="bs-branch-stat-label">Doors / Relays</span>
                      <span className="bs-branch-stat-value">{loc.doors || 2} Access Points</span>
                    </div>

                    <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }}>
                        {loc.devices && loc.devices[0] ? loc.devices[0].ip : '10.x.x.x'}
                      </span>
                      <span style={{ fontSize: 11, color: '#0d9488', fontWeight: 600 }}>
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── TABLE VIEW (DATA GRID) ─── */}
          {viewMode === 'table' && (
            <div className="bs-card">
              <table className="bs-table bs-table-clickable">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Branch / Unit Name</th>
                    <th>Division</th>
                    <th>Zone</th>
                    <th>District</th>
                    <th>Routing No</th>
                    <th>Suprema Device</th>
                    <th>IP Address</th>
                    <th>Doors</th>
                    <th>Attendance</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLocations.map(loc => (
                    <tr
                      key={loc.id}
                      tabIndex={0}
                      onClick={() => handleSelectBranch(loc)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectBranch(loc);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="mono font-semibold" style={{ color: '#0d9488' }}>{loc.code}</td>
                      <td><TypeTag type={loc.type} /></td>
                      <td>
                        <strong>{loc.name}</strong>
                        {loc.parentBranchName && (
                          <div style={{ fontSize: 10, color: '#9ca3af' }}>Parent: {loc.parentBranchName}</div>
                        )}
                      </td>
                      <td>{loc.division}</td>
                      <td style={{ fontSize: 11 }}>{loc.zone}</td>
                      <td style={{ fontSize: 11 }}>{loc.district}</td>
                      <td className="mono" style={{ fontSize: 11 }}>{loc.routingNumber}</td>
                      <td style={{ fontSize: 11 }}>{loc.devices && loc.devices[0]?.name}</td>
                      <td className="mono" style={{ fontSize: 10.5 }}>{loc.devices && loc.devices[0]?.ip}</td>
                      <td>{loc.doors || 2}</td>
                      <td style={{ fontSize: 11, fontWeight: 600 }}>
                        <span style={{ color: '#16a34a' }}>{loc.attendance?.present}</span>/{loc.attendance?.total}
                      </td>
                      <td><StatusBadge status={loc.status} /></td>
                      <td>
                        <span style={{ fontSize: 11, color: '#0d9488', fontWeight: 600 }}>View →</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── EMPTY STATE ─── */}
          {filteredLocations.length === 0 && (
            <div className="bs-card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>No branches found</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                No Pubali Bank locations match your current search and filter criteria.
              </div>
            </div>
          )}

          {/* ─── PAGINATION BAR ─── */}
          {filteredLocations.length > 0 && (
            <div className="bs-pagination">
              <div>
                Showing <strong>{((currentPage - 1) * pageSize) + 1}</strong> – <strong>{Math.min(currentPage * pageSize, filteredLocations.length)}</strong> of <strong>{filteredLocations.length}</strong> locations
              </div>

              <div className="bs-pagination-pages">
                <button
                  className="bs-pagination-btn"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  title="First Page"
                >
                  «
                </button>
                <button
                  className="bs-pagination-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  title="Previous Page"
                >
                  ‹
                </button>

                {/* Page number buttons */}
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`bs-pagination-btn${currentPage === pageNum ? ' active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className="bs-pagination-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  title="Next Page"
                >
                  ›
                </button>
                <button
                  className="bs-pagination-btn"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Last Page"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
