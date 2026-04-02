// sixtyfour — main entry point

import { display }        from './display.js';
import * as animMode      from './modes/animations.js';
import * as clockDigital  from './modes/clock-digital.js';
import * as clockAnalogue from './modes/clock-analogue.js';
import * as albumArt      from './modes/album-art.js';

// ─── Clock sub-modes ──────────────────────────────────────────────────────────

let activeClockId = 'digital';

const CLOCK_SUBS = {
  digital:  {
    activate:   () => clockDigital.activate(display),
    deactivate: () => clockDigital.deactivate(),
    tick:       dt => clockDigital.tick(dt),
  },
  analogue: {
    activate:   () => clockAnalogue.activate(display),
    deactivate: () => clockAnalogue.deactivate(),
    tick:       dt => clockAnalogue.tick(dt),
  },
};

// ─── Primary mode registry ────────────────────────────────────────────────────
//
// Each primary exposes: activate, deactivate, tick, getItems, getCurrentId,
// selectById, prev, next.

let activePrimaryId = 'animations';

const PRIMARIES = {
  animations: {
    label:        'Animations',
    activate:     () => animMode.activate(),
    deactivate:   () => animMode.deactivate(),
    tick:         dt => animMode.tick(dt),
    getItems:     () => animMode.getItems(),
    getCurrentId: () => animMode.getCurrentId(),
    selectById:   id => animMode.selectById(id),
    prev:         () => animMode.prev(),
    next:         () => animMode.next(),
  },

  clock: {
    label:        'Clock',
    activate:     () => CLOCK_SUBS[activeClockId].activate(),
    deactivate:   () => CLOCK_SUBS[activeClockId].deactivate(),
    tick:         dt => CLOCK_SUBS[activeClockId].tick(dt),
    getItems:     () => [{ id: 'digital', label: 'Digital' }, { id: 'analogue', label: 'Analogue' }],
    getCurrentId: () => activeClockId,
    selectById(id) {
      if (id === activeClockId) return;
      CLOCK_SUBS[activeClockId].deactivate();
      activeClockId = id;
      CLOCK_SUBS[activeClockId].activate();
      renderSecondary();
    },
    prev() {
      const ids = ['digital', 'analogue'];
      PRIMARIES.clock.selectById(ids[(ids.indexOf(activeClockId) - 1 + 2) % 2]);
    },
    next() {
      const ids = ['digital', 'analogue'];
      PRIMARIES.clock.selectById(ids[(ids.indexOf(activeClockId) + 1) % 2]);
    },
  },

  'album-art': {
    label:        'Album Art',
    activate:     () => albumArt.activate(),
    deactivate:   () => albumArt.deactivate(),
    tick:         dt => albumArt.tick(dt),
    getItems:     () => albumArt.getItems(),
    getCurrentId: () => albumArt.getCurrentId(),
    selectById:   id => albumArt.selectById(id),
    prev:         () => albumArt.prev(),
    next:         () => albumArt.next(),
  },

  ripple: {
    label:        'Ripple',
    activate:     () => display.clear(),
    deactivate:   () => {},
    tick:         () => {},
    getItems:     () => [],
    getCurrentId: () => null,
    selectById:   () => {},
    prev:         () => {},
    next:         () => {},
  },

  games: {
    label:        'Games',
    activate:     () => display.clear(),
    deactivate:   () => {},
    tick:         () => {},
    getItems:     () => [],
    getCurrentId: () => null,
    selectById:   () => {},
    prev:         () => {},
    next:         () => {},
  },
};

const PRIMARY_ORDER = ['animations', 'clock', 'album-art', 'ripple', 'games'];

// ─── Render loop ──────────────────────────────────────────────────────────────

let lastTime = null;

function loop(timestamp) {
  const dt = lastTime === null ? 16 : timestamp - lastTime;
  lastTime  = timestamp;
  PRIMARIES[activePrimaryId].tick(dt);
  display.render();
  requestAnimationFrame(loop);
}

// ─── Mode switching ───────────────────────────────────────────────────────────

function setActivePrimary(id) {
  if (id === activePrimaryId) return;
  PRIMARIES[activePrimaryId].deactivate();
  activePrimaryId = id;
  PRIMARIES[activePrimaryId].activate();
  renderPrimary();
  renderSecondary();
}

// ─── Strip rendering ──────────────────────────────────────────────────────────

const primaryScroll   = document.getElementById('primary-scroll');
const secondaryScroll = document.getElementById('secondary-scroll');

