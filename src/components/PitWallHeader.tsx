import React from 'react';
import { Wifi, WifiOff, Activity, Clock, Flame, ShieldAlert, Cpu } from 'lucide-react';
import { TelemetryPacket } from '../types';

interface PitWallHeaderProps {
  latestPacket: TelemetryPacket | null;
  isConnected: boolean;
  connectionMode?: 'WS' | 'STREAM';
  reconnectAttempts: number;
  onOpenCodeModal: () => void;
  filtrationEnabled: boolean;
}

export const PitWallHeader: React.FC<PitWallHeaderProps> = ({
  latestPacket,
  isConnected,
  connectionMode = 'WS',
  reconnectAttempts,
  onOpenCodeModal,
  filtrationEnabled,
}) => {
  const telemetry = latestPacket?.car_telemetry;
  const flag = telemetry?.flag_status || 'GREEN';

  const flagColors: Record<string, string> = {
    GREEN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    YELLOW: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40 animate-pulse',
    VSC: 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse',
    SAFETY_CAR: 'bg-amber-600/30 text-amber-300 border-amber-500 animate-pulse',
    RED: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse',
  };

  return (
    <header className="w-full glass-card rounded-xl p-4 lg:px-6 lg:py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-2xl">
      {/* Left: Brand Identity & Subtitle */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-cyan-500 rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.5)] shrink-0">
          <div className="w-4 h-4 bg-slate-950 rounded-sm" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg lg:text-xl font-black tracking-tighter text-white">
              APEX<span className="text-cyan-400">.AI</span>
            </h1>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
              PIT-WALL v2.4
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">
            Motorsport Intelligence Engine
          </p>
        </div>
      </div>

      {/* Center: Session, Driver & Environment Meta */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
        {/* Session Status */}
        <div className="text-left sm:text-right">
          <p className="text-[10px] uppercase text-slate-500 tracking-wider">Session</p>
          <p className="text-xs sm:text-sm font-mono font-bold text-emerald-400">P1 - LIVE TELEMETRY</p>
        </div>

        <div className="hidden sm:block h-7 w-px bg-slate-800" />

        {/* Driver */}
        <div className="text-left sm:text-right">
          <p className="text-[10px] uppercase text-slate-500 tracking-wider">Driver</p>
          <p className="text-xs sm:text-sm font-mono font-bold text-white">
            {telemetry?.driver?.toUpperCase() || 'VERSTAPPEN'} <span className="text-slate-500">#{telemetry?.car_number || 1}</span>
          </p>
        </div>

        <div className="hidden sm:block h-7 w-px bg-slate-800" />

        {/* Recording Badge */}
        <div className="bg-red-500/10 border border-red-500/40 px-3 py-1 rounded flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">RECORDING</span>
        </div>

        {/* Flag Status */}
        <div className={`px-2.5 py-1 rounded border font-mono font-bold flex items-center gap-1.5 text-[11px] ${flagColors[flag] || flagColors.GREEN}`}>
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{flag.replace('_', ' ')}</span>
        </div>

        {/* Track / Air Temp */}
        <div className="hidden md:flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Track: <strong className="text-slate-200">{telemetry?.track_temp_c || 41.5}°C</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Air: <strong className="text-slate-200">{telemetry?.ambient_temp_c || 24.8}°C</strong></span>
          </div>
        </div>
      </div>

      {/* Right: Code Inspector Button & Connection Status */}
      <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
        <button
          onClick={onOpenCodeModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-medium transition active:scale-95 hover:text-white"
          title="Inspect Python 3.11 FastAPI Vectorized Backend"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Python Backend</span>
        </button>

        {/* Connection Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
          {isConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider">
                  {connectionMode === 'WS' ? '1000Hz WS' : 'LIVE STREAM'}
                </span>
                <span className="text-[8px] text-slate-400 font-mono">&lt;1ms LATENCY</span>
              </div>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-rose-400">OFFLINE</span>
                <span className="text-[8px] text-slate-400 font-mono">RECONNECT #{reconnectAttempts}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
