#!/usr/bin/env python3
"""authed-session.py <base-url> <cookiejar-out>  — creates a throwaway Firebase user, exchanges the ID token at <base>/api/session
and writes the isdead_session cookie to a curl cookie jar. Prints the email (delete it with fb_admin.py delete-user, or the cleanup script)."""
import sys, json, time, urllib.request, os
env = dict(l.rstrip("\n").split("=", 1) for l in open(os.path.expanduser("~/.secrets/cal.prod.env")) if "=" in l)
key = env["NEXT_PUBLIC_FIREBASE_API_KEY"].strip('"'); base, jar = sys.argv[1], sys.argv[2]
email = f"isdead-smoke-api-{int(time.time()*1000)}@example.com"
req = urllib.request.Request(f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={key}", json.dumps({"email": email, "password": "Smoke-Api9-Aa1!", "returnSecureToken": True}).encode(), {"content-type": "application/json", "referer": "https://yourappisdead.com/"})
tok = json.load(urllib.request.urlopen(req))["idToken"]
r = urllib.request.Request(base + "/api/session", json.dumps({"idToken": tok}).encode(), {"content-type": "application/json"})
resp = urllib.request.urlopen(r); sc = resp.headers.get("set-cookie", "")
val = sc.split("isdead_session=")[1].split(";")[0]
open(jar, "w").write(f"# Netscape HTTP Cookie File\n#HttpOnly_yourappisdead.com\tFALSE\t/\tTRUE\t0\tisdead_session\t{val}\n")
print(email)
