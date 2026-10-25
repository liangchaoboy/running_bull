# 可玩性评估 · 勇敢牛牛 Demo

> 用途：15 分钟自测 / 给队友同一套打分，判断「能不能当 Demo 演示」。  
> 试玩：[x.qiniu.com · running_bull](https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull)  
> 搭建与数值对照：[`SPX_BUILD_NOTES.md`](SPX_BUILD_NOTES.md) · [`LEVEL_1.md`](LEVEL_1.md) · [`PARKOUR_REFERENCE.md`](PARKOUR_REFERENCE.md) · [`GAME_DESIGN.md`](GAME_DESIGN.md)

---

## 1. 短名单：5 套已知方法

| # | 方法 | 一句话 | 对本项目怎么用 | 来源 |
|---|------|--------|----------------|------|
| 1 | **Playability Heuristics**（Korhonen & Koivisto, 2006） | 手游专家走查：可用性 / 移动场景 / 玩法 三模块 | 查「控制是否直觉、目标是否清楚、挑战是否匹配」 | [ACM](https://dl.acm.org/doi/10.1145/1152215.1152218) · [DOI](https://doi.org/10.1145/1152215.1152218) |
| 2 | **GameFlow**（Sweetser & Wyeth, 2005） | 用心流八要素评享受感：专注、挑战、控制、目标、反馈… | 跑酷重点看 **Control + Feedback + Challenge** | [ACM CIE](https://dl.acm.org/doi/10.1145/1077246.1077253) |
| 3 | **MDA**（Hunicke, LeBlanc, Zubek） | 机制 → 动态 → 美学；改规则先想玩家情绪 | 擦边=机制，名场面=动态，「勇敢」梗感=美学 | [PDF](https://users.cs.northwestern.edu/~hunicke/pubs/MDA.pdf) |
| 4 | **PENS**（Ryan, Rigby, Przybylski） | 能力感 / 自主 / 关联 + 直觉操作 | Demo 期主要看 **Competence + Intuitive Controls**（跳得准、死得服） | [SDT 页](https://selfdeterminationtheory.org/player-experience-of-needs-satisfaction-pens/) · [动机模型](https://journals.sagepub.com/doi/10.1037/a0019440) |
| 5 | **HEART + 微信小游戏运营指标** | Happiness / Engagement / Adoption / Retention / Task success；国内再叠次留、时长、分享率 | 赛后迁端才有量；Demo 期用「愿不愿再开一局 / 愿不愿发挑战卡」代替 | [HEART](https://www.kerryrodden.com/heart/) · [微信小游戏数据](https://developers.weixin.qq.com/minigame/analysis/) · [收入诊断](https://developers.weixin.qq.com/minigame/analysis/income-diagnosis.html) |

补充：传统 **Nielsen 可用性启发**可借「系统状态可见、防错、一致性」三条，但不够覆盖玩法，故以 1–2 为主、3–5 为辅。  
不单独列为「量表」的：**Heuristic Evaluation for Playability (HEP)**（Desurvire 等）——与 Korhonen 同类专家走查，需要时再展开。

---

## 2. 15 分钟检查表（当场打分）

**怎么跑：** 手机打开 Publish → 连开 **3 局**（约 8–12 分钟）→ 剩 3 分钟填表。每项 **1～5**（见 §3）。  
对照设计：前 8 秒钩子与节奏见 [`LEVEL_1.md`](LEVEL_1.md)；跳/擦边/速度见 [`PARKOUR_REFERENCE.md`](PARKOUR_REFERENCE.md)。

| # | 检查项 | 怎么验（可操作） | 对应框架 |
|---|--------|------------------|----------|
| A | **操作延迟** | 点按/空格后，起跳是否「立刻」？有无卡顿、丢输入、连点才跳？ | GameFlow·Control · PENS·Intuitive |
| B | **跳跃公平** | 矮障是否「跳了就过」？有没有明明越过却撞死、或看起来过了还死？危险盒是否明显小于造型？ | Playability·Usability · PENS·Competence |
| C | **前 8 秒钩子** | 开局 8 秒内是否已：看懂只跳、过至少 1 障、想继续？空白过久或秒死都算失败 | LEVEL_1 0–8s · GameFlow·Goals |
| D | **死亡可读** | 撞上后是否立刻停、结算文案一眼懂（距离/勇敢/倍率/得分 +「不怕困难」）？能否一键再玩？ | GameFlow·Feedback · Nielsen·可见状态 |
| E | **擦边反馈** | 贴障而过时，是否有「勇敢 +1」可见反馈（数字/闪白/音效）？3 局内能否至少擦到 1 次？ | MDA·Aesthetics · 设计核心差异 |
| F | **难度爬坡** | 0–20s 可学、20s+ 加压？会不会前几秒就过密，或永远太稀无聊？ | LEVEL_1 分段 · GameFlow·Challenge |
| G | **分数可读** | 局中距离/勇敢是否可见？结算四数是否对齐文案、倍率算得对？ | Playability·UI |
| H | **分享/挑战欲** | 打完是否想截结算发群 / 喊「再来一局比分」？若完全不想，Demo 传播失败 | HEART·Engagement · 微信分享率思路 |

**可选加分（不计入门槛）：** 竖屏成片是否 15 秒内出梗；素材是否像「牛」而不是占位松鼠。

---

## 3. 计分与「可当 Demo」门槛

**量表（每项）：**

| 分 | 含义 |
|----|------|
| 1 | 坏到演示会尴尬 / 规则崩 |
| 2 | 明显不顺，需口头道歉才能演示 |
| 3 | 能玩懂，但谈不上「想再来」 |
| 4 | 手感过关，敢给外人试 |
| 5 | 想截图、想踢馆 |

**门槛（可当 Demo）：**

| 条件 | 要求 |
|------|------|
| **硬门槛** | A、B、D **均 ≥ 4**（操作、公平、死亡结算不过关 → 禁止对外演示） |
| **软门槛** | 八项总分 **≥ 28 / 40**，且 **C、E、F 均 ≥ 3** |
| **传播加分** | H ≥ 4 → 可同步发挑战卡；H ≤ 2 → 只内测改手感，不投流、不发红包 |

未过硬门槛：优先修输入延迟与碰撞盒，再谈障碍表与擦边（见 [`SPX_BUILD_NOTES.md`](SPX_BUILD_NOTES.md) 碰撞/土狼/缓冲）。

---

## 4. 当前 XBuilder 构建：对照用户反馈的预判

用户原话：**「可玩性不高」「操作也不流畅，不太能作为一个 demo」**。  
据此对 **Publish 初版**（松鼠占位 + 最小闭环）做专家预判（非正式打分；正式以你重跑 §2 为准）：

| 项 | 预判 | 依据 |
|----|------|------|
| A 操作延迟 | **1–2 · 硬失败** | 「操作不流畅」直指 Control / Intuitive Controls |
| B 跳跃公平 | **2–3** | 占位碰撞未按 `dangerInset` 精调时，易出现「看着过了却死」 |
| C 前 8 秒 | **2–3** | 若未按 LEVEL_1 疏障，钩子弱；或秒死也伤钩子 |
| D 死亡可读 | **3–4** | 结算页已有四数+梗句+再玩，相对最完整 |
| E 擦边反馈 | **1–2** | 曾出现「勇敢仍为 0」——机制在但反馈/判定未兑现 |
| F 难度爬坡 | **2** | 未严格执行 LEVEL_1 时间轴时，易平或乱 |
| G 分数可读 | **3** | 有数，但局中 UI/倍率体感弱则降分 |
| H 分享欲 | **1–2** | 可玩性差 → 无挑战欲；与 HEART Engagement 一致 |

**结论：** 以当前反馈，**未过「可当 Demo」硬门槛**（A 必挂）。优先序建议：

1. 输入响应（点按/空格 → 起跳同帧或下一帧；加 coyote/buffer，见 PARKOUR_REFERENCE）  
2. 碰撞 inset + 擦边 pad 可见反馈  
3. 套 LEVEL_1 前 8s / 20s 节奏  
4. 再谈素材换牛皮与竖屏成片  

---

## 5. 相关文档

| 文档 | 关系 |
|------|------|
| [`SPX_BUILD_NOTES.md`](SPX_BUILD_NOTES.md) | 工程变量、碰撞、结算搭建 → 修 A/B/D 的施工单 |
| [`LEVEL_1.md`](LEVEL_1.md) | 障碍时间轴 → 直接支撑 C/F |
| [`PARKOUR_REFERENCE.md`](PARKOUR_REFERENCE.md) | 开源跑酷手感映射 → 修 A/B/E 的数值来源 |
| [`GAME_DESIGN.md`](GAME_DESIGN.md) | 最小闭环与勇敢倍率定义 → G/E 验收标准 |
| [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) | 对外口述脚本；仅当 §3 门槛通过后再用 |

---

## 6. 记录模板（复制即用）

```
日期：____  试玩人：____  设备：____  构建/链接：____
A操作__ B公平__ C前8s__ D死亡__ E擦边__ F爬坡__ G分数__ H分享__
总分__/40  硬门槛(A,B,D≥4)：过 / 不过
最痛 1 句：____________________
下轮只改：____________________
```

---

## 7. 记录 · 2026-10-25 Asia/Shanghai（预判 · 当前 Publish）

> **非正式实测**：无浏览器实机连开 3 局；分数来自 `mobile-web/game.js` + CHANGELOG + 同日 Publish 笔记 + `XB_DEMO_BLOCKERS`。标 **预判**。正式分以真人按 §2 重跑为准。  
> 构建：mobile-web [`966085d`](https://github.com/liangchaoboy/running_bull/commit/966085d) · [?v=adsense1](https://liangchaoboy.github.io/running_bull/mobile-web/?v=adsense1)；XBuilder [同链](https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull)（forest / hero3d / reward 已对齐）。  
> 汇总全文：[`EVAL_2026-10-25.md`](EVAL_2026-10-25.md)

```
日期：2026-10-25  试玩人：专家预判（无实机 telemetry）  设备：—  构建：966085d / ?v=adsense1 + XB 同链
A操作 4  B公平 4  C前8s 3  D死亡 4  E擦边 2  F爬坡 3  G分数 3  H分享 3
总分 26/40  硬门槛(A,B,D≥4)：过   软门槛(≥28 且 C,E,F≥3)：不过（总分 26；E=2）
最痛 1 句：设计核心「勇敢擦边倍率」在 mobile-web 未接线（score=距离+金币×10），E 硬挂。
下轮只改：① web/XB 接通 braveStacks+飘字 ② 结算四字段对齐 GAME_DESIGN ③ 实机 15min 重打本表
```

| 项 | 分 | 依据（预判） | 实机需确认 |
|----|----|--------------|------------|
| A | **4** | `JUMP_BUFFER`/`landGrace`、触控 `passive:false`、`LANE_SNAP≈0.78` | 点按→起跳是否同帧感；微信内丢输入 |
| B | **4** | `HIT_Z` 0.70–0.82、跳时长/高度放宽、刷障疏化 | 「看着过了却死」比例；tall 障公平 |
| C | **3** | 开局减速+延后首刷；多模式菜单可能吃掉前几秒 | 8s 内是否过 ≥1 障且想继续 |
| D | **4** | 撞障→激励假片可读；真 `gameOver` 有崩溃特效+结算+再玩 | 假片跳过是否困惑；结算文案一眼懂 |
| E | **2** | `computeScore` 无 `braveStacks`；`core/nearMiss` 未进 web；XB 擦边未目视勾 | 3 局内能否擦到并见「勇敢+1」 |
| F | **3** | 难度下调有分段感；未严格对 LEVEL_1 时间轴验收 | 0–20s 可学、20s+ 加压是否成立 |
| G | **3** | HUD 距离/币/分可见；缺勇敢/倍率行 | 结算四数是否对齐文案 |
| H | **3** | 抽奖海报/奖金条有钩子；手感未到「想踢馆」 | 打完是否想截结算发群 |

相对 §4 初版预判（A 硬失败）：手感/碰撞已抬到硬门槛过关；**剩余最大洞仍是 E 擦边**。
