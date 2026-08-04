import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { COLORS } from '../../theme/colors';
import { useRequests } from '../../context/RequestContext';
import { useAuth } from '../../context/AuthContext';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const URGENCY_LEVELS = [
  { key: 'critical', label: 'CRITICAL', desc: '< 30 Mins Transfusion', color: COLORS.primary },
  { key: 'medium', label: 'MEDIUM', desc: 'Urgent — Today', color: COLORS.accentYellow },
  { key: 'low', label: 'LOW', desc: 'Standard Reserve', color: COLORS.accentGreen },
];

export default function CreateRequestScreen({ navigation }) {
  const { createRequest, loading } = useRequests();
  const { user } = useAuth();

  const [bloodType, setBloodType] = useState('O+');
  const [urgency, setUrgency] = useState('critical');
  const [unitsNeeded, setUnitsNeeded] = useState('2');
  const [suggestedAmount, setSuggestedAmount] = useState('1200');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');
    if (!bloodType) {
      setError('Please select required blood type.');
      return;
    }
    if (!suggestedAmount || parseInt(suggestedAmount, 10) <= 0) {
      setError('Please enter a valid transport fee suggested amount.');
      return;
    }

    try {
      await createRequest({
        bloodType,
        urgency,
        unitsNeeded,
        suggestedAmount,
        notes,
        location: user?.location || { lat: -1.2921, lng: 36.8219, city: 'Upper Hill, Nairobi' },
      });
      navigation.goBack();
    } catch (err) {
      setError('Failed to broadcast emergency request.');
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Emergency Request</Text>
        <View style={{ width: 50 }} />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Hospital Location Preview */}
      <Card style={styles.hospitalCard}>
        <Text style={styles.hospLabel}>BROADCASTING FROM</Text>
        <Text style={styles.hospName}>{user?.hospitalName || 'Emergency Medical Center'}</Text>
        <Text style={styles.hospLoc}>📍 {user?.location?.city || 'Nairobi Area'}</Text>
      </Card>

      {/* Blood Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>1. Required Blood Type</Text>
        <View style={styles.bloodGrid}>
          {BLOOD_TYPES.map((bt) => (
            <TouchableOpacity
              key={bt}
              style={[
                styles.bloodChip,
                bloodType === bt && styles.bloodChipSelected,
              ]}
              onPress={() => setBloodType(bt)}
            >
              <Text
                style={[
                  styles.bloodChipText,
                  bloodType === bt && styles.bloodChipTextSelected,
                ]}
              >
                {bt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Urgency Level Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>2. Urgency Level</Text>
        <View style={styles.urgencyRow}>
          {URGENCY_LEVELS.map((u) => {
            const isSelected = urgency === u.key;
            return (
              <TouchableOpacity
                key={u.key}
                style={[
                  styles.urgencyCard,
                  isSelected && { borderColor: u.color, backgroundColor: `${u.color}15` },
                ]}
                onPress={() => setUrgency(u.key)}
              >
                <Badge label={u.label} type={u.key} size="small" />
                <Text style={styles.urgencyDesc}>{u.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Units & Suggested Transport Amount */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>3. Units & Transport Fee</Text>
        <View style={styles.inputsRow}>
          <Input
            label="Units Needed"
            value={unitsNeeded}
            onChangeText={setUnitsNeeded}
            keyboardType="number-pad"
            style={{ flex: 0.45 }}
          />
          <Input
            label="Transport Fee (KSh)"
            value={suggestedAmount}
            onChangeText={setSuggestedAmount}
            keyboardType="number-pad"
            style={{ flex: 0.52 }}
          />
        </View>
      </View>

      {/* Special Medical Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>4. Medical Notes / Special Instructions</Text>
        <Input
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. ICU Ward 3, Trauma surgery. Bring ID."
          style={{ marginTop: 0 }}
        />
      </View>

      {/* Broadcast Action */}
      <Button
        title="🚨 Broadcast Emergency Request to Donors"
        variant="primary"
        loading={loading}
        onPress={handleCreate}
        style={styles.submitBtn}
      />
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
  errorBox: {
    backgroundColor: COLORS.errorBg,
    borderColor: COLORS.error,
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
  },
  hospitalCard: {
    backgroundColor: COLORS.surfaceLight,
    marginBottom: 16,
    padding: 14,
  },
  hospLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  hospName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  hospLoc: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  bloodChip: {
    width: '23%',
    margin: '1%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    alignItems: 'center',
  },
  bloodChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  bloodChipText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  bloodChipTextSelected: {
    color: '#FFFFFF',
  },
  urgencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  urgencyCard: {
    flex: 0.31,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    padding: 10,
    alignItems: 'center',
  },
  urgencyDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitBtn: {
    marginTop: 10,
    marginBottom: 30,
  },
});
