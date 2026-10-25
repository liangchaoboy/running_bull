# 勇敢牛牛，天天跑酷

> **勇敢牛牛，不怕困难。**  
> 一款可贴障碍擦边叠倍率的网页跑酷小游戏 · 作者 [@liangchaoboy](https://github.com/liangchaoboy)

**试玩链接（XBuilder / 桌面）：** [https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull](https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull)  

> ⚠️ XBuilder 发布页**不适合手机微信**。手机请用下方「手机网页版」。
>
> 2026-10-25：手机网页版新增 **慢慢跑酷**（积分主看存活时长）。XBuilder 对齐笔记：[`docs/XBUILDER_CHILL_MODE.md`](docs/XBUILDER_CHILL_MODE.md)（仓库无 XBuilder 工程，未能在此 Publish）。
>
> 另：mobile-web 已加 **无敌冲撞 ×3**（10 秒撞碎）。见 [](docs/XBUILDER_INVULN.md)。

### 手机网页版（微信可部署）

静态 H5，目录 [`mobile-web/`](mobile-web/)：

```bash
cd mobile-web && python3 -m http.server 8080
# 打开 http://127.0.0.1:8080/
```

- 竖屏三道 · 触控换道 / 跳 / 炸弹 · 捡金币  
- 说明与托管建议见 [`mobile-web/README.md`](mobile-web/README.md)  
- GitHub Pages（已开，备用）：[https://liangchaoboy.github.io/running_bull/mobile-web/](https://liangchaoboy.github.io/running_bull/mobile-web/) — **国内微信常慢/打不开，勿当主入口**
- 正式公网 URL 请部署到七牛 Kodo/CDN、Gitee Pages 或自有域名后补在此处

**仓库：** https://github.com/liangchaoboy/running_bull  
**引擎：** [XBuilder](https://x.qiniu.com)（基于 spx / Scratch 思维的创作平台）

公开简介见 [`docs/GAME_INTRO.md`](docs/GAME_INTRO.md)。

---

## 这是什么

**勇敢牛牛，天天跑酷** 是一款竖屏/网页跑酷小游戏：牛自动向前跑，你负责跳跃躲障；贴障碍擦边可叠「勇敢」倍率，最终得分 = 距离 × 倍率。

- 开局可选角色（牛牛 / 小鹿 / 小狗）与地图（白天 / 夜晚 / 森林）  
- **距离分** + **勇敢倍率**（贴障碍擦边 +1，倍率叠乘分数）  
- 死亡文案固定梗：「勇敢牛牛，不怕困难」  
- 欢迎 **Remix**：换皮肤、改关卡、换 BGM，做成二创关合集  

打开上方试玩链接即可开跑；本仓库还附带玩法文档与本地打分逻辑测试。

---

## 玩法（30 秒上手）

当前 Demo 为**面对屏幕**三道跑酷（参考地铁跑酷纵深感）：路在中间冲向你，障碍从上往下。

| 操作 | 效果 |
|------|------|
| 自动 | 道路/障碍冲向镜头，角色在下端三道奔跑 |
| 空格 / 点击 | 起跳 |
| ←→ / A/D（或点偏左/偏右） | 左 / 中 / 右换道 |
| 擦边障碍 | 「勇敢」+1，倍率上升 |
| 撞障碍 | 结算：距离 × 勇敢倍率 |
| 开局 `1` `2` `3` | 选角色（牛牛 / 小鹿 / 小狗） |
| 开局 `4` `5` `6` | 选地图（白天 / 夜晚 / 森林） |
| `B` | 丢炸弹，清当前道障碍 |
| 捡金币 | 同道重叠收集；计入得分 |

详见 [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md)、[`docs/LEVEL_1.md`](docs/LEVEL_1.md)。手感参数对照：[`docs/PARKOUR_REFERENCE.md`](docs/PARKOUR_REFERENCE.md)。

---

## 3 分钟试玩演示（摘要）

适合录屏、直播或当面带玩：

1. **开场（20s）**：喊口号 → 打开试玩链接 → 选角色/地图开跑  
2. **玩（60s）**：前段稳跳 → 故意擦边叠倍率 → 撞一次，弹出死亡文案  
3. **倍率（40s）**：指结算：距离、勇敢层数、最终分、挑战卡  
4. **Remix（40s）**：点 Remix → 换一件皮肤 / 挪一个障碍  
5. **收束（20s）**：欢迎试玩与二创；挑战卡踢馆  

完整口述稿：[`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)。  
XBuilder 搭建笔记：[`docs/SPX_BUILD_NOTES.md`](docs/SPX_BUILD_NOTES.md)。  
Demo 阻塞与验收：[`docs/XB_DEMO_BLOCKERS.md`](docs/XB_DEMO_BLOCKERS.md)。

---

## 如何 Remix

1. 打开试玩链接  
2. 在 XBuilder 点 **Remix / 改编**（以平台实际按钮文案为准）  
3. 建议改这三样之一即可分享：  
   - 角色造型或皮肤  
   - 第一关障碍节奏（见 `docs/LEVEL_1.md`）  
   - 死亡音效或结算文案  
4. 发布时打标签：`#勇敢牛牛` `#XBuilder` `#跑酷`  
5. 把你的链接丢回本仓库 Issue，可收进「精选关」

邀请文案模板：[`growth/REMIX_INVITE.md`](growth/REMIX_INVITE.md)。

---

## 文档与资产包

| 路径 | 用途 |
|------|------|
| `docs/GAME_INTRO.md` | 对外游戏简介（纯玩法） |
| `docs/GAME_DESIGN.md` | 最小玩法与结算字段 |
| `docs/LEVEL_1.md` | 第一关障碍节奏表 |
| `docs/DEMO_SCRIPT.md` | 3 分钟试玩口述稿 |
| `docs/SPX_BUILD_NOTES.md` | XBuilder / spx 搭建伪代码 |
| `growth/CHALLENGE_CARD.md` | 可复制挑战卡 |
| `growth/SHORT_VIDEO_SCRIPTS.md` | 3 条竖屏分镜 |
| `growth/REMIX_INVITE.md` | 群邀请 / Remix 文案 |
| `growth/MONETIZATION.md` | 变现叙事与投流决策（内部运营） |
| `growth/MONETIZATION_PLAN.md` | 落地变现计划（内部运营） |
| `growth/COMMERCIAL_RESEARCH.md` | 商业调研计划（内部运营） |
| `growth/WORKSHOP_OUTLINE.md` | 2h XBuilder 跑酷工作坊大纲（内部） |
| `growth/METRICS.md` | 手记指标表 |
| `docs/XB_DEMO_BLOCKERS.md` | XBuilder Demo 阻塞清单与验收 |

---

## 指标（看什么算赢）

手记字段见 [`growth/METRICS.md`](growth/METRICS.md)。核心看：

- **试玩 UV**（Publish 页打开人数）  
- **完整体验率**（至少死 1 次并看到结算）  
- **Remix 数**  
- **挑战卡复制/转发次数**  
- **日种子关参与**（若启用「每日一关」）

---

## 品牌与授权

- 品牌句：**勇敢牛牛，天天跑酷**  
- 死亡强记忆句：**勇敢牛牛，不怕困难**  
- 素材请遵守 XBuilder / 平台条款  

---

## 作者

- GitHub：[@liangchaoboy](https://github.com/liangchaoboy)  
- 项目仓库：[liangchaoboy/running_bull](https://github.com/liangchaoboy/running_bull)

**下一步：** 继续打磨跳跃与道路手感；按 `growth/` 做挑战卡与 Remix 传播。

---

## 本地逻辑测试（打分核心）

可玩 Demo 在 **XBuilder**；本仓库额外提供纯逻辑打分核心，便于 CI / 本地校验结算公式。

```bash
npm install
npm test
```

- 源码：`core/`（距离分、勇敢倍率、擦边回执、金币加分默认值、死亡冻结、再玩重置）
- 指标辅助：`core/metrics.ts`（`challenge_cards / try_uv_est`，默认 30%）
- 挑战卡 / 日种子：`core/challengeCard.ts`、`core/dailySeed.ts`、`core/graze.ts`
- 公式对齐：`docs/GAME_DESIGN.md`；金币加分为实现默认值，见 `core/defaults.ts`
