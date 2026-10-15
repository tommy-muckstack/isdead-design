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
export declare function Button({ variant, size, block, pill, icon, className, children, ...p }: ButtonProps): React.JSX.Element;
export type LinkButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: ButtonVariant;
    size?: "md" | "sm";
    block?: boolean;
    pill?: boolean;
};
export declare function LinkButton({ variant, size, block, pill, className, ...p }: LinkButtonProps): React.JSX.Element;
export declare const Input: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>;
export declare function Label({ className, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>): React.JSX.Element;
export declare function Card({ hero, className, ...p }: React.HTMLAttributes<HTMLDivElement> & {
    hero?: boolean;
}): React.JSX.Element;
export declare function Divider({ label, className }: {
    label?: string;
} & Cx): React.JSX.Element;
export declare function Pill({ className, ...p }: React.HTMLAttributes<HTMLSpanElement>): React.JSX.Element;
export declare function NavBar({ brand, links, actions, className }: {
    brand: React.ReactNode;
    links?: {
        href: string;
        label: string;
    }[];
    actions?: React.ReactNode;
} & Cx): React.JSX.Element;
/** Full-bleed gradient page with a centered white card: the shared /login template. */
export declare function AuthCard({ title, children, footer, className }: {
    title: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
} & Cx): React.JSX.Element;
export declare function Hero({ eyebrow, title, subtitle, actions, children }: {
    eyebrow?: React.ReactNode;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
    children?: React.ReactNode;
}): React.JSX.Element;
export declare function Section({ id, title, subtitle, children, className, style }: {
    id?: string;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    children?: React.ReactNode;
    style?: React.CSSProperties;
} & Cx): React.JSX.Element;
export declare function Footer({ columns, note }: {
    columns: {
        title: string;
        links: {
            href: string;
            label: string;
        }[];
    }[];
    note?: React.ReactNode;
}): React.JSX.Element;
export declare const themes: readonly ["calendly", "superhuman", "wisprflow"];
export type ThemeName = (typeof themes)[number];
export {};
