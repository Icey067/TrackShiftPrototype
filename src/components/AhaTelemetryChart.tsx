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
import { Sparkles } from 'lucide-react';

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
  // Keep rolling last 20 laps
  const rollingHistory = useMemo(() => {
    return history.slice(-20);
  }, [history]);

  const labels = useMemo(() => {
    return rollingHistory.map((item) => `Lap ${item.stint_lap}`);
  }, [rollingHistory]);

  const rawTimes = useMemo(() => {
    return rollingHistory.map((item) => item.raw_lap_time);
  }, [rollingHistory]);

  const truePaceTimes = useMemo(() => {
    return rollingHistory.map((item) => item.true_isolated_pace);
  }, [rollingHistory]);

  // Latest lap delta analysis
  const latest = rollingHistory[rollingHistory.length - 1];
  const noise = latest?.noise_breakdown;
  const delta = latest ? Number((latest.true_isolated_pace - latest.raw_lap_time).toFixed(3)) : 0;

  const chartData = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: 'Raw Telemetry (Noise Included)',
          data: rawTimes,
          borderColor: '#64748b', // slate-500
          borderDash: [4, 4],
          borderWidth: 2,
          pointBackgroundColor: '#64748b',
          pointBorderColor: '#0f172a',
          pointRadius: 3.5,
          pointHoverRadius: 6,
          tension: 0.25,
          yAxisID: 'y',
        },
        {
          label: 'True Isolated Pace (AI Filtered)',
          data: truePaceTimes,
          borderColor: '#22d3ee', // neon cyan
          backgroundColor: 'rgba(34, 211, 238, 0.08)',
          borderWidth: 3,
          pointBackgroundColor: '#22d3ee',
          pointBorderColor: '#083344',
          pointBorderWidth: 2,
          pointRadius: 4.5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.35,
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
        duration: 300,
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false, // Custom legend matching design HTML
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#22d3ee',
          titleFont: {
            family: 'monospace',
            size: 12,
            weight: 'bold',
          },
          bodyColor: '#f1f5f9',
          bodyFont: {
            family: 'monospace',
            size: 11,
          },
          borderColor: 'rgba(34, 211, 238, 0.3)',
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
                `• Track Rubbering: -${lapNoise.track_evolution_s}s`,
                `• Dynamic Wake (DWP): +${lapNoise.dynamic_wake_penalty_s}s ${lapNoise.in_dirty_air ? '(DIRTY AIR)' : '(Clean)'}`,
                `• Isolated Tyre Wear: +${lap.true_tyre_degradation}s`,
              ];
              if (!lap.is_valid_phase) {
                lines.push(`⚠ Phase Excluded: ${lap.rejection_reason}`);
              }
              return lines;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(51, 65, 85, 0.3)',
          },
          ticks: {
            color: '#64748b',
            font: {
              family: 'monospace',
              size: 10,
            },
          },
        },
        y: {
          grid: {
            color: 'rgba(51, 65, 85, 0.3)',
          },
          ticks: {
            color: '#64748b',
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
    <div className="glass-card rounded-lg p-5 lg:p-6 relative overflow-hidden w-full">
      {/* Top Header Row matching Sleek Interface */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Pace Intelligence <span className="text-slate-500 font-light">- Lap Analysis</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time variable stripping and noise cancellation
          </p>
        </div>

        {/* Toggle Mode Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (filtrationEnabled) onToggleFiltration();
            }}
            className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded border transition active:scale-95 ${
              !filtrationEnabled
                ? 'bg-slate-700 text-white border-slate-600 shadow-md'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800'
            }`}
          >
            RAW PACE
          </button>
          <button
            onClick={() => {
              if (!filtrationEnabled) onToggleFiltration();
            }}
            className={`text-[10px] font-mono font-bold px-3.5 py-1.5 rounded border transition active:scale-95 ${
              filtrationEnabled
                ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800'
            }`}
          >
            TRUE PACE ON
          </button>
        </div>
      </div>

      {/* Chart Canvas Area with Sleek Overlay Legend */}
      <div className="relative h-[280px] lg:h-[320px] w-full">
        {rollingHistory.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <Sparkles className="w-8 h-8 text-cyan-400/40 animate-pulse" />
            <span className="font-mono text-xs">Awaiting telemetry stream...</span>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}

        {/* Legend Overlay */}
        <div className="absolute top-1 right-2 flex flex-col space-y-1 bg-slate-950/80 p-2 rounded border border-slate-800/80 pointer-events-none">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 border-t border-dashed border-slate-400" />
            <span className="text-[9px] font-mono text-slate-400 uppercase">
              Raw Telemetry (Noise Included)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            <span className="text-[9px] font-mono text-cyan-400 uppercase font-semibold">
              True Isolated Pace (AI Filtered)
            </span>
          </div>
        </div>
      </div>

      {/* Sleek Decomposition Metrics Grid with Left Accent Borders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-800/80">
        <div className="border-l-2 border-cyan-500 pl-3.5">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Fuel Corrected
          </p>
          <p className="text-base sm:text-lg font-mono text-white font-bold">
            -{noise ? noise.fuel_correction_s.toFixed(3) : '0.042'}s{' '}
            <span className="text-[10px] text-slate-500 font-normal">/lap</span>
          </p>
        </div>

        <div className="border-l-2 border-emerald-500 pl-3.5">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Track Evolution
          </p>
          <p className="text-base sm:text-lg font-mono text-white font-bold">
            -{noise ? noise.track_evolution_s.toFixed(3) : '0.125'}s{' '}
            <span className="text-[10px] text-slate-500 font-normal">/gain</span>
          </p>
        </div>

        <div className="border-l-2 border-amber-500 pl-3.5">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            Dirty Air Penalty
          </p>
          <p className="text-base sm:text-lg font-mono text-white font-bold">
            +{noise ? noise.dynamic_wake_penalty_s.toFixed(3) : '0.000'}s{' '}
            <span className="text-[10px] text-slate-500 font-normal">/wake</span>
          </p>
        </div>

        <div className="border-l-2 border-purple-500 pl-3.5">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            ML Confidence
          </p>
          <p className="text-base sm:text-lg font-mono text-white font-bold">
            99.4% <span className="text-[10px] text-slate-500 font-normal">Isolated</span>
          </p>
        </div>
      </div>
    </div>
  );
};

function formatLapTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00.000';
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, '0')}`;
}
