# XBuilder / spx 搭建笔记（Day1）

> 面向：会一点 Scratch 思维、第一次在 XBuilder 里拼跑酷的人。  
> 目标：按本文搭完即可对照 `GAME_DESIGN.md` / `LEVEL_1.md` 验收。  
> 平台 UI 文案以 x.qiniu.com 实际为准；下列用 **Sprite / Backdrop / 变量 / 事件** 描述。

---

## 1. 工程结构（建议）

| 对象 | 类型 | 职责 |
|------|------|------|
| 舞台 Backdrop | 背景 | 天空/草地；可选两张轮换做简易视差 |
| `Bull`（牛） | 角色 | 跑、跳、碰撞、擦边检测 |
| `Obstacle`（障碍） | 角色 | 造型=木桩/石块；被克隆后左移 |
| `UI_Text` 或 直接用变量监视 | 显示 | 距离、勇敢、得分；结算可用「说」或专用 Sprite |
| `Manager`（可选） | 角色 | 只放全局流程：开始/结算/重置；没有也可全挂在 Bull 上 |

**阶段变量（全局）：** `gameState` = `title` | `playing` | `over`

---

## 2. 需要的变量

### 全局

| 变量名 | 初值 | 说明 |
|--------|------|------|
| `gameState` | title | 流程 |
| `distance` | 0 | 距离分 |
| `braveStacks` | 0 | 勇敢层数 |
| `braveMultiplier` | 1 | 1+braveStacks |
| `score` | 0 | distance × multiplier |
| `runSpeed` | 8 | 卷轴/障碍速度 |
| `gravity` | 0.8 | 重力 |
| `jumpV` | 12 | 起跳速度 |

### Bull 私有（或全局也可）

| 变量名 | 初值 | 说明 |
|--------|------|------|
| `vy` | 0 | 垂直速度 |
| `onGround` | true | 是否在地面 |

### 障碍克隆体

| 变量名 | 初值 | 说明 |
|--------|------|------|
| `alreadyBrave` | false | 本障碍是否已给过勇敢 |

---

## 3. Backdrop / 造型清单

**Backdrop**

- `bg_main`：白天草地（演示主用）  
- （可选）`bg_title`：大标题「勇敢牛牛，天天跑酷」

**Bull 造型**

- `run1` / `run2`：跑步帧（可 2 帧切换）  
- `jump`：跳跃  
- `dead`：死亡  

**Obstacle 造型**

- `rock` 或 `stump`：一个够用；要区分擦边友好可复制造型仅改碰撞思路（或统一造型靠脚本缩危险盒）

**结算（任选其一）**

- 方案 A：结算时 `Bull`「说」多行文案 4 秒  
- 方案 B：Sprite `Panel` 显示/隐藏，造型上写死标题，数字用变量监视器拖到面板上  

---

## 4. 事件伪代码（Scratch / spx 思维）

### 4.1 绿旗 / 打开工程

```
当绿旗被点击:
  将 gameState 设为 "title"
  将 distance, braveStacks, score 设为 0
  将 braveMultiplier 设为 1
  广播 "reset_positions"
  显示标题提示（说「空格或点击开始」）
```

### 4.2 开始一局

```
当 按下空格键 或 鼠标被点击:
  如果 gameState = "title" 或 gameState = "over":
    广播 "start_game"

当收到 "start_game":
  将 gameState 设为 "playing"
  将 distance, braveStacks 设为 0
  将 braveMultiplier 设为 1
  将 score 设为 0
  Bull 移到起点 (x0, groundY)
  将 vy 设为 0; onGround=true
  删除所有 Obstacle 克隆体
  广播 "spawn_level_1"   // 或启动生成脚本
```

### 4.3 Bull：跑与跳

```
当收到 "start_game":
  永远:
    如果 gameState ≠ "playing": 停止此脚本
    // 跑步动画
    下一个造型 (run1/run2) 或 切换
    // 可选：Bull 略向右挪，或只让障碍左移（二选一，推荐障碍左移、牛 x 固定）

当 按下空格键 或 点击舞台:
  如果 gameState = "playing" 且 onGround:
    将 vy 设为 jumpV
    将 onGround 设为 false
    换成造型 jump

当收到 "start_game":  // 重力循环
  永远:
    如果 gameState ≠ "playing": 停止此脚本
    将 y 增加 vy
    将 vy 增加 -gravity   // 注意平台坐标：若 y 向上为正，重力为负
    如果 y ≤ groundY:
      将 y 设为 groundY
      将 vy 设为 0
      将 onGround 设为 true
```

