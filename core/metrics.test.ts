import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  challengeCardRate,
  isHealthyChallengeCardRate,
} from "./metrics.js";
import { DEFAULT_CHALLENGE_CARD_HEALTHY_RATIO } from "./defaults.js";

describe("challenge-metric helper (METRICS.md)", () => {
  it("challengeCardRate = challenge_cards / try_uv_est", () => {
    // example row: challenge_cards 6, try_uv_est 18 → 33.3%
    assert.ok(Math.abs(challengeCardRate(6, 18) - 6 / 18) < 1e-9);
    assert.equal(challengeCardRate(0, 10), 0);
    assert.equal(challengeCardRate(5, 0), 0);
  });

  it("healthy when ≥ 30% (METRICS.md §2 好看)", () => {
    assert.equal(DEFAULT_CHALLENGE_CARD_HEALTHY_RATIO, 0.3);
    assert.equal(isHealthyChallengeCardRate(6, 18), true); // ~33%
    assert.equal(isHealthyChallengeCardRate(2, 18), false); // ~11%
    assert.equal(isHealthyChallengeCardRate(3, 10), true); // 30% exact
  });
});
