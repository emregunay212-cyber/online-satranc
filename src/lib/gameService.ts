import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { GameState, LobbyRoom, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const GAMES_COLLECTION = 'games';
const LOBBY_COLLECTION = 'lobby';

export async function createGame(user: User): Promise<string> {
  const gameId = uuidv4();
  const now = Date.now();

  const gameState: GameState = {
    id: gameId,
    white: user.uid,
    black: null,
    whiteName: user.displayName || 'Anonim',
    blackName: null,
    whitePhoto: user.photoURL,
    blackPhoto: null,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [],
    status: 'waiting',
    turn: 'w',
    winner: null,
    createdAt: now,
    updatedAt: now,
  };

  const lobbyRoom: LobbyRoom = {
    id: gameId,
    hostUid: user.uid,
    hostName: user.displayName || 'Anonim',
    hostPhoto: user.photoURL,
    createdAt: now,
    status: 'waiting',
  };

  await setDoc(doc(db, GAMES_COLLECTION, gameId), gameState);
  await setDoc(doc(db, LOBBY_COLLECTION, gameId), lobbyRoom);

  return gameId;
}

export async function joinGame(gameId: string, user: User): Promise<void> {
  await updateDoc(doc(db, GAMES_COLLECTION, gameId), {
    black: user.uid,
    blackName: user.displayName || 'Anonim',
    blackPhoto: user.photoURL,
    status: 'playing',
    updatedAt: Date.now(),
  });

  await updateDoc(doc(db, LOBBY_COLLECTION, gameId), {
    status: 'playing',
  });
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
