import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Send,
  Ban,
  UserPlus,
  UserMinus,
  Crown,
  MessageCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import * as Storage from '@/services/storage';
import { formatFullDate, formatTime, formatMessageTime } from '@/utils/date';
import { getPositionLabel, getPositionEmoji } from '@/utils/positions';
import { GameParticipant, GameMessage, GameWaitlistEntry } from '@/types';
import {
  simulatePlayerJoinedNotification,
  simulateNewMessageNotification,
} from '@/services/notifications';

type Tab = 'details' | 'chat';

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [messageText, setMessageText] = useState('');
  const messagesListRef = useRef<FlatList>(null);

  const gameQuery = useQuery({
    queryKey: ['game', id],
    queryFn: () => Storage.getGame(id!),
    enabled: !!id,
    refetchInterval: 3000,
  });

  const participantsQuery = useQuery({
    queryKey: ['participants', id],
    queryFn: () => Storage.getParticipants(id!),
    enabled: !!id,
    refetchInterval: 3000,
  });

  const waitlistQuery = useQuery({
    queryKey: ['waitlist', id],
    queryFn: () => Storage.getWaitlist(id!),
    enabled: !!id,
    refetchInterval: 3000,
  });

  const messagesQuery = useQuery({
    queryKey: ['messages', id],
    queryFn: () => Storage.getMessages(id!),
    enabled: !!id,
    refetchInterval: 2000,
  });

  const game = gameQuery.data;
  const participants = participantsQuery.data ?? [];
  const waitlist = waitlistQuery.data ?? [];
  const messages = messagesQuery.data ?? [];

  const isOrganizer = game?.creatorId === user?.id;
  const isParticipant = participants.some((p) => p.userId === user?.id);
  const isOnWaitlist = waitlist.some((w) => w.userId === user?.id);
  const isFull = participants.length >= (game?.maxPlayers ?? 0);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['game', id] });
    queryClient.invalidateQueries({ queryKey: ['participants', id] });
    queryClient.invalidateQueries({ queryKey: ['waitlist', id] });
    queryClient.invalidateQueries({ queryKey: ['games'] });
  };

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error('Missing data');
      return Storage.joinGame(id, user);
    },
    onSuccess: (result) => {
      invalidateAll();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (result === 'joined') {
        simulatePlayerJoinedNotification(user?.name ?? '', game?.title ?? '');
      }
      if (result === 'waitlisted') {
        Alert.alert('רשימת המתנה', 'נרשמת לרשימת ההמתנה. נעדכן אותך כשיתפנה מקום');
      }
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error('Missing data');
      return Storage.leaveGame(id, user.id);
    },
    onSuccess: () => {
      invalidateAll();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Missing id');
      return Storage.closeGame(id);
    },
    onSuccess: () => {
      invalidateAll();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id || !messageText.trim()) throw new Error('Missing data');
      return Storage.addMessage({
        gameId: id,
        senderId: user.id,
        senderName: user.name,
        text: messageText.trim(),
      });
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      simulateNewMessageNotification(user?.name ?? '', game?.title ?? '');
    },
  });

  const handleClose = () => {
    Alert.alert('סגירת משחק', 'האם אתה בטוח שברצונך לסגור את המשחק?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'סגור משחק',
        style: 'destructive',
        onPress: () => closeMutation.mutate(),
      },
    ]);
  };

  const handleLeave = () => {
    Alert.alert('ביטול השתתפות', 'האם אתה בטוח?', [
      { text: 'לא', style: 'cancel' },
      {
        text: 'כן, בטל',
        style: 'destructive',
        onPress: () => leaveMutation.mutate(),
      },
    ]);
  };

  useEffect(() => {
    if (activeTab === 'chat' && messages.length > 0) {
      setTimeout(() => {
        messagesListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages.length, activeTab]);

  if (!game) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const statusColor =
    game.status === 'open'
      ? Colors.statusOpen
      : game.status === 'full'
        ? Colors.statusFull
        : Colors.statusClosed;

  const statusLabel =
    game.status === 'open' ? 'פתוח' : game.status === 'full' ? 'מלא' : 'סגור';

  const priceText =
    game.pricePerPlayer === 0 ? 'חינם' : `${game.pricePerPlayer} ₪ לשחקן`;

  const renderParticipant = ({ item }: { item: GameParticipant }) => {
    const isOrganizerParticipant = item.role === 'organizer';
    return (
      <View style={styles.participantRow}>
        <View style={styles.participantAvatar}>
          <Text style={styles.participantAvatarText}>
            {(item.userName ?? '?')[0]}
          </Text>
        </View>
        <View style={styles.participantInfo}>
          <View style={styles.participantNameRow}>
            <Text style={styles.participantName}>
              {item.userName ?? 'שחקן'}
            </Text>
            {isOrganizerParticipant && (
              <Crown size={14} color={Colors.warning} />
            )}
          </View>
          {item.userPosition && (
            <Text style={styles.participantPosition}>
              {getPositionEmoji(item.userPosition)}{' '}
              {getPositionLabel(item.userPosition)}
            </Text>
          )}
        </View>
        {item.isFromWaitlist && (
          <View style={styles.fromWaitlistBadge}>
            <Text style={styles.fromWaitlistText}>מרשימת המתנה</Text>
          </View>
        )}
      </View>
    );
  };

  const renderMessage = ({ item }: { item: GameMessage }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View
        style={[
          styles.messageBubbleWrap,
          isMe ? styles.messageBubbleWrapMe : styles.messageBubbleWrapOther,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
          ]}
        >
          {!isMe && (
            <Text style={styles.messageSender}>{item.senderName}</Text>
          )}
          <Text
            style={[
              styles.messageText,
              isMe ? styles.messageTextMe : styles.messageTextOther,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMe ? styles.messageTimeMe : styles.messageTimeOther,
            ]}
          >
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderActionButton = () => {
    if (game.status === 'closed') {
      return (
        <View style={[styles.actionButton, styles.actionButtonDisabled]}>
          <Ban size={18} color={Colors.textTertiary} />
          <Text style={styles.actionButtonDisabledText}>המשחק סגור</Text>
        </View>
      );
    }

    if (isOrganizer) {
      return (
        <Pressable
          style={[styles.actionButton, styles.actionButtonDestructive]}
          onPress={handleClose}
          testID="close-game-btn"
        >
          <Ban size={18} color={Colors.error} />
          <Text style={styles.actionButtonDestructiveText}>סגירת משחק</Text>
        </Pressable>
      );
    }

    if (isParticipant) {
      return (
        <Pressable
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={handleLeave}
          disabled={leaveMutation.isPending}
          testID="leave-game-btn"
        >
          <UserMinus size={18} color={Colors.error} />
          <Text style={styles.actionButtonSecondaryText}>בטל השתתפות</Text>
        </Pressable>
      );
    }

    if (isOnWaitlist) {
      return (
        <Pressable
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={handleLeave}
          disabled={leaveMutation.isPending}
          testID="leave-waitlist-btn"
        >
          <UserMinus size={18} color={Colors.warning} />
          <Text style={styles.actionButtonSecondaryText}>
            יציאה מרשימת ההמתנה
          </Text>
        </Pressable>
      );
    }

    if (isFull) {
      return (
        <Pressable
          style={[styles.actionButton, styles.actionButtonWarning]}
          onPress={() => joinMutation.mutate()}
          disabled={joinMutation.isPending}
          testID="join-waitlist-btn"
        >
          {joinMutation.isPending ? (
            <ActivityIndicator color={Colors.warning} />
          ) : (
            <>
              <UserPlus size={18} color={Colors.warning} />
              <Text style={styles.actionButtonWarningText}>
                הצטרפות לרשימת המתנה
              </Text>
            </>
          )}
        </Pressable>
      );
    }

    return (
      <Pressable
        style={[styles.actionButton, styles.actionButtonPrimary]}
        onPress={() => joinMutation.mutate()}
        disabled={joinMutation.isPending}
        testID="join-game-btn"
      >
        {joinMutation.isPending ? (
          <ActivityIndicator color={Colors.textInverse} />
        ) : (
          <>
            <UserPlus size={18} color={Colors.textInverse} />
            <Text style={styles.actionButtonPrimaryText}>הצטרפות למשחק</Text>
          </>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          testID="back-btn"
        >
          <ArrowLeft size={22} color={Colors.text} />
        </Pressable>
        <View style={[styles.statusPill, { backgroundColor: statusColor + '1A' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusPillText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.gameInfoHeader}>
        <Text style={styles.gameTitle}>{game.title}</Text>
        <View style={styles.gameMetaRow}>
          <View style={styles.metaItem}>
            <Clock size={14} color={Colors.primary} />
            <Text style={styles.metaText}>
              {formatFullDate(game.date)} · {formatTime(game.date)}
            </Text>
          </View>
        </View>
        <View style={styles.gameMetaRow}>
          <View style={styles.metaItem}>
            <MapPin size={14} color={Colors.primary} />
            <Text style={styles.metaText}>{game.locationAddress}</Text>
          </View>
        </View>
        <View style={styles.gameStatsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {participants.length}/{game.maxPlayers}
            </Text>
            <Text style={styles.statLabel}>שחקנים</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{priceText}</Text>
            <Text style={styles.statLabel}>מחיר</Text>
          </View>
          {waitlist.length > 0 && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{waitlist.length}</Text>
                <Text style={styles.statLabel}>ממתינים</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'details' && styles.tabActive]}
          onPress={() => {
            setActiveTab('details');
            Haptics.selectionAsync();
          }}
          testID="tab-details"
        >
          <Users size={16} color={activeTab === 'details' ? Colors.primary : Colors.textTertiary} />
          <Text
            style={[
              styles.tabText,
              activeTab === 'details' && styles.tabTextActive,
            ]}
          >
            משתתפים ({participants.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
          onPress={() => {
            setActiveTab('chat');
            Haptics.selectionAsync();
          }}
          testID="tab-chat"
        >
          <MessageCircle size={16} color={activeTab === 'chat' ? Colors.primary : Colors.textTertiary} />
          <Text
            style={[
              styles.tabText,
              activeTab === 'chat' && styles.tabTextActive,
            ]}
          >
            צ׳אט ({messages.length})
          </Text>
        </Pressable>
      </View>

      {activeTab === 'details' ? (
        <FlatList
          data={participants}
          renderItem={renderParticipant}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.participantsList}
          ListEmptyComponent={
            <View style={styles.emptyParticipants}>
              <Text style={styles.emptyText}>אין משתתפים עדיין</Text>
            </View>
          }
        />
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top + 60}
        >
          <FlatList
            ref={messagesListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatEmoji}>💬</Text>
                <Text style={styles.emptyChatText}>
                  אין הודעות עדיין. תהיו הראשונים!
                </Text>
              </View>
            }
          />
          <View style={[styles.chatInputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <Pressable
              style={[
                styles.sendBtn,
                !messageText.trim() && styles.sendBtnDisabled,
              ]}
              onPress={() => {
                if (messageText.trim()) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  sendMessageMutation.mutate();
                }
              }}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
              testID="send-msg-btn"
            >
              <Send size={18} color={messageText.trim() ? Colors.textInverse : Colors.textTertiary} />
            </Pressable>
            <TextInput
              style={styles.chatInput}
              placeholder="כתוב הודעה..."
              placeholderTextColor={Colors.textTertiary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              textAlign="right"
              testID="chat-input"
            />
          </View>
        </KeyboardAvoidingView>
      )}

      {activeTab === 'details' && (
        <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {renderActionButton()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  gameInfoHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: 12,
  },
  gameMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    writingDirection: 'rtl',
  },
  gameStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    writingDirection: 'rtl',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    writingDirection: 'rtl',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    writingDirection: 'rtl',
  },
  tabTextActive: {
    color: Colors.primary,
  },
  participantsList: {
    padding: 16,
    paddingBottom: 100,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantAvatarText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  participantInfo: {
    flex: 1,
  },
  participantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    writingDirection: 'rtl',
  },
  participantPosition: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    writingDirection: 'rtl',
  },
  fromWaitlistBadge: {
    backgroundColor: Colors.warning + '1A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fromWaitlistText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.warning,
    writingDirection: 'rtl',
  },
  emptyParticipants: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
    writingDirection: 'rtl',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubbleWrap: {
    marginBottom: 8,
  },
  messageBubbleWrapMe: {
    alignItems: 'flex-end',
  },
  messageBubbleWrapOther: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '78%',
    padding: 10,
    borderRadius: 16,
  },
  messageBubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: Colors.background,
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 3,
    writingDirection: 'rtl',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    writingDirection: 'rtl',
  },
  messageTextMe: {
    color: Colors.textInverse,
  },
  messageTextOther: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'left',
  },
  messageTimeOther: {
    color: Colors.textTertiary,
    textAlign: 'right',
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyChatEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyChatText: {
    fontSize: 14,
    color: Colors.textTertiary,
    writingDirection: 'rtl',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    writingDirection: 'rtl',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.borderLight,
  },
  bottomAction: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  actionButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textInverse,
    writingDirection: 'rtl',
  },
  actionButtonSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  actionButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.error,
    writingDirection: 'rtl',
  },
  actionButtonWarning: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.warning,
  },
  actionButtonWarningText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.warning,
    writingDirection: 'rtl',
  },
  actionButtonDestructive: {
    backgroundColor: Colors.error + '0D',
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  actionButtonDestructiveText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.error,
    writingDirection: 'rtl',
  },
  actionButtonDisabled: {
    backgroundColor: Colors.background,
  },
  actionButtonDisabledText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    writingDirection: 'rtl',
  },
});
