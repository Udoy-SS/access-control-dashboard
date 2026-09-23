import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\c3f41dd3-6044-4735-89d3-509699ef8f97';
const projectDir = path.resolve(__dirname, '..');

// Helper to base64 encode an image
function getImageBase64(filename) {
  const fullPath = path.join(artifactDir, filename);
  if (fs.existsSync(fullPath)) {
    const data = fs.readFileSync(fullPath).toString('base64');
    return `data:image/jpeg;base64,${data}`;
  }
  console.warn('Image not found:', fullPath);
  return '';
}

const imgNetwork = getImageBase64('banking_network_diagram_1789194046133.jpg');
const imgArch = getImageBase64('system_architecture_diagram_1789194066189.jpg');
const imgDash = getImageBase64('dashboard_mockup_1789194086595.jpg');
const imgBio = getImageBase64('biometric_auth_illustration_1789194108619.jpg');
const imgTree = getImageBase64('branch_monitoring_visualization_1789194144093.jpg');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Suprema BioStar 2.9 - Pubali Bank PLC Enterprise Technology Report</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 16mm 14mm 16mm 14mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      line-height: 1.55;
      font-size: 11pt;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* ─── COVER PAGE ─── */
    .cover-page {
      height: 98vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      padding: 30px 20px;
      border: 3px solid #0f766e;
      border-radius: 8px;
      background: linear-gradient(180deg, #f0fdfa 0%, #ffffff 40%, #f8fafc 100%);
    }

    .cover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0d9488;
      padding-bottom: 16px;
    }

    .bank-brand {
      font-size: 24pt;
      font-weight: 900;
      color: #042f2e;
      letter-spacing: -0.02em;
    }
    .bank-sub {
      font-size: 11pt;
      color: #0d9488;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .tech-badge {
      background: #0f766e;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 11pt;
      font-weight: 800;
      text-align: right;
    }

    .cover-body {
      margin: 40px 0;
    }

    .doc-classification {
      display: inline-block;
      background: #fee2e2;
      color: #991b1b;
      font-size: 9.5pt;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 4px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 16px;
      border: 1px solid #fecaca;
    }

    .doc-title {
      font-size: 28pt;
      font-weight: 900;
      line-height: 1.18;
      color: #0b1e36;
      margin: 0 0 14px 0;
      letter-spacing: -0.03em;
    }

    .doc-subtitle {
      font-size: 15pt;
      font-weight: 600;
      color: #0d9488;
      margin: 0 0 24px 0;
      line-height: 1.35;
    }

    .doc-summary {
      font-size: 11.5pt;
      color: #475569;
      max-width: 680px;
      line-height: 1.6;
      margin-bottom: 30px;
    }

    .scope-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #ffffff;
      border: 1px solid #ccfbf1;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.08);
    }
    .scope-item {
      text-align: center;
      border-right: 1px solid #e2e8f0;
    }
    .scope-item:last-child {
      border-right: none;
    }
    .scope-val {
      font-size: 18pt;
      font-weight: 900;
      color: #0f766e;
    }
    .scope-lbl {
      font-size: 9pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }

    .cover-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      font-size: 9.5pt;
      color: #64748b;
    }

    /* ─── DOCUMENT STYLING ─── */
    .page {
      page-break-after: always;
      position: relative;
      min-height: 94vh;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #0d9488;
      padding-bottom: 4px;
      margin-bottom: 12px;
      font-size: 8pt;
      font-weight: 700;
      color: #0f766e;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    h1, h2, h3, h4 {
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    h1 {
      font-size: 15pt;
      font-weight: 800;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 10px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    h1:first-of-type {
      margin-top: 0;
    }
    h1 .sec-num {
      background: #0d9488;
      color: #ffffff;
      padding: 1px 8px;
      border-radius: 4px;
      font-size: 11pt;
    }

    h2 {
      font-size: 12pt;
      font-weight: 700;
      color: #0f766e;
      margin-top: 10px;
      margin-bottom: 6px;
    }

    h3 {
      font-size: 10pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 8px;
      margin-bottom: 4px;
    }

    p {
      margin: 0 0 8px 0;
      text-align: justify;
      font-size: 9.5pt;
      line-height: 1.5;
    }

    /* ─── TABLES ─── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 12px 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }

    th {
      background: #0f766e;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #0f766e;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.03em;
    }

    td {
      padding: 5px 8px;
      border: 1px solid #e2e8f0;
      line-height: 1.4;
    }

    tr:nth-child(even) {
      background: #f8fafc;
    }

    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8pt;
    }

    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 7.5pt;
      font-weight: 700;
    }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-teal { background: #ccfbf1; color: #0f766e; }
    .badge-amber { background: #fef3c7; color: #92400e; }

    /* ─── IMAGES & FIGURES ─── */
    .figure-container {
      margin: 8px 0 12px 0;
      text-align: center;
      page-break-inside: avoid;
    }

    .figure-img {
      width: 100%;
      max-height: 245px;
      object-fit: contain;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      background: #0f172a;
    }

    .figure-caption {
      font-size: 8pt;
      color: #64748b;
      margin-top: 4px;
      font-weight: 600;
    }

    /* ─── CALLOUT BOXES ─── */
    .callout {
      border-left: 3.5px solid #0d9488;
      background: #f0fdfa;
      padding: 8px 12px;
      border-radius: 0 5px 5px 0;
      margin: 8px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    .callout-title {
      font-weight: 700;
      color: #0f766e;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* ─── WORKFLOW / FLOW BOXES ─── */
    .flow-steps {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin: 8px 0;
      page-break-inside: avoid;
    }
    .flow-step {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 6px 10px;
      border-radius: 5px;
    }
    .flow-badge {
      background: #0d9488;
      color: #fff;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8pt;
      font-weight: 800;
      flex-shrink: 0;
    }
    .flow-text {
      font-size: 8.5pt;
      font-weight: 500;
      color: #334155;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      page-break-inside: avoid;
    }

    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;
    }
  </style>
</head>
<body>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- COVER PAGE -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="cover-page">
    <div class="cover-header">
      <div>
        <div class="bank-brand">PUBALI BANK PLC</div>
        <div class="bank-sub">Corporate ICT Security & Physical Infrastructure</div>
      </div>
      <div class="tech-badge">
        Suprema BioStar 2.9<br>
        <span style="font-size: 8.5pt; font-weight: 400; opacity: 0.9;">Enterprise Security Platform</span>
      </div>
    </div>

    <div class="cover-body">
      <div class="doc-classification">Strictly Confidential — Executive & Board Technical Report</div>
      <h1 class="doc-title">Centralized Biometric Access Control & Employee Time Attendance Management Platform</h1>
      <div class="doc-subtitle">Nationwide Deployment Blueprint for 829 Banking Facilities</div>
      
      <div class="doc-summary">
        A comprehensive enterprise engineering proposal and technical architecture report demonstrating the centralization of biometric access security, dual-custody currency vault protection, high-accuracy AI facial recognition time-attendance, and real-time security operations center (SOC) monitoring across Pubali Bank PLC's nationwide network.
      </div>

      <div class="scope-strip">
        <div class="scope-item">
          <div class="scope-val">829</div>
          <div class="scope-lbl">Total Locations</div>
        </div>
        <div class="scope-item">
          <div class="scope-val">1,658+</div>
          <div class="scope-lbl">Suprema Devices</div>
        </div>
        <div class="scope-item">
          <div class="scope-val">35,000</div>
          <div class="scope-lbl">Enrolled Staff</div>
        </div>
        <div class="scope-item">
          <div class="scope-val">99.9%</div>
          <div class="scope-lbl">System Uptime SLA</div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div><strong>Document Reference:</strong> PB-SEC-BIOSTAR-2026-V1</div>
      <div><strong>Classification:</strong> Bank Executive Demonstration</div>
      <div><strong>Date:</strong> September 2026</div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- PAGE 1: EXECUTIVE SUMMARY & SECURITY CHALLENGES -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="page">
    <div class="page-header">
      <span>Pubali Bank PLC · Suprema BioStar 2.9 Executive Report</span>
      <span>Section 1 & 2 · Executive Summary & Security Challenges</span>
    </div>

    <h1><span class="sec-num">01</span> Executive Summary</h1>
    <p>
      Pubali Bank PLC operates one of Bangladesh's largest retail and corporate banking networks, encompassing <strong>829 physical banking installations</strong> (1 Principal Head Office, 29 Regional Offices, 519 Full-Service Branches, 281 Upashakha Sub-Branches, and 29 Islamic Banking Windows). Safeguarding physical assets, vault cash reserves, server room IT infrastructure, and verifying employee attendance across this geographic distribution demands transition from decentralized legacy methods to an enterprise-grade centralized security architecture.
    </p>
    <p>
      Centralized biometric security management is essential in contemporary commercial banking to guarantee non-repudiable identification, satisfy strict <strong>Bangladesh Bank Cyber and Physical Security Directives</strong>, prevent proxy attendance fraud, and empower Head Office Security Operations with sub-second visibility into every physical door breach or tamper alarm across Bangladesh.
    </p>

    <div class="callout">
      <div class="callout-title">Strategic Recommendation</div>
      Deploy the <strong>Suprema BioStar 2.9 Enterprise Management Suite</strong> in a high-availability server cluster at Head Office (Motijheel, Dhaka), interconnecting all 29 Regional Offices and 800+ branch endpoints via secure MPLS IP-VPN encrypted tunnels with dual-custody CoreStation controllers and FaceStation F2 terminals.
    </div>

    <h1><span class="sec-num">02</span> Current Banking Security Challenges</h1>
    <p>
      The decentralized branch security footprint currently facing Pubali Bank PLC introduces substantial operational vulnerabilities:
    </p>

    <table>
      <thead>
        <tr>
          <th style="width: 26%;">Operational Challenge</th>
          <th style="width: 37%;">Legacy In-Branch Limitation</th>
          <th style="width: 37%;">Risk to Pubali Bank PLC</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Dispersed Siloed Locations</strong></td>
          <td>Standalone access readers operating in offline silos without central sync.</td>
          <td>Employee transfers require manual re-enrollment at each location.</td>
        </tr>
        <tr>
          <td><strong>Zero Real-Time SOC Visibility</strong></td>
          <td>Physical security alarms (door forced, tamper) stay local to the branch siren.</td>
          <td>Head Office SOC remains unaware of after-hours vault intrusions.</td>
        </tr>
        <tr>
          <td><strong>Hardware Health Blindspots</strong></td>
          <td>Reader failures are only detected when an employee reports an issue.</td>
          <td>Prolonged hardware downtime at high-security cash gates and server rooms.</td>
        </tr>
        <tr>
          <td><strong>Manual Attendance Registers</strong></td>
          <td>Paper logs, buddy punching, and unverified branch spreadsheet submissions.</td>
          <td>Payroll inaccuracies, unauthorized overtime claims, and ghost attendance.</td>
        </tr>
        <tr>
          <td><strong>Delayed Troubleshooting</strong></td>
          <td>IT personnel must physically travel to regional branches to pull event logs.</td>
          <td>High maintenance overhead and multi-day investigation latency.</td>
        </tr>
        <tr>
          <td><strong>Regulatory Audit Compliance</strong></td>
          <td>Difficulty producing consolidated, tamper-proof physical access audit logs.</td>
          <td>Compliance penalties and adverse findings during central bank audits.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- PAGE 2: PROPOSED SOLUTION OVERVIEW -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="page">
    <div class="page-header">
      <span>Pubali Bank PLC · Suprema BioStar 2.9 Executive Report</span>
      <span>Section 3 · Proposed Solution & Network Diagram</span>
    </div>

    <h1><span class="sec-num">03</span> Proposed Solution Overview</h1>
    <p>
      <strong>Suprema BioStar 2.9</strong> delivers a unified web-based enterprise access control and time attendance management architecture engineered specifically for multi-tier banking institutions. It consolidates credential provisioning, real-time telemetry, automated shift attendance, and audit reporting into a single operational interface across all 829 branches nationwide.
    </p>

    <div class="figure-container" style="margin: 14px 0;">
      <img src="${imgNetwork}" class="figure-img" style="max-height: 380px;" alt="Enterprise Banking Network Diagram">
      <div class="figure-caption">Figure 01: Pubali Bank PLC Enterprise Banking Network Diagram (Central Data Center to 29 Regional Zones & Branches)</div>
    </div>

    <div class="grid-2" style="margin-top: 14px;">
      <div class="card">
        <h3 style="color:#0f766e; margin-top:0;">Unified Centralized Telemetry</h3>
        <p style="font-size:8.5pt;">Continuous 30-second automated hardware heartbeat monitoring across all 1,658 terminals nationwide, alerting Head Office instantly of device dropouts.</p>
      </div>
      <div class="card">
        <h3 style="color:#0f766e; margin-top:0;">Encrypted Multi-Tier Transport</h3>
        <p style="font-size:8.5pt;">All communications over the bank's MPLS IP-VPN backbone utilize TLS 1.3 encryption and AES-256 encrypted biometric credential storage.</p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- PAGE 3: SYSTEM ARCHITECTURE DESIGN -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="page">
    <div class="page-header">
      <span>Pubali Bank PLC · Suprema BioStar 2.9 Executive Report</span>
      <span>Section 4 · System Architecture Design</span>
    </div>

    <h1><span class="sec-num">04</span> System Architecture Design</h1>
    <p>
      The architecture utilizes a resilient 4-tier financial technology topology connecting the Pubali Bank Head Office Active-Passive Server Cluster to Regional Gateways and branch-level intelligent controllers:
    </p>

    <div class="figure-container" style="margin: 10px 0;">
      <img src="${imgArch}" class="figure-img" style="max-height: 290px;" alt="System Architecture Diagram">
      <div class="figure-caption">Figure 02: Suprema BioStar 2.9 Banking System Architecture Design (Central Server, CoreStation & Terminal Interconnects)</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Device Model</th>
          <th>Physical Location</th>
          <th>Biometric / Protocol</th>
          <th>Primary Banking Role</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Suprema FaceStation F2</strong></td>
          <td>Main Branch Gates, Executive Enclosures</td>
          <td>Fusion AI Face (Visual + IR), RFID</td>
          <td>High-speed, touchless anti-spoofing biometric entry.</td>
        </tr>
        <tr>
          <td><strong>Suprema BioStation 2 / 3</strong></td>
          <td>Teller Counters, Staff Doors, Upashakhas</td>
          <td>500 DPI Optical Fingerprint, Mobile NFC/BLE</td>
          <td>Staff access verification and Time Attendance logging.</td>
        </tr>
        <tr>
          <td><strong>Suprema CoreStation</strong></td>
          <td>Cash Vaults, Strong Rooms, Server Racks</td>
          <td>4-Door Intelligent Controller, RS-485 OSDP</td>
          <td>Hardware dual-custody interlock, offline decision buffer.</td>
        </tr>
        <tr>
          <td><strong>Suprema Secure I/O 2</strong></td>
          <td>Vault Doors & Fire Exit Relays</td>
          <td>Encrypted RS-485, Supervised Inputs</td>
          <td>Prevents door jimmying by keeping relay wiring inside secure zone.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- PAGE 4: ACCESS CONTROL & BIOMETRICS -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="page">
    <div class="page-header">
      <span>Pubali Bank PLC · Suprema BioStar 2.9 Executive Report</span>
      <span>Section 5 & 6 · Access Control & Biometric Multi-Factor Authentication</span>
    </div>

    <h1><span class="sec-num">05</span> Access Control Module</h1>
    <div class="grid-2">
      <div class="card">
        <h3 style="color:#0f766e; margin-top:0;">Dual-Custody Vault Access</h3>
        <p style="font-size:8.5pt;">Requires two authorized officers (e.g., Branch Manager and Cash Incharge) to authenticate within 15 seconds of each other before CoreStation disengages the magnetic time-lock relay.</p>
      </div>
      <div class="card">
        <h3 style="color:#0f766e; margin-top:0;">Interlock Airlock Mantrap</h3>
        <p style="font-size:8.5pt;">Ensures Outer Lobby Door and Inner Teller/Vault Door cannot be open simultaneously, physically preventing forced entry and tailgating.</p>
      </div>
    </div>

    <h1><span class="sec-num">06</span> Biometric Multi-Factor Authentication</h1>
    <p>
      The platform enforces multimodal authentication tailored to the security classification of each banking zone:
    </p>

    <div class="figure-container" style="margin: 8px 0;">
      <img src="${imgBio}" class="figure-img" style="max-height: 250px;" alt="Biometric Multi-Factor Authentication">
      <div class="figure-caption">Figure 03: Multi-Factor Biometric Verification Concept (FaceStation F2 AI Scan, Fingerprint & Encrypted Smartcard)</div>
    </div>

    <div class="flow-steps">
      <div class="flow-step">
        <div class="flow-badge">1</div>
        <div class="flow-text"><strong>Tier 1 — General Staff Entry:</strong> FaceStation F2 Dual AI Face Recognition (Visual RGB + Infrared Depth) at 0.5s speed with live skin detection, eliminating buddy punching.</div>
      </div>
      <div class="flow-step">
        <div class="flow-badge">2</div>
        <div class="flow-text"><strong>Tier 2 — Cash Counter & Server Room:</strong> 2-Factor Authentication (Encrypted DESFire Smartcard + Biometric Fingerprint scan).</div>
      </div>
      <div class="flow-step">
        <div class="flow-badge">3</div>
        <div class="flow-text"><strong>Tier 3 — Currency Vault & Treasury:</strong> Multi-Factor Dual-Custody (Manager Face + Cashier Fingerprint + Vault Keypad PIN).</div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- PAGE 5: TIME ATTENDANCE MODULE -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="page">
    <div class="page-header">
      <span>Pubali Bank PLC · Suprema BioStar 2.9 Executive Report</span>
      <span>Section 7 · Time Attendance (T&A) Module</span>
    </div>

    <h1><span class="sec-num">07</span> Time Attendance (T&A) Module</h1>
    <p>
      BioStar 2.9 incorporates an enterprise T&A engine synchronizing daily punches across all 829 branches directly into Pubali Bank's Core ERP / HRMS software:
    </p>

    <div class="grid-2" style="margin-bottom: 12px;">
      <div class="card">
        <h3 style="color:#0f766e; margin-top:0;">Flexible Banking Shifts</h3>
        <p style="font-size:8.5pt;">Supports distinct operational schedules: General Banking (09:00 - 17:00), Evening Clearing Window, and 24/7 Shift Rotations for Central IT Data Center & ATM monitoring.</p>
      </div>
      <div class="card">
        <h3 style="color:#0f766e; margin-top:0;">Automated Grace Periods</h3>
        <p style="font-size:8.5pt;">Configurable 15-minute grace tolerance; automatic flagging and escalation of late arrivals and unexcused early departures with central HR notifications.</p>
      </div>
    </div>

    <h3>Consolidated Nationwide Branch Attendance Telemetry</h3>
    <table>
      <thead>
        <tr>
          <th>Branch Name</th>
          <th>Code</th>
          <th>Zone</th>
          <th>Total Staff</th>
          <th>Present</th>
          <th>Late</th>
          <th>Absent</th>
          <th>Punctuality %</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Head Office (Principal Branch)</strong></td>
          <td class="mono">0101</td>
          <td>Dhaka Central</td>
          <td>840</td>
          <td class="badge-green">812</td>
          <td class="badge-amber">14</td>
          <td class="badge-red">14</td>
          <td><strong>98.3%</strong></td>
        </tr>
        <tr>
          <td><strong>Motijheel Branch</strong></td>
          <td class="mono">0102</td>
          <td>Dhaka Central</td>
          <td>165</td>
          <td class="badge-green">158</td>
          <td class="badge-amber">5</td>
          <td class="badge-red">2</td>
          <td><strong>96.8%</strong></td>
        </tr>
        <tr>
          <td><strong>Dhanmondi Branch</strong></td>
          <td class="mono">0142</td>
          <td>Dhaka South</td>
          <td>150</td>
          <td class="badge-green">144</td>
          <td class="badge-amber">4</td>
          <td class="badge-red">2</td>
          <td><strong>97.2%</strong></td>
        </tr>
        <tr>
          <td><strong>Agrabad Commercial Branch</strong></td>
          <td class="mono">0201</td>
          <td>Chattogram</td>
          <td>210</td>
          <td class="badge-green">198</td>
          <td class="badge-amber">8</td>
          <td class="badge-red">4</td>
          <td><strong>95.9%</strong></td>
        </tr>
        <tr>
          <td><strong>Sylhet Main Branch</strong></td>
          <td class="mono">0301</td>
          <td>Sylhet East</td>
          <td>185</td>
          <td class="badge-green">179</td>
          <td class="badge-amber">3</td>
          <td class="badge-red">3</td>
          <td><strong>98.3%</strong></td>
        </tr>
        <tr>
          <td><strong>Rajshahi Branch</strong></td>
          <td class="mono">0401</td>
          <td>Rajshahi</td>
          <td>140</td>
          <td class="badge-green">136</td>
          <td class="badge-amber">2</td>
          <td class="badge-red">2</td>
          <td><strong>98.6%</strong></td>
        </tr>
        <tr>
          <td><strong>Khulna Main Branch</strong></td>
          <td class="mono">0501</td>
          <td>Khulna</td>
          <td>160</td>
          <td class="badge-green">155</td>
          <td class="badge-amber">3</td>
          <td class="badge-red">2</td>
          <td><strong>98.1%</strong></td>
        </tr>
        <tr>
          <td><strong>Total Pubali Bank Network</strong></td>
          <td class="mono"><strong>829 Loc</strong></td>
          <td><strong>29 Zones</strong></td>
          <td><strong>35,000</strong></td>
          <td class="badge-green"><strong>33,880</strong></td>
          <td class="badge-amber"><strong>682</strong></td>
          <td class="badge-red"><strong>438</strong></td>
          <td><strong>98.0%</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- PAGE 6: CENTRAL MONITORING DASHBOARD -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="page">
    <div class="page-header">
      <span>Pubali Bank PLC · Suprema BioStar 2.9 Executive Report</span>
      <span>Section 8 · Central Monitoring Dashboard Concept</span>
    </div>

    <h1><span class="sec-num">08</span> Central Monitoring Dashboard Concept</h1>
    <p>
      The Security Operations Center (SOC) dashboard consolidates real-time telemetry from all 829 branches onto an executive single-screen display:
    </p>

    <div class="figure-container" style="margin: 14px 0;">
      <img src="${imgDash}" class="figure-img" style="max-height: 380px;" alt="Executive SOC Dashboard Mockup">
      <div class="figure-caption">Figure 04: Pubali Bank PLC Executive SOC Dashboard (Real-Time Biometric Traffic & Alarm Stream)</div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3 style="color:#0f766e; margin-top:0;">Real-Time Alarm Stream</h3>
        <p style="font-size:8.5pt;">Prioritizes critical security events: tamper alarms on vault doors, unforced entries, and consecutive failed biometric attempts with interactive map location pins.</p>
      </div>
      <div class="card">
        <h3 style="color:#0f766e; margin-top:0;">Dual-Screen SOC Integration</h3>
        <p style="font-size:8.5pt;">Supports native multi-monitor popout windows for dedicated video wall displays in Pubali Bank's Central Security Operations Center.</p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- PAGE 7: BRANCH MONITORING STRUCTURE -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="page">
    <div class="page-header">
      <span>Pubali Bank PLC · Suprema BioStar 2.9 Executive Report</span>
      <span>Section 9 · Branch Monitoring Structure & Hierarchy</span>
    </div>

    <h1><span class="sec-num">09</span> Branch Monitoring Structure & Hierarchy</h1>
    <p>
      The system models Pubali Bank's organizational chart into an interactive 5-tier telemetry structure:
    </p>

    <div class="figure-container" style="margin: 14px 0;">
      <img src="${imgTree}" class="figure-img" style="max-height: 380px;" alt="Branch Hierarchy Monitoring Visualization">
      <div class="figure-caption">Figure 05: Pubali Bank PLC Biometric Branch Monitoring Hierarchy (Head Office down to Upashakha Sub-Branches)</div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3 style="color:#0f766e; margin-top:0;">Regional Zone Delegated Admin</h3>
        <p style="font-size:8.5pt;">Regional Managers possess administrative oversight to view branches within their designated zone, approving temporary roaming credentials without Head Office bottlenecks.</p>
      </div>
      <div class="card">
        <h3 style="color:#0f766e; margin-top:0;">Parent-Child Upashakha Mapping</h3>
        <p style="font-size:8.5pt;">All 281 Upashakha sub-branches are logically mapped to their controlling parent branch, inheriting security policies and dual-custody audit oversight.</p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- PAGE 8: REPORTING SYSTEM & BUSINESS ROI -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="page">
    <div class="page-header">
      <span>Pubali Bank PLC · Suprema BioStar 2.9 Executive Report</span>
      <span>Section 10 & 11 · Enterprise Reporting & Business Benefits</span>
    </div>

    <h1><span class="sec-num">10</span> Enterprise Reporting System</h1>
    <p>
      The platform incorporates an automated reporting engine generating scheduled operational summaries and on-demand forensic compliance reports:
    </p>

    <div class="grid-2" style="margin-bottom: 16px;">
      <div class="card">
        <h3 style="color:#0f766e; margin-top:0;">User & Access Reports</h3>
        <p style="font-size:8.5pt;">Directory of 35,000 personnel with template enrollment health. Access logs record User ID, timestamp, branch, door name, and verification result with sub-second precision.</p>
      </div>
      <div class="card">
        <h3 style="color:#0f766e; margin-top:0;">Device & Door Telemetry</h3>
        <p style="font-size:8.5pt;">Hardware status tracking IP/MAC addresses, firmware OTA status, door sensor states (Open/Closed), and forced entry relay alarms.</p>
      </div>
      <div class="card">
        <h3 style="color:#0f766e; margin-top:0;">Attendance & Payroll Reports</h3>
        <p style="font-size:8.5pt;">Shift reconciliation, daily in/out logs, grace-period variances, and automated monthly roll-call spreadsheets for instant payroll ingestion.</p>
      </div>
      <div class="card">
        <h3 style="color:#0f766e; margin-top:0;">Forensic Compliance Audit</h3>
        <p style="font-size:8.5pt;">Immutable audit logs capturing every administrative action (card assignment, door policy change, manual unlock) for Bangladesh Bank compliance.</p>
      </div>
    </div>

    <h1><span class="sec-num">11</span> Strategic Business Benefits & ROI</h1>
    <p>
      Centralizing physical access and attendance monitoring generates measurable operational return on investment:
    </p>

    <div class="scope-strip" style="margin-top:12px;">
      <div class="scope-item">
        <div class="scope-val">90%</div>
        <div class="scope-lbl">Faster Incident Escalation</div>
      </div>
      <div class="scope-item">
        <div class="scope-val">0%</div>
        <div class="scope-lbl">Proxy Punching</div>
      </div>
      <div class="scope-item">
        <div class="scope-val">120+</div>
        <div class="scope-lbl">Hours Saved/Region/Mo</div>
      </div>
      <div class="scope-item">
        <div class="scope-val">100%</div>
        <div class="scope-lbl">Regulatory Compliance</div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- PAGE 9: DEMO SCENARIO, ROADMAP & SIGN-OFF -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="page">
    <div class="page-header">
      <span>Pubali Bank PLC · Suprema BioStar 2.9 Executive Report</span>
      <span>Section 12, 13 & 14 · Operational Workflow & Future Roadmap</span>
    </div>

    <h1><span class="sec-num">12</span> End-to-End Demonstration Scenario</h1>
    <p>
      The technical demonstration executed in this pilot reproduces a realistic day-in-the-life banking operational workflow:
    </p>

    <div class="flow-steps">
      <div class="flow-step">
        <div class="flow-badge">1</div>
        <div class="flow-text"><strong>Officer Arrival & Verification:</strong> Branch Cash Officer approaches branch turnstile; FaceStation F2 authenticates face in 0.4s under IR depth validation.</div>
      </div>
      <div class="flow-step">
        <div class="flow-badge">2</div>
        <div class="flow-text"><strong>Dual-Custody Vault Access:</strong> Branch Manager and Cash Officer authenticate sequentially at vault airlock; CoreStation disengages time-lock relay.</div>
      </div>
      <div class="flow-step">
        <div class="flow-badge">3</div>
        <div class="flow-text"><strong>Automated Local Execution:</strong> CoreStation verifies credential from local flash buffer, ensuring access succeeds even if WAN connection is offline.</div>
      </div>
      <div class="flow-step">
        <div class="flow-badge">4</div>
        <div class="flow-text"><strong>Central Server Synchronization:</strong> Access event is transmitted via TLS 1.3 to Central Server in Dhaka, recording biometric arrival time.</div>
      </div>
      <div class="flow-step">
        <div class="flow-badge">5</div>
        <div class="flow-text"><strong>Head Office SOC Real-Time Visibility:</strong> Within 350ms, Head Office executive dashboard reflects terminal health, punctuality KPIs, and security logs.</div>
      </div>
    </div>

    <h1><span class="sec-num">13</span> Future Expansion Roadmap</h1>
    <table>
      <thead>
        <tr>
          <th>Implementation Phase</th>
          <th>Timeline</th>
          <th>Key Deliverables & Technology Scope</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Phase 1: Core Deployment (Current)</strong></td>
          <td>Completed</td>
          <td>BioStar 2.9 server cluster, 829 location hierarchy, FaceStation F2 & BioStation 2 pilots.</td>
        </tr>
        <tr>
          <td><strong>Phase 2: Core ERP & HRMS Integration</strong></td>
          <td>Q4 2026</td>
          <td>RESTful API integration with Pubali Bank's Oracle/SAP HRMS for automated payroll sync.</td>
        </tr>
        <tr>
          <td><strong>Phase 3: Executive Mobile Application</strong></td>
          <td>Q1 2027</td>
          <td>iOS/Android native mobile app for Regional Managers with real-time push alert notifications.</td>
        </tr>
        <tr>
          <td><strong>Phase 4: Integrated Video Surveillance</strong></td>
          <td>Q2 2027</td>
          <td>Integration of NVR CCTV video feeds bookmarking video footage to BioStar access events.</td>
        </tr>
      </tbody>
    </table>

    <h1><span class="sec-num">14</span> Presentation Sign-Off & Approvals</h1>
    <p style="font-size: 8.5pt; color: #64748b;">
      This technical report verifies the operational readiness of the Suprema BioStar 2.9 platform for nationwide deployment across Pubali Bank PLC.
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 24px; page-break-inside: avoid;">
      <div style="border-top: 1.5px solid #0d9488; padding-top: 8px;">
        <div style="font-size: 9.5pt; font-weight: 700; color: #0f172a;">Prepared by:</div>
        <div style="font-size: 8.5pt; color: #475569;">Enterprise Security Architecture Team</div>
        <div style="font-size: 8.5pt; color: #64748b;">Suprema Solutions Integration Division</div>
      </div>
      <div style="border-top: 1.5px solid #0d9488; padding-top: 8px;">
        <div style="font-size: 9.5pt; font-weight: 700; color: #0f172a;">Reviewed & Accepted by:</div>
        <div style="font-size: 8.5pt; color: #475569;">Head of Information & Communication Technology</div>
        <div style="font-size: 8.5pt; color: #64748b;">Pubali Bank PLC, Head Office, Dhaka</div>
      </div>
    </div>
  </div>

</body>
</html>
`;

// Write HTML file to disk
const htmlPath = path.join(projectDir, 'enterprise_banking_biostar_report.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
console.log('HTML report generated at:', htmlPath);

// Destination PDF paths
const outputPdfPathArtifact = path.join(artifactDir, 'enterprise_banking_biostar_report.pdf');
const outputPdfPathProject = path.join(projectDir, 'enterprise_banking_biostar_report.pdf');

// Run headless Chrome to print-to-pdf
const chromePath = 'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
const cmd = `cmd.exe /c ""${chromePath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${outputPdfPathProject}" "${htmlPath}""`;

console.log('Running Chrome headless print command...');
try {
  const result = execSync(cmd, { encoding: 'utf-8' });
  console.log('Chrome execution result:', result);

  if (fs.existsSync(outputPdfPathProject)) {
    const stats = fs.statSync(outputPdfPathProject);
    console.log(`Success! PDF generated at: ${outputPdfPathProject} (${(stats.size / 1024).toFixed(1)} KB)`);

    // Copy to artifact directory as well
    fs.copyFileSync(outputPdfPathProject, outputPdfPathArtifact);
    console.log(`Copied PDF to artifact directory: ${outputPdfPathArtifact}`);
  } else {
    console.error('PDF file was not created.');
  }
} catch (err) {
  console.error('Error generating PDF with Chrome:', err.message);
}
