import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Trash2, TrendingUp, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import ExerciseCard from "./ExerciseCard";

export default function ActiveGrowthModule({ exercises, latestReport, onRefresh }) {
  const [generating, setGenerating] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [error, setError] = useState("");

  const activeExercises = exercises.filter(e => e.status === "active");
  const completedExercises = exercises.filter(e => e.status !== "active");

  const totalDone = exercises.filter(e => e.status === "completed").length;
  const streak = totalDone;

  const generateExercises = async () => {
    setGenerating(true);
    setError("");

    const attachmentContext = latestReport
      ? `The user's inferred attachment style is: ${latestReport.attachment_styles?.user_style || "unknown"}.
         Their partner's style is: ${latestReport.attachment_styles?.partner_style || "unknown"}.
         Attachment style interaction: ${latestReport.attachment_styles?.explanation || ""}
         Recent analysis summary: ${latestReport.summary?.substring(0, 300) || ""}`
      : "No prior analysis available. Generate general relationship health exercises.";

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Aura, a compassionate relationship coach. Generate exactly 3 daily relationship communication exercises.

Context about the user:
${attachmentContext}

Create 3 short, practical, concrete exercises the person can do TODAY to strengthen their relationship communication.
Each should be specific, actionable within 5-15 minutes, and grounded in attachment theory or communication psychology.
They should range from easy to moderate difficulty.`,
      response_json_schema: {
        type: "object",
        properties: {
          exercises: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "Short exercise name (under 8 words)" },
                description: { type: "string", description: "Step-by-step instructions, 3-5 sentences. Be very specific and actionable." },
                category: { type: "string", description: "One of: communication, vulnerability, boundaries, presence, trust, listening" },
                duration_minutes: { type: "number", description: "Estimated minutes (5-15)" },
                attachment_style: { type: "string", description: "Which attachment style this most helps" }
              }
            }
          }
        }
      }
    });

    const today = new Date().toISOString().split("T")[0];
    for (const ex of result.exercises) {
      await base44.entities.GrowthExercise.create({
        ...ex,
        date_assigned: today,
        case_id: latestReport?.case_id || null,
        status: "active"
      });
    }

    onRefresh();
    setGenerating(false);
  };

  const handleDeleteExercise = async (id) => {
    await base44.entities.GrowthExercise.delete(id);
    onRefresh();
  };

  const handleClearAll = async () => {
    setClearingAll(true);
    for (const ex of exercises) {
      await base44.entities.GrowthExercise.delete(ex.id);
    }
    onRefresh();
    setClearingAll(false);
    setShowClearConfirm(false);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-xl font-semibold">Active Growth</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Daily exercises tailored to your attachment style</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {exercises.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full text-muted-foreground hover:text-destructive gap-1.5"
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </Button>
          )}
          <Button
            size="sm"
            className="rounded-full gap-1.5"
            onClick={generateExercises}
            disabled={generating}
          >
            {generating ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5" /> Generate Today's Exercises</>
            )}
          </Button>
        </div>
      </div>

      {/* Clear all confirmation */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm">Delete all exercises and check-in history?</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
              <Button size="sm" variant="destructive" className="rounded-full" onClick={handleClearAll} disabled={clearingAll}>
                {clearingAll ? "Clearing..." : "Delete All"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress stat */}
      {totalDone > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-chart-2/8 border border-chart-2/20 mb-5">
          <TrendingUp className="w-4 h-4 text-chart-2" />
          <p className="text-sm text-chart-2 font-medium">{totalDone} exercise{totalDone !== 1 ? "s" : ""} completed — keep going!</p>
        </div>
      )}

      {/* Attachment style insight */}
      {latestReport?.attachment_styles && (
        <div className="p-4 rounded-xl bg-accent/40 border border-accent mb-5">
          <p className="text-xs text-accent-foreground/70 uppercase tracking-wider mb-1">Your Attachment Context</p>
          <p className="text-sm font-medium mb-0.5">
            You: <span className="text-primary">{latestReport.attachment_styles.user_style}</span>
            {" · "}Partner: <span className="text-primary">{latestReport.attachment_styles.partner_style}</span>
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">{latestReport.attachment_styles.explanation?.substring(0, 150)}…</p>
        </div>
      )}

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {/* Active exercises */}
      {exercises.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border">
          <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-sm mb-1">No exercises yet</p>
          <p className="text-xs text-muted-foreground mb-4">
            {latestReport
              ? "Generate today's personalized exercises based on your analysis."
              : "Complete an analysis first, then generate personalized exercises."}
          </p>
          {latestReport && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={generateExercises} disabled={generating}>
              {generating ? "Generating..." : "Generate Exercises"}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {activeExercises.length > 0 && (
            <>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today's Exercises</p>
              {activeExercises.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} onRefresh={onRefresh} onDelete={handleDeleteExercise} />
              ))}
            </>
          )}

          {completedExercises.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground uppercase tracking-wider list-none flex items-center gap-1.5 hover:text-foreground transition-colors mt-4">
                <span className="group-open:hidden">▶</span>
                <span className="hidden group-open:inline">▼</span>
                Past Exercises ({completedExercises.length})
              </summary>
              <div className="space-y-2 mt-3">
                {completedExercises.map((ex) => (
                  <ExerciseCard key={ex.id} exercise={ex} onRefresh={onRefresh} onDelete={handleDeleteExercise} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}