# APPLY · feel2 — 道路 A+B+C · 换道贴轨 · 植物更密更显眼

**Project:** https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull  
**Order:** Stage + heroes + Road size pulse + PlantPickup → **Publish** same share link → hard-refresh `?v=feel2`.

Parent: **computerUse** Publish. If playfix1 Publish still in flight, apply on latest Stage after it lands (`stage_ad.spx` baseline).

---

## Scope (locked)

| # | Item | One-line |
|---|------|----------|
| 道路① | 弯道/左右甩路 | 全图 `curveBend`（森林/飞机更强，慢慢跑最轻）；桥段×1.15、洞段×0.85 |
| 道路② | 路宽起伏+高低纵深 | Road `setSize` ±7% 呼吸；web 另有 `roadWidthMul`+`roadSlopeDy` |
| 道路③ | 分段换景 | 每 ~8s：平原→桥→山洞（web 护栏/洞壁；XB 用 secSlot 调弯幅+Brightness） |
| 转向 | 换道贴轨 | `snapK=0.94`（冲刺 0.58）；约 2～3 帧到位，不飘不甩过头 |
| 植物 | 更显眼+更密 | 间隔 1.35s、boot 0.35；Pickup ×1.35+吃到××；前 20s ≥1–2 |

**Intact:** brave stacks · max 1 rewarded continue · 七牛文案 · boost · plane visibility.

---

## A. Stage (`stage_ad.spx`) — already synced in `/workspace/xb_src/stage_ad.spx`

1. Vars: `curveAmp`, `secSlot` (with `curveBend`/`curvePhase`).
2. Curve forever: **all maps** while `running` (not only 3/7); amp by mapId; `secSlot = float64(int(runT/8)%3)`.
3. Plant: `plantT >= 1.35`; boot `plantT = 0.35`.

Optional cave/bridge tint on Stage say or Road Brightness when secSlot 1/2.

## B. Heroes — synced

```
snapK = 0.94
if boostT > 0 { snapK = 0.58 }
if xpos < tx-5 || xpos > tx+5 { setXpos xpos+(tx-xpos)*snapK } else { setXpos tx }
```

## C. Road

While running: `setSize 1.48 * (1 + math.Sin(runT * 0.85) * 0.07)`  
Optional: BrightnessEffect −25 when secSlot==2 (cave), +5 when secSlot==1 (bridge).

## D. PlantPickup (editor)

Find `onMsg "plantcast"`: size ×1.35, pulse, say `吃到向日葵!` / 豌豆 / 加特林 / 坚果.

## E. Publish checklist

- [ ] Stage: all-map curve + secSlot + plant 1.35/0.35
- [ ] Heroes snapK 0.94 / 0.58
- [ ] Road size breathe ±7%
- [ ] PlantPickup larger + 吃到××
- [ ] Smoke: 路左右甩；宽窄起伏；桥/洞段可辨
- [ ] Smoke: 换道干脆
- [ ] Smoke: 植物 20s ≥2 显眼道具
- [ ] Intact brave / 1续跑 / 七牛 / boost / plane
- [ ] **Publish** same share link
- [ ] Hard-refresh `?v=feel2`

## F. Paths

- `/workspace/xb_src/patches/feel2/` · repo `docs/xb_patches/feel2/`
- Web: `mobile-web/?v=feel2`
