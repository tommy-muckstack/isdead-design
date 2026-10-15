import { chromium } from "playwright";
const [url,sel]=process.argv.slice(2);
const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();
await p.goto(url,{waitUntil:"load"});await p.waitForTimeout(1500);
console.log(await p.evaluate(sel=>[...document.querySelectorAll(sel+" *")].filter(e=>getComputedStyle(e).position==="absolute").map(e=>e.tagName+"."+e.className+" "+(e.innerText||"").slice(0,20)+" "+JSON.stringify(e.getBoundingClientRect().toJSON())).join("\n"),sel));
const ps=await p.evaluate(sel=>{const e=document.querySelector(sel);return getComputedStyle(e,"::before").content+" | "+getComputedStyle(e,"::after").content},sel);console.log(ps);
await b.close();
