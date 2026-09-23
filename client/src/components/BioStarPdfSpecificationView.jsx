import React, { useState, useEffect, useMemo } from 'react';
import BioStarCustomReportBuilder from './BioStarCustomReportBuilder';
import { globalDoorStore } from '../services/doorStore';
import { useBankFilters } from './filters/FilterContext';
import { FULL_PUBALI_LOCATIONS } from '../data/pubaliFullBranches';
import {
  PDF_CHART_DATA,
  PDF_USAGE_METRICS,
  PDF_USER_RECORDS,
  PDF_ACCESS_GROUPS,
  PDF_DOOR_RECORDS,
  PDF_DEVICE_RECORDS
} from '../data/pdfData';

// ─── SVG ICONS ─────────────────────────────────────────────
const SVG_ICONS = {
  // Usage Bar Icons
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  fingerprint: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <path d="M12 10a2 2 0 100 4"/><path d="M12 6a6 6 0 016 6c0 2-1 4-1 4"/><path d="M6 12a6 6 0 016-6"/><path d="M6 12c0 3 1 5 2 7"/><path d="M16 16c-1 2-2 3-3 4"/>
    </svg>
  ),
  card: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  device: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" strokeWidth="3"/>
    </svg>
  ),
  door: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <path d="M14 2H3v20h18V9z"/><path d="M14 2v7h7"/><circle cx="16" cy="13" r="1.5" fill="currentColor"/>
    </svg>
  ),
  zone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
    </svg>
  ),
  'access-group': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),

  // Big Module Ring Icons (PDF Mockups)
  reportClipboard: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="46" height="46">
      <rect x="10" y="8" width="28" height="34" rx="3" />
      <path d="M18 8V6a2 2 0 012-2h8a2 2 0 012 2v2" />
      <line x1="16" y1="18" x2="32" y2="18" />
      <line x1="16" y1="24" x2="32" y2="24" />
      <line x1="16" y1="30" x2="24" y2="30" />
    </svg>
  ),
  userReport: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="46" height="46">
      <rect x="10" y="6" width="28" height="36" rx="4" />
      <circle cx="24" cy="18" r="5" />
      <path d="M16 32c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      <line x1="16" y1="38" x2="32" y2="38" />
    </svg>
  ),
  accessReport: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="46" height="46">
      <circle cx="18" cy="24" r="10" />
      <circle cx="18" cy="24" r="4" />
      <line x1="28" y1="24" x2="42" y2="24" />
      <line x1="36" y1="24" x2="36" y2="30" />
      <line x1="42" y1="24" x2="42" y2="30" />
    </svg>
  ),
  deviceReport: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="46" height="46">
      <rect x="8" y="10" width="18" height="30" rx="3" />
      <circle cx="17" cy="34" r="2" />
      <path d="M12 18h10" />
      <path d="M30 16c4 2 8 7 8 13v9" />
      <path d="M34 22c2 1 4 4 4 7v9" />
      <path d="M42 28v10" />
    </svg>
  ),
  doorReport: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="46" height="46">
      <rect x="8" y="8" width="32" height="34" rx="2" />
      <line x1="24" y1="8" x2="24" y2="42" />
      <circle cx="18" cy="26" r="2" />
      <circle cx="30" cy="26" r="2" />
      <rect x="12" y="2" width="24" height="6" rx="1" fill="#d90429" />
    </svg>
  ),
  customReport: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="46" height="46">
      <path d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20L28 8z" />
      <path d="M28 8v12h12" />
      <path d="M16 26h10" />
      <path d="M16 32h16" />
      <circle cx="34" cy="34" r="7" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
      <path d="M32 34l2 2 4-4" stroke="#ffffff" strokeWidth="2" />
    </svg>
  ),

  // Sub-Category Icons
  group: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" width="44" height="44">
      <circle cx="16" cy="18" r="5" />
      <circle cx="32" cy="18" r="5" />
      <circle cx="24" cy="30" r="5" />
    </svg>
  ),
  branch: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" width="44" height="44">
      <rect x="10" y="12" width="28" height="26" rx="2" />
      <rect x="16" y="18" width="6" height="6" />
      <rect x="26" y="18" width="6" height="6" />
      <line x1="20" y1="38" x2="20" y2="28" />
      <line x1="28" y1="38" x2="28" y2="28" />
    </svg>
  ),
  subBranch: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" width="44" height="44">
      <rect x="8" y="18" width="14" height="20" />
      <rect x="26" y="14" width="14" height="24" />
      <line x1="6" y1="40" x2="42" y2="40" />
    </svg>
  ),
  ro: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" width="44" height="44">
      <circle cx="24" cy="24" r="16" />
      <path d="M12 24h24" />
      <path d="M24 8a20 20 0 010 32" />
    </svg>
  ),
  ho: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" width="44" height="44">
      <path d="M14 40V12l10-6 10 6v28" />
      <line x1="8" y1="40" x2="40" y2="40" />
      <circle cx="24" cy="20" r="2" fill="#d90429" />
    </svg>
  ),
  deviceStatus: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" width="44" height="44">
      <line x1="14" y1="16" x2="34" y2="16" />
      <line x1="14" y1="24" x2="28" y2="24" />
      <line x1="14" y1="32" x2="34" y2="32" />
      <circle cx="10" cy="16" r="2" fill="#d90429" />
      <circle cx="10" cy="24" r="2" fill="#d90429" />
      <circle cx="10" cy="32" r="2" fill="#d90429" />
    </svg>
  ),
  activeDevice: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#0284c7" strokeWidth="2.5" width="44" height="44">
      <circle cx="24" cy="24" r="16" />
      <path d="M16 24l6 6 12-12" />
    </svg>
  ),
  inactiveDevice: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" width="44" height="44">
      <circle cx="24" cy="24" r="16" />
      <line x1="14" y1="14" x2="34" y2="34" />
    </svg>
  ),

  // Door Requirements Sub-Category Circular Icons
  allDoors: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" width="44" height="44">
      <rect x="8" y="8" width="32" height="34" rx="3" />
      <line x1="24" y1="8" x2="24" y2="42" />
      <circle cx="18" cy="25" r="2.5" fill="#d90429" />
      <circle cx="30" cy="25" r="2.5" fill="#d90429" />
      <line x1="6" y1="42" x2="42" y2="42" />
    </svg>
  ),
  doorAttendance: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" width="44" height="44">
      <rect x="8" y="10" width="18" height="30" rx="2" />
      <circle cx="21" cy="25" r="1.5" fill="#d90429" />
      <circle cx="34" cy="27" r="9" />
      <polyline points="34 22 34 27 38 29" />
    </svg>
  ),
  doorAcs: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" width="44" height="44">
      <rect x="8" y="10" width="18" height="30" rx="2" />
      <path d="M34 14l9 4.5v7c0 6-5 10.5-9 12-4-1.5-9-6-9-12v-7l9-4.5z" />
      <circle cx="34" cy="25" r="2" fill="#d90429" />
    </svg>
  ),
  doorVault: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" width="44" height="44">
      <rect x="8" y="8" width="32" height="32" rx="4" />
      <circle cx="24" cy="24" r="9" />
      <circle cx="24" cy="24" r="3" fill="#d90429" />
      <line x1="24" y1="10" x2="24" y2="15" />
      <line x1="24" y1="33" x2="24" y2="38" />
      <line x1="10" y1="24" x2="15" y2="24" />
      <line x1="33" y1="24" x2="38" y2="24" />
    </svg>
  ),
  doorAlarm: (
    <svg viewBox="0 0 48 48" fill="none" stroke="#d90429" strokeWidth="2.5" width="44" height="44">
      <rect x="8" y="10" width="18" height="30" rx="2" />
      <path d="M34 16v9" />
      <circle cx="34" cy="30" r="1.5" fill="#d90429" />
      <path d="M28 17a8 8 0 0112 0" />
      <path d="M26 13a12 12 0 0116 0" />
    </svg>
  )
};

