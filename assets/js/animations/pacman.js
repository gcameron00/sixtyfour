// Pac-Man intro sequence
//
// Mirrors the classic arcade attract sequence:
//   CHASE — a ghost pursues Pac-Man left across the screen toward a power pill
//   FLEE  — Pac-Man eats the pill, ghost turns purple, Pac-Man gives chase
// Loops indefinitely.

const W = 64;
const R = 4;           // sprite radius (px)
const Y = 32;          // vertical centre-line
const PILL_X = 7;      // x position of the power pill

const PAC_SPEED_CHASE  = 0.046;  // px / ms
const GHOST_SPEED_CHASE = 0.046;
const PAC_SPEED_FLEE   = 0.058;
const GHOST_SPEED_FLEE = 0.026;

const S_CHASE = 0;
const S_FLASH = 1;   // ~300 ms stutter when pill is eaten
const S_FLEE  = 2;
const S_PAUSE = 3;   // brief gap before loop restarts

let d;
let phase, phaseTimer;
let pacX, ghostX;
let chompAngle, chompDir;

// ─── Lifecycle ────────────────────────────────────────────────────────────────

function reset() {
  phase      = S_CHASE;
  phaseTimer = 0;
  pacX       = 71;   // starts just off right edge
  ghostX     = 83;   // ghost behind pac (to the right when moving left)
  chompAngle = Math.PI / 4;
  chompDir   = -1;
}

export const pacman = {
  name: 'Pac-Man',

  init(display) {
    d = display;
    reset();
  },

  tick(dt) {
    // Chomp oscillation — runs in every phase
    chompAngle += chompDir * dt * 0.007;
    if (chompAngle < 0.06)        { chompAngle = 0.06;        chompDir =  1; }
    if (chompAngle > Math.PI / 3) { chompAngle = Math.PI / 3; chompDir = -1; }

    phaseTimer += dt;

    // ── State machine ─────────────────────────────────────────────────────────

    switch (phase) {
      case S_CHASE:
        pacX   -= PAC_SPEED_CHASE  * dt;
        ghostX -= GHOST_SPEED_CHASE * dt;
        if (pacX <= PILL_X) {
          pacX  = PILL_X;
          phase = S_FLASH;
          phaseTimer = 0;
        }
        break;

      case S_FLASH:
        // Keep ghost crawling in during the stutter
        ghostX -= GHOST_SPEED_CHASE * dt * 0.3;
        if (phaseTimer >= 320) {
          phase = S_FLEE;
          phaseTimer = 0;
        }
        break;

      case S_FLEE:
        pacX   += PAC_SPEED_FLEE  * dt;
        ghostX += GHOST_SPEED_FLEE * dt;
        if (ghostX >= W + R + 2) {
          phase = S_PAUSE;
          phaseTimer = 0;
        }
        break;

      case S_PAUSE:
        if (phaseTimer >= 700) reset();
        break;
    }

    // ── Render ────────────────────────────────────────────────────────────────

    d.clear();

    const chasing = (phase === S_CHASE || phase === S_FLASH);

    // Power pill — visible only while chasing, flickers during flash
    if (phase === S_CHASE) {
      drawPill(PILL_X, Y);
    } else if (phase === S_FLASH && Math.floor(phaseTimer / 55) % 2 === 0) {
      drawPill(PILL_X, Y);
    }

    const pacFacing = chasing ? -1 : 1;   // left while chased, right while chasing
    const ghostBlue = !chasing;
    const pacAlpha  = (phase === S_FLASH && Math.floor(phaseTimer / 55) % 2 === 1);

    if (!pacAlpha) drawPacman(pacX, Y, pacFacing);
    drawGhost(ghostX, Y, ghostBlue);
  },
};

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawPill(x, y) {
  // 3×3 bright white dot
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const px = Math.round(x) + dx;
      const py = y + dy;
      if (px >= 0 && px < W) d.setPixel(px, py, 255, 255, 220);
    }
  }
}

function drawPacman(x, y, facing) {
  // facing: -1 = left, 1 = right
  const cx = Math.round(x);
  const facingAng = facing === 1 ? 0 : Math.PI;

  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      if (dx * dx + dy * dy > R * R) continue;
      // Mouth cut-out
      if (dx !== 0 || dy !== 0) {
        let ang = Math.atan2(dy, dx) - facingAng;
        if (ang >  Math.PI) ang -= 2 * Math.PI;
        if (ang < -Math.PI) ang += 2 * Math.PI;
        if (Math.abs(ang) <= chompAngle) continue;
      }
      const px = cx + dx, py = y + dy;
      if (px >= 0 && px < W && py >= 0 && py < W)
        d.setPixel(px, py, 255, 220, 0);
    }
  }
}

function drawGhost(x, y, blue) {
  const cx = Math.round(x);
  const r = blue ? 120 : 220;
  const g = blue ?  60 :  30;
  const b = blue ? 220 :  30;

  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      // Circular cap (top half) + rectangular body (bottom half)
      if (dy < 0 && dx * dx + dy * dy > R * R) continue;
      // Wavy skirt: skip every 3rd column on the bottom row
      if (dy === R && (dx + R) % 3 === 1) continue;

      const px = cx + dx, py = y + dy;
      if (px >= 0 && px < W && py >= 0 && py < W)
        d.setPixel(px, py, r, g, b);
    }
  }

  // Eyes
  if (blue) {
    // Scared eyes — two small white dots
    d.setPixel(cx - 1, y - 1, 220, 220, 255);
    d.setPixel(cx + 1, y - 1, 220, 220, 255);
  } else {
    // Normal eyes — white + blue pupil
    d.setPixel(cx - 2, y - 1, 255, 255, 255);
    d.setPixel(cx + 2, y - 1, 255, 255, 255);
    d.setPixel(cx - 2, y,      80,  80, 255);
    d.setPixel(cx + 2, y,      80,  80, 255);
  }
}
