import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  MessageCircle,
  Share2,
  UserPlus,
  UserMinus,
  MoreVertical,
  ExternalLink,
  X,
} from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { useThemeStore, useGamesStore, useAuthStore } from '@/store';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useGameSubscription } from '@/hooks/useChat';
import {
  Button,
  Avatar,
  AvatarGroup,
  StatusBadge,
  FormatBadge,
  Loading,
  Card,
} from '@/components/ui';
import { MiniMap } from '@/components/game';
import { Colors, FontSizes, Spacing, BorderRadius, Shadows } from '@/constants';

export default function GameDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useThemeStore();
  const { profile, session } = useAuthStore();
  const {
    currentGame,
    isLoading,
    fetchGameDetails,
    joinGame,
    leaveGame,
    cancelGame,
    approveParticipant,
    declineParticipant,
  } = useGamesStore();
  const { logGameViewed, logGameJoined, logGameLeft } = useAnalytics();
  const { lastUpdate } = useGameSubscription(id || '');

  const [isJoining, setIsJoining] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGameDetails(id);
      logGameViewed(id);
    }
  }, [id, lastUpdate]);

  const isOrganizer = profile?.id === currentGame?.organizer_id;
  const isParticipant = currentGame?.participants.some(
    (p) => p.user_id === profile?.id && p.status === 'joined' && p.is_approved
  );
  const isPending = currentGame?.participants.some(
    (p) => p.user_id === profile?.id && p.status === 'pending'
  );
  const approvedParticipants =
    currentGame?.participants.filter(
      (p) => p.status === 'joined' && p.is_approved
    ) || [];
  const pendingParticipants =
    currentGame?.participants.filter((p) => p.status === 'pending') || [];

  const handleJoin = async () => {
    if (!session) {
      router.push('/(auth)/login');
      return;
    }

    if (!profile?.id || !id) return;

    try {
      setIsJoining(true);
      await joinGame(id, profile.id);
      logGameJoined(id, currentGame?.is_public || false);
      Alert.alert(
        currentGame?.is_public ? 'הצטרפת!' : 'בקשה נשלחה',
        currentGame?.is_public
          ? 'הצטרפת למשחק בהצלחה'
          : 'בקשת ההצטרפות נשלחה למארגן'
      );
    } catch (error: any) {
      Alert.alert('שגיאה', error.message || 'לא הצלחנו להצטרף למשחק');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!profile?.id || !id) return;

    Alert.alert('עזיבת משחק', 'האם אתה בטוח שברצונך לעזוב את המשחק?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'עזוב',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveGame(id, profile.id);
            logGameLeft(id);
          } catch (error: any) {
            Alert.alert('שגיאה', error.message);
          }
        },
      },
    ]);
  };

  const handleCancel = async () => {
    if (!id) return;

    Alert.alert('ביטול משחק', 'האם אתה בטוח שברצונך לבטל את המשחק?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'בטל משחק',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelGame(id);
            router.back();
          } catch (error: any) {
            Alert.alert('שגיאה', error.message);
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    // TODO: Implement deep linking
    Alert.alert('שיתוף', 'שיתוף משחקים יהיה זמין בקרוב!');
  };

  const handleOpenMaps = () => {
    if (currentGame?.location_lat && currentGame?.location_lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${currentGame.location_lat},${currentGame.location_lng}`;
      Linking.openURL(url);
    }
  };

  const handleApprove = async (participantId: string) => {
    try {
      await approveParticipant(participantId);
      fetchGameDetails(id!);
    } catch (error: any) {
      Alert.alert('שגיאה', error.message);
    }
  };

  const handleDecline = async (participantId: string) => {
    try {
      await declineParticipant(participantId);
      fetchGameDetails(id!);
    } catch (error: any) {
      Alert.alert('שגיאה', error.message);
    }
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'EEEE, d בMMMM yyyy', { locale: he });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string): string => {
    try {
      const [hours, minutes] = timeStr.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeStr;
    }
  };

  if (isLoading || !currentGame) {
    return <Loading fullScreen message="טוען פרטי משחק..." />;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          פרטי משחק
        </Text>
        <TouchableOpacity onPress={handleShare}>
          <Share2 size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title & Status */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {currentGame.title}
            </Text>
            <StatusBadge status={currentGame.status} />
          </View>
          <FormatBadge format={currentGame.format} />
        </View>

        {/* Organizer */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.organizerRow}>
            <View style={styles.organizerInfo}>
              <Avatar
                source={currentGame.organizer_photo}
                name={currentGame.organizer_name}
                size="md"
              />
              <View style={styles.organizerText}>
                <Text style={[styles.label, { color: theme.colors.muted }]}>
                  מארגן
                </Text>
                <Text style={[styles.organizerName, { color: theme.colors.text }]}>
                  {currentGame.organizer_name}
                </Text>
              </View>
            </View>
            {isOrganizer && (
              <TouchableOpacity onPress={handleCancel}>
                <X size={20} color={Colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Details */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.detailRow}>
            <Calendar size={20} color={Colors.primary[500]} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {formatDate(currentGame.game_date)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={20} color={Colors.primary[500]} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {formatTime(currentGame.start_time)}
            </Text>
          </View>
          <TouchableOpacity style={styles.detailRow} onPress={handleOpenMaps}>
            <MapPin size={20} color={Colors.football[400]} />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {currentGame.location_text}
            </Text>
            <ExternalLink size={16} color={theme.colors.muted} />
          </TouchableOpacity>
        </Card>

        {/* Map */}
        {currentGame.location_lat && currentGame.location_lng && (
          <Card variant="elevated" padding="none" style={styles.section}>
            <MiniMap
              latitude={currentGame.location_lat}
              longitude={currentGame.location_lng}
              title={currentGame.location_text}
            />
          </Card>
        )}

        {/* Participants */}
        <Card variant="elevated" style={styles.section}>
          <TouchableOpacity
            style={styles.participantsHeader}
            onPress={() => setShowParticipants(!showParticipants)}
          >
            <View style={styles.participantsTitle}>
              <Users size={20} color={Colors.primary[500]} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                משתתפים ({currentGame.current_players}/{currentGame.max_players})
              </Text>
            </View>
            <AvatarGroup
              avatars={approvedParticipants.map((p) => ({
                source: p.user?.profile_photo_url,
                name: p.user?.name,
              }))}
              max={5}
              size="sm"
            />
          </TouchableOpacity>

          {showParticipants && (
            <View style={styles.participantsList}>
              {/* Organizer */}
              <View style={styles.participantRow}>
                <Avatar
                  source={currentGame.organizer_photo}
                  name={currentGame.organizer_name}
                  size="sm"
                />
                <Text style={[styles.participantName, { color: theme.colors.text }]}>
                  {currentGame.organizer_name}
                </Text>
                <Text style={[styles.organizerBadge, { color: Colors.primary[500] }]}>
                  מארגן
                </Text>
              </View>

              {/* Approved participants */}
              {approvedParticipants.map((p) => (
                <View key={p.id} style={styles.participantRow}>
                  <Avatar
                    source={p.user?.profile_photo_url}
                    name={p.user?.name}
                    size="sm"
                  />
                  <Text
                    style={[styles.participantName, { color: theme.colors.text }]}
                  >
                    {p.user?.name}
                  </Text>
                </View>
              ))}

              {/* Pending requests (only for organizer) */}
              {isOrganizer && pendingParticipants.length > 0 && (
                <>
                  <Text
                    style={[styles.pendingTitle, { color: theme.colors.muted }]}
                  >
                    ממתינים לאישור
                  </Text>
                  {pendingParticipants.map((p) => (
                    <View key={p.id} style={styles.participantRow}>
                      <Avatar
                        source={p.user?.profile_photo_url}
                        name={p.user?.name}
                        size="sm"
                      />
                      <Text
                        style={[
                          styles.participantName,
                          { color: theme.colors.text },
                        ]}
                      >
                        {p.user?.name}
                      </Text>
                      <View style={styles.approvalButtons}>
                        <TouchableOpacity
                          style={styles.approveButton}
                          onPress={() => handleApprove(p.id)}
                        >
                          <Text style={styles.approveButtonText}>אשר</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.declineButton}
                          onPress={() => handleDecline(p.id)}
                        >
                          <Text style={styles.declineButtonText}>דחה</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
        </Card>

        {/* Notes */}
        {currentGame.notes && (
          <Card variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              הערות
            </Text>
            <Text style={[styles.notes, { color: theme.colors.textSecondary }]}>
              {currentGame.notes}
            </Text>
          </Card>
        )}

        {/* Chat preview */}
        {(isOrganizer || isParticipant) && (
          <TouchableOpacity
            style={[styles.chatButton, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push(`/chat/${id}`)}
          >
            <MessageCircle size={24} color={Colors.primary[500]} />
            <Text style={[styles.chatButtonText, { color: theme.colors.text }]}>
              צ׳אט קבוצתי
            </Text>
            {currentGame.messages.length > 0 && (
              <Text style={[styles.messageCount, { color: theme.colors.muted }]}>
                {currentGame.messages.length} הודעות
              </Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom action button */}
      {currentGame.status === 'open' && !isOrganizer && (
        <View
          style={[
            styles.bottomAction,
            { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border },
          ]}
        >
          {isPending ? (
            <Button
              title="ממתין לאישור"
              variant="secondary"
              disabled
              fullWidth
            />
          ) : isParticipant ? (
            <Button
              title="עזוב משחק"
              variant="outline"
              onPress={handleLeave}
              fullWidth
              leftIcon={<UserMinus size={20} color={Colors.primary[500]} />}
            />
          ) : (
            <Button
              title={currentGame.is_public ? 'הצטרף למשחק' : 'בקש להצטרף'}
              onPress={handleJoin}
              isLoading={isJoining}
              fullWidth
              leftIcon={<UserPlus size={20} color="#FFFFFF" />}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  titleSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerText: {
    marginLeft: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    textAlign: 'right',
  },
  organizerName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    textAlign: 'right',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  detailText: {
    fontSize: FontSizes.base,
    flex: 1,
    textAlign: 'right',
  },
  participantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    textAlign: 'right',
  },
  participantsList: {
    marginTop: Spacing.lg,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  participantName: {
    fontSize: FontSizes.base,
    flex: 1,
    textAlign: 'right',
  },
  organizerBadge: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  pendingTitle: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  approvalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  approveButton: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  approveButtonText: {
    color: Colors.success,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  declineButtonText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  notes: {
    fontSize: FontSizes.base,
    marginTop: Spacing.sm,
    lineHeight: 22,
    textAlign: 'right',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  chatButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  messageCount: {
    fontSize: FontSizes.sm,
  },
  bottomPadding: {
    height: 120,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    borderTopWidth: 1,
    ...Shadows.lg,
  },
});
