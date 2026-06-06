import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

export default function BoasVindasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  async function handleStart() {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    router.replace('/login');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.imageArea}>
        <Image
          source={require('../assets/boasvindas.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textArea}>
        <Text style={styles.title}>Bem-vindo ao{'\n'}SmartDisaster</Text>
        <Text style={styles.subtitle}>
          Gestão inteligente de abrigos, vítimas e doações em situações de emergência.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleStart} activeOpacity={0.85}>
        <Text style={styles.buttonText}>Começar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
  },
  imageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: Theme.spacing.xl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textArea: {
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: Theme.fontWeight.extraBold,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Theme.spacing.md,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Theme.borderRadius.md,
    height: 56,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semiBold,
    letterSpacing: 0.3,
  },
});
