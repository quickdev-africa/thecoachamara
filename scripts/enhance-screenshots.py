#!/usr/bin/env python3
from PIL import Image, ImageEnhance, ImageFilter
import os

files=[
 'screencapture-cassandraworthy-2025-08-20-03_23_16.jpg',
 'screencapture-clickfunnels-start-trial-step-2-2025-08-20-03_06_22.jpg'
]
for f in files:
    path=os.path.join(os.getcwd(),f)
    if not os.path.exists(path):
        print('missing',path)
        continue
    img=Image.open(path).convert('RGB')
    # increase contrast
    img=ImageEnhance.Contrast(img).enhance(1.6)
    # increase sharpness
    img=ImageEnhance.Sharpness(img).enhance(2.0)
    # slightly darken midtones by reducing brightness a bit
    img=ImageEnhance.Brightness(img).enhance(0.95)
    # optionally apply an unsharp mask
    img=img.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
    out=path.replace('.jpg','-enhanced.jpg')
    img.save(out, quality=90)
    print('wrote',out)
