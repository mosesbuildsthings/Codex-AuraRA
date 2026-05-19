import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Heart, Flame, Target, BookOpen, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays, parseISO } from "date-fns";

const BADGES = {
  first_entry: { icon: BookOpen, label: "First Reflection", color: "bg-primary/10 text-primary" },
  week_streak: { icon: Flame, label: "Week Streak", color: "bg-chart-3/10 text-chart-3" },
  month_streak: { icon: Flame, label: "Month Streak", color: "bg-chart-2/10 text-chart-2" },
  exercise_start: { icon: Dumbbell, label: "Growth Seeker", color: "bg-chart-1/10 text-chart-1" },
  goal_achieved: { icon: Target, label: "Goal Achiever", color: "bg-chart-4/10 text-chart-4" },
  milestone_first_year: { icon: Trophy, label: "One Year", color: "bg-accent text-accent-foreground" },
  partnership_milestone: { icon: Heart, label: "Partnership", color: "bg-destructive/10 text-destructive" },
  consistent_engagement: { icon: Star, label: "Devoted", color: "bg-primary/20 text-primary" }
};

export default function RelationshipJourney({ 
  journalEntries = [], 
  exercises = [], 
  goals = [], 
  milestones = [],
  user = null 
}) {
  const earnedBadges = useMemo(() => {
    const badges = [];
    const now = new Date();

    // First entry badge
    if (journalEntries.length > 0) {
      badges.push("first_entry");
    }

    // Streak badges
    if (journalEntries.length > 0) {
      const sortedEntries = [...journalEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
      const today = new Date();
      let streak = 0;

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split("T")[0];
        if (sortedEntries.some(e => e.date === dateStr)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      if (streak >= 7) badges.push("week_streak");
      if (streak >= 30) badges.push("month_streak");
    }

    // Exercise badge
    if (exercises.length > 0) {
      badges.push("exercise_start");
    }

    // Goal achievement badge
    if (goals.some(g => g.status === "completed")) {
      badges.push("goal_achieved");
    }

    // Anniversary badge
    if (user?.created_date) {
      const yearsSince = differenceInDays(now, parseISO(user.created_date)) / 365;
      if (yearsSince >= 1) {
        badges.push("milestone_first_year");
      }
    }

    // Partnership milestone (has connection)
    if (milestones.length > 0) {
      badges.push("partnership_milestone");
    }

    // Consistent engagement (all areas active)
    if (journalEntries.length > 5 && exercises.length > 0 && goals.length > 0) {
      badges.push("consistent_engagement");
    }

    return Array.from(new Set(badges));
  }, [journalEntries, exercises, goals, milestones, user]);

  const journeySteps = [
    { step: 1, title: "Begin", subtitle: "Start your reflection", active: journalEntries.length > 0 },
    { step: 2, title: "Build Awareness", subtitle: "Consistent journaling", active: journalEntries.length > 10 },
    { step: 3, title: "Take Action", subtitle: "Complete exercises", active: exercises.filter(e => e.status === "completed").length > 0 },
    { step: 4, title: "Set Goals", subtitle: "Define relationship goals", active: goals.length > 0 },
    { step: 5, title: "Achieve", subtitle: "Goals completed", active: goals.some(g => g.status === "completed") },
    { step: 6, title: "Celebrate", subtitle: "Milestones created", active: milestones.length > 0 }
  ];

  const completedSteps = journeySteps.filter(s => s.active).length;

  return (
    <div className="space-y-6">
      {/* Journey Progress */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-sm font-semibold">Your Relationship Journey</h3>
          <span className="text-xs text-primary font-medium bg-primary/5 px-2.5 py-1 rounded-full">
            {completedSteps}/{journeySteps.length}
          </span>
        </div>

        {/* Scrollable steps row on mobile */}
        <div className="overflow-x-auto -mx-1 px-1 pb-2">
          <div className="relative min-w-max">
            {/* Progress bar */}
            <div className="absolute top-4 left-5 right-5 h-1 bg-border/40 rounded-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps / journeySteps.length) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <div className="relative z-10 flex gap-6 sm:gap-0 sm:justify-between">
              {journeySteps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center w-16 shrink-0"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                      s.active
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                        : "bg-card border-border text-muted-foreground"
                    }`}
                  >
                    {s.step}
                  </div>
                  <p className="text-xs font-medium mt-1.5 text-center leading-tight">{s.title}</p>
                  <p className="text-xs text-muted-foreground text-center leading-tight hidden sm:block">{s.subtitle}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="font-heading text-sm font-semibold mb-3">Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {earnedBadges.map((badgeId, i) => {
              const badge = BADGES[badgeId];
              if (!badge) return null;
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badgeId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-3 rounded-xl border border-border/40 flex flex-col items-center justify-center text-center ${badge.color} bg-opacity-50`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <p className="text-xs font-medium">{badge.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {earnedBadges.length === 0 && (
        <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/40">
          <p className="text-xs text-muted-foreground">
            Start journaling and completing exercises to earn badges!
          </p>
        </div>
      )}
    </div>
  );
}