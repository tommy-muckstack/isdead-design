import { chromium } from "playwright";
const [url, sel, w = "390"] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 844 } });
await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(1500);
const r = await p.evaluate((sel) => [...document.querySelector(sel).children].map(e => { const r = e.getBoundingClientRect(); return `${e.tagName}.${(e.className||"").toString().slice(0,30)} ${Math.round(r.top + scrollY)} h${Math.round(r.height)}`; }), sel);
console.log(r.join("\n")); await b.close();
