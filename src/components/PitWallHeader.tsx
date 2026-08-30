import React from 'react';
import { TelemetryPacket } from '../types';
import { Badge } from './ui/badge';

interface PitWallHeaderProps {
  latestPacket: TelemetryPacket | null;
  isConnected: boolean;
  connectionMode?: 'WS' | 'STREAM';
  reconnectAttempts: number;
  filtrationEnabled: boolean;
}

export const PitWallHeader: React.FC<PitWallHeaderProps> = ({
  latestPacket,
  isConnected,
  connectionMode = 'WS',
  reconnectAttempts,
}) => {
  const telemetry = latestPacket?.car_telemetry;
  const flag = telemetry?.flag_status || 'GREEN';

  const flagVariantMap: Record<string, 'success' | 'warning' | 'destructive' | 'outline'> = {
    GREEN: 'success',
    YELLOW: 'warning',
    VSC: 'warning',
    SAFETY_CAR: 'destructive',
    RED: 'destructive',
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-zinc-800/80 pb-4">
      {/* Driver & Session Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-bold text-zinc-100">
            {telemetry?.driver?.toUpperCase() || 'VERSTAPPEN'}
          </span>
          <Badge variant="outline" className="text-[10px] text-zinc-400">
            #{telemetry?.car_number || 1}
          </Badge>
        </div>

        <div className="h-4 w-px bg-zinc-800" />

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-mono text-zinc-400">LIVE TELEMETRY</span>
        </div>

        <Badge variant={flagVariantMap[flag] || 'success'} className="text-[10px]">
          {flag.replace('_', ' ')}
        </Badge>
      </div>

      {/* Environmental Metrics & Telemetry State */}
      <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
        <div className="hidden md:flex items-center gap-3">
          <span>Track: <strong className="text-zinc-200">{telemetry?.track_temp_c || 41.5}°C</strong></span>
          <span className="text-zinc-700">•</span>
          <span>Air: <strong className="text-zinc-200">{telemetry?.ambient_temp_c || 24.8}°C</strong></span>
        </div>

        <div className="h-4 w-px bg-zinc-800 hidden md:block" />

        {/* Connection Status */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-zinc-300 font-medium">
                {connectionMode === 'WS' ? '1000Hz WS' : 'STREAM'}
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-rose-400">OFFLINE (#{reconnectAttempts})</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
