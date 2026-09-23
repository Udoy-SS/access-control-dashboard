/**
 * SVG Interactive Chart Engine for Overview
 */

class DashboardChart {
  constructor(containerId, data) {
    this.container = document.getElementById(containerId);
    this.data = data;
    this.currentPeriod = 'week';
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  setPeriod(period) {
    if (!this.data[period]) return;
    this.currentPeriod = period;
    this.render();
  }

  render() {
    const periodData = this.data[this.currentPeriod];
    const width = 760;
    const height = 280;
    const padding = { top: 30, right: 30, bottom: 40, left: 50 };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Determine max value for Y axis scale
    let maxVal = 600;
    if (this.currentPeriod === 'month') maxVal = 2500;
    if (this.currentPeriod === 'year') maxVal = 10000;

    const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map(pct => Math.round(pct * maxVal));

    const xScale = (index) => {
      const step = plotWidth / (periodData.labels.length - 1 || 1);
      return padding.left + index * step;
    };

    const yScale = (val) => {
      const normalized = Math.min(val / maxVal, 1);
      return padding.top + plotHeight - (normalized * plotHeight);
    };

    // Build SVG Grid and labels
    let gridSvg = '';
    yTicks.forEach(tick => {
      const y = yScale(tick);
      gridSvg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="3,3" />
        <text x="${padding.left - 10}" y="${y + 4}" fill="var(--text-muted)" font-size="11" text-anchor="end" font-family="inherit">${tick}</text>
      `;
    });

    // X Axis ticks
    let xTicksSvg = '';
    periodData.labels.forEach((label, i) => {
      const x = xScale(i);
      xTicksSvg += `
        <text x="${x}" y="${height - 15}" fill="var(--text-muted)" font-size="11" text-anchor="middle" font-family="inherit">${label}</text>
      `;
    });

    // Generate smooth bezier curves
    const buildPath = (points, isArea = false) => {
      if (points.length === 0) return '';
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
      if (isArea) {
        const last = points[points.length - 1];
        const first = points[0];
        const bottomY = padding.top + plotHeight;
        d += ` L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
      }
      return d;
    };

    let pathsSvg = '';
    let seriesPoints = [];

    periodData.series.forEach((s, sIdx) => {
      const pts = s.data.map((val, i) => ({ x: xScale(i), y: yScale(val), val, label: periodData.labels[i] }));
      seriesPoints.push({ series: s, points: pts });

      // If primary series, add gradient area
      if (sIdx === 0) {
        const areaPath = buildPath(pts, true);
        pathsSvg += `
          <path d="${areaPath}" fill="url(#cyanAreaGrad)" opacity="0.25" />
        `;
      }

      const linePath = buildPath(pts, false);
      pathsSvg += `
        <path d="${linePath}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chart-line-path" />
      `;

      // Data dots
      pts.forEach(p => {
        pathsSvg += `
          <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${s.color}" stroke="var(--surface-card)" stroke-width="1.5" class="chart-dot" />
        `;
      });
    });

    this.container.innerHTML = `
      <div class="chart-wrapper">
        <svg viewBox="0 0 ${width} ${height}" class="overview-svg" id="chartSvg">
          <defs>
            <linearGradient id="cyanAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#00b4d8" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#00b4d8" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          ${gridSvg}
          ${xTicksSvg}
          ${pathsSvg}
          <line id="hoverGuide" x1="0" y1="${padding.top}" x2="0" y2="${padding.top + plotHeight}" stroke="var(--accent-primary)" stroke-width="1" stroke-dasharray="2,2" opacity="0" />
        </svg>
        <div id="chartTooltip" class="chart-tooltip" style="display: none;"></div>
      </div>
    `;

    this.setupInteractions(seriesPoints, padding, plotWidth, width, height);
  }

  setupInteractions(seriesPoints, padding, plotWidth, width, height) {
    const svg = this.container.querySelector('#chartSvg');
    const tooltip = this.container.querySelector('#chartTooltip');
    const guide = this.container.querySelector('#hoverGuide');

    if (!svg || !tooltip) return;

    svg.addEventListener('mousemove', (e) => {
      const rect = svg.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const svgX = (clientX / rect.width) * width;

      if (svgX < padding.left || svgX > width - padding.right) {
        tooltip.style.display = 'none';
        guide.setAttribute('opacity', '0');
        return;
      }

      // Find closest index
      const numPoints = seriesPoints[0].points.length;
      const step = plotWidth / (numPoints - 1 || 1);
      const index = Math.round((svgX - padding.left) / step);
      const clampedIndex = Math.max(0, Math.min(numPoints - 1, index));

      const activeX = seriesPoints[0].points[clampedIndex].x;
      guide.setAttribute('x1', activeX);
      guide.setAttribute('x2', activeX);
      guide.setAttribute('opacity', '0.7');

      const dateLabel = seriesPoints[0].points[clampedIndex].label;

      let rows = `<strong>Time / Day: ${dateLabel}</strong><div class="tooltip-divider"></div>`;
      seriesPoints.forEach(sp => {
        const p = sp.points[clampedIndex];
        rows += `
          <div class="tooltip-item">
            <span class="tooltip-badge" style="background: ${sp.series.color};"></span>
            <span class="tooltip-name">${sp.series.name}:</span>
            <span class="tooltip-val">${p.val.toLocaleString()}</span>
          </div>
        `;
      });

      tooltip.innerHTML = rows;
      tooltip.style.display = 'block';

      // Position tooltip relative to container
      const tooltipX = (activeX / width) * rect.width;
      tooltip.style.left = `${tooltipX}px`;
      tooltip.style.top = `30px`;
    });

    svg.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
      guide.setAttribute('opacity', '0');
    });
  }
}

window.DashboardChart = DashboardChart;
