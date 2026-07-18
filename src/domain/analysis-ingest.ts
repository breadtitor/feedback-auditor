import {
  evidenceSignalSchema,
  feedbackCoverageSchema,
  type AnalysisResponse,
  type AuditProject,
  type EvidenceSignal,
  type FeedbackCoverage,
} from "@/domain/schemas";

type AnalysisSource = EvidenceSignal["source"];

export function ingestAnalysisResponse(
  project: AuditProject,
  response: AnalysisResponse,
  source: AnalysisSource = "model",
) {
  const submissions = new Map(
    project.submissions.map((submission) => [submission.id, submission]),
  );
  const rubricIds = new Set(project.rubric.map((dimension) => dimension.id));
  const seenSignalIds = new Set<string>();
  const seenCoverageKeys = new Set<string>();
  const signals: EvidenceSignal[] = [];
  const feedbackCoverage: FeedbackCoverage[] = [];
  let totalSignals = 0;

  for (const analysis of response.analyses) {
    const analysisSubmission = submissions.get(analysis.submissionId);

    for (const signal of analysis.signals) {
      totalSignals += 1;
      const submission = submissions.get(signal.submissionId);
      if (
        !analysisSubmission ||
        signal.submissionId !== analysis.submissionId ||
        !submission ||
        !rubricIds.has(signal.rubricDimensionId) ||
        signal.excerpt.length === 0 ||
        !submission.text.includes(signal.excerpt) ||
        seenSignalIds.has(signal.id)
      ) {
        continue;
      }

      signals.push(evidenceSignalSchema.parse({ ...signal, source }));
      seenSignalIds.add(signal.id);
    }

    for (const coverage of analysis.feedbackCoverage) {
      const coverageKey = `${coverage.submissionId}:${coverage.rubricDimensionId}`;
      if (
        !analysisSubmission ||
        coverage.submissionId !== analysis.submissionId ||
        !submissions.has(coverage.submissionId) ||
        !rubricIds.has(coverage.rubricDimensionId) ||
        seenCoverageKeys.has(coverageKey)
      ) {
        continue;
      }

      feedbackCoverage.push(feedbackCoverageSchema.parse(coverage));
      seenCoverageKeys.add(coverageKey);
    }
  }

  return {
    signals,
    feedbackCoverage,
    evidenceValidation: {
      accepted: signals.length,
      rejected: totalSignals - signals.length,
    },
  };
}
