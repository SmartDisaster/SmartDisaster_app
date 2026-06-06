import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { register } from '../services/authService';
import { extractErrorMessage } from '../hooks/useApi';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

interface FormState {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
}

interface FormErrors {
  nome?: string;
  email?: string;
  telefone?: string;
  senha?: string;
  confirmarSenha?: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<FormState>({ nome: '', email: '', telefone: '', senha: '', confirmarSenha: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.nome.trim()) next.nome = 'Nome obrigatório';
    else if (form.nome.trim().length < 3) next.nome = 'Nome deve ter pelo menos 3 caracteres';
    if (!form.email.trim()) next.email = 'E-mail obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'E-mail inválido';
    if (!form.telefone.trim()) next.telefone = 'Telefone obrigatório';
    if (!form.senha) next.senha = 'Senha obrigatória';
    else if (form.senha.length < 6) next.senha = 'Mínimo 6 caracteres';
    if (!form.confirmarSenha) next.confirmarSenha = 'Confirme sua senha';
    else if (form.senha !== form.confirmarSenha) next.confirmarSenha = 'As senhas não coincidem';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        role: 'VOLUNTARIO',
        telefone: form.telefone.trim(),
      });
      Alert.alert('Cadastro realizado!', 'Sua conta foi criada. Faça login para continuar.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch (err) {
      const message = extractErrorMessage(err);
      Alert.alert('Erro ao cadastrar', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandArea}>
          <View style={styles.logoCircle}>
            <Ionicons name="person-add" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Cadastre-se como voluntário no SmartDisaster</Text>
        </View>

        <View style={styles.card}>
          <CustomInput
            label="Nome Completo"
            placeholder="Seu nome completo"
            value={form.nome}
            onChangeText={(t) => set('nome', t)}
            error={errors.nome}
            icon="person-outline"
            autoCapitalize="words"
          />
          <CustomInput
            label="E-mail"
            placeholder="seu@email.com"
            value={form.email}
            onChangeText={(t) => set('email', t)}
            error={errors.email}
            icon="mail-outline"
            keyboardType="email-address"
            autoComplete="email"
          />
          <CustomInput
            label="Telefone"
            placeholder="(11) 99999-9999"
            value={form.telefone}
            onChangeText={(t) => set('telefone', t)}
            error={errors.telefone}
            icon="call-outline"
            keyboardType="phone-pad"
          />
          <CustomInput
            label="Senha"
            placeholder="••••••••"
            value={form.senha}
            onChangeText={(t) => set('senha', t)}
            error={errors.senha}
            icon="lock-closed-outline"
            isPassword
          />
          <CustomInput
            label="Confirmar Senha"
            placeholder="••••••••"
            value={form.confirmarSenha}
            onChangeText={(t) => set('confirmarSenha', t)}
            error={errors.confirmarSenha}
            icon="lock-closed-outline"
            isPassword
          />

          <CustomButton
            label="Criar Conta"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />
        </View>

        <CustomButton
          label="Já tenho conta — Entrar"
          onPress={() => router.back()}
          variant="outline"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.lg,
  },
  brandArea: {
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dangerBg,
    borderWidth: 2,
    borderColor: `${Colors.primary}44`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
    ...Theme.shadow.md,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: Theme.fontWeight.extraBold,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.sm,
    textAlign: 'center',
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
  registerButton: { marginTop: Theme.spacing.sm },
});
