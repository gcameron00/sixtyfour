// sixtyfour — main entry point

import { display }        from './display.js';
import * as animMode      from './modes/animations.js';
import * as clockDigital  from './modes/clock-digital.js';
import * as clockAnalogue from './modes/clock-analogue.js';

// ─── Mode registry ────────────────────────────────────────────────────────────
//
// Each entry implements { activate(), deactivate(), tick(dt) }.
// Modes not listed here fall through to a blank screen on activate.

const animControls = document.getElementById('anim-controls');

const MODES = {
  'animations': {
    activate:   () => { animMode.activate();   animControls.hidden = false; },
    deactivate: () => { animMode.deactivate(); animControls.hidden = true;  },
    tick:       (dt) => animMode.tick(dt),
  },
  'clock-digital': {
    activate:   () => clockDigital.activate(display),
    deactivate: () => clockDigital.deactivate(),
    tick:       (dt) => clockDigital.tick(dt),
  },
  'clock-analogue': {
    activate:   () => clockAnalogue.activate(display),
    deactivate: () => clockAnalogue.deactivate(),
    tick:       (dt) => clockAnalogue.tick(dt),
  },
  // 'ripple', 'album-art', 'games' added as phases are implemented
};

// ─── Render loop ─────────────────────────────────────────────────────────────

let activeMode = 'animations';
let lastTime   = null;

function loop(timestamp) {
  const dt = lastTime === null ? 16 : timestamp - lastTime;
  lastTime  = timestamp;

  MODES[activeMode]?.tick(dt);

  display.render();
  requestAnimationFrame(loop);
}

// ─── Mode switching ───────────────────────────────────────────────────────────

const modeLabel = document.getElementById('current-mode-label');
const modeBtns  = document.querySelectorAll('.mode-btn');

const MODE_LABELS = {
  'animations':    'Animations',
  'clock-digital': 'Digital Clock',
  'clock-analogue':'Analogue Clock',
  'ripple':        'Ripple',
  'album-art':     'Album Art',
  'games':         'Games',
};

function setMode(mode) {
  if (mode === activeMode) return;

  MODES[activeMode]?.deactivate();
  activeMode = mode;

  if (MODES[activeMode]) {
    MODES[activeMode].activate();
  } else {
    // Unimplemented mode — clear to black
    animControls.hidden = true;
    display.clear();
  }

  modeLabel.textContent = MODE_LABELS[mode] ?? mode;
  modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
}

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

// ─── Animation controls ───────────────────────────────────────────────────────

const animNameEl = document.getElementById('anim-name');
const animPinBtn = document.getElementById('anim-pin');

function onAnimChange(anim, _index, pinned, _total) {
  animNameEl.textContent = anim.name;
  animPinBtn.classList.toggle('active', pinned);
  animPinBtn.textContent = pinned ? '◆' : '◇';
  animPinBtn.title       = pinned ? 'Unpin — resume auto-cycle' : 'Pin — stop auto-cycling';
}

document.getElementById('anim-prev').addEventListener('click', () => animMode.prev());
document.getElementById('anim-next').addEventListener('click', () => animMode.next());
animPinBtn.addEventListener('click', () => animMode.togglePin());

// ─── UI overlay ───────────────────────────────────────────────────────────────
//
// Fades in when the user interacts with the area outside the pixel grid, and
// fades out after HIDE_DELAY ms of inactivity.

const overlay = document.getElementById('ui-overlay');
const modeBar = document.getElementById('mode-bar');

const HIDE_DELAY  = 3000;
const EDGE_MARGIN = 48;

let hideTimer = null;

function showOverlay() {
  overlay.classList.add('visible');
  overlay.setAttribute('aria-hidden', 'false');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hideOverlay, HIDE_DELAY);
}

function hideOverlay() {
  overlay.classList.remove('visible');
  overlay.setAttribute('aria-hidden', 'true');
}

function resetHideTimer() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hideOverlay, HIDE_DELAY);
}

function isOutsideCanvas(x, y) {
  const rect = document.getElementById('display').getBoundingClientRect();
  return x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;
}

function isNearViewportEdge(x, y) {
  return (
    x < EDGE_MARGIN ||
    y < EDGE_MARGIN ||
    x > window.innerWidth  - EDGE_MARGIN ||
    y > window.innerHeight - EDGE_MARGIN
  );
}

document.addEventListener('mousemove', e => {
  if (isOutsideCanvas(e.clientX, e.clientY) || isNearViewportEdge(e.clientX, e.clientY)) {
    showOverlay();
  }
});

document.addEventListener('touchstart', e => {
  const t = e.touches[0];
  if (isOutsideCanvas(t.clientX, t.clientY) || isNearViewportEdge(t.clientX, t.clientY)) {
    showOverlay();
  }
}, { passive: true });

modeBar.addEventListener('mouseenter', resetHideTimer);
modeBar.addEventListener('touchstart', resetHideTimer, { passive: true });

// ─── Boot ─────────────────────────────────────────────────────────────────────

animMode.init(display, onAnimChange);
requestAnimationFrame(loop);
