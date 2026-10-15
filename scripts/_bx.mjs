import { chromium } from "playwright";
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:1440,height:900}});
const p=await c.newPage(); await p.goto(process.argv[2],{waitUntil:"load"});await p.waitForTimeout(3500);
const r=await p.evaluate(()=>[...document.querySelectorAll('button,a,svg,img,input,form,main,div')].filter(e=>{const r=e.getBoundingClientRect();return r.width>20&&r.width<600&&r.height>14&&r.top>0&&r.top<900}).slice(0,40).map(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return [e.tagName,Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height),cs.backgroundColor,cs.borderRadius,cs.borderColor].join(' ')}));
console.log(r.join('\n'));
console.log(await p.evaluate(()=>getComputedStyle(document.body).backgroundColor));
await b.close();
