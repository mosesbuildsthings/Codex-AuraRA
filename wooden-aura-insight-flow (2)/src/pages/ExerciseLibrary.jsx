import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import CalendarSyncButton from "@/components/calendar/CalendarSyncButton";
import { useOfflineCache } from "@/hooks/useOfflineCache";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Sparkles, Search, CheckCircle2, Circle, Clock,
  ChevronDown, ChevronUp, BookOpen, Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// ── Static exercise library ──────────────────────────────────────────────────
const LIBRARY = [
  // Communication
  { id: "l1", category: "communication", title: "The 20-Minute Uninterrupted Share", duration_minutes: 25,
    description: "Each partner takes 10 minutes to share something on their mind while the other listens without interrupting, advising, or problem-solving. Afterward, the listener summarizes what they heard before switching roles." },
  { id: "l2", category: "communication", title: "Appreciation Ritual", duration_minutes: 10,
    description: "Each day for one week, share one specific thing you appreciate about your partner. It must be concrete (not just 'you're kind') — e.g., 'I appreciated when you made coffee without being asked this morning.'" },
  { id: "l3", category: "communication", title: "Needs Check-In", duration_minutes: 15,
    description: "Sit together and each answer: What do I need more of in our relationship right now? What am I getting plenty of? Share without debate — just listen and acknowledge." },
  // Conflict Resolution
  { id: "l4", category: "conflict_resolution", title: "Soft Start Reframe", duration_minutes: 15,
    description: "Think of a recurring conflict. Rewrite your usual opening statement using a soft start: begin with 'I feel...' or 'I need...' instead of 'You always...' or 'You never...'. Practice saying it aloud." },
  { id: "l5", category: "conflict_resolution", title: "The 30-Minute Pause Protocol", duration_minutes: 30,
    description: "When tension escalates, agree to pause for exactly 30 minutes. Each person does a calming solo activity, then return and use 'I' statements only. Notice how the conversation shifts after the break." },
  { id: "l6", category: "conflict_resolution", title: "Root Need Mapping", duration_minutes: 20,
    description: "After a disagreement, each write down: what was the surface issue? What deeper need was underneath it (safety, respect, connection, autonomy)? Share the root needs without re-arguing the surface issue." },
  // Vulnerability
  { id: "l7", category: "vulnerability", title: "36 Questions to Closeness", duration_minutes: 45,
    description: "Answer these questions together, taking turns: What would constitute a perfect day for you? For what in your life do you feel most grateful? If you could change anything about how you were raised, what would it be?" },
  { id: "l8", category: "vulnerability", title: "Fear Inventory Share", duration_minutes: 20,
    description: "Each partner writes down 3 fears they have about the relationship — not accusations, but genuine vulnerabilities. Share them one at a time, and after each the listener responds only with: 'Thank you for trusting me with that.'" },
  // Presence
  { id: "l9", category: "presence", title: "Phone-Free Hour", duration_minutes: 60,
    description: "Designate one hour together with all screens off and face-down. No agenda needed — just be in the same space, talk if you want, sit in comfortable silence, or do a simple activity together." },
  { id: "l10", category: "presence", title: "6-Second Kiss", duration_minutes: 5,
    description: "The Gottman Institute's research-backed ritual: greet each other and part each day with a 6-second kiss — long enough to be intentional. Track this daily for one week and notice the shift." },
  // Trust
  { id: "l11", category: "trust", title: "Trust Inventory", duration_minutes: 20,
    description: "Independently rate trust across 5 areas (honesty, reliability, emotional safety, follow-through, intimacy) on a 1–5 scale. Compare scores and discuss one area where you'd like to grow — not as criticism but as aspiration." },
  { id: "l12", category: "trust", title: "Promise & Follow-Through", duration_minutes: 10,
    description: "Each partner makes one small, specific promise this week (e.g., 'I'll be home by 7pm Tuesday'). At the end of the week, check in about whether it was kept and how it felt." },
  // Listening
  { id: "l13", category: "listening", title: "Reflective Listening Practice", duration_minutes: 20,
    description: "Partner A shares a recent frustration (non-relationship). Partner B's only job is to reflect it back: 'What I heard you say is...' No advice, no 'but'. After 3 exchanges, A rates how heard they felt on a 1–10 scale. Switch." },
  { id: "l14", category: "listening", title: "Story Behind the Behavior", duration_minutes: 15,
    description: "Think of a habit or behavior of your partner that sometimes bothers you. Try to imagine the story behind it — what past experience or unmet need might drive it? Share your reflection with curiosity, not blame." },
];

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "communication", label: "Communication" },
  { value: "conflict_resolution", label: "Conflict Resolution" },
  { value: "vulnerability", label: "Vulnerability" },
  { value: "presence", label: "Presence" },
  { value: "trust", label: "Trust" },
  { value: "listening", label: "Listening" },
];

