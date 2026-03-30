'use client';

import { useAuthContext } from '@/components/AuthProvider';
import AuthButton from '@/components/AuthButton';
import Lobby from '@/components/Lobby';

export default function HomePage() {
  const { user, loading, guestSignIn } = useAuthContext();

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
          <div className="mt-4">
            <button
              onClick={guestSignIn}
              className="flex items-center gap-2 mx-auto rounded-lg bg-gray-700 px-6 py-3 text-gray-300 font-medium hover:bg-gray-600 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Misafir Olarak Oyna
            </button>
          </div>
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
