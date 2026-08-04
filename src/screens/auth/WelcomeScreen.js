import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export default function WelcomeScreen({ navigation }) {
  const { login, loading } = useAuth();

  const handleQuickDemo = async (role) => {
    const demoEmail = role === 'hospital' ? 'hospital@demo.com' : 'donor@demo.com';
    await login(demoEmail, 'password123');
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      {/* Header Visual */}
      <View style={styles.header}>
        <View style={styles.pulseContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🩸</Text>
          </View>
        </View>
        <Text style={styles.title}>Life<Text style={{ color: COLORS.primary }}>Link</Text></Text>
        <Text style={styles.subtitle}>Emergency Real-Time Blood Matching</Text>
        <View style={styles.taglineRow}>
          <Badge label="REAL-TIME" type="critical" size="small" />
          <Badge label="MPESA PAY" type="hospital" size="small" style={{ marginLeft: 6 }} />
        </View>
      </View>

      {/* Role Selection Cards */}
      <View style={styles.cardSection}>
        <Text style={styles.sectionTitle}>Get Started</Text>
        
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Signup', { defaultRole: 'donor' })}
        >
          <Card style={styles.roleCard} variant="glow">
            <View style={styles.cardHeader}>
              <Text style={styles.roleEmoji}>🙋‍♂️</Text>
              <Badge label="DONOR" type="donor" />
            </View>
            <Text style={styles.roleTitle}>I Want to Donate Blood</Text>
            <Text style={styles.roleDescription}>
              Receive emergency alerts from nearby hospitals, tap availability & confirm transport support.
            </Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Signup', { defaultRole: 'hospital' })}
        >
          <Card style={styles.roleCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.roleEmoji}>🏥</Text>
              <Badge label="HOSPITAL" type="hospital" />
            </View>
            <Text style={styles.roleTitle}>I'm a Medical Facility</Text>
            <Text style={styles.roleDescription}>
              Broadcast urgent blood requests to verified donors within your immediate radius.
            </Text>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Button
          title="Create New Account"
          variant="primary"
          onPress={() => navigation.navigate('Signup')}
          style={styles.actionBtn}
        />
        <Button
          title="Sign In"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
          style={styles.actionBtn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  pulseContainer: {
    marginBottom: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  taglineRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  cardSection: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  roleCard: {
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleEmoji: {
    fontSize: 24,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actionSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  actionBtn: {
    marginVertical: 6,
  },
});
