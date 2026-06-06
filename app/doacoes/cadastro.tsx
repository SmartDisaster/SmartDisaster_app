import { useEffect } from 'react';
import { useRouter } from 'expo-router';

/**
 * Redireciona para o novo fluxo de doações iniciado pela aba principal.
 * O fluxo real é: aba Doações → escolher abrigo → /doacoes/novo/[abrigoId]
 */
export default function CadastroDoacaoRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(tabs)/doacoes' as never);
  }, []);

  return null;
}
