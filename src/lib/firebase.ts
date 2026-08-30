import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  type User,
} from 'firebase/auth';

const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyDkD5ypXpAktc8_pDvwSZ2ej_bNyKcSpPg',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'trackshift-aa851.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'trackshift-aa851',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'trackshift-aa851.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1041841286529',
  appId: env.VITE_FIREBASE_APP_ID || '1:1041841286529:web:0e7456419fc1e334960c80',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-T1M2SXGDZB',
};

// Initialize Firebase singleton
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Format Firebase Auth error codes into human-readable messages
 */
export function formatAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'An unexpected error occurred during authentication.';
  const code = (error as { code?: string }).code || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This engineer account has been deactivated.';
    case 'auth/user-not-found':
      return 'No engineer credentials found with this email.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or passkey credentials.';
    case 'auth/email-already-in-use':
      return 'An engineer account already exists with this email address.';
    case 'auth/weak-password':
      return 'Passkey is too weak. Must be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was cancelled.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by browser. Please allow popups.';
    case 'auth/network-request-failed':
      return 'Network communication failed. Check your telemetry connection.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Access blocked temporarily for telemetry security.';
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled yet in the Firebase Console.';
    default:
      return (error as { message?: string }).message || 'Authentication failed. Please verify credentials.';
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
};
