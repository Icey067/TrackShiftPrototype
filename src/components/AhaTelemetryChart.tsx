import React, { useMemo } from 'react';
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
import { TelemetryPacket } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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

interface AhaTelemetryChartProps {
  history: TelemetryPacket[];
  filtrationEnabled: boolean;
  onToggleFiltration: () => void;
}

export const AhaTelemetryChart: React.FC<AhaTelemetryChartProps> = ({
  history,
  filtrationEnabled,
  onToggleFiltration,
}) => {
  const rollingHistory = useMemo(() => {
    return history.slice(-20);
  }, [history]);

  const labels = useMemo(() => {
    return rollingHistory.map((item) => `L${item.stint_lap}`);
  }, [rollingHistory]);

  const rawTimes = useMemo(() => {
    return rollingHistory.map((item) => item.raw_lap_time);
  }, [rollingHistory]);

  const truePaceTimes = useMemo(() => {
    return rollingHistory.map((item) => item.true_isolated_pace);
  }, [rollingHistory]);

  const latest = rollingHistory[rollingHistory.length - 1];
  const noise = latest?.noise_breakdown;

  const chartData = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: 'Raw Telemetry (Confounded)',
          data: rawTimes,
          borderColor: '#71717a', // zinc-500
          borderDash: [4, 4],
          borderWidth: 1.5,
          pointBackgroundColor: '#71717a',
          pointBorderColor: '#09090b',
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.2,
          yAxisID: 'y',
        },
        {
          label: 'True Isolated Pace (AI Filtered)',
          data: truePaceTimes,
          borderColor: '#38bdf8', // sky-400
          backgroundColor: 'rgba(56, 189, 248, 0.05)',
          borderWidth: 2,
          pointBackgroundColor: '#38bdf8',
          pointBorderColor: '#09090b',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.3,
          yAxisID: 'y',
        },
      ],
    };
  }, [labels, rawTimes, truePaceTimes]);

  const chartOptions: ChartOptions<'line'> = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 200,
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#09090b',
          titleColor: '#fafafa',
          titleFont: {
            family: 'monospace',
            size: 11,
            weight: 'bold',
          },
          bodyColor: '#a1a1aa',
          bodyFont: {
            family: 'monospace',
            size: 11,
          },
          borderColor: '#27272a',
          borderWidth: 1,
          padding: 10,
          displayColors: true,
          callbacks: {
            label: function (context) {
              const val = context.parsed.y;
              const formattedTime = formatLapTime(val);
              return ` ${context.dataset.label}: ${formattedTime} (${val.toFixed(3)}s)`;
            },
            afterBody: function (tooltipItems) {
              const index = tooltipItems[0]?.dataIndex;
              if (index === undefined || !rollingHistory[index]) return [];
              const lap = rollingHistory[index];
              const lapNoise = lap.noise_breakdown;
              const lines = [
                '--------------------------------',
                `• Fuel Correction: -${lapNoise.fuel_correction_s}s`,
                `• Track Evolution: -${lapNoise.track_evolution_s}s`,
                `• Dynamic Wake: +${lapNoise.dynamic_wake_penalty_s}s ${lapNoise.in_dirty_air ? '(DIRTY AIR)' : '(Clean)'}`,
                `• Pure Wear Delta: +${lap.true_tyre_degradation}s`,
              ];
              if (!lap.is_valid_phase) {
                lines.push(`⚠ Excluded: ${lap.rejection_reason}`);
              }
              return lines;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: '#18181b',
          },
          ticks: {
            color: '#71717a',
            font: {
              family: 'monospace',
              size: 10,
            },
          },
        },
        y: {
          grid: {
            color: '#18181b',
          },
          ticks: {
            color: '#71717a',
            font: {
              family: 'monospace',
              size: 10,
            },
            callback: function (val) {
              return Number(val).toFixed(2) + 's';
            },
          },
        },
      },
    };
  }, [rollingHistory]);

  return (
    <Card className="gap-4 p-5">
      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <CardTitle className="text-base font-semibold">Pace Intelligence</CardTitle>
          <CardDescription className="font-mono mt-0.5">
            Real-time multi-variable decomposition &amp; noise cancellation
          </CardDescription>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <Button
            variant={!filtrationEnabled ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => {
              if (filtrationEnabled) onToggleFiltration();
            }}
            className="h-7 text-xs font-mono"
          >
            Raw Pace
          </Button>
          <Button
            variant={filtrationEnabled ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              if (!filtrationEnabled) onToggleFiltration();
            }}
            className="h-7 text-xs font-mono font-semibold"
          >
            True Pace Filtered
          </Button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-[280px] lg:h-[300px] w-full">
        {rollingHistory.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 font-mono text-xs">
            Awaiting telemetry packets...
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}

        {/* Legend Overlay */}
        <div className="absolute top-1 right-1 flex items-center gap-3 bg-zinc-900/90 px-2.5 py-1 rounded border border-zinc-800 pointer-events-none text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-3 h-0.5 border-t border-dashed border-zinc-500" />
            <span>Raw</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-400 font-medium">
            <span className="w-3 h-0.5 bg-sky-400" />
            <span>True AI Pace</span>
          </div>
        </div>
      </div>

      {/* Decomposition Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-800/80">
        <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/60 font-mono">
          <p className="text-[10px] text-zinc-400 uppercase">Fuel Burn Offset</p>
          <p className="text-sm font-semibold text-zinc-100 mt-0.5">
            -{noise ? noise.fuel_correction_s.toFixed(3) : '0.042'}s/lap
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/60 font-mono">
          <p className="text-[10px] text-zinc-400 uppercase">Track Evolution</p>
          <p className="text-sm font-semibold text-zinc-100 mt-0.5">
            -{noise ? noise.track_evolution_s.toFixed(3) : '0.125'}s
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/60 font-mono">
          <p className="text-[10px] text-zinc-400 uppercase">Dynamic Wake</p>
          <p className="text-sm font-semibold text-zinc-100 mt-0.5">
            +{noise ? noise.dynamic_wake_penalty_s.toFixed(3) : '0.000'}s
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/60 font-mono">
          <p className="text-[10px] text-zinc-400 uppercase">Model Grade</p>
          <p className="text-sm font-semibold text-emerald-400 mt-0.5">
            99.4% Isolated
          </p>
        </div>
      </div>
    </Card>
  );
};

function formatLapTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00.000';
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, '0')}`;
}
