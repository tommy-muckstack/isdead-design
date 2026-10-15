#!/bin/bash
# usage: install-auth.sh <repo dir> <config.ts path>  — copies AuthScreen + css and rewires app/login/page.tsx (reads ?mode=signup)
R=$1; CFG=$2; T=/workspace/isdead-design/templates/auth
cp $T/AuthScreen.tsx $R/components/AuthScreen.tsx; cp $T/auth-screen.css $R/app/auth-screen.css; cp $CFG $R/components/authCfg.ts
grep -q auth-screen.css $R/app/layout.tsx || sed -i '0,/import "\.\/globals.css";/s//import ".\/globals.css";\nimport ".\/auth-screen.css";/' $R/app/layout.tsx
cat > $R/app/login/page.tsx <<'TSX'
import { BP } from "@/lib/basepath";
import { demoEnabled } from "@/lib/session";
import { firebaseClientConfig, firebaseConfigured } from "@/lib/isdead-auth/config";
import { AuthScreen } from "@/components/AuthScreen";
import { authCfg } from "@/components/authCfg";
export const dynamic = "force-dynamic";
export default async function Login({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; mode?: string }> }) {
  const { callbackUrl, mode } = await searchParams;
  const rel = callbackUrl?.startsWith(BP + "/") ? callbackUrl.slice(BP.length) : callbackUrl;
  const to = BP + (rel && /^\/(?!\/)/.test(rel) ? rel : "/app");
  return <AuthScreen config={firebaseConfigured() ? firebaseClientConfig() : null} demo={demoEnabled()} to={to} signup={mode === "signup"} cfg={authCfg} />;
}
TSX
