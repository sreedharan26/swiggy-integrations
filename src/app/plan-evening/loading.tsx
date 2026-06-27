export default function PlanEveningLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-44 rounded-lg bg-black/[0.06]" />
      {/* AI suggestions skeleton */}
      <div className="rounded-2xl bg-black/[0.03] p-4 space-y-3">
        <div className="h-5 w-32 rounded bg-black/[0.06]" />
        <div className="h-10 w-full rounded-xl bg-black/[0.06]" />
        <div className="flex gap-2">
          <div className="h-7 w-24 rounded-full bg-black/[0.06]" />
          <div className="h-7 w-28 rounded-full bg-black/[0.06]" />
          <div className="h-7 w-20 rounded-full bg-black/[0.06]" />
        </div>
      </div>
      {/* Restaurant grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-44 rounded-2xl bg-black/[0.04]" />
        <div className="h-44 rounded-2xl bg-black/[0.04]" />
        <div className="h-44 rounded-2xl bg-black/[0.04]" />
        <div className="h-44 rounded-2xl bg-black/[0.04]" />
      </div>
    </div>
  );
}
