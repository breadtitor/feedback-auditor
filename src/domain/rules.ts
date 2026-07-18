import {
  findingTypeLabels,
  type AuditFinding,
  type AuditProject,
  type EvidenceSignal,
  type FeedbackCoverage,
  type FindingType,
  type RubricDimension,
  type Submission,
} from "@/domain/schemas";

const RULE_VERSION = "1.0" as const;
const severityRank = { unclear: 0, minor: 1, moderate: 2, major: 3 } as const;

function stableId(type: FindingType, dimensionId: string, submissionIds: string[]) {
  return ["finding", type.toLowerCase(), dimensionId, ...[...submissionIds].sort()].join("-");
}

function dimensionById(project: AuditProject, id: string): RubricDimension {
  const dimension = project.rubric.find((item) => item.id === id);
  if (!dimension) throw new Error(`Unknown rubric dimension: ${id}`);
  return dimension;
}

function submissionById(project: AuditProject, id: string): Submission {
  const submission = project.submissions.find((item) => item.id === id);
  if (!submission) throw new Error(`Unknown submission: ${id}`);
  return submission;
}

function coverageFor(
  coverage: FeedbackCoverage[],
  submissionId: string,
  dimensionId: string,
) {
  return coverage.find(
    (item) =>
      item.submissionId === submissionId && item.rubricDimensionId === dimensionId,
  );
}

function finding(
  type: FindingType,
  severity: AuditFinding["severity"],
  dimensionId: string,
  submissionIds: string[],
  signalIds: string[],
  summary: string,
  reviewQuestion: string,
  ruleId: string,
): AuditFinding {
  return {
    id: stableId(type, dimensionId, submissionIds),
    type,
    severity,
    rubricDimensionId: dimensionId,
    submissionIds: [...submissionIds].sort(),
    evidenceSignalIds: [...signalIds].sort(),
    title: findingTypeLabels[type],
    summary,
    reviewQuestion,
    ruleId,
    ruleVersion: RULE_VERSION,
    status: "open",
  };
}

function scoreGapFindings(project: AuditProject, signals: EvidenceSignal[]) {
  const findings: AuditFinding[] = [];
  const groups = new Map<string, EvidenceSignal[]>();

  for (const signal of signals.filter(
    (item) => item.kind === "issue" && item.confidence >= 0.72,
  )) {
    const key = `${signal.rubricDimensionId}:${signal.canonicalTag}`;
    groups.set(key, [...(groups.get(key) ?? []), signal]);
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const dimension = dimensionById(project, group[0].rubricDimensionId);
    let bestPair: [EvidenceSignal, EvidenceSignal] | null = null;
    let bestGap = 0;

    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        const left = group[i];
        const right = group[j];
        if (left.submissionId === right.submissionId) continue;
        if (Math.abs(severityRank[left.severity] - severityRank[right.severity]) > 1) continue;
        const leftScore = submissionById(project, left.submissionId).scores[dimension.id];
        const rightScore = submissionById(project, right.submissionId).scores[dimension.id];
        if (leftScore === undefined || rightScore === undefined) continue;
        const gap = Math.abs(leftScore - rightScore);
        if (gap > bestGap) {
          bestGap = gap;
          bestPair = [left, right];
        }
      }
    }

    if (!bestPair || bestGap < dimension.maxPoints * 0.35) continue;
    const [left, right] = bestPair;
    const leftSubmission = submissionById(project, left.submissionId);
    const rightSubmission = submissionById(project, right.submissionId);
    const severity = bestGap >= dimension.maxPoints * 0.5 ? "high" : "medium";
    findings.push(
      finding(
        "SIMILAR_EVIDENCE_SCORE_GAP",
        severity,
        dimension.id,
        [left.submissionId, right.submissionId],
        [left.id, right.id],
        `${leftSubmission.pseudonym} and ${rightSubmission.pseudonym} show the same “${left.canonicalTag.replaceAll("_", " ")}” pattern at similar severity, but their ${dimension.title} scores differ by ${bestGap} point${bestGap === 1 ? "" : "s"}.`,
        "Would the same scoring interpretation apply to both pieces of evidence?",
        "R1",
      ),
    );
  }
  return findings;
}

