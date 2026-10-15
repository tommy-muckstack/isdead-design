#!/usr/bin/env bash
# Usage: create-vercel-project.sh <name> <github-repo-name> <framework: nextjs|vite|null> [rootDirectory|.] [buildCommand] [outputDirectory]
# Creates a Vercel project in team muckstack-projects connected to tommy-muckstack/<repo> (auto-deploy on push to main),
# then copies the shared Firebase env (see set-firebase-env.sh). Uses the logged-in `vercel` CLI only.
set -euo pipefail
NAME=$1; REPO=$2; FW=${3:-null}; ROOT=${4:-.}; BUILD=${5:-}; OUT=${6:-}
TEAM=team_q4DHxZibjxQOtPUwW1fNUfmG
python3 - "$NAME" "$REPO" "$FW" "$ROOT" "$BUILD" "$OUT" > /tmp/vp-$NAME.json <<'P'
import json,sys
n,r,fw,root,b,o=sys.argv[1:]
d={"name":n,"gitRepository":{"type":"github","repo":"tommy-muckstack/"+r},"framework":None if fw=="null" else fw}
if root not in(".",""): d["rootDirectory"]=root
if b: d["buildCommand"]=b
if o: d["outputDirectory"]=o
print(json.dumps(d))
P
vercel api "/v11/projects?teamId=$TEAM" -X POST --input /tmp/vp-$NAME.json --raw | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('id') or d)"
HERE=$(dirname "$0"); "$HERE/set-firebase-env.sh" "$NAME" "production preview"
echo "Done. Add rewrites for /<slug> to $NAME.vercel.app in yourappisdead/vercel.json, push repo main (or: vercel deploy --prod --cwd <dir> after vercel link)."
