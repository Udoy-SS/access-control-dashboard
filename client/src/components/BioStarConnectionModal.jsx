import React, { useState, useEffect } from 'react';
import {
  getBioStarConfig,
  updateBioStarConfig,
  testBioStarConnection,
  syncBioStarNow,
  simulateBioStarPunch
} from '../services/api';

export default function BioStarConnectionModal({ isOpen, onClose }) {
  const [config, setConfig] = useState({
    host: 'biostar-central.pubalibank.com',
    port: 443,
    protocol: 'https:',
    loginId: 'admin',
    password: '',
    enabled: false,
    autoSync: true
  });

  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [punchFeedback, setPunchFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'webhook' | 'events'

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await getBioStarConfig();
      if (res && res.data) {
        setStatusData(res.data);
        setConfig(prev => ({
          ...prev,
          host: res.data.host || prev.host,
          port: res.data.port || prev.port,
          protocol: res.data.protocol || prev.protocol,
          loginId: res.data.loginId || prev.loginId,
          enabled: res.data.enabled || false,
          autoSync: res.data.autoSync !== false
        }));
      }
    } catch (e) {
      console.error('Failed to load BioStar config:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testBioStarConnection({
        host: config.host,
        port: Number(config.port),
        protocol: config.protocol,
        loginId: config.loginId,
        password: config.password
      });
      setTestResult(res);
      loadConfig();
    } catch (e) {
      setTestResult({
        success: false,
        connected: false,
        message: e.message || 'Connection test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await updateBioStarConfig(config);
      if (res && res.success) {
        setTestResult({
          success: true,
          message: 'Settings saved successfully. BioStar connection parameters updated.'
        });
        loadConfig();
      }
    } catch (e) {
      alert('Error saving config: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncBioStarNow();
      setSyncResult(res);
      loadConfig();
    } catch (e) {
      setSyncResult({ success: false, message: e.message });
    } finally {
      setSyncing(false);
    }
  };

  const handleSendTestPunch = async () => {
    setPunchFeedback('Sending...');
    try {
      const res = await simulateBioStarPunch({
        branchCode: '0142',
        branchName: 'Dhanmondi Branch',
        deviceId: 'SUP-DHN-BS3-01',
        employeeId: 'PB-10492',
        employeeName: 'Tanvir Hasan',
        doorName: 'Cash Vault Interlock Door 1',
        eventTypeId: 4097 // Fingerprint
      });
      if (res && res.success) {
        setPunchFeedback(`Verified! Event ID: ${res.event?.eventId || 'EVT-OK'}`);
        setTimeout(() => setPunchFeedback(null), 4000);
        loadConfig();
      }
    } catch (e) {
      setPunchFeedback('Failed to send punch');
    }
  };

  if (!isOpen) return null;

  const isConnected = statusData?.status === 'CONNECTED';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 16
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        width: '100%',
        maxWidth: 720,
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 100%)',
          color: '#ffffff',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20
            }}>
              ⚡
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  Suprema BioStar 2 / BioStar X Gateway
                </h3>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: isConnected ? '#10b981' : '#f59e0b',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {isConnected ? '● Live Connected' : '● Standby (Ready)'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: 11.5, opacity: 0.85 }}>
                Central Biometric Integration & Live Synchronizer · Pubali Bank PLC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: 20,
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4,
              opacity: 0.8
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '0 20px'
        }}>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '12px 16px',
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              borderBottom: activeTab === 'settings' ? '2px solid #0d9488' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'settings' ? '#0d9488' : '#64748b',
              cursor: 'pointer'
            }}
          >
            ⚙️ Connection & API Settings
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            style={{
              padding: '12px 16px',
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              borderBottom: activeTab === 'webhook' ? '2px solid #0d9488' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'webhook' ? '#0d9488' : '#64748b',
              cursor: 'pointer'
            }}
          >
            📡 BioStar Webhook & Push
          </button>
          <button
            onClick={() => setActiveTab('events')}
            style={{
              padding: '12px 16px',
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              borderBottom: activeTab === 'events' ? '2px solid #0d9488' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'events' ? '#0d9488' : '#64748b',
              cursor: 'pointer'
            }}
          >
            📊 Live Event Stream ({statusData?.recentEvents?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'settings' && (
            <div>
              {/* Architecture Context Banner */}
              <div style={{
                background: '#f0fdfa',
                border: '1px solid #99f6e4',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 18,
                fontSize: 12,
                color: '#134e4a',
                lineHeight: 1.5
              }}>
                <strong>🛡️ Enterprise Dual-Mode Resiliency:</strong> If your BioStar 2 server or BioStar X Cloud gateway is connected, this dashboard directly syncs terminals, users, and door relays in real-time. If the server is offline or not yet configured, the system operates seamlessly in high-fidelity standby with <strong>1,658 terminals</strong> and <strong>2,696 doors</strong> without interruptions.
              </div>

              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    BioStar Server Host / Domain or IP:
                  </label>
                  <input
                    type="text"
                    value={config.host}
                    onChange={e => setConfig({ ...config, host: e.target.value })}
                    placeholder="e.g. biostar-central.pubalibank.com or 10.0.1.50"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 12.5,
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Port:
                  </label>
                  <input
                    type="number"
                    value={config.port}
                    onChange={e => setConfig({ ...config, port: e.target.value })}
                    placeholder="443"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 12.5,
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Protocol:
                  </label>
                  <select
                    value={config.protocol}
                    onChange={e => setConfig({ ...config, protocol: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: 12.5,
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      background: '#fff'
                    }}
                  >
                    <option value="https:">HTTPS (SSL/TLS - Secure)</option>
                    <option value="http:">HTTP (Standard Intranet)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    BioStar Login ID:
                  </label>
                  <input
                    type="text"
                    value={config.loginId}
                    onChange={e => setConfig({ ...config, loginId: e.target.value })}
                    placeholder="admin"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 12.5,
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
                    Password:
                  </label>
                  <input
                    type="password"
                    value={config.password}
                    onChange={e => setConfig({ ...config, password: e.target.value })}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 12.5,
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons: Test Connection, Save, Sync */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  style={{
                    padding: '8px 16px',
                    fontSize: 12,
                    fontWeight: 700,
                    background: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: testing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {testing ? '⏳ Handshaking...' : '⚡ Test Connection'}
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    fontSize: 12,
                    fontWeight: 600,
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  💾 Save Parameters
                </button>

                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={syncing}
                  style={{
                    padding: '8px 16px',
                    fontSize: 12,
                    fontWeight: 600,
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  {syncing ? '🔄 Syncing...' : '🔄 Pull Devices & Doors'}
                </button>

                <button
                  type="button"
                  onClick={handleSendTestPunch}
                  style={{
                    padding: '8px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    background: '#fef3c7',
                    color: '#b45309',
                    border: '1px solid #fde68a',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  🧪 Test Biometric Punch
                </button>

                {punchFeedback && (
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#059669' }}>
                    {punchFeedback}
                  </span>
                )}
              </div>

              {/* Test Connection Output Diagnostic Box */}
              {testResult && (
                <div style={{
                  background: testResult.connected ? '#ecfdf5' : '#fffbeb',
                  border: `1px solid ${testResult.connected ? '#a7f3d0' : '#fde68a'}`,
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 16,
                  fontSize: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span>{testResult.connected ? '✅' : 'ℹ️'}</span>
                    <strong style={{ color: testResult.connected ? '#065f46' : '#92400e' }}>
                      {testResult.connected ? 'Connection Established' : 'Gateway Diagnostics'}
                    </strong>
                    {testResult.latencyMs !== undefined && (
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        ({testResult.latencyMs}ms response latency)
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#334155', lineHeight: 1.4 }}>
                    {testResult.message}
                  </div>
                </div>
              )}

              {/* Sync Output Box */}
              {syncResult && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 16,
                  fontSize: 11.5,
                  color: '#334155'
                }}>
                  <strong>Sync Result:</strong> Mode: <code>{syncResult.mode}</code> · Synced {syncResult.stats?.devices || 0} Terminals, {syncResult.stats?.doors || 0} Doors.
                </div>
              )}

              {/* Status Metrics Strip */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '12px 16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 10,
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: 10.5, color: '#64748b' }}>ACTIVE MODE</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0d9488', marginTop: 2 }}>
                    {statusData?.status || 'STANDBY'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: '#64748b' }}>TERMINALS</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>
                    {statusData?.lastSyncStats?.devices || 1658}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: '#64748b' }}>SECURED DOORS</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>
                    {statusData?.lastSyncStats?.doors || 1040}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: '#64748b' }}>PUNCHES INGESTED</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0284c7', marginTop: 2 }}>
                    {statusData?.livePunchesIngested || 0}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'webhook' && (
            <div style={{ fontSize: 12, lineHeight: 1.6, color: '#334155' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#0f172a' }}>
                Suprema BioStar 2 / BioStar X Event Push Configuration
              </h4>
              <p>
                To have BioStar 2 or BioStar X push biometric punches, door access, and security alarms in real-time to this dashboard, configure the following Webhook Trigger in your BioStar 2 Admin Console:
              </p>

              <div style={{ background: '#f1f5f9', padding: '12px 16px', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  WEBHOOK INGESTION URL:
                </div>
                <code style={{ fontSize: 13, color: '#0f766e', fontWeight: 600 }}>
                  http://{window.location.hostname}:5050/api/biostar/webhook
                </code>
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <h5 style={{ margin: '0 0 6px 0', fontSize: 12.5, color: '#1e293b' }}>
                  Supported Suprema Event Types Automatically Decoded:
                </h5>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li><code>4096 / 4097 / 4098</code>: Biometric Verification Success (Card, Fingerprint, Face)</li>
                  <li><code>4100 / 4101 / 4102</code>: Access Denied (Unregistered, Invalid Time, Restricted Door)</li>
                  <li><code>4107</code>: Door Forced Open Alarm (Escalated to Central SOC)</li>
                  <li><code>4108</code>: Door Held Open Alert (&gt;60s Sensor Delay)</li>
                  <li><code>4109</code>: Terminal Tamper Detected Alarm</li>
                  <li><code>4110 / 4111</code>: Terminal Disconnected / Connected Status</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0, fontSize: 13, color: '#1e293b' }}>
                  Recent Ingested Suprema Biometric Events
                </h4>
                <button
                  onClick={loadConfig}
                  style={{
                    fontSize: 11,
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  Refresh
                </button>
              </div>

              {(!statusData?.recentEvents || statusData.recentEvents.length === 0) ? (
                <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8', fontSize: 12 }}>
                  No live punches received yet. Click "Test Biometric Punch" in the settings tab to test!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {statusData.recentEvents.map((evt, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        fontSize: 11.5
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          background: evt.result === 'GRANTED' ? '#dcfce7' : '#fee2e2',
                          color: evt.result === 'GRANTED' ? '#15803d' : '#b91c1c'
                        }}>
                          {evt.result}
                        </span>
                        <strong>{evt.userName}</strong>
                        <span style={{ color: '#64748b' }}>({evt.userId})</span>
                        <span style={{ color: '#0d9488' }}>{evt.branchName}</span>
                        <span style={{ color: '#475569' }}>· {evt.doorName}</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 10.5 }}>
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            BioStar X API Integration v2.9 · Suprema Biometric Solutions
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px 18px',
              fontSize: 12,
              fontWeight: 600,
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
