/**
 * Report Data Table & Export Controller
 */

const AppReports = {
  activeDataset: [],
  currentCategory: '',
  currentFilter: 'all',
  searchQuery: '',

  renderUserTable(filter = 'all', filterName = 'All Users') {
    this.currentCategory = 'user';
    this.currentFilter = filter;
    let data = window.AppData.users;

    if (filter !== 'all') {
      data = data.filter(u => u.category === filter || u.branch.toLowerCase().includes(filter.toLowerCase()) || u.department.toLowerCase().includes(filter.toLowerCase()));
    }

    this.activeDataset = data;
    this.displayGrid({
      title: `User Report: ${filterName}`,
      columns: [
        { key: 'id', label: 'User ID' },
        { key: 'name', label: 'Full Name' },
        { key: 'department', label: 'Department / Group' },
        { key: 'branch', label: 'Assigned Branch' },
        { key: 'role', label: 'System Role' },
        { key: 'card', label: 'Card Badge' },
        { key: 'biometrics', label: 'Biometric Credentials', render: (row) => `
          <div class="bio-badges">
            <span class="badge ${row.fingerprint ? 'b-on' : 'b-off'}" title="Fingerprint">FP</span>
            <span class="badge ${row.card ? 'b-on' : 'b-off'}" title="Smart Card / RFID">CARD</span>
          </div>
        `},
        { key: 'status', label: 'Status', render: (row) => `
          <span class="status-pill ${row.status === 'Active' ? 'status-active' : 'status-suspended'}">${row.status}</span>
        `}
      ],
      data
    });
  },

  renderAccessTable(filter = 'all', filterName = 'All Access Groups') {
    this.currentCategory = 'access';
    this.currentFilter = filter;
    let data = window.AppData.accessGroups;

    if (filter !== 'all') {
      data = data.filter(ag => ag.category.toLowerCase().includes(filter.toLowerCase()) || ag.branch.toLowerCase().includes(filter.toLowerCase()) || (filter === 'group') || (filter === 'level'));
    }

    this.activeDataset = data;
    this.displayGrid({
      title: `Access Report: ${filterName}`,
      columns: [
        { key: 'id', label: 'Group ID' },
        { key: 'name', label: 'Access Group Name' },
        { key: 'category', label: 'Category / Tier' },
        { key: 'branch', label: 'Scope' },
        { key: 'accessLevel', label: 'Clearance Level' },
        { key: 'doorsCount', label: 'Doors Mapped' },
        { key: 'floorLevel', label: 'Floor Level' },
        { key: 'doorStatus', label: 'Door Policy' },
        { key: 'schedule', label: 'Time Schedule' },
        { key: 'activeUsers', label: 'Members', render: (row) => `<strong>${row.activeUsers} Users</strong>` }
      ],
      data
    });
  },

  renderDeviceTable(filter = 'all', filterName = 'All Devices') {
    this.currentCategory = 'device';
    this.currentFilter = filter;
    let data = window.AppData.devices;

    if (filter === 'Active' || filter === 'Inactive') {
      data = data.filter(d => d.status === filter);
    } else if (filter !== 'all') {
      data = data.filter(d => d.category.toLowerCase().includes(filter.toLowerCase()) || d.branch.toLowerCase().includes(filter.toLowerCase()));
    }

    this.activeDataset = data;
    this.displayGrid({
      title: `Device Report: ${filterName}`,
      columns: [
        { key: 'id', label: 'Device ID' },
        { key: 'name', label: 'Device Label' },
        { key: 'category', label: 'Deployment Tier' },
        { key: 'branch', label: 'Location' },
        { key: 'model', label: 'Hardware Model' },
        { key: 'ip', label: 'IP Address' },
        { key: 'type', label: 'Reader Tech' },
        { key: 'ping', label: 'Latency' },
        { key: 'uptime', label: 'Uptime' },
        { key: 'status', label: 'Status', render: (row) => `
          <span class="status-pill ${row.status === 'Active' ? 'status-active' : 'status-inactive'}">
            <span class="status-dot"></span> ${row.status}
          </span>
        `}
      ],
      data
    });
  },

  renderDoorTable(filter = 'all', filterName = 'All Doors') {
    this.currentCategory = 'door';
    this.currentFilter = filter;
    let data = window.AppData.doors;

    if (filter === 'Attendance' || filter === 'Access Control') {
      data = data.filter(d => d.system === filter);
    } else if (filter !== 'all') {
      data = data.filter(d => d.purpose.toLowerCase().includes(filter.toLowerCase()) || d.branch.toLowerCase().includes(filter.toLowerCase()));
    }

    this.activeDataset = data;
    this.displayGrid({
      title: `Door Report: ${filterName}`,
      columns: [
        { key: 'id', label: 'Door ID' },
        { key: 'name', label: 'Door Name' },
        { key: 'system', label: 'System Type', render: (row) => `
          <span class="badge ${row.system === 'Attendance' ? 'badge-attn' : 'badge-acs'}">${row.system}</span>
        `},
        { key: 'purpose', label: 'Designation' },
        { key: 'branch', label: 'Branch / Office' },
        { key: 'floor', label: 'Floor Zone' },
        { key: 'lockStatus', label: 'Lock Telemetry' },
        { key: 'state', label: 'Status', render: (row) => `
          <span class="status-pill status-active"><span class="status-dot"></span> Online</span>
        `}
      ],
      data
    });
  },

  displayGrid({ title, columns, data }) {
    const tableContainer = document.getElementById('reportTableContainer');
    if (!tableContainer) return;

    tableContainer.style.display = 'block';

    const headerHtml = columns.map(c => `<th>${c.label}</th>`).join('');

    const renderRows = (dataset) => {
      if (dataset.length === 0) {
        return `<tr><td colspan="${columns.length}" class="empty-table">No records found matching criteria.</td></tr>`;
      }
      return dataset.map(row => `
        <tr>
          ${columns.map(c => `<td>${c.render ? c.render(row) : (row[c.key] ?? '-')}</td>`).join('')}
        </tr>
      `).join('');
    };

    tableContainer.innerHTML = `
      <div class="table-card">
        <div class="table-top-bar">
          <div class="table-title-area">
            <h3 class="table-title">${title}</h3>
            <span class="record-counter">${data.length} records</span>
          </div>

          <div class="table-actions">
            <div class="search-input-box">
              <span class="search-icon">🔍</span>
              <input type="text" id="tableSearchInput" placeholder="Filter records..." />
            </div>
            <button class="btn btn-secondary btn-sm" id="btnExportCsv">
              📥 Export CSV
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.print()">
              🖨️ Print
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="activeDataTable">
            <thead>
              <tr>${headerHtml}</tr>
            </thead>
            <tbody id="activeTableBody">
              ${renderRows(data)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Setup Search Listener
    const searchInput = document.getElementById('tableSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = data.filter(row => {
          return Object.values(row).some(val => 
            String(val).toLowerCase().includes(query)
          );
        });
        document.getElementById('activeTableBody').innerHTML = renderRows(filtered);
      });
    }

    // Setup CSV Export
    const btnCsv = document.getElementById('btnExportCsv');
    if (btnCsv) {
      btnCsv.addEventListener('click', () => {
        this.exportToCsv(title, columns, data);
      });
    }

    // Scroll smoothly to table
    tableContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  exportToCsv(filename, columns, data) {
    const headers = columns.map(c => `"${c.label}"`).join(',');
    const rows = data.map(row => {
      return columns.map(c => {
        const val = row[c.key] !== undefined ? String(row[c.key]).replace(/"/g, '""') : '';
        return `"${val}"`;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // ─── TENDER CUSTOM REPORT ENGINE ─────────────────────────
  customReportState: {
    entity: 'users',
    search: '',
    scope: 'All',
    status: 'All',
    firmware: 'All',
    selectedCols: {
      users: ['id', 'name', 'category', 'department', 'branch', 'role', 'status'],
      devices: ['id', 'name', 'category', 'model', 'status', 'firmware', 'ip', 'uptime'],
      doors: ['id', 'name', 'category', 'branch', 'system', 'relay', 'lockStatus'],
      access: ['id', 'name', 'category', 'branch', 'accessLevel', 'doorsCount', 'activeUsers', 'schedule'],
      adhoc: ['id', 'type', 'name', 'group', 'location', 'techDetails', 'status']
    }
  },

  customColDefs: {
    users: [
      { key: 'id', label: 'User ID' },
      { key: 'name', label: 'Employee Name' },
      { key: 'category', label: 'User Group' },
      { key: 'department', label: 'Department' },
      { key: 'branch', label: 'Assigned Branch' },
      { key: 'role', label: 'Designation / Role' },
      { key: 'card', label: 'Card Badge' },
      { key: 'status', label: 'Status' }
    ],
    devices: [
      { key: 'id', label: 'Device ID' },
      { key: 'name', label: 'Device Name' },
      { key: 'category', label: 'Device Group' },
      { key: 'model', label: 'Model' },
      { key: 'status', label: 'Device Status' },
      { key: 'firmware', label: 'Firmware Version' },
      { key: 'ip', label: 'IP Address' },
      { key: 'ping', label: 'Ping Latency' },
      { key: 'uptime', label: 'Uptime SLA' }
    ],
    doors: [
      { key: 'id', label: 'Door ID' },
      { key: 'name', label: 'Door Name' },
      { key: 'category', label: 'Door Group' },
      { key: 'branch', label: 'Branch / Location' },
      { key: 'system', label: 'System Role' },
      { key: 'relay', label: 'Relay & Hardware' },
      { key: 'lockStatus', label: 'Lock State' }
    ],
    access: [
      { key: 'id', label: 'Group ID' },
      { key: 'name', label: 'Access Group Name' },
      { key: 'category', label: 'Group Tier' },
      { key: 'branch', label: 'Branch Scope' },
      { key: 'accessLevel', label: 'Clearance Level' },
      { key: 'doorsCount', label: 'Doors Mapped' },
      { key: 'activeUsers', label: 'Active Members' },
      { key: 'schedule', label: 'Time Schedule' }
    ],
    adhoc: [
      { key: 'id', label: 'Entity ID' },
      { key: 'type', label: 'Entity Type' },
      { key: 'name', label: 'Name / Designation' },
      { key: 'group', label: 'Assigned Group' },
      { key: 'location', label: 'Location Scope' },
      { key: 'techDetails', label: 'Technical Spec / Firmware' },
      { key: 'status', label: 'Operational Status' }
    ]
  },

  initCustomReportBuilder() {
    const state = this.customReportState;

    // Tab buttons
    document.querySelectorAll('.custom-ent-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.custom-ent-tab').forEach(t => {
          t.style.border = '1px solid #cbd5e1';
          t.style.background = '#fff';
          t.querySelector('div').style.color = '#1e293b';
        });
        tab.style.border = '2px solid #0d9488';
        tab.style.background = '#f0fdfa';
        tab.querySelector('div').style.color = '#0f766e';

        state.entity = tab.getAttribute('data-entity');
        state.status = 'All';
        state.firmware = 'All';
        state.scope = 'All';
        const fwGrp = document.getElementById('customFwFilterGroup');
        if (fwGrp) fwGrp.style.display = state.entity === 'devices' ? 'block' : 'none';

        const statusSel = document.getElementById('customStatusSelect');
        if (statusSel) statusSel.value = 'All';
        const scopeSel = document.getElementById('customScopeSelect');
        if (scopeSel) scopeSel.value = 'All';
        const fwSel = document.getElementById('customFirmwareSelect');
        if (fwSel) fwSel.value = 'All';

        this.renderCustomColToggles();
        this.renderCustomReportTable();
      });
    });

    // Search input
    const searchInp = document.getElementById('customSearchInput');
    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        state.search = e.target.value.toLowerCase().trim();
        this.renderCustomReportTable();
      });
    }

    // Scope select
    const scopeSel = document.getElementById('customScopeSelect');
    if (scopeSel) {
      scopeSel.addEventListener('change', (e) => {
        state.scope = e.target.value;
        this.renderCustomReportTable();
      });
    }

    // Status select
    const statusSel = document.getElementById('customStatusSelect');
    if (statusSel) {
      statusSel.addEventListener('change', (e) => {
        state.status = e.target.value;
        this.renderCustomReportTable();
      });
    }

    // Firmware select
    const fwSel = document.getElementById('customFirmwareSelect');
    if (fwSel) {
      fwSel.addEventListener('change', (e) => {
        state.firmware = e.target.value;
        this.renderCustomReportTable();
      });
    }

    // Column select all & reset
    document.getElementById('btnCustomSelectAllCols')?.addEventListener('click', () => {
      state.selectedCols[state.entity] = this.customColDefs[state.entity].map(c => c.key);
      this.renderCustomColToggles();
      this.renderCustomReportTable();
    });

    document.getElementById('btnCustomResetCols')?.addEventListener('click', () => {
      state.selectedCols[state.entity] = this.customColDefs[state.entity].slice(0, 6).map(c => c.key);
      this.renderCustomColToggles();
      this.renderCustomReportTable();
    });

    // Export CSV
    document.getElementById('btnCustomExportCsv')?.addEventListener('click', () => {
      const activeCols = this.customColDefs[state.entity].filter(c => state.selectedCols[state.entity].includes(c.key));
      const dataset = this.getCustomDataset();
      this.exportToCsv(`Tender_Custom_Report_${state.entity.toUpperCase()}`, activeCols, dataset);
    });

    // Print
    document.getElementById('btnCustomPrint')?.addEventListener('click', () => {
      window.print();
    });

    this.renderCustomColToggles();
    this.renderCustomReportTable();
  },

  renderCustomColToggles() {
    const state = this.customReportState;
    const container = document.getElementById('customColButtonsContainer');
    if (!container) return;

    const allCols = this.customColDefs[state.entity] || [];
    const active = state.selectedCols[state.entity] || [];

    container.innerHTML = allCols.map(c => {
      const isChecked = active.includes(c.key);
      return `
        <button type="button" data-col-toggle="${c.key}" style="
          padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; cursor: pointer;
          background: ${isChecked ? '#e0f2fe' : '#f8fafc'};
          border: 1px solid ${isChecked ? '#0284c7' : '#cbd5e1'};
          color: ${isChecked ? '#0369a1' : '#64748b'};
          font-weight: ${isChecked ? 700 : 500};
        ">
          ${isChecked ? '✓' : '+'} ${c.label}
        </button>
      `;
    }).join('');

    container.querySelectorAll('[data-col-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-col-toggle');
        const cur = state.selectedCols[state.entity] || [];
        if (cur.includes(key)) {
          state.selectedCols[state.entity] = cur.filter(k => k !== key);
        } else {
          state.selectedCols[state.entity] = [...cur, key];
        }
        this.renderCustomColToggles();
        this.renderCustomReportTable();
      });
    });
  },

  getCustomDataset() {
    const state = this.customReportState;
    let data = [];

    const matchesScope = (categoryStr = '', branchStr = '') => {
      if (state.scope === 'All') return true;
      const c = (categoryStr || '').toLowerCase();
      const b = (branchStr || '').toLowerCase();
      if (state.scope === 'Head Office') return c.includes('head office') || c === 'ho' || b.includes('head office');
      if (state.scope === 'Regional Office') return c.includes('regional') || c === 'ro' || b.includes('ro-');
      if (state.scope === 'Sub-Branch') return c.includes('sub-branch') || c.includes('sub branch') || b.includes('sub-br');
      if (state.scope === 'Branch') {
        const isSub = c.includes('sub-branch') || c.includes('sub branch') || b.includes('sub-br');
        return !isSub && (c.includes('branch') || b.includes('branch'));
      }
      return true;
    };

    if (state.entity === 'users') {
      data = (window.AppData.users || []).map(u => ({
        ...u,
        category: `${u.category} User Group`
      }));
      if (state.scope !== 'All') data = data.filter(u => matchesScope(u.category, u.branch));
      if (state.status !== 'All') data = data.filter(u => u.status === state.status);

    } else if (state.entity === 'devices') {
      data = (window.AppData.devices || []).map(d => ({
        ...d,
        category: `${d.category} Device Group`
      }));
      if (state.scope !== 'All') data = data.filter(d => matchesScope(d.category, d.branch));
      if (state.status !== 'All') data = data.filter(d => d.status === state.status);
      if (state.firmware !== 'All') data = data.filter(d => d.firmware.includes(state.firmware));

    } else if (state.entity === 'doors') {
      data = (window.AppData.doors || []).map(d => ({
        ...d,
        category: `${d.category} Door Group`
      }));
      if (state.scope !== 'All') data = data.filter(d => matchesScope(d.category, d.branch));
      if (state.status !== 'All') {
        if (state.status === 'Active') data = data.filter(d => d.lockStatus.includes('Locked') || d.lockStatus.includes('Pass-thru'));
        if (state.status === 'Inactive') data = data.filter(d => !d.lockStatus.includes('Locked'));
      }

    } else if (state.entity === 'access') {
      data = (window.AppData.accessGroups || []);
      if (state.scope !== 'All') data = data.filter(a => matchesScope(a.category, a.branch));

    } else if (state.entity === 'adhoc') {
      const u = (window.AppData.users || []).slice(0, 4).map(r => ({ id: r.id, type: 'User', name: r.name, group: `${r.category} Group`, location: r.branch, techDetails: `Role: ${r.role}`, status: r.status }));
      const d = (window.AppData.devices || []).slice(0, 5).map(r => ({ id: r.id, type: 'Device', name: r.name, group: `${r.category} Group`, location: r.branch, techDetails: `FW: ${r.firmware} (${r.model})`, status: r.status }));
      const dr = (window.AppData.doors || []).slice(0, 4).map(r => ({ id: r.id, type: 'Door', name: r.name, group: `${r.category} Group`, location: r.branch, techDetails: `Sys: ${r.system}`, status: r.lockStatus }));
      data = [...u, ...d, ...dr];
      if (state.scope !== 'All') data = data.filter(r => matchesScope(r.group, r.location));
      if (state.status !== 'All') data = data.filter(r => r.status === state.status);
    }

    if (state.search) {
      const q = state.search;
      data = data.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(q)));
    }

    return data;
  },

  renderCustomReportTable() {
    const state = this.customReportState;
    const wrapper = document.getElementById('customTableWrapper');
    const countBadge = document.getElementById('customRecordCountBadge');
    if (!wrapper) return;

    const allCols = this.customColDefs[state.entity] || [];
    const activeColKeys = state.selectedCols[state.entity] || [];
    const activeCols = allCols.filter(c => activeColKeys.includes(c.key));
    const dataset = this.getCustomDataset();

    if (countBadge) {
      countBadge.textContent = `${dataset.length} Records`;
    }

    if (dataset.length === 0) {
      wrapper.innerHTML = `
        <div style="padding: 30px; text-align: center; color: #64748b;">
          <div style="font-size: 24px; margin-bottom: 6px;">🔍</div>
          <strong style="color: #1e293b;">No matching records found</strong>
          <div style="font-size: 0.75rem; margin-top: 4px;">Try resetting filters or changing the search keyword.</div>
        </div>
      `;
      return;
    }

    wrapper.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
        <thead>
          <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
            ${activeCols.map(col => `
              <th style="padding: 8px 12px; font-weight: 700; color: #334155; white-space: nowrap;">
                ${col.label}
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${dataset.map((row, idx) => `
            <tr style="border-bottom: 1px solid #f1f5f9; background: ${idx % 2 === 0 ? '#ffffff' : '#fafbfc'};">
              ${activeCols.map(col => {
                const val = row[col.key] !== undefined ? row[col.key] : '—';
                if (col.key === 'firmware') {
                  return `
                    <td style="padding: 8px 12px;">
                      <span style="font-family: monospace; font-weight: 700; background: #ecfdf5; color: #065f46; padding: 2px 6px; border-radius: 4px; border: 1px solid #a7f3d0;">
                        ${val}
                      </span>
                    </td>
                  `;
                }
                if (col.key === 'status') {
                  const isGood = val === 'Active' || val?.includes('Locked');
                  return `
                    <td style="padding: 8px 12px;">
                      <span style="display: inline-flex; align-items: center; gap: 4px; font-weight: 600; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: ${isGood ? '#dcfce7' : '#fee2e2'}; color: ${isGood ? '#15803d' : '#b91c1c'};">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></span>
                        ${val}
                      </span>
                    </td>
                  `;
                }
                return `
                  <td style="padding: 8px 12px; color: #334155;">
                    ${val}
                  </td>
                `;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
};

window.AppReports = AppReports;
