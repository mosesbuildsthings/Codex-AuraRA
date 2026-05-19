import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Heart, Flame, ChevronRight, CheckCircle2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FEELINGS = [
  { value: "frustrated", label: "Frustrated", emoji: "😤" },
  { value: "hurt", label: "Hurt", emoji: "💔" },
  { value: "angry", label: "Angry", emoji: "😠" },
  { value: "disappointed", label: "Disappointed", emoji: "😔" },
  { value: "confused", label: "Confused", emoji: "😕" },
  { value: "anxious", label: "Anxious", emoji: "😰" },
  { value: "overwhelmed", label: "Overwhelmed", emoji: "😩" }
];

const NVC_STEPS = [
  {
    step: 0,
    title: "What Happened?",
    description: "Describe the disagreement objectively, without blame or judgment.",
    prompt: "What led to this conflict? Focus on facts, not interpretations.",
    field: "disagreement"
  },
  {
    step: 1,
    title: "How Do You Feel?",
    description: "Name the emotions you're experiencing right now.",
    prompt: "What feelings are present? Pick one or more from below.",
    field: "feelings"
  },
  {
    step: 2,
    title: "What Do You Need?",
    description: "Identify the underlying need or value that's unmet.",
    prompt: "What need or value is this disagreement about? (e.g., respect, trust, autonomy, connection)",
    field: "needs"
  },
  {
    step: 3,
    title: "What's Your Request?",
    description: "Make a specific, actionable request to move forward.",
    prompt: "What would help resolve this? Be clear and achievable.",
    field: "requests"
  },
  {
    step: 4,
    title: "Reflect & Breathe",
    description: "Take a moment to recognize your needs and your partner's humanity.",
    prompt: "What insight did you gain? How can both of you move forward together?",
    field: "reflection"
  }
];

