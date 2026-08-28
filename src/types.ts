/**
 * Type Definitions for AI Motorsport Intelligence Pit-Wall Telemetry Platform
 */

export type CompoundCode = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';

export interface CompoundProfile {
  name: string;
  code: CompoundCode;
  color_hex: string;
  base_grip_offset: number;
  thermal_cliff_lap: number;
  wear_rate_linear: number;
  wear_rate_exp: number;
  optimum_temp_c: number;
  temp_sensitivity: number;
}

export interface NoiseBreakdown {
  fuel_correction_s: number;
  track_evolution_s: number;
  dynamic_wake_penalty_s: number;
  in_dirty_air: boolean;
  aero_downforce_loss_pct: number;
}

export interface TyreMetrics {
  compound: CompoundCode;
  compound_name: string;
  compound_color: string;
  exhaustion_pct: number;
  laps_to_cliff: number;
  is_at_cliff: boolean;
  surface_temp_c: number;
  optimum_temp_c: number;
  tyre_wear_seconds?: number;
}

export interface SectorTimes {
  s1: number;
  s2: number;
  s3: number;
  speed_trap_kmh: number;
}

export interface CarTelemetryInfo {
  driver: string;
  driver_name: string;
  team: string;
  car_number: number;
  circuit: string;
  fuel_remaining_kg: number;
  gap_to_ahead_sec: number;
  car_ahead: string;
  drs_active: boolean;
  track_temp_c: number;
  ambient_temp_c: number;
  flag_status: 'GREEN' | 'YELLOW' | 'VSC' | 'SAFETY_CAR' | 'RED';
}

export interface TelemetryPacket {
  lap_number: number;
  stint_lap: number;
  raw_lap_time: number;
  true_isolated_pace: number;
  delta_vs_raw: number;
  true_tyre_degradation: number;
  filtration_applied: boolean;
  is_valid_phase: boolean;
  rejection_reason: string | null;
  noise_breakdown: NoiseBreakdown;
  tyre_metrics: TyreMetrics;
  sectors: SectorTimes;
  car_telemetry: CarTelemetryInfo;
}

export interface InitialSyncPacket {
  event: 'INITIAL_SYNC';
  compounds: Record<string, CompoundProfile>;
  filtration_enabled: boolean;
  history: TelemetryPacket[];
  current_state?: {
    compound: CompoundCode;
    gap_to_ahead: number;
    fuel_remaining_kg: number;
    flag_status: string;
  };
}

export interface TelemetryUpdatePacket {
  event: 'TELEMETRY_UPDATE';
  timestamp: number;
  data: TelemetryPacket;
}

/* =========================================================================
 * POST-RACE VALIDATION & ACCURACY TYPES
 * ========================================================================= */

export interface ValidationLapPoint {
  lap: number;
  stint_lap: number;
  actual_lap_time: number;
  predicted_lap_time: number;
  raw_unfiltered_lap_time: number;
  residual_error_s: number; // actual - predicted
  abs_error_s: number;
  predicted_deg: number;
  actual_deg: number;
  is_cliff_point?: boolean;
}

export interface ValidationMetricsSummary {
  mae_seconds: number;
  rmse_seconds: number;
  r2_score: number;
  predicted_cliff_lap: number;
  actual_cliff_lap: number;
  cliff_delta_laps: number;
  max_residual_s: number;
  sample_size_laps: number;
  model_grade: 'ELITE' | 'OPTIMAL' | 'ACCEPTABLE' | 'DRIFT_DETECTED';
}

export interface ValidationStint {
  id: string;
  title: string;
  circuit: string;
  season: number;
  grand_prix: string;
  driver: string;
  driver_number: number;
  team: string;
  compound: CompoundCode;
  stint_length: number;
  start_lap: number;
  end_lap: number;
  track_temp_c: number;
  metrics: ValidationMetricsSummary;
  laps: ValidationLapPoint[];
}

/* =========================================================================
 * MULTI-COMPOUND CROSSOVER & STRATEGY TYPES
 * ========================================================================= */

export interface CompoundCurvePoint {
  lap: number;
  SOFT: number;
  MEDIUM: number;
  HARD: number;
  INTERMEDIATE?: number;
}

export interface CrossoverIntersection {
  compounds: [CompoundCode, CompoundCode];
  crossover_lap: number;
  crossover_pace_s: number;
  description: string;
  tactical_advantage: 'UNDERCUT_RECOMMENDED' | 'OVERCUT_FAVORED' | 'NEUTRAL';
}

export interface UndercutWindowAnalysis {
  pit_lap: number;
  delta_advantage_3_laps_s: number;
  track_position_retention_prob_pct: number;
  recommended_out_compound: CompoundCode;
}

export interface CrossoverAnalyticsData {
  curves: CompoundCurvePoint[];
  intersections: CrossoverIntersection[];
  undercut_windows: UndercutWindowAnalysis[];
  circuit_pit_loss_sec: number;
}

/* =========================================================================
 * REAL-WORLD DATASET & DASHBOARD NAVIGATION
 * ========================================================================= */

export type DashboardTab = 'pit-wall' | 'validation' | 'crossover';
export type TelemetryDataSource = 'SYNTHETIC_LIVE' | 'REAL_WORLD_F1';

export interface RealWorldSessionInfo {
  id: string;
  name: string;
  year: number;
  track: string;
  driver: string;
  compound: CompoundCode;
  laps_total: number;
  condition: string;
}
