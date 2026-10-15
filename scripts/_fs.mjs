import { chromium } from "playwright";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage(); await p.goto("http://localhost:3302/otterisdead/pricing",{waitUntil:"load"}); await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{const f=document.querySelector('.ot-foot');const c=getComputedStyle(f);const b=f.getBoundingClientRect();return [c.backgroundColor,c.color,Math.round(b.y+scrollY),Math.round(b.height),f.parentElement.className, document.documentElement.scrollHeight].join(' ')}));
await p.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight)); await p.waitForTimeout(500); await p.screenshot({path:'/tmp/otfoot.png'});
await b.close();
