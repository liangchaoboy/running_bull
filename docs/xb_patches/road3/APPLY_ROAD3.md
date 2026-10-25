# APPLY · road3 / feel3 — 弯道/坡度/山洞可读性（可见增强）

**Project:** https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull  
**Order:** Stage + heroes + Road → **Publish** same share link → hard-refresh `?v=road3`.

Parent: **computerUse** Publish after paste. Baseline = feel2+bgm1 Stage (`stage_ad.spx`).

**Do not touch:** BGM / mute · LANE snap · plant cadence · playfix1 · boost.

---

## Scope (locked)

| # | Item | One-line |
|---|------|----------|
| 弯道 | amp **~1.8×** feel2 | default/dirt 明显甩；森林更高；近端 depth 夸张 |
| 坡度 | Camera Y bob **~2×+** | 地平线明显起伏；桥偏高、洞偏低 |
| 山洞 | Brightness **−45**+ | 更暗；进段 `say「进入山洞」`；桥 `say「过桥」` |
| 桥 | 护栏略加粗 | Road Brightness +10；web 栏杆加厚 |

**Intact:** snapK 0.94/0.58 · plant 1.35/0.35 · 国风 BGM · brave / 1续跑 / boost / plane.

---

## A. Stage (`stage_ad.spx`) — mirror `/workspace/xb_src/stage_ad.spx`

1. Vars (add): `prevSecSlot float64`, `slopeBob float64`
2. Replace feel2 curve amp block with **road3** (see `stage_road3.snippet.spx`):
   - default `curveAmp = 52` (was 28)
   - mapId3 forest `78` (was 48)
   - mapId7 plane `72` (was 42)
   - mapId5 chill `34` (was 18)
   - mapId6 plant `48` (was 26)
   - mapId4 space `44` (was 24)
   - bridge `*1.28` / cave `*0.95`
3. On `secSlot` change → `broadcast "secbridge"` / `"seccave"`
4. While running: Camera Y bob (slope):
   ```
   slopeBob = math.Sin(runT * 1.05) * 22
   if secSlot == 1 { slopeBob = slopeBob + 14 }
   else if secSlot == 2 { slopeBob = slopeBob - 16 }
   Camera.setXYpos 0, 75 + slopeBob
   ```
   When not running: `Camera.setXYpos 0, 75`

## B. Heroes (cow / deer / dog)

```
tx = tx + curveBend*0.42   # was *0.25 — more visible lane whip
```
Keep snapK 0.94 / boost 0.58.

Add:
```
onMsg "secbridge" => { say "过桥", 1.2 }
onMsg "seccave" => { say "进入山洞", 1.2 }
```

## C. Road (editor forever)

```
if running {
  setSize 1.48 * (1 + math.Sin(runT * 0.85) * 0.10)
  if secSlot == 2 {
    setGraphicEffect BrightnessEffect, -48
  } else if secSlot == 1 {
    setGraphicEffect BrightnessEffect, 10
  } else {
    setGraphicEffect BrightnessEffect, 0
  }
} else {
  setSize 1.48
  setGraphicEffect BrightnessEffect, 0
}
```

## D. Publish checklist

- [ ] Stage: road3 amps + Camera bob + sec broadcast
- [ ] Heroes: curveBend*0.42 + sec say
- [ ] Road: Brightness −48 / +10 + size ±10%
- [ ] Smoke: 默认/泥土弯道肉眼可见甩
- [ ] Smoke: 地平线明显起伏；桥高洞低
- [ ] Smoke: 进山洞明显变暗 + 「进入山洞」；过桥说「过桥」
- [ ] Intact: BGM / mute / snap / plant / boost
- [ ] **Publish** same share link
- [ ] Hard-refresh web `?v=road3`

## E. Paths

- `/workspace/xb_src/patches/road3/` · repo `docs/xb_patches/road3/`
- Web: `mobile-web/?v=road3`
- Notes: `docs/ROAD3_NOTES.md`
