import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  collectCoin,
  computeScore,
  createRun,
  die,
  registerBraveNearMiss,
  restart,
  tickDistance,
  braveMultiplier,
} from "./scoring.js";
import { DEFAULT_BRAVE_STACKS_CAP, DEFAULT_COIN_BONUS } from "./defaults.js";

describe("score from distance", () => {
  it("increments distance each tick while running", () => {
    let s = createRun();
    s = tickDistance(s);
    s = tickDistance(s);
    s = tickDistance(s);
    assert.equal(s.distance, 3);
  });

  it("score = distance × (1 + braveStacks) with no coins", () => {
    assert.equal(computeScore(100, 0, 0), 100);
    assert.equal(computeScore(100, 3, 0), 400); // ×4
    assert.equal(braveMultiplier(3), 4);
  });
});

describe("coin bonus", () => {
  it("adds DEFAULT_COIN_BONUS per coin to final score", () => {
    const distance = 100;
    const stacks = 1; // ×2
    const coins = 2;
    const expected = 100 * 2 + 2 * DEFAULT_COIN_BONUS;
    assert.equal(computeScore(distance, stacks, coins), expected);
    assert.equal(expected, 200 + 100);
  });

  it("collectCoin increments while running and is ignored after death", () => {
    let s = createRun();
    s = collectCoin(s);
    s = collectCoin(s);
    assert.equal(s.coins, 2);
    const { state: dead } = die(s);
    const after = collectCoin(dead);
    assert.equal(after.coins, 2);
  });
});

describe("death / restart reset", () => {
  it("freezes distance after death and builds settlement fields", () => {
    let s = createRun();
    for (let i = 0; i < 50; i++) s = tickDistance(s);
    s = registerBraveNearMiss(s, "obs-1");
    s = collectCoin(s);
    const { state, distance, braveStacks, braveMultiplier: mult, score, deathTitle } =
      die(s);
    assert.equal(state.phase, "settled");
    assert.equal(distance, 50);
    assert.equal(braveStacks, 1);
    assert.equal(mult, 2);
    assert.equal(score, 50 * 2 + DEFAULT_COIN_BONUS);
    assert.equal(deathTitle, "勇敢牛牛，不怕困难");

    const frozen = tickDistance(state);
    assert.equal(frozen.distance, 50);
  });

  it("restart clears distance, stacks, coins, and phase", () => {
    let s = createRun();
    s = tickDistance(tickDistance(s));
    s = registerBraveNearMiss(s, "a");
    s = collectCoin(s);
    ({ state: s } = die(s));
    s = restart(s);
    assert.equal(s.phase, "running");
    assert.equal(s.distance, 0);
    assert.equal(s.braveStacks, 0);
    assert.equal(s.coins, 0);
    assert.equal(s.braveClaimedObstacleIds.size, 0);
  });

  it("same obstacle only grants one brave stack; cap at DEFAULT_BRAVE_STACKS_CAP", () => {
    let s = createRun();
    s = registerBraveNearMiss(s, "same");
    s = registerBraveNearMiss(s, "same");
    assert.equal(s.braveStacks, 1);
    for (let i = 0; i < 20; i++) s = registerBraveNearMiss(s, `o-${i}`);
    assert.equal(s.braveStacks, DEFAULT_BRAVE_STACKS_CAP);
  });
});
