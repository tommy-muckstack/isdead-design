import { chromium } from "playwright";
const url=process.argv[2]; const w=+process.argv[3]||390; const must=process.argv[4]; const y0=+process.argv[5]||0, y1=+process.argv[6]||99999;
const b = await chromium.launch(); let c,p;
for(let i=0;i<20;i++){ c = await b.newContext({ viewport:{width:w,height:844}, locale:"en-US"}); p = await c.newPage();
await p.goto(url,{waitUntil:"load",timeout:45000}).catch(()=>{}); await p.waitForTimeout(3000);
if(!must|| (await p.evaluate(()=>document.body.innerText)).includes(must)) break; await c.close(); }
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}scrollTo(0,0);});
const r=await p.evaluate(()=>{const out=[];
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while(n=walker.nextNode()){const t=n.textContent.trim();if(!t)continue;const e=n.parentElement;const cs=getComputedStyle(e);if(cs.display==="none"||cs.visibility==="hidden")continue;const r=document.createRange();r.selectNodeContents(n);const b=r.getBoundingClientRect();if(b.height<=0||b.x>400||b.x<-5)continue;
 out.push([Math.round(b.y+scrollY),Math.round(b.x),Math.round(b.width),Math.round(b.height),e.tagName.toLowerCase(),cs.fontSize,cs.fontWeight,cs.color.replace(/ /g,""),cs.fontFamily.split(",")[0].slice(0,18),cs.lineHeight,t.replace(/\s+/g," ").slice(0,80)]);}
 return out;});
console.log(r.filter(x=>x[0]>=y0&&x[0]<=y1).map(x=>x.join("|")).join("\n")); await b.close();
