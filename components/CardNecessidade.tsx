import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Necessidade } from '../types';
import Colors from '../constants/colors';
import Theme from '../constants/theme';
import { getStatusNecessidadeLabel } from '../utils/formatters';

interface Props {
  necessidade: Necessidade;
}

export default function CardNecessidade({ necessidade }: Props) {
  const isPendente = necessidade.status === 'PENDENTE';
  const statusColor = isPendente ? Colors.statusPendente : Colors.statusAtendida;

  return (
    <View style={[styles.card, isPendente && styles.urgentBorder]}>
      <View style={styles.header}>
        <View style={[styles.iconWrapper, isPendente ? styles.iconUrgent : styles.iconDone]}>
          <Ionicons
            name={isPendente ? 'alert-circle-outline' : 'checkmark-circle-outline'}
            size={22}
            color={statusColor}
          />
        </View>
        <View style={styles.titleArea}>
          <Text style={styles.tipo}>{necessidade.tipo}</Text>
          <Text style={styles.abrigo} numberOfLines={1}>{necessidade.abrigoNome}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {getStatusNecessidadeLabel(necessidade.status)}
          </Text>
        </View>
      </View>
      <View style={styles.quantidadeRow}>
        <Text style={styles.quantidadeLabel}>Quantidade necessária</Text>
        <Text style={[styles.quantidadeValue, isPendente && { color: Colors.warning }]}>
          {necessidade.quantidadeNecessaria}
        </Text>
      </View>
      {necessidade.descricao && (
        <Text style={styles.descricao} numberOfLines={2}>{necessidade.descricao}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Theme.spacing.sm,
    ...Theme.shadow.sm,
  },
  urgentBorder: {
    borderColor: `${Colors.warning}44`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUrgent: {
    backgroundColor: Colors.warningBg,
  },
  iconDone: {
    backgroundColor: Colors.successBg,
  },
  titleArea: {
    flex: 1,
    gap: 2,
  },
  tipo: {
    color: Colors.text,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semiBold,
  },
  abrigo: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
  },
  statusLabel: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.semiBold,
    letterSpacing: 0.5,
  },
  quantidadeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
  },
  quantidadeLabel: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.sm,
  },
  quantidadeValue: {
    color: Colors.text,
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
  },
  descricao: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.sm,
    lineHeight: 20,
  },
});
