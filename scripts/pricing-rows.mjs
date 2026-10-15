// usage: node pricing-rows.mjs <orig-text-file> <pricingCfg.ts>  -> prints new groups array (JSON) built from the original's compare table,
// marking rows we already offer (fuzzy match against current available rows) and the rest as unavailable ("-" prefix).
import fs from "fs";
const [txtFile, cfgFile, availArg = ""] = process.argv.slice(2);
const alias = new Map(); const avail = new Set();
for (const e of availArg.split("|").map(x => x.trim()).filter(Boolean)) { const [o, ours] = e.split("="); avail.add(o.toLowerCase()); if (ours) alias.set(o.toLowerCase(), ours.toLowerCase()); }
const raw = fs.readFileSync(txtFile, "utf8").split("\n");
const cfg = fs.readFileSync(cfgFile, "utf8");
const m = cfg.match(/groups:\s*(\[\[[\s\S]*?\]\]),\n\s*faqTitle/);
const cur = JSON.parse(m[1]);
const have = cur.flatMap(([, r]) => r).filter(x => !x.startsWith("-")).map(x => x);
const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const stop = new Set(["a","an","the","of","and","or","to","for","in","with","your","you","per","on","up"]);
const toks = s => new Set(norm(s).split(" ").filter(w => w && !stop.has(w)));
const sim = (a, b) => { const A = toks(a), B = toks(b); if (!A.size || !B.size) return 0; let n = 0; for (const t of A) if (B.has(t)) n++; return n / Math.min(A.size, B.size); };
// start after the column header block
let start = raw.findIndex(l => /compare|features/i.test(l) && false);
const lines = raw.map(l => l.replace(/\r/g, ""));
const isVal = i => i < lines.length && /^\t/.test(lines[i]) && lines[i].trim() !== "";
const nextNB = i => { let j = i + 1; while (j < lines.length && lines[j].trim() === "") j++; return j; };
const rows = [];
for (let i = 0; i < lines.length; i++) {
  const t = lines[i].trim().replace(/NEW$/,"").trim(); if (!t || /^\t/.test(lines[i])) continue;
  if (i + 1 < lines.length && /^\t\s*$/.test(lines[i + 1])) {
    rows.push({ type: "row", text: t, i });
    // skip cell values until a blank-blank gap
    let j = i + 1; while (j < lines.length && !(lines[j].trim() === "" && !/^\t/.test(lines[j]) && (lines[j + 1] ?? "").trim() === "" && !/^\t/.test(lines[j + 1] ?? ""))) j++;
    i = j; continue;
  }
  rows.push({ type: "txt", text: t, i });
}
// group header = txt immediately followed (next nonblank) by a row, and previous row ended
const groups = []; let g = null;
for (let k = 0; k < rows.length; k++) {
  const r = rows[k];
  if (r.type === "txt" && rows[k + 1]?.type === "row" && rows[k + 1].i - r.i < 6) { g = [r.text, []]; groups.push(g); continue; }
  if (r.type === "row" && g) g[1].push(r.text);
}
const out = []; const used = new Set(); const seen = new Set();
for (const [name, rs0] of groups) {
  const rs = rs0.filter(r => !/^(try for free|sign up|contact sales|included|get started)$/i.test(r));
  if (!rs.length) continue;
  const items = [];
  for (const r of rs) { const key = norm(r); if (seen.has(key + name)) continue; seen.add(key + name);
    const al = alias.get(r.toLowerCase()); const hit = have.findIndex(h => norm(h) === norm(al ?? r));
    if (avail.has(r.toLowerCase()) || hit >= 0) { if (hit >= 0) used.add(hit); items.push(r); } else items.push("-" + r); }
  out.push([name, items]);
}
const extra = have.filter((_, i) => !used.has(i));
if (extra.length) out.push(["This project", extra]);
console.log(JSON.stringify(out));
console.error("groups", out.length, "rows", out.reduce((a, [, r]) => a + r.length, 0), "matched", used.size, "of", have.length, "extra", extra.length);
