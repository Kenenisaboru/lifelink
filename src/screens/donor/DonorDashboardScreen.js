import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import AlertCard from '../../components/AlertCard';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import { calculateHaversineDistance, isBloodCompatible } from '../../utils/distance';

export default function DonorDashboardScreen({ navigation }) {
  const { user, logout, toggleAvailability, updateProfile } = useAuth();
  const { requests } = useRequests();

  const [locationStatus, setLocationStatus] = useState('Fetching location...');
  const [userLocation, setUserLocation] = useState(user?.location || { lat: -1.286389, lng: 36.817223, city: 'Nairobi CBD' });
  const [maxRadiusKm, setMaxRadiusKm] = useState(8);
  const [refreshing, setRefreshing] = useState(false);

  // Request location permission & capture current lat/lng on mount
  useEffect(() => {
    async function requestLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationStatus('Location permission denied (Using default Nairobi)');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const newLoc = {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          city: 'Current Location',
        };

        setUserLocation(newLoc);
        setLocationStatus('📍 Live Location Active');

        // Try reverse geocode to get city name if available
        try {
          const [address] = await Location.reverseGeocodeAsync(loc.coords);
          if (address && (address.city || address.subregion || address.district)) {
            const cityName = address.city || address.subregion || address.district;
            newLoc.city = cityName;
            setLocationStatus(`📍 ${cityName}`);
          }
        } catch (e) {
          // ignore geocode error
        }

        updateProfile({ location: newLoc });
      } catch (err) {
        setLocationStatus('📍 Nairobi Center (Default)');
      }
    }

    requestLocation();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((res) => setTimeout(res, 600));
    setRefreshing(false);
  };

  // Filter open requests compatible with donor blood type and within radius
  const activeOpenRequests = requests.filter((r) => r.status === 'open');

  const matchedAlerts = activeOpenRequests
    .map((req) => {
      const distanceKm = calculateHaversineDistance(
        userLocation.lat,
        userLocation.lng,
        req.location.lat,
        req.location.lng
      );

      const compatible = isBloodCompatible(user?.bloodType, req.bloodType);
      const withinRadius = distanceKm <= maxRadiusKm;

      const hasResponded = req.responses?.some((resp) => resp.donorId === user?.uid);

      return {
        request: req,
        distanceKm,
        compatible,
        withinRadius,
        hasResponded,
      };
    })
    .filter((item) => item.compatible && item.withinRadius);

  const handleRespond = (request, distanceKm) => {
    // Navigate to Phase 4 Payment Screen
    navigation.navigate('Payment', { request, distanceKm });
  };

  return (
    <ScreenContainer
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
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
            <Text style={styles.locationText}>{locationStatus}</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>
        </View>

        {/* Availability Switch */}
        <View style={styles.availabilityRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.availTitle}>Donor Availability</Text>
            <Text style={styles.availSub}>
              {user?.available
                ? 'ON — Receiving emergency alerts'
                : 'OFF — Alerts paused'}
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

      {/* Section Header & Radius Filter Selector */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Matched Alerts ({matchedAlerts.length})</Text>
          <Text style={styles.sectionSub}>Matching blood type ({user?.bloodType || 'O+'})</Text>
        </View>

        {/* Radius Filter Pills */}
        <View style={styles.radiusPillsRow}>
          {[5, 8, 15].map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.radiusPill,
                maxRadiusKm === r && styles.activeRadiusPill,
              ]}
              onPress={() => setMaxRadiusKm(r)}
            >
              <Text
                style={[
                  styles.radiusPillText,
                  maxRadiusKm === r && styles.activeRadiusPillText,
                ]}
              >
                {r}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Alerts List */}
      {!user?.available ? (
        <Card style={styles.disabledAlertsCard}>
          <Text style={styles.disabledIcon}>🔕</Text>
          <Text style={styles.disabledTitle}>Donor Availability Paused</Text>
          <Text style={styles.disabledSub}>
            Turn ON availability above to receive emergency alerts from nearby hospitals in real-time.
          </Text>
        </Card>
      ) : matchedAlerts.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📡</Text>
          <Text style={styles.emptyTitle}>No Emergency Alerts Nearby</Text>
          <Text style={styles.emptySub}>
            No active emergency blood requests match your blood type ({user?.bloodType || 'O+'}) within {maxRadiusKm}km. Pull down to refresh.
          </Text>
        </Card>
      ) : (
        matchedAlerts.map(({ request, distanceKm, hasResponded }) => (
          <AlertCard
            key={request.id}
            request={request}
            distanceKm={distanceKm}
            responded={hasResponded}
            onRespond={handleRespond}
          />
        ))
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
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  radiusPillsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 10,
    padding: 3,
  },
  radiusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  activeRadiusPill: {
    backgroundColor: COLORS.secondary,
  },
  radiusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  activeRadiusPillText: {
    color: '#0B0F17',
  },
  disabledAlertsCard: {
    alignItems: 'center',
    padding: 24,
  },
  disabledIcon: {
    fontSize: 34,
    marginBottom: 8,
  },
  disabledTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  disabledSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
