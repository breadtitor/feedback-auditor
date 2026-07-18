import analysisJson from "../../test-data/community-service-codex-analysis.json";
import submissionsJson from "../../test-data/community-service-audit-samples.json";
import { ingestAnalysisResponse } from "@/domain/analysis-ingest";
import {
  analysisResponseSchema,
  auditProjectSchema,
  type AuditProject,
} from "@/domain/schemas";

const rubric = [
  {
    id: "claim",
    title: "Claim & reasoning",
    description: "Quality of the claim and reasoning.",
    maxPoints: 4,
  },
  {
    id: "evidence",
    title: "Evidence use",
    description: "Selection and explanation of evidence.",
    maxPoints: 4,
  },
  {
    id: "organization",
    title: "Organization",
    description: "Logical sequencing and cohesion.",
    maxPoints: 4,
  },
  {
    id: "clarity",
    title: "Language clarity",
    description: "Clarity and control of language.",
    maxPoints: 4,
  },
];

const baseProject = auditProjectSchema.parse({
  id: "codex-community-service-precomputed-v1",
  title: "Community Service Requirement Calibration",
  subject: "English Language Arts",
  gradeBand: "Grade 10",
  assignmentPrompt:
    "Should high schools require every student to complete 20 hours of community service before graduation? Write an argumentative response using evidence, address a counterargument, and propose an implementation plan.",
  learningObjectives: [
    "State a defensible claim.",
    "Select and explain relevant evidence.",
    "Address a counterargument.",
    "Organize ideas clearly.",
  ],
  rubric,
  submissions: submissionsJson,
  signals: [],
  feedbackCoverage: [],
  datasetLabel: "Fictional community-service pack · GPT-5.6 Codex precomputed · v1",
  synthetic: true,
});

const analysis = analysisResponseSchema.parse(analysisJson);
const ingested = ingestAnalysisResponse(baseProject, analysis, "model");

if (
  ingested.evidenceValidation.accepted !== 32 ||
  ingested.evidenceValidation.rejected !== 0 ||
  ingested.feedbackCoverage.length !== 24
) {
  throw new Error("The versioned Codex sample failed its production evidence gate.");
}

export const communityServicePrecomputedValidation = {
  ...ingested.evidenceValidation,
  feedbackCoverage: ingested.feedbackCoverage.length,
} as const;

export const communityServicePrecomputedProject: AuditProject =
  auditProjectSchema.parse({
    ...baseProject,
    signals: ingested.signals,
    feedbackCoverage: ingested.feedbackCoverage,
  });
