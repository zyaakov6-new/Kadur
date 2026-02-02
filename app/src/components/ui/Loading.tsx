import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { useThemeStore } from '@/store';
import { Colors, FontSizes, Spacing } from '@/constants';

interface LoadingProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export function Loading({
  size = 'large',
  message,
  fullScreen = false,
  style,
}: LoadingProps) {
  const { theme } = useThemeStore();

  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreen,
          { backgroundColor: theme.colors.background },
          style,
        ]}
      >
        <ActivityIndicator size={size} color={Colors.primary[500]} />
        {message && (
          <Text style={[styles.message, { color: theme.colors.text }]}>
            {message}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={Colors.primary[500]} />
      {message && (
        <Text style={[styles.message, { color: theme.colors.text }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

// Skeleton loader component
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const { theme } = useThemeStore();

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.cardSecondary,
        },
        style,
      ]}
    />
  );
}

// Card skeleton
export function CardSkeleton() {
  const { theme } = useThemeStore();

  return (
    <View
      style={[styles.cardSkeleton, { backgroundColor: theme.colors.card }]}
    >
      <View style={styles.cardSkeletonHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.cardSkeletonHeaderText}>
          <Skeleton width={120} height={16} />
          <Skeleton width={80} height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
      <Skeleton width="100%" height={60} style={{ marginTop: 12 }} />
      <View style={styles.cardSkeletonFooter}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={80} height={16} />
      </View>
    </View>
  );
}

// List of card skeletons
interface CardSkeletonListProps {
  count?: number;
}

export function CardSkeletonList({ count = 3 }: CardSkeletonListProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: Spacing.md,
    fontSize: FontSizes.base,
    textAlign: 'center',
  },
  skeleton: {
    opacity: 0.5,
  },
  cardSkeleton: {
    padding: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.md,
  },
  cardSkeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSkeletonHeaderText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  cardSkeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
});
