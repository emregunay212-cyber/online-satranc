'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from './AuthProvider';
import { createGame, joinGame, subscribeToLobby } from '@/lib/gameService';
import type { LobbyRoom } from '@/types';

export default function Lobby() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToLobby((lobbyRooms) => {
      setRooms(lobbyRooms);
    });
    return unsubscribe;
  }, []);

  const handleCreate = async () => {
    if (!user || creating) return;
    setCreating(true);
    try {
      const gameId = await createGame(user);
      router.push(`/game/${gameId}`);
    } catch (error) {
      console.error('Oyun olusturma hatasi:', error);
      setCreating(false);
    }
  };

  const handleJoin = async (room: LobbyRoom) => {
    if (!user) return;
    if (room.hostUid === user.uid) {
      router.push(`/game/${room.id}`);
      return;
    }
    try {
      await joinGame(room.id, user);
      router.push(`/game/${room.id}`);
    } catch (error) {
      console.error('Oyuna katilma hatasi:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Oyun Lobisi</h2>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/20"
        >
          {creating ? 'Olusturuluyor...' : '+ Yeni Oyun Olustur'}
        </button>
      </div>

      {/* Room List */}
      {rooms.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="text-5xl mb-4">&#9816;</div>
          <p className="text-gray-400 text-lg">Bekleyen oyun yok</p>
          <p className="text-gray-500 text-sm mt-1">
            Yeni bir oyun olusturarak baslayabilirsiniz
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between rounded-xl bg-gray-800 border border-gray-700 p-4 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                {room.hostPhoto ? (
                  <img
                    src={room.hostPhoto}
                    alt={room.hostName}
                    className="w-10 h-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg font-bold text-white">
                    {room.hostName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">{room.hostName}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(room.createdAt).toLocaleTimeString('tr-TR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleJoin(room)}
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
                  user && room.hostUid === user.uid
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {user && room.hostUid === user.uid ? 'Devam Et' : 'Katil'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
