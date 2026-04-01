// Digital Clock mode
//
// Renders HH:MM:SS in a 5×7 pixel bitmap font, centred on the grid.
// Colons blink every 500 ms. A seconds-progress bar runs along the bottom row.

// ─── 5×7 bitmap font — digits 0–9 ────────────────────────────────────────────
// Each entry is 7 row values. For each row, bit 4 = leftmost pixel, bit 0 = rightmost.

const FONT = {
  '0': [0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
  '1': [0x04, 0x0C, 0x04, 0x04, 0x04, 0x04, 0x0E],
  '2': [0x0E, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1F],
  '3': [0x0E, 0x01, 0x01, 0x07, 0x01, 0x01, 0x0E],
  '4': [0x02, 0x06, 0x0A, 0x12, 0x1F, 0x02, 0x02],
  '5': [0x1F, 0x10, 0x1E, 0x01, 0x01, 0x11, 0x0E],
  '6': [0x06, 0x08, 0x10, 0x1E, 0x11, 0x11, 0x0E],
  '7': [0x1F, 0x01, 0x02, 0x04, 0x04, 0x04, 0x04],
  '8': [0x0E, 0x11, 0x11, 0x0E, 0x11, 0x11, 0x0E],
  '9': [0x0E, 0x11, 0x11, 0x0F, 0x01, 0x02, 0x0C],
};

// Amber: warm retro LED feel
const FG  = [255, 185,  30];   // lit pixel
const DIM = [ 55,  40,   8];   // unlit progress bar segment

let d;

function pad2(n) { return String(n).padStart(2, '0'); }

function drawDigit(ch, x, y) {
  const rows = FONT[ch];
  if (!rows) return;
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if (rows[row] & (1 << (4 - col))) {
        d.setPixel(x + col, y + row, ...FG);
      }
    }
  }
}

// 3-pixel-wide colon: dot at centre column (x+1), rows 2 and 4
function drawColon(x, y) {
  d.setPixel(x + 1, y + 2, ...FG);
  d.setPixel(x + 1, y + 4, ...FG);
}

function draw() {
  const now   = new Date();
  const hh    = pad2(now.getHours());
  const mm    = pad2(now.getMinutes());
  const ss    = pad2(now.getSeconds());
  const blink = (now.getTime() % 1000) < 500;

  d.clear();

  // Layout: H H [colon] M M [colon] S S
  // Each digit 5px wide, 1px inter-digit gap, 3px colon slot
  // Total: 5+1+5+3+5+1+5+3+5+1+5 = 39px → x0 = ⌊(64–39)/2⌋ = 12
  // Height 7px → y0 = ⌊(64–7)/2⌋ = 28

  const x0 = 12, y0 = 28;

  drawDigit(hh[0], x0,      y0);
  drawDigit(hh[1], x0 + 6,  y0);
  if (blink) drawColon(x0 + 11, y0);
  drawDigit(mm[0], x0 + 14, y0);
  drawDigit(mm[1], x0 + 20, y0);
  if (blink) drawColon(x0 + 25, y0);
  drawDigit(ss[0], x0 + 28, y0);
  drawDigit(ss[1], x0 + 34, y0);

  // Seconds-progress bar along the bottom row
  // Uses sub-second precision so the bar moves smoothly every frame
  const progress = (now.getSeconds() + now.getMilliseconds() / 1000) / 60;
  const filled   = Math.round(progress * 64);
  for (let x = 0; x < 64; x++) {
    if (x < filled) {
      d.setPixel(x, 63, ...FG);
    } else {
      d.setPixel(x, 63, ...DIM);
    }
  }
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
