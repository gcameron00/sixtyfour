// Rain — vertical green streaks with decaying trails (retro terminal feel)
// Each drop maintains a brightness state in a local Float32Array.
// The trail decay is normalised to dt so tail length is frame-rate independent.

const NUM_DROPS = 24;

// Target decay per frame at 60 fps; normalised by dt in tick()
const DECAY_PER_FRAME_60 = 0.82;

let d;
let drops       = [];
let brightness  = new Float32Array(64 * 64);  // 0..1 per pixel

function newDrop(scattered = false) {
  return {
    x:     Math.floor(Math.random() * 64),
    y:     scattered ? Math.random() * 64 : -Math.random() * 20,
    speed: 10 + Math.random() * 20,   // pixels per second
  };
}

export const rain = {
  name: 'Rain',

  init(display) {
    d = display;
    brightness.fill(0);
    drops = Array.from({ length: NUM_DROPS }, () => newDrop(true));
  },

  tick(dt) {
    const secs = dt / 1000;

    // Decay all pixel brightnesses — normalised so tail length is consistent
    // regardless of frame rate
    const decayFactor = Math.pow(DECAY_PER_FRAME_60, dt / 16.67);
    for (let i = 0; i < brightness.length; i++) {
      brightness[i] *= decayFactor;
    }

    // Advance each drop and mark its head pixel
    for (const drop of drops) {
      drop.y += drop.speed * secs;
      if (drop.y >= 64) {
        Object.assign(drop, newDrop(false));
        continue;
      }
      const py = Math.floor(drop.y);
      if (py >= 0) brightness[py * 64 + drop.x] = 1.0;
    }

    // Render: green channel carries the brightness; slight blue tint on bright pixels
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const b = brightness[y * 64 + x];
        d.setPixel(
          x, y,
          0,
          Math.round(b * 210 + b * 45),  // green: bright head fades to dim
          Math.round(b * 40),             // faint blue tint
        );
      }
    }
  },
};
