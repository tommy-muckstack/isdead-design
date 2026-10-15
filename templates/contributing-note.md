# Template note: CONTRIBUTING for the marketplace

The public marketplace repo (`tommy-muckstack/yourappisdead`) carries `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `.github/PULL_REQUEST_TEMPLATE.md` and the `submit-an-app.yml` issue form (label `app-request`).

When you add a new `<Product>IsDead`, copy the rules from that CONTRIBUTING.md into the app repo's own CONTRIBUTING.md and keep them in sync with `marketing-site.md` in this folder:

1. One page mirroring the original's homepage + `/login` + the app.
2. Own repo, shared Firebase auth, shared design system (`isdead-design`), own lookalike font.
3. Original assets only: no copied logos, art, copy or code. Product names only to say what we replace.
4. Free, MIT, mobile-first (360px), reduced-motion safe.
5. Add a tile to `apps.json` in the marketplace repo: `status` = `live` | `soon` | `community`; `repo` = public URL or `null` ("REPO COMING SOON"). Never link a private repo.
