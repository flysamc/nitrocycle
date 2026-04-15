/**
 * Nitrogen Cycle System - Educational Version
 *
 * Complete nitrogen cycle with all major molecules:
 *
 * ATMOSPHERE:
 *   N₂ (Dinitrogen) - 78% of air, very stable triple bond
 *
 * SOIL POOLS:
 *   NH₄⁺ (Ammonium) - "Good nitrogen", plants can absorb directly
 *   NO₂⁻ (Nitrite) - Toxic intermediate, quickly converted to NO₃⁻
 *   NO₃⁻ (Nitrate) - Mobile, plants love it but easily leaches
 *   Organic N - Dead matter (proteins, amino acids)
 *
 * LOSSES:
 *   N₂O (Nitrous Oxide) - Greenhouse gas! 300x worse than CO₂
 *   Leached NO₃⁻ - Groundwater pollution
 *
 * KEY PROCESSES:
 *   1. N₂ Fixation: N₂ → NH₄⁺ (by Rhizobium, Azotobacter bacteria)
 *   2. Ammonification: Organic N → NH₄⁺ (decomposer bacteria & fungi)
 *   3. Nitrification Step 1: NH₄⁺ → NO₂⁻ (by Nitrosomonas bacteria)
 *   4. Nitrification Step 2: NO₂⁻ → NO₃⁻ (by Nitrobacter bacteria)
 *   5. Denitrification: NO₃⁻ → N₂O → N₂ (by Pseudomonas, anaerobic)
 *   6. Plant Uptake: NH₄⁺/NO₃⁻ → Plant biomass
 *   7. Leaching: NO₃⁻ → Groundwater (rain washes it down)
 */

// Local i18n helper. Falls back to the key if i18n hasn't loaded yet.
function _t(key, vars) {
    if (typeof window !== 'undefined' && typeof window.t === 'function') {
        return window.t(key, vars);
    }
    return key;
}

