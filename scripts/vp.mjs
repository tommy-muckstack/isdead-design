import { chromium } from "playwright";
const [url,out,w,h,scroll]=process.argv.slice(2);
const b=await chromium.launch(); const c=await b.newContext({viewport:{width:+w,height:+h},deviceScaleFactor:1,userAgent:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"});
const p=await c.newPage(); await p.goto(url,{waitUntil:"load"});await p.waitForTimeout(3500);
await p.evaluate(async(s)=>{for(let y=0;y<document.body.scrollHeight;y+=300){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}window.scrollTo(0,s)},+scroll||0);
await p.waitForTimeout(800);
await p.screenshot({path:out});await b.close();
