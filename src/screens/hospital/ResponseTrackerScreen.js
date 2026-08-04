import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { COLORS } from '../../theme/colors';
import { useRequests } from '../../context/RequestContext';

export default function ResponseTrackerScreen({ route, navigation }) {
  const { requestId } = route.params || {};
  const { getRequestById, markFulfilled, loading } = useRequests();

  const request = getRequestById(requestId);

  if (!request) {
    return (
      <ScreenContainer contentContainerStyle={styles.container}>
        <Text style={{ color: COLORS.text, fontSize: 16 }}>Request not found.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  const isFulfilled = request.status === 'fulfilled';
  const responses = request.responses || [];

  const handleMarkFulfilled = async () => {
    await markFulfilled(request.id);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Response Tracker</Text>
        <Badge
          label={request.status.toUpperCase()}
          type={isFulfilled ? 'low' : request.urgency}
          size="small"
        />
      </View>

      {/* Emergency Request Overview */}
      <Card style={styles.overviewCard} variant={isFulfilled ? 'default' : 'glow'}>
        <View style={styles.requestMainRow}>
          <View style={styles.bloodTypeBadge}>
            <Text style={styles.bloodLabel}>TYPE</Text>
            <Text style={styles.bloodVal}>{request.bloodType}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <Badge label={request.urgency.toUpperCase()} type={request.urgency} size="small" />
              <Text style={styles.unitsText}>{request.unitsNeeded} Units Needed</Text>
            </View>
            <Text style={styles.hospName}>{request.hospitalName}</Text>
            <Text style={styles.locText}>📍 {request.location?.city || 'Nairobi'}</Text>
          </View>
        </View>

        {request.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>"{request.notes}"</Text>
          </View>
        ) : null}

        {/* Live Responder Counter Bar */}
        <View style={styles.responseCountBanner}>
          <Text style={styles.countNumber}>{responses.length}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.countTitle}>
              {responses.length === 0
                ? 'Waiting for nearby donors...'
                : `${responses.length} Donor${responses.length > 1 ? 's' : ''} En Route`}
            </Text>
            <Text style={styles.countSub}>
              {isFulfilled ? 'Request complete' : 'Alert active in radius'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Responded Donors List */}
      <Text style={styles.sectionTitle}>
        Responded Donors ({responses.length})
      </Text>

      {responses.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>⏳</Text>
          <Text style={styles.emptyTitle}>No Donor Responses Yet</Text>
          <Text style={styles.emptySub}>
            Compatible nearby donors receive live alerts and pay transport via Telebirr, M-Pesa, or CBE Birr. Responded donors will appear here instantly.
          </Text>
        </Card>
      ) : (
        responses.map((resp, idx) => (
          <Card key={idx} style={styles.donorCard}>
            <View style={styles.donorHeader}>
              <View style={styles.donorAvatar}>
                <Text style={styles.avatarText}>🙋‍♂️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.donorName}>{resp.donorName || 'Anonymous Donor'}</Text>
                <Text style={styles.trxId}>{resp.transactionId}</Text>
              </View>
              <Badge label={resp.bloodType} type="donor" size="small" />
            </View>

            <View style={styles.donorFooter}>
              <View style={styles.gatewayTag}>
                <Text style={styles.gatewayTagText}>
                  💳 {resp.paymentMethod || 'Mobile Payment'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.paidLabel}>Transport Fee Paid</Text>
                <Text style={styles.paidAmount}>KSh / Birr {resp.amountPaid}</Text>
              </View>
            </View>
          </Card>
        ))
      )}

      {/* Fulfillment CTA */}
      {!isFulfilled ? (
        <Button
          title="✓ Mark Request as Fulfilled"
          variant="secondary"
          loading={loading}
          onPress={handleMarkFulfilled}
          style={styles.fulfillBtn}
        />
      ) : (
        <View style={styles.fulfilledBanner}>
          <Text style={styles.fulfilledText}>✓ Emergency Request Fulfilled</Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
  },
  backText: {
    color: COLORS.secondary,
    fontWeight: '700',
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  overviewCard: {
    marginBottom: 20,
  },
  requestMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bloodTypeBadge: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: COLORS.primaryGlow,
    borderColor: COLORS.primary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  bloodLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bloodVal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontWeight: '600',
  },
  hospName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  locText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  notesBox: {
    backgroundColor: COLORS.surfaceLight,
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  notesText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
  responseCountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.accentGreen,
  },
  countTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  countSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 32,
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
  donorCard: {
    marginVertical: 6,
    padding: 14,
  },
  donorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  donorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
  },
  donorName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  trxId: {
    fontSize: 11,
    color: COLORS.accentYellow,
    marginTop: 2,
    fontWeight: '600',
  },
  donorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  gatewayTag: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gatewayTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  paidLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  paidAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.accentGreen,
  },
  fulfillBtn: {
    marginTop: 20,
    marginBottom: 30,
  },
  fulfilledBanner: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.accentGreen,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  fulfilledText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.accentGreen,
  },
});
