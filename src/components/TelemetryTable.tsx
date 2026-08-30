import React from 'react';
import { TelemetryPacket } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from './ui/table';
import { Badge } from './ui/badge';

interface TelemetryTableProps {
  history: TelemetryPacket[];
}

export const TelemetryTable: React.FC<TelemetryTableProps> = ({ history }) => {
  const recentLaps = [...history].reverse().slice(0, 10);

  return (
    <Card className="gap-4 p-5">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <CardTitle className="text-base font-semibold">Live Sector Log &amp; Lap Telemetry</CardTitle>
          <CardDescription className="font-mono mt-0.5">
            Microsector timing splits and true degradation audits
          </CardDescription>
        </div>

        <Badge variant="outline" className="font-mono text-[10px]">
          LATEST {recentLaps.length} LAPS
        </Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="w-16">Lap</TableHead>
            <TableHead className="w-16">Tyre</TableHead>
            <TableHead>Raw Time</TableHead>
            <TableHead className="text-zinc-100 font-bold">True Isolated</TableHead>
            <TableHead>Δ Offset</TableHead>
            <TableHead>S1</TableHead>
            <TableHead>S2</TableHead>
            <TableHead>S3</TableHead>
            <TableHead>Speed (km/h)</TableHead>
            <TableHead className="text-right">Condition</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentLaps.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="py-8 text-center text-zinc-500 font-mono">
                Awaiting lap timing packets from race car...
              </TableCell>
            </TableRow>
          ) : (
            recentLaps.map((lap, idx) => {
              const isLatest = idx === 0;
              const noise = lap.noise_breakdown;
              const delta = Number((lap.true_isolated_pace - lap.raw_lap_time).toFixed(3));

              return (
                <TableRow
                  key={`${lap.lap_number}-${lap.stint_lap}-${idx}`}
                  className={isLatest ? 'bg-zinc-900/60 font-semibold' : ''}
                >
                  <TableCell className="font-bold text-zinc-100">
                    <div className="flex items-center gap-1.5">
                      {isLatest && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      <span>L{lap.stint_lap}</span>
                      <span className="text-[10px] text-zinc-500 font-normal">({lap.lap_number})</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                      {lap.tyre_metrics.compound.slice(0, 3)}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-zinc-400 font-mono">
                    {formatLapTime(lap.raw_lap_time)}
                  </TableCell>

                  <TableCell className="font-bold text-zinc-100 font-mono">
                    {formatLapTime(lap.true_isolated_pace)}
                  </TableCell>

                  <TableCell className="font-mono">
                    <span className={delta > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {delta > 0 ? `+${delta}` : delta}s
                    </span>
                  </TableCell>

                  <TableCell className="text-zinc-400">{lap.sectors.s1.toFixed(3)}</TableCell>
                  <TableCell className="text-zinc-400">{lap.sectors.s2.toFixed(3)}</TableCell>
                  <TableCell className="text-zinc-400">{lap.sectors.s3.toFixed(3)}</TableCell>
                  <TableCell className="text-zinc-300 font-medium">{lap.sectors.speed_trap_kmh}</TableCell>

                  <TableCell className="text-right">
                    {!lap.is_valid_phase ? (
                      <Badge variant="destructive" className="text-[10px]">
                        {lap.rejection_reason}
                      </Badge>
                    ) : noise.in_dirty_air ? (
                      <Badge variant="warning" className="text-[10px]">
                        DIRTY AIR (+{noise.dynamic_wake_penalty_s}s)
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-[10px]">
                        CLEAN
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

function formatLapTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00.000';
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, '0')}`;
}
