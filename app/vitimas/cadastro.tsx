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
import { createVitima, updateVitima, deleteVitima, getVitimaById } from '../../services/vitimaService';
import { getAbrigos } from '../../services/abrigoService';
import { Abrigo } from '../../types';
import { applyCpfMask, applyDateMask, displayDateToISO, isoToDisplayDate, isValidCpf, isValidDisplayDate } from '../../utils/formatters';
import Header from '../../components/Header';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import Loading from '../../components/Loading';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';

interface FormState {
  nome: string;
  cpf: string;
  dataNascimento: string;
  condicaoSaude: string;
  abrigoId: number | null;
}

interface FormErrors {
  nome?: string;
  cpf?: string;
  dataNascimento?: string;
  abrigoId?: string;
}

export default function CadastroVitimaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState<FormState>({ nome: '', cpf: '', dataNascimento: '', condicaoSaude: '', abrigoId: null });
  const [errors, setErrors] = useState<FormErrors>({});
  const [abrigos, setAbrigos] = useState<Abrigo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const abrigosResult = await getAbrigos(0, 100);
        setAbrigos(abrigosResult.content);
        if (isEdit && id) {
          const numId = Number(id);
          if (isNaN(numId)) throw new Error('ID inválido');
          const vitima = await getVitimaById(numId);
          setForm({
            nome: vitima.nome,
            cpf: applyCpfMask(vitima.cpf),
            dataNascimento: isoToDisplayDate(vitima.dataNascimento),
            condicaoSaude: vitima.condicaoSaude ?? '',
            abrigoId: vitima.abrigoId,
          });
        }
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar os dados.');
      } finally {
        setLoadingData(false);
      }
    }
    init();
  }, [id, isEdit]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.nome.trim()) next.nome = 'Nome obrigatório';
    const cpfDigits = form.cpf.replace(/\D/g, '');
    if (cpfDigits && !isValidCpf(cpfDigits)) next.cpf = 'CPF inválido';
    if (!form.dataNascimento.trim()) next.dataNascimento = 'Data de nascimento obrigatória';
    else if (!isValidDisplayDate(form.dataNascimento)) next.dataNascimento = 'Data inválida. Formato: DD/MM/AAAA';
    else {
      const iso = displayDateToISO(form.dataNascimento);
      const date = new Date(iso);
      if (date >= new Date()) next.dataNascimento = 'Data deve ser no passado';
    }
    if (!form.abrigoId) next.abrigoId = 'Selecione um abrigo';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const cpfDigits = form.cpf.replace(/\D/g, '');
    const payload = {
      nome: form.nome.trim(),
      cpf: cpfDigits || undefined,
      dataNascimento: displayDateToISO(form.dataNascimento),
      condicaoSaude: form.condicaoSaude.trim() || undefined,
      abrigoId: form.abrigoId!,
    };
    try {
      if (isEdit && id) {
        await updateVitima(Number(id)!, payload);
        Alert.alert('Sucesso', 'Vítima atualizada com sucesso!', [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        await createVitima(payload);
        Alert.alert('Sucesso', 'Vítima cadastrada com sucesso!', [{ text: 'OK', onPress: () => router.back() }]);
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
      'Excluir Vítima',
      `Deseja realmente excluir ${form.nome}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteVitima(Number(id)!);
              Alert.alert('Excluído', 'Vítima removida com sucesso.', [{ text: 'OK', onPress: () => router.back() }]);
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
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.flex}>
        <Header
          title={isEdit ? 'Editar Vítima' : 'Cadastrar Vítima'}
          showBack
          rightAction={isEdit ? { icon: 'trash-outline', onPress: handleDelete } : undefined}
        />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {isEdit && (
            <View style={styles.editBanner}>
              <Ionicons name="create-outline" size={16} color={Colors.accent} />
              <Text style={styles.editBannerText}>Modo edição — ID #{id}</Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dados Pessoais</Text>
            <CustomInput
              label="Nome Completo *"
              placeholder="Nome da vítima"
              value={form.nome}
              onChangeText={(t) => set('nome', t)}
              error={errors.nome}
              icon="person-outline"
              autoCapitalize="words"
            />
            <CustomInput
              label="CPF"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChangeText={(t) => set('cpf', applyCpfMask(t))}
              error={errors.cpf}
              icon="card-outline"
              keyboardType="numeric"
              maxLength={14}
              optional
            />
            <CustomInput
              label="Data de Nascimento *"
              placeholder="DD/MM/AAAA"
              value={form.dataNascimento}
              onChangeText={(t) => set('dataNascimento', applyDateMask(t))}
              error={errors.dataNascimento}
              icon="calendar-outline"
              keyboardType="numeric"
              maxLength={10}
            />
            <CustomInput
              label="Condição de Saúde"
              placeholder="Descreva condições ou necessidades especiais"
              value={form.condicaoSaude}
              onChangeText={(t) => set('condicaoSaude', t)}
              icon="medical-outline"
              multiline
              numberOfLines={3}
              style={styles.multiline}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Abrigo de Destino *</Text>
            {errors.abrigoId && <Text style={styles.fieldError}>{errors.abrigoId}</Text>}
            {abrigos.length === 0 ? (
              <Text style={styles.noAbrigosText}>Nenhum abrigo disponível.</Text>
            ) : (
              <View style={styles.abrigoList}>
                {abrigos.map((a) => {
                  const isSelected = form.abrigoId === a.id;
                  const isLotado = a.status === 'LOTADO';
                  return (
                    <TouchableOpacity
                      key={a.id}
                      style={[
                        styles.abrigoOption,
                        isSelected && styles.abrigoOptionSelected,
                        isLotado && !isSelected && styles.abrigoOptionLotado,
                      ]}
                      onPress={() => set('abrigoId', a.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.abrigoOptionLeft}>
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={20}
                          color={isSelected ? Colors.primary : Colors.textMuted}
                        />
                        <View>
                          <Text style={[styles.abrigoOptionNome, isLotado && !isSelected && { color: Colors.textMuted }]}>
                            {a.nome}
                          </Text>
                          <Text style={styles.abrigoOptionSub}>
                            {a.endereco?.cidade} — Cap. {a.capacidadeMaxima}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.statusMini, { backgroundColor: isLotado ? Colors.dangerBg : Colors.successBg }]}>
                        <Text style={[styles.statusMiniText, { color: isLotado ? Colors.danger : Colors.success }]}>
                          {a.status}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <CustomButton
            label={isEdit ? 'Salvar Alterações' : 'Cadastrar Vítima'}
            onPress={handleSubmit}
            loading={loading}
          />
          {isEdit && (
            <CustomButton
              label="Excluir Vítima"
              onPress={handleDelete}
              variant="danger"
              disabled={loading}
            />
          )}
          <CustomButton label="Cancelar" onPress={() => router.back()} variant="outline" disabled={loading} />
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
  editBannerText: { color: Colors.accentLight, fontSize: Theme.fontSize.sm, fontWeight: Theme.fontWeight.medium },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    gap: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: { color: Colors.text, fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.semiBold },
  multiline: { height: 80, textAlignVertical: 'top', paddingTop: 8 },
  fieldError: { color: Colors.danger, fontSize: Theme.fontSize.sm },
  noAbrigosText: { color: Colors.textSecondary, fontSize: Theme.fontSize.md, textAlign: 'center' },
  abrigoList: { gap: Theme.spacing.sm },
  abrigoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface2,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  abrigoOptionSelected: { borderColor: Colors.primary, backgroundColor: Colors.infoBg },
  abrigoOptionLotado: { opacity: 0.5 },
  abrigoOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.md, flex: 1 },
  abrigoOptionNome: { color: Colors.text, fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.medium },
  abrigoOptionSub: { color: Colors.textSecondary, fontSize: Theme.fontSize.sm, marginTop: 2 },
  statusMini: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Theme.borderRadius.full },
  statusMiniText: { fontSize: Theme.fontSize.xs, fontWeight: Theme.fontWeight.semiBold },
});
