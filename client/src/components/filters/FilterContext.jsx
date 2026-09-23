import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { DIVISIONS_LIST } from '../../data/pubaliFullBranches';

export const FilterContext = createContext(null);

export const DATE_PRESETS = [
  { id: 'today', label: 'Today' },
  { id: '24h', label: 'Last 24 Hours' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'custom', label: 'Custom Range' }
];

export function FilterProvider({ children, activeId = 'dashboard' }) {
  // 1. Global Scope Filters
  const [region, setRegion] = useState('All Regions');
  const [branch, setBranch] = useState('All Branches');
  const [datePreset, setDatePreset] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Module Specific Page-Level Basic Filters
  const [moduleFilters, setModuleFilters] = useState({});

  // 3. Advanced Drawer Forensic Filters
  const [advancedFilters, setAdvancedFilters] = useState({});

  // 4. UI Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 5. Table Column Filters State (columnKey -> filterValue)
  const [tableColumnFilters, setTableColumnFilters] = useState({});

  // Setter helpers
  const setModuleFilter = useCallback((key, value) => {
    setModuleFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const setAdvancedFilter = useCallback((key, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const setTableFilter = useCallback((colKey, val) => {
    setTableColumnFilters(prev => ({
      ...prev,
      [colKey]: val
    }));
  }, []);

  const clearTableFilters = useCallback(() => {
    setTableColumnFilters({});
  }, []);

  // Reset to default enterprise state
  const resetAllFilters = useCallback(() => {
    setRegion('All Regions');
    setBranch('All Branches');
    setDatePreset('today');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearchQuery('');
    setModuleFilters({});
    setAdvancedFilters({});
    setTableColumnFilters({});
  }, []);

  // Remove a specific filter
  const removeFilter = useCallback((type, key) => {
    if (type === 'global') {
      if (key === 'region') {
        setRegion('All Regions');
        setBranch('All Branches');
      } else if (key === 'branch') {
        setBranch('All Branches');
      } else if (key === 'date') {
        setDatePreset('today');
      } else if (key === 'search') {
        setSearchQuery('');
      }
    } else if (type === 'module') {
      setModuleFilters(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else if (type === 'advanced') {
      setAdvancedFilters(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }, []);

  // Count active non-default filters
  const activeCount = useMemo(() => {
    let count = 0;
    if (region !== 'All Regions') count++;
    if (branch !== 'All Branches') count++;
    if (datePreset !== 'today') count++;
    if (searchQuery.trim()) count++;

    Object.values(moduleFilters).forEach(v => {
      if (v && v !== 'All' && v !== 'all') count++;
    });

    Object.values(advancedFilters).forEach(v => {
      if (v && v !== false && v !== 'All' && v !== '') count++;
    });

    return count;
  }, [region, branch, datePreset, searchQuery, moduleFilters, advancedFilters]);

  const value = useMemo(() => ({
    activeId,
    region,
    setRegion: (newRegion) => {
      setRegion(newRegion);
      // Reset branch if region changes
      setBranch('All Branches');
    },
    branch,
    setBranch,
    datePreset,
    setDatePreset,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    searchQuery,
    setSearchQuery,
    moduleFilters,
    setModuleFilter,
    advancedFilters,
    setAdvancedFilter,
    isDrawerOpen,
    setIsDrawerOpen,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
    toggleDrawer: () => setIsDrawerOpen(prev => !prev),
    tableColumnFilters,
    setTableFilter,
    clearTableFilters,
    resetAllFilters,
    removeFilter,
    activeCount,
    divisions: ['All Regions', ...DIVISIONS_LIST]
  }), [
    activeId, region, branch, datePreset, customStartDate, customEndDate,
    searchQuery, moduleFilters, advancedFilters, isDrawerOpen,
    tableColumnFilters, setModuleFilter, setAdvancedFilter, setTableFilter,
    clearTableFilters, resetAllFilters, removeFilter, activeCount
  ]);

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useBankFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useBankFilters must be used within a FilterProvider');
  }
  return context;
}
