import { describe, expect, it } from "vitest";

import analysisJson from "../../test-data/community-service-codex-analysis.json";
import submissionsJson from "../../test-data/community-service-audit-samples.json";
import { calculateCoverage, runAudit } from "@/domain/rules";
import {
  analysisResponseSchema,
  type FindingType,
} from "@/domain/schemas";
import {
  communityServicePrecomputedProject,
  communityServicePrecomputedValidation,
} from "@/fixtures/community-service-precomputed-project";

describe("Codex-precomputed community-service analysis", () => {
  it("passes the production evidence gate and produces the planted audit patterns", () => {
    const analysis = analysisResponseSchema.parse(analysisJson);
    const analysisIds = analysis.analyses.map((item) => item.submissionId);

    expect(analysis.analyses).toHaveLength(6);
    expect(new Set(analysisIds).size).toBe(6);
    expect(new Set(analysisIds)).toEqual(
      new Set(communityServicePrecomputedProject.submissions.map((submission) => submission.id)),
    );

    const originalScores = submissionsJson.map((submission) => submission.scores);
    const coverageKeys = communityServicePrecomputedProject.feedbackCoverage.map(
      (item) => `${item.submissionId}:${item.rubricDimensionId}`,
    );

    expect(communityServicePrecomputedValidation).toEqual({
      accepted: 32,
      rejected: 0,
      feedbackCoverage: 24,
    });
    expect(communityServicePrecomputedProject.signals).toHaveLength(32);
    expect(communityServicePrecomputedProject.feedbackCoverage).toHaveLength(24);
    expect(new Set(coverageKeys).size).toBe(24);
    expect(
      communityServicePrecomputedProject.signals.every((signal) =>
        communityServicePrecomputedProject.submissions
          .find((submission) => submission.id === signal.submissionId)
          ?.text.includes(signal.excerpt),
      ),
    ).toBe(true);

    const findings = runAudit(communityServicePrecomputedProject);
    const counts = findings.reduce<Partial<Record<FindingType, number>>>((result, item) => {
      result[item.type] = (result[item.type] ?? 0) + 1;
      return result;
    }, {});

    expect(findings).toHaveLength(13);
    expect(counts).toEqual({
      SIMILAR_EVIDENCE_SCORE_GAP: 1,
      SIMILAR_ISSUE_FEEDBACK_OMISSION: 2,
      SCORE_FEEDBACK_MISMATCH: 1,
      RUBRIC_DIMENSION_NOT_ADDRESSED: 9,
    });
    expect(calculateCoverage(communityServicePrecomputedProject)).toBe(63);
    expect(communityServicePrecomputedProject.submissions.map((submission) => submission.scores)).toEqual(
      originalScores,
    );

    console.info(
      "Codex precomputed audit summary",
      JSON.stringify(
        {
          submissions: communityServicePrecomputedProject.submissions.length,
          signalsAccepted: communityServicePrecomputedValidation.accepted,
          signalsRejected: communityServicePrecomputedValidation.rejected,
          feedbackCoveragePercent: calculateCoverage(communityServicePrecomputedProject),
          findings: findings.length,
          findingCounts: counts,
          findingDetails: findings.map((finding) => ({
            type: finding.type,
            severity: finding.severity,
            rubricDimensionId: finding.rubricDimensionId,
            submissionIds: finding.submissionIds,
            summary: finding.summary,
            reviewQuestion: finding.reviewQuestion,
          })),
        },
        null,
        2,
      ),
    );
  });
});
