import React, { useState, useEffect } from 'react';
import { Zap, Battery, Shield, Timer } from 'lucide-react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
  delay: number;
}

function MetricCard({ icon, label, value, unit, color, delay }: MetricCardProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`glass-card rounded-lg px-4 py-3 flex items-center gap-3 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className={`p-2 rounded-md bg-opacity-10 ${color}`}>{icon}</div>
      <div className="flex flex-col">
        <span className="font-mono text-[10px] tracking-wider text-slate-500 uppercase">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className={`font-mono text-lg font-bold ${color}`}>{value}</span>
          <span className="font-mono text-[10px] text-slate-500">{unit}</span>
        </div>
      </div>
    </div>
  );
}

export function MetricsStrip({ boostPhase }: { boostPhase: number }) {
  const [latency, setLatency] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(35 + Math.floor(Math.random() * 20));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        icon={<Zap className="w-4 h-4 text-overtake-amber" />}
        label="Peak MGU-K Output"
        value="350"
        unit="kW"
        color="text-overtake-amber"
        delay={100}
      />
      <MetricCard
        icon={<Battery className="w-4 h-4 text-kinetic-cyan" />}
        label="Lap Energy Cap"
        value="9.0"
        unit="MJ"
        color="text-kinetic-cyan"
        delay={200}
      />
      <MetricCard
        icon={<Shield className="w-4 h-4 text-harvest-emerald" />}
        label="FIA Safety Buffer"
        value="10"
        unit="%"
        color="text-harvest-emerald"
        delay={300}
      />
      <MetricCard
        icon={<Timer className="w-4 h-4 text-fia-red" />}
        label="Edge Decision Latency"
        value={`<${latency}`}
        unit="ms"
        color="text-fia-red"
        delay={400}
      />
    </div>
  );
}
