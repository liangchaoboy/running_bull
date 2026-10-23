import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  aabbOverlap,
  classifyContact,
  obstacleZones,
} from "./nearMiss.js";

describe("near-miss geometry", () => {
  const obstacle = { x: 100, y: 0, w: 40, h: 40 };
  const playerClear = { x: 0, y: 0, w: 30, h: 40 };
  const playerGraze = { x: 88, y: 0, w: 30, h: 40 }; // near left edge of expanded band
  const playerHit = { x: 110, y: 5, w: 30, h: 40 };

  it("aabbOverlap basic", () => {
    assert.equal(aabbOverlap(playerClear, obstacle), false);
    assert.equal(aabbOverlap(playerHit, obstacle), true);
  });

  it("brave expands danger; classify clear/graze/hit", () => {
    const { danger, brave } = obstacleZones(obstacle);
    assert.ok(brave.w > danger.w);
    assert.equal(classifyContact(playerClear, obstacle), "clear");
    assert.equal(classifyContact(playerHit, obstacle), "hit");
    // Place player overlapping brave but not danger
    const justOutsideDanger = {
      x: danger.x - 8,
      y: danger.y,
      w: 6,
      h: 20,
    };
    assert.equal(classifyContact(justOutsideDanger, obstacle), "graze");
  });
});
