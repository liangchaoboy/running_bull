# road3 / feel3 — 道路可读性（可见增强）

Playtest feel2：「弯道泥土几乎直」「坡度无感」「山洞只有字」。本包把弯/坡/洞做成**肉眼可见**，不动转向贴轨、植物、BGM。

## Web constants（before → after）

| Const | feel2 | road3 | × |
|-------|------:|------:|--:|
| `CURVE_AMP_DEFAULT` | 0.042 | **0.080** | 1.90 |
| `CURVE_AMP_EARTH` | 0.055 | **0.100** | 1.82 |
| `CURVE_AMP_FOREST` | 0.075 | **0.120** | 1.60 |
| `CURVE_AMP_PLANE` | 0.065 | **0.110** | 1.69 |
| `CURVE_AMP_PLANT` | 0.038 | **0.072** | 1.89 |
| `CURVE_AMP_SPACE` | 0.035 | **0.066** | 1.89 |
| `CURVE_AMP_CHILL` | 0.028 | **0.050** | 1.79 |
| curve near `depth` | `0.4+0.6z` | **`0.12+0.88·z^1.35`** | near whip |
| `ROAD_SLOPE_AMP` | 0.028 | **0.062** | 2.21 |
| bridge rise | `0.012·vh·z` | **`0.028·vh·z`** | — |
| cave descend | — | **`+0.024·vh·z`** | new |
| `ROAD_WIDTH_AMP` | 0.11 | **0.16** | 1.45 |
| cave Brightness (XB) | −28 | **−48** | — |
| hero `curveBend*` (XB) | 0.25 | **0.42** | 1.68 |

**Intact:** `LANE_SNAP=0.92` · plant · BGM/`?v` 仅 bust 到 road3 · playfix1.

## Web behavior

- 分段仍 `ROAD_SECTION_LEN=160`：平原→桥→山洞。
- 进段横幅 ~**1.2s**：`过桥` / `进入山洞`（canvas banner）。
- 山洞：更厚岩壁 + 洞口拱形剪影 + 更重暗角。
- 桥：双层护栏、更粗立柱、更深桥下阴影。

## XBuilder

见 `docs/xb_patches/road3/APPLY_ROAD3.md`（Stage amp + Camera bob + sec broadcast；Hero lean+say；Road Brightness）。

镜像已写入：`/workspace/xb_src/stage_ad.spx`、三英雄、`/workspace/xb_src/patches/road3/`。

## Cache bust

`mobile-web/index.html` → `?v=road3`（script + css）。

## Smoke checklist

- [ ] 默认/泥土：近处弯道左右甩明显（不再几乎直线）
- [ ] 森林：弯道更强但不失控
- [ ] 坡度：地平线/路面明显起伏；桥偏高、洞偏低
- [ ] 进山洞：变暗 + 洞口剪影 + 「进入山洞」横幅
- [ ] 过桥：护栏可见 + 「过桥」横幅
- [ ] 换道贴轨仍干脆；植物密度不变；BGM/静音仍在
- [ ] **不** git push（由 parent Publish XB 后再推）

试玩（推送后）：`https://liangchaoboy.github.io/running_bull/mobile-web/?v=road3`
