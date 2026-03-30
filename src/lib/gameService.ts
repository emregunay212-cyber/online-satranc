import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
} from 'firebase/firestore';
import type { GameState, LobbyRoom, User } from '@/types';

const GAMES_COLLECTION = 'games';
const LOBBY_COLLECTION = 'lobby';

function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function createGame(user: User): Promise<string> {
  const gameId = generateId();
  const now = Date.now();

  const gameData = {
    id: gameId,
    white: user.uid,
    black: '',
    whiteName: user.displayName || 'Misafir',
    blackName: '',
    whitePhoto: user.photoURL || '',
    blackPhoto: '',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [] as string[],
    status: 'waiting',
    turn: 'w',
    winner: '',
    createdAt: now,
    updatedAt: now,
  };

  const lobbyData = {
    id: gameId,
    hostUid: user.uid,
    hostName: user.displayName || 'Misafir',
    hostPhoto: user.photoURL || '',
    createdAt: now,
    status: 'waiting',
  };

  await setDoc(doc(db, GAMES_COLLECTION, gameId), gameData);
  await setDoc(doc(db, LOBBY_COLLECTION, gameId), lobbyData);

  return gameId;
}

export async function joinGame(gameId: string, user: User): Promise<void> {
  await updateDoc(doc(db, GAMES_COLLECTION, gameId), {
    black: user.uid,
    blackName: user.displayName || 'Misafir',
    blackPhoto: user.photoURL || '',
    status: 'playing',
    updatedAt: Date.now(),
  });

  try {
    await deleteDoc(doc(db, LOBBY_COLLECTION, gameId));
  } catch {
    // lobby entry may not exist
  }
}

export async function makeMove(
  gameId: string,
  fen: string,
  move: string,
  moves: string[],
  turn: 'w' | 'b'
): Promise<void> {
  await updateDoc(doc(db, GAMES_COLLECTION, gameId), {
    fen,
    moves,
    turn,
    updatedAt: Date.now(),
  });
}

export async function endGame(
  gameId: string,
  status: GameState['status'],
  winner: string | null
): Promise<void> {
  await updateDoc(doc(db, GAMES_COLLECTION, gameId), {
    status,
    winner,
    updatedAt: Date.now(),
  });

  // Remove from lobby
  try {
    await deleteDoc(doc(db, LOBBY_COLLECTION, gameId));
  } catch {
    // Lobby entry may already be removed
  }
}

export function subscribeToGame(
  gameId: string,
  callback: (game: GameState | null) => void
): () => void {
  return onSnapshot(doc(db, GAMES_COLLECTION, gameId), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as GameState);
    } else {
      callback(null);
    }
  });
}

export function subscribeToLobby(
  callback: (rooms: LobbyRoom[]) => void
): () => void {
  const q = query(
    collection(db, LOBBY_COLLECTION),
    where('status', '==', 'waiting')
  );

  return onSnapshot(q, (snapshot) => {
    const rooms: LobbyRoom[] = [];
    snapshot.forEach((doc) => {
      rooms.push(doc.data() as LobbyRoom);
    });
    rooms.sort((a, b) => b.createdAt - a.createdAt);
    callback(rooms);
  }, (error) => {
    console.error('Lobi dinleme hatasi:', error);
    callback([]);
  });
}
