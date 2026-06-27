"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function BudgetEditor({ currentBudget }: { currentBudget: number }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(currentBudget));
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();

  async function save() {
    const n = Number(value);
    if (!n || n <= 0) {
      setValidationError("Budget must be a positive number.");
      return;
    }
    if (n > 999999) {
      setValidationError("Budget cannot exceed ₹9,99,999.");
      return;
    }
    setValidationError(null);
    setSaving(true);
    await fetch("/api/user/budget", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budget: n }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        onClick={() => { setValue(String(currentBudget)); setEditing(true); }}
        aria-label="Edit budget"
        className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-600"
      >
        <Pencil className="h-3.5 w-3.5" /> Edit budget
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-ink-muted">₹</span>
        <input
          type="number"
          value={value}
          onChange={(e) => { setValue(e.target.value); setValidationError(null); }}
          min={1}
          max={999999}
          className="w-20 rounded-lg border border-black/10 px-2 py-1 text-sm outline-none focus:border-brand"
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        />
        <button onClick={save} disabled={saving} aria-label="Save budget" className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-600">
          <Check className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => { setEditing(false); setValidationError(null); }} aria-label="Cancel editing" className="flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.06] hover:bg-black/[0.1]">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {validationError && (
        <p className="text-xs text-red-500">{validationError}</p>
      )}
    </div>
  );
}
