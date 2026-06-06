import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Loading';

export default function Index() {
  const { user, isLoading } = useAuth();
  const [checked, setChecked] = useState(false);
  const [seenWelcome, setSeenWelcome] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('hasSeenWelcome').then((val) => {
      setSeenWelcome(val === 'true');
      setChecked(true);
    });
  }, []);

  if (isLoading || !checked) return <Loading fullScreen />;
  if (!seenWelcome) return <Redirect href="/boasvindas" />;
  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />;
}
