import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type View = 'landing' | 'dashboard';
type AuthStatus = 'unauthenticated' | 'authenticating' | 'authenticated';

interface AppContextValue {
  currentView: View;
  authStatus: AuthStatus;
  authModalOpen: boolean;
  transitioning: boolean;
  username: string;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (user: string) => void;
  demoLogin: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unauthenticated');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [username, setUsername] = useState('');

  const openAuthModal = useCallback(() => setAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const performTransition = useCallback((user: string) => {
    setTransitioning(true);
    setAuthStatus('authenticating');
    setUsername(user);
    setAuthModalOpen(false);

    setTimeout(() => {
      setAuthStatus('authenticated');
      setCurrentView('dashboard');
      setTransitioning(false);
    }, 1400);
  }, []);

  const login = useCallback((user: string) => {
    performTransition(user);
  }, [performTransition]);

  const demoLogin = useCallback(() => {
    performTransition('DEMO_ENGINEER');
  }, [performTransition]);

  const logout = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => {
      setAuthStatus('unauthenticated');
      setCurrentView('landing');
      setUsername('');
      setTransitioning(false);
    }, 600);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        authStatus,
        authModalOpen,
        transitioning,
        username,
        openAuthModal,
        closeAuthModal,
        login,
        demoLogin,
        logout,
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
