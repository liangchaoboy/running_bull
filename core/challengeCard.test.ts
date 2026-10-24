import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildChallengeCardPayload,
  formatDailySeedCard,
  formatShortCard,
  formatStandardCard,
  PUBLISH_URL_PLACEHOLDER,
} from "./challengeCard.js";
import { createRun, die, registerBraveNearMiss, tickDistance } from "./scoring.js";

describe("challenge card payload (CHALLENGE_CARD.md)", () => {
  it("builds fields from settlement and formats standard card", () => {
    let s = createRun();
    for (let i = 0; i < 100; i++) s = tickDistance(s);
    s = registerBraveNearMiss(s, "o1");
    s = registerBraveNearMiss(s, "o2");
    s = registerBraveNearMiss(s, "o3");
    const { distance, braveStacks, braveMultiplier, score, deathTitle } = die(s);
    const p = buildChallengeCardPayload(
      { distance, braveStacks, braveMultiplier, score, deathTitle },
      null,
    );
    assert.equal(p.distance, 100);
    assert.equal(p.braveStacks, 3);
    assert.equal(p.braveMultiplier, 4);
    assert.equal(p.score, 400);
    assert.equal(p.publishUrl, PUBLISH_URL_PLACEHOLDER);
    const text = formatStandardCard(p);
    assert.match(text, /距离：100/);
    assert.match(text, /勇敢：\+3（倍率 ×4）/);
    assert.match(text, /得分：400/);
    assert.match(text, /勇敢牛牛，不怕困难/);
    assert.match(text, /#勇敢牛牛/);
    assert.match(text, /#XBuilder/);
    assert.match(text, /#跑酷/);
    assert.doesNotMatch(text, /#1024/);
    assert.match(text, /liangchaoboy\/running_bull/);
  });

  it("short card and daily seed card include publish url / date", () => {
    const p = buildChallengeCardPayload(
      {
        distance: 1280,
        braveStacks: 3,
        braveMultiplier: 4,
        score: 5120,
        deathTitle: "勇敢牛牛，不怕困难",
      },
      "https://example.com/play",
      "2026-10-24",
    );
    const short = formatShortCard(p);
    assert.match(short, /得分 5120/);
    assert.match(short, /https:\/\/example\.com\/play/);
    const daily = formatDailySeedCard(p);
    assert.match(daily, /今日种子关 2026-10-24/);
    assert.match(daily, /距离 1280/);
  });
});
