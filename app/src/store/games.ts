import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import {
  Game,
  GameWithOrganizer,
  GameWithDetails,
  GameInsert,
  GameUpdate,
  GameParticipant,
  GameFormat,
} from '@/types/database';
import { DEFAULT_SEARCH_RADIUS } from '@/constants';

interface GamesFilter {
  city?: string | null;
  format?: GameFormat | null;
  date?: string | null;
  publicOnly?: boolean;
  radiusKm?: number;
}

interface GamesState {
  games: GameWithOrganizer[];
  myOrganizedGames: GameWithOrganizer[];
  myJoinedGames: GameWithOrganizer[];
  currentGame: GameWithDetails | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  filters: GamesFilter;

  // Location
  userLocation: { lat: number; lng: number } | null;

  // Actions
  setUserLocation: (lat: number, lng: number) => void;
  setFilters: (filters: Partial<GamesFilter>) => void;
  fetchGames: () => Promise<void>;
  fetchMyGames: (userId: string) => Promise<void>;
  fetchGameDetails: (gameId: string) => Promise<void>;
  createGame: (game: GameInsert) => Promise<Game>;
  updateGame: (gameId: string, updates: GameUpdate) => Promise<void>;
  cancelGame: (gameId: string) => Promise<void>;
  joinGame: (gameId: string, userId: string) => Promise<void>;
  leaveGame: (gameId: string, userId: string) => Promise<void>;
  approveParticipant: (participantId: string) => Promise<void>;
  declineParticipant: (participantId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useGamesStore = create<GamesState>((set, get) => ({
  games: [],
  myOrganizedGames: [],
  myJoinedGames: [],
  currentGame: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  filters: {
    radiusKm: DEFAULT_SEARCH_RADIUS,
    publicOnly: false,
  },
  userLocation: null,

  setUserLocation: (lat, lng) => {
    set({ userLocation: { lat, lng } });
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  fetchGames: async () => {
    const { userLocation, filters } = get();

    try {
      set({ isLoading: true, error: null });

      // Use RPC function if location available
      if (userLocation) {
        const { data, error } = await supabase.rpc('get_nearby_games', {
          user_lat: userLocation.lat,
          user_lng: userLocation.lng,
          radius_km: filters.radiusKm || DEFAULT_SEARCH_RADIUS,
          filter_city: filters.city || null,
          filter_format: filters.format || null,
          filter_date: filters.date || null,
          filter_public_only: filters.publicOnly || false,
        });

        if (error) throw error;
        set({ games: data || [] });
      } else {
        // Fallback to basic query without distance
        let query = supabase
          .from('games')
          .select(
            `
            *,
            organizer:users!organizer_id (
              id,
              name,
              profile_photo_url
            )
          `
          )
          .in('status', ['open', 'full'])
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (filters.city) {
          query = query.ilike('location_text', `%${filters.city}%`);
        }
        if (filters.format) {
          query = query.eq('format', filters.format);
        }
        if (filters.date) {
          query = query.eq('date', filters.date);
        }
        if (filters.publicOnly) {
          query = query.eq('is_public', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform to GameWithOrganizer format
        const gamesWithOrganizer: GameWithOrganizer[] = (data || []).map(
          (game: any) => ({
            ...game,
            organizer_name: game.organizer?.name || 'Unknown',
            organizer_photo: game.organizer?.profile_photo_url || null,
          })
        );

        set({ games: gamesWithOrganizer });
      }
    } catch (error: any) {
      console.error('Error fetching games:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyGames: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Fetch organized games
      const { data: organized, error: organizedError } = await supabase
        .from('games')
        .select(
          `
          *,
          organizer:users!organizer_id (
            id,
            name,
            profile_photo_url
          )
        `
        )
        .eq('organizer_id', userId)
        .order('date', { ascending: true });

      if (organizedError) throw organizedError;

      // Fetch joined games
      const { data: participated, error: participatedError } = await supabase
        .from('game_participants')
        .select(
          `
          game:games (
            *,
            organizer:users!organizer_id (
              id,
              name,
              profile_photo_url
            )
          )
        `
        )
        .eq('user_id', userId)
        .eq('status', 'joined')
        .eq('is_approved', true);

      if (participatedError) throw participatedError;

      // Transform data
      const organizedGames: GameWithOrganizer[] = (organized || []).map(
        (game: any) => ({
          ...game,
          organizer_name: game.organizer?.name || 'Unknown',
          organizer_photo: game.organizer?.profile_photo_url || null,
        })
      );

      const joinedGames: GameWithOrganizer[] = (participated || [])
        .filter((p: any) => p.game && p.game.organizer_id !== userId)
        .map((p: any) => ({
          ...p.game,
          organizer_name: p.game.organizer?.name || 'Unknown',
          organizer_photo: p.game.organizer?.profile_photo_url || null,
        }));

      set({
        myOrganizedGames: organizedGames,
        myJoinedGames: joinedGames,
      });
    } catch (error: any) {
      console.error('Error fetching my games:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGameDetails: async (gameId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data: game, error: gameError } = await supabase
        .from('games')
        .select(
          `
          *,
          organizer:users!organizer_id (*)
        `
        )
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;

      // Fetch participants
      const { data: participants, error: participantsError } = await supabase
        .from('game_participants')
        .select(
          `
          *,
          user:users (*)
        `
        )
        .eq('game_id', gameId)
        .in('status', ['joined', 'pending']);

      if (participantsError) throw participantsError;

      // Fetch recent messages
      const { data: messages, error: messagesError } = await supabase
        .from('game_messages')
        .select(
          `
          *,
          user:users (*)
        `
        )
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (messagesError) throw messagesError;

      const gameWithDetails: GameWithDetails = {
        ...game,
        organizer_name: game.organizer?.name || 'Unknown',
        organizer_photo: game.organizer?.profile_photo_url || null,
        organizer: game.organizer,
        participants: participants || [],
        messages: (messages || []).reverse(),
      };

      set({ currentGame: gameWithDetails });
    } catch (error: any) {
      console.error('Error fetching game details:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createGame: async (game: GameInsert) => {
    try {
      const { data, error } = await supabase
        .from('games')
        .insert(game)
        .select()
        .single();

      if (error) throw error;

      // Refresh games list
      get().fetchGames();

      return data;
    } catch (error: any) {
      console.error('Error creating game:', error);
      throw error;
    }
  },

  updateGame: async (gameId: string, updates: GameUpdate) => {
    try {
      const { error } = await supabase
        .from('games')
        .update(updates)
        .eq('id', gameId);

      if (error) throw error;

      // Refresh game details
      get().fetchGameDetails(gameId);
    } catch (error: any) {
      console.error('Error updating game:', error);
      throw error;
    }
  },

  cancelGame: async (gameId: string) => {
    try {
      const { error } = await supabase
        .from('games')
        .update({ status: 'cancelled' })
        .eq('id', gameId);

      if (error) throw error;

      // Refresh games
      get().fetchGames();
    } catch (error: any) {
      console.error('Error cancelling game:', error);
      throw error;
    }
  },

  joinGame: async (gameId: string, userId: string) => {
    try {
      // Check if game is public
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('is_public, status, current_players, max_players')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;

      if (game.status === 'full' || game.current_players >= game.max_players) {
        throw new Error('המשחק מלא');
      }

      const { error } = await supabase.from('game_participants').insert({
        game_id: gameId,
        user_id: userId,
        is_approved: game.is_public,
        status: game.is_public ? 'joined' : 'pending',
      });

      if (error) throw error;

      // Refresh game details
      get().fetchGameDetails(gameId);
    } catch (error: any) {
      console.error('Error joining game:', error);
      throw error;
    }
  },

  leaveGame: async (gameId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('game_participants')
        .update({ status: 'left' })
        .eq('game_id', gameId)
        .eq('user_id', userId);

      if (error) throw error;

      // Refresh game details
      get().fetchGameDetails(gameId);
    } catch (error: any) {
      console.error('Error leaving game:', error);
      throw error;
    }
  },

  approveParticipant: async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('game_participants')
        .update({ is_approved: true, status: 'joined' })
        .eq('id', participantId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error approving participant:', error);
      throw error;
    }
  },

  declineParticipant: async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('game_participants')
        .update({ status: 'declined' })
        .eq('id', participantId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error declining participant:', error);
      throw error;
    }
  },

  refresh: async () => {
    set({ isRefreshing: true });
    await get().fetchGames();
    set({ isRefreshing: false });
  },
}));
