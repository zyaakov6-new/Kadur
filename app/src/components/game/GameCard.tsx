import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, Clock, Users } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { useThemeStore } from '@/store';
import { GameWithOrganizer } from '@/types/database';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge, FormatBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Colors, FontSizes, Spacing, Shadows, BorderRadius } from '@/constants';

interface GameCardProps {
  game: GameWithOrganizer;
  onPress: () => void;
  showDistance?: boolean;
}

export function GameCard({ game, onPress, showDistance = true }: GameCardProps) {
  const { theme } = useThemeStore();

  const formatDate = (dateStr: string): string => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'EEEE, d בMMMM', { locale: he });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string): string => {
    try {
      // Time is in HH:mm:ss format
      const [hours, minutes] = timeStr.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeStr;
    }
  };

  const spotsLeft = game.max_players - game.current_players;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card variant="elevated" style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar
              source={game.organizer_photo}
              name={game.organizer_name}
              size="md"
            />
            <View style={styles.headerText}>
              <Text
                style={[styles.title, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {game.title}
              </Text>
              <Text style={[styles.organizer, { color: theme.colors.muted }]}>
                מאורגן ע״י {game.organizer_name}
              </Text>
            </View>
          </View>
          <View style={styles.badges}>
            <FormatBadge format={game.format} />
            <StatusBadge status={game.status} style={styles.statusBadge} />
          </View>
        </View>

        {/* Info rows */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Calendar size={16} color={Colors.primary[500]} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {formatDate(game.date)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Clock size={16} color={Colors.primary[500]} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {formatTime(game.time)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MapPin size={16} color={Colors.football[400]} />
              <Text
                style={[styles.infoText, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {game.location_text}
              </Text>
            </View>
            {showDistance && game.distance_km !== undefined && (
              <Text style={[styles.distance, { color: theme.colors.muted }]}>
                {game.distance_km.toFixed(1)} ק״מ
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View
          style={[
            styles.footer,
            { borderTopColor: theme.colors.border },
          ]}
        >
          <View style={styles.playersInfo}>
            <Users size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.playersText, { color: theme.colors.text }]}>
              {game.current_players}/{game.max_players}
            </Text>
            {spotsLeft > 0 && game.status === 'open' && (
              <Text style={[styles.spotsLeft, { color: Colors.football[400] }]}>
                ({spotsLeft} מקומות פנויים)
              </Text>
            )}
          </View>

          {!game.is_public && (
            <View style={styles.privateBadge}>
              <Text style={styles.privateText}>פרטי</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    textAlign: 'right',
  },
  organizer: {
    fontSize: FontSizes.sm,
    marginTop: 2,
    textAlign: 'right',
  },
  badges: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    marginTop: Spacing.xs,
  },
  infoContainer: {
    marginTop: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: FontSizes.sm,
    marginLeft: Spacing.sm,
    textAlign: 'right',
  },
  distance: {
    fontSize: FontSizes.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  playersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playersText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  spotsLeft: {
    fontSize: FontSizes.sm,
    marginLeft: Spacing.sm,
  },
  privateBadge: {
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  privateText: {
    color: Colors.warning,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
});
