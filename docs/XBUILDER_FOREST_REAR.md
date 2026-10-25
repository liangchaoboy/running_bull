# XBuilder → mobile-web：背对冲刺 + 优美森林

同步自 XBuilder Publish（同链 running_bull；键 **6** / mapId 森林）。

## 1. 背对四分之三跑感
- 素材：`mobile-web/assets/forest/{bull,deer,dog}_0..4.png`
- 跑帧 0–3 + 跳帧 4；步频 `runPhase` 驱动
- **锁旋转**（不做侧贴纸 lean rotate）；换道仅横向 settle
- **hips-near / head-far**：造型自带近大远小；绘制再轻压头远
- 菜单可选 **牛牛 / 小鹿 / 小狗**（键 1/2/3）；本地记住

## 2. 优美森林地图
- 菜单 **🌲 优美森林**（键 6）
- 阳光神光 backdrop + 绿色小径；道心透明给三道
- 道边 Quaternius / Kenney 树灌（CC0）；**不含 Glimmerwood**
- 见 `assets/forest/CREDITS.md`
- 前冲景：停掉 forest_road 平铺纵滑；树/花灌随 roadScroll 逼近；近景放大 + 光斑加强

### XBuilder Publish 记录（2026-10-25 Asia/Shanghai）
- 同链 **running_bull**；优美森林 **linjing** backdrop
- **mapId3** 路面冻结（不再横滑/壁纸纵滑）
- 树 / 光斑 / 虚线往镜头冲（近大远小 + 景深速差）
- mobile-web 同步：`?v=forest2`（`drawSkyForest` / `drawRoadForest`）
- 量化回归见 `docs/DEPTH_FEEL_SCORECARD.md`

## 3. 回归
植物跑酷 / 抽奖 / 慢慢跑酷 / 无敌 / 炸弹保持不变。

## 4. 角色锚定补丁（2026-10-25 Asia/Shanghai）
- 问题：英雄脚本曾用 `setRotationStyle Normal` + heading lean（纸片翻），与「锁旋转」宣称不一致。
- 修复：牛/鹿/狗跑跳全程 `None` + heading 90；仅垂直 bob + 轻落地 size；换道仍横移。
- 造型：`gen.py` 加强 hips近头远 + 落脚影；上传目录 `xb_upload/forest_heroes/`。
- 详见 `XBUILDER_HERO_DEPTH.md` 与 `/workspace/agent-tools/anime-hero-3d-NOTES.md`。
- **未**自动 Publish / 未推网页；等 computerUse Publish 后再 sync。
- mobile-web sync: `?v=hero3d1`（角色锚定 + pear 造型）。
