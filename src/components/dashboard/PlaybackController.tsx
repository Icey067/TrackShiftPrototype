import React from 'react';
import { Play, Pause, FastForward, RotateCcw, Radio, Disc } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { PlaybackState } from '../../types';
import { ExportLogsButton } from '../common/ExportLogsButton';

interface PlaybackControllerProps {
  playbackState?: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onSetSpeed: (speed: number) => void;
  onSeek: (lapIndex: number) => void;
  onResetSynthetic: () => void;
  currentLapNumber: number;
  onExportLogs?: (format: 'csv' | 'json') => void;
  historyLength?: number;
}

export const PlaybackController: React.FC<PlaybackControllerProps> = ({
  playbackState,
  onPlay,
  onPause,
  onSetSpeed,
  onSeek,
  onResetSynthetic,
  currentLapNumber,
  onExportLogs,
  historyLength,
}) => {
  const isReplay = playbackState?.mode === 'REPLAY';
  const isPlaying = playbackState?.is_playing ?? true;
  const currentSpeed = playbackState?.speed ?? 1.0;
  const totalLaps = playbackState?.total_laps ?? 52;
  const currentLapIdx = playbackState?.current_index ?? currentLapNumber;
  const sessionTitle = playbackState?.session_title || (isReplay ? 'Replay Session' : 'Live Synthetic Simulator');

  const speeds = [1.0, 2.0, 5.0, 10.0];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 font-mono text-xs shadow-md">
      {/* Session Title & Mode Badge */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Badge
          variant={isReplay ? 'warning' : 'success'}
          className="text-[10px] shrink-0 font-mono px-2 py-0.5"
        >
          {isReplay ? 'REPLAY STREAM' : 'LIVE SIM'}
        </Badge>

        <span className="text-zinc-200 font-semibold truncate text-xs" title={sessionTitle}>
          {sessionTitle}
        </span>
      </div>

      {/* Playback Controls & Speed Buttons */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        {/* Play/Pause Button */}
        <Button
          variant={isPlaying ? 'default' : 'secondary'}
          size="sm"
          onClick={isPlaying ? onPause : onPlay}
          className="h-7 text-xs font-mono gap-1.5 px-3 font-semibold"
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </Button>

        {/* Speed Multipliers */}
        <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-md border border-zinc-800/80">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                currentSpeed === s
                  ? 'bg-zinc-800 text-zinc-100 font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Lap Counter / Progress in Replay */}
        {isReplay && (
          <div className="flex items-center gap-2 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
            <span className="text-[11px] text-zinc-400">Lap:</span>
            <span className="text-zinc-100 font-bold text-xs">
              {currentLapIdx} / {totalLaps}
            </span>
          </div>
        )}

        {/* Export Logs shortcut */}
        {onExportLogs && (
          <ExportLogsButton
            label="Export Logs"
            countLabel={historyLength !== undefined ? `${historyLength} Laps` : undefined}
            onExport={onExportLogs}
          />
        )}

        {/* Return to Live Simulator */}
        {isReplay && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetSynthetic}
            className="h-7 text-xs font-mono gap-1 text-zinc-400 hover:text-zinc-100 border-zinc-800"
            title="Reset to Live Simulator"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Sim</span>
          </Button>
        )}
      </div>
    </div>
  );
};
