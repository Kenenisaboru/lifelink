import React, { createContext, useState, useContext } from 'react';
import { useRequests } from './RequestContext';
import { useAuth } from './AuthContext';

const InventoryContext = createContext();

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const INITIAL_INVENTORY = {
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

export function InventoryProvider({ children }) {
  const { createRequest } = useRequests();
  const { user } = useAuth();

  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [autoAlertEnabled, setAutoAlertEnabled] = useState(true);
  const [stockHistory] = useState(
    Array.from({ length: 7 }, (_, i) => ({
      day: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { weekday: 'short' }),
      'O+': Math.floor(Math.random() * 10) + 2,
      'A+': Math.floor(Math.random() * 12) + 3,
      'O-': Math.floor(Math.random() * 4),
    }))
  );

  const updateStock = (bloodType, delta) => {
    setInventory((prev) => {
      const newVal = Math.max(0, (prev[bloodType] || 0) + delta);
      const updated = { ...prev, [bloodType]: newVal };

      // Auto-broadcast when stock hits critical threshold
      if (autoAlertEnabled && newVal <= CRITICAL_THRESHOLD && (prev[bloodType] || 0) > CRITICAL_THRESHOLD) {
        const suggestedAmount = Math.floor(Math.random() * 400) + 800;
        createRequest({
          bloodType,
          urgency: 'critical',
          unitsNeeded: 3,
          suggestedAmount,
          notes: `AUTO-ALERT: ${bloodType} blood bank stock critically low (${newVal} units remaining). Immediate donation needed.`,
        });
      }

      return updated;
    });
  };

  const getStatus = (units) => {
    if (units === 0) return { label: 'OUT OF STOCK', color: '#FF3B5C', type: 'critical' };
    if (units <= CRITICAL_THRESHOLD) return { label: 'CRITICAL', color: '#FF3B5C', type: 'critical' };
    if (units <= LOW_THRESHOLD) return { label: 'LOW', color: '#FFC400', type: 'medium' };
    return { label: 'ADEQUATE', color: '#00E676', type: 'low' };
  };

  const criticalTypes = BLOOD_TYPES.filter((bt) => inventory[bt] <= CRITICAL_THRESHOLD);
  const lowTypes = BLOOD_TYPES.filter((bt) => inventory[bt] > CRITICAL_THRESHOLD && inventory[bt] <= LOW_THRESHOLD);

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        bloodTypes: BLOOD_TYPES,
        updateStock,
        getStatus,
        stockHistory,
        autoAlertEnabled,
        setAutoAlertEnabled,
        criticalTypes,
        lowTypes,
        LOW_THRESHOLD,
        CRITICAL_THRESHOLD,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
