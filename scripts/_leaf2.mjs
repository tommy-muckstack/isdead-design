// leaf text dump with optional url must; usage: node _leaf2.mjs url w [y0 y1] -> prints y|x|w|h|tag|size|weight|color|font|lh|text ; plus CONTAINERS (bg/border radius boxes)
import { chromium } from "playwright";
const url=process.argv[2], w=+process.argv[3]||390, y0=+process.argv[4]||0, y1=+process.argv[5]||99999, boxes=process.argv[6]==="boxes";
const b = await chromium.launch(); const c = await b.newContext({ viewport:{width:w,height:844}, locale:"en-US"}); const p = await c.newPage();
await p.goto(url,{waitUntil:"load",timeout:60000}).catch(()=>{}); await p.waitForTimeout(3500);
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}scrollTo(0,0);});
const r=await p.evaluate(([boxes,w])=>{const out=[];
 if(!boxes){const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while(n=walker.nextNode()){const t=n.textContent.trim();if(!t)continue;const e=n.parentElement;const cs=getComputedStyle(e);if(cs.display==="none"||cs.visibility==="hidden")continue;const r=document.createRange();r.selectNodeContents(n);const b=r.getBoundingClientRect();if(b.height<=0||b.x>w+10||b.x<-5)continue;
 out.push([Math.round(b.y+scrollY),Math.round(b.x),Math.round(b.width),Math.round(b.height),e.tagName.toLowerCase(),cs.fontSize,cs.fontWeight,cs.color.replace(/ /g,""),cs.fontFamily.split(",")[0].slice(0,14),cs.lineHeight,t.replace(/\s+/g," ").slice(0,70)]);}}
 else{for(const e of document.querySelectorAll("body *")){const cs=getComputedStyle(e);const b=e.getBoundingClientRect();if(b.height<28||b.width<60||b.x<-5||b.x>w)continue;const hasBg=cs.backgroundColor!=="rgba(0, 0, 0, 0)"||cs.backgroundImage!=="none";const hasBd=cs.borderTopWidth!=="0px"&&cs.borderTopStyle!=="none";if(!(hasBg||hasBd))continue;
 out.push([Math.round(b.y+scrollY),Math.round(b.x),Math.round(b.width),Math.round(b.height),e.tagName.toLowerCase(),cs.borderTopLeftRadius,cs.backgroundColor.replace(/ /g,""),cs.backgroundImage.slice(0,50),hasBd?cs.borderTopWidth+" "+cs.borderTopColor.replace(/ /g,""):"","", (e.innerText||"").trim().replace(/\s+/g," ").slice(0,24)]);}}
 return out.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);},[boxes,w]);
console.log(r.filter(x=>x[0]>=y0&&x[0]<=y1).map(x=>x.join("|")).join("\n"));await b.close();
