# Feedback Auditor

An evidence-first calibration workspace that helps teachers find potential drift in scores and written feedback across the same assignment—without changing a grade or making a fairness judgment.

Built for the **OpenAI Build Week Education track**. The repository contains synthetic student work only.

## Why this exists

Teachers often grade a class over several sessions. Even with a shared rubric, similar evidence can receive meaningfully different scores or different levels of feedback coverage. Most AI education tools try to grade students or write feedback. Feedback Auditor audits the feedback that already exists.

The product separates two responsibilities:

1. **GPT-5.6 extracts structured, source-linked evidence signals.**
2. **Versioned TypeScript rules decide which cross-submission patterns deserve human review.**

The teacher remains the decision-maker. Every finding is a review question with the original excerpt, score, feedback, rule ID, and confidence—not an accusation or an automated correction.

## Judge quick start

No account or API key is required for the complete synthetic demo.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then:

1. Select **Try the synthetic demo**.
2. Open any finding to compare highlighted evidence, rubric scores, and existing feedback.
3. Add a note and choose **Confirm for review**, **Mark resolved**, or **Dismiss signal**.
4. Filter by status or rubric dimension.
5. Open **Submissions** and **Methodology**.
6. Select **Export review** for a teacher-readable Markdown decision log.

The demo contains six synthetic Grade 10 submissions and seven expected findings across four rule types.

## Create a custom audit

Select **Create an audit** on the home page. The guided setup supports:

- editable assignment context and learning objectives;
- editable rubric dimensions and maximum scores;
- JSON import/paste for anonymous student work, scores, and existing feedback;
- a required privacy and authorization checkpoint;
- local draft review before any network analysis.

The **Load format template** action creates two editable records with the exact schema expected by the app. Custom draft data stays in the browser until the teacher explicitly starts Live Analysis.

## GPT-5.6 integration

Live Analysis is implemented with the OpenAI JavaScript SDK, the Responses API, and Structured Outputs in [`src/app/api/analyze/route.ts`](src/app/api/analyze/route.ts).

```text
anonymous work + rubric
        ↓
GPT-5.6 structured evidence extraction
        ↓
verbatim excerpt validation
        ↓
deterministic TypeScript audit rules
        ↓
teacher review and decision log
```

Key implementation choices:

- model: `gpt-5.6` by default, configurable with `OPENAI_MODEL`;
- `responses.parse` with a Zod-backed Structured Outputs contract;
- `store: false` and server-side API key handling;
- low reasoning effort for constrained extraction rather than open-ended grading;
- exact excerpt verification against the submitted source text;
- invalid submission IDs, rubric IDs, or non-verbatim excerpts are discarded;
- provider errors are sanitized before reaching the browser;
- the deterministic demo remains fully usable if Live Analysis is unavailable.

Configure Live Analysis locally:

```bash
copy .env.example .env.local
```

Then set `OPENAI_API_KEY` in `.env.local` and restart the server. Never expose the key through a `NEXT_PUBLIC_` variable.

## Deterministic review rules

| Rule | Review pattern | Visible condition |
|---|---|---|
| R1 | Similar evidence, different scores | Same canonical issue and comparable severity; score gap is at least 35% of the dimension maximum |
| R2 | Similar issue, uneven feedback coverage | Moderate/major issue addressed for one comparable submission but not another |
| R3 | Score-feedback mismatch | Score level appears to communicate a different performance level from feedback and source evidence |
| R4 | Rubric dimension not addressed | A dimension has a score and locatable evidence but no dimension-linked feedback |

Rules return neutral review questions. They do not infer protected characteristics, label a teacher as biased, or determine which score is correct.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run eval
npm run build
npm audit --omit=dev
```

Current synthetic evaluation contract:

- 7 total findings;
- all 4 P0 rule types represented;
- 100% of demo findings linked to existing source excerpts;
- 88% rubric feedback coverage in the fixture;
- no automatic grade changes.

See [`docs/EVALUATION.md`](docs/EVALUATION.md) for the rubric-aligned test matrix and [`docs/JUDGE_TEST_GUIDE.md`](docs/JUDGE_TEST_GUIDE.md) for a three-minute product test.

## How Codex was used

Codex was used as the implementation partner for this repository:

- translated the product and judging requirements into the architecture and Definition of Done;
- scaffolded the Next.js/TypeScript application;
- implemented and refactored the deterministic rules, GPT-5.6 route, guided setup, review UI, export, and privacy boundaries;
- created synthetic fixtures and automated tests;
- ran type, lint, unit, integration, production-build, dependency, and browser smoke checks;
- iterated on responsive UI issues discovered during real browser verification;
- drafted documentation and demo materials for author review.

The human entrant remains responsible for the product direction, final project name, final Devpost description, video narration, and submission.

## Safety and privacy boundaries

- Synthetic data is the default and the only student data committed to Git.
- The setup explicitly asks teachers to remove direct identifiers.
- Custom drafts remain local until Live Analysis is started.
- The API key exists only on the server.
- The API route does not log student text.
- Export includes findings and decisions, not complete student submissions or internal model fields.
- The app never writes grades back to a school system.

This prototype is for teacher calibration and demonstration. A production deployment would require institutional privacy, retention, access-control, and human-oversight review.

## Project structure

```text
src/
  app/                    Next.js UI and server route
  components/             landing, setup, audit workspace
  domain/                 schemas and deterministic rules
  fixtures/               synthetic public demo dataset
  lib/openai/             versioned GPT-5.6 analysis prompt
tests/
  rules/                  reproducible synthetic evaluation
  integration/            API boundary tests
docs/
  PROJECT_DESIGN.md       product and technical design record
  EVALUATION.md           judging-rubric evidence matrix
  JUDGE_TEST_GUIDE.md     evaluator walkthrough
  DEMO_SCRIPT.md          sub-three-minute video plan
```

## Documentation references

- [GPT-5.6 prompting guidance](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.6#prompting-best-practices)
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Responses API migration guide](https://developers.openai.com/api/docs/guides/migrate-to-responses)

## License

MIT. See [`LICENSE`](LICENSE).
