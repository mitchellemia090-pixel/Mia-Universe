"""Crop the neighbouring column from actual browser screenshots; no redraw."""
from pathlib import Path
from PIL import Image
import json
root=Path('pages-release-review/three-visual-fixes')
for record in json.loads((root/'crops.json').read_text()):
 p=root/record['file'];im=Image.open(p)
 im.crop((max(0,int(record['x'])-6),0,min(im.width,int(record['x']+record['width'])+6),im.height)).save(root/p.name.replace('-page.png','.png'))
