import { chromium } from "playwright";
const [url, outPrefix, n=9, step=1000] = process.argv.slice(2);
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1920, height: 1114 } }); const p = await c.newPage();
await p.goto(url, { waitUntil: "load", timeout: 60000 }); await p.addStyleTag({content:"nextjs-portal{display:none!important}"}); await p.waitForTimeout(1200);
const H = await p.evaluate(() => document.documentElement.scrollHeight); console.log("height", H);
for (let i = 0; i < +n; i++) { await p.evaluate(y => window.scrollTo(0, y), i * +step); await p.waitForTimeout(500); await p.screenshot({ path: `${outPrefix}${i === 0 ? "" : "-" + (i + 1)}.png` }); }
await b.close();
