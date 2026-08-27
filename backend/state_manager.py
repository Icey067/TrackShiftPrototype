"""
State Manager Module - AI Motorsport Intelligence
Maintains live car state, tyre models, telemetry history, and Redis pub/sub bridges.
"""

from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import Dict, Any, List, Optional
import time
import logging

logger = logging.getLogger("motorsport.state")

class TyreCompound(str, Enum):
    SOFT = "SOFT"
    MEDIUM = "MEDIUM"
    HARD = "HARD"
    INTERMEDIATE = "INTERMEDIATE"
    WET = "WET"

@dataclass
class CompoundProfile:
    name: str
    code: str
    color_hex: str
    base_grip_offset: float  # Base delta in seconds vs Medium benchmark
    thermal_cliff_lap: int   # Expected lap where degradation becomes exponential
    wear_rate_linear: float  # Linear degradation coeff (s/lap)
    wear_rate_exp: float     # Non-linear thermal degradation coeff
    optimum_temp_c: float    # Peak grip surface temperature
    temp_sensitivity: float  # Grip loss per degree C outside window

COMPOUND_DATABASE: Dict[TyreCompound, CompoundProfile] = {
    TyreCompound.SOFT: CompoundProfile(
        name="P-Zero Red (Soft C4)",
        code="SOFT",
        color_hex="#EF4444",
        base_grip_offset=-0.65,
        thermal_cliff_lap=16,
        wear_rate_linear=0.075,
        wear_rate_exp=0.0042,
        optimum_temp_c=102.5,
        temp_sensitivity=0.015
    ),
    TyreCompound.MEDIUM: CompoundProfile(
        name="P-Zero Yellow (Medium C3)",
        code="MEDIUM",
        color_hex="#EAB308",
        base_grip_offset=0.00,
        thermal_cliff_lap=26,
        wear_rate_linear=0.048,
        wear_rate_exp=0.0018,
        optimum_temp_c=98.0,
        temp_sensitivity=0.011
    ),
    TyreCompound.HARD: CompoundProfile(
        name="P-Zero White (Hard C2)",
        code="HARD",
        color_hex="#F8FAFC",
        base_grip_offset=0.55,
        thermal_cliff_lap=38,
        wear_rate_linear=0.028,
        wear_rate_exp=0.0007,
        optimum_temp_c=94.0,
        temp_sensitivity=0.008
    ),
    TyreCompound.INTERMEDIATE: CompoundProfile(
        name="Cinturato Green (Intermediate)",
        code="INTERMEDIATE",
        color_hex="#22C55E",
        base_grip_offset=4.20,
        thermal_cliff_lap=22,
        wear_rate_linear=0.090,
        wear_rate_exp=0.0050,
        optimum_temp_c=75.0,
        temp_sensitivity=0.025
    ),
    TyreCompound.WET: CompoundProfile(
        name="Cinturato Blue (Full Wet)",
        code="WET",
        color_hex="#3B82F6",
        base_grip_offset=8.50,
        thermal_cliff_lap=30,
        wear_rate_linear=0.065,
        wear_rate_exp=0.0030,
        optimum_temp_c=65.0,
        temp_sensitivity=0.030
    ),
}

@dataclass
class CarTelemetryState:
    car_number: int = 1
    driver_code: str = "VER"
    driver_name: str = "Max Verstappen"
    team: str = "Oracle Red Bull Racing"
    circuit_name: str = "Silverstone Circuit"
    current_lap: int = 1
    stint_lap: int = 1
    compound: TyreCompound = TyreCompound.MEDIUM
    
    # Fuel Dynamics (110kg max starting fuel, ~1.72kg per lap consumed at Silverstone)
    fuel_load_kg: float = 105.0
    initial_fuel_kg: float = 110.0
    fuel_burn_rate_kg: float = 1.72
    
    # Live Environmental / Track conditions
    track_temp_c: float = 41.5
    ambient_temp_c: float = 24.8
    humidity_pct: float = 48.0
    track_evolution_progress: float = 0.35  # Session rubbering progression [0.0 - 1.0]
    
    # Traffic & Proximity
    gap_to_ahead: float = 4.8  # Seconds to car in front
    car_ahead_driver: Optional[str] = "HAM"
    drs_available: bool = False
    
    # Phase & Flags
    safety_car_status: str = "GREEN"  # "GREEN", "YELLOW", "VSC", "SAFETY_CAR", "RED"
    is_in_lap: bool = False
    is_out_lap: bool = False
    
    # Tyre Status
    tyre_surface_temp_fl: float = 98.2
    tyre_surface_temp_fr: float = 101.4
    tyre_surface_temp_rl: float = 96.8
    tyre_surface_temp_rr: float = 97.9
    tyre_wear_percentage: float = 4.2
    
    # Telemetry History Ring Buffer
    history_laps: List[Dict[str, Any]] = field(default_factory=list)

class CarStateManager:
    """
    Manages live car states, handles Redis state synchronization if configured,
    and maintains historical laps in a high-speed in-memory buffer.
    """
    def __init__(self, redis_client=None):
        self.state = CarTelemetryState()
        self.redis = redis_client
        self.max_history = 50

    def reset_stint(self, compound: TyreCompound = TyreCompound.MEDIUM, starting_fuel: float = 105.0):
        self.state.stint_lap = 1
        self.state.compound = compound
        self.state.fuel_load_kg = starting_fuel
        self.state.tyre_wear_percentage = 0.0
        self.state.is_out_lap = True
        self.state.is_in_lap = False
        self.state.history_laps.clear()
        logger.info(f"Stint reset initialized on compound {compound.value}")

    def update_lap(self, lap_data: Dict[str, Any]):
        self.state.current_lap += 1
        self.state.stint_lap += 1
        self.state.fuel_load_kg = max(2.0, self.state.fuel_load_kg - self.state.fuel_burn_rate_kg)
        
        # Keep ring buffer of recent laps
        self.state.history_laps.append(lap_data)
        if len(self.state.history_laps) > self.max_history:
            self.state.history_laps.pop(0)

        # Sync to Redis Hash if client is provided
        if self.redis:
            try:
                self.redis.hset(
                    f"car:{self.state.car_number}:state",
                    mapping={
                        "lap": self.state.current_lap,
                        "stint_lap": self.state.stint_lap,
                        "compound": self.state.compound.value,
                        "fuel_kg": round(self.state.fuel_load_kg, 2),
                        "gap_ahead": round(self.state.gap_to_ahead, 2),
                        "wear_pct": round(self.state.tyre_wear_percentage, 1),
                        "last_update": time.time()
                    }
                )
            except Exception as e:
                logger.warning(f"Redis hash sync skipped: {e}")

    def get_state(self) -> CarTelemetryState:
        return self.state

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self.state)
