// Fire — bottom-up heat simulation (Doom-style)
// A seed row below the visible grid is kept at max heat. Each frame, heat
// propagates upward with a small random horizontal spread and decay, producing
// organic, flickering flames.

// Pre-computed palette: black → red → orange → yellow → white (256 entries)
const palette = [];
for (let i = 0; i < 256; i++) {
  let r, g, b;
  if (i < 64) {
    r = i * 4;                              g = 0;                         b = 0;
  } else if (i < 128) {
    r = 255;  g = Math.round((i - 64) * 2.5);                             b = 0;
  } else if (i < 192) {
    r = 255;  g = Math.round(160 + (i - 128) * 1.5);                      b = 0;
  } else {
    r = 255;  g = 255;  b = Math.round((i - 192) * 4);
  }
  palette.push([r, g, b]);
}

// heat[0..63*64-1] = visible grid (row 0 = top)
// heat[64*64..64*65-1] = invisible seed row below the display
const heat = new Uint8Array(64 * 65);

let d;

export const fire = {
  name: 'Fire',

  init(display) {
    d = display;
    heat.fill(0);
  },

  tick(_dt) {
    // Seed the hidden bottom row with near-max heat, randomly flickering
    for (let x = 0; x < 64; x++) {
      heat[64 * 64 + x] = Math.random() > 0.05
        ? 255
        : Math.floor(Math.random() * 80 + 160);
    }

    // Propagate heat upward — each cell takes from the row below,
    // with a small random horizontal drift and a 0–1 unit decay
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const spread = Math.floor(Math.random() * 3) - 1;  // –1, 0, or +1
        const srcX   = (x + spread + 64) % 64;
        const src    = (y + 1) * 64 + srcX;
        heat[y * 64 + x] = Math.max(0, heat[src] - (Math.random() < 0.5 ? 1 : 0));
      }
    }

    // Render via pre-computed palette
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const [r, g, b] = palette[heat[y * 64 + x]];
        d.setPixel(x, y, r, g, b);
      }
    }
  },
};
