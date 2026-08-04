import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { releaseFunds } from '../../services/EscrowService';

// Simulate scanned donor data (in real app: camera barcode/QR scan)
const DEMO_SCANNED_DONOR = {
  donorId: 'donor-001',
  name: 'Sarah Connor',
  bloodType: 'O+',
  verified: true,
  donations: 3,
  tier: 'Bronze',
  escrowId: 'ESC-1234-ABCD',
  amount: 650,
  transactionId: 'TELEBIRR-7X9K24M',
};

export default function QRCheckInScreen({ navigation, route }) {
  const { user } = useAuth();
  const [scannedDonor, setScannedDonor] = useState(null);
  const [scanState, setScanState] = useState('idle'); // idle | scanning | scanned | confirmed | error
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const simulateScan = () => {
    setScanState('scanning');
    setTimeout(() => {
      setScannedDonor(DEMO_SCANNED_DONOR);
      setScanState('scanned');
    }, 2000);
  };

  const handleConfirmArrival = async () => {
    setConfirmLoading(true);
    await new Promise((r) => setTimeout(r, 1500));

    if (scannedDonor?.escrowId) {
      const result = releaseFunds(scannedDonor.escrowId, user?.uid);
      if (result.success) {
        setScanState('confirmed');
        setConfirmed(true);
      } else {
        setScanState('error');
        Alert.alert('Release Failed', result.message);
      }
    } else {
      setScanState('confirmed');
      setConfirmed(true);
    }

    setConfirmLoading(false);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donor QR Check-In</Text>
      </View>

      {/* Scanner Prompt */}
      {scanState === 'idle' && (
        <Card style={styles.scanCard} variant="glow">
          <Text style={styles.scanTitle}>📱 Scan Donor QR Code</Text>
          <Text style={styles.scanSub}>
            Ask the donor to open their LifeLink Passport and scan their QR code to confirm arrival and release escrow funds.
          </Text>
          <View style={styles.scanFrame}>
            <View style={styles.scanCorner} />
            <View style={[styles.scanCorner, styles.scanCornerTR]} />
            <View style={[styles.scanCorner, styles.scanCornerBL]} />
            <View style={[styles.scanCorner, styles.scanCornerBR]} />
            <Text style={styles.scanIcon}>📷</Text>
            <Text style={styles.scanHint}>Camera viewfinder</Text>
          </View>
          <Button title="▶ Simulate QR Scan (Demo)" onPress={simulateScan} variant="primary" style={styles.scanBtn} />
        </Card>
      )}

      {/* Scanning Animation */}
      {scanState === 'scanning' && (
        <Card style={styles.scanCard}>
          <Text style={styles.scanTitle}>🔍 Scanning...</Text>
          <View style={styles.scanFrame}>
            <Text style={styles.scanIcon}>⏳</Text>
            <Text style={styles.scanHint}>Reading QR code...</Text>
          </View>
        </Card>
      )}

      {/* Scanned Result */}
      {(scanState === 'scanned' || scanState === 'confirmed') && scannedDonor && (
        <>
          <Card style={styles.donorCard} variant={confirmed ? 'glow' : 'default'}>
            <View style={styles.verifiedBanner}>
              <Text style={styles.verifiedIcon}>{confirmed ? '✅' : '🔍'}</Text>
              <Text style={[styles.verifiedText, { color: confirmed ? COLORS.accentGreen : COLORS.secondary }]}>
                {confirmed ? 'ARRIVAL CONFIRMED' : 'DONOR VERIFIED'}
              </Text>
            </View>

            <View style={styles.donorRow}>
              <View style={styles.bloodBadge}>
                <Text style={styles.bloodText}>{scannedDonor.bloodType}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.donorName}>{scannedDonor.name}</Text>
                <Text style={styles.donorSub}>
                  {scannedDonor.donations} donations • {scannedDonor.tier} Tier
                </Text>
              </View>
              <Badge label="✓ VERIFIED" type={confirmed ? 'low' : 'donor'} size="small" />
            </View>

            <View style={styles.divider} />

            {/* Escrow Info */}
            <View style={styles.escrowInfo}>
              <Text style={styles.escrowTitle}>💳 Escrow Payment</Text>
              <View style={styles.escrowRow}>
                <Text style={styles.escrowLabel}>Amount Held:</Text>
                <Text style={styles.escrowAmount}>KSh {scannedDonor.amount}</Text>
              </View>
              <View style={styles.escrowRow}>
                <Text style={styles.escrowLabel}>Transaction ID:</Text>
                <Text style={styles.escrowTrx}>{scannedDonor.transactionId}</Text>
              </View>
              <View style={styles.escrowRow}>
                <Text style={styles.escrowLabel}>Status:</Text>
                <Badge
                  label={confirmed ? 'RELEASED ✓' : 'HELD'}
                  type={confirmed ? 'low' : 'medium'}
                  size="small"
                />
              </View>
            </View>
          </Card>

          {!confirmed ? (
            <Button
              title="✅ Confirm Arrival & Release Funds"
              onPress={handleConfirmArrival}
              loading={confirmLoading}
              variant="primary"
              style={styles.confirmBtn}
            />
          ) : (
            <Card style={styles.successCard}>
              <Text style={styles.successTitle}>🎉 Funds Released Successfully</Text>
              <Text style={styles.successSub}>
                KSh {scannedDonor.amount} has been released from escrow to your hospital account. The donor's donation has been logged.
              </Text>
              <Button title="Done" onPress={() => navigation.goBack()} variant="outline" />
            </Card>
          )}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 16 },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: COLORS.surfaceLight, borderRadius: 8 },
  backText: { color: COLORS.secondary, fontWeight: '700', fontSize: 13 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  scanCard: { alignItems: 'center', padding: 20, marginBottom: 16 },
  scanTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  scanSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  scanFrame: { width: 200, height: 200, borderWidth: 2, borderColor: COLORS.border, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' },
  scanCorner: { position: 'absolute', top: -1, left: -1, width: 20, height: 20, borderTopWidth: 3, borderLeftWidth: 3, borderColor: COLORS.secondary, borderRadius: 2 },
  scanCornerTR: { top: -1, left: undefined, right: -1, borderTopWidth: 3, borderLeftWidth: 0, borderRightWidth: 3 },
  scanCornerBL: { top: undefined, left: -1, bottom: -1, borderTopWidth: 0, borderBottomWidth: 3 },
  scanCornerBR: { top: undefined, left: undefined, right: -1, bottom: -1, borderTopWidth: 0, borderLeftWidth: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  scanIcon: { fontSize: 40, marginBottom: 8 },
  scanHint: { fontSize: 12, color: COLORS.textMuted },
  scanBtn: { width: '100%' },
  donorCard: { marginBottom: 16 },
  verifiedBanner: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  verifiedIcon: { fontSize: 24, marginRight: 8 },
  verifiedText: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  donorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  bloodBadge: { width: 52, height: 52, borderRadius: 12, backgroundColor: COLORS.primaryGlow, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  bloodText: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
  donorName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  donorSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 14 },
  escrowInfo: {},
  escrowTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 10 },
  escrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  escrowLabel: { fontSize: 12, color: COLORS.textMuted },
  escrowAmount: { fontSize: 18, fontWeight: '900', color: COLORS.accentGreen },
  escrowTrx: { fontSize: 11, color: COLORS.accentYellow, fontWeight: '600' },
  confirmBtn: { marginTop: 4 },
  successCard: { padding: 20, alignItems: 'center' },
  successTitle: { fontSize: 18, fontWeight: '800', color: COLORS.accentGreen, marginBottom: 8, textAlign: 'center' },
  successSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
});
