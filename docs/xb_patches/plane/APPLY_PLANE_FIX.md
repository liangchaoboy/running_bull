# APPLY · plane2 — 飞机显示后消失（mapId 7）

**Project:** https://x.qiniu.com/project/wechat-f860f2cd2d58bcf7/running_bull  
**Auth:** t142u  
**Order:** paste fixes below → **Publish** same share link → hard-refresh mobile-web `?v=plane2`.

## Root cause

| 端 | 原因 |
|----|------|
| **mobile-web** | `drawPlayerPlane` / `project` 把小数 `displayLane` 直接当 `LANE_X[lane]` 下标 → `undefined` → 坐标 `NaN` → **一换道飞机不画**（开局 lane=1 整数所以先能看见）。 |
| **XBuilder** | 开跑后英雄 `setCostume "跑1"…"跳"`；若 Publish 时造型被换成战斗机包、缺跑/跳帧 → **默认造型闪一下再空白**。旧 `Obstacle` 在 mapId7 仍可能 clone，挡/盖住英雄。 |

## A. Heroes（牛 / 鹿 / 狗）— 必做

在每个英雄 `forever` 里、`setHeading 90` 之后的 **跑动造型块**，换成工作区完整文件（已含 mapId==7 分支）：

- `/workspace/xb_src/hero_cow.spx`
- `/workspace/xb_src/hero_deer.spx`
- `/workspace/xb_src/hero_dog.spx`

或只粘贴 `mapId == 7` 分支逻辑（见 `hero_plane_visible.snippet.spx`）：

- mapId==7：`show` + **只** `setCostume "默认"`（已知存在的造型）+ bob/size，**禁止**切 `跑1–4` / `跳`
- 其它 map：保持原跑动循环
- `invulnT` 仍只用 Brightness，结束 `clearGraphicEffects`（禁止 Ghost 100）

## B. Obstacle — 必做

`onMsg "spawn"` 改为（跳过飞机模式）：

```
onMsg "spawn", => {
	if !isClone && running && spawnKind < 2 && mapId != 7 {
		clone
	}
}
```

参考：`/workspace/xb_src/patches/plane/Obstacle_plane_guard.spx`

## C. PlaneBullet — 建议

1. 起点 `setYpos heroFeet + 42`（离开机体）
2. 碰撞只 `touching("PlaneEnemy")`（去掉 `障碍`/`Obstacle`，避免贴脸误判）

文件：`/workspace/xb_src/patches/plane/PlaneBullet.spx`

## D. PlaneEnemy — 检查

- 造型名必须是 **`small` / `big`**（已上传）；缺造型会空白，但不应藏英雄
- 克隆 `show`；`die` 只在自己身上；**不要**对英雄 `hide`

## E. Publish checklist (computerUse)

- [ ] 三英雄 mapId7 锁定 `默认` + `show`
- [ ] Obstacle spawn 排除 mapId7
- [ ] PlaneBullet 起点抬高 + 只碰 PlaneEnemy
- [ ] 键 **0** → 开跑 → **换道多次**，机体一直可见
- [ ] 扫射 / 小怪多击 / 弯道仍正常
- [ ] forest / plant / feel1 激励不变
- [ ] **Publish** 同链
- [ ] 网页硬刷 `?v=plane2`

## F. Paths

| 项 | 路径 |
|----|------|
| 本说明 | `/workspace/xb_src/patches/plane/APPLY_PLANE_FIX.md` |
| 仓库镜像 | `docs/xb_patches/plane/APPLY_PLANE_FIX.md` |
| 英雄片段 | `/workspace/xb_src/patches/plane/hero_plane_visible.snippet.spx` |
| web | `mobile-web/?v=plane2` |
