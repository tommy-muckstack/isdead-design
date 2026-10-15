// usage: node dom-sec.mjs url width [maxDepth] [minH] -> prints block tree with bg + font
import { chromium } from "playwright";
const [url,w,md="6",mh="60"]=process.argv.slice(2);
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:+w,height:900},userAgent:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"});
const p=await c.newPage(); await p.goto(url,{waitUntil:"load"});await p.waitForTimeout(3000);
await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}window.scrollTo(0,0)});
const r=await p.evaluate(([md,mh])=>{const out=[];const walk=(el,d)=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);if(r.height>=+mh&&d<=+md&&cs.display!='none'){out.push(['  '.repeat(d)+el.tagName.toLowerCase()+'.'+(el.className+'').split(' ')[0].slice(0,30),Math.round(r.left),Math.round(r.top+scrollY),Math.round(r.width),Math.round(r.height),cs.backgroundColor!='rgba(0, 0, 0, 0)'?cs.backgroundColor:'',cs.borderRadius!='0px'?'r'+cs.borderRadius:'',cs.fontFamily.split(',')[0].slice(0,20)+' '+cs.fontSize].join(' | '))}for(const ch of el.children)walk(ch,d+1)};walk(document.body,0);return out},[md,mh]);
console.log(r.join('\n'));await b.close();
