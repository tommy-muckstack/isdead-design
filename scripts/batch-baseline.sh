#!/bin/bash
# usage: batch-baseline.sh app1 app2 ...   (runs parity.mjs for each, baseline into /workspace/isdead-shots/parity/<app>isdead/before)
cd /workspace/isdead-design
for a in "$@"; do echo "=== $a"; timeout 900 node scripts/parity.mjs --config parity/$a.json --out /workspace/isdead-shots/parity/${a}isdead/before 2>&1 | grep -E "^\|" ; done
