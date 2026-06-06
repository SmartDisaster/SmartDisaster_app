import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Vitima } from '../types';
import Colors from '../constants/colors';
import Theme from '../constants/theme';
import { formatDate, formatCpf } from '../utils/formatters';

interface Props {
  vitima: Vitima;
}

export default function CardVitima({ vitima }: Props) {
  const initials = vitima.nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.nome} numberOfLines={1}>{vitima.nome}</Text>
        <Text style={styles.cpf}>{formatCpf(vitima.cpf)}</Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="home-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>{vitima.abrigoNome}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>{formatDate(vitima.dataNascimento)}</Text>
          </View>
        </View>

        {vitima.condicaoSaude && (
          <View style={styles.healthTag}>
            <Ionicons name="medical-outline" size={11} color={Colors.accent} />
            <Text style={styles.healthText} numberOfLines={1}>{vitima.condicaoSaude}</Text>
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={16} color={Colors.border} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Theme.shadow.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}20`,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  initials: {
    color: Colors.primary,
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 0.5,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  nome: {
    color: Colors.text,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semiBold,
  },
  cpf: {
    color: Colors.textMuted,
    fontSize: Theme.fontSize.xs,
    letterSpacing: 0.5,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    color: Colors.textMuted,
    fontSize: Theme.fontSize.xs,
  },
  healthTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.accent}15`,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  healthText: {
    color: Colors.accentLight,
    fontSize: Theme.fontSize.xs,
  },
});
