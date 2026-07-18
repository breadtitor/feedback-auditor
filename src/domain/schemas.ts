import { z } from "zod";

export const rubricLevelSchema = z.object({
  label: z.string(),
  minPoints: z.number(),
  maxPoints: z.number(),
  description: z.string(),
});

export const rubricDimensionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  maxPoints: z.number().positive(),
  levels: z.array(rubricLevelSchema).optional(),
});

export const submissionSchema = z.object({
  id: z.string(),
  pseudonym: z.string(),
  text: z.string(),
  scores: z.record(z.string(), z.number()),
  teacherFeedback: z.string(),
});

export const evidenceSignalSchema = z.object({
  id: z.string(),
  submissionId: z.string(),
  rubricDimensionId: z.string(),
  kind: z.enum(["strength", "issue", "unclear"]),
  canonicalTag: z.string(),
  severity: z.enum(["minor", "moderate", "major", "unclear"]),
  excerpt: z.string(),
  explanation: z.string(),
  confidence: z.number().min(0).max(1),
  source: z.enum(["model", "fixture"]),
});

export const feedbackCoverageSchema = z.object({
  submissionId: z.string(),
  rubricDimensionId: z.string(),
  addressedTags: z.array(z.string()),
  stance: z.enum(["positive", "corrective", "mixed", "neutral", "unclear"]),
  hasActionableNextStep: z.boolean(),
});

export const analysisSubmissionSchema = z.object({
  submissionId: z.string(),
  signals: z.array(evidenceSignalSchema.omit({ source: true })),
  feedbackCoverage: z.array(feedbackCoverageSchema),
});

export const analysisResponseSchema = z.object({
  schemaVersion: z.literal("1.0"),
  promptVersion: z.literal("1.0"),
  analyses: z.array(analysisSubmissionSchema),
});

export const auditProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  gradeBand: z.string(),
  assignmentPrompt: z.string(),
  learningObjectives: z.array(z.string()),
  rubric: z.array(rubricDimensionSchema),
  submissions: z.array(submissionSchema),
  signals: z.array(evidenceSignalSchema),
  feedbackCoverage: z.array(feedbackCoverageSchema),
  datasetLabel: z.string(),
  synthetic: z.boolean(),
});

export const findingTypeSchema = z.enum([
  "SIMILAR_EVIDENCE_SCORE_GAP",
  "SIMILAR_ISSUE_FEEDBACK_OMISSION",
  "SCORE_FEEDBACK_MISMATCH",
  "RUBRIC_DIMENSION_NOT_ADDRESSED",
  "FEEDBACK_WITHOUT_LOCATABLE_EVIDENCE",
]);

export const findingStatusSchema = z.enum([
  "open",
  "confirmed",
  "dismissed",
  "resolved",
]);

export const auditFindingSchema = z.object({
  id: z.string(),
  type: findingTypeSchema,
  severity: z.enum(["low", "medium", "high"]),
  rubricDimensionId: z.string(),
  submissionIds: z.array(z.string()),
  evidenceSignalIds: z.array(z.string()),
  title: z.string(),
  summary: z.string(),
  reviewQuestion: z.string(),
  ruleId: z.string(),
  ruleVersion: z.literal("1.0"),
  status: findingStatusSchema,
  teacherNote: z.string().optional(),
});

export type RubricDimension = z.infer<typeof rubricDimensionSchema>;
export type Submission = z.infer<typeof submissionSchema>;
export type EvidenceSignal = z.infer<typeof evidenceSignalSchema>;
export type FeedbackCoverage = z.infer<typeof feedbackCoverageSchema>;
export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
export type AuditProject = z.infer<typeof auditProjectSchema>;
export type AuditFinding = z.infer<typeof auditFindingSchema>;
export type FindingType = z.infer<typeof findingTypeSchema>;
export type FindingStatus = z.infer<typeof findingStatusSchema>;

export const findingTypeLabels: Record<FindingType, string> = {
  SIMILAR_EVIDENCE_SCORE_GAP: "Similar evidence, different scores",
  SIMILAR_ISSUE_FEEDBACK_OMISSION: "Similar issue, uneven feedback coverage",
  SCORE_FEEDBACK_MISMATCH: "Score and feedback may conflict",
  RUBRIC_DIMENSION_NOT_ADDRESSED: "Rubric dimension not addressed",
  FEEDBACK_WITHOUT_LOCATABLE_EVIDENCE: "Feedback lacks locatable evidence",
};

export const severityLabels = {
  high: "High priority",
  medium: "Review",
  low: "Low priority",
} as const;
