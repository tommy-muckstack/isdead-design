import { chromium } from "playwright";
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:1440,height:900},userAgent:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"});
const p=await c.newPage(); await p.goto("https://www.typeform.com/pricing",{waitUntil:"load"});await p.waitForTimeout(3000);
const t=await p.evaluate(()=>document.body.innerText);
const i=t.indexOf("Frequently asked questions"); console.log(t.slice(i,i+1400));
await b.close();
