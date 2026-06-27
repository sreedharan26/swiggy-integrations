"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import {
  Sparkles, Clock, BarChart3, ShoppingCart, Zap, Check,
  Plus, Minus, Trash2, ChefHat, History,
} from "lucide-react";
import Link from "next/link";
import { generateMealPlanAction, placeInstamartOrderAction, saveMealHistory, getMealHistory } from "./actions";
import type { MealPlan } from "@/lib/features/mealprep";
import type { CartLine } from "@/lib/swiggy/types";
import { formatINR } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const SUGGESTIONS = [
  "Butter Chicken for 4",
  "Paneer Butter Masala for 2",
  "Veg Pulao for 3",
  "Dal Tadka for 4",
];

const SS_KEY_PLAN = "saathi:mealprep:plan";
const SS_KEY_CART = "saathi:mealprep:cart";
const SS_KEY_QUERY = "saathi:mealprep:query";

export function MealPrepClient() {
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderPending, setOrderPending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [servings, setServings] = useState(4);
  const [history, setHistory] = useState<{ dish: string; servings: number }[]>([]);

  useEffect(() => {
    try {
      const savedPlan = sessionStorage.getItem(SS_KEY_PLAN);
      const savedCart = sessionStorage.getItem(SS_KEY_CART);
      const savedQuery = sessionStorage.getItem(SS_KEY_QUERY);
      if (savedPlan) {
        const p = JSON.parse(savedPlan) as MealPlan;
        setPlan(p);
        setServings(p.recipe.servings);
      }
      if (savedCart) setCartLines(JSON.parse(savedCart));
      if (savedQuery) setQuery(savedQuery);
    } catch {}
    getMealHistory().then(setHistory).catch(() => {});
  }, []);

  useEffect(() => {
    try {
      if (plan) sessionStorage.setItem(SS_KEY_PLAN, JSON.stringify(plan));
      else sessionStorage.removeItem(SS_KEY_PLAN);
    } catch {}
  }, [plan]);

  useEffect(() => {
    try {
      if (cartLines.length) sessionStorage.setItem(SS_KEY_CART, JSON.stringify(cartLines));
      else sessionStorage.removeItem(SS_KEY_CART);
    } catch {}
  }, [cartLines]);

  useEffect(() => {
    try {
      if (query) sessionStorage.setItem(SS_KEY_QUERY, query);
      else sessionStorage.removeItem(SS_KEY_QUERY);
    } catch {}
  }, [query]);

  const [validationError, setValidationError] = useState<string | null>(null);

  const run = useCallback((q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 3) {
      setValidationError("Please enter at least 3 characters.");
      return;
    }
    if (trimmed.length > 200) {
      setValidationError("Input is too long (max 200 characters).");
      return;
    }
    setValidationError(null);
    setError(null);
    startTransition(async () => {
      const res = await generateMealPlanAction(trimmed);
      if (res.ok) {
        setPlan(res.plan);
        setCartLines(res.plan.cart.lines);
        setServings(res.plan.recipe.servings);
        saveMealHistory(res.plan.recipe.dish, res.plan.recipe.servings).catch(() => {});
        getMealHistory().then(setHistory).catch(() => {});
      } else {
        setError(res.error);
      }
    });
  }, []);

  function updateQty(spin: string, delta: number) {
    setCartLines((prev) =>
      prev
        .map((l) => (l.spin === spin ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0)
    );
  }

  function removeItem(spin: string) {
    setCartLines((prev) => prev.filter((l) => l.spin !== spin));
  }

  const subtotal = cartLines.reduce((s, l) => s + l.price * l.quantity, 0);

  async function handlePlaceOrder() {
    if (!plan) return;
    setOrderPending(true);
    const res = await placeInstamartOrderAction(cartLines, plan.recipe.dish);
    setOrderPending(false);
    setShowConfirm(false);
    if (res.ok) {
      if (typeof window !== "undefined") {
        import("canvas-confetti").then(({ default: confetti }) => {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        });
        window.dispatchEvent(new CustomEvent("saathi:order-placed"));
      }
      setToast(`Order placed! ${formatINR(res.order.amount)}`);
      setTimeout(() => setToast(null), 5000);
    } else {
      setToast(res.error);
      setTimeout(() => setToast(null), 4000);
    }
  }

  function handleServingsChange(newServings: number) {
    if (newServings < 1 || newServings > 20) return;
    setServings(newServings);
    if (plan) {
      const q = plan.recipe.dish + " for " + newServings;
      setQuery(q);
      run(q);
    }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-lg flex items-center gap-3">
          <Check className="h-4 w-4" />
          {toast}
          {toast.startsWith("Order placed") && (
            <Link href="/orders" className="underline font-bold">Track it</Link>
          )}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); run(query); }}
        className="mb-1 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-card ring-1 ring-black/[0.04] sm:flex-row"
      >
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setValidationError(null); }}
          placeholder="I want to cook Butter Chicken for 4 this week"
          maxLength={200}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-ink-muted"
        />
        <button type="submit" disabled={pending || !query.trim()} className="btn-primary !bg-brand hover:!bg-brand-600 disabled:opacity-40 w-full sm:w-auto min-h-[44px]">
          <Sparkles className="h-4 w-4" />
          {pending ? "Cooking..." : "Generate"}
        </button>
      </form>
      {validationError && (
        <p className="mb-2 ml-2 text-xs text-red-500">{validationError}</p>
      )}
      {!validationError && <div className="mb-3" />}

      <div className="mb-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setQuery(s); run(s); }}
            className="rounded-full bg-black/[0.04] px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-black/[0.07]"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Dish history */}
      {history.length > 0 && (
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <History className="h-4 w-4 text-ink-muted" />
          <span className="text-xs font-semibold text-ink-muted">Recent:</span>
          {history.map((h, i) => (
            <button
              key={`${h.dish}-${i}`}
              onClick={() => { const q = `${h.dish} for ${h.servings}`; setQuery(q); run(q); }}
              className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand/20"
            >
              {h.dish}
            </button>
          ))}
        </div>
      )}

      {error && <div className="card mb-4 text-sm text-red-600">{error}</div>}

      {!plan && !pending && !error && (
        <div className="card text-sm text-ink-muted">
          Type a dish above and I will build a ready-to-checkout Instamart cart from the ingredients.
        </div>
      )}

      {plan && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Recipe */}
          <div className="card">
            <div className="flex h-36 items-center justify-center rounded-xl bg-brand-50 text-6xl">
              🍛
            </div>
            <h2 className="mt-4 text-xl font-extrabold">{plan.recipe.dish}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-muted sm:gap-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleServingsChange(servings - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.06] hover:bg-black/[0.1]"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="font-semibold text-ink min-w-[60px] text-center">{servings} servings</span>
                <button
                  onClick={() => handleServingsChange(servings + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.06] hover:bg-black/[0.1]"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {plan.recipe.cookTimeMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" /> {plan.recipe.difficulty}
              </span>
            </div>

            <h3 className="mt-4 text-sm font-bold">Ingredients</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              {plan.recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-leaf-50 text-[11px] font-bold text-leaf-600">
                    {i + 1}
                  </span>
                  <span className="flex-1">{ing.name}</span>
                  <span className="text-ink-muted">{ing.quantity}</span>
                </li>
              ))}
            </ul>

            {/* Recipe steps */}
            {plan.recipe.steps && plan.recipe.steps.length > 0 && (
              <>
                <h3 className="mt-5 flex items-center gap-2 text-sm font-bold">
                  <ChefHat className="h-4 w-4" /> Steps
                </h3>
                <ol className="mt-2 space-y-2 text-sm">
                  {plan.recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
                        {i + 1}
                      </span>
                      <span className="text-ink-muted">{step}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>

          {/* Auto-built cart */}
          <div className="card">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛒</span>
              <h2 className="text-lg font-bold">Instamart cart</h2>
              <span className="pill bg-leaf-50 text-leaf-600">
                Auto-built · {cartLines.length}/{plan.total} matched
              </span>
            </div>

            <ul className="mt-4 divide-y divide-black/[0.05]">
              {cartLines.map((line, idx) => (
                <li key={`${line.spin}-${idx}`} className="flex items-center gap-3 py-2.5">
                  {line.emoji && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/[0.04] text-lg">
                      {line.emoji}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{line.name}</p>
                    <p className="text-xs text-ink-muted">
                      {line.brand} · {line.packSize}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQty(line.spin, -1)}
                      aria-label={`Decrease quantity of ${line.name}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.06] hover:bg-black/[0.1]"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[20px] text-center text-sm font-bold">{line.quantity}</span>
                    <button
                      onClick={() => updateQty(line.spin, 1)}
                      aria-label={`Increase quantity of ${line.name}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.06] hover:bg-black/[0.1]"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeItem(line.spin)}
                      aria-label={`Remove ${line.name} from cart`}
                      className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-sm font-bold w-14 text-right">
                    {formatINR(line.price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {cartLines.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-muted">Cart is empty</p>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] pt-4">
              <span className="text-sm text-ink-muted">Subtotal</span>
              <span className="text-xl font-extrabold">{formatINR(subtotal)}</span>
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              disabled={cartLines.length === 0}
              className="btn-primary mt-3 w-full disabled:opacity-40"
            >
              <ShoppingCart className="h-4 w-4" />
              Place Instamart order
            </button>
            <p className="mt-2 flex items-center justify-center gap-1 text-xs text-ink-muted">
              <Check className="h-3.5 w-3.5 text-leaf" />
              You confirm before anything is ordered
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-leaf-50 px-4 py-3 text-sm text-leaf-600">
              <Zap className="h-4 w-4" />
              Short on time? Order {plan.recipe.dish} on Food instead.
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showConfirm}
        title="Place order?"
        message={`Order ${cartLines.length} item${cartLines.length !== 1 ? "s" : ""} for ${formatINR(subtotal)} from Instamart?`}
        confirmLabel="Place order"
        onConfirm={handlePlaceOrder}
        onCancel={() => setShowConfirm(false)}
        loading={orderPending}
      />
    </div>
  );
}
