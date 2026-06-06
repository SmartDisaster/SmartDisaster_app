import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getVitimas } from '../../services/vitimaService';
import { Vitima } from '../../types';
import CardVitima from '../../components/CardVitima';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Header from '../../components/Header';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';

export default function VitimasScreen() {
  const router = useRouter();
  const [vitimas, setVitimas] = useState<Vitima[]>([]);
  const [filtered, setFiltered] = useState<Vitima[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  async function load() {
    try {
      const vitimasResult = await getVitimas(0, 100);
      setVitimas(vitimasResult.content);
      setFiltered(vitimasResult.content);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as vítimas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  useEffect(() => {
    let data = vitimas;
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((v) =>
        v.nome.toLowerCase().includes(q) ||
        v.cpf.includes(q) ||
        v.abrigoNome?.toLowerCase().includes(q)
      );
    }
    setFiltered(data);
  }, [search, vitimas]);

  return (
    <View style={styles.container}>
      <Header
        title="Vítimas"
        subtitle={`${filtered.length} registros`}
        rightAction={{ icon: 'add-circle-outline', onPress: () => router.push('/vitimas/cadastro') }}
      />

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Nome, CPF ou abrigo..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/vitimas/cadastro', params: { id: item.id } })}
            >
              <CardVitima vitima={item} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="Nenhuma vítima encontrada"
              subtitle="Cadastre vítimas para visualizá-las aqui."
              actionLabel="Cadastrar Vítima"
              onAction={() => router.push('/vitimas/cadastro')}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: Theme.spacing.md }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.md,
    marginHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 46,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: Colors.text, fontSize: Theme.fontSize.md },
  list: { padding: Theme.spacing.md, paddingTop: 0, paddingBottom: 32 },
});
