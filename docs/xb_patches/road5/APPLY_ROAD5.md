# APPLY · road5 — 洞实心岩壁 + 平路甩弯（road4 洞/弯 FAIL）

**Project:** https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull  
**Order:** Stage + heroes + Road → **Publish** same share link → hard-refresh `?v=road5`.

Parent: **computerUse** Publish after paste. Baseline = road4 Stage (`stage_ad.spx`).

**Do not touch:** BGM Bravery Run / mute · LANE snap · plant cadence · playfix1 · boost · ui1（无道具钮）· bridge rise feel.

---

## Why road4 failed

实机（泥土）：洞=绿肩+黑空、pinch 不够；弯=平路近场几乎直（靠桥窄堤衬弯）。桥/上桥坡 PASS。  
road5：**平路 amp 拉满 + 近端 z^2 甩**；XB 侧靠更大 curveAmp / lean / cave Brightness+size pinch（web 才有岩壁多边形）。

## Scope (locked)

| # | Item | One-line |
|---|------|----------|
| 弯道 | amp **~1.5×** road4 | **plain** 甩弯抢过换道；桥 mul 保持 1.45 |
| 坡度 | Camera Y：桥 +28 保持；洞 **−38**（原 −30） | 洞下沉 +1 档 |
| 山洞 | Brightness **−85** + size **1.10** | 更暗更窄；说「进入山洞」可选 |
| 桥 | size 1.38 / Brightness +16 | **keep**（PASS） |

**Intact:** snapK 0.94/0.58 · plant · Bravery Run BGM · brave / 1续跑 / boost / plane · ui1.

---

## A. Stage (`stage_ad.spx`) — mirror `/workspace/xb_src/stage_ad.spx`

Replace road4 curve/bob block with **`stage_road5.snippet.spx`**:

| map | road4 amp | **road5** |
|-----|----------:|----------:|
| default/dirt | 88 | **130** |
| forest (3) | 125 | **185** |
| plane (7) | 118 | **175** |
| chill (5) | 58 | **85** |
| plant (6) | 80 | **118** |
| space (4) | 74 | **110** |
| plain / bridge / cave mul | 1 / 1.45 / 1.08 | **1.12 / 1.45 / 1.12** |
| slopeBob | Sin*38 +28/−30 | **Sin*38 +28/−38** |

Keep `broadcast "secbridge"` / `"seccave"` on slot change.

## B. Heroes (cow / deer / dog)

```
tx = tx + curveBend*0.88   # was *0.62 (road4) / *0.42 (road3)
```
Keep snapK 0.94 / boost 0.58. Keep sec say handlers (optional UX).

## C. Road (editor forever)

See `Road_road5.snippet.spx`:
- cave Brightness **−85** (was −72)
- bridge Brightness **+16** (keep)
- size: plain 1.48 · bridge 1.38 · cave **1.10** (harder pinch)

## D. Publish checklist

- [ ] Stage: road5 amps + Camera bob（洞 −38）+ sec broadcast
- [ ] Heroes: curveBend*0.88 + sec say
- [ ] Road: Brightness −85 / +16 + size cave 1.10
- [ ] Smoke: **平路**弯道甩弯比换道抢眼（不靠桥）
- [ ] Smoke: 进洞更暗更窄；拱/路心暗；下沉略强
- [ ] Smoke: 桥抬升/观感与 road4 同档
- [ ] Intact: BGM / mute / snap / plant / boost / 无道具钮
- [ ] **Publish** same share link
- [ ] Hard-refresh web `?v=road5`

## E. Paths

- `/workspace/xb_src/patches/road5/` · repo `docs/xb_patches/road5/`
- Web: `mobile-web/?v=road5`
- Notes: `docs/ROAD5_NOTES.md`

**Do NOT git push from apply agent** — parent publishes XB then pushes web.
