## 2026-10-25 · bgm1（国风轻松循环 BGM + 静音）

- mobile-web：**国风轻松** CC0 循环曲 `assets/bgm/parkour_loop.ogg`（neolein — *A ride through chinese valley*，非 chiptune）；开跑/再来手势启播；右上角 🔊/🔇；`localStorage.rb_bgm_muted`；`?v=bgm1`。
- XBuilder：已 Publish feel2+bgm1（Stage `跑酷BGM`）；网页同步本提交。

## 2026-10-25 · boost1（全地图短冲刺加速 ⚡）

- 点按短冲刺：约 **1.0s** `runSpeed×1.45`，结束后 **2.5s CD**；每局限 **3** 次。
- 触发：键 **X** / 触控 **⚡**；爆发时换道软化（软锁 0.1s + 更慢 snap）；飞机 toast「后喷」。
- XBuilder：`xb_src/patches/boost/APPLY_BOOST.md`（**待 Publish**）；设计 [`XBUILDER_BOOST.md`](XBUILDER_BOOST.md)。
- mobile-web `?v=boost1`；feel1 skip×2 / plant / forest / plane 扫射保持。

## 2026-10-25 · plane2（飞机显示消失修复）

- **根因（web）**：`project`/`drawPlayerPlane` 用小数 `displayLane` 索引 `LANE_X` → `NaN`，换道后机体不画。
- **根因（XB）**：开跑切 `跑1–4`/`跳`，缺帧则空白；旧 Obstacle 仍可能在 mapId7 spawn。
- 修复：web 分数道插值 + ✈️ 底图；XB 英雄 mapId7 锁 `默认`+`show`；Obstacle 跳过 mapId7；PlaneBullet 抬起点。
- 粘贴：`docs/xb_patches/plane/APPLY_PLANE_FIX.md`（**待 Publish**）；Pages `?v=plane2`。

## 2026-10-25 · plane1（飞机大战跑酷 ✈️）

- 新模式 **飞机大战**（mapId **7** / 键 **0** / web `plane`）：默认连续扫射；小怪 HP3、大怪 HP10；导弹 -5；航路弯道。
- XBuilder 粘贴包：`xb_src/patches/plane/APPLY_PLANE.md`（**待 Publish**）；设计 [`XBUILDER_PLANE_MODE.md`](XBUILDER_PLANE_MODE.md)。
- mobile-web `?v=plane1`；素材 `mobile-web/assets/plane/`（原创几何）。
- forest / plant / feel1 激励跳过结算保持。

## 2026-10-25 · mobile-web forest1

## 2026-10-25 · feel1（抬 H / 擦边 / 撞到了 / 悬空）

- 激励跳过两次 → 结算 `#over`；文案「撞到了」；邻道擦边 toast；悬空景深加强。
- Pages `?v=feel1`；XB 见 `xb_src/patches/APPLY_H_EDGE_HIT_SPACE.md`（需 Publish）。
- 详 [`FEEL1_H_EDGE_SPACE.md`](FEEL1_H_EDGE_SPACE.md)。


- 背对四分之三跑姿（bull/deer/dog）+ 优美森林地图（Quaternius/Kenney，无 Glimmerwood）
- 植物/抽奖/chill/无敌/炸弹保持
- Pages cache `?v=forest1`

# Changelog

## 2026-10-25（趣味抽奖海报 + 券规则）

- 海报三行（活动核定）：玩满 2 分钟或金币 ≥200 可抽；越久/越多金币券越多（最多 8 张）；每人每天 1 次。
- 券公式 W=min(T+C,8)：T=min(1+0.5*(t_min-2),5)（满 2 分钟起），C=min(floor(g/100),5)；日游玩计券上限 15 分钟。
- 未达标灰按钮文案：**再跑一会儿再来抽**；本地 mock 一次抽完所有券（无真实发奖后端）。
- 文档 [`LOTTERY_RULES.md`](LOTTERY_RULES.md)；缓存 `?v=lottery1`。


## 2026-10-25（植物跑酷 🌻 → mobile-web）

- 新模式 **植物跑酷**（`plant`）：草坪主题、致敬僵尸障碍、捡向日葵/豌豆/加特林/坚果。
- **向日葵** ~12s 产阳光→金币；**豌豆** ~3.4s 清当前道；**加特林** ~8s 连续扫射并跟道；**坚果** ~5s 护盾撞碎。
- **本模式樱桃炸弹**：B / 🍒 **连续 10 秒**清当前道前方（他模式炸弹仍为一发）。
- 原创致敬素材入 `mobile-web/assets/`（见 CREDITS）；文档 [`XBUILDER_PLANT_MODE.md`](XBUILDER_PLANT_MODE.md)。
- XBuilder 已先 Publish（键 9）；本提交同步手机网页。



## 2026-10-25（金币金属币 + 跑动感加强）

