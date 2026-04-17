import { Client } from "typesense";

let cached: Client | null = null;

export function getTypesense(): Client {
  if (cached) return cached;
  const apiKey = process.env.TYPESENSE_API_KEY;
  if (!apiKey) throw new Error("TYPESENSE_API_KEY not set");
  cached = new Client({
    nodes: [
      {
        host: process.env.TYPESENSE_HOST ?? "localhost",
        port: Number(process.env.TYPESENSE_PORT ?? 8108),
        protocol: process.env.TYPESENSE_PROTOCOL ?? "http",
      },
    ],
    apiKey,
    connectionTimeoutSeconds: 5,
  });
  return cached;
}
