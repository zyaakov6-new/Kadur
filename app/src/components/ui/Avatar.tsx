import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { User } from 'lucide-react-native';
import { useThemeStore } from '@/store';
import { Colors, BorderRadius } from '@/constants';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
  style?: ViewStyle;
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const fontSizeMap = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 20,
  xl: 28,
};

export function Avatar({
  source,
  name,
  size = 'md',
  showBorder = false,
  style,
}: AvatarProps) {
  const { theme } = useThemeStore();
  const isDark = theme.mode === 'dark';
  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];

  // Get initials from name
  const getInitials = (name?: string): string => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    borderWidth: showBorder ? 2 : 0,
    borderColor: showBorder ? Colors.primary[500] : 'transparent',
  };

  if (source) {
    return (
      <View style={[styles.container, containerStyle, style]}>
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            { width: dimension - (showBorder ? 4 : 0), height: dimension - (showBorder ? 4 : 0), borderRadius: dimension / 2 },
          ]}
        />
      </View>
    );
  }

  if (name) {
    return (
      <View
        style={[
          styles.container,
          styles.placeholder,
          containerStyle,
          {
            backgroundColor: Colors.primary[500],
          },
          style,
        ]}
      >
        <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        styles.placeholder,
        containerStyle,
        {
          backgroundColor: isDark ? Colors.dark.cardSecondary : Colors.light.cardSecondary,
        },
        style,
      ]}
    >
      <User size={dimension * 0.5} color={theme.colors.muted} />
    </View>
  );
}

// Avatar group component
interface AvatarGroupProps {
  avatars: { source?: string | null; name?: string }[];
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function AvatarGroup({ avatars, max = 4, size = 'sm' }: AvatarGroupProps) {
  const { theme } = useThemeStore();
  const dimension = sizeMap[size];
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <View style={styles.group}>
      {displayAvatars.map((avatar, index) => (
        <View
          key={index}
          style={[
            styles.groupItem,
            { marginLeft: index > 0 ? -dimension * 0.3 : 0 },
          ]}
        >
          <Avatar
            source={avatar.source}
            name={avatar.name}
            size={size}
            showBorder
          />
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={[
            styles.groupItem,
            styles.remaining,
            {
              marginLeft: -dimension * 0.3,
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor: theme.colors.cardSecondary,
              borderWidth: 2,
              borderColor: Colors.primary[500],
            },
          ]}
        >
          <Text style={[styles.remainingText, { fontSize: fontSizeMap[size] }]}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupItem: {
    zIndex: 1,
  },
  remaining: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingText: {
    color: Colors.primary[500],
    fontWeight: '600',
  },
});
