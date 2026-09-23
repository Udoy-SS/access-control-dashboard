import React from 'react';
import { useBankFilters } from './FilterContext';
import './filters.css';

export default function AdvancedFilterDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    advancedFilters,
    setAdvancedFilter,
    activeId,
    activeCount,
    resetAllFilters
  } = useBankFilters();

  const getAdv = (key, fallback = '') => advancedFilters[key] !== undefined ? advancedFilters[key] : fallback;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`eb-drawer-backdrop ${isDrawerOpen ? 'open' : ''}`}
        onClick={closeDrawer}
      />

      {/* Slide-out Drawer */}
      <div className={`eb-drawer ${isDrawerOpen ? 'open' : ''}`}>
        {/* Drawer Header */}
        <div className="eb-drawer-header">
          <div className="eb-drawer-title">
            <span style={{ fontSize: 16 }}>⚙️</span>
            <span>Enterprise Forensic Filter Drawer</span>
          </div>
          <button
            type="button"
            className="eb-drawer-close"
            onClick={closeDrawer}
            title="Close Drawer"
          >
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <div className="eb-drawer-body">
          {/* Section 1: Forensic Identity & Biometric Audit */}
          <div className="eb-drawer-section">
            <div className="eb-drawer-section-title">
              <span>👤</span> Forensic Credential & Biometrics
            </div>

            <div className="eb-drawer-field">
              <label>RFID Smart Card Number (Hex / Wiegand):</label>
              <input
                type="text"
                placeholder="e.g. 0x4B2C8A9F or Wiegand 26-bit"
                value={getAdv('cardHex')}
                onChange={e => setAdvancedFilter('cardHex', e.target.value)}
              />
            </div>

            <div className="eb-drawer-field">
              <label>Biometric Match Confidence Threshold:</label>
              <select
                value={getAdv('biometricConfidence', 'All')}
                onChange={e => setAdvancedFilter('biometricConfidence', e.target.value)}
              >
                <option value="All">All Scores</option>
                <option value="95">Ultra-High Confidence (&gt;95%)</option>
                <option value="85">Strict Banking Standard (&gt;85%)</option>
                <option value="low">Sub-optimal Match Alert (&lt;75%)</option>
              </select>
            </div>
          </div>

          {/* Section 2: Dual-Custody & Vault Audit Parameters */}
          <div className="eb-drawer-section">
            <div className="eb-drawer-section-title">
              <span>🔐</span> Vault & Dual-Custody Verification
            </div>

            <div className="eb-drawer-field">
              <label>Officer 1 Staff PIN (Primary Custodian):</label>
              <input
                type="text"
                placeholder="e.g. PB-10492"
                value={getAdv('officer1Pin')}
                onChange={e => setAdvancedFilter('officer1Pin', e.target.value)}
              />
            </div>

            <div className="eb-drawer-field">
              <label>Officer 2 Staff PIN (Dual-Signatory):</label>
              <input
                type="text"
                placeholder="e.g. PB-20811"
                value={getAdv('officer2Pin')}
                onChange={e => setAdvancedFilter('officer2Pin', e.target.value)}
              />
            </div>

            <div className="eb-drawer-field" style={{ marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(getAdv('afterHoursOnly'))}
                  onChange={e => setAdvancedFilter('afterHoursOnly', e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <span style={{ color: '#f87171', fontWeight: 600 }}>Strict After-Hours Only (&gt;05:00 PM / Holidays)</span>
              </label>
            </div>

            <div className="eb-drawer-field" style={{ marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(getAdv('cctvVerified'))}
                  onChange={e => setAdvancedFilter('cctvVerified', e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>CCTV Video Keyframe Attached Only</span>
              </label>
            </div>
          </div>

          {/* Section 3: Network & Controller Subnet Diagnostics */}
          <div className="eb-drawer-section">
            <div className="eb-drawer-section-title">
              <span>🌐</span> Controller Subnet & Hardware Routing
            </div>

            <div className="eb-drawer-field">
              <label>CoreStation Subnet IP Range:</label>
              <input
                type="text"
                placeholder="e.g. 10.240.10.0/24 (MPLS Network)"
                value={getAdv('subnetIp')}
                onChange={e => setAdvancedFilter('subnetIp', e.target.value)}
              />
            </div>

            <div className="eb-drawer-field">
              <label>RS-485 Communication Channel:</label>
              <select
                value={getAdv('rs485Channel', 'All')}
                onChange={e => setAdvancedFilter('rs485Channel', e.target.value)}
              >
                <option value="All">All Channels (CH 0 - 4)</option>
                <option value="CH0">Channel 0 (Primary Ingress Reader)</option>
                <option value="CH1">Channel 1 (Auxiliary Egress Reader)</option>
                <option value="CH2">Channel 2 (Mantrap Interlock Bus)</option>
              </select>
            </div>
          </div>

          {/* Section 4: Bangladesh Bank ICT-08 Regulatory Tag */}
          <div className="eb-drawer-section">
            <div className="eb-drawer-section-title">
              <span>📋</span> Bangladesh Bank ICT-08 Compliance Tag
            </div>

            <div className="eb-drawer-field">
              <label>Mandatory Compliance Clause:</label>
              <select
                value={getAdv('bbClause', 'All')}
                onChange={e => setAdvancedFilter('bbClause', e.target.value)}
              >
                <option value="All">All Clauses</option>
                <option value="Sec4.1">Section 4.1: Physical Access Security</option>
                <option value="Sec4.2">Section 4.2: Dual-Custody Vault Verification</option>
                <option value="Sec4.3">Section 4.3: 1-Year Tamper-Proof Audit Trail</option>
              </select>
            </div>

            <div className="eb-drawer-field" style={{ marginTop: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(getAdv('complianceGapsOnly'))}
                  onChange={e => setAdvancedFilter('complianceGapsOnly', e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>Filter Non-Compliant Gaps Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="eb-drawer-footer">
          <button
            type="button"
            className="eb-btn-reset"
            onClick={resetAllFilters}
          >
            <span>↺</span> Reset Defaults
          </button>

          <button
            type="button"
            className="eb-btn-apply"
            onClick={closeDrawer}
          >
            Apply Filters ({activeCount})
          </button>
        </div>
      </div>
    </>
  );
}
