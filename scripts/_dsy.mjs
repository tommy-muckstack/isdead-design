import { chromium } from "playwright";
const vw=+process.argv[2]||1440;
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: vw, height: 900 } });
const p = await ctx.newPage(); await p.goto("https://www.docusign.com/products-and-pricing", { waitUntil: "load", timeout: 60000 }); await p.waitForTimeout(4000);
const r = await p.evaluate(()=>{
 const out=[]; const q=(s)=>[...document.querySelectorAll(s)];
 const pick=(el)=>{const b=el.getBoundingClientRect(),c=getComputedStyle(el);return {t:(el.innerText||'').slice(0,40).replace(/\n/g,'|'),tag:el.tagName,cls:(el.className||'').toString().slice(0,50),x:Math.round(b.x),y:Math.round(b.y+scrollY),w:Math.round(b.width),h:Math.round(b.height),fs:c.fontSize,fw:c.fontWeight,ff:c.fontFamily.slice(0,40),col:c.color,bg:c.backgroundColor,bgi:c.backgroundImage.slice(0,120),lh:c.lineHeight,pad:c.padding,br:c.borderRadius}};
 const main=document.querySelector('main')||document.body;
 const walk=(el,d)=>{ if(d>5)return; for(const k of el.children){const b=k.getBoundingClientRect(); if(b.height>40){out.push('  '.repeat(d)+JSON.stringify(pick(k)));} if(b.height>40) walk(k,d+1);} };
 walk(main,0);
 return out.slice(0,260).join('\n');
});
console.log(r); await b.close();
