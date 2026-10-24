(function () {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const hudDist = document.getElementById("hud-dist");
  const hudCoins = document.getElementById("hud-coins");
  const hudScore = document.getElementById("hud-score");
  const overlay = document.getElementById("overlay");
  const overEl = document.getElementById("over");
  const btnStart = document.getElementById("btn-start");
  const btnRetry = document.getElementById("btn-retry");
  const btnLeft = document.getElementById("btn-left");
  const btnRight = document.getElementById("btn-right");
  const btnJump = document.getElementById("btn-jump");
  const btnBomb = document.getElementById("btn-bomb");

  const W = 420;
  const H = 740;
  const LANES = 3;
  const LANE_X = [0.22, 0.5, 0.78]; // relative road positions at near end
  const BOMB_COOLDOWN = 1.6;
  const JUMP_DURATION = 0.55;
  const JUMP_HEIGHT = 90;

  let dpr = 1;
  let running = false;
  let dead = false;
  let lastTs = 0;
  let roadScroll = 0;
  let speed = 280; // px/s near-end equivalent
  let distance = 0;
  let coins = 0;
  let score = 0;
  let bombCd = 0;
  let spawnAcc = 0;
  let coinAcc = 0;
  let runPhase = 0;

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
    // map lane relative positions from center
    const offset = (lx - 0.5) * 2; // -1..1-ish
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
    // clear obstacles on same lane ahead of player
    for (const e of entities) {
      if (!e.alive) continue;
      if (e.kind !== "obstacle") continue;
      if (e.lane !== player.lane) continue;
      if (e.z > 0.25 && e.z < 0.95) {
        e.alive = false;
        burst(e.lane, e.z, "#c45a1a");
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
    // avoid same lane double-stack too close
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
    if (!running) return;

    speed = Math.min(520, 280 + distance * 0.35);
    const zSpeed = (speed / 420) * 0.55; // z units per second toward player
    roadScroll += speed * dt;
    distance += (speed * dt) / 18;
    runPhase += dt * (speed / 80);

    // smooth lane lerp
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

    // move entities toward player (increase z)
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

    // collisions / collect
    for (const e of entities) {
      if (!e.alive) continue;
      if (e.z < 0.62 || e.z > 0.88) continue;
      if (e.lane !== player.lane) continue;
      if (e.kind === "coin") {
        e.alive = false;
        coins += 1;
        burst(e.lane, e.z, "#ffd700");
      } else if (e.kind === "obstacle") {
        if (!player.jumping) {
          gameOver();
          return;
        }
        // jumping clears low obstacles
      }
    }

    entities = entities.filter((e) => e.alive && e.z < 1.15);

    // spawn
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

  function drawSky(vw, vh) {
    const g = ctx.createLinearGradient(0, 0, 0, vh * 0.55);
    g.addColorStop(0, "#1a8cff");
    g.addColorStop(0.55, "#6ed0ff");
    g.addColorStop(1, "#b8ecff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, vw, vh);

    // sun
    ctx.beginPath();
    ctx.fillStyle = "#ffe566";
    ctx.arc(vw * 0.82, vh * 0.12, vw * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // distant hills
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

  function drawRoad(vw, vh) {
    const far = roadEdges(0, vw, vh);
    const near = roadEdges(1, vw, vh);

    // grass sides
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(0, far.y, vw, near.y - far.y + 40);

    // road trapezoid
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

    // lane dividers (dashed, scrolling)
    ctx.strokeStyle = "rgba(255,255,220,0.85)";
    ctx.lineCap = "round";
    for (let lane = 0; lane < 2; lane++) {
      const t = (lane + 1) / 3;
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

    // road edge lines
    ctx.strokeStyle = "#fff8dc";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(far.left, far.y);
    ctx.lineTo(near.left, near.y);
    ctx.moveTo(far.right, far.y);
    ctx.lineTo(near.right, near.y);
    ctx.stroke();
  }

  function drawEntity(e, vw, vh) {
    if (!e.alive || e.z < 0) return;
    const p = project(e.lane, Math.max(0, Math.min(1, e.z)), vw, vh);
    if (e.kind === "coin") {
      const r = 10 * p.scale;
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
    } else {
      const bw = 42 * p.scale;
      const bh = 36 * p.scale;
      const x = p.x - bw / 2;
      const y = p.y - bh;
      // crate
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

  function drawPlayer(vw, vh) {
    const laneF = player.displayLane;
    // interpolate between lane projections
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

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(x, y + 4, 22 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    const py = y - jumpY;
    const bob = player.jumping ? 0 : Math.sin(runPhase * 2.2) * 4 * scale;
    const lean = player.jumping ? -6 : Math.sin(runPhase) * 3;

    // body (bull)
    ctx.save();
    ctx.translate(x, py + bob);
    ctx.rotate((lean * Math.PI) / 180);

    // legs running
    ctx.strokeStyle = "#5c3a1e";
    ctx.lineWidth = 5 * scale;
    ctx.lineCap = "round";
    const legSwing = player.jumping ? 0.3 : Math.sin(runPhase * 2.4);
    ctx.beginPath();
    ctx.moveTo(-8 * scale, 10 * scale);
    ctx.lineTo(-8 * scale - legSwing * 10 * scale, 28 * scale);
    ctx.moveTo(8 * scale, 10 * scale);
    ctx.lineTo(8 * scale + legSwing * 10 * scale, 28 * scale);
    ctx.stroke();

    // torso
    ctx.fillStyle = "#c47a2c";
    ctx.beginPath();
    ctx.ellipse(0, -6 * scale, 22 * scale, 26 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // head
    ctx.fillStyle = "#d4893a";
    ctx.beginPath();
    ctx.ellipse(0, -34 * scale, 16 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // horns
    ctx.strokeStyle = "#eee8d5";
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(-10 * scale, -42 * scale);
    ctx.quadraticCurveTo(-22 * scale, -52 * scale, -16 * scale, -58 * scale);
    ctx.moveTo(10 * scale, -42 * scale);
    ctx.quadraticCurveTo(22 * scale, -52 * scale, 16 * scale, -58 * scale);
    ctx.stroke();

    // eyes
    ctx.fillStyle = "#1a1008";
    ctx.beginPath();
    ctx.arc(-5 * scale, -36 * scale, 2.2 * scale, 0, Math.PI * 2);
    ctx.arc(5 * scale, -36 * scale, 2.2 * scale, 0, Math.PI * 2);
    ctx.fill();

    // snout
    ctx.fillStyle = "#f0c8a0";
    ctx.beginPath();
    ctx.ellipse(0, -28 * scale, 8 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawBombs(vw, vh) {
    for (const b of bombs) {
      const p = project(b.lane, Math.max(0, b.z), vw, vh);
      const r = 14 * p.scale;
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.arc(p.x, p.y - 10 * p.scale, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff4444";
      ctx.beginPath();
      ctx.arc(p.x, p.y - 10 * p.scale, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      // fuse spark
      ctx.strokeStyle = "#ffaa00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x + r * 0.6, p.y - 10 * p.scale - r);
      ctx.lineTo(p.x + r, p.y - 10 * p.scale - r * 1.6);
      ctx.stroke();
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
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("勇敢牛牛，不怕困难", vw / 2, vh * 0.14);
  }

  function render() {
    const { w: vw, h: vh } = viewSize();
    ctx.clearRect(0, 0, vw, vh);
    drawSky(vw, vh);
    drawRoad(vw, vh);

    // depth sort entities
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

  // --- input ---
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

  btnStart.addEventListener("click", resetGame);
  btnRetry.addEventListener("click", resetGame);

  // swipe + tap on canvas
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
        // tap: upper half jump, lower half nothing (buttons handle)
        const rect = canvas.getBoundingClientRect();
        if (ev.clientY - rect.top < rect.height * 0.55) jump();
      }
    },
    { passive: true }
  );

  // keyboard optional for desktop testing
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
      default:
        break;
    }
  });

  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", () => setTimeout(resize, 120));

  resize();
  requestAnimationFrame(loop);
})();
