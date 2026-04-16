# NitroCycle - Project Context for Claude

## What is this?
A 2D pixel-art educational game teaching the nitrogen cycle. Built for Austria's *Lange Nacht der Forschung*. Bilingual (DE/EN). Pure vanilla HTML/CSS/JS — no build step, no framework.

## Live site
- **Production**: https://nitrocycle.org (Hetzner VPS, nginx)
- **Netlify mirror**: https://nitrocycle.netlify.app (leaderboard broken there — functions never deployed)

## Deployment
- **Auto-deploy**: `git push origin main` → GitHub webhook → server pulls automatically
- **Server**: Hetzner CX33 at `46.224.66.65`, Ubuntu 24.04
- **Web server**: nginx serving static files from `/var/www/nitrocycle`
- **Leaderboard backend**: standalone Node.js server on port 3001, proxied via nginx at `/api/leaderboard`
- **Leaderboard data**: JSON files in `/var/lib/nitrocycle/` on the server
- **SSL**: Cloudflare (handles TLS on the edge)
- **Note**: SSH to the server is blocked from Claude Code sandbox — deploy via git push or run commands on the server directly

## Architecture
```
index.html          Entry point + all DOM
css/style.css       Pixel-art retro styling
js/
  i18n.js           Translation system (DE/EN), all strings keyed
  game.js           Main game loop, state machine, cooldowns, keyboard, pause, leaderboard UI
  nitrogen.js       7 nitrogen pools + transformation rates
  plant.js          Plant health/growth, toxicity, starvation
  events.js         14 random events with i18n keys
  achievements.js   8 achievements, localStorage-persisted
  tutorial.js       Onboarding walkthrough
  renderer.js       Canvas pixel-art world (largest file)
  ui.js             DOM HUD updates, panels, popups
  audio.js          Procedural WebAudio sound effects
  assets.js         Sprite preloader
  leaderboard.js    Client-side leaderboard API calls
netlify/functions/  Netlify Functions backend (not used on Hetzner)
server/             Standalone Node.js leaderboard (Hetzner only, created by deploy script)
deploy-hetzner.sh   One-command server setup script
```

## Key design patterns
- **i18n is pervasive**: event/plant/achievement messages use `msgKey` + `msgVars` for live re-localization on language switch. Chemistry symbols and Latin bacteria names are language-agnostic.
- **Modal system**: `Game.openModal(id)` / `Game.closeModal(id)` with a stack. First open soft-pauses gameplay; last close resumes.
- **Speed toggle**: `Game.speedMultiplier` scales delta in `animate()`. Cooldowns and day timer all use the same scaled delta.

## Known issues / TODOs
- **¼× speed button shows but may not work**: The button was added to HTML and JS validation updated, but browser cache may serve stale JS. Hard refresh (`Cmd+Shift+R`) should fix it. If it still doesn't work, debug `setupSpeedToggle()` in `game.js` — check that `parseFloat(btn.getAttribute('data-speed'))` returns 0.25 and the `if` guard accepts it.
- **Leaderboard on Netlify**: Netlify site was using manual deploys which skip functions. Added `netlify.toml` but the site needs a proper CI build (git-connected) to deploy functions. The Hetzner deployment has a working standalone leaderboard.
- **Leaderboard medals**: Top 3 entries show gold/silver/bronze emoji. Winners (grew tree to stage 4) are prioritized above non-winners via `won` flag, and get a tree badge.

## Session notes (2026-04-16)
Changes made:
1. **Pause overlay**: Changed from fullscreen blackout to compact floating card so game is visible while paused (`css/style.css` `#pause-overlay`)
2. **Help z-index**: Raised `#cycle-diagram` to `z-index: 2500` (above pause overlay's 2000) so N-CYCLE HELP works from pause menu
3. **Leaderboard backend**: Added `netlify.toml` for Netlify builds + standalone Node.js server for Hetzner
4. **Winner prioritization**: Entries store `won` flag; sort winners above non-winners; top 3 get medals
5. **¼× speed**: Added quarter-speed button to speed toggle
6. **Hetzner deploy**: Full deploy script, nginx config, systemd service, GitHub webhook auto-deploy
