'use client';

import { useState, useEffect } from 'react';
import { subscribeToGame } from '@/lib/gameService';
import type { GameState } from '@/types';

export function useGame(gameId: string) {
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToGame(gameId, (g) => {
      setGame(g);
      setLoading(false);
    });
    return unsubscribe;
  }, [gameId]);

  return { game, loading };
}
