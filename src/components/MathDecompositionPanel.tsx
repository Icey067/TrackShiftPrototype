import React from 'react';
import { Fuel, Orbit, Wind, ShieldX, Sparkles } from 'lucide-react';
import { TelemetryPacket } from '../types';

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
    <div className="glass-card rounded-lg p-4 lg:p-6 w-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm lg:text-base font-bold text-white tracking-wide uppercase font-mono">
            Mathematical Noise Cancellation Pipeline
          </h3>
          <p className="text-xs text-slate-400">
            Vectorized decomposition stripping confounding variables in real-time
          </p>
        </div>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
          NUMPY VECTORIZED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Fuel Weight Correction */}
        <div className="border-l-2 border-cyan-500 bg-slate-900/40 p-3.5 rounded-r-lg border-y border-r border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Fuel className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono font-bold uppercase">1. Fuel Burn</span>
            </div>
            <span className="text-xs font-mono font-bold text-white">
              -{fuelCorrection.toFixed(3)}s
            </span>
          </div>
          <div className="text-[10px] font-mono text-cyan-400/90 bg-slate-950/80 p-1.5 rounded border border-slate-800 my-1.5">
            ΔT_fuel = 0.042s × (Lap {stintLap} - 1)
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Removes artificial pace gain from 1.7kg/lap burned mass.
          </p>
        </div>

        {/* 2. Track Evolution */}
        <div className="border-l-2 border-emerald-500 bg-slate-900/40 p-3.5 rounded-r-lg border-y border-r border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Orbit className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono font-bold uppercase">2. Track Grip</span>
            </div>
            <span className="text-xs font-mono font-bold text-white">
              -{trackEvolution.toFixed(3)}s
            </span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400/90 bg-slate-950/80 p-1.5 rounded border border-slate-800 my-1.5">
            E(t) = 1.35s × (1 - e^(-0.048 × {sessionLap}))
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Neutralizes asphalt grip gain as rubber deposits into micro-texture.
          </p>
        </div>

        {/* 3. The USP - Dynamic Wake Penalty */}
        <div className={`border-l-2 border-amber-500 p-3.5 rounded-r-lg border-y border-r border-slate-800/80 ${
          inDirtyAir ? 'bg-amber-950/20 border-amber-500/40' : 'bg-slate-900/40'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Wind className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono font-bold uppercase">3. DWP (Dirty Air)</span>
            </div>
            <span className={`text-xs font-mono font-bold ${inDirtyAir ? 'text-amber-400' : 'text-emerald-400'}`}>
              {inDirtyAir ? `+${dwpPenalty.toFixed(3)}s` : '0.000s'}
            </span>
          </div>
          <div className="text-[10px] font-mono text-amber-400/90 bg-slate-950/80 p-1.5 rounded border border-slate-800 my-1.5">
            {inDirtyAir
              ? `DWP = 0.48 × (2.0 - Gap)^1.35 + Heat`
              : `Gap ≥ 2.0s (Clean Laminar Air)`}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Compensates for 15-35% aero loss &amp; front tyre surface scrubbing.
          </p>
        </div>

        {/* 4. Phase Rejection */}
        <div className={`border-l-2 border-purple-500 p-3.5 rounded-r-lg border-y border-r border-slate-800/80 ${
          !isValidPhase ? 'bg-rose-950/20 border-rose-500/40' : 'bg-slate-900/40'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-purple-400">
              <ShieldX className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono font-bold uppercase">4. Phase Filter</span>
            </div>
            <span className={`text-xs font-mono font-bold ${isValidPhase ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isValidPhase ? 'FLYING LAP' : 'EXCLUDED'}
            </span>
          </div>
          <div className="text-[10px] font-mono text-purple-400/90 bg-slate-950/80 p-1.5 rounded border border-slate-800 my-1.5">
            {isValidPhase ? 'Clean Lap Timing Window' : `Filter: ${rejectionReason}`}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Filters out Out-laps, In-laps, Yellow flags, VSC, and SC deltas.
          </p>
        </div>
      </div>

      {/* Formula Summary Ribbon */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
        <span className="text-slate-400 font-medium">True Isolated Pace Equation:</span>
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <span className="text-white">T_true</span>
          <span className="text-slate-500">=</span>
          <span className="text-slate-300">T_raw</span>
          <span className="text-cyan-400">+ ΔT_fuel</span>
          <span className="text-emerald-400">+ ΔT_track</span>
          <span className="text-amber-400">- DWP_wake</span>
        </div>
      </div>
    </div>
  );
};
