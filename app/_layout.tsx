import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import Colors from '../constants/colors';
import Loading from '../components/Loading';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    SplashScreen.hideAsync();

    const inTabsGroup = segments[0] === '(tabs)';
    const onLogin = segments[0] === 'login';

    if (!user && inTabsGroup) {
      router.replace('/login');
    } else if (user && onLogin) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return <Loading fullScreen message="Iniciando SmartDisaster..." />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="boasvindas" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="abrigos/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="vitimas/cadastro" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="doacoes/cadastro" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="doacoes/novo/[abrigoId]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="doacoes/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="sobre" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" backgroundColor={Colors.background} />
          <RootLayoutNav />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
