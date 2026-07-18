import {
  auditProjectSchema,
  type AuditProject,
  type FeedbackCoverage,
} from "@/domain/schemas";

const rubric = [
  {
    id: "claim",
    title: "Claim & reasoning",
    description: "States a defensible position and develops a logical line of reasoning.",
    maxPoints: 4,
  },
  {
    id: "evidence",
    title: "Evidence use",
    description: "Uses relevant evidence and explains how it supports the claim.",
    maxPoints: 4,
  },
  {
    id: "organization",
    title: "Organization",
    description: "Uses a coherent structure, purposeful paragraphs, and clear transitions.",
    maxPoints: 4,
  },
  {
    id: "clarity",
    title: "Language clarity",
    description: "Communicates ideas precisely with readable sentences and appropriate tone.",
    maxPoints: 4,
  },
] as const;

const submissions = [
  {
    id: "student-a",
    pseudonym: "Student A",
    text:
      "Schools should require one community-service project before graduation because students learn responsibility outside the classroom. Our town library depends on volunteers during its summer reading program. Last year, students helped younger children choose books and prepare activities. This shows that student volunteers can help the community. A required project would introduce every student to this kind of work. Some students already have jobs or family duties, so schools should offer several schedules and project choices. With flexible options, service can become a meaningful part of education rather than a punishment.",
    scores: { claim: 3, evidence: 3, organization: 3, clarity: 4 },
    teacherFeedback:
      "Your position is clear and the counterargument improves the reasoning. The library example is relevant, but explain how that single example proves the broader claim about responsibility. Add one sentence connecting the evidence to your conclusion.",
  },
  {
    id: "student-b",
    pseudonym: "Student B",
    text:
      "Community service should be required for graduation. A neighborhood food bank receives many donations in December, and student volunteers sort the cans into boxes. Students can work quickly when they are organized. The food bank example is proof that required service makes students more responsible citizens. Schools already require classes, so one service project is not unreasonable. Students could choose a cause that interests them and complete the work during the school year.",
    scores: { claim: 3, evidence: 1, organization: 3, clarity: 3 },
    teacherFeedback:
      "The essay has a clear beginning and stays focused. Strengthen the transition between the food-bank paragraph and the final proposal. Your final sentence gives the reader a practical next step.",
  },
  {
    id: "student-c",
    pseudonym: "Student C",
    text:
      "A service requirement can help students discover local problems, but schools should not pretend that every student has the same amount of free time. Students might tutor younger children, restore a park, or translate community information. These choices connect classroom skills to real needs. However, the requirement should include transportation and weekend options. Without those supports, the policy could punish students who already care for siblings or work after school. A flexible requirement is better than no civic learning at all.",
    scores: { claim: 3, evidence: 3, organization: 4, clarity: 4 },
    teacherFeedback:
      "Your reasoning is balanced and well organized. You acknowledge the time-access concern, but you do not fully answer the objection that any mandate can make volunteering less meaningful. Add a response to that counterargument.",
  },
  {
    id: "student-d",
    pseudonym: "Student D",
    text:
      "Schools should require community service because graduation should represent more than passing tests. Students could clean public trails, help at animal shelters, or support school events. Critics may say that required volunteering is no longer volunteering. The essay does not return to that concern. Service still gives students experience, and experience is useful for adulthood. Schools can provide a list of approved projects so that the requirement is easier to manage.",
    scores: { claim: 2, evidence: 2, organization: 3, clarity: 3 },
    teacherFeedback:
      "You offer several concrete project choices and keep the essay concise. Expand the final paragraph so the recommendation feels complete, and use a transition before the last sentence.",
  },
  {
    id: "student-e",
    pseudonym: "Student E",
    text:
      "Graduation service is a good idea. First, there are many needs in a community. The conclusion appears here before the main example, which makes the sequence difficult to follow. Students can help older neighbors learn to use online appointment systems. This work is useful. Another reason is that schools teach citizenship. The opening idea returns after the example, and the response to possible scheduling problems appears only in the final sentence. Schools can allow summer projects for busy students.",
    scores: { claim: 3, evidence: 3, organization: 4, clarity: 3 },
    teacherFeedback:
      "Your community example is useful, but the organization is hard to follow throughout. Move the example before the conclusion, group the citizenship reasoning together, and introduce the scheduling response earlier.",
  },
  {
    id: "student-f",
    pseudonym: "Student F",
    text:
      "A carefully designed service requirement can turn graduation into evidence of both academic and civic readiness. For example, students who create multilingual guides for a health clinic apply research, writing, and translation skills to an immediate community need. The value comes from connecting a specific skill to a specific audience, not from merely counting volunteer hours. Schools should therefore approve projects by learning goal and provide alternatives for students with work or caregiving obligations.",
    scores: { claim: 4, evidence: 4, organization: 4, clarity: 4 },
    teacherFeedback:
      "The claim, example, and recommendation form a coherent argument. Your explanation connects the project to the broader purpose of graduation. Consider adding a brief counterargument to make the reasoning even stronger.",
  },
] as const;

