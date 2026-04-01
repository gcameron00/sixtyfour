// Album Art mode
//
// Displays a library of pixel-rendered album covers with smooth crossfades
// between them. Each cover module exports { meta, draw(d) }.

import * as screamadelica from '../covers/screamadelica.js';
import * as darkSide      from '../covers/dark-side.js';
import * as aRushOfBlood  from '../covers/arushofblood.js';

const LIBRARY   = [screamadelica, darkSide, aRushOfBlood];
const XFADE_MS  = 600;

let d            = null;
let onChangeCb   = null;
let currentIndex = 0;
let crossfading  = false;
let xfadeProgress = 0;

// ─── Offscreen buffers for crossfade ─────────────────────────────────────────

function makeBuffer() {
  const buf = new Uint8ClampedArray(64 * 64 * 3);
  return {
    setPixel(x, y, r, g, b) {
      if (x < 0 || x >= 64 || y < 0 || y >= 64) return;
      const i = (y * 64 + x) * 3;
      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b;
    },
    getPixel(x, y) {
      const i = (y * 64 + x) * 3;
      return { r: buf[i], g: buf[i + 1], b: buf[i + 2] };
    },
    clear(r = 0, g = 0, b = 0) {
      for (let i = 0; i < buf.length; i += 3) {
        buf[i] = r; buf[i + 1] = g; buf[i + 2] = b;
      }
    },
    buf,
    WIDTH: 64, HEIGHT: 64,
  };
}

const fromBuf = makeBuffer();
const toBuf   = makeBuffer();

// ─── Internal helpers ─────────────────────────────────────────────────────────

function drawCurrent(target) {
  LIBRARY[currentIndex].draw(target);
}

function navigate(newIndex) {
  if (newIndex === currentIndex) return;

  // Snapshot what is currently showing into fromBuf
  const fb = fromBuf.buf;
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const { r, g, b } = d.getPixel(x, y);
      const j = (y * 64 + x) * 3;
      fb[j] = r; fb[j + 1] = g; fb[j + 2] = b;
    }
  }

  // Render new cover into toBuf
  currentIndex = newIndex;
  toBuf.clear();
  drawCurrent(toBuf);

  xfadeProgress = 0;
  crossfading   = true;
  onChangeCb?.(LIBRARY[currentIndex].meta, currentIndex, LIBRARY.length);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function init(display, onChangeCallback) {
  d          = display;
  onChangeCb = onChangeCallback;
}

export function activate() {
  crossfading = false;
  drawCurrent(d);
  onChangeCb?.(LIBRARY[currentIndex].meta, currentIndex, LIBRARY.length);
}

export function deactivate() {
  crossfading = false;
}

export function tick(dt) {
  if (!crossfading) return;

  xfadeProgress = Math.min(1, xfadeProgress + dt / XFADE_MS);
  const t  = xfadeProgress;
  const fb = fromBuf.buf;
  const tb = toBuf.buf;

  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const j = (y * 64 + x) * 3;
      d.setPixel(x, y,
        Math.round(fb[j]     + (tb[j]     - fb[j])     * t),
        Math.round(fb[j + 1] + (tb[j + 1] - fb[j + 1]) * t),
        Math.round(fb[j + 2] + (tb[j + 2] - fb[j + 2]) * t),
      );
    }
  }

  if (xfadeProgress >= 1) crossfading = false;
}

export function next() {
  navigate((currentIndex + 1) % LIBRARY.length);
}

export function prev() {
  navigate((currentIndex - 1 + LIBRARY.length) % LIBRARY.length);
}
