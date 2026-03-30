'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import { useGame } from '@/hooks/useGame';
import ChessBoardComponent from '@/components/ChessBoard';
import GameChat from '@/components/GameChat';
import GameInfo from '@/components/GameInfo';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const gameId = params.id as string;
  const { game } = useGame(gameId);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-gray-400 text-lg animate-pulse">Yukleniyor...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Game Info - Left */}
          <div className="w-full lg:w-64 order-2 lg:order-1">
            <GameInfo game={game} />
          </div>

          {/* Chess Board - Center */}
          <div className="order-1 lg:order-2 flex-shrink-0">
            <ChessBoardComponent gameId={gameId} />
          </div>

          {/* Chat - Right */}
          <div className="w-full lg:w-72 order-3">
            <GameChat gameId={gameId} />
          </div>
        </div>
      </div>
    </div>
  );
}
