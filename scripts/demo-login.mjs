// Usage: node scripts/demo-login.mjs <loginUrl> <out.json> [buttonText]
import { chromium } from "playwright";
const [url, out, btn = "Use the demo account"] = process.argv.slice(2);
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
await p.goto(url, { waitUntil: "load", timeout: 45000 }); await p.getByRole("button", { name: btn }).click(); await p.waitForURL(u => !/login/.test(u.pathname), { timeout: 20000 }).catch(() => {});
await p.waitForTimeout(1500); console.log("at", p.url()); await c.storageState({ path: out }); await b.close();
