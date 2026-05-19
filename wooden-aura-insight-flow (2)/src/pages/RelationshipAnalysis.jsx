import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import NarrativeModule from "@/components/analysis/NarrativeModule";
import ContextualFactors from "@/components/analysis/ContextualFactors";
import EvidenceLocker from "@/components/analysis/EvidenceLocker";
import CoreQuestion from "@/components/analysis/CoreQuestion";

const steps = ["Narrative", "Context", "Evidence", "Question"];

export default function RelationshipAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const consents = location.state?.consents || { narrative: true, screenshots: false, media: false };

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);

  const [narrative, setNarrative] = useState("");
  const [contextData, setContextData] = useState({});
  const [files, setFiles] = useState([]);
  const [coreQuestions, setCoreQuestions] = useState([""]);
  const [adviceType, setAdviceType] = useState("both");

  const canSubmit = narrative.trim().length > 20 && coreQuestions.some(q => q.trim().length > 5);
  const primaryQuestion = coreQuestions.filter(q => q.trim()).join("\n");

  // Auto-fill context & questions from narrative using AI
  const autoFillFromNarrative = async () => {
    if (narrative.trim().length < 30) return;
    setAutoFilling(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this relationship narrative and extract structured context and questions.

Narrative: "${narrative}"

Extract:
1. relationship_status: one of: dating, engaged, married, separated, long_distance, broken_up (or null)
2. primary_challenges: array of applicable challenges from: ["Communication Breakdown","Infidelity / Trust Issues","Financial Stress","Family / In-Law Conflict","Mismatched Life Goals","Intimacy Issues","Distance / Availability","Co-Parenting Conflicts","Jealousy / Insecurity","Personal Growth Differences"]
3. suggested_questions: array of 2-3 specific questions this person seems to be asking (based on the narrative). Make them personal and direct.
4. user_age: numeric age of the person writing (the narrator/poster). Look for patterns like "I'm 34", "me (32F)", "M39", "34 year old", etc. Return null if not found.
5. partner_age: numeric age of their partner. Look for patterns like "my wife (31)", "F31", "my husband M45", "he's 28", etc. Return null if not found.

Note: Reddit-style age/gender tags are common — e.g. "My M39 wife F31" means the poster is M39 (male, age 39) and partner is F31 (female, age 31). Also "I (34F)" means the narrator is female age 34.`,
      response_json_schema: {
        type: "object",
        properties: {
          relationship_status: { type: "string" },
          primary_challenges: { type: "array", items: { type: "string" } },
          suggested_questions: { type: "array", items: { type: "string" } },
          user_age: { type: "number" },
          partner_age: { type: "number" }
        }
      }
    });

    if (result.relationship_status) {
      setContextData(prev => ({
        ...prev,
        relationship_status: result.relationship_status,
        primary_challenges: result.primary_challenges || prev.primary_challenges || [],
        ...(result.user_age ? { user_age: result.user_age } : {}),
        ...(result.partner_age ? { partner_age: result.partner_age } : {})
      }));
    }
    if (result.suggested_questions?.length > 0) {
      setCoreQuestions(result.suggested_questions);
    }
    setAutoFilling(false);
  };

  const handleNarrativeNext = async () => {
    setStep(1);
    // Trigger auto-fill in background
    autoFillFromNarrative();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const caseData = {
      status: "submitted",
      narrative,
      core_question: primaryQuestion,
      relationship_status: contextData.relationship_status || undefined,
      primary_challenges: contextData.primary_challenges || [],
      user_age: contextData.user_age || undefined,
      partner_age: contextData.partner_age || undefined,
      has_children: contextData.has_children || false,
      children_context: contextData.children_context || undefined,
      is_coparenting: contextData.is_coparenting || false,
      uploaded_files: files,
      advice_type: adviceType,
      consent_narrative: consents.narrative,
      consent_screenshots: consents.screenshots,
      consent_media: consents.media
    };

    const created = await base44.entities.AnalysisCase.create(caseData);
    navigate("/analyzing/" + created.id);
  };

  const handleNext = () => {
    if (step === 0) {
      handleNarrativeNext();
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-lg mx-auto px-6 pb-20">
        {/* Progress */}
        <div className="flex items-center gap-1 mb-10">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => i < step ? setStep(i) : undefined}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                      ? "bg-primary/15 text-primary cursor-pointer"
                      : "bg-muted text-muted-foreground cursor-default"
                }`}
              >
                {s}
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full ${i < step ? "bg-primary/30" : "bg-border"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Auto-filling indicator */}
        {autoFilling && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <p className="text-sm text-primary">Aura is reading your narrative to pre-fill context and questions…</p>
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl border border-border/60 p-6 md:p-8"
          >
            {step === 0 && <NarrativeModule value={narrative} onChange={setNarrative} />}
            {step === 1 && <ContextualFactors data={contextData} onChange={setContextData} autoFilling={autoFilling} />}
            {step === 2 && <EvidenceLocker files={files} onFilesChange={setFiles} />}
            {step === 3 && (
              <>
                <CoreQuestion questions={coreQuestions} onChange={setCoreQuestions} />
                {/* Advice type selector */}
                <div className="mt-6 pt-5 border-t border-border/40">
                  <p className="text-sm font-medium mb-1">Whose advice would you like?</p>
                  <p className="text-xs text-muted-foreground mb-3">Choose the perspective that resonates most with you.</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "fatherly", label: "👨 Fatherly", desc: "Direct & wise" },
                      { value: "motherly", label: "👩 Motherly", desc: "Nurturing & faith-based" },
                      { value: "both", label: "🤝 Both", desc: "Full perspective" }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setAdviceType(opt.value)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          adviceType === opt.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <p className="text-lg mb-1">{opt.label.split(" ")[0]}</p>
                        <p className="text-xs font-medium">{opt.label.split(" ").slice(1).join(" ")}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            className="rounded-full px-6"
            onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 0 ? "Back" : "Previous"}
          </Button>

          {step < steps.length - 1 ? (
            <Button
              className="rounded-full px-6 gap-2"
              onClick={handleNext}
              disabled={step === 0 && narrative.trim().length < 20}
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              className="rounded-full px-8 gap-2"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
            >
              {submitting ? "Submitting…" : "Submit to Aura"}
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}