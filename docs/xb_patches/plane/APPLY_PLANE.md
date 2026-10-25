# APPLY · plane1 — 飞机大战跑酷（mapId 7 / 键 0）

**Project:** https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull  
**Order:** paste Stage + new sprites → **Publish** same share link → then hard-refresh mobile-web `?v=plane1`.

Parent agent: use **computerUse** for Publish. This pack is paste-ready.

---

## A. Stage

1. Open Stage code (baseline `/workspace/xb_src/stage_ad.spx` + feel1 already live).
2. Paste additions from `stage_plane.snippet.spx`:
   - vars: `planeFireT`, `planeDmg` (optional)
   - `Key0` → `mapId = 7` + applymap/showmenu
   - clamp `mapId` max **7**
   - `applymap`: mapId==7 → backdrop `sky` (+ optional ColorEffect blue)
   - forever: mapId==7 → curve like forest (`curvePhase` / `curveBend`); auto `broadcast "planefire"` every 0.14s while running
   - spawn: keep gap logic; `spawnKind` 1–4（4 = 大怪）already cycles — PlaneEnemy reads it
   - boot: mapId==7 → `runSpeed = 6.5`, `gapT = 2.2`, `planeFireT = 0`
3. **Do not** wire plant pea/cherry into mapId 7.

## B. New Sprite · PlaneBullet

1. Add sprite (costume: yellow oval / upload `bullet.png` from assets/plane).
2. Paste full `PlaneBullet.spx`.
3. Listens `planefire` → clone at `bullX`, `heroFeet+36`; moves toward far (increase Y / decrease depth); dies off-screen.
4. On touch PlaneEnemy / broadcast `planedmg` with lane — enemy script handles HP.

## C. New Sprite · PlaneEnemy（或改现有障碍仅 mapId==7 分支）

1. Costumes: `small` / `big`（可用 `enemy_small.png` / `enemy_big.png`）。
2. Paste `PlaneEnemy.spx`.
3. onMsg `spawn`: if mapId==7 && !isClone → clone; set `hp` = 3 if spawnKind&lt;4 else 10; size by kind.
4. Move toward hero like other rear obstacles; on `hp<=0` → coins += reward, die.
5. Touch hero → `broadcast "hit"`（走现有激励广告 / feel1 跳过结算）.

## D. Road

Paste notes from `Road_plane.snippet.spx` into Road forever:
- mapId==7: soft blue tint; rush clones follow `curveBend` like mapId 3 if you already have forest rush; else at least setCostume road2 + ColorEffect.

## E. Heroes showmenu

In cow/deer/dog `showmenu` mapName branch add:

```
} else if mapId == 7 {
    mapName = "飞机大战"
```

Update say line keys: `...9植物0飞机`.

Files: sync `/workspace/xb_src/patches/hero_*.spx` or paste snippet `hero_showmenu_plane.snippet.spx`.

## F. Publish checklist (computerUse)

- [ ] Stage Key0 / mapId7 / auto planefire / curve
- [ ] PlaneBullet clones on fire
- [ ] Small needs ~3 hits; big ~10; bomb -5
- [ ] Curve visible within ~20s
- [ ] Hit still opens 撞到了 ad; skip×2 → over
- [ ] Keys 4–9 / forest plant chill space unchanged
- [ ] **Publish** same share link
- [ ] Smoke forest depth + plant cherry still OK

## G. Snippet paths

- `/workspace/xb_src/patches/plane/APPLY_PLANE.md` (this file)
- `/workspace/xb_src/patches/plane/stage_plane.snippet.spx`
- `/workspace/xb_src/patches/plane/PlaneBullet.spx`
- `/workspace/xb_src/patches/plane/PlaneEnemy.spx`
- `/workspace/xb_src/patches/plane/Road_plane.snippet.spx`
- `/workspace/xb_src/patches/plane/hero_showmenu_plane.snippet.spx`
- Design: `/workspace/running_bull/docs/XBUILDER_PLANE_MODE.md`


**Repo copy:** `docs/xb_patches/plane/` (same files as `/workspace/xb_src/patches/plane/`).
