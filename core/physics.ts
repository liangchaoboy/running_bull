/**
 * Jump / gravity helpers for XBuilder parity.
 * Numbers mapped from MIT Spike Sprint (tap/hold jump) + Demon-Runner coyote/buffer.
 * Scratch/spx convention here: +y up, jumpV > 0, gravity > 0 applied as vy -= gravity.
 */

import {
  DEFAULT_COYOTE_FRAMES,
  DEFAULT_GRAVITY,
  DEFAULT_JUMP_BUFFER_FRAMES,
  DEFAULT_JUMP_HOLD_MS,
  DEFAULT_JUMP_V,
  DEFAULT_JUMP_V_MAX,
  DEFAULT_JUMP_V_MIN,
} from "./defaults.js";

export interface JumpFeelOptions {
  jumpV?: number;
  jumpVMin?: number;
  jumpVMax?: number;
  gravity?: number;
  holdMsMax?: number;
  coyoteFrames?: number;
  bufferFrames?: number;
}

/** Apex height for a constant-gravity jump: v² / (2g). */
export function jumpApexHeight(jumpV: number, gravity: number): number {
  if (gravity <= 0) return Infinity;
  const v = Math.abs(jumpV);
  return (v * v) / (2 * gravity);
}

/** Frames (or ticks) from takeoff to apex at 1 tick = one gravity apply. */
export function framesToApex(jumpV: number, gravity: number): number {
  if (gravity <= 0) return Infinity;
  return Math.abs(jumpV) / gravity;
}

/** Total airtime (up + down) for a full jump landing at same y. */
export function jumpAirtimeTicks(jumpV: number, gravity: number): number {
  return 2 * framesToApex(jumpV, gravity);
}

/**
 * Variable-height jump (Spike Sprint): start at jumpVMin; on release,
 * blend toward jumpVMax by holdRatio = clamp(holdMs / holdMsMax, 0, 1).
 * If still rising (vy > 0 in +y-up), set vy to the blended impulse.
 */
export function variableJumpReleaseVy(
  holdMs: number,
  opts?: JumpFeelOptions,
): number {
  const min = opts?.jumpVMin ?? DEFAULT_JUMP_V_MIN;
  const max = opts?.jumpVMax ?? DEFAULT_JUMP_V_MAX;
  const holdMax = opts?.holdMsMax ?? DEFAULT_JUMP_HOLD_MS;
  const ratio = Math.min(1, Math.max(0, holdMs / holdMax));
  return min + (max - min) * ratio;
}

/** One gravity tick: vy decreases by gravity; y increases by vy (+y up). */
export function applyGravityTick(
  y: number,
  vy: number,
  gravity: number = DEFAULT_GRAVITY,
): { y: number; vy: number } {
  const nextVy = vy - gravity;
  return { y: y + nextVy, vy: nextVy };
}

/** Clamp to ground; returns onGround. */
export function resolveGround(
  y: number,
  vy: number,
  groundY: number,
): { y: number; vy: number; onGround: boolean } {
  if (y <= groundY) {
    return { y: groundY, vy: 0, onGround: true };
  }
  return { y, vy, onGround: false };
}

/**
 * Coyote time: can still jump if framesSinceGround ≤ coyoteFrames.
 * Demon-Runner uses ~110ms ≈ 6–7 frames at 60fps; we default fewer for Scratch tick rates.
 */
export function canCoyoteJump(
  onGround: boolean,
  framesSinceGround: number,
  opts?: JumpFeelOptions,
): boolean {
  if (onGround) return true;
  const coyote = opts?.coyoteFrames ?? DEFAULT_COYOTE_FRAMES;
  return framesSinceGround <= coyote;
}

/**
 * Jump buffer: if jump was pressed ≤ bufferFrames before landing, consume on land.
 */
export function shouldBufferJump(
  framesSinceJumpPress: number,
  opts?: JumpFeelOptions,
): boolean {
  const buf = opts?.bufferFrames ?? DEFAULT_JUMP_BUFFER_FRAMES;
  return framesSinceJumpPress >= 0 && framesSinceJumpPress <= buf;
}

/** Fixed tap jump impulse (Day1 XBuilder: click = full jump, no hold). */
export function tapJumpVy(opts?: JumpFeelOptions): number {
  return opts?.jumpV ?? DEFAULT_JUMP_V;
}

/** Recommended feel summary for docs / XBuilder variables. */
export function feelSummary(opts?: JumpFeelOptions) {
  const jumpV = opts?.jumpV ?? DEFAULT_JUMP_V;
  const gravity = opts?.gravity ?? DEFAULT_GRAVITY;
  return {
    jumpV,
    gravity,
    apex: jumpApexHeight(jumpV, gravity),
    airtimeTicks: jumpAirtimeTicks(jumpV, gravity),
    jumpVMin: opts?.jumpVMin ?? DEFAULT_JUMP_V_MIN,
    jumpVMax: opts?.jumpVMax ?? DEFAULT_JUMP_V_MAX,
    holdMsMax: opts?.holdMsMax ?? DEFAULT_JUMP_HOLD_MS,
    coyoteFrames: opts?.coyoteFrames ?? DEFAULT_COYOTE_FRAMES,
    bufferFrames: opts?.bufferFrames ?? DEFAULT_JUMP_BUFFER_FRAMES,
  };
}
