import { chromium } from "playwright";
const url=process.argv[2], w=+process.argv[3]||390, must=process.argv[4];
const b = await chromium.launch(); let c,p;
for(let i=0;i<20;i++){ c = await b.newContext({ viewport:{width:w,height:844}, locale:"en-US"}); p = await c.newPage();
await p.goto(url,{waitUntil:"load",timeout:45000}).catch(()=>{}); await p.waitForTimeout(3000);
if(!must|| (await p.evaluate(()=>document.body.innerText)).includes(must)) break; await c.close(); }
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}scrollTo(0,0);});
const r=await p.evaluate(()=>{const out=[];
 for(const e of document.querySelectorAll("body *")){const cs=getComputedStyle(e);const b=e.getBoundingClientRect();
  if(b.width>=300&&b.width<=392&&b.height>=100&&b.x>=0&&parseFloat(cs.borderTopLeftRadius)>=8){out.push([Math.round(b.y+scrollY),Math.round(b.x),Math.round(b.width),Math.round(b.height),e.tagName.toLowerCase(),cs.borderTopLeftRadius,cs.backgroundColor,cs.backgroundImage.slice(0,110),(e.innerText||"").trim().replace(/\s+/g," ").slice(0,30)]);}}
 return out.sort((a,b)=>a[0]-b[0]);});
console.log(r.map(x=>x.join("|")).join("\n")); await b.close();
