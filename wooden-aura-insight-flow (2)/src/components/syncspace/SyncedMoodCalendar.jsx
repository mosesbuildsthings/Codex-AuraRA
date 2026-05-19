import React from "react";
import { format } from "date-fns";

const sentimentColors = {
  great: "bg-chart-2/30 text-chart-2",
  good: "bg-primary/20 text-primary",
  neutral: "bg-muted text-muted-foreground",
  difficult: "bg-chart-3/20 text-chart-3",
  tough: "bg-destructive/20 text-destructive"
};

const sentimentEmojis = {
  great: "😊",
  good: "🙂",
  neutral: "😐",
  difficult: "😔",
  tough: "😢"
};

export default function SyncedMoodCalendar({ journalEntries }) {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  const getMoodForDay = (day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return journalEntries.find(e => e.date === dateStr);
  };

  const avgSentiment = journalEntries.length > 0
    ? (journalEntries.reduce((sum, e) => sum + (e.sentiment_score || 3), 0) / journalEntries.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-muted/30">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Avg Mood (30d)</p>
          <p className="text-2xl font-bold">{avgSentiment}/5</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Entries Logged</p>
          <p className="text-2xl font-bold">{journalEntries.length}</p>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-4 rounded-xl bg-card border border-border/60">
        <p className="text-sm font-medium mb-3">Your Mood Over 30 Days</p>
        <div className="grid grid-cols-7 gap-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
            <p key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</p>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-2">
          {last30Days.map(day => {
            const entry = getMoodForDay(day);
            return (
              <div
                key={day.toISOString()}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                  entry ? sentimentColors[entry.sentiment] : "bg-muted/30 text-muted-foreground"
                }`}
                title={entry ? `${format(day, "MMM d")}: ${entry.sentiment}` : format(day, "MMM d")}
              >
                {entry ? sentimentEmojis[entry.sentiment] : "—"}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-3 rounded-lg bg-muted/20 text-xs space-y-1">
        <p className="font-medium text-muted-foreground">Legend</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(sentimentEmojis).map(([sentiment, emoji]) => (
            <div key={sentiment} className="flex items-center gap-1">
              <span>{emoji}</span>
              <span className="text-muted-foreground capitalize">{sentiment}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}