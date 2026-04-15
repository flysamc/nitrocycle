/**
 * Plant System - Retro Version
 */

const Plant = {
    stage: 0,
    health: 100,
    totalNitrogen: 0,

    // Stage display names live as i18n keys; getStageName() resolves them.
    stageKeys: ['plant.stage.seed', 'plant.stage.sprout', 'plant.stage.sapling', 'plant.stage.young', 'plant.stage.tree'],
    // Kept for backwards compatibility (some saves / tests may read this directly)
    stageNames: ['SEED', 'SPROUT', 'SAPLING', 'YOUNG TREE', 'TREE'],
    stageThresholds: [0, 80, 220, 420, 700],

    init() {
        this.stage = 0;
        this.health = 100;
        this.totalNitrogen = 0;
    },

    feed(amount) {
        this.totalNitrogen += amount;
        this.health = Math.min(100, this.health + Math.floor(amount / 5));

        // Check for growth
        const grew = this.checkGrowth();

        return {
            grew: grew,
            stage: this.stage,
            stageName: this.getStageName(),
            health: this.health,
            totalN: this.totalNitrogen
        };
    },

    checkGrowth() {
        if (this.stage >= 4) return false;

        const nextThreshold = this.stageThresholds[this.stage + 1];
        if (this.totalNitrogen >= nextThreshold) {
            this.stage++;
            return true;
        }
        return false;
    },

    update(pools, temperature) {
        const messages = [];
        let organicReturn = 0;
        temperature = temperature || 20;

        // Helper: push a message that is resolved at *display* time so it
        // re-localizes when the user switches language.
        const _t = (key, vars) =>
            (typeof window !== 'undefined' && typeof window.t === 'function')
                ? window.t(key, vars)
                : key;

        // Natural leaf drop / root exudates (plants recycle nitrogen!)
        // Bigger plants drop more organic matter back to soil
        if (this.stage > 0) {
            organicReturn += this.stage * 2; // 2-8 depending on plant size
            messages.push({ text: _t('plant.msg.leafLitter', { amount: this.stage * 2 }), type: 'neutral' });
        }

        // Starvation damage (harsher threshold)
        const availableN = pools.nh4 + pools.no3;
        if (availableN < 8 && this.stage > 0) {
            this.health -= 10;
            messages.push({ text: _t('plant.msg.hungry'), type: 'bad' });
            organicReturn += 3;
        }

        // Toxicity from high NO3 (lower threshold)
        if (pools.no3 > 70) {
            const damage = 5 + Math.floor((pools.no3 - 70) / 10);
            this.health -= damage;
            messages.push({ text: _t('plant.msg.no3Toxic', { amount: damage }), type: 'bad' });
        }

        // NO2 is toxic! (nitrite poisoning) - lower threshold, steeper damage
        if (pools.no2 > 15) {
            const damage = Math.floor((pools.no2 - 10) / 3);
            this.health -= damage;
            messages.push({ text: _t('plant.msg.no2Toxic', { amount: damage }), type: 'bad' });
            organicReturn += damage;
        }

        // N2O damage (greenhouse gas) - scales steeply at critical levels
        if (pools.n2o > 10) {
            let damage;
            if (pools.n2o > 35) {
                // Critical: massive damage ramp
                damage = 10 + Math.floor((pools.n2o - 35) / 3);
            } else {
                damage = 3 + Math.floor((pools.n2o - 10) / 5);
            }
            this.health -= damage;
            messages.push({ text: _t('plant.msg.n2oDamage', { amount: damage }), type: 'bad' });
        }

        // Temperature damage - much harsher at extreme
        if (temperature > 30 && temperature <= 40) {
            this.health -= 2;
            messages.push({ text: _t('plant.msg.heatStress'), type: 'warning' });
        } else if (temperature > 40 && temperature <= 50) {
            const damage = 5 + Math.floor((temperature - 40) / 3);
            this.health -= damage;
            organicReturn += 3;
            messages.push({ text: _t('plant.msg.heatDamage', { amount: damage }), type: 'bad' });
        } else if (temperature > 50) {
            const damage = 12 + Math.floor((temperature - 50) / 2);
            this.health -= damage;
            organicReturn += 5;
            messages.push({ text: _t('plant.msg.burning', { amount: damage }), type: 'bad' });
        }

        // Eutrophication damage - scales with leached amount
        if (pools.leached > 40) {
            const damage = 2 + Math.floor((pools.leached - 40) / 10);
            this.health -= damage;
            messages.push({ text: _t('plant.msg.pollution', { amount: damage }), type: 'bad' });
        }

        // Natural health recovery if well-fed (very hard to recover)
        if (availableN > 40 && this.health < 100) {
            const recovery = Math.min(1, 100 - this.health);
            this.health += recovery;
            messages.push({ text: _t('plant.msg.recovering', { amount: recovery }), type: 'good' });
        }

        // Clamp health
        this.health = Math.max(0, Math.min(100, this.health));

        // Return organic matter to soil
        if (organicReturn > 0 && window.Nitrogen) {
            Nitrogen.pools.organic = Math.min(
                Nitrogen.pools.organic + organicReturn,
                Nitrogen.maxValues.organic
            );
        }

        return { messages };
    },

    isDead() {
        return this.health <= 0;
    },

    hasWon() {
        return this.stage >= 4;
    },

    getStageName() {
        const key = this.stageKeys[this.stage];
        if (typeof window !== 'undefined' && typeof window.t === 'function' && key) {
            return window.t(key);
        }
        return this.stageNames[this.stage];
    },

    getProgress() {
        if (this.stage >= 4) return 100;
        const current = this.stageThresholds[this.stage];
        const next = this.stageThresholds[this.stage + 1];
        return Math.floor(((this.totalNitrogen - current) / (next - current)) * 100);
    }
};

window.Plant = Plant;