- **金币**：改成金属厚币（外缘/内环/「¥」压印、高光与暗边），相对地面抬高悬空并轻 bob，画清晰椭圆阴影；space 为玫瑰金币、土路/chill 仍是金币感。
- **跑动**：加大步幅 bob、腿摆与手臂对摆、前倾；步频略跟速度；跳/滑铲硬切/换道 lean/无敌高亮保留。
- 仅 `mobile-web/game.js` + docs；未改 XBuilder。


## 2026-10-25（手感追赶：稳步幅 + 滑铲硬切 + XBuilder 清单）

- 文档：[`XBUILDER_FEEL_CATCHUP.md`](XBUILDER_FEEL_CATCHUP.md) — Zurich/Subway Publish 勾选（跑步稳步、滑铲硬切、换道 snap、纵深加宽、无敌/慢慢同步）。**Publish 需 computerUse（桌面忙）。**
- mobile-web：更稳跑步节拍；换道更脆（`LANE_SNAP` 0.58→0.78，`LANE_LERP` 30→48）；**下滑铲**硬切蹲姿（可钻非 tall 障）；不影响 chill / 无敌。


## 2026-10-25（无敌冲撞 ×3 · 10 秒撞碎）

- 每局 **3 次**无敌：点 🛡️（桌面 `I`/`V`/`Q`）开启 **10 秒**；期间撞障即碎，不死亡。
- HUD「无敌」显示剩余次数 / 激活倒计时；按钮带次数与金色脉冲。
- 撞碎 VFX（爆炸环 +「撞碎!」飘字 + 角色金光环）。
- XBuilder 对齐：[`XBUILDER_INVULN.md`](XBUILDER_INVULN.md)（仓库无工程，**未能在此 Publish**）。
- 仅 `mobile-web/` + docs。


## 2026-10-25（赛道放宽 · Subway 感）

- **三道明显加宽**：近处路半宽 `0.42→0.50` vw、远处 `0.08→0.13`；`LANE_X` `[0.22,0.5,0.78]→[0.18,0.5,0.82]`（更贴轨）。
- 透视略拉深（地平线 `0.18→0.14`、近端 `0.78→0.82`），背对镜头三道铁轨感更强。
- 角色/障碍 `ROAD_SCALE=1.18`，随更宽道仍填满赛道；换道/碰撞逻辑不变。
- 仅 `mobile-web/` + docs。


## 2026-10-25（慢慢跑酷 😎 · 积分看时长）

- 新增模式 **慢慢跑酷**（`chill`）：更慢速度、更疏刷障、lo-fi 暖色天空/土路/灯笼；菜单第三张卡片可选。
- **积分主看存活时间**：`秒×10 + 金币×1`；HUD「时长 / 时长积分」；独立「时长积分榜」`byChill`；金币仅加成。
- 桌面调试：标题页按 `5` 切慢慢跑酷（`4` 土路 / `7` 悬空）。
- 文档：[`XBUILDER_CHILL_MODE.md`](XBUILDER_CHILL_MODE.md)（仓库无 XBuilder 工程，**未能在此 Publish**；需 computerUse/人工对齐）。
- 仅 `mobile-web/` + docs。


## 2026-10-25（对外展示向打磨：爆炸 / 跑道 / HUD / 角色）

- **爆炸**：多环冲击波 + 火球核心 + 碎片/烟/火花粒子、更长 💥 停留、强闪屏与震屏；每次丢炸弹都有明确动画。
- **跑道**：土路加路缘、灯柱、草丛、泥土斑驳与视差树/云/山；悬空空间加浮台板、霓虹边轨、符文光点与侧边水晶。
- **角色**：更完整跑动（腿关节、手臂、甩尾、落地烟尘、跳跃拉伸）。
- **反馈**：吃币 `+10` 飘字 + HUD 金币弹跳；撞障先播崩溃特效再弹出结算卡。
- **UI**：胶囊 HUD、触控键与菜单/结算入场动画；文案略收。
- 仅 `mobile-web/` + docs；**XBuilder 未同步**（视觉差距会更大，需另做资源对齐）。


## 2026-10-25（障碍物炫酷化 + 降低难度）

- **障碍外观**：土路跑酷多种道具（木箱 3D 面、橙白路障、感叹号警示牌、红白列车车头）；悬空空间水晶 / 晶簇 / 发光方尖碑；地面阴影 + 渐变/高光；金币加光晕与内环。
- **难度下调**（仍需时机跳跃，非无脑）：
  - 开局速度 280→**220**，上限 520→**400**，距离加速系数 0.35→**0.20**；障碍接近略慢（zSpeed×0.50）。
  - 刷障间隔底 1.1→**1.55**、下限 0.55→**0.95**、距离分母 800→**1400**；同道近距与邻道密集墙过滤；开局第一刷延后。
  - 碰撞带略收窄 0.68–0.84→**0.70–0.82**；跳跃时长/高度保持宽松。
