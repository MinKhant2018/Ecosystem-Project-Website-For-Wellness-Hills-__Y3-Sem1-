"""Recreate the supplied raster assets. Requires Pillow; not needed to build/run."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'references' / 'promotions.png'
if not SOURCE.is_file():
    SOURCE = ROOT / 'promotions.png'
DESTINATION = ROOT / 'public' / 'assets'
DESTINATION.mkdir(parents=True, exist_ok=True)

# Coordinates in the original 2960×5583 (2×) export. Exclude card borders/text.
PHOTOS = {
    'insda': (298, 1410, 1051, 1975),
    'origan': (1104, 1410, 1856, 1975),
    'earth': (1909, 1410, 2662, 1975),
    'shambhu': (298, 2798, 1051, 3363),
    'calush': (1104, 2798, 1856, 3363),
    'hills': (1909, 2798, 2662, 3363),
}
LOGOS = {
    'insda': (594, 2054, 754, 2214),
    'origan': (1400, 2054, 1560, 2214),
    'earth': (2205, 2054, 2365, 2214),
    'shambhu': (594, 3442, 754, 3602),
    'calush': (1400, 3442, 1560, 3602),
    'hills': (2205, 3442, 2365, 3602),
    'footer': (294, 4361, 422, 4489),
}

with Image.open(SOURCE) as source:
    if source.size != (2960, 5583):
        raise ValueError('Expected the original 2960×5583 Promotions export')
    for name, box in PHOTOS.items():
        photo = source.crop(box).convert('RGB')
        photo.save(DESTINATION / f'{name}-photo.webp', quality=90, method=6)
        photo.resize((400, 300), Image.Resampling.LANCZOS).save(
            DESTINATION / f'{name}-photo-small.webp', quality=88, method=6
        )
    for name, box in LOGOS.items():
        source.crop(box).save(
            DESTINATION / f'{name}-logo.webp', lossless=True, method=6
        )
print('Extracted six responsive photos and seven lossless logos.')
