/**
 * Challenge-card payload builder — growth/CHALLENGE_CARD.md + docs/GAME_DESIGN.md §7.
 */

import type { Settlement } from "./scoring.js";

export const PUBLISH_URL_PLACEHOLDER = "（待 Publish 后替换）";

export interface ChallengeCardPayload {
  brand: string;
  distance: number;
  braveStacks: number;
  braveMultiplier: number;
  score: number;
  deathTitle: string;
  publishUrl: string;
  /** Asia/Shanghai YYYY-MM-DD when building daily-seed card; else null */
  seedDate: string | null;
}

export function buildChallengeCardPayload(
  settlement: Pick<
    Settlement,
    "distance" | "braveStacks" | "braveMultiplier" | "score" | "deathTitle"
  >,
  publishUrl?: string | null,
  seedDate?: string | null,
): ChallengeCardPayload {
  const url =
    publishUrl && publishUrl.trim().length > 0
      ? publishUrl.trim()
      : PUBLISH_URL_PLACEHOLDER;
  return {
    brand: "勇敢牛牛，天天跑酷",
    distance: settlement.distance,
    braveStacks: settlement.braveStacks,
    braveMultiplier: settlement.braveMultiplier,
    score: settlement.score,
    deathTitle: settlement.deathTitle,
    publishUrl: url,
    seedDate: seedDate ?? null,
  };
}

/** 标准卡（CHALLENGE_CARD.md §标准卡） */
export function formatStandardCard(p: ChallengeCardPayload): string {
  return [
    `🐂 ${p.brand}`,
    "我刚跑完一局，来踢馆！",
    "",
    `距离：${p.distance}`,
    `勇敢：+${p.braveStacks}（倍率 ×${p.braveMultiplier}）`,
    `得分：${p.score}`,
    "",
    `死亡领悟：${p.deathTitle}。`,
    "",
    `试玩 / 挑战：${p.publishUrl}`,
    "",
    "规则：贴障碍擦边才叫勇敢；最终分 = 距离 × 倍率。",
    "Remix 欢迎：换皮、改关，打标签 #1024 #勇敢牛牛",
    "作者：liangchaoboy · 仓库 github.com/neikochan/running_bull",
  ].join("\n");
}

/** 短卡（朋友圈 / 群公告） */
export function formatShortCard(p: ChallengeCardPayload): string {
  return [
    `🐂 得分 ${p.score}｜勇敢 +${p.braveStacks}｜${p.deathTitle}`,
    `来玩：${p.publishUrl}`,
  ].join("\n");
}

/** 日种子卡；缺 seedDate 时用占位日期文案 */
export function formatDailySeedCard(p: ChallengeCardPayload): string {
  const day = p.seedDate ?? "YYYY-MM-DD";
  return [
    `📅 今日种子关 ${day}`,
    `🐂 ${p.brand}`,
    `我的成绩：距离 ${p.distance}｜勇敢 +${p.braveStacks}｜得分 ${p.score}`,
    `同一关，就看谁更勇：${p.publishUrl}`,
  ].join("\n");
}