const Nitrogen = {
    pools: {
        n2: 250,        // Atmospheric N₂ (infinite supply)
        nh4: 20,        // Ammonium (NH₄⁺)
        no2: 0,         // Nitrite (NO₂⁻) - toxic intermediate
        no3: 15,        // Nitrate (NO₃⁻)
        organic: 100,   // Organic nitrogen (leaf litter, dead matter)
        n2o: 0,         // Nitrous oxide (greenhouse gas)
        leached: 0      // Leached to groundwater (pollution)
    },

    maxValues: {
        n2: 250,
        nh4: 100,
        no2: 50,        // Usually stays low (toxic!)
        no3: 100,
        organic: 150,
        n2o: 50,
        leached: 100
    },

    // Process rates (balanced for sustainable gameplay)
    rates: {
        fixation: 12,           // N₂ → NH₄⁺
        ammonification: 10,     // Organic → NH₄⁺
        nitrification1: 8,      // NH₄⁺ → NO₂⁻
        nitrification2: 10,     // NO₂⁻ → NO₃⁻
        denitrification: 6,     // NO₃⁻ → N₂O/N₂
        plantUptake: 10         // Reduced so plants don't eat everything
    },

    // Educational info for each pool. nameKey/descKey are i18n keys; the
    // `name` / `description` fields stay as English fallbacks for code that
    // hasn't been migrated. Formula and color are universal.
    info: {
        n2: {
            nameKey: 'pool.n2.name', descKey: 'pool.n2.desc',
            name: 'Dinitrogen', formula: 'N₂',
            description: '78% of atmosphere. Very stable triple bond (N≡N). Plants cannot use directly!',
            color: '#41a6f6'
        },
        nh4: {
            nameKey: 'pool.nh4.name', descKey: 'pool.nh4.desc',
            name: 'Ammonium', formula: 'NH₄⁺',
            description: 'Plant-available! Produced by nitrogen fixation and decomposition.',
            color: '#73eff7'
        },
        no2: {
            nameKey: 'pool.no2.name', descKey: 'pool.no2.desc',
            name: 'Nitrite', formula: 'NO₂⁻',
            description: 'Toxic intermediate! Quickly converted to nitrate by Nitrobacter bacteria.',
            color: '#f77622'
        },
        no3: {
            nameKey: 'pool.no3.name', descKey: 'pool.no3.desc',
            name: 'Nitrate', formula: 'NO₃⁻',
            description: 'Plants love it! But very mobile - easily leaches into groundwater.',
            color: '#a7f070'
        },
        organic: {
            nameKey: 'pool.organic.name', descKey: 'pool.organic.desc',
            name: 'Organic N', formula: 'R-NH₂',
            description: 'Dead plants & animals. Contains proteins and amino acids.',
            color: '#a77b5b'
        },
        n2o: {
            nameKey: 'pool.n2o.name', descKey: 'pool.n2o.desc',
            name: 'Nitrous Oxide', formula: 'N₂O',
            description: 'Greenhouse gas! 300x more potent than CO₂. Avoid producing this!',
            color: '#e43b44'
        },
        leached: {
            nameKey: 'pool.leached.longName', descKey: 'pool.leached.desc',
            name: 'Leached Nitrate', formula: 'NO₃⁻',
            description: 'Pollution! Causes algal blooms and dead zones in water.',
            color: '#b55088'
        }
    },

    init() {
        this.pools = {
            n2: 250,       // Atmosphere is always full
            nh4: 20,       // Start with more ammonium
            no2: 0,
            no3: 15,       // Start with more nitrate
            organic: 100,  // Plenty of organic matter to start
            n2o: 0,
            leached: 0
        };
    },

    // ========== PROCESSES ==========

    /**
     * Nitrogen Fixation: N₂ → NH₄⁺ (with some N₂O byproduct)
     * Done by: Rhizobium (in root nodules), Azotobacter (free-living)
     * Requires: Energy (ATP), enzyme nitrogenase
     * In nature, fixation can produce small amounts of N₂O as byproduct
     */
    fix() {
        const amount = this.rates.fixation;

        if (this.pools.n2 < amount) {
            return {
                success: false,
                messageKey: 'proc.needN2',
                message: _t('proc.needN2'),
                type: 'warning',
                process: 'fixation'
            };
        }

        this.pools.n2 -= amount;

        // N2O byproduct (30% of the time, 25% of fixation amount)
        let n2oByproduct = 0;
        if (Math.random() < 0.3) {
            n2oByproduct = Math.floor(amount * 0.25);
            this.pools.n2o += n2oByproduct;
        }

        const nh4Produced = amount - n2oByproduct;
        this.pools.nh4 += nh4Produced;

        let detailKey = 'proc.fixedDetail';
        let detailVars = null;
        let type = 'good';
        if (n2oByproduct > 0) {
            detailKey = 'proc.fixedDetailN2o';
            detailVars = { amount: n2oByproduct };
            type = 'neutral';
        }

        return {
            success: true,
            amount: nh4Produced,
            messageKey: 'proc.fixed',
            messageVars: { amount: nh4Produced },
            message: _t('proc.fixed', { amount: nh4Produced }),
            detailKey: detailKey,
            detailVars: detailVars,
            detail: _t(detailKey, detailVars),
            type: type,
            process: 'fixation',
            from: 'n2',
            to: 'nh4'
        };
    },

    /**
     * Ammonification: Organic N → NH₄⁺ (+ some NO₂⁻ byproduct)
     * Done by: Decomposer bacteria, fungi
     * Breaks down proteins and amino acids
     * In nature, decomposition also produces some toxic intermediates
     */
    decompose() {
        const amount = this.rates.ammonification;

        if (this.pools.organic < amount) {
            return {
                success: false,
                messageKey: 'proc.needOrganic',
                message: _t('proc.needOrganic'),
                type: 'warning',
                process: 'ammonification'
            };
        }

        this.pools.organic -= amount;

        // Most becomes NH4+, but some toxic NO2- is produced as byproduct
        const toxicByproduct = Math.floor(amount * 0.30); // 30% becomes NO2-
        const nh4Produced = amount - toxicByproduct;

        this.pools.nh4 += nh4Produced;
        this.pools.no2 += toxicByproduct;

        let detailKey = 'proc.decomposedDetail';
        let detailVars = null;
        let type = 'good';
        if (toxicByproduct > 0) {
            detailKey = 'proc.decomposedDetailToxic';
            detailVars = { amount: toxicByproduct };
            type = 'neutral';
        }

        return {
            success: true,
            amount: amount,
            messageKey: 'proc.decomposed',
            messageVars: { amount: nh4Produced },
            message: _t('proc.decomposed', { amount: nh4Produced }),
            detailKey: detailKey,
            detailVars: detailVars,
            detail: _t(detailKey, detailVars),
            type: type,
            process: 'ammonification',
            from: 'organic',
            to: 'nh4'
        };
    },

    /**
     * Nitrification Step 1: NH₄⁺ → NO₂⁻
     * Done by: Nitrosomonas bacteria
     * Requires: Oxygen (aerobic process)
     * Strategic: First step to create NO₃⁻ (which gives 50% feed bonus!)
     * Risk: Creates toxic NO₂⁻ — must follow up with Nitrify2!
     */
    nitrify1() {
        const amount = this.rates.nitrification1;

        if (this.pools.nh4 < amount) {
            return {
                success: false,
                messageKey: 'proc.needNh4',
                message: _t('proc.needNh4'),
                type: 'warning',
                process: 'nitrification1'
            };
        }

        this.pools.nh4 -= amount;
        this.pools.no2 += amount;

        return {
            success: true,
            amount: amount,
            messageKey: 'proc.nitrified1',
            messageVars: { amount },
            message: _t('proc.nitrified1', { amount }),
            detailKey: 'proc.nitrified1Detail',
            detail: _t('proc.nitrified1Detail'),
            type: 'neutral',
            process: 'nitrification1',
            from: 'nh4',
            to: 'no2'
        };
    },

    /**
     * Nitrification Step 2: NO₂⁻ → NO₃⁻
     * Done by: Nitrobacter bacteria
     * Requires: Oxygen (aerobic process)
     * Strategic: Removes toxic NO₂⁻ AND creates NO₃⁻ (50% feed bonus!)
     */
    nitrify2() {
        const amount = this.rates.nitrification2;

        if (this.pools.no2 < amount) {
            return {
                success: false,
                messageKey: 'proc.needNo2',
                message: _t('proc.needNo2'),
                type: 'warning',
                process: 'nitrification2'
            };
        }

        this.pools.no2 -= amount;
        this.pools.no3 += amount;

        return {
            success: true,
            amount: amount,
            messageKey: 'proc.nitrified2',
            messageVars: { amount },
            message: _t('proc.nitrified2', { amount }),
            detailKey: 'proc.nitrified2Detail',
            detail: _t('proc.nitrified2Detail'),
            type: 'good',
            process: 'nitrification2',
            from: 'no2',
            to: 'no3'
        };
    },

    /**
     * Denitrification: NO₃⁻ → N₂O or N₂
     * Done by: Pseudomonas and other anaerobic bacteria
     * Strategic PURPOSE: Pressure valve when NO₃⁻ is dangerously high!
     *   - NO₃⁻ > 70 = toxicity damage to plant
     *   - NO₃⁻ leaches heavily in rain → water pollution
     *   - So sometimes you MUST denitrify to reduce NO₃⁻ pressure
     * Risk: 35% chance of N₂O (greenhouse gas)
     * Reward: Prevents leaching AND gives score bonus when NO₃⁻ was high
     */
    denitrify() {
        const amount = this.rates.denitrification;

        if (this.pools.no3 < amount) {
            return {
                success: false,
                messageKey: 'proc.needNo3',
                message: _t('proc.needNo3'),
                type: 'warning',
                process: 'denitrification'
            };
        }

        this.pools.no3 -= amount;

        // N₂O chance is 35% base, but LOWER when NO₃⁻ is high
        // (more substrate = more complete denitrification - scientifically accurate)
        const no3Level = this.pools.no3 + amount; // level before we removed
        const n2oChance = no3Level > 50 ? 0.20 : 0.35;
        const wasEmergency = no3Level > 60;

        if (Math.random() < n2oChance) {
            this.pools.n2o += amount;
            return {
                success: true,
                amount: amount,
                messageKey: 'proc.denitrifiedN2o',
                messageVars: { amount },
                message: _t('proc.denitrifiedN2o', { amount }),
                detailKey: 'proc.denitrifiedN2oDetail',
                detail: _t('proc.denitrifiedN2oDetail'),
                type: 'bad',
                process: 'denitrification',
                from: 'no3',
                to: 'n2o',
                wasEmergency: wasEmergency
            };
        } else {
            this.pools.n2 += amount;
            const detailKey = wasEmergency ? 'proc.denitrifiedSafeEmergency' : 'proc.denitrifiedSafeNormal';
            return {
                success: true,
                amount: amount,
                messageKey: 'proc.denitrifiedSafe',
                messageVars: { amount },
                message: _t('proc.denitrifiedSafe', { amount }),
                detailKey: detailKey,
                detail: _t(detailKey),
                type: 'good',
                process: 'denitrification',
                from: 'no3',
                to: 'n2',
                wasEmergency: wasEmergency
            };
        }
    },

    /**
     * Plant Uptake: NH₄⁺ or NO₃⁻ → Plant
     * NO₃⁻ gives a 50% absorption BONUS (reward for nitrifying!)
     * NH₄⁺ is direct but less efficient
     * This makes the Nitrify1→Nitrify2 path strategically valuable
     */
    feedPlant() {
        const amount = this.rates.plantUptake;
        let absorbed = 0;
        let source = '';
        let from = '';
        let bonus = 0;

        // Prefer NO₃⁻ (gives 50% bonus - reward for using the full cycle!)
        if (this.pools.no3 >= amount) {
            this.pools.no3 -= amount;
            bonus = Math.floor(amount * 0.5);
            absorbed = amount + bonus;
            source = 'NO₃⁻';
            from = 'no3';
        } else if (this.pools.nh4 >= amount) {
            this.pools.nh4 -= amount;
            absorbed = amount;
            source = 'NH₄⁺';
            from = 'nh4';
        } else if (this.pools.nh4 + this.pools.no3 >= amount) {
            const fromNO3 = Math.min(this.pools.no3, amount);
            const fromNH4 = amount - fromNO3;
            this.pools.no3 -= fromNO3;
            this.pools.nh4 -= fromNH4;
            // Partial bonus proportional to NO3 used
            bonus = Math.floor(fromNO3 * 0.5);
            absorbed = amount + bonus;
            source = 'NH₄⁺ + NO₃⁻';
            from = 'both';
        } else {
            return {
                success: false,
                messageKey: 'proc.needN',
                message: _t('proc.needN'),
                type: 'warning',
                process: 'uptake'
            };
        }

        const messageKey = bonus > 0 ? 'proc.plantAteBonus' : 'proc.plantAte';
        const messageVars = { amount: absorbed, source, bonus };
        const detailKey = bonus > 0 ? 'proc.plantAteBonusDetail' : 'proc.plantAteDetail';
        const detailVars = bonus > 0 ? { bonus } : null;

        return {
            success: true,
            amount: absorbed,
            bonus: bonus,
            messageKey,
            messageVars,
            message: _t(messageKey, messageVars),
            detailKey,
            detailVars,
            detail: _t(detailKey, detailVars),
            type: 'good',
            process: 'uptake',
            from: from,
            to: 'plant'
        };
    },

    /**
     * End of turn natural processes
     * Simulates realistic nitrogen cycle with natural toxic compound production
     */
    endTurn(moisture, oxygen, diffMult) {
        diffMult = diffMult || 1;
        const results = [];

        // N₂ is essentially INFINITE (atmosphere is 78% nitrogen!)
        // Always replenish to max
        this.pools.n2 = this.maxValues.n2;

        // ===== NATURAL INPUTS =====
        // Organic matter naturally accumulates (leaf litter, dead insects, etc.)
        // This keeps the cycle going!
        if (this.pools.organic < this.maxValues.organic) {
            const naturalInput = 2 + Math.floor(Math.random() * 3); // 2-4 per turn
            this.pools.organic = Math.min(this.pools.organic + naturalInput, this.maxValues.organic);
            results.push({ message: _t('turn.organicNatural', { amount: naturalInput }), type: 'good' });
        }

        // ===== DECOMPOSITION =====
        // Natural decomposition of organic matter (slow background process)
        if (this.pools.organic > 15) {
            const naturalDecomp = Math.floor(this.pools.organic * 0.03); // Slower rate
            if (naturalDecomp > 0) {
                this.pools.organic -= naturalDecomp;
                const nh4Part = Math.floor(naturalDecomp * 0.85);
                const no2Part = naturalDecomp - nh4Part;
                this.pools.nh4 += nh4Part;
                this.pools.no2 += no2Part;
                results.push({ message: _t('turn.decay', { amount: naturalDecomp }), type: 'neutral' });
            }
        }

        // ===== NATURAL NITRIFICATION =====
        // Bacteria in soil naturally convert NH₄⁺ → NO₂⁻ (this creates pressure!)
        // Player must use Nitrify2 to clear NO₂⁻ before it damages the plant
        if (this.pools.nh4 > 5 && oxygen > 40) {
            const convert = Math.floor(this.pools.nh4 * 0.20 * diffMult);
            if (convert > 0) {
                this.pools.nh4 -= convert;
                this.pools.no2 += convert;
                results.push({ message: _t('turn.naturalNitrify', { amount: convert }), type: 'warning' });
            }
        }

        // NO₂⁻ converts to NO₃⁻ SLOWLY (Nitrobacter is sluggish without player help)
        // This means NO₂⁻ lingers and damages plant unless player uses Nitrify2!
        if (this.pools.no2 > 0) {
            const convert = Math.ceil(this.pools.no2 * 0.25); // Slower than before (was 0.5)
            this.pools.no2 -= convert;

            if (oxygen < 45 && Math.random() < 0.4) {
                // Low oxygen: some NO2 becomes N2O (bad!)
                const n2oPart = Math.floor(convert * 0.30);
                this.pools.n2o += n2oPart;
                this.pools.no3 += convert - n2oPart;
                if (n2oPart > 0) {
                    results.push({ message: _t('turn.lowO2N2o', { amount: n2oPart }), type: 'bad' });
                }
            } else {
                this.pools.no3 += convert;
            }
            if (convert > 0) {
                results.push({ message: _t('turn.slowNitrify', { amount: convert }), type: 'neutral' });
            }
        }

        // ===== LOSSES =====
        // Leaching based on moisture - aggressive rate, scales with difficulty
        if (moisture > 40 && this.pools.no3 > 5) {
            const leachRate = ((moisture - 35) / 120) * diffMult;
            const leach = Math.max(1, Math.floor(this.pools.no3 * leachRate));
            if (leach > 0) {
                this.pools.no3 -= leach;
                this.pools.leached += leach;
                // Expose the numeric amount so Game.completeDay() doesn't have
                // to regex-parse the translated message string.
                results.push({ message: _t('turn.leached', { amount: leach }), type: 'warning', leached: leach });
            }
        }

        // Denitrification in very waterlogged soil (low oxygen)
        if (oxygen < 30 && this.pools.no3 > 12) {
            const denitrify = Math.floor(this.pools.no3 * 0.1);
            if (denitrify > 0) {
                this.pools.no3 -= denitrify;
                // Lower oxygen = more incomplete denitrification = more N2O
                const n2oChance = (30 - oxygen) / 40;
                if (Math.random() < n2oChance) {
                    this.pools.n2o += denitrify;
                    results.push({ message: _t('turn.anaerobicN2o', { amount: denitrify }), type: 'bad' });
                } else {
                    this.pools.n2 += denitrify;
                    results.push({ message: _t('turn.denitrifiedSafe', { amount: denitrify }), type: 'neutral' });
                }
            }
        }

        // N₂O slowly dissipates to atmosphere (lingers longer)
        if (this.pools.n2o > 0) {
            const dissipate = Math.ceil(this.pools.n2o * 0.03); // Even slower dissipation
            this.pools.n2o -= dissipate;
        }

        // Clamp all pools
        for (const pool of Object.keys(this.pools)) {
            this.pools[pool] = Math.max(0, Math.min(this.pools[pool], this.maxValues[pool]));
        }

        return results;
    },

    // Get total available nitrogen for plants
    getAvailableN() {
        return this.pools.nh4 + this.pools.no3;
    },

    // Get pool info for tooltips
    getPoolInfo(poolId) {
        return this.info[poolId] || null;
    }
};

window.Nitrogen = Nitrogen;
