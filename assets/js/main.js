// sixtyfour — main entry point

// ─── Display API ─────────────────────────────────────────────────────────────
//
// All modes write to the display through this object.
// The internal canvas is always 64×64; CSS scales it to fill the viewport.

const display = (() => {
  const WIDTH  = 64;
  const HEIGHT = 64;

  const canvas = document.getElementById('display');
  const ctx    = canvas.getContext('2d');

  // Flat RGBA pixel buffer — alpha channel is always 255 (fully opaque)
  const buffer    = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
  const imageData = new ImageData(buffer, WIDTH, HEIGHT);

  // Initialise alpha to fully opaque once — it never changes
  for (let i = 3; i < buffer.length; i += 4) {
    buffer[i] = 255;
  }

  function setPixel(x, y, r, g, b) {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
    const i  = (y * WIDTH + x) * 4;
    buffer[i]     = r;
    buffer[i + 1] = g;
    buffer[i + 2] = b;
  }

  function getPixel(x, y) {
    const i = (y * WIDTH + x) * 4;
    return { r: buffer[i], g: buffer[i + 1], b: buffer[i + 2] };
  }

  function clear(r = 0, g = 0, b = 0) {
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i]     = r;
      buffer[i + 1] = g;
      buffer[i + 2] = b;
    }
  }

  // Write the current buffer to the canvas — call once per frame
  function render() {
    ctx.putImageData(imageData, 0, 0);
  }

  return { setPixel, getPixel, clear, render, WIDTH, HEIGHT };
})();


// ─── Test pattern ────────────────────────────────────────────────────────────
//
// Colour gradient across the grid — confirms the renderer is working and
// shows the coordinate system (red increases left→right, green top→bottom).
// Will be replaced by the animation engine in Phase 3.

function drawTestPattern() {
  for (let y = 0; y < display.HEIGHT; y++) {
    for (let x = 0; x < display.WIDTH; x++) {
      const r = Math.round((x / (display.WIDTH  - 1)) * 255);
      const g = Math.round((y / (display.HEIGHT - 1)) * 255);
      const b = 128;
      display.setPixel(x, y, r, g, b);
    }
  }
}


// ─── Render loop ─────────────────────────────────────────────────────────────

function loop() {
  display.render();
  requestAnimationFrame(loop);
}

drawTestPattern();
loop();


// ─── UI overlay ───────────────────────────────────────────────────────────────
//
// Fades in when the user interacts with the area outside the pixel grid, and
// fades out after HIDE_DELAY ms of inactivity outside the grid.
//
// The overlay div itself always has pointer-events:none (set in CSS).
// Only #mode-bar opts in to pointer events when the overlay is visible,
// so the canvas is never blocked.

const overlay  = document.getElementById('ui-overlay');
const modeBar  = document.getElementById('mode-bar');
const modeLabel = document.getElementById('current-mode-label');

const HIDE_DELAY   = 3000;   // ms before the overlay fades out
const EDGE_MARGIN  = 48;     // px from viewport edge that also triggers show
                              // (handles square viewports with no gap around grid)

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

document.addEventListener('mousemove', (e) => {
  if (isOutsideCanvas(e.clientX, e.clientY) || isNearViewportEdge(e.clientX, e.clientY)) {
    showOverlay();
  }
});

document.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  if (isOutsideCanvas(t.clientX, t.clientY) || isNearViewportEdge(t.clientX, t.clientY)) {
    showOverlay();
  }
}, { passive: true });

// Interacting with the mode bar itself keeps the overlay alive
modeBar.addEventListener('mouseenter', resetHideTimer);
modeBar.addEventListener('touchstart', resetHideTimer, { passive: true });
