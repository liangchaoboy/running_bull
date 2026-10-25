# APPLY · road4 — 桥/洞/弯/坡肉眼一秒可读（road3 实机不及格）

**Project:** https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull  
**Order:** Stage + heroes + Road → **Publish** same share link → hard-refresh `?v=road4`.

Parent: **computerUse** Publish after paste. Baseline = road3 Stage (`stage_ad.spx`).

**Do not touch:** BGM Bravery Run / mute · LANE snap · plant cadence · playfix1 · boost · ui1（无道具钮）.

---

## Why road3 failed

实机（泥土）：桥=细栏杆+远阴影；洞=远拱+角暗、路心仍亮；弯=近场几乎直；坡≈无感。  
road4 **不靠字/细栏杆**：窄堤+桥下空隙、实心近场岩壁+全隧压暗、近场大甩弯、坡 bob ≥3× feel2。

## Scope (locked)

| # | Item | One-line |
|---|------|----------|
| 弯道 | amp **~3×** feel2 | default/dirt 甩弯抢过换道；近端 depth 更尖 |
| 坡度 | Camera Y bob **≥3×** feel2 | `Sin*38` + 桥 +28 / 洞 −30 |
| 山洞 | Brightness **−72** + size pinch | 路心也暗；说「进入山洞」可选 |
| 桥 | size 略收 + Brightness +16 | 说「过桥」可选；web 才有栏杆/空隙 |

**Intact:** snapK 0.94/0.58 · plant · Bravery Run BGM · brave / 1续跑 / boost / plane · ui1.

---

## A. Stage (`stage_ad.spx`) — mirror `/workspace/xb_src/stage_ad.spx`

Replace road3 curve/bob block with **`stage_road4.snippet.spx`**:

| map | feel2 amp | road3 | **road4** |
|-----|----------:|------:|----------:|
| default/dirt | 28 | 52 | **88** |
| forest (3) | 48 | 78 | **125** |
| plane (7) | 42 | 72 | **118** |
| chill (5) | 18 | 34 | **58** |
| plant (6) | 26 | 48 | **80** |
| space (4) | 24 | 44 | **74** |
| bridge / cave mul | 1.28 / 0.95 | same | **1.45 / 1.08** |
| slopeBob | Sin*11-ish | Sin*22 ±14/16 | **Sin*38 +28/−30** |

Keep `broadcast "secbridge"` / `"seccave"` on slot change.

## B. Heroes (cow / deer / dog)

```
tx = tx + curveBend*0.62   # was *0.42 (road3) / *0.25 (feel2)
```
Keep snapK 0.94 / boost 0.58. Keep sec say handlers (optional UX).

## C. Road (editor forever)

See `Road_road4.snippet.spx`:
- cave Brightness **−72** (was −48)
- bridge Brightness **+16** (was +10)
- size: plain 1.48 · bridge 1.38 · cave **1.22** (pinch)

## D. Publish checklist

- [ ] Stage: road4 amps + Camera bob + sec broadcast
- [ ] Heroes: curveBend*0.62 + sec say
- [ ] Road: Brightness −72 / +16 + size pinch
- [ ] Smoke: 默认/泥土弯道甩弯比换道抢眼
- [ ] Smoke: 桥抬升 / 洞下压 地平线肉眼可见
- [ ] Smoke: 进山洞明显全暗（路心也暗）；过桥有抬感
- [ ] Intact: BGM / mute / snap / plant / boost / 无道具钮
- [ ] **Publish** same share link
- [ ] Hard-refresh web `?v=road4`

## E. Paths

- `/workspace/xb_src/patches/road4/` · repo `docs/xb_patches/road4/`
- Web: `mobile-web/?v=road4`
- Notes: `docs/ROAD4_NOTES.md`

**Do NOT git push from apply agent** — parent publishes XB then pushes web.
