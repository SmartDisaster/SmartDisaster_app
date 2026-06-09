import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { getAbrigosCount } from '../../services/abrigoService';
import { getVitimasCount } from '../../services/vitimaService';
import { getDocacoesCount } from '../../services/doacaoService';
import { getActiveDisasters, NasaEvent } from '../../services/nasaService';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];
type AlertLevel = 'NORMAL' | 'ATENÇÃO' | 'ALTO' | 'CRÍTICO';

const ASSETS = {
  banner:     require('../../assets/banner.png.png'),
  tempestade: require('../../assets/Tempestade.png.png'),
  incendio:   require('../../assets/Incendio.png.png'),
  radar:      require('../../assets/Radar.png.png'),
};

const CAT_IMAGE: Record<string, any> = {
  severeStorms: ASSETS.tempestade,
  floods:       ASSETS.tempestade,
  wildfires:    ASSETS.incendio,
  volcanoes:    ASSETS.incendio,
};

function calcAlertLevel(count: number): AlertLevel {
  if (count === 0) return 'NORMAL';
  if (count <= 2)  return 'ATENÇÃO';
  if (count <= 5)  return 'ALTO';
  return 'CRÍTICO';
}

const LEVEL_COLOR: Record<AlertLevel, string> = {
  'NORMAL':  Colors.success,
  'ATENÇÃO': Colors.warning,
  'ALTO':    Colors.accent,
  'CRÍTICO': Colors.primary,
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1)  return 'agora';
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

function formatCoords(coords: number[]): string {
  if (!coords || coords.length < 2) return '';
  return `${Math.abs(coords[1]).toFixed(1)}°${coords[1] >= 0 ? 'N' : 'S'} · ${Math.abs(coords[0]).toFixed(1)}°${coords[0] >= 0 ? 'L' : 'O'}`;
}

const NASA_CAT: Record<string, { label: string; icon: IoniconsName; color: string }> = {
  severeStorms: { label: 'Tempestade',   icon: 'thunderstorm-outline', color: '#60A5FA' },
  floods:       { label: 'Enchente',     icon: 'water-outline',        color: '#38BDF8' },
  wildfires:    { label: 'Incêndio',     icon: 'flame-outline',        color: '#FB923C' },
  earthquakes:  { label: 'Terremoto',    icon: 'alert-circle-outline', color: '#F87171' },
  volcanoes:    { label: 'Vulcão',       icon: 'trending-up-outline',  color: '#E11D48' },
  landslides:   { label: 'Deslizamento', icon: 'layers-outline',       color: '#A78BFA' },
  drought:      { label: 'Seca',         icon: 'sunny-outline',        color: '#FBBF24' },
};

function catInfo(id: string) {
  return NASA_CAT[id] ?? { label: 'Evento', icon: 'warning-outline' as IoniconsName, color: '#94A3B8' };
}

