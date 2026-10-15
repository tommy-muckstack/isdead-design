// Run from a dir where `playwright-core` is installed (e.g. cd miroisdead && node ../isdead-design/templates/smoke.mjs <base> <tag>).
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright-core");
const [,, base, tag] = process.argv;
const email = `isdead-smoke-${tag}-${Date.now()}@example.com`, pw = "Smoke-" + Math.random().toString(36).slice(2) + "A1!";
const b = await chromium.launch(); const ctx = await b.newContext(); const p = await ctx.newPage();
const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type()==="error") errs.push(m.text().slice(0,160)); });
await p.goto(base + "/login", { waitUntil: "networkidle" });
const body0 = (await p.textContent("body")).replace(/\s+/g," ").slice(0,200);
// switch to sign up
const toggle = p.getByRole("button", { name: /create an account/i }).or(p.getByText(/create an account|new here/i)).first();
if (await toggle.count()) await toggle.click();
await p.fill('input[type=email], #email, input[name=email]', email);
await p.fill('input[type=password], #password, input[name=password]', pw);
const nm = p.locator('input[name=name]'); if (await nm.count() && await nm.isVisible()) await nm.fill("Smoke Test");
await p.locator('button[type=submit], form button').filter({ hasText: /create|sign up|log in|sign in|continue/i }).first().click();
await p.waitForTimeout(6000);
const cookies = (await ctx.cookies()).map(c => c.name);
const url1 = p.url(); const body1 = (await p.textContent("body")).replace(/\s+/g," ").slice(0,160);
console.log(JSON.stringify({ base, email, afterSignupUrl: url1, cookies, body1, errs: errs.slice(0,4) }));
await ctx.clearCookies();
// sign in again
await p.goto(base + "/login", { waitUntil: "networkidle" });
await p.fill('input[type=email], #email, input[name=email]', email);
await p.fill('input[type=password], #password, input[name=password]', pw);
await p.locator('button[type=submit], form button').filter({ hasText: /log in|sign in|continue/i }).first().click();
await p.waitForTimeout(6000);
console.log(JSON.stringify({ signin: { url: p.url(), cookies: (await ctx.cookies()).map(c=>c.name), body: (await p.textContent("body")).replace(/\s+/g," ").slice(0,160) } }));
await b.close(); console.log("EMAIL " + email);
