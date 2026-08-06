from pathlib import Path

import imageio.v3 as iio
from PIL import Image


VIDEO = Path(r"C:\Users\lenovo\Downloads\Untitled design.mp4")
OUT = Path("assets/analysis")
TIMES = [0, 0.35, 0.7, 1.05, 1.4, 1.75, 2.1, 2.45, 2.8, 3.15, 3.5, 3.85]
FPS = 60

OUT.mkdir(parents=True, exist_ok=True)

for time in TIMES:
    frame = iio.imread(VIDEO, index=int(time * FPS))
    Image.fromarray(frame).resize((1280, 719)).save(
        OUT / f"frame_{time:.2f}.jpg",
        quality=90,
    )

print(f"extracted {len(TIMES)} frames")
