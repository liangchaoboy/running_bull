/**
 * Challenge / growth helpers aligned with growth/METRICS.md.
 */

import { DEFAULT_CHALLENGE_CARD_HEALTHY_RATIO } from "./defaults.js";

/**
 * METRICS.md §2: challenge_cards 「好看」≥ 试玩的 30%.
 * Returns ratio in [0, 1], or 0 when tryUvEst is 0 (avoid divide-by-zero).
 */
export function challengeCardRate(
  challengeCards: number,
  tryUvEst: number,
): number {
  if (tryUvEst <= 0) return 0;
  if (challengeCards < 0) return 0;
  return challengeCards / tryUvEst;
}

/** True when rate meets the hand-table “好看” threshold (default 30%). */
export function isHealthyChallengeCardRate(
  challengeCards: number,
  tryUvEst: number,
  healthyRatio: number = DEFAULT_CHALLENGE_CARD_HEALTHY_RATIO,
): boolean {
  return challengeCardRate(challengeCards, tryUvEst) >= healthyRatio;
}
