#!/usr/bin/env node
// Dump the exact computed styles + layout boxes of a live page so the clone can be matched numerically.
//  node scripts/extract-styles.mjs https://calendly.com/ [--vp 1440x900] [--out file.json] [--full-dom]
// Output: { fonts:[…], palette:{color,bg,border counts}, type scale, radii, shadows, sections:[{tag,cls,box,bg,children…}], landmarks:{nav,h1,buttons,…} }
import { chromium } from "playwright"; import fs from "node:fs";
const url = process.argv[2]; const a = process.argv.slice(3); const g = (k, d) => { const i = a.indexOf("--" + k); return i < 0 ? d : a[i + 1]; };
const [w, h] = String(g("vp", "1440x900")).split("x").map(Number); const out = g("out", null);
const must = g("must", null); const b = await chromium.launch(); let ctx, p;
for (let t = 0; t < 10; t++) { // --must "text": retry fresh contexts until an A/B variant containing the text is visible
  ctx = await b.newContext({ viewport: { width: w, height: h || 900 }, userAgent: w < 500 ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36", isMobile: w < 500 });
  p = await ctx.newPage(); await p.goto(url, { waitUntil: "load", timeout: 45000, timeout: 60000 }).catch(() => { }); await p.waitForTimeout(1500);
  if (!must || await p.locator("text=" + must).first().isVisible().catch(() => false)) break; await ctx.close(); }
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } scrollTo(0, 0); });
const data = await p.evaluate(() => {
  const cs = e => getComputedStyle(e), vis = e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && cs(e).visibility !== "hidden" && cs(e).display !== "none"; };
  const tally = (m, k) => { if (k && k !== "rgba(0, 0, 0, 0)" && k !== "none" && k !== "0px") m[k] = (m[k] || 0) + 1; };
  const color = {}, bg = {}, border = {}, radius = {}, shadow = {}, fonts = {}, sizes = {};
  const els = [...document.querySelectorAll("body *")].filter(vis);
  for (const e of els) { const s = cs(e); const hasText = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (hasText) { tally(color, s.color); const f = `${s.fontFamily.split(",")[0].replace(/["']/g, "")} ${s.fontWeight}`; fonts[f] = (fonts[f] || 0) + 1; const k = `${s.fontSize}/${s.lineHeight} ls ${s.letterSpacing}`; sizes[k] = (sizes[k] || 0) + 1; }
    tally(bg, s.backgroundColor); if (s.backgroundImage !== "none") tally(bg, s.backgroundImage.slice(0, 160));
    if (parseFloat(s.borderTopWidth) > 0) tally(border, `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`);
    tally(radius, s.borderTopLeftRadius); tally(shadow, s.boxShadow); }
  const box = e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
  const style = (e, ks) => { const s = cs(e); const o = {}; for (const k of ks) o[k] = s[k]; return o; };
  const K = ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color", "backgroundColor", "backgroundImage", "borderRadius", "border", "boxShadow", "padding", "margin", "textAlign", "display", "gap", "maxWidth"];
  const pick = (e, depth = 0) => ({ tag: e.tagName.toLowerCase(), cls: (e.className?.toString?.() || "").slice(0, 80), text: (e.children.length === 0 ? e.textContent.trim().slice(0, 90) : undefined), box: box(e), style: style(e, K), kids: depth < 2 ? [...e.children].filter(vis).slice(0, 14).map(c => pick(c, depth + 1)) : undefined });
  const top = [...(document.querySelector("main")?.children || document.body.children)].filter(vis);
  const lm = {};
  for (const [k, sel] of Object.entries({ banner: "[class*=banner i],[class*=announcement i]", nav: "header,nav", h1: "h1", h2: "h2", primaryBtn: "a[class*=button i],button", input: "input", footer: "footer" })) { const e = document.querySelector(sel); if (e) lm[k] = pick(e, 1); }
  const interactive = [...document.querySelectorAll("a,button")].filter(vis).slice(0, 60).map(e => ({ text: e.textContent.trim().slice(0, 40), box: box(e), style: style(e, ["fontSize", "fontWeight", "color", "backgroundColor", "border", "borderRadius", "padding", "height"]) }));
  const headings = [...document.querySelectorAll("h1,h2,h3,h4")].filter(vis).map(e => ({ tag: e.tagName, text: e.textContent.trim().slice(0, 90), box: box(e), style: style(e, ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color"]) }));
  const top3 = o => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 14);
  return { title: document.title, pageH: document.documentElement.scrollHeight, bodyBg: cs(document.body).backgroundColor, bodyFont: cs(document.body).fontFamily,
    fontFaces: [...document.fonts].map(f => `${f.family} ${f.weight} ${f.status}`), fonts: top3(fonts), typeScale: top3(sizes), textColors: top3(color), backgrounds: top3(bg), borders: top3(border), radii: top3(radius), shadows: top3(shadow),
    sections: top.map(e => pick(e, 0)), landmarks: lm, headings, interactive };
});
await b.close(); const j = JSON.stringify(data, null, 1); if (out) { fs.writeFileSync(out, j); console.log("wrote", out, j.length); } else console.log(j);
