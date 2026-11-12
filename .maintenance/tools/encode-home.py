"""Encode Chromium-rasterized approved artwork without changing alpha edges."""
from pathlib import Path
from PIL import Image
paths=[Path('integrated-v2/assets')/(n+'.png') for n in ('home','about','work','archive','personal','contact')]+[Path('integrated-v2/assets/home-refinement')/(n+'.png') for n in ('approved-rest','cloud-volume-proportions','cloud-floor-layout')]
for p in paths:
 Image.open(p).save(p.with_suffix('.webp'),quality=92,method=6,exact=True)
 print(p.with_suffix('.webp'),p.with_suffix('.webp').stat().st_size)
