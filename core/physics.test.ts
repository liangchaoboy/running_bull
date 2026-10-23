import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyGravityTick,
  canCoyoteJump,
  feelSummary,
  framesToApex,
  jumpApexHeight,
  jumpAirtimeTicks,
  resolveGround,
  shouldBufferJump,
  tapJumpVy,
  variableJumpReleaseVy,
} from "./physics.js";
import {
  DEFAULT_GRAVITY,
  DEFAULT_JUMP_V,
  DEFAULT_JUMP_V_MAX,
  DEFAULT_JUMP_V_MIN,
} from "./defaults.js";

describe("jump physics helpers", () => {
  it("apex and airtime match v²/2g for tuned tap jump", () => {
    const apex = jumpApexHeight(DEFAULT_JUMP_V, DEFAULT_GRAVITY);
    assert.ok(apex > 50 && apex < 80, `apex=${apex}`);
    assert.equal(framesToApex(11, 0.95), 11 / 0.95);
    assert.equal(jumpAirtimeTicks(11, 0.95), 2 * (11 / 0.95));
  });

  it("variable jump blends min→max by hold ratio (Spike-style)", () => {
    assert.equal(variableJumpReleaseVy(0), DEFAULT_JUMP_V_MIN);
    assert.equal(variableJumpReleaseVy(300), DEFAULT_JUMP_V_MAX);
    assert.equal(variableJumpReleaseVy(150), (DEFAULT_JUMP_V_MIN + DEFAULT_JUMP_V_MAX) / 2);
  });

  it("gravity tick + ground resolve", () => {
    let y = 10;
    let vy = tapJumpVy();
    ({ y, vy } = applyGravityTick(y, vy, DEFAULT_GRAVITY));
    assert.ok(vy < DEFAULT_JUMP_V);
    const landed = resolveGround(0, -1, 0);
    assert.equal(landed.onGround, true);
    assert.equal(landed.vy, 0);
  });

  it("coyote and jump buffer windows", () => {
    assert.equal(canCoyoteJump(true, 99), true);
    assert.equal(canCoyoteJump(false, 2), true);
    assert.equal(canCoyoteJump(false, 99), false);
    assert.equal(shouldBufferJump(3), true);
    assert.equal(shouldBufferJump(99), false);
  });

  it("feelSummary exposes XBuilder-facing numbers", () => {
    const s = feelSummary();
    assert.equal(s.jumpV, DEFAULT_JUMP_V);
    assert.equal(s.gravity, DEFAULT_GRAVITY);
    assert.ok(s.apex > 0);
  });
});
