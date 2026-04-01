// Colour Wash — slow full-grid hue rotation
// Every pixel is coloured by its position + a slowly advancing time offset,
// producing a rippling wash of colour across the display.

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if      (h < 60)  { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

let d, t;

export const colourWash = {
  name: 'Colour Wash',

  init(display) {
    d = display;
    t = 0;
  },

  tick(dt) {
    // One full hue cycle every ~25 seconds at 60 fps
    t += dt * 0.00004;
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const hue = ((x + y) / 128 * 360 + t * 360) % 360;
        const [r, g, b] = hslToRgb(hue, 0.9, 0.5);
        d.setPixel(x, y, r, g, b);
      }
    }
  },
};
