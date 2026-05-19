import React, { useMemo } from "react";
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { TrendingUp, TrendingDown, Minus, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const SENTIMENT_SCORE = { great: 5, good: 4, neutral: 3, difficult: 2, tough: 1 };
const SENTIMENT_LABEL = { 5: "Great", 4: "Good", 3: "Neutral", 2: "Difficult", 1: "Tough" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg text-xs space-y-1">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-medium text-foreground">
            {p.dataKey.includes("Score")
              ? SENTIMENT_LABEL[Math.round(p.value)] ?? p.value
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function PartnerSentimentChart({ myEntries = [], partnerEntries = [] }) {
  // Build a 30-day daily dataset
  const data = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = subDays(new Date(), 29 - i);
      return format(d, "yyyy-MM-dd");
    });

    const myMap = {};
    myEntries.forEach(e => { if (e.date) myMap[e.date] = SENTIMENT_SCORE[e.sentiment] ?? e.sentiment_score ?? 3; });

    const partnerMap = {};
    partnerEntries.forEach(e => { if (e.date) partnerMap[e.date] = SENTIMENT_SCORE[e.sentiment] ?? e.sentiment_score ?? 3; });

    return days.map(d => ({
      date: format(parseISO(d), "MMM d"),
      myScore: myMap[d] ?? null,
      partnerScore: partnerMap[d] ?? null,
      interactions: (myMap[d] != null ? 1 : 0) + (partnerMap[d] != null ? 1 : 0),
    }));
  }, [myEntries, partnerEntries]);

  // Stats
  const myAvg = useMemo(() => {
    const vals = data.map(d => d.myScore).filter(Boolean);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
  }, [data]);

  const partnerAvg = useMemo(() => {
    const vals = data.map(d => d.partnerScore).filter(Boolean);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
  }, [data]);

  const syncDays = data.filter(d => d.interactions === 2).length;

  const trendIcon = (avg) => {
    if (!avg) return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
    if (avg >= 4) return <TrendingUp className="w-3.5 h-3.5 text-chart-2" />;
    if (avg <= 2.5) return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
    return <Minus className="w-3.5 h-3.5 text-chart-3" />;
  };

  const hasData = myEntries.length > 0 || partnerEntries.length > 0;

  return (
    <div className="space-y-4">
      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Your Avg", value: myAvg ? SENTIMENT_LABEL[Math.round(myAvg)] : "—", icon: trendIcon(myAvg), color: "bg-primary/10" },
          { label: "Partner Avg", value: partnerAvg ? SENTIMENT_LABEL[Math.round(partnerAvg)] : "—", icon: trendIcon(partnerAvg), color: "bg-chart-4/10" },
          { label: "Sync Days", value: syncDays, icon: <Heart className="w-3.5 h-3.5 text-chart-2" />, color: "bg-chart-2/10" },
        ].map(stat => (
          <div key={stat.label} className={cn("rounded-xl p-3 text-center", stat.color)}>
            <div className="flex items-center justify-center gap-1 mb-1">{stat.icon}</div>
            <p className="text-sm font-semibold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Heart className="w-8 h-8 mb-3 opacity-30" />
          <p className="text-sm">No sentiment data yet.</p>
          <p className="text-xs mt-1">Complete daily check-ins to see trends.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="myGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="partnerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              interval={6}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              formatter={(val) => <span style={{ color: "hsl(var(--muted-foreground))" }}>{val}</span>}
            />
            <Bar dataKey="interactions" name="Both checked in" fill="hsl(var(--chart-2))" opacity={0.15} radius={[2, 2, 0, 0]} />
            <Area
              type="monotone"
              dataKey="myScore"
              name="You"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#myGrad)"
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="partnerScore"
              name="Partner"
              stroke="hsl(var(--chart-4))"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 3"
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Last 30 days · Partner data visible only when both check in
      </p>
    </div>
  );
}