import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TelemetryPacket, CompoundCode } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Radio,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Volume2,
  Target,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface PitWallDebriefCardProps {
  latestPacket: TelemetryPacket | null;
  currentCompound?: CompoundCode;
  currentGap?: number;
}

export const PitWallDebriefCard: React.FC<PitWallDebriefCardProps> = ({
  latestPacket,
  currentCompound,
  currentGap,
}) => {
  const [debrief, setDebrief] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [autoDebrief, setAutoDebrief] = useState<boolean>(false);
  const [lastDebriefLap, setLastDebriefLap] = useState<number | null>(null);

  const prevLapRef = useRef<number | null>(null);

  // Request new AI debrief from backend
  const requestDebrief = useCallback(async () => {
    if (!latestPacket || isLoading) return;

    setIsLoading(true);
    setError(null);

    const lap = latestPacket.lap_number || 1;
    const driver = latestPacket.car_telemetry?.driver || 'VERSTAPPEN';
    const compound = currentCompound || latestPacket.tyre_metrics?.compound || 'MEDIUM';
    const isolatedPace = latestPacket.true_isolated_pace;
    const rawLapTime = latestPacket.raw_lap_time;
    const lapsToCliff = latestPacket.tyre_metrics?.laps_to_cliff ?? 14;
    const tyreCliffLap = lap + lapsToCliff;
    const fuelRemainingKg = latestPacket.car_telemetry?.fuel_remaining_kg ?? 70;
    const dirtyAirGap = currentGap !== undefined ? currentGap : latestPacket.car_telemetry?.gap_to_ahead_sec;
    const circuit = latestPacket.car_telemetry?.circuit || 'Silverstone Circuit';

    try {
      const res = await fetch('/api/ai/engineer-debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lap,
          driver,
          compound,
          isolatedPace,
          rawLapTime,
          tyreCliffLap,
          fuelRemainingKg,
          dirtyAirGap,
          circuit,
        }),
      });

      const data = await res.json();

      if (data.success && data.debrief) {
        setDebrief(data.debrief);
        setLastDebriefLap(lap);
      } else {
        setError(data.error || 'Failed to generate debrief from pit-wall engineer engine.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error while contacting pit-wall radio server.');
    } finally {
      setIsLoading(false);
    }
  }, [latestPacket, currentCompound, currentGap, isLoading]);

  // Handle auto-debrief when lap increments or cliff status becomes critical
  useEffect(() => {
    if (!autoDebrief || !latestPacket) return;

    const currentLap = latestPacket.lap_number;
    const isCliffCritical = (latestPacket.tyre_metrics?.laps_to_cliff ?? 10) <= 2;

    // Trigger on every 4 laps or critical cliff proximity
    if (
      currentLap &&
      prevLapRef.current !== currentLap &&
      (currentLap % 4 === 0 || (isCliffCritical && lastDebriefLap !== currentLap))
    ) {
      prevLapRef.current = currentLap;
      requestDebrief();
    }
  }, [latestPacket, autoDebrief, lastDebriefLap, requestDebrief]);

  const handleCopy = () => {
    if (!debrief) return;
    navigator.clipboard.writeText(debrief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse debrief into spoken radio message and tactical bullets
  const parseDebriefContent = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const radioLines: string[] = [];
    const tacticalBullets: string[] = [];

    lines.forEach((line) => {
      if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•') || /^\d+\./.test(line)) {
        tacticalBullets.push(line.replace(/^[-*•\d.]\s*/, ''));
      } else {
        radioLines.push(line);
      }
    });

    return {
      radioText: radioLines.join(' '),
      bullets: tacticalBullets,
    };
  };

  const currentLap = latestPacket?.lap_number || 1;
  const driverName = latestPacket?.car_telemetry?.driver?.toUpperCase() || 'VERSTAPPEN';
  const compoundName = latestPacket?.tyre_metrics?.compound || currentCompound || 'MEDIUM';
  const isCliffImminent = (latestPacket?.tyre_metrics?.laps_to_cliff ?? 10) <= 2;

  const parsed = debrief ? parseDebriefContent(debrief) : null;

  return (
    <Card className="gap-4 p-5 bg-zinc-950/80 border-zinc-800 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative gradient glow top border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-500 opacity-80" />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-cyan-400 mt-0.5">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                Pit-Wall Chief Engineer AI Debrief
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono border-cyan-800/60 text-cyan-300 bg-cyan-950/30">
                <Sparkles className="w-2.5 h-2.5 mr-1 inline" />
                LIVE RADIO
              </Badge>
              {isCliffImminent && (
                <Badge variant="destructive" className="text-[10px] font-mono animate-pulse">
                  CLIFF ALERT
                </Badge>
              )}
            </div>
            <CardDescription className="font-mono text-xs mt-0.5 text-zinc-400">
              Real-time pit-to-car tactical telemetry synthesis &amp; race engineer strategy radio
            </CardDescription>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono">
          {/* Auto Debrief Toggle */}
          <Button
            variant={autoDebrief ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoDebrief(!autoDebrief)}
            className={`h-8 text-xs font-mono gap-1.5 ${
              autoDebrief
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${autoDebrief ? 'fill-current text-amber-300' : ''}`} />
            <span>Auto-Debrief: {autoDebrief ? 'ON' : 'OFF'}</span>
          </Button>

          {/* Manual Transmit Button */}
          <Button
            variant="default"
            size="sm"
            onClick={requestDebrief}
            disabled={isLoading || !latestPacket}
            className="h-8 text-xs font-mono gap-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium shadow-md shadow-cyan-950/50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Synthesizing...' : `Transmit Debrief (Lap ${currentLap})`}</span>
          </Button>
        </div>
      </div>

      {/* Main Debrief Display */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="p-6 rounded-lg bg-zinc-900/40 border border-zinc-800/80 flex flex-col items-center justify-center gap-3 py-10">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 h-6 bg-cyan-400 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>
            <div className="text-center font-mono">
              <p className="text-sm font-medium text-zinc-200">
                Synthesizing Pit-Wall Radio Transmission...
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Analyzing Lap {currentLap} true pace vs noise parameters
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-800/50 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-mono font-semibold text-rose-300">Radio Transmission Error</p>
                <p className="text-xs font-mono text-rose-400 mt-0.5">{error}</p>
                <p className="text-[11px] font-mono text-zinc-400 mt-1.5">
                  Verify configured Gemini API keys in your <code className="text-zinc-300">.env</code> file.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={requestDebrief}
              className="h-7 text-xs font-mono border-rose-800/60 text-rose-300 hover:bg-rose-950"
            >
              Retry
            </Button>
          </div>
        ) : debrief && parsed ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Radio Transmission Speech Bubble (7 cols) */}
            <div className="lg:col-span-7 p-4 rounded-lg bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/90 flex flex-col justify-between relative shadow-inner">
              <div>
                {/* Radio Channel Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-zinc-200 tracking-wider">
                      PIT-TO-CAR RADIO • CHANNEL 1
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-400">
                      GIANPIERO LAMBIASE → #{latestPacket?.car_telemetry?.car_number || 1} {driverName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-100"
                      title="Copy radio transcript"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                    </Button>
                  </div>
                </div>

                {/* Voice Radio Transcript */}
                <div className="relative pl-3 border-l-2 border-cyan-500/70 py-1 font-mono text-sm leading-relaxed text-zinc-200">
                  <p className="italic text-zinc-100 font-sans sm:font-mono">
                    "{parsed.radioText || debrief}"
                  </p>
                </div>
              </div>

              {/* Radio Footer Meta */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-2.5 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-400">
                <div className="flex items-center gap-3">
                  <span>Stint Lap: <strong className="text-zinc-200">{latestPacket?.stint_lap || currentLap}</strong></span>
                  <span className="text-zinc-700">•</span>
                  <span>Compound: <strong className="text-amber-400">{compoundName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Volume2 className="w-3 h-3" />
                  <span>TRANSMITTED LAP {lastDebriefLap || currentLap}</span>
                </div>
              </div>
            </div>

            {/* Right: Tactical Directives & Box Window (5 cols) */}
            <div className="lg:col-span-5 p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-2.5">
                  <span className="text-xs font-mono font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    Pit-Wall Tactical Directives
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono text-amber-300 border-amber-800/50 bg-amber-950/20">
                    STRATEGY ADVISORY
                  </Badge>
                </div>

                {parsed.bullets.length > 0 ? (
                  <ul className="flex flex-col gap-2 mt-2">
                    {parsed.bullets.map((bullet, idx) => (
                      <li
                        key={idx}
                        className="p-2.5 rounded bg-zinc-950/70 border border-zinc-800/80 text-xs font-mono text-zinc-300 flex items-start gap-2 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 rounded bg-zinc-950/50 border border-zinc-800/70 text-xs font-mono text-zinc-400">
                    <p className="text-zinc-300">
                      • Monitor tyre surface delta across high-speed loading apexes.
                    </p>
                    <p className="mt-1 text-zinc-400">
                      • True degradation indicates window open for undercut advantage.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  Telemetry Source:
                </span>
                <span className="text-zinc-300 font-medium">True Isolated Pace Engine</span>
              </div>
            </div>
          </div>
        ) : (
          /* Initial Standby State */
          <div className="p-6 rounded-lg bg-zinc-900/30 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-mono font-semibold text-zinc-200">
                  Pit-Wall Radio Standby • Ready for Lap {currentLap} Synthesis
                </p>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">
                  Click 'Transmit Debrief' or toggle 'Auto-Debrief' to generate live AI driver communications and pit strategy.
                </p>
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={requestDebrief}
              disabled={!latestPacket}
              className="h-8 text-xs font-mono gap-1.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transmit Debrief (Lap {currentLap})</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
