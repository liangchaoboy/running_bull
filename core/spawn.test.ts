import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  distanceAtTime,
  endlessGapSec,
  gapForDensity,
  level1SpawnTimesSec,
  LEVEL_1_GAPS_SEC,
  nextSpawnIntervalSec,
  runSpeedAt,
} from "./spawn.js";
import {
  DEFAULT_RUN_SPEED_MAX,
  DEFAULT_RUN_SPEED_START,
} from "./defaults.js";

describe("spawn pacing", () => {
  it("ramps run speed from start to max", () => {
    assert.equal(runSpeedAt(0), DEFAULT_RUN_SPEED_START);
    assert.equal(runSpeedAt(999), DEFAULT_RUN_SPEED_MAX);
    const mid = runSpeedAt(18);
    assert.ok(mid > DEFAULT_RUN_SPEED_START && mid < DEFAULT_RUN_SPEED_MAX);
  });

  it("next spawn interval shrinks with speed and stays ≥ 0.85s", () => {
    const slow = nextSpawnIntervalSec(1, { rand: () => 0 });
    const fast = nextSpawnIntervalSec(3, { rand: () => 0 });
    assert.ok(fast < slow);
    assert.ok(fast >= 0.85);
  });

  it("LEVEL_1 gaps accumulate to ~45s", () => {
    const times = level1SpawnTimesSec();
    assert.equal(times.length, LEVEL_1_GAPS_SEC.length);
    assert.equal(times[0], 2.5);
    const last = times[times.length - 1];
    assert.ok(last >= 43 && last <= 46, `last=${last}`);
  });

  it("distanceAtTime and density gaps", () => {
    assert.equal(distanceAtTime(2.5, 8), 20);
    assert.ok(gapForDensity("easy") > gapForDensity("hard"));
    assert.ok(endlessGapSec(() => 0) === 1.2);
    assert.ok(endlessGapSec(() => 1) === 2.5);
  });
});
