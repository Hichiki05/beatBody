from pathlib import Path

from PIL import Image


PUBLIC = Path("public")
PUBLIC.mkdir(exist_ok=True)

assets = {
    r"C:\Users\lenovo\Downloads\Rectangle 7.png": "studio-background.png",
    r"C:\Users\lenovo\Downloads\Ingredients result-Photoroom 1.png": "people.png",
    r"C:\Users\lenovo\Downloads\Group 14.png": "beat-body-logo.png",
    r"C:\Users\lenovo\Downloads\Frame 11.png": "info-card.png",
    r"C:\Users\lenovo\Downloads\Group 15.png": "proof-card.png",
}

for source, target in assets.items():
    Image.open(source).save(PUBLIC / target)

proof_card = Image.open(r"C:\Users\lenovo\Downloads\Group 15.png")

# Keep the full left photo panel and include the original right edge of the
# athlete before the translated card overlays it.
proof_card.crop((0, 0, 181, 217)).save(PUBLIC / "proof-athlete.png")

print("assets prepared")
