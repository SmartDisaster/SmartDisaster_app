import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAbrigos } from '../../services/abrigoService';
import { Abrigo } from '../../types';
import CardAbrigo from '../../components/CardAbrigo';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Header from '../../components/Header';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';

export default function AbrigosScreen() {
  const router = useRouter();
  const [abrigos, setAbrigos] = useState<Abrigo[]>([]);
  const [filtered, setFiltered] = useState<Abrigo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  async function load() {
    try {
      const result = await getAbrigos(0, 100);
      setAbrigos(result.content);
      setFiltered(result.content);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os abrigos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(abrigos); return; }
    const q = search.toLowerCase();
    setFiltered(abrigos.filter((a) =>
      a.nome.toLowerCase().includes(q) ||
      a.endereco?.cidade?.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q)
    ));
  }, [search, abrigos]);

  return (
    <View style={styles.container}>
      <Header
        title="Abrigos"
        subtitle={`${filtered.length} registros`}
        rightAction={{ icon: 'add-outline', onPress: () => router.push('/abrigos/cadastro') }}
      />
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome, cidade ou status..."
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
            <CardAbrigo
              abrigo={item}
              onPress={() => router.push({ pathname: '/abrigos/[id]', params: { id: item.id } })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="business-outline"
              title="Nenhum abrigo encontrado"
              subtitle={search ? 'Tente um termo diferente.' : 'Não há abrigos cadastrados no sistema.'}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: Theme.spacing.sm }} />}
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
    margin: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 46,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: Colors.text, fontSize: Theme.fontSize.md },
  list: { padding: Theme.spacing.md, paddingTop: 0, paddingBottom: 32 },
});
