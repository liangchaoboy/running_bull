# boost1 NOTES — 硬 bug 补强 + P0/P1 对齐（原 playfix1 并入）

**Time:** 2026-10-25 Asia/Shanghai (CST)  
**Auth:** Vincent via 资深小游戏玩家 + boost1 插队（优先于 P2，与 P0 同推）  
**Play URL:** `mobile-web/?v=boost1`

## Status

| Track | Status |
|-------|--------|
| XBuilder patches | Ready under `/workspace/xb_src/patches/playfix1/` — **Publish pending** (parent computerUse) |
| mobile-web | Pushed with `?v=boost1`（见下方 SHA） |
| AdSense ca-pub | **Not enabled**；玩家可见文案已去掉「过审后填入 ca-pub / GitHub Pages 占位」 |

## 硬 bug（必修）— 全修

| # | Item | Status |
|---|------|--------|
| H1 | 激励广告去掉 countdown 后 `setTimeout/~180ms` auto success；世界保持暂停；必须点「看完」才续跑；跳过/认栽取消定时器；**第二次 skip → #over** | **Fixed** |
| H2 | `resetGame` 重置 `boostCharges` / `boostT` / `boostCd` + `syncBoostUi`（勿残留 ×1） | **Fixed**（原本已重置变量，补 `syncBoostUi` + HUD 主区隐藏 pills） |
| H3 | 结算页 reward toast 勿盖住 #over 得分行 | **Fixed**（toast z-index 9＜#over 10；`showGameOverCard` 调 `hideRewardToast`；`:has(#over.show-over)` 强制隐藏） |
| H4 | 「看完」disabled 态明确不可点样式 | **Fixed**（`.is-locked` + grayscale +「（倒计时中）」伪元素 + `pointer-events:none`） |

## P0 / P1 / 对齐

| ID | Item | Status |
|----|------|--------|
| P0-1 | 勇敢倍率 · cap9 · HUD「勇敢 ×N」· #over 四字段 | **Done** |
| P0-2 | 折叠抽奖/红包/登录金钱墙 →「活动 · 说明」 | **Done** |
| 擦边 | 玩家旁单飘字；邻道 stacks only（`NEAR_MISS_COIN=0`）；修倍率 | **Done**（去掉擦边 toast，避免盖 HUD） |
| HUD | 主区仅 距离/金币/得分/勇敢；冲刺/无敌只在按钮上 | **Done**（HUD pills `hidden`） |
| 飞机 | 藏跳；公路三角弱化；飞船更大；子弹≠金币；加速 flash 减弱 | **Done** |
| 无敌 | ≈**3s**（原 10s）；广告续跑不在已有 i-frame 上叠满额 | **Done** |
| 广告槽 | 七牛定稿；删玩家可见 ca-pub / GitHub Pages 占位 | **Done** |
| about | 地图列表补「飞机大战」 | **Done** |
| P1 | 每局最多 1 次成功续跑；第 2 撞 → #over；触控/教练 | **Done** |

## Skip / Continue 语义（本批定稿）

- 成功续跑：`rewardContinueUsed`，**本局最多 1 次**；第 2 次撞障直接 `#over`
- 广告内跳过：`rewardSkipStreak`；第 1 次取消 auto 定时器并提示；**第 2 次 → #over**
- 倒计时归零**只启用**「看完」，**绝不** `setTimeout` 自动 `finishRewardedAdSuccess`

## 七牛槽文案（定稿）

- badge：`七牛🐮`
- menu：`云存储 · CDN · 直播 —— 七牛云，让内容跑得更快`
- over：`这局跑酷靠七牛🐮 托底 · 对象存储 + CDN 一站搞定`
- aria：`七牛云推广（占位）`

## Score

`score = floor(distance) * (1 + braveStacks) + coins*10` · stacks cap 9

## XB APPLY（parent Publish）

1. Open https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull  
2. Follow `/workspace/xb_src/patches/playfix1/APPLY_PLAYFIX.md`  
3. **Publish** same share link  
4. Hard-refresh https://liangchaoboy.github.io/running_bull/mobile-web/?v=boost1

## Smoke

- [ ] 撞障 → 倒计时结束「看完」可点；**不点不续跑**；世界暂停  
- [ ] 第 1 次跳过：仍停在广告；第 2 次跳过 → #over  
- [ ] 看完续跑 1 次后，再撞 → #over  
- [ ] 再来一局：加速按钮显示 ×3（非残留 ×1）  
- [ ] #over 得分行清晰，无 toast 遮挡  
- [ ] 「看完」倒计时中灰度+「（倒计时中）」  
- [ ] HUD 无独立无敌/加速 pill；按钮上有次数  
- [ ] 无敌约 3s；续跑不叠满盾  
- [ ] 飞机：无跳钮、船更大、子弹青色、公路淡、flash 弱  
- [ ] about 含飞机大战；无玩家可见 ca-pub 填入提示  

## SHA / ?v=

`309fcc6e90e5f81ba3478fc111ac2743eaa541b1` · `?v=boost1`

Play: https://liangchaoboy.github.io/running_bull/mobile-web/?v=boost1
