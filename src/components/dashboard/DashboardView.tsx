import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TelemetryPacket,
  CompoundCode,
  CompoundProfile,
  InitialSyncPacket,
  TelemetryUpdatePacket,
} from '../../types';
import { PitWallHeader } from '../PitWallHeader';
import { HeroStatsGrid } from '../HeroStatsGrid';
import { AhaTelemetryChart } from '../AhaTelemetryChart';
import { MathDecompositionPanel } from '../MathDecompositionPanel';
import { PitWallControls } from '../PitWallControls';
import { TelemetryTable } from '../TelemetryTable';
import { PythonCodeViewer } from '../PythonCodeViewer';
import { LogOut, Radio } from 'lucide-react';

export function DashboardView() {
  const { username, logout } = useApp();
  const [history, setHistory] = useState<TelemetryPacket[]>([]);
  const [latestPacket, setLatestPacket] = useState<TelemetryPacket | null>(null);
  const [compounds, setCompounds] = useState<Record<string, CompoundProfile>>({});
  const [currentCompound, setCurrentCompound] = useState<CompoundCode>('MEDIUM');
  const [filtrationEnabled, setFiltrationEnabled] = useState<boolean>(true);
  const [currentGap, setCurrentGap] = useState<number>(4.6);
  const [currentFlag, setCurrentFlag] = useState<string>('GREEN');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [connectionMode, setConnectionMode] = useState<'WS' | 'STREAM'>('STREAM');
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hydrateFromRest = useCallback(async () => {
    try {
      const res = await fetch('/api/telemetry/poll');
      if (!res.ok) return;
      const data = await res.json();
      if (data.compounds) setCompounds(data.compounds);
      if (data.current_state) {
        if (typeof data.current_state.filtration_enabled === 'boolean') {
          setFiltrationEnabled(data.current_state.filtration_enabled);
        }
        if (data.current_state.compound) setCurrentCompound(data.current_state.compound);
        if (data.current_state.gap_to_ahead !== undefined) {
          setCurrentGap(data.current_state.gap_to_ahead);
        }
        if (data.current_state.flag_status) setCurrentFlag(data.current_state.flag_status);
      }
      if (data.history_sample && data.history_sample.length > 0) {
        setHistory(data.history_sample);
        setLatestPacket(data.history_sample[data.history_sample.length - 1]);
      } else if (data.latest) {
        setLatestPacket(data.latest);
        setHistory([data.latest]);
      }
      setIsConnected(true);
    } catch {
      // Silent retry
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const ws = new WebSocket(`${protocol}//${host}/ws/telemetry`);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionMode('WS');
        setReconnectAttempts(0);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'INITIAL_SYNC') {
            const syncData = payload as InitialSyncPacket;
            if (syncData.compounds) setCompounds(syncData.compounds);
            if (typeof syncData.filtration_enabled === 'boolean') {
              setFiltrationEnabled(syncData.filtration_enabled);
            }
            if (syncData.history && syncData.history.length > 0) {
              setHistory(syncData.history);
              setLatestPacket(syncData.history[syncData.history.length - 1]);
            }
            if (syncData.current_state) {
              if (syncData.current_state.compound) setCurrentCompound(syncData.current_state.compound);
              if (syncData.current_state.gap_to_ahead !== undefined) {
                setCurrentGap(syncData.current_state.gap_to_ahead);
              }
              if (syncData.current_state.flag_status) setCurrentFlag(syncData.current_state.flag_status);
            }
          } else if (payload.event === 'TELEMETRY_UPDATE') {
            const updateData = payload as TelemetryUpdatePacket;
            const newLap = updateData.data;
            setLatestPacket(newLap);
            setCurrentGap(newLap.car_telemetry.gap_to_ahead_sec);
            setCurrentFlag(newLap.car_telemetry.flag_status);
            setCurrentCompound(newLap.tyre_metrics.compound);
            setFiltrationEnabled(newLap.filtration_applied);
            setHistory((prev) => [...prev, newLap].slice(-30));
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        setConnectionMode('STREAM');
        startPollingFallback();
        reconnectTimeoutRef.current = setTimeout(() => connectWebSocket(), 5000);
      };

      ws.onerror = () => {
        setConnectionMode('STREAM');
        startPollingFallback();
        try { ws.close(); } catch { /* ignore */ }
      };
    } catch {
      setConnectionMode('STREAM');
      startPollingFallback();
      reconnectTimeoutRef.current = setTimeout(() => connectWebSocket(), 5000);
    }
  }, []);

  const startPollingFallback = useCallback(() => {
    if (pollingIntervalRef.current) return;
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/telemetry/poll');
        if (!res.ok) return;
        const data = await res.json();
        if (data.latest) {
          const newLap = data.latest;
          setLatestPacket(newLap);
          setCurrentGap(newLap.car_telemetry.gap_to_ahead_sec);
          setCurrentFlag(newLap.car_telemetry.flag_status);
          setCurrentCompound(newLap.tyre_metrics.compound);
          setFiltrationEnabled(newLap.filtration_applied);
          setHistory((prev) => {
            if (prev.length > 0 && prev[prev.length - 1].stint_lap === newLap.stint_lap && prev[prev.length - 1].lap_number === newLap.lap_number) {
              return prev;
            }
            return [...prev, newLap].slice(-30);
          });
        }
        setIsConnected(true);
      } catch {
        // Keep retrying
      }
    }, 1200);
  }, []);

  useEffect(() => {
    hydrateFromRest();
    connectWebSocket();
    startPollingFallback();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (socketRef.current) {
        try { socketRef.current.close(); } catch { /* ignore */ }
      }
    };
  }, [hydrateFromRest, connectWebSocket, startPollingFallback]);

  const sendCommand = async (payload: Record<string, unknown>) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try { socketRef.current.send(JSON.stringify(payload)); } catch { /* ignore */ }
    }
    try {
      const res = await fetch('/api/telemetry/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const respData = await res.json();
        if (respData.result) {
          const newLap = respData.result;
          setLatestPacket(newLap);
          setHistory((prev) => [...prev, newLap].slice(-30));
        }
      }
    } catch { /* ignore */ }
  };

  const handleToggleFiltration = () => {
    const nextState = !filtrationEnabled;
    setFiltrationEnabled(nextState);
    sendCommand({ action: 'TOGGLE_FILTRATION', enabled: nextState });
  };

  const handleSelectCompound = (compound: CompoundCode) => {
    setCurrentCompound(compound);
    sendCommand({ action: 'SET_COMPOUND', compound });
  };

  const handleTriggerTraffic = (gap: number) => {
    setCurrentGap(gap);
    sendCommand({ action: 'TRIGGER_TRAFFIC', gap });
  };

  const handleClearTraffic = () => {
    setCurrentGap(4.8);
    sendCommand({ action: 'CLEAR_TRAFFIC', gap: 4.8 });
  };

  const handleSetFlag = (flag: string) => {
    setCurrentFlag(flag);
    sendCommand({ action: 'SET_FLAG', flag });
  };

  const handleResetStint = () => {
    setHistory([]);
    sendCommand({ action: 'RESET_STINT' });
  };

  const handleSimulateLap = () => {
    sendCommand({ action: 'SIMULATE_LAP' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans data-grid selection:bg-cyan-500 selection:text-slate-950">
      {/* Dashboard Top Bar */}
      <div className="w-full glass-panel border-b border-slate-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4 text-kinetic-cyan" />
            <span className="font-mono text-xs font-bold tracking-wider text-white">
              APEXSHIFT <span className="text-slate-500">//</span>{' '}
              <span className="text-kinetic-cyan">PIT WALL</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-slate-500 tracking-wider hidden sm:block">
              ENGINEER: <span className="text-kinetic-cyan">{username}</span>
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] tracking-wider text-slate-400 border border-slate-700 rounded hover:border-fia-red/50 hover:text-fia-red transition-all"
            >
              <LogOut className="w-3 h-3" />
              DISCONNECT
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-5">
        <PitWallHeader
          latestPacket={latestPacket}
          isConnected={isConnected}
          connectionMode={connectionMode}
          reconnectAttempts={reconnectAttempts}
          onOpenCodeModal={() => setIsCodeModalOpen(true)}
          filtrationEnabled={filtrationEnabled}
        />
        <HeroStatsGrid latestPacket={latestPacket} />
        <AhaTelemetryChart
          history={history}
          filtrationEnabled={filtrationEnabled}
          onToggleFiltration={handleToggleFiltration}
        />
        <MathDecompositionPanel latestPacket={latestPacket} />
        <PitWallControls
          currentCompound={currentCompound}
          compounds={compounds}
          onSelectCompound={handleSelectCompound}
          onTriggerTraffic={handleTriggerTraffic}
          onClearTraffic={handleClearTraffic}
          onSetFlag={handleSetFlag}
          onResetStint={handleResetStint}
          onSimulateLap={handleSimulateLap}
          currentGap={currentGap}
          currentFlag={currentFlag}
        />
        <TelemetryTable history={history} />
      </div>

      <PythonCodeViewer
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}
