# Deploying an IsDead app to yourappisdead.com/<slug>

Every app is its own public repo (`tommy-muckstack/<slug>`) and its own Vercel project (team `muckstack-projects`, auto-deploy on push to `main`). The root project `yourappisdead` proxies `/<slug>` and `/<slug>/*` to `https://<slug>.vercel.app/<slug>[/...]` via rewrites in `yourappisdead/vercel.json`. The login lives at `/<slug>/login` and uses the shared Firebase project `yourappisdead` (email/password + Google, shared `isdead_session` cookie).

Scripts live in `isdead-design/templates/` and use only the logged-in `vercel` and `gh` CLIs. Prereqs on the box: `~/.secrets/yourappisdead-sa.json` (Firebase Admin SDK key, mode 600) and `~/.secrets/cal.prod.env` (`vercel env pull ~/.secrets/cal.prod.env --environment=production` run in the calendlyisdead project dir; supplies the public NEXT_PUBLIC_FIREBASE_* values). Never print or commit these.

## 0. App requirements
- Serve everything under the base path `/<slug>` (Next.js: `basePath`; Vite: `base: '/<slug>/'`; static: files under `/<slug>/`). Pages: `/<slug>` (marketing, mirrors the original homepage), `/<slug>/login`, plus the app.
- Read Firebase config from `NEXT_PUBLIC_FIREBASE_{API_KEY,AUTH_DOMAIN,PROJECT_ID,APP_ID,MESSAGING_SENDER_ID,STORAGE_BUCKET}`; server session code uses `FIREBASE_SERVICE_ACCOUNT_JSON`. (Vite: `envPrefix: ['VITE_','NEXT_PUBLIC_FIREBASE_']`.)
- No secrets, keys, copied third-party assets or screenshots of the original product in the repo. Run `scan-secrets.sh <repo>` before the first push; fix history with `git filter-repo` if it flags anything real.
- README ends with the "Open source & contributing" section (copy from any existing app repo).

## 1. Create and push the GitHub repo
```bash
git -C <dir> branch -M main
gh repo create tommy-muckstack/<slug> --public --description "<desc>" --source <dir> --remote origin --push
```

## 2. Create the Vercel project and copy env
```bash
# framework: nextjs | vite | null ; rootDirectory: "." or e.g. "site"
templates/create-vercel-project.sh <slug> <slug> nextjs .
```
This creates the project linked to the GitHub repo, then runs `set-firebase-env.sh <slug>` (Production and Preview; the service account is stored as Secret, public values as Config). Run it **without** piping into `head`, or the env step is cut short. For static/Vite apps put `installCommand`, `buildCommand`, `outputDirectory` and rewrites for `/<slug>` in the repo's own `vercel.json` (see superhumanisdead).

## 3. Deploy
A new project does not build the existing commit by itself. Trigger it (also needed after any env change):
```bash
templates/trigger-deploy.sh <slug> <slug>
```
Check `https://<slug>.vercel.app/<slug>` and `/<slug>/login` return 200.

## 4. Route it from yourappisdead.com
Pull first (other agents edit the same files), then add to `yourappisdead/vercel.json` `rewrites`:
```json
{ "source": "/<slug>", "destination": "https://<slug>.vercel.app/<slug>" },
{ "source": "/<slug>/:path*", "destination": "https://<slug>.vercel.app/<slug>/:path*" }
```
In `apps.json` set `"repo": "https://github.com/tommy-muckstack/<slug>"` (and `status` to `live` when it really works). Small commit, push to `main`; verify `https://yourappisdead.com/<slug>` and `/<slug>/login`.

## 5. Firebase authorized domains
```bash
python3 templates/fb_admin.py add-domain <slug>.vercel.app
python3 templates/fb_admin.py domains
```
(Needed so Google sign-in popups and email links work on the vercel.app host. `yourappisdead.com` and `www` are already authorized.)

## 6. Smoke test sign-up and sign-in
```bash
node templates/smoke.mjs https://yourappisdead.com/<slug> <slug>     # creates a throwaway user, signs up and back in
python3 templates/fb_admin.py delete-user <printed email>              # always clean up
```
Google sign-in needs a real Google account and cannot be automated; click it once by hand.
