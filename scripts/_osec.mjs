import { chromium } from "playwright";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage(); await p.goto("http://localhost:3302/otterisdead/pricing",{waitUntil:"load"}); await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{const r=document.querySelector('.otp');return [...document.querySelectorAll('.otp > *, .otp-plan, .otp-tbl__h, .otp-grp, body > div > *')].map(e=>{const b=e.getBoundingClientRect();return e.tagName+'.'+(e.className||'').toString().split(' ')[0]+' '+Math.round(b.y+scrollY)+' '+Math.round(b.height)}).join('\n')+'\nTOTAL '+document.documentElement.scrollHeight}));
await b.close();
