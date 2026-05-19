import type { ChallengeKey, RelationshipStatus } from "../types";

export const SESSION_MINUTES = 30;
export const PREMIUM_PRICE = 15;

export const relationshipStatuses: Array<{ value: RelationshipStatus; label: string }> = [
  { value: "single", label: "Single" },
  { value: "never_been_in_relationship", label: "Never Been In A Relationship" },
  { value: "dating", label: "Dating" },
  { value: "engaged", label: "Engaged" },
  { value: "married", label: "Married" },
  { value: "separated", label: "Separated" },
  { value: "complicated", label: "Complicated" },
];

export const challengeOptions: Array<{ key: ChallengeKey; label: string }> = [
  { key: "communication", label: "Communication" },
  { key: "trust", label: "Trust" },
  { key: "intimacy", label: "Intimacy" },
  { key: "conflict", label: "Conflict" },
  { key: "boundaries", label: "Boundaries" },
  { key: "distance", label: "Long Distance" },
  { key: "parenting", label: "Parenting / Family Dynamics" },
  { key: "other", label: "Other" },
];

export const premiumFeatures = [
  "Download full PDF report",
  "Share reports through WhatsApp, text, and email",
  "Fatherly + Motherly dual-voice advice",
  "Partner connection + shared insights",
  "Custom action plans and micro-exercises",
  "Custom weekly challenges and quizzes",
  "MBTI + Enneagram compatibility insights",
  "Deep report chapters and trend tracking",
];

export const futureAdviceTypes = [
  "Relationship Advice",
  "Financial Advice",
  "Career Advice",
  "Health Advice",
  "Mental Wellness Advice",
  "Productivity Advice",
  "Legal Advice",
  "Entrepreneur",
  "Business Strategy Advice",
  "Startup Fundraising Advice",
  "Marketing Advice",
  "Sales Advice",
  "Technology Advice",
  "Cybersecurity Advice",
  "Developer / Programming Advice",
  "UI / UX Advice",
  "Teacher",
  "Student Advice",
  "Life Coaching",
  "Spiritual Advice",
  "Fitness Advice",
  "Nutrition Advice",
  "Parenting Advice",
  "Travel Advice",
  "Fashion / Style Advice",
  "Home / Living Advice",
];

