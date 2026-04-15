from PIL import Image, ImageDraw
import os
import math

# Create directories
for d in ['plants', 'soil', 'organisms', 'ui', 'environment']:
    os.makedirs(d, exist_ok=True)

# Enhanced color palette
colors = {
    # Plants
    'stem_dark': (34, 102, 0),
    'stem_light': (76, 153, 0),
    'leaf_dark': (0, 100, 0),
    'leaf_light': (144, 238, 100),
    'flower_red': (220, 50, 50),
    'flower_yellow': (255, 220, 0),
    'brown': (139, 69, 19),
    
    # Soil
    'soil_surface': (160, 82, 45),
    'soil_dark': (101, 67, 33),
    'soil_deep': (67, 50, 33),
    'clay': (180, 140, 80),
    
    # Organisms
    'bacteria': (255, 100, 100),
    'fungus': (200, 100, 200),
    'worm_body': (180, 140, 100),
    'worm_dark': (140, 100, 60),
    'root': (139, 69, 19),
    
    # UI
    'nitrogen': (100, 180, 255),
    'green': (76, 200, 0),
    'red': (255, 60, 60),
    'yellow': (255, 200, 0),
    
    'white': (255, 255, 255),
    'black': (0, 0, 0),
    'gray': (128, 128, 128),
}

print("=" * 50)
print("Creating PREMIUM Pixel Art Assets")
print("=" * 50)

# 1. DETAILED PLANT GROWTH STAGES (64x64)
print("\n🌱 Creating plant growth stages...")
for stage in range(1, 6):
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Soil base with layers
    draw.rectangle([0, 50, 64, 64], fill=colors['soil_surface'])
    draw.rectangle([2, 52, 62, 62], fill=colors['soil_dark'])
    
    if stage >= 1:  # Seed
        draw.ellipse([30, 48, 34, 52], fill=colors['root'])
        draw.ellipse([31, 49, 33, 51], fill=colors['brown'])
    
    if stage >= 2:  # Sprout (tiny)
        draw.rectangle([31, 44, 33, 50], fill=colors['stem_dark'])
        draw.polygon([(31, 42), (29, 44), (35, 44)], fill=colors['leaf_light'])
    
    if stage >= 3:  # Young plant
        # Stem
        draw.rectangle([30, 36, 34, 50], fill=colors['stem_dark'])
        draw.rectangle([31, 35, 33, 50], fill=colors['stem_light'])
        
        # Leaves
        draw.polygon([(30, 42), (20, 38), (26, 44)], fill=colors['leaf_dark'])
        draw.polygon([(34, 42), (44, 38), (38, 44)], fill=colors['leaf_dark'])
        draw.polygon([(30, 38), (22, 32), (28, 38)], fill=colors['leaf_light'])
        draw.polygon([(34, 38), (42, 32), (36, 38)], fill=colors['leaf_light'])
        
        # Roots
        draw.line([(31, 50), (20, 58)], fill=colors['root'], width=2)
        draw.line([(33, 50), (44, 58)], fill=colors['root'], width=2)
    
    if stage >= 4:  # Mature plant
        # Stem
        draw.rectangle([30, 28, 34, 50], fill=colors['stem_dark'])
        draw.rectangle([31, 27, 33, 50], fill=colors['stem_light'])
        
        # Multiple leaves
        for angle in [0, 60, 120, 180, 240, 300]:
            rad = math.radians(angle)
            x_leaf = 32 + math.cos(rad) * 12
            y_leaf = 38 + math.sin(rad) * 12
            color = colors['leaf_light'] if angle % 120 == 0 else colors['leaf_dark']
            draw.ellipse([int(x_leaf-3), int(y_leaf-3), int(x_leaf+3), int(y_leaf+3)], fill=color)
        
        # Roots
        for x in [20, 32, 44]:
            draw.line([(32, 50), (x, 60)], fill=colors['root'], width=2)
    
    if stage == 5:  # Tree
        # Trunk
        draw.rectangle([28, 20, 36, 50], fill=colors['root'])
        draw.rectangle([29, 19, 35, 50], fill=colors['brown'])
        
        # Crown - triangle shaped
        crown_points = [(32, 12), (16, 28), (48, 28)]
        draw.polygon(crown_points, fill=colors['leaf_dark'])
        
        # Highlight leaves
        crown_points2 = [(32, 14), (20, 26), (44, 26)]
        draw.polygon(crown_points2, fill=colors['leaf_light'])
        
        # Roots
        for x in [16, 32, 48]:
            draw.line([(32, 50), (x, 62)], fill=colors['root'], width=2)
    
    img.save(f'plants/plant_stage_{stage}.png')
    print(f"✓ plant_stage_{stage}.png (64x64)")

# 2. ENHANCED SOIL LAYERS (64x32)
print("\n🏜️ Creating soil layers...")
soil_configs = [
    ('soil_top', colors['soil_surface']),
    ('soil_middle', colors['soil_dark']),
    ('soil_bottom', colors['soil_deep']),
]

for name, base_color in soil_configs:
    img = Image.new('RGBA', (64, 32), base_color)
    draw = ImageDraw.Draw(img)
    
    # Add texture/rocks
    import random
    random.seed(hash(name))
    for i in range(8):
        x = random.randint(0, 64)
        y = random.randint(0, 32)
        size = random.randint(2, 6)
        draw.ellipse([x, y, x+size, y+size], fill=colors['black'])
    
    img.save(f'soil/{name}.png')
    print(f"✓ {name}.png (64x32)")

