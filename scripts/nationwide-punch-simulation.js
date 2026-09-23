/**
 * scripts/nationwide-punch-simulation.js
 * 
 * BioStar X Enterprise Load Testing & Nationwide Peak-Hour Biometric Punch Simulation
 * 
 * Simulates:
 * - 100,000 (1 Lakh) Biometric Transactions
 * - 1,250 Suprema Biometric Terminals (BioStation 3, FaceStation F2, BioLite N2)
 * - 829 Nationwide Branches across all 8 Divisions
 * - High-concurrency parallel streaming
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Parse CLI Arguments
const args = process.argv.slice(2);
function getArg(flag, defaultValue) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) {
    const val = args[idx + 1];
    return isNaN(Number(val)) ? val : Number(val);
  }
  return defaultValue;
}

const TOTAL_EMPLOYEES = getArg('--total', 100000); // 1 Lakh default
const TOTAL_TERMINALS = getArg('--terminals', 1250);
const BATCH_SIZE = getArg('--batch', 100); // 100 punches per batch
const CONCURRENCY = getArg('--concurrency', 50); // 50 concurrent socket streams
const SERVER_HOST = getArg('--host', 'localhost');
const SERVER_PORT = getArg('--port', 5050);

const DIVISIONS = [
  { name: 'Dhaka', weight: 0.38, branches: 315 },
  { name: 'Chattogram', weight: 0.22, branches: 182 },
  { name: 'Sylhet', weight: 0.14, branches: 116 },
  { name: 'Rajshahi', weight: 0.09, branches: 75 },
  { name: 'Khulna', weight: 0.07, branches: 58 },
  { name: 'Barishal', weight: 0.04, branches: 33 },
  { name: 'Rangpur', weight: 0.04, branches: 33 },
  { name: 'Mymensingh', weight: 0.02, branches: 17 }
];

const TERMINAL_MODELS = ['BioStation 3', 'FaceStation F2', 'BioLite N2', 'BioEntry W2'];

// HTTP Agent with keepAlive for realistic connection pooling
const agent = new http.Agent({
  keepAlive: true,
  maxSockets: CONCURRENCY,
  timeout: 15000
});

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getWeightedDivision() {
  const r = Math.random();
  let acc = 0;
  for (const d of DIVISIONS) {
    acc += d.weight;
    if (r <= acc) return d;
  }
  return DIVISIONS[0];
}

// Generate realistic punch transaction
function generatePunch(empId) {
  const div = getWeightedDivision();
  const branchNum = 100 + Math.floor(Math.random() * div.branches);
  const branchCode = `PB-${branchNum.toString().padStart(4, '0')}`;
  const terminalId = `SUP-TM-${1000 + (empId % TOTAL_TERMINALS)}`;
  const model = getRandomElement(TERMINAL_MODELS);
  
  const bioRand = Math.random();
  let verifyMode = 'FINGERPRINT';
  if (bioRand > 0.65 && bioRand <= 0.90) verifyMode = 'RFID_CARD';
  else if (bioRand > 0.90 && bioRand <= 0.97) verifyMode = 'FACIAL_RECOGNITION';
  else if (bioRand > 0.97) verifyMode = 'DUAL_AUTH_FP_CARD';

  const resRand = Math.random();
  let result = 'GRANTED';
  if (resRand > 0.988) result = 'DENIED_INVALID_CRED';
  else if (resRand > 0.975) result = 'GRANTED_LATE_GRACE';

  return {
    employeeId: `PB-${(empId % 90000 + 10000).toString()}`,
    branchCode,
    division: div.name,
    deviceId: terminalId,
    deviceModel: model,
    verifyMode,
    result,
    temperature: Number((36.2 + Math.random() * 0.7).toFixed(1)),
    timestamp: new Date().toISOString()
  };
}

// Send HTTP Batch Request
function sendBatch(punches, terminalId, branchCode) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      deviceId: terminalId,
      branchCode,
      batchSize: punches.length,
      punches
    });

    const start = process.hrtime();

    const req = http.request({
      hostname: SERVER_HOST,
      port: SERVER_PORT,
      path: '/api/biostar/batch-sync',
      method: 'POST',
      agent,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const diff = process.hrtime(start);
        const latencyMs = diff[0] * 1000 + diff[1] / 1e6;
        resolve({
          statusCode: res.statusCode,
          latencyMs,
          success: res.statusCode >= 200 && res.statusCode < 300,
          punchesCount: punches.length
        });
      });
    });

    req.on('error', (err) => {
      const diff = process.hrtime(start);
      const latencyMs = diff[0] * 1000 + diff[1] / 1e6;
      resolve({
        statusCode: 0,
        latencyMs,
        success: false,
        error: err.message,
        punchesCount: punches.length
      });
    });

    req.write(payload);
    req.end();
  });
}

async function runSimulation() {
  const totalBatches = Math.ceil(TOTAL_EMPLOYEES / BATCH_SIZE);
  const memBefore = process.memoryUsage().heapUsed / 1024 / 1024;

  console.log('\n' + '='.repeat(80));
  console.log('  SUPREMA BIOSTAR X — 100,000 (1 LAKH) ENTERPRISE LOAD STRESS TEST');
  console.log('='.repeat(80));
  console.log(`• Target Transaction Volume : ${TOTAL_EMPLOYEES.toLocaleString()} (1 Lakh) Biometric Punches`);
  console.log(`• Active Biometric Terminals: ${TOTAL_TERMINALS.toLocaleString()} Suprema Endpoints`);
  console.log(`• Central Branch Network    : 829 Branches across all 8 Divisions`);
  console.log(`• Batch Size per Push       : ${BATCH_SIZE} punches/batch (${totalBatches.toLocaleString()} batches total)`);
  console.log(`• Concurrent Socket Streams : ${CONCURRENCY} parallel worker connections`);
  console.log(`• Target Server Gateway     : http://${SERVER_HOST}:${SERVER_PORT}`);
  console.log(`• Initial Client Memory     : ${memBefore.toFixed(2)} MB`);
  console.log('='.repeat(80) + '\n');

  // Reset server simulation metrics
  try {
    await new Promise(res => {
      const resetReq = http.request({
        hostname: SERVER_HOST,
        port: SERVER_PORT,
        path: '/api/biostar/reset-simulation',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, res);
      resetReq.on('error', res);
      resetReq.end();
    });
  } catch (_) {}

  console.log(`[▶] Starting high-velocity streaming of ${TOTAL_EMPLOYEES.toLocaleString()} punches...\n`);

  const results = [];
  let completedBatches = 0;
  let completedPunches = 0;
  let nextEmpId = 1;
  const startTime = Date.now();

  // Real-time progress HUD
  const interval = setInterval(() => {
    const elapsedSec = (Date.now() - startTime) / 1000;
    const rps = elapsedSec > 0 ? (completedPunches / elapsedSec).toFixed(0) : 0;
    const batchRps = elapsedSec > 0 ? (completedBatches / elapsedSec).toFixed(0) : 0;
    const progress = ((completedPunches / TOTAL_EMPLOYEES) * 100).toFixed(1);
    process.stdout.write(
      `\r▶ Progress: [${completedPunches.toLocaleString()} / ${TOTAL_EMPLOYEES.toLocaleString()}] (${progress}%) | ` +
      `Batches: ${completedBatches}/${totalBatches} | ` +
      `Punches/sec: ${Number(rps).toLocaleString()} | ` +
      `Batch RPS: ${batchRps} req/s   `
    );
  }, 100);

  // Streaming Worker Pool
  async function worker() {
    while (nextEmpId <= TOTAL_EMPLOYEES) {
      const startId = nextEmpId;
      const count = Math.min(BATCH_SIZE, TOTAL_EMPLOYEES - startId + 1);
      nextEmpId += count;
      if (count <= 0) break;

      const punches = [];
      const div = getWeightedDivision();
      const branchCode = `PB-${(100 + Math.floor(Math.random() * div.branches)).toString().padStart(4, '0')}`;
      const terminalId = `SUP-TM-${1000 + (startId % TOTAL_TERMINALS)}`;

      for (let i = 0; i < count; i++) {
        punches.push(generatePunch(startId + i));
      }

      const res = await sendBatch(punches, terminalId, branchCode);
      results.push(res);
      completedBatches++;
      completedPunches += res.punchesCount;
    }
  }

  const workers = [];
  for (let w = 0; w < CONCURRENCY; w++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  clearInterval(interval);

  const totalDurationSec = (Date.now() - startTime) / 1000;
  const totalDurationMs = Date.now() - startTime;
  const memAfter = process.memoryUsage().heapUsed / 1024 / 1024;

  // Compute Latencies
  const latencies = results.map(r => r.latencyMs).sort((a, b) => a - b);
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const successfulPunches = results.filter(r => r.success).reduce((s, r) => s + r.punchesCount, 0);

  const minLat = latencies.length ? latencies[0] : 0;
  const maxLat = latencies.length ? latencies[latencies.length - 1] : 0;
  const avgLat = latencies.length ? latencies.reduce((s, c) => s + c, 0) / latencies.length : 0;
  const p50 = latencies.length ? latencies[Math.floor(latencies.length * 0.50)] : 0;
  const p90 = latencies.length ? latencies[Math.floor(latencies.length * 0.90)] : 0;
  const p95 = latencies.length ? latencies[Math.floor(latencies.length * 0.95)] : 0;
  const p99 = latencies.length ? latencies[Math.floor(latencies.length * 0.99)] : 0;

  const punchRps = (successfulPunches / totalDurationSec).toFixed(1);
  const batchRps = (results.length / totalDurationSec).toFixed(1);

  console.log(`\r✔ Completed: [${successfulPunches.toLocaleString()} / ${TOTAL_EMPLOYEES.toLocaleString()}] punches (100.0%) in ${totalDurationSec.toFixed(2)}s!                          \n`);

  // Print 100K Executive Benchmark Report
  console.log('='.repeat(80));
  console.log('       PUBALI BANK PLC · 100,000 (1 LAKH) LOAD TEST BENCHMARK REPORT');
  console.log('='.repeat(80));
  console.log(`  Total Biometric Punches : ${successfulPunches.toLocaleString()} / ${TOTAL_EMPLOYEES.toLocaleString()} (1 Lakh)`);
  console.log(`  Total Terminal Batches  : ${results.length.toLocaleString()} HTTP transactions`);
  console.log(`  Overall Success Rate    : ${((successCount / results.length) * 100).toFixed(2)}% (${failCount} errors)`);
  console.log(`  Total Elapsed Time      : ${totalDurationSec.toFixed(2)} seconds (${totalDurationMs.toLocaleString()} ms)`);
  console.log(`  Effective Throughput    : ${Number(punchRps).toLocaleString()} punches / second`);
  console.log(`  Batch Request Rate      : ${Number(batchRps).toLocaleString()} HTTP requests / second`);
  console.log(`  Client Memory Delta     : ${(memAfter - memBefore).toFixed(2)} MB (${memAfter.toFixed(2)} MB total)`);
  console.log('-'.repeat(80));
  console.log(`  HTTP ROUND-TRIP LATENCY (Batch of ${BATCH_SIZE} Punches):`);
  console.log(`    • Min Latency         : ${minLat.toFixed(2)} ms`);
  console.log(`    • Average (Mean)      : ${avgLat.toFixed(2)} ms`);
  console.log(`    • 50th Percentile (P50): ${p50.toFixed(2)} ms`);
  console.log(`    • 90th Percentile (P90): ${p90.toFixed(2)} ms`);
  console.log(`    • 95th Percentile (P95): ${p95.toFixed(2)} ms`);
  console.log(`    • 99th Percentile (P99): ${p99.toFixed(2)} ms`);
  console.log(`    • Max Latency (Peak)  : ${maxLat.toFixed(2)} ms`);
  console.log('-'.repeat(80));
  console.log('  PER-PUNCH TRANSACTION PROCESSING SPEED:');
  console.log(`    • Average Ingestion   : ${(avgLat / BATCH_SIZE).toFixed(3)} ms / employee punch`);
  console.log(`    • P95 Ingestion       : ${(p95 / BATCH_SIZE).toFixed(3)} ms / employee punch`);
  console.log(`    • Capacity Headroom   : ${(1000 / (avgLat / BATCH_SIZE)).toFixed(0)} punches/sec per core capacity`);
  console.log('='.repeat(80) + '\n');

  // Query Server State
  try {
    const statsData = await new Promise(res => {
      http.get(`http://${SERVER_HOST}:${SERVER_PORT}/api/biostar/simulation-stats`, r => {
        let d = '';
        r.on('data', c => { d += c; });
        r.on('end', () => {
          try { res(JSON.parse(d).data); } catch (_) { res(null); }
        });
      }).on('error', () => res(null));
    });

    if (statsData) {
      console.log('  CENTRAL SERVER TELEMETRY:');
      console.log(`    • Punches Recorded by Central Gateway: ${statsData.totalPunchesReceived.toLocaleString()}`);
      console.log(`    • Active Terminals Reporting         : ${statsData.activeTerminalsCount.toLocaleString()}`);
      console.log(`    • Branches Reporting                 : ${statsData.reportingBranchesCount.toLocaleString()}`);
      console.log(`    • Server Internal Latency Avg        : ${statsData.latencyMs.avg} ms`);
      console.log(`    • Biometric Modality Breakdown       : Fingerprint: ${statsData.biometricDistribution.fingerprint.toLocaleString()}, RFID: ${statsData.biometricDistribution.rfid_card.toLocaleString()}, Dual: ${statsData.biometricDistribution.dual.toLocaleString()}`);
      console.log('='.repeat(80) + '\n');
    }
  } catch (_) {}

  agent.destroy();
}

runSimulation().catch(err => {
  console.error('Fatal simulation error:', err);
  process.exit(1);
});
