# bgm1 NOTES — 循环背景音乐 + 静音

**Time:** 2026-10-25 Asia/Shanghai (CST)  
**Style:** 国风轻松循环  
**Track:** neolein — *A ride through chinese valley* (CC0)  
**Auth:** Vincent via 资深小游戏玩家（BGM 优先于道路加强）  
**Play URL:** https://liangchaoboy.github.io/running_bull/mobile-web/?v=bgm1

## Status

| Track | Status |
|-------|--------|
| XBuilder | **Published** feel2+bgm1（Stage 音效名 `跑酷BGM`；同一分享链接） |
| mobile-web | Implemented · push `?v=bgm1` |

## Behavior

- Asset: `mobile-web/assets/bgm/parkour_loop.ogg` (~643 KB Ogg · ~37.5s · 国风轻松，非 chiptune)
- Credits: `mobile-web/assets/bgm/CREDITS.md` (+ short line on about.html — neolein / CC0)
- `HTMLAudioElement`, `loop=true`, `volume=0.32`
- Starts on first start/retry gesture (`startOnce` ← `#btn-start` / `#btn-retry`)
- Mute toggle `#btn-mute` (🔊/🔇) top-right; persists `localStorage.rb_bgm_muted`
- Cache bust: `game.js?v=bgm1` · `style.css?v=bgm1`

## Intact

feel2 road A+B+C · LANE_SNAP 0.92 · plant pickups · playfix1 continue · boost · plane — **no gameplay changes** beyond audio/mute/?v=

## Smoke

- [ ] 点「开始跑」后 BGM 循环播放
- [ ] 右上角 🔊 可静音；刷新后仍静音
- [ ] 结算「再来一局」恢复/继续播（未静音时）
- [ ] `?v=bgm1` 拿到含 `parkour_loop` / `rb_bgm_muted` 的 game.js
