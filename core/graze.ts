/**
 * Edge-graze（擦边）tick helper — wraps scoring.registerBraveNearMiss with UI payload.
 * docs/GAME_DESIGN.md §5: 进入勇敢带且未进危险盒 → 勇敢 +1；同障碍仅 1 次。
 */

import {
  registerBraveNearMiss,
  type RunState,
  type ScoringOptions,
} from "./scoring.js";

export interface GrazeTickResult {
  state: RunState;
  /** true when this call actually added a brave stack */
  granted: boolean;
  /** 飘字；未授予则为 null */
  floatText: string | null;
  stacksAfter: number;
  multiplierAfter: number;
}

/**
 * One 擦边 attempt against an obstacle instance.
 * Idempotent per obstacleId while running.
 */
export function grazeTick(
  state: RunState,
  obstacleId: string,
  opts?: ScoringOptions,
): GrazeTickResult {
  const before = state.braveStacks;
  const next = registerBraveNearMiss(state, obstacleId, opts);
  const granted = next.braveStacks > before;
  const stacksAfter = next.braveStacks;
  const multiplierAfter = 1 + stacksAfter;
  return {
    state: next,
    granted,
    floatText: granted ? "勇敢 +1！" : null,
    stacksAfter,
    multiplierAfter,
  };
}
