import { chromium } from "playwright";
const [url, vp, ...sels] = process.argv.slice(2);
const [w,h]=vp.split("x").map(Number);
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:w,height:h}});
await p.goto(url,{waitUntil:"load"}); await p.waitForTimeout(1500);
for (const s of sels){ const r=await p.evaluate(s=>[...document.querySelectorAll(s)].map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.top+scrollY),Math.round(r.height)]}),s); console.log(s,JSON.stringify(r)); }
await b.close();
