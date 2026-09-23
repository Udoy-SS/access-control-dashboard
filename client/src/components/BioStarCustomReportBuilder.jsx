import React, { useState, useEffect, useMemo } from 'react';
import {
  PDF_USER_RECORDS,
  PDF_DEVICE_RECORDS,
  PDF_DOOR_RECORDS,
  PDF_ACCESS_GROUPS
} from '../data/pdfData';

// ─── TENDER ENTITY DEFINITIONS ──────────────────────────────
const ENTITIES = [
  { id: 'users', label: 'User Group & Users', icon: '👤', desc: 'Custom User & Group enrollment, biometric credentials, status' },
  { id: 'devices', label: 'Device Group & Devices', icon: '📟', desc: 'Device status, firmware versions, IP addresses & network health' },
  { id: 'doors', label: 'Door Group & Doors', icon: '🚪', desc: 'Door requirements, access control vs attendance, vault dual-custody' },
  { id: 'access', label: 'Access Group Reports', icon: '🛡️', desc: 'Access levels 1-5, door allocations, schedules & active members' },
  { id: 'adhoc', label: 'Ad-hoc Group Generator', icon: '⚡', desc: 'Unified multi-entity reporting across any user, device or group' }
];

// Available columns per entity
const COLUMN_DEFS = {
  users: [
    { key: 'id', label: 'User ID', default: true },
    { key: 'name', label: 'Employee Name', default: true },
    { key: 'category', label: 'User Group', default: true },
    { key: 'department', label: 'Department', default: true },
    { key: 'branch', label: 'Assigned Branch', default: true },
    { key: 'role', label: 'Designation / Role', default: true },
    { key: 'biometrics', label: 'Biometrics Enrolled', default: true },
    { key: 'card', label: 'Card Number', default: false },
    { key: 'status', label: 'Status', default: true }
  ],
  devices: [
    { key: 'id', label: 'Device ID', default: true },
    { key: 'name', label: 'Device Name', default: true },
    { key: 'category', label: 'Device Group', default: true },
    { key: 'model', label: 'Model', default: true },
    { key: 'status', label: 'Device Status', default: true },
    { key: 'firmware', label: 'Firmware Version', default: true },
    { key: 'ip', label: 'IP Address', default: true },
    { key: 'type', label: 'Terminal Capabilities', default: false },
    { key: 'ping', label: 'Ping Latency', default: false },
    { key: 'uptime', label: 'Uptime SLA', default: true }
  ],
  doors: [
    { key: 'id', label: 'Door ID', default: true },
    { key: 'name', label: 'Door Name', default: true },
    { key: 'category', label: 'Door Group', default: true },
    { key: 'branch', label: 'Branch / Location', default: true },
    { key: 'doorRequirement', label: 'Door Requirement', default: true },
    { key: 'system', label: 'System Role', default: true },
    { key: 'relay', label: 'Relay & Hardware', default: true },
    { key: 'lockStatus', label: 'Lock State', default: true },
    { key: 'alarmStatus', label: 'Alarm Telemetry', default: true },
    { key: 'readerIn', label: 'In-Reader', default: false }
  ],
  access: [
    { key: 'id', label: 'Access Group ID', default: true },
    { key: 'name', label: 'Access Group Name', default: true },
    { key: 'category', label: 'Group Tier', default: true },
    { key: 'branch', label: 'Branch Scope', default: true },
    { key: 'accessLevel', label: 'Clearance Level', default: true },
    { key: 'doorsCount', label: 'Doors Assigned', default: true },
    { key: 'activeUsers', label: 'Active Members', default: true },
    { key: 'schedule', label: 'Time Schedule', default: true },
    { key: 'floorLevel', label: 'Floor Authorization', default: false }
  ],
  adhoc: [
    { key: 'id', label: 'Entity ID', default: true },
    { key: 'type', label: 'Entity Type', default: true },
    { key: 'name', label: 'Name / Designation', default: true },
    { key: 'group', label: 'Assigned Group', default: true },
    { key: 'location', label: 'Location Scope', default: true },
    { key: 'techDetails', label: 'Technical Spec / Firmware', default: true },
    { key: 'status', label: 'Operational Status', default: true }
  ]
};

