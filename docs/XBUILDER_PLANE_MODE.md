# XBuilder 对齐笔记：飞机大战跑酷 ✈️

> **顺序**：先在 XBuilder 粘贴本包并 **Publish** 同链 → 再硬刷 mobile-web `?v=plane1`。  
> 粘贴总览：``docs/xb_patches/plane/APPLY_PLANE.md`（工作区镜像 `/workspace/xb_src/patches/plane/`）`  
> 美术：原创几何（`mobile-web/assets/plane/`），非商业素材。

## 模式一句话

**飞机大战跑酷**：三道纵深跑酷 + 默认**连续扫射**；小怪 / 大怪需**多次命中**才灭；航路带**弯道**（同 feel1 / 森林软弯）。

## 选型

| 项 | 值 |
|----|-----|
| mapId | **7** |
| 菜单键 | **0**（1–9 已占：角1–3 / 图4–9） |
| mode id（web） | `plane` |
| 默认火力 | 开局即扫射，约每 **0.14s** 一发（当前道） |
| 弯道 | `curveBend` 同森林：`sin` 摆动；web `CURVE_K_PLANE=0.036` / amp `0.055` |
| 计分 | 同土路：`距离×(1+勇敢) + 金币×10`；击毁小怪 +1 币、大怪 +3 币 |

## HP 表（多击）

| 敌人 | spawn 条件 | HP | 尺寸 / 威胁 | 击毁奖励 |
|------|------------|-----|-------------|----------|
| 小怪 `enemy_small` | `spawnKind` 1–3（约 75%） | **3** | 小；挡道 | +1 金币 |
| 大怪 `enemy_big` | `spawnKind` 4（约 25%） | **10** | 大；难清 | +3 金币 |

每发子弹伤害 **1**；炸弹（B）本模式 = **导弹**：当前道前方一次 **-5 HP**（可连按冷却 1.6s）。  
植物模式豌豆/加特林/樱桃逻辑**不进**本模式。

## 操作（与现有一致 + 扫射）

| 输入 | 效果 |
|------|------|
| ←→ / A D | 换道 |
| 空格 / 上 | 跳（闪） |
| 下 | 滑铲 |
| **自动** | 扫射（默认开；无需按住） |
| B | 导弹（-5 HP 当前道） |
| 菜单 **0** | 选「飞机大战」 |
| 空格（菜单） | 开跑 |

## XBuilder 粘贴清单

1. Stage：`stage_plane.snippet.spx`（vars / Key0 / mapId7 / 弯道 / 自动 `planefire` / applymap / boot）
2. 新建 Sprite **PlaneBullet**（或复用豌豆子弹造型）：`PlaneBullet.spx`
3. 新建或改障碍 Sprite **PlaneEnemy**（小/大造型）：`PlaneEnemy.spx`（HP、吃弹、撞英雄 `hit`）
4. Road：`Road_plane.snippet.spx`（mapId==7 弯道跟随 `curveBend`；可用 `road2` + 亮蓝滤镜）
5. 三英雄 `showmenu`：补 mapId==7 名「飞机大战」与键说明含 `0飞机`
6. Backdrop：暂用 `sky`；可选上传云空造型命名「云空」后改 applymap

## 验收

- [ ] 菜单键 **0** 可选；HUD/说词含「飞机大战」
- [ ] 开跑即连续扫射，无需按火力键
- [ ] 小怪需约 3 发；大怪需约 10 发；一发不秒
- [ ] 道路偶发左右弯，换道仍可用
- [ ] forest / plant / feel1 激励跳过结算不变
- [ ] Publish 同链 `running_bull` 后硬刷；web `?v=plane1` 对齐

## mobile-web 对照

| 项 | 值 |
|----|-----|
| 菜单卡片 | 「飞机大战」✈️ |
| 调试键 | `0` |
| 素材 | `mobile-web/assets/plane/*.png` |
| 缓存 | `?v=plane1` |
