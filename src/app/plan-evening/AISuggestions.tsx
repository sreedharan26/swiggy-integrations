"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Send, Star, Utensils, ShoppingBag, Loader2 } from "lucide-react";
import { getAISuggestions, type AISuggestion } from "./actions";

const QUICK_PROMPTS = [
  "Something spicy tonight",
  "Budget-friendly dinner",
  "Romantic dinner for two",
  "Quick bites after work",
  "Healthy & light",
  "Try something new",
];

const AI_KEY = "saathi:plan-evening:ai";

interface Props {
  guests: number;
  onBookDineout: (restaurantId: string) => void;
}

export function AISuggestions({ guests, onBookDineout }: Props) {
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(AI_KEY);
      if (saved) {
        const data = JSON.parse(saved) as { prompt: string; suggestions: AISuggestion[] };
        setPrompt(data.prompt);
        setSuggestions(data.suggestions);
        setAsked(true);
      }
    } catch {}
  }, []);

  const handleAsk = useCallback(async (text?: string) => {
    const q = (text ?? prompt).trim();
    if (q.length < 3) {
      setValidationError("Please enter at least 3 characters.");
      return;
    }
    setValidationError(null);
    setPrompt(q);
    setLoading(true);
    setAsked(true);
    try {
      const results = await getAISuggestions(q, guests);
      setSuggestions(results);
      try { sessionStorage.setItem(AI_KEY, JSON.stringify({ prompt: q, suggestions: results })); } catch {}
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [prompt, guests]);

  return (
    <div className="mb-5 rounded-2xl bg-gradient-to-br from-brand-50/80 via-white to-leaf-50/60 p-4 ring-1 ring-brand/10">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-700 text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-bold">AI Picks for You</h2>
          <p className="text-xs text-ink-muted">Tell me your mood — I'll find the perfect spot.</p>
        </div>
      </div>

      {/* Prompt input */}
      <div className="relative mb-1">
        <input
          type="text"
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setValidationError(null); }}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="What are you in the mood for tonight?"
          className="w-full rounded-xl border border-brand/20 bg-white py-2.5 pl-4 pr-12 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
          disabled={loading}
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || !prompt.trim()}
          aria-label="Send suggestion request"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-brand text-white transition hover:bg-brand-700 disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </button>
      </div>
      {validationError && (
        <p className="mb-2 ml-1 text-xs text-red-500">{validationError}</p>
      )}
      {!validationError && <div className="mb-3" />}

      {/* Quick prompt chips */}
      {!asked && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp}
              onClick={() => handleAsk(qp)}
              className="rounded-full border border-brand/20 bg-white px-3 py-1 text-xs font-medium text-brand transition hover:bg-brand-50 hover:border-brand/40"
            >
              {qp}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="h-5 w-5 animate-spin text-brand" />
          <p className="text-sm text-ink-muted">Finding the best spots for you...</p>
        </div>
      )}

      {/* Results */}
      {!loading && suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((s) => (
            <div
              key={s.restaurantId}
              className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-card ring-1 ring-black/[0.04] transition hover:shadow-lg"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-black/[0.04] text-2xl">
                {s.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold truncate">{s.name}</p>
                  <span className={`pill text-[10px] ${
                    s.type === "dineout"
                      ? "bg-brand-50 text-brand-700"
                      : "bg-leaf-50 text-leaf-700"
                  }`}>
                    {s.type === "dineout" ? <><Utensils className="mr-0.5 inline h-2.5 w-2.5" /> Dine Out</> : <><ShoppingBag className="mr-0.5 inline h-2.5 w-2.5" /> Delivery</>}
                  </span>
                </div>
                <p className="text-xs text-ink-muted truncate">{s.cuisines.slice(0, 3).join(", ")}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-brand font-medium">
                  <Sparkles className="h-3 w-3" /> {s.reason}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-1 rounded-full bg-leaf-50 px-2 py-0.5 text-xs font-semibold text-leaf-700">
                  <Star className="h-3 w-3 fill-leaf-600" /> {s.matchScore}%
                </div>
                {s.type === "dineout" ? (
                  <button
                    onClick={() => onBookDineout(s.restaurantId)}
                    className="btn-primary !px-3 !py-1.5 !text-xs"
                  >
                    Reserve
                  </button>
                ) : (
                  <Link
                    href={`/plan-evening/menu/${s.restaurantId}`}
                    className="btn-primary !bg-leaf !px-3 !py-1.5 !text-xs"
                  >
                    Order
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state after asking */}
      {!loading && asked && suggestions.length === 0 && (
        <p className="py-4 text-center text-sm text-ink-muted">
          No matches found. Try a different description!
        </p>
      )}
    </div>
  );
}
