import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Zap, BookOpen, MessageSquare, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";

export default function Coach() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [period, setPeriod] = useState("week"); // week, month

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: () => base44.entities.JournalEntry.list("-date", 100),
    initialData: []
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["coach-sessions"],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.CoachSession.filter({ user_email: user.email }, "-generated_at", 10);
    },
    enabled: !!user?.email,
    initialData: []
  });

  const latestSession = sessions[0];
  const periodDays = period === "week" ? 7 : 30;
  const cutoffDate = subDays(new Date(), periodDays);
  const recentEntries = journalEntries.filter(e => new Date(e.date) >= cutoffDate);

  const handleGenerateCoaching = async () => {
    if (recentEntries.length === 0) return;
    setGenerating(true);

    try {
      const journalSummary = recentEntries
        .map(e => `${e.date}: ${e.sentiment} - ${e.content.substring(0, 100)}`)
        .join("\n");

      const moodScores = recentEntries.map(e => e.sentiment_score || 3);
      const avgMood = moodScores.length > 0 ? (moodScores.reduce((a, b) => a + b) / moodScores.length).toFixed(1) : 3;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an empathetic relationship coach. Based on this person's recent journal entries and mood trends, provide personalized coaching.

Recent Journal Entries (${period}):
${journalSummary}

Average Mood Score: ${avgMood}/5

Please provide:
1. A brief mood trend summary
2. 3 key insights from their entries
3. 3 specific, actionable recommendations
4. 3 conversation starters for them to use with their partner

Format as JSON with keys: mood_summary, key_insights (array), actionable_advice (array), communication_prompts (array), coach_message (string)`,
        response_json_schema: {
          type: "object",
          properties: {
            mood_summary: { type: "string" },
            key_insights: { type: "array", items: { type: "string" } },
            actionable_advice: { type: "array", items: { type: "string" } },
            communication_prompts: { type: "array", items: { type: "string" } },
            coach_message: { type: "string" }
          }
        }
      });

      // Save session
      const startDate = new Date(cutoffDate).toISOString().split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];

      await base44.entities.CoachSession.create({
        user_email: user.email,
        analysis_period_start: startDate,
        analysis_period_end: endDate,
        mood_summary: response.mood_summary,
        key_insights: response.key_insights,
        actionable_advice: response.actionable_advice,
        communication_prompts: response.communication_prompts,
        coach_message: response.coach_message
      });

      queryClient.invalidateQueries({ queryKey: ["coach-sessions"] });
    } catch (error) {
      console.error("Coach generation error:", error);
    }

    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-3">
        <Link to="/sync-space" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Sparkles className="w-6 h-6 text-primary" />
        <span className="font-heading text-xl font-bold">Relationship Coach</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        {/* Generation section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-card border border-border/60 mb-6"
        >
          <h2 className="font-heading text-lg font-semibold mb-4">Get Personalized Coaching</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The coach analyzes your recent journal entries and mood trends to provide tailored advice.
          </p>

          <div className="flex gap-2 mb-4">
            {["week", "month"].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Last {p === "week" ? "7 days" : "30 days"} ({recentEntries.length} entries)
              </button>
            ))}
          </div>

          <Button
            className="w-full rounded-full gap-2"
            onClick={handleGenerateCoaching}
            disabled={generating || recentEntries.length === 0}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating coaching...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Generate Coaching
              </>
            )}
          </Button>

          {recentEntries.length === 0 && (
            <p className="text-xs text-destructive mt-2">No journal entries for this period. Add entries to get coaching.</p>
          )}
        </motion.div>

        {/* Sessions */}
        {latestSession && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="p-6 rounded-2xl bg-card border border-border/60">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Latest coaching session</p>
                  <p className="text-sm font-medium">
                    {format(new Date(latestSession.generated_at), "MMM d, yyyy")}
                  </p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20">Latest</Badge>
              </div>

              <div className="prose prose-sm prose-invert dark:prose-invert max-w-none mb-6">
                <p className="text-foreground/85 leading-relaxed">{latestSession.coach_message}</p>
              </div>

              <div className="space-y-4">
                {latestSession.key_insights && latestSession.key_insights.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" /> Key Insights
                    </h3>
                    <ul className="space-y-2">
                      {latestSession.key_insights.map((insight, i) => (
                        <li key={i} className="text-sm text-foreground/80 flex gap-2">
                          <span className="text-primary">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {latestSession.actionable_advice && latestSession.actionable_advice.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-chart-3" /> Actionable Advice
                    </h3>
                    <ul className="space-y-2">
                      {latestSession.actionable_advice.map((advice, i) => (
                        <li key={i} className="text-sm text-foreground/80 flex gap-2">
                          <span className="text-chart-3">→</span>
                          {advice}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {latestSession.communication_prompts && latestSession.communication_prompts.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-chart-2" /> Conversation Starters
                    </h3>
                    <ul className="space-y-2">
                      {latestSession.communication_prompts.map((prompt, i) => (
                        <li key={i} className="text-sm text-foreground/80 flex gap-2">
                          <span className="text-chart-2">"</span>
                          {prompt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {!latestSession && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center py-16 rounded-2xl border-2 border-dashed border-border"
          >
            <Zap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-medium text-sm mb-2">No coaching sessions yet</p>
            <p className="text-xs text-muted-foreground">Generate your first coaching session using your journal entries.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}