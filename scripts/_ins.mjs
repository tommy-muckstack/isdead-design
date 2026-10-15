import { chromium } from "playwright";
const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
await p.goto("http://localhost:3311/loomisdead/pricing",{waitUntil:"load"});await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{const h=document.querySelector(".pb-hero");const k=[...h.children].map(e=>{const b=e.getBoundingClientRect();const cs=getComputedStyle(e);return e.tagName+"."+e.className+" y"+Math.round(b.y+scrollY)+" h"+Math.round(b.height)+" mt"+cs.marginTop+" mb"+cs.marginBottom});const cs=getComputedStyle(h);return k.join("\n")+"\nhero pad "+cs.padding+" h "+h.getBoundingClientRect().height}));
await b.close();
