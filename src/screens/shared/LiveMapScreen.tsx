import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import LeafletMap from '../../components/LeafletMap';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { COLORS } from '../../theme/colors';
import { useRequestStore } from '../../stores/useRequestStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { calculateHaversineDistance } from '../../utils/distance';
import { calculateETA, formatDistance } from '../../utils/eta';
import type { LiveMapScreenProps } from '../../types/navigation';
import type { MapMarker, MapPoint } from '../../components/LeafletMap';
import type { BloodRequest, DonorUser } from '../../types';

// Named type alias so TypeScript tracks it correctly across useMemo + JSX
type NearestRequest = BloodRequest & { distance: number };

export default function LiveMapScreen({ navigation }: LiveMapScreenProps) {
  const { user } = useAuthStore();
  const { requests } = useRequestStore();

  const userLoc: MapPoint = user?.location ?? { lat: -1.286389, lng: 36.817223 };
  const isHospital = user?.role === 'hospital';
  const donorUser = user as DonorUser | null;

  const { markers, routeFrom, routeTo, etaText, nearestRequest } = useMemo(() => {
    const openRequests = requests.filter((r) => r.status === 'open');
    const mapMarkers: MapMarker[] = [];

    // ── Hospital / request pins ──────────────────────────────────
    openRequests.forEach((req) => {
      const dist = calculateHaversineDistance(
        userLoc.lat, userLoc.lng,
        req.location.lat, req.location.lng
      );
      const eta = calculateETA(dist);
      const respCount = req.responses?.length ?? 0;

      mapMarkers.push({
        id: req.id,
        lat: req.location.lat,
        lng: req.location.lng,
        type: 'hospital',
        label: `${req.bloodType} ${req.urgency.toUpperCase()}`,
        popup: `
          <div class="popup-title">🏥 ${req.hospitalName}</div>
          <div class="popup-sub">📍 ${req.location?.city ?? 'Nairobi'}</div>
          <div class="popup-badge">${req.bloodType} — ${req.urgency.toUpperCase()}</div>
          <div class="popup-sub">${req.unitsNeeded} Units • ${respCount} Donors Responded</div>
          <div class="popup-sub">📏 ${formatDistance(dist)} • 🕐 ${eta.formatted}</div>
        `,
      });
    });

    // ── Self marker ──────────────────────────────────────────────
    mapMarkers.push({
      id: 'self',
      lat: userLoc.lat,
      lng: userLoc.lng,
      type: isHospital ? 'hospital' : 'donor',
      label: isHospital ? 'Your Hospital' : 'Your Location',
      popup: `<div class="popup-title">${isHospital ? '🏥' : '🙋'} ${user?.name ?? 'You'}</div>
              <div class="popup-sub">${
                isHospital
                  ? 'Hospital Portal'
                  : `Blood Type: ${donorUser?.bloodType ?? 'O+'}`
              }</div>`,
    });

    // ── Donor response pins (hospital view) ──────────────────────
    if (isHospital) {
      openRequests.forEach((req) => {
        (req.responses ?? []).forEach((resp, idx) => {
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

    // ── Nearest request route (donor view) ──────────────────────
    let rf: MapPoint | undefined;
    let rt: MapPoint | undefined;
    let et = '';
    // Use a local typed variable — avoids TypeScript narrowing it to `never`
    // inside forEach callbacks
    let nearest: NearestRequest | null = null;

    if (!isHospital && openRequests.length > 0) {
      let minDist = Infinity;
      // Accumulate into a separate candidate variable so TS doesn't lose
      // track of the type when assigning inside the forEach closure
      let candidate: NearestRequest | null = null;

      for (const req of openRequests) {
        const d = calculateHaversineDistance(
          userLoc.lat, userLoc.lng,
          req.location.lat, req.location.lng
        );
        if (d < minDist) {
          minDist = d;
          // Explicit spread into the typed alias — TS knows this is NearestRequest
          candidate = { ...req, distance: d } satisfies NearestRequest;
        }
      }

      nearest = candidate;

      if (nearest !== null) {
        rf = { lat: userLoc.lat, lng: userLoc.lng };
        rt = { lat: nearest.location.lat, lng: nearest.location.lng };
        et = calculateETA(minDist).formatted;
      }
    }

    return {
      markers: mapMarkers,
      routeFrom: rf,
      routeTo: rt,
      etaText: et,
      nearestRequest: nearest,
    };
  }, [requests, userLoc, isHospital, user?.name, donorUser?.bloodType]);

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Emergency Map</Text>
        <Badge label="LIVE" type="critical" size="small" />
      </View>

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

      {nearestRequest !== null && !isHospital ? (
        // nearestRequest is fully typed as NearestRequest here — no casting needed
        <Card style={styles.bottomCard} variant="glow">
          <View style={styles.bottomRow}>
            <View style={styles.bloodBadge}>
              <Text style={styles.bloodText}>{nearestRequest.bloodType}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bottomTitle}>{nearestRequest.hospitalName}</Text>
              <Text style={styles.bottomSub}>
                📏 {formatDistance(nearestRequest.distance)} • 🕐{' '}
                {calculateETA(nearestRequest.distance).formatted}
              </Text>
            </View>
            <Badge
              label={nearestRequest.urgency.toUpperCase()}
              type={nearestRequest.urgency}
              size="small"
            />
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
