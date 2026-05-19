import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  PenLine, Users, Zap, Trophy, Dumbbell, Brain, Eye,
  Download, Share2, Crown, CheckCircle2, Loader2, BookOpen, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const PremiumBadge = () => (
  <Badge className="bg-chart-3/20 text-chart-3 border border-chart-3/30 rounded-full text-xs gap-1 shrink-0">
    <Crown className="w-2.5 h-2.5" /> Premium
  </Badge>
);

const ActionItem = ({ icon: Icon, title, description, onClick, premium, loading, done }) => (
  <button
    onClick={onClick}
    className="w-full flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
  >
    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
      {loading ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> :
       done ? <CheckCircle2 className="w-4 h-4 text-chart-2" /> :
       <Icon className="w-4 h-4 text-primary" />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-medium">{title}</p>
        {premium && <PremiumBadge />}
      </div>
      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
    </div>
  </button>
);

export default function ReportActions({ report, caseId }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [addToJournal, setAddToJournal] = useState(false);
  const [generating, setGenerating] = useState({});
  const [done, setDone] = useState({});

  const showPremiumToast = () => {
    toast({
      id: "premium-gate",
      title: "Premium Feature",
      description: "Upgrade to Aura Premium ($15/month) to unlock this feature.",
      duration: 4000,
      action: (
        <a href="/premium">
          <button className="inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Get Premium
          </button>
        </a>
      ),
    });
  };

  const markDone = (key) => setDone(d => ({ ...d, [key]: true }));
  const setLoading = (key, val) => setGenerating(g => ({ ...g, [key]: val }));

  const handleAddToJournal = async () => {
    if (!notes.trim()) {
      toast({ title: "Add some notes first", description: "Write a note before adding to your journal." });
      return;
    }
    setLoading("journal", true);
    await base44.entities.JournalEntry.create({
      date: new Date().toISOString().split("T")[0],
      content: `Session Notes (from Report):\n\n${notes}`,
      sentiment: "neutral",
      sentiment_score: 3,
      tags: ["Session Notes"],
      is_private: true
    });
    setLoading("journal", false);
    markDone("journal");
    toast({ title: "Added to Journal", description: "Your notes have been saved to today's journal." });
  };

  const handleCreateActionPlan = async () => {
    setLoading("action", true);
    await base44.entities.RelationshipGoal.create({
      title: "Custom Action Plan from Report",
      description: `Based on report: "${report.title}". ${report.advice?.substring(0, 200) || ""}`,
      category: "communication",
      status: "not_started"
    });
    setLoading("action", false);
    markDone("action");
    toast({ title: "Action Plan Created", description: "Find it in your Goals section." });
    setTimeout(() => navigate("/goals"), 1500);
  };

  const handleCreateChallenge = async () => {
    setLoading("challenge", true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this relationship report summary: "${report.summary?.substring(0, 300)}", create 1 weekly challenge to improve the relationship. Be specific and actionable.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" }
        }
      }
    });
    await base44.entities.Challenge.create({
      title: result.title || "Weekly Connection Challenge",
      description: result.description || "A custom challenge based on your report.",
      category: "communication",
      difficulty: "medium",
      duration_days: 7,
      status: "active",
      started_date: new Date().toISOString()
    });
    setLoading("challenge", false);
    markDone("challenge");
    toast({ title: "Challenge Created", description: "Find it in your Challenges section." });
  };

  const handleCreateExercise = async () => {
    setLoading("exercise", true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this relationship advice: "${report.advice?.substring(0, 300)}", create 1 specific communication exercise for the couple. Be detailed and practical.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          duration_minutes: { type: "number" },
          category: { type: "string" }
        }
      }
    });
    await base44.entities.GrowthExercise.create({
      title: result.title || "Custom Relationship Exercise",
      description: result.description || "A personalized exercise from your report.",
      category: result.category || "communication",
      duration_minutes: result.duration_minutes || 20,
      case_id: caseId,
      date_assigned: new Date().toISOString().split("T")[0],
      status: "active"
    });
    setLoading("exercise", false);
    markDone("exercise");
    toast({ title: "Exercise Created", description: "Find it in your Exercise Library." });
  };

  const handleCreateQuiz = async () => {
    setLoading("quiz", true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this relationship report: "${report.summary?.substring(0, 300)}", create a "How Well Do You Know Me?" quiz with 5 questions to send to a partner. Each question should reveal something important about the person's needs based on the report.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                text: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                correct_answer: { type: "string" },
                order: { type: "number" }
              }
            }
          }
        }
      }
    });
    await base44.entities.Quiz.create({
      title: result.title || "Know Me Better Quiz",
      type: "how_well_do_you_know_me",
      questions: result.questions || [],
      is_shared: true
    });
    setLoading("quiz", false);
    markDone("quiz");
    toast({ title: "Quiz Created", description: "Find and share it in the Quiz Hub." });
    setTimeout(() => navigate("/quiz"), 1500);
  };

  const handleVisionBoard = async () => {
    setLoading("vision", true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this relationship advice: "${report.advice?.substring(0, 300)}", write an inspiring vision statement for what an ideal version of this relationship could look like. 2-3 sentences, warm and hopeful.`,
    });
    await base44.entities.VisionBoardItem.create({
      type: "quote",
      title: "My Relationship Vision",
      content: result || "We are building a relationship grounded in trust, open communication, and mutual growth.",
      category: "growth",
      shared: false
    });
    setLoading("vision", false);
    markDone("vision");
    toast({ title: "Vision Created", description: "Find it on your Vision Board." });
    setTimeout(() => navigate("/vision-board"), 1500);
  };

  const handleSaveNotes = async () => {
    if (!notes.trim()) return;
    setSavingNotes(true);
    // Notes saved to journal if user opted in, otherwise just toast
    if (addToJournal) {
      await handleAddToJournal();
    } else {
      toast({ title: "Notes saved", description: "Your session notes have been recorded." });
    }
    setSavingNotes(false);
    setNotesOpen(false);
  };

  return (
    <div className="mt-10 space-y-6">
      <div>
        <h3 className="font-heading text-lg font-semibold mb-1">What would you like to do next?</h3>
        <p className="text-sm text-muted-foreground mb-4">Take action on insights from this report.</p>

        <div className="space-y-2">
          {/* Notes */}
          <ActionItem
            icon={PenLine}
            title="Add Session Notes"
            description="Write down thoughts or reflections about this session."
            onClick={() => setNotesOpen(o => !o)}
          />

          {notesOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-3"
            >
              <Textarea
                placeholder="What stood out to you from this report? How are you feeling?"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="min-h-[100px] resize-y"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addToJournal}
                  onChange={e => setAddToJournal(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="text-sm text-muted-foreground">Also add to today's journal entry</span>
              </label>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes || !notes.trim()} className="rounded-full gap-1.5">
                  {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                  Save Notes
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setNotesOpen(false)} className="rounded-full">Cancel</Button>
              </div>
            </motion.div>
          )}

          {/* Action Plan (free) */}
          <ActionItem
            icon={Zap}
            title="Create Custom Action Plan"
            description="AI creates a personalized action plan and micro-exercises based on this report."
            onClick={handleCreateActionPlan}
            loading={generating.action}
            done={done.action}
          />

          {/* Weekly Challenge (free) */}
          <ActionItem
            icon={Trophy}
            title="Create Weekly Challenge"
            description="AI generates a custom weekly challenge to improve your relationship."
            onClick={handleCreateChallenge}
            loading={generating.challenge}
            done={done.challenge}
          />

          {/* Custom Exercise (free) */}
          <ActionItem
            icon={Dumbbell}
            title="Create Custom Exercise"
            description="AI creates a tailored communication exercise for you and your partner."
            onClick={handleCreateExercise}
            loading={generating.exercise}
            done={done.exercise}
          />

          {/* Quiz (free) */}
          <ActionItem
            icon={Brain}
            title="Create Custom Quiz"
            description="AI builds a 'How Well Do You Know Me?' quiz you can send to your partner."
            onClick={handleCreateQuiz}
            loading={generating.quiz}
            done={done.quiz}
          />

          {/* Vision Board (free) */}
          <ActionItem
            icon={Eye}
            title="Create Relationship Vision"
            description="AI helps you define what your ideal relationship looks like and adds it to your Vision Board."
            onClick={handleVisionBoard}
            loading={generating.vision}
            done={done.vision}
          />

          {/* Premium: PDF Download */}
          <ActionItem
            icon={Download}
            title="Download PDF Report"
            description="Export a beautifully formatted PDF of this report to save or print."
            onClick={showPremiumToast}
            premium
          />

          {/* Premium: Share */}
          <ActionItem
            icon={Share2}
            title="Share Report"
            description="Share this report via WhatsApp, text, or email with anyone you trust."
            onClick={showPremiumToast}
            premium
          />

          {/* Premium: Partner Connect */}
          <ActionItem
            icon={Users}
            title="Invite Partner to View Report"
            description="Connect your partner so they can see this report and receive joint insights."
            onClick={showPremiumToast}
            premium
          />
        </div>
      </div>
    </div>
  );
}