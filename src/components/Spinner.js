import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function Spinner({ message, overlay = false }) {
  if (overlay) {
    return (
      <View style={styles.overlayContainer}>
        <View style={styles.overlayBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          {message ? <Text style={styles.messageText}>{message}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message ? <Text style={styles.messageText}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inlineContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 23, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  overlayBox: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    minWidth: 180,
  },
  messageText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
});
