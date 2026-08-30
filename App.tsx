import './global.css';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { AppStoreProvider, useAppStore } from './src/store/appStore';
import { AuthStoreProvider, useAuthStore } from './src/store/authStore';
import { ModalStoreProvider } from './src/store/modalStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoginScreen } from './src/screens/LoginScreen';
import { Button } from './src/components';
import { colors } from './src/theme/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

function FullScreenStatus({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-8">{children}</View>
  );
}

function AuthedApp() {
  const { isLoading, loadError, refresh } = useAppStore();

  if (isLoading) {
    return (
      <FullScreenStatus>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-[14px] font-medium font-jakarta-medium text-textSecondary">
          Loading your store...
        </Text>
      </FullScreenStatus>
    );
  }

  if (loadError) {
    return (
      <FullScreenStatus>
        <Text className="text-center text-[16px] font-bold font-jakarta-bold text-textPrimary">
          Couldn't load your data
        </Text>
        <Text className="mt-1.5 text-center text-[14px] text-textSecondary">{loadError}</Text>
        <View className="mt-5 w-full max-w-[200px]">
          <Button title="Try Again" onPress={refresh} size="md" />
        </View>
      </FullScreenStatus>
    );
  }

  return <AppNavigator />;
}

function RootContent() {
  const { isAuthenticated, isBootstrapping } = useAuthStore();

  useEffect(() => {
    if (!isBootstrapping) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isBootstrapping]);

  if (isBootstrapping) {
    return null;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <AppStoreProvider>
      <AuthedApp />
    </AppStoreProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ModalStoreProvider>
        <AuthStoreProvider>
          <StatusBar style="dark" />
          <RootContent />
        </AuthStoreProvider>
      </ModalStoreProvider>
    </SafeAreaProvider>
  );
}
