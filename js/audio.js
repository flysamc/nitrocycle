/**
 * Retro Audio System - 8-bit Chiptune Sounds
 * Uses Web Audio API to generate authentic retro sounds
 */

const Audio = {
    ctx: null,
    enabled: true,
    musicEnabled: true,
    volume: 0.3,
    musicVolume: 0.15,

    // Music state
    musicInterval: null,
    currentNote: 0,

    init() {
        // Create audio context on first user interaction
        document.addEventListener('click', () => this.ensureContext(), { once: true });
        document.addEventListener('keydown', () => this.ensureContext(), { once: true });
        return true;
    },

    ensureContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context created');
        }
        return this.ctx;
    },

    // ============ SOUND GENERATION ============

    // Play a simple tone
    playTone(frequency, duration, type = 'square', volumeMod = 1) {
        if (!this.enabled || !this.ctx) return;

        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        // Envelope
        const vol = this.volume * volumeMod;
        gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        oscillator.start(this.ctx.currentTime);
        oscillator.stop(this.ctx.currentTime + duration);
    },

    // Play a sequence of notes
    playSequence(notes, tempo = 0.1) {
        if (!this.enabled || !this.ctx) return;

        notes.forEach((note, i) => {
            setTimeout(() => {
                if (note > 0) {
                    this.playTone(note, tempo * 0.9, 'square', 0.8);
                }
            }, i * tempo * 1000);
        });
    },

    // Play noise (for percussion)
    playNoise(duration, volumeMod = 1) {
        if (!this.enabled || !this.ctx) return;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        const gainNode = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        noise.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.value = 1000;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        const vol = this.volume * volumeMod * 0.3;
        gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.start();
        noise.stop(this.ctx.currentTime + duration);
    },

    // ============ SOUND EFFECTS ============

    // UI click sound
    click() {
        this.playTone(800, 0.05, 'square', 0.5);
    },

    // ============ FARM ANIMAL SOUNDS ============
    // Kept quiet (volumeMod ~0.25) since they fire in the background on a
    // timer — we don't want them to dominate the ambient audio.

    // Cow: low descending "moo" (~0.7s)
    moo() {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.5);
        const vol = this.volume * 0.22;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(vol, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
    },

    // Sheep: mid-frequency wavery "baa" (~0.4s)
    baa() {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.35);
        // Vibrato
        lfo.frequency.setValueAtTime(18, now);
        lfoGain.gain.setValueAtTime(12, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        const vol = this.volume * 0.2;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(vol, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now); lfo.start(now);
        osc.stop(now + 0.4); lfo.stop(now + 0.4);
    },

    // Chicken: short sharp "cluck" (~0.1s)
    cluck() {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.08);
        const vol = this.volume * 0.18;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(vol, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
    },

    // Wrapper called by the renderer — dispatches by animal type
    farmCall(type) {
        if (type === 'cow') this.moo();
        else if (type === 'sheep') this.baa();
        else if (type === 'chicken') this.cluck();
    },

    // Very soft "plop" for manure dropping — subtle so it doesn't overwhelm
    farmPoop() {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        const vol = this.volume * 0.12;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(vol, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    },

    // Button hover
    hover() {
        this.playTone(400, 0.03, 'square', 0.3);
    },

    // Nitrogen fixation - magical transformation sound
    fix() {
        this.playTone(220, 0.1, 'sine', 0.4);
        this.playSequence([330, 392, 494, 587, 698], 0.06);
        setTimeout(() => this.playTone(880, 0.3, 'triangle', 0.3), 300);
    },

    // Decomposition - crunchy breaking sound with squelch
    decompose() {
        this.playNoise(0.15, 0.8);
        setTimeout(() => this.playTone(100, 0.2, 'sawtooth', 0.5), 30);
        setTimeout(() => this.playTone(80, 0.15, 'sawtooth', 0.4), 100);
        setTimeout(() => this.playTone(150, 0.1, 'square', 0.3), 180);
    },

    // Nitrification step 1 - bubbling chemical sound
    nitrify() {
        this.playTone(300, 0.08, 'square', 0.4);
        this.playSequence([350, 400, 450, 400, 350], 0.05);
        setTimeout(() => this.playNoise(0.05, 0.3), 200);
    },

    // Feed plant - happy growing sound with sparkle
    feed() {
        this.playSequence([392, 440, 494, 523, 587, 659], 0.05);
        setTimeout(() => {
            this.playTone(784, 0.2, 'triangle', 0.3);
            this.playTone(1047, 0.15, 'sine', 0.2);
        }, 300);
    },

    // Plant grew! - triumphant celebratory fanfare
    grow() {
        // Main melody - triumphant rising scale
        this.playSequence([262, 330, 392, 523], 0.15);

        // Harmony layer
        setTimeout(() => {
            this.playTone(523, 0.4, 'triangle', 0.3);
            this.playTone(659, 0.4, 'triangle', 0.2);
        }, 600);

        // Victory flourish
        setTimeout(() => {
            this.playSequence([784, 880, 1047], 0.12);
        }, 900);

        // Final chord
        setTimeout(() => {
            this.playTone(523, 0.6, 'triangle', 0.25);
            this.playTone(659, 0.6, 'triangle', 0.2);
            this.playTone(784, 0.6, 'triangle', 0.15);
        }, 1200);

        // Sparkle sounds
        setTimeout(() => {
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    this.playTone(1200 + i * 200, 0.08, 'sine', 0.15);
                }, i * 80);
            }
        }, 1500);
    },

    // End turn - whoosh/transition
    endTurn() {
        this.playTone(200, 0.1, 'sine', 0.4);
        setTimeout(() => this.playTone(250, 0.1, 'sine', 0.3), 50);
        setTimeout(() => this.playTone(300, 0.15, 'sine', 0.2), 100);
    },

    // Error/warning sound
    error() {
        this.playTone(200, 0.15, 'square', 0.6);
        setTimeout(() => this.playTone(150, 0.2, 'square', 0.5), 100);
    },

    // Event happened
    event() {
        this.playTone(440, 0.1, 'square', 0.5);
        this.playTone(554, 0.1, 'square', 0.5);
    },

    // Good event
    goodEvent() {
        this.playSequence([523, 659, 784], 0.08);
    },

    // Bad event
    badEvent() {
        this.playSequence([294, 262, 220], 0.12);
    },

    // Rain sound
    rain() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.playNoise(0.05, 0.5), i * 60);
        }
    },

    // Lightning
    lightning() {
        this.playNoise(0.3, 1);
        setTimeout(() => this.playTone(100, 0.4, 'sawtooth', 0.8), 100);
    },

    // Win fanfare
    win() {
        const melody = [523, 523, 523, 659, 784, 0, 659, 784, 1047];
        this.playSequence(melody, 0.15);

        // Add harmony
        setTimeout(() => {
            this.playTone(523, 0.8, 'triangle', 0.3);
        }, melody.length * 150);
    },

    // Lose sound
    lose() {
        this.playSequence([392, 370, 349, 330, 294, 262, 247, 220], 0.2);
    },

    // ============ BACKGROUND MUSIC ============

    // Drought sound - dry crackling
    drought() {
        for (let i = 0; i < 4; i++) {
            setTimeout(() => this.playNoise(0.03, 0.3), i * 80);
        }
        this.playTone(180, 0.3, 'sawtooth', 0.4);
    },

    // Pest attack - buzzing scratch
    pestAttack() {
        for (let i = 0; i < 6; i++) {
            setTimeout(() => this.playTone(200 + Math.random() * 300, 0.04, 'square', 0.5), i * 40);
        }
    },

    // Achievement unlocked - triumphant arpeggio
    achievement() {
        this.playSequence([523, 659, 784, 1047, 1319], 0.1);
    },

    // Expanded chiptune melody - 5 phrases
    musicNotes: [
        // Phrase 1 - Main theme (gentle opener)
        { note: 262, dur: 0.2 },  // C4
        { note: 294, dur: 0.2 },  // D4
        { note: 330, dur: 0.4 },  // E4
        { note: 294, dur: 0.2 },  // D4
        { note: 262, dur: 0.2 },  // C4
        { note: 247, dur: 0.4 },  // B3
        { note: 262, dur: 0.4 },  // C4
        { note: 0, dur: 0.4 },    // Rest

        // Phrase 2 - Rising
        { note: 330, dur: 0.2 },  // E4
        { note: 349, dur: 0.2 },  // F4
        { note: 392, dur: 0.4 },  // G4
        { note: 349, dur: 0.2 },  // F4
        { note: 330, dur: 0.2 },  // E4
        { note: 294, dur: 0.4 },  // D4
        { note: 262, dur: 0.4 },  // C4
        { note: 0, dur: 0.4 },    // Rest

        // Phrase 3 - Climber
        { note: 392, dur: 0.3 },  // G4
        { note: 440, dur: 0.3 },  // A4
        { note: 392, dur: 0.2 },  // G4
        { note: 349, dur: 0.2 },  // F4
        { note: 330, dur: 0.4 },  // E4
        { note: 294, dur: 0.2 },  // D4
        { note: 262, dur: 0.6 },  // C4
        { note: 0, dur: 0.4 },    // Rest

        // Phrase 4 - Descending minor (tension)
        { note: 440, dur: 0.2 },  // A4
        { note: 392, dur: 0.2 },  // G4
        { note: 370, dur: 0.3 },  // F#4
        { note: 330, dur: 0.2 },  // E4
        { note: 294, dur: 0.2 },  // D4
        { note: 262, dur: 0.3 },  // C4
        { note: 247, dur: 0.2 },  // B3
        { note: 262, dur: 0.4 },  // C4
        { note: 0, dur: 0.4 },    // Rest

        // Phrase 5 - Resolution/hope
        { note: 330, dur: 0.15 }, // E4
        { note: 392, dur: 0.15 }, // G4
        { note: 523, dur: 0.4 },  // C5
        { note: 494, dur: 0.2 },  // B4
        { note: 440, dur: 0.2 },  // A4
        { note: 392, dur: 0.3 },  // G4
        { note: 330, dur: 0.2 },  // E4
        { note: 262, dur: 0.6 },  // C4
        { note: 0, dur: 0.6 },    // Rest
    ],

    bassNotes: [
        { note: 131, dur: 0.8 },  // C3
        { note: 131, dur: 0.8 },
        { note: 147, dur: 0.8 },  // D3
        { note: 131, dur: 0.8 },  // C3
        { note: 165, dur: 0.8 },  // E3
        { note: 147, dur: 0.8 },  // D3
        { note: 131, dur: 0.8 },  // C3
        { note: 98, dur: 0.8 },   // G2
        { note: 110, dur: 0.8 },  // A2
        { note: 131, dur: 0.8 },  // C3
        { note: 147, dur: 0.8 },  // D3
        { note: 110, dur: 0.8 },  // A2
    ],

    // Arpeggio patterns (play between melody beats)
    arpeggioPatterns: [
        [262, 330, 392],   // C major
        [262, 330, 392],   // C major
        [294, 349, 440],   // D minor
        [262, 330, 392],   // C major
        [330, 392, 494],   // E minor
        [294, 349, 440],   // D minor
        [262, 330, 392],   // C major
        [196, 247, 294],   // G major
        [220, 262, 330],   // A minor
        [262, 330, 392],   // C major
        [294, 349, 440],   // D minor
        [220, 262, 330],   // A minor
    ],

    // Percussion patterns (kick=1, hihat=2, snare=3, 0=rest)
    percPattern: [1, 2, 0, 2, 3, 2, 0, 2, 1, 2, 0, 2, 3, 2, 1, 2],

    // ---- Track 2: Chill ambient (A minor pentatonic, slower) ----
    musicNotes2: [
        // Phrase 1 – Floating
        { note: 220, dur: 0.4 },  // A3
        { note: 262, dur: 0.3 },  // C4
        { note: 294, dur: 0.5 },  // D4
        { note: 262, dur: 0.3 },  // C4
        { note: 220, dur: 0.6 },  // A3
        { note: 0, dur: 0.4 },
        // Phrase 2 – Drift
        { note: 330, dur: 0.4 },  // E4
        { note: 294, dur: 0.3 },  // D4
        { note: 262, dur: 0.5 },  // C4
        { note: 220, dur: 0.4 },  // A3
        { note: 196, dur: 0.6 },  // G3
        { note: 0, dur: 0.5 },
        // Phrase 3 – Rise
        { note: 262, dur: 0.3 },  // C4
        { note: 330, dur: 0.3 },  // E4
        { note: 392, dur: 0.5 },  // G4
        { note: 330, dur: 0.4 },  // E4
        { note: 262, dur: 0.5 },  // C4
        { note: 0, dur: 0.5 },
        // Phrase 4 – Resolve
        { note: 294, dur: 0.3 },  // D4
        { note: 262, dur: 0.3 },  // C4
        { note: 220, dur: 0.5 },  // A3
        { note: 196, dur: 0.4 },  // G3
        { note: 220, dur: 0.8 },  // A3
        { note: 0, dur: 0.6 },
    ],
    bassNotes2: [
        { note: 110, dur: 1.0 },  // A2
        { note: 110, dur: 1.0 },
        { note: 131, dur: 1.0 },  // C3
        { note: 110, dur: 1.0 },
        { note: 98, dur: 1.0 },   // G2
        { note: 110, dur: 1.0 },
        { note: 131, dur: 1.0 },  // C3
        { note: 98, dur: 1.0 },   // G2
    ],
    arpeggioPatterns2: [
        [220, 262, 330],   // A minor
        [220, 262, 330],
        [262, 330, 392],   // C major
        [220, 262, 330],
        [196, 247, 294],   // G major
        [220, 262, 330],
        [262, 330, 392],   // C major
        [196, 247, 294],   // G major
    ],
    // Lighter percussion for chill track
    percPattern2: [1, 0, 2, 0, 0, 2, 0, 0, 1, 0, 2, 0, 0, 2, 0, 0],

    // Track selection: 0 = track 1 (upbeat), 1 = track 2 (chill)
    currentTrack: 0,

    // Tension tracking for music intensity
    musicTension: 0,  // 0-1, set by game state

    startMusic() {
        if (!this.musicEnabled || this.musicInterval) return;
        this.ensureContext();

        // Select track data
        const isChill = this.currentTrack === 1;
        const melody  = isChill ? this.musicNotes2 : this.musicNotes;
        const bass    = isChill ? this.bassNotes2 : this.bassNotes;
        const arps    = isChill ? this.arpeggioPatterns2 : this.arpeggioPatterns;
        const percs   = isChill ? this.percPattern2 : this.percPattern;
        const tempo   = isChill ? 250 : 200;
        const melodyWave = isChill ? 'sine' : 'square';
        const percVol = isChill ? 0.5 : 1.0;

        this.currentNote = 0;
        let bassNote = 0;
        let beatCount = 0;
        let arpNote = 0;
        let percBeat = 0;

        this.musicInterval = setInterval(() => {
            if (!this.musicEnabled || !this.ctx) {
                this.stopMusic();
                return;
            }

            // Play melody note
            const melodyNote = melody[this.currentNote];
            if (melodyNote.note > 0) {
                this.playMusicNote(melodyNote.note, melodyNote.dur * 0.9, melodyWave);
            }

            // Play bass on every 4th beat
            if (beatCount % 4 === 0) {
                const b = bass[bassNote % bass.length];
                this.playMusicNote(b.note, 0.3, 'triangle', 0.7);
                bassNote++;
            }

            // Arpeggio on every 2nd beat (subtle sparkle)
            if (beatCount % 2 === 1) {
                const arpChord = arps[arpNote % arps.length];
                const arpIdx = beatCount % 3;
                if (arpChord[arpIdx]) {
                    this.playMusicNote(arpChord[arpIdx] * 2, 0.1, 'sine', 0.3);
                }
                if (beatCount % 8 === 1) arpNote++;
            }

            // Percussion
            const perc = percs[percBeat % percs.length];
            if (perc === 1) {
                this.playMusicNote(60, 0.08, 'sine', 0.5 * percVol);
            } else if (perc === 2) {
                this.playPercHit(0.03, 0.2 * percVol);
            } else if (perc === 3) {
                this.playPercHit(0.06, 0.35 * percVol);
                this.playMusicNote(180, 0.04, 'square', 0.2 * percVol);
            }
            percBeat++;

            // Tension layer: when danger is high, add dissonant undertone
            if (this.musicTension > 0.3 && beatCount % 8 === 0) {
                const tensionFreq = 165 + this.musicTension * 50;
                this.playMusicNote(tensionFreq, 0.6, 'sawtooth', 0.15 * this.musicTension);
                if (this.musicTension > 0.6) {
                    this.playMusicNote(tensionFreq * 1.414, 0.4, 'sawtooth', 0.1 * this.musicTension);
                }
            }

            beatCount++;
            this.currentNote = (this.currentNote + 1) % melody.length;

        }, tempo);
    },

    // Percussion noise hit
    playPercHit(duration, volume) {
        if (!this.ctx) return;
        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(3000, this.ctx.currentTime);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(this.musicVolume * volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        noise.start();
        noise.stop(this.ctx.currentTime + duration);
    },

    playMusicNote(frequency, duration, type, volumeMod = 1) {
        if (!this.ctx) return;

        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        const vol = this.musicVolume * volumeMod;
        gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        oscillator.start(this.ctx.currentTime);
        oscillator.stop(this.ctx.currentTime + duration);
    },

    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    },

    setMusicTension(level) {
        this.musicTension = Math.max(0, Math.min(1, level));
    },

    // Cycle: Off → Track 1 (upbeat) → Track 2 (chill) → Off
    toggleMusic() {
        if (!this.musicEnabled) {
            // Off → Track 1
            this.musicEnabled = true;
            this.currentTrack = 0;
            this.startMusic();
        } else if (this.currentTrack === 0) {
            // Track 1 → Track 2
            this.stopMusic();
            this.currentTrack = 1;
            this.startMusic();
        } else {
            // Track 2 → Off
            this.musicEnabled = false;
            this.stopMusic();
            this.currentTrack = 0;
        }
        return this.musicEnabled;
    },

    toggleSound() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopAtmoDread();
            this.stopWaterDread();
        }
        return this.enabled;
    },

    // ============ DREAD DRONE LOOPS ============

    atmoDroneNodes: null,
    atmoDreadLevel: 0,  // 0=off, 1=warning, 2=critical
    waterDroneNodes: null,
    waterDreadLevel: 0,

    // Atmosphere dread with intensity: level 1=warning (quiet), level 2=critical (loud + extra osc)
    startAtmoDread(level) {
        if (!this.enabled) return;
        // If already playing at same or higher level, skip
        if (this.atmoDroneNodes && this.atmoDreadLevel >= level) return;
        // Stop existing before upgrading
        if (this.atmoDroneNodes) this._killAtmoImmediate();
        this.ensureContext();
        if (!this.ctx) return;

        this.atmoDreadLevel = level;
        const vol = level >= 2 ? 0.18 : 0.06;
        const lfoSpeed = level >= 2 ? 1.2 : 0.4;
        const lfoDepth = level >= 2 ? 0.09 : 0.03;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(vol, this.ctx.currentTime + 1.5);
        gain.connect(this.ctx.destination);

        // LFO for pulsing
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(lfoSpeed, this.ctx.currentTime);
        lfoGain.gain.setValueAtTime(lfoDepth, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();

        // Oscillator 1: 55Hz sawtooth
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(55, this.ctx.currentTime);
        osc1.connect(gain);
        osc1.start();

        // Oscillator 2: 77.78Hz sawtooth (tritone)
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(77.78, this.ctx.currentTime);
        osc2.connect(gain);
        osc2.start();

        const nodes = { osc1, osc2, lfo, gain, extras: [] };

        // Critical: add a screaming high oscillator + sub rumble
        if (level >= 2) {
            const osc3 = this.ctx.createOscillator();
            osc3.type = 'square';
            osc3.frequency.setValueAtTime(110, this.ctx.currentTime);
            const osc3Gain = this.ctx.createGain();
            osc3Gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
            osc3.connect(osc3Gain);
            osc3Gain.connect(this.ctx.destination);
            osc3.start();
            nodes.extras.push(osc3);

            // Sub rumble
            const sub = this.ctx.createOscillator();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(30, this.ctx.currentTime);
            const subGain = this.ctx.createGain();
            subGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            sub.connect(subGain);
            subGain.connect(this.ctx.destination);
            sub.start();
            nodes.extras.push(sub);
        }

        this.atmoDroneNodes = nodes;
    },

    _killAtmoImmediate() {
        if (!this.atmoDroneNodes) return;
        const nodes = this.atmoDroneNodes;
        this.atmoDroneNodes = null;
        this.atmoDreadLevel = 0;
        try {
            nodes.osc1.stop();
            nodes.osc2.stop();
            nodes.lfo.stop();
            nodes.extras.forEach(n => { try { n.stop(); } catch(e) {} });
        } catch(e) {}
    },

    stopAtmoDread() {
        if (!this.atmoDroneNodes) return;
        const nodes = this.atmoDroneNodes;
        this.atmoDroneNodes = null;
        this.atmoDreadLevel = 0;

        if (this.ctx) {
            nodes.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
            setTimeout(() => {
                try {
                    nodes.osc1.stop();
                    nodes.osc2.stop();
                    nodes.lfo.stop();
                    nodes.extras.forEach(n => { try { n.stop(); } catch(e) {} });
                } catch(e) {}
            }, 1100);
        }
    },

    // Water dread with intensity: level 1=warning (quiet gurgle), level 2=critical (loud + alarm)
    startWaterDread(level) {
        if (!this.enabled) return;
        if (this.waterDroneNodes && this.waterDreadLevel >= level) return;
        if (this.waterDroneNodes) this._killWaterImmediate();
        this.ensureContext();
        if (!this.ctx) return;

        this.waterDreadLevel = level;
        const vol = level >= 2 ? 0.16 : 0.05;
        const lfoSpeed = level >= 2 ? 0.8 : 0.2;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(vol, this.ctx.currentTime + 1.5);
        gain.connect(this.ctx.destination);

        // Sine drone at 40Hz
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(40, this.ctx.currentTime);
        osc.connect(gain);
        osc.start();

        // Noise through lowpass filter
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(level >= 2 ? 350 : 150, this.ctx.currentTime);

        // LFO warble on filter cutoff
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(lfoSpeed, this.ctx.currentTime);
        lfoGain.gain.setValueAtTime(level >= 2 ? 150 : 60, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        noise.connect(filter);
        filter.connect(gain);
        noise.start();

        const nodes = { osc, noise, lfo, filter, gain, extras: [] };

        // Critical: add pulsing alarm tone
        if (level >= 2) {
            const alarm = this.ctx.createOscillator();
            alarm.type = 'square';
            alarm.frequency.setValueAtTime(220, this.ctx.currentTime);
            const alarmGain = this.ctx.createGain();
            alarmGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
            // Pulse the alarm
            const alarmLfo = this.ctx.createOscillator();
            alarmLfo.type = 'square';
            alarmLfo.frequency.setValueAtTime(2, this.ctx.currentTime);
            const alarmLfoGain = this.ctx.createGain();
            alarmLfoGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
            alarmLfo.connect(alarmLfoGain);
            alarmLfoGain.connect(alarmGain.gain);
            alarmLfo.start();
            alarm.connect(alarmGain);
            alarmGain.connect(this.ctx.destination);
            alarm.start();
            nodes.extras.push(alarm, alarmLfo);
        }

        this.waterDroneNodes = nodes;
    },

    _killWaterImmediate() {
        if (!this.waterDroneNodes) return;
        const nodes = this.waterDroneNodes;
        this.waterDroneNodes = null;
        this.waterDreadLevel = 0;
        try {
            nodes.osc.stop();
            nodes.noise.stop();
            nodes.lfo.stop();
            nodes.extras.forEach(n => { try { n.stop(); } catch(e) {} });
        } catch(e) {}
    },

    stopWaterDread() {
        if (!this.waterDroneNodes) return;
        const nodes = this.waterDroneNodes;
        this.waterDroneNodes = null;
        this.waterDreadLevel = 0;

        if (this.ctx) {
            nodes.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
            setTimeout(() => {
                try {
                    nodes.osc.stop();
                    nodes.noise.stop();
                    nodes.lfo.stop();
                    nodes.extras.forEach(n => { try { n.stop(); } catch(e) {} });
                } catch(e) {}
            }, 1100);
        }
    },

    stopAllDread() {
        this.stopAtmoDread();
        this.stopWaterDread();
    }
};

window.Audio = Audio;
