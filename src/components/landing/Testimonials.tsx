import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const testimonials = [
  {
    company: '/company/ibm.svg',
    quote:
      'TrackShift gives our pit wall the statistical confidence to pull the trigger on an undercut 3 laps before the competition even realizes their tyres are hitting the thermal cliff.',
    name: 'Sophia Martinez',
    role: 'Head of Race Strategy & Simulation',
  },
  {
    company: '/company/delta.svg',
    quote:
      'Filtering out ICE fuel mass burn and Silverstone rubbering-in in real time gives us the purest tyre degradation signal we have ever seen on a live telemetry stream.',
    name: 'James Carter',
    role: 'Senior Vehicle Dynamicist & Race Engineer',
  },
  {
    company: '/company/unileaver.svg',
    quote:
      'The Dynamic Wake Penalty model accurately isolates front-wing downforce loss when running within 1.5s dirty air, allowing our driver to preserve tyre life and execute decisive overtakes.',
    name: 'Mandlina Covachiu',
    role: 'Lead Aerodynamics & Performance Engineer',
  },
];

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    // Animate heading
    gsap.from('.testimonials-title span', {
      y: '100%',
      duration: 0.6,
      stagger: 0.05,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        toggleActions: 'play reverse play reverse',
      },
    });

    // Stagger in testimonial cards
    gsap.from('.testimonial-card', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 70%',
        toggleActions: 'play reverse play reverse',
      },
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative p-6 sm:p-10 lg:p-16 bg-[#080B11] text-white border-t border-neutral-900 overflow-hidden"
    >
      {/* Heading */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-20 mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold max-w-[950px] overflow-hidden testimonials-title">
          <span className="block text-slate-100">Pit Wall Engineering Insights</span>
        </h2>
        <p className="max-w-md text-xs sm:text-sm leading-relaxed text-neutral-400 font-mono">
          {`When hundredths of a second dictate race victory, predictive precision is everything. See how top race engineers deploy TrackShift to make split-second strategy calls.`
            .split(' ')
            .map((word, idx) => (
              <span key={idx} className="inline-block overflow-hidden mr-1">
                <span className="block">{word}</span>
              </span>
            ))}
        </p>
      </div>

      {/* Grid of Testimonial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((review, idx) => (
          <div
            key={idx}
            className="testimonial-card flex flex-col justify-between p-8 bg-neutral-900/60 border border-neutral-800 rounded-3xl backdrop-blur-md shadow-2xl hover:border-cyan-500/40 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <img
                  src={review.company}
                  alt=""
                  className="h-8 w-auto object-contain brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-semibold">
                  REPORT 0{idx + 1}
                </span>
              </div>
              <p className="text-base sm:text-lg font-normal leading-relaxed mb-6 text-neutral-200">
                “{review.quote}”
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-800">
              <h3 className="font-bold text-base text-white">
                {review.name}
              </h3>
              <h4 className="text-xs font-mono text-neutral-400">
                {review.role}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
