import { chromium } from "playwright";
const [a, port, ...paths] = process.argv.slice(2);
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1920, height: 1114 } });
for (const pth of paths) { const i = pth.indexOf("="); const name = pth.slice(0, i), route = pth.slice(i + 1); const p = await c.newPage();
 await p.goto(`http://localhost:${port}/${a}isdead${route}`, { waitUntil: "load", timeout: 60000 }); await p.addStyleTag({content:"nextjs-portal{display:none!important}"}); await p.waitForTimeout(700);
 await p.screenshot({ path: `/workspace/isdead-shots/parity/_v_exec2/r3lg/${a}-${name}-${process.env.TAG||"c"}.png` }); await p.close(); }
await b.close();
