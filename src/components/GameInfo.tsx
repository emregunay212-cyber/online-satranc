'use client';

import type { GameState } from '@/types';
import PlayerCard from './PlayerCard';

interface GameInfoProps {
  game: GameState | null;
}

export default function GameInfo({ game }: GameInfoProps) {
  if (!game) {
    return (
      <div className="rounded-xl bg-gray-800 border border-gray-700 p-4">
        <p className="text-gray-400 text-center">Oyun yukleniyor...</p>
      </div>
    );
  }

  const statusText: Record<string, string> = {
    waiting: 'Rakip bekleniyor...',
    playing: 'Oyun devam ediyor',
    checkmate: 'Sah Mat!',
    stalemate: 'Pat!',
    draw: 'Berabere!',
    resigned: 'Teslim olundu!',
  };

  const isFinished = ['checkmate', 'stalemate', 'draw', 'resigned'].includes(game.status);

  return (
    <div className="rounded-xl bg-gray-800 border border-gray-700 p-4 space-y-4">
      {/* Status */}
      <div
        className={`text-center rounded-lg py-2 px-3 text-sm font-semibold ${
          isFinished
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : game.status === 'waiting'
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}
      >
        {statusText[game.status] || game.status}
      </div>

      {/* Players */}
      <div className="space-y-3">
        <PlayerCard
          name={game.whiteName}
          photo={game.whitePhoto}
          color="white"
          isActive={game.status === 'playing' && game.turn === 'w'}
        />

        <div className="flex items-center gap-2 px-2">
          <div className="flex-1 h-px bg-gray-600" />
          <span className="text-xs text-gray-500 font-medium">VS</span>
          <div className="flex-1 h-px bg-gray-600" />
        </div>

        {game.black ? (
          <PlayerCard
            name={game.blackName || 'Anonim'}
            photo={game.blackPhoto}
            color="black"
            isActive={game.status === 'playing' && game.turn === 'b'}
          />
        ) : (
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-600 p-3 text-gray-500 text-sm">
            Rakip bekleniyor...
          </div>
        )}
      </div>

      {/* Move Count */}
      {game.moves.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-400 border-t border-gray-700 pt-3">
          <span>Hamle Sayisi</span>
          <span className="font-mono text-white">{game.moves.length}</span>
        </div>
      )}

      {/* Turn indicator */}
      {game.status === 'playing' && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Sira</span>
          <span className="font-semibold text-white">
            {game.turn === 'w' ? 'Beyaz' : 'Siyah'}
          </span>
        </div>
      )}
    </div>
  );
}
