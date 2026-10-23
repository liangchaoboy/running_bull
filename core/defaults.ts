/**
 * Day1 defaults from docs/GAME_DESIGN.md & docs/LEVEL_1.md.
 * Values marked DEFAULT_* are implementation choices when the docs give a range or omit a number.
 * TUNED_* / jump-hold / coyote values come from docs/PARKOUR_REFERENCE.md (Spike Sprint + Demon-Runner).
 */

/** docs legacy: runSpeed ≈ 8 — prefer RUN_SPEED_START for smoother Demo */
export const DEFAULT_RUN_SPEED = 8;

/**
 * Tuned scroll (Spike Sprint BASE_SPEED=6): start slower so first jumps feel readable.
 * XBuilder: set runSpeed = runSpeedStart at start_game.
 */
export const DEFAULT_RUN_SPEED_START = 6;

/** Cap after ramp (Spike goes to 3×; we stay mild for Scratch). */
export const DEFAULT_RUN_SPEED_MAX = 10;

/** Seconds to lerp start → max (aligns with LEVEL_1 加压 window). */
export const DEFAULT_SPEED_RAMP_SECONDS = 36;

/**
 * Tuned fixed tap jump (+y up). Mapped from Spike Sprint tap hop |vy|=9, g=0.85
 * → similar apex with jumpV=11, gravity=0.95 (snappier than old 12/0.8 float).
 */
export const DEFAULT_JUMP_V = 11;

/** docs legacy gravity 0.8; tuned snappier fall for clearer control. */
export const DEFAULT_GRAVITY = 0.95;

/** Variable jump (optional): Spike MIN_JUMP_V magnitude 9 / MAX 16.5 / hold 320ms */
export const DEFAULT_JUMP_V_MIN = 9;
export const DEFAULT_JUMP_V_MAX = 15;
export const DEFAULT_JUMP_HOLD_MS = 300;

/** Coyote / buffer in Scratch-sized ticks (~6–8 Hz wait loops use 1–2). At 60fps think 4–8. */
export const DEFAULT_COYOTE_FRAMES = 4;
export const DEFAULT_JUMP_BUFFER_FRAMES = 6;

/** Horizontal gaps (world units) when using distance-based spawn. */
export const DEFAULT_SPAWN_GAP_EASY = 280;
export const DEFAULT_SPAWN_GAP_HARD = 140;

/** Base seconds between random spawns at 1× speed (Spike ~1s; we keep easier). */
export const DEFAULT_SPAWN_INTERVAL_START_S = 2.2;

/** docs: braveStacks 上限 9 → 倍率最高 10 */
export const DEFAULT_BRAVE_STACKS_CAP = 9;

/**
 * DEFAULT (invented — docs have no coins): flat score bonus per coin collected.
 * Kept separate from distance × brave so Demo can ignore coins.
 */
export const DEFAULT_COIN_BONUS = 50;

/**
 * DEFAULT (invented): how much distance increases per tick when running.
 * Docs allow `+= 1` or `+= runSpeed`; we default to +1 per tick for predictable tests.
 */
export const DEFAULT_DISTANCE_PER_TICK = 1;

/**
 * growth/METRICS.md: challenge_cards 「好看」≥ 试玩的 30%
 */
export const DEFAULT_CHALLENGE_CARD_HEALTHY_RATIO = 0.3;
