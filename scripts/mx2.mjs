import { chromium } from "playwright";
const [w,sel,x0,x1]=process.argv.slice(2);
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:+w,height:900},userAgent:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"});
const p=await c.newPage(); await p.goto(process.env.URL||"https://miro.com/pricing/",{waitUntil:"load"});await p.waitForTimeout(3000);
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,100));}window.scrollTo(0,0)});
const r=await p.evaluate(([sel,x0,x1])=>{const out=[];const root=document.querySelector(sel);const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=tw.nextNode()){const t=n.data.trim();if(!t)continue;const e=n.parentElement;const r=e.getBoundingClientRect();if(r.width==0||r.left<+x0||r.left>+x1)continue;const cs=getComputedStyle(e);out.push([Math.round(r.left),Math.round(r.top+scrollY),Math.round(r.width),Math.round(r.height),cs.fontSize+'/'+cs.lineHeight+' w'+cs.fontWeight,cs.color,t.slice(0,40)].join(' | '))}return out},[sel,x0,x1]);
console.log(r.join('\n'));await b.close();
