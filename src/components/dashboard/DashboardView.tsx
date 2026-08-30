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
import ScrollProvider from '../../hooks/ScrollProvider';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import {
  LogOut,
  Radio,
  Target,
  GitBranch,
  ArrowLeft,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // GSAP ScrollTrigger Fade In Animations from norrav-landing-page template
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Intro animations for top header and stats grid
      gsap.fromTo(
        '.dash-header-anim',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );

      gsap.fromTo(
        '.dash-stats-anim',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.1, ease: 'power3.out' }
      );

      // Scroll triggered animations for chart, math panel, controls, and table
      const scrollSections = [
        { selector: '.dash-chart-anim', start: 'top 90%' },
        { selector: '.dash-math-anim', start: 'top 88%' },
        { selector: '.dash-controls-anim', start: 'top 88%' },
        { selector: '.dash-table-anim', start: 'top 88%' },
        { selector: '.dash-validation-anim', start: 'top 90%' },
        { selector: '.dash-crossover-anim', start: 'top 90%' },
      ];

      scrollSections.forEach(({ selector, start }) => {
        const el = containerRef.current?.querySelector(selector);
        if (el) {
          gsap.fromTo(
            el,
            { y: 35, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.65,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: start,
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });
    }, containerRef);

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, [activeTab]);

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
    <ScrollProvider>
      <div ref={containerRef} className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-zinc-100">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
          <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 gap-1.5 px-2.5 text-xs text-zinc-400 hover:text-zinc-100 font-mono"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Landing</span>
              </Button>

              <div className="h-4 w-px bg-zinc-800" />

              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold tracking-tight text-zinc-100">
                  TrackShift <span className="text-zinc-600 font-normal">/</span>{' '}
                  <span className="text-zinc-400 font-normal">Pit-Wall</span>
                </span>
              </div>

              <div className="hidden lg:block">
                <TelemetryModeSelector
                  currentSource={dataSource}
                  onSelectSource={handleSelectSource}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-zinc-500 hidden sm:inline">
                Engineer: <span className="text-zinc-300 font-medium">{username}</span>
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="h-8 text-xs font-mono gap-1.5 border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as DashboardTab)}>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <TabsList className="bg-zinc-900 border-zinc-800">
                <TabsTrigger value="pit-wall" className="gap-1.5 font-mono text-xs">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Live Pit-Wall</span>
                </TabsTrigger>

                <TabsTrigger value="validation" className="gap-1.5 font-mono text-xs">
                  <Target className="w-3.5 h-3.5" />
                  <span>Validation Studio</span>
                </TabsTrigger>

                <TabsTrigger value="crossover" className="gap-1.5 font-mono text-xs">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Crossover Matrix</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: LIVE PIT WALL */}
            <TabsContent value="pit-wall" className="flex flex-col gap-5">
              <div className="dash-header-anim">
                <PitWallHeader
                  latestPacket={latestPacket}
                  isConnected={isConnected}
                  connectionMode={connectionMode}
                  reconnectAttempts={reconnectAttempts}
                  onOpenCodeModal={() => setIsCodeModalOpen(true)}
                  filtrationEnabled={filtrationEnabled}
                />
              </div>

              <div className="dash-stats-anim">
                <HeroStatsGrid latestPacket={latestPacket} />
              </div>

              <div className="dash-chart-anim">
                <AhaTelemetryChart
                  history={history}
                  filtrationEnabled={filtrationEnabled}
                  onToggleFiltration={handleToggleFiltration}
                />
              </div>

              <div className="dash-math-anim">
                <MathDecompositionPanel latestPacket={latestPacket} />
              </div>

              <div className="dash-controls-anim">
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
              </div>

              <div className="dash-table-anim">
                <TelemetryTable history={history} />
              </div>
            </TabsContent>

            {/* TAB 2: POST-RACE VALIDATION STUDIO */}
            <TabsContent value="validation" className="dash-validation-anim">
              <ValidationStudio />
            </TabsContent>

            {/* TAB 3: COMPOUND CROSSOVER MATRIX */}
            <TabsContent value="crossover" className="dash-crossover-anim">
              <CrossoverMatrix />
            </TabsContent>
          </Tabs>
        </main>

        <PythonCodeViewer
          isOpen={isCodeModalOpen}
          onClose={() => setIsCodeModalOpen(false)}
        />
      </div>
    </ScrollProvider>
  );
}
