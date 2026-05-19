import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles, Shield, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const privacyCommitments = [
  "Your privacy is our highest priority.",
  "We do not sell your personal data to third parties.",
  "All personal details in your narratives and uploaded media are automatically anonymized before analysis.",
  "You have the right to permanently delete your account and all associated data at any time."
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [consents, setConsents] = useState({
    narrative: false,
    screenshots: false,
    media: false
  });

  const canProceed = consents.narrative;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                  Welcome to Aura
                </h1>
                <p className="text-lg text-muted-foreground mb-3">
                  Your confidential relationship advisor.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-10 max-w-md mx-auto">
                  Aura is a private, secure space to reflect on your relationship and receive 
                  thoughtful, AI-powered guidance. Think of this as a consultation — not a form.
                </p>
                <Button
                  size="lg"
                  className="rounded-full px-10 gap-2"
                  onClick={() => setStep(1)}
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2">
                  Your Privacy Commitments
                </h2>
                <p className="text-muted-foreground mb-8">
                  Before we begin, here's what we promise:
                </p>

                <div className="space-y-4 mb-10">
                  {privacyCommitments.map((commitment, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/60">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm leading-relaxed">{commitment}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="rounded-full px-6"
                    onClick={() => setStep(0)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    className="rounded-full px-8 flex-1 gap-2"
                    onClick={() => setStep(2)}
                  >
                    I Understand <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="consent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2">
                  Your Consent
                </h2>
                <p className="text-muted-foreground mb-8">
                  Choose what you'd like Aura to analyze. You're in control.
                </p>

                <div className="space-y-4 mb-10">
                  <div className="flex items-start justify-between gap-4 p-5 rounded-xl bg-card border border-border/60">
                    <div>
                      <Label className="font-medium text-base">Narrative Analysis</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        I consent to the analysis of my written narrative and contextual information.
                      </p>
                    </div>
                    <Switch
                      checked={consents.narrative}
                      onCheckedChange={(v) => setConsents({ ...consents, narrative: v })}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 p-5 rounded-xl bg-card border border-border/60">
                    <div>
                      <Label className="font-medium text-base">Screenshot Analysis</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        I consent to the analysis of uploaded text message screenshots. 
                        All names and personal identifiers will be automatically redacted.
                      </p>
                    </div>
                    <Switch
                      checked={consents.screenshots}
                      onCheckedChange={(v) => setConsents({ ...consents, screenshots: v })}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 p-5 rounded-xl bg-card border border-border/60">
                    <div>
                      <Label className="font-medium text-base">Photo & Video Analysis</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        I consent to the analysis of uploaded photos and videos. 
                        All faces and identifying features will be automatically blurred.
                      </p>
                    </div>
                    <Switch
                      checked={consents.media}
                      onCheckedChange={(v) => setConsents({ ...consents, media: v })}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="rounded-full px-6"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    className="rounded-full px-8 flex-1 gap-2"
                    disabled={!canProceed}
                    onClick={() => navigate("/new-analysis", { 
                      state: { consents } 
                    })}
                  >
                    Begin Analysis <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>

                {!canProceed && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Please enable at least narrative analysis to continue.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step indicator */}
          <div className="flex justify-center gap-2 mt-10">
            {[0, 1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? "w-8 bg-primary" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer footer */}
      <footer className="py-4 px-6 text-center">
        <p className="text-xs text-muted-foreground max-w-xl mx-auto">
          Aura is an AI-powered informational tool. It is not a licensed therapist or legal professional. 
          Advice is for self-reflection purposes only and is not a substitute for professional counsel.
        </p>
      </footer>
    </div>
  );
}