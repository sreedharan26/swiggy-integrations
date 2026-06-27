export default function HealthLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-60 rounded-lg bg-black/[0.06]" />
      <div className="h-4 w-72 rounded bg-black/[0.04]" />
      {/* Score ring + stat tiles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="h-36 rounded-2xl bg-black/[0.04]" />
        <div className="h-36 rounded-2xl bg-black/[0.04]" />
        <div className="h-36 rounded-2xl bg-black/[0.04]" />
        <div className="h-36 rounded-2xl bg-black/[0.04]" />
      </div>
      {/* Nutrition bar skeleton */}
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/[0.04]">
        <div className="h-4 w-44 rounded bg-black/[0.06]" />
        <div className="mt-3 h-9 w-full rounded-lg bg-black/[0.06]" />
      </div>
      {/* Bottom grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-48 rounded-2xl bg-black/[0.04]" />
        <div className="h-48 rounded-2xl bg-black/[0.04]" />
      </div>
    </div>
  );
}
