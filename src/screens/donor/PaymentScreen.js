import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Modal, ScrollView } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import {
  PAYMENT_METHODS,
  calculateSuggestedTransportFee,
  generateFakeTransactionId,
} from '../../utils/paymentCalc';

export default function PaymentScreen({ route, navigation }) {
  const { request, distanceKm } = route.params || {};
  const { user } = useAuth();
  const { addDonorResponse } = useRequests();

  const suggestedFee = request?.suggestedAmount || calculateSuggestedTransportFee(distanceKm);

  const [selectedMethodId, setSelectedMethodId] = useState('telebirr'); // Default Telebirr
  const [phoneNumber, setPhoneNumber] = useState('0911234567');
  const [amount, setAmount] = useState(suggestedFee.toString());
  const [coverFullCost, setCoverFullCost] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  const currentMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethodId) || PAYMENT_METHODS[0];

  if (!request) {
    return (
      <ScreenContainer contentContainerStyle={styles.container}>
        <Text style={{ color: COLORS.text, fontSize: 16 }}>No emergency request selected.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  const handleToggleCoverFull = (val) => {
    setCoverFullCost(val);
    if (val) {
      setAmount(suggestedFee.toString());
    }
  };

  const handlePayment = async () => {
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount < 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please enter your mobile payment number');
      return;
    }

    setError('');
    setIsProcessing(true);

    // Simulate 2-second STK Push / Gateway delay
    await new Promise((res) => setTimeout(res, 2000));

    const trxId = generateFakeTransactionId(currentMethod.id);
    const responseObj = {
      donorId: user?.uid || 'donor-demo-123',
      donorName: user?.name || 'Sarah Connor',
      bloodType: user?.bloodType || request.bloodType,
      amountPaid: numAmount,
      paymentMethod: currentMethod.name,
      paymentMethodId: currentMethod.id,
      transactionId: trxId,
      respondedAt: new Date().toISOString(),
    };

    // Save response to RequestContext
    await addDonorResponse(request.id, responseObj);

    setIsProcessing(false);
    setSuccessData(responseObj);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transport Assistance</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Emergency Request Summary */}
      <Card style={styles.summaryCard} variant="glow">
        <View style={styles.summaryHeader}>
          <Badge label="HOSPITAL DESTINATION" type="hospital" size="small" />
          <Text style={styles.distBadge}>📍 ~{distanceKm || 2.4} km away</Text>
        </View>

        <Text style={styles.hospitalTitle}>{request.hospitalName}</Text>
        <Text style={styles.hospitalLoc}>📍 {request.location?.city || 'Nairobi'}</Text>

        <View style={styles.requestDetailsRow}>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>REQUIRED</Text>
            <Text style={styles.detailVal}>{request.bloodType}</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>URGENCY</Text>
            <Badge label={request.urgency.toUpperCase()} type={request.urgency} size="small" />
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>UNITS</Text>
            <Text style={styles.detailVal}>{request.unitsNeeded}</Text>
          </View>
        </View>
      </Card>

      {/* Payment Gateway Selector */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Select Payment Integration Method</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodsScrollView}>
        {PAYMENT_METHODS.map((m) => {
          const isSelected = selectedMethodId === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.methodChip,
                isSelected && { borderColor: m.color, backgroundColor: `${m.color}20` },
              ]}
              onPress={() => {
                setSelectedMethodId(m.id);
                setPhoneNumber(m.phonePlaceholder.split(' ')[0]);
              }}
            >
              <Text style={styles.methodIcon}>{m.icon}</Text>
              <Text style={[styles.methodName, isSelected && { color: m.color }]}>{m.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected Payment Form */}
      <Card style={styles.paymentCard}>
        <View style={styles.mpesaLogoRow}>
          <View style={[styles.mpesaBadge, { backgroundColor: currentMethod.color }]}>
            <Text style={styles.mpesaBadgeText}>{currentMethod.badgeText}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mpesaTitle}>{currentMethod.name} Integration</Text>
            <Text style={styles.mpesaSub}>{currentMethod.subtitle}</Text>
          </View>
        </View>

        {/* Suggested Fee Readonly Display */}
        <View style={styles.suggestedFeeRow}>
          <Text style={styles.suggestedLabel}>Suggested Fee:</Text>
          <Text style={styles.suggestedVal}>KSh / Birr {suggestedFee}</Text>
        </View>

        {/* Cover Full Cost Toggle */}
        <View style={styles.toggleRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.toggleTitle}>Cover Full Transport Fee</Text>
            <Text style={styles.toggleSub}>Pay suggested transport assistance amount</Text>
          </View>
          <Switch
            value={coverFullCost}
            onValueChange={handleToggleCoverFull}
            trackColor={{ false: COLORS.inputBorder, true: `${currentMethod.color}66` }}
            thumbColor={coverFullCost ? currentMethod.color : COLORS.textMuted}
          />
        </View>

        <Input
          label={`${currentMethod.name} Mobile / Account Number`}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholder={currentMethod.phonePlaceholder}
        />

        <Input
          label="Payment Amount (KSh / Birr)"
          value={amount}
          onChangeText={(val) => {
            setAmount(val);
            setCoverFullCost(val === suggestedFee.toString());
            if (error) setError('');
          }}
          keyboardType="number-pad"
          placeholder="Enter custom amount"
          error={error}
        />

        {/* Pay CTA */}
        <Button
          title={`${currentMethod.icon} Pay ${amount || 0} via ${currentMethod.name}`}
          variant="primary"
          loading={isProcessing}
          onPress={handlePayment}
          style={[styles.payBtn, { backgroundColor: currentMethod.color }]}
        />
      </Card>

      {/* Simulated Processing Overlay */}
      {isProcessing && (
        <Spinner overlay message={`Connecting to ${currentMethod.name} Gateway...`} />
      )}

      {/* Payment Success Modal */}
      <Modal visible={!!successData} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard} variant="glow">
            <View style={[styles.successIconCircle, { borderColor: currentMethod.color }]}>
              <Text style={[styles.successCheck, { color: currentMethod.color }]}>✓</Text>
            </View>

            <Text style={styles.modalTitle}>Payment Successful!</Text>
            <Text style={styles.modalSub}>
              Transport payment confirmed via {successData?.paymentMethod}. Broadcast sent to {request.hospitalName}.
            </Text>

            {/* Receipt Summary */}
            <View style={styles.receiptBox}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Gateway Method:</Text>
                <Text style={[styles.receiptVal, { color: currentMethod.color, fontWeight: '800' }]}>
                  {successData?.paymentMethod}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Transaction ID:</Text>
                <Text style={styles.receiptTrx}>{successData?.transactionId}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Amount Paid:</Text>
                <Text style={styles.receiptAmount}>{successData?.amountPaid}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Donor Name:</Text>
                <Text style={styles.receiptVal}>{successData?.donorName}</Text>
              </View>
            </View>

            <Button
              title="Return to Dashboard"
              variant="secondary"
              onPress={() => {
                setSuccessData(null);
                navigation.navigate('DonorDashboard');
              }}
              style={styles.doneBtn}
            />
          </Card>
        </View>
      </Modal>
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
  summaryCard: {
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  hospitalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  hospitalLoc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  requestDetailsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 10,
    justifyContent: 'space-around',
  },
  detailBox: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  methodsScrollView: {
    marginBottom: 14,
    marginHorizontal: -4,
  },
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
  },
  methodIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  methodName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  paymentCard: {
    padding: 18,
  },
  mpesaLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  mpesaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  mpesaBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  mpesaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  mpesaSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  suggestedFeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginBottom: 10,
  },
  suggestedLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  suggestedVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.accentGreen,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 4,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  toggleSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  payBtn: {
    marginTop: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 23, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    padding: 24,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successCheck: {
    fontSize: 32,
    fontWeight: '900',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  receiptLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  receiptTrx: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accentYellow,
  },
  receiptAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.accentGreen,
  },
  receiptVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  doneBtn: {
    width: '100%',
  },
});
