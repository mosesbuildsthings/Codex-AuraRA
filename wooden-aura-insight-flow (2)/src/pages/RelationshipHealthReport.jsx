import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { format, startOfMonth, endOfMonth, parseISO, isSameMonth } from "date-fns";

const SENTIMENT_SCORES = { great: 5, good: 4, neutral: 3, difficult: 2, tough: 1 };

export default function RelationshipHealthReport() {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const currentMonth = new Date();

  const { data: entries = [] } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: () => base44.entities.JournalEntry.list("-date", 365),
    initialData: []
  });

  const monthlyEntries = useMemo(() => {
    return entries.filter(e => isSameMonth(parseISO(e.date), currentMonth));
  }, [entries, currentMonth]);

  const analysis = useMemo(() => {
    if (monthlyEntries.length === 0) return null;

    const scores = monthlyEntries.map(e => SENTIMENT_SCORES[e.sentiment] || 3);
    const avgScore = (scores.reduce((a, b) => a + b) / scores.length).toFixed(1);
    
    // Count tag frequency
    const tagFrequency = {};
    monthlyEntries.forEach(e => {
      (e.tags || []).forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });
    
    const topStressors = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    const sentimentBreakdown = {
      great: monthlyEntries.filter(e => e.sentiment === "great").length,
      good: monthlyEntries.filter(e => e.sentiment === "good").length,
      neutral: monthlyEntries.filter(e => e.sentiment === "neutral").length,
      difficult: monthlyEntries.filter(e => e.sentiment === "difficult").length,
      tough: monthlyEntries.filter(e => e.sentiment === "tough").length
    };

    return {
      avgScore,
      topStressors,
      sentimentBreakdown,
      totalEntries: monthlyEntries.length,
      summaries: monthlyEntries.slice(0, 3).map(e => e.content)
    };
  }, [monthlyEntries]);

  const generateReport = async () => {
    if (!analysis) return;
    setGenerating(true);
    setError(null);

    const prompt = `You are a compassionate relationship counselor. Based on the following monthly journal data, provide a personalized "Relationship Health Report" with actionable advice.

Monthly Overview (${format(currentMonth, "MMMM yyyy")}):
- Average Mood: ${analysis.avgScore}/5
- Total Entries: ${analysis.totalEntries}
- Sentiment Distribution: Great (${analysis.sentimentBreakdown.great}), Good (${analysis.sentimentBreakdown.good}), Neutral (${analysis.sentimentBreakdown.neutral}), Difficult (${analysis.sentimentBreakdown.difficult}), Tough (${analysis.sentimentBreakdown.tough})
- Recurring Themes: ${analysis.topStressors.map(s => `${s.tag} (${s.count} times)`).join(", ")}

Sample Entries:
${analysis.summaries.map((s, i) => `${i + 1}. "${s}"`).join("\n")}

Please provide a structured report with these sections:
1. **Monthly Health Score**: Overall relationship health assessment with rationale
2. **Key Patterns**: What recurring themes or stressors emerged this month
3. **Bright Spots**: Positive moments and strengths shown in the entries
4. **Areas to Focus**: 1-3 specific relationship areas that need attention
5. **Actionable Advice**: Concrete, practical steps for the next month

Keep advice empathetic, non-judgmental, and grounded in what the data shows. Format with clear headings and bullet points.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: "gpt_5_mini"
      });
      setReport(response);
    } catch (err) {
      setError("Failed to generate report. Please try again.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Relationship Health Report</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-bold mb-2">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <p className="text-muted-foreground">AI-powered analysis of your relationship patterns and health.</p>
        </div>

        {monthlyEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-2xl border-2 border-dashed border-border"
          >
            <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No entries this month</h3>
            <p className="text-muted-foreground text-sm mb-6">Log journal entries to generate a personalized health report.</p>
            <Link to="/daily-check-in">
              <Button className="rounded-full">Start Journaling</Button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
            >
              <div className="p-4 rounded-2xl bg-card border border-border/60">
                <p className="text-xs text-muted-foreground mb-1">Entries</p>
                <p className="text-2xl font-bold">{analysis.totalEntries}</p>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border/60">
                <p className="text-xs text-muted-foreground mb-1">Avg Mood</p>
                <p className="text-2xl font-bold text-primary">{analysis.avgScore}/5</p>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border/60">
                <p className="text-xs text-muted-foreground mb-1">Top Stressor</p>
                <p className="text-sm font-bold truncate">{analysis.topStressors[0]?.tag || "—"}</p>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border/60">
                <p className="text-xs text-muted-foreground mb-1">Sentiment</p>
                <div className="flex gap-1 mt-2">
                  <Badge variant="outline" className="text-xs rounded-full">😊 {analysis.sentimentBreakdown.great}</Badge>
                  <Badge variant="outline" className="text-xs rounded-full">😔 {analysis.sentimentBreakdown.difficult}</Badge>
                </div>
              </div>
            </motion.div>

            {/* Stressors List */}
            {analysis.topStressors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8 p-6 rounded-2xl bg-card border border-border/60"
              >
                <h3 className="font-heading font-semibold mb-4">Recurring Themes This Month</h3>
                <div className="space-y-2">
                  {analysis.topStressors.map((stressor, i) => (
                    <div key={stressor.tag} className="flex items-center justify-between p-3 rounded-lg bg-background/40 border border-border/40">
                      <span className="text-sm font-medium">{stressor.tag}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${(stressor.count / analysis.topStressors[0].count) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{stressor.count}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Generate Report Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={generateReport}
                disabled={generating}
                className="w-full rounded-full py-6 gap-2 mb-8"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Your Report...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate AI Health Report
                  </>
                )}
              </Button>
            </motion.div>

            {/* Error State */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Report Output */}
            <AnimatePresence>
              {report && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-8 rounded-2xl bg-card border border-border/60"
                >
                  <div className="prose prose-sm prose-slate dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown
                      components={{
                        h2: ({ children }) => <h2 className="text-xl font-heading font-bold mt-6 mb-3 first:mt-0">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-heading font-semibold mt-4 mb-2">{children}</h3>,
                        p: ({ children }) => <p className="text-sm leading-relaxed mb-3">{children}</p>,
                        ul: ({ children }) => <ul className="space-y-2 mb-4 ml-4">{children}</ul>,
                        li: ({ children }) => <li className="text-sm leading-relaxed list-disc">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>
                      }}
                    >
                      {report}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}