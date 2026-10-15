#!/usr/bin/env node
// node scripts/vshot.mjs <url> <out.png> <scrollY> [vp=1440x900]  -> viewport screenshot at a scroll position (after slow scroll so lazy content/animations run)
import { chromium } from "playwright";
const [url, out, y, vp] = process.argv.slice(2); const [w, h] = (vp || "1440x900").split("x").map(Number);
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: w, height: h }, locale: "en-US" }); const p = await c.newPage();
await p.goto(url, { waitUntil: "load", timeout: 45000 }).catch(() => { }); await p.waitForTimeout(2500);
const Y = +y; for (let s = 0; s <= Y; s += 250) { await p.evaluate(s => scrollTo(0, s), s); await p.waitForTimeout(120); } await p.evaluate(Y => scrollTo(0, Y), Y); await p.waitForTimeout(1200);
await p.screenshot({ path: out }); await b.close();
