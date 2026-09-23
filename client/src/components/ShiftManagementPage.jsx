import React, { useState, useMemo, useEffect } from 'react';
import { FULL_PUBALI_LOCATIONS, DIVISIONS_LIST } from '../data/pubaliFullBranches';
import { useBankFilters } from './filters/FilterContext';

// ─── INITIAL SHIFT DEFINITIONS ──────────────────────────────
const INITIAL_SHIFTS = [
  {
    id: 'SH-GEN-01',
    name: 'General Banking Shift',
    code: 'SH-GEN-01',
    inTime: '08:30',
    outTime: '18:30',
    duration: '10h 00m',
    gracePeriod: 15, // mins
    earlyExitGrace: 15,
    breakStart: '13:00',
    breakEnd: '14:00',
    breakDuration: '60 mins',
    type: 'Standard Fixed',
    color: '#0d9488', // teal
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    weekend: ['Fri', 'Sat'],
    targetScope: 'All 519 Full Branches',
    assignedCount: 1842,
    complianceRate: '91.8%'
  },
  {
    id: 'SH-SUB-02',
    name: 'Upashakha Standard Shift',
    code: 'SH-SUB-02',
    inTime: '08:30',
    outTime: '17:30',
    duration: '9h 00m',
    gracePeriod: 15,
    earlyExitGrace: 15,
    breakStart: '13:15',
    breakEnd: '14:00',
    breakDuration: '45 mins',
    type: 'Standard Fixed',
    color: '#0284c7', // blue
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    weekend: ['Fri', 'Sat'],
    targetScope: 'All 281 Sub-Branches',
    assignedCount: 562,
    complianceRate: '89.2%'
  },
  {
    id: 'SH-HO-03',
    name: 'Head Office Corporate Shift',
    code: 'SH-HO-03',
    inTime: '09:00',
    outTime: '19:00',
    duration: '10h 00m',
    gracePeriod: 15,
    earlyExitGrace: 15,
    breakStart: '13:00',
    breakEnd: '14:00',
    breakDuration: '60 mins',
    type: 'Corporate Fixed',
    color: '#6366f1', // indigo
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    weekend: ['Fri', 'Sat'],
    targetScope: 'Pubali Bhaban HO Divisions',
    assignedCount: 195,
    complianceRate: '94.5%'
  },
  {
    id: 'SH-SEC-06',
    name: 'Security Guard Night & ATM Roster',
    code: 'SH-SEC-06',
    inTime: '18:00',
    outTime: '06:00',
    duration: '12h 00m',
    gracePeriod: 10,
    earlyExitGrace: 10,
    breakStart: '00:00',
    breakEnd: '01:00',
    breakDuration: '60 mins',
    type: '24/7 Security Roster',
    color: '#dc2626', // red
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekend: ['Rotational Off'],
    targetScope: 'All 829 Branches & ATM Booths',
    assignedCount: 2140,
    complianceRate: '99.2%'
  },
  {
    id: 'SH-RO-04',
    name: 'Regional Operations & Clearing',
    code: 'SH-RO-04',
    inTime: '08:00',
    outTime: '19:30',
    duration: '11h 30m',
    gracePeriod: 10,
    earlyExitGrace: 15,
    breakStart: '13:30',
    breakEnd: '14:15',
    breakDuration: '45 mins',
    type: 'Clearing & BACPS',
    color: '#d97706', // amber
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    weekend: ['Fri', 'Sat'],
    targetScope: '29 Regional Administrative Zones',
    assignedCount: 74,
    complianceRate: '93.2%'
  },
  {
    id: 'SH-IT-05',
    name: 'Data Center 24/7 Rotational Shift',
    code: 'SH-IT-05',
    inTime: '07:00',
    outTime: '15:30',
    duration: '8h 30m',
    gracePeriod: 5,
    earlyExitGrace: 5,
    breakStart: '12:00',
    breakEnd: '12:45',
    breakDuration: '45 mins',
    type: 'Rotational (A/B/C)',
    color: '#7c3aed', // purple
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekend: ['Rotational'],
    targetScope: 'IT Data Center & Core Banking',
    assignedCount: 24,
    complianceRate: '97.6%'
  }
];

// ─── INITIAL SHIFT GROUPS ───────────────────────────────────
const INITIAL_SHIFT_GROUPS = [
  {
    id: 'SG-BRANCH-01',
    name: 'Branch Banking Staff Group',
    code: 'SG-BRANCH-01',
    defaultShiftId: 'SH-GEN-01',
    defaultShiftName: 'General Banking Shift (08:30 – 18:30)',
    scope: 'All Full-Service Branches (519 Branches)',
    departmentScope: 'General Banking, Accounts, Loans',
    color: '#0d9488',
    description: 'Primary roster group for Branch Managers, Tellers, and Customer Service Officers.',
    memberCount: 1842,
    rotationCycle: 'Fixed Mon–Fri'
  },
  {
    id: 'SG-SUB-02',
    name: 'Sub-Branch (Upashakha) Officers Group',
    code: 'SG-SUB-02',
    defaultShiftId: 'SH-SUB-02',
    defaultShiftName: 'Upashakha Standard Shift (08:30 – 17:30)',
    scope: 'All 281 Sub-Branches',
    departmentScope: 'Cash Counters & Micro-Operations',
    color: '#0284c7',
    description: 'Roster group tailored for Sub-Branch Officers and In-Charges with earlier cash-box handovers.',
    memberCount: 562,
    rotationCycle: 'Fixed Mon–Fri'
  },
  {
    id: 'SG-CORP-03',
    name: 'Head Office Corporate Management Group',
    code: 'SG-CORP-03',
    defaultShiftId: 'SH-HO-03',
    defaultShiftName: 'Head Office Corporate Shift (09:00 – 19:00)',
    scope: 'Principal Branch & HO Divisions',
    departmentScope: 'Executive, HRD, Audit, Compliance, Treasury',
    color: '#6366f1',
    description: 'Corporate executive shift group matching Head Office executive working schedules.',
    memberCount: 195,
    rotationCycle: 'Fixed Mon–Fri'
  },
  {
    id: 'SG-SEC-04',
    name: '24/7 Security Guards & Vault Custodians',
    code: 'SG-SEC-04',
    defaultShiftId: 'SH-SEC-06',
    defaultShiftName: 'Security Guard Night & ATM Roster (18:00 – 06:00)',
    scope: 'All 829 Branches, Vaults & ATM Booths',
    departmentScope: 'Physical Security & Cash Vault Custody',
    color: '#dc2626',
    description: 'Dual-shift 24/7 security guard and physical cash vault night protection squad.',
    memberCount: 2140,
    rotationCycle: 'Rotational (Day/Night 12h Cycle)'
  },
  {
    id: 'SG-NOC-05',
    name: 'IT Data Center & Core Banking NOC Pool',
    code: 'SG-NOC-05',
    defaultShiftId: 'SH-IT-05',
    defaultShiftName: 'Data Center 24/7 Rotational Shift (07:00 – 15:30)',
    scope: 'Data Center & DR Site',
    departmentScope: 'Core Banking, Network NOC, Database Admin',
    color: '#7c3aed',
    description: 'Continuous 3-shift rotational team ensuring 99.99% uptime for core banking server clusters.',
    memberCount: 24,
    rotationCycle: '3-Shift Rotation (Morning/Evening/Night)'
  }
];

