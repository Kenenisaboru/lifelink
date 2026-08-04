import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export default function HospitalDashboardScreen() {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Top Bar */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Hospital Portal</Text>
          <Text style={styles.hospitalName} numberOfLines={1}>
            {user?.hospitalName || 'Nairobi Emergency Hospital'}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Hospital Profile Card */}
      <Card style={styles.profileCard}>
        <View style={styles.cardHeaderRow}>
          <Badge label="VERIFIED MEDICAL FACILITY" type="hospital" />
          <Text style={styles.contactName}>Dr. {user?.name || 'Admin'}</Text>
        </View>
        <Text style={styles.locationText}>
          📍 {user?.location?.city || 'Upper Hill, Nairobi'}
        </Text>
        <Text style={styles.emailText}>{user?.email}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Active Alerts</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Responded Donors</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: COLORS.accentGreen }]}>0</Text>
            <Text style={styles.statLabel}>Fulfilled</Text>
          </View>
        </View>
      </Card>

      {/* Create Request CTA */}
      <View style={styles.actionHeader}>
        <Text style={styles.actionTitle}>Broadcast Emergency Request</Text>
      </View>

      <Card style={styles.createCard} variant="glow">
        <Text style={styles.createIcon}>🚨</Text>
        <Text style={styles.createTitle}>Post Emergency Blood Request</Text>
        <Text style={styles.createDesc}>
          Specify required blood type (e.g. O+, A-, AB+), urgency level, and auto-calculate donor transport assistance.
        </Text>

        <Button
          title="+ Create New Emergency Request"
          variant="secondary"
          onPress={() => alert('Phase 2 will unlock full request creation modal & live response tracking!')}
          style={styles.createBtn}
        />
        <View style={styles.phaseIndicator}>
          <Text style={styles.phaseText}>Phase 1 Complete — Navigated to Hospital Portal</Text>
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: 10,
  },
  logoutText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  profileCard: {
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  actionHeader: {
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  createCard: {
    alignItems: 'center',
    padding: 22,
  },
  createIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  createTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  createDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  createBtn: {
    width: '100%',
  },
  phaseIndicator: {
    marginTop: 14,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  phaseText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
  },
});
