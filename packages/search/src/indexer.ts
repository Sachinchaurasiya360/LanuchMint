import { getTypesense } from "./client.js";
import { ALL_SCHEMAS } from "./schemas.js";

export async function ensureCollections(): Promise<void> {
  const ts = getTypesense();
  for (const schema of ALL_SCHEMAS) {
    try {
      await ts.collections(schema.name).retrieve();
    } catch {
      await ts.collections().create(schema);
    }
  }
}

export async function upsertDoc(
  collection: string,
  doc: Record<string, unknown>,
): Promise<void> {
  await getTypesense().collections(collection).documents().upsert(doc);
}

export async function deleteDoc(collection: string, id: string): Promise<void> {
  await getTypesense().collections(collection).documents(id).delete();
}

export interface SearchArgs {
  collection: string;
  q: string;
  queryBy: string;
  filterBy?: string;
  sortBy?: string;
  page?: number;
  perPage?: number;
  facetBy?: string;
}

export async function searchDocs<T>(args: SearchArgs) {
  const ts = getTypesense();
  return ts.collections(args.collection).documents().search({
    q: args.q,
    query_by: args.queryBy,
    filter_by: args.filterBy,
    sort_by: args.sortBy,
    page: args.page ?? 1,
    per_page: args.perPage ?? 20,
    facet_by: args.facetBy,
  }) as Promise<{
    found: number;
    hits: { document: T }[];
    facet_counts?: { field_name: string; counts: { value: string; count: number }[] }[];
  }>;
}
