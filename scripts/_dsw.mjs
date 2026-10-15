import { chromium } from "playwright";
const [vw,y0,y1,maxd]=[+process.argv[2]||1440,+process.argv[3]||0,+process.argv[4]||9999,+process.argv[5]||9];
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: vw, height: 900 } });
const p = await ctx.newPage(); await p.goto("https://www.docusign.com/products-and-pricing", { waitUntil: "load", timeout: 60000 }); await p.waitForTimeout(4000);
const r = await p.evaluate(([y0,y1,maxd])=>{
 const out=[]; 
 const pick=(el,d)=>{const b=el.getBoundingClientRect(),c=getComputedStyle(el);const own=[...el.childNodes].filter(n=>n.nodeType==3).map(n=>n.textContent.trim()).join(' ').slice(0,26);return '  '.repeat(d)+el.tagName.toLowerCase()+' "'+own+'" '+[Math.round(b.x),Math.round(b.y+scrollY),Math.round(b.width),Math.round(b.height)].join(',')+' '+[c.fontSize,c.fontWeight,c.lineHeight,c.color.replace(/ /g,''),c.backgroundColor.replace(/ /g,''),c.padding,c.margin!='0px'?'m:'+c.margin:'',c.borderRadius!='0px'?'r:'+c.borderRadius:'',c.borderBottom.startsWith('0')?'':'bb:'+c.borderBottom.replace(/ /g,''),c.display.includes('grid')?'grid:'+c.gridTemplateColumns:'',c.letterSpacing!='normal'?'ls:'+c.letterSpacing:''].filter(Boolean).join(' ')};
 const walk=(el,d)=>{ if(d>maxd)return; for(const k of el.children){const b=k.getBoundingClientRect(); const y=b.y+scrollY; if(b.height<1||y+b.height<y0||y>y1)continue; out.push(pick(k,d)); walk(k,d+1);} };
 walk(document.body,0); return out.join('\n');
},[y0,y1,maxd]);
console.log(r); await b.close();
