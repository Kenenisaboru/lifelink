import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import LeafletMap from '../../components/LeafletMap';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { COLORS } from '../../theme/colors';
import { useRequests } from '../../context/RequestContext';
import { useAuth } from '../../context/AuthContext';
import { calculateHaversineDistance } from '../../utils/distance';
import { calculateETA, formatDistance } from '../../utils/eta';

export default function LiveMapScreen({ navigation }) {
  const { user } = useAuth();
  const { requests } = useRequests();

  const userLoc = user?.location || { lat: -1.286389, lng: 36.817223 };
  const isHospital = user?.role === 'hospital';

  // Build map markers from active requests and donor position
  const { markers, routeFrom, routeTo, etaText, nearestRequest } = useMemo(() => {
    const openRequests = requests.filter((r) => r.status === 'open');

    const mapMarkers = [];

    // Hospital pins
    openRequests.forEach((req) => {
      const dist = calculateHaversineDistance(userLoc.lat, userLoc.lng, req.location.lat, req.location.lng);
      const eta = calculateETA(dist);
      const respCount = req.responses?.length || 0;

      mapMarkers.push({
        id: req.id,
        lat: req.location.lat,
        lng: req.location.lng,
        type: 'hospital',
        label: `${req.bloodType} ${req.urgency.toUpperCase()}`,
        popup: `
          <div class="popup-title">🏥 ${req.hospitalName}</div>
          <div class="popup-sub">📍 ${req.location?.city || 'Nairobi'}</div>
          <div class="popup-badge">${req.bloodType} — ${req.urgency.toUpperCase()}</div>
          <div class="popup-sub">${req.unitsNeeded} Units • ${respCount} Donors Responded</div>
          <div class="popup-sub">📏 ${formatDistance(dist)} • 🕐 ${eta.formatted}</div>
        `,
      });
    });

    // Current user marker (donor or hospital self)
    mapMarkers.push({
      id: 'self',
      lat: userLoc.lat,
      lng: userLoc.lng,
      type: isHospital ? 'hospital' : 'donor',
      label: isHospital ? 'Your Hospital' : 'Your Location',
      popup: `<div class="popup-title">${isHospital ? '🏥' : '🙋'} ${user?.name || 'You'}</div>
              <div class="popup-sub">${isHospital ? user?.hospitalName || 'Hospital' : `Blood Type: ${user?.bloodType || 'O+'}`}</div>`,
    });

    // If hospital mode, show responded donor markers
    if (isHospital) {
      openRequests.forEach((req) => {
        (req.responses || []).forEach((resp, idx) => {
          // Simulate donor positions nearby the hospital
          const offset = (idx + 1) * 0.004;
          mapMarkers.push({
            id: `donor-${req.id}-${idx}`,
            lat: req.location.lat + offset * (idx % 2 === 0 ? 1 : -1),
            lng: req.location.lng + offset * (idx % 2 === 0 ? -1 : 1),
            type: 'donor',
            label: `${resp.donorName} — En Route`,
            popup: `<div class="popup-title">🙋 ${resp.donorName}</div>
                    <div class="popup-sub">${resp.bloodType} • ${resp.transactionId}</div>`,
          });
        });
      });
    }

    // Route line from donor to nearest matching request
    let rf = null, rt = null, et = '', nearest = null;
    if (!isHospital && openRequests.length > 0) {
      let minDist = Infinity;
      openRequests.forEach((req) => {
        const d = calculateHaversineDistance(userLoc.lat, userLoc.lng, req.location.lat, req.location.lng);
        if (d < minDist) {
          minDist = d;
          nearest = { ...req, distance: d };
        }
      });
      if (nearest) {
        rf = { lat: userLoc.lat, lng: userLoc.lng };
        rt = { lat: nearest.location.lat, lng: nearest.location.lng };
        et = calculateETA(nearest.distance).formatted;
      }
    }

    return { markers: mapMarkers, routeFrom: rf, routeTo: rt, etaText: et, nearestRequest: nearest };
  }, [requests, userLoc, isHospital]);

  return (
    <ScreenContainer scrollable={false}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Emergency Map</Text>
        <Badge label="LIVE" type="critical" size="small" />
      </View>

      {/* Full-Screen Map */}
      <LeafletMap
        center={userLoc}
        zoom={13}
        markers={markers}
        routeFrom={routeFrom}
        routeTo={routeTo}
        etaText={etaText}
        height={420}
        style={styles.mapContainer}
      />

      {/* Bottom Info Card */}
      {nearestRequest && !isHospital ? (
        <Card style={styles.bottomCard} variant="glow">
          <View style={styles.bottomRow}>
            <View style={styles.bloodBadge}>
              <Text style={styles.bloodText}>{nearestRequest.bloodType}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bottomTitle}>{nearestRequest.hospitalName}</Text>
              <Text style={styles.bottomSub}>
                📏 {formatDistance(nearestRequest.distance)} • 🕐 {calculateETA(nearestRequest.distance).formatted}
              </Text>
            </View>
            <Badge label={nearestRequest.urgency.toUpperCase()} type={nearestRequest.urgency} size="small" />
          </View>
        </Card>
      ) : isHospital ? (
        <Card style={styles.bottomCard}>
          <Text style={styles.bottomTitle}>📡 Tracking Responded Donors</Text>
          <Text style={styles.bottomSub}>
            Donor markers show approximate live positions traveling to your facility
          </Text>
        </Card>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  mapContainer: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  bottomCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bloodBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bloodText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  bottomTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  bottomSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
