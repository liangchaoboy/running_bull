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
  const HIT_Z_MIN = 0.68;
  const HIT_Z_MAX = 0.84;
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
  let speed = 280;
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

  /** @type {Array<{lane:number,z:number,kind:string,alive:boolean}>} */
  let entities = [];
  /** @type {Array<{lane:number,z:number,life:number}>} */
  let bombs = [];
  /** @type {Array<{x:number,y:number,vx:number,vy:number,life:number,color:string}>} */
  let particles = [];

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
    speed = 280;
    distance = 0;
    coins = 0;
    score = 0;
    bombCd = 0;
    spawnAcc = 0.4;
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

  function fireBomb() {
    if (!running || dead) return;
    if (bombCd > 0) return;
    bombCd = BOMB_COOLDOWN;
    bombs.push({ lane: player.lane, z: 0.72, life: 0.55 });
    btnBomb.disabled = true;
    btnBomb.classList.add("cooling");
    const burstColor = mode === "space" ? "#e879f9" : "#c45a1a";
    for (const e of entities) {
      if (!e.alive) continue;
      if (e.kind !== "obstacle") continue;
      if (e.lane !== player.lane) continue;
      if (e.z > 0.25 && e.z < 0.95) {
        e.alive = false;
        burst(e.lane, e.z, burstColor);
      }
    }
  }

  function burst(lane, z, color) {
    const { w, h } = viewSize();
    const p = project(lane, z, w, h);
    for (let i = 0; i < 10; i++) {
      particles.push({
        x: p.x,
        y: p.y,
        vx: (Math.random() - 0.5) * 180,
        vy: -60 - Math.random() * 120,
        life: 0.4 + Math.random() * 0.3,
        color,
      });
    }
  }

  function spawnObstacle() {
    const lane = Math.floor(Math.random() * LANES);
    const nearby = entities.some(
      (e) => e.alive && e.kind === "obstacle" && e.lane === lane && e.z < 0.25
    );
    if (nearby) return;
    entities.push({ lane, z: 0, kind: "obstacle", alive: true });
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

    speed = Math.min(520, 280 + distance * 0.35);
    const zSpeed = (speed / 420) * 0.55;
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
        btnBomb.disabled = false;
        btnBomb.classList.remove("cooling");
      }
    }

    for (const e of entities) {
      if (!e.alive) continue;
      e.z += zSpeed * dt;
    }

    for (const b of bombs) {
      b.z -= zSpeed * 1.8 * dt;
      b.life -= dt;
    }
    bombs = bombs.filter((b) => b.life > 0 && b.z > -0.1);

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
    const spawnInterval = Math.max(0.55, 1.1 - distance / 800);
    if (spawnAcc <= 0) {
      spawnObstacle();
      spawnAcc = spawnInterval * (0.7 + Math.random() * 0.6);
    }
    if (coinAcc <= 0) {
      spawnCoinLine();
      coinAcc = 1.4 + Math.random() * 1.2;
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

  function drawEntity(e, vw, vh) {
    if (!e.alive || e.z < 0) return;
    const p = project(e.lane, Math.max(0, Math.min(1, e.z)), vw, vh);
    if (e.kind === "coin") {
      const r = 10 * p.scale;
      if (mode === "space") {
        // pastel candy coin
        ctx.beginPath();
        ctx.fillStyle = "#ff9ed2";
        ctx.strokeStyle = "#e879f9";
        ctx.lineWidth = 2 * p.scale;
        ctx.arc(p.x, p.y - 8 * p.scale, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#fff0fa";
        ctx.beginPath();
        ctx.arc(p.x - 3 * p.scale, p.y - 11 * p.scale, 3 * p.scale, 0, Math.PI * 2);
        ctx.fill();
        // tiny star sparkle
        ctx.fillStyle = "#fff";
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(p.x + 4 * p.scale, p.y - 6 * p.scale, 1.5 * p.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        ctx.beginPath();
        ctx.fillStyle = "#ffd700";
        ctx.strokeStyle = "#e6a800";
        ctx.lineWidth = 2 * p.scale;
        ctx.arc(p.x, p.y - 8 * p.scale, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#fff6a0";
        ctx.beginPath();
        ctx.arc(p.x - 3 * p.scale, p.y - 11 * p.scale, 3 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (mode === "space") {
      drawCrystalObstacle(p);
    } else {
      const bw = 42 * p.scale;
      const bh = 36 * p.scale;
      const x = p.x - bw / 2;
      const y = p.y - bh;
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(x, y, bw, bh);
      ctx.strokeStyle = "#5c2e0a";
      ctx.lineWidth = 2 * p.scale;
      ctx.strokeRect(x, y, bw, bh);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + bw, y + bh);
      ctx.moveTo(x + bw, y);
      ctx.lineTo(x, y + bh);
      ctx.stroke();
      ctx.fillStyle = "#a0522d";
      ctx.fillRect(x + 4 * p.scale, y + 4 * p.scale, bw - 8 * p.scale, 6 * p.scale);
    }
  }

  function drawCrystalObstacle(p) {
    const s = p.scale;
    const x = p.x;
    const y = p.y;
    // soft glow
    const glow = ctx.createRadialGradient(x, y - 20 * s, 0, x, y - 16 * s, 36 * s);
    glow.addColorStop(0, "rgba(255,160,220,0.45)");
    glow.addColorStop(1, "rgba(255,160,220,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y - 16 * s, 36 * s, 0, Math.PI * 2);
    ctx.fill();

    // crystal diamond body
    ctx.beginPath();
    ctx.moveTo(x, y - 48 * s);
    ctx.lineTo(x + 22 * s, y - 22 * s);
    ctx.lineTo(x + 14 * s, y);
    ctx.lineTo(x - 14 * s, y);
    ctx.lineTo(x - 22 * s, y - 22 * s);
    ctx.closePath();
    const cg = ctx.createLinearGradient(x - 22 * s, y - 48 * s, x + 22 * s, y);
    cg.addColorStop(0, "#fbcfe8");
    cg.addColorStop(0.4, "#e879f9");
    cg.addColorStop(0.7, "#c084fc");
    cg.addColorStop(1, "#a78bfa");
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();

    // facet line
    ctx.beginPath();
    ctx.moveTo(x, y - 48 * s);
    ctx.lineTo(x, y);
    ctx.moveTo(x - 22 * s, y - 22 * s);
    ctx.lineTo(x + 22 * s, y - 22 * s);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.stroke();

    // highlight
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.moveTo(x - 6 * s, y - 40 * s);
    ctx.lineTo(x - 2 * s, y - 28 * s);
    ctx.lineTo(x - 10 * s, y - 26 * s);
    ctx.closePath();
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
      const r = 14 * p.scale;
      if (mode === "space") {
        ctx.fillStyle = "#6b21a8";
        ctx.beginPath();
        ctx.arc(p.x, p.y - 10 * p.scale, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f0abfc";
        ctx.beginPath();
        ctx.arc(p.x, p.y - 10 * p.scale, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fda4af";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x + r * 0.6, p.y - 10 * p.scale - r);
        ctx.lineTo(p.x + r, p.y - 10 * p.scale - r * 1.6);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.arc(p.x, p.y - 10 * p.scale, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff4444";
        ctx.beginPath();
        ctx.arc(p.x, p.y - 10 * p.scale, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffaa00";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x + r * 0.6, p.y - 10 * p.scale - r);
        ctx.lineTo(p.x + r, p.y - 10 * p.scale - r * 1.6);
        ctx.stroke();
      }
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
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
    if (mode === "space") {
      drawSkySpace(vw, vh);
      drawRoadSpace(vw, vh);
    } else {
      drawSkyEarth(vw, vh);
      drawRoadEarth(vw, vh);
    }

    const sorted = entities.slice().sort((a, b) => a.z - b.z);
    for (const e of sorted) drawEntity(e, vw, vh);
    drawBombs(vw, vh);
    drawPlayer(vw, vh);
    drawParticles();
    drawTitleHint(vw, vh);
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
    const handler = (ev) => {
      ev.preventDefault();
      fn();
    };
    el.addEventListener("pointerdown", handler);
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
      // Allow another lane change after finger travels further (chained swipe).
      swipeOriginX += dx;
      swipeOriginY += dy;
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
