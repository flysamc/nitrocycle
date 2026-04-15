# Pixel Art Assets for Soil Food Web Game

## 📦 Created Assets (in your folder)

I've generated 15 custom pixel art sprites ready to use:

### Plants (5 growth stages)
- `plant_stage_1.png` - Seed
- `plant_stage_2.png` - Sprout
- `plant_stage_3.png` - Young plant
- `plant_stage_4.png` - Mature plant
- `plant_stage_5.png` - Tree

### Soil Layers
- `soil_top.png` - Top soil layer
- `soil_middle.png` - Middle soil layer
- `soil_bottom.png` - Deep soil layer

### Soil Organisms
- `bacteria.png` - Nitrogen-fixing bacteria
- `fungus.png` - Decomposer/fungus
- `earthworm.png` - Soil fauna
- `nitrogen.png` - Nitrogen indicator

### UI Elements
- `health_bar.png` - Plant health display
- `add_icon.png` - Plus/increase button
- `minus_icon.png` - Minus/decrease button

---

## 🌐 Free Asset Downloads (Curated Links)

### **Option 1: OpenGameArt.org (Recommended for your use case)**

**16x16 Free Forest Tileset** (872 KB)
- https://opengameart.org/content/free-sample-16x16-pixel-forest-tileset-%E2%80%93-top-down-rpg-style
- Includes: Trees, plants, grass, soil textures
- File: `seasons_of_forest_free_v1.zip`

**Grass Tileset 16x16** (6.9 KB)
- https://opengameart.org/content/grass-tileset-16x16
- File: `grass_tileset_16x16.zip`

**16x16 RPG Tileset**
- https://opengameart.org/content/16x16-rpg-tileset
- Includes: Terrain, trees, plants, water, buildings

**Flora - Vegetation - Plants**
- https://opengameart.org/content/flora-vegetation-plants
- Curated plant collection with growth stages

**Plant Pixel Art (CC0)**
- https://opengameart.org/content/plant-pixel-art-cco
- Public domain, no attribution needed

---

### **Option 2: itch.io (Great for asset packs)**

**GH: Farm Crops - 16x16 Pixel Art**
- https://helm3t.itch.io/pixel-asset-crops-pack
- Free demo pack included

**FARMING: CROPS - 16x16 Asset Pack**
- https://tolee-mi.itch.io/farming-crops
- Multiple crops with growth stages

**Sprout Lands - Asset Pack**
- Free top-down 16x16 assets for farming/simulation games

---

### **Option 3: CraftPix.net**

**Nature Pixel Art Environment Free Assets**
- https://craftpix.net/freebies/nature-pixel-art-environment-free-assets-pack/
- Earth, plants, trees, rocks, decorations

---

## 🎮 How to Use These Assets in Your Game

### 1. **Replace Emoji with PNG Images**

Current (emoji):
```javascript
context.font = "20px Arial";
context.fillText("🌱", x, y);
```

New (pixel art):
```javascript
// Load images at start
const plantImages = [];
for (let i = 1; i <= 5; i++) {
  const img = new Image();
  img.src = `pixel-assets/plants/plant_stage_${i}.png`;
  plantImages.push(img);
}

// Use in render function
drawPlant(x, y, stage) {
  const img = plantImages[stage - 1];
  context.drawImage(img, x - 16, y - 16, 32, 32);
}
```

### 2. **Vertical Layout for Soil Food Web**

```
┌─────────────────────┐
│  Plant (Top)        │  ← Use plant_stage_X.png
├─────────────────────┤
│  Soil Surface       │  ← Use soil_top.png
├─────────────────────┤
│  Bacteria, Fungi    │  ← Use organisms PNG files
│  Earthworms         │
├─────────────────────┤
│  Middle Soil        │  ← Use soil_middle.png
├─────────────────────┤
│  Deep Soil          │  ← Use soil_bottom.png
└─────────────────────┘
```

### 3. **Image Files in Game**

Place in your project:
```
your-game/
├── index.html
├── js/
├── css/
└── pixel-assets/          ← Create this folder
    ├── plants/
    ├── soil/
    ├── organisms/
    └── ui/
```

---

## 📝 Asset Licensing

**My Created Assets**: Free to use in your game (any license you prefer)

**OpenGameArt.org**: Most are CC0 or CC-BY, check each asset's page

**itch.io**: Varies by creator, check license before use

**CraftPix**: Check specific license for each asset

---

## 🚀 Next Steps

1. **Start with my custom assets** - They're ready to use immediately
2. **Download OpenGameArt assets** - For more variety and polish
3. **Integrate into your renderer.js** - Modify drawing functions to use PNG instead of emoji
4. **Create a vertical layout** - Display soil layers from top to bottom
5. **Add food web connections** - Lines showing nutrient flow between organisms

---

## 💡 Tips for Vertical Soil Food Web Display

- Use canvas coordinates: Plant at top, soil layers below
- Create containers for each "zone" (surface, bacteria zone, deep soil, etc.)
- Color code by organic matter type
- Show arrows/lines for nitrogen cycling between organisms
- Animate organisms moving through soil layers

Happy game developing! 🎮
