import { S3Client } from "@aws-sdk/client-s3";

let cached: S3Client | null = null;

export function getS3(): S3Client {
  if (cached) return cached;
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.AWS_REGION ?? "us-east-1";
  cached = new S3Client({
    region,
    endpoint,
    forcePathStyle: Boolean(endpoint),
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
  return cached;
}

export function getBucket(): string {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("S3_BUCKET is not set");
  return bucket;
}

export function getPublicBaseUrl(): string {
  return (
    process.env.S3_PUBLIC_URL ??
    `${process.env.S3_ENDPOINT ?? "https://s3.amazonaws.com"}/${getBucket()}`
  );
}
