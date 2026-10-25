# road5 — 洞实心岩壁 + 平路甩弯（road4 洞/弯 FAIL）

road4 泥土实机：桥 PASS、坡（上桥）PASS；**洞 FAIL**（绿肩+黑空、pinch 弱）；**弯 FAIL**（平路近场几乎直，靠桥窄堤衬弯）。  
本包 **改绘制**：洞壁不透明贴路缘 + 近场高岩面 + 更狠 pinch；平路 amp/深度甩弯抢过换道。桥抬升/栏杆/空隙保持。

## Web constants（road4 → road5）

| Const | road4 | **road5** | note |
|-------|------:|----------:|------|
| `CURVE_AMP_DEFAULT` | 0.145 | **0.220** | plain base |
| `CURVE_AMP_EARTH` | 0.170 | **0.255** | 泥土必过 |
| `CURVE_AMP_FOREST` | 0.195 | **0.285** | |
| `CURVE_AMP_PLANE` | 0.180 | **0.265** | |
| `CURVE_AMP_PLANT` | 0.125 | **0.185** | |
| `CURVE_AMP_SPACE` | 0.115 | **0.170** | |
| `CURVE_AMP_CHILL` | 0.090 | **0.135** | |
| `CURVE_K_EARTH` | 0.038 | **0.044** | 略快相位 |
| plain sec mul | 1.00 | **×1.12** | 不靠桥 |
| bridge / cave mul | 1.45 / 1.08 | **1.45 / 1.12** | 桥保持 |
| curve near `depth` | `0.04+0.96·z^1.55` | **`0.02+0.98·z^2.05`** | 近端硬甩 |
| phase depth term | `(1-z)·1.05` | **`(1-z)·1.95`** | 中线出 S |
| cave near width mul | ~×0.48 | **~×0.34** | pinch |
| bridge near width | ~×0.54 | **~×0.54** | keep |
| cave descend | `0.060·vh·…` | **`0.078·vh·…`** | +1 notch |
| bridge rise | `0.068·vh·…` | **same** | keep |
| `ROAD_SLOPE_AMP` | 0.110 | **0.110** | keep |

**Intact:** `LANE_SNAP=0.92` · plant · Bravery Run · ui1（无道具钮）· playfix1 · boost/plane · `ROAD_SECTION_LEN=160`.

## Drawing changes vs road4

### Cave（必过）
1. **泥土底肩**：洞段不再铺绿草，改不透明岩床（`#1a1410→#3a2c22`）；洞内不画路灯柱/草丛。
2. **实心岩壁贴路缘**：左右多边形从屏边画到 `e.left/right ± enc`（近端 encroachment `2+16z`），**全不透明**（去掉 road4 边缘 alpha 0.55）。
3. **近场高岩面**：沿 berm 竖条 `h≈32+120z`、宽 `12+42z`，肉眼是墙不是绿肩。
4. **pinch**：近端宽 ≈ plain 的 **0.34**（road4 ~0.48）；侧压暗加宽。
5. **保留**：大口拱门剪影 + 路心压暗（已 PASS）。

### Curve（必过）
1. 平路 amp 大幅抬高 + plain ×1.12；**不**依赖桥上窄路衬弯。
2. 深度 `z^2.05` + 相位差 `1.95` → 近场 1 秒内中线/边缘可见 **S/甩**，比换道抢眼。
3. 虚线/路缘跟随 `curveDx`（原逻辑，amp 加大后可读）。

### Bridge / slope
- 桥：窄堤、空隙、粗栏、抬升 **保持**。
- 洞下沉 +1 档（非 blocker）；桥抬升不变。

## XBuilder

见 `docs/xb_patches/road5/APPLY_ROAD5.md`（Stage amp + Camera bob；Hero lean；Road Brightness/size）。  
镜像：`/workspace/xb_src/stage_ad.spx`、三英雄、`/workspace/xb_src/patches/road5/`。

## Cache bust

`mobile-web/index.html` → `?v=road5`（script + css）。

## Smoke checklist

- [ ] **平路**（泥土）：开跑 ~1s 内近场中线/边缘甩弯，比换道抢眼（不靠桥）
- [ ] 过桥（~160）：仍窄堤+空隙+粗栏+抬升（与 road4 同档）
- [ ] 进洞（~320）：两侧**实心岩壁贴路缘**（无绿肩/黑空）；近端路宽明显窄于 plain；拱门+路心暗仍在；下沉略强
- [ ] 换道贴轨仍干脆；植物/BGM/静音/无道具钮仍在
- [ ] **不** git push / **不** XB Publish（parent 粘贴 Publish 后再推）

试玩（parent 推送后）：`https://liangchaoboy.github.io/running_bull/mobile-web/?v=road5`
