# APPLY · playfix1 — 勇敢倍率 + 标题瘦身对齐 + 撞障 1 次续跑

**Project:** https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull  
**Order:** paste Stage + heroes + Obstacle graze cap → **Publish** same share link → hard-refresh mobile-web `?v=playfix1`.

Parent agent: use **computerUse** for Publish. This pack is paste-ready.

---

## Design (locked)

| Item | Value |
|------|-------|
| Brave | 擦边成功 `brave += 1` once/obstacle · **cap 9** · `multiplier = 1 + brave` |
| Score (non-chill) | `distance * multiplier + coins*10`（已有；结算写清四字段） |
| Chill | 仍 `timeScore`，不受勇敢倍率 |
| Hit rhythm | **最多 1 次**激励续跑；第 2 次撞或认栽 → `#over` |
| Float | 保持「擦边!」「勇敢!」 |
| Intact | boost / plane autofire / plant / forest |

---

## A. Stage (`stage_ad.spx` baseline)

1. Add var `adContinue float64` (0/1 used this run).
2. Score block (already):
   ```
   multiplier = 1 + brave
   if mapId == 5 { score = timeScore } else { score = distance * multiplier + coins*10 }
   ```
   Optional clamp display: if brave > 9 { brave = 9 }.
3. `onMsg "hit"`:
   - if `adContinue >= 1` → `running=false; over=true; broadcast "gameover"`（不再开广告）
   - else → open ad as today；文案改为「撞到了！看完越过 · 按2认栽结算」
4. Key2 skip path: **第一次跳过即认栽结算**（不再要求 skip×2）。完成广告时 `adContinue = 1` 并清 `adSkipCount`。
5. boot / menu: `adContinue = 0`.
6. See `stage_playfix.snippet.spx`.

## B. Heroes (cow / deer / dog)

1. `onMsg "gameover"` say（非 chill）改为四字段：
   ```
   距离 %.0f
   勇敢层 %.0f · 倍率 ×%.0f
   得分 %.0f
   空格重新选择
   ```
   （金币/阳光可另起一行）
2. Chill 保持存活时长积分。
3. `onMsg "graze"` 保持「擦边!」/「勇敢!」交替。
4. See `hero_playfix.snippet.spx`.

## C. Obstacles（石头 / 树桩 / 魔法宝箱 / Obstacle / PlaneEnemy 等）

擦边处加 cap：
```
if !grazed {
  grazed = true
  if brave < 9 {
    brave = brave + 1
  }
  broadcast "graze"
}
```
See `Obstacle_brave_cap.snippet.spx`.

## D. Publish checklist (computerUse)

- [ ] Stage: `adContinue` + hit 第2次直接 over + Key2 认栽一次结算 + boot 清零
- [ ] Smoke: 擦边 → 勇敢层涨、倍率涨、得分 = 距离×倍率+币×10
- [ ] Smoke: 第1次撞 → 广告；看完续跑；第2次撞 → 直接结算
- [ ] Smoke: 广告里按2 → 立刻结算（认栽）
- [ ] gameover say 四字段可见
- [ ] brave 不会超过 9
- [ ] boost / plane / plant / forest 未坏
- [ ] **Publish** same share link `running_bull`
- [ ] Hard-refresh web `?v=playfix1`

## E. Paths

- `/workspace/xb_src/patches/playfix1/APPLY_PLAYFIX.md` (this file)
- `stage_playfix.snippet.spx` · `hero_playfix.snippet.spx` · `Obstacle_brave_cap.snippet.spx`
- Synced refs: `/workspace/xb_src/stage_ad.spx` · `hero_{cow,deer,dog}.spx`
- Repo mirror: `docs/xb_patches/playfix1/`
- Web: `mobile-web/?v=playfix1`


## F. 七牛推广槽文案（mobile-web；XB 无同款 HTML 槽则跳过）

定稿（一字对齐）：
- badge：`七牛🐮`
- 标题页 `#ad-slot-menu`：`云存储 · CDN · 直播 —— 七牛云，让内容跑得更快`
- 结算页 `#ad-slot-over`：`这局跑酷靠七牛🐮 托底 · 对象存储 + CDN 一站搞定`
- aria-label：`七牛云推广（占位）`
- **不要**启用 AdSense / 不要填 ca-pub
