import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Theme from '../constants/theme';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  optional?: boolean;
}

export default function CustomInput({ label, error, icon, isPassword = false, optional = false, style, ...rest }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isMultiline = !!rest.multiline;

  const isRequired = label.endsWith('*');
  const cleanLabel = label.replace(/\s*\*$/, '');

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {cleanLabel}
          {isRequired && <Text style={styles.required}> *</Text>}
        </Text>
        {optional && <Text style={styles.optionalBadge}>opcional</Text>}
      </View>
      <View style={[
        styles.inputContainer,
        isMultiline && styles.multilineContainer,
        error ? styles.errorBorder : styles.normalBorder,
      ]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={Colors.textSecondary}
            style={[styles.icon, isMultiline && styles.iconTop]}
          />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
    letterSpacing: 0.3,
  },
  optionalBadge: {
    color: Colors.textMuted,
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.regular,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1.5,
    paddingHorizontal: Theme.spacing.md,
    height: 52,
  },
  multilineContainer: {
    height: undefined,
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  normalBorder: {
    borderColor: Colors.border,
  },
  errorBorder: {
    borderColor: Colors.danger,
  },
  icon: {
    marginRight: Theme.spacing.sm,
  },
  iconTop: {
    marginTop: 1,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: Theme.fontSize.md,
  },
  required: {
    color: Colors.danger,
    fontWeight: '700',
  },
  eyeButton: {
    padding: 4,
  },
  error: {
    color: Colors.danger,
    fontSize: Theme.fontSize.sm,
  },
});
