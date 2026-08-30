import {
  TelemetryPacket,
  ValidationStint,
  CrossoverAnalyticsData,
} from '../types';

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportLivePitWallLogs(
  history: TelemetryPacket[],
  format: 'csv' | 'json' = 'csv',
  filenamePrefix = 'trackshift-pitwall-telemetry'
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  if (format === 'json') {
    const jsonStr = JSON.stringify(
      {
        exportType: 'LIVE_PIT_WALL_TELEMETRY',
        exportedAt: new Date().toISOString(),
        totalPackets: history.length,
        packets: history,
      },
      null,
      2
    );
    triggerDownload(jsonStr, `${filenamePrefix}-${timestamp}.json`, 'application/json');
    return;
  }

  // CSV Export
  const headers = [
    'Lap Number',
    'Stint Lap',
    'Raw Lap Time (s)',
    'True Isolated Pace (s)',
    'Delta vs Raw (s)',
    'True Tyre Degradation (s)',
    'Filtration Applied',
    'Valid Clean Phase',
    'Rejection Reason',
    'Fuel Correction (s)',
    'Track Evolution (s)',
    'Dirty Air Wake Penalty (s)',
    'In Dirty Air',
    'Aero Downforce Loss (%)',
    'Compound Code',
    'Compound Name',
    'Tyre Exhaustion (%)',
    'Tyre Temp (C)',
    'Optimum Temp (C)',
    'Is At Cliff',
    'Laps To Cliff',
    'Fuel Remaining (kg)',
    'Gap To Ahead (s)',
    'Car Ahead',
    'DRS Active',
    'Flag Status',
    'Sector 1 (s)',
    'Sector 2 (s)',
    'Sector 3 (s)',
    'Speed Trap (km/h)',
    'Driver',
    'Driver Name',
    'Team',
    'Circuit',
    'Car Number',
  ];

  const rows = history.map((pkt) => [
    pkt.lap_number,
    pkt.stint_lap,
    pkt.raw_lap_time !== undefined ? pkt.raw_lap_time.toFixed(3) : '',
    pkt.true_isolated_pace !== undefined ? pkt.true_isolated_pace.toFixed(3) : '',
    pkt.delta_vs_raw !== undefined ? pkt.delta_vs_raw.toFixed(3) : '',
    pkt.true_tyre_degradation !== undefined ? pkt.true_tyre_degradation.toFixed(3) : '',
    pkt.filtration_applied ? 'YES' : 'NO',
    pkt.is_valid_phase ? 'YES' : 'NO',
    pkt.rejection_reason || 'NONE',
    pkt.noise_breakdown?.fuel_correction_s !== undefined ? pkt.noise_breakdown.fuel_correction_s.toFixed(3) : '0.000',
    pkt.noise_breakdown?.track_evolution_s !== undefined ? pkt.noise_breakdown.track_evolution_s.toFixed(3) : '0.000',
    pkt.noise_breakdown?.dynamic_wake_penalty_s !== undefined ? pkt.noise_breakdown.dynamic_wake_penalty_s.toFixed(3) : '0.000',
    pkt.noise_breakdown?.in_dirty_air ? 'TRUE' : 'FALSE',
    pkt.noise_breakdown?.aero_downforce_loss_pct !== undefined ? pkt.noise_breakdown.aero_downforce_loss_pct.toFixed(1) : '0.0',
    pkt.tyre_metrics?.compound || 'UNKNOWN',
    pkt.tyre_metrics?.compound_name || 'UNKNOWN',
    pkt.tyre_metrics?.exhaustion_pct !== undefined ? pkt.tyre_metrics.exhaustion_pct.toFixed(1) : '0.0',
    pkt.tyre_metrics?.surface_temp_c !== undefined ? pkt.tyre_metrics.surface_temp_c.toFixed(1) : '0.0',
    pkt.tyre_metrics?.optimum_temp_c !== undefined ? pkt.tyre_metrics.optimum_temp_c.toFixed(1) : '0.0',
    pkt.tyre_metrics?.is_at_cliff ? 'TRUE' : 'FALSE',
    pkt.tyre_metrics?.laps_to_cliff ?? 'N/A',
    pkt.car_telemetry?.fuel_remaining_kg !== undefined ? pkt.car_telemetry.fuel_remaining_kg.toFixed(1) : '0.0',
    pkt.car_telemetry?.gap_to_ahead_sec !== undefined ? pkt.car_telemetry.gap_to_ahead_sec.toFixed(2) : '0.00',
    pkt.car_telemetry?.car_ahead || 'NONE',
    pkt.car_telemetry?.drs_active ? 'ACTIVE' : 'OFF',
    pkt.car_telemetry?.flag_status || 'GREEN',
    pkt.sectors?.s1 !== undefined ? pkt.sectors.s1.toFixed(3) : '0.000',
    pkt.sectors?.s2 !== undefined ? pkt.sectors.s2.toFixed(3) : '0.000',
    pkt.sectors?.s3 !== undefined ? pkt.sectors.s3.toFixed(3) : '0.000',
    pkt.sectors?.speed_trap_kmh !== undefined ? pkt.sectors.speed_trap_kmh.toFixed(1) : '0.0',
    pkt.car_telemetry?.driver || 'VER',
    pkt.car_telemetry?.driver_name || 'Max Verstappen',
    pkt.car_telemetry?.team || 'Red Bull Racing',
    pkt.car_telemetry?.circuit || 'Silverstone GP',
    pkt.car_telemetry?.car_number || 1,
  ]);

  const csvContent = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ].join('\n');

  triggerDownload(csvContent, `${filenamePrefix}-${timestamp}.csv`, 'text/csv');
}

