import React from 'react';
import { useApp } from '../../context/AppContext';
import { Zap, Github, ArrowRight } from 'lucide-react';

export function Footer() {
  const { openAuthModal } = useApp();

  return (
    <footer className="relative border-t border-slate-800/50 bg-carbon-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-kinetic-cyan" />
              <span className="font-mono text-sm font-bold text-white tracking-wider">
                APEXSHIFT <span className="text-slate-500">//</span>{' '}
                <span className="text-kinetic-cyan">2026 ERS</span>
              </span>
            </div>
            <p className="font-mono text-xs text-slate-500 leading-relaxed max-w-sm mb-6">
              Precision energy intelligence platform for the 2026 Formula 1
              grid. Real-time MGU-K optimization, MPC battery physics, and
              overtake decision telemetry.
            </p>
            <button
              onClick={openAuthModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-bold tracking-wider text-carbon-base bg-kinetic-cyan rounded-lg hover:shadow-lg hover:shadow-kinetic-cyan/20 transition-all"
            >
              GET STARTED
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-mono text-[11px] tracking-widest text-slate-400 uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-2">
              {['Architecture', 'Telemetry', 'OVS Engine', 'EV Scalability'].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-mono text-xs text-slate-500 hover:text-kinetic-cyan transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[11px] tracking-widest text-slate-400 uppercase mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              {['2026 Regulations', 'Documentation', 'API Reference', 'Status'].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-mono text-xs text-slate-500 hover:text-kinetic-cyan transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[10px] text-slate-600 tracking-wider">
            &copy; 2026 APEXSHIFT. FIA REGULATIONS COMPLIANT.
          </span>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-slate-600">
              BUILT WITH REACT + THREE.JS
            </span>
            <Github className="w-4 h-4 text-slate-600 hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
