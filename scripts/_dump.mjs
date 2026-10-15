import { chromium } from "playwright";
const url=process.argv[2]; const w=+process.argv[3]||390;
const must=process.argv[4]; const b = await chromium.launch(); let c,p;
for(let i=0;i<14;i++){ c = await b.newContext({ viewport:{width:w,height:844}, locale:"en-US"}); p = await c.newPage();
await p.goto(url,{waitUntil:"load",timeout:45000}).catch(()=>{}); await p.waitForTimeout(3000);
if(!must|| (await p.evaluate(()=>document.body.innerText)).includes(must)) break; await c.close(); console.error("retry"); }
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}scrollTo(0,0);});
const r = await p.evaluate(()=>{const out=[];const seen=new Set();
 for(const e of document.querySelectorAll("h1,h2,h3,h4,h5,h6,button,a,p,li,img,video")){const b=e.getBoundingClientRect(); if(b.height<=0||b.width<=0)continue; const t=(e.innerText||e.alt||"").trim().replace(/\s+/g," ").slice(0,90); out.push([Math.round(b.y+scrollY),Math.round(b.x),Math.round(b.width),Math.round(b.height),e.tagName.toLowerCase(),t]);}
 return out.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);});
console.log(r.map(x=>x.join("|")).join("\n")); console.log("H",await p.evaluate(()=>document.documentElement.scrollHeight)); await b.close();
