/**
 * Daily seed stub for「日种子关」— growth/CHALLENGE_CARD.md + MONETIZATION 叙事 3.
 * Pure: date → deterministic seed id / obstacle offset. No network.
 */

/** Asia/Shanghai calendar day as YYYY-MM-DD. */
export type SeedDate = string;

export interface DailySeed {
  /** e.g. seed-2026-10-24 */
  id: string;
  date: SeedDate;
  /** 0–6 obstacle rhythm offset into LEVEL_1 table (stub) */
  obstacleOffset: number;
  /** display label */
  label: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Simple stable hash for YYYY-MM-DD → non-neg int. */
function hashDate(date: SeedDate): number {
  let h = 0;
  for (let i = 0; i < date.length; i++) {
    h = (h * 31 + date.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Build today's (or given) daily seed.
 * @param dateYYYYMMDD must match /^\d{4}-\d{2}-\d{2}$/
 */
export function dailySeedFor(dateYYYYMMDD: SeedDate): DailySeed {
  if (!DATE_RE.test(dateYYYYMMDD)) {
    throw new Error(`dailySeedFor: expected YYYY-MM-DD, got ${dateYYYYMMDD}`);
  }
  const h = hashDate(dateYYYYMMDD);
  const obstacleOffset = h % 7;
  return {
    id: `seed-${dateYYYYMMDD}`,
    date: dateYYYYMMDD,
    obstacleOffset,
    label: `今日种子关 ${dateYYYYMMDD}`,
  };
}

/** Same date → same seed (deterministic). */
export function isSameDailySeed(a: DailySeed, b: DailySeed): boolean {
  return a.id === b.id && a.obstacleOffset === b.obstacleOffset;
}
