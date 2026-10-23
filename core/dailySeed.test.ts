import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dailySeedFor, isSameDailySeed } from "./dailySeed.js";

describe("daily seed stub", () => {
  it("is deterministic for the same date", () => {
    const a = dailySeedFor("2026-10-24");
    const b = dailySeedFor("2026-10-24");
    assert.equal(a.id, "seed-2026-10-24");
    assert.equal(a.label, "今日种子关 2026-10-24");
    assert.ok(a.obstacleOffset >= 0 && a.obstacleOffset <= 6);
    assert.equal(isSameDailySeed(a, b), true);
  });

  it("differs across dates and rejects bad input", () => {
    const a = dailySeedFor("2026-10-24");
    const b = dailySeedFor("2026-10-25");
    assert.notEqual(a.id, b.id);
    assert.throws(() => dailySeedFor("10/24/2026"));
  });
});
