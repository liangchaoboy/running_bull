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

  const W = 420;
  const H = 740;
  const LANES = 3;
  const LANE_X = [0.22, 0.5, 0.78];
  const BOMB_COOLDOWN = 1.6;
  const JUMP_DURATION = 0.55;
  const JUMP_HEIGHT = 90;

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

  const player = {
    lane: 1,
    displayLane: 1,
    jumpT: 0,
    jumping: false,
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
    player.lane = 1;
    player.displayLane = 1;
    player.jumpT = 0;
    player.jumping = false;
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
    player.lane = next;
  }

  function jump() {
    if (!running || dead) return;
    if (player.jumping) return;
    player.jumping = true;
    player.jumpT = 0;
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

    player.displayLane += (player.lane - player.displayLane) * Math.min(1, dt * 14);

    if (player.jumping) {
      player.jumpT += dt;
      if (player.jumpT >= JUMP_DURATION) {
        player.jumping = false;
        player.jumpT = 0;
      }
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
      if (e.z < 0.62 || e.z > 0.88) continue;
      if (e.lane !== player.lane) continue;
      if (e.kind === "coin") {
        e.alive = false;
        coins += 1;
        burst(e.lane, e.z, mode === "space" ? "#ffc0ef" : "#ffd700");
      } else if (e.kind === "obstacle") {
        if (!player.jumping) {
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

  canvas.addEventListener(
    "pointerdown",
    (ev) => {
      touchStartX = ev.clientX;
      touchStartY = ev.clientY;
      touchStartT = performance.now();
      swipeUsed = false;
      canvas.setPointerCapture(ev.pointerId);
    },
    { passive: true }
  );

  canvas.addEventListener(
    "pointerup",
    (ev) => {
      const dx = ev.clientX - touchStartX;
      const dy = ev.clientY - touchStartY;
      const dt = performance.now() - touchStartT;
      if (!running) return;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        changeLane(dx > 0 ? 1 : -1);
        swipeUsed = true;
      } else if (dy < -40 && Math.abs(dy) > Math.abs(dx)) {
        jump();
        swipeUsed = true;
      } else if (!swipeUsed && dt < 350 && Math.hypot(dx, dy) < 24) {
        const rect = canvas.getBoundingClientRect();
        if (ev.clientY - rect.top < rect.height * 0.55) jump();
      }
    },
    { passive: true }
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

  setMode("earth");
  resize();
  requestAnimationFrame(loop);
})();
