import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type View = 'landing' | 'dashboard';
type AuthStatus = 'unauthenticated' | 'authenticating' | 'authenticated';

interface AppContextValue {
  currentView: View;
  authStatus: AuthStatus;
  authModalOpen: boolean;
  transitioning: boolean;
  username: string;
  userEmail: string;
  firebaseUser: User | null;
  isDemoMode: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, passkey: string) => Promise<void>;
  registerWithEmail: (email: string, passkey: string, callsign?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  demoLogin: () => void;
  logout: () => Promise<void>;
  setCurrentView: (view: View) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unauthenticated');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [username, setUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const openAuthModal = useCallback(() => setAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const triggerEnterTransition = useCallback((name: string, email = '') => {
    setTransitioning(true);
    setAuthStatus('authenticating');
    setUsername(name);
    setUserEmail(email);
    setAuthModalOpen(false);

    setTimeout(() => {
      setAuthStatus('authenticated');
      setCurrentView('dashboard');
      setTransitioning(false);
    }, 1200);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
        setIsDemoMode(false);
        const name = user.displayName || user.email?.split('@')[0].toUpperCase() || 'ENGINEER';
        setUsername(name);
        setUserEmail(user.email || '');
        setAuthStatus('authenticated');
      } else {
        setFirebaseUser(null);
        if (!isDemoMode) {
          setAuthStatus('unauthenticated');
          setUsername('');
          setUserEmail('');
        }
      }
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const loginWithEmail = useCallback(
    async (email: string, passkey: string) => {
      setIsDemoMode(false);
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), passkey);
      const user = userCredential.user;
      const displayName = user.displayName || user.email?.split('@')[0].toUpperCase() || 'ENGINEER';
      triggerEnterTransition(displayName, user.email || '');
    },
    [triggerEnterTransition]
  );

  const registerWithEmail = useCallback(
    async (email: string, passkey: string, callsign?: string) => {
      setIsDemoMode(false);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), passkey);
      const user = userCredential.user;
      const trimmedCallsign = callsign?.trim();
      if (trimmedCallsign) {
        await updateProfile(user, { displayName: trimmedCallsign });
      }
      const displayName = trimmedCallsign || user.email?.split('@')[0].toUpperCase() || 'ENGINEER';
      triggerEnterTransition(displayName, user.email || '');
    },
    [triggerEnterTransition]
  );

  const loginWithGoogle = useCallback(async () => {
    setIsDemoMode(false);
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    const displayName = user.displayName || user.email?.split('@')[0].toUpperCase() || 'ENGINEER';
    triggerEnterTransition(displayName, user.email || '');
  }, [triggerEnterTransition]);

  const demoLogin = useCallback(() => {
    setIsDemoMode(true);
    setFirebaseUser(null);
    triggerEnterTransition('GUEST EVALUATOR', 'demo@pitwall.f1');
  }, [triggerEnterTransition]);

  const logout = useCallback(async () => {
    setTransitioning(true);
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch {
      // ignore
    } finally {
      setIsDemoMode(false);
      setFirebaseUser(null);
      setTimeout(() => {
        setAuthStatus('unauthenticated');
        setCurrentView('landing');
        setUsername('');
        setUserEmail('');
        setTransitioning(false);
      }, 500);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        authStatus,
        authModalOpen,
        transitioning,
        username,
        userEmail,
        firebaseUser,
        isDemoMode,
        openAuthModal,
        closeAuthModal,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        demoLogin,
        logout,
        setCurrentView,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