function renderPrimary() {
  primaryScroll.innerHTML = '';
  for (const id of PRIMARY_ORDER) {
    const btn = document.createElement('button');
    btn.className   = 'strip-item' + (id === activePrimaryId ? ' active' : '');
    btn.textContent = PRIMARIES[id].label;
    btn.addEventListener('click', () => setActivePrimary(id));
    primaryScroll.appendChild(btn);
  }
  scrollActiveIntoView(primaryScroll);
}

function renderSecondary() {
  secondaryScroll.innerHTML = '';
  const p        = PRIMARIES[activePrimaryId];
  const items    = p.getItems();
  const activeId = p.getCurrentId();
  for (const item of items) {
    const btn = document.createElement('button');
    btn.className   = 'strip-item' + (item.id === activeId ? ' active' : '');
    btn.textContent = item.label;
    btn.addEventListener('click', () => p.selectById(item.id));
    secondaryScroll.appendChild(btn);
  }
  scrollActiveIntoView(secondaryScroll);
}

function scrollActiveIntoView(scrollEl) {
  scrollEl.querySelector('.strip-item.active')
    ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

// ─── Arrow buttons ────────────────────────────────────────────────────────────

const primaryPrev   = document.getElementById('primary-prev');
const primaryNext   = document.getElementById('primary-next');
const secondaryPrev = document.getElementById('secondary-prev');
const secondaryNext = document.getElementById('secondary-next');

primaryPrev.addEventListener('click', () => {
  const i = PRIMARY_ORDER.indexOf(activePrimaryId);
  setActivePrimary(PRIMARY_ORDER[(i - 1 + PRIMARY_ORDER.length) % PRIMARY_ORDER.length]);
});

primaryNext.addEventListener('click', () => {
  const i = PRIMARY_ORDER.indexOf(activePrimaryId);
  setActivePrimary(PRIMARY_ORDER[(i + 1) % PRIMARY_ORDER.length]);
});

secondaryPrev.addEventListener('click', () => PRIMARIES[activePrimaryId].prev());
secondaryNext.addEventListener('click', () => PRIMARIES[activePrimaryId].next());

function updateArrowSymbols() {
  const portrait = window.matchMedia('(orientation: portrait)').matches;
  primaryPrev.textContent   = portrait ? '◀' : '▲';
  primaryNext.textContent   = portrait ? '▶' : '▼';
  secondaryPrev.textContent = portrait ? '◀' : '▲';
  secondaryNext.textContent = portrait ? '▶' : '▼';
}

window.matchMedia('(orientation: portrait)').addEventListener('change', updateArrowSymbols);

// ─── Show / hide strips ───────────────────────────────────────────────────────
//
// Strips fade in when the user interacts outside the pixel grid, and fade out
// after HIDE_DELAY ms of inactivity.

const primaryStrip   = document.getElementById('primary-strip');
const secondaryStrip = document.getElementById('secondary-strip');
const HIDE_DELAY     = 3000;
let   hideTimer      = null;

function showStrips() {
  primaryStrip.classList.add('visible');
  secondaryStrip.classList.add('visible');
  primaryStrip.removeAttribute('aria-hidden');
  secondaryStrip.removeAttribute('aria-hidden');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hideStrips, HIDE_DELAY);
}

function hideStrips() {
  primaryStrip.classList.remove('visible');
  secondaryStrip.classList.remove('visible');
  primaryStrip.setAttribute('aria-hidden', 'true');
  secondaryStrip.setAttribute('aria-hidden', 'true');
}

function resetHideTimer() {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hideStrips, HIDE_DELAY);
}

function isOutsideCanvas(x, y) {
  const rect = document.getElementById('display').getBoundingClientRect();
  return x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;
}

document.addEventListener('mousemove', e => {
  if (isOutsideCanvas(e.clientX, e.clientY)) showStrips();
});

document.addEventListener('touchstart', e => {
  const t = e.touches[0];
  if (isOutsideCanvas(t.clientX, t.clientY)) showStrips();
}, { passive: true });

primaryStrip.addEventListener('mouseenter',  resetHideTimer);
secondaryStrip.addEventListener('mouseenter', resetHideTimer);
primaryStrip.addEventListener('touchstart',  resetHideTimer, { passive: true });
secondaryStrip.addEventListener('touchstart', resetHideTimer, { passive: true });

// ─── Mode-change callbacks ────────────────────────────────────────────────────

function onAnimChange() {
  if (activePrimaryId === 'animations') renderSecondary();
}

function onAlbumChange() {
  if (activePrimaryId === 'album-art') renderSecondary();
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

animMode.init(display, onAnimChange);
albumArt.init(display, onAlbumChange);
updateArrowSymbols();
renderPrimary();
renderSecondary();
requestAnimationFrame(loop);
