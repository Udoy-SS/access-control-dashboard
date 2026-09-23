/**
 * EmergencyControlsPage.jsx
 * Pubali Bank PLC · Central Security Operations Center (SOC)
 * Enterprise Emergency Controls, Zone Lockdown & Fire Release Hub
 */

import React, { useState, useMemo, useEffect } from 'react';
import { globalDoorStore } from '../services/doorStore';

const DIVISIONS = ['All Divisions', 'Head Office (Motijheel)', 'Dhaka North', 'Dhaka South', 'Chittagong', 'Sylhet', 'Khulna', 'Rajshahi', 'Barisal', 'Rangpur'];
const ZONE_TYPES = ['All Zones', 'Cash Vault & Strong Room', 'Data Center & Server Room', 'SWIFT & Treasury Room', 'Main Perimeter & Turnstiles', 'Executive Floor'];

/**
 * SOC Officer PIN Registry
 * Maps PIN → Officer identity. PINs are 6-digit alphanumeric.
 * In production these would be fetched from the BioStar X auth service.
 */
const SOC_OFFICER_REGISTRY = {
  'SOC001': { name: 'Central SOC Supervisor', id: 'SOC-ID-0019', rank: 'Level 5 Authorized' },
  'SOC002': { name: 'Deputy SOC Commander', id: 'SOC-ID-0031', rank: 'Level 5 Authorized' },
  'SOC003': { name: 'Night Watch Supervisor', id: 'SOC-ID-0047', rank: 'Level 4 Authorized' },
};

/** Returns the officer object if the PIN is valid, null otherwise. */
function validateSocPin(pin) {
  return SOC_OFFICER_REGISTRY[pin.trim().toUpperCase()] || null;
}

