import { describe, expect, it } from "vitest";
import { buildReport, deriveAutofill } from "../lib/analysisEngine";
import type { AnalysisFormInput } from "../types";

function makeInput(): AnalysisFormInput {
  return {
    relationshipId: "rel-1",
    title: "Test Report",
    narrative: "We keep arguing over texting rhythm and trust after a recent lie.",
    context: "Communication has become inconsistent.",
    coreQuestion: "How do we rebuild trust?",
    relationshipStatus: "dating",
    challenges: ["communication", "trust"],
    challengeOtherText: "",
    selectedVoice: "both",
    includeFullReport: false,
    evidence: [],
  };
}

describe("deriveAutofill", () => {
  it("detects communication and trust patterns", () => {
    const result = deriveAutofill("We argue by text and there are trust issues after being lied to");
    expect(result.challenges).toContain("communication");
    expect(result.challenges).toContain("trust");
    expect(result.coreQuestion.length).toBeGreaterThan(10);
  });
});

describe("buildReport", () => {
  it("gates both voices for free plan", () => {
    const report = buildReport(makeInput(), "Primary", "free", {
      birthday: "",
      mbtiType: "",
      enneagramType: "",
    });

    const adviceSection = report.fullReportSections.find((section) => section.heading === "Advice Voice");
    expect(adviceSection?.body).toContain("Premium");
  });

  it("returns both voices for premium plan", () => {
    const report = buildReport(makeInput(), "Primary", "premium", {
      birthday: "",
      mbtiType: "ENTJ",
      enneagramType: "Type 8 - Challenger",
    });

    const adviceSection = report.fullReportSections.find((section) => section.heading === "Advice Voice");
    expect(adviceSection?.body).toContain("Fatherly Advice");
    expect(adviceSection?.body).toContain("Motherly Advice");
  });
});

