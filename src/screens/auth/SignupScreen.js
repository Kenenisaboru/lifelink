import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function SignupScreen({ route, navigation }) {
  const defaultRole = route?.params?.defaultRole || 'donor';
  const { signup, loading } = useAuth();

  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [hospitalName, setHospitalName] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!name.trim()) {
      newErrors.name = role === 'donor' ? 'Full name is required' : 'Contact person name is required';
    }

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

    if (role === 'hospital' && !hospitalName.trim()) {
      newErrors.hospitalName = 'Hospital or medical facility name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    try {
      await signup({
        role,
        name: name.trim(),
        email: email.trim(),
        password,
        bloodType: role === 'donor' ? bloodType : undefined,
        hospitalName: role === 'hospital' ? hospitalName.trim() : undefined,
      });
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed. Please try again.' });
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join LifeLink to save lives or request emergency blood</Text>
      </View>

      {/* Role Switcher */}
      <View style={styles.roleToggleContainer}>
        <TouchableOpacity
          style={[styles.roleTab, role === 'donor' && styles.activeDonorTab]}
          onPress={() => setRole('donor')}
        >
          <Text style={[styles.roleTabText, role === 'donor' && styles.activeTabText]}>
            🙋‍♂️ Donor
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleTab, role === 'hospital' && styles.activeHospitalTab]}
          onPress={() => setRole('hospital')}
        >
          <Text style={[styles.roleTabText, role === 'hospital' && styles.activeTabText]}>
            🏥 Hospital
          </Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.formCard}>
        <Input
          label={role === 'donor' ? 'Full Name' : 'Contact Person Name'}
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (errors.name) setErrors({ ...errors, name: null });
          }}
          placeholder={role === 'donor' ? 'e.g. Jane Doe' : 'e.g. Dr. John Smith'}
          error={errors.name}
        />

        {role === 'hospital' && (
          <Input
            label="Hospital / Medical Center Name"
            value={hospitalName}
            onChangeText={(val) => {
              setHospitalName(val);
              if (errors.hospitalName) setErrors({ ...errors, hospitalName: null });
            }}
            placeholder="e.g. Nairobi National Hospital"
            error={errors.hospitalName}
          />
        )}

        {role === 'donor' && (
          <View style={styles.bloodTypeSection}>
            <Text style={styles.fieldLabel}>Blood Type</Text>
            <View style={styles.bloodTypeGrid}>
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
        )}

        <Input
          label="Email Address"
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (errors.email) setErrors({ ...errors, email: null });
          }}
          placeholder="e.g. name@domain.com"
          keyboardType="email-address"
          error={errors.email}
        />

        <Input
          label="Password (min 6 chars)"
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
          title={`Register as ${role === 'donor' ? 'Donor' : 'Hospital'}`}
          onPress={handleSignup}
          loading={loading}
          variant={role === 'donor' ? 'primary' : 'secondary'}
          style={styles.submitBtn}
        />
      </Card>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already registered?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}> Log In</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeDonorTab: {
    backgroundColor: COLORS.primary,
  },
  activeHospitalTab: {
    backgroundColor: COLORS.secondary,
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  formCard: {
    padding: 18,
  },
  bloodTypeSection: {
    marginVertical: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  bloodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  bloodChip: {
    width: '23%',
    margin: '1%',
    paddingVertical: 10,
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
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  bloodChipTextSelected: {
    color: '#FFFFFF',
  },
  submitBtn: {
    marginTop: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
