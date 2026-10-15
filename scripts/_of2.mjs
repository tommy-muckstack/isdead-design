import { chromium } from "playwright";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage(); await p.goto("http://localhost:3302/otterisdead/pricing",{waitUntil:"load"}); await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{const c=document.querySelectorAll('.otp-plan')[2];const o=[];const r=c.getBoundingClientRect();o.push('card '+Math.round(r.y+scrollY)+' '+Math.round(r.height));c.querySelectorAll('header, header>*, ul, ul>li, hr, h5').forEach(e=>{const b=e.getBoundingClientRect();o.push(e.tagName+' '+Math.round(b.y+scrollY)+' '+Math.round(b.height)+' mb'+getComputedStyle(e).marginBottom)});return o.join('\n')}));
await b.close();
