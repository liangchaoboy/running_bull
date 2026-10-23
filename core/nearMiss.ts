/**
 * Geometric near-miss (擦边) classification.
 * Danger box inset (Pixel Horse / Phaser tutorials) + brave band expand (GAME_DESIGN).
 */

export interface Aabb {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ContactKind = "clear" | "graze" | "hit";

export interface NearMissOptions {
  /** Shrink obstacle visual box for fairer hits (px/units per side). */
  dangerInset?: number;
  /** Expand danger into brave band (px/units per side). */
  bravePad?: number;
}

export const DEFAULT_DANGER_INSET = 4;
/** docs/GAME_DESIGN: 勇敢带 roughly +8～12 around danger */
export const DEFAULT_BRAVE_PAD = 10;

export function aabbOverlap(a: Aabb, b: Aabb): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function insetAabb(box: Aabb, inset: number): Aabb {
  const i = Math.max(0, inset);
  const w = Math.max(0, box.w - 2 * i);
  const h = Math.max(0, box.h - 2 * i);
  return { x: box.x + i, y: box.y + i, w, h };
}

export function expandAabb(box: Aabb, pad: number): Aabb {
  const p = Math.max(0, pad);
  return { x: box.x - p, y: box.y - p, w: box.w + 2 * p, h: box.h + 2 * p };
}

/**
 * Build danger (inset) and brave (danger expanded by pad) from obstacle visual box.
 */
export function obstacleZones(
  obstacleVisual: Aabb,
  opts?: NearMissOptions,
): { danger: Aabb; brave: Aabb } {
  const inset = opts?.dangerInset ?? DEFAULT_DANGER_INSET;
  const pad = opts?.bravePad ?? DEFAULT_BRAVE_PAD;
  const danger = insetAabb(obstacleVisual, inset);
  const brave = expandAabb(danger, pad);
  return { danger, brave };
}

/**
 * clear → no contact; graze → in brave band only; hit → overlaps danger.
 * XBuilder: if hit → broadcast player_hit; if graze && !alreadyBrave → grazeTick.
 */
export function classifyContact(
  player: Aabb,
  obstacleVisual: Aabb,
  opts?: NearMissOptions,
): ContactKind {
  const { danger, brave } = obstacleZones(obstacleVisual, opts);
  if (aabbOverlap(player, danger)) return "hit";
  if (aabbOverlap(player, brave)) return "graze";
  return "clear";
}
