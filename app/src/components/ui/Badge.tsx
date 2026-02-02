import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useThemeStore } from '@/store';
import { Colors, BorderRadius, FontSizes, Spacing } from '@/constants';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  const { theme } = useThemeStore();
  const isDark = theme.mode === 'dark';

  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'primary':
        return Colors.primary[500] + '20'; // 20% opacity
      case 'success':
        return Colors.success + '20';
      case 'warning':
        return Colors.warning + '20';
      case 'error':
        return Colors.error + '20';
      case 'outline':
        return 'transparent';
      default:
        return isDark ? Colors.dark.cardSecondary : Colors.light.cardSecondary;
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return Colors.primary[500];
      case 'success':
        return Colors.success;
      case 'warning':
        return Colors.warning;
      case 'error':
        return Colors.error;
      case 'outline':
        return theme.colors.text;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getBorderColor = (): string => {
    if (variant === 'outline') {
      return theme.colors.border;
    }
    return 'transparent';
  };

  const sizeStyles = {
    sm: {
      paddingVertical: 2,
      paddingHorizontal: Spacing.sm,
      fontSize: FontSizes.xs,
    },
    md: {
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.md,
      fontSize: FontSizes.sm,
    },
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingVertical: sizeStyles[size].paddingVertical,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: sizeStyles[size].fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// Status badge for game status
interface StatusBadgeProps {
  status: 'open' | 'full' | 'cancelled' | 'completed';
  style?: ViewStyle;
}

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const getVariant = (): BadgeProps['variant'] => {
    switch (status) {
      case 'open':
        return 'success';
      case 'full':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getLabel = (): string => {
    switch (status) {
      case 'open':
        return 'פתוח';
      case 'full':
        return 'מלא';
      case 'cancelled':
        return 'בוטל';
      case 'completed':
        return 'הסתיים';
      default:
        return status;
    }
  };

  return <Badge label={getLabel()} variant={getVariant()} style={style} />;
}

// Format badge for game format
interface FormatBadgeProps {
  format: string;
  style?: ViewStyle;
}

export function FormatBadge({ format, style }: FormatBadgeProps) {
  return <Badge label={format} variant="primary" style={style} />;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
