import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useThemeStore } from '@/store';
import { BorderRadius, Shadows, Spacing } from '@/constants';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  pressable?: boolean;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  pressable = false,
  style,
  ...props
}: CardProps) {
  const { theme } = useThemeStore();

  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'outlined':
        return 'transparent';
      default:
        return theme.colors.card;
    }
  };

  const getBorderStyle = (): ViewStyle => {
    if (variant === 'outlined') {
      return {
        borderWidth: 1,
        borderColor: theme.colors.border,
      };
    }
    return {};
  };

  const getPadding = (): number => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return Spacing.sm;
      case 'lg':
        return Spacing.xl;
      default:
        return Spacing.lg;
    }
  };

  const cardStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    padding: getPadding(),
    borderRadius: BorderRadius.card,
    ...getBorderStyle(),
    ...(variant === 'elevated' ? Shadows.card : {}),
  };

  if (pressable) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

// Section Card with title
interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function SectionCard({ title, children, action, style }: SectionCardProps) {
  const { theme } = useThemeStore();

  return (
    <Card variant="elevated" style={style}>
      {(title || action) && (
        <View style={styles.header}>
          {title && (
            <View style={styles.titleContainer}>
              {/* Title text would go here but we avoid Text in this component */}
            </View>
          )}
          {action}
        </View>
      )}
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
});