- 列车/方尖碑仅视觉「高」——跳跃仍可越过（本次优先降难度）。若 XBuilder 要对齐造型，需另做资源同步。
- 仅改 `mobile-web/game.js` + docs。


## 2026-10-25（炸弹💥真正清障 + 爆炸反馈）

- 修「炸弹爆炸没有效果」：按下后**整条当前道**障碍清除（金币保留）；飞行弹体沿途继续清障。
- 强化反馈：玩家处大爆炸粒子、冲击环、💥 闪屏、短暂震屏；冷却仍约 1.6s。



## 2026-10-25（换道：一滑只一道）

- 修「滑动一下子滑了两个赛道」：`pointermove` 仍即时换道，但同一手势换道后锁到抬手，不再连滑两道。阈值仍约 18px。



## 2026-10-25（触控手感 + 微信登录 / 排行 / Top3 奖金）

- **换道更跟手**：滑动阈值 40→18px；`pointermove` 即时换道（可连滑）；`LANE_SNAP` 0.58 + `LANE_LERP` 30；触控 `passive:false` + `preventDefault`。
- **微信登录（演示）**：标题页「微信登录」→ 昵称/头像 mock；`localStorage` 持久化；预留 `window.__RB_WECHAT_OAUTH` 接真授权。
- **记录**：得分榜 + 最长游玩榜（本机）；结算写入并展示「我的最佳」。
- **Top3 现金奖励广告**：标题/结算展示 ¥100/¥50/¥20（`PRIZE_CONFIG`，标活动预告）；文档 [`WECHAT_LOGIN_LEADERBOARD.md`](WECHAT_LOGIN_LEADERBOARD.md)。
- 仅改 `mobile-web/` + docs；**未动 XBuilder**。



## 2026-10-25（手机网页跳跃手感）

- 调松跳跃：`JUMP_DURATION` 0.55→0.82、`JUMP_HEIGHT` 90→125；碰撞区收窄 0.68–0.84；加跳缓冲/落地宽限，开局速度下也能跳过普通障碍（仍需时机）。XBuilder 桌面版未改，如需另调。


## 2026-10-25（悬空空间 → 手机网页）

- 同步 XBuilder 地图「悬空空间」进 [`mobile-web/`](../mobile-web/)：开局可选 **土路跑酷** / **悬空空间**。
- 悬空空间：粉紫星云、弯月、漂星、半透明星轨三道、水晶粉障；操作与金币/炸弹不变。
- 触控选图 + 结算「换地图」；桌面调试标题页 `4`/`7`。
- 备用 Pages：https://liangchaoboy.github.io/running_bull/mobile-web/
- 零新依赖；未改 XBuilder 工程。

## 2026-10-25（微信文档）

- 更新 WECHAT_DISTRIBUTION：主路径改为自托管手机网页；备用 Pages https://liangchaoboy.github.io/running_bull/mobile-web/；正式入口待七牛 Kodo+CDN。

## 2026-10-25（手机网页版）

- 新增独立静态站 [`mobile-web/`](../mobile-web/)：竖屏三道、触控换道/跳/炸弹、金币、结算重开；**零 npm 依赖**，不依赖 XBuilder。
- 面向微信可开的自托管 H5；`x.qiniu.com` 标为仅桌面。
- 国内推荐托管：七牛 Kodo/CDN、Gitee Pages、自有域名；GitHub Pages 仅作备用（国内微信可能慢/不可用）。


## 2026-10-25（玩法 Publish）

- 宽三道面对屏幕：车道约 x=-70/0/70；障碍/金币/炸弹带近大远小缩放。
- 跑动感：牛 跑1–4、鹿 走路1–5、狗 跑帧；落地阴影；换道 lerp。
- 金币：同道 5 连串可捡；HUD「金币」；得分含 金币×10。
- 炸弹：按 **B** 沿当前道上行清障，冷却约 1.6s。
- Publish：https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull
- 未做：真 3D 梯形赛道、滑铲（无 slide 造型）。

## 2026-10-25

- 玩法改为面对屏幕三道跑酷：竖向道路、障碍自上而下、←→/A/D 换道、空格起跳。
- Publish 同链：https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull
- 画面参考：《地铁跑酷》官网 https://pao.uu.cc/phone_index.html（宽三道纵深、饱和色）。
- 进行中：加宽赛道、跑动感、炸弹清障。
- 文档仓 `main` 已同步 intro / 操作说明（本仓库）。活动主库 `neikochan/running_bull` 当前账号仅 pull，待写权限后再同步。
- 新增 [`docs/WECHAT_DISTRIBUTION.md`](WECHAT_DISTRIBUTION.md)：微信 H5 落地路径（今天投链+码为主；小游戏迁出后排）。

## 2026-10-24

- 去活动文案的公开简介；多角色多地图；土路滚动；跳跃/碰撞手感调整；脚步 BGM。
