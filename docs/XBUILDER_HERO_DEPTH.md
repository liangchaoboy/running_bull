# XBuilder：动漫角色跑动立体感（item 6）

反馈：「动漫人物跑动显得不是很立体」→ 指菜单可选的 **牛 / 鹿 / 狗** 动漫动物主角（含悬空 mapId4），不是单独人形。

## 规则（DEPTH_FEEL_SCORECARD #6）

| 差 | 好 |
|----|----|
| 侧倾 / 纸片翻（`Normal` + heading lean） | 背对锁旋转 + 稳定垂直 bob |
| 换道扭躯干 | 换道仅 xpos lerp |

目标：item 6 ≥4，无单项 ≤2。

## 实现要点

1. **代码：** `setRotationStyle None`，`setHeading 90`；跑帧只换造型 + bob；跳不 tilt。
2. **造型：** 背对四分之三 `bull/deer/dog_0..4`（hips 近 / 头远 pear）；见 `art/forest_run/` 与 `xb_upload/forest_heroes/COSTUME_MAP.md`。
3. **Publish 顺序：** XBuilder 先改并 Publish 同链 → 再 sync mobile-web。

粘贴包与评分估计见 `/workspace/agent-tools/anime-hero-3d-NOTES.md`。

## mobile-web sync
- `?v=hero3d1`：pear 造型 + `drawPlayerRear` bob≈10 / plant size 1.04·0.99；全模式优先背对精灵。
- 详见 `/workspace/agent-tools/anime-hero-3d-web-NOTES.md`（推送后）。
