import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Sparkles, PenLine, FileText, BarChart3, Dumbbell } from "lucide-react";

const TOUR_KEY = "aura_tour_completed";

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to Aura 👋",
    description: "Aura is your private, AI-powered relationship advisor. Everything you share is confidential and never sold.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: PenLine,
    title: "Start a Reflection",
    description: "Tap 'New Session' to share your story. Describe your situation, answer a few context questions, and ask your core question.",
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    icon: FileText,
    title: "Receive Your Report",
    description: "Aura analyzes your narrative and generates a personalized, multi-chapter report with fatherly and/or motherly guidance.",
    color: "bg-accent text-accent-foreground",
  },
  {
    icon: BarChart3,
    title: "Track Your Journey",
    description: "Use the Journal to log daily moods, the Dashboard to see your progress, and the Wisdom Library to save insights.",
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    icon: Dumbbell,
    title: "Grow Every Day",
    description: "The Growth section offers exercises, challenges, and a vision board to help you take action on your insights.",
    color: "bg-chart-4/10 text-chart-4",
  },
];

export default function OnboardingTour({ onComplete }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setVisible(false);
    onComplete?.();
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-card rounded-3xl border border-border shadow-2xl w-full max-w-sm p-6 relative"
        >
          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Step indicator */}
          <div className="flex gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl ${current.color} flex items-center justify-center mb-5`}>
            <Icon className="w-7 h-7" />
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="font-heading text-xl font-bold mb-2">{current.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{current.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" onClick={dismiss}>
              Skip tour
            </Button>
            <Button className="flex-1 rounded-full gap-2" onClick={next}>
              {step < STEPS.length - 1 ? (
                <>Next <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Get Started <Sparkles className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}