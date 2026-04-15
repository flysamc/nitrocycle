# Economy Rebalance + Speed Control Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Loosen money pressure (~+$80 per 12-day Normal run), make cleanup 38% more effective, and add a global ½× / 1× / 2× speed multiplier so first-time players have time to think.

**Architecture:** Number tweaks in `js/game.js` for income/cleanup/heal cost; one block in `js/renderer.js` for manure→coin; new `Game.speedMultiplier` scaling `delta` once in the animation loop so day timer, cooldowns, and animations slow/speed in lockstep (cheat-resistant); new 3-button header pill cloned from the language toggle pattern.

**Tech Stack:** Vanilla HTML/CSS/JS — no build step. Verification via `preview_start` (Node http server in `.claude/launch.json`) + `preview_eval`/`preview_screenshot`.

**Reference design:** [docs/plans/2026-04-15-economy-rebalance-and-speed-control-design.md](2026-04-15-economy-rebalance-and-speed-control-design.md)

---

## Pre-flight

### Task 0: Branch + preview server up

**Step 1: Create feature branch**

Run: `cd /Users/rahulsamrat/Desktop/Projects/nitrocycle && git checkout -b feature/economy-and-speed`
Expected: `Switched to a new branch 'feature/economy-and-speed'`

**Step 2: Confirm preview server is running**

Run: `mcp__Claude_Preview__preview_list`
Expected: A server with name `nitrocycle-v4` running on port 8787 (the existing one). If none, start with `preview_start name="nitrocycle-v4"`.

**Step 3: Confirm baseline**

`preview_eval`: `({ income: 'check via game', files: 'js/game.js js/renderer.js' })` — visual sanity check that the page loads without errors.

---

## Part A: Economy rebalance (5 small numeric changes)

### Task 1: End-of-day income $3 → $4

**Files:**
- Modify: `js/game.js:1203`

**Step 1: Find the line**

Run: `grep -n "this.money += 3" /Users/rahulsamrat/Desktop/Projects/nitrocycle/js/game.js`
Expected: one match, around line 1203, with the comment `// Less income = harder choices`

**Step 2: Edit**

Replace exactly:
```js
        this.money += 3;  // Less income = harder choices
```
With:
```js
        // Bumped from +$3 → +$4 to reduce mid-game money pressure (rebalance design 2026-04-15)
        this.money += 4;
```

**Step 3: Reload preview and verify**

`preview_eval`: `Game.money` before and after a manual `Game.completeDay()` call (subtract pre-day money to confirm +$4 net).

**Step 4: Commit**

```bash
git add js/game.js
git commit -m "balance: end-of-day income +$3 → +$4 to ease money pressure"
```

---

### Task 2: CLEAN WATER 40% → 55%

**Files:**
- Modify: `js/game.js:845` (the `case 'cleanWater':` block)

**Step 1: Find the line**

Run: `grep -n "Nitrogen.pools.leached \* 0.4" /Users/rahulsamrat/Desktop/Projects/nitrocycle/js/game.js`
Expected: one match around line 845.

**Step 2: Edit**

Replace exactly:
```js
                const reduced = Math.floor(Nitrogen.pools.leached * 0.4);
```
With:
```js
                // 40% → 55%: cleanup needs to outpace re-leaching for the
                // shop button to feel useful (rebalance design 2026-04-15)
                const reduced = Math.floor(Nitrogen.pools.leached * 0.55);
```

**Step 3: Verify in preview**

`preview_eval`: set `Nitrogen.pools.leached = 100`; click `#btn-clean-water`; confirm `Nitrogen.pools.leached === 45` (was 60).

**Step 4: Commit**

```bash
git add js/game.js
git commit -m "balance: CLEAN WATER cleanup 40% → 55%"
```

---

### Task 3: SCRUB ATMO 40% → 55%

**Files:**
- Modify: `js/game.js` `case 'scrubAtmo':` block

**Step 1: Find the line**

Run: `grep -n "Nitrogen.pools.n2o \* 0.4" /Users/rahulsamrat/Desktop/Projects/nitrocycle/js/game.js`
Expected: one match.

**Step 2: Edit**

