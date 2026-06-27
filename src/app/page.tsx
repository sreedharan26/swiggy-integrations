import Link from "next/link";
import {
  Wallet,
  UtensilsCrossed,
  CalendarClock,
  HeartPulse,
  Clock,
  ChevronRight,
  Leaf,
  Droplets,
  Home as HomeIcon,
} from "lucide-react";
import { getSpendsSummary } from "@/lib/features/spends";
import { getHealthReport } from "@/lib/features/health";
import { USER } from "@/lib/swiggy/seed";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [spends, health] = await Promise.all([
    getSpendsSummary(),
    getHealthReport(),
  ]);

  return (
    <>
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          Good morning, {USER.name} 👋
        </h1>
        <span className="self-start rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 sm:self-auto">
          Swiggy One
        </span>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Spends */}
        <Card href="/spends" icon={<Wallet className="h-5 w-5" />} title="This month's spends">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-extrabold text-brand">
                {formatINR(spends.spent)}
              </p>
              <p className="text-sm text-ink-muted">of {formatINR(spends.budget)} budget</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold">{spends.percentUsed}%</p>
              <p className="text-xs text-ink-muted">used</p>
            </div>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
            <div
              className={`h-full rounded-full ${
                spends.percentUsed >= 80 ? "bg-brand" : "bg-leaf"
              }`}
              style={{ width: `${Math.min(100, spends.percentUsed)}%` }}
            />
          </div>
          {spends.totalSaved > 0 && (
            <p className="mt-2 text-xs text-leaf-600 font-semibold">
              💰 Saved {formatINR(spends.totalSaved)} with Swiggy discounts
            </p>
          )}
        </Card>

        {/* Meal prep */}
        <Card
          href="/meal-prep"
          icon={<UtensilsCrossed className="h-5 w-5" />}
          title="Meal Prep to Cart"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-20 w-24 items-center justify-center rounded-xl bg-brand-50 text-4xl">
              🍛
            </span>
            <div>
              <p className="text-lg font-extrabold">Butter Chicken</p>
              <p className="text-sm text-ink-muted">4 servings</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                <Clock className="h-3.5 w-3.5" /> 35 min
              </p>
            </div>
          </div>
          <span className="btn-primary mt-4 w-full">Build the cart</span>
        </Card>

        {/* Plan evening */}
        <Card
          href="/plan-evening"
          icon={<CalendarClock className="h-5 w-5" />}
          title="Plan my evening"
        >
          <p className="py-2 text-center text-lg font-bold">
            Table for 4 at 8 PM
            <br />
            or order in?
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <span className="btn-outline">Book a table</span>
            <span className="btn-primary">Order in</span>
          </div>
        </Card>

        {/* Health */}
        <Card
          href="/health"
          icon={<HeartPulse className="h-5 w-5" />}
          title="Health snapshot"
        >
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-leaf-600">{health.score}</p>
              <p className="text-xs text-ink-muted">/100</p>
            </div>
            <div>
              <p className="font-bold text-leaf-600">{health.band} month</p>
              <div className="mt-2 flex gap-3 text-xs text-ink-muted">
                <span className="flex items-center gap-1">
                  <Leaf className="h-3.5 w-3.5 text-leaf-600" /> {health.veggieVariety}/10
                </span>
                <span className="flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-blue-500" /> {health.hydration}/10
                </span>
                <span className="flex items-center gap-1">
                  <HomeIcon className="h-3.5 w-3.5 text-brand" /> {health.homeCookedPct}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

function Card({
  href,
  icon,
  title,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="card group transition hover:shadow-lg">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/[0.04] text-ink-muted">
          {icon}
        </span>
        <h2 className="flex-1 font-bold">{title}</h2>
        <ChevronRight className="h-4 w-4 text-ink-muted transition group-hover:translate-x-0.5" />
      </div>
      {children}
    </Link>
  );
}
