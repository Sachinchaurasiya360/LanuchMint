import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections.js";

export const PRODUCTS_SCHEMA: CollectionCreateSchema = {
  name: "products",
  fields: [
    { name: "id", type: "string" },
    { name: "slug", type: "string" },
    { name: "name", type: "string" },
    { name: "tagline", type: "string" },
    { name: "description", type: "string", optional: true },
    { name: "category", type: "string", facet: true },
    { name: "tags", type: "string[]", facet: true, optional: true },
    { name: "upvoteCount", type: "int32" },
    { name: "reviewCount", type: "int32" },
    { name: "averageRating", type: "float" },
    { name: "publishedAt", type: "int64" },
    { name: "logoUrl", type: "string", optional: true },
  ],
  default_sorting_field: "upvoteCount",
};

export const FOUNDERS_SCHEMA: CollectionCreateSchema = {
  name: "founders",
  fields: [
    { name: "id", type: "string" },
    { name: "slug", type: "string" },
    { name: "displayName", type: "string" },
    { name: "headline", type: "string", optional: true },
    { name: "bio", type: "string", optional: true },
    { name: "skills", type: "string[]", facet: true, optional: true },
    { name: "verifiedMrrUsd", type: "float", optional: true },
    { name: "country", type: "string", facet: true, optional: true },
    { name: "avatarUrl", type: "string", optional: true },
  ],
  default_sorting_field: "verifiedMrrUsd",
};

export const DIRECTORIES_SCHEMA: CollectionCreateSchema = {
  name: "directories",
  fields: [
    { name: "id", type: "string" },
    { name: "slug", type: "string" },
    { name: "name", type: "string" },
    { name: "description", type: "string", optional: true },
    { name: "domainAuthority", type: "int32", optional: true },
    { name: "submissionCost", type: "string", facet: true, optional: true },
    { name: "category", type: "string", facet: true, optional: true },
  ],
  default_sorting_field: "domainAuthority",
};

export const ALL_SCHEMAS = [PRODUCTS_SCHEMA, FOUNDERS_SCHEMA, DIRECTORIES_SCHEMA];
