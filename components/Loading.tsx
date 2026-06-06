import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

interface Props {
  message?: string;
  fullScreen?: boolean;
}

export default function Loading({ message = 'Carregando...', fullScreen = false }: Props) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.md,
  },
});
