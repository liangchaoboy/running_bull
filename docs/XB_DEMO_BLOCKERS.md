# XBuilder Demo 阻塞清单

> 可玩 Demo **只能在 XBuilder 搭**；本仓库是文案包 + 逻辑测试。  
> 用途：课前 / 评委前自检；阻塞解除后把 Publish URL 写回 README。  
> 状态核实：2026-10-23 19:38 Asia/Shanghai。

---

## 1. 当前阻塞（需用户侧）

| # | 阻塞 | 谁解 | 状态 |
|---|------|------|------|
| B1 | **用户登录 XBuilder**（[x.qiniu.com](https://x.qiniu.com)）并创建/打开工程 | Vincent | ⏳ 待登录（今晚唯一通路） |
| B2 | 账号能 **Publish** 出公网可开链接（手机+桌面） | Vincent / 平台权限 | ⏳ 待验证 |
| B3 | 仓库推到 GitHub 主库 | 需 push 权限 | ❌ 已核实：远端空壳；当前连接账号仅 pull、无 push。**不阻塞** Demo 可玩 |

本地已就绪：`docs/` + `growth/` 资产包；`npm test` → 15/15 通过。云端代理区域不可用 → **不作为** XBuilder 搭建路径。

---

## 2. 最小玩法勾选（搭完再 Publish）

对照 [`GAME_DESIGN.md`](GAME_DESIGN.md) / [`SPX_BUILD_NOTES.md`](SPX_BUILD_NOTES.md)：

- [ ] **跑**：牛自动向前（或卷轴），`runSpeed` 固定  
- [ ] **跳**：空格 / 点击舞台可跳；Day1 不做二段跳  
- [ ] **擦边倍率**：近距带触发「勇敢 +1」，同障碍仅 1 次；`score = distance × (1+stacks)`  
- [ ] **死亡结算**：撞危险盒 → 停跑 → 面板含距离 / 勇敢 / 倍率 / 得分 +「勇敢牛牛，不怕困难」  
- [ ] **再玩**：重置变量回奔跑  
- [ ] **Publish**：链接可打开，并替换 README「试玩链接」占位  

障碍节奏建议抄 [`LEVEL_1.md`](LEVEL_1.md)（≥8 个）。

---

## 3. 验收标准（Demo 可演 = 全勾）

- [ ] 3 分钟口述可按 [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) 跑通（含故意擦边 + 撞死）  
- [ ] 结算四字段与逻辑核心一致（可对照 `npm test` / `core/`）  
- [ ] 手机竖屏能玩（或录屏备用）  
- [ ] Remix 入口能指给评委（按钮文案以平台为准）  
- [ ] 挑战卡可复制（[`growth/CHALLENGE_CARD.md`](../growth/CHALLENGE_CARD.md)）

---

## 4. 就绪后通知点

登录并 Publish 后，在本聊天说一声并贴上：

1. **Publish URL**  
2. （可选）工程是否已开 Remix  
3. 已知坑一条（如移动端点击）

收到后会：改 README 试玩占位 → 勾掉上表 → 放开 Day2 引流 / 工作坊试讲材料。

**未 Publish：不投流、不对外空链。**
