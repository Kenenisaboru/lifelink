import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';

export default function HospitalDashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { requests, getActiveRequests, getFulfilledRequests } = useRequests();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'fulfilled'

  const activeRequests = getActiveRequests();
  const fulfilledRequests = getFulfilledRequests();
  const displayRequests = activeTab === 'active' ? activeRequests : fulfilledRequests;

  const totalResponsesCount = requests.reduce(
    (acc, req) => acc + (req.responses ? req.responses.length : 0),
    0
  );

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Top Bar Header */}
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

      {/* Hospital Stats Overview */}
      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: COLORS.primary }]}>
              {activeRequests.length}
            </Text>
            <Text style={styles.statLabel}>Active Emergency</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <Text style={[styles.statNum, { color: COLORS.secondary }]}>
              {totalResponsesCount}
            </Text>
            <Text style={styles.statLabel}>Responded Donors</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: COLORS.accentGreen }]}>
              {fulfilledRequests.length}
            </Text>
            <Text style={styles.statLabel}>Fulfilled</Text>
          </View>
        </View>
      </Card>

      {/* Quick Tool Navigation Row */}
      <View style={styles.quickNavRow}>
        <TouchableOpacity style={styles.quickNavCard} onPress={() => navigation.navigate('BloodInventory')}>
          <Text style={styles.quickNavEmoji}>🩸</Text>
          <Text style={styles.quickNavTitle}>Inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickNavCard} onPress={() => navigation.navigate('RegionalHeatmap')}>
          <Text style={styles.quickNavEmoji}>📊</Text>
          <Text style={styles.quickNavTitle}>Heatmap</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickNavCard} onPress={() => navigation.navigate('QRCheckIn')}>
          <Text style={styles.quickNavEmoji}>📷</Text>
          <Text style={styles.quickNavTitle}>QR Check-In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickNavCard} onPress={() => navigation.navigate('LiveMap')}>
          <Text style={styles.quickNavEmoji}>🗺️</Text>
          <Text style={styles.quickNavTitle}>Live Map</Text>
        </TouchableOpacity>
      </View>

      {/* Action CTA: Create Request */}
      <Button
        title="🚨 Broadcast New Emergency Request"
        variant="primary"
        onPress={() => navigation.navigate('CreateRequest')}
        style={styles.createBtn}
      />

      {/* Tabs Filter */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active Requests ({activeRequests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'fulfilled' && styles.activeTab]}
          onPress={() => setActiveTab('fulfilled')}
        >
          <Text style={[styles.tabText, activeTab === 'fulfilled' && styles.activeTabText]}>
            Fulfilled ({fulfilledRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Requests List */}
      {displayRequests.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>
            No {activeTab === 'active' ? 'Active' : 'Fulfilled'} Emergency Requests
          </Text>
          <Text style={styles.emptySub}>
            {activeTab === 'active'
              ? 'Tap the red button above to broadcast a new blood request to nearby donors.'
              : 'Requests marked as fulfilled will be archived here.'}
          </Text>
        </Card>
      ) : (
        displayRequests.map((item) => {
          const respCount = item.responses ? item.responses.length : 0;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ResponseTracker', { requestId: item.id })}
            >
              <Card
                style={styles.requestCard}
                variant={item.urgency === 'critical' && item.status === 'open' ? 'glow' : 'default'}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.bloodTypeBox}>
                    <Text style={styles.bloodTypeLabel}>TYPE</Text>
                    <Text style={styles.bloodTypeValue}>{item.bloodType}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.badgeLine}>
                      <Badge label={item.urgency.toUpperCase()} type={item.urgency} size="small" />
                      <Text style={styles.timeAgoText}>
                        {getTimeAgo(item.createdAt)}
                      </Text>
                    </View>
                    <Text style={styles.reqTitle}>{item.unitsNeeded} Units Required</Text>
                    <Text style={styles.reqLoc}>📍 {item.location?.city || 'Nairobi'}</Text>
                  </View>

                  <Text style={styles.arrowIcon}>→</Text>
                </View>

                <View style={styles.cardFooterRow}>
                  <View style={styles.responsePill}>
                    <Text style={styles.responseCountText}>
                      🙋‍♂️ {respCount} Donor{respCount !== 1 ? 's' : ''} Responded
                    </Text>
                  </View>
                  <Text style={styles.feeText}>Fee: KSh {item.suggestedAmount}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })
      )}
    </ScreenContainer>
  );
}

function getTimeAgo(isoString) {
  if (!isoString) return 'Just now';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
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
  statsCard: {
    marginBottom: 14,
    padding: 12,
  },
  statsRow: {
    flexDirection: 'row',
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
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
  createBtn: {
    marginBottom: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 34,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  requestCard: {
    marginVertical: 6,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bloodTypeBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bloodTypeLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bloodTypeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  badgeLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAgoText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 8,
  },
  reqTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  reqLoc: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 20,
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  responsePill: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  responseCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentGreen,
  },
  feeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  quickNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  quickNavCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickNavEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickNavTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
  },
});
