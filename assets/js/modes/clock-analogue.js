// Analogue Clock mode
//
// Smooth-moving clock face on a dark background.
// Hour/minute/second hands are drawn with sub-millisecond precision from
// Date so the second hand glides rather than ticks.

const TAU      = Math.PI * 2;
const HALF_PI  = Math.PI / 2;

// Display centre (between pixels so projections are symmetric)
const CX = 31.5;
const CY = 31.5;

// Colours
const BG        = [  5,  10,  28];   // dark navy background
const TICK_COL  = [150, 155, 180];   // hour tick marks
const HOUR_COL  = [220, 220, 235];   // hour hand
const MIN_COL   = [240, 245, 255];   // minute hand
const SEC_COL   = [255, 130,  30];   // second hand (amber)
const PIVOT_COL = [255, 255, 255];   // centre dot

let d;

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function drawLine(x0, y0, x1, y1, r, g, b) {
  const dx    = x1 - x0;
  const dy    = y1 - y0;
  const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)));
  if (steps === 0) { d.setPixel(Math.round(x0), Math.round(y0), r, g, b); return; }
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    d.setPixel(Math.round(x0 + dx * t), Math.round(y0 + dy * t), r, g, b);
  }
}

// Draw a hand; thick=true adds a parallel offset line for visual weight
function drawHand(angle, length, r, g, b, thick = false) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x1  = CX + cos * length;
  const y1  = CY + sin * length;

  drawLine(CX, CY, x1, y1, r, g, b);

  if (thick) {
    // Perpendicular unit vector
    const px = -sin;
    const py =  cos;
    drawLine(CX + px, CY + py, x1 + px, y1 + py, r, g, b);
  }
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

function draw() {
  const now = new Date();
  const ms  = now.getMilliseconds();

  const secs  = now.getSeconds()  + ms  / 1000;
  const mins  = now.getMinutes()  + secs / 60;
  const hours = now.getHours() % 12 + mins / 60;

  const secAngle  = (secs  / 60) * TAU - HALF_PI;
  const minAngle  = (mins  / 60) * TAU - HALF_PI;
  const hourAngle = (hours / 12) * TAU - HALF_PI;

  // Background
  d.clear(...BG);

  // Hour tick marks (outer edge r=29, inner edge r=26)
  for (let h = 0; h < 12; h++) {
    const a   = (h / 12) * TAU - HALF_PI;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    drawLine(
      CX + cos * 26, CY + sin * 26,
      CX + cos * 29, CY + sin * 29,
      ...TICK_COL,
    );
  }

  // Hands — draw order: hour (bottom) → minute → second (top)
  drawHand(hourAngle,  14, ...HOUR_COL, true);   // thick hour
  drawHand(minAngle,   21, ...MIN_COL,  false);
  drawHand(secAngle,   26, ...SEC_COL,  false);

  // Centre pivot — 2×2 block
  d.setPixel(31, 31, ...PIVOT_COL);
  d.setPixel(32, 31, ...PIVOT_COL);
  d.setPixel(31, 32, ...PIVOT_COL);
  d.setPixel(32, 32, ...PIVOT_COL);
}

// ─── Mode interface ───────────────────────────────────────────────────────────

export function activate(display) {
  d = display;
  draw();
}

export function deactivate() {}

export function tick(_dt) {
  draw();
}
