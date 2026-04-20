# @launchmint/db

Prisma schema, client, and workspace-scoped helpers.

## Usage

```ts
import { db, dbScoped } from "@launchmint/db";

// Cross-tenant (admin / search index): use raw `db`.
const userCount = await db.user.count();

// Tenant-scoped (app code): use `dbScoped(workspaceId)`.
const scoped = dbScoped(currentWorkspaceId);
const myProducts = await scoped.product.findMany();
const newProduct = await scoped.product.create({
  data: { name: "FormPilot", tagline: "...", websiteUrl: "...", category: "form-builder", description: "..." },
});
```

The scoped client auto-injects `workspaceId` on every query and create. Forgetting to scope is a multi-tenant data leak - use the helper.
