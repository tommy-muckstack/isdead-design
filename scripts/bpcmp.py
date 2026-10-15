#!/usr/bin/env python3
# bpcmp.py orig.bp.txt clone.bp.txt [tags=h1,h2,h3,h4,a-btn] : match headings/buttons by text order, print y/x/size deltas
import sys,re
def load(f,tags):
    out=[]
    for l in open(f):
        m=re.match(r'(h1|h2|h3|h4|button|a|p) y=(-?\d+) x=(-?\d+) w=(\d+) h=(\d+) ([\d.]+)px/[^ ]+ ?(.*?)"(.*)"$',l.strip())
        if not m: continue
        t,y,x,w,h,fs,rest,txt=m.groups()
        if t in tags and txt and int(x)>=0: out.append((t,int(y),int(x),int(w),int(h),float(fs),txt))
    return out
tags=(sys.argv[3] if len(sys.argv)>3 else 'h1,h2,h3,h4').split(',')
a=load(sys.argv[1],tags); b=load(sys.argv[2],tags)
print(f"{'orig':>6} {'clone':>6} {'dy':>5} | x  ox/cx | fs o/c | text(o) / text(c)")
n=max(len(a),len(b))
for i in range(n):
    o=a[i] if i<len(a) else None; c=b[i] if i<len(b) else None
    if o and c: print(f"{o[1]:6} {c[1]:6} {c[1]-o[1]:5} | {o[2]:4}/{c[2]:<4} w{o[3]}/{c[3]} h{o[4]}/{c[4]} | {o[5]:.0f}/{c[5]:.0f} | {o[6][:34]} / {c[6][:34]}")
    elif o: print(f"{o[1]:6} {'-':>6} | {o[6][:50]}")
    else: print(f"{'-':>6} {c[1]:6} | {c[6][:50]}")
