"""
=============================================================================
TrackShift - Python Gemini API Key Round-Robin Manager
=============================================================================
Round-robins requests across GEMINI_API_KEY1, GEMINI_API_KEY2, GEMINI_API_KEY3
with automatic retry on rate limits and health tracking.
"""

import os
import time
import logging
from typing import List, Dict, Any, Optional
from threading import Lock
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("trackshift.gemini_rotator")

class GeminiKeyRotator:
    def __init__(self):
        self._lock = Lock()
        self._current_index = 0
        self._keys: List[Dict[str, str]] = []
        self._stats: Dict[str, Dict[str, Any]] = {}
        self.reload_keys()

    def reload_keys(self) -> None:
        with self._lock:
            found_keys = []
            for i in range(1, 21):
                val = os.getenv(f"GEMINI_API_KEY{i}") or os.getenv(f"GEMINI_API_KEY_{i}")
                if val and val.strip() and "MY_GEMINI_API_KEY" not in val:
                    found_keys.append({"id": f"GEMINI_API_KEY{i}", "key": val.strip()})

            # Check comma-separated list
            csv_keys = os.getenv("GEMINI_API_KEYS", "")
            if csv_keys:
                for idx, k in enumerate(csv_keys.split(",")):
                    k_str = k.strip()
                    if k_str and not any(x["key"] == k_str for x in found_keys):
                        found_keys.append({"id": f"GEMINI_CSV_KEY_{idx+1}", "key": k_str})

            # Check single key fallback
            single_key = os.getenv("GEMINI_API_KEY", "")
            if single_key and single_key.strip() and "MY_GEMINI_API_KEY" not in single_key:
                s_str = single_key.strip()
                if not any(x["key"] == s_str for x in found_keys):
                    found_keys.append({"id": "GEMINI_API_KEY", "key": s_str})

            self._keys = found_keys
            for item in self._keys:
                kid = item["id"]
                if kid not in self._stats:
                    self._stats[kid] = {
                        "key_id": kid,
                        "masked_key": f"{item['key'][:8]}...{item['key'][-6:]}" if len(item['key']) > 10 else "***",
                        "total_calls": 0,
                        "success_count": 0,
                        "failure_count": 0,
                        "status": "HEALTHY",
                        "cooldown_until": 0
                    }
            logger.info(f"Initialized Python GeminiKeyRotator with {len(self._keys)} keys.")

    def get_next_key(self) -> Optional[Dict[str, str]]:
        with self._lock:
            if not self._keys:
                return None
            total = len(self._keys)
            now = time.time()

            for attempt in range(total):
                idx = (self._current_index + attempt) % total
                candidate = self._keys[idx]
                kid = candidate["id"]
                stat = self._stats.get(kid, {})

                if stat.get("status") == "COOLDOWN" and now < stat.get("cooldown_until", 0):
                    continue

                if stat.get("status") == "COOLDOWN" and now >= stat.get("cooldown_until", 0):
                    stat["status"] = "HEALTHY"

                self._current_index = (idx + 1) % total
                return candidate

            # Fallback
            idx = self._current_index % total
            self._current_index = (self._current_index + 1) % total
            return self._keys[idx]

    def record_call(self, key_id: str, success: bool, error_msg: str = "") -> None:
        with self._lock:
            if key_id in self._stats:
                stat = self._stats[key_id]
                stat["total_calls"] += 1
                if success:
                    stat["success_count"] += 1
                    stat["status"] = "HEALTHY"
                else:
                    stat["failure_count"] += 1
                    if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg or "Quota" in error_msg:
                        stat["status"] = "COOLDOWN"
                        stat["cooldown_until"] = time.time() + 60.0
                    else:
                        stat["status"] = "ERROR"

    def get_status(self) -> Dict[str, Any]:
        with self._lock:
            return {
                "total_keys": len(self._keys),
                "current_index": self._current_index,
                "keys": list(self._stats.values())
            }

gemini_rotator = GeminiKeyRotator()
