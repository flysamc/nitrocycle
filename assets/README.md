# 🌱 Pixel Art Assets Pack for Soil Food Web Game

## ✅ What's Included

### 15 Custom-Made Pixel Art Sprites

**Plants (5 growth stages)**
```
Stage 1: Seed 🌾
Stage 2: Sprout 🌱
Stage 3: Young Plant 🌿
Stage 4: Mature Plant 🪴
Stage 5: Tree 🌳
```

**Soil Layers (3 layers)**
- Top Soil (light brown)
- Middle Soil (darker brown)
- Bottom Soil (very dark)

**Soil Organisms (4 types)**
- Bacteria (nitrogen fixers)
- Fungus (decomposers)
- Earthworm (soil fauna)
- Nitrogen indicator

**UI Elements (3 icons)**
- Health bar
- Add/Plus icon
- Remove/Minus icon

---

## 🎮 Quick Start Guide

### Step 1: Copy Assets to Your Game
```
your-game-folder/
├── index.html
├── js/
├── css/
└── pixel-assets/          ← Copy this entire folder here
    ├── plants/
    ├── soil/
    ├── organisms/
    └── ui/
```

### Step 2: Update Your Renderer
Replace emoji rendering with:
```javascript
// OLD (emoji):
context.fillText("🌱", x, y);

// NEW (pixel art):
const plantImage = new Image();
plantImage.src = "pixel-assets/plants/plant_stage_2.png";
context.drawImage(plantImage, x - 16, y - 16, 32, 32);
```

### Step 3: Create Vertical Layout
```
┌─────────────────────────────────┐
│                                 │
│        PLANT (Above)            │  ← plant_stage_X.png
│                                 │
├─────────────────────────────────┤
│  ⚡ SURFACE ZONE                │  ← soil_top.png
│  (Plant roots absorb here)      │
├─────────────────────────────────┤
│  🧬 BACTERIA ZONE               │  ← bacteria.png, nitrogen.png
│  🍄 DECOMPOSER ZONE             │  ← fungus.png
│  (Nitrogen fixing happens)      │
├─────────────────────────────────┤
│  🪱 FAUNA ZONE                  │  ← earthworm.png
│  (Soil organisms)               │
├─────────────────────────────────┤
│  🔗 DEEP SOIL                   │  ← soil_bottom.png
│  (Storage & breakdown)          │
└─────────────────────────────────┘
```

---

## 📥 Download More Free Assets

We've prepared links to download professional pixel art assets to enhance your game:

**See `ASSET_SOURCES.md` for complete download links from:**
- OpenGameArt.org (recommended)
- itch.io (variety)
- CraftPix.net (quality packs)

---

## 🎨 Customizing Assets

To create variations or custom sprites:

1. **Edit existing PNG files** with:
   - Aseprite (paid, but powerful)
   - Piskel (free, web-based)
   - GIMP (free, open-source)
   - Photopea (free web editor)

2. **Regenerate with Python**:
   ```bash
   python3 create-pixel-art.py
   ```

---

## 📚 Integration Tips

### Load All Assets at Game Start
```javascript
class Game {
  async init() {
    await this.assetLoader.loadAllAssets();
    this.startGameLoop();
  }
}
```

### Use Asset Manager Pattern
```javascript
// In renderer.js
drawPlant(x, y, stage) {
  const image = assetManager.getImage(`plant_stage_${stage}`);
  ctx.drawImage(image, x - 16, y - 16, 32, 32);
}
```

### Animate Organisms
```javascript
// Move bacteria around to show activity
animateBacteria(x, y, time) {
  const offset = Math.sin(time * 0.02) * 3;
  this.drawOrganism('bacteria', x + offset, y, 12);
}
```

### Show Nitrogen Flow
```javascript
// Draw arrows between organisms to show relationships
drawNitrogenConnection(fromX, fromY, toX, toY) {
  ctx.strokeStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
}
```

---

## 🚀 Next Steps

1. **Copy pixel-assets folder** into your game directory
2. **Use integration-template.js** as reference for your code
3. **Replace emoji** in your renderer with PNG images
4. **Test the vertical layout** - adjust canvas height for soil depth
5. **Download additional assets** from ASSET_SOURCES.md when ready
6. **Add animations** - move organisms, grow plants, show nitrogen cycling

---

## 📝 File Formats

All assets are **PNG format with transparency (RGBA)**:
- Plant stages: 32x32 pixels
- Soil tiles: 32x32 pixels
- Organisms: 16x16 pixels
- UI elements: 32x8 or 16x16 pixels

This format works with any HTML5 Canvas implementation!

---

## 💡 Design Philosophy

These assets are designed to be:
- ✅ Simple and clean (educational focus)
- ✅ Pixel-art style (retro aesthetic)
- ✅ Easy to customize
- ✅ Small file size (68KB total)
- ✅ Transparent backgrounds (easy layering)

Perfect for teaching the nitrogen cycle and soil food web! 🌍

---

## 🆘 Troubleshooting

**Images not showing?**
- Check file paths are correct
- Ensure pixel-assets folder is in game directory
- Check browser console for errors

**Performance issues?**
- Cache images in memory (done in integration-template.js)
- Use RequestAnimationFrame for smooth rendering
- Consider texture atlasing for large asset sets

**Want more assets?**
- Download from OpenGameArt.org (ASSET_SOURCES.md)
- Create with Aseprite or Piskel
- Re-run create-pixel-art.py with modifications

---

**Happy developing! 🎮🌱**
