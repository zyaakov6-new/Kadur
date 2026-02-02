import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role (admin access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Types
export interface User {
  id: string;
  name: string;
  phone: string | null;
  city: string | null;
  position: string | null;
  age: number | null;
  profile_photo_url: string | null;
  games_played: number;
  created_at: string;
}

export interface Game {
  id: string;
  organizer_id: string;
  title: string;
  date: string;
  time: string;
  format: string;
  location_text: string;
  location_lat: number | null;
  location_lng: number | null;
  is_public: boolean;
  max_players: number;
  current_players: number;
  notes: string | null;
  status: 'open' | 'full' | 'cancelled' | 'completed';
  created_at: string;
  organizer?: User;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin';
  created_at: string;
  user?: User;
}

export interface DashboardStats {
  totalUsers: number;
  totalGames: number;
  activeGames: number;
  totalParticipants: number;
  gamesThisWeek: number;
  newUsersThisWeek: number;
}
