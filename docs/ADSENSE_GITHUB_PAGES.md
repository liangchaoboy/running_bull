# GitHub Pages 上接 Google AdSense（展示广告）

> 目标：在 `mobile-web` 试跑 **AdSense 展示广告**分成。  
> **AdSense ≠ 激励视频**。撞障 `__RB_REWARDED_AD` 仍为 mock；真激励需微信小游戏 / TapTap / AdMob 等。

试玩（缓存参数）：  
https://liangchaoboy.github.io/running_bull/mobile-web/?v=adsense1

## 现状（本仓库已准备）

| 项 | 路径 / 说明 |
|----|-------------|
| 隐私政策 | `mobile-web/privacy.html` |
| 关于页 | `mobile-web/about.html` |
| ads.txt 占位 | `mobile-web/ads.txt`（**发布商行已注释**，勿填假 pub id） |
| 展示位 | 标题页 `#ad-slot-menu`、结算页 `#ad-slot-over` |
| 配置 | `window.__RB_ADSENSE`（默认 `enabled: false`） |
| 激励占位 | `window.__RB_REWARDED_AD`（与 AdSense 无关） |
| 抽奖文案 | 已标 **示意 / 非赌博** |

未配置真实 `ca-pub-…`、未把 `enabled` 设为 `true` 前：**不会**加载 `adsbygoogle.js`。

## Vincent 开通步骤

1. 用 Google 账号打开 [AdSense](https://www.google.com/adsense/)，申请网站。  
2. 站点 URL 建议优先：
   - 长期：自有域名指向 Pages；或
   - 短期试：`https://liangchaoboy.github.io/`（用户站根）——项目子路径 `…/running_bull/mobile-web/` **审核拒签风险更高**。  
3. 按后台提示完成站点验证（ADS 代码片段或 DNS / meta）。  
4. 过审后复制发布商 ID：`ca-pub-################`。  
5. 在 AdSense 建两个**展示广告单元**，记下 `data-ad-slot` 数字。  
6. 编辑 `mobile-web/index.html` 里的配置（或在托管前用构建替换）：

```html
<script>
  window.__RB_ADSENSE = {
    enabled: true,
    client: "ca-pub-你的真实数字",
    slots: { menu: "广告位ID1", result: "广告位ID2" },
    loadScript: true,
    provider: "adsense-display"
  };
</script>
```

7. 解开 `mobile-web/ads.txt` 中的 Google 行，把 `pub-XXXXXXXXXXXXXXXX` 换成你的 pub（与 ca-pub 数字一致），例如：

```text
google.com, pub-你的数字, DIRECT, f08c47fec0942fa0
```

8. **强烈建议**再在用户站根提供可爬的 ads.txt：  
   `https://liangchaoboy.github.io/ads.txt`  
   （需 `liangchaoboy.github.io` 用户站仓库；项目站子路径可能不被认作站点根。）  
9. 硬刷新 `?v=adsense1`（或新版本号）验证展示位；localhost / 127.0.0.1 下脚本会跳过加载。  
10. 撞障流程：**不要**把 AdSense 展示当成「看完复活」；继续用 `__RB_REWARDED_AD` mock，或日后换真激励 SDK。

## 风险（github.io）

- 空白少内容、纯 Canvas、github.io 子路径、抽奖/红包文案像赌博 → 易拒审或限收。  
- 对策：隐私 + 关于页（已加）、抽奖标示意/非赌（已加）、稳定可玩、最好自有域名。  
- **禁止**使用占位 `ca-pub-XXXXXXXX…` 去加载真实广告脚本（违反政策）。

## 与激励广告的分工

| API | 用途 |
|-----|------|
| `window.__RB_ADSENSE` + `showDisplayAd` | 标题 / 结算 **展示** 位 |
| `window.__RB_REWARDED_AD` | 撞障 **激励**（当前 mock） |

详见 `docs/REWARDED_AD_HIT.md`。

## 本周可执行顺序（提醒）

1. 申请 AdSense（可先用 github.io，预期可能需补域名）  
2. 过审后粘贴真实 ca-pub + slot，设 `enabled: true`  
3. 更新 ads.txt（子路径 + 尽量用户站根）  
4. 有量后再看 RPM；未过审前收入预期为 0  
5. 有域名后迁根域名再重新验证
