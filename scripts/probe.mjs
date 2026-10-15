import { chromium } from "playwright";
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
for (const u of process.argv.slice(2)) { await p.goto(u, { waitUntil: "load" }).catch(()=>{}); await p.waitForTimeout(6000); console.log(u, "->", p.url(), (await p.title())); await p.screenshot({ path: "/tmp/lg_" + u.replace(/\W+/g,"_").slice(-30) + ".png" }); }
await b.close();
