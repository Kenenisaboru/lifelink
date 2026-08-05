import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import Badge from './Badge';
import Button from './Button';
import { COLORS } from '../theme/colors';
import type { BloodRequest } from '../types';

export interface AlertCardProps {
  request: BloodRequest;
  distanceKm?: number | null;
  onRespond: (request: BloodRequest, distanceKm?: number | null) => void;
  responded?: boolean;
}

export default function AlertCard({ request, distanceKm, onRespond, responded = false }: AlertCardProps) {
  if (!request) return null;

  const isCritical = request.urgency === 'critical';

  return (
    <Card style={styles.card} variant={isCritical ? 'glow' : 'default'}>
      {/* Alert Header */}
      <View style={styles.headerRow}>
        <View style={styles.urgencyBadgeGroup}>
          <Badge label={`EMERGENCY — ${request.urgency.toUpperCase()}`} type={request.urgency} size="small" />
          {distanceKm !== null && distanceKm !== undefined && (
            <Text style={styles.distanceTag}>📍 ~{distanceKm} km away</Text>
          )}
        </View>
        <Text style={styles.unitsText}>{request.unitsNeeded} Units Needed</Text>
      </View>

      {/* Main Request Info */}
      <View style={styles.infoRow}>
        <View style={styles.bloodBox}>
          <Text style={styles.bloodLabel}>NEED</Text>
          <Text style={styles.bloodType}>{request.bloodType}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.hospitalName}>{request.hospitalName}</Text>
          <Text style={styles.locationCity}>📍 {request.location?.city || 'Nearby Medical Center'}</Text>
          <Text style={styles.suggestedFeeText}>
            Transport Assistance Suggested: <Text style={styles.feeHighlight}>KSh {request.suggestedAmount}</Text>
          </Text>
        </View>
      </View>

      {request.notes ? (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>"{request.notes}"</Text>
        </View>
      ) : null}

      {/* Action Button */}
      {responded ? (
        <View style={styles.respondedBox}>
          <Text style={styles.respondedText}>✓ You Responded — Transport Confirmed</Text>
        </View>
      ) : (
        <Button
          title="🚨 I'm Available — Respond Now"
          variant="primary"
          onPress={() => onRespond(request, distanceKm)}
          style={styles.respondBtn}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  urgencyBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceTag: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    marginLeft: 8,
  },
  unitsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bloodBox: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bloodLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  bloodType: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  hospitalName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  locationCity: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  suggestedFeeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  feeHighlight: {
    color: COLORS.accentGreen,
    fontWeight: '700',
  },
  notesContainer: {
    backgroundColor: COLORS.surfaceLight,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  notesText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
  respondBtn: {
    marginTop: 14,
  },
  respondedBox: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderColor: COLORS.accentGreen,
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  respondedText: {
    color: COLORS.accentGreen,
    fontWeight: '700',
    fontSize: 13,
  },
});
