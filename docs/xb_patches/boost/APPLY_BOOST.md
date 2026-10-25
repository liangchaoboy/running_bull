# APPLY · boost1 — 全地图短冲刺加速

**Project:** https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull  
**Order:** paste Stage + heroes → **Publish** same share link → hard-refresh mobile-web `?v=boost1`.

Parent agent: use **computerUse** for Publish. This pack is paste-ready.

---

## Design (locked)

| Item | Value |
|------|-------|
| Trigger | **Tap** Key **X** (not hold). Mobile: on-screen ⚡ button |
| Burst | **1.0 s** · `runSpeed × 1.45` |
| CD | **2.5 s** after burst ends |
| Charges | **3 / run** (optional later: ad refill stub `boostrefill`) |
| Feel | On fire: `inputLock = 0.1`; during burst: lane snap **0.48** (was ~0.88) |
| Scope | **All** mapId 1–7 incl. plane (toast「后喷!」) |
| Intact | feel1 skip×2→over / plant / forest / plane autofire |

---

## A. Stage

1. Open Stage (baseline `/workspace/xb_src/stage_ad.spx`).
2. Paste from `stage_boost.snippet.spx`:
   - vars `boostCharges` / `boostT` / `boostCd`
   - forever tick boostT → then boostCd
   - after map `runSpeed` assign: `if boostT > 0 { runSpeed = runSpeed * 1.45 }`
   - `onKey KeyX` activate
   - boot: `boostCharges = 3`, clear T/Cd
3. Do **not** change `adSkipCount` / Key2 / planefire / plant keys.

## B. Heroes (cow / deer / dog)

1. Add `snapK float64` if not present.
2. Lane follow: use `snapK` 0.88 normal / **0.48** while `boostT > 0` (see `hero_boost.snippet.spx`).
3. `onMsg "boost"` → say 「加速!」or mapId7 「后喷!」
4. `showmenu` say line append `X加速`.

Synced refs: `/workspace/xb_src/hero_{cow,deer,dog}.spx`.

## C. Publish checklist (computerUse)

- [ ] Stage vars + forever ×1.45 + KeyX + boot reset
- [ ] Smoke any map: X → speed up ~1s → CD ~2.5s → need charges
- [ ] 3 charges then empty; next run resets to 3
- [ ] During burst: lane change slightly slower / brief soft-lock
- [ ] mapId7: autofire still on; toast 后喷; hit still 撞到了 / skip×2 over
- [ ] forest / plant / chill / space unchanged aside from boost
- [ ] **Publish** same share link `running_bull`
- [ ] Hard-refresh web `?v=boost1`

## D. Snippet paths

- `/workspace/xb_src/patches/boost/APPLY_BOOST.md` (this file)
- `/workspace/xb_src/patches/boost/stage_boost.snippet.spx`
- `/workspace/xb_src/patches/boost/hero_boost.snippet.spx`
- Design: `/workspace/running_bull/docs/XBUILDER_BOOST.md`
- Repo mirror: `docs/xb_patches/boost/`
