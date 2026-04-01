// ─── Display API ─────────────────────────────────────────────────────────────
//
// Owns the canvas and pixel buffer. All modes write here via setPixel/clear.
// The canvas is always 64×64 internally; CSS scales it to fill the viewport.
//
// Exported as a singleton — import { display } from './display.js'

const WIDTH  = 64;
const HEIGHT = 64;

const canvas    = document.getElementById('display');
const ctx       = canvas.getContext('2d');
const buffer    = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
const imageData = new ImageData(buffer, WIDTH, HEIGHT);

// Alpha is always 255 — set once and never touched again
for (let i = 3; i < buffer.length; i += 4) buffer[i] = 255;

function setPixel(x, y, r, g, b) {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const i    = (y * WIDTH + x) * 4;
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

// Write the pixel buffer to the canvas. Call once per frame after all drawing.
function render() {
  ctx.putImageData(imageData, 0, 0);
}

export const display = { setPixel, getPixel, clear, render, WIDTH, HEIGHT };
