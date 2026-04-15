# 🎮 Integration Guide - Pixel Art Assets

## Quick Start (5 minutes)

### Step 1: Verify File Structure
```
your-game/
├── index.html
├── js/
│   ├── game.js
│   ├── renderer.js
│   ├── plant.js
│   ├── nitrogen.js
│   └── ... (other files)
├── css/
│   └── style.css
└── pixel-assets/          ← Copy our pixel-assets folder here
    ├── plants/
    ├── soil/
    ├── organisms/
    ├── environment/
    ├── ui/
    └── preview.html       ← Open in browser to see all assets!
```

### Step 2: Update renderer.js

Replace emoji drawing code:

**OLD CODE (emoji):**
```javascript
// In renderer.js
drawPlant(x, y) {
    context.font = "24px Arial";
    context.fillText("🌱", x, y);
}
```

**NEW CODE (pixel art):**
```javascript
class AssetManager {
    constructor() {
        this.images = {};
    }

    loadAssets() {
        // Load plant stages
        for (let i = 1; i <= 5; i++) {
            const img = new Image();
            img.src = `pixel-assets/plants/plant_stage_${i}.png`;
            this.images[`plant_${i}`] = img;
        }

        // Load soil
        const soilTypes = ['top', 'middle', 'bottom'];
        soilTypes.forEach(type => {
            const img = new Image();
            img.src = `pixel-assets/soil/soil_${type}.png`;
            this.images[`soil_${type}`] = img;
        });

        // Load organisms
        const organisms = ['bacteria', 'fungus', 'earthworm', 'nitrogen'];
        organisms.forEach(org => {
            const img = new Image();
            img.src = `pixel-assets/organisms/${org}.png`;
            this.images[org] = img;
        });

        // Load UI
        const ui = ['health_bar_full', 'health_bar_low', 'add_nitrogen', 'remove_nitrogen', 'nitrogen_indicator'];
        ui.forEach(icon => {
            const img = new Image();
            img.src = `pixel-assets/ui/${icon}.png`;
            this.images[icon] = img;
        });

        console.log('✓ All assets loaded!');
    }

    getImage(name) {
        return this.images[name] || null;
    }
}

// In your renderer initialization:
const assetManager = new AssetManager();
assetManager.loadAssets();

// Drawing function:
function drawPlant(ctx, x, y, stage) {
    const img = assetManager.getImage(`plant_${stage}`);
    if (img && img.complete) {
        // Draw at larger size (64x64)
        ctx.drawImage(img, x - 32, y - 32, 64, 64);
    }
}
```

### Step 3: Create Vertical Layout

**HTML Canvas Setup:**
```html
<canvas id="gameCanvas" width="800" height="1000"></canvas>
```

