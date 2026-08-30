import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { TelemetryPacket } from '../types';
import { Wind, TrendingDown, Thermometer, Gauge } from 'lucide-react';

interface HeroStatsGridProps {
  latestPacket: TelemetryPacket | null;
}

export const HeroStatsGrid: React.FC<HeroStatsGridProps> = ({ latestPacket }) => {
  const tyre = latestPacket?.tyre_metrics;
  const noise = latestPacket?.noise_breakdown;
  const telemetry = latestPacket?.car_telemetry;

  const exhaustionPct = tyre?.exhaustion_pct ?? 18.5;
  const lapsToCliff = tyre?.laps_to_cliff ?? 14;
  const isAtCliff = tyre?.is_at_cliff ?? false;
  const inDirtyAir = noise?.in_dirty_air ?? false;
  const surfaceTemp = tyre?.surface_temp_c ?? 98.4;
  const optimumTemp = tyre?.optimum_temp_c ?? 98.0;
  const tempDelta = Number((surfaceTemp - optimumTemp).toFixed(1));
  const compoundName = tyre?.compound_name ?? 'Medium C3';
  const compoundColor = tyre?.compound_color ?? '#EAB308';

  const getCliffBadge = (laps: number) => {
    if (laps <= 1 || isAtCliff) {
      return <Badge variant="destructive">CLIFF BREACHED</Badge>;
    }
    if (laps <= 3) {
      return <Badge variant="warning">CRITICAL</Badge>;
    }
    return <Badge variant="outline">OPTIMAL</Badge>;
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Tyre Life Exhaustion */}
      <Card className="gap-3 p-5">
        <div className="flex items-center justify-between">
          <CardDescription className="font-mono text-zinc-400">Tyre Life Exhaustion</CardDescription>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: compoundColor }}
            />
            <span className="text-xs font-mono font-medium text-zinc-300">
              {compoundName.split(' ')[0]}
            </span>
          </div>
        </div>

        <div>
          <CardTitle className="text-2xl lg:text-3xl font-mono tabular-nums">
            {exhaustionPct.toFixed(1)}%
          </CardTitle>
          <div className="mt-2.5">
            <Progress
              value={exhaustionPct}
              className="h-1.5 bg-zinc-800"
              indicatorClassName={
                exhaustionPct > 75
                  ? 'bg-rose-500'
                  : exhaustionPct > 50
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }
            />
          </div>
        </div>

        <CardFooter className="p-0 text-zinc-400 font-mono text-[11px] justify-between">
          <span>Stint Lap {latestPacket?.stint_lap || 1}</span>
          <span className="text-zinc-300 font-medium">
            {latestPacket?.true_tyre_degradation ? `+${latestPacket.true_tyre_degradation}s wear` : '+0.00s'}
          </span>
        </CardFooter>
      </Card>

      {/* 2. Thermal Cliff Proximity */}
      <Card className="gap-3 p-5">
        <div className="flex items-center justify-between">
          <CardDescription className="font-mono text-zinc-400">Thermal Cliff Proximity</CardDescription>
          {getCliffBadge(lapsToCliff)}
        </div>

        <div>
          <CardTitle className="text-2xl lg:text-3xl font-mono tabular-nums text-zinc-100 flex items-baseline gap-1.5">
            {lapsToCliff} <span className="text-xs font-normal text-zinc-400">LAPS</span>
          </CardTitle>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Non-linear inflection point
          </p>
        </div>

        <CardFooter className="p-0 text-zinc-400 font-mono text-[11px] justify-between">
          <span>Inflection Boundary</span>
          <span className={isAtCliff ? 'text-rose-400 font-semibold' : 'text-zinc-300'}>
            {isAtCliff ? 'Cliff Reached' : `~${lapsToCliff} laps remaining`}
          </span>
        </CardFooter>
      </Card>

      {/* 3. Dynamic Wake Penalty */}
      <Card className="gap-3 p-5">
        <div className="flex items-center justify-between">
          <CardDescription className="font-mono text-zinc-400">Dynamic Wake (DWP)</CardDescription>
          <Badge variant={inDirtyAir ? 'warning' : 'outline'}>
            {inDirtyAir ? 'DIRTY AIR' : 'CLEAN AIR'}
          </Badge>
        </div>

        <div>
          <CardTitle className="text-2xl lg:text-3xl font-mono tabular-nums text-zinc-100">
            {inDirtyAir ? `+${noise?.dynamic_wake_penalty_s || 0.0}s` : '0.000s'}
          </CardTitle>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Gap: {telemetry?.gap_to_ahead_sec || 4.6}s {inDirtyAir ? '(-' + (noise?.aero_downforce_loss_pct || 0) + '% aero)' : '(Free Air)'}
          </p>
        </div>

        <CardFooter className="p-0 text-zinc-400 font-mono text-[11px] justify-between">
          <span>Downforce Loss</span>
          <span className={inDirtyAir ? 'text-amber-400 font-medium' : 'text-zinc-300'}>
            {inDirtyAir ? 'Compensating' : 'Laminar Flow'}
          </span>
        </CardFooter>
      </Card>

      {/* 4. Surface Temp */}
      <Card className="gap-3 p-5">
        <div className="flex items-center justify-between">
          <CardDescription className="font-mono text-zinc-400">Surface Temp (AVG)</CardDescription>
          <Badge
            variant={
              Math.abs(tempDelta) <= 3.0
                ? 'success'
                : tempDelta > 3.0
                ? 'destructive'
                : 'outline'
            }
          >
            {Math.abs(tempDelta) <= 3.0 ? 'IN WINDOW' : tempDelta > 3.0 ? 'OVERHEATING' : 'COLD'}
          </Badge>
        </div>

        <div>
          <CardTitle className="text-2xl lg:text-3xl font-mono tabular-nums text-zinc-100">
            {surfaceTemp.toFixed(1)}°C
          </CardTitle>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Optimum: {optimumTemp}°C ({tempDelta >= 0 ? `+${tempDelta}` : tempDelta}°C delta)
          </p>
        </div>

        <CardFooter className="p-0 text-zinc-400 font-mono text-[11px] justify-between">
          <span>Operating Band</span>
          <span className="text-zinc-300 font-medium">94°C – 102°C</span>
        </CardFooter>
      </Card>
    </div>
  );
};
