export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-black/[0.06]" />
      <div className="h-4 w-64 rounded bg-black/[0.04]" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-40 rounded-2xl bg-black/[0.04]" />
        <div className="h-40 rounded-2xl bg-black/[0.04]" />
        <div className="h-40 rounded-2xl bg-black/[0.04]" />
      </div>
    </div>
  );
}
