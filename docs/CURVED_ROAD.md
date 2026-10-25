# 轻微弯道（forest / earth）

## 目标

路不全是死直线：灭点与路心随距离缓慢左右摆，像林间/土路自然弯折，但不影响换道可玩性。

## 公式（mobile-web）

```
phase = distance * k - (1 - z) * 0.85
depth = 0.4 + 0.6 * z
curveDx = sin(phase) * vw * ampFrac * depth
cx = vw * 0.5 + curveDx
```

| 模式 | k | ampFrac |
|------|---|---------|
| forest | 0.038 | 0.06 |
| earth | 0.032 | 0.045 |
| plane | 0.036 | 0.055 |
| 其它 | — | 0（直路） |

`z=0` 远景、`z=1` 近景。远景相位略滞后，读起来是连续弯而不是整屏平移。

## 接入点

- `curveDx(z, vw)` → `project` / `roadEdges`
- 土路 / 优美森林路面填充改为沿 z 多段折线，贴合弯道

## XBuilder

在路心 / 灭点 X 上套同一 `sin(distance * k)`；道边树、虚线、障碍跟 `cx` 走。
