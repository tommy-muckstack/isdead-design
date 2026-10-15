import { chromium } from "playwright";
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage(); await p.goto("https://www.docusign.com/products-and-pricing", { waitUntil: "load", timeout: 60000 }); await p.waitForTimeout(4000);
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true)); await p.waitForTimeout(800);
const t=await p.evaluate(()=>{const ds=[...document.querySelectorAll('details')].slice(0,8);return ds.map(d=>{const rows=[...d.querySelectorAll(':scope > div > div')].map(r=>[...r.children].map(c=>(c.innerText||'').trim().replace(/\n/g,' ')|| (c.querySelector('svg')?'✓':'')).join(' | '));return d.querySelector('summary').innerText.replace(/\n/g,' / ')+'\n'+rows.join('\n')}).join('\n\n')});
console.log(t); await b.close();
