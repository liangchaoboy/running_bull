# 微信登录 · 排行榜 · Top3 现金奖励（mobile-web）

面向独立手机网页版 [`mobile-web/`](../mobile-web/)，**不依赖 XBuilder**。GitHub Pages 可立刻演示；正式微信 OAuth 需自有后端 + 国内托管（七牛 Kodo+CDN）。

## 当前 Pages 行为（已实现）

| 能力 | 实现 |
|------|------|
| 「微信登录」按钮 | 打开演示登录框：昵称 + 可选头像 URL，或「随机游客昵称」 |
| 身份持久化 | `localStorage` 键 `rb_user_v1`（`id`/`openid`、`nickname`、`avatar`、`provider: mock`） |
| 得分 / 最长游玩 | 每局结算写入 `rb_leaderboard_v1`：`byScore`、`byPlayTime`（各最多 20） |
| 页面广告 Top3 奖金 | 标题页 + 结算页展示；金额在 `game.js` 的 `PRIZE_CONFIG.amounts`（默认 ¥100 / ¥50 / ¥20） |
| 发奖规则文案 | **按最高分 Top3 发奖**；另展示最长游玩榜。`realPayout: false` 时标「活动预告 / 示意」 |

调试钩子：

- `window.__RB_AUTH` — `getUser()` / `loginMock()` / `logout()`
- `window.__RB_LB` — 当前排行榜对象
- `window.__RB_PRIZE` — 奖金配置
- 可选：挂 `window.__RB_WECHAT_OAUTH = function () { ... }` 后，「微信登录」会走你的真授权跳转，而不再开演示框

## 正式微信网页授权（待后端）

1. 微信公众号或开放平台拿到 **appId**；JS 安全域名 / 网页授权回调域指向正式站（Kodo+CDN 域名，**不是** `github.io`）。
2. 前端：`https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=...&response_type=code&scope=snsapi_userinfo&state=...#wechat_redirect`
3. 后端用 `code` 换 `access_token` + **openid**（及 `snsapi_userinfo` 下的昵称头像）；**不要**把 appSecret 放进前端。
4. 前端只存后端签发的会话（或 openid + 签名）；排行榜改为 API 读写，替换 `localStorage` 的 `saveLb` / `loadLb`。
5. 真发现金前把 `PRIZE_CONFIG.realPayout` 设为 `true`，并接活动审核 / 提现流程；在此之前保持「活动预告」。

详见总览 [`WECHAT_DISTRIBUTION.md`](WECHAT_DISTRIBUTION.md)。

## 改奖金金额

编辑 `mobile-web/game.js`：

```js
const PRIZE_CONFIG = {
  label: "活动预告",
  rule: "按最高分 Top3 发奖；另展示最长游玩榜",
  amounts: [100, 50, 20], // ← 改这里
  currency: "¥",
  realPayout: false,
};
```

## 手感（换道）

- 滑动阈值约 **18px**（原 40）；在 **pointermove** 即换道，不等抬手。
- `LANE_SNAP` 0.58 + `LANE_LERP` 30（原仅 lerp×14）。
- `touchstart` / `touchmove` / `pointer*` 使用 `passive: false` 并 `preventDefault`，减少微信内滚动抢手势。
