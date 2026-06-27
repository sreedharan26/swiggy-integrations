import { Leaf, Droplets, Home, TrendingUp, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ScoreRing } from "@/components/ScoreRing";
import { TrendLine } from "@/components/charts/TrendLine";
import { getHealthReport, getAvailableMonths } from "@/lib/features/health";
import { CURRENT_MONTH } from "@/lib/swiggy/seed";
import { MonthSelector } from "./MonthSelector";
import { HealthInteractive } from "./HealthInteractive";

export const dynamic = "force-dynamic";

const NUTRIENT_COLORS: Record<string, string> = {
  Protein: "#FC8019",
  Carbs: "#F5B301",
  Fats: "#EF4444",
  Fiber: "#1BA672",
  Sugar: "#A855F7",
};

const FOOD_GROUP_CONFIG: Record<string, { color: string; emoji: string }> = {
  Veggies: { color: "#1BA672", emoji: "🥬" },
  "Meat/Eggs": { color: "#FC8019", emoji: "🍗" },
  Dairy: { color: "#3B82F6", emoji: "🥛" },
  Fruits: { color: "#F5B301", emoji: "🍎" },
  Other: { color: "#9CA3AF", emoji: "🍽️" },
};

export default async function HealthPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const selectedMonth = params.month ?? CURRENT_MONTH;
  const [r, months] = await Promise.all([
    getHealthReport(selectedMonth),
    getAvailableMonths(),
  ]);

  return (
    <>
      <div className="flex flex-col gap-3 mb-1 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title={`Your eating report - ${r.monthLabel}`}
          subtitle="Gentle insights from your Swiggy orders."
        />
        <MonthSelector months={months} selected={selectedMonth} />
      </div>

      {/* Top stat row */}
      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="card flex items-center justify-center">
          <ScoreRing score={r.score} band={r.band} />
        </div>
        <StatTile
          icon={<Leaf className="h-5 w-5 text-leaf-600" />}
          label="Veggie variety"
          value={`${r.veggieVariety}/10`}
          note="Good variety! Keep adding colours."
        />
        <StatTile
          icon={<Droplets className="h-5 w-5 text-blue-500" />}
          label="Hydration"
          value={`${r.hydration}/10`}
          note="A little more water goes a long way."
        />
        <StatTile
          icon={<Home className="h-5 w-5 text-brand" />}
          label="Home-cooked vs ordered"
          value={`${r.homeCookedPct}/${r.orderedPct}`}
          note="Aim for more home-cooked meals."
        />
      </div>

      {/* Nutrient balance */}
      <div className="card mb-5">
        <h2 className="mb-3 text-sm font-bold">Nutrition balance this month</h2>
        {r.nutrition.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-2xl">🥗</p>
            <p className="mt-2 text-sm font-semibold">No nutrition data yet</p>
            <p className="mt-1 text-xs text-ink-muted">Order some meals and we will break down your nutrition here.</p>
          </div>
        ) : (
          <>
            <div className="flex h-9 w-full overflow-hidden rounded-lg">
              {r.nutrition.map((n) => (
                <div
                  key={n.label}
                  className="flex items-center justify-center text-xs font-semibold text-white"
                  style={{
                    width: `${n.percent}%`,
                    backgroundColor: NUTRIENT_COLORS[n.label] ?? "#999",
                  }}
                >
                  {n.percent >= 8 ? `${n.percent}%` : ""}
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-4">
              {r.nutrition.map((n) => (
                <span key={n.label} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: NUTRIENT_COLORS[n.label] ?? "#999" }}
                  />
                  {n.label} ({n.percent}%)
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Food-group breakdown cards */}
      {r.foodGroups && r.foodGroups.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {r.foodGroups.map((fg) => {
            const cfg = FOOD_GROUP_CONFIG[fg.group] ?? FOOD_GROUP_CONFIG.Other;
            return (
              <div key={fg.group} className="card flex items-center gap-3 !p-3">
                <span className="text-2xl">{cfg.emoji}</span>
                <div>
                  <p className="text-xs text-ink-muted">{fg.group}</p>
                  <p className="text-lg font-extrabold" style={{ color: cfg.color }}>
                    {fg.percent}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Suggestions */}
        <div className="card">
          <h2 className="mb-3 text-sm font-bold">Gentle suggestions</h2>
          <ul className="space-y-2">
            {r.suggestions.map((s, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl bg-black/[0.02] p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-leaf-50 text-leaf-600">
                  <Leaf className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-ink-muted">{s.detail}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-muted" />
              </li>
            ))}
          </ul>
        </div>

        {/* Trend */}
        <div className="card">
          <h2 className="mb-1 flex items-center gap-1.5 text-sm font-bold">
            <TrendingUp className="h-4 w-4 text-leaf-600" />
            Healthy choices trend
          </h2>
          <TrendLine data={r.trend} />
        </div>
      </div>

      {/* AI Health Chat + Actionable suggestions */}
      <HealthInteractive
        month={selectedMonth}
        initialInstamart={r.instamartSuggestions}
        initialRestaurants={r.restaurantSuggestions}
      />

      <p className="mt-5 text-center text-xs text-ink-muted">
        Wellness insights based on your orders. Not medical advice.
      </p>
    </>
  );
}

function StatTile({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="card">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-black/[0.04]">
        {icon}
      </div>
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{note}</p>
    </div>
  );
}
