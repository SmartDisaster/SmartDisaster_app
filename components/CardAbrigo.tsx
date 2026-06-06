import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Abrigo } from '../types';
import Colors from '../constants/colors';
import Theme from '../constants/theme';
import { getStatusAbrigoLabel } from '../utils/formatters';

interface Props {
  abrigo: Abrigo;
  onPress: () => void;
}

function statusColor(status: string) {
  if (status === 'ATIVO')   return Colors.success;
  if (status === 'LOTADO')  return Colors.primary;
  return Colors.textMuted;
}

export default function CardAbrigo({ abrigo, onPress }: Props) {
  const color = statusColor(abrigo.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* colored left strip */}
      <View style={[styles.strip, { backgroundColor: color }]} />

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.nome} numberOfLines={1}>{abrigo.nome}</Text>
          <View style={[styles.badge, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
            <Text style={[styles.badgeText, { color }]}>
              {getStatusAbrigoLabel(abrigo.status)}
            </Text>
          </View>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>Cap. {abrigo.capacidadeMaxima}</Text>
          </View>
          {abrigo.endereco && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.metaText} numberOfLines={1}>
                {abrigo.endereco.cidade}/{abrigo.endereco.estado}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={Colors.border} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Theme.shadow.sm,
  },
  strip: {
    width: 4,
    alignSelf: 'stretch',
  },
  body: {
    flex: 1,
    padding: Theme.spacing.md,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  nome: {
    flex: 1,
    color: Colors.text,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semiBold,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.semiBold,
    letterSpacing: 0.3,
  },
  meta: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: Colors.textMuted,
    fontSize: Theme.fontSize.xs,
  },
});
