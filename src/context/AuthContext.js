import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@lifelink_user_session';

const AuthContext = createContext();

// Sample pre-configured demo users for judges/fast testing
export const DEMO_USERS = {
  donor: {
    uid: 'donor-demo-123',
    email: 'donor@demo.com',
    name: 'Sarah Connor',
    role: 'donor',
    bloodType: 'O+',
    available: true,
    location: { lat: -1.286389, lng: 36.817223, city: 'Nairobi CBD' }, // Nairobi center
  },
  hospital: {
    uid: 'hosp-demo-456',
    email: 'hospital@demo.com',
    name: 'Dr. James Kariuki',
    role: 'hospital',
    hospitalName: 'Nairobi National Hospital',
    location: { lat: -1.2921, lng: 36.8219, city: 'Upper Hill, Nairobi' },
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore session on app relaunch
  useEffect(() => {
    async function loadSession() {
      try {
        const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.warn('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  // Save session state to AsyncStorage
  const saveSession = async (userData) => {
    setUser(userData);
    setAuthError(null);
    try {
      if (userData) {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (err) {
      console.warn('AsyncStorage error:', err);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);

    // Simulate network delay
    await new Promise((res) => setTimeout(res, 600));

    // Handle demo logins or form logins
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail === 'donor@demo.com') {
      await saveSession(DEMO_USERS.donor);
      setLoading(false);
      return DEMO_USERS.donor;
    }

    if (trimmedEmail === 'hospital@demo.com') {
      await saveSession(DEMO_USERS.hospital);
      setLoading(false);
      return DEMO_USERS.hospital;
    }

    // Default mock user if custom email entered
    const isDonor = !trimmedEmail.includes('hospital');
    const newUser = {
      uid: 'user-' + Date.now(),
      email: trimmedEmail,
      name: trimmedEmail.split('@')[0],
      role: isDonor ? 'donor' : 'hospital',
      bloodType: isDonor ? 'A+' : undefined,
      hospitalName: !isDonor ? 'General Emergency Hospital' : undefined,
      available: true,
      location: { lat: -1.286389, lng: 36.817223, city: 'Nairobi' },
    };

    await saveSession(newUser);
    setLoading(false);
    return newUser;
  };

  const signup = async (userData) => {
    setLoading(true);
    setAuthError(null);

    await new Promise((res) => setTimeout(res, 800));

    const newUser = {
      uid: 'user-' + Date.now(),
      email: userData.email.trim().toLowerCase(),
      name: userData.name,
      role: userData.role, // 'donor' | 'hospital'
      bloodType: userData.bloodType || 'O+',
      hospitalName: userData.hospitalName || '',
      available: userData.role === 'donor' ? true : undefined,
      location: userData.location || { lat: -1.286389, lng: 36.817223, city: 'Nairobi' },
    };

    await saveSession(newUser);
    setLoading(false);
    return newUser;
  };

  const logout = async () => {
    setLoading(true);
    await saveSession(null);
    setLoading(false);
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    await saveSession(updated);
  };

  const toggleAvailability = async () => {
    if (!user || user.role !== 'donor') return;
    const updated = { ...user, available: !user.available };
    await saveSession(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        setAuthError,
        login,
        signup,
        logout,
        updateProfile,
        toggleAvailability,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
