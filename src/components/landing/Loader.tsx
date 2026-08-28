import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Loader({ onComplete }: { onComplete?: () => void }) {
  const words = [
    'INITIALIZING TELEMETRY',
    'CALIBRATING SENSORS',
    'FUEL MASS DE-NOISING',
    'RUBBERING-IN SATURATION',
    'AERODYNAMIC WAKE MODEL',
    'PIRELLI 2026 PROFILES',
    'GRID SYNCHRONIZED',
    'TRACK SHIFT // READY',
  ];

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [done, setDone] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (index < words.length - 1) {
      const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setIndex((prev) => prev + 1);
          setFade(true);
        }, 100);
      }, 220);

      return () => clearInterval(interval);
    } else {
      const timeout = setTimeout(() => {
        if (loaderRef.current) {
          gsap.to(loaderRef.current, {
            scale: 0.85,
            y: -220,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.inOut',
            onComplete: () => {
              setDone(true);
              if (onComplete) onComplete();
              window.dispatchEvent(new CustomEvent('loaderComplete'));
            },
          });
        }
      }, 700);

      return () => clearTimeout(timeout);
    }
  }, [index, words.length, onComplete]);

  if (done) return null;

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[99999] h-screen w-screen flex flex-col items-center justify-center bg-black text-white px-6 pointer-events-none"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="font-mono text-xs text-cyan-400 tracking-widest uppercase">
          SYSTEM BOOT SEQUENCE // 60Hz
        </span>
      </div>
      <span
        className={`font-mono text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-center transition-opacity duration-200 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {words[index]}
      </span>
      <div className="w-48 h-0.5 bg-neutral-800 rounded-full mt-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-rose-500 transition-all duration-200"
          style={{ width: `${((index + 1) / words.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
