#!/usr/bin/env bash
# Usage: deploy-status.sh slug...  — latest production deployment state per project
for s in "$@"; do vercel api "/v6/deployments?teamId=team_q4DHxZibjxQOtPUwW1fNUfmG&app=$s&limit=1&target=production" --raw 2>/dev/null | python3 -c "import sys,json;d=json.load(sys.stdin)['deployments'];print('$s',d[0]['state'] if d else 'none')"; done
