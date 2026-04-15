# NitroCycle

A 2D pixel-art educational game that teaches the **nitrogen cycle** through interactive, real-time gameplay. Built for Austria's *Lange Nacht der Forschung* science outreach event — playable in **🇩🇪 German** and **🇬🇧 English** (toggle in the top-right).

## Play it

It's a static site — no build step.

```bash
# Just open it
open index.html

# Or serve locally to avoid file:// CORS quirks
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Gameplay

You manage the nitrogen pools in a soil ecosystem to keep a central plant alive. Grow it from a seed (🌱) into a tree (🌳) by feeding it the right nitrogen forms — without polluting the air (N₂O) or groundwater (leached NO₃⁻).

### The six core actions

| Key | Action | Process |
|----|--------|---------|
| `1` | **FIX** | N₂ → NH₄⁺ via *Rhizobium* |
| `2` | **DECOMPOSE** | Organic N → NH₄⁺ via decomposer bacteria |
| `3` | **NITRIFY 1** | NH₄⁺ → NO₂⁻ via *Nitrosomonas* |
| `4` | **NITRIFY 2** | NO₂⁻ → NO₃⁻ via *Nitrobacter* |
| `5` | **FEED** | Plant uptake (NO₃⁻ gives **+50% bonus**) |
| `6` | **DENITRIFY** | NO₃⁻ → N₂ (or N₂O — risky!) via *Pseudomonas* |

## Project layout

```
nitrocycle/
├── index.html          Entry point + all DOM
├── css/style.css       Pixel-art retro styling
├── js/
│   ├── i18n.js         Translation system (DE/EN)
│   ├── game.js         Main game loop & controller
│   ├── nitrogen.js     Nitrogen pools & transformations
│   ├── plant.js        Plant health/growth
│   ├── events.js       Random events (lightning, drought, …)
│   ├── achievements.js Achievement system
│   ├── tutorial.js     Onboarding walkthrough
│   ├── renderer.js     Canvas pixel-art renderer
│   ├── ui.js           DOM updates / panels / popups
│   ├── audio.js        Procedural sound effects
│   └── assets.js       Asset preloader
└── assets/             Sprites & docs
```

## Tech

Pure vanilla HTML/CSS/JS. Canvas for the world, DOM for HUD. No bundler, no dependencies, no framework.

## Languages

The i18n layer in [js/i18n.js](js/i18n.js) holds all strings in two namespaces (`en`, `de`). The toggle in the top-right re-renders all DOM and canvas labels live, and persists the choice to `localStorage`. Default language is German (event audience).

Chemistry symbols (N₂, NH₄⁺, NO₃⁻, …) and Latin bacteria names (*Rhizobium*, *Nitrosomonas*, …) are intentionally identical in both languages.
