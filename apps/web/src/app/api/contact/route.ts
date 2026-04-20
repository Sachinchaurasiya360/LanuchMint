import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: {
    name?: string;
    email?: string;
    topic?: string;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  const topic = String(body.topic ?? "").trim().slice(0, 60);
  const message = String(body.message ?? "").trim().slice(0, 4000);

  if (!name || !EMAIL_RE.test(email) || !message) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  console.info("[contact]", { name, email, topic, length: message.length });

  return NextResponse.json({ ok: true });
}
