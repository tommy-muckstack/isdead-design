#!/usr/bin/env node
// Visual parity QA: capture an ORIGINAL site and our CLONE at identical viewports, diff them,
// write side-by-side PNGs + report.{json,md} to /workspace/isdead-shots/parity/<app>/.
//
//  node scripts/parity.mjs --app calendlyisdead \
//     --orig https://calendly.com --clone http://localhost:3200/calendlyisdead \
//     --pages "home=/,login=/login,pricing=/pricing" [--viewports 1440x900,390x844] [--full] [--out DIR]
//  node scripts/parity.mjs --config parity/calendly.json        (see templates/parity-qa.md for the schema)
//
// Page spec: name=/path (same path on both) or name=/origPath->/clonePath
// Config pages may add { actions:[{click:"text=Log in"},{fill:["input[name=email]","a@b.c"]},{wait:500},{press:"Escape"},{hover:"sel"}], full:false, origUrl:"https://…", cloneUrl:"…" }
// Exit code 0 always; the report carries the numbers. Use --min 85 to exit 1 when any page scores below 85.
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2); const arg = (k, d) => { const i = argv.indexOf("--" + k); return i < 0 ? d : (argv[i + 1]?.startsWith("--") || argv[i + 1] === undefined ? true : argv[i + 1]); };
let cfg = {};
if (arg("config")) cfg = JSON.parse(fs.readFileSync(arg("config"), "utf8"));
const app = arg("app", cfg.app || "app");
const ORIG = (arg("orig", cfg.orig) || "").replace(/\/$/, ""), CLONE = (arg("clone", cfg.clone) || "").replace(/\/$/, "");
const viewports = String(arg("viewports", cfg.viewports?.join(",") || "1440x900,390x844")).split(",").map(v => { const [w, h] = v.split("x").map(Number); return { w, h: h || 900 }; });
const outDir = arg("out", cfg.out || `/workspace/isdead-shots/parity/${app}`);
const fullDefault = !!(arg("full", cfg.full ?? false));
const block = (arg('block', cfg.block?.join(',') || '')||'').split(',').filter(Boolean); // URL substrings to abort on the ORIGINAL (e.g. statsig to freeze A/B variants)
const globalMust = (arg('orig-must', cfg.origMust || null) || null); // text/selector that must be visible on the ORIGINAL; contexts are retried (A/B experiments assign a random variant per visitor)
const reuse = !!arg('reuse-orig', false); // skip re-capturing originals that already exist in the out dir (fast clone-only iteration)
const only = arg("only", null)?.split(",");
const hideCss = (cfg.hideCss || "") + `
 *,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}
 nextjs-portal,[data-nextjs-toast],[id*=intercom]:not(html):not(body),[class*=intercom]:not(html):not(body),iframe[title*=hat i],#onetrust-consent-sdk,[id*=drift]:not(html):not(body),[class*=cookie-banner]:not(html):not(body){display:none!important}`;
let pages = cfg.pages || String(arg("pages", "home=/")).split(",").map(s => { const [name, rest] = s.split("="); const [o, c] = rest.split("->"); return { name, orig: o, clone: c || o }; });
if (only) pages = pages.filter(p => only.includes(p.name));
fs.mkdirSync(outDir, { recursive: true });

