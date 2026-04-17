import { NextResponse } from "next/server";
import { presignUpload, type AssetKind } from "@launchmint/storage";
import { auth } from "@/auth";

export const runtime = "nodejs";

const ALLOWED_KINDS: AssetKind[] = [
  "product-screenshot",
  "product-logo",
  "founder-avatar",
  "workspace-logo",
];

export async function POST(req: Request) {
  const session = await auth();
  const workspaceId = session?.user?.activeWorkspaceId;
  if (!session?.user?.id || !workspaceId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    kind?: string;
    contentType?: string;
    filename?: string;
  } | null;

  if (!body?.kind || !body.contentType) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "kind and contentType required" },
      { status: 400 },
    );
  }

  if (!ALLOWED_KINDS.includes(body.kind as AssetKind)) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "unsupported kind" },
      { status: 400 },
    );
  }

  try {
    const presigned = await presignUpload({
      workspaceId,
      kind: body.kind as AssetKind,
      contentType: body.contentType,
      filename: body.filename,
    });
    return NextResponse.json(presigned);
  } catch (err) {
    return NextResponse.json(
      {
        error: "PRESIGN_FAILED",
        message: err instanceof Error ? err.message : "unknown",
      },
      { status: 400 },
    );
  }
}
