import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { grazeTick } from "./graze.js";
import { createRun, die } from "./scoring.js";

describe("grazeTick（擦边回执）", () => {
  it("grants once per obstacle with floatText 勇敢 +1！", () => {
    let s = createRun();
    const first = grazeTick(s, "obs-a");
    assert.equal(first.granted, true);
    assert.equal(first.floatText, "勇敢 +1！");
    assert.equal(first.stacksAfter, 1);
    assert.equal(first.multiplierAfter, 2);
    s = first.state;
    const again = grazeTick(s, "obs-a");
    assert.equal(again.granted, false);
    assert.equal(again.floatText, null);
    assert.equal(again.stacksAfter, 1);
  });

  it("no grant after death", () => {
    let s = createRun();
    ({ state: s } = die(s));
    const r = grazeTick(s, "obs-x");
    assert.equal(r.granted, false);
    assert.equal(r.floatText, null);
  });
});
