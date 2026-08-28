import React from 'react';
import { Radio, Database, Sparkles, CheckCircle2 } from 'lucide-react';
import { TelemetryDataSource } from '../../types';

interface TelemetryModeSelectorProps {
  currentSource: TelemetryDataSource;
  onSelectSource: (source: TelemetryDataSource) => void;
}

export const TelemetryModeSelector: React.FC<TelemetryModeSelectorProps> = ({
  currentSource,
  onSelectSource,
}) => {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-lg border border-slate-800 backdrop-blur-md">
      <button
        onClick={() => onSelectSource('SYNTHETIC_LIVE')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
          currentSource === 'SYNTHETIC_LIVE'
            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
            : 'text-slate-400 hover:text-slate-200 border border-transparent'
        }`}
        title="Real-time WebSocket synthetic F1 telemetry generator"
      >
        <Radio className={`w-3.5 h-3.5 ${currentSource === 'SYNTHETIC_LIVE' ? 'animate-pulse text-cyan-400' : ''}`} />
        <span>Live Telemetry Sim</span>
      </button>

      <button
        onClick={() => onSelectSource('REAL_WORLD_F1')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
          currentSource === 'REAL_WORLD_F1'
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
            : 'text-slate-400 hover:text-slate-200 border border-transparent'
        }`}
        title="Curated Real-World Grand Prix Stint Telemetry"
      >
        <Database className="w-3.5 h-3.5" />
        <span>Real F1 GP Stints</span>
      </button>
    </div>
  );
};
