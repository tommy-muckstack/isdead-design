#!/usr/bin/env node
// Print top/height of every top-level section of a page (to line sections up against the original numerically).
//  node scripts/sections.mjs <url> [vp=1440x900] [--must text]
import { chromium } from "playwright";
const url = process.argv[2]; const [w, h] = (process.argv[3] || "1440x900").split("x").map(Number);
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: w, height: h }, storageState: process.argv.includes("--storage") ? process.argv[process.argv.indexOf("--storage") + 1] : undefined });
const p = await ctx.newPage(); await p.goto(url, { waitUntil: "load", timeout: 45000 }); await p.waitForTimeout(1500);
const r = await p.evaluate(() => { const host = document.querySelector("main") || document.querySelector(".cm") || document.body; const kids = [...(host.children.length > 3 ? host.children : host.firstElementChild.children)]; return kids.map(e => { const b = e.getBoundingClientRect(); return [e.tagName.toLowerCase() + "." + (e.className?.toString?.() || "").split(" ")[0].slice(0, 22), Math.round(b.y + scrollY), Math.round(b.height)]; }); });
console.log(r.map(x => x.join("  ")).join("\n")); await b.close();
