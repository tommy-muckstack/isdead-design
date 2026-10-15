import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
const cx = (...c) => c.filter(Boolean).join(" ");
export function Button({ variant = "outline", size = "md", block, pill, icon, className, children, ...p }) {
    return _jsxs("button", { ...p, className: cx("ids-btn", `ids-btn--${variant}`, size === "sm" && "ids-btn--sm", block && "ids-btn--block", pill && "ids-btn--pill", className), children: [icon, children] });
}
export function LinkButton({ variant = "outline", size = "md", block, pill, className, ...p }) {
    return _jsx("a", { ...p, className: cx("ids-btn", `ids-btn--${variant}`, size === "sm" && "ids-btn--sm", block && "ids-btn--block", pill && "ids-btn--pill", className) });
}
export const Input = React.forwardRef(function Input({ className, ...p }, ref) {
    return _jsx("input", { ref: ref, ...p, className: cx("ids-input", className) });
});
export function Label({ className, ...p }) { return _jsx("label", { ...p, className: cx("ids-label", className) }); }
export function Card({ hero, className, ...p }) { return _jsx("div", { ...p, className: cx("ids-card", hero && "ids-card--hero", className) }); }
export function Divider({ label, className }) { return _jsx("div", { role: "separator", className: cx("ids-divider", className), children: label }); }
export function Pill({ className, ...p }) { return _jsx("span", { ...p, className: cx("ids-pill", className) }); }
export function NavBar({ brand, links = [], actions, className }) {
    return _jsxs("nav", { className: cx("ids-nav", className), children: [_jsx("div", { className: "ids-nav__brand", children: brand }), _jsx("div", { className: "ids-nav__links", children: links.map(l => _jsx("a", { href: l.href, children: l.label }, l.href + l.label)) }), _jsx("div", { className: "ids-nav__actions", children: actions })] });
}
/** Full-bleed gradient page with a centered white card: the shared /login template. */
export function AuthCard({ title, children, footer, className }) {
    return _jsx("section", { className: cx("ids-auth", className), children: _jsxs("div", { className: "ids-auth__card", children: [_jsx("h1", { className: "ids-h2", children: title }), children, footer && _jsx("div", { className: "ids-auth__footer", children: footer })] }) });
}
export function Hero({ eyebrow, title, subtitle, actions, children }) {
    return _jsxs("header", { className: "ids-hero", children: [eyebrow, _jsx("h1", { className: "ids-h1", style: { margin: "16px auto", maxWidth: 900 }, children: title }), subtitle && _jsx("p", { className: "ids-muted", style: { fontSize: "var(--ids-type-lg)", maxWidth: 640, margin: "0 auto" }, children: subtitle }), actions && _jsx("div", { style: { display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }, children: actions }), children] });
}
export function Section({ id, title, subtitle, children, className, style }) {
    return _jsxs("section", { id: id, className: cx("ids-section", className), style: style, children: [title && _jsx("h2", { className: "ids-h2", style: { textAlign: "center", fontSize: "var(--ids-type-3xl)" }, children: title }), subtitle && _jsx("p", { className: "ids-muted", style: { textAlign: "center", maxWidth: 640, margin: "12px auto 0" }, children: subtitle }), children] });
}
export function Footer({ columns, note }) {
    return _jsxs("footer", { children: [_jsx("div", { className: "ids-footer", children: columns.map(c => _jsxs("div", { children: [_jsx("h4", { children: c.title }), c.links.map(l => _jsx("a", { href: l.href, children: l.label }, l.label))] }, c.title)) }), note && _jsx("p", { className: "ids-muted", style: { textAlign: "center", fontSize: 13, padding: "0 32px 40px" }, children: note })] });
}
export const themes = ["calendly", "superhuman", "wisprflow"];
