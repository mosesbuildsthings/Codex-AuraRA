import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, TrendingUp, Heart, Activity, MessageSquare, Zap, Award } from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import { format, subDays, startOfWeek, parseISO, differenceInDays } from "date-fns";

const SENTIMENT_SCORES = {
  great: 5,
  good: 4,
  neutral: 3,
  difficult: 2,
  tough: 1
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-lg p-2 shadow text-xs">
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}: {p.value.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

export default function HealthDashboard() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["journal-all"],
    queryFn: () => base44.entities.JournalEntry.list("-date", 500),
    initialData: []
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises-health"],
    queryFn: () => base44.entities.GrowthExercise.list("-created_date", 100),
    initialData: []
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["connections"],
    queryFn: () => base44.entities.PartnerConnection.list("-created_date", 50),
    initialData: []
  });

  const { data: coolDowns = [] } = useQuery({
    queryKey: ["cooldowns"],
    queryFn: () => base44.entities.CoolDownSession.list("-created_date", 100),
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

  const userEntries = journalEntries.filter(e => e.created_by === user?.email);
  const partnerEntries = partnerEmail
    ? journalEntries.filter(e => e.created_by === partnerEmail)
    : [];

  // Calculate weekly trends
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayLabel = format(date, "EEE");

      const userDay = userEntries.filter(e => e.date === dateStr);
      const partnerDay = partnerEmail ? partnerEntries.filter(e => e.date === dateStr) : [];

      const userScore = userDay.length
        ? userDay.reduce((s, e) => s + (SENTIMENT_SCORES[e.sentiment] || 3), 0) / userDay.length
        : null;
      const partnerScore = partnerDay.length
        ? partnerDay.reduce((s, e) => s + (SENTIMENT_SCORES[e.sentiment] || 3), 0) / partnerDay.length
        : null;

      data.push({
        day: dayLabel,
        userMood: userScore,
        partnerMood: partnerScore,
        harmony: userScore && partnerScore ? 5 - Math.abs(userScore - partnerScore) : null
      });
    }
    return data;
  }, [userEntries, partnerEntries, partnerEmail]);

  // Communication frequency
  const communicationData = useMemo(() => {
    const categories = ["communication", "vulnerability", "boundaries", "presence", "trust", "listening"];
    const data = categories.map(cat => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: exercises.filter(e => e.category === cat).length
    }));
    return data;
  }, [exercises]);

  // Health metrics
  const metrics = useMemo(() => {
    const lastWeek = subDays(new Date(), 7);
    const recentEntries = userEntries.filter(e => parseISO(e.date) >= lastWeek);
    const completedExercises = exercises.filter(e => e.status === "completed" && parseISO(e.created_date) >= lastWeek);
    const resolvedConflicts = coolDowns.filter(c => c.completed && parseISO(c.created_date) >= lastWeek);

    return {
      journalConsistency: recentEntries.length,
      exercisesCompleted: completedExercises.length,
      conflictResolutions: resolvedConflicts.length,
      emotionalAverage: recentEntries.length
        ? (recentEntries.reduce((s, e) => s + (SENTIMENT_SCORES[e.sentiment] || 3), 0) / recentEntries.length).toFixed(1)
        : 0
    };
  }, [userEntries, exercises, coolDowns]);

  // Overall health score
  const healthScore = useMemo(() => {
    const scores = [];
    if (metrics.journalConsistency > 0) scores.push(Math.min(metrics.journalConsistency * 10, 100));
    if (metrics.exercisesCompleted > 0) scores.push(Math.min(metrics.exercisesCompleted * 15, 100));
    if (metrics.conflictResolutions > 0) scores.push(100);
    if (metrics.emotionalAverage > 0) scores.push(metrics.emotionalAverage * 20);

    return scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * (Math.min(scores.length, 3) / 3))
      : 0;
  }, [metrics]);

  const COLORS = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Relationship Health</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        {/* Overall Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Overall Relationship Health</p>
              <p className="text-4xl font-bold text-primary">{healthScore}%</p>
            </div>
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeDasharray={`${(healthScore / 100) * 282.7} 282.7`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-4 gap-3 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-4 rounded-xl bg-card border border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.journalConsistency}</p>
                <p className="text-xs text-muted-foreground">Journal Entries (7d)</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-4 rounded-xl bg-card border border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.exercisesCompleted}</p>
                <p className="text-xs text-muted-foreground">Exercises Done (7d)</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-4 rounded-xl bg-card border border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.conflictResolutions}</p>
                <p className="text-xs text-muted-foreground">Conflicts Resolved</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-4 rounded-xl bg-card border border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.emotionalAverage}</p>
                <p className="text-xs text-muted-foreground">Avg Mood</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Mood Trend */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 p-6 rounded-2xl bg-card border border-border/60">
          <p className="font-heading font-semibold text-sm mb-4">Weekly Mood Trend</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="userMood" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} name="Your Mood" />
              {partnerEmail && <Line type="monotone" dataKey="partnerMood" stroke="hsl(var(--chart-4))" strokeWidth={2.5} dot={{ fill: "hsl(var(--chart-4))", r: 4 }} name="Partner's Mood" />}
              {partnerEmail && <Line type="monotone" dataKey="harmony" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="5 5" name="Harmony Score" />}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Communication Skills Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-card border border-border/60">
            <p className="font-heading font-semibold text-sm mb-4">Communication Focus Areas</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={communicationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl bg-card border border-border/60">
            <p className="font-heading font-semibold text-sm mb-4">Activity Distribution</p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Journal Entries", value: userEntries.length },
                    { name: "Exercises", value: exercises.length },
                    { name: "Resolutions", value: coolDowns.filter(c => c.completed).length }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 rounded-2xl bg-muted/30 border border-border/40 space-y-3">
          <p className="font-heading font-semibold text-sm">This Week's Insights</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            {metrics.journalConsistency >= 5 && (
              <div className="flex items-start gap-2">
                <span className="text-lg">📚</span>
                <span>Great consistency! You've journaled {metrics.journalConsistency} times this week.</span>
              </div>
            )}
            {metrics.conflictResolutions > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-lg">💚</span>
                <span>You resolved {metrics.conflictResolutions} conflict{metrics.conflictResolutions > 1 ? "s" : ""} using the Cool Down process.</span>
              </div>
            )}
            {metrics.exercisesCompleted > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-lg">🎯</span>
                <span>Completed {metrics.exercisesCompleted} growth exercise{metrics.exercisesCompleted > 1 ? "s" : ""}. Building stronger communication!</span>
              </div>
            )}
            {healthScore >= 70 && (
              <div className="flex items-start gap-2">
                <span className="text-lg">🌟</span>
                <span>Your relationship health is excellent. Keep up the positive momentum!</span>
              </div>
            )}
            {healthScore < 50 && (
              <div className="flex items-start gap-2">
                <span className="text-lg">💪</span>
                <span>Focus on consistency. Daily journaling and exercises will improve your health score.</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}