import React from 'react';
import { TelemetryPacket } from '../types';
import { Wind, CheckCircle2 } from 'lucide-react';

interface TelemetryTableProps {
  history: TelemetryPacket[];
}

export const TelemetryTable: React.FC<TelemetryTableProps> = ({ history }) => {
  // Show most recent laps in reverse order (newest first)
  const recentLaps = [...history].reverse().slice(0, 10);

  return (
    <div className="glass-card rounded-lg p-4 lg:p-6 w-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm lg:text-base font-bold text-white tracking-wide uppercase font-mono">
            Pit-Wall Live Lap Log &amp; Sector Telemetry
          </h3>
          <p className="text-xs text-slate-400">
            High-frequency microsector splits and true degradation isolation audits
          </p>
        </div>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          LATEST {recentLaps.length} LAPS
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider bg-slate-900/50">
              <th className="py-2.5 px-3">Lap</th>
              <th className="py-2.5 px-2">Tyre</th>
              <th className="py-2.5 px-3">Raw Time</th>
              <th className="py-2.5 px-3 text-cyan-400 font-bold">True Isolated</th>
              <th className="py-2.5 px-2">Δ Offset</th>
              <th className="py-2.5 px-2">S1</th>
              <th className="py-2.5 px-2">S2</th>
              <th className="py-2.5 px-2">S3</th>
              <th className="py-2.5 px-2">Trap (km/h)</th>
              <th className="py-2.5 px-3">Condition / Wake</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {recentLaps.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-6 text-center text-slate-500 font-mono">
                  Awaiting lap timing packets from race car...
                </td>
              </tr>
            ) : (
              recentLaps.map((lap, idx) => {
                const isLatest = idx === 0;
                const noise = lap.noise_breakdown;
                const delta = Number((lap.true_isolated_pace - lap.raw_lap_time).toFixed(3));

                return (
                  <tr
                    key={`${lap.lap_number}-${lap.stint_lap}-${idx}`}
                    className={`transition-colors hover:bg-slate-800/30 ${
                      isLatest ? 'bg-cyan-950/20 text-white font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold">
                      <div className="flex items-center gap-1.5">
                        {isLatest && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                        <span>L{lap.stint_lap}</span>
                        <span className="text-[10px] text-slate-500">({lap.lap_number})</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-2">
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border"
                        style={{
                          borderColor: `${lap.tyre_metrics.compound_color}55`,
                          backgroundColor: `${lap.tyre_metrics.compound_color}18`,
                          color: lap.tyre_metrics.compound_color,
                        }}
                      >
                        {lap.tyre_metrics.compound.slice(0, 3)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-400 font-mono">
                      {formatLapTime(lap.raw_lap_time)}
                    </td>

                    <td className="py-2.5 px-3 font-bold font-mono text-cyan-400">
                      {formatLapTime(lap.true_isolated_pace)}
                    </td>

                    <td className="py-2.5 px-2 font-mono">
                      <span className={`text-[11px] font-bold ${delta > 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                        {delta > 0 ? `+${delta}` : delta}s
                      </span>
                    </td>

                    <td className="py-2.5 px-2 text-slate-400">{lap.sectors.s1.toFixed(3)}</td>
                    <td className="py-2.5 px-2 text-slate-400">{lap.sectors.s2.toFixed(3)}</td>
                    <td className="py-2.5 px-2 text-slate-400">{lap.sectors.s3.toFixed(3)}</td>
                    <td className="py-2.5 px-2 text-purple-400 font-bold">{lap.sectors.speed_trap_kmh}</td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {!lap.is_valid_phase ? (
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-500/40 text-[9px] font-bold">
                            {lap.rejection_reason}
                          </span>
                        ) : noise.in_dirty_air ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                            <Wind className="w-2.5 h-2.5" />
                            <span>DIRTY AIR (+{noise.dynamic_wake_penalty_s}s)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>CLEAN</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
