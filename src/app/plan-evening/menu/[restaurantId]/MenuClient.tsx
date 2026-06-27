"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, Tag, X, Flame } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  updateFoodCart, getFoodCoupons, applyFoodCoupon, placeFoodOrder,
} from "../../actions";
import type { MenuItem, FoodCartItem, Coupon } from "@/lib/swiggy/types";

interface MenuClientProps {
  menuItems: MenuItem[];
  restaurantName: string;
}

export function MenuClient({ menuItems, restaurantName }: MenuClientProps) {
  const router = useRouter();
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [showCart, setShowCart] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [placing, setPlacing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const categories = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of menuItems) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return [...map.entries()];
  }, [menuItems]);

  const cartItems = useMemo(() => {
    const items: Array<MenuItem & { qty: number }> = [];
    for (const [id, qty] of cart) {
      const mi = menuItems.find((m) => m.id === id);
      if (mi && qty > 0) items.push({ ...mi, qty });
    }
    return items;
  }, [cart, menuItems]);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = cartItems.length > 0 ? 30 : 0;
  const discount = appliedCoupon?.discount ?? 0;
  const total = subtotal + deliveryFee - discount;
  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const updateQty = useCallback((menuItemId: string, delta: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      const current = next.get(menuItemId) ?? 0;
      const newQty = Math.max(0, current + delta);
      if (newQty === 0) next.delete(menuItemId);
      else next.set(menuItemId, newQty);
      return next;
    });
    setAppliedCoupon(null);
  }, []);

  const handleViewCart = useCallback(async () => {
    const items: FoodCartItem[] = cartItems.map((i) => ({ menuItemId: i.id, quantity: i.qty }));
    const cartResult = await updateFoodCart(items);
    if (!cartResult.ok) {
      setToast(cartResult.error);
      return;
    }
    const available = await getFoodCoupons(subtotal);
    setCoupons(available);
    setShowCart(true);
  }, [cartItems, subtotal]);

  const handleApplyCoupon = useCallback(async (code: string) => {
    const result = await applyFoodCoupon(code);
    if (result.ok && result.cart.coupon) {
      setAppliedCoupon(result.cart.coupon);
    } else if (!result.ok) {
      setToast(result.error);
    }
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    setPlacing(true);
    const items: FoodCartItem[] = cartItems.map((i) => ({ menuItemId: i.id, quantity: i.qty }));
    const cartResult = await updateFoodCart(items);
    if (!cartResult.ok) {
      setToast(cartResult.error);
      setPlacing(false);
      return;
    }
    const placed = await placeFoodOrder();
    if (!placed.ok) {
      setToast(placed.error);
      setPlacing(false);
      return;
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("saathi:order-placed"));
      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }

    setToast(`Order placed! ${formatINR(placed.order.amount)} · ETA ${placed.order.etaMinutes} min`);
    setCart(new Map());
    setShowCart(false);
    setConfirmOpen(false);
    setPlacing(false);

    setTimeout(() => router.push("/orders"), 2500);
  }, [cartItems, router]);

  return (
    <>
      {/* Menu items by category */}
      <div className="space-y-6">
        {categories.map(([category, items]) => (
          <div key={category}>
            <h2 className="mb-2 text-sm font-bold text-ink-muted uppercase tracking-wider">
              {category}
            </h2>
            <div className="space-y-2">
              {items.map((item) => {
                const qty = cart.get(item.id) ?? 0;
                return (
                  <div
                    key={item.id}
                    className="card flex items-center gap-3 !p-3"
                  >
                    <span className={`h-3 w-3 shrink-0 rounded-sm border-2 ${item.isVeg ? "border-leaf-600" : "border-red-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold">{formatINR(item.price)}</span>
                        {item.calories > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-ink-muted">
                            <Flame className="h-3 w-3" /> {item.calories} cal
                          </span>
                        )}
                      </div>
                      {item.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.tags.map((t) => (
                            <span key={t} className="rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[10px] text-ink-muted">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {qty === 0 ? (
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="flex items-center gap-1 rounded-lg border border-brand px-3 py-2 text-xs font-bold text-brand hover:bg-brand-50 transition shrink-0 min-h-[44px]"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 rounded-lg bg-brand px-1 py-0.5 shrink-0">
                        <button onClick={() => updateQty(item.id, -1)} className="flex h-8 w-8 items-center justify-center text-white">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-white">{qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="flex h-8 w-8 items-center justify-center text-white">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky cart bar */}
      {itemCount > 0 && !showCart && (
        <div className="sticky bottom-0 mt-5 rounded-2xl bg-brand p-3 shadow-xl flex items-center justify-between text-white sm:p-4">
          <div className="text-sm sm:text-base">
            <span className="font-bold">{itemCount} item{itemCount > 1 ? "s" : ""}</span>
            <span className="mx-1 sm:mx-2">·</span>
            <span className="font-bold">{formatINR(subtotal)}</span>
          </div>
          <button
            onClick={handleViewCart}
            className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-brand hover:bg-white/90 transition min-h-[44px] sm:px-4"
          >
            <ShoppingCart className="h-4 w-4" /> View Cart
          </button>
        </div>
      )}

      {/* Cart panel */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold">Your Cart</h2>
              <button onClick={() => setShowCart(false)} aria-label="Close cart" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/[0.04]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-3 text-sm text-ink-muted">{restaurantName}</p>

            <div className="space-y-2 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-sm border-2 ${item.isVeg ? "border-leaf-600" : "border-red-500"}`} />
                    <span className="text-sm">{item.name}</span>
                    <span className="text-xs text-ink-muted">x{item.qty}</span>
                  </div>
                  <span className="text-sm font-semibold">{formatINR(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            {/* Coupons */}
            {coupons.length > 0 && (
              <div className="mb-4 space-y-1.5">
                <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">Available Coupons</p>
                {coupons.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleApplyCoupon(c.code)}
                    disabled={appliedCoupon?.code === c.code}
                    className={`flex w-full items-center gap-2 rounded-xl border p-2.5 text-left transition ${
                      appliedCoupon?.code === c.code
                        ? "border-leaf bg-leaf-50"
                        : "border-black/10 hover:border-brand"
                    }`}
                  >
                    <Tag className="h-4 w-4 text-brand shrink-0" />
                    <div>
                      <p className="text-xs font-bold">{c.code}</p>
                      <p className="text-[11px] text-ink-muted">{c.description}</p>
                    </div>
                    {appliedCoupon?.code === c.code && (
                      <span className="ml-auto text-xs font-bold text-leaf-600">Applied!</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-black/10 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Subtotal</span>
                <span className="font-semibold">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Delivery fee</span>
                <span className="font-semibold">{formatINR(deliveryFee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-leaf-600">
                  <span>Coupon discount</span>
                  <span className="font-semibold">-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold border-t border-black/10 pt-2 mt-2">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            <button
              onClick={() => setConfirmOpen(true)}
              className="btn-primary mt-4 w-full !py-3"
            >
              Place Order · {formatINR(total)}
            </button>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Order"
        message={`Place order from ${restaurantName} for ${formatINR(total)}? Estimated delivery: 30 min.`}
        confirmLabel="Place Order"
        onConfirm={handlePlaceOrder}
        onCancel={() => setConfirmOpen(false)}
        loading={placing}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-xl animate-in slide-in-from-bottom-4">
          {toast}
          <button onClick={() => setToast(null)} className="ml-3 text-white/60 hover:text-white">✕</button>
        </div>
      )}
    </>
  );
}
