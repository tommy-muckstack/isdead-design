import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await p.goto("http://localhost:3526/trelloisdead/login", { waitUntil: "load" }); await p.waitForTimeout(2000);
console.log(await p.evaluate(() => [".lg","h1","label","input[type=email]",".rm",".go",".ow",".pv",".lk","hr",".at",".oa"].map(s => { const r = document.querySelector(s).getBoundingClientRect(); return s+" "+[r.x,r.y,r.width,r.height].map(v=>v.toFixed(1)).join(" "); }).join("\n")+"\n"+[...document.querySelectorAll(".pv")].map(e=>e.getBoundingClientRect().y).join(",")));
await b.close();
