(function () {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const appEl = document.getElementById("app");
  const hudDist = document.getElementById("hud-dist");
  const hudCoins = document.getElementById("hud-coins");
  const hudScore = document.getElementById("hud-score");
  const hudLabelDist = document.getElementById("hud-label-dist");
  const hudLabelScore = document.getElementById("hud-label-score");
  const hudIcoDist = document.getElementById("hud-ico-dist");
  const hudIcoScore = document.getElementById("hud-ico-score");
  const lbScoreTitle = document.getElementById("lb-score-title");
  const lbTimeTitle = document.getElementById("lb-time-title");
  const overLineScore = document.getElementById("over-line-score");
  const overLineTime = document.getElementById("over-line-time");
  const overlay = document.getElementById("overlay");
  const overEl = document.getElementById("over");
  const btnStart = document.getElementById("btn-start");
  const btnRetry = document.getElementById("btn-retry");
  const btnChangeMode = document.getElementById("btn-change-mode");
  const btnLeft = document.getElementById("btn-left");
  const btnRight = document.getElementById("btn-right");
  const btnJump = document.getElementById("btn-jump");
  const btnBomb = document.getElementById("btn-bomb");
  const btnInvuln = document.getElementById("btn-invuln");
  const btnInvulnCount = document.getElementById("btn-invuln-count");
  const hudInvuln = document.getElementById("hud-invuln");
  const hudLabelInvuln = document.getElementById("hud-label-invuln");
  const hudInvulnPill = document.getElementById("hud-invuln-pill");
  const modePick = document.getElementById("mode-pick");
  const titleSlogan = document.getElementById("title-slogan");
  const titleHeading = document.getElementById("title-heading");
  const modeHint = document.getElementById("mode-hint");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const authBar = document.getElementById("auth-bar");
  const btnWechat = document.getElementById("btn-wechat-login");
  const btnLogout = document.getElementById("btn-logout");
  const authProfile = document.getElementById("auth-profile");
  const authNick = document.getElementById("auth-nick");
  const authAvatar = document.getElementById("auth-avatar");
  const loginModal = document.getElementById("login-modal");
  const loginNick = document.getElementById("login-nick");
  const loginAvatar = document.getElementById("login-avatar");
  const btnLoginConfirm = document.getElementById("btn-login-confirm");
  const btnLoginCancel = document.getElementById("btn-login-cancel");
  const btnLoginGuest = document.getElementById("btn-login-guest");
  const prizeMenu = document.getElementById("prize-banner");
  const prizeOver = document.getElementById("prize-banner-over");
  const lbScoreEl = document.getElementById("lb-score");
  const lbTimeEl = document.getElementById("lb-time");
  const lbMineEl = document.getElementById("lb-mine");
  const overLbEl = document.getElementById("over-lb");
  const overPlaytimeEl = document.getElementById("over-playtime");

  const W = 420;
  const H = 740;
  const LANES = 3;
  // Subway-style: wider track, lanes closer to rails (was [0.22, 0.5, 0.78])
  const LANE_X = [0.18, 0.5, 0.82];
  /** Road half-width as fraction of view width (far→near). Was 0.08 / 0.42. */
  const ROAD_HALF_FAR = 0.13;
  const ROAD_HALF_NEAR = 0.50;
  /** Scale up cow/obstacles so they still fill wider lanes. */
  const ROAD_SCALE = 1.18;
  const INVULN_CHARGES = 3;
  const INVULN_DURATION = 10;
  const BOMB_COOLDOWN = 1.6;
  /** Longer than hit-zone dwell at start speed so a well-timed jump clears. */
  const JUMP_DURATION = 0.82;
  const JUMP_HEIGHT = 125;
  const JUMP_BUFFER = 0.14;
  const JUMP_LAND_GRACE = 0.12;
  /** Subway-style roll/slide: short, hard-cut pose (no blend). */
  const SLIDE_DURATION = 0.42;
  const HIT_Z_MIN = 0.70;
  const HIT_Z_MAX = 0.82;
  /** Ease: slower start + gentler ramp (was 280→520 @ 0.35). */
  const SPEED_START = 220;
  const SPEED_MAX = 400;
  const SPEED_RAMP = 0.20;
  /** Ease: wider gaps between obstacles (was max(0.55, 1.1 - d/800)). */
  const SPAWN_BASE = 1.55;
  const SPAWN_MIN = 0.95;
  const SPAWN_DIST_DIV = 1400;
  /** 慢慢跑酷：更慢、更疏、lo-fi。积分主看存活时间。 */
  const CHILL_SPEED_START = 105;
  const CHILL_SPEED_MAX = 165;
  const CHILL_SPEED_RAMP = 0.045;
  const CHILL_SPAWN_BASE = 2.65;
  const CHILL_SPAWN_MIN = 1.85;
  const CHILL_SPAWN_DIST_DIV = 2800;
  /** Chill score: 10 pts / surviving second + 1 per coin (bonus only). */
  const CHILL_TIME_PTS = 10;
  const CHILL_COIN_BONUS = 1;
  /** 植物跑酷（致敬 PvZ，原创素材）：草坪 + 僵尸障 + 植物道具。 */
  const PLANT_SUNFLOWER_DUR = 12;
  const PLANT_SUN_INTERVAL = 0.85;
  const PLANT_PEA_DUR = 3.4;
  const PLANT_PEA_INTERVAL = 0.42;
  const PLANT_GATLING_DUR = 8;
  const PLANT_GATLING_INTERVAL = 0.18;
  const PLANT_WALLNUT_DUR = 5;
  const PLANT_CHERRY_DUR = 10;
  const PLANT_PICKUP_BASE = 4.2;
  const PLANT_BOMB_CD = 12;
  /** Lane visual follow: higher = snappier (was ~14). */
  /** Snap-ish lane (Subway/Zurich): little long-lerp. Refine when free 3-lane measured. */
  const LANE_LERP = 48;
  /** Immediate snap fraction on lane change so first frame moves. */
  const LANE_SNAP = 0.78;
  /** Swipe axis threshold in CSS px (was 40). */
  const SWIPE_AXIS_MIN = 18;
  const SWIPE_TAP_MAX = 22;
  const SWIPE_TAP_MS = 320;

  /** Activity prize amounts (edit here). Demo / 活动预告 — not real payout on Pages. */
  const PRIZE_CONFIG = {
    label: "活动预告",
    rule: "按最高分 Top3 发奖；另展示最长游玩榜",
    amounts: [100, 50, 20],
    currency: "¥",
    realPayout: false,
  };

  const LS_USER = "rb_user_v1";
  const LS_LB = "rb_leaderboard_v1";
  const LB_MAX = 20;

  /** @type {"earth"|"space"|"chill"|"plant"} */
  let mode = "earth";

  let dpr = 1;
  let running = false;
  let dead = false;
  let lastTs = 0;
  let roadScroll = 0;
  let speed = SPEED_START;
  let distance = 0;
  let coins = 0;
  let score = 0;
  let bombCd = 0;
  let invulnCharges = INVULN_CHARGES;
  let invulnT = 0;
  let spawnAcc = 0;
  let coinAcc = 0;
  let runPhase = 0;
  let animTime = 0;
  let sessionPlaySec = 0;
  /** @type {{id:string,nickname:string,avatar:string,provider:string}|null} */
  let currentUser = null;

  const player = {
    lane: 1,
    displayLane: 1,
    jumpT: 0,
    jumping: false,
    jumpBuffered: 0,
    landGrace: 0,
    sliding: false,
    slideT: 0,
  };

  /** @type {Array<{lane:number,z:number,kind:string,alive:boolean,variant?:string,tall?:boolean}>} */
  let entities = [];
  /** @type {Array<{lane:number,z:number,life:number,blast:number}>} */
  let bombs = [];
  /** @type {Array<{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,color:string,r?:number,kind?:string,rot?:number,vr?:number}>} */
  let particles = [];
  /** @type {Array<{lane:number,z:number,life:number,maxLife:number,rings?:number}>} */
  let blasts = [];
  /** @type {Array<{x:number,y:number,vy:number,life:number,maxLife:number,text:string,color:string}>} */
  let floatTexts = [];
  let shakeT = 0;
  let flashT = 0;
  let deathT = 0;
  let deathFx = false;
  let coinPulseT = 0;
  let landDustT = 0;

  /** Plant-mode timed power-ups (seconds remaining). */
  let plantSunflowerT = 0;
  let plantPeaT = 0;
  let plantGatlingT = 0;
  let plantWallnutT = 0;
  let plantCherryT = 0;
  let plantSunAcc = 0;
  let plantPeaAcc = 0;
  let plantGatAcc = 0;
  let plantPickupAcc = 2.5;
  /** @type {Array<{lane:number,z:number,life:number,kind:string}>} */
  let plantShots = [];

  /** HQ homage art (original cartoons — see assets/CREDITS.md). */
  const PLANT_ASSET_KEYS = [
    "sunflower",
    "peashooter",
    "gatling",
    "cherry_bomb",
    "wallnut",
    "zombie_basic",
    "sun_token",
    "lawn_backdrop",
  ];
  /** @type {Record<string, HTMLImageElement>} */
  const plantImgs = {};
  let plantAssetsReady = false;
  (function loadPlantAssets() {
    let left = PLANT_ASSET_KEYS.length;
    PLANT_ASSET_KEYS.forEach((key) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        plantImgs[key] = img;
        left -= 1;
        if (left <= 0) plantAssetsReady = true;
      };
      img.onerror = () => {
        left -= 1;
        if (left <= 0) plantAssetsReady = true;
      };
      img.src = "assets/" + key + ".png";
    });
  })();

  /** Drifting star field for 悬空空间 */
  const stars = Array.from({ length: 48 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.6 + Math.random() * 2.2,
    tw: Math.random() * Math.PI * 2,
    spd: 0.015 + Math.random() * 0.04,
    hue: Math.random() < 0.35 ? "pink" : Math.random() < 0.5 ? "lavender" : "white",
  }));

  // --- Identity / leaderboard (Pages: localStorage; plug real WeChat later) ---
  function uid() {
    return "m_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function loadUser() {
    try {
      const raw = localStorage.getItem(LS_USER);
      if (!raw) return null;
      const u = JSON.parse(raw);
      if (!u || !u.id || !u.nickname) return null;
      return u;
    } catch (_) {
      return null;
    }
  }

  function saveUser(u) {
    currentUser = u;
    if (u) localStorage.setItem(LS_USER, JSON.stringify(u));
    else localStorage.removeItem(LS_USER);
    renderAuth();
  }

  /**
   * Future: redirect to WeChat OAuth (snsapi_userinfo), backend exchanges code → openid.
   * On GitHub Pages there is no backend, so we only mock.
   */
  function beginWeChatLogin() {
    if (typeof window.__RB_WECHAT_OAUTH === "function") {
      window.__RB_WECHAT_OAUTH();
      return;
    }
    openLoginModal();
  }

  function openLoginModal() {
    if (!loginModal) return;
    loginModal.classList.remove("hidden");
    if (loginNick) {
      loginNick.value = (currentUser && currentUser.nickname) || "";
      loginNick.focus();
    }
    if (loginAvatar) loginAvatar.value = (currentUser && currentUser.avatar) || "";
  }

  function closeLoginModal() {
    if (loginModal) loginModal.classList.add("hidden");
  }

  function confirmMockLogin(asGuest) {
    let nick = (loginNick && loginNick.value.trim()) || "";
    let avatar = (loginAvatar && loginAvatar.value.trim()) || "";
    if (asGuest || !nick) {
      const n = Math.floor(1000 + Math.random() * 9000);
      nick = "微信玩家" + n;
      avatar = "";
    }
    const prev = currentUser;
    const id = prev && prev.provider === "mock" ? prev.id : uid();
    saveUser({
      id,
      openid: id,
      nickname: nick.slice(0, 16),
      avatar: avatar.slice(0, 300),
      provider: "mock",
      boundWeChat: false,
    });
    closeLoginModal();
    renderLeaderboards();
  }

  function logout() {
    saveUser(null);
    renderLeaderboards();
  }

  function emptyLb() {
    return { byScore: [], byPlayTime: [], byChill: [] };
  }

  function loadLb() {
    try {
      const raw = localStorage.getItem(LS_LB);
      if (!raw) return emptyLb();
      const data = JSON.parse(raw);
      return {
        byScore: Array.isArray(data.byScore) ? data.byScore : [],
        byPlayTime: Array.isArray(data.byPlayTime) ? data.byPlayTime : [],
        byChill: Array.isArray(data.byChill) ? data.byChill : [],
      };
    } catch (_) {
      return emptyLb();
    }
  }

  function saveLb(data) {
    localStorage.setItem(LS_LB, JSON.stringify(data));
    window.__RB_LB = data;
  }

  function upsertRecord(list, entry, key, max) {
    const i = list.findIndex((r) => r.id === entry.id);
    if (i >= 0) {
      if (entry[key] > list[i][key]) {
        list[i] = { ...list[i], ...entry, updatedAt: Date.now() };
      } else {
        list[i] = {
          ...list[i],
          nickname: entry.nickname,
          avatar: entry.avatar,
        };
      }
    } else {
      list.push({ ...entry, updatedAt: Date.now() });
    }
    list.sort((a, b) => b[key] - a[key] || (b.updatedAt || 0) - (a.updatedAt || 0));
    return list.slice(0, max);
  }

  function computeScore() {
    if (mode === "chill") {
      // Primary: survival time. Coins are a small bonus only.
      return Math.floor(sessionPlaySec * CHILL_TIME_PTS) + coins * CHILL_COIN_BONUS;
    }
    return Math.floor(distance) + coins * 10;
  }

  function recordRun(finalScore, playSec) {
    const user = currentUser || {
      id: "guest_local",
      nickname: "游客",
      avatar: "",
      provider: "guest",
    };
    const entry = {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar || "",
      score: Math.max(0, Math.floor(finalScore)),
      playTime: Math.max(0, Math.round(playSec * 10) / 10),
      mode: mode,
    };
    const lb = loadLb();
    if (mode === "chill") {
      lb.byChill = upsertRecord(lb.byChill, entry, "score", LB_MAX);
    } else {
      lb.byScore = upsertRecord(lb.byScore, entry, "score", LB_MAX);
    }
    lb.byPlayTime = upsertRecord(lb.byPlayTime, entry, "playTime", LB_MAX);
    saveLb(lb);
    return lb;
  }

  function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m > 0 ? m + "分" + String(r).padStart(2, "0") + "秒" : r + "秒";
  }

  function renderPrizeBanners() {
    const html =
      '<div class="prize-title">🏆 Top 3 现金奖励 <span class="prize-tag">' +
      PRIZE_CONFIG.label +
      "</span></div>" +
      '<ol class="prize-list">' +
      PRIZE_CONFIG.amounts
        .map(
          (amt, i) =>
            "<li><span class=\"prize-rank\">第" +
            (i + 1) +
            "名</span> <strong>" +
            PRIZE_CONFIG.currency +
            amt +
            "</strong></li>"
        )
        .join("") +
      "</ol>" +
      '<p class="prize-rule">' +
      PRIZE_CONFIG.rule +
      (PRIZE_CONFIG.realPayout ? "" : " · 示意金额，正式发放待活动后端") +
      "</p>";
    if (prizeMenu) prizeMenu.innerHTML = html;
    if (prizeOver) prizeOver.innerHTML = html;
  }

  function renderLbList(el, rows, key, labelFn) {
    if (!el) return;
    if (!rows.length) {
      el.innerHTML = '<li class="lb-empty">暂无记录，跑一局上榜</li>';
      return;
    }
    el.innerHTML = rows
      .slice(0, 5)
      .map((r, i) => {
        const mine = currentUser && r.id === currentUser.id ? " mine" : "";
        return (
          '<li class="lb-row' +
          mine +
          '"><span class="lb-rank">' +
          (i + 1) +
          '</span><span class="lb-name">' +
          escapeHtml(r.nickname) +
          '</span><span class="lb-val">' +
          labelFn(r[key]) +
          "</span></li>"
        );
      })
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function myBest() {
    if (!currentUser) return null;
    const lb = loadLb();
    const s = lb.byScore.find((r) => r.id === currentUser.id);
    const c = lb.byChill.find((r) => r.id === currentUser.id);
    const t = lb.byPlayTime.find((r) => r.id === currentUser.id);
    return {
      score: s ? s.score : 0,
      chillScore: c ? c.score : 0,
      playTime: t ? t.playTime : 0,
    };
  }

  function renderLeaderboards() {
    const lb = loadLb();
    window.__RB_LB = lb;
    const chill = mode === "chill";
    if (lbScoreTitle) lbScoreTitle.textContent = chill ? "时长积分榜" : "得分榜";
    if (lbTimeTitle) lbTimeTitle.textContent = chill ? "最长存活" : "最长游玩";
    if (chill) {
      renderLbList(lbScoreEl, lb.byChill, "score", (v) => String(v));
    } else {
      renderLbList(lbScoreEl, lb.byScore, "score", (v) => String(v));
    }
    renderLbList(lbTimeEl, lb.byPlayTime, "playTime", formatTime);
    if (lbMineEl) {
      const best = myBest();
      if (currentUser && best) {
        lbMineEl.textContent = chill
          ? "我的最佳：时长积分 " + best.chillScore + " · 最长 " + formatTime(best.playTime)
          : "我的最佳：得分 " + best.score + " · 最长 " + formatTime(best.playTime);
        lbMineEl.classList.remove("hidden");
      } else {
        lbMineEl.textContent = chill
          ? "登录后记录你的存活时长积分"
          : "登录后记录你的得分与游玩时长";
        lbMineEl.classList.remove("hidden");
      }
    }
    if (overLbEl) {
      const top = chill ? lb.byChill.slice(0, 3) : lb.byScore.slice(0, 3);
      const label = chill ? "时长榜 " : "高分榜 ";
      overLbEl.innerHTML = top.length
        ? label +
          top
            .map((r, i) => i + 1 + "." + escapeHtml(r.nickname) + " " + r.score)
            .join(" · ")
        : "";
    }
  }

  function renderAuth() {
    if (!authBar) return;
    if (currentUser) {
      if (btnWechat) btnWechat.classList.add("hidden");
      if (authProfile) authProfile.classList.remove("hidden");
      if (authNick) authNick.textContent = currentUser.nickname;
      if (authAvatar) {
        if (currentUser.avatar) {
          authAvatar.src = currentUser.avatar;
          authAvatar.classList.remove("hidden");
        } else {
          authAvatar.removeAttribute("src");
          authAvatar.classList.add("hidden");
        }
      }
    } else {
      if (btnWechat) btnWechat.classList.remove("hidden");
      if (authProfile) authProfile.classList.add("hidden");
    }
  }

  window.__RB_PRIZE = PRIZE_CONFIG;
  window.__RB_AUTH = {
    getUser: () => currentUser,
    loginMock: beginWeChatLogin,
    logout,
  };

  function setMode(next) {
    if (next !== "earth" && next !== "space" && next !== "chill" && next !== "plant") return;
    mode = next;
    appEl.setAttribute("data-theme", mode);
    if (themeMeta) {
      themeMeta.setAttribute(
        "content",
        mode === "space"
          ? "#6b4a9e"
          : mode === "chill"
            ? "#7a9e8e"
            : mode === "plant"
              ? "#5a9e3a"
              : "#1a8cff"
      );
    }
    if (modePick) {
      modePick.querySelectorAll(".mode-card").forEach((btn) => {
        const on = btn.getAttribute("data-mode") === mode;
        btn.classList.toggle("selected", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    if (titleSlogan) {
      titleSlogan.textContent =
        mode === "plant"
          ? "🌻 植物跑酷 · 致敬版"
          : mode === "chill"
            ? "慢慢跑，积分看时长"
            : mode === "space"
              ? "星轨平台，水晶障碍"
              : "勇敢牛牛，不怕困难";
    }
    if (titleHeading) {
      titleHeading.textContent =
        mode === "plant"
          ? "植物跑酷"
          : mode === "chill"
            ? "慢慢跑酷"
            : mode === "space"
              ? "悬空空间"
              : "天天跑酷";
    }
    if (modeHint) {
      modeHint.textContent =
        mode === "plant"
          ? "已选植物跑酷 · 点「开始植物跑酷」或再点🌻开跑；🍒=清道10秒"
          : "选地图 · 点下方卡片（手机无需键盘）";
    }
    if (btnStart) {
      btnStart.textContent =
        mode === "plant" ? "▶ 开始植物跑酷" : "▶ 开始跑";
    }
    applyHudLabels();
    renderLeaderboards();
  }

  function applyHudLabels() {
    const chill = mode === "chill";
    const plant = mode === "plant";
    if (hudLabelDist) hudLabelDist.textContent = chill ? "时长" : "距离";
    if (hudLabelScore) hudLabelScore.textContent = chill ? "时长积分" : "得分";
    if (hudIcoDist) hudIcoDist.textContent = chill ? "⏱️" : plant ? "🌻" : "🏁";
    if (hudIcoScore) hudIcoScore.textContent = chill ? "🧘" : plant ? "🧟" : "⭐";
    if (btnBomb) {
      btnBomb.textContent = plant ? "🍒" : "💣";
      btnBomb.setAttribute(
        "aria-label",
        plant ? "樱桃炸弹：当前道连续清障 10 秒" : "丢炸弹"
      );
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function viewSize() {
    const rect = canvas.getBoundingClientRect();
    return { w: rect.width || W, h: rect.height || H };
  }

  /** Perspective: z in [0,1] where 0 = far (top), 1 = near (bottom).
   *  Tuned toward Subway Surfers: lower vanishing point, much wider near road. */
  function project(lane, z, vw, vh) {
    const horizonY = vh * 0.14;
    const nearY = vh * 0.82;
    const y = horizonY + (nearY - horizonY) * z;
    const roadHalfFar = vw * ROAD_HALF_FAR;
    const roadHalfNear = vw * ROAD_HALF_NEAR;
    const half = roadHalfFar + (roadHalfNear - roadHalfFar) * z;
    const cx = vw * 0.5;
    const lx = LANE_X[lane];
    const offset = (lx - 0.5) * 2;
    const x = cx + offset * half;
    const scale = (0.35 + 0.65 * z) * ROAD_SCALE;
    return { x, y, scale, half };
  }

  function roadEdges(z, vw, vh) {
    const horizonY = vh * 0.14;
    const nearY = vh * 0.82;
    const y = horizonY + (nearY - horizonY) * z;
    const roadHalfFar = vw * ROAD_HALF_FAR;
    const roadHalfNear = vw * ROAD_HALF_NEAR;
    const half = roadHalfFar + (roadHalfNear - roadHalfFar) * z;
    const cx = vw * 0.5;
    return { y, left: cx - half, right: cx + half, half, cx };
  }

  function resetGame() {
    running = true;
    dead = false;
    lastTs = 0;
    roadScroll = 0;
    speed = SPEED_START;
    distance = 0;
    coins = 0;
    score = 0;
    bombCd = 0;
    invulnCharges = INVULN_CHARGES;
    invulnT = 0;
    spawnAcc = 1.1;
    coinAcc = 0.2;
    runPhase = 0;
    sessionPlaySec = 0;
    player.lane = 1;
    player.displayLane = 1;
    player.jumpT = 0;
    player.jumping = false;
    player.jumpBuffered = 0;
    player.landGrace = 0;
    player.sliding = false;
    player.slideT = 0;
    entities = [];
    bombs = [];
    particles = [];
    blasts = [];
    floatTexts = [];
    shakeT = 0;
    flashT = 0;
    deathT = 0;
    deathFx = false;
    coinPulseT = 0;
    landDustT = 0;
    plantSunflowerT = 0;
    plantPeaT = 0;
    plantGatlingT = 0;
    plantWallnutT = 0;
    plantCherryT = 0;
    plantSunAcc = 0;
    plantPeaAcc = 0;
    plantGatAcc = 0;
    plantPickupAcc = 2.2;
    plantShots = [];
    overlay.classList.add("hidden");
    overlay.classList.remove("show");
    overEl.classList.add("hidden");
    overEl.classList.remove("show-over");
    if (btnBomb) {
      btnBomb.disabled = false;
      btnBomb.classList.remove("cooling");
    }
    syncInvulnUi();
    updateHud();
  }

  function showTitle() {
    running = false;
    dead = false;
    deathFx = false;
    overEl.classList.add("hidden");
    overEl.classList.remove("show-over");
    overlay.classList.remove("hidden");
    overlay.classList.add("show");
  }

  function updateHud() {
    score = computeScore();
    if (mode === "chill") {
      hudDist.textContent = formatTime(sessionPlaySec);
    } else {
      hudDist.textContent = String(Math.floor(distance));
    }
    hudCoins.textContent = String(coins);
    hudScore.textContent = String(score);
    syncInvulnUi();
  }

  function isInvulnerable() {
    return invulnT > 0;
  }

  function syncInvulnUi() {
    const active = isInvulnerable();
    const left = Math.max(0, invulnCharges);
    if (hudInvuln) {
      hudInvuln.textContent = active
        ? Math.ceil(invulnT) + "s"
        : String(left);
    }
    if (hudLabelInvuln) {
      hudLabelInvuln.textContent = active ? "冲撞中" : "无敌";
    }
    if (hudInvulnPill) {
      hudInvulnPill.classList.toggle("active", active);
    }
    if (btnInvulnCount) {
      btnInvulnCount.textContent = active
        ? Math.ceil(invulnT) + "s"
        : "×" + left;
    }
    if (btnInvuln) {
      btnInvuln.classList.toggle("active", active);
      btnInvuln.classList.toggle("empty", !active && left <= 0);
      btnInvuln.disabled = active || left <= 0 || !running || dead || deathFx;
      btnInvuln.setAttribute(
        "aria-label",
        active
          ? "无敌冲撞剩余 " + Math.ceil(invulnT) + " 秒"
          : "无敌冲撞，剩余 " + left + " 次"
      );
    }
  }

  function activateInvuln() {
    if (!running || dead || deathFx) return;
    if (isInvulnerable()) return;
    if (invulnCharges <= 0) return;
    invulnCharges -= 1;
    invulnT = INVULN_DURATION;
    flashT = Math.max(flashT, 0.35);
    shakeT = Math.max(shakeT, 0.22);
    // golden burst around cow
    burst(player.lane, 0.78, "rgba(255,220,80,0.9)", 18);
    spawnFloatText(player.lane, 0.78, "无敌!", "#ffe566");
    syncInvulnUi();
  }

  function smashObstacle(e) {
    e.alive = false;
    boomBurst(e.lane, e.z, 0.85);
    spawnBlast(e.lane, e.z, 0.45, 3);
    burst(e.lane, e.z, "rgba(255,230,120,0.95)", 14);
    spawnFloatText(e.lane, e.z, "撞碎!", "#ffe566");
    shakeT = Math.max(shakeT, 0.28);
    flashT = Math.max(flashT, 0.18);
  }

  function changeLane(dir) {
    if (!running || dead || deathFx) return;
    const next = Math.max(0, Math.min(LANES - 1, player.lane + dir));
    if (next === player.lane) return;
    player.lane = next;
    // Immediate visual response, then LANE_LERP eases the rest.
    player.displayLane += (player.lane - player.displayLane) * LANE_SNAP;
  }

  function jump() {
    if (!running || dead || deathFx) return;
    if (player.jumping) {
      // Queue a follow-up if pressed near landing.
      if (player.jumpT >= JUMP_DURATION - JUMP_BUFFER) {
        player.jumpBuffered = JUMP_BUFFER;
      }
      return;
    }
    // Hard-cut out of slide into jump (no pose blend).
    player.sliding = false;
    player.slideT = 0;
    player.jumping = true;
    player.jumpT = 0;
    player.jumpBuffered = 0;
    player.landGrace = 0;
  }

  function isJumpClearing() {
    return player.jumping || player.landGrace > 0;
  }

  /** Slide clears low props; tall still needs jump (or invuln). */
  function isObstacleClearing(e) {
    if (isInvulnerable()) return true;
    if (mode === "plant" && plantWallnutT > 0) return true;
    if (isJumpClearing()) return true;
    if (player.sliding && !(e && e.tall)) return true;
    return false;
  }

  function isPlantWallnutShield() {
    return mode === "plant" && plantWallnutT > 0;
  }

  function slide() {
    if (!running || dead || deathFx) return;
    if (player.sliding) return;
    // Hard-cut: cancel jump pose instantly (no blend).
    player.jumping = false;
    player.jumpT = 0;
    player.jumpBuffered = 0;
    player.landGrace = 0;
    player.sliding = true;
    player.slideT = 0;
  }

  function bombColors() {
    if (mode === "space") {
      return {
        core: "#f0abfc",
        hot: "#e879f9",
        spark: "#fff0ff",
        ember: "#fda4af",
        smoke: "rgba(200,160,255,0.55)",
        flash: "rgba(255,180,240,0.7)",
      };
    }
    if (mode === "chill") {
      return {
        core: "#fde68a",
        hot: "#fbbf24",
        spark: "#fef3c7",
        ember: "#fcd34d",
        smoke: "rgba(120,140,130,0.4)",
        flash: "rgba(253,230,138,0.55)",
      };
    }
    if (mode === "plant") {
      return {
        core: "#ff6b6b",
        hot: "#e11d48",
        spark: "#fecdd3",
        ember: "#fb7185",
        smoke: "rgba(80,40,40,0.45)",
        flash: "rgba(255,120,100,0.65)",
      };
    }
    return {
      core: "#ffaa00",
      hot: "#ff4400",
      spark: "#ffe566",
      ember: "#ff6a00",
      smoke: "rgba(80,50,30,0.45)",
      flash: "rgba(255,210,80,0.65)",
    };
  }

  /** Destroy obstacles on one lane in z range; coins untouched. */
  function clearLaneObstacles(lane, zMin, zMax, big) {
    const cols = bombColors();
    let n = 0;
    for (const e of entities) {
      if (!e.alive) continue;
      if (e.kind !== "obstacle") continue;
      if (e.lane !== lane) continue;
      if (e.z < zMin || e.z > zMax) continue;
      e.alive = false;
      boomBurst(e.lane, e.z, big ? 1 : 0.55);
      spawnBlast(e.lane, e.z, big ? 0.55 : 0.35, big ? 3 : 2);
      n += 1;
    }
    return n;
  }

  function spawnBlast(lane, z, life, rings) {
    blasts.push({ lane, z, life, maxLife: life, rings: rings || 2 });
  }

  function fireBomb() {
    if (!running || dead || deathFx) return;
    if (bombCd > 0) return;
    // 植物跑酷：樱桃炸弹 = 当前道前方连续清障 10 秒（非一发）。
    if (mode === "plant") {
      bombCd = PLANT_BOMB_CD;
      plantCherryT = PLANT_CHERRY_DUR;
      const lane = player.lane;
      if (btnBomb) {
        btnBomb.disabled = true;
        btnBomb.classList.add("cooling");
      }
      shakeT = Math.max(shakeT, 0.45);
      flashT = Math.max(flashT, 0.4);
      boomBurst(lane, 0.78, 1.1);
      spawnBlast(lane, 0.78, 0.65, 4);
      spawnFloatText(lane, 0.78, "樱桃炸弹 10s!", "#ff6b6b");
      clearLaneObstacles(lane, -0.05, 1.05, true);
      return;
    }
    bombCd = BOMB_COOLDOWN;
    const lane = player.lane;
    bombs.push({ lane, z: 0.78, life: 0.85, blast: 0.18 });
    if (btnBomb) {
      btnBomb.disabled = true;
      btnBomb.classList.add("cooling");
    }
    // Unmistakable boom: long flash/shake + multi-wave rings + debris.
    shakeT = Math.max(shakeT, 0.58);
    flashT = Math.max(flashT, 0.48);
    boomBurst(lane, 0.78, 1.25);
    spawnBlast(lane, 0.78, 0.7, 4);
    spawnBlast(lane, 0.62, 0.55, 3);
    spawnBlast(lane, 0.45, 0.4, 2);
    clearLaneObstacles(lane, -0.08, 1.08, true);
  }

  function activatePlantPickup(variant) {
    if (variant === "sunflower") {
      plantSunflowerT = PLANT_SUNFLOWER_DUR;
      plantSunAcc = 0.15;
      spawnFloatText(player.lane, 0.78, "向日葵!", "#fbbf24");
    } else if (variant === "peashooter") {
      plantPeaT = PLANT_PEA_DUR;
      plantPeaAcc = 0.05;
      spawnFloatText(player.lane, 0.78, "豌豆!", "#84cc16");
    } else if (variant === "gatling") {
      plantGatlingT = PLANT_GATLING_DUR;
      plantGatAcc = 0.02;
      spawnFloatText(player.lane, 0.78, "加特林!", "#22c55e");
    } else if (variant === "wallnut") {
      plantWallnutT = PLANT_WALLNUT_DUR;
      spawnFloatText(player.lane, 0.78, "坚果护盾!", "#d97706");
      burst(player.lane, 0.78, "rgba(217,119,6,0.85)", 12);
    }
  }

  function spawnPlantPickup() {
    if (mode !== "plant") return;
    const kinds = ["sunflower", "peashooter", "gatling", "wallnut"];
    const weights = [0.32, 0.28, 0.2, 0.2];
    let r = Math.random();
    let variant = kinds[0];
    for (let i = 0; i < kinds.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        variant = kinds[i];
        break;
      }
    }
    const lane = Math.floor(Math.random() * LANES);
    entities.push({
      lane,
      z: 0,
      kind: "plant_pickup",
      alive: true,
      variant,
    });
  }

  function firePlantShot(kind) {
    const lane = player.lane;
    plantShots.push({
      lane,
      z: 0.72,
      life: 0.9,
      kind: kind || "pea",
    });
  }

  function updatePlantPowers(dt, zSpeed) {
    if (mode !== "plant") return;

    if (plantCherryT > 0) {
      plantCherryT -= dt;
      // Continuous clear of current lane ahead (follows lane changes).
      clearLaneObstacles(player.lane, -0.05, 0.95, false);
      if (Math.random() < dt * 6) {
        spawnBlast(player.lane, 0.35 + Math.random() * 0.4, 0.2, 1);
      }
      if (plantCherryT <= 0) {
        plantCherryT = 0;
        spawnFloatText(player.lane, 0.78, "樱桃结束", "#9ca3af");
      }
    }

    if (plantSunflowerT > 0) {
      plantSunflowerT -= dt;
      plantSunAcc -= dt;
      if (plantSunAcc <= 0) {
        plantSunAcc = PLANT_SUN_INTERVAL;
        coins += 1;
        coinPulseT = 0.35;
        // Visual sun token float + coin credit
        const { w, h } = viewSize();
        const p = project(player.lane, 0.7, w, h);
        floatTexts.push({
          x: p.x + (Math.random() - 0.5) * 30,
          y: p.y - 40 * p.scale,
          vy: -55,
          life: 0.7,
          maxLife: 0.7,
          text: "☀️+1",
          color: "#fbbf24",
        });
        burst(player.lane, 0.7, "rgba(251,191,36,0.8)", 6);
      }
      if (plantSunflowerT <= 0) plantSunflowerT = 0;
    }

    if (plantPeaT > 0) {
      plantPeaT -= dt;
      plantPeaAcc -= dt;
      if (plantPeaAcc <= 0) {
        plantPeaAcc = PLANT_PEA_INTERVAL;
        firePlantShot("pea");
      }
      if (plantPeaT <= 0) plantPeaT = 0;
    }

    if (plantGatlingT > 0) {
      plantGatlingT -= dt;
      plantGatAcc -= dt;
      if (plantGatAcc <= 0) {
        plantGatAcc = PLANT_GATLING_INTERVAL;
        firePlantShot("gatling");
      }
      if (plantGatlingT <= 0) plantGatlingT = 0;
    }

    if (plantWallnutT > 0) {
      plantWallnutT -= dt;
      if (plantWallnutT <= 0) {
        plantWallnutT = 0;
        spawnFloatText(player.lane, 0.78, "坚果碎了", "#9ca3af");
      }
    }

    for (const s of plantShots) {
      s.z -= zSpeed * (s.kind === "gatling" ? 3.4 : 2.6) * dt;
      s.life -= dt;
      // Follow player's current lane for gatling continuous fire feel
      if (s.kind === "gatling") s.lane = player.lane;
      clearLaneObstacles(s.lane, s.z - 0.06, s.z + 0.12, false);
    }
    plantShots = plantShots.filter((s) => s.life > 0 && s.z > -0.1);

    plantPickupAcc -= dt;
    if (plantPickupAcc <= 0) {
      spawnPlantPickup();
      plantPickupAcc = PLANT_PICKUP_BASE + Math.random() * 2.2;
    }
  }

  /** Multi-kind explosion particles (fireball / ember / smoke / shard). */
  function boomBurst(lane, z, power) {
    const cols = bombColors();
    const { w, h } = viewSize();
    const p = project(lane, Math.max(0, Math.min(1, z)), w, h);
    const cx = p.x;
    const cy = p.y - 14 * p.scale;
    const n = Math.floor(28 * power);
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      const spd = (140 + Math.random() * 320) * power;
      const kindRoll = Math.random();
      let kind = "spark";
      let color = cols.spark;
      let r = 3 + Math.random() * 4;
      let life = 0.45 + Math.random() * 0.35;
      if (kindRoll < 0.28) {
        kind = "fireball";
        color = cols.core;
        r = 8 + Math.random() * 10;
        life = 0.55 + Math.random() * 0.35;
      } else if (kindRoll < 0.55) {
        kind = "ember";
        color = cols.ember;
        r = 4 + Math.random() * 6;
        life = 0.5 + Math.random() * 0.45;
      } else if (kindRoll < 0.75) {
        kind = "smoke";
        color = cols.smoke;
        r = 10 + Math.random() * 16;
        life = 0.7 + Math.random() * 0.5;
      } else {
        kind = "shard";
        color = cols.hot;
        r = 3 + Math.random() * 5;
        life = 0.55 + Math.random() * 0.4;
      }
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 60 * power,
        life,
        maxLife: life,
        color,
        r,
        kind,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 10,
      });
    }
  }

  function burst(lane, z, color, count) {
    const n = count || 12;
    const { w, h } = viewSize();
    const p = project(lane, Math.max(0, Math.min(1, z)), w, h);
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const spd = 90 + Math.random() * 220;
      const life = 0.4 + Math.random() * 0.35;
      particles.push({
        x: p.x,
        y: p.y - 12 * p.scale,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 40,
        life,
        maxLife: life,
        color,
        r: 3 + Math.random() * 5,
        kind: "spark",
        rot: 0,
        vr: 0,
      });
    }
  }

  function spawnFloatText(lane, z, text, color) {
    const { w, h } = viewSize();
    const p = project(lane, Math.max(0, Math.min(1, z)), w, h);
    floatTexts.push({
      x: p.x,
      y: p.y - 30 * p.scale,
      vy: -70,
      life: 0.85,
      maxLife: 0.85,
      text,
      color,
    });
  }

  function coinPickupFx(lane, z) {
    const cols = mode === "space" ? "#ffc0ef" : mode === "chill" ? "#f6d7a8" : "#ffd700";
    burst(lane, z, cols, 16);
    boomBurst(lane, z, 0.25);
    spawnFloatText(lane, z, mode === "chill" ? "+1" : "+10", cols);
    coinPulseT = 0.35;
    if (hudCoins) {
      hudCoins.classList.remove("pop");
      void hudCoins.offsetWidth;
      hudCoins.classList.add("pop");
    }
  }

  function pickObstacleVariant() {
    if (mode === "space") {
      const r = Math.random();
      if (r < 0.45) return { variant: "crystal", tall: false };
      if (r < 0.75) return { variant: "crystal_cluster", tall: false };
      return { variant: "obelisk", tall: true };
    }
    if (mode === "chill") {
      // Soft, jumpable-only props — no trains.
      const r = Math.random();
      if (r < 0.4) return { variant: "box", tall: false };
      if (r < 0.75) return { variant: "barrier", tall: false };
      return { variant: "sign", tall: false };
    }
    if (mode === "plant") {
      // Homage zombies — mostly jumpable; occasional tall.
      const r = Math.random();
      if (r < 0.78) return { variant: "zombie", tall: false };
      return { variant: "zombie_tall", tall: true };
    }
    const r = Math.random();
    if (r < 0.34) return { variant: "box", tall: false };
    if (r < 0.58) return { variant: "barrier", tall: false };
    if (r < 0.78) return { variant: "sign", tall: false };
    return { variant: "train", tall: true };
  }

  function spawnObstacle() {
    const lane = Math.floor(Math.random() * LANES);
    const nearby = entities.some(
      (e) => e.alive && e.kind === "obstacle" && e.lane === lane && e.z < 0.32
    );
    // Also avoid packing adjacent lanes at the same depth (dense walls).
    const packed = entities.some(
      (e) =>
        e.alive &&
        e.kind === "obstacle" &&
        e.z < 0.22 &&
        Math.abs(e.lane - lane) === 1
    );
    if (nearby || packed) return;
    const v = pickObstacleVariant();
    entities.push({
      lane,
      z: 0,
      kind: "obstacle",
      alive: true,
      variant: v.variant,
      tall: v.tall,
    });
  }

  function spawnCoinLine() {
    const lane = Math.floor(Math.random() * LANES);
    const count = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      entities.push({
        lane,
        z: -0.06 * i,
        kind: "coin",
        alive: true,
      });
    }
  }

  function gameOver() {
    if (deathFx || dead) return;
    deathFx = true;
    dead = true;
    running = false;
    deathT = 0.85;
    shakeT = Math.max(shakeT, 0.5);
    flashT = Math.max(flashT, 0.35);
    // Crash burst at cow
    const cols = bombColors();
    boomBurst(player.lane, 0.78, 0.9);
    spawnBlast(player.lane, 0.78, 0.55, 3);
    burst(player.lane, 0.78, cols.hot, 24);
    invulnT = 0;
    updateHud();
  }

  function showGameOverCard() {
    score = computeScore();
    document.getElementById("over-dist").textContent =
      mode === "chill" ? formatTime(sessionPlaySec) : String(Math.floor(distance));
    document.getElementById("over-coins").textContent = String(coins);
    document.getElementById("over-score").textContent = String(score);
    if (overPlaytimeEl) overPlaytimeEl.textContent = formatTime(sessionPlaySec);
    const distLine = document.getElementById("over-line-dist");
    if (distLine) {
      if (mode === "chill") {
        distLine.innerHTML =
          "存活 <strong id=\"over-dist\">" +
          formatTime(sessionPlaySec) +
          "</strong> · 金币 <strong id=\"over-coins\">" +
          coins +
          "</strong>";
      } else {
        distLine.innerHTML =
          "距离 <strong id=\"over-dist\">" +
          Math.floor(distance) +
          "</strong> · 金币 <strong id=\"over-coins\">" +
          coins +
          "</strong>";
      }
    }
    if (overLineScore) {
      overLineScore.innerHTML =
        (mode === "chill" ? "时长积分 " : "得分 ") +
        "<strong id=\"over-score\">" +
        score +
        "</strong>" +
        (mode === "chill"
          ? " <span class=\"score-hint\">（秒×10 + 金币）</span>"
          : "");
    }
    if (overLineTime) {
      overLineTime.classList.toggle("hidden", mode === "chill"); // already shown as 存活
    }
    const encourage = document.querySelector("#over .over-encourage");
    if (encourage) {
      encourage.textContent =
        mode === "chill"
          ? "慢慢来，再多待一会儿 😎"
          : mode === "plant"
            ? "草坪再战一轮 🌻"
            : "勇敢牛牛，再来一次";
    }
    const badge = document.querySelector("#over .over-badge");
    if (badge) {
      badge.textContent =
        mode === "chill" ? "CHILL OVER" : mode === "plant" ? "ZOMBIES WIN" : "GAME OVER";
    }
    recordRun(score, sessionPlaySec);
    renderLeaderboards();
    overEl.classList.remove("hidden");
    overEl.classList.add("show-over");
  }

  function update(dt) {
    animTime += dt;
    if (deathFx) {
      // Continue crash FX after collision stops gameplay.
      if (shakeT > 0) shakeT = Math.max(0, shakeT - dt);
      if (flashT > 0) flashT = Math.max(0, flashT - dt);
      deathT -= dt;
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += (p.kind === "smoke" ? 40 : 220) * dt;
        p.vx *= 1 - 1.2 * dt;
        if (p.rot != null) p.rot += (p.vr || 0) * dt;
        p.life -= dt;
      }
      particles = particles.filter((p) => p.life > 0);
      for (const bl of blasts) bl.life -= dt;
      blasts = blasts.filter((bl) => bl.life > 0);
      for (const ft of floatTexts) {
        ft.y += ft.vy * dt;
        ft.life -= dt;
      }
      floatTexts = floatTexts.filter((ft) => ft.life > 0);
      if (deathT <= 0) {
        deathFx = false;
        showGameOverCard();
      }
      return;
    }
    if (!running) return;

    if (mode === "chill") {
      speed = Math.min(CHILL_SPEED_MAX, CHILL_SPEED_START + distance * CHILL_SPEED_RAMP);
    } else {
      speed = Math.min(SPEED_MAX, SPEED_START + distance * SPEED_RAMP);
    }
    const zSpeed = (speed / 420) * (mode === "chill" ? 0.42 : 0.50);
    roadScroll += speed * dt;
    distance += (speed * dt) / 18;
    // Steady stride: base cadence + light speed coupling (less "panic legs").
    runPhase += dt * (2.15 + speed * 0.0055);
    sessionPlaySec += dt;

    player.displayLane += (player.lane - player.displayLane) * Math.min(1, dt * LANE_LERP);

    if (player.jumpBuffered > 0) player.jumpBuffered -= dt;
    if (player.landGrace > 0) player.landGrace -= dt;

    if (player.jumping) {
      player.jumpT += dt;
      if (player.jumpT >= JUMP_DURATION) {
        player.jumping = false;
        player.jumpT = 0;
        player.landGrace = JUMP_LAND_GRACE;
        landDustT = 0.28;
        burst(
          player.lane,
          0.78,
          mode === "space"
            ? "rgba(255,200,240,0.7)"
            : mode === "chill"
              ? "rgba(200,190,160,0.65)"
              : mode === "plant"
                ? "rgba(120,160,60,0.7)"
                : "rgba(180,140,90,0.7)",
          10
        );
        if (player.jumpBuffered > 0) {
          player.jumping = true;
          player.jumpT = 0;
          player.jumpBuffered = 0;
          player.landGrace = 0;
          landDustT = 0;
        }
      }
    } else if (player.jumpBuffered > 0) {
      player.jumping = true;
      player.jumpT = 0;
      player.jumpBuffered = 0;
      player.landGrace = 0;
    }

    if (player.sliding) {
      player.slideT += dt;
      if (player.slideT >= SLIDE_DURATION) {
        player.sliding = false;
        player.slideT = 0;
        landDustT = Math.max(landDustT, 0.18);
      }
    }

    if (bombCd > 0) {
      bombCd -= dt;
      if (bombCd <= 0) {
        bombCd = 0;
        if (btnBomb) {
          btnBomb.disabled = false;
          btnBomb.classList.remove("cooling");
        }
      }
    }

    if (invulnT > 0) {
      invulnT -= dt;
      if (invulnT <= 0) {
        invulnT = 0;
        spawnFloatText(player.lane, 0.78, "无敌结束", "#9ca3af");
      }
      syncInvulnUi();
    }

    if (shakeT > 0) shakeT = Math.max(0, shakeT - dt);
    if (flashT > 0) flashT = Math.max(0, flashT - dt);
    if (coinPulseT > 0) coinPulseT = Math.max(0, coinPulseT - dt);
    if (landDustT > 0) landDustT = Math.max(0, landDustT - dt);

    for (const e of entities) {
      if (!e.alive) continue;
      e.z += zSpeed * dt;
    }

    for (const b of bombs) {
      b.z -= zSpeed * 2.2 * dt;
      b.life -= dt;
      clearLaneObstacles(b.lane, b.z - b.blast, b.z + b.blast * 1.4, false);
    }
    bombs = bombs.filter((b) => b.life > 0 && b.z > -0.15);

    for (const bl of blasts) bl.life -= dt;
    blasts = blasts.filter((bl) => bl.life > 0);

    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const g = p.kind === "smoke" ? 30 : p.kind === "fireball" ? 120 : 260;
      p.vy += g * dt;
      p.vx *= 1 - 0.6 * dt;
      if (p.rot != null) p.rot += (p.vr || 0) * dt;
      if (p.kind === "smoke") p.r = (p.r || 8) + 18 * dt;
      if (p.kind === "fireball") p.r = Math.max(2, (p.r || 8) - 10 * dt);
      p.life -= dt;
    }
    particles = particles.filter((p) => p.life > 0);

    for (const ft of floatTexts) {
      ft.y += ft.vy * dt;
      ft.life -= dt;
    }
    floatTexts = floatTexts.filter((ft) => ft.life > 0);

    for (const e of entities) {
      if (!e.alive) continue;
      if (e.z < HIT_Z_MIN || e.z > HIT_Z_MAX) continue;
      if (e.lane !== player.lane) continue;
      if (e.kind === "coin") {
        e.alive = false;
        coins += 1;
        coinPickupFx(e.lane, e.z);
      } else if (e.kind === "plant_pickup") {
        e.alive = false;
        activatePlantPickup(e.variant || "sunflower");
        burst(e.lane, e.z, "rgba(132,204,22,0.85)", 10);
      } else if (e.kind === "obstacle") {
        if (isInvulnerable() || isPlantWallnutShield()) {
          smashObstacle(e);
        } else if (isObstacleClearing(e)) {
          /* jump or slide under low props */
        } else {
          gameOver();
          return;
        }
      }
    }

    entities = entities.filter((e) => e.alive && e.z < 1.15);

    spawnAcc -= dt;
    coinAcc -= dt;
    const spawnInterval =
      mode === "chill"
        ? Math.max(CHILL_SPAWN_MIN, CHILL_SPAWN_BASE - distance / CHILL_SPAWN_DIST_DIV)
        : Math.max(SPAWN_MIN, SPAWN_BASE - distance / SPAWN_DIST_DIV);
    if (spawnAcc <= 0) {
      spawnObstacle();
      spawnAcc =
        spawnInterval *
        (mode === "chill" ? 1.05 + Math.random() * 0.55 : 0.9 + Math.random() * 0.55);
    }
    if (coinAcc <= 0) {
      spawnCoinLine();
      coinAcc =
        mode === "chill"
          ? 2.2 + Math.random() * 1.6
          : mode === "plant"
            ? 2.0 + Math.random() * 1.5
            : 1.7 + Math.random() * 1.4;
    }

    updatePlantPowers(dt, zSpeed);

    updateHud();
  }

  function drawSkyEarth(vw, vh) {
    const g = ctx.createLinearGradient(0, 0, 0, vh * 0.55);
    g.addColorStop(0, "#1a8cff");
    g.addColorStop(0.45, "#5ec8ff");
    g.addColorStop(0.75, "#9ee0ff");
    g.addColorStop(1, "#c8f0ff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, vw, vh);

    // sun + soft halo
    const sx = vw * 0.82;
    const sy = vh * 0.11;
    const sr = vw * 0.085;
    const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 2.8);
    halo.addColorStop(0, "rgba(255,240,160,0.55)");
    halo.addColorStop(1, "rgba(255,240,160,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(sx, sy, sr * 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe566";
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.arc(sx - sr * 0.25, sy - sr * 0.25, sr * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // parallax clouds (slow)
    const cloudOff = (roadScroll * 0.04) % (vw * 1.6);
    drawCloud(vw * 0.15 - cloudOff * 0.3, vh * 0.14, vw * 0.12, 0.55);
    drawCloud(vw * 0.55 + cloudOff * 0.2, vh * 0.1, vw * 0.16, 0.45);
    drawCloud(vw * 0.9 - cloudOff * 0.15, vh * 0.18, vw * 0.1, 0.4);

    // far hills (slow parallax)
    const hillOff = (roadScroll * 0.08) % vw;
    ctx.fillStyle = "#5ecf8a";
    ctx.beginPath();
    ctx.moveTo(-vw + hillOff * 0.2, vh * 0.34);
    for (let i = 0; i <= 8; i++) {
      const x = -vw + hillOff * 0.2 + (i / 8) * vw * 2.2;
      const y = vh * (0.28 + 0.06 * Math.sin(i * 1.7 + 0.4));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(vw * 1.2, vh * 0.48);
    ctx.lineTo(-vw, vh * 0.48);
    ctx.fill();

    // near hills
    ctx.fillStyle = "#2e9e5b";
    ctx.beginPath();
    ctx.moveTo(-40 - hillOff * 0.35, vh * 0.4);
    for (let i = 0; i <= 10; i++) {
      const x = -40 - hillOff * 0.35 + (i / 10) * (vw + 80);
      const y = vh * (0.34 + 0.07 * Math.sin(i * 1.3 + 2));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(vw + 40, vh * 0.52);
    ctx.lineTo(-40, vh * 0.52);
    ctx.fill();

    // side trees parallax
    for (let i = 0; i < 6; i++) {
      const t = ((i / 6) + (roadScroll / 1400) % 1) % 1;
      const side = i % 2 === 0 ? -1 : 1;
      const y = vh * (0.38 + t * 0.12);
      const x = side < 0 ? vw * (0.04 + t * 0.04) : vw * (0.96 - t * 0.04);
      const sc = 0.45 + t * 0.7;
      drawTree(x, y, sc * 18);
    }
  }

  function drawCloud(x, y, r, a) {
    ctx.globalAlpha = a;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
    ctx.arc(x + r * 0.55, y - r * 0.15, r * 0.45, 0, Math.PI * 2);
    ctx.arc(x + r * 1.05, y, r * 0.5, 0, Math.PI * 2);
    ctx.arc(x + r * 0.5, y + r * 0.15, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawTree(x, y, s) {
    ctx.fillStyle = "#6b3a14";
    ctx.fillRect(x - s * 0.12, y - s * 0.35, s * 0.24, s * 0.5);
    ctx.fillStyle = "#1f8f45";
    ctx.beginPath();
    ctx.moveTo(x, y - s * 1.35);
    ctx.lineTo(x + s * 0.55, y - s * 0.35);
    ctx.lineTo(x - s * 0.55, y - s * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#27a855";
    ctx.beginPath();
    ctx.moveTo(x, y - s * 1.1);
    ctx.lineTo(x + s * 0.42, y - s * 0.25);
    ctx.lineTo(x - s * 0.42, y - s * 0.25);
    ctx.closePath();
    ctx.fill();
  }

  function drawSkySpace(vw, vh) {
    // soft lavender-pink nebula
    const g = ctx.createLinearGradient(0, 0, 0, vh);
    g.addColorStop(0, "#1a0f35");
    g.addColorStop(0.25, "#3d2a6b");
    g.addColorStop(0.5, "#8b6bb8");
    g.addColorStop(0.72, "#e8a8d0");
    g.addColorStop(1, "#f8d4e8");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, vw, vh);

    // nebula blobs
    const drift = Math.sin(animTime * 0.12) * 0.03;
    const blobs = [
      { x: 0.2 + drift, y: 0.22, r: 0.3, c: "rgba(255,160,210,0.32)" },
      { x: 0.75 - drift, y: 0.16, r: 0.34, c: "rgba(180,140,255,0.36)" },
      { x: 0.5 + drift * 0.5, y: 0.34, r: 0.26, c: "rgba(255,200,230,0.26)" },
      { x: 0.12, y: 0.46 + drift, r: 0.22, c: "rgba(160,120,255,0.22)" },
      { x: 0.88, y: 0.4 - drift, r: 0.2, c: "rgba(255,140,200,0.18)" },
    ];
    for (const b of blobs) {
      const grd = ctx.createRadialGradient(
        vw * b.x,
        vh * b.y,
        0,
        vw * b.x,
        vh * b.y,
        vw * b.r
      );
      grd.addColorStop(0, b.c);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, vw, vh * 0.7);
    }

    // crescent moon
    const mx = vw * 0.78;
    const my = vh * 0.11;
    const mr = vw * 0.07;
    ctx.fillStyle = "#fff6d8";
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a2a70";
    ctx.beginPath();
    ctx.arc(mx + mr * 0.38, my - mr * 0.12, mr * 0.82, 0, Math.PI * 2);
    ctx.fill();
    // soft glow around crescent
    const glow = ctx.createRadialGradient(mx - mr * 0.2, my, 0, mx, my, mr * 2.2);
    glow.addColorStop(0, "rgba(255,240,200,0.35)");
    glow.addColorStop(1, "rgba(255,240,200,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(mx - mr * 0.15, my, mr * 2, 0, Math.PI * 2);
    ctx.fill();

    // drifting stars
    for (const s of stars) {
      const sy = ((s.y + animTime * s.spd) % 1.15) - 0.05;
      const sx = ((s.x + Math.sin(animTime * 0.15 + s.tw) * 0.02) % 1 + 1) % 1;
      if (sy < 0 || sy > 0.72) continue;
      const twinkle = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(animTime * 3 + s.tw));
      ctx.globalAlpha = twinkle;
      if (s.hue === "pink") ctx.fillStyle = "#ffb6d9";
      else if (s.hue === "lavender") ctx.fillStyle = "#d4b8ff";
      else ctx.fillStyle = "#fff8ff";
      const px = sx * vw;
      const py = sy * vh;
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fill();
      // tiny sparkle cross for larger stars
      if (s.r > 1.6) {
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.globalAlpha = twinkle * 0.7;
        ctx.beginPath();
        ctx.moveTo(px - s.r * 2.2, py);
        ctx.lineTo(px + s.r * 2.2, py);
        ctx.moveTo(px, py - s.r * 2.2);
        ctx.lineTo(px, py + s.r * 2.2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawRoadEarth(vw, vh) {
    const far = roadEdges(0, vw, vh);
    const near = roadEdges(1, vw, vh);

    // grass shoulders
    const grass = ctx.createLinearGradient(0, far.y, 0, near.y + 40);
    grass.addColorStop(0, "#4caf50");
    grass.addColorStop(0.5, "#3d9e45");
    grass.addColorStop(1, "#2e8b3a");
    ctx.fillStyle = grass;
    ctx.fillRect(0, far.y, vw, near.y - far.y + 50);

    // dirt road body
    ctx.beginPath();
    ctx.moveTo(far.left, far.y);
    ctx.lineTo(far.right, far.y);
    ctx.lineTo(near.right, near.y);
    ctx.lineTo(near.left, near.y);
    ctx.closePath();
    const rg = ctx.createLinearGradient(0, far.y, 0, near.y);
    rg.addColorStop(0, "#a08060");
    rg.addColorStop(0.45, "#8b7355");
    rg.addColorStop(1, "#5c4030");
    ctx.fillStyle = rg;
    ctx.fill();

    // subtle dirt mottling / tire tracks
    for (let i = 0; i < 14; i++) {
      const z = ((i / 14) + (roadScroll / 700) % 1) % 1;
      const e = roadEdges(z, vw, vh);
      const w = e.right - e.left;
      ctx.globalAlpha = 0.08 + 0.1 * z;
      ctx.fillStyle = i % 2 === 0 ? "#4a3424" : "#c4a882";
      const px = e.left + w * (0.2 + (i % 5) * 0.15);
      ctx.beginPath();
      ctx.ellipse(px, e.y, 8 * z + 4, 3 * z + 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // three track grooves (back-facing Subway rails)
    drawTrackGrooves(vw, vh, "rgba(40,28,18,0.35)", 7);

    // edge rails / curbs
    ctx.lineCap = "butt";
    for (let side = 0; side < 2; side++) {
      ctx.beginPath();
      for (let z = 0; z <= 1; z += 0.04) {
        const e = roadEdges(z, vw, vh);
        const x = side === 0 ? e.left : e.right;
        if (z === 0) ctx.moveTo(x, e.y);
        else ctx.lineTo(x, e.y);
      }
      ctx.strokeStyle = "#d4c4a0";
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.strokeStyle = "#5a4030";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // lane dashes
    ctx.strokeStyle = "rgba(255,245,200,0.9)";
    ctx.lineCap = "round";
    for (let lane = 0; lane < 2; lane++) {
      let drawing = false;
      const dashPeriod = 0.11;
      const offset = (roadScroll / 190) % dashPeriod;
      ctx.lineWidth = 2.5;
      for (let z = 0; z <= 1; z += 0.018) {
        const e = roadEdges(z, vw, vh);
        const x = e.left + (e.right - e.left) * ((lane + 1) / 3);
        const phase = (z + offset) % dashPeriod;
        const on = phase < dashPeriod * 0.42;
        if (on) {
          if (!drawing) {
            ctx.beginPath();
            ctx.moveTo(x, e.y);
            drawing = true;
          } else ctx.lineTo(x, e.y);
        } else if (drawing) {
          ctx.stroke();
          drawing = false;
        }
      }
      if (drawing) ctx.stroke();
    }

    // roadside posts / lights scrolling
    for (let i = 0; i < 8; i++) {
      const z = ((i / 8) + (roadScroll / 520) % 1) % 1;
      if (z < 0.02 || z > 0.98) continue;
      const e = roadEdges(z, vw, vh);
      const sc = 0.35 + z * 0.9;
      for (const side of [-1, 1]) {
        const x = side < 0 ? e.left - 14 * sc : e.right + 14 * sc;
        // post
        ctx.fillStyle = "#6b7280";
        ctx.fillRect(x - 2 * sc, e.y - 28 * sc, 4 * sc, 28 * sc);
        // lamp
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(x, e.y - 30 * sc, 5 * sc, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(251,191,36,0.25)";
        ctx.beginPath();
        ctx.arc(x, e.y - 30 * sc, 12 * sc, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // grass tufts on shoulders
    for (let i = 0; i < 12; i++) {
      const z = ((i / 12) + (roadScroll / 640) % 1) % 1;
      const e = roadEdges(z, vw, vh);
      const sc = 0.4 + z;
      const side = i % 2 === 0 ? -1 : 1;
      const x = side < 0 ? e.left - 22 * sc : e.right + 22 * sc;
      ctx.strokeStyle = "#1f7a35";
      ctx.lineWidth = 1.5 * sc;
      ctx.beginPath();
      ctx.moveTo(x, e.y);
      ctx.quadraticCurveTo(x - 4 * sc, e.y - 10 * sc, x + 2 * sc, e.y - 16 * sc);
      ctx.moveTo(x, e.y);
      ctx.quadraticCurveTo(x + 5 * sc, e.y - 8 * sc, x - 1 * sc, e.y - 14 * sc);
      ctx.stroke();
    }
  }

  function drawRoadSpace(vw, vh) {
    const far = roadEdges(0, vw, vh);
    const near = roadEdges(1, vw, vh);

    const voidG = ctx.createLinearGradient(0, far.y, 0, near.y + 40);
    voidG.addColorStop(0, "rgba(40,20,80,0.45)");
    voidG.addColorStop(1, "rgba(120,60,140,0.65)");
    ctx.fillStyle = voidG;
    ctx.fillRect(0, far.y, vw, near.y - far.y + 50);

    // floating platform slabs along depth
    for (let i = 0; i < 7; i++) {
      const z = ((i / 7) + (roadScroll / 480) % 1) % 1;
      const e = roadEdges(z, vw, vh);
      const pad = 6 + 10 * z;
      ctx.globalAlpha = 0.18 + 0.35 * z;
      const pg = ctx.createLinearGradient(e.left, e.y - 8, e.right, e.y + 8);
      pg.addColorStop(0, "rgba(200,160,255,0.5)");
      pg.addColorStop(0.5, "rgba(255,200,240,0.65)");
      pg.addColorStop(1, "rgba(180,140,255,0.5)");
      ctx.fillStyle = pg;
      ctx.beginPath();
      roundRect(ctx, e.left + pad, e.y - 6 * z - 2, e.right - e.left - pad * 2, 10 + 8 * z, 4 + 4 * z);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // main glassy ribbon
    ctx.beginPath();
    ctx.moveTo(far.left, far.y);
    ctx.lineTo(far.right, far.y);
    ctx.lineTo(near.right, near.y);
    ctx.lineTo(near.left, near.y);
    ctx.closePath();
    const rg = ctx.createLinearGradient(0, far.y, 0, near.y);
    rg.addColorStop(0, "rgba(230,200,255,0.22)");
    rg.addColorStop(0.5, "rgba(255,190,230,0.4)");
    rg.addColorStop(1, "rgba(255,220,245,0.58)");
    ctx.fillStyle = rg;
    ctx.fill();

    drawTrackGrooves(vw, vh, "rgba(180,120,220,0.22)", 5);

    // neon edge rails
    for (let side = 0; side < 2; side++) {
      ctx.beginPath();
      for (let z = 0; z <= 1; z += 0.035) {
        const e = roadEdges(z, vw, vh);
        const x = side === 0 ? e.left : e.right;
        if (z === 0) ctx.moveTo(x, e.y);
        else ctx.lineTo(x, e.y);
      }
      ctx.strokeStyle = side === 0 ? "rgba(244,114,182,0.85)" : "rgba(192,132,252,0.85)";
      ctx.lineWidth = 3.5;
      ctx.shadowColor = side === 0 ? "#f472b6" : "#c084fc";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // lane sparkle dashes
    ctx.lineCap = "round";
    for (let lane = 0; lane < 2; lane++) {
      const dashPeriod = 0.095;
      const offset = (roadScroll / 170) % dashPeriod;
      let drawing = false;
      ctx.strokeStyle = "rgba(255,210,245,0.85)";
      ctx.lineWidth = 2.2;
      for (let z = 0; z <= 1; z += 0.016) {
        const e = roadEdges(z, vw, vh);
        const x = e.left + (e.right - e.left) * ((lane + 1) / 3);
        const phase = (z + offset) % dashPeriod;
        const on = phase < dashPeriod * 0.38;
        if (on) {
          if (!drawing) {
            ctx.beginPath();
            ctx.moveTo(x, e.y);
            drawing = true;
          } else ctx.lineTo(x, e.y);
        } else if (drawing) {
          ctx.stroke();
          drawing = false;
        }
      }
      if (drawing) ctx.stroke();
    }

    // floating rune lights / petals
    for (let i = 0; i < 14; i++) {
      const z = ((i / 14) + (roadScroll / 860) % 1) % 1;
      const e = roadEdges(z, vw, vh);
      const lx = e.left + (e.right - e.left) * (0.12 + (i % 4) * 0.25);
      const pulse = 0.5 + 0.5 * Math.sin(animTime * 4 + i);
      ctx.globalAlpha = (0.2 + 0.4 * z) * pulse;
      ctx.fillStyle = i % 3 === 0 ? "#ffd0ec" : i % 3 === 1 ? "#e0c4ff" : "#fff";
      ctx.beginPath();
      ctx.arc(lx, e.y - 4 * z, 2 + 4 * z, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // side floating crystals as decor
    for (let i = 0; i < 5; i++) {
      const z = ((i / 5) + (roadScroll / 1100) % 1) % 1;
      const e = roadEdges(z, vw, vh);
      const sc = 0.35 + z * 0.8;
      const side = i % 2 === 0 ? -1 : 1;
      const x = side < 0 ? e.left - 26 * sc : e.right + 26 * sc;
      ctx.globalAlpha = 0.35 + 0.4 * z;
      ctx.fillStyle = "#e9d5ff";
      ctx.beginPath();
      ctx.moveTo(x, e.y - 28 * sc);
      ctx.lineTo(x + 8 * sc, e.y - 10 * sc);
      ctx.lineTo(x, e.y);
      ctx.lineTo(x - 8 * sc, e.y - 10 * sc);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawSkyChill(vw, vh) {
    // lo-fi dusk: soft peach → mint → lavender
    const g = ctx.createLinearGradient(0, 0, 0, vh * 0.6);
    g.addColorStop(0, "#8fadc4");
    g.addColorStop(0.35, "#b8c9c0");
    g.addColorStop(0.65, "#d4c4b0");
    g.addColorStop(1, "#e8d5c4");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, vw, vh);

    // soft sun disk
    const sx = vw * 0.78;
    const sy = vh * 0.16;
    const sr = vw * 0.09;
    const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3);
    halo.addColorStop(0, "rgba(255,220,170,0.55)");
    halo.addColorStop(1, "rgba(255,220,170,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(sx, sy, sr * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f6d7a8";
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();

    // slow drifting soft clouds
    const cloudOff = (roadScroll * 0.025) % (vw * 1.5);
    drawCloud(vw * 0.2 - cloudOff * 0.2, vh * 0.15, vw * 0.14, 0.35);
    drawCloud(vw * 0.6 + cloudOff * 0.15, vh * 0.12, vw * 0.18, 0.28);
    drawCloud(vw * 0.85 - cloudOff * 0.1, vh * 0.2, vw * 0.11, 0.3);

    // gentle far hills
    ctx.fillStyle = "#9bb5a8";
    ctx.beginPath();
    ctx.moveTo(0, vh * 0.36);
    for (let i = 0; i <= 8; i++) {
      const x = (i / 8) * vw;
      const y = vh * (0.3 + 0.05 * Math.sin(i * 1.4 + animTime * 0.05));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(vw, vh * 0.5);
    ctx.lineTo(0, vh * 0.5);
    ctx.fill();
    ctx.fillStyle = "#7f9e90";
    ctx.beginPath();
    ctx.moveTo(0, vh * 0.4);
    for (let i = 0; i <= 8; i++) {
      const x = (i / 8) * vw;
      const y = vh * (0.35 + 0.06 * Math.sin(i * 1.1 + 1.2));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(vw, vh * 0.52);
    ctx.lineTo(0, vh * 0.52);
    ctx.fill();
  }

  function drawRoadChill(vw, vh) {
    const far = roadEdges(0, vw, vh);
    const near = roadEdges(1, vw, vh);

    // soft meadow shoulders
    const grass = ctx.createLinearGradient(0, far.y, 0, near.y + 40);
    grass.addColorStop(0, "#a8c4b0");
    grass.addColorStop(1, "#7fa890");
    ctx.fillStyle = grass;
    ctx.fillRect(0, far.y, vw, near.y - far.y + 50);

    // warm dusty path
    ctx.beginPath();
    ctx.moveTo(far.left, far.y);
    ctx.lineTo(far.right, far.y);
    ctx.lineTo(near.right, near.y);
    ctx.lineTo(near.left, near.y);
    ctx.closePath();
    const rg = ctx.createLinearGradient(0, far.y, 0, near.y);
    rg.addColorStop(0, "#cbb89a");
    rg.addColorStop(0.5, "#b8a07e");
    rg.addColorStop(1, "#8f7a5c");
    ctx.fillStyle = rg;
    ctx.fill();

    drawTrackGrooves(vw, vh, "rgba(70,55,40,0.28)", 6);

    // soft edge rails
    ctx.lineCap = "round";
    for (let side = 0; side < 2; side++) {
      ctx.beginPath();
      for (let z = 0; z <= 1; z += 0.05) {
        const e = roadEdges(z, vw, vh);
        const x = side === 0 ? e.left : e.right;
        if (z === 0) ctx.moveTo(x, e.y);
        else ctx.lineTo(x, e.y);
      }
      ctx.strokeStyle = "rgba(255,245,220,0.75)";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // relaxed lane dashes
    ctx.strokeStyle = "rgba(255,250,230,0.7)";
    for (let lane = 0; lane < 2; lane++) {
      let drawing = false;
      const dashPeriod = 0.16;
      const offset = (roadScroll / 260) % dashPeriod;
      ctx.lineWidth = 2;
      for (let z = 0; z <= 1; z += 0.02) {
        const e = roadEdges(z, vw, vh);
        const x = e.left + (e.right - e.left) * ((lane + 1) / 3);
        const phase = (z + offset) % dashPeriod;
        const on = phase < dashPeriod * 0.4;
        if (on) {
          if (!drawing) {
            ctx.beginPath();
            ctx.moveTo(x, e.y);
            drawing = true;
          } else ctx.lineTo(x, e.y);
        } else if (drawing) {
          ctx.stroke();
          drawing = false;
        }
      }
      if (drawing) ctx.stroke();
    }

    // chill roadside lanterns (soft glow)
    for (let i = 0; i < 6; i++) {
      const z = ((i / 6) + (roadScroll / 700) % 1) % 1;
      if (z < 0.04 || z > 0.96) continue;
      const e = roadEdges(z, vw, vh);
      const sc = 0.35 + z * 0.85;
      for (const side of [-1, 1]) {
        const x = side < 0 ? e.left - 12 * sc : e.right + 12 * sc;
        ctx.fillStyle = "#8a9a90";
        ctx.fillRect(x - 1.5 * sc, e.y - 22 * sc, 3 * sc, 22 * sc);
        ctx.fillStyle = "rgba(255,230,180,0.7)";
        ctx.beginPath();
        ctx.arc(x, e.y - 24 * sc, 4 * sc, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,220,160,0.18)";
        ctx.beginPath();
        ctx.arc(x, e.y - 24 * sc, 14 * sc, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /** Dark rail grooves under each lane (Subway Surfers–style 3 tracks). */
  function drawTrackGrooves(vw, vh, rgba, nearW) {
    for (let lane = 0; lane < 3; lane++) {
      for (let z = 0; z < 1; z += 0.05) {
        const e0 = roadEdges(z, vw, vh);
        const e1 = roadEdges(Math.min(1, z + 0.05), vw, vh);
        const x0 = e0.left + (e0.right - e0.left) * LANE_X[lane];
        const x1 = e1.left + (e1.right - e1.left) * LANE_X[lane];
        const w = nearW * (0.25 + 0.75 * z);
        ctx.strokeStyle = rgba;
        ctx.lineWidth = w;
        ctx.lineCap = "butt";
        ctx.beginPath();
        ctx.moveTo(x0, e0.y);
        ctx.lineTo(x1, e1.y);
        ctx.stroke();
      }
    }
  }

  function drawGroundShadow(p, w, d) {
    const s = p.scale;
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 2 * s, w * s, d * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCoin(p, space) {
    const s = p.scale;
    const r = 11 * s;
    // Hover above the road + light bob so it reads as a floating coin
    const bobY = Math.sin(animTime * 3.2 + p.x * 0.02) * 3.2 * s;
    const y = p.y - 26 * s + bobY;

    // Ground shadow (clear oval under the floating coin)
    ctx.fillStyle = space ? "rgba(120,60,160,0.28)" : "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 2 * s, r * 0.95, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soft metallic halo (subtle — not a glow orb)
    const halo = ctx.createRadialGradient(p.x, y, r * 0.4, p.x, y, r * 1.7);
    halo.addColorStop(0, space ? "rgba(255,200,230,0.22)" : "rgba(255,210,80,0.2)");
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(p.x, y, r * 1.7, 0, Math.PI * 2);
    ctx.fill();

    // Thick coin face — metal disc with dark rim + bright face
    const face = ctx.createLinearGradient(p.x - r, y - r, p.x + r, y + r);
    if (space) {
      // rose-gold metal (still a coin, not a pink orb)
      face.addColorStop(0, "#fff0e8");
      face.addColorStop(0.35, "#f6c4a8");
      face.addColorStop(0.7, "#e08a9a");
      face.addColorStop(1, "#b85a78");
    } else {
      face.addColorStop(0, "#fff8c8");
      face.addColorStop(0.3, "#ffe066");
      face.addColorStop(0.65, "#f0b400");
      face.addColorStop(1, "#b87a00");
    }
    ctx.beginPath();
    ctx.fillStyle = face;
    ctx.arc(p.x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Outer thick rim (coin edge)
    ctx.beginPath();
    ctx.strokeStyle = space ? "#8a3a58" : "#8a5a00";
    ctx.lineWidth = 2.8 * s;
    ctx.arc(p.x, y, r - 0.4 * s, 0, Math.PI * 2);
    ctx.stroke();

    // Inner raised ring
    ctx.beginPath();
    ctx.strokeStyle = space ? "rgba(255,230,240,0.75)" : "rgba(255,240,170,0.9)";
    ctx.lineWidth = 1.6 * s;
    ctx.arc(p.x, y, r * 0.72, 0, Math.PI * 2);
    ctx.stroke();

    // Embossed ¥ (reads as currency coin across themes)
    ctx.fillStyle = space ? "rgba(90,30,50,0.72)" : "rgba(120,70,0,0.78)";
    ctx.font = "bold " + Math.max(9, 13 * s) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("¥", p.x, y + 0.5 * s);

    // Specular highlight (upper-left metal glint)
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.beginPath();
    ctx.ellipse(p.x - 3.2 * s, y - 3.8 * s, 2.6 * s, 1.7 * s, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Lower dark crescent (thickness / bevel)
    ctx.strokeStyle = space ? "rgba(60,20,40,0.35)" : "rgba(80,45,0,0.35)";
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.arc(p.x, y, r * 0.88, 0.35, Math.PI - 0.35);
    ctx.stroke();
  }

  function drawEntity(e, vw, vh) {
    if (!e.alive || e.z < 0) return;
    const p = project(e.lane, Math.max(0, Math.min(1, e.z)), vw, vh);
    if (e.kind === "coin") {
      drawCoin(p, mode === "space");
      return;
    }
    if (e.kind === "plant_pickup") {
      drawPlantPickup(p, e.variant || "sunflower");
      return;
    }
    if (e.kind !== "obstacle") return;
    const v = e.variant || (mode === "space" ? "crystal" : "box");
    if (mode === "plant") {
      drawZombieObstacle(p, v === "zombie_tall");
      return;
    }
    if (mode === "space") {
      if (v === "crystal_cluster") drawCrystalCluster(p);
      else if (v === "obelisk") drawSpaceObelisk(p);
      else drawCrystalObstacle(p);
    } else {
      if (v === "barrier") drawBarrier(p);
      else if (v === "sign") drawWarningSign(p);
      else if (v === "train") drawTrain(p);
      else drawCrate(p);
    }
  }

  function drawPlantImg(key, p, sizeMul, yLift) {
    const s = p.scale;
    const img = plantImgs[key];
    const size = (sizeMul || 52) * s;
    const y = p.y - (yLift != null ? yLift : 8) * s;
    drawGroundShadow(p, size * 0.38, size * 0.12);
    if (img && img.complete && img.naturalWidth) {
      ctx.drawImage(img, p.x - size * 0.5, y - size, size, size);
    } else {
      // Fallback emoji while loading
      ctx.font = Math.round(size * 0.85) + "px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      const fallback = {
        sunflower: "🌻",
        peashooter: "🟢",
        gatling: "🔫",
        wallnut: "🥜",
        cherry_bomb: "🍒",
        zombie_basic: "🧟",
        sun_token: "☀️",
      };
      ctx.fillText(fallback[key] || "🌿", p.x, y);
    }
  }

  function drawPlantPickup(p, variant) {
    const bob = Math.sin(animTime * 4 + p.x * 0.03) * 4 * p.scale;
    const key =
      variant === "peashooter"
        ? "peashooter"
        : variant === "gatling"
          ? "gatling"
          : variant === "wallnut"
            ? "wallnut"
            : "sunflower";
    ctx.save();
    ctx.translate(0, -bob);
    // soft glow ring
    const halo = ctx.createRadialGradient(p.x, p.y - 30 * p.scale, 4, p.x, p.y - 30 * p.scale, 36 * p.scale);
    halo.addColorStop(0, "rgba(190,242,100,0.45)");
    halo.addColorStop(1, "rgba(190,242,100,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 28 * p.scale, 34 * p.scale, 0, Math.PI * 2);
    ctx.fill();
    drawPlantImg(key, p, 48, 6);
    ctx.restore();
  }

  function drawZombieObstacle(p, tall) {
    drawPlantImg("zombie_basic", p, tall ? 64 : 54, tall ? 4 : 6);
    if (tall) {
      ctx.fillStyle = "rgba(120,40,40,0.85)";
      ctx.font = "bold " + Math.round(12 * p.scale) + "px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("!", p.x, p.y - 62 * p.scale);
    }
  }

  function drawPlantShots(vw, vh) {
    for (const s of plantShots) {
      if (s.z < 0) continue;
      const p = project(s.lane, Math.max(0, Math.min(1, s.z)), vw, vh);
      const r = (s.kind === "gatling" ? 6 : 8) * p.scale;
      const g = ctx.createRadialGradient(p.x, p.y - 18 * p.scale, 0, p.x, p.y - 18 * p.scale, r * 2);
      g.addColorStop(0, "#ecfccb");
      g.addColorStop(0.5, "#84cc16");
      g.addColorStop(1, "#365314");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 18 * p.scale, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1.5 * p.scale;
      ctx.stroke();
    }
  }

  function drawActivePlantHud(vw, vh) {
    if (mode !== "plant" || !running) return;
    const items = [];
    if (plantSunflowerT > 0) items.push({ key: "sunflower", t: plantSunflowerT, max: PLANT_SUNFLOWER_DUR });
    if (plantPeaT > 0) items.push({ key: "peashooter", t: plantPeaT, max: PLANT_PEA_DUR });
    if (plantGatlingT > 0) items.push({ key: "gatling", t: plantGatlingT, max: PLANT_GATLING_DUR });
    if (plantWallnutT > 0) items.push({ key: "wallnut", t: plantWallnutT, max: PLANT_WALLNUT_DUR });
    if (plantCherryT > 0) items.push({ key: "cherry_bomb", t: plantCherryT, max: PLANT_CHERRY_DUR });
    if (!items.length) return;
    const baseX = 12;
    let y = vh * 0.18;
    for (const it of items) {
      const img = plantImgs[it.key];
      const box = 36;
      ctx.fillStyle = "rgba(20,40,10,0.45)";
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(baseX, y, box + 44, box + 6, 8)
        : ctx.rect(baseX, y, box + 44, box + 6);
      ctx.fill();
      if (img && img.complete) ctx.drawImage(img, baseX + 3, y + 3, box, box);
      ctx.fillStyle = "#fef9c3";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.ceil(it.t) + "s", baseX + box + 8, y + box * 0.5 + 3);
      // thin timer bar
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(baseX + 3, y + box + 1, box + 38, 3);
      ctx.fillStyle = "#a3e635";
      ctx.fillRect(baseX + 3, y + box + 1, (box + 38) * Math.max(0, it.t / it.max), 3);
      y += box + 14;
    }
  }

  function drawSkyPlant(vw, vh) {
    const bg = plantImgs.lawn_backdrop;
    if (bg && bg.complete && bg.naturalWidth) {
      // Cover-style draw of HQ lawn backdrop (original homage art)
      const iw = bg.naturalWidth;
      const ih = bg.naturalHeight;
      const scale = Math.max(vw / iw, vh / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (vw - dw) * 0.5;
      const dy = (vh - dh) * 0.15; // bias slightly upward so lawn sits near horizon
      ctx.drawImage(bg, dx, dy, dw, dh);
      // soft lower fade into road greens
      const fade = ctx.createLinearGradient(0, vh * 0.28, 0, vh * 0.55);
      fade.addColorStop(0, "rgba(134,239,172,0)");
      fade.addColorStop(1, "rgba(74,222,128,0.55)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, vh * 0.28, vw, vh * 0.3);
      return;
    }

    const g = ctx.createLinearGradient(0, 0, 0, vh * 0.55);
    g.addColorStop(0, "#7dd3fc");
    g.addColorStop(0.4, "#bae6fd");
    g.addColorStop(0.75, "#fef08a");
    g.addColorStop(1, "#86efac");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, vw, vh);

    // big sun
    const sx = vw * 0.78;
    const sy = vh * 0.1;
    const sr = vw * 0.1;
    const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3);
    halo.addColorStop(0, "rgba(254,240,138,0.7)");
    halo.addColorStop(1, "rgba(254,240,138,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(sx, sy, sr * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();

    // far fence hint / lawn hills
    ctx.fillStyle = "#4ade80";
    ctx.beginPath();
    ctx.moveTo(0, vh * 0.38);
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * vw;
      const y = vh * (0.34 + 0.05 * Math.sin(i * 0.9 + roadScroll * 0.001));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(vw, vh * 0.5);
    ctx.lineTo(0, vh * 0.5);
    ctx.fill();

    // picket fence silhouette
    ctx.strokeStyle = "rgba(120,80,40,0.45)";
    ctx.lineWidth = 2;
    const fenceY = vh * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, fenceY);
    ctx.lineTo(vw, fenceY);
    ctx.stroke();
    for (let i = 0; i < 14; i++) {
      const x = ((i / 14) * vw + (roadScroll * 0.03) % (vw / 14));
      ctx.fillStyle = "rgba(180,140,90,0.55)";
      ctx.fillRect(x, fenceY - 18, 4, 18);
    }
  }

  function drawRoadPlant(vw, vh) {
    const far = roadEdges(0, vw, vh);
    const near = roadEdges(1, vw, vh);

    // lush lawn shoulders
    const grass = ctx.createLinearGradient(0, far.y, 0, near.y + 40);
    grass.addColorStop(0, "#86efac");
    grass.addColorStop(0.5, "#4ade80");
    grass.addColorStop(1, "#22c55e");
    ctx.fillStyle = grass;
    ctx.fillRect(0, far.y, vw, near.y - far.y + 50);

    // checkerboard lawn path (PvZ-ish strips)
    ctx.beginPath();
    ctx.moveTo(far.left, far.y);
    ctx.lineTo(far.right, far.y);
    ctx.lineTo(near.right, near.y);
    ctx.lineTo(near.left, near.y);
    ctx.closePath();
    const rg = ctx.createLinearGradient(0, far.y, 0, near.y);
    rg.addColorStop(0, "#bbf7d0");
    rg.addColorStop(0.45, "#86efac");
    rg.addColorStop(1, "#4ade80");
    ctx.fillStyle = rg;
    ctx.fill();

    // light stripe bands
    for (let i = 0; i < 8; i++) {
      const z0 = i / 8;
      const z1 = (i + 1) / 8;
      if (i % 2 === 0) continue;
      const e0 = roadEdges(z0, vw, vh);
      const e1 = roadEdges(z1, vw, vh);
      ctx.beginPath();
      ctx.moveTo(e0.left, e0.y);
      ctx.lineTo(e0.right, e0.y);
      ctx.lineTo(e1.right, e1.y);
      ctx.lineTo(e1.left, e1.y);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,200,0.12)";
      ctx.fill();
    }

    drawTrackGrooves(vw, vh, "rgba(34,100,40,0.28)", 5);

    // lane dashes
    ctx.strokeStyle = "rgba(255,255,220,0.55)";
    for (let lane = 0; lane < 2; lane++) {
      let drawing = false;
      const dashPeriod = 0.14;
      const offset = (roadScroll / 240) % dashPeriod;
      ctx.lineWidth = 2;
      for (let z = 0; z <= 1; z += 0.02) {
        const e = roadEdges(z, vw, vh);
        const x = e.left + (e.right - e.left) * ((lane + 1) / 3);
        const phase = (z + offset) % dashPeriod;
        const on = phase < dashPeriod * 0.4;
        if (on) {
          if (!drawing) {
            ctx.beginPath();
            ctx.moveTo(x, e.y);
            drawing = true;
          } else ctx.lineTo(x, e.y);
        } else if (drawing) {
          ctx.stroke();
          drawing = false;
        }
      }
      if (drawing) ctx.stroke();
    }

    // roadside flowers / small plants
    for (let i = 0; i < 8; i++) {
      const z = ((i / 8) + (roadScroll / 620) % 1) % 1;
      if (z < 0.05 || z > 0.95) continue;
      const e = roadEdges(z, vw, vh);
      const sc = 0.35 + z * 0.9;
      for (const side of [-1, 1]) {
        const x = side < 0 ? e.left - 16 * sc : e.right + 16 * sc;
        ctx.fillStyle = "#166534";
        ctx.fillRect(x - 1.5 * sc, e.y - 10 * sc, 3 * sc, 10 * sc);
        ctx.fillStyle = i % 2 === 0 ? "#facc15" : "#f472b6";
        ctx.beginPath();
        ctx.arc(x, e.y - 12 * sc, 4 * sc, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /** Saturated wooden crate with top + side faces (Subway-ish prop). */
  function drawCrate(p) {
    const s = p.scale;
    const w = 46 * s;
    const h = 40 * s;
    const d = 14 * s;
    const x = p.x;
    const y = p.y;
    drawGroundShadow(p, 26, 9);
    // right side
    ctx.beginPath();
    ctx.moveTo(x + w * 0.42, y - h);
    ctx.lineTo(x + w * 0.42 + d, y - h + d * 0.35);
    ctx.lineTo(x + w * 0.42 + d, y + d * 0.35);
    ctx.lineTo(x + w * 0.42, y);
    ctx.closePath();
    ctx.fillStyle = "#6b3a14";
    ctx.fill();
    // top
    ctx.beginPath();
    ctx.moveTo(x - w * 0.42, y - h);
    ctx.lineTo(x + w * 0.42, y - h);
    ctx.lineTo(x + w * 0.42 + d, y - h + d * 0.35);
    ctx.lineTo(x - w * 0.42 + d, y - h + d * 0.35);
    ctx.closePath();
    const topG = ctx.createLinearGradient(x, y - h - 4, x, y - h + d);
    topG.addColorStop(0, "#d4a05a");
    topG.addColorStop(1, "#a66b2b");
    ctx.fillStyle = topG;
    ctx.fill();
    // front
    const fg = ctx.createLinearGradient(x - w * 0.42, y - h, x + w * 0.42, y);
    fg.addColorStop(0, "#c47a2c");
    fg.addColorStop(0.5, "#a05a1e");
    fg.addColorStop(1, "#7a4010");
    ctx.fillStyle = fg;
    ctx.fillRect(x - w * 0.42, y - h, w * 0.84, h);
    ctx.strokeStyle = "#4a2408";
    ctx.lineWidth = 2 * s;
    ctx.strokeRect(x - w * 0.42, y - h, w * 0.84, h);
    // planks + metal band
    ctx.strokeStyle = "rgba(60,30,8,0.55)";
    ctx.beginPath();
    ctx.moveTo(x - w * 0.42, y - h * 0.5);
    ctx.lineTo(x + w * 0.42, y - h * 0.5);
    ctx.stroke();
    ctx.fillStyle = "#c0c8d0";
    ctx.fillRect(x - w * 0.42, y - h * 0.72, w * 0.84, 5 * s);
    ctx.fillStyle = "#8a949e";
    ctx.fillRect(x - w * 0.42, y - h * 0.28, w * 0.84, 5 * s);
    // X mark
    ctx.strokeStyle = "rgba(255,220,160,0.35)";
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.28, y - h * 0.85);
    ctx.lineTo(x + w * 0.28, y - h * 0.15);
    ctx.moveTo(x + w * 0.28, y - h * 0.85);
    ctx.lineTo(x - w * 0.28, y - h * 0.15);
    ctx.stroke();
  }

  /** Low striped road barrier — jumpable look. */
  function drawBarrier(p) {
    const s = p.scale;
    const w = 54 * s;
    const h = 26 * s;
    drawGroundShadow(p, 30, 8);
    // legs
    ctx.fillStyle = "#3d4450";
    ctx.fillRect(p.x - w * 0.38, p.y - h * 0.35, 5 * s, h * 0.4);
    ctx.fillRect(p.x + w * 0.38 - 5 * s, p.y - h * 0.35, 5 * s, h * 0.4);
    // board with orange/white stripes
    const x0 = p.x - w * 0.48;
    const y0 = p.y - h;
    ctx.fillStyle = "#fff8f0";
    ctx.fillRect(x0, y0, w * 0.96, h * 0.72);
    const stripe = w * 0.16;
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#ff6a00" : "#fff8f0";
      ctx.beginPath();
      ctx.moveTo(x0 + i * stripe - 6 * s, y0);
      ctx.lineTo(x0 + i * stripe + stripe - 6 * s, y0);
      ctx.lineTo(x0 + i * stripe + stripe + 6 * s, y0 + h * 0.72);
      ctx.lineTo(x0 + i * stripe + 6 * s, y0 + h * 0.72);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = "#1a2030";
    ctx.lineWidth = 2 * s;
    ctx.strokeRect(x0, y0, w * 0.96, h * 0.72);
    // highlight edge
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.moveTo(x0 + 2 * s, y0 + 2 * s);
    ctx.lineTo(x0 + w * 0.96 - 2 * s, y0 + 2 * s);
    ctx.stroke();
  }

  /** Warning sign on a post. */
  function drawWarningSign(p) {
    const s = p.scale;
    drawGroundShadow(p, 14, 6);
    // post
    const pg = ctx.createLinearGradient(p.x - 3 * s, 0, p.x + 3 * s, 0);
    pg.addColorStop(0, "#9aa3ad");
    pg.addColorStop(0.5, "#e8eef4");
    pg.addColorStop(1, "#6b7380");
    ctx.fillStyle = pg;
    ctx.fillRect(p.x - 3 * s, p.y - 70 * s, 6 * s, 70 * s);
    // diamond sign
    const cy = p.y - 58 * s;
    ctx.save();
    ctx.translate(p.x, cy);
    ctx.rotate(Math.PI / 4);
    const sg = ctx.createLinearGradient(-18 * s, -18 * s, 18 * s, 18 * s);
    sg.addColorStop(0, "#ffe566");
    sg.addColorStop(0.5, "#ffcc00");
    sg.addColorStop(1, "#e69500");
    ctx.fillStyle = sg;
    ctx.fillRect(-18 * s, -18 * s, 36 * s, 36 * s);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 3 * s;
    ctx.strokeRect(-18 * s, -18 * s, 36 * s, 36 * s);
    ctx.restore();
    // bang
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold " + Math.round(22 * s) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", p.x, cy);
  }

  /** Red/cream subway train car face — reference look. Jump still clears (ease). */
  function drawTrain(p) {
    const s = p.scale;
    const w = 58 * s;
    const h = 78 * s;
    const d = 16 * s;
    drawGroundShadow(p, 34, 11);
    const x = p.x;
    const y = p.y;
    // side depth
    ctx.beginPath();
    ctx.moveTo(x + w * 0.45, y - h);
    ctx.lineTo(x + w * 0.45 + d, y - h + 8 * s);
    ctx.lineTo(x + w * 0.45 + d, y + 4 * s);
    ctx.lineTo(x + w * 0.45, y);
    ctx.closePath();
    ctx.fillStyle = "#8b1520";
    ctx.fill();
    // body front
    const body = ctx.createLinearGradient(x - w * 0.45, y - h, x + w * 0.45, y);
    body.addColorStop(0, "#ff4d5a");
    body.addColorStop(0.35, "#e12233");
    body.addColorStop(1, "#9a101c");
    ctx.fillStyle = body;
    roundRect(ctx, x - w * 0.45, y - h, w * 0.9, h, 10 * s);
    ctx.fill();
    // cream stripe
    ctx.fillStyle = "#f5efe3";
    ctx.fillRect(x - w * 0.45, y - h * 0.42, w * 0.9, h * 0.16);
    ctx.fillStyle = "#d8cfc0";
    ctx.fillRect(x - w * 0.45, y - h * 0.28, w * 0.9, 3 * s);
    // windows (glowing cyan)
    const winY = y - h * 0.78;
    for (let i = -1; i <= 1; i++) {
      const wx = x + i * 16 * s;
      const wg = ctx.createLinearGradient(wx - 8 * s, winY, wx + 8 * s, winY + 18 * s);
      wg.addColorStop(0, "#b8f0ff");
      wg.addColorStop(0.5, "#4dcfff");
      wg.addColorStop(1, "#1a8cff");
      ctx.fillStyle = wg;
      roundRect(ctx, wx - 8 * s, winY, 16 * s, 18 * s, 3 * s);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillRect(wx - 6 * s, winY + 2 * s, 6 * s, 4 * s);
    }
    // headlights
    ctx.fillStyle = "#fff6c8";
    ctx.beginPath();
    ctx.arc(x - 16 * s, y - h * 0.12, 5 * s, 0, Math.PI * 2);
    ctx.arc(x + 16 * s, y - h * 0.12, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,240,160,0.45)";
    ctx.beginPath();
    ctx.arc(x - 16 * s, y - h * 0.12, 9 * s, 0, Math.PI * 2);
    ctx.arc(x + 16 * s, y - h * 0.12, 9 * s, 0, Math.PI * 2);
    ctx.fill();
    // bumper
    ctx.fillStyle = "#5c6570";
    roundRect(ctx, x - w * 0.4, y - 8 * s, w * 0.8, 10 * s, 3 * s);
    ctx.fill();
    // outline
    ctx.strokeStyle = "rgba(40,0,8,0.65)";
    ctx.lineWidth = 2 * s;
    roundRect(ctx, x - w * 0.45, y - h, w * 0.9, h, 10 * s);
    ctx.stroke();
  }

  function roundRect(c, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + rr, y);
    c.arcTo(x + w, y, x + w, y + h, rr);
    c.arcTo(x + w, y + h, x, y + h, rr);
    c.arcTo(x, y + h, x, y, rr);
    c.arcTo(x, y, x + w, y, rr);
    c.closePath();
  }

  function drawCrystalObstacle(p) {
    const s = p.scale;
    const x = p.x;
    const y = p.y;
    drawGroundShadow(p, 18, 7);
    const glow = ctx.createRadialGradient(x, y - 22 * s, 0, x, y - 18 * s, 48 * s);
    glow.addColorStop(0, "rgba(255,140,220,0.65)");
    glow.addColorStop(0.45, "rgba(180,120,255,0.28)");
    glow.addColorStop(1, "rgba(255,160,220,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y - 18 * s, 48 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y - 56 * s);
    ctx.lineTo(x + 24 * s, y - 24 * s);
    ctx.lineTo(x + 16 * s, y);
    ctx.lineTo(x - 16 * s, y);
    ctx.lineTo(x - 24 * s, y - 24 * s);
    ctx.closePath();
    const cg = ctx.createLinearGradient(x - 24 * s, y - 56 * s, x + 24 * s, y);
    cg.addColorStop(0, "#fff0fa");
    cg.addColorStop(0.3, "#f9a8d4");
    cg.addColorStop(0.55, "#e879f9");
    cg.addColorStop(0.8, "#c084fc");
    cg.addColorStop(1, "#7c3aed");
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 2 * s;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - 56 * s);
    ctx.lineTo(x, y);
    ctx.moveTo(x - 24 * s, y - 24 * s);
    ctx.lineTo(x + 24 * s, y - 24 * s);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.moveTo(x - 7 * s, y - 46 * s);
    ctx.lineTo(x - 1 * s, y - 30 * s);
    ctx.lineTo(x - 12 * s, y - 28 * s);
    ctx.closePath();
    ctx.fill();
  }

  function drawCrystalCluster(p) {
    const s = p.scale;
    drawGroundShadow(p, 24, 8);
    // three offset crystals
    const offsets = [
      { dx: -14, h: 38, hue: 0 },
      { dx: 12, h: 34, hue: 1 },
      { dx: 0, h: 52, hue: 2 },
    ];
    for (const o of offsets) {
      const x = p.x + o.dx * s;
      const y = p.y;
      const glow = ctx.createRadialGradient(x, y - o.h * 0.4 * s, 0, x, y - o.h * 0.35 * s, 28 * s);
      glow.addColorStop(0, o.hue === 2 ? "rgba(255,160,230,0.55)" : "rgba(180,160,255,0.4)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y - o.h * 0.35 * s, 28 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y - o.h * s);
      ctx.lineTo(x + 12 * s, y - o.h * 0.45 * s);
      ctx.lineTo(x + 7 * s, y);
      ctx.lineTo(x - 7 * s, y);
      ctx.lineTo(x - 12 * s, y - o.h * 0.45 * s);
      ctx.closePath();
      const cg = ctx.createLinearGradient(x, y - o.h * s, x, y);
      if (o.hue === 0) {
        cg.addColorStop(0, "#e9d5ff");
        cg.addColorStop(1, "#a78bfa");
      } else if (o.hue === 1) {
        cg.addColorStop(0, "#fbcfe8");
        cg.addColorStop(1, "#f472b6");
      } else {
        cg.addColorStop(0, "#fff1f8");
        cg.addColorStop(0.4, "#e879f9");
        cg.addColorStop(1, "#7c3aed");
      }
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1.4 * s;
      ctx.stroke();
    }
  }

  function drawSpaceObelisk(p) {
    const s = p.scale;
    const h = 88 * s;
    drawGroundShadow(p, 20, 8);
    const x = p.x;
    const y = p.y;
    // glow pillar
    const glow = ctx.createRadialGradient(x, y - h * 0.5, 0, x, y - h * 0.5, 40 * s);
    glow.addColorStop(0, "rgba(200,160,255,0.55)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y - h * 0.5, 40 * s, 0, Math.PI * 2);
    ctx.fill();
    // side
    ctx.beginPath();
    ctx.moveTo(x + 14 * s, y - h + 10 * s);
    ctx.lineTo(x + 22 * s, y - h + 18 * s);
    ctx.lineTo(x + 18 * s, y);
    ctx.lineTo(x + 10 * s, y);
    ctx.closePath();
    ctx.fillStyle = "#5b21b6";
    ctx.fill();
    // front
    const fg = ctx.createLinearGradient(x - 14 * s, y - h, x + 14 * s, y);
    fg.addColorStop(0, "#f5d0fe");
    fg.addColorStop(0.35, "#d8b4fe");
    fg.addColorStop(0.7, "#a855f7");
    fg.addColorStop(1, "#6b21a8");
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x + 14 * s, y - h + 10 * s);
    ctx.lineTo(x + 10 * s, y);
    ctx.lineTo(x - 10 * s, y);
    ctx.lineTo(x - 14 * s, y - h + 10 * s);
    ctx.closePath();
    ctx.fillStyle = fg;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 1.8 * s;
    ctx.stroke();
    // runes / glow bands
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 3; i++) {
      const yy = y - h * (0.25 + i * 0.22);
      ctx.beginPath();
      ctx.moveTo(x - 9 * s, yy);
      ctx.lineTo(x + 9 * s, yy);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.beginPath();
    ctx.arc(x, y - h * 0.72, 3.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlayer(vw, vh) {
    const laneF = player.displayLane;
    const lane0 = Math.floor(laneF);
    const lane1 = Math.min(LANES - 1, lane0 + 1);
    const frac = laneF - lane0;
    const z = 0.78;
    const a = project(lane0, z, vw, vh);
    const b = project(lane1, z, vw, vh);
    let x = a.x + (b.x - a.x) * frac;
    let y = a.y + (b.y - a.y) * frac;
    const scale = a.scale + (b.scale - a.scale) * frac;

    // invulnerability aura (drawn under cow)
    if (isInvulnerable()) {
      const pulse = 0.65 + 0.35 * Math.sin(animTime * 10);
      const ag = ctx.createRadialGradient(x, y - 20 * scale, 4, x, y - 10 * scale, 48 * scale);
      ag.addColorStop(0, "rgba(255,240,150," + (0.55 * pulse) + ")");
      ag.addColorStop(0.45, "rgba(255,180,40," + (0.28 * pulse) + ")");
      ag.addColorStop(1, "rgba(255,200,60,0)");
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(x, y - 12 * scale, 46 * scale, 0, Math.PI * 2);
      ctx.fill();
      // shield ring
      ctx.strokeStyle = "rgba(255,230,120," + (0.7 * pulse) + ")";
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.arc(x, y - 14 * scale, 34 * scale, 0, Math.PI * 2);
      ctx.stroke();
    }

    let jumpY = 0;
    let stretch = 1;
    if (player.jumping) {
      const t = player.jumpT / JUMP_DURATION;
      jumpY = Math.sin(Math.PI * t) * JUMP_HEIGHT * scale;
      stretch = 1 + Math.sin(Math.PI * t) * 0.12;
    }

    // ground shadow (shrinks in air)
    const sh = player.jumping ? 0.45 : player.sliding ? 0.7 : 1;
    ctx.fillStyle = mode === "space" ? "rgba(180,120,220,0.32)" : "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(x, y + 4, 24 * scale * sh, 9 * scale * sh, 0, 0, Math.PI * 2);
    ctx.fill();

    // landing dust ring
    if (landDustT > 0) {
      const lt = 1 - landDustT / 0.28;
      ctx.globalAlpha = (1 - lt) * 0.55;
      ctx.strokeStyle = mode === "space" ? "#f9a8d4" : "#c4a882";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x, y + 2, (18 + lt * 28) * scale, (6 + lt * 10) * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    const py = y - jumpY;
    // Punchy run cycle: stronger bob, opposite arm/leg drive, forward lean.
    const stride = Math.sin(runPhase * 2.4);
    const strideTri = Math.asin(Math.max(-1, Math.min(1, Math.sin(runPhase * 2.4)))) / (Math.PI / 2);
    const bob = player.jumping || player.sliding ? 0 : Math.abs(stride) * 5.5 * scale;
    const lean =
      (player.lane - player.displayLane) * -12 +
      (player.jumping ? -8 : player.sliding ? 18 : 7 + stride * 4);
    const legSwing = player.jumping ? 0.55 : player.sliding ? 0 : strideTri * 1.35;
    const armSwing = player.jumping ? -0.4 : player.sliding ? 0.2 : -strideTri * 1.35;

    ctx.save();
    ctx.translate(x, py + bob + (player.sliding ? 10 * scale : 0));
    ctx.scale(1 / Math.sqrt(stretch), stretch * (player.sliding ? 0.72 : 1));
    ctx.rotate((lean * Math.PI) / 180);

    const body = mode === "space" ? "#d4899a" : mode === "chill" ? "#c9a07a" : "#c47a2c";
    const bodyHi = mode === "space" ? "#e8a0b0" : mode === "chill" ? "#e0c4a0" : "#d4893a";
    const limb = mode === "space" ? "#9a6bb5" : mode === "chill" ? "#7a6a55" : "#5c3a1e";

    // HARD-CUT slide pose (no blend with run cycle)
    if (player.sliding) {
      ctx.strokeStyle = limb;
      ctx.lineWidth = 5 * scale;
      ctx.lineCap = "round";
      // tucked legs forward
      ctx.beginPath();
      ctx.moveTo(-8 * scale, 4 * scale);
      ctx.lineTo(18 * scale, 10 * scale);
      ctx.lineTo(28 * scale, 14 * scale);
      ctx.moveTo(6 * scale, 6 * scale);
      ctx.lineTo(22 * scale, 16 * scale);
      ctx.stroke();
      ctx.fillStyle = "#2a1810";
      ctx.beginPath();
      ctx.ellipse(28 * scale, 14 * scale, 5 * scale, 2.5 * scale, 0.2, 0, Math.PI * 2);
      ctx.ellipse(22 * scale, 16 * scale, 5 * scale, 2.5 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // body low / long
      const bodyG = ctx.createRadialGradient(-4 * scale, -6 * scale, 3, 0, 0, 26 * scale);
      bodyG.addColorStop(0, bodyHi);
      bodyG.addColorStop(1, body);
      ctx.fillStyle = bodyG;
      ctx.beginPath();
      ctx.ellipse(2 * scale, -2 * scale, 28 * scale, 16 * scale, 0.15, 0, Math.PI * 2);
      ctx.fill();
      // head tucked
      ctx.fillStyle = bodyHi;
      ctx.beginPath();
      ctx.ellipse(22 * scale, -14 * scale, 13 * scale, 11 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1008";
      ctx.beginPath();
      ctx.arc(26 * scale, -15 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // legs with joints (run)
    ctx.strokeStyle = limb;
    ctx.lineWidth = 5.5 * scale;
    ctx.lineCap = "round";
    const hipY = 8 * scale;
    // left
    const lx1 = -9 * scale;
    const lx2 = -9 * scale - legSwing * 16 * scale;
    const ly2 = 16 * scale + Math.abs(legSwing) * 2 * scale;
    const lx3 = lx2 - legSwing * 9 * scale;
    const ly3 = 30 * scale - Math.max(0, legSwing) * 4 * scale;
    ctx.beginPath();
    ctx.moveTo(lx1, hipY);
    ctx.lineTo(lx2, ly2);
    ctx.lineTo(lx3, ly3);
    ctx.stroke();
    // right
    const rx1 = 9 * scale;
    const rx2 = 9 * scale + legSwing * 16 * scale;
    const ry2 = 16 * scale + Math.abs(legSwing) * 2 * scale;
    const rx3 = rx2 + legSwing * 9 * scale;
    const ry3 = 30 * scale - Math.max(0, -legSwing) * 4 * scale;
    ctx.beginPath();
    ctx.moveTo(rx1, hipY);
    ctx.lineTo(rx2, ry2);
    ctx.lineTo(rx3, ry3);
    ctx.stroke();
    // hooves
    ctx.fillStyle = "#2a1810";
    ctx.beginPath();
    ctx.ellipse(lx3, ly3 + 2 * scale, 5 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(rx3, ry3 + 2 * scale, 5 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // arms (counter to legs, bigger pump)
    ctx.strokeStyle = limb;
    ctx.lineWidth = 4.2 * scale;
    ctx.beginPath();
    ctx.moveTo(-16 * scale, -8 * scale);
    ctx.lineTo(-16 * scale - armSwing * 16 * scale, 4 * scale + Math.abs(armSwing) * 6 * scale);
    ctx.moveTo(16 * scale, -8 * scale);
    ctx.lineTo(16 * scale + armSwing * 16 * scale, 4 * scale + Math.abs(armSwing) * 6 * scale);
    ctx.stroke();

    // body
    const bodyG = ctx.createRadialGradient(-6 * scale, -14 * scale, 4, 0, -6 * scale, 28 * scale);
    bodyG.addColorStop(0, bodyHi);
    bodyG.addColorStop(1, body);
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    ctx.ellipse(0, -6 * scale, 23 * scale, 27 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // belly patch
    ctx.fillStyle = mode === "space" ? "rgba(255,220,230,0.55)" : "rgba(240,210,160,0.55)";
    ctx.beginPath();
    ctx.ellipse(0, 2 * scale, 12 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // tail wag
    ctx.strokeStyle = limb;
    ctx.lineWidth = 3.5 * scale;
    const wag = Math.sin(runPhase * 3.6) * 14 * scale;
    ctx.beginPath();
    ctx.moveTo(18 * scale, 0);
    ctx.quadraticCurveTo(28 * scale + wag, -8 * scale, 32 * scale + wag * 0.5, 6 * scale);
    ctx.stroke();

    // head
    ctx.fillStyle = bodyHi;
    ctx.beginPath();
    ctx.ellipse(0, -36 * scale, 17 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // horns
    ctx.strokeStyle = mode === "space" ? "#f5e6ff" : "#eee8d5";
    ctx.lineWidth = 4.2 * scale;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-10 * scale, -44 * scale);
    ctx.quadraticCurveTo(-24 * scale, -54 * scale, -18 * scale, -62 * scale);
    ctx.moveTo(10 * scale, -44 * scale);
    ctx.quadraticCurveTo(24 * scale, -54 * scale, 18 * scale, -62 * scale);
    ctx.stroke();

    // ears
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(-14 * scale, -40 * scale, 5 * scale, 7 * scale, -0.4, 0, Math.PI * 2);
    ctx.ellipse(14 * scale, -40 * scale, 5 * scale, 7 * scale, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // eyes + shine
    ctx.fillStyle = "#1a1008";
    ctx.beginPath();
    ctx.arc(-5.5 * scale, -38 * scale, 2.4 * scale, 0, Math.PI * 2);
    ctx.arc(5.5 * scale, -38 * scale, 2.4 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(-4.5 * scale, -39 * scale, 0.9 * scale, 0, Math.PI * 2);
    ctx.arc(6.5 * scale, -39 * scale, 0.9 * scale, 0, Math.PI * 2);
    ctx.fill();

    // snout
    ctx.fillStyle = mode === "space" ? "#ffd0e0" : "#f0c8a0";
    ctx.beginPath();
    ctx.ellipse(0, -28 * scale, 9 * scale, 5.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5c3a1e";
    ctx.beginPath();
    ctx.arc(-3 * scale, -28 * scale, 1.2 * scale, 0, Math.PI * 2);
    ctx.arc(3 * scale, -28 * scale, 1.2 * scale, 0, Math.PI * 2);
    ctx.fill();

    if (mode === "space") {
      ctx.fillStyle = "rgba(255,140,180,0.55)";
      ctx.beginPath();
      ctx.ellipse(-11 * scale, -32 * scale, 4.5 * scale, 2.8 * scale, 0, 0, Math.PI * 2);
      ctx.ellipse(11 * scale, -32 * scale, 4.5 * scale, 2.8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawBombs(vw, vh) {
    for (const b of bombs) {
      const p = project(b.lane, Math.max(0, b.z), vw, vh);
      const r = 18 * p.scale;
      // glow trail
      const glow = ctx.createRadialGradient(p.x, p.y - 10 * p.scale, 0, p.x, p.y - 10 * p.scale, r * 2.4);
      glow.addColorStop(0, mode === "space" ? "rgba(240,170,255,0.65)" : "rgba(255,140,40,0.65)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 10 * p.scale, r * 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = mode === "space" ? "#6b21a8" : "#222";
      ctx.beginPath();
      ctx.arc(p.x, p.y - 10 * p.scale, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = mode === "space" ? "#f0abfc" : "#ff4444";
      ctx.beginPath();
      ctx.arc(p.x, p.y - 10 * p.scale, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = mode === "space" ? "#fda4af" : "#ffaa00";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(p.x + r * 0.6, p.y - 10 * p.scale - r);
      ctx.lineTo(p.x + r, p.y - 10 * p.scale - r * 1.6);
      ctx.stroke();

      // 💥 label so the boom is obvious on phone
      ctx.font = "bold " + Math.round(22 * p.scale) + "px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = 0.95;
      ctx.fillText("💥", p.x, p.y - 10 * p.scale);
      ctx.globalAlpha = 1;
    }
  }

  function drawBlasts(vw, vh) {
    for (const bl of blasts) {
      const p = project(bl.lane, Math.max(0, Math.min(1, bl.z)), vw, vh);
      const t = 1 - bl.life / bl.maxLife;
      const rings = bl.rings || 2;
      const cx = p.x;
      const cy = p.y - 10 * p.scale;
      // fireball core
      const coreR = (18 + t * 40) * p.scale * (bl.life / bl.maxLife + 0.3);
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      if (mode === "space") {
        core.addColorStop(0, "rgba(255,255,255,0.95)");
        core.addColorStop(0.25, "rgba(240,171,252,0.85)");
        core.addColorStop(0.6, "rgba(232,121,249,0.4)");
        core.addColorStop(1, "rgba(232,121,249,0)");
      } else {
        core.addColorStop(0, "rgba(255,255,220,0.95)");
        core.addColorStop(0.2, "rgba(255,200,60,0.9)");
        core.addColorStop(0.55, "rgba(255,80,0,0.45)");
        core.addColorStop(1, "rgba(255,40,0,0)");
      }
      ctx.globalAlpha = Math.max(0, bl.life / bl.maxLife);
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();
      // expanding rings
      for (let i = 0; i < rings; i++) {
        const rt = Math.min(1, t * 1.15 - i * 0.12);
        if (rt <= 0) continue;
        const rad = (22 + rt * (90 + i * 28)) * p.scale;
        ctx.globalAlpha = Math.max(0, (1 - rt) * 0.9);
        ctx.strokeStyle = mode === "space" ? "#f5d0ff" : i % 2 === 0 ? "#ffcc66" : "#ff6a00";
        ctx.lineWidth = (5 - i) * p.scale * (1 - rt * 0.4);
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.stroke();
      }
      // 💥 glyph pulsing in the blast
      if (t < 0.55) {
        ctx.globalAlpha = (1 - t / 0.55) * 0.95;
        const sz = Math.round((34 + t * 40) * p.scale);
        ctx.font = "bold " + sz + "px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("💥", cx, cy);
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawParticles() {
    for (const p of particles) {
      const lifeA = Math.max(0, Math.min(1, p.life / (p.maxLife || 0.5)));
      ctx.globalAlpha = lifeA * (p.kind === "smoke" ? 0.45 : 0.95);
      ctx.fillStyle = p.color;
      const r = p.r || 4;
      if (p.kind === "shard") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);
        ctx.fillRect(-r, -r * 0.4, r * 2, r * 0.8);
        ctx.restore();
      } else if (p.kind === "fireball") {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, "#fff8e0");
        g.addColorStop(0.4, p.color);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === "smoke") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawFloatTexts() {
    for (const ft of floatTexts) {
      const a = Math.max(0, ft.life / ft.maxLife);
      ctx.globalAlpha = a;
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.globalAlpha = 1;
    }
  }

  function drawBombFlash(vw, vh) {
    if (flashT <= 0) return;
    const t = flashT / 0.48;
    const a = Math.min(1, t) * 0.62;
    // full-screen wash
    ctx.fillStyle =
      mode === "space"
        ? "rgba(255,180,240," + a + ")"
        : mode === "plant"
          ? "rgba(255,120,100," + a + ")"
          : "rgba(255,200,60," + a + ")";
    ctx.fillRect(0, 0, vw, vh);
    // radial burst from cow area
    const cx = vw * 0.5;
    const cy = vh * 0.62;
    const rad = Math.max(vw, vh) * (0.35 + (1 - t) * 0.55);
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    rg.addColorStop(0, mode === "space" ? "rgba(255,255,255,0.75)" : "rgba(255,255,220,0.8)");
    rg.addColorStop(0.35, mode === "space" ? "rgba(240,171,252,0.35)" : "rgba(255,140,0,0.35)");
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
    // big 💥 hold
    const pulse = 1 + Math.sin((1 - t) * Math.PI * 4) * 0.08;
    ctx.globalAlpha = Math.min(1, flashT / 0.28);
    ctx.font = "bold " + Math.round(64 * pulse) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("💥", cx, cy);
    ctx.globalAlpha = 1;
  }

  function drawTitleHint(vw, vh) {
    if (running || dead) return;
    ctx.fillStyle =
      mode === "space"
        ? "rgba(255,220,245,0.45)"
        : mode === "chill"
          ? "rgba(255,240,220,0.5)"
          : mode === "plant"
            ? "rgba(220,255,200,0.55)"
            : "rgba(255,255,255,0.35)";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      mode === "chill"
        ? "慢慢跑酷 · 积分看时长 😎"
        : mode === "plant"
          ? "植物跑酷 · 捡植物打僵尸 🌻"
          : "勇敢牛牛，不怕困难",
      vw / 2,
      vh * 0.14
    );
  }

  function render() {
    const { w: vw, h: vh } = viewSize();
    ctx.clearRect(0, 0, vw, vh);
    ctx.save();
    if (shakeT > 0) {
      const mag = 14 * (shakeT / 0.58);
      ctx.translate((Math.random() - 0.5) * 2 * mag, (Math.random() - 0.5) * 2 * mag);
    }
    if (mode === "space") {
      drawSkySpace(vw, vh);
      drawRoadSpace(vw, vh);
    } else if (mode === "chill") {
      drawSkyChill(vw, vh);
      drawRoadChill(vw, vh);
    } else if (mode === "plant") {
      drawSkyPlant(vw, vh);
      drawRoadPlant(vw, vh);
    } else {
      drawSkyEarth(vw, vh);
      drawRoadEarth(vw, vh);
    }

    const sorted = entities.slice().sort((a, b) => a.z - b.z);
    for (const e of sorted) drawEntity(e, vw, vh);
    drawBlasts(vw, vh);
    drawBombs(vw, vh);
    drawPlantShots(vw, vh);
    drawPlayer(vw, vh);
    drawActivePlantHud(vw, vh);
    drawParticles();
    drawFloatTexts();
    drawBombFlash(vw, vh);
    if (isInvulnerable()) {
      const pulse = 0.08 + 0.06 * (0.5 + 0.5 * Math.sin(animTime * 8));
      ctx.fillStyle = "rgba(255, 200, 60, " + pulse + ")";
      ctx.fillRect(0, 0, vw, vh);
    }
    if (deathFx) {
      ctx.fillStyle = "rgba(180,20,20," + (0.15 + 0.2 * Math.min(1, deathT)) + ")";
      ctx.fillRect(0, 0, vw, vh);
    }
    drawTitleHint(vw, vh);
    ctx.restore();
  }

  function loop(ts) {
    if (!lastTs) lastTs = ts;
    let dt = (ts - lastTs) / 1000;
    lastTs = ts;
    if (dt > 0.05) dt = 0.05;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function bindPress(el, fn) {
    if (!el) return;
    const handler = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      fn();
    };
    el.addEventListener("pointerdown", handler, { passive: false });
  }

  bindPress(btnLeft, () => changeLane(-1));
  bindPress(btnRight, () => changeLane(1));
  bindPress(btnJump, jump);
  bindPress(btnBomb, fireBomb);
  bindPress(btnInvuln, activateInvuln);

  /** Pick a mode card. Re-tapping already-selected plant starts the run (phone-friendly). */
  let lastModePickAt = 0;
  function onModeCardPick(modeId) {
    if (!modeId) return;
    const now = performance.now();
    // Suppress duplicate click that follows pointerdown on the same gesture.
    if (now - lastModePickAt < 320) return;
    lastModePickAt = now;
    if (modeId === "plant" && mode === "plant") {
      resetGame();
      return;
    }
    setMode(modeId);
  }

  if (modePick) {
    modePick.querySelectorAll(".mode-card").forEach((btn) => {
      const handler = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        onModeCardPick(btn.getAttribute("data-mode"));
      };
      // WeChat WebView + nested scroll often eats `click`; match lane buttons with pointerdown.
      btn.addEventListener("pointerdown", handler, { passive: false });
      btn.addEventListener("click", handler);
    });
  }

  let lastStartAt = 0;
  function startOnce() {
    const now = performance.now();
    if (now - lastStartAt < 400) return;
    lastStartAt = now;
    resetGame();
  }
  bindPress(btnStart, startOnce);
  bindPress(btnRetry, startOnce);
  btnStart.addEventListener("click", (ev) => {
    ev.preventDefault();
    startOnce();
  });
  btnRetry.addEventListener("click", (ev) => {
    ev.preventDefault();
    startOnce();
  });
  if (btnChangeMode) {
    btnChangeMode.addEventListener("click", showTitle);
  }

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartT = 0;
  let swipeUsed = false;
  let swipeOriginX = 0;
  let swipeOriginY = 0;
  let activePointerId = null;

  function onSwipeAxis(dx, dy) {
    if (!running || dead || swipeUsed) return false;
    if (Math.abs(dx) >= SWIPE_AXIS_MIN && Math.abs(dx) > Math.abs(dy) * 0.85) {
      changeLane(dx > 0 ? 1 : -1);
      // One gesture → one lane change; lock until pointerup (avoids double-lane swipe).
      swipeUsed = true;
      touchStartT = 0; // consumed — no tap-jump on release
      return "lane";
    }
    if (dy <= -SWIPE_AXIS_MIN && Math.abs(dy) > Math.abs(dx) * 0.85) {
      jump();
      swipeUsed = true; // one jump per gesture
      touchStartT = 0;
      return "jump";
    }
    if (dy >= SWIPE_AXIS_MIN && Math.abs(dy) > Math.abs(dx) * 0.85) {
      slide();
      swipeUsed = true;
      touchStartT = 0;
      return "slide";
    }
    return false;
  }

  canvas.addEventListener(
    "pointerdown",
    (ev) => {
      if (ev.pointerType === "mouse" && ev.button !== 0) return;
      touchStartX = ev.clientX;
      touchStartY = ev.clientY;
      swipeOriginX = touchStartX;
      swipeOriginY = touchStartY;
      touchStartT = performance.now();
      swipeUsed = false;
      activePointerId = ev.pointerId;
      try {
        canvas.setPointerCapture(ev.pointerId);
      } catch (_) {}
      if (ev.cancelable) ev.preventDefault();
    },
    { passive: false }
  );

  canvas.addEventListener(
    "pointermove",
    (ev) => {
      if (activePointerId !== null && ev.pointerId !== activePointerId) return;
      if (!running || dead) return;
      // Fire as soon as threshold is crossed — do not wait for pointerup.
      const dx = ev.clientX - swipeOriginX;
      const dy = ev.clientY - swipeOriginY;
      onSwipeAxis(dx, dy);
      if (ev.cancelable) ev.preventDefault();
    },
    { passive: false }
  );

  function endPointer(ev) {
    if (activePointerId !== null && ev.pointerId !== activePointerId) return;
    const dx = ev.clientX - touchStartX;
    const dy = ev.clientY - touchStartY;
    const dtMs = touchStartT ? performance.now() - touchStartT : 9999;
    if (running && !dead && touchStartT && dtMs < SWIPE_TAP_MS && Math.hypot(dx, dy) < SWIPE_TAP_MAX) {
      const rect = canvas.getBoundingClientRect();
      if (ev.clientY - rect.top < rect.height * 0.55) jump();
    }
    activePointerId = null;
    try {
      canvas.releasePointerCapture(ev.pointerId);
    } catch (_) {}
  }

  canvas.addEventListener("pointerup", endPointer, { passive: false });
  canvas.addEventListener("pointercancel", endPointer, { passive: false });

  // Extra touch listeners for WeChat WebView scroll cancellation.
  canvas.addEventListener(
    "touchstart",
    (ev) => {
      if (ev.cancelable) ev.preventDefault();
    },
    { passive: false }
  );
  canvas.addEventListener(
    "touchmove",
    (ev) => {
      if (ev.cancelable) ev.preventDefault();
    },
    { passive: false }
  );

  window.addEventListener("keydown", (ev) => {
    if (ev.repeat) return;
    switch (ev.key) {
      case "ArrowLeft":
      case "a":
      case "A":
        changeLane(-1);
        break;
      case "ArrowRight":
      case "d":
      case "D":
        changeLane(1);
        break;
      case " ":
      case "ArrowUp":
      case "w":
      case "W":
        ev.preventDefault();
        jump();
        break;
      case "ArrowDown":
      case "s":
      case "S":
        ev.preventDefault();
        slide();
        break;
      case "b":
      case "B":
        fireBomb();
        break;
      case "i":
      case "I":
      case "v":
      case "V":
      case "q":
      case "Q":
        activateInvuln();
        break;
      case "Enter":
        if (!running) resetGame();
        break;
      case "4":
        if (!running) setMode("earth");
        break;
      case "7":
        if (!running) setMode("space");
        break;
      case "5":
        if (!running) setMode("chill");
        break;
      case "9":
        if (!running) setMode("plant");
        break;
      default:
        break;
    }
  });

  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => setTimeout(resize, 120));

  if (btnWechat) btnWechat.addEventListener("click", beginWeChatLogin);
  if (btnLogout) btnLogout.addEventListener("click", logout);
  if (btnLoginConfirm) {
    btnLoginConfirm.addEventListener("click", () => confirmMockLogin(false));
  }
  if (btnLoginGuest) {
    btnLoginGuest.addEventListener("click", () => confirmMockLogin(true));
  }
  if (btnLoginCancel) btnLoginCancel.addEventListener("click", closeLoginModal);
  if (loginModal) {
    loginModal.addEventListener("click", (ev) => {
      if (ev.target === loginModal) closeLoginModal();
    });
  }
  if (loginNick) {
    loginNick.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") confirmMockLogin(false);
    });
  }

  currentUser = loadUser();
  window.__RB_LB = loadLb();
  renderPrizeBanners();
  renderAuth();
  renderLeaderboards();

  setMode("earth");
  resize();
  requestAnimationFrame(loop);
})();
