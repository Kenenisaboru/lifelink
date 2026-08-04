import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { COLORS } from '../../theme/colors';
import { useInventory } from '../../context/InventoryContext';

export default function BloodInventoryScreen({ navigation }) {
  const {
    inventory, bloodTypes, updateStock, getStatus,
    autoAlertEnabled, setAutoAlertEnabled, criticalTypes, lowTypes,
    stockHistory, LOW_THRESHOLD, CRITICAL_THRESHOLD,
  } = useInventory();

  const maxUnits = 20;

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blood Bank Inventory</Text>
        <Badge label="LIVE" type="critical" size="small" />
      </View>

      {/* Alert Summary */}
      {(criticalTypes.length > 0 || lowTypes.length > 0) && (
        <Card style={styles.alertBanner} variant="glow">
          <Text style={styles.alertTitle}>⚠️ Inventory Alerts</Text>
          {criticalTypes.length > 0 && (
            <Text style={styles.alertCritical}>
              🔴 CRITICAL: {criticalTypes.join(', ')} — Immediate restocking needed
            </Text>
          )}
          {lowTypes.length > 0 && (
            <Text style={styles.alertLow}>
              🟡 LOW: {lowTypes.join(', ')} — Restock soon
            </Text>
          )}
        </Card>
      )}

      {/* Auto-Alert Toggle */}
      <Card style={styles.autoCard}>
        <View style={styles.autoRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.autoTitle}>⚡ Auto-Broadcast Emergency Alert</Text>
            <Text style={styles.autoSub}>
              Automatically create emergency request when stock drops to {CRITICAL_THRESHOLD} unit or below
            </Text>
          </View>
          <Switch
            value={autoAlertEnabled}
            onValueChange={setAutoAlertEnabled}
            trackColor={{ false: COLORS.inputBorder, true: 'rgba(255, 59, 92, 0.4)' }}
            thumbColor={autoAlertEnabled ? COLORS.primary : COLORS.textMuted}
          />
        </View>
      </Card>

      {/* Blood Type Stock Grid */}
      <Text style={styles.sectionTitle}>Stock Levels (All Blood Types)</Text>
      {bloodTypes.map((bt) => {
        const units = inventory[bt] || 0;
        const status = getStatus(units);
        const fillPct = Math.min(1, units / maxUnits);

        return (
          <Card key={bt} style={styles.stockCard}>
            <View style={styles.stockRow}>
              {/* Blood Type Label */}
              <View style={styles.btLabel}>
                <Text style={styles.btText}>{bt}</Text>
              </View>

              {/* Bar + Status */}
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${fillPct * 100}%`, backgroundColor: status.color },
                    ]}
                  />
                  {/* Low & Critical threshold markers */}
                  <View style={[styles.thresholdLine, { left: `${(CRITICAL_THRESHOLD / maxUnits) * 100}%` }]} />
                  <View style={[styles.thresholdLine, styles.lowLine, { left: `${(LOW_THRESHOLD / maxUnits) * 100}%` }]} />
                </View>
                <View style={styles.barLabels}>
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                  <Text style={styles.unitsText}>{units} / {maxUnits} units</Text>
                </View>
              </View>

              {/* +/- Controls */}
              <View style={styles.controlBtns}>
                <TouchableOpacity style={styles.ctrlBtn} onPress={() => updateStock(bt, -1)}>
                  <Text style={styles.ctrlBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.ctrlBtn, styles.addBtn]} onPress={() => updateStock(bt, 1)}>
                  <Text style={[styles.ctrlBtnText, { color: COLORS.accentGreen }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        );
      })}

      {/* Quick Restock Buttons */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Quick Restock</Text>
      <View style={styles.quickRow}>
        {criticalTypes.slice(0, 3).map((bt) => (
          <TouchableOpacity key={bt} style={styles.quickBtn} onPress={() => updateStock(bt, 5)}>
            <Text style={styles.quickBtnText}>+5 {bt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 7-Day History Mini-Chart */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>7-Day O+ Stock History</Text>
      <Card style={styles.chartCard}>
        <View style={styles.miniChart}>
          {stockHistory.map((day, idx) => {
            const h = Math.min(80, (day['O+'] / 15) * 80);
            return (
              <View key={idx} style={styles.chartCol}>
                <View style={[styles.chartBar, { height: h, backgroundColor: day['O+'] <= 3 ? COLORS.primary : COLORS.secondary }]} />
                <Text style={styles.chartDayLabel}>{day.day}</Text>
              </View>
            );
          })}
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 16 },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: COLORS.surfaceLight, borderRadius: 8 },
  backText: { color: COLORS.secondary, fontWeight: '700', fontSize: 13 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  alertBanner: { marginBottom: 12, padding: 14 },
  alertTitle: { fontSize: 14, fontWeight: '800', color: COLORS.accentYellow, marginBottom: 6 },
  alertCritical: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginBottom: 2 },
  alertLow: { fontSize: 12, color: COLORS.accentYellow, fontWeight: '600' },
  autoCard: { marginBottom: 16, padding: 14 },
  autoRow: { flexDirection: 'row', alignItems: 'center' },
  autoTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  autoSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, lineHeight: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  stockCard: { marginVertical: 4, padding: 12 },
  stockRow: { flexDirection: 'row', alignItems: 'center' },
  btLabel: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.primaryGlow, borderWidth: 1.5, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  btText: { fontSize: 14, fontWeight: '900', color: COLORS.primary },
  barBg: { height: 12, backgroundColor: COLORS.inputBg, borderRadius: 6, overflow: 'hidden', position: 'relative' },
  barFill: { height: '100%', borderRadius: 6 },
  thresholdLine: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(255, 59, 92, 0.6)' },
  lowLine: { backgroundColor: 'rgba(255, 196, 0, 0.6)' },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  statusText: { fontSize: 10, fontWeight: '800' },
  unitsText: { fontSize: 10, color: COLORS.textMuted },
  controlBtns: { flexDirection: 'row' },
  ctrlBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center', marginLeft: 4, borderWidth: 1, borderColor: COLORS.border },
  addBtn: { borderColor: COLORS.accentGreen },
  ctrlBtnText: { fontSize: 18, fontWeight: '700', color: COLORS.primary, lineHeight: 22 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap' },
  quickBtn: { backgroundColor: 'rgba(0, 230, 118, 0.15)', borderWidth: 1, borderColor: COLORS.accentGreen, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginRight: 8, marginBottom: 8 },
  quickBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.accentGreen },
  chartCard: { padding: 16 },
  miniChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 90 },
  chartCol: { alignItems: 'center', flex: 1 },
  chartBar: { width: 22, borderRadius: 4, minHeight: 4 },
  chartDayLabel: { fontSize: 9, color: COLORS.textMuted, marginTop: 4 },
});
