#!/bin/bash
# usage: preview-login.sh app [path]  -> /tmp/pv_<app>.png (clone login at 1440x900)
n=$1; P=${2:-/login}; port=$((3600 + RANDOM % 300)); cd /workspace/${n}isdead
DEMO_MODE=1 AUTH_SECRET=dev WATCHPACK_POLLING=true nohup npx next dev -p $port > /tmp/pv_$n.log 2>&1 &
pid=$!
for i in $(seq 1 30); do curl -s -o /dev/null http://localhost:$port/${n}isdead$P && break; sleep 1.5; done
node /workspace/isdead-design/scripts/shot2.mjs http://localhost:$port/${n}isdead$P /tmp/pv_$n.png 1440 900
pkill -P $pid; kill $pid 2>/dev/null; pkill -f "next dev -p $port"
