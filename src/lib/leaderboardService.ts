import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
  increment,
} from 'firebase/firestore';
import type { UserStats, User } from '@/types';

const STATS_COLLECTION = 'userStats';

export async function updateUserStats(
  user: User,
  result: 'win' | 'loss' | 'draw'
): Promise<void> {
  const docRef = doc(db, STATS_COLLECTION, user.uid);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    const stats: UserStats = {
      uid: user.uid,
      displayName: user.displayName || 'Anonim',
      photoURL: user.photoURL,
      wins: result === 'win' ? 1 : 0,
      losses: result === 'loss' ? 1 : 0,
      draws: result === 'draw' ? 1 : 0,
      rating: 1200 + (result === 'win' ? 25 : result === 'loss' ? -25 : 0),
    };
    await setDoc(docRef, stats);
  } else {
    const updates: Record<string, unknown> = {
      displayName: user.displayName || 'Anonim',
      photoURL: user.photoURL,
    };

    if (result === 'win') {
      updates.wins = increment(1);
      updates.rating = increment(25);
    } else if (result === 'loss') {
      updates.losses = increment(1);
      updates.rating = increment(-25);
    } else {
      updates.draws = increment(1);
    }

    await updateDoc(docRef, updates);
  }
}

export async function getLeaderboard(): Promise<UserStats[]> {
  const q = query(
    collection(db, STATS_COLLECTION),
    orderBy('rating', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  const stats: UserStats[] = [];

  snapshot.forEach((doc) => {
    stats.push(doc.data() as UserStats);
  });

  return stats;
}
