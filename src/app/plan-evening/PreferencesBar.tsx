"use client";

import { Users, Clock, Minus, Plus } from "lucide-react";
import type { Slot } from "@/lib/swiggy/types";

interface PreferencesBarProps {
  guests: number;
  onGuestsChange: (n: number) => void;
  time: string;
  onTimeChange: (t: string) => void;
  slots: Slot[];
}

export function PreferencesBar({ guests, onGuestsChange, time, onTimeChange, slots }: PreferencesBarProps) {
  const freeSlots = slots.filter((s) => s.isFree);

  return (
    <div className="card mb-5 flex flex-wrap items-center gap-6">
      {/* Guests stepper */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand">
          <Users className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-ink-muted">Guests</span>
        <div className="flex items-center gap-1 rounded-xl bg-black/[0.04] px-1">
          <button
            onClick={() => onGuestsChange(Math.max(1, guests - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/[0.06] transition"
            aria-label="Decrease guests"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-bold">{guests}</span>
          <button
            onClick={() => onGuestsChange(Math.min(10, guests + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/[0.06] transition"
            aria-label="Increase guests"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Time dropdown */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-50 text-leaf-600">
          <Clock className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-ink-muted">Time</span>
        <select
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold outline-none focus:border-brand cursor-pointer"
        >
          {freeSlots.map((s) => (
            <option key={s.time} value={s.time}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
