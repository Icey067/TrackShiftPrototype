"""
Automated unit verification for TrackShift backend mathematics & ingestion engine.
"""

import os
import unittest
import numpy as np

from physics_engine import MotorsportPhysicsEngine
from f1_fetcher import F1TelemetryFetcher
from file_parser import TelemetryFileParser


class TestTrackShiftEngine(unittest.TestCase):
    def setUp(self):
        self.physics = MotorsportPhysicsEngine()
        self.fetcher = F1TelemetryFetcher()

    def test_physics_fuel_correction(self):
        # Lap 1: 0 delta, Lap 10: 9 * 0.042 = 0.378s
        self.assertAlmostEqual(self.physics.calculate_fuel_correction(1), 0.0, places=3)
        self.assertAlmostEqual(self.physics.calculate_fuel_correction(10), 0.378, places=3)

    def test_physics_track_evolution(self):
        # Lap 1 vs Lap 50
        evo1 = self.physics.calculate_track_evolution(1)
        evo50 = self.physics.calculate_track_evolution(50)
        self.assertGreater(evo50, evo1)
        self.assertLess(evo50, 1.35)

    def test_physics_dynamic_wake_penalty(self):
        # Gap > 2.0s -> 0 penalty
        clean = self.physics.calculate_dynamic_wake_penalty(3.5)
        self.assertFalse(clean["in_dirty_air"])
        self.assertEqual(clean["penalty_seconds"], 0.0)

        # Gap < 2.0s -> positive penalty and aero loss
        dirty = self.physics.calculate_dynamic_wake_penalty(0.85)
        self.assertTrue(dirty["in_dirty_air"])
        self.assertGreater(dirty["penalty_seconds"], 0.0)
        self.assertGreater(dirty["aero_loss_pct"], 0.0)

    def test_f1_catalog(self):
        catalog = self.fetcher.get_catalog()
        self.assertIn(2024, catalog["years"])
        self.assertIn("Silverstone", catalog["grand_prix"])
        self.assertIn("Race", catalog["sessions"])
        self.assertTrue(len(catalog["drivers"]) >= 6)

    def test_f1_fetch_session(self):
        session = self.fetcher.fetch_session(2024, "Silverstone", "Race", "NOR")
        self.assertIn("laps", session)
        self.assertGreaterEqual(len(session["laps"]), 20)
        self.assertEqual(session["driver"], "NOR")

    def test_file_parser_csv(self):
        sample_path = os.path.join(os.path.dirname(__file__), "..", "public", "samples", "2024_silverstone_norris_medium.csv")
        with open(sample_path, "rb") as f:
            content = f.read()
        parsed = TelemetryFileParser.parse_file(content, "2024_silverstone_norris_medium.csv")
        self.assertEqual(parsed["driver"], "NOR")
        self.assertEqual(parsed["compound"], "MEDIUM")
        self.assertEqual(len(parsed["laps"]), 27)

    def test_vectorized_batch_processing(self):
        sample_path = os.path.join(os.path.dirname(__file__), "..", "public", "samples", "2024_silverstone_norris_medium.csv")
        with open(sample_path, "rb") as f:
            content = f.read()
        parsed = TelemetryFileParser.parse_file(content, "2024_silverstone_norris_medium.csv")
        batch = self.physics.process_stint_batch(parsed["laps"], compound_code="MEDIUM")
        self.assertEqual(len(batch["laps"]), len(parsed["laps"]))
        self.assertIn("metrics", batch)
        self.assertGreater(batch["metrics"]["r2_score"], 0.70)
        self.assertLess(batch["metrics"]["mae_seconds"], 0.75)


if __name__ == "__main__":
    unittest.main()
