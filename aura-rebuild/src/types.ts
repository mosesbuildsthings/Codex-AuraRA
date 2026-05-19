export type PlanTier = "free" | "premium";

export type AdviceVoice = "fatherly" | "motherly" | "both";

export type RelationshipStatus =
  | "single"
  | "never_been_in_relationship"
  | "dating"
  | "engaged"
  | "married"
  | "separated"
  | "complicated";

export type ChallengeKey =
  | "communication"
  | "trust"
  | "intimacy"
  | "conflict"
  | "boundaries"
  | "distance"
  | "parenting"
  | "other";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  startedAt: string;
  expiresAt: string;
}

export interface RelationshipProfile {
  id: string;
  label: string;
  counterpart: string;
  status: RelationshipStatus;
  notes: string;
  createdAt: string;
}

export interface EvidenceItem {
  id: string;
  fileName: string;
  mimeType: string;
  bytes: number;
  ivB64: string;
  cipherB64: string;
  addedAt: string;
}

export interface AnalysisFormInput {
  relationshipId: string;
  title: string;
  narrative: string;
  context: string;
  coreQuestion: string;
  relationshipStatus: RelationshipStatus;
  challenges: ChallengeKey[];
  challengeOtherText: string;
  selectedVoice: AdviceVoice;
  includeFullReport: boolean;
  evidence: EvidenceItem[];
}

export interface ReportSummary {
  id: string;
  relationshipId: string;
  relationshipLabel: string;
  title: string;
  createdAt: string;
  selectedVoice: AdviceVoice;
  riskLevel: "low" | "medium" | "high";
  quickSummary: string[];
  fullReportSections: Array<{ heading: string; body: string }>;
  suggestedActions: string[];
  notes: string;
}

export interface JournalEntry {
  id: string;
  relationshipId: string;
  createdAt: string;
  content: string;
}

export interface FeedbackItem {
  id: string;
  createdAt: string;
  message: string;
}

export interface PersonalityProfile {
  birthday: string;
  mbtiType: string;
  enneagramType: string;
}

export interface AppData {
  plan: PlanTier;
  session: UserSession | null;
  relationships: RelationshipProfile[];
  activeRelationshipId: string;
  reports: ReportSummary[];
  journal: JournalEntry[];
  feedback: FeedbackItem[];
  profile: PersonalityProfile;
}

