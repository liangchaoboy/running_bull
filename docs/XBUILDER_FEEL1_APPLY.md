# APPLY · feel1 — H 结算 / 擦边 / 撞到了 / 悬空景深

**Project:** https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull  
**Order:** XBuilder paste → **Publish** same share link → then hard-refresh mobile-web `?v=feel1` (web already pushed or pending).

Parent agent: use **computerUse** for Publish. This pack is paste-ready.

---

## A. Stage — rewarded skip → 结算 + 「撞到了」copy

**File to edit:** Stage code (align with `/workspace/xb_src/stage_ad.spx`).

1. Add var: `adSkipCount float64` next to `adSkip` / `adT` / `adLine`.
2. On `boot` and `menu` and start-of-run resets: set `adSkipCount = 0` wherever you already reset `adOn` / `adSkip`.
3. Paste logic from `stage_feel1_reward_over.snippet.spx`:
   - `onMsg "hit"` → `adLine = "撞到了！\n看完广告越过障碍\n按2跳过 · 再按2结算"`
   - `Key2` first press: soft skip (stay `adOn`, obstacle remains, line「已跳过…再按2认栽结算」)
   - `Key2` while already skipped **or** `adSkipCount >= 2`: `over = true`, `broadcast "gameover"`
   - Watch complete (adT≥2, not skipped): `adSkipCount = 0`, grant shield as today
   - `Key1` while soft-skipped: restart 2s watch (unchanged intent)
4. HUD / say sprite that shows `adLine` must display the new strings (no code change if it already binds `adLine`).

**Do not** make every hit instant game over — first path remains rewarded watch.

---

## B. Optional 擦边 telegraph

1. Read `near_miss_brave.snippet.spx`.
2. Smallest slice: when obstacle passes **adjacent lane** near hero without touch → `say "擦边!"` / `"勇敢!"` + `brave += 1` (or +small score).
3. No lane snap / physics change.

---

## C. 悬空 mapId 4 depth

1. Follow `space_depth_map4.notes.md`.
2. After Publish, run DEPTH_FEEL_SCORECARD on **悬空** only; target ≥24, no item ≤2.

---

## D. Publish checklist (computerUse)

- [ ] Stage vars + hit/Key1/Key2/forever ad block pasted
- [ ] Soft skip once → still blocked; second skip / 认栽 → `#over` / gameover screen with score + 再玩
- [ ] adLine contains **撞到了**
- [ ] (Optional) 擦边 toast once in a short run
- [ ] mapId 4: stronger taper / star layers / size-by-z
- [ ] Hero lock rotation unchanged
- [ ] **Publish** same share link (running_bull)
- [ ] Smoke: forest still ≥24 depth; plant/chill/invuln unchanged

---

## E. Web alignment

| Item | mobile-web |
|------|------------|
| Cache | `?v=feel1` |
| Skip→over | 2 skips without completing ad → `gameOver` / `#over` |
| Copy | title/hint **撞到了！看完广告越过障碍** |
| Near-miss | adjacent / lateral graze → 「擦边!」/「勇敢!」+1 coin |
| Space | tighter far half, layered stars, stronger side crystal rush |

If XB not Published yet: web still ships; NOTES say「对齐 XB 同向；请父代理先 Publish」.

---

## F. Snippet paths

- `/workspace/xb_src/patches/stage_feel1_reward_over.snippet.spx`
- `/workspace/xb_src/patches/near_miss_brave.snippet.spx`
- `/workspace/xb_src/patches/space_depth_map4.notes.md`
- `/workspace/xb_src/patches/APPLY_H_EDGE_HIT_SPACE.md` (this file)
- Full stage reference: `/workspace/xb_src/stage_ad.spx` (merge feel1 into editor Stage)