Replace exactly:
```js
                const reduced = Math.floor(Nitrogen.pools.n2o * 0.4);
```
With:
```js
                // 40% → 55%: see CLEAN WATER comment above
                const reduced = Math.floor(Nitrogen.pools.n2o * 0.55);
```

**Step 3: Verify in preview**

`preview_eval`: set `Nitrogen.pools.n2o = 50`; click `#btn-scrub-atmo`; confirm n2o = 23 (was 30).

**Step 4: Commit**

```bash
git add js/game.js
git commit -m "balance: SCRUB ATMO cleanup 40% → 55%"
```

---

### Task 4: HEAL base cost $20 → $18

**Files:**
- Modify: `js/game.js:885` (the `case 'emergencyHeal':` block — first line that computes `cost`)

**Step 1: Find the line**

Run: `grep -n "const cost = 20 + Math.floor" /Users/rahulsamrat/Desktop/Projects/nitrocycle/js/game.js`
Expected: one match in `case 'emergencyHeal':`.

**Step 2: Edit**

Replace exactly:
```js
                const cost = 20 + Math.floor(this.day / 5) * 5;
```
With:
```js
                // $20 → $18 base; inflation curve unchanged (+$5 every 5 days)
                const cost = 18 + Math.floor(this.day / 5) * 5;
```

**Step 3: Verify in preview**

`preview_eval`: `Game.day = 1; UI.updateShopButtons(Game.money, Game.day); document.querySelector('#btn-emergency-heal .shop-cost').textContent` — expect `$18`.

**Step 4: Commit**

```bash
git add js/game.js
git commit -m "balance: HEAL base cost $20 → $18"
```

---

### Task 5: Manure drops give +$1

**Files:**
- Modify: `js/renderer.js` inside `_updateFarmAnimals`, in the block that handles `a.poopTimer <= 0`.

**Step 1: Find the location**

Run: `grep -n "Add organic nitrogen to the soil" /Users/rahulsamrat/Desktop/Projects/nitrocycle/js/renderer.js`
Expected: one match.

**Step 2: Edit**

Find this block:
```js
                if (window.Nitrogen && Nitrogen.pools && Nitrogen.maxValues) {
                    const add = a.type === 'cow' ? 4 : a.type === 'sheep' ? 3 : 2;
                    Nitrogen.pools.organic = Math.min(
                        (Nitrogen.pools.organic || 0) + add,
                        Nitrogen.maxValues.organic
                    );
                    if (window.UI && UI.showFloatingNumber) {
                        const tr = (typeof window.t === 'function') ? window.t : (k, v) => `+${v.amount} organic`;
                        UI.showFloatingNumber(tr('farm.manure.float', { amount: add }), 'good');
                    }
                }
```

Add ONE block immediately after the `if (window.UI ...)` block, still inside the outer if:
```js
                    // Each manure pile also drops a single coin — light passive
                    // income to ease money pressure without trivializing the
                    // shop (rebalance design 2026-04-15).
                    if (window.Game) {
                        Game.money = (Game.money || 0) + 1;
                    }
```

**Step 3: Verify in preview**

`preview_eval`: snapshot money, force `Renderer.farmAnimals[0].poopTimer = 0; Renderer._updateFarmAnimals(0.1)`, confirm money is +1.

**Step 4: Commit**

```bash
git add js/renderer.js
git commit -m "balance: manure drops also give +\$1 (passive income)"
```

---

### Task 6: Update CLEAN WATER + SCRUB ATMO tooltips (EN + DE)

**Files:**
- Modify: `js/i18n.js` — 4 strings (2 keys × 2 languages)

**Step 1: Find the lines**

Run: `grep -n "shop.cleanWater.tip\|shop.scrubAtmo.tip" /Users/rahulsamrat/Desktop/Projects/nitrocycle/js/i18n.js`
Expected: 4 matches (en + de × 2 keys).

**Step 2: Edit EN**

Replace:
```js
        'shop.cleanWater.tip': 'Reduce leached NO₃⁻ by 40%. Cleans polluted groundwater.',
```
With:
```js
        'shop.cleanWater.tip': 'Reduce leached NO₃⁻ by 55%. Cleans polluted groundwater.',
```

