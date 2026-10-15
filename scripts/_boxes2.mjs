import { chromium } from "playwright";
const url=process.argv[2]; const w=+process.argv[3]||390; const sels=process.argv.slice(4);
const b=await chromium.launch();const c=await b.newContext({viewport:{width:w,height:844}});const p=await c.newPage();
await p.goto(url,{waitUntil:"load"});await p.waitForTimeout(2000);
for(const s of sels){const r=await p.evaluate(s=>[...document.querySelectorAll(s)].map(e=>{const b=e.getBoundingClientRect();return [Math.round(b.y+scrollY),Math.round(b.x),Math.round(b.width),Math.round(b.height)].join("/")}),s);console.log(s,r.join("  "));}
console.log("H",await p.evaluate(()=>document.documentElement.scrollHeight));await b.close();
