/**
 * doorStore.js
 * Centralized Live Door Status & Telemetry Store
 * Synchronizes real-time door actions across DoorStatusPage and Executive Dashboard
 */

// Initial 8 designated warning doors
const INITIAL_WARNING_INDICES = new Set([42, 185, 412, 789, 1150, 1624, 2098, 2560]);

class DoorStore {
  constructor() {
    this.listeners = new Set();
    this.liveOverrides = {};
    this.initialWarningCount = 12;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error(e); }
    });
  }

  getLiveState(doorId) {
    return this.liveOverrides[doorId] || null;
  }

  setLiveState(doorId, stateObj) {
    this.liveOverrides[doorId] = { ...this.liveOverrides[doorId], ...stateObj };
    this.notify();
  }

  getWarningCount() {
    let clearedCount = 0;
    Object.values(this.liveOverrides).forEach(d => {
      if (d.loop === 'Normal') {
        clearedCount++;
      }
    });
    return Math.max(0, this.initialWarningCount - clearedCount);
  }

  getHealthyCount() {
    return 1040 - this.getWarningCount();
  }
}

export const globalDoorStore = new DoorStore();
