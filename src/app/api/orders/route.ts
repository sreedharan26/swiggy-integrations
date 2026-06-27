import { NextResponse } from "next/server";
import { orderStore } from "@/lib/store/orderStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const active = orderStore.getActive();
  const all = await orderStore.getAllTracked();
  const latest = all[0] ?? null;

  return NextResponse.json({
    version: orderStore.version,
    activeOrders: active,
    totalOrders: all.length,
    latest: latest ? { id: latest.id, merchant: latest.merchant, amount: latest.amount, status: latest.status } : null,
  });
}
