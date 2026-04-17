import { db } from "@launchmint/db";
import { getBacklinkSummary } from "@launchmint/seo-data";
import type { HandlerMap } from "@launchmint/queue";

export const seoHandlers: HandlerMap = {
  "seo-snapshot-domain": async (data) => {
    const td = await db.trackedDomain.findUnique({ where: { id: data.trackedDomainId } });
    if (!td) throw new Error(`trackedDomain ${data.trackedDomainId} not found`);
    if (!td.productId) {
      // SeoSnapshot is product-scoped; skip until the domain is linked.
      return;
    }

    const summary = await getBacklinkSummary(td.domain);
    await db.seoSnapshot.create({
      data: {
        productId: td.productId,
        domain: td.domain,
        domainRating: summary.rank,
        backlinkCount: summary.totalBacklinks,
        refDomainCount: summary.referringDomains,
        source: "dataforseo",
      },
    });
  },
};
