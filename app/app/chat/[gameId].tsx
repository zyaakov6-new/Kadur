import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Send } from 'lucide-react-native';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { he } from 'date-fns/locale';
import { useThemeStore, useAuthStore, useGamesStore } from '@/store';
import { useChat } from '@/hooks/useChat';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Avatar, Loading } from '@/components/ui';
import { GameMessageWithUser } from '@/types/database';
import { Colors, FontSizes, Spacing, BorderRadius } from '@/constants';

export default function ChatScreen() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const { theme } = useThemeStore();
  const { profile } = useAuthStore();
  const { currentGame } = useGamesStore();
  const { messages, isLoading, sendMessage, loadMoreMessages, hasMore } = useChat(
    gameId || '',
    profile?.id || null
  );
  const { logMessageSent } = useAnalytics();

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await sendMessage(text);
      logMessageSent(gameId || '');
    } catch (error) {
      setInputText(text); // Restore text on error
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (dateStr: string): string => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'HH:mm');
    } catch {
      return '';
    }
  };

  const formatDateHeader = (dateStr: string): string => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return 'היום';
      if (isYesterday(date)) return 'אתמול';
      return format(date, 'd בMMMM', { locale: he });
    } catch {
      return '';
    }
  };

  const shouldShowDateHeader = (
    message: GameMessageWithUser,
    index: number
  ): boolean => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    const currentDate = message.created_at.split('T')[0];
    const prevDate = prevMessage.created_at.split('T')[0];
    return currentDate !== prevDate;
  };

  const renderMessage = ({
    item,
    index,
  }: {
    item: GameMessageWithUser;
    index: number;
  }) => {
    const isOwn = item.user_id === profile?.id;
    const showHeader = shouldShowDateHeader(item, index);

    return (
      <>
        {showHeader && (
          <View style={styles.dateHeader}>
            <Text style={[styles.dateHeaderText, { color: theme.colors.muted }]}>
              {formatDateHeader(item.created_at)}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isOwn ? styles.ownMessage : styles.otherMessage,
          ]}
        >
          {!isOwn && (
            <Avatar
              source={item.user?.profile_photo_url}
              name={item.user?.name}
              size="sm"
            />
          )}
          <View
            style={[
              styles.messageBubble,
              {
                backgroundColor: isOwn
                  ? Colors.primary[500]
                  : theme.colors.card,
              },
            ]}
          >
            {!isOwn && (
              <Text style={[styles.senderName, { color: Colors.primary[500] }]}>
                {item.user?.name}
              </Text>
            )}
            <Text
              style={[
                styles.messageText,
                { color: isOwn ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              {item.message}
            </Text>
            <Text
              style={[
                styles.messageTime,
                { color: isOwn ? 'rgba(255,255,255,0.7)' : theme.colors.muted },
              ]}
            >
              {formatMessageTime(item.created_at)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {currentGame?.title || 'צ׳אט משחק'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.muted }]}>
            {currentGame?.current_players} משתתפים
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {isLoading && messages.length === 0 ? (
          <Loading fullScreen message="טוען הודעות..." />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (hasMore) loadMoreMessages();
            }}
            onEndReachedThreshold={0.3}
            inverted={false}
          />
        )}

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
              },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="הקלד הודעה..."
            placeholderTextColor={theme.colors.muted}
            multiline
            maxLength={500}
            textAlign="right"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  inputText.trim() && !isSending
                    ? Colors.primary[500]
                    : theme.colors.border,
              },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    textAlign: 'right',
  },
  messagesList: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dateHeaderText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginLeft: Spacing.sm,
  },
  senderName: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right',
  },
  messageText: {
    fontSize: FontSizes.base,
    lineHeight: 20,
    textAlign: 'right',
  },
  messageTime: {
    fontSize: FontSizes.xs,
    marginTop: 4,
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius['2xl'],
    fontSize: FontSizes.base,
    writingDirection: 'rtl',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
