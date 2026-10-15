import { chromium } from "playwright";
const [url,w]=process.argv.slice(2);
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:+w||390,height:844}})).newPage();await p.goto(url,{waitUntil:"load"});await p.waitForTimeout(1500);
console.log(await p.evaluate((W)=>{const o=[];for(const e of document.querySelectorAll('body *')){const r=e.getBoundingClientRect();if(r.right>W+1&&r.width>0&&getComputedStyle(e).display!='none')o.push(e.tagName+'.'+(e.className+'').slice(0,25)+' R='+Math.round(r.right)+' '+(e.textContent||'').slice(0,30))}return o.slice(0,25).join('\n')},+w||390));await b.close();
