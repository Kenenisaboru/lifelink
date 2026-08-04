import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login(email, password);
    } catch (err) {
      setErrors({ form: err.message || 'Login failed. Please try again.' });
    }
  };

  const fillDemo = (role) => {
    if (role === 'donor') {
      setEmail('donor@demo.com');
      setPassword('password123');
    } else {
      setEmail('hospital@demo.com');
      setPassword('password123');
    }
    setErrors({});
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to access your LifeLink emergency portal</Text>
      </View>

      {errors.form ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errors.form}</Text>
        </View>
      ) : null}

      <Card style={styles.formCard}>
        <Input
          label="Email Address"
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (errors.email) setErrors({ ...errors, email: null });
          }}
          placeholder="e.g. donor@demo.com"
          keyboardType="email-address"
          error={errors.email}
        />

        <Input
          label="Password"
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            if (errors.password) setErrors({ ...errors, password: null });
          }}
          placeholder="••••••••"
          secureTextEntry
          error={errors.password}
        />

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          style={styles.submitBtn}
        />
      </Card>

      {/* Quick Autofill Helper */}
      <View style={styles.demoFillSection}>
        <Text style={styles.demoFillTitle}>Quick Demo Credentials:</Text>
        <View style={styles.demoFillRow}>
          <TouchableOpacity style={styles.demoPill} onPress={() => fillDemo('donor')}>
            <Text style={styles.demoPillText}>Fill Donor Demo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.demoPill} onPress={() => fillDemo('hospital')}>
            <Text style={styles.demoPillText}>Fill Hospital Demo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLink}> Create Account</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  errorBanner: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.error,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
    padding: 20,
  },
  submitBtn: {
    marginTop: 12,
  },
  demoFillSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  demoFillTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  demoFillRow: {
    flexDirection: 'row',
  },
  demoPill: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoPillText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  signupLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
