"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open, title, message, confirmLabel = "Confirm", onConfirm, onCancel, loading,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      className="fixed inset-0 z-50 m-auto max-w-sm rounded-2xl border-none bg-white p-6 shadow-xl backdrop:bg-black/40"
    >
      <h3 id="confirm-dialog-title" className="text-lg font-extrabold">{title}</h3>
      <p id="confirm-dialog-message" className="mt-2 text-sm text-ink-muted">{message}</p>
      <div className="mt-5 flex gap-3 justify-end">
        <button
          onClick={onCancel}
          aria-label="Cancel"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-muted hover:bg-black/[0.04]"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Placing..." : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
