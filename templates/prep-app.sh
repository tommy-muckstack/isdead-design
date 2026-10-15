#!/usr/bin/env bash
# Usage: prep-app.sh <slug>   (e.g. canvaisdead) — Google button, Firestore store, jwks-rsa pin, typecheck, commit+push.
set -uo pipefail
S=$1; D=/workspace/$S; T=/workspace/isdead-design/templates
cd "$D"; export GIT_AUTHOR_NAME="Tommy Keeley" GIT_AUTHOR_EMAIL=tommy@muckstack.com GIT_COMMITTER_NAME="Tommy Keeley" GIT_COMMITTER_EMAIL=tommy@muckstack.com
git pull -q --rebase 2>&1 | tail -1
rg -q 'GoogleButton' components app lib 2>/dev/null || node /workspace/isdead-design/scripts/apply-google-button.mjs "$D" | tail -2
if grep -q "ephemeral, so production must swap" lib/store.ts; then cp $T/store.firestore.ts lib/store.ts; echo "store -> firestore"; fi
grep -q '"@google-cloud/firestore"' package.json || npm i @google-cloud/firestore >/dev/null 2>&1
python3 - <<'P'
import json
p=json.load(open('package.json')); o=p.setdefault('overrides',{})
if o.get('jwks-rsa')!='^3.2.0': o['jwks-rsa']='^3.2.0'; json.dump(p,open('package.json','w'),indent=2); open('package.json','a').write('\n')
P
npm install >/dev/null 2>&1
npx tsc --noEmit 2>&1 | tail -5; echo "tsc exit ${PIPESTATUS[0]}"
git add -A . ; git status --short | head -20
git commit -qm "Production readiness: official Google button, Firestore-backed store, firestore dep, jwks-rsa ^3 pin for Vercel" && git push -q origin main 2>&1 | tail -1; git log --oneline -1
