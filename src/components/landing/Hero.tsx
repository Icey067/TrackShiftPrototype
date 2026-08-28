import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useApp } from '../../context/AppContext';
import { Zap, Play } from 'lucide-react';

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

export default function Hero() {
  const { openAuthModal, demoLogin } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const statusPillRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const tickerLeftRef = useRef<HTMLDivElement>(null);
  const tickerRightRef = useRef<HTMLDivElement>(null);
  const pRefs = useRef<HTMLParagraphElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const playHeroAnimation = () => {
      const letters =
        containerRef.current?.querySelectorAll<HTMLSpanElement>('.letter') || [];

      const tl = gsap.timeline();

      // 1. Status pill intro
      if (statusPillRef.current) {
        tl.fromTo(
          statusPillRef.current,
          { opacity: 0, y: -20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }
        );
      }

      // 2. Letters scramble & stagger in
      letters.forEach((letterEl, index) => {
        const finalChar = letterEl.getAttribute('data-char') || '';

        tl.to(
          letterEl,
          {
            duration: 0.3,
            onStart: () => {
              let scrambleCount = 0;
              const interval = setInterval(() => {
                letterEl.textContent = chars.charAt(
                  Math.floor(Math.random() * chars.length)
                );
                scrambleCount++;
                if (scrambleCount > 4) {
                  clearInterval(interval);
                  letterEl.textContent = finalChar;
                }
              }, 30);
            },
          },
          index * 0.03 + 0.1
        );
      });

      // 3. Sub-paragraphs fade & slide up
      tl.to(
        pRefs.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
        },
        '-=0.2'
      );

      // 4. CTA buttons pop in
      if (actionsRef.current) {
        tl.fromTo(
          actionsRef.current,
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.4)' },
          '-=0.3'
        );
      }

      // 5. Tickers
      if (tickerLeftRef.current && tickerRightRef.current) {
        tl.to(
          [tickerLeftRef.current, tickerRightRef.current],
          { opacity: 1, duration: 0.5, ease: 'power2.out' },
          '-=0.3'
        );
      }
    };

    // Listen for loader completion
    window.addEventListener('loaderComplete', playHeroAnimation, { once: true });

    // Fallback if loader already completed or disabled
    const fallbackTimeout = setTimeout(() => {
      playHeroAnimation();
    }, 2800);

    return () => {
      window.removeEventListener('loaderComplete', playHeroAnimation);
      clearTimeout(fallbackTimeout);
    };
  }, []);

  return (
    <div
      id="hero"
      ref={containerRef}
      className="relative z-[10] bg-black h-screen text-white flex flex-col items-center justify-center gap-2 sm:gap-4 md:gap-5 px-4 overflow-hidden select-none"
    >
      {/* Top Status Pill */}
      <div
        ref={statusPillRef}
        className="opacity-0 inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-1"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-mono text-[11px] tracking-widest text-cyan-400 uppercase font-semibold">
          FIA 2026 // ZERO-LATENCY TELEMETRY ISOLATION
        </span>
      </div>

      {/* Block 1: TRACKSHIFT */}
      <div className="md:ml-[-12%] lg:ml-[-20%] flex flex-col-reverse md:flex-row gap-3 md:gap-5 items-center">
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-aboreto tracking-wider overflow-hidden text-slate-100 leading-none">
          {'TRACKSHIFT'.split('').map((char, ci) => (
            <span
              key={ci}
              data-char={char}
              className="letter inline-block will-change-transform text-slate-100"
            >
              &nbsp;
            </span>
          ))}
        </h1>
        <p
          ref={(el) => {
            if (el && !pRefs.current.includes(el)) {
              pRefs.current.push(el);
            }
          }}
          className="hero-text font-mono text-[11px] sm:text-xs text-cyan-400 tracking-wide opacity-0 translate-y-4 max-w-[200px] text-center md:text-left leading-tight"
        >
          // we isolate the true tyre degradation curve
        </p>
      </div>

      {/* Block 2: MOTORSPORT */}
      <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-aboreto tracking-wider overflow-hidden text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-slate-100 to-amber-400 leading-none my-0">
        {'MOTORSPORT'.split('').map((char, ci) => (
          <span
            key={ci}
            data-char={char}
            className="letter inline-block will-change-transform"
          >
            &nbsp;
          </span>
        ))}
      </h1>

      {/* Block 3: INTELLIGENCE */}
      <div className="md:ml-[8%] lg:ml-[16%] flex flex-col-reverse md:flex-row items-center gap-3 md:gap-5">
        <p
          ref={(el) => {
            if (el && !pRefs.current.includes(el)) {
              pRefs.current.push(el);
            }
          }}
          className="hero-text font-mono text-[11px] sm:text-xs text-amber-400 tracking-wide opacity-0 translate-y-4 max-w-[200px] text-center md:text-right leading-tight"
        >
          // physics de-noising that cuts through dirty air
        </p>
        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-aboreto tracking-wider overflow-hidden text-slate-100 leading-none">
          {'INTELLIGENCE'.split('').map((char, ci) => (
            <span
              key={ci}
              data-char={char}
              className="letter inline-block will-change-transform text-slate-100"
            >
              &nbsp;
            </span>
          ))}
        </h1>
      </div>

      {/* Action Buttons */}
      <div
        ref={actionsRef}
        className="opacity-0 flex flex-col sm:flex-row items-center gap-3.5 mt-5 z-20"
      >
        <button
          onClick={demoLogin}
          className="px-7 py-3 font-mono text-xs font-bold tracking-widest text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 flex items-center gap-2 uppercase"
        >
          <Play className="w-3.5 h-3.5 fill-black" />
          <span>ENTER LIVE PIT WALL</span>
        </button>

        <button
          onClick={openAuthModal}
          className="px-7 py-3 font-mono text-xs font-bold tracking-widest text-slate-300 hover:text-white border border-neutral-700 hover:border-cyan-500/60 rounded-xl bg-neutral-900/60 hover:bg-neutral-900 transition-all duration-300 flex items-center gap-2 uppercase backdrop-blur-md"
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>ENGINEER AUTH</span>
        </button>
      </div>

      {/* Grid Coordinates Ticker */}
      <div
        ref={tickerLeftRef}
        className="opacity-0 absolute bottom-4 left-6 font-mono text-[10px] text-neutral-500 hidden md:block"
      >
        SILVERSTONE GP // LAT: 52.0786° N, LON: 1.0169° W
      </div>
      <div
        ref={tickerRightRef}
        className="opacity-0 absolute bottom-4 right-6 font-mono text-[10px] text-neutral-500 hidden md:block"
      >
        SAMPLING RATE: 60Hz // ENGINE STATUS: OPTIMAL
      </div>
    </div>
  );
}
