// usage: mcmp.mjs origUrl cloneUrl "selector-or-text"...   prints y of each in both at 390 (selector if starts with . or #)
import { chromium } from "playwright";
const [o, c, ...q] = process.argv.slice(2);
const b = await chromium.launch();
async function run(url) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1" });
  await p.goto(url, { waitUntil: "load", timeout: 45000 }).catch(() => {}); await p.waitForTimeout(2500);
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
  await p.waitForTimeout(500);
  const out = [];
  for (const s of q) out.push(await p.evaluate((s) => {
    let els;
    if (/^[.#\[]/.test(s)) els = [...document.querySelectorAll(s)];
    else { els = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.textContent.includes(s) && n.parentElement) els.push(n.parentElement); }
    const e = els[0]; if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.top + scrollY), Math.round(r.height)];
  }, s));
  out.push(await p.evaluate(() => document.documentElement.scrollHeight));
  await p.close(); return out;
}
const A = await run(o), B = await run(c);
q.forEach((s, i) => console.log(s.padEnd(34), JSON.stringify(A[i]), JSON.stringify(B[i])));
console.log("height".padEnd(34), A[q.length], B[q.length]);
await b.close();
