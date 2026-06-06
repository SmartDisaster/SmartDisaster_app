import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { getAbrigos } from '../../services/abrigoService';
import { getDoacoesByVoluntario } from '../../services/doacaoService';
import { Abrigo, Doacao } from '../../types';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';
import { getStatusDoacaoLabel, getStatusAbrigoLabel } from '../../utils/formatters';

type Tab = 'ajudar' | 'historico';

const STATUS_ABRIGO_COLOR: Record<string, string> = {
  ATIVO: Colors.success,
  LOTADO: Colors.warning,
  INATIVO: Colors.textMuted,
};

const STATUS_DOACAO_COLOR: Record<string, string> = {
  PENDENTE_ENTREGA: Colors.warning,
  ENTREGUE: Colors.success,
  CANCELADA: Colors.textMuted,
};

const TIPO_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  Alimentos: 'restaurant-outline',
  Água: 'water-outline',
  Roupas: 'shirt-outline',
  Medicamentos: 'medkit-outline',
  Higiene: 'sparkles-outline',
  Cobertores: 'bed-outline',
  Outros: 'gift-outline',
};

export default function DoacoesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<Tab>('ajudar');
  const [abrigos, setAbrigos] = useState<Abrigo[]>([]);
  const [historico, setHistorico] = useState<Doacao[]>([]);
  const [loadingAbrigos, setLoadingAbrigos] = useState(true);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function loadAbrigos() {
    try {
      const result = await getAbrigos();
      setAbrigos(result.content.filter((a: Abrigo) => a.status !== 'INATIVO'));
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os abrigos.');
    } finally {
      setLoadingAbrigos(false);
      setRefreshing(false);
    }
  }

  async function loadHistorico() {
    if (!user?.id) return;
    setLoadingHistorico(true);
    try {
      const result = await getDoacoesByVoluntario(user.id);
      setHistorico(result.content);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar o histórico.');
    } finally {
      setLoadingHistorico(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadAbrigos(); }, []);

  useEffect(() => {
    if (activeTab === 'historico') loadHistorico();
  }, [activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeTab === 'ajudar') loadAbrigos();
    else loadHistorico();
  }, [activeTab]);

  function renderAbrigoCard({ item }: { item: Abrigo }) {
    const statusColor = STATUS_ABRIGO_COLOR[item.status] ?? Colors.textMuted;
    const cidade = item.endereco?.cidade ?? '';
    const estado = item.endereco?.estado ?? '';
    return (
      <View style={styles.abrigoCard}>
        <View style={styles.abrigoHeader}>
          <View style={styles.abrigoIconWrap}>
            <Ionicons name="home-outline" size={22} color={Colors.secondary} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.abrigoNome} numberOfLines={2}>{item.nome}</Text>
            {cidade !== '' && (
              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.locText}>{cidade}{estado ? `, ${estado}` : ''}</Text>
              </View>
            )}
          </View>
          <View style={[styles.statusPill, { backgroundColor: `${statusColor}20`, borderColor: `${statusColor}40` }]}>
            <Text style={[styles.statusPillText, { color: statusColor }]}>
              {getStatusAbrigoLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.abrigoFooter}>
          <View style={styles.capacidadeInfo}>
            <Ionicons name="people-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.capacidadeText}>Cap. {item.capacidadeMaxima}</Text>
          </View>
          <TouchableOpacity
            style={styles.verBtn}
            onPress={() => router.push({ pathname: '/doacoes/novo/[abrigoId]' as never, params: { abrigoId: item.id } })}
            activeOpacity={0.82}
          >
            <Ionicons name="heart-outline" size={14} color="#fff" />
            <Text style={styles.verBtnText}>Ver necessidades</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderDoacaoCard({ item }: { item: Doacao }) {
    const statusColor = STATUS_DOACAO_COLOR[item.status] ?? Colors.textMuted;
    const icon = TIPO_ICON[item.tipo] ?? 'gift-outline';
    return (
      <TouchableOpacity
        style={styles.doacaoCard}
        onPress={() => router.push({ pathname: '/doacoes/[id]', params: { id: item.id } })}
        activeOpacity={0.82}
      >
        <View style={styles.doacaoLeft}>
          <View style={[styles.doacaoIconWrap, { backgroundColor: `${statusColor}15` }]}>
            <Ionicons name={icon} size={20} color={statusColor} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.doacaoTipo}>{item.tipo}</Text>
            {item.abrigoNome && (
              <Text style={styles.doacaoAbrigo} numberOfLines={1}>{item.abrigoNome}</Text>
            )}
            <Text style={styles.doacaoQtd}>Quantidade: {item.quantidade}</Text>
          </View>
        </View>
        <View style={[styles.doacaoStatusBadge, { backgroundColor: `${statusColor}18` }]}>
          <Text style={[styles.doacaoStatusText, { color: statusColor }]}>
            {getStatusDoacaoLabel(item.status)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  const isLoading = activeTab === 'ajudar' ? loadingAbrigos : loadingHistorico;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {activeTab === 'ajudar' ? 'Quero Ajudar' : 'Minhas Doações'}
          </Text>
          <Text style={styles.headerSub}>
            {activeTab === 'ajudar'
              ? 'Escolha um abrigo e veja como contribuir'
              : 'Histórico de doações realizadas'}
          </Text>
        </View>
        {activeTab === 'ajudar' && (
          <View style={styles.heartBadge}>
            <Ionicons name="heart" size={18} color={Colors.primary} />
          </View>
        )}
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ajudar' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ajudar')}
        >
          <Ionicons
            name="home-outline"
            size={15}
            color={activeTab === 'ajudar' ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.tabBtnText, activeTab === 'ajudar' && styles.tabBtnTextActive]}>
            Abrigos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'historico' && styles.tabBtnActive]}
          onPress={() => setActiveTab('historico')}
        >
          <Ionicons
            name="time-outline"
            size={15}
            color={activeTab === 'historico' ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.tabBtnText, activeTab === 'historico' && styles.tabBtnTextActive]}>
            Histórico
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <Loading />
      ) : activeTab === 'ajudar' ? (
        <FlatList
          data={abrigos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          renderItem={renderAbrigoCard}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <EmptyState
              icon="home-outline"
              title="Nenhum abrigo disponível"
              subtitle="Não há abrigos ativos no momento."
            />
          }
        />
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          renderItem={renderDoacaoCard}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title="Nenhuma doação registrada"
              subtitle="Suas doações aparecerão aqui após serem confirmadas."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  heartBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: `${Colors.primary}18`,
  },
  tabBtnText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: Colors.primary,
  },

  list: { paddingHorizontal: 20, paddingBottom: 32 },

  // Abrigo card
  abrigoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
    ...Theme.shadow.sm,
  },
  abrigoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  abrigoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${Colors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  abrigoNome: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  statusPill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  abrigoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  capacidadeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  capacidadeText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  verBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  verBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Doacao card
  doacaoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Theme.shadow.sm,
  },
  doacaoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  doacaoIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  doacaoTipo: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  doacaoAbrigo: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  doacaoQtd: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  doacaoStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },
  doacaoStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
