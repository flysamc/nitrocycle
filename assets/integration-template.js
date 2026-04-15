// =========================================
// PIXEL ART ASSET INTEGRATION TEMPLATE
// For NitroCycle - Soil Food Web Game
// =========================================

// 1. ASSET LOADER
// ===============
class AssetLoader {
  constructor() {
    this.images = {};
    this.loaded = false;
  }

  async loadAllAssets() {
    console.log('Loading pixel art assets...');

    // Load plant growth stages
    const plantStages = ['plant_stage_1', 'plant_stage_2', 'plant_stage_3', 'plant_stage_4', 'plant_stage_5'];
    for (const stage of plantStages) {
      await this.loadImage(stage, `pixel-assets/plants/${stage}.png`);
    }

    // Load soil layers
    const soilLayers = ['soil_top', 'soil_middle', 'soil_bottom'];
    for (const soil of soilLayers) {
      await this.loadImage(soil, `pixel-assets/soil/${soil}.png`);
    }

    // Load organisms
    const organisms = ['bacteria', 'fungus', 'earthworm', 'nitrogen'];
    for (const org of organisms) {
      await this.loadImage(org, `pixel-assets/organisms/${org}.png`);
    }

    // Load UI
    const ui = ['health_bar', 'add_icon', 'minus_icon'];
    for (const icon of ui) {
      await this.loadImage(icon, `pixel-assets/ui/${icon}.png`);
    }

    this.loaded = true;
    console.log('✓ All assets loaded!');
  }

  loadImage(name, path) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images[name] = img;
        console.log(`  ✓ Loaded: ${name}`);
        resolve(img);
      };
      img.onerror = () => {
        console.error(`✗ Failed to load: ${name} from ${path}`);
        reject(new Error(`Failed to load ${path}`));
      };
      img.src = path;
    });
  }

  getImage(name) {
    if (!this.images[name]) {
      console.warn(`Image not found: ${name}`);
      return null;
    }
    return this.images[name];
  }
}

// 2. VERTICAL SOIL FOOD WEB RENDERER
// ===================================
class SoilFoodWebRenderer {
  constructor(canvas, assetLoader) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.assets = assetLoader;

    // Define vertical zones
    this.zones = {
      sky: { y: 0, height: 60 },           // Plant above ground
      surface: { y: 60, height: 40 },      // Soil surface
      bacteria_zone: { y: 100, height: 60 }, // Bacteria & fungi
      decomposer: { y: 160, height: 40 },  // Active decomposition
      deep_soil: { y: 200, height: 60 }    // Deep soil organisms
    };
  }

  drawSoilProfile() {
    const { ctx } = this;

    // Sky/above ground (light blue)
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, this.zones.sky.y, this.canvas.width, this.zones.sky.height);

    // Top soil (brown)
    ctx.fillStyle = '#8B6F47';
    ctx.fillRect(0, this.zones.surface.y, this.canvas.width, this.zones.surface.height);

    // Bacteria zone (darker brown)
    ctx.fillStyle = '#6B4423';
    ctx.fillRect(0, this.zones.bacteria_zone.y, this.canvas.width, this.zones.bacteria_zone.height);

    // Decomposer zone (dark brown)
    ctx.fillStyle = '#5C3317';
    ctx.fillRect(0, this.zones.decomposer.y, this.canvas.width, this.zones.decomposer.height);

    // Deep soil (very dark)
    ctx.fillStyle = '#3D2817';
    ctx.fillRect(0, this.zones.deep_soil.y, this.canvas.width, this.zones.deep_soil.height);

    // Draw zone labels
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.fillText('Plant', 10, 85);
    ctx.fillText('Surface', 10, 145);
    ctx.fillText('Bacteria & Fungi', 10, 160);
    ctx.fillText('Decomposition', 10, 200);
    ctx.fillText('Deep Soil', 10, 240);
  }

  drawPlant(plantStage, x, y) {
    const img = this.assets.getImage(`plant_stage_${plantStage}`);
    if (img) {
      this.ctx.drawImage(img, x - 16, y - 16, 32, 32);
    }
  }

  drawOrganism(type, x, y, size = 16) {
    const img = this.assets.getImage(type);
    if (img) {
      this.ctx.drawImage(img, x - size/2, y - size/2, size, size);
    }
  }

  drawHealthBar(x, y, health, maxHealth) {
    const img = this.assets.getImage('health_bar');
    if (img) {
      this.ctx.drawImage(img, x - 16, y - 4, 32, 8);

      // Draw health fill
      const healthPercent = health / maxHealth;
      this.ctx.fillStyle = healthPercent > 0.5 ? '#90EE90' : '#FF6B6B';
      this.ctx.fillRect(x - 16, y - 4, 32 * healthPercent, 8);
    }
  }

  drawNitrogenCycle(ammonium, nitrate, organicN) {
    const { ctx } = this;
    const centerX = this.canvas.width / 2;

    // Draw arrows showing nitrogen transformations
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;

    // Ammonium -> Nitrate
    ctx.beginPath();
    ctx.moveTo(centerX - 60, 140);
    ctx.lineTo(centerX - 60, 160);
    ctx.stroke();

    // Organic N -> Ammonium
    ctx.beginPath();
    ctx.moveTo(centerX - 30, 180);
    ctx.lineTo(centerX - 30, 150);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.fillText(`Ammonium: ${ammonium}`, 10, 120);
    ctx.fillText(`Nitrate: ${nitrate}`, 10, 135);
    ctx.fillText(`Organic N: ${organicN}`, 10, 150);
  }
}

// 3. USAGE EXAMPLE
// ================
/*
// Initialize in your main game file:

const canvas = document.getElementById('gameCanvas');
const assetLoader = new AssetLoader();

// Load assets before game starts
assetLoader.loadAllAssets().then(() => {
  const renderer = new SoilFoodWebRenderer(canvas, assetLoader);

  // In your game loop:
  function gameLoop() {
    // Clear canvas
    canvas.fillStyle = '#FFFFFF';
    canvas.fillRect(0, 0, canvas.width, canvas.height);

    // Draw soil profile
    renderer.drawSoilProfile();

    // Draw plant
    renderer.drawPlant(currentPlantStage, canvas.width / 2, 90);
    renderer.drawHealthBar(canvas.width / 2, 110, plantHealth, maxHealth);

    // Draw organisms
    renderer.drawOrganism('bacteria', 100, 130, 12);
    renderer.drawOrganism('bacteria', 150, 140, 12);
    renderer.drawOrganism('fungus', 200, 150, 14);
    renderer.drawOrganism('earthworm', 250, 160, 16);

    // Draw nitrogen cycle
    renderer.drawNitrogenCycle(ammonium, nitrate, organicN);

    requestAnimationFrame(gameLoop);
  }

  gameLoop();
});
*/

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AssetLoader, SoilFoodWebRenderer };
}