// Initial 20 high-security emergency controlled doors
const INITIAL_EMERGENCY_ZONES = [
  { id: 'ED-01', name: 'Main Cash Vault Mantrap Outer', branch: 'Head Office Principal Branch', division: 'Head Office (Motijheel)', zone: 'Cash Vault & Strong Room', status: 'Normal Armed', reader: 'BioStation 3 (Face+Card)' },
  { id: 'ED-02', name: 'Main Cash Vault Mantrap Inner', branch: 'Head Office Principal Branch', division: 'Head Office (Motijheel)', zone: 'Cash Vault & Strong Room', status: 'Normal Armed', reader: 'BioStation 3 (Dual Bio)' },
  { id: 'ED-03', name: 'Primary Core Data Center Portal', branch: 'ICT Operation Division - 4th Fl', division: 'Head Office (Motijheel)', zone: 'Data Center & Server Room', status: 'Normal Armed', reader: 'FaceStation F2' },
  { id: 'ED-04', name: 'Disaster Recovery (DR) DC Vault', branch: 'Uttara Regional Data Node', division: 'Dhaka North', zone: 'Data Center & Server Room', status: 'Normal Armed', reader: 'BioStation 3' },
  { id: 'ED-05', name: 'SWIFT International Wire Chamber', branch: 'Treasury Division - 3rd Fl', division: 'Head Office (Motijheel)', zone: 'SWIFT & Treasury Room', status: 'Normal Armed', reader: 'FaceStation F2 (Dual Key)' },
  { id: 'ED-06', name: 'Foreign Remittance Treasury Vault', branch: 'Agrabad Corporate Branch', division: 'Chittagong', zone: 'SWIFT & Treasury Room', status: 'Normal Armed', reader: 'BioEntry W2' },
  { id: 'ED-07', name: 'Corporate Head Office Turnstiles A-D', branch: 'Motijheel Ground Floor Lobby', division: 'Head Office (Motijheel)', zone: 'Main Perimeter & Turnstiles', status: 'Normal Armed', reader: 'SpeedFace Turnstile Gate' },
  { id: 'ED-08', name: 'East Wing Emergency Fire Exit 1', branch: 'Motijheel East Tower Stairwell', division: 'Head Office (Motijheel)', zone: 'Main Perimeter & Turnstiles', status: 'Normal Armed', reader: 'MagLock Fire Relay' },
  { id: 'ED-09', name: 'West Wing Emergency Fire Exit 2', branch: 'Motijheel West Tower Stairwell', division: 'Head Office (Motijheel)', zone: 'Main Perimeter & Turnstiles', status: 'Normal Armed', reader: 'MagLock Fire Relay' },
  { id: 'ED-10', name: 'Board of Directors Suite Main Portal', branch: '18th Floor Executive Suite', division: 'Head Office (Motijheel)', zone: 'Executive Floor', status: 'Normal Armed', reader: 'FaceStation F2' },
  { id: 'ED-11', name: 'Managing Director & CEO Chamber', branch: '18th Floor Executive Suite', division: 'Head Office (Motijheel)', zone: 'Executive Floor', status: 'Normal Armed', reader: 'BioStation 3 VIP' },
  { id: 'ED-12', name: 'Regional Cash Sorting Center Vault', branch: 'Sylhet Main Branch', division: 'Sylhet', zone: 'Cash Vault & Strong Room', status: 'Normal Armed', reader: 'BioStation 3 Dual' },
  { id: 'ED-13', name: 'Port City Cash Vault & Mantrap', branch: 'Khatunganj Commercial Branch', division: 'Chittagong', zone: 'Cash Vault & Strong Room', status: 'Normal Armed', reader: 'BioEntry W2' },
  { id: 'ED-14', name: 'Industrial Hub Vault Mantrap', branch: 'Khulna Corporate Branch', division: 'Khulna', zone: 'Cash Vault & Strong Room', status: 'Normal Armed', reader: 'BioStation 3' },
  { id: 'ED-15', name: 'North Bengal Cash Sorting Center', branch: 'Rajshahi Main Branch', division: 'Rajshahi', zone: 'Cash Vault & Strong Room', status: 'Normal Armed', reader: 'BioStation 3' },
  { id: 'ED-16', name: 'Coastal Regional Vault Interlock', branch: 'Barisal Main Branch', division: 'Barisal', zone: 'Cash Vault & Strong Room', status: 'Normal Armed', reader: 'BioEntry W2' },
  { id: 'ED-17', name: 'Rangpur Division Currency Chest', branch: 'Rangpur Main Branch', division: 'Rangpur', zone: 'Cash Vault & Strong Room', status: 'Normal Armed', reader: 'BioStation 3' },
  { id: 'ED-18', name: 'Gulshan Diplomatic Branch Vault', branch: 'Gulshan Circle-2 Branch', division: 'Dhaka North', zone: 'Cash Vault & Strong Room', status: 'Normal Armed', reader: 'FaceStation F2' },
  { id: 'ED-19', name: 'Dhanmondi Commercial Branch Vault', branch: 'Dhanmondi Satmasjid Rd Branch', division: 'Dhaka South', zone: 'Cash Vault & Strong Room', status: 'Normal Armed', reader: 'BioStation 3' },
  { id: 'ED-20', name: 'NOC Surveillance Command Center', branch: 'Principal Branch - 2nd Fl', division: 'Head Office (Motijheel)', zone: 'Data Center & Server Room', status: 'Normal Armed', reader: 'BioStation 3' },
];

