(function () {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const appEl = document.getElementById("app");
  const hudDist = document.getElementById("hud-dist");
  const hudCoins = document.getElementById("hud-coins");
  const hudScore = document.getElementById("hud-score");
  const overlay = document.getElementById("overlay");
  const overEl = document.getElementById("over");
  const btnStart = document.getElementById("btn-start");
  const btnRetry = document.getElementById("btn-retry");
  const btnChangeMode = document.getElementById("btn-change-mode");
  const btnLeft = document.getElementById("btn-left");
  const btnRight = document.getElementById("btn-right");
  const btnJump = document.getElementById("btn-jump");
  const btnBomb = document.getElementById("btn-bomb");
  const modePick = document.getElementById("mode-pick");
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
  const LANE_X = [0.22, 0.5, 0.78];
  const BOMB_COOLDOWN = 1.6;
  /** Longer than hit-zone dwell at start speed so a well-timed jump clears. */
  const JUMP_DURATION = 0.82;
  const JUMP_HEIGHT = 125;
  const JUMP_BUFFER = 0.14;
  const JUMP_LAND_GRACE = 0.12;
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
  /** Lane visual follow: higher = snappier (was ~14). */
  const LANE_LERP = 30;
  /** Immediate snap fraction on lane change so first frame moves. */
  const LANE_SNAP = 0.58;
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

  /** @type {"earth"|"space"} */
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
  };

  /** @type {Array<{lane:number,z:number,kind:string,alive:boolean,variant?:string,tall?:boolean}>} */
  let entities = [];
  /** @type {Array<{lane:number,z:number,life:number,blast:number}>} */
  let bombs = [];
  /** @type {Array<{x:number,y:number,vx:number,vy:number,life:number,color:string,r?:number}>} */
  let particles = [];
  /** @type {Array<{lane:number,z:number,life:number,maxLife:number}>} */
  let blasts = [];
  let shakeT = 0;
  let flashT = 0;

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
    return { byScore: [], byPlayTime: [] };
  }

  function loadLb() {
    try {
      const raw = localStorage.getItem(LS_LB);
      if (!raw) return emptyLb();
      const data = JSON.parse(raw);
      return {
        byScore: Array.isArray(data.byScore) ? data.byScore : [],
        byPlayTime: Array.isArray(data.byPlayTime) ? data.byPlayTime : [],
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
    };
    const lb = loadLb();
    lb.byScore = upsertRecord(lb.byScore, entry, "score", LB_MAX);
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
    const t = lb.byPlayTime.find((r) => r.id === currentUser.id);
    return {
      score: s ? s.score : 0,
      playTime: t ? t.playTime : 0,
    };
  }

  function renderLeaderboards() {
    const lb = loadLb();
    window.__RB_LB = lb;
    renderLbList(lbScoreEl, lb.byScore, "score", (v) => String(v));
    renderLbList(lbTimeEl, lb.byPlayTime, "playTime", formatTime);
    if (lbMineEl) {
      const best = myBest();
      if (currentUser && best) {
        lbMineEl.textContent =
          "我的最佳：得分 " + best.score + " · 最长 " + formatTime(best.playTime);
        lbMineEl.classList.remove("hidden");
      } else {
        lbMineEl.textContent = "登录后记录你的得分与游玩时长";
        lbMineEl.classList.remove("hidden");
      }
    }
    if (overLbEl) {
      const top = lb.byScore.slice(0, 3);
      overLbEl.innerHTML = top.length
        ? "高分榜 " +
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
    if (next !== "earth" && next !== "space") return;
    mode = next;
    appEl.setAttribute("data-theme", mode);
    if (themeMeta) {
      themeMeta.setAttribute("content", mode === "space" ? "#6b4a9e" : "#1a8cff");
    }
    if (modePick) {
      modePick.querySelectorAll(".mode-card").forEach((btn) => {
        const on = btn.getAttribute("data-mode") === mode;
        btn.classList.toggle("selected", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
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

  /** Perspective: z in [0,1] where 0 = far (top), 1 = near (bottom) */
  function project(lane, z, vw, vh) {
    const horizonY = vh * 0.18;
    const nearY = vh * 0.78;
    const y = horizonY + (nearY - horizonY) * z;
    const roadHalfFar = vw * 0.08;
    const roadHalfNear = vw * 0.42;
    const half = roadHalfFar + (roadHalfNear - roadHalfFar) * z;
    const cx = vw * 0.5;
    const lx = LANE_X[lane];
    const offset = (lx - 0.5) * 2;
    const x = cx + offset * half;
    const scale = 0.35 + 0.65 * z;
    return { x, y, scale, half };
  }

  function roadEdges(z, vw, vh) {
    const horizonY = vh * 0.18;
    const nearY = vh * 0.78;
    const y = horizonY + (nearY - horizonY) * z;
    const roadHalfFar = vw * 0.08;
    const roadHalfNear = vw * 0.42;
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
    entities = [];
    bombs = [];
    particles = [];
    blasts = [];
    shakeT = 0;
    flashT = 0;
    overlay.classList.add("hidden");
    overlay.classList.remove("show");
    overEl.classList.add("hidden");
    btnBomb.disabled = false;
    btnBomb.classList.remove("cooling");
    updateHud();
  }

  function showTitle() {
    running = false;
    dead = false;
    overEl.classList.add("hidden");
    overlay.classList.remove("hidden");
    overlay.classList.add("show");
  }

  function updateHud() {
    score = Math.floor(distance) + coins * 10;
    hudDist.textContent = String(Math.floor(distance));
    hudCoins.textContent = String(coins);
    hudScore.textContent = String(score);
  }

  function changeLane(dir) {
    if (!running || dead) return;
    const next = Math.max(0, Math.min(LANES - 1, player.lane + dir));
    if (next === player.lane) return;
    player.lane = next;
    // Immediate visual response, then LANE_LERP eases the rest.
    player.displayLane += (player.lane - player.displayLane) * LANE_SNAP;
  }

  function jump() {
    if (!running || dead) return;
    if (player.jumping) {
      // Queue a follow-up if pressed near landing.
      if (player.jumpT >= JUMP_DURATION - JUMP_BUFFER) {
        player.jumpBuffered = JUMP_BUFFER;
      }
      return;
    }
    player.jumping = true;
    player.jumpT = 0;
    player.jumpBuffered = 0;
    player.landGrace = 0;
  }

  function isJumpClearing() {
    return player.jumping || player.landGrace > 0;
  }

  function bombColors() {
    if (mode === "space") {
      return { core: "#f0abfc", hot: "#e879f9", spark: "#fff0ff", flash: "rgba(255,180,240,0.55)" };
    }
    return { core: "#ff8800", hot: "#ff4400", spark: "#ffe566", flash: "rgba(255,200,80,0.5)" };
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
      burst(e.lane, e.z, cols.hot, big ? 22 : 14);
      spawnBlast(e.lane, e.z, 0.35);
      n += 1;
    }
    return n;
  }

  function spawnBlast(lane, z, life) {
    blasts.push({ lane, z, life, maxLife: life });
  }

  function fireBomb() {
    if (!running || dead) return;
    if (bombCd > 0) return;
    bombCd = BOMB_COOLDOWN;
    const lane = player.lane;
    // Projectile travels up the current lane and keeps clearing along the way.
    bombs.push({ lane, z: 0.78, life: 0.75, blast: 0.16 });
    if (btnBomb) {
      btnBomb.disabled = true;
      btnBomb.classList.add("cooling");
    }
    shakeT = Math.max(shakeT, 0.32);
    flashT = Math.max(flashT, 0.22);
    const cols = bombColors();
    // Always-visible boom at the cow even if no obstacle is in range yet.
    burst(lane, 0.78, cols.core, 36);
    burst(lane, 0.78, cols.spark, 18);
    spawnBlast(lane, 0.78, 0.45);
    // Clear whole current lane ahead (docs: 沿当前道上行清障). Coins stay.
    clearLaneObstacles(lane, -0.08, 1.08, true);
  }

  function burst(lane, z, color, count) {
    const n = count || 12;
    const { w, h } = viewSize();
    const p = project(lane, Math.max(0, Math.min(1, z)), w, h);
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const spd = 90 + Math.random() * 220;
      particles.push({
        x: p.x,
        y: p.y - 12 * p.scale,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 40,
        life: 0.45 + Math.random() * 0.4,
        color,
        r: 3 + Math.random() * 5,
      });
    }
  }

  function pickObstacleVariant() {
    if (mode === "space") {
      const r = Math.random();
      if (r < 0.45) return { variant: "crystal", tall: false };
      if (r < 0.75) return { variant: "crystal_cluster", tall: false };
      return { variant: "obelisk", tall: true };
    }
    const r = Math.random();
    // Weighted toward jumpable props; trains are rarer but look cool.
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
    dead = true;
    running = false;
    updateHud();
    document.getElementById("over-dist").textContent = String(Math.floor(distance));
    document.getElementById("over-coins").textContent = String(coins);
    document.getElementById("over-score").textContent = String(score);
    if (overPlaytimeEl) overPlaytimeEl.textContent = formatTime(sessionPlaySec);
    recordRun(score, sessionPlaySec);
    renderLeaderboards();
    overEl.classList.remove("hidden");
  }

  function update(dt) {
    animTime += dt;
    if (!running) return;

    speed = Math.min(SPEED_MAX, SPEED_START + distance * SPEED_RAMP);
    const zSpeed = (speed / 420) * 0.50;
    roadScroll += speed * dt;
    distance += (speed * dt) / 18;
    runPhase += dt * (speed / 80);
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
        if (player.jumpBuffered > 0) {
          player.jumping = true;
          player.jumpT = 0;
          player.jumpBuffered = 0;
          player.landGrace = 0;
        }
      }
    } else if (player.jumpBuffered > 0) {
      player.jumping = true;
      player.jumpT = 0;
      player.jumpBuffered = 0;
      player.landGrace = 0;
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

    if (shakeT > 0) shakeT = Math.max(0, shakeT - dt);
    if (flashT > 0) flashT = Math.max(0, flashT - dt);

    for (const e of entities) {
      if (!e.alive) continue;
      e.z += zSpeed * dt;
    }

    for (const b of bombs) {
      b.z -= zSpeed * 2.2 * dt;
      b.life -= dt;
      // Keep clearing as the bomb flies up the lane (late/far obstacles).
      clearLaneObstacles(b.lane, b.z - b.blast, b.z + b.blast * 1.4, false);
    }
    bombs = bombs.filter((b) => b.life > 0 && b.z > -0.15);

    for (const bl of blasts) bl.life -= dt;
    blasts = blasts.filter((bl) => bl.life > 0);

    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 280 * dt;
      p.life -= dt;
    }
    particles = particles.filter((p) => p.life > 0);

    for (const e of entities) {
      if (!e.alive) continue;
      if (e.z < HIT_Z_MIN || e.z > HIT_Z_MAX) continue;
      if (e.lane !== player.lane) continue;
      if (e.kind === "coin") {
        e.alive = false;
        coins += 1;
        burst(e.lane, e.z, mode === "space" ? "#ffc0ef" : "#ffd700");
      } else if (e.kind === "obstacle") {
        if (!isJumpClearing()) {
          gameOver();
          return;
        }
      }
    }

    entities = entities.filter((e) => e.alive && e.z < 1.15);

    spawnAcc -= dt;
    coinAcc -= dt;
    const spawnInterval = Math.max(SPAWN_MIN, SPAWN_BASE - distance / SPAWN_DIST_DIV);
    if (spawnAcc <= 0) {
      spawnObstacle();
      spawnAcc = spawnInterval * (0.9 + Math.random() * 0.55);
    }
    if (coinAcc <= 0) {
      spawnCoinLine();
      coinAcc = 1.7 + Math.random() * 1.4;
    }

    updateHud();
  }

  function drawSkyEarth(vw, vh) {
    const g = ctx.createLinearGradient(0, 0, 0, vh * 0.55);
    g.addColorStop(0, "#1a8cff");
    g.addColorStop(0.55, "#6ed0ff");
    g.addColorStop(1, "#b8ecff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, vw, vh);

    ctx.beginPath();
    ctx.fillStyle = "#ffe566";
    ctx.arc(vw * 0.82, vh * 0.12, vw * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#3cb371";
    ctx.beginPath();
    ctx.moveTo(0, vh * 0.32);
    ctx.quadraticCurveTo(vw * 0.25, vh * 0.22, vw * 0.5, vh * 0.3);
    ctx.quadraticCurveTo(vw * 0.75, vh * 0.38, vw, vh * 0.28);
    ctx.lineTo(vw, vh * 0.45);
    ctx.lineTo(0, vh * 0.45);
    ctx.fill();
    ctx.fillStyle = "#2e9e5b";
    ctx.beginPath();
    ctx.moveTo(0, vh * 0.36);
    ctx.quadraticCurveTo(vw * 0.3, vh * 0.28, vw * 0.55, vh * 0.35);
    ctx.quadraticCurveTo(vw * 0.8, vh * 0.42, vw, vh * 0.34);
    ctx.lineTo(vw, vh * 0.48);
    ctx.lineTo(0, vh * 0.48);
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
    const blobs = [
      { x: 0.2, y: 0.22, r: 0.28, c: "rgba(255,160,210,0.28)" },
      { x: 0.75, y: 0.18, r: 0.32, c: "rgba(180,140,255,0.32)" },
      { x: 0.5, y: 0.35, r: 0.24, c: "rgba(255,200,230,0.22)" },
      { x: 0.15, y: 0.45, r: 0.2, c: "rgba(160,120,255,0.18)" },
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

    ctx.fillStyle = "#4caf50";
    ctx.fillRect(0, far.y, vw, near.y - far.y + 40);

    ctx.beginPath();
    ctx.moveTo(far.left, far.y);
    ctx.lineTo(far.right, far.y);
    ctx.lineTo(near.right, near.y);
    ctx.lineTo(near.left, near.y);
    ctx.closePath();
    const rg = ctx.createLinearGradient(0, far.y, 0, near.y);
    rg.addColorStop(0, "#8b7355");
    rg.addColorStop(1, "#6b5340");
    ctx.fillStyle = rg;
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,220,0.85)";
    ctx.lineCap = "round";
    for (let lane = 0; lane < 2; lane++) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      let drawing = false;
      const dashPeriod = 0.12;
      const offset = (roadScroll / 200) % dashPeriod;
      for (let z = 0; z <= 1; z += 0.02) {
        const e = roadEdges(z, vw, vh);
        const x = e.left + (e.right - e.left) * ((lane + 1) / 3);
        const phase = (z + offset) % dashPeriod;
        const on = phase < dashPeriod * 0.45;
        if (on) {
          if (!drawing) {
            ctx.beginPath();
            ctx.moveTo(x, e.y);
            drawing = true;
          } else {
            ctx.lineTo(x, e.y);
          }
        } else if (drawing) {
          ctx.stroke();
          drawing = false;
        }
      }
      if (drawing) ctx.stroke();
    }

    ctx.strokeStyle = "#fff8dc";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(far.left, far.y);
    ctx.lineTo(near.left, near.y);
    ctx.moveTo(far.right, far.y);
    ctx.lineTo(near.right, near.y);
    ctx.stroke();
  }

  function drawRoadSpace(vw, vh) {
    const far = roadEdges(0, vw, vh);
    const near = roadEdges(1, vw, vh);

    // soft void below horizon
    const voidG = ctx.createLinearGradient(0, far.y, 0, near.y + 40);
    voidG.addColorStop(0, "rgba(60,40,100,0.35)");
    voidG.addColorStop(1, "rgba(120,70,140,0.55)");
    ctx.fillStyle = voidG;
    ctx.fillRect(0, far.y, vw, near.y - far.y + 50);

    // translucent star-lanes (three glassy ribbons)
    ctx.beginPath();
    ctx.moveTo(far.left, far.y);
    ctx.lineTo(far.right, far.y);
    ctx.lineTo(near.right, near.y);
    ctx.lineTo(near.left, near.y);
    ctx.closePath();
    const rg = ctx.createLinearGradient(0, far.y, 0, near.y);
    rg.addColorStop(0, "rgba(230,200,255,0.28)");
    rg.addColorStop(0.5, "rgba(255,190,230,0.38)");
    rg.addColorStop(1, "rgba(255,220,245,0.55)");
    ctx.fillStyle = rg;
    ctx.fill();

    // inner glow edge
    ctx.strokeStyle = "rgba(255,230,255,0.7)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(far.left, far.y);
    ctx.lineTo(near.left, near.y);
    ctx.moveTo(far.right, far.y);
    ctx.lineTo(near.right, near.y);
    ctx.stroke();

    // soft lavender lane dividers with sparkle dashes
    ctx.lineCap = "round";
    for (let lane = 0; lane < 2; lane++) {
      const dashPeriod = 0.1;
      const offset = (roadScroll / 180) % dashPeriod;
      let drawing = false;
      ctx.strokeStyle = "rgba(255,200,240,0.75)";
      ctx.lineWidth = 2;
      for (let z = 0; z <= 1; z += 0.018) {
        const e = roadEdges(z, vw, vh);
        const x = e.left + (e.right - e.left) * ((lane + 1) / 3);
        const phase = (z + offset) % dashPeriod;
        const on = phase < dashPeriod * 0.4;
        if (on) {
          if (!drawing) {
            ctx.beginPath();
            ctx.moveTo(x, e.y);
            drawing = true;
          } else {
            ctx.lineTo(x, e.y);
          }
        } else if (drawing) {
          ctx.stroke();
          drawing = false;
        }
      }
      if (drawing) ctx.stroke();
    }

    // floating petal/star dust along lanes
    for (let i = 0; i < 10; i++) {
      const z = ((i / 10) + (roadScroll / 900) % 1) % 1;
      const e = roadEdges(z, vw, vh);
      const lx = e.left + (e.right - e.left) * (0.15 + (i % 3) * 0.35);
      ctx.globalAlpha = 0.25 + 0.35 * z;
      ctx.fillStyle = i % 2 === 0 ? "#ffd0ec" : "#e0c4ff";
      ctx.beginPath();
      ctx.arc(lx, e.y, 2 + 3 * z, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
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
    const r = 12 * s;
    const y = p.y - 10 * s;
    // glow
    const g = ctx.createRadialGradient(p.x, y, 0, p.x, y, r * 2.2);
    g.addColorStop(0, space ? "rgba(255,180,230,0.55)" : "rgba(255,220,80,0.5)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, y, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
    // body
    const cg = ctx.createLinearGradient(p.x - r, y - r, p.x + r, y + r);
    if (space) {
      cg.addColorStop(0, "#ffe0f2");
      cg.addColorStop(0.45, "#ff9ed2");
      cg.addColorStop(1, "#e879f9");
    } else {
      cg.addColorStop(0, "#fff6a0");
      cg.addColorStop(0.4, "#ffd700");
      cg.addColorStop(1, "#e6a800");
    }
    ctx.beginPath();
    ctx.fillStyle = cg;
    ctx.strokeStyle = space ? "#f0abfc" : "#c48900";
    ctx.lineWidth = 2.2 * s;
    ctx.arc(p.x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // inner ring + star
    ctx.beginPath();
    ctx.strokeStyle = space ? "rgba(255,255,255,0.7)" : "rgba(255,255,200,0.85)";
    ctx.lineWidth = 1.5 * s;
    ctx.arc(p.x, y, r * 0.62, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(p.x - 3.5 * s, y - 3.5 * s, 2.4 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawEntity(e, vw, vh) {
    if (!e.alive || e.z < 0) return;
    const p = project(e.lane, Math.max(0, Math.min(1, e.z)), vw, vh);
    if (e.kind === "coin") {
      drawCoin(p, mode === "space");
      return;
    }
    if (e.kind !== "obstacle") return;
    const v = e.variant || (mode === "space" ? "crystal" : "box");
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

    let jumpY = 0;
    if (player.jumping) {
      const t = player.jumpT / JUMP_DURATION;
      jumpY = Math.sin(Math.PI * t) * JUMP_HEIGHT * scale;
    }

    ctx.fillStyle = mode === "space" ? "rgba(180,120,220,0.35)" : "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(x, y + 4, 22 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    const py = y - jumpY;
    const bob = player.jumping ? 0 : Math.sin(runPhase * 2.2) * 4 * scale;
    const lean = player.jumping ? -6 : Math.sin(runPhase) * 3;

    ctx.save();
    ctx.translate(x, py + bob);
    ctx.rotate((lean * Math.PI) / 180);

    ctx.strokeStyle = mode === "space" ? "#9a6bb5" : "#5c3a1e";
    ctx.lineWidth = 5 * scale;
    ctx.lineCap = "round";
    const legSwing = player.jumping ? 0.3 : Math.sin(runPhase * 2.4);
    ctx.beginPath();
    ctx.moveTo(-8 * scale, 10 * scale);
    ctx.lineTo(-8 * scale - legSwing * 10 * scale, 28 * scale);
    ctx.moveTo(8 * scale, 10 * scale);
    ctx.lineTo(8 * scale + legSwing * 10 * scale, 28 * scale);
    ctx.stroke();

    // body — slightly warmer blush in space mode
    ctx.fillStyle = mode === "space" ? "#d4899a" : "#c47a2c";
    ctx.beginPath();
    ctx.ellipse(0, -6 * scale, 22 * scale, 26 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = mode === "space" ? "#e8a0b0" : "#d4893a";
    ctx.beginPath();
    ctx.ellipse(0, -34 * scale, 16 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = mode === "space" ? "#f5e6ff" : "#eee8d5";
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(-10 * scale, -42 * scale);
    ctx.quadraticCurveTo(-22 * scale, -52 * scale, -16 * scale, -58 * scale);
    ctx.moveTo(10 * scale, -42 * scale);
    ctx.quadraticCurveTo(22 * scale, -52 * scale, 16 * scale, -58 * scale);
    ctx.stroke();

    ctx.fillStyle = "#1a1008";
    ctx.beginPath();
    ctx.arc(-5 * scale, -36 * scale, 2.2 * scale, 0, Math.PI * 2);
    ctx.arc(5 * scale, -36 * scale, 2.2 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = mode === "space" ? "#ffd0e0" : "#f0c8a0";
    ctx.beginPath();
    ctx.ellipse(0, -28 * scale, 8 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // tiny cheek blush in space mode
    if (mode === "space") {
      ctx.fillStyle = "rgba(255,140,180,0.55)";
      ctx.beginPath();
      ctx.ellipse(-10 * scale, -30 * scale, 4 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
      ctx.ellipse(10 * scale, -30 * scale, 4 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
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
      const rad = (20 + t * 70) * p.scale;
      ctx.globalAlpha = Math.max(0, bl.life / bl.maxLife) * 0.85;
      ctx.strokeStyle = mode === "space" ? "#f5d0ff" : "#ffcc66";
      ctx.lineWidth = 4 * p.scale * (1 - t * 0.5);
      ctx.beginPath();
      ctx.arc(p.x, p.y - 8 * p.scale, rad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = mode === "space" ? "rgba(232,121,249,0.25)" : "rgba(255,120,0,0.28)";
      ctx.beginPath();
      ctx.arc(p.x, p.y - 8 * p.scale, rad * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 2.2));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r || 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawBombFlash(vw, vh) {
    if (flashT <= 0) return;
    const a = Math.min(1, flashT / 0.22) * 0.55;
    ctx.fillStyle =
      mode === "space"
        ? "rgba(255,180,240," + a + ")"
        : "rgba(255,200,80," + a + ")";
    ctx.fillRect(0, 0, vw, vh);
    ctx.font = "bold 42px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = Math.min(1, flashT / 0.15);
    ctx.fillText("💥", vw * 0.5, vh * 0.62);
    ctx.globalAlpha = 1;
  }

  function drawTitleHint(vw, vh) {
    if (running || dead) return;
    ctx.fillStyle = mode === "space" ? "rgba(255,220,245,0.45)" : "rgba(255,255,255,0.35)";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("勇敢牛牛，不怕困难", vw / 2, vh * 0.14);
  }

  function render() {
    const { w: vw, h: vh } = viewSize();
    ctx.clearRect(0, 0, vw, vh);
    ctx.save();
    if (shakeT > 0) {
      const mag = 6 * (shakeT / 0.32);
      ctx.translate((Math.random() - 0.5) * 2 * mag, (Math.random() - 0.5) * 2 * mag);
    }
    if (mode === "space") {
      drawSkySpace(vw, vh);
      drawRoadSpace(vw, vh);
    } else {
      drawSkyEarth(vw, vh);
      drawRoadEarth(vw, vh);
    }

    const sorted = entities.slice().sort((a, b) => a.z - b.z);
    for (const e of sorted) drawEntity(e, vw, vh);
    drawBlasts(vw, vh);
    drawBombs(vw, vh);
    drawPlayer(vw, vh);
    drawParticles();
    drawBombFlash(vw, vh);
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

  if (modePick) {
    modePick.addEventListener("click", (ev) => {
      const btn = ev.target.closest(".mode-card");
      if (!btn) return;
      setMode(btn.getAttribute("data-mode"));
    });
  }

  btnStart.addEventListener("click", resetGame);
  btnRetry.addEventListener("click", resetGame);
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
      case "b":
      case "B":
        fireBomb();
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