Replace:
```js
        'shop.scrubAtmo.tip': 'Reduce N₂O by 40% and cool temperature by 2°C.',
```
With:
```js
        'shop.scrubAtmo.tip': 'Reduce N₂O by 55% and cool temperature by 2°C.',
```

**Step 3: Edit DE**

Replace:
```js
        'shop.cleanWater.tip': 'Senkt ausgewaschenes NO₃⁻ um 40%. Reinigt das Grundwasser.',
```
With:
```js
        'shop.cleanWater.tip': 'Senkt ausgewaschenes NO₃⁻ um 55%. Reinigt das Grundwasser.',
```

Replace:
```js
        'shop.scrubAtmo.tip': 'Senkt N₂O um 40% und kühlt um 2°C.',
```
With:
```js
        'shop.scrubAtmo.tip': 'Senkt N₂O um 55% und kühlt um 2°C.',
```

**Step 4: Verify in preview**

`preview_eval`: hover over `#btn-clean-water`, read `.getAttribute('data-tooltip')` → should contain "55%".

**Step 5: Commit**

```bash
git add js/i18n.js
git commit -m "i18n: update CLEAN WATER + SCRUB ATMO tooltips for new 55% values"
```

---

## Part B: Speed control

### Task 7: Add `Game.speedMultiplier` and scale delta

**Files:**
- Modify: `js/game.js` — top of the `Game` object (add property), and `startLoop()` (apply scaling).

**Step 1: Add property**

Find `lastFrameTime: 0,` near the top of `const Game = {`. Add immediately after:
```js
    // Global time scaling (½× / 1× / 2×). Multiplies delta in animate(),
    // so day timer, cooldowns, and animations all slow/speed together.
    // Persisted to localStorage as `nitrocycle_speed`.
    speedMultiplier: 1.0,
```

**Step 2: Scale delta in animate()**

Run: `grep -n "this._lastFrameDelta = delta;" /Users/rahulsamrat/Desktop/Projects/nitrocycle/js/game.js`
Expected: one match in `startLoop` `animate`.

Replace:
```js
            // Expose for renderer (farm-animal animation uses dt)
            this._lastFrameDelta = delta;
```

With:
```js
            // Apply global speed multiplier — does NOT give extra actions per
            // day because cooldowns scale with the same delta (cheat-resistant).
            delta *= (this.speedMultiplier || 1);
            // Expose for renderer (farm-animal animation uses dt)
            this._lastFrameDelta = delta;
```

**Step 3: Verify in preview**

`preview_eval`: `Game.speedMultiplier = 0.5; setTimeout(() => ({ delta: Game._lastFrameDelta }), 200)` — delta should be roughly half what it was at 1×.

**Step 4: Commit**

```bash
git add js/game.js
git commit -m "feat(speed): add Game.speedMultiplier scaling delta in animate()"
```

---

### Task 8: Save/load passthrough for speedMultiplier

**Files:**
- Modify: `js/game.js` `_buildSaveData` and `load` methods

**Step 1: Find _buildSaveData**

Run: `grep -n "_buildSaveData" /Users/rahulsamrat/Desktop/Projects/nitrocycle/js/game.js`
Expected: one method definition.

**Step 2: Add to save payload**

In `_buildSaveData()`, find `dayTimer: this.dayTimer,` and add a sibling line:
```js
            speedMultiplier: this.speedMultiplier || 1,
```

**Step 3: Add to load**

Find the corresponding `this.dayTimer = data.dayTimer || 0;` in `load()`. Add immediately after:
```js
        // Speed setting from save — but localStorage preference (set later
        // by setupSpeedToggle) wins when present, so a returning player
        // gets the speed they last selected, not the speed they saved at.
        if (typeof data.speedMultiplier === 'number') {
            this.speedMultiplier = data.speedMultiplier;
        }
```

**Step 4: Verify in preview**

`preview_eval`: `Game.speedMultiplier = 2; Game.save();` then reload, `Game.load(); Game.speedMultiplier` → 2.

**Step 5: Commit**

