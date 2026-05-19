import { challengeOptions } from "../data/constants";
import type {
  AdviceVoice,
  AnalysisFormInput,
  ChallengeKey,
  PersonalityProfile,
  PlanTier,
  ReportSummary,
} from "../types";

const challengeKeywords: Record<ChallengeKey, string[]> = {
  communication: ["talk", "text", "argument", "miscommunication", "silent", "ghost"],
  trust: ["trust", "cheat", "lied", "dishonest", "betray"],
  intimacy: ["intimacy", "affection", "connection", "romance"],
  conflict: ["fight", "conflict", "angry", "tension", "blame"],
  boundaries: ["boundary", "respect", "privacy", "space", "control"],
  distance: ["distance", "long distance", "apart", "travel"],
  parenting: ["kids", "children", "co-parent", "family", "parenting"],
  other: [],
};

const highRiskWords = ["abuse", "harm", "threat", "violence", "unsafe"];
const mediumRiskWords = ["cheat", "betray", "lying", "constant fight", "ghost", "ignored"];

function containsAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase();
  return needles.some((needle) => lower.includes(needle));
}

export function deriveAutofill(narrative: string): {
  context: string;
  coreQuestion: string;
  challenges: ChallengeKey[];
} {
  const cleanNarrative = narrative.trim();
  if (!cleanNarrative) {
    return {
      context: "Share your story and Aura will suggest context automatically.",
      coreQuestion: "What is the healthiest next step for this relationship?",
      challenges: ["communication"],
    };
  }

  const detected: ChallengeKey[] = [];
  for (const [key, keywords] of Object.entries(challengeKeywords) as Array<[ChallengeKey, string[]]>) {
    if (key === "other") continue;
    if (containsAny(cleanNarrative, keywords)) {
      detected.push(key);
    }
  }

  const challenges: ChallengeKey[] = detected.length ? detected : ["communication", "conflict"];

  const contextualHints: string[] = [];
  if (containsAny(cleanNarrative, ["kids", "children", "co-parent"])) {
    contextualHints.push("Family and co-parenting pressure is influencing emotional bandwidth.");
  }
  if (containsAny(cleanNarrative, ["text", "call", "reply", "response"])) {
    contextualHints.push("Communication rhythm appears to be a major concern.");
  }
  if (containsAny(cleanNarrative, ["trust", "lied", "cheat", "betray"])) {
    contextualHints.push("Trust repair and consistency are central to this situation.");
  }
  if (containsAny(cleanNarrative, ["future", "marriage", "commit", "long term"])) {
    contextualHints.push("Long-term alignment and commitment expectations need clarification.");
  }

  if (!contextualHints.length) {
    contextualHints.push("There is emotional complexity and mixed signals that require structure and boundaries.");
  }

  const question = containsAny(cleanNarrative, ["should I stay", "should I leave", "worth it"])
    ? "Should I continue investing in this relationship, and under what conditions?"
    : "What is the most strategic and emotionally healthy next move for this relationship?";

  return {
    context: contextualHints.join(" "),
    coreQuestion: question,
    challenges,
  };
}

function fatherlyAdvice(riskLevel: "low" | "medium" | "high"): string {
  if (riskLevel === "high") {
    return "Set immediate non-negotiables. Protect your safety, reduce emotional exposure, and involve professional support before trying to fix the relationship dynamic.";
  }
  if (riskLevel === "medium") {
    return "Lead with clarity. Define your standards, communicate once with precision, and judge progress by consistent actions instead of promises.";
  }
  return "Stay steady and intentional. Keep communication respectful, set weekly check-ins, and build trust through follow-through on small commitments.";
}

function motherlyAdvice(riskLevel: "low" | "medium" | "high"): string {
  if (riskLevel === "high") {
    return "Give yourself permission to step back. Peace is not selfish, and safety is a priority. Choose boundaries that protect your heart and mental health.";
  }
  if (riskLevel === "medium") {
    return "Stay kind, but do not shrink your needs. Healthy love can hold accountability and tenderness at the same time.";
  }
  return "Nurture the good patterns while they are small. Appreciation, patience, and honesty can compound into deeper emotional safety over time.";
}

