import type { ArchitectureNodeType } from "./types";

/** Component ids in Learn/Build modes are the shared catalog type ids. */
export type ComponentId = ArchitectureNodeType;

export type ArchitectureMode = "learn" | "build";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type LearningScenario = {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  /** Core system-design concepts this scenario teaches. */
  concepts: string[];
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  /** Components an interviewer would expect to see at all. */
  expectedComponentIds: ComponentId[];
  /** Missing any of these is a serious gap (drives critical findings). */
  criticalComponentIds: ComponentId[];
  /** Nice-to-have / senior-signal components. */
  recommendedComponentIds: ComponentId[];
  commonPitfalls: string[];
  stretchGoals: string[];
  referenceArchitectureId: string;
  isReadHeavy?: boolean;
  isUserSpecific?: boolean;
  hasPublicApi?: boolean;
  hasFileUploads?: boolean;
  hasPayments?: boolean;
  hasNotifications?: boolean;
  isRealtime?: boolean;
};

export type CourseModule = {
  id: string;
  title: string;
  description: string;
  relatedComponentIds: ComponentId[];
  keyIdeas: string[];
  commonMistakes: string[];
  miniChallenge?: string;
};

export type ReferenceArchitecture = {
  id: string;
  scenarioId: string;
  title: string;
  componentIds: ComponentId[];
  explanation: string;
  keyFlows: string[];
  tradeoffs: string[];
  interviewerFollowUps: string[];
};

export type ReviewCategory =
  | "Scalability"
  | "Reliability"
  | "Security"
  | "Data Modeling"
  | "Observability"
  | "Failure Handling"
  | "Cost Awareness"
  | "Maintainability"
  | "Product Fit";

export type ReviewSeverity = "critical" | "warning" | "suggestion" | "strength";

export type ReviewItem = {
  id: string;
  type: ReviewSeverity;
  category: ReviewCategory;
  title: string;
  message: string;
  suggestedComponentIds: ComponentId[];
  whyItMatters: string;
  /** Surfaced in Learn Mode. */
  interviewTip?: string;
  /** Surfaced in Build Mode. */
  buildTip?: string;
};

export const REVIEW_CATEGORIES: ReviewCategory[] = [
  "Product Fit",
  "Scalability",
  "Reliability",
  "Failure Handling",
  "Security",
  "Data Modeling",
  "Observability",
  "Cost Awareness",
  "Maintainability",
];

export type ArchitectureScore = {
  overall: number;
  readinessLabel: string;
  summary: string;
  categories: Record<ReviewCategory, number>;
};

export type CoachTip = {
  id: string;
  title: string;
  message: string;
  severity?: "tip" | "warning" | "praise";
  suggestedComponentIds?: ComponentId[];
};

/** Output of the deterministic explanation / spec generator. */
export type GeneratedDoc = {
  title: string;
  sections: { heading: string; body: string[] }[];
};
