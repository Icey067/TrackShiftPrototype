import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { TransitionOverlay } from './components/TransitionOverlay';
import { DashboardView } from './components/dashboard/DashboardView';

function AppRouter() {
  const { currentView } = useApp();

  return (
    <>
      <TransitionOverlay />
      <AuthModal />
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'dashboard' && <DashboardView />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
