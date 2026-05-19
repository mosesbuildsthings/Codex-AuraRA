import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusMessages = [
  { text: "Aura is now anonymizing all your data to protect your privacy...", duration: 3000 },
  { text: "Analyzing emotional sentiment and tone in your narrative...", duration: 4000 },
  { text: "Identifying key communication patterns...", duration: 4000 },
  { text: "Evaluating relationship dynamics and contextual factors...", duration: 3500 },
  { text: "Detecting potential areas of concern...", duration: 3000 },
  { text: "Synthesizing insights across all data sources...", duration: 3500 },
  { text: "Crafting your personalized report with care...", duration: 4000 }
];

export default function Analyzing() {
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);

  const caseId = window.location.pathname.split("/").pop();

  // Animate through status messages
  useEffect(() => {
    let totalDuration = 0;
    const timers = statusMessages.map((msg, i) => {
      const timer = setTimeout(() => setCurrentMessage(i), totalDuration);
      totalDuration += msg.duration;
      return timer;
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // Progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 0.4, 95));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const [error, setError] = useState(null);
  const analysisStarted = useRef(false);

  useEffect(() => {
    if (analysisStarted.current) return;
    analysisStarted.current = true;

    const runAnalysis = async () => {
      const analysisCase = await base44.entities.AnalysisCase.filter({ id: caseId });
      const thisCase = analysisCase[0];
      if (!thisCase) { setError("Case not found."); return; }

      await base44.entities.AnalysisCase.update(caseId, { status: "analyzing" });

      // Build analysis context
      const contextParts = [];
      if (thisCase.relationship_status) contextParts.push(`Relationship Status: ${thisCase.relationship_status}`);
      if (thisCase.user_age && thisCase.partner_age) {
        contextParts.push(`Ages: User ${thisCase.user_age}, Partner ${thisCase.partner_age} (gap: ${Math.abs(thisCase.user_age - thisCase.partner_age)} years)`);
      }
      if (thisCase.primary_challenges?.length) contextParts.push(`Primary Challenges: ${thisCase.primary_challenges.join(", ")}`);
      if (thisCase.has_children) {
        contextParts.push(`Children involved: ${thisCase.children_context || "yes"}`);
        if (thisCase.is_coparenting) contextParts.push("Currently co-parenting with an ex-partner");
      }

      const adviceType = thisCase.advice_type || "both";

      const fatherlyInstructions = adviceType !== "motherly" ? `
FATHERLY ADVICE (for the "advice" field):
Write 3-5 paragraphs of direct, empathetic, actionable advice in the voice of a wise, experienced father figure — warm, direct, grounded in reality, non-judgmental. He has seen relationships succeed and fail and speaks from lived wisdom.` : "";

      const motherlyInstructions = adviceType !== "fatherly" ? `
MOTHERLY ADVICE (for the "motherly_advice" field):
Write 3-5 paragraphs of warm, nurturing, biblically-grounded advice in the voice of a mature Christian woman who married young and has been faithfully married for decades. She has three grown sons and a daughter, is deeply rooted in faith, and speaks from the heart with grace and wisdom. Her advice is gentle yet strong, full of compassion and spiritual grounding. She quotes scripture naturally and encourages without condoning harmful behavior.` : "";

      const prompt = `You are "Aura", a deeply empathetic, wise, and research-grounded relationship advisor.

Analyze this relationship situation and produce a comprehensive structured JSON report. ALL text fields MUST be filled with substantial content (at least 2-3 paragraphs each). Do NOT leave any field empty or as a placeholder.

USER'S NARRATIVE:
${thisCase.narrative}

CONTEXTUAL FACTORS:
${contextParts.join("\n") || "Not specified"}

USER'S CORE QUESTION:
${thisCase.core_question}

IMPORTANT INSTRUCTIONS:
- Be empathetic, non-judgmental, and grounded in psychological research
- Address the user's specific core question directly in every relevant section
- Fill EVERY field with meaningful, detailed content
- If there are signs of concerning behavior (controlling, manipulation, emotional unavailability), note them carefully and compassionately
- If you detect any crisis-level concerns (self-harm, abuse, danger), set risk_level to "crisis"
- Ground advice in attachment theory, communication psychology, and relationship science
- summary: Write 2-3 substantial paragraphs paraphrasing their situation to show you truly understand
- communication_analysis: Write 2-3 paragraphs analyzing their communication patterns in detail
- key_dynamics: Write 2-3 paragraphs covering the key relationship dynamics
- resources: Write 1-2 encouraging closing paragraphs with a disclaimer
${fatherlyInstructions}
${motherlyInstructions}`;

      const fullPrompt = prompt + `

Return a JSON object with ALL of these fields populated with substantial content:
- title: A compassionate title for this report
- summary: 2-3 paragraphs paraphrasing their situation to show deep understanding
- emotional_landscape: object with positive/negative/neutral (0-100) and dominant_emotions array
- communication_analysis: 2-3 paragraphs analyzing communication patterns
- attachment_styles: object with user_style, partner_style, and explanation
- key_dynamics: 2-3 paragraphs on key relationship dynamics
- red_flags: array of concern strings (can be empty)
- advice: ${adviceType !== "motherly" ? "3-5 paragraphs of direct, empathetic fatherly wisdom" : "leave as empty string"}
- motherly_advice: ${adviceType !== "fatherly" ? "3-5 paragraphs of warm, nurturing, biblically-grounded motherly wisdom" : "leave as empty string"}
- resources: 1-2 paragraphs of encouraging closing thoughts with disclaimer
- risk_level: one of low, moderate, high, crisis`;

      const rawResult = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            summary: { type: "string" },
            emotional_landscape: {
              type: "object",
              properties: {
                positive: { type: "number" },
                negative: { type: "number" },
                neutral: { type: "number" },
                dominant_emotions: { type: "array", items: { type: "string" } }
              }
            },
            communication_analysis: { type: "string" },
            attachment_styles: {
              type: "object",
              properties: {
                user_style: { type: "string" },
                partner_style: { type: "string" },
                explanation: { type: "string" }
              }
            },
            key_dynamics: { type: "string" },
            red_flags: { type: "array", items: { type: "string" } },
            advice: { type: "string" },
            motherly_advice: { type: "string" },
            resources: { type: "string" },
            risk_level: { type: "string" }
          }
        }
      });

      // If response_json_schema returns a string instead of object, parse it
      const result = typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;

      // Validate result has content
      if (!result || typeof result !== "object") {
        throw new Error("Invalid response from AI — got: " + JSON.stringify(rawResult).substring(0, 200));
      }
      if (!result.summary || !result.communication_analysis || !result.key_dynamics) {
        throw new Error("AI returned incomplete report fields. Please try again.");
      }
      if (adviceType !== "motherly" && !result.advice) {
        throw new Error("AI did not return fatherly advice. Please try again.");
      }
      if (adviceType !== "fatherly" && !result.motherly_advice) {
        throw new Error("AI did not return motherly advice. Please try again.");
      }

      // Save report — only include advice fields that were requested
      const reportData = {
        case_id: caseId,
        advice_type: adviceType,
        title: result.title || "Relationship Analysis Report",
        summary: result.summary || "",
        communication_analysis: result.communication_analysis || "",
        key_dynamics: result.key_dynamics || "",
        red_flags: result.red_flags || [],
        advice: adviceType !== "motherly" ? (result.advice || "") : "",
        motherly_advice: adviceType !== "fatherly" ? (result.motherly_advice || "") : "",
        resources: result.resources || "",
        risk_level: result.risk_level || "low",
        emotional_landscape: result.emotional_landscape || null,
        attachment_styles: result.attachment_styles || null,
      };

      await base44.entities.Report.create(reportData);

      await base44.entities.AnalysisCase.update(caseId, { status: "completed" });
      setProgress(100);

      setTimeout(() => {
        navigate("/report/" + caseId);
      }, 1500);
    };

    runAnalysis().catch(err => {
      console.error("Analysis failed:", err);
      setError(err?.message || "Analysis failed. Please try again.");
      base44.entities.AnalysisCase.update(caseId, { status: "error" }).catch(() => {});
      analysisStarted.current = false;
    });
  }, [caseId, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* Animated icon */}
        <div className="relative w-24 h-24 mx-auto mb-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-2 border-dashed border-accent-foreground/10"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-10 h-10 text-primary" />
            </motion.div>
          </div>
        </div>

        <h2 className="font-heading text-2xl font-bold mb-3">Aura is working</h2>

        {/* Status message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-muted-foreground text-sm mb-8 h-10"
          >
            {statusMessages[currentMessage]?.text}
          </motion.p>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{Math.round(progress)}%</p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 rounded-2xl bg-destructive/10 border border-destructive/20 text-left"
          >
            <p className="text-sm font-semibold text-destructive mb-1">Analysis failed</p>
            <p className="text-xs text-destructive/80 mb-4 leading-relaxed">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setProgress(0);
                setCurrentMessage(0);
                window.location.reload();
              }}
              className="w-full py-2 rounded-xl bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors"
            >
              Retry Analysis
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-2 rounded-xl text-muted-foreground text-xs mt-2 hover:text-foreground transition-colors"
            >
              Go back to Dashboard
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}