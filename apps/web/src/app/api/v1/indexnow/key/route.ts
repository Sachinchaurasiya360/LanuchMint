import { NextResponse } from "next/server";

/**
 * IndexNow verification endpoint. IndexNow allows any same-host `keyLocation`,
 * so we expose the key at a predictable path instead of a root-level `.txt`
 * file that would collide with unknown URLs.
 */
export async function GET() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return new NextResponse("not configured", { status: 404 });
  return new NextResponse(key, {
    status: 200,
    headers: { "content-type": "text/plain" },
  });
}
