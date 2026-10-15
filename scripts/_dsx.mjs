import { chromium } from "playwright";
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage(); await p.goto("https://www.docusign.com/products-and-pricing", { waitUntil: "load", timeout: 60000 }); await p.waitForTimeout(4000);
const hs = await p.$$('[aria-expanded="false"]'); console.log("collapsed", hs.length);
for (const h of hs) { try { const t=(await h.innerText()).slice(0,40); if(/Build with|advanced custom|Enable Intell|Deliver pro|Manage access|Streamline|Drive trust/.test(t)) { await h.click({timeout:2000}); await p.waitForTimeout(300);} } catch(e){} }
await p.waitForTimeout(800);
console.log(await p.evaluate(()=>document.body.innerText));
await p.screenshot({path:"/tmp/ds-exp.png",fullPage:true});
await b.close();
