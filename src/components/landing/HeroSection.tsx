import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Zap, ChevronRight, BookOpen } from 'lucide-react';
import { MetricsStrip } from './MetricsStrip';
import { HeroCanvas3D } from './HeroCanvas3D';

export function HeroSection() {
  const { openAuthModal } = useApp();
  const [boostPhase, setBoostPhase] = useState(0.5);
  const [particleSpeed, setParticleSpeed] = useState(0.5);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      const t = Date.now() * 0.001;
      setBoostPhase((Math.sin(t * 0.8) + 1) / 2);
      setParticleSpeed(0.3 + Math.abs(Math.sin(t * 0.4)) * 0.7);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handler = () => {
      const scrollY = window.scrollY;
      const speed = Math.min(scrollY / 300, 1);
      setParticleSpeed((prev) => Math.max(prev, speed));
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 3D Canvas Background */}
      <HeroCanvas3D boostPhase={boostPhase} particleSpeed={particleSpeed} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-carbon-base/60 via-transparent to-carbon-base z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-carbon-base/40 via-transparent to-carbon-base/40 z-[1]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex flex-col items-center text-center">
        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-kinetic-cyan/20 bg-kinetic-cyan/5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-kinetic-cyan animate-pulse" />
          <span className="font-mono text-[11px] tracking-widest text-kinetic-cyan">
            FORMULA 1 // 2026 REGULATIONS COMPLIANT
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight max-w-5xl mb-6">
          <span className="text-white">PRECISION </span>
          <span className="text-gradient-cyan">ENERGY</span>
          <br />
          <span className="text-white">INTELLIGENCE FOR THE </span>
          <span className="text-gradient-amber">2026 GRID</span>
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl text-slate-400 text-sm sm:text-base leading-relaxed mb-10 font-mono">
          Real-time 350kW MGU-K deployment optimization, Model Predictive
          Control battery physics, and overtake decision telemetry.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
          <button
            onClick={openAuthModal}
            className="group relative px-8 py-3.5 font-mono text-sm font-bold tracking-wider text-carbon-base bg-kinetic-cyan rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-kinetic-cyan/30 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              LAUNCH LIVE TELEMETRY
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <a
            href="#architecture"
            className="px-8 py-3.5 font-mono text-sm font-bold tracking-wider text-slate-300 border border-slate-700 rounded-lg hover:border-kinetic-cyan/50 hover:text-kinetic-cyan transition-all duration-300 hover:bg-kinetic-cyan/5"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              EXPLORE 2026 REGULATIONS
            </span>
          </a>
        </div>

        {/* HUD Metrics Strip */}
        <MetricsStrip boostPhase={boostPhase} />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-carbon-base to-transparent z-[2]" />
    </section>
  );
}
