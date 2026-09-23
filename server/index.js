/**
 * Access Control & Attendance Dashboard - Express REST API Server
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./data/mockDatabase');
const { biostarConnector, SUPREMA_EVENT_TYPES } = require('./services/biostarConnector');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '..')));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Client Error Logger
app.post('/api/client-log', (req, res) => {
  console.log('\n🚨 [FRONTEND CLIENT ERROR CAUGHT]:');
  console.log('Message:', req.body.message);
  console.log('Location:', req.body.filename, req.body.lineno + ':' + req.body.colno);
  console.log('Stack:', req.body.stack);
  console.log('------------------------------------\n');
  res.json({ received: true });
});

// 1. Overall System Stats (Usage Metric Bar)
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: db.stats
  });
});

// 2. Chart Analytics Time Series (Overview)
app.get('/api/analytics', (req, res) => {
  const period = (req.query.period || 'week').toLowerCase();
  const dataset = db.chartData[period] || db.chartData.week;
  res.json({
    success: true,
    data: dataset
  });
});

// 2.1 Nationwide Branches API (829 locations with pagination and filters)
app.get('/api/branches', (req, res) => {
  const { page = 1, limit = 50, division, zone, status, type, search } = req.query;
  let result = [...db.pubaliLocations];

  if (division && division !== 'All') {
    result = result.filter(b => b.division.toLowerCase() === division.toLowerCase());
  }
  if (zone && zone !== 'All') {
    result = result.filter(b => b.zone.toLowerCase() === zone.toLowerCase());
  }
  if (status && status !== 'All') {
    result = result.filter(b => b.status.toLowerCase() === status.toLowerCase());
  }
  if (type && type !== 'All') {
    result = result.filter(b => b.type.toLowerCase() === type.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      (b.routingNumber && b.routingNumber.includes(q)) ||
      b.district.toLowerCase().includes(q) ||
      b.zone.toLowerCase().includes(q)
    );
  }

  const total = result.length;
  const p = parseInt(page) || 1;
  const lim = parseInt(limit) || 50;
  const startIndex = (p - 1) * lim;
  const paginated = result.slice(startIndex, startIndex + lim);

  res.json({
    success: true,
    total,
    page: p,
    limit: lim,
    totalPages: Math.ceil(total / lim),
    data: paginated
  });
});

// 2.2 Regional Offices API
app.get('/api/regional-offices', (req, res) => {
  res.json({
    success: true,
    count: db.regionalOffices ? db.regionalOffices.length : 0,
    data: db.regionalOffices || []
  });
});


// 3. Users Sub-Report API
app.get('/api/users', (req, res) => {
  const { category, biometric, search } = req.query;
  let result = [...db.users];

  if (category && category !== 'all') {
    const cat = category.toLowerCase().trim();
    result = result.filter(u => {
      if (cat === 'group') return u.category === 'group' || u.department.toLowerCase().includes('group');
      if (cat === 'branch') return u.category === 'branch';
      if (cat === 'sub-branch' || cat === 'sub-br' || cat === 'sub-br.') return u.category === 'sub-branch' || u.branch.toLowerCase().includes('sub-branch');
      if (cat === 'ro' || cat === 'regional office') return u.category === 'ro' || u.branch.toLowerCase().includes('regional office') || u.branch.toLowerCase().includes('ro');
      if (cat === 'head-office' || cat === 'head office' || cat === 'ho') return u.category === 'head-office' || u.branch.toLowerCase().includes('head office') || u.branch.toLowerCase().includes('principal');
      return u.category.toLowerCase() === cat || u.branch.toLowerCase().includes(cat) || u.department.toLowerCase().includes(cat);
    });
  }

  if (biometric && biometric !== 'all') {
    const bio = biometric.toLowerCase().trim();
    if (bio === 'fingerprint') result = result.filter(u => u.fingerprint);
    else if (bio === 'card') result = result.filter(u => !!u.card);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.branch.toLowerCase().includes(q) ||
      (u.card && u.card.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    count: result.length,
    data: result
  });
});

// 4. Access Groups Sub-Report API
app.get('/api/access-groups', (req, res) => {
  const { category, search } = req.query;
  let result = [...db.accessGroups];

  if (category && category !== 'all') {
    const cat = category.toLowerCase().trim();
    result = result.filter(ag => {
      if (cat === 'regional office' || cat === 'ro' || cat === 'region') {
        return ag.category.toLowerCase().includes('regional') || ag.category.toLowerCase().includes('ro');
      }
      if (cat === 'head office' || cat === 'head-office' || cat === 'ho') {
        return ag.category.toLowerCase().includes('head office') || ag.category.toLowerCase().includes('ho');
      }
      if (cat === 'sub-branch' || cat === 'sub-br') {
        return ag.category.toLowerCase().includes('sub-branch');
      }
      if (cat === 'branch') {
        return ag.category.toLowerCase() === 'branch';
      }
      return ag.category.toLowerCase().includes(cat) || ag.branch.toLowerCase().includes(cat);
    });
  }

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(ag =>
      ag.name.toLowerCase().includes(q) ||
      ag.id.toLowerCase().includes(q) ||
      ag.clearanceLevel.toLowerCase().includes(q) ||
      ag.branch.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: result.length,
    data: result
  });
});

// 5. Devices Sub-Report API
app.get('/api/devices', (req, res) => {
  const { category, status, search } = req.query;
  let result = [...db.devices];

  if (category && category !== 'all') {
    const cat = category.toLowerCase().trim();
    if (cat === 'active') {
      result = result.filter(d => d.status === 'Online');
    } else if (cat === 'inactive') {
      result = result.filter(d => d.status === 'Offline' || d.status.toLowerCase().includes('tamper'));
    } else if (cat === 'status') {
      // Return all with status intact
    } else if (cat === 'sub-branch' || cat === 'sub-br') {
      result = result.filter(d => d.category === 'sub-branch' || d.location.toLowerCase().includes('sub-branch'));
    } else if (cat === 'ro' || cat === 'regional office') {
      result = result.filter(d => d.category === 'ro' || d.location.toLowerCase().includes('regional') || d.location.toLowerCase().includes('ro'));
    } else if (cat === 'head-office' || cat === 'head office' || cat === 'ho') {
      result = result.filter(d => d.category === 'head-office' || d.location.toLowerCase().includes('head office') || d.location.toLowerCase().includes('principal'));
    } else if (cat === 'branch') {
      result = result.filter(d => d.category === 'branch');
    } else {
      result = result.filter(d =>
        d.category.toLowerCase() === cat ||
        d.location.toLowerCase().includes(cat)
      );
    }
  }

  if (status && status !== 'all') {
    result = result.filter(d => d.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.model.toLowerCase().includes(q) ||
      d.ip.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      (d.branchCode && d.branchCode.includes(q)) ||
      (d.routingNumber && d.routingNumber.includes(q))
    );
  }

  res.json({
    success: true,
    count: result.length,
    data: result
  });
});

// 6. Doors Sub-Report API
app.get('/api/doors', (req, res) => {
  const { type, location, search } = req.query;
  let result = [...db.doors];

  if (type && type !== 'all') {
    const t = type.toLowerCase().trim();
    if (t === 'attendance') {
      result = result.filter(d => d.type.toLowerCase().includes('attendance'));
    } else if (t === 'access control' || t === 'access-control') {
      result = result.filter(d => d.type.toLowerCase().includes('access'));
    } else if (t === 'branch') {
      result = result.filter(d => d.location.toLowerCase().includes('branch') && !d.location.toLowerCase().includes('sub-branch'));
    } else if (t === 'head office' || t === 'head-office' || t === 'ho') {
      result = result.filter(d => d.location.toLowerCase().includes('head office') || d.location.toLowerCase().includes('principal'));
    } else if (t === 'sub-branch') {
      result = result.filter(d => d.location.toLowerCase().includes('sub-branch'));
    } else {
      result = result.filter(d => d.type.toLowerCase().includes(t));
    }
  }

  if (location && location !== 'all') {
    result = result.filter(d => d.location.toLowerCase().includes(location.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.status.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      d.controller.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: result.length,
    data: result
  });
});

// 6.1 Door Remote Control Endpoints (Pulse Unlock, Lock, Hold)
app.post('/api/doors/:id/unlock', async (req, res) => {
  const { id } = req.params;
  const result = await biostarConnector.remoteDoorAction(id, 'open');
  res.json(result);
});

app.post('/api/doors/:id/lock', async (req, res) => {
  const { id } = req.params;
  const result = await biostarConnector.remoteDoorAction(id, 'lock');
  res.json(result);
});

app.post('/api/doors/:id/pulse', async (req, res) => {
  const { id } = req.params;
  const result = await biostarConnector.remoteDoorAction(id, 'open');
  res.json(result);
});

// ==========================================
// ENTERPRISE REPORT HUB: /api/v1/reports/attendance
// Handles 5 Report Levels: group, branch, sub-branch, ro, head-office
// ==========================================
app.get('/api/v1/reports/attendance', (req, res) => {
  const {
    report_type = 'branch',
    scope_id = 'ALL',
    start_date = '2026-05-15',
    end_date = '2026-05-21',
    verify_mode = 'ALL',
    status = 'ALL',
    format = 'json'
  } = req.query;

  const startTime = Date.now();

  // Synthetic High-Fidelity Suprema Punch Records Generator
  const employees = db.users || [];
  const locations = db.pubaliLocations || [];
  const generatedRecords = [];

  // Filter employees according to report_type & scope_id
  let targetEmployees = [...employees];
  if (report_type === 'branch' && scope_id !== 'ALL') {
    targetEmployees = targetEmployees.filter(e => e.branch.includes(scope_id) || (e.card && e.card.includes(scope_id)));
  } else if (report_type === 'sub-branch') {
    targetEmployees = targetEmployees.filter(e => e.category === 'sub-branch');
  } else if (report_type === 'ro' && scope_id !== 'ALL') {
    targetEmployees = targetEmployees.filter(e => e.branch.toLowerCase().includes(scope_id.toLowerCase()) || e.category === 'ro');
  } else if (report_type === 'head-office') {
    targetEmployees = targetEmployees.filter(e => e.category === 'head-office');
  } else if (report_type === 'group') {
    targetEmployees = targetEmployees.filter(e => e.category === 'group' || e.department.toLowerCase().includes('vault') || e.department.toLowerCase().includes('treasury'));
  }

  if (targetEmployees.length === 0) {
    targetEmployees = employees.slice(0, 15);
  }

  const modes = ['FINGERPRINT', 'CARD'];
  const results = ['VERIFIED', 'VERIFIED', 'VERIFIED', 'VERIFIED', 'VERIFIED', 'DENIED', 'TAMPER'];

  // Generate logs
  const dates = [start_date, end_date];
  targetEmployees.forEach((emp, empIdx) => {
    const loc = locations[empIdx % locations.length] || locations[0];
    const logResult = results[empIdx % results.length];
    const logMode = emp.fingerprint ? 'FINGERPRINT' : 'CARD';

    // Filter by requested verify_mode & status
    if (verify_mode !== 'ALL' && logMode !== verify_mode) return;
    if (status === 'NORMAL' && logResult !== 'VERIFIED') return;
    if (status === 'DENIED' && logResult !== 'DENIED') return;
    if (status === 'TAMPER' && logResult !== 'TAMPER') return;

    generatedRecords.push({
      logId: `LOG-PB-${100000 + empIdx * 7}`,
      timestamp: `${dates[empIdx % dates.length]} 08:${45 + (empIdx % 15)}:${10 + (empIdx % 45)}`,
      userId: emp.id,
      userName: emp.name,
      department: emp.department,
      systemRole: emp.role,
      branchCode: loc ? loc.branchCode : '0101',
      branchName: loc ? loc.branchName : emp.branch,
      zone: loc ? loc.zone : 'Dhaka Central',
      deviceId: (loc && loc.device && loc.device.deviceId) || (loc && loc.devices && loc.devices[0] && loc.devices[0].id) || 'SUP-PB-901101',
      deviceModel: (loc && loc.device && loc.device.deviceModel) || (loc && loc.devices && loc.devices[0] && loc.devices[0].name) || 'BioStation 3',
      doorName: (loc && loc.device && loc.device.doorLocation) || (loc && loc.doorList && loc.doorList[0] && loc.doorList[0].name) || 'Main Entrance Door',
      punchType: empIdx % 2 === 0 ? 'IN' : 'OUT',
      verifyMode: logMode,
      result: logResult,
      temperatureC: 36.5,
      mfaVerified: true
    });
  });

  const total = generatedRecords.length;
  const verified = generatedRecords.filter(r => r.result === 'VERIFIED').length;
  const denied = generatedRecords.filter(r => r.result === 'DENIED').length;
  const tamper = generatedRecords.filter(r => r.result === 'TAMPER').length;

  const responsePayload = {
    success: true,
    meta: {
      reportType: report_type,
      scopeId: scope_id,
      dateRange: {
        startDate: start_date,
        endDate: end_date
      },
      filtersApplied: {
        verifyMode: verify_mode,
        status: status
      },
      bank: 'Pubali Bank PLC',
      serverNode: 'biostar-central.pubalibank.com:443',
      executionTimeMs: Date.now() - startTime,
      generatedAt: new Date().toISOString()
    },
    summary: {
      totalRecords: total,
      uniqueEmployees: targetEmployees.length,
      verifiedPunches: verified,
      accessDenied: denied,
      tamperAlerts: tamper,
      attendanceRate: total > 0 ? `${((verified / total) * 100).toFixed(1)}%` : '100%'
    },
    records: generatedRecords
  };

  // CSV / Excel Export Handler
  if (format === 'csv' || format === 'excel') {
    const headers = [
      'Log ID', 'Timestamp', 'Employee ID', 'Employee Name', 'Department',
      'System Role', 'Branch Code', 'Branch Name', 'Zone', 'Device ID',
      'Device Model', 'Door Location', 'Punch Type', 'Verify Mode', 'Result'
    ];
    const csvRows = [headers.join(',')];

    generatedRecords.forEach(r => {
      csvRows.push([
        r.logId,
        `"${r.timestamp}"`,
        r.userId,
        `"${r.userName}"`,
        `"${r.department}"`,
        `"${r.systemRole}"`,
        r.branchCode,
        `"${r.branchName}"`,
        `"${r.zone}"`,
        r.deviceId,
        r.deviceModel,
        `"${r.doorName}"`,
        r.punchType,
        r.verifyMode,
        r.result
      ].join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="PubaliBank_${report_type}_attendance_${start_date}_to_${end_date}.csv"`);
    return res.status(200).send(csvRows.join('\n'));
  }

  // Default JSON Response
  res.json(responsePayload);
});

// 7. Pubali Bank Device Matrix API
app.get('/api/pubali-matrix', (req, res) => {
  const { zone, district, type, status, search } = req.query;
  let result = [...(db.pubaliLocations || [])];

  if (zone && zone !== 'All Zones') {
    result = result.filter(loc => loc.zone.toLowerCase() === zone.toLowerCase());
  }

  if (district && district !== 'All Districts') {
    result = result.filter(loc => loc.district.toLowerCase() === district.toLowerCase());
  }

  if (type && type !== 'all') {
    result = result.filter(loc => loc.type.toLowerCase() === type.toLowerCase());
  }

  if (status && status !== 'all') {
    result = result.filter(loc => loc.device.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(loc =>
      loc.branchName.toLowerCase().includes(q) ||
      loc.branchCode.toLowerCase().includes(q) ||
      loc.routingNumber.toLowerCase().includes(q) ||
      loc.device.deviceId.toLowerCase().includes(q) ||
      loc.device.deviceIp.toLowerCase().includes(q) ||
      loc.device.deviceModel.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: result.length,
    data: result
  });
});

// 8. Pubali Bank Network Summary KPI API
app.get('/api/pubali-summary', (req, res) => {
  res.json({
    success: true,
    data: db.pubaliNetworkSummary
  });
});

// 9. Device Remote Ping Endpoint
app.post('/api/devices/ping/:id', (req, res) => {
  const { id } = req.params;
  const device = (db.devices || []).find(d => d.id === id);
  if (!device) {
    return res.status(404).json({ success: false, message: 'Device not found' });
  }

  if (device.status === 'Offline') {
    return res.json({
      success: false,
      deviceId: id,
      message: 'ICMP echo request timed out. Host unreachable on bank WAN.'
    });
  }

  const latency = Math.floor(Math.random() * 14) + 6;
  res.json({
    success: true,
    deviceId: id,
    latencyMs: latency,
    message: `Ping reply received from ${device.ip} in ${latency}ms via BioStar 2 gateway.`
  });
});

// 10. Device Remote Tamper Alarm Reset Endpoint
app.post('/api/devices/tamper-reset/:id', (req, res) => {
  const { id } = req.params;
  const loc = (db.pubaliLocations || []).find(l => l.device && l.device.deviceId === id);
  if (loc && loc.device) {
    loc.device.status = 'online';
    loc.device.tamperActive = false;
    loc.device.tamperReason = null;
    loc.device.relayStatus = 'Locked (Normal)';
    loc.device.lastLogEvent = 'Tamper Reset Cleared by Central Security SOC';
  }
  const dev = (db.devices || []).find(d => d.id === id);
  if (dev) {
    dev.status = 'Online';
    dev.tamperActive = false;
    dev.relayStatus = 'Locked (Normal)';
  }
  res.json({
    success: true,
    deviceId: id,
    message: 'Tamper alarm acknowledged and relay interlock reset to normal locked state.'
  });
});

// 11. CSV Export Stream Endpoint
app.get('/api/export/:type', (req, res) => {
  const { type } = req.params;
  let data = [];
  let filename = `${type}-report-${Date.now()}.csv`;

  if (type === 'users') data = db.users;
  else if (type === 'access-groups') data = db.accessGroups;
  else if (type === 'devices') data = db.devices;
  else if (type === 'doors') data = db.doors;
  else if (type === 'pubali-locations') data = db.pubaliLocations;
  else return res.status(400).json({ success: false, message: 'Invalid export type' });

  if (data.length === 0) return res.status(404).send('No data to export');

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const val = typeof row[header] === 'object' ? JSON.stringify(row[header]) : (row[header] ?? '');
      const escaped = ('' + val).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csvRows.join('\n'));
});

// 12. Tender Customized Reporting Capabilities Endpoint
app.get('/api/reports/custom', (req, res) => {
  const { entity = 'users', status, firmware, scope, search } = req.query;
  let dataset = [];

  if (entity === 'devices') {
    dataset = [...db.devices];
    if (status && status !== 'All') {
      dataset = dataset.filter(d => d.status.toLowerCase() === status.toLowerCase());
    }
    if (firmware && firmware !== 'All Versions') {
      dataset = dataset.filter(d => d.firmware && d.firmware.toLowerCase().includes(firmware.toLowerCase()));
    }
    if (scope && scope !== 'All') {
      dataset = dataset.filter(d => (d.category && d.category.toLowerCase().includes(scope.toLowerCase())) || (d.zone && d.zone.toLowerCase().includes(scope.toLowerCase())));
    }
  } else if (entity === 'doors') {
    dataset = [...db.doors];
    if (status && status !== 'All') {
      dataset = dataset.filter(d => (d.status && d.status.toLowerCase().includes(status.toLowerCase())) || (d.relayStatus && d.relayStatus.toLowerCase().includes(status.toLowerCase())));
    }
    if (scope && scope !== 'All') {
      dataset = dataset.filter(d => (d.location && d.location.toLowerCase().includes(scope.toLowerCase())) || (d.zone && d.zone.toLowerCase().includes(scope.toLowerCase())));
    }
  } else if (entity === 'access') {
    dataset = [...db.accessGroups];
    if (scope && scope !== 'All') {
      dataset = dataset.filter(a => a.category.toLowerCase().includes(scope.toLowerCase()) || a.branch.toLowerCase().includes(scope.toLowerCase()));
    }
  } else {
    // Default: users
    dataset = [...db.users];
    if (status && status !== 'All') {
      dataset = dataset.filter(u => u.status.toLowerCase() === status.toLowerCase());
    }
    if (scope && scope !== 'All') {
      dataset = dataset.filter(u => u.branch.toLowerCase().includes(scope.toLowerCase()) || u.department.toLowerCase().includes(scope.toLowerCase()));
    }
  }

  if (search && search.trim()) {
    const q = search.toLowerCase();
    dataset = dataset.filter(item =>
      Object.values(item).some(v => String(v).toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    entity,
    count: dataset.length,
    data: dataset
  });
});

// =========================================================================
// BIOSTAR X ENTERPRISE LOAD TESTING & NATIONWIDE PUNCH SIMULATION ENGINE
// Simulates 35,000 Employees across 1,250 Biometric Terminals in 829 Branches
// =========================================================================

const simulationMetrics = {
  totalPunchesReceived: 0,
  batchRequestsReceived: 0,
  terminalsActive: new Set(),
  branchesReporting: new Set(),
  startTime: null,
  lastPunchTime: null,
  latencies: [],
  biometricTypes: {
    fingerprint: 0,
    rfid_card: 0,
    facial: 0,
    dual: 0
  },
  authResults: {
    granted: 0,
    denied: 0,
    tailgate_alert: 0
  }
};

// 1. Single Punch Event Ingestion (Real-time terminal push)
app.post('/api/biostar/punch-event', (req, res) => {
  const reqStart = process.hrtime();
  const {
    employeeId,
    employeeName,
    branchCode,
    deviceId,
    verifyMode = 'FINGERPRINT',
    result = 'GRANTED',
    temperature = 36.5,
    timestamp = new Date().toISOString()
  } = req.body;

  if (!simulationMetrics.startTime) simulationMetrics.startTime = Date.now();
  simulationMetrics.totalPunchesReceived++;
  simulationMetrics.lastPunchTime = Date.now();
  if (deviceId) simulationMetrics.terminalsActive.add(deviceId);
  if (branchCode) simulationMetrics.branchesReporting.add(branchCode);

  // Ingest into BioStar central event tracking engine (SOC alarms, Who-Is-Inside, telemetry)
  biostarConnector.ingestEvent({
    employeeId,
    employeeName,
    branchCode,
    deviceId,
    verifyMode,
    result,
    temperature,
    timestamp
  });

  const modeLower = (verifyMode || 'fingerprint').toLowerCase();
  if (modeLower.includes('finger')) simulationMetrics.biometricTypes.fingerprint++;
  else if (modeLower.includes('card') || modeLower.includes('rfid')) simulationMetrics.biometricTypes.rfid_card++;
  else if (modeLower.includes('face')) simulationMetrics.biometricTypes.facial++;
  else simulationMetrics.biometricTypes.dual++;

  const resLower = (result || 'granted').toLowerCase();
  if (resLower.includes('grant') || resLower.includes('verify')) simulationMetrics.authResults.granted++;
  else if (resLower.includes('tailgate')) simulationMetrics.authResults.tailgate_alert++;
  else simulationMetrics.authResults.denied++;

  const diff = process.hrtime(reqStart);
  const latencyMs = (diff[0] * 1000 + diff[1] / 1e6);
  if (simulationMetrics.latencies.length < 50000) {
    simulationMetrics.latencies.push(latencyMs);
  }

  res.status(200).json({
    success: true,
    txId: `TX-BS-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    status: 'COMMITTED',
    latencyMs: Number(latencyMs.toFixed(2))
  });
});

// 2. Batch Sync Ingestion (Buffered terminal transactions push, e.g. 20-100 punches per batch)
app.post('/api/biostar/batch-sync', (req, res) => {
  const reqStart = process.hrtime();
  const { deviceId, branchCode, batchSize = 1, punches = [] } = req.body;

  if (!simulationMetrics.startTime) simulationMetrics.startTime = Date.now();
  simulationMetrics.batchRequestsReceived++;
  simulationMetrics.lastPunchTime = Date.now();
  if (deviceId) simulationMetrics.terminalsActive.add(deviceId);
  if (branchCode) simulationMetrics.branchesReporting.add(branchCode);

  const count = (punches && punches.length) ? punches.length : (Number(batchSize) || 1);
  simulationMetrics.totalPunchesReceived += count;

  // Process batch
  if (Array.isArray(punches) && punches.length > 0) {
    for (const p of punches) {
      const modeLower = (p.verifyMode || 'fingerprint').toLowerCase();
      if (modeLower.includes('finger')) simulationMetrics.biometricTypes.fingerprint++;
      else if (modeLower.includes('card') || modeLower.includes('rfid')) simulationMetrics.biometricTypes.rfid_card++;
      else if (modeLower.includes('face')) simulationMetrics.biometricTypes.facial++;
      else simulationMetrics.biometricTypes.dual++;

      const resLower = (p.result || 'granted').toLowerCase();
      if (resLower.includes('grant') || resLower.includes('verify')) simulationMetrics.authResults.granted++;
      else if (resLower.includes('tailgate')) simulationMetrics.authResults.tailgate_alert++;
      else simulationMetrics.authResults.denied++;
    }
  } else {
    simulationMetrics.biometricTypes.fingerprint += Math.floor(count * 0.65);
    simulationMetrics.biometricTypes.rfid_card += Math.floor(count * 0.30);
    simulationMetrics.biometricTypes.dual += count - Math.floor(count * 0.65) - Math.floor(count * 0.30);
    simulationMetrics.authResults.granted += Math.floor(count * 0.98);
    simulationMetrics.authResults.denied += count - Math.floor(count * 0.98);
  }

  const diff = process.hrtime(reqStart);
  const latencyMs = (diff[0] * 1000 + diff[1] / 1e6);
  if (simulationMetrics.latencies.length < 50000) {
    simulationMetrics.latencies.push(latencyMs);
  }

  res.status(200).json({
    success: true,
    batchId: `BATCH-BS-${Date.now()}`,
    punchesProcessed: count,
    status: 'SYNCED_TO_CENTRAL',
    latencyMs: Number(latencyMs.toFixed(2))
  });
});

// 3. Telemetry & Benchmark Stats
app.get('/api/biostar/simulation-stats', (req, res) => {
  const durationSec = simulationMetrics.startTime
    ? ((simulationMetrics.lastPunchTime || Date.now()) - simulationMetrics.startTime) / 1000
    : 0;

  const latencies = simulationMetrics.latencies.slice().sort((a, b) => a - b);
  const p50 = latencies.length ? latencies[Math.floor(latencies.length * 0.50)] : 0;
  const p90 = latencies.length ? latencies[Math.floor(latencies.length * 0.90)] : 0;
  const p95 = latencies.length ? latencies[Math.floor(latencies.length * 0.95)] : 0;
  const p99 = latencies.length ? latencies[Math.floor(latencies.length * 0.99)] : 0;
  const avg = latencies.length ? latencies.reduce((s, c) => s + c, 0) / latencies.length : 0;
  const min = latencies.length ? latencies[0] : 0;
  const max = latencies.length ? latencies[latencies.length - 1] : 0;

  const rps = durationSec > 0 ? (simulationMetrics.totalPunchesReceived / durationSec) : 0;

  res.json({
    success: true,
    data: {
      totalPunchesReceived: simulationMetrics.totalPunchesReceived,
      batchRequestsReceived: simulationMetrics.batchRequestsReceived,
      activeTerminalsCount: simulationMetrics.terminalsActive.size,
      reportingBranchesCount: simulationMetrics.branchesReporting.size,
      durationSeconds: Number(durationSec.toFixed(2)),
      requestsPerSecond: Number(rps.toFixed(1)),
      biometricDistribution: simulationMetrics.biometricTypes,
      authResultsDistribution: simulationMetrics.authResults,
      latencyMs: {
        min: Number(min.toFixed(2)),
        avg: Number(avg.toFixed(2)),
        p50: Number(p50.toFixed(2)),
        p90: Number(p90.toFixed(2)),
        p95: Number(p95.toFixed(2)),
        p99: Number(p99.toFixed(2)),
        max: Number(max.toFixed(2))
      }
    }
  });
});

// 4. Reset Simulation
app.post('/api/biostar/reset-simulation', (req, res) => {
  simulationMetrics.totalPunchesReceived = 0;
  simulationMetrics.batchRequestsReceived = 0;
  simulationMetrics.terminalsActive.clear();
  simulationMetrics.branchesReporting.clear();
  simulationMetrics.startTime = null;
  simulationMetrics.lastPunchTime = null;
  simulationMetrics.latencies = [];
  simulationMetrics.biometricTypes = { fingerprint: 0, rfid_card: 0, facial: 0, dual: 0 };
  simulationMetrics.authResults = { granted: 0, denied: 0, tailgate_alert: 0 };
  res.json({ success: true, message: 'Simulation metrics reset' });
});

// =========================================================================
// BIOSTAR 2 / BIOSTAR X GATEWAY INTEGRATION & SYNCHRONIZATION API
// =========================================================================

// BioStar Gateway Configuration & Telemetry
app.get('/api/biostar/config', (req, res) => {
  res.json({
    success: true,
    data: biostarConnector.getStatus()
  });
});

app.get('/api/biostar/status', (req, res) => {
  res.json({
    success: true,
    data: biostarConnector.getStatus()
  });
});

// Update BioStar Gateway Configuration dynamically
app.post('/api/biostar/config', async (req, res) => {
  try {
    const result = await biostarConnector.updateConfig(req.body);
    res.json({
      success: true,
      data: biostarConnector.getStatus(),
      message: result.message || 'BioStar configuration updated successfully.'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// Test Connection & Handshake against Live/Target BioStar Server
app.post('/api/biostar/test-connection', async (req, res) => {
  const result = await biostarConnector.testConnection(req.body);
  res.json(result);
});

// Trigger Instant Full Sync from BioStar Server
app.post('/api/biostar/sync-now', async (req, res) => {
  const result = await biostarConnector.syncAll();
  res.json(result);
});

// Suprema BioStar 2 / BioStar X Standard Webhook Receiver
app.post('/api/biostar/webhook', (req, res) => {
  const event = biostarConnector.ingestEvent(req.body);
  res.status(200).json({
    success: true,
    status: 'INGESTED',
    eventId: event.eventId,
    processedAt: new Date().toISOString()
  });
});

// Simulate Live Biometric Punch for Testing
app.post('/api/biostar/simulate-event', (req, res) => {
  const {
    branchCode = '0142',
    branchName = 'Dhanmondi Branch',
    deviceId = 'SUP-DHN-BS3-01',
    employeeId = 'PB-10492',
    employeeName = 'Rahim Ahmed',
    doorName = 'Cash Vault Interlock Door 1',
    eventTypeId = 4097, // Fingerprint Verified
    temperature = 36.6
  } = req.body;

  const event = biostarConnector.ingestEvent({
    event_type_id: eventTypeId,
    deviceId,
    userId: employeeId,
    userName: employeeName,
    branchCode,
    branchName,
    doorName,
    temperature
  });

  res.json({
    success: true,
    event,
    message: `Biometric event ingested successfully into Central Security Monitoring.`
  });
});

// ─── INTELLIGENCE MODULE API ROUTES ──────────────────────────────────────────

// Who Is Inside — Live Occupancy Roll-Call
app.get('/api/who-is-inside', (req, res) => {
  const { branch, zone, status } = req.query;
  const all = db.whoIsInside || [];
  let records = all;
  if (branch && branch !== 'All') records = records.filter(r => r.branch.includes(branch));
  if (zone && zone !== 'All') records = records.filter(r => r.zone === zone);
  if (status && status !== 'All') {
    if (status === 'Outside' || status === 'Evacuated') {
      records = records.filter(r => r.status === 'Outside' || r.status === 'Evacuated');
    } else {
      records = records.filter(r => r.status === status);
    }
  }
  const outsideCount = all.filter(r => r.status === 'Outside' || r.status === 'Evacuated').length;
  const summary = {
    totalInside: all.filter(r => r.status === 'Inside').length,
    totalOutside: outsideCount,
    totalEvacuated: outsideCount,
    totalUnknown: all.filter(r => r.status === 'Unknown').length,
    totalAll: all.length
  };
  res.json({ success: true, data: records, summary });
});

// SOC Alarm Panel
app.get('/api/soc-alarms', (req, res) => {
  const { severity, status, type } = req.query;
  let alarms = db.socAlarms || [];
  if (type && type !== 'All') alarms = alarms.filter(a => a.type === type);
  if (severity && severity !== 'All') alarms = alarms.filter(a => a.severity === severity);
  if (status && status !== 'All') alarms = alarms.filter(a => a.status === status);
  const all = db.socAlarms || [];
  const summary = {
    totalCount: all.length,
    activeCount: all.filter(a => a.status === 'Active').length,
    ackedCount: all.filter(a => a.status === 'ACKed').length,
    criticalCount: all.filter(a => a.severity === 'Critical').length,
    tamperCount: all.filter(a => a.type === 'Tamper Alert').length,
    resolvedToday: all.filter(a => a.status === 'Resolved').length,
    avgResponseMin: 4.2
  };
  res.json({ success: true, data: alarms, summary });
});

// SOC Alarm — Acknowledge
app.post('/api/soc-alarms/:id/ack', (req, res) => {
  res.json({ success: true, message: `Alarm ${req.params.id} acknowledged.` });
});

// SOC Alarm — Resolve
app.post('/api/soc-alarms/:id/resolve', (req, res) => {
  res.json({ success: true, message: `Alarm ${req.params.id} resolved.` });
});

// Branch Security Scorecard
app.get('/api/branch-scorecard', (req, res) => {
  const { division, grade } = req.query;
  let scorecard = db.branchScorecard || [];
  if (division && division !== 'All') scorecard = scorecard.filter(b => b.division === division);
  if (grade && grade !== 'All') scorecard = scorecard.filter(b => b.grade === grade);
  const summary = {
    excellent: (db.branchScorecard || []).filter(b => b.grade === 'Excellent').length,
    good: (db.branchScorecard || []).filter(b => b.grade === 'Good').length,
    atRisk: (db.branchScorecard || []).filter(b => b.grade === 'At Risk').length,
    critical: (db.branchScorecard || []).filter(b => b.grade === 'Critical').length,
    avgScore: Number(((db.branchScorecard || []).reduce((s, b) => s + b.score, 0) / Math.max(1, (db.branchScorecard || []).length)).toFixed(1))
  };
  res.json({ success: true, data: scorecard, summary });
});

// Attendance Exceptions
app.get('/api/attendance-exceptions', (req, res) => {
  const { type, division, severity } = req.query;
  let exceptions = db.attendanceExceptions || [];
  if (type && type !== 'All') exceptions = exceptions.filter(e => e.exceptionType === type);
  if (division && division !== 'All') exceptions = exceptions.filter(e => e.division === division);
  if (severity && severity !== 'All') exceptions = exceptions.filter(e => e.severity === severity);
  const all = db.attendanceExceptions || [];
  const summary = {
    lateArrival: all.filter(e => e.exceptionType === 'Late Arrival').length,
    earlyDeparture: all.filter(e => e.exceptionType === 'Early Departure').length,
    missingPunch: all.filter(e => e.exceptionType === 'Missing Punch').length,
    absentNoLeave: all.filter(e => e.exceptionType === 'Absent No Leave').length,
    duplicatePunch: all.filter(e => e.exceptionType === 'Duplicate Punch').length,
    escalated: all.filter(e => e.escalated).length
  };
  res.json({ success: true, data: exceptions, summary });
});

// Restricted Zone Access Log
app.get('/api/restricted-access-log', (req, res) => {
  const { zone, result, timeframe } = req.query;
  let logs = db.restrictedAccessLogs || [];
  if (timeframe === 'today') {
    logs = logs.filter(l => l.isToday);
  }
  if (zone && zone !== 'All') logs = logs.filter(l => l.zone === zone);
  if (result && result !== 'All') logs = logs.filter(l => l.result === result);
  logs = logs.sort((a, b) => a.minsAgo - b.minsAgo);
  const all = db.restrictedAccessLogs || [];
  const todayLogs = all.filter(l => l.isToday);
  const summary = {
    totalGranted: all.filter(l => l.result === 'Granted').length,
    totalDenied: all.filter(l => l.result === 'Denied').length,
    todayGranted: todayLogs.filter(l => l.result === 'Granted').length,
    todayDenied: todayLogs.filter(l => l.result === 'Denied').length,
    flagged: all.filter(l => l.flagged).length
  };
  res.json({ success: true, data: logs, summary });
});

// Employee Movement Trail
app.get('/api/movement-trail', (req, res) => {
  const { q } = req.query;
  let employees = db.movementEmployees || [];
  if (q) {
    const ql = q.toLowerCase();
    employees = employees.filter(e => e.name.toLowerCase().includes(ql) || e.id.toLowerCase().includes(ql));
  }
  res.json({ success: true, data: employees });
});

app.get('/api/movement-trail/:employeeId', (req, res) => {
  const emp = (db.movementEmployees || []).find(e => e.id === req.params.employeeId);
  if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
  res.json({ success: true, data: emp });
});

app.listen(PORT, () => {
  console.log(`[Express API] Server running on http://localhost:${PORT}`);
});

