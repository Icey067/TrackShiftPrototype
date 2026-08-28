import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Database, Crosshair, Truck, ArrowRight, ChevronRight } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  metrics: { label: string; value: string }[];
  accentColor: string;
  glowColor: string;
  delay: number;
}

function FeatureCard({
  icon,
  title,
  description,
  metrics,
  accentColor,
  glowColor,
  delay,
}: FeatureCardProps) {
  const [visible, setVisible] = useState(false);
  const { openAuthModal } = useApp();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`group relative glass-card rounded-xl p-6 transition-all duration-700 hover:border-opacity-80 cursor-pointer ${accentColor} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      onClick={openAuthModal}
    >
      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-16 h-16 opacity-20`}>
        <div className={`absolute top-0 right-0 w-8 h-[1px] ${glowColor}`} />
        <div className={`absolute top-0 right-0 h-8 w-[1px] ${glowColor}`} />
      </div>

      {/* Icon */}
      <div className={`p-3 rounded-lg bg-opacity-10 inline-flex mb-4 ${accentColor}`}>
        {icon}
      </div>

      {/* Title */}
      <h3 className="font-mono text-base font-bold text-white mb-2 tracking-wide">
        {title}
      </h3>

      {/* Description */}
      <p className="font-mono text-xs text-slate-400 leading-relaxed mb-5">
        {description}
      </p>

      {/* Metrics */}
      <div className="flex flex-wrap gap-3 mb-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
              {m.label}
            </span>
            <span className={`font-mono text-sm font-bold ${accentColor}`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className={`flex items-center gap-1.5 font-mono text-xs ${accentColor} group-hover:gap-3 transition-all`}>
        <span>Access Pipeline</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

export function FeatureCards() {
  return (
    <section id="architecture" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-16">
        <span className="font-mono text-[11px] tracking-[0.3em] text-kinetic-cyan uppercase">
          Platform Architecture
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Three Pillars of{' '}
          <span className="text-gradient-cyan">Race Intelligence</span>
        </h2>
        <p className="mt-4 max-w-xl mx-auto font-mono text-sm text-slate-400">
          End-to-end telemetry pipeline from circuit sensors to pit-wall
          decision engines.
        </p>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <FeatureCard
          icon={<Database className="w-5 h-5 text-kinetic-cyan" />}
          title="Edge-to-Cloud Telemetry Pipeline"
          description="FastF1 real data ingestion at 20Hz with noise-cancellation isolating true tyre degradation signals from raw telemetry."
          metrics={[
            { label: 'Sample Rate', value: '20 Hz' },
            { label: 'Latency', value: '<50ms' },
          ]}
          accentColor="text-kinetic-cyan"
          glowColor="bg-kinetic-cyan"
          delay={100}
        />
        <FeatureCard
          icon={<Crosshair className="w-5 h-5 text-overtake-amber" />}
          title="Predictive Overtake Viability"
          description="Automated risk-reward calculation for DRS zones with real-time energy deployment strategy and gap prediction."
          metrics={[
            { label: 'OVS Score', value: '94.7%' },
            { label: 'DRS Zones', value: '3 Active' },
          ]}
          accentColor="text-overtake-amber"
          glowColor="bg-overtake-amber"
          delay={250}
        />
        <FeatureCard
          icon={<Truck className="w-5 h-5 text-harvest-emerald" />}
          title="Commercial EV Scalability"
          description="Dual-mode toggle adapting F1 race math to heavy-duty logistics — fleet energy optimization and regen strategies."
          metrics={[
            { label: 'Fleet EV Range', value: '+18%' },
            { label: 'Regen Capture', value: '92%' },
          ]}
          accentColor="text-harvest-emerald"
          glowColor="bg-harvest-emerald"
          delay={400}
        />
      </div>
    </section>
  );
}