function EmergencyZoneDetailModal({ zone, onClose, onUpdateStatus }) {
  if (!zone) return null;
  const isLockdown = zone.status === 'Emergency Lockdown';
  const isFire = zone.status === 'Fire Release';

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
          border: `1.5px solid ${isLockdown ? '#ef4444' : isFire ? '#f97316' : '#0284c7'}`,
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: isLockdown ? '#fef2f2' : isFire ? '#fff7ed' : '#f0f9ff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '12px 12px 0 0'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Relay Switchboard & Hardware Dossier · {zone.id}
              </span>
              <span style={{
                background: isLockdown ? '#fee2e2' : isFire ? '#ffedd5' : '#dcfce7',
                color: isLockdown ? '#b91c1c' : isFire ? '#c2410c' : '#15803d',
                fontSize: 10.5,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 999
              }}>
                {zone.status}
              </span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              {zone.name}
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
          
          {/* Metadata Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Portal Category</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{zone.zone}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Location & Division</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{zone.branch}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{zone.division}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Hardware Reader</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', marginTop: 2 }}>{zone.reader}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Relay Controller</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>CoreStation CS-40</div>
              <div style={{ fontSize: 11, color: '#16a34a' }}>RS-485 Substation Loop OK</div>
            </div>
          </div>

          {/* Relay Diagnostics & Electromagnetic Force State */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Direct Relay & Electromagnetic Circuit Status
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, fontSize: 11.5 }}>
              <div>
                <span style={{ color: '#64748b' }}>Relay Power Output:</span> <strong style={{ color: '#0f172a' }}>12V DC Energized</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Holding Force:</span> <strong style={{ color: isFire ? '#ea580c' : '#16a34a' }}>{isFire ? '0 lbs (Unlatched)' : '1,200 lbs MagLock (Engaged)'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Door Contact Sensor:</span> <strong style={{ color: '#16a34a' }}>Circuit Closed / Normal</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Tamper Switch:</span> <strong style={{ color: '#16a34a' }}>Armed / No Tamper</strong>
              </div>
            </div>
          </div>

          {/* Physical Ingress & Relay Control Pathway */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px', background: '#ffffff' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Physical Ingress & Relay Pathway
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
                    Central SOC / Controller Relay Directive
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                    Sub-second signal dispatched across RS-485 encrypted channel to CoreStation controller node in {zone.branch}.
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: isLockdown ? '#dc2626' : isFire ? '#ea580c' : '#0d9488', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0
                }}>
                  2
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                    Hardware Relay Board & Interlock Evaluation
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                    {isLockdown
                      ? 'Hard lockdown engaged: All biometric readers disabled, keycard access locked, 1,200 lbs magnetic holding force clamped.'
                      : isFire
                      ? 'Fire evacuation release: MagLock power dropped to 0V for free unimpeded egress.'
                      : 'Standard BioStar 2 schedule policy active with dual-biometric credential verification.'}
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: '#16a34a', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0
                }}>
                  3
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                    Telemetry Confirmation & Central SOC Audit
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                    Current status verified as <strong>{zone.status}</strong>. Cryptographic telemetry pulse logged in Central SOC database.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Overrides */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
              Direct Hardware Override Actions
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => { onUpdateStatus(zone.id, 'Normal Armed'); }}
                style={{
                  padding: '6px 14px', borderRadius: 6, background: '#059669', color: '#fff',
                  border: 'none', fontSize: 11.5, fontWeight: 700, cursor: 'pointer'
                }}
              >
                Restore Normal Armed
              </button>
              <button
                onClick={() => { onUpdateStatus(zone.id, 'Emergency Lockdown'); }}
                style={{
                  padding: '6px 14px', borderRadius: 6, background: '#dc2626', color: '#fff',
                  border: 'none', fontSize: 11.5, fontWeight: 700, cursor: 'pointer'
                }}
              >
                Engage Lockdown
              </button>
              <button
                onClick={() => { onUpdateStatus(zone.id, 'Fire Release'); }}
                style={{
                  padding: '6px 14px', borderRadius: 6, background: '#ea580c', color: '#fff',
                  border: 'none', fontSize: 11.5, fontWeight: 700, cursor: 'pointer'
                }}
              >
                Fire Evacuation Unlock
              </button>
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
              padding: '6px 16px', borderRadius: 6, background: '#0284c7', color: '#fff',
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

