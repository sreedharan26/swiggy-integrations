export default function SpendsLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-56 rounded-lg bg-black/[0.06]" />
      <div className="h-4 w-72 rounded bg-black/[0.04]" />
      {/* Budget bar skeleton */}
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/[0.04]">
        <div className="h-4 w-28 rounded bg-black/[0.06]" />
        <div className="mt-2 h-8 w-40 rounded bg-black/[0.06]" />
        <div className="mt-3 h-2.5 w-full rounded-full bg-black/[0.06]" />
      </div>
      {/* Chart skeletons */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-48 rounded-2xl bg-black/[0.04]" />
        <div className="h-48 rounded-2xl bg-black/[0.04]" />
      </div>
      {/* Transactions skeleton */}
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/[0.04] space-y-3">
        <div className="h-4 w-36 rounded bg-black/[0.06]" />
        <div className="h-12 rounded-lg bg-black/[0.04]" />
        <div className="h-12 rounded-lg bg-black/[0.04]" />
        <div className="h-12 rounded-lg bg-black/[0.04]" />
      </div>
    </div>
  );
}
