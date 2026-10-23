/**
 * Parkour scoring / run-state core.
 * Formula from docs/GAME_DESIGN.md:
 *   braveMultiplier = 1 + braveStacks
 *   score = distance * braveMultiplier  (+ optional coin bonus; see defaults)
 */

import {
  DEFAULT_BRAVE_STACKS_CAP,
  DEFAULT_COIN_BONUS,
  DEFAULT_DISTANCE_PER_TICK,
} from "./defaults.js";

export type RunPhase = "running" | "settled";

export interface Settlement {
  distance: number;
  braveStacks: number;
  braveMultiplier: number;
  coins: number;
  score: number;
  /** 死亡梗句 — docs 常量 */
  deathTitle: string;
  deathSubtitle: string;
  /** 若本局 braveStacks >= 1 */
  bravestLine: string | null;
}

export interface RunState {
  phase: RunPhase;
  distance: number;
  braveStacks: number;
  coins: number;
  /** obstacle instance ids that already granted a brave stack */
  braveClaimedObstacleIds: Set<string>;
}

export interface ScoringOptions {
  braveStacksCap?: number;
  coinBonus?: number;
  distancePerTick?: number;
}

const DEATH_TITLE = "勇敢牛牛，不怕困难";
const DEATH_SUBTITLE = "再来一局，更勇敢一点！";

export function createRun(opts?: ScoringOptions): RunState {
  void opts; // caps applied at mutation time
  return {
    phase: "running",
    distance: 0,
    braveStacks: 0,
    coins: 0,
    braveClaimedObstacleIds: new Set(),
  };
}

export function braveMultiplier(braveStacks: number): number {
  return 1 + braveStacks;
}

/**
 * Final score: distance × (1 + braveStacks) + coins × coinBonus.
 * Coin term is DEFAULT invented (docs: score = distance * braveMultiplier only).
 */
export function computeScore(
  distance: number,
  stacks: number,
  coins: number,
  opts?: ScoringOptions,
): number {
  const bonus = opts?.coinBonus ?? DEFAULT_COIN_BONUS;
  return distance * braveMultiplier(stacks) + coins * bonus;
}

/** Advance distance while running; no-op after death (docs: 死亡后距离冻结). */
export function tickDistance(state: RunState, opts?: ScoringOptions): RunState {
  if (state.phase !== "running") return state;
  const delta = opts?.distancePerTick ?? DEFAULT_DISTANCE_PER_TICK;
  return { ...state, distance: state.distance + delta };
}

/**
 * Near-miss / 擦边: same obstacle only once (alreadyBrave).
 * Caps at DEFAULT_BRAVE_STACKS_CAP (docs: 上限 9).
 */
export function registerBraveNearMiss(
  state: RunState,
  obstacleId: string,
  opts?: ScoringOptions,
): RunState {
  if (state.phase !== "running") return state;
  if (state.braveClaimedObstacleIds.has(obstacleId)) return state;
  const cap = opts?.braveStacksCap ?? DEFAULT_BRAVE_STACKS_CAP;
  const nextStacks = Math.min(state.braveStacks + 1, cap);
  const claimed = new Set(state.braveClaimedObstacleIds);
  claimed.add(obstacleId);
  return { ...state, braveStacks: nextStacks, braveClaimedObstacleIds: claimed };
}

/** Collect a coin while running. DEFAULT invented mechanic. */
export function collectCoin(state: RunState): RunState {
  if (state.phase !== "running") return state;
  return { ...state, coins: state.coins + 1 };
}

/** Hit hazard → settle. Distance freezes; score computed once. */
export function die(state: RunState, opts?: ScoringOptions): Settlement & { state: RunState } {
  if (state.phase === "settled") {
    return { ...settlementFrom(state, opts), state };
  }
  const settled: RunState = { ...state, phase: "settled" };
  return { ...settlementFrom(settled, opts), state: settled };
}

function settlementFrom(state: RunState, opts?: ScoringOptions): Settlement {
  const mult = braveMultiplier(state.braveStacks);
  const score = computeScore(state.distance, state.braveStacks, state.coins, opts);
  return {
    distance: state.distance,
    braveStacks: state.braveStacks,
    braveMultiplier: mult,
    coins: state.coins,
    score,
    deathTitle: DEATH_TITLE,
    deathSubtitle: DEATH_SUBTITLE,
    bravestLine:
      state.braveStacks >= 1
        ? `本局最勇：擦边 ${state.braveStacks} 次`
        : null,
  };
}

/** 「再玩」= 重置变量并回到起点 (docs §6 / §8). */
export function restart(_prev?: RunState, opts?: ScoringOptions): RunState {
  return createRun(opts);
}
