/**
 * Hierarchy & Flowchart Diagram Renderers
 * Implements Figures 06, 07, and 10 from specification
 */

const AppDiagrams = {
  /**
   * Figure 06: Access Control Architecture Diagram
   */
  renderAccessArchitecture(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="diagram-card">
        <div class="diagram-header">
          <span class="diagram-badge">Figure 06</span>
          <h4>Access Control Architecture & Level Hierarchy</h4>
          <span class="diagram-tip">Click any node to filter or inspect details</span>
        </div>

        <div class="flowchart-container access-flowchart">
          <div class="flow-row-main">
            <!-- Left Root Node -->
            <div class="flow-node-col">
              <div class="flow-node node-primary" data-filter="all" title="Access Control Central Engine">
                <span class="node-icon">🛡️</span>
                <strong>Access Control</strong>
                <small>Core Security Layer</small>
              </div>
            </div>

            <!-- Horizontal Arrow -->
            <div class="flow-arrow-col">
              <div class="arrow-h red-arrow">
                <span class="arrow-label">Controls</span>
                <div class="arrow-line"></div>
                <div class="arrow-head-right"></div>
              </div>
            </div>

            <!-- Middle Tier: Group & Level -->
            <div class="flow-node-col node-stack">
              <div class="flow-node node-success" data-filter="group" title="Configured Access Groups">
                <span class="node-icon">👥</span>
                <strong>Access Group</strong>
                <small>300 Active Groups</small>
              </div>
              <div class="flow-node node-success" data-filter="level" title="Security Clearance Levels">
                <span class="node-icon">🔑</span>
                <strong>Access Level</strong>
                <small>Levels 1 through 5</small>
              </div>
            </div>

            <!-- Red Forward Arrow -->
            <div class="flow-arrow-col">
              <div class="arrow-h red-arrow-bold">
                <span class="arrow-label">Maps To</span>
                <div class="arrow-line"></div>
                <div class="arrow-head-right"></div>
              </div>
            </div>

            <!-- Right Tier: Branch/Sub-Br/RO/HO -->
            <div class="flow-node-col node-stack">
              <div class="flow-node node-warning" data-filter="Branch" title="Branch Office Access Scope">
                <strong>Branch Group</strong>
                <small>Local Branches (X, Y, Z)</small>
              </div>
              <div class="flow-node node-warning" data-filter="Sub-Branch" title="Sub-Branch Access Scope">
                <strong>Sub-Br Group</strong>
                <small>Express Units (A-Sub, X-Sub)</small>
              </div>
              <div class="flow-node node-warning" data-filter="Regional Office" title="Regional Office Operations">
                <strong>RO Group</strong>
                <small>Regional Clusters (RO-X, RO-Y)</small>
              </div>
              <div class="flow-node node-warning" data-filter="Head Office" title="Global Enterprise HO">
                <strong>HO Group</strong>
                <small>HQ Floors & Data Center</small>
              </div>
            </div>
          </div>

          <!-- Vertical Bidirectional Flow to Floor & Door -->
          <div class="flow-row-sub">
            <div class="vertical-connector red-v-arrow">
              <div class="v-arrow-head-up"></div>
              <div class="v-line"></div>
              <div class="v-arrow-head-down"></div>
            </div>

            <div class="flow-node-row">
              <div class="flow-node node-success" data-filter="floor" title="Elevator & Physical Floor Partitions">
                <span class="node-icon">🏢</span>
                <strong>Floor Level</strong>
                <small>Zoned Floor Rules</small>
              </div>
              <div class="flow-node node-success" data-filter="door" title="Live Telemetry Door Status">
                <span class="node-icon">🚪</span>
                <strong>Door Status</strong>
                <small>Lock / Interlock / Tamper</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    AppDiagrams.bindNodeClicks(el, 'access');
  },

  /**
   * Figure 07: Door Hierarchy Flowchart
   */
  renderDoorArchitecture(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="diagram-card">
        <div class="diagram-header">
          <span class="diagram-badge">Figure 07</span>
          <h4>Door Hierarchy & Purpose Partitioning</h4>
          <span class="diagram-tip">Attendance vs Access Control Doors</span>
        </div>

        <div class="flowchart-container door-flowchart">
          <!-- Top Root -->
          <div class="tree-level level-root">
            <div class="flow-node node-outline" data-filter="all">
              <strong>Door</strong>
            </div>
            <div class="arrow-h-simple">➜</div>
            <div class="flow-node node-success" data-filter="all">
              <strong>All Door</strong>
              <small>60 Configured Doors</small>
            </div>
          </div>

          <!-- Down Arrow -->
          <div class="tree-down-arrow">
            <div class="big-down-arrow">▼</div>
          </div>

          <!-- Dual System Split -->
          <div class="tree-level level-systems">
            <div class="system-branch">
              <div class="flow-node node-primary" data-system="Attendance">
                <span class="node-icon">⏱️</span>
                <strong>Attendance</strong>
                <small>Time & In-Out Clocks</small>
              </div>
              <div class="branch-arrow">▼</div>
              <div class="node-stack sub-doors">
                <div class="door-pill" data-door="X-Branch Attn">X-Branch Attn</div>
                <div class="door-pill" data-door="Y-Branch Attn">Y-Branch Attn</div>
                <div class="door-pill" data-door="Z-Branch Attn">Z-Branch Attn</div>
                <div class="door-pill" data-door="A-Sub-Br-Attn">A-Sub-Br-Attn</div>
                <div class="door-pill" data-door="X-RO-Attn">X-RO-Attn</div>
              </div>
            </div>

            <div class="system-branch">
              <div class="flow-node node-primary" data-system="Access Control">
                <span class="node-icon">🛡️</span>
                <strong>Access Control</strong>
                <small>Physical Barrier & ACS</small>
              </div>
              <div class="branch-arrow">▼</div>
              <div class="node-stack sub-doors">
                <div class="door-pill" data-door="X-Branch ACS">X-Branch ACS</div>
                <div class="door-pill" data-door="Y-Branch ACS">Y-Branch ACS</div>
                <div class="door-pill" data-door="Z-Branch ACS">Z-Branch ACS</div>
                <div class="door-pill" data-door="A-Sub-Br-ACS">A-Sub-Br-ACS</div>
                <div class="door-pill" data-door="X-RO-ACS">X-RO-ACS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    AppDiagrams.bindNodeClicks(el, 'door');
  },

  /**
   * Figure 10: Device Topology Flowchart
   */
  renderDeviceTopology(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="diagram-card">
        <div class="diagram-header">
          <span class="diagram-badge">Figure 10</span>
          <h4>Device Deployment Topology & Group Hierarchy</h4>
          <span class="diagram-tip">Total 48 Terminals across 4 Organizational Tiers</span>
        </div>

        <div class="flowchart-container device-flowchart">
          <!-- Root Device -->
          <div class="tree-level level-root">
            <div class="flow-node node-outline">
              <strong>Device</strong>
            </div>
            <div class="arrow-h-simple">➜</div>
            <div class="flow-node node-success" data-filter="all">
              <strong>All Devices</strong>
              <small>48 Active Controllers & Readers</small>
            </div>
          </div>

          <!-- Big Down Arrow -->
          <div class="tree-down-arrow">
            <div class="big-down-arrow blue-down">▼</div>
          </div>

          <!-- 4 Category Columns -->
          <div class="topology-grid">
            <!-- Branch Column -->
            <div class="topology-col">
              <div class="col-header branch-header" data-cat="Branch">
                <strong>Branch</strong>
              </div>
              <div class="col-arrow">▼</div>
              <div class="col-list">
                <div class="topology-item" data-branch="X-Branch">X-Branch (8 Devices)</div>
                <div class="topology-item" data-branch="Y-Branch">Y-Branch (6 Devices)</div>
                <div class="topology-item" data-branch="Z-Branch">Z-Branch (6 Devices)</div>
                <div class="topology-item more-item">• • • • • • • • • • •</div>
              </div>
            </div>

            <!-- Sub-Branch Column -->
            <div class="topology-col">
              <div class="col-header sub-branch-header" data-cat="Sub-Branch">
                <strong>Sub- Branch</strong>
              </div>
              <div class="col-arrow">▼</div>
              <div class="col-list">
                <div class="topology-item" data-branch="X-Sub Br">X-Sub Br (3 Devices)</div>
                <div class="topology-item" data-branch="A-Sub-Br">A-Sub-Br (4 Devices)</div>
                <div class="topology-item more-item">• • • • • • • • • • •</div>
              </div>
            </div>

            <!-- Regional Office Column -->
            <div class="topology-col">
              <div class="col-header ro-header" data-cat="Regional Office">
                <strong>Regional Office</strong>
              </div>
              <div class="col-arrow">▼</div>
              <div class="col-list">
                <div class="topology-item" data-branch="RO-X">RO-X (10 Devices)</div>
                <div class="topology-item" data-branch="RO-Y">RO-Y (7 Devices)</div>
                <div class="topology-item more-item">• • • • • • • • • • •</div>
              </div>
            </div>

            <!-- Head Office Column -->
            <div class="topology-col">
              <div class="col-header ho-header" data-cat="Head Office">
                <strong>Head Office</strong>
              </div>
              <div class="col-arrow">▼</div>
              <div class="col-list">
                <div class="topology-item" data-branch="Head Office">X-Division (8 Devices)</div>
                <div class="topology-item" data-branch="Head Office">Y-Division (6 Devices)</div>
                <div class="topology-item more-item">• • • • • • • • • • •</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    AppDiagrams.bindNodeClicks(el, 'device');
  },

  bindNodeClicks(el, type) {
    el.querySelectorAll('[data-filter], [data-cat], [data-branch], [data-system], [data-door]').forEach(node => {
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        const filter = node.getAttribute('data-filter') || node.getAttribute('data-cat') || node.getAttribute('data-branch') || node.getAttribute('data-system');
        const doorName = node.getAttribute('data-door');

        if (window.AppReports) {
          if (type === 'access') {
            window.AppReports.renderAccessTable(filter || 'all');
          } else if (type === 'door') {
            window.AppReports.renderDoorTable(filter || doorName || 'all');
          } else if (type === 'device') {
            window.AppReports.renderDeviceTable(filter || 'all');
          }
        }
      });
    });
  }
};

window.AppDiagrams = AppDiagrams;
