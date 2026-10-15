import { chromium } from "playwright";
const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:844},locale:"en-US"});const p=await c.newPage();
await p.goto("https://otter.ai",{waitUntil:"load"});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>{const seen=new Set(),out=[];for(const e of document.querySelectorAll("div")){const b=e.getBoundingClientRect();const cs=getComputedStyle(e);if(Math.round(b.width)===320&&b.height>195&&b.height<240&&cs.backgroundColor==="rgb(251, 251, 251)"){const t=e.innerText.trim().replace(/\n+/g," | ");if(!seen.has(t)){seen.add(t);out.push(t+" ## "+cs.borderTopLeftRadius+" pad "+cs.padding)}}}return out});
console.log(r.join("\n"));await b.close();
