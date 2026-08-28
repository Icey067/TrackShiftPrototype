import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const partners = [
  '/company/ibm.svg',
  '/company/delta.svg',
  '/company/mc-donlad.svg',
  '/company/clear-street.svg',
  '/company/calme.svg',
  '/company/double-circle.svg',
  '/company/unileaver.svg',
  '/company/nanigator.svg',
];

export default function Achievements() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const numberRef = useRef<HTMLHeadingElement | null>(null);
  const textLeftRef = useRef<HTMLDivElement | null>(null);
  const textRightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Left and right text blocks slide in
      if (textLeftRef.current && textRightRef.current) {
        gsap.from([textLeftRef.current, textRightRef.current], {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        });
      }

      // Animate company logos
      gsap.from('.partner-logo', {
        opacity: 0,
        scale: 0.75,
        y: 20,
        stagger: 0.06,
        duration: 0.6,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: '.partner-logo-grid',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      // Counter timeline
      if (numberRef.current) {
        const obj = { val: 0 };
        gsap.from(numberRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: numberRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });

        gsap.to(obj, {
          val: 296,
          duration: 2,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: numberRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          onUpdate: () => {
            if (numberRef.current) {
              numberRef.current.innerText = Math.floor(obj.val).toString();
            }
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      id="achievements"
      ref={containerRef}
      className="min-h-fit py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-black text-white border-t border-neutral-900"
    >
      <div className="flex flex-col md:flex-row md:justify-between gap-10">
        <div ref={textLeftRef} className="flex-1">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Telemetry Ecosystem & Calibration
          </h2>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900 border border-neutral-800">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs text-cyan-400 tracking-wider">
              REAL-TIME CAN BUS & CAN-FD SYNC
            </span>
          </div>
        </div>

        <div ref={textRightRef} className="flex-1 flex flex-col">
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
            Calibrated against world-class motorsport standards and aerodynamic tunnel benchmarks. When milliseconds dictate race victory, noise cancellation must be absolute. Our multi-layered Kalman filtering and vehicle mass models deliver instant clarity to race strategists worldwide.
          </p>

          {/* Partner & Tech Badges */}
          <div className="partner-logo-grid grid grid-cols-4 mt-8 gap-4 md:gap-6">
            {partners.map((logo, idx) => (
              <div
                key={idx}
                className="partner-logo p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-center hover:border-cyan-500/40 hover:bg-neutral-800/60 transition-all group"
              >
                <img
                  src={logo}
                  alt="Partner Logo"
                  className="h-8 md:h-10 w-auto object-contain brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Numerical Counter Metric Block */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mt-16 md:mt-24 pt-12 border-t border-neutral-900">
        <div className="flex flex-col">
          <h5 className="text-xs sm:text-sm font-mono tracking-widest text-cyan-400 uppercase -mb-2 ml-1">
            // TELEMETRY STINTS VALIDATED
          </h5>
          <h2
            ref={numberRef}
            className="text-7xl sm:text-8xl md:text-[10rem] font-bold font-mono tracking-tight text-white leading-none mt-2"
            style={{ minWidth: '4ch' }}
          >
            0
          </h2>
        </div>

        <div className="text-xs sm:text-sm font-mono text-neutral-400 max-w-sm md:max-w-md mt-6 md:mt-0 leading-relaxed">
          Zero approximations in critical pit-stop windows. Every lap time is mathematically normalized for ICE fuel mass decay (-0.042s/lap) and asphalt rubbering-in saturation.
        </div>
      </div>
    </div>
  );
}
