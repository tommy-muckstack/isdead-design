import * as React from "react";
type Cx = {
    className?: string;
};
export type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "danger";
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: "md" | "sm";
    block?: boolean;
    pill?: boolean;
    icon?: React.ReactNode;
};
export declare function Button({ variant, size, block, pill, icon, className, children, ...p }: ButtonProps): any;
export type LinkButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: ButtonVariant;
    size?: "md" | "sm";
    block?: boolean;
    pill?: boolean;
};
export declare function LinkButton({ variant, size, block, pill, className, ...p }: LinkButtonProps): any;
export declare const Input: any;
export declare function Label({ className, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>): any;
export declare function Card({ hero, className, ...p }: React.HTMLAttributes<HTMLDivElement> & {
    hero?: boolean;
}): any;
export declare function Divider({ label, className }: {
    label?: string;
} & Cx): any;
export declare function Pill({ className, ...p }: React.HTMLAttributes<HTMLSpanElement>): any;
export declare function NavBar({ brand, links, actions, className }: {
    brand: React.ReactNode;
    links?: {
        href: string;
        label: string;
    }[];
    actions?: React.ReactNode;
} & Cx): any;
/** Full-bleed gradient page with a centered white card: the shared /login template. */
export declare function AuthCard({ title, children, footer, className }: {
    title: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
} & Cx): any;
export declare function Hero({ eyebrow, title, subtitle, actions, children }: {
    eyebrow?: React.ReactNode;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
    children?: React.ReactNode;
}): any;
export declare function Section({ id, title, subtitle, children, className, style }: {
    id?: string;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    children?: React.ReactNode;
    style?: React.CSSProperties;
} & Cx): any;
export declare function Footer({ columns, note }: {
    columns: {
        title: string;
        links: {
            href: string;
            label: string;
        }[];
    }[];
    note?: React.ReactNode;
}): any;
export declare const themes: readonly ["calendly", "superhuman", "wisprflow", "miro", "canva", "typeform", "docusign", "grammarly", "granola", "cleanshotx"];
export type ThemeName = (typeof themes)[number];
export * from "./google";
