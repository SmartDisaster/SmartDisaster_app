import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { extractErrorMessage } from '../hooks/useApi';
import { checkApiStatus } from '../services/apiStatus';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkApiStatus().then((s) => setApiOnline(s.online));
  }, []);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'E-mail obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'E-mail inválido';
    if (!senha.trim()) next.senha = 'Senha obrigatória';
    else if (senha.length < 6) next.senha = 'Mínimo 6 caracteres';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), senha);
    } catch (err) {
      const message = extractErrorMessage(err);
      Alert.alert('Falha no login', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* API Status Banner */}
        <View style={[styles.statusBanner, apiOnline === false && styles.statusBannerOffline]}>
          <View style={[styles.statusDot, apiOnline === false ? styles.statusDotOffline : styles.statusDotOnline]} />
          <Text style={[styles.statusText, apiOnline === false && styles.statusTextOffline]}>
            {apiOnline === null ? 'Verificando API...' : apiOnline ? 'API Online' : 'API Offline'}
          </Text>
        </View>

        <View style={styles.brandArea}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <Text style={styles.appName}>SmartDisaster</Text>
          <Text style={styles.tagline}>Plataforma de Gestão de Emergências</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesso ao Sistema</Text>
          <Text style={styles.cardSubtitle}>Entre com suas credenciais para continuar</Text>

          <View style={styles.form}>
            <CustomInput
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
              error={errors.email}
              icon="mail-outline"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <CustomInput
              label="Senha"
              placeholder="••••••••"
              value={senha}
              onChangeText={(t) => { setSenha(t); setErrors((e) => ({ ...e, senha: undefined })); }}
              error={errors.senha}
              icon="lock-closed-outline"
              isPassword
              autoComplete="password"
              textContentType="password"
            />
            <CustomButton
              label="Entrar"
              onPress={handleLogin}
              loading={loading}
              style={[styles.loginButton, styles.loginButtonBlue]}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/register')} activeOpacity={0.7}>
          <Text style={styles.registerLinkText}>Não tem conta? <Text style={styles.registerLinkBold}>Criar conta</Text></Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Ionicons name="warning-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.footerText}>
            Sistema restrito a operadores autorizados
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.xl,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.full ?? 999,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: `${Colors.success ?? '#22c55e'}33`,
  },
  statusBannerOffline: {
    borderColor: `${Colors.primary}33`,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotOnline: {
    backgroundColor: Colors.success ?? '#22c55e',
  },
  statusDotOffline: {
    backgroundColor: Colors.primary,
  },
  statusText: {
    color: Colors.success ?? '#22c55e',
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.semiBold,
  },
  statusTextOffline: {
    color: Colors.primary,
  },
  brandArea: {
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  logoImg: {
    width: 160,
    height: 160,
    marginBottom: Theme.spacing.sm,
  },
  appName: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: Theme.fontWeight.extraBold,
    letterSpacing: 1,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.sm,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Theme.spacing.md,
    ...Theme.shadow.md,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
  },
  cardSubtitle: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.sm,
    marginBottom: Theme.spacing.sm,
  },
  form: {
    gap: Theme.spacing.md,
  },
  loginButton: {
    marginTop: Theme.spacing.sm,
  },
  loginButtonBlue: {
    backgroundColor: Colors.primary,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  registerLinkText: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.sm,
  },
  registerLinkBold: {
    color: Colors.primary,
    fontWeight: Theme.fontWeight.semiBold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: Theme.fontSize.xs,
    textAlign: 'center',
  },
});
