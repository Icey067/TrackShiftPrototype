import React from 'react';
import {
  Sliders,
  RotateCcw,
  FastForward,
  Wind,
  ShieldAlert,
  Disc,
  CheckCircle2,
} from 'lucide-react';
import { CompoundCode, CompoundProfile } from '../types';

interface PitWallControlsProps {
  currentCompound: CompoundCode;
  compounds: Record<string, CompoundProfile>;
  onSelectCompound: (compound: CompoundCode) => void;
  onTriggerTraffic: (gap: number) => void;
  onClearTraffic: () => void;
  onSetFlag: (flag: string) => void;
  onResetStint: () => void;
  onSimulateLap: () => void;
  currentGap: number;
  currentFlag: string;
}

export const PitWallControls: React.FC<PitWallControlsProps> = ({
  currentCompound,
  compounds,
  onSelectCompound,
  onTriggerTraffic,
  onClearTraffic,
  onSetFlag,
  onResetStint,
  onSimulateLap,
  currentGap,
  currentFlag,
}) => {
  const compoundKeys: CompoundCode[] = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'];

  return (
    <div className="glass-card rounded-lg p-4 lg:p-6 w-full relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm lg:text-base font-bold text-white tracking-wide uppercase font-mono">
            Pit-Wall Tactical Control Desk
          </h3>
          <p className="text-xs text-slate-400">
            Interactive scenario simulator for pit-wall strategy evaluation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateLap}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-semibold transition active:scale-95"
            title="Trigger instant lap telemetry tick"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Fast Lap</span>
          </button>
          <button
            onClick={onResetStint}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono font-semibold transition active:scale-95"
            title="Reset tyre stint & wear counters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Box / Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Tyre Compound Selection */}
        <div className="bg-slate-900/40 rounded-lg p-3.5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-cyan-400" />
              Tyre Compound
            </span>
            <span className="text-[9px] font-mono text-slate-500">Pirelli 2026</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 mt-1">
            {compoundKeys.map((code) => {
              const prof = compounds[code];
              const isSelected = currentCompound === code;
              const color = prof?.color_hex || '#EAB308';

              return (
                <button
                  key={code}
                  onClick={() => onSelectCompound(code)}
                  className={`flex flex-col items-center justify-center p-2 rounded border transition-all text-center ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full mb-1 inline-block"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[9px] font-mono font-bold text-slate-200 uppercase">
                    {code.slice(0, 3)}
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono">
                    {prof ? `L${prof.thermal_cliff_lap}` : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Traffic & Dynamic Wake (Dirty Air) Injector */}
        <div className="bg-slate-900/40 rounded-lg p-3.5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-amber-400" />
              Traffic &amp; Dirty Air Injector
            </span>
            <span className={`text-[9px] font-mono font-bold ${currentGap < 2.0 ? 'text-amber-400' : 'text-cyan-400'}`}>
              {currentGap < 2.0 ? 'DIRTY WAKE' : 'CLEAN AIR'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => onTriggerTraffic(0.85)}
              className={`p-2 rounded border text-left transition flex items-center justify-between ${
                currentGap < 2.0
                  ? 'bg-amber-950/60 border-amber-500/70 text-amber-200'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold block text-amber-400">
                  Inject Wake
                </span>
                <span className="text-[9px] font-mono text-slate-500">Gap: 0.85s</span>
              </div>
              {currentGap < 2.0 && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            </button>

            <button
              onClick={onClearTraffic}
              className={`p-2 rounded border text-left transition flex items-center justify-between ${
                currentGap >= 2.0
                  ? 'bg-cyan-950/60 border-cyan-500/70 text-cyan-200'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-400'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold block text-cyan-400">
                  Clean Air
                </span>
                <span className="text-[9px] font-mono text-slate-500">Gap: 4.80s</span>
              </div>
              {currentGap >= 2.0 && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
            </button>
          </div>
        </div>

        {/* 3. Track Flags & Phase Rejection */}
        <div className="bg-slate-900/40 rounded-lg p-3.5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Track Flag &amp; Phase
            </span>
            <span className="text-[9px] font-mono text-slate-500">Phase Filter</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 mt-1">
            {[
              { id: 'GREEN', label: 'GREEN', color: 'border-emerald-500 text-emerald-400' },
              { id: 'YELLOW', label: 'YELLOW', color: 'border-yellow-500 text-yellow-400' },
              { id: 'VSC', label: 'VSC', color: 'border-amber-500 text-amber-400' },
              { id: 'SAFETY_CAR', label: 'SC', color: 'border-rose-500 text-rose-400' },
            ].map((f) => {
              const isSelected = currentFlag === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onSetFlag(f.id)}
                  className={`py-2 px-1 rounded border font-mono text-center transition ${
                    isSelected
                      ? `bg-slate-800 font-bold ${f.color} shadow-sm`
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-[9px] uppercase block">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