export default function EmergencyControlsPage() {
  const [zones, setZones] = useState(INITIAL_EMERGENCY_ZONES);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState('All Divisions');
  const [selectedZoneType, setSelectedZoneType] = useState('All Zones');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'vault-lockdown' | 'fire-release' | 'clear-all', title: '', desc: '' }
  const [authPin, setAuthPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, time: '10:15:20 AM', action: 'Daily System Armed Check', user: 'SOC Operator (Officer 1042)', scope: 'All 829 Nationwide Branches', result: 'Verified Normal' },
    { id: 2, time: '09:00:00 AM', action: 'Morning Scheduled Disarm', user: 'BioStar Core Automated Policy', scope: 'General Office Turnstiles', result: 'Schedule Applied' },
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Sync state changes with door store
  const updateZoneStatus = (targetId, newStatus) => {
    setZones(prev => prev.map(z => z.id === targetId ? { ...z, status: newStatus } : z));
    const relay = newStatus === 'Emergency Lockdown' ? 'Locked Down' : newStatus === 'Fire Release' ? 'Unlocked' : 'Locked';
    globalDoorStore.setLiveState(targetId, { sensor: 'Closed', loop: 'Normal', relayStatus: relay });
  };

  const handleGlobalAction = (actionType) => {
    if (actionType === 'vault-lockdown') {
      setConfirmModal({
        type: 'vault-lockdown',
        title: 'ENGAGE GLOBAL CASH VAULT LOCKDOWN',
        desc: 'This will immediately force-lock all 520 Cash Vault mantraps and strong room doors nationwide in Hard Dual-Custody Mode. Card overrides will be blocked.',
        confirmLabel: 'ENGAGE LOCKDOWN',
        btnColor: '#dc2626'
      });
    } else if (actionType === 'fire-release') {
      setConfirmModal({
        type: 'fire-release',
        title: 'TRIGGER GLOBAL FIRE EVACUATION RELEASE',
        desc: 'This will immediately release magnetic locks on all emergency fire exits, stairwells, and perimeter turnstiles for unimpeded personnel evacuation.',
        confirmLabel: 'TRIGGER FIRE RELEASE',
        btnColor: '#ea580c'
      });
    } else if (actionType === 'clear-all') {
      setConfirmModal({
        type: 'clear-all',
        title: 'RESTORE ALL DOORS TO SCHEDULED BIOSTAR MODE',
        desc: 'This will clear all manual lockdown and fire release overrides and restore all 2,696 doors to standard automated BioStar 2 schedule policies.',
        confirmLabel: 'RESTORE NORMAL',
        btnColor: '#059669'
      });
    }
    setAuthPin('');
    setPinError(false);
  };

  const executeConfirmedAction = () => {
    const officer = validateSocPin(authPin);
    if (!officer) {
      setPinError(true);
      return;
    }

    const modalType = confirmModal.type;
    const nowStr = new Date().toLocaleTimeString();
    const operatorLabel = `${officer.name} (${officer.id})`;

    if (modalType === 'vault-lockdown') {
      setZones(prev => prev.map(z => z.zone === 'Cash Vault & Strong Room' ? { ...z, status: 'Emergency Lockdown' } : z));
      setAuditLogs(prev => [
        { id: Date.now(), time: nowStr, action: 'GLOBAL VAULT HARD LOCKDOWN', user: operatorLabel, scope: '520 Cash Vault Mantraps', result: 'LOCKED DOWN' },
        ...prev
      ]);
      showToast('GLOBAL VAULT LOCKDOWN ACTIVATED: All Cash Vault mantraps locked down.');
    } else if (modalType === 'fire-release') {
      setZones(prev => prev.map(z => (z.zone === 'Main Perimeter & Turnstiles' || z.name.includes('Fire Exit')) ? { ...z, status: 'Fire Release' } : z));
      setAuditLogs(prev => [
        { id: Date.now(), time: nowStr, action: 'GLOBAL FIRE EVACUATION RELEASE', user: operatorLabel, scope: 'All Fire Exits & Turnstiles', result: 'UNLOCKED / FREE EXIT' },
        ...prev
      ]);
      showToast('FIRE EVACUATION RELEASE ENGAGED: Emergency exits unlatched for safe egress.');
    } else if (modalType === 'clear-all') {
      setZones(prev => prev.map(z => ({ ...z, status: 'Normal Armed' })));
      setAuditLogs(prev => [
        { id: Date.now(), time: nowStr, action: 'CLEAR ALL EMERGENCY OVERRIDES', user: operatorLabel, scope: 'All Nationwide Access Points', result: 'RESTORED NORMAL' },
        ...prev
      ]);
      showToast('All emergency overrides cleared. System restored to standard BioStar schedule.');
    }

    setConfirmModal(null);
  };

  const filteredZones = useMemo(() => {
    return zones.filter(z => {
      const matchDiv = selectedDivision === 'All Divisions' || z.division === selectedDivision;
      const matchZone = selectedZoneType === 'All Zones' || z.zone === selectedZoneType;
      const matchQ = !searchQuery || z.name.toLowerCase().includes(searchQuery.toLowerCase()) || z.branch.toLowerCase().includes(searchQuery.toLowerCase()) || z.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDiv && matchZone && matchQ;
    });
  }, [zones, selectedDivision, selectedZoneType, searchQuery]);

  const stats = useMemo(() => {
    const total = zones.length;
    const lockedDown = zones.filter(z => z.status === 'Emergency Lockdown').length;
    const fireReleased = zones.filter(z => z.status === 'Fire Release').length;
    const normal = zones.filter(z => z.status === 'Normal Armed').length;
    return { total, lockedDown, fireReleased, normal };
  }, [zones]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Floating Toast Alert ── */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 9999,
          background: '#0f172a', color: '#fff', border: '1px solid #38bdf8',
          padding: '12px 20px', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
      )}

      {/* ── Top Header Banner (Matching TopBar & Security Operations Theme) ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid rgba(13, 148, 136, 0.3)',
        borderRadius: 10, padding: '18px 22px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.01em' }}>
              Central Emergency Controls & Zone Lockdown Switchboard
            </h2>
            <span style={{ fontSize: 10, background: '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: 4, fontWeight: 800, letterSpacing: '0.06em' }}>
              HIGH-SECURITY SOC CLEARANCE
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: '#94a3b8' }}>
            Instant hardware overrides for Cash Vaults, Data Centers, and Fire Evacuation Turnstiles across 829 Pubali Bank branches.
          </p>
        </div>

        {/* Global Action Triggers */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => handleGlobalAction('vault-lockdown')}
            style={{
              background: '#dc2626', color: '#fff', border: '1px solid #b91c1c',
              padding: '9px 15px', borderRadius: 6, fontSize: 12.5, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)', transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
            onMouseLeave={e => e.currentTarget.style.background = '#dc2626'}
          >
            Lock All Vaults
          </button>

          <button
            onClick={() => handleGlobalAction('fire-release')}
            style={{
              background: '#ea580c', color: '#fff', border: '1px solid #c2410c',
              padding: '9px 15px', borderRadius: 6, fontSize: 12.5, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.35)', transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#c2410c'}
            onMouseLeave={e => e.currentTarget.style.background = '#ea580c'}
          >
            Emergency Unlock All
          </button>

          <button
            onClick={() => handleGlobalAction('clear-all')}
            style={{
              background: '#0d9488', color: '#fff', border: '1px solid #0f766e',
              padding: '9px 15px', borderRadius: 6, fontSize: 12.5, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.35)', transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#0f766e'}
            onMouseLeave={e => e.currentTarget.style.background = '#0d9488'}
          >
            Restore Normal
          </button>
        </div>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Controlled Access Points</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginTop: 4, lineHeight: 1.1 }}>2,696 Doors</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>Across 829 Bank Branches</div>
        </div>

        <div style={{
          background: stats.lockedDown > 0 ? '#fef2f2' : '#ffffff',
          border: stats.lockedDown > 0 ? '1.5px solid #f87171' : '1px solid #e2e8f0',
          borderRadius: 8, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Emergency Locked</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626', marginTop: 4, lineHeight: 1.1 }}>{stats.lockedDown} Zones</div>
          <div style={{ fontSize: 11, color: stats.lockedDown > 0 ? '#b91c1c' : '#94a3b8', marginTop: 3, fontWeight: stats.lockedDown > 0 ? 600 : 400 }}>
            {stats.lockedDown > 0 ? 'Lockdown Active' : 'All clear'}
          </div>
        </div>

        <div style={{
          background: stats.fireReleased > 0 ? '#fff7ed' : '#ffffff',
          border: stats.fireReleased > 0 ? '1.5px solid #fb923c' : '1px solid #e2e8f0',
          borderRadius: 8, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Emergency Unlocked</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ea580c', marginTop: 4, lineHeight: 1.1 }}>{stats.fireReleased} Zones</div>
          <div style={{ fontSize: 11, color: stats.fireReleased > 0 ? '#c2410c' : '#94a3b8', marginTop: 3, fontWeight: stats.fireReleased > 0 ? 600 : 400 }}>
            {stats.fireReleased > 0 ? 'Doors Unlocked for Exit' : 'Normal latch'}
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Normal Armed Telemetry</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f766e', marginTop: 4, lineHeight: 1.1 }}>{stats.normal} / {stats.total}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>Standard Schedule Active</div>
        </div>
      </div>

      {/* ── Filters and Search ── */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px',
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <input
            type="text"
            placeholder="Search door name, branch, ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '7px 12px', borderRadius: 5,
              background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: 12.5, outline: 'none'
            }}
          />
        </div>

        <select
          value={selectedDivision}
          onChange={e => setSelectedDivision(e.target.value)}
          style={{
            padding: '7px 12px', borderRadius: 5,
            background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: 12.5, outline: 'none'
          }}
        >
          {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select
          value={selectedZoneType}
          onChange={e => setSelectedZoneType(e.target.value)}
          style={{
            padding: '7px 12px', borderRadius: 5,
            background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: 12.5, outline: 'none'
          }}
        >
          {ZONE_TYPES.map(z => <option key={z} value={z}>{z}</option>)}
        </select>

        {(selectedDivision !== 'All Divisions' || selectedZoneType !== 'All Zones' || searchQuery) && (
          <button
            onClick={() => { setSelectedDivision('All Divisions'); setSelectedZoneType('All Zones'); setSearchQuery(''); }}
            style={{
              background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '7px 12px', borderRadius: 5,
              fontSize: 12, fontWeight: 600, cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ── Main Door Switchboard Table ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
            Emergency Controlled Zones ({filteredZones.length})
          </div>
          <div style={{ fontSize: 11.5, color: '#64748b' }}>
            Suprema CoreStation RS-485 / BioStar X Direct Relay Control
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Door ID</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Access Point & Portal</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Branch / Location</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Zone Tier</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Current State</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>Emergency Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredZones.map((zone, idx) => {
                const isLockdown = zone.status === 'Emergency Lockdown';
                const isFire = zone.status === 'Fire Release';

                return (
                  <tr
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    title={`Click to view detailed relay switchboard & hardware pathway for ${zone.name}`}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: idx % 2 === 1 ? '#fafbfd' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = isLockdown ? '#fee2e2' : isFire ? '#ffedd5' : '#f0f9ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 1 ? '#fafbfd' : '#ffffff'; }}
                  >
                    <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                      {zone.id}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{zone.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Hardware: {zone.reader}</div>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#334155' }}>
                      <div style={{ fontWeight: 500 }}>{zone.branch}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{zone.division}</div>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        background: zone.zone.includes('Vault') ? '#fee2e2' : zone.zone.includes('Data Center') ? '#e0f2fe' : '#f1f5f9',
                        color: zone.zone.includes('Vault') ? '#b91c1c' : zone.zone.includes('Data Center') ? '#0369a1' : '#475569',
                        border: `1px solid ${zone.zone.includes('Vault') ? '#fca5a5' : zone.zone.includes('Data Center') ? '#bae6fd' : '#cbd5e1'}`,
                        padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600
                      }}>
                        {zone.zone}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        background: isLockdown ? '#fee2e2' : isFire ? '#ffedd5' : '#dcfce7',
                        color: isLockdown ? '#b91c1c' : isFire ? '#c2410c' : '#15803d',
                        border: `1px solid ${isLockdown ? '#fca5a5' : isFire ? '#fdba74' : '#86efac'}`,
                        padding: '3px 9px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', gap: 5
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isLockdown ? '#b91c1c' : isFire ? '#ea580c' : '#16a34a' }} />
                        {zone.status}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {isLockdown ? (
                          <button
                            onClick={() => { updateZoneStatus(zone.id, 'Normal Armed'); showToast(`Lockdown released for ${zone.id}`); }}
                            style={{
                              background: '#16a34a', color: '#fff', border: 'none', padding: '5px 11px',
                              borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            Release
                          </button>
                        ) : (
                          <button
                            onClick={() => { updateZoneStatus(zone.id, 'Emergency Lockdown'); showToast(`Lockdown engaged for ${zone.id}`); }}
                            style={{
                              background: '#dc2626', color: '#fff', border: 'none', padding: '5px 11px',
                              borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            Lockdown
                          </button>
                        )}

                        {isFire ? (
                          <button
                            onClick={() => { updateZoneStatus(zone.id, 'Normal Armed'); showToast(`Emergency release reset for ${zone.id}`); }}
                            style={{
                              background: '#0284c7', color: '#fff', border: 'none', padding: '5px 11px',
                              borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            Reset
                          </button>
                        ) : (
                          <button
                            onClick={() => { updateZoneStatus(zone.id, 'Fire Release'); showToast(`Emergency unlock activated for ${zone.id}`); }}
                            style={{
                              background: '#ea580c', color: '#fff', border: 'none', padding: '5px 11px',
                              borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            Unlock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Emergency Audit Log Ledger ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          Real-Time Emergency Action Audit Log (ICT-08 Compliance)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {auditLogs.map(log => (
            <div key={log.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '9px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 5, fontSize: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#0284c7', fontFamily: 'monospace', fontWeight: 600 }}>{log.time}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{log.action}</span>
                <span style={{ color: '#64748b' }}>· Scope: {log.scope}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#475569' }}>Operator: {log.user}</span>
                <span style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>
                  {log.result}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Confirmation Security Modal ── */}
      {confirmModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: '#ffffff', border: `2px solid ${confirmModal.btnColor}`,
            borderRadius: 10, padding: 22, maxWidth: 480, width: '100%',
            boxShadow: `0 12px 36px rgba(0,0,0,0.25)`
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              {confirmModal.title}
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
              {confirmModal.desc}
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: 12, marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                SOC Officer Authorization PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={authPin}
                onChange={e => { setAuthPin(e.target.value); setPinError(false); }}
                onKeyDown={e => e.key === 'Enter' && executeConfirmedAction()}
                placeholder="Enter SOC officer PIN"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 5,
                  background: '#ffffff', border: pinError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  color: '#0f172a', fontSize: 15, letterSpacing: '0.2em', outline: 'none'
                }}
              />
              {pinError && (
                <div style={{ color: '#dc2626', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                  Invalid or unauthorized PIN. Only registered SOC officers may authorize emergency actions.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{
                  background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
                  padding: '8px 16px', borderRadius: 5, fontSize: 12.5, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedAction}
                style={{
                  background: confirmModal.btnColor, color: '#fff', border: 'none',
                  padding: '8px 18px', borderRadius: 5, fontSize: 12.5, fontWeight: 700,
                  cursor: 'pointer', boxShadow: `0 2px 8px ${confirmModal.btnColor}44`
                }}
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Emergency Zone / Portal Relay Detail Modal ── */}
      {selectedZone && (
        <EmergencyZoneDetailModal
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
          onUpdateStatus={(id, st) => {
            updateZoneStatus(id, st);
            setSelectedZone(prev => prev ? { ...prev, status: st } : null);
            showToast(`Relay status updated for ${id}: ${st}`);
          }}
        />
      )}

    </div>
  );
}
