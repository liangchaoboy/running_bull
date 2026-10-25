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

## 地图模式

开局点选（结算页可「换地图」）：

| 模式 | 画面 |
|------|------|
| **土路跑酷** | 阳光土路 · 木箱/路障/警示牌/列车造型障碍（对应 XBuilder 白天土路） |
| **优美森林** 🌲 | 阳光神光小径 · Quaternius/Kenney 道边树（键 6；无 Glimmerwood） |
| **悬空空间** | 粉紫星云 · 水晶/晶簇/方尖碑粉障 |
| **慢慢跑酷** 😎 | lo-fi 暖色慢速 · **积分主看存活时长**（秒×10+金币） |
| **植物跑酷** 🌻 | 草坪 · 僵尸障 · 植物道具 · 樱桃连续清障 10s（致敬美术，非官方） |

角色可选 **牛牛 / 小鹿 / 小狗**（背对四分之三跑姿，锁旋转）。操作在各地图下相同（植物模式炸弹键变为樱桃 10s）。桌面调试：`4` 土路 / `6` 森林 / `7` 悬空 / `5` 慢慢 / `9` 植物；`1/2/3` 选角（仅标题页）。

> 难度已略下调：开局更慢、障碍更疏；跳跃仍可越过全部障碍，但需要一点时机。
>
> 新模式 **慢慢跑酷**：标题页选 😎；积分看时长。XBuilder 对齐见 `docs/XBUILDER_CHILL_MODE.md`（本仓库无工程文件，未 Publish）。
>
> **无敌冲撞**：每局 3 次，点 🛡️ 开 10 秒撞碎障碍。对齐见 `docs/XBUILDER_INVULN.md`。
>
> 炸弹有明显爆炸动画；跑道含路缘/灯柱/视差；吃币有飘字。对外展示向打磨（XBuilder 未对齐）。

## 操作（纯触控，无需键盘）

| 操作 | 效果 |
|------|------|
| ◀ / ▶ 或左右滑 | 换道（左 / 中 / 右；滑动约 18px 即响应） |
| 微信登录 | 演示登录记入本机排行；正式 OAuth 见 docs/WECHAT_LOGIN_LEADERBOARD.md |
| Top3 奖金 + 趣味抽奖 | 海报三行：玩满 2 分钟或金币≥200 可抽；越多券越多（最多 8）；每天 1 次。Top3 ¥100/¥50/¥20。规则 docs/LOTTERY_RULES.md |
| 「跳」或上滑 / 点屏幕上半 | 起跳躲障 |
| 💣 | 丢炸弹，清当前道前方障碍（约 1.6s 冷却） |
| 路过金币 | 自动捡起；得分 = 距离 + 金币×10 |

## 文件

- `index.html` — 页面壳、HUD、触控按钮、地图选择
- `style.css` — 竖屏布局 + 土路/悬空/慢慢/植物主题色
- `game.js` — Canvas 三道纵深跑酷逻辑（零 npm 依赖）；含演示登录 / 本机排行 / 奖金配置
- `assets/` — 植物跑酷原创致敬 PNG（见 `assets/CREDITS.md`）

## 线上托管（微信可玩）

XBuilder 发布页（`x.qiniu.com`）**不适合手机微信**。本目录需自行部署：

| 方案 | 说明 |
|------|------|
| **七牛 Kodo + CDN**（推荐） | 上传本目录，开公开读 + HTTPS 域名；国内微信友好 |
| **自有域名 + CDN** | 同静态站；可绑业务域名以后做小程序 web-view |
| **GitHub Pages** | URL 形如 `https://liangchaoboy.github.io/running_bull/mobile-web/`；**国内微信常慢或被墙，勿当作主路径** |

备用 Pages：https://liangchaoboy.github.io/running_bull/mobile-web/

部署后把正式试玩 URL 写回仓库 `README.md` 与 `docs/WECHAT_DISTRIBUTION.md`。


## 广告（AdSense 展示 · 默认关闭）

- 隐私 / 关于：`privacy.html`、`about.html`（标题页与结算页有链接）
- 展示位占位：标题页、结算页；配置 `window.__RB_ADSENSE`（默认不加载脚本）
- 撞障激励仍为 mock（`__RB_REWARDED_AD`）；**AdSense ≠ 激励视频**
- 步骤与风险：仓库 `docs/ADSENSE_GITHUB_PAGES.md`
- ads.txt：`mobile-web/ads.txt`（发布商行注释占位；正式需真实 pub + 最好用户站根 ads.txt）
- 抽奖文案已标 **示意 / 非赌博**

试玩：https://liangchaoboy.github.io/running_bull/mobile-web/?v=feel1

## 与 XBuilder 版关系

| | XBuilder 版 | 本手机网页版 |
|--|-------------|--------------|
| 地址 | `x.qiniu.com/.../running_bull` | 本目录静态文件 |
| 手机微信 | 基本不可用 | 部署后可用 |
| 玩法 | 面对屏幕三道 + 金币 + 炸弹 + 多地图 | 同思路触控复刻；含土路 / 悬空空间 |
| 新模式流程 | **先在 XBuilder 做并 Publish** | 再同步进本目录 |

改玩法：**先 XBuilder，再本目录**。零新依赖。


已同步优美森林与背对冲刺（`?v=forest1`）。
