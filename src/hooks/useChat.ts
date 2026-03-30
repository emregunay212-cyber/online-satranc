'use client';

import { useState, useEffect } from 'react';
import { subscribeToChat } from '@/lib/chatService';
import type { ChatMessage } from '@/types';

export function useChat(gameId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToChat(gameId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
    return unsubscribe;
  }, [gameId]);

  return { messages, loading };
}
