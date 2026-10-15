import { chromium } from "playwright";
const [url,vw]=[process.argv[2],+process.argv[3]||1440];
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: vw, height: 900 } })).newPage(); await p.goto(url,{waitUntil:"load",timeout:60000}); await p.waitForTimeout(4000);
console.log(await p.evaluate(()=>document.querySelector('main').innerText));
await b.close();
