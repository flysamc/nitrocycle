/**
 * Asset Loader for Retro Pixel Art Version
 */

const Assets = {
    images: {},
    loaded: 0,
    total: 0,

    // Asset manifest
    manifest: {
        // Plants
        plant_1: 'assets/plants/plant_stage_1.png',
        plant_2: 'assets/plants/plant_stage_2.png',
        plant_3: 'assets/plants/plant_stage_3.png',
        plant_4: 'assets/plants/plant_stage_4.png',
        plant_5: 'assets/plants/plant_stage_5.png',

        // Soil
        soil_top: 'assets/soil/soil_top.png',
        soil_mid: 'assets/soil/soil_middle.png',
        soil_bottom: 'assets/soil/soil_bottom.png',

        // Organisms
        bacteria: 'assets/organisms/bacteria.png',
        earthworm: 'assets/organisms/earthworm.png',
        fungus: 'assets/organisms/fungus.png',
        nitrogen: 'assets/organisms/nitrogen.png',
        roots: 'assets/organisms/root_system.png',

        // Environment
        compost: 'assets/environment/compost.png',
        rock: 'assets/environment/rock.png',
        leaf: 'assets/environment/leaf_litter.png'
    },

    async loadAll() {
        const loadingBar = document.getElementById('loading-bar');
        const loadingText = document.getElementById('loading-text');

        this.total = Object.keys(this.manifest).length;
        const promises = [];

        for (const [key, path] of Object.entries(this.manifest)) {
            promises.push(this.loadImage(key, path, loadingBar, loadingText));
        }

        try {
            await Promise.all(promises);
            console.log('All assets loaded!');
            return true;
        } catch (error) {
            console.error('Failed to load assets:', error);
            return false;
        }
    },

    loadImage(key, path, loadingBar, loadingText) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[key] = img;
                this.loaded++;

                // Update loading bar
                const percent = (this.loaded / this.total) * 100;
                if (loadingBar) loadingBar.style.width = percent + '%';
                if (loadingText) loadingText.textContent = `Loading: ${key}...`;

                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load: ${path}`);
                this.loaded++;
                resolve(null); // Don't reject, continue loading
            };
            img.src = path;
        });
    },

    get(key) {
        return this.images[key] || null;
    }
};

window.Assets = Assets;
