#!/usr/bin/env bash
# Usage: scan-secrets.sh <repo-dir>  — greps full git history for secrets; prints file:pattern only, never values.
set -uo pipefail
cd "${1:?repo}"
PAT='(AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY-----|"private_key_id"|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk_live_[0-9A-Za-z]{10,}|sk-[A-Za-z0-9]{32,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|vercel_[A-Za-z0-9]{20,}|(password|passwd|secret|api_?key|token)["'"'"' ]*[:=]["'"'"' ]*[A-Za-z0-9/+_-]{16,})'
hits=0
for c in $(git rev-list --all); do
  git grep -I -l -E -i "$PAT" "$c" -- . ':!package-lock.json' 2>/dev/null
done | sed 's/^[0-9a-f]*://' | sort | uniq -c | sort -rn
echo "--- tracked files that look like env / key files:"
git log --all --name-only --pretty=format: | sort -u | rg -i '(^|/)\.env($|\.)|serviceaccount|adminsdk|\.pem$|\.p12$|\.key$|id_rsa|credentials' | rg -v '\.example$' 
echo "--- largest blobs (third-party assets check):"
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectsize) %(rest)' | awk '$1=="blob"&&$2>300000{print $2,$3}' | sort -rn | head -8
