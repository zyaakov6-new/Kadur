// TODO: Replace AsyncStorage calls with Firebase Firestore
// This service mirrors the Firestore data model using AsyncStorage for the MVP.
// When migrating:
// 1. Replace AsyncStorage reads with onSnapshot listeners for real-time updates
// 2. Replace AsyncStorage writes with Firestore set/update/delete
// 3. Use Firestore security rules for access control
// 4. Use Firestore transactions for join/leave operations

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Game,
  GameParticipant,
  GameWaitlistEntry,
  GameMessage,
  GameStatus,
} from '@/types';

const KEYS = {
  CURRENT_USER: '@kadur:currentUser',
  GAMES: '@kadur:games',
  PARTICIPANTS: '@kadur:participants',
  WAITLIST: '@kadur:waitlist',
  MESSAGES: '@kadur:messages',
  SEEDED: '@kadur:seeded',
} as const;

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ── User ──

export async function getCurrentUser(): Promise<User | null> {
  try {
    const json = await AsyncStorage.getItem(KEYS.CURRENT_USER);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.log('[Storage] Error reading current user:', e);
    return null;
  }
}

export async function saveUser(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    console.log('[Storage] User saved:', user.id);
  } catch (e) {
    console.log('[Storage] Error saving user:', e);
  }
}

export async function clearUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.CURRENT_USER);
    console.log('[Storage] User cleared');
  } catch (e) {
    console.log('[Storage] Error clearing user:', e);
  }
}

// ── Games ──

export async function getGames(): Promise<Game[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.GAMES);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.log('[Storage] Error reading games:', e);
    return [];
  }
}

export async function getGame(id: string): Promise<Game | null> {
  const games = await getGames();
  return games.find((g) => g.id === id) ?? null;
}

export async function saveGames(games: Game[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.GAMES, JSON.stringify(games));
}

