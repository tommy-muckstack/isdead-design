import type { AuthCfg } from "@/components/AuthScreen";
export const authCfg: AuthCfg = { layout: "center", card: true, bg: "linear-gradient(180deg,#eef3ff,#dfe8ff 60%,#f6f4ff)", accent: "#2b6df0", ctaBg: "#2b6df0", radius: 8, ink: "#14161f", muted: "#6a6e7c", logoCenter: true, logoSize: 30,
  title: "Sign in", signupTitle: "Create your account", emailButton: "Other ways to log in", emailFirst: true,
  providers: [{ id: "google", label: "Continue with Google" }, { id: "microsoft", label: "Continue with Microsoft" }, { id: "apple", label: "Continue with Apple" }], ctaNext: "Continue", cta: "Sign in", switchText: ["", "Create account"], signupSwitchText: ["Already have an account?", "Sign in"] };
