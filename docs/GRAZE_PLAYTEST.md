# 擦边目视验收清单（N2）

> 用途：解除 [`XB_DEMO_BLOCKERS.md`](XB_DEMO_BLOCKERS.md) **N2**——单次 playtest 目视确认「勇敢」擦边反馈。  
> 不改玩法；只记看到什么。日期：2026-10-27 上午 Asia/Shanghai。

## 试玩入口

| 端 | URL |
|----|-----|
| 桌面 XB | https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull |
| 手机 Pages（备用） | https://liangchaoboy.github.io/running_bull/mobile-web/?v=road5 |

建议：桌面先 XB；手机另开一局对照 toast。

## 3 局怎么玩

1. **局 1 · 稳跑**：前 15s 只跳/换道，不贴障 → 确认「勇敢」仍为 0（或无「擦边!」toast）。
2. **局 2 · 故意擦边**：邻道障碍掠过或本道换道未贴齐时贴着障碍擦 → 应见 **「擦边!」或「勇敢!」** toast，且勇敢层数 / 金币有可见变化（同障碍只计 1 次）。
3. **局 3 · 撞死对照**：故意撞危险盒 → 结算四字段（距离 / 勇敢 / 倍率或得分 / 梗句）可读；再玩可重置。

## PASS / FAIL（勾一项）

| 项 | PASS 条件 | 结果 |
|----|-----------|------|
| T1 toast | 3 局内至少 1 次看见「擦边!」或「勇敢!」 | ⏳ |
| T2 同障一次 | 同一障碍连续擦不重复叠层 | ⏳ |
| T3 结算 | 有擦边局结算勇敢 ≥1，或分数明显高于无擦边局 | ⏳ |
| T4 撞死 | 撞障有结算面板 +「勇敢牛牛，不怕困难」 | ⏳ |

- **全 PASS** → 把本表结果抄进 `XB_DEMO_BLOCKERS.md` N2 ✅，并勾 DEMO 验收「擦边反馈」。  
- **任一 FAIL** → 记：哪一端（XB / Pages）、哪一局、缺什么反馈；下一半日只修这一项。

## 记录区（填完可删本段占位）

- 日期 / 谁测：  
- 端：XB / Pages  
- 截图或一句现象：  
- 结论：PASS / FAIL + 最痛 1 句  

逻辑对照：`core/graze.ts`、`core/nearMiss.ts`（`npm test` 26/26）；设计：[`GAME_DESIGN.md`](GAME_DESIGN.md) §5；feel1 接线：[`FEEL1_H_EDGE_SPACE.md`](FEEL1_H_EDGE_SPACE.md)。
