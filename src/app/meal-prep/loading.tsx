export default function MealPrepLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-44 rounded-lg bg-black/[0.06]" />
      <div className="h-4 w-72 rounded bg-black/[0.04]" />
      {/* Input area skeleton */}
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/[0.04]">
        <div className="h-12 w-full rounded-xl bg-black/[0.06]" />
        <div className="mt-3 h-10 w-36 rounded-lg bg-black/[0.06]" />
      </div>
      {/* Recipe card skeleton */}
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/[0.04] space-y-3">
        <div className="h-5 w-48 rounded bg-black/[0.06]" />
        <div className="h-4 w-full rounded bg-black/[0.04]" />
        <div className="h-4 w-3/4 rounded bg-black/[0.04]" />
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="h-16 rounded-lg bg-black/[0.04]" />
          <div className="h-16 rounded-lg bg-black/[0.04]" />
          <div className="h-16 rounded-lg bg-black/[0.04]" />
          <div className="h-16 rounded-lg bg-black/[0.04]" />
        </div>
      </div>
    </div>
  );
}
