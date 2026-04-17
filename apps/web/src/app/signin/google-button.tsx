"use client";

import { Button } from "@launchmint/ui";
import { signIn } from "next-auth/react";

export function GoogleSignInButton() {
  return (
    <Button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/app" })}
      className="w-full"
    >
      Continue with Google
    </Button>
  );
}
