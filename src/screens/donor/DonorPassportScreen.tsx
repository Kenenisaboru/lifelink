import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { COLORS } from '../../theme/colors';
import { useAuthStore } from '../../stores/useAuthStore';
import { useGamification } from '../../stores/useGamificationStore';
import type { DonorPassportScreenProps } from '../../types/navigation';
import type { DonorUser } from '../../types';

export default function DonorPassportScreen({ navigation }: DonorPassportScreenProps) {
  const { user } = useAuthStore();
  const {
    donationCount, donationHistory, tier, donorScore,
    isEligible, daysUntilEligible, eligibilityProgress, earnedBadges,
  } = useGamification();

  const donorUser = user as DonorUser | null;

  const qrData = JSON.stringify({
    donorId: user?.uid,
    name: user?.name,
    bloodType: donorUser?.bloodType || 'O+',
    verified: true,
    donations: donationCount,
    tier: tier.name,
  });

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donor Passport</Text>
        <Badge label={tier.name.toUpperCase()} type="donor" size="small" />
      </View>

      <Card style={styles.qrCard} variant="glow">
        <View style={styles.qrHeader}>
          <Text style={styles.passportLabel}>LIFELINK VERIFIED DONOR CARD</Text>
          <Text style={styles.tierEmoji}>{tier.emoji}</Text>
        </View>

        <View style={styles.qrCenter}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={qrData}
              size={160}
              backgroundColor="transparent"
              color={COLORS.text}
            />
          </View>
        </View>

        <View style={styles.qrInfo}>
          <Text style={styles.donorName}>{user?.name || 'Blood Donor'}</Text>
          <View style={styles.bloodRow}>
            <View style={styles.bloodTypeBig}>
              <Text style={styles.bloodLabel}>TYPE</Text>
              <Text style={styles.bloodValue}>{donorUser?.bloodType || 'O+'}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{donationCount}</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{donorScore}</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statValue}>{earnedBadges.length}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </View>
        </View>
      </Card>

      <Card style={styles.eligibilityCard}>
        <Text style={styles.sectionTitle}>Donation Eligibility</Text>
        <View style={styles.eligRow}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${eligibilityProgress * 100}%`,
                  backgroundColor: isEligible ? COLORS.accentGreen : COLORS.accentYellow,
                },
              ]}
            />
          </View>
          <Text style={[styles.eligText, { color: isEligible ? COLORS.accentGreen : COLORS.accentYellow }]}>
            {isEligible ? '✓ Eligible Now!' : `${daysUntilEligible} Days Left`}
          </Text>
        </View>
        <Text style={styles.eligSub}>
          {isEligible
            ? 'You can safely donate whole blood again today.'
            : `Next eligible date: ${new Date(Date.now() + daysUntilEligible * 86400000).toLocaleDateString()}`}
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>Earned Badges ({earnedBadges.length})</Text>
      <View style={styles.badgesGrid}>
        {earnedBadges.map((badge) => (
          <View key={badge.id} style={styles.badgeItem}>
            <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
            <Text style={styles.badgeName}>{badge.name}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
        Donation History ({donationHistory.length})
      </Text>
      {donationHistory.map((don) => (
        <Card key={don.id} style={styles.historyCard}>
          <View style={styles.historyRow}>
            <View>
              <Text style={styles.historyDate}>{don.date}</Text>
              <Text style={styles.historyHospital}>{don.hospital}</Text>
              <Text style={styles.historyTrx}>{don.transactionId}</Text>
            </View>
            <View style={styles.historyRight}>
              <Badge label={don.bloodType} type="donor" size="small" />
              <Text style={styles.historyUnits}>{don.units} Unit</Text>
            </View>
          </View>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 16 },
  topHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  backBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: COLORS.surfaceLight, borderRadius: 8 },
  backText: { color: COLORS.secondary, fontWeight: '700', fontSize: 13 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  qrCard: { alignItems: 'center', padding: 20, marginBottom: 16 },
  qrHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 14 },
  passportLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  tierEmoji: { fontSize: 24 },
  qrCenter: { marginVertical: 12 },
  qrWrapper: { padding: 12, backgroundColor: COLORS.surfaceLight, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  qrInfo: { width: '100%', marginTop: 10 },
  donorName: { fontSize: 20, fontWeight: '900', color: COLORS.text, textAlign: 'center' },
  bloodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  bloodTypeBig: { width: 52, height: 52, borderRadius: 14, backgroundColor: COLORS.primaryGlow, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  bloodLabel: { fontSize: 8, fontWeight: '800', color: COLORS.primary },
  bloodValue: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  statCol: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  eligibilityCard: { marginBottom: 16, padding: 16 },
  eligRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: COLORS.surfaceLight, borderRadius: 4, overflow: 'hidden', marginRight: 10 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  eligText: { fontSize: 14, fontWeight: '800', minWidth: 90, textAlign: 'right' },
  eligSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  badgeItem: { width: '30%', margin: '1.5%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  badgeEmoji: { fontSize: 28, marginBottom: 4 },
  badgeName: { fontSize: 11, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  historyCard: { marginVertical: 4, padding: 12 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyDate: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  historyHospital: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  historyTrx: { fontSize: 11, color: COLORS.accentYellow, fontWeight: '600', marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  historyUnits: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', marginTop: 4 },
});
