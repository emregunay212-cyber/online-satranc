'use client';

import { useState, useEffect } from 'react';
import { signInWithGoogle, signInAsGuest, signOut, onAuthChange } from '@/lib/auth';
import type { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Giris hatasi:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Cikis hatasi:', error);
    }
  };

  const guestSignIn = async () => {
    try {
      await signInAsGuest();
    } catch (error) {
      console.error('Misafir giris hatasi:', error);
    }
  };

  return { user, loading, signIn, guestSignIn, signOut: handleSignOut };
}
