import { chromium } from "playwright";
const [url,out,vw="1440x900",full]=process.argv.slice(2);const [w,h]=vw.split("x").map(Number);
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage();
await p.goto(url,{waitUntil:"load"}).catch(()=>{});await p.waitForTimeout(1500);await p.screenshot({path:out,fullPage:!!full});await b.close();
