import { chromium } from "playwright";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage(); await p.goto("http://localhost:3302/otterisdead/pricing",{waitUntil:"load"}); await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>[...document.querySelectorAll('.otp-faq h2,.otp-faq details,.otp-plan header,.otp-plan header > *,.otp-plan > ul, .otp-plan hr, .otp-plan h5')].slice(0,40).map(e=>{const b=e.getBoundingClientRect();return e.tagName+'.'+(e.className||'').toString().split(' ')[0]+' '+Math.round(b.y+scrollY)+' '+Math.round(b.height)}).join('\n')));
await b.close();
