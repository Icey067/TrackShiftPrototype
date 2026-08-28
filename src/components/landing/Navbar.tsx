import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Radio,
  Zap,
  Shield,
  Menu,
  X,
} from 'lucide-react';

export function Navbar() {
  const { openAuthModal } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-panel shadow-lg shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Zap className="w-6 h-6 text-kinetic-cyan" />
              <div className="absolute inset-0 blur-md bg-kinetic-cyan/30 rounded-full" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-mono text-sm font-bold tracking-wider text-white">
                APEXSHIFT <span className="text-slate-500">//</span>{' '}
                <span className="text-kinetic-cyan">2026 ERS</span>
              </span>
              <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                Intelligence Platform
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded border border-harvest-emerald/30 bg-harvest-emerald/5">
              <Activity className="w-3 h-3 text-harvest-emerald animate-pulse" />
              <span className="font-mono text-[10px] text-harvest-emerald tracking-wider">
                20Hz LIVE
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {['Architecture', '2026 Regulations', 'Dual-Mode EV', 'Live Telemetry'].map(
              (label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-3 py-1.5 font-mono text-xs text-slate-400 hover:text-kinetic-cyan transition-colors rounded hover:bg-kinetic-cyan/5"
                >
                  {label}
                </a>
              )
            )}
          </div>

          {/* Auth CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={openAuthModal}
              className="group relative px-5 py-2 font-mono text-xs font-bold tracking-wider text-carbon-base bg-kinetic-cyan rounded transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-kinetic-cyan/25"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5" />
                ENTER PIT WALL
              </span>
              <div className="absolute inset-0 rounded bg-kinetic-cyan blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-slate-400 hover:text-white transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-800/50 mt-2 pt-3">
            {['Architecture', '2026 Regulations', 'Dual-Mode EV', 'Live Telemetry'].map(
              (label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 font-mono text-xs text-slate-400 hover:text-kinetic-cyan transition-colors"
                >
                  {label}
                </a>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
