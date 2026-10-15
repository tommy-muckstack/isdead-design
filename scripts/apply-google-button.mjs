#!/usr/bin/env node
// Applies the official "Sign in with Google" button to an IsDead Next.js app repo.
//   node scripts/apply-google-button.mjs /workspace/<app>isdead
// 1. syncs css/components.css, src/google.tsx, assets/google/**, fonts/google/** into <repo>/vendor/isdead-design/
// 2. makes vendor src/index.tsx re-export ./google
// 3. rewrites components/LoginForm.tsx so the Google button is <GoogleButton/> (pill only when the theme's button radius is 9999px)
// Idempotent. Does not run git; stage the changed files yourself.
import fs from "node:fs"; import path from "node:path";
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const repo = path.resolve(process.argv[2] ?? "");
if (!fs.existsSync(`${repo}/vendor/isdead-design`)) { console.error("no vendor/isdead-design in", repo); process.exit(1); }
const V = `${repo}/vendor/isdead-design`;
const copy = (rel) => { const s = `${root}/${rel}`, d = `${V}/${rel}`; fs.mkdirSync(path.dirname(d), { recursive: true }); fs.cpSync(s, d, { recursive: true }); };
for (const rel of ["css/components.css", "src/google.tsx", "assets/google", "fonts/google", "scripts/build-google-logo.mjs"]) copy(rel);
const idx = `${V}/src/index.tsx`;
if (fs.existsSync(idx) && !/export \* from "\.\/google"/.test(fs.readFileSync(idx, "utf8"))) fs.appendFileSync(idx, '\nexport * from "./google";\n');
const lf = `${repo}/components/LoginForm.tsx`;
let src = fs.readFileSync(lf, "utf8");
const layout = fs.readFileSync(`${repo}/app/layout.tsx`, "utf8");
const theme = (layout.match(/css\/([a-z0-9]+)\.css/g) || []).map(m => m.slice(4, -4)).find(t => t !== "components");
const themeCss = theme && fs.existsSync(`${V}/css/${theme}.css`) ? fs.readFileSync(`${V}/css/${theme}.css`, "utf8") : "";
const pill = /control-button-radius:\s*9999px/.test(themeCss);
const re = /<(button|Button)\b[^>]*?onClick=\{\(\) => run\(async \(\) => \{ await signInWithGoogle\(config, session\); done\(\); \}\)\}[^>]*>Continue with Google<\/\1>/;
if (re.test(src)) {
  src = src.replace(re, `<GoogleButton block${pill ? ' shape="pill"' : ""} disabled={busy} onClick={() => run(async () => { await signInWithGoogle(config, session); done(); })} />`);
  const imp = 'import { GoogleButton } from "@/vendor/isdead-design/src/google";\n';
  if (!src.includes(imp)) src = src.replace(/(import [^\n]*\n)(?!import)/, `$1${imp}`);
  fs.writeFileSync(lf, src); console.log("rewrote", lf, "theme", theme, pill ? "pill" : "rect");
} else console.log(src.includes("<GoogleButton") ? "LoginForm already uses GoogleButton" : "!! LoginForm google button pattern not found: edit by hand");
