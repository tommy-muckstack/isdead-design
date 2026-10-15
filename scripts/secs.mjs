import { chromium } from "playwright";
const [url, w] = [process.argv[2], +process.argv[3] || 390]; const sel = process.argv[4] || ".ds > *";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: w, height: 844 } })).newPage();
await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(800);
const r = await p.evaluate(s => [...document.querySelectorAll(s)].map(e => { const b = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()}.${(e.className||"").toString().split(" ")[0]} y=${Math.round(b.y + scrollY)} h=${Math.round(b.height)}`; }), sel);
console.log(r.join("\n")); await b.close();
