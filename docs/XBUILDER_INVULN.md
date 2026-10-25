# XBuilder 对齐笔记：无敌冲撞 ×3

> 仓库内 **没有** 可编辑的 XBuilder / spx 工程。mobile-web 已先落地；下列供 computerUse / 人工在 x.qiniu.com 补齐后 Publish。

## 玩法

- **每局 3 次**无敌充能（开局重置）。
- 点击「🛡️」按钮（或桌面键 `I` / `V` / `Q`）消耗 1 次 → **10 秒**无敌。
- 无敌期间撞上障碍：**撞碎**（销毁 + 爆炸特效），**不死亡**；可正常捡金币 / 换道 / 跳跃 / 丢炸弹。
- HUD 显示剩余次数；激活中显示倒计时「Ns」与「冲撞中」。

## XBuilder 建议实现

1. 变量：`invulnCharges = 3`，`invulnTimer = 0`。
2. 按钮/按键：charges>0 且 timer==0 时 `charges--`，`timer = 10`。
3. 每帧 `timer = max(0, timer - dt)`。
4. 碰撞：若 `timer > 0` 且碰到障碍 → 删除障碍 + 播破碎/爆炸；否则按原逻辑判死。
5. 角色光环/金色滤镜表示无敌中。
6. Publish 后把链接写回 README。

## mobile-web 对照

| 项 | 值 |
|----|-----|
| `INVULN_CHARGES` | 3 |
| `INVULN_DURATION` | 10 秒 |
| 按钮 | `#btn-invuln` |
| HUD | `#hud-invuln` |
