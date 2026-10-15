#!/usr/bin/env node
// Dump a design outline of a page: every visible block of height>80 at depth<=3 under body with bg colour, headings, buttons, fonts.
//  node scripts/outline.mjs <url> [vp=1440x900] [out.json] [--storage file]
import { chromium } from "playwright"; import fs from "node:fs";
const url = process.argv[2]; const [w, h] = (process.argv[3] || "1440x900").split("x").map(Number); const out = process.argv[4]?.endsWith(".json") ? process.argv[4] : null;
const si = process.argv.indexOf("--storage");
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: w, height: h }, storageState: si > 0 ? process.argv[si + 1] : undefined, locale: "en-US" });
const p = await ctx.newPage(); await p.goto(url, { waitUntil: "load", timeout: 45000 }).catch(() => { }); await p.waitForTimeout(2000);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } scrollTo(0, 0); });
await p.waitForTimeout(800);
const r = await p.evaluate(() => {
  const vis = e => { const s = getComputedStyle(e), b = e.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && b.width > 20 && b.height > 0; };
  const bgOf = e => { let n = e; while (n) { const c = getComputedStyle(n).backgroundColor; if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c; n = n.parentElement; } return "none"; };
  const rows = [];
  const walk = (e, d) => { for (const k of e.children) { if (!vis(k)) continue; const b = k.getBoundingClientRect(); if (b.height < 60) continue; const cs = getComputedStyle(k);
    const hs = [...k.querySelectorAll("h1,h2,h3")].slice(0, 4).map(x => x.innerText.trim().replace(/\s+/g, " ").slice(0, 70)); const btns = [...k.querySelectorAll("a,button")].filter(x => /btn|button|cta/i.test(x.className + x.getAttribute("role")) || x.tagName === "BUTTON").slice(0, 4).map(x => x.innerText.trim().slice(0, 28)).filter(Boolean);
    if (d <= 2 && (b.height > 200 || d < 1)) rows.push({ d, tag: k.tagName.toLowerCase(), cls: (k.className?.toString?.() || "").slice(0, 40), y: Math.round(b.y + scrollY), h: Math.round(b.height), x: Math.round(b.x), w: Math.round(b.width), bg: bgOf(k), radius: cs.borderRadius, font: cs.fontFamily.split(",")[0], hs, btns, imgs: k.querySelectorAll("img,svg,video,canvas").length });
    if (d < 2) walk(k, d + 1); } };
  walk(document.body, 0);
  const fonts = {}; for (const t of ["h1", "h2", "h3", "p", "a", "button"]) { const e = [...document.querySelectorAll(t)].find(vis); if (e) { const s = getComputedStyle(e); fonts[t] = [s.fontFamily.split(",")[0], s.fontSize, s.fontWeight, s.lineHeight, s.letterSpacing, s.color].join(" | "); } }
  return { title: document.title, height: document.documentElement.scrollHeight, bodyBg: getComputedStyle(document.body).backgroundColor, fonts, rows };
});
const txt = JSON.stringify(r, null, 1); if (out) fs.writeFileSync(out, txt); console.log(`${r.title} h=${r.height} bg=${r.bodyBg}`); console.log(r.fonts); for (const x of r.rows) console.log(`${"  ".repeat(x.d)}${x.tag}.${x.cls} y=${x.y} h=${x.h} x=${x.x} w=${x.w} bg=${x.bg} r=${x.radius} ${x.font} imgs=${x.imgs} ${x.hs.length ? "H:" + JSON.stringify(x.hs) : ""} ${x.btns.length ? "B:" + JSON.stringify(x.btns) : ""}`);
await b.close();
