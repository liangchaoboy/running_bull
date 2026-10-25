# feel2 NOTES — 道路 A+B+C · 换道 · 植物

**Time:** 2026-10-25 Asia/Shanghai (CST)  
**Auth:** Vincent via 资深小游戏玩家（道路方向终版：A+B+C 全做）  
**Play URL:** https://liangchaoboy.github.io/running_bull/mobile-web/?v=feel2

## Status

| Track | Status |
|-------|--------|
| XBuilder patches | Ready `/workspace/xb_src/patches/feel2/` + `stage_ad.spx` / heroes synced — **Publish pending** (parent computerUse) |
| mobile-web | Implemented · push this turn |

## One-liners (required)

| Item | One-line |
|------|----------|
| 道路① 弯道/左右甩路 | 全模式 `curveDx`（森林/飞机最强，慢慢跑最轻）；桥段弯幅×1.15、山洞×0.85；XB 全 mapId `curveBend` |
| 道路② 路宽起伏+高低纵深 | `roadWidthMul` ±11% 近端呼吸 + `roadSlopeDy` 坡度起伏；桥略窄抬升、洞略收窄；XB Road `setSize` ±7% |
| 道路③ 分段换景 | 每 160 距：平原→**桥**（护栏）→**山洞**（岩壁+暗角）；顶栏「桥/山洞」；XB `secSlot` 每 ~8s |
| 转向 | `LANE_SNAP=0.92` / `LANE_LERP=70`（冲刺 0.55/36）；贴轨瞬切约 2～3 帧，不飘不甩过头 |
| 植物 | Pickup 体型 72+光晕描边+名签；间隔≈2s 且前 20s 保底 1–2；飘字「吃到××」；XB plantT 1.35 / boot 0.35 |

## Intact

playfix1 brave stacks · max 1 rewarded continue · 七牛🐮 ad copy · boost · plane visibility fix

## Expected steer feel

换道贴轨瞬切：按下后约 2～3 帧到位，余滑极短，不飘、不甩过头。

## XB APPLY

`/workspace/xb_src/patches/feel2/APPLY_FEEL2.md`  
Repo mirror: `docs/xb_patches/feel2/`

## Smoke

- [ ] 跑起来路明显左右甩（非直线刷障）
- [ ] 路宽张合 + 轻微高低
- [ ] 出现「桥」护栏与「山洞」岩壁段
- [ ] 换道干脆不飘
- [ ] 植物模式 20s 内 ≥2 个发光大道具，吃到有「吃到××」
- [ ] brave / 1 次续跑 / 七牛 / 冲刺 / 飞机可见

## SHA / ?v=

_(filled after push)_
