import { chromium } from "playwright";
const [url, out, w=1920, h=1110] = process.argv.slice(2);
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: +w, height: +h }, storageState: "/workspace/isdead-design/parity/calendly-clone-storage.json" }); const p = await c.newPage();
await p.goto(url, { waitUntil: "load", timeout: 45000 }); await p.addStyleTag({content:"nextjs-portal{display:none!important}"}); await p.waitForTimeout(500); await p.screenshot({ path: out }); await b.close();
