# Evaluation Plan

This document maps product evidence to the OpenAI Build Week judging rubric and defines the repeatable synthetic evaluation.

## Reproduce the evidence

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run eval
npm run build
npm audit --omit=dev
```

Expected result: all commands pass, the evaluation reports seven findings, and all four P0 rule types are represented.

## Stage 1 viability gate

| Requirement | Evidence |
|---|---|
| Working project | One-click synthetic demo and guided custom-audit setup |
| OpenAI tool use | Server-side GPT-5.6 Responses API integration with Structured Outputs |
| Education track fit | Teacher calibration workflow for rubric scoring and feedback consistency |
| Public test path | No login, no API key, synthetic dataset, deterministic findings |
| Repository quality | Setup, sample data, tests, architecture, safety boundaries, Codex/GPT-5.6 documentation |

## Stage 2 rubric matrix

### Technological Implementation

- Zod schemas define projects, evidence signals, feedback coverage, and findings.
- GPT-5.6 returns constrained evidence signals through `responses.parse`.
- Every model excerpt is verified verbatim against the associated submission.
- Four deterministic, versioned TypeScript rules produce the review queue.
- Live failure does not corrupt or disable the deterministic demo.
- Teacher decisions persist locally and export to Markdown.
- Unit, boundary, build, browser, and dependency checks cover the critical path.

### Design

- The landing page explains the value before exposing controls.
- The judge path has one obvious primary action and no authentication.
- Evidence, score, feedback, confidence, and rule provenance appear in one detail panel.
- Neutral language and explicit product boundaries preserve teacher agency.
- The guided input flow includes a privacy checkpoint before custom records enter the workspace.
- Responsive behavior supports desktop, narrow laptop, and mobile layouts.

### Potential Impact

- Helps teachers catch inconsistent application of the same rubric before feedback reaches students.
- Targets an existing high-frequency workflow rather than creating a separate grading task.
- Decision logs can support department calibration and professional reflection.
- The architecture can later extend to LMS imports while retaining the same human-review boundary.

Impact is a product hypothesis in this prototype; no unsupported learning-outcome claim is made.

### Quality of Idea

- Audits completed feedback instead of replacing teacher judgment with automated grading.
- Separates probabilistic evidence extraction from deterministic comparison rules.
- Makes each signal falsifiable through source excerpts and visible thresholds.
- Treats uncertainty as a review question rather than a fairness verdict.

## Synthetic fixture contract

| Check | Expected |
|---|---:|
| Submissions | 6 |
| Rubric dimensions | 4 |
| Findings | 7 |
| R1 findings | 1 |
| R2 findings | 2 |
| R3 findings | 1 |
| R4 findings | 3 |
| Feedback coverage | 88% |
| Automated grade changes | 0 |

Every finding must reference at least one signal whose excerpt exists in the associated synthetic submission.

## Adversarial and boundary checks

- R1 does not fire below its configured score-gap threshold.
- Malformed Live Analysis projects are rejected before a model call.
- Missing API configuration returns a safe `503` response.
- Model signals with unknown IDs or non-verbatim excerpts are discarded.
- Findings do not claim that a teacher is wrong, unfair, or biased.
- The export omits complete student texts and internal model payloads.

## Manual browser smoke

The verified browser path covers:

1. landing page and one-click demo;
2. seven-item review queue;
3. highlighted source evidence and existing feedback;
4. teacher note plus confirmed decision;
5. local decision persistence after reload;
6. status filter;
7. anonymous submissions and methodology views;
8. Markdown export trigger;
9. missing-key Live Analysis fallback;
10. custom setup, template loading, privacy confirmation, creation, and editing;
11. console free of warnings and errors.
