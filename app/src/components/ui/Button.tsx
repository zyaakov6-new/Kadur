import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useThemeStore } from '@/store';
import { Colors, BorderRadius, Shadows, FontSizes, Spacing } from '@/constants';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { theme } = useThemeStore();
  const isDark = theme.mode === 'dark';

  const getBackgroundColor = (): string => {
    if (disabled) return isDark ? Colors.dark.border : Colors.light.border;

    switch (variant) {
      case 'primary':
        return Colors.primary[500];
      case 'secondary':
        return Colors.football[400];
      case 'outline':
      case 'ghost':
        return 'transparent';
      case 'danger':
        return Colors.error;
      default:
        return Colors.primary[500];
    }
  };

  const getTextColor = (): string => {
    if (disabled) return isDark ? Colors.dark.muted : Colors.light.muted;

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
        return Colors.primary[500];
      case 'ghost':
        return theme.colors.text;
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = (): string => {
    if (variant === 'outline') {
      return disabled
        ? isDark
          ? Colors.dark.border
          : Colors.light.border
        : Colors.primary[500];
    }
    return 'transparent';
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.md,
            minHeight: 36,
          },
          text: { fontSize: FontSizes.sm },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: Spacing.lg,
            paddingHorizontal: Spacing['2xl'],
            minHeight: 56,
          },
          text: { fontSize: FontSizes.lg },
        };
      default:
        return {
          container: {
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.xl,
            minHeight: 48,
          },
          text: { fontSize: FontSizes.base },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        sizeStyles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 2 : 0,
        },
        variant === 'primary' && !disabled && Shadows.button,
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              { color: getTextColor() },
              leftIcon && styles.textWithLeftIcon,
              rightIcon && styles.textWithRightIcon,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.button,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textWithLeftIcon: {
    marginLeft: Spacing.sm,
  },
  textWithRightIcon: {
    marginRight: Spacing.sm,
  },
});
