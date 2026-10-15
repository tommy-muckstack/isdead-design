import { chromium } from "playwright";
const b=await chromium.launch();
for(const w of [1440,1440,1440,1440,1440,1440,390,390,390,390]){const c=await b.newContext({viewport:{width:w,height:844},userAgent:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"});
const p=await c.newPage(); await p.goto("https://superhuman.com",{waitUntil:"load"});await p.waitForTimeout(4500);
const t=await p.evaluate(()=>document.body.innerText);
console.log(w,await p.evaluate(()=>document.documentElement.scrollHeight),t.includes('Bring AI inside')?'GO':t.includes('Superpowers')?'SUITE':'?',t.split('\n').filter(x=>x.length>20)[1]?.slice(0,60));await c.close()}
await b.close();
