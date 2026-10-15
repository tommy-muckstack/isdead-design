// Parity kit: small building blocks for landing pages that mirror an original's section structure.
// Copy Pk.tsx + pk.css into an app's components/. Colours/heights come from props or the per-app stylesheet.
import Link from "next/link";
import "./pk.css";
import type { CSSProperties, ReactNode } from "react";

export const Gh = (slug: string) => `https://github.com/tommy-muckstack/${slug}`;
/** Full-width band with a fixed design height (px) so section tops line up with the original. */
export function Band({ id, h, bg, color, children, className = "", style }: { id?: string; h?: number; bg?: string; color?: string; children?: ReactNode; className?: string; style?: CSSProperties }) {
  return <section id={id} className={"pk-band " + className} style={{ minHeight: h, background: bg, color, ...style }}>{children}</section>;
}
export function Btn({ href = "/login", children, kind = "solid", style }: { href?: string; children: ReactNode; kind?: "solid" | "ghost" | "light" | "dark"; style?: CSSProperties }) {
  return <Link href={href} className={"pk-btn pk-btn--" + kind} style={style}>{children}</Link>;
}
export function Nav({ logo, links, right, bg, color, pos = "static", h = 64, className = "" }: { logo: ReactNode; links: string[]; right: ReactNode; bg?: string; color?: string; pos?: "static" | "absolute"; h?: number; className?: string }) {
  return <header className={"pk-nav " + className} style={{ height: h, background: bg, color, position: pos }}>
    <Link href="/" className="pk-logo">{logo}</Link><nav>{links.map(l => <a key={l} href="#">{l}</a>)}</nav><span className="pk-sp" /><div className="pk-right">{right}</div></header>;
}
/** Multi-column footer. cols: [title, links[]] */
export function Foot({ cols, bg, color, minH, legal, top, note }: { cols: [string, string[]][]; bg?: string; color?: string; minH?: number; legal?: ReactNode; top?: ReactNode; note?: string }) {
  return <footer className="pk-foot" style={{ background: bg, color, minHeight: minH }}><div className="pk-foot-in">{top}
    <div className="pk-cols" style={{ gridTemplateColumns: `repeat(${Math.min(cols.length, 6)},1fr)` }}>{cols.map(([t, ls]) => <div key={t}><h5>{t}</h5>{ls.map(l => <a key={l} href="#">{l}</a>)}</div>)}</div>
    <div className="pk-legal">{legal}{note && <p>{note}</p>}</div></div></footer>;
}
/** Card used in grids: gradient/solid bg, title, optional button. */
export function Card({ bg, color = "#fff", h, title, sub, cta, children, style, className = "" }: { bg: string; color?: string; h?: number; title: ReactNode; sub?: ReactNode; cta?: ReactNode; children?: ReactNode; style?: CSSProperties; className?: string }) {
  return <div className={"pk-card " + className} style={{ background: bg, color, minHeight: h, ...style }}><h3>{title}</h3>{sub && <p>{sub}</p>}{cta}{children}</div>;
}
export const Mock = ({ className = "", children, style }: { className?: string; children?: ReactNode; style?: CSSProperties }) => <div className={"pk-mock " + className} style={style}>{children}</div>;
