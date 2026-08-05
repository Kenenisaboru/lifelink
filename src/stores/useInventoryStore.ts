/**
 * useInventoryStore — Zustand Blood Inventory Store (replaces InventoryContext)
 * Manages blood bank stock levels, critical thresholds, auto-broadcast triggers, and history
 */
import { create } from 'zustand';
import { useRequestStore } from './useRequestStore';
import type { BloodType, StockStatus, StockHistoryDay } from '../types';
import { BLOOD_TYPES } from '../types';

const INITIAL_INVENTORY: Record<BloodType, number> = {
  'A+': 14,
  'A-': 3,
  'B+': 8,
  'B-': 1,
  'O+': 6,
  'O-': 2,
  'AB+': 11,
  'AB-': 0,
};

const LOW_THRESHOLD = 3;
const CRITICAL_THRESHOLD = 1;

interface InventoryState {
  inventory: Record<BloodType, number>;
  bloodTypes: BloodType[];
  autoAlertEnabled: boolean;
  stockHistory: StockHistoryDay[];
  LOW_THRESHOLD: number;
  CRITICAL_THRESHOLD: number;

  // Actions
  updateStock: (bloodType: BloodType, delta: number) => void;
  setAutoAlertEnabled: (enabled: boolean) => void;
  getStatus: (units: number) => StockStatus;

  // Computed / Selectors
  getCriticalTypes: () => BloodType[];
  getLowTypes: () => BloodType[];
}

export const useInventoryStore = create<InventoryState>()((set, get) => ({
  inventory: INITIAL_INVENTORY,
  bloodTypes: BLOOD_TYPES,
  autoAlertEnabled: true,
  LOW_THRESHOLD,
  CRITICAL_THRESHOLD,
  stockHistory: Array.from({ length: 7 }, (_, i) => ({
    day: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
    'O+': Math.floor(Math.random() * 10) + 2,
    'A+': Math.floor(Math.random() * 12) + 3,
    'O-': Math.floor(Math.random() * 4),
  })),

  setAutoAlertEnabled: (enabled) => set({ autoAlertEnabled: enabled }),

  updateStock: (bloodType, delta) => {
    set((state) => {
      const prevVal = state.inventory[bloodType] || 0;
      const newVal = Math.max(0, prevVal + delta);
      const updated = { ...state.inventory, [bloodType]: newVal };

      // Auto-broadcast when stock hits critical threshold
      if (state.autoAlertEnabled && newVal <= CRITICAL_THRESHOLD && prevVal > CRITICAL_THRESHOLD) {
        const suggestedAmount = Math.floor(Math.random() * 400) + 800;
        // Trigger emergency broadcast request
        useRequestStore.getState().createRequest({
          bloodType,
          urgency: 'critical',
          unitsNeeded: 3,
          suggestedAmount,
          notes: `AUTO-ALERT: ${bloodType} blood bank stock critically low (${newVal} units remaining). Immediate donation needed.`,
        });
      }

      return { inventory: updated };
    });
  },

  getStatus: (units) => {
    if (units === 0) return { label: 'OUT OF STOCK', color: '#FF3B5C', type: 'critical' };
    if (units <= CRITICAL_THRESHOLD) return { label: 'CRITICAL', color: '#FF3B5C', type: 'critical' };
    if (units <= LOW_THRESHOLD) return { label: 'LOW', color: '#FFC400', type: 'medium' };
    return { label: 'ADEQUATE', color: '#00E676', type: 'low' };
  },

  getCriticalTypes: () => {
    const inv = get().inventory;
    return BLOOD_TYPES.filter((bt) => inv[bt] <= CRITICAL_THRESHOLD);
  },

  getLowTypes: () => {
    const inv = get().inventory;
    return BLOOD_TYPES.filter((bt) => inv[bt] > CRITICAL_THRESHOLD && inv[bt] <= LOW_THRESHOLD);
  },
}));

// Backward-compatible hook wrapper
export function useInventory() {
  const store = useInventoryStore();
  return {
    ...store,
    criticalTypes: store.getCriticalTypes(),
    lowTypes: store.getLowTypes(),
  };
}
