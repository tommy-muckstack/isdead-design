#!/usr/bin/env node
// Measure an ORIGINAL page at 390px and dump a flow-free layout JSON: per-line text items, painted boxes, small inline SVG icons.
//   node scripts/m2json.mjs <url> <out.json> [--root "css selector"] [--minbox 12] [--wait 3000]
// Render with a tiny absolute-position component (see cleanshotxisdead/components/MeasuredPage.tsx).
import { chromium } from "playwright";
import fs from "node:fs";
const a = process.argv.slice(2); const [url, out] = a; const arg = (k, d) => { const i = a.indexOf("--" + k); return i < 0 ? d : a[i + 1]; };
const root = arg("root", "body"), minbox = +arg("minbox", 12), wait = +arg("wait", 3000);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mozilla/5.0 Mobile/15E148 Safari/604.1)".replace("like Mozilla/5.0 ", "like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 ") });
await p.goto(url, { waitUntil: "load", timeout: 60000 }).catch(() => {}); await p.waitForTimeout(wait);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } scrollTo(0, 0); });
await p.waitForTimeout(800);
const data = await p.evaluate(({ root, minbox }) => {
  const R = document.querySelector(root) || document.body; const items = []; const H = document.documentElement.scrollHeight;
  const vis = e => { const s = getComputedStyle(e); return s.display !== "none" && s.visibility !== "hidden" && +s.opacity > 0.02; };
  const transparent = c => !c || c === "transparent" || /rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)/.test(c);
  const abs = r => ({ x: +(r.x + scrollX).toFixed(1), y: +(r.y + scrollY).toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) });
  const all = [R, ...R.querySelectorAll("*")];
  for (const e of all) {
    if (!vis(e)) continue; const s = getComputedStyle(e); const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    let hidden = false; for (let q = e.parentElement; q && q !== document.body; q = q.parentElement) { if (!vis(q)) { hidden = true; break; } } if (hidden) continue;
    const bg = s.backgroundColor, bi = s.backgroundImage, hasBorder = ["Top", "Right", "Bottom", "Left"].some(k => parseFloat(s["border" + k + "Width"]) > 0 && !transparent(s["border" + k + "Color"]));
    if (e.tagName === "svg" || e.tagName === "IMG" || e.tagName === "VIDEO" || e.tagName === "CANVAS") {
      if (e.tagName === "svg" && r.width <= 220 && r.height <= 90 && !e.parentElement.closest("svg")) { const c = e.cloneNode(true); c.removeAttribute("class"); c.removeAttribute("style"); { const o = [e, ...e.querySelectorAll("*")], n = [c, ...c.querySelectorAll("*")]; o.forEach((oe, ix) => { const cs = getComputedStyle(oe), ne = n[ix]; if (!ne || ne === c) return; for (const [a, v] of [["fill", cs.fill], ["stroke", cs.stroke], ["stroke-width", cs.strokeWidth], ["opacity", cs.opacity], ["fill-opacity", cs.fillOpacity], ["stroke-linecap", cs.strokeLinecap], ["stroke-linejoin", cs.strokeLinejoin]]) if (v && v !== "none" || a === "fill" || a === "stroke") ne.setAttribute(a, v); ne.removeAttribute("class"); ne.removeAttribute("style"); }); } c.setAttribute("width", r.width); c.setAttribute("height", r.height); const col = s.color; items.push({ k: "svg", ...abs(r), svg: c.outerHTML.replace(/currentColor/g, col), z: 2 }); }
      else if (e.tagName !== "svg") items.push({ k: "img", ...abs(r), r: s.borderRadius !== "0px" ? s.borderRadius : undefined, z: 1, alt: e.getAttribute("alt") || "" });
      continue;
    }
    if (e.closest("svg")) continue;
    const clipText = (s.webkitBackgroundClip || s.backgroundClip) === "text";
    if (clipText) continue;
    if ((!transparent(bg) || (bi && bi !== "none") || hasBorder || s.boxShadow !== "none") && r.width >= minbox && r.height >= minbox) {
      items.push({ k: "b", ...abs(r), bg: transparent(bg) ? undefined : bg, bi: bi && bi !== "none" ? bi : undefined, bs: bi && bi !== "none" ? s.backgroundSize : undefined, bp: bi && bi !== "none" ? s.backgroundPosition : undefined, br: bi && bi !== "none" ? s.backgroundRepeat : undefined, bd: hasBorder ? `${s.borderTopWidth} solid ${s.borderTopColor}` : undefined, r: s.borderRadius !== "0px" ? s.borderRadius : undefined, sh: s.boxShadow !== "none" ? s.boxShadow : undefined, z: 0 });
    }
  }
  // painted ::before/::after boxes (card bands, glows)
  for (const e of all) {
    if (!vis(e)) continue; const er = e.getBoundingClientRect(); if (er.width < 1) continue;
    for (const ps of ["::before", "::after"]) {
      const s = getComputedStyle(e, ps); if (!s.content || s.content === "none" || s.display === "none") continue;
      const bg = s.backgroundColor, bi = s.backgroundImage; if (transparent(bg) && (!bi || bi === "none")) continue;
      const px = v => (v && v.endsWith("px") ? parseFloat(v) : null); let w = px(s.width), h = px(s.height); if (s.position !== "absolute" && s.position !== "fixed") continue;
      const l = px(s.left), r = px(s.right), t = px(s.top), bo = px(s.bottom);
      if (w == null) w = er.width - (l ?? 0) - (r ?? 0); if (h == null) h = er.height - (t ?? 0) - (bo ?? 0);
      const x = l != null ? er.left + l : er.right - (r ?? 0) - w, y = t != null ? er.top + t : er.bottom - (bo ?? 0) - h;
      if (w < minbox || h < minbox) continue;
      items.push({ k: "b", x: +(x + scrollX).toFixed(1), y: +(y + scrollY).toFixed(1), w: +w.toFixed(1), h: +h.toFixed(1), bg: transparent(bg) ? undefined : bg, bi: bi !== "none" ? bi : undefined, r: s.borderRadius !== "0px" ? s.borderRadius : undefined, z: -1 });
    }
  }
  // text: walk text nodes, group words into visual lines
  const tw = document.createTreeWalker(R, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const txt = n.textContent.replace(/\s+/g, " "); if (!txt.trim()) continue; const e = n.parentElement; if (!e || e.closest("svg,script,style,noscript") || !vis(e)) continue;
    let hid = false; for (let q = e; q && q !== document.body; q = q.parentElement) if (!vis(q)) { hid = true; break; } if (hid) continue;
    const s = getComputedStyle(e); const rng = document.createRange(); const words = []; let i = 0;
    for (const m of txt.matchAll(/\S+\s*/g)) { rng.setStart(n, m.index); rng.setEnd(n, m.index + m[0].replace(/\s+$/, "").length); const rs = [...rng.getClientRects()].filter(x => x.width > 0); if (rs.length) words.push({ t: m[0], r: rs[0], r2: rs[rs.length - 1] }); }
    let line = null; const lines = [];
    for (const w of words) { if (line && Math.abs(w.r.top - line.top) < 4) { line.t += w.t; line.right = w.r2.right; } else { line = { t: w.t, left: w.r.left, top: w.r.top, right: w.r2.right, h: w.r.height }; lines.push(line); } }
    const clip = (() => { for (let q = e; q && q !== document.body; q = q.parentElement) { const o = getComputedStyle(q); if (o.overflowX === "hidden" || o.overflowX === "clip" || o.overflowY === "hidden" || o.overflowY === "clip") { const qr = q.getBoundingClientRect(); if (qr.width < 400 || qr.height < 2 || o.overflowY === "hidden") return qr; } } return null; })();
    for (const l of lines) {
      if (clip && (l.left >= clip.right - 1 || l.right <= clip.left + 1 || l.top >= clip.bottom - 1 || l.top + l.h <= clip.top + 1)) continue;
      const tt = (s.textTransform === "uppercase" ? l.t.toUpperCase() : l.t).replace(/\s+$/, "");
      items.push({ k: "t", x: +(l.left + scrollX).toFixed(1), y: +(l.top + scrollY).toFixed(1), w: +(l.right - l.left).toFixed(1), h: +l.h.toFixed(1), fs: s.fontSize, lh: s.lineHeight === "normal" ? l.h + "px" : s.lineHeight, fw: s.fontWeight, c: (/rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)|transparent/.test(s.color) ? "rgb(22,22,24)" : s.color), ls: s.letterSpacing === "normal" ? undefined : s.letterSpacing, ff: s.fontFamily.split(",")[0].replace(/["']/g, "").trim(), ta: s.textAlign, td: s.textDecorationLine !== "none" ? s.textDecorationLine : undefined, fi: s.fontStyle === "italic" ? 1 : undefined, t: tt, href: e.closest("a") ? 1 : undefined, z: 3 });
    }
  }
  const rb = getComputedStyle(document.body).backgroundColor;
  return { H, bg: rb, items };
}, { root, minbox });
fs.writeFileSync(out, JSON.stringify(data));
console.log(out, "H", data.H, "items", data.items.length, "text", data.items.filter(i => i.k === "t").length, "boxes", data.items.filter(i => i.k === "b").length, "svg", data.items.filter(i => i.k === "svg").length, "img", data.items.filter(i => i.k === "img").length);
await b.close();
