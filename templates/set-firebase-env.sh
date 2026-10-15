#!/usr/bin/env bash
# Usage: set-firebase-env.sh <vercel-project-name> [environments: "production preview"]
# Copies the shared yourappisdead Firebase env to a Vercel project WITHOUT printing values.
# Needs: ~/.secrets/cal.prod.env (from `vercel env pull --environment=production` in the calendlyisdead dir)
#        ~/.secrets/yourappisdead-sa.json (Firebase Admin SDK service account JSON)
set -euo pipefail
PROJ=${1:?vercel project name}; ENVS=${2:-"production preview"}; SCOPE=${VERCEL_SCOPE:-muckstack-projects}
SRC=${SRC_ENV:-$HOME/.secrets/cal.prod.env}; SA=${SA_JSON:-$HOME/.secrets/yourappisdead-sa.json}
getv(){ python3 - "$SRC" "$1" <<'P'
import sys
for l in open(sys.argv[1]):
    if l.startswith(sys.argv[2]+'='): print(l.rstrip('\n').split('=',1)[1].strip('"'),end='')
P
}
for e in $ENVS; do
  for k in NEXT_PUBLIC_FIREBASE_API_KEY NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN NEXT_PUBLIC_FIREBASE_PROJECT_ID NEXT_PUBLIC_FIREBASE_APP_ID NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET; do
    getv "$k" | vercel env add "$k" "$e" --force --yes --no-sensitive --project "$PROJ" --scope "$SCOPE" >/dev/null 2>&1 && echo "set $k ($e)" || echo "FAILED $k ($e)"
  done
  python3 -c "import json,sys;print(json.dumps(json.load(open(sys.argv[1])),separators=(',',':')),end='')" "$SA" | vercel env add FIREBASE_SERVICE_ACCOUNT_JSON "$e" --sensitive --force --yes --project "$PROJ" --scope "$SCOPE" >/dev/null 2>&1 && echo "set FIREBASE_SERVICE_ACCOUNT_JSON ($e)" || echo "FAILED SA ($e)"
done
