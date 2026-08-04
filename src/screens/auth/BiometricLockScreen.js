import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS } from '../../theme/colors';
import { authenticateWithBiometrics, checkBiometricAvailability } from '../../services/BiometricService';

export default function BiometricLockScreen({ onUnlock, onUsePassword }) {
  const [biometricInfo, setBiometricInfo] = useState({ available: false, typeLabel: 'Biometrics' });
  const [status, setStatus] = useState('idle'); // idle | authenticating | success | failed
  const [pulseAnim] = useState(new Animated.Value(1));
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      const info = await checkBiometricAvailability();
      setBiometricInfo(info);
      // Auto-trigger on mount
      if (info.available) {
        setTimeout(() => triggerAuth(info), 600);
      }
    })();
  }, []);

  // Pulse animation for biometric icon
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  };

  const triggerAuth = async (info = biometricInfo) => {
    setStatus('authenticating');
    setErrorMsg('');
    startPulse();

    const result = await authenticateWithBiometrics({
      promptMessage: `Use ${info.typeLabel} to unlock LifeLink`,
    });

    pulseAnim.stopAnimation();

    if (result.success) {
      setStatus('success');
      setTimeout(() => onUnlock(), 500);
    } else {
      setStatus('failed');
      setErrorMsg(result.error === 'user_cancel' ? 'Authentication cancelled' : 'Authentication failed. Try again.');
    }
  };

  const getIcon = () => {
    if (biometricInfo.isFaceId) return '😊';
    if (biometricInfo.isFingerprint) return '👆';
    return '🔐';
  };

  const statusColor = {
    idle: COLORS.secondary,
    authenticating: COLORS.accentYellow,
    success: COLORS.accentGreen,
    failed: COLORS.primary,
  }[status];

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🩸</Text>
        </View>
        <Text style={styles.logoTitle}>LifeLink</Text>
        <Text style={styles.logoSub}>Emergency Blood Donor Network</Text>
      </View>

      {/* Biometric Icon */}
      <View style={styles.centerContent}>
        <Animated.View style={[styles.biometricCircle, { borderColor: statusColor, transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.biometricIcon}>{getIcon()}</Text>
        </Animated.View>

        <Text style={[styles.statusTitle, { color: statusColor }]}>
          {status === 'idle' && `Tap to use ${biometricInfo.typeLabel}`}
          {status === 'authenticating' && `Scanning...`}
          {status === 'success' && `✓ Verified!`}
          {status === 'failed' && `Authentication Failed`}
        </Text>

        {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}

        {(status === 'idle' || status === 'failed') && biometricInfo.available && (
          <TouchableOpacity style={styles.retryBtn} onPress={() => triggerAuth()}>
            <Text style={styles.retryText}>
              {status === 'failed' ? '🔄 Try Again' : `🔐 Use ${biometricInfo.typeLabel}`}
            </Text>
          </TouchableOpacity>
        )}

        {!biometricInfo.available && (
          <Text style={styles.noHardwareText}>
            Biometrics not available on this device
          </Text>
        )}
      </View>

      {/* Fallback to Password */}
      <TouchableOpacity style={styles.passwordFallback} onPress={onUsePassword}>
        <Text style={styles.passwordFallbackText}>🔑 Use Password Instead</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  logoContainer: { alignItems: 'center' },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primaryGlow, borderWidth: 2, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoEmoji: { fontSize: 36 },
  logoTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  logoSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  centerContent: { alignItems: 'center' },
  biometricCircle: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 3, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  biometricIcon: { fontSize: 52 },
  statusTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  errorMsg: { fontSize: 13, color: COLORS.primary, textAlign: 'center', marginBottom: 16 },
  retryBtn: {
    paddingHorizontal: 28, paddingVertical: 12,
    backgroundColor: COLORS.surfaceLight, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, marginTop: 8,
  },
  retryText: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  noHardwareText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 16 },
  passwordFallback: { paddingVertical: 12, paddingHorizontal: 20 },
  passwordFallbackText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
});
