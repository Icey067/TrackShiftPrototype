import React from 'react';
import { Radio, Database, CloudDownload, UploadCloud } from 'lucide-react';
import { TelemetryDataSource } from '../../types';

interface TelemetryModeSelectorProps {
  currentSource: TelemetryDataSource;
  onSelectSource: (source: TelemetryDataSource) => void;
  onOpenFastF1Modal: () => void;
  onOpenFileUploadModal: () => void;
}

export const TelemetryModeSelector: React.FC<TelemetryModeSelectorProps> = ({
  currentSource,
  onSelectSource,
  onOpenFastF1Modal,
  onOpenFileUploadModal,
}) => {
  return (
    <div className="flex items-center gap-1 p-0.5 bg-zinc-900 rounded-lg border border-zinc-800">
      {/* 1. Live Sim */}
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

      {/* 2. FastF1 Live Ingestion */}
      <button
        onClick={() => {
          onSelectSource('FASTF1_SESSION');
          onOpenFastF1Modal();
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
          currentSource === 'FASTF1_SESSION'
            ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
        title="Query real F1 session telemetry via FastF1 / OpenF1"
      >
        <CloudDownload className={`w-3 h-3 ${currentSource === 'FASTF1_SESSION' ? 'text-sky-400' : ''}`} />
        <span>FastF1 Session</span>
      </button>

      {/* 3. Custom File Upload */}
      <button
        onClick={() => {
          onSelectSource('CUSTOM_FILE');
          onOpenFileUploadModal();
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
          currentSource === 'CUSTOM_FILE'
            ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
        title="Upload custom CSV/JSON/Parquet telemetry dataset"
      >
        <UploadCloud className={`w-3 h-3 ${currentSource === 'CUSTOM_FILE' ? 'text-amber-400' : ''}`} />
        <span>Upload File</span>
      </button>

      {/* 4. Real GP Stints */}
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
        <span>Validation Stints</span>
      </button>
    </div>
  );
};
