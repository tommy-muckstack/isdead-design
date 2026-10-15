import { chromium } from "playwright";
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();await p.goto("http://localhost:3411/superhumanisdead/",{waitUntil:"load"});
console.log(await p.evaluate(()=>['.shm-hero','.shm-media','.shm-strip','.shm-trust','.shm-intro'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return s+' '+Math.round(r.top)+' '+Math.round(r.height)}).join('\n')));await b.close();
