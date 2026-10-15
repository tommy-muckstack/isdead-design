// Two-step aware auth smoke: signup -> (session?) -> logout -> login -> logout, against a live <base> (e.g. https://yourappisdead.com/loomisdead).
// Handles single-page forms (email+password together) and wizards (email -> Next -> password [-> name]).
// Usage: cd <app dir with playwright-core> && node ../isdead-design/templates/smoke2.mjs <base> <tag> [--keep]
// Prints one JSON line per step and a final RESULT line; throwaway account is smoke+<tag>-<ts>@example.com (example.com cannot receive mail).
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright-core");
const [,, base, tag] = process.argv;
const email = `smoke+${tag}-${Date.now().toString(36)}@example.com`, pw = "Smoke-" + Math.random().toString(36).slice(2) + "A1!";
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage();
const errs = []; p.on("pageerror", e => errs.push(e.message.slice(0, 120)));
const log = (step, o) => console.log(JSON.stringify({ step, ...o }));
const sess = async () => (await ctx.cookies()).some(c => /session/i.test(c.name) && c.value);
const vis = async sel => (await p.locator(sel).all()).filter(async l => await l.isVisible());
async function firstVisible(sel) { for (const l of await p.locator(sel).all()) if (await l.isVisible().catch(() => false)) return l; return null; }
const SOCIAL = /with (google|apple|microsoft|facebook|slack|sso|saml|passkey|chatgpt|outlook|setapp|single)|^(google|apple|microsoft|facebook|slack|sso|passkey|chatgpt|outlook)$|^\W*(sso|\+)|login code|get a login code|forgot|can.t|find my|guide|documentation|another way/i;
async function clickByText(re, { not, last } = {}) {
  let els = await p.locator("button, a, [role=button], input[type=submit]").all(); const isBtn = async l => (await l.evaluate(e => e.tagName === "BUTTON" || e.tagName === "INPUT" || e.getAttribute("role") === "button").catch(() => false)); const flags = await Promise.all(els.map(isBtn)); els = [...els.filter((_, i) => flags[i]), ...els.filter((_, i) => !flags[i])]; if (last) els = els.reverse();
  for (const l of els) {
    if (!(await l.isVisible().catch(() => false))) continue;
    const t = ((await l.innerText().catch(() => "")) || (await l.getAttribute("value").catch(() => "")) || "").trim();
    if (re.test(t) && !(not && not.test(t))) { await l.click({ timeout: 5000 }).catch(() => {}); return t; }
  }
  return null;
}
async function fillVisible() {
  const did = [];
  const em = await firstVisible("input[type=email], input[name=email], input[autocomplete=username], input[type=text]:not([name=name])");
  if (em && !(await em.inputValue())) { await em.fill(email); did.push("email"); }
  for (const l of await p.locator("input[type=password]").all()) if (await l.isVisible() && !(await l.inputValue())) { await l.fill(pw); did.push("password"); }
  const nm = await firstVisible("input[name=name], input[name=fullName], input[autocomplete=name]");
  if (nm && !(await nm.inputValue())) { await nm.fill("Smoke Test"); did.push("name"); }
  for (const l of await p.locator("input[type=checkbox]").all()) if (await l.isVisible() && /terms|agree|accept/i.test((await l.evaluate(e => e.closest("label")?.innerText || e.parentElement?.innerText || "")))) { await l.check().catch(() => {}); did.push("terms"); }
  return did;
}
const PROGRESS = /^(continue|next|log ?in|sign ?in|sign ?up( for free)?|create( an| a)?( new| free)? account|get started|register|submit|verify)$/i;
const PRIO = {
  signup: [/^(create( an| a)?( new| free)? account|register|create my \w+|get started( now)?)$/i, /^(continue( with (work )?email)?|next|submit|verify|take me to my canvas)$/i, /^(agree and )?sign ?up( for free)?$/i],
  login: [/^(log ?in|sign ?in)$/i, /^(continue( with (work )?email)?|next|submit|verify|get started( now)?)$/i],
};
async function wizard(mode, maxSteps = 6) {
  for (let i = 0; i < maxSteps; i++) {
    const did = await fillVisible();
    let clicked = null;
    if (did.length) { const sb = await firstVisible("form button[type=submit], form input[type=submit], button[type=submit]"); if (sb) { clicked = ((await sb.innerText().catch(() => "")) || "submit").trim(); if (SOCIAL.test(clicked)) clicked = null; else await sb.click({ timeout: 5000 }).catch(() => {}); } }
    if (!clicked) for (const re of PRIO[mode]) { clicked = await clickByText(re, { not: SOCIAL }); if (clicked) break; }
    await p.waitForTimeout(2500);
    log(`${mode}.step${i + 1}`, { did, clicked, url: p.url().replace(base, ""), session: await sess() });
    if (await sess()) return true;
    if (!did.length && !clicked) return false;
  }
  return false;
}
async function logout() {
  await p.getByText(/log ?out|sign ?out/i).first().waitFor({ timeout: 5000 }).catch(() => {});
  let t = await clickByText(/log ?out|sign ?out/i);
  if (!t) for (const role of ["button", "link", "menuitem"]) { const l = p.getByRole(role, { name: /log ?out|sign ?out/i }).first(); if (await l.count() && await l.isVisible().catch(() => false)) { await l.click({ timeout: 5000 }).catch(() => {}); t = "role:" + role; break; } }
  if (!t) { // open an avatar / account menu first
    for (const sel of ["[aria-label*=account i]", "[aria-label*=profile i]", "[aria-label*=user i]", "[aria-label*=menu i]", "button[class*=avatar i]", "[class*=avatar i]", "[class*=Avatar]", "header button:last-child", "nav button:last-child"]) {
      const l = await firstVisible(sel); if (!l) continue;
      await l.click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(600);
      t = await clickByText(/log ?out|sign ?out/i); if (t) break;
    }
  }
  await p.waitForTimeout(2500);
  return { clicked: t, session: await sess(), url: p.url().replace(base, "") };
}
const res = { app: tag, base, email, signup: false, logout1: false, login: false, logout2: false, notes: [] };
try {
  await p.goto(base + "/login", { waitUntil: "networkidle" });
  // switch to sign up
  const sw = await clickByText(/^(sign ?up( for free)?|create( an| a new)? account|register|i don.t have an account|new here\? create an account|sign up or learn more)$/i, { last: true });
  if (!sw) { const t = p.getByText(/^\s*(create an account|sign up)\s*$/i).last(); if (await t.count() && await t.isVisible().catch(() => false)) { await t.click().catch(() => {}); await p.waitForTimeout(800); log("signup.text-toggle", {}); } }
  if (!(await firstVisible("input"))) { const o = await clickByText(/other ways|use (an )?email|continue with email|^get started( now)?$|email/i, { not: /google|apple|microsoft|facebook|sso|saml|passkey/i }); log("signup.reveal-email", { o }); }
  if (!sw) { const t2 = await clickByText(/^(create( an| a new)? account|sign ?up( for free)?|new here\? create an account)$/i, { last: true }); if (t2) { await p.waitForTimeout(800); log("signup.toggle-after-reveal", { t2 }); } }
  await p.waitForTimeout(1500); log("signup.open", { toggle: sw, url: p.url().replace(base, "") });
  res.signup = await wizard("signup");
  if (!res.signup) { res.notes.push("no session after signup"); const bt = (await p.textContent("body")).replace(/\s+/g, " ").slice(0, 200); log("signup.body", { bt }); }
  if (res.signup) {
    await p.goto(base + "/app", { waitUntil: "networkidle" }).catch(() => {}); await p.waitForTimeout(1000);
    const lo = await logout(); log("logout1", lo); res.logout1 = !lo.session;
    if (lo.session) res.notes.push("logout control not found or session persisted");
    await ctx.clearCookies();
  }
  await p.goto(base + "/login", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  if (!(await firstVisible("input"))) { const o = await clickByText(/other ways|use (an )?email|continue with email|^get started( now)?$|email/i, { not: /google|apple|microsoft|facebook|sso|saml|passkey/i }); log("login.reveal-email", { o }); }
  res.login = await wizard("login");
  if (res.login) { await p.goto(base + "/app", { waitUntil: "networkidle" }).catch(() => {}); await p.waitForTimeout(800); const lo = await logout(); log("logout2", lo); res.logout2 = !lo.session; }
} catch (e) { res.notes.push("exception: " + e.message.slice(0, 160)); }
res.errs = errs.slice(0, 3);
await p.screenshot({ path: `/workspace/isdead-shots/smoke/${tag}-end.png` }).catch(() => {});
console.log("RESULT " + JSON.stringify(res));
await b.close();
