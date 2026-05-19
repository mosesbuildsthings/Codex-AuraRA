import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, Sparkles, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";

const STORAGE_KEY = "aura_checkin_suggestion";
const DISMISS_KEY = "aura_checkin_dismissed";

function getCachedSuggestion() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { suggestion, generatedAt } = JSON.parse(raw);
    // Valid for 24 hours
    if (Date.now() - generatedAt > 24 * 60 * 60 * 1000) return null;
    return suggestion;
  } catch { return null; }
}

function isDismissedToday() {
  try {
    const d = localStorage.getItem(DISMISS_KEY);
    return d === format(new Date(), "yyyy-MM-dd");
  } catch { return false; }
}

export default function SmartCheckInBanner({ journalEntries = [] }) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isDismissedToday()) return;
    const cached = getCachedSuggestion();
    if (cached) { setSuggestion(cached); setVisible(true); return; }
    if (journalEntries.length < 3) return; // Need enough data
    generateSuggestion();
  }, [journalEntries.length]);

  const generateSuggestion = async () => {
    setLoading(true);
    try {
      // Build engagement pattern summary
      const pattern = journalEntries.slice(0, 20).map(e => ({
        date: e.date,
        sentiment: e.sentiment,
        created: e.created_date,
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a relationship wellness coach. Based on this user's journaling history, suggest the optimal daily check-in time.

Journal history (most recent first):
${JSON.stringify(pattern, null, 2)}

Analyze patterns like:
- Days of week they journal most
- Sentiment trends (are mornings or evenings better?)
- Consistency gaps

Respond with a short, warm, personalized suggestion (2 sentences max). Include a specific time like "8:00 AM" or "9:30 PM". Be encouraging and specific.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_time: { type: "string" },
            message: { type: "string" },
            reasoning: { type: "string" }
          }
        }
      });

      const s = typeof result === "string" ? JSON.parse(result) : result;
      if (s?.message) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ suggestion: s, generatedAt: Date.now() }));
        setSuggestion(s);
        setVisible(true);
      }
    } catch {
      // Silently fail — not critical
    } finally {
      setLoading(false);
    }
  };

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(DISMISS_KEY, format(new Date(), "yyyy-MM-dd")); } catch {}
  };

  if (!visible || !suggestion) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="bg-gradient-to-r from-primary/10 to-chart-4/10 border border-primary/20 rounded-2xl p-4 mb-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">Aura Suggestion</p>
              {suggestion.suggested_time && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {suggestion.suggested_time}
                </span>
              )}
            </div>
            <p className="text-sm text-foreground leading-relaxed">{suggestion.message}</p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}