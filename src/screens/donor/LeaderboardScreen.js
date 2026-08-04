import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useGamification, BADGES, HEALTH_PERKS } from '../../context/GamificationContext';

export default function LeaderboardScreen({ navigation }) {
  const { user } = useAuth();
  const { leaderboard, earnedBadges, allBadges, healthPerks, donorScore, tier, donationCount } = useGamification();

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard & Perks</Text>
        <Badge label={tier.name.toUpperCase()} type="donor" size="small" />
      </View>

      {/* Your Rank Summary */}
      <Card style={styles.myRankCard} variant="glow">
        <Text style={styles.myRankTitle}>Your Ranking</Text>
        <View style={styles.myRankRow}>
          <View style={styles.rankCircle}>
            <Text style={styles.rankNum}>#3</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.myName}>{user?.name || 'Donor'}</Text>
            <Text style={styles.mySub}>{tier.emoji} {tier.name} Tier • {donationCount} Donations</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.scoreVal}>{donorScore}</Text>
            <Text style={styles.scoreLabel}>Points</Text>
          </View>
        </View>
      </Card>

      {/* Community Leaderboard */}
      <Text style={styles.sectionTitle}>🏆 Community Leaderboard</Text>
      {leaderboard.map((entry) => (
        <Card key={entry.rank} style={[styles.leaderCard, entry.rank <= 3 && styles.topThreeCard]}>
          <View style={styles.leaderRow}>
            <View style={[styles.rankBadge, entry.rank === 1 && styles.rank1, entry.rank === 2 && styles.rank2, entry.rank === 3 && styles.rank3]}>
              <Text style={styles.rankBadgeText}>
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.entryName}>{entry.name}</Text>
              <Text style={styles.entrySub}>{entry.bloodType} • {entry.donations} donations • {entry.badges} badges</Text>
            </View>
            <Text style={styles.entryScore}>{entry.score}</Text>
          </View>
        </Card>
      ))}

      {/* Hero Badges Unlock Grid */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>🏅 Hero Badges</Text>
      <View style={styles.badgesGrid}>
        {allBadges.map((badge) => {
          const isEarned = earnedBadges.some((b) => b.id === badge.id);
          return (
            <View key={badge.id} style={[styles.badgeCard, !isEarned && styles.lockedBadge]}>
              <Text style={[styles.badgeEmoji, !isEarned && { opacity: 0.3 }]}>{badge.emoji}</Text>
              <Text style={[styles.badgeName, !isEarned && { color: COLORS.textMuted }]}>{badge.name}</Text>
              <Text style={styles.badgeDesc}>{isEarned ? '✓ Unlocked' : badge.desc}</Text>
            </View>
          );
        })}
      </View>

      {/* Health Perks & Vouchers */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>🎁 Health Perks & Vouchers</Text>
      {healthPerks.map((perk) => {
        const isAvailable = perk.status === 'available';
        return (
          <Card key={perk.id} style={[styles.perkCard, !isAvailable && styles.lockedPerk]}>
            <View style={styles.perkRow}>
              <Text style={styles.perkEmoji}>{perk.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.perkName, !isAvailable && { color: COLORS.textMuted }]}>{perk.name}</Text>
                <Text style={styles.perkDesc}>{perk.desc}</Text>
              </View>
              {isAvailable ? (
                <TouchableOpacity style={styles.redeemBtn}>
                  <Text style={styles.redeemText}>Redeem</Text>
                </TouchableOpacity>
              ) : (
                <Badge label={`${perk.tier.toUpperCase()} TIER`} type="primary" size="small" />
              )}
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
  myRankCard: { marginBottom: 16 },
  myRankTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  myRankRow: { flexDirection: 'row', alignItems: 'center' },
  rankCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryGlow, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rankNum: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  myName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  mySub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  scoreVal: { fontSize: 20, fontWeight: '900', color: COLORS.accentGreen },
  scoreLabel: { fontSize: 10, color: COLORS.textMuted },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  leaderCard: { marginVertical: 3, padding: 12 },
  topThreeCard: { borderColor: COLORS.accentYellow, borderWidth: 1 },
  leaderRow: { flexDirection: 'row', alignItems: 'center' },
  rankBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  rank1: { backgroundColor: 'rgba(255, 196, 0, 0.2)' },
  rank2: { backgroundColor: 'rgba(148, 163, 184, 0.2)' },
  rank3: { backgroundColor: 'rgba(205, 127, 50, 0.2)' },
  rankBadgeText: { fontSize: 14, fontWeight: '800' },
  entryName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  entrySub: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  entryScore: { fontSize: 16, fontWeight: '800', color: COLORS.secondary },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  badgeCard: { width: '30%', margin: '1.5%', backgroundColor: COLORS.surface, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  lockedBadge: { borderColor: COLORS.inputBorder, backgroundColor: COLORS.inputBg },
  badgeEmoji: { fontSize: 26, marginBottom: 4 },
  badgeName: { fontSize: 11, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  badgeDesc: { fontSize: 9, color: COLORS.textMuted, textAlign: 'center', marginTop: 2 },
  perkCard: { marginVertical: 4, padding: 14 },
  lockedPerk: { opacity: 0.6 },
  perkRow: { flexDirection: 'row', alignItems: 'center' },
  perkEmoji: { fontSize: 28, marginRight: 12 },
  perkName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  perkDesc: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  redeemBtn: { backgroundColor: COLORS.accentGreen, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  redeemText: { fontSize: 12, fontWeight: '700', color: '#0B0F17' },
});
