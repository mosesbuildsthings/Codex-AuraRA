import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Sun, Heart } from "lucide-react";
import { format } from "date-fns";

const SENTIMENTS = [
  { value: "great", label: "Great", emoji: "😊", score: 5, color: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  { value: "good", label: "Good", emoji: "🙂", score: 4, color: "bg-primary/10 text-primary border-primary/20" },
  { value: "neutral", label: "Neutral", emoji: "😐", score: 3, color: "bg-muted text-muted-foreground border-border" },
  { value: "difficult", label: "Difficult", emoji: "😔", score: 2, color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  { value: "tough", label: "Tough", emoji: "😢", score: 1, color: "bg-destructive/10 text-destructive border-destructive/20" }
];

export default function DailyCheckIn() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [sentiment, setSentiment] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Check if user already completed check-in today
    base44.entities.JournalEntry.list("-date", 1).then((entries) => {
      if (entries.length > 0 && entries[0].date === format(new Date(), "yyyy-MM-dd")) {
        setCompleted(true);
      }
    });
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    const s = SENTIMENTS.find(x => x.value === sentiment);
    const entry = {
      date: format(new Date(), "yyyy-MM-dd"),
      content: gratitude || "No gratitude entry today",
      sentiment,
      sentiment_score: s?.score || 3,
      tags: ["gratitude", "daily-check-in"],
      is_private: true
    };

    await base44.entities.JournalEntry.create(entry);
    setSubmitting(false);
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-chart-2/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-chart-2" />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3">
            Check-in Complete
          </h2>
          <p className="text-muted-foreground mb-8">
            You've logged your mood and gratitude for today. Great job staying connected to your relationship!
          </p>
          <Button
            className="rounded-full px-8 w-full gap-2"
            onClick={() => navigate("/journal")}
          >
            View Journal <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-10">
            {["Mood", "Gratitude"].map((label, i) => (
              <React.Fragment key={label}>
                <button
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                    i === step
                      ? "bg-primary text-primary-foreground"
                      : i < step
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
                {i < 1 && (
                  <div className={`flex-1 h-0.5 rounded-full ${i < step ? "bg-primary/30" : "bg-border"}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 0: Mood Selection */}
            {step === 0 && (
              <motion.div
                key="mood"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-2xl border border-border/60 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sun className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-bold">Good Morning!</h2>
                    <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
                  </div>
                </div>

                <h3 className="font-medium mb-4">How is your relationship feeling today?</h3>

                <div className="space-y-3 mb-8">
                  {SENTIMENTS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSentiment(s.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                        sentiment === s.value
                          ? s.color + " border-current font-semibold"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="text-2xl">{s.emoji}</span>
                      <div>
                        <p className="font-medium">{s.label}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full rounded-full gap-2"
                  onClick={() => setStep(1)}
                  disabled={!sentiment}
                >
                  Next: Gratitude <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Step 1: Gratitude Entry */}
            {step === 1 && (
              <motion.div
                key="gratitude"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-2xl border border-border/60 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-chart-2/20 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-chart-2" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold">Express Gratitude</h2>
                </div>

                <p className="text-muted-foreground mb-4">
                  What's one thing you're grateful for in your relationship today?
                </p>

                <Textarea
                  placeholder="A small gesture, a conversation, a moment of connection... anything counts!"
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  className="min-h-[120px] mb-6 resize-none"
                />

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => setStep(0)}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 rounded-full gap-2"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Complete Check-in"}
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <footer className="py-4 px-6 text-center border-t border-border/40">
        <p className="text-xs text-muted-foreground">
          This takes less than 2 minutes. Your entries help you track emotional patterns over time.
        </p>
      </footer>
    </div>
  );
}