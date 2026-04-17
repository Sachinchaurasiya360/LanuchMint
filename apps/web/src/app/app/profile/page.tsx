import Link from "next/link";
import { db } from "@launchmint/db";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@launchmint/ui";
import { requireSession } from "@/lib/session";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { workspaceId } = await requireSession();
  const profile = await db.founderProfile.findUnique({ where: { workspaceId } });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Founder profile</CardTitle>
              <CardDescription>
                Your public identity across LaunchMint.
              </CardDescription>
            </div>
            {profile?.publishedAt ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/founders/${profile.slug}`}>View public page</Link>
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm initial={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
