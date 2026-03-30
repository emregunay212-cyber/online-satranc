'use client';

import { useAuthContext } from '@/components/AuthProvider';
import AuthButton from '@/components/AuthButton';
import Lobby from '@/components/Lobby';

export default function HomePage() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-gray-400 text-lg animate-pulse">Yukleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-lg px-4">
          {/* Hero */}
          <div className="text-7xl mb-6">&#9816;</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Satranc Online
          </h1>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Arkadaslarinizla veya rastgele rakiplerle gercek zamanli satranc oynamanin keyfini cikarin.
          </p>
          <AuthButton />
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl mb-2">&#9813;</div>
              <p className="text-xs text-gray-500">Gercek Zamanli</p>
            </div>
            <div>
              <div className="text-2xl mb-2">&#9818;</div>
              <p className="text-xs text-gray-500">Canli Sohbet</p>
            </div>
            <div>
              <div className="text-2xl mb-2">&#9812;</div>
              <p className="text-xs text-gray-500">Skor Tablosu</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <Lobby />
    </div>
  );
}
