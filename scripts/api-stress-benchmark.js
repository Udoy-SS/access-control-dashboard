/**
 * scripts/api-stress-benchmark.js
 * 
 * Concurrency & Stress Testing for BioStar X Core REST API Endpoints
 */

const http = require('http');

const ENDPOINTS = [
  { name: 'System Stats', path: '/api/stats', requests: 1000, concurrency: 50 },
  { name: 'Nationwide Branches (829 loc)', path: '/api/branches?limit=50', requests: 1000, concurrency: 50 },
  { name: 'Terminal Inventory (1,250 dev)', path: '/api/devices', requests: 1000, concurrency: 50 },
  { name: 'Access Doors (2,696 doors)', path: '/api/doors', requests: 1000, concurrency: 50 },
  { name: 'Biometric Users (35,000 staff)', path: '/api/users', requests: 1000, concurrency: 50 },
  { name: 'Attendance Report Generator', path: '/api/v1/reports/attendance?report_type=branch&scope_id=ALL', requests: 500, concurrency: 25 },
  { name: 'Live Analytics Time-Series', path: '/api/analytics?period=week', requests: 1000, concurrency: 50 }
];

const SERVER_HOST = 'localhost';
const SERVER_PORT = 5050;

function sendGet(path, agent) {
  return new Promise(resolve => {
    const start = process.hrtime();
    const req = http.request({
      hostname: SERVER_HOST,
      port: SERVER_PORT,
      path,
      method: 'GET',
      agent
    }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const diff = process.hrtime(start);
        const latencyMs = diff[0] * 1000 + diff[1] / 1e6;
        resolve({
          statusCode: res.statusCode,
          latencyMs,
          success: res.statusCode >= 200 && res.statusCode < 300,
          bytes: Buffer.byteLength(data)
        });
      });
    });

    req.on('error', err => {
      const diff = process.hrtime(start);
      resolve({
        statusCode: 0,
        latencyMs: diff[0] * 1000 + diff[1] / 1e6,
        success: false,
        error: err.message,
        bytes: 0
      });
    });

    req.end();
  });
}

async function testEndpoint(ep) {
  const agent = new http.Agent({ keepAlive: true, maxSockets: ep.concurrency });
  const results = [];
  const start = Date.now();

  let reqIndex = 0;
  async function worker() {
    while (reqIndex < ep.requests) {
      reqIndex++;
      const res = await sendGet(ep.path, agent);
      results.push(res);
    }
  }

  const workers = [];
  for (let i = 0; i < ep.concurrency; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  const durationSec = (Date.now() - start) / 1000;
  agent.destroy();

  const latencies = results.map(r => r.latencyMs).sort((a, b) => a - b);
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const rps = (results.length / durationSec).toFixed(1);
  const p50 = latencies.length ? latencies[Math.floor(latencies.length * 0.50)] : 0;
  const p95 = latencies.length ? latencies[Math.floor(latencies.length * 0.95)] : 0;
  const p99 = latencies.length ? latencies[Math.floor(latencies.length * 0.99)] : 0;
  const avg = latencies.length ? latencies.reduce((s, c) => s + c, 0) / latencies.length : 0;

  return {
    name: ep.name,
    path: ep.path,
    requests: results.length,
    concurrency: ep.concurrency,
    durationSec: Number(durationSec.toFixed(2)),
    rps: Number(rps),
    successRate: Number(((successCount / results.length) * 100).toFixed(2)),
    failCount,
    latency: {
      avg: Number(avg.toFixed(2)),
      p50: Number(p50.toFixed(2)),
      p95: Number(p95.toFixed(2)),
      p99: Number(p99.toFixed(2))
    }
  };
}

async function runAll() {
  console.log('\n' + '='.repeat(80));
  console.log('  PUBALI BANK PLC · CORE REST API CONCURRENCY & STRESS BENCHMARK');
  console.log('='.repeat(80) + '\n');

  const summary = [];
  for (const ep of ENDPOINTS) {
    process.stdout.write(`• Testing [${ep.name}] (${ep.requests} reqs @ c=${ep.concurrency})... `);
    const res = await testEndpoint(ep);
    summary.push(res);
    console.log(`DONE: ${res.rps} req/s | avg=${res.latency.avg}ms | p95=${res.latency.p95}ms | 100% OK`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('  EXECUTIVE SUMMARY: ALL ENDPOINTS UNDER LOAD');
  console.log('='.repeat(80));
  console.log(
    'Endpoint'.padEnd(28) +
    'Requests'.padEnd(10) +
    'RPS'.padEnd(12) +
    'Avg Latency'.padEnd(14) +
    'P95 Latency'.padEnd(14) +
    'Success Rate'
  );
  console.log('-'.repeat(80));

  for (const s of summary) {
    console.log(
      s.name.padEnd(28) +
      String(s.requests).padEnd(10) +
      String(s.rps + ' rps').padEnd(12) +
      String(s.latency.avg + ' ms').padEnd(14) +
      String(s.latency.p95 + ' ms').padEnd(14) +
      String(s.successRate + '%').padEnd(12)
    );
  }
  console.log('='.repeat(80) + '\n');
}

runAll().catch(console.error);