export function exportValidationLogs(
  stints: ValidationStint[],
  selectedStintId?: string,
  format: 'csv' | 'json' = 'csv',
  filenamePrefix = 'trackshift-validation-benchmark'
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetStints = selectedStintId
    ? stints.filter((s) => s.id === selectedStintId)
    : stints;

  if (format === 'json') {
    const jsonStr = JSON.stringify(
      {
        exportType: 'VALIDATION_STUDIO_BENCHMARK_LOGS',
        exportedAt: new Date().toISOString(),
        totalStints: targetStints.length,
        stints: targetStints,
      },
      null,
      2
    );
    triggerDownload(jsonStr, `${filenamePrefix}-${timestamp}.json`, 'application/json');
    return;
  }

  // CSV Export
  const headers = [
    'Stint ID',
    'Grand Prix',
    'Driver',
    'Team',
    'Circuit',
    'Compound',
    'Stint Length (Laps)',
    'Model Grade',
    'MAE (s)',
    'RMSE (s)',
    'R-Squared Score',
    'Predicted Cliff Lap',
    'Actual Cliff Lap',
    'Cliff Delta (Laps)',
    'Max Residual (s)',
    'Lap Number',
    'Stint Lap',
    'Raw Unfiltered Lap Time (s)',
    'Actual Clean Lap Time (s)',
    'Predicted Lap Time (s)',
    'Residual Error (s)',
    'Absolute Error (s)',
    'Predicted Deg (s)',
    'Actual Deg (s)',
    'Is Cliff Point',
  ];

  const rows: (string | number)[][] = [];

  targetStints.forEach((stint) => {
    stint.laps.forEach((lap) => {
      rows.push([
        stint.id,
        stint.grand_prix,
        stint.driver,
        stint.team,
        stint.circuit,
        stint.compound,
        stint.stint_length,
        stint.metrics?.model_grade || 'OPTIMAL',
        stint.metrics?.mae_seconds !== undefined ? stint.metrics.mae_seconds.toFixed(4) : 'N/A',
        stint.metrics?.rmse_seconds !== undefined ? stint.metrics.rmse_seconds.toFixed(4) : 'N/A',
        stint.metrics?.r2_score !== undefined ? stint.metrics.r2_score.toFixed(4) : 'N/A',
        stint.metrics?.predicted_cliff_lap ?? 'N/A',
        stint.metrics?.actual_cliff_lap ?? 'N/A',
        stint.metrics?.cliff_delta_laps ?? 'N/A',
        stint.metrics?.max_residual_s !== undefined ? stint.metrics.max_residual_s.toFixed(3) : 'N/A',
        lap.lap,
        lap.stint_lap,
        lap.raw_unfiltered_lap_time !== undefined ? lap.raw_unfiltered_lap_time.toFixed(3) : 'N/A',
        lap.actual_lap_time !== undefined ? lap.actual_lap_time.toFixed(3) : 'N/A',
        lap.predicted_lap_time !== undefined ? lap.predicted_lap_time.toFixed(3) : 'N/A',
        lap.residual_error_s !== undefined ? lap.residual_error_s.toFixed(3) : '0.000',
        lap.abs_error_s !== undefined ? lap.abs_error_s.toFixed(3) : '0.000',
        lap.predicted_deg !== undefined ? lap.predicted_deg.toFixed(3) : '0.000',
        lap.actual_deg !== undefined ? lap.actual_deg.toFixed(3) : '0.000',
        lap.is_cliff_point ? 'YES' : 'NO',
      ]);
    });
  });

  const csvContent = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ].join('\n');

  triggerDownload(csvContent, `${filenamePrefix}-${timestamp}.csv`, 'text/csv');
}

export function exportCrossoverLogs(
  data: CrossoverAnalyticsData,
  format: 'csv' | 'json' = 'csv',
  filenamePrefix = 'trackshift-crossover-matrix'
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (format === 'json') {
    const jsonStr = JSON.stringify(
      {
        exportType: 'CROSSOVER_MATRIX_STRATEGY_LOGS',
        exportedAt: new Date().toISOString(),
        circuitPitLossSec: data.circuit_pit_loss_sec,
        intersections: data.intersections,
        undercutWindows: data.undercut_windows,
        curves: data.curves,
      },
      null,
      2
    );
    triggerDownload(jsonStr, `${filenamePrefix}-${timestamp}.json`, 'application/json');
    return;
  }

  // CSV Export
  const headers = [
    'Lap Number',
    'Soft C4 Pace (s)',
    'Medium C3 Pace (s)',
    'Hard C2 Pace (s)',
    'Intermediate Pace (s)',
    'Delta Soft vs Medium (s)',
    'Delta Medium vs Hard (s)',
    'Pit Loss (s)',
    'Primary Crossover Info',
    'Primary Tactical Advantage',
  ];

  const primaryIntersection = data.intersections?.[0];

  const rows = data.curves.map((curve) => {
    const deltaSM = (curve.SOFT - curve.MEDIUM).toFixed(3);
    const deltaMH = (curve.MEDIUM - curve.HARD).toFixed(3);
    const intermediate = curve.INTERMEDIATE !== undefined ? curve.INTERMEDIATE.toFixed(3) : 'N/A';

    return [
      curve.lap,
      curve.SOFT.toFixed(3),
      curve.MEDIUM.toFixed(3),
      curve.HARD.toFixed(3),
      intermediate,
      deltaSM,
      deltaMH,
      data.circuit_pit_loss_sec?.toFixed(1) || '21.5',
      primaryIntersection ? `Lap ${primaryIntersection.crossover_lap} (${primaryIntersection.description})` : 'N/A',
      primaryIntersection?.tactical_advantage || 'NEUTRAL',
    ];
  });

  const csvContent = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ].join('\n');

  triggerDownload(csvContent, `${filenamePrefix}-${timestamp}.csv`, 'text/csv');
}