// Available firmware versions across the network
const FIRMWARE_VERSIONS = [
  'All Versions',
  'v1.4.2',
  'v2.1.0',
  'v1.5.0',
  'v1.2.8',
  'v1.1.4',
  'v2.0.2',
  'v1.3.1',
  'v1.0.8'
];

export default function BioStarCustomReportBuilder({ initialEntity = 'users', onNavigateParent }) {
  const [selectedEntity, setSelectedEntity] = useState(initialEntity);
  const [searchQuery, setSearchQuery] = useState('');
  const [orgScope, setOrgScope] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [firmwareFilter, setFirmwareFilter] = useState('All Versions');
  const [roleSystemFilter, setRoleSystemFilter] = useState('All');

  useEffect(() => {
    if (initialEntity) {
      setSelectedEntity(initialEntity);
      setStatusFilter('All');
      setOrgScope('All');
      setFirmwareFilter('All Versions');
      setRoleSystemFilter('All');
    }
  }, [initialEntity]);

  // Selected columns state
  const [selectedCols, setSelectedCols] = useState(() => {
    const initial = {};
    Object.keys(COLUMN_DEFS).forEach(k => {
      initial[k] = COLUMN_DEFS[k].filter(c => c.default).map(c => c.key);
    });
    return initial;
  });

  const activeCols = selectedCols[selectedEntity] || [];

  const toggleColumn = (key) => {
    setSelectedCols(prev => {
      const current = prev[selectedEntity] || [];
      const updated = current.includes(key)
        ? current.filter(c => c !== key)
        : [...current, key];
      return { ...prev, [selectedEntity]: updated };
    });
  };

  const selectAllCols = () => {
    setSelectedCols(prev => ({
      ...prev,
      [selectedEntity]: COLUMN_DEFS[selectedEntity].map(c => c.key)
    }));
  };

  const resetDefaultCols = () => {
    setSelectedCols(prev => ({
      ...prev,
      [selectedEntity]: COLUMN_DEFS[selectedEntity].filter(c => c.default).map(c => c.key)
    }));
  };

  // ─── ROBUST SCOPE MATCHING HELPER ────────────────────────
  const matchesScope = (categoryStr = '', branchStr = '') => {
    if (orgScope === 'All') return true;
    const c = (categoryStr || '').toLowerCase();
    const b = (branchStr || '').toLowerCase();

    if (orgScope === 'Head Office') {
      return c.includes('head office') || b.includes('head office') || c.includes('principal') || b.includes('principal');
    }
    if (orgScope === 'Regional Office') {
      return c.includes('regional') || c === 'ro' || c.includes('ro ') || c.includes('ro user') || c.includes('ro device') || c.includes('ro door') || b.startsWith('ro-') || b.includes('regional');
    }
    if (orgScope === 'Sub-Branch') {
      return c.includes('sub-branch') || c.includes('sub branch') || b.includes('sub-br') || b.includes('sub br');
    }
    if (orgScope === 'Branch') {
      const isSub = c.includes('sub-branch') || c.includes('sub branch') || b.includes('sub-br') || b.includes('sub br');
      return !isSub && (c.includes('branch') || b.includes('branch'));
    }
    return true;
  };

  // ─── DATA GENERATION & FILTERING ─────────────────────────
  const filteredData = useMemo(() => {
    let dataset = [];

    if (selectedEntity === 'users') {
      dataset = PDF_USER_RECORDS.map(u => ({
        id: u.id,
        name: u.name,
        category: `${u.category} User Group`,
        department: u.department,
        branch: u.branch,
        biometrics: [
          u.fingerprint && 'Fingerprint (FP)',
          u.card && 'Smart Card / RFID'
        ].filter(Boolean).join(' + ') || 'Card / RFID',
        card: u.card || '—',
        status: u.status
      }));

      if (orgScope !== 'All') {
        dataset = dataset.filter(u => matchesScope(u.category, u.branch));
      }
      if (statusFilter !== 'All') {
        dataset = dataset.filter(u => u.status.toLowerCase() === statusFilter.toLowerCase());
      }
      if (roleSystemFilter !== 'All') {
        dataset = dataset.filter(u => u.role.toLowerCase().includes(roleSystemFilter.toLowerCase()));
      }

    } else if (selectedEntity === 'devices') {
      dataset = PDF_DEVICE_RECORDS.map(d => ({
        id: d.id,
        name: d.name,
        category: `${d.category} Device Group`,
        model: d.model,
        status: d.status,
        firmware: d.firmware,
        ip: d.ip,
        type: d.type,
        ping: d.ping,
        uptime: d.uptime
      }));

      if (orgScope !== 'All') {
        dataset = dataset.filter(d => matchesScope(d.category, d.branch));
      }
      if (statusFilter !== 'All') {
        dataset = dataset.filter(d => d.status.toLowerCase() === statusFilter.toLowerCase());
      }
      if (firmwareFilter !== 'All Versions') {
        dataset = dataset.filter(d => d.firmware.toLowerCase().includes(firmwareFilter.toLowerCase()));
      }

    } else if (selectedEntity === 'doors') {
      dataset = PDF_DOOR_RECORDS.map(d => ({
        id: d.id,
        name: d.name,
        category: `${d.category} Door Group`,
        branch: d.branch,
        doorRequirement: d.doorRequirement || 'Perimeter Standard',
        system: d.system,
        relay: d.relay,
        lockStatus: d.lockStatus,
        alarmStatus: d.alarmStatus,
        readerIn: d.readerIn
      }));

      if (orgScope !== 'All') {
        dataset = dataset.filter(d => matchesScope(d.category, d.branch));
      }
      if (statusFilter !== 'All') {
        if (statusFilter === 'Alarm') {
          dataset = dataset.filter(d => d.alarmStatus !== 'Normal');
        } else if (statusFilter === 'Locked') {
          dataset = dataset.filter(d => d.lockStatus.includes('Locked') || d.lockStatus.includes('Armed'));
        }
      }
      if (roleSystemFilter !== 'All') {
        dataset = dataset.filter(d => d.system.toLowerCase().includes(roleSystemFilter.toLowerCase()) || d.doorRequirement.toLowerCase().includes(roleSystemFilter.toLowerCase()));
      }

    } else if (selectedEntity === 'access') {
      dataset = PDF_ACCESS_GROUPS.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        branch: a.branch,
        accessLevel: a.accessLevel,
        doorsCount: `${a.doorsCount} Doors`,
        activeUsers: `${a.activeUsers} Enrolled`,
        schedule: a.schedule,
        floorLevel: a.floorLevel
      }));

      if (orgScope !== 'All') {
        dataset = dataset.filter(a => matchesScope(a.category, a.branch));
      }

    } else if (selectedEntity === 'adhoc') {
      // Unified adhoc cross-entity entries
      const uRows = PDF_USER_RECORDS.slice(0, 4).map(u => ({
        id: u.id,
        type: 'User',
        name: u.name,
        group: `${u.category} Group`,
        location: u.branch,
        techDetails: `Role: ${u.role}`,
        status: u.status
      }));
      const dRows = PDF_DEVICE_RECORDS.slice(0, 5).map(d => ({
        id: d.id,
        type: 'Device',
        name: d.name,
        group: `${d.category} Group`,
        location: d.branch,
        techDetails: `FW: ${d.firmware} (${d.model})`,
        status: d.status
      }));
      const drRows = PDF_DOOR_RECORDS.slice(0, 4).map(d => ({
        id: d.id,
        type: 'Door',
        name: d.name,
        group: `${d.category} Group`,
        location: d.branch,
        techDetails: `Req: ${d.doorRequirement}`,
        status: d.lockStatus
      }));
      dataset = [...uRows, ...dRows, ...drRows];

      if (orgScope !== 'All') {
        dataset = dataset.filter(r => matchesScope(r.group, r.location));
      }
      if (statusFilter !== 'All') {
        dataset = dataset.filter(r => r.status.toLowerCase().includes(statusFilter.toLowerCase()));
      }
    }

    // Generic Search Query Matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      dataset = dataset.filter(row =>
        Object.values(row).some(v => String(v).toLowerCase().includes(q))
      );
    }

    return dataset;
  }, [selectedEntity, orgScope, statusFilter, firmwareFilter, roleSystemFilter, searchQuery]);

  // Export to CSV
  const handleExportCsv = () => {
    if (!filteredData.length) return;
    const colLabels = COLUMN_DEFS[selectedEntity].filter(c => activeCols.includes(c.key)).map(c => c.label);
    const rows = filteredData.map(row => {
      return activeCols.map(colKey => `"${String(row[colKey] || '').replace(/"/g, '""')}"`).join(',');
    });
    const csvContent = [colLabels.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tender_Custom_Report_${selectedEntity.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── TOP BANNER: TENDER CLAUSE COMPLIANCE ── */}
      <div style={{
        background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 100%)',
        color: '#ffffff',
        padding: '16px 20px',
        borderRadius: 6,
        boxShadow: '0 4px 12px rgba(15, 118, 110, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            width: 44,
            height: 44,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22
          }}>
            📋
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' }}>
                Tender Custom Reporting Engine
              </span>
              <span style={{
                background: '#14b8a6',
                color: '#042f2e',
                fontSize: 10.5,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Tender Spec Compliant
              </span>
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.9, marginTop: 2 }}>
              Generation of custom User Group, Device Group (including Status & Firmware Version), Door Group, and Access Group reports.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="bs-btn"
            onClick={handleExportCsv}
            style={{
              background: '#ffffff',
              color: '#0f766e',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            Export Custom CSV
          </button>
          <button
            className="bs-btn"
            onClick={() => window.print()}
            style={{
              background: '#ffffff',
              color: '#0f766e',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style={{ color: '#0f766e' }}>
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9a1 1 0 100-2 1 1 0 000 2zm1 2v-1h6v1H7z" clipRule="evenodd"/>
            </svg>
            Print PDF Spec
          </button>
        </div>
      </div>

      {/* ── 5 ENTITY SELECTION TABS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 8,
        background: '#ffffff',
        padding: 8,
        borderRadius: 6,
        border: '1px solid #e2e8f0'
      }}>
        {ENTITIES.map(ent => {
          const isSelected = selectedEntity === ent.id;
          return (
            <button
              key={ent.id}
              onClick={() => {
                setSelectedEntity(ent.id);
                setStatusFilter('All');
                setOrgScope('All');
                setRoleSystemFilter('All');
              }}
              style={{
                background: isSelected ? '#f0fdfa' : '#ffffff',
                border: isSelected ? '2px solid #0d9488' : '1px solid #e2e8f0',
                borderRadius: 5,
                padding: '10px 12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>{ent.icon}</span>
                <span style={{
                  fontSize: 12.5,
                  fontWeight: isSelected ? 800 : 600,
                  color: isSelected ? '#0f766e' : '#1e293b'
                }}>
                  {ent.label}
                </span>
              </div>
              <span style={{ fontSize: 10.5, color: '#64748b', lineHeight: 1.25 }}>
                {ent.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── FILTER CONTROLS CARD ── */}
      <div className="bs-card">
        <div className="bs-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Custom Query & Scope Filters</span>
            <span style={{ fontSize: 11, color: '#64748b' }}>Configure parameters to generate customized records</span>
          </div>
          <button
            className="bs-btn bs-btn-sm bs-btn-outline"
            onClick={() => {
              setSearchQuery('');
              setOrgScope('All');
              setStatusFilter('All');
              setFirmwareFilter('All Versions');
              setRoleSystemFilter('All');
            }}
          >
            Reset Filters
          </button>
        </div>

        <div className="bs-card-body" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Row 1: Search & Scope Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {/* Search */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Instant Keyword Search:
              </label>
              <input
                className="bs-input"
                style={{ width: '100%', height: 32 }}
                placeholder={`Search ${selectedEntity}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Organization / Group Scope */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Organization Scope / Group Tier:
              </label>
              <select
                className="bs-select"
                style={{ width: '100%', height: 32 }}
                value={orgScope}
                onChange={e => setOrgScope(e.target.value)}
              >
                <option value="All">All Organizational Groups (Nationwide)</option>
                <option value="Head Office">Head Office (Principal Branch)</option>
                <option value="Regional Office">Regional Offices (29 ROs)</option>
                <option value="Branch">General Branches (519 Full Branches)</option>
                <option value="Sub-Branch">Sub-Branches (281 Upashakha)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Status Filter:
              </label>
              <select
                className="bs-select"
                style={{ width: '100%', height: 32 }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                {selectedEntity === 'devices' ? (
                  <>
                    <option value="All">All Device Statuses</option>
                    <option value="Active">Active / Online</option>
                    <option value="Inactive">Inactive / Offline</option>
                  </>
                ) : selectedEntity === 'doors' ? (
                  <>
                    <option value="All">All Door Lock States</option>
                    <option value="Locked">Locked / Armed (Normal)</option>
                    <option value="Alarm">Alarm Monitored (Held/Forced/Tamper)</option>
                  </>
                ) : (
                  <>
                    <option value="All">All User Statuses</option>
                    <option value="Active">Active Enrolled</option>
                    <option value="Suspended">Suspended / Inactive</option>
                  </>
                )}
              </select>
            </div>

            {/* Firmware Version Filter (Active when Device is selected) */}
            {selectedEntity === 'devices' && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#0f766e', display: 'block', marginBottom: 4 }}>
                  ★ Firmware Version Filter (Tender Spec):
                </label>
                <select
                  className="bs-select"
                  style={{ width: '100%', height: 32, borderColor: '#0d9488', fontWeight: 600 }}
                  value={firmwareFilter}
                  onChange={e => setFirmwareFilter(e.target.value)}
                >
                  {FIRMWARE_VERSIONS.map(fw => (
                    <option key={fw} value={fw}>{fw}</option>
                  ))}
                </select>
              </div>
            )}

            {/* System / Role Filter (For Doors or Users) */}
            {selectedEntity === 'doors' && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  System Role & Requirement:
                </label>
                <select
                  className="bs-select"
                  style={{ width: '100%', height: 32 }}
                  value={roleSystemFilter}
                  onChange={e => setRoleSystemFilter(e.target.value)}
                >
                  <option value="All">All Door Requirements</option>
                  <option value="Access Control">Access Control (ACS) Doors</option>
                  <option value="Attendance">Attendance Punch Checkpoints</option>
                  <option value="Vault">Vault & High-Security Dual-Custody</option>
                  <option value="Interlock">Data Center & Server Room Interlocks</option>
                </select>
              </div>
            )}

            {selectedEntity === 'users' && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  User Designation / Role:
                </label>
                <select
                  className="bs-select"
                  style={{ width: '100%', height: 32 }}
                  value={roleSystemFilter}
                  onChange={e => setRoleSystemFilter(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  <option value="Manager">Managers & Officers</option>
                  <option value="Vault">Vault Custodians</option>
                  <option value="SysAdmin">IT & Security Administrators</option>
                  <option value="Auditor">Regional Auditors</option>
                </select>
              </div>
            )}
          </div>

          {/* Row 2: Dynamic Column Selector */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
                Select Customized Columns to Include:
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={selectAllCols}
                  style={{ background: 'none', border: 'none', color: '#0d9488', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                >
                  Select All
                </button>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <button
                  type="button"
                  onClick={resetDefaultCols}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {COLUMN_DEFS[selectedEntity].map(col => {
                const isChecked = activeCols.includes(col.key);
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => toggleColumn(col.key)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 10px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: isChecked ? 700 : 500,
                      background: isChecked ? '#e0f2fe' : '#f8fafc',
                      border: isChecked ? '1px solid #0284c7' : '1px solid #cbd5e1',
                      color: isChecked ? '#0369a1' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{isChecked ? '✓' : '+'}</span>
                    {col.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── GENERATED REPORT RESULTS CARD ── */}
      <div className="bs-card">
        {/* Results Header */}
        <div className="bs-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="bs-card-header-title">
              Generated Custom Report Results
            </span>
            <span className="bs-badge bs-badge-blue" style={{ fontSize: 11 }}>
              {filteredData.length} Matching Records
            </span>
          </div>

          <div style={{ fontSize: 11, color: '#64748b' }}>
            Entity: <strong>{ENTITIES.find(e => e.id === selectedEntity)?.label}</strong> · Scope: <strong>{orgScope}</strong>
            {selectedEntity === 'devices' && firmwareFilter !== 'All Versions' && (
              <span style={{ marginLeft: 6, color: '#0f766e', fontWeight: 700 }}>
                · Firmware: {firmwareFilter}
              </span>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bs-card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="bs-table" style={{ width: '100%', minWidth: 700 }}>
              <thead>
                <tr>
                  {COLUMN_DEFS[selectedEntity]
                    .filter(col => activeCols.includes(col.key))
                    .map(col => (
                      <th key={col.key} style={{ whiteSpace: 'nowrap' }}>
                        {col.label}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={row.id || idx}>
                    {COLUMN_DEFS[selectedEntity]
                      .filter(col => activeCols.includes(col.key))
                      .map(col => {
                        const val = row[col.key];

                        // Specialized badge renderers for tender compliance
                        if (col.key === 'status') {
                          const isGood = val === 'Active' || val === 'Online' || val?.includes('Locked') || val?.includes('Armed');
                          const isAlert = val === 'Alarm' || val === 'Inactive' || val === 'Suspended' || val?.includes('Forced');
                          return (
                            <td key={col.key}>
                              <span className={`bs-badge ${isGood ? 'bs-badge-green' : (isAlert ? 'bs-badge-red' : 'bs-badge-gray')}`}>
                                <span className={`bs-dot ${isGood ? 'bs-dot-green' : (isAlert ? 'bs-dot-red' : 'bs-dot-gray')}`}></span>
                                {val}
                              </span>
                            </td>
                          );
                        }

                        if (col.key === 'firmware') {
                          return (
                            <td key={col.key}>
                              <span style={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                background: '#ecfdf5',
                                color: '#065f46',
                                padding: '2px 6px',
                                borderRadius: 4,
                                border: '1px solid #a7f3d0'
                              }}>
                                {val}
                              </span>
                            </td>
                          );
                        }

                        if (col.key === 'id') {
                          return (
                            <td key={col.key} style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>
                              {val}
                            </td>
                          );
                        }

                        if (col.key === 'doorRequirement') {
                          return (
                            <td key={col.key} style={{ fontWeight: 600, color: val?.includes('Vault') ? '#7e22ce' : '#0284c7' }}>
                              {val}
                            </td>
                          );
                        }

                        if (col.key === 'alarmStatus') {
                          return (
                            <td key={col.key}>
                              {val !== 'Normal' ? (
                                <span className="bs-badge bs-badge-red" style={{ animation: 'pulse 1.5s infinite' }}>
                                  <span className="bs-dot bs-dot-red"></span>
                                  {val}
                                </span>
                              ) : (
                                <span style={{ color: '#64748b', fontSize: 11 }}>Normal</span>
                              )}
                            </td>
                          );
                        }

                        return (
                          <td key={col.key} style={{ fontSize: 11.5 }}>
                            {val ?? '—'}
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="bs-empty" style={{ padding: '36px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>No records match your query</div>
              <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                Try selecting "All" in the filters above or clearing your search term.
              </div>
            </div>
          )}
        </div>

        {/* Results Footer Summary */}
        <div style={{
          padding: '10px 16px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: 11,
          color: '#64748b'
        }}>
          <div>
            Showing <strong>{filteredData.length}</strong> customized rows across <strong>{activeCols.length}</strong> active fields.
          </div>
          <div>
            Pubali Bank PLC · Suprema BioStar X Centralized Access Control Platform
          </div>
        </div>
      </div>
    </div>
  );
}