async function run(page, actions = []) {
  for (const a of actions) {
    if (a.click) await page.locator(a.click).first().click({ timeout: 8000 }).catch(e => console.warn("  action click failed:", a.click));
    else if (a.fill) await page.locator(a.fill[0]).first().fill(a.fill[1]).catch(() => console.warn("  fill failed", a.fill[0]));
    else if (a.press) await page.keyboard.press(a.press);
    else if (a.hover) await page.locator(a.hover).first().hover().catch(() => { });
    else if (a.wait) await page.waitForTimeout(a.wait);
    else if (a.goto) await page.goto(a.goto, { waitUntil: "load", timeout: 45000 });
  }
}
async function settle(page, full, keepAnim) {
  await page.addStyleTag({ content: keepAnim ? hideCss.replace(/\*,\*::before,\*::after\{animation:none[^}]*\}/, '') : hideCss }).catch(() => { });
  await page.evaluate(() => document.fonts?.ready).catch(() => { });
  if (full) { // trigger lazy content
    await page.evaluate(async ({ step, dwell }) => { for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, dwell)); } window.scrollTo(0, 0); }, { step: cfg.scrollStep || 500, dwell: cfg.scrollDwell || 60 });
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(500);
}
async function shot(browser, url, vp, file, p, storage, full, isOrig) {
  const pm = p.origMust ?? globalMust; const must = pm && typeof pm === 'object' ? pm[vp.w] : pm;
  const tries = isOrig && must ? 10 : 1; let last; // origMust: string, or {"1440":"text","390":null} per viewport
  for (let t = 0; t < tries; t++) { last = await shot1(browser, url, vp, file, p, storage, full, isOrig, t === tries - 1 ? null : must); if (last) return last; console.log("   variant retry", t + 1); }
  return last;
}
async function shot1(browser, url, vp, file, p, storage, full, isOrig, mustNow) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, isMobile: vp.w < 500, hasTouch: vp.w < 500, storageState: storage || undefined, locale: "en-US", timezoneId: "America/New_York",
    userAgent: (isOrig && cfg.origDefaultUA && vp.w >= 500) ? undefined : vp.w < 500 ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36" });
  const page = await ctx.newPage();
  if (isOrig && block.length) await page.route('**/*', r => block.some(b => r.request().url().includes(b)) ? r.abort() : r.continue());
  let status = 0;
  try { const r = await page.goto(url, { waitUntil: "load", timeout: 45000 }); status = r?.status() || 0; await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => { }); await page.waitForTimeout(2500); } catch (e) { try { await page.waitForTimeout(1500); } catch { } }
  await run(page, p.actions);
  if (mustNow) await page.waitForTimeout(1500);
  if (mustNow && !(await page.locator(mustNow.startsWith('text=') || /[.#\[]/.test(mustNow) ? mustNow : 'text=' + mustNow).first().isVisible().catch(() => false))) { await ctx.close(); return null; }
  await settle(page, full, p.keepAnim || (isOrig && cfg.origKeepAnim));
  if (cfg.clampX || p.clampX) { await page.addStyleTag({ content: 'html,body{overflow-x:clip!important;max-width:100vw!important}' }).catch(() => { }); await page.waitForTimeout(300); }
  await page.screenshot({ path: file, fullPage: full });
  if (cfg.clampX || p.clampX) { const im = PNG.sync.read(fs.readFileSync(file)); if (im.width > vp.w) { const o = new PNG({ width: vp.w, height: im.height }); PNG.bitblt(im, o, 0, 0, vp.w, im.height, 0, 0); fs.writeFileSync(file, PNG.sync.write(o)); } }
  const m = await page.evaluate(() => ({ title: document.title, scrollW: document.documentElement.scrollWidth, innerW: innerWidth })).catch(() => ({}));
  await ctx.close(); return { status, ...m };
}
const png = f => PNG.sync.read(fs.readFileSync(f));
function pad(img, W, H) { const o = new PNG({ width: W, height: H }); o.data.fill(255); PNG.bitblt(img, o, 0, 0, img.width, img.height, 0, 0); return o; }
async function coarse(a, b) { // similarity of 24px-blurred downsamples = layout/colour closeness, tolerant of text AA
  const g = async img => sharp(PNG.sync.write(img)).resize(Math.round(img.width / 8), Math.round(img.height / 8), { fit: "fill" }).blur(2).raw().toBuffer();
  const [x, y] = await Promise.all([g(a), g(b)]); let s = 0; for (let i = 0; i < x.length; i++) s += Math.abs(x[i] - y[i]); return 100 * (1 - s / x.length / 255);
}
const browser = await chromium.launch();
const results = [];
for (const p of pages) for (const vp of viewports) {
  const key = `${p.name}-${vp.w}`; const full = p.full ?? fullDefault;
  const fo = path.join(outDir, `${key}-orig.png`), fc = path.join(outDir, `${key}-clone.png`);
  console.log("▶", key);
  const oU = p.origUrl || ORIG + p.orig, cU = p.cloneUrl || CLONE + p.clone;
  const mo = reuse && fs.existsSync(fo) ? { status: 200 } : await shot(browser, oU, vp, fo, p, cfg.origStorage, full, true);
  const mc = await shot(browser, cU, vp, fc, p, cfg.cloneStorage, full, false);
  let a = png(fo), b = png(fc);
  const W = Math.max(a.width, b.width), H = Math.max(a.height, b.height);
  a = pad(a, W, H); b = pad(b, W, H);
  const d = new PNG({ width: W, height: H });
  const diffPx = pixelmatch(a.data, b.data, d.data, W, H, { threshold: 0.04, includeAA: false, diffColor: [255, 0, 80], alpha: 0.25 });
  const diffPct = 100 * diffPx / (W * H);
  const sim = await coarse(a, b);
  const hRatio = Math.min(a.height, b.height) / Math.max(a.height, b.height);
  const origH = png(fo).height, cloneH = png(fc).height;
  // Content-normalised diff: white-space-heavy pages must not score high just because both are mostly background.
  const modal = img => { const c = new Map(); for (let i = 0; i < img.data.length; i += 4 * 37) { const k = (img.data[i] << 16) | (img.data[i + 1] << 8) | img.data[i + 2]; c.set(k, (c.get(k) || 0) + 1); } return [...c.entries()].sort((x, y) => y[1] - x[1])[0][0]; };
  const mA = modal(a), mB = modal(b); let content = 0;
  for (let i = 0; i < a.data.length; i += 4) { const ka = (a.data[i] << 16) | (a.data[i + 1] << 8) | a.data[i + 2], kb = (b.data[i] << 16) | (b.data[i + 1] << 8) | b.data[i + 2]; if (ka !== mA || kb !== mB) content++; }
  const contentDiffPct = Math.min(100, 100 * diffPx / Math.max(content, W * H * 0.02));
  const bad = mc.status >= 400 || mc.status === 0;
  const widthOverflow = png(fc).width > vp.w;
  const hPenalty = full ? Math.min(origH, cloneH) / Math.max(origH, cloneH) : 1;
  const score = bad ? 0 : Math.round(Math.max(0, (0.35 * sim + 0.65 * (100 - contentDiffPct)) * (0.5 + 0.5 * hPenalty) - (widthOverflow ? 10 : 0)) * 10) / 10;
  fs.writeFileSync(path.join(outDir, `${key}-diff.png`), PNG.sync.write(d));
  // side-by-side: orig | clone | diff with labels
  const lab = t => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="34"><rect width="100%" height="100%" fill="#111"/><text x="12" y="23" font-family="monospace" font-size="16" fill="#fff">${t}</text></svg>`);
  const col = async (f, t) => sharp({ create: { width: W, height: H + 34, channels: 3, background: "#fff" } }).composite([{ input: lab(t), top: 0, left: 0 }, { input: f, top: 34, left: 0 }]).png().toBuffer();
  const cols = [await col(PNG.sync.write(a), `ORIGINAL ${oU}`), await col(PNG.sync.write(b), `CLONE ${cU}`), await col(PNG.sync.write(d), `DIFF ${diffPct.toFixed(2)}%`)];
  const side = sharp({ create: { width: W * 3 + 20, height: H + 34, channels: 3, background: "#444" } }).composite(cols.map((c, i) => ({ input: c, left: i * (W + 10), top: 0 })));
  await side.png().toFile(path.join(outDir, `${key}-side.png`));
  results.push({ page: p.name, viewport: `${vp.w}x${vp.h}`, full, origStatus: mo.status, cloneStatus: mc.status, origSize: [png(fo).width, origH], cloneSize: [png(fc).width, cloneH], diffPct: +diffPct.toFixed(2), coarseSimilarity: +sim.toFixed(1), score, note: bad ? `clone returned ${mc.status}` : undefined, contentDiffPct: +contentDiffPct.toFixed(1), hOverflowClone: widthOverflow || (mc.scrollW || 0) > (mc.innerW || 0) });
  console.log(`   score ${score}  diff ${diffPct.toFixed(2)}%  coarse ${sim.toFixed(1)}%  orig ${a.width}x${origH} clone ${cloneH}`);
}
await browser.close();
const stamp = new Date().toISOString();
fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify({ app, stamp, orig: ORIG, clone: CLONE, results }, null, 2));
const md = [`# Parity report: ${app}`, `${stamp}  orig=${ORIG}  clone=${CLONE}`, "", "| page | viewport | score | pixel diff % | coarse sim % | orig size | clone size | content diff % | clone h-overflow |", "|---|---|---|---|---|---|---|---|---|",
  ...results.map(r => `| ${r.page} | ${r.viewport} | **${r.score}** | ${r.diffPct} | ${r.coarseSimilarity} | ${r.origSize.join("x")} | ${r.cloneSize.join("x")} | ${r.contentDiffPct} | ${r.hOverflowClone ? "YES" : "no"} |`),
  "", `Average score: **${(results.reduce((s, r) => s + r.score, 0) / (results.length || 1)).toFixed(1)}**`, "", "Files: `<page>-<vp>-{orig,clone,diff,side}.png`"].join("\n");
fs.writeFileSync(path.join(outDir, "report.md"), md); console.log("\n" + md);
const min = Number(arg("min", 0)); if (min && results.some(r => r.score < min)) process.exit(1);
