#!/usr/bin/env python3
# usage: sbs.py <dir> <page-vp e.g. home-1440> y0 y1 out.png  -> orig|clone crop (rows y0..y1) side by side, downscaled to <=1900px
import sys
from PIL import Image
d,k,y0,y1,out=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),sys.argv[5]
a=Image.open(f'{d}/{k}-orig.png').convert('RGB'); b=Image.open(f'{d}/{k}-clone.png').convert('RGB')
w=max(a.width,b.width); h=y1-y0
im=Image.new('RGB',(w*2+20,h),'#444'); im.paste(a.crop((0,y0,a.width,min(a.height,y1))),(0,0)); im.paste(b.crop((0,y0,b.width,min(b.height,y1))),(w+20,0))
im.thumbnail((1900,2400)); im.save(out); print(a.size,b.size)
