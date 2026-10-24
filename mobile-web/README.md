# 勇敢牛牛 · 手机网页版

独立 **静态 HTML5** 竖屏跑酷，**不依赖 XBuilder**，可用微信打开（需部署到国内可访问的 HTTPS 静态托管）。

口号：**勇敢牛牛，不怕困难。**

## 本地打开

任选其一：

```bash
# 方式 A：直接打开（部分浏览器限制 file:// 模块，本页无外部模块，一般可用）
open mobile-web/index.html   # macOS
# 或双击 index.html

# 方式 B：本地静态服务（推荐）
cd mobile-web
python3 -m http.server 8080
# 浏览器打开 http://127.0.0.1:8080/
```

手机同一局域网可用电脑 IP 访问；微信内调试请用可公网访问的 HTTPS 地址。

## 操作（纯触控，无需键盘）

| 操作 | 效果 |
|------|------|
| ◀ / ▶ 或左右滑 | 换道（左 / 中 / 右） |
| 「跳」或上滑 / 点屏幕上半 | 起跳躲障 |
| 💣 | 丢炸弹，清当前道前方障碍（约 1.6s 冷却） |
| 路过金币 | 自动捡起；得分 = 距离 + 金币×10 |

## 文件

- `index.html` — 页面壳与 HUD / 触控按钮
- `style.css` — 竖屏布局（max-width ~420px）
- `game.js` — Canvas 三道纵深跑酷逻辑（零 npm 依赖）

## 线上托管（微信可玩）

XBuilder 发布页（`x.qiniu.com`）**不适合手机微信**。本目录需自行部署：

| 方案 | 说明 |
|------|------|
| **七牛 Kodo + CDN**（推荐） | 上传本目录，开公开读 + HTTPS 域名；国内微信友好 |
| **自有域名 + CDN** | 同静态站；可绑业务域名以后做小程序 web-view |
| **Gitee Pages** | 国内可开；注意 Pages 配额与强制 HTTPS |
| **GitHub Pages** | URL 形如 `https://liangchaoboy.github.io/running_bull/mobile-web/`；**国内微信常慢或被墙，勿当作主路径** |

部署后把正式试玩 URL 写回仓库 `README.md` 与 `docs/WECHAT_DISTRIBUTION.md`。

## 与 XBuilder 版关系

| | XBuilder 版 | 本手机网页版 |
|--|-------------|--------------|
| 地址 | `x.qiniu.com/.../running_bull` | 本目录静态文件 |
| 手机微信 | 基本不可用 | 部署后可用 |
| 玩法 | 面对屏幕三道 + 金币 + 炸弹 | 同思路的精简触控复刻 |

改玩法优先改本目录即可独立迭代；不必等 XBuilder。
