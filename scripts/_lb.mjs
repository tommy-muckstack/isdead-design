import { chromium } from "playwright";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage(); await p.goto("http://localhost:3301/docusignisdead/pricing",{waitUntil:"load"}); await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>[...document.querySelectorAll('.dp-hero h1, .dp-bar, .dp-tabs, .dp-tabs button, .dp-sel, .dp-sel button, .dp-sel em')].map(e=>{const b=e.getBoundingClientRect();return e.tagName+e.className+' '+Math.round(b.y+scrollY)+' '+Math.round(b.height)+' '+getComputedStyle(e).display}).join('\n')));
await b.close();
