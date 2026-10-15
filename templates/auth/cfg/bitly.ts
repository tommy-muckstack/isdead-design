import type { AuthCfg } from "@/components/AuthScreen";
export const authCfg: AuthCfg = { layout: "splitR", accent: "#1f60f0", ctaBg: "#1f60f0", radius: 4, ink: "#1a1a1a", muted: "#5c5c66",
  title: "Log in and start sharing", signupTitle: "Create your account", sub: undefined, passwordInline: true, emailFirst: false,
  providers: [{ id: "google", label: "Continue with Google" }, { id: "apple", label: "Continue with Apple" }, { id: "sso", label: "Continue with Single Sign-On" }], cta: "Log in", signupCta: "Create account",
  art: { kind: "color", bg: "#eaf1ff", fg: "#10213f", title: "Connect Bitly to the tools you use every day", blocks: ["#ff7a35", "#1f60f0", "#7be0b6"] }, switchText: ["Don't have an account?", "Sign up"] };
