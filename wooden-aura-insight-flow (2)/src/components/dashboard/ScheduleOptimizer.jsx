import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Sparkles, Calendar, AlertCircle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays } from "date-fns";

const ACTIVITY_HOURS = {
  morning: { label: "Morning", hours: "6:00 AM - 9:00 AM", icon: "🌅" },
  midday: { label: "Midday", hours: "12:00 PM - 1:00 PM", icon: "☀️" },
  evening: { label: "Evening", hours: "6:00 PM - 8:00 PM", icon: "🌆" },
  night: { label: "Night", hours: "8:00 PM - 10:00 PM", icon: "🌙" }
};

const ACTIVITIES = [
  { id: "checkin", label: "Daily Check-in", duration: 10, emoji: "💬" },
  { id: "exercise", label: "Relationship Exercise", duration: 15, emoji: "🎯" },
  { id: "journal", label: "Journal Entry", duration: 15, emoji: "📝" },
  { id: "milestone", label: "Celebrate Milestone", duration: 30, emoji: "🎉" }
];

export default function ScheduleOptimizer({ journalEntries = [], exercises = [], connections = [] }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [showScheduling, setShowScheduling] = useState(false);

  // Analyze engagement patterns
  const engagementPatterns = useMemo(() => {
    const patterns = {
      morning: 0,
      midday: 0,
      evening: 0,
      night: 0
    };

    journalEntries.forEach(entry => {
      const hour = new Date(entry.created_date || new Date()).getHours();
      if (hour >= 6 && hour < 12) patterns.morning++;
      else if (hour >= 12 && hour < 17) patterns.midday++;
      else if (hour >= 17 && hour < 20) patterns.evening++;
      else patterns.night++;
    });

    return patterns;
  }, [journalEntries]);

  // Find optimal time
  const optimalTime = useMemo(() => {
    const times = Object.entries(engagementPatterns);
    if (times.length === 0) return "evening";
    return times.sort((a, b) => b[1] - a[1])[0][0];
  }, [engagementPatterns]);

  // Generate suggestions for next 7 days
  const suggestions = useMemo(() => {
    const sugg = [];
    const today = new Date();
    const activitiesPool = [...ACTIVITIES];

    for (let i = 1; i <= 7; i++) {
      const date = addDays(today, i);
      const dayName = format(date, "EEE");
      
      // Alternate activities
      const activity = activitiesPool[i % activitiesPool.length];
      
      sugg.push({
        day: i,
        dayName,
        date,
        activity,
        time: optimalTime,
        completed: false
      });
    }

    return sugg;
  }, [optimalTime]);

  const todaySuggestion = suggestions[selectedDay];
  const hasPartner = connections.some(c => c.status === "accepted");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-heading text-sm font-semibold">Check-in Scheduler</h3>
        </div>
        <Badge className="rounded-full text-xs bg-primary/10 text-primary border-primary/20">
          {optimalTime.charAt(0).toUpperCase() + optimalTime.slice(1)}
        </Badge>
      </div>

      {!hasPartner && (
        <div className="p-3 rounded-lg bg-accent/40 border border-accent text-xs text-accent-foreground flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Connect with your partner to sync calendar availability.</span>
        </div>
      )}

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {suggestions.map((sugg, i) => (
          <button
            key={sugg.day}
            onClick={() => setSelectedDay(i)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-xs font-medium transition-all shrink-0 ${
              selectedDay === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <p>{sugg.dayName}</p>
            <p className="text-xs opacity-75">{format(sugg.date, "MMM d")}</p>
          </button>
        ))}
      </div>

      {/* Selected day details */}
      <AnimatePresence mode="wait">
        {todaySuggestion && (
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-4 rounded-xl bg-card border border-border/60"
          >
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Suggested Activity</p>
              <div className="flex items-center gap-2">
                <span className="text-lg">{todaySuggestion.activity.emoji}</span>
                <div>
                  <p className="font-medium text-sm">{todaySuggestion.activity.label}</p>
                  <p className="text-xs text-muted-foreground">{todaySuggestion.activity.duration} min</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border/40 pt-3">
              <p className="text-xs text-muted-foreground mb-2">Optimal Time</p>
              <div className="flex items-center gap-2">
                <span>{ACTIVITY_HOURS[optimalTime].icon}</span>
                <div>
                  <p className="font-medium text-sm">{ACTIVITY_HOURS[optimalTime].label}</p>
                  <p className="text-xs text-muted-foreground">{ACTIVITY_HOURS[optimalTime].hours}</p>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              className="w-full mt-4 rounded-lg gap-1.5"
              onClick={() => setShowScheduling(!showScheduling)}
            >
              <Plus className="w-3.5 h-3.5" />
              {showScheduling ? "Cancel" : "Add to Calendar"}
            </Button>

            {showScheduling && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-border/40 space-y-2 text-xs"
              >
                <p className="text-muted-foreground">
                  📌 To sync with external calendars (Google, Outlook):
                </p>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                  <li>Go to Partner Settings</li>
                  <li>Connect your calendar</li>
                  <li>We'll auto-find mutual availability</li>
                </ol>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage insights */}
      <div className="p-3 rounded-lg bg-muted/30 border border-border/40 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Your patterns</p>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {Object.entries(engagementPatterns).map(([time, count]) => (
            <div key={time} className="text-center">
              <p className="font-medium">{count}</p>
              <p className="text-muted-foreground capitalize text-xs">{time.substring(0, 3)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}