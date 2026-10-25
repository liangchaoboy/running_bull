# 撞障激励广告（Rewarded Ad Hit）

> mobile-web 已落地（`?v=feel1`），与 XBuilder Publish 对齐。  
> 取代原「撞障答题 / 答案之书」路径（见已弃用笔记 `XBUILDER_ANSWER_BOOK.md`）。

## 玩法

- 撞上障碍物：**不** Game Over，冻结滚屏与跑酷操作。
- 弹出 **激励视频占位**「观看广告」：默认 **2.0s** 倒计时。
- 标题/提示明示 **撞到了**（「撞到了！看完广告越过障碍」）。
- 倒计时未结束：「看完」禁用；点「跳过」→ **仍暂停**，障碍保留；按钮变为「认栽结算」。
- **再点跳过 / 认栽结算**（本局未看完累计 2 次）→ 强制结算 `#over`（抬 H / 再玩欲）。
- 倒计时结束：启用「看完」，并短暂后可自动完成。
- **看完**：
  1. 移除当前挡路障碍
  2. 软无敌约 **1.8s**（不耗 🛡️ 次数）
  3. 额外短道具（二选一示意）：**护盾 3s** 或 **清当前道前方障碍**
  4. toast 提示道具名，继续跑
- 跳跃 / 滑铲躲障、无敌 / 坚果 / 炸弹清障仍走原路径，**不**出广告。
- 优美森林 / 土路弯道（`curveDx`）保留。

## SDK 接口位

```js
window.__RB_REWARDED_AD = {
  show({ onCompleted, onSkipped }) { /* mock or real */ }
};
```

接入 **微信小游戏流量主** / **TapTap Dirichlet** 时，用平台 rewarded API 替换 `mockRewardedAdShow` 实现；成功回调 `onCompleted`，关闭/未看完走 `onSkipped`（保持暂停+挡路）。

## XBuilder 对齐

1. 碰撞：无敌/坚果/跳铲清障 → 原路径；否则 `triggerRewardedAd`，不要 `gameOver`。
2. 障碍在看完前 **保留**；跳过不移除。
3. 看完：清障 + 1.8s 软无敌 + 短道具 + toast。
4. XBuilder 已 Publish；Pages：`mobile-web/?v=reward1`。

## 与 AdSense 的关系

AdSense 只能接 **展示广告**（见 `docs/ADSENSE_GITHUB_PAGES.md`）。本文件的 `__RB_REWARDED_AD` **不要**用 AdSense 冒充激励视频。
