import { chromium } from "playwright";
const [url,vw]=[process.argv[2],+process.argv[3]||1440];
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: vw, height: 900 } })).newPage(); await p.goto(url,{waitUntil:"load"}); await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>[...document.querySelector('.dp').children].map(e=>{const b=e.getBoundingClientRect();return e.className.split(' ')[0]+' '+Math.round(b.y+scrollY)+' '+Math.round(b.height)}).join('\n')+'\nTOTAL '+document.documentElement.scrollHeight));
await b.close();
