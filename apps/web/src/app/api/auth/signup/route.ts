import { NextResponse } from "next/server";
import { db, WorkspaceType, Role } from "@launchmint/db";
import { hashPassword, validatePasswordStrength } from "@launchmint/auth/password";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function uniqueWorkspaceSlug(base: string): Promise<string> {
  const baseSlug = slugify(base) || "workspace";
  let slug = baseSlug;
  let n = 1;
  while (
    await db.workspace.findUnique({ where: { slug }, select: { id: true } })
  ) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
  return slug;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim().slice(0, 120) || null;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const pwError = validatePasswordStrength(password);
  if (pwError) {
    return NextResponse.json({ error: pwError }, { status: 400 });
  }

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });
  if (existing?.passwordHash) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try signing in." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const displayName = name ?? email.split("@")[0];

  const user = existing
    ? await db.user.update({
        where: { id: existing.id },
        data: { passwordHash, name: displayName },
      })
    : await db.user.create({
        data: {
          email,
          name: displayName,
          passwordHash,
        },
      });

  const hasWorkspace = await db.workspaceMember.findFirst({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!hasWorkspace) {
    const slug = await uniqueWorkspaceSlug(`${displayName}-workspace`);
    const workspace = await db.workspace.create({
      data: {
        slug,
        name: `${displayName} Workspace`,
        type: WorkspaceType.FOUNDER,
      },
    });
    await db.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: Role.OWNER,
      },
    });
    await db.subscription.create({ data: { workspaceId: workspace.id } });
  }

  return NextResponse.json({ ok: true });
}
