export type PlayerPosition = 'attack' | 'midfield' | 'defense' | 'goalkeeper';

export type AuthProvider = 'phone' | 'google' | 'apple' | 'email';

export type GameStatus = 'open' | 'full' | 'closed';

export type ParticipantRole = 'player' | 'organizer';

export interface User {
  id: string;
  phoneNumber?: string;
  email?: string;
  provider: AuthProvider;
  name: string;
  city: string;
  age: number;
  position: PlayerPosition;
  avatarUrl?: string;
  createdAt: number;
  updatedAt: number;
  pushToken?: string;
}

export interface Game {
  id: string;
  title: string;
  city: string;
  creatorId: string;
  date: number;
  locationAddress: string;
  locationGeo?: { lat: number; lng: number };
  maxPlayers: number;
  pricePerPlayer: number;
  status: GameStatus;
  createdAt: number;
  updatedAt: number;
}

export interface GameParticipant {
  userId: string;
  gameId: string;
  joinedAt: number;
  role: ParticipantRole;
  isFromWaitlist: boolean;
  userName?: string;
  userPosition?: PlayerPosition;
}

export interface GameWaitlistEntry {
  userId: string;
  gameId: string;
  addedAt: number;
  userName?: string;
}

export interface GameMessage {
  id: string;
  gameId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
}

export interface CreateGameInput {
  title: string;
  date: number;
  locationAddress: string;
  locationGeo?: { lat: number; lng: number };
  maxPlayers: number;
  pricePerPlayer: number;
}

export interface CreateProfileInput {
  name: string;
  city: string;
  age: number;
  position: PlayerPosition;
  avatarUrl?: string;
}
