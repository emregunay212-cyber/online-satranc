import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import type { GameHistory } from '@/types';

const HISTORY_COLLECTION = 'gameHistory';

export async function saveGameHistory(history: Omit<GameHistory, 'id'>): Promise<void> {
  await addDoc(collection(db, HISTORY_COLLECTION), history);
}

export async function getGameHistory(uid: string): Promise<GameHistory[]> {
  const q1 = query(
    collection(db, HISTORY_COLLECTION),
    where('whiteUid', '==', uid),
    orderBy('date', 'desc'),
    limit(50)
  );

  const q2 = query(
    collection(db, HISTORY_COLLECTION),
    where('blackUid', '==', uid),
    orderBy('date', 'desc'),
    limit(50)
  );

  const [whiteSnap, blackSnap] = await Promise.all([getDocs(q1), getDocs(q2)]);

  const games: GameHistory[] = [];

  whiteSnap.forEach((doc) => {
    games.push({ id: doc.id, ...doc.data() } as GameHistory);
  });

  blackSnap.forEach((doc) => {
    games.push({ id: doc.id, ...doc.data() } as GameHistory);
  });

  // Sort by date descending and remove duplicates
  games.sort((a, b) => b.date - a.date);

  const seen = new Set<string>();
  return games.filter((g) => {
    if (seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });
}
