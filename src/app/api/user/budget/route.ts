import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { invalidateByPrefix } from "@/lib/cache";

export async function PATCH(request: Request) {
  const { budget } = await request.json();

  if (typeof budget !== "number" || budget < 0 || budget > 999999) {
    return NextResponse.json({ error: "Invalid budget value" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: "u_aarav" },
    data: { monthlyBudget: Math.round(budget) },
  });

  invalidateByPrefix("spends:");

  return NextResponse.json({ ok: true, budget: Math.round(budget) });
}
