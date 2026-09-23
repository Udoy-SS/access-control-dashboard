import React, { useState, useMemo } from 'react';
import { useBankFilters, DATE_PRESETS } from './FilterContext';
import { ZONES } from '../../data/pubaliBankData';
import './filters.css';

// Popular branches for quick dropdown selection
const QUICK_BRANCHES = [
  'All Branches',
  'Principal Branch (Dhaka)',
  'Motijheel Corporate Branch',
  'Gulshan Corporate Branch',
  'Agrabad Branch (Chattogram)',
  'Sylhet Main Branch',
  'Rajshahi Branch',
  'Khulna Main Branch',
  'Barishal Branch',
  'Rangpur Branch',
  'Mymensingh Branch',
  'Uttara Model Town Branch',
  'Dhanmondi Branch',
  'Khatunganj AD Branch',
  'Cox\'s Bazar Branch',
  'Bogura Branch'
];

export default function GlobalFilterBar() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const {
    region,
    setRegion,
    branch,
    setBranch,
    datePreset,
    setDatePreset,
    searchQuery,
    setSearchQuery,
    activeCount,
    toggleDrawer,
    resetAllFilters,
    removeFilter,
    divisions,
    moduleFilters,
    advancedFilters
  } = useBankFilters();

  // Filter branches based on region if selected
  const availableBranches = useMemo(() => {
    if (region === 'All Regions') return QUICK_BRANCHES;
    return [
      'All Branches',
      ...QUICK_BRANCHES.filter(b => b.toLowerCase().includes(region.toLowerCase()) || b === 'All Branches')
    ];
  }, [region]);

  return (
    <div className="eb-filter-bar">
      {/* ─── DESKTOP / TABLET BAR ─── */}
      <div className="eb-filter-desktop-bar">
        <div className="eb-filter-row-primary">
          {/* Left: Organization Hierarchy Scope */}
          <div className="eb-filter-group">
            {/* Region Dropdown */}
            <div className="eb-filter-control" title="Filter by Pubali Bank Administrative Division">
              <span style={{ fontSize: 13, color: '#38bdf8' }}>🌐</span>
              <span className="eb-filter-label">Region:</span>
              <select
                className="eb-filter-select"
                value={region}
                onChange={e => setRegion(e.target.value)}
              >
                {divisions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Branch Dropdown */}
            <div className="eb-filter-control" title="Filter by Pubali Bank Branch (829 Locations)">
              <span style={{ fontSize: 13, color: '#2dd4bf' }}>🏛️</span>
              <span className="eb-filter-label">Branch:</span>
              <select
                className="eb-filter-select"
                value={branch}
                onChange={e => setBranch(e.target.value)}
              >
                {availableBranches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Center: Date Presets */}
          <div className="eb-filter-group">
            <div className="eb-date-presets" title="Select audit / access timeframe">
              {DATE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  className={`eb-date-pill ${datePreset === preset.id ? 'active' : ''}`}
                  onClick={() => setDatePreset(preset.id)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Quick Search + Actions */}
          <div className="eb-filter-group">
            {/* Search Box */}
            <div className="eb-filter-search">
              <span style={{ fontSize: 12, color: '#94a3b8' }}>🔍</span>
              <input
                type="text"
                placeholder="Quick search Staff, Door, ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, fontSize: 13 }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Advanced Drawer Button */}
            <button
              type="button"
              className="eb-btn-advanced"
              onClick={toggleDrawer}
              title="Open forensic advanced filter drawer"
            >
              <span style={{ fontSize: 13 }}>⚙️</span>
              <span>Advanced Filters</span>
              {activeCount > 0 && (
                <span style={{
                  background: '#0ea5e9',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 10,
                  marginLeft: 2
                }}>
                  {activeCount}
                </span>
              )}
            </button>

            {/* Reset Button */}
            {activeCount > 0 && (
              <button
                type="button"
                className="eb-btn-reset"
                onClick={resetAllFilters}
                title="Reset all filters to enterprise defaults"
              >
                <span style={{ fontSize: 12 }}>↺</span>
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── MOBILE FILTER BUTTON BAR (<= 768px) ─── */}
      <div className="eb-filter-mobile-bar">
        <button
          type="button"
          className="eb-filter-mobile-btn"
          onClick={() => setIsMobileFilterOpen(true)}
          title="Open Global Scope & Filters Drawer"
        >
          <span style={{ fontSize: 14 }}>⚡</span>
          <span>Filter Options</span>
          {activeCount > 0 && (
            <span className="eb-mobile-badge">{activeCount} active</span>
          )}
        </button>

        {activeCount > 0 && (
          <button
            type="button"
            className="eb-btn-reset"
            onClick={resetAllFilters}
            title="Reset all filters"
          >
            ↺ Reset
          </button>
        )}
      </div>

      {/* ─── MOBILE FILTER DRAWER (<= 768px) ─── */}
      {isMobileFilterOpen && (
        <>
          <div
            className="eb-mobile-drawer-backdrop"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-label="Close Filter Drawer"
          />
          <div className="eb-mobile-filter-drawer" role="dialog" aria-modal="true">
            <div className="eb-mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚡</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>
                  Global Scope & Filters
                </span>
                {activeCount > 0 && (
                  <span className="eb-mobile-badge">{activeCount} active</span>
                )}
              </div>
              <button
                type="button"
                className="eb-mobile-drawer-close"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="eb-mobile-drawer-body">
              {/* 1. Region */}
              <div className="eb-mobile-filter-field">
                <label className="eb-mobile-field-label">🌐 Region / Division</label>
                <select
                  className="eb-mobile-select"
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                >
                  {divisions.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* 2. Branch */}
              <div className="eb-mobile-filter-field">
                <label className="eb-mobile-field-label">🏛️ Branch Location (829 Branches)</label>
                <select
                  className="eb-mobile-select"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                >
                  {availableBranches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* 3. Date Range */}
              <div className="eb-mobile-filter-field">
                <label className="eb-mobile-field-label">📅 Date Range</label>
                <div className="eb-date-presets-mobile">
                  {DATE_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`eb-date-pill ${datePreset === preset.id ? 'active' : ''}`}
                      onClick={() => setDatePreset(preset.id)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Search */}
              <div className="eb-mobile-filter-field">
                <label className="eb-mobile-field-label">🔍 Search Staff, Door, ID, Branch</label>
                <div className="eb-filter-search" style={{ width: '100%' }}>
                  <input
                    type="text"
                    placeholder="Quick search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, fontSize: 13 }}
                    >✕</button>
                  )}
                </div>
              </div>

              {/* 5. Advanced Forensic Filters */}
              <div className="eb-mobile-filter-field" style={{ paddingTop: 10, borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                <button
                  type="button"
                  className="eb-btn-advanced"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                  onClick={() => {
                    setIsMobileFilterOpen(false);
                    toggleDrawer();
                  }}
                >
                  <span>⚙️ Open Advanced Forensic Filters</span>
                </button>
              </div>
            </div>

            <div className="eb-mobile-drawer-footer">
              <button
                type="button"
                className="eb-btn-reset"
                onClick={resetAllFilters}
                style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
              >
                ↺ Reset All
              </button>
              <button
                type="button"
                className="eb-btn-apply"
                onClick={() => setIsMobileFilterOpen(false)}
                style={{ flex: 1.5, padding: '10px', justifyContent: 'center', textAlign: 'center' }}
              >
                ✓ Apply & Close
              </button>
            </div>
          </div>
        </>
      )}


      {/* Secondary Row: Active Filter Chips */}
      {activeCount > 0 && (
        <div className="eb-filter-chips-row">
          <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Filter Scope:
          </span>

          {region !== 'All Regions' && (
            <div className="eb-filter-chip">
              <span>Region: {region}</span>
              <button type="button" className="eb-filter-chip-remove" onClick={() => removeFilter('global', 'region')}>✕</button>
            </div>
          )}

          {branch !== 'All Branches' && (
            <div className="eb-filter-chip">
              <span>Branch: {branch}</span>
              <button type="button" className="eb-filter-chip-remove" onClick={() => removeFilter('global', 'branch')}>✕</button>
            </div>
          )}

          {datePreset !== 'today' && (
            <div className="eb-filter-chip">
              <span>Time: {DATE_PRESETS.find(p => p.id === datePreset)?.label}</span>
              <button type="button" className="eb-filter-chip-remove" onClick={() => removeFilter('global', 'date')}>✕</button>
            </div>
          )}

          {searchQuery.trim() && (
            <div className="eb-filter-chip">
              <span>Query: "{searchQuery}"</span>
              <button type="button" className="eb-filter-chip-remove" onClick={() => removeFilter('global', 'search')}>✕</button>
            </div>
          )}

          {Object.entries(moduleFilters).map(([k, v]) => {
            if (!v || v === 'All' || v === 'all') return null;
            return (
              <div key={k} className="eb-filter-chip">
                <span>{k}: {String(v)}</span>
                <button type="button" className="eb-filter-chip-remove" onClick={() => removeFilter('module', k)}>✕</button>
              </div>
            );
          })}

          {Object.entries(advancedFilters).map(([k, v]) => {
            if (!v || v === 'All' || v === '' || v === false) return null;
            return (
              <div key={k} className="eb-filter-chip" style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}>
                <span>{k}: {String(v)}</span>
                <button type="button" className="eb-filter-chip-remove" onClick={() => removeFilter('advanced', k)}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
