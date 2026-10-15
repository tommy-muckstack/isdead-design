import { chromium } from "playwright";
const b = await chromium.launch(); 
for (const [u, sel] of [["https://trello.com/pricing", "table tr:nth-child(3)"], ["http://localhost:3526/trelloisdead/pricing", ".rw:nth-of-type(3)"]]) {
const c = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-US" }); const p = await c.newPage();
await p.goto(u, { waitUntil: "load", timeout: 45000 }).catch(() => {}); await p.waitForTimeout(3000);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
console.log(u, await p.evaluate((sel) => { const tr = document.querySelector(sel); if(!tr) return "none"; const out=[]; for (const td of tr.children) { const r = td.getBoundingClientRect(); const cs=getComputedStyle(td); const first = td.querySelector("*"); out.push([r.x,r.y+scrollY,r.width,r.height].map(v=>v.toFixed(0)).join(",")+" fs="+cs.fontSize+" fw="+cs.fontWeight+" c="+cs.color+" ff="+cs.fontFamily.slice(0,30)+" bl="+cs.borderLeftWidth+"/"+cs.borderLeftColor+" bt="+cs.borderTopWidth+"/"+cs.borderTopColor); } const svg=tr.querySelector("svg,img"); if(svg){const s=svg.getBoundingClientRect(); out.push("svg "+s.width+"x"+s.height+" "+getComputedStyle(svg).color+" "+svg.outerHTML.slice(0,300));} const b=tr.children[0].querySelector("b,h3,span,div"); return out.join("\n"); }, sel));
}
await b.close();
