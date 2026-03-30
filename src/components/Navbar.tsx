'use client';

import Link from 'next/link';
import { useAuthContext } from './AuthProvider';

export default function Navbar() {
  const { user, signIn, signOut } = useAuthContext();

  return (
    <nav className="sticky top-0 z-50 h-16 bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-emerald-400 transition-colors">
          <span className="text-2xl">&#9816;</span>
          <span>Satranc Online</span>
        </Link>

        {/* Nav Links */}
        {user && (
          <div className="hidden sm:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Lobi
            </Link>
            <Link
              href="/history"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Gecmis
            </Link>
            <Link
              href="/leaderboard"
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Skor Tablosu
            </Link>
          </div>
        )}

        {/* User Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || ''}
                    className="w-8 h-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">
                    {(user.displayName || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-sm text-gray-300 font-medium">
                  {user.displayName}
                </span>
              </div>
              <button
                onClick={signOut}
                className="rounded-lg bg-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
              >
                Cikis
              </button>
            </>
          ) : (
            <button
              onClick={signIn}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
            >
              Giris Yap
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