const CAT_COLORS = {
  communication:      "bg-chart-1/10 text-chart-1",
  conflict_resolution:"bg-destructive/10 text-destructive",
  vulnerability:      "bg-chart-4/10 text-chart-4",
  presence:           "bg-primary/10 text-primary",
  trust:              "bg-chart-2/10 text-chart-2",
  listening:          "bg-accent text-accent-foreground",
};

const MOOD_OPTIONS = [
  { value: "great", label: "Great", emoji: "😄" },
  { value: "good",  label: "Good",  emoji: "🙂" },
  { value: "okay",  label: "Okay",  emoji: "😐" },
  { value: "difficult", label: "Difficult", emoji: "😔" },
  { value: "skipped",   label: "Skipped",   emoji: "⏭️" },
];

function LibraryExerciseCard({ exercise, log, onCheckin }) {
  const [expanded, setExpanded]   = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [mood, setMood]           = useState("");
  const [notes, setNotes]         = useState("");
  const [saving, setSaving]       = useState(false);

  const isDone = !!log;

  const handleSave = async () => {
    if (!mood) return;
    setSaving(true);
    await onCheckin(exercise, mood, notes);
    setSaving(false);
    setCheckingIn(false);
    setMood("");
    setNotes("");
  };

  return (
    <div className={`rounded-xl border transition-all ${isDone ? "bg-muted/30 border-border/40" : "bg-card border-border/60"}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => !isDone && setCheckingIn(true)}
            className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
          >
            {isDone
              ? <CheckCircle2 className="w-5 h-5 text-chart-2" />
              : <Circle className="w-5 h-5" />
            }
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className={`text-xs rounded-full ${CAT_COLORS[exercise.category] || "bg-muted text-muted-foreground"}`}>
                {exercise.category.replace(/_/g, " ")}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" /> {exercise.duration_minutes} min
              </span>
              {isDone && (
                <span className="text-xs text-muted-foreground">
                  Done {format(new Date(log.checkin_date), "MMM d")} · {MOOD_OPTIONS.find(m => m.value === log.mood)?.emoji}
                </span>
              )}
            </div>
            <p className={`font-medium text-sm ${isDone ? "text-muted-foreground line-through" : ""}`}>
              {exercise.title}
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 p-1 rounded-lg text-muted-foreground hover:bg-muted transition-all"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 border-t border-border/40 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">{exercise.description}</p>

              {isDone && log.notes && (
                <div className="p-3 rounded-lg bg-background border border-border/40">
                  <p className="text-xs text-muted-foreground italic">"{log.notes}"</p>
                </div>
              )}

              {!isDone && !checkingIn && (
                <div className="flex flex-wrap gap-2 items-center">
                  <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={() => setCheckingIn(true)}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Complete
                  </Button>
                  <CalendarSyncButton
                    title={exercise.title}
                    description={exercise.description}
                    date={new Date()}
                    durationMinutes={exercise.duration_minutes}
                  />
                </div>
              )}

              {checkingIn && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">How did it go?</p>
                  <div className="flex gap-2 flex-wrap">
                    {MOOD_OPTIONS.map(m => (
                      <button key={m.value} onClick={() => setMood(m.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                          mood === m.value ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/40"
                        }`}>
                        <span>{m.emoji}</span> {m.label}
                      </button>
                    ))}
                  </div>
                  <Textarea placeholder="Reflection notes (optional)" value={notes} onChange={e => setNotes(e.target.value)}
                    className="min-h-[70px] resize-none text-sm" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => setCheckingIn(false)}>Cancel</Button>
                    <Button size="sm" className="rounded-full" onClick={handleSave} disabled={!mood || saving}>
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExerciseLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch]   = useState("");
  const [category, setCategory] = useState("all");
  const [hideCompleted, setHideCompleted] = useState(false);

  // We store completions as GrowthExercise records with a special flag
  const { data: logs = [], isOffline, refetch: refreshCache } = useOfflineCache(
    "exercise-library-logs",
    () => base44.entities.GrowthExercise.filter({ attachment_style: "library" }, "-created_date", 500),
    []
  );

  const refresh = () => { queryClient.invalidateQueries({ queryKey: ["exercise-library-logs"] }); refreshCache(); };

  const handleCheckin = async (exercise, mood, notes) => {
    // Check if already logged
    const existing = logs.find(l => l.case_id === exercise.id);
    if (existing) {
      await base44.entities.GrowthExercise.update(existing.id, {
        checkin_mood: mood,
        checkin_notes: notes,
        checkin_date: format(new Date(), "yyyy-MM-dd"),
        status: mood === "skipped" ? "skipped" : "completed"
      });
    } else {
      await base44.entities.GrowthExercise.create({
        title: exercise.title,
        description: exercise.description,
        category: exercise.category,
        duration_minutes: exercise.duration_minutes,
        attachment_style: "library",   // tag to distinguish library logs
        case_id: exercise.id,          // store library exercise id
        checkin_mood: mood,
        checkin_notes: notes,
        checkin_date: format(new Date(), "yyyy-MM-dd"),
        status: mood === "skipped" ? "skipped" : "completed",
        date_assigned: format(new Date(), "yyyy-MM-dd")
      });
    }
    refresh();
  };

  const getLog = (exId) => {
    const l = logs.find(l => l.case_id === exId && l.status === "completed");
    if (!l) return null;
    return { checkin_date: l.checkin_date, mood: l.checkin_mood, notes: l.checkin_notes };
  };

  const completedIds = new Set(logs.filter(l => l.status === "completed").map(l => l.case_id));
  const completedCount = completedIds.size;

  const filtered = LIBRARY.filter(ex => {
    if (category !== "all" && ex.category !== category) return false;
    if (hideCompleted && completedIds.has(ex.id)) return false;
    if (search && !ex.title.toLowerCase().includes(search.toLowerCase()) &&
        !ex.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Exercise Library</span>
          </div>
        </div>
        <Badge className="rounded-full bg-chart-2/10 text-chart-2 gap-1.5">
          <CheckCircle2 className="w-3 h-3" />
          {completedCount} / {LIBRARY.length} done
        </Badge>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {isOffline && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-chart-3/10 border border-chart-3/20 flex items-center gap-2 text-xs text-chart-3">
            <span>📴</span> Showing cached exercises — you're offline.
          </div>
        )}
        {/* Progress bar */}
        <div className="mb-6 bg-card border border-border/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="font-heading font-semibold text-sm">Your Progress</span>
            </div>
            <span className="text-sm font-bold text-primary">
              {LIBRARY.length === 0 ? 0 : Math.round((completedCount / LIBRARY.length) * 100)}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(completedCount / LIBRARY.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {completedCount === 0
              ? "Start any exercise below to begin your growth journey."
              : `${LIBRARY.length - completedCount} exercises remaining.`}
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 rounded-full" placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button
            size="sm" variant={hideCompleted ? "default" : "outline"}
            className="rounded-full gap-1.5 shrink-0"
            onClick={() => setHideCompleted(!hideCompleted)}
          >
            <Filter className="w-3.5 h-3.5" /> Hide Done
          </Button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                category === cat.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:border-primary/40"
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mb-4">{filtered.length} exercise{filtered.length !== 1 ? "s" : ""}</p>

        <div className="space-y-3">
          {filtered.map((ex, i) => (
            <motion.div key={ex.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <LibraryExerciseCard
                exercise={ex}
                log={getLog(ex.id)}
                onCheckin={handleCheckin}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}