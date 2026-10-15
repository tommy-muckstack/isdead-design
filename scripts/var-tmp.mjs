import { chromium } from "playwright";
const b = await chromium.launch();
for (let i=0;i<6;i++){ const ctx=await b.newContext({viewport:{width:1440,height:900},locale:i%2?"en-US":"en-GB"}); const p=await ctx.newPage(); await p.goto("https://calendly.com/",{waitUntil:"domcontentloaded"}); await p.waitForTimeout(3000);
 console.log(i, await p.locator("h1").first().innerText().catch(()=>"?"), (await ctx.cookies()).map(c=>c.name).join(","));await ctx.close();}
await b.close();