function feedbackOmissionFindings(
  project: AuditProject,
  signals: EvidenceSignal[],
  coverage: FeedbackCoverage[],
) {
  const findings: AuditFinding[] = [];
  const groups = new Map<string, EvidenceSignal[]>();

  for (const signal of signals.filter(
    (item) =>
      item.kind === "issue" &&
      item.confidence >= 0.72 &&
      severityRank[item.severity] >= severityRank.moderate,
  )) {
    const key = `${signal.rubricDimensionId}:${signal.canonicalTag}`;
    groups.set(key, [...(groups.get(key) ?? []), signal]);
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const addressed = group.find((signal) =>
      coverageFor(coverage, signal.submissionId, signal.rubricDimensionId)?.addressedTags.includes(
        signal.canonicalTag,
      ),
    );
    const omitted = group.find(
      (signal) =>
        signal.submissionId !== addressed?.submissionId &&
        !coverageFor(coverage, signal.submissionId, signal.rubricDimensionId)?.addressedTags.includes(
          signal.canonicalTag,
        ),
    );
    if (!addressed || !omitted) continue;
    const dimension = dimensionById(project, addressed.rubricDimensionId);
    const addressedSubmission = submissionById(project, addressed.submissionId);
    const omittedSubmission = submissionById(project, omitted.submissionId);
    findings.push(
      finding(
        "SIMILAR_ISSUE_FEEDBACK_OMISSION",
        omitted.severity === "major" ? "high" : "medium",
        dimension.id,
        [addressed.submissionId, omitted.submissionId],
        [addressed.id, omitted.id],
        `Feedback for ${addressedSubmission.pseudonym} addresses “${addressed.canonicalTag.replaceAll("_", " ")},” while feedback for ${omittedSubmission.pseudonym} does not, despite similar evidence in ${dimension.title}.`,
        "Should this issue be acknowledged consistently in both feedback records?",
        "R2",
      ),
    );
  }
  return findings;
}

function mismatchFindings(
  project: AuditProject,
  signals: EvidenceSignal[],
  coverage: FeedbackCoverage[],
) {
  const findings: AuditFinding[] = [];

  for (const submission of project.submissions) {
    for (const dimension of project.rubric) {
      const score = submission.scores[dimension.id];
      if (score === undefined) continue;
      const dimensionSignals = signals.filter(
        (item) =>
          item.submissionId === submission.id &&
          item.rubricDimensionId === dimension.id &&
          item.confidence >= 0.78,
      );
      const feedback = coverageFor(coverage, submission.id, dimension.id);
      const highScoreWithMajorIssue =
        score / dimension.maxPoints >= 0.85 &&
        dimensionSignals.some((item) => item.kind === "issue" && item.severity === "major") &&
        (feedback?.stance === "corrective" || feedback?.stance === "mixed");
      const lowScoreWithPositiveFeedback =
        score / dimension.maxPoints <= 0.25 && feedback?.stance === "positive";

      if (!highScoreWithMajorIssue && !lowScoreWithPositiveFeedback) continue;
      findings.push(
        finding(
          "SCORE_FEEDBACK_MISMATCH",
          "high",
          dimension.id,
          [submission.id],
          dimensionSignals.map((item) => item.id),
          `${submission.pseudonym} received ${score}/${dimension.maxPoints} for ${dimension.title}, while the written feedback and cited evidence appear to communicate a different performance level.`,
          "Does the score reflect the same performance level described in the written feedback?",
          "R3",
        ),
      );
    }
  }
  return findings;
}

function uncoveredDimensionFindings(
  project: AuditProject,
  signals: EvidenceSignal[],
  coverage: FeedbackCoverage[],
) {
  const findings: AuditFinding[] = [];

  for (const submission of project.submissions) {
    for (const dimension of project.rubric) {
      if (submission.scores[dimension.id] === undefined) continue;
      const dimensionSignals = signals.filter(
        (item) =>
          item.submissionId === submission.id &&
          item.rubricDimensionId === dimension.id &&
          item.confidence >= 0.72,
      );
      if (dimensionSignals.length === 0) continue;
      const feedback = coverageFor(coverage, submission.id, dimension.id);
      if (feedback && feedback.addressedTags.length > 0) continue;

      findings.push(
        finding(
          "RUBRIC_DIMENSION_NOT_ADDRESSED",
          dimensionSignals.some((item) => item.kind === "issue" && item.severity === "major")
            ? "medium"
            : "low",
          dimension.id,
          [submission.id],
          dimensionSignals.map((item) => item.id),
          `${submission.pseudonym} has a recorded ${dimension.title} score and locatable evidence, but the written feedback does not address this rubric dimension.`,
          "Would one evidence-linked note make this dimension clearer to the learner?",
          "R4",
        ),
      );
    }
  }
  return findings;
}

export function runAudit(project: AuditProject): AuditFinding[] {
  const candidates = [
    ...scoreGapFindings(project, project.signals),
    ...feedbackOmissionFindings(project, project.signals, project.feedbackCoverage),
    ...mismatchFindings(project, project.signals, project.feedbackCoverage),
    ...uncoveredDimensionFindings(project, project.signals, project.feedbackCoverage),
  ];

  const deduplicated = new Map(candidates.map((item) => [item.id, item]));
  const priority = { high: 0, medium: 1, low: 2 } as const;
  return [...deduplicated.values()].sort(
    (left, right) =>
      priority[left.severity] - priority[right.severity] || left.title.localeCompare(right.title),
  );
}

export function calculateCoverage(project: AuditProject) {
  const total = project.submissions.length * project.rubric.length;
  const addressed = project.feedbackCoverage.filter((item) => item.addressedTags.length > 0).length;
  return total === 0 ? 0 : Math.round((addressed / total) * 100);
}
