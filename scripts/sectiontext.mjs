import { chromium } from "playwright";
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
await p.goto(process.argv[2], { waitUntil: "load", timeout: 45000 }); await p.waitForTimeout(1500);
const r = await p.evaluate(() => [...document.querySelectorAll("main > *, .main-wrapper > *, footer")].map(e => [e.className.toString().slice(0, 30), Math.round(e.getBoundingClientRect().height), e.innerText.replace(/\n+/g, " | ").slice(0, +"900")]));
for (const x of r) console.log(x.join("  ::  ")); await b.close();
