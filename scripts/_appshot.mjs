import { chromium } from "playwright";
const [base,out,vw="1440x900",path="/app"]=process.argv.slice(2);const [w,h]=vw.split("x").map(Number);
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:w,height:h}});
const r=await ctx.request.post(base+"/api/session/demo").catch(e=>({status:()=>-1}));console.log("demo",r.status());
const p=await ctx.newPage();await p.goto(base+path,{waitUntil:"load"}).catch(()=>{});await p.waitForTimeout(2500);console.log(p.url());await p.screenshot({path:out});await b.close();
