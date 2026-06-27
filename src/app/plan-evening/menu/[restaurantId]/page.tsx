import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { cached } from "@/lib/cache";
import { swiggy } from "@/lib/swiggy";
import { RESTAURANTS } from "@/lib/swiggy/seed";
import { formatINR } from "@/lib/utils";
import { MenuClient } from "./MenuClient";

export const dynamic = "force-dynamic";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const restaurant = RESTAURANTS.find((r) => r.id === restaurantId);
  if (!restaurant) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-bold">Restaurant not found</p>
        <Link href="/plan-evening" className="mt-2 text-sm text-brand hover:underline">
          Back to Plan My Evening
        </Link>
      </div>
    );
  }

  const menuItems = await cached(`menu:${restaurantId}`, 300, () =>
    swiggy.get_restaurant_menu(restaurantId)
  );

  return (
    <>
      {/* Header */}
      <div className="mb-5">
        <Link
          href="/plan-evening"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Plan My Evening
        </Link>

        <div className="card flex items-start gap-3 sm:items-center sm:gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/[0.04] text-3xl sm:h-16 sm:w-16 sm:text-4xl">
            {restaurant.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold sm:text-xl">{restaurant.name}</h1>
            <p className="text-sm text-ink-muted truncate">{restaurant.cuisines.join(", ")}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-muted sm:gap-3">
              <span className="inline-flex items-center gap-0.5 font-semibold text-leaf-600">
                <Star className="h-3 w-3 fill-leaf-600" /> {restaurant.rating}
              </span>
              <span>{restaurant.etaMinutes} min</span>
              <span>{formatINR(restaurant.costForTwo)} for two</span>
              <span className="hidden sm:inline">{restaurant.area}</span>
            </div>
          </div>
        </div>
      </div>

      <MenuClient menuItems={menuItems} restaurantName={restaurant.name} />
    </>
  );
}
