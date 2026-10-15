#!/usr/bin/env python3
# usage: crop.py <dir> <page-vp> x0 y0 x1 y1 out.png  -> orig (top) / clone (bottom) same region, stacked, for pixel-level eyeballing
import sys
from PIL import Image
d,k=sys.argv[1],sys.argv[2]; x0,y0,x1,y1=map(int,sys.argv[3:7]); out=sys.argv[7]
a=Image.open(f'{d}/{k}-orig.png').convert('RGB').crop((x0,y0,x1,y1)); b=Image.open(f'{d}/{k}-clone.png').convert('RGB').crop((x0,y0,x1,y1))
im=Image.new('RGB',(x1-x0,(y1-y0)*2+10),'#f0f'); im.paste(a,(0,0)); im.paste(b,(0,y1-y0+10)); im.save(out)
