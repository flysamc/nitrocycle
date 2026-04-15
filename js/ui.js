/**
 * UI Controller - Educational Retro Version
 * Handles all nitrogen pool displays and educational popups
 */

const UI = {
    elements: {},

    init() {
        // Cache DOM elements
        this.elements = {
            // Stats
            dayCounter: document.getElementById('day-counter'),
            scoreDisplay: document.getElementById('score-display'),
            // Pools - All nitrogen molecules
            barN2: document.getElementById('bar-n2'),
            barNh4: document.getElementById('bar-nh4'),
            barNo2: document.getElementById('bar-no2'),
            barNo3: document.getElementById('bar-no3'),
            barOrganic: document.getElementById('bar-organic'),
            barN2o: document.getElementById('bar-n2o'),
            barLeached: document.getElementById('bar-leached'),
            valN2: document.getElementById('val-n2'),
            valNh4: document.getElementById('val-nh4'),
            valNo2: document.getElementById('val-no2'),
            valNo3: document.getElementById('val-no3'),
            valOrganic: document.getElementById('val-organic'),
            valN2o: document.getElementById('val-n2o'),
            valLeached: document.getElementById('val-leached'),

            // Environment
            moistureBar: document.getElementById('moisture-bar'),
            moistureVal: document.getElementById('moisture-val'),
            oxygenBar: document.getElementById('oxygen-bar'),
            oxygenVal: document.getElementById('oxygen-val'),

            // Plant
            plantSprite: document.getElementById('plant-sprite'),
            plantStageName: document.getElementById('plant-stage-name'),
            growthDots: document.querySelectorAll('.growth-dot'),
            healthFill: document.getElementById('health-fill'),
            healthText: document.getElementById('health-text'),
            nAbsorbedVal: document.getElementById('n-absorbed-val'),

            // Log (removed from UI but kept for compatibility)
            logContent: null,

            // Day timer
            dayTimerBar: document.getElementById('day-timer-bar'),
            dayTimerLabel: document.getElementById('day-timer-label'),

            // Status panels
            atmoBar: document.getElementById('atmo-bar'),
            atmoQuality: document.getElementById('atmo-quality'),
            atmoTrack: document.querySelector('.status-bar-track.atmo'),
            waterBar: document.getElementById('water-bar'),
            waterQuality: document.getElementById('water-quality'),
            waterTrack: document.querySelector('.status-bar-track.water'),

            // Main action buttons
            btnFix: document.getElementById('btn-fix'),
            btnDecompose: document.getElementById('btn-decompose'),
            btnFeed: document.getElementById('btn-feed'),

            // Advanced action buttons
            btnNitrify1: document.getElementById('btn-nitrify1'),
            btnNitrify2: document.getElementById('btn-nitrify2'),
            btnDenitrify: document.getElementById('btn-denitrify'),

            // Cycle diagram
            cycleDiagram: document.getElementById('cycle-diagram'),
            btnShowCycle: document.getElementById('btn-show-cycle'),
            btnCloseDiagram: document.getElementById('close-diagram'),

            // Info popup
            infoPopup: document.getElementById('info-popup'),
            infoFormula: document.getElementById('info-formula'),
            infoName: document.getElementById('info-name'),
            infoDesc: document.getElementById('info-desc'),
            btnCloseInfo: document.getElementById('close-info'),

            // Money
            moneyDisplay: document.getElementById('money-display'),

            // Temperature
            thermometerFill: document.getElementById('thermometer-fill'),
            tempValue: document.getElementById('temp-value'),

            // Shop buttons
            btnCleanWater: document.getElementById('btn-clean-water'),
            btnScrubAtmo: document.getElementById('btn-scrub-atmo'),
            btnPlantTree: document.getElementById('btn-plant-tree'),
            btnEmergencyHeal: document.getElementById('btn-emergency-heal'),

            // Feedback
            feedback: document.getElementById('feedback'),
            feedbackText: document.getElementById('feedback-text'),
            feedbackDetail: document.getElementById('feedback-detail'),

            // Overlay
            overlay: document.getElementById('overlay'),
            overlayTitle: document.getElementById('overlay-title'),
            overlayMessage: document.getElementById('overlay-message'),
            overlayStats: document.getElementById('overlay-stats'),
            btnRestart: document.getElementById('btn-restart')
        };

        // Setup pool click handlers for educational info
        this.setupPoolClickHandlers();
        this.setupCycleDiagram();

        return true;
    },

    setupPoolClickHandlers() {
        const poolItems = document.querySelectorAll('.pool-item');
        poolItems.forEach(item => {
            item.addEventListener('click', () => {
                const poolId = item.dataset.pool;
                this.showPoolInfo(poolId);
            });
        });

        // Close info popup
        if (this.elements.btnCloseInfo) {
            this.elements.btnCloseInfo.addEventListener('click', () => {
                this.hidePoolInfo();
            });
        }

        // Click outside to close
        if (this.elements.infoPopup) {
            this.elements.infoPopup.addEventListener('click', (e) => {
                if (e.target === this.elements.infoPopup) {
                    this.hidePoolInfo();
                }
            });
        }
    },

    setupCycleDiagram() {
        const self = this;

        // Close handler function
        const closeDiagram = function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            self.hideCycleDiagram();
            if (typeof Audio !== 'undefined' && Audio.click) {
                Audio.click();
            }
        };

        // Bottom close button
        const closeBtn = document.getElementById('close-diagram');
        if (closeBtn) {
            closeBtn.onclick = closeDiagram;
        }

        // Top close button
        const closeBtnTop = document.getElementById('close-diagram-top');
        if (closeBtnTop) {
            closeBtnTop.onclick = closeDiagram;
        }
        // NOTE: Escape handling lives in Game.setupKeyboardShortcuts
        // (it closes whichever modal is on top of the stack).
    },

    showPoolInfo(poolId) {
        const info = Nitrogen.getPoolInfo(poolId);
        if (!info || !this.elements.infoPopup) return;

        const tr = (typeof window.t === 'function') ? window.t : (k) => k;
        this.elements.infoFormula.textContent = info.formula;
        this.elements.infoName.textContent = info.nameKey ? tr(info.nameKey) : info.name;
        this.elements.infoDesc.textContent = info.descKey ? tr(info.descKey) : info.description;
        // Stash the keys on the popup so a language switch while the popup
        // is open can re-render via I18N.apply().
        this.elements.infoName.setAttribute('data-i18n', info.nameKey || '');
        this.elements.infoDesc.setAttribute('data-i18n', info.descKey || '');
        this.elements.infoPopup.classList.remove('hidden');

        if (window.Game && Game.openModal) Game.openModal('poolInfo');
        Audio.click();
    },

    hidePoolInfo() {
        if (this.elements.infoPopup) {
            this.elements.infoPopup.classList.add('hidden');
        }
        if (window.Game && Game.closeModal) Game.closeModal('poolInfo');
    },

    showCycleDiagram() {
        if (this.elements.cycleDiagram) {
            this.elements.cycleDiagram.classList.remove('hidden');
            if (window.Game && Game.openModal) Game.openModal('cycleDiagram');
            Audio.click();
        }
    },

    hideCycleDiagram() {
        if (this.elements.cycleDiagram) {
            this.elements.cycleDiagram.classList.add('hidden');
        }
        if (window.Game && Game.closeModal) Game.closeModal('cycleDiagram');
    },

    updatePools(pools) {
        const max = Nitrogen.maxValues;

        // Update all pool bars and values
        this.updatePool('N2', pools.n2, max.n2);
        this.updatePool('Nh4', pools.nh4, max.nh4);
        this.updatePool('No2', pools.no2, max.no2);
        this.updatePool('No3', pools.no3, max.no3);
        this.updatePool('Organic', pools.organic, max.organic);
        this.updatePool('N2o', pools.n2o, max.n2o);
        this.updatePool('Leached', pools.leached, max.leached);
    },

    updatePool(name, value, max) {
        const bar = this.elements[`bar${name}`];
        const val = this.elements[`val${name}`];

        if (bar) {
            bar.style.width = `${Math.min((value / max) * 100, 100)}%`;
        }
        if (val) {
            val.textContent = Math.round(value);
        }
    },

    updateEnvironment(moisture, oxygen) {
        if (this.elements.moistureBar) {
            this.elements.moistureBar.style.width = `${moisture}%`;
            this.elements.moistureVal.textContent = `${Math.round(moisture)}%`;
        }
        if (this.elements.oxygenBar) {
            this.elements.oxygenBar.style.width = `${oxygen}%`;
            this.elements.oxygenVal.textContent = `${Math.round(oxygen)}%`;
        }
    },

    updatePlant(stage, health) {
        // Update sprite — reuse the preloaded Assets image so the browser
        // doesn't re-fetch on every stage change.
        if (this.elements.plantSprite) {
            const cached = (typeof Assets !== 'undefined') ? Assets.get(`plant_${stage + 1}`) : null;
            const targetSrc = cached ? cached.src : `assets/plants/plant_stage_${stage + 1}.png`;
            if (this.elements.plantSprite.src !== targetSrc) {
                this.elements.plantSprite.src = targetSrc;
            }
        }

        // Update stage name (Plant.getStageName resolves via i18n)
        if (this.elements.plantStageName) {
            this.elements.plantStageName.textContent = Plant.getStageName();
        }

        // Update N absorbed
        if (this.elements.nAbsorbedVal) {
            this.elements.nAbsorbedVal.textContent = Plant.totalNitrogen;
        }

        // Update growth dots
        this.elements.growthDots.forEach((dot, i) => {
            dot.classList.remove('active', 'completed');
            if (i < stage) {
                dot.classList.add('completed');
            } else if (i === stage) {
                dot.classList.add('active');
            }
        });

        // Update health bar
        if (this.elements.healthFill) {
            this.elements.healthFill.style.width = `${health}%`;
            this.elements.healthFill.classList.remove('warning', 'danger');

            if (health < 30) {
                this.elements.healthFill.classList.add('danger');
            } else if (health < 60) {
                this.elements.healthFill.classList.add('warning');
            }
        }

        if (this.elements.healthText) {
            const tr = (typeof window.t === 'function') ? window.t : (k, v) => `${v.hp} HP`;
            this.elements.healthText.textContent = tr('plant.hp', { hp: health });
        }
    },

    updateStats(day, score) {
        if (this.elements.dayCounter) {
            this.elements.dayCounter.textContent = day;
        }
        if (this.elements.scoreDisplay) {
            this.elements.scoreDisplay.textContent = score;
        }
    },

    updateDayTimer(progress) {
        if (this.elements.dayTimerBar) {
            this.elements.dayTimerBar.style.width = `${Math.min(progress * 100, 100)}%`;
        }
        if (this.elements.dayTimerLabel) {
            // Use the actual day duration so Easy (18s) / Hard (9s) show correct numbers
            const totalSeconds = (window.Game && Game.dayDuration ? Game.dayDuration : 12000) / 1000;
            const remaining = Math.max(0, Math.ceil((1 - progress) * totalSeconds));
            const tr = (typeof window.t === 'function') ? window.t : (k, v) => `DAY TIME: ${v.seconds}s`;
            this.elements.dayTimerLabel.textContent = tr('action.dayTime', { seconds: remaining });
        }
    },

    // Track which buttons were on cooldown last frame
    _prevCooldownState: {},

    updateCooldowns(cooldowns) {
        const btnMap = {
            fix: this.elements.btnFix,
            decompose: this.elements.btnDecompose,
            feed: this.elements.btnFeed,
            nitrify1: this.elements.btnNitrify1,
            nitrify2: this.elements.btnNitrify2,
            denitrify: this.elements.btnDenitrify
        };

        for (const [action, btn] of Object.entries(btnMap)) {
            if (!btn) continue;
            const cd = cooldowns[action];
            const cdTimer = btn.querySelector('.cd-timer');

            if (cd && cd.remaining > 0) {
                const pct = (cd.remaining / cd.duration) * 100;
                btn.style.setProperty('--cooldown-pct', pct);
                btn.classList.add('on-cooldown');
                // Show remaining seconds
                if (cdTimer) {
                    cdTimer.textContent = (cd.remaining / 1000).toFixed(1) + 's';
                }
                this._prevCooldownState[action] = true;
            } else {
                btn.style.setProperty('--cooldown-pct', 0);
                btn.classList.remove('on-cooldown');
                if (cdTimer) {
                    cdTimer.textContent = '';
                }
                // Flash when cooldown just finished
                if (this._prevCooldownState[action]) {
                    this._prevCooldownState[action] = false;
                    btn.classList.add('ready-flash');
                    setTimeout(() => btn.classList.remove('ready-flash'), 400);
                }
            }
        }
    },

    updateAtmoStatus(n2o, temperature) {
        const tr = (typeof window.t === 'function') ? window.t : (k) => k;
        let qualityKey, qualityClass, barPct;

        if (n2o > 35 || temperature > 45) {
            qualityKey = 'atmo.critical';
            qualityClass = 'critical';
            barPct = 100;
        } else if (n2o > 20 || temperature > 35) {
            qualityKey = 'atmo.smoggy';
            qualityClass = 'smoggy';
            barPct = 75;
        } else if (n2o > 10) {
            qualityKey = 'atmo.hazy';
            qualityClass = 'hazy';
            barPct = 50;
        } else {
            qualityKey = 'atmo.clean';
            qualityClass = 'clean';
            barPct = Math.max(5, (n2o / 10) * 25);
        }

        if (this.elements.atmoBar) {
            this.elements.atmoBar.style.width = `${barPct}%`;
        }
        if (this.elements.atmoQuality) {
            this.elements.atmoQuality.textContent = tr(qualityKey);
            this.elements.atmoQuality.className = `status-quality ${qualityClass}`;
        }
        if (this.elements.atmoTrack) {
            this.elements.atmoTrack.className = `status-bar-track atmo ${qualityClass}`;
        }
    },

    updateWaterStatus(leached) {
        const tr = (typeof window.t === 'function') ? window.t : (k) => k;
        let qualityKey, qualityClass, barPct;

        if (leached > 60) {
            qualityKey = 'water.deadZone';
            qualityClass = 'dead-zone';
            barPct = 100;
        } else if (leached > 40) {
            qualityKey = 'water.algaeBloom';
            qualityClass = 'algae-bloom';
            barPct = 75;
        } else if (leached > 20) {
            qualityKey = 'water.murky';
            qualityClass = 'murky';
            barPct = 50;
        } else {
            qualityKey = 'water.clean';
            qualityClass = 'clean';
            barPct = Math.max(5, (leached / 20) * 25);
        }

        if (this.elements.waterBar) {
            this.elements.waterBar.style.width = `${barPct}%`;
        }
        if (this.elements.waterQuality) {
            this.elements.waterQuality.textContent = tr(qualityKey);
            this.elements.waterQuality.className = `status-quality ${qualityClass}`;
        }
        if (this.elements.waterTrack) {
            this.elements.waterTrack.className = `status-bar-track water ${qualityClass}`;
        }
    },

    updateMoney(money) {
        if (this.elements.moneyDisplay) {
            this.elements.moneyDisplay.textContent = money;
        }
    },

    updateTemperature(temperature) {
        temperature = temperature || 20;
        const fill = this.elements.thermometerFill;
        const val = this.elements.tempValue;

        if (fill) {
            // Map temperature 10-70 to 0-100% height
            const pct = Math.max(0, Math.min(100, ((temperature - 10) / 60) * 100));
            fill.style.height = `${pct}%`;

            // Color based on temperature
            fill.classList.remove('cold', 'normal', 'warm', 'hot', 'extreme');
            if (temperature < 20) {
                fill.classList.add('cold');
            } else if (temperature <= 30) {
                fill.classList.add('normal');
            } else if (temperature <= 40) {
                fill.classList.add('warm');
            } else if (temperature <= 50) {
                fill.classList.add('hot');
            } else {
                fill.classList.add('extreme');
            }
        }

        if (val) {
            val.textContent = `${Math.round(temperature)}°C`;
        }
    },

    updateShopButtons(money, day) {
        day = day || 1;
        const inflate = Math.floor((day - 1) / 5) * 5;
        const inflateTree = Math.floor((day - 1) / 5) * 10;
        const costs = {
            btnCleanWater: 35 + inflate,
            btnScrubAtmo: 40 + inflate,
            btnPlantTree: 50 + inflateTree,
            btnEmergencyHeal: 18 + inflate
        };

        for (const [key, cost] of Object.entries(costs)) {
            const btn = this.elements[key];
            if (btn) {
                btn.disabled = money < cost;
                // Update displayed cost
                const costEl = btn.querySelector('.shop-cost');
                if (costEl) costEl.textContent = `$${cost}`;
            }
        }
    },

    addLog(message, type = 'neutral') {
        if (!this.elements.logContent) return;

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;

        this.elements.logContent.insertBefore(entry, this.elements.logContent.firstChild);

        // Keep only last 20 entries
        while (this.elements.logContent.children.length > 20) {
            this.elements.logContent.removeChild(this.elements.logContent.lastChild);
        }
    },

    showFeedback(text, detail = '', duration = 1500) {
        if (!this.elements.feedback) return;

        this.elements.feedbackText.textContent = text;
        if (this.elements.feedbackDetail) {
            this.elements.feedbackDetail.textContent = detail;
        }
        this.elements.feedback.classList.remove('hidden');

        // Cancel any pending hide so a rapid second feedback doesn't get
        // immediately hidden by the previous call's timeout.
        if (this._feedbackTimer) clearTimeout(this._feedbackTimer);
        this._feedbackTimer = setTimeout(() => {
            this.elements.feedback.classList.add('hidden');
            this._feedbackTimer = null;
        }, duration);
    },

    showGameOver(won, stats) {
        if (!this.elements.overlay) return;
        const tr = (typeof window.t === 'function') ? window.t : (k) => k;

        this.elements.overlayTitle.textContent = won ? tr('over.youWin') : tr('over.gameOver');
        this.elements.overlayTitle.className = won ? 'win' : 'lose';

        this.elements.overlayMessage.textContent = won ? tr('over.grown') : tr('over.died');

        this.elements.overlayStats.innerHTML = `
            ${tr('over.days')}: ${stats.days}<br>
            ${tr('over.score')}: ${stats.score}<br>
            ${tr('over.nFixed')}: ${stats.fixed}<br>
            ${tr('over.nFed')}: ${stats.fed}<br>
            ${tr('over.n2oProduced')}: ${stats.n2o || 0}<br>
            ${tr('over.leached')}: ${stats.leached || 0}
        `;
        // Remember the last-shown state so a language switch can re-render
        this._lastGameOver = { won, stats };

        this.elements.overlay.classList.remove('hidden');
        if (window.Game && Game.openModal) Game.openModal('gameOver');
    },

    hideGameOver() {
        if (this.elements.overlay) {
            this.elements.overlay.classList.add('hidden');
        }
        if (window.Game && Game.closeModal) Game.closeModal('gameOver');
    },

    showFloatingNumber(text, type = 'neutral') {
        const container = document.getElementById('floating-nums');
        if (!container) return;

        const el = document.createElement('div');
        el.className = `floating-num ${type}`;
        el.textContent = text;

        // Position near center of canvas with some random offset
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            el.style.left = (rect.left + rect.width * 0.3 + Math.random() * rect.width * 0.4) + 'px';
            el.style.top = (rect.top + rect.height * 0.3 + Math.random() * rect.height * 0.3) + 'px';
        } else {
            el.style.left = '50%';
            el.style.top = '40%';
        }

        container.appendChild(el);

        // Self-remove after animation
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 1500);
    }
};

window.UI = UI;

// On language change, re-render UI elements that don't have data-i18n
// attributes (atmosphere/water status text, plant stage, day timer, game-over).
window.addEventListener('langchange', () => {
    if (!UI.elements || !UI.elements.atmoQuality) return; // not initialized yet
    if (window.Game) {
        try {
            UI.updateAtmoStatus(Nitrogen.pools.n2o || 0, Game.temperature);
            UI.updateWaterStatus(Nitrogen.pools.leached || 0);
            UI.updatePlant(Plant.stage, Plant.health);
            UI.updateDayTimer(Game.dayProgress);
        } catch (e) { /* ignore — game may not have started yet */ }
    }
    // Re-show game over with translated strings if it's currently visible
    if (UI._lastGameOver && UI.elements.overlay && !UI.elements.overlay.classList.contains('hidden')) {
        UI.showGameOver(UI._lastGameOver.won, UI._lastGameOver.stats);
    }
});
