import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { COLORS } from '../../theme/colors';
import { AuthStackParams } from '../../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<AuthStackParams, 'Signup'>;

export default function SignupScreen() {
  const navigation = useNavigation<NavProp>();
  const { signup } = useAuth();
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    try {
      setLoading(true);
      await signup({ fullName: name.trim(), email: email.trim().toLowerCase(), password });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Signup Failed', err.message ?? 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label,
    icon,
    value,
    onChange,
    placeholder,
    secure,
    keyboard,
    field,
    autoComplete,
  }: {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    secure?: boolean;
    keyboard?: any;
    field: string;
    autoComplete?: any;
  }) => (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.input,
            borderColor: errors[field] ? COLORS.danger : colors.inputBorder,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={colors.textMuted} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          value={value}
          onChangeText={(t) => {
            onChange(t);
            setErrors((e) => ({ ...e, [field]: '' }));
          }}
          secureTextEntry={secure && !showPassword}
          keyboardType={keyboard}
          autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
          autoComplete={autoComplete}
          returnKeyType="next"
        />
        {secure && (
          <TouchableOpacity onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.logoCircle}>
            <Ionicons name="person-add" size={32} color="#fff" />
          </View>
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.tagline}>Join thousands of smart spenders</Text>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <Text style={[styles.heading, { color: colors.text }]}>Let's get started</Text>
            <Text style={[styles.subheading, { color: colors.textSecondary }]}>
              Fill in the details below to create your account
            </Text>

            <Field
              label="Full Name"
              icon="person-outline"
              value={name}
              onChange={setName}
              placeholder="John Doe"
              field="name"
              autoComplete="name"
            />
            <Field
              label="Email"
              icon="mail-outline"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              keyboard="email-address"
              field="email"
              autoComplete="email"
            />
            <Field
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChange={setPassword}
              placeholder="Min. 8 characters"
              secure
              field="password"
              autoComplete="new-password"
            />
            <Field
              label="Confirm Password"
              icon="shield-checkmark-outline"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat password"
              secure
              field="confirmPassword"
            />

            <TouchableOpacity
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
              style={{ marginTop: 8 }}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={[styles.button, loading && { opacity: 0.7 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <Text style={styles.buttonText}>Creating account…</Text>
                ) : (
                  <>
                    <Ionicons name="rocket-outline" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Create Account</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.loginLinkText, { color: colors.textSecondary }]}>
                Already have an account?{' '}
                <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 36,
    alignItems: 'center',
  },
  headerContent: { alignItems: 'center', gap: 10, width: '100%', paddingHorizontal: 24 },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  body: { padding: 24, paddingTop: 28 },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subheading: { fontSize: 14, marginBottom: 24 },
  fieldWrapper: { marginBottom: 14, gap: 6 },
  label: { fontSize: 13, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    gap: 8,
  },
  inputIcon: { flexShrink: 0 },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  errorText: { fontSize: 12, color: COLORS.danger, marginTop: 2 },
  button: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  loginLink: { alignItems: 'center', marginTop: 20, padding: 8 },
  loginLinkText: { fontSize: 14 },
});
