from pathlib import Path

from PIL import Image, ImageDraw


IN_DIR = Path("assets/analysis")
OUT = IN_DIR / "contact_sheet.jpg"
frames = sorted(IN_DIR.glob("frame_*.jpg"))
thumb_w = 320
thumb_h = 180
label_h = 24
cols = 4
rows = (len(frames) + cols - 1) // cols

sheet = Image.new("RGB", (cols * thumb_w, rows * (thumb_h + label_h)), "white")
draw = ImageDraw.Draw(sheet)

for index, frame_path in enumerate(frames):
    img = Image.open(frame_path).resize((thumb_w, thumb_h))
    x = (index % cols) * thumb_w
    y = (index // cols) * (thumb_h + label_h)
    sheet.paste(img, (x, y))
    draw.text((x + 8, y + thumb_h + 4), frame_path.stem.replace("frame_", "") + "s", fill=(0, 0, 0))

sheet.save(OUT, quality=92)
print(OUT)
