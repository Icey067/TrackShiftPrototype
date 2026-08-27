import React from 'react';
import {
  Gauge,
  AlertTriangle,
  Wind,
  Thermometer,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import { TelemetryPacket } from '../types';

interface HeroStatsGridProps {
  latestPacket: TelemetryPacket | null;
}

export const HeroStatsGrid: React.FC<HeroStatsGridProps> = ({ latestPacket }) => {
  const tyre = latestPacket?.tyre_metrics;
  const noise = latestPacket?.noise_breakdown;
  const telemetry = latestPacket?.car_telemetry;

  const exhaustionPct = tyre?.exhaustion_pct ?? 18.5;
  const lapsToCliff = tyre?.laps_to_cliff ?? 14;
  const isAtCliff = tyre?.is_at_cliff ?? false;
  const inDirtyAir = noise?.in_dirty_air ?? false;
  const surfaceTemp = tyre?.surface_temp_c ?? 98.4;
  const optimumTemp = tyre?.optimum_temp_c ?? 98.0;
  const tempDelta = Number((surfaceTemp - optimumTemp).toFixed(1));
  const compoundName = tyre?.compound_name ?? 'Medium C3';
  const compoundColor = tyre?.compound_color ?? '#EAB308';

  // Dynamic styling for cliff proximity
  const getCliffStatus = (laps: number) => {
    if (laps <= 1 || isAtCliff) {
      return {
        badge: 'CLIFF BREACHED',
        badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse',
        cardClass: 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
        color: 'text-rose-400',
      };
    }
    if (laps <= 3) {
      return {
        badge: 'CRITICAL',
        badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/50 animate-pulse',
        cardClass: 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
        color: 'text-amber-400',
      };
    }
    return {
      badge: 'OPTIMAL',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      cardClass: 'border-slate-800',
      color: 'text-amber-400',
    };
  };

  const cliffStatus = getCliffStatus(lapsToCliff);

  // SVG Circular Meter math for Tyre Life
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (circumference * (100 - exhaustionPct)) / 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* 1. Tyre Life Exhaustion */}
      <div className="glass-card rounded-lg p-4 flex flex-col justify-between transition-all duration-200 hover:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">
              Tyre Life Exhaustion
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: compoundColor }}
            />
            <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">
              {compoundName.split(' ')[0]}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between my-2">
          <div>
            <p className="text-2xl lg:text-3xl font-mono font-bold text-white tracking-tight">
              {exhaustionPct.toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Stint Lap {latestPacket?.stint_lap || 1} • {latestPacket?.true_tyre_degradation ? `+${latestPacket.true_tyre_degradation}s wear` : '+0.00s'}
            </p>
          </div>

          <div className="w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center relative shrink-0">
            <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
              <circle
                cx="28"
                cy="28"
                r={radius}
                fill="none"
                stroke={exhaustionPct > 75 ? '#f43f5e' : exhaustionPct > 50 ? '#f59e0b' : '#10b981'}
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="text-[10px] font-mono font-bold text-slate-300">
              {100 - Math.round(exhaustionPct)}%
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              exhaustionPct > 75 ? 'bg-rose-500' : exhaustionPct > 50 ? 'bg-amber-500' : 'bg-emerald-400'
            }`}
            style={{ width: `${Math.min(100, exhaustionPct)}%` }}
          />
        </div>
      </div>

      {/* 2. Thermal Cliff Proximity */}
      <div className={`glass-card rounded-lg p-4 flex flex-col justify-between transition-all duration-200 ${cliffStatus.cardClass}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">
            Thermal Cliff Proximity
          </span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${cliffStatus.badgeClass}`}>
            {cliffStatus.badge}
          </span>
        </div>

        <div className="flex items-center justify-between my-2">
          <div>
            <p className={`text-2xl lg:text-3xl font-mono font-bold tracking-tight ${cliffStatus.color}`}>
              {lapsToCliff} <span className="text-xs text-slate-500 font-sans font-normal uppercase">LAPS</span>
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Degradation Inflection Boundary
            </p>
          </div>

          <div className="text-amber-500/30 p-2">
            <TrendingDown className="w-7 h-7" />
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
          <span>Non-linear cliff</span>
          <span className={isAtCliff ? 'text-rose-400 font-bold' : 'text-amber-400'}>
            {isAtCliff ? 'CLIFF REACHED' : `Safe window: ~${lapsToCliff} laps`}
          </span>
        </div>
      </div>

      {/* 3. Dynamic Wake Penalty (DWP) Status */}
      <div className={`glass-card rounded-lg p-4 flex flex-col justify-between transition-all duration-200 ${
        inDirtyAir
          ? 'border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-amber-950/15'
          : 'hover:border-slate-700'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">
            Dynamic Wake Penalty
          </span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${
            inDirtyAir
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
          }`}>
            {inDirtyAir ? 'DIRTY AIR' : 'CLEAN AIR'}
          </span>
        </div>

        <div className="flex items-center justify-between my-2">
          <div>
            <p className={`text-2xl lg:text-3xl font-mono font-bold tracking-tight ${inDirtyAir ? 'text-amber-400' : 'text-cyan-400'}`}>
              {inDirtyAir ? `+${noise?.dynamic_wake_penalty_s || 0.00}s` : `${telemetry?.gap_to_ahead_sec || 4.6}s`}
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Gap: {telemetry?.gap_to_ahead_sec || 4.6}s {inDirtyAir ? '(-' + (noise?.aero_downforce_loss_pct || 0) + '% aero)' : '(Free track)'}
            </p>
          </div>

          <div className="text-cyan-400/30 p-2">
            <Wind className="w-7 h-7" />
          </div>
        </div>

        <div className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400">Vortex Recovery</span>
          <span className={`font-bold ${inDirtyAir ? 'text-amber-400' : 'text-cyan-400'}`}>
            {inDirtyAir ? 'COMPENSATING' : 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* 4. Tread Surface Temp */}
      <div className="glass-card rounded-lg p-4 flex flex-col justify-between transition-all duration-200 hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">
            Surface Temp (AVG)
          </span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${
            Math.abs(tempDelta) <= 3.0
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : tempDelta > 3.0
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
          }`}>
            {Math.abs(tempDelta) <= 3.0 ? 'IN WINDOW' : tempDelta > 3.0 ? 'OVERHEATING' : 'COLD'}
          </span>
        </div>

        <div className="flex items-center justify-between my-2">
          <div>
            <p className="text-2xl lg:text-3xl font-mono font-bold text-white tracking-tight">
              {surfaceTemp.toFixed(1)}°C
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Optimum: {optimumTemp}°C ({tempDelta >= 0 ? `+${tempDelta}` : tempDelta}°C delta)
            </p>
          </div>

          {/* Stepped thermal indicator bars */}
          <div className="flex flex-col space-y-1 py-1">
            <div className={`w-8 h-1 rounded-xs ${surfaceTemp > 105 ? 'bg-rose-500' : 'bg-slate-800'}`} />
            <div className={`w-8 h-1 rounded-xs ${surfaceTemp > 100 ? 'bg-amber-400' : 'bg-slate-800'}`} />
            <div className={`w-8 h-1 rounded-xs ${surfaceTemp > 92 ? 'bg-emerald-400' : 'bg-slate-800'}`} />
            <div className={`w-8 h-1 rounded-xs ${surfaceTemp > 80 ? 'bg-cyan-400' : 'bg-slate-800'}`} />
          </div>
        </div>

        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-rose-500 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(10, ((surfaceTemp - 70) / (120 - 70)) * 100))}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
