import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getAbrigoById,
  createAbrigo,
  updateAbrigo,
  deleteAbrigo,
  AbrigoRequest,
} from '../../services/abrigoService';
import { StatusAbrigo } from '../../types';
import Header from '../../components/Header';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import Loading from '../../components/Loading';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';

interface FormState {
  nome: string;
  capacidadeMaxima: string;
  status: StatusAbrigo;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude: string;
  longitude: string;
}

interface FormErrors {
  nome?: string;
  capacidadeMaxima?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

const EMPTY_FORM: FormState = {
  nome: '',
  capacidadeMaxima: '',
  status: 'ATIVO',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  latitude: '',
  longitude: '',
};

const STATUS_OPTIONS: { value: StatusAbrigo; label: string; color: string }[] = [
  { value: 'ATIVO', label: 'Ativo', color: Colors.success },
  { value: 'INATIVO', label: 'Inativo', color: Colors.textMuted },
  { value: 'LOTADO', label: 'Lotado', color: Colors.danger },
];

function applyCepMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export default function CadastroAbrigoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !id) return;
    async function load() {
      try {
        const abrigo = await getAbrigoById(Number(id));
        setForm({
          nome: abrigo.nome,
          capacidadeMaxima: String(abrigo.capacidadeMaxima),
          status: abrigo.status,
          rua: abrigo.endereco?.rua ?? '',
          numero: abrigo.endereco?.numero ?? '',
          bairro: abrigo.endereco?.bairro ?? '',
          cidade: abrigo.endereco?.cidade ?? '',
          estado: abrigo.endereco?.estado ?? '',
          cep: abrigo.endereco?.cep ?? '',
          latitude: abrigo.latitude ? String(abrigo.latitude) : '',
          longitude: abrigo.longitude ? String(abrigo.longitude) : '',
        });
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar os dados do abrigo.');
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [id, isEdit]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.nome.trim()) next.nome = 'Nome obrigatório';
    const cap = Number(form.capacidadeMaxima);
    if (!form.capacidadeMaxima.trim() || isNaN(cap) || cap <= 0)
      next.capacidadeMaxima = 'Capacidade deve ser um número positivo';
    if (!form.rua.trim()) next.rua = 'Rua obrigatória';
    if (!form.numero.trim()) next.numero = 'Número obrigatório';
    if (!form.bairro.trim()) next.bairro = 'Bairro obrigatório';
    if (!form.cidade.trim()) next.cidade = 'Cidade obrigatória';
    if (!form.estado.trim()) next.estado = 'Estado obrigatório';
    if (!form.cep.trim()) next.cep = 'CEP obrigatório';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const payload: AbrigoRequest = {
      nome: form.nome.trim(),
      capacidadeMaxima: Number(form.capacidadeMaxima),
      status: form.status,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      endereco: {
        rua: form.rua.trim(),
        numero: form.numero.trim(),
        bairro: form.bairro.trim(),
        cidade: form.cidade.trim(),
        estado: form.estado.trim().toUpperCase(),
        cep: form.cep.trim(),
      },
    };
    try {
      if (isEdit && id) {
        await updateAbrigo(Number(id), payload);
        Alert.alert('Sucesso', 'Abrigo atualizado com sucesso!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await createAbrigo(payload);
        Alert.alert('Sucesso', 'Abrigo cadastrado com sucesso!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: unknown) {
      Alert.alert(isEdit ? 'Erro ao atualizar' : 'Erro ao cadastrar', extractMsg(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    Alert.alert(
      'Excluir Abrigo',
      `Deseja excluir "${form.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAbrigo(Number(id));
              Alert.alert('Excluído', 'Abrigo removido com sucesso.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (err) {
              Alert.alert('Erro ao excluir', extractMsg(err));
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  function extractMsg(err: unknown): string {
    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>;
      const res = e.response as Record<string, unknown> | undefined;
      if (res?.data && typeof res.data === 'object') {
        const d = res.data as Record<string, unknown>;
        if (typeof d.message === 'string') return d.message;
      }
      if (typeof (e as { message?: string }).message === 'string')
        return (e as { message: string }).message;
    }
    return 'Operação não concluída. Verifique as permissões.';
  }

  if (loadingData) return <Loading fullScreen message="Carregando..." />;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.flex}>
        <Header
          title={isEdit ? 'Editar Abrigo' : 'Cadastrar Abrigo'}
          showBack
          rightAction={isEdit ? { icon: 'trash-outline', onPress: handleDelete } : undefined}
        />
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {isEdit && (
            <View style={styles.editBanner}>
              <Ionicons name="create-outline" size={16} color={Colors.accent} />
              <Text style={styles.editBannerText}>Modo edição — ID #{id}</Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informações Gerais</Text>
            <CustomInput
              label="Nome do Abrigo *"
              placeholder="Ex: Escola Municipal João Silva"
              value={form.nome}
              onChangeText={(t) => set('nome', t)}
              error={errors.nome}
              icon="business-outline"
              autoCapitalize="words"
            />
            <CustomInput
              label="Capacidade Máxima *"
              placeholder="Ex: 200"
              value={form.capacidadeMaxima}
              onChangeText={(t) => set('capacidadeMaxima', t.replace(/\D/g, ''))}
              error={errors.capacidadeMaxima}
              icon="people-outline"
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Status *</Text>
            <View style={styles.statusRow}>
              {STATUS_OPTIONS.map((opt) => {
                const selected = form.status === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.statusOption,
                      selected && { borderColor: opt.color, backgroundColor: `${opt.color}18` },
                    ]}
                    onPress={() => set('status', opt.value)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: selected ? opt.color : Colors.textMuted },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusOptionLabel,
                        { color: selected ? opt.color : Colors.textSecondary },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Endereço</Text>
            <CustomInput
              label="Rua *"
              placeholder="Ex: Av. Paulista"
              value={form.rua}
              onChangeText={(t) => set('rua', t)}
              error={errors.rua}
              icon="map-outline"
              autoCapitalize="words"
            />
            <CustomInput
              label="Número *"
              placeholder="Ex: 1234"
              value={form.numero}
              onChangeText={(t) => set('numero', t)}
              error={errors.numero}
              icon="home-outline"
            />
            <CustomInput
              label="Bairro *"
              placeholder="Ex: Bela Vista"
              value={form.bairro}
              onChangeText={(t) => set('bairro', t)}
              error={errors.bairro}
              icon="location-outline"
              autoCapitalize="words"
            />
            <CustomInput
              label="Cidade *"
              placeholder="Ex: São Paulo"
              value={form.cidade}
              onChangeText={(t) => set('cidade', t)}
              error={errors.cidade}
              icon="business-outline"
              autoCapitalize="words"
            />
            <CustomInput
              label="Estado *"
              placeholder="Ex: SP"
              value={form.estado}
              onChangeText={(t) => set('estado', t.slice(0, 2).toUpperCase())}
              error={errors.estado}
              icon="flag-outline"
              maxLength={2}
              autoCapitalize="characters"
            />
            <CustomInput
              label="CEP *"
              placeholder="00000-000"
              value={form.cep}
              onChangeText={(t) => set('cep', applyCepMask(t))}
              error={errors.cep}
              icon="mail-outline"
              keyboardType="numeric"
              maxLength={9}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Coordenadas</Text>
            <CustomInput
              label="Latitude"
              placeholder="Ex: -23.5505"
              value={form.latitude}
              onChangeText={(t) => set('latitude', t)}
              icon="navigate-outline"
              keyboardType="decimal-pad"
              optional
            />
            <CustomInput
              label="Longitude"
              placeholder="Ex: -46.6333"
              value={form.longitude}
              onChangeText={(t) => set('longitude', t)}
              icon="navigate-outline"
              keyboardType="decimal-pad"
              optional
            />
          </View>

          <CustomButton
            label={isEdit ? 'Salvar Alterações' : 'Cadastrar Abrigo'}
            onPress={handleSubmit}
            loading={loading}
          />
          {isEdit && (
            <CustomButton
              label="Excluir Abrigo"
              onPress={handleDelete}
              variant="danger"
              disabled={loading}
            />
          )}
          <CustomButton
            label="Cancelar"
            onPress={() => router.back()}
            variant="outline"
            disabled={loading}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Theme.spacing.md, gap: Theme.spacing.md, paddingBottom: 40 },
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.warningBg,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: `${Colors.accent}44`,
  },
  editBannerText: {
    color: Colors.accentLight,
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semiBold,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
    marginBottom: -Theme.spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOptionLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semiBold,
  },
});
