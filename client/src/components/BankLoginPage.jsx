import React, { useState } from 'react';

// Quick-fill presets for authentic bank role testing (realistic bank designations and credentials)
const DEMO_ACCOUNTS = [
  {
    roleTitle: 'Chief Information Security Officer (CISO)',
    badge: 'ICT Security Division',
    id: 'PB-10492',
    aliases: ['PB-ADMIN', 'PB-10492', 'TARIQUL'],
    pass: 'Pubali@2026',
    name: 'Engr. Tariqul Hasan',
    initials: 'TH',
    designation: 'SVP & Head of Information Security',
    branch: 'Head Office (Motijheel, Dhaka)',
    color: '#0369a1',
    clearance: 'L4 - TOP RESTRICTED (CORE & VAULTS)'
  },
  {
    roleTitle: 'SOC Incident Commander',
    badge: 'Central SOC Head Office',
    id: 'PB-SOC-001',
    aliases: ['PB-SOC01', 'PB-SOC-001'],
    pass: 'Soc@2026',
    name: 'Capt. (Retd.) M. A. Karim',
    initials: 'MK',
    designation: 'Senior Security Operations Controller',
    branch: 'Central 24/7 SOC · Head Office',
    color: '#b91c1c',
    clearance: 'L3 - CENTRAL SOC & HARDWARE RELAYS'
  },
  {
    roleTitle: 'Principal Branch Manager',
    badge: 'Branch Command (0142)',
    id: 'PB-BR-0142',
    aliases: ['PB-BM101', 'PB-BR-0142'],
    pass: 'Branch@2026',
    name: 'Syed Nazmul Huda',
    initials: 'NH',
    designation: 'Senior Vice President & Branch Head',
    branch: 'Principal Branch, Motijheel (0142)',
    color: '#047857',
    clearance: 'L2 - BRANCH VAULT DUAL-CUSTODY'
  },
  {
    roleTitle: 'HRMD Attendance Director',
    badge: 'HRMD Biometrics',
    id: 'PB-HR-0089',
    aliases: ['PB-HR05', 'PB-HR-0089'],
    pass: 'Hr@2026',
    name: 'Fatema Tuz Zohra',
    initials: 'FZ',
    designation: 'Senior Principal Officer, HRMD Biometrics',
    branch: 'Human Resources Division · Head Office',
    color: '#b45309',
    clearance: 'L2 - NATIONWIDE ROSTER & PUNCH LEDGER'
  },
  {
    roleTitle: 'ICCD Compliance Auditor',
    badge: 'Internal Audit / BB',
    id: 'PB-AUD-0021',
    aliases: ['PB-AUDIT', 'PB-AUD-0021'],
    pass: 'Audit@2026',
    name: 'Khandakar M. Alam',
    initials: 'KA',
    designation: 'Joint Director, ICCD Audit Wing',
    branch: 'Audit & Inspection Division',
    color: '#6d28d9',
    clearance: 'L3 - UNRESTRICTED AUDIT TRAIL LOGS'
  }
];

