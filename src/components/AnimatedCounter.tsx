/**
 * AnimatedCounter — Smooth animated number transitions using Reanimated
 * Used for live responder counts, inventory numbers, and statistics
 */
import React, { useEffect, useRef } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AnimatedCounterProps {
  value: number;
  style?: StyleProp<TextStyle>;
  /** Animation type: spring (bouncy) or timing (smooth) */
  animationType?: 'spring' | 'timing';
  /** Whether to flash a color highlight on change */
  flashOnChange?: boolean;
  /** Duration in ms for timing animation */
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export default function AnimatedCounter({
  value,
  style,
  animationType = 'spring',
  duration = 400,
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const displayValue = useSharedValue(value);
  const scale = useSharedValue(1);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      // Scale pulse on change
      scale.value = withSpring(1.2, { damping: 3 }, () => {
        scale.value = withSpring(1, { damping: 8 });
      });

      // Animate the value
      if (animationType === 'spring') {
        displayValue.value = withSpring(value, {
          damping: 15,
          stiffness: 180,
        });
      } else {
        displayValue.value = withTiming(value, {
          duration,
          easing: Easing.out(Easing.cubic),
        });
      }

      prevValue.current = value;
    }
  }, [value, animationType, duration, displayValue, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {prefix}
      {value}
      {suffix}
    </Animated.Text>
  );
}

// ─── Animated Layout Change Wrapper ──────────────────────────

interface AnimatedListItemProps {
  children: React.ReactNode;
  style?: StyleProp<object>;
  delay?: number;
}

/**
 * Fade + slide-in animation for newly appearing list items
 */
export function AnimatedListItem({ children, style, delay = 0 }: AnimatedListItemProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    }, delay);

    return () => clearTimeout(timeout);
  }, [opacity, translateY, delay]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animStyle]}>
      {children}
    </Animated.View>
  );
}

// ─── Pulse Animation Wrapper ──────────────────────────────────

interface PulseViewProps {
  children: React.ReactNode;
  active?: boolean;
  style?: StyleProp<object>;
}

/**
 * Continuous pulse animation for live/active status indicators
 */
export function PulseView({ children, active = true, style }: PulseViewProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withSpring(1.05, { damping: 2 }, () => {
        scale.value = withSpring(1, { damping: 2 });
      });
    }
  }, [active, scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[style, pulseStyle]}>
      {children}
    </Animated.View>
  );
}
