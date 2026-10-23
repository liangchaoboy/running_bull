# 开源跑酷参考 → 勇敢牛牛框架映射

> 目的：从可复用的 MIT/Apache 跑酷里**偷手感公式**（跳、生成、擦边、卷轴），写进 `core/` 与 XBuilder 变量，**不搬美术、不整仓克隆**。  
> 可玩 Demo 仍在 XBuilder；本文与 `core/physics|spawn|nearMiss` 给重建参数用。

---

## 1. 短名单（5 个）

| # | 仓库 | 许可 | 偷什么 |
|---|------|------|--------|
| 1 | [shifulegend/spike-sprint](https://github.com/shifulegend/spike-sprint) | MIT | **主参考**。单文件 Canvas；`BASE_SPEED=6`；`GRAVITY=0.85`；点按 `MIN_JUMP_V=-9` / 长按至 `MAX_JUMP_V=-16.5`（320ms）；生成间隔随 `speedMult` 缩短 |
| 2 | [misterpaul4/Demon-Runner](https://github.com/misterpaul4/Demon-Runner) | MIT | Phaser+TS；`coyoteMs=110`、`jumpBufferMs=130`；`spawn.grazeRadius=64`；速度 `360→760` 按距离爬坡 |
| 3 | [chigerartem/pixel-horse-runner](https://github.com/chigerartem/pixel-horse-runner) | MIT | Chrome Dino 味；`JUMP_V=-11.5`、`GRAVITY=0.62`、长按加成；**碰撞 inset=4**；速度 `6→13` |
| 4 | [goplus/spx](https://github.com/goplus/spx) | Apache-2.0 | XBuilder 同族引擎；学事件/角色模型，不是具体跑酷数值 |
| 5 | [Efthymiapp/Cave_Surfing_Game_Scratch](https://github.com/Efthymiapp/Cave_Surfing_Game_Scratch) | （未标 SPDX；Scratch 项目） | 每 ~4s 刷障、开局宽限期——对应我们「等待秒数」生成，不当数值权威 |

另：GPL 的 pixel-run 等**不**引入代码，只可作玩法观察。

---

## 2. 选定主参考：**Spike Sprint**

理由：单文件、MIT、零依赖，跳跃/速度/刷怪公式一眼能抄进 Scratch 变量；比 Phaser 整仓轻，比纯 Scratch 项目数值更清楚。

**不抄：** 像素画、刺桶追击、坑与灌木关卡美术。  
**只抄：** 点按/长按跳曲线、基础卷轴速度、随速度缩短的刷怪间隔、落地音效时机（XBuilder 用「广播」代替即可）。

---

## 3. 映射到本仓库 `core/`

| 参考概念 | Spike / Demon / Horse | 本仓 API | XBuilder 变量/事件 |
|----------|----------------------|----------|-------------------|
| 起跳初速 | Spike tap \|vy\|=9 | `DEFAULT_JUMP_V=11`（+y 向上） | `jumpV` |
| 重力 | Spike 0.85 | `DEFAULT_GRAVITY=0.95` | `gravity` |
| 长按跳 | min9→max16.5 / 320ms | `variableJumpReleaseVy` · `jumpVMin/Max` · `jumpHoldMs` | 可选：记录按下时长再松手改 `vy` |
| 土狼时 / 缓冲 | Demon 110ms / 130ms | `canCoyoteJump` · `shouldBufferJump` | `coyoteFrames=4` · `bufferFrames=6` |
| 卷轴速度 | Spike BASE 6 | `runSpeedStart=6` → `runSpeedMax=10` | `runSpeed`；每秒用 `runSpeedAt(elapsed)` 思路更新 |
| 刷怪间隔 | Spike 帧公式 | `nextSpawnIntervalSec` · `LEVEL_1_GAPS_SEC` | 优先 LEVEL_1 等待表；无尽段用随机间隔 |
| 擦边几何 | Horse inset；Demon grazeRadius | `classifyContact` · `obstacleZones` | 危险盒 inset≈4；勇敢带 pad≈10；`alreadyBrave` |
| 结算倍率 | （自有） | `grazeTick` · `scoring` | 不变：`braveStacks` → 倍率 |

---

## 4. 推荐 XBuilder 参数表（重建 Demo 用）

> 坐标系：Scratch/spx 常见 **y 向上为正**；`vy` 起跳为正，每帧 `vy -= gravity`，`y += vy`。

| 变量 | 旧值 | **新推荐** | 备注 |
|------|------|------------|------|
| `runSpeed` | 8 | **6** 起，36s 内爬到 **10** | 前 8 秒可读 |
| `jumpV` | 12 | **11** | 固定点按；手感贴 Spike tap |
| `gravity` | 0.8 | **0.95** | 少飘、落地更快 |
| `jumpVMin` / `jumpVMax` | — | **9 / 15** | 仅当做成长按跳 |
| `holdMsMax` | — | **300** | 对应 Spike 320ms |
| `coyoteFrames` | 0 | **4** | 边缘仍可跳，减「手感钝」 |
| `bufferFrames` | 0 | **6** | 落地前预输入 |
| 危险盒 inset | 0 | **4** | 减少「看起来没撞却死」 |
| 勇敢带 pad | 8～12 | **10** | `classifyContact === graze` |
| 障碍间隔 | LEVEL_1 表 | **保持 LEVEL_1** | 无尽段 1.2～2.5s |

落地检测：`y ≤ groundY` → `y=groundY`，`vy=0`，`onGround=true`；若 `framesSinceGround ≤ coyoteFrames` 仍允许起跳。

输入：空格 **与** 舞台点击都绑「起跳」；按下置 `jumpPressedFrame`，落地时若 `shouldBufferJump` 则自动再跳一次。

---

## 5. 验收（本地）

```bash
npm test   # physics / spawn / nearMiss + 原有 scoring 全绿
```

XBuilder 侧由并行任务按上表改变量后 Publish；**本文不声称编辑器已改完**。

---

## 6. 相关文件

- `core/physics.ts` · `core/spawn.ts` · `core/nearMiss.ts`
- `docs/SPX_BUILD_NOTES.md` § 调参
- `docs/LEVEL_1.md` § 调参口诀（已对齐新速度）
- `docs/GAME_DESIGN.md`（规则仍权威；数值以本文推荐表为准做手感迭代）
