// Starfield — 3-D star field, depth-sorted
// Stars have an (x, y, z) position. z decreases each frame (moving toward the
// viewer). 2-D screen position is computed by perspective projection, and
// brightness increases as a star approaches (z → 0).

const NUM_STARS = 150;

let d;
let stars = [];

function createStar(scattered = false) {
  return {
    x: (Math.random() - 0.5) * 2,           // –1 … +1
    y: (Math.random() - 0.5) * 2,           // –1 … +1
    z: scattered ? Math.random() * 0.9 + 0.1 : 1.0,
  };
}

export const starfield = {
  name: 'Starfield',

  init(display) {
    d     = display;
    // Scatter initial stars across depth so the screen isn't empty at start
    stars = Array.from({ length: NUM_STARS }, () => createStar(true));
  },

  tick(dt) {
    d.clear();
    const speed = dt * 0.00045;

    for (const star of stars) {
      star.z -= speed;

      if (star.z <= 0) {
        Object.assign(star, createStar(false));
        continue;
      }

      const sx = Math.round((star.x / star.z) * 30 + 32);
      const sy = Math.round((star.y / star.z) * 30 + 32);

      if (sx < 0 || sx >= 64 || sy < 0 || sy >= 64) {
        Object.assign(star, createStar(false));
        continue;
      }

      // Brighter as star approaches; clamp to 255
      const brightness = Math.min(255, Math.round((1 - star.z) * 1.2 * 255));
      d.setPixel(sx, sy, brightness, brightness, brightness);
    }
  },
};
