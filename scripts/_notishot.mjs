import { chromium } from "playwright";
const [base,out,steps="",vw="1920x1114"]=process.argv.slice(2);const [w,h]=vw.split("x").map(Number);
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:w,height:h}});
await ctx.request.post(base+"/api/session/demo");
const p=await ctx.newPage();await p.goto(base+"/app",{waitUntil:"load"});await p.waitForTimeout(2000);
for(const s of steps.split("|").filter(Boolean)){const [k,v]=s.split("=");
 if(k==="click")await p.click(v);else if(k==="text")await p.getByText(v,{exact:true}).first().click();else if(k==="type")await p.keyboard.type(v);else if(k==="key")await p.keyboard.press(v);else if(k==="wait")await p.waitForTimeout(+v);else if(k==="go")await p.goto(base+v);await p.waitForTimeout(700);}
await p.screenshot({path:out});await b.close();
