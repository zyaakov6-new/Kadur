import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '@/store';
import { FontSizes, Spacing } from '@/constants';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const { theme } = useThemeStore();

  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>

      {description && (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSizes.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  button: {
    minWidth: 160,
  },
});