# 3. DETAILED ORGANISMS (32x32)
print("\n🦠 Creating soil organisms...")

# Bacteria
img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.ellipse([10, 10, 22, 22], fill=colors['bacteria'])
for i in range(3):
    draw.line([(16, 16), (8 + i*2, 24)], fill=colors['red'], width=1)
    draw.line([(16, 16), (24 - i*2, 8)], fill=colors['red'], width=1)
img.save('organisms/bacteria.png')
print("✓ bacteria.png (32x32)")

# Fungus
img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.ellipse([8, 12, 24, 24], fill=colors['fungus'])
draw.ellipse([10, 6, 22, 14], fill=colors['fungus'])
for x in range(12, 22, 2):
    draw.line([(x, 14), (x, 20)], fill=colors['black'], width=1)
img.save('organisms/fungus.png')
print("✓ fungus.png (32x32)")

# Earthworm
img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
for i in range(5):
    y = 8 + i * 4
    draw.ellipse([6 + i, y, 26 - i, y + 4], fill=colors['worm_body'])
    draw.ellipse([8 + i, y + 1, 24 - i, y + 3], fill=colors['worm_dark'])
draw.ellipse([4, 6, 12, 12], fill=colors['worm_dark'])
img.save('organisms/earthworm.png')
print("✓ earthworm.png (32x32)")

# Root system
img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.line([(16, 4), (16, 28)], fill=colors['root'], width=3)
for i in range(5):
    y = 8 + i * 4
    draw.line([(16, y), (8, y + 3)], fill=colors['root'], width=2)
    draw.line([(16, y), (24, y + 3)], fill=colors['root'], width=2)
img.save('organisms/root_system.png')
print("✓ root_system.png (32x32)")

# Nitrogen particle
img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.ellipse([8, 8, 24, 24], fill=colors['nitrogen'])
draw.ellipse([10, 10, 22, 22], fill=colors['white'])
draw.text((11, 11), 'N', fill=colors['nitrogen'])
img.save('organisms/nitrogen.png')
print("✓ nitrogen.png (32x32)")

# 4. ENHANCED UI ELEMENTS
print("\n🎮 Creating UI elements...")

# Health bar - full
img = Image.new('RGBA', (48, 12), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.rectangle([0, 0, 48, 12], outline=colors['black'], width=2, fill=colors['white'])
draw.rectangle([2, 2, 38, 10], fill=colors['green'])
img.save('ui/health_bar_full.png')
print("✓ health_bar_full.png")

# Health bar - low
img = Image.new('RGBA', (48, 12), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.rectangle([0, 0, 48, 12], outline=colors['black'], width=2, fill=colors['white'])
draw.rectangle([2, 2, 22, 10], fill=colors['red'])
img.save('ui/health_bar_low.png')
print("✓ health_bar_low.png")

# Add nitrogen button
img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.rectangle([4, 4, 28, 28], fill=colors['green'], outline=colors['black'], width=2)
draw.rectangle([14, 10, 18, 22], fill=colors['white'], width=2)
draw.rectangle([10, 14, 22, 18], fill=colors['white'], width=2)
img.save('ui/add_nitrogen.png')
print("✓ add_nitrogen.png")

# Remove nitrogen button
img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.rectangle([4, 4, 28, 28], fill=colors['red'], outline=colors['black'], width=2)
draw.rectangle([10, 14, 22, 18], fill=colors['white'], width=2)
img.save('ui/remove_nitrogen.png')
print("✓ remove_nitrogen.png")

# Nitrogen indicator
img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.ellipse([4, 4, 28, 28], fill=colors['nitrogen'], outline=colors['black'], width=2)
draw.text((12, 10), 'N', fill=colors['white'])
img.save('ui/nitrogen_indicator.png')
print("✓ nitrogen_indicator.png")

# 5. ENVIRONMENT ELEMENTS
print("\n🌍 Creating environment elements...")

# Rock
img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.polygon([(16, 8), (24, 14), (28, 24), (20, 28), (8, 24), (12, 14)], 
             fill=colors['gray'])
draw.polygon([(16, 10), (22, 15), (26, 23), (18, 26), (10, 23), (14, 15)], 
             fill=(200, 200, 200))
img.save('environment/rock.png')
print("✓ rock.png")

# Leaf litter
img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.polygon([(8, 20), (16, 12), (24, 16), (20, 26)], fill=colors['leaf_dark'])
draw.polygon([(20, 16), (28, 14), (26, 28), (16, 24)], fill=colors['leaf_light'])
img.save('environment/leaf_litter.png')
print("✓ leaf_litter.png")

# Compost pile
img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
for y in range(4):
    for x in range(3):
        draw.rectangle([8 + x*8, 10 + y*6, 14 + x*8, 14 + y*6], 
                      fill=colors['soil_dark'], outline=colors['black'], width=1)
img.save('environment/compost.png')
print("✓ compost.png")

print("\n" + "=" * 50)
print("✅ ALL PREMIUM ASSETS CREATED!")
print("=" * 50)
