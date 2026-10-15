#!/usr/bin/env node
// node scripts/ypos.mjs <url> [vp=1440x900] "text1" "text2" ...  -> prints y/height of the smallest element containing each text (after slow scroll)
import { chromium } from "playwright";
const [url, vp, ...texts] = process.argv.slice(2); const [w, h] = (vp || "1440x900").split("x").map(Number);
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: w, height: h }, locale: "en-US", deviceScaleFactor:1, isMobile: w<500, hasTouch: w<500, userAgent: w<500?"Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1":undefined }); const p = await c.newPage();
await p.goto(url, { waitUntil: "load", timeout: 45000 }).catch(() => { }); await p.waitForTimeout(2500);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 200)); } scrollTo(0, 0); });
for (const t of texts) { const r = await p.evaluate(t => { const els = [...document.querySelectorAll("*")].filter(e => e.children.length < 6 && (e.innerText || "").trim().startsWith(t) && e.getBoundingClientRect().height > 0); els.sort((a, b) => (a.innerText.length - b.innerText.length)); const e = els[0]; if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.y + scrollY), Math.round(r.x), Math.round(r.width), Math.round(r.height), e.tagName]; }, t); console.log(t.slice(0, 40).padEnd(42), JSON.stringify(r)); }
console.log("pageHeight", await p.evaluate(() => document.documentElement.scrollHeight)); await b.close();
