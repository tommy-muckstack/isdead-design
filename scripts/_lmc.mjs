import { chromium } from "playwright";
const b = await chromium.launch();
for (const u of ["https://www.loom.com/pricing", "http://localhost:3527/loomisdead/pricing"]) {
const c = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-US" }); const p = await c.newPage();
await p.goto(u, { waitUntil: "load", timeout: 45000 }).catch(() => {}); await p.waitForTimeout(3000);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
console.log("=====", u, await p.evaluate(() => { const out=[]; const els=[...document.querySelectorAll("body *")].filter(e=>!e.children.length&&/Transcriptions & closed captions/.test((e.textContent||"").trim())&&e.getBoundingClientRect().width>0); for (const e of els.slice(0,1)) { let q=e; for(let i=0;i<5&&q;i++){ const r=q.getBoundingClientRect(), cs=getComputedStyle(q); out.push(q.tagName+" "+[r.x,r.y+scrollY,r.width,r.height].map(v=>v.toFixed(0))+" fs="+cs.fontSize+" lh="+cs.lineHeight+" fw="+cs.fontWeight+" c="+cs.color+" disp="+cs.display+" pad="+cs.padding+" gtc="+cs.gridTemplateColumns.slice(0,80)); q=q.parentElement; } } const tr=els[0].closest("tr,[role=row],div[class*=row]"); if(tr) out.push("row children: "+[...tr.children].map(c=>Math.round(c.getBoundingClientRect().width)).join(",")); return out.join("\n"); }));
}
await b.close();
