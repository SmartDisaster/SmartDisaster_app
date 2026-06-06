import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAbrigoById } from '../../services/abrigoService';
import { getVitimas } from '../../services/vitimaService';
import { getNecessidades } from '../../services/necessidadeService';
import { Abrigo, Vitima, Necessidade } from '../../types';
import Loading from '../../components/Loading';
import Header from '../../components/Header';
import CardVitima from '../../components/CardVitima';
import CardNecessidade from '../../components/CardNecessidade';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';
import { getStatusAbrigoLabel } from '../../utils/formatters';

function InfoRow({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrapper}>
        <Ionicons name={icon} size={16} color={Colors.textSecondary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '-'}</Text>
      </View>
    </View>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'ATIVO': return Colors.statusAtivo;
    case 'LOTADO': return Colors.statusLotado;
    default: return Colors.statusInativo;
  }
}

export default function AbrigoDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [abrigo, setAbrigo] = useState<Abrigo | null>(null);
  const [vitimas, setVitimas] = useState<Vitima[]>([]);
  const [necessidades, setNecessidades] = useState<Necessidade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const abrigoId = Number(id);
      if (isNaN(abrigoId)) { setLoading(false); return; }
      try {
        const [abrigoData, vitimasData, necessidadesData] = await Promise.all([
          getAbrigoById(abrigoId),
          getVitimas(0, 50, abrigoId),
          getNecessidades(0, 50),
        ]);
        setAbrigo(abrigoData);
        setVitimas(vitimasData.content);
        setNecessidades(necessidadesData.content.filter((n) => n.abrigoId === abrigoId));
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar os detalhes do abrigo.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <Loading fullScreen />;
  if (!abrigo) return (
    <View style={styles.container}>
      <Header title="Detalhes" showBack />
      <View style={styles.centerContent}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.danger} />
        <Text style={styles.errorText}>Abrigo não encontrado</Text>
      </View>
    </View>
  );

  const statusColor = getStatusColor(abrigo.status);
  const { endereco } = abrigo;

  return (
    <View style={styles.container}>
      <Header
        title={abrigo.nome}
        showBack
        rightAction={{
          icon: 'create-outline',
          onPress: () =>
            router.push({ pathname: '/abrigos/cadastro', params: { id: abrigo.id } }),
        }}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22`, borderColor: `${statusColor}44` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusAbrigoLabel(abrigo.status)}
            </Text>
          </View>
          <View style={styles.capacidadeInfo}>
            <Ionicons name="people" size={20} color={Colors.secondary} />
            <Text style={styles.capacidadeLabel}>Capacidade Máxima</Text>
            <Text style={styles.capacidadeValue}>{abrigo.capacidadeMaxima}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Abrigo</Text>
          <View style={styles.infoCard}>
            {endereco && (
              <>
                <InfoRow icon="navigate-outline" label="Rua" value={`${endereco.rua}, ${endereco.numero}`} />
                <View style={styles.divider} />
                <InfoRow icon="map-outline" label="Bairro" value={endereco.bairro} />
                <View style={styles.divider} />
                <InfoRow icon="business-outline" label="Cidade" value={`${endereco.cidade} — ${endereco.estado}`} />
                <View style={styles.divider} />
                <InfoRow icon="mail-outline" label="CEP" value={endereco.cep} />
              </>
            )}
            {abrigo.latitude && abrigo.longitude && (
              <>
                <View style={styles.divider} />
                <InfoRow
                  icon="location-outline"
                  label="Coordenadas"
                  value={`${abrigo.latitude.toFixed(6)}, ${abrigo.longitude.toFixed(6)}`}
                />
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Necessidades ({necessidades.length})</Text>
            <View style={[styles.badge, necessidades.some((n) => n.status === 'PENDENTE') && styles.badgeUrgent]}>
              <Text style={styles.badgeText}>
                {necessidades.filter((n) => n.status === 'PENDENTE').length} pendentes
              </Text>
            </View>
          </View>
          {necessidades.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="checkmark-circle-outline" size={32} color={Colors.success} />
              <Text style={styles.emptyText}>Sem necessidades no momento</Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {necessidades.map((n) => <CardNecessidade key={n.id} necessidade={n} />)}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vítimas Acolhidas ({vitimas.length})</Text>
          {vitimas.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="people-outline" size={32} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma vítima vinculada</Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {vitimas.map((v) => <CardVitima key={v.id} vitima={v} />)}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Theme.spacing.md, gap: Theme.spacing.lg, paddingBottom: 40 },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Theme.spacing.md },
  errorText: { color: Colors.textSecondary, fontSize: Theme.fontSize.md },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semiBold },
  capacidadeInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  capacidadeLabel: { color: Colors.textSecondary, fontSize: Theme.fontSize.sm },
  capacidadeValue: { color: Colors.text, fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold },
  section: { gap: Theme.spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
  sectionTitle: { color: Colors.textSecondary, fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.semiBold, letterSpacing: 1, textTransform: 'uppercase', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Theme.borderRadius.full, backgroundColor: Colors.surface2 },
  badgeUrgent: { backgroundColor: Colors.warningBg },
  badgeText: { color: Colors.textSecondary, fontSize: Theme.fontSize.xs },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, gap: Theme.spacing.md },
  infoIconWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { color: Colors.textMuted, fontSize: Theme.fontSize.xs, letterSpacing: 0.5 },
  infoValue: { color: Colors.text, fontSize: Theme.fontSize.md, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Theme.spacing.md },
  emptySection: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    gap: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: { color: Colors.textSecondary, fontSize: Theme.fontSize.sm },
  cardList: { gap: Theme.spacing.sm },
});
