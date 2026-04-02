// Ripple pool
//
// Classic two-buffer wave simulation on the 64×64 grid.
// Propagation: new[i] = (neighbours of curr) * 0.5 − prev[i], then damp.
// Energy is injected by clicking or touching the canvas. Ambient drips keep
// the pool alive when idle.

const W    = 64;
const H    = 64;
const N    = W * H;
const DAMP = 0.985;

let d            = null;
let curr         = new Float32Array(N);
let prev         = new Float32Array(N);
let ambientTimer = 0;
let canvas       = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inject(cx, cy, strength) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const x = cx + dx;
      const y = cy + dy;
      if (x >= 0 && x < W && y >= 0 && y < H) {
        curr[y * W + x] += strength;
      }
    }
  }
}

function pointerToCell(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    cx: Math.floor(((clientX - rect.left) / rect.width)  * W),
    cy: Math.floor(((clientY - rect.top)  / rect.height) * H),
  };
}

function onPointerDown(e) {
  const { cx, cy } = pointerToCell(e.clientX, e.clientY);
  inject(cx, cy, 200);
}

function onTouchStart(e) {
  for (const t of e.touches) {
    const { cx, cy } = pointerToCell(t.clientX, t.clientY);
    inject(cx, cy, 200);
  }
}

function onTouchMove(e) {
  for (const t of e.touches) {
    const { cx, cy } = pointerToCell(t.clientX, t.clientY);
    inject(cx, cy, 80);
  }
}

function onMouseMove(e) {
  if (e.buttons === 0) return;  // only while pressed
  const { cx, cy } = pointerToCell(e.clientX, e.clientY);
  inject(cx, cy, 80);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function activate(display) {
  d    = display;
  curr = new Float32Array(N);
  prev = new Float32Array(N);
  ambientTimer = 0;

  canvas = document.getElementById('display');
  canvas.addEventListener('mousedown',  onPointerDown);
  canvas.addEventListener('mousemove',  onMouseMove);
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchmove',  onTouchMove,  { passive: true });
}

export function deactivate() {
  if (!canvas) return;
  canvas.removeEventListener('mousedown',  onPointerDown);
  canvas.removeEventListener('mousemove',  onMouseMove);
  canvas.removeEventListener('touchstart', onTouchStart);
  canvas.removeEventListener('touchmove',  onTouchMove);
  canvas = null;
}

export function tick(dt) {
  // Ambient drip every ~1.2 s to keep pool alive
  ambientTimer += dt;
  if (ambientTimer > 1200) {
    ambientTimer = 0;
    inject(
      1 + Math.floor(Math.random() * (W - 2)),
      1 + Math.floor(Math.random() * (H - 2)),
      24,
    );
  }

  // Wave propagation (interior cells only; edges stay 0 → reflection)
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      prev[i] = (
        curr[i - 1] + curr[i + 1] +
        curr[i - W] + curr[i + W]
      ) * 0.5 - prev[i];
      prev[i] *= DAMP;
    }
  }

  // Swap buffers
  const tmp = curr; curr = prev; prev = tmp;

  // Render — map height to a water palette
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const h    = curr[y * W + x];
      const norm = Math.max(-1, Math.min(1, h / 128));  // −1 … +1

      let r, g, b;
      if (norm < 0) {
        // Trough: dark navy → resting blue
        const t = norm + 1;                          // 0 … 1
        r = Math.round(2  + t * 3);                  // 2 → 5
        g = Math.round(15 + t * 40);                 // 15 → 55
        b = Math.round(55 + t * 90);                 // 55 → 145
      } else {
        // Crest: resting blue → bright white-blue
        const t = norm;                              // 0 … 1
        r = Math.round(5   + t * 200);              // 5 → 205
        g = Math.round(55  + t * 185);              // 55 → 240
        b = Math.round(145 + t * 110);              // 145 → 255
      }
      d.setPixel(x, y, r, g, b);
    }
  }
}
