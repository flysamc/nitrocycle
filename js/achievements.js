/**
 * Achievement System
 * Tracks and rewards player milestones
 */

const Achievements = {
    definitions: [
        { id: 'first_fix',    nameKey: 'ach.firstFix.name',    descKey: 'ach.firstFix.desc',
          check: (stats) => stats.fixed > 0 },
        { id: 'tree_grown',   nameKey: 'ach.treeGrown.name',   descKey: 'ach.treeGrown.desc',
          check: () => Plant.stage >= 4 },
        { id: 'speed_run',    nameKey: 'ach.speedRun.name',    descKey: 'ach.speedRun.desc',
          check: (stats, day) => Plant.stage >= 4 && day < 15 },
        { id: 'clean_win',    nameKey: 'ach.cleanWin.name',    descKey: 'ach.cleanWin.desc',
          check: (stats) => Plant.stage >= 4 && Nitrogen.pools.n2o < 5 && Nitrogen.pools.leached < 5 },
        { id: 'big_fixer',    nameKey: 'ach.bigFixer.name',    descKey: 'ach.bigFixer.desc',
          check: (stats) => stats.fixed >= 100 },
        { id: 'fed_50',       nameKey: 'ach.fed50.name',       descKey: 'ach.fed50.desc',
          check: (stats) => stats.fed >= 50 },
        { id: 'survive_30',   nameKey: 'ach.survive30.name',   descKey: 'ach.survive30.desc',
          check: (stats, day) => day >= 30 },
        { id: 'no_denitrify', nameKey: 'ach.noDenitrify.name', descKey: 'ach.noDenitrify.desc',
          check: (stats) => Plant.stage >= 4 && stats.denitrified === 0 }
    ],

    unlocked: [],

    init() {
        this.unlocked = JSON.parse(localStorage.getItem('nitrocycle_achievements') || '[]');
        this._ensureBanner();
    },

    _ensureBanner() {
        if (!document.getElementById('achievement-banner')) {
            const banner = document.createElement('div');
            banner.id = 'achievement-banner';
            // Title is i18n-tagged so the language toggle re-localizes it.
            banner.innerHTML = '<div class="ach-title" data-i18n="ach.unlocked">ACHIEVEMENT UNLOCKED</div><div class="ach-name"></div>';
            document.getElementById('game-container').appendChild(banner);
            if (window.I18N) I18N.apply(banner);
        }
    },

    check(stats, day) {
        this.definitions.forEach(def => {
            if (!this.unlocked.includes(def.id) && def.check(stats, day)) {
                this.unlock(def);
            }
        });
    },

    unlock(def) {
        this.unlocked.push(def.id);
        localStorage.setItem('nitrocycle_achievements', JSON.stringify(this.unlocked));
        this.showBanner(def);
        if (typeof Audio !== 'undefined' && Audio.achievement) {
            Audio.achievement();
        }
    },

    showBanner(def) {
        const banner = document.getElementById('achievement-banner');
        if (!banner) return;

        const nameEl = banner.querySelector('.ach-name');
        if (nameEl) {
            nameEl.textContent = (typeof window.t === 'function' && def.nameKey)
                ? window.t(def.nameKey)
                : (def.name || def.id);
        }

        banner.classList.add('show');
        setTimeout(() => banner.classList.remove('show'), 3000);
    },

    getUnlockedCount() {
        return this.unlocked.length;
    },

    getTotalCount() {
        return this.definitions.length;
    }
};

window.Achievements = Achievements;
