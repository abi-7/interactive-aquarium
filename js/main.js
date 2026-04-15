import { videoToScreen } from './utils.js';
import { Fish } from './fish.js';
import { Bubble } from './bubble.js';
import { FoodPellet } from './food.js';
import { initHandTracking } from './handTracking.js';

// ── Canvas ────────────────────────────────────────────────────────────────────
const canvas = document.getElementById('mainCanvas');
const ctx    = canvas.getContext('2d');

// ── Shared state (passed by reference to all modules that need it) ─────────
const state = {
  W: 0, H: 0,
  ctx,
  handX: -999, handY: -999,
  handVX: 0,   handVY: 0,
  prevHX: -999, prevHY: -999,
  handSeen: false,
  debugMode: true,
  debugLandmarks: null,
};

function resize() {
  state.W = canvas.width  = window.innerWidth;
  state.H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ── Scene objects ─────────────────────────────────────────────────────────────
const fishArr     = Array.from({ length: 45 }, (_, i) => new Fish(i, state));
const bubbles     = [];
const foodPellets = [];

setInterval(() => {
  if (bubbles.length < 45) bubbles.push(new Bubble(undefined, undefined, state));
  const f = fishArr[Math.random()*fishArr.length | 0];
  if (Math.random() < 0.25) bubbles.push(new Bubble(f.x, f.y + 5, state));
}, 430);

// Click to drop food
document.getElementById('scene').addEventListener('click', e => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (let i = 0; i < 5 + Math.floor(Math.random()*4); i++) {
    foodPellets.push(new FoodPellet(
      x + (Math.random()-0.5)*30,
      y + (Math.random()-0.5)*20,
      state
    ));
  }
});

// ── Main render loop ──────────────────────────────────────────────────────────
let frameT = 0;
let lastTs = 0;

function loop(ts) {
  requestAnimationFrame(loop);
  frameT++;
  // Delta time capped at 50ms (prevents fish teleporting after tab switch)
  const dt = Math.min(ts - lastTs, 50) / 16.67; // 1.0 = normal 60fps frame
  lastTs = ts;
  ctx.clearRect(0, 0, state.W, state.H);

  if (state.handSeen) {
    state.handVX = (state.handX - state.prevHX) * 0.5;
    state.handVY = (state.handY - state.prevHY) * 0.5;
  }

  // Food pellets
  for (let i = foodPellets.length-1; i >= 0; i--) {
    const fp = foodPellets[i];
    fp.update(dt); fp.draw();
    for (const f of fishArr) {
      const dx = f.x - fp.x, dy = f.y - fp.y;
      if (dx*dx+dy*dy < 40*40 && !fp.eaten && fp.life > 0.5) {
        fp.eaten = true; fp.life = 0;
        f.vx += dx < 0 ? -0.5 : 0.5;
      }
    }
    for (const f of fishArr) {
      if (f.fear < 0.1) {
        const dx = fp.x - f.x, dy = fp.y - f.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < 200*200 && d2 > 1) {
          const d = Math.sqrt(d2);
          f.vx += (dx/d) * 0.25 * dt;
          f.vy += (dy/d) * 0.25 * dt;
        }
      }
    }
    if (fp.life <= 0) { foodPellets.splice(i, 1); continue; }
  }

  // Fish
  fishArr.sort((a, b) => a.depth - b.depth);
  for (const f of fishArr) { f.update(dt); f.draw(); }

  // Bubbles
  for (let i = bubbles.length-1; i >= 0; i--) {
    const b = bubbles[i];
    b.update(); b.draw();
    if (b.y < -20 || b.life <= 0) bubbles.splice(i, 1);
  }

  // Debug skeleton
  if (state.debugMode && state.debugLandmarks) {
    ctx.save();
    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[17,18],[18,19],[19,20],[0,17]
    ];
    ctx.strokeStyle = 'rgba(0,255,80,0.7)';
    ctx.lineWidth   = 2;
    for (const [a, b] of CONNECTIONS) {
      const la = videoToScreen(state.debugLandmarks[a].x, state.debugLandmarks[a].y, state.W, state.H);
      const lb = videoToScreen(state.debugLandmarks[b].x, state.debugLandmarks[b].y, state.W, state.H);
      ctx.beginPath();
      ctx.moveTo(la.x, la.y);
      ctx.lineTo(lb.x, lb.y);
      ctx.stroke();
    }
    ctx.fillStyle = '#0f0';
    for (const lm of state.debugLandmarks) {
      const p = videoToScreen(lm.x, lm.y, state.W, state.H);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI*2);
      ctx.fill();
    }
    // Hand centre crosshair
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.arc(state.handX, state.handY, 22, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
  }
}
requestAnimationFrame(loop);

// ── Hand tracking ─────────────────────────────────────────────────────────────
const videoEl = document.getElementById('videoEl');
const handDot = document.getElementById('handDot');
const uiEl    = document.getElementById('ui');
initHandTracking(state, videoEl, handDot, uiEl);
