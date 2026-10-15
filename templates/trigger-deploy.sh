#!/usr/bin/env bash
# Usage: trigger-deploy.sh <vercel-project-name> <github-repo-name>   — deploys main of the repo to production via the Vercel API.
set -euo pipefail
TEAM=team_q4DHxZibjxQOtPUwW1fNUfmG; N=$1; R=$2
RID=$(vercel api "/v9/projects/$N?teamId=$TEAM" --raw | python3 -c "import sys,json;print(json.load(sys.stdin)['link']['repoId'])")
echo "{\"name\":\"$N\",\"project\":\"$N\",\"target\":\"production\",\"gitSource\":{\"type\":\"github\",\"repoId\":$RID,\"ref\":\"main\"}}" > /tmp/dep-$N.json
vercel api "/v13/deployments?teamId=$TEAM&forceNew=1" -X POST --input /tmp/dep-$N.json --raw | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('id'),d.get('url'),d.get('readyState') or d)"
