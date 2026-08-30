import React from 'react';
import { TelemetryPacket } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface MathDecompositionPanelProps {
  latestPacket: TelemetryPacket | null;
}

export const MathDecompositionPanel: React.FC<MathDecompositionPanelProps> = ({ latestPacket }) => {
  const noise = latestPacket?.noise_breakdown;
  const stintLap = latestPacket?.stint_lap || 1;
  const sessionLap = latestPacket?.lap_number || 1;
  const fuelCorrection = noise?.fuel_correction_s || 0.0;
  const trackEvolution = noise?.track_evolution_s || 0.0;
  const dwpPenalty = noise?.dynamic_wake_penalty_s || 0.0;
  const inDirtyAir = noise?.in_dirty_air || false;
  const isValidPhase = latestPacket?.is_valid_phase ?? true;
  const rejectionReason = latestPacket?.rejection_reason;

  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <CardTitle className="text-base font-semibold">Mathematical Noise-Cancellation Pipeline</CardTitle>
          <CardDescription className="font-mono mt-0.5">
            Vectorized decomposition stripping confounding variables in real time
          </CardDescription>
        </div>

        <Badge variant="outline" className="font-mono text-[10px]">
          NUMPY ENGINE
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Fuel Burn */}
        <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 font-mono">
              <span className="text-xs font-semibold text-zinc-300">1. Fuel Burn Mass</span>
              <span className="text-xs font-bold text-zinc-100">-{fuelCorrection.toFixed(3)}s</span>
            </div>
            <code className="text-[11px] font-mono text-zinc-300 bg-zinc-950 px-2 py-1 rounded block border border-zinc-800/80 my-1.5">
              ΔT = 0.042s × (Lap {stintLap} - 1)
            </code>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono mt-1">
            Removes 1.7kg/lap burned ICE mass pace gain.
          </p>
        </div>

        {/* 2. Track Evolution */}
        <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 font-mono">
              <span className="text-xs font-semibold text-zinc-300">2. Track Grip E(t)</span>
              <span className="text-xs font-bold text-zinc-100">-{trackEvolution.toFixed(3)}s</span>
            </div>
            <code className="text-[11px] font-mono text-zinc-300 bg-zinc-950 px-2 py-1 rounded block border border-zinc-800/80 my-1.5">
              E(t) = 1.35 × (1 - e^(-0.048t))
            </code>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono mt-1">
            Neutralizes micro-texture asphalt rubbering.
          </p>
        </div>

        {/* 3. Dynamic Wake Penalty */}
        <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 font-mono">
              <span className="text-xs font-semibold text-zinc-300">3. Dynamic Wake</span>
              <span className={`text-xs font-bold ${inDirtyAir ? 'text-amber-400' : 'text-emerald-400'}`}>
                {inDirtyAir ? `+${dwpPenalty.toFixed(3)}s` : '0.000s'}
              </span>
            </div>
            <code className="text-[11px] font-mono text-zinc-300 bg-zinc-950 px-2 py-1 rounded block border border-zinc-800/80 my-1.5">
              {inDirtyAir ? 'DWP = 0.48 × (2.0 - Gap)^1.35' : 'Gap ≥ 2.0s (Clean Air)'}
            </code>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono mt-1">
            Compensates for 15-35% downforce loss &amp; scrub.
          </p>
        </div>

        {/* 4. Phase Filter */}
        <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 font-mono">
              <span className="text-xs font-semibold text-zinc-300">4. Phase Filter</span>
              <span className={`text-xs font-bold ${isValidPhase ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isValidPhase ? 'VALID' : 'EXCLUDED'}
              </span>
            </div>
            <code className="text-[11px] font-mono text-zinc-300 bg-zinc-950 px-2 py-1 rounded block border border-zinc-800/80 my-1.5">
              {isValidPhase ? 'Flying Lap Verified' : `Filter: ${rejectionReason}`}
            </code>
          </div>
          <p className="text-[11px] text-zinc-400 font-mono mt-1">
            Excludes In/Out laps, SC, VSC, and Yellows.
          </p>
        </div>
      </div>

      {/* Formula Footer Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-400">
        <span className="text-zinc-300 font-medium">True Isolated Pace Formula:</span>
        <div className="flex items-center gap-1.5 text-zinc-200">
          <span className="font-semibold text-zinc-100">T_true</span>
          <span className="text-zinc-500">=</span>
          <span>T_raw</span>
          <span className="text-zinc-400">+ ΔT_fuel</span>
          <span className="text-zinc-400">+ ΔT_track</span>
          <span className="text-zinc-400">- DWP_wake</span>
        </div>
      </div>
    </Card>
  );
};
