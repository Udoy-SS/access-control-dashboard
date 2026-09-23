/**
 * BioStar 2 API Client Service
 * Connects to Express REST backend on http://localhost:5050
 * Includes automatic fallback to client local cache for resilient offline performance
 */

import {
  FULL_PUBALI_LOCATIONS,
  REGIONAL_OFFICES,
  DIVISIONS_LIST,
  NETWORK_STATISTICS
} from '../data/pubaliFullBranches';

const API_BASE = 'http://localhost:5050/api';

async function fetchWithFallback(endpoint, fallbackFn) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE}${endpoint}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // Graceful offline/local fallback
    return fallbackFn();
  }
}

export async function getStats() {
  return fetchWithFallback('/stats', () => ({
    success: true,
    data: {
      totalLocations: NETWORK_STATISTICS.totalLocations,
      branchesCount: NETWORK_STATISTICS.branchesCount,
      subBranchesCount: NETWORK_STATISTICS.subBranchesCount,
      islamicUnitsCount: NETWORK_STATISTICS.islamicUnitsCount,
      deviceTotal: NETWORK_STATISTICS.totalDevices,
      onlineDevices: NETWORK_STATISTICS.onlineDevices,
      offlineDevices: NETWORK_STATISTICS.offlineDevices,
      tamperAlerts: NETWORK_STATISTICS.tamperAlerts,
      deviceOnlinePct: Math.round((NETWORK_STATISTICS.onlineDevices / (NETWORK_STATISTICS.totalDevices || 1)) * 100),
      doorTotal: 1040,
      userTotal: 35000,
      doorActivePct: 98,
      primaryBioStarServer: 'biostar-central.pubalibank.com:443'
    }
  }));
}

export async function getBranches(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchWithFallback(`/branches?${query}`, () => {
    let list = [...FULL_PUBALI_LOCATIONS];
    if (params.division && params.division !== 'All') {
      list = list.filter(b => b.division.toLowerCase() === params.division.toLowerCase());
    }
    if (params.zone && params.zone !== 'All') {
      list = list.filter(b => b.zone.toLowerCase() === params.zone.toLowerCase());
    }
    if (params.status && params.status !== 'All') {
      list = list.filter(b => b.status.toLowerCase() === params.status.toLowerCase());
    }
    if (params.type && params.type !== 'All') {
      list = list.filter(b => b.type.toLowerCase() === params.type.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        (b.routingNumber && b.routingNumber.includes(q)) ||
        b.district.toLowerCase().includes(q) ||
        b.zone.toLowerCase().includes(q)
      );
    }
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 36;
    const startIndex = (page - 1) * limit;
    return {
      success: true,
      total: list.length,
      page,
      limit,
      totalPages: Math.ceil(list.length / limit),
      data: list.slice(startIndex, startIndex + limit)
    };
  });
}

export async function getRegionalOffices() {
  return fetchWithFallback('/regional-offices', () => ({
    success: true,
    count: REGIONAL_OFFICES.length,
    data: REGIONAL_OFFICES
  }));
}

export async function getDevices(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchWithFallback(`/devices?${query}`, () => {
    const devs = [];
    FULL_PUBALI_LOCATIONS.forEach(l => {
      if (l.devices) {
        l.devices.forEach(d => {
          devs.push({
            id: d.id,
            name: `${d.name} - ${l.name}`,
            model: d.name,
            modelCode: d.model,
            ip: d.ip,
            status: d.status,
            category: l.type,
            location: l.name,
            zone: l.zone,
            firmware: d.firmware,
            lastHeartbeat: d.status === 'Online' ? 'Just now' : '45m ago'
          });
        });
      }
    });
    return {
      success: true,
      count: devs.length,
      data: devs
    };
  });
}

export async function getDoors(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchWithFallback(`/doors?${query}`, () => {
    const doors = [];
    let seq = 1000;
    FULL_PUBALI_LOCATIONS.forEach(l => {
      if (l.doorList) {
        l.doorList.forEach(d => {
          seq++;
          doors.push({
            id: `DOR-PB-${seq}`,
            name: `${l.name} - ${d.name}`,
            type: d.name.toLowerCase().includes('vault') ? 'Access Control' : 'Attendance',
            location: l.name,
            sensor: d.sensor,
            status: d.status,
            controller: l.devices && l.devices[0] ? l.devices[0].name : 'BioStation 3'
          });
        });
      }
    });
    return {
      success: true,
      count: doors.length,
      data: doors
    };
  });
}

export async function getUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchWithFallback(`/users?${query}`, () => {
    const users = [];
    FULL_PUBALI_LOCATIONS.forEach(l => {
      if (l.employees) {
        l.employees.forEach(e => {
          users.push({
            id: e.id,
            name: e.name,
            branch: l.name,
            department: l.type === 'head-office' ? 'Head Office' : 'Branch Operations',
            authMode: 'Fingerprint + Card',
            status: e.status === 'Absent' ? 'Inactive' : 'Active'
          });
        });
      }
    });
    return {
      success: true,
      count: users.length,
      data: users
    };
  });
}

export async function fetchCustomReport(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchWithFallback(`/reports/custom?${query}`, () => {
    return {
      success: true,
      entity: params.entity || 'users',
      count: 0,
      data: []
    };
  });
}

// ─── BioStar 2 / BioStar X Gateway Integration API Client ──────
export async function getBioStarConfig() {
  try {
    const res = await fetch(`${API_BASE}/biostar/config`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      success: true,
      data: {
        status: 'STANDBY',
        host: 'biostar-central.pubalibank.com',
        port: 443,
        protocol: 'https:',
        serverVersion: 'BioStar 2.9.6 (Enterprise Cloud)',
        lastSyncTime: 'Local Cache Active',
        lastSyncStats: { devices: 1658, doors: 1040, users: 35000 },
        recentEvents: []
      }
    };
  }
}

export async function updateBioStarConfig(config) {
  const res = await fetch(`${API_BASE}/biostar/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return await res.json();
}

export async function testBioStarConnection(testParams = {}) {
  const res = await fetch(`${API_BASE}/biostar/test-connection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testParams)
  });
  return await res.json();
}

export async function syncBioStarNow() {
  const res = await fetch(`${API_BASE}/biostar/sync-now`, { method: 'POST' });
  return await res.json();
}

export async function simulateBioStarPunch(eventData = {}) {
  const res = await fetch(`${API_BASE}/biostar/simulate-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
  return await res.json();
}

export async function remoteDoorUnlock(doorId) {
  const res = await fetch(`${API_BASE}/doors/${doorId}/unlock`, { method: 'POST' });
  return await res.json();
}

export async function remoteDoorLock(doorId) {
  const res = await fetch(`${API_BASE}/doors/${doorId}/lock`, { method: 'POST' });
  return await res.json();
}

export async function resetDeviceTamper(deviceId) {
  const res = await fetch(`${API_BASE}/devices/tamper-reset/${deviceId}`, { method: 'POST' });
  return await res.json();
}

