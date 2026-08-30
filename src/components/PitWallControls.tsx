import React from 'react';
import { CompoundCode, CompoundProfile } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FastForward, RotateCcw, Wind, ShieldAlert, Disc } from 'lucide-react';

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
    <Card className="gap-4 p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <CardTitle className="text-base font-semibold">Pit-Wall Tactical Controls</CardTitle>
          <CardDescription className="font-mono mt-0.5">
            Scenario simulator for pit-stop evaluation and telemetry sensitivity testing
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onSimulateLap}
            className="h-8 text-xs font-mono gap-1.5"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Simulate Fast Lap</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetStint}
            className="h-8 text-xs font-mono gap-1.5 text-zinc-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Box / Reset Stint</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Tyre Compound Selection */}
        <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-zinc-300 flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-zinc-400" />
              Tyre Compound
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Pirelli 2026</span>
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
                  className={`flex flex-col items-center justify-center p-2 rounded-md border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-bold shadow-sm'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full mb-1 inline-block"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[10px] font-mono uppercase">
                    {code.slice(0, 3)}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-mono">
                    {prof ? `L${prof.thermal_cliff_lap}` : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Traffic & Dynamic Wake */}
        <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-zinc-300 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-zinc-400" />
              Traffic &amp; Dirty Air Injector
            </span>
            <Badge variant={currentGap < 2.0 ? 'warning' : 'outline'}>
              {currentGap < 2.0 ? 'DIRTY WAKE' : 'CLEAN AIR'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <Button
              variant={currentGap < 2.0 ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onTriggerTraffic(0.85)}
              className="h-11 flex flex-col items-start justify-center text-left py-1"
            >
              <span className="text-xs font-mono font-semibold">Inject Wake</span>
              <span className="text-[10px] text-zinc-400 font-mono font-normal">Gap: 0.85s (&lt;2.0s)</span>
            </Button>

            <Button
              variant={currentGap >= 2.0 ? 'secondary' : 'outline'}
              size="sm"
              onClick={onClearTraffic}
              className="h-11 flex flex-col items-start justify-center text-left py-1"
            >
              <span className="text-xs font-mono font-semibold">Clean Air</span>
              <span className="text-[10px] text-zinc-400 font-mono font-normal">Gap: 4.80s (Free)</span>
            </Button>
          </div>
        </div>

        {/* 3. Track Flags & Phase Rejection */}
        <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-zinc-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
              Track Flag &amp; Phase Filter
            </span>
            <span className="text-[10px] font-mono text-zinc-400">FIA Standard</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 mt-1">
            {[
              { id: 'GREEN', label: 'GREEN' },
              { id: 'YELLOW', label: 'YELLOW' },
              { id: 'VSC', label: 'VSC' },
              { id: 'SAFETY_CAR', label: 'SC' },
            ].map((f) => {
              const isSelected = currentFlag === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onSetFlag(f.id)}
                  className={`py-2 px-1 rounded-md border font-mono text-center transition cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-bold shadow-sm'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-[10px] uppercase block">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