function StatCard({
  icon, value, label, sub, color, onPress,
}: {
  icon: IoniconsName; value: number | null;
  label: string; sub: string; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={statS.card} onPress={onPress} activeOpacity={0.82}>
      <View style={[statS.iconBox, { backgroundColor: `${color}15`, borderColor: `${color}22` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={statS.number}>{value ?? '—'}</Text>
      <Text style={statS.label}>{label}</Text>
      <Text style={statS.sub}>{sub}</Text>
      <View style={[statS.strip, { backgroundColor: color }]} />
    </TouchableOpacity>
  );
}

const statS = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    gap: 3,
    ...Theme.shadow.sm,
  },
  iconBox: {
    width: 42, height: 42,
    borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  number: {
    color: Colors.text,
    fontSize: 38, fontWeight: '800',
    letterSpacing: -1.5, lineHeight: 42,
  },
  label: {
    color: Colors.text,
    fontSize: 12, fontWeight: '700', letterSpacing: 0.3,
  },
  sub: {
    color: Colors.textMuted, fontSize: 11, marginBottom: 10,
  },
  strip: { height: 3, borderRadius: 2, marginTop: 'auto' },
});

function AlertCard({ event, onPress }: { event: NasaEvent; onPress: () => void }) {
  const cat = event.categories[0];
  const info = catInfo(cat?.id ?? '');
  const image = cat?.id ? CAT_IMAGE[cat.id] : undefined;
  const geo = event.geometry[event.geometry.length - 1];
  const coords = geo?.coordinates ? formatCoords(geo.coordinates) : '';
  const ago = geo?.date ? timeAgo(geo.date) : '—';

  return (
    <TouchableOpacity style={alertS.card} onPress={onPress} activeOpacity={0.82}>
      {image ? (
        <ImageBackground source={image} style={alertS.hero} imageStyle={alertS.heroImg} resizeMode="cover">
          <View style={alertS.heroOverlay} />
          <View style={alertS.heroBadgeRow}>
            <View style={[alertS.badge, { backgroundColor: 'rgba(0,0,0,0.45)', borderColor: `${info.color}60`, borderWidth: 1 }]}>
              <Ionicons name={info.icon} size={9} color={info.color} />
              <Text style={[alertS.badgeText, { color: info.color }]}>{info.label.toUpperCase()}</Text>
            </View>
            <Text style={alertS.heroAgo}>{ago}</Text>
          </View>
        </ImageBackground>
      ) : (
        <View style={[alertS.noHero, { backgroundColor: `${info.color}10`, borderBottomWidth: 1, borderBottomColor: `${info.color}25` }]}>
          <View style={[alertS.iconCircle, { backgroundColor: `${info.color}18` }]}>
            <Ionicons name={info.icon} size={20} color={info.color} />
          </View>
          <View style={[alertS.badge, { backgroundColor: `${info.color}18` }]}>
            <Text style={[alertS.badgeText, { color: info.color }]}>{info.label.toUpperCase()}</Text>
          </View>
          <Text style={alertS.ago}>{ago}</Text>
        </View>
      )}

      <View style={alertS.body}>
        <Text style={alertS.title} numberOfLines={2}>{event.title}</Text>
        {coords !== '' && (
          <View style={alertS.coordRow}>
            <Ionicons name="location-outline" size={11} color={Colors.textMuted} />
            <Text style={alertS.coord}>{coords}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const alertS = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
    ...Theme.shadow.sm,
  },
  hero: {
    height: 148,
    justifyContent: 'flex-end',
  },
  heroImg: {},
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,10,28,0.38)',
  },
  heroBadgeRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  heroAgo: { color: 'rgba(255,255,255,0.65)', fontSize: 11 },
  noHero: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, padding: 14,
  },
  iconCircle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  ago: { color: Colors.textMuted, fontSize: 11, marginLeft: 'auto' },
  body: {
    padding: 14, gap: 6,
  },
  title: {
    color: Colors.text, fontSize: 14, fontWeight: '700', lineHeight: 20,
  },
  coordRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  coord: { color: Colors.textMuted, fontSize: 11 },
});

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [abrigos, setAbrigos]       = useState<number | null>(null);
  const [vitimas, setVitimas]       = useState<number | null>(null);
  const [doacoes, setDoacoes]       = useState<number | null>(null);
  const [alerts, setAlerts]         = useState<NasaEvent[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const [a, v, d] = await Promise.all([
        getAbrigosCount(), getVitimasCount(), getDocacoesCount(),
      ]);
      setAbrigos(a); setVitimas(v); setDoacoes(d);
    } catch {
      Alert.alert('Sem conexão', 'Não foi possível atualizar o painel.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    try {
      const events = await getActiveDisasters(10);
      setAlerts(events.slice(0, 5));
    } catch { }
  }

  useEffect(() => { load(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  async function handleLogout() {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
    ]);
  }

  const alertLevel = calcAlertLevel(alerts.length);
  const levelColor = LEVEL_COLOR[alertLevel];

  const stormAlert = alerts.find(e => ['severeStorms', 'floods'].includes(e.categories[0]?.id ?? ''));
  const fireAlert  = alerts.find(e => ['wildfires', 'volcanoes'].includes(e.categories[0]?.id ?? ''));
  const previewAlerts = ([stormAlert, fireAlert].filter(Boolean) as NasaEvent[]).length > 0
    ? ([stormAlert, fireAlert].filter(Boolean) as NasaEvent[])
    : alerts.slice(0, 2);

  const displayName = user?.nome
    ? user.nome.split(' ')[0]
    : user?.email
      ? user.email.split('@')[0]
      : 'Usuário';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <View style={[S.root, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={levelColor} />
        }
      >

        <View style={S.header}>
          <View>
            <Text style={S.greetLine}>{greeting()},</Text>
            <Text style={S.greetName}>{displayName}</Text>
            <View style={S.systemPill}>
              <View style={S.greenDot} />
              <Text style={S.systemLabel}>Sistema Operacional</Text>
            </View>
          </View>
          <View style={S.headerActions}>
            <TouchableOpacity style={S.iconBtn} onPress={() => router.push('/sobre' as never)} activeOpacity={0.8}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={S.avatar} onPress={handleLogout} activeOpacity={0.8}>
              <Text style={S.avatarText}>{initials}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ImageBackground
          source={ASSETS.banner}
          style={S.heroBg}
          imageStyle={S.heroBgImg}
          resizeMode="cover"
        />

        <View style={S.grid}>
          <View style={S.gridRow}>
            <StatCard
              icon="business-outline" value={loading ? null : abrigos}
              label="Abrigos" sub="em operação" color={Colors.secondary}
              onPress={() => router.push('/(tabs)/abrigos' as never)}
            />
            <StatCard
              icon="people-outline" value={loading ? null : vitimas}
              label="Vítimas" sub="acolhidas" color={Colors.primary}
              onPress={() => router.push('/(tabs)/vitimas' as never)}
            />
          </View>
          <View style={S.gridRow}>
            <StatCard
              icon="heart-outline" value={loading ? null : doacoes}
              label="Doações" sub="disponíveis" color={Colors.accent}
              onPress={() => router.push('/(tabs)/doacoes' as never)}
            />
            <StatCard
              icon="planet-outline" value={alerts.length || null}
              label="Alertas" sub="NASA ativos" color="#60A5FA"
              onPress={() => router.push('/(tabs)/alertas' as never)}
            />
          </View>
        </View>

        {alerts.length > 0 && (
          <View style={S.section}>
            <View style={S.sectionHead}>
              <View style={S.sectionLeft}>
                <Ionicons name="wifi" size={15} color={Colors.warning} />
                <Text style={S.sectionTitle}>Alertas Recentes</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/alertas' as never)}>
                <Text style={S.sectionLink}>Ver todos →</Text>
              </TouchableOpacity>
            </View>
            <Text style={S.sectionSub}>NASA EONET · Monitoramento orbital em tempo real</Text>
            <View style={S.list}>
              {previewAlerts.map((ev) => (
                <AlertCard
                  key={ev.id}
                  event={ev}
                  onPress={() => router.push('/(tabs)/alertas' as never)}
                />
              ))}
            </View>
          </View>
        )}

        <View style={S.section}>
          <View style={S.sectionHead}>
            <View style={S.sectionLeft}>
              <Ionicons name="location" size={15} color="#4ADE80" />
              <Text style={S.sectionTitle}>Mapa de Operações</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/abrigos' as never)}>
              <Text style={S.sectionLink}>Ver abrigos →</Text>
            </TouchableOpacity>
          </View>
          <View style={S.radarWrap}>
            <ImageBackground
              source={ASSETS.radar}
              style={S.radarBg}
              imageStyle={S.radarBgImg}
              resizeMode="cover"
            >
              <View style={S.radarOverlay} />
              <View style={S.radarContent}>
                <View style={S.radarTopRow}>
                  <View style={S.radarLivePill}>
                    <View style={S.radarDot} />
                    <Text style={S.radarLiveText}>AO VIVO</Text>
                  </View>
                  <Text style={S.radarBrand}>SmartDisaster</Text>
                </View>
                <View style={S.radarBottomRow}>
                  <Text style={S.radarCount}>{abrigos ?? '—'}</Text>
                  <View style={S.radarLabelGroup}>
                    <Text style={S.radarLabelBig}>abrigos</Text>
                    <Text style={S.radarLabelSub}>monitorados</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>

        <View style={S.footer}>
          <Ionicons name="planet-outline" size={11} color={Colors.textMuted} />
          <Text style={S.footerText}>Dados satelitais via NASA EONET</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 22, paddingBottom: 52 },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greetLine: { color: Colors.textMuted, fontSize: 14, fontWeight: '400' },
  greetName: {
    color: Colors.text, fontSize: 30, fontWeight: '800',
    letterSpacing: -0.8, lineHeight: 34, textTransform: 'capitalize',
  },
  systemPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: 8, backgroundColor: `${Colors.success}14`,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: 'flex-start', borderWidth: 1, borderColor: `${Colors.success}28`,
  },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  systemLabel: { color: Colors.success, fontSize: 11, fontWeight: '600' },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: `${Colors.primary}1A`,
    borderWidth: 2, borderColor: `${Colors.primary}38`,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.primary, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  heroBg: {
    height: 190,
    marginHorizontal: -20,
  },
  heroBgImg: { borderRadius: 8 },

  grid: { gap: 10 },
  gridRow: { flexDirection: 'row', gap: 10 },

  section: { gap: 10 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  sectionSub: { color: Colors.textMuted, fontSize: 11, marginTop: -4 },
  sectionLink: { color: Colors.secondary, fontSize: 12, fontWeight: '600' },
  list: { gap: 8 },

  radarWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Theme.shadow.md,
  },
  radarBg: { height: 175 },
  radarBgImg: { borderRadius: 20 },
  radarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,10,28,0.72)',
  },
  radarContent: {
    flex: 1, padding: 18,
    justifyContent: 'space-between',
  },
  radarTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  radarLivePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.32)',
  },
  radarDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  radarLiveText: { color: '#4ADE80', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  radarBrand: { color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  radarBottomRow: {
    flexDirection: 'row', alignItems: 'baseline', gap: 10,
  },
  radarCount: {
    color: '#FFFFFF', fontSize: 56, fontWeight: '800',
    letterSpacing: -2, lineHeight: 60,
  },
  radarLabelGroup: { gap: 1 },
  radarLabelBig: { color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: '600' },
  radarLabelSub: { color: 'rgba(255,255,255,0.42)', fontSize: 12 },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingTop: 4,
  },
  footerText: { color: Colors.textMuted, fontSize: 10 },
});
