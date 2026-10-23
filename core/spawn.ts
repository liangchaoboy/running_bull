/**
 * Obstacle spawn pacing helpers.
 * Patterns from Spike Sprint (speed-scaled interval) + LEVEL_1 time table.
 */

import {
  DEFAULT_RUN_SPEED,
  DEFAULT_RUN_SPEED_MAX,
  DEFAULT_RUN_SPEED_START,
  DEFAULT_SPAWN_GAP_EASY,
  DEFAULT_SPAWN_GAP_HARD,
  DEFAULT_SPAWN_INTERVAL_START_S,
  DEFAULT_SPEED_RAMP_SECONDS,
} from "./defaults.js";

export interface SpawnOptions {
  runSpeedStart?: number;
  runSpeedMax?: number;
  rampSeconds?: number;
  gapEasy?: number;
  gapHard?: number;
  intervalStartS?: number;
}

/** Linear speed ramp: start → max over rampSeconds of run time. */
export function runSpeedAt(
  elapsedSeconds: number,
  opts?: SpawnOptions,
): number {
  const start = opts?.runSpeedStart ?? DEFAULT_RUN_SPEED_START;
  const max = opts?.runSpeedMax ?? DEFAULT_RUN_SPEED_MAX;
  const ramp = opts?.rampSeconds ?? DEFAULT_SPEED_RAMP_SECONDS;
  if (ramp <= 0) return max;
  const t = Math.min(1, Math.max(0, elapsedSeconds / ramp));
  return start + (max - start) * t;
}

/**
 * Spike Sprint–style next spawn interval (seconds).
 * At low speed ≈ intervalStartS; shrinks as speed rises, with light jitter.
 */
export function nextSpawnIntervalSec(
  speedMult: number,
  opts?: SpawnOptions & { jitter?: number; rand?: () => number },
): number {
  const base = opts?.intervalStartS ?? DEFAULT_SPAWN_INTERVAL_START_S;
  // Map Spike: nextSpawnAt = 55 - min(25, speedMult*8) + random*30  (frames @60)
  // → seconds: base*(55/60) style → we keep API in seconds.
  const shrink = Math.min(0.55, Math.max(0, (speedMult - 1) * 0.35));
  const rand = opts?.rand ?? Math.random;
  const jitter = opts?.jitter ?? 0.35;
  return Math.max(0.85, base - shrink + rand() * jitter);
}

/** Horizontal gap (world units) for easy / hard segments. */
export function gapForDensity(
  density: "easy" | "mid" | "hard",
  opts?: SpawnOptions,
): number {
  const easy = opts?.gapEasy ?? DEFAULT_SPAWN_GAP_EASY;
  const hard = opts?.gapHard ?? DEFAULT_SPAWN_GAP_HARD;
  if (density === "easy") return easy;
  if (density === "hard") return hard;
  return (easy + hard) / 2;
}

/**
 * Convert LEVEL_1 wait seconds → distance trigger at constant runSpeed.
 * distancePerSec defaults to runSpeed (docs allow distance += runSpeed).
 */
export function distanceAtTime(
  seconds: number,
  runSpeed: number = DEFAULT_RUN_SPEED,
  distancePerSec?: number,
): number {
  const rate = distancePerSec ?? runSpeed;
  return Math.round(seconds * rate);
}

/** LEVEL_1 curated gaps (seconds between spawns) — mirrors docs/LEVEL_1.md. */
export const LEVEL_1_GAPS_SEC: readonly number[] = [
  2.5, // #1 from start
  3.5, 3.5, 3.5, 3.0, 2.5, 3.0, 2.5, 2.0, 1.5, 3.5, 2.0, 1.5, 1.5, 1.2, 2.8, 2.0,
  1.5,
];

/** Cumulative spawn times from LEVEL_1_GAPS_SEC. */
export function level1SpawnTimesSec(): number[] {
  const times: number[] = [];
  let t = 0;
  for (const gap of LEVEL_1_GAPS_SEC) {
    t += gap;
    times.push(Number(t.toFixed(2)));
  }
  return times;
}

/**
 * Endless segment after 45s: random gap in [1.2, 2.5] (LEVEL_1 §循环).
 */
export function endlessGapSec(rand: () => number = Math.random): number {
  return 1.2 + rand() * (2.5 - 1.2);
}
