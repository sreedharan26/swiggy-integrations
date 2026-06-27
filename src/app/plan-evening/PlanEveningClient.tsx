"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Utensils, ShoppingBag, Star, Search, MapPin, Clock as ClockIcon,
  Tag, ChevronDown, ChevronUp, Sparkles,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PreferencesBar } from "./PreferencesBar";
import { QuickPicks } from "./QuickPicks";
import { AISuggestions } from "./AISuggestions";
import {
  searchDineoutRestaurants, searchDeliveryRestaurants,
  getRestaurantDetails, bookTable,
} from "./actions";
import type { DineoutRestaurant, DineoutRestaurantDetails, MenuItem, Restaurant, Slot } from "@/lib/swiggy/types";

interface Props {
  initialDineOut: DineoutRestaurant[];
  initialOrderIn: Restaurant[];
  slots: Slot[];
  reason: string;
  quickPicks: Array<{ menuItem: MenuItem; restaurant: Restaurant; orderCount: number }>;
}

const PE_KEY = "saathi:plan-evening";

function loadPE<T>(field: string, fallback: T): T {
  try {
    const v = sessionStorage.getItem(`${PE_KEY}:${field}`);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function savePE(field: string, value: unknown) {
  try { sessionStorage.setItem(`${PE_KEY}:${field}`, JSON.stringify(value)); } catch {}
}

export function PlanEveningClient({ initialDineOut, initialOrderIn, slots, reason, quickPicks }: Props) {
  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState("20:00");
  const [dineOutList, setDineOutList] = useState(initialDineOut);
  const [orderInList, setOrderInList] = useState(initialOrderIn);
  const [dineQuery, setDineQuery] = useState("");
  const [orderQuery, setOrderQuery] = useState("");

  const [expandedDetails, setExpandedDetails] = useState<string | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<string, DineoutRestaurantDetails>>({});

  const [reserveTarget, setReserveTarget] = useState<DineoutRestaurant | null>(null);
  const [reserving, setReserving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setGuests(loadPE("guests", 2));
    setTime(loadPE("time", "20:00"));
  }, []);

  useEffect(() => { savePE("guests", guests); }, [guests]);
  useEffect(() => { savePE("time", time); }, [time]);

  const slotLabel = slots.find((s) => s.time === time)?.label ?? "8:00 PM";

  const handleAIBookDineout = useCallback((restaurantId: string) => {
    const r = initialDineOut.find((d) => d.id === restaurantId);
    if (r) setReserveTarget(r);
  }, [initialDineOut]);

  const handleDineSearch = useCallback(async (q: string) => {
    setDineQuery(q);
    if (!q.trim()) { setDineOutList(initialDineOut); return; }
    const results = await searchDineoutRestaurants(q);
    setDineOutList(results);
  }, [initialDineOut]);

  const handleOrderSearch = useCallback(async (q: string) => {
    setOrderQuery(q);
    if (!q.trim()) { setOrderInList(initialOrderIn); return; }
    const results = await searchDeliveryRestaurants(q);
    setOrderInList(results);
  }, [initialOrderIn]);

  const toggleDetails = useCallback(async (id: string) => {
    if (expandedDetails === id) { setExpandedDetails(null); return; }
    setExpandedDetails(id);
    if (!detailsCache[id]) {
      const details = await getRestaurantDetails(id);
      setDetailsCache((prev) => ({ ...prev, [id]: details }));
    }
  }, [expandedDetails, detailsCache]);

  const handleReserve = useCallback(async () => {
    if (!reserveTarget) return;
    setReserving(true);
    const result = await bookTable({
      restaurantId: reserveTarget.id,
      date: "2025-06-27",
      time,
      guests,
    });
    if (result.ok) {
      setToast(`Table reserved at ${result.booking.restaurantName}! Booking ID: ${result.booking.bookingId}`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("saathi:order-placed"));
      }
    } else {
      setToast(result.error);
    }
    setReserving(false);
    setReserveTarget(null);
  }, [reserveTarget, time, guests]);

  return (
    <>
      {/* AI reason */}
      <p className="-mt-3 mb-4 flex items-center gap-1.5 text-sm text-ink-muted">
        <Sparkles className="h-4 w-4 text-brand" />
        {reason}
      </p>

      <PreferencesBar
        guests={guests}
        onGuestsChange={setGuests}
        time={time}
        onTimeChange={setTime}
        slots={slots}
      />

      <AISuggestions guests={guests} onBookDineout={handleAIBookDineout} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* ─── Dine Out ─── */}
        <div className="rounded-2xl bg-brand-50/60 p-4 ring-1 ring-brand/10">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
              <Utensils className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold">Dine Out</h2>
              <p className="text-xs text-ink-muted">Reserve a table at top spots nearby.</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={dineQuery}
              onChange={(e) => handleDineSearch(e.target.value)}
              placeholder="Search restaurants or cuisines..."
              className="w-full rounded-xl border border-black/10 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
            />
          </div>

          <div className="space-y-2.5">
            {dineOutList.length === 0 && (
              <p className="py-4 text-center text-sm text-ink-muted">No restaurants found.</p>
            )}
            {dineOutList.map((r) => (
              <div key={r.id}>
                <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-black/[0.04] text-2xl">
                    {r.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{r.name}</p>
                    <p className="text-xs text-ink-muted truncate">{r.cuisines.slice(0, 2).join(", ")}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                      <span className="inline-flex items-center gap-0.5 font-semibold text-leaf-600">
                        <Star className="h-3 w-3 fill-leaf-600" /> {r.rating}
                      </span>
                      · {r.distanceKm} km · {formatINR(r.costForTwo)} for two
                    </p>
                    <button
                      onClick={() => toggleDetails(r.id)}
                      className="mt-1 flex items-center gap-0.5 text-xs font-semibold text-brand hover:underline"
                    >
                      {expandedDetails === r.id ? "Hide details" : "View details"}
                      {expandedDetails === r.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="pill bg-brand-50 text-brand-700 text-xs">{slotLabel}</span>
                    <button
                      onClick={() => setReserveTarget(r)}
                      className="btn-primary !px-3 !py-1.5 !text-xs"
                    >
                      Reserve Table
                    </button>
                  </div>
                </div>
                {/* Expanded details */}
                {expandedDetails === r.id && detailsCache[r.id] && (
                  <div className="mt-1 rounded-xl bg-white/80 p-3 text-xs text-ink-muted space-y-1">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {detailsCache[r.id].address}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <ClockIcon className="h-3.5 w-3.5" /> {detailsCache[r.id].timings}
                    </p>
                    {detailsCache[r.id].deals.map((d, i) => (
                      <p key={i} className="flex items-center gap-1.5 font-semibold text-leaf-600">
                        <Tag className="h-3.5 w-3.5" /> {d}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Order In ─── */}
        <div className="rounded-2xl bg-leaf-50/60 p-4 ring-1 ring-leaf/10">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf text-white">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold">Order In</h2>
              <p className="text-xs text-ink-muted">Great food, delivered to your door.</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => handleOrderSearch(e.target.value)}
              placeholder="Search restaurants or cuisines..."
              className="w-full rounded-xl border border-black/10 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-leaf"
            />
          </div>

          <div className="space-y-2.5">
            {orderInList.length === 0 && (
              <p className="py-4 text-center text-sm text-ink-muted">No restaurants found.</p>
            )}
            {orderInList.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-card"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-black/[0.04] text-2xl">
                  {r.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{r.name}</p>
                  <p className="text-xs text-ink-muted truncate">{r.cuisines.slice(0, 2).join(", ")}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                    <span className="inline-flex items-center gap-0.5 font-semibold text-leaf-600">
                      <Star className="h-3 w-3 fill-leaf-600" /> {r.rating}
                    </span>
                    · {r.etaMinutes} min · {formatINR(r.costForTwo)} for two
                  </p>
                </div>
                <Link
                  href={`/plan-evening/menu/${r.id}`}
                  className="btn-primary !bg-leaf !px-3 !py-1.5 !text-xs shrink-0"
                >
                  Browse Menu
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick picks */}
      {quickPicks.length > 0 && (
        <QuickPicks items={quickPicks} />
      )}

      {/* Reserve confirmation dialog */}
      <ConfirmDialog
        open={!!reserveTarget}
        title="Confirm Reservation"
        message={
          reserveTarget
            ? `Reserve a table for ${guests} at ${reserveTarget.name} at ${slotLabel}?`
            : ""
        }
        confirmLabel="Reserve Table"
        onConfirm={handleReserve}
        onCancel={() => setReserveTarget(null)}
        loading={reserving}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-xl animate-in slide-in-from-bottom-4">
          {toast}
          <button onClick={() => setToast(null)} className="ml-3 text-white/60 hover:text-white">
            ✕
          </button>
        </div>
      )}
    </>
  );
}
