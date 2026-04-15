/**
 * Tutorial System - Guided onboarding for new players
 */

const Tutorial = {
    active: false,
    step: 0,

    // Each step references an i18n key; the actual text is resolved at
    // showStep() time so the player sees the tutorial in their current
    // language even if they switch mid-tutorial.
    steps: [
        { target: '#btn-fix',              key: 'tutorial.step.welcome',   waitFor: 'fix' },
        { target: '#val-nh4',              key: 'tutorial.step.nh4',       delay: 2500 },
        { target: '#btn-feed',             key: 'tutorial.step.feed',      waitFor: 'feed' },
        { target: '#plant-sprite',         key: 'tutorial.step.grow',      delay: 3000 },
        { target: '#btn-decompose',        key: 'tutorial.step.decompose', waitFor: 'decompose' },
        { target: '.day-timer-bar-track',  key: 'tutorial.step.timer',     delay: 3000 },
        { target: '#val-n2o',              key: 'tutorial.step.n2o',       delay: 3000 },
        { target: '#val-leached',          key: 'tutorial.step.leach',     delay: 3000 }
    ],

    init() {
        this.dialogEl = document.getElementById('tutorial-dialog');
        this.textEl = document.getElementById('tutorial-text');
        this.overlayEl = document.getElementById('tutorial-overlay');
        this.nextBtn = document.getElementById('tutorial-next');
        this.skipBtn = document.getElementById('tutorial-skip');

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.advance());
        }
        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', () => this.complete());
        }
    },

    shouldShow() {
        return !localStorage.getItem('nitrocycle_tutorial_done');
    },

    start() {
        if (!this.overlayEl) return;
        this.active = true;
        this.step = 0;
        // Tutorial steps that wait for an action still need gameplay running.
        // Only freeze the day-timer for "delay"-style info steps.
        this.showStep();
    },

    _suspendGameplay() {
        if (window.Game && Game.openModal) Game.openModal('tutorial');
    },

    _resumeGameplay() {
        if (window.Game && Game.closeModal) Game.closeModal('tutorial');
    },

    showStep() {
        if (this.step >= this.steps.length) {
            this.complete();
            return;
        }

        const s = this.steps[this.step];
        if (!this.textEl || !this.overlayEl) return;

        // Remember the current step so a language switch (re-apply) can
        // re-render the visible message without advancing.
        this._currentKey = s.key;
        this.textEl.textContent = (typeof window.t === 'function' && s.key) ? window.t(s.key) : s.message;
        this.overlayEl.classList.remove('hidden');

        // Freeze gameplay on "read this" steps (delay); let it run on "do this" (waitFor) steps
        if (s.waitFor) {
            this._resumeGameplay();
        } else {
            this._suspendGameplay();
        }

        // Show/hide next button based on whether we're waiting for an action
        if (this.nextBtn) {
            this.nextBtn.style.display = s.waitFor ? 'none' : 'inline-block';
        }

        // Highlight target element
        this._clearHighlight();
        if (s.target) {
            const el = document.querySelector(s.target);
            if (el) {
                el.classList.add('tutorial-highlight');
                // Position dialog near target
                this._positionNear(el);
            }
        }

        // Auto-advance on delay
        if (s.delay) {
            this._autoTimer = setTimeout(() => this.advance(), s.delay);
        }
    },

    _positionNear(el) {
        if (!this.dialogEl) return;
        const rect = el.getBoundingClientRect();
        // Position below the element by default
        let top = rect.bottom + 12;
        let left = rect.left + rect.width / 2 - 150;

        // Keep within viewport
        left = Math.max(10, Math.min(left, window.innerWidth - 320));
        if (top + 120 > window.innerHeight) {
            top = rect.top - 120;
        }

        this.dialogEl.style.top = top + 'px';
        this.dialogEl.style.left = left + 'px';
    },

    _clearHighlight() {
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        if (this._autoTimer) {
            clearTimeout(this._autoTimer);
            this._autoTimer = null;
        }
    },

    advance() {
        this._clearHighlight();
        this.step++;
        this.showStep();
    },

    onActionCompleted(actionName) {
        if (!this.active) return;
        const s = this.steps[this.step];
        if (s && s.waitFor === actionName) {
            // Small delay so the player sees the result
            setTimeout(() => this.advance(), 500);
        }
    },

    complete() {
        this.active = false;
        this._clearHighlight();
        this._resumeGameplay();
        if (this.overlayEl) {
            this.overlayEl.classList.add('hidden');
        }
        localStorage.setItem('nitrocycle_tutorial_done', '1');
    }
};

window.Tutorial = Tutorial;

// Re-render the current step when the language changes so the visible
// tutorial text stays in the active language.
window.addEventListener('langchange', () => {
    if (Tutorial.active && Tutorial.textEl && Tutorial._currentKey && typeof window.t === 'function') {
        Tutorial.textEl.textContent = window.t(Tutorial._currentKey);
    }
});
