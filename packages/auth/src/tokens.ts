import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stateless signed tokens (HMAC-SHA256). Used for things like review invites
 * where we don't want to keep a row per outstanding invite. Payload is opaque
 * to the signer - the caller decides what fields to include.
 *
 * Wire format: base64url(payloadJson) + "." + base64url(hmac)
 */

export interface SignedTokenOptions {
  secret?: string;
}

function getSecret(opts?: SignedTokenOptions): string {
  const secret = opts?.secret ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "signedToken requires NEXTAUTH_SECRET (or an explicit secret option)",
    );
  }
  return secret;
}

function b64urlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(s: string): Buffer {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return Buffer.from(padded, "base64");
}

export function signToken<T extends Record<string, unknown>>(
  payload: T,
  opts?: SignedTokenOptions,
): string {
  const secret = getSecret(opts);
  const json = JSON.stringify(payload);
  const body = b64urlEncode(Buffer.from(json, "utf8"));
  const sig = createHmac("sha256", secret).update(body).digest();
  return `${body}.${b64urlEncode(sig)}`;
}

export interface VerifiedToken<T> {
  ok: true;
  payload: T;
}
export interface InvalidToken {
  ok: false;
  reason: "MALFORMED" | "BAD_SIGNATURE" | "EXPIRED";
}

export function verifyToken<T extends { exp?: number }>(
  token: string,
  opts?: SignedTokenOptions,
): VerifiedToken<T> | InvalidToken {
  const secret = getSecret(opts);
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "MALFORMED" };
  const [body, sig] = parts;
  if (!body || !sig) return { ok: false, reason: "MALFORMED" };

  const expected = createHmac("sha256", secret).update(body).digest();
  let provided: Buffer;
  try {
    provided = b64urlDecode(sig);
  } catch {
    return { ok: false, reason: "MALFORMED" };
  }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return { ok: false, reason: "BAD_SIGNATURE" };
  }

  let payload: T;
  try {
    payload = JSON.parse(b64urlDecode(body).toString("utf8")) as T;
  } catch {
    return { ok: false, reason: "MALFORMED" };
  }

  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
    return { ok: false, reason: "EXPIRED" };
  }

  return { ok: true, payload };
}

export interface ReviewInvitePayload extends Record<string, unknown> {
  productId: string;
  email: string;
  /** Unix seconds. */
  exp: number;
}

const REVIEW_INVITE_TTL_DAYS = 21;

export function signReviewInvite(productId: string, email: string): string {
  const exp = Math.floor(Date.now() / 1000) + REVIEW_INVITE_TTL_DAYS * 86_400;
  return signToken<ReviewInvitePayload>({
    productId,
    email: email.toLowerCase().trim(),
    exp,
  });
}

export function verifyReviewInvite(
  token: string,
): VerifiedToken<ReviewInvitePayload> | InvalidToken {
  return verifyToken<ReviewInvitePayload>(token);
}
