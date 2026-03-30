'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Chess, type Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useAuthContext } from './AuthProvider';
import { useGame } from '@/hooks/useGame';
import { makeMove, endGame } from '@/lib/gameService';
import { saveGameHistory } from '@/lib/historyService';
import { updateUserStats } from '@/lib/leaderboardService';

export default function ChessBoardComponent({ gameId }: { gameId: string }) {
  const { user } = useAuthContext();
  const { game, loading } = useGame(gameId);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [gameOverHandled, setGameOverHandled] = useState(false);

  const chess = useMemo(() => {
    const c = new Chess();
    if (game?.fen) {
      c.load(game.fen);
    }
    return c;
  }, [game?.fen]);

  const playerColor = useMemo(() => {
    if (!user || !game) return null;
    if (game.white === user.uid) return 'white' as const;
    if (game.black === user.uid) return 'black' as const;
    return null;
  }, [user, game]);

  const isMyTurn = useMemo(() => {
    if (!playerColor || !game) return false;
    if (game.status !== 'playing') return false;
    return (game.turn === 'w' && playerColor === 'white') ||
           (game.turn === 'b' && playerColor === 'black');
  }, [playerColor, game]);

  const legalMoves = useMemo(() => {
    if (!selectedSquare || !isMyTurn) return [];
    return chess.moves({ square: selectedSquare, verbose: true });
  }, [chess, selectedSquare, isMyTurn]);

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(245, 158, 11, 0.4)',
      };
    }

    legalMoves.forEach((move) => {
      styles[move.to] = {
        background:
          chess.get(move.to as Square)
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 25%, transparent 25%)',
        borderRadius: '50%',
      };
    });

    if (chess.inCheck()) {
      const kingSquare = findKingSquare(chess, chess.turn());
      if (kingSquare) {
        styles[kingSquare] = {
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
        };
      }
    }

    return styles;
  }, [selectedSquare, legalMoves, chess]);

  useEffect(() => {
    if (!game || !user || gameOverHandled) return;
    if (game.status === 'playing' || game.status === 'waiting') return;
    setGameOverHandled(true);
  }, [game, user, gameOverHandled]);

  const handleGameEnd = useCallback(async (
    status: 'checkmate' | 'stalemate' | 'draw',
    winnerUid: string | null,
    newMoves: string[]
  ) => {
    if (!game || !user || !playerColor) return;

    await endGame(gameId, status, winnerUid);

    const result: 'white' | 'black' | 'draw' = status === 'checkmate'
      ? (playerColor === 'white' ? 'white' : 'black')
      : 'draw';

    await saveGameHistory({
      whiteUid: game.white,
      blackUid: game.black!,
      whiteName: game.whiteName,
      blackName: game.blackName || 'Anonim',
      moves: newMoves,
      result,
      winnerName: winnerUid === user.uid ? (user.displayName || 'Anonim') : null,
      date: Date.now(),
      moveCount: newMoves.length,
    });

    const opponent = {
      uid: playerColor === 'white' ? game.black! : game.white,
      displayName: playerColor === 'white' ? (game.blackName || 'Anonim') : game.whiteName,
      photoURL: playerColor === 'white' ? game.blackPhoto : game.whitePhoto,
      email: null,
    };

    if (status === 'checkmate') {
      await updateUserStats(user, 'win');
      await updateUserStats(opponent, 'loss');
    } else {
      await updateUserStats(user, 'draw');
      await updateUserStats(opponent, 'draw');
    }
  }, [game, user, playerColor, gameId]);

  const handlePieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: { piece: unknown; sourceSquare: string; targetSquare: string | null }): boolean => {
      if (!isMyTurn || !game || !user || !targetSquare) return false;

      try {
        const move = chess.move({
          from: sourceSquare as Square,
          to: targetSquare as Square,
          promotion: 'q',
        });

        if (!move) return false;

        const newFen = chess.fen();
        const newMoves = [...game.moves, move.san];
        const newTurn = chess.turn() as 'w' | 'b';

        makeMove(gameId, newFen, move.san, newMoves, newTurn);

        if (chess.isCheckmate()) {
          handleGameEnd('checkmate', user.uid, newMoves);
        } else if (chess.isStalemate()) {
          handleGameEnd('stalemate', null, newMoves);
        } else if (chess.isDraw()) {
          handleGameEnd('draw', null, newMoves);
        }

        setSelectedSquare(null);
        return true;
      } catch {
        return false;
      }
    },
    [isMyTurn, game, user, chess, gameId, handleGameEnd]
  );

  const handleSquareClick = useCallback(
    ({ square }: { piece: unknown; square: string }) => {
      if (!isMyTurn) return;

      const sq = square as Square;
      const piece = chess.get(sq);

      if (piece && ((chess.turn() === 'w' && piece.color === 'w') || (chess.turn() === 'b' && piece.color === 'b'))) {
        setSelectedSquare(sq);
        return;
      }

      if (selectedSquare) {
        handlePieceDrop({ piece: '', sourceSquare: selectedSquare, targetSquare: square });
        setSelectedSquare(null);
      }
    },
    [isMyTurn, chess, selectedSquare, handlePieceDrop]
  );

  const handleResign = useCallback(async () => {
    if (!game || !user || !playerColor || game.status !== 'playing') return;

    const winnerId = playerColor === 'white' ? game.black : game.white;
    await endGame(gameId, 'resigned', winnerId);

    await saveGameHistory({
      whiteUid: game.white,
      blackUid: game.black!,
      whiteName: game.whiteName,
      blackName: game.blackName || 'Anonim',
      moves: game.moves,
      result: playerColor === 'white' ? 'black' : 'white',
      winnerName: playerColor === 'white' ? (game.blackName || 'Anonim') : game.whiteName,
      date: Date.now(),
      moveCount: game.moves.length,
    });

    await updateUserStats(user, 'loss');
    const opponent = {
      uid: playerColor === 'white' ? game.black! : game.white,
      displayName: playerColor === 'white' ? (game.blackName || 'Anonim') : game.whiteName,
      photoURL: playerColor === 'white' ? game.blackPhoto : game.whitePhoto,
      email: null,
    };
    await updateUserStats(opponent, 'win');
  }, [game, user, playerColor, gameId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400 text-lg animate-pulse">Oyun yukleniyor...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-400 text-lg">Oyun bulunamadi</div>
      </div>
    );
  }

  const isFinished = ['checkmate', 'stalemate', 'draw', 'resigned'].includes(game.status);

  const statusOverlayText = () => {
    if (game.status === 'checkmate') {
      return game.winner === user?.uid ? 'Kazandiniz! Sah Mat!' : 'Kaybettiniz! Sah Mat!';
    }
    if (game.status === 'stalemate') return 'Pat! Berabere!';
    if (game.status === 'draw') return 'Berabere!';
    if (game.status === 'resigned') {
      return game.winner === user?.uid ? 'Rakip teslim oldu! Kazandiniz!' : 'Teslim oldunuz!';
    }
    return '';
  };

  return (
    <div className="relative">
      <div className="rounded-xl overflow-hidden shadow-2xl">
        <Chessboard
          options={{
            position: game.fen,
            onPieceDrop: handlePieceDrop,
            onSquareClick: handleSquareClick,
            boardOrientation: playerColor === 'black' ? 'black' : 'white',
            squareStyles: customSquareStyles,
            boardStyle: {
              borderRadius: '0.75rem',
            },
            darkSquareStyle: { backgroundColor: '#779952' },
            lightSquareStyle: { backgroundColor: '#edeed1' },
            allowDragging: isMyTurn,
          }}
        />
      </div>

      {isFinished && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
          <div className="text-center bg-gray-800 border border-gray-600 rounded-xl p-6 shadow-2xl">
            <p className="text-2xl font-bold text-white mb-2">{statusOverlayText()}</p>
            <p className="text-sm text-gray-400">
              Toplam {game.moves.length} hamle yapildi
            </p>
          </div>
        </div>
      )}

      {game.status === 'waiting' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-sm">
          <div className="text-center bg-gray-800 border border-gray-600 rounded-xl p-6 shadow-2xl">
            <div className="text-4xl mb-3 animate-bounce">&#9816;</div>
            <p className="text-lg font-semibold text-white">Rakip bekleniyor...</p>
            <p className="text-sm text-gray-400 mt-1">Birileri katildiginda oyun baslayacak</p>
          </div>
        </div>
      )}

      {game.status === 'playing' && playerColor && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleResign}
            className="rounded-lg bg-red-600/80 px-5 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
          >
            Teslim Ol
          </button>
        </div>
      )}

      {game.status === 'playing' && playerColor && (
        <div className="mt-3 text-center">
          <p className={`text-sm font-medium ${isMyTurn ? 'text-emerald-400' : 'text-gray-400'}`}>
            {isMyTurn ? 'Sizin siraniz' : 'Rakibin sirasi'}
          </p>
        </div>
      )}
    </div>
  );
}

function findKingSquare(chess: Chess, color: 'w' | 'b'): Square | null {
  const board = chess.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'k' && piece.color === color) {
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        return `${file}${rank}` as Square;
      }
    }
  }
  return null;
}
