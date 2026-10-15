import { chromium } from "playwright";
const [url, out] = process.argv.slice(2);
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-US" }); const p = await c.newPage();
await p.goto(url, { waitUntil: "load", timeout: 45000 }).catch(() => {}); await p.waitForTimeout(3000);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } scrollTo(0, 0); });
const rows = await p.evaluate(() => { const out = []; const seen = new Set(); for (const e of document.querySelectorAll("body *")) { const r = e.getBoundingClientRect(); if (r.height < 20 || r.height > 400 || r.width < 900) continue; const t = (e.innerText || "").trim().split("\n")[0]; if (!t) continue; const k = Math.round(r.y + scrollY) + t; if (seen.has(k)) continue; seen.add(k); out.push([Math.round(r.y + scrollY), Math.round(r.height), Math.round(r.width), t.slice(0, 50), e.tagName]); } return out; });
console.log(await p.evaluate(() => document.documentElement.scrollHeight)); 
import("node:fs").then(f => f.writeFileSync(out, rows.map(r => r.join("\t")).join("\n")));
await b.close();
