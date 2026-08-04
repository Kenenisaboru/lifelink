import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export default function DonorDashboardScreen() {
  const { user, logout, toggleAvailability } = useAuth();

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Header Profile Bar */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Blood Donor'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Donor Profile Summary Card */}
      <Card style={styles.profileCard} variant="glow">
        <View style={styles.profileRow}>
          <View style={styles.bloodTypeBadgeContainer}>
            <Text style={styles.bloodTypeLabel}>TYPE</Text>
            <Text style={styles.bloodTypeValue}>{user?.bloodType || 'O+'}</Text>
          </View>
          <View style={styles.profileDetails}>
            <Badge label="VERIFIED DONOR" type="donor" />
            <Text style={styles.locationText}>
              📍 {user?.location?.city || 'Nairobi CBD'}
            </Text>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>
        </View>

        {/* Availability Switch */}
        <View style={styles.availabilityRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.availTitle}>Donor Availability</Text>
            <Text style={styles.availSub}>
              {user?.available ? 'ON — Ready to receive emergency alerts' : 'OFF — Paused'}
            </Text>
          </View>
          <Switch
            value={!!user?.available}
            onValueChange={toggleAvailability}
            trackColor={{ false: COLORS.inputBorder, true: 'rgba(0, 230, 118, 0.4)' }}
            thumbColor={user?.available ? COLORS.accentGreen : COLORS.textMuted}
          />
        </View>
      </Card>

      {/* Emergency Alerts Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Emergency Alerts</Text>
        <Badge label="LIVE SENSORS" type="critical" size="small" />
      </View>

      <Card style={styles.placeholderCard}>
        <Text style={styles.placeholderIcon}>📡</Text>
        <Text style={styles.placeholderTitle}>Monitoring Emergency Requests</Text>
        <Text style={styles.placeholderDesc}>
          Nearby hospital requests matching blood type ({user?.bloodType || 'O+'}) within your radius will appear here instantly.
        </Text>
        <View style={styles.phaseIndicator}>
          <Text style={styles.phaseText}>Phase 1 Complete — Navigated to Donor Dashboard</Text>
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
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  logoutBtn: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  profileCard: {
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bloodTypeBadgeContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bloodTypeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  bloodTypeValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  profileDetails: {
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 6,
  },
  emailText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
  },
  availTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  availSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  placeholderCard: {
    alignItems: 'center',
    padding: 24,
  },
  placeholderIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  placeholderDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  phaseIndicator: {
    marginTop: 16,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accentGreen,
  },
  phaseText: {
    fontSize: 12,
    color: COLORS.accentGreen,
    fontWeight: '600',
  },
});
