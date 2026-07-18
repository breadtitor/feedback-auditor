import { describe, expect, it } from "vitest";

import { calculateCoverage, runAudit } from "@/domain/rules";
import { demoProject } from "@/fixtures/demo-project";

describe("deterministic audit rules", () => {
  it("produces the expected synthetic review queue", () => {
    const findings = runAudit(demoProject);

    expect(findings).toHaveLength(7);
    expect(findings.map((item) => item.type)).toContain(
      "SIMILAR_EVIDENCE_SCORE_GAP",
    );
    expect(
      findings.filter((item) => item.type === "SIMILAR_ISSUE_FEEDBACK_OMISSION"),
    ).toHaveLength(2);
    expect(findings.map((item) => item.type)).toContain("SCORE_FEEDBACK_MISMATCH");
    expect(
      findings.filter((item) => item.type === "RUBRIC_DIMENSION_NOT_ADDRESSED"),
    ).toHaveLength(3);
  });

  it("keeps every finding traceable to an existing excerpt", () => {
    const findings = runAudit(demoProject);
    const signals = new Map(demoProject.signals.map((signal) => [signal.id, signal]));
    const submissions = new Map(
      demoProject.submissions.map((submission) => [submission.id, submission]),
    );

    for (const finding of findings) {
      expect(finding.evidenceSignalIds.length).toBeGreaterThan(0);
      for (const signalId of finding.evidenceSignalIds) {
        const signal = signals.get(signalId);
        expect(signal, `missing signal ${signalId}`).toBeDefined();
        const submission = submissions.get(signal!.submissionId);
        expect(submission, `missing submission ${signal!.submissionId}`).toBeDefined();
        expect(submission!.text).toContain(signal!.excerpt);
      }
    }
  });

  it("does not claim that a teacher is wrong or unfair", () => {
    const language = JSON.stringify(runAudit(demoProject)).toLowerCase();
    expect(language).not.toContain("unfair");
    expect(language).not.toContain("teacher is wrong");
    expect(language).not.toContain("biased");
  });

  it("does not flag a score gap below the configured threshold", () => {
    const project = structuredClone(demoProject);
    project.submissions.find((item) => item.id === "student-b")!.scores.evidence = 2;
    const findings = runAudit(project);

    expect(
      findings.some((item) => item.type === "SIMILAR_EVIDENCE_SCORE_GAP"),
    ).toBe(false);
  });

  it("reports rubric feedback coverage without pretending it is a fairness score", () => {
    expect(calculateCoverage(demoProject)).toBe(88);
  });
});