export async function createGame(
  data: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Game> {
  const games = await getGames();
  const game: Game = {
    ...data,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  games.push(game);
  await saveGames(games);
  console.log('[Storage] Game created:', game.id, game.title);
  return game;
}

export async function updateGame(
  id: string,
  updates: Partial<Game>,
): Promise<Game | null> {
  const games = await getGames();
  const index = games.findIndex((g) => g.id === id);
  if (index === -1) return null;
  games[index] = { ...games[index], ...updates, updatedAt: Date.now() };
  await saveGames(games);
  console.log('[Storage] Game updated:', id);
  return games[index];
}

// ── Participants ──

async function getAllParticipants(): Promise<GameParticipant[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.PARTICIPANTS);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

async function saveAllParticipants(p: GameParticipant[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.PARTICIPANTS, JSON.stringify(p));
}

export async function getParticipants(
  gameId: string,
): Promise<GameParticipant[]> {
  const all = await getAllParticipants();
  return all.filter((p) => p.gameId === gameId);
}

export async function addParticipant(
  data: GameParticipant,
): Promise<GameParticipant> {
  const all = await getAllParticipants();
  all.push(data);
  await saveAllParticipants(all);
  console.log('[Storage] Participant added:', data.userId, 'to game', data.gameId);
  return data;
}

export async function removeParticipant(
  gameId: string,
  userId: string,
): Promise<void> {
  const all = await getAllParticipants();
  await saveAllParticipants(
    all.filter((p) => !(p.gameId === gameId && p.userId === userId)),
  );
  console.log('[Storage] Participant removed:', userId, 'from game', gameId);
}

// ── Waitlist ──

async function getAllWaitlist(): Promise<GameWaitlistEntry[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.WAITLIST);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

async function saveAllWaitlist(w: GameWaitlistEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.WAITLIST, JSON.stringify(w));
}

export async function getWaitlist(
  gameId: string,
): Promise<GameWaitlistEntry[]> {
  const all = await getAllWaitlist();
  return all.filter((w) => w.gameId === gameId);
}

export async function addToWaitlist(
  data: GameWaitlistEntry,
): Promise<GameWaitlistEntry> {
  const all = await getAllWaitlist();
  all.push(data);
  await saveAllWaitlist(all);
  console.log('[Storage] Added to waitlist:', data.userId, 'game', data.gameId);
  return data;
}

export async function removeFromWaitlist(
  gameId: string,
  userId: string,
): Promise<void> {
  const all = await getAllWaitlist();
  await saveAllWaitlist(
    all.filter((w) => !(w.gameId === gameId && w.userId === userId)),
  );
}

// ── Messages ──

async function getAllMessages(): Promise<GameMessage[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.MESSAGES);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

async function saveAllMessages(m: GameMessage[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(m));
}

export async function getMessages(gameId: string): Promise<GameMessage[]> {
  const all = await getAllMessages();
  return all
    .filter((m) => m.gameId === gameId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function addMessage(
  data: Omit<GameMessage, 'id' | 'createdAt'>,
): Promise<GameMessage> {
  const all = await getAllMessages();
  const msg: GameMessage = {
    ...data,
    id: generateId(),
    createdAt: Date.now(),
  };
  all.push(msg);
  await saveAllMessages(all);
  console.log('[Storage] Message added to game:', data.gameId);
  return msg;
}

// ── Game Join / Leave Logic ──

export type JoinResult =
  | 'joined'
  | 'waitlisted'
  | 'already_joined'
  | 'game_closed';

export async function joinGame(
  gameId: string,
  user: User,
): Promise<JoinResult> {
  const game = await getGame(gameId);
  if (!game || game.status === 'closed') return 'game_closed';

  const participants = await getParticipants(gameId);
  if (participants.some((p) => p.userId === user.id)) return 'already_joined';

  const waitlist = await getWaitlist(gameId);
  if (waitlist.some((w) => w.userId === user.id)) return 'already_joined';

  if (participants.length < game.maxPlayers) {
    await addParticipant({
      userId: user.id,
      gameId,
      role: 'player',
      isFromWaitlist: false,
      joinedAt: Date.now(),
      userName: user.name,
      userPosition: user.position,
    });

    if (participants.length + 1 >= game.maxPlayers) {
      await updateGame(gameId, { status: 'full' });
    }

    return 'joined';
  }

  await addToWaitlist({
    userId: user.id,
    gameId,
    addedAt: Date.now(),
    userName: user.name,
  });
  return 'waitlisted';
}

export async function leaveGame(
  gameId: string,
  userId: string,
): Promise<void> {
  const participants = await getParticipants(gameId);
  const isParticipant = participants.some((p) => p.userId === userId);

  if (isParticipant) {
    await removeParticipant(gameId, userId);

    const waitlist = await getWaitlist(gameId);
    if (waitlist.length > 0) {
      const sorted = [...waitlist].sort((a, b) => a.addedAt - b.addedAt);
      const first = sorted[0];
      await removeFromWaitlist(gameId, first.userId);
      await addParticipant({
        userId: first.userId,
        gameId,
        role: 'player',
        isFromWaitlist: true,
        joinedAt: Date.now(),
        userName: first.userName,
      });
    }

    const game = await getGame(gameId);
    const updatedParticipants = await getParticipants(gameId);
    if (
      game &&
      game.status === 'full' &&
      updatedParticipants.length < game.maxPlayers
    ) {
      await updateGame(gameId, { status: 'open' });
    }
  } else {
    await removeFromWaitlist(gameId, userId);
  }
}

export async function closeGame(gameId: string): Promise<void> {
  await updateGame(gameId, { status: 'closed' });
  console.log('[Storage] Game closed:', gameId);
}

// ── Seed Data ──

export async function seedIfNeeded(): Promise<void> {
  try {
    const seeded = await AsyncStorage.getItem(KEYS.SEEDED);
    if (seeded) return;

    console.log('[Storage] Seeding initial data...');

    const now = new Date();

    function makeDate(daysFromNow: number, hours: number, minutes: number = 0): number {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysFromNow);
      d.setHours(hours, minutes, 0, 0);
      return d.getTime();
    }

    const games: Game[] = [
      {
        id: 'seed-g1',
        title: 'משחק אחה״צ בבקעה',
        city: 'ירושלים',
        creatorId: 'seed-u1',
        date: makeDate(0, 18, 0),
        locationAddress: 'מגרש בקעה, רחוב אמציה 12',
        maxPlayers: 14,
        pricePerPlayer: 30,
        status: 'open',
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
      },
      {
        id: 'seed-g2',
        title: 'כדורגל ערב בגן סאקר',
        city: 'ירושלים',
        creatorId: 'seed-u2',
        date: makeDate(0, 20, 30),
        locationAddress: 'גן סאקר, ליד המזרקה',
        maxPlayers: 20,
        pricePerPlayer: 25,
        status: 'open',
        createdAt: Date.now() - 172800000,
        updatedAt: Date.now() - 172800000,
      },
      {
        id: 'seed-g3',
        title: 'משחק בוקר בגבעת רם',
        city: 'ירושלים',
        creatorId: 'seed-u1',
        date: makeDate(1, 17, 0),
        locationAddress: 'מגרש האוניברסיטה, גבעת רם',
        maxPlayers: 16,
        pricePerPlayer: 20,
        status: 'open',
        createdAt: Date.now() - 43200000,
        updatedAt: Date.now() - 43200000,
      },
      {
        id: 'seed-g4',
        title: 'משחק חינם בתלפיות',
        city: 'ירושלים',
        creatorId: 'seed-u2',
        date: makeDate(2, 19, 0),
        locationAddress: 'מגרש תלפיות, דרך חברון',
        maxPlayers: 12,
        pricePerPlayer: 0,
        status: 'open',
        createdAt: Date.now() - 21600000,
        updatedAt: Date.now() - 21600000,
      },
      {
        id: 'seed-g5',
        title: 'כדורגל שישי ברמות',
        city: 'ירושלים',
        creatorId: 'seed-u1',
        date: makeDate(3, 10, 0),
        locationAddress: 'מגרש רמות, רחוב גולדה מאיר',
        maxPlayers: 22,
        pricePerPlayer: 15,
        status: 'open',
        createdAt: Date.now() - 10800000,
        updatedAt: Date.now() - 10800000,
      },
    ];

    const participants: GameParticipant[] = [
      { userId: 'seed-u1', gameId: 'seed-g1', joinedAt: Date.now() - 86400000, role: 'organizer', isFromWaitlist: false, userName: 'דוד כהן', userPosition: 'attack' },
      { userId: 'seed-u3', gameId: 'seed-g1', joinedAt: Date.now() - 80000000, role: 'player', isFromWaitlist: false, userName: 'יוסי לוי', userPosition: 'midfield' },
      { userId: 'seed-u4', gameId: 'seed-g1', joinedAt: Date.now() - 75000000, role: 'player', isFromWaitlist: false, userName: 'אבי מזרחי', userPosition: 'defense' },
      { userId: 'seed-u5', gameId: 'seed-g1', joinedAt: Date.now() - 70000000, role: 'player', isFromWaitlist: false, userName: 'מוחמד חלבי', userPosition: 'attack' },
      { userId: 'seed-u6', gameId: 'seed-g1', joinedAt: Date.now() - 65000000, role: 'player', isFromWaitlist: false, userName: 'עומר פרץ', userPosition: 'midfield' },
      { userId: 'seed-u2', gameId: 'seed-g2', joinedAt: Date.now() - 172800000, role: 'organizer', isFromWaitlist: false, userName: 'נועם ברק', userPosition: 'defense' },
      { userId: 'seed-u7', gameId: 'seed-g2', joinedAt: Date.now() - 160000000, role: 'player', isFromWaitlist: false, userName: 'אלון שמש', userPosition: 'attack' },
      { userId: 'seed-u8', gameId: 'seed-g2', joinedAt: Date.now() - 150000000, role: 'player', isFromWaitlist: false, userName: 'רועי גולן', userPosition: 'midfield' },
      { userId: 'seed-u1', gameId: 'seed-g3', joinedAt: Date.now() - 43200000, role: 'organizer', isFromWaitlist: false, userName: 'דוד כהן', userPosition: 'attack' },
      { userId: 'seed-u2', gameId: 'seed-g4', joinedAt: Date.now() - 21600000, role: 'organizer', isFromWaitlist: false, userName: 'נועם ברק', userPosition: 'defense' },
      { userId: 'seed-u9', gameId: 'seed-g4', joinedAt: Date.now() - 18000000, role: 'player', isFromWaitlist: false, userName: 'תומר אביב', userPosition: 'attack' },
      { userId: 'seed-u10', gameId: 'seed-g4', joinedAt: Date.now() - 15000000, role: 'player', isFromWaitlist: false, userName: 'שי כרמל', userPosition: 'defense' },
      { userId: 'seed-u1', gameId: 'seed-g5', joinedAt: Date.now() - 10800000, role: 'organizer', isFromWaitlist: false, userName: 'דוד כהן', userPosition: 'attack' },
    ];

    const messages: GameMessage[] = [
      { id: 'seed-m1', gameId: 'seed-g1', senderId: 'seed-u1', senderName: 'דוד כהן', text: 'מי מגיע היום? צריך עוד שחקנים 💪', createdAt: Date.now() - 3600000 },
      { id: 'seed-m2', gameId: 'seed-g1', senderId: 'seed-u3', senderName: 'יוסי לוי', text: 'אני בפנים! מביא עוד חבר', createdAt: Date.now() - 3000000 },
      { id: 'seed-m3', gameId: 'seed-g1', senderId: 'seed-u4', senderName: 'אבי מזרחי', text: 'מגיע, מישהו מביא כדור?', createdAt: Date.now() - 2400000 },
      { id: 'seed-m4', gameId: 'seed-g2', senderId: 'seed-u2', senderName: 'נועם ברק', text: 'משחק ב-20:30, תהיו בזמן!', createdAt: Date.now() - 7200000 },
    ];

    await saveGames(games);
    await saveAllParticipants(participants);
    await saveAllMessages(messages);
    await AsyncStorage.setItem(KEYS.SEEDED, 'true');
    console.log('[Storage] Seed complete');
  } catch (e) {
    console.log('[Storage] Error seeding:', e);
  }
}

export async function clearAllData(): Promise<void> {
  const keys = Object.values(KEYS);
  await AsyncStorage.multiRemove(keys);
  console.log('[Storage] All data cleared');
}