function buildInitialEmployeeRoster() {
  const roster = [];
  const deptPool = [
    'Cash Department', 'General Banking', 'Accounts', 'Audit & Compliance',
    'Islamic Banking', 'Operations', 'IT Operations', 'Branch Management'
  ];

  FULL_PUBALI_LOCATIONS.forEach((loc, locIdx) => {
    if (loc.employees && loc.employees.length > 0) {
      loc.employees.forEach((emp, empIdx) => {
        const isHO = loc.type === 'head-office';
        const isSub = loc.type === 'subbranch';
        const isIslamic = loc.type === 'islamic';

        let assignedGroupId = 'SG-BRANCH-01';
        let assignedShiftId = 'SH-GEN-01';

        if (isHO) {
          assignedGroupId = 'SG-CORP-03';
          assignedShiftId = 'SH-HO-03';
        } else if (isSub) {
          assignedGroupId = 'SG-SUB-02';
          assignedShiftId = 'SH-SUB-02';
        }

        const dept = isHO
          ? 'Head Office Corporate Division'
          : (isIslamic ? 'Islamic Banking Wing' : deptPool[(locIdx + empIdx) % deptPool.length]);

        const designation = empIdx === 0
          ? 'Branch Manager / In-Charge'
          : (empIdx === 1 ? 'Principal Cash Officer' : (empIdx === 2 ? 'Senior Executive Officer' : 'Officer (General Banking)'));

        roster.push({
          id: emp.id,
          name: emp.name,
          branch: loc.name,
          division: loc.division || 'Dhaka',
          department: dept,
          designation,
          shiftGroupId: assignedGroupId,
          shiftId: assignedShiftId,
          graceMinutes: 15,
          customSchedule: null,
          status: emp.status === 'Absent' ? 'On Leave / Absent' : 'Active Duty',
          complianceScore: emp.late ? '82.5%' : '96.8%',
          lastAssignedDate: '2026-09-01'
        });
      });
    }

    // Add Security Guards (2,140 total guards across 829 branches & ATM booths)
    const guardCount = locIdx < 482 ? 3 : 2; // (482 * 3) + (347 * 2) = 1446 + 694 = 2,140 Guards
    const guardNames = ['Md. Habibur Rahman', 'Abdur Rahim', 'Md. Jahangir Alam', 'Sultan Mahmud', 'Md. Anwar Hossain', 'Kamal Uddin', 'Nurul Islam', 'Md. Harun-or-Rashid', 'Mizanur Rahman', 'Shahidul Islam'];
    
    for (let g = 0; g < guardCount; g++) {
      const gId = `GRD-PB-${String(locIdx * 3 + g + 1001).padStart(5, '0')}`;
      const gName = `${guardNames[(locIdx + g) % guardNames.length]} (${g === 0 ? 'Night Shift Lead' : 'ATM Booth Guard'})`;
      roster.push({
        id: gId,
        name: gName,
        branch: `${loc.name} (Vault & ATM)`,
        division: loc.division || 'Dhaka',
        department: 'Physical Security & Vault Guard',
        designation: g === 0 ? 'Armed Vault Custodian Guard' : 'ATM Booth Night Security Guard',
        shiftGroupId: 'SG-SEC-04',
        shiftId: 'SH-SEC-06',
        graceMinutes: 10,
        customSchedule: '18:00 – 06:00 (12h Night Roster)',
        status: 'Active Duty',
        complianceScore: '99.4%',
        lastAssignedDate: '2026-09-01'
      });
    }
  });

  return roster;
}

