'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { getLeaderboard } from '@/lib/leaderboardService';
import type { UserStats } from '@/types';

export default function LeaderboardPage() {
  const { user } = useAuthContext();
  const [players, setPlayers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then((stats) => {
        setPlayers(stats);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Skor tablosu yuklenirken hata:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Skor Tablosu</h1>

        {loading ? (
          <div className="text-center py-16">
            <div className="text-gray-400 animate-pulse">Yukleniyor...</div>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="text-5xl mb-4">&#9812;</div>
            <p className="text-gray-400 text-lg">Henuz skor tablosu bos</p>
            <p className="text-gray-500 text-sm mt-1">
              Oyunlar oynandiginda burada gorunecek
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>#</span>
              <span className="col-span-2">Oyuncu</span>
              <span className="text-center">Galibiyet</span>
              <span className="text-center">Maglubiyet</span>
              <span className="text-center">Berabere</span>
              <span className="text-right">Puan</span>
            </div>

            {/* Rows */}
            {players.map((player, index) => {
              const isCurrentUser = user?.uid === player.uid;
              return (
                <div
                  key={player.uid}
                  className={`grid grid-cols-7 gap-2 items-center px-4 py-3 rounded-lg border transition-colors ${
                    isCurrentUser
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {/* Rank */}
                  <span className={`text-sm font-bold ${
                    index === 0 ? 'text-amber-400' :
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-amber-600' :
                    'text-gray-500'
                  }`}>
                    {index + 1}
                  </span>

                  {/* Player */}
                  <div className="col-span-2 flex items-center gap-2 min-w-0">
                    {player.photoURL ? (
                      <img
                        src={player.photoURL}
                        alt={player.displayName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {player.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-white font-medium truncate">
                      {player.displayName}
                    </span>
                  </div>

                  {/* Stats */}
                  <span className="text-sm text-emerald-400 text-center font-mono">
                    {player.wins}
                  </span>
                  <span className="text-sm text-red-400 text-center font-mono">
                    {player.losses}
                  </span>
                  <span className="text-sm text-gray-400 text-center font-mono">
                    {player.draws}
                  </span>

                  {/* Rating */}
                  <span className="text-sm text-amber-400 text-right font-bold font-mono">
                    {player.rating}
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
