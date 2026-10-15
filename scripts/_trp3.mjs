import { chromium } from "playwright";
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-US" }); const p = await c.newPage();
await p.goto(process.argv[2]||"https://trello.com/pricing", { waitUntil: "load", timeout: 45000 }).catch(() => {}); await p.waitForTimeout(3000);
console.log(await p.evaluate(() => { const out=[]; const f=(n)=>Number(n).toFixed(0);
 for (const e of document.querySelectorAll("body *")) { const r=e.getBoundingClientRect(); const y=r.y+scrollY; if(y<430||y>1720||r.x<190||r.x>720) continue; const cs=getComputedStyle(e);
  const leaf=!e.children.length&&(e.textContent||"").trim(); const bd=["Top","Right","Bottom","Left"].some(k=>parseFloat(cs["border"+k+"Width"])>0); const bg=cs.backgroundColor!=="rgba(0, 0, 0, 0)";
  if(leaf) out.push("T "+[f(r.x),f(y),f(r.width),f(r.height)]+" fs="+cs.fontSize+" lh="+cs.lineHeight+" fw="+cs.fontWeight+" c="+cs.color+" tt="+cs.textTransform+" :: "+leaf.slice(0,40));
  else if(bd||bg||e.tagName==="svg") out.push("B "+e.tagName+" "+[f(r.x),f(y),f(r.width),f(r.height)]+" bg="+cs.backgroundColor+" bd="+cs.borderTopWidth+"/"+cs.borderTopColor+"/"+cs.borderLeftWidth+"/"+cs.borderLeftColor+" br="+cs.borderRadius+" sh="+cs.boxShadow.slice(0,60)); }
 return out.join("\n"); }));
await b.close();
