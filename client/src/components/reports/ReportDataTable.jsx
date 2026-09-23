import React, { useState, useMemo } from 'react';

/**
 * ReportDataTable.jsx
 * Reusable, High-Performance Dark-Themed Enterprise Data Table
 * Features: Top Filter Bar, Multi-Field Search, Date Range Picker, Quick Export (CSV/Excel/PDF),
 * Pagination, Column Sorting, Visual Status Badges, and Evidence Modal Trigger.
 */
export default function ReportDataTable({
  reportConfig,
  onViewEvidence
}) {
  const { title, subtitle, columns, data = [] } = reportConfig;

  // Filter & Search State
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeDatePreset, setActiveDatePreset] = useState('all');

  // Sorting State
  const [sortKey, setSortKey] = useState(columns[0]?.key || 'date');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination State
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Date Preset Handler
  const handlePresetClick = (preset) => {
    setActiveDatePreset(preset);
    const today = new Date();
    const formatYMD = (d) => d.toISOString().slice(0, 10);

    if (preset === 'today') {
      const todayStr = formatYMD(today);
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (preset === '7d') {
      const past7 = new Date();
      past7.setDate(today.getDate() - 7);
      setDateFrom(formatYMD(past7));
      setDateTo(formatYMD(today));
    } else if (preset === '30d') {
      const past30 = new Date();
      past30.setDate(today.getDate() - 30);
      setDateFrom(formatYMD(past30));
      setDateTo(formatYMD(today));
    } else {
      setDateFrom('');
      setDateTo('');
    }
    setCurrentPage(1);
  };

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Date filter (if row has date)
      if (row.date) {
        if (dateFrom && row.date < dateFrom) return false;
        if (dateTo && row.date > dateTo) return false;
      }

      // Search term filter across all row fields
      if (search.trim()) {
        const query = search.toLowerCase();
        const match = Object.values(row).some((val) => {
          if (typeof val === 'string' || typeof val === 'number') {
            return String(val).toLowerCase().includes(query);
          }
          if (typeof val === 'object' && val !== null) {
            return JSON.stringify(val).toLowerCase().includes(query);
          }
          return false;
        });
        if (!match) return false;
      }

      return true;
    });
  }, [data, dateFrom, dateTo, search]);

  // Sort Data
  const sortedData = useMemo(() => {
    const list = [...filteredData];
    if (!sortKey) return list;

    list.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortAsc ? -1 : 1;
      if (strA > strB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [filteredData, sortKey, sortAsc]);

  // Paginate Data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Compute Required Min Table Width to prevent truncation
  const calculatedMinWidth = useMemo(() => {
    let total = columns.reduce((acc, col) => {
      const w = parseInt(col.width, 10);
      return acc + (isNaN(w) ? 150 : w);
    }, 0);
    return Math.max(total, 1100) + 'px';
  }, [columns]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  // ─── EXPORT HANDLERS ────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = columns.map((col) => `"${col.label}"`).join(',');
    const rows = filteredData.map((row) => {
      return columns
        .map((col) => {
          let cell = row[col.key];
          if (typeof cell === 'object' && cell !== null) {
            cell = Object.keys(cell)
              .filter((k) => cell[k])
              .join('+');
          }
          return `"${String(cell || '').replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pubali_Bank_${reportConfig.id}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    // Generate styled XML Excel workbook
    const headerRow = columns.map((col) => `<th>${col.label}</th>`).join('');
    const bodyRows = filteredData
      .map((row) => {
        const cells = columns
          .map((col) => {
            let val = row[col.key];
            if (typeof val === 'object' && val !== null) {
              val = Object.keys(val).filter((k) => val[k]).join(', ');
            }
            return `<td>${val ?? ''}</td>`;
          })
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    const template = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${title.slice(0, 30)}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          th { background-color: #0d9488; color: #ffffff; font-weight: bold; border: 1px solid #cccccc; padding: 6px; }
          td { border: 1px solid #e2e8f0; padding: 5px; font-family: sans-serif; font-size: 11pt; }
        </style>
      </head>
      <body>
        <h2 style="color:#0f172a;">Pubali Bank PLC — ${title}</h2>
        <p style="color:#64748b;">Suprema BioStar X Enterprise Security Suite · Generated: ${new Date().toLocaleString()}</p>
        <table border="1">${headerRow}${bodyRows}</table>
      </body>
      </html>
    `;

    const blob = new Blob([template], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pubali_Bank_${reportConfig.id}_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate print/PDF view.');
      return;
    }

    const tableHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pubali Bank PLC - ${title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
          .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #0f172a; color: #ffffff; text-align: left; padding: 8px; border: 1px solid #cbd5e1; }
          td { padding: 7px 8px; border: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          .footer { margin-top: 24px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">PUBALI BANK PLC — ${title.toUpperCase()}</h1>
            <div class="sub">${subtitle} · Total Records: ${filteredData.length}</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #475569;">
            <div><strong>Suprema BioStar X</strong></div>
            <div>Generated: ${new Date().toLocaleString()}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>${columns.map((c) => `<th>${c.label}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${filteredData
              .map(
                (row) =>
                  `<tr>${columns
                    .map((col) => {
                      let val = row[col.key];
                      if (typeof val === 'object' && val !== null) {
                        val = Object.keys(val).filter((k) => val[k]).join(', ');
                      }
                      return `<td>${val ?? '—'}</td>`;
                    })
                    .join('')}</tr>`
              )
              .join('')}
          </tbody>
        </table>
        <div class="footer">Confidential Bank Security Report · Pubali Bank PLC Security Operations Center (SOC) · Bangladesh Bank ICT-08 Standard</div>
      </body>
      </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  // ─── CELL VALUE FORMATTER & BADGES ──────────────────────────────────────────
  const renderCellContent = (row, col) => {
    const val = row[col.key];

    // 1. Evidence Button
    if (col.key === 'evidence' || row.evidenceSnapshot) {
      if (col.key === 'evidence') {
        return (
          <button
            onClick={() => onViewEvidence && onViewEvidence(row)}
            style={{
              padding: '4px 9px',
              borderRadius: '5px',
              backgroundColor: '#f0fdfa',
              border: '1px solid #99f6e4',
              color: '#0f766e',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ccfbf1';
              e.currentTarget.style.borderColor = '#5eead4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f0fdfa';
              e.currentTarget.style.borderColor = '#99f6e4';
            }}
          >
            View Snapshot
          </button>
        );
      }
    }

    // 2. Auth Methods Indicator Object { fp, face, card, pin, mobile }
    if (col.key === 'auth_methods' && typeof val === 'object' && val !== null) {
      return (
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
          {val.fp && (
            <span style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '3px', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontWeight: 600 }} title="Fingerprint Enrolled">
              FP
            </span>
          )}
          {val.face && (
            <span style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '3px', backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', fontWeight: 600 }} title="Face AI Verified">
              Face
            </span>
          )}
          {val.card && (
            <span style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '3px', backgroundColor: '#f3e8ff', color: '#7e22ce', border: '1px solid #d8b4fe', fontWeight: 600 }} title="Smart Card Issued">
              Card
            </span>
          )}
          {val.pin && (
            <span style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '3px', backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', fontWeight: 600 }} title="Secure PIN Set">
              PIN
            </span>
          )}
          {val.mobile && (
            <span style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '3px', backgroundColor: '#fce7f3', color: '#be185d', border: '1px solid #f472b6', fontWeight: 600 }} title="Mobile NFC/BLE Pass">
              Mobile
            </span>
          )}
        </div>
      );
    }

    // 3. Occupancy Utilization Rate with Progress Bar
    if (col.key === 'utilization_rate') {
      const num = Number(val) || 0;
      const barColor = num >= 90 ? '#ef4444' : num >= 75 ? '#f59e0b' : '#10b981';
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%', maxWidth: '140px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: barColor }}>
            <span>{num}%</span>
            <span style={{ fontSize: '9.5px', opacity: 0.8 }}>Cap: {row.max_capacity}</span>
          </div>
          <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(num, 100)}%`, height: '100%', backgroundColor: barColor, borderRadius: '3px' }} />
          </div>
        </div>
      );
    }

    // 4. Status Badges
    const strVal = String(val ?? '');

    // Critical / Denied / Alarm Red Badges
    if (
      strVal.includes('CRITICAL') ||
      strVal.includes('Denied') ||
      strVal.includes('POSITIVE BREACH') ||
      strVal.includes('Overcrowded') ||
      strVal.includes('Hard APB') ||
      strVal.includes('Intrusion') ||
      strVal.includes('Audible Siren') ||
      strVal.includes('Emergency Lockdown')
    ) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #fca5a5',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
          {strVal}
        </span>
      );
    }

    // Warning / Held Open / Near Capacity / Amber Badges
    if (
      strVal.includes('HIGH ALERT') ||
      strVal.includes('MODERATE ALERT') ||
      strVal.includes('Near Capacity') ||
      strVal.includes('Soft APB') ||
      strVal.includes('Held Open') ||
      strVal.includes('Warning') ||
      strVal.includes('Under Review')
    ) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#fef3c7',
            color: '#b45309',
            border: '1px solid #fcd34d',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#d97706' }} />
          {strVal}
        </span>
      );
    }

    // Success / Granted / Normal / Recovered Green Badges
    if (
      strVal === 'Normal' ||
      strVal === 'Access Granted' ||
      strVal.includes('Recovered & Normal') ||
      strVal.includes('Cleared') ||
      strVal.includes('Optimal') ||
      strVal.includes('100% Intercepted')
    ) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#dcfce7',
            color: '#15803d',
            border: '1px solid #86efac',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
          {strVal}
        </span>
      );
    }

    // Access Level & Special Status Badges
    if (strVal.startsWith('Level 5') || strVal.includes('Emergency Unlocked') || strVal.includes('Fire Drill')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: '#ccfbf1',
            color: '#0f766e',
            border: '1px solid #5eead4',
            padding: '3px 9px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#0d9488' }} />
          {strVal}
        </span>
      );
    }

    if (strVal.startsWith('Level 4')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: '#ede9fe',
            color: '#6d28d9',
            border: '1px solid #c4b5fd',
            padding: '3px 9px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#7c3aed' }} />
          {strVal}
        </span>
      );
    }

    if (strVal.startsWith('Level 3')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            padding: '3px 9px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
          {strVal}
        </span>
      );
    }

    if (strVal.startsWith('Level 2') || strVal.startsWith('Level 1')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: '#f1f5f9',
            color: '#334155',
            border: '1px solid #cbd5e1',
            padding: '3px 9px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#64748b' }} />
          {strVal}
        </span>
      );
    }

    // Default cell text
    return <span style={{ color: '#1e293b', fontSize: '12px', fontWeight: 500 }}>{strVal || '—'}</span>;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* ─── TOP FILTER BAR ─── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#f8fafc',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Left: Search & Date Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1, minWidth: '320px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
            <span
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by Employee, Door, Device, or ID…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 12px 6px 30px',
                fontSize: '12px',
                color: '#0f172a',
                outline: 'none',
                transition: 'border-color 0.15s'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#0d9488')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Date Presets */}
          <div style={{ display: 'flex', gap: '3px', backgroundColor: '#e2e8f0', padding: '3px', borderRadius: '6px' }}>
            {[
              { id: 'all', label: 'All Dates' },
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7D' },
              { id: '30d', label: 'Last 30D' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetClick(p.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: activeDatePreset === p.id ? 700 : 500,
                  backgroundColor: activeDatePreset === p.id ? '#0d9488' : 'transparent',
                  color: activeDatePreset === p.id ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
            <span>From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setActiveDatePreset('custom');
                setCurrentPage(1);
              }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                color: '#0f172a',
                padding: '4px 6px',
                fontSize: '11px',
                outline: 'none'
              }}
            />
            <span>To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setActiveDatePreset('custom');
                setCurrentPage(1);
              }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                color: '#0f172a',
                padding: '4px 6px',
                fontSize: '11px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Right: Quick Export Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleExportCSV}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            title="Download CSV raw dataset"
          >
            CSV Export
          </button>

          <button
            onClick={handleExportExcel}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#047857',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d1fae5';
              e.currentTarget.style.borderColor = '#6ee7b7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ecfdf5';
              e.currentTarget.style.borderColor = '#a7f3d0';
            }}
            title="Download formatted Excel workbook"
          >
            Excel (.xls)
          </button>

          <button
            onClick={handlePrintPDF}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#f0fdfa',
              border: '1px solid #99f6e4',
              color: '#0f766e',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ccfbf1';
              e.currentTarget.style.borderColor = '#5eead4';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f0fdfa';
              e.currentTarget.style.borderColor = '#99f6e4';
            }}
            title="Open printable bank official report"
          >
            Print / PDF
          </button>
        </div>
      </div>

      {/* ─── DATA TABLE ─── */}
      <div
        style={{
          overflowX: 'auto',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          scrollbarWidth: 'thin',
          scrollbarColor: '#0d9488 #f1f5f9'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: calculatedMinWidth }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    style={{
                      padding: '11px 14px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: isSorted ? '#0f766e' : '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      width: col.width || 'auto',
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{col.label}</span>
                      {col.sortable && (
                        <span style={{ fontSize: '10px', opacity: isSorted ? 1 : 0.4 }}>
                          {isSorted ? (sortAsc ? '▲' : '▼') : '⇅'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>No records found</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>Try modifying your search or date filter.</div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafbfc',
                    transition: 'background-color 0.12s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0fdfa')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#fafbfc')
                  }
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      {renderCellContent(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── TABLE FOOTER & PAGINATION ─── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          paddingTop: '4px',
          color: '#64748b',
          fontSize: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>
            Showing <strong style={{ color: '#0f172a' }}>{filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong style={{ color: '#0f172a' }}>{Math.min(currentPage * pageSize, filteredData.length)}</strong> of{' '}
            <strong style={{ color: '#0f172a' }}>{filteredData.length}</strong> records
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                color: '#0f172a',
                padding: '3px 8px',
                fontSize: '11.5px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Pagination Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              backgroundColor: currentPage === 1 ? '#f8fafc' : '#ffffff',
              color: currentPage === 1 ? '#cbd5e1' : '#334155',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '11.5px',
              fontWeight: 600
            }}
          >
            ‹ Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              return (
                <React.Fragment key={p}>
                  {prev && p - prev > 1 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>}
                  <button
                    onClick={() => setCurrentPage(p)}
                    style={{
                      minWidth: '28px',
                      height: '28px',
                      borderRadius: '4px',
                      border: p === currentPage ? '1px solid #0d9488' : '1px solid #e2e8f0',
                      backgroundColor: p === currentPage ? '#0d9488' : '#ffffff',
                      color: p === currentPage ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      fontSize: '11.5px',
                      fontWeight: p === currentPage ? 700 : 500
                    }}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              backgroundColor: currentPage === totalPages ? '#f8fafc' : '#ffffff',
              color: currentPage === totalPages ? '#cbd5e1' : '#334155',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '11.5px',
              fontWeight: 600
            }}
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
}
