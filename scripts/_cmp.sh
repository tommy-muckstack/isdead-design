#!/bin/bash
# usage: _cmp.sh  -> compares leaf positions orig(B) vs local
cd /workspace/isdead-design
node scripts/_leaf.mjs http://localhost:3310/otterisdead 390 "" 0 9000 > /tmp/leafC.txt
python3 - <<'PY'
def load(f):
    d={}
    for l in open(f):
        p=l.rstrip('\n').split('|')
        if len(p)<11: continue
        d.setdefault(p[10][:40],[]).append((int(p[0]),int(p[1]),int(p[2]),int(p[3]),p[5]))
    return d
o=load('/tmp/leafB.txt'); c=load('/tmp/leafC.txt')
for k,v in sorted(o.items(), key=lambda kv: kv[1][0][0]):
    if v[0][0]>7600 or v[0][0]<60 or v[0][0] in (624,703,755,806): continue
    if k in c: print(f"{v[0][0]:5} -> {c[k][0][0]:5} d={c[k][0][0]-v[0][0]:5}  x {v[0][1]}/{c[k][0][1]} w {v[0][2]}/{c[k][0][2]} h {v[0][3]}/{c[k][0][3]} {k[:30]}")
PY