export default function BankLoginPage({ onLoginSuccess }) {
  const [employeeId, setEmployeeId] = useState('PB-10492');
  const [password, setPassword] = useState('Pubali@2026');
  const [branch, setBranch] = useState('Head Office (Motijheel)');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!employeeId.trim()) {
      setErrorMsg('Please enter your Bank Employee ID / User ID');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your secure password');
      return;
    }

    setIsLoading(true);

    // Simulate bank authentication delay & token validation
    setTimeout(() => {
      const q = employeeId.trim().toUpperCase();
      const matched = DEMO_ACCOUNTS.find(
        a => a.id.toUpperCase() === q || (a.aliases && a.aliases.includes(q))
      );

      const userProfile = matched || {
        id: employeeId.trim().toUpperCase(),
        name: 'Bank Authorized Officer',
        initials: employeeId.trim().slice(0, 2).toUpperCase(),
        designation: 'Authorized Personnel',
        roleTitle: 'Authorized Security Officer',
        branch: branch,
        color: '#0284c7',
        clearance: 'L1 - STANDARD BRANCH ACCESS'
      };

      setIsLoading(false);
      onLoginSuccess(userProfile);
    }, 450);
  };

  const handleSelectPreset = (acc) => {
    setEmployeeId(acc.id);
    setPassword(acc.pass);
    setBranch(acc.branch);
    setErrorMsg('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #070d19 0%, #0f1e36 50%, #0a1324 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background glowing ambient elements */}
      <div style={{
        position: 'absolute',
        top: -100,
        left: -100,
        width: 480,
        height: 480,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.18) 0%, rgba(13,148,136,0) 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: -150,
        right: -100,
        width: 550,
        height: 550,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(2,132,199,0.15) 0%, rgba(2,132,199,0) 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      {/* Top Bank Header Bar */}
      <header style={{
        height: 64,
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(10, 19, 36, 0.75)',
        backdropFilter: 'blur(12px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Bank Column/Pillars SVG Emblem */}
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(13,148,136,0.4)',
            color: '#fff'
          }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 2L2 7v2h20V7L12 2zm-8 8v8h2v-8H4zm5 0v8h2v-8H9zm5 0v8h2v-8h-2zm5 0v8h2v-8h-2zM2 20v2h20v-2H2z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.04em', color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8 }}>
              PUBALI BANK PLC
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(13,148,136,0.25)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.3)' }}>
                পূবালী ব্যাংক পিএলসি
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.02em', marginTop: 1 }}>
              BioStar X Central Access Control & Biometric Attendance Gateway
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: '#34d399',
            background: 'rgba(16,185,129,0.12)',
            padding: '5px 12px',
            borderRadius: 20,
            border: '1px solid rgba(16,185,129,0.25)'
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span>256-Bit TLS Bank Encrypted</span>
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            Node: <span style={{ color: '#cbd5e1' }}>DHK-CORE-01</span>
          </div>
        </div>
      </header>

      {/* Main Login Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 20px',
        zIndex: 5
      }}>
        <div style={{
          width: '100%',
          maxWidth: 1020,
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)'
        }}>
          {/* Left Column: Bank Security & Institutional Context */}
          <div style={{
            padding: '44px 40px',
            background: 'linear-gradient(180deg, rgba(13,148,136,0.12) 0%, rgba(2,132,199,0.06) 100%)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              {/* Shield Icon Header */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 20 }}>
                <svg viewBox="0 0 20 20" fill="#2dd4bf" width="13" height="13">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
                </svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2dd4bf', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Bangladesh Bank ICT Security Standard
                </span>
              </div>

              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1.3, marginBottom: 12, letterSpacing: '-0.02em' }}>
                Central Access Control & Security Intelligence Portal
              </h1>

              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 28 }}>
                Unified central platform for <strong>829 branches and sub-branches</strong>. Monitors cash vault biometric authentication, server room intrusion detection, and employee time-attendance synchronization.
              </p>

              {/* Key Security Pillars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(13,148,136,0.2)', border: '1px solid rgba(13,148,136,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2dd4bf', flexShrink: 0 }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Cash Vault & SWIFT Dual-Custody</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Mandatory dual-biometric audit logs for restricted banking zones.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', flexShrink: 0 }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Central SOC Intrusion & Door Alarms</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Instant alerts for forced doors, unclosed vault doors, and sensor tampering.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(2,132,199,0.2)', border: '1px solid rgba(2,132,199,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', flexShrink: 0 }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Nationwide Branch Security Scorecard</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Automated grading and audit rating for ICCD and regulatory inspection.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick-select Demo Profiles */}
            <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Demo Profiles (Click to Auto-fill):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DEMO_ACCOUNTS.map(acc => {
                  const isSelected = employeeId.toLowerCase() === acc.id.toLowerCase();
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectPreset(acc)}
                      style={{
                        padding: '6px 11px',
                        borderRadius: 6,
                        border: isSelected ? `1.5px solid ${acc.color}` : '1px solid rgba(255,255,255,0.12)',
                        background: isSelected ? `${acc.color}25` : 'rgba(255,255,255,0.04)',
                        color: isSelected ? '#ffffff' : '#cbd5e1',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                        }
                      }}
                    >
                      <span style={{
                        width: 18,
                        height: 18,
                        borderRadius: 3,
                        background: acc.color,
                        color: '#fff',
                        fontSize: 9,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        letterSpacing: '0.04em'
                      }}>
                        {acc.initials}
                      </span>
                      <span>{acc.roleTitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Bank Authentication Form */}
          <div style={{ padding: '44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>
                  Officer Authentication
                </h2>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  Enter your assigned Bank Employee ID and Active Directory password.
                </div>
              </div>

              {/* Error banner if any */}
              {errorMsg && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: 'rgba(220, 38, 38, 0.15)',
                  border: '1px solid rgba(220, 38, 38, 0.4)',
                  color: '#fca5a5',
                  fontSize: 12,
                  marginBottom: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Employee ID / User ID */}
                <div>
                  <label htmlFor="login-emp-id" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Bank Employee ID / User ID
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: 12, display: 'flex', alignItems: 'center', color: '#64748b' }}>
                      <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                      </svg>
                    </span>
                    <input
                      id="login-emp-id"
                      type="text"
                      value={employeeId}
                      onChange={e => setEmployeeId(e.target.value)}
                      placeholder="e.g. PB-ADMIN or PB-04892"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 7,
                        color: '#ffffff',
                        fontSize: 13,
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={e => e.target.style.borderColor = '#0d9488'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                  </div>
                </div>

                {/* Password with eye toggle */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label htmlFor="login-password" style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Domain Password
                    </label>
                    <a
                      href="#help"
                      onClick={e => { e.preventDefault(); alert('Please contact ICT Service Desk at extension #4001 or soc@pubalibankbd.com for password assistance.'); }}
                      style={{ fontSize: 11, color: '#0284c7', textDecoration: 'none' }}
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: 12, display: 'flex', alignItems: 'center', color: '#64748b' }}>
                      <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter security password"
                      style={{
                        width: '100%',
                        padding: '10px 42px 10px 38px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 7,
                        color: '#ffffff',
                        fontSize: 13,
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={e => e.target.style.borderColor = '#0d9488'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      tabIndex={-1}
                      style={{
                        position: 'absolute',
                        right: 12,
                        background: 'none',
                        border: 'none',
                        color: showPassword ? '#2dd4bf' : '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 2,
                        transition: 'color 0.15s'
                      }}
                      title={showPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                          <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.375l1.091 1.091a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                          <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 014.05 5.53l2.093 2.093A4 4 0 0010.748 13.93z" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                          <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                          <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Branch / Operational Zone Selector */}
                <div>
                  <label htmlFor="login-branch" style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Branch / Operational Jurisdiction
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: 12, display: 'flex', alignItems: 'center', color: '#64748b' }}>
                      <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.36 7.587a16.415 16.415 0 003.033 2.198l.018.009.006.002.002.001.001.001zM10 12a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <select
                      id="login-branch"
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 7,
                        color: '#ffffff',
                        fontSize: 13,
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Head Office (Motijheel)">Head Office (Motijheel, Dhaka)</option>
                      <option value="Central SOC · Head Office">Central SOC · Control Room</option>
                      <option value="Principal Branch, Motijheel">Principal Branch (Motijheel, Dhaka)</option>
                      <option value="Gulshan Corporate Branch">Gulshan Corporate Branch</option>
                      <option value="Agrabad Commercial Area Branch, Ctg">Agrabad Corporate Branch, Chattogram</option>
                      <option value="Sylhet Main Branch">Sylhet Main Branch</option>
                      <option value="Rajshahi Main Branch">Rajshahi Main Branch</option>
                      <option value="HR Division · Head Office">HR Division · Head Office</option>
                      <option value="Audit & Compliance Division">Internal Control & Compliance (ICCD)</option>
                    </select>
                  </div>
                </div>

                {/* Remember ID & Security Notice */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      style={{ accentColor: '#0d9488', cursor: 'pointer' }}
                    />
                    <span>Remember Bank ID on this workstation</span>
                  </label>
                </div>

                {/* Login Button */}
                <button
                  id="bank-login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  style={{
                    marginTop: 6,
                    padding: '12px 20px',
                    borderRadius: 7,
                    border: 'none',
                    background: isLoading
                      ? 'rgba(13,148,136,0.5)'
                      : 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    cursor: isLoading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 16px rgba(13,148,136,0.35)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { if (!isLoading) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                  onMouseLeave={e => { if (!isLoading) e.currentTarget.style.filter = 'brightness(1)'; }}
                >
                  {isLoading ? (
                    <>
                      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                      <span>Verifying Active Directory Credentials…</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                      </svg>
                      <span>Sign In to Bank Security Portal</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Statutory Legal Disclaimer */}
            <div style={{
              marginTop: 24,
              padding: '10px 12px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              fontSize: 10,
              lineHeight: 1.45,
              color: '#64748b',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start'
            }}>
              <svg viewBox="0 0 20 20" fill="#94a3b8" width="14" height="14" style={{ flexShrink: 0, marginTop: 1 }}>
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <strong style={{ color: '#94a3b8' }}>STATUTORY WARNING:</strong> This portal is for authorized Pubali Bank PLC officers only. All activities are recorded and audited under the Bangladesh Cyber Security Act & ICT Guidelines. Unauthorized attempts are automatically escalated to Central SOC.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '14px 32px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 11,
        color: '#64748b',
        zIndex: 10
      }}>
        <div>
          Pubali Bank PLC © 2026 · All Rights Reserved · ICT Security & Operation Division
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <span>Suprema BioStar X v2.9.4</span>
          <span>SLA: 99.99%</span>
          <span>Helpdesk: ext #4001 / #4002</span>
        </div>
      </footer>
    </div>
  );
}
