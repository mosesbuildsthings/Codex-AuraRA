import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Sparkles, CalendarDays, TrendingUp, Heart, AlertCircle,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line
} from "recharts";
import { format, startOfMonth, endOfMonth, parseISO, subMonths, addMonths, isSameMonth } from "date-fns";

const SENTIMENT_SCORES = {
  great: 5,
  good: 4,
  neutral: 3,
  difficult: 2,
  tough: 1
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-lg p-3 shadow text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{p.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

function getOverlapInsight(userScore, partnerScore) {
  const bothHigh = userScore >= 4 && partnerScore >= 4;
  const bothLow = userScore <= 2 && partnerScore <= 2;
  const opposite = (userScore >= 4 && partnerScore <= 2) || (userScore <= 2 && partnerScore >= 4);

  if (bothHigh) return { label: "Connection Peak", color: "text-chart-2", icon: "💚" };
  if (bothLow) return { label: "Shared Stress", color: "text-destructive", icon: "🔴" };
  if (opposite) return { label: "Diverging Moods", color: "text-destructive/60", icon: "⚡" };
  return null;
}

export default function MoodMap() {
  const [month, setMonth] = useState(new Date());
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["journal-all"],
    queryFn: () => base44.entities.JournalEntry.list("-date", 500),
    initialData: []
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["connections"],
    queryFn: () => base44.entities.PartnerConnection.list("-created_date", 50),
    initialData: []
  });

  // Get partner email
  const activeConnection = connections.find(c =>
    (c.inviter_email === user?.email || c.partner_email === user?.email) &&
    c.status === "accepted"
  );
  const partnerEmail = activeConnection
    ? activeConnection.inviter_email === user?.email
      ? activeConnection.partner_email
      : activeConnection.inviter_email
    : null;

  // Filter entries for the selected month
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const inMonth = (d) => {
    if (!d) return false;
    const date = parseISO(d);
    return date >= start && date <= end;
  };

  const userEntries = journalEntries.filter(e => e.created_by === user?.email && inMonth(e.date));
  const partnerEntries = partnerEmail
    ? journalEntries.filter(e => e.created_by === partnerEmail && inMonth(e.date))
    : [];

  // Build daily mood data
  const moodData = useMemo(() => {
    const dailyMap = {};
    const allDates = new Set();

    userEntries.forEach(e => {
      if (e.date) {
        allDates.add(e.date);
        if (!dailyMap[e.date]) dailyMap[e.date] = {};
        dailyMap[e.date].userScore = SENTIMENT_SCORES[e.sentiment] || 3;
        dailyMap[e.date].userSentiment = e.sentiment;
      }
    });

    partnerEntries.forEach(e => {
      if (e.date) {
        allDates.add(e.date);
        if (!dailyMap[e.date]) dailyMap[e.date] = {};
        dailyMap[e.date].partnerScore = SENTIMENT_SCORES[e.sentiment] || 3;
        dailyMap[e.date].partnerSentiment = e.sentiment;
      }
    });

    return Array.from(allDates)
      .sort()
      .map(date => {
        const data = dailyMap[date] || {};
        const overlap = getOverlapInsight(data.userScore, data.partnerScore);
        return {
          date,
          label: format(parseISO(date), "MMM d"),
          userMood: data.userScore || null,
          partnerMood: partnerEmail ? (data.partnerScore || null) : null,
          userSentiment: data.userSentiment,
          partnerSentiment: data.partnerSentiment,
          overlap: overlap
        };
      });
  }, [userEntries, partnerEntries, partnerEmail]);

  const isCurrentMonth = isSameMonth(month, new Date());
  const avgUserScore = userEntries.length
    ? (userEntries.reduce((s, e) => s + (SENTIMENT_SCORES[e.sentiment] || 3), 0) / userEntries.length).toFixed(1)
    : 0;
  const avgPartnerScore = partnerEntries.length
    ? (partnerEntries.reduce((s, e) => s + (SENTIMENT_SCORES[e.sentiment] || 3), 0) / partnerEntries.length).toFixed(1)
    : 0;

  const connectionPeaks = moodData.filter(d => d.overlap?.label === "Connection Peak").length;
  const stressPeriods = moodData.filter(d => d.overlap?.label === "Shared Stress").length;

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Mood Map</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pb-20">
        {!partnerEmail ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border">
            <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No partner connected</h3>
            <p className="text-sm text-muted-foreground mb-6">Connect with your partner to view shared mood insights.</p>
            <Link to="/partner">
              <Button variant="outline" className="rounded-full">Go to Partner Settings</Button>
            </Link>
          </div>
        ) : moodData.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border">
            <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No mood data for this month</h3>
            <p className="text-sm text-muted-foreground mb-6">Log daily entries in your journal to see your mood timeline.</p>
            <Link to="/journal">
              <Button variant="outline" className="rounded-full">Go to Journal</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Month selector */}
            <div className="flex items-center justify-between mb-6 bg-card border border-border/60 rounded-2xl p-4">
              <button
                onClick={() => setMonth(m => subMonths(m, 1))}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <p className="font-heading font-semibold text-lg">{format(month, "MMMM yyyy")}</p>
                <p className="text-xs text-muted-foreground">{moodData.length} days tracked</p>
              </div>
              <button
                onClick={() => { if (!isCurrentMonth) setMonth(m => addMonths(m, 1)); }}
                className={`p-2 rounded-xl transition-colors ${isCurrentMonth ? "opacity-30 cursor-not-allowed" : "hover:bg-muted"}`}
                disabled={isCurrentMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-4 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-card border border-border/60 text-center">
                <p className="text-2xl font-bold text-primary">{avgUserScore}</p>
                <p className="text-xs text-muted-foreground mt-1">Your Avg Mood</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/60 text-center">
                <p className="text-2xl font-bold text-chart-4">{avgPartnerScore}</p>
                <p className="text-xs text-muted-foreground mt-1">Partner Avg</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/60 text-center">
                <p className="text-2xl font-bold text-chart-2">{connectionPeaks}</p>
                <p className="text-xs text-muted-foreground mt-1">Connection Peaks</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/60 text-center">
                <p className="text-2xl font-bold text-destructive">{stressPeriods}</p>
                <p className="text-xs text-muted-foreground mt-1">Shared Stress</p>
              </div>
            </div>

            {/* Mood timeline chart */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-6 rounded-2xl bg-card border border-border/60">
              <p className="font-heading font-semibold text-sm mb-4">Emotional Timeline</p>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    interval={Math.max(0, Math.floor(moodData.length / 10))}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="userMood"
                    name="Your Mood"
                    fill="hsl(var(--primary))"
                    stroke="hsl(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="partnerMood"
                    name="Partner's Mood"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Overlap insights */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <p className="font-heading font-semibold text-sm">Overlap Insights</p>
              {moodData.filter(d => d.overlap).length === 0 ? (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 text-center text-sm text-muted-foreground">
                  No significant overlaps this month
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {moodData
                    .filter(d => d.overlap)
                    .map((d, i) => (
                      <div key={i} className={`p-3 rounded-lg border flex items-center gap-3 ${
                        d.overlap.label === "Connection Peak"
                          ? "bg-chart-2/10 border-chart-2/20"
                          : d.overlap.label === "Shared Stress"
                          ? "bg-destructive/10 border-destructive/20"
                          : "bg-muted/30 border-border/40"
                      }`}>
                        <span className="text-lg">{d.overlap.icon}</span>
                        <div className="flex-1">
                          <p className={`text-xs font-medium ${d.overlap.color}`}>{d.overlap.label}</p>
                          <p className="text-xs text-muted-foreground">{d.label}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>

            {/* Legend */}
            <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border/40 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">How to Read This</p>
              <div className="grid sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: "hsl(var(--primary))" }} />
                  <span>Your mood trend</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: "hsl(var(--chart-4))" }} />
                  <span>Partner's mood trend</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💚 = Connection, 🔴 = Stress, ⚡ = Diverging</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}