'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import { getGameHistory } from '@/lib/historyService';
import type { GameHistory } from '@/types';

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    getGameHistory(user.uid)
      .then((games) => {
        setHistory(games);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Gecmis yuklenirken hata:', err);
        setLoading(false);
      });
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-gray-400 text-lg animate-pulse">Yukleniyor...</div>
      </div>
    );
  }

  const getResult = (game: GameHistory): { text: string; color: string } => {
    if (game.result === 'draw') {
      return { text: 'Berabere', color: 'text-gray-400' };
    }
    const isWhite = game.whiteUid === user.uid;
    const won = (isWhite && game.result === 'white') || (!isWhite && game.result === 'black');
    return won
      ? { text: 'Kazandi', color: 'text-emerald-400' }
      : { text: 'Kaybetti', color: 'text-red-400' };
  };

  const getOpponent = (game: GameHistory): string => {
    return game.whiteUid === user.uid ? game.blackName : game.whiteName;
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Oyun Gecmisi</h1>

        {loading ? (
          <div className="text-center py-16">
            <div className="text-gray-400 animate-pulse">Yukleniyor...</div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="text-5xl mb-4">&#9816;</div>
            <p className="text-gray-400 text-lg">Henuz oyun gecmisiniz yok</p>
            <p className="text-gray-500 text-sm mt-1">
              Ilk oyununuzu oynayarak baslayin
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Tarih</span>
              <span>Rakip</span>
              <span>Sonuc</span>
              <span className="text-right">Hamle</span>
            </div>

            {/* Rows */}
            {history.map((game) => {
              const result = getResult(game);
              return (
                <div
                  key={game.id}
                  className="grid grid-cols-4 gap-4 items-center px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <span className="text-sm text-gray-300">
                    {new Date(game.date).toLocaleDateString('tr-TR')}
                  </span>
                  <span className="text-sm text-white font-medium truncate">
                    {getOpponent(game)}
                  </span>
                  <span className={`text-sm font-semibold ${result.color}`}>
                    {result.text}
                  </span>
                  <span className="text-sm text-gray-400 text-right font-mono">
                    {game.moveCount}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