export default function CoolDown() {
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionData, setSessionData] = useState({
    disagreement: "",
    initial_feeling: "",
    intensity: 5,
    observations: "",
    feelings: "",
    needs: "",
    requests: "",
    reflection: ""
  });
  const [showIntensity, setShowIntensity] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleNext = () => {
    if (currentStep < NVC_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveSession = async () => {
    setSaving(true);
    try {
      await base44.entities.CoolDownSession.create({
        ...sessionData,
        current_step: currentStep,
        completed: currentStep === NVC_STEPS.length - 1,
        completed_date: currentStep === NVC_STEPS.length - 1 ? new Date().toISOString() : null
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving session:", error);
    }
    setSaving(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSessionData({
      disagreement: "",
      initial_feeling: "",
      intensity: 5,
      observations: "",
      feelings: "",
      needs: "",
      requests: "",
      reflection: ""
    });
  };

  const step = NVC_STEPS[currentStep];
  const fieldValue = sessionData[step.field] || "";

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Cool Down</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Step {currentStep + 1} of {NVC_STEPS.length}</p>
            {saved && <Badge className="bg-chart-2 text-white rounded-full gap-1"><CheckCircle2 className="w-3 h-3" /> Saved</Badge>}
          </div>
          <div className="flex gap-1">
            {NVC_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all flex-1 ${
                  i <= currentStep ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h2 className="font-heading text-2xl font-bold mb-2">{step.title}</h2>
            <p className="text-muted-foreground">{step.description}</p>
          </div>

          {/* Content based on step */}
          <div className="space-y-4">
            {step.step === 0 && (
              <>
                <p className="text-sm text-muted-foreground">{step.prompt}</p>
                <Textarea
                  placeholder="Describe what happened..."
                  value={sessionData.disagreement}
                  onChange={(e) => setSessionData({ ...sessionData, disagreement: e.target.value })}
                  className="min-h-32"
                />

                {/* Intensity slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">How intense are your feelings?</label>
                    <span className="text-lg font-bold text-primary">{sessionData.intensity}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sessionData.intensity}
                    onChange={(e) => setSessionData({ ...sessionData, intensity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Mild</span>
                    <span>Intense</span>
                  </div>
                </div>

                {/* Initial feeling picker */}
                <div>
                  <p className="text-sm font-medium mb-3">What's your primary feeling?</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FEELINGS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setSessionData({ ...sessionData, initial_feeling: f.value })}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          sessionData.initial_feeling === f.value
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <p className="text-2xl mb-1">{f.emoji}</p>
                        <p className="text-xs font-medium">{f.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step.step === 1 && (
              <>
                <p className="text-sm text-muted-foreground">{step.prompt}</p>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                  <p className="text-sm font-medium mb-2">You selected: <span className="text-primary">{sessionData.initial_feeling}</span></p>
                  <p className="text-xs text-muted-foreground">Now, dig deeper. What other emotions are present? Name them all.</p>
                </div>
                <Textarea
                  placeholder="I feel... (e.g., hurt, unheard, undervalued, misunderstood)"
                  value={sessionData.feelings}
                  onChange={(e) => setSessionData({ ...sessionData, feelings: e.target.value })}
                  className="min-h-24"
                />
              </>
            )}

            {step.step === 2 && (
              <>
                <p className="text-sm text-muted-foreground">{step.prompt}</p>
                <div className="p-4 rounded-xl bg-accent/40 border border-accent">
                  <p className="text-xs text-accent-foreground mb-2 font-medium">Common underlying needs:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-accent-foreground">
                    <div>• Connection</div>
                    <div>• Respect</div>
                    <div>• Trust</div>
                    <div>• Autonomy</div>
                    <div>• Understanding</div>
                    <div>• Safety</div>
                    <div>• Appreciation</div>
                    <div>• Honesty</div>
                  </div>
                </div>
                <Textarea
                  placeholder="What need or value is unmet? (e.g., I need to feel respected, I need honesty in our relationship)"
                  value={sessionData.needs}
                  onChange={(e) => setSessionData({ ...sessionData, needs: e.target.value })}
                  className="min-h-24"
                />
              </>
            )}

            {step.step === 3 && (
              <>
                <p className="text-sm text-muted-foreground">{step.prompt}</p>
                <div className="p-4 rounded-xl bg-chart-2/10 border border-chart-2/20">
                  <p className="text-xs text-chart-2 mb-2 font-medium">Make a clear, doable request:</p>
                  <p className="text-xs text-muted-foreground">"I'd like you to..." or "Could we...?"</p>
                </div>
                <Textarea
                  placeholder="What specific action would help? Be clear and achievable."
                  value={sessionData.requests}
                  onChange={(e) => setSessionData({ ...sessionData, requests: e.target.value })}
                  className="min-h-24"
                />
              </>
            )}

            {step.step === 4 && (
              <>
                <p className="text-sm text-muted-foreground">{step.prompt}</p>
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-primary mb-1">You've identified:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• <strong>Feeling:</strong> {sessionData.feelings || "..."}</li>
                      <li>• <strong>Need:</strong> {sessionData.needs || "..."}</li>
                      <li>• <strong>Request:</strong> {sessionData.requests || "..."}</li>
                    </ul>
                  </div>
                  <p className="text-xs text-primary font-medium">Now breathe. Both of you are worthy of having your needs met.</p>
                </div>
                <Textarea
                  placeholder="What did you learn? How can you both move forward?"
                  value={sessionData.reflection}
                  onChange={(e) => setSessionData({ ...sessionData, reflection: e.target.value })}
                  className="min-h-24"
                />
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="rounded-full"
            >
              Back
            </Button>

            {currentStep < NVC_STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                className="flex-1 rounded-full gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSaveSession}
                disabled={saving}
                className="flex-1 rounded-full gap-2 bg-chart-2 hover:bg-chart-2/90"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {saving ? "Saving…" : "Complete & Save"}
              </Button>
            )}
          </div>

          {currentStep === NVC_STEPS.length - 1 && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="w-full rounded-full text-muted-foreground hover:text-foreground gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Start New Session
            </Button>
          )}
        </motion.div>

        {/* Footer note */}
        <div className="mt-12 p-4 rounded-xl bg-muted/30 border border-border/40 text-center">
          <p className="text-xs text-muted-foreground">
            This Cool Down process is based on <strong>Non-Violent Communication (NVC)</strong> principles to help you communicate with empathy and clarity.
          </p>
        </div>
      </div>
    </div>
  );
}