/**
 * i18n - English / German translations for NitroCycle
 *
 * Usage:
 *   t('some.key')                  -> localized string
 *   t('some.key', { amount: 5 })   -> "{amount}" replaced with 5
 *   setLang('de')                  -> switch language, re-render UI
 *   getLang()                      -> current code ('en' | 'de')
 *
 * HTML:
 *   <el data-i18n="key">           -> element.textContent  = t(key)
 *   <el data-i18n-html="key">      -> element.innerHTML    = t(key)
 *   <el data-i18n-title="key">     -> element.title        = t(key)
 *   <el data-i18n-tooltip="key">   -> data-tooltip         = t(key)
 *   <el data-i18n-alt="key">       -> alt                  = t(key)
 *   <el data-i18n-aria="key">      -> aria-label           = t(key)
 *
 * Chemistry symbols (N₂, NH₄⁺, NO₂⁻, NO₃⁻, N₂O, R-NH₂) and
 * Latin bacteria names (Rhizobium, Nitrosomonas, Nitrobacter, Pseudomonas)
 * are intentionally the same in both languages.
 */

const STRINGS = {
    en: {
        // ===== Loading / Menu =====
        'loading.subtitle': 'Learn the Nitrogen Cycle!',
        'loading.text': 'Loading assets...',
        'menu.title': 'NITROCYCLE',
        'menu.tagline': 'Master the Nitrogen Cycle!',
        'menu.selectDifficulty': 'SELECT DIFFICULTY',
        'menu.diff.easy': 'EASY',
        'menu.diff.easy.desc': '18s days, slow scaling, $50',
        'menu.diff.normal': 'NORMAL',
        'menu.diff.normal.desc': '12s days, standard, $30',
        'menu.diff.hard': 'HARD',
        'menu.diff.hard.desc': '9s days, fast scaling, $20',
        'menu.howToPlay': '? HOW TO PLAY',
        'menu.loadSave': '📂 LOAD SAVE',
        'menu.leaderboard': '🏆 LEADERBOARD',
        'menu.quickGuide': 'QUICK GUIDE',
        'menu.qg.fix': '<span class="qg-key">FIX</span> Convert N₂ → NH₄⁺ (basic plant food)',
        'menu.qg.nitrify': '<span class="qg-key">NITRIFY</span> NH₄⁺ → NO₂⁻ → NO₃⁻ (<strong>+50% feed bonus!</strong>)',
        'menu.qg.feed': '<span class="qg-key">FEED</span> Give nitrogen to your plant to grow it',
        'menu.qg.denitrify': '<span class="qg-key">DENITRIFY</span> Reduce NO₃⁻ when it\'s dangerously high',
        'menu.qg.avoid': '<span class="qg-key">⚠</span> Avoid N₂O (greenhouse gas) & leaching!',

        // ===== Header =====
        'header.pools': 'POOLS',
        'header.status': 'STATUS',
        'header.sfx': 'SFX',
        'header.bgm': 'BGM',
        'header.help': '?',
        'header.day': 'DAY',
        'header.score': 'SCORE',
        'tip.togglePools': 'Show/hide nitrogen pools',
        'tip.toggleStatus': 'Show/hide plant status',
        'tip.toggleSound': 'Toggle Sound',
        'tip.toggleMusic': 'Toggle Music',
        'tip.pause': 'Pause game (P)',
        'tip.help': 'Help',
        'tip.leaderboard': 'Leaderboard',
        'tip.speed': 'Game speed (½× / 1× / 2×)',
        'speed.half': 'Half speed',
        'speed.normal': 'Normal speed',
        'speed.double': 'Double speed',
        'tip.lang': 'Change language / Sprache wechseln',

        // ===== Panels =====
        'panel.pools': 'NITROGEN POOLS',
        'panel.atmosphere': 'ATMOSPHERE',
        'panel.soil': 'SOIL',
        'panel.losses': 'LOSSES (BAD!)',
        'panel.environment': 'ENVIRONMENT',
        'panel.plantHealth': 'PLANT HEALTH',
        'panel.atmo': 'ATMOSPHERE',
        'panel.water': 'WATER',
        'panel.temperature': 'TEMPERATURE',
        'env.moisture': 'Moisture',
        'env.oxygen': 'Oxygen',
        'pool.clickForInfo': 'Click for info',

        // ===== Pool names & descriptions =====
        'pool.n2.name': 'Dinitrogen',
        'pool.n2.desc': '78% of atmosphere. Very stable triple bond (N≡N). Plants cannot use directly!',
        'pool.nh4.name': 'Ammonium',
        'pool.nh4.desc': 'Plant-available! Produced by nitrogen fixation and decomposition.',
        'pool.no2.name': 'Nitrite',
        'pool.no2.desc': 'Toxic intermediate! Quickly converted to nitrate by Nitrobacter bacteria.',
        'pool.no3.name': 'Nitrate',
        'pool.no3.desc': 'Plants love it! But very mobile - easily leaches into groundwater.',
        'pool.organic.name': 'Organic N',
        'pool.organic.desc': 'Dead plants & animals. Contains proteins and amino acids.',
        'pool.n2o.name': 'Nitrous Oxide',
        'pool.n2o.desc': 'Greenhouse gas! 300x more potent than CO₂. Avoid producing this!',
        'pool.leached.name': 'Leached',
        'pool.leached.longName': 'Leached Nitrate',
        'pool.leached.desc': 'Pollution! Causes algal blooms and dead zones in water.',

        // ===== Action buttons =====
        'btn.fix.label': 'FIX',
        'btn.fix.bact': 'Rhizobium',
        'btn.fix.tip': 'N₂ → NH₄⁺ via Rhizobium bacteria. Converts atmospheric nitrogen into plant-usable ammonium.',
        'btn.decompose.label': 'DECOMPOSE',
        'btn.decompose.bact': 'Bacteria',
        'btn.decompose.tip': 'Organic N → NH₄⁺ via decomposer bacteria. Breaks down dead matter into usable nitrogen.',
        'btn.nitrify1.label': 'NITRIFY 1',
        'btn.nitrify1.bact': 'Nitrosomonas',
        'btn.nitrify1.tip': 'NH₄⁺ → NO₂⁻ via Nitrosomonas. Step 1 of nitrification. Follow with Nitrify2 to get NO₃⁻ which gives +50% FEED BONUS!',
        'btn.nitrify2.label': 'NITRIFY 2',
        'btn.nitrify2.bact': 'Nitrobacter',
        'btn.nitrify2.tip': 'NO₂⁻ → NO₃⁻ via Nitrobacter. Removes TOXIC nitrite! NO₃⁻ gives +50% FEED BONUS vs NH₄⁺!',
        'btn.feed.label': 'FEED',
        'btn.feed.bact': 'Root uptake',
        'btn.feed.tip': 'Feed nitrogen to your plant! NO₃⁻ gives +50% BONUS absorption. NH₄⁺ is direct but less efficient.',
        'btn.denitrify.label': 'DENITRIFY',
        'btn.denitrify.bact': 'Pseudomonas',
        'btn.denitrify.tip': 'NO₃⁻ → N₂/N₂O via Pseudomonas. PRESSURE VALVE! Use when NO₃⁻ is high to prevent leaching & toxicity. 35% N₂O risk.',

        // ===== Shop =====
        'shop.label': 'SHOP',
        'shop.cleanWater.name': 'CLEAN WATER',
        'shop.cleanWater.tip': 'Reduce leached NO₃⁻ by 55%. Cleans polluted groundwater.',
        'shop.scrubAtmo.name': 'SCRUB ATMO',
        'shop.scrubAtmo.tip': 'Reduce N₂O by 55% and cool temperature by 2°C.',
        'shop.plantTree.name': 'PLANT TREE',
        'shop.plantTree.tip': 'Plant a companion tree. +10 HP, +15 total nitrogen absorbed.',
        'shop.heal.name': 'HEAL',
        'shop.heal.tip': 'Emergency healing for your plant. +15 HP instantly.',

        // ===== Action panel =====
        'action.dayTime': 'DAY TIME: {seconds}s',

        // ===== Plant card =====
        'plant.nAbsorbed': 'N absorbed:',
        'plant.dot.seed': 'Seed',
        'plant.dot.sprout': 'Sprout',
        'plant.dot.sapling': 'Sapling',
        'plant.dot.young': 'Young Tree',
        'plant.dot.tree': 'Tree',
        'plant.alt': 'Plant',
        'plant.stage.seed': 'SEED',
        'plant.stage.sprout': 'SPROUT',
        'plant.stage.sapling': 'SAPLING',
        'plant.stage.young': 'YOUNG TREE',
        'plant.stage.tree': 'TREE',
        'plant.hp': '{hp} HP',

        // ===== Plant feedback messages =====
        'plant.msg.leafLitter': 'Leaf litter: +{amount} organic',
        'plant.msg.hungry': 'PLANT HUNGRY! -10 HP',
        'plant.msg.no3Toxic': 'NO₃⁻ TOXICITY! -{amount} HP',
        'plant.msg.no2Toxic': 'NO₂⁻ TOXIC! -{amount} HP',
        'plant.msg.n2oDamage': 'N₂O DAMAGE! -{amount} HP',
        'plant.msg.heatStress': 'HEAT STRESS! -2 HP',
        'plant.msg.heatDamage': 'HEAT DAMAGE! -{amount} HP',
        'plant.msg.burning': 'BURNING! -{amount} HP',
        'plant.msg.pollution': 'WATER POLLUTION! -{amount} HP',
        'plant.msg.recovering': 'Plant recovering: +{amount} HP',

        // ===== Atmosphere & Water quality =====
        'atmo.critical': 'Critical',
        'atmo.smoggy': 'Smoggy',
        'atmo.hazy': 'Hazy',
        'atmo.clean': 'Clean',
        'water.deadZone': 'Dead Zone',
        'water.algaeBloom': 'Algae Bloom',
        'water.murky': 'Murky',
        'water.clean': 'Clean',

        // ===== Cycle diagram =====
        'cycle.title': '⚗ THE NITROGEN CYCLE ⚗',
        'cycle.subtitle': 'Click molecules in-game to learn more! (Press ESC to close)',
        'cycle.zone.atmo': 'ATMOSPHERE',
        'cycle.zone.soil': 'SOIL',
        'cycle.n2.desc': 'Dinitrogen (78% of air)',
        'cycle.fixation': 'FIXATION',
        'cycle.nh4.tag': 'Plant food!',
        'cycle.no2.tag': '⚠ Toxic!',
        'cycle.no3.tag': 'Plant food!',
        'cycle.nitrification': '↑ NITRIFICATION (needs O₂) ↑',
        'cycle.organic.name': 'Organic N',
        'cycle.organic.desc': 'Dead matter',
        'cycle.decomposers': 'Decomposers',
        'cycle.plant.name': 'PLANT',
        'cycle.plant.desc': 'Your goal!',
        'cycle.plant.tag': 'GROW ME!',
        'cycle.rootUptake': 'Root uptake',
        'cycle.death': 'Death',
        'cycle.denitrify.title': 'DENITRIFICATION',
        'cycle.denitrify.desc': 'NO₃⁻ → N₂ or N₂O',
        'cycle.denitrify.condition': '(needs LOW O₂)',
        'cycle.denitrify.safe': 'N₂ (safe)',
        'cycle.denitrify.bad': 'N₂O (bad!)',
        'cycle.losses': '⚠ LOSSES ⚠',
        'cycle.n2o.desc': 'Greenhouse gas',
        'cycle.n2o.tag': '300x CO₂!',
        'cycle.leach.name': 'Leached',
        'cycle.leach.desc': 'NO₃⁻ in water',
        'cycle.leach.tag': 'Pollution!',
        'cycle.leach.arrow': '← Heavy rain',
        'cycle.returnArrow': 'N₂ returns to atmosphere',
        'cycle.legend.title': 'KEY BACTERIA',
        'cycle.legend.rhizobium': '<strong>Rhizobium</strong> - Fixes N₂ in root nodules',
        'cycle.legend.nitrosomonas': '<strong>Nitrosomonas</strong> - NH₄⁺ → NO₂⁻',
        'cycle.legend.nitrobacter': '<strong>Nitrobacter</strong> - NO₂⁻ → NO₃⁻',
        'cycle.legend.pseudomonas': '<strong>Pseudomonas</strong> - Denitrifies NO₃⁻',
        'cycle.tips.title': '🎮 GAMEPLAY TIPS',
        'cycle.tip.fix': '⚡ <strong>FIX</strong> - Convert atmospheric N₂ → NH₄⁺ (basic plant food)',
        'cycle.tip.decompose': '🍂 <strong>DECOMPOSE</strong> - Break down organic matter → NH₄⁺',
        'cycle.tip.nitrify': '⚗ <strong>NITRIFY 1→2</strong> - NH₄⁺ → NO₂⁻ → NO₃⁻. NO₃⁻ gives <strong>+50% FEED BONUS!</strong>',
        'cycle.tip.feed': '🌱 <strong>FEED</strong> - Give nitrogen to your plant! NO₃⁻ is 50% better than NH₄⁺!',
        'cycle.tip.denitrify': '♻ <strong>DENITRIFY</strong> - Reduce NO₃⁻ when high to prevent leaching & toxicity',
        'cycle.tip.watch': '⚠ <strong>WATCH OUT</strong> - NO₂⁻ is toxic! N₂O is a greenhouse gas! Leaching pollutes water!',
        'cycle.close': '✕ CLOSE',
        'cycle.showBtn': 'SHOW N-CYCLE',

        // ===== Info popup =====
        'info.ok': 'OK',

        // ===== Pause =====
        'pause.title': '❚❚ PAUSED',
        'pause.resume': '▶ RESUME',
        'pause.save': '💾 SAVE GAME',
        'pause.load': '📂 LOAD GAME',
        'pause.help': '? N-CYCLE HELP',
        'pause.quit': '✕ QUIT TO MENU',

        // ===== Tutorial =====
        'tutorial.next': 'NEXT',
        'tutorial.skip': 'SKIP',
        'tutorial.step.welcome': 'Welcome! Click FIX to convert atmospheric N₂ into usable NH₄⁺.',
        'tutorial.step.nh4': 'NH₄⁺ appeared in your soil! This is ammonium - plant food!',
        'tutorial.step.feed': 'Now click FEED to give nitrogen to your plant!',
        'tutorial.step.grow': 'Great! Keep feeding nitrogen to grow your tree. That\'s your goal!',
        'tutorial.step.decompose': 'DECOMPOSE breaks down organic matter into NH₄⁺. Try it!',
        'tutorial.step.timer': 'Watch the day timer! Natural processes happen at day\'s end.',
        'tutorial.step.n2o': 'N₂O is a greenhouse gas - 300x worse than CO₂! Keep it LOW.',
        'tutorial.step.leach': 'Leached nitrate pollutes water. Balance your nitrogen wisely! Good luck!',

        // ===== Achievements =====
        'ach.unlocked': 'ACHIEVEMENT UNLOCKED',
        'ach.firstFix.name': 'NITROGEN FIXER',
        'ach.firstFix.desc': 'Perform your first fixation',
        'ach.treeGrown.name': 'TREE HUGGER',
        'ach.treeGrown.desc': 'Grow a full tree',
        'ach.speedRun.name': 'SPEEDSTER',
        'ach.speedRun.desc': 'Win before day 15',
        'ach.cleanWin.name': 'ECO WARRIOR',
        'ach.cleanWin.desc': 'Win with N₂O < 5 and leached < 5',
        'ach.bigFixer.name': 'MEGA FIXER',
        'ach.bigFixer.desc': 'Fix 100+ nitrogen total',
        'ach.fed50.name': 'GREEN THUMB',
        'ach.fed50.desc': 'Feed plant 50+ nitrogen',
        'ach.survive30.name': 'ENDURANCE',
        'ach.survive30.desc': 'Survive 30 days',
        'ach.noDenitrify.name': 'PURIST',
        'ach.noDenitrify.desc': 'Win without denitrifying',

        // ===== Events =====
        'event.lightning.name': 'LIGHTNING!',
        'event.lightning.msg': 'LIGHTNING FIXED {amount} N₂!',
        'event.heavyRain.name': 'HEAVY RAIN',
        'event.heavyRain.msg': 'RAIN! LEACHED {amount} NO₃⁻',
        'event.drought.name': 'DROUGHT',
        'event.drought.msg': 'DROUGHT! PLANT -25 HP',
        'event.acidRain.name': 'ACID RAIN',
        'event.acidRain.msg': 'ACID RAIN! -15 HP, +{amount} NO₂⁻',
        'event.heatwave.name': 'HEATWAVE',
        'event.heatwave.msg': 'HEATWAVE! +{amount} N₂O, TEMP RISING!',
        'event.leafFall.name': 'LEAF FALL',
        'event.leafFall.msg': '+10 ORGANIC MATTER',
        'event.wormParty.name': 'WORM PARTY',
        'event.wormParty.msg': 'WORMS MADE {amount} NH₄⁺',
        'event.fungiBoost.name': 'FUNGI BOOST',
        'event.fungiBoost.msg': 'FUNGI HEALED +5 HP',
        'event.badBacteria.name': 'BAD BACTERIA',
        'event.badBacteria.msg': 'DENITRIFIED {amount} → N₂O!',
        'event.nitrosomonasBloom.name': 'NITROSOMONAS BLOOM',
        'event.nitrosomonasBloom.msg': 'NITRIFIED {amount} NH₄⁺ → NO₂⁻',
        'event.nitrobacterActive.name': 'NITROBACTER ACTIVE',
        'event.nitrobacterActive.msg': 'CONVERTED {amount} NO₂⁻ → NO₃⁻',
        'event.nitrobacterActive.empty': 'NO NITRITE TO CONVERT',
        'event.rhizobiumBonus.name': 'RHIZOBIUM BONUS',
        'event.rhizobiumBonus.msg': 'ROOT BACTERIA FIXED {amount} N₂!',
        'event.rhizobiumBonus.noRoots': 'NEED ROOTS FOR RHIZOBIUM',
        'event.toxicRunoff.name': 'TOXIC RUNOFF',
        'event.toxicRunoff.msg': 'TOXIC RUNOFF! +{amount} leached, -5 HP',
        'event.pestAttack.name': 'PEST ATTACK',
        'event.pestAttack.msg': 'PEST ATTACK! -{amount} HP',

        // ===== Nitrogen process messages =====
        'proc.needN2': 'NOT ENOUGH N₂!',
        'proc.needOrganic': 'NO ORGANIC MATTER!',
        'proc.needNh4': 'NOT ENOUGH NH₄⁺!',
        'proc.needNo2': 'NOT ENOUGH NO₂⁻!',
        'proc.needNo3': 'NOT ENOUGH NO₃⁻!',
        'proc.needN': 'NOT ENOUGH NITROGEN!',
        'proc.fixed': 'FIXED {amount} N₂ → NH₄⁺',
        'proc.fixedDetail': 'Rhizobium bacteria broke the triple bond!',
        'proc.fixedDetailN2o': 'Warning: {amount} N₂O byproduct produced!',
        'proc.decomposed': 'DECOMPOSED {amount} → NH₄⁺',
        'proc.decomposedDetail': 'Bacteria broke down dead matter!',
        'proc.decomposedDetailToxic': '+{amount} NO₂⁻ toxic byproduct!',
        'proc.nitrified1': 'NITRIFIED {amount} NH₄⁺ → NO₂⁻',
        'proc.nitrified1Detail': 'Step 1 done! Now Nitrify2 to get the feed bonus!',
        'proc.nitrified2': 'NITRIFIED {amount} NO₂⁻ → NO₃⁻',
        'proc.nitrified2Detail': 'NO₃⁻ ready! Feed for +50% bonus!',
        'proc.denitrifiedN2o': 'DENITRIFIED {amount} → N₂O!',
        'proc.denitrifiedN2oDetail': 'Incomplete! Greenhouse gas produced!',
        'proc.denitrifiedSafe': 'DENITRIFIED {amount} → N₂ (safe!)',
        'proc.denitrifiedSafeEmergency': 'Crisis averted! Reduced leach risk!',
        'proc.denitrifiedSafeNormal': 'Nitrogen returned to atmosphere safely.',
        'proc.plantAte': 'PLANT ATE {amount} {source}',
        'proc.plantAteBonus': 'PLANT ATE {amount} {source} (+{bonus}!)',
        'proc.plantAteDetail': 'Nitrogen absorbed through roots!',
        'proc.plantAteBonusDetail': '+{bonus} BONUS from NO₃⁻! Nitrification pays off!',

        // ===== endTurn natural process messages =====
        'turn.organicNatural': '+{amount} organic matter (natural)',
        'turn.decay': 'Decay: {amount} Organic → NH₄⁺',
        'turn.naturalNitrify': 'Natural: {amount} NH₄⁺ → NO₂⁻ (toxic!)',
        'turn.lowO2N2o': 'Low O₂: {amount} NO₂⁻ → N₂O!',
        'turn.slowNitrify': 'Slow natural: {amount} NO₂⁻ → NO₃⁻',
        'turn.leached': 'LEACHED {amount} NO₃⁻!',
        'turn.anaerobicN2o': 'Anaerobic: {amount} NO₃⁻ → N₂O!',
        'turn.denitrifiedSafe': 'Denitrified: {amount} NO₃⁻ → N₂',

        // ===== Floating numbers & game feedback =====
        'float.plus': '+{amount} {pool}',
        'float.plusToPlant': '+{amount} to plant',
        'float.plusToPlantBonus': '+{amount} to plant (+{bonus} bonus!)',
        'float.toNo2': '→ NO₂⁻ (now Nitrify2!)',
        'float.plusNo3Bonus': '+{amount} NO₃⁻ (feed +50%!)',
        'float.plusN2o': '+{amount} N₂O!',
        'float.safeNo3': 'Safe! -{amount} NO₃⁻',
        'float.crisisAverted': 'CRISIS AVERTED! +$2',
        'float.bonusMoney': '+${amount} BONUS!',
        'farm.manure.float': '+{amount} organic (manure)',

        'feedback.notEnoughCoins': 'NOT ENOUGH COINS!',
        'feedback.needCost': 'Need ${cost}',
        'feedback.waterCleaned': 'WATER CLEANED!',
        'feedback.waterCleaned.detail': '-{amount} leached NO₃⁻',
        'feedback.atmoScrubbed': 'ATMOSPHERE SCRUBBED!',
        'feedback.atmoScrubbed.detail': '-{amount} N₂O, -2°C',
        'feedback.newTree': 'NEW TREE PLANTED!',
        'feedback.newTree.detail': '+10 HP, +15 total N',
        'feedback.healed': 'PLANT HEALED!',
        'feedback.healed.detail': '+15 HP',
        'feedback.cooldown': 'ON COOLDOWN!',
        'feedback.cooldown.detail': 'Wait {seconds}s',
        'feedback.grew': 'GREW TO {stage}!',
        'feedback.grew.detail': 'Keep feeding!',
        'feedback.saved': 'GAME SAVED!',
        'feedback.saved.detail': 'Day {day}',
        'feedback.noSave': 'NO SAVE FOUND!',
        'feedback.loaded': 'GAME LOADED!',
        'feedback.loaded.detail': 'Day {day}',
        'feedback.colorblind': 'COLORBLIND MODE',
        'feedback.colorblind.off': 'OFF',

        // ===== Canvas labels =====
        'canvas.n2': 'N₂',
        'canvas.organic': 'Organic',
        'canvas.nh4': 'NH₄⁺',
        'canvas.no2warn': '⚠NO₂⁻',
        'canvas.no3': 'NO₃⁻',
        'canvas.n2oBad': '⚠N₂O BAD!⚠',
        'canvas.pollution': 'POLLUTION!',
        'canvas.deadZone': 'DEAD ZONE',

        // ===== Game over =====
        'over.youWin': 'YOU WIN!',
        'over.gameOver': 'GAME OVER',
        'over.grown': 'YOUR TREE HAS FULLY GROWN!',
        'over.died': 'YOUR PLANT HAS DIED...',
        'over.days': 'DAYS',
        'over.score': 'SCORE',
        'over.nFixed': 'N FIXED',
        'over.nFed': 'N FED',
        'over.n2oProduced': 'N₂O PRODUCED',
        'over.leached': 'NO₃⁻ LEACHED',
        'over.playAgain': 'PLAY AGAIN',
        'over.saveScore': '🏆 SAVE MY SCORE',
        'over.viewLeaderboard': '🏆 LEADERBOARD',

        // ===== Name entry modal =====
        'name.title': '🏆 YOU WON!',
        'name.sub': 'Enter your name for the leaderboard:',
        'name.submit': 'SUBMIT',
        'name.skip': 'SKIP',
        'name.error.empty': 'Please enter a name.',
        'name.error.network': 'Could not save — check your connection.',
        'name.error.offline': 'Leaderboard is only available on the live site.',
        'name.saving': 'Saving…',

        // ===== Leaderboard modal =====
        'lb.title': '🏆 LEADERBOARD',
        'lb.col.name': 'Name',
        'lb.col.score': 'Score',
        'lb.col.days': 'Days',
        'lb.loading': 'Loading…',
        'lb.empty': 'No scores yet — be the first!',
        'lb.error.network': 'Could not load leaderboard.',
        'lb.error.offline': 'Leaderboard is only available on the live site (deploy to view).',
        'lb.beFirst': 'No entries yet — claim the top spot!',
        'lb.beatsTop': 'Your score ({score}) beats #1! Claim the top spot?',
        'lb.claimTopSpot': '🏆 CLAIM TOP SPOT',

        // ===== Log messages =====
        'log.gameStarted': 'GAME STARTED!',
        'log.difficulty': 'DIFFICULTY: {label}',
        'log.growYourTree': 'GROW YOUR TREE!',
        'log.difficulty.easy': 'EASY',
        'log.difficulty.normal': 'NORMAL',
        'log.difficulty.hard': 'HARD',
        'log.newDay': '--- DAY {day} ---',
        'log.cleanWater': 'CLEAN WATER: -{amount} leached',
        'log.scrubAtmo': 'SCRUB ATMO: -{amount} N₂O, -2°C',
        'log.plantedTree': 'PLANTED TREE: +10 HP, +15 N',
        'log.emergencyHeal': 'EMERGENCY HEAL: +15 HP',
        'log.plantGrew': 'PLANT GREW TO {stage}!',
        'log.milestoneBonus': 'MILESTONE BONUS: +${bonus}!',
        'log.bonusLowGhg': 'BONUS: Low greenhouse gas!',
        'log.bonusLowPollution': 'BONUS: Low water pollution!'
    },

    de: {
        // ===== Loading / Menu =====
        'loading.subtitle': 'Lerne den Stickstoffkreislauf!',
        'loading.text': 'Lade Spiel…',
        'menu.title': 'NITROCYCLE',
        'menu.tagline': 'Meistere den Stickstoffkreislauf!',
        'menu.selectDifficulty': 'SCHWIERIGKEIT WÄHLEN',
        'menu.diff.easy': 'LEICHT',
        'menu.diff.easy.desc': '18s/Tag, langsam, $50',
        'menu.diff.normal': 'NORMAL',
        'menu.diff.normal.desc': '12s/Tag, Standard, $30',
        'menu.diff.hard': 'SCHWER',
        'menu.diff.hard.desc': '9s/Tag, schnell, $20',
        'menu.howToPlay': '? SPIELANLEITUNG',
        'menu.loadSave': '📂 LADEN',
        'menu.leaderboard': '🏆 BESTENLISTE',
        'menu.quickGuide': 'KURZANLEITUNG',
        'menu.qg.fix': '<span class="qg-key">FIX</span> N₂ → NH₄⁺ (einfaches Pflanzenfutter)',
        'menu.qg.nitrify': '<span class="qg-key">NITRIFY</span> NH₄⁺ → NO₂⁻ → NO₃⁻ (<strong>+50% Futter-Bonus!</strong>)',
        'menu.qg.feed': '<span class="qg-key">FEED</span> Gib Stickstoff an deine Pflanze',
        'menu.qg.denitrify': '<span class="qg-key">DENITRIFY</span> NO₃⁻ senken, wenn es gefährlich hoch ist',
        'menu.qg.avoid': '<span class="qg-key">⚠</span> N₂O (Treibhausgas) & Auswaschung vermeiden!',

        // ===== Header =====
        'header.pools': 'POOLS',
        'header.status': 'STATUS',
        'header.sfx': 'SFX',
        'header.bgm': 'BGM',
        'header.help': '?',
        'header.day': 'TAG',
        'header.score': 'PUNKTE',
        'tip.togglePools': 'Stickstoff-Pools ein-/ausblenden',
        'tip.toggleStatus': 'Pflanzen-Status ein-/ausblenden',
        'tip.toggleSound': 'Sound ein/aus',
        'tip.toggleMusic': 'Musik ein/aus',
        'tip.pause': 'Pause (P)',
        'tip.help': 'Hilfe',
        'tip.leaderboard': 'Bestenliste',
        'tip.speed': 'Spielgeschwindigkeit (½× / 1× / 2×)',
        'speed.half': 'Halbe Geschwindigkeit',
        'speed.normal': 'Normale Geschwindigkeit',
        'speed.double': 'Doppelte Geschwindigkeit',
        'tip.lang': 'Change language / Sprache wechseln',

        // ===== Panels =====
        'panel.pools': 'STICKSTOFF-POOLS',
        'panel.atmosphere': 'ATMOSPHÄRE',
        'panel.soil': 'BODEN',
        'panel.losses': 'VERLUSTE (SCHLECHT!)',
        'panel.environment': 'UMGEBUNG',
        'panel.plantHealth': 'PFLANZEN-GESUNDHEIT',
        'panel.atmo': 'ATMOSPHÄRE',
        'panel.water': 'WASSER',
        'panel.temperature': 'TEMPERATUR',
        'env.moisture': 'Feuchte',
        'env.oxygen': 'Sauerstoff',
        'pool.clickForInfo': 'Klick für Infos',

        // ===== Pool names & descriptions =====
        'pool.n2.name': 'Luftstickstoff',
        'pool.n2.desc': '78% der Luft. Sehr stabile Dreifachbindung (N≡N). Pflanzen können ihn nicht direkt nutzen!',
        'pool.nh4.name': 'Ammonium',
        'pool.nh4.desc': 'Pflanzen-verfügbar! Entsteht durch Stickstoff-Fixierung und Zersetzung.',
        'pool.no2.name': 'Nitrit',
        'pool.no2.desc': 'Giftiges Zwischenprodukt! Nitrobacter wandeln es schnell in Nitrat um.',
        'pool.no3.name': 'Nitrat',
        'pool.no3.desc': 'Pflanzen lieben es! Aber sehr beweglich – wird leicht ins Grundwasser ausgewaschen.',
        'pool.organic.name': 'Organischer N',
        'pool.organic.desc': 'Tote Pflanzen & Tiere. Enthält Eiweiße und Aminosäuren.',
        'pool.n2o.name': 'Lachgas',
        'pool.n2o.desc': 'Treibhausgas! 300x stärker als CO₂. Nicht erzeugen!',
        'pool.leached.name': 'Ausgewaschen',
        'pool.leached.longName': 'Ausgewaschenes Nitrat',
        'pool.leached.desc': 'Verschmutzung! Verursacht Algenblüte und tote Zonen im Wasser.',

        // ===== Action buttons =====
        'btn.fix.label': 'FIXIEREN',
        'btn.fix.bact': 'Rhizobium',
        'btn.fix.tip': 'N₂ → NH₄⁺ durch Rhizobium-Bakterien. Wandelt Luftstickstoff in nutzbares Ammonium um.',
        'btn.decompose.label': 'ZERSETZEN',
        'btn.decompose.bact': 'Bakterien',
        'btn.decompose.tip': 'Organischer N → NH₄⁺ durch Zersetzer-Bakterien. Zerlegt totes Material in nutzbaren Stickstoff.',
        'btn.nitrify1.label': 'NITRIFY 1',
        'btn.nitrify1.bact': 'Nitrosomonas',
        'btn.nitrify1.tip': 'NH₄⁺ → NO₂⁻ durch Nitrosomonas. Schritt 1 der Nitrifikation. Danach Nitrify 2 für NO₃⁻ (+50% FUTTER-BONUS!).',
        'btn.nitrify2.label': 'NITRIFY 2',
        'btn.nitrify2.bact': 'Nitrobacter',
        'btn.nitrify2.tip': 'NO₂⁻ → NO₃⁻ durch Nitrobacter. Entfernt GIFTIGES Nitrit! NO₃⁻ gibt +50% FUTTER-BONUS statt NH₄⁺!',
        'btn.feed.label': 'FÜTTERN',
        'btn.feed.bact': 'Wurzel-Aufnahme',
        'btn.feed.tip': 'Füttere deine Pflanze! NO₃⁻ gibt +50% BONUS. NH₄⁺ ist direkt, aber weniger effizient.',
        'btn.denitrify.label': 'DENITRIFY',
        'btn.denitrify.bact': 'Pseudomonas',
        'btn.denitrify.tip': 'NO₃⁻ → N₂/N₂O durch Pseudomonas. NOTVENTIL! Nutze es bei hohem NO₃⁻ gegen Auswaschung & Giftigkeit. 35% N₂O-Risiko.',

        // ===== Shop =====
        'shop.label': 'SHOP',
        'shop.cleanWater.name': 'WASSER KLAR',
        'shop.cleanWater.tip': 'Senkt ausgewaschenes NO₃⁻ um 55%. Reinigt das Grundwasser.',
        'shop.scrubAtmo.name': 'LUFT KLAR',
        'shop.scrubAtmo.tip': 'Senkt N₂O um 55% und kühlt um 2°C.',
        'shop.plantTree.name': 'BAUM PFLANZEN',
        'shop.plantTree.tip': 'Pflanze einen zweiten Baum. +10 HP, +15 aufgenommener Stickstoff.',
        'shop.heal.name': 'HEILEN',
        'shop.heal.tip': 'Notheilung für deine Pflanze. +15 HP sofort.',

        // ===== Action panel =====
        'action.dayTime': 'TAG: {seconds}s',

        // ===== Plant card =====
        'plant.nAbsorbed': 'N aufgenommen:',
        'plant.dot.seed': 'Samen',
        'plant.dot.sprout': 'Keim',
        'plant.dot.sapling': 'Setzling',
        'plant.dot.young': 'Jungbaum',
        'plant.dot.tree': 'Baum',
        'plant.alt': 'Pflanze',
        'plant.stage.seed': 'SAMEN',
        'plant.stage.sprout': 'KEIM',
        'plant.stage.sapling': 'SETZLING',
        'plant.stage.young': 'JUNGBAUM',
        'plant.stage.tree': 'BAUM',
        'plant.hp': '{hp} HP',

        // ===== Plant feedback messages =====
        'plant.msg.leafLitter': 'Laubstreu: +{amount} organisch',
        'plant.msg.hungry': 'PFLANZE HUNGRIG! -10 HP',
        'plant.msg.no3Toxic': 'NO₃⁻ VERGIFTUNG! -{amount} HP',
        'plant.msg.no2Toxic': 'NO₂⁻ GIFTIG! -{amount} HP',
        'plant.msg.n2oDamage': 'N₂O SCHADEN! -{amount} HP',
        'plant.msg.heatStress': 'HITZESTRESS! -2 HP',
        'plant.msg.heatDamage': 'HITZESCHADEN! -{amount} HP',
        'plant.msg.burning': 'VERBRENNUNG! -{amount} HP',
        'plant.msg.pollution': 'WASSERVERSCHMUTZUNG! -{amount} HP',
        'plant.msg.recovering': 'Pflanze erholt sich: +{amount} HP',

        // ===== Atmosphere & Water quality =====
        'atmo.critical': 'Kritisch',
        'atmo.smoggy': 'Smog',
        'atmo.hazy': 'Diesig',
        'atmo.clean': 'Sauber',
        'water.deadZone': 'Tote Zone',
        'water.algaeBloom': 'Algenblüte',
        'water.murky': 'Trüb',
        'water.clean': 'Sauber',

        // ===== Cycle diagram =====
        'cycle.title': '⚗ DER STICKSTOFFKREISLAUF ⚗',
        'cycle.subtitle': 'Klick auf Moleküle im Spiel für mehr Infos! (ESC zum Schließen)',
        'cycle.zone.atmo': 'ATMOSPHÄRE',
        'cycle.zone.soil': 'BODEN',
        'cycle.n2.desc': 'Luftstickstoff (78% der Luft)',
        'cycle.fixation': 'FIXIERUNG',
        'cycle.nh4.tag': 'Pflanzenfutter!',
        'cycle.no2.tag': '⚠ Giftig!',
        'cycle.no3.tag': 'Pflanzenfutter!',
        'cycle.nitrification': '↑ NITRIFIKATION (braucht O₂) ↑',
        'cycle.organic.name': 'Organischer N',
        'cycle.organic.desc': 'Totes Material',
        'cycle.decomposers': 'Zersetzer',
        'cycle.plant.name': 'PFLANZE',
        'cycle.plant.desc': 'Dein Ziel!',
        'cycle.plant.tag': 'LASS MICH WACHSEN!',
        'cycle.rootUptake': 'Wurzel-Aufnahme',
        'cycle.death': 'Tod',
        'cycle.denitrify.title': 'DENITRIFIKATION',
        'cycle.denitrify.desc': 'NO₃⁻ → N₂ oder N₂O',
        'cycle.denitrify.condition': '(braucht WENIG O₂)',
        'cycle.denitrify.safe': 'N₂ (sicher)',
        'cycle.denitrify.bad': 'N₂O (schlecht!)',
        'cycle.losses': '⚠ VERLUSTE ⚠',
        'cycle.n2o.desc': 'Treibhausgas',
        'cycle.n2o.tag': '300x CO₂!',
        'cycle.leach.name': 'Ausgewaschen',
        'cycle.leach.desc': 'NO₃⁻ im Wasser',
        'cycle.leach.tag': 'Verschmutzung!',
        'cycle.leach.arrow': '← Starkregen',
        'cycle.returnArrow': 'N₂ kehrt in die Atmosphäre zurück',
        'cycle.legend.title': 'WICHTIGE BAKTERIEN',
        'cycle.legend.rhizobium': '<strong>Rhizobium</strong> – Fixiert N₂ in Wurzelknöllchen',
        'cycle.legend.nitrosomonas': '<strong>Nitrosomonas</strong> – NH₄⁺ → NO₂⁻',
        'cycle.legend.nitrobacter': '<strong>Nitrobacter</strong> – NO₂⁻ → NO₃⁻',
        'cycle.legend.pseudomonas': '<strong>Pseudomonas</strong> – Denitrifiziert NO₃⁻',
        'cycle.tips.title': '🎮 SPIEL-TIPPS',
        'cycle.tip.fix': '⚡ <strong>FIXIEREN</strong> – N₂ → NH₄⁺ (einfaches Pflanzenfutter)',
        'cycle.tip.decompose': '🍂 <strong>ZERSETZEN</strong> – Totes Material → NH₄⁺',
        'cycle.tip.nitrify': '⚗ <strong>NITRIFY 1→2</strong> – NH₄⁺ → NO₂⁻ → NO₃⁻. NO₃⁻ gibt <strong>+50% FUTTER-BONUS!</strong>',
        'cycle.tip.feed': '🌱 <strong>FÜTTERN</strong> – Gib Stickstoff an die Pflanze! NO₃⁻ ist 50% besser als NH₄⁺!',
        'cycle.tip.denitrify': '♻ <strong>DENITRIFY</strong> – Senkt NO₃⁻ gegen Auswaschung & Giftigkeit',
        'cycle.tip.watch': '⚠ <strong>ACHTUNG</strong> – NO₂⁻ ist giftig! N₂O ist Treibhausgas! Auswaschung verschmutzt Wasser!',
        'cycle.close': '✕ SCHLIESSEN',
        'cycle.showBtn': 'N-KREISLAUF',

        // ===== Info popup =====
        'info.ok': 'OK',

        // ===== Pause =====
        'pause.title': '❚❚ PAUSE',
        'pause.resume': '▶ WEITER',
        'pause.save': '💾 SPEICHERN',
        'pause.load': '📂 LADEN',
        'pause.help': '? N-HILFE',
        'pause.quit': '✕ HAUPTMENÜ',

        // ===== Tutorial =====
        'tutorial.next': 'WEITER',
        'tutorial.skip': 'ÜBERSPRINGEN',
        'tutorial.step.welcome': 'Willkommen! Klick FIXIEREN, um Luft-N₂ in nutzbares NH₄⁺ zu wandeln.',
        'tutorial.step.nh4': 'NH₄⁺ ist in deinem Boden! Das ist Ammonium – Pflanzenfutter!',
        'tutorial.step.feed': 'Jetzt klick FÜTTERN, um deiner Pflanze Stickstoff zu geben!',
        'tutorial.step.grow': 'Super! Füttere weiter, damit dein Baum wächst. Das ist dein Ziel!',
        'tutorial.step.decompose': 'ZERSETZEN wandelt totes Material in NH₄⁺. Probier es aus!',
        'tutorial.step.timer': 'Schau auf den Tag-Timer! Am Tagesende passieren natürliche Prozesse.',
        'tutorial.step.n2o': 'N₂O ist ein Treibhausgas – 300x schlimmer als CO₂! Halte es NIEDRIG.',
        'tutorial.step.leach': 'Ausgewaschenes Nitrat verschmutzt das Wasser. Halte den Stickstoff im Gleichgewicht! Viel Glück!',

        // ===== Achievements =====
        'ach.unlocked': 'ERFOLG FREIGESCHALTET',
        'ach.firstFix.name': 'STICKSTOFF-FIXIERER',
        'ach.firstFix.desc': 'Erste Fixierung durchführen',
        'ach.treeGrown.name': 'BAUMFREUND',
        'ach.treeGrown.desc': 'Einen ganzen Baum wachsen lassen',
        'ach.speedRun.name': 'FLITZER',
        'ach.speedRun.desc': 'Gewinnen vor Tag 15',
        'ach.cleanWin.name': 'ÖKO-HELD',
        'ach.cleanWin.desc': 'Gewinnen mit N₂O < 5 und Auswaschung < 5',
        'ach.bigFixer.name': 'MEGA-FIXIERER',
        'ach.bigFixer.desc': '100+ Stickstoff insgesamt fixieren',
        'ach.fed50.name': 'GRÜNER DAUMEN',
        'ach.fed50.desc': 'Pflanze 50+ Stickstoff füttern',
        'ach.survive30.name': 'AUSDAUER',
        'ach.survive30.desc': '30 Tage überleben',
        'ach.noDenitrify.name': 'PURIST',
        'ach.noDenitrify.desc': 'Ohne Denitrifikation gewinnen',

        // ===== Events =====
        'event.lightning.name': 'BLITZ!',
        'event.lightning.msg': 'BLITZ FIXIERT {amount} N₂!',
        'event.heavyRain.name': 'STARKREGEN',
        'event.heavyRain.msg': 'REGEN! {amount} NO₃⁻ AUSGEWASCHEN',
        'event.drought.name': 'DÜRRE',
        'event.drought.msg': 'DÜRRE! PFLANZE -25 HP',
        'event.acidRain.name': 'SAURER REGEN',
        'event.acidRain.msg': 'SAURER REGEN! -15 HP, +{amount} NO₂⁻',
        'event.heatwave.name': 'HITZEWELLE',
        'event.heatwave.msg': 'HITZEWELLE! +{amount} N₂O, TEMP STEIGT!',
        'event.leafFall.name': 'LAUBFALL',
        'event.leafFall.msg': '+10 ORGANISCHES MATERIAL',
        'event.wormParty.name': 'WURM-PARTY',
        'event.wormParty.msg': 'WÜRMER MACHEN {amount} NH₄⁺',
        'event.fungiBoost.name': 'PILZ-SCHUB',
        'event.fungiBoost.msg': 'PILZE HEILEN +5 HP',
        'event.badBacteria.name': 'BÖSE BAKTERIEN',
        'event.badBacteria.msg': 'DENITRIFIZIERT {amount} → N₂O!',
        'event.nitrosomonasBloom.name': 'NITROSOMONAS-BLÜTE',
        'event.nitrosomonasBloom.msg': 'NITRIFIZIERT {amount} NH₄⁺ → NO₂⁻',
        'event.nitrobacterActive.name': 'NITROBACTER AKTIV',
        'event.nitrobacterActive.msg': '{amount} NO₂⁻ → NO₃⁻ UMGEWANDELT',
        'event.nitrobacterActive.empty': 'KEIN NITRIT VORHANDEN',
        'event.rhizobiumBonus.name': 'RHIZOBIUM-BONUS',
        'event.rhizobiumBonus.msg': 'WURZEL-BAKTERIEN FIXIEREN {amount} N₂!',
        'event.rhizobiumBonus.noRoots': 'BRAUCHE WURZELN FÜR RHIZOBIUM',
        'event.toxicRunoff.name': 'GIFTIGER ABFLUSS',
        'event.toxicRunoff.msg': 'GIFTIGER ABFLUSS! +{amount} ausgewaschen, -5 HP',
        'event.pestAttack.name': 'SCHÄDLINGE',
        'event.pestAttack.msg': 'SCHÄDLINGE! -{amount} HP',

        // ===== Nitrogen process messages =====
        'proc.needN2': 'NICHT GENUG N₂!',
        'proc.needOrganic': 'KEIN ORGANISCHES MATERIAL!',
        'proc.needNh4': 'NICHT GENUG NH₄⁺!',
        'proc.needNo2': 'NICHT GENUG NO₂⁻!',
        'proc.needNo3': 'NICHT GENUG NO₃⁻!',
        'proc.needN': 'NICHT GENUG STICKSTOFF!',
        'proc.fixed': 'FIXIERT: {amount} N₂ → NH₄⁺',
        'proc.fixedDetail': 'Rhizobium-Bakterien haben die Dreifachbindung gebrochen!',
        'proc.fixedDetailN2o': 'Achtung: {amount} N₂O als Nebenprodukt!',
        'proc.decomposed': 'ZERSETZT: {amount} → NH₄⁺',
        'proc.decomposedDetail': 'Bakterien haben totes Material zersetzt!',
        'proc.decomposedDetailToxic': '+{amount} NO₂⁻ giftiges Nebenprodukt!',
        'proc.nitrified1': 'NITRIFIZIERT: {amount} NH₄⁺ → NO₂⁻',
        'proc.nitrified1Detail': 'Schritt 1 fertig! Jetzt Nitrify 2 für den Bonus!',
        'proc.nitrified2': 'NITRIFIZIERT: {amount} NO₂⁻ → NO₃⁻',
        'proc.nitrified2Detail': 'NO₃⁻ bereit! Füttern für +50% Bonus!',
        'proc.denitrifiedN2o': 'DENITRIFIZIERT: {amount} → N₂O!',
        'proc.denitrifiedN2oDetail': 'Unvollständig! Treibhausgas erzeugt!',
        'proc.denitrifiedSafe': 'DENITRIFIZIERT: {amount} → N₂ (sicher!)',
        'proc.denitrifiedSafeEmergency': 'Krise abgewendet! Weniger Auswaschung!',
        'proc.denitrifiedSafeNormal': 'Stickstoff sicher in die Atmosphäre zurückgeführt.',
        'proc.plantAte': 'PFLANZE FRISST {amount} {source}',
        'proc.plantAteBonus': 'PFLANZE FRISST {amount} {source} (+{bonus}!)',
        'proc.plantAteDetail': 'Stickstoff über die Wurzeln aufgenommen!',
        'proc.plantAteBonusDetail': '+{bonus} BONUS durch NO₃⁻! Nitrifikation zahlt sich aus!',

        // ===== endTurn natural process messages =====
        'turn.organicNatural': '+{amount} organisches Material (natürlich)',
        'turn.decay': 'Zerfall: {amount} Organisch → NH₄⁺',
        'turn.naturalNitrify': 'Natürlich: {amount} NH₄⁺ → NO₂⁻ (giftig!)',
        'turn.lowO2N2o': 'Wenig O₂: {amount} NO₂⁻ → N₂O!',
        'turn.slowNitrify': 'Langsam natürlich: {amount} NO₂⁻ → NO₃⁻',
        'turn.leached': '{amount} NO₃⁻ AUSGEWASCHEN!',
        'turn.anaerobicN2o': 'Anaerob: {amount} NO₃⁻ → N₂O!',
        'turn.denitrifiedSafe': 'Denitrifiziert: {amount} NO₃⁻ → N₂',

        // ===== Floating numbers & game feedback =====
        'float.plus': '+{amount} {pool}',
        'float.plusToPlant': '+{amount} an Pflanze',
        'float.plusToPlantBonus': '+{amount} an Pflanze (+{bonus} Bonus!)',
        'float.toNo2': '→ NO₂⁻ (jetzt Nitrify 2!)',
        'float.plusNo3Bonus': '+{amount} NO₃⁻ (Futter +50%!)',
        'float.plusN2o': '+{amount} N₂O!',
        'float.safeNo3': 'Sicher! -{amount} NO₃⁻',
        'float.crisisAverted': 'KRISE ABGEWENDET! +$2',
        'float.bonusMoney': '+${amount} BONUS!',
        'farm.manure.float': '+{amount} organisch (Mist)',

        'feedback.notEnoughCoins': 'NICHT GENUG MÜNZEN!',
        'feedback.needCost': 'Brauche ${cost}',
        'feedback.waterCleaned': 'WASSER GEREINIGT!',
        'feedback.waterCleaned.detail': '-{amount} ausgewaschenes NO₃⁻',
        'feedback.atmoScrubbed': 'LUFT GEREINIGT!',
        'feedback.atmoScrubbed.detail': '-{amount} N₂O, -2°C',
        'feedback.newTree': 'NEUER BAUM GEPFLANZT!',
        'feedback.newTree.detail': '+10 HP, +15 gesamt N',
        'feedback.healed': 'PFLANZE GEHEILT!',
        'feedback.healed.detail': '+15 HP',
        'feedback.cooldown': 'ABKLINGZEIT!',
        'feedback.cooldown.detail': 'Warte {seconds}s',
        'feedback.grew': 'GEWACHSEN ZU {stage}!',
        'feedback.grew.detail': 'Weiter füttern!',
        'feedback.saved': 'SPIEL GESPEICHERT!',
        'feedback.saved.detail': 'Tag {day}',
        'feedback.noSave': 'KEIN SPIELSTAND!',
        'feedback.loaded': 'SPIEL GELADEN!',
        'feedback.loaded.detail': 'Tag {day}',
        'feedback.colorblind': 'FARBENBLIND-MODUS',
        'feedback.colorblind.off': 'AUS',

        // ===== Canvas labels =====
        'canvas.n2': 'N₂',
        'canvas.organic': 'Organisch',
        'canvas.nh4': 'NH₄⁺',
        'canvas.no2warn': '⚠NO₂⁻',
        'canvas.no3': 'NO₃⁻',
        'canvas.n2oBad': '⚠N₂O ÜBEL!⚠',
        'canvas.pollution': 'SCHMUTZ!',
        'canvas.deadZone': 'TOTE ZONE',

        // ===== Game over =====
        'over.youWin': 'GEWONNEN!',
        'over.gameOver': 'GAME OVER',
        'over.grown': 'DEIN BAUM IST VOLL GEWACHSEN!',
        'over.died': 'DEINE PFLANZE IST GESTORBEN…',
        'over.days': 'TAGE',
        'over.score': 'PUNKTE',
        'over.nFixed': 'N FIXIERT',
        'over.nFed': 'N GEFÜTTERT',
        'over.n2oProduced': 'N₂O ERZEUGT',
        'over.leached': 'NO₃⁻ AUSGEWASCHEN',
        'over.playAgain': 'NOCHMAL SPIELEN',
        'over.saveScore': '🏆 SCORE SPEICHERN',
        'over.viewLeaderboard': '🏆 BESTENLISTE',

        // ===== Name entry modal =====
        'name.title': '🏆 GEWONNEN!',
        'name.sub': 'Gib deinen Namen für die Bestenliste ein:',
        'name.submit': 'SENDEN',
        'name.skip': 'ÜBERSPRINGEN',
        'name.error.empty': 'Bitte einen Namen eingeben.',
        'name.error.network': 'Konnte nicht speichern – prüfe deine Verbindung.',
        'name.error.offline': 'Bestenliste nur auf der Live-Seite verfügbar.',
        'name.saving': 'Speichere…',

        // ===== Leaderboard modal =====
        'lb.title': '🏆 BESTENLISTE',
        'lb.col.name': 'Name',
        'lb.col.score': 'Punkte',
        'lb.col.days': 'Tage',
        'lb.loading': 'Lade…',
        'lb.empty': 'Noch keine Einträge – sei die/der Erste!',
        'lb.error.network': 'Konnte Bestenliste nicht laden.',
        'lb.error.offline': 'Bestenliste nur auf der Live-Seite verfügbar (deployen zum Anzeigen).',
        'lb.beFirst': 'Noch keine Einträge – hol dir Platz 1!',
        'lb.beatsTop': 'Dein Score ({score}) schlägt Platz 1! Übernehmen?',
        'lb.claimTopSpot': '🏆 PLATZ 1 HOLEN',

        // ===== Log messages =====
        'log.gameStarted': 'SPIEL GESTARTET!',
        'log.difficulty': 'SCHWIERIGKEIT: {label}',
        'log.growYourTree': 'LASS DEINEN BAUM WACHSEN!',
        'log.difficulty.easy': 'LEICHT',
        'log.difficulty.normal': 'NORMAL',
        'log.difficulty.hard': 'SCHWER',
        'log.newDay': '--- TAG {day} ---',
        'log.cleanWater': 'WASSER KLAR: -{amount} ausgewaschen',
        'log.scrubAtmo': 'LUFT KLAR: -{amount} N₂O, -2°C',
        'log.plantedTree': 'BAUM GEPFLANZT: +10 HP, +15 N',
        'log.emergencyHeal': 'NOTHEILUNG: +15 HP',
        'log.plantGrew': 'PFLANZE WÄCHST ZU {stage}!',
        'log.milestoneBonus': 'MEILENSTEIN-BONUS: +${bonus}!',
        'log.bonusLowGhg': 'BONUS: Wenig Treibhausgas!',
        'log.bonusLowPollution': 'BONUS: Wenig Wasserverschmutzung!'
    }
};

