"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles, Send, Loader2, Lightbulb, MessageCircle,
  ShoppingCart, UtensilsCrossed, ChevronRight, Plus,
  Trash2, RotateCcw,
} from "lucide-react";
import { askHealthAction } from "./actions";
import type { ProductSuggestion, RestaurantSuggestion } from "@/lib/features/health";

interface Message {
  role: "user" | "assistant";
  text: string;
  tips?: string[];
  instamartItems?: ProductSuggestion[];
  restaurants?: RestaurantSuggestion[];
}

const SUGGESTED_QUESTIONS = [
  "How am I doing this month?",
  "Am I getting enough protein?",
  "How are my sugar habits?",
  "Am I cooking enough at home?",
  "How's my veggie variety?",
  "What should I improve?",
];

const STORAGE_KEY = "saathi:health-chat";

function loadMessages(month: string): Message[] {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY}:${month}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(month: string, msgs: Message[]) {
  try {
    sessionStorage.setItem(`${STORAGE_KEY}:${month}`, JSON.stringify(msgs));
  } catch { /* quota exceeded -- silently ignore */ }
}

interface HealthChatProps {
  month: string;
  onSuggestions?: (items: ProductSuggestion[], restaurants: RestaurantSuggestion[]) => void;
}

export function HealthChat({ month, onSuggestions }: HealthChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const onSuggestionsRef = useRef(onSuggestions);
  onSuggestionsRef.current = onSuggestions;

  useEffect(() => {
    setMessages(loadMessages(month));
  }, [month]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const updateMessages = useCallback((updater: (prev: Message[]) => Message[]) => {
    setMessages((prev) => {
      const next = updater(prev);
      saveMessages(month, next);
      return next;
    });
  }, [month]);

  function clearChat() {
    updateMessages(() => []);
  }

  function retraceFrom(index: number) {
    updateMessages((prev) => prev.slice(0, index));
  }

  async function handleAsk(text?: string) {
    const q = (text ?? input).trim();
    if (!q || q.length < 3 || loadingRef.current) return;

    setInput("");
    updateMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    loadingRef.current = true;

    try {
      const result = await askHealthAction(q, month);
      updateMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: result.answer,
          tips: result.tips,
          instamartItems: result.instamartItems,
          restaurants: result.restaurants,
        },
      ]);

      if ((result.instamartItems?.length || result.restaurants?.length) && onSuggestionsRef.current) {
        onSuggestionsRef.current(result.instamartItems ?? [], result.restaurants ?? []);
      }
    } catch {
      updateMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }

  return (
    <div className="card mt-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-700 text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <h2 className="text-sm font-bold">Ask Saathi about your health</h2>
          <p className="text-xs text-ink-muted">AI-powered insights from your order data.</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            disabled={loading}
            className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-40"
          >
            <Trash2 className="h-3 w-3" /> Clear chat
          </button>
        )}
      </div>

      {/* Chat messages */}
      {messages.length > 0 && (
        <div ref={scrollRef} className="mb-3 max-h-80 space-y-3 overflow-y-auto rounded-xl bg-black/[0.02] p-3">
          {messages.map((msg, i) => (
            <div key={i} className={`group/msg flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-700 text-white">
                  <Sparkles className="h-3 w-3" />
                </span>
              )}
              <div className="relative max-w-[85%]">
                {msg.role === "user" && !loading && (
                  <button
                    onClick={() => retraceFrom(i)}
                    title="Retrace from here"
                    className="absolute -left-7 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-black/[0.06] text-ink-muted opacity-0 transition group-hover/msg:opacity-100 hover:bg-red-100 hover:text-red-500"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                )}
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-brand text-white rounded-br-md"
                    : "bg-white shadow-sm ring-1 ring-black/[0.06] rounded-bl-md"
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                {msg.tips && msg.tips.length > 0 && (
                  <div className="mt-2 space-y-1 border-t border-black/[0.06] pt-2">
                    {msg.tips.map((tip, j) => (
                      <p key={j} className="flex items-start gap-1.5 text-xs text-ink-muted">
                        <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-leaf-600" />
                        {tip}
                      </p>
                    ))}
                  </div>
                )}

                {msg.instamartItems && msg.instamartItems.length > 0 && (
                  <div className="mt-2.5 border-t border-black/[0.06] pt-2.5">
                    <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-leaf-700">
                      <ShoppingCart className="h-3 w-3" /> Add to Instamart
                    </p>
                    <div className="space-y-1">
                      {msg.instamartItems.map((item) => (
                        <Link
                          key={item.id}
                          href={`/meal-prep?search=${encodeURIComponent(item.name)}`}
                          className="flex items-center gap-2 rounded-lg bg-leaf-50/60 px-2 py-1.5 transition hover:bg-leaf-100 group"
                        >
                          <span className="text-base">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{item.name}</p>
                            <p className="text-[10px] text-ink-muted truncate">{item.reason}</p>
                          </div>
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-leaf-600 text-white opacity-70 group-hover:opacity-100">
                            <Plus className="h-3 w-3" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {msg.restaurants && msg.restaurants.length > 0 && (
                  <div className="mt-2.5 border-t border-black/[0.06] pt-2.5">
                    <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                      <UtensilsCrossed className="h-3 w-3" /> Try these restaurants
                    </p>
                    <div className="space-y-1">
                      {msg.restaurants.map((r) => (
                        <Link
                          key={r.id}
                          href="/plan-evening"
                          className="flex items-center gap-2 rounded-lg bg-brand-50/60 px-2 py-1.5 transition hover:bg-brand-100 group"
                        >
                          <span className="text-base">{r.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{r.name}</p>
                            <p className="text-[10px] text-ink-muted truncate">
                              {r.cuisines.slice(0, 2).join(", ")} · {r.reason}
                            </p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-ink-muted shrink-0 group-hover:text-brand" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              </div>
              {msg.role === "user" && (
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-xs font-bold">
                  A
                </span>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-700 text-white">
                <Sparkles className="h-3 w-3" />
              </span>
              <div className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-sm ring-1 ring-black/[0.06]">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
                <span className="text-xs text-ink-muted">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggested questions (show when no messages yet) */}
      {messages.length === 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleAsk(q)}
              disabled={loading}
              className="flex items-center gap-1 rounded-full border border-brand/20 bg-white px-3 py-1.5 text-xs font-medium text-brand transition hover:bg-brand-50 hover:border-brand/40 disabled:opacity-50"
            >
              <MessageCircle className="h-3 w-3" />
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleAsk()}
          placeholder="Ask about your eating habits..."
          className="w-full rounded-xl border border-brand/20 bg-white py-2.5 pl-4 pr-12 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
          disabled={loading}
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || input.trim().length < 3}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-brand text-white transition hover:bg-brand-700 disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
