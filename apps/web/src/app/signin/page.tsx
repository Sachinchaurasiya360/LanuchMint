import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@launchmint/ui";
import { GoogleSignInButton } from "./google-button";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link href="/" className="text-base font-semibold tracking-tight">
            LaunchMint
          </Link>
          <CardTitle className="mt-4">Sign in</CardTitle>
          <CardDescription>
            Use your Google account to continue. We'll create your workspace on
            first sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <GoogleSignInButton />
          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