// -------------------------------------------------------------------
// Runtime
// -------------------------------------------------------------------

const I18N = {
    lang: 'de',

    _detectInitial() {
        const saved = localStorage.getItem('nitrocycle_lang');
        if (saved === 'en' || saved === 'de') return saved;
        // Default to DE for Lange-Nacht-der-Forschung audience.
        // If browser is clearly English, still prefer DE (event default),
        // but allow fall-back to EN when browser language explicitly is not German.
        const nav = (navigator.language || 'de').toLowerCase();
        if (nav.startsWith('de')) return 'de';
        return 'de'; // event default
    },

    init() {
        this.lang = this._detectInitial();
        document.documentElement.lang = this.lang;
        this.apply();
    },

    set(code) {
        if (code !== 'en' && code !== 'de') return;
        this.lang = code;
        localStorage.setItem('nitrocycle_lang', code);
        document.documentElement.lang = code;
        this.apply();
        // Let the rest of the app re-render dynamic strings
        if (window.Game && typeof Game.updateUI === 'function' && Game.state !== 'loading') {
            try { Game.updateUI(); } catch (e) { /* ignore */ }
        }
        // Redraw difficulty select pill labels
        this._refreshToggleUI();
        // Notify any listeners
        window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: code } }));
    },

    get() {
        return this.lang;
    },

    /**
     * Lookup a key. If the key is missing in the current language,
     * fall back to English. If still missing, return the key itself
     * (makes missing translations visible during development).
     */
    t(key, vars) {
        const table = STRINGS[this.lang] || STRINGS.en;
        let str = table[key];
        if (str == null) str = STRINGS.en[key];
        if (str == null) return key;
        if (vars) {
            str = str.replace(/\{(\w+)\}/g, (_, name) => (vars[name] != null ? vars[name] : '{' + name + '}'));
        }
        return str;
    },

    apply(root) {
        const scope = root || document;

        scope.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = this.t(el.getAttribute('data-i18n'));
        });
        scope.querySelectorAll('[data-i18n-html]').forEach(el => {
            el.innerHTML = this.t(el.getAttribute('data-i18n-html'));
        });
        scope.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = this.t(el.getAttribute('data-i18n-title'));
        });
        scope.querySelectorAll('[data-i18n-tooltip]').forEach(el => {
            el.setAttribute('data-tooltip', this.t(el.getAttribute('data-i18n-tooltip')));
        });
        scope.querySelectorAll('[data-i18n-alt]').forEach(el => {
            el.alt = this.t(el.getAttribute('data-i18n-alt'));
        });
        scope.querySelectorAll('[data-i18n-aria]').forEach(el => {
            el.setAttribute('aria-label', this.t(el.getAttribute('data-i18n-aria')));
        });
    },

    _refreshToggleUI() {
        const btnDe = document.getElementById('lang-de');
        const btnEn = document.getElementById('lang-en');
        if (btnDe) btnDe.classList.toggle('active', this.lang === 'de');
        if (btnEn) btnEn.classList.toggle('active', this.lang === 'en');
    }
};

// Short aliases
window.I18N = I18N;
window.t = (key, vars) => I18N.t(key, vars);
window.setLang = (code) => I18N.set(code);
window.getLang = () => I18N.get();

// Auto-init as early as possible so data-i18n attributes render correctly
// on first paint (before other scripts touch the DOM).
document.addEventListener('DOMContentLoaded', () => {
    I18N.init();
    I18N._refreshToggleUI();
});
