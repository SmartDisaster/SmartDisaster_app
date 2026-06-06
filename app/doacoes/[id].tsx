import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getDoacaoById, marcarEntregue, cancelarDoacao, deleteDoacao } from '../../services/doacaoService';
import { Doacao } from '../../types';
import Header from '../../components/Header';
import CustomButton from '../../components/CustomButton';
import Loading from '../../components/Loading';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';
import { formatDate, getStatusDoacaoLabel } from '../../utils/formatters';

const STATUS_COLOR: Record<string, string> = {
  PENDENTE_ENTREGA: Colors.warning,
  ENTREGUE: Colors.success,
  CANCELADA: Colors.textMuted,
  DISPONIVEL: Colors.success,
};

export default function DoacaoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [doacao, setDoacao] = useState<Doacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) { setLoading(false); return; }
    getDoacaoById(numId)
      .then(setDoacao)
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar a doação.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleMarcarEntregue() {
    if (!doacao) return;
    Alert.alert('Confirmar entrega', 'Marcar esta doação como entregue?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          setUpdating(true);
          try {
            const updated = await marcarEntregue(doacao.id);
            setDoacao(updated);
            Alert.alert('Sucesso', 'Doação marcada como entregue.');
          } catch {
            Alert.alert('Erro', 'Não foi possível atualizar o status.');
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  }

  async function handleCancelar() {
    if (!doacao) return;
    Alert.alert('Cancelar doação', 'Deseja cancelar esta doação?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, cancelar',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            const updated = await cancelarDoacao(doacao.id);
            setDoacao(updated);
          } catch {
            Alert.alert('Erro', 'Não foi possível cancelar a doação.');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  }

  async function handleDelete() {
    if (!doacao) return;
    Alert.alert('Excluir Doação', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteDoacao(doacao.id);
            Alert.alert('Excluído', 'Doação removida.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir a doação.');
            setDeleting(false);
          }
        },
      },
    ]);
  }

  if (loading) return <Loading fullScreen />;

  if (!doacao) {
    return (
      <View style={styles.container}>
        <Header title="Detalhes" showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>Doação não encontrada.</Text>
        </View>
      </View>
    );
  }

  const isPendente = doacao.status === 'PENDENTE_ENTREGA';
  const statusColor = STATUS_COLOR[doacao.status] ?? Colors.textMuted;

  return (
    <View style={styles.container}>
      <Header title="Detalhes da Doação" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Status + tipo */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22`, borderColor: `${statusColor}44` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusDoacaoLabel(doacao.status)}
            </Text>
          </View>
          <Text style={styles.tipoText}>{doacao.tipo}</Text>
        </View>

        {/* Informações */}
        <View style={styles.infoCard}>
          <InfoRow icon="layers-outline" label="Quantidade" value={String(doacao.quantidade)} />
          <Divider />
          <InfoRow icon="calendar-outline" label="Data da Doação" value={formatDate(doacao.dataDoacao)} />
          <Divider />
          <InfoRow icon="person-outline" label="Voluntário" value={doacao.voluntarioNome} />
          {doacao.abrigoNome && (
            <>
              <Divider />
              <InfoRow icon="home-outline" label="Abrigo" value={doacao.abrigoNome} />
            </>
          )}
          {doacao.necessidadeDescricao && (
            <>
              <Divider />
              <InfoRow icon="list-outline" label="Necessidade" value={doacao.necessidadeDescricao} />
            </>
          )}
          {doacao.descricao && (
            <>
              <Divider />
              <InfoRow icon="document-text-outline" label="Descrição" value={doacao.descricao} />
            </>
          )}
        </View>

        {/* Ações — só para pendentes */}
        {isPendente && (
          <View style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>Ações</Text>
            <CustomButton
              label={updating ? 'Atualizando...' : 'Marcar como Entregue'}
              onPress={handleMarcarEntregue}
              loading={updating}
              variant="secondary"
            />
            <CustomButton
              label={cancelling ? 'Cancelando...' : 'Cancelar Doação'}
              onPress={handleCancelar}
              loading={cancelling}
              variant="outline"
            />
          </View>
        )}

        {/* Zona de perigo */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Zona de Perigo</Text>
          <CustomButton
            label={deleting ? 'Excluindo...' : 'Excluir Doação'}
            onPress={handleDelete}
            loading={deleting}
            variant="danger"
          />
        </View>

      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
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

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.textSecondary, fontSize: Theme.fontSize.md },
  content: { padding: Theme.spacing.md, gap: Theme.spacing.md, paddingBottom: 40 },

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
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1, gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semiBold },
  tipoText: { color: Colors.text, fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold },

  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: Theme.spacing.md, gap: Theme.spacing.md },
  infoIconWrapper: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { color: Colors.textMuted, fontSize: Theme.fontSize.xs, letterSpacing: 0.5 },
  infoValue: { color: Colors.text, fontSize: Theme.fontSize.md, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Theme.spacing.md },

  actionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    gap: Theme.spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  actionsTitle: { color: Colors.text, fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.semiBold },

  dangerZone: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
    borderWidth: 1, borderColor: `${Colors.danger}44`,
  },
  dangerTitle: {
    color: Colors.danger, fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semiBold,
    letterSpacing: 1, textTransform: 'uppercase',
  },
});
