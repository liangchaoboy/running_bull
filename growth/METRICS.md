# 指标手记表 · 字段说明

> 用途：Day1 晚上～Day2 全天，用飞书表格 / 腾讯文档 / 本地表格均可。  
> 原则：**能手填就手填**；不接分析 SDK 也能讲增长。  
> 每天至少填 2 次：午间一次、晚间一次。

---

## 1. 建议表头（一行一天或一行一个时段）

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `date` | 日期 | 是 | 当地日期（Asia/Shanghai） | 2026-10-24 |
| `slot` | 枚举 | 是 | `morning` / `noon` / `evening` / `night` | evening |
| `publish_url` | URL | 是 | 当前试玩链接；未上线填「未 Publish」 | https://x.qiniu.com/... |
| `try_uv_est` | 整数 | 是 | 试玩人数估算（群反馈+自估） | 23 |
| `finish_settle_est` | 整数 | 建议 | 至少看到 1 次结算的人数估算 | 15 |
| `challenge_cards` | 整数 | 是 | 收到的挑战卡/得分截图条数 | 8 |
| `remix_count` | 整数 | 是 | 他人 Remix / 改编作品数 | 1 |
| `remix_links` | 文本 | 建议 | 链接列表，分号分隔 | https://...;https://... |
| `video_posted` | 文本 | 是 | 当日发布的竖屏：`v1惨死,v2擦边,v3remix` 或 `none` | v2擦边 |
| `video_notes` | 文本 | 否 | 完播/评论直觉备注 | 评论区在比谁更惨 |
| `channel_feishu` | 布尔/文本 | 是 | 是否已发飞书正式邀请 | yes |
| `channel_wechat` | 布尔/文本 | 是 | 是否已发微信短文案 | yes |
| `top_score_seen` | 整数 | 建议 | 目击最高分 | 5120 |
| `top_brave_seen` | 整数 | 建议 | 目击最高勇敢层数 | 5 |
| `ad_spend_cny` | 数字 | 是 | 当日投流花费人民币；未投填 0 | 0 |
| `ad_clicks_est` | 整数 | 投流时必填 | 广告点击估算 | 40 |
| `ad_try_est` | 整数 | 投流时必填 | 广告带来的试玩估算 | 12 |
| `blocker` | 文本 | 建议 | 最大阻塞 | 手机端点击跳跃偶发失灵 |
| `next_action` | 文本 | 是 | 下一时段只做一件事 | 修点击；傍晚发视频2 |
| `owner` | 文本 | 是 | 填写人 | liangchaoboy |

---

## 2. 核心指标怎么读

| 指标 | 好看 | 难看时怎么办 |
|------|------|----------------|
| `try_uv_est` | Day2 晚 ≥20（视群规模） | 检查链接；重发短卡；工位贴码 |
| `challenge_cards` | ≥试玩的 30% | 结算页口播「复制挑战卡」；群里示范一条 |
| `remix_count` | ≥1 | 私聊 3 个会做的人；发 Remix 专项文案 |
| `finish_settle_est` | 接近 try_uv | 第一关前 8 秒是否过难；是否闪退 |
| `ad_spend_cny` | 有花费时看 `ad_try_est/花费` | 按 `MONETIZATION.md` 决策树停投 |

---

## 3. 示例一行（抄到表格里当模板）

```
date: 2026-10-24
slot: evening
publish_url: （待 Publish 后替换）
try_uv_est: 18
finish_settle_est: 12
challenge_cards: 6
remix_count: 0
remix_links:
video_posted: v2擦边
video_notes: 群里开始比勇敢层数
channel_feishu: yes
channel_wechat: yes
top_score_seen: 4320
top_brave_seen: 4
ad_spend_cny: 0
ad_clicks_est: 0
ad_try_est: 0
blocker: 还没有 Remix
next_action: 晚上发 Remix 专项 @设计
owner: liangchaoboy
```

---

## 4. 与评委汇报时怎么用

只投影 **4 个数**：试玩估算、挑战卡、Remix、投流花费（多为 0）。  
一句话：

> 我们用可手记的增长表，而不是空口说「会爆」——链接在跑，卡片在传，二创在来。

---

## 5. 隐私

手记表勿填同事实名手机号；截图打码非必要信息。仓库可只提交本说明，不必提交填过数的表格。  
