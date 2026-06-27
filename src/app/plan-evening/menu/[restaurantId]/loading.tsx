export default function MenuLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Back link skeleton */}
      <div className="h-4 w-40 rounded bg-black/[0.04]" />
      {/* Restaurant header skeleton */}
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/[0.04] flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 rounded-2xl bg-black/[0.06]" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-48 rounded bg-black/[0.06]" />
          <div className="h-4 w-36 rounded bg-black/[0.04]" />
          <div className="h-3 w-56 rounded bg-black/[0.04]" />
        </div>
      </div>
      {/* Menu items skeleton */}
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/[0.04] space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-black/[0.06]" />
              <div className="h-3 w-24 rounded bg-black/[0.04]" />
            </div>
            <div className="h-9 w-20 rounded-lg bg-black/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}
