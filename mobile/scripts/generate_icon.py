"""Generate the app icon set for Expense Intelligence.

Outputs (under mobile/assets):
  icon.png          1024x1024 legacy square icon (gradient bg, opaque)
  adaptive-icon.png 1024x1024 Android adaptive foreground (transparent bg)

Motif: ascending rounded bars inside a translucent circle — matches the
dashboard's analytics branding. Brand colors: #2563EB -> #7C3AED.
Run:  python scripts/generate_icon.py
"""
from PIL import Image, ImageDraw
import os

SIZE = 1024
PRIMARY = (37, 99, 235)    # #2563EB
SECONDARY = (124, 58, 237) # #7C3AED
OUT = os.path.join(os.path.dirname(__file__), "..", "assets")


def gradient(size, c1, c2):
    # 2x2 corner colors resized with bicubic = smooth diagonal gradient
    tiny = Image.new("RGB", (2, 2))
    tiny.putpixel((0, 0), c1)
    tiny.putpixel((1, 0), tuple((a + b) // 2 for a, b in zip(c1, c2)))
    tiny.putpixel((0, 1), tuple((a + b) // 2 for a, b in zip(c1, c2)))
    tiny.putpixel((1, 1), c2)
    return tiny.resize((size, size), Image.BICUBIC)


def draw_glyph(img, scale):
    """Ascending rounded bars in a translucent circle, centered. scale=1 -> fills canvas."""
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = SIZE / 2, SIZE / 2
    r = 340 * scale  # circle radius
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, 46))

    bw, gap = 96 * scale, 52 * scale          # bar width / gap
    heights = [180 * scale, 280 * scale, 390 * scale]
    total_w = 3 * bw + 2 * gap
    x0 = cx - total_w / 2
    base = cy + 150 * scale                   # common baseline
    rad = int(bw / 2)
    for i, h in enumerate(heights):
        x = x0 + i * (bw + gap)
        d.rounded_rectangle([x, base - h, x + bw, base], radius=rad, fill=(255, 255, 255, 255))
    return img


os.makedirs(OUT, exist_ok=True)

# Glyph on its own transparent layer, then composited — drawing translucent
# shapes directly onto an RGBA image replaces pixels instead of blending.
overlay = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw_glyph(overlay, scale=1)
icon = Image.alpha_composite(gradient(SIZE, PRIMARY, SECONDARY).convert("RGBA"), overlay)
icon.convert("RGB").save(os.path.join(OUT, "icon.png"), "PNG")

# Android adaptive foreground: transparent bg, glyph sized into the ~66% safe zone
fg = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw_glyph(fg, scale=0.66)
fg.save(os.path.join(OUT, "adaptive-icon.png"), "PNG")

print("written:", os.listdir(OUT))
