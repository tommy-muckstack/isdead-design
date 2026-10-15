import { chromium } from "playwright";
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-US" }); const p = await c.newPage();
await p.goto("https://trello.com/pricing", { waitUntil: "load", timeout: 45000 }).catch(() => {}); await p.waitForTimeout(3000);
console.log(await p.evaluate(() => { const out=[]; const h=[...document.querySelectorAll("*")].filter(e=>/^FREE$/.test((e.innerText||"").trim())&&e.getBoundingClientRect().y>300&&e.getBoundingClientRect().y<700)[0]; let card=h; for(let i=0;i<6&&card;i++){ const r=card.getBoundingClientRect(); if(r.width>300&&r.width<400) break; card=card.parentElement;} const row=card.parentElement; for (const cd of row.children){ const r=cd.getBoundingClientRect(); out.push("=== "+[r.x,r.y+scrollY,r.width,r.height].map(v=>v.toFixed(0))+" "+cd.tagName); out.push(cd.innerText.replace(/\n+/g," | ")); } return out.join("\n"); }));
await b.close();