```bash
git add js/game.js
git commit -m "feat(speed): persist speedMultiplier in save data"
```

---

### Task 9: Add header speed-pill HTML

**Files:**
- Modify: `index.html` — inside `#header-controls`, before the leaderboard or pause button.

**Step 1: Find the location**

Run: `grep -n "btn-leaderboard" /Users/rahulsamrat/Desktop/Projects/nitrocycle/index.html`
Expected: one button match.

**Step 2: Insert pill**

Immediately after the `#btn-leaderboard` button, add:
```html
                <div id="speed-toggle" class="header-pill" role="group" data-i18n-aria="tip.speed" aria-label="Game speed">
                    <button type="button" class="speed-btn" data-speed="0.5" aria-label="Half speed">½×</button>
                    <button type="button" class="speed-btn active" data-speed="1" aria-label="Normal speed">1×</button>
                    <button type="button" class="speed-btn" data-speed="2" aria-label="Double speed">2×</button>
                </div>
```

**Step 3: Verify in preview**

`preview_eval`: `document.querySelectorAll('#speed-toggle .speed-btn').length` → 3.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat(speed): add ½× / 1× / 2× pill in header"
```

---

### Task 10: Speed-pill CSS

**Files:**
- Modify: `css/style.css` — add styles after the `#lang-toggle` block.

**Step 1: Find anchor**

Run: `grep -n "@media (max-width: 480px)" /Users/rahulsamrat/Desktop/Projects/nitrocycle/css/style.css | head -3`
Expected: the breakpoint that already styles `#lang-toggle .lang-btn`.

**Step 2: Add styles**

Immediately after the closing `}` of `#lang-toggle .lang-flag` (search for that selector), add:
```css

/* ============= SPEED TOGGLE (½× / 1× / 2×) ============= */
#speed-toggle {
    display: inline-flex;
    gap: 2px;
    background: #181425;
    padding: 2px;
    border: 2px solid #f4f4f4;
    box-shadow: 0 3px 0 0 #000;
    font-family: 'Press Start 2P', monospace;
    align-items: center;
}

#speed-toggle .speed-btn {
    font-family: inherit;
    font-size: 8px;
    line-height: 1;
    padding: 4px 6px;
    background: transparent;
    color: #f4f4f4;
    border: 1px solid transparent;
    cursor: pointer;
    transition: background 0.1s, color 0.1s;
}

#speed-toggle .speed-btn:hover {
    background: #3b5dc9;
    color: #feae34;
}

#speed-toggle .speed-btn.active {
    background: #38b764;
    color: #181425;
    border-color: #a7f070;
}

@media (max-width: 480px) {
    #speed-toggle .speed-btn { font-size: 7px; padding: 3px 4px; }
}
```

**Step 3: Verify in preview**

Reload, screenshot, confirm the pill appears next to the 🏆 button styled the same as the language toggle.

**Step 4: Commit**

```bash
git add css/style.css
git commit -m "feat(speed): style header speed pill"
```

---

### Task 11: i18n key for speed tooltip

**Files:**
- Modify: `js/i18n.js` — EN + DE namespaces, near other `tip.*` keys.

**Step 1: EN — add near `tip.leaderboard`**

Find the EN `'tip.leaderboard': 'Leaderboard',` line. Add immediately after:
```js
        'tip.speed': 'Game speed (½× / 1× / 2×)',
```

**Step 2: DE — add near `tip.leaderboard`**

Find the DE `'tip.leaderboard': 'Bestenliste',` line. Add immediately after:
```js
        'tip.speed': 'Spielgeschwindigkeit (½× / 1× / 2×)',
```

**Step 3: Verify in preview**

`preview_eval`: `t('tip.speed')` → returns localized string. Toggle DE → check it switched.

**Step 4: Commit**

```bash
git add js/i18n.js
git commit -m "i18n: tip.speed for the new speed toggle"
```

---

### Task 12: Wire click handlers + load saved preference

**Files:**
- Modify: `js/game.js` — add `setupSpeedToggle()` method, call from `init()`, load persisted preference.

**Step 1: Call from init**