const signals = [
  {
    id: "signal-a-evidence",
    submissionId: "student-a",
    rubricDimensionId: "evidence",
    kind: "issue",
    canonicalTag: "claim_unsupported",
    severity: "major",
    excerpt: "This shows that student volunteers can help the community.",
    explanation: "The essay names a useful example but does not connect it to the broader responsibility claim.",
    confidence: 0.94,
    source: "fixture",
  },
  {
    id: "signal-b-evidence",
    submissionId: "student-b",
    rubricDimensionId: "evidence",
    kind: "issue",
    canonicalTag: "claim_unsupported",
    severity: "major",
    excerpt: "The food bank example is proof that required service makes students more responsible citizens.",
    explanation: "The conclusion is asserted without explaining how the sorting task demonstrates lasting responsibility.",
    confidence: 0.93,
    source: "fixture",
  },
  {
    id: "signal-c-claim",
    submissionId: "student-c",
    rubricDimensionId: "claim",
    kind: "issue",
    canonicalTag: "counterargument_missing_response",
    severity: "moderate",
    excerpt: "A flexible requirement is better than no civic learning at all.",
    explanation: "The essay acknowledges access concerns but does not answer whether mandatory service undermines meaning.",
    confidence: 0.89,
    source: "fixture",
  },
  {
    id: "signal-d-claim",
    submissionId: "student-d",
    rubricDimensionId: "claim",
    kind: "issue",
    canonicalTag: "counterargument_missing_response",
    severity: "moderate",
    excerpt: "Critics may say that required volunteering is no longer volunteering. The essay does not return to that concern.",
    explanation: "A relevant counterargument is introduced but never answered.",
    confidence: 0.98,
    source: "fixture",
  },
  {
    id: "signal-e-organization",
    submissionId: "student-e",
    rubricDimensionId: "organization",
    kind: "issue",
    canonicalTag: "sequence_hard_to_follow",
    severity: "major",
    excerpt: "The conclusion appears here before the main example, which makes the sequence difficult to follow.",
    explanation: "The essay deliberately demonstrates a sequence that separates claims, examples, and responses.",
    confidence: 0.99,
    source: "fixture",
  },
  {
    id: "signal-f-clarity",
    submissionId: "student-f",
    rubricDimensionId: "clarity",
    kind: "strength",
    canonicalTag: "language_precise",
    severity: "minor",
    excerpt: "The value comes from connecting a specific skill to a specific audience, not from merely counting volunteer hours.",
    explanation: "The contrast is concise, specific, and easy to follow.",
    confidence: 0.96,
    source: "fixture",
  },
  {
    id: "signal-a-claim",
    submissionId: "student-a",
    rubricDimensionId: "claim",
    kind: "strength",
    canonicalTag: "counterargument_addressed",
    severity: "minor",
    excerpt: "With flexible options, service can become a meaningful part of education rather than a punishment.",
    explanation: "The conclusion responds to the access concern with a concrete condition.",
    confidence: 0.91,
    source: "fixture",
  },
  {
    id: "signal-f-evidence",
    submissionId: "student-f",
    rubricDimensionId: "evidence",
    kind: "strength",
    canonicalTag: "evidence_integrated",
    severity: "minor",
    excerpt: "students who create multilingual guides for a health clinic apply research, writing, and translation skills to an immediate community need",
    explanation: "The example names an audience, task, and relevant academic skills.",
    confidence: 0.95,
    source: "fixture",
  },
] as const;

const feedbackCoverage: FeedbackCoverage[] = submissions.flatMap((submission) =>
  rubric.map((dimension) => ({
    submissionId: submission.id,
    rubricDimensionId: dimension.id,
    addressedTags: ["general_feedback"],
    stance: "neutral" as const,
    hasActionableNextStep: true,
  })),
);

function replaceCoverage(
  submissionId: string,
  rubricDimensionId: string,
  addressedTags: string[],
  stance: "positive" | "corrective" | "mixed" | "neutral" | "unclear",
  hasActionableNextStep: boolean,
) {
  const item = feedbackCoverage.find(
    (coverage) =>
      coverage.submissionId === submissionId &&
      coverage.rubricDimensionId === rubricDimensionId,
  );
  if (!item) throw new Error("Demo fixture coverage entry is missing");
  item.addressedTags = addressedTags;
  item.stance = stance;
  item.hasActionableNextStep = hasActionableNextStep;
}

replaceCoverage("student-a", "evidence", ["claim_unsupported"], "corrective", true);
replaceCoverage("student-b", "evidence", [], "neutral", false);
replaceCoverage("student-c", "claim", ["counterargument_missing_response"], "corrective", true);
replaceCoverage("student-d", "claim", [], "neutral", false);
replaceCoverage("student-e", "organization", ["sequence_hard_to_follow"], "corrective", true);
replaceCoverage("student-f", "clarity", [], "positive", false);

export const demoProject: AuditProject = auditProjectSchema.parse({
  id: "demo-argumentative-writing",
  title: "Civic readiness argument",
  subject: "English Language Arts",
  gradeBand: "Grade 10",
  assignmentPrompt:
    "Should schools require one community-service project before graduation? Write a concise argument with a defensible claim, relevant evidence, a counterargument, and a practical recommendation.",
  learningObjectives: [
    "Develop a defensible claim",
    "Integrate and explain relevant evidence",
    "Address a counterargument",
    "Organize an argument for a real audience",
  ],
  rubric,
  submissions,
  signals,
  feedbackCoverage,
  datasetLabel: "Synthetic calibration pack · v1.0",
  synthetic: true,
});