function challengeAction(challenge: ChallengeKey): string {
  const label = challengeOptions.find((item) => item.key === challenge)?.label ?? challenge;
  const map: Record<ChallengeKey, string> = {
    communication: "Use a 20-minute weekly clarity conversation with one speaker and one listener role.",
    trust: "Create a trust rebuild plan with measurable commitments and weekly transparency checkpoints.",
    intimacy: "Schedule two intentional connection rituals per week with no screens and no multitasking.",
    conflict: "Apply a conflict timeout rule: pause for 30 minutes when escalation starts, then resume calmly.",
    boundaries: "Define three explicit boundaries and the consequence for repeated violations.",
    distance: "Set predictable communication windows and one shared weekly activity despite distance.",
    parenting: "Align household expectations in writing and review them weekly as a team.",
    other: "Define the custom challenge in one sentence and pick one practical action for this week.",
  };

  return `${label}: ${map[challenge]}`;
}

function computeRisk(input: AnalysisFormInput): "low" | "medium" | "high" {
  const combined = `${input.narrative} ${input.context} ${input.coreQuestion}`.toLowerCase();
  if (containsAny(combined, highRiskWords)) return "high";
  if (containsAny(combined, mediumRiskWords) || input.challenges.includes("trust") || input.challenges.includes("conflict")) {
    return "medium";
  }
  return "low";
}

function voiceSection(voice: AdviceVoice, risk: "low" | "medium" | "high", plan: PlanTier): string[] {
  if (voice === "both" && plan === "free") {
    return ["Dual voice advice is available in Aura Premium. Upgrade to unlock Fatherly + Motherly insights in one report."];
  }

  if (voice === "fatherly") {
    return [`Fatherly Advice: ${fatherlyAdvice(risk)}`];
  }

  if (voice === "motherly") {
    return [`Motherly Advice: ${motherlyAdvice(risk)}`];
  }

  return [`Fatherly Advice: ${fatherlyAdvice(risk)}`, `Motherly Advice: ${motherlyAdvice(risk)}`];
}

export function buildReport(
  input: AnalysisFormInput,
  relationshipLabel: string,
  plan: PlanTier,
  profile: PersonalityProfile,
): ReportSummary {
  const risk = computeRisk(input);
  const coreChallenges: ChallengeKey[] = input.challenges.length ? [...input.challenges] : ["communication"];
  const keyActions = coreChallenges.map(challengeAction);
  const createdAt = new Date().toISOString();

  const personalityLine = [profile.mbtiType, profile.enneagramType]
    .filter(Boolean)
    .join(" / ");

  const quickSummary = [
    `Risk level: ${risk.toUpperCase()}`,
    `Primary pressure points: ${coreChallenges.join(", ")}${input.challengeOtherText ? ` + ${input.challengeOtherText}` : ""}.`,
    `Core question: ${input.coreQuestion}`,
    `Immediate priority: establish clear boundaries and consistent communication cadence.`,
  ];

  const sections = [
    {
      heading: "Your Situation At A Glance",
      body: `${input.narrative.slice(0, 900)}${input.narrative.length > 900 ? "..." : ""}`,
    },
    {
      heading: "Contextual Factors",
      body: input.context,
    },
    {
      heading: "Emotional Landscape",
      body: `The current pattern indicates ${risk} relational strain with concentration around ${coreChallenges.join(", ")}.`,
    },
    {
      heading: "Communication Deep Dive",
      body: "Focus on response consistency, message clarity, and reducing reactive exchanges. Keep hard conversations structured and time-boxed.",
    },
    {
      heading: "Path Forward",
      body: keyActions.join(" "),
    },
    {
      heading: "Advice Voice",
      body: voiceSection(input.selectedVoice, risk, plan).join(" "),
    },
  ];

  if (personalityLine) {
    sections.push({
      heading: "Communication Style Compatibility",
      body: `Profile indicators (${personalityLine}) suggest using direct language, explicit expectations, and weekly reset conversations.`,
    });
  }

  if (input.evidence.length) {
    sections.push({
      heading: "Evidence Locker Notes",
      body: `${input.evidence.length} encrypted evidence item(s) were stored in your private locker and included as context markers for this report.`,
    });
  }

  sections.push({
    heading: "Safety Note",
    body: "Aura is educational guidance, not legal, medical, or crisis intervention advice. If there is immediate danger, contact local emergency resources.",
  });

  return {
    id: crypto.randomUUID(),
    relationshipId: input.relationshipId,
    relationshipLabel,
    title: input.title || `Relationship Report - ${new Date().toLocaleDateString()}`,
    createdAt,
    selectedVoice: input.selectedVoice,
    riskLevel: risk,
    quickSummary,
    fullReportSections: sections,
    suggestedActions: keyActions,
    notes: "",
  };
}

