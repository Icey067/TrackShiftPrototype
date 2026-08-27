/**
 * AI Motorsport Intelligence - Full-Stack Express & WebSocket Server
 * Attaches WebSocket server on port 3000 at /ws/telemetry with live F1 physics simulation.
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// Tyre compound specifications matching Pirelli F1 ranges
export const COMPOUND_DATABASE: Record<string, {
  name: string;
  code: string;
  color_hex: string;
  base_grip_offset: number;
  thermal_cliff_lap: number;
  wear_rate_linear: number;
  wear_rate_exp: number;
  optimum_temp_c: number;
  temp_sensitivity: number;
}> = {
  SOFT: {
    name: 'P-Zero Red (Soft C4)',
    code: 'SOFT',
    color_hex: '#EF4444',
    base_grip_offset: -0.65,
    thermal_cliff_lap: 16,
    wear_rate_linear: 0.075,
    wear_rate_exp: 0.0042,
    optimum_temp_c: 102.5,
    temp_sensitivity: 0.015,
  },
  MEDIUM: {
    name: 'P-Zero Yellow (Medium C3)',
    code: 'MEDIUM',
    color_hex: '#EAB308',
    base_grip_offset: 0.00,
    thermal_cliff_lap: 26,
    wear_rate_linear: 0.048,
    wear_rate_exp: 0.0018,
    optimum_temp_c: 98.0,
    temp_sensitivity: 0.011,
  },
  HARD: {
    name: 'P-Zero White (Hard C2)',
    code: 'HARD',
    color_hex: '#F8FAFC',
    base_grip_offset: 0.55,
    thermal_cliff_lap: 38,
    wear_rate_linear: 0.028,
    wear_rate_exp: 0.0007,
    optimum_temp_c: 94.0,
    temp_sensitivity: 0.008,
  },
  INTERMEDIATE: {
    name: 'Cinturato Green (Intermediate)',
    code: 'INTERMEDIATE',
    color_hex: '#22C55E',
    base_grip_offset: 4.20,
    thermal_cliff_lap: 22,
    wear_rate_linear: 0.090,
    wear_rate_exp: 0.0050,
    optimum_temp_c: 75.0,
    temp_sensitivity: 0.025,
  },
  WET: {
    name: 'Cinturato Blue (Full Wet)',
    code: 'WET',
    color_hex: '#3B82F6',
    base_grip_offset: 8.50,
    thermal_cliff_lap: 30,
    wear_rate_linear: 0.065,
    wear_rate_exp: 0.0030,
    optimum_temp_c: 65.0,
    temp_sensitivity: 0.030,
  },
};

// Global Telemetry State
class ServerTelemetryEngine {
  currentLap = 1;
  stintLap = 1;
  compound = 'MEDIUM';
  fuelKg = 105.0;
  gapToAhead = 4.6;
  carAhead = 'HAM';
  flagStatus = 'GREEN';
  applyFiltration = true;
  historyLaps: any[] = [];
  speedMultiplier = 1.0;

  FUEL_CORRECTION_PER_LAP = 0.042;
  TRACK_EVO_MAX_DELTA = 1.35;
  TRACK_EVO_DECAY_K = 0.048;
  DIRTY_AIR_THRESHOLD_SEC = 2.0;
  DWP_AERO_SCALING = 0.48;
  DWP_THERMAL_BASE = 0.18;
  BASE_BENCHMARK_LAP_TIME = 87.45; // 1:27.450 Silverstone baseline

  resetStint(compoundName = 'MEDIUM') {
    this.stintLap = 1;
    this.compound = compoundName in COMPOUND_DATABASE ? compoundName : 'MEDIUM';
    this.fuelKg = 105.0;
    this.historyLaps = [];
  }

  calculateFuelCorrection(stintLap: number): number {
    return (stintLap - 1) * this.FUEL_CORRECTION_PER_LAP;
  }

  calculateTrackEvolution(sessionLap: number): number {
    return this.TRACK_EVO_MAX_DELTA * (1.0 - Math.exp(-this.TRACK_EVO_DECAY_K * sessionLap));
  }

  calculateDynamicWakePenalty(gap: number) {
    if (gap >= this.DIRTY_AIR_THRESHOLD_SEC || gap <= 0) {
      return {
        in_dirty_air: false,
        penalty_seconds: 0.0,
        aero_loss_pct: 0.0,
        thermal_scrub_penalty: 0.0,
      };
    }
    const proximity = Math.max(0, Math.min(2.0, this.DIRTY_AIR_THRESHOLD_SEC - gap));
    const aeroLoss = this.DWP_AERO_SCALING * Math.pow(proximity, 1.35);
    const thermalLoss = this.DWP_THERMAL_BASE * (proximity / 2.0);
    const totalDwp = aeroLoss + thermalLoss;
    const downforceLossPct = Math.min(36.0, Math.max(4.0, (proximity / 2.0) * 32.0));

    return {
      in_dirty_air: true,
      penalty_seconds: Number(totalDwp.toFixed(3)),
      aero_loss_pct: Number(downforceLossPct.toFixed(1)),
      thermal_scrub_penalty: Number(thermalLoss.toFixed(3)),
    };
  }

  evaluateLap(rawLapTime: number, stintLap: number, sessionLap: number, isOutLap: boolean, isInLap: boolean) {
    const profile = COMPOUND_DATABASE[this.compound] || COMPOUND_DATABASE.MEDIUM;
    const isInvalidPhase = ['VSC', 'SAFETY_CAR', 'RED'].includes(this.flagStatus) || isOutLap || isInLap;

    let rejectionReason: string | null = null;
    if (isOutLap) rejectionReason = 'OUT_LAP';
    else if (isInLap) rejectionReason = 'IN_LAP';
    else if (this.flagStatus !== 'GREEN') rejectionReason = `FLAG_${this.flagStatus}`;

    const fuelCorrection = this.calculateFuelCorrection(stintLap);
    const trackEvolution = this.calculateTrackEvolution(sessionLap);
    const dwpData = this.calculateDynamicWakePenalty(this.gapToAhead);

    let truePace = rawLapTime;
    if (this.applyFiltration && !isInvalidPhase) {
      truePace = rawLapTime + fuelCorrection + trackEvolution - dwpData.penalty_seconds;
    }

    const idealBasePace = this.BASE_BENCHMARK_LAP_TIME + profile.base_grip_offset;
    const trueTyreDegradation = Math.max(0, truePace - idealBasePace);

    const cliffLap = profile.thermal_cliff_lap;
    const lapsToCliff = Math.max(0, cliffLap - stintLap);
    const exhaustionPct = Math.min(100, (stintLap / (cliffLap + 4)) * 100);

    const dirtyAirSpike = dwpData.in_dirty_air ? 4.8 : 0.0;
    const wearTempRise = stintLap * 0.45;
    const fluctuation = (Math.random() - 0.5) * 1.6;
    const surfaceTemp = Number((profile.optimum_temp_c + wearTempRise + dirtyAirSpike + fluctuation).toFixed(1));

    return {
      lap_number: sessionLap,
      stint_lap: stintLap,
      raw_lap_time: Number(rawLapTime.toFixed(3)),
      true_isolated_pace: Number(truePace.toFixed(3)),
      delta_vs_raw: Number((truePace - rawLapTime).toFixed(3)),
      true_tyre_degradation: Number(trueTyreDegradation.toFixed(3)),
      filtration_applied: this.applyFiltration,
      is_valid_phase: !isInvalidPhase,
      rejection_reason: rejectionReason,
      noise_breakdown: {
        fuel_correction_s: Number(fuelCorrection.toFixed(3)),
        track_evolution_s: Number(trackEvolution.toFixed(3)),
        dynamic_wake_penalty_s: dwpData.penalty_seconds,
        in_dirty_air: dwpData.in_dirty_air,
        aero_downforce_loss_pct: dwpData.aero_loss_pct,
      },
      tyre_metrics: {
        compound: profile.code,
        compound_name: profile.name,
        compound_color: profile.color_hex,
        exhaustion_pct: Number(exhaustionPct.toFixed(1)),
        laps_to_cliff: lapsToCliff,
        is_at_cliff: stintLap >= cliffLap,
        surface_temp_c: surfaceTemp,
        optimum_temp_c: profile.optimum_temp_c,
      },
    };
  }

  generateNextLap() {
    const profile = COMPOUND_DATABASE[this.compound] || COMPOUND_DATABASE.MEDIUM;
    const basePace = this.BASE_BENCHMARK_LAP_TIME + profile.base_grip_offset;

    // Intrinsic tyre wear
    const linearDeg = profile.wear_rate_linear * this.stintLap;
    let expDeg = 0;
    if (this.stintLap > profile.thermal_cliff_lap) {
      expDeg = profile.wear_rate_exp * Math.pow(this.stintLap - profile.thermal_cliff_lap, 2.2);
    }
    const intrinsicDeg = linearDeg + expDeg;

    const fuelAdvantage = (this.stintLap - 1) * this.FUEL_CORRECTION_PER_LAP;
    const trackAdvantage = this.calculateTrackEvolution(this.currentLap);
    const dwp = this.calculateDynamicWakePenalty(this.gapToAhead);
    const driverNoise = (Math.random() - 0.5) * 0.16;

    const rawLapTime = basePace + intrinsicDeg - fuelAdvantage - trackAdvantage + dwp.penalty_seconds + driverNoise;

    const evaluated = this.evaluateLap(
      rawLapTime,
      this.stintLap,
      this.currentLap,
      this.stintLap === 1,
      false
    );

    const s1 = Number((rawLapTime * 0.312 + (Math.random() - 0.5) * 0.08).toFixed(3));
    const s2 = Number((rawLapTime * 0.428 + (Math.random() - 0.5) * 0.1).toFixed(3));
    const s3 = Number((rawLapTime - s1 - s2).toFixed(3));

    const packet = {
      ...evaluated,
      sectors: {
        s1,
        s2,
        s3,
        speed_trap_kmh: Number((318.5 - this.fuelKg * 0.08 + (Math.random() - 0.5) * 3).toFixed(1)),
      },
      car_telemetry: {
        driver: 'VER',
        driver_name: 'Max Verstappen',
        team: 'Red Bull Racing',
        car_number: 1,
        circuit: 'Silverstone Circuit',
        fuel_remaining_kg: Number(this.fuelKg.toFixed(2)),
        gap_to_ahead_sec: Number(this.gapToAhead.toFixed(2)),
        car_ahead: this.carAhead,
        drs_active: this.gapToAhead < 1.0,
        track_temp_c: 41.5,
        ambient_temp_c: 24.8,
        flag_status: this.flagStatus,
      },
    };

    // Advance counters
    this.currentLap += 1;
    this.stintLap += 1;
    this.fuelKg = Math.max(2.0, this.fuelKg - 1.72);

    this.historyLaps.push(packet);
    if (this.historyLaps.length > 50) {
      this.historyLaps.shift();
    }

    // Traffic fluctuation
    if (Math.random() < 0.25) {
      if (this.gapToAhead < 2.0) {
        this.gapToAhead = Number((this.gapToAhead + Math.random() * 1.5 + 0.2).toFixed(2));
      } else {
        this.gapToAhead = Number(Math.max(0.6, this.gapToAhead + (Math.random() - 0.6) * 1.8).toFixed(2));
      }
    }

    return packet;
  }
}

const telemetryEngine = new ServerTelemetryEngine();

// Setup WebSocket Server attached to HTTP Server
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  try {
    const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/ws/telemetry') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } catch (err) {
    socket.destroy();
  }
});

wss.on('connection', (ws: WebSocket) => {
  // Initial sync upon client connection
  ws.send(
    JSON.stringify({
      event: 'INITIAL_SYNC',
      compounds: COMPOUND_DATABASE,
      filtration_enabled: telemetryEngine.applyFiltration,
      history: telemetryEngine.historyLaps.slice(-25),
      current_state: {
        compound: telemetryEngine.compound,
        gap_to_ahead: telemetryEngine.gapToAhead,
        fuel_remaining_kg: telemetryEngine.fuelKg,
        flag_status: telemetryEngine.flagStatus,
      },
    })
  );

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      handleEngineAction(data);
    } catch (e) {
      // Ignore malformed WS messages
    }
  });
});

function handleEngineAction(data: any) {
  if (!data || !data.action) return;
  switch (data.action) {
    case 'TOGGLE_FILTRATION':
      telemetryEngine.applyFiltration =
        typeof data.enabled === 'boolean' ? data.enabled : !telemetryEngine.applyFiltration;
      break;
    case 'SET_COMPOUND':
      if (data.compound in COMPOUND_DATABASE) {
        telemetryEngine.resetStint(data.compound);
      }
      break;
    case 'TRIGGER_TRAFFIC':
      telemetryEngine.gapToAhead = Number(data.gap || 0.85);
      break;
    case 'CLEAR_TRAFFIC':
      telemetryEngine.gapToAhead = Number(data.gap || 4.8);
      break;
    case 'SET_FLAG':
      telemetryEngine.flagStatus = data.flag || 'GREEN';
      break;
    case 'RESET_STINT':
      telemetryEngine.resetStint(telemetryEngine.compound);
      break;
    case 'SIMULATE_LAP': {
      const immediateLap = telemetryEngine.generateNextLap();
      broadcastTelemetry(immediateLap);
      return immediateLap;
    }
    default:
      break;
  }
  return null;
}

function broadcastTelemetry(lapData: any) {
  const payload = JSON.stringify({
    event: 'TELEMETRY_UPDATE',
    timestamp: Date.now(),
    data: lapData,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Continuous 1-second Telemetry Tick Loop
setInterval(() => {
  const lapData = telemetryEngine.generateNextLap();
  broadcastTelemetry(lapData);
}, 1200);

// Pre-seed telemetry engine with 12 laps on startup so dashboard is immediately rich
for (let i = 0; i < 12; i++) {
  telemetryEngine.generateNextLap();
}

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Motorsport Intelligence Telemetry Service',
    laps_streamed: telemetryEngine.currentLap,
    active_compound: telemetryEngine.compound,
    filtration: telemetryEngine.applyFiltration,
  });
});

app.get('/api/state', (req, res) => {
  res.json({
    current_lap: telemetryEngine.currentLap,
    stint_lap: telemetryEngine.stintLap,
    compound: telemetryEngine.compound,
    compounds: COMPOUND_DATABASE,
    filtration: telemetryEngine.applyFiltration,
    fuel_kg: telemetryEngine.fuelKg,
    gap_ahead: telemetryEngine.gapToAhead,
    flag_status: telemetryEngine.flagStatus,
    history: telemetryEngine.historyLaps.slice(-25),
  });
});

app.get('/api/telemetry/poll', (req, res) => {
  const latest = telemetryEngine.historyLaps[telemetryEngine.historyLaps.length - 1] || null;
  res.json({
    latest,
    compounds: COMPOUND_DATABASE,
    current_state: {
      compound: telemetryEngine.compound,
      gap_to_ahead: telemetryEngine.gapToAhead,
      fuel_remaining_kg: telemetryEngine.fuelKg,
      flag_status: telemetryEngine.flagStatus,
      filtration_enabled: telemetryEngine.applyFiltration,
      stint_lap: telemetryEngine.stintLap,
      current_lap: telemetryEngine.currentLap,
    },
    history_sample: telemetryEngine.historyLaps.slice(-25),
  });
});

app.post('/api/telemetry/action', (req, res) => {
  const result = handleEngineAction(req.body);
  res.json({
    success: true,
    result,
    current_state: {
      compound: telemetryEngine.compound,
      gap_to_ahead: telemetryEngine.gapToAhead,
      fuel_remaining_kg: telemetryEngine.fuelKg,
      flag_status: telemetryEngine.flagStatus,
      filtration_enabled: telemetryEngine.applyFiltration,
    },
  });
});

app.get('/api/python-source', (req, res) => {
  try {
    const mainPy = fs.readFileSync(path.join(process.cwd(), 'backend', 'main.py'), 'utf-8');
    const statePy = fs.readFileSync(path.join(process.cwd(), 'backend', 'state_manager.py'), 'utf-8');
    res.json({
      'main.py': mainPy,
      'state_manager.py': statePy,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Motorsport Intelligence Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
