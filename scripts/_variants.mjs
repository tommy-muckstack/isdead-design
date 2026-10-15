import { chromium } from "playwright";
const [url,w,n]=[process.argv[2],+process.argv[3]||390,+process.argv[4]||10];
const b = await chromium.launch();
const res={};
for(let i=0;i<n;i++){const c=await b.newContext({viewport:{width:w,height:844},locale:"en-US"});const p=await c.newPage();
 await p.goto(url,{waitUntil:"load",timeout:45000}).catch(()=>{}); await p.waitForTimeout(2500);
 const h1=(await p.locator("h1").first().innerText().catch(()=>"?")).replace(/\s+/g," ");
 const H=await p.evaluate(()=>document.documentElement.scrollHeight);
 const k=h1+" | "+Math.round(H/200)*200; res[k]=(res[k]||0)+1; await c.close();}
console.log(res); await b.close();
