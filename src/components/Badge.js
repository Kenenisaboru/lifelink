import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function Badge({ label, type = 'primary', size = 'medium', style, textStyle }) {
  const getColors = () => {
    switch (type) {
      case 'critical':
        return { bg: 'rgba(255, 59, 92, 0.2)', border: COLORS.primary, text: COLORS.primary };
      case 'medium':
        return { bg: 'rgba(255, 196, 0, 0.2)', border: COLORS.accentYellow, text: COLORS.accentYellow };
      case 'low':
        return { bg: 'rgba(0, 230, 118, 0.2)', border: COLORS.accentGreen, text: COLORS.accentGreen };
      case 'donor':
        return { bg: 'rgba(0, 230, 118, 0.15)', border: COLORS.donorBadge, text: COLORS.donorBadge };
      case 'hospital':
        return { bg: 'rgba(0, 229, 255, 0.15)', border: COLORS.hospitalBadge, text: COLORS.hospitalBadge };
      default:
        return { bg: COLORS.surfaceLight, border: COLORS.border, text: COLORS.textSecondary };
    }
  };

  const { bg, border, text } = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
        size === 'small' && styles.small,
        size === 'large' && styles.large,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: text },
          size === 'small' && styles.smallText,
          size === 'large' && styles.largeText,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  large: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  smallText: {
    fontSize: 10,
  },
  largeText: {
    fontSize: 14,
  },
});