Find `this.setupLanguageToggle();` near the end of `init()`. Add immediately after:
```js
        this.setupSpeedToggle();
```

**Step 2: Add the method**

Immediately after the `setupLanguageToggle` method definition (which ends with `if (window.I18N) I18N._refreshToggleUI();`), add:
```js

    setupSpeedToggle() {
        // Load saved preference
        const saved = parseFloat(localStorage.getItem('nitrocycle_speed'));
        if (saved === 0.5 || saved === 1 || saved === 2) {
            this.speedMultiplier = saved;
        }
        // Reflect on UI
        this._refreshSpeedUI();

        document.querySelectorAll('#speed-toggle .speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const v = parseFloat(btn.getAttribute('data-speed'));
                if (v === 0.5 || v === 1 || v === 2) {
                    this.speedMultiplier = v;
                    localStorage.setItem('nitrocycle_speed', String(v));
                    this._refreshSpeedUI();
                    if (typeof Audio !== 'undefined' && Audio.click) Audio.click();
                }
            });
            btn.addEventListener('mouseenter', () => {
                if (typeof Audio !== 'undefined' && Audio.hover) Audio.hover();
            });
        });
    },

    _refreshSpeedUI() {
        document.querySelectorAll('#speed-toggle .speed-btn').forEach(btn => {
            const v = parseFloat(btn.getAttribute('data-speed'));
            btn.classList.toggle('active', v === this.speedMultiplier);
        });
    },
```

**Step 3: Verify in preview**

`preview_eval`: click `½×` button via `document.querySelector('#speed-toggle .speed-btn[data-speed="0.5"]').dispatchEvent(new MouseEvent('click', {bubbles:true}))`. Confirm `Game.speedMultiplier === 0.5` and `localStorage.getItem('nitrocycle_speed') === "0.5"`.

Reload page, confirm `Game.speedMultiplier === 0.5` is restored.

**Step 4: Commit**

```bash
git add js/game.js
git commit -m "feat(speed): wire click handlers + localStorage persistence"
```

---

## Part C: Verification + ship

### Task 13: Full smoke test in preview

**Step 1: Reload, start a Normal game, skip tutorial**

`preview_eval`: 
```js
window.location.reload(); 
// after reload:
document.querySelector(".diff-btn[data-diff='normal']").dispatchEvent(new MouseEvent('click', {bubbles:true}));
if (Tutorial?.complete) Tutorial.complete();
```

**Step 2: Verify economy buffs in one shot**

`preview_eval`:
```js
({
  startMoney: Game.money,
  cleanWaterCost: document.querySelector('#btn-clean-water .shop-cost').textContent,
  healCost: document.querySelector('#btn-emergency-heal .shop-cost').textContent,
})
```
Expected: `startMoney: 30`, `cleanWaterCost: "$35"` (unchanged), `healCost: "$18"`.

**Step 3: Test cleanup math**

`preview_eval`:
```js
Nitrogen.pools.leached = 100;
Game.money = 999;
document.getElementById('btn-clean-water').dispatchEvent(new MouseEvent('click', {bubbles:true}));
({ leached: Nitrogen.pools.leached })
```
Expected: `leached: 45` (100 - 55).

**Step 4: Test manure coin**

`preview_eval`:
```js
const before = Game.money;
Renderer.farmAnimals[0].poopTimer = 0;
Renderer._updateFarmAnimals(0.1);
({ before, after: Game.money, gained: Game.money - before })
```
Expected: gained = 1.

**Step 5: Test speed multiplier**

`preview_eval`:
```js
Game.speedMultiplier = 0.5;
const before = Game.dayTimer;
// wait 500ms
new Promise(r => setTimeout(() => r({
  before, 
  after: Game.dayTimer,
  delta: Game.dayTimer - before
}), 500))
```
Expected: delta is roughly half of what it would be at 1× (i.e. ~250ms not ~500ms).

**Step 6: Test speed UI active state**

