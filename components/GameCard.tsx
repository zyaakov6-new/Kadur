import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { MapPin, Clock, Users } from 'lucide-react-native';
import { Game } from '@/types';
import Colors from '@/constants/colors';
import { getRelativeDay, formatTime } from '@/utils/date';
import { useQuery } from '@tanstack/react-query';
import * as Storage from '@/services/storage';

interface Props {
  game: Game;
  onPress: () => void;
}

function GameCard({ game, onPress }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const participantsQuery = useQuery({
    queryKey: ['participants', game.id],
    queryFn: () => Storage.getParticipants(game.id),
  });

  const count = participantsQuery.data?.length ?? 0;
  const fillPercent = Math.min((count / game.maxPlayers) * 100, 100);

  const statusColor =
    game.status === 'open'
      ? Colors.statusOpen
      : game.status === 'full'
        ? Colors.statusFull
        : Colors.statusClosed;

  const statusLabel =
    game.status === 'open' ? 'פתוח' : game.status === 'full' ? 'מלא' : 'סגור';

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const priceText =
    game.pricePerPlayer === 0
      ? 'חינם'
      : `${game.pricePerPlayer} ₪`;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={`game-card-${game.id}`}
    >
      <Animated.View
        style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.topRow}>
          <View style={styles.dateTimeBadge}>
            <Text style={styles.relativeDay}>{getRelativeDay(game.date)}</Text>
            <Text style={styles.timeText}>{formatTime(game.date)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '1A' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {game.title}
        </Text>

        <View style={styles.infoRow}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {game.locationAddress}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.playersInfo}>
            <Users size={14} color={Colors.primary} />
            <Text style={styles.playersText}>
              {count}/{game.maxPlayers} שחקנים
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${fillPercent}%`,
                    backgroundColor:
                      fillPercent >= 100 ? Colors.warning : Colors.primary,
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{priceText}</Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default React.memo(GameCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  relativeDay: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  playersText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text,
    writingDirection: 'rtl',
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    marginLeft: 8,
    maxWidth: 80,
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  priceBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});
