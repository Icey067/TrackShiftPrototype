import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '../../context/AppContext';
import { Play, Zap } from 'lucide-react';

export default function Footer() {
  const { openAuthModal, demoLogin } = useApp();
  const footerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 75%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      });

      // Animate top footer content
      tl.from('.footer-top > div, .footer-top a, .footer-top button', {
        y: 35,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.1,
      });

      // Animate big TRACK SHIFT per letter
      tl.from(
        '.footer-title span',
        {
          yPercent: 120,
          opacity: 0,
          duration: 0.6,
          ease: 'power4.out',
          stagger: 0.04,
        },
        '-=0.3'
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={footerRef}
      className="relative z-[20] min-h-[90vh] flex flex-col justify-between p-6 sm:p-10 md:p-14 bg-black text-white border-t border-neutral-900 overflow-hidden"
    >
      {/* Top Footer Content */}
      <div className="w-full max-w-7xl mx-auto footer-top grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs sm:text-sm text-neutral-400 mt-6">
        <div>
          <p className="font-mono font-bold text-white uppercase tracking-wider text-xs mb-2">
            // Telemetry Operations
          </p>
          <p>pitwall@trackshift.ai</p>
          <p className="mt-4 font-mono font-bold text-white uppercase tracking-wider text-xs mb-2">
            // Technical Support
          </p>
          <p>support@trackshift.ai</p>
        </div>

        <div>
          <p className="font-mono font-bold text-white uppercase tracking-wider text-xs mb-2">
            // Telemetry Architecture
          </p>
          <ul className="space-y-1 font-mono">
            <li>
              <a href="#about" className="hover:text-cyan-400 transition-colors">
                Noise Cancellation
              </a>
            </li>
            <li>
              <a href="#achievements" className="hover:text-cyan-400 transition-colors">
                Ecosystem Metrics
              </a>
            </li>
            <li>
              <a href="#pillars" className="hover:text-cyan-400 transition-colors">
                Motorsport Pillars
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Icey067/TrackShiftPrototype"
                target="_blank"
                rel="noreferrer"
                className="hover:text-cyan-400 transition-colors"
              >
                GitHub Repository
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono font-bold text-white uppercase tracking-wider text-xs mb-2">
            // Regulations & Calibration
          </p>
          <p className="leading-relaxed">
            Silverstone Calibration Standard
            <br />
            FIA 2026 ERS & MGU-K Ready
            <br />
            Pirelli C1-C5 Tyre Physics
          </p>
        </div>

        <div className="flex flex-col items-start gap-2.5">
          <p className="font-mono font-bold text-white uppercase tracking-wider text-xs">
            // Live Pit Wall Access
          </p>
          <button
            onClick={demoLogin}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            Launch Demo Pit Wall
          </button>
          <button
            onClick={openAuthModal}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-cyan-400 text-neutral-200 font-mono text-xs tracking-wider uppercase transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sign In</span>
          </button>
        </div>
      </div>

      {/* Giant Footer Staggered Text */}
      <div className="w-full py-8 mt-12 overflow-hidden select-none">
        <h2 className="footer-title text-[4rem] sm:text-[7rem] md:text-[11rem] lg:text-[14rem] font-bold font-aboreto text-center text-slate-100 leading-none tracking-tight flex justify-center flex-wrap">
          {'TRACKSHIFT'.split('').map((ch, idx) => (
            <span
              key={idx}
              className="inline-block transform will-change-transform text-slate-100"
            >
              {ch}
            </span>
          ))}
        </h2>
      </div>

      {/* Bottom Legal bar */}
      <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-neutral-600 border-t border-neutral-900 pt-4">
        <span>© 2026 APEXSHIFT / TRACKSHIFT TELEMETRY SYSTEMS.</span>
        <span>ENGINEER PROTOCOL v2.4 // FORMULA 1 HISTORIC & LIVE INTELLIGENCE</span>
      </div>
    </div>
  );
}
