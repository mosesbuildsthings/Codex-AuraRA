import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { ArrowLeft, TrendingUp, Calendar, Flame, Target } from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachWeekOfInterval, eachMonthOfInterval, parseISO, isSameWeek, isSameMonth } from "date-fns";

const SENTIMENT_SCORES = { great: 5, good: 4, neutral: 3, difficult: 2, tough: 1 };
const SENTIMENT_COLORS = { great: "#10b981", good: "#3b82f6", neutral: "#6b7280", difficult: "#f97316", tough: "#ef4444" };

export default function SentimentTrends() {
  const [timeframe, setTimeframe] = useState("month");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: () => base44.entities.JournalEntry.list("-date", 365),
    initialData: []
  });

  const weeklyData = useMemo(() => {
    if (entries.length === 0) return [];
    const weeks = eachWeekOfInterval({
      start: startOfWeek(new Date(entries[entries.length - 1].date)),
      end: startOfWeek(new Date(entries[0].date))
    });

    return weeks.map(week => {
      const weekEntries = entries.filter(e => isSameWeek(parseISO(e.date), week));
      const scores = weekEntries.map(e => SENTIMENT_SCORES[e.sentiment] || 3);
      const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b) / scores.length).toFixed(1) : 0;
      return {
        week: format(week, "MMM d"),
        avg: parseFloat(avg),
        count: weekEntries.length
      };
    });
  }, [entries]);

  const monthlyData = useMemo(() => {
    if (entries.length === 0) return [];
    const months = eachMonthOfInterval({
      start: startOfMonth(new Date(entries[entries.length - 1].date)),
      end: startOfMonth(new Date(entries[0].date))
    });

    return months.map(month => {
      const monthEntries = entries.filter(e => isSameMonth(parseISO(e.date), month));
      const scores = monthEntries.map(e => SENTIMENT_SCORES[e.sentiment] || 3);
      const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b) / scores.length).toFixed(1) : 0;
      return {
        month: format(month, "MMM"),
        avg: parseFloat(avg),
        count: monthEntries.length
      };
    });
  }, [entries]);

  const stats = useMemo(() => {
    const scores = entries.map(e => SENTIMENT_SCORES[e.sentiment] || 3);
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b) / scores.length).toFixed(1) : 0;
    const best = Math.max(...scores);
    const worst = Math.min(...scores);
    const currentStreak = entries.filter(e => e.date === format(new Date(), "yyyy-MM-dd")).length > 0 ? 1 : 0;
    
    return { avg, best, worst, currentStreak, total: entries.length };
  }, [entries]);

  const data = timeframe === "month" ? monthlyData : weeklyData;

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Sentiment Trends</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        {/* Stats Grid */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-card border border-border/60"
            >
              <p className="text-xs text-muted-foreground mb-1">Total Entries</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="p-4 rounded-2xl bg-card border border-border/60"
            >
              <p className="text-xs text-muted-foreground mb-1">Average Mood</p>
              <p className="text-2xl font-bold text-primary">{stats.avg}/5</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-2xl bg-card border border-border/60"
            >
              <p className="text-xs text-muted-foreground mb-1">Best Mood</p>
              <p className="text-2xl font-bold text-chart-2">{stats.best}/5</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-4 rounded-2xl bg-card border border-border/60"
            >
              <p className="text-xs text-muted-foreground mb-1">Current Streak</p>
              <p className="text-2xl font-bold text-chart-3">{stats.currentStreak} 🔥</p>
            </motion.div>
          </div>
        )}

        {/* Chart Section */}
        {isLoading ? (
          <div className="h-96 rounded-2xl bg-muted animate-pulse" />
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-2xl border-2 border-dashed border-border"
          >
            <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No journal data yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Start logging your mood daily to see trends over time.</p>
            <Link to="/daily-check-in">
              <Button className="rounded-full">Begin Daily Check-in</Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-card border border-border/60"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-lg">Mood Over Time</h3>
              <Tabs value={timeframe} onValueChange={setTimeframe}>
                <TabsList className="rounded-full bg-muted h-9 p-1">
                  <TabsTrigger value="week" className="rounded-full text-xs">Weekly</TabsTrigger>
                  <TabsTrigger value="month" className="rounded-full text-xs">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey={timeframe === "month" ? "month" : "week"} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  formatter={(value) => [`${value.toFixed(1)}/5`, "Avg Mood"]}
                />
                <Area type="monotone" dataKey="avg" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAvg)" />
              </AreaChart>
            </ResponsiveContainer>

            <p className="text-xs text-muted-foreground text-center mt-4">
              {timeframe === "month" ? "Monthly average mood scores" : "Weekly average mood scores"}
            </p>
          </motion.div>
        )}

        {/* Entry Frequency */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-6 rounded-2xl bg-card border border-border/60"
          >
            <h3 className="font-heading font-semibold text-lg mb-6">Entry Frequency</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey={timeframe === "month" ? "month" : "week"} stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  formatter={(value) => [value, "Entries"]}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  );
}