// ─── ENTERPRISE AUTHENTICATION & SECURITY LINE CHART ────────
function EnterpriseAuthSecurityChart({ period = 'today', chartData }) {
  const chart = chartData || PDF_CHART_DATA[period] || PDF_CHART_DATA.today;
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const W = 760, H = 340;
  const padL = 52, padR = 46, padT = 26, padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const points = chart.curvePoints || [];
  const maxAuth = chart.scaleAuth || 8500;
  const maxIncident = chart.scaleIncident || 70;

  const xCoord = (idx) => padL + (idx / Math.max(points.length - 1, 1)) * plotW;
  const yCoordAuth = (val) => padT + plotH - ((val || 0) / maxAuth) * plotH;
  const yCoordIncident = (val) => padT + plotH - ((val || 0) / maxIncident) * plotH;

  // Build curved bezier spline path
  const makePath = (key, isIncident = false) => {
    if (!points.length) return '';
    const getY = (pt) => isIncident ? yCoordIncident(pt[key] || 0) : yCoordAuth(pt[key] || 0);
    let d = `M ${xCoord(0).toFixed(1)} ${getY(points[0]).toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const x0 = xCoord(i);
      const y0 = getY(points[i]);
      const x1 = xCoord(i + 1);
      const y1 = getY(points[i + 1]);
      const mx = (x0 + x1) / 2;
      d += ` C ${mx.toFixed(1)} ${y0.toFixed(1)}, ${mx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    return d;
  };

  const ySteps = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: '100%', display: 'block' }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id="authAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="authLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <filter id="authDropShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Horizontal gridlines & dual Y-Axis labels */}
        {ySteps.map((ratio, i) => {
          const y = padT + plotH - ratio * plotH;
          const authVal = Math.round(ratio * maxAuth);
          const incVal = Math.round(ratio * maxIncident);
          return (
            <g key={i}>
              <line
                x1={padL}
                y1={y.toFixed(1)}
                x2={padL + plotW}
                y2={y.toFixed(1)}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1.2"
                strokeDasharray={ratio === 0 ? '0' : '3,3'}
              />
              {/* Left Y Axis: Successful Auth Volume */}
              <text
                x={padL - 8}
                y={y + 3.5}
                textAnchor="end"
                fontSize="9.5"
                fill="#7dd3fc"
                fontWeight="500"
              >
                {authVal >= 1000 ? `${(authVal / 1000).toFixed(0)}k` : authVal}
              </text>
              {/* Right Y Axis: Security Incidents & Exceptions */}
              <text
                x={padL + plotW + 8}
                y={y + 3.5}
                textAnchor="start"
                fontSize="9"
                fill="#cbd5e1"
                fontWeight="500"
              >
                {incVal}
              </text>
            </g>
          );
        })}

        {/* Axis titles */}
        <text x={padL - 8} y={padT - 6} textAnchor="end" fontSize="8.5" fill="#38bdf8" fontWeight="700">Auth Vol</text>
        <text x={padL + plotW + 8} y={padT - 6} textAnchor="start" fontSize="8.5" fill="#fbbf24" fontWeight="700">Incidents</text>

        {/* X Axis Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={xCoord(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize="10"
            fontWeight={hoveredIdx === i ? "700" : "500"}
            fill={hoveredIdx === i ? "#38bdf8" : "#94a3b8"}
          >
            {p.label || p.day}
          </text>
        ))}

        {/* Shaded Area under Successful Authentication */}
        {points.length > 0 && (
          <path
            d={`${makePath('success', false)} L ${xCoord(points.length - 1)} ${padT + plotH} L ${xCoord(0)} ${padT + plotH} Z`}
            fill="url(#authAreaGrad)"
          />
        )}

        {/* Line 1: Successful Authentication (Electric Cyan Glow) */}
        <path
          d={makePath('success', false)}
          fill="none"
          stroke="url(#authLineGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          filter="url(#authDropShadow)"
        />

        {/* Line 2: Failed Authentication (Orange-Gold #fbbf24) */}
        <path
          d={makePath('failed', true)}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2.2"
          strokeDasharray="4,3"
          strokeLinecap="round"
        />

        {/* Line 3: Access Denied (Vivid Orange #fb923c) */}
        <path
          d={makePath('denied', true)}
          fill="none"
          stroke="#fb923c"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Line 4: Tamper Alerts (Neon Red #ef4444) */}
        <path
          d={makePath('tamper', true)}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Interactive Hover Hitboxes & Vertical Indicator Line */}
        {points.map((p, i) => {
          const x = xCoord(i);
          return (
            <g key={i}>
              <rect
                x={x - plotW / (points.length * 2)}
                y={padT}
                width={plotW / points.length}
                height={plotH}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIdx(i)}
              />
              {hoveredIdx === i && (
                <>
                  <line
                    x1={x}
                    y1={padT}
                    x2={x}
                    y2={padT + plotH}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                    opacity="0.9"
                  />
                  <circle cx={x} cy={yCoordAuth(p.success)} r="5.5" fill="#38bdf8" stroke="#090e17" strokeWidth="2.5" />
                  <circle cx={x} cy={yCoordIncident(p.failed)} r="4.5" fill="#fbbf24" stroke="#090e17" strokeWidth="2" />
                  <circle cx={x} cy={yCoordIncident(p.denied)} r="4.5" fill="#fb923c" stroke="#090e17" strokeWidth="2" />
                  <circle cx={x} cy={yCoordIncident(p.tamper)} r="4.5" fill="#ef4444" stroke="#090e17" strokeWidth="2" />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip Card */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <div style={{
          position: 'absolute',
          top: 14,
          left: `${Math.min(Math.max((xCoord(hoveredIdx) / W) * 100, 14), 86)}%`,
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(8px)',
          color: '#ffffff',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 11,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
          zIndex: 20,
          border: '1px solid rgba(255,255,255,0.14)',
          minWidth: 170
        }}>
          <div style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 4, marginBottom: 5, color: '#38bdf8', display: 'flex', justifyContent: 'space-between' }}>
            <span>Time: {points[hoveredIdx].label || points[hoveredIdx].day}</span>
            <span style={{ fontSize: 9.5, opacity: 0.8, color: '#cbd5e1' }}>SOC Telemetry</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: '#e2e8f0', marginBottom: 2 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0284c7' }}></span>
              Success Auth:
            </span>
            <strong style={{ color: '#38bdf8' }}>{points[hoveredIdx].success?.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: '#e2e8f0', marginBottom: 2 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }}></span>
              Failed Auth:
            </span>
            <strong style={{ color: '#fbbf24' }}>{points[hoveredIdx].failed?.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: '#e2e8f0', marginBottom: 2 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ea580c' }}></span>
              Access Denied:
            </span>
            <strong style={{ color: '#fb923c' }}>{points[hoveredIdx].denied?.toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: '#e2e8f0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></span>
              Tamper Alerts:
            </span>
            <strong style={{ color: '#f87171' }}>{points[hoveredIdx].tamper?.toLocaleString()}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────
export default function BioStarPdfSpecificationView({ initialView = 'overview', onNavigateParent }) {
  // Current view matching PDF slides:
  // 'overview' (01) | 'reportHub' (02, 04, 08) | 'userReport' (03) | 'accessReport' (05, 06) | 'doorReport' (07) | 'deviceReport' (09, 10)
  const [currentView, setCurrentView] = useState(initialView);
  const [period, setPeriod] = useState('today');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [calloutTarget, setCalloutTarget] = useState('user'); // 'user' | 'access'

  // ── Multi-Dimensional Report Hub Filter States ──
  // User Report:
  const [userFilterDept, setUserFilterDept] = useState('All');
  const [userFilterBranch, setUserFilterBranch] = useState('All');
  const [userFilterBio, setUserFilterBio] = useState('All');
  const [userFilterStatus, setUserFilterStatus] = useState('All');

  // Access Report:
  const [accessFilterLevel, setAccessFilterLevel] = useState('All');
  const [accessFilterFloor, setAccessFilterFloor] = useState('All');
  const [accessFilterSchedule, setAccessFilterSchedule] = useState('All');

  // Door Report:
  const [doorFilterReq, setDoorFilterReq] = useState('All');
  const [doorFilterSystem, setDoorFilterSystem] = useState('All');
  const [doorFilterLockState, setDoorFilterLockState] = useState('All');
  const [doorFilterReader, setDoorFilterReader] = useState('All');

  // Device Report:
  const [devFilterModel, setDevFilterModel] = useState('All');
  const [devFilterStatus, setDevFilterStatus] = useState('All');
  const [devFilterFirmware, setDevFilterFirmware] = useState('All');

  // Reset all filters
  const resetAllReportFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
    setUserFilterDept('All');
    setUserFilterBranch('All');
    setUserFilterBio('All');
    setUserFilterStatus('All');
    setAccessFilterLevel('All');
    setAccessFilterFloor('All');
    setAccessFilterSchedule('All');
    setDoorFilterReq('All');
    setDoorFilterSystem('All');
    setDoorFilterLockState('All');
    setDoorFilterReader('All');
    setDevFilterModel('All');
    setDevFilterStatus('All');
    setDevFilterFirmware('All');
  };

  const [liveDoorWarningCount, setLiveDoorWarningCount] = useState(() => globalDoorStore.getWarningCount());
  const [liveDoorHealthyCount, setLiveDoorHealthyCount] = useState(() => globalDoorStore.getHealthyCount());

  useEffect(() => {
    return globalDoorStore.subscribe(() => {
      setLiveDoorWarningCount(globalDoorStore.getWarningCount());
      setLiveDoorHealthyCount(globalDoorStore.getHealthyCount());
    });
  }, []);

  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView);
    }
  }, [initialView]);

  const {
    region: globalRegion,
    branch: globalBranch,
    searchQuery: globalSearch,
    dateRange: globalDateRange,
    moduleFilters = {}
  } = useBankFilters();

  const overviewStats = useMemo(() => {
    let branchRatio = 1.0;
    let locationLabel = 'Central Biometric DB (829 Branches)';
    let matchedCount = FULL_PUBALI_LOCATIONS.length;

    if (globalRegion && globalRegion !== 'All Regions') {
      const rLow = globalRegion.toLowerCase();
      const matched = FULL_PUBALI_LOCATIONS.filter(l =>
        (l.division && l.division.toLowerCase().includes(rLow)) ||
        (l.name && l.name.toLowerCase().includes(rLow))
      );
      matchedCount = matched.length;
      if (globalBranch && globalBranch !== 'All Branches') {
        const bLow = globalBranch.toLowerCase();
        const branchMatched = matched.filter(l => l.name.toLowerCase().includes(bLow));
        matchedCount = branchMatched.length || 1;
        locationLabel = `${globalBranch} · ${globalRegion}`;
      } else {
        locationLabel = `${globalRegion} Division (${matchedCount} Branches)`;
      }
      branchRatio = Math.max(0.005, matchedCount / FULL_PUBALI_LOCATIONS.length);
    } else if (globalBranch && globalBranch !== 'All Branches') {
      matchedCount = 1;
      branchRatio = 1 / 829;
      locationLabel = globalBranch;
    }

    const baseChart = PDF_CHART_DATA[period] || PDF_CHART_DATA.today;

    const totalEmp = Math.round(35000 * branchRatio);
    const presentEmp = Math.round(33180 * branchRatio);
    const absentEmp = Math.round(1120 * branchRatio);
    const leaveEmp = Math.round(640 * branchRatio);
    const lateEmp = Math.round(700 * branchRatio);
    const leftEmp = Math.round(145 * branchRatio);
    const insideEmp = Math.round(30360 * branchRatio);
    const outsideEmp = Math.max(0, totalEmp - insideEmp);

    const risk = moduleFilters.riskTier;
    const portal = moduleFilters.portalTier;

    let riskMultiplier = 1.0;
    if (risk === 'Critical') riskMultiplier = 2.2;
    else if (risk === 'Warning') riskMultiplier = 1.4;
    else if (risk === 'Normal') riskMultiplier = 0.2;

    let portalCount = Math.round(2696 * branchRatio);
    if (portal === 'Vault Only') portalCount = Math.round(520 * branchRatio);
    else if (portal === 'Server Room') portalCount = Math.round(180 * branchRatio);
    else if (portal === 'Cash Counter') portalCount = Math.round(640 * branchRatio);
    else if (portal === 'Perimeter') portalCount = Math.round(820 * branchRatio);

    const totalEvents = Math.round((baseChart.totalEvents || 32116) * branchRatio);
    const successEvents = Math.round((baseChart.summary?.success || 31850) * branchRatio * (risk === 'Critical' ? 0.6 : 1));
    const failedEvents = Math.round((baseChart.summary?.failed || 242) * branchRatio * riskMultiplier);
    const deniedEvents = Math.round(Math.max(1, (baseChart.summary?.denied || 17) * branchRatio * riskMultiplier));
    const tamperEvents = Math.round(Math.max(0, (baseChart.summary?.tamper || 7) * branchRatio * riskMultiplier));
    const doorForcedEvents = risk === 'Critical' ? Math.max(1, Math.round(2 * branchRatio)) : 0;
    const doorHeldEvents = Math.round(Math.max(1, (baseChart.summary?.doorHeld || 6) * branchRatio * (risk === 'Warning' ? 2.5 : 1)));
    const apbEvents = Math.round(Math.max(0, (baseChart.summary?.antiPassback || 3) * branchRatio * (risk === 'Critical' ? 2 : 1)));
    const tailgatingEvents = Math.round(Math.max(0, (baseChart.summary?.tailgating || 1) * branchRatio * (risk === 'Critical' ? 2 : 1)));
    const restrictedAreaEvents = Math.round((baseChart.summary?.restrictedArea || 142) * branchRatio);

    const scaledCurvePoints = (baseChart.curvePoints || []).map(pt => ({
      ...pt,
      success: Math.round(pt.success * branchRatio),
      failed: Math.round(pt.failed * branchRatio * riskMultiplier),
      denied: Math.round(pt.denied * branchRatio * riskMultiplier),
      tamper: Math.round(pt.tamper * branchRatio * riskMultiplier)
    }));

    return {
      branchRatio,
      matchedCount,
      locationLabel,
      totalEmp,
      presentEmp,
      absentEmp,
      leaveEmp,
      lateEmp,
      leftEmp,
      insideEmp,
      outsideEmp,
      portalCount,
      totalEvents,
      summary: {
        success: successEvents,
        failed: failedEvents,
        denied: deniedEvents,
        tamper: tamperEvents,
        doorForced: doorForcedEvents,
        doorHeld: doorHeldEvents,
        antiPassback: apbEvents,
        tailgating: tailgatingEvents,
        restrictedArea: restrictedAreaEvents
      },
      legend: [
        { key: 'success', label: 'Successful Authentication', value: successEvents.toLocaleString(), color: '#0284c7' },
        { key: 'failed',  label: 'Failed Authentication',      value: failedEvents.toLocaleString(), color: '#f59e0b' },
        { key: 'denied',  label: 'Access Denied',              value: deniedEvents.toLocaleString(), color: '#ea580c' },
        { key: 'tamper',  label: 'Tamper Alerts',              value: tamperEvents.toLocaleString(), color: '#ef4444' }
      ],
      curvePoints: scaledCurvePoints,
      labels: baseChart.labels,
      dateRange: baseChart.dateRange,
      total: successEvents,
      tableData: baseChart.tableData || [],
      scaleAuth: Math.round(baseChart.scaleAuth * branchRatio) || 100,
      scaleIncident: Math.round(baseChart.scaleIncident * branchRatio) || 10
    };
  }, [period, globalRegion, globalBranch, moduleFilters]);

  // Chart data
  const chartData = overviewStats;
  const currentData = overviewStats;

  // Executive CSV Export helper
  const handleExportExecutiveReport = () => {
    const csvContent = [
      'Category,Metric,Value,Target / Status,Details',
      'Executive KPI,Total Employees,35000,Active,Nationwide Enrolled Workforce in 829 Branches',
      'Executive KPI,Employees Present,33180,35000,94.8% Present Today (ATT-01)',
      'Executive KPI,Employees Absent,1120,35000,3.2% Absenteeism Rate (ATT-05)',
      'Executive KPI,Employees on Leave,640,35000,1.8% Approved Casual & Sick Leave',
      'Executive KPI,Employees Late,700,35000,2.0% Late Rate (Grace > 09:15 AM) (ATT-03)',
      'Executive KPI,Employees Left Office,145,35000,0.4% Early Departure before 17:00 (ATT-04)',
      'Executive KPI,Employees Currently Inside,30360,35000,86.7% Inside Branch Portals & HO',
      'Executive KPI,Employees Currently Outside,4640,35000,13.3% Field / In Transit / Off-Duty',
      'Executive KPI,Attendance %,94.8%,100%,Live Nationwide Biometric Attendance Rate',
      'Executive KPI,Late Attendance %,2.00%,0.0%,Bank-wide Late Arrival Ratio (ATT-03)',
      'Executive KPI,Absenteeism %,3.20%,0.0%,Bank-wide Absenteeism Ratio (ATT-05)',
      'Executive KPI,Overtime Hours,1480.5 hrs,Verified,Bank-wide Approved Extended Shift Duty (ATT-06)',
      'Executive KPI,Active Branches,829,829,519 General · 281 Upashakha · 29 Islamic',
      'Executive KPI,Active Doors,1040,1040,100% Armed ACS Doors & Turnstiles (AC-03)',
      'Executive KPI,Online Controllers,520,520,100% CoreStation CS-40 Central ACU Hubs Online',
      'Executive KPI,Online Readers,1624,1658,97.95% Biometric Terminals Online (DEV-02)',
      'Executive KPI,Security Alarms,48,Active,8 Active · 14 ACKed · 26 Resolved (SC-01)',
      'Executive KPI,Forced Door Events,0,0,Zero Critical Violations (Auto-Locked)',
      'Executive KPI,Door Held Open Warnings,12,12,Relay Timer Warnings (DEV-03)',
      'Executive KPI,Cash Vault & Strong Room,520,520,100% Dual-Custody Bio+PIN Secured (AC-08)',
      'Executive KPI,Bank MPLS Network,99.98%,100%,Bank MPLS Intranet & SOC Telemetry',
      'Executive KPI,Anti-Passback Flags,0,0,Zero Critical Violations (3 Soft Warnings)',
      'Executive KPI,Bangladesh Bank Compliance,98.6%,100%,Central Bank Circular ICT-08 Audit Score',
      'System Telemetry,BioStar X REST API,Online,100%,Active REST Gateway',
      'System Telemetry,Database Cluster,Healthy,100%,Encrypted Active Replicas',
      'System Telemetry,Bank MPLS Network,Connected,100%,Encrypted Intranet Tunnel',
      `System Telemetry,Total Security Events,${chartData.totalEvents || 32116},Logged,Real-time Event Stream`,
      `System Telemetry,Access Denied,${chartData.summary?.denied ?? 17},Flagged,Door Security Policy Denial`,
      `System Telemetry,Tamper Sensor Breach,${chartData.summary?.tamper ?? 7},Critical,Hardware Sensor Tamper Breaches`,
      'Infrastructure,Biometric Terminals,1658,1624 Online / 34 Standby,BioStation 3 / FaceStation F2 / BioEntry W2',
      'Infrastructure,Door Controllers & Portals,1040,1028 Healthy / 12 Warning,1040 Portals in 829 Branches (AC-03)',
      'Infrastructure,Access Groups,829,100% Policy Synced,Branch / Vault Dual Custody / ATM Rooms',
      'Regional Health,Dhaka Region,99.8%,412 Locations,Head Office & Division (0.8ms latency)',
      'Regional Health,Chattogram Region,98.9%,184 Locations,Commercial Port & Coastal (1.4ms latency)',
      'Regional Health,Rajshahi Region,99.5%,128 Locations,Northern Agriculture Zone (1.9ms latency)',
      'Regional Health,Sylhet Region,99.2%,105 Locations,Northeast Tea Estate Zone (2.1ms latency)',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pubali_Bank_Command_Center_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Table download helper
  const handleExportCsv = (filename, data) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    data.forEach(row => {
      const vals = headers.map(h => `"${row[h] ?? ''}"`);
      csvRows.push(vals.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Table download helper
  const handleExportTableData = () => {
    if (!currentData || !currentData.tableData || currentData.tableData.length === 0) return;
    const headers = Object.keys(currentData.tableData[0]).join(',');
    const rows = currentData.tableData.map(row => 
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pubali_Bank_Audit_Logs_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── SUB-VIEWS ───────────────────────────────────────────

  // 1. ENTERPRISE BANKING COMMAND CENTER (Overview)
  const renderOverviewView = () => {
    const currentData = overviewStats;

    const handleCardClick = (kpi) => {
      if (onNavigateParent && kpi.targetPage) {
        onNavigateParent(kpi.targetPage);
      } else if (kpi.targetSubView) {
        setCurrentView(kpi.targetSubView);
        setActiveFilter('all');
      }
    };

    const getStatusBadge = (status) => {
      switch (status) {
        case 'NORMAL':
        case 'GRANTED':
        case 'CLOSED':
          return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: '#dcfce7', color: '#15803d' }}>{status}</span>;
        case 'WARNING':
        case 'HELD_OPEN':
          return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: '#fef3c7', color: '#b45309' }}>{status}</span>;
        case 'CRITICAL':
        case 'FORCED_OPEN':
        case 'DENIED':
        case 'TAMPER':
          return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: '#fee2e2', color: '#b91c1c' }}>{status}</span>;
        default:
          return <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: '#f1f5f9', color: '#475569' }}>{status}</span>;
      }
    };

    const workforceKpiCards = [
      {
        title: "Total Employees",
        value: overviewStats.totalEmp.toLocaleString(),
        sub: overviewStats.locationLabel,
        badge: `${overviewStats.totalEmp >= 1000 ? (overviewStats.totalEmp / 1000).toFixed(0) + 'k' : overviewStats.totalEmp} Enrolled`,
        badgeColor: "#0284c7",
        trend: "100% Synced",
        trendColor: "#0369a1",
        targetPage: "users",
        targetSubView: "userReport",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" width="22" height="22">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        bg: "rgba(2, 132, 199, 0.08)",
        border: "#e0f2fe"
      },
      {
        title: "Employees Present",
        value: overviewStats.presentEmp.toLocaleString(),
        sub: `${overviewStats.totalEmp > 0 ? ((overviewStats.presentEmp / overviewStats.totalEmp) * 100).toFixed(1) : '94.8'}% Live Attendance (ATT-01)`,
        badge: `${overviewStats.totalEmp > 0 ? ((overviewStats.presentEmp / overviewStats.totalEmp) * 100).toFixed(1) : '94.8'}% Present`,
        badgeColor: "#059669",
        progress: overviewStats.totalEmp > 0 ? Number(((overviewStats.presentEmp / overviewStats.totalEmp) * 100).toFixed(1)) : 94.8,
        progressColor: "#10b981",
        targetPage: "att-daily",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" width="22" height="22">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l3 3 5-5" />
          </svg>
        ),
        bg: "rgba(16, 185, 129, 0.08)",
        border: "#d1fae5"
      },
      {
        title: "Employees Absent",
        value: `${overviewStats.absentEmp.toLocaleString()} Staff`,
        sub: `${overviewStats.totalEmp > 0 ? ((overviewStats.absentEmp / overviewStats.totalEmp) * 100).toFixed(1) : '3.2'}% Absenteeism Rate (ATT-05)`,
        badge: `${overviewStats.totalEmp > 0 ? ((overviewStats.absentEmp / overviewStats.totalEmp) * 100).toFixed(1) : '3.2'}% Absent`,
        badgeColor: "#dc2626",
        trend: "ATT-05 Logged",
        trendColor: "#b91c1c",
        targetPage: "att-exception?tab=Absent No Leave",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" width="22" height="22">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        ),
        bg: "rgba(220, 38, 38, 0.08)",
        border: "#fee2e2"
      },
      {
        title: "Employees on Leave",
        value: `${overviewStats.leaveEmp.toLocaleString()} Staff`,
        sub: "HR Approved Sick & Casual (ATT-05)",
        badge: `${overviewStats.leaveEmp} Approved`,
        badgeColor: "#8b5cf6",
        trend: "HR Verified",
        trendColor: "#7c3aed",
        targetPage: "att-employee",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" width="22" height="22">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
        bg: "rgba(139, 92, 246, 0.08)",
        border: "#ede9fe"
      },
      {
        title: "Employees Late",
        value: `${overviewStats.lateEmp.toLocaleString()} Staff`,
        sub: "2.0% Late Rate (Grace > 09:15 AM)",
        badge: "2.0% Late",
        badgeColor: "#d97706",
        trend: "Grace > 15m",
        trendColor: "#d97706",
        targetPage: "att-late",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" width="22" height="22">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 15 15" />
            <path d="M16 2v3M8 2v3" />
          </svg>
        ),
        bg: "rgba(217, 119, 6, 0.08)",
        border: "#fef3c7"
      },
      {
        title: "Employees Left Office",
        value: `${overviewStats.leftEmp.toLocaleString()} Staff`,
        sub: "0.4% Exit Before Shift End (ATT-04)",
        badge: `${overviewStats.leftEmp} Logged`,
        badgeColor: "#f59e0b",
        trend: "Early Exit",
        trendColor: "#059669",
        targetPage: "att-early",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" width="22" height="22">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 8 14" />
            <path d="M18 15l3-3-3-3" />
          </svg>
        ),
        bg: "rgba(245, 158, 11, 0.08)",
        border: "#fef3c7"
      },
      {
        title: "Currently Inside",
        value: `${overviewStats.insideEmp.toLocaleString()} Staff`,
        sub: "86.7% Inside Portals & HO",
        badge: "Inside Portals",
        badgeColor: "#0d9488",
        hasPulse: true,
        targetPage: "who-is-inside?status=Inside",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" width="22" height="22">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
          </svg>
        ),
        bg: "rgba(13, 148, 136, 0.08)",
        border: "#ccfbf1"
      },
      {
        title: "Currently Outside",
        value: `${overviewStats.outsideEmp.toLocaleString()} Staff`,
        sub: "13.3% Field, In Transit or Off-Duty",
        badge: "Outside / Transit",
        badgeColor: "#64748b",
        trend: "13.3% Outside",
        trendColor: "#475569",
        targetPage: "who-is-inside?status=Outside",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" width="22" height="22">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        ),
        bg: "rgba(100, 116, 139, 0.08)",
        border: "#e2e8f0"
      },
      {
        title: "Attendance Percentage",
        value: "94.8%",
        sub: "Nationwide Biometric Rate (Target > 90%)",
        badge: "94.8% Live",
        badgeColor: "#059669",
        progress: 94.8,
        progressColor: "#10b981",
        targetPage: "att-daily",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" width="22" height="22">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ),
        bg: "rgba(16, 185, 129, 0.08)",
        border: "#d1fae5"
      },
      {
        title: "Late Attendance %",
        value: "2.00%",
        sub: "700 Late Arrivals / 35,000 Staff",
        badge: "Target < 3.0%",
        badgeColor: "#d97706",
        progress: 2.0,
        progressColor: "#d97706",
        targetPage: "att-late",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" width="22" height="22">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 15 15" />
          </svg>
        ),
        bg: "rgba(217, 119, 6, 0.08)",
        border: "#fef3c7"
      },
      {
        title: "Absenteeism %",
        value: "3.20%",
        sub: "1,120 Absent / 35,000 Staff",
        badge: "Target < 4.0%",
        badgeColor: "#dc2626",
        progress: 3.2,
        progressColor: "#dc2626",
        targetPage: "att-exception?tab=Absent No Leave",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" width="22" height="22">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        ),
        bg: "rgba(220, 38, 38, 0.08)",
        border: "#fee2e2"
      },
      {
        title: "Overtime Hours",
        value: "1,480.5 hrs",
        sub: "Bank-wide Approved Extended Duty",
        badge: "Payroll OT",
        badgeColor: "#0284c7",
        trend: "Verified",
        trendColor: "#0369a1",
        targetPage: "att-overtime",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" width="22" height="22">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
        bg: "rgba(2, 132, 199, 0.08)",
        border: "#e0f2fe"
      }
    ];

    const fleetKpiCards = [
      {
        title: "Active Branches",
        value: `${overviewStats.matchedCount || 829}`,
        sub: overviewStats.locationLabel,
        badge: overviewStats.branchRatio < 1 ? "Filtered Hub" : "Nationwide",
        badgeColor: "#0d9488",
        trend: "100% Online",
        trendColor: "#0f766e",
        targetPage: "org-branch",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" width="22" height="22">
            <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2l10 5H2l10-5z" />
          </svg>
        ),
        bg: "rgba(13, 148, 136, 0.08)",
        border: "#ccfbf1"
      },
      {
        title: "Active Doors",
        value: `${overviewStats.portalCount.toLocaleString()} Doors`,
        sub: `● Healthy: ${Math.round(liveDoorHealthyCount * overviewStats.branchRatio)} · ● Warning: ${Math.round(liveDoorWarningCount * overviewStats.branchRatio)}`,
        badge: "100% Armed",
        badgeColor: "#0d9488",
        progress: 100,
        progressColor: "#0d9488",
        targetPage: "access-doors",
        targetSubView: "doorReport",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" width="22" height="22">
            <path d="M14 2H3v20h18V9z" />
            <path d="M14 2v7h7" />
            <circle cx="16" cy="13" r="1.5" fill="#0d9488" stroke="none" />
          </svg>
        ),
        bg: "rgba(13, 148, 136, 0.08)",
        border: "#ccfbf1"
      },
      {
        title: "Online Controllers",
        value: `${Math.max(1, Math.round(520 * overviewStats.branchRatio))} / ${Math.max(1, Math.round(520 * overviewStats.branchRatio))}`,
        sub: "CoreStation CS-40 Central ACUs",
        badge: "100% Online",
        badgeColor: "#059669",
        progress: 100,
        progressColor: "#10b981",
        targetPage: "dev-controller",
        targetSubView: "deviceReport",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" width="22" height="22">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
            <line x1="6" y1="6" x2="6.01" y2="6"/>
            <line x1="6" y1="18" x2="6.01" y2="18"/>
          </svg>
        ),
        bg: "rgba(16, 185, 129, 0.08)",
        border: "#d1fae5"
      },
      {
        title: "Online Readers",
        value: "1,624 / 1,658",
        sub: "34 Standby/Servicing (DEV-02)",
        badge: "97.95% SLA",
        badgeColor: "#2563eb",
        progress: 97.95,
        progressColor: "#2563eb",
        targetPage: "dev-reader",
        targetSubView: "deviceReport",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" width="22" height="22">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <circle cx="12" cy="11" r="2.5" />
            <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ),
        bg: "rgba(37, 99, 235, 0.08)",
        border: "#dbeafe"
      },
      {
        title: "Offline / Fault Devices",
        value: "34 Terminals",
        sub: "Zero Outages · Routine Servicing",
        badge: "97.95% Up",
        badgeColor: "#64748b",
        trend: "Self-Healing",
        trendColor: "#059669",
        targetPage: "dev-inactive",
        targetSubView: "deviceReport",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" width="22" height="22">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ),
        bg: "rgba(100, 116, 139, 0.08)",
        border: "#e2e8f0"
      },
      {
        title: "Bank MPLS Network",
        value: "99.98%",
        sub: "Bank MPLS & Intranet VPN (DEV-06)",
        badge: "Optimal (12ms)",
        badgeColor: "#059669",
        progress: 99.98,
        progressColor: "#10b981",
        targetPage: "dev-network",
        targetSubView: "deviceReport",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" width="22" height="22">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        ),
        bg: "rgba(16, 185, 129, 0.08)",
        border: "#d1fae5"
      }
    ];

    const securityKpiCards = [
      {
        title: "Security Posture Score",
        value: "98.6 / 100",
        sub: "Grade A+ Nationwide Bank Rating",
        badge: "Grade A+",
        badgeColor: "#0284c7",
        progress: 98.6,
        progressColor: "#0284c7",
        targetPage: "branch-scorecard",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" width="22" height="22">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
        bg: "rgba(2, 132, 199, 0.08)",
        border: "#e0f2fe"
      },
      {
        title: "Security Alerts & Alarms",
        value: "48 Total",
        sub: "8 Active · 14 ACK · 26 Resolved",
        badge: "48 Monitored",
        badgeColor: "#dc2626",
        hasPulse: true,
        targetPage: "soc-alarm",
        targetSubView: "accessReport",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" width="22" height="22">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ),
        bg: "rgba(220, 38, 38, 0.08)",
        border: "#fee2e2"
      },
      {
        title: "Forced Door Events",
        value: "0 Critical",
        sub: "2 Auto-Locked & Secured (SC-03)",
        badge: "Secured",
        badgeColor: "#059669",
        trend: "Zero Breach",
        trendColor: "#059669",
        targetPage: "security-incidents",
        targetSubView: "accessReport",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" width="22" height="22">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        ),
        bg: "rgba(16, 185, 129, 0.08)",
        border: "#d1fae5"
      },
      {
        title: "Door Held Open Warnings",
        value: `${liveDoorWarningCount} Doors`,
        sub: "Relay Timer Sensor Warnings (DEV-03)",
        badge: `${liveDoorWarningCount} Warning`,
        badgeColor: "#d97706",
        hasPulse: liveDoorWarningCount > 0,
        targetPage: "dev-door",
        targetSubView: "doorReport",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" width="22" height="22">
            <rect x="8" y="10" width="18" height="30" rx="2" />
            <path d="M34 16v9" />
            <circle cx="34" cy="30" r="1.5" fill="#d97706" />
          </svg>
        ),
        bg: "rgba(217, 119, 6, 0.08)",
        border: "#fef3c7"
      },
      {
        title: "Cash Vault & Strong Room",
        value: "520 / 520",
        sub: "100% Dual-Custody Bio+PIN (AC-08)",
        badge: "100% Secured",
        badgeColor: "#4f46e5",
        progress: 100,
        progressColor: "#6366f1",
        targetPage: "audit-access",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" width="22" height="22">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            <circle cx="12" cy="16" r="1.5" />
            <path d="M12 17.5v2" />
          </svg>
        ),
        bg: "rgba(79, 70, 229, 0.08)",
        border: "#e0e7ff"
      },
      {
        title: "Anti-Passback (APB) Flags",
        value: "0 Critical",
        sub: "3 Soft Warnings · Tailgating Shield",
        badge: "Protected",
        badgeColor: "#8b5cf6",
        trend: "Zero Breach",
        trendColor: "#7c3aed",
        targetPage: "apb-tailgating",
        targetSubView: "accessReport",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" width="22" height="22">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l6.73-7.19" />
          </svg>
        ),
        bg: "rgba(139, 92, 246, 0.08)",
        border: "#ede9fe"
      },
      {
        title: "Bangladesh Bank Compliance",
        value: "98.6% Score",
        sub: "Central Bank Circular ICT-08 Audit",
        badge: "⭐ Platinum",
        badgeColor: "#059669",
        progress: 98.6,
        progressColor: "#10b981",
        targetPage: "compliance-reports",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" width="22" height="22">
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        ),
        bg: "rgba(16, 185, 129, 0.08)",
        border: "#d1fae5"
      },
      {
        title: "Restricted Area Access",
        value: "1,040 Entries",
        sub: "Cash Vault, SWIFT & DC Biometric Trails",
        badge: "1,040 Logged",
        badgeColor: "#0284c7",
        trend: "Audit-Tracked",
        trendColor: "#0369a1",
        targetPage: "restricted-area-access",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" width="22" height="22">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            <circle cx="12" cy="16" r="1.5" />
          </svg>
        ),
        bg: "rgba(2, 132, 199, 0.08)",
        border: "#e0f2fe"
      },
      {
        title: "VIP Access Events",
        value: "18 Events",
        sub: "Board Room & Executive Suites",
        badge: "Logged",
        badgeColor: "#6366f1",
        trend: "Dual-Verified",
        trendColor: "#4f46e5",
        targetPage: "restricted-area-access?zone=Executive",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" width="22" height="22">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
        bg: "rgba(99, 102, 241, 0.08)",
        border: "#e0e7ff"
      },
      {
        title: "Emergency Events",
        value: "0 Active",
        sub: "Fire Interlock & Evacuation Armed",
        badge: "Standby 100%",
        badgeColor: "#059669",
        trend: "Zero Alarm",
        trendColor: "#059669",
        targetPage: "who-is-inside?status=Evacuated&emergency=true",
        targetSubView: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" width="22" height="22">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        ),
        bg: "rgba(16, 185, 129, 0.08)",
        border: "#d1fae5"
      }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 4px',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Banking Command Center</span>
              <span style={{ fontSize: 11, fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '2px 9px', borderRadius: 12 }}>
                SOC Real-Time
              </span>
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="bs-btn"
              onClick={handleExportExecutiveReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11.5,
                fontWeight: 700,
                padding: '6px 14px',
                background: '#ffffff',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Export Nationwide Biometric & Security Telemetry (CSV)"
            >
              <span style={{ fontSize: 13 }}>📥</span>
              <span>Export Report</span>
            </button>

            <button
              className="bs-btn"
              onClick={() => {
                if (onNavigateParent) onNavigateParent('reports');
                else setCurrentView('reportHub');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11.5,
                fontWeight: 700,
                padding: '6px 15px',
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(13,148,136,0.28)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Open BioStar X Enterprise Report Center"
            >
              <span style={{ fontSize: 13 }}>📊</span>
              <span>Report Center</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* ── SECTION 1: MAIN ANALYTICS + SECURITY STATUS (2 COLUMNS - CYBER DARK COMMAND CENTER THEME) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 330px',
          gap: 14,
          alignItems: 'stretch'
        }}>
          {/* Left Card: Authentication & Security Overview (Cyber Dark Theme) */}
          <div className="bs-card" style={{
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 10,
            border: '1px solid rgba(56, 189, 248, 0.28)',
            background: 'linear-gradient(145deg, #090e17 0%, #0c1527 50%, #050811 100%)',
            boxShadow: '0 12px 35px rgba(2, 6, 23, 0.5), 0 0 25px rgba(2, 132, 199, 0.1)',
            overflow: 'hidden'
          }}>
            {/* Header with Title and Period Filter */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.02)',
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8'
                  }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                    Authentication & Security Overview
                  </span>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: '#2dd4bf',
                    background: 'rgba(13, 148, 136, 0.25)',
                    border: '1px solid rgba(45, 212, 191, 0.3)',
                    padding: '1px 8px',
                    borderRadius: 10
                  }}>
                    {currentData.dateRange}
                  </span>
                </div>
              </div>

              {/* Time Period Filter Pills */}
              <div style={{
                display: 'flex',
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 6,
                padding: 3,
                gap: 2
              }}>
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: 'Week' },
                  { id: 'month', label: 'Month' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPeriod(p.id)}
                    style={{
                      padding: '4px 12px',
                      fontSize: 11,
                      fontWeight: period === p.id ? 700 : 500,
                      background: period === p.id ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
                      border: period === p.id ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                      borderRadius: 4,
                      cursor: 'pointer',
                      color: period === p.id ? '#ffffff' : '#94a3b8',
                      boxShadow: period === p.id ? '0 0 12px rgba(2, 132, 199, 0.6)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Legends Row with Glowing Indicators */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 18px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              background: 'rgba(0, 0, 0, 0.3)',
              flexWrap: 'wrap',
              gap: 8
            }}>
              {(currentData?.legend || []).map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: item.color,
                    boxShadow: `0 0 8px ${item.color}`,
                    flexShrink: 0
                  }}></span>
                  <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{item.label}:</span>
                  <strong style={{ color: '#f8fafc', fontFamily: 'monospace', fontSize: 11.5 }}>{item.value}</strong>
                </div>
              ))}
            </div>

            {/* Main Chart Body - Flex 1 to fill card height seamlessly */}
            <div style={{
              padding: '12px 16px 8px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 290,
              position: 'relative'
            }}>
              <EnterpriseAuthSecurityChart period={period} chartData={chartData} />
            </div>

            {/* Quick Telemetry KPI Summary Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 12,
              padding: '10px 18px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0, 0, 0, 0.32)',
              marginTop: 'auto'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 9.5, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Peak Auth Volume</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>10:00 AM <span style={{ fontSize: 10, color: '#7dd3fc', fontWeight: 500 }}>(8,420/hr)</span></span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 9.5, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Match Accuracy</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>99.98% <span style={{ fontSize: 10, color: '#a7f3d0', fontWeight: 500 }}>(FAR/FRR)</span></span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 9.5, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Auth Speed</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>142 ms <span style={{ fontSize: 10, color: '#fde68a', fontWeight: 500 }}>(Sub-second)</span></span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 9.5, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>SOC Live Feed</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#a855f7', fontFamily: 'monospace' }}>Active <span style={{ fontSize: 10, color: '#e9d5ff', fontWeight: 500 }}>(TLS 1.3)</span></span>
              </div>
            </div>
          </div>

          {/* Right Card: Security Status Card (Matching Cyber Dark Theme) */}
          <div className="bs-card" style={{
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 10,
            border: '1px solid rgba(56, 189, 248, 0.28)',
            background: 'linear-gradient(145deg, #090e17 0%, #0c1527 50%, #050811 100%)',
            boxShadow: '0 12px 35px rgba(2, 6, 23, 0.5), 0 0 25px rgba(2, 132, 199, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #34d399',
                  flexShrink: 0
                }}></span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>System Status</span>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                padding: '2px 8px',
                borderRadius: 4
              }}>
                Online & Monitored
              </span>
            </div>

            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, justifyContent: 'space-between' }}>
              {/* Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: "API Online", sub: "BioStar X Gateway", dot: "#10b981" },
                  { label: "Database Healthy", sub: "Encrypted Replica Cluster", dot: "#10b981" },
                  { label: "Network Connected", sub: "Bank MPLS Intranet", dot: "#10b981" },
                  { label: "Last Sync: 5 seconds ago", sub: "Central SOC Stream", dot: "#10b981" },
                ].map((st, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'rgba(255, 255, 255, 0.035)',
                    borderRadius: 6,
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.dot, boxShadow: '0 0 6px rgba(16,185,129,0.7)', flexShrink: 0 }}></span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#f1f5f9' }}>● {st.label}</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{st.sub}</span>
                  </div>
                ))}
              </div>

              {/* Event Counts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 12 }}>
                <div
                  id="telemetry-total-events-btn"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (onNavigateParent) onNavigateParent('access-doorstatus');
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (onNavigateParent) onNavigateParent('access-doorstatus');
                    }
                  }}
                  title={`Click to view Live Door Status & Real-Time Event Stream (${(currentData.totalEvents || 32116).toLocaleString()} Events)`}
                  style={{
                    padding: '9px 12px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    boxShadow: '0 0 15px rgba(2, 132, 199, 0.25)',
                    borderRadius: 6,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.16s ease',
                    userSelect: 'none'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 18px rgba(2, 132, 199, 0.45)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(2, 132, 199, 0.25)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#bae6fd' }}>Total Events</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#e0f2fe', background: 'rgba(255, 255, 255, 0.2)', padding: '1px 5px', borderRadius: 3 }}>VIEW ↗</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: 'monospace' }}>
                    {(currentData.totalEvents || 32116).toLocaleString()}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                  <div
                    id="telemetry-access-denied-btn"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (onNavigateParent) onNavigateParent('restricted-access?result=Denied&timeframe=today', { result: 'Denied', timeframe: 'today' });
                    }}
                    title="Click to view Cash Vault & Server Room Access Denied Audit Log"
                    style={{
                      padding: '7px 9px',
                      background: 'rgba(249, 115, 22, 0.12)',
                      border: '1px solid rgba(249, 115, 22, 0.35)',
                      borderRadius: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      cursor: 'pointer',
                      transition: 'all 0.16s ease',
                      userSelect: 'none'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(249, 115, 22, 0.22)';
                      e.currentTarget.style.borderColor = '#ea580c';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(249, 115, 22, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.35)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#fdba74' }}>Access Denied</span>
                      <span style={{ fontSize: 8.5, fontWeight: 700, color: '#fed7aa', background: 'rgba(234, 88, 12, 0.3)', padding: '1px 4px', borderRadius: 3 }}>VIEW ↗</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#fb923c', fontFamily: 'monospace' }}>
                      {(currentData.summary?.denied ?? 17).toLocaleString()}
                    </span>
                  </div>

                  <div
                    id="telemetry-tamper-alerts-btn"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (onNavigateParent) onNavigateParent('soc-alarm?type=Tamper Alert', { type: 'Tamper Alert' });
                    }}
                    title="Click to view Central Security Operations (SOC) Tamper Alarm Panel"
                    style={{
                      padding: '7px 9px',
                      background: 'rgba(239, 68, 68, 0.14)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      cursor: 'pointer',
                      transition: 'all 0.16s ease',
                      userSelect: 'none'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.24)';
                      e.currentTarget.style.borderColor = '#dc2626';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.14)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#fca5a5' }}>Tamper Alerts</span>
                      <span style={{ fontSize: 8.5, fontWeight: 700, color: '#fecaca', background: 'rgba(220, 38, 38, 0.3)', padding: '1px 4px', borderRadius: 3 }}>VIEW ↗</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#f87171', fontFamily: 'monospace' }}>
                      {(currentData.summary?.tamper ?? 7).toLocaleString()}
                    </span>
                  </div>

                  <div
                    id="telemetry-door-forced-btn"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (onNavigateParent) onNavigateParent('soc-alarm?type=Door Forced Open');
                    }}
                    title="Door Forced Open Intrusion Events"
                    style={{
                      padding: '7px 9px',
                      background: 'rgba(244, 63, 94, 0.12)',
                      border: '1px solid rgba(244, 63, 94, 0.35)',
                      borderRadius: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      cursor: 'pointer',
                      transition: 'all 0.16s ease',
                      userSelect: 'none'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(244, 63, 94, 0.22)';
                      e.currentTarget.style.borderColor = '#e11d48';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(244, 63, 94, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.35)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#fda4af' }}>Door Forced</span>
                      <span style={{ fontSize: 8.5, fontWeight: 700, color: '#fecdd3', background: 'rgba(225, 29, 72, 0.3)', padding: '1px 4px', borderRadius: 3 }}>VIEW ↗</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#fb7185', fontFamily: 'monospace' }}>
                      {(currentData.summary?.doorForced ?? 0).toLocaleString()} <span style={{ fontSize: 9.5, fontWeight: 600, color: '#4ade80' }}>● Auto-Locked</span>
                    </span>
                  </div>

                  <div
                    id="telemetry-door-held-btn"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (onNavigateParent) onNavigateParent('access-doorstatus?loop=Warning');
                    }}
                    title="Door Held Open Sensor Warnings"
                    style={{
                      padding: '7px 9px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      borderRadius: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      cursor: 'pointer',
                      transition: 'all 0.16s ease',
                      userSelect: 'none'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(245, 158, 11, 0.22)';
                      e.currentTarget.style.borderColor = '#d97706';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(245, 158, 11, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.35)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#fde68a' }}>Door Held Open</span>
                      <span style={{ fontSize: 8.5, fontWeight: 700, color: '#fef3c7', background: 'rgba(217, 119, 6, 0.3)', padding: '1px 4px', borderRadius: 3 }}>VIEW ↗</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>
                      {(currentData.summary?.doorHeld ?? 6).toLocaleString()} <span style={{ fontSize: 9.5, fontWeight: 600, color: '#fde68a' }}>Warnings</span>
                    </span>
                  </div>

                  <div
                    id="telemetry-apb-violations-btn"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (onNavigateParent) onNavigateParent('apb-tailgating');
                    }}
                    title="Anti-Passback Sequence Breaches"
                    style={{
                      padding: '7px 9px',
                      background: 'rgba(168, 85, 247, 0.12)',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      borderRadius: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      cursor: 'pointer',
                      transition: 'all 0.16s ease',
                      userSelect: 'none'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(168, 85, 247, 0.22)';
                      e.currentTarget.style.borderColor = '#9333ea';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(168, 85, 247, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#e9d5ff' }}>Anti-passback</span>
                      <span style={{ fontSize: 8.5, fontWeight: 700, color: '#f3e8ff', background: 'rgba(147, 51, 234, 0.3)', padding: '1px 4px', borderRadius: 3 }}>VIEW ↗</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#c084fc', fontFamily: 'monospace' }}>
                      {(currentData.summary?.antiPassback ?? 3).toLocaleString()} <span style={{ fontSize: 9.5, fontWeight: 600, color: '#e9d5ff' }}>Violations</span>
                    </span>
                  </div>

                  <div
                    id="telemetry-tailgating-btn"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (onNavigateParent) onNavigateParent('apb-tailgating');
                    }}
                    title="Anti-Tailgating Sensor Events"
                    style={{
                      padding: '7px 9px',
                      background: 'rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(99, 102, 241, 0.35)',
                      borderRadius: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      cursor: 'pointer',
                      transition: 'all 0.16s ease',
                      userSelect: 'none'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.22)';
                      e.currentTarget.style.borderColor = '#6366f1';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.35)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#c7d2fe' }}>Tailgating Events</span>
                      <span style={{ fontSize: 8.5, fontWeight: 700, color: '#e0e7ff', background: 'rgba(79, 70, 229, 0.3)', padding: '1px 4px', borderRadius: 3 }}>VIEW ↗</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#818cf8', fontFamily: 'monospace' }}>
                      {(currentData.summary?.tailgating ?? 1).toLocaleString()} <span style={{ fontSize: 9.5, fontWeight: 600, color: '#c7d2fe' }}>Flagged</span>
                    </span>
                  </div>

                  <div
                    id="telemetry-restricted-area-btn"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (onNavigateParent) onNavigateParent('restricted-area-access');
                    }}
                    title="Restricted Area Access (Vaults, SWIFT Room & Data Center)"
                    style={{
                      padding: '7px 9px',
                      background: 'rgba(2, 132, 199, 0.14)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      borderRadius: 6,
                      gridColumn: 'span 2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.16s ease',
                      userSelect: 'none'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(2, 132, 199, 0.24)';
                      e.currentTarget.style.borderColor = '#38bdf8';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(2, 132, 199, 0.14)';
                      e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#bae6fd' }}>Restricted Area Access</span>
                        <span style={{ fontSize: 9, color: '#7dd3fc' }}>Vault · SWIFT · Data Center</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
                        {(currentData.summary?.restrictedArea ?? 142).toLocaleString()} <span style={{ fontSize: 9.5, fontWeight: 500, color: '#94a3b8' }}>Biometric verifications</span>
                      </span>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#e0f2fe', background: 'rgba(2, 132, 199, 0.35)', padding: '2px 6px', borderRadius: 4 }}>VIEW ↗</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: 23 KEY KPIS IN 3 EXECUTIVE CLUSTERS ── */}
        {/* Cluster 1: Branch Hardware & Device Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
              <span style={{ fontSize: 15 }}>🏛️</span>
              <span>Branch Hardware & Device Health</span>
              <span style={{ fontSize: 10, fontWeight: 700, background: '#d1fae5', color: '#047857', padding: '1px 7px', borderRadius: 10 }}>6 Key KPIs</span>
            </div>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>99.82% SLA Fleet Uptime</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 10
          }}>
            {fleetKpiCards.map((kpi, idx) => (
              <div
                key={idx}
                className="bs-card"
                role="button"
                tabIndex={0}
                aria-label={`View ${kpi.title} details: ${kpi.value}`}
                onClick={() => handleCardClick(kpi)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(kpi);
                  }
                }}
                style={{
                  margin: 0,
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 6,
                  transition: 'all 0.16s ease',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,23,42,0.08)';
                  e.currentTarget.style.borderColor = kpi.badgeColor;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {kpi.title}
                  </span>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: kpi.bg, border: `1px solid ${kpi.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {kpi.icon}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    {kpi.value}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 500, marginTop: 2 }}>
                    {kpi.sub}
                  </div>
                </div>

                {kpi.progress !== undefined && (
                  <div style={{ width: '100%', height: 3, borderRadius: 2, background: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ width: `${kpi.progress}%`, height: '100%', background: kpi.progressColor || kpi.badgeColor }} />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: kpi.trendColor || '#059669' }}>
                    {kpi.trend || 'Telemetry'}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: kpi.badgeColor, background: kpi.bg, border: `1px solid ${kpi.border}`, padding: '1px 5px', borderRadius: 4 }}>
                    {kpi.badge} →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cluster 2: Vault & Security Alarm Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
              <span style={{ fontSize: 15 }}>🛡️</span>
              <span>Vault & Security Alarm Alerts</span>
              <span style={{ fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#b91c1c', padding: '1px 7px', borderRadius: 10 }}>10 Key KPIs</span>
            </div>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Grade A+ (98.6 / 100) Security Score</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 10
          }}>
            {securityKpiCards.map((kpi, idx) => (
              <div
                key={idx}
                className="bs-card"
                role="button"
                tabIndex={0}
                aria-label={`View ${kpi.title} details: ${kpi.value}`}
                onClick={() => handleCardClick(kpi)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(kpi);
                  }
                }}
                style={{
                  margin: 0,
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 6,
                  transition: 'all 0.16s ease',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,23,42,0.08)';
                  e.currentTarget.style.borderColor = kpi.badgeColor;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {kpi.title}
                  </span>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: kpi.bg, border: `1px solid ${kpi.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {kpi.icon}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    {kpi.value}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 500, marginTop: 2 }}>
                    {kpi.sub}
                  </div>
                </div>

                {kpi.progress !== undefined && (
                  <div style={{ width: '100%', height: 3, borderRadius: 2, background: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ width: `${kpi.progress}%`, height: '100%', background: kpi.progressColor || kpi.badgeColor }} />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: kpi.trendColor || '#059669' }}>
                    {kpi.trend || 'Protected'}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: kpi.badgeColor, background: kpi.bg, border: `1px solid ${kpi.border}`, padding: '1px 5px', borderRadius: 4 }}>
                    {kpi.badge} →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cluster 3: Employee Attendance & Live Presence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
              <span style={{ fontSize: 15 }}>👥</span>
              <span>Employee Attendance & Live Presence</span>
              <span style={{ fontSize: 10, fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '1px 7px', borderRadius: 10 }}>12 Key KPIs</span>
            </div>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Live Head Office & 829 Branches (35,000 Employees)</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 10
          }}>
            {workforceKpiCards.map((kpi, idx) => (
              <div
                key={idx}
                className="bs-card"
                role="button"
                tabIndex={0}
                aria-label={`View ${kpi.title} details: ${kpi.value}`}
                onClick={() => handleCardClick(kpi)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(kpi);
                  }
                }}
                style={{
                  margin: 0,
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 6,
                  transition: 'all 0.16s ease',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,23,42,0.08)';
                  e.currentTarget.style.borderColor = kpi.badgeColor;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {kpi.title}
                  </span>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: kpi.bg, border: `1px solid ${kpi.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {kpi.icon}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    {kpi.value}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 500, marginTop: 2 }}>
                    {kpi.sub}
                  </div>
                </div>

                {kpi.progress !== undefined && (
                  <div style={{ width: '100%', height: 3, borderRadius: 2, background: '#f1f5f9', overflow: 'hidden' }}>
                    <div style={{ width: `${kpi.progress}%`, height: '100%', background: kpi.progressColor || kpi.badgeColor }} />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: kpi.trendColor || '#059669' }}>
                    {kpi.trend || 'Live'}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: kpi.badgeColor, background: kpi.bg, border: `1px solid ${kpi.border}`, padding: '1px 5px', borderRadius: 4 }}>
                    {kpi.badge} →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 3: INFRASTRUCTURE HEALTH + BRANCH NETWORK (2 COLUMNS) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
          gap: 14,
          alignItems: 'stretch'
        }}>
          {/* Left Card: Infrastructure Health Dashboard (Requirement 4) */}
          <div className="bs-card" style={{
            margin: 0, padding: 0, display: 'flex', flexDirection: 'column',
            borderRadius: 12, border: '1px solid #e2e8f0', background: '#ffffff',
            overflow: 'hidden', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  Infrastructure Health Dashboard
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                  Hardware terminals, door controllers & clearance policies
                </div>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#ecfdf5', border: '1px solid #a7f3d0',
                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, color: '#059669',
                boxShadow: '0 1px 3px rgba(16, 185, 129, 0.12)'
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#10b981',
                  boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)'
                }} />
                100% Operational
              </div>
            </div>

            {/* Content Micro-cards */}
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
              {/* Item 1: Biometric Terminals */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onNavigateParent && onNavigateParent('dev-reader')}
                style={{
                  background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10,
                  padding: '11px 14px', display: 'flex', flexDirection: 'column', gap: 8,
                  cursor: 'pointer', transition: 'all 0.16s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0d9488'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.transform = 'none'; }}
                title="Click to view Biometric Device List (DEV-02)"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Biometric Terminals</span>
                    <span style={{
                      fontSize: 11, fontWeight: 800, color: '#0d9488', background: '#e6f4f1',
                      border: '1px solid #b2dfdb', padding: '1px 7px', borderRadius: 12
                    }}>1,658 Total</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: '#15803d', background: '#dcfce7',
                      padding: '2px 8px', borderRadius: 12, border: '1px solid #bbf7d0'
                    }}>
                      ● Online: 1,624
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: '#d97706', background: '#fef3c7',
                      padding: '2px 8px', borderRadius: 12, border: '1px solid #fde68a'
                    }}>
                      ● Standby / Servicing: 34
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: 8, borderRadius: 6, background: '#e2e8f0', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: '97.95%', background: 'linear-gradient(90deg, #0d9488 0%, #10b981 100%)', borderRadius: '6px 0 0 6px' }}></div>
                  <div style={{ width: '2.05%', background: '#f59e0b', borderRadius: '0 6px 6px 0' }}></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {['FaceStation F2', 'BioStation 3', 'BioEntry W2'].map(m => (
                      <span key={m} style={{
                        fontSize: 10, fontWeight: 600, color: '#475569', background: '#ffffff',
                        border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: 4
                      }}>{m}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 800, fontFamily: 'monospace' }}>
                    97.95% Availability →
                  </span>
                </div>
              </div>

              {/* Item 2: Door Controllers & Portals */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onNavigateParent && onNavigateParent('access-doors')}
                style={{
                  background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10,
                  padding: '11px 14px', display: 'flex', flexDirection: 'column', gap: 8,
                  cursor: 'pointer', transition: 'all 0.16s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.transform = 'none'; }}
                title="Click to view Access Control Doors & Portals (AC-03)"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Door Controllers & Portals</span>
                    <span style={{
                      fontSize: 11, fontWeight: 800, color: '#0284c7', background: '#e0f2fe',
                      border: '1px solid #bae6fd', padding: '1px 7px', borderRadius: 12
                    }}>1,040 Doors</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateParent) onNavigateParent('access-doorstatus?loop=Normal');
                      }}
                      style={{
                        fontSize: 11, fontWeight: 700, color: '#0369a1', background: '#e0f2fe',
                        padding: '2px 8px', borderRadius: 12, border: '1px solid #bae6fd',
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#bae6fd'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#e0f2fe'; }}
                      title={`Click to view ${liveDoorHealthyCount.toLocaleString()} Normal Healthy Doors`}
                    >
                      ● Healthy: {liveDoorHealthyCount.toLocaleString()}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateParent) onNavigateParent('dev-door');
                      }}
                      style={{
                        fontSize: 11, fontWeight: 800, color: '#b45309', background: '#fef3c7',
                        padding: '2px 9px', borderRadius: 12, border: '1px solid #fde68a',
                        cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(217,119,6,0.15)'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fde68a'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fef3c7'; e.currentTarget.style.transform = 'scale(1)'; }}
                      title={`Click to view ${liveDoorWarningCount} Door Warnings & Held Open Telemetry`}
                    >
                      ● Warning: {liveDoorWarningCount}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: 8, borderRadius: 6, background: '#e2e8f0', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: '98.8%', background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)', borderRadius: '6px 0 0 6px' }}></div>
                  <div style={{ width: '1.2%', background: '#f59e0b', borderRadius: '0 6px 6px 0' }}></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: '#475569', background: '#ffffff',
                    border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: 4
                  }}>
                    1,040 Doors in 829 Branches & Vaults (AC-03)
                  </span>
                  <span style={{ fontSize: 11.5, color: '#0284c7', fontWeight: 800, fontFamily: 'monospace' }}>
                    98.8% Armed & Healthy →
                  </span>
                </div>
              </div>

              {/* Item 3: Access Groups */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onNavigateParent && onNavigateParent('access-group')}
                style={{
                  background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10,
                  padding: '11px 14px', display: 'flex', flexDirection: 'column', gap: 8,
                  cursor: 'pointer', transition: 'all 0.16s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.transform = 'none'; }}
                title="Click to view Access Groups & Clearance Matrix (AC-10)"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Access Clearance Groups</span>
                    <span style={{
                      fontSize: 11, fontWeight: 800, color: '#4338ca', background: '#ede9fe',
                      border: '1px solid #ddd6fe', padding: '1px 7px', borderRadius: 12
                    }}>6 Tiers · 829 Branches</span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#4338ca', background: '#ede9fe',
                    padding: '2px 8px', borderRadius: 12, border: '1px solid #ddd6fe'
                  }}>
                    ● 100% Policy Synchronized
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: 8, borderRadius: 6, background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #0d9488 100%)', borderRadius: 6 }}></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: '#475569', background: '#ffffff',
                    border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: 4
                  }}>
                    Branch · Vault Dual-Custody · ATM & Server Rooms
                  </span>
                  <span style={{ fontSize: 11.5, color: '#0d9488', fontWeight: 800 }}>
                    Active Nationwide →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Branch Network Health (Requirement 5) */}
          <div className="bs-card" style={{
            margin: 0, padding: 0, display: 'flex', flexDirection: 'column',
            borderRadius: 12, border: '1px solid #e2e8f0', background: '#ffffff',
            overflow: 'hidden', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  Branch Network Health
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                  Regional availability across 829 banking locations
                </div>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: '#e0f2fe', border: '1px solid #bae6fd',
                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, color: '#0369a1',
                boxShadow: '0 1px 3px rgba(2, 132, 199, 0.12)'
              }}>
                SLA: 99.35%
              </div>
            </div>

            {/* Regional List */}
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
              {[
                { name: "Dhaka Region",   pct: "99.8%", width: "99.8%", branches: "412 Branches & HO", ping: "0.8ms", color: '#0d9488' },
                { name: "Chattogram",      pct: "98.9%", width: "98.9%", branches: "184 Branches & Port", ping: "1.4ms", color: '#0284c7' },
                { name: "Rajshahi",        pct: "99.5%", width: "99.5%", branches: "128 Branches & Agri", ping: "1.9ms", color: '#6366f1' },
                { name: "Sylhet",          pct: "99.2%", width: "99.2%", branches: "105 Branches & Tea", ping: "2.1ms", color: '#0d9488' },
              ].map((reg, idx) => (
                <div key={idx} style={{
                  background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8,
                  padding: '9px 12px', display: 'flex', flexDirection: 'column', gap: 6,
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: reg.color, boxShadow: `0 0 0 2px ${reg.color}33` }}></span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>{reg.name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#059669', background: '#dcfce7',
                        border: '1px solid #bbf7d0', padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace'
                      }}>
                        {reg.ping}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10.5, color: '#64748b' }}>{reg.branches}</span>
                      <strong style={{
                        fontSize: 12, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace',
                        background: '#ffffff', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: 4
                      }}>
                        {reg.pct}
                      </strong>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{
                      width: reg.width,
                      height: '100%',
                      borderRadius: 3,
                      background: `linear-gradient(90deg, ${reg.color} 0%, #38bdf8 100%)`,
                      transition: 'width 0.4s ease'
                    }}></div>
                  </div>
                </div>
              ))}

              {/* SLA Target Banner */}
              <div style={{
                marginTop: 2,
                padding: '10px 14px',
                background: 'linear-gradient(90deg, #f0fdf4 0%, #ecfdf5 100%)',
                borderRadius: 8,
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#166534', fontWeight: 600 }}>Bank Target SLA: 99.0%</span>
                </div>
                <span style={{ color: '#15803d', fontWeight: 800, background: '#ffffff', padding: '2px 8px', borderRadius: 12, border: '1px solid #86efac' }}>
                  ✓ Exceeds SLA (+0.35%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: LONGITUDINAL TRENDS & BRANCH EXCEPTION ANALYTICS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
              <span>Longitudinal Analytics & Exception Reporting</span>
              <span style={{ fontSize: 10, fontWeight: 700, background: '#e0e7ff', color: '#4338ca', padding: '1px 7px', borderRadius: 10 }}>4 Key Reporting Modules</span>
            </div>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>30-Day Rolling Window · 829 Branches Nationwide</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(430px, 1fr))',
            gap: 14,
            alignItems: 'stretch'
          }}>
            {/* Card 1: 30 Day Attendance Trend */}
            <div className="bs-card" style={{
              margin: 0, padding: 0, display: 'flex', flexDirection: 'column',
              borderRadius: 12, border: '1px solid #e2e8f0', background: '#ffffff',
              overflow: 'hidden', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 18px', borderBottom: '1px solid #f1f5f9',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                    30 Day Attendance Trend
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                    Daily biometric punch compliance across 829 branches
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: '#047857', background: '#d1fae5',
                  border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: 20
                }}>
                  Avg: 97.4%
                </span>
              </div>

              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { label: '30-Day Average', val: '97.4%', color: '#059669' },
                    { label: 'Peak (Sep 14)', val: '98.8%', color: '#0284c7' },
                    { label: 'Lowest (Sep 03)', val: '96.1%', color: '#d97706' },
                    { label: 'Active Branches', val: '829 / 829', color: '#0f172a' }
                  ].map((s, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 6, padding: '7px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: 'monospace', marginTop: 2 }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* SVG Attendance Trend Curve (Styled like Authentication & Security Overview Graph) */}
                <div style={{ width: '100%', height: 135, background: 'linear-gradient(145deg, #090e17 0%, #0c1527 50%, #050811 100%)', borderRadius: 8, border: '1px solid rgba(16, 185, 129, 0.28)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)', padding: '8px 10px', position: 'relative', overflow: 'hidden' }}>
                  <svg viewBox="0 0 460 115" style={{ width: '100%', height: '100%', display: 'block' }}>
                    <defs>
                      <linearGradient id="attTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                        <stop offset="60%" stopColor="#059669" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="attLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="50%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <filter id="attGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.5" />
                      </filter>
                    </defs>

                    {/* Horizontal Gridlines */}
                    {[22, 52, 82].map((y, i) => (
                      <line key={i} x1="30" y1={y} x2="445" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3,3" />
                    ))}
                    <text x="6" y="25" fill="#7dd3fc" fontSize="8.5" fontWeight="600" fontFamily="monospace">99%</text>
                    <text x="6" y="55" fill="#94a3b8" fontSize="8.5" fontWeight="500" fontFamily="monospace">97%</text>
                    <text x="6" y="85" fill="#94a3b8" fontSize="8.5" fontWeight="500" fontFamily="monospace">95%</text>

                    {/* Shaded Area */}
                    <path
                      d="M 35 68 C 65 60, 95 48, 125 55 C 155 42, 185 30, 215 38 C 245 45, 275 22, 305 32 C 335 40, 365 28, 395 34 C 420 30, 435 38, 445 42 L 445 95 L 35 95 Z"
                      fill="url(#attTrendGrad)"
                    />
                    {/* Glowing Spline Line */}
                    <path
                      d="M 35 68 C 65 60, 95 48, 125 55 C 155 42, 185 30, 215 38 C 245 45, 275 22, 305 32 C 335 40, 365 28, 395 34 C 420 30, 435 38, 445 42"
                      fill="none"
                      stroke="url(#attLineGrad)"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      filter="url(#attGlow)"
                    />
                    {/* Key points with Halo */}
                    {[[35, 68], [125, 55], [215, 38], [305, 32], [395, 34], [445, 42]].map(([cx, cy], i) => (
                      <g key={i}>
                        <circle cx={cx} cy={cy} r="5" fill="rgba(16, 185, 129, 0.25)" />
                        <circle cx={cx} cy={cy} r="3" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                      </g>
                    ))}
                    {/* X Axis Labels */}
                    <text x="35" y="110" fill="#64748b" fontSize="8" fontFamily="monospace">Sep 01</text>
                    <text x="120" y="110" fill="#64748b" fontSize="8" fontFamily="monospace">Sep 07</text>
                    <text x="210" y="110" fill="#64748b" fontSize="8" fontFamily="monospace">Sep 14</text>
                    <text x="300" y="110" fill="#64748b" fontSize="8" fontFamily="monospace">Sep 21</text>
                    <text x="390" y="110" fill="#64748b" fontSize="8" fontFamily="monospace">Sep 28</text>
                    <text x="428" y="110" fill="#34d399" fontSize="8" fontWeight="bold" fontFamily="monospace">Today</text>
                  </svg>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: '#64748b' }}>Bank-wide target: 95.0% SLA attendance</span>
                  <button
                    onClick={() => onNavigateParent && onNavigateParent('att-monthly')}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, fontSize: 11, cursor: 'pointer', padding: 0 }}
                  >
                    View 30-Day Roster (ATT-01) →
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: 30 Day Security Incident Trend */}
            <div className="bs-card" style={{
              margin: 0, padding: 0, display: 'flex', flexDirection: 'column',
              borderRadius: 12, border: '1px solid #e2e8f0', background: '#ffffff',
              overflow: 'hidden', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 18px', borderBottom: '1px solid #f1f5f9',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                    30 Day Security Incident Trend
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                    Forced door, tamper, held open warnings & APB breaches
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: '#059669', background: '#ecfdf5',
                  border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: 20
                }}>
                  -68% Incident Drop
                </span>
              </div>

              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { label: 'Total Incidents', val: '118', color: '#ea580c' },
                    { label: 'Auto-Resolved', val: '116 (98.3%)', color: '#059669' },
                    { label: 'Critical Alarms', val: '0 Open', color: '#059669' },
                    { label: 'Resolution MTTR', val: '4.2 mins', color: '#0284c7' }
                  ].map((s, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 6, padding: '7px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: 'monospace', marginTop: 2 }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* SVG Security Incident Trend Curve (Styled like Authentication & Security Overview Graph) */}
                <div style={{ width: '100%', height: 135, background: 'linear-gradient(145deg, #090e17 0%, #0c1527 50%, #050811 100%)', borderRadius: 8, border: '1px solid rgba(234, 88, 12, 0.28)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)', padding: '8px 10px', position: 'relative', overflow: 'hidden' }}>
                  <svg viewBox="0 0 460 115" style={{ width: '100%', height: '100%', display: 'block' }}>
                    <defs>
                      <linearGradient id="secTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
                        <stop offset="60%" stopColor="#c2410c" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#c2410c" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="secLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="50%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                      <filter id="secGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#f97316" floodOpacity="0.5" />
                      </filter>
                    </defs>

                    {/* Horizontal Gridlines */}
                    {[22, 52, 82].map((y, i) => (
                      <line key={i} x1="30" y1={y} x2="445" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3,3" />
                    ))}
                    <text x="8" y="25" fill="#fdba74" fontSize="8.5" fontWeight="600" fontFamily="monospace">15</text>
                    <text x="8" y="55" fill="#94a3b8" fontSize="8.5" fontWeight="500" fontFamily="monospace">8</text>
                    <text x="8" y="85" fill="#94a3b8" fontSize="8.5" fontWeight="500" fontFamily="monospace">0</text>

                    {/* Shaded Area */}
                    <path
                      d="M 35 25 C 65 30, 95 38, 125 45 C 155 52, 185 60, 215 65 C 245 62, 275 70, 305 75 C 335 78, 365 74, 395 82 C 420 84, 435 83, 445 84 L 445 95 L 35 95 Z"
                      fill="url(#secTrendGrad)"
                    />
                    {/* Glowing Spline Line */}
                    <path
                      d="M 35 25 C 65 30, 95 38, 125 45 C 155 52, 185 60, 215 65 C 245 62, 275 70, 305 75 C 335 78, 365 74, 395 82 C 420 84, 435 83, 445 84"
                      fill="none"
                      stroke="url(#secLineGrad)"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      filter="url(#secGlow)"
                    />
                    {/* Key points with Halo */}
                    {[[35, 25], [125, 45], [215, 65], [305, 75], [395, 82], [445, 84]].map(([cx, cy], i) => (
                      <g key={i}>
                        <circle cx={cx} cy={cy} r="5" fill="rgba(249, 115, 22, 0.25)" />
                        <circle cx={cx} cy={cy} r="3" fill="#ffffff" stroke="#f97316" strokeWidth="2" />
                      </g>
                    ))}
                    {/* X Axis Labels */}
                    <text x="35" y="110" fill="#64748b" fontSize="8" fontFamily="monospace">Sep 01</text>
                    <text x="120" y="110" fill="#64748b" fontSize="8" fontFamily="monospace">Sep 07</text>
                    <text x="210" y="110" fill="#64748b" fontSize="8" fontFamily="monospace">Sep 14</text>
                    <text x="300" y="110" fill="#64748b" fontSize="8" fontFamily="monospace">Sep 21</text>
                    <text x="390" y="110" fill="#64748b" fontSize="8" fontFamily="monospace">Sep 28</text>
                    <text x="428" y="110" fill="#fdba74" fontSize="8" fontWeight="bold" fontFamily="monospace">Today</text>
                  </svg>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: '#64748b' }}>Zero unresolved vault or door breaches</span>
                  <button
                    onClick={() => onNavigateParent && onNavigateParent('soc-alarm')}
                    style={{ background: 'none', border: 'none', color: '#ea580c', fontWeight: 700, fontSize: 11, cursor: 'pointer', padding: 0 }}
                  >
                    Open SOC Alarm Station →
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Top Branches with Attendance Exceptions */}
            <div className="bs-card" style={{
              margin: 0, padding: 0, display: 'flex', flexDirection: 'column',
              borderRadius: 12, border: '1px solid #e2e8f0', background: '#ffffff',
              overflow: 'hidden', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 18px', borderBottom: '1px solid #f1f5f9',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                    Top Branches with Attendance Exceptions
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                    Highest occurrence of late arrivals, early exits & missing punches
                  </div>
                </div>
                <button
                  onClick={() => onNavigateParent && onNavigateParent('att-exception')}
                  style={{
                    fontSize: 11, fontWeight: 700, color: '#b45309', background: '#fef3c7',
                    border: '1px solid #fde68a', padding: '3px 10px', borderRadius: 20, cursor: 'pointer'
                  }}
                >
                  View All Hub →
                </button>
              </div>

              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                {[
                  { branch: 'Motijheel Corporate Branch', region: 'Dhaka Division', staff: 120, totalEx: 14, late: 8, missing: 4, awl: 2, attPct: '88.3%', barColor: '#d97706' },
                  { branch: 'Gulshan Corporate Branch', region: 'Dhaka Division', staff: 85, totalEx: 11, late: 6, missing: 2, awl: 3, attPct: '87.1%', barColor: '#f59e0b' },
                  { branch: 'Agrabad Corporate Branch', region: 'Chattogram Division', staff: 95, totalEx: 9, late: 5, missing: 3, awl: 1, attPct: '90.5%', barColor: '#d97706' },
                  { branch: 'Sylhet Main Branch', region: 'Sylhet Division', staff: 72, totalEx: 8, late: 4, missing: 3, awl: 1, attPct: '88.9%', barColor: '#f59e0b' },
                  { branch: 'Uttara Branch, Dhaka', region: 'Dhaka Division', staff: 64, totalEx: 6, late: 4, missing: 2, awl: 0, attPct: '90.6%', barColor: '#eab308' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={0}
                    onClick={() => onNavigateParent && onNavigateParent(`att-exception?branch=${encodeURIComponent(item.branch)}`)}
                    style={{
                      background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8,
                      padding: '9px 12px', display: 'flex', flexDirection: 'column', gap: 6,
                      cursor: 'pointer', transition: 'all 0.16s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#d97706'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{idx + 1}. {item.branch}</span>
                        <span style={{ fontSize: 10, color: '#64748b' }}>({item.region})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: '#b45309', background: '#fef3c7',
                          border: '1px solid #fde68a', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace'
                        }}>
                          {item.totalEx} Exceptions
                        </span>
                        <strong style={{ fontSize: 11.5, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                          {item.attPct}
                        </strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: '#64748b' }}>
                      <span>Late: <strong style={{ color: '#d97706' }}>{item.late}</strong> · Missing Punch: <strong style={{ color: '#f59e0b' }}>{item.missing}</strong> · AWL: <strong style={{ color: '#dc2626' }}>{item.awl}</strong></span>
                      <span>{item.staff} Total Staff</span>
                    </div>

                    <div style={{ width: '100%', height: 4, borderRadius: 2, background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ width: `${(item.totalEx / 15) * 100}%`, height: '100%', background: item.barColor, borderRadius: 2 }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: Top Branches with Security Events */}
            <div className="bs-card" style={{
              margin: 0, padding: 0, display: 'flex', flexDirection: 'column',
              borderRadius: 12, border: '1px solid #e2e8f0', background: '#ffffff',
              overflow: 'hidden', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 18px', borderBottom: '1px solid #f1f5f9',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                    Top Branches with Security Events
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                    Door held open warnings, denied access & tamper alerts
                  </div>
                </div>
                <button
                  onClick={() => onNavigateParent && onNavigateParent('branch-scorecard')}
                  style={{
                    fontSize: 11, fontWeight: 700, color: '#059669', background: '#dcfce7',
                    border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: 20, cursor: 'pointer'
                  }}
                >
                  Scorecard →
                </button>
              </div>

              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                {[
                  { branch: 'Principal Branch, Motijheel', region: 'Dhaka Corporate Hub', totalEvt: 7, held: 3, denied: 2, tailgate: 2, status: 'Resolved', score: '97.5%' },
                  { branch: 'Khatunganj Commercial Branch', region: 'Chattogram Commercial Zone', totalEvt: 5, held: 2, denied: 2, tailgate: 1, status: 'Monitored', score: '98.1%' },
                  { branch: 'Kawran Bazar Branch', region: 'Dhaka Media & Trade Hub', totalEvt: 4, held: 1, denied: 2, tailgate: 1, status: 'Resolved', score: '98.6%' },
                  { branch: 'Bogura Main Branch', region: 'Rajshahi Commercial Area', totalEvt: 3, held: 1, denied: 2, tailgate: 0, status: 'Resolved', score: '99.0%' },
                  { branch: 'Mirpur Branch, Dhaka', region: 'Dhaka Retail Zone', totalEvt: 3, held: 2, denied: 1, tailgate: 0, status: 'Resolved', score: '98.8%' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={0}
                    onClick={() => onNavigateParent && onNavigateParent(`soc-alarm?branch=${encodeURIComponent(item.branch)}`)}
                    style={{
                      background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8,
                      padding: '9px 12px', display: 'flex', flexDirection: 'column', gap: 6,
                      cursor: 'pointer', transition: 'all 0.16s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{idx + 1}. {item.branch}</span>
                        <span style={{ fontSize: 10, color: '#64748b' }}>({item.region})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: '#b91c1c', background: '#fee2e2',
                          border: '1px solid #fecaca', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace'
                        }}>
                          {item.totalEvt} Events
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: item.status === 'Resolved' ? '#15803d' : '#0369a1',
                          background: item.status === 'Resolved' ? '#dcfce7' : '#e0f2fe',
                          padding: '1px 6px', borderRadius: 10
                        }}>
                          ● {item.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: '#64748b' }}>
                      <span>Door Held: <strong style={{ color: '#d97706' }}>{item.held}</strong> · Denied: <strong style={{ color: '#ea580c' }}>{item.denied}</strong> · Tailgate: <strong style={{ color: '#8b5cf6' }}>{item.tailgate}</strong></span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#059669' }}>Score: {item.score}</span>
                    </div>

                    <div style={{ width: '100%', height: 4, borderRadius: 2, background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ width: `${(item.totalEvt / 10) * 100}%`, height: '100%', background: '#ef4444', borderRadius: 2 }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. REPORT HUB (Slides 02, 04, 08)
  const renderReportHub = () => (
    <div>
      {/* 4 Main Circular Buttons */}
      <div className="pdf-cat-grid">
        {/* User Report */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            className="pdf-cat-btn"
            onClick={() => setCurrentView('userReport')}
            title="Open User Report (Slide 03)"
          >
            <div className="pdf-cat-ring">
              {SVG_ICONS.userReport}
            </div>
            <span className="pdf-cat-label">User Report</span>
          </button>
          {calloutTarget === 'user' && (
            <div className="pdf-callout-up" style={{ marginTop: 8 }}>
              <span>↑</span>
              <span>Click to User Report</span>
            </div>
          )}
        </div>

        {/* Access Report */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            className="pdf-cat-btn"
            onClick={() => setCurrentView('accessReport')}
            title="Open Access Report (Slides 05 & 06)"
          >
            <div className="pdf-cat-ring">
              {SVG_ICONS.accessReport}
            </div>
            <span className="pdf-cat-label">Access Report</span>
          </button>
          {calloutTarget === 'access' && (
            <div className="pdf-callout-up" style={{ marginTop: 8 }}>
              <span>↑</span>
              <span>Click to Access Report</span>
            </div>
          )}
        </div>

        {/* Device Report */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            className="pdf-cat-btn"
            onClick={() => setCurrentView('deviceReport')}
            title="Open Device Report (Slides 09 & 10)"
          >
            <div className="pdf-cat-ring">
              {SVG_ICONS.deviceReport}
            </div>
            <span className="pdf-cat-label">Device Report</span>
          </button>
          {calloutTarget === 'device' && (
            <div className="pdf-callout-up" style={{ marginTop: 8 }}>
              <span>↑</span>
              <span>Click to Device Report</span>
            </div>
          )}
        </div>

        {/* Door Report */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            className="pdf-cat-btn"
            onClick={() => setCurrentView('doorReport')}
            title="Open Door Report (Slide 07)"
          >
            <div className="pdf-cat-ring">
              {SVG_ICONS.doorReport}
            </div>
            <span className="pdf-cat-label">Door Report</span>
          </button>
        </div>

        {/* Custom Report Builder */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button
            className="pdf-cat-btn"
            onClick={() => {
              if (onNavigateParent) onNavigateParent('reports-custom');
              else setCurrentView('customReport');
            }}
            title="Open Tender Custom Report Builder"
          >
            <div className="pdf-cat-ring" style={{ borderColor: '#0d9488' }}>
              {SVG_ICONS.customReport}
            </div>
            <span className="pdf-cat-label" style={{ color: '#0f766e', fontWeight: 800 }}>Custom Builder</span>
          </button>
        </div>
      </div>

    </div>
  );

  // 3. USER REPORT VIEW (Slide 03)
  const renderUserReport = () => {
    let filtered = PDF_USER_RECORDS;
    if (activeFilter !== 'all') {
      filtered = filtered.filter(u => u.category.toLowerCase().includes(activeFilter.toLowerCase()));
    }
    if (userFilterDept !== 'All') {
      filtered = filtered.filter(u => u.department === userFilterDept);
    }
    if (userFilterBranch !== 'All') {
      filtered = filtered.filter(u => u.branch === userFilterBranch || u.category === userFilterBranch);
    }
    if (userFilterBio !== 'All') {
      if (userFilterBio === 'FP') filtered = filtered.filter(u => u.fingerprint);
      else if (userFilterBio === 'Card') filtered = filtered.filter(u => u.card);
      else if (userFilterBio === 'Dual') filtered = filtered.filter(u => u.fingerprint && u.card);
    }
    if (userFilterStatus !== 'All') {
      filtered = filtered.filter(u => u.status === userFilterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.branch.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    }

    const hasActiveFilters = activeFilter !== 'all' || userFilterDept !== 'All' || userFilterBranch !== 'All' || userFilterBio !== 'All' || userFilterStatus !== 'All' || searchQuery.trim() !== '';
    const depts = ['All', ...new Set(PDF_USER_RECORDS.map(u => u.department))];
    const branches = ['All', ...new Set(PDF_USER_RECORDS.map(u => u.branch))];

    return (
      <div>
        {/* 5 Circular Sub-Category Buttons from Slide 03 */}
        <div className="pdf-cat-grid">
          <button className="pdf-cat-btn" onClick={() => setActiveFilter('all')}>
            <div className={`pdf-cat-ring ${activeFilter === 'all' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.group}
            </div>
            <span className="pdf-cat-label">Group Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Branch')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Branch' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.branch}
            </div>
            <span className="pdf-cat-label">Branch Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Sub-Branch')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Sub-Branch' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.subBranch}
            </div>
            <span className="pdf-cat-label">Sub-Br. Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('RO')}>
            <div className={`pdf-cat-ring ${activeFilter === 'RO' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.ro}
            </div>
            <span className="pdf-cat-label">RO Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Head Office')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Head Office' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.ho}
            </div>
            <span className="pdf-cat-label">Head Office Report</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="table-card" style={{ marginTop: 14 }}>
          {/* Enhanced Multi-Attribute Filter Toolbar */}
          <div style={{
            padding: '12px 16px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                  {activeFilter === 'all' ? 'All User Groups' : `${activeFilter} Users`}
                </span>
                <span className="record-counter" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700, padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>
                  {filtered.length} Enrolled Staff
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="bs-btn bs-btn-outline bs-btn-sm"
                  onClick={() => handleExportCsv('Pubali_User_Report.csv', filtered)}
                  title="Export filtered records to CSV"
                >
                  Download CSV
                </button>
                <button className="bs-btn bs-btn-outline bs-btn-sm" onClick={() => window.print()}>
                  Print PDF
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllReportFilters}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 4,
                      border: '1px solid #fca5a5',
                      background: '#fef2f2',
                      color: '#b91c1c',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Reset All
                  </button>
                )}
              </div>
            </div>

            {/* Filter Controls Row */}
            <div style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
              background: '#f8fafc',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
                <input
                  className="bs-input"
                  style={{ width: '100%', height: 30, paddingLeft: 28, fontSize: 12, boxSizing: 'border-box' }}
                  placeholder="Search staff, ID, branch, dept..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }}>
                  🔍
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Department:</label>
                <select
                  value={userFilterDept}
                  onChange={e => setUserFilterDept(e.target.value)}
                  style={{ height: 30, padding: '2px 8px', borderRadius: 5, border: '1px solid #cbd5e1', fontSize: 11.5, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  {depts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Branch/Site:</label>
                <select
                  value={userFilterBranch}
                  onChange={e => setUserFilterBranch(e.target.value)}
                  style={{ height: 30, padding: '2px 8px', borderRadius: 5, border: '1px solid #cbd5e1', fontSize: 11.5, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  {branches.map(b => <option key={b} value={b}>{b === 'All' ? 'All Branches/Sites' : b}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Biometrics:</label>
                <select
                  value={userFilterBio}
                  onChange={e => setUserFilterBio(e.target.value)}
                  style={{ height: 30, padding: '2px 8px', borderRadius: 5, border: '1px solid #cbd5e1', fontSize: 11.5, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="All">All Types</option>
                  <option value="Dual">Dual (FP + Card)</option>
                  <option value="FP">Fingerprint Only</option>
                  <option value="Card">Smart Card Only</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Status:</label>
                <select
                  value={userFilterStatus}
                  onChange={e => setUserFilterStatus(e.target.value)}
                  style={{ height: 30, padding: '2px 8px', borderRadius: 5, border: '1px solid #cbd5e1', fontSize: 11.5, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          <table className="bs-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Branch / Location</th>
                <th>Category</th>
                <th>Biometric Enrollment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.department}</td>
                  <td>{u.branch}</td>
                  <td><span className="bs-badge bs-badge-blue">{u.category}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <span className={`badge ${u.fingerprint ? 'b-on' : 'b-off'}`} title="Fingerprint Enrolled">FP</span>
                      <span className={`badge ${u.card ? 'b-on' : 'b-off'}`} title="Smart Card Issued">Card</span>
                    </div>
                  </td>
                  <td>
                    <span className={`bs-badge ${u.status === 'Active' ? 'bs-badge-green' : 'bs-badge-red'}`}>
                      <span className={`bs-dot ${u.status === 'Active' ? 'bs-dot-green' : 'bs-dot-red'}`}></span>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="bs-empty" style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
              <span>No user records match the selected filter criteria.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 4. ACCESS REPORT & ARCHITECTURE (Slides 05 & 06)
  const renderAccessReport = () => {
    let filtered = PDF_ACCESS_GROUPS;
    if (activeFilter !== 'all') {
      filtered = filtered.filter(g => g.category.toLowerCase().includes(activeFilter.toLowerCase()));
    }
    if (accessFilterLevel !== 'All') {
      filtered = filtered.filter(g => g.accessLevel.includes(accessFilterLevel));
    }
    if (accessFilterFloor !== 'All') {
      filtered = filtered.filter(g => g.floorLevel.toLowerCase().includes(accessFilterFloor.toLowerCase()));
    }
    if (accessFilterSchedule !== 'All') {
      filtered = filtered.filter(g => g.schedule.toLowerCase().includes(accessFilterSchedule.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.accessLevel.toLowerCase().includes(q) ||
        g.branch.toLowerCase().includes(q) ||
        g.schedule.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q)
      );
    }

    const hasActiveFilters = activeFilter !== 'all' || accessFilterLevel !== 'All' || accessFilterFloor !== 'All' || accessFilterSchedule !== 'All' || searchQuery.trim() !== '';

    return (
      <div>
        {/* 5 Circular Sub-Category Buttons from Slide 05 */}
        <div className="pdf-cat-grid">
          <button className="pdf-cat-btn" onClick={() => setActiveFilter('all')}>
            <div className={`pdf-cat-ring ${activeFilter === 'all' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.group}
            </div>
            <span className="pdf-cat-label">All Access Group Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Branch')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Branch' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.branch}
            </div>
            <span className="pdf-cat-label">Branch Wise Access Group</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Sub-Branch')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Sub-Branch' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.subBranch}
            </div>
            <span className="pdf-cat-label">Sub-Branch Wise Access Group</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Regional Office')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Regional Office' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.ro}
            </div>
            <span className="pdf-cat-label">Region Wise Access Group</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Head Office')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Head Office' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.ho}
            </div>
            <span className="pdf-cat-label">Head Office Access Group</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="table-card" style={{ marginTop: 14 }}>
          {/* Enhanced Multi-Attribute Filter Toolbar */}
          <div style={{
            padding: '12px 16px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                  {activeFilter === 'all' ? 'All Access Groups' : `${activeFilter} Access Groups`}
                </span>
                <span className="record-counter" style={{ background: '#ede9fe', color: '#6d28d9', fontWeight: 700, padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>
                  {filtered.length} Configured Groups
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="bs-btn bs-btn-outline bs-btn-sm"
                  onClick={() => handleExportCsv('Pubali_Access_Groups.csv', filtered)}
                  title="Export filtered records to CSV"
                >
                  Download CSV
                </button>
                <button className="bs-btn bs-btn-outline bs-btn-sm" onClick={() => window.print()}>
                  Print PDF
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllReportFilters}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 4,
                      border: '1px solid #fca5a5',
                      background: '#fef2f2',
                      color: '#b91c1c',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Reset All
                  </button>
                )}
              </div>
            </div>

            {/* Filter Controls Row */}
            <div style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
              background: '#f8fafc',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
                <input
                  className="bs-input"
                  style={{ width: '100%', height: 30, paddingLeft: 28, fontSize: 12, boxSizing: 'border-box' }}
                  placeholder="Search group name, level, schedule..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }}>
                  🔍
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Access Level:</label>
                <select
                  value={accessFilterLevel}
                  onChange={e => setAccessFilterLevel(e.target.value)}
                  style={{ height: 30, padding: '2px 8px', borderRadius: 5, border: '1px solid #cbd5e1', fontSize: 11.5, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="All">All Access Levels</option>
                  <option value="Level 5">Level 5 (Unrestricted / Vault)</option>
                  <option value="Level 4">Level 4 (MFA / Restricted)</option>
                  <option value="Level 3">Level 3 (Supervisory / Facilities)</option>
                  <option value="Level 2">Level 2 (Standard)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Floor/Zone:</label>
                <select
                  value={accessFilterFloor}
                  onChange={e => setAccessFilterFloor(e.target.value)}
                  style={{ height: 30, padding: '2px 8px', borderRadius: 5, border: '1px solid #cbd5e1', fontSize: 11.5, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="All">All Floors/Partitions</option>
                  <option value="All Floors">All Floors</option>
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="Floor 1">Floor 1 Secure Zone</option>
                  <option value="Basement">Basement & Server Room</option>
                  <option value="Floors 1-3">Floors 1-3 (Regional)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Schedule:</label>
                <select
                  value={accessFilterSchedule}
                  onChange={e => setAccessFilterSchedule(e.target.value)}
                  style={{ height: 30, padding: '2px 8px', borderRadius: 5, border: '1px solid #cbd5e1', fontSize: 11.5, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="All">All Schedules</option>
                  <option value="24 Hours">24/7 Unrestricted</option>
                  <option value="Mon-Fri">Mon-Fri Banking Hours</option>
                  <option value="Mon-Sat">Mon-Sat Extended Hours</option>
                  <option value="Pre-approved">Pre-approved Window</option>
                </select>
              </div>
            </div>
          </div>

          <table className="bs-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Group ID</th>
                <th>Access Group Name</th>
                <th>Category</th>
                <th>Access Level</th>
                <th>Doors</th>
                <th>Floor Partition</th>
                <th>Schedule</th>
                <th>Enrolled Users</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{g.id}</td>
                  <td style={{ fontWeight: 600 }}>{g.name}</td>
                  <td><span className="bs-badge bs-badge-blue">{g.category}</span></td>
                  <td><span className="bs-badge bs-badge-amber">{g.accessLevel}</span></td>
                  <td style={{ fontWeight: 600 }}>{g.doorsCount} Doors</td>
                  <td>{g.floorLevel}</td>
                  <td style={{ fontSize: 11, color: '#6b7280' }}>{g.schedule}</td>
                  <td style={{ fontWeight: 700, color: '#0d9488' }}>{g.activeUsers}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="bs-empty" style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
              <span>No access groups match the selected filter criteria.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 5. DOOR REPORT & DUAL ROLE (Slide 07 & Door Requirements)
  const renderDoorReport = () => {
    let filtered = PDF_DOOR_RECORDS;
    if (activeFilter !== 'all') {
      const f = activeFilter.toLowerCase();
      if (f === 'branch') {
        filtered = filtered.filter(d => d.category === 'Branch');
      } else if (f === 'sub-branch') {
        filtered = filtered.filter(d => d.category === 'Sub-Branch');
      } else if (f === 'regional office' || f === 'ro') {
        filtered = filtered.filter(d => d.category === 'Regional Office' || d.category === 'RO');
      } else if (f === 'head office') {
        filtered = filtered.filter(d => d.category === 'Head Office');
      } else if (f === 'attendance') {
        filtered = filtered.filter(d => d.system === 'Attendance' || d.purpose.toLowerCase().includes('attn'));
      } else if (f === 'access control') {
        filtered = filtered.filter(d => d.system === 'Access Control' || d.purpose.toLowerCase().includes('acs'));
      } else if (f === 'vault') {
        filtered = filtered.filter(d => (d.doorRequirement && d.doorRequirement.toLowerCase().includes('vault')) || d.name.toLowerCase().includes('vault') || d.purpose.toLowerCase().includes('vault') || (d.securityLevel && d.securityLevel.includes('Level 5')));
      } else if (f === 'alarm') {
        filtered = filtered.filter(d => d.alarmStatus !== 'Normal' || d.state === 'Alarm' || d.lockStatus.toLowerCase().includes('alarm') || d.lockStatus.toLowerCase().includes('alert'));
      } else {
        filtered = filtered.filter(d =>
          d.system.toLowerCase().includes(f) ||
          d.category.toLowerCase().includes(f) ||
          d.purpose.toLowerCase().includes(f) ||
          (d.doorRequirement && d.doorRequirement.toLowerCase().includes(f))
        );
      }
    }
    if (doorFilterReq !== 'All') {
      filtered = filtered.filter(d => d.doorRequirement?.toLowerCase().includes(doorFilterReq.toLowerCase()));
    }
    if (doorFilterSystem !== 'All') {
      filtered = filtered.filter(d => d.system === doorFilterSystem);
    }
    if (doorFilterLockState !== 'All') {
      if (doorFilterLockState === 'Locked') filtered = filtered.filter(d => d.lockStatus.includes('Locked'));
      else if (doorFilterLockState === 'Dual') filtered = filtered.filter(d => d.lockStatus.includes('Dual') || d.lockStatus.includes('Interlock'));
      else if (doorFilterLockState === 'Pass-thru') filtered = filtered.filter(d => d.lockStatus.includes('Pass-thru'));
      else if (doorFilterLockState === 'Alarm') filtered = filtered.filter(d => d.alarmStatus !== 'Normal' || d.state === 'Alarm');
    }
    if (doorFilterReader !== 'All') {
      filtered = filtered.filter(d => d.readerIn?.toLowerCase().includes(doorFilterReader.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.branch.toLowerCase().includes(q) ||
        d.purpose.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        (d.doorRequirement && d.doorRequirement.toLowerCase().includes(q))
      );
    }

    const hasActiveFilters = activeFilter !== 'all' || doorFilterReq !== 'All' || doorFilterSystem !== 'All' || doorFilterLockState !== 'All' || doorFilterReader !== 'All' || searchQuery.trim() !== '';

    return (
      <div>
        {/* ── 9 CIRCULAR SUB-CATEGORY BUTTONS (Matching Figure 05 & 09 Photo Style) ── */}
        <div className="pdf-cat-grid">
          <button className="pdf-cat-btn" onClick={() => setActiveFilter('all')}>
            <div className={`pdf-cat-ring ${activeFilter === 'all' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.allDoors}
            </div>
            <span className="pdf-cat-label">All Door Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Branch')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Branch' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.branch}
            </div>
            <span className="pdf-cat-label">Branch Wise Door Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Sub-Branch')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Sub-Branch' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.subBranch}
            </div>
            <span className="pdf-cat-label">Sub-Branch Wise Door</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Regional Office')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Regional Office' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.ro}
            </div>
            <span className="pdf-cat-label">Region Wise Door Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Head Office')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Head Office' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.ho}
            </div>
            <span className="pdf-cat-label">Head Office Door Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Attendance')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Attendance' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.doorAttendance}
            </div>
            <span className="pdf-cat-label">Attendance Door Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Access Control')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Access Control' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.doorAcs}
            </div>
            <span className="pdf-cat-label">ACS Door Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Vault')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Vault' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.doorVault}
            </div>
            <span className="pdf-cat-label">Vault & Security Doors</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Alarm')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Alarm' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.doorAlarm}
            </div>
            <span className="pdf-cat-label">Door Status & Alarms</span>
          </button>
        </div>

        {/* ── BANKING SECURITY DIRECTIVES & DOOR REQUIREMENTS STRIP ── */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🛡️</span>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                Bangladesh Bank Physical & Cyber Security Door Directives Compliance
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                Dual-Custody Vault Interlocks · Anti-Tailgating Mantrap Integration · Fail-Secure Fail-Safe Emergency Fire Linkage
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="bs-badge bs-badge-green"><span className="bs-dot bs-dot-green"></span>CoreStation CS-40 Relays Armed</span>
            <span className="bs-badge bs-badge-blue">MFA Fingerprint + Smart Card Auth</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-card" style={{ marginTop: 14 }}>
          {/* Enhanced Multi-Attribute Filter Toolbar */}
          <div style={{
            padding: '12px 16px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                  {activeFilter === 'all' ? 'All Monitored Doors' : `${activeFilter} Monitored Doors`}
                </span>
                <span className="record-counter" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>
                  {filtered.length} Configured Points
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="bs-btn bs-btn-outline bs-btn-sm"
                  onClick={() => handleExportCsv('Pubali_Door_Report.csv', filtered)}
                  title="Export filtered records to CSV"
                >
                  Download CSV
                </button>
                <button className="bs-btn bs-btn-outline bs-btn-sm" onClick={() => window.print()}>
                  Print PDF
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllReportFilters}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 4,
                      border: '1px solid #fca5a5',
                      background: '#fef2f2',
                      color: '#b91c1c',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Reset All
                  </button>
                )}
              </div>
            </div>

            {/* Filter Controls Row */}
            <div style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
              background: '#f8fafc',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
                <input
                  className="bs-input"
                  style={{ width: '100%', height: 30, paddingLeft: 28, fontSize: 12, boxSizing: 'border-box' }}
                  placeholder="Search door ID, name, requirement..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }}>
                  🔍
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Requirement:</label>
                <select
                  value={doorFilterReq}
                  onChange={e => setDoorFilterReq(e.target.value)}
                  style={{ height: 30, padding: '2px 8px', borderRadius: 5, border: '1px solid #cbd5e1', fontSize: 11.5, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="All">All Requirements</option>
                  <option value="Perimeter">Main Perimeter ACS</option>
                  <option value="Vault">Vault & High Security</option>
                  <option value="Attendance">Attendance Checkpoint</option>
                  <option value="Mantrap">Cash Mantrap / Interlock</option>
                  <option value="Gate">High-Security Gate</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>System Role:</label>
                <select
                  value={doorFilterSystem}
                  onChange={e => setDoorFilterSystem(e.target.value)}
                  style={{ height: 30, padding: '2px 8px', borderRadius: 5, border: '1px solid #cbd5e1', fontSize: 11.5, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="All">All Systems</option>
                  <option value="Access Control">Access Control (ACS)</option>
                  <option value="Attendance">Time Attendance</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Lock State:</label>
                <select
                  value={doorFilterLockState}
                  onChange={e => setDoorFilterLockState(e.target.value)}
                  style={{ height: 30, padding: '2px 8px', borderRadius: 5, border: '1px solid #cbd5e1', fontSize: 11.5, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="All">All States</option>
                  <option value="Locked">Locked (Normal)</option>
                  <option value="Dual">Dual-Auth / Interlock</option>
                  <option value="Pass-thru">Pass-thru</option>
                  <option value="Alarm">Alarm / Warning</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Reader:</label>
                <select
                  value={doorFilterReader}
                  onChange={e => setDoorFilterReader(e.target.value)}
                  style={{ height: 30, padding: '2px 8px', borderRadius: 5, border: '1px solid #cbd5e1', fontSize: 11.5, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="All">All Readers</option>
                  <option value="BioStation 3">BioStation 3</option>
                  <option value="BioEntry P2">BioEntry P2</option>
                  <option value="X-Pass 2">X-Pass 2</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="bs-table" style={{ width: '100%', minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Door ID</th>
                  <th>Door Name</th>
                  <th>Branch / Location</th>
                  <th>Tier Category</th>
                  <th>Door Requirement</th>
                  <th>System Role</th>
                  <th>Relay & Interlock</th>
                  <th>Lock & Alarm State</th>
                  <th>In-Reader Hardware</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{d.id}</td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td>{d.branch}</td>
                    <td>
                      <span className="bs-badge bs-badge-gray" style={{ fontSize: 10.5 }}>
                        {d.category}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: d.doorRequirement?.includes('Vault') ? '#9333ea' : d.doorRequirement?.includes('Interlock') ? '#0284c7' : '#374151'
                      }}>
                        {d.doorRequirement || d.purpose}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${d.system === 'Attendance' ? 'badge-attn' : 'badge-acs'}`}>
                        {d.system}
                      </span>
                    </td>
                    <td style={{ fontSize: 11.5 }}>{d.relay}</td>
                    <td>
                      {d.alarmStatus && d.alarmStatus !== 'Normal' ? (
                        <span className="bs-badge bs-badge-red" style={{ animation: 'pulse 1.5s infinite' }}>
                          <span className="bs-dot bs-dot-red"></span>
                          {d.alarmStatus}
                        </span>
                      ) : d.lockStatus?.includes('Dual') || d.lockStatus?.includes('Interlock') ? (
                        <span className="bs-badge bs-badge-blue">
                          <span className="bs-dot bs-dot-blue"></span>
                          {d.lockStatus}
                        </span>
                      ) : (
                        <span className="bs-badge bs-badge-green">
                          <span className="bs-dot bs-dot-green"></span>
                          {d.lockStatus}
                        </span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{d.readerIn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="bs-empty" style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
              <span>No door records found matching the selected filter criteria.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 6. DEVICE REPORT & TOPOLOGY (Slides 09 & 10)
  const renderDeviceReport = () => {
    let filtered = PDF_DEVICE_RECORDS;
    if (activeFilter !== 'all') {
      if (activeFilter === 'Active' || activeFilter === 'Inactive') {
        filtered = filtered.filter(dev => dev.status === activeFilter);
      } else {
        filtered = filtered.filter(dev => dev.category.toLowerCase().includes(activeFilter.toLowerCase()));
      }
    }
    if (devFilterModel !== 'All') {
      filtered = filtered.filter(dev => dev.model.toLowerCase().includes(devFilterModel.toLowerCase()));
    }
    if (devFilterStatus !== 'All') {
      filtered = filtered.filter(dev => dev.status === devFilterStatus);
    }
    if (devFilterFirmware !== 'All') {
      filtered = filtered.filter(dev => dev.firmware === devFilterFirmware);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(dev =>
        dev.name.toLowerCase().includes(q) ||
        dev.model.toLowerCase().includes(q) ||
        dev.branch.toLowerCase().includes(q) ||
        dev.id.toLowerCase().includes(q) ||
        dev.ip.includes(q)
      );
    }

    const hasActiveFilters = activeFilter !== 'all' || devFilterModel !== 'All' || devFilterStatus !== 'All' || devFilterFirmware !== 'All' || searchQuery.trim() !== '';
    const models = ['All', ...new Set(PDF_DEVICE_RECORDS.map(dev => dev.model))];
    const firmwares = ['All', ...new Set(PDF_DEVICE_RECORDS.map(dev => dev.firmware))];

    return (
      <div>
        {/* 8 Circular Sub-Category Buttons from Slide 09 */}
        <div className="pdf-cat-grid">
          <button className="pdf-cat-btn" onClick={() => setActiveFilter('all')}>
            <div className={`pdf-cat-ring ${activeFilter === 'all' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.deviceReport}
            </div>
            <span className="pdf-cat-label">Total Device Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Branch')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Branch' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.branch}
            </div>
            <span className="pdf-cat-label">Branch Device Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Sub-Branch')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Sub-Branch' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.subBranch}
            </div>
            <span className="pdf-cat-label">Sub-Branch Device Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Regional Office')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Regional Office' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.ro}
            </div>
            <span className="pdf-cat-label">RO Device Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Head Office')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Head Office' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.ho}
            </div>
            <span className="pdf-cat-label">Head Office Device Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('all')}>
            <div className="pdf-cat-ring">
              {SVG_ICONS.deviceStatus}
            </div>
            <span className="pdf-cat-label">Device Status Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Active')}>
            <div className={`pdf-cat-ring ring-teal ${activeFilter === 'Active' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.activeDevice}
            </div>
            <span className="pdf-cat-label">Active Device Report</span>
          </button>

          <button className="pdf-cat-btn" onClick={() => setActiveFilter('Inactive')}>
            <div className={`pdf-cat-ring ${activeFilter === 'Inactive' ? 'ring-teal' : ''}`}>
              {SVG_ICONS.inactiveDevice}
            </div>
            <span className="pdf-cat-label">Inactive Device Report</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="table-card" style={{ marginTop: 14 }}>
          {/* Enhanced Multi-Attribute Filter Toolbar */}
          <div style={{
            padding: '12px 16px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                  {activeFilter === 'all' ? 'All Suprema Terminals' : `${activeFilter} Terminals`}
                </span>
                <span className="record-counter" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 700, padding: '2px 8px', borderRadius: 12, fontSize: 11 }}>
                  {filtered.length} Terminals
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="bs-btn bs-btn-outline bs-btn-sm"
                  onClick={() => handleExportCsv('Pubali_Device_Report.csv', filtered)}
                  title="Export filtered records to CSV"
                >
                  Download CSV
                </button>
                <button className="bs-btn bs-btn-outline bs-btn-sm" onClick={() => window.print()}>
                  Print PDF
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllReportFilters}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 4,
                      border: '1px solid #fca5a5',
                      background: '#fef2f2',
                      color: '#b91c1c',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Reset All
                  </button>
                )}
              </div>
            </div>

            {/* Filter Controls Row */}
            <div style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
              background: '#f8fafc',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
                <input
                  className="bs-input"
                  style={{ width: '100%', height: 30, paddingLeft: 28, fontSize: 12, boxSizing: 'border-box' }}
                  placeholder="Search device ID, model, IP..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }}>
                  🔍
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Terminal Model:</label>
                <select
                  value={devFilterModel}
                  onChange={e => setDevFilterModel(e.target.value)}
                  style={{ height: 30, padding: '2px 8px', borderRadius: 5, border: '1px solid #cbd5e1', fontSize: 11.5, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  {models.map(m => <option key={m} value={m}>{m === 'All' ? 'All Models' : m}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Status:</label>
                <select
                  value={devFilterStatus}
                  onChange={e => setDevFilterStatus(e.target.value)}
                  style={{ height: 30, padding: '2px 8px', borderRadius: 5, border: '1px solid #cbd5e1', fontSize: 11.5, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active (Online)</option>
                  <option value="Inactive">Inactive (Offline)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Firmware:</label>
                <select
                  value={devFilterFirmware}
                  onChange={e => setDevFilterFirmware(e.target.value)}
                  style={{ height: 30, padding: '2px 8px', borderRadius: 5, border: '1px solid #cbd5e1', fontSize: 11.5, background: '#fff', color: '#334155', outline: 'none', cursor: 'pointer' }}
                >
                  {firmwares.map(fw => <option key={fw} value={fw}>{fw === 'All' ? 'All Firmware' : fw}</option>)}
                </select>
              </div>
            </div>
          </div>

          <table className="bs-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Device Model</th>
                <th>Location / Branch</th>
                <th>Category</th>
                <th>IP Address</th>
                <th>Firmware</th>
                <th>Ping Latency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(dev => (
                <tr key={dev.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{dev.id}</td>
                  <td style={{ fontWeight: 600 }}>{dev.model}</td>
                  <td>{dev.branch}</td>
                  <td><span className="bs-badge bs-badge-blue">{dev.category}</span></td>
                  <td style={{ fontFamily: 'monospace' }}>{dev.ip}</td>
                  <td>{dev.firmware}</td>
                  <td><span style={{ fontFamily: 'monospace', color: '#0d9488' }}>{dev.ping}</span></td>
                  <td>
                    <span className={`bs-badge ${dev.status === 'Active' ? 'bs-badge-green' : 'bs-badge-red'}`}>
                      <span className={`bs-dot ${dev.status === 'Active' ? 'bs-dot-green' : 'bs-dot-red'}`}></span>
                      {dev.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="bs-empty" style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
              <span>No terminal records match the selected filter criteria.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Title and Breadcrumbs resolver
  const getHeaderTitle = () => {
    switch (currentView) {
      case 'overview':     return 'Overview';
      case 'reportHub':    return 'Report';
      case 'userReport':   return 'User Report';
      case 'accessReport': return 'Access Report';
      case 'doorReport':   return 'Door Report';
      case 'deviceReport': return 'Device Report';
      case 'customReport': return 'Custom Report Builder';
      default:             return 'Overview';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── SUB-VIEW TOP ACTION BAR (Breadcrumb & Return) ── */}
      {currentView !== 'overview' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 6px',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Banking Command Center</span>
              <span style={{ fontSize: 11, fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '2px 9px', borderRadius: 12 }}>
                SOC Real-Time
              </span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <span>/</span>
              <button
                onClick={() => { setCurrentView('overview'); setActiveFilter('all'); }}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Command Center
              </button>
              {currentView !== 'reportHub' && (
                <>
                  <span>/</span>
                  <button
                    onClick={() => { setCurrentView('reportHub'); setActiveFilter('all'); }}
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Reports
                  </button>
                </>
              )}
              <span>/</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{getHeaderTitle()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="bs-btn"
              onClick={handleExportExecutiveReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11.5,
                fontWeight: 700,
                padding: '6px 14px',
                background: '#ffffff',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Export Nationwide Biometric & Security Telemetry (CSV)"
            >
              <span style={{ fontSize: 13 }}>📥</span>
              <span>Export Report</span>
            </button>

            <button
              className="bs-btn"
              onClick={() => { setCurrentView('overview'); setActiveFilter('all'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11.5,
                fontWeight: 700,
                padding: '6px 15px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(3,105,161,0.25)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Return to Command Center Overview"
            >
              <span>←</span>
              <span>Command Center</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      {currentView === 'overview' ? (
        renderOverviewView()
      ) : (
        /* Sub-views Card (Report Hub, User Report, Access Report, Door Report, Device Report, Custom Builder) */
        <div className="bs-card" style={{ overflow: 'hidden', padding: 0, borderRadius: 8, border: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(15,23,42,0.03)' }}>
          {/* Sub-view Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '11px 18px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => { setCurrentView(currentView === 'reportHub' ? 'overview' : 'reportHub'); setActiveFilter('all'); }}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 4, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 13 }}
                title="Go Back"
              >
                ←
              </button>
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>{getHeaderTitle()}</span>
              {activeFilter !== 'all' && (
                <span style={{ background: 'rgba(255,255,255,0.18)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
                  Filter: {activeFilter}
                  <button
                    onClick={() => setActiveFilter('all')}
                    style={{ marginLeft: 6, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
                    title="Clear Filter"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => { setCurrentView('overview'); setActiveFilter('all'); }}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 4, padding: '3px 10px', fontSize: 11, cursor: 'pointer', color: '#fff', fontWeight: 600 }}
              >
                View Command Center ⇦
              </button>
            </div>
          </div>

          {/* Sub-view Card Body */}
          <div style={{ padding: '16px 20px' }}>
            {currentView === 'reportHub' && renderReportHub()}
            {currentView === 'userReport' && renderUserReport()}
            {currentView === 'accessReport' && renderAccessReport()}
            {currentView === 'doorReport' && renderDoorReport()}
            {currentView === 'deviceReport' && renderDeviceReport()}
            {currentView === 'customReport' && (
              <BioStarCustomReportBuilder onNavigateParent={onNavigateParent} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