`preview_eval`:
```js
document.querySelector('#speed-toggle .speed-btn[data-speed="2"]').dispatchEvent(new MouseEvent('click', {bubbles:true}));
({
  multiplier: Game.speedMultiplier,
  saved: localStorage.getItem('nitrocycle_speed'),
  activeBtn: document.querySelector('#speed-toggle .speed-btn.active').getAttribute('data-speed')
})
```
Expected: `multiplier: 2, saved: "2", activeBtn: "2"`.

**Step 7: Take a screenshot**

`preview_screenshot` to confirm the pill renders correctly next to the 🏆 button.

---

### Task 14: Push branch, open PR for deploy preview

**Step 1: Push**

```bash
git push -u origin feature/economy-and-speed
```

**Step 2: Open PR**

```bash
gh pr create --base main --head feature/economy-and-speed \
  --title "feat: economy rebalance + speed control (½×/1×/2×)" \
  --body "$(cat <<'EOF'
## Summary
Implements [docs/plans/2026-04-15-economy-rebalance-and-speed-control.md](docs/plans/2026-04-15-economy-rebalance-and-speed-control.md).

**Economy:** end-of-day +\$3→+\$4, manure drops +\$1, CLEAN WATER 40%→55%, SCRUB ATMO 40%→55%, HEAL \$20→\$18.

**Speed control:** new ½× / 1× / 2× pill in the header. Scales delta once in animate() so day timer, cooldowns, and animations slow/speed together (cheat-resistant). Persists to localStorage and to save files.

## Test plan
- [ ] Open the deploy preview link below
- [ ] Confirm new ½× / 1× / 2× pill is visible next to 🏆
- [ ] Click ½× — game noticeably slows; click 2× — speeds up
- [ ] Reload — speed setting persists
- [ ] Play a 12-day Normal run; confirm money feels less tight
- [ ] Tooltip on CLEAN WATER says 55%
- [ ] DE/EN translates the speed tooltip

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**Step 3: Wait for deploy preview to be ready**

```bash
sleep 1
for i in 1 2 3 4 5; do
  state=$(curl -s "https://api.netlify.com/api/v1/sites/b7649b17-2244-49b4-a2a6-424fa652e672/deploys?per_page=1" | python3 -c "import sys,json; d=json.load(sys.stdin)[0]; print(f\"{d['state']}|{d['commit_ref'][:7]}\")")
  echo "$state"
  [[ "$state" == ready* ]] && break
  sleep 2
done
```

**Step 4: Hand the preview URL to the user for visual sign-off**

Tell user the URL `https://deploy-preview-N--nitrocycle.netlify.app` and wait for "merge" or specific tweaks.

---

### Task 15: Merge to main and clean up

After user approves:

```bash
cd /Users/rahulsamrat/Desktop/Projects/nitrocycle
git checkout main
git merge feature/economy-and-speed --ff-only
git push origin main
git branch -d feature/economy-and-speed
git push origin --delete feature/economy-and-speed
```

Wait for production deploy:
```bash
sleep 2
curl -s "https://api.netlify.com/api/v1/sites/b7649b17-2244-49b4-a2a6-424fa652e672/deploys?per_page=1" | python3 -c "import sys,json; d=json.load(sys.stdin)[0]; print(d['state'], d['commit_ref'][:7])"
```

Tell user "Live: https://nitrocycle.netlify.app".

---

## Notes for the implementer

- **Each task has its own commit.** Do not batch.
- **The preview server points to `/Users/rahulsamrat/Desktop/Projects/ngame/v4/`, NOT to the new repo.** After each file change, copy the changed file to the v4 dir before reloading the preview, e.g.:
  ```bash
  cp /Users/rahulsamrat/Desktop/Projects/nitrocycle/js/game.js /Users/rahulsamrat/Desktop/Projects/ngame/v4/js/game.js
  ```
- **No formal test framework exists.** Use `preview_eval` to run JS in the page context as the verification step (substitute for unit tests).
- **The speed multiplier is global** — there is only one preference, not one per difficulty. The design's "Open question" section documents what to do if Easy becomes too easy after the buff (single-line `difficultyScale` bump), but **do not** implement that pre-emptively.
- **Reference design:** [docs/plans/2026-04-15-economy-rebalance-and-speed-control-design.md](2026-04-15-economy-rebalance-and-speed-control-design.md)
