import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function CadastroDoacaoRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(tabs)/doacoes' as never);
  }, []);

  return null;
}
