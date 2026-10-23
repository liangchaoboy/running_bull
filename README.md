# 勇敢牛牛，天天跑酷

> **勇敢牛牛，不怕困难。**  
> 公司 1024 活动 · XBuilder / spx 强制作品 · 作者 [@liangchaoboy](https://github.com/liangchaoboy)

**试玩链接：** （待 Publish 后替换）  
**仓库：** https://github.com/neikochan/running_bull  
**引擎：** [XBuilder](https://x.qiniu.com)（基于 spx / Scratch 思维的创作平台）

---

## 这是什么

一款 **1 天可做出 Demo、1 天可做引流叙事** 的竖屏/网页跑酷小游戏：

- 牛自动向前跑，空格或点击跳跃躲障碍  
- **距离分** + **勇敢倍率**（贴障碍擦边 +1，倍率叠乘分数）  
- 死亡文案固定梗：「勇敢牛牛，不怕困难」+ 本局最勇瞬间  
- 欢迎 **Remix**：换皮肤、改关卡、换 BGM，做成二创关合集

空仓库不是终点——**可玩的 Publish 链接**才是传播件。本 README 在 Publish 后把上方占位换成正式 URL。

---

## 玩法（30 秒上手）

| 操作 | 效果 |
|------|------|
| 自动 | 牛持续向右（或向前）跑 |
| 空格 / 点击舞台 | 跳跃 |
| 擦边障碍 | 「勇敢」+1，倍率上升 |
| 撞障碍 | 结算：距离 × 勇敢倍率 |

详见 [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md)、[`docs/LEVEL_1.md`](docs/LEVEL_1.md)。

---

## 评委 3 分钟演示（摘要）

1. **开场（20s）**：喊口号 → 打开 Publish 链接 →「不是 PPT，是能玩的」  
2. **玩（60s）**：跑前 15 秒安全区 → 故意擦边叠倍率 → 再撞一次死，弹出死亡文案  
3. **倍率（40s）**：指结算字段：距离、勇敢层数、最终分、挑战卡  
4. **Remix（40s）**：现场或录屏点 Remix → 换一件皮肤 / 挪一个障碍 →「UGC 就是增长」  
5. **变现叙事（20s）**：比赛版讲「创作工具样板 + 日种子关 + 品牌皮」；不硬吹 IAP  

完整口述稿：[`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)。  
XBuilder 搭建笔记：[`docs/SPX_BUILD_NOTES.md`](docs/SPX_BUILD_NOTES.md)。  
Demo 阻塞与验收：[`docs/XB_DEMO_BLOCKERS.md`](docs/XB_DEMO_BLOCKERS.md)。

---

## 如何 Remix

1. 打开试玩链接（Publish 后）  
2. 在 XBuilder 点 **Remix / 改编**（以平台实际按钮文案为准）  
3. 建议改这三样之一即可发朋友圈：  
   - 牛的造型（赛博牛 / 七牛主题皮）  
   - 第一关障碍节奏（见 `docs/LEVEL_1.md`）  
   - 死亡音效或结算文案  
4. 发布时打标签：`#1024` `#勇敢牛牛` `#XBuilder`  
5. 把你的链接丢回本仓库 Issue 或飞书群，官方可收进「精选关」

邀请文案模板：[`growth/REMIX_INVITE.md`](growth/REMIX_INVITE.md)。

---

## Day1 / Day2 资产包

| 路径 | 用途 |
|------|------|
| `docs/GAME_DESIGN.md` | 最小玩法与结算字段 |
| `docs/LEVEL_1.md` | 第一关障碍节奏表 |
| `docs/DEMO_SCRIPT.md` | 评委 3 分钟口述稿 |
| `docs/SPX_BUILD_NOTES.md` | XBuilder / spx 搭建伪代码 |
| `growth/CHALLENGE_CARD.md` | 可复制挑战卡 |
| `growth/SHORT_VIDEO_SCRIPTS.md` | 3 条竖屏分镜 |
| `growth/REMIX_INVITE.md` | 飞书/微信群邀请文案 |
| `growth/MONETIZATION.md` | 变现三叙事 + 投流决策树 |
| `growth/MONETIZATION_PLAN.md` | 落地变现计划（主推叙事 / P0–P3 / 话术） |
| `growth/COMMERCIAL_RESEARCH.md` | 商业调研计划（快访 / 止损 / 一页结论） |
| `growth/WORKSHOP_OUTLINE.md` | 2h XBuilder 跑酷工作坊大纲（P0，不接支付） |
| `growth/METRICS.md` | 手记指标表 |
| `docs/XB_DEMO_BLOCKERS.md` | XBuilder Demo 阻塞清单与验收 |

---

## 指标（看什么算赢）

手记字段见 [`growth/METRICS.md`](growth/METRICS.md)。核心看：

- **试玩 UV**（Publish 页打开人数）  
- **完整体验率**（至少死 1 次并看到结算）  
- **Remix 数**  
- **挑战卡复制/转发次数**（群里口头统计即可）  
- **日种子关参与**（若 Day2 加上「每日一关」文案）

---

## 品牌与授权

- 品牌句：**勇敢牛牛，天天跑酷**  
- 死亡强记忆句：**勇敢牛牛，不怕困难**  
- 本仓库内容供 1024 活动演示与传播；素材请遵守 XBuilder / 七牛云平台条款  

---

## 作者

- GitHub：[@liangchaoboy](https://github.com/liangchaoboy)  
- 项目仓库：[neikochan/running_bull](https://github.com/neikochan/running_bull)

**下一步：** 按 `docs/SPX_BUILD_NOTES.md` 在 XBuilder 搭完第一关 → Publish → 把本页试玩链接占位换成正式 URL → 按 `growth/` 开 Day2 引流。

---

## 本地逻辑测试（打分核心）

可玩 Demo 仍在 **XBuilder**；本仓库额外提供纯逻辑打分核心，便于 CI / 本地校验结算公式。

```bash
npm install
npm test
```

- 源码：`core/`（距离分、勇敢倍率、擦边回执、金币加分默认值、死亡冻结、再玩重置）
- 指标辅助：`core/metrics.ts`（`challenge_cards / try_uv_est`，阈值 30%）
- 挑战卡 / 日种子：`core/challengeCard.ts`、`core/dailySeed.ts`、`core/graze.ts`
- 公式对齐：`docs/GAME_DESIGN.md`；金币加分为实现默认值，见 `core/defaults.ts`
