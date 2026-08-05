/**
 * SkeletonLoader — Animated skeleton placeholders for loading states
 * Uses react-native-reanimated for smooth shimmer effect
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  cancelAnimation,
} from 'react-native-reanimated';
import { COLORS } from '../theme/colors';

// ─── Base Shimmer ─────────────────────────────────────────────

interface ShimmerProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function ShimmerBox({ width, height, borderRadius = 8, style }: ShimmerProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1, // infinite
      false
    );
    return () => {
      cancelAnimation(progress);
    };
  }, [progress]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.4, 0.8, 0.4]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: COLORS.surfaceLight,
        },
        shimmerStyle,
        style,
      ]}
    />
  );
}

// ─── Alert Card Skeleton ──────────────────────────────────────

export function AlertCardSkeleton() {
  return (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <ShimmerBox width="40%" height={18} borderRadius={6} />
        <ShimmerBox width="20%" height={14} borderRadius={6} />
      </View>
      <View style={styles.alertBody}>
        <ShimmerBox width={58} height={58} borderRadius={14} />
        <View style={styles.alertBodyText}>
          <ShimmerBox width="70%" height={18} borderRadius={4} style={{ marginBottom: 6 }} />
          <ShimmerBox width="50%" height={13} borderRadius={4} style={{ marginBottom: 4 }} />
          <ShimmerBox width="40%" height={12} borderRadius={4} />
        </View>
      </View>
      <ShimmerBox width="100%" height={44} borderRadius={12} style={{ marginTop: 14 }} />
    </View>
  );
}

// ─── Inventory Row Skeleton ───────────────────────────────────

export function InventoryRowSkeleton() {
  return (
    <View style={styles.inventoryRow}>
      <ShimmerBox width={40} height={40} borderRadius={10} />
      <View style={styles.inventoryMid}>
        <ShimmerBox width="100%" height={12} borderRadius={6} style={{ marginBottom: 4 }} />
        <View style={styles.inventoryLabels}>
          <ShimmerBox width="30%" height={10} borderRadius={4} />
          <ShimmerBox width="25%" height={10} borderRadius={4} />
        </View>
      </View>
      <View style={styles.inventoryControls}>
        <ShimmerBox width={30} height={30} borderRadius={8} />
        <ShimmerBox width={30} height={30} borderRadius={8} style={{ marginLeft: 4 }} />
      </View>
    </View>
  );
}

// ─── Dashboard Stats Skeleton ─────────────────────────────────

export function DashboardStatsSkeleton() {
  return (
    <View style={styles.statsRow}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.statBox}>
          <ShimmerBox width={40} height={28} borderRadius={4} style={{ marginBottom: 6 }} />
          <ShimmerBox width={60} height={10} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

// ─── Request Card Skeleton ────────────────────────────────────

export function RequestCardSkeleton() {
  return (
    <View style={styles.requestCard}>
      <View style={styles.requestCardTop}>
        <ShimmerBox width={52} height={52} borderRadius={12} />
        <View style={styles.requestCardBody}>
          <ShimmerBox width="40%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
          <ShimmerBox width="60%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
          <ShimmerBox width="35%" height={12} borderRadius={4} />
        </View>
        <ShimmerBox width={20} height={20} borderRadius={4} />
      </View>
      <View style={styles.requestCardFooter}>
        <ShimmerBox width="45%" height={26} borderRadius={6} />
        <ShimmerBox width="25%" height={14} borderRadius={4} />
      </View>
    </View>
  );
}

// ─── Leaderboard Row Skeleton ─────────────────────────────────

export function LeaderboardRowSkeleton() {
  return (
    <View style={styles.leaderRow}>
      <ShimmerBox width={36} height={36} borderRadius={18} />
      <View style={styles.leaderBody}>
        <ShimmerBox width="60%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
        <ShimmerBox width="40%" height={11} borderRadius={4} />
      </View>
      <ShimmerBox width={40} height={16} borderRadius={4} />
    </View>
  );
}

// ─── Full Page Loading Screens ────────────────────────────────

export function DonorDashboardSkeleton() {
  return (
    <View style={styles.page}>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <ShimmerBox width={64} height={64} borderRadius={16} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <ShimmerBox width="60%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
            <ShimmerBox width="80%" height={13} borderRadius={4} style={{ marginBottom: 4 }} />
            <ShimmerBox width="50%" height={12} borderRadius={4} />
          </View>
        </View>
        <ShimmerBox width="100%" height={1} borderRadius={1} style={{ marginBottom: 14 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <ShimmerBox width="50%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
            <ShimmerBox width="70%" height={12} borderRadius={4} />
          </View>
          <ShimmerBox width={48} height={28} borderRadius={14} />
        </View>
      </View>

      {/* Alert cards */}
      <ShimmerBox width="60%" height={18} borderRadius={4} style={{ marginBottom: 12 }} />
      <AlertCardSkeleton />
      <AlertCardSkeleton />
    </View>
  );
}

export function HospitalDashboardSkeleton() {
  return (
    <View style={styles.page}>
      <DashboardStatsSkeleton />
      <ShimmerBox
        width="100%"
        height={44}
        borderRadius={12}
        style={{ marginVertical: 14 }}
      />
      <ShimmerBox width="50%" height={18} borderRadius={4} style={{ marginBottom: 12 }} />
      <RequestCardSkeleton />
      <RequestCardSkeleton />
      <RequestCardSkeleton />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  alertCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alertBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBodyText: {
    flex: 1,
    marginLeft: 14,
  },
  inventoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inventoryMid: {
    flex: 1,
    marginHorizontal: 10,
  },
  inventoryLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  inventoryControls: {
    flexDirection: 'row',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  requestCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  requestCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestCardBody: {
    flex: 1,
    marginLeft: 12,
  },
  requestCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  leaderBody: {
    flex: 1,
    marginLeft: 10,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
