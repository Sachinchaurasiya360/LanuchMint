import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { getBucket, getPublicBaseUrl, getS3 } from "./client.js";

export type AssetKind =
  | "product-screenshot"
  | "product-logo"
  | "founder-avatar"
  | "workspace-logo";

export interface PresignUploadArgs {
  workspaceId: string;
  kind: AssetKind;
  contentType: string;
  filename?: string;
}

export interface PresignedUpload {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

export async function presignUpload(args: PresignUploadArgs): Promise<PresignedUpload> {
  if (!ALLOWED_TYPES.has(args.contentType)) {
    throw new Error(`Unsupported content type: ${args.contentType}`);
  }

  const ext = args.contentType.split("/")[1]?.replace("svg+xml", "svg") ?? "bin";
  const key = `workspaces/${args.workspaceId}/${args.kind}/${nanoid(16)}.${ext}`;
  const expiresIn = 60 * 5;

  const cmd = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: args.contentType,
    ACL: "public-read",
    Metadata: args.filename ? { "original-filename": args.filename } : undefined,
  });

  const uploadUrl = await getSignedUrl(getS3(), cmd, { expiresIn });
  const publicUrl = `${getPublicBaseUrl()}/${key}`;

  return { uploadUrl, publicUrl, key, expiresIn };
}

export async function presignDownload(key: string, expiresIn = 60 * 10): Promise<string> {
  return getSignedUrl(
    getS3(),
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
    { expiresIn },
  );
}

export async function deleteObject(key: string): Promise<void> {
  await getS3().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}
