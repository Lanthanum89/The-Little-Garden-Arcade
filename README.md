# The Little Garden Arcade 🌿

A hub of gentle, tap-to-play garden mini-games. No drag-and-drop, ever — everything works by tapping a piece, then tapping where it goes, so it stays easy to play regardless of fine motor control.

**Live:** https://lanthanum89.github.io/The-Little-Garden-Arcade/

## Games

- **Flower Garden** 🌼 — tap a flower, then tap the pot of the same colour
- **Memory Garden** 🌷 — tap two cards to find a matching pair
- **Petal Catch** 🌸 — tap a lane to move the basket and catch the falling petals, three hearts before the round ends
- **Sprout Pop** 🌱 — tap the sprouts to water them before they duck back underground, timed round
- **Bloom Garden** 🌻 — tap a flower, then tap an empty plot to plant it; no timer, just a garden that slowly fills in with birds, butterflies and benches as you go

## Features

- **Tap-to-select, never drag-and-drop** — an accessibility requirement, not a style choice
- **Sparse, slow ambient animation** — decorative only, never gameplay-critical
- **Keyboard accessible** — every tap target is focusable and activatable with Enter/Space, not just pointer/touch
- **Pinch-zoom left on** — no viewport locking, so low-vision players can zoom in
- **Progress tracking** — completions recorded per game in `localStorage`
- **Installable PWA** — works offline, installable on Android/iOS via browser

## Stack

- Vanilla HTML / CSS / JS — no build step, no dependencies, no framework
- PWA: `manifest.json` + service worker (offline play, installable), written to be subpath-safe for GitHub Pages
- `localStorage` for progress tracking
- Shared modules instead of duplicated logic: `shared/tap-select.js` (the select → target → check → animate state machine used by Flower Garden), `shared/storage.js` (progress persistence), and `shared/a11y.js` (keyboard/switch access for tap targets)
- GitHub Pages hosting, deployed via GitHub Actions (`public/` → Pages, no build step)

## Local dev

Clone and serve `public/` with any static server:

```bash
git clone https://github.com/Lanthanum89/The-Little-Garden-Arcade.git
cd The-Little-Garden-Arcade/public
npx serve .
```

Or open `public/index.html` directly in a browser (service worker requires HTTPS or localhost).

## TODO

- [ ] Add more games to the arcade
- [ ] Decide if gentle sound effects would help or just add noise (currently silent)
- [ ] Confirm colours, tap-target sizes, and pacing work well for the end user's motor skills
- [ ] Small celebration flourish on completing a game, kept quiet and optional

## License

[MIT](LICENSE)
