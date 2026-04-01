// Shared pixel-drawing utilities for cover art
// All functions take col as [r, g, b]

export function fillCircle(d, cx, cy, radius, col) {
  const r2 = radius * radius;
  const x0 = Math.max(0, Math.floor(cx - radius));
  const x1 = Math.min(63, Math.ceil(cx + radius));
  const y0 = Math.max(0, Math.floor(cy - radius));
  const y1 = Math.min(63, Math.ceil(cy + radius));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r2) {
        d.setPixel(x, y, col[0], col[1], col[2]);
      }
    }
  }
}

export function fillRect(d, x, y, w, h, col) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      d.setPixel(x + dx, y + dy, col[0], col[1], col[2]);
    }
  }
}