**Vertical Zones:**
```javascript
const ZONES = {
    sky: { y: 0, height: 100 },           // Above ground
    surface: { y: 100, height: 80 },       // Surface
    bacteria_zone: { y: 180, height: 150 }, // Bacteria & fungi
    fauna: { y: 330, height: 100 },        // Earthworms
    deep_soil: { y: 430, height: 200 },    // Deep soil
    bedrock: { y: 630, height: 370 }       // Bottom
};

function drawGameScene(ctx) {
    // Background for each zone
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, ZONES.sky.y, canvas.width, ZONES.sky.height);
    
    ctx.fillStyle = '#A0826D';
    ctx.fillRect(0, ZONES.surface.y, canvas.width, ZONES.surface.height);
    
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, ZONES.bacteria_zone.y, canvas.width, ZONES.bacteria_zone.height);
    
    // Draw soil layer images
    drawSoilLayers(ctx);
    
    // Draw plant at top
    drawPlant(ctx, 400, 50, currentPlantStage);
    
    // Draw organisms
    drawOrganisms(ctx);
    
    // Draw health bar
    drawHealthBar(ctx, 400, 90, plantHealth, maxHealth);
}

function drawSoilLayers(ctx) {
    // Top soil
    const soilTop = assetManager.getImage('soil_top');
    for (let x = 0; x < canvas.width; x += 64) {
        ctx.drawImage(soilTop, x, ZONES.surface.y, 64, 32);
    }

    // Middle soil
    const soilMid = assetManager.getImage('soil_middle');
    for (let x = 0; x < canvas.width; x += 64) {
        for (let i = 0; i < 3; i++) {
            ctx.drawImage(soilMid, x, ZONES.bacteria_zone.y + i * 32, 64, 32);
        }
    }

    // Deep soil
    const soilDeep = assetManager.getImage('soil_bottom');
    for (let x = 0; x < canvas.width; x += 64) {
        for (let i = 0; i < 5; i++) {
            ctx.drawImage(soilDeep, x, ZONES.deep_soil.y + i * 32, 64, 32);
        }
    }
}

function drawOrganisms(ctx) {
    // Bacteria
    const bacteria = assetManager.getImage('bacteria');
    drawOrganism(ctx, bacteria, 150, ZONES.bacteria_zone.y + 50);
    drawOrganism(ctx, bacteria, 650, ZONES.bacteria_zone.y + 80);

    // Fungus
    const fungus = assetManager.getImage('fungus');
    drawOrganism(ctx, fungus, 400, ZONES.bacteria_zone.y + 100);

    // Earthworm
    const worm = assetManager.getImage('earthworm');
    drawOrganism(ctx, worm, 300, ZONES.fauna.y + 50);
    drawOrganism(ctx, worm, 550, ZONES.fauna.y + 50);

    // Nitrogen particles
    const nitrogen = assetManager.getImage('nitrogen');
    displayNitrogenParticles(ctx, nitrogen);
}

function drawOrganism(ctx, img, x, y) {
    if (img && img.complete) {
        ctx.drawImage(img, x - 16, y - 16, 32, 32);
    }
}

function drawHealthBar(ctx, x, y, health, maxHealth) {
    const barImg = health > maxHealth * 0.5 
        ? assetManager.getImage('health_bar_full')
        : assetManager.getImage('health_bar_low');
    
    if (barImg && barImg.complete) {
        ctx.drawImage(barImg, x - 24, y, 48, 12);
    }
}
```

### Step 4: Update Game Loop

```javascript
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all visual elements with pixel art
    drawGameScene(ctx);

    // Update game logic
    updateGame();

    requestAnimationFrame(gameLoop);
}

function updateGame() {
    // Update plant growth
    if (nitrogenLevel > 0) {
        plantGrowth += 0.01;
        if (plantGrowth >= 1) {
            currentPlantStage = Math.min(currentPlantStage + 1, 5);
            plantGrowth = 0;
        }
    } else {
        plantHealth -= 0.5;
    }

    // Update bacteria activity
    updateBacteriaActivity();
    
    // Update nitrogen cycle
    cycleNitrogen();
}
```

## Asset Specifications

| Asset Type | Size | Format | Use Case |
|-----------|------|--------|----------|
| Plant stages | 64x64 | PNG | Main plant display |
| Soil layers | 64x32 | PNG | Background tiling |
| Organisms | 32x32 | PNG | Food web entities |
| Environment | 32x32 | PNG | Scene decoration |
| UI Elements | Various | PNG | Buttons & indicators |

## Color Palette

All assets use a consistent color palette:
- **Greens**: Plant life (#00640 to #90EE64)
- **Browns**: Soil (#654321 to #8B4513)
- **Reds**: Bacteria (#FF6464)
- **Purples**: Fungi (#C864C8)
- **Blues**: Nitrogen (#64B4FF)

## Performance Tips

1. **Load assets once**: Don't create new Image objects every frame
2. **Use image-rendering: pixelated**: Prevents blurring on scaling
3. **Cache image references**: Store in AssetManager
4. **Batch draw calls**: Group similar drawing operations

```javascript
// Good - pixel-perfect rendering
ctx.imageSmoothingEnabled = false;
```

## Next Steps

1. ✅ Copy pixel-assets folder to your game
2. ✅ Update renderer.js with AssetManager
3. ✅ Replace all emoji with drawImage() calls
4. ✅ Create vertical soil profile layout
5. ✅ Test and adjust sizing as needed
6. 📥 Download more assets from ASSET_SOURCES.md when ready

## Troubleshooting

**Images not showing?**
- Verify file paths are correct
- Check browser console for errors
- Ensure pixel-assets folder exists
- Use relative paths from index.html

**Blurry sprites?**
- Set `ctx.imageSmoothingEnabled = false`
- Use CSS `image-rendering: pixelated`

**Performance issues?**
- Load images asynchronously
- Use sprite sheets instead of individual files
- Limit organisms on screen

---

Happy coding! 🎮🌱
