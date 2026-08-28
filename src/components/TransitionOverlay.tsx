import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Radio, Loader2 } from 'lucide-react';

export function TransitionOverlay() {
  const { transitioning, authStatus } = useApp();
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!transitioning) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 300);
    return () => clearInterval(interval);
  }, [transitioning]);

  if (!transitioning) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-carbon-base">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-kinetic-cyan/30 flex items-center justify-center">
            <Radio className="w-7 h-7 text-kinetic-cyan animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full border border-kinetic-cyan/10 animate-ping" />
        </div>

        {/* Status text */}
        <div className="text-center">
          <p className="font-mono text-sm font-bold text-white tracking-wider">
            {authStatus === 'authenticating'
              ? 'TELEMETRY CONNECTION ESTABLISHED'
              : 'DISCONNECTING'}
          </p>
          <p className="font-mono text-xs text-kinetic-cyan mt-2 tracking-wider">
            {authStatus === 'authenticating'
              ? `Initializing pit-wall feed${dots}`
              : 'Severing connection...'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-kinetic-cyan to-harvest-emerald rounded-full transition-all duration-300"
            style={{
              width: authStatus === 'authenticating' ? '100%' : '60%',
              animation: 'progressSlide 1.4s ease-in-out',
            }}
          />
        </div>
      </div>
    </div>
  );
}
