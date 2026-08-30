"""
=============================================================================
TrackShift - AI Motorsport Intelligence Telemetry & Ingestion Backend
=============================================================================
FastAPI server featuring:
1. FastF1 & OpenF1 Free Session Fetcher
2. Multi-Format File Upload Engine (CSV/JSON/Parquet)
3. Vectorized NumPy Noise Cancellation & True Tyre Degradation Pipeline
4. Live Playback Simulator (1x, 2x, 5x, 10x) & Instant Batch Analytics
"""

import asyncio
import io
import json
import logging
import math
import random
import time
from typing import Dict, Any, List, Optional
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from backend.physics_engine import MotorsportPhysicsEngine
    from backend.f1_fetcher import F1TelemetryFetcher
    from backend.file_parser import TelemetryFileParser
    from backend.state_manager import CarStateManager, TyreCompound, COMPOUND_DATABASE
except ImportError:
    from physics_engine import MotorsportPhysicsEngine
    from f1_fetcher import F1TelemetryFetcher
    from file_parser import TelemetryFileParser
    from state_manager import CarStateManager, TyreCompound, COMPOUND_DATABASE

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("motorsport.backend")

app = FastAPI(
    title="TrackShift AI Motorsport Intelligence Telemetry Engine",
    description="Vectorized telemetry noise cancellation, FastF1 ingestion, and live replay streaming.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Service Singletons
physics_engine = MotorsportPhysicsEngine()
f1_fetcher = F1TelemetryFetcher()
state_manager = CarStateManager()

# Global Replay & Telemetry State
class GlobalPlaybackManager:
    def __init__(self):
        self.mode = "SYNTHETIC"  # "SYNTHETIC" or "REPLAY"
        self.is_playing = True
        self.playback_speed = 1.0  # 1.0, 2.0, 5.0, 10.0
        self.current_lap_index = 0
        self.active_session_laps: List[Dict[str, Any]] = []
        self.active_session_title = "Synthetic Live Simulator"
        self.active_compound = "MEDIUM"
        self.apply_filtration = True
        self.active_connections: List[WebSocket] = []

    def set_session_for_replay(self, laps: List[Dict[str, Any]], title: str = "Loaded Session"):
        self.active_session_laps = laps
        self.active_session_title = title
        self.current_lap_index = 0
        self.mode = "REPLAY"
        self.is_playing = True
        logger.info(f"Replay mode active with {len(laps)} laps: '{title}'")

    def reset_synthetic(self):
        self.mode = "SYNTHETIC"
        self.current_lap_index = 0
        self.active_session_laps.clear()
        self.active_session_title = "Synthetic Live Simulator"
        self.is_playing = True
        state_manager.reset_stint()

    def get_next_lap_packet(self) -> Dict[str, Any]:
        if self.mode == "REPLAY" and self.active_session_laps:
            if self.current_lap_index >= len(self.active_session_laps):
                self.current_lap_index = 0  # Loop replay
            
            raw_lap = self.active_session_laps[self.current_lap_index]
            if self.is_playing:
                self.current_lap_index += 1

            # Process through physics engine
            evaluated = physics_engine.evaluate_lap(
                raw_lap_time=raw_lap["raw_lap_time"],
                stint_lap=raw_lap["stint_lap"],
                session_lap=raw_lap["lap_number"],
                gap_to_ahead=raw_lap.get("gap_to_ahead", 4.8),
                compound_code=raw_lap.get("compound", self.active_compound),
                phase_status=raw_lap.get("flag_status", "GREEN"),
                is_out_lap=raw_lap.get("is_out_lap", False),
                is_in_lap=raw_lap.get("is_in_lap", False),
                apply_filtration=self.apply_filtration
            )
            evaluated["sectors"] = raw_lap.get("sectors", {
                "s1": round(raw_lap["raw_lap_time"] * 0.312, 3),
                "s2": round(raw_lap["raw_lap_time"] * 0.428, 3),
                "s3": round(raw_lap["raw_lap_time"] * 0.260, 3),
                "speed_trap_kmh": 318.5
            })
            evaluated["car_telemetry"] = raw_lap.get("car_telemetry", {
                "driver": raw_lap.get("driver", "NOR"),
                "driver_name": raw_lap.get("driver_name", "Lando Norris"),
                "team": raw_lap.get("team", "McLaren F1 Team"),
                "car_number": int(raw_lap.get("driver_number", 4)),
                "circuit": raw_lap.get("circuit", "Silverstone Circuit"),
                "fuel_remaining_kg": round(max(2.0, 105.0 - (raw_lap["stint_lap"] - 1) * 1.72), 2),
                "gap_to_ahead_sec": raw_lap.get("gap_to_ahead", 4.8),
                "car_ahead": "VER",
                "drs_active": raw_lap.get("gap_to_ahead", 4.8) < 1.0,
                "track_temp_c": raw_lap.get("track_temp_c", 41.5),
                "ambient_temp_c": raw_lap.get("ambient_temp_c", 24.8),
                "flag_status": raw_lap.get("flag_status", "GREEN")
            })
            evaluated["playback"] = {
                "mode": "REPLAY",
                "current_index": self.current_lap_index,
                "total_laps": len(self.active_session_laps),
                "speed": self.playback_speed,
                "is_playing": self.is_playing,
                "session_title": self.active_session_title
            }
            return evaluated
        else:
            # Synthetic generation
            car = state_manager.get_state()
            prof = COMPOUND_DATABASE.get(TyreCompound(self.active_compound), COMPOUND_DATABASE[TyreCompound.MEDIUM])
            base_pace = physics_engine.BASE_BENCHMARK_LAP_TIME + prof.base_grip_offset

            # Physics wear
            wear_lin = prof.wear_rate_linear * car.stint_lap
            wear_exp = prof.wear_rate_exp * ((car.stint_lap - prof.thermal_cliff_lap) ** 2.2) if car.stint_lap > prof.thermal_cliff_lap else 0.0
            fuel_gain = (car.stint_lap - 1) * physics_engine.FUEL_CORRECTION_PER_LAP
            track_gain = physics_engine.calculate_track_evolution(car.current_lap)
            dwp = physics_engine.calculate_dynamic_wake_penalty(car.gap_to_ahead)

            raw_time = base_pace + wear_lin + wear_exp - fuel_gain - track_gain + dwp["penalty_seconds"] + random.uniform(-0.08, 0.08)

            evaluated = physics_engine.evaluate_lap(
                raw_lap_time=raw_time,
                stint_lap=car.stint_lap,
                session_lap=car.current_lap,
                gap_to_ahead=car.gap_to_ahead,
                compound_code=prof.code,
                base_grip_offset=prof.base_grip_offset,
                thermal_cliff_lap=prof.thermal_cliff_lap,
                phase_status=car.safety_car_status,
                is_out_lap=(car.stint_lap == 1),
                is_in_lap=False,
                apply_filtration=self.apply_filtration
            )

            s1 = round(raw_time * 0.312 + random.uniform(-0.04, 0.04), 3)
            s2 = round(raw_time * 0.428 + random.uniform(-0.05, 0.05), 3)
            s3 = round(raw_time - s1 - s2, 3)

            evaluated["sectors"] = {
                "s1": s1, "s2": s2, "s3": s3,
                "speed_trap_kmh": round(318.5 - (car.fuel_load_kg * 0.08) + random.uniform(-1.5, 2.0), 1)
            }
            evaluated["car_telemetry"] = {
                "driver": car.driver_code,
                "driver_name": car.driver_name,
                "team": car.team,
                "car_number": car.car_number,
                "circuit": car.circuit_name,
                "fuel_remaining_kg": round(car.fuel_load_kg, 2),
                "gap_to_ahead_sec": round(car.gap_to_ahead, 2),
                "car_ahead": car.car_ahead_driver,
                "drs_active": car.gap_to_ahead < 1.0,
                "track_temp_c": car.track_temp_c,
                "ambient_temp_c": car.ambient_temp_c,
                "flag_status": car.safety_car_status
            }
            evaluated["playback"] = {
                "mode": "SYNTHETIC",
                "current_index": car.current_lap,
                "total_laps": 52,
                "speed": self.playback_speed,
                "is_playing": self.is_playing,
                "session_title": self.active_session_title
            }

            state_manager.update_lap(evaluated)
            return evaluated

playback_manager = GlobalPlaybackManager()

# ---------------------------------------------------------------------------
# REST Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "TrackShift Telemetry Intelligence Backend",
        "mode": playback_manager.mode,
        "active_session": playback_manager.active_session_title
    }

