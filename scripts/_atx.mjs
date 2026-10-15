import { chromium } from "playwright";
const [url,...sels]=process.argv.slice(2);
const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
await p.goto(url,{waitUntil:"load"});await p.waitForTimeout(1500);
for(const q of sels){console.log(q,JSON.stringify(await p.evaluate(q=>[...document.querySelectorAll(q)].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top+scrollY),Math.round(r.width),Math.round(r.height)]}),q)));}
await b.close();
