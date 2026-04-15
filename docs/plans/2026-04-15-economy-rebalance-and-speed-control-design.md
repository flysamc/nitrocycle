# Economy rebalance + speed control — design

**Date:** 2026-04-15
**Status:** approved
**Audience:** outreach players (Lange Nacht der Forschung), kids and adults

## Problem

Average game length on Normal is ~12 days. Two pain points reported by playtesters:

1. **Money pressure.** Income (~$285 / 12 days) and forced spending (~$260-295 on heals + cleanups + a tree) sit within $30 of each other. One bad random event chain (heatwave + pest attack) drains the buffer and leaves the player unable to afford an emergency HEAL when the plant is dying.
2. **Cleanup ineffectiveness.** CLEAN WATER and SCRUB ATMO each remove only 40% of the offending pollutant, while leaching/N₂O regrows on a per-day basis. Players who can afford cleanup still feel like they're fighting a losing battle.

A third issue (not raised, but mentioned during design): first-time players (especially kids reading translated UI) don't have time to read everything in a 12-second day.

## Goals

- Reduce money pressure by ~25% so one bad event doesn't end the run.
- Make each cleanup dollar buy more pollution reduction.
- Give all players a way to slow down the game without forcing it on experienced players.
- Keep wins feeling earned — don't make the shop a no-thought spam button.

## Non-goals

- No change to plant growth thresholds, win/lose conditions, or random-event frequencies.
- No new game mechanics or systems beyond a global time multiplier.
- No save-file schema migration (the changes only touch numbers and an unrelated multiplier).

## Approach

Two coordinated tweaks, ship together:

### A. Economy rebalance

| Knob | Before | After | File:line |
|---|---|---|---|
| End-of-day income | $3 | $4 | `js/game.js:1203` |
| Manure pile drop bonus | $0 | $1 | `js/renderer.js` `_updateFarmAnimals` |
| CLEAN WATER reduction | 40% leached | 55% leached | `js/game.js:845` |
| SCRUB ATMO reduction | 40% N₂O | 55% N₂O | `js/game.js:859` |
| HEAL base cost | $20 | $18 | `js/game.js:885` |

**Math on a 12-day Normal run:**
- End-of-day: +$12
- Manure passive (5 animals × ~5 poops in 144 s): +$25
- HEAL × 3: -$6 to -$8
- Cleanup needed (better %): -$40
- **Net cash flexibility:** ~+$80 / 12-day run

That's enough for **one extra emergency HEAL or PLANT TREE** per game without making the shop trivial.

### B. Speed control (½× / 1× / 2×)

A single `Game.speedMultiplier` (default 1.0) that scales `delta` in the animation loop:

```js
let delta = now - this.lastFrameTime;
this.lastFrameTime = now;
if (delta > 1000) delta = 1000;
delta *= this.speedMultiplier;   // <-- new
this._lastFrameDelta = delta;
```

Because cooldowns and the day timer both read `delta` from the same source, slowing the game does **not** let the player squeeze in more actions per day — they get the same number of actions, just more wall-clock seconds to think between them. This is the cheat-resistant property that makes the feature safe.

UI: a 3-button pill in the header next to the 🏆 leaderboard button, identical visual style to the language toggle:

```
[ NITROCYCLE ]   [POOLS] [STATUS] [SFX] [BGM] [🏆] [½× 1× 2×] [❚❚] [?]
```

The active speed has the green-on-yellow style; clicking another button switches and persists the choice to `localStorage` as `nitrocycle_speed`.

## Testing checklist

- Play one Normal-difficulty 12-day run at 1× speed; confirm money flexibility feels improved without trivializing.
- Play one Easy run at 1× to check that the buffs haven't tipped Easy into "no decisions."
- Toggle ½× and 2× during a run; verify cooldown timers visibly slow / speed up in lockstep with the day timer.
- Reload the page mid-game; verify the speed setting persists.
- Switch language to DE; verify `tip.speed` tooltip translates.
- Confirm an existing pre-deploy save still loads (no schema change).

## Open question / future work

If post-deploy testing on Easy mode reveals it has become trivial (running away with money), the single-line fix is to bump `difficulties.easy.difficultyScale` from `0.03` to `0.04` in `js/game.js:44`. Don't speculate-fix — wait for actual playtest data first.

## Files touched

- `js/game.js` — five number changes, one multiplier line in animate(), one new setupSpeedToggle() method, save/load passthrough for `speedMultiplier` (so a saved game resumes at the same speed).
- `js/renderer.js` — one block in `_updateFarmAnimals` to add `Game.money += 1` on each manure drop.
- `index.html` — three new buttons inside `#header-controls` for the speed pill.
- `css/style.css` — speed-pill styling (clone the existing `#lang-toggle` rules into `#speed-toggle` selectors, or add a shared `.btn-pill` class).
- `js/i18n.js` — `tip.speed` key in EN + DE.

## Risks

- **Easy too easy after buff** — flagged above, defer fix until playtested.
- **Speed control discoverability** — players might not see the buttons. Mitigation: tooltip "Game speed", and the visual selector matches the language toggle so first-time users will recognize the pattern.
- **Save-file resume at unexpected speed** — if a player saves at 2× and reloads later, do they expect 2× or 1×? Decision: persist in save AND localStorage; localStorage wins so a returning player gets their preferred speed.

## Out of scope (for a follow-up)

- Per-difficulty default speeds (e.g., Easy defaults to ½×).
- Pause-on-action mode (turn-based variant).
- Visual indicator on the canvas showing current speed (overkill).
