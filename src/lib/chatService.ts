import { db } from './firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import type { ChatMessage, User } from '@/types';

const CHATS_COLLECTION = 'chats';

export async function sendMessage(
  gameId: string,
  user: User,
  text: string
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  await addDoc(collection(db, CHATS_COLLECTION, gameId, 'messages'), {
    uid: user.uid,
    name: user.displayName || 'Anonim',
    text: trimmed,
    timestamp: Date.now(),
  });
}

export function subscribeToChat(
  gameId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const q = query(
    collection(db, CHATS_COLLECTION, gameId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(200)
  );

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
    });
    callback(messages);
  });
}
