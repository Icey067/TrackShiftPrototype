import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  CrossoverAnalyticsData,
  CrossoverIntersection,
  UndercutWindowAnalysis,
} from '../../types';
import {
  Zap,
  ArrowRightLeft,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  Crosshair,
  Sparkles,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const CrossoverMatrix: React.FC = () => {
  const [data, setData] = useState<CrossoverAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStrategy, setSelectedStrategy] = useState<'1-STOP' | '2-STOP'>('1-STOP');

  useEffect(() => {
    fetch('/api/analytics/crossover')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!data) return { labels: [], datasets: [] };

    const labels = data.curves.map((c) => `Lap ${c.lap}`);
    const softPace = data.curves.map((c) => c.SOFT);
    const mediumPace = data.curves.map((c) => c.MEDIUM);
    const hardPace = data.curves.map((c) => c.HARD);

    return {
      labels,
      datasets: [
        {
          label: 'P-Zero Red (Soft C4)',
          data: softPace,
          borderColor: '#ef4444', // red-500
          backgroundColor: 'rgba(239, 68, 68, 0.04)',
          borderWidth: 2.5,
          pointRadius: 2.5,
          pointBackgroundColor: '#ef4444',
          tension: 0.35,
        },
        {
          label: 'P-Zero Yellow (Medium C3)',
          data: mediumPace,
          borderColor: '#eab308', // yellow-500
          backgroundColor: 'rgba(234, 179, 8, 0.04)',
          borderWidth: 2.5,
          pointRadius: 2.5,
          pointBackgroundColor: '#eab308',
          tension: 0.35,
        },
        {
          label: 'P-Zero White (Hard C2)',
          data: hardPace,
          borderColor: '#f8fafc', // white / slate-100
          backgroundColor: 'rgba(248, 250, 252, 0.04)',
          borderWidth: 2.5,
          pointRadius: 2.5,
          pointBackgroundColor: '#f8fafc',
          tension: 0.35,
        },
      ],
    };
  }, [data]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { family: 'monospace', size: 11 },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#e2e8f0',
        bodyColor: '#cbd5e1',
        titleFont: { family: 'monospace', weight: 'bold' },
        bodyFont: { family: 'monospace' },
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.parsed.y.toFixed(3)}s`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#64748b', font: { family: 'monospace', size: 10 } },
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: {
          color: '#64748b',
          font: { family: 'monospace', size: 10 },
          callback: (value) => `${Number(value).toFixed(2)}s`,
        },
      },
    },
  };

  if (loading || !data) {
    return (
      <div className="glass-card rounded-lg p-12 text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-mono text-slate-400">Computing Multi-Compound Crossover Matrices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-lg p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                STRATEGY &amp; CROSSOVER ENGINE
              </span>
              <span className="text-xs text-slate-400 font-mono">• Multi-Compound Degradation Dynamics</span>
            </div>
            <h2 className="text-lg lg:text-xl font-bold text-white font-mono tracking-tight">
              Tyre Compound Crossover Points &amp; Undercut Optimizer
            </h2>
            <p className="text-xs text-slate-400">
              Calculates the exact lap where tyre wear negates compound grip advantage, determining optimal pit stop windows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Strategy Profile:</span>
            <div className="flex bg-slate-900 rounded p-1 border border-slate-800">
              <button
                onClick={() => setSelectedStrategy('1-STOP')}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition ${
                  selectedStrategy === '1-STOP'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1-Stop (M-H)
              </button>
              <button
                onClick={() => setSelectedStrategy('2-STOP')}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition ${
                  selectedStrategy === '2-STOP'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2-Stop (S-M-H)
              </button>
            </div>
          </div>
        </div>

        {/* Crossover Highlights Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-2">
          {data.intersections.map((inter, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 rounded-lg p-3.5 border border-slate-800 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-0.5">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white uppercase">
                      {inter.compounds[0]} ➔ {inter.compounds[1]} Crossover
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                      LAP {inter.crossover_lap}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{inter.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-slate-200 block">
                  {inter.crossover_pace_s.toFixed(2)}s
                </span>
                <span className="text-[10px] font-mono text-emerald-400 block font-semibold">
                  {inter.tactical_advantage.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Multi-Compound Degradation Curves Chart */}
      <div className="glass-card rounded-lg p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Simultaneous Compound Degradation Curves
            </h3>
            <p className="text-xs text-slate-400">
              Pace trajectories across 40 consecutive laps (Silverstone GP Calibration)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Pit Loss Delta:</span>
            <span className="text-cyan-400 font-bold">{data.circuit_pit_loss_sec}s</span>
          </div>
        </div>

        <div className="h-80 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-red-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Soft C4 (Fastest, High Deg)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Medium C3 (Balanced)
            </span>
            <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-100" /> Hard C2 (High Longevity)
            </span>
          </div>

          <span className="text-cyan-400 font-bold text-[11px]">
            Dynamic Cross Intersections at Lap 14 &amp; Lap 24
          </span>
        </div>
      </div>

      {/* Strategy Undercut & Overcut Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Undercut Power Window */}
        <div className="glass-card rounded-lg p-4 lg:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Undercut Tactical Window
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              HIGH PROBABILITY
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Pitting 1 lap before the soft-to-medium crossover provides fresh tyre grip to jump the leading car during their in-lap.
          </p>

          <div className="space-y-3">
            {data.undercut_windows.map((win, idx) => (
              <div key={idx} className="bg-slate-900/60 p-3 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-white block">
                    Trigger Box on Lap {win.pit_lap}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Switch to Fresh {win.recommended_out_compound} Compound
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400 block">
                    +{win.delta_advantage_3_laps_s}s Delta Gain
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {win.track_position_retention_prob_pct}% Pass Chance
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimal Stint: Box Lap 13 for Mediums gives +1.84s gain over 3 laps.</span>
          </div>
        </div>

        {/* Strategy Roadmap Breakdown */}
        <div className="glass-card rounded-lg p-4 lg:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Race Distance Stint Comparison
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-400 border border-slate-700">
              52 LAPS TOTAL
            </span>
          </div>

          <div className="space-y-3">
            {/* Strategy 1 */}
            <div className={`p-3 rounded border transition-all ${
              selectedStrategy === '1-STOP'
                ? 'bg-slate-900 border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                : 'bg-slate-900/40 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-white">
                  Strategy A (1-Stop: Medium ➔ Hard)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">1:34:12.450</span>
              </div>
              <div className="flex items-center gap-1 h-3 rounded overflow-hidden bg-slate-950 p-0.5 border border-slate-800">
                <div className="h-full bg-yellow-500 rounded-sm" style={{ width: '46%' }} title="Medium: 24 Laps" />
                <div className="h-full bg-slate-200 rounded-sm" style={{ width: '54%' }} title="Hard: 28 Laps" />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                <span>Stint 1: Medium (L1-24)</span>
                <span>Stint 2: Hard (L25-52)</span>
              </div>
            </div>

            {/* Strategy 2 */}
            <div className={`p-3 rounded border transition-all ${
              selectedStrategy === '2-STOP'
                ? 'bg-slate-900 border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                : 'bg-slate-900/40 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-white">
                  Strategy B (2-Stop: Soft ➔ Medium ➔ Hard)
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">+3.820s (Traffic Risk)</span>
              </div>
              <div className="flex items-center gap-1 h-3 rounded overflow-hidden bg-slate-950 p-0.5 border border-slate-800">
                <div className="h-full bg-red-500 rounded-sm" style={{ width: '27%' }} title="Soft: 14 Laps" />
                <div className="h-full bg-yellow-500 rounded-sm" style={{ width: '38%' }} title="Medium: 20 Laps" />
                <div className="h-full bg-slate-200 rounded-sm" style={{ width: '35%' }} title="Hard: 18 Laps" />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                <span>S1: Soft (L1-14)</span>
                <span>S2: Med (L15-34)</span>
                <span>S3: Hard (L35-52)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Optimal 1-Stop strategy minimizes pit lane transit loss (19.8s).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
