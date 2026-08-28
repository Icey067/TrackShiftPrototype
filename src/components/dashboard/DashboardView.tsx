import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TelemetryPacket,
  CompoundCode,
  CompoundProfile,
  InitialSyncPacket,
  TelemetryUpdatePacket,
  DashboardTab,
  TelemetryDataSource,
} from '../../types';
import { PitWallHeader } from '../PitWallHeader';
import { HeroStatsGrid } from '../HeroStatsGrid';
import { AhaTelemetryChart } from '../AhaTelemetryChart';
import { MathDecompositionPanel } from '../MathDecompositionPanel';
import { PitWallControls } from '../PitWallControls';
import { TelemetryTable } from '../TelemetryTable';
import { PythonCodeViewer } from '../PythonCodeViewer';
import { ValidationStudio } from '../validation/ValidationStudio';
import { CrossoverMatrix } from '../strategy/CrossoverMatrix';
import { TelemetryModeSelector } from '../dataset/TelemetryModeSelector';
import {
  LogOut,
  Radio,
  BarChart3,
  GitBranch,
  Target,
  Sparkles,
  Layers,
} from 'lucide-react';

export function DashboardView() {
  const { username, logout } = useApp();
  const [activeTab, setActiveTab] = useState<DashboardTab>('pit-wall');
  const [dataSource, setDataSource] = useState<TelemetryDataSource>('SYNTHETIC_LIVE');

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
            const update = payload as TelemetryUpdatePacket;
            const newLap = update.data;
            setLatestPacket(newLap);
            setHistory((prev) => {
              const existingIdx = prev.findIndex(
                (p) => p.lap_number === newLap.lap_number && p.stint_lap === newLap.stint_lap
              );
              if (existingIdx >= 0) {
                const next = [...prev];
                next[existingIdx] = newLap;
                return next;
              }
              return [...prev, newLap].slice(-30);
            });
            if (newLap.tyre_metrics?.compound) {
              setCurrentCompound(newLap.tyre_metrics.compound);
            }
          }
        } catch {
          // malformed WS
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        socketRef.current = null;
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(hydrateFromRest, 2000);
        }
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts((prev) => prev + 1);
          connectWebSocket();
        }, 3000);
      };
    } catch {
      setIsConnected(false);
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = setInterval(hydrateFromRest, 2000);
      }
    }
  }, [hydrateFromRest]);

  useEffect(() => {
    hydrateFromRest();
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [hydrateFromRest, connectWebSocket]);

  const sendCommand = async (payload: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
      return;
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
    } catch {
      // ignore
    }
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

  const handleSelectSource = (src: TelemetryDataSource) => {
    setDataSource(src);
    if (src === 'REAL_WORLD_F1') {
      setActiveTab('validation');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans data-grid selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Cockpit Header */}
      <div className="w-full glass-panel border-b border-slate-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-2.5 sm:py-0 sm:h-14">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="font-mono text-xs font-bold tracking-wider text-white">
                TRACKSHIFT <span className="text-slate-500">//</span>{' '}
                <span className="text-cyan-400">AI MOTORSPORT INTELLIGENCE</span>
              </span>
            </div>

            {/* Telemetry Data Source Switcher */}
            <div className="hidden md:block">
              <TelemetryModeSelector
                currentSource={dataSource}
                onSelectSource={handleSelectSource}
              />
            </div>
          </div>

          {/* Tab Navigation Pill Group */}
          <div className="flex items-center justify-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('pit-wall')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
                activeTab === 'pit-wall'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Live Pit-Wall</span>
            </button>

            <button
              onClick={() => setActiveTab('validation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
                activeTab === 'validation'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Validation Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('crossover')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
                activeTab === 'crossover'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Crossover Matrix</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-3">
            <span className="font-mono text-[10px] text-slate-500 tracking-wider hidden lg:block">
              ENGINEER: <span className="text-cyan-400">{username}</span>
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] tracking-wider text-slate-400 border border-slate-700 rounded hover:border-rose-500/50 hover:text-rose-400 transition-all"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">DISCONNECT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-5 flex-1">
        {/* TAB 1: LIVE PIT WALL */}
        {activeTab === 'pit-wall' && (
          <>
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
          </>
        )}

        {/* TAB 2: POST-RACE VALIDATION STUDIO */}
        {activeTab === 'validation' && <ValidationStudio />}

        {/* TAB 3: COMPOUND CROSSOVER MATRIX */}
        {activeTab === 'crossover' && <CrossoverMatrix />}
      </div>

      <PythonCodeViewer
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}
