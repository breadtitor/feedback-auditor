# Community Service Audit Test Pack

All records in this pack are fictional and were written specifically for testing Feedback Auditor. They contain no real student data.

## Setup fields

- **Audit title:** Community Service Requirement Calibration
- **Subject:** English Language Arts
- **Grade band:** Grade 10
- **Assignment prompt:** Should high schools require every student to complete 20 hours of community service before graduation? Write an argumentative response using evidence, address a counterargument, and propose an implementation plan.
- **Learning objectives:**
  - State a defensible claim.
  - Select and explain relevant evidence.
  - Address a counterargument.
  - Organize ideas clearly.

Keep the four default rubric dimensions and paste `community-service-audit-samples.json` into **Submission JSON**.

## Planted review patterns

These patterns are deliberately present so the live extraction and deterministic rules have useful cases to inspect:

| Students | Intended pattern | Likely rule |
|---|---|---|
| A and B | Both use a single volunteer example to support a broad responsibility claim, but receive Evidence Use scores of 3/4 and 1/4. | R1 |
| A and B | A's feedback questions the evidence-to-claim link; B's feedback does not mention the same issue. | R2 |
| C and D | Both raise the pro-requirement counterargument. C's feedback asks for a direct response; D's feedback does not address the counterargument. | R2 |
| E | Organization is scored 4/4 even though the response sequence and corrective teacher feedback describe a major organization problem. | R3 |
| F | The response contains clear, controlled language, but the feedback focuses on claim, evidence, and implementation rather than clarity. | R4 candidate |

## Expected interpretation

Live GPT extraction is probabilistic, so canonical tags and the exact finding count can vary. The important checks are:

1. every displayed excerpt must exist verbatim in the corresponding submission;
2. the system should present neutral review questions rather than declare a score wrong;
3. no grade should change automatically;
4. the teacher should be able to confirm, resolve, or dismiss each finding;
5. the exported review should omit the full submission texts.

For a fixed seven-finding regression check, use the built-in synthetic demo instead; its evidence signals are pre-authored and deterministic.
