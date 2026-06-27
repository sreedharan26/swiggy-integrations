"use client";

import type { AnyOrderStatus, ServiceCategory } from "@/lib/swiggy/types";

const FOOD_STEPS = ["Placed", "Confirmed", "Preparing", "Out for delivery", "Delivered"];
const FOOD_STATUSES: AnyOrderStatus[] = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered"];

const INSTAMART_STEPS = ["Placed", "Confirmed", "Packing", "Out for delivery", "Delivered"];
const INSTAMART_STATUSES: AnyOrderStatus[] = ["placed", "confirmed", "packing", "out_for_delivery", "delivered"];

const DINEOUT_STEPS = ["Confirmed", "Upcoming", "Checked in", "Completed"];
const DINEOUT_STATUSES: AnyOrderStatus[] = ["confirmed", "upcoming", "checked_in", "completed"];

function getConfig(service: ServiceCategory) {
  if (service === "food") return { steps: FOOD_STEPS, statuses: FOOD_STATUSES };
  if (service === "instamart") return { steps: INSTAMART_STEPS, statuses: INSTAMART_STATUSES };
  return { steps: DINEOUT_STEPS, statuses: DINEOUT_STATUSES };
}

export function OrderStatusStepper({
  service, currentStatus,
}: {
  service: ServiceCategory;
  currentStatus: AnyOrderStatus;
}) {
  const { steps, statuses } = getConfig(service);
  const currentIdx = statuses.indexOf(currentStatus);

  return (
    <div className="flex items-center w-full gap-0">
      {steps.map((label, i) => {
        const done = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  done
                    ? "bg-brand text-white"
                    : "bg-black/[0.06] text-ink-muted"
                } ${isCurrent ? "ring-4 ring-brand/20" : ""}`}
              >
                {done ? "✓" : i + 1}
                {isCurrent && currentStatus !== "delivered" && currentStatus !== "completed" && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-brand/30" />
                )}
              </div>
              <span className={`mt-1.5 text-[10px] leading-tight text-center max-w-[60px] ${
                done ? "font-semibold text-brand-700" : "text-ink-muted"
              }`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 rounded-full ${
                i < currentIdx ? "bg-brand" : "bg-black/[0.08]"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
