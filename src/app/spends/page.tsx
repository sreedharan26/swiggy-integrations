import { Ticket, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

import { WeeklyBars } from "@/components/charts/WeeklyBars";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import { getSpendsSummary } from "@/lib/features/spends";
import { formatINR } from "@/lib/utils";
import type { ServiceCategory } from "@/lib/swiggy/types";
import { BudgetEditor } from "./BudgetEditor";

const SERVICE_EMOJI: Record<ServiceCategory, string> = {
  food: "🍔",
  instamart: "🛒",
  dineout: "🍽️",
};

const SERVICE_TAG: Record<ServiceCategory, string> = {
  food: "Food Delivery",
  instamart: "Groceries",
  dineout: "Dineout",
};

const TAG_STYLE: Record<ServiceCategory, string> = {
  food: "bg-brand-50 text-brand-700",
  instamart: "bg-leaf-50 text-leaf-600",
  dineout: "bg-blue-50 text-blue-600",
};

export default async function SpendsPage() {
  const s = await getSpendsSummary();

  return (
    <>
      <PageHeader
        title={`Your spends - ${s.monthLabel}`}
        subtitle="Where your food and grocery budget goes."
      />

      {/* Savings banner */}
      {s.totalSaved > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-leaf-50 px-4 py-4 ring-1 ring-leaf/10 sm:items-center sm:px-5">
          <Sparkles className="h-5 w-5 shrink-0 text-leaf-600 mt-0.5 sm:mt-0" />
          <p className="flex-1 text-sm text-ink">
            You saved <strong className="text-leaf-600">{formatINR(s.totalSaved)}</strong> this month with Swiggy discounts and offers!
          </p>
        </div>
      )}

      {s.nudge.active && s.nudge.coupon && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-brand-50 px-4 py-4 ring-1 ring-brand/10 sm:flex-row sm:items-center sm:px-5">
          <Ticket className="h-5 w-5 shrink-0 text-brand" />
          <p className="flex-1 text-sm text-ink">
            You are at <strong>{s.percentUsed}%</strong> of your budget - here is a
            coupon to stay under: <strong>{s.nudge.coupon.description}</strong>
          </p>
          <span className="self-start rounded-lg border border-dashed border-brand/50 bg-white px-3 py-1.5 text-sm font-bold tracking-wide text-brand whitespace-nowrap sm:self-auto">
            {s.nudge.coupon.code}
          </span>
        </div>
      )}

      {/* Budget bar */}
      <div className="card mb-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-muted">Monthly budget</p>
          <BudgetEditor currentBudget={s.budget} />
        </div>
        <p className="mt-1 text-3xl font-extrabold">
          {formatINR(s.spent)}{" "}
          <span className="text-lg font-semibold text-ink-muted">
            / {formatINR(s.budget)}
          </span>
        </p>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className={`h-full rounded-full ${
              s.percentUsed >= 80 ? "bg-brand" : "bg-leaf"
            }`}
            style={{ width: `${Math.min(100, s.percentUsed)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs">
          <span
            className={s.percentUsed >= 80 ? "text-brand-700" : "text-leaf-600"}
          >
            {s.percentUsed}% of budget used
          </span>
          <span className="text-ink-muted">{formatINR(s.remaining)} left</span>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-1 text-sm font-bold">Weekly spend trend</h2>
          <WeeklyBars data={s.weeks} />
        </div>
        <div className="card">
          <h2 className="mb-4 text-sm font-bold">Breakdown by category</h2>
          <CategoryDonut data={s.categories} total={s.spent} />
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <h2 className="mb-3 text-sm font-bold">Recent transactions</h2>
        {s.transactions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-2xl">🧾</p>
            <p className="mt-2 text-sm font-semibold">No transactions yet</p>
            <p className="mt-1 text-xs text-ink-muted">Your spending history will appear here once you place an order.</p>
          </div>
        ) : (
          <ul className="divide-y divide-black/[0.05]">
          {s.transactions.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.04] text-lg">
                {SERVICE_EMOJI[t.service]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{t.merchant}</p>
                <span className={`pill mt-0.5 ${TAG_STYLE[t.service]}`}>
                  {SERVICE_TAG[t.service]}
                </span>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold">{formatINR(t.amount)}</p>
                <p className="text-xs text-ink-muted">
                  {new Date(t.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            </li>
          ))}
          </ul>
        )}
      </div>
    </>
  );
}
