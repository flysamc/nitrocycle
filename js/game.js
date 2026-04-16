/**
 * Main Game Controller - Educational Retro Version
 * Complete nitrogen cycle simulation with all processes
 */

const Game = {
    state: 'loading',
    day: 1,
    score: 0,

    // Real-time timer system
    dayDuration: 12000,  // 12 seconds per day (faster pressure)
    dayTimer: 0,
    dayProgress: 0,
    lastFrameTime: 0,

    // Global time scaling (½× / 1× / 2×). Multiplies delta in animate(),
    // so day timer, cooldowns, and animations all slow/speed together.
    // Persisted to localStorage as `nitrocycle_speed`.
    speedMultiplier: 1.0,

    // Action cooldowns (in ms) - longer = more strategic
    cooldowns: {
        fix:       { duration: 4500, remaining: 0 },
        decompose: { duration: 4000, remaining: 0 },
        nitrify1:  { duration: 4000, remaining: 0 },
        nitrify2:  { duration: 4000, remaining: 0 },
        feed:      { duration: 5000, remaining: 0 },
        denitrify: { duration: 4500, remaining: 0 }
    },

    // Dread state tracking (0=off, 1=warning, 2=critical)
    dreadState: {
        atmosphereLevel: 0,
        waterLevel: 0
    },

    // Environment conditions
    moisture: 50,
    oxygen: 60,
    temperature: 20,
    money: 30,

    // Track growth milestones for money bonuses
    lastMilestoneStage: 0,

    // Difficulty settings
    difficulties: {
        easy: { label: 'EASY', dayDuration: 18000, difficultyScale: 0.03, startMoney: 50, cooldownMod: 0.8 },
        normal: { label: 'NORMAL', dayDuration: 12000, difficultyScale: 0.06, startMoney: 30, cooldownMod: 1.0 },
        hard: { label: 'HARD', dayDuration: 9000, difficultyScale: 0.10, startMoney: 20, cooldownMod: 1.3 }
    },
    difficulty: 'normal',

    // Base cooldown durations (modified by difficulty)
    baseCooldowns: {
        fix: 4500, decompose: 4000, nitrify1: 4000, nitrify2: 4000, feed: 5000, denitrify: 4500
    },

    // Stats tracking for educational feedback
    stats: {
        fixed: 0,
        decomposed: 0,
        fed: 0,
        nitrified: 0,
        denitrified: 0,
        n2oProduced: 0,
        leached: 0
    },

    async init() {
        // Load assets first
        const loaded = await Assets.loadAll();

        if (!loaded) {
            console.error('Failed to load assets');
        }

        // Hide loading screen, show difficulty select
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                this.showDifficultySelect();
            }, 500);
        }

        // Initialize systems
        Nitrogen.init();
        Plant.init();
        Renderer.init();
        UI.init();
        Audio.init();

        // Setup button handlers
        this.setupButtons();
        this.setupAudioControls();
        this.setupHelpButton();
        this.setupKeyboardShortcuts();
        this.setupTooltips();
        this.setupDifficultyButtons();
        this.setupPauseMenu();
        this.setupMenuButtons();
        this.setupMobilePanelToggles();
        this.setupLanguageToggle();
        this.setupSpeedToggle();
        this.setupLeaderboard();

        // Initialize tutorial and achievements
        if (typeof Tutorial !== 'undefined') Tutorial.init();
        if (typeof Achievements !== 'undefined') Achievements.init();

        // Load colorblind preference
        this.loadColorblindPref();

        // Move overlay modals out of #game-container so their z-index
        // resolves in the root stacking context. Otherwise they can't
        // render above #difficulty-select on the start screen — the
        // fixed-position #game-container creates its own stacking context
        // that caps anything inside it (cycle diagram, leaderboard, etc.)
        // at the container's own z-index (auto=0), losing to the menu's
        // z-index 1500.
        this._promoteModalsToBody();
    },

    _promoteModalsToBody() {
        ['cycle-diagram', 'name-modal', 'leaderboard-modal', 'overlay', 'info-popup', 'pause-overlay', 'feedback', 'tutorial-overlay', 'floating-nums', 'tooltip']
            .forEach(id => {
                const el = document.getElementById(id);
                if (el && el.parentElement !== document.body) {
                    document.body.appendChild(el);
                }
            });
    },

    showDifficultySelect() {
        const el = document.getElementById('difficulty-select');
        if (el) el.classList.remove('hidden');
    },

    hideDifficultySelect() {
        const el = document.getElementById('difficulty-select');
        if (el) el.classList.add('hidden');
    },

    setupDifficultyButtons() {
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const diff = btn.dataset.diff;
                if (diff && this.difficulties[diff]) {
                    this.difficulty = diff;
                    this.applyDifficulty();
                    this.hideDifficultySelect();
                    this.startPlaying();
                    Audio.click();
                }
            });
        });
    },

    applyDifficulty(setMoney) {
        const config = this.difficulties[this.difficulty];
        this.dayDuration = config.dayDuration;
        if (setMoney !== false) this.money = config.startMoney;

        // Apply cooldown modifier
        for (const [action, base] of Object.entries(this.baseCooldowns)) {
            this.cooldowns[action].duration = Math.round(base * config.cooldownMod);
        }
    },

    startPlaying() {
        // Start game loop
        this.state = 'playing';
        // Reset per-run leaderboard submission state so a new run can
        // submit a fresh score even if a previous run already submitted.
        this._alreadySubmitted = false;
        this.startLoop();

        // Initial update
        this.updateUI();

        UI.addLog(t('log.gameStarted'), 'good');
        UI.addLog(t('log.difficulty', { label: t('log.difficulty.' + this.difficulty) }));
        UI.addLog(t('log.growYourTree'));

        // Start tutorial for new players
        if (typeof Tutorial !== 'undefined' && Tutorial.shouldShow()) {
            setTimeout(() => Tutorial.start(), 1000);
        }
    },

    setupAudioControls() {
        const btnSound = document.getElementById('btn-sound');
        const btnMusic = document.getElementById('btn-music');

        if (btnSound) {
            btnSound.addEventListener('click', () => {
                const enabled = Audio.toggleSound();
                btnSound.classList.toggle('off', !enabled);
                Audio.click();
            });
        }

        if (btnMusic) {
            btnMusic.addEventListener('click', () => {
                const enabled = Audio.toggleMusic();
                btnMusic.classList.toggle('off', !enabled);
                Audio.click();
            });
        }
    },

    setupHelpButton() {
        const btnHelp = document.getElementById('btn-help');
        if (btnHelp) {
            btnHelp.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                UI.showCycleDiagram();
                Audio.click();
            });
        }

        // Also connect the "SHOW N-CYCLE" button on the right panel
        const btnShowCycle = document.getElementById('btn-show-cycle');
        if (btnShowCycle) {
            btnShowCycle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                UI.showCycleDiagram();
                Audio.click();
            });
        }
    },

    setupButtons() {
        // Helper to prevent scroll and blur button after click
        const handleClick = (callback) => (e) => {
            e.preventDefault();
            e.target.blur();
            callback();
        };

        // Main action buttons
        UI.elements.btnFix.addEventListener('click', handleClick(() => this.doAction('fix')));
        UI.elements.btnDecompose.addEventListener('click', handleClick(() => this.doAction('decompose')));
        UI.elements.btnFeed.addEventListener('click', handleClick(() => this.doAction('feed')));
        UI.elements.btnRestart.addEventListener('click', handleClick(() => {
            Audio.click();
            this.restart();
        }));

        // Nitrification and denitrification buttons
        if (UI.elements.btnNitrify1) {
            UI.elements.btnNitrify1.addEventListener('click', handleClick(() => this.doAction('nitrify1')));
        }
        if (UI.elements.btnNitrify2) {
            UI.elements.btnNitrify2.addEventListener('click', handleClick(() => this.doAction('nitrify2')));
        }
        if (UI.elements.btnDenitrify) {
            UI.elements.btnDenitrify.addEventListener('click', handleClick(() => this.doAction('denitrify')));
        }

        // Shop buttons (free actions, cost money)
        const shopBtns = {
            'btn-clean-water': () => this.doShop('cleanWater'),
            'btn-scrub-atmo': () => this.doShop('scrubAtmo'),
            'btn-plant-tree': () => this.doShop('plantTree'),
            'btn-emergency-heal': () => this.doShop('emergencyHeal')
        };
        for (const [id, cb] of Object.entries(shopBtns)) {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', handleClick(cb));
            }
        }

        // Add hover sounds to all buttons
        document.querySelectorAll('.action-btn, .icon-btn, #btn-restart, .info-btn, .shop-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => Audio.hover());
        });
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const key = e.key.toLowerCase();

            // Save/Load — only during an active game to avoid saving garbage
            // state from the menu screen.
            if (e.ctrlKey || e.metaKey) {
                if (key === 's' && (this.state === 'playing' || this.state === 'paused' || this.state === 'modal')) {
                    e.preventDefault();
                    this.save();
                    return;
                } else if (key === 'l' && this.state !== 'loading') {
                    e.preventDefault();
                    this.load();
                    return;
                }
            }

            // Pause/resume works from playing, paused, or modal state
            if (key === 'p' || key === 'escape') {
                // Escape always closes the top modal first (cycle, info, etc.)
                if (key === 'escape' && this._modalStack && this._modalStack.length > 0) {
                    e.preventDefault();
                    const top = this._modalStack[this._modalStack.length - 1];
                    if (top === 'cycleDiagram') UI.hideCycleDiagram();
                    else if (top === 'poolInfo') UI.hidePoolInfo();
                    else if (top === 'leaderboard') this.closeLeaderboard();
                    else if (top === 'nameEntry') this.closeNameModal();
                    return;
                }
                if (this.state === 'playing') {
                    e.preventDefault();
                    if (key === 'p') this.pause();
                    return;
                } else if (this.state === 'paused') {
                    e.preventDefault();
                    this.resume();
                    return;
                }
            }

            // Everything below only works when playing
            if (this.state !== 'playing') return;

            const keyMap = {
                '1': 'fix',
                '2': 'decompose',
                '3': 'nitrify1',
                '4': 'nitrify2',
                '5': 'feed',
                '6': 'denitrify'
            };

            if (keyMap[e.key]) {
                e.preventDefault();
                this.doAction(keyMap[e.key]);
                return;
            }

            switch (key) {
                case 'h':
                    e.preventDefault();
                    UI.showCycleDiagram();
                    Audio.click();
                    break;
                case 'c':
                    e.preventDefault();
                    this.cycleColorblindMode();
                    break;
                case 'm':
                    e.preventDefault();
                    const musicEnabled = Audio.toggleMusic();
                    const btnMusic = document.getElementById('btn-music');
                    if (btnMusic) btnMusic.classList.toggle('off', !musicEnabled);
                    Audio.click();
                    break;
                case 'n':
                    e.preventDefault();
                    const sfxEnabled = Audio.toggleSound();
                    const btnSound = document.getElementById('btn-sound');
                    if (btnSound) btnSound.classList.toggle('off', !sfxEnabled);
                    break;
            }
        });
    },

    setupLanguageToggle() {
        document.querySelectorAll('#lang-toggle .lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const code = btn.getAttribute('data-lang');
                if (code && window.setLang) {
                    window.setLang(code);
                    if (typeof Audio !== 'undefined' && Audio.click) Audio.click();
                }
            });
        });
        // Mark the active button on initial load
        if (window.I18N) I18N._refreshToggleUI();
    },

    setupSpeedToggle() {
        // Load saved preference
        const saved = parseFloat(localStorage.getItem('nitrocycle_speed'));
        if (saved === 0.25 || saved === 0.5 || saved === 1 || saved === 2) {
            this.speedMultiplier = saved;
        }
        // Reflect on UI
        this._refreshSpeedUI();

        document.querySelectorAll('#speed-toggle .speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const v = parseFloat(btn.getAttribute('data-speed'));
                if (v === 0.25 || v === 0.5 || v === 1 || v === 2) {
                    this.speedMultiplier = v;
                    localStorage.setItem('nitrocycle_speed', String(v));
                    this._refreshSpeedUI();
                    if (typeof Audio !== 'undefined' && Audio.click) Audio.click();
                }
            });
        });
    },

    _refreshSpeedUI() {
        document.querySelectorAll('#speed-toggle .speed-btn').forEach(btn => {
            const v = parseFloat(btn.getAttribute('data-speed'));
            btn.classList.toggle('active', v === this.speedMultiplier);
        });
    },

    // ========== LEADERBOARD ==========
    // Three modal flows:
    //   - menu "🏆 LEADERBOARD" button     -> openLeaderboard()
    //   - game-over "🏆 LEADERBOARD" button -> openLeaderboard()
    //   - game-over "🏆 SAVE MY SCORE"      -> openNameModal() -> submit -> openLeaderboard()
    // The save-score button is only shown after a WIN (not on death).
    setupLeaderboard() {
        const menuBtn = document.getElementById('menu-leaderboard');
        const overBtn = document.getElementById('btn-view-leaderboard');
        const saveBtn = document.getElementById('btn-save-score');
        const headerBtn = document.getElementById('btn-leaderboard');
        const claimBtn = document.getElementById('lb-claim-top');
        const closeBtn = document.getElementById('lb-close');
        const tabs = document.querySelectorAll('#leaderboard-modal .lb-tab');
        const submitBtn = document.getElementById('name-submit');
        const cancelBtn = document.getElementById('name-cancel');
        const nameInput = document.getElementById('name-input');

        // Shared handler guard
        const safeHandle = (fn) => (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            fn();
        };

        if (menuBtn) menuBtn.addEventListener('click', safeHandle(() => {
            this.openLeaderboard(this.difficulty || 'normal');
            Audio.click();
        }));
        if (overBtn) overBtn.addEventListener('click', safeHandle(() => {
            this.openLeaderboard(this.difficulty || 'normal');
            Audio.click();
        }));
        if (headerBtn) headerBtn.addEventListener('click', safeHandle(() => {
            this.openLeaderboard(this.difficulty || 'normal');
            Audio.click();
        }));
        if (saveBtn) saveBtn.addEventListener('click', safeHandle(() => {
            this.openNameModal();
            Audio.click();
        }));
        if (claimBtn) claimBtn.addEventListener('click', safeHandle(() => {
            this.openNameModal();
            Audio.click();
        }));
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeLeaderboard());
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this._loadLeaderboard(tab.getAttribute('data-diff'));
            });
        });
        if (submitBtn) submitBtn.addEventListener('click', () => this._submitScore());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeNameModal());
        if (nameInput) {
            nameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this._submitScore();
                }
            });
        }

        // Pre-fill saved username
        if (nameInput && window.Leaderboard) {
            nameInput.value = Leaderboard.savedName;
        }
    },

    openLeaderboard(initialDiff) {
        const modal = document.getElementById('leaderboard-modal');
        if (!modal) return;
        // Highlight the requested tab
        document.querySelectorAll('#leaderboard-modal .lb-tab').forEach(t => {
            t.classList.toggle('active', t.getAttribute('data-diff') === initialDiff);
        });
        modal.classList.remove('hidden');
        if (this.openModal) this.openModal('leaderboard');
        this._loadLeaderboard(initialDiff);
    },

    closeLeaderboard() {
        const modal = document.getElementById('leaderboard-modal');
        if (modal) modal.classList.add('hidden');
        if (this.closeModal) this.closeModal('leaderboard');
        Audio.click();
    },

    async _loadLeaderboard(diff, highlightTimestamp) {
        const status = document.getElementById('lb-status');
        const table = document.getElementById('lb-table');
        const tbody = document.getElementById('lb-tbody');
        const footer = document.getElementById('lb-footer');
        const footerNote = document.getElementById('lb-footer-note');
        if (!status || !table || !tbody) return;

        // Reset to loading state
        status.classList.remove('error', 'hidden');
        status.classList.remove('hidden');
        status.textContent = t('lb.loading');
        table.classList.add('hidden');
        if (footer) footer.classList.add('hidden');
        tbody.innerHTML = '';

        // Remember which tab we're showing — the claim button uses this to
        // decide which difficulty to submit to (may differ from the current
        // game's difficulty, e.g. player is viewing HARD board during a
        // NORMAL run — we still submit to the run's actual difficulty).
        this._currentLbTab = diff;

        try {
            const data = await Leaderboard.fetch(diff);
            const entries = data.entries || [];
            if (entries.length === 0) {
                status.textContent = t('lb.empty');
            } else {
                const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}']; // gold, silver, bronze
                entries.forEach((e, i) => {
                    const tr = document.createElement('tr');
                    if (highlightTimestamp && e.timestamp === highlightTimestamp) {
                        tr.classList.add('you');
                    }
                    if (e.won) tr.classList.add('lb-winner');
                    const escape = (s) => String(s).replace(/[&<>"']/g, c => (
                        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
                    ));
                    const medal = i < 3 ? medals[i] : '';
                    const wonBadge = e.won ? ' <span class="lb-won-badge" title="Winner">\u{1F333}</span>' : '';
                    tr.innerHTML =
                        `<td class="lb-col-rank">${medal || (i + 1)}</td>` +
                        `<td class="lb-col-name">${escape(e.name)}${wonBadge}</td>` +
                        `<td class="lb-col-score">${e.score}</td>` +
                        `<td class="lb-col-days">${e.days}</td>`;
                    tbody.appendChild(tr);
                });
                status.classList.add('hidden');
                table.classList.remove('hidden');
            }

            // --- Eligibility for "Claim top spot" ---
            // Show the claim footer when:
            //   - the player has played (score > 0)
            //   - the viewed tab matches the current run's difficulty
            //     (you can only submit to the mode you're actually playing)
            //   - AND (board is empty OR player's score > current #1 score)
            // The save-score button on the game-over screen already covers
            // the win flow, so we also hide the claim button after a
            // successful submit by tracking an _alreadySubmitted flag.
            if (footer && footerNote) {
                const playerScore = this.score || 0;
                const playerDiff = this.difficulty || 'normal';
                const topEntry = entries[0] || null;
                const beatsTop = !topEntry || playerScore > topEntry.score;
                const eligible = playerScore > 0
                    && diff === playerDiff
                    && beatsTop
                    && !this._alreadySubmitted;

                if (eligible) {
                    footerNote.textContent = topEntry
                        ? t('lb.beatsTop', { score: playerScore })
                        : t('lb.beFirst');
                    footer.classList.remove('hidden');
                } else {
                    footer.classList.add('hidden');
                }
            }
        } catch (err) {
            status.classList.add('error');
            status.textContent = err.offline ? t('lb.error.offline') : t('lb.error.network');
            if (footer) footer.classList.add('hidden');
        }
    },

    openNameModal() {
        const modal = document.getElementById('name-modal');
        const input = document.getElementById('name-input');
        const errEl = document.getElementById('name-modal-error');
        if (!modal) return;
        if (errEl) errEl.textContent = '';
        if (input) {
            if (!input.value && window.Leaderboard) input.value = Leaderboard.savedName;
            modal.classList.remove('hidden');
            // Focus next tick so the modal animation doesn't eat the focus
            setTimeout(() => input.focus(), 50);
        } else {
            modal.classList.remove('hidden');
        }
        if (this.openModal) this.openModal('nameEntry');
    },

    closeNameModal() {
        const modal = document.getElementById('name-modal');
        if (modal) modal.classList.add('hidden');
        if (this.closeModal) this.closeModal('nameEntry');
    },

    async _submitScore() {
        const input = document.getElementById('name-input');
        const errEl = document.getElementById('name-modal-error');
        const submitBtn = document.getElementById('name-submit');
        if (!input || !errEl) return;

        const name = input.value.trim();
        if (!name) {
            errEl.textContent = t('name.error.empty');
            return;
        }

        errEl.textContent = '';
        submitBtn.disabled = true;
        submitBtn.textContent = t('name.saving');

        try {
            Leaderboard.setSavedName(name);
            const result = await Leaderboard.submit({
                name,
                score: this.score,
                days: this.day,
                difficulty: this.difficulty || 'normal',
                won: this.state === 'won'
            });
            Audio.goodEvent();
            this.closeNameModal();
            // Mark this run as submitted so the claim-top-spot footer hides
            this._alreadySubmitted = true;
            // Hide the save-score button so they can't re-submit
            const saveBtn = document.getElementById('btn-save-score');
            if (saveBtn) saveBtn.classList.add('hidden');
            // Open leaderboard with the new entry highlighted
            this.openLeaderboard(this.difficulty || 'normal');
            // Re-load with their timestamp so the new row gets highlighted
            this._loadLeaderboard(this.difficulty || 'normal', result.entry?.timestamp);
        } catch (err) {
            errEl.textContent = err.offline ? t('name.error.offline') : t('name.error.network');
            Audio.error();
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = t('name.submit');
        }
    },

    setupTooltips() {
        const tooltip = document.getElementById('tooltip');
        if (!tooltip) return;

        document.querySelectorAll('[data-tooltip]').forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                tooltip.textContent = el.getAttribute('data-tooltip');
                tooltip.style.display = 'block';
                // Position near the element, above it
                const rect = el.getBoundingClientRect();
                let left = rect.left + rect.width / 2 - 110;
                let top = rect.top - 8;
                // Keep within viewport
                left = Math.max(8, Math.min(left, window.innerWidth - 228));
                // If no room above, show below
                if (top < 60) {
                    top = rect.bottom + 8;
                } else {
                    top = rect.top - tooltip.offsetHeight - 8;
                }
                tooltip.style.left = left + 'px';
                tooltip.style.top = top + 'px';
            });
            el.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
        });
    },

    // ========== PAUSE SYSTEM ==========
    setupPauseMenu() {
        const btnPause = document.getElementById('btn-pause');
        if (btnPause) {
            btnPause.addEventListener('click', () => {
                if (this.state === 'playing') this.pause();
                else if (this.state === 'paused') this.resume();
            });
        }

        const btnResume = document.getElementById('pause-resume');
        const btnSave = document.getElementById('pause-save');
        const btnLoad = document.getElementById('pause-load');
        const btnHelp = document.getElementById('pause-help');
        const btnQuit = document.getElementById('pause-quit');

        if (btnResume) btnResume.addEventListener('click', () => this.resume());
        if (btnSave) btnSave.addEventListener('click', () => {
            this.save();
        });
        if (btnLoad) btnLoad.addEventListener('click', () => {
            if (this.load()) this.resume();
        });
        if (btnHelp) btnHelp.addEventListener('click', () => {
            // Keep the pause menu active; just stack the diagram on top.
            // Game stays fully frozen because state remains 'paused'.
            UI.showCycleDiagram();
        });
        if (btnQuit) btnQuit.addEventListener('click', () => {
            this.resume();
            this.restart();
        });

        // NOTE: Ctrl+S / Ctrl+L are handled in setupKeyboardShortcuts so we
        // only register one keydown listener on document.

        // Add hover sounds to pause menu buttons
        document.querySelectorAll('.pause-menu-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => Audio.hover());
        });
    },

    pause() {
        if (this.state !== 'playing') return;
        this.state = 'paused';
        const overlay = document.getElementById('pause-overlay');
        if (overlay) overlay.classList.remove('hidden');
        Audio.click();
    },

    resume() {
        if (this.state !== 'paused') return;
        // If any modal is still open on top of the pause menu, keep it suspended
        if (this._modalStack && this._modalStack.length > 0) {
            this.state = 'modal';
        } else {
            this.state = 'playing';
        }
        this.lastFrameTime = performance.now(); // Prevent huge delta after unpause
        const overlay = document.getElementById('pause-overlay');
        if (overlay) overlay.classList.add('hidden');
        Audio.click();
    },

    // ========== UNIFIED MODAL SYSTEM ==========
    // Any overlay (cycle diagram, pool info, tutorial, game over) calls
    // Game.openModal(id) when shown and Game.closeModal(id) when hidden.
    // First open freezes gameplay (soft pause, no overlay UI).
    // Last close resumes — unless the user was already in the pause menu.
    _modalStack: [],

    openModal(id) {
        if (!id) return;
        if (this._modalStack.indexOf(id) === -1) {
            this._modalStack.push(id);
        }
        // Soft-pause gameplay on first modal
        if (this.state === 'playing' && this._modalStack.length === 1) {
            this.state = 'modal';
        }
    },

    closeModal(id) {
        if (!id) return;
        const idx = this._modalStack.indexOf(id);
        if (idx !== -1) this._modalStack.splice(idx, 1);
        // Resume only if the stack is empty and we were in soft-pause
        if (this._modalStack.length === 0 && this.state === 'modal') {
            this.state = 'playing';
            this.lastFrameTime = performance.now();
        }
    },

    // ========== MOBILE PANEL DRAWERS ==========
    // On phones the side panels are hidden by default and opened as drawers.
    // POOLS opens the left panel, STATUS opens the right. Tapping either
    // again (or the opposite button, or outside) closes.
    setupMobilePanelToggles() {
        const btnPools = document.getElementById('btn-toggle-pools');
        const btnStatus = document.getElementById('btn-toggle-status');
        const left = document.getElementById('left-panel');
        const right = document.getElementById('right-panel');

        const closeAll = () => {
            if (left) left.classList.remove('open');
            if (right) right.classList.remove('open');
            if (btnPools) btnPools.classList.remove('active');
            if (btnStatus) btnStatus.classList.remove('active');
        };

        const toggle = (panel, btn, other, otherBtn) => {
            if (!panel) return;
            const willOpen = !panel.classList.contains('open');
            // Close the other drawer first
            if (other) other.classList.remove('open');
            if (otherBtn) otherBtn.classList.remove('active');
            panel.classList.toggle('open', willOpen);
            if (btn) btn.classList.toggle('active', willOpen);
            if (typeof Audio !== 'undefined' && Audio.click) Audio.click();
        };

        if (btnPools) {
            btnPools.addEventListener('click', (e) => {
                e.preventDefault();
                toggle(left, btnPools, right, btnStatus);
            });
        }
        if (btnStatus) {
            btnStatus.addEventListener('click', (e) => {
                e.preventDefault();
                toggle(right, btnStatus, left, btnPools);
            });
        }

        // Tap outside an open drawer closes it
        document.addEventListener('click', (e) => {
            // Only react when a drawer is open
            const anyOpen = (left && left.classList.contains('open')) ||
                            (right && right.classList.contains('open'));
            if (!anyOpen) return;
            // Ignore clicks on the drawers themselves or their triggers
            if (e.target.closest('#left-panel, #right-panel, #btn-toggle-pools, #btn-toggle-status')) return;
            closeAll();
        });
    },

    // ========== MAIN MENU BUTTONS ==========
    setupMenuButtons() {
        const menuHelp = document.getElementById('menu-help');
        const menuLoad = document.getElementById('menu-load');

        // preventDefault + stopPropagation so no parent handler (e.g. the
        // mobile-drawer "click outside" document listener) can swallow the
        // click before our handler runs. blur() so pressing Enter/Space
        // later doesn't re-trigger the button from keyboard focus.
        const safeHandle = (fn) => (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.currentTarget && e.currentTarget.blur) e.currentTarget.blur();
            fn();
        };

        if (menuHelp) {
            menuHelp.addEventListener('click', safeHandle(() => {
                Audio.click();
                UI.showCycleDiagram();
            }));
        }

        if (menuLoad) {
            menuLoad.addEventListener('click', safeHandle(() => {
                Audio.click();
                this.load();
            }));
        }

        // Add hover sounds
        document.querySelectorAll('.diff-action-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => Audio.hover());
        });
    },

    doShop(action) {
        if (this.state !== 'playing') return;

        switch (action) {
            case 'cleanWater': {
                const cost = 35 + Math.floor(this.day / 5) * 5; // Inflation!
                if (this.money < cost) {
                    UI.showFeedback(t('feedback.notEnoughCoins'), t('feedback.needCost', { cost }));
                    Audio.error();
                    return;
                }
                this.money -= cost;
                // 40% → 55%: cleanup needs to outpace re-leaching for the
                // shop button to feel useful (rebalance design 2026-04-15)
                const reduced = Math.floor(Nitrogen.pools.leached * 0.55);
                Nitrogen.pools.leached -= reduced;
                UI.addLog(t('log.cleanWater', { amount: reduced }), 'good');
                UI.showFeedback(t('feedback.waterCleaned'), t('feedback.waterCleaned.detail', { amount: reduced }));
                Audio.goodEvent();
                break;
            }
            case 'scrubAtmo': {
                const cost = 40 + Math.floor(this.day / 5) * 5;
                if (this.money < cost) {
                    UI.showFeedback(t('feedback.notEnoughCoins'), t('feedback.needCost', { cost }));
                    Audio.error();
                    return;
                }
                this.money -= cost;
                // 40% → 55%: see CLEAN WATER comment above
                const reduced = Math.floor(Nitrogen.pools.n2o * 0.55);
                Nitrogen.pools.n2o -= reduced;
                this.temperature = Math.max(20, this.temperature - 2);
                UI.addLog(t('log.scrubAtmo', { amount: reduced }), 'good');
                UI.showFeedback(t('feedback.atmoScrubbed'), t('feedback.atmoScrubbed.detail', { amount: reduced }));
                Audio.goodEvent();
                break;
            }
            case 'plantTree': {
                const cost = 50 + Math.floor(this.day / 5) * 10;
                if (this.money < cost) {
                    UI.showFeedback(t('feedback.notEnoughCoins'), t('feedback.needCost', { cost }));
                    Audio.error();
                    return;
                }
                this.money -= cost;
                Plant.health = Math.min(100, Plant.health + 10);
                Plant.totalNitrogen += 15;
                Plant.checkGrowth();
                UI.addLog(t('log.plantedTree'), 'good');
                UI.showFeedback(t('feedback.newTree'), t('feedback.newTree.detail'));
                Audio.goodEvent();
                break;
            }
            case 'emergencyHeal': {
                // $20 → $18 base; inflation curve unchanged (+$5 every 5 days)
                const cost = 18 + Math.floor(this.day / 5) * 5;
                if (this.money < cost) {
                    UI.showFeedback(t('feedback.notEnoughCoins'), t('feedback.needCost', { cost }));
                    Audio.error();
                    return;
                }
                this.money -= cost;
                Plant.health = Math.min(100, Plant.health + 15);
                UI.addLog(t('log.emergencyHeal'), 'good');
                UI.showFeedback(t('feedback.healed'), t('feedback.healed.detail'));
                Audio.goodEvent();
                break;
            }
        }

        this.updateUI();
    },

    _loopRunning: false,

    startLoop() {
        // Guard against creating duplicate animation loops
        if (this._loopRunning) return;
        this._loopRunning = true;
        this.lastFrameTime = performance.now();

        const animate = (now) => {
            let delta = now - this.lastFrameTime;
            this.lastFrameTime = now;

            // Cap deltaTime to prevent huge jumps on tab switch
            if (delta > 1000) delta = 1000;

            // Apply global speed multiplier — does NOT give extra actions per
            // day because cooldowns scale with the same delta (cheat-resistant).
            delta *= (this.speedMultiplier || 1);
            // Expose for renderer (farm-animal animation uses dt)
            this._lastFrameDelta = delta;

            if (this.state === 'playing') {
                // Advance day timer
                this.dayTimer += delta;
                this.dayProgress = Math.min(this.dayTimer / this.dayDuration, 1);

                // Tick cooldowns
                for (const cd of Object.values(this.cooldowns)) {
                    if (cd.remaining > 0) {
                        cd.remaining = Math.max(0, cd.remaining - delta);
                    }
                }

                // Auto-complete day when timer expires
                if (this.dayTimer >= this.dayDuration) {
                    this.completeDay();
                }

                // Check dread thresholds
                this.checkDreadSounds();

                // Update music tension based on danger
                this.updateMusicTension();

                // Update UI
                this.updateUI();
            }

            if (this.state === 'playing' || this.state === 'won' || this.state === 'paused' || this.state === 'modal') {
                Renderer.render(Plant.stage, Plant.health, Nitrogen.pools, this.temperature, this.dayProgress);
            }

            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    },

    doAction(action) {
        if (this.state !== 'playing') return;

        const cd = this.cooldowns[action];
        if (cd && cd.remaining > 0) {
            UI.showFeedback(t('feedback.cooldown'), t('feedback.cooldown.detail', { seconds: (cd.remaining / 1000).toFixed(1) }));
            Audio.error();
            return;
        }

        let result;

        switch (action) {
            case 'fix':
                result = Nitrogen.fix();
                if (result.success) {
                    this.stats.fixed += result.amount;
                    this.score += 10;
                    this.money += 1;
                    Audio.fix();
                    Renderer.triggerTransformation('fixation');
                    UI.showFloatingNumber(t('float.plus', { amount: result.amount, pool: 'NH₄⁺' }), 'good');
                } else {
                    Audio.error();
                }
                break;

            case 'decompose':
                result = Nitrogen.decompose();
                if (result.success) {
                    this.stats.decomposed += result.amount;
                    this.score += 8;
                    this.money += 1;
                    Audio.decompose();
                    Renderer.triggerTransformation('decompose');
                    UI.showFloatingNumber(t('float.plus', { amount: result.amount, pool: 'NH₄⁺' }), 'good');
                } else {
                    Audio.error();
                }
                break;

            case 'feed':
                result = Nitrogen.feedPlant();
                if (result.success) {
                    const plantResult = Plant.feed(result.amount);
                    this.stats.fed += result.amount;
                    this.score += 15;
                    this.money += 2;
                    Audio.feed();
                    Renderer.triggerTransformation('feed');
                    if (result.bonus > 0) {
                        UI.showFloatingNumber(t('float.plusToPlantBonus', { amount: result.amount, bonus: result.bonus }), 'good');
                    } else {
                        UI.showFloatingNumber(t('float.plusToPlant', { amount: result.amount }), 'good');
                    }

                    if (plantResult.grew) {
                        UI.showFeedback(t('feedback.grew', { stage: plantResult.stageName }), t('feedback.grew.detail'));
                        UI.addLog(t('log.plantGrew', { stage: plantResult.stageName }), 'good');
                        this.score += 50;
                        const milestoneBonus = [10, 15, 20, 30];
                        if (plantResult.stage > this.lastMilestoneStage) {
                            const bonus = milestoneBonus[plantResult.stage - 1] || 20;
                            this.money += bonus;
                            UI.addLog(t('log.milestoneBonus', { bonus }), 'good');
                            UI.showFloatingNumber(t('float.bonusMoney', { amount: bonus }), 'good');
                            this.lastMilestoneStage = plantResult.stage;
                        }
                        Audio.grow();
                    }
                } else {
                    Audio.error();
                }
                break;

            case 'nitrify1':
                result = Nitrogen.nitrify1();
                if (result.success) {
                    this.stats.nitrified += result.amount;
                    this.score += 8;
                    this.money += 2;
                    Audio.nitrify();
                    Renderer.triggerTransformation('nitrify1');
                    UI.showFloatingNumber(t('float.toNo2'), 'warning');
                } else {
                    Audio.error();
                }
                break;

            case 'nitrify2':
                result = Nitrogen.nitrify2();
                if (result.success) {
                    this.stats.nitrified += result.amount;
                    this.score += 12;
                    this.money += 2;
                    Audio.nitrify();
                    Renderer.triggerTransformation('nitrify2');
                    UI.showFloatingNumber(t('float.plusNo3Bonus', { amount: result.amount }), 'good');
                } else {
                    Audio.error();
                }
                break;

            case 'denitrify':
                result = Nitrogen.denitrify();
                if (result.success) {
                    this.stats.denitrified += result.amount;
                    this.money += 1;
                    Renderer.triggerTransformation('denitrify');
                    if (result.to === 'n2o') {
                        this.stats.n2oProduced += result.amount;
                        this.score -= 5;
                        Audio.badEvent();
                        UI.showFloatingNumber(t('float.plusN2o', { amount: result.amount }), 'bad');
                    } else {
                        this.score += 8;
                        this.money += 2;
                        Audio.event();
                        UI.showFloatingNumber(t('float.safeNo3', { amount: result.amount }), 'good');
                        if (result.wasEmergency) {
                            UI.showFloatingNumber(t('float.crisisAverted'), 'good');
                        }
                    }
                } else {
                    Audio.error();
                }
                break;
        }

        if (result) {
            UI.addLog(result.message, result.type);
            UI.showFeedback(result.message, result.detail || '');

            if (result.success && cd) {
                cd.remaining = cd.duration;
            }

            // Notify tutorial system
            if (result.success && typeof Tutorial !== 'undefined') {
                Tutorial.onActionCompleted(action);
            }
        }

        this.updateUI();

        // Check achievements
        if (typeof Achievements !== 'undefined') {
            Achievements.check(this.stats, this.day);
        }

        this.checkWinLose();
    },

    completeDay() {
        if (this.state !== 'playing') return;

        Audio.endTurn();

        // Random event
        const event = Events.roll(Nitrogen, Plant);
        if (event) {
            // event.name is already localized; event.id is a stable English code
            // we switch on for sounds/visuals.
            UI.addLog(`${event.name}: ${event.result.message}`, event.result.type);
            UI.showFeedback(event.name, event.result.message, 2000);
            UI.showFloatingNumber(event.name, event.result.type === 'good' ? 'good' : event.result.type === 'bad' ? 'bad' : 'neutral');

            // Update environment based on events
            if (event.id === 'HEAVY RAIN') {
                this.moisture = Math.min(95, this.moisture + 30);
                this.oxygen = Math.max(20, this.oxygen - 20);
            } else if (event.id === 'DROUGHT') {
                this.moisture = Math.max(15, this.moisture - 25);
                this.oxygen = Math.min(90, this.oxygen + 15);
            } else if (event.id === 'HEATWAVE') {
                this.temperature += 5;
            } else if (event.id === 'ACID RAIN') {
                this.moisture = Math.min(90, this.moisture + 15);
            }

            // Play event-specific sounds and visual effects
            if (event.id === 'LIGHTNING!') {
                Audio.lightning();
                Renderer.triggerShake(10, 300);
                Renderer.setWeather('lightning', 300);
            } else if (event.id === 'HEAVY RAIN') {
                Audio.rain();
                Renderer.setWeather('rain', 4000);
            } else if (event.id === 'DROUGHT') {
                Renderer.triggerShake(5, 200);
                Renderer.setWeather('drought', 3000);
                Audio.drought();
            } else if (event.id === 'PEST ATTACK') {
                Renderer.triggerShake(8, 250);
                Audio.pestAttack();
            } else if (event.id === 'HEATWAVE') {
                Renderer.setWeather('drought', 3000);
                Audio.badEvent();
            } else if (event.id === 'ACID RAIN') {
                Renderer.setWeather('rain', 3000);
                Audio.badEvent();
            } else if (event.result.type === 'good') {
                Audio.goodEvent();
            } else if (event.result.type === 'bad') {
                Audio.badEvent();
            } else {
                Audio.event();
            }
        }

        // Natural processes based on environment (escalating difficulty)
        const turnResults = Nitrogen.endTurn(this.moisture, this.oxygen, this.getDifficultyMult());
        turnResults.forEach(r => {
            UI.addLog(r.message, r.type);
            // Structured leached amount — no longer regex-parsed from text
            if (r.leached) this.stats.leached += r.leached;
        });

        // Plant health update (pass temperature)
        const plantUpdate = Plant.update(Nitrogen.pools, this.temperature);
        plantUpdate.messages.forEach(msg => {
            UI.addLog(msg.text, msg.type);
            if (msg.type === 'bad') {
                Audio.badEvent();
            }
        });

        // Temperature system: N₂O heats planet (escalates with difficulty)
        const diffMult = this.getDifficultyMult();
        this.temperature += Nitrogen.pools.n2o * 0.18 * diffMult;
        // Natural cooling toward 20°C (slower at higher difficulty)
        this.temperature -= (this.temperature - 20) * (0.04 / diffMult);
        this.temperature = Math.max(10, Math.min(70, this.temperature));

        // Environmental changes
        this.moisture = Math.max(20, Math.min(80, this.moisture + (Math.random() - 0.5) * 15 + (50 - this.moisture) * 0.1));

        // Oxygen affected by moisture
        const targetOxygen = 80 - (this.moisture * 0.4);
        this.oxygen = Math.max(20, Math.min(80, this.oxygen + (targetOxygen - this.oxygen) * 0.2 + (Math.random() - 0.5) * 10));

        // Next day - reset timer
        this.day++;
        this.dayTimer = 0;
        this.dayProgress = 0;
        this.score += 3;
        // Bumped from +$3 → +$4 to reduce mid-game money pressure (rebalance design 2026-04-15)
        this.money += 4;

        UI.addLog(t('log.newDay', { day: this.day }));
        this.updateUI();

        // Auto-save at end of each day (silent)
        this._autoSave();

        // Check achievements at end of day
        if (typeof Achievements !== 'undefined') {
            Achievements.check(this.stats, this.day);
        }

        this.checkWinLose();
    },

    checkDreadSounds() {
        const pools = Nitrogen.pools;
        const n2o = pools.n2o || 0;
        const leached = pools.leached || 0;

        // Atmosphere: level 2 (critical) at N₂O>35 OR temp>45, level 1 (warning) at N₂O>15 OR temp>30
        let atmoLevel = 0;
        if (n2o > 35 || this.temperature > 45) {
            atmoLevel = 2;
        } else if (n2o > 15 || this.temperature > 30) {
            atmoLevel = 1;
        }

        if (atmoLevel !== this.dreadState.atmosphereLevel) {
            if (atmoLevel > 0) {
                Audio.startAtmoDread(atmoLevel);
            } else {
                Audio.stopAtmoDread();
            }
            this.dreadState.atmosphereLevel = atmoLevel;
        }

        // Water: level 2 (critical) at leached>60, level 1 (warning) at leached>30
        let waterLevel = 0;
        if (leached > 60) {
            waterLevel = 2;
        } else if (leached > 30) {
            waterLevel = 1;
        }

        if (waterLevel !== this.dreadState.waterLevel) {
            if (waterLevel > 0) {
                Audio.startWaterDread(waterLevel);
            } else {
                Audio.stopWaterDread();
            }
            this.dreadState.waterLevel = waterLevel;
        }
    },

    updateMusicTension() {
        const pools = Nitrogen.pools;
        const n2o = pools.n2o || 0;
        const leached = pools.leached || 0;

        // Tension rises with: N2O, leached, temperature, low health, late game
        let tension = 0;
        tension += Math.min(n2o / 50, 0.3);
        tension += Math.min(leached / 80, 0.25);
        tension += Math.max(0, (this.temperature - 30) / 40) * 0.2;
        tension += Math.max(0, (50 - Plant.health) / 50) * 0.25;

        Audio.setMusicTension(tension);
    },

    // Escalating difficulty factor (increases each day)
    getDifficultyMult() {
        const scale = this.difficulties[this.difficulty]
            ? this.difficulties[this.difficulty].difficultyScale
            : 0.06;
        return 1 + (this.day - 1) * scale;
    },

    updateUI() {
        UI.updatePools(Nitrogen.pools);
        UI.updatePlant(Plant.stage, Plant.health);
        UI.updateEnvironment(this.moisture, this.oxygen);
        UI.updateStats(this.day, this.score);
        UI.updateMoney(this.money);
        UI.updateTemperature(this.temperature);
        UI.updateShopButtons(this.money, this.day);
        UI.updateDayTimer(this.dayProgress);
        UI.updateCooldowns(this.cooldowns);
        UI.updateAtmoStatus(Nitrogen.pools.n2o || 0, this.temperature);
        UI.updateWaterStatus(Nitrogen.pools.leached || 0);

        // Update button states - disabled if on cooldown OR insufficient resources
        const rates = Nitrogen.rates;
        const pools = Nitrogen.pools;

        const onCd = (action) => this.cooldowns[action] && this.cooldowns[action].remaining > 0;

        UI.elements.btnFix.disabled = onCd('fix') || pools.n2 < rates.fixation;
        UI.elements.btnDecompose.disabled = onCd('decompose') || pools.organic < rates.ammonification;
        UI.elements.btnFeed.disabled = onCd('feed') || (pools.nh4 + pools.no3) < rates.plantUptake;

        if (UI.elements.btnNitrify1) {
            UI.elements.btnNitrify1.disabled = onCd('nitrify1') || pools.nh4 < rates.nitrification1;
        }
        if (UI.elements.btnNitrify2) {
            UI.elements.btnNitrify2.disabled = onCd('nitrify2') || pools.no2 < rates.nitrification2;
        }
        if (UI.elements.btnDenitrify) {
            UI.elements.btnDenitrify.disabled = onCd('denitrify') || pools.no3 < rates.denitrification;
        }
    },

    checkWinLose() {
        const saveScoreBtn = document.getElementById('btn-save-score');
        if (Plant.hasWon()) {
            this.state = 'won';
            this.score += 200;

            // Bonus for minimal pollution
            if (this.stats.n2oProduced < 10) {
                this.score += 50;
                UI.addLog(t('log.bonusLowGhg'), 'good');
            }
            if (this.stats.leached < 10) {
                this.score += 50;
                UI.addLog(t('log.bonusLowPollution'), 'good');
            }

            Audio.stopMusic();
            Audio.stopAllDread();
            Audio.win();
            UI.showGameOver(true, {
                days: this.day,
                score: this.score,
                fixed: this.stats.fixed,
                fed: this.stats.fed,
                n2o: this.stats.n2oProduced,
                leached: this.stats.leached
            });
            // Win → offer to save score
            if (saveScoreBtn) saveScoreBtn.classList.remove('hidden');
        } else if (Plant.isDead()) {
            this.state = 'lost';
            Audio.stopMusic();
            Audio.stopAllDread();
            Audio.lose();
            UI.showGameOver(false, {
                days: this.day,
                score: this.score,
                fixed: this.stats.fixed,
                fed: this.stats.fed,
                n2o: this.stats.n2oProduced,
                leached: this.stats.leached
            });
            // Loss → don't offer score saving
            if (saveScoreBtn) saveScoreBtn.classList.add('hidden');
        }
    },

    restart() {
        this.day = 1;
        this.score = 0;
        this.dayTimer = 0;
        this.dayProgress = 0;
        this.lastFrameTime = performance.now();
        this.moisture = 50;
        this.oxygen = 60;
        this.temperature = 20;
        this.lastMilestoneStage = 0;
        this.stats = {
            fixed: 0,
            decomposed: 0,
            fed: 0,
            nitrified: 0,
            denitrified: 0,
            n2oProduced: 0,
            leached: 0
        };

        // Reset cooldowns
        for (const cd of Object.values(this.cooldowns)) {
            cd.remaining = 0;
        }

        // Reset dread state and stop sounds
        this.dreadState.atmosphereLevel = 0;
        this.dreadState.waterLevel = 0;
        Audio.stopAllDread();

        // Clear any open modals (game-over, cycle diagram, pool info)
        this._modalStack = [];
        UI.hideCycleDiagram();
        UI.hidePoolInfo();

        Nitrogen.init();
        Plant.init();
        UI.hideGameOver();

        // Restart music if it was enabled
        if (Audio.musicEnabled) {
            Audio.startMusic();
        }

        // Clear log
        if (UI.elements.logContent) {
            UI.elements.logContent.innerHTML = '';
        }

        // Show difficulty select again
        this.state = 'menu';
        this.showDifficultySelect();
    },

    // ========== SAVE / LOAD SYSTEM ==========
    _buildSaveData() {
        return {
            version: 2,
            difficulty: this.difficulty,
            day: this.day,
            score: this.score,
            money: this.money,
            moisture: this.moisture,
            oxygen: this.oxygen,
            temperature: this.temperature,
            dayTimer: this.dayTimer,
            speedMultiplier: this.speedMultiplier || 1,
            lastMilestoneStage: this.lastMilestoneStage,
            dreadState: { ...this.dreadState },
            stats: { ...this.stats },
            pools: { ...Nitrogen.pools },
            plant: { stage: Plant.stage, health: Plant.health, totalNitrogen: Plant.totalNitrogen },
            cooldowns: Object.fromEntries(
                Object.entries(this.cooldowns).map(([k, v]) => [k, { duration: v.duration, remaining: v.remaining }])
            )
        };
    },

    _autoSave() {
        // Silent save without UI feedback
        localStorage.setItem('nitrocycle_save', JSON.stringify(this._buildSaveData()));
    },

    save() {
        localStorage.setItem('nitrocycle_save', JSON.stringify(this._buildSaveData()));
        UI.showFeedback(t('feedback.saved'), t('feedback.saved.detail', { day: this.day }));
        Audio.click();
    },

    load() {
        const raw = localStorage.getItem('nitrocycle_save');
        if (!raw) {
            UI.showFeedback(t('feedback.noSave'), '');
            Audio.error();
            return false;
        }
        const data = JSON.parse(raw);

        this.difficulty = data.difficulty || 'normal';
        this.applyDifficulty(false); // false = don't reset money (we load it from save)
        this.day = data.day;
        this.score = data.score;
        this.money = data.money;
        this.moisture = data.moisture;
        this.oxygen = data.oxygen;
        this.temperature = data.temperature;
        this.dayTimer = data.dayTimer || 0;
        // Speed: localStorage preference wins when present (returning player
        // gets the speed they last selected). Only fall back to the save's
        // value if no localStorage preference exists. Also strict-validate
        // against the same {0.5, 1, 2} whitelist used by setupSpeedToggle
        // so a corrupt save can't leave us at an unrepresentable speed.
        if (localStorage.getItem('nitrocycle_speed') === null
            && (data.speedMultiplier === 0.25 || data.speedMultiplier === 0.5 || data.speedMultiplier === 1 || data.speedMultiplier === 2)) {
            this.speedMultiplier = data.speedMultiplier;
        }
        // Whichever rule won, the pill UI must reflect it.
        if (typeof this._refreshSpeedUI === 'function') this._refreshSpeedUI();
        this.dayProgress = this.dayTimer / this.dayDuration;
        this.stats = { ...data.stats };
        // Restore milestone + dread state (fall back for older saves without these fields)
        this.lastMilestoneStage = data.lastMilestoneStage || 0;
        if (data.dreadState) {
            this.dreadState.atmosphereLevel = data.dreadState.atmosphereLevel || 0;
            this.dreadState.waterLevel = data.dreadState.waterLevel || 0;
        }

        Nitrogen.pools = { ...data.pools };
        Plant.stage = data.plant.stage;
        Plant.health = data.plant.health;
        Plant.totalNitrogen = data.plant.totalNitrogen;

        if (data.cooldowns) {
            for (const [k, v] of Object.entries(data.cooldowns)) {
                if (this.cooldowns[k]) {
                    this.cooldowns[k].duration = v.duration;
                    this.cooldowns[k].remaining = v.remaining;
                }
            }
        }

        // Make sure we're playing and loop is running
        this.hideDifficultySelect();
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) pauseOverlay.classList.add('hidden');
        this.state = 'playing';
        this.lastFrameTime = performance.now();
        this.startLoop();

        this.updateUI();
        UI.showFeedback(t('feedback.loaded'), t('feedback.loaded.detail', { day: data.day }));
        Audio.click();
        return true;
    },

    deleteSave() {
        localStorage.removeItem('nitrocycle_save');
    },

    // ========== COLORBLIND MODE ==========
    colorblindModes: ['', 'colorblind-deuteranopia', 'colorblind-protanopia'],
    colorblindIndex: 0,

    cycleColorblindMode() {
        // Remove current
        this.colorblindModes.forEach(m => {
            if (m) document.body.classList.remove(m);
        });

        this.colorblindIndex = (this.colorblindIndex + 1) % this.colorblindModes.length;
        const mode = this.colorblindModes[this.colorblindIndex];

        if (mode) {
            document.body.classList.add(mode);
            const label = mode.replace('colorblind-', '').toUpperCase();
            UI.showFeedback(t('feedback.colorblind'), label, 1500);
        } else {
            UI.showFeedback(t('feedback.colorblind'), t('feedback.colorblind.off'), 1500);
        }

        localStorage.setItem('nitrocycle_colorblind', this.colorblindIndex.toString());
        Audio.click();
    },

    loadColorblindPref() {
        const saved = localStorage.getItem('nitrocycle_colorblind');
        if (saved) {
            this.colorblindIndex = parseInt(saved) || 0;
            const mode = this.colorblindModes[this.colorblindIndex];
            if (mode) document.body.classList.add(mode);
        }
    }
};

// Expose for cross-module access (ui.js, tutorial.js call Game.openModal etc.)
window.Game = Game;

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
