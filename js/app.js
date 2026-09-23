/**
 * Main Application Orchestrator & Router
 */

document.addEventListener('DOMContentLoaded', () => {
  const App = {
    currentView: 'overview',
    chartInstance: null,

    init() {
      this.bindElements();
      this.initChart();
      this.renderUsageBar();
      this.setupThemeToggle();
      this.setupNavigation();
      this.setupPeriodButtons();
      this.setupLaunchModal();
    },

    bindElements() {
      this.viewOverview = document.getElementById('viewOverview');
      this.viewReportHub = document.getElementById('viewReportHub');
      this.viewUserReport = document.getElementById('viewUserReport');
      this.viewAccessReport = document.getElementById('viewAccessReport');
      this.viewDeviceReport = document.getElementById('viewDeviceReport');
      this.viewDoorReport = document.getElementById('viewDoorReport');
      this.viewCustomReport = document.getElementById('viewCustomReport');
      this.breadcrumbNav = document.getElementById('breadcrumbNav');
      this.reportTableContainer = document.getElementById('reportTableContainer');
      this.diagramContainer = document.getElementById('diagramContainer');
    },

    initChart() {
      this.chartInstance = new DashboardChart('chartContainer', window.AppData.chartData);
    },

    setupPeriodButtons() {
      const btns = document.querySelectorAll('.period-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const period = btn.getAttribute('data-period');
          this.chartInstance.setPeriod(period);
          
          // Update total badge and date label
          const pData = window.AppData.chartData[period];
          const totalValEl = document.getElementById('overviewTotalValue');
          const dateRangeEl = document.getElementById('overviewDateRange');
          if (totalValEl) totalValEl.textContent = pData.total.toLocaleString();
          if (dateRangeEl) dateRangeEl.textContent = pData.dateRange;
        });
      });
    },

    renderUsageBar() {
      const stats = window.AppData.stats;
      const usageList = document.getElementById('usageMetricsList');
      if (!usageList) return;

      const items = [
        { label: 'User', value: stats.userTotal.toLocaleString(), icon: '👤', pct: null },
        { label: 'Fingerprint', value: stats.fingerprint.toLocaleString(), icon: '👆', pct: null },
        { label: 'Card', value: stats.card.toLocaleString(), icon: '💳', pct: null },
        { label: 'Device', value: '48/48', icon: '🖥️', pct: `${stats.deviceOnlinePct}%` },
        { label: 'Door', value: '12/60', icon: '🚪', pct: `${stats.doorActivePct}%` },
        { label: 'Zone', value: '12', icon: '📍', pct: `${stats.zonePct}%` },
        { label: 'Access Group', value: stats.accessGroupTotal, icon: '⊕', pct: null }
      ];

      usageList.innerHTML = items.map(item => `
        <div class="usage-metric-badge" title="${item.label}: ${item.value} ${item.pct ? '(' + item.pct + ')' : ''}">
          <div class="metric-circle-avatar">
            <span class="avatar-icon">${item.icon}</span>
            ${item.pct ? `<span class="pct-overlay">${item.pct}</span>` : ''}
          </div>
          <div class="metric-info">
            <span class="metric-title">${item.label}</span>
            <span class="metric-sub">${item.value}</span>
          </div>
        </div>
      `).join('');
    },

    setupNavigation() {
      // "Report" button in bottom Usage bar (Figures 01-05, 08-09)
      const btnUsageReport = document.getElementById('btnUsageReport');
      if (btnUsageReport) {
        btnUsageReport.addEventListener('click', () => {
          this.switchView('report-hub');
        });
      }

      // 4 Main Report Category Cards (Figure 02, 04, 08)
      document.getElementById('cardUserReport')?.addEventListener('click', () => {
        this.switchView('user-report');
      });

      document.getElementById('cardAccessReport')?.addEventListener('click', () => {
        this.switchView('access-report');
      });

      document.getElementById('cardDeviceReport')?.addEventListener('click', () => {
        this.switchView('device-report');
      });

      document.getElementById('cardDoorReport')?.addEventListener('click', () => {
        this.switchView('door-report');
      });

      document.getElementById('cardCustomReport')?.addEventListener('click', () => {
        this.switchView('custom-report');
      });

      // User Sub-reports (Figure 03)
      document.querySelectorAll('[data-user-sub]').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.getAttribute('data-user-sub');
          const title = btn.querySelector('.cat-label')?.textContent || type;
          window.AppReports.renderUserTable(type, title);
        });
      });

      // Access Sub-reports (Figure 05)
      document.querySelectorAll('[data-access-sub]').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.getAttribute('data-access-sub');
          const title = btn.querySelector('.cat-label')?.textContent || type;
          window.AppReports.renderAccessTable(type, title);
        });
      });

      // Device Sub-reports (Figure 09)
      document.querySelectorAll('[data-device-sub]').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.getAttribute('data-device-sub');
          const title = btn.querySelector('.cat-label')?.textContent || type;
          window.AppReports.renderDeviceTable(type, title);
        });
      });

      // Door Sub-reports (Figure 07)
      document.querySelectorAll('[data-door-sub]').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.getAttribute('data-door-sub');
          const title = btn.querySelector('.cat-label')?.textContent || type;
          window.AppReports.renderDoorTable(type, title);
        });
      });
    },

    switchView(viewName) {
      this.currentView = viewName;
      
      // Hide all view containers
      [this.viewOverview, this.viewReportHub, this.viewUserReport, this.viewAccessReport, this.viewDeviceReport, this.viewDoorReport, this.viewCustomReport].forEach(v => {
        if (v) v.style.display = 'none';
      });

      // Reset dynamic table & diagram containers
      if (this.reportTableContainer) this.reportTableContainer.style.display = 'none';
      if (this.diagramContainer) this.diagramContainer.innerHTML = '';

      // Activate selected view
      let breadcrumbs = [{ name: 'Dashboard', action: 'overview' }];

      switch (viewName) {
        case 'overview':
          this.viewOverview.style.display = 'block';
          break;

        case 'report-hub':
          this.viewReportHub.style.display = 'block';
          breadcrumbs.push({ name: 'Report', action: 'report-hub' });
          break;

        case 'user-report':
          this.viewUserReport.style.display = 'block';
          breadcrumbs.push({ name: 'Report', action: 'report-hub' });
          breadcrumbs.push({ name: 'User Report', action: 'user-report' });
          // Open default table
          window.AppReports.renderUserTable('all', 'All Users');
          break;

        case 'access-report':
          this.viewAccessReport.style.display = 'block';
          breadcrumbs.push({ name: 'Report', action: 'report-hub' });
          breadcrumbs.push({ name: 'Access Report', action: 'access-report' });
          window.AppDiagrams.renderAccessArchitecture('diagramContainer');
          window.AppReports.renderAccessTable('all', 'All Access Groups');
          break;

        case 'device-report':
          this.viewDeviceReport.style.display = 'block';
          breadcrumbs.push({ name: 'Report', action: 'report-hub' });
          breadcrumbs.push({ name: 'Device Report', action: 'device-report' });
          window.AppDiagrams.renderDeviceTopology('diagramContainer');
          window.AppReports.renderDeviceTable('all', 'Total Devices');
          break;

        case 'door-report':
          this.viewDoorReport.style.display = 'block';
          breadcrumbs.push({ name: 'Report', action: 'report-hub' });
          breadcrumbs.push({ name: 'Door Report', action: 'door-report' });
          window.AppDiagrams.renderDoorArchitecture('diagramContainer');
          window.AppReports.renderDoorTable('all', 'All Configured Doors');
          break;

        case 'custom-report':
          if (this.viewCustomReport) this.viewCustomReport.style.display = 'block';
          breadcrumbs.push({ name: 'Report', action: 'report-hub' });
          breadcrumbs.push({ name: 'Custom Report Builder', action: 'custom-report' });
          window.AppReports.initCustomReportBuilder();
          break;
      }

      this.renderBreadcrumbs(breadcrumbs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    renderBreadcrumbs(crumbs) {
      if (!this.breadcrumbNav) return;
      this.breadcrumbNav.innerHTML = crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        if (isLast) {
          return `<span class="crumb current">${crumb.name}</span>`;
        }
        return `
          <button class="crumb-link" data-goto="${crumb.action}">${crumb.name}</button>
          <span class="crumb-sep">/</span>
        `;
      }).join('');

      this.breadcrumbNav.querySelectorAll('[data-goto]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.switchView(btn.getAttribute('data-goto'));
        });
      });
    },

    setupThemeToggle() {
      const toggle = document.getElementById('themeToggleBtn');
      if (!toggle) return;

      const savedTheme = localStorage.getItem('app-theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      toggle.textContent = savedTheme === 'dark' ? '☀️ Light' : '🌙 Dark';

      toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('app-theme', next);
        toggle.textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
        // Re-render chart for color scheme updates
        if (this.chartInstance) {
          this.chartInstance.render();
        }
      });
    },

    setupLaunchModal() {
      const launchBtn = document.getElementById('btnLaunchNewDashboard');
      const modal = document.getElementById('launchModal');
      const closeBtn = document.getElementById('btnCloseModal');

      if (launchBtn && modal) {
        launchBtn.addEventListener('click', () => {
          modal.showModal();
        });
      }

      if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
          modal.close();
        });
      }
    }
  };

  window.App = App;
  App.init();
});
