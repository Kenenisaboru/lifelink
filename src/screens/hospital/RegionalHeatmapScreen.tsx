import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import LeafletMap from '../../components/LeafletMap';
import Badge from '../../components/Badge';
import { COLORS } from '../../theme/colors';
import type { RegionalHeatmapScreenProps } from '../../types/navigation';
import type { MapMarker } from '../../components/LeafletMap';

interface RegionData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  supply: Record<string, number>;
  demand: 'critical' | 'high' | 'medium' | 'low';
}

const NAIROBI_REGIONS: RegionData[] = [
  { id: 'westlands', name: 'Westlands', lat: -1.2637, lng: 36.8022, supply: { 'O+': 18, 'A+': 12, 'O-': 5, 'B+': 8 }, demand: 'high' },
  { id: 'upper_hill', name: 'Upper Hill', lat: -1.2985, lng: 36.8138, supply: { 'O+': 22, 'A+': 8, 'O-': 2, 'B+': 14 }, demand: 'medium' },
  { id: 'eastleigh', name: 'Eastleigh', lat: -1.2780, lng: 36.8510, supply: { 'O+': 3, 'A+': 5, 'O-': 0, 'B+': 2 }, demand: 'critical' },
  { id: 'kibera', name: 'Kibera', lat: -1.3133, lng: 36.7848, supply: { 'O+': 1, 'A+': 2, 'O-': 0, 'B+': 0 }, demand: 'critical' },
  { id: 'karen', name: 'Karen', lat: -1.3276, lng: 36.7073, supply: { 'O+': 15, 'A+': 20, 'O-': 7, 'B+': 10 }, demand: 'low' },
  { id: 'thika_road', name: 'Thika Road', lat: -1.2240, lng: 36.8831, supply: { 'O+': 9, 'A+': 6, 'O-': 3, 'B+': 7 }, demand: 'medium' },
  { id: 'industrial', name: 'Industrial Area', lat: -1.3050, lng: 36.8390, supply: { 'O+': 6, 'A+': 3, 'O-': 1, 'B+': 5 }, demand: 'medium' },
];

const BLOOD_TYPES = ['O+', 'A+', 'O-', 'B+'];

const DEMAND_COLORS: Record<string, string> = {
  critical: '#FF3B5C',
  high: '#FFC400',
  medium: '#00E5FF',
  low: '#00E676',
};

const ANALYTICS = [
  { label: 'Active Requests', value: '7', sub: 'Nairobi Region', icon: '🚨' },
  { label: 'Avg Response Time', value: '14 min', sub: 'Last 24 hours', icon: '⏱️' },
  { label: 'Fulfillment Rate', value: '78%', sub: 'This month', icon: '✅' },
  { label: 'Critical Shortages', value: '3', sub: 'Blood types', icon: '⚠️' },
];

