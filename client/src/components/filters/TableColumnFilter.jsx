import React, { useState, useRef, useEffect } from 'react';
import { useBankFilters } from './FilterContext';
import './filters.css';

export default function TableColumnFilter({
  columnKey,
  title,
  label,
  columnLabel,
  sortable = true,
  currentSort = null,
  sortCol = null,
  sortDir = null,
  onSortChange = null,
  onSort = null,
  style = {}
}) {
  const { tableColumnFilters, setTableFilter } = useBankFilters();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  const displayTitle = title || label || columnLabel || columnKey;
  const filterVal = tableColumnFilters[columnKey] || '';

  // Extract sort direction regardless of prop format
  let activeSort = currentSort;
  if (currentSort && typeof currentSort === 'object') {
    activeSort = currentSort.columnKey === columnKey ? currentSort.direction : null;
  } else if (sortCol !== undefined && sortCol !== null) {
    activeSort = sortCol === columnKey ? sortDir : null;
  }

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const triggerSort = (dir) => {
    if (onSortChange) onSortChange(dir);
    else if (onSort) onSort(columnKey, dir);
  };

  const toggleSort = () => {
    if (!sortable) return;
    if (activeSort === 'asc') triggerSort('desc');
    else if (activeSort === 'desc') triggerSort(null);
    else triggerSort('asc');
  };

  return (
    <div className="eb-th-filter-wrapper" ref={popoverRef} style={style}>
      {/* Sort Button */}
      {sortable && (
        <button
          type="button"
          className="eb-col-filter-btn"
          onClick={toggleSort}
          title={`Sort by ${displayTitle}`}
          style={{ opacity: activeSort ? 1 : 0.4, color: activeSort ? '#38bdf8' : 'inherit' }}
        >
          {activeSort === 'asc' ? '▲' : activeSort === 'desc' ? '▼' : '⇅'}
        </button>
      )}

      {/* Filter Button */}
      <button
        type="button"
        className={`eb-col-filter-btn ${filterVal ? 'active' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        title={`Filter ${displayTitle}`}
      >
        <span style={{ fontSize: 10 }}>⚡</span>
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="eb-col-filter-popover">
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>
            Filter {title || columnKey}:
          </div>
          <input
            type="text"
            placeholder="Type filter value..."
            value={filterVal}
            onChange={e => setTableFilter(columnKey, e.target.value)}
            autoFocus
          />
          {filterVal && (
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f87171',
                  fontSize: 10,
                  cursor: 'pointer',
                  padding: '2px 4px'
                }}
                onClick={() => {
                  setTableFilter(columnKey, '');
                  setIsOpen(false);
                }}
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
