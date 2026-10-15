#!/usr/bin/env bash
# Usage: deploy-app.sh <slug>  — Vercel project + env + deploy + Firebase authorized domain. (Rewrites/apps.json are batched separately.)
set -uo pipefail
S=$1; T=/workspace/isdead-design/templates; cd /tmp
vercel project ls --scope muckstack-projects 2>/dev/null | awk '{print $1}' | grep -qx "$S" || $T/create-vercel-project.sh "$S" "$S" nextjs . > /tmp/create-$S.log 2>&1
grep -c "^set " /tmp/create-$S.log 2>/dev/null
$T/trigger-deploy.sh "$S" "$S"
python3 $T/fb_admin.py add-domain "$S.vercel.app" > /dev/null && echo "domain ok"
