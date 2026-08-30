import React, { useState, useEffect } from 'react';
import { FastF1Catalog, FastF1Driver, IngestedSessionData } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, Play, Zap, Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface FastF1SelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForReplay: (session: IngestedSessionData) => void;
  onSelectForBatchAnalysis: (session: IngestedSessionData) => void;
}

export const FastF1SelectorModal: React.FC<FastF1SelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectForReplay,
  onSelectForBatchAnalysis,
}) => {
  const [catalog, setCatalog] = useState<FastF1Catalog | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedGp, setSelectedGp] = useState<string>('Silverstone');
  const [selectedSession, setSelectedSession] = useState<string>('Race');
  const [selectedDriver, setSelectedDriver] = useState<string>('NOR');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/f1/catalog')
      .then((res) => res.json())
      .then((data: FastF1Catalog) => {
        setCatalog(data);
      })
      .catch(() => {
        // Fallback default catalog
        setCatalog({
          years: [2024, 2023, 2025],
          grand_prix: ['Silverstone', 'Bahrain', 'Monza', 'Spa', 'Monaco', 'Suzuka', 'Austin'],
          sessions: ['Race', 'FP2', 'FP1', 'Qualifying', 'Sprint'],
          drivers: [
            { code: 'NOR', name: 'Lando Norris', number: 4, team: 'McLaren F1 Team' },
            { code: 'VER', name: 'Max Verstappen', number: 1, team: 'Oracle Red Bull Racing' },
            { code: 'HAM', name: 'Lewis Hamilton', number: 44, team: 'Mercedes-AMG PETRONAS' },
            { code: 'LEC', name: 'Charles Leclerc', number: 16, team: 'Scuderia Ferrari' },
            { code: 'PIA', name: 'Oscar Piastri', number: 81, team: 'McLaren F1 Team' },
            { code: 'RUS', name: 'George Russell', number: 63, team: 'Mercedes-AMG PETRONAS' },
          ],
          circuit_benchmarks: {},
        });
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFetch = async (mode: 'REPLAY' | 'BATCH') => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/f1/fetch?year=${selectedYear}&grand_prix=${encodeURIComponent(selectedGp)}&session=${encodeURIComponent(selectedSession)}&driver=${selectedDriver}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.statusText}`);
      }
      const data: IngestedSessionData = await res.json();
      
      if (mode === 'REPLAY') {
        onSelectForReplay(data);
      } else {
        onSelectForBatchAnalysis(data);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch session telemetry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-6 flex flex-col gap-5 text-zinc-100 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                FREE INGESTION ENGINE
              </Badge>
              <span className="text-xs text-zinc-500 font-mono">FastF1 &amp; OpenF1 API</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
              Live F1 Session Telemetry Fetcher
            </h2>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              Query real Grand Prix telemetry sessions (No paid API keys required)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Query Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          {/* Year */}
          <div>
            <label className="block text-zinc-400 text-[11px] mb-1 uppercase font-semibold">
              Season Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-600 cursor-pointer"
            >
              {catalog?.years.map((y) => (
                <option key={y} value={y}>
                  {y} FIA Formula One World Championship
                </option>
              ))}
            </select>
          </div>

          {/* Grand Prix */}
          <div>
            <label className="block text-zinc-400 text-[11px] mb-1 uppercase font-semibold">
              Grand Prix Circuit
            </label>
            <select
              value={selectedGp}
              onChange={(e) => setSelectedGp(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-600 cursor-pointer"
            >
              {catalog?.grand_prix.map((gp) => (
                <option key={gp} value={gp}>
                  {gp} Grand Prix
                </option>
              ))}
            </select>
          </div>

          {/* Session */}
          <div>
            <label className="block text-zinc-400 text-[11px] mb-1 uppercase font-semibold">
              Session Type
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-600 cursor-pointer"
            >
              {catalog?.sessions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Driver */}
          <div>
            <label className="block text-zinc-400 text-[11px] mb-1 uppercase font-semibold">
              Driver &amp; Car Number
            </label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-600 cursor-pointer"
            >
              {catalog?.drivers.map((d) => (
                <option key={d.code} value={d.code}>
                  #{d.number} {d.name} ({d.team})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Summary Card */}
        <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-zinc-300">
              Target: <strong className="text-zinc-100">{selectedYear} {selectedGp} {selectedSession}</strong> • <strong className="text-amber-400">{selectedDriver}</strong>
            </span>
          </div>
          <span className="text-[11px] text-zinc-500">Disk Cached</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto text-xs font-mono border-zinc-800 text-zinc-400"
          >
            Cancel
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => handleFetch('BATCH')}
            className="w-full sm:w-auto text-xs font-mono gap-1.5 font-semibold text-zinc-200"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
            <span>Instant Batch Analytics</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            disabled={loading}
            onClick={() => handleFetch('REPLAY')}
            className="w-full sm:w-auto text-xs font-mono gap-1.5 font-semibold bg-zinc-100 text-zinc-950 hover:bg-white"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Stream Live Replay</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
