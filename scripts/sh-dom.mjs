import { chromium } from "playwright";
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:390,height:844},userAgent:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"});
const p=await c.newPage(); await p.goto("https://superhuman.com",{waitUntil:"load"});await p.waitForTimeout(3000);
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=300){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,200));}window.scrollTo(0,0)});
const r=await p.evaluate(()=>{const out=[];const walk=(el,d)=>{const r=el.getBoundingClientRect();if(r.height>150&&d<7&&r.width>300){const cs=getComputedStyle(el);out.push([d,el.tagName,(el.className+'').slice(0,40),Math.round(r.top+scrollY),Math.round(r.height),cs.backgroundColor,cs.fontFamily.slice(0,30)])}for(const ch of el.children)walk(ch,d+1)};walk(document.body,0);return out});
for(const x of r)console.log(x.join(' | '));
await b.close();
