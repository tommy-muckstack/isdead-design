import { chromium } from "playwright";
const b = await chromium.launch();
for (const u of ["https://trello.com/pricing", "http://localhost:3526/trelloisdead/pricing"]) {
const c = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-US" }); const p = await c.newPage();
await p.goto(u, { waitUntil: "load", timeout: 45000 }).catch(() => {}); await p.waitForTimeout(3000);
console.log("=====", u); console.log(await p.evaluate(() => { const out=[]; const want=["Get started","INCLUDED IN FREE:","Unlimited cards","Capture your to-dos","Free for up to 10","Quickly capture to-dos from email, Slack, and Teams","STANDARD","Learn more about Standard","Sign up now","$"]; const seen=new Set(); for (const e of document.querySelectorAll("body *")) { if (e.children.length) continue; const t=(e.innerText||e.textContent||"").trim(); const r=e.getBoundingClientRect(); if(r.y<440||r.y>2000) continue; for(const w of want){ if(t.startsWith(w)&&!seen.has(w)){ seen.add(w); const cs=getComputedStyle(e); out.push(w.slice(0,22)+" | "+[r.x,r.y+scrollY,r.width,r.height].map(v=>v.toFixed(0))+" fs="+cs.fontSize+" lh="+cs.lineHeight+" fw="+cs.fontWeight+" c="+cs.color+" ls="+cs.letterSpacing); } } } return out.join("\n"); }));
}
await b.close();
