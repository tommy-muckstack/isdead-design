import { chromium } from "playwright";
const [url, vp, ...txt] = process.argv.slice(2); const [w,h]=vp.split("x").map(Number);
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:w,height:h}});
await p.goto(url,{waitUntil:"load"}); await p.waitForTimeout(3000);
for(const t of txt){ const r=await p.evaluate(t=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){if(n.textContent.includes(t)&&n.parentElement){const e=n.parentElement;const s=getComputedStyle(e);const r=e.getBoundingClientRect();return {tag:e.tagName,x:Math.round(r.left),y:Math.round(r.top+scrollY),w:Math.round(r.width),h:Math.round(r.height),fs:s.fontSize,lh:s.lineHeight,fw:s.fontWeight,ls:s.letterSpacing,ff:s.fontFamily.slice(0,40),c:s.color}}}return null},t); console.log(t.slice(0,25).padEnd(26),JSON.stringify(r)); }
await b.close();
