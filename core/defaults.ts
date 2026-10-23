/**
 * Day1 defaults from docs/GAME_DESIGN.md & docs/LEVEL_1.md.
 * Values marked DEFAULT_* are implementation choices when the docs give a range or omit a number.
 */

/** docs: runSpeed ≈ 8 */
export const DEFAULT_RUN_SPEED = 8;

/** docs: jumpV = 12 (physics; unused by scoring core but exported for parity) */
export const DEFAULT_JUMP_V = 12;

/** docs: gravity = 0.8 */
export const DEFAULT_GRAVITY = 0.8;

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
