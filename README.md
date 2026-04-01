# sixtyfour

A creative, single-page web experience built around a **64×64 virtual pixel display**. Think retro LED panel meets modern browser — whimsical animations, interactive modes, and a pixel canvas that rewards curiosity.

## What it is

The entire page is dominated by a 64×64 grid of virtual pixels. Controls and menus exist around the edges but stay out of the way — they fade into view when you move your mouse or touch outside the grid, then quietly disappear again once you stop.

The display runs a built-in pool of animations by default: looping, generative, and retro-flavoured. Users can switch to other modes at any time.

## Modes

| Mode | Status | Description |
|------|--------|-------------|
| Animations | Planned | Built-in pool of whimsical, looping pixel animations |
| Digital Clock | Planned | Time rendered in pixel digits |
| Analogue Clock | Planned | A ticking clock face drawn pixel by pixel |
| Ripple Pool | Planned | Click or touch to send ripples across the grid |
| Games | Planned | Classic and original games on the pixel canvas |
| Album Art | Planned | Pixel-rendered album covers; Last.fm integration for real-time art |

### Album Art

A handful of classic album covers will be included as built-in pixel art. The first planned cover is **Primal Scream — Screamadelica**.

A future option will allow users to enter a Last.fm username and have the currently-playing track's album art fetched, downsampled, and rendered live on the display.

## UI / UX principles

- The pixel grid fills the viewport — it is the experience
- Controls are present but invisible by default; they surface on interaction with the surrounding area and fade out gracefully after a short idle period (long enough not to be annoying during active use)
- Designed to feel good on both desktop (mouse) and mobile (touch)

## Tech

Vanilla HTML, CSS, and JavaScript. Hosted on Cloudflare Pages.

No build step, no framework, no dependencies.

## Project structure

```
sixtyfour/
├── index.html          # Main single-page app
├── about/
│   └── index.html      # About page
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   └── favicon.svg
└── docs/
    ├── plan.md         # Phased implementation plan
    └── modes.md        # Detail on planned and implemented display modes
```

## Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Core renderer — 64×64 canvas, pixel API, render loop | Done |
| 2 | UI overlay — fade in/out controls | Done |
| 3 | Animation engine + first animations | Done |
| 4 | Clock modes (digital + analogue) | Not started |
| 5 | Ripple pool | Not started |
| 6 | Album art — built-in covers (Screamadelica first) | Not started |
| 7 | Games (Snake first) | Not started |
| 8 | Last.fm live album art | Not started |

See [docs/plan.md](docs/plan.md) for the full breakdown of each phase.
