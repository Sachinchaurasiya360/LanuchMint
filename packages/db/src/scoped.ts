/**
 * Workspace-scoped Prisma helpers.
 *
 * Multi-tenancy is enforced via row-level scoping by `workspaceId`.
 * App code must use `dbScoped(workspaceId)` instead of the raw `db` client
 * for any tenant-owned table. Cross-tenant queries (admin/search index)
 * use the raw `db` and must be commented as such.
 */
import { db } from "./client.js";

const TENANT_TABLES = [
  "product",
  "founderProfile",
  "teamProfile",
  "directorySubmission",
  "trackedDomain",
  "integration",
  "aiGeneration",
  "usageCounter",
  "subscription",
  "notification",
  "apiKey",
] as const;

export type TenantTable = (typeof TENANT_TABLES)[number];

export interface ScopedClient {
  workspaceId: string;
  raw: typeof db;
  product: ReturnType<typeof scopeModel>;
  founderProfile: ReturnType<typeof scopeModel>;
  teamProfile: ReturnType<typeof scopeModel>;
  directorySubmission: ReturnType<typeof scopeModel>;
  trackedDomain: ReturnType<typeof scopeModel>;
  integration: ReturnType<typeof scopeModel>;
  aiGeneration: ReturnType<typeof scopeModel>;
  usageCounter: ReturnType<typeof scopeModel>;
  subscription: ReturnType<typeof scopeModel>;
  notification: ReturnType<typeof scopeModel>;
  apiKey: ReturnType<typeof scopeModel>;
}

function scopeModel(model: { [k: string]: unknown }, workspaceId: string) {
  const inject = <T extends { where?: Record<string, unknown>; data?: Record<string, unknown> }>(
    args: T,
  ): T => {
    return {
      ...args,
      where: { ...(args.where ?? {}), workspaceId },
    } as T;
  };

  const injectCreate = <T extends { data: Record<string, unknown> }>(args: T): T => {
    return {
      ...args,
      data: { ...args.data, workspaceId },
    } as T;
  };

  return {
    findMany: (args: Record<string, unknown> = {}) =>
      // @ts-expect-error dynamic dispatch
      model.findMany(inject(args)),
    findFirst: (args: Record<string, unknown> = {}) =>
      // @ts-expect-error dynamic dispatch
      model.findFirst(inject(args)),
    findUnique: (args: Record<string, unknown>) =>
      // @ts-expect-error dynamic dispatch
      model.findUnique(inject(args)),
    count: (args: Record<string, unknown> = {}) =>
      // @ts-expect-error dynamic dispatch
      model.count(inject(args)),
    create: (args: { data: Record<string, unknown> }) =>
      // @ts-expect-error dynamic dispatch
      model.create(injectCreate(args)),
    update: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) =>
      // @ts-expect-error dynamic dispatch
      model.update(inject(args)),
    updateMany: (args: { where?: Record<string, unknown>; data: Record<string, unknown> }) =>
      // @ts-expect-error dynamic dispatch
      model.updateMany(inject(args)),
    delete: (args: { where: Record<string, unknown> }) =>
      // @ts-expect-error dynamic dispatch
      model.delete(inject(args)),
    deleteMany: (args: { where?: Record<string, unknown> } = {}) =>
      // @ts-expect-error dynamic dispatch
      model.deleteMany(inject(args)),
    upsert: (args: {
      where: Record<string, unknown>;
      create: Record<string, unknown>;
      update: Record<string, unknown>;
    }) =>
      // @ts-expect-error dynamic dispatch
      model.upsert({
        ...args,
        where: { ...args.where, workspaceId },
        create: { ...args.create, workspaceId },
      }),
  };
}

export function dbScoped(workspaceId: string): ScopedClient {
  if (!workspaceId) {
    throw new Error("dbScoped: workspaceId is required");
  }

  return {
    workspaceId,
    raw: db,
    product: scopeModel(db.product as never, workspaceId),
    founderProfile: scopeModel(db.founderProfile as never, workspaceId),
    teamProfile: scopeModel(db.teamProfile as never, workspaceId),
    directorySubmission: scopeModel(db.directorySubmission as never, workspaceId),
    trackedDomain: scopeModel(db.trackedDomain as never, workspaceId),
    integration: scopeModel(db.integration as never, workspaceId),
    aiGeneration: scopeModel(db.aiGeneration as never, workspaceId),
    usageCounter: scopeModel(db.usageCounter as never, workspaceId),
    subscription: scopeModel(db.subscription as never, workspaceId),
    notification: scopeModel(db.notification as never, workspaceId),
    apiKey: scopeModel(db.apiKey as never, workspaceId),
  };
}
