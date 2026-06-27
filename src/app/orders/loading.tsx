export default function OrdersLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-40 rounded-lg bg-black/[0.06]" />
      <div className="h-4 w-64 rounded bg-black/[0.04]" />
      {/* Active order skeleton */}
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/[0.04] border-l-4 border-black/[0.06]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-black/[0.06]" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 rounded bg-black/[0.06]" />
            <div className="h-3 w-20 rounded bg-black/[0.04]" />
          </div>
        </div>
        <div className="mt-4 h-8 rounded-lg bg-black/[0.04]" />
      </div>
      {/* Past orders skeleton */}
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/[0.04] space-y-3">
        <div className="h-4 w-24 rounded bg-black/[0.06]" />
        <div className="h-14 rounded-lg bg-black/[0.04]" />
        <div className="h-14 rounded-lg bg-black/[0.04]" />
        <div className="h-14 rounded-lg bg-black/[0.04]" />
      </div>
    </div>
  );
}
