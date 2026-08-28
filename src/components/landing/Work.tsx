import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Layers, Wind, Gauge, Target } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface MotorsportPillar {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  color: string;
  formula: string;
  media: {
    type: 'image';
    url: string;
  };
  features: string[][];
}

const pillars: MotorsportPillar[] = [
  {
    id: '01',
    title: 'Physics Noise Cancellation',
    tagline: 'Fuel Mass & Rubbering-In Normalization',
    description:
      'Strips away ICE fuel weight burn-off (-0.042s/lap) and asphalt rubbering-in saturation curve to expose pure tyre performance.',
    icon: Layers,
    color: '#00F5FF',
    formula: 'ΔT_true = T_raw - ΔT_fuel(t) + E_track(t)',
    media: {
      type: 'image',
      url: '/dev/p-1.jpeg',
    },
    features: [
      ['Mass burn decay (-0.042s/lap)', 'Track rubbering curve', 'Asymptotic saturation model', 'Real-time ICE weight sync'],
      ['Phase anomaly rejection', 'In-lap / Out-lap filtering', 'Safety car normalization', 'Clean lap isolation'],
    ],
  },
  {
    id: '02',
    title: 'Dynamic Wake Penalty (DWP)',
    tagline: 'Dirty Air Aerodynamic Scrub Model',
    description:
      'Calculates front-wing downforce loss and elevated thermal surface scrub when following within 2.0 seconds of leading cars.',
    icon: Wind,
    color: '#FF1801',
    formula: 'DWP = α_aero · (2.0 - gap)^1.35 + β_thermal',
    media: {
      type: 'image',
      url: '/dev/p-2.jpeg',
    },
    features: [
      ['Upwash vortex detection', 'Downforce loss scaling (15-35%)', 'Proximity threshold (<2.0s)', 'Front tyre thermal scrub'],
      ['Slipstream drag offset', 'Cornering scrub coefficient', 'Turbulence wake mapping', 'Overtake dirty air delta'],
    ],
  },
  {
    id: '03',
    title: 'Multi-Compound Degradation',
    tagline: 'Pirelli 2026 C1–C5 Compound Dynamics',
    description:
      'Simulates nonlinear thermal degradation and predicts the exact lap of the tyre cliff across Soft, Medium, and Hard compounds.',
    icon: Gauge,
    color: '#FFB800',
    formula: 'Wear(lap) = k_linear · stint_lap + k_exp · exp(stint_lap - cliff)',
    media: {
      type: 'image',
      url: '/dev/p-3.jpeg',
    },
    features: [
      ['Soft C4 thermal cliff (Lap 16)', 'Medium C3 benchmark (Lap 26)', 'Hard C2 endurance (Lap 38)', 'Compound crossover matrix'],
      ['Optimal operating window (94–102°C)', 'Thermal sensitivity scaling', 'Instant stint reset', 'Grain & blister tracking'],
    ],
  },
  {
    id: '04',
    title: 'Post-Race Validation Studio',
    tagline: 'Ground Truth Accuracy & Error Benchmarking',
    description:
      'Statistically verifies model predictions against actual telemetry lap times using Mean Absolute Error (MAE), RMSE, and R² scores.',
    icon: Target,
    color: '#00FF88',
    formula: 'MAE = (1/N) · Σ |T_actual - T_predicted|  (Target: < 0.080s)',
    media: {
      type: 'image',
      url: '/dev/p-4.jpeg',
    },
    features: [
      ['MAE & RMSE distribution', 'R² coefficient of determination', 'Predicted vs actual cliff delta', 'Residual error scatter'],
      ['Multi-stint comparison', 'Driver telemetry overlay', 'Model grade classification (ELITE)', 'Undercut advantage verification'],
    ],
  },
];

export default function Work() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.from('.work-title span', {
      y: '100%',
      duration: 0.6,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play reverse play reverse',
      },
    });
  }, []);

  return (
    <div
      id="pillars"
      ref={containerRef}
      className="relative z-[20] h-fit bg-[#05070B] text-white p-6 sm:p-10 lg:p-16 border-t border-neutral-900"
    >
      {/* Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-4">
        <h2 className="text-3xl sm:text-4xl font-bold max-w-[950px] overflow-hidden work-title">
          <span className="block text-slate-100">
            Core Motorsport Intelligence Pillars
          </span>
        </h2>
        <span className="font-mono text-xs text-cyan-400 mt-2 sm:mt-0 tracking-widest uppercase font-semibold">
          // 4-STAGE PIPELINE ARCHITECTURE
        </span>
      </div>

      {/* Sticky Stacking Cards Container (Exact Template Animation) */}
      <div className="min-h-screen">
        {pillars.map((pillar) => (
          <PillarCard key={pillar.id} {...pillar} />
        ))}
      </div>
    </div>
  );
}

function PillarCard({
  id,
  title,
  tagline,
  description,
  color,
  formula,
  media,
  features,
}: MotorsportPillar) {
  return (
    <div className="sticky top-8 md:top-12 left-0 bg-[#0A0E17] border border-neutral-800 rounded-3xl h-[88vh] flex flex-col lg:flex-row justify-between my-6 p-6 sm:p-10 md:p-12 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
      {/* Left Column: ID & Titles */}
      <div className="flex-[0.35] flex flex-col justify-between items-start">
        <div>
          <span
            className="text-7xl sm:text-8xl md:text-9xl font-mono font-bold tracking-tighter"
            style={{ color: color }}
          >
            {id}
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            {title}
          </h3>
          <p className="font-mono text-xs sm:text-sm text-cyan-400 mt-1 uppercase tracking-wider font-semibold">
            {tagline}
          </p>
        </div>

        {/* Mathematical Formula Pill */}
        <div className="mt-6 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 font-mono text-xs text-slate-300">
          <span className="text-neutral-500 block text-[10px] uppercase tracking-widest mb-1">
            CORE MATHEMATICAL MODEL:
          </span>
          <span className="text-cyan-300 font-semibold">{formula}</span>
        </div>
      </div>

      {/* Right Column: Description, Media & Sub-features */}
      <div className="flex-[0.6] flex flex-col justify-between items-start gap-6 mt-6 lg:mt-0">
        <p className="text-lg sm:text-2xl text-neutral-300 leading-relaxed font-light">
          {description}
        </p>

        {/* Preview Card */}
        <div className="w-full relative rounded-2xl overflow-hidden border border-neutral-800 max-h-[220px] sm:max-h-[260px] bg-neutral-900 group">
          <img
            src={media.url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <span className="font-mono text-[11px] text-cyan-400 font-semibold uppercase tracking-wider">
              REAL-TIME SENSOR FEED // ACTIVE
            </span>
            <span className="font-mono text-[11px] text-neutral-400">
              STATUS: NOMINAL
            </span>
          </div>
        </div>

        {/* Feature Sub-lists */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-2">
          {features.map((group, i) => (
            <ul key={i} className="space-y-1.5 font-mono text-xs text-neutral-400">
              {group.map((item, j) => (
                <li key={j} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-neutral-300">{item}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
