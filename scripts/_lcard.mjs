import { chromium } from "playwright";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage(); await p.goto("http://localhost:3301/docusignisdead/pricing",{waitUntil:"load"}); await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>[...document.querySelectorAll('.dp-plan, .dp-top, .dp-bot, .dp-bot ul, .dp-fq > div, .dp-bar, .dp-plans')].map(e=>{const b=e.getBoundingClientRect();return e.className.split(' ')[0]+' '+Math.round(b.y+scrollY)+' '+Math.round(b.height)}).join('\n')));
await b.close();
