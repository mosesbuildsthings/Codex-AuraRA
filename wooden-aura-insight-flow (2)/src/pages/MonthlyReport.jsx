import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Sparkles, Calendar, TrendingUp, TrendingDown,
  Minus, RefreshCw, ChevronLeft, ChevronRight, Heart, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid
} from "recharts";
import {
  format, startOfMonth, endOfMonth, parseISO, isWithinInterval,
  subMonths, addMonths, isSameMonth
} from "date-fns";
import ReactMarkdown from "react-markdown";

const SENTIMENTS = {
  great:    { score: 5, color: "#10b981", label: "Great",    emoji: "😊" },
  good:     { score: 4, color: "#6366f1", label: "Good",     emoji: "🙂" },
  neutral:  { score: 3, color: "#94a3b8", label: "Neutral",  emoji: "😐" },
  difficult:{ score: 2, color: "#f59e0b", label: "Difficult",emoji: "😔" },
  tough:    { score: 1, color: "#ef4444", label: "Tough",    emoji: "😢" }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl p-3 shadow text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

function useMonthData(month, journalEntries, analysisCases) {
  const start = startOfMonth(month);
  const end   = endOfMonth(month);
  const inMonth = (d) => isWithinInterval(parseISO(d), { start, end });

  const entries = journalEntries.filter(e => e.date && inMonth(e.date));
  const cases   = analysisCases.filter(c => c.created_date && inMonth(c.created_date));

  const positive = entries.filter(e => e.sentiment === "great" || e.sentiment === "good").length;
  const negative = entries.filter(e => e.sentiment === "difficult" || e.sentiment === "tough").length;
  const neutral  = entries.filter(e => e.sentiment === "neutral").length;
  const avgScore = entries.length
    ? entries.reduce((s, e) => s + (SENTIMENTS[e.sentiment]?.score || 3), 0) / entries.length
    : 0;

  // Weekly breakdown within month
  const weeks = Array.from({ length: 5 }).map((_, i) => {
    const wStart = new Date(start);
    wStart.setDate(1 + i * 7);
    const wEnd = new Date(wStart);
    wEnd.setDate(wEnd.getDate() + 6);
    const wEntries = entries.filter(e => {
      const d = parseISO(e.date);
      return d >= wStart && d <= wEnd && d <= end;
    });
    return {
      label: `Wk ${i + 1}`,
      score: wEntries.length ? +(wEntries.reduce((s, e) => s + (SENTIMENTS[e.sentiment]?.score || 3), 0) / wEntries.length).toFixed(2) : null,
      count: wEntries.length
    };
  }).filter(w => w.count > 0);

  // Tag frequency
  const tagCounts = {};
  entries.forEach(e => (e.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Sentiment distribution for bar chart
  const dist = Object.entries(SENTIMENTS).map(([key, val]) => ({
    label: val.label,
    count: entries.filter(e => e.sentiment === key).length,
    color: val.color
  })).filter(d => d.count > 0);

  return { entries, cases, positive, negative, neutral, avgScore, weeks, topTags, dist };
}

export default function MonthlyReport() {
  const [month, setMonth] = useState(new Date());
  const [report, setReport] = useState(null);
  const [generating, setGenerating] = useState(false);
  const isCurrentMonth = isSameMonth(month, new Date());

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["journal-report"],
    queryFn: () => base44.entities.JournalEntry.list("-date", 500),
    initialData: []
  });

  const { data: analysisCases = [] } = useQuery({
    queryKey: ["cases-report"],
    queryFn: () => base44.entities.AnalysisCase.list("-created_date", 100),
    initialData: []
  });

  const { entries, cases, positive, negative, neutral, avgScore, weeks, topTags, dist } =
    useMonthData(month, journalEntries, analysisCases);

  const handleGenerate = async () => {
    if (!entries.length) return;
    setGenerating(true);
    setReport(null);

    const summary = entries.map(e =>
      `[${e.date}] Sentiment: ${e.sentiment}. ${e.content?.substring(0, 200)}`
    ).join("\n");

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Aura, a compassionate relationship wellness advisor. 
Analyze the following relationship journal entries from ${format(month, "MMMM yyyy")} and create a warm, insightful Monthly Relationship Health Report.

Journal data:
${summary}

Statistics:
- Total entries: ${entries.length}
- Positive days: ${positive}, Negative days: ${negative}, Neutral days: ${neutral}
- Average mood score: ${avgScore.toFixed(1)}/5
- Top themes/tags: ${topTags.map(([t]) => t).join(", ") || "none"}
- New reflections this month: ${cases.length}

Write a structured report with these sections:
## 🌱 Monthly Summary
A warm 2-3 sentence overview of the emotional landscape this month.

## 💫 Emotional Trends
Key patterns observed — what improved, what was challenging, inflection points.

## 📊 Positive vs. Challenging Interactions
Analysis of the ratio and what it reveals. Be specific about any recurring patterns.

## 🌿 Growth Highlights
What areas showed the most growth or resilience this month.

## 💡 Personalized Recommendations
3 concrete, actionable growth suggestions tailored to what was observed. Be specific and warm.

Keep the tone empathetic, non-judgmental, and encouraging. Use markdown formatting.`,
      model: "claude_sonnet_4_6"
    });

    setReport(typeof result === "string" ? result : result?.content || JSON.stringify(result));
    setGenerating(false);
  };

  const scoreColor = avgScore >= 4 ? "#10b981" : avgScore >= 3 ? "#6366f1" : avgScore >= 2 ? "#f59e0b" : "#ef4444";
  const trend = avgScore >= 3.5 ? "positive" : avgScore >= 2.5 ? "neutral" : "challenging";

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Monthly Health Report</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Month selector */}
        <div className="flex items-center justify-between mb-6 bg-card border border-border/60 rounded-2xl p-4">
          <button
            onClick={() => { setMonth(m => subMonths(m, 1)); setReport(null); }}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="font-heading font-semibold text-lg">{format(month, "MMMM yyyy")}</p>
            <p className="text-xs text-muted-foreground">{entries.length} journal entries</p>
          </div>
          <button
            onClick={() => { if (!isCurrentMonth) { setMonth(m => addMonths(m, 1)); setReport(null); } }}
            className={`p-2 rounded-xl transition-colors ${isCurrentMonth ? "opacity-30 cursor-not-allowed" : "hover:bg-muted"}`}
            disabled={isCurrentMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border">
            <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No journal entries this month</h3>
            <p className="text-sm text-muted-foreground mb-5">Log daily entries in your journal to generate a monthly report.</p>
            <Link to="/journal">
              <Button variant="outline" className="rounded-full">Go to Journal</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-card border border-border/60 text-center">
                <p className="text-2xl font-bold" style={{ color: scoreColor }}>{avgScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg Mood / 5</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/60 text-center">
                <p className="text-2xl font-bold text-chart-2">{positive}</p>
                <p className="text-xs text-muted-foreground">Positive Days</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/60 text-center">
                <p className="text-2xl font-bold text-destructive">{negative}</p>
                <p className="text-xs text-muted-foreground">Challenging Days</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/60 text-center">
                <div className="flex justify-center mb-1">
                  {trend === "positive" ? <TrendingUp className="w-5 h-5 text-chart-2" /> :
                   trend === "challenging" ? <TrendingDown className="w-5 h-5 text-destructive" /> :
                   <Minus className="w-5 h-5 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground capitalize">{trend}</p>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {/* Weekly mood trend */}
              {weeks.length > 1 && (
                <div className="bg-card border border-border/60 rounded-2xl p-5">
                  <p className="font-heading font-semibold text-sm mb-4">Weekly Mood Trend</p>
                  <ResponsiveContainer width="100%" height={130}>
                    <LineChart data={weeks}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="score" name="Mood" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: "#6366f1" }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Sentiment distribution */}
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <p className="font-heading font-semibold text-sm mb-4">Mood Distribution</p>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={dist} barSize={28}>
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={20} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Days" radius={[4, 4, 0, 0]}>
                      {dist.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top tags */}
            {topTags.length > 0 && (
              <div className="bg-card border border-border/60 rounded-2xl p-5 mb-6">
                <p className="font-heading font-semibold text-sm mb-3">Top Themes This Month</p>
                <div className="flex flex-wrap gap-2">
                  {topTags.map(([tag, count]) => (
                    <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <Heart className="w-3 h-3" />
                      {tag}
                      <span className="opacity-60">×{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate AI report */}
            <div className="mb-6">
              <Button
                className="w-full rounded-full gap-2"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating Report...</>
                  : <><Sparkles className="w-4 h-4" /> {report ? "Regenerate" : "Generate"} AI Health Report</>
                }
              </Button>
              {!report && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Uses advanced AI · Takes ~10 seconds
                </p>
              )}
            </div>

            {/* AI report output */}
            <AnimatePresence>
              {report && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-primary/20 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border/40">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold">Aura's Monthly Report</p>
                      <p className="text-xs text-muted-foreground">{format(month, "MMMM yyyy")}</p>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none text-foreground/90
                    [&_h2]:font-heading [&_h2]:font-semibold [&_h2]:text-base [&_h2]:mt-5 [&_h2]:mb-2
                    [&_p]:leading-relaxed [&_p]:text-sm [&_p]:text-foreground/85
                    [&_li]:text-sm [&_li]:text-foreground/85 [&_ul]:space-y-1.5 [&_ol]:space-y-1.5">
                    <ReactMarkdown>{report}</ReactMarkdown>
                  </div>
                  <div className="mt-5 pt-4 border-t border-border/40 flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      This report is for personal reflection only and is not a substitute for professional mental health support.
                    </p>
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