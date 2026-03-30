import { auth } from './firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import type { User } from '@/types';

const googleProvider = new GoogleAuthProvider();

export function signInWithGoogle(): Promise<FirebaseUser> {
  return signInWithPopup(auth, googleProvider).then((result) => result.user);
}

export function signInAsGuest(): Promise<FirebaseUser> {
  return signInAnonymously(auth).then((result) => result.user);
}

export function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Misafir' : null),
        photoURL: firebaseUser.photoURL,
        email: firebaseUser.email,
        isGuest: firebaseUser.isAnonymous,
      });
    } else {
      callback(null);
    }
  });
}
