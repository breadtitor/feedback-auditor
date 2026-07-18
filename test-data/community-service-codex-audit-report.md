# Codex-precomputed audit report

Generated on 2026-07-18 from the six wholly fictional English submissions in
`community-service-audit-samples.json`.

## Provenance and boundary

- The evidence extraction was produced in the current user-selected GPT-5.6 Codex session.
- No OpenAI Platform API request was made and no API balance was consumed.
- The structured result was saved in `community-service-codex-analysis.json`.
- The saved result passed the same evidence-ingestion gate used by `POST /api/analyze`, then ran through the production R1-R4 audit rules.
- This validates the analysis contract and local audit engine. It does not claim that the public website made a live API request.

## Verification summary

| Check | Result |
|---|---:|
| Fictional submissions | 6 |
| Structured evidence signals | 32 |
| Signals accepted by the evidence gate | 32 |
| Signals rejected | 0 |
| Submission-rubric feedback coverage records | 24 / 24 |
| Rubric dimensions addressed by teacher feedback | 63% |
| Review findings generated | 13 |
| Student scores changed | 0 |

## Highest-priority review findings

1. **Student E · Organization · high priority**
   Student E received 4/4 for Organization, while two major, locatable sequence issues and the corrective teacher feedback describe a different performance level.
   Review question: Does the score reflect the same performance level described in the written feedback?

2. **Students A and B · Evidence use · high priority**
   Both submissions make a broad responsibility claim from one volunteer example at similar severity, but their Evidence use scores differ by two points.
   Review question: Would the same scoring interpretation apply to both pieces of evidence?

3. **Students A and B · Evidence use · high priority**
   Student A's feedback addresses the unsupported evidence-to-claim link; Student B's feedback does not, despite similar evidence.
   Review question: Should this issue be acknowledged consistently in both feedback records?

4. **Students C and D · Claim and reasoning · review**
   Both responses leave part of the pro-requirement counterargument underdeveloped. Student C's feedback identifies that issue; Student D's feedback does not.
   Review question: Should this issue be acknowledged consistently in both feedback records?

## Feedback-dimension coverage findings

The remaining nine findings are neutral prompts asking whether one evidence-linked note would make a scored rubric dimension clearer:

| Student | Rubric dimension | Priority |
|---|---|---|
| B | Evidence use | Review |
| A | Organization | Low |
| A | Language clarity | Low |
| B | Language clarity | Low |
| C | Organization | Low |
| C | Language clarity | Low |
| D | Organization | Low |
| E | Language clarity | Low |
| F | Language clarity | Low |

## Interpretation

These are review candidates, not declarations that a grade or teacher is wrong. The tool preserved every original score and leaves confirmation, dismissal, resolution, and any eventual grading decision to the teacher.

## Reproduce without an API call

```powershell
npm.cmd test -- tests/integration/precomputed-analysis.test.ts --disableConsoleIntercept --reporter=verbose
```
