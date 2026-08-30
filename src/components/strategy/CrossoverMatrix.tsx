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
import { CrossoverAnalyticsData } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowRightLeft, Zap, GitBranch } from 'lucide-react';

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

    const labels = data.curves.map((c) => `L${c.lap}`);
    const softPace = data.curves.map((c) => c.SOFT);
    const mediumPace = data.curves.map((c) => c.MEDIUM);
    const hardPace = data.curves.map((c) => c.HARD);

    return {
      labels,
      datasets: [
        {
          label: 'Soft C4 (Fastest, High Deg)',
          data: softPace,
          borderColor: '#ef4444', // red-500
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.3,
        },
        {
          label: 'Medium C3 (Balanced)',
          data: mediumPace,
          borderColor: '#eab308', // yellow-500
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.3,
        },
        {
          label: 'Hard C2 (Endurance)',
          data: hardPace,
          borderColor: '#f4f4f5', // zinc-100
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.3,
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
          color: '#a1a1aa',
          font: { family: 'monospace', size: 11 },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: '#09090b',
        borderColor: '#27272a',
        borderWidth: 1,
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        titleFont: { family: 'monospace', weight: 'bold' },
        bodyFont: { family: 'monospace' },
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.parsed.y.toFixed(3)}s`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#18181b' },
        ticks: { color: '#71717a', font: { family: 'monospace', size: 10 } },
      },
      y: {
        grid: { color: '#18181b' },
        ticks: {
          color: '#71717a',
          font: { family: 'monospace', size: 10 },
          callback: (value) => `${Number(value).toFixed(2)}s`,
        },
      },
    },
  };

  if (loading || !data) {
    return (
      <Card className="p-12 text-center">
        <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono text-zinc-400">Computing Multi-Compound Crossover Matrices...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="gap-4 p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px]">
                CROSSOVER &amp; TACTICAL WINDOW
              </Badge>
              <span className="text-xs text-zinc-400 font-mono">• Multi-Compound Dynamics</span>
            </div>
            <CardTitle className="text-base font-semibold">Tyre Compound Crossover Points</CardTitle>
            <CardDescription className="font-mono mt-0.5">
              Identifies the exact lap where wear offsets compound grip advantage
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <Button
              variant={selectedStrategy === '1-STOP' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedStrategy('1-STOP')}
              className="h-7 text-xs font-mono"
            >
              1-Stop (M-H)
            </Button>
            <Button
              variant={selectedStrategy === '2-STOP' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedStrategy('2-STOP')}
              className="h-7 text-xs font-mono"
            >
              2-Stop (S-M-H)
            </Button>
          </div>
        </div>

        {/* Crossover Highlights Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {data.intersections.map((inter, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/60 rounded-lg p-3.5 border border-zinc-800 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 mt-0.5">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-100 uppercase">
                      {inter.compounds[0]} ➔ {inter.compounds[1]}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      LAP {inter.crossover_lap}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono mt-1">{inter.description}</p>
                </div>
              </div>

              <div className="text-right shrink-0 font-mono">
                <span className="text-xs font-bold text-zinc-200 block">{inter.crossover_pace_s.toFixed(2)}s</span>
                <span className="text-[10px] text-emerald-400 font-medium block">{inter.tactical_advantage.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Degradation Curves Chart */}
      <Card className="gap-3 p-5">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <CardTitle className="text-sm font-semibold">Simultaneous Compound Degradation Curves</CardTitle>
            <CardDescription className="font-mono mt-0.5">40-lap Silverstone GP benchmark</CardDescription>
          </div>
          <span className="text-xs font-mono text-zinc-400">Pit Loss: <strong className="text-zinc-200">{data.circuit_pit_loss_sec}s</strong></span>
        </div>

        <div className="h-72 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </Card>

      {/* Strategy & Undercut Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Undercut Window */}
        <Card className="gap-3 p-5">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <CardTitle className="text-sm font-semibold">Undercut Tactical Window</CardTitle>
            <Badge variant="success" className="text-[10px]">HIGH PROBABILITY</Badge>
          </div>

          <div className="space-y-2.5">
            {data.undercut_windows.map((win, idx) => (
              <div key={idx} className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 flex items-center justify-between font-mono">
                <div>
                  <span className="text-xs font-bold text-zinc-100 block">Box Lap {win.pit_lap}</span>
                  <span className="text-[10px] text-zinc-400">Switch to {win.recommended_out_compound}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 block">+{win.delta_advantage_3_laps_s}s Delta</span>
                  <span className="text-[10px] text-zinc-400">{win.track_position_retention_prob_pct}% Retention</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Strategy Breakdown */}
        <Card className="gap-3 p-5">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <CardTitle className="text-sm font-semibold">Race Distance Stint Comparison</CardTitle>
            <Badge variant="outline" className="text-[10px]">52 LAPS TOTAL</Badge>
          </div>

          <div className="space-y-2.5">
            <div className={`p-3 rounded-lg border font-mono ${selectedStrategy === '1-STOP' ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/40 border-zinc-800'}`}>
              <div className="flex items-center justify-between mb-1 text-xs font-bold">
                <span className="text-zinc-100">Strategy A (1-Stop: Medium ➔ Hard)</span>
                <span className="text-emerald-400">1:34:12.450</span>
              </div>
              <div className="flex items-center gap-1 h-2.5 rounded-full overflow-hidden bg-zinc-950 p-0.5 border border-zinc-800">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '46%' }} />
                <div className="h-full bg-zinc-200 rounded-full" style={{ width: '54%' }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                <span>Stint 1: Medium (L1-24)</span>
                <span>Stint 2: Hard (L25-52)</span>
              </div>
            </div>

            <div className={`p-3 rounded-lg border font-mono ${selectedStrategy === '2-STOP' ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/40 border-zinc-800'}`}>
              <div className="flex items-center justify-between mb-1 text-xs font-bold">
                <span className="text-zinc-100">Strategy B (2-Stop: Soft ➔ Medium ➔ Hard)</span>
                <span className="text-amber-400">+3.820s</span>
              </div>
              <div className="flex items-center gap-1 h-2.5 rounded-full overflow-hidden bg-zinc-950 p-0.5 border border-zinc-800">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '27%' }} />
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '38%' }} />
                <div className="h-full bg-zinc-200 rounded-full" style={{ width: '35%' }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                <span>S1: Soft (L1-14)</span>
                <span>S2: Med (L15-34)</span>
                <span>S3: Hard (L35-52)</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
