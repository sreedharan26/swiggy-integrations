import { PageHeader } from "@/components/PageHeader";
import { OrderStatusStepper } from "@/components/OrderStatusStepper";
import { orderStore } from "@/lib/store/orderStore";
import { formatINR } from "@/lib/utils";
import type { ServiceCategory, TrackedOrder } from "@/lib/swiggy/types";

export const dynamic = "force-dynamic";

const SERVICE_EMOJI: Record<ServiceCategory, string> = {
  food: "🍔",
  instamart: "🛒",
  dineout: "🍽️",
};

export default async function OrdersPage() {
  const active = orderStore.getActive();
  const all = await orderStore.getAllTracked();
  const past = all.filter(
    (o) => o.status === "delivered" || o.status === "completed" || o.status === "cancelled"
  );

  return (
    <>
      <PageHeader title="Your Orders" subtitle="Track active orders and view past ones." />

      {active.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold text-ink-muted uppercase tracking-wider">Active Orders</h2>
          <div className="space-y-4">
            {active.map((order) => (
              <ActiveOrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}

      {active.length === 0 && (
        <div className="card mb-6 text-center text-sm text-ink-muted py-8">
          No active orders right now. Place one from Meal Prep or Food!
        </div>
      )}

      <section>
        <h2 className="mb-3 text-sm font-bold text-ink-muted uppercase tracking-wider">Past Orders</h2>
        {past.length === 0 ? (
          <div className="card py-10 text-center">
            <p className="text-2xl">📦</p>
            <p className="mt-2 text-sm font-semibold">No past orders yet</p>
            <p className="mt-1 text-xs text-ink-muted">Your completed orders will show up here.</p>
          </div>
        ) : (
          <div className="card">
            <ul className="divide-y divide-black/[0.05]">
            {past.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.04] text-lg">
                  {SERVICE_EMOJI[t.service]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.merchant}</p>
                  <p className="text-xs text-ink-muted truncate">
                    {t.items.length} item{t.items.length !== 1 ? "s" : ""} · {t.date}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{formatINR(t.amount)}</p>
                  <span className="text-xs text-leaf-600 font-medium">Delivered</span>
                </div>
              </li>
            ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}

function ActiveOrderCard({ order }: { order: TrackedOrder }) {
  return (
    <div className="card border-l-4 border-brand">
      <div className="flex items-start justify-between gap-2 mb-4 sm:items-center">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">{SERVICE_EMOJI[order.service]}</span>
          <div className="min-w-0">
            <p className="font-bold truncate">{order.merchant}</p>
            <p className="text-xs text-ink-muted">{formatINR(order.amount)}</p>
          </div>
        </div>
        {order.etaMinutes && (
          <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 whitespace-nowrap">
            ETA {order.etaMinutes} min
          </span>
        )}
      </div>
      <OrderStatusStepper service={order.service} currentStatus={order.status} />
    </div>
  );
}
