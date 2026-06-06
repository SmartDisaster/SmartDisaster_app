import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Doacao } from '../types';
import Colors from '../constants/colors';
import Theme from '../constants/theme';
import { formatDate, getStatusDoacaoLabel } from '../utils/formatters';

interface Props {
  doacao: Doacao;
}

const TIPO_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Alimentos: 'restaurant-outline',
  Água: 'water-outline',
  Roupas: 'shirt-outline',
  Medicamentos: 'medkit-outline',
  Higiene: 'sparkles-outline',
  Cobertores: 'bed-outline',
  Outros: 'gift-outline',
};

const STATUS_COLOR: Record<string, string> = {
  PENDENTE_ENTREGA: Colors.warning,
  ENTREGUE: Colors.success,
  CANCELADA: Colors.textMuted,
  DISPONIVEL: Colors.success,
};

export default function CardDoacao({ doacao }: Props) {
  const statusColor = STATUS_COLOR[doacao.status] ?? Colors.textMuted;
  const icon = TIPO_ICONS[doacao.tipo] ?? 'gift-outline';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: `${statusColor}18` }]}>
          <Ionicons name={icon} size={22} color={statusColor} />
        </View>
        <View style={styles.titleArea}>
          <Text style={styles.tipo}>{doacao.tipo}</Text>
          {doacao.abrigoNome ? (
            <Text style={styles.abrigo} numberOfLines={1}>{doacao.abrigoNome}</Text>
          ) : (
            <Text style={styles.quantidade}>Qtd: {doacao.quantidade}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusLabel, { color: statusColor }]}>
            {getStatusDoacaoLabel(doacao.status)}
          </Text>
        </View>
      </View>

      {doacao.descricao && (
        <Text style={styles.descricao} numberOfLines={2}>{doacao.descricao}</Text>
      )}

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="layers-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.footerText}>{doacao.quantidade} un.</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.footerText}>{formatDate(doacao.dataDoacao)}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="person-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.footerText} numberOfLines={1}>{doacao.voluntarioNome}</Text>
        </View>
      </View>
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
    color: Colors.textMuted,
    fontSize: Theme.fontSize.sm,
  },
  quantidade: {
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
  descricao: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    flexWrap: 'wrap',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: Theme.fontSize.xs,
  },
});
