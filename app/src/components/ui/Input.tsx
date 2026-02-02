import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useThemeStore } from '@/store';
import { Colors, BorderRadius, FontSizes, Spacing } from '@/constants';

// Force RTL for Hebrew
I18nManager.forceRTL(true);

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  isPassword = false,
  style,
  ...props
}: InputProps) {
  const { theme } = useThemeStore();
  const isDark = theme.mode === 'dark';
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getBorderColor = () => {
    if (error) return Colors.error;
    if (isFocused) return Colors.primary[500];
    return theme.colors.border;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.card,
            borderColor: getBorderColor(),
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              textAlign: 'right',
            },
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || isPassword) && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={theme.colors.muted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={theme.colors.muted} />
            ) : (
              <Eye size={20} color={theme.colors.muted} />
            )}
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && (
        <Text style={[styles.hint, { color: theme.colors.muted }]}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.input,
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSizes.base,
    writingDirection: 'rtl',
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.sm,
  },
  leftIcon: {
    paddingLeft: Spacing.md,
  },
  rightIcon: {
    paddingRight: Spacing.md,
  },
  error: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  hint: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
});
