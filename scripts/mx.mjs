import { chromium } from "playwright";
const [w]=process.argv.slice(2);
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:+w,height:900},userAgent:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"});
const p=await c.newPage(); await p.goto("https://miro.com/pricing/",{waitUntil:"load"});await p.waitForTimeout(3000);
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,100));}window.scrollTo(0,0)});
const r=await p.evaluate(()=>{const out=[];const m=document.querySelector('[class*=feature-matrix_FeatureMatrix]');
 const walk=(el,d)=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);if(d<=5&&r.height>5)out.push([ '  '.repeat(d)+el.tagName.toLowerCase()+'.'+(el.className+'').split(' ')[0].slice(-26),Math.round(r.left),Math.round(r.top+scrollY),Math.round(r.width),Math.round(r.height),cs.backgroundColor!='rgba(0, 0, 0, 0)'?cs.backgroundColor:'',cs.fontSize+' w'+cs.fontWeight,cs.color,(el.children.length==0?el.textContent.trim().slice(0,30):'')].join(' | '));if(d<5)for(const ch of el.children)walk(ch,d+1)};walk(m,0);return out});
console.log(r.slice(0,140).join('\n'));await b.close();
