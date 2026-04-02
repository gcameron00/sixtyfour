// Snake
//
// Classic snake on the 64×64 grid.
// Controls: arrow keys, WASD, or swipe.
// Score is displayed using the same 5×7 bitmap font as the clock.

const W    = 64;
const H    = 64;
const CELL = 4;           // px per cell → 16×16 grid of 4×4 cells
const COLS = W / CELL;    // 16
const ROWS = H / CELL;    // 16

// ─── Colours ──────────────────────────────────────────────────────────────────

const COL_BG     = [  8, 20,  8];
const COL_SNAKE  = [ 60, 220, 80];
const COL_HEAD   = [200, 255,180];
const COL_FOOD   = [255,  60, 60];
const COL_TEXT   = [200, 255,180];
const COL_DIM    = [ 40,  80, 40];

// ─── Pixel font (5×7) — digits 0–9 ───────────────────────────────────────────

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

// Letters needed for "GAME OVER" and "SCORE"
const FONT_ALPHA = {
  'G': [0x0E, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0E],
  'A': [0x0E, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
  'M': [0x11, 0x1B, 0x15, 0x11, 0x11, 0x11, 0x11],
  'E': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x1F],
  'O': [0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
  'V': [0x11, 0x11, 0x11, 0x11, 0x11, 0x0A, 0x04],
  'R': [0x1E, 0x11, 0x11, 0x1E, 0x14, 0x12, 0x11],
  'S': [0x0E, 0x11, 0x10, 0x0E, 0x01, 0x11, 0x0E],
  'C': [0x0E, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0E],
};

const GLYPH = { ...FONT, ...FONT_ALPHA };

// ─── State ────────────────────────────────────────────────────────────────────

let d         = null;
let snake     = [];   // [{col, row}, …] head-first
let dir       = { dc: 1, dr: 0 };
let nextDir   = { dc: 1, dr: 0 };
let food      = null;
let score     = 0;
let dead      = false;
let stepAcc   = 0;
const STEP_MS = 140;  // ms per grid step

// Touch tracking for swipe
let touchStartX = 0;
let touchStartY = 0;

// ─── Render helpers ───────────────────────────────────────────────────────────

function fillCell(col, row, r, g, b) {
  const px = col * CELL;
  const py = row * CELL;
  for (let dy = 0; dy < CELL; dy++) {
    for (let dx = 0; dx < CELL; dx++) {
      d.setPixel(px + dx, py + dy, r, g, b);
    }
  }
}

function drawGlyph(ch, x, y, col) {
  const rows = GLYPH[ch];
  if (!rows) return;
  for (let row = 0; row < 7; row++) {
    for (let c = 0; c < 5; c++) {
      if (rows[row] & (1 << (4 - c))) {
        d.setPixel(x + c, y + row, ...col);
      }
    }
  }
}

// Returns pixel width of a string (5px per char + 1px gap, no trailing gap)
function glyphRowWidth(str) {
  return str.length * 6 - 1;
}

function drawString(str, x, y, col) {
  for (let i = 0; i < str.length; i++) {
    drawGlyph(str[i], x + i * 6, y, col);
  }
}

function drawStringCentred(str, y, col) {
  const x = Math.floor((W - glyphRowWidth(str)) / 2);
  drawString(str, x, y, col);
}

// ─── Game logic ───────────────────────────────────────────────────────────────

function randomFood() {
  const occupied = new Set(snake.map(s => s.col + ',' + s.row));
  let col, row;
  do {
    col = Math.floor(Math.random() * COLS);
    row = Math.floor(Math.random() * ROWS);
  } while (occupied.has(col + ',' + row));
  return { col, row };
}

function startGame() {
  const midC = Math.floor(COLS / 2);
  const midR = Math.floor(ROWS / 2);
  snake   = [{ col: midC, row: midR }, { col: midC - 1, row: midR }, { col: midC - 2, row: midR }];
  dir     = { dc: 1, dr: 0 };
  nextDir = { dc: 1, dr: 0 };
  food    = randomFood();
  score   = 0;
  dead    = false;
  stepAcc = 0;
}

function step() {
  const head    = snake[0];
  const newHead = { col: head.col + dir.dc, row: head.row + dir.dr };

  // Wall collision
  if (newHead.col < 0 || newHead.col >= COLS || newHead.row < 0 || newHead.row >= ROWS) {
    dead = true;
    return;
  }

  // Self collision
  if (snake.some(s => s.col === newHead.col && s.row === newHead.row)) {
    dead = true;
    return;
  }

  snake.unshift(newHead);

  if (newHead.col === food.col && newHead.row === food.row) {
    score++;
    food = randomFood();
    // Don't pop tail — snake grows
  } else {
    snake.pop();
  }
}

// ─── Drawing ──────────────────────────────────────────────────────────────────

function drawGame() {
  d.clear(...COL_BG);

  // Food
  fillCell(food.col, food.row, ...COL_FOOD);

  // Snake body (tail → neck)
  for (let i = snake.length - 1; i > 0; i--) {
    fillCell(snake[i].col, snake[i].row, ...COL_SNAKE);
  }
  // Head
  fillCell(snake[0].col, snake[0].row, ...COL_HEAD);

  // Score along the top — small single-pixel gap between score digits and grid
  const scoreStr = String(score);
  drawString(scoreStr, 1, 1, COL_DIM);
}

function drawGameOver() {
  d.clear(...COL_BG);
  drawStringCentred('GAME', 10, COL_TEXT);
  drawStringCentred('OVER', 20, COL_TEXT);
  const scoreStr = String(score);
  drawStringCentred(scoreStr, 35, COL_TEXT);
  drawStringCentred('SCORE', 44, COL_DIM);
}

// ─── Input ────────────────────────────────────────────────────────────────────

function handleKey(e) {
  switch (e.key) {
    case 'ArrowUp':    case 'w': case 'W': if (dir.dr !== 1)  nextDir = { dc: 0, dr: -1 }; break;
    case 'ArrowDown':  case 's': case 'S': if (dir.dr !== -1) nextDir = { dc: 0, dr:  1 }; break;
    case 'ArrowLeft':  case 'a': case 'A': if (dir.dc !== 1)  nextDir = { dc: -1, dr: 0 }; break;
    case 'ArrowRight': case 'd': case 'D': if (dir.dc !== -1) nextDir = { dc:  1, dr: 0 }; break;
    case ' ': case 'Enter':
      if (dead) startGame();
      break;
  }
}

function handleClick() {
  if (dead) startGame();
}

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
  if (dead) { startGame(); return; }
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;  // tap, ignore
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && dir.dc !== -1) nextDir = { dc:  1, dr: 0 };
    if (dx < 0 && dir.dc !==  1) nextDir = { dc: -1, dr: 0 };
  } else {
    if (dy > 0 && dir.dr !== -1) nextDir = { dc: 0, dr:  1 };
    if (dy < 0 && dir.dr !==  1) nextDir = { dc: 0, dr: -1 };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function activate(display) {
  d = display;
  startGame();
  window.addEventListener('keydown',    handleKey);
  window.addEventListener('click',      handleClick);
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchend',   handleTouchEnd,   { passive: true });
}

export function deactivate() {
  window.removeEventListener('keydown',    handleKey);
  window.removeEventListener('click',      handleClick);
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchend',   handleTouchEnd);
}

export function tick(dt) {
  if (dead) {
    drawGameOver();
    return;
  }

  dir     = nextDir;
  stepAcc += dt;
  while (stepAcc >= STEP_MS) {
    stepAcc -= STEP_MS;
    step();
    if (dead) break;
  }

  drawGame();
}
