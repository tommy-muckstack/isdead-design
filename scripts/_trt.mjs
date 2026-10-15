import { chromium } from "playwright";
import fs from "node:fs";
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-US" }); const p = await c.newPage();
await p.goto("https://trello.com/pricing", { waitUntil: "load", timeout: 45000 }).catch(() => {}); await p.waitForTimeout(3000);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } scrollTo(0, 0); });
const rows = await p.evaluate(() => [...document.querySelectorAll("table tr")].map(tr => { const cells = [...tr.children]; return { h: Math.round(tr.getBoundingClientRect().height), cells: cells.map(td => ({ t: td.innerText.trim(), svg: td.querySelectorAll("svg,img").length, links: [...td.querySelectorAll("a")].map(a => a.innerText.trim()), w: Math.round(td.getBoundingClientRect().width) })) }; }));
fs.writeFileSync("/tmp/tr-rows.json", JSON.stringify(rows, null, 1)); console.log(rows.length, JSON.stringify(rows.slice(0, 6)));
await b.close();
