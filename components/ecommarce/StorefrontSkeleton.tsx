import type { ReactNode } from "react";

export function LoadingSurface({ children, trackProgress = true }: { children: ReactNode; trackProgress?: boolean }) {
  return <div data-storefront-loading={trackProgress ? "route" : undefined} role="status" aria-busy="true" aria-label="Loading page" className="storefront-skeleton">
    <span className="sr-only">Loading, please wait…</span>
    <div aria-hidden="true">{children}</div>
  </div>;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return <div className="grid grid-cols-2 gap-x-2 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: count }, (_, index) => <div key={index} className="space-y-3">
      <div className="skeleton-block aspect-[2/3]" />
      <div className="skeleton-block h-3 w-4/5" /><div className="skeleton-block h-3 w-1/3" />
    </div>)}
  </div>;
}

export function CatalogSkeleton() {
  return <LoadingSurface><div className="px-[3.3%] py-10">
    <div className="mx-auto mb-10 max-w-lg space-y-4"><div className="skeleton-block mx-auto h-3 w-36" /><div className="skeleton-block h-12" /><div className="skeleton-block mx-auto h-3 w-3/4" /></div>
    <div className="skeleton-block mb-8 h-10" />
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]"><div className="hidden space-y-6 lg:block">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton-block h-14" />)}</div><ProductGridSkeleton /></div>
  </div></LoadingSurface>;
}

export function HomeSkeleton() {
  return <LoadingSurface><div className="skeleton-block h-[85svh] min-h-[480px]" /><div className="p-[3.3%]"><ProductGridSkeleton count={4} /></div></LoadingSurface>;
}

export function ContentSkeleton() {
  return <LoadingSurface><div className="mx-auto min-h-[65vh] max-w-5xl space-y-7 px-5 py-12"><div className="skeleton-block h-10 w-2/3" /><div className="skeleton-block h-4 w-1/2" /><div className="skeleton-block h-44" />{[1, 2, 3].map(i => <div key={i} className="skeleton-block h-5" />)}</div></LoadingSurface>;
}

export function ProductSkeleton() {
  return <LoadingSurface><div className="grid gap-8 px-[3.3%] py-5 md:grid-cols-2"><div className="grid grid-cols-2 gap-1"><div className="skeleton-block aspect-[2/3]" /><div className="skeleton-block aspect-[2/3]" /></div><div className="space-y-6 py-8"><div className="skeleton-block h-4 w-1/3" /><div className="skeleton-block h-20 w-4/5" /><div className="skeleton-block h-6 w-1/4" /><div className="skeleton-block h-14" /><div className="skeleton-block h-12" /><div className="skeleton-block h-36" /></div></div></LoadingSurface>;
}
