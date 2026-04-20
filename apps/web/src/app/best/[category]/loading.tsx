import { Skeleton } from "@launchmint/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function BestLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-2 h-8 w-80" />
        <Skeleton className="mt-3 h-4 w-3/4" />
        <ol className="mt-8 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-start gap-4 rounded-lg border p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </div>
  );
}
