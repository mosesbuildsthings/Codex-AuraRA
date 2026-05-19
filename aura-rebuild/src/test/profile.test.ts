import { describe, expect, it } from "vitest";
import { mbtiFromAnswers, zodiacFromBirthday } from "../lib/profile";

describe("profile utilities", () => {
  it("detects Virgo from 1993-09-05", () => {
    expect(zodiacFromBirthday("1993-09-05")).toBe("Virgo");
  });

  it("maps mbti answers", () => {
    expect(mbtiFromAnswers(["a", "a", "a", "a"])).toBe("ENTJ");
    expect(mbtiFromAnswers(["b", "b", "b", "b"])).toBe("ISFP");
  });
});

