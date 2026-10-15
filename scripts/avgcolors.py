#!/usr/bin/env python3
"""(also stores a coarse colour mesh per image: a blurred mosaic of average colours, not the image itself)
   Give every img item of an m2json layout a two-stop colour wash sampled from the original's full-page screenshot.
   avgcolors.py layout.json original-full-page.png   (png must be the 390px-wide capture of the same page)"""
import json, sys
from PIL import Image
d = json.load(open(sys.argv[1])); im = Image.open(sys.argv[2]).convert("RGB"); W, H = im.size
def avg(box):
    x0, y0, x1, y1 = [int(round(v)) for v in box]
    x0, x1 = max(0, x0), min(W, max(x1, x0 + 1)); y0, y1 = max(0, y0), min(H, max(y1, y0 + 1))
    if x1 <= x0 or y1 <= y0: return None
    c = im.crop((x0, y0, x1, y1)).resize((1, 1), Image.BOX).getpixel((0, 0)); return c
n = 0
for it in d["items"]:
    if it["k"] != "img" or it["w"] < 28 or it["h"] < 28: continue
    x, y, w, h = it["x"], it["y"], it["w"], it["h"]
    a = avg((x, y, x + w / 2, y + h / 2)); b = avg((x + w / 2, y + h / 2, x + w, y + h)); c = avg((x, y, x + w, y + h))
    if not (a and b): continue
    f = lambda t: "rgb(%d,%d,%d)" % t
    gx = max(3, min(8, round(w / 40))); gy = max(3, min(8, round(h / 40))); cols = []
    for j in range(gy):
        for i in range(gx):
            t = avg((x + w * i / gx, y + h * j / gy, x + w * (i + 1) / gx, y + h * (j + 1) / gy)); cols.append("#%02x%02x%02x" % (t if t else (128, 128, 128)))
    it["mesh"] = {"gx": gx, "gy": gy, "c": cols}
    it["wash"] = "linear-gradient(135deg,%s,%s)" % (f(a), f(b)); it["avg"] = f(c); n += 1
json.dump(d, open(sys.argv[1], "w")); print("washed", n)