export default function RegionalHeatmapScreen({ navigation }: RegionalHeatmapScreenProps) {
  const [selectedType, setSelectedType] = useState('O+');

  const mapMarkers: MapMarker[] = NAIROBI_REGIONS.map((region) => {
    const supplyForType = region.supply[selectedType] || 0;
    let markerType: 'hospital' | 'donor' = 'donor';
    let emoji = '✅';
    if (region.demand === 'critical') { emoji = '🔴'; markerType = 'hospital'; }
    else if (region.demand === 'high') { emoji = '🟡'; }
    else if (region.demand === 'medium') { emoji = '🔵'; }
    else { emoji = '🟢'; }

    return {
      id: region.id,
      lat: region.lat,
      lng: region.lng,
      type: markerType,
      label: `${region.name}: ${supplyForType} ${selectedType} units`,
      popup: `
        <div class="popup-title">${emoji} ${region.name}</div>
        <div class="popup-sub">${selectedType} Stock: <strong style="color:#00E5FF">${supplyForType} units</strong></div>
        <div class="popup-sub">Demand Level: <strong style="color:${DEMAND_COLORS[region.demand]}">${region.demand.toUpperCase()}</strong></div>
      `,
    };
  });

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Regional Heatmap</Text>
        <Badge label="LIVE" type="critical" size="small" />
      </View>

      <View style={styles.analyticsRow}>
        {ANALYTICS.map((a) => (
          <Card key={a.label} style={styles.analyticsCard}>
            <Text style={styles.analyticsIcon}>{a.icon}</Text>
            <Text style={styles.analyticsValue}>{a.value}</Text>
            <Text style={styles.analyticsLabel}>{a.label}</Text>
            <Text style={styles.analyticsSub}>{a.sub}</Text>
          </Card>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Filter by Blood Type</Text>
      <View style={styles.typeRow}>
        {BLOOD_TYPES.map((bt) => (
          <TouchableOpacity
            key={bt}
            style={[styles.typeBtn, selectedType === bt && styles.typeBtnActive]}
            onPress={() => setSelectedType(bt)}
          >
            <Text style={[styles.typeBtnText, selectedType === bt && styles.typeBtnTextActive]}>{bt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <LeafletMap
        center={{ lat: -1.286389, lng: 36.817223 }}
        zoom={12}
        markers={mapMarkers}
        height={360}
        style={styles.mapContainer}
      />

      <View style={styles.legendRow}>
        {Object.entries(DEMAND_COLORS).map(([level, color]) => (
          <View key={level} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
        {selectedType} Supply by Region
      </Text>
      {NAIROBI_REGIONS.slice()
        .sort((a, b) => (a.supply[selectedType] || 0) - (b.supply[selectedType] || 0))
        .map((region) => {
          const units = region.supply[selectedType] || 0;
          return (
            <Card key={region.id} style={styles.regionCard}>
              <View style={styles.regionRow}>
                <View style={[styles.demandDot, { backgroundColor: DEMAND_COLORS[region.demand] }]} />
                <Text style={styles.regionName}>{region.name}</Text>
                <View style={styles.regionBar}>
                  <View
                    style={[
                      styles.regionBarFill,
                      { width: `${Math.min(100, (units / 25) * 100)}%`, backgroundColor: DEMAND_COLORS[region.demand] },
                    ]}
                  />
                </View>
                <Text style={[styles.regionUnits, { color: DEMAND_COLORS[region.demand] }]}>
                  {units} u
                </Text>
              </View>
            </Card>
          );
        })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 16 },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: COLORS.surfaceLight, borderRadius: 8 },
  backText: { color: COLORS.secondary, fontWeight: '700', fontSize: 13 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  analyticsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  analyticsCard: { width: '47%', margin: '1.5%', alignItems: 'center', paddingVertical: 12 },
  analyticsIcon: { fontSize: 22, marginBottom: 4 },
  analyticsValue: { fontSize: 22, fontWeight: '900', color: COLORS.secondary },
  analyticsLabel: { fontSize: 11, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  analyticsSub: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  typeRow: { flexDirection: 'row', marginBottom: 12 },
  typeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  typeBtnActive: { backgroundColor: COLORS.primaryGlow, borderColor: COLORS.primary },
  typeBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  typeBtnTextActive: { color: COLORS.primary },
  mapContainer: { marginBottom: 12 },
  legendRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  legendText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  regionCard: { marginVertical: 3, padding: 10 },
  regionRow: { flexDirection: 'row', alignItems: 'center' },
  demandDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  regionName: { width: 100, fontSize: 12, fontWeight: '700', color: COLORS.text },
  regionBar: { flex: 1, height: 8, backgroundColor: COLORS.inputBg, borderRadius: 4, overflow: 'hidden', marginHorizontal: 8 },
  regionBarFill: { height: '100%', borderRadius: 4 },
  regionUnits: { fontSize: 12, fontWeight: '800', minWidth: 30, textAlign: 'right' },
});
