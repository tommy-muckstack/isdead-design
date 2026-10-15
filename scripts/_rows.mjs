import { chromium } from "playwright";
const [url,sel]=[process.argv[2],process.argv[3]];
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage(); await p.goto(url,{waitUntil:"load"}); await p.waitForTimeout(3500);
console.log(await p.evaluate((sel)=>{
 let rows;
 if(sel==='ours') rows=[...document.querySelectorAll('.otp-row')];
 else rows=[...document.querySelectorAll('div')].filter(e=>getComputedStyle(e).display==='grid'&&getComputedStyle(e).gridTemplateColumns.split(' ').length===4&&e.getBoundingClientRect().height>60&&e.getBoundingClientRect().y>3100);
 return rows.map(e=>Math.round(e.getBoundingClientRect().height)+' '+(e.innerText||'').split('\n')[0].slice(0,34)).join('\n');
},sel));
await b.close();
