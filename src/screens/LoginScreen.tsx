import React, { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Store, Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { Button, Input } from '../components';
import { colors } from '../theme/colors';
import { raisedShadow } from '../theme/shadow';

type Mode = 'login' | 'register';

export function LoginScreen() {
  const { login, register, isSubmitting } = useAuthStore();
  const [mode, setMode] = useState<Mode>('login');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 8, tension: 60 }),
    ]).start();
  }, [fade, slide]);

  function toggleMode() {
    setError(null);
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
  }

  async function handleSubmit() {
    setError(null);

    if (mode === 'register' && !storeName.trim()) {
      setError('Enter your store name.');
      return;
    }

    const result =
      mode === 'login' ? await login(email, password) : await register(email, password, storeName);

    if (!result.success) {
      setError(result.error ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <LinearGradient colors={['#4338CA', '#4F46E5', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -80,
          right: -60,
          height: 240,
          width: 240,
          borderRadius: 120,
          backgroundColor: 'rgba(255,255,255,0.08)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -100,
          left: -80,
          height: 280,
          width: 280,
          borderRadius: 140,
          backgroundColor: 'rgba(255,255,255,0.06)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: '28%',
          left: -40,
          height: 120,
          width: 120,
          borderRadius: 60,
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}
      />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
            <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
              <View className="items-center">
                <View
                  className="h-20 w-20 items-center justify-center rounded-3xl bg-white"
                  style={{
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.25,
                    shadowRadius: 20,
                    elevation: 8,
                  }}
                >
                  <Store size={36} color={colors.primary} strokeWidth={2} />
                </View>
                <Text className="mt-5 text-[28px] font-extrabold font-jakarta-extrabold tracking-tight text-white">
                  Sari-Sari Store
                </Text>
                <Text className="mt-1 text-[14px] font-medium font-jakarta-medium text-white/75">
                  POS &amp; Inventory Tracker
                </Text>
              </View>

              <View className="mt-8 gap-4 rounded-[28px] bg-card p-6" style={raisedShadow}>
                <View>
                  <Text className="text-[20px] font-bold font-jakarta-bold text-textPrimary">
                    {mode === 'login' ? 'Welcome back' : 'Create your account'}
                  </Text>
                  <Text className="mt-1 text-[13px] font-jakarta text-textSecondary">
                    {mode === 'login' ? 'Sign in to manage your store' : 'Set up your store in a few seconds'}
                  </Text>
                </View>

                {error ? (
                  <View className="rounded-xl bg-dangerLight px-4 py-3">
                    <Text className="text-[13px] font-medium font-jakarta-medium text-danger">{error}</Text>
                  </View>
                ) : null}

                {mode === 'register' ? (
                  <Input
                    label="Store Name"
                    placeholder="Aling Nena's Store"
                    value={storeName}
                    onChangeText={setStoreName}
                    autoCorrect={false}
                    rightElement={<User size={18} color="#94A3B8" />}
                  />
                ) : null}

                <Input
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  rightElement={<Mail size={18} color="#94A3B8" />}
                />

                <Input
                  label="Password"
                  placeholder={mode === 'login' ? 'Enter your password' : 'At least 6 characters'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  rightElement={
                    <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
                      {showPassword ? (
                        <EyeOff size={18} color="#94A3B8" />
                      ) : (
                        <Eye size={18} color="#94A3B8" />
                      )}
                    </Pressable>
                  }
                />

                <View className="mt-1">
                  <Button
                    title={mode === 'login' ? 'Log In' : 'Create Account'}
                    onPress={handleSubmit}
                    loading={isSubmitting}
                  />
                </View>

                <Pressable onPress={toggleMode} className="items-center py-1">
                  <Text className="text-[13px] font-medium font-jakarta-medium text-textSecondary">
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <Text className="font-semibold font-jakarta-semibold text-primary">
                      {mode === 'login' ? 'Sign Up' : 'Log In'}
                    </Text>
                  </Text>
                </Pressable>

                <View className="flex-row items-center gap-2 rounded-xl bg-infoLight px-4 py-3">
                  <Lock size={14} color={colors.info} />
                  <Text className="flex-1 text-[12px] font-medium font-jakarta-medium text-info">
                    Your data is stored securely and only visible to you.
                  </Text>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
