# Display Modes

This document describes planned and implemented display modes for sixtyfour.

---

## Animations

The default state of the display. A curated pool of looping pixel animations plays automatically, cycling or allowing user selection.

**Ideas / candidates:**
- Colour wash — slow shifting hues across the grid
- Starfield — classic scrolling stars
- Rain — vertical pixel trails
- Fire — rising, flickering pixel flames
- Conway's Game of Life — cellular automaton
- Plasma — sine-wave colour interference patterns
- Bouncing shapes — retro screensaver energy
- Sprite parade — tiny pixel characters walking across the screen

---

## Digital Clock

Displays the current local time as pixel digit characters. May include seconds, date, or a seconds-progress bar along the bottom.

---

## Analogue Clock

A circular clock face rendered in pixels. Hour, minute, and second hands. Optionally shows tick marks at the hours.

---

## Ripple Pool

The grid starts as a calm, flat surface. Mouse clicks or touch events create ripples that spread outward, interact with the edges, and decay naturally. Multiple simultaneous ripples interfere with each other.

---

## Games

The 64×64 grid as a game canvas. Planned games:

- **Snake** — grows on pickup, dies on collision
- **Pong** — single or two-player
- **Breakout** — classic brick-breaker
- **Tetris-like** — falling block puzzle

---

## Album Art

Pixel-renders album cover artwork onto the 64×64 grid.

### Built-in covers

A small library of hand-crafted or algorithmically downsampled classic album covers will be included. First planned cover:

- **Primal Scream — Screamadelica** (1991)

More covers to be added over time.

### Last.fm integration

Users can enter a Last.fm username. The mode polls the Last.fm API for the currently-playing or most-recently-played track, fetches the album artwork, downsamples it to 64×64, and renders it on the display. Updates when the track changes.

**Implementation notes:**
- Last.fm API: `user.getRecentTracks` with `nowplaying` flag
- Image resizing: `<canvas>` 2D context `drawImage` for nearest-neighbour or bilinear downsampling
- Polling interval: ~10–15 seconds
- Fallback: show a placeholder pattern if no art is available
- API key required (user provides their own, stored in `localStorage`)
