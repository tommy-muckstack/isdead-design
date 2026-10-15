import { chromium } from "playwright";
const vw=+process.argv[2]||1440;
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: vw, height: 900 } });
const p = await ctx.newPage(); await p.goto("https://www.docusign.com/products-and-pricing", { waitUntil: "load", timeout: 60000 }); await p.waitForTimeout(4000);
const r = await p.evaluate(()=>{
 const out=[];
 const pick=(el)=>{const b=el.getBoundingClientRect(),c=getComputedStyle(el);return JSON.stringify({t:(el.innerText||el.getAttribute('aria-label')||'').slice(0,28).replace(/\n/g,'|'),tag:el.tagName,x:Math.round(b.x),y:Math.round(b.y+scrollY),w:Math.round(b.width),h:Math.round(b.height),fs:c.fontSize,fw:c.fontWeight,col:c.color,bg:c.backgroundColor,bgi:c.backgroundImage.slice(0,90),lh:c.lineHeight,ls:c.letterSpacing,pad:c.padding,br:c.borderRadius,bd:c.border.slice(0,40),sh:c.boxShadow.slice(0,60)})};
 const sels=['header','header a','header button','h1','[role=tab]','select, [role=combobox], [aria-haspopup]','article, [class*=card]','h2','h3','section.css-moswsq > *','section.css-moswsq > * > *','section.css-moswsq li','section.css-moswsq button','section.css-moswsq a'];
 const seen=new Set();
 for(const s of sels){ for(const el of [...document.querySelectorAll(s)].slice(0,s.includes('li')?7:8)){ const b=el.getBoundingClientRect(); if(b.height<8||seen.has(el))continue; seen.add(el); out.push(s+' '+pick(el)); } }
 return out.join('\n');
});
console.log(r); await b.close();
