from PIL import Image, ImageDraw
import os

# Create directories
os.makedirs('plants', exist_ok=True)
os.makedirs('soil', exist_ok=True)
os.makedirs('organisms', exist_ok=True)
os.makedirs('ui', exist_ok=True)

# Color palette
colors = {
    'soil_dark': (139, 69, 19),
    'soil_light': (160, 82, 45),
    'green_dark': (34, 139, 34),
    'green_light': (144, 238, 144),
    'brown': (101, 67, 33),
    'yellow': (255, 255, 0),
    'orange': (255, 165, 0),
    'red': (255, 0, 0),
    'white': (255, 255, 255),
    'black': (0, 0, 0),
}

# 1. Create plant growth stages (5 stages)
print("Creating plant growth stages...")
for stage in range(1, 6):
    img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw soil base for all stages
    draw.rectangle([0, 24, 32, 32], fill=colors['soil_dark'])
    draw.rectangle([2, 26, 30, 30], fill=colors['soil_light'])
    
    if stage >= 1:  # Seed
        draw.ellipse([14, 22, 18, 26], fill=colors['brown'])
    
    if stage >= 2:  # Sprout
        draw.rectangle([15, 18, 17, 24], fill=colors['green_dark'])
        draw.rectangle([14, 16, 18, 18], fill=colors['green_light'])
    
    if stage >= 3:  # Young plant
        draw.rectangle([15, 12, 17, 24], fill=colors['green_dark'])
        draw.rectangle([13, 10, 19, 14], fill=colors['green_light'])
        draw.rectangle([12, 12, 14, 16], fill=colors['green_light'])
        draw.rectangle([18, 12, 20, 16], fill=colors['green_light'])
    
    if stage >= 4:  # Mature plant
        draw.rectangle([15, 8, 17, 24], fill=colors['green_dark'])
        draw.rectangle([12, 6, 20, 12], fill=colors['green_light'])
        draw.rectangle([10, 10, 12, 18], fill=colors['green_light'])
        draw.rectangle([20, 10, 22, 18], fill=colors['green_light'])
    
    if stage == 5:  # Tree
        # Trunk
        draw.rectangle([14, 8, 18, 24], fill=colors['brown'])
        # Crown
        draw.polygon([(16, 4), (8, 14), (24, 14)], fill=colors['green_dark'])
        draw.polygon([(16, 6), (10, 12), (22, 12)], fill=colors['green_light'])
    
    img.save(f'plants/plant_stage_{stage}.png')
    print(f"✓ Created plant_stage_{stage}.png")

# 2. Create soil layers
print("\nCreating soil layers...")
soil_types = [
    ('soil_top', colors['soil_light']),
    ('soil_middle', colors['soil_dark']),
    ('soil_bottom', (101, 50, 25)),
]

for name, color in soil_types:
    img = Image.new('RGBA', (32, 32), color)
    draw = ImageDraw.Draw(img)
    
    # Add texture
    for i in range(0, 32, 4):
        for j in range(0, 32, 4):
            draw.point((i, j), fill=colors['black'])
    
    img.save(f'soil/{name}.png')
    print(f"✓ Created {name}.png")

# 3. Create soil organisms
print("\nCreating soil organisms...")

# Bacteria (tiny dots)
img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.ellipse([6, 6, 10, 10], fill=colors['red'])
img.save('organisms/bacteria.png')
print("✓ Created bacteria.png")

# Fungus/Decomposer
img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.ellipse([4, 4, 12, 12], fill=colors['orange'])
draw.ellipse([6, 2, 10, 6], fill=colors['orange'])
img.save('organisms/fungus.png')
print("✓ Created fungus.png")

# Earthworm
img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.rectangle([2, 7, 14, 9], fill=colors['brown'])
draw.ellipse([2, 6, 5, 10], fill=colors['brown'])
draw.ellipse([10, 6, 14, 10], fill=colors['brown'])
img.save('organisms/earthworm.png')
print("✓ Created earthworm.png")

# Nitrogen indicator
img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.ellipse([3, 3, 13, 13], fill=colors['yellow'])
draw.text((6, 5), 'N', fill=colors['black'])
img.save('organisms/nitrogen.png')
print("✓ Created nitrogen.png")

# 4. Create UI icons
print("\nCreating UI icons...")

# Health/Nitrogen bar
img = Image.new('RGBA', (32, 8), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.rectangle([0, 0, 32, 8], outline=colors['black'], width=1, fill=colors['red'])
draw.rectangle([0, 0, 24, 8], fill=colors['green_light'])
img.save('ui/health_bar.png')
print("✓ Created health_bar.png")

# Plus/Add icon
img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.rectangle([7, 3, 9, 13], fill=colors['green_light'])
draw.rectangle([3, 7, 13, 9], fill=colors['green_light'])
img.save('ui/add_icon.png')
print("✓ Created add_icon.png")

# Minus/Remove icon
img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.rectangle([3, 7, 13, 9], fill=colors['red'])
img.save('ui/minus_icon.png')
print("✓ Created minus_icon.png")

print("\n✅ All pixel art assets created successfully!")
