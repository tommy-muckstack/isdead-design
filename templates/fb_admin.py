#!/usr/bin/env python3
"""Firebase Auth admin helper using the service account JSON (never prints secrets).
  fb_admin.py domains            -> list authorized domains
  fb_admin.py add-domain HOST... -> add authorized domains
  fb_admin.py delete-user EMAIL  -> delete an Auth user (test cleanup)
  fb_admin.py purge-smoke [--dry] -> delete every throwaway smoke account (smoke+*@example.com / isdead-smoke-*@example.com)
"""
import json, sys, time, base64, os, requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
SA = json.load(open(os.environ.get("SA_JSON", os.path.expanduser("~/.secrets/yourappisdead-sa.json"))))
def b64(b): return base64.urlsafe_b64encode(b).rstrip(b"=")
def token():
    now = int(time.time())
    h = b64(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    c = b64(json.dumps({"iss": SA["client_email"], "scope": "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/identitytoolkit",
                        "aud": SA["token_uri"], "iat": now, "exp": now + 3000}).encode())
    key = serialization.load_pem_private_key(SA["private_key"].encode(), None)
    sig = b64(key.sign(h + b"." + c, padding.PKCS1v15(), hashes.SHA256()))
    r = requests.post(SA["token_uri"], data={"grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer", "assertion": (h + b"." + c + b"." + sig).decode()})
    r.raise_for_status(); return r.json()["access_token"]
P = SA["project_id"]
H = {"Authorization": "Bearer " + token(), "x-goog-user-project": P}
cfg = f"https://identitytoolkit.googleapis.com/admin/v2/projects/{P}/config"
cmd = sys.argv[1]
if cmd in ("domains", "add-domain"):
    r = requests.get(cfg, headers=H); 
    if r.status_code != 200: print("GET config failed", r.status_code, r.text[:300]); sys.exit(1)
    d = r.json().get("authorizedDomains", [])
    if cmd == "add-domain":
        new = sorted(set(d) | set(sys.argv[2:]))
        if new != sorted(d):
            r = requests.patch(cfg + "?updateMask=authorizedDomains", headers=H, json={"authorizedDomains": new})
            if r.status_code != 200: print("PATCH failed", r.status_code, r.text[:300]); sys.exit(1)
            d = r.json().get("authorizedDomains", new)
    print("\n".join(d))
elif cmd == "delete-user":
    r = requests.post(f"https://identitytoolkit.googleapis.com/v1/projects/{P}/accounts:lookup", headers=H, json={"email": [sys.argv[2]]})
    us = r.json().get("users", [])
    for u in us:
        x = requests.post(f"https://identitytoolkit.googleapis.com/v1/projects/{P}/accounts:delete", headers=H, json={"localId": u["localId"]}); print("deleted", x.status_code)
    if not us: print("no such user", r.status_code, r.text[:200])
elif cmd == "purge-smoke":
    import re
    pat = re.compile(r"^(smoke[+-][^@]*|isdead-smoke-[^@]*)@example\.com$", re.I)
    tok, hits = None, []
    while True:
        r = requests.get(f"https://identitytoolkit.googleapis.com/v1/projects/{P}/accounts:batchGet", headers=H, params={"maxResults": 500, **({"nextPageToken": tok} if tok else {})})
        if r.status_code != 200: print("batchGet failed", r.status_code, r.text[:200]); sys.exit(1)
        j = r.json(); hits += [(u["localId"], u.get("email", "")) for u in j.get("users", []) if pat.match(u.get("email", ""))]
        tok = j.get("nextPageToken")
        if not tok: break
    for lid, em in hits:
        if "--dry" in sys.argv: print("would delete", em); continue
        x = requests.post(f"https://identitytoolkit.googleapis.com/v1/projects/{P}/accounts:delete", headers=H, json={"localId": lid}); print("deleted", em, x.status_code)
    print(len(hits), "matched")
