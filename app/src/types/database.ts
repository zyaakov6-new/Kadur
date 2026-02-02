// Generated types for Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          city: string | null;
          position: string | null;
          age: number | null;
          profile_photo_url: string | null;
          push_token: string | null;
          games_played: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          phone?: string | null;
          city?: string | null;
          position?: string | null;
          age?: number | null;
          profile_photo_url?: string | null;
          push_token?: string | null;
          games_played?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          city?: string | null;
          position?: string | null;
          age?: number | null;
          profile_photo_url?: string | null;
          push_token?: string | null;
          games_played?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          organizer_id: string;
          title: string;
          game_date: string;
          start_time: string;
          format: string;
          location_text: string;
          location_lat: number | null;
          location_lng: number | null;
          is_public: boolean;
          max_players: number;
          current_players: number;
          notes: string | null;
          status: GameStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          title: string;
          game_date: string;
          start_time: string;
          format?: string;
          location_text: string;
          location_lat?: number | null;
          location_lng?: number | null;
          is_public?: boolean;
          max_players?: number;
          current_players?: number;
          notes?: string | null;
          status?: GameStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organizer_id?: string;
          title?: string;
          game_date?: string;
          start_time?: string;
          format?: string;
          location_text?: string;
          location_lat?: number | null;
          location_lng?: number | null;
          is_public?: boolean;
          max_players?: number;
          current_players?: number;
          notes?: string | null;
          status?: GameStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_participants: {
        Row: {
          id: string;
          game_id: string;
          user_id: string;
          joined_at: string;
          is_approved: boolean;
          status: ParticipantStatus;
        };
        Insert: {
          id?: string;
          game_id: string;
          user_id: string;
          joined_at?: string;
          is_approved?: boolean;
          status?: ParticipantStatus;
        };
        Update: {
          id?: string;
          game_id?: string;
          user_id?: string;
          joined_at?: string;
          is_approved?: boolean;
          status?: ParticipantStatus;
        };
      };
      game_messages: {
        Row: {
          id: string;
          game_id: string;
          user_id: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          user_id: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          user_id?: string;
          message?: string;
          created_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          role: AdminRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: AdminRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: AdminRole;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          game_id: string | null;
          type: NotificationType;
          title: string;
          body: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id?: string | null;
          type: NotificationType;
          title: string;
          body: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string | null;
          type?: NotificationType;
          title?: string;
          body?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
    Functions: {
      get_nearby_games: {
        Args: {
          user_lat: number;
          user_lng: number;
          radius_km?: number;
          filter_city?: string | null;
          filter_format?: string | null;
          filter_date?: string | null;
          filter_public_only?: boolean;
        };
        Returns: GameWithOrganizer[];
      };
      calculate_distance: {
        Args: {
          lat1: number;
          lng1: number;
          lat2: number;
          lng2: number;
        };
        Returns: number;
      };
    };
  };
}

// Enum types
export type GameStatus = 'open' | 'full' | 'cancelled' | 'completed';
export type ParticipantStatus = 'joined' | 'pending' | 'declined' | 'left';
export type AdminRole = 'admin' | 'super_admin';
export type NotificationType =
  | 'game_nearby'
  | 'join_request'
  | 'game_full'
  | 'game_cancelled'
  | 'message';

// Convenience type aliases
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Game = Database['public']['Tables']['games']['Row'];
export type GameInsert = Database['public']['Tables']['games']['Insert'];
export type GameUpdate = Database['public']['Tables']['games']['Update'];

export type GameParticipant =
  Database['public']['Tables']['game_participants']['Row'];
export type GameParticipantInsert =
  Database['public']['Tables']['game_participants']['Insert'];
export type GameParticipantUpdate =
  Database['public']['Tables']['game_participants']['Update'];

export type GameMessage = Database['public']['Tables']['game_messages']['Row'];
export type GameMessageInsert =
  Database['public']['Tables']['game_messages']['Insert'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert =
  Database['public']['Tables']['notifications']['Insert'];

// Extended types with relations
export interface GameWithOrganizer extends Game {
  distance_km?: number;
  organizer_name: string;
  organizer_photo: string | null;
  organizer?: User;
}

export interface GameWithDetails extends GameWithOrganizer {
  participants: (GameParticipant & { user: User })[];
  messages: (GameMessage & { user: User })[];
}

export interface GameParticipantWithUser extends GameParticipant {
  user: User;
}

export interface GameMessageWithUser extends GameMessage {
  user: User;
}

// Game format options
export type GameFormat = '5x5' | '7x7' | '11x11';

export const GAME_FORMATS: { value: GameFormat; label: string }[] = [
  { value: '5x5', label: '5x5' },
  { value: '7x7', label: '7x7' },
  { value: '11x11', label: '11x11' },
];

// Player positions
export type PlayerPosition = 'שוער' | 'מגן' | 'קשר' | 'חלוץ';

export const PLAYER_POSITIONS: { value: PlayerPosition; label: string }[] = [
  { value: 'שוער', label: 'שוער' },
  { value: 'מגן', label: 'מגן' },
  { value: 'קשר', label: 'קשר' },
  { value: 'חלוץ', label: 'חלוץ' },
];

// Israeli cities for filter
export const CITIES = [
  'פתח תקווה',
  'תל אביב',
  'ירושלים',
  'רמת גן',
  'גבעתיים',
  'בני ברק',
  'הרצליה',
  'רעננה',
  'כפר סבא',
  'חולון',
  'בת ים',
  'ראשון לציון',
  'אשדוד',
  'באר שבע',
  'חיפה',
] as const;

export type City = (typeof CITIES)[number];
