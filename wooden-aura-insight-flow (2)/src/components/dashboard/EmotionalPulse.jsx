import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, PenLine, Activity } from "lucide-react";
import { format, subDays, parseISO, isAfter } from "date-fns";

const SENTIMENTS = [
  { value: "great", label: "Great", emoji: "😊", score: 5 },
  { value: "good",  label: "Good",  emoji: "🙂", score: 4 },
  { value: "neutral", label: "Neutral", emoji: "😐", score: 3 },
  { value: "difficult", label: "Difficult", emoji: "😔", score: 2 },
  { value: "tough", label: "Tough", emoji: "😢", score: 1 }
];

const TAG_INSIGHTS = {
  "Argument":      { label: "Some friction this week", color: "text-destructive" },
  "Affection":     { label: "Affection was present", color: "text-chart-2" },
  "Quality time":  { label: "Quality time logged", color: "text-primary" },
  "Communication": { label: "Active communication", color: "text-primary" },
  "Support":       { label: "Mutual support noted", color: "text-chart-2" },
  "Intimacy":      { label: "Intimacy was shared", color: "text-chart-4" },
  "Fun":           { label: "Fun moments together", color: "text-chart-3" },
  "Stress":        { label: "Stress was a factor", color: "text-chart-3" },
  "Growth":        { label: "Growth-oriented week", color: "text-primary" }
};

export default function EmotionalPulse() {
  const { data: entries = [] } = useQuery({
    queryKey: ["journal"],
    queryFn: () => base44.entities.JournalEntry.list("-date", 365),
    initialData: []
  });

  const sevenDaysAgo = subDays(new Date(), 7);
  const fourteenDaysAgo = subDays(new Date(), 14);

  const thisWeek = entries.filter(e => isAfter(parseISO(e.date), sevenDaysAgo));
  const lastWeek = entries.filter(e =>
    isAfter(parseISO(e.date), fourteenDaysAgo) && !isAfter(parseISO(e.date), sevenDaysAgo)
  );

  const avgScore = (list) => {
    if (!list.length) return null;
    return list.reduce((sum, e) => sum + (e.sentiment_score || SENTIMENTS.find(s => s.value === e.sentiment)?.score || 3), 0) / list.length;
  };

  const thisAvg = avgScore(thisWeek);
  const lastAvg = avgScore(lastWeek);
  const delta = thisAvg !== null && lastAvg !== null ? thisAvg - lastAvg : null;

  // Dominant sentiment this week
  const sentimentCounts = {};
  thisWeek.forEach(e => { sentimentCounts[e.sentiment] = (sentimentCounts[e.sentiment] || 0) + 1; });
  const dominant = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const dominantInfo = SENTIMENTS.find(s => s.value === dominant);

  // Top tags this week
  const tagCounts = {};
  thisWeek.forEach(e => (e.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);

  // Days logged streak (consecutive days from today backwards)
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = format(subDays(new Date(), i), "yyyy-MM-dd");
    if (entries.find(e => e.date === d)) streak++;
    else break;
  }

  // Score bar (1-5 → 20%-100%)
  const scorePercent = thisAvg ? ((thisAvg - 1) / 4) * 100 : 0;
  const scoreColor =
    thisAvg >= 4 ? "bg-chart-2" :
    thisAvg >= 3 ? "bg-primary" :
    thisAvg >= 2 ? "bg-chart-3" : "bg-destructive";

  if (entries.length === 0) {
    return (
      <div className="bg-card border border-border/60 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-sm">Emotional Pulse</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          Start logging daily journal entries to see your weekly emotional trends here.
        </p>
        <Link to="/journal">
          <Button size="sm" variant="outline" className="rounded-full gap-1.5 text-xs">
            <PenLine className="w-3 h-3" /> Open Journal
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-sm">Emotional Pulse</h3>
        </div>
        <Link to="/journal">
          <Button size="sm" variant="ghost" className="rounded-full text-xs h-7 px-2.5 text-muted-foreground gap-1">
            <PenLine className="w-3 h-3" /> Journal
          </Button>
        </Link>
      </div>

      {thisWeek.length === 0 ? (
        <p className="text-xs text-muted-foreground">No entries this week yet. <Link to="/journal" className="text-primary hover:underline">Add today's entry →</Link></p>
      ) : (
        <div className="space-y-4">
          {/* Score bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">This week's mood</span>
              <div className="flex items-center gap-1.5">
                {dominantInfo && <span className="text-base">{dominantInfo.emoji}</span>}
                {delta !== null && (
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${delta > 0 ? "text-chart-2" : delta < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                    {delta > 0.2 ? <TrendingUp className="w-3 h-3" /> : delta < -0.2 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {delta > 0 ? "+" : ""}{delta.toFixed(1)} vs last week
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${scoreColor}`}
                style={{ width: `${Math.max(8, scorePercent)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">Tough</span>
              <span className="text-xs text-muted-foreground">Great</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-xl bg-muted/40">
              <p className="text-lg font-bold">{thisWeek.length}</p>
              <p className="text-xs text-muted-foreground">Days logged</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-muted/40">
              <p className="text-lg font-bold">{streak}</p>
              <p className="text-xs text-muted-foreground">Day streak</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-muted/40">
              <p className="text-lg font-bold">{thisAvg ? thisAvg.toFixed(1) : "—"}</p>
              <p className="text-xs text-muted-foreground">Avg score</p>
            </div>
          </div>

          {/* Communication patterns from tags */}
          {topTags.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Patterns this week</p>
              <div className="space-y-1.5">
                {topTags.map(tag => {
                  const insight = TAG_INSIGHTS[tag];
                  return insight ? (
                    <div key={tag} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                      <span className={`text-xs ${insight.color}`}>{insight.label}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Mini sparkline — dots for last 7 days */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Last 7 days</p>
            <div className="flex items-end gap-1 h-8">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
                const entry = entries.find(e => e.date === d);
                const score = entry ? (entry.sentiment_score || SENTIMENTS.find(s => s.value === entry.sentiment)?.score || 3) : null;
                const heightPct = score ? ((score - 1) / 4) * 100 : 0;
                const color =
                  !score ? "bg-muted" :
                  score >= 4 ? "bg-chart-2" :
                  score >= 3 ? "bg-primary" :
                  score >= 2 ? "bg-chart-3" : "bg-destructive";
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                    <div
                      className={`w-full rounded-sm transition-all ${color}`}
                      style={{ height: score ? `${Math.max(15, heightPct)}%` : "15%", opacity: score ? 1 : 0.2 }}
                      title={entry ? `${format(parseISO(entry.date), "MMM d")}: ${entry.sentiment}` : "No entry"}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}