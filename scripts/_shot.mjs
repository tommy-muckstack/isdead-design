import { chromium } from "playwright";
const [url,out,w,y0,y1]=[process.argv[2],process.argv[3],+process.argv[4]||390,+process.argv[5]||0,+process.argv[6]||1000];
const b=await chromium.launch();const c=await b.newContext({viewport:{width:w,height:844},locale:"en-US"});const p=await c.newPage();
await p.goto(url,{waitUntil:"load"});await p.waitForTimeout(1500);
await p.addStyleTag({content:"*{animation:none!important;transition:none!important}"});
await p.screenshot({path:out,fullPage:true,clip:{x:0,y:y0,width:w,height:y1-y0}});await b.close();
