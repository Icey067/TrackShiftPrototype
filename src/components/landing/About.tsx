import React from 'react';
import { Activity, Flame, Gauge, Wind } from 'lucide-react';

const telemetryCards = [
  {
    tag: 'MODULE 01',
    title: 'Fuel Burn Mass Correction',
    metric: '-0.042s / lap',
    description:
      'Dynamically strips away 1.7kg/lap ICE mass depletion to isolate true chassis and tyre grip.',
    icon: Flame,
    color: '#00F5FF',
    accent: 'border-cyan-500/30 bg-cyan-500/10',
  },
  {
    tag: 'MODULE 02',
    title: 'Track Rubbering-In Saturation',
    metric: 'E(t) = 1.35 · (1 - e^-0.048t)',
    description:
      'Compensates for asphalt grip buildup over a 50-lap Grand Prix stint in real time.',
    icon: Activity,
    color: '#00FF88',
    accent: 'border-emerald-500/30 bg-emerald-500/10',
  },
  {
    tag: 'MODULE 03',
    title: 'Dynamic Wake Penalty (DWP)',
    metric: '15% – 35% Downforce Loss',
    description:
      'Models turbulent upwash vortices when following within < 2.0s dirty air envelope.',
    icon: Wind,
    color: '#FF1801',
    accent: 'border-rose-500/30 bg-rose-500/10',
  },
  {
    tag: 'MODULE 04',
    title: 'Tyre Thermal Cliff Prediction',
    metric: 'Pirelli C1–C5 Models',
    description:
      'Identifies the exact lap where exponential thermal degradation triggers lap time loss.',
    icon: Gauge,
    color: '#FFB800',
    accent: 'border-amber-500/30 bg-amber-500/10',
  },
];

export default function About() {
  return (
    <div
      id="about"
      className="py-16 sm:py-20 px-6 sm:px-10 lg:px-16 bg-[#080B11] text-white border-t border-neutral-900 flex flex-col justify-start"
    >
      {/* Editorial Heading */}
      <div className="max-w-[1100px]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-xs tracking-widest text-cyan-400 uppercase font-semibold">
            // Who We Are
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-100 leading-relaxed tracking-tight">
          Designers, engineers, and race strategists. Driven by mathematical precision and real-time execution. We’re motorsport purists, dedicated to stripping away fuel mass decay, track rubbering, and dirty air to unlock true tyre degradation.
        </h2>
      </div>

      {/* 4 Telemetry Architecture Cards (Guaranteed 100% Solid & Visible) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
        {telemetryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${card.accent} backdrop-blur-xl flex flex-col justify-between hover:scale-[1.02] hover:border-cyan-400/60 transition-all duration-300 shadow-2xl group bg-neutral-950/80`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
                    {card.tag}
                  </span>
                  <div
                    className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 transition-colors shadow-inner"
                    style={{ color: card.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {card.title}
                </h3>

                <p className="text-xs text-neutral-300 leading-relaxed font-mono">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 pt-3.5 border-t border-neutral-800/80 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {card.metric}
                </span>
                <span
                  className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ backgroundColor: card.color, color: card.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
