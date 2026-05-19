import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Clock, CheckCircle2, SkipForward, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

const moodOptions = [
  { value: "great", label: "Great", emoji: "😄" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "difficult", label: "Difficult", emoji: "😔" },
  { value: "skipped", label: "Skipped", emoji: "⏭️" }
];

const categoryColors = {
  communication: "bg-chart-1/10 text-chart-1",
  vulnerability: "bg-chart-4/10 text-chart-4",
  boundaries: "bg-chart-3/10 text-chart-3",
  presence: "bg-primary/10 text-primary",
  trust: "bg-chart-2/10 text-chart-2",
  listening: "bg-accent text-accent-foreground"
};

export default function ExerciseCard({ exercise, onRefresh, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedMood, setSelectedMood] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const isCompleted = exercise.status === "completed";
  const isSkipped = exercise.status === "skipped";
  const isDone = isCompleted || isSkipped;

  const handleCheckin = async () => {
    if (!selectedMood) return;
    setSaving(true);
    await base44.entities.GrowthExercise.update(exercise.id, {
      checkin_mood: selectedMood,
      checkin_notes: notes,
      checkin_date: new Date().toISOString().split("T")[0],
      status: selectedMood === "skipped" ? "skipped" : "completed"
    });
    onRefresh();
    setSaving(false);
    setCheckingIn(false);
  };

  return (
    <motion.div
      layout
      className={`rounded-xl border transition-all ${isDone ? "bg-muted/30 border-border/40" : "bg-card border-border/60"}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className={`text-xs rounded-full ${categoryColors[exercise.category] || "bg-muted text-muted-foreground"}`}>
                {exercise.category}
              </Badge>
              {exercise.duration_minutes && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {exercise.duration_minutes} min
                </span>
              )}
              {isDone && (
                <Badge className="text-xs rounded-full bg-chart-2/10 text-chart-2 gap-1">
                  {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <SkipForward className="w-3 h-3" />}
                  {isCompleted ? "Done" : "Skipped"}
                </Badge>
              )}
            </div>
            <p className={`font-medium text-sm ${isDone ? "text-muted-foreground line-through" : ""}`}>
              {exercise.title}
            </p>
            {isDone && exercise.checkin_mood && (
              <p className="text-xs text-muted-foreground mt-1">
                Felt: {moodOptions.find(m => m.value === exercise.checkin_mood)?.emoji}{" "}
                {moodOptions.find(m => m.value === exercise.checkin_mood)?.label}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onDelete(exercise.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-all"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/40 pt-4">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{exercise.description}</p>

              {!isDone && !checkingIn && (
                <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={() => setCheckingIn(true)}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Log Check-in
                </Button>
              )}

              {isDone && exercise.checkin_notes && (
                <div className="p-3 rounded-lg bg-background border border-border/40">
                  <p className="text-xs text-muted-foreground italic">"{exercise.checkin_notes}"</p>
                </div>
              )}

              {checkingIn && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">How did it go?</p>
                  <div className="flex gap-2 flex-wrap">
                    {moodOptions.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setSelectedMood(m.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all
                          ${selectedMood === m.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:border-primary/40"
                          }`}
                      >
                        <span>{m.emoji}</span> {m.label}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Any reflections? (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[70px] resize-none text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => setCheckingIn(false)}>Cancel</Button>
                    <Button size="sm" className="rounded-full" onClick={handleCheckin} disabled={!selectedMood || saving}>
                      {saving ? "Saving..." : "Save Check-in"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}