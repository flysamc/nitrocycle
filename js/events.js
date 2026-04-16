/**
 * Random Events - Retro Version
 *
 * Each event carries i18n keys (nameKey / msgKey) instead of raw text.
 * The id stays in English so game.js can switch on it for sounds/visuals.
 */

function _t(key, vars) {
    if (typeof window !== 'undefined' && typeof window.t === 'function') {
        return window.t(key, vars);
    }
    return key;
}

const Events = {
    events: [
        {
            id: 'LIGHTNING!',
            nameKey: 'event.lightning.name',
            chance: 0.07,
            effect: (nitrogen, plant) => {
                const fixed = 15;
                nitrogen.pools.n2 -= fixed;
                nitrogen.pools.nh4 += fixed;
                return { msgKey: 'event.lightning.msg', msgVars: { amount: fixed }, type: 'good' };
            }
        },
        {
            id: 'HEAVY RAIN',
            nameKey: 'event.heavyRain.name',
            chance: 0.15,
            effect: (nitrogen, plant) => {
                const leach = Math.floor(nitrogen.pools.no3 * 0.35);
                nitrogen.pools.no3 -= leach;
                nitrogen.pools.leached += leach;
                nitrogen.pools.organic += 3;
                return { msgKey: 'event.heavyRain.msg', msgVars: { amount: leach }, type: 'warning' };
            }
        },
        {
            id: 'DROUGHT',
            nameKey: 'event.drought.name',
            chance: 0.10,
            effect: (nitrogen, plant) => {
                plant.health -= 25;
                return { msgKey: 'event.drought.msg', type: 'bad' };
            }
        },
        {
            id: 'ACID RAIN',
            nameKey: 'event.acidRain.name',
            chance: 0.10,
            effect: (nitrogen, plant) => {
                plant.health -= 15;
                const no2Added = 12;
                nitrogen.pools.no2 += no2Added;
                return { msgKey: 'event.acidRain.msg', msgVars: { amount: no2Added }, type: 'bad' };
            }
        },
        {
            id: 'HEATWAVE',
            nameKey: 'event.heatwave.name',
            chance: 0.10,
            effect: (nitrogen, plant) => {
                const n2oSpike = 8 + Math.floor(Math.random() * 8);
                nitrogen.addN2o(n2oSpike);
                return { msgKey: 'event.heatwave.msg', msgVars: { amount: n2oSpike }, type: 'bad', heatwave: true };
            }
        },
        {
            id: 'LEAF FALL',
            nameKey: 'event.leafFall.name',
            chance: 0.08,
            effect: (nitrogen, plant) => {
                nitrogen.pools.organic += 10;
                return { msgKey: 'event.leafFall.msg', type: 'good' };
            }
        },
        {
            id: 'WORM PARTY',
            nameKey: 'event.wormParty.name',
            chance: 0.07,
            effect: (nitrogen, plant) => {
                const decomposed = Math.min(8, nitrogen.pools.organic);
                nitrogen.pools.organic -= decomposed;
                nitrogen.pools.nh4 += decomposed;
                return { msgKey: 'event.wormParty.msg', msgVars: { amount: decomposed }, type: 'good' };
            }
        },
        {
            id: 'FUNGI BOOST',
            nameKey: 'event.fungiBoost.name',
            chance: 0.04,
            effect: (nitrogen, plant) => {
                plant.health = Math.min(100, plant.health + 5);
                return { msgKey: 'event.fungiBoost.msg', type: 'good' };
            }
        },
        {
            id: 'BAD BACTERIA',
            nameKey: 'event.badBacteria.name',
            chance: 0.15,
            effect: (nitrogen, plant) => {
                const n2o = Math.floor(nitrogen.pools.no3 * 0.20);
                nitrogen.pools.no3 -= n2o;
                nitrogen.addN2o(n2o);
                return { msgKey: 'event.badBacteria.msg', msgVars: { amount: n2o }, type: 'bad' };
            }
        },
        {
            id: 'NITROSOMONAS BLOOM',
            nameKey: 'event.nitrosomonasBloom.name',
            chance: 0.12,
            effect: (nitrogen, plant) => {
                const amount = Math.min(15, nitrogen.pools.nh4);
                nitrogen.pools.nh4 -= amount;
                nitrogen.pools.no2 += amount;
                return { msgKey: 'event.nitrosomonasBloom.msg', msgVars: { amount }, type: 'neutral' };
            }
        },
        {
            id: 'NITROBACTER ACTIVE',
            nameKey: 'event.nitrobacterActive.name',
            chance: 0.08,
            effect: (nitrogen, plant) => {
                const amount = nitrogen.pools.no2;
                if (amount > 0) {
                    nitrogen.pools.no2 = 0;
                    nitrogen.pools.no3 += amount;
                    return { msgKey: 'event.nitrobacterActive.msg', msgVars: { amount }, type: 'good' };
                }
                return { msgKey: 'event.nitrobacterActive.empty', type: 'neutral' };
            }
        },
        {
            id: 'RHIZOBIUM BONUS',
            nameKey: 'event.rhizobiumBonus.name',
            chance: 0.05,
            effect: (nitrogen, plant) => {
                if (plant.stage > 0) {
                    const fixed = 8;
                    nitrogen.pools.n2 -= fixed;
                    nitrogen.pools.nh4 += fixed;
                    return { msgKey: 'event.rhizobiumBonus.msg', msgVars: { amount: fixed }, type: 'good' };
                }
                return { msgKey: 'event.rhizobiumBonus.noRoots', type: 'neutral' };
            }
        },
        {
            id: 'TOXIC RUNOFF',
            nameKey: 'event.toxicRunoff.name',
            chance: 0.08,
            effect: (nitrogen, plant) => {
                const leach = 10 + Math.floor(Math.random() * 10);
                nitrogen.pools.leached += leach;
                plant.health -= 5;
                return { msgKey: 'event.toxicRunoff.msg', msgVars: { amount: leach }, type: 'bad' };
            }
        },
        {
            id: 'PEST ATTACK',
            nameKey: 'event.pestAttack.name',
            chance: 0.08,
            effect: (nitrogen, plant) => {
                const damage = 10 + Math.floor(Math.random() * 15);
                plant.health -= damage;
                nitrogen.pools.organic += Math.floor(damage / 2);
                return { msgKey: 'event.pestAttack.msg', msgVars: { amount: damage }, type: 'bad' };
            }
        }
    ],

    // Resolve a fired event into display strings.
    _resolve(eventDef, raw) {
        const name = _t(eventDef.nameKey);
        const message = _t(raw.msgKey, raw.msgVars);
        return {
            name,
            id: eventDef.id,
            // Keep the bag of structured fields on `result` so chained-event
            // appending in roll() can re-localize correctly.
            result: {
                msgKey: raw.msgKey,
                msgVars: raw.msgVars,
                message,
                type: raw.type,
                heatwave: raw.heatwave
            }
        };
    },

    roll(nitrogen, plant) {
        // Escalating difficulty: more events in later days
        const day = (window.Game && Game.day) || 1;
        const eventBoost = 1 + (day - 1) * 0.03;  // +3% more events per day

        // Can trigger up to 2 events per day in late game
        let triggered = null;
        for (const event of this.events) {
            if (Math.random() < event.chance * eventBoost) {
                const raw = event.effect(nitrogen, plant);
                if (!triggered) {
                    triggered = this._resolve(event, raw);
                } else if (day > 10 && Math.random() < 0.3) {
                    // Late game: chain events
                    const chainName = _t(event.nameKey);
                    triggered.result.message += ` + ${chainName}!`;
                    event.effect(nitrogen, plant);
                    break;
                } else {
                    break;
                }
            }
        }
        return triggered;
    }
};

window.Events = Events;