### 4.4 距离分

```
当收到 "start_game":
  永远:
    如果 gameState ≠ "playing": 停止此脚本
    等待 0.05 秒
    将 distance 增加 1
    // 或: distance += round(runSpeed)
```

### 4.5 关卡生成（对齐 LEVEL_1）

**写法 A · 时间轴（好懂）**

```
当收到 "spawn_level_1":
  等待 2.5 秒 → 克隆 Obstacle
  等待 3.5 秒 → 克隆
  等待 3.5 秒 → 克隆
  …按 LEVEL_1.md 表继续
  // 克隆前可设置「本枚是否擦边友好」的私有变量
```

**写法 B · distance 阈值（手感稳）**

```
当 distance = 50: 克隆
当 distance = 120: 克隆
…
```

### 4.6 Obstacle 克隆体行为

```
当作为克隆体启动:
  移到 (spawnX, groundY+偏置)
  将 alreadyBrave 设为 false
  显示
   forever:
    如果 gameState ≠ "playing": 删除本克隆体
    将 x 增加 -runSpeed
    如果 x < 左界外: 删除本克隆体

    // —— 危险碰撞（死亡）——
    如果 碰到 Bull 的颜色/造型危险区:
      广播 "player_hit"
      停止此脚本

    // —— 勇敢擦边（放大检测，可用「距离 Bull 很近」或大一号隐形造型）——
    如果 alreadyBrave = false 且 「与 Bull 近距」且 「未处于危险盒」:
      将 alreadyBrave 设为 true
      将 braveStacks 增加 1
      如果 braveStacks > 9: 将 braveStacks 设为 9
      将 braveMultiplier 设为 1 + braveStacks
      广播 "brave_fx"   // 飘字「勇敢 +1！」
```

> 实现擦边：常见土办法是障碍有两个造型盒——可见障碍略小碰撞；或 Bull 用「如果与障碍距离 < R 且未碰到障碍」。

### 4.7 死亡与结算

```
当收到 "player_hit":
  如果 gameState ≠ "playing": 停止脚本
  将 gameState 设为 "over"
  将 score 设为 distance * braveMultiplier
  Bull 换成 dead
  // 结算文案
  说 「勇敢牛牛，不怕困难」 2 秒
  说 连接 distance / braveStacks / braveMultiplier / score 的字符串 3 秒
  // 提示复制挑战卡（真人演示时口播 + 剪贴板）
```

### 4.8 勇敢特效（加分）

```
当收到 "brave_fx":
  // UI_Text 在 Bull 上方说「勇敢 +1！」1 秒
  // 或 播放音效「叮」
```

---

## 5. 推荐搭建顺序（约 3～5 小时）

1. 舞台 + Bull 站立/重力/跳跃（无障碍）  
2. Obstacle 单机能左移并撞死  
3. 接入 distance  
4. 按 LEVEL_1 写等待克隆序列  
5. 做擦边 + braveStacks + 倍率  
6. 结算文案与再玩  
7. Publish → 把链接填进 README  

---

## 6. Publish 检查

- [ ] 手机浏览器可点跳  
- [ ] 变量监视器演示时可隐藏，避免穿帮；评委讲解时再打开  
- [ ] 项目名含「勇敢牛牛」或 running_bull  
- [ ] 分享链接写入仓库 README 替换「（待 Publish 后替换）」  

---

## 7. 常见坑

| 现象 | 可能原因 |
|------|----------|
| 跳不起来 | onGround 未置 true；重力方向与坐标系反了 |
| 一碰擦边就狂加 | 缺 alreadyBrave |
| 克隆卡死 | 未在 over 时删克隆；forever 未判断 gameState |
| 分数全 0 | score 结算前未赋值；或用了说出来的字不是变量 |
| 手机点不到 | 只绑了空格，没绑「舞台点击」 |

---

## 8. 与资产包的对应

- 数值与规则 → `GAME_DESIGN.md`  
- 生成时间表 → `LEVEL_1.md`  
- 演示怎么讲 → `DEMO_SCRIPT.md`  
- 传播 → `../growth/*`  
