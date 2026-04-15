/**
 * Enhanced Pixel Art Renderer
 * Beautiful molecules, bacteria animations, transformation effects
 */

const Renderer = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,

    // Tile size for pixel art
    TILE: 16,

    // Layer heights (in tiles)
    // Tall sky for plant visibility, compact underground
    layers: {
        sky: { startTile: 0, tiles: 8 },
        ground: { startTile: 8, tiles: 1 },
        topsoil: { startTile: 9, tiles: 4 },
        subsoil: { startTile: 13, tiles: 2 },
        water: { startTile: 15, tiles: 2 }
    },

    animFrame: 0,

    // Transformation animations queue
    animations: [],

    // Molecule colors - vibrant and distinct
    moleculeColors: {
        n2: { main: '#00d4ff', glow: '#00ffff', dark: '#0088aa' },      // Bright cyan
        nh4: { main: '#00ff88', glow: '#88ffbb', dark: '#00aa55' },     // Bright green
        no2: { main: '#ff6600', glow: '#ffaa00', dark: '#cc4400' },     // Orange (toxic)
        no3: { main: '#88ff00', glow: '#bbff44', dark: '#66cc00' },     // Lime green
        organic: { main: '#aa7744', glow: '#ccaa77', dark: '#775533' }, // Brown
        n2o: { main: '#ff0044', glow: '#ff4488', dark: '#cc0033' },     // Red (danger)
        leached: { main: '#ff00ff', glow: '#ff88ff', dark: '#aa00aa' }  // Magenta
    },

    // Bacteria types with colors and shapes
    bacteria: {
        rhizobium: { color: '#00ffaa', dark: '#00aa77', name: 'Rhizobium', shape: 'rod' },
        nitrosomonas: { color: '#ffaa00', dark: '#cc8800', name: 'Nitrosomonas', shape: 'coccus' },
        nitrobacter: { color: '#88ff00', dark: '#66cc00', name: 'Nitrobacter', shape: 'rod' },
        decomposer: { color: '#aa8866', dark: '#886644', name: 'Decomposer', shape: 'rod' },
        pseudomonas: { color: '#ff4444', dark: '#cc2222', name: 'Pseudomonas', shape: 'rod' }
    },

    // Day/night phase tracking
    dayProgress: 0,

    // Fixed star positions (generated once)
    stars: [],

    // Fungi mycelium network (generated once)
    myceliumPaths: [],

    // Creatures for animation
    creatures: {
        fish: [],
        birds: [],
        butterflies: [],
        beetles: [],
        worms: [],
        snails: [],
        fireflies: []
    },

    // Surface-walking farm animals. Each one wanders left/right on the
    // grass, occasionally pauses, drops manure (which adds Organic N to
    // the soil), and very rarely vocalizes. Educational tie-in:
    // animal poop → organic matter → ammonification → NH₄⁺.
    farmAnimals: [],
    // Manure piles dropped on the grass. Fade out over a few seconds.
    manurePiles: [],

    // Particle system
    particles: [],

    // Screen shake
    shake: { intensity: 0, duration: 0, startTime: 0 },

    // Weather effects
    weather: { type: null, duration: 0, startTime: 0 },

    init() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) return false;

        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Generate stars
        this.generateStars();

        // Generate mycelium network
        this.generateMycelium();

        // Generate creatures
        this.generateCreatures();

        // Generate surface farm animals
        this.generateFarmAnimals();

        return true;
    },

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 20; i++) {
            this.stars.push({
                x: Math.random(),
                y: Math.random() * 0.8,
                size: 1 + Math.floor(Math.random() * 2),
                twinkleSpeed: 0.03 + Math.random() * 0.05,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    },

    // Color interpolation utilities
    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    },

    lerpColor(hex1, hex2, t) {
        const [r1, g1, b1] = this.hexToRgb(hex1);
        const [r2, g2, b2] = this.hexToRgb(hex2);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        return `rgb(${r},${g},${b})`;
    },

    blendBands(bands1, bands2, t) {
        const result = [];
        const len = Math.min(bands1.length, bands2.length);
        for (let i = 0; i < len; i++) {
            result.push(this.lerpColor(bands1[i], bands2[i], t));
        }
        return result;
    },

    generateCreatures() {
        // Fish in water - super slow and peaceful
        this.creatures.fish = [];
        for (let i = 0; i < 5; i++) {
            this.creatures.fish.push({
                x: Math.random(),
                y: 0.2 + Math.random() * 0.6,
                speed: 0.00015 + Math.random() * 0.0001,  // Super slow
                size: 0.7 + Math.random() * 0.6,
                color: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b'][i % 5],
                dir: Math.random() > 0.5 ? 1 : -1
            });
        }

        // Birds in sky - slow gliding
        this.creatures.birds = [];
        for (let i = 0; i < 3; i++) {
            this.creatures.birds.push({
                x: Math.random(),
                y: 0.2 + Math.random() * 0.5,
                speed: 0.0002 + Math.random() * 0.0001,  // Super slow
                size: 0.8 + Math.random() * 0.4,
                dir: Math.random() > 0.5 ? 1 : -1
            });
        }

        // Butterflies near ground - gentle lazy flutter
        this.creatures.butterflies = [];
        for (let i = 0; i < 4; i++) {
            this.creatures.butterflies.push({
                x: Math.random(),
                y: Math.random(),
                speedX: (Math.random() - 0.5) * 0.0003,  // Super slow
                speedY: (Math.random() - 0.5) * 0.00015,
                color: ['#ff6b9d', '#c44dff', '#ffeb3b', '#00e5ff'][i % 4],
                wingPhase: Math.random() * Math.PI * 2
            });
        }

        // Beetles in soil - very slow crawl
        this.creatures.beetles = [];
        for (let i = 0; i < 4; i++) {
            this.creatures.beetles.push({
                x: Math.random(),
                y: 0.1 + Math.random() * 0.6,
                speed: 0.00008 + Math.random() * 0.00005,  // Super slow
                size: 0.6 + Math.random() * 0.4,
                dir: Math.random() > 0.5 ? 1 : -1,
                color: ['#2d1b0e', '#4a3728', '#1a1a2e', '#3d0c02'][i % 4]
            });
        }

        // Larger earthworms - super slow
        this.creatures.worms = [];
        for (let i = 0; i < 3; i++) {
            this.creatures.worms.push({
                x: 0.15 + i * 0.3,
                y: 0.4 + Math.random() * 0.4,
                length: 8 + Math.floor(Math.random() * 5),
                speed: 0.00006 + Math.random() * 0.00003,  // Super slow
                dir: Math.random() > 0.5 ? 1 : -1
            });
        }

        // Snails in soil - ultra slow (they're snails!)
        this.creatures.snails = [];
        for (let i = 0; i < 2; i++) {
            this.creatures.snails.push({
                x: 0.2 + i * 0.5,
                y: 0.2 + Math.random() * 0.3,
                speed: 0.00002 + Math.random() * 0.00001,  // Ultra slow
                dir: Math.random() > 0.5 ? 1 : -1
            });
        }

        // Fireflies - visible at night
        this.creatures.fireflies = [];
        for (let i = 0; i < 6; i++) {
            this.creatures.fireflies.push({
                x: Math.random(),
                y: 0.4 + Math.random() * 0.5,
                speedX: (Math.random() - 0.5) * 0.0002,
                speedY: (Math.random() - 0.5) * 0.0001,
                glowPhase: Math.random() * Math.PI * 2,
                glowSpeed: 0.03 + Math.random() * 0.02
            });
        }
    },

    // ============ FARM ANIMALS ============
    // Surface-walking pixel-art farm animals. Each one wanders the grass,
    // pauses sometimes, and periodically drops manure (which adds Organic N
    // to the soil — a real piece of the nitrogen cycle).
    generateFarmAnimals() {
        this.farmAnimals = [];
        this.manurePiles = [];
        // Spawn list — keep it light so it doesn't crowd the canvas
        const roster = [
            { type: 'cow',     count: 2, baseSpeed: 0.00012 },
            { type: 'sheep',   count: 2, baseSpeed: 0.00018 },
            { type: 'chicken', count: 1, baseSpeed: 0.00030 }
        ];
        roster.forEach(r => {
            for (let i = 0; i < r.count; i++) {
                this.farmAnimals.push({
                    type: r.type,
                    x: Math.random(),
                    dir: Math.random() < 0.5 ? -1 : 1,
                    baseSpeed: r.baseSpeed,
                    state: 'walking',           // 'walking' | 'idle'
                    stateTimer: 2 + Math.random() * 4,    // seconds in state
                    legPhase: Math.random() * Math.PI * 2,
                    // First poop after 8-20s — staggers so they don't all
                    // poop at once on game start.
                    poopTimer: 8 + Math.random() * 12,
                    // First vocalization after 15-30s
                    vocalTimer: 15 + Math.random() * 15
                });
            }
        });
    },

    /**
     * Updates farm animals (walking, state machine, poop, sound) and the
     * fading manure piles. Called once per render frame from drawFarmAnimals.
     * `dt` is seconds since last frame.
     */
    _updateFarmAnimals(dt) {
        // --- update animals ---
        this.farmAnimals.forEach(a => {
            // State machine: walk for a bit, idle for a bit
            a.stateTimer -= dt;
            if (a.stateTimer <= 0) {
                if (a.state === 'walking') {
                    a.state = 'idle';
                    a.stateTimer = 1 + Math.random() * 3;
                    // 30% chance to also turn around when idling
                    if (Math.random() < 0.3) a.dir *= -1;
                } else {
                    a.state = 'walking';
                    a.stateTimer = 2 + Math.random() * 5;
                }
            }
            if (a.state === 'walking') {
                a.x += a.baseSpeed * a.dir * (dt * 60); // dt-normalized
                a.legPhase += dt * 8;
                // Wrap at edges with a turnaround so they bounce
                if (a.x > 1.02) { a.x = 1.02; a.dir = -1; }
                if (a.x < -0.02) { a.x = -0.02; a.dir = 1; }
            }

            // --- poop timer ---
            a.poopTimer -= dt;
            if (a.poopTimer <= 0) {
                // Drop manure at current foot position
                const layer = this.layers.ground;
                const px = Math.floor(a.x * this.width);
                const py = layer.y + layer.height - 2;
                this.manurePiles.push({
                    x: px,
                    y: py,
                    age: 0,
                    maxAge: 6, // seconds before fully fading
                    size: a.type === 'cow' ? 5 : a.type === 'sheep' ? 4 : 3
                });
                // Add organic nitrogen to the soil — the educational tie-in
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
                if (window.Audio && Audio.farmPoop) Audio.farmPoop();
                // Next poop in 18-35 seconds (rare-ish per animal)
                a.poopTimer = 18 + Math.random() * 17;
            }

            // --- vocalization timer (rare and quiet, per user request) ---
            a.vocalTimer -= dt;
            if (a.vocalTimer <= 0) {
                if (window.Audio && Audio.farmCall) Audio.farmCall(a.type);
                a.vocalTimer = 14 + Math.random() * 16;
            }
        });

        // --- update manure piles (fade) ---
        this.manurePiles = this.manurePiles.filter(p => {
            p.age += dt;
            return p.age < p.maxAge;
        });
    },

    drawFarmAnimals(dt) {
        // dt is seconds — clamp so a tab-switch doesn't fire 50 poops at once
        const clampedDt = Math.min(dt || 1 / 60, 0.25);
        this._updateFarmAnimals(clampedDt);

        // Draw manure piles first (under the animals)
        this.manurePiles.forEach(p => {
            const fade = 1 - (p.age / p.maxAge);
            this.ctx.globalAlpha = Math.max(0.2, fade);
            this.ctx.fillStyle = '#5d3a1f';
            this.ctx.fillRect(p.x - p.size, p.y - 1, p.size * 2, 2);
            this.ctx.fillStyle = '#7a4a26';
            this.ctx.fillRect(p.x - p.size + 1, p.y - 2, p.size * 2 - 2, 2);
            this.ctx.fillRect(p.x - 1, p.y - 3, 3, 1);
            this.ctx.globalAlpha = 1;
        });

        // Draw animals — feet at the TOP of the grass strip so the
        // body sits visibly ABOVE the grass (not buried inside it).
        this.farmAnimals.forEach(a => {
            const px = Math.floor(a.x * this.width);
            const baseY = this.layers.ground.y + 4;
            const legSwing = a.state === 'walking' ? Math.floor(Math.sin(a.legPhase) * 2) : 0;
            if (a.type === 'cow')     this._drawCow(px, baseY, a.dir, legSwing);
            else if (a.type === 'sheep')   this._drawSheep(px, baseY, a.dir, legSwing);
            else if (a.type === 'chicken') this._drawChicken(px, baseY, a.dir, legSwing);
        });
    },

    // Pixel sprites are drawn from the animal's FEET (baseY) upwards. dir is
    // +1 (facing right) or -1 (facing left) — we mirror the head/eye on -1.
    // Sizes are ~2x what they used to be so they're clearly visible at
    // standard canvas resolutions (~960 wide).
    _drawCow(x, baseY, dir, legSwing) {
        const ctx = this.ctx;
        // Body — white base with brown patches (28x12)
        ctx.fillStyle = '#f4f4f4';
        ctx.fillRect(x - 14, baseY - 18, 28, 12);
        // Brown patches
        ctx.fillStyle = '#5d3a1f';
        ctx.fillRect(x - 10, baseY - 16, 8, 6);
        ctx.fillRect(x + 4, baseY - 18, 6, 6);
        ctx.fillRect(x - 4, baseY - 10, 6, 4);
        // Legs (4) — front pair anti-phase with back pair for trotting look
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x - 12, baseY - 6, 4, 6 + legSwing);
        ctx.fillRect(x + 8,  baseY - 6, 4, 6 + legSwing);
        ctx.fillRect(x - 6,  baseY - 6, 4, 6 - legSwing);
        ctx.fillRect(x + 2,  baseY - 6, 4, 6 - legSwing);
        // Head (8x8) — offset out one body-width
        const hx = dir > 0 ? x + 12 : x - 20;
        ctx.fillStyle = '#f4f4f4';
        ctx.fillRect(hx, baseY - 16, 8, 8);
        // Snout (pink)
        ctx.fillStyle = '#e8a3a3';
        ctx.fillRect(dir > 0 ? hx + 6 : hx, baseY - 12, 2, 4);
        // Eye
        ctx.fillStyle = '#181425';
        ctx.fillRect(dir > 0 ? hx + 4 : hx + 2, baseY - 14, 2, 2);
        // Horns
        ctx.fillStyle = '#e8d59c';
        ctx.fillRect(hx + 1, baseY - 18, 2, 2);
        ctx.fillRect(hx + 5, baseY - 18, 2, 2);
    },

    _drawSheep(x, baseY, dir, legSwing) {
        const ctx = this.ctx;
        // Fluffy white body — stacked rects for cloud-like silhouette
        ctx.fillStyle = '#f4f4f4';
        ctx.fillRect(x - 12, baseY - 14, 24, 10); // main
        ctx.fillRect(x - 10, baseY - 17, 20, 4);  // upper fluff
        ctx.fillRect(x - 8,  baseY - 19, 16, 3);  // top fluff
        // Legs (4)
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x - 10, baseY - 4, 3, 4 + legSwing);
        ctx.fillRect(x + 7,  baseY - 4, 3, 4 + legSwing);
        ctx.fillRect(x - 4,  baseY - 4, 3, 4 - legSwing);
        ctx.fillRect(x + 1,  baseY - 4, 3, 4 - legSwing);
        // Head — black face
        const hx = dir > 0 ? x + 10 : x - 16;
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(hx, baseY - 13, 6, 6);
        // White muzzle / cheek
        ctx.fillStyle = '#f4f4f4';
        ctx.fillRect(dir > 0 ? hx + 4 : hx, baseY - 9, 2, 2);
        // Eye
        ctx.fillRect(dir > 0 ? hx + 4 : hx, baseY - 11, 2, 2);
        ctx.fillStyle = '#181425';
        ctx.fillRect(dir > 0 ? hx + 4 : hx + 1, baseY - 11, 1, 1);
    },

    _drawChicken(x, baseY, dir, legSwing) {
        const ctx = this.ctx;
        // Body — small white blob (~12x8)
        ctx.fillStyle = '#f4f4f4';
        ctx.fillRect(x - 6, baseY - 12, 12, 8);
        // Tail feather pointing back
        ctx.fillRect(dir > 0 ? x - 8 : x + 6, baseY - 12, 2, 4);
        // Wing detail
        ctx.fillStyle = '#dcdcdc';
        ctx.fillRect(x - 4, baseY - 9, 6, 3);
        // Legs — yellow, prominent leg-swing for chicken-walk feel
        ctx.fillStyle = '#feae34';
        ctx.fillRect(x - 3, baseY - 4, 2, 4 + legSwing);
        ctx.fillRect(x + 1, baseY - 4, 2, 4 - legSwing);
        // Head (4x4)
        const hx = dir > 0 ? x + 4 : x - 8;
        ctx.fillStyle = '#f4f4f4';
        ctx.fillRect(hx, baseY - 16, 4, 4);
        // Comb (red, on top)
        ctx.fillStyle = '#e43b44';
        ctx.fillRect(hx + 1, baseY - 18, 3, 2);
        // Beak (yellow, pointing in walking direction)
        ctx.fillStyle = '#feae34';
        ctx.fillRect(dir > 0 ? hx + 4 : hx - 2, baseY - 14, 2, 2);
        // Eye
        ctx.fillStyle = '#181425';
        ctx.fillRect(dir > 0 ? hx + 2 : hx + 1, baseY - 15, 1, 1);
    },

    generateMycelium() {
        this.myceliumPaths = [];
        // Create branching fungal threads
        const startPoints = [
            { x: 0.15, y: 0.3 },
            { x: 0.4, y: 0.2 },
            { x: 0.6, y: 0.4 },
            { x: 0.85, y: 0.25 }
        ];

        startPoints.forEach(start => {
            this.generateMyceliumBranch(start.x, start.y, 0, 5, []);
        });
    },

    generateMyceliumBranch(x, y, angle, depth, path) {
        if (depth <= 0) return;

        const length = 0.03 + Math.random() * 0.04;
        const newX = x + Math.cos(angle) * length;
        const newY = y + Math.sin(angle) * length * 0.5;

        // Keep within bounds
        if (newX < 0 || newX > 1 || newY < 0 || newY > 1) return;

        this.myceliumPaths.push({ x1: x, y1: y, x2: newX, y2: newY, depth });

        // Branch probability increases with depth
        const branches = depth > 3 ? 2 : (Math.random() > 0.4 ? 2 : 1);

        for (let i = 0; i < branches; i++) {
            const newAngle = angle + (Math.random() - 0.5) * 1.2;
            this.generateMyceliumBranch(newX, newY, newAngle, depth - 1, path);
        }
    },

    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        this.width = Math.floor(rect.width);
        this.height = Math.floor(rect.height);

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.calculateLayers();
    },

    calculateLayers() {
        // Sum up all layer tiles dynamically
        const totalTiles = Object.values(this.layers).reduce((sum, l) => sum + l.tiles, 0);
        const tileHeight = Math.floor(this.height / totalTiles);
        this.TILE = Math.max(16, tileHeight);

        let y = 0;
        for (const [name, layer] of Object.entries(this.layers)) {
            layer.y = y;
            layer.height = layer.tiles * this.TILE;
            y += layer.height;
        }
    },

    // ========== ANIMATION SYSTEM ==========

    addAnimation(type, fromX, fromY, toX, toY, bacteriaType, moleculeFrom, moleculeTo) {
        this.animations.push({
            type,
            fromX, fromY, toX, toY,
            progress: 0,
            bacteriaType,
            moleculeFrom,
            moleculeTo,
            startTime: Date.now()
        });
    },

    // Called from game.js when an action happens
    triggerTransformation(process) {
        const layer = this.layers.topsoil;
        const skyLayer = this.layers.sky;

        const centerX = this.width / 2;
        const soilY = layer.y + layer.height / 2;
        const skyY = skyLayer.height / 2;

        switch(process) {
            case 'fixation':
                // N2 from sky to NH4 in soil
                for (let i = 0; i < 3; i++) {
                    const startX = 100 + Math.random() * (this.width - 200);
                    const endX = centerX + (Math.random() - 0.5) * 200;
                    this.addAnimation('transform', startX, skyY, endX, soilY, 'rhizobium', 'n2', 'nh4');
                }
                this.emitActionBurst(centerX, soilY, '#00ff88', 10);
                break;
            case 'decompose':
                for (let i = 0; i < 3; i++) {
                    const x = 100 + Math.random() * (this.width - 200);
                    this.addAnimation('transform', x, layer.y + 20, x + 50, soilY, 'decomposer', 'organic', 'nh4');
                }
                this.emitActionBurst(centerX, soilY, '#aa7744', 8);
                break;
            case 'nitrify1':
                for (let i = 0; i < 3; i++) {
                    const x = 100 + Math.random() * (this.width - 200);
                    this.addAnimation('transform', x, soilY - 20, x + 30, soilY + 20, 'nitrosomonas', 'nh4', 'no2');
                }
                this.emitActionBurst(centerX, soilY, '#ff6600', 8);
                break;
            case 'nitrify2':
                for (let i = 0; i < 3; i++) {
                    const x = 100 + Math.random() * (this.width - 200);
                    this.addAnimation('transform', x, soilY, x + 30, soilY + 30, 'nitrobacter', 'no2', 'no3');
                }
                this.emitActionBurst(centerX, soilY, '#88ff00', 8);
                break;
            case 'feed':
                const plantX = this.width / 2;
                for (let i = 0; i < 3; i++) {
                    const startX = plantX + (Math.random() - 0.5) * 100;
                    this.addAnimation('uptake', startX, soilY, plantX, layer.y - 30, null, 'nh4', 'plant');
                }
                this.emitGrowthSparkles(plantX, layer.y - 10);
                break;
            case 'denitrify':
                for (let i = 0; i < 2; i++) {
                    const x = 100 + Math.random() * (this.width - 200);
                    this.addAnimation('transform', x, soilY + 20, x, skyY + 40, 'pseudomonas', 'no3', 'n2o');
                }
                this.emitActionBurst(centerX, soilY, '#ff0044', 12);
                break;
        }
    },

    updateAnimations() {
        const now = Date.now();
        this.animations = this.animations.filter(anim => {
            const elapsed = now - anim.startTime;
            anim.progress = Math.min(elapsed / 800, 1); // 800ms animation
            return anim.progress < 1;
        });
    },

    drawAnimations() {
        this.animations.forEach(anim => {
            const t = anim.progress;
            const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

            const x = Math.floor(anim.fromX + (anim.toX - anim.fromX) * easeT);
            const y = Math.floor(anim.fromY + (anim.toY - anim.fromY) * easeT);

            // Draw pixel bacteria carrying molecule
            if (anim.bacteriaType && this.bacteria[anim.bacteriaType]) {
                this.drawPixelBacteria(x, y, anim.bacteriaType);
            }

            // Draw transforming molecule (pixelated)
            const fromColor = this.moleculeColors[anim.moleculeFrom];
            const toColor = this.moleculeColors[anim.moleculeTo] || { main: '#ffffff' };
            const currentColor = t < 0.5 ? fromColor : toColor;

            const size = 8 + Math.floor(Math.sin(t * Math.PI) * 4);

            // Pixel glow
            this.ctx.fillStyle = currentColor.glow;
            this.ctx.globalAlpha = 0.4;
            this.ctx.fillRect(x - size - 4, y - size - 4, size * 2 + 8, size * 2 + 8);
            this.ctx.globalAlpha = 1;

            // Main molecule (pixel square)
            this.ctx.fillStyle = currentColor.main;
            this.ctx.fillRect(x - size, y - size, size * 2, size * 2);

            // Highlight
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(x - size + 2, y - size + 2, 4, 4);
            this.ctx.globalAlpha = 1;

            // Pixel sparkles
            if (t > 0.3 && t < 0.7) {
                this.ctx.fillStyle = '#ffffff';
                const sparkleOffset = Math.floor(this.animFrame / 3) % 4;
                const positions = [
                    { dx: -12 - sparkleOffset, dy: -8 },
                    { dx: 10 + sparkleOffset, dy: -6 },
                    { dx: -8, dy: 10 + sparkleOffset },
                    { dx: 12, dy: 8 - sparkleOffset }
                ];
                positions.forEach(p => {
                    this.ctx.fillRect(x + p.dx, y + p.dy, 3, 3);
                });
            }
        });
    },

    // Draw a pixel art bacteria
    drawPixelBacteria(x, y, type) {
        const bact = this.bacteria[type];
        const wiggle = Math.floor(Math.sin(this.animFrame * 0.3) * 3);

        x = Math.floor(x);
        y = Math.floor(y);

        if (bact.shape === 'rod') {
            // Rod-shaped bacteria (bacillus) - pixel art
            // Main body
            this.ctx.fillStyle = bact.color;
            this.ctx.fillRect(x - 10, y - 4, 20, 8);
            this.ctx.fillRect(x - 8, y - 6, 16, 12);

            // Darker middle
            this.ctx.fillStyle = bact.dark;
            this.ctx.fillRect(x - 4, y - 2, 8, 4);

            // Flagella (wavy tail) - pixel segments
            this.ctx.fillStyle = bact.color;
            for (let i = 0; i < 4; i++) {
                const fx = x - 14 - i * 4;
                const fy = y + ((i + Math.floor(this.animFrame / 4)) % 2) * 3 - 1 + wiggle;
                this.ctx.fillRect(fx, fy, 4, 2);
            }

            // Pili (small hairs)
            this.ctx.fillRect(x + 10, y - 2, 3, 2);
            this.ctx.fillRect(x + 10, y + 2, 3, 2);

        } else if (bact.shape === 'coccus') {
            // Round bacteria (coccus) - pixel art
            // Main body (pixelated circle)
            this.ctx.fillStyle = bact.color;
            this.ctx.fillRect(x - 6, y - 8, 12, 16);
            this.ctx.fillRect(x - 8, y - 6, 16, 12);

            // Inner highlight
            this.ctx.fillStyle = bact.dark;
            this.ctx.fillRect(x - 3, y - 3, 6, 6);

            // Highlight
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(x - 4, y - 5, 3, 3);
            this.ctx.globalAlpha = 1;
        }

        // Label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '5px "Press Start 2P"';
        this.ctx.fillText(bact.name, x - 18, y - 12);
    },

    // ========== PARTICLE SYSTEM ==========
    addParticle(x, y, vx, vy, color, life, size) {
        this.particles.push({ x, y, vx, vy, color, life, maxLife: life, size: size || 2 });
    },

    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.03; // light gravity
            p.life--;
            return p.life > 0;
        });
    },

    drawParticles() {
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        });
        this.ctx.globalAlpha = 1;
    },

    emitActionBurst(x, y, color, count) {
        count = count || 8;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 0.5 + Math.random() * 1.5;
            this.addParticle(
                x + (Math.random() - 0.5) * 10,
                y + (Math.random() - 0.5) * 10,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 1,
                color,
                30 + Math.floor(Math.random() * 20),
                1 + Math.floor(Math.random() * 3)
            );
        }
    },

    emitGrowthSparkles(x, y) {
        const colors = ['#a7f070', '#feae34', '#73eff7', '#ffffff'];
        for (let i = 0; i < 15; i++) {
            this.addParticle(
                x + (Math.random() - 0.5) * 40,
                y + (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 1.5,
                -1 - Math.random() * 2,
                colors[Math.floor(Math.random() * colors.length)],
                40 + Math.floor(Math.random() * 30),
                1 + Math.floor(Math.random() * 2)
            );
        }
    },

    emitRainParticles() {
        for (let i = 0; i < 3; i++) {
            this.addParticle(
                Math.random() * this.width,
                0,
                -0.5,
                3 + Math.random() * 2,
                '#4a90d9',
                50 + Math.floor(Math.random() * 30),
                1
            );
        }
    },

    // ========== SCREEN SHAKE ==========
    triggerShake(intensity, duration) {
        this.shake = { intensity, duration, startTime: Date.now() };
    },

    // ========== WEATHER EFFECTS ==========
    setWeather(type, duration) {
        this.weather = { type, duration, startTime: Date.now() };
    },

    drawWeather() {
        if (!this.weather.type) return;
        const elapsed = Date.now() - this.weather.startTime;
        if (elapsed > this.weather.duration) {
            this.weather.type = null;
            return;
        }

        const fade = Math.min(1, 1 - (elapsed / this.weather.duration) * 0.5);

        switch (this.weather.type) {
            case 'rain':
                // Falling rain streaks
                this.ctx.globalAlpha = 0.4 * fade;
                this.ctx.strokeStyle = '#4a90d9';
                this.ctx.lineWidth = 1;
                for (let i = 0; i < 30; i++) {
                    const rx = (i * 37 + elapsed * 0.15) % this.width;
                    const ry = (i * 53 + elapsed * 0.4) % this.height;
                    this.ctx.beginPath();
                    this.ctx.moveTo(rx, ry);
                    this.ctx.lineTo(rx - 2, ry + 8);
                    this.ctx.stroke();
                }
                this.ctx.globalAlpha = 1;
                this.emitRainParticles();
                break;

            case 'lightning':
                // Bright white flash, fades quickly
                if (elapsed < 150) {
                    this.ctx.globalAlpha = 0.6 * (1 - elapsed / 150);
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(0, 0, this.width, this.height);
                    this.ctx.globalAlpha = 1;
                }
                break;

            case 'drought':
                // Amber/heat shimmer overlay
                this.ctx.globalAlpha = 0.15 * fade;
                this.ctx.fillStyle = '#ff8800';
                this.ctx.fillRect(0, 0, this.width, this.height * 0.4);
                this.ctx.globalAlpha = 1;
                break;
        }
    },

    // ========== FIREFLIES (night only) ==========
    drawFireflies(dayProgress) {
        // Only show during night phases (late in day or early)
        const isNight = dayProgress > 0.7 || dayProgress < 0.15;
        if (!isNight) return;

        const nightIntensity = dayProgress > 0.7
            ? (dayProgress - 0.7) / 0.3
            : (0.15 - dayProgress) / 0.15;

        const layer = this.layers.ground;

        this.creatures.fireflies.forEach(ff => {
            // Move slowly
            ff.x += ff.speedX;
            ff.y += ff.speedY;

            // Bounce off edges
            if (ff.x < 0 || ff.x > 1) ff.speedX *= -1;
            if (ff.y < 0.3 || ff.y > 0.9) ff.speedY *= -1;
            ff.x = Math.max(0, Math.min(1, ff.x));
            ff.y = Math.max(0.3, Math.min(0.9, ff.y));

            ff.glowPhase += ff.glowSpeed;

            const glow = (Math.sin(ff.glowPhase) + 1) * 0.5; // 0 to 1
            const alpha = glow * 0.8 * nightIntensity;

            const px = ff.x * this.width;
            const py = layer.y + ff.y * layer.height;

            // Glow
            this.ctx.globalAlpha = alpha * 0.3;
            this.ctx.fillStyle = '#ffff88';
            this.ctx.fillRect(Math.floor(px) - 3, Math.floor(py) - 3, 7, 7);

            // Body
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#ffee88';
            this.ctx.fillRect(Math.floor(px) - 1, Math.floor(py) - 1, 3, 3);
        });
        this.ctx.globalAlpha = 1;
    },

    clear() {
        this.ctx.fillStyle = '#1a1c2c';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.animFrame++;
        this.updateAnimations();
        this.updateParticles();
    },

    // ============ DRAW SKY (Day/Night Cycle) ============
    drawSky(temperature, n2o, dayProgress) {
        temperature = temperature || 20;
        n2o = n2o || 0;
        dayProgress = dayProgress || 0;
        const layer = this.layers.sky;

        // Sky band palettes for each phase
        const nightBands  = ['#050510', '#0a0a1a', '#0f0f25', '#141430', '#1a1a3a', '#1f1f44'];
        const dawnBands   = ['#1a0a2e', '#2d1545', '#4a2060', '#8b3a60', '#d46a50', '#f0a060'];
        const dayBands    = ['#0d1b2a', '#1a3a52', '#2d5a7b', '#4a90a4', '#7ec8e3', '#b8e4f0'];
        const duskBands   = ['#1a0a20', '#2d1535', '#4a2050', '#7a3a50', '#c06a40', '#e09050'];

        // N₂O pollution tint bands
        const dirtyBands  = ['#1a1510', '#2a2518', '#3d3020', '#5a4530', '#7a6040', '#a08060'];
        const hazyBands   = ['#1a1520', '#2a2535', '#3d3a50', '#5a6070', '#7e9aa0', '#a0b0b0'];

        // Determine base bands from day phase
        // 0.0-0.10 dawn, 0.10-0.45 day, 0.45-0.55 dusk, 0.55-1.0 night
        let bands;
        if (dayProgress < 0.10) {
            // Night → Dawn transition
            const t = dayProgress / 0.10;
            bands = this.blendBands(nightBands, dawnBands, t);
        } else if (dayProgress < 0.15) {
            // Dawn → Day transition
            const t = (dayProgress - 0.10) / 0.05;
            bands = this.blendBands(dawnBands, dayBands, t);
        } else if (dayProgress < 0.45) {
            // Full day
            bands = dayBands.slice();
        } else if (dayProgress < 0.50) {
            // Day → Dusk transition
            const t = (dayProgress - 0.45) / 0.05;
            bands = this.blendBands(dayBands, duskBands, t);
        } else if (dayProgress < 0.55) {
            // Dusk → Night transition
            const t = (dayProgress - 0.50) / 0.05;
            bands = this.blendBands(duskBands, nightBands, t);
        } else {
            // Full night
            bands = nightBands.slice();
        }

        // Apply N₂O pollution tint during day
        if (n2o > 30 && dayProgress >= 0.10 && dayProgress < 0.55) {
            const pollutionT = Math.min((n2o - 30) / 20, 1);
            bands = this.blendBands(bands, dirtyBands, pollutionT * 0.7);
        } else if (n2o > 15 && dayProgress >= 0.10 && dayProgress < 0.55) {
            const pollutionT = Math.min((n2o - 15) / 15, 1);
            bands = this.blendBands(bands, hazyBands, pollutionT * 0.5);
        }

        const bandHeight = Math.ceil(layer.height / bands.length);

        bands.forEach((color, i) => {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(0, i * bandHeight, this.width, bandHeight + 1);
        });

        // Draw stars during night/dusk/dawn
        this.drawStars(dayProgress);

        // Draw sun during day arc
        this.drawMovingSun(temperature, dayProgress);

        // Draw moon during night arc
        this.drawMoon(dayProgress);

        // Clouds always visible (slightly dimmed at night)
        this.drawPixelClouds(n2o, dayProgress);
    },

    // Moving sun arcs left→right during 0.05-0.55
    drawMovingSun(temperature, dayProgress) {
        temperature = temperature || 20;
        if (dayProgress < 0.05 || dayProgress > 0.55) return;

        const layer = this.layers.sky;
        // Map 0.05-0.55 to 0-1 for arc position
        const arcT = (dayProgress - 0.05) / 0.50;

        // X goes from left (margin) to right (margin)
        const margin = 60;
        const x = Math.floor(margin + arcT * (this.width - margin * 2));
        // Y follows a sine arc (highest at middle)
        const y = Math.floor(layer.height * 0.8 - Math.sin(arcT * Math.PI) * (layer.height * 0.65));

        // Alpha fades near horizon (at start/end of arc)
        let alpha = 1;
        if (arcT < 0.1) alpha = arcT / 0.1;
        else if (arcT > 0.9) alpha = (1 - arcT) / 0.1;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        // Scale factor based on temperature
        const scale = temperature > 30 ? 1 + (temperature - 30) * 0.03 : 1;
        const s = Math.floor(16 * scale);

        // Sun color shifts with temperature
        let bodyColor = '#ffcc00';
        let glowColor = '#ffdd44';
        let rayColor = '#ffaa00';
        let highlightColor = '#ffee88';

        if (temperature > 50) {
            bodyColor = '#ff4400';
            glowColor = '#ff2200';
            rayColor = '#ff0000';
            highlightColor = '#ff8844';
        } else if (temperature > 40) {
            bodyColor = '#ff8800';
            glowColor = '#ff6600';
            rayColor = '#ff4400';
            highlightColor = '#ffaa44';
        }

        // Pixel sun glow
        this.ctx.fillStyle = glowColor;
        this.ctx.globalAlpha = (0.3 + (scale - 1) * 0.2) * alpha;
        this.ctx.fillRect(x - s * 1.5, y - s * 1.5, s * 3, s * 3);

        // Pulsing red glow at extreme temps
        if (temperature > 50) {
            const pulse = Math.sin(this.animFrame * 0.1) * 0.15 + 0.15;
            this.ctx.fillStyle = '#ff0000';
            this.ctx.globalAlpha = pulse * alpha;
            this.ctx.fillRect(x - s * 2, y - s * 2, s * 4, s * 4);
        }

        this.ctx.globalAlpha = alpha;

        // Sun body (pixelated circle)
        this.ctx.fillStyle = bodyColor;
        this.ctx.fillRect(x - s * 0.75, y - s, s * 1.5, s * 2);
        this.ctx.fillRect(x - s, y - s * 0.75, s * 2, s * 1.5);
        this.ctx.fillRect(x - s * 0.875, y - s * 0.875, s * 1.75, s * 1.75);

        // Inner highlight
        this.ctx.fillStyle = highlightColor;
        this.ctx.fillRect(x - s * 0.5, y - s * 0.625, s * 0.75, s * 0.75);

        // Sun rays
        this.ctx.fillStyle = rayColor;
        const rayPhase = Math.floor(this.animFrame / 8) % 2;
        const rayLen = Math.floor(8 * scale);
        const rayDist = Math.floor(18 * scale);

        this.ctx.fillRect(x - 2, y - rayDist - rayPhase * 2, 4, rayLen);
        this.ctx.fillRect(x - 2, y + rayDist - rayLen + rayPhase * 2, 4, rayLen);
        this.ctx.fillRect(x - rayDist - rayPhase * 2, y - 2, rayLen, 4);
        this.ctx.fillRect(x + rayDist - rayLen + rayPhase * 2, y - 2, rayLen, 4);

        const diagDist = Math.floor(14 * scale);
        const diagSize = Math.floor(6 * scale);
        this.ctx.fillRect(x - diagDist - rayPhase, y - diagDist - rayPhase, diagSize, diagSize);
        this.ctx.fillRect(x + diagDist - diagSize + rayPhase, y - diagDist - rayPhase, diagSize, diagSize);
        this.ctx.fillRect(x - diagDist - rayPhase, y + diagDist - diagSize + rayPhase, diagSize, diagSize);
        this.ctx.fillRect(x + diagDist - diagSize + rayPhase, y + diagDist - diagSize + rayPhase, diagSize, diagSize);

        this.ctx.restore();
    },

    // Moon arcs left→right during 0.55-1.05 (wraps past 1.0)
    drawMoon(dayProgress) {
        // Moon visible during 0.55-1.0 (wraps: treat >1 as next cycle)
        if (dayProgress < 0.50) return;

        const layer = this.layers.sky;
        // Map 0.55-1.05 to 0-1 arc
        let arcT;
        if (dayProgress >= 0.55) {
            arcT = (dayProgress - 0.55) / 0.50;
        } else {
            // wrapped portion 0.0-0.05
            arcT = (dayProgress + 0.45) / 0.50;
        }
        arcT = Math.min(arcT, 1);

        // Fade in during dusk (0.50-0.60)
        let alpha = 1;
        if (dayProgress < 0.60) alpha = (dayProgress - 0.50) / 0.10;
        if (arcT > 0.9) alpha = Math.min(alpha, (1 - arcT) / 0.1);

        if (alpha <= 0) return;

        const margin = 60;
        const x = Math.floor(margin + arcT * (this.width - margin * 2));
        const y = Math.floor(layer.height * 0.8 - Math.sin(arcT * Math.PI) * (layer.height * 0.6));

        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        const s = 14;

        // Moon glow
        this.ctx.fillStyle = '#aaccff';
        this.ctx.globalAlpha = 0.15 * alpha;
        this.ctx.fillRect(x - s * 2, y - s * 2, s * 4, s * 4);
        this.ctx.globalAlpha = alpha;

        // Moon body (white circle)
        this.ctx.fillStyle = '#e8e8f0';
        this.ctx.fillRect(x - s * 0.75, y - s, s * 1.5, s * 2);
        this.ctx.fillRect(x - s, y - s * 0.75, s * 2, s * 1.5);
        this.ctx.fillRect(x - s * 0.875, y - s * 0.875, s * 1.75, s * 1.75);

        // Crescent shadow (dark overlay on right side)
        this.ctx.fillStyle = '#1a1a30';
        this.ctx.globalAlpha = 0.7 * alpha;
        this.ctx.fillRect(x + 2, y - s * 0.6, s * 0.7, s * 1.2);
        this.ctx.fillRect(x + 4, y - s * 0.8, s * 0.5, s * 1.6);

        // Craters
        this.ctx.fillStyle = '#c0c0d0';
        this.ctx.globalAlpha = 0.5 * alpha;
        this.ctx.fillRect(x - 6, y - 4, 4, 4);
        this.ctx.fillRect(x - 2, y + 3, 3, 3);
        this.ctx.fillRect(x - 8, y + 1, 2, 2);

        this.ctx.restore();
    },

    // Stars with twinkle, visible during night/dusk/dawn
    drawStars(dayProgress) {
        // Stars visible during night: fade in at dusk (0.45-0.55), visible through night, fade out at dawn (0.05-0.15)
        let starAlpha = 0;
        if (dayProgress >= 0.55) {
            starAlpha = 1;
        } else if (dayProgress >= 0.45) {
            starAlpha = (dayProgress - 0.45) / 0.10;
        } else if (dayProgress <= 0.05) {
            starAlpha = 1;
        } else if (dayProgress <= 0.15) {
            starAlpha = 1 - (dayProgress - 0.05) / 0.10;
        }

        if (starAlpha <= 0) return;

        const layer = this.layers.sky;
        this.ctx.fillStyle = '#ffffff';

        this.stars.forEach((star) => {
            const twinkle = Math.sin(this.animFrame * star.twinkleSpeed + star.twinklePhase);
            const brightness = 0.4 + twinkle * 0.6;

            this.ctx.globalAlpha = Math.max(0, brightness * starAlpha);
            const sx = Math.floor(star.x * this.width);
            const sy = Math.floor(star.y * layer.height);
            this.ctx.fillRect(sx, sy, star.size, star.size);

            // Cross twinkle on bright stars
            if (brightness > 0.8 && star.size >= 2) {
                this.ctx.globalAlpha = (brightness - 0.8) * 5 * starAlpha * 0.5;
                this.ctx.fillRect(sx - 1, sy, star.size + 2, star.size);
                this.ctx.fillRect(sx, sy - 1, star.size, star.size + 2);
            }
        });

        this.ctx.globalAlpha = 1;
    },

    drawPixelClouds(n2o, dayProgress) {
        n2o = n2o || 0;
        dayProgress = dayProgress || 0;

        // Dim clouds at night
        let cloudAlpha = 1;
        if (dayProgress >= 0.55) cloudAlpha = 0.3;
        else if (dayProgress >= 0.50) cloudAlpha = 1 - (dayProgress - 0.50) / 0.05 * 0.7;
        else if (dayProgress <= 0.05) cloudAlpha = 0.3;
        else if (dayProgress <= 0.10) cloudAlpha = 0.3 + (dayProgress - 0.05) / 0.05 * 0.7;

        // Retro pixel clouds - well distributed
        const clouds = [
            { x: 25, y: 30, type: 'big' },
            { x: 100, y: 55, type: 'small' },
            { x: 180, y: 25, type: 'medium' },
            { x: 280, y: 60, type: 'small' },
            { x: 360, y: 35, type: 'big' },
            { x: 460, y: 50, type: 'medium' },
            { x: 550, y: 28, type: 'small' },
            { x: 640, y: 58, type: 'medium' },
            { x: 730, y: 40, type: 'big' }
        ];

        clouds.forEach((cloud, i) => {
            // Slow drift
            let cx = (cloud.x + this.animFrame * 0.15) % (this.width + 80) - 40;
            const cy = cloud.y + Math.floor(Math.sin(this.animFrame * 0.02 + i) * 2);

            // Shadow
            this.ctx.fillStyle = '#5588aa';
            this.ctx.globalAlpha = 0.3 * cloudAlpha;

            if (cloud.type === 'big') {
                this.ctx.fillRect(cx + 2, cy + 2, 48, 16);
            } else if (cloud.type === 'medium') {
                this.ctx.fillRect(cx + 2, cy + 2, 36, 12);
            } else {
                this.ctx.fillRect(cx + 2, cy + 2, 24, 10);
            }
            this.ctx.globalAlpha = cloudAlpha;

            // Cloud body - gets dirty brown tint with high N₂O
            this.ctx.fillStyle = n2o > 30 ? '#c0a080' : n2o > 15 ? '#e0d0c0' : '#ffffff';

            if (cloud.type === 'big') {
                // Big fluffy cloud
                this.ctx.fillRect(cx, cy, 48, 12);
                this.ctx.fillRect(cx + 6, cy - 8, 36, 10);
                this.ctx.fillRect(cx + 14, cy - 14, 20, 8);
                this.ctx.fillRect(cx + 4, cy + 10, 16, 6);
                this.ctx.fillRect(cx + 28, cy + 10, 16, 6);
            } else if (cloud.type === 'medium') {
                this.ctx.fillRect(cx, cy, 36, 10);
                this.ctx.fillRect(cx + 6, cy - 6, 24, 8);
                this.ctx.fillRect(cx + 12, cy - 10, 12, 6);
            } else {
                // Small cloud
                this.ctx.fillRect(cx, cy, 24, 8);
                this.ctx.fillRect(cx + 4, cy - 4, 16, 6);
            }

            // Highlight
            this.ctx.fillStyle = '#eeffff';
            this.ctx.globalAlpha = 0.7 * cloudAlpha;
            this.ctx.fillRect(cx + 4, cy - 2, 6, 4);
            this.ctx.globalAlpha = 1;
        });
    },

    // ============ DRAW GROUND ============
    drawGround() {
        const layer = this.layers.ground;

        // Solid grass base
        this.ctx.fillStyle = '#38a169';
        this.ctx.fillRect(0, layer.y, this.width, layer.height);

        // Grass pattern (pixel style)
        this.ctx.fillStyle = '#48bb78';
        for (let x = 0; x < this.width; x += 8) {
            this.ctx.fillRect(x, layer.y, 4, layer.height);
        }

        // Grass blade tips
        this.ctx.fillStyle = '#68d391';
        const windPhase = Math.floor(this.animFrame / 10) % 3;
        for (let x = 0; x < this.width; x += 6) {
            const offset = ((x / 6) + windPhase) % 3;
            const h = 3 + offset;
            this.ctx.fillRect(x + offset, layer.y - 2, 2, h);
        }

        // Dark soil line at bottom
        this.ctx.fillStyle = '#5d4037';
        this.ctx.fillRect(0, layer.y + layer.height - 2, this.width, 2);
    },

    // ============ DRAW SOIL LAYERS ============
    drawTopsoil() {
        const layer = this.layers.topsoil;

        // Rich brown soil - pixel style gradient
        this.ctx.fillStyle = '#78350f';
        this.ctx.fillRect(0, layer.y, this.width, layer.height / 2);
        this.ctx.fillStyle = '#5c2a0a';
        this.ctx.fillRect(0, layer.y + layer.height / 2, this.width, layer.height / 2);

        // Soil texture/particles (more pixelated)
        this.ctx.fillStyle = '#92400e';
        for (let i = 0; i < 60; i++) {
            const x = (i * 43) % this.width;
            const y = layer.y + (i * 29) % layer.height;
            this.ctx.fillRect(x, y, 4, 4);
        }

        // Darker spots
        this.ctx.fillStyle = '#3d1f0a';
        for (let i = 0; i < 30; i++) {
            const x = (i * 61 + 15) % this.width;
            const y = layer.y + (i * 37 + 8) % layer.height;
            this.ctx.fillRect(x, y, 6, 6);
        }

        // Draw fungi mycelium network
        this.drawMycelium(layer);

        // Draw some mushrooms/fruiting bodies
        this.drawMushrooms(layer);
    },

    drawMycelium(layer) {
        // Draw the fungal threads/hyphae
        this.ctx.strokeStyle = '#e8dcc8';
        this.ctx.lineWidth = 1;

        // Animated glow pulse
        const glowPhase = (Math.sin(this.animFrame * 0.03) + 1) / 2;

        this.myceliumPaths.forEach((path, i) => {
            const x1 = Math.floor(path.x1 * this.width);
            const y1 = Math.floor(layer.y + path.y1 * layer.height);
            const x2 = Math.floor(path.x2 * this.width);
            const y2 = Math.floor(layer.y + path.y2 * layer.height);

            // Thicker main branches, thinner tips
            this.ctx.lineWidth = Math.max(1, path.depth - 2);

            // Slight animation - threads pulse
            const pulse = ((i + this.animFrame) % 60 < 30) ? 1 : 0.7;
            this.ctx.globalAlpha = 0.3 + glowPhase * 0.2 * pulse;

            // Draw as pixel segments
            this.ctx.fillStyle = '#f5f0e6';
            const dx = x2 - x1;
            const dy = y2 - y1;
            const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);

            for (let s = 0; s <= steps; s += 2) {
                const px = Math.floor(x1 + (dx * s / steps));
                const py = Math.floor(y1 + (dy * s / steps));
                const size = path.depth > 3 ? 2 : 1;
                this.ctx.fillRect(px, py, size, size);
            }
        });

        this.ctx.globalAlpha = 1;

        // Draw connection nodes (where hyphae meet)
        this.ctx.fillStyle = '#fff8e8';
        this.myceliumPaths.forEach((path, i) => {
            if (path.depth === 5 && i % 3 === 0) {
                const x = Math.floor(path.x1 * this.width);
                const y = Math.floor(layer.y + path.y1 * layer.height);
                this.ctx.fillRect(x - 2, y - 2, 4, 4);
            }
        });
    },

    drawMushrooms(layer) {
        const mushrooms = [
            { x: 0.12, y: 0.15, size: 1 },
            { x: 0.35, y: 0.25, size: 0.8 },
            { x: 0.55, y: 0.1, size: 1.2 },
            { x: 0.78, y: 0.2, size: 0.9 },
            { x: 0.92, y: 0.3, size: 0.7 }
        ];

        mushrooms.forEach((m, i) => {
            const x = Math.floor(m.x * this.width);
            const y = Math.floor(layer.y + m.y * layer.height);
            const s = Math.floor(6 * m.size);
            const wobble = Math.floor(Math.sin(this.animFrame * 0.05 + i) * 1);

            // Stem
            this.ctx.fillStyle = '#f5f0e6';
            this.ctx.fillRect(x - 2, y, 4, s + 4);

            // Cap
            this.ctx.fillStyle = '#cd853f';
            this.ctx.fillRect(x - s - 2 + wobble, y - 4, s * 2 + 4, 4);
            this.ctx.fillRect(x - s + wobble, y - 6, s * 2, 3);

            // Cap highlight
            this.ctx.fillStyle = '#daa520';
            this.ctx.fillRect(x - s + 2 + wobble, y - 5, 3, 2);

            // Cap spots
            this.ctx.fillStyle = '#fff8dc';
            this.ctx.fillRect(x + wobble, y - 5, 2, 2);
            this.ctx.fillRect(x - 4 + wobble, y - 4, 2, 2);
        });
    },

    drawSubsoil() {
        const layer = this.layers.subsoil;

        this.ctx.fillStyle = '#78716c';
        this.ctx.fillRect(0, layer.y, this.width, layer.height);

        // Rocks
        this.ctx.fillStyle = '#a8a29e';
        const rocks = [
            { x: 50, y: 10, w: 25, h: 20 },
            { x: 180, y: 15, w: 30, h: 25 },
            { x: 320, y: 8, w: 22, h: 18 },
            { x: 480, y: 20, w: 28, h: 22 },
            { x: 600, y: 12, w: 24, h: 20 }
        ];

        rocks.forEach(rock => {
            if (rock.x < this.width) {
                this.ctx.fillRect(rock.x, layer.y + rock.y, rock.w, rock.h);
                this.ctx.fillStyle = '#d6d3d1';
                this.ctx.fillRect(rock.x + 3, layer.y + rock.y + 3, rock.w * 0.4, rock.h * 0.3);
                this.ctx.fillStyle = '#a8a29e';
            }
        });
    },

    drawWater() {
        const layer = this.layers.water;

        // Retro banded water
        const bands = ['#1e6091', '#1a759f', '#168aad', '#34a0a4'];
        const bandHeight = Math.ceil(layer.height / bands.length);

        bands.forEach((color, i) => {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(0, layer.y + i * bandHeight, this.width, bandHeight + 1);
        });

        // Pixel wave animation
        this.ctx.fillStyle = '#52b69a';
        const wavePhase = Math.floor(this.animFrame / 6) % 4;

        for (let row = 0; row < 3; row++) {
            const y = layer.y + 8 + row * 18;
            for (let x = 0; x < this.width; x += 24) {
                const offset = ((x / 24 + row + wavePhase) % 4) * 2 - 4;
                this.ctx.fillRect(x + offset, y, 16, 4);
            }
        }

        // Sparkle highlights
        this.ctx.fillStyle = '#99d98c';
        for (let i = 0; i < 8; i++) {
            if ((this.animFrame + i * 7) % 30 < 10) {
                const sx = (i * 97 + this.animFrame) % this.width;
                const sy = layer.y + 10 + (i * 13) % (layer.height - 20);
                this.ctx.fillRect(sx, sy, 3, 3);
            }
        }
    },

    // ============ DRAW WATER CREATURES ============
    drawWaterCreatures(leached, temperature) {
        leached = leached || 0;
        temperature = temperature || 20;
        const layer = this.layers.water;

        const tempSpeedMult = temperature > 30 ? 1 + (temperature - 30) * 0.08 : 1;
        // Fish panic in polluted water, then slow and die off in extreme
        const fishCount = leached > 70 ? 1 : leached > 50 ? 2 : leached > 40 ? 3 : this.creatures.fish.length;
        // Panicked in moderate pollution, sluggish in extreme
        const fishSpeedMult = leached > 60 ? 0.4 : leached > 30 ? 1.5 + (leached - 30) * 0.05 : 1;

        // Update and draw fish
        this.creatures.fish.slice(0, fishCount).forEach((fish, i) => {
            // Move fish
            fish.x += fish.speed * fish.dir * fishSpeedMult * tempSpeedMult;

            // Erratic direction changes when stressed
            if (leached > 30 && leached <= 60 && Math.random() < (leached - 30) * 0.004) {
                fish.dir *= -1;
            }
            if (temperature > 35 && Math.random() < (temperature - 35) * 0.005) {
                fish.dir *= -1;
            }

            // Wrap around
            if (fish.x > 1.1) { fish.x = -0.1; fish.dir = 1; }
            if (fish.x < -0.1) { fish.x = 1.1; fish.dir = -1; }

            const x = Math.floor(fish.x * this.width);
            const y = Math.floor(layer.y + fish.y * layer.height);
            const size = Math.floor(10 * fish.size);
            const tailWag = Math.floor(Math.sin(this.animFrame * 0.08 + i) * 3);  // Slower tail

            // Fish body - head faces swimming direction
            this.ctx.fillStyle = fish.color;
            if (fish.dir > 0) {
                // Swimming right: head on RIGHT, tail on LEFT
                // Body
                this.ctx.fillRect(x - size/2, y - size/3, size * 1.5, size * 0.7);
                this.ctx.fillRect(x - size/2, y - size/2, size, size);
                // Tail (left side)
                this.ctx.fillRect(x - size, y - size/3 + tailWag, size/2, size * 0.3);
                this.ctx.fillRect(x - size - 2, y - size/2 + tailWag, size/3, size * 0.8);
                // Eye (right side)
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x + size/2 - 4, y - size/4, 3, 3);
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(x + size/2 - 4, y - size/4 + 1, 2, 2);
                // Fin
                this.ctx.fillStyle = fish.color;
                this.ctx.globalAlpha = 0.7;
                this.ctx.fillRect(x - 2, y - size/2 - 3, 4, 4);
                this.ctx.globalAlpha = 1;
            } else {
                // Swimming left: head on LEFT, tail on RIGHT
                this.ctx.fillRect(x - size, y - size/3, size * 1.5, size * 0.7);
                this.ctx.fillRect(x - size + 2, y - size/2, size, size);
                // Tail (right side)
                this.ctx.fillRect(x + size/2, y - size/3 + tailWag, size/2, size * 0.3);
                this.ctx.fillRect(x + size/2 + 2, y - size/2 + tailWag, size/3, size * 0.8);
                // Eye (left side)
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x - size + 4, y - size/4, 3, 3);
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(x - size + 5, y - size/4 + 1, 2, 2);
                // Fin
                this.ctx.fillStyle = fish.color;
                this.ctx.globalAlpha = 0.7;
                this.ctx.fillRect(x - 2, y - size/2 - 3, 4, 4);
                this.ctx.globalAlpha = 1;
            }

            // Bubbles occasionally
            if ((this.animFrame + i * 20) % 60 < 3) {
                this.ctx.fillStyle = '#aaddff';
                this.ctx.globalAlpha = 0.6;
                this.ctx.fillRect(x, y - size - 5 - (this.animFrame % 20), 3, 3);
                this.ctx.fillRect(x + 4, y - size - 10 - (this.animFrame % 15), 2, 2);
                this.ctx.globalAlpha = 1;
            }
        });

        // Draw some water plants/seaweed
        this.ctx.fillStyle = '#2d5a27';
        for (let i = 0; i < 6; i++) {
            const x = 60 + i * (this.width / 6);
            const baseY = layer.y + layer.height - 5;
            const sway = Math.sin(this.animFrame * 0.04 + i) * 3;

            for (let j = 0; j < 4; j++) {
                const segY = baseY - j * 8;
                const segSway = sway * (j * 0.3);
                this.ctx.fillRect(x + segSway, segY, 3, 8);
            }
        }

        // Tadpoles - very slow swimming
        this.ctx.fillStyle = '#1a1a1a';
        for (let i = 0; i < 3; i++) {
            const tx = (100 + i * 200 + this.animFrame * 0.025) % this.width;  // Ultra slow
            const ty = layer.y + 20 + i * 15 + Math.sin(this.animFrame * 0.01 + i) * 5;
            const tailWave = Math.sin(this.animFrame * 0.03 + i) * 2;  // Ultra slow tail

            // Head
            this.ctx.fillRect(tx - 4, ty - 3, 8, 6);
            this.ctx.fillRect(tx - 3, ty - 4, 6, 8);
            // Tail
            this.ctx.fillRect(tx + 4, ty - 1 + tailWave, 6, 2);
            this.ctx.fillRect(tx + 8, ty + tailWave, 4, 2);
        }
    },

    // ============ DRAW SKY CREATURES ============
    drawSkyCreatures(temperature, dayProgress) {
        temperature = temperature || 20;
        dayProgress = dayProgress || 0;
        const skyLayer = this.layers.sky;
        const groundLayer = this.layers.ground;

        const isNight = dayProgress >= 0.55 || dayProgress < 0.05;

        // Birds speed up dramatically with temp - panicked flight
        const tempSpeedMult = temperature > 30 ? 1 + (temperature - 30) * 0.1 : 1;

        // At extreme temps, birds flee; at night reduce to 1
        let birdCount = temperature > 50 ? Math.max(1, this.creatures.birds.length - 2) : this.creatures.birds.length;
        if (isNight) birdCount = Math.min(birdCount, 1);

        // Update and draw birds
        this.creatures.birds.slice(0, birdCount).forEach((bird, i) => {
            bird.x += bird.speed * bird.dir * tempSpeedMult;

            // Much more erratic direction changes at high temp - panicked
            if (temperature > 30 && Math.random() < (temperature - 30) * 0.008) {
                bird.dir *= -1;
            }
            // Vertical jitter when panicked
            if (temperature > 40) {
                bird.y += (Math.random() - 0.5) * 0.005 * (temperature - 40);
                bird.y = Math.max(0.1, Math.min(0.8, bird.y));
            }

            if (bird.x > 1.15) { bird.x = -0.15; bird.dir = 1; }
            if (bird.x < -0.15) { bird.x = 1.15; bird.dir = -1; }

            const x = Math.floor(bird.x * this.width);
            const y = Math.floor(skyLayer.y + bird.y * skyLayer.height);
            const flapSpeed = 0.08 * tempSpeedMult;
            const wingFlap = Math.floor(Math.sin(this.animFrame * flapSpeed + i * 2) * 4);

            this.ctx.fillStyle = '#2c2c2c';

            if (bird.dir > 0) {
                // Body
                this.ctx.fillRect(x - 6, y - 2, 12, 4);
                this.ctx.fillRect(x - 4, y - 3, 8, 6);
                // Head
                this.ctx.fillRect(x + 6, y - 3, 5, 5);
                // Beak
                this.ctx.fillStyle = '#ffa500';
                this.ctx.fillRect(x + 11, y - 1, 4, 2);
                // Wings
                this.ctx.fillStyle = '#3a3a3a';
                this.ctx.fillRect(x - 4, y - 6 - wingFlap, 8, 4);
            } else {
                // Body (mirrored)
                this.ctx.fillRect(x - 6, y - 2, 12, 4);
                this.ctx.fillRect(x - 4, y - 3, 8, 6);
                // Head
                this.ctx.fillRect(x - 11, y - 3, 5, 5);
                // Beak
                this.ctx.fillStyle = '#ffa500';
                this.ctx.fillRect(x - 15, y - 1, 4, 2);
                // Wings
                this.ctx.fillStyle = '#3a3a3a';
                this.ctx.fillRect(x - 4, y - 6 - wingFlap, 8, 4);
            }
        });

        // Update and draw butterflies (near grass level) - hidden at night, panicked in heat
        const butterflyCount = temperature > 50 ? 1 : temperature > 40 ? 2 : this.creatures.butterflies.length;
        if (!isNight) this.creatures.butterflies.slice(0, butterflyCount).forEach((bf, i) => {
            bf.x += bf.speedX * tempSpeedMult;
            bf.y += bf.speedY * tempSpeedMult;
            bf.wingPhase += 0.06 * tempSpeedMult;  // Faster flutter in heat

            // Erratic movement when hot
            if (temperature > 35) {
                bf.speedX += (Math.random() - 0.5) * 0.00005 * (temperature - 35);
                bf.speedY += (Math.random() - 0.5) * 0.00003 * (temperature - 35);
                // Clamp speeds
                bf.speedX = Math.max(-0.001, Math.min(0.001, bf.speedX));
                bf.speedY = Math.max(-0.0005, Math.min(0.0005, bf.speedY));
            }

            // Bounce off edges
            if (bf.x > 1 || bf.x < 0) bf.speedX *= -1;
            if (bf.y > 1 || bf.y < 0) bf.speedY *= -1;

            // Keep in sky/ground area
            const x = Math.floor(bf.x * this.width);
            const y = Math.floor(skyLayer.height * 0.7 + bf.y * (groundLayer.y - skyLayer.height * 0.7));
            const wingAngle = Math.sin(bf.wingPhase) * 0.8;

            // Wings
            this.ctx.fillStyle = bf.color;
            const wingSize = 5 + Math.floor(Math.abs(wingAngle) * 3);

            // Left wing
            this.ctx.fillRect(x - wingSize - 1, y - wingSize/2, wingSize, wingSize);
            // Right wing
            this.ctx.fillRect(x + 2, y - wingSize/2, wingSize, wingSize);

            // Wing pattern
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillRect(x - wingSize + 1, y - 1, 2, 2);
            this.ctx.fillRect(x + 3, y - 1, 2, 2);
            this.ctx.globalAlpha = 1;

            // Body
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.fillRect(x - 1, y - 4, 2, 8);

            // Antennae
            this.ctx.fillRect(x - 2, y - 6, 1, 3);
            this.ctx.fillRect(x + 1, y - 6, 1, 3);
        });

        // Occasional bee - very slow buzzing (hidden at night)
        if (!isNight) {
            const beeX = (this.animFrame * 0.06) % (this.width + 100) - 50;
            const beeY = groundLayer.y - 30 + Math.sin(this.animFrame * 0.008) * 15;

            // Bee body
            this.ctx.fillStyle = '#ffd700';
            this.ctx.fillRect(beeX - 4, beeY - 3, 8, 6);
            // Stripes
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.fillRect(beeX - 2, beeY - 3, 2, 6);
            this.ctx.fillRect(beeX + 2, beeY - 3, 2, 6);
            // Wings
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 0.6;
            const beeWing = Math.floor(Math.sin(this.animFrame * 0.15) * 2);
            this.ctx.fillRect(beeX - 2, beeY - 6 - beeWing, 4, 4);
            this.ctx.globalAlpha = 1;
        }
    },

    // ============ DRAW SOIL ORGANISMS ============
    drawSoilOrganisms(temperature, dayProgress) {
        temperature = temperature || 20;
        dayProgress = dayProgress || 0;
        const isNight = dayProgress >= 0.55 || dayProgress < 0.05;
        const nightSpeedMult = isNight ? 1.5 : 1;
        // Soil creatures go frantic in heat
        const tempSpeedMult = (temperature > 30 ? 1 + (temperature - 30) * 0.08 : 1) * nightSpeedMult;
        const layer = this.layers.topsoil;

        // Draw some bacteria in soil
        const bacteriaPositions = [
            { x: 0.1, y: 0.3, type: 'rod' },
            { x: 0.25, y: 0.6, type: 'coccus' },
            { x: 0.4, y: 0.4, type: 'rod' },
            { x: 0.55, y: 0.7, type: 'coccus' },
            { x: 0.7, y: 0.35, type: 'rod' },
            { x: 0.85, y: 0.55, type: 'coccus' },
            { x: 0.95, y: 0.25, type: 'rod' }
        ];

        bacteriaPositions.forEach((bact, i) => {
            const x = Math.floor(bact.x * this.width);
            const y = Math.floor(layer.y + bact.y * layer.height);
            const wiggle = Math.floor(Math.sin(this.animFrame * 0.08 + i * 2) * 2);

            this.ctx.globalAlpha = 0.6;

            if (bact.type === 'rod') {
                // Small rod bacteria
                this.ctx.fillStyle = '#c4b5a0';
                this.ctx.fillRect(x - 4 + wiggle, y - 2, 8, 4);
                this.ctx.fillStyle = '#a89880';
                this.ctx.fillRect(x - 2 + wiggle, y - 1, 4, 2);
                // Flagellum
                this.ctx.fillRect(x - 6 + wiggle, y, 2, 1);
                this.ctx.fillRect(x - 8 + wiggle, y - 1, 2, 1);
            } else {
                // Small round bacteria
                this.ctx.fillStyle = '#d4c5b0';
                this.ctx.fillRect(x - 3, y - 3 + wiggle, 6, 6);
                this.ctx.fillStyle = '#b4a590';
                this.ctx.fillRect(x - 1, y - 1 + wiggle, 2, 2);
            }

            this.ctx.globalAlpha = 1;
        });

        // Draw larger animated earthworms
        this.creatures.worms.forEach((worm, wi) => {
            worm.x += worm.speed * worm.dir * tempSpeedMult;

            // Wrap around slowly
            if (worm.x > 0.95) worm.dir = -1;
            if (worm.x < 0.05) worm.dir = 1;

            const baseX = Math.floor(worm.x * this.width);
            const baseY = Math.floor(layer.y + worm.y * layer.height);

            // Draw worm segments with slow wave motion
            for (let seg = 0; seg < worm.length; seg++) {
                const waveOffset = Math.sin(this.animFrame * 0.03 + seg * 0.5 + wi) * 3;  // Slower wave
                const segX = baseX + seg * 5 * worm.dir;
                const segY = baseY + waveOffset;

                // Segment color (slightly varies)
                this.ctx.fillStyle = seg === 0 ? '#e8c9a0' : (seg % 3 === 0 ? '#d4a87c' : '#c9987c');
                this.ctx.fillRect(segX, segY, 5, 5);

                // Segment ring
                if (seg % 2 === 0 && seg > 0) {
                    this.ctx.fillStyle = '#b8886c';
                    this.ctx.fillRect(segX, segY + 1, 5, 1);
                }
            }

            // Worm head (darker)
            const headX = baseX - 3 * worm.dir;
            const headWave = Math.sin(this.animFrame * 0.1 + wi) * 3;
            this.ctx.fillStyle = '#d4a87c';
            this.ctx.fillRect(headX, baseY + headWave - 1, 4, 6);
        });

        // Draw beetles
        this.creatures.beetles.forEach((beetle, bi) => {
            beetle.x += beetle.speed * beetle.dir * tempSpeedMult;

            // Change direction - more erratic in heat
            const beetleFlipChance = temperature > 35 ? 0.005 + (temperature - 35) * 0.003 : 0.005;
            if (Math.random() < beetleFlipChance) beetle.dir *= -1;
            if (beetle.x > 0.95) beetle.dir = -1;
            if (beetle.x < 0.05) beetle.dir = 1;

            const x = Math.floor(beetle.x * this.width);
            const y = Math.floor(layer.y + beetle.y * layer.height);
            const size = Math.floor(8 * beetle.size);
            const legMove = Math.floor(this.animFrame / 15 + bi) % 2;  // Slower leg movement

            // Shell
            this.ctx.fillStyle = beetle.color;
            this.ctx.fillRect(x - size/2, y - size/2, size, size * 0.8);
            this.ctx.fillRect(x - size/2 + 1, y - size/2 - 1, size - 2, size);

            // Shell line
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(x, y - size/2, 1, size * 0.8);

            // Shell shine
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillRect(x - size/2 + 2, y - size/2 + 1, 3, 2);
            this.ctx.globalAlpha = 1;

            // Head
            this.ctx.fillStyle = '#1a1a1a';
            if (beetle.dir > 0) {
                this.ctx.fillRect(x + size/2, y - 2, 4, 4);
                // Antennae
                this.ctx.fillRect(x + size/2 + 3, y - 4 - legMove, 1, 3);
                this.ctx.fillRect(x + size/2 + 4, y - 2 - legMove, 1, 3);
            } else {
                this.ctx.fillRect(x - size/2 - 4, y - 2, 4, 4);
                // Antennae
                this.ctx.fillRect(x - size/2 - 4, y - 4 - legMove, 1, 3);
                this.ctx.fillRect(x - size/2 - 5, y - 2 - legMove, 1, 3);
            }

            // Legs (3 on each side)
            this.ctx.fillStyle = '#2d1b0e';
            for (let leg = 0; leg < 3; leg++) {
                const legY = y + size/2 - 2;
                const legOffset = (leg + legMove) % 2;
                this.ctx.fillRect(x - size/2 - 2 + leg * 3, legY + legOffset, 2, 3);
                this.ctx.fillRect(x + size/2 - 4 + leg * 3, legY + (1 - legOffset), 2, 3);
            }
        });

        // Draw snails
        this.creatures.snails.forEach((snail, si) => {
            snail.x += snail.speed * snail.dir;

            if (snail.x > 0.9) snail.dir = -1;
            if (snail.x < 0.1) snail.dir = 1;

            const x = Math.floor(snail.x * this.width);
            const y = Math.floor(layer.y + snail.y * layer.height);
            const bodyStretch = Math.sin(this.animFrame * 0.015 + si) * 2;  // Slower stretch

            // Slime trail
            this.ctx.fillStyle = '#c4d4b0';
            this.ctx.globalAlpha = 0.3;
            for (let t = 0; t < 10; t++) {
                this.ctx.fillRect(x - t * 3 * snail.dir, y + 8, 3, 1);
            }
            this.ctx.globalAlpha = 1;

            // Shell
            this.ctx.fillStyle = '#d4a574';
            this.ctx.fillRect(x - 6, y - 8, 12, 12);
            this.ctx.fillRect(x - 8, y - 6, 16, 8);
            // Shell spiral
            this.ctx.fillStyle = '#c49464';
            this.ctx.fillRect(x - 3, y - 5, 6, 6);
            this.ctx.fillStyle = '#b48454';
            this.ctx.fillRect(x - 1, y - 3, 3, 3);

            // Body/foot
            this.ctx.fillStyle = '#a89070';
            if (snail.dir > 0) {
                this.ctx.fillRect(x + 6, y + 2, 8 + bodyStretch, 6);
                this.ctx.fillRect(x + 4, y + 4, 4, 4);
                // Head
                this.ctx.fillRect(x + 12 + bodyStretch, y, 5, 8);
                // Eye stalks
                this.ctx.fillStyle = '#8a7060';
                this.ctx.fillRect(x + 14 + bodyStretch, y - 4, 2, 5);
                this.ctx.fillRect(x + 16 + bodyStretch, y - 3, 2, 4);
                // Eyes
                this.ctx.fillStyle = '#1a1a1a';
                this.ctx.fillRect(x + 14 + bodyStretch, y - 5, 2, 2);
                this.ctx.fillRect(x + 16 + bodyStretch, y - 4, 2, 2);
            } else {
                this.ctx.fillRect(x - 14 - bodyStretch, y + 2, 8 + bodyStretch, 6);
                this.ctx.fillRect(x - 8, y + 4, 4, 4);
                // Head
                this.ctx.fillRect(x - 17 - bodyStretch, y, 5, 8);
                // Eye stalks
                this.ctx.fillStyle = '#8a7060';
                this.ctx.fillRect(x - 16 - bodyStretch, y - 4, 2, 5);
                this.ctx.fillRect(x - 18 - bodyStretch, y - 3, 2, 4);
                // Eyes
                this.ctx.fillStyle = '#1a1a1a';
                this.ctx.fillRect(x - 16 - bodyStretch, y - 5, 2, 2);
                this.ctx.fillRect(x - 18 - bodyStretch, y - 4, 2, 2);
            }
        });

        // Ant trail - very slow march
        this.ctx.fillStyle = '#1a1a1a';
        for (let ant = 0; ant < 8; ant++) {
            const antX = (50 + ant * 25 + this.animFrame * 0.025) % this.width;  // Ultra slow
            const antY = layer.y + layer.height - 15 + Math.sin(ant + this.animFrame * 0.008) * 2;
            const legFrame = Math.floor(this.animFrame * 0.03 + ant * 3) % 4;  // Ultra slow legs

            // Ant body (3 segments)
            this.ctx.fillRect(antX, antY, 3, 3);      // Head
            this.ctx.fillRect(antX + 3, antY, 4, 4);  // Thorax
            this.ctx.fillRect(antX + 7, antY - 1, 5, 5); // Abdomen

            // Legs
            if (legFrame < 2) {
                this.ctx.fillRect(antX + 3, antY + 4, 1, 2);
                this.ctx.fillRect(antX + 5, antY + 4, 1, 2);
            } else {
                this.ctx.fillRect(antX + 4, antY + 4, 1, 2);
                this.ctx.fillRect(antX + 6, antY + 4, 1, 2);
            }

            // Antennae
            this.ctx.fillRect(antX - 1, antY - 2, 1, 2);
            this.ctx.fillRect(antX - 2, antY - 3, 1, 2);
        }
    },

    // ============ DRAW NITROGEN MOLECULES ============
    drawNitrogen(pools) {
        this.drawN2(pools.n2);
        this.drawOrganic(pools.organic);
        this.drawNH4(pools.nh4);
        this.drawNO2(pools.no2);
        this.drawNO3(pools.no3);
        this.drawN2O(pools.n2o);
        this.drawLeached(pools.leached);
    },

    // Helper to draw a PIXEL ART molecule
    drawMolecule(x, y, size, colors, shape, label) {
        x = Math.floor(x);
        y = Math.floor(y);
        size = Math.floor(size);

        // Pixel glow (square)
        this.ctx.fillStyle = colors.glow;
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillRect(x - size - 3, y - size - 3, size * 2 + 6, size * 2 + 6);
        this.ctx.globalAlpha = 1;

        // Main body - PIXEL shapes
        this.ctx.fillStyle = colors.main;

        if (shape === 'circle') {
            // Pixelated circle
            this.ctx.fillRect(x - size + 2, y - size, size * 2 - 4, size * 2);
            this.ctx.fillRect(x - size, y - size + 2, size * 2, size * 2 - 4);
        } else if (shape === 'diamond') {
            // Pixel diamond
            for (let i = 0; i < size; i++) {
                this.ctx.fillRect(x - i, y - size + i, i * 2 + 1, 1);
                this.ctx.fillRect(x - i, y + size - i, i * 2 + 1, 1);
            }
            this.ctx.fillRect(x - size, y, size * 2 + 1, 1);
        } else if (shape === 'triangle') {
            // Pixel triangle
            for (let i = 0; i < size; i++) {
                const w = Math.floor((i / size) * size);
                this.ctx.fillRect(x - w, y - size + i * 2, w * 2 + 1, 2);
            }
        } else if (shape === 'hexagon') {
            // Pixel hexagon
            this.ctx.fillRect(x - size + 2, y - size, size * 2 - 4, size * 2);
            this.ctx.fillRect(x - size, y - size + 3, size * 2, size * 2 - 6);
            this.ctx.fillRect(x - size + 1, y - size + 1, size * 2 - 2, size * 2 - 2);
        } else if (shape === 'double') {
            // Double square (for N2) - two atoms bonded
            const atomSize = Math.floor(size * 0.6);
            // Left atom
            this.ctx.fillRect(x - size, y - atomSize, atomSize * 2, atomSize * 2);
            // Right atom
            this.ctx.fillRect(x + size - atomSize * 2, y - atomSize, atomSize * 2, atomSize * 2);
            // Triple bond (3 lines)
            this.ctx.fillStyle = colors.dark;
            this.ctx.fillRect(x - 2, y - 3, 4, 2);
            this.ctx.fillRect(x - 2, y - 1, 4, 2);
            this.ctx.fillRect(x - 2, y + 1, 4, 2);
            this.ctx.fillStyle = colors.main;
        }

        // Pixel highlight
        this.ctx.fillStyle = '#ffffff';
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillRect(x - size + 2, y - size + 2, 3, 3);
        this.ctx.globalAlpha = 1;

        // Dark edge
        this.ctx.fillStyle = colors.dark;
        this.ctx.fillRect(x + size - 3, y + size - 3, 3, 3);
    },

    drawN2(amount) {
        if (amount <= 0) return;

        const colors = this.moleculeColors.n2;
        const skyLayer = this.layers.sky;
        const count = Math.min(Math.floor(amount / 25), 10);

        for (let i = 0; i < count; i++) {
            const x = 50 + (i * (this.width - 100) / Math.max(count - 1, 1));
            const row = i % 2;
            const y = skyLayer.y + 20 + row * 30;
            const float = Math.floor(Math.sin(this.animFrame * 0.04 + i * 0.6) * 4);
            const size = 8;

            this.drawMolecule(x, y + float, size, colors, 'double', null);
        }

        // Single label
        this.ctx.fillStyle = colors.main;
        this.ctx.font = '8px "Press Start 2P"';
        this.ctx.fillText((typeof t === 'function' ? t('canvas.n2') : 'N₂'), 8, skyLayer.y + 18);
    },

    drawOrganic(amount) {
        if (amount <= 0) return;

        const groundLayer = this.layers.ground;
        const count = Math.min(Math.floor(amount / 10), 12);

        for (let i = 0; i < count; i++) {
            const x = Math.floor(40 + (i * (this.width - 80) / Math.max(count - 1, 1)));
            const y = groundLayer.y - 2;
            const frame = (this.animFrame + i * 5) % 40;

            // Pixel leaf
            if (i % 3 === 0) {
                // Brown leaf
                this.ctx.fillStyle = '#92400e';
                this.ctx.fillRect(x, y - 4, 8, 6);
                this.ctx.fillRect(x + 2, y - 6, 4, 2);
                this.ctx.fillStyle = '#78350f';
                this.ctx.fillRect(x + 3, y - 3, 2, 4);
            } else if (i % 3 === 1) {
                // Green decaying leaf
                this.ctx.fillStyle = '#6b7c3f';
                this.ctx.fillRect(x, y - 3, 6, 4);
                this.ctx.fillRect(x + 1, y - 5, 4, 2);
                this.ctx.fillStyle = '#5a6b35';
                this.ctx.fillRect(x + 2, y - 2, 2, 3);
            } else {
                // Twig/stick
                this.ctx.fillStyle = '#8b5a2b';
                this.ctx.fillRect(x, y - 2, 10, 2);
                this.ctx.fillRect(x + 6, y - 5, 2, 4);
            }
        }

        // Label
        this.ctx.fillStyle = '#aa7744';
        this.ctx.font = '7px "Press Start 2P"';
        this.ctx.fillText((typeof t === 'function' ? t('canvas.organic') : 'Organic'), 8, groundLayer.y + 10);
    },

    drawNH4(amount) {
        if (amount <= 0) return;

        const colors = this.moleculeColors.nh4;
        const layer = this.layers.topsoil;
        const count = Math.min(Math.floor(amount / 4), 16);

        for (let i = 0; i < count; i++) {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = Math.floor(60 + col * ((this.width - 120) / 4));
            const y = Math.floor(layer.y + 18 + row * 24);
            const pulse = Math.floor(Math.sin(this.animFrame * 0.1 + i * 0.4) * 2);

            this.drawMolecule(x, y, 7 + pulse, colors, 'diamond', null);
        }

        // Label
        this.ctx.fillStyle = colors.main;
        this.ctx.font = '7px "Press Start 2P"';
        this.ctx.fillText((typeof t === 'function' ? t('canvas.nh4') : 'NH₄⁺'), this.width - 50, layer.y + 18);
    },

    drawNO2(amount) {
        if (amount <= 0) return;

        const colors = this.moleculeColors.no2;
        const layer = this.layers.topsoil;
        const count = Math.min(Math.floor(amount / 3), 12);

        for (let i = 0; i < count; i++) {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const x = Math.floor(90 + col * ((this.width - 180) / 3));
            const y = Math.floor(layer.y + 35 + row * 22);
            const pulse = Math.floor(Math.sin(this.animFrame * 0.15 + i * 0.5) * 2);

            this.drawMolecule(x, y, 6 + pulse, colors, 'hexagon', null);

            // Pixel danger flash
            if (this.animFrame % 20 < 10) {
                this.ctx.fillStyle = colors.glow;
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillRect(x - 10, y - 10, 20, 20);
                this.ctx.globalAlpha = 1;
            }
        }

        // Warning label (blinking)
        if (this.animFrame % 30 < 20) {
            this.ctx.fillStyle = colors.main;
            this.ctx.font = '6px "Press Start 2P"';
            this.ctx.fillText((typeof t === 'function' ? t('canvas.no2warn') : '⚠NO₂⁻'), this.width - 55, layer.y + 45);
        }
    },

    drawNO3(amount) {
        if (amount <= 0) return;

        const colors = this.moleculeColors.no3;
        const layer = this.layers.topsoil;
        const count = Math.min(Math.floor(amount / 4), 14);

        for (let i = 0; i < count; i++) {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = Math.floor(70 + col * ((this.width - 140) / 4));
            const y = Math.floor(layer.y + layer.height * 0.55 + row * 20);
            const bounce = Math.floor(Math.abs(Math.sin(this.animFrame * 0.08 + i * 0.3)) * 3);

            this.drawMolecule(x, y - bounce, 7, colors, 'triangle', null);
        }

        // Label
        this.ctx.fillStyle = colors.main;
        this.ctx.font = '7px "Press Start 2P"';
        this.ctx.fillText((typeof t === 'function' ? t('canvas.no3') : 'NO₃⁻'), this.width - 50, layer.y + layer.height - 12);
    },

    drawN2O(amount) {
        if (amount <= 0) return;

        const colors = this.moleculeColors.n2o;
        const skyLayer = this.layers.sky;
        const count = Math.min(Math.floor(amount / 4), 8);

        for (let i = 0; i < count; i++) {
            const x = Math.floor(80 + (i * (this.width - 160) / Math.max(count - 1, 1)));
            const y = skyLayer.height - 22;
            const float = Math.floor(Math.sin(this.animFrame * 0.06 + i) * 4);

            // Pixel danger cloud
            this.ctx.fillStyle = colors.glow;
            this.ctx.globalAlpha = 0.4;
            this.ctx.fillRect(x - 14, y - 10 + float, 28, 18);
            this.ctx.globalAlpha = 1;

            // Cloud shape (pixel)
            this.ctx.fillStyle = colors.main;
            this.ctx.fillRect(x - 10, y - 4 + float, 20, 10);
            this.ctx.fillRect(x - 6, y - 8 + float, 12, 6);

            // Skull face
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(x - 4, y - 2 + float, 2, 2);
            this.ctx.fillRect(x + 2, y - 2 + float, 2, 2);
            this.ctx.fillRect(x - 2, y + 2 + float, 4, 2);
        }

        // Big warning (blinking)
        const blink = this.animFrame % 30 < 18;
        if (blink) {
            this.ctx.fillStyle = colors.main;
            this.ctx.font = '8px "Press Start 2P"';
            this.ctx.fillText((typeof t === 'function' ? t('canvas.n2oBad') : '⚠N₂O BAD!⚠'), this.width / 2 - 45, 16);
        }
    },

    drawLeached(amount) {
        if (amount <= 0) return;

        const colors = this.moleculeColors.leached;
        const layer = this.layers.water;
        const count = Math.min(Math.floor(amount / 4), 10);

        for (let i = 0; i < count; i++) {
            const x = Math.floor(50 + (i * (this.width - 100) / Math.max(count - 1, 1)));
            const y = Math.floor(layer.y + 15 + (i % 3) * 18);
            const drift = Math.floor(Math.sin(this.animFrame * 0.04 + i) * 3);

            // Pixel pollution blob
            this.ctx.fillStyle = colors.glow;
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillRect(x - 10 + drift, y - 10, 20, 20);
            this.ctx.globalAlpha = 1;

            this.ctx.fillStyle = colors.main;
            this.ctx.fillRect(x - 6 + drift, y - 6, 12, 12);
            this.ctx.fillRect(x - 4 + drift, y - 8, 8, 16);

            // Highlight
            this.ctx.fillStyle = colors.glow;
            this.ctx.fillRect(x - 4 + drift, y - 4, 3, 3);
        }

        // Warning
        this.ctx.fillStyle = colors.main;
        this.ctx.font = '7px "Press Start 2P"';
        this.ctx.fillText((typeof t === 'function' ? t('canvas.pollution') : 'POLLUTION!'), this.width - 95, layer.y + 14);
    },

    // ============ DRAW PLANTS (Multiple) ============
    drawPlant(stage, health) {
        const groundLayer = this.layers.ground;
        const y = groundLayer.y;

        // Draw multiple plants at different positions
        const plantPositions = [
            { x: this.width * 0.2, scale: 0.6, stageOffset: -1 },   // Left small plant
            { x: this.width * 0.4, scale: 0.8, stageOffset: 0 },    // Left-center plant
            { x: this.width * 0.5, scale: 1.0, stageOffset: 0 },    // Center main plant
            { x: this.width * 0.65, scale: 0.75, stageOffset: -1 }, // Right-center plant
            { x: this.width * 0.85, scale: 0.5, stageOffset: -2 }   // Right small plant
        ];

        plantPositions.forEach((plant, index) => {
            // Each plant can be at a slightly different stage
            const plantStage = Math.max(0, Math.min(4, stage + plant.stageOffset));
            this.drawSinglePlant(plant.x, y, plantStage, health, plant.scale, index);
        });
    },

    drawSinglePlant(x, y, stage, health, scale, index) {
        // Draw roots first (behind plant)
        if (stage > 0) {
            this.drawRoots(x, y, stage, scale);
        }

        const color = health > 50 ? '#22c55e' : health > 25 ? '#eab308' : '#ef4444';
        const darkColor = health > 50 ? '#166534' : health > 25 ? '#a16207' : '#b91c1c';

        // Slight sway animation
        const sway = Math.sin(this.animFrame * 0.015 + index * 1.5) * 2 * scale;

        this.ctx.save();
        this.ctx.translate(x + sway, y);

        switch(stage) {
            case 0: // Seed - visible mound with seed and tiny sprout tip
                // Soil mound
                this.ctx.fillStyle = '#5c3d2e';
                this.ctx.beginPath();
                this.ctx.ellipse(0, -2, 18 * scale, 8 * scale, 0, 0, Math.PI * 2);
                this.ctx.fill();
                // Seed body
                this.ctx.fillStyle = '#78350f';
                this.ctx.beginPath();
                this.ctx.ellipse(0, -6, 10 * scale, 7 * scale, 0.2, 0, Math.PI * 2);
                this.ctx.fill();
                // Seed highlight
                this.ctx.fillStyle = '#a0522d';
                this.ctx.beginPath();
                this.ctx.ellipse(-2 * scale, -8 * scale, 4 * scale, 3 * scale, 0, 0, Math.PI * 2);
                this.ctx.fill();
                // Tiny green sprout tip poking out
                this.ctx.fillStyle = '#4ade80';
                this.ctx.fillRect(-2 * scale, -16 * scale, 4 * scale, 8 * scale);
                this.ctx.beginPath();
                this.ctx.ellipse(0, -18 * scale, 5 * scale, 3 * scale, 0, 0, Math.PI * 2);
                this.ctx.fill();
                break;

            case 1: // Sprout
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-3 * scale, -30 * scale, 6 * scale, 30 * scale);
                this.ctx.beginPath();
                this.ctx.ellipse(-12 * scale, -25 * scale, 10 * scale, 6 * scale, -0.5, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.ellipse(12 * scale, -30 * scale, 10 * scale, 6 * scale, 0.5, 0, Math.PI * 2);
                this.ctx.fill();
                break;

            case 2: // Sapling
                this.ctx.fillStyle = darkColor;
                this.ctx.fillRect(-5 * scale, -50 * scale, 10 * scale, 50 * scale);
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(0, -60 * scale, 25 * scale, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#ffffff';
                this.ctx.globalAlpha = 0.3;
                this.ctx.beginPath();
                this.ctx.arc(-8 * scale, -68 * scale, 8 * scale, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
                break;

            case 3: // Young tree
                this.ctx.fillStyle = darkColor;
                this.ctx.fillRect(-8 * scale, -70 * scale, 16 * scale, 70 * scale);
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(0, -85 * scale, 35 * scale, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(-25 * scale, -70 * scale, 20 * scale, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(25 * scale, -70 * scale, 20 * scale, 0, Math.PI * 2);
                this.ctx.fill();
                break;

            case 4: // Full tree
                this.ctx.fillStyle = darkColor;
                this.ctx.fillRect(-12 * scale, -100 * scale, 24 * scale, 100 * scale);
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(0, -120 * scale, 50 * scale, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(-35 * scale, -95 * scale, 30 * scale, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(35 * scale, -95 * scale, 30 * scale, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(0, -150 * scale, 30 * scale, 0, Math.PI * 2);
                this.ctx.fill();

                // Highlight
                this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
                this.ctx.beginPath();
                this.ctx.arc(-15 * scale, -135 * scale, 20 * scale, 0, Math.PI * 2);
                this.ctx.fill();
                break;
        }

        this.ctx.restore();

        // Health warning glow only for center plant
        if (health < 30 && scale === 1.0) {
            this.ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
            const glowPulse = Math.sin(this.animFrame * 0.1) * 10;
            this.ctx.beginPath();
            this.ctx.arc(x, y - 50, 60 + glowPulse, 0, Math.PI * 2);
            this.ctx.fill();
        }
    },

    drawRoots(x, y, stage, scale = 1) {
        const layer = this.layers.topsoil;

        this.ctx.strokeStyle = '#78350f';
        this.ctx.lineWidth = Math.max(1, 3 * scale);

        const rootDepth = (15 + stage * 20) * scale;
        const rootSpread = (20 + stage * 15) * scale;

        // Main root
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, y + rootDepth);
        this.ctx.stroke();

        // Side roots
        for (let i = 0; i < stage + 1; i++) {
            const rootY = y + (10 + i * 15) * scale;
            const spread = (rootSpread - i * 5) * scale;
            const wiggle = Math.sin(this.animFrame * 0.02 + i) * 2 * scale;

            this.ctx.beginPath();
            this.ctx.moveTo(x, rootY);
            this.ctx.quadraticCurveTo(x - spread/2, rootY + 5 * scale + wiggle, x - spread, rootY + 10 * scale);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(x, rootY);
            this.ctx.quadraticCurveTo(x + spread/2, rootY + 5 * scale - wiggle, x + spread, rootY + 10 * scale);
            this.ctx.stroke();
        }

        // Root nodules (for Rhizobium)
        if (stage >= 1 && scale > 0.5) {
            this.ctx.fillStyle = '#fbbf24';
            for (let i = 0; i < stage; i++) {
                const nx = x + (Math.sin(i * 2.5) * 0.5) * rootSpread;
                const ny = y + (15 + i * 12) * scale;
                this.ctx.beginPath();
                this.ctx.arc(nx, ny, 4 * scale, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    },

    // ============ ENVIRONMENTAL EFFECTS ============
    drawN2OHaze(n2o) {
        if (n2o <= 15) return;

        const skyLayer = this.layers.sky;
        const intensity = Math.min((n2o - 15) / 35, 1);

        if (n2o > 30) {
            // Thick red-brown smog layer
            this.ctx.fillStyle = `rgba(139, 69, 19, ${0.15 + intensity * 0.2})`;
            this.ctx.fillRect(0, 0, this.width, skyLayer.height);
            // Additional darker band at top
            this.ctx.fillStyle = `rgba(100, 30, 10, ${0.1 + intensity * 0.15})`;
            this.ctx.fillRect(0, 0, this.width, skyLayer.height * 0.4);
        } else {
            // Reddish haze in upper sky
            this.ctx.fillStyle = `rgba(180, 60, 30, ${0.08 + intensity * 0.12})`;
            this.ctx.fillRect(0, 0, this.width, skyLayer.height * 0.6);
        }
    },

    drawEutrophicationEffects(leached) {
        if (leached <= 40) return;

        const layer = this.layers.water;
        const intensity = Math.min((leached - 40) / 60, 1);

        // Green algae tint on water
        this.ctx.fillStyle = `rgba(34, 139, 34, ${0.2 + intensity * 0.3})`;
        this.ctx.fillRect(0, layer.y, this.width, layer.height);

        // Algae patches on surface
        this.ctx.fillStyle = `rgba(0, 100, 0, ${0.4 + intensity * 0.3})`;
        for (let i = 0; i < 8; i++) {
            const ax = (i * 97 + this.animFrame * 0.1) % this.width;
            const ay = layer.y + 4 + Math.sin(this.animFrame * 0.02 + i) * 3;
            const size = 6 + intensity * 8;
            this.ctx.fillRect(ax, ay, size, 4);
            this.ctx.fillRect(ax + 2, ay - 2, size - 4, 2);
        }

        if (leached > 70) {
            // Dark green dead zone water
            this.ctx.fillStyle = 'rgba(0, 60, 0, 0.3)';
            this.ctx.fillRect(0, layer.y, this.width, layer.height);

            // Dead fish floating (belly up)
            this.ctx.fillStyle = '#cccccc';
            for (let i = 0; i < 3; i++) {
                const fx = 80 + i * (this.width / 3) + Math.sin(this.animFrame * 0.01 + i) * 5;
                const fy = layer.y + 10 + i * 8;
                // Belly-up fish
                this.ctx.fillRect(fx - 6, fy, 12, 4);
                this.ctx.fillRect(fx - 4, fy - 2, 8, 2);
                // X eye
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(fx - 4, fy + 1, 2, 2);
                this.ctx.fillStyle = '#cccccc';
            }

            // DEAD ZONE label
            if (this.animFrame % 40 < 25) {
                this.ctx.fillStyle = '#ff0000';
                this.ctx.font = '8px "Press Start 2P"';
                this.ctx.fillText((typeof t === 'function' ? t('canvas.deadZone') : 'DEAD ZONE'), this.width / 2 - 40, layer.y + layer.height / 2);
            }
        }
    },

    drawHeatEffects(temperature) {
        if (temperature <= 30) return;

        const groundLayer = this.layers.ground;

        // Heat shimmer at 50°C+
        if (temperature > 50) {
            this.ctx.fillStyle = 'rgba(255, 100, 0, 0.08)';
            for (let x = 0; x < this.width; x += 12) {
                const shimmer = Math.sin(this.animFrame * 0.1 + x * 0.05) * 3;
                this.ctx.fillRect(x, groundLayer.y - 20 + shimmer, 8, 15);
            }
        }

        // Fire particles on plants at 50°C+
        if (temperature > 50) {
            const plantX = this.width / 2;
            const plantY = groundLayer.y;
            for (let i = 0; i < 8; i++) {
                const px = plantX + (Math.random() - 0.5) * 80;
                const py = plantY - 40 - Math.random() * 60;
                const age = (this.animFrame + i * 7) % 20;
                const colors = ['#ff4400', '#ff8800', '#ffcc00', '#ff6600'];
                this.ctx.fillStyle = colors[i % 4];
                this.ctx.globalAlpha = Math.max(0, 1 - age / 20);
                this.ctx.fillRect(px, py - age * 2, 3, 3);
            }
            this.ctx.globalAlpha = 1;

            // Smoke particles
            this.ctx.fillStyle = '#555555';
            for (let i = 0; i < 5; i++) {
                const sx = plantX + (Math.random() - 0.5) * 60;
                const sy = plantY - 80 - ((this.animFrame + i * 11) % 40) * 2;
                this.ctx.globalAlpha = 0.3 - ((this.animFrame + i * 11) % 40) * 0.007;
                this.ctx.fillRect(sx, sy, 4, 4);
            }
            this.ctx.globalAlpha = 1;
        }

        // Orange/red tint on plant area at 40°C+
        if (temperature > 40) {
            const intensity = Math.min((temperature - 40) / 20, 0.3);
            this.ctx.fillStyle = `rgba(255, 80, 0, ${intensity})`;
            const plantX = this.width / 2;
            this.ctx.fillRect(plantX - 80, groundLayer.y - 160, 160, 160);
        }
    },

    // ============ MAIN RENDER ============
    render(plantStage, plantHealth, pools, temperature, dayProgress) {
        temperature = temperature || 20;
        dayProgress = dayProgress || 0;
        this.currentTemperature = temperature;
        this.dayProgress = dayProgress;

        this.clear();

        // Apply screen shake
        let shakeActive = false;
        if (this.shake.duration > 0) {
            const elapsed = Date.now() - this.shake.startTime;
            if (elapsed < this.shake.duration) {
                const decay = 1 - elapsed / this.shake.duration;
                const dx = Math.floor((Math.random() - 0.5) * this.shake.intensity * decay);
                const dy = Math.floor((Math.random() - 0.5) * this.shake.intensity * decay);
                this.ctx.save();
                this.ctx.translate(dx, dy);
                shakeActive = true;
            } else {
                this.shake.duration = 0;
            }
        }

        // Draw layers from back to front
        this.drawSky(temperature, pools.n2o, dayProgress);

        // Draw sky creatures (birds, butterflies) - affected by temperature and day/night
        this.drawSkyCreatures(temperature, dayProgress);

        this.drawGround();
        // Farm animals walk on the grass. Pass dt (seconds since last
        // frame) for smooth animation; default to ~16ms if unknown.
        this.drawFarmAnimals(window.Game ? (window.Game._lastFrameDelta || 16) / 1000 : 0.016);
        this.drawTopsoil();
        this.drawSubsoil();
        this.drawWater();

        // Draw eutrophication effects before water creatures
        this.drawEutrophicationEffects(pools.leached);

        // Draw water creatures (fish, tadpoles) - affected by eutrophication and temperature
        this.drawWaterCreatures(pools.leached, temperature);

        // Draw soil organisms (bacteria, worms, beetles, snails, ants) - affected by temperature and night
        this.drawSoilOrganisms(temperature, dayProgress);

        // Draw nitrogen molecules
        this.drawNitrogen(pools);

        // Draw plant
        this.drawPlant(plantStage, plantHealth);

        // Draw fireflies (night only)
        this.drawFireflies(dayProgress);

        // Draw heat effects on top
        this.drawHeatEffects(temperature);

        // Draw N₂O atmospheric haze
        this.drawN2OHaze(pools.n2o);

        // Draw weather effects overlay
        this.drawWeather();

        // Draw particles on top
        this.drawParticles();

        // Draw transformation animations on top
        this.drawAnimations();

        // Restore from screen shake
        if (shakeActive) {
            this.ctx.restore();
        }
    }
};

window.Renderer = Renderer;
