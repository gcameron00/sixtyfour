// Animations mode — runner that manages the pool of animations
//
// Contract for each animation object:
//   name: string
//   init(display)  — called when animation becomes active; receives the display API
//   tick(dt)       — called every frame with elapsed ms since last frame
//   destroy()      — optional; called when animation is deactivated

import { colourWash } from '../animations/colour-wash.js';
import { starfield }  from '../animations/starfield.js';
import { fire }       from '../animations/fire.js';
import { rain }       from '../animations/rain.js';

const POOL            = [colourWash, starfield, fire, rain];
const CYCLE_INTERVAL  = 60_000;  // ms between auto-advances when not pinned

let display       = null;
let index         = 0;
let pinned        = false;
let cycleTimer    = null;
let onChangeCb    = null;

function current() {
  return POOL[index];
}

function startCurrent() {
  current().init(display);
  onChangeCb?.(current(), index, pinned, POOL.length);
}

function stopCurrent() {
  current().destroy?.();
}

function scheduleCycle() {
  clearTimeout(cycleTimer);
  if (!pinned) {
    cycleTimer = setTimeout(() => next(), CYCLE_INTERVAL);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function init(disp, onChangeCallback) {
  display    = disp;
  onChangeCb = onChangeCallback;
  startCurrent();
  scheduleCycle();
}

export function activate() {
  startCurrent();
  scheduleCycle();
}

export function deactivate() {
  stopCurrent();
  clearTimeout(cycleTimer);
}

export function tick(dt) {
  current().tick(dt);
}

export function next() {
  stopCurrent();
  index = (index + 1) % POOL.length;
  startCurrent();
  scheduleCycle();
}

export function prev() {
  stopCurrent();
  index = (index - 1 + POOL.length) % POOL.length;
  startCurrent();
  scheduleCycle();
}

export function togglePin() {
  pinned = !pinned;
  scheduleCycle();
  onChangeCb?.(current(), index, pinned, POOL.length);
}
