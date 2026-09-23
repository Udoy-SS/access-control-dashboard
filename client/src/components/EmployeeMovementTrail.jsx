/**
 * EmployeeMovementTrail.jsx — Employee Door-by-Door Breadcrumb Trail
 * Pubali Bank PLC · BioStar X Movement Analytics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MOVEMENT_EMPLOYEES_DATA } from '../data/securityIntelligenceData';

const DIR_COLOR = { IN: '#0d9488', OUT: '#dc2626' };
const DIR_BG    = { IN: '#e6f7f6', OUT: '#fee2e2' };

function TrailNode({ step, isLast }) {
  const isRestricted = step.restricted;
  const isDenied     = step.result === 'Denied';
  const nodeColor    = isDenied ? '#dc2626' : (isRestricted ? '#7c3aed' : DIR_COLOR[step.direction]);
  const nodeBg       = isDenied ? '#fee2e2' : (isRestricted ? '#ede9fe' : DIR_BG[step.direction]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
      {/* Connector line column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: nodeBg, border: `2.5px solid ${nodeColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: nodeColor, boxShadow: `0 2px 8px ${nodeColor}33`
        }}>
          {isDenied ? '✕' : (step.direction === 'IN' ? '→' : '←')}
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 28, background: `linear-gradient(${nodeColor}88, #e5e7eb)`, marginTop: 2 }} />}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, marginLeft: 12, paddingBottom: isLast ? 0 : 20,
        background: '#fff', border: `1px solid ${isRestricted ? '#7c3aed33' : '#e2e8f0'}`,
        borderRadius: 8, padding: '10px 14px', marginBottom: isLast ? 0 : 4,
        boxShadow: isRestricted ? '0 2px 8px rgba(124,58,237,0.08)' : '0 1px 4px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6 }}>
          <div>
            <div style={{ fontWeight: 700, color: '#1f2937', fontSize: 14 }}>
              {isRestricted ? '🔐' : (step.direction === 'IN' ? '🚪' : '🚶')} {step.zone}
              {isRestricted && <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: 10, padding: '1px 7px', borderRadius: 8, marginLeft: 6, fontWeight: 700 }}>RESTRICTED</span>}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{step.reader} · {step.authMode}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <span style={{ background: DIR_BG[step.direction], color: DIR_COLOR[step.direction], padding: '2px 9px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{step.direction}</span>
            {isDenied && <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 9px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>DENIED</span>}
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{step.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeMovementTrail({ hideHeader = false }) {
  const [employees, setEmployees]   = useState(MOVEMENT_EMPLOYEES_DATA);
  const [selected, setSelected]     = useState(MOVEMENT_EMPLOYEES_DATA[0] || null);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(false);
  const [loadingTrail, setLoadingTrail] = useState(false);

  const fetchEmployees = useCallback(async (q) => {
    try {
      const p = new URLSearchParams();
      if (q) p.set('q', q);
      const res = await fetch(`/api/movement-trail?${p}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setEmployees(json.data);
          if (!selected && json.data.length > 0) setSelected(json.data[0]);
          setLoading(false);
          return;
        }
      }
    } catch (_) {}
    
    // Resilient fallback
    let fallback = MOVEMENT_EMPLOYEES_DATA;
    if (q) {
      const ql = q.toLowerCase();
      fallback = fallback.filter(e => e.name.toLowerCase().includes(ql) || e.id.toLowerCase().includes(ql));
    }
    setEmployees(fallback);
    if (!selected && fallback.length > 0) setSelected(fallback[0]);
    setLoading(false);
  }, [selected]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleSearch = (q) => {
    setSearch(q);
    setLoading(true);
    fetchEmployees(q);
  };

  const selectEmployee = async (emp) => {
    setLoadingTrail(true);
    try {
      const res = await fetch(`/api/movement-trail/${emp.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSelected(json.data);
          setLoadingTrail(false);
          return;
        }
      }
    } catch (_) {}
    setSelected(emp);
    setLoadingTrail(false);
  };

  const [trailFilter, setTrailFilter] = useState('all'); // 'all' | 'denied' | 'restricted'

  const totalDuration = selected
    ? Math.max(...selected.trail.map(t => t.minsAgo)) - Math.min(...selected.trail.map(t => t.minsAgo))
    : 0;

  const formatDur = (m) => { if (m < 60) return `${m}m`; return `${Math.floor(m/60)}h ${m%60}m`; };

  const displayedTrail = (selected?.trail || []).filter(t => {
    if (trailFilter === 'denied') return t.result === 'Denied';
    if (trailFilter === 'restricted') return Boolean(t.restricted);
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Banner */}
      {!hideHeader && (
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)', borderRadius: 10, padding: '16px 22px', color: '#fff', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 16px rgba(2,132,199,0.25)' }}>
          <div style={{ fontSize: 28 }}>🧭</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Employee Biometric Access & Movement Trail (Door-to-Door Audit)</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Pubali Bank PLC · Sequential Door-by-Door Access History for Internal Audit & Security Investigation · BioStar X</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, minHeight: 500 }}>
        {/* Left Panel — Employee List */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: '12px 14px' }}>
            <input id="movement-search" value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Search employee name or ID…"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 5, border: '1px solid #d1d5db', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', flex: 1 }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {loading ? 'Loading…' : `${employees.length} Employees`}
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 460 }}>
              {employees.map(emp => (
                <div key={emp.id} id={`movement-emp-${emp.id}`} onClick={() => selectEmployee(emp)} style={{
                  padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                  background: selected?.id === emp.id ? '#e6f7f6' : '#fff',
                  borderLeft: selected?.id === emp.id ? '3px solid #0d9488' : '3px solid transparent',
                  transition: 'all 0.15s'
                }}>
                  <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 13 }}>{emp.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{emp.id}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{emp.department}</div>
                  <div style={{ fontSize: 11, color: '#0d9488', fontWeight: 600, marginTop: 3 }}>{emp.trail?.length || 0} checkpoints</div>
                </div>
              ))}
              {!loading && employees.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No employees found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel — Trail */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!selected && (
            <div style={{ flex: 1, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#9ca3af' }}>
              <div style={{ fontSize: 40 }}>🧭</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Select an employee to view their movement trail</div>
              <div style={{ fontSize: 12 }}>Door-by-door biometric breadcrumb history will appear here</div>
            </div>
          )}

          {selected && !loadingTrail && (
            <>
              {/* Employee Summary Card */}
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: '14px 18px', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                  {selected.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#1f2937', fontSize: 15 }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{selected.role} · {selected.department} · {selected.branch}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{selected.id}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setTrailFilter('all')}
                    style={{
                      textAlign: 'center', cursor: 'pointer', padding: '6px 12px', borderRadius: 8,
                      background: trailFilter === 'all' ? '#e6f7f6' : '#f8fafc',
                      border: trailFilter === 'all' ? '2px solid #0d9488' : '1px solid #e2e8f0',
                      transition: 'all 0.15s ease', userSelect: 'none'
                    }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#0d9488', lineHeight: 1 }}>{selected.trail?.length || 0}</div>
                    <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, marginTop: 3 }}>All Checkpoints</div>
                  </div>
                  <div style={{
                    textAlign: 'center', padding: '6px 12px', borderRadius: 8,
                    background: '#f8fafc', border: '1px solid #e2e8f0', userSelect: 'none'
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#d97706', lineHeight: 1 }}>{formatDur(totalDuration)}</div>
                    <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, marginTop: 3 }}>Duration</div>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setTrailFilter(f => f === 'denied' ? 'all' : 'denied')}
                    style={{
                      textAlign: 'center', cursor: 'pointer', padding: '6px 12px', borderRadius: 8,
                      background: trailFilter === 'denied' ? '#fee2e2' : '#f8fafc',
                      border: trailFilter === 'denied' ? '2px solid #dc2626' : '1px solid #e2e8f0',
                      transition: 'all 0.15s ease', userSelect: 'none'
                    }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>{(selected.trail || []).filter(t => t.result === 'Denied').length}</div>
                    <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, marginTop: 3 }}>Denied</div>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setTrailFilter(f => f === 'restricted' ? 'all' : 'restricted')}
                    style={{
                      textAlign: 'center', cursor: 'pointer', padding: '6px 12px', borderRadius: 8,
                      background: trailFilter === 'restricted' ? '#ede9fe' : '#f8fafc',
                      border: trailFilter === 'restricted' ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                      transition: 'all 0.15s ease', userSelect: 'none'
                    }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#7c3aed', lineHeight: 1 }}>{(selected.trail || []).filter(t => t.restricted).length}</div>
                    <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, marginTop: 3 }}>Restricted</div>
                  </div>
                </div>
              </div>

              {/* Trail */}
              <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: '16px 20px', flex: 1, overflowY: 'auto', maxHeight: 440 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Movement Breadcrumb Trail — Today
                  </div>
                  {trailFilter !== 'all' && (
                    <span style={{ fontSize: 11, color: '#4f46e5', fontWeight: 700, background: '#eef2ff', padding: '2px 8px', borderRadius: 4 }}>
                      Filtered: {trailFilter.toUpperCase()} ({displayedTrail.length})
                    </span>
                  )}
                </div>
                {displayedTrail.length === 0 ? (
                  <div style={{ padding: '30px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No {trailFilter} checkpoints recorded for this employee today.
                  </div>
                ) : (
                  displayedTrail.map((step, idx) => (
                    <TrailNode key={idx} step={step} isLast={idx === (displayedTrail.length - 1)} />
                  ))
                )}
              </div>
            </>
          )}

          {loadingTrail && (
            <div style={{ flex: 1, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>
              ⟳ Loading movement trail…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
