import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getActiveDisasters, NasaEvent, EventCategory } from '../../services/nasaService';
import Header from '../../components/Header';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const CATEGORY_MAP: Record<string, { label: string; icon: IconName; color: string; bg: string }> = {
  severeStorms:  { label: 'Tempestade Severa', icon: 'thunderstorm-outline', color: '#60A5FA', bg: 'rgba(96,165,250,0.15)' },
  floods:        { label: 'Enchente',          icon: 'water-outline',        color: '#38BDF8', bg: 'rgba(56,189,248,0.15)' },
  wildfires:     { label: 'Incêndio',          icon: 'flame-outline',        color: '#FB923C', bg: 'rgba(251,146,60,0.15)' },
  earthquakes:   { label: 'Terremoto',         icon: 'alert-circle-outline', color: '#F87171', bg: 'rgba(248,113,113,0.15)' },
  volcanoes:     { label: 'Vulcão',            icon: 'trending-up-outline',  color: '#E11D48', bg: 'rgba(225,29,72,0.15)'  },
  landslides:    { label: 'Deslizamento',      icon: 'layers-outline',       color: '#A78BFA', bg: 'rgba(167,139,250,0.15)'},
  drought:       { label: 'Seca',              icon: 'sunny-outline',        color: '#FBBF24', bg: 'rgba(251,191,36,0.15)' },
  snow:          { label: 'Nevasca',           icon: 'snow-outline',         color: '#BAE6FD', bg: 'rgba(186,230,253,0.15)'},
  dustHaze:      { label: 'Tempestade de Areia', icon: 'cloudy-outline',     color: '#D4B483', bg: 'rgba(212,180,131,0.15)'},
  tempExtremes:  { label: 'Temperatura Extrema', icon: 'thermometer-outline',color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  seaLakeIce:    { label: 'Gelo Marinho',      icon: 'globe-outline',        color: '#A5F3FC', bg: 'rgba(165,243,252,0.15)'},
  manmade:       { label: 'Desastre Antrópico', icon: 'construct-outline',   color: '#94A3B8', bg: 'rgba(148,163,184,0.15)'},
};

function getCategoryInfo(id: EventCategory) {
  return CATEGORY_MAP[id] ?? {
    label: 'Evento',
    icon: 'warning-outline' as IconName,
    color: Colors.textSecondary,
    bg: Colors.surface2,
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCoords(coords: number[]): string {
  if (!coords || coords.length < 2) return '—';
  const lat = coords[1].toFixed(2);
  const lon = coords[0].toFixed(2);
  return `${lat}° ${Number(lat) >= 0 ? 'N' : 'S'}, ${Math.abs(Number(lon)).toFixed(2)}° ${Number(lon) >= 0 ? 'L' : 'O'}`;
}

function AlertCard({ event }: { event: NasaEvent }) {
  const cat = event.categories[0];
  const info = getCategoryInfo(cat?.id ?? '');
  const lastGeometry = event.geometry[event.geometry.length - 1];
  const date = lastGeometry?.date ? formatDate(lastGeometry.date) : '—';
  const coords = lastGeometry?.coordinates ? formatCoords(lastGeometry.coordinates) : '—';
  const hasMagnitude =
    lastGeometry?.magnitudeValue != null && lastGeometry?.magnitudeUnit;

  function handleOpenLink() {
    if (!event.link) return;
    Linking.openURL(event.link).catch(() =>
      Alert.alert('Erro', 'Não foi possível abrir o link.')
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handleOpenLink} activeOpacity={0.85}>
      <View style={[styles.cardIconWrap, { backgroundColor: info.bg }]}>
        <Ionicons name={info.icon} size={26} color={info.color} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: info.bg }]}>
            <Text style={[styles.badgeText, { color: info.color }]}>{info.label}</Text>
          </View>
          <Text style={styles.cardDate}>{date}</Text>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>

        <View style={styles.cardMeta}>
          <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.cardMetaText}>{coords}</Text>
          {hasMagnitude && (
            <>
              <Text style={styles.cardMetaDot}>·</Text>
              <Text style={styles.cardMetaText}>
                {lastGeometry.magnitudeValue} {lastGeometry.magnitudeUnit}
              </Text>
            </>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.satelliteTag}>
            <Ionicons name="planet-outline" size={11} color={Colors.textMuted} />
            <Text style={styles.satelliteText}>Dados NASA / Satélite</Text>
          </View>
          <Ionicons name="open-outline" size={13} color={Colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function AlertasScreen() {
  const [events, setEvents] = useState<NasaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  async function load() {
    setError(false);
    try {
      const data = await getActiveDisasters(40);
      setEvents(data);
    } catch {
      setError(true);
      Alert.alert('Sem conexão', 'Não foi possível carregar os alertas da NASA. Verifique sua internet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  return (
    <View style={styles.container}>
      <Header
        title="Alertas Satelitais"
        subtitle={loading ? 'Carregando...' : `${events.length} eventos ativos`}
      />

      <View style={styles.banner}>
        <Ionicons name="planet" size={16} color="#60A5FA" />
        <Text style={styles.bannerText}>
          Eventos em tempo real monitorados por satélites da{' '}
          <Text style={styles.bannerBold}>NASA EONET</Text>
        </Text>
      </View>

      {loading ? (
        <Loading message="Buscando dados satelitais..." />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          renderItem={({ item }) => <AlertCard event={item} />}
          ItemSeparatorComponent={() => <View style={{ height: Theme.spacing.sm }} />}
          ListEmptyComponent={
            error ? (
              <EmptyState
                icon="wifi-outline"
                title="Sem conexão com a NASA"
                subtitle="Verifique sua internet e tente novamente."
                actionLabel="Tentar novamente"
                onAction={() => { setLoading(true); load(); }}
              />
            ) : (
              <EmptyState
                icon="shield-checkmark-outline"
                title="Nenhum evento ativo"
                subtitle="A NASA não reporta desastres ativos no momento."
              />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Theme.spacing.md,
    marginTop: Theme.spacing.md,
    backgroundColor: 'rgba(96,165,250,0.1)',
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.25)',
  },
  bannerText: { flex: 1, color: Colors.textSecondary, fontSize: Theme.fontSize.sm },
  bannerBold: { color: Colors.primary, fontWeight: Theme.fontWeight.semiBold },

  list: { padding: Theme.spacing.md, paddingBottom: 32 },

  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Theme.spacing.md,
    ...Theme.shadow.sm,
  },
  cardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1, gap: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
  },
  badgeText: { fontSize: Theme.fontSize.xs, fontWeight: Theme.fontWeight.semiBold },
  cardDate: { color: Colors.textMuted, fontSize: Theme.fontSize.xs },
  cardTitle: { color: Colors.text, fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semiBold, lineHeight: 20 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { color: Colors.textMuted, fontSize: Theme.fontSize.xs },
  cardMetaDot: { color: Colors.textMuted, fontSize: Theme.fontSize.xs },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  satelliteTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  satelliteText: { color: Colors.textMuted, fontSize: Theme.fontSize.xs },
});
