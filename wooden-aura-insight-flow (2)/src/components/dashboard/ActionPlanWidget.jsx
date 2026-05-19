import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, CheckCircle2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, parseISO } from "date-fns";

export default function ActionPlanWidget({ journalEntries = [], goals = [] }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completedActions, setCompletedActions] = useState(new Set());

  const generatePlan = async () => {
    setLoading(true);
    
    // Analyze last 7 days of sentiment
    const weekStart = subDays(new Date(), 7);
    const weekEntries = journalEntries.filter(e => {
      if (!e.date) return false;
      const eDate = parseISO(e.date);
      return eDate >= weekStart;
    });

    const sentimentCounts = {
      great: 0, good: 0, neutral: 0, difficult: 0, tough: 0
    };
    weekEntries.forEach(e => {
      if (e.sentiment && sentimentCounts.hasOwnProperty(e.sentiment)) {
        sentimentCounts[e.sentiment]++;
      }
    });

    const topGoals = goals.slice(0, 3).map(g => g.title).join(", ") || "general relationship growth";
    const dominantSentiment = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";
    const isPositiveWeek = sentimentCounts.great + sentimentCounts.good > sentimentCounts.difficult + sentimentCounts.tough;

    const prompt = `You are Aura, a warm relationship coach. Generate exactly 3 micro-actions (tiny, doable exercises) for today based on this user's week.

Context:
- Recent mood trend: mostly ${dominantSentiment} sentiment (${isPositiveWeek ? "positive week" : "challenging week"})
- Journal entries this week: ${weekEntries.length}
- Current goals: ${topGoals}

Each action must be:
1. Concrete and specific (not vague)
2. Takes 5-15 minutes
3. Doable TODAY
4. Tied to communication or connection
5. Encouraging tone

Examples of good actions:
- "Send your partner a voice memo saying one thing you appreciated about them today"
- "Ask your partner one question about their day and listen for 5 minutes without planning your response"
- "Sit together for 10 minutes with phones off and just talk about something light"

Format as JSON array with objects containing: title (string), description (string), duration_minutes (number, 5-15)`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                duration_minutes: { type: "number" }
              }
            }
          }
        }
      }
    });

    setActions(result.actions || []);
    setCompletedActions(new Set());
    setLoading(false);
  };

  useEffect(() => {
    generatePlan();
  }, []);

  const handleComplete = (idx) => {
    const newCompleted = new Set(completedActions);
    newCompleted.add(idx);
    setCompletedActions(newCompleted);
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-heading font-semibold text-sm">Action Plan</p>
            <p className="text-xs text-muted-foreground">Today's micro-exercises</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full gap-1.5 text-muted-foreground hover:text-primary"
          onClick={generatePlan}
          disabled={loading}
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        </Button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {actions.map((action, idx) => {
            const isCompleted = completedActions.has(idx);
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`p-3 rounded-xl border transition-all ${
                  isCompleted
                    ? "bg-chart-2/10 border-chart-2/20"
                    : "bg-card border-border/60 hover:border-primary/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleComplete(idx)}
                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-chart-2" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isCompleted ? "text-muted-foreground line-through" : ""}`}>
                      {action.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-xs rounded-full">
                        {action.duration_minutes} min
                      </Badge>
                      {isCompleted && (
                        <span className="text-xs text-chart-2 font-medium">Done!</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {actions.length === 0 && !loading && (
        <p className="text-xs text-muted-foreground text-center py-6">
          Add journal entries to see personalized action suggestions.
        </p>
      )}
    </div>
  );
}