// ─── HELPER: EXPORT CSV ─────────────────────────────────────
function exportShiftRosterCsv(header, rows, filename) {
  const content = [header, ...rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ShiftManagementPage({ initialGroup, initialShift, onNavigate }) {
  // Read from hash query params if present, e.g. #att-shift?shift=SH-SEC-06&group=SG-SEC-04
  const getInitialFilters = () => {
    let g = initialGroup || 'All';
    let s = initialShift || 'All';
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      if (hash.includes('group=')) {
        const match = hash.match(/group=([^&]+)/);
        if (match) g = decodeURIComponent(match[1]);
      }
      if (hash.includes('shift=')) {
        const match = hash.match(/shift=([^&]+)/);
        if (match) s = decodeURIComponent(match[1]);
      }
    }
    return { g, s };
  };

  const init = getInitialFilters();

  // ── Consume global FilterContext
  const { region: globalRegion, searchQuery: globalSearch } = useBankFilters();

  // ── State: Shifts & Groups
  const [shifts, setShifts] = useState(INITIAL_SHIFTS);
  const [shiftGroups, setShiftGroups] = useState(INITIAL_SHIFT_GROUPS);
  const [employeeRoster, setEmployeeRoster] = useState(buildInitialEmployeeRoster);

  // ── State: UI Controls
  const [activeTab, setActiveTab] = useState('assignment'); // 'assignment' | 'groups' | 'shifts' | 'rotation'
  const [search, setSearch] = useState('');
  const [filterDivision, setFilterDivision] = useState('All');
  const [filterGroup, setFilterGroup] = useState(init.g);
  const [filterShift, setFilterShift] = useState(init.s);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // ── Sync from global FilterContext
  useEffect(() => {
    if (globalRegion && globalRegion !== 'All Regions') {
      // Map "Dhaka Region" -> "Dhaka" for the division filter
      const divName = globalRegion.replace(' Region', '');
      setFilterDivision(DIVISIONS_LIST.includes(divName) ? divName : 'All');
    } else {
      setFilterDivision('All');
    }
  }, [globalRegion]);

  useEffect(() => {
    if (globalSearch !== undefined) setSearch(globalSearch);
  }, [globalSearch]);

  // Listen to hash changes for deep linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '';
      if (hash.includes('group=')) {
        const match = hash.match(/group=([^&]+)/);
        if (match) setFilterGroup(decodeURIComponent(match[1]));
      }
      if (hash.includes('shift=')) {
        const match = hash.match(/shift=([^&]+)/);
        if (match) setFilterShift(decodeURIComponent(match[1]));
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // ── State: Multi-Select Checkboxes
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ── State: Modals
  const [showCreateShiftModal, setShowCreateShiftModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showBatchAssignModal, setShowBatchAssignModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // ── State: Forms
  const [newShiftForm, setNewShiftForm] = useState({
    name: '',
    code: '',
    inTime: '09:00',
    outTime: '18:00',
    gracePeriod: 15,
    earlyExitGrace: 15,
    breakStart: '13:00',
    breakEnd: '14:00',
    type: 'Standard Fixed',
    color: '#0d9488',
    targetScope: 'Selected Branches'
  });

  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    code: '',
    defaultShiftId: INITIAL_SHIFTS[0].id,
    scope: 'Branch Operations',
    departmentScope: 'General Banking & Cash',
    color: '#0d9488',
    description: '',
    rotationCycle: 'Fixed Mon–Fri'
  });

  const [batchAssignTargetGroupId, setBatchAssignTargetGroupId] = useState(INITIAL_SHIFT_GROUPS[0].id);

  // ── Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // ── Lookup Maps
  const shiftMap = useMemo(() => {
    const map = {};
    shifts.forEach(s => { map[s.id] = s; });
    return map;
  }, [shifts]);

  const groupMap = useMemo(() => {
    const map = {};
    shiftGroups.forEach(g => { map[g.id] = g; });
    return map;
  }, [shiftGroups]);

  // ── Filtered Employees
  const filteredRoster = useMemo(() => {
    return employeeRoster.filter(emp => {
      if (filterDivision !== 'All' && emp.division !== filterDivision) return false;
      if (filterGroup !== 'All' && emp.shiftGroupId !== filterGroup) return false;
      if (filterShift !== 'All' && emp.shiftId !== filterShift) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = emp.id.toLowerCase().includes(q);
        const matchName = emp.name.toLowerCase().includes(q);
        const matchBranch = emp.branch.toLowerCase().includes(q);
        const matchDept = emp.department.toLowerCase().includes(q);
        const matchDesig = emp.designation.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchBranch && !matchDept && !matchDesig) return false;
      }
      return true;
    });
  }, [employeeRoster, filterDivision, filterGroup, filterShift, search]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDivision, filterGroup, filterShift]);

  const totalPages = Math.ceil(filteredRoster.length / pageSize) || 1;
  const paginatedRoster = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoster.slice(start, start + pageSize);
  }, [filteredRoster, currentPage, pageSize]);

  // ── Checkbox Handlers
  const handleToggleSelectAllOnPage = () => {
    const next = new Set(selectedIds);
    const allPageSelected = paginatedRoster.every(emp => next.has(emp.id));

    if (allPageSelected) {
      paginatedRoster.forEach(emp => next.delete(emp.id));
    } else {
      paginatedRoster.forEach(emp => next.add(emp.id));
    }
    setSelectedIds(next);
  };

  const handleToggleSelectAllGlobal = () => {
    if (selectedIds.size === filteredRoster.length) {
      setSelectedIds(new Set());
    } else {
      const next = new Set();
      filteredRoster.forEach(emp => next.add(emp.id));
      setSelectedIds(next);
    }
  };

  const handleToggleSelectRow = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // ── Single Employee Group / Shift Change
  const handleUpdateSingleEmployeeGroup = (empId, newGroupId) => {
    const targetGroup = groupMap[newGroupId];
    if (!targetGroup) return;

    setEmployeeRoster(prev => prev.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          shiftGroupId: newGroupId,
          shiftId: targetGroup.defaultShiftId,
          graceMinutes: shiftMap[targetGroup.defaultShiftId]?.gracePeriod || 15,
          lastAssignedDate: new Date().toISOString().slice(0, 10)
        };
      }
      return emp;
    }));

    showToast(`✓ Shift group updated to "${targetGroup.name}" for employee ${empId}`);
  };

  const handleUpdateSingleEmployeeShift = (empId, newShiftId) => {
    const targetShift = shiftMap[newShiftId];
    if (!targetShift) return;

    setEmployeeRoster(prev => prev.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          shiftId: newShiftId,
          graceMinutes: targetShift.gracePeriod || 15,
          lastAssignedDate: new Date().toISOString().slice(0, 10)
        };
      }
      return emp;
    }));

    showToast(`✓ Assigned shift "${targetShift.name}" to employee ${empId}`);
  };

  // ── Bulk Shift Group Assignment Action
  const handleExecuteBatchGroupAssignment = () => {
    if (selectedIds.size === 0) return;
    const targetGroup = groupMap[batchAssignTargetGroupId];
    if (!targetGroup) return;

    const count = selectedIds.size;

    setEmployeeRoster(prev => prev.map(emp => {
      if (selectedIds.has(emp.id)) {
        return {
          ...emp,
          shiftGroupId: targetGroup.id,
          shiftId: targetGroup.defaultShiftId,
          graceMinutes: shiftMap[targetGroup.defaultShiftId]?.gracePeriod || 15,
          lastAssignedDate: new Date().toISOString().slice(0, 10)
        };
      }
      return emp;
    }));

    // Update group counts
    setShiftGroups(prev => prev.map(g => {
      if (g.id === targetGroup.id) {
        return { ...g, memberCount: g.memberCount + count };
      }
      return g;
    }));

    setShowBatchAssignModal(false);
    setSelectedIds(new Set());
    showToast(`🎉 Successfully grouped & assigned ${count} employees to "${targetGroup.name}"!`);
  };

  // ── Create New Shift Handler
  const handleCreateShift = (e) => {
    e.preventDefault();
    if (!newShiftForm.name.trim()) return;

    const generatedCode = newShiftForm.code.trim() || `SH-${newShiftForm.name.slice(0, 3).toUpperCase()}-${String(shifts.length + 1).padStart(2, '0')}`;
    
    // Calculate duration approx
    const [inH, inM] = newShiftForm.inTime.split(':').map(Number);
    const [outH, outM] = newShiftForm.outTime.split(':').map(Number);
    let diffM = (outH * 60 + outM) - (inH * 60 + inM);
    if (diffM < 0) diffM += 24 * 60; // overnight
    const durH = Math.floor(diffM / 60);
    const durRemM = diffM % 60;
    const durationStr = `${durH}h ${String(durRemM).padStart(2, '0')}m`;

    const newShiftObj = {
      id: generatedCode,
      name: newShiftForm.name.trim(),
      code: generatedCode,
      inTime: newShiftForm.inTime,
      outTime: newShiftForm.outTime,
      duration: durationStr,
      gracePeriod: Number(newShiftForm.gracePeriod) || 15,
      earlyExitGrace: Number(newShiftForm.earlyExitGrace) || 15,
      breakStart: newShiftForm.breakStart || '13:00',
      breakEnd: newShiftForm.breakEnd || '14:00',
      breakDuration: '60 mins',
      type: newShiftForm.type,
      color: newShiftForm.color,
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
      weekend: ['Fri', 'Sat'],
      targetScope: newShiftForm.targetScope || 'All Branches',
      assignedCount: 0,
      complianceRate: '100%'
    };

    setShifts(prev => [...prev, newShiftObj]);
    setShowCreateShiftModal(false);
    setNewShiftForm({
      name: '',
      code: '',
      inTime: '09:00',
      outTime: '18:00',
      gracePeriod: 15,
      earlyExitGrace: 15,
      breakStart: '13:00',
      breakEnd: '14:00',
      type: 'Standard Fixed',
      color: '#0d9488',
      targetScope: 'Selected Branches'
    });
    showToast(`✓ New Shift "${newShiftObj.name}" created successfully!`);
  };

  // ── Create New Shift Group Handler
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupForm.name.trim()) return;

    const generatedCode = newGroupForm.code.trim() || `SG-${newGroupForm.name.slice(0, 4).toUpperCase()}-${String(shiftGroups.length + 1).padStart(2, '0')}`;
    const selectedShift = shiftMap[newGroupForm.defaultShiftId] || shifts[0];

    const newGroupObj = {
      id: generatedCode,
      name: newGroupForm.name.trim(),
      code: generatedCode,
      defaultShiftId: selectedShift.id,
      defaultShiftName: `${selectedShift.name} (${selectedShift.inTime} – ${selectedShift.outTime})`,
      scope: newGroupForm.scope || 'Custom Regional Scope',
      departmentScope: newGroupForm.departmentScope || 'All Branch Wings',
      color: newGroupForm.color || '#0d9488',
      description: newGroupForm.description || 'Custom configured operational shift group.',
      memberCount: 0,
      rotationCycle: newGroupForm.rotationCycle || 'Fixed Mon–Fri'
    };

    setShiftGroups(prev => [...prev, newGroupObj]);
    setShowCreateGroupModal(false);
    setNewGroupForm({
      name: '',
      code: '',
      defaultShiftId: shifts[0].id,
      scope: 'Branch Operations',
      departmentScope: 'General Banking & Cash',
      color: '#0d9488',
      description: '',
      rotationCycle: 'Fixed Mon–Fri'
    });
    showToast(`✓ Shift Group "${newGroupObj.name}" created! You can now select & assign employees to it.`);
  };

  // ── Export CSV Handler
  const handleExportRoster = () => {
    const header = ['Employee ID', 'Full Name', 'Branch / Location', 'Division', 'Department', 'Designation', 'Shift Group Code', 'Shift Group Name', 'Assigned Shift', 'Schedule Window', 'Late Grace (Mins)', 'Status', 'Compliance %'];
    const rows = filteredRoster.map(emp => {
      const grp = groupMap[emp.shiftGroupId] || { name: 'Unassigned', code: '-' };
      const shf = shiftMap[emp.shiftId] || { name: 'Unassigned', inTime: '-', outTime: '-' };
      return [
        emp.id,
        emp.name,
        emp.branch,
        emp.division,
        emp.department,
        emp.designation,
        grp.code,
        grp.name,
        shf.name,
        `${shf.inTime} - ${shf.outTime}`,
        emp.graceMinutes,
        emp.status,
        emp.complianceScore
      ];
    });
    exportShiftRosterCsv(header, rows, `Pubali_Bank_Shift_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* ── TOAST NOTIFICATION ─────────────────────────── */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 28,
          zIndex: 9999,
          background: '#064e3b',
          color: '#ecfdf5',
          border: '1px solid #34d399',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
          padding: '12px 20px',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontWeight: 600,
          fontSize: 13,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#a7f3d0', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── BENGALI & ENGLISH QUICK GUIDE BANNER ──────── */}
      <div style={{
        background: 'linear-gradient(135deg, #004d34 0%, #006848 100%)',
        color: '#ffffff',
        borderRadius: 10,
        padding: '16px 20px',
        boxShadow: '0 4px 14px rgba(0, 104, 72, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14
      }}>
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>⏱️</span>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.01em' }}>
              Pubali Bank BioStar X — Shift Creation & Batch Grouping System
            </span>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
              letterSpacing: '0.04em'
            }}>
              ATT-10 SPEC
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: '#e6f4ea', lineHeight: 1.5 }}>
            <strong>Quick Workflow:</strong> 
            1. <strong>Create Shift:</strong> Click <span style={{ textDecoration: 'underline' }}>+ Create Shift</span> to configure schedule windows & grace tolerances. 
            2. <strong>Create Shift Group:</strong> Click <span style={{ textDecoration: 'underline' }}>+ Create Shift Group</span> to map branch & department rosters. 
            3. <strong>Select & Group:</strong> Check boxes (☑) on employee rows and click <strong>"Assign Selected to Shift Group"</strong> for instant 1-click batch grouping.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowCreateShiftModal(true)}
            style={{
              background: '#ffffff',
              color: '#006848',
              border: 'none',
              padding: '9px 15px',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
            }}
          >
            <span>➕</span>
            <span>Create Shift</span>
          </button>

          <button
            onClick={() => setShowCreateGroupModal(true)}
            style={{
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              padding: '9px 15px',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
            }}
          >
            <span>👥</span>
            <span>Create Shift Group</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS STRIP ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: '#0d948815', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ⏰
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Configured Shifts</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0d9488', marginTop: 1 }}>{shifts.length} Shifts</div>
            <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Fixed, Rotational & Security</div>
          </div>
        </div>

        <div
          onClick={() => {
            setFilterGroup('SG-SEC-04');
            setFilterShift('SH-SEC-06');
            setActiveTab('assignment');
          }}
          style={{
            background: filterShift === 'SH-SEC-06' ? '#ecfdf5' : '#ffffff',
            border: filterShift === 'SH-SEC-06' ? '2px solid #059669' : '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            transition: 'all 0.15s'
          }}
          title="Click to filter 2,140 Security Guards"
        >
          <div style={{ width: 42, height: 42, borderRadius: 8, background: '#05966915', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            🛡️
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>Security Guard Shifts</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', marginTop: 1 }}>2,140 Guards</div>
            <div style={{ fontSize: 10.5, color: '#64748b' }}>Branch & ATM Night Duty</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: '#0284c715', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            👥
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Active Shift Groups</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0284c7', marginTop: 1 }}>{shiftGroups.length} Groups</div>
            <div style={{ fontSize: 10.5, color: '#94a3b8' }}>Covering all 829 Branches</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: '#6366f115', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ☑️
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Selected for Batching</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: selectedIds.size > 0 ? '#6366f1' : '#94a3b8', marginTop: 1 }}>
              {selectedIds.size} Selected
            </div>
            <div style={{ fontSize: 10.5, color: '#94a3b8' }}>
              {selectedIds.size > 0 ? 'Ready for 1-Click Grouping' : 'Use checkboxes below'}
            </div>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ────────────────────────────── */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e2e8f0',
        background: '#ffffff',
        borderRadius: '8px 8px 0 0',
        padding: '6px 14px 0',
        gap: 6,
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('assignment')}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderBottom: activeTab === 'assignment' ? '3px solid #006848' : '3px solid transparent',
            background: 'transparent',
            color: activeTab === 'assignment' ? '#006848' : '#64748b',
            fontWeight: activeTab === 'assignment' ? 800 : 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7
          }}
        >
          <span>☑️</span>
          <span>Employee Shift Assignment & Batch Grouping</span>
          <span style={{
            background: activeTab === 'assignment' ? '#e6f4ea' : '#f1f5f9',
            color: activeTab === 'assignment' ? '#006848' : '#64748b',
            fontSize: 11,
            padding: '2px 7px',
            borderRadius: 12,
            fontWeight: 700
          }}>
            {filteredRoster.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderBottom: activeTab === 'groups' ? '3px solid #006848' : '3px solid transparent',
            background: 'transparent',
            color: activeTab === 'groups' ? '#006848' : '#64748b',
            fontWeight: activeTab === 'groups' ? 800 : 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7
          }}
        >
          <span>👥</span>
          <span>Shift Groups ({shiftGroups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderBottom: activeTab === 'shifts' ? '3px solid #006848' : '3px solid transparent',
            background: 'transparent',
            color: activeTab === 'shifts' ? '#006848' : '#64748b',
            fontWeight: activeTab === 'shifts' ? 800 : 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7
          }}
        >
          <span>⏰</span>
          <span>Shift Rules & Timetable ({shifts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rotation')}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderBottom: activeTab === 'rotation' ? '3px solid #006848' : '3px solid transparent',
            background: 'transparent',
            color: activeTab === 'rotation' ? '#006848' : '#64748b',
            fontWeight: activeTab === 'rotation' ? 800 : 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7
          }}
        >
          <span>📅</span>
          <span>Weekly Rotation Matrix</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 1: EMPLOYEE SHIFT ASSIGNMENT & BATCH GROUPING   */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeTab === 'assignment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          
          {/* ── STICKY BULK ACTION BAR (WHEN ITEMS ARE SELECTED) ── */}
          {selectedIds.size > 0 && (
            <div style={{
              background: '#f0fdf4',
              border: '1.5px solid #22c55e',
              borderRadius: 8,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)',
              animation: 'fadeIn 0.2s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  background: '#15803d',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 12.5,
                  padding: '4px 10px',
                  borderRadius: 20
                }}>
                  ✓ {selectedIds.size} Employees Selected
                </span>
                <span style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>
                  Multiple employees selected — ready for 1-click batch group assignment
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowBatchAssignModal(true)}
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '7px 14px',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <span>⚡</span>
                  <span>Assign Selected to Shift Group</span>
                </button>

                <button
                  onClick={handleClearSelection}
                  style={{
                    background: '#ffffff',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '7px 12px',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* ── FILTER STRIP ───────────────────────────── */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: '1 1 600px' }}>
              {/* Search */}
              <div style={{ position: 'relative', minWidth: 220, flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search Employee, ID, Branch, Designation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 30px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: 12.5,
                    outline: 'none'
                  }}
                />
                <span style={{ position: 'absolute', left: 9, top: 7, color: '#94a3b8', fontSize: 13 }}>🔍</span>
              </div>

              {/* Division Filter */}
              <select
                value={filterDivision}
                onChange={(e) => setFilterDivision(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  background: '#f8fafc',
                  color: '#334155'
                }}
              >
                <option value="All">All Divisions (829 Branches)</option>
                {DIVISIONS_LIST.map(d => (
                  <option key={d} value={d}>{d} Division</option>
                ))}
              </select>

              {/* Shift Group Filter */}
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  background: '#f8fafc',
                  color: '#334155'
                }}
              >
                <option value="All">All Shift Groups ({shiftGroups.length})</option>
                {shiftGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>

              {/* Shift Rule Filter */}
              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  background: '#f8fafc',
                  color: '#334155'
                }}
              >
                <option value="All">All Shift Times ({shifts.length})</option>
                {shifts.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.inTime}–{s.outTime})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={handleToggleSelectAllGlobal}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '7px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {selectedIds.size === filteredRoster.length ? 'Deselect All' : `Select All Filtered (${filteredRoster.length})`}
              </button>

              <button
                onClick={handleExportRoster}
                style={{
                  background: '#ffffff',
                  color: '#006848',
                  border: '1px solid #006848',
                  padding: '7px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <span>📥</span>
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* ── EMPLOYEE ROSTER TABLE WITH SELECTION ── */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: 11.5 }}>
                    <th style={{ padding: '10px 12px', width: 44, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={paginatedRoster.length > 0 && paginatedRoster.every(emp => selectedIds.has(emp.id))}
                        onChange={handleToggleSelectAllOnPage}
                        style={{ cursor: 'pointer', width: 15, height: 15, accentColor: '#006848' }}
                        title="Select/Deselect all on this page"
                      />
                    </th>
                    <th style={{ padding: '10px 12px' }}>User / Employee</th>
                    <th style={{ padding: '10px 12px' }}>Branch / Location</th>
                    <th style={{ padding: '10px 12px' }}>Department & Role</th>
                    <th style={{ padding: '10px 12px' }}>Assigned Shift Group</th>
                    <th style={{ padding: '10px 12px' }}>Shift Hours & Grace</th>
                    <th style={{ padding: '10px 12px' }}>Compliance</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Quick Change Group</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRoster.map((emp) => {
                    const isSelected = selectedIds.has(emp.id);
                    const currentGrp = groupMap[emp.shiftGroupId] || { name: 'Unassigned Group', color: '#64748b', code: 'SG-NONE' };
                    const currentShf = shiftMap[emp.shiftId] || { name: 'Custom Shift', inTime: '08:30', outTime: '18:30', gracePeriod: 15, color: '#0d9488' };

                    return (
                      <tr
                        key={emp.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isSelected ? '#f0fdf4' : 'transparent',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(emp.id)}
                            style={{ cursor: 'pointer', width: 15, height: 15, accentColor: '#006848' }}
                          />
                        </td>

                        {/* Employee Details */}
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{emp.name}</div>
                          <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: '#64748b' }}>{emp.id}</div>
                        </td>

                        {/* Branch */}
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{ color: '#334155', fontWeight: 600 }}>{emp.branch}</div>
                          <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{emp.division} Division</div>
                        </td>

                        {/* Department */}
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{ color: '#475569' }}>{emp.department}</div>
                          <div style={{ fontSize: 10.5, color: '#64748b' }}>{emp.designation}</div>
                        </td>

                        {/* Shift Group Badge */}
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: `${currentGrp.color}15`,
                            color: currentGrp.color,
                            border: `1px solid ${currentGrp.color}40`,
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 11
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: currentGrp.color }}></span>
                            <span>{currentGrp.name}</span>
                          </div>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{currentGrp.code}</div>
                        </td>

                        {/* Shift Timing */}
                        <td style={{ padding: '9px 12px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {currentShf.inTime} – {currentShf.outTime}
                          </div>
                          <div style={{ fontSize: 10.5, color: '#0d9488' }}>
                            Tolerance: ±{emp.graceMinutes} mins grace
                          </div>
                        </td>

                        {/* Compliance */}
                        <td style={{ padding: '9px 12px' }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: parseFloat(emp.complianceScore) > 90 ? '#16a34a' : '#d97706'
                          }}>
                            {emp.complianceScore}
                          </span>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>ATT-10 Adherence</div>
                        </td>

                        {/* Quick Group Dropdown */}
                        <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                          <select
                            value={emp.shiftGroupId}
                            onChange={(e) => handleUpdateSingleEmployeeGroup(emp.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 4,
                              border: '1px solid #cbd5e1',
                              fontSize: 11,
                              background: '#ffffff',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            {shiftGroups.map(g => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredRoster.length === 0 && (
              <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No employee records match your search filter criteria.
              </div>
            )}

            {/* Pagination Strip */}
            <div style={{
              padding: '10px 16px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              fontSize: 11.5,
              color: '#64748b'
            }}>
              <div>
                Showing {((currentPage - 1) * pageSize) + 1} – {Math.min(currentPage * pageSize, filteredRoster.length)} of {filteredRoster.length} employees
                {selectedIds.size > 0 && <strong style={{ color: '#16a34a', marginLeft: 8 }}>({selectedIds.size} Selected)</strong>}
              </div>

              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  style={{ padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: 4, cursor: 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: 4, cursor: 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  ‹
                </button>
                <span style={{ padding: '0 8px', fontWeight: 700, color: '#1e293b' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: 4, cursor: 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  style={{ padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: 4, cursor: 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  »
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 2: SHIFT GROUPS (GROUPING ARCHITECTURE)        */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeTab === 'groups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                Shift Groups Configuration & Branch Mapping
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                Group branches and staff rosters into centralized scheduling pools. Employees assigned to a group inherit its shift timetable.
              </p>
            </div>

            <button
              onClick={() => setShowCreateGroupModal(true)}
              style={{
                background: '#006848',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>➕</span>
              <span>Create New Shift Group</span>
            </button>
          </div>

          {/* Group Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            {shiftGroups.map(group => {
              const assignedShift = shiftMap[group.defaultShiftId] || shifts[0];
              const groupEmpCount = employeeRoster.filter(e => e.shiftGroupId === group.id).length;

              return (
                <div
                  key={group.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                    borderTop: `4px solid ${group.color}`
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          background: `${group.color}15`,
                          color: group.color,
                          padding: '2px 6px',
                          borderRadius: 4
                        }}>
                          {group.code}
                        </span>
                        <h4 style={{ margin: '6px 0 2px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                          {group.name}
                        </h4>
                      </div>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: 12
                      }}>
                        👥 {groupEmpCount} Staff
                      </span>
                    </div>

                    <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4, margin: '6px 0 12px' }}>
                      {group.description}
                    </p>

                    <div style={{ background: '#f8fafc', borderRadius: 6, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Assigned Shift:</span>
                        <strong style={{ color: '#0f172a' }}>{assignedShift.name}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Working Hours:</span>
                        <strong style={{ color: group.color }}>{assignedShift.inTime} – {assignedShift.outTime}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Late Grace Tolerance:</span>
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>±{assignedShift.gracePeriod} Mins</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Branch / Location Scope:</span>
                        <span style={{ color: '#334155', fontWeight: 600 }}>{group.scope}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Rotation Policy:</span>
                        <span style={{ color: '#6366f1', fontWeight: 600 }}>{group.rotationCycle}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        setFilterGroup(group.id);
                        setActiveTab('assignment');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: group.color,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      View & Manage Members ({groupEmpCount}) →
                    </button>
                    
                    <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>
                      ● Active Group
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 3: SHIFT RULES & TIMETABLE (CREATE SHIFTS)     */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeTab === 'shifts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
                Shift Schedule Definitions & Grace Configuration
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                Define start time, end time, break hours, tolerance threshold, and overtime windows for all banking wings.
              </p>
            </div>

            <button
              onClick={() => setShowCreateShiftModal(true)}
              style={{
                background: '#006848',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>➕</span>
              <span>Create New Shift</span>
            </button>
          </div>

          {/* Shifts Table */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: 11.5 }}>
                    <th style={{ padding: '10px 14px' }}>Shift Code & Name</th>
                    <th style={{ padding: '10px 14px' }}>Schedule Window</th>
                    <th style={{ padding: '10px 14px' }}>Duration</th>
                    <th style={{ padding: '10px 14px' }}>Late Grace</th>
                    <th style={{ padding: '10px 14px' }}>Break Window</th>
                    <th style={{ padding: '10px 14px' }}>Shift Type</th>
                    <th style={{ padding: '10px 14px' }}>Working Days</th>
                    <th style={{ padding: '10px 14px' }}>Branch Scope</th>
                    <th style={{ padding: '10px 14px' }}>Adherence</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map(shift => (
                    <tr key={shift.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: shift.color }}></span>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{shift.name}</div>
                            <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: '#64748b' }}>{shift.code}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: 700, color: '#006848', fontSize: 13 }}>
                          {shift.inTime} – {shift.outTime}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569', fontWeight: 600 }}>
                        {shift.duration}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: '#ecfdf5',
                          color: '#047857',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontWeight: 700,
                          fontSize: 11
                        }}>
                          ±{shift.gracePeriod} Mins
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>
                        {shift.breakStart} – {shift.breakEnd} ({shift.breakDuration})
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          background: `${shift.color}15`,
                          color: shift.color,
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontWeight: 700,
                          fontSize: 11
                        }}>
                          {shift.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#334155' }}>
                        {shift.days.join(', ')}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 11 }}>
                        {shift.targetScope}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: 800, color: '#16a34a' }}>
                          {shift.complianceRate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 4: WEEKLY ROTATION MATRIX                      */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeTab === 'rotation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' }}>
              Weekly Shift Rotation & Roster Matrix
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
              Visual 7-day schedule view showing shift assignments for each shift group and operational wing.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '12px 14px', textAlign: 'left', minWidth: 220 }}>Shift Group</th>
                    <th style={{ padding: '12px 10px', minWidth: 100 }}>Sun</th>
                    <th style={{ padding: '12px 10px', minWidth: 100 }}>Mon</th>
                    <th style={{ padding: '12px 10px', minWidth: 100 }}>Tue</th>
                    <th style={{ padding: '12px 10px', minWidth: 100 }}>Wed</th>
                    <th style={{ padding: '12px 10px', minWidth: 100 }}>Thu</th>
                    <th style={{ padding: '12px 10px', minWidth: 100, background: '#fef2f2', color: '#dc2626' }}>Fri (Weekend)</th>
                    <th style={{ padding: '12px 10px', minWidth: 100, background: '#fef2f2', color: '#dc2626' }}>Sat (Weekend)</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftGroups.map(grp => {
                    const shf = shiftMap[grp.defaultShiftId] || shifts[0];
                    const is24x7 = grp.id === 'SG-SEC-04' || grp.id === 'SG-NOC-05';

                    return (
                      <tr key={grp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{grp.name}</div>
                          <div style={{ fontSize: 10.5, color: grp.color }}>{shf.name} ({shf.inTime}–{shf.outTime})</div>
                        </td>

                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].map(day => (
                          <td key={day} style={{ padding: '10px 8px' }}>
                            <span style={{
                              background: `${grp.color}15`,
                              color: grp.color,
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontWeight: 700,
                              fontSize: 11,
                              display: 'inline-block'
                            }}>
                              {shf.inTime}–{shf.outTime}
                            </span>
                          </td>
                        ))}

                        {/* Friday */}
                        <td style={{ padding: '10px 8px', background: '#fffafa' }}>
                          {is24x7 ? (
                            <span style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontWeight: 700,
                              fontSize: 11,
                              display: 'inline-block'
                            }}>
                              {shf.inTime}–{shf.outTime} (Duty)
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>OFF</span>
                          )}
                        </td>

                        {/* Saturday */}
                        <td style={{ padding: '10px 8px', background: '#fffafa' }}>
                          {is24x7 ? (
                            <span style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontWeight: 700,
                              fontSize: 11,
                              display: 'inline-block'
                            }}>
                              {shf.inTime}–{shf.outTime} (Duty)
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600 }}>OFF</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* MODAL 1: CREATE NEW SHIFT FORM                     */}
      {/* ═══════════════════════════════════════════════════ */}
      {showCreateShiftModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 10,
            width: '100%',
            maxWidth: 540,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            <div style={{ background: '#006848', color: '#ffffff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>➕ Create New Shift Rule</div>
              <button
                onClick={() => setShowCreateShiftModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShift} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Shift Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Treasury Morning Clearing Shift"
                  value={newShiftForm.name}
                  onChange={(e) => setNewShiftForm({ ...newShiftForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Start Time (In-Time) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={newShiftForm.inTime}
                    onChange={(e) => setNewShiftForm({ ...newShiftForm, inTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    End Time (Out-Time) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={newShiftForm.outTime}
                    onChange={(e) => setNewShiftForm({ ...newShiftForm, outTime: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Late Grace Tolerance (Mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={newShiftForm.gracePeriod}
                    onChange={(e) => setNewShiftForm({ ...newShiftForm, gracePeriod: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Shift Type / Tier
                  </label>
                  <select
                    value={newShiftForm.type}
                    onChange={(e) => setNewShiftForm({ ...newShiftForm, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                  >
                    <option value="Standard Fixed">Standard Fixed</option>
                    <option value="Corporate Fixed">Corporate Fixed</option>
                    <option value="24/7 Security Roster">24/7 Security Roster</option>
                    <option value="Clearing & BACPS">Clearing & BACPS</option>
                    <option value="Rotational (A/B/C)">Rotational (A/B/C)</option>
                    <option value="Islamic Wing Shift">Islamic Wing Shift</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Break Window (Start)
                  </label>
                  <input
                    type="time"
                    value={newShiftForm.breakStart}
                    onChange={(e) => setNewShiftForm({ ...newShiftForm, breakStart: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Color Tag Accent
                  </label>
                  <select
                    value={newShiftForm.color}
                    onChange={(e) => setNewShiftForm({ ...newShiftForm, color: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                  >
                    <option value="#0d9488">Teal (#0d9488)</option>
                    <option value="#0284c7">Blue (#0284c7)</option>
                    <option value="#6366f1">Indigo (#6366f1)</option>
                    <option value="#dc2626">Red (#dc2626)</option>
                    <option value="#d97706">Amber (#d97706)</option>
                    <option value="#7c3aed">Purple (#7c3aed)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateShiftModal(false)}
                  style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: 12.5, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#006848', color: '#ffffff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                >
                  Save Shift Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* MODAL 2: CREATE NEW SHIFT GROUP FORM               */}
      {/* ═══════════════════════════════════════════════════ */}
      {showCreateGroupModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 10,
            width: '100%',
            maxWidth: 540,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            <div style={{ background: '#006848', color: '#ffffff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>👥 Create New Shift Group</div>
              <button
                onClick={() => setShowCreateGroupModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Shift Group Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sylhet Region Branch Banking Group"
                  value={newGroupForm.name}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Default Shift Attached <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={newGroupForm.defaultShiftId}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, defaultShiftId: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                >
                  {shifts.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.inTime} – {s.outTime}, Grace: ±{s.gracePeriod}m)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Scope / Branch Coverage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. All Sylhet Branches"
                    value={newGroupForm.scope}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, scope: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Rotation Policy
                  </label>
                  <select
                    value={newGroupForm.rotationCycle}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, rotationCycle: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                  >
                    <option value="Fixed Mon–Fri">Fixed Mon–Fri</option>
                    <option value="Weekly Alternate">Weekly Alternate</option>
                    <option value="3-Shift Rotation (Morning/Evening/Night)">3-Shift Rotation</option>
                    <option value="Rotational (Day/Night 12h Cycle)">Rotational 12h Cycle</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  placeholder="Purpose of this shift group and who belongs in this roster..."
                  value={newGroupForm.description}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: 12.5, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#006848', color: '#ffffff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* MODAL 3: BATCH ASSIGN SELECTED TO GROUP MODAL       */}
      {/* ═══════════════════════════════════════════════════ */}
      {showBatchAssignModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 10,
            width: '100%',
            maxWidth: 520,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            <div style={{ background: '#16a34a', color: '#ffffff', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>⚡ Batch Assign {selectedIds.size} Selected Employees</div>
              <button
                onClick={() => setShowBatchAssignModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '10px 14px', fontSize: 12.5, color: '#166534' }}>
                You are about to assign <strong>{selectedIds.size} selected employees</strong> across Pubali Bank branches into a new Shift Group. All selected employees will inherit the group's default shift timing and grace tolerances.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Select Target Shift Group <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={batchAssignTargetGroupId}
                  onChange={(e) => setBatchAssignTargetGroupId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1.5px solid #16a34a', fontSize: 13, fontWeight: 600 }}
                >
                  {shiftGroups.map(g => {
                    const shf = shiftMap[g.defaultShiftId] || shifts[0];
                    return (
                      <option key={g.id} value={g.id}>
                        {g.name} — {shf.name} ({shf.inTime}–{shf.outTime})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Selected Preview Snippet */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
                  Selected Staff Preview (First 5):
                </label>
                <div style={{ maxHeight: 110, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 6, padding: 6, fontSize: 11 }}>
                  {Array.from(selectedIds).slice(0, 5).map(id => {
                    const emp = employeeRoster.find(e => e.id === id);
                    if (!emp) return null;
                    return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', borderBottom: '1px solid #f1f5f9' }}>
                        <span><strong>{emp.name}</strong> ({emp.id})</span>
                        <span style={{ color: '#64748b' }}>{emp.branch}</span>
                      </div>
                    );
                  })}
                  {selectedIds.size > 5 && (
                    <div style={{ textAlign: 'center', padding: '4px', color: '#94a3b8', fontStyle: 'italic' }}>
                      + {selectedIds.size - 5} more employees selected...
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowBatchAssignModal(false)}
                  style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: 12.5, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBatchGroupAssignment}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Confirm & Batch Assign ({selectedIds.size})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
