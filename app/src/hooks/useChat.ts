import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { GameMessage, GameMessageWithUser } from '@/types/database';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseChatReturn {
  messages: GameMessageWithUser[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  hasMore: boolean;
}

const MESSAGES_PER_PAGE = 50;

export function useChat(gameId: string, userId: string | null): UseChatReturn {
  const [messages, setMessages] = useState<GameMessageWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('game_messages')
        .select(
          `
          *,
          user:users (
            id,
            name,
            profile_photo_url
          )
        `
        )
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      if (fetchError) throw fetchError;

      // Reverse to show oldest first
      setMessages((data || []).reverse() as GameMessageWithUser[]);
      setHasMore((data?.length || 0) === MESSAGES_PER_PAGE);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError('שגיאה בטעינת ההודעות');
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  // Load more (older) messages
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || messages.length === 0) return;

    try {
      const oldestMessage = messages[0];

      const { data, error: fetchError } = await supabase
        .from('game_messages')
        .select(
          `
          *,
          user:users (
            id,
            name,
            profile_photo_url
          )
        `
        )
        .eq('game_id', gameId)
        .lt('created_at', oldestMessage.created_at)
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      if (fetchError) throw fetchError;

      // Prepend older messages (reversed)
      const olderMessages = (data || []).reverse() as GameMessageWithUser[];
      setMessages((prev) => [...olderMessages, ...prev]);
      setHasMore((data?.length || 0) === MESSAGES_PER_PAGE);
    } catch (err: any) {
      console.error('Error loading more messages:', err);
    }
  }, [gameId, hasMore, messages]);

  // Send a message
  const sendMessage = useCallback(
    async (message: string) => {
      if (!userId || !message.trim()) return;

      try {
        const { error: sendError } = await supabase
          .from('game_messages')
          .insert({
            game_id: gameId,
            user_id: userId,
            message: message.trim(),
          });

        if (sendError) throw sendError;

        // Message will be added via realtime subscription
      } catch (err: any) {
        console.error('Error sending message:', err);
        throw err;
      }
    },
    [gameId, userId]
  );

  // Subscribe to realtime updates
  useEffect(() => {
    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`game_messages:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_messages',
          filter: `game_id=eq.${gameId}`,
        },
        async (payload) => {
          // Fetch the new message with user data
          const { data, error } = await supabase
            .from('game_messages')
            .select(
              `
              *,
              user:users (
                id,
                name,
                profile_photo_url
              )
            `
            )
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            setMessages((prev) => [...prev, data as GameMessageWithUser]);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [gameId, fetchMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    loadMoreMessages,
    hasMore,
  };
}

// Hook for subscribing to game updates
export function useGameSubscription(gameId: string) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          setLastUpdate(new Date());
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [gameId]);

  return { lastUpdate };
}
