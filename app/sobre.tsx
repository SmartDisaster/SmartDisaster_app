import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

const MEMBERS = [
  {
    name: 'Pedro Vaz',
    role: 'Desenvolvedor Mobile',
    icon: 'phone-portrait-outline' as const,
  },
  {
    name: 'João Victor Resende',
    role: 'Desenvolvedor Backend',
    icon: 'server-outline' as const,
  },
];

const FEATURES = [
  { icon: 'business-outline' as const, label: 'Gestão de Abrigos' },
  { icon: 'people-outline' as const, label: 'Cadastro de Vítimas' },
  { icon: 'heart-outline' as const, label: 'Controle de Doações' },
  { icon: 'warning-outline' as const, label: 'Sistema de Alertas' },
];

export default function SobreScreen() {
  return (
    <View style={styles.container}>
      <Header title="Sobre" showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image source={require('../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
          <Text style={styles.appName}>SmartDisaster</Text>
          <Text style={styles.appTagline}>Gestão inteligente em situações de desastre</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o Projeto</Text>
          <View style={styles.card}>
            <Text style={styles.description}>
              O SmartDisaster é uma plataforma mobile desenvolvida para auxiliar equipes de resposta
              a desastres naturais, centralizando informações sobre abrigos, vítimas, doações e alertas
              em tempo real.
            </Text>
            <Text style={[styles.description, { marginBottom: 0 }]}>
              O objetivo é agilizar o atendimento humanitário e facilitar a coordenação entre
              voluntários, autoridades e afetados durante emergências.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Funcionalidades</Text>
          <View style={styles.card}>
            {FEATURES.map((f, i) => (
              <View key={f.label} style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureDivider]}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon} size={16} color={Colors.primary} />
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipe</Text>
          {MEMBERS.map((m) => (
            <View key={m.name} style={[styles.card, styles.memberCard]}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitials}>
                  {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{m.name}</Text>
                <View style={styles.memberRoleRow}>
                  <Ionicons name={m.icon} size={12} color={Colors.textMuted} />
                  <Text style={styles.memberRole}>{m.role}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Versão 1.0.0</Text>
          <Text style={styles.footerText}>Desenvolvido com React Native & Expo</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Theme.spacing.md, paddingTop: Theme.spacing.lg, paddingBottom: 48 },

  hero: { alignItems: 'center', marginBottom: Theme.spacing.lg },
  logoImg: {
    width: 90,
    height: 90,
    marginBottom: Theme.spacing.md,
  },
  appName: {
    color: Colors.text,
    fontSize: Theme.fontSize.xxxl,
    fontWeight: Theme.fontWeight.extraBold,
    letterSpacing: -0.5,
  },
  appTagline: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.sm,
    marginTop: 6,
    textAlign: 'center',
  },

  section: { marginBottom: Theme.spacing.lg },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.semiBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Theme.spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.sm,
    lineHeight: 20,
    marginBottom: Theme.spacing.sm,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    paddingVertical: 10,
  },
  featureDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    color: Colors.text,
    fontSize: Theme.fontSize.sm,
  },

  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}20`,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  memberInitials: {
    color: Colors.primary,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
  },
  memberInfo: { flex: 1, gap: 4 },
  memberName: {
    color: Colors.text,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semiBold,
  },
  memberRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberRole: {
    color: Colors.textMuted,
    fontSize: Theme.fontSize.xs,
  },

  footer: { alignItems: 'center', gap: 4, marginTop: Theme.spacing.sm },
  footerText: {
    color: Colors.textMuted,
    fontSize: Theme.fontSize.xs,
  },
});
