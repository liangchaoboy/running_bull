# XBuilder 对齐笔记：全地图短冲刺加速 ⚡

> **顺序**：先在 XBuilder 粘贴本包并 **Publish** 同链 → 再硬刷 mobile-web `?v=boost1`。  
> 粘贴总览：`docs/xb_patches/boost/APPLY_BOOST.md`（工作区 `/workspace/xb_src/patches/boost/`）

## 一句话

**点按短冲刺**（非长按常驻）：约 **1 秒** `runSpeed × 1.45`，结束后 **2.5 秒 CD**；每局限 **3 次**。全地图同一套，飞机模式手感为「后喷」。

## 为什么不用长按

障碍密度按常速排；常驻加速会又难又飘。短爆发 + CD + 换道软化，操控性优先。

## 参数表

| 项 | 值 |
|----|-----|
| 触发 | 键 **X**（点按）；手机触控 **⚡** |
| 爆发时长 | **1.0 s** |
| 倍率 | **×1.45**（叠在各地图基础 `runSpeed` 上） |
| CD | **2.5 s**（爆发结束后起算） |
| 充能 | **3 / 局**；开局重置；可选日后广告补次数（`boostrefill` stub） |
| 软锁 | 触发瞬间 `inputLock = 0.1` |
| 换道 | 爆发中 snap **0.48**（常态 ~0.88） |
| 飞机 mapId7 | 同规则；toast「后喷!」；扫射/多击/弯道不变 |
| 其它地图 | 土路/夜/林/空/慢慢/植物同规则；toast「加速!」 |

## 不破坏

- feel1：撞到了 → 软跳过 → 再跳过结算；擦边勇敢
- 植物道具 / 森林弯道 / 悬空景深
- 飞机默认扫射与 HP 表

## 操作

| 输入 | 效果 |
|------|------|
| **X** | 短冲刺（有充能且非 CD / 非爆发中） |
| ⚡ 触控 | 同 X |
| ←→ / 跳 / 滑 / B / 无敌 I·V·Q | 不变 |

## XBuilder 粘贴清单

1. Stage：`stage_boost.snippet.spx`（vars / forever / KeyX / boot）
2. 三英雄：`hero_boost.snippet.spx`（snapK / onMsg boost / 菜单文案）
3. Publish 同链 `running_bull`

## mobile-web 对照

| 项 | 值 |
|----|-----|
| 缓存 | `?v=boost1` |
| 键 | `x` / `X` |
| HUD | ⚡ 充能 / 爆发剩余秒 / CD 提示 |
| 触控 | `#btn-boost` |

## 验收

- [ ] 任意地图 X → 加速感约 1s → 需等 CD 再按
- [ ] 三连冲刺后本局耗尽；再开一局恢复 3
- [ ] 爆发中换道不甩飞
- [ ] 飞机后喷 + 扫射仍在；撞障仍走激励/结算
- [ ] Publish 后硬刷 `?v=boost1`