@app.get("/api/f1/catalog")
def get_f1_catalog():
    """Returns available years, Grand Prix events, sessions, and drivers."""
    return f1_fetcher.get_catalog()

@app.get("/api/f1/fetch")
def fetch_f1_session(
    year: int = Query(2024, description="Championship Year"),
    grand_prix: str = Query("Silverstone", description="Grand Prix Name"),
    session: str = Query("Race", description="Session Type"),
    driver: str = Query("NOR", description="Driver Code")
):
    """Fetches real F1 telemetry data via FastF1 / OpenF1."""
    try:
        session_data = f1_fetcher.fetch_session(
            year=year,
            grand_prix=grand_prix,
            session_type=session,
            driver_code=driver
        )
        return session_data
    except Exception as e:
        logger.error(f"Error fetching session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload/parse")
async def upload_telemetry_file(file: UploadFile = File(...)):
    """Receives and parses custom CSV, JSON, or Parquet files."""
    try:
        content = await file.read()
        parsed = TelemetryFileParser.parse_file(content, file.filename)
        return parsed
    except Exception as e:
        logger.error(f"File upload error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

@app.post("/api/telemetry/analyze-batch")
def analyze_batch(payload: Dict[str, Any]):
    """
    Instantly computes full noise-cancellation curves, thermal cliff point,
    and statistical regression metrics for an entire session.
    """
    raw_laps = payload.get("laps", [])
    compound = payload.get("compound", "MEDIUM")
    base_offset = float(payload.get("base_grip_offset", 0.0))
    expected_cliff = payload.get("expected_cliff_lap")

    result = physics_engine.process_stint_batch(
        raw_laps=raw_laps,
        compound_code=compound,
        base_grip_offset=base_offset,
        expected_cliff_lap=expected_cliff
    )
    return result

@app.post("/api/telemetry/load-replay")
def load_session_for_replay(payload: Dict[str, Any]):
    """Loads a session into the live replay stream."""
    laps = payload.get("laps", [])
    title = payload.get("title", "Loaded Session")
    if not laps:
        raise HTTPException(status_code=400, detail="No laps provided for replay.")
    
    playback_manager.set_session_for_replay(laps, title)
    return {
        "success": True,
        "mode": "REPLAY",
        "total_laps": len(laps),
        "title": title
    }

@app.post("/api/telemetry/playback-control")
def control_playback(payload: Dict[str, Any]):
    """Controls replay playback state (play, pause, speed, seek)."""
    action = payload.get("action")
    if action == "PLAY":
        playback_manager.is_playing = True
    elif action == "PAUSE":
        playback_manager.is_playing = False
    elif action == "SET_SPEED":
        playback_manager.playback_speed = float(payload.get("speed", 1.0))
    elif action == "SEEK":
        lap_idx = int(payload.get("lap_index", 0))
        playback_manager.current_lap_index = max(0, min(lap_idx, len(playback_manager.active_session_laps) - 1))
    elif action == "RESET_SYNTHETIC":
        playback_manager.reset_synthetic()

    return {
        "success": True,
        "is_playing": playback_manager.is_playing,
        "speed": playback_manager.playback_speed,
        "current_index": playback_manager.current_lap_index,
        "mode": playback_manager.mode
    }

# ---------------------------------------------------------------------------
# Telemetry WebSocket Stream
# ---------------------------------------------------------------------------
@app.websocket("/ws/telemetry")
async def telemetry_ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    playback_manager.active_connections.append(websocket)
    logger.info(f"WebSocket client connected. Active: {len(playback_manager.active_connections)}")

    # Handshake sync
    sync_packet = {
        "event": "INITIAL_SYNC",
        "compounds": {k.value: COMPOUND_DATABASE[k].__dict__ for k in TyreCompound},
        "filtration_enabled": playback_manager.apply_filtration,
        "history": state_manager.state.history_laps,
        "current_state": {
            "compound": playback_manager.active_compound,
            "gap_to_ahead": state_manager.state.gap_to_ahead,
            "fuel_remaining_kg": state_manager.state.fuel_load_kg,
            "flag_status": state_manager.state.safety_car_status
        }
    }
    await websocket.send_text(json.dumps(sync_packet))

    async def receive_actions():
        try:
            while True:
                msg = await websocket.receive_text()
                data = json.loads(msg)
                action = data.get("action")
                if action == "TOGGLE_FILTRATION":
                    playback_manager.apply_filtration = not playback_manager.apply_filtration
                elif action == "SET_COMPOUND":
                    playback_manager.active_compound = data.get("compound", "MEDIUM")
                elif action == "SET_SPEED":
                    playback_manager.playback_speed = float(data.get("speed", 1.0))
                elif action == "PLAY":
                    playback_manager.is_playing = True
                elif action == "PAUSE":
                    playback_manager.is_playing = False
                elif action == "RESET_STINT":
                    playback_manager.reset_synthetic()
        except WebSocketDisconnect:
            pass
        except Exception as e:
            logger.error(f"WS command error: {e}")

    command_task = asyncio.create_task(receive_actions())

    try:
        while True:
            lap_pkt = playback_manager.get_next_lap_packet()
            payload = {
                "event": "TELEMETRY_UPDATE",
                "timestamp": time.time(),
                "data": lap_pkt
            }
            await websocket.send_text(json.dumps(payload))
            
            # Dynamic tick speed
            interval = 1.0 / max(0.2, playback_manager.playback_speed)
            await asyncio.sleep(interval)

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected.")
    except Exception as e:
        logger.error(f"WebSocket loop error: {e}")
    finally:
        command_task.cancel()
        if websocket in playback_manager.active_connections:
            playback_manager.active_connections.remove(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
