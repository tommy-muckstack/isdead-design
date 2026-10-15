import { chromium } from "playwright";
import fs from "node:fs";
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-US" }); const p = await c.newPage();
await p.goto("https://www.loom.com/pricing", { waitUntil: "load", timeout: 45000 }).catch(() => {}); await p.waitForTimeout(3000);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
const rows = await p.evaluate(() => [...document.querySelectorAll("table tr")].map(tr => ({ h: Math.round(tr.getBoundingClientRect().height), t: (tr.children[0]?.innerText || "").trim().replace(/\s+/g, " "), n: tr.children.length, vals: [...tr.children].slice(1).map(c => c.innerText.trim().replace(/\s+/g," ")) })));
fs.writeFileSync("/tmp/lm-rowh.json", JSON.stringify(rows)); console.log(rows.length); await b.close();
