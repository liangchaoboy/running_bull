# XBuilder 对齐笔记：慢慢跑酷 😎

> 仓库内 **没有** 可编辑的 XBuilder / spx 工程文件，本机无法从 CI/agent 直接 Publish。  
> **mobile-web 已先落地可玩模式**；下面供 computerUse / 人工在 x.qiniu.com 补齐后 Publish。

## 模式一句话

**慢慢跑酷**：极慢卷轴、更疏障碍、lo-fi 暖色；**积分主看存活时长**（秒×10 + 金币×1 加成）。

## 在 XBuilder 里怎么做（建议）

1. **地图/舞台选择**：新增第三选项「慢慢跑酷」（或变量 `mapMode = chill`）。
2. **速度**：`runSpeed` 初值约 **现有的 45–50%**；上限更低；随时间增速更缓（参考 mobile：`CHILL_SPEED_START=105` / `MAX=165` / `RAMP=0.045`，相对土路 220/400/0.20）。
3. **刷障**：间隔约 **1.7×** 土路；禁止列车等高压迫造型；同道近距过滤更宽。
4. **美术**：暖灰绿/蜜桃色背景，柔和土路 + 矮灯笼；无霓虹。
5. **计分（必须）**  
   - 主分：`floor(playTimeSec * 10) + coins * 1`  
   - HUD 左：**时长**（非距离）  
   - HUD 右：**时长积分**  
   - 金币仅加成；结算强调「存活 / 时长积分」  
   - 排行：单独「时长积分榜」（勿与土路距离分混榜）
6. **操作**：仍三道换道 + 跳 +（可选）炸弹；手感保持「能跳过」宽松窗。
7. **Publish**：发布后把链接写回 `README.md` / `WECHAT_DISTRIBUTION.md`，并在 mobile-web README「与 XBuilder 版关系」表补一行。

## mobile-web 对照常量（`mobile-web/game.js`）

| 常量 | 值 |
|------|-----|
| mode id | `chill` |
| CHILL_SPEED_START / MAX / RAMP | 105 / 165 / 0.045 |
| CHILL_SPAWN_BASE / MIN / DIST_DIV | 2.65 / 1.85 / 2800 |
| CHILL_TIME_PTS / COIN_BONUS | 10 / 1 |
| LB key | `byChill`（localStorage `rb_leaderboard_v1`） |

## 验收

- [ ] 标题页可选「慢慢跑酷」
- [ ] 开局明显比土路慢、障碍更稀
- [ ] HUD/结算以时长与时长积分为主
- [ ] 时长积分榜与土路得分榜分开
- [ ] Publish 链接可在手机打开
