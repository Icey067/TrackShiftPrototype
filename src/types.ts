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
