import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../hooks/useAuth';
import { getAbrigoById } from '../../../services/abrigoService';
import { getNecessidadesByAbrigo } from '../../../services/necessidadeService';
import { createDoacao } from '../../../services/doacaoService';
import { decodeJwtPayload } from '../../../utils/formatters';
import { Abrigo, Necessidade } from '../../../types';
import Loading from '../../../components/Loading';
import CustomInput from '../../../components/CustomInput';
import CustomButton from '../../../components/CustomButton';
import Colors from '../../../constants/colors';
import Theme from '../../../constants/theme';

const TIPO_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  Alimentos: 'restaurant-outline',
  Água: 'water-outline',
  Roupas: 'shirt-outline',
  Medicamentos: 'medkit-outline',
  Higiene: 'sparkles-outline',
  Cobertores: 'bed-outline',
  Outros: 'gift-outline',
};

const STATUS_COLOR: Record<string, string> = {
  PENDENTE: Colors.warning,
  ATENDIDA: Colors.success,
};

export default function NovaDoacao() {
  const { abrigoId } = useLocalSearchParams<{ abrigoId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [abrigo, setAbrigo] = useState<Abrigo | null>(null);
  const [necessidades, setNecessidades] = useState<Necessidade[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedNec, setSelectedNec] = useState<Necessidade | null>(null);
  const [quantidade, setQuantidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [qtdError, setQtdError] = useState('');

  useEffect(() => {
    if (!abrigoId) return;
    const id = Number(abrigoId);
    Promise.all([getAbrigoById(id), getNecessidadesByAbrigo(id)])
      .then(([ab, necs]) => {
        setAbrigo(ab);
        setNecessidades(necs);
      })
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar os dados do abrigo.'))
      .finally(() => setLoading(false));
  }, [abrigoId]);

  function getVoluntarioId(): number | null {
    if (user?.id) return user.id;
    if (user?.token) {
      const payload = decodeJwtPayload(user.token);
      if (typeof payload.userId === 'number') return payload.userId;
      if (typeof payload.id === 'number') return payload.id;
    }
    return null;
  }

  async function handleConfirmar() {
    if (!selectedNec) {
      Alert.alert('Atenção', 'Selecione uma necessidade para doar.');
      return;
    }
    const qty = Number(quantidade);
    if (!quantidade.trim() || isNaN(qty) || qty <= 0) {
      setQtdError('Informe uma quantidade válida.');
      return;
    }
    setQtdError('');

    const voluntarioId = getVoluntarioId();
    if (!voluntarioId) {
      Alert.alert('Erro', 'Sessão inválida. Faça login novamente.');
      return;
    }

    setSubmitting(true);
    try {
      const doacao = await createDoacao({
        tipo: selectedNec.tipo,
        descricao: descricao.trim() || undefined,
        quantidade: qty,
        abrigoId: Number(abrigoId),
        necessidadeId: selectedNec.id,
        voluntarioId,
      });

      Alert.alert(
        'Doação registrada!',
        `✓ ${doacao.tipo} — ${doacao.quantidade} un.\n🏠 ${abrigo?.nome ?? ''}\n⏳ Status: Pendente de entrega`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar a doação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading fullScreen />;

  const pendentes = necessidades.filter((n) => n.status === 'PENDENTE');
  const endereco = abrigo?.endereco;
  const endStr = endereco
    ? `${endereco.rua}, ${endereco.numero} — ${endereco.bairro}, ${endereco.cidade}/${endereco.estado}`
    : '';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{abrigo?.nome ?? 'Abrigo'}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info do abrigo */}
          <View style={styles.abrigoCard}>
            <View style={styles.abrigoRow}>
              <View style={styles.abrigoIconWrap}>
                <Ionicons name="home-outline" size={20} color={Colors.secondary} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.abrigoNome}>{abrigo?.nome}</Text>
                {endStr !== '' && (
                  <View style={styles.locRow}>
                    <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                    <Text style={styles.locText} numberOfLines={2}>{endStr}</Text>
                  </View>
                )}
              </View>
              <View style={[styles.statusPill, { backgroundColor: `${Colors.success}20` }]}>
                <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
                <Text style={[styles.statusText, { color: Colors.success }]}>{abrigo?.status}</Text>
              </View>
            </View>
          </View>

          {/* Necessidades */}
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={16} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Necessidades Pendentes</Text>
            <Text style={styles.sectionCount}>{pendentes.length}</Text>
          </View>

          {necessidades.length === 0 ? (
            <View style={styles.emptyNeeds}>
              <Ionicons name="checkmark-circle-outline" size={32} color={Colors.success} />
              <Text style={styles.emptyNeedsText}>Nenhuma necessidade pendente</Text>
            </View>
          ) : (
            <View style={styles.needsList}>
              {necessidades.map((nec) => {
                const isSelected = selectedNec?.id === nec.id;
                const statusColor = STATUS_COLOR[nec.status] ?? Colors.textMuted;
                const icon = TIPO_ICON[nec.tipo] ?? 'gift-outline';
                const isPendente = nec.status === 'PENDENTE';

                return (
                  <TouchableOpacity
                    key={nec.id}
                    style={[
                      styles.necCard,
                      isSelected && styles.necCardSelected,
                      !isPendente && styles.necCardDimmed,
                    ]}
                    onPress={() => isPendente && setSelectedNec(isSelected ? null : nec)}
                    activeOpacity={isPendente ? 0.8 : 1}
                  >
                    <View style={[styles.necIconWrap, { backgroundColor: `${statusColor}15` }]}>
                      <Ionicons name={icon} size={20} color={isSelected ? Colors.primary : statusColor} />
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={[styles.necTipo, isSelected && { color: Colors.primary }]}>
                        {nec.tipo}
                      </Text>
                      {nec.descricao && (
                        <Text style={styles.necDesc} numberOfLines={2}>{nec.descricao}</Text>
                      )}
                      <Text style={styles.necQtd}>Necessário: {nec.quantidadeNecessaria} un.</Text>
                    </View>
                    <View style={[styles.necStatusBadge, { backgroundColor: `${statusColor}18` }]}>
                      <Text style={[styles.necStatusText, { color: statusColor }]}>
                        {nec.status === 'PENDENTE' ? 'Pendente' : 'Atendida'}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.selectedCheck}>
                        <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Formulário — aparece quando há necessidade selecionada */}
          {selectedNec && (
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Ionicons name="heart-outline" size={16} color={Colors.primary} />
                <Text style={styles.formTitle}>Sua doação para: {selectedNec.tipo}</Text>
              </View>

              <CustomInput
                label="Quantidade *"
                placeholder={`Ex: ${selectedNec.quantidadeNecessaria}`}
                value={quantidade}
                onChangeText={(t) => { setQuantidade(t.replace(/\D/g, '')); setQtdError(''); }}
                error={qtdError}
                icon="layers-outline"
                keyboardType="numeric"
              />

              <CustomInput
                label="Descrição (opcional)"
                placeholder="Detalhes sobre o item doado..."
                value={descricao}
                onChangeText={setDescricao}
                icon="document-text-outline"
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top', paddingTop: 8 }}
              />

              <View style={styles.infoBanner}>
                <Ionicons name="information-circle-outline" size={15} color={Colors.secondary} />
                <Text style={styles.infoText}>
                  A doação ficará com status{' '}
                  <Text style={{ color: Colors.warning, fontWeight: '700' }}>Pendente de entrega</Text>
                  {' '}até ser confirmada no abrigo.
                </Text>
              </View>

              <CustomButton
                label="Confirmar Doação"
                onPress={handleConfirmar}
                loading={submitting}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },

  content: { padding: 16, gap: 16, paddingBottom: 48 },

  abrigoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Theme.shadow.sm,
  },
  abrigoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  abrigoIconWrap: {
    width: 42, height: 42, borderRadius: 11,
    backgroundColor: `${Colors.secondary}15`,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  abrigoNome: { color: Colors.text, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  locRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 3 },
  locText: { color: Colors.textMuted, fontSize: 12, flex: 1, lineHeight: 16 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  sectionTitle: { color: Colors.text, fontSize: 15, fontWeight: '700', flex: 1 },
  sectionCount: {
    color: Colors.primary, fontSize: 12, fontWeight: '800',
    backgroundColor: `${Colors.primary}18`,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },

  emptyNeeds: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  emptyNeedsText: { color: Colors.textMuted, fontSize: 14 },

  needsList: { gap: 10 },
  necCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Theme.shadow.sm,
  },
  necCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
  },
  necCardDimmed: { opacity: 0.55 },
  necIconWrap: {
    width: 42, height: 42, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  necTipo: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  necDesc: { color: Colors.textMuted, fontSize: 12, lineHeight: 16 },
  necQtd: { color: Colors.textSecondary, fontSize: 12 },
  necStatusBadge: {
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, flexShrink: 0,
  },
  necStatusText: { fontSize: 10, fontWeight: '700' },
  selectedCheck: { flexShrink: 0, marginLeft: -4 },

  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
    gap: 14,
    ...Theme.shadow.sm,
  },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  formTitle: { color: Colors.text, fontSize: 14, fontWeight: '700', flex: 1 },

  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.infoBg,
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: `${Colors.secondary}33`,
  },
  infoText: { flex: 1, color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
});
