# road4 — 桥/洞/弯/坡肉眼一秒可读

road3 实机不及格（泥土）：桥=细栏杆+远阴影、无抬升/空隙；洞=远拱+角暗、路心仍亮；弯=近场几乎直；坡≈无感。  
本包 **改绘制**（undergap / 实心近场岩壁 / 全隧压暗 / 近端甩弯），不只加 amp 或标签。

## Web constants（before → after）

| Const | feel2 | road3 | **road4** | × feel2 |
|-------|------:|------:|----------:|--------:|
| `CURVE_AMP_DEFAULT` | 0.042 | 0.080 | **0.145** | 3.45 |
| `CURVE_AMP_EARTH` | 0.055 | 0.100 | **0.170** | 3.09 |
| `CURVE_AMP_FOREST` | 0.075 | 0.120 | **0.195** | 2.60 |
| `CURVE_AMP_PLANE` | 0.065 | 0.110 | **0.180** | 2.77 |
| `CURVE_AMP_PLANT` | 0.038 | 0.072 | **0.125** | 3.29 |
| `CURVE_AMP_SPACE` | 0.035 | 0.066 | **0.115** | 3.29 |
| `CURVE_AMP_CHILL` | 0.028 | 0.050 | **0.090** | 3.21 |
| curve near `depth` | `0.4+0.6z` | `0.12+0.88·z^1.35` | **`0.04+0.96·z^1.55`** | near whip |
| `ROAD_SLOPE_AMP` | 0.028 | 0.062 | **0.110** | **3.93** |
| bridge rise | `0.012·vh·z` | `0.028·vh·z` | **`0.068·vh·(0.25+0.75z)`** | — |
| cave descend | — | `0.024·vh·z` | **`0.060·vh·(0.25+0.75z)`** | — |
| bridge near width mul | — | ×0.88 | **~×0.54** | berm |
| cave near width mul | — | ×0.82 | **~×0.48** | pinch |
| cave Brightness (XB) | −28 | −48 | **−72** | — |
| hero `curveBend*` (XB) | 0.25 | 0.42 | **0.62** | — |
| Camera slopeBob (XB) | ~Sin*11 | Sin*22±14/16 | **Sin*38 +28/−30** | — |

**Intact:** `LANE_SNAP=0.92` · plant · BGM Bravery Run · ui1（无道具钮）· playfix1 · `ROAD_SECTION_LEN=160`.

## Web drawing changes

### Bridge
- **Narrow berm/causeway** via near-weighted `roadWidthMul` (~0.54 near).
- **Undergap / gorge**: dark void fills left/right of deck + cliff lips dropping below edges (shadow trench).
- **Thick tall rails**: posts `h≈22+58z`, triple rail lines, bright caps.
- **Deck lift**: slopeDy rise + near-bed bright rim stroke.

### Cave
- **Solid rock walls to near field** (opaque, cover grass/mud shoulders).
- **LARGE mouth silhouette**: arch half-width ≥~0.28·vw, top ~0.38·vh above far.
- **WHOLE tunnel dark including road surface**: fill road polygon `rgba(0,0,0,0.52)` + heavy radial vignette + side crush.
- **Pinch**: near width mul ~0.48.

### Curve / slope
- Amp ~3× feel2; depth power 1.55 so far almost straight, near whip-bends centerline/edges.
- `ROAD_SLOPE_AMP=0.110` (≥3× feel2 0.028); bridge/cave dy offsets bold.

## XBuilder

见 `docs/xb_patches/road4/APPLY_ROAD4.md`（Stage amp + Camera bob；Hero lean；Road Brightness −72 / size pinch）。  
`say` 可选，**不能单独当验收**。

镜像：`/workspace/xb_src/stage_ad.spx`、三英雄、`/workspace/xb_src/patches/road4/`。

## Cache bust

`mobile-web/index.html` → `?v=road4`（script + css）。

## Smoke checklist

- [ ] 泥土/默认：近场弯道甩弯比换道抢眼（中线/边缘可见弯）
- [ ] 过桥（~160）：路明显变窄成堤；粗高护栏；桥下空隙/阴影沟；地平上抬
- [ ] 进洞（~320）：两侧实心岩壁到近场；大口拱影；**路心也暗**；pinch 明显；地平下压
- [ ] 坡：起伏肉眼可见（≥ feel2 的 3×）
- [ ] 换道贴轨仍干脆；植物/BGM/静音/无道具钮仍在
- [ ] **不** git push（parent XB Publish 后再推）

试玩（推送后）：`https://liangchaoboy.github.io/running_bull/mobile-web/?v=road4`
