import type { AuditProject } from "@/domain/schemas";

export const ANALYSIS_SCHEMA_VERSION = "1.0";
export const ANALYSIS_PROMPT_VERSION = "1.0";

export function buildAnalysisPrompt(project: AuditProject) {
  const safeProject = {
    title: project.title,
    subject: project.subject,
    gradeBand: project.gradeBand,
    assignmentPrompt: project.assignmentPrompt,
    learningObjectives: project.learningObjectives,
    rubric: project.rubric,
    submissions: project.submissions,
  };

  return [
    "Outcome: convert the supplied rubric, anonymous student writing, scores, and existing teacher feedback into evidence-linked structured signals for a teacher calibration tool.",
    "",
    "Boundaries:",
    "- Do not grade, rescore, rank, diagnose, or make fairness judgments.",
    "- Use only the supplied text. Do not infer identity, ability, intent, or protected characteristics.",
    "- Every evidence excerpt must be copied verbatim from its submission.",
    "- Return unclear when the supplied evidence does not support a confident signal.",
    "- Analyze each submission independently. Do not compare students or decide audit findings.",
    "",
    "Signal requirements:",
    "- Return strengths, issues, or unclear signals tied to one rubric dimension.",
    "- Use concise snake_case canonical tags that can be compared deterministically.",
    "- Severity is minor, moderate, major, or unclear; it is not a grade.",
    "- Confidence must reflect evidence quality, not rhetorical certainty.",
    "- For each rubric dimension, identify which canonical tags the existing teacher feedback addresses.",
    "- Mark whether the feedback contains an actionable next step.",
    "- Use stable ids in the form signal-{submissionId}-{dimensionId}-{index}.",
    "",
    `Return schemaVersion ${ANALYSIS_SCHEMA_VERSION} and promptVersion ${ANALYSIS_PROMPT_VERSION}.`,
    "Complete only when every submission has one analysis entry and every evidence excerpt is locatable in the supplied text.",
    "",
    "Input JSON:",
    JSON.stringify(safeProject),
  ].join("\n");
}
