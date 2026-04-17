import { redirect } from "next/navigation";
import { db } from "@launchmint/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@launchmint/ui";
import { auth } from "@/auth";
import { OnboardingFlow } from "./onboarding-flow";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const workspaceId = session.user.activeWorkspaceId;
  if (!workspaceId) redirect("/signin");

  const [productCount, profile] = await Promise.all([
    db.product.count({ where: { workspaceId, deletedAt: null } }),
    db.founderProfile.findUnique({ where: { workspaceId } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to LaunchMint</CardTitle>
          <CardDescription>
            A few quick steps so your workspace, profile, and first product are
            ready to launch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingFlow
            initial={{
              hasProfile: Boolean(profile),
              displayName: profile?.displayName ?? session.user.name ?? "",
              hasProduct: productCount > 0,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
