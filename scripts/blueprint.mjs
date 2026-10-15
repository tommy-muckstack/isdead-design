#!/usr/bin/env node
// blueprint.mjs <url> [vp] [out.txt] : flat y-ordered list of headings, buttons, images, inputs, links (nav/footer), plus computed styles.
import { chromium } from "playwright"; import fs from "node:fs";
const url = process.argv[2]; const [w, h] = (process.argv[3] || "1440x900").split("x").map(Number); const out = process.argv[4];
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: w, height: h }, locale: "en-US", userAgent: w < 500 ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1" : undefined, isMobile: w < 500 });
const p = await ctx.newPage(); await p.goto(url, { waitUntil: "load", timeout: 45000 }).catch(() => { }); await p.waitForTimeout(2500);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } scrollTo(0, 0); });
await p.waitForTimeout(800);
const r = await p.evaluate(() => {
  const vis = e => { const s = getComputedStyle(e), b = e.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && b.width > 4 && b.height > 4 && s.opacity !== "0"; };
  const bgOf = e => { let n = e; while (n) { const s = getComputedStyle(n); const c = s.backgroundColor; if (s.backgroundImage !== "none" && s.backgroundImage.includes("gradient")) return s.backgroundImage.slice(0, 80); if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c; n = n.parentElement; } return "none"; };
  const rows = []; const box = e => { const b = e.getBoundingClientRect(); return { y: Math.round(b.y + scrollY), x: Math.round(b.x), w: Math.round(b.width), h: Math.round(b.height) }; };
  for (const e of document.querySelectorAll("h1,h2,h3,h4,h5,p,a,button,img,svg,video,input,li,summary,label")) {
    if (!vis(e)) continue; const bx = box(e); const s = getComputedStyle(e); const t = e.tagName.toLowerCase();
    if (t === "svg" && (bx.w < 24 && bx.h < 24)) continue; if (t === "svg" && e.closest("a,button") ) continue;
    let txt = (e.innerText || "").trim().replace(/\s+/g, " ").slice(0, 80);
    if ((t === "li" || t === "p" || t === "a" || t === "label") && !txt) continue; if (t === "li" && e.querySelector("a,button,p,h1,h2,h3,h4")) continue; if (t === "p" && e.querySelector("a,button")) { }
    if (t === "a" && e.querySelector("h1,h2,h3,h4,p,img") && bx.h > 120) continue;
    rows.push({ t, ...bx, txt, fs: s.fontSize, fw: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing, c: s.color, bg: (t === "a" || t === "button" || t === "input") ? bgOf(e) : undefined, r: s.borderTopLeftRadius, bd: parseFloat(s.borderTopWidth) ? s.borderTopWidth + " " + s.borderTopColor : undefined, ff: s.fontFamily.split(",")[0].replace(/"/g, ""), src: (t === "img") ? (e.currentSrc || e.src || "").split("/").pop().slice(0, 40) : undefined });
  }
  rows.sort((a, b) => a.y - b.y || a.x - b.x);
  const bands = []; // section-ish blocks: any element w>=0.9*vw height>=200 with its own bg
  for (const e of document.querySelectorAll("body div,section,header,footer,main,nav,aside")) { if (!vis(e)) continue; const bx = box(e); if (bx.h < 120 || bx.w < innerWidth * 0.6) continue; const s = getComputedStyle(e); const bg = s.backgroundColor !== "rgba(0, 0, 0, 0)" ? s.backgroundColor : (s.backgroundImage !== "none" ? s.backgroundImage.slice(0, 90) : null); if (bg || parseFloat(s.borderTopLeftRadius) > 10) bands.push({ ...bx, bg, r: s.borderTopLeftRadius, tag: e.tagName.toLowerCase(), cls: (e.className?.toString?.() || "").slice(0, 30) }); }
  bands.sort((a, b) => a.y - b.y || b.h - a.h);
  return { title: document.title, H: document.documentElement.scrollHeight, bodyBg: getComputedStyle(document.body).backgroundColor, rows, bands, fonts: [...document.fonts].filter(f => f.status === "loaded").map(f => f.family + " " + f.weight) };
});
let o = `# ${r.title} H=${r.H} body=${r.bodyBg}\nfonts: ${[...new Set(r.fonts)].join(", ")}\n## bands\n`;
for (const x of r.bands) o += `y=${x.y} h=${x.h} x=${x.x} w=${x.w} bg=${x.bg} r=${x.r} ${x.tag}.${x.cls}\n`;
o += "## items\n";
for (const x of r.rows) { if (x.t === "p" || x.t === "li" || x.t === "label") { o += `${x.t} y=${x.y} x=${x.x} w=${x.w} h=${x.h} ${x.fs}/${x.lh}/${x.fw} ${x.c} "${x.txt}"\n`; continue; }
  o += `${x.t} y=${x.y} x=${x.x} w=${x.w} h=${x.h} ${x.fs}/${x.lh}/${x.fw}${x.ls !== "normal" ? " ls" + x.ls : ""} ${x.ff} ${x.c}${x.bg ? " bg=" + x.bg : ""}${x.r !== "0px" ? " r=" + x.r : ""}${x.bd ? " bd=" + x.bd : ""}${x.src ? " src=" + x.src : ""} "${x.txt}"\n`; }
if (out) fs.writeFileSync(out, o); else console.log(o); await b.close();
