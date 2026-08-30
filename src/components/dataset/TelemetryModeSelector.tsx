import React from 'react';
import { Radio, Database } from 'lucide-react';
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
    <div className="flex items-center gap-1 p-0.5 bg-zinc-900 rounded-lg border border-zinc-800">
      <button
        onClick={() => onSelectSource('SYNTHETIC_LIVE')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
          currentSource === 'SYNTHETIC_LIVE'
            ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
        title="Real-time WebSocket synthetic F1 telemetry generator"
      >
        <Radio className={`w-3 h-3 ${currentSource === 'SYNTHETIC_LIVE' ? 'text-emerald-400' : ''}`} />
        <span>Live Sim</span>
      </button>

      <button
        onClick={() => onSelectSource('REAL_WORLD_F1')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
          currentSource === 'REAL_WORLD_F1'
            ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
        title="Curated Real-World Grand Prix Stint Telemetry"
      >
        <Database className="w-3 h-3" />
        <span>Real GP Stints</span>
      </button>
    </div>
  );
